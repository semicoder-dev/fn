import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Context } from "@deepseek-ai/cordis";
import { LlmAdapter, LlmRuntime, type StreamChunk } from "@deepseek-ai/dsh-llm";
import { ConnectionLlmRegistry, ConnectionService } from "../src/connections.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});

async function host(directory?: string) {
  const dataDirectory = directory ?? (await mkdtemp(join(tmpdir(), "fn-connections-")));
  if (directory === undefined)
    cleanup.push(() => rm(dataDirectory, { recursive: true, force: true }));
  const ctx = new Context();
  cleanup.push(() => ctx.fiber.dispose());
  await ctx.plugin(LlmRuntime);
  await ctx.plugin(ConnectionService, { dataDirectory });
  return { ctx, dataDirectory, connections: ctx.connections };
}

describe("connection scopes with published dsh adapters", () => {
  test("profile size is limited by UTF-8 bytes rather than JavaScript characters", async () => {
    const { connections } = await host();
    const displayName = "汉".repeat(90_000);
    expect(displayName.length).toBeLessThan(256 * 1024);
    await expect(connections.create({
      name: "oversized", provider: "openai", auth: "api-key", profile: { displayName },
    })).rejects.toThrow("256 KiB of UTF-8 JSON");
    expect(connections.list()).toHaveLength(0);
  });

  test("same provider has isolated keys, canonical models and persistent fixed bindings", async () => {
    const { ctx, connections, dataDirectory } = await host();
    const a = await connections.create({ name: "A", provider: "openai", auth: "api-key" });
    const b = await connections.create({ name: "B", provider: "openai", auth: "api-key" });
    await connections.setApiKey(a.id, "test-key-a");
    await connections.setApiKey(b.id, "test-key-b");
    expect(ctx.llm.listProviders()).toEqual([{ id: "openai", name: "openai" }]);
    const aModels = await connections.listModels(a.id);
    expect(aModels.length).toBeGreaterThan(0);
    expect(aModels.every((model) => model.provider === "openai")).toBe(true);
    await connections.bindSession("session-a", a.id);
    await expect(connections.bindSession("session-a", b.id)).rejects.toThrow("cannot change");
    await expect(connections.setApiKey(a.id, "replacement")).rejects.toThrow("new connection");
    expect(() => ctx.llm.listModels("openai")).toThrow("explicit connection");
    const prepared = await connections.withConnection(a.id, () =>
      ctx.llm.prepareCall({ provider: "openai", model: aModels[0]!.id }),
    );
    expect(prepared.config.provider).toBe("openai");
    expect(JSON.stringify(connections.list())).not.toContain("test-key");
    const metadata = await readFile(join(dataDirectory, "connections.json"), "utf8");
    expect(metadata).not.toContain("test-key");
    const aPath = join(dataDirectory, "credentials", a.id, "credentials.yaml");
    expect((await stat(aPath)).mode & 0o777).toBe(0o600);
    expect(await readFile(aPath, "utf8")).toContain("test-key-a");
    expect(await readFile(aPath, "utf8")).not.toContain("test-key-b");
    await ctx.fiber.dispose();
    const restarted = await host(dataDirectory);
    expect(restarted.connections.connectionForSession("session-a")).toBe(a.id);
    expect(restarted.connections.get(a.id).configured).toBe(true);
  });

  test("ambient process keys cannot configure a connection", async () => {
    const before = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "ambient-must-not-be-used";
    try {
      const { connections } = await host();
      const value = await connections.create({
        name: "Empty",
        provider: "openai",
        auth: "api-key",
      });
      expect(value.configured).toBe(false);
      await expect(connections.listModels(value.id)).rejects.toThrow("no saved credential");
      expect(connections.auth.methods("openai").some((method) => method.id === "oauth")).toBe(true);
    } finally {
      if (before === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = before;
    }
  });

  test("registration capture follows atomic replacements and automatic fiber cleanup", async () => {
    const ctx = new Context();
    cleanup.push(() => ctx.fiber.dispose());
    await ctx.plugin(ConnectionLlmRegistry);
    const registry = ctx.llm as ConnectionLlmRegistry;
    class Adapter extends LlmAdapter {
      async *stream(): AsyncIterable<StreamChunk> {
        /* no external request */
      }
    }
    const adapter = new Adapter();
    let replace: (routes: string[]) => void = () => {};
    const fiber = await ctx.inject(["llm"], (scope) => {
      const handle = scope.llm.registerAdapter(["first"], adapter);
      replace = (routes) => handle.replace(routes);
    });
    expect(registry.adapterFor("first")).toBe(adapter);
    replace(["second"]);
    expect(() => registry.adapterFor("first")).toThrow();
    expect(registry.adapterFor("second")).toBe(adapter);
    await fiber.dispose();
    expect(() => registry.adapterFor("second")).toThrow();
    expect(ctx.llm.listProviders()).toEqual([]);
  });

  test("parallel HTTP calls use their connection key without rewriting provider", async () => {
    const headers: string[] = [];
    const previousNoProxy = process.env.NO_PROXY;
    process.env.NO_PROXY = "127.0.0.1,localhost";
    cleanup.push(async () => {
      if (previousNoProxy === undefined) delete process.env.NO_PROXY;
      else process.env.NO_PROXY = previousNoProxy;
    });
    const server = Bun.serve({
      port: 0,
      hostname: "127.0.0.1",
      fetch(request) {
        headers.push(request.headers.get("authorization") ?? "");
        return new Response(
          [
            'data: {"id":"reply","object":"chat.completion.chunk","created":0,"model":"test-model","choices":[{"index":0,"delta":{"role":"assistant","content":"ok"},"finish_reason":null}]}',
            'data: {"id":"reply","object":"chat.completion.chunk","created":0,"model":"test-model","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
            "data: [DONE]",
            "",
          ].join("\n\n"),
          { headers: { "content-type": "text/event-stream" } },
        );
      },
    });
    cleanup.push(async () => {
      await server.stop(true);
    });
    const { ctx, connections } = await host();
    const profile = {
      api: "openai-completions",
      baseURL: server.url.href + "v1",
      models: [
        {
          id: "test-model",
          name: "Test",
          contextWindow: 4096,
          maxTokens: 256,
          input: ["text" as const],
        },
      ],
    };
    const ids: string[] = [];
    for (const name of ["first", "second"]) {
      const connection = await connections.create({
        name,
        provider: "gateway",
        auth: "api-key",
        profile,
      });
      await connections.setApiKey(connection.id, `key-${name}`);
      ids.push(connection.id);
    }
    const replies = await Promise.all(
      ids.map((id) =>
        connections.withConnection(id, async () => {
          const call = await ctx.llm.prepareCall({ provider: "gateway", model: "test-model" });
          const chunks = [];
          for await (const chunk of call.stream({
            ...call.config,
            messages: [],
            system: "Say ok.",
          }))
            chunks.push(chunk);
          return chunks;
        }),
      ),
    );
    if (headers.length === 0) throw new Error(JSON.stringify(replies));
    expect(headers.sort()).toEqual(["Bearer key-first", "Bearer key-second"]);
    expect(replies.every((chunks) => chunks.some((chunk) => chunk.type === "finish"))).toBe(true);
    const frozen = await connections.withConnection(ids[0]!, () =>
      ctx.llm.prepareCall({ provider: "gateway", model: "test-model" }),
    );
    await connections.withConnection(ids[1]!, async () => {
      for await (const _chunk of frozen.stream({ ...frozen.config, messages: [] })) {
        /* drain */
      }
    });
    expect(headers.at(-1)).toBe("Bearer key-first");
  });
});

test("preset discovery uses locked Pi providers; account refresh updates only that catalog and preserves endpoint identity", async () => {
  const { connections, dataDirectory, ctx } = await host();
  const providers = connections.auth.providers();
  const openai = providers.find(provider => provider.id === "openai")!;
  expect(openai.modelCount).toBeGreaterThan(0);
  expect(connections.auth.presetModels("openai").length).toBe(openai.modelCount);
  expect(connections.auth.presetModels("anthropic").every(model => model.api === "anthropic-messages")).toBe(true);
  const a = await connections.create({ name: "账号 A", provider: "openai", auth: "api-key" });
  const b = await connections.create({ name: "账号 B", provider: "openai", auth: "api-key" });
  await connections.setApiKey(a.id, "test-a"); await connections.setApiKey(b.id, "test-b");
  await connections.bindSession("saved-a", a.id);
  const original = await connections.listModels(b.id);
  const first = connections.auth.presetModels("openai")[0]!;
  connections.auth.refreshCatalog = async id => {
    expect(id).toBe(a.id);
    expect(connections.isBusy()).toBe(true);
    return [{ id: first.id, name: "当前账号模型", contextWindow: 32768, maxTokens: 4096, input: ["text"] }];
  };
  expect((await connections.refreshModels(a.id)).map(model => model.id)).toEqual([first.id]);
  expect((await connections.listModels(b.id)).length).toBe(original.length);
  expect(connections.connectionForSession("saved-a")).toBe(a.id);
  await expect(connections.update(a.id, { profile: { baseURL: "https://other.test/v1" } })).rejects.toThrow("new connection");
  await ctx.fiber.dispose();
  const reopened = await host(dataDirectory);
  expect((await reopened.connections.listModels(a.id)).map(model => model.id)).toEqual([first.id]);
});
