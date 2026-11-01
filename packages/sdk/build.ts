import { cp, mkdir, readdir, realpath, rm } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import {
  manifestSchema,
  relativePath,
  type BuiltApplication,
} from "./src/manifest.ts";
import { parseSummary } from "./src/summary.ts";
const skipped = new Set([
  "node_modules",
  ".git",
  ".fia",
  ".qa",
  ".build",
  ".fn-build",
]);
async function copyTree(source: string, destination: string) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (skipped.has(entry.name) || entry.name.startsWith(".env")) continue;
    const from = resolve(source, entry.name),
      to = resolve(destination, entry.name);
    if (entry.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to);
    } else if (entry.isFile()) await cp(from, to);
    else if (entry.isSymbolicLink())
      throw new Error(
        "Application packages must contain regular files: " + from,
      );
  }
}
async function packageRoot(name: string, from: string) {
  let current = dirname(Bun.resolveSync(name, from));
  while (true) {
    const file = Bun.file(resolve(current, "package.json"));
    if (await file.exists()) {
      const value = await file.json();
      if (value.name === name)
        return { root: await realpath(current), pkg: value };
    }
    const parent = dirname(current);
    if (parent === current)
      throw new Error("Cannot resolve dependency " + name);
    current = parent;
  }
}
async function freezeDependencies(
  pkg: any,
  source: string,
  destination: string,
  ancestry = new Set<string>(),
) {
  for (const name of Object.keys(pkg.dependencies ?? {})) {
    const dependency = await packageRoot(name, source);
    if (ancestry.has(dependency.root)) continue;
    if (/@deepseek-ai\/|pi-ai/.test(name))
      throw new Error("Unsupported application dependency: " + name);
    if (dependency.pkg.scripts?.install || dependency.pkg.scripts?.postinstall)
      throw new Error(
        "Dependencies requiring install scripts are not supported: " + name,
      );
    const target = resolve(destination, "node_modules", name);
    await mkdir(target, { recursive: true });
    await copyTree(dependency.root, target);
    await freezeDependencies(
      dependency.pkg,
      dependency.root,
      target,
      new Set([...ancestry, dependency.root]),
    );
  }
}
export async function inspectPlugin(directory: string) {
  const root = await realpath(directory);
  const manifest = manifestSchema.parse(
    await Bun.file(resolve(root, "fn.app.json")).json(),
  );
  for (const path of [
    ...Object.values(manifest.entries),
    ...Object.values(manifest.locales.messages),
    ...(manifest.icon ? [manifest.icon] : []),
    ...(manifest.contributes.summary?.initial
      ? [manifest.contributes.summary.initial]
      : []),
  ]) {
    relativePath.parse(path);
    const file = await realpath(resolve(root, path));
    if (!file.startsWith(root + sep))
      throw new Error("Entry escapes application package");
  }
  if (manifest.contributes.summary?.initial)
    parseSummary(
      await Bun.file(
        resolve(root, manifest.contributes.summary.initial),
      ).json(),
    );
  return { root, manifest };
}
export async function buildPlugin(directory: string) {
  const { root, manifest } = await inspectPlugin(directory);
  const pkg = await Bun.file(resolve(root, "package.json")).json();
  const output = resolve(root, ".fn-build");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const roots = new Set<string>([
    ...(pkg.files ?? ["src", "locales", "summary", "assets"]),
    ...(manifest.contributes.summary?.initial
      ? [manifest.contributes.summary.initial.split("/")[0]!]
      : []),
    ...Object.values(manifest.entries).map((p) => p.split("/")[0]!),
    ...Object.values(manifest.locales.messages).map((p) => p.split("/")[0]!),
  ]);
  for (const name of roots) {
    relativePath.parse(name);
    if (skipped.has(name)) throw new Error("Invalid package files entry");
    const source = resolve(root, name);
    const actual = await realpath(source).catch(() => undefined);
    if (actual && !actual.startsWith(root + sep))
      throw new Error("Package file escapes root");
    try {
      const stat = await import("node:fs/promises").then((m) => m.stat(source));
      if (stat.isDirectory()) {
        await mkdir(resolve(output, name), { recursive: true });
        await copyTree(source, resolve(output, name));
      } else await cp(source, resolve(output, name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  await Bun.write(resolve(output, "fn.app.json"), JSON.stringify(manifest));
  await Bun.write(
    resolve(output, "package.json"),
    JSON.stringify({
      ...pkg,
      scripts: undefined,
      devDependencies: undefined,
      workspaces: undefined,
    }),
  );
  const built: BuiltApplication = { format: 1, manifest };
  if (manifest.entries.backend) {
    built.backend = manifest.entries.backend;
    await freezeDependencies(pkg, root, output);
  }
  if (manifest.entries.page) {
    const page = resolve(output, "page");
    await mkdir(page, { recursive: true });
    const html = resolve(root, ".fn-entry.html");
    try {
      await Bun.write(
        html,
        `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fn</title></head><body><div id="root"></div><script type="module" src="./${manifest.entries.page}"></script></body></html>`,
      );
      const result = await Bun.build({
        entrypoints: [html],
        target: "browser",
        outdir: page,
        define: { "process.env.NODE_ENV": '"production"' },
        sourcemap: "linked",
      });
      if (!result.success)
        throw new AggregateError(result.logs, "Application page build failed");
      const entry = result.outputs.find((o) => o.path.endsWith(".html"));
      if (!entry) throw new Error("Missing application page");
      await Bun.write(resolve(page, "index.html"), await entry.text());
      if (entry.path !== resolve(page, "index.html")) await rm(entry.path);
      built.page = "page/index.html";
    } finally {
      await rm(html, { force: true });
    }
  }
  await Bun.write(resolve(output, "fn-build.json"), JSON.stringify(built));
  return { directory: output, manifest };
}
export async function packPlugin(directory: string) {
  const { directory: root, manifest } = await buildPlugin(directory);
  const files: Record<string, Uint8Array> = {};
  for await (const path of new Bun.Glob("**/*").scan({
    cwd: root,
    onlyFiles: true,
    dot: true,
  }))
    files[path] = await Bun.file(resolve(root, path)).bytes();
  const archive = new Bun.Archive(files, { compress: "gzip" });
  const target = resolve(
    directory,
    manifest.id + "-" + manifest.version + ".fn.tgz",
  );
  await Bun.write(target, await archive.bytes());
  const bytes = await Bun.file(target).bytes();
  return {
    path: target,
    sha256: new Bun.CryptoHasher("sha256").update(bytes).digest("hex"),
    manifest,
  };
}
