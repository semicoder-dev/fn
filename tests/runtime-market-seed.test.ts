import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
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
    const frozen = Bun.spawn([process.execPath, "install", "--offline", "--ignore-scripts", "--production",
      "--frozen-lockfile", "--lockfile-only", "--linker=hoisted"], {
      cwd: active.directory, stdout: "pipe", stderr: "pipe",
    });
    const [code, stdout, stderr] = await Promise.all([
      frozen.exited, new Response(frozen.stdout).text(), new Response(frozen.stderr).text(),
    ]);
    expect({ code, error: code ? stderr || stdout : "" }).toEqual({ code: 0, error: "" });
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
