import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { SessionCard } from "./contract.ts";
interface StoredCard extends SessionCard {
  key: string;
  ownerId: string;
  handler: string;
}
export class CardStore {
  private readonly db: Database;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new Database(path, { create: true, strict: true });
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, card_key TEXT NOT NULL, state TEXT NOT NULL, payload TEXT NOT NULL, UNIQUE(session_id, card_key));`);
    for (const row of this.db
      .query<{ payload: string }, []>("SELECT payload FROM cards WHERE state='running'")
      .all())
      this.putCard({
        ...JSON.parse(row.payload),
        state: "interrupted",
        error: "Host restarted; this action was not replayed.",
      });
  }
  card(id: string): StoredCard | undefined {
    const row = this.db
      .query<{ payload: string }, [string]>("SELECT payload FROM cards WHERE id=?")
      .get(id);
    return row ? JSON.parse(row.payload) : undefined;
  }
  cards(sessionId: string): StoredCard[] {
    return this.db
      .query<{ payload: string }, [string]>(
        "SELECT payload FROM cards WHERE session_id=? ORDER BY rowid",
      )
      .all(sessionId)
      .map((row) => JSON.parse(row.payload));
  }
  putCard(value: StoredCard, expectedState?: string): boolean {
    if (expectedState)
      return (
        this.db
          .query("UPDATE cards SET state=?,payload=? WHERE id=? AND state=?")
          .run(value.state, JSON.stringify(value), value.id, expectedState).changes === 1
      );
    this.db
      .query(
        "INSERT INTO cards VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload",
      )
      .run(
        value.id,
        value.sessionId,
        JSON.stringify([value.ownerId, value.key]),
        value.state,
        JSON.stringify(value),
      );
    return true;
  }
  close() {
    this.db.close();
  }
}
