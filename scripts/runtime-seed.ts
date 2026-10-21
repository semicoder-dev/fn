import { createHash, randomUUID } from "node:crypto";
import { cp, mkdir, readFile, readdir, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  findPackageDirectory,
  sharedFrontendPackages,
  verifyGenerationDependencies,
  type SeedManifest,
  type SeedArchiveMetadata,
} from "../packages/runtime/src/generations.ts";
import { verifyUpstream } from "./upstream/verify.ts";
import type { UpstreamLock } from "./upstream/lib.ts";
import { signNativeCodeTree } from "../framework/fia/packages/cli/src/native-signing.ts";

interface Manifest {
  name: string;
  version: string;
  type?: string;
  exports?: unknown;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  optionalDependencies?: Record<string, string>;
}
interface PackageNode {
  source: string;
  destination: string;
  manifest: Manifest;
  dependencies: Map<string, PackageNode>;
}

const root = fileURLToPath(new URL("../", import.meta.url));
const workspaceDirectories = new Map([
  [await realpath(join(root, "packages/runtime")), "packages/runtime"],
  [await realpath(join(root, "packages/sdk")), "packages/sdk"],
]);

async function readManifest(directory: string): Promise<Manifest> {
  return JSON.parse(await readFile(join(directory, "package.json"), "utf8")) as Manifest;
}

async function link(directory: string, name: string, target: string): Promise<void> {
  const filename = join(directory, "node_modules", name);
  await mkdir(dirname(filename), { recursive: true });
  await symlink(relative(dirname(filename), target), filename, "dir");
}

/** Copy exactly the installed dependency graph, with every link relative to the seed. */
export async function buildRuntimeSeed(output = join(root, "resources/runtime-seed"), signingIdentity?: string): Promise<SeedManifest> {
  await verifyUpstream();
  const upstream = JSON.parse(await readFile(join(root, "upstream.lock.json"), "utf8")) as UpstreamLock;
  const nodes = new Map<string, PackageNode>();
  const visit = async (source: string): Promise<PackageNode> => {
    source = await realpath(source);
    const found = nodes.get(source);
    if (found) return found;
    const manifest = await readManifest(source);
    const context = createHash("sha256").update(relative(root, source)).digest("hex").slice(0, 12);
    const destination = workspaceDirectories.get(source)
      ?? `node_modules/.store/${manifest.name.replace(/[^a-zA-Z0-9_.-]/g, "-")}-${manifest.version}-${context}/node_modules/${manifest.name}`;
    const node: PackageNode = { source, destination, manifest, dependencies: new Map() };
    nodes.set(source, node);
    for (const name of Object.keys({
      ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies,
    }).sort()) {
      const dependency = await findPackageDirectory(name, source);
      if (!dependency) {
        if (name in (manifest.optionalDependencies ?? {}) || manifest.peerDependenciesMeta?.[name]?.optional) continue;
        throw new Error(`Installed dependency is missing: ${manifest.name} -> ${name}`);
      }
      node.dependencies.set(name, await visit(dependency));
    }
    return node;
  };
  const runtime = await visit(join(root, "packages/runtime"));
  const sdk = await visit(join(root, "packages/sdk"));
  if (!sdk.manifest.exports || typeof sdk.manifest.exports !== "object" || !("." in sdk.manifest.exports))
    throw new Error("Runtime seed requires the new SDK root ESM export");
  const coreVersions = Object.fromEntries(upstream.packages.map((pkg) => [pkg.name, pkg.version]));
  coreVersions[runtime.manifest.name] = runtime.manifest.version;
  coreVersions[sdk.manifest.name] = sdk.manifest.version;
  const host = await readManifest(root);
  for (const name of sharedFrontendPackages) {
    // Use the host's exact pin, not the SDK's broad peer range. The graph audit
    // below also proves the SDK and the host resolve the same installed version.
    const version = host.dependencies?.[name];
    if (!version || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(version))
      throw new Error(`Host must pin shared frontend package: ${name}`);
    const directory = await findPackageDirectory(name, root);
    if (!directory) throw new Error(`Host shared frontend package is missing: ${name}`);
    await visit(directory);
    coreVersions[name] = version;
  }
  const core = new Map<string, PackageNode>();
  for (const node of nodes.values()) {
    if (!(node.manifest.name in coreVersions)) continue;
    if (node.manifest.version !== coreVersions[node.manifest.name])
      throw new Error(`Unreviewed shared version: ${node.manifest.name}@${node.manifest.version}`);
    if (core.has(node.manifest.name)) throw new Error(`Shared package has multiple instances: ${node.manifest.name}`);
    core.set(node.manifest.name, node);
  }
  for (const name of Object.keys(coreVersions))
    if (!core.has(name)) throw new Error(`Shared package missing from installed closure: ${name}`);

  const staging = `${output}.${randomUUID()}.partial`;
  await mkdir(staging, { recursive: true });
  try {
    for (const node of nodes.values()) {
      const destination = join(staging, node.destination);
      await cp(node.source, destination, {
        recursive: true, dereference: false, verbatimSymlinks: true,
        filter: (filename) => {
          const parts = relative(node.source, filename).split(sep);
          return !parts.some((part) => part === "node_modules" || part === ".git")
            && (!workspaceDirectories.has(node.source) || !parts.some((part) => part === "tests"));
        },
      });
      for (const [name, dependency] of node.dependencies)
        await link(destination, name, join(staging, dependency.destination));
    }
    for (const [name, node] of core) await link(staging, name, join(staging, node.destination));
    const dependencies = Object.fromEntries(Object.entries(coreVersions)
      .map(([name, version]) => [name, name.startsWith("@semicoder/") ? "workspace:*" : version]));
    const overrides = Object.fromEntries(Object.entries(coreVersions)
      .filter(([name]) => name.startsWith("@deepseek-ai/") || sharedFrontendPackages.includes(name)));
    const rootPackage = {
      name: "fn-runtime-generation", private: true, type: "module",
      workspaces: ["packages/runtime", "packages/sdk", "applications/*"],
      dependencies, overrides,
    };
    await writeFile(join(staging, "package.json"), `${JSON.stringify(rootPackage, null, 2)}\n`);
    const lock = Bun.JSON5.parse(await readFile(join(root, "bun.lock"), "utf8")) as {
      workspaces: Record<string, unknown>; packages: Record<string, unknown[]>; overrides: Record<string, string>;
    };
    const workspaceRecord = (manifest: Manifest) => ({
      name: manifest.name, version: manifest.version,
      ...(manifest.dependencies ? { dependencies: manifest.dependencies } : {}),
      ...(manifest.optionalDependencies ? { optionalDependencies: manifest.optionalDependencies } : {}),
      ...(manifest.peerDependencies ? { peerDependencies: manifest.peerDependencies } : {}),
    });
    lock.workspaces = {
      "": { name: rootPackage.name, dependencies },
      "packages/runtime": workspaceRecord(runtime.manifest),
      "packages/sdk": workspaceRecord(sdk.manifest),
    };
    lock.overrides = overrides;
    for (const [key, record] of Object.entries(lock.packages)) {
      if (String(record[0]).includes("@workspace:")
        && key !== runtime.manifest.name && key !== sdk.manifest.name) delete lock.packages[key];
    }
    await writeFile(join(staging, "bun.lock"), `${JSON.stringify(lock, null, 2)}\n`);
    await writeFile(join(staging, "upstream.lock.json"), await readFile(join(root, "upstream.lock.json")));
    // --lockfile-only never mutates our copied module graph; --offline forbids
    // accidentally resolving a new upstream while preparing a distributable seed.
    const child = Bun.spawn([process.execPath, "install", "--offline", "--lockfile-only",
      "--ignore-scripts", "--production", "--registry=https://registry.npmjs.org"], {
      cwd: staging, stdout: "pipe", stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    if (code !== 0) throw new Error(`Seed lock normalization failed: ${stderr || stdout}`);
    await verifyGenerationDependencies(staging, coreVersions, [runtime.manifest.name, sdk.manifest.name]);
    if (signingIdentity) {
      const signed = await signNativeCodeTree(staging, signingIdentity);
      console.log(`Signed ${signed.length} native runtime dependencies before archiving`);
    }
    // Include all application source, signatures and package bytes in the seed identity.
    const hash = createHash("sha256").update(`${Bun.version}:${process.platform}:${process.arch}`);
    const hashDirectory = async (base: string) => {
      for (const entry of (await readdir(base, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
        const filename = join(base, entry.name);
        hash.update(relative(staging, filename));
        if (entry.isDirectory()) await hashDirectory(filename);
        else if (entry.isFile()) hash.update(await readFile(filename));
      }
    };
    await hashDirectory(staging);
    const seed: SeedManifest = {
      schemaVersion: 1, id: hash.digest("hex").slice(0, 24), bunVersion: Bun.version,
      runtimeEntry: "packages/runtime/src/index.ts", coreVersions,
      packages: [...nodes.values()].map((node) => ({
        name: node.manifest.name, version: node.manifest.version, directory: node.destination,
      })).sort((a, b) => a.directory.localeCompare(b.directory)),
    };
    await writeFile(join(staging, "seed.json"), `${JSON.stringify(seed, null, 2)}\n`);
    await rm(output, { recursive: true, force: true });
    await rename(staging, output);
    await archiveRuntimeSeed(output, seed);
    console.log(`Runtime seed ${seed.id}: ${seed.packages.length} packages, Bun ${seed.bunVersion}`);
    return seed;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

async function archiveRuntimeSeed(directory: string, seed: SeedManifest): Promise<void> {
  const archive = `${directory}.tgz`;
  const metadataFile = `${directory}.json`;
  try {
    const metadata = JSON.parse(await readFile(metadataFile, "utf8")) as SeedArchiveMetadata;
    if (metadata.id === seed.id && metadata.bunVersion === Bun.version
      && metadata.sha256 === createHash("sha256").update(await readFile(archive)).digest("hex")) return;
  } catch (error) {
    if (!(error instanceof SyntaxError) && (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const temporary = `${archive}.${randomUUID()}.partial`;
  try {
    const child = Bun.spawn(["/usr/bin/tar", "--format=pax", "-czf", temporary, "-C", directory, "."], {
      env: { ...process.env, COPYFILE_DISABLE: "1" }, stdout: "pipe", stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    if (code) throw new Error(`Runtime seed archive failed: ${stderr || stdout}`);
    const metadata: SeedArchiveMetadata = {
      schemaVersion: 1, id: seed.id, bunVersion: seed.bunVersion,
      sha256: createHash("sha256").update(await readFile(temporary)).digest("hex"),
    };
    await rename(temporary, archive);
    await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);
  } finally { await rm(temporary, { force: true }); }
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const distribution = args.includes("--distribution");
  const paths = args.filter(arg => arg !== "--distribution");
  if (paths.length > 1 || paths.some(arg => arg.startsWith("-"))) throw new Error("runtime-seed.ts [output] [--distribution]");
  const identity = distribution ? process.env.FN_SIGNING_IDENTITY : undefined;
  if (distribution && !identity) throw new Error("FN_SIGNING_IDENTITY is required for the distribution seed");
  await buildRuntimeSeed(paths[0] ? resolve(paths[0]) : undefined, identity);
}
