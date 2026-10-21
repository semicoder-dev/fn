import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Context } from "@deepseek-ai/cordis";
import { LocalCredentialProvider } from "@deepseek-ai/dsh-credentials-local";
import { createLaunchEnvironmentSnapshot } from "@deepseek-ai/dsh-launch-environment";
import { recordKeyFor } from "@deepseek-ai/dsh-llm-pi-ai";
import { LlmRuntime } from "@deepseek-ai/dsh-llm";
import { createPiCredentialStore } from "../src/auth.ts";
import { ConnectionService } from "../src/connections.ts";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
});

async function directory() {
  const path = await mkdtemp(join(tmpdir(), "fn-auth-"));
  cleanup.push(() => rm(path, { recursive: true, force: true }));
  return path;
}

describe("Pi authentication bridge", () => {
  test("canonical OAuth payload roundtrips and concurrent refresh mutations stay serialized", async () => {
    const dataDirectory = await directory();
    const ctx = new Context();
    cleanup.push(() => ctx.fiber.dispose());
    ctx.reflect.provide("launchEnvironment", createLaunchEnvironmentSnapshot([]));
    await ctx.plugin(LocalCredentialProvider, {
      path: join(dataDirectory, "credentials.yaml"),
      watch: false,
    });
    const store = createPiCredentialStore(ctx.credentials);
    await store.modify("openai", async () => ({
      type: "oauth",
      access: "a",
      refresh: "r",
      expires: 1,
      account: "same",
      optional: undefined,
    }));
    const raw = await ctx.credentials.readRecord(recordKeyFor("openai"));
    expect(raw).toEqual({
      kind: "grant",
      payload: { type: "oauth", access: "a", refresh: "r", expires: 1, account: "same" },
    });
    const seen: number[] = [];
    await Promise.all(
      [1, 2].map(() =>
        store.modify("openai", async (credential) => {
          if (credential?.type !== "oauth") throw new Error("Missing test credential");
          seen.push(credential.expires);
          await Bun.sleep(5);
          return { ...credential, expires: credential.expires + 1 };
        }),
      ),
    );
    expect(seen).toEqual([1, 2]);
    expect(await store.read("openai")).toMatchObject({ expires: 3, account: "same" });
    await store.modify("openai", async () => undefined);
    expect(await store.read("openai")).toMatchObject({ expires: 3 });
    const cancel = new AbortController();
    await store.modify(
      "openai",
      async (credential) => {
        cancel.abort();
        return {
          ...credential!,
          type: "oauth",
          access: "rotated",
          refresh: "rotated-refresh",
          expires: 4,
        };
      },
      { signal: cancel.signal },
    );
    expect(await store.read("openai")).toMatchObject({
      access: "rotated",
      refresh: "rotated-refresh",
    });
    await store.delete("openai");
    expect(await store.read("openai")).toBeUndefined();
  });

  test("Pi API-key interaction persists to the adapter reference and signout removes it", async () => {
    const dataDirectory = await directory();
    const ctx = new Context();
    cleanup.push(() => ctx.fiber.dispose());
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(ConnectionService, { dataDirectory });
    const connection = await ctx.connections.create({
      name: "Login",
      provider: "openai",
      auth: "api-key",
    });
    const prompts: string[] = [];
    await ctx.connections.auth.login(connection.id, {
      notify() {},
      async prompt(prompt) {
        prompts.push(prompt.type);
        return "test-api-key";
      },
    });
    expect(prompts).toContain("secret");
    expect(ctx.connections.get(connection.id).configured).toBe(true);
    expect((await ctx.connections.listModels(connection.id)).length).toBeGreaterThan(0);
    const firstId = await readFile(join(dataDirectory, "installation-id"), "utf8");
    await ctx.connections.auth.logout(connection.id);
    expect(ctx.connections.get(connection.id).configured).toBe(false);
    await ctx.connections.auth.login(connection.id, {
      notify() {},
      prompt: async () => "other-test-key",
    });
    expect(await readFile(join(dataDirectory, "installation-id"), "utf8")).toBe(firstId);
    expect((await stat(join(dataDirectory, "installation-id"))).mode & 0o777).toBe(0o600);
  });

  test("cancellation aborts a pending login interaction and releases admission", async () => {
    const dataDirectory = await directory();
    const ctx = new Context();
    cleanup.push(() => ctx.fiber.dispose());
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(ConnectionService, { dataDirectory });
    const connection = await ctx.connections.create({
      name: "Cancel",
      provider: "openai",
      auth: "api-key",
    });
    const prompted = Promise.withResolvers<void>();
    const pending = ctx.connections.auth.login(connection.id, {
      notify() {},
      prompt: (prompt) =>
        new Promise((_resolve, reject) => {
          prompted.resolve();
          prompt.signal!.addEventListener("abort", () => reject(prompt.signal!.reason), {
            once: true,
          });
        }),
    });
    await prompted.promise;
    ctx.connections.auth.cancel(connection.id);
    await expect(pending).rejects.toThrow();
    expect(ctx.connections.isBusy()).toBe(false);
    expect(ctx.connections.get(connection.id).configured).toBe(false);
  });

  test("the unchanged pi-ai adapter reads and rotates the login bridge's grant once per account", async () => {
    const dataDirectory = await directory();
    const originalFetch = globalThis.fetch;
    const refreshes: string[] = [];
    const bearers: string[] = [];
    const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const request = new Request(input, init);
      if (request.url === "https://auth.openai.com/api/accounts/oauth/token") {
        const body = new URLSearchParams(await request.text());
        const id = body.get("client_id")!;
        refreshes.push(id);
        await Bun.sleep(5);
        return Response.json({
          access_token: `access-${id}`,
          refresh_token: `refresh-${id}`,
          scope: "chatgpt.tokens.use.direct",
          expires_in: 3600,
        });
      }
      if (request.url.startsWith("https://fn-model-fixture.invalid/")) {
        bearers.push(request.headers.get("authorization") ?? "");
        return new Response(
          [
            'data: {"id":"reply","object":"chat.completion.chunk","created":0,"model":"test-model","choices":[{"index":0,"delta":{"role":"assistant","content":"ok"},"finish_reason":null}]}',
            'data: {"id":"reply","object":"chat.completion.chunk","created":0,"model":"test-model","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
            "data: [DONE]",
            "",
          ].join("\n\n"),
          { headers: { "content-type": "text/event-stream" } },
        );
      }
      throw new Error("Unexpected external request in OAuth contract test");
    };
    globalThis.fetch = Object.assign(fakeFetch, {
      preconnect: originalFetch.preconnect,
    }) as typeof fetch;
    cleanup.push(async () => {
      globalThis.fetch = originalFetch;
    });
    const ctx = new Context();
    cleanup.push(() => ctx.fiber.dispose());
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(ConnectionService, { dataDirectory });
    const ids: string[] = [];
    for (const name of ["a", "b"]) {
      const connection = await ctx.connections.create({
        name,
        provider: "openai",
        auth: "oauth",
        profile: {
          api: "openai-completions",
          baseURL: "https://fn-model-fixture.invalid/v1",
          models: [
            {
              id: "test-model",
              name: "Test",
              input: ["text"],
              contextWindow: 4096,
              maxTokens: 256,
            },
          ],
        },
      });
      const target = ctx.connections.withConnection(connection.id, () =>
        ctx.connections.select("openai"),
      );
      await createPiCredentialStore(target.credentials!).modify("openai", async () => ({
        type: "oauth",
        clientId: name,
        access: `expired-${name}`,
        refresh: `previous-${name}`,
        expires: 1,
      }));
      ids.push(connection.id);
    }
    const results = await Promise.all(
      ids.flatMap((id) =>
        [1, 2].map(() =>
          ctx.connections.withConnection(id, async () => {
            const call = await ctx.llm.prepareCall({ provider: "openai", model: "test-model" });
            const result = [];
            for await (const chunk of call.stream({ ...call.config, messages: [], system: "Test" }))
              result.push(chunk);
            return result;
          }),
        ),
      ),
    );
    expect(refreshes.sort()).toEqual(["a", "b"]);
    expect(bearers.sort()).toEqual([
      "Bearer access-a",
      "Bearer access-a",
      "Bearer access-b",
      "Bearer access-b",
    ]);
    expect(
      results.every((chunks) =>
        chunks.some((chunk) => chunk.type === "finish" && chunk.reason.kind === "stop"),
      ),
    ).toBe(true);
    for (const [index, id] of ids.entries()) {
      const target = ctx.connections.withConnection(id, () => ctx.connections.select("openai"));
      const grant = await createPiCredentialStore(target.credentials!).read("openai");
      expect(grant).toMatchObject({
        access: `access-${index === 0 ? "a" : "b"}`,
        clientId: index === 0 ? "a" : "b",
      });
    }
  });
});
