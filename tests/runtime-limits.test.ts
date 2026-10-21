import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import api from "../shared/runtime-api.ts";
import { boundedPage, checkedKvValue, jsonBytes, MAX_KV_VALUE_BYTES, MAX_LIST_PAGE_BYTES } from "../packages/runtime/src/limits.ts";
import { RuntimeStore } from "../packages/runtime/src/store.ts";
import { createBrowserHost, readAllPages, type ClientApplication } from "../packages/sdk/src/cordis-client.tsx";
type Context = ReturnType<typeof createBrowserHost>["ctx"];

const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => { for (const finish of cleanup.splice(0).reverse()) await finish(); });

test("all model and session pages survive count and UTF-8 budgets without dropped items", async () => {
  const models = Array.from({ length: 237 }, (_, index) => ({ id: String(index), name: "模型".repeat(1500) }));
  const offsets: number[] = [];
  const collected = await readAllPages(async (offset, limit) => {
    offsets.push(offset);
    const page = boundedPage(models, offset, limit);
    expect(page.items.length).toBeLessThanOrEqual(100);
    expect(jsonBytes(page)).toBeLessThanOrEqual(MAX_LIST_PAGE_BYTES);
    expect(api.methods["connections.models"].output.safeParse(page).success).toBe(true);
    return page;
  });
  expect(collected).toEqual(models);
  expect(offsets.length).toBeGreaterThan(3);
  const sessions = models.map(model => ({
    id: model.id, appId: "sample", connectionId: "connection", modelId: "model",
    title: `会话${model.id}`, createdAt: 0, updatedAt: 0, archived: false, policy: "controlled" as const, status: "idle" as const,
  }));
  expect(await readAllPages(async (offset, limit) => {
    const page = boundedPage(sessions, offset, limit);
    expect(api.methods["sessions.list"].output.safeParse(page).success).toBe(true);
    return page;
  })).toEqual(sessions);
  expect(boundedPage(models, models.length, 100)).toEqual({ items: [], nextOffset: models.length, hasMore: false });
  expect(() => boundedPage(models, -1, 100)).toThrow("Invalid list page");
  expect(() => boundedPage(models, 0, 101)).toThrow("Invalid list page");
});

test("SDK KV list automatically fetches every bounded page", async () => {
  const values = Array.from({ length: 9 }, (_, index) => ({ key: `key-${index}`, value: "汉".repeat(80_000) }));
  let application!: ClientApplication;
  let requests = 0;
  const host = createBrowserHost({
    call: async (method, params) => {
      expect(method).toBe("apps.kv.list");
      expect(params.appId).toBe("sample");
      const page = boundedPage(values, Number(params.offset), Number(params.limit));
      expect(jsonBytes(page)).toBeLessThanOrEqual(MAX_LIST_PAGE_BYTES);
      expect(api.methods["apps.kv.list"].output.safeParse(page).success).toBe(true);
      requests++;
      return page;
    },
  });
  cleanup.push(() => host.dispose());
  await host.load("sample", { inject: ["clientApp"], apply(ctx: Context) { application = ctx.clientApp; } });
  expect(await application.kv.list()).toEqual(values);
  expect(requests).toBeGreaterThan(1);
});

test("oversized UTF-8 KV values are rejected before storage and by the RPC contract", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-runtime-limits-"));
  cleanup.push(() => rm(directory, { recursive: true, force: true }));
  const store = new RuntimeStore(join(directory, "state.sqlite"));
  cleanup.push(async () => store.close());
  const kv = store.kv("sample");
  const maximum = "a".repeat(MAX_KV_VALUE_BYTES - 2); // JSON quotes count towards the limit.
  kv.set("value", maximum);
  expect(kv.get("value")).toBe(maximum);
  const oversized = "汉".repeat(90_000); // Fewer JS characters, more than 256 KiB UTF-8.
  expect(oversized.length).toBeLessThan(MAX_KV_VALUE_BYTES);
  expect(() => kv.set("value", oversized)).toThrow("256 KiB");
  expect(kv.get("value")).toBe(maximum);
  expect(() => checkedKvValue(oversized)).toThrow("256 KiB");
  expect(api.methods["apps.kv.set"].input.safeParse({ appId: "sample", key: "value", value: oversized }).success).toBe(false);
  expect(api.methods["apps.kv.get"].output.safeParse(oversized).success).toBe(false);
  expect(jsonBytes({ method: "apps.kv.set", params: { appId: "sample", key: "value", value: maximum } }))
    .toBeLessThan(1024 * 1024);
});

test("malformed or stalled pagination rejects instead of returning partial lists or looping", async () => {
  await expect(readAllPages(async () => ({ items: [], nextOffset: 0, hasMore: true })))
    .rejects.toThrow("cursor did not advance");
  await expect(readAllPages(async offset => {
    if (offset) throw new Error("transport disconnected");
    return { items: [1], nextOffset: 1, hasMore: true };
  })).rejects.toThrow("transport disconnected");
});
