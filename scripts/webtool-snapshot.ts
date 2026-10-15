import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const directory = join(root, "vendor/agent-webtool");
const hash = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
async function command(args: string[], cwd: string) {
  const child = Bun.spawn(args, { cwd, stdout: "pipe", stderr: "inherit" });
  const output = await new Response(child.stdout).text();
  if (await child.exited) throw new Error(`Command failed: ${args[0]}`);
  return output;
}
async function refresh(source: string) {
  source = resolve(source);
  const pkg = JSON.parse(await readFile(join(source, "package.json"), "utf8"));
  if (pkg.name !== "agent-webtool") throw new Error("Expected agent-webtool source");
  const inputs: { path: string; sha256: string }[] = [];
  async function scan(path: string) {
    const entries = await readdir(join(source, path), { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = `${path}/${entry.name}`;
      if (entry.isDirectory()) await scan(relative);
      else if (entry.isFile())
        inputs.push({ path: relative, sha256: hash(await readFile(join(source, relative))) });
      else throw new Error("Snapshot inputs must be regular files");
    }
  }
  for (const path of [
    "package.json",
    "bun.lock",
    "tsconfig.json",
    "tsconfig.sdk.json",
    "README.md",
    "LICENSE",
  ])
    inputs.push({ path, sha256: hash(await readFile(join(source, path))) });
  await scan("src");
  await scan("bin");
  inputs.sort((a, b) => a.path.localeCompare(b.path));
  const sourceFingerprint = hash(JSON.stringify(inputs));
  const version = `${pkg.version}-fn.dev${sourceFingerprint.slice(0, 12)}`;
  // Build and verify the original archive before creating an explicitly unpublished derivative.
  await command([process.execPath, "run", "npm:pack"], source);
  const temporary = await mkdtemp(join(tmpdir(), "fn-webtool-snapshot-"));
  try {
    await command(
      [
        "tar",
        "-xzf",
        join(source, `artifacts/npm/agent-webtool-${pkg.version}.tgz`),
        "-C",
        temporary,
      ],
      source,
    );
    const packageRoot = join(temporary, "package");
    const snapshotPackage = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
    snapshotPackage.version = version;
    await writeFile(
      join(packageRoot, "package.json"),
      JSON.stringify(snapshotPackage, null, 2) + "\n",
    );
    await mkdir(directory, { recursive: true });
    const packed = JSON.parse(
      await command(
        ["npm", "pack", "--json", "--ignore-scripts", "--pack-destination", directory],
        packageRoot,
      ),
    );
    const archive = packed[0].filename as string;
    const manifest = {
      unpublished: true,
      package: "agent-webtool",
      publicBaseline: pkg.version,
      version,
      sourceRepository: "https://github.com/semicoder-dev/agent-webtool",
      sourceBaseCommit: (await command(["git", "rev-parse", "HEAD"], source)).trim(),
      sourceFingerprint,
      inputs,
      archive,
      sha256: hash(await readFile(join(directory, archive))),
    };
    await writeFile(join(directory, "snapshot.json"), JSON.stringify(manifest, null, 2) + "\n");
    await copyFile(join(source, "LICENSE"), join(directory, "LICENSE"));
    const app = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
    app.dependencies["agent-webtool"] = `file:vendor/agent-webtool/${archive}`;
    await writeFile(join(root, "package.json"), JSON.stringify(app, null, 2) + "\n");
    for (const file of await readdir(directory))
      if (file.endsWith(".tgz") && file !== archive) await rm(join(directory, file));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
if (process.argv[2] === "--refresh") {
  if (!process.argv[3]) throw new Error("Supply an explicit agent-webtool source directory");
  await refresh(process.argv[3]);
}
const manifest = JSON.parse(await readFile(join(directory, "snapshot.json"), "utf8"));
if (manifest.unpublished !== true || !/^agent-webtool-[\w.-]+\.tgz$/.test(manifest.archive))
  throw new Error("Invalid development snapshot manifest");
if (hash(await readFile(join(directory, manifest.archive))) !== manifest.sha256)
  throw new Error("agent-webtool archive checksum mismatch");
if (hash(JSON.stringify(manifest.inputs)) !== manifest.sourceFingerprint)
  throw new Error("Snapshot source fingerprint mismatch");
if (process.argv[2] !== "--refresh") {
  const installed = JSON.parse(
    await readFile(Bun.resolveSync("agent-webtool/package.json", root), "utf8"),
  );
  if (installed.version !== manifest.version)
    throw new Error("Installed agent-webtool differs from the snapshot; run bun install");
}
const app = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
if (app.dependencies["agent-webtool"] !== `file:vendor/agent-webtool/${manifest.archive}`)
  throw new Error("Snapshot dependency mismatch");
console.log(`Verified unpublished agent-webtool ${manifest.version}: ${manifest.sha256}`);
