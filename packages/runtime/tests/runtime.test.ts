import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { FnRuntime } from "../src/index.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => { for (const finish of cleanup.splice(0).reverse()) await finish(); });

function app(id: string) {
  return {
    manifest: { id, name: id, packageName: `fn-test-${id}`, version: "0.0.0" },
    plugin: {
      inject: ["app", "tools", "systemPrompt"],
      apply(ctx: Context) {
        ctx.app.method("put", (input) => { ctx.app.kv.set("value", input); return input; });
        ctx.app.chat({ id: "assistant", name: "Assistant" });
        ctx.tools.register({
          name: "identity", description: "Get this application's identity",
          parameters: { type: "object", properties: {}, additionalProperties: false },
          output: { schema: { type: "string" }, render: (_, value) => [{ type: "text", text: String(value) }] },
          execute: async () => id,
          isConcurrencySafe: () => true,
        });
      },
    },
  };
}
async function fixture(directory?: string) {
  const dataDirectory = directory ?? await mkdtemp(join(tmpdir(), "fn-runtime-"));
  if (!directory) cleanup.push(() => rm(dataDirectory, { recursive: true, force: true }));
  const host = await FnRuntime.open({ dataDirectory });
  cleanup.push(() => host.close());
  return { host, dataDirectory };
}

test("published kernel executes scoped tools, deduplicates input and resumes SQLite history", async () => {
  const oldNoProxy = process.env.NO_PROXY;
  process.env.NO_PROXY = "localhost,127.0.0.1";
  cleanup.push(async () => {
    if (oldNoProxy === undefined) delete process.env.NO_PROXY;
    else process.env.NO_PROXY = oldNoProxy;
  });
  const outputs: string[] = [];
  let requests = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    async fetch(request) {
      requests++;
      const body = await request.json() as { messages: { role: string; content?: string }[] };
      const tool = body.messages.findLast(message => message.role === "tool");
      if (tool) outputs.push(tool.content ?? "");
      const chunks = tool
        ? [{ content: "done" }, {}]
        : [{ tool_calls: [{ index: 0, id: `call-${requests}`, type: "function", function: { name: "identity", arguments: "{}" } }] }, {}];
      return new Response(chunks.map((delta, i) => "data: " + JSON.stringify({
        id: `reply-${requests}`, object: "chat.completion.chunk", created: 0, model: "test",
        choices: [{ index: 0, delta, finish_reason: i ? tool ? "stop" : "tool_calls" : null }],
      })).concat("data: [DONE]", "").join("\n\n"), { headers: { "content-type": "text/event-stream" } });
    },
  });
  cleanup.push(async () => { await server.stop(true); });
  const { host, dataDirectory } = await fixture();
  for (const id of ["one", "two"]) expect((await host.load(app(id))).status).toBe("active");
  const connection = await host.connections.create({
    name: "Fixture", provider: "fixture", auth: "api-key",
    profile: { api: "openai-completions", baseURL: server.url.href, models: [{ id: "test", contextWindow: 4096, maxTokens: 128 }] },
  });
  await host.connections.setApiKey(connection.id, "fixture-not-a-secret");
  const sessions = await Promise.all(["one", "two"].map(appId =>
    host.createSession({ appId, connectionId: connection.id, modelId: "test", policy: "automatic" })));
  await Promise.all(sessions.map(session => host.send(session.id, "Call identity", `request-${session.id}`)));
  await Promise.all(sessions.map(async session => (await host.agent(session.id)).whenIdle()));
  expect(outputs.sort()).toEqual(["one", "two"]);
  expect(requests).toBe(4);
  await host.send(sessions[0]!.id, "Call identity", `request-${sessions[0]!.id}`);
  expect(requests).toBe(4);
  const before = await host.events(sessions[0]!.id);
  expect(before.events.some(event => event.type === "tool/result")).toBe(true);
  await host.invoke("one", "put", { saved: true });
  await host.close();
  const { host: reopened } = await fixture(dataDirectory);
  await reopened.load(app("one"));
  const restored = await reopened.agent(sessions[0]!.id);
  expect(restored.status).toBe("idle");
  expect(restored.session.snapshotEvents().length).toBeGreaterThanOrEqual(before.events.length);
  expect(requests).toBe(4);
  await reopened.unload("one");
  expect(reopened.application("one").methods).toEqual([]);
  await expect(reopened.invoke("one", "put", null)).rejects.toThrow("unavailable");
}, 20000);

test("application scopes own registrations and pages do not own agent lifetime", async () => {
  const { host } = await fixture();
  await host.load(app("first"));
  await host.load(app("second"));
  await host.invoke("first", "put", "first-data");
  await host.invoke("second", "put", "second-data");
  expect(host.store.kv("first").get("value")).toBe("first-data");
  expect(host.store.kv("second").get("value")).toBe("second-data");
  await host.unload("first");
  expect(host.application("first").methods).toEqual([]);
  expect(host.application("second").methods).toEqual(["put"]);
  await host.enable("first");
  expect(host.application("first").methods).toEqual(["put"]);
  expect(host.store.kv("first").get("value")).toBe("first-data");
});
