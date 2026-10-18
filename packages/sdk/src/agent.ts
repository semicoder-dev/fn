import { z } from "zod";
import type { JSONValue, PluginContext } from "./types";

const id = z.string().min(1).max(100);
export const agentToolName = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/);
const textBlock = z.strictObject({ type: z.literal("text"), text: z.string() });
const reasoningBlock = z.strictObject({ type: z.literal("reasoning"), text: z.string() });
export const agentToolCall = z.strictObject({
  type: z.literal("tool-call"),
  id,
  name: agentToolName,
  arguments: z.string(),
});
export const agentUsage = z.strictObject({
  input: z.number().nonnegative(),
  output: z.number().nonnegative(),
  cacheRead: z.number().nonnegative(),
  cacheWrite: z.number().nonnegative(),
});
export const agentAssistant = z.strictObject({
  role: z.literal("assistant"),
  content: z.array(z.discriminatedUnion("type", [textBlock, reasoningBlock, agentToolCall])),
  finishReason: z.enum(["stop", "tool-calls", "length"]),
  model: z.string(),
  provider: z.string(),
  usage: agentUsage.optional(),
  /** Opaque adapter data preserves signatures and provider-native replay. Never edit it. */
  replay: z.strictObject({ adapter: z.string(), route: z.string(), data: z.json() }).optional(),
});
export const agentUser = z.strictObject({
  role: z.literal("user"),
  content: z.array(textBlock).min(1),
});
export const agentToolResult = z.strictObject({
  role: z.literal("tool"),
  callId: id,
  name: agentToolName,
  content: z.array(textBlock).min(1),
  isError: z.boolean(),
});
export const agentMessage = z.discriminatedUnion("role", [
  agentUser,
  agentAssistant,
  agentToolResult,
]);
export const agentToolInfo = z.strictObject({
  name: agentToolName,
  description: z.string().min(1).max(2000),
  inputSchema: z.json(),
});
export const agentCreate = z.strictObject({
  modelId: id,
  title: z.string().trim().max(100).default("新会话"),
  system: z.string().max(16000).default(""),
  tools: z
    .array(agentToolName)
    .max(32)
    .refine((v) => new Set(v).size === v.length, "工具不能重复")
    .default([]),
  maxSteps: z.number().int().min(1).max(32).default(8),
  timeoutMs: z.number().int().min(1000).max(1_800_000).default(600_000),
});
export const agentStatus = z.enum([
  "idle",
  "running",
  "cancelling",
  "completed",
  "cancelled",
  "failed",
  "interrupted",
]);
export const agentSession = agentCreate.extend({
  id,
  pluginId: id,
  formatVersion: z.literal(1),
  status: agentStatus,
  turn: z.number().int().nonnegative(),
  step: z.number().int().nonnegative(),
  seq: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  createdAt: z.number(),
  updatedAt: z.number(),
  error: z.string().nullable(),
});
export const agentSummary = agentSession.omit({ system: true });
const position = { turn: z.number().int().nonnegative(), step: z.number().int().nonnegative() };
/** Durable facts. seq starts at 1 and is monotonic within a session. */
export const agentEventData = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("session/create"), config: agentCreate }),
  z.strictObject({ type: z.literal("turn/start"), ...position }),
  z.strictObject({ type: z.literal("user/message"), ...position, message: agentUser }),
  z.strictObject({
    type: z.literal("step/start"),
    ...position,
    model: z.string(),
    provider: z.string(),
    tools: z.array(agentToolInfo),
  }),
  z.strictObject({ type: z.literal("assistant/message"), ...position, message: agentAssistant }),
  z.strictObject({
    type: z.literal("assistant/attempt"),
    ...position,
    content: z.array(z.union([textBlock, reasoningBlock, agentToolCall])),
    error: z.string(),
  }),
  z.strictObject({ type: z.literal("tool/call"), ...position, call: agentToolCall }),
  z.strictObject({
    type: z.literal("tool/result"),
    ...position,
    message: agentToolResult,
    meta: z.json().optional(),
  }),
  z.strictObject({ type: z.literal("step/end"), ...position }),
  z.strictObject({
    type: z.literal("turn/end"),
    ...position,
    status: z.enum(["completed", "cancelled", "failed", "interrupted"]),
    error: z.string().nullable(),
  }),
]);
export const agentEvent = z.union(
  agentEventData.options.map((schema) =>
    schema.extend({ sessionId: id, seq: z.number().int().positive(), time: z.number() }),
  ),
);
export const agentEventPage = z.strictObject({
  events: z.array(agentEvent),
  next: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});
export const agentChange = z.strictObject({
  pluginId: id,
  sessionId: id,
  seq: z.number().int().nonnegative(),
  revision: z.number().int().nonnegative(),
  status: agentStatus,
});
/** Live snapshot, not a durable token log. Re-read after notifications or reconnection. */
export const agentSnapshot = z.strictObject({
  session: agentSession,
  revision: z.number(),
  partial: agentAssistant.nullable(),
});
export type AgentCreate = z.input<typeof agentCreate>;
export type AgentSession = z.infer<typeof agentSession>;
export type AgentMessage = z.infer<typeof agentMessage>;
export type AgentAssistant = z.infer<typeof agentAssistant>;
export type AgentToolCall = z.infer<typeof agentToolCall>;
export type AgentToolInfo = z.infer<typeof agentToolInfo>;
export type AgentEventData = z.infer<typeof agentEventData>;
export type AgentEvent = AgentEventData & { sessionId: string; seq: number; time: number };
export interface AgentEventPage {
  events: AgentEvent[];
  next: number;
  hasMore: boolean;
}
export type AgentSnapshot = z.infer<typeof agentSnapshot>;
export type AgentChange = z.infer<typeof agentChange>;
export interface AgentClient {
  tools(): Promise<AgentToolInfo[]>;
  create(input: AgentCreate): Promise<AgentSession>;
  list(): Promise<z.infer<typeof agentSummary>[]>;
  get(sessionId: string): Promise<AgentSnapshot>;
  events(sessionId: string, after?: number): Promise<AgentEventPage>;
  send(sessionId: string, text: string): Promise<AgentSession>;
  cancel(sessionId: string): Promise<AgentSession>;
  remove(sessionId: string): Promise<void>;
  onChange(listener: (change: AgentChange) => void): () => void;
}
export interface AgentToolContext extends PluginContext {
  signal: AbortSignal;
  sessionId: string;
  callId: string;
}
export interface AgentToolOutput {
  content: { type: "text"; text: string }[];
  isError?: boolean;
  meta?: JSONValue;
}
export interface AgentTool {
  description: string;
  inputSchema: JSONValue;
  execute(input: unknown, context: AgentToolContext): AgentToolOutput | Promise<AgentToolOutput>;
}

/** Project model history from settled facts; failed partial attempts never become tool requests. */
export function deriveAgentMessages(events: readonly AgentEvent[]): AgentMessage[] {
  return events.flatMap<AgentMessage>((event) => {
    switch (event.type) {
      case "user/message":
      case "assistant/message":
      case "tool/result":
        return [event.message];
      default:
        return [];
    }
  });
}
