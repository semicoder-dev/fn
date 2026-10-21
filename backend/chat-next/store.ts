import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { cloudRecord, parseRecord, type CloudRecord, type RecordType, type SessionCommand } from "./protocol.ts";

/** Account-scoped carrier data. Canonical Session history stays in the runtime's sessions.sqlite. */
export class SessionChatStore {
  readonly database: Database;
  readonly deviceId: string;
  constructor(readonly path: string) {
    this.database = new Database(path, { create: true, strict: true });
    this.database.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,type TEXT NOT NULL,payload TEXT NOT NULL,system_fields TEXT);
      CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY,record TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS commands(id TEXT PRIMARY KEY,payload TEXT NOT NULL,status TEXT NOT NULL,result TEXT);
      CREATE TABLE IF NOT EXISTS unsupported(id TEXT PRIMARY KEY,error TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY);
      CREATE INDEX IF NOT EXISTS record_types ON records(type);`);
    if (path !== ":memory:") chmodSync(path, 0o600);
    this.deviceId = this.meta("deviceId") ?? crypto.randomUUID();
    this.setMeta("deviceId", this.deviceId);
    const abandoned = this.database.query("SELECT payload FROM commands WHERE status='running'").all() as { payload: string }[];
    for (const row of abandoned) this.finish(JSON.parse(row.payload), "interrupted", undefined, "Host restarted before the command outcome was recorded; the command was not replayed.");
  }
  static open(root: string, environment: string, container: string, account: string) {
    const key = createHash("sha256").update(JSON.stringify([environment, container, account])).digest("hex");
    const directory = join(root, "chat-v3", key);
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    return new SessionChatStore(join(directory, "chat.sqlite"));
  }
  meta(key: string): string | undefined {
    return (this.database.query("SELECT value FROM meta WHERE key=?").get(key) as { value: string } | null)?.value;
  }
  setMeta(key: string, value: string) { this.database.query("INSERT OR REPLACE INTO meta VALUES (?,?)").run(key, value); }
  get(id: string): CloudRecord | undefined {
    const row = this.database.query("SELECT id,type,payload,system_fields FROM records WHERE id=?").get(id) as { id: string; type: string; payload: string; system_fields: string | null } | null;
    return row ? { id: row.id, type: row.type, fields: { payload: row.payload }, ...(row.system_fields ? { systemFields: row.system_fields } : {}) } : undefined;
  }
  list(type: RecordType): CloudRecord[] {
    return (this.database.query("SELECT id FROM records WHERE type=? ORDER BY id").all(type) as { id: string }[]).map(row => this.get(row.id)!);
  }
  private put(record: CloudRecord) {
    parseRecord(record);
    if (record.type === "FnSessionCommand") {
      const previous = this.get(record.id);
      if (previous && previous.fields.payload !== record.fields.payload) throw new Error("An immutable command changed");
    }
    this.database.query("INSERT OR REPLACE INTO records VALUES (?,?,?,?)").run(record.id, record.type, record.fields.payload!, record.systemFields ?? null);
  }
  ingest(records: CloudRecord[], deleted: string[], token: string, reset = false) {
    this.database.transaction(() => {
      if (reset) this.database.query("DELETE FROM records").run();
      for (const record of records) {
        try { this.put(record); this.database.query("DELETE FROM unsupported WHERE id=?").run(record.id); }
        catch (error) { this.database.query("INSERT OR REPLACE INTO unsupported VALUES (?,?)").run(record.id, String(error)); }
      }
      for (const id of deleted) this.database.query("DELETE FROM records WHERE id=?").run(id);
      this.setMeta("cursor", token);
    })();
  }
  queue(record: CloudRecord) {
    parseRecord(record);
    const current = this.get(record.id);
    if (current?.fields.payload === record.fields.payload && !this.database.query("SELECT id FROM outbox WHERE id=?").get(record.id)) return;
    this.database.query("INSERT OR REPLACE INTO outbox VALUES (?,?)").run(record.id, JSON.stringify(record));
  }
  pending(): CloudRecord[] {
    return (this.database.query("SELECT record FROM outbox ORDER BY id").all() as { record: string }[]).map(row => JSON.parse(row.record));
  }
  acknowledge(sent: CloudRecord, saved: CloudRecord) {
    this.database.transaction(() => {
      this.put(saved);
      this.database.query("DELETE FROM outbox WHERE id=? AND record=?").run(sent.id, JSON.stringify(sent));
    })();
  }
  claim(command: SessionCommand): boolean {
    const payload = JSON.stringify(command);
    const existing = this.database.query("SELECT payload FROM commands WHERE id=?").get(command.id) as { payload: string } | null;
    if (existing) {
      if (existing.payload !== payload) throw new Error("Command id reused with different content");
      return false;
    }
    this.database.query("INSERT INTO commands VALUES (?,?,'running',NULL)").run(command.id, payload);
    return true;
  }
  ownsSession(id: string): boolean { return !!this.database.query("SELECT id FROM sessions WHERE id=?").get(id); }
  ownSession(id: string) { this.database.query("INSERT OR IGNORE INTO sessions VALUES (?)").run(id); }
  sessionIds(): string[] { return (this.database.query("SELECT id FROM sessions").all() as { id: string }[]).map(row => row.id); }
  finish(command: SessionCommand, status: "completed" | "failed" | "interrupted", sessionId?: string, error?: string) {
    const record = cloudRecord("FnSessionResult", {
      protocolVersion: 3, id: command.id, hostId: command.hostId, status, updatedAt: Date.now(),
      ...(sessionId ? { sessionId } : {}), ...(error ? { error: error.slice(0, 4096) } : {}),
    });
    this.database.transaction(() => {
      this.database.query("UPDATE commands SET status=?,result=? WHERE id=?").run(status, JSON.stringify(record), command.id);
      this.queue(record);
    })();
  }
  failures(): string[] {
    return (this.database.query("SELECT error FROM unsupported LIMIT 20").all() as { error: string }[]).map(row => row.error);
  }
  close() { this.database.close(); }
}
