import { Database } from "bun:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, isAbsolute } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import {
  Session,
  SessionLogOffset,
  type SessionEvent,
  type SessionHeader,
  type SessionId,
} from "@deepseek-ai/dsh-session";
import {
  SessionPersistence,
  SessionPersistenceRevision,
  SessionAlreadyExistsError,
  SessionAlreadyOwnedError,
  SessionFormatUnsupportedError,
  SessionHandleClosedError,
  SessionOwnershipLostError,
  SessionPersistenceCorruptionError,
  SessionPersistenceNotFoundError,
  SessionReadOnlyError,
  assertContiguous,
  assertStoredId,
  assertVersion,
  materializeAppendBatch,
  materializeCreateHeader,
  validateStoredEvents,
  type SessionAccess,
  type SessionHandle,
  type SessionHandleAppendOptions,
  type SessionHandleFlushOptions,
  type SessionHandleReadOptions,
  type SessionHandleReadResult,
  type SessionPersistenceCreateOptions,
  type SessionPersistenceOpenOptions,
  type SessionPersistenceStatOptions,
  type SessionPersistenceListOptions,
  type SessionPersistenceSnapshot,
} from "@deepseek-ai/dsh-session-persistence";

export interface SqliteSessionPersistenceOptions {
  /** Stable data path, normally <dataDirectory>/runtime/state.sqlite. */
  path: string;
  /** Maximum intentional delay for live event batching. Defaults to 50 ms. */
  batchDelayMs?: number;
}

interface StoredRow {
  id: string;
  header: string;
  inherited: number;
  event_count: number;
  revision: string;
}

interface PendingSession {
  header: SessionHeader;
  inherited: SessionLogOffset;
  revision: string;
}

interface OwnerRow {
  token: string;
  pid: number;
}

const eventEnvelopeKeys = new Set(["type", "seq", "time", "data", "surfaceOp", "sourceEventSeqs", "ignorable"]);

// Shared across duplicate module instances in this process. A crash leaves the
// durable claim behind; a dead PID can be reclaimed in the next transaction.
const ownersKey = Symbol.for("@semicoder/fn-runtime/sqlite-session-owners");
const activeOwners: Set<string> = Reflect.get(globalThis, ownersKey) ?? new Set<string>();
Reflect.set(globalThis, ownersKey, activeOwners);

function errorOf(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function ownerIsAlive(owner: OwnerRow): boolean {
  if (owner.pid === process.pid) return activeOwners.has(owner.token);
  try {
    process.kill(owner.pid, 0);
    return true;
  } catch (error) {
    // EPERM is an existing process whose identity this process cannot inspect.
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}

function inheritedCut(header: SessionHeader, value?: SessionLogOffset): SessionLogOffset {
  if (header.isSeeded && value === undefined) {
    throw new TypeError("seeded session header requires an inherited event count");
  }
  const cut = SessionLogOffset(value ?? 0);
  if (!header.isSeeded && cut !== 0) {
    throw new TypeError("unseeded session header inherited event count must be 0");
  }
  return cut;
}

function validatedHeader(header: SessionHeader): SessionHeader {
  const snapshot = materializeCreateHeader(header);
  if (typeof snapshot.id !== "string" || snapshot.id.length === 0) {
    throw new TypeError("session id must be a non-empty string");
  }
  assertVersion(snapshot);
  // The public detached Session constructor owns header validation. An empty
  // synthetic seed validates metadata without interpreting the stored body.
  return Session.create(snapshot.id, [], snapshot, SessionLogOffset(0)).header;
}

/**
 * dsh's unmodified SessionPersistence seam backed by Bun SQLite. Canonical
 * headers/events remain upstream JSON; this layer owns only storage and routing.
 */
export class SqliteSessionPersistence extends SessionPersistence {
  readonly path: string;
  readonly batchDelayMs: number;
  private readonly db: Database;
  private readonly pending = new Map<SessionId, PendingSession>();
  private readonly writers = new Map<SessionId, SqliteSessionHandle>();
  private readonly handles = new Set<SqliteSessionHandle>();
  private readonly finalDrains = new Set<Promise<void>>();
  private readonly finalDrainErrors: Error[] = [];
  private readonly unsubscribe: Array<() => void> = [];
  private closing: Promise<void> | undefined;
  private databaseClosed = false;

  constructor(ctx: Context, options: SqliteSessionPersistenceOptions) {
    super(ctx);
    if (options.path !== ":memory:" && !isAbsolute(options.path)) {
      throw new TypeError("SQLite session persistence requires an absolute path");
    }
    this.path = options.path;
    this.batchDelayMs = options.batchDelayMs ?? 50;
    if (!Number.isSafeInteger(this.batchDelayMs) || this.batchDelayMs < 0 || this.batchDelayMs > 2_147_483_647) {
      throw new TypeError("batchDelayMs must be a non-negative timer-safe integer");
    }
    if (this.path !== ":memory:") mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    this.db = new Database(this.path, { create: true, strict: true });
    try {
      if (this.path !== ":memory:") chmodSync(this.path, 0o600);
      this.db.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;");
      const version = this.db.query<{ user_version: number }, []>("PRAGMA user_version").get()?.user_version;
      if (version !== 0 && version !== 1) throw new Error(`unsupported fn session database schema ${version}`);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS fn_sessions (
          id TEXT PRIMARY KEY, header TEXT NOT NULL, inherited INTEGER NOT NULL CHECK(inherited >= 0),
          event_count INTEGER NOT NULL CHECK(event_count >= 0), revision TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS fn_session_events (
          session_id TEXT NOT NULL REFERENCES fn_sessions(id), seq INTEGER NOT NULL CHECK(seq >= 0),
          event TEXT NOT NULL, PRIMARY KEY(session_id, seq)
        );
        CREATE TABLE IF NOT EXISTS fn_session_owners (
          session_id TEXT PRIMARY KEY, token TEXT NOT NULL, pid INTEGER NOT NULL
        );
        PRAGMA user_version = 1;
      `);
    } catch (error) {
      this.db.close();
      throw error;
    }
    this.unsubscribe.push(
      ctx.on("session/event", (session, event) => {
        this.writers.get(session.id)?.enqueueLive(event);
      }),
      ctx.on("session/flush", (session) => this.writers.get(session.id)?.flush()),
      ctx.on("session/disposed", (session) => {
        const writer = this.writers.get(session.id);
        if (writer === undefined) return;
        const work = writer.close();
        this.finalDrains.add(work);
        void work.catch((error: unknown) => {
          this.finalDrainErrors.push(errorOf(error));
          ctx.logger.warn(`session-persistence: final drain for session "${session.id}" failed: ${String(error)}`);
        }).finally(() => this.finalDrains.delete(work));
      }),
    );
    ctx.effect(() => () => this.close(), "sqlite session persistence");
  }

  override async create(header: SessionHeader, options?: SessionPersistenceCreateOptions): Promise<SessionHandle> {
    this.assertAccepting();
    options?.signal?.throwIfAborted();
    const meta = validatedHeader(header);
    const inherited = inheritedCut(meta, options?.inheritedEventCount);
    if (this.pending.has(meta.id) || this.storedRow(meta.id) !== null) throw new SessionAlreadyExistsError(meta.id);
    const token = this.claim(meta.id, true);
    this.pending.set(meta.id, { header: meta, inherited, revision: crypto.randomUUID() });
    return this.adopt(new SqliteSessionHandle(this, meta, inherited, "write", 0, token));
  }

  override async open(id: SessionId, access: SessionAccess, options?: SessionPersistenceOpenOptions): Promise<SessionHandle> {
    this.assertAccepting();
    options?.signal?.throwIfAborted();
    if (access !== "read" && access !== "write") throw new TypeError("session access must be read or write");
    if (access === "write" && this.writers.has(id)) throw new SessionAlreadyOwnedError(id);
    const pending = this.pending.get(id);
    if (pending !== undefined) return this.adopt(new SqliteSessionHandle(this, pending.header, pending.inherited, "read", 0));
    let token: string | undefined;
    try {
      if (this.storedRow(id) === null) throw new SessionPersistenceNotFoundError(id);
      if (access === "write") token = this.claim(id, false);
      const stored = this.readStored(id);
      return this.adopt(new SqliteSessionHandle(this, stored.header, stored.inherited, access, stored.events.length, token));
    } catch (error) {
      if (token !== undefined) this.releaseClaim(id, token);
      throw error;
    }
  }

  override async stat(id: SessionId, options?: SessionPersistenceStatOptions): Promise<SessionPersistenceSnapshot | undefined> {
    this.assertAccepting();
    options?.signal?.throwIfAborted();
    const row = this.storedRow(id);
    if (row !== null) return this.snapshot(row);
    const pending = this.pending.get(id);
    return pending === undefined ? undefined : {
      header: structuredClone(pending.header),
      formatStatus: "current",
      revision: SessionPersistenceRevision(pending.revision),
      eventCount: 0,
    };
  }

  override async list(options?: SessionPersistenceListOptions): Promise<readonly SessionPersistenceSnapshot[]> {
    this.assertAccepting();
    options?.signal?.throwIfAborted();
    const rows = this.db.query<StoredRow, []>("SELECT * FROM fn_sessions ORDER BY id").all();
    const result = rows.map(row => this.snapshot(row));
    const stored = new Set(rows.map(row => row.id));
    for (const [id, pending] of this.pending) {
      if (!stored.has(id)) result.push({
        header: structuredClone(pending.header),
        formatStatus: "current",
        revision: SessionPersistenceRevision(pending.revision),
        eventCount: 0,
      });
    }
    return result;
  }

  override async flush(): Promise<void> {
    this.assertAccepting();
    const failures: unknown[] = [];
    for (const writer of [...this.writers.values()]) {
      try {
        await writer.flush();
      } catch (error) {
        if (error instanceof SessionHandleClosedError) {
          try { await writer.close(); } catch (closeError) { failures.push(closeError); }
        } else failures.push(error);
      }
    }
    if (failures.length > 0) throw new AggregateError(failures, "SQLite session persistence flush failed");
  }

  /** Close admission, drain all handles, then release the database connection. */
  close(): Promise<void> {
    if (this.closing !== undefined) return this.closing;
    // Establish the closing state before an effect disposer can reenter.
    const done = Promise.withResolvers<void>();
    this.closing = done.promise;
    void this.shutdown().then(done.resolve, done.reject);
    return done.promise;
  }

  private async shutdown(): Promise<void> {
    for (const stop of this.unsubscribe.splice(0)) stop();
    const failures: Error[] = [];
    for (const handle of [...this.handles]) {
      try { await handle.close(); } catch (error) { failures.push(errorOf(error)); }
    }
    await Promise.allSettled([...this.finalDrains]);
    failures.push(...this.finalDrainErrors);
    try { this.db.close(); } catch (error) { failures.push(errorOf(error)); }
    this.databaseClosed = true;
    if (failures.length > 0) throw new AggregateError([...new Set(failures)], "SQLite session persistence close failed");
  }

  private assertAccepting(): void {
    if (this.closing !== undefined) throw new Error("SQLite session persistence is closed");
  }

  private storedRow(id: SessionId): StoredRow | null {
    return this.db.query<StoredRow, [string]>("SELECT * FROM fn_sessions WHERE id = ?").get(id);
  }

  private decodeHeader(row: StoredRow): SessionHeader {
    try {
      const raw: unknown = JSON.parse(row.header);
      if (raw === null || typeof raw !== "object") throw new TypeError("stored header must be an object");
      assertVersion(raw as SessionHeader, { kind: "sqlite", path: this.path });
      const header = validatedHeader(raw as SessionHeader);
      assertStoredId(row.id as SessionId, header);
      inheritedCut(header, SessionLogOffset(row.inherited));
      return header;
    } catch (error) {
      if (error instanceof SessionFormatUnsupportedError) throw error;
      throw new SessionPersistenceCorruptionError(`stored session "${row.id}" has invalid metadata`, { cause: error });
    }
  }

  private snapshot(row: StoredRow): SessionPersistenceSnapshot {
    return {
      header: structuredClone(this.decodeHeader(row)),
      formatStatus: "current",
      revision: SessionPersistenceRevision(row.revision),
      eventCount: row.event_count,
    };
  }

  /** Validate the complete committed prefix before serving any slice. */
  readStored(id: SessionId): { header: SessionHeader; inherited: SessionLogOffset; events: SessionEvent[] } {
    if (this.databaseClosed) throw new Error("SQLite session database is closed");
    // A read transaction fixes the header count and body to the same WAL snapshot.
    return this.db.transaction(() => {
      const row = this.storedRow(id);
      if (row === null) {
        const pending = this.pending.get(id);
        if (pending === undefined) throw new SessionPersistenceNotFoundError(id);
        return { header: pending.header, inherited: pending.inherited, events: [] };
      }
      const header = this.decodeHeader(row);
      const rows = this.db.query<{ seq: number; event: string }, [string]>(
        "SELECT seq, event FROM fn_session_events WHERE session_id = ? ORDER BY seq",
      ).all(id);
      let events: SessionEvent[];
      try {
        events = rows.map((entry, index) => {
          const value: unknown = JSON.parse(entry.event);
          if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid event envelope");
          const event = value as Record<string, unknown>;
          if (typeof event.type !== "string" || !Number.isSafeInteger(event.time)
            || !Object.hasOwn(event, "data") || (event.ignorable !== undefined && event.ignorable !== true)
            || Object.keys(event).some(key => !eventEnvelopeKeys.has(key))) throw new Error("invalid event envelope");
          if (entry.seq !== index || event.seq !== entry.seq) throw new Error(`stored event sequence mismatch at ${index}`);
          return value as SessionEvent;
        });
        if (events.length !== row.event_count) throw new Error("stored event count does not match the committed prefix");
        assertContiguous(id, events, 0);
      } catch (error) {
        throw new SessionPersistenceCorruptionError(`stored session "${id}" is corrupt`, { cause: error });
      }
      validateStoredEvents(header, events, { kind: "sqlite", path: this.path });
      return { header, inherited: SessionLogOffset(row.inherited), events };
    }).deferred();
  }

  private claim(id: SessionId, creating: boolean): string {
    const token = crypto.randomUUID();
    this.db.transaction(() => {
      if (creating && this.storedRow(id) !== null) throw new SessionAlreadyExistsError(id);
      const owner = this.db.query<OwnerRow, [string]>("SELECT token, pid FROM fn_session_owners WHERE session_id = ?").get(id);
      if (owner !== null && ownerIsAlive(owner)) {
        throw creating ? new SessionAlreadyExistsError(id) : new SessionAlreadyOwnedError(id);
      }
      this.db.query("INSERT OR REPLACE INTO fn_session_owners(session_id, token, pid) VALUES (?, ?, ?)").run(id, token, process.pid);
    }).immediate();
    activeOwners.add(token);
    return token;
  }

  private releaseClaim(id: SessionId, token: string): void {
    try {
      this.db.query("DELETE FROM fn_session_owners WHERE session_id = ? AND token = ?").run(id, token);
    } finally {
      activeOwners.delete(token);
    }
  }

  private adopt(handle: SqliteSessionHandle): SqliteSessionHandle {
    this.handles.add(handle);
    if (handle.access === "write") this.writers.set(handle.id, handle);
    return handle;
  }

  /**
   * Storage primitive used by the serialized handle chain. One FULL-synchronous
   * WAL commit publishes header, batch and revision together, including an empty
   * flush. It deliberately preserves unknown event vocabulary until read time.
   */
  async persistBatch(handle: SqliteSessionHandle, events: readonly SessionEvent[]): Promise<void> {
    this.db.transaction(() => {
      const owner = this.db.query<OwnerRow, [string]>("SELECT token, pid FROM fn_session_owners WHERE session_id = ?").get(handle.id);
      if (owner?.token !== handle.token) throw new SessionOwnershipLostError(handle.id);
      const row = this.storedRow(handle.id);
      const cursor = row?.event_count ?? 0;
      assertContiguous(handle.id, events, cursor);
      if (row === null) {
        this.db.query("INSERT INTO fn_sessions(id, header, inherited, event_count, revision) VALUES (?, ?, ?, 0, ?)")
          .run(handle.id, JSON.stringify(handle.header), handle.inheritedEventCount, crypto.randomUUID());
      }
      const insert = this.db.query("INSERT INTO fn_session_events(session_id, seq, event) VALUES (?, ?, ?)");
      for (const event of events) insert.run(handle.id, event.seq, JSON.stringify(event));
      if (events.length > 0) {
        this.db.query("UPDATE fn_sessions SET event_count = ?, revision = ? WHERE id = ?")
          .run(cursor + events.length, crypto.randomUUID(), handle.id);
      }
    }).immediate();
    this.pending.delete(handle.id);
  }

  release(handle: SqliteSessionHandle): void {
    this.handles.delete(handle);
    if (handle.access !== "write") return;
    this.writers.delete(handle.id);
    this.pending.delete(handle.id);
    if (handle.token !== undefined) this.releaseClaim(handle.id, handle.token);
  }

  reportBackgroundFailure(id: SessionId, error: unknown): void {
    this.ctx.logger.warn(`session-persistence: background write for session "${id}" failed (buffered events retained): ${String(error)}`);
  }
}

class SqliteSessionHandle implements SessionHandle {
  readonly id: SessionId;
  private chain: Promise<unknown> = Promise.resolve();
  private closing: Promise<void> | undefined;
  private buffered: SessionEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | undefined;
  private paused = false;
  private observedLength: number;

  constructor(
    private readonly storage: SqliteSessionPersistence,
    readonly header: SessionHeader,
    readonly inheritedEventCount: SessionLogOffset,
    readonly access: SessionAccess,
    cursor: number,
    readonly token?: string,
  ) {
    this.id = header.id;
    this.observedLength = cursor;
  }

  async read(offset = 0, length = Number.MAX_SAFE_INTEGER, options?: SessionHandleReadOptions): Promise<SessionHandleReadResult> {
    this.assertOpen("read");
    for (const [name, value] of [["offset", offset], ["length", length]] as const) {
      if (!Number.isSafeInteger(value) || value < 0) throw new TypeError(`read ${name} must be a non-negative safe integer`);
    }
    options?.signal?.throwIfAborted();
    const { events } = this.storage.readStored(this.id);
    if (events.length < this.observedLength) throw new Error(`session "${this.id}": stored log shrank below a previously observed prefix`);
    this.observedLength = events.length;
    return { eventState: "detached", events: events.slice(offset, offset + length) };
  }

  async append(events: readonly SessionEvent[], options?: SessionHandleAppendOptions): Promise<void> {
    this.assertOpen("append");
    this.assertWritable("append");
    const batch = materializeAppendBatch(events);
    return this.enqueue(async () => {
      options?.signal?.throwIfAborted();
      await this.drainBuffered();
      if (batch.length > 0) await this.storage.persistBatch(this, batch);
    });
  }

  async flush(options?: SessionHandleFlushOptions): Promise<void> {
    this.assertOpen("flush");
    this.assertWritable("flush");
    return this.enqueue(async () => {
      options?.signal?.throwIfAborted();
      await this.drainBuffered();
      await this.storage.persistBatch(this, []);
    });
  }

  close(): Promise<void> {
    if (this.closing !== undefined) return this.closing;
    const done = Promise.withResolvers<void>();
    this.closing = done.promise;
    this.clearTimer();
    const work = this.enqueue(async () => {
      let failure: Error | undefined;
      try {
        do { await this.drainBuffered(); } while (this.buffered.length > 0);
      } catch (error) { failure = errorOf(error); }
      try { this.storage.release(this); } catch (error) {
        if (failure !== undefined) throw new AggregateError([failure, errorOf(error)], `session "${this.id}": close failed`);
        throw error;
      }
      if (failure !== undefined) throw failure;
    });
    void work.then(done.resolve, done.reject);
    return done.promise;
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this.close();
  }

  enqueueLive(event: SessionEvent): void {
    // Session events are already validated and frozen, but this queue takes its
    // own JSON snapshot before yielding to any asynchronous storage operation.
    this.buffered.push(...materializeAppendBatch([event]));
    if (this.timer !== undefined || this.paused || this.closing !== undefined) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.enqueue(() => this.drainBuffered()).catch(error => this.storage.reportBackgroundFailure(this.id, error));
    }, this.storage.batchDelayMs);
    this.timer.unref?.();
  }

  private async drainBuffered(): Promise<void> {
    this.clearTimer();
    this.paused = false;
    while (this.buffered.length > 0) {
      const batch = this.buffered.splice(0);
      try {
        await this.storage.persistBatch(this, batch);
      } catch (error) {
        this.buffered.unshift(...batch);
        this.paused = true;
        this.clearTimer();
        throw error;
      }
    }
  }

  private clearTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    const work = this.chain.then(operation);
    this.chain = work.catch(() => {});
    return work;
  }

  private assertOpen(operation: string): void {
    if (this.closing !== undefined) throw new SessionHandleClosedError(this.id, operation);
  }

  private assertWritable(operation: string): void {
    if (this.access !== "write") throw new SessionReadOnlyError(this.id, operation);
  }
}

export default SqliteSessionPersistence;
