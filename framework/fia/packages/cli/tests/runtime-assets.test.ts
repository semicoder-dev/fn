import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { appDirectories } from "../src/app-context.ts";
import {
  applicationRuntimeAssets,
  hash,
  runtimeId,
  sha256,
  verifyAssets,
} from "../src/artifacts.ts";
import { buildApplication, buildCode, type ApplicationProcessRunner } from "../src/application.ts";
import { runtimeAssetSources, validateConfig } from "../src/project-config.ts";

const roots: string[] = [];
afterEach(async () => {
  for (const path of roots.splice(0)) await rm(path, { recursive: true, force: true });
});
async function fixture() {
  const root = await mkdtemp(resolve(tmpdir(), "fia-runtime-assets-"));
  roots.push(root);
  await mkdir(resolve(root, "resources"));
  await writeFile(resolve(root, "resources/seed.tgz"), "first seed");
  await writeFile(resolve(root, "resources/seed.json"), '{"schema":1}');
  const base = {
    app: { name: "Runtime Assets", identifier: "test.runtime-assets", version: "1.0.0", build: 1 },
    agent: { command: "runtime-assets", description: "Runtime assets test" },
  };
  const config = validateConfig(
    {
      ...base,
      runtime: { assets: ["resources/seed.tgz", "resources/seed.json"] },
    },
    root,
  );
  return { root, base, config };
}

test("runtime assets reject unsafe paths, ambiguous names and overlap with code assets", async () => {
  const { root, base } = await fixture();
  for (const assets of [
    ["../outside"],
    ["/absolute"],
    ["resources\\seed"],
    [".fia/private"],
    ["resources/seed.tgz", "resources/seed.tgz"],
    ["resources/seed.tgz", "resources/SEED.tgz"],
  ])
    expect(() => validateConfig({ ...base, runtime: { assets } }, root)).toThrow();
  expect(() =>
    validateConfig({ ...base, runtime: { assets: "resources/seed.tgz" } }, root),
  ).toThrow();
  expect(() =>
    validateConfig(
      {
        ...base,
        backend: { assets: ["resources"] },
        runtime: { assets: ["resources/seed.tgz"] },
      },
      root,
    ),
  ).toThrow("must not be included");
  expect(validateConfig(base, root).runtime.assets).toEqual([]);
});

test("startup budgets are bounded and require a matching full runtime", async () => {
  const { root, base } = await fixture();
  const normal = validateConfig(base, root);
  expect(normal.backend.startupTimeoutMs).toBe(15_000);
  for (const timeout of [0, -1, 999, 120_001, 1.5, Infinity, "60000"])
    expect(() => validateConfig({ ...base, backend: { startupTimeoutMs: timeout } }, root)).toThrow(
      "startupTimeoutMs",
    );
  const extended = validateConfig({ ...base, backend: { startupTimeoutMs: 60_000 } }, root);
  const assets = await verifyAssets();
  expect(await runtimeId(extended, assets)).not.toBe(await runtimeId(normal, assets));
});

test("runtime asset validation rejects files and parent directories that are symlinks", async () => {
  const { root, base } = await fixture();
  const outside = await mkdtemp(resolve(tmpdir(), "fia-outside-assets-"));
  roots.push(outside);
  await writeFile(resolve(outside, "outside.txt"), "outside");
  await symlink(resolve(root, "resources/seed.tgz"), resolve(root, "resources/linked.tgz"));
  await symlink(resolve(root, "resources"), resolve(root, "linked-directory"));
  await symlink(outside, resolve(root, "outside-directory"));
  for (const path of [
    "resources",
    "resources/linked.tgz",
    "linked-directory/seed.tgz",
    "outside-directory/outside.txt",
  ]) {
    const config = validateConfig({ ...base, runtime: { assets: [path] } }, root);
    await expect(runtimeAssetSources(config)).rejects.toThrow();
  }
  const config = validateConfig({ ...base, runtime: { assets: ["resources/seed.tgz"] } }, root);
  const files = await runtimeAssetSources(config);
  expect(files.map((item) => item.path)).toEqual(["resources/seed.tgz"]);
});

test("runtime identity incorporates exact immutable file names and bytes, with a legacy no-assets identity", async () => {
  const { root, base, config } = await fixture();
  const assets = await verifyAssets();
  const first = await runtimeId(config, assets);
  const reordered = validateConfig(
    { ...base, runtime: { assets: [...config.runtime.assets].reverse() } },
    root,
  );
  expect(await runtimeId(reordered, assets)).toBe(first);
  await writeFile(resolve(root, "resources/seed.tgz"), "second seed");
  expect(await runtimeId(config, assets)).not.toBe(first);
  const legacy = validateConfig(base, root);
  const expected = hash(
    JSON.stringify({
      framework: assets.frameworkVersion,
      host: assets.hostSHA256,
      bun: assets.bunSHA256,
      agentCLI: await sha256(resolve(import.meta.dir, "../dist/agent-cli.js")),
      scriptPreload: await sha256(resolve(import.meta.dir, "../dist/script-preload.js")),
      identifier: legacy.app.identifier,
      agentCommand: legacy.agent.command,
      name: legacy.app.name,
      icon: null,
      minimumOS: "14.0",
      permissions: {},
      statusItem: null,
      updates: null,
      signing: null,
    }),
  );
  expect(await runtimeId(legacy, assets)).toBe(expected);
  const copy = resolve(root, "bundle-runtime");
  const snapshot = await applicationRuntimeAssets(config, copy);
  expect(snapshot.find((file) => file.path === "resources/seed.tgz")?.sha256).toBe(
    hash("second seed"),
  );
  expect(await readFile(resolve(copy, "resources/seed.tgz"), "utf8")).toBe("second seed");
});

test("full application assembly copies a fixed runtime snapshot while code releases omit it", async () => {
  const { root, config } = await fixture();
  await mkdir(resolve(root, "backend"));
  await mkdir(resolve(root, "shared"));
  await mkdir(resolve(root, "frontend/dist"), { recursive: true });
  await mkdir(resolve(root, "node_modules/@semicoder"), { recursive: true });
  await symlink(resolve(import.meta.dir, ".."), resolve(root, "node_modules/@semicoder/fia"));
  await writeFile(
    resolve(root, "shared/api.ts"),
    `import { defineAPI } from "@semicoder/fia/api"; export default defineAPI({methods:{},events:{}});`,
  );
  await writeFile(
    resolve(root, "backend/index.ts"),
    `import { defineBackend, implementAPI } from "@semicoder/fia/backend"; import api from "../shared/api.ts"; export default defineBackend({http:{},api:implementAPI(api,{})});`,
  );
  await writeFile(resolve(root, "frontend/dist/index.html"), "<html><body>Test</body></html>");
  let changed = false;
  const runner: ApplicationProcessRunner = async (command) => {
    // Simulate a source edit during the web build. The app identity must still
    // describe the bytes already copied into this full application's runtime.
    if (!changed && command.some((item) => item.endsWith("vite.js"))) {
      changed = true;
      await writeFile(resolve(root, "resources/seed.tgz"), "edited while building");
    }
    return { exitCode: 0, stdout: "", stderr: "" };
  };
  const result = await buildApplication(config, { runner });
  const manifest = await Bun.file(
    resolve(result.app, "Contents/Resources/fia.runtime.json"),
  ).json();
  expect(manifest.backendStartupTimeoutMs).toBe(config.backend.startupTimeoutMs);
  const copied = resolve(result.app, "Contents/Resources/runtime/resources/seed.tgz");
  expect(await readFile(copied, "utf8")).toBe("first seed");
  expect(result.release.files.some((file) => file.path.includes("seed"))).toBe(false);
  const snapshot = await applicationRuntimeAssets(config);
  snapshot.find((file) => file.path === "resources/seed.tgz")!.sha256 = hash("first seed");
  expect(result.release.runtimeId).toBe(await runtimeId(config, await verifyAssets(), snapshot));
  const code = resolve(root, "code-update");
  const update = await buildCode(config, code, runner);
  expect(update.runtimeId).not.toBe(result.release.runtimeId);
  expect(update.files.some((file) => file.path.includes("seed"))).toBe(false);
  expect(await Bun.file(resolve(code, "runtime/resources/seed.tgz")).exists()).toBe(false);
}, 30_000);

test("backend runtimeDirectory stays tied to the app bundle across code switches", () => {
  expect(
    appDirectories({ development: true, webRoot: "/vite", bundlePath: "/Test.app" }, "/project"),
  ).toEqual({
    codeDirectory: "/project",
    runtimeDirectory: "/project",
  });
  for (const webRoot of [
    "/Test.app/Contents/Resources/code/web",
    "/User/Updates/releases/22/web",
  ]) {
    expect(
      appDirectories({ development: false, webRoot, bundlePath: "/Test.app" }).runtimeDirectory,
    ).toBe("/Test.app/Contents/Resources/runtime");
  }
  expect(
    appDirectories({ development: false, webRoot: "/Old.app/Contents/Resources/code/web" })
      .runtimeDirectory,
  ).toBe("/Old.app/Contents/Resources/runtime");
});
