import { mkdir, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import {
  readArchiveManifest,
  sha256,
  sharedDependencyRequests,
  verifyIntegrity,
  type LockedPackage,
  type RegistryManifest,
  type UpstreamLock,
} from "./lib.ts";
import { dshRelease, entryPackages, registry, selectedVersion, sourceAudit } from "./policy.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));

function dependencyMap(value: Record<string, string> = {}): string {
  return JSON.stringify(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

async function download(url: string): Promise<Response> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "registry.npmjs.org")
    throw new Error(`Unexpected upstream registry URL: ${url}`);
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Registry returned HTTP ${response.status}: ${url}`);
  return response;
}

async function acquirePackage(name: string): Promise<{
  locked: LockedPackage;
  required: string[];
}> {
  const version = selectedVersion(name);
  const manifest = (await (
    await download(`${registry}/${encodeURIComponent(name)}/${version}`)
  ).json()) as RegistryManifest;
  if (manifest.name !== name || manifest.version !== version)
    throw new Error(`Registry identity mismatch for ${name}@${version}`);
  if (!manifest.dist?.tarball || !manifest.dist.integrity)
    throw new Error(`Registry archive metadata missing for ${name}@${version}`);
  const required = sharedDependencyRequests(manifest);
  const archive = `vendor/dsh/packages/${name.slice("@deepseek-ai/".length)}-${version}.tgz`;
  const filename = resolve(root, archive);
  let bytes: Uint8Array;
  if (await Bun.file(filename).exists()) {
    bytes = new Uint8Array(await Bun.file(filename).arrayBuffer());
    verifyIntegrity(bytes, manifest.dist.integrity);
  } else {
    bytes = new Uint8Array(await (await download(manifest.dist.tarball)).arrayBuffer());
    verifyIntegrity(bytes, manifest.dist.integrity);
    await mkdir(join(root, "vendor/dsh/packages"), { recursive: true });
    await Bun.write(`${filename}.partial`, bytes);
    await rename(`${filename}.partial`, filename);
  }
  const packed = await readArchiveManifest(filename);
  if (packed.name !== name || packed.version !== version)
    throw new Error(`Archive identity mismatch for ${name}@${version}`);
  if (dependencyMap(packed.dependencies) !== dependencyMap(manifest.dependencies))
    throw new Error(`Archive dependency metadata mismatch for ${name}@${version}`);
  if (dependencyMap(packed.peerDependencies) !== dependencyMap(manifest.peerDependencies))
    throw new Error(`Archive peer metadata mismatch for ${name}@${version}`);
  const locked: LockedPackage = {
    name,
    version,
    archive,
    sha256: sha256(bytes),
    integrity: manifest.dist.integrity,
    tarball: manifest.dist.tarball,
    ...(manifest.gitHead ? { gitHead: manifest.gitHead } : {}),
    ...(manifest.license ? { license: manifest.license } : {}),
    dependencies: manifest.dependencies ?? {},
    peerDependencies: manifest.peerDependencies ?? {},
    optionalPeers: Object.entries(manifest.peerDependenciesMeta ?? {})
      .filter(([, value]) => value.optional)
      .map(([peer]) => peer)
      .sort(),
  };
  console.log(`Verified ${name}@${version}`);
  return { locked, required };
}

/** Resolve only the reviewed release; this command never follows a mutable dist-tag. */
export async function acquire(): Promise<UpstreamLock> {
  const packages = new Map<string, LockedPackage>();
  const pending = new Set(entryPackages);
  while (pending.size) {
    const batch = [...pending].filter((name) => !packages.has(name)).slice(0, 6);
    if (!batch.length) break;
    batch.forEach((name) => pending.delete(name));
    const acquired = await Promise.all(batch.map(acquirePackage));
    acquired.forEach(({ locked, required }) => {
      packages.set(locked.name, locked);
      required.forEach((name) => {
        if (!packages.has(name)) pending.add(name);
      });
    });
  }
  const lock: UpstreamLock = {
    schemaVersion: 1,
    source: {
      kind: "npm",
      registry,
      release: dshRelease,
      auditRepository: sourceAudit.repository,
      auditCommit: sourceAudit.commit,
    },
    runtime: { bun: Bun.version },
    entries: entryPackages,
    packages: [...packages.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
  const filename = join(root, "upstream.lock.json");
  await Bun.write(`${filename}.partial`, `${JSON.stringify(lock, null, 2)}\n`);
  await rename(`${filename}.partial`, filename);
  console.log(`Locked ${lock.packages.length} upstream packages from npm ${dshRelease}`);
  return lock;
}

if (import.meta.main) await acquire();
