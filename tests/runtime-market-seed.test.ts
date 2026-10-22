import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RuntimeProduct } from "../backend/runtime-product";
import { GenerationManager, materializeRuntimeSeed } from "../packages/runtime/src/generations";
import { buildRuntimeSeed } from "../scripts/runtime-seed";
import index from "./fixtures/cordis-market-0.1.0/index.json";

// Public market + release archives, not a catalog fabricated from the host's own version map.
test("packaged seed installs the official market through compatibility checks and survives restart", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-market-seed-test-"));
  const product = new RuntimeProduct(join(directory, "product"), () => {},
    (async () => Response.json(index)) as unknown as typeof fetch);
  try {
    const output = join(directory, "seed");
    await buildRuntimeSeed(output);
    const dataDirectory = join(directory, "data");
    const seedDirectory = await materializeRuntimeSeed({ archive: `${output}.tgz`, metadata: `${output}.json`, dataDirectory });
    let busy = true;
    const options = { dataDirectory, seedDirectory, busy: () => busy, restart: () => {} };
    const manager = new GenerationManager(options);
    const current = await manager.initialize();
    await product.refresh();
    expect(product.listMarkets()[0]!.error).toBeNull();
    expect(product.catalog([], current.manifest.coreVersions).map(entry => entry.state))
      .toEqual(["available", "available", "available"]);
    for (const entry of index.applications) {
      const resolved = await product.resolve("official", entry.id, [], current.manifest.coreVersions);
      const archive = fileURLToPath(new URL(`./fixtures/cordis-market-0.1.0/${entry.id}-0.1.0.tgz`, import.meta.url));
      await manager.stageInstall(archive, { expected: resolved.entry, origin: resolved.origin });
    }
    expect((await manager.activateWhenIdle()).pending).toBe(true);
    busy = false;
    expect((await manager.activateWhenIdle()).activated).toBe(true);
    const restarted = new GenerationManager(options);
    const active = await restarted.initialize();
    await restarted.confirmActivation();
    expect(product.catalog(active.applications, active.manifest.coreVersions).map(entry => entry.state))
      .toEqual(["installed", "installed", "installed"]);
    for (const application of active.applications) {
    const frozen = Bun.spawn([process.execPath, "install", "--offline", "--ignore-scripts", "--production",
      "--frozen-lockfile", "--lockfile-only", "--linker=hoisted"], {
      cwd: join(dataDirectory, "runtime", application.storage!), stdout: "pipe", stderr: "pipe",
    });
    const [code, stdout, stderr] = await Promise.all([
      frozen.exited, new Response(frozen.stdout).text(), new Response(frozen.stderr).text(),
    ]);
    expect({ code, error: code ? stderr || stdout : "" }).toEqual({ code: 0, error: "" });
    }
    const engine = await import(pathToFileURL(active.runtimeEntry).href) as typeof import("../packages/runtime/src/index");
    const runtimeData = join(directory, "sessions");
    let runtime = await engine.FnRuntime.open({ dataDirectory: runtimeData, tools: { web: { search: async () => [], fetch: async () => ({}) } } });
    try {
      for (const app of active.applications) {
        const module = await import(pathToFileURL(app.entry).href);
        const loaded = await runtime.load({ manifest: app, plugin: module.default ?? module });
        expect({status: loaded.status, error: loaded.error}).toEqual({status: "active", error: undefined});
      }
      runtime.store.kv("cordis-quick-notes").set("note:test", "preserved");
      expect(await runtime.invoke("cordis-quick-notes", "count", null)).toBe(1);
      await runtime.unload("cordis-quick-notes");
      await expect(runtime.invoke("cordis-quick-notes", "count", null)).rejects.toThrow();
      await runtime.close();
      runtime = await engine.FnRuntime.open({ dataDirectory: runtimeData, tools: { web: { search: async () => [], fetch: async () => ({}) } } });
      expect(runtime.store.kv("cordis-quick-notes").get("note:test")).toBe("preserved");
    } finally { await runtime.close(); }
    for (const name of ["react", "react-dom"]) {
      const missing = { ...active.manifest.coreVersions };
      delete missing[name];
      expect(product.catalog([], missing).every(entry => entry.state === "incompatible")).toBe(true);
      expect(product.catalog([], { ...active.manifest.coreVersions, [name]: "0.0.0" })
        .every(entry => entry.state === "incompatible")).toBe(true);
    }
  } finally {
    await product.stop();
    await rm(directory, { recursive: true, force: true });
  }
}, 120_000);
