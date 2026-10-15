import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { Store } from "../backend/store";
import { Models } from "../backend/models";
import { Plugins } from "../backend/plugins";
import { Marketplaces } from "../backend/marketplaces";
import { download } from "../backend/download";
import { compareVersions, marketIndex, type MarketEntry } from "../shared/marketplace";
import { archiveFixture, waitFor } from "./plugin-fixture";
const cleanups: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});
async function setup() {
  const directory = await mkdtemp(join(tmpdir(), "market-test-"));
  const store = new Store(directory);
  await store.open();
  const models = new Models(
    store,
    () => {},
    () => {},
  );
  const responses = new Map<string, Uint8Array | string | number>();
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    init?.signal?.throwIfAborted();
    const body = responses.get(String(url));
    return typeof body === "number" || body === undefined
      ? new Response("failed", { status: body ?? 404 })
      : new Response(typeof body === "string" ? body : new Uint8Array(body));
  }) as unknown as typeof fetch;
  const markets = new Marketplaces(store, () => {}, fetcher);
  const plugins = new Plugins(store, models, () => {}, markets, fetcher);
  await plugins.open();
  cleanups.push(async () => {
    await markets.stop();
    await plugins.stop();
    await models.stop();
    await rm(directory, { recursive: true, force: true });
  });
  const market = await markets.add("Fixture", "https://fixture.test/index.json");
  async function release(version: string, backend?: string, id = "sample") {
    const { archive, pkg } = await archiveFixture(
      join(directory, `${id}-${version}-${crypto.randomUUID()}`),
      { id, version, backend },
    );
    const bytes = await Bun.file(archive).bytes();
    const entry: MarketEntry = {
      id,
      packageName: pkg.name,
      version,
      name: id,
      description: "Fixture",
      icon: "T",
      color: "#123456",
      sdkVersion: "0.3",
      url: `https://fixture.test/${id}-${version}.tgz`,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
    responses.set(entry.url, bytes);
    responses.set(
      market.url,
      JSON.stringify({ schemaVersion: 1, name: "Fixture", plugins: [entry] }),
    );
    return { entry, archive };
  }
  async function finish() {
    await waitFor(() => plugins.listJobs()[0]?.status !== "installing");
    return plugins.listJobs()[0]!;
  }
  return { directory, store, models, plugins, markets, responses, market, release, finish };
}
test("empty host starts with a removable official market and persists source preferences", async () => {
  const f = await setup();
  expect(f.plugins.list()).toEqual([]);
  expect(f.markets.list()[0]?.id).toBe("official");
  await f.markets.remove("official");
  await f.markets.update(f.market.id, { name: "Renamed", enabled: false });
  const reopened = new Store(f.directory);
  await reopened.open();
  expect(reopened.value.marketplaces).toHaveLength(1);
  expect(reopened.value.marketplaces[0]).toMatchObject({ name: "Renamed", enabled: false });
  await expect(f.markets.add("Duplicate", f.market.url)).rejects.toThrow("已存在");
  await expect(f.markets.add("Insecure", "http://fixture.test/index")).rejects.toThrow();
});
test("catalog validates duplicate IDs and versions, paginates, and retains cache on per-source failure", async () => {
  const f = await setup();
  const { entry } = await f.release("1.0.0");
  expect(compareVersions("1.10.0", "1.2.9")).toBeGreaterThan(0);
  expect(() => compareVersions("1.0.0-beta", "1.0.0")).toThrow();
  expect(
    marketIndex.safeParse({ schemaVersion: 1, name: "Duplicate", plugins: [entry, entry] }).success,
  ).toBe(false);
  f.responses.set(
    f.market.url,
    JSON.stringify({
      schemaVersion: 1,
      name: "Many",
      plugins: Array.from({ length: 55 }, (_, i) => ({ ...entry, id: `plugin-${i}` })),
    }),
  );
  await f.markets.refresh();
  expect(f.markets.list().find((m) => m.id === "official")?.error).toContain("404");
  const page = f.markets.catalog({ offset: 20, limit: 20 }, []);
  expect(page.items).toHaveLength(20);
  expect(page.nextOffset).toBe(40);
  expect(Buffer.byteLength(JSON.stringify(page))).toBeLessThan(1024 * 1024);
  f.responses.set(f.market.url, "invalid json");
  await f.markets.refresh(f.market.id);
  expect(f.markets.catalog({}, []).total).toBe(55);
  expect(f.markets.list().find((m) => m.id === f.market.id)?.updatedAt).not.toBeNull();
  await expect(f.markets.resolve(f.markets.binding(f.market.id), "plugin-0")).rejects.toThrow(
    "重新核对",
  );
});
test("market install, update, restart and uninstall preserve KV and replace the module", async () => {
  const f = await setup();
  const backend = (version: string) =>
    `export default { methods: { version: { description: "Version", inputSchema: {}, execute: () => "${version}" } } }`;
  await f.release("1.0.0", backend("old"));
  f.plugins.installFromMarket(f.market.id, "sample");
  expect(await f.finish()).toMatchObject({ status: "completed" });
  await f.store.set("sample", "note", "saved");
  const oldURL = f.plugins.list()[0]!.clientURL;
  await f.release("1.1.0", backend("new"));
  await f.markets.refresh(f.market.id);
  expect(f.markets.catalog({}, f.plugins.list()).items[0]?.state).toBe("update");
  f.plugins.update("sample");
  expect(await f.finish()).toMatchObject({
    status: "completed",
    operation: "update",
    targetVersion: "1.1.0",
  });
  expect(await f.plugins.invoke("sample", "version", null)).toBe("new");
  expect(f.plugins.list()[0]?.clientURL).not.toBe(oldURL);
  expect(f.store.get("sample", "note")).toBe("saved");
  const restored = new Plugins(f.store, f.models, () => {});
  await restored.open();
  expect(restored.list()[0]?.version).toBe("1.1.0");
  await restored.stop();
  await f.plugins.uninstall("sample");
  expect(f.plugins.list()).toEqual([]);
  expect(f.store.get("sample", "note")).toBe("saved");
});
test("disabled plugin updates without activation and remains disabled", async () => {
  const f = await setup();
  await f.release("1.0.0");
  f.plugins.installFromMarket(f.market.id, "sample");
  await f.finish();
  await f.plugins.setEnabled("sample", false);
  await f.release(
    "2.0.0",
    'export default { methods: {}, activate() { throw Error("must not activate"); } }',
  );
  f.plugins.update("sample");
  expect(await f.finish()).toMatchObject({ status: "completed" });
  expect(f.plugins.list()[0]).toMatchObject({
    version: "2.0.0",
    enabled: false,
    status: "disabled",
  });
});
test("hash mismatch, identity mismatch and backend failure leave the old version intact", async () => {
  const f = await setup();
  await f.release("1.0.0");
  f.plugins.installFromMarket(f.market.id, "sample");
  await f.finish();
  const { entry } = await f.release("2.0.0");
  f.responses.set(entry.url, "corrupt");
  f.plugins.update("sample");
  expect((await f.finish()).message).toContain("SHA-256");
  await f.release("2.0.0");
  f.responses.set(
    f.market.url,
    JSON.stringify({
      schemaVersion: 1,
      name: "Wrong identity",
      plugins: [{ ...entry, version: "9.0.0" }],
    }),
  );
  f.plugins.update("sample");
  expect((await f.finish()).status).toBe("failed");
  await f.release(
    "2.0.0",
    'export default { methods: {}, activate() { throw Error("new activation failed"); } }',
  );
  f.plugins.update("sample");
  expect((await f.finish()).message).toContain("new activation failed");
  expect(f.plugins.list()[0]).toMatchObject({ version: "1.0.0", status: "active" });
  expect(f.store.value.plugins[0]?.version).toBe("1.0.0");
});
test("persistence failure rolls back activated replacement", async () => {
  const f = await setup();
  await f.release("1.0.0");
  f.plugins.installFromMarket(f.market.id, "sample");
  await f.finish();
  await f.release("2.0.0");
  const update = f.store.update.bind(f.store);
  f.store.update = async (change) => {
    const candidate = structuredClone(f.store.value);
    change(candidate);
    if (candidate.plugins.some((p) => p.version === "2.0.0")) throw new Error("disk full");
    return update(change);
  };
  f.plugins.update("sample");
  expect((await f.finish()).message).toContain("disk full");
  expect(f.plugins.list()[0]).toMatchObject({ version: "1.0.0", status: "active" });
  f.store.update = update;
});
test("installation stays running until rollback is complete and the next job can start", async () => {
  const f = await setup();
  const key = `rollback-${crypto.randomUUID()}`;
  let resume!: () => void;
  const state = { calls: 0, ready: new Promise<void>((resolve) => { resume = resolve; }) };
  const globals = globalThis as unknown as Record<string, unknown>;
  globals[key] = state;
  try {
    await f.release("1.0.0", `export default { methods: {}, activate() {
      const state = globalThis[${JSON.stringify(key)}];
      if (++state.calls === 2) return state.ready;
    } }`);
    f.plugins.installFromMarket(f.market.id, "sample");
    await f.finish();
    await f.release("2.0.0", 'export default { methods: {}, activate() { throw Error("rollback"); } }');
    f.plugins.update("sample");
    await waitFor(() => state.calls === 2);
    expect(f.plugins.listJobs()[0]?.status).toBe("installing");
    expect(f.plugins.busy()).toBe(true);
    resume();
    expect((await f.finish()).status).toBe("failed");
    expect(f.plugins.busy()).toBe(false);
    await f.release("2.0.0");
    f.plugins.update("sample");
    expect((await f.finish()).status).toBe("completed");
    expect(f.plugins.busy()).toBe(false);
  } finally {
    resume();
    await f.plugins.stop();
    delete globals[key];
  }
});
test("origin binding prevents cross-market updates and manual installations are never adopted", async () => {
  const f = await setup();
  const { entry, archive } = await f.release("1.0.0");
  const other = await f.markets.add("Other", "https://other.test/index.json");
  f.responses.set(other.url, JSON.stringify({ schemaVersion: 1, name: "Other", plugins: [entry] }));
  f.plugins.install(archive);
  await f.finish();
  await f.markets.refresh();
  expect(f.markets.catalog({}, f.plugins.list()).items.every((p) => p.state === "conflict")).toBe(
    true,
  );
  expect(() => f.plugins.update("sample")).toThrow("指定手动");
  await f.plugins.uninstall("sample");
  f.plugins.installFromMarket(f.market.id, "sample");
  await f.finish();
  expect(() => f.plugins.update("sample", archive)).toThrow("原市场");
  await f.markets.remove(f.market.id);
  f.plugins.update("sample");
  expect((await f.finish()).status).toBe("failed");
  expect(f.plugins.list()[0]?.status).toBe("active");
});
test("manual update rejects downgrade, preserves identity and blocks during a call", async () => {
  const f = await setup();
  const first = await f.release("1.0.0");
  f.plugins.install(first.archive);
  await f.finish();
  f.plugins.update("sample", first.archive);
  expect((await f.finish()).message).toContain("高于");
  let release!: () => void;
  const held = f.plugins.use(
    "sample",
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  expect(() => f.plugins.update("sample", first.archive)).toThrow("正在运行");
  release();
  await held;
  const second = await f.release("2.0.0");
  f.plugins.update("sample", second.archive);
  expect(() => f.plugins.install(first.archive)).toThrow("已有安装任务");
  expect((await f.finish()).status).toBe("completed");
  expect(f.plugins.list()[0]?.market).toBeNull();
});
test("download enforces streamed byte limits, redirect protocol and cancellation", async () => {
  const oversized = (async () => new Response(new Uint8Array(30))) as unknown as typeof fetch;
  await expect(
    download("https://fixture.test/file", 10, new AbortController().signal, oversized),
  ).rejects.toThrow("大小上限");
  const redirect = (async () =>
    new Response(null, {
      status: 302,
      headers: { location: "http://fixture.test/file" },
    })) as unknown as typeof fetch;
  await expect(
    download("https://fixture.test/file", 10, new AbortController().signal, redirect),
  ).rejects.toThrow();
  const signal = AbortSignal.abort();
  await expect(download("https://fixture.test/file", 100, signal, oversized)).rejects.toThrow();
});
test("stopping cancels download without saving installation", async () => {
  const f = await setup();
  await f.release("1.0.0");
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const fetcher = (async (_url: unknown, init: RequestInit) => {
    started();
    return new Promise<Response>((_resolve, reject) => {
      init.signal!.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
  }) as unknown as typeof fetch;
  const plugins = new Plugins(f.store, f.models, () => {}, f.markets, fetcher);
  await plugins.open();
  plugins.installFromMarket(f.market.id, "sample");
  await ready;
  await plugins.stop();
  expect(plugins.listJobs()[0]).toMatchObject({
    status: "failed",
    message: "应用关闭，安装已取消",
  });
  expect(f.store.value.plugins).toEqual([]);
});

test("incompatible SDK is visible but cannot install, and failed first activation leaves no record", async () => {
  const f = await setup();
  const { entry } = await f.release("1.0.0");
  f.responses.set(
    f.market.url,
    JSON.stringify({
      schemaVersion: 1,
      name: "Fixture",
      plugins: [{ ...entry, sdkVersion: "9.0" }],
    }),
  );
  await f.markets.refresh(f.market.id);
  expect(f.markets.catalog({}, []).items[0]?.state).toBe("incompatible");
  f.plugins.installFromMarket(f.market.id, "sample");
  expect((await f.finish()).message).toContain("不兼容");
  await f.release(
    "1.0.0",
    'export default { methods: {}, activate() { throw Error("activation failed"); } }',
  );
  f.plugins.installFromMarket(f.market.id, "sample");
  expect((await f.finish()).status).toBe("failed");
  expect(f.plugins.list()).toEqual([]);
  expect(f.store.value.plugins).toEqual([]);
});

test("source removed during archive download cannot commit and duplicate refreshes coalesce", async () => {
  const f = await setup();
  const { entry } = await f.release("1.0.0");
  let count = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const fetcher = (async () => {
    count++;
    await gate;
    return new Response(f.responses.get(f.market.url) as string);
  }) as unknown as typeof fetch;
  const markets = new Marketplaces(f.store, () => {}, fetcher);
  const one = markets.refresh(f.market.id),
    two = markets.refresh(f.market.id);
  expect(count).toBe(1);
  release();
  await Promise.all([one, two]);
  await markets.stop();
  const downloadFetcher = (async () => {
    await f.markets.remove(f.market.id);
    return new Response(new Uint8Array(f.responses.get(entry.url) as Uint8Array));
  }) as unknown as typeof fetch;
  const plugins = new Plugins(f.store, f.models, () => {}, f.markets, downloadFetcher);
  await plugins.open();
  plugins.installFromMarket(f.market.id, "sample");
  await waitFor(() => plugins.listJobs()[0]?.status !== "installing");
  expect(plugins.listJobs()[0]?.status).toBe("failed");
  expect(f.store.value.plugins).toEqual([]);
  await plugins.stop();
});
