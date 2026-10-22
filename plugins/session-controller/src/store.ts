import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { SessionInfo } from "./types.ts";
export class SessionMetadata {
  private readonly db: Database;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new Database(path, { create: true, strict: true });
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, target_id TEXT NOT NULL, metadata TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS inbox (request_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, message_id TEXT NOT NULL, text TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('pending','admitted')));`);
  }
  putSession(value: SessionInfo): void {
    this.db
      .query(
        "INSERT INTO sessions VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET metadata=excluded.metadata",
      )
      .run(value.id, value.targetId, JSON.stringify({ ...value, status: "unloaded" }));
  }
  session(id: string): SessionInfo | undefined {
    const row = this.db
      .query<{ metadata: string }, [string]>("SELECT metadata FROM sessions WHERE id=?")
      .get(id);
    return row ? (JSON.parse(row.metadata) as SessionInfo) : undefined;
  }
  sessions(targetId?: string): SessionInfo[] {
    const rows = targetId
      ? this.db
          .query<{ metadata: string }, [string]>("SELECT metadata FROM sessions WHERE target_id=?")
          .all(targetId)
      : this.db.query<{ metadata: string }, []>("SELECT metadata FROM sessions").all();
    return rows
      .map((row) => JSON.parse(row.metadata) as SessionInfo)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  deleteSessionMetadata(id: string): void {
    this.db.query("DELETE FROM sessions WHERE id=?").run(id);
  }
  enqueue(
    requestId: string,
    sessionId: string,
    text: string,
  ): { messageId: string; state: string } {
    const existing = this.db
      .query<{ session_id: string; message_id: string; text: string; state: string }, [string]>(
        "SELECT session_id,message_id,text,state FROM inbox WHERE request_id=?",
      )
      .get(requestId);
    if (existing) {
      if (existing.session_id !== sessionId || existing.text !== text)
        throw new Error("Request id reused for different input");
      return { messageId: existing.message_id, state: existing.state };
    }
    const messageId = crypto.randomUUID();
    this.db
      .query("INSERT INTO inbox VALUES (?, ?, ?, ?, 'pending')")
      .run(requestId, sessionId, messageId, text);
    return { messageId, state: "pending" };
  }
  admitted(requestId: string): void {
    this.db.query("UPDATE inbox SET state='admitted' WHERE request_id=?").run(requestId);
  }
  close(): void {
    this.db.close();
  }
}
