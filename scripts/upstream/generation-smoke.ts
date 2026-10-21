import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { GenerationManager, materializeRuntimeSeed } from "../../packages/runtime/src/generations.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), "fn-generation-smoke-"));
try {
  const seedDirectory = await materializeRuntimeSeed({
    archive: join(root, "resources/runtime-seed.tgz"),
    metadata: join(root, "resources/runtime-seed.json"),
    dataDirectory: join(temporary, "data"),
  });
  const seed = JSON.parse(await readFile(join(seedDirectory, "seed.json"), "utf8"));
  const pkg = join(temporary, "package");
  await mkdir(pkg);
  await writeFile(join(pkg, "package.json"), JSON.stringify({
    name: "@fn-smoke/typescript", version: "1.0.0", type: "module",
    exports: { ".": "./server.ts" },
    fn: { schemaVersion: 1, id: "typescript-smoke", name: "TypeScript smoke" },
    peerDependencies: {
      "@semicoder/fn-sdk": seed.coreVersions["@semicoder/fn-sdk"],
      "@deepseek-ai/cordis": seed.coreVersions["@deepseek-ai/cordis"],
    },
    dependencies: { zod: "4.4.3" },
    scripts: { postinstall: "touch DO_NOT_RUN" },
  }));
  await writeFile(join(pkg, "server.ts"),
    "import { z } from 'zod'; import { Context } from '@deepseek-ai/cordis';\n"
    + "const value: number = z.number().parse(1); export default function apply(ctx: Context) { void value; }\n");
  const archive = join(temporary, "application.tgz");
  const tar = Bun.spawn(["/usr/bin/tar", "-czf", archive, "-C", temporary, "package"], { stdout: "pipe", stderr: "pipe" });
  if (await tar.exited) throw new Error(await new Response(tar.stderr).text());
  const options = { dataDirectory: join(temporary, "data"), seedDirectory, busy: () => false, restart: () => {} };
  const manager = new GenerationManager(options);
  const initial = await manager.initialize();
  await import(initial.runtimeEntry);
  const staged = await manager.stageInstall(archive);
  if (await Bun.file(join(staged.directory, "applications/typescript-smoke/DO_NOT_RUN")).exists())
    throw new Error("Lifecycle script ran");
  await manager.activateWhenIdle();
  const restarted = new GenerationManager(options);
  const current = await restarted.initialize();
  if (current.id !== staged.id) throw new Error("Activation pointer was not persisted");
  await import(current.runtimeEntry);
  await import(current.applications[0]!.entry);
  await restarted.confirmActivation();
  const manifest = JSON.parse(await readFile(join(pkg, "package.json"), "utf8"));
  delete manifest.dependencies;
  manifest.version = "1.0.1";
  await writeFile(join(pkg, "package.json"), JSON.stringify(manifest));
  await writeFile(join(pkg, "server.ts"), "export default function apply() {}\n");
  const repack = Bun.spawn(["/usr/bin/tar", "-czf", archive, "-C", temporary, "package"], { stdout: "pipe", stderr: "pipe" });
  if (await repack.exited) throw new Error(await new Response(repack.stderr).text());
  const noDependencies = await restarted.stageInstall(archive);
  const frozen = Bun.spawn([process.execPath, "install", "--offline", "--ignore-scripts", "--production",
    "--frozen-lockfile", "--lockfile-only", "--linker=hoisted"], {
    cwd: noDependencies.directory, stdout: "pipe", stderr: "pipe",
  });
  const [output, error, result] = await Promise.all([
    new Response(frozen.stdout).text(), new Response(frozen.stderr).text(), frozen.exited,
  ]);
  if (result) throw new Error(`Dependency-free lock verification failed: ${error || output}`);
  console.log(`Generation smoke passed: isolated runtime, TS + zod, shared Cordis, install scripts blocked, restart confirmed`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
