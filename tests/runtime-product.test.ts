import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RuntimeProduct } from "../backend/runtime-product";
import type { GenerationApplication } from "../packages/runtime/src/generations";
const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true }))); });
const core = { "@semicoder/fn-sdk": "0.3.5", "@deepseek-ai/cordis": "4.0.5" };
const entry = { id: "example", packageName: "@test/example", name: "示例", description: "测试", version: "1.0.1", url: "https://example.test/plugin.tgz", sha256: "a".repeat(64), core };
async function setup(fetcher: typeof fetch = (async () => Response.json({ schemaVersion: 2, name: "市场", applications: [entry] })) as unknown as typeof fetch) {
  const root = await mkdtemp(join(tmpdir(), "fn-product-")); directories.push(root);
  const store = new RuntimeProduct(root, () => {}, fetcher); await store.open();
  await store.update(value => { value.markets = []; });
  await store.addMarket("测试市场", "https://example.test/index.json");
  return { root, store, id: store.listMarkets()[0]!.id };
}
test("product preferences and selected models persist independently of session history", async () => {
  const { store, root } = await setup();
  await Promise.all([
    store.update(value => { value.models.push({ connectionId: "a", id: "same", name: "模型一" }); }),
    store.update(value => { value.models.push({ connectionId: "b", id: "same", name: "模型二" }); }),
  ]);
  const applied: string[] = [];
  await store.appearance({ theme: "dark" }, async mode => { applied.push(mode); });
  const reopened = new RuntimeProduct(root, () => {}); await reopened.open();
  expect(reopened.value.models).toHaveLength(2);
  expect(reopened.value.appearance.theme).toBe("dark");
  expect(applied).toEqual(["dark"]);
  expect(store.busy()).toBe(false);
});
test("failed durable appearance commit restores the native appearance and previous preferences", async () => {
  const { store, root } = await setup();
  await rm(join(root, "product.json")); await mkdir(join(root, "product.json"));
  const applied: string[] = [];
  await expect(store.appearance({ theme: "dark" }, async mode => { applied.push(mode); })).rejects.toThrow();
  expect(applied).toEqual(["dark", "system"]);
  expect(store.value.appearance.theme).toBe("system");
});
test("market catalogs enforce core compatibility and original source binding", async () => {
  const { store, id } = await setup(); await store.refresh();
  expect(store.catalog([], core)[0]!.state).toBe("available");
  expect(store.catalog([], { ...core, "@deepseek-ai/cordis": "5.0.0" })[0]!.state).toBe("incompatible");
  const app: GenerationApplication = { id: entry.id, name: entry.name, version: "1.0.0", packageName: entry.packageName, entry: "/tmp/entry.ts", archive: "/tmp/app.tgz" };
  expect(store.catalog([app], core)[0]!.state).toBe("conflict");
  app.origin = { source: entry.url, marketId: id, marketURL: "https://example.test/index.json" };
  expect(store.catalog([app], core)[0]!.state).toBe("update");
  const resolved = await store.resolve(id, app.id, [app], core);
  expect(resolved.entry.sha256).toBe(entry.sha256);
  expect(resolved.origin.marketId).toBe(id);
  await expect(store.resolve(id, app.id, [{ ...app, version: "2.0.0" }], core)).rejects.toThrow("不能通过更新降级");
  await store.update(value => { value.markets[0]!.enabled = false; });
  expect(store.catalog([], core)).toEqual([]);
  await expect(store.resolve(id, app.id, [app], core)).rejects.toThrow();
});
test("refresh retains cached catalogs on failure but refuses installs; legacy indexes are rejected", async () => {
  let response: unknown = { schemaVersion: 2, name: "市场", applications: [entry] };
  const { store, id } = await setup((async () => Response.json(response)) as unknown as typeof fetch);
  await store.refresh();
  response = { schemaVersion: 1, plugins: [] }; await store.refresh();
  expect(store.listMarkets()[0]!.error).toContain("旧插件协议");
  expect(store.catalog([], core)).toHaveLength(1);
  await expect(store.resolve(id, entry.id, [], core)).rejects.toThrow("旧插件协议");
  await expect(store.addMarket("重复", "https://example.test/index.json")).rejects.toThrow("已存在");
  await expect(store.addMarket("不安全", "http://example.test/index.json")).rejects.toThrow();
});
test("market refresh is coalesced, visible as busy, and cancelled during shutdown", async () => {
  let calls = 0;
  const { store } = await setup((async (_url, init) => {
    calls++;
    return await new Promise<Response>((_resolve, reject) => init!.signal!.addEventListener("abort", () => reject(init!.signal!.reason), { once: true }));
  }) as typeof fetch);
  const first = store.refresh(), second = store.refresh();
  expect(store.busy()).toBe(true); expect(calls).toBe(1);
  await store.stop(); await Promise.all([first, second]);
  expect(store.busy()).toBe(false);
});
