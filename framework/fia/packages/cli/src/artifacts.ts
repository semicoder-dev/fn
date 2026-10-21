import { createHash } from "node:crypto";
import { readFile, lstat, readdir, realpath, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, sep, dirname } from "node:path";
import { CLI_VERSION, BUNDLED_BUN_VERSION, FIA_BACKEND_PROTOCOL_VERSION } from "./metadata.ts";
import { safeRelative, runtimeAssetSources, type ResolvedFIAConfig } from "./project-config.ts";

export const assetDirectory = resolve(import.meta.dir, "../assets/darwin-arm64");
export const hash = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
export const sha256 = async (path: string) => hash(await readFile(path));
export interface RuntimeAssets {
  schema: number;
  frameworkVersion: string;
  bunVersion: string;
  protocol: number;
  architecture: string;
  hostSHA256: string;
  bunSHA256: string;
}
export async function verifyAssets(directory = assetDirectory): Promise<RuntimeAssets> {
  let value: RuntimeAssets;
  try {
    value = JSON.parse(await readFile(resolve(directory, "manifest.json"), "utf8"));
  } catch {
    throw new Error(
      "Precompiled FIA runtime is missing. Reinstall @semicoder/fia; framework maintainers must run bun run runtime:build. No Swift fallback is available.",
    );
  }
  if (
    value.schema !== 1 ||
    value.frameworkVersion !== CLI_VERSION ||
    value.bunVersion !== BUNDLED_BUN_VERSION ||
    value.protocol !== FIA_BACKEND_PROTOCOL_VERSION ||
    value.architecture !== "arm64"
  )
    throw new Error("Precompiled runtime does not match the CLI");
  for (const [name, checksum] of [
    ["FIAHost", value.hostSHA256],
    ["bun", value.bunSHA256],
  ]) {
    const path = resolve(directory, name!);
    if ((await sha256(path)) !== checksum || !(await lstat(path)).isFile())
      throw new Error("Precompiled runtime integrity failed: " + name);
    const header = (await readFile(path)).subarray(0, 8);
    if (header.readUInt32LE(0) !== 0xfeedfacf || header.readUInt32LE(4) !== 0x0100000c)
      throw new Error("Runtime must be an arm64 Mach-O: " + name);
  }
  return value;
}
export interface RuntimeAssetFile {
  path: string;
  size: number;
  sha256: string;
}
/** Read an immutable input snapshot; optional destination is outside the code release tree. */
export async function applicationRuntimeAssets(
  config: ResolvedFIAConfig,
  destination?: string,
): Promise<RuntimeAssetFile[]> {
  const files: RuntimeAssetFile[] = [];
  for (const { path, source } of await runtimeAssetSources(config)) {
    const data = await readFile(source);
    if (destination) {
      const target = resolve(destination, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, data, { flag: "wx", mode: 0o644 });
    }
    files.push({ path, size: data.length, sha256: hash(data) });
  }
  return files;
}
export async function runtimeId(
  config: ResolvedFIAConfig,
  assets: RuntimeAssets,
  applicationAssets?: readonly RuntimeAssetFile[],
): Promise<string> {
  const fixedAssets = applicationAssets ?? (await applicationRuntimeAssets(config));
  return hash(
    JSON.stringify({
      framework: assets.frameworkVersion,
      host: assets.hostSHA256,
      bun: assets.bunSHA256,
      agentCLI: await sha256(resolve(import.meta.dir, "../dist/agent-cli.js")),
      scriptPreload: await sha256(resolve(import.meta.dir, "../dist/script-preload.js")),
      identifier: config.app.identifier,
      agentCommand: config.agent.command,
      name: config.app.name,
      icon: config.app.icon ? await sha256(resolve(config.projectRoot, config.app.icon)) : null,
      minimumOS: "14.0",
      permissions: Object.fromEntries(Object.entries(config.permissions).sort()),
      statusItem: config.statusItem
        ? { symbol: config.statusItem.symbol, tooltip: config.statusItem.tooltip ?? null }
        : null,
      updates: config.updates
        ? {
            url: config.updates.url,
            publicKey: config.updates.publicKey,
            downloadURL: config.updates.downloadURL ?? null,
          }
        : null,
      signing: config.signing?.releaseIdentity ?? null,
      // Keep the legacy identity byte-for-byte when no immutable app assets are declared.
      ...(fixedAssets.length
        ? {
            assets: fixedAssets.map(({ path, sha256 }) => ({ path, sha256 })),
          }
        : {}),
    }),
  );
}
export interface ReleaseFile {
  path: string;
  size: number;
  sha256: string;
}
export interface CodeRelease {
  schema: 1;
  identifier: string;
  version: string;
  build: number;
  runtimeId: string;
  baseURL: string;
  downloadURL?: string;
  files: ReleaseFile[];
}
export async function releaseFiles(directory: string): Promise<ReleaseFile[]> {
  directory = await realpath(directory);
  const files: ReleaseFile[] = [];
  async function walk(path: string) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      const name = relative(directory, child).split(sep).join("/");
      if (!safeRelative(name) || entry.name.startsWith(".") || entry.isSymbolicLink())
        throw new Error("Unsafe code asset: " + name);
      if (entry.isDirectory()) {
        await walk(child);
        continue;
      }
      if (!entry.isFile()) throw new Error("Non-regular code asset: " + name);
      const data = await readFile(child);
      const magic = data.subarray(0, 4).toString("hex");
      if (
        /\.(node|dylib|so|exe)$/iu.test(name) ||
        [
          "cffaedfe",
          "cefaedfe",
          "feedfacf",
          "feedface",
          "cafebabe",
          "bebafeca",
          "7f454c46",
        ].includes(magic) ||
        data.subarray(0, 2).toString() === "MZ"
      )
        throw new Error(
          "Native binaries require a full runtime distribution and cannot be included in a code release: " +
            name,
        );
      if (data.length > 268_435_456) throw new Error("Code asset exceeds 256 MiB: " + name);
      files.push({ path: name, size: data.length, sha256: hash(data) });
    }
  }
  await walk(await realpath(directory));
  const names = files.map((file) => file.path.toLowerCase());
  if (
    new Set(names).size !== files.length ||
    files.length > 4096 ||
    files.reduce((n, f) => n + f.size, 0) > 536_870_912
  )
    throw new Error("Code release exceeds limits or contains case-insensitive path collisions");
  if (!names.includes("backend/index.js") || !names.includes("web/index.html"))
    throw new Error("Code release must include backend/index.js and web/index.html");
  return files.sort((a, b) => a.path.localeCompare(b.path));
}
