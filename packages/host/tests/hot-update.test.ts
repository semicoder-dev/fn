import { expect, test } from "bun:test";
import { mkdtemp, mkdir, symlink, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openHost, type HostEnvironment, type Profile } from "../src/index.ts";
import { planHotUpdate } from "../src/hot-update.ts";
import type { Generation } from "../src/generations.ts";
import { ActivationClients } from "../../../host/activation-clients.ts";

const base: Profile = { plugins: [{ id: "stable", name: "stable", config: {} }], client: [] };
test("Bun replaces versioned code and private imports while retaining unrelated fibers", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-hot-"));
  let host: Awaited<ReturnType<typeof openHost>> | undefined;
  const counter = { active: 0, disposed: 0 };
  (globalThis as any).__hotCounter = counter;
  try {
    const stable = join(root, "stable");
    await mkdir(stable);
    await writeFile(
      join(stable, "package.json"),
      JSON.stringify({ name: "stable", type: "module", exports: "./index.ts" }),
    );
    await writeFile(
      join(stable, "index.ts"),
      `export function apply(ctx) { ctx.provide('stable', { draft: 'keep me' }); }`,
    );
    for (const version of [1, 2]) {
      const path = join(root, `version-${version}`);
      await mkdir(path);
      await writeFile(
        join(path, "package.json"),
        JSON.stringify({ name: "extension", type: "module", exports: "./index.ts" }),
      );
      await writeFile(join(path, "helper.ts"), `export const value = ${version};`);
      await writeFile(
        join(path, "index.ts"),
        `import { value } from './helper.ts';
        export function apply(ctx) { ctx.provide('extension', value); ctx.effect(() => {
          globalThis.__hotCounter.active++; return async () => { await Bun.sleep(5); globalThis.__hotCounter.active--; globalThis.__hotCounter.disposed++; };
        }); }`,
      );
      const generation = join(root, `gen-${version}`);
      await mkdir(join(generation, "node_modules"), { recursive: true });
      await writeFile(join(generation, "package.json"), "{}");
      await symlink(stable, join(generation, "node_modules/stable"));
      await symlink(path, join(generation, "node_modules/extension"));
    }
    host = await openHost(
      {
        dataDirectory: join(root, "data"),
        codeDirectory: join(root, "gen-1"),
        epoch: "test",
      } as HostEnvironment,
      base,
    );
    const stableService = host.ctx.get("stable"),
      stableFiber = host.ctx.loader.resolve("stable").fiber;
    const installed = {
      ...base,
      plugins: [...base.plugins, { id: "extension", name: "extension" }],
    };
    await host.update(join(root, "gen-1"), installed, new Set(["extension"]));
    expect(host.ctx.get("extension")).toBe(1);
    await host.update(join(root, "gen-2"), installed, new Set(["extension"]));
    expect(host.ctx.get("extension")).toBe(2);
    expect(host.ctx.host.codeDirectory).toBe(join(root, "gen-2"));
    expect(counter).toEqual({ active: 1, disposed: 1 });
    expect(host.ctx.get("stable")).toBe(stableService);
    expect(host.ctx.loader.resolve("stable").fiber).toBe(stableFiber);
    await host.update(join(root, "gen-2"), base, new Set(["extension"]));
    expect(host.ctx.get("extension")).toBeUndefined();
    expect(counter).toEqual({ active: 0, disposed: 2 });
    await host.update(join(root, "gen-2"), installed, new Set(["extension"]));
    expect(host.ctx.get("extension")).toBe(2);
  } finally {
    await host?.close();
    await rm(root, { recursive: true, force: true });
    delete (globalThis as any).__hotCounter;
  }
});

function generation(): Generation {
  return {
    id: "old",
    directory: "/unused",
    runtimeEntry: "/unused",
    plugins: [],
    manifest: {
      schemaVersion: 3,
      id: "old",
      seedId: "seed",
      core: "core",
      createdAt: "",
      runtimeEntry: "",
      coreVersions: {},
      plugins: [],
      dependencyLockSha256: null,
      profile: structuredClone(base),
    },
  };
}
test("core changes and plugin opt-out restart; external leaf install is live", () => {
  const before = generation(),
    next = generation();
  next.plugins.push({
    id: "extra",
    name: "extra",
    packageName: "extra",
    version: "1.0.0",
    archive: "archive",
    storage: "extensions/one",
  });
  next.manifest.profile.plugins.push({ id: "extra", name: "extra" });
  expect(planHotUpdate(before, next).reason).toBeUndefined();
  expect([...planHotUpdate(before, next).changed]).toEqual(["extra"]);
  next.plugins[0]!.hotReload = false;
  expect(planHotUpdate(before, next).reason).toBe("插件声明需要重启");
  next.plugins[0]!.hotReload = true;
  next.manifest.profile.plugins[0]!.config = { changed: true };
  expect(planHotUpdate(before, next).reason).toBe("基础插件组合发生变化");
  next.manifest.seedId = "other";
  expect(planHotUpdate(before, next).reason).toBe("共享内核发生变化");
});

test("activation waits for every live page and rejects stale acknowledgements and failures", async () => {
  const clients = new ActivationClients();
  clients.touch("a", "old");
  clients.touch("b", "old");
  let settled = false;
  const pending = clients.wait("next", 1000).then(() => {
    settled = true;
  });
  clients.touch("a", "old");
  clients.touch("b", "next");
  await Promise.resolve();
  expect(settled).toBe(false);
  clients.touch("a", "next");
  await pending;
  expect(settled).toBe(true);
  const failed = clients.wait("broken", 1000);
  clients.touch("a", "broken", "bad factory");
  await expect(failed).rejects.toThrow("bad factory");
  await expect(clients.wait("timeout", 5)).rejects.toThrow("超时");
});

test("unchanged immutable plugin storage survives generation projection changes", () => {
  const before = generation(),
    next = generation();
  const plugin = {
    id: "extra",
    name: "extra",
    packageName: "extra",
    version: "1.0.0",
    storage: "extensions/one",
    hotReload: false,
  };
  before.plugins = [{ ...plugin, archive: "/old/archive", entry: "/old/index.ts" }];
  next.plugins = [{ ...plugin, archive: "/new/archive", entry: "/new/index.ts" }];
  before.manifest.profile.plugins.push({ id: "extra", name: "extra" });
  next.manifest.profile.plugins.push({ id: "extra", name: "extra" });
  expect([...planHotUpdate(before, next).changed]).toEqual([]);
  expect(planHotUpdate(before, next).reason).toBeUndefined();
  next.manifest.profile.plugins[1]!.config = { plugins: [{ id: "nested", name: "extra" }] };
  expect(planHotUpdate(before, next).reason).toBe("插件拥有嵌套组合");
});
