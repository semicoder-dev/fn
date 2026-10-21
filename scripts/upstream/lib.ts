import { createHash, timingSafeEqual } from "node:crypto";
import { selectedVersion } from "./policy.ts";

export interface RegistryManifest {
  name: string;
  version: string;
  gitHead?: string;
  license?: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  dist: { tarball: string; integrity: string };
}

export interface LockedPackage {
  name: string;
  version: string;
  archive: string;
  sha256: string;
  integrity: string;
  tarball: string;
  gitHead?: string;
  license?: string;
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  optionalPeers: string[];
}

export interface UpstreamLock {
  schemaVersion: 1;
  source: {
    kind: "npm";
    registry: string;
    release: string;
    auditRepository: string;
    auditCommit: string;
  };
  runtime: { bun: string };
  entries: string[];
  packages: LockedPackage[];
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function verifyIntegrity(bytes: Uint8Array, integrity: string): void {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/.exec(integrity);
  if (!match) throw new Error("Upstream archives require a SHA-512 integrity value");
  const expected = Buffer.from(match[1]!, "base64");
  const actual = createHash("sha512").update(bytes).digest();
  if (expected.byteLength !== actual.byteLength || !timingSafeEqual(expected, actual))
    throw new Error("Upstream archive integrity mismatch");
}

/** Package closure includes required peers; optional services need explicit entries. */
export function sharedDependencyRequests(manifest: RegistryManifest): string[] {
  const required = {
    ...manifest.dependencies,
    ...Object.fromEntries(
      Object.entries(manifest.peerDependencies ?? {}).filter(
        ([name]) => !manifest.peerDependenciesMeta?.[name]?.optional,
      ),
    ),
  };
  return Object.entries(required)
    .filter(([name]) => name.startsWith("@deepseek-ai/"))
    .map(([name, range]) => {
      const version = selectedVersion(name);
      const expected = name.startsWith("@deepseek-ai/dsh-") ? version : `~${version}`;
      if (range !== version && range !== expected)
        throw new Error(`${manifest.name}: ${name}@${range} differs from reviewed ${expected}`);
      return name;
    })
    .sort();
}

export async function readArchiveManifest(archive: string): Promise<RegistryManifest> {
  const child = Bun.spawn(["tar", "-xOf", archive, "package/package.json"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if (code !== 0) throw new Error(`Cannot inspect ${archive}: ${stderr}`);
  return JSON.parse(stdout) as RegistryManifest;
}
