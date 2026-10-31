import { Database } from "bun:sqlite";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import type { BackendNativeClient } from "@semicoder/fia/backend";
import { FnError, type RelayMessage } from "@semicoder/fn-sdk/types";
const incoming = z.object({
  id: z.string().uuid(),
  hostId: z.string().uuid(),
  instanceId: z.string().max(120),
  conversationId: z.string().max(160),
  text: z.string().min(1).max(20000),
  locale: z.enum(["zh-CN", "en"]),
  createdAt: z.number().finite(),
});
/** Final replies are split into bounded records; streaming tokens never enter CloudKit. */
export function replyChunks(text: string) {
  const result: string[] = [];
  let chunk = "",
    size = 0;
  for (const char of text) {
    const bytes = Buffer.byteLength(JSON.stringify(char)) - 2;
    if (size + bytes > 48000) {
      result.push(chunk);
      chunk = "";
      size = 0;
    }
    chunk += char;
    size += bytes;
  }
  if (chunk) result.push(chunk);
  return result;
}
export class RelayStore {
  db: Database;
  constructor(path: string) {
    this.db = new Database(path, { create: true });
    this.db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, payload TEXT NOT NULL, dirty INTEGER NOT NULL DEFAULT 1); CREATE TABLE IF NOT EXISTS cloud(id TEXT PRIMARY KEY,payload TEXT NOT NULL); CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL)",
    );
    for (const item of this.list().filter((m) => m.status === "processing"))
      this.set({ ...item, status: "interrupted" });
  }
  list(): RelayMessage[] {
    return (
      this.db.query("SELECT payload FROM messages ORDER BY rowid").all() as {
        payload: string;
      }[]
    ).map((v) => JSON.parse(v.payload));
  }
  get(id: string): RelayMessage | undefined {
    const row = this.db
      .query("SELECT payload FROM messages WHERE id=?")
      .get(id) as { payload: string } | null;
    return row ? JSON.parse(row.payload) : undefined;
  }
  receive(raw: unknown, hostId: string) {
    const input = incoming.parse(raw);
    if (input.hostId !== hostId) return;
    const existing = this.get(input.id);
    if (existing) {
      if (
        existing.text !== input.text ||
        existing.instanceId !== input.instanceId ||
        existing.conversationId !== input.conversationId ||
        existing.locale !== input.locale ||
        existing.createdAt !== input.createdAt
      )
        throw new FnError("message_conflict", "Message identity reused");
      return;
    }
    this.set({ ...input, status: "waiting" });
  }
  set(message: RelayMessage) {
    this.db
      .query(
        "INSERT INTO messages(id,payload,dirty) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,dirty=1",
      )
      .run(message.id, JSON.stringify(message));
  }
  claim(instanceId: string) {
    return this.db.transaction(() => {
      const item = this.list().find(
        (m) => m.instanceId === instanceId && m.status === "waiting",
      );
      if (!item) return;
      item.status = "processing";
      this.set(item);
      return item;
    })();
  }
  reply(instanceId: string, id: string, text: string) {
    if (!text || text.length > 200000)
      throw new FnError("invalid_reply", "Invalid reply");
    const message = this.get(id);
    if (!message || message.instanceId !== instanceId)
      throw new FnError("not_found", "Message not found");
    if (message.status === "completed" && message.reply === text) return;
    if (message.status !== "processing")
      throw new FnError("message_state", "Message is not processing");
    this.set({ ...message, status: "completed", reply: text });
  }
  interrupt(instanceId: string) {
    for (const message of this.list().filter(
      (m) => m.instanceId === instanceId && m.status === "processing",
    ))
      this.set({ ...message, status: "interrupted" });
  }
  metadata(key: string, value?: string) {
    if (value !== undefined)
      this.db
        .query(
          "INSERT INTO metadata VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .run(key, value);
    return (
      this.db.query("SELECT value FROM metadata WHERE key=?").get(key) as {
        value: string;
      } | null
    )?.value;
  }
  close() {
    this.db.close();
  }
}
export class Relay {
  store?: RelayStore;
  error?: string;
  connected = false;
  private scope?: { container: string; accountKey: string; zone: string };
  private timer?: ReturnType<typeof setInterval>;
  private syncing = false;
  private closing = false;
  constructor(
    readonly root: string,
    readonly hostId: string,
    readonly native: BackendNativeClient,
    readonly environment: "development" | "production",
    readonly describe: () => unknown,
    readonly changed: () => void,
  ) {}
  async connect() {
    this.closing = false;
    if (this.syncing)
      throw new FnError("busy", "Phone synchronization is still running");
    const container = "iCloud.com.semicoder.fn." + this.environment;
    const account = await this.native.cloudKit.account({ container });
    if (!account.accountKey)
      throw new FnError(
        "icloud_unavailable",
        "Sign in to iCloud to connect your phone",
      );
    if (this.scope?.accountKey !== account.accountKey) {
      this.store?.close();
      const folder = resolve(
        this.root,
        "relay",
        new Bun.CryptoHasher("sha256")
          .update(account.accountKey)
          .digest("hex")
          .slice(0, 24),
      );
      await mkdir(folder, { recursive: true, mode: 0o700 });
      this.store = new RelayStore(resolve(folder, "messages.sqlite"));
    }
    this.scope = {
      container,
      accountKey: account.accountKey,
      zone: "fn-app-relay-" + this.environment,
    };
    await this.native.cloudKit.ensureZone(this.scope);
    await this.native.cloudKit.subscribeZone({
      scope: this.scope,
      id: "fn-relay-" + this.hostId,
    });
    this.connected = true;
    this.error = undefined;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      void this.sync();
    }, 5000);
    await this.sync();
    this.changed();
  }
  async sync() {
    if (this.syncing || !this.connected || !this.scope || !this.store) return;
    this.syncing = true;
    const scope = this.scope,
      store = this.store;
    const current = () =>
      this.connected &&
      !this.closing &&
      this.scope === scope &&
      this.store === store;
    try {
      const account = await this.native.cloudKit.account({
        container: scope.container,
      });
      if (account.accountKey !== scope.accountKey) {
        this.disconnect();
        this.closing = true;
        throw new Error("iCloud account changed; reconnect");
      }
      let more = true;
      while (more) {
        if (!current()) return;
        let page;
        try {
          page = await this.native.cloudKit.changes({
            scope,
            token: store.metadata("token"),
          });
        } catch (error) {
          if ((error as any)?.details?.reason === "changeTokenExpired") {
            store.db.exec(
              "DELETE FROM metadata WHERE key='token'; DELETE FROM cloud",
            );
            continue;
          }
          throw error;
        }
        if (!current()) return;
        store.db.transaction(() => {
          for (const record of page.records) {
            store.db
              .query(
                "INSERT INTO cloud VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
              )
              .run(record.id, JSON.stringify(record));
            if (record.type === "FnRelayRequest")
              store.receive(
                JSON.parse(record.fields.payload ?? "null"),
                this.hostId,
              );
          }
          for (const id of page.deletedIDs)
            store.db.query("DELETE FROM cloud WHERE id=?").run(id);
          store.metadata("token", page.token);
        })();
        more = page.moreComing;
      }
      const outgoing: {
        id: string;
        type: string;
        fields: { payload: string };
        message?: { id: string; payload: string };
      }[] = [
        {
          id: "host-" + this.hostId,
          type: "FnRelayHost",
          fields: { payload: JSON.stringify(this.describe()) },
        },
      ];
      const dirty = store.db
        .query("SELECT payload FROM messages WHERE dirty=1 LIMIT 40")
        .all() as { payload: string }[];
      for (const row of dirty) {
        const message: RelayMessage = JSON.parse(row.payload);
        const parts = message.reply ? replyChunks(message.reply) : [];
        for (const [index, text] of parts.entries())
          outgoing.push({
            id: `reply-${message.id}-${index}`,
            type: "FnRelayReply",
            fields: {
              payload: JSON.stringify({
                messageId: message.id,
                hostId: message.hostId,
                index,
                text,
              }),
            },
          });
        outgoing.push({
          id: "status-" + message.id,
          type: "FnRelayStatus",
          fields: {
            payload: JSON.stringify({
              ...message,
              text: "",
              reply: undefined,
              replyParts: parts.length,
            }),
          },
          message: { id: message.id, payload: row.payload },
        });
      }
      for (const record of outgoing) {
        if (!current()) return;
        const cached = store.db
          .query("SELECT payload FROM cloud WHERE id=?")
          .get(record.id) as { payload: string } | null;
        const previous = cached ? JSON.parse(cached.payload) : undefined;
        let saved;
        let fields = previous?.systemFields;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            [saved] = await this.native.cloudKit.commit({
              scope,
              records: [
                {
                  id: record.id,
                  type: record.type,
                  fields: record.fields,
                  ...(fields ? { systemFields: fields } : {}),
                },
              ],
              deletedIDs: [],
            });
            break;
          } catch (error) {
            if (
              (error as any)?.details?.reason !== "serverRecordChanged" ||
              attempt === 2
            )
              throw error;
            const remote = await this.native.cloudKit.read({
              scope,
              id: record.id,
            });
            if (remote.type !== record.type)
              throw new Error("Cloud record identity mismatch");
            if (remote.fields.payload === record.fields.payload) {
              saved = remote;
              break;
            }
            fields = remote.systemFields;
          }
        }
        if (!current()) return;
        if (!saved) throw new Error("Missing CloudKit acknowledgement");
        store.db.transaction(() => {
          store.db
            .query(
              "INSERT INTO cloud VALUES(?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",
            )
            .run(record.id, JSON.stringify(saved));
          if (record.type === "FnRelayStatus")
            store.db
              .query("UPDATE messages SET dirty=0 WHERE id=? AND payload=?")
              .run(record.message!.id, record.message!.payload);
        })();
      }
      this.error = undefined;
      this.changed();
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
      this.changed();
    } finally {
      this.syncing = false;
      if (this.closing) {
        this.store?.close();
        this.store = undefined;
      }
    }
  }
  disconnect() {
    this.connected = false;
    clearInterval(this.timer);
    this.scope = undefined;
    this.changed();
  }
  close() {
    this.disconnect();
    this.closing = true;
    if (!this.syncing) {
      this.store?.close();
      this.store = undefined;
    }
  }
}
