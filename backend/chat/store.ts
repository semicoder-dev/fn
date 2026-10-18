import { Database } from "bun:sqlite";
import { createHash, randomUUID } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseRecord, recordIdentity, type RecordType } from "../../shared/chat/protocol";

export interface CloudRecord {
  id: string;
  type: string;
  fields: Record<string, string>;
  systemFields?: string;
}
export interface StoredRecord extends CloudRecord {
  payload: string;
}
export interface OutboxEntry {
  id: string;
  kind: string;
  payload: string;
  status: "pending" | "failed";
  error: string | null;
  createdAt: number;
}

/** One database per system iCloud account and environment. No platform.json communication state. */
export class ChatStore {
  readonly database: Database;
  readonly deviceId: string;
  constructor(readonly path: string) {
    this.database = new Database(path, { create: true, strict: true });
    if (path !== ":memory:") chmodSync(path, 0o600);
    this.database.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT NOT NULL, system_fields TEXT);
      CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', error TEXT, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS executions (request_id TEXT PRIMARY KEY, attempt_id TEXT NOT NULL, status TEXT NOT NULL, result TEXT);
      CREATE TABLE IF NOT EXISTS optimistic (outbox_id TEXT NOT NULL, record_id TEXT NOT NULL, record TEXT NOT NULL, PRIMARY KEY(outbox_id,record_id));
      CREATE TABLE IF NOT EXISTS unsupported (id TEXT PRIMARY KEY, record TEXT NOT NULL, error TEXT NOT NULL);

    `);
    this.deviceId = this.meta("deviceId") ?? randomUUID();
    this.setMeta("deviceId", this.deviceId);
    // Never replay an uncertain side effect after a process crash.
    this.database
      .query("UPDATE executions SET status = 'interrupted' WHERE status = 'running'")
      .run();
  }
  static open(root: string, namespace: string, container: string, accountKey: string) {
    const hash = createHash("sha256")
      .update(JSON.stringify([namespace, container, accountKey]))
      .digest("hex");
    const directory = join(root, "chat-v2", hash);
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    return new ChatStore(join(directory, "chat.sqlite"));
  }
  meta(key: string) {
    return (
      this.database.query("SELECT value FROM meta WHERE key = ?").get(key) as {
        value: string;
      } | null
    )?.value;
  }
  setMeta(key: string, value: string) {
    this.database
      .query("INSERT INTO meta VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
      .run(key, value);
  }
  get(id: string): StoredRecord | undefined {
    const row = this.database
      .query("SELECT id,type,payload,system_fields AS systemFields FROM records WHERE id=?")
      .get(id) as Omit<StoredRecord, "fields"> | null;
    if (!row) return undefined;
    return {
      ...row,
      fields: { payload: row.payload },
      systemFields: row.systemFields ?? undefined,
    };
  }
  list(type?: RecordType): StoredRecord[] {
    const rows = (
      type
        ? this.database
            .query("SELECT id,type,payload,system_fields AS systemFields FROM records WHERE type=?")
            .all(type)
        : this.database
            .query("SELECT id,type,payload,system_fields AS systemFields FROM records")
            .all()
    ) as Omit<StoredRecord, "fields">[];
    return rows.map((row) => ({
      ...row,
      fields: { payload: row.payload },
      systemFields: row.systemFields ?? undefined,
    }));
  }
  private put(record: CloudRecord) {
    const payload = record.fields.payload;
    if (typeof payload !== "string") throw new Error("通信记录缺少 payload");
    const value = parseRecord(record.type, payload);
    if (record.id !== recordIdentity(record.type as RecordType, value))
      throw new Error("通信记录 ID 与内容不匹配");
    this.database
      .query(
        "INSERT INTO records VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET type=excluded.type,payload=excluded.payload,system_fields=excluded.system_fields",
      )
      .run(record.id, record.type, payload, record.systemFields ?? null);
  }
  /** Validation and persistence must succeed for the whole page before cursor advancement. */
  apply(records: CloudRecord[], deletedIDs: string[], token: string, reset = false) {
    this.database.transaction(() => {
      if (reset) this.database.exec("DELETE FROM records");
      for (const record of records) {
        try {
          const value = parseRecord(record.type, record.fields.payload!);
          if (record.id !== recordIdentity(record.type as RecordType, value))
            throw new Error("通信记录 ID 与内容不匹配");
        } catch (error) {
          this.database
            .query("INSERT OR REPLACE INTO unsupported VALUES (?,?,?)")
            .run(record.id, JSON.stringify(record), String(error));
          continue;
        }
        // SQLite failures must roll back the whole transaction, including the cursor.
        this.put(record);
        this.database.query("DELETE FROM unsupported WHERE id=?").run(record.id);
      }
      for (const id of deletedIDs) {
        this.database.query("DELETE FROM records WHERE id=?").run(id);
        this.database.query("DELETE FROM unsupported WHERE id=?").run(id);
      }
      if (reset) {
        const pending = this.database
          .query(
            "SELECT record FROM optimistic JOIN outbox ON outbox.id=optimistic.outbox_id WHERE outbox.status='pending'",
          )
          .all() as { record: string }[];
        for (const row of pending) {
          const record = JSON.parse(row.record) as CloudRecord;
          if (!this.get(record.id)) this.put(record);
        }
      }
      this.setMeta("cursor", token);
      this.setMeta("hasSynced", "true");
    })();
  }
  enqueue(id: string, kind: string, payload: unknown, records: CloudRecord[] = []) {
    this.database.transaction(() => {
      if (this.database.query("SELECT 1 FROM outbox WHERE id=?").get(id)) return;
      for (const record of records) {
        this.put(record);
        this.database
          .query("INSERT INTO optimistic VALUES (?,?,?)")
          .run(id, record.id, JSON.stringify(record));
      }
      this.database
        .query("INSERT INTO outbox(id,kind,payload,created_at) VALUES (?,?,?,?)")
        .run(id, kind, JSON.stringify(payload), Date.now());
    })();
  }
  unsupported(): { id: string; error: string }[] {
    return this.database.query("SELECT id,error FROM unsupported").all() as {
      id: string;
      error: string;
    }[];
  }
  pending(): OutboxEntry[] {
    return this.database
      .query(
        "SELECT id,kind,payload,status,error,created_at AS createdAt FROM outbox WHERE status='pending' ORDER BY created_at,id",
      )
      .all() as OutboxEntry[];
  }
  updateIntent(id: string, payload: unknown) {
    this.database.query("UPDATE outbox SET payload=? WHERE id=?").run(JSON.stringify(payload), id);
  }
  failures(): { id: string; error: string }[] {
    return this.database
      .query("SELECT id,error FROM outbox WHERE status='failed' ORDER BY created_at DESC LIMIT 20")
      .all() as { id: string; error: string }[];
  }
  acknowledge(id: string, records: CloudRecord[]) {
    this.database.transaction(() => {
      for (const record of records) this.put(record);
      this.database.query("DELETE FROM outbox WHERE id=?").run(id);
      this.database.query("DELETE FROM optimistic WHERE outbox_id=?").run(id);
    })();
  }
  fail(id: string, message: string) {
    this.database.query("UPDATE outbox SET status='failed',error=? WHERE id=?").run(message, id);
  }
  claimExecution(requestId: string, attemptId: string) {
    return (
      this.database
        .query(
          "INSERT OR IGNORE INTO executions(request_id,attempt_id,status) VALUES (?,?,'running')",
        )
        .run(requestId, attemptId).changes === 1
    );
  }
  finishExecution(
    requestId: string,
    status: "completed" | "failed" | "interrupted",
    result: unknown,
  ) {
    this.database
      .query("UPDATE executions SET status=?,result=? WHERE request_id=?")
      .run(status, result === null ? null : JSON.stringify(result), requestId);
  }
  executions(): { requestId: string; attemptId: string; status: string; result: string | null }[] {
    return this.database
      .query(
        "SELECT request_id AS requestId, attempt_id AS attemptId,status,result FROM executions",
      )
      .all() as ReturnType<ChatStore["executions"]>;
  }
  close() {
    this.database.close();
  }
}
