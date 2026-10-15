import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { WebTools, type WebServices } from "../backend/web";
import { Store } from "../backend/store";
import { Models } from "../backend/models";
import { Plugins } from "../backend/plugins";
import { registerFixture } from "./plugin-fixture";
import type { WebFetchResult, WebTask } from "@semicoder/fn-sdk/types";

const page: WebFetchResult = {
  url: "https://example.com",
  finalUrl: "https://example.com/",
  status: 200,
  contentType: "text/plain",
  title: "",
  format: "text",
  text: "hello",
  truncated: false,
};
const cleanups: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
});
function fixture(overrides: Partial<WebServices> = {}) {
  const changes: WebTask[] = [];
  const web = new WebTools((task) => changes.push(task), {
    now: Date.now,
    fetch: async () => ({ ...page }),
    search: async (input, deps) => ({
      text: input.query,
      results: [
        deps!.sources!.registerFetchedPage("https://example.com/" + input.query, input.query),
      ],
      engines: [{ engine: "baidu", status: "no_results", ok: true, count: 0, rawCount: 0 }],
    }),
    ...overrides,
  });
  cleanups.push(() => web.stop());
  return { web, changes };
}
const pendingFetch: WebServices["fetch"] = async (_, deps) => {
  deps?.signal?.throwIfAborted();
  return new Promise((_resolve, reject) =>
    deps!.signal!.addEventListener("abort", () => reject(deps!.signal!.reason), { once: true }),
  );
};

test("backend SDK returns independent source numbers and structured HTTP results", async () => {
  const { web } = fixture({ fetch: async () => ({ ...page, status: 404 }) });
  const client = web.client("a");
  const results = await Promise.all([
    client.search({ query: "first" }),
    client.search({ query: "second" }),
    web.client("b").search({ query: "third" }),
  ]);
  expect(results.map((result) => result.results[0]?.id)).toEqual([1, 1, 1]);
  expect(await client.fetch({ url: page.url })).toMatchObject({ status: 404, text: "hello" });
  expect(web.busy()).toBe(false);
});

test("network tasks validate inputs, ownership, concurrency and cancellation before execution", async () => {
  const { web } = fixture({ fetch: pendingFetch });
  expect(() => web.start("a", "search", { query: " " })).toThrow();
  expect(() => web.start("a", "fetch", { url: "file:///tmp/test" })).toThrow();
  const task = web.start("a", "fetch", { url: page.url });
  expect(() => web.get("b", task.id)).toThrow("不存在");
  await expect(web.cancel("b", task.id)).rejects.toThrow("不存在");
  for (let i = 1; i < 8; i++) web.start("a", "fetch", { url: page.url });
  expect(() => web.start("a", "fetch", { url: page.url })).toThrow("8");
  expect(await web.cancel("a", task.id)).toMatchObject({ status: "cancelled", result: null });
  expect((await web.cancel("a", task.id)).status).toBe("cancelled");
  await web.stop();
  expect(web.busy()).toBe(false);
  expect(() => web.start("a", "fetch", { url: page.url })).toThrow("退出");
});

test("AbortSignal reaches the transport; already aborted calls never start", async () => {
  let received: AbortSignal | undefined;
  const { web, changes } = fixture({
    fetch: async (input, deps) => {
      received = deps?.signal;
      return pendingFetch(input, deps);
    },
  });
  const ctrl = new AbortController();
  const promise = web.client("a").fetch({ url: page.url }, { signal: ctrl.signal });
  await Bun.sleep(0);
  ctrl.abort();
  await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  expect(received?.aborted).toBe(true);
  const count = changes.length;
  await expect(
    web.client("a").fetch({ url: page.url }, { signal: AbortSignal.abort() }),
  ).rejects.toThrow();
  expect(changes).toHaveLength(count);
});

test("serialized result size accounts for JSON escapes and failures are bounded", async () => {
  const { web } = fixture({ fetch: async () => ({ ...page, text: "\u0000".repeat(50_000) }) });
  await expect(web.client("a").fetch({ url: page.url })).rejects.toMatchObject({
    code: "result_too_large",
  });
  const { web: failed } = fixture({
    fetch: () => {
      throw new Error("failure");
    },
  });
  await expect(failed.client("a").fetch({ url: page.url })).rejects.toThrow("failure");
  expect(failed.busy()).toBe(false);
});

test("terminal results have TTL and capacity bounds, and snapshots cannot mutate host state", async () => {
  let now = 1;
  const { web, changes } = fixture({ now: () => now });
  await web.client("a").fetch({ url: page.url });
  const first = changes[0]!.id;
  web.get("a", first).result = null;
  expect(web.get("a", first).result).not.toBeNull();
  for (let i = 0; i < 32; i++) await web.client("a").fetch({ url: page.url });
  expect(() => web.get("a", first)).toThrow("过期");
  const last = changes.at(-1)!.id;
  now += 600_000;
  expect(() => web.get("a", last)).toThrow("过期");
});

test("plugin backend network calls and direct tasks block disable/update/uninstall, without persisting results", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-web-test-"));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  const store = new Store(join(directory, "data"));
  await store.open();
  await registerFixture(store, join(directory, "plugin"), {
    backend:
      'export default { methods: { page: { description: "web", inputSchema: {}, execute: (input, ctx) => ctx.web.fetch(input) } } }',
  });
  const models = new Models(
    store,
    () => {},
    () => {},
  );
  const { web } = fixture({ fetch: pendingFetch });
  const plugins = new Plugins(store, models, () => {}, undefined, fetch, web);
  await plugins.open();
  const before = await Bun.file(join(directory, "data/platform.json")).text();
  const task = web.start("translate", "fetch", { url: page.url });
  await expect(plugins.setEnabled("translate", false)).rejects.toThrow("正在运行");
  expect(() => plugins.update("translate")).toThrow("正在运行");
  await expect(plugins.uninstall("translate")).rejects.toThrow("正在运行");
  expect(plugins.busy()).toBe(true);
  await web.cancel("translate", task.id);
  const invocation = plugins.invoke("translate", "page", { url: page.url }).then(
    () => null,
    (error) => error,
  );
  await Bun.sleep(0);
  await web.stop();
  expect(await invocation).toMatchObject({ name: "AbortError" });
  expect(await Bun.file(join(directory, "data/platform.json")).text()).toBe(before);
  await plugins.setEnabled("translate", false);
  await expect(plugins.invoke("translate", "page", { url: page.url })).rejects.toThrow();
  await plugins.stop();
  await models.stop();
});
