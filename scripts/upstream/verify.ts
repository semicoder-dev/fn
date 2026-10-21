import { fileURLToPath } from "node:url";
import { join } from "node:path";
import {
  readArchiveManifest,
  sha256,
  sharedDependencyRequests,
  verifyIntegrity,
  type UpstreamLock,
} from "./lib.ts";
import { dshRelease, selectedVersion } from "./policy.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));

/** Verify stored bytes and complete shared-runtime closure without network access. */
export async function verifyUpstream(): Promise<void> {
  const lock = (await Bun.file(join(root, "upstream.lock.json")).json()) as UpstreamLock;
  if (lock.schemaVersion !== 1 || lock.source.kind !== "npm")
    throw new Error("Unsupported upstream lock format");
  if (lock.source.release !== dshRelease)
    throw new Error("Upstream lock differs from the reviewed release policy");
  const dependencyLock = Bun.JSON5.parse(await Bun.file(join(root, "bun.lock")).text()) as {
    packages: Record<string, unknown[]>;
  };
  const names = new Set(lock.packages.map((pkg) => pkg.name));
  if (names.size !== lock.packages.length) throw new Error("Duplicate upstream package");
  for (const name of lock.entries)
    if (!names.has(name)) throw new Error(`Missing upstream entry: ${name}`);
  for (const pkg of lock.packages) {
    if (pkg.version !== selectedVersion(pkg.name))
      throw new Error(`Unreviewed upstream version: ${pkg.name}@${pkg.version}`);
    const installedLock = dependencyLock.packages[pkg.name];
    if (installedLock?.[0] !== `${pkg.name}@${pkg.version}` || installedLock[3] !== pkg.integrity)
      throw new Error(`bun.lock does not consume the recorded npm artifact: ${pkg.name}`);
    const archive = join(root, pkg.archive);
    const bytes = new Uint8Array(await Bun.file(archive).arrayBuffer());
    verifyIntegrity(bytes, pkg.integrity);
    if (sha256(bytes) !== pkg.sha256) throw new Error(`Archive hash mismatch: ${pkg.name}`);
    const manifest = await readArchiveManifest(archive);
    if (manifest.name !== pkg.name || manifest.version !== pkg.version)
      throw new Error(`Archive identity mismatch: ${pkg.name}`);
    for (const name of sharedDependencyRequests(manifest))
      if (!names.has(name)) throw new Error(`Missing shared dependency ${pkg.name} -> ${name}`);
  }
  console.log(`Verified ${lock.packages.length} locked upstream archives and their shared closure`);
}

if (import.meta.main) await verifyUpstream();
