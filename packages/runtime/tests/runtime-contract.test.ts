import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Context } from "@deepseek-ai/cordis";
import { FnRuntime } from "../src/index.ts";

declare module "@deepseek-ai/cordis" {
  interface Context { contractDependency: { value: string }; }
}
const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const finish of cleanup.splice(0).reverse()) await finish();
});
function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
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
  const host = await FnRuntime.open({ dataDirectory });
  cleanup.push(() => host.close());
  return { host, dataDirectory };
}
const manifest = (id: string) => ({ id, name: id, version: "0.0.0", packageName: `@fn-contract/${id}` });

test("Cordis dependency withdrawal removes owned registrations and reacquisition creates one fresh registration", async () => {
  const { host } = await fixture();
  const counts = { started: 0, disposed: 0 };
  const release = host.ctx.provide("contractDependency", { value: "first" });
  await host.load({
    manifest: manifest("dependency"),
    plugin: {
      inject: ["app", "contractDependency"],
      apply(ctx: Context) {
        counts.started++;
        const value = ctx.contractDependency.value;
        ctx.app.method("read", () => value);
        ctx.effect(() => async () => { await Bun.sleep(5); counts.disposed++; });
      },
    },
  });
  expect(await host.invoke("dependency", "read", null)).toBe("first");
  await release();
  await until(() => counts.disposed === 1 && host.application("dependency").methods.length === 0);
  await expect(host.invoke("dependency", "read", null)).rejects.toThrow();
  host.ctx.provide("contractDependency", { value: "second" });
  await until(() => host.application("dependency").methods.length === 1);
  expect(await host.invoke("dependency", "read", null)).toBe("second");
  expect(counts.started).toBe(2);
  await host.unload("dependency");
  expect(counts.disposed).toBe(2);
  expect(host.application("dependency").methods).toEqual([]);
});

test("disable and re-enable serialize with in-flight methods and asynchronous disposal", async () => {
  const { host } = await fixture();
  const methodStarted = deferred();
  const methodRelease = deferred();
  const cleanupStarted = deferred();
  const cleanupRelease = deferred();
  const order: string[] = [];
  let instances = 0;
  await host.load({
    manifest: manifest("lifecycle"),
    plugin: {
      inject: ["app"],
      apply(ctx: Context) {
        const instance = ++instances;
        order.push(`start-${instance}`);
        ctx.app.method("work", async () => {
          methodStarted.resolve();
          await methodRelease.promise;
          order.push("work-finished");
          return null;
        });
        ctx.effect(() => async () => {
          if (instance === 1) {
            cleanupStarted.resolve();
            await cleanupRelease.promise;
          }
          order.push(`disposed-${instance}`);
        });
      },
    },
  });
  const operation = host.invoke("lifecycle", "work", null);
  await methodStarted.promise;
  const disabled = host.unload("lifecycle");
  await expect(host.invoke("lifecycle", "work", null)).rejects.toThrow("unavailable");
  const enabled = host.enable("lifecycle");
  const enabledAgain = host.enable("lifecycle");
  // Attach a handler immediately while the assertion below waits for cleanup.
  const reenabled = Promise.all([enabled, enabledAgain]);
  void reenabled.catch(() => {});
  // Release gates even if assertions fail, so teardown cannot hang.
  try {
    await Bun.sleep(10);
    expect(instances).toBe(1);
    methodRelease.resolve();
    await cleanupStarted.promise;
    expect(order).toEqual(["start-1", "work-finished"]);
    cleanupRelease.resolve();
    await Promise.all([operation, disabled, reenabled]);
    expect(order).toEqual(["start-1", "work-finished", "disposed-1", "start-2"]);
    expect(host.application("lifecycle").methods).toEqual(["work"]);
  } finally {
    methodRelease.resolve();
    cleanupRelease.resolve();
    await Promise.allSettled([operation, disabled, reenabled]);
  }
});

test("a failed durable tool-call checkpoint prevents the actual tool side effect", async () => {
  const oldNoProxy = process.env.NO_PROXY;
  process.env.NO_PROXY = "localhost,127.0.0.1";
  cleanup.push(async () => {
    if (oldNoProxy === undefined) delete process.env.NO_PROXY;
    else process.env.NO_PROXY = oldNoProxy;
  });
  let dispatched = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    fetch() {
      const delta = { tool_calls: [{ index: 0, id: "call-durable", type: "function",
        function: { name: "side_effect", arguments: "{}" } }] };
      const chunks = [delta, {}].map((value, index) => "data: " + JSON.stringify({
        id: "checkpoint-response", object: "chat.completion.chunk", created: 0, model: "test",
        choices: [{ index: 0, delta: value, finish_reason: index ? "tool_calls" : null }],
      }));
      return new Response([...chunks, "data: [DONE]", ""].join("\n\n"),
        { headers: { "content-type": "text/event-stream" } });
    },
  });
  cleanup.push(async () => { await server.stop(true); });
  const { host, dataDirectory } = await fixture();
  await host.load({
    manifest: manifest("durability"),
    plugin: {
      inject: ["tools"],
      apply(ctx: Context) {
        ctx.tools.register({
          name: "side_effect", description: "Must not run when durable logging fails",
          parameters: { type: "object", properties: {}, additionalProperties: false },
          output: { schema: { type: "string" }, render: (_, value) => [{ type: "text", text: String(value) }] },
          execute: async () => { dispatched++; return "effect committed"; },
          isConcurrencySafe: () => false,
        });
      },
    },
  });
  const connection = await host.connections.create({
    name: "Checkpoint fixture", provider: "contract-fixture", auth: "api-key",
    profile: { api: "openai-completions", baseURL: server.url.href, models: [{ id: "test", contextWindow: 4096, maxTokens: 128 }] },
  });
  await host.connections.setApiKey(connection.id, "fixture-not-a-secret");
  const session = await host.createSession({ appId: "durability", connectionId: connection.id, modelId: "test", policy: "automatic" });
  const fault = new Database(join(dataDirectory, "sessions.sqlite"));
  cleanup.push(async () => { fault.close(); });
  fault.exec(`CREATE TRIGGER fail_tool_checkpoint BEFORE INSERT ON fn_session_events
    WHEN json_extract(NEW.event, '$.type') = 'tool/call'
    BEGIN SELECT RAISE(FAIL, 'contract-injected-write-failure'); END;`);
  await host.send(session.id, "Call side_effect", "checkpoint-request");
  const agent = await host.agent(session.id);
  await agent.whenIdle();
  expect(agent.session.snapshotEvents().some(event => event.type === "tool/call")).toBe(true);
  expect(dispatched).toBe(0);
  expect(fault.query<{ count: number }, []>(
    `SELECT count(*) AS count FROM fn_session_events WHERE json_extract(event, '$.type') = 'tool/call'`,
  ).get()?.count).toBe(0);
  await expect(host.ctx.sessionPersistence.flush()).rejects.toThrow();
  // Persistence remains failed closed through shutdown; the normal cleanup is
  // idempotent after this explicit close reports the intentional fault.
  await expect(host.close()).rejects.toThrow("shutdown failed");
}, 15_000);
