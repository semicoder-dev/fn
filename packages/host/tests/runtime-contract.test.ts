import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Context } from "@deepseek-ai/cordis";
import { fixtureHost, fixturePlugin } from "./fixture.ts";

declare module "@deepseek-ai/cordis" {
  interface Context {
    contractDependency: { value: string };
  }
}
const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const finish of cleanup.splice(0).reverse()) await finish();
});
function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
async function until(predicate: () => boolean) {
  const deadline = Date.now() + 2000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error("Contract condition did not settle");
    await Bun.sleep(2);
  }
}
async function fixture() {
  const dataDirectory = await mkdtemp(join(tmpdir(), "fn-runtime-contract-"));
  cleanup.push(() => rm(dataDirectory, { recursive: true, force: true }));
  const host = await fixtureHost(dataDirectory);
  cleanup.push(() => host.close());
  return { host, dataDirectory };
}
test("a failed durable tool-call checkpoint prevents the actual tool side effect", async () => {
  const oldNoProxy = process.env.NO_PROXY;
  process.env.NO_PROXY = "localhost,127.0.0.1";
  cleanup.push(async () => {
    if (oldNoProxy === undefined) delete process.env.NO_PROXY;
    else process.env.NO_PROXY = oldNoProxy;
  });
  let dispatched = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch() {
      const delta = {
        tool_calls: [
          {
            index: 0,
            id: "call-durable",
            type: "function",
            function: { name: "side_effect", arguments: "{}" },
          },
        ],
      };
      const chunks = [delta, {}].map(
        (value, index) =>
          "data: " +
          JSON.stringify({
            id: "checkpoint-response",
            object: "chat.completion.chunk",
            created: 0,
            model: "test",
            choices: [{ index: 0, delta: value, finish_reason: index ? "tool_calls" : null }],
          }),
      );
      return new Response([...chunks, "data: [DONE]", ""].join("\n\n"), {
        headers: { "content-type": "text/event-stream" },
      });
    },
  });
  cleanup.push(async () => {
    await server.stop(true);
  });
  const { host, dataDirectory } = await fixture();
  await fixturePlugin(host.ctx, "durability", {
    inject: ["tools", "sessionController"],
    apply(ctx: Context) {
      const target = ctx.sessionController.registerTarget({ id: "durability", name: "Durability" });
      target.context.tools.register({
        name: "side_effect",
        description: "Must not run when durable logging fails",
        parameters: { type: "object", properties: {}, additionalProperties: false },
        output: {
          schema: { type: "string" },
          render: (_, value) => [{ type: "text", text: String(value) }],
        },
        execute: async () => {
          dispatched++;
          return "effect committed";
        },
        isConcurrencySafe: () => false,
      });
    },
  });
  const connection = await host.ctx.connections.create({
    name: "Checkpoint fixture",
    provider: "contract-fixture",
    auth: "api-key",
    profile: {
      api: "openai-completions",
      baseURL: server.url.href,
      models: [{ id: "test", contextWindow: 4096, maxTokens: 128 }],
    },
  });
  await host.ctx.connections.setApiKey(connection.id, "fixture-not-a-secret");
  const session = await host.ctx.sessionController.createSession({
    targetId: "durability",
    connectionId: connection.id,
    modelId: "test",
    policy: "automatic",
  });
  const fault = new Database(join(dataDirectory, "sessions/events.sqlite"));
  cleanup.push(async () => {
    fault.close();
  });
  fault.exec(`CREATE TRIGGER fail_tool_checkpoint BEFORE INSERT ON fn_session_events
    WHEN json_extract(NEW.event, '$.type') = 'tool/call'
    BEGIN SELECT RAISE(FAIL, 'contract-injected-write-failure'); END;`);
  await host.ctx.sessionController.send(session.id, "Call side_effect", "checkpoint-request");
  const agent = await host.ctx.sessionController.agent(session.id);
  await agent.whenIdle();
  expect(agent.session.snapshotEvents().some((event) => event.type === "tool/call")).toBe(true);
  expect(dispatched).toBe(0);
  expect(
    fault
      .query<{ count: number }, []>(
        `SELECT count(*) AS count FROM fn_session_events WHERE json_extract(event, '$.type') = 'tool/call'`,
      )
      .get()?.count,
  ).toBe(0);
  await expect(host.ctx.sessionPersistence.flush()).rejects.toThrow();
  // Persistence remains failed closed through shutdown; the normal cleanup is
  // idempotent after this explicit close reports the intentional fault.
  await host.close().catch(() => {});
}, 15_000);
