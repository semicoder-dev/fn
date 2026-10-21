import type { Context } from "@deepseek-ai/cordis";
import { isAppendSurfaceEvent, Session, SessionId, type SessionEvent } from "@deepseek-ai/dsh-session";
import type { ContextFormed, Message } from "@deepseek-ai/dsh-llm";
import type {} from "@deepseek-ai/dsh-session-persistence";

// The fixed AgentLoop emits this public message source but its package entry
// does not export the source-map augmentation from its internal declarations.
declare module "@deepseek-ai/dsh-llm" {
  interface MessageSourceMap {
    "runtime-context": { kind: "runtime-context" } & ContextFormed;
  }
}

/** This is the only dsh -> fn display boundary. Provider replay state never leaves it. */
export interface SessionDisplayItem {
  id: string;
  seq: number;
  createdAt: number;
  kind: "user" | "assistant" | "tool" | "notice";
  text: string;
  reasoning?: string;
  toolName?: string;
  callId?: string;
  state?: "running" | "completed" | "failed" | "interrupted";
  truncated: boolean;
}
export interface SessionProjectionPage {
  schemaVersion: 1;
  sessionId: string;
  asOfSeq: number;
  items: SessionDisplayItem[];
  /** Log sequence cursor, not the number of visible rows. */
  nextOffset: number;
  hasMore: boolean;
}
const ITEM_BYTES = 32 * 1024;
const PAGE_BYTES = 255 * 1024; // Reserve 1 KiB for the page envelope and separators.
function bound(text: string, maxBytes = ITEM_BYTES): { value: string; truncated: boolean } {
  const bytes = Buffer.from(text);
  let value = bytes.length > maxBytes
    ? new TextDecoder().decode(bytes.subarray(0, maxBytes), { stream: true })
    : text;
  // CloudKit and FIA count serialized UTF-8. Control characters can expand to
  // six JSON bytes, so limiting the source string alone is insufficient.
  if (Buffer.byteLength(JSON.stringify(value)) > maxBytes) {
    const prefix = (end: number) => {
      const candidate = value.slice(0, end);
      const tail = candidate.charCodeAt(candidate.length - 1);
      return tail >= 0xd800 && tail <= 0xdbff ? candidate.slice(0, -1) : candidate;
    };
    let low = 0, high = value.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (Buffer.byteLength(JSON.stringify(prefix(middle))) <= maxBytes) low = middle;
      else high = middle - 1;
    }
    value = prefix(low);
  }
  return { value, truncated: value.length !== text.length };
}
function messageText(message: Message) {
  const text = bound(message.content.map(block => {
    if (block.type === "text") return block.text;
    if (block.type === "image") return "[Image]";
    if (block.type === "file") return "[File]";
    return "";
  }).filter(Boolean).join("\n"));
  const reasoning = bound(message.content.filter(block => block.type === "reasoning").map(block => block.text).join("\n"));
  return { text: text.value, ...(reasoning.value ? { reasoning: reasoning.value } : {}), truncated: text.truncated || reasoning.truncated };
}
export function projectSession(session: Session, events: readonly SessionEvent[], offset = 0, limit = 50): SessionProjectionPage {
  if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Invalid projection page");
  }
  const items: SessionDisplayItem[] = [];
  const toolOutcomes = new Map<string, "completed" | "failed">();
  const endedTurns = new Set<number>();
  for (const event of events) {
    if (event.type === "tool/result") toolOutcomes.set(`${event.data.turn}:${event.data.step}:${event.data.message.toolCallId}`, event.data.message.isError ? "failed" : "completed");
    if (event.type === "turn/end") endedTurns.add(event.data.turn);
  }
  let nextOffset = offset;
  let bytes = 0;
  for (const event of events) {
    if (event.seq < offset) continue;
    let item: SessionDisplayItem | undefined;
    const base = { id: `${session.id}:${event.seq}`, seq: Number(event.seq), createdAt: event.time };
    if (event.type === "tool/call") {
      const name = bound(event.data.name, 256), callId = bound(event.data.callId, 256);
      item = { ...base, kind: "tool", toolName: name.value, callId: callId.value,
        state: toolOutcomes.get(`${event.data.turn}:${event.data.step}:${event.data.callId}`) ?? (endedTurns.has(event.data.turn) ? "interrupted" : "running"),
        text: name.value, truncated: name.truncated || callId.truncated };
    } else if (isAppendSurfaceEvent(event)) {
      // Preserve the append-origin human transcript even after context compaction.
      // The public Session interpreter still applies durable message projections.
      const message = session.deriveEventMessage(event);
      // AgentLoop's dynamic prompt snapshot uses the user role for model
      // routing, but it is not a user utterance or a display notification.
      const runtimeContext = message?.role === "user" && message.source.kind === "runtime-context";
      if (message && !runtimeContext && ["user", "assistant", "tool"].includes(message.role)) {
        item = { ...base, kind: message.role === "user" && message.source.kind !== "user" ? "notice" : message.role as "user" | "assistant" | "tool", ...messageText(message) };
        if (message.role === "tool") {
          const callId = bound(message.toolCallId, 256);
          item.callId = callId.value; item.state = message.isError ? "failed" : "completed";
          item.truncated ||= callId.truncated;
        }
        if (event.type === "assistant/message" && event.data.interrupted) item.state = "interrupted";
      }
    } else if (event.type === "turn/end" && event.data.reason.kind !== "completed") {
      item = { ...base, kind: "notice", text: `Turn ${event.data.reason.kind}`, state: "interrupted", truncated: false };
    }
    if (item?.kind === "assistant" && !item.text.trim() && !item.reasoning?.trim()) item = undefined;
    if (item) {
      const size = Buffer.byteLength(JSON.stringify(item));
      if (items.length && (items.length >= limit || bytes + size > PAGE_BYTES)) break;
      items.push(item); bytes += size;
    }
    nextOffset = Number(event.seq) + 1;
  }
  const end = events.length ? Number(events.at(-1)!.seq) + 1 : 0;
  return { schemaVersion: 1, sessionId: session.id, asOfSeq: end - 1, items, nextOffset, hasMore: nextOffset < end };
}
/** Read without resuming an Agent or emitting lifecycle/repair events. */
export async function readSessionProjection(ctx: Context, id: string, offset = 0, limit = 50): Promise<SessionProjectionPage> {
  const sessionId = SessionId(id);
  const live = ctx.sessions.get(sessionId);
  if (live) await ctx.sessions.flush(live);
  const handle = await ctx.sessionPersistence.open(sessionId, "read");
  try {
    const result = await handle.read();
    const session = Session.fromRestore(sessionId, result.events, handle.header, handle.inheritedEventCount, result.eventState, ctx.sessions.messageProjections);
    return projectSession(session, result.events, offset, limit);
  } finally { await handle.close(); }
}
