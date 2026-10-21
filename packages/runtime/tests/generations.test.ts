import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, dirname } from "node:path";
import { GenerationManager, materializeRuntimeSeed, verifyGenerationDependencies, type SeedManifest } from "../src/generations";

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function writeJSON(filename: string, value: unknown) {
  await mkdir(dirname(filename), { recursive: true });
  await writeFile(filename, JSON.stringify(value));
}

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "fn-generation-test-"));
  temporary.push(directory);
  const seedDirectory = join(directory, "seed");
  const versions = { "@semicoder/fn-runtime": "0.0.0", "@semicoder/fn-sdk": "0.3.5", "@deepseek-ai/cordis": "4.0.5" };
  const packages = [
    { name: "@semicoder/fn-runtime", version: "0.0.0", directory: "packages/runtime" },
    { name: "@semicoder/fn-sdk", version: "0.3.5", directory: "packages/sdk" },
    { name: "@deepseek-ai/cordis", version: "4.0.5", directory: "node_modules/.store/cordis" },
  ];
  for (const pkg of packages) {
    const target = join(seedDirectory, pkg.directory);
    await mkdir(target, { recursive: true });
    await writeJSON(join(target, "package.json"), {
      name: pkg.name, version: pkg.version, type: "module", exports: "./index.ts",
      ...(pkg.name === "@semicoder/fn-sdk" ? { peerDependencies: { "@deepseek-ai/cordis": "4.0.5" } } : {}),
    });
    await writeFile(join(target, "index.ts"), pkg.name === "@deepseek-ai/cordis"
      ? "export class Context {}\n" : "export const ready: boolean = true;\n");
    const link = join(seedDirectory, "node_modules", pkg.name);
    await mkdir(dirname(link), { recursive: true });
    await symlink(relative(dirname(link), target), link);
  }
  const manifest: SeedManifest = {
    schemaVersion: 1, id: "testseed", bunVersion: Bun.version,
    runtimeEntry: "packages/runtime/index.ts", coreVersions: versions, packages,
  };
  await writeJSON(join(seedDirectory, "seed.json"), manifest);
  await writeJSON(join(seedDirectory, "package.json"), {
    name: "fn-runtime-generation", private: true, type: "module",
    dependencies: { "@semicoder/fn-runtime": "workspace:*", "@semicoder/fn-sdk": "workspace:*" },
  });
  await writeJSON(join(seedDirectory, "bun.lock"), { lockfileVersion: 2, workspaces: {}, packages: {} });
  let busy = false;
  let restartFailure = false;
  const restarts: string[] = [];
  const options = {
    dataDirectory: join(directory, "data"), seedDirectory, execPath: process.execPath,
    busy: () => busy,
    restart: async (next: { id: string }) => {
      if (restartFailure) throw new Error("restart failed");
      restarts.push(next.id);
    },
  };
  return {
    directory, seedDirectory, versions, options, restarts,
    setBusy(value: boolean) { busy = value; },
    setRestartFailure(value: boolean) { restartFailure = value; },
    manager: new GenerationManager(options),
  };
}

async function application(directory: string, id: string, options: {
  iconSvg?: string; peer?: string; body?: string; symlink?: boolean; dependencies?: Record<string, string>; version?: string;
} = {}) {
  const root = join(directory, `source-${id}-${Math.random()}`);
  const pkg = join(root, "package");
  await mkdir(pkg, { recursive: true });
  await writeJSON(join(pkg, "package.json"), {
    name: `@test/${id}`, version: options.version ?? "1.0.0", type: "module",
    fn: { schemaVersion: 1, id, name: `Test ${id}`, ...(options.iconSvg !== undefined ? { icon: "记", iconSvg: "dist/icon.svg" } : {}) },
    exports: { ".": { import: "./server.ts" }, "./client": "./client.js" },
    peerDependencies: { "@semicoder/fn-sdk": "0.3.5", "@deepseek-ai/cordis": options.peer ?? "4.0.5" },
    ...(options.dependencies ? { dependencies: options.dependencies } : {}),
    scripts: { postinstall: "touch DO_NOT_RUN" },
  });
  await writeFile(join(pkg, "server.ts"), options.body
    ?? "import { Context } from '@deepseek-ai/cordis'; const value: number = 1; export default function app() { return new Context(); }\n");
  await writeFile(join(pkg, "client.js"), "export default function render() {};\n");
  if (options.iconSvg !== undefined) { await mkdir(join(pkg, "dist")); await writeFile(join(pkg, "dist/icon.svg"), options.iconSvg); }
  if (options.symlink) await symlink("/etc/passwd", join(pkg, "escape"));
  const archive = join(root, "application.tgz");
  const child = Bun.spawn(["/usr/bin/tar", "-czf", archive, "-C", root, "package"], { stdout: "pipe", stderr: "pipe" });
  if (await child.exited) throw new Error(await new Response(child.stderr).text());
  return archive;
}

describe("immutable runtime generations", () => {
  test("materializes signed-resource archives outside the bundle and rejects tampering and escaping links", async () => {
    const f = await fixture();
    const archive = join(f.directory, "seed.tgz");
    const metadata = join(f.directory, "seed.json");
    const pack = async () => {
      const child = Bun.spawn(["/usr/bin/tar", "--format=pax", "-czf", archive, "-C", f.seedDirectory, "."],
        { stdout: "pipe", stderr: "pipe" });
      if (await child.exited) throw new Error(await new Response(child.stderr).text());
      await writeJSON(metadata, { schemaVersion: 1, id: "testseed", bunVersion: Bun.version,
        sha256: createHash("sha256").update(await readFile(archive)).digest("hex") });
    };
    await pack();
    const options = { archive, metadata, dataDirectory: join(f.directory, "materialized") };
    const result = await materializeRuntimeSeed(options);
    expect(result).toBe(join(options.dataDirectory, "runtime/seeds/testseed"));
    expect(await materializeRuntimeSeed(options)).toBe(result);
    await writeFile(archive, "tampered");
    await expect(materializeRuntimeSeed(options)).rejects.toThrow("SHA-256 mismatch");
    await symlink("/etc/passwd", join(f.seedDirectory, "escape"));
    await pack();
    await expect(materializeRuntimeSeed(options)).rejects.toThrow("link escapes");
  });

  test("loads raw TS, accumulates candidates, defers while busy, and activates after restart", async () => {
    const f = await fixture();
    const initial = await f.manager.initialize();
    const first = await f.manager.stageInstall(await application(f.directory, "first"));
    const second = await f.manager.stageInstall(await application(f.directory, "second"));
    expect(first.applications).toHaveLength(1);
    expect(second.applications.map((app) => app.id)).toEqual(["first", "second"]);
    expect((await f.manager.current())?.id).toBe(initial.id);
    expect((await f.manager.listApplications())).toEqual([]);
    expect(await Bun.file(join(second.directory, "applications/first/DO_NOT_RUN")).exists()).toBe(false);
    f.setBusy(true);
    expect(await f.manager.activateWhenIdle()).toMatchObject({ activated: false, pending: true });
    f.setBusy(false);
    expect(await f.manager.activateWhenIdle()).toMatchObject({ activated: true, id: second.id });
    const restarted = new GenerationManager(f.options);
    expect((await restarted.initialize()).id).toBe(second.id);
    await restarted.confirmActivation();
    expect((await new GenerationManager(f.options).initialize()).id).toBe(second.id);
    expect(f.restarts).toEqual([second.id]);
    const lock = JSON.parse(await readFile(join(second.directory, "bun.lock"), "utf8"));
    expect(lock.workspaces["applications/first"].name).toBe("@test/first");
    // An immutable predecessor contains neither application nor modified links.
    expect(await Bun.file(join(initial.directory, "applications/first/package.json")).exists()).toBe(false);
  });

  test("rejects mismatched shared peers, bundled core, links, and invalid module imports", async () => {
    const f = await fixture();
    const initial = await f.manager.initialize();
    await expect(f.manager.stageInstall(await application(f.directory, "badpeer", { peer: "^4.0.5" })))
      .rejects.toThrow("runtime provides");
    await expect(f.manager.stageInstall(await application(f.directory, "bundled", { dependencies: { "@deepseek-ai/cordis": "4.0.5" } })))
      .rejects.toThrow("exact peer");
    await expect(f.manager.stageInstall(await application(f.directory, "linked", { symlink: true })))
      .rejects.toThrow("links or special files");
    await expect(f.manager.stageInstall(await application(f.directory, "missing", { body: "import 'this-package-does-not-exist';" })))
      .rejects.toThrow("failed");
    expect((await f.manager.current())?.id).toBe(initial.id);
    expect(await f.manager.activateWhenIdle()).toEqual({ activated: false, pending: false });
  });

  test("rolls back a failed restart and an unconfirmed crash", async () => {
    const f = await fixture();
    const initial = await f.manager.initialize();
    const candidate = await f.manager.stageInstall(await application(f.directory, "restart"));
    f.setRestartFailure(true);
    await expect(f.manager.activateWhenIdle()).rejects.toThrow("restart failed");
    expect((await f.manager.current())?.id).toBe(initial.id);
    f.setRestartFailure(false);
    await f.manager.activateWhenIdle();
    expect((await new GenerationManager(f.options).initialize()).id).toBe(candidate.id);
    // No confirmActivation means the previous boot did not finish opening.
    expect((await new GenerationManager(f.options).initialize()).id).toBe(initial.id);
  });

  test("rejects a second canonical copy of a shared runtime dependency", async () => {
    const f = await fixture();
    const current = await f.manager.initialize();
    const duplicate = join(current.directory, "packages/sdk/node_modules/@deepseek-ai/cordis");
    await writeJSON(join(duplicate, "package.json"), { name: "@deepseek-ai/cordis", version: "4.0.5" });
    await expect(verifyGenerationDependencies(current.directory, f.versions, ["@semicoder/fn-sdk"]))
      .rejects.toThrow("Duplicate shared runtime");
  });

  test("stages removal without changing the active generation", async () => {
    const f = await fixture();
    const initial = await f.manager.initialize();
    await f.manager.stageInstall(await application(f.directory, "remove"));
    const removed = await f.manager.stageRemove("remove");
    expect(removed.applications).toHaveLength(0);
    expect(await f.manager.status()).toEqual({ currentId: initial.id, pendingId: removed.id });
    expect(await Bun.file(join(removed.directory, "applications/remove/package.json")).exists()).toBe(false);
    await f.manager.activateWhenIdle();
    await new GenerationManager(f.options).initialize();
    await f.manager.confirmActivation();
    expect(await f.manager.status()).toEqual({ currentId: removed.id });
  });

  test("stages a new seed with pending applications while the old generation remains active", async () => {
    const f = await fixture();
    await f.manager.initialize();
    await f.manager.stageInstall(await application(f.directory, "upgrade"));
    await f.manager.activateWhenIdle();
    await new GenerationManager(f.options).initialize();
    await f.manager.confirmActivation();
    const old = await f.manager.current();
    await f.manager.stageInstall(await application(f.directory, "pending"));
    const nextSeedDirectory = join(f.directory, "new-seed");
    await cp(f.seedDirectory, nextSeedDirectory, { recursive: true, verbatimSymlinks: true });
    const seed = JSON.parse(await readFile(join(nextSeedDirectory, "seed.json"), "utf8"));
    seed.id = "newseed";
    await writeJSON(join(nextSeedDirectory, "seed.json"), seed);
    await writeFile(join(nextSeedDirectory, "packages/runtime/index.ts"), "export const version = 2;\n");
    const nextManager = new GenerationManager({ ...f.options, seedDirectory: nextSeedDirectory });
    expect((await nextManager.initialize()).id).toBe(old!.id);
    f.setBusy(true);
    const upgraded = await nextManager.stageSeed(nextSeedDirectory);
    expect(upgraded.manifest.seedId).toBe("newseed");
    expect(upgraded.applications.map((app) => app.id)).toEqual(["pending", "upgrade"]);
    expect(await readFile(upgraded.runtimeEntry, "utf8")).toContain("version = 2");
    expect((await nextManager.current())?.id).toBe(old!.id);
    expect(await nextManager.status()).toEqual({ currentId: old!.id, pendingId: upgraded.id });
    expect((await nextManager.stageSeed(nextSeedDirectory)).id).toBe(upgraded.id);
    expect(await nextManager.activateWhenIdle()).toMatchObject({ activated: false, pending: true });
    f.setBusy(false);
    await nextManager.activateWhenIdle();
    expect((await new GenerationManager(f.options).initialize()).id).toBe(upgraded.id);
    await nextManager.confirmActivation();
    const existingPending = await nextManager.stageInstall(await application(f.directory, "third"));
    seed.id = "incompatible";
    seed.coreVersions["@deepseek-ai/cordis"] = "5.0.0";
    await writeJSON(join(nextSeedDirectory, "seed.json"), seed);
    await writeJSON(join(nextSeedDirectory, "node_modules/.store/cordis/package.json"),
      { name: "@deepseek-ai/cordis", version: "5.0.0", type: "module", exports: "./index.ts" });
    const failedManager = new GenerationManager(f.options);
    expect((await failedManager.initialize()).id).toBe(upgraded.id);
    await expect(failedManager.stageSeed(nextSeedDirectory)).rejects.toThrow("runtime provides 5.0.0");
    expect((await failedManager.status()).lastError).toContain("runtime provides 5.0.0");
    expect((await failedManager.status()).pendingId).toBe(existingPending.id);
    expect((await failedManager.current())?.id).toBe(upgraded.id);
    expect(await Bun.file(old!.runtimeEntry).exists()).toBe(true);
  });

  test("startup never reads or installs a changed seed, even while its background candidate is still preparing", async () => {
    const f = await fixture();
    await writeFile(join(f.seedDirectory, "packages/runtime/index.ts"), "export const version = 1;\n");
    await f.manager.initialize();
    const started = join(f.directory, "preflight-started"), release = join(f.directory, "preflight-release");
    await f.manager.stageInstall(await application(f.directory, "slow", { body: `
import { version } from '@semicoder/fn-runtime';
if (version === 2) {
  await Bun.write(${JSON.stringify(started)}, "started");
  while (!await Bun.file(${JSON.stringify(release)}).exists()) await Bun.sleep(10);
}
export default function application() {}
` }));
    await f.manager.activateWhenIdle();
    await new GenerationManager(f.options).initialize();
    await f.manager.confirmActivation();
    const old = (await f.manager.current())!;
    const seed = JSON.parse(await readFile(join(f.seedDirectory, "seed.json"), "utf8"));
    seed.id = "slow-new-seed";
    await writeJSON(join(f.seedDirectory, "seed.json"), seed);
    await writeFile(join(f.seedDirectory, "packages/runtime/index.ts"), "export const version = 2;\n");
    const preparing = f.manager.stageSeed();
    try {
      const deadline = Date.now() + 2000;
      while (!await Bun.file(started).exists()) {
        if (Date.now() >= deadline) throw new Error("Candidate did not reach preflight");
        await Bun.sleep(10);
      }
      expect((await f.manager.current())?.id).toBe(old.id);
      expect((await f.manager.status()).pendingId).toBeUndefined();
      const restarting = new GenerationManager({
        ...f.options, seedDirectory: join(f.directory, "missing-new-seed"), execPath: "/not-an-installer",
      });
      expect((await restarting.initialize()).id).toBe(old.id);
      expect(await readFile(old.runtimeEntry, "utf8")).toContain("version = 1");
      expect(f.restarts).toEqual([old.id]);
    } finally {
      await writeFile(release, "continue");
      await preparing;
    }
    const candidate = await preparing;
    expect((await f.manager.current())?.id).toBe(old.id);
    expect((await f.manager.status()).pendingId).toBe(candidate.id);
  });

  test("a new seed with no applications is preflighted before publishing pending", async () => {
    const f = await fixture();
    const old = await f.manager.initialize();
    const seed = JSON.parse(await readFile(join(f.seedDirectory, "seed.json"), "utf8"));
    seed.id = "invalid-runtime";
    await writeJSON(join(f.seedDirectory, "seed.json"), seed);
    await writeFile(join(f.seedDirectory, "packages/runtime/index.ts"), "throw new Error('invalid seed entry');\n");
    await expect(f.manager.stageSeed()).rejects.toThrow("invalid seed entry");
    expect((await f.manager.current())?.id).toBe(old.id);
    expect((await f.manager.status()).pendingId).toBeUndefined();
    expect((await f.manager.status()).lastError).toContain("invalid seed entry");
    expect((await new GenerationManager(f.options).initialize()).id).toBe(old.id);
  });

  test("a failed new-seed startup rolls back without retrying it on every boot", async () => {
    const f = await fixture();
    const old = await f.manager.initialize();
    const seed = JSON.parse(await readFile(join(f.seedDirectory, "seed.json"), "utf8"));
    seed.id = "brokennew";
    await writeJSON(join(f.seedDirectory, "seed.json"), seed);
    await f.manager.stageSeed();
    await f.manager.activateWhenIdle();
    expect((await new GenerationManager(f.options).initialize()).manifest.seedId).toBe("brokennew");
    expect((await new GenerationManager(f.options).initialize()).id).toBe(old.id);
    expect((await new GenerationManager(f.options).initialize()).id).toBe(old.id);
    expect((await f.manager.status()).lastError).toContain("did not finish");
    await expect(f.manager.stageSeed()).rejects.toThrow("did not finish");
    expect((await f.manager.status()).pendingId).toBeUndefined();
  });
});

test("market install verifies hash and archive identity before staging, and retains update origin", async () => {
  const f = await fixture(); const active = await f.manager.initialize();
  const archive = await application(f.directory, "catalog");
  const sha256 = createHash("sha256").update(await readFile(archive)).digest("hex");
  const expected = { id: "catalog", packageName: "@test/catalog", version: "1.0.0", sha256 };
  await expect(f.manager.stageInstall(archive, { expected: { ...expected, sha256: "0".repeat(64) } })).rejects.toThrow("SHA-256");
  await expect(f.manager.stageInstall(archive, { updating: { ...expected, id: "another-app" } })).rejects.toThrow("更新归档身份");
  await expect(f.manager.stageInstall(archive, { updating: { ...expected, version: "999.0.0" } })).rejects.toThrow("更新归档身份");
  await expect(f.manager.stageInstall(archive, { expected: { ...expected, id: "other" } })).rejects.toThrow("身份");
  expect((await f.manager.current())!.id).toBe(active.id);
  const origin = { source: "https://example.test/plugin.tgz", marketId: "official", marketURL: "https://example.test/index.json" };
  const staged = await f.manager.stageInstall(archive, { expected, origin });
  expect(staged.applications[0]!.origin).toEqual(origin);
  await f.manager.activateWhenIdle(); await f.manager.confirmActivation();
  expect((await new GenerationManager(f.options).initialize()).applications[0]!.origin).toEqual(origin);
});


test("application SVG metadata is read from the verified package and invalid icons cannot replace it", async () => {
  const f = await fixture();
  await f.manager.initialize();
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1h22v22z"/></svg>';
  const candidate = await f.manager.stageInstall(await application(f.directory, "icon-app", { iconSvg: svg }));
  expect(candidate.applications[0]).toMatchObject({ icon: "记", iconSvg: svg });
  await expect(f.manager.stageInstall(await application(f.directory, "icon-app", { iconSvg: "invalid", version: "1.0.1" }))).rejects.toThrow();
  expect((await f.manager.status()).pendingId).toBe(candidate.id);
});
