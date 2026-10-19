import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm, mkdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../backend/store";
import { Models, readSSE } from "../backend/models";
import { fixturePackage, registerFixture, archiveFixture } from "./plugin-fixture";
import { Plugins, containedFile, manifestSchema } from "../backend/plugins";
import { MAX_ICON_SVG_BYTES } from "../packages/sdk/src/manifest";
const directories: string[] = [];
const runners: Models[] = [];
afterEach(async () => {
  for (const model of runners.splice(0)) await model.stop();
  for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true });
});
async function setup(fetcher?: typeof fetch) {
  const dir = await mkdtemp(join(tmpdir(), "fn-test-"));
  directories.push(dir);
  const store = new Store(dir);
  await store.open();
  const models = new Models(
    store,
    () => {},
    () => {},
    fetcher,
  );
  runners.push(models);
  return { store, models, dir };
}
async function waitFor(predicate: () => boolean, ms = 5000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error("Timed out");
    await Bun.sleep(15);
  }
}
async function streamingSetup() {
  const fetcher = (async (_url: unknown, init: RequestInit) => {
    init.signal!.throwIfAborted();
    return new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'),
          );
          init.signal!.addEventListener("abort", () => controller.error(init.signal!.reason), {
            once: true,
          });
        },
      }),
    );
  }) as typeof fetch;
  const result = await setup(fetcher);
  const model = await result.models.save({
    name: "test",
    provider: "test",
    model: "test-model",
    baseURL: "http://localhost:1234/v1",
  });
  return { ...result, model };
}
test("model list starts empty and removed demo IDs cannot generate or erase legacy history", async () => {
  const { store, models, dir } = await setup();
  expect(models.list()).toEqual([]);
  await expect(models.start("translate", { modelId: "demo", prompt: "hello" })).rejects.toThrow(
    "模型不存在",
  );
  expect(store.value.runs).toHaveLength(0);
  const now = Date.now();
  await store.update((state) => {
    state.runs.push({
      id: "legacy",
      pluginId: "translate",
      modelId: "demo",
      title: "old",
      input: "old",
      output: "old sample",
      status: "completed",
      error: null,
      createdAt: now,
      updatedAt: now,
      revision: 1,
      demo: true,
    });
  });
  const restored = new Store(dir);
  await restored.open();
  expect(restored.value.runs[0]).toMatchObject({ id: "legacy", demo: true, output: "old sample" });
  const model = await models.save({
    name: "test",
    provider: "test",
    model: "test-model",
    baseURL: "http://localhost:1234/v1",
  });
  expect(models.list().map((item) => item.id)).toEqual([model.id]);
  await models.remove(model.id);
  expect(models.list()).toEqual([]);
});
test("KV serializes concurrent writes, isolates plugins, handles prototype keys and persists", async () => {
  const { store, dir } = await setup();
  await Promise.all([
    store.set("a", "note", "alpha"),
    store.set("b", "note", "beta"),
    store.set("__proto__", "constructor", { safe: true }),
  ]);
  expect(store.get("a", "note")).toBe("alpha");
  expect(store.get("b", "note")).toBe("beta");
  expect(store.get("missing", "constructor")).toBeNull();
  expect(store.get("__proto__", "constructor")).toEqual({ safe: true });
  const restored = new Store(dir);
  await restored.open();
  expect(restored.get("a", "note")).toBe("alpha");
  await expect(store.set("a", "huge", "x".repeat(65537))).rejects.toThrow("64 KiB");
});
test("SSE parser handles byte-split Chinese and CRLF frames", async () => {
  const bytes = new TextEncoder().encode('data: {"text":"你好"}\r\n\r\ndata: [DONE]\n\n');
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  const frames: string[] = [];
  for await (const frame of readSSE(stream)) frames.push(frame);
  expect(frames).toEqual(['{"text":"你好"}', "[DONE]"]);
});
test("real provider path sends system/user messages and redacts credentials", async () => {
  let requested: RequestInit | undefined;
  const fake = (async (_url: unknown, init: RequestInit) => {
    requested = init;
    return new Response(
      'data: {"choices":[{"delta":{"content":"你好"},"finish_reason":null}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
    );
  }) as typeof fetch;
  const { models, store } = await setup(fake);
  const model = await models.save({
    name: "test",
    provider: "test",
    model: "test-model",
    baseURL: "https://example.test/v1",
    apiKey: "test-secret",
  });
  expect(JSON.stringify(models.list())).not.toContain("test-secret");
  const run = await models.start("translate", {
    modelId: model.id,
    prompt: "hello",
    system: "translate",
  });
  await waitFor(() => !models.busy());
  expect(models.get("translate", run.id).output).toBe("你好");
  expect(models.get("translate", run.id).status).toBe("completed");
  expect(JSON.parse(requested!.body as string).messages).toEqual([
    { role: "system", content: "translate" },
    { role: "user", content: "hello" },
  ]);
  expect(store.value.runs[0]?.status).toBe("completed");
});
test("truncated provider stream fails rather than marking partial text complete", async () => {
  const { models } = await setup(
    (async () =>
      new Response(
        'data: {"choices":[{"delta":{"content":"partial"}}]}\n\n',
      )) as unknown as typeof fetch,
  );
  const model = await models.save({
    name: "test",
    provider: "test",
    model: "test",
    baseURL: "http://localhost:1234/v1",
  });
  const run = await models.start("translate", { modelId: model.id, prompt: "hello" });
  await waitFor(() => !models.busy());
  expect(models.get("translate", run.id).status).toBe("failed");
  expect(models.get("translate", run.id).output).toBe("partial");
});
test("provider cancellation retains partial state and blocks other plugin access", async () => {
  const { models, model } = await streamingSetup();
  const run = await models.start("translate", { modelId: model.id, prompt: "hello" });
  await waitFor(() => models.get("translate", run.id).output.length > 0);
  const stopped = await models.cancel("translate", run.id);
  expect(stopped.status).toBe("cancelled");
  expect(stopped.output.length).toBeGreaterThan(0);
  expect(() => models.get("other", run.id)).toThrow("不存在");
});
test("restart marks unfinished runs interrupted", async () => {
  const { models, model, dir } = await streamingSetup();
  const run = await models.start("translate", { modelId: model.id, prompt: "hello" });
  const restored = new Store(dir);
  await restored.open();
  expect(restored.value.runs[0]?.status).toBe("failed");
  await models.cancel("translate", run.id);
});
test("manifest rejects incompatible SDK and resource traversal / symlinks", async () => {
  const { dir } = await setup();
  await mkdir(join(dir, "package"));
  await Bun.write(join(dir, "outside.js"), "export default 1");
  await symlink(join(dir, "outside.js"), join(dir, "package", "escape.js"));
  await expect(containedFile(join(dir, "package"), "../outside.js")).rejects.toThrow();
  await expect(containedFile(join(dir, "package"), "escape.js")).rejects.toThrow();
  const pkg = structuredClone(fixturePackage);
  expect(manifestSchema.safeParse({ ...pkg.fn, sdkVersion: "9.0" }).success).toBe(false);
});
const iconFixture =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>';
test("declared SVG stays available when disabled or backend activation fails; other resources stay gated", async () => {
  const { store, models, dir } = await setup();
  const root = join(dir, "icon-plugin");
  await registerFixture(store, root, {
    iconSvg: iconFixture,
    backend:
      "export default { methods: {}, chat: { version: 1, onMessage() {}, onResponse() {} } }",
  });
  let plugins = new Plugins(store, models, () => {});
  const request = (path: string, method = "GET") =>
    new Request(`http://localhost/plugins/translate/${path}`, { method });
  await plugins.open();
  const info = plugins.list()[0]!;
  expect(info.iconURL).toStartWith("/api/plugins/translate/dist/icon.svg?v=");
  expect(plugins.chatCatalog()[0]).toMatchObject({ icon: "T" });
  expect(plugins.chatCatalog()[0]).not.toHaveProperty("iconURL");
  for (const status of ["active", "disabled"] as const) {
    if (status === "disabled") await plugins.setEnabled("translate", false);
    expect(plugins.list()[0]!.status).toBe(status);
    const response = await plugins.asset(request("dist/icon.svg"));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
    expect(await response.text()).toBe(iconFixture);
    expect((await plugins.asset(request("dist/icon.svg", "HEAD"))).body).toBeNull();
    expect((await plugins.asset(request("dist/backend.js"))).status).toBe(404);
  }
  expect((await plugins.asset(request("dist/client.js"))).status).toBe(404);
  await plugins.stop();
  plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list()[0]!.iconURL).toBe(info.iconURL);
  expect((await plugins.asset(request("dist/icon.svg"))).status).toBe(200);
  await plugins.stop();
  await registerFixture(store, join(dir, "broken-icon"), {
    id: "broken-icon",
    iconSvg: iconFixture,
    backend:
      'export default { methods: {}, activate() { throw Error("icon fixture activation"); } }',
  });
  plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list().find((info) => info.id === "broken-icon")!.status).toBe("error");
  expect(
    (await plugins.asset(new Request("http://localhost/plugins/broken-icon/dist/icon.svg"))).status,
  ).toBe(200);
  expect(
    (await plugins.asset(new Request("http://localhost/plugins/broken-icon/dist/client.js")))
      .status,
  ).toBe(404);
  await plugins.stop();
});

test("missing, oversized and escaping declared SVG resources cannot load or install", async () => {
  const { store, models, dir } = await setup();
  for (const variant of ["missing", "oversized", "escape", "invalid"] as const) {
    const root = join(dir, variant);
    await registerFixture(store, root, { id: variant, iconSvg: iconFixture });
    const file = join(root, "dist/icon.svg");
    if (variant === "missing" || variant === "escape") await rm(file);
    if (variant === "oversized") await Bun.write(file, " ".repeat(MAX_ICON_SVG_BYTES + 1));
    if (variant === "invalid") await Bun.write(file, "invalid image");
    if (variant === "escape") {
      await Bun.write(join(dir, "outside.svg"), iconFixture);
      await symlink(join(dir, "outside.svg"), file);
    }
  }
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list()).toHaveLength(4);
  for (const info of plugins.list()) {
    expect(info.status).toBe("error");
    expect(info.iconURL).toBeNull();
    expect(
      (await plugins.asset(new Request(`http://localhost/plugins/${info.id}/dist/icon.svg`)))
        .status,
    ).toBe(404);
  }
  const { archive } = await archiveFixture(join(dir, "invalid-archive"), {
    id: "invalid-install",
    iconSvg: "not SVG",
  });
  const job = plugins.install(archive);
  await waitFor(
    () => plugins.listJobs().find((item) => item.id === job.id)?.status !== "installing",
  );
  expect(plugins.listJobs().find((item) => item.id === job.id)?.status).toBe("failed");
  expect(plugins.listJobs().find((item) => item.id === job.id)?.message).toContain("SVG");
  expect(plugins.list()).toHaveLength(4);
  await plugins.stop();
});
test("page retention is opt-in and is included in discovery for current and invalid packages", async () => {
  const pkg = structuredClone(fixturePackage);
  const { keepAlive: _keepAlive, backend: _backend, ...legacy } = pkg.fn;
  expect(manifestSchema.parse(legacy).keepAlive).toBe(false);
  expect(manifestSchema.parse({ ...legacy, keepAlive: false }).keepAlive).toBe(false);
  expect(manifestSchema.parse({ ...legacy, keepAlive: true }).keepAlive).toBe(true);
  for (const value of ["true", 1, null])
    expect(manifestSchema.safeParse({ ...legacy, keepAlive: value }).success).toBe(false);

  const { store, models, dir } = await setup();
  const root = join(dir, "code");
  const plugin = join(root, "plugins/translate");
  await mkdir(join(plugin, "dist"), { recursive: true });
  await Bun.write(
    join(plugin, "package.json"),
    JSON.stringify({ name: "legacy-plugin", version: "0.1.0", fn: legacy }),
  );
  await Bun.write(join(plugin, "dist/client.js"), "export default function Page() {}");
  await Bun.write(join(plugin, "dist/client.css"), "");
  await store.update((state) => {
    state.plugins.push({
      id: "translate",
      packageName: "legacy-plugin",
      version: "0.1.0",
      market: null,
      root: plugin,
      installation: plugin,
      source: "test",
    });
    state.plugins.push({
      id: "missing-package",
      packageName: "missing-package",
      version: "0.1.0",
      market: null,
      root: join(dir, "missing"),
      installation: "missing",
      source: "test",
    });
  });
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list().find((item) => item.id === "translate")?.keepAlive).toBe(false);
  expect(plugins.list().find((item) => item.id === "missing-package")?.keepAlive).toBe(false);
  await plugins.stop();
});
test("independent installed backend invokes SDK and gates disable while active", async () => {
  const { store, models, model, dir } = await streamingSetup();
  await registerFixture(store, join(dir, "fixture"));
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list()[0]?.methods[0]?.name).toBe("translate");
  expect(plugins.list()[0]?.keepAlive).toBe(true);
  const result = (await plugins.invoke("translate", "translate", {
    text: "hello",
    target: "简体中文",
    modelId: model.id,
  })) as { id: string };
  await expect(plugins.setEnabled("translate", false)).rejects.toThrow("正在运行");
  await models.cancel("translate", result.id);
  expect((await plugins.setEnabled("translate", false)).status).toBe("disabled");
  await expect(plugins.invoke("translate", "translate", {})).rejects.toThrow("停用");
  expect((await plugins.setEnabled("translate", true)).status).toBe("active");
  await plugins.stop();
});
test("plugin discovery rejects the host settings route as a plugin ID", async () => {
  const { store, models, dir } = await setup();
  const root = join(dir, "reserved-settings");
  await mkdir(join(root, "dist"), { recursive: true });
  const pkg = structuredClone(fixturePackage);
  const { backend: _backend, ...manifest } = pkg.fn;
  await Bun.write(
    join(root, "package.json"),
    JSON.stringify({
      name: "reserved-settings",
      version: "0.1.0",
      fn: { ...manifest, id: "settings" },
    }),
  );
  await Bun.write(join(root, "dist/client.js"), "export default function Page() {}");
  await store.update((state) => {
    state.plugins.push({
      id: "settings",
      packageName: "reserved-settings",
      version: "0.1.0",
      market: null,
      root,
      installation: "settings",
      source: "test",
    });
  });
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.list().find((item) => item.id === "settings")).toMatchObject({
    status: "error",
    enabled: false,
    error: "此插件 ID 为宿主保留名称",
  });
  await plugins.stop();
});
test("local archive installs, reloads, retains KV after uninstall and reports duplicate error", async () => {
  const { store, models, dir } = await setup();
  const { archive } = await archiveFixture(join(dir, "archive"), { id: "quick-notes" });
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  const job = plugins.install(archive);
  await waitFor(() => plugins.listJobs()[0]?.status !== "installing", 15000);
  expect(plugins.listJobs()[0]).toMatchObject({ status: "completed" });
  expect(plugins.list().find((item) => item.id === "quick-notes")?.market).toBe(null);
  expect(plugins.list().find((item) => item.id === "quick-notes")?.keepAlive).toBe(true);
  await store.set("quick-notes", "note", "persist");
  plugins.install(archive);
  await waitFor(() => plugins.listJobs()[0]?.status !== "installing", 15000);
  expect(plugins.listJobs()[0]?.status).toBe("failed");
  const restored = new Plugins(store, models, () => {});
  await restored.open();
  expect(restored.list().find((item) => item.id === "quick-notes")?.status).toBe("active");
  await plugins.uninstall("quick-notes");
  expect(store.get("quick-notes", "note")).toBe("persist");
  expect(plugins.list().length).toBe(0);
  await plugins.stop();
  await restored.stop();
});

test("theme defaults on existing data, persists across restarts and keeps plugin data", async () => {
  const { store, dir } = await setup();
  await store.set("translate", "preferences", { target: "English" });
  const { theme: _theme, ...legacy } = store.value;
  await Bun.write(join(dir, "platform.json"), JSON.stringify(legacy));
  const migrated = new Store(dir);
  await migrated.open();
  expect(migrated.value.theme).toBe("system");
  await migrated.update((state) => {
    state.theme = "dark";
  });
  const reopened = new Store(dir);
  await reopened.open();
  expect(reopened.value.theme).toBe("dark");
  expect(reopened.get("translate", "preferences")).toEqual({ target: "English" });
});

test("theme changes serialize native application and persistence; native failures leave preference unchanged", async () => {
  const { Appearance } = await import("../backend/appearance");
  const { store } = await setup();
  const applied: string[] = [];
  const events: string[] = [];
  const appearance = new Appearance(
    store,
    async (theme) => {
      if (theme === "dark") await Bun.sleep(15);
      applied.push(theme);
    },
    (value) => events.push(value.theme),
  );
  await Promise.all([appearance.set({ theme: "dark" }), appearance.set({ theme: "light" })]);
  expect(applied).toEqual(["dark", "light"]);
  expect(events).toEqual(["dark", "light"]);
  expect(appearance.get().theme).toBe("light");
  const failing = new Appearance(
    store,
    async () => {
      throw new Error("Native unavailable");
    },
    () => {
      throw new Error("Must not emit");
    },
  );
  await expect(failing.set({ theme: "dark" })).rejects.toThrow("Native unavailable");
  expect(store.value.theme).toBe("light");
});

for (const legacyManifest of [false, true]) test(`${legacyManifest ? "Old product manifest" : "SDK 0.1 plugin"} stays rejected without changing stored data`, async () => {
  const { store, models, dir } = await setup();
  const root = join(dir, "old-plugin");
  await mkdir(root);
  const pkg = structuredClone(fixturePackage);
  await Bun.write(
    join(root, "package.json"),
    JSON.stringify(legacyManifest
      ? { name: pkg.name, version: pkg.version, malatang: { ...pkg.fn, id: "old-plugin" } }
      : { ...pkg, fn: { ...pkg.fn, id: "old-plugin", sdkVersion: "0.1" } }),
  );
  await store.set("old-plugin", "note", "preserved");
  await store.update((state) => {
    state.plugins.push({
      id: "old-plugin",
      packageName: "test-plugin",
      version: "0.1.0",
      market: null,
      root,
      installation: root,
      source: "test",
    });
  });
  const plugins = new Plugins(store, models, () => {});
  await plugins.open();
  expect(plugins.get("old-plugin").info.error).toContain("重新构建");
  await expect(plugins.setEnabled("old-plugin", true)).rejects.toThrow("重新构建");
  expect(plugins.get("old-plugin").info.status).toBe("error");
  expect(store.get("old-plugin", "note")).toBe("preserved");
  await plugins.stop();
});
