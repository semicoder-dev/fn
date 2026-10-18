import { createHash, randomUUID } from "node:crypto";
import {
  messageSchema,
  messageRecordType,
  parseRecord,
  recordIdentity,
  requestStateSchema,
  deliverySchema,
  validateResponse,
  type ChatMessage,
  type ChatRequest,
  type RecordType,
  type RecordValue,
  type JSONValue,
} from "../../shared/chat/protocol";
import { ChatStore, type CloudRecord, type OutboxEntry } from "./store";
export interface ChatTransport {
  read(id: string): Promise<CloudRecord | undefined>;
  commit(records: CloudRecord[]): Promise<CloudRecord[]>;
  changes(
    token?: string,
  ): Promise<{ records: CloudRecord[]; deletedIDs: string[]; token: string; moreComing: boolean }>;
}
export function cloudRecord(
  type: RecordType,
  value: RecordValue,
  previous?: CloudRecord,
): CloudRecord {
  const payload = JSON.stringify(value),
    valid = parseRecord(type, payload);
  return {
    id: recordIdentity(type, valid),
    type,
    fields: { payload },
    ...(previous?.systemFields ? { systemFields: previous.systemFields } : {}),
  };
}
export function errorReason(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return;
  const v = error as { reason?: string; details?: { reason?: string } };
  return v.details?.reason ?? v.reason;
}
export function canonical(value: JSONValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  return (
    "{" +
    Object.keys(value)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + canonical(value[k]!))
      .join(",") +
    "}"
  );
}
export function digest(value: JSONValue) {
  return createHash("sha256").update(canonical(value)).digest("hex");
}
class RejectedIntent extends Error {}
export type Intent =
  | { kind: "create"; records: CloudRecord[] }
  | { kind: "record"; record: CloudRecord }
  | { kind: "respond"; requestId: string; requestDigest: string; message: ChatMessage }
  | { kind: "cancel"; requestId: string; requestDigest: string };
export class ChatEngine {
  private syncing?: Promise<void>;
  private stopped = false;
  constructor(
    readonly store: ChatStore,
    readonly transport: ChatTransport,
    private changed: () => void = () => {},
    private now = Date.now,
  ) {}
  stop() {
    this.stopped = true;
  }
  private active() {
    if (this.stopped) throw new Error("聊天账号已切换");
  }
  messages(): ChatMessage[] {
    return this.store
      .list()
      .filter((r) => ["FnChatUserMessage", "FnChatBotMessage", "FnChatResponse"].includes(r.type))
      .map((r) => messageSchema.parse(JSON.parse(r.payload)))
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
  }
  state(id: string) {
    const r = this.store.get("state:" + id);
    return r ? requestStateSchema.parse(JSON.parse(r.payload)) : undefined;
  }
  delivery(id: string) {
    const r = this.store.get("delivery:" + id);
    return r ? deliverySchema.parse(JSON.parse(r.payload)) : undefined;
  }
  async expireRequests(hostId: string) {
    for (const request of this.messages()) {
      if (
        request.kind !== "request" ||
        request.hostId !== hostId ||
        request.expiresAt > this.now() ||
        this.state(request.id)?.phase !== "pending"
      )
        continue;
      const previous = await this.read("state:" + request.id);
      if (!previous) continue;
      const state = requestStateSchema.parse(JSON.parse(previous.fields.payload!));
      if (state.phase !== "pending") continue;
      try {
        await this.commit("", [
          cloudRecord(
            "FnChatRequestState",
            { ...state, phase: "expired", revision: state.revision + 1, updatedAt: this.now() },
            previous,
          ),
        ]);
      } catch (error) {
        if (errorReason(error) !== "serverRecordChanged") throw error;
      }
    }
  }
  create(input: ChatMessage) {
    this.active();
    const m = messageSchema.parse(input);
    const records = [cloudRecord(messageRecordType(m), m)];
    if (m.kind === "request")
      records.push(
        cloudRecord("FnChatRequestState", {
          protocolVersion: 2,
          requestId: m.id,
          revision: 0,
          phase: "pending",
          updatedAt: this.now(),
        }),
      );
    this.store.enqueue(m.id, "create", { kind: "create", records } satisfies Intent, records);
    this.changed();
    return m;
  }
  cancel(request: ChatRequest) {
    this.active();
    this.store.enqueue(randomUUID(), "cancel", {
      kind: "cancel",
      requestId: request.id,
      requestDigest: digest(request),
    } satisfies Intent);
    this.changed();
  }
  queueRecord(record: CloudRecord) {
    this.active();
    this.store.enqueue(randomUUID(), "record", { kind: "record", record } satisfies Intent, [
      record,
    ]);
    this.changed();
  }
  async sync() {
    this.active();
    if (this.syncing) return this.syncing;
    this.syncing = this.performSync().finally(() => {
      this.syncing = undefined;
    });
    return this.syncing;
  }
  private async pull() {
    let token = this.store.meta("cursor"),
      reset = false;
    const records = new Map<string, CloudRecord>(),
      deleted = new Set<string>();
    while (true) {
      this.active();
      let page;
      try {
        page = await this.transport.changes(token);
      } catch (e) {
        if (!reset && errorReason(e) === "changeTokenExpired") {
          reset = true;
          token = undefined;
          records.clear();
          deleted.clear();
          continue;
        }
        throw e;
      }
      this.active();
      for (const r of page.records) {
        records.set(r.id, r);
        deleted.delete(r.id);
      }
      for (const id of page.deletedIDs) {
        records.delete(id);
        deleted.add(id);
      }
      token = page.token;
      if (!page.moreComing) break;
    }
    this.store.apply([...records.values()], [...deleted], token!, reset);
  }
  private async performSync() {
    await this.pull();
    for (const entry of this.store.pending()) {
      this.active();
      try {
        await this.submit(entry);
      } catch (e) {
        if (e instanceof RejectedIntent) this.store.fail(entry.id, e.message);
        else if (errorReason(e) !== "serverRecordChanged") throw e;
      }
    }
    await this.pull();
    this.changed();
  }
  private async read(id: string) {
    const r = await this.transport.read(id);
    this.active();
    return r;
  }
  private async commit(id: string, records: CloudRecord[]) {
    const saved = await this.transport.commit(records);
    this.active();
    this.store.acknowledge(id, saved);
  }
  private async submit(entry: OutboxEntry) {
    const intent = JSON.parse(entry.payload) as Intent;
    if (intent.kind === "create") {
      const existing = await this.read(intent.records[0]!.id);
      if (existing) {
        if (
          canonical(JSON.parse(existing.fields.payload!)) !==
          canonical(JSON.parse(intent.records[0]!.fields.payload!))
        )
          throw new RejectedIntent("消息 ID 冲突");
        this.store.acknowledge(entry.id, [existing]);
        return;
      }
      await this.commit(entry.id, intent.records);
      return;
    }
    if (intent.kind === "record") {
      const previous = await this.read(intent.record.id);
      await this.commit(entry.id, [{ ...intent.record, systemFields: previous?.systemFields }]);
      return;
    }
    const rr = await this.read("message:" + intent.requestId),
      sr = await this.read("state:" + intent.requestId);
    if (!rr || !sr) throw new RejectedIntent("请求不存在");
    const req = messageSchema.parse(JSON.parse(rr.fields.payload!)),
      state = requestStateSchema.parse(JSON.parse(sr.fields.payload!));
    if (req.kind !== "request" || digest(req) !== intent.requestDigest)
      throw new RejectedIntent("请求内容已改变");
    if (intent.kind === "respond" && state.responseId === intent.message.id) {
      const response = await this.read("message:" + intent.message.id);
      if (!response) throw new Error("回复状态不完整");
      this.store.acknowledge(entry.id, [sr, response]);
      return;
    }
    if (intent.kind === "cancel" && state.phase === "cancelled") {
      this.store.acknowledge(entry.id, [sr]);
      return;
    }
    if (state.phase !== "pending" || (intent.kind === "respond" && req.expiresAt <= this.now()))
      throw new RejectedIntent("请求已结束或已过期");
    const next = {
      ...state,
      revision: state.revision + 1,
      updatedAt: this.now(),
      phase: intent.kind === "respond" ? ("responded" as const) : ("cancelled" as const),
      ...(intent.kind === "respond" ? { responseId: intent.message.id } : {}),
    };
    if (intent.kind === "respond") {
      const m = intent.message;
      if (
        m.kind !== "response" ||
        m.requestId !== req.id ||
        m.conversationId !== req.conversationId ||
        m.botVersion !== req.botVersion
      )
        throw new RejectedIntent("回复归属无效");
      try {
        validateResponse(req.card, m.actionId, m.values);
      } catch (e) {
        throw new RejectedIntent(String(e));
      }
      const bot = await this.read("bot:" + req.hostId + ":" + req.pluginId);
      const info = bot && parseRecord(bot.type, bot.fields.payload!);
      if (!info || !("enabled" in info) || !info.enabled || info.version !== req.botVersion)
        throw new RejectedIntent("目标插件已停用或版本变化");
      await this.commit(entry.id, [
        cloudRecord("FnChatRequestState", next, sr),
        cloudRecord("FnChatResponse", m),
      ]);
    } else await this.commit(entry.id, [cloudRecord("FnChatRequestState", next, sr)]);
  }
}
