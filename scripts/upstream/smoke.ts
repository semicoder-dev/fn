import assert from "node:assert/strict";
import { realpath } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { verifyUpstream } from "./verify.ts";
import type { UpstreamLock } from "./lib.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const consumer = join(root, "packages/runtime");

/** Exercise published ESM entries and verify shared package identities in the actual install. */
export async function smokeUpstream(): Promise<void> {
  await verifyUpstream();
  const lock = (await Bun.file(join(root, "upstream.lock.json")).json()) as UpstreamLock;
  const expected = new Map<string, string>();
  for (const pkg of lock.packages)
    expected.set(pkg.name, await realpath(Bun.resolveSync(`${pkg.name}/package.json`, consumer)));
  for (const pkg of lock.packages) {
    const manifestPath = expected.get(pkg.name)!;
    const manifest = (await Bun.file(manifestPath).json()) as { name: string; version: string };
    assert.equal(manifest.version, pkg.version, `Installed version differs: ${pkg.name}`);
    await import(pathToFileURL(Bun.resolveSync(pkg.name, consumer)).href);
    for (const dependency of Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })) {
      if (!expected.has(dependency)) continue;
      const resolved = await realpath(Bun.resolveSync(`${dependency}/package.json`, dirname(manifestPath)));
      assert.equal(resolved, expected.get(dependency), `Duplicate shared instance: ${pkg.name} -> ${dependency}`);
    }
  }
  const cordis = await import(pathToFileURL(Bun.resolveSync("@deepseek-ai/cordis", consumer)).href);
  const ctx = new cordis.Context();
  let calls = 0;
  let disposed = 0;
  const consumerFiber = ctx.inject(["probe"], (inner: typeof ctx) => {
    inner.on("fn/upstream-probe", () => calls++);
    inner.effect(() => async () => {
      await Promise.resolve();
      disposed++;
    });
  });
  const provider = await ctx.plugin((inner: typeof ctx) => inner.provide("probe", {}));
  await consumerFiber.await();
  ctx.emit("fn/upstream-probe");
  assert.equal(calls, 1);
  await provider.dispose();
  await consumerFiber.await();
  ctx.emit("fn/upstream-probe");
  assert.equal(calls, 1);
  assert.equal(disposed, 1);
  await ctx.fiber.dispose();
  console.log(`Imported ${lock.packages.length} published packages; shared resolution and Cordis lifecycle passed`);
}

if (import.meta.main) await smokeUpstream();
