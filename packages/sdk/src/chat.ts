import { z } from "zod";
import type { PluginContext } from "./types";

export const protocolVersion = 2;
export const maxRecordBytes = 65536;
export const defaultRequestTTL = 86_400_000;
export const idSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9_.-]+$/);
const conversation = z.string().min(1).max(210);
const time = z.number().int().nonnegative().safe();
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };
export const jsonSchema: z.ZodType<JSONValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number().finite(),
    z.string(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);
const option = z.strictObject({ id: idSchema, label: z.string().min(1).max(200) });
export const fieldSchema = z
  .strictObject({
    id: idSchema,
    label: z.string().min(1).max(200),
    type: z.enum(["text", "number", "boolean", "select", "multiSelect"]),
    required: z.boolean(),
    options: z.array(option).min(1).max(50).optional(),
    maxLength: z.number().int().min(1).max(16000).optional(),
    minimum: z.number().finite().optional(),
    maximum: z.number().finite().optional(),
  })
  .superRefine((f, ctx) => {
    if (
      ["select", "multiSelect"].includes(f.type) !== !!f.options ||
      (f.options && new Set(f.options.map((o) => o.id)).size !== f.options.length) ||
      (f.maxLength !== undefined && f.type !== "text") ||
      ((f.minimum !== undefined || f.maximum !== undefined) && f.type !== "number") ||
      (f.minimum !== undefined && f.maximum !== undefined && f.minimum > f.maximum)
    )
      ctx.addIssue({ code: "custom", message: "卡片字段约束无效" });
  });
export const cardSchema = z
  .strictObject({
    version: z.literal(1),
    template: z.enum(["approval", "choice", "form"]),
    title: z.string().min(1).max(160),
    summary: z.string().max(512),
    blocks: z
      .array(
        z.discriminatedUnion("type", [
          z.strictObject({ type: z.literal("text"), text: z.string().max(16000) }),
          z.strictObject({
            type: z.literal("fields"),
            fields: z
              .array(z.strictObject({ label: z.string().max(200), value: z.string().max(2000) }))
              .max(20),
          }),
          z.strictObject({ type: z.literal("divider") }),
        ]),
      )
      .max(30),
    inputs: z.array(fieldSchema).max(20),
    actions: z
      .array(
        z.strictObject({
          id: idSchema,
          label: z.string().min(1).max(80),
          style: z.enum(["normal", "primary", "danger"]).optional(),
        }),
      )
      .min(1)
      .max(10),
  })
  .superRefine((card, ctx) => {
    if (
      new Set(card.inputs.map((f) => f.id)).size !== card.inputs.length ||
      new Set(card.actions.map((a) => a.id)).size !== card.actions.length
    )
      ctx.addIssue({ code: "custom", message: "卡片控件 ID 重复" });
  });
export type ChatCard = z.infer<typeof cardSchema>;
export function validateResponse(
  card: ChatCard,
  actionId: string,
  values: Record<string, JSONValue>,
) {
  cardSchema.parse(card);
  if (!card.actions.some((a) => a.id === actionId)) throw new Error("卡片操作不存在");
  for (const key of Object.keys(values))
    if (!card.inputs.some((f) => f.id === key)) throw new Error("未知卡片输入");
  for (const f of card.inputs) {
    const v = values[f.id];
    if (v === undefined) {
      if (f.required) throw new Error("请填写：" + f.label);
      continue;
    }
    let valid = false;
    switch (f.type) {
      case "text":
        valid =
          typeof v === "string" &&
          (!f.required || !!v.trim()) &&
          v.length <= (f.maxLength ?? 16000);
        break;
      case "number":
        valid =
          typeof v === "number" &&
          Number.isFinite(v) &&
          (f.minimum === undefined || v >= f.minimum) &&
          (f.maximum === undefined || v <= f.maximum);
        break;
      case "boolean":
        valid = typeof v === "boolean";
        break;
      case "select":
        valid = typeof v === "string" && !!f.options?.some((o) => o.id === v);
        break;
      case "multiSelect":
        valid =
          Array.isArray(v) &&
          (!f.required || v.length > 0) &&
          new Set(v).size === v.length &&
          v.every((x) => typeof x === "string" && f.options?.some((o) => o.id === x));
        break;
    }
    if (!valid) throw new Error("输入格式无效：" + f.label);
  }
}
export function conversationId(hostId: string, pluginId: string) {
  return `chat:${hostId}:${pluginId}`;
}
const route = { hostId: idSchema, pluginId: idSchema, conversationId: conversation };
const envelope = {
  protocolVersion: z.literal(2),
  id: idSchema,
  ...route,
  deviceId: idSchema,
  createdAt: time,
};
export const messageSchema = z
  .discriminatedUnion("kind", [
    z.strictObject({
      ...envelope,
      kind: z.literal("userText"),
      text: z.string().min(1).max(16000),
      botVersion: z.string().min(1).max(100),
    }),
    z.strictObject({ ...envelope, kind: z.literal("botText"), text: z.string().min(1).max(16000) }),
    z.strictObject({
      ...envelope,
      kind: z.literal("request"),
      card: cardSchema,
      expiresAt: time,
      botVersion: z.string().min(1).max(100),
    }),
    z.strictObject({
      ...envelope,
      kind: z.literal("response"),
      requestId: idSchema,
      actionId: idSchema,
      values: z.record(z.string(), jsonSchema),
      botVersion: z.string().min(1).max(100),
    }),
  ])
  .superRefine((m, ctx) => {
    if (
      m.conversationId !== conversationId(m.hostId, m.pluginId) ||
      ((m.kind === "botText" || m.kind === "request") && m.deviceId !== m.hostId) ||
      (m.kind === "userText" && !m.text.trim()) ||
      (m.kind === "request" && m.expiresAt <= m.createdAt)
    )
      ctx.addIssue({ code: "custom", message: "消息归属或内容无效" });
  });
export type ChatMessage = z.infer<typeof messageSchema>;
export type ChatUserMessage = Extract<ChatMessage, { kind: "userText" }>;
export type ChatResponse = Extract<ChatMessage, { kind: "response" }>;
export type ChatRequest = Extract<ChatMessage, { kind: "request" }>;
export const requestStateSchema = z.strictObject({
  protocolVersion: z.literal(2),
  requestId: idSchema,
  phase: z.enum(["pending", "responded", "cancelled", "expired"]),
  revision: time,
  updatedAt: time,
  responseId: idSchema.optional(),
});
export const deliverySchema = z.strictObject({
  protocolVersion: z.literal(2),
  eventId: idSchema,
  ...route,
  status: z.enum(["running", "completed", "failed", "interrupted"]),
  attemptId: idSchema,
  updatedAt: time,
  progress: z.string().max(512).optional(),
  error: z.string().max(1024).optional(),
});
export const hostSchema = z.strictObject({
  protocolVersion: z.literal(2),
  id: idSchema,
  name: z.string().min(1).max(80),
  role: z.literal("host"),
  updatedAt: time,
});
export const clientSchema = z.strictObject({
  protocolVersion: z.literal(2),
  id: idSchema,
  name: z.string().min(1).max(80),
  role: z.literal("client"),
  platform: z.enum(["iOS", "macOS"]),
  updatedAt: time,
});
export const botSchema = z.strictObject({
  protocolVersion: z.literal(2),
  ...route,
  name: z.string().min(1).max(100),
  icon: z.string().max(100),
  enabled: z.boolean(),
  version: z.string().min(1).max(100),
  updatedAt: time,
});
export const receiptSchema = z.strictObject({
  protocolVersion: z.literal(2),
  conversationId: conversation,
  messageId: idSchema,
  read: z.literal(true),
});
export const archiveSchema = z.strictObject({
  protocolVersion: z.literal(2),
  conversationId: conversation,
  archived: z.boolean(),
  activityDigest: z.string().length(64),
});
export const recordSchemas = {
  FnChatUserMessage: messageSchema,
  FnChatBotMessage: messageSchema,
  FnChatResponse: messageSchema,
  FnChatRequestState: requestStateSchema,
  FnChatDelivery: deliverySchema,
  FnChatHost: hostSchema,
  FnChatClient: clientSchema,
  FnChatBot: botSchema,
  FnChatReceipt: receiptSchema,
  FnChatArchive: archiveSchema,
} as const;
export type RecordType = keyof typeof recordSchemas;
export type RecordValue = z.infer<(typeof recordSchemas)[RecordType]>;
export type RequestState = z.infer<typeof requestStateSchema>;
export type Delivery = z.infer<typeof deliverySchema>;
export type ChatBot = z.infer<typeof botSchema>;
export function messageRecordType(m: ChatMessage): RecordType {
  return m.kind === "userText"
    ? "FnChatUserMessage"
    : m.kind === "response"
      ? "FnChatResponse"
      : "FnChatBotMessage";
}
export function recordIdentity(type: string, value: RecordValue): string {
  const d = value as Record<string, unknown>;
  switch (type) {
    case "FnChatUserMessage":
    case "FnChatBotMessage":
    case "FnChatResponse":
      return "message:" + d.id;
    case "FnChatRequestState":
      return "state:" + d.requestId;
    case "FnChatDelivery":
      return "delivery:" + d.eventId;
    case "FnChatBot":
      return "bot:" + d.hostId + ":" + d.pluginId;
    case "FnChatHost":
      return "host:" + d.id;
    case "FnChatClient":
      return "client:" + d.id;
    case "FnChatReceipt":
      return "read:" + d.messageId;
    case "FnChatArchive":
      return "archive:" + d.conversationId;
    default:
      throw new Error("未知聊天记录");
  }
}
export function parseRecord(type: string, payload: string): RecordValue {
  if (!Object.hasOwn(recordSchemas, type)) throw new Error("不支持的聊天记录类型");
  if (new TextEncoder().encode(payload).length > maxRecordBytes)
    throw new Error("聊天记录超过 64 KiB");
  const v = recordSchemas[type as RecordType].parse(JSON.parse(payload));
  if ("kind" in v && messageRecordType(v) !== type) throw new Error("消息方向与记录类型不匹配");
  if ("hostId" in v && v.conversationId !== conversationId(v.hostId, v.pluginId))
    throw new Error("会话路由不匹配");
  return v;
}
export interface ChatItem {
  message: ChatMessage;
  state?: RequestState;
  delivery?: Delivery;
}
export interface ChatClient {
  sendText(text: string): Promise<string>;
  request(input: { card: ChatCard; expiresAt?: number }): Promise<string>;
  get(id: string): Promise<ChatItem | null>;
  list(input?: { before?: string; limit?: number }): Promise<{ items: ChatItem[]; next?: string }>;
  cancel(id: string): Promise<void>;
}
export interface ChatEventContext extends PluginContext {
  eventId: string;
  conversationId: string;
  signal: AbortSignal;
  progress(text: string): Promise<void>;
}
export interface PluginChat {
  /** Increment when the handler/card semantics change. */
  version: number;
  timeoutMs?: number;
  onMessage(message: ChatUserMessage, context: ChatEventContext): void | Promise<void>;
  onResponse(response: ChatResponse, context: ChatEventContext): void | Promise<void>;
}
