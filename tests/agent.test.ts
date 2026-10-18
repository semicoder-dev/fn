import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Agents, type PluginAgentTools } from "../backend/agent/service";
import { createAgentModel, type AgentModel } from "../backend/agent/model";
import { Store } from "../backend/store";
import { Models } from "../backend/models";
import { WebTools } from "../backend/web";
import { Plugins } from "../backend/plugins";
import { registerFixture, waitFor } from "./plugin-fixture";
import {
  deriveAgentMessages,
  agentEventPage,
  type AgentAssistant,
  type AgentMessage,
} from "@semicoder/fn-sdk/agent";
import { createAgentClient } from "../packages/sdk/src/agent-client";
import { defineTool, z } from "@semicoder/fn-sdk/runtime";

const cleanups: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});
const answer = (text = "done"): AgentAssistant => ({
  role: "assistant",
  model: "fixture",
  provider: "fixture",
  content: [{ type: "text", text }],
  finishReason: "stop",
});
const call = (name: string, args = "{}", id = "call-1"): AgentAssistant => ({
  ...answer(),
  content: [{ type: "tool-call", id, name, arguments: args }],
  finishReason: "tool-calls",
});
async function fixture(generate: AgentModel, custom: PluginAgentTools = {}) {
  const directory = await mkdtemp(join(tmpdir(), "fn-agent-test-"));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  const store = new Store(directory);
  await store.open();
  const models = new Models(
    store,
    () => {},
    () => {},
  );
  const model = await models.save({
    name: "fixture",
    provider: "custom",
    model: "fixture",
    baseURL: "http://localhost:12345/v1",
    apiKey: "fixture-key",
  });
  let searches = 0;
  const searchInputs: unknown[] = [];
  const web = new WebTools(() => {}, {
    now: Date.now,
    search: async (input) => {
      searches++;
      searchInputs.push(input);
      return {
        text: input.query,
        results: [],
        engines: [{ engine: "baidu", status: "no_results", ok: true, count: 0, rawCount: 0 }],
      };
    },
    fetch: async (input) => ({
      url: input.url,
      finalUrl: input.url,
      title: "Example",
      status: 200,
      contentType: "text/plain",
      format: "text",
      text: "page evidence",
      truncated: false,
    }),
  });
  cleanups.push(() => web.stop());
  let agents = new Agents(
    directory,
    models,
    web,
    () => custom,
    () => {},
    generate,
  );
  await agents.open();
  cleanups.push(() => agents.stop());
  return {
    directory,
    store,
    models,
    model,
    web,
    searchInputs,
    get agents() {
      return agents;
    },
    get searches() {
      return searches;
    },
    create: (tools: string[] = [], extra = {}) =>
      agents.create("test", { modelId: model.id, tools, ...extra }),
    async done(id: string) {
      await waitFor(() => !agents.busy(), 3000);
      return agents.get("test", id).session;
    },
    history: (id: string) => agents.journal.all("test", id),
    async reopen() {
      await agents.stop();
      agents = new Agents(
        directory,
        models,
        web,
        () => custom,
        () => {},
        generate,
      );
      await agents.open();
    },
  };
}

test("Agent search treats blank site as unrestricted, preserves real filters and rejects invalid inputs", async () => {
  let step = 0;
  const inputs = [
    { query: "科技新闻", site: "  ", timeRange: "all" },
    { query: "科技新闻", site: " news.cn " },
    { query: "科技新闻", site: 42 },
    { query: "  ", site: "" },
  ];
  const systems: string[] = [];
  const f = await fixture(async (request) => {
    systems.push(request.system);
    return step < inputs.length
      ? call("web_search", JSON.stringify(inputs[step]), `search-${++step}`)
      : answer();
  });
  const s = f.create(["web_search"]);
  f.agents.send("test", s.id, "新闻");
  expect((await f.done(s.id)).status).toBe("completed");
  expect(f.searchInputs).toEqual([{ query: "科技新闻" }, { query: "科技新闻", site: "news.cn" }]);
  const results = f.history(s.id).filter((e) => e.type === "tool/result");
  expect(results.map((e) => e.message.isError)).toEqual([false, false, true, true]);
  expect(systems.every((s) => s.includes(new Date().toISOString().slice(0, 10)))).toBe(true);
  expect(systems[0]).toContain(Intl.DateTimeFormat().resolvedOptions().timeZone);
});

test("multiple model/tool steps persist a replayable transcript; follow-ups survive restart", async () => {
  const requests: AgentMessage[][] = [];
  let step = 0;
  const f = await fixture(async (request) => {
    requests.push(request.messages);
    return ++step === 1 ? call("web_search", '{"query":"test"}') : answer("based on sources");
  });
  const session = f.create(["web_search"], { system: "Research" });
  expect(f.agents.send("test", session.id, "find sources").status).toBe("running");
  expect((await f.done(session.id)).status).toBe("completed");
  expect(f.searches).toBe(1);
  const events = f.history(session.id);
  expect(events.map((event) => event.type)).toEqual([
    "session/create",
    "turn/start",
    "user/message",
    "step/start",
    "assistant/message",
    "tool/call",
    "tool/result",
    "step/end",
    "step/start",
    "assistant/message",
    "step/end",
    "turn/end",
  ]);
  expect(events.map((event) => event.seq)).toEqual(events.map((_, i) => i + 1));
  expect(requests[1]!.map((message) => message.role)).toEqual(["user", "assistant", "tool"]);
  expect(deriveAgentMessages(events)).toHaveLength(4);
  expect(agentEventPage.parse(f.agents.events("test", session.id)).events).toHaveLength(
    events.length,
  );
  await f.reopen();
  expect(f.history(session.id)).toEqual(events);
  f.agents.send("test", session.id, "follow up");
  expect((await f.done(session.id)).turn).toBe(2);
  expect(requests[2]!).toHaveLength(5);
  expect(f.searches).toBe(1);
});

test("tool arguments and allowlists are checked; errors reach the model without execution", async () => {
  let executions = 0;
  const definition = defineTool("Record", z.object({ value: z.string() }), () => {
    executions++;
    return { content: [{ type: "text", text: "ok" }] };
  });
  const tools: PluginAgentTools = {
    record: {
      definition,
      execute: () => {
        executions++;
        return { content: [{ type: "text", text: "ok" }] };
      },
    },
  };
  let step = 0;
  const f = await fixture(async (request) => {
    step++;
    if (step === 1) return call("record", '{"value":5}', "invalid-schema");
    if (step === 2) return call("record", "{broken", "invalid-json");
    if (step === 3) return call("web_fetch", "{}", "not-selected");
    expect(
      request.messages
        .filter((message) => message.role === "tool")
        .every((message) => message.isError),
    ).toBe(true);
    return answer();
  }, tools);
  const session = f.create(["record"]);
  f.agents.send("test", session.id, "test");
  expect((await f.done(session.id)).status).toBe("completed");
  expect(executions).toBe(0);
  expect(() => f.create(["missing"])).toThrow("工具不存在");
});

test("cancellation settles partial attempts and never dispatches their tool calls", async () => {
  const f = await fixture(async (request) => {
    request.partial(answer("partial"));
    await new Promise<void>((_resolve, reject) =>
      request.signal.addEventListener("abort", () => reject(request.signal.reason), { once: true }),
    );
    return call("web_search");
  });
  const session = f.create(["web_search"]);
  f.agents.send("test", session.id, "test");
  await waitFor(() => !!f.agents.get("test", session.id).partial);
  expect(f.agents.cancel("test", session.id).status).toBe("cancelling");
  expect((await f.done(session.id)).status).toBe("cancelled");
  expect(f.searches).toBe(0);
  expect(f.history(session.id).some((event) => event.type === "assistant/attempt")).toBe(true);
  expect(deriveAgentMessages(f.history(session.id))).toHaveLength(1);
});

test("cancelled multi-tool batches retain observed results and close undispatched calls", async () => {
  let executed = 0;
  let release!: () => void;
  const started = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tools: PluginAgentTools = {
    slow: {
      definition: defineTool("slow", z.object({}), () => ({
        content: [{ type: "text", text: "unused" }],
      })),
      execute: async (_, signal) => {
        executed++;
        release();
        await new Promise<void>((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(signal.reason), { once: true }),
        );
        return { content: [{ type: "text", text: "late" }] };
      },
    },
  };
  const f = await fixture(
    async () => ({
      ...call("slow"),
      content: [
        { type: "tool-call", id: "one", name: "slow", arguments: "{}" },
        { type: "tool-call", id: "two", name: "slow", arguments: "{}" },
      ],
    }),
    tools,
  );
  const s = f.create(["slow"]);
  f.agents.send("test", s.id, "test");
  await started;
  f.agents.cancel("test", s.id);
  await f.done(s.id);
  expect(executed).toBe(1);
  expect(
    f
      .history(s.id)
      .filter((event) => event.type === "tool/result")
      .map((event) => event.message.callId),
  ).toEqual(["one", "two"]);
});

test("restart closes an unfinished tool without executing it and permits an explicit follow-up", async () => {
  const f = await fixture(async () => answer());
  let s = f.create(["web_search"]);
  s.status = "running";
  s.turn = 1;
  s.step = 1;
  f.agents.journal.commit(s, [
    { type: "turn/start", turn: 1, step: 0 },
    {
      type: "user/message",
      turn: 1,
      step: 0,
      message: { role: "user", content: [{ type: "text", text: "test" }] },
    },
    { type: "step/start", turn: 1, step: 1, model: "fixture", provider: "fixture", tools: [] },
    { type: "assistant/message", turn: 1, step: 1, message: call("web_search") },
    {
      type: "tool/call",
      turn: 1,
      step: 1,
      call: { type: "tool-call", id: "call-1", name: "web_search", arguments: "{}" },
    },
  ]);
  await f.reopen();
  expect(f.agents.get("test", s.id).session.status).toBe("interrupted");
  expect(f.searches).toBe(0);
  const history = f.history(s.id);
  expect(history.filter((event) => event.type === "tool/result")).toHaveLength(1);
  expect(history.at(-1)?.type).toBe("turn/end");
  f.agents.send("test", s.id, "continue explicitly");
  expect((await f.done(s.id)).status).toBe("completed");
});

test("bounded turns, ownership, concurrent sends and terminal removal", async () => {
  let count = 0;
  const f = await fixture(async () => call("web_search", '{"query":"test"}', "call-" + ++count));
  const s = f.create(["web_search"], { maxSteps: 2 });
  expect(() => f.agents.get("other", s.id)).toThrow("不存在");
  expect(() => f.agents.events("other", s.id)).toThrow("不存在");
  expect(() => f.agents.cancel("other", s.id)).toThrow("不存在");
  f.agents.send("test", s.id, "test");
  expect(() => f.agents.send("test", s.id, "duplicate")).toThrow("正在运行");
  expect(() => f.agents.remove("test", s.id)).toThrow("正在运行");
  expect((await f.done(s.id)).error).toContain("最大模型步数");
  expect(f.searches).toBe(2);
  f.agents.remove("test", s.id);
  expect(() => f.agents.get("test", s.id)).toThrow("不存在");
});

test("large results are errors, metadata is persisted but excluded from model history", async () => {
  let step = 0;
  const tools: PluginAgentTools = {
    detail: {
      definition: defineTool("detail", z.object({}), () => ({
        content: [{ type: "text", text: "" }],
      })),
      execute: () => ({
        content: [{ type: "text", text: "evidence" }],
        meta: { presentationOnly: "private-card" },
      }),
    },
  };
  const f = await fixture(async (request) => {
    if (++step === 1) return call("detail");
    expect(JSON.stringify(request.messages)).not.toContain("private-card");
    return answer();
  }, tools);
  const s = f.create(["detail"]);
  f.agents.send("test", s.id, "test");
  await f.done(s.id);
  expect(f.history(s.id).find((event) => event.type === "tool/result")).toMatchObject({
    meta: { presentationOnly: "private-card" },
  });
  const copy = f.agents.get("test", s.id);
  copy.session.title = "mutated";
  expect(f.agents.get("test", s.id).session.title).not.toBe("mutated");
});

test("plugin-declared tools use scoped context and model leases protect plugin lifecycle", async () => {
  let unblock!: () => void;
  const gate = new Promise<void>((resolve) => {
    unblock = resolve;
  });
  let calls = 0;
  const f = await fixture(async () => {
    if (++calls === 1) {
      await gate;
      return call("record", '{"value":"saved"}');
    }
    return answer();
  });
  await f.agents.stop();
  let plugins: Plugins;
  const agents = new Agents(
    f.directory,
    f.models,
    f.web,
    (id) => plugins.agentTools(id),
    () => {},
    async (request) => {
      if (++calls === 1) {
        await gate;
        return call("record", '{"value":"saved"}');
      }
      return answer();
    },
  );
  await agents.open();
  cleanups.push(() => agents.stop());
  await registerFixture(f.store, join(f.directory, "plugin"), {
    backend:
      'export default { methods: {}, tools: { record: { description: "Record", inputSchema: { type: "object", properties: { value: {type:"string"} }, required:["value"], additionalProperties:false }, execute: async (input, ctx) => { await ctx.kv.set("result", input.value); return {content:[{type:"text",text:ctx.pluginId}]}; } } } }',
  });
  plugins = new Plugins(f.store, f.models, () => {}, undefined, fetch, f.web, undefined, agents);
  await plugins.open();
  const s = agents.create("translate", { modelId: f.model.id, tools: ["record"] });
  agents.send("translate", s.id, "test");
  await expect(plugins.setEnabled("translate", false)).rejects.toThrow("正在运行");
  await expect(plugins.uninstall("translate")).rejects.toThrow("正在运行");
  await expect(f.models.remove(f.model.id)).rejects.toThrow("Agent");
  unblock();
  await waitFor(() => !agents.busy());
  expect(f.store.get("translate", "result")).toBe("saved");
  await plugins.setEnabled("translate", false);
  await plugins.stop();
});

test("frontend client routes ownership and cursor reads without retrying sends", async () => {
  const calls: { method: string; input: unknown }[] = [];
  let receive!: (value: unknown) => void;
  let changes = 0;
  const client = createAgentClient(
    {
      call: async (method, input) => {
        calls.push({ method, input });
        if (method === "agents.send") throw new Error("connection lost");
        return null;
      },
      on: (_, listener) => {
        receive = listener;
        return () => {
          changes--;
        };
      },
      onReconnect: () => () => {},
    },
    "my-plugin",
  );
  const stop = client.onChange(() => {
    changes++;
  });
  receive({ pluginId: "other" });
  receive({ pluginId: "my-plugin" });
  expect(changes).toBe(1);
  await client.events("s", 12);
  await expect(client.send("s", "question")).rejects.toThrow("connection lost");
  expect(calls).toEqual([
    { method: "agents.events", input: { pluginId: "my-plugin", sessionId: "s", after: 12 } },
    { method: "agents.send", input: { pluginId: "my-plugin", sessionId: "s", text: "question" } },
  ]);
  stop();
  expect(changes).toBe(0);
});

test("real Pi adapter streams OpenAI-compatible tool calls and replays tool results", async () => {
  const requests: Record<string, unknown>[] = [];
  const sse = (chunks: object[]) =>
    new Response(
      chunks.map((chunk) => "data: " + JSON.stringify(chunk) + "\n\n").join("") +
        "data: [DONE]\n\n",
      { headers: { "content-type": "text/event-stream" } },
    );
  const fetcher = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(JSON.parse(String(init?.body)));
    return requests.length === 1
      ? sse([
          {
            id: "r1",
            choices: [
              {
                index: 0,
                delta: {
                  role: "assistant",
                  tool_calls: [
                    {
                      index: 0,
                      id: "c1",
                      type: "function",
                      function: { name: "web_search", arguments: '{"query":' },
                    },
                  ],
                },
                finish_reason: null,
              },
            ],
          },
          {
            choices: [
              {
                index: 0,
                delta: { tool_calls: [{ index: 0, function: { arguments: '"test"}' } }] },
                finish_reason: "tool_calls",
              },
            ],
          },
        ])
      : sse([
          {
            id: "r2",
            choices: [
              { index: 0, delta: { role: "assistant", content: "summary" }, finish_reason: "stop" },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 3, total_tokens: 13 },
          },
        ]);
  }) as typeof fetch;
  const f = await fixture(createAgentModel(undefined, fetcher));
  const s = f.create(["web_search"]);
  f.agents.send("test", s.id, "research");
  const done = await f.done(s.id);
  expect(done.error).toBeNull();
  expect(done.status).toBe("completed");
  expect(requests).toHaveLength(2);
  expect(requests[1]!.messages).toMatchObject([
    { role: "system", content: expect.stringContaining("Current host time:") },
    { role: "user" },
    { role: "assistant", tool_calls: [{ id: "c1" }] },
    { role: "tool", tool_call_id: "c1" },
  ]);
  expect(
    f
      .history(s.id)
      .filter((event) => event.type === "assistant/message")
      .at(-1),
  ).toMatchObject({
    message: { content: [{ type: "text", text: "summary" }], usage: { input: 10, output: 3 } },
  });
});

test("timeout stops the loop, duplicate call IDs are rejected and oversized output never executes", async () => {
  const f = await fixture(
    async (request) =>
      new Promise((_resolve, reject) =>
        request.signal.addEventListener("abort", () => reject(request.signal.reason), {
          once: true,
        }),
      ),
  );
  const s = f.create([], { timeoutMs: 1000 });
  f.agents.send("test", s.id, "test");
  expect((await f.done(s.id)).error).toContain("超时");
  const repeat = await fixture(async () => call("web_search", '{"query":"x"}'));
  const r = repeat.create(["web_search"]);
  repeat.agents.send("test", r.id, "test");
  expect((await repeat.done(r.id)).error).toContain("重复");
  expect(repeat.searches).toBe(1);
  const large = await fixture(async () => ({
    ...call("web_search"),
    content: [
      { type: "text", text: "x".repeat(170_000) },
      { type: "tool-call", id: "large", name: "web_search", arguments: '{"query":"x"}' },
    ],
  }));
  const l = large.create(["web_search"]);
  large.agents.send("test", l.id, "test");
  expect((await large.done(l.id)).error).toContain("160 KiB");
  expect(large.searches).toBe(0);
});

test("journal pagination stays bounded and unknown event types fail instead of being ignored", async () => {
  const f = await fixture(async () => answer());
  let s = f.create();
  for (let i = 0; i < 7; i++)
    s = f.agents.journal.commit(s, [
      {
        type: "assistant/attempt",
        turn: 0,
        step: i,
        content: [{ type: "text", text: "x".repeat(80_000) }],
        error: "test",
      },
    ]);
  const all: number[] = [];
  let after = 0;
  do {
    const page = f.agents.events("test", s.id, after);
    expect(Buffer.byteLength(JSON.stringify(page))).toBeLessThan(270_000);
    all.push(...page.events.map((event) => event.seq));
    after = page.next;
    if (!page.hasMore) break;
  } while (true);
  expect(all).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(
    agentEventPage.safeParse({
      events: [{ type: "future-required", sessionId: s.id, seq: 9, time: 1 }],
      next: 9,
      hasMore: false,
    }).success,
  ).toBe(false);
});

test("storage failure never releases an executable tool request or silently resumes the session", async () => {
  let execute = 0;
  const f = await fixture(async () => {
    execute++;
    return call("web_search", '{"query":"test"}');
  });
  const s = f.create(["web_search"]);
  const commit = f.agents.journal.commit.bind(f.agents.journal);
  f.agents.journal.commit = (session, events) => {
    if (events.some((event) => event.type === "assistant/message") || execute > 0)
      throw new Error("disk full");
    return commit(session, events);
  };
  f.agents.send("test", s.id, "test");
  await f.done(s.id);
  expect(f.agents.get("test", s.id).session.error).toContain("持久化失败");
  expect(f.searches).toBe(0);
  expect(() => f.agents.send("test", s.id, "retry")).toThrow("持久化未完成");
  f.agents.journal.commit = commit;
  await f.reopen();
  expect(f.agents.get("test", s.id).session.status).toBe("interrupted");
});

test("provider HTTP failures do not automatically resend or leak the configured key", async () => {
  let requests = 0;
  const fetcher = (async () => {
    requests++;
    return Response.json({ error: { message: "failed fixture-key" } }, { status: 503 });
  }) as unknown as typeof fetch;
  const f = await fixture(createAgentModel(undefined, fetcher));
  const s = f.create();
  f.agents.send("test", s.id, "test");
  const done = await f.done(s.id);
  expect(done.status).toBe("failed");
  expect(done.error).not.toContain("fixture-key");
  expect(requests).toBe(1);
});

test("live revisions stay monotonic through completion and completion listeners can start the next turn", async () => {
  const f = await fixture(async (request) => {
    for (let i = 0; i < 30; i++) request.partial(answer(String(i)));
    return answer();
  });
  const s = f.create();
  let next = false;
  let maximum = 0;
  const off = f.agents.client("test").onChange((change) => {
    const snapshot = f.agents.get("test", s.id);
    expect(snapshot.revision).toBeGreaterThanOrEqual(maximum);
    maximum = snapshot.revision;
    if (change.status === "completed" && !next) {
      next = true;
      f.agents.send("test", s.id, "follow-up");
    }
  });
  f.agents.send("test", s.id, "first");
  expect((await f.done(s.id)).turn).toBe(2);
  expect(f.agents.get("test", s.id).revision).toBeGreaterThanOrEqual(maximum);
  off();
  await f.reopen();
  expect(f.agents.get("test", s.id).revision).toBeGreaterThanOrEqual(maximum);
});

test("oversized tool results become bounded model-visible errors", async () => {
  let step = 0;
  const tools: PluginAgentTools = {
    huge: {
      definition: defineTool("huge", z.object({}), () => ({
        content: [{ type: "text", text: "unused" }],
      })),
      execute: () => ({ content: [{ type: "text", text: "x".repeat(100_000) }] }),
    },
  };
  const f = await fixture(async (request) => {
    if (++step === 1) return call("huge");
    expect(request.messages.at(-1)).toMatchObject({
      role: "tool",
      isError: true,
      content: [{ type: "text", text: expect.stringContaining("96 KiB") }],
    });
    return answer();
  }, tools);
  const s = f.create(["huge"]);
  f.agents.send("test", s.id, "test");
  expect((await f.done(s.id)).status).toBe("completed");
});
