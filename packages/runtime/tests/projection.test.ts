import { expect, test } from "bun:test";
import { Context } from "@deepseek-ai/cordis";
import SessionStore, { Session, SessionId } from "@deepseek-ai/dsh-session";
import { ToolCallId, createAssistantMessage, createSystemMessage, createUserMessage } from "@deepseek-ai/dsh-llm";
import SqliteSessionPersistence from "../src/persistence.ts";
import { projectSession, readSessionProjection } from "../src/projection.ts";

function transcript() {
  const session = Session.create(SessionId("display-test"));
  session.append("system/message", { turn: 1, step: 1, message: createSystemMessage("secret system") }, { surfaceOp: "append" });
  session.append("user/message", createUserMessage({ content: [{ type: "text", text: "hello" }], source: { kind: "user" } }), { surfaceOp: "append" });
  session.append("assistant/message", {
    turn: 1, step: 1, stream: [],
    message: createAssistantMessage({ source: { provider: "fixture", model: "fixture", replayState: { private: "replay-secret" } },
      content: [{ type: "reasoning", text: "thinking" }, { type: "text", text: "answer" }] }),
  }, { surfaceOp: "append" });
  return session;
}
test("display projection strips system/provider replay data and follows upstream public message projection", () => {
  const session = transcript(), events = session.snapshotEvents();
  const page = projectSession(session, events);
  expect(page.items.map(item => item.kind)).toEqual(["user", "assistant"]);
  expect(page.items[1]).toMatchObject({ text: "answer", reasoning: "thinking", truncated: false });
  expect(JSON.stringify(page)).not.toContain("replay-secret");
  expect(JSON.stringify(page)).not.toContain("secret system");
  expect(page.nextOffset).toBe(3);
  const first = projectSession(session, events, 0, 1);
  expect(first.nextOffset).toBe(2);
  expect(first.hasMore).toBe(true);
  expect(projectSession(session, events, first.nextOffset, 1).items[0]!.id).toBe(page.items[1]!.id);
});
test("replacement copies stay model-only and original transcript survives compaction", () => {
  const session = transcript();
  const original = session.snapshotEvents();
  session.append("user/message", createUserMessage({ content: [{ type: "text", text: "replacement summary" }], source: { kind: "user" } }),
    { surfaceOp: { op: "replace", startSeq: original[1]!.seq, endSeq: original[2]!.seq }, sourceEventSeqs: [original[1]!.seq, original[2]!.seq] });
  const page = projectSession(session, session.snapshotEvents());
  expect(page.items.map(item => item.text)).toEqual(["hello", "answer"]);
  expect(session.deriveMessages().map(message => message.content).flat()).toContainEqual({ type: "text", text: "replacement summary" });
});
test("loop runtime-context snapshots stay model-only while identical user text remains visible", () => {
  const session = transcript();
  const text = "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\nApproval policy: ask.";
  session.append("user/message", createUserMessage({ content: [{ type: "text", text }], source: { kind: "runtime-context" } }), { surfaceOp: "append" });
  session.append("user/message", createUserMessage({ content: [{ type: "text", text }], source: { kind: "user" } }), { surfaceOp: "append" });
  const page = projectSession(session, session.snapshotEvents());
  expect(page.items.map(item => item.kind)).toEqual(["user", "assistant", "user"]);
  expect(page.items.filter(item => item.text === text)).toHaveLength(1);
  expect(page.items.at(-1)!.seq).toBe(4);
  expect(page.nextOffset).toBe(5);
  expect(session.deriveMessages().flatMap(message => message.content).filter(block => block.type === "text" && block.text === text)).toHaveLength(2);
});
test("tool-only assistant messages do not create blank bubbles and tool rows remain visible", () => {
  const session = Session.create(SessionId("tool-only-display")), callId = ToolCallId("call");
  session.append("assistant/message", {
    turn: 1, step: 1, stream: [],
    message: createAssistantMessage({ source: { provider: "fixture", model: "fixture" },
      content: [{ type: "tool-call", id: callId, name: "read_file", arguments: '{"path":"note"}' }] }),
  }, { surfaceOp: "append" });
  session.append("tool/call", { turn: 1, step: 1, callId, name: "read_file", arguments: '{"path":"note"}' });
  session.append("assistant/message", {
    turn: 1, step: 1, stream: [],
    message: createAssistantMessage({ source: { provider: "fixture", model: "fixture" },
      content: [{ type: "reasoning", text: "I should read the note." }] }),
  }, { surfaceOp: "append" });
  const page = projectSession(session, session.snapshotEvents());
  expect(page.items.map(item => item.kind)).toEqual(["tool", "assistant"]);
  expect(page.items[0]).toMatchObject({ seq: 1, toolName: "read_file", callId: "call", state: "running" });
  expect(page.items[1]).toMatchObject({ text: "", reasoning: "I should read the note." });
  expect(page.nextOffset).toBe(3);
});
test("display text is UTF8 bounded and persisted reads never resume or mutate the Session", async () => {
  const ctx = new Context();
  await ctx.plugin(SessionStore);
  await ctx.plugin(SqliteSessionPersistence, { path: ":memory:" });
  try {
    const session = transcript();
    session.append("user/message", createUserMessage({ content: [{ type: "text", text: "你".repeat(20000) }], source: { kind: "user" } }), { surfaceOp: "append" });
    const handle = await ctx.sessionPersistence.create(session.header);
    await handle.append(session.snapshotEvents()); await handle.flush(); await handle.close();
    const before = await ctx.sessionPersistence.stat(session.id);
    const result = await readSessionProjection(ctx, session.id);
    expect(result.items.at(-1)!.truncated).toBe(true);
    expect(result.items.at(-1)!.text.includes("\uFFFD")).toBe(false);
    expect(Buffer.byteLength(result.items.at(-1)!.text)).toBeLessThanOrEqual(32768);
    expect(ctx.sessions.get(session.id)).toBeUndefined();
    expect(await ctx.sessionPersistence.stat(session.id)).toEqual(before);
  } finally { await ctx.fiber.dispose(); }
});
test("JSON escaping cannot overflow a display record or page", () => {
  const session = Session.create(SessionId("escaped-display"));
  for (let index = 0; index < 8; index++) {
    session.append("assistant/message", {
      turn: 1, step: index, stream: [],
      message: createAssistantMessage({ source: { provider: "fixture", model: "fixture" },
        content: [{ type: "text", text: "\u0001".repeat(32768) }, { type: "reasoning", text: "🙂".repeat(32768) }] }),
    }, { surfaceOp: "append" });
  }
  const events = session.snapshotEvents();
  let offset = 0, count = 0;
  do {
    const page = projectSession(session, events, offset, 100);
    expect(Buffer.byteLength(JSON.stringify(page))).toBeLessThanOrEqual(256 * 1024);
    for (const item of page.items) {
      expect(Buffer.byteLength(JSON.stringify(item))).toBeLessThan(192 * 1024 - 1024);
      expect(Buffer.byteLength(JSON.stringify(item.text))).toBeLessThanOrEqual(32768);
      expect(Buffer.byteLength(JSON.stringify(item.reasoning))).toBeLessThanOrEqual(32768);
      expect(item.truncated).toBe(true);
      expect(item.reasoning!.includes("\uFFFD")).toBe(false);
      count++;
    }
    expect(page.nextOffset).toBeGreaterThan(offset);
    offset = page.nextOffset;
    if (!page.hasMore) break;
  } while (true);
  expect(count).toBe(8);
});
