import { sessionCardSchema, cardValuesSchema } from "../../packages/runtime/src/card-contract.ts";
import { z } from "@semicoder/fia/api";
import type { SessionDisplayItem } from "../../packages/runtime/src/projection.ts";

export const CHAT_VERSION = 3;
export const MAX_RECORD_BYTES = 192 * 1024;
const id = z.string().min(1).max(160);
const base = { protocolVersion: z.literal(3), id, hostId: id };
export const displayItemSchema = z.strictObject({
  id, seq: z.number().int().nonnegative(), createdAt: z.number(),
  kind: z.enum(["user", "assistant", "tool", "notice"]), text: z.string().max(32768),
  reasoning: z.string().max(32768).optional(), toolName: z.string().max(256).optional(),
  callId: z.string().max(256).optional(), state: z.enum(["running", "completed", "failed", "interrupted"]).optional(),
  truncated: z.boolean(),
}) satisfies z.ZodType<SessionDisplayItem>;
const session = z.strictObject({
  id, appId: id, connectionId: id, modelId: z.string().min(1).max(256),
  title: z.string().max(200), createdAt: z.number(), updatedAt: z.number(), archived: z.boolean(),
  policy: z.enum(["controlled", "automatic"]), cwd: z.string().optional(), endpointId: id.optional(),
  status: z.enum(["idle", "running", "unloaded"]),
});
const commandBase = { ...base, deviceId: id, createdAt: z.number() };
export const commandSchema = z.discriminatedUnion("action", [
  z.strictObject({ ...commandBase, action: z.literal("create"), appId: id, endpointId: id, connectionId: id, modelId: z.string().min(1).max(256), title: z.string().max(200).optional() }),
  z.strictObject({ ...commandBase, action: z.literal("card"), sessionId: id, cardId: id, actionId: z.string().min(1).max(100), values: cardValuesSchema }),
  z.strictObject({ ...commandBase, action: z.literal("send"), sessionId: id, text: z.string().trim().min(1).max(32768) }),
  z.strictObject({ ...commandBase, action: z.literal("read"), sessionId: id, seq: z.number().int().nonnegative() }),
  z.strictObject({ ...commandBase, action: z.literal("cancel"), sessionId: id }),
  z.strictObject({ ...commandBase, action: z.literal("model"), sessionId: id, modelId: z.string().min(1).max(256) }),
  z.strictObject({ ...commandBase, action: z.literal("archive"), sessionId: id, archived: z.boolean() }),
  z.strictObject({ ...commandBase, action: z.literal("approval"), sessionId: id, approvalId: id, allow: z.boolean() }),
]);
export type SessionCommand = z.infer<typeof commandSchema>;
export const recordSchemas = {
  FnSessionCard: z.strictObject({ ...base, sessionId: id, card: sessionCardSchema }),
  FnSessionHost: z.strictObject({ ...base, name: z.string().max(80), updatedAt: z.number() }),
  FnSessionEndpoint: z.strictObject({ ...base, appId: id, endpointId: id, name: z.string().max(200), enabled: z.boolean() }),
  FnSessionConnection: z.strictObject({ ...base, name: z.string().max(100), enabled: z.boolean(), models: z.array(z.strictObject({ id: z.string().max(256), name: z.string().max(512) })).max(2000) }),
  FnSessionSummary: z.strictObject({ ...base, session, asOfSeq: z.number().int().min(-1), readSeq: z.number().int().min(-1).optional(), approvals: z.array(z.strictObject({ id, toolName: z.string().max(256), reason: z.string().max(32768).optional() })).max(100) }),
  FnSessionItem: z.strictObject({ ...base, sessionId: id, item: displayItemSchema }),
  FnSessionReply: z.strictObject({ ...base, sessionId: id, item: displayItemSchema }),
  FnSessionCommand: commandSchema,
  FnSessionResult: z.strictObject({ ...base, status: z.enum(["completed", "failed", "interrupted"]), sessionId: id.optional(), error: z.string().max(4096).optional(), updatedAt: z.number() }),
};
export type RecordType = keyof typeof recordSchemas;
export interface CloudRecord { id: string; type: string; fields: Record<string, string>; systemFields?: string }
export type RecordValue = z.infer<typeof recordSchemas[RecordType]>;
export function identity(type: RecordType, value: Pick<RecordValue, "id" | "hostId">): string {
  return `${type}:${value.hostId}:${value.id}`;
}
export function parseRecord(record: CloudRecord): { type: RecordType; value: RecordValue } {
  if (!Object.hasOwn(recordSchemas, record.type)) throw new Error("Unsupported Chat record type");
  const payload = record.fields.payload;
  if (typeof payload !== "string" || Buffer.byteLength(payload) > MAX_RECORD_BYTES) throw new Error("Chat record is missing or oversized");
  const type = record.type as RecordType;
  const value = recordSchemas[type].parse(JSON.parse(payload));
  if (type === "FnSessionCard") {
    const card = recordSchemas.FnSessionCard.parse(value);
    if (card.card.id !== card.id || card.card.sessionId !== card.sessionId) throw new Error("Card identity mismatch");
  }
  if (identity(type, value) !== record.id) throw new Error("Chat record identity mismatch");
  return { type, value };
}
export function cloudRecord<T extends RecordType>(type: T, value: z.infer<typeof recordSchemas[T]>, previous?: CloudRecord): CloudRecord {
  const record = { id: identity(type, value), type, fields: { payload: JSON.stringify(value) }, ...(previous?.systemFields ? { systemFields: previous.systemFields } : {}) };
  parseRecord(record);
  return record;
}
export interface ChatTransport {
  read(id: string): Promise<CloudRecord | undefined>;
  commit(records: CloudRecord[]): Promise<CloudRecord[]>;
  changes(token?: string): Promise<{ records: CloudRecord[]; deletedIDs: string[]; token: string; moreComing: boolean }>;
}
export function errorReason(error: unknown): string | undefined {
  const value = error as { reason?: string; details?: { reason?: string } } | undefined;
  return value?.details?.reason ?? value?.reason;
}
