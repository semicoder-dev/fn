import { mkdir, mkdtemp, readFile, readdir, lstat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import {
  hash,
  sha256,
  applicationRuntimeAssets,
  type ReleaseFile,
} from "./artifacts.ts";
import {
  BUNDLED_BUN_VERSION,
  CLI_VERSION,
  FIA_BACKEND_PROTOCOL_VERSION,
} from "./metadata.ts";
import { safeRelative, type ResolvedFIAConfig } from "./project-config.ts";
import { verifyRelease } from "./updates.ts";
import { bunEntitlements, hardenedRuntimeArguments } from "./runtime-recipe.ts";

export const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
        )
      : item,
  );

/** A reviewed, content-addressed reference to an already distributed runtime. */
export interface RuntimeLock {
  schema: 1;
  origin: {
    url: string;
    sha256: string;
    manifestURL: string;
    manifestSHA256: string;
    sourceCommit: string;
  };
  runtimeId: string;
  teamIdentifier: string;
  appName: string;
  configuration: string;
  nativeInputs: string;
  files: ReleaseFile[];
}
export interface RuntimeBaseline {
  app: string;
  lock: RuntimeLock;
  lockSHA256: string;
}
const verified = new WeakSet<RuntimeBaseline>();
const requireValue = (value: unknown, message: string): void => {
  if (!value) throw new Error(message);
};
export function parseRuntimeLock(value: unknown): RuntimeLock {
  const lock = value as RuntimeLock;
  requireValue(
    lock?.schema === 1 &&
      /^[A-Za-z0-9 _.-]+$/.test(lock.appName) &&
      ![".", ".."].includes(lock.appName) &&
      /^[A-Z0-9]{10}$/.test(lock.teamIdentifier),
    "Invalid runtime lock identity",
  );
  for (const digest of [
    lock.runtimeId,
    lock.configuration,
    lock.nativeInputs,
    lock.origin?.sha256,
    lock.origin?.manifestSHA256,
  ])
    requireValue(
      typeof digest === "string" && /^[a-f0-9]{64}$/.test(digest),
      "Invalid runtime lock digest",
    );
  requireValue(
    /^[a-f0-9]{40}$/.test(lock.origin.sourceCommit),
    "Invalid runtime source commit",
  );
  for (const url of [lock.origin.url, lock.origin.manifestURL]) {
    const parsed = new URL(url);
    requireValue(
      parsed.protocol === "https:" && !parsed.username && !parsed.password,
      "Runtime origin must be HTTPS",
    );
  }
  requireValue(
    Array.isArray(lock.files) && lock.files.length > 0,
    "Runtime files missing",
  );
  const seen = new Set<string>();
  for (const file of lock.files) {
    requireValue(
      safeRelative(file.path) &&
        file.path.startsWith("Contents/") &&
        !file.path.startsWith("Contents/Resources/code/") &&
        !file.path.startsWith("Contents/_CodeSignature/") &&
        !seen.has(file.path.toLowerCase()) &&
        Number.isSafeInteger(file.size) &&
        file.size >= 0 &&
        /^[a-f0-9]{64}$/.test(file.sha256),
      "Invalid or duplicate runtime file",
    );
    seen.add(file.path.toLowerCase());
  }
  for (const path of [
    "Contents/MacOS/FIAHost",
    "Contents/Helpers/bun",
    "Contents/Info.plist",
    "Contents/Resources/fia.runtime.json",
    "Contents/Resources/agent-cli.js",
    "Contents/Resources/script-preload.js",
  ])
    requireValue(seen.has(path.toLowerCase()), "Runtime file missing: " + path);
  return lock;
}

/** Excludes product version/build, paths, signing timestamps and build-machine identity. */
export async function runtimeConfiguration(config: ResolvedFIAConfig) {
  const signing = config.signing?.application?.production;
  return hash(
    canonical({
      framework: CLI_VERSION,
      bun: BUNDLED_BUN_VERSION,
      protocol: FIA_BACKEND_PROTOCOL_VERSION,
      name: config.app.name,
      identifier: config.app.identifier,
      minimumOS: "14.0",
      agent: {
        command: config.agent.command,
        description: config.agent.description,
      },
      statusItem: config.statusItem ?? null,
      updates: config.updates ?? null,
      permissions: config.permissions,
      startupTimeoutMs: config.backend.startupTimeoutMs,
      signing: config.signing?.releaseIdentity ?? null,
      bunEntitlements,
      hardenedRuntimeArguments,
      entitlements: signing
        ? await sha256(resolve(config.projectRoot, signing.entitlements))
        : null,
      provisioningProfile: signing?.provisioningProfile
        ? await sha256(resolve(config.projectRoot, signing.provisioningProfile))
        : null,
      cloudKitContainers: signing?.cloudKitContainers ?? [],
      icon: config.app.icon
        ? await sha256(resolve(config.projectRoot, config.app.icon))
        : null,
      assets: await applicationRuntimeAssets(config),
      agentCLI: await sha256(resolve(import.meta.dir, "../dist/agent-cli.js")),
      scriptPreload: await sha256(
        resolve(import.meta.dir, "../dist/script-preload.js"),
      ),
    }),
  );
}

export async function runtimeFiles(app: string): Promise<ReleaseFile[]> {
  const files: ReleaseFile[] = [];
  async function walk(path: string) {
    if (["Contents/Resources/code", "Contents/_CodeSignature"].includes(path))
      return;
    const absolute = resolve(app, path);
    const stat = await lstat(absolute);
    requireValue(
      !stat.isSymbolicLink(),
      "Symlink in runtime baseline: " + path,
    );
    if (stat.isDirectory()) {
      for (const child of (await readdir(absolute)).sort())
        await walk(path + "/" + child);
    } else {
      requireValue(stat.isFile(), "Non-file runtime asset");
      files.push({ path, size: stat.size, sha256: await sha256(absolute) });
    }
  }
  await walk("Contents");
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function run(args: string[]) {
  const child = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
  const [code, out, err] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code) throw new Error(args[0] + " failed: " + err + out);
  return out + err;
}
export async function verifyBaselineSignature(app: string, team: string) {
  await run(["/usr/bin/codesign", "--verify", "--deep", "--strict", app]);
  const details = await run(["/usr/bin/codesign", "-dvv", app]);
  requireValue(
    details.includes("TeamIdentifier=" + team) &&
      details.includes("Authority=Developer ID Application:") &&
      details.includes("(runtime)"),
    "Unexpected runtime signing authority",
  );
}
async function download(url: string, checksum: string, destination: string) {
  if (await Bun.file(destination).exists()) {
    requireValue(
      (await sha256(destination)) === checksum,
      "Cached runtime artifact is corrupt",
    );
    return;
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  requireValue(
    response.ok,
    "Cannot download locked runtime: " + response.status,
  );
  const data = new Uint8Array(await response.arrayBuffer());
  requireValue(
    hash(data) === checksum,
    "Downloaded runtime artifact digest mismatch",
  );
  await mkdir(dirname(destination), { recursive: true });
  await Bun.write(destination, data);
}

/** No compilation fallback. Only this verifier can create a consumable baseline. */
export async function withRuntimeBaseline<T>(
  config: ResolvedFIAConfig,
  lockPath: string,
  action: (baseline: RuntimeBaseline) => Promise<T>,
  options: { cacheDirectory?: string } = {},
): Promise<T> {
  const text = await readFile(lockPath, "utf8");
  const lock = parseRuntimeLock(JSON.parse(text));
  requireValue(
    (await runtimeConfiguration(config)) === lock.configuration,
    "Fixed runtime configuration changed; prepare an explicit installer release",
  );
  const cache =
    options.cacheDirectory ??
    resolve(config.projectRoot, ".fia/runtime-baselines", lock.origin.sha256);
  const dmg = resolve(cache, "baseline.dmg"),
    manifest = resolve(cache, "latest.json");
  await download(lock.origin.url, lock.origin.sha256, dmg);
  await download(lock.origin.manifestURL, lock.origin.manifestSHA256, manifest);
  requireValue(
    config.updates,
    "A runtime baseline requires a trusted update public key",
  );
  const release = verifyRelease(
    JSON.parse(await readFile(manifest, "utf8")),
    config.updates!.publicKey,
  );
  requireValue(
    release.runtimeId === lock.runtimeId &&
      release.identifier === config.app.identifier,
    "Runtime lock is not bound to its signed public release",
  );
  await run(["/usr/bin/hdiutil", "verify", dmg]);
  await run(["/usr/bin/xcrun", "stapler", "validate", dmg]);
  await run([
    "/usr/sbin/spctl",
    "-a",
    "-t",
    "open",
    "--context",
    "context:primary-signature",
    dmg,
  ]);
  const directory = await mkdtemp(resolve(tmpdir(), "fia-runtime-"));
  const mount = resolve(directory, "mount");
  let mounted = false;
  try {
    await run([
      "/usr/bin/hdiutil",
      "attach",
      dmg,
      "-readonly",
      "-nobrowse",
      "-mountpoint",
      mount,
    ]);
    mounted = true;
    const app = resolve(mount, lock.appName + ".app");
    await verifyBaselineSignature(app, lock.teamIdentifier);
    requireValue(
      canonical(await runtimeFiles(app)) === canonical(lock.files),
      "Fixed runtime files differ from the lock",
    );
    const runtime = JSON.parse(
      await readFile(
        resolve(app, "Contents/Resources/fia.runtime.json"),
        "utf8",
      ),
    );
    const factory = JSON.parse(
      await readFile(
        resolve(app, "Contents/Resources/code/manifest.json"),
        "utf8",
      ),
    );
    requireValue(
      runtime.runtimeId === lock.runtimeId &&
        factory.runtimeId === lock.runtimeId &&
        factory.version === release.version &&
        factory.build === release.build &&
        runtime.app.identifier === release.identifier &&
        canonical(factory.files) === canonical(release.files),
      "Baseline installer and signed update disagree",
    );
    for (const file of release.files)
      requireValue(
        safeRelative(file.path) &&
          (await sha256(resolve(app, "Contents/Resources/code", file.path))) ===
            file.sha256,
        "Baseline factory code integrity failure",
      );
    const baseline = { app, lock, lockSHA256: hash(text) };
    verified.add(baseline);
    try {
      return await action(baseline);
    } finally {
      verified.delete(baseline);
    }
  } finally {
    if (mounted) await run(["/usr/bin/hdiutil", "detach", mount]);
    await rm(directory, { recursive: true, force: true });
  }
}
export function assertVerifiedBaseline(baseline: RuntimeBaseline) {
  requireValue(
    verified.has(baseline),
    "Runtime baseline has not been verified or is no longer mounted",
  );
}
