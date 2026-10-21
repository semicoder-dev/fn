import type { SessionCard } from "./card-contract.ts";
export interface StoredCard extends SessionCard { key: string; appId: string; handler: string; }
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { ApplicationKv, Json, SessionInfo } from "./types.ts";
import { checkedKvValue } from "./limits.ts";

/** Product metadata only. Canonical agent messages live in SessionPersistence. */
export class RuntimeStore {
  private readonly db: Database;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new Database(path, { create: true, strict: true });
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = FULL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY, app_id TEXT NOT NULL, metadata TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS kv (
        app_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
        PRIMARY KEY (app_id, key)
      );
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY, session_id TEXT NOT NULL, card_key TEXT NOT NULL, state TEXT NOT NULL, payload TEXT NOT NULL,
        UNIQUE(session_id, card_key)
      );
      CREATE TABLE IF NOT EXISTS inbox (
        request_id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
        message_id TEXT NOT NULL, text TEXT NOT NULL,
        state TEXT NOT NULL CHECK (state IN ('pending', 'admitted'))
      );
    `);
    for (const row of this.db.query<{ payload: string }, []>("SELECT payload FROM cards WHERE state='running'").all()) {
      this.putCard({ ...JSON.parse(row.payload), state: "interrupted", error: "Host restarted; this action was not replayed." });
    }
  }
  card(id: string): StoredCard | undefined {
    const row = this.db.query<{ payload: string }, [string]>("SELECT payload FROM cards WHERE id=?").get(id);
    return row ? JSON.parse(row.payload) : undefined;
  }
  cards(sessionId: string): StoredCard[] {
    return this.db.query<{ payload: string }, [string]>("SELECT payload FROM cards WHERE session_id=? ORDER BY rowid").all(sessionId).map(row => JSON.parse(row.payload));
  }
  putCard(value: StoredCard, expectedState?: string): boolean {
    if (expectedState) return this.db.query("UPDATE cards SET state=?,payload=? WHERE id=? AND state=?")
      .run(value.state, JSON.stringify(value), value.id, expectedState).changes === 1;
    this.db.query("INSERT INTO cards VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload")
      .run(value.id, value.sessionId, value.key, value.state, JSON.stringify(value));
    return true;
  }
  putSession(value: SessionInfo): void {
    this.db.query("INSERT INTO sessions VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET metadata=excluded.metadata")
      .run(value.id, value.appId, JSON.stringify({ ...value, status: "unloaded" }));
  }
  session(id: string): SessionInfo | undefined {
    const row = this.db.query<{ metadata: string }, [string]>("SELECT metadata FROM sessions WHERE id=?").get(id);
    return row ? JSON.parse(row.metadata) as SessionInfo : undefined;
  }
  sessions(appId?: string): SessionInfo[] {
    const rows = appId
      ? this.db.query<{ metadata: string }, [string]>("SELECT metadata FROM sessions WHERE app_id=?").all(appId)
      : this.db.query<{ metadata: string }, []>("SELECT metadata FROM sessions").all();
    return rows.map(row => JSON.parse(row.metadata) as SessionInfo).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  deleteSessionMetadata(id: string): void {
    this.db.query("DELETE FROM sessions WHERE id=?").run(id);
  }
  kv(appId: string): ApplicationKv {
    return {
      get: (key) => {
        const row = this.db.query<{ value: string }, [string, string]>("SELECT value FROM kv WHERE app_id=? AND key=?").get(appId, key);
        return row ? JSON.parse(row.value) as Json : undefined;
      },
      set: (key, value) => {
        if (!key || key.length > 256) throw new Error("KV key must contain 1–256 characters");
        const serialized = JSON.stringify(checkedKvValue(value));
        this.db.query("INSERT INTO kv VALUES (?, ?, ?) ON CONFLICT(app_id,key) DO UPDATE SET value=excluded.value")
          .run(appId, key, serialized);
      },
      delete: (key) => { this.db.query("DELETE FROM kv WHERE app_id=? AND key=?").run(appId, key); },
      list: () => this.db.query<{ key: string; value: string }, [string]>("SELECT key,value FROM kv WHERE app_id=? ORDER BY key")
        .all(appId).map(row => ({ key: row.key, value: JSON.parse(row.value) as Json })),
    };
  }
  enqueue(requestId: string, sessionId: string, text: string): { messageId: string; state: string } {
    const existing = this.db.query<{ session_id: string; message_id: string; text: string; state: string }, [string]>(
      "SELECT session_id,message_id,text,state FROM inbox WHERE request_id=?",
    ).get(requestId);
    if (existing) {
      if (existing.session_id !== sessionId || existing.text !== text) throw new Error("Request id reused for different input");
      return { messageId: existing.message_id, state: existing.state };
    }
    const messageId = crypto.randomUUID();
    this.db.query("INSERT INTO inbox VALUES (?, ?, ?, ?, 'pending')").run(requestId, sessionId, messageId, text);
    return { messageId, state: "pending" };
  }
  admitted(requestId: string): void {
    this.db.query("UPDATE inbox SET state='admitted' WHERE request_id=?").run(requestId);
  }
  close(): void { this.db.close(); }
}
