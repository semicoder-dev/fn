import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { fixtureHost, fixturePlugin } from "./fixture.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const finish of cleanup.splice(0).reverse()) await finish();
});

function app(id: string) {
  return {
    inject: ["sessionController", "tools", "systemPrompt"],
    apply(ctx: Context) {
      const target = ctx.sessionController.registerTarget({ id, name: id });
      target.context.tools.register({
        name: "identity",
        description: "Get this application's identity",
        parameters: { type: "object", properties: {}, additionalProperties: false },
        output: {
          schema: { type: "string" },
          render: (_, value) => [{ type: "text", text: String(value) }],
        },
        execute: async () => id,
        isConcurrencySafe: () => true,
      });
    },
  };
}
async function fixture(directory?: string) {
  const dataDirectory = directory ?? (await mkdtemp(join(tmpdir(), "fn-runtime-")));
  if (!directory) cleanup.push(() => rm(dataDirectory, { recursive: true, force: true }));
  const host = await fixtureHost(dataDirectory);
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
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      requests++;
      const body = (await request.json()) as { messages: { role: string; content?: string }[] };
      const tool = body.messages.findLast((message) => message.role === "tool");
      if (tool) outputs.push(tool.content ?? "");
      const chunks = tool
        ? [{ content: "done" }, {}]
        : [
            {
              tool_calls: [
                {
                  index: 0,
                  id: `call-${requests}`,
                  type: "function",
                  function: { name: "identity", arguments: "{}" },
                },
              ],
            },
            {},
          ];
      return new Response(
        chunks
          .map(
            (delta, i) =>
              "data: " +
              JSON.stringify({
                id: `reply-${requests}`,
                object: "chat.completion.chunk",
                created: 0,
                model: "test",
                choices: [
                  { index: 0, delta, finish_reason: i ? (tool ? "stop" : "tool_calls") : null },
                ],
              }),
          )
          .concat("data: [DONE]", "")
          .join("\n\n"),
        { headers: { "content-type": "text/event-stream" } },
      );
    },
  });
  cleanup.push(async () => {
    await server.stop(true);
  });
  const { host, dataDirectory } = await fixture();
  for (const id of ["one", "two"]) await fixturePlugin(host.ctx, id, app(id));
  const connection = await host.ctx.connections.create({
    name: "Fixture",
    provider: "fixture",
    auth: "api-key",
    profile: {
      api: "openai-completions",
      baseURL: server.url.href,
      models: [{ id: "test", contextWindow: 4096, maxTokens: 128 }],
    },
  });
  await host.ctx.connections.setApiKey(connection.id, "fixture-not-a-secret");
  const sessions = await Promise.all(
    ["one", "two"].map((targetId) =>
      host.ctx.sessionController.createSession({
        targetId,
        connectionId: connection.id,
        modelId: "test",
        policy: "automatic",
      }),
    ),
  );
  await Promise.all(
    sessions.map((session) =>
      host.ctx.sessionController.send(session.id, "Call identity", `request-${session.id}`),
    ),
  );
  await Promise.all(
    sessions.map(async (session) =>
      (await host.ctx.sessionController.agent(session.id)).whenIdle(),
    ),
  );
  expect(outputs.sort()).toEqual(["one", "two"]);
  expect(requests).toBe(4);
  await host.ctx.sessionController.send(
    sessions[0]!.id,
    "Call identity",
    `request-${sessions[0]!.id}`,
  );
  expect(requests).toBe(4);
  const before = await host.ctx.sessionController.events(sessions[0]!.id);
  expect(before.events.some((event) => event.type === "tool/result")).toBe(true);
  await host.close();
  const { host: reopened } = await fixture(dataDirectory);
  const unload = await fixturePlugin(reopened.ctx, "one", app("one"));
  const restored = await reopened.ctx.sessionController.agent(sessions[0]!.id);
  expect(restored.status).toBe("idle");
  expect(restored.session.snapshotEvents().length).toBeGreaterThanOrEqual(before.events.length);
  expect(requests).toBe(4);
  await unload();
  expect(() => reopened.ctx.sessionController.target("one")).toThrow("unavailable");
}, 20000);
