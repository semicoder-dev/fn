import { Database } from "bun:sqlite";
import { chmod, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  agentSession,
  agentEvent,
  agentEventData,
  type AgentSession,
  type AgentEvent,
  type AgentEventData,
  type AgentEventPage,
} from "@semicoder/fn-sdk/agent";

/** One SQLite transaction commits facts and their session projection together. */
export class AgentJournal {
  private db!: Database;
  constructor(private directory: string) {}
  async open() {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const path = join(this.directory, "agents.sqlite");
    this.db = new Database(path, { create: true });
    await chmod(path, 0o600);
    this.db.exec("PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL;");
    const version = this.db.query("PRAGMA user_version").get() as { user_version: number };
    if (![0, 1].includes(version.user_version)) throw new Error("Agent 会话格式不受当前版本支持");
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, plugin TEXT NOT NULL, json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (session TEXT NOT NULL, seq INTEGER NOT NULL, json TEXT NOT NULL, PRIMARY KEY(session, seq)); PRAGMA user_version=1;",
    );
  }
  list(pluginId?: string): AgentSession[] {
    const rows =
      pluginId === undefined
        ? this.db.query("SELECT json FROM sessions").all()
        : this.db.query("SELECT json FROM sessions WHERE plugin=?").all(pluginId);
    return (rows as { json: string }[])
      .map((row) => agentSession.parse(JSON.parse(row.json)))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  get(pluginId: string, id: string): AgentSession {
    const row = this.db
      .query("SELECT json FROM sessions WHERE id=? AND plugin=?")
      .get(id, pluginId) as { json: string } | null;
    if (!row) throw new Error("Agent 会话不存在");
    return agentSession.parse(JSON.parse(row.json));
  }
  commit(session: AgentSession, data: AgentEventData[]): AgentSession {
    const updated = structuredClone(session);
    const events = data.map((item) => {
      const event: AgentEvent = {
        ...agentEventData.parse(item),
        sessionId: session.id,
        seq: ++updated.seq,
        time: Date.now(),
      };
      const json = JSON.stringify(event);
      if (Buffer.byteLength(json) > 192 * 1024) throw new Error("单条 Agent 事件超过 192 KiB");
      return { event, json };
    });
    updated.updatedAt = Date.now();
    updated.revision++;
    agentSession.parse(updated);
    this.db.transaction(() => {
      for (const { event, json } of events)
        this.db.query("INSERT INTO events VALUES (?, ?, ?)").run(session.id, event.seq, json);
      this.db
        .query(
          "INSERT INTO sessions VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
        )
        .run(updated.id, updated.pluginId, JSON.stringify(updated));
    })();
    return updated;
  }
  events(pluginId: string, id: string, after = 0): AgentEventPage {
    const session = this.get(pluginId, id);
    const rows = this.db
      .query("SELECT json FROM events WHERE session=? AND seq>? ORDER BY seq LIMIT 100")
      .all(id, after) as { json: string }[];
    const events: AgentEvent[] = [];
    let bytes = 0;
    for (const row of rows) {
      if (bytes + Buffer.byteLength(row.json) > 256 * 1024) break;
      events.push(agentEvent.parse(JSON.parse(row.json)));
      bytes += Buffer.byteLength(row.json);
    }
    const next = events.at(-1)?.seq ?? after;
    return { events, next, hasMore: next < session.seq };
  }
  all(pluginId: string, id: string): AgentEvent[] {
    let after = 0;
    const events: AgentEvent[] = [];
    do {
      const page = this.events(pluginId, id, after);
      events.push(...page.events);
      if (!page.hasMore) return events;
      after = page.next;
    } while (true);
  }
  close() {
    this.db?.close();
  }
  remove(pluginId: string, id: string) {
    this.get(pluginId, id);
    this.db.transaction(() => {
      this.db.query("DELETE FROM events WHERE session=?").run(id);
      this.db.query("DELETE FROM sessions WHERE id=? AND plugin=?").run(id, pluginId);
    })();
  }
}
