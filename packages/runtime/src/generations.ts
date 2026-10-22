import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, readlink, realpath, rename, rm, stat, symlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { gunzipSync } from "node:zlib";
import { copyGenerationDirectory } from "./copy-generation.ts";
import type { GenerationPhase } from "./generation-progress.ts";
import { archiveGitSource, parseGitSource } from "./git-source.ts";

/** This module deliberately imports no runtime, SDK, or Cordis package. */
export interface InstallExpectation {
  expected?: { id: string; packageName: string; version: string; sha256: string };
  updating?: { id: string; packageName: string; version: string };
  origin?: { source: string; marketId?: string; marketURL?: string };
}

export interface GenerationApplication {
  icon?: string;
  iconSvg?: string;
  id: string;
  name: string;
  description?: string;
  version: string;
  packageName: string;
  entry: string;
  client?: string;
  archive: string;
  /** Immutable extension installation, relative to the managed runtime root (schema 2). */
  storage?: string;
  dependencyLockSha256?: string | null;
  origin?: { source: string; marketId?: string; marketURL?: string };
}

interface StoredApplication extends Omit<GenerationApplication, "entry" | "client" | "archive"> {
  entry: string;
  client?: string;
  archive: string;
}

export interface SeedManifest {
  schemaVersion: 1;
  id: string;
  bunVersion: string;
  runtimeEntry: string;
  coreVersions: Record<string, string>;
  packages: { name: string; version: string; directory: string }[];
}

export interface SeedArchiveMetadata {
  schemaVersion: 1;
  id: string;
  sha256: string;
  bunVersion: string;
}

/** Materialize a signed app resource without ever writing inside the app bundle. */
export async function materializeRuntimeSeed(options: {
  archive: string;
  metadata: string;
  dataDirectory: string;
}): Promise<string> {
  const metadata = await json<SeedArchiveMetadata>(options.metadata);
  if (metadata.schemaVersion !== 1 || !/^[a-z0-9-]{1,80}$/.test(metadata.id)
    || !/^[a-f0-9]{64}$/.test(metadata.sha256) || metadata.bunVersion !== Bun.version)
    throw new Error("Invalid runtime seed archive metadata or Bun version");
  const bytes = await readFile(options.archive);
  if (digest(bytes) !== metadata.sha256) throw new Error("Runtime seed archive SHA-256 mismatch");
  const seeds = join(options.dataDirectory, "runtime", "seeds");
  const output = join(seeds, metadata.id);
  const existing = await optionalJson<SeedArchiveMetadata>(join(output, ".materialized.json"));
  if (existing?.sha256 === metadata.sha256) return output;
  // Published generations may reference this seed directly. Never replace its
  // contents, even if a different archive incorrectly reuses the same identity.
  try {
    await stat(output);
    throw new Error("Runtime seed identity already exists with different or incomplete metadata");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await mkdir(seeds, { recursive: true, mode: 0o700 });
  const staging = join(seeds, `.extract-${randomUUID()}`);
  await mkdir(staging, { mode: 0o700 });
  try {
    const names = (await execute(["/usr/bin/tar", "-tzf", options.archive], staging)).trim().split("\n");
    const listing = (await execute(["/usr/bin/tar", "-tvzf", options.archive], staging)).trim().split("\n");
    if (names.length > 100_000 || names.length !== listing.length) throw new Error("Invalid runtime seed archive listing");
    for (let i = 0; i < names.length; i++) {
      const name = names[i]!;
      if (name !== "./" && (!name.startsWith("./") || /[\x00-\x1f\\]/.test(name)))
        throw new Error("Invalid runtime seed archive path");
      const filename = relativeFile(staging, name);
      const line = listing[i]!;
      if (!["-", "d", "l"].includes(line[0] ?? "")) throw new Error("Unsupported runtime seed archive entry");
      if (line[0] === "l") {
        const marker = line.lastIndexOf(" -> ");
        const target = marker >= 0 ? line.slice(marker + 4) : "";
        if (!target || isAbsolute(target) || /[\x00-\x1f\\]/.test(target)
          || !within(staging, resolve(dirname(filename), target)))
          throw new Error("Runtime seed archive link escapes its directory");
      }
    }
    await execute(["/usr/bin/tar", "--no-same-owner", "--no-same-permissions", "-xzf", options.archive], staging, 180_000);
    const canonical = await realpath(staging);
    const auditLinks = async (directory: string) => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const filename = join(directory, entry.name);
        if (entry.isDirectory()) await auditLinks(filename);
        else if (entry.isSymbolicLink()) {
          if (isAbsolute(await readlink(filename)) || !within(canonical, await realpath(filename)))
            throw new Error("Runtime seed contains a nonportable link");
        } else if (!entry.isFile()) throw new Error("Runtime seed contains a special file");
      }
    };
    await auditLinks(staging);
    const seed = await json<SeedManifest>(join(staging, "seed.json"));
    if (seed.id !== metadata.id || seed.bunVersion !== metadata.bunVersion || seed.schemaVersion !== 1)
      throw new Error("Runtime seed manifest differs from archive metadata");
    await verifyGenerationDependencies(staging, seed.coreVersions, ["@semicoder/fn-runtime", "@semicoder/fn-sdk"]);
    await atomicJson(join(staging, ".materialized.json"), metadata);
    await rename(staging, output);
    return output;
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

export interface GenerationManifest {
  schemaVersion: 1 | 2;
  /** Shared core directory relative to the managed runtime root. */
  core?: string;
  id: string;
  seedId: string;
  createdAt: string;
  runtimeEntry: string;
  coreVersions: Record<string, string>;
  applications: StoredApplication[];
  dependencyLockSha256: string | null;
}

export interface Generation {
  id: string;
  directory: string;
  runtimeEntry: string;
  applications: GenerationApplication[];
  manifest: GenerationManifest;
}

interface ActivePointer {
  schemaVersion: 1;
  id: string;
  state: "ready" | "activating";
  previousId?: string;
  attempted?: boolean;
}

export interface GenerationManagerOptions {
  dataDirectory: string;
  seedDirectory: string;
  execPath?: string;
  progress?: (phase: GenerationPhase) => void;
  busy: () => boolean | Promise<boolean>;
  /** Commit the backend restart after the durable activation pointer is written. */
  restart: (next: Generation, previous: Generation) => void | Promise<void>;
}

interface PackageManifest {
  name: string;
  version: string;
  type?: string;
  exports?: string | Record<string, unknown>;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  fn?: { schemaVersion: number; id: string; name: string; description?: string; icon?: string; iconSvg?: string };
}

const maxArchiveBytes = 64 * 1024 * 1024;
const maxExpandedBytes = 256 * 1024 * 1024;
const packageId = /^[a-z][a-z0-9-]{0,99}$/;
const generationId = /^[a-z0-9-]{1,100}$/;
/** Browser modules supplied by the host must remain singletons in every generation too. */
export const sharedFrontendPackages: readonly string[] = ["react", "react-dom"];
const sharedPackage = (name: string) =>
  name.startsWith("@deepseek-ai/") || name === "@semicoder/fn-sdk" || name === "@semicoder/fn-runtime"
    || sharedFrontendPackages.includes(name);

function digest(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function within(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

function relativeFile(root: string, value: string): string {
  if (!value || isAbsolute(value) || value.includes("\\") || value.split("/").includes(".."))
    throw new Error(`Invalid generation path: ${value}`);
  const target = resolve(root, value);
  if (!within(root, target)) throw new Error(`Path escapes generation: ${value}`);
  return target;
}

async function json<T>(filename: string): Promise<T> {
  return JSON.parse(await readFile(filename, "utf8")) as T;
}

async function optionalJson<T>(filename: string): Promise<T | undefined> {
  try { return await json<T>(filename); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}

async function atomicJson(filename: string, value: unknown): Promise<void> {
  await mkdir(dirname(filename), { recursive: true, mode: 0o700 });
  const temporary = `${filename}.${randomUUID()}.partial`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, filename);
}

async function execute(argv: string[], cwd: string, timeout = 60_000): Promise<string> {
  const child = Bun.spawn(argv, {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", BUN_INSTALL_CACHE_DIR: join(cwd, ".install-cache") },
    stdout: "pipe",
    stderr: "pipe",
  });
  const timer = setTimeout(() => child.kill("SIGKILL"), timeout);
  try {
    const [stdout, stderr, exit] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (exit !== 0) throw new Error(`${argv[1] ?? argv[0]} failed (${exit}): ${stderr || stdout}`);
    return stdout;
  } finally { clearTimeout(timer); }
}

function exportTarget(value: unknown, client = false): string | undefined {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const conditions = value as Record<string, unknown>;
  for (const name of client ? ["browser", "import", "default"] : ["bun", "import", "default"]) {
    const target = exportTarget(conditions[name], client);
    if (target) return target;
  }
}

function parseApplication(manifest: PackageManifest, core: Record<string, string>): {
  application: Omit<StoredApplication, "archive">;
  dependencies: boolean;
} {
  const metadata = manifest.fn;
  if (!metadata || metadata.schemaVersion !== 1 || !packageId.test(metadata.id))
    throw new Error("Application requires fn.schemaVersion 1 and a valid fn.id");
  if (typeof metadata.name !== "string" || !metadata.name.trim())
    throw new Error("Application name is required");
  if (metadata.icon !== undefined && (typeof metadata.icon !== "string" || !metadata.icon.length || metadata.icon.length > 4)) throw new Error("Invalid application icon text");
  if (metadata.iconSvg !== undefined && metadata.iconSvg !== "dist/icon.svg") throw new Error("Application iconSvg must be dist/icon.svg");
  if (typeof manifest.name !== "string" || !/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(manifest.name)
    || sharedPackage(manifest.name))
    throw new Error("Invalid npm package name");
  if (typeof manifest.version !== "string" || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(manifest.version))
    throw new Error("Application package version must be an exact SemVer");
  if (manifest.type !== "module") throw new Error("Application packages must use ESM (type: module)");
  for (const [name, range] of Object.entries({
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
  })) {
    if (sharedPackage(name) || /^npm:@(?:deepseek-ai|semicoder\/fn-)/.test(range))
      throw new Error(`Shared runtime ${name} must be an exact peer, never a bundled dependency`);
    if (!/^(?:\d|[~^><=*])/.test(range))
      throw new Error(`Application dependency ${name} must use an npm version range`);
  }
  for (const [name, version] of Object.entries(manifest.peerDependencies ?? {})) {
    if (!sharedPackage(name)) {
      if (!/^(?:\d|[~^><=*])/.test(version))
        throw new Error(`Application peer ${name} must use an npm version range`);
      continue;
    }
    if (!core[name] || version !== core[name])
      throw new Error(`Application requires ${name}@${version}; runtime provides ${core[name] ?? "none"}`);
  }
  if (manifest.peerDependencies?.["@semicoder/fn-sdk"] !== core["@semicoder/fn-sdk"])
    throw new Error("Application must declare the exact host SDK peer version");
  const exports = manifest.exports;
  const entry = exportTarget(typeof exports === "string" ? exports : exports?.["."]);
  const client = typeof exports === "object" ? exportTarget(exports?.["./client"], true) : undefined;
  if (!entry?.startsWith("./") || !/\.(?:ts|tsx|js|mjs)$/.test(entry))
    throw new Error("Application exports['.'] must reference an ESM TypeScript or JavaScript file");
  if (client && (!client.startsWith("./") || !/\.(?:js|mjs)$/.test(client)))
    throw new Error("Application exports['./client'] must reference browser JavaScript");
  return {
    application: {
      id: metadata.id,
      name: metadata.name,
      ...(metadata.icon ? { icon: metadata.icon } : {}),
      ...(metadata.description ? { description: metadata.description } : {}),
      version: manifest.version,
      packageName: manifest.name,
      entry,
      ...(client ? { client } : {}),
    },
    dependencies: Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies,
      ...manifest.peerDependencies }).some((name) => !sharedPackage(name)),
  };
}

async function assertPackageFiles(directory: string): Promise<void> {
  let total = 0;
  let files = 0;
  const walk = async (base: string) => {
    for (const entry of await readdir(base, { withFileTypes: true })) {
      if (entry.name === "node_modules" || /[\x00-\x1f\\]/.test(entry.name))
        throw new Error("Application archives cannot contain node_modules or control characters");
      const filename = join(base, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (entry.isFile()) {
        total += (await stat(filename)).size;
        if (++files > 10_000 || total > maxExpandedBytes) throw new Error("Application archive is too large");
      } else throw new Error("Application archives cannot contain links or special files");
    }
  };
  await walk(directory);
}

async function extractApplication(bytes: Uint8Array, staging: string): Promise<string> {
  if (bytes.length > maxArchiveBytes) throw new Error("Application archive exceeds 64 MiB");
  const tar = gunzipSync(bytes, { maxOutputLength: maxExpandedBytes });
  const filename = join(staging, "source.tar");
  await writeFile(filename, tar, { mode: 0o600 });
  const names = (await execute(["/usr/bin/tar", "-tf", filename], staging)).trim().split("\n");
  if (names.length > 10_000) throw new Error("Application archive has too many files");
  for (const name of names) {
    if (!name.startsWith("package/") || /[\x00-\x1f\\]/.test(name)
      || name.split("/").includes("..") || name.split("/").includes("node_modules"))
      throw new Error(`Invalid application archive member: ${name}`);
  }
  const listing = await execute(["/usr/bin/tar", "-tvf", filename], staging);
  if (listing.trim().split("\n").some((line) => !["-", "d"].includes(line[0] ?? "")))
    throw new Error("Application archives cannot contain links or special files");
  await execute(["/usr/bin/tar", "--no-same-owner", "--no-same-permissions", "-xf", filename], staging);
  const directory = join(staging, "package");
  await assertPackageFiles(directory);
  return directory;
}

async function sourceBytes(source: string): Promise<Uint8Array> {
  const git = parseGitSource(source);
  if (git) return archiveGitSource(git, execute);
  const npm = /^(?:npm:)?((?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*)(?:@([a-zA-Z0-9.+_-]+))?$/.exec(source);
  if (npm && !source.endsWith(".tgz")) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(npm[1]!)}/${encodeURIComponent(npm[2] ?? "latest")}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`npm 包不存在或无法访问：HTTP ${response.status}`);
    const text = await response.text();
    if (Buffer.byteLength(text) > 2 * 1024 * 1024) throw new Error("npm 包元数据超过大小上限");
    const pkg = JSON.parse(text);
    if (pkg.name !== npm[1] || typeof pkg.dist?.tarball !== "string" || !pkg.dist.tarball.startsWith("https://")) throw new Error("npm 包元数据无效");
    const bytes = await sourceBytes(pkg.dist.tarball);
    const integrity = /^sha512-([a-zA-Z0-9+/=]+)$/.exec(pkg.dist.integrity ?? "");
    if (!integrity || createHash("sha512").update(bytes).digest("base64") !== integrity[1]) throw new Error("npm 归档完整性校验失败");
    return bytes;
  }
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`Application download returned HTTP ${response.status}`);
    if (Number(response.headers.get("content-length") ?? 0) > maxArchiveBytes)
      throw new Error("Application archive exceeds 64 MiB");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Application download is empty");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        size += result.value.length;
        if (size > maxArchiveBytes) throw new Error("Application archive exceeds 64 MiB");
        chunks.push(result.value);
      }
    } finally { await reader.cancel(); }
    return Buffer.concat(chunks);
  }
  const filename = source.startsWith("file:") ? new URL(source) : source;
  if ((await stat(filename)).size > maxArchiveBytes) throw new Error("Application archive exceeds 64 MiB");
  return readFile(filename);
}

/** Locate a package without requiring it to export package.json or a runtime root. */
export async function findPackageDirectory(name: string, importer: string): Promise<string | undefined> {
  let base = resolve(importer);
  while (true) {
    const candidate = join(base, "node_modules", name);
    try {
      if ((await stat(join(candidate, "package.json"))).isFile()) return realpath(candidate);
    } catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
    }
    const parent = dirname(base);
    if (parent === base) return;
    base = parent;
  }
}

/** Audit the installed graph, including peers, before any application code is imported. */
export async function verifyGenerationDependencies(
  directory: string,
  coreVersions: Record<string, string>,
  roots: string[],
  references: { coreDirectory: string; applicationDirectories: string[] } | undefined = undefined,
): Promise<void> {
  directory = await realpath(directory);
  const coreDirectory = references ? await realpath(references.coreDirectory) : directory;
  const allowed = [directory, coreDirectory, ...await Promise.all((references?.applicationDirectories ?? []).map(path => realpath(path)))];
  const expected = new Map<string, string>();
  for (const [name, version] of Object.entries(coreVersions)) {
    const target = await findPackageDirectory(name, coreDirectory);
    if (!target || !within(coreDirectory, target)) throw new Error(`Missing shared runtime package: ${name}`);
    const manifest = await json<PackageManifest>(join(target, "package.json"));
    if (manifest.version !== version) throw new Error(`Shared runtime version differs: ${name}`);
    if (await findPackageDirectory(name, directory) !== target)
      throw new Error(`Duplicate shared runtime resolution: generation -> ${name}`);
    expected.set(name, target);
  }
  const visited = new Set<string>();
  const visit = async (base: string) => {
    const canonical = await realpath(base);
    if (!allowed.some(root => within(root, canonical))) throw new Error("Dependency points outside the generation references");
    if (visited.has(canonical)) return;
    visited.add(canonical);
    const manifest = await json<PackageManifest>(join(canonical, "package.json"));
    if (sharedPackage(manifest.name) && expected.get(manifest.name) !== canonical)
      throw new Error(`Duplicate or unapproved shared runtime instance: ${manifest.name}`);
    const dependencies = { ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies };
    for (const name of Object.keys(dependencies)) {
      const optional = name in (manifest.optionalDependencies ?? {})
        || Boolean(manifest.peerDependenciesMeta?.[name]?.optional);
      const target = await findPackageDirectory(name, canonical);
      if (!target) {
        if (optional) continue;
        throw new Error(`Missing dependency ${manifest.name} -> ${name}`);
      }
      if (sharedPackage(name) && target !== expected.get(name))
        throw new Error(`Duplicate shared runtime resolution: ${manifest.name} -> ${name}`);
      await visit(target);
    }
  };
  for (const name of roots) {
    const target = await findPackageDirectory(name, directory);
    if (!target) throw new Error(`Missing generation entry package: ${name}`);
    await visit(target);
  }
}

/** Immutable installation directories and a small transactional activation pointer. */
export class GenerationManager {
  readonly root: string;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(readonly options: GenerationManagerOptions) {
    this.root = join(options.dataDirectory, "runtime");
  }
  private serial<T>(callback: () => Promise<T>): Promise<T> {
    const task = this.queue.then(callback);
    this.queue = task.catch(() => {});
    return task;
  }
  private get activeFile() { return join(this.root, "active.json"); }
  private get pendingFile() { return join(this.root, "pending.json"); }
  private get errorFile() { return join(this.root, "last-error.json"); }
  private directory(id: string): string {
    if (!generationId.test(id)) throw new Error("Invalid generation identifier");
    return join(this.root, "generations", id);
  }
  private async generation(id: string): Promise<Generation> {
    const directory = this.directory(id);
    const manifest = await json<GenerationManifest>(join(directory, "generation.json"));
    if (![1, 2].includes(manifest.schemaVersion) || manifest.id !== id) throw new Error("Invalid generation manifest");
    if (manifest.schemaVersion === 2) {
      const managed = await realpath(this.root);
      const core = await realpath(this.coreDirectory({ directory, manifest }));
      if (!within(managed, core) || await realpath(join(directory, ".core")) !== core
        || !within(core, await realpath(relativeFile(directory, manifest.runtimeEntry))))
        throw new Error("Invalid shared core binding");
      for (const app of manifest.applications) {
        const extension = await realpath(this.extensionDirectory(app));
        const pkg = await realpath(join(extension, "package"));
        if (!within(managed, extension) || !within(extension, pkg)
          || !within(pkg, await realpath(relativeFile(directory, app.entry)))
          || (app.client && !within(pkg, await realpath(relativeFile(directory, app.client))))
          || await realpath(relativeFile(directory, app.archive)) !== join(extension, "archive.tgz")
          || app.dependencyLockSha256 !== await this.lockHash(extension))
          throw new Error("Invalid extension binding or lockfile");
      }
    }
    return {
      id, directory, manifest,
      runtimeEntry: relativeFile(directory, manifest.runtimeEntry),
      applications: manifest.applications.map((app) => ({
        ...app,
        entry: relativeFile(directory, app.entry),
        archive: relativeFile(directory, app.archive),
        ...(app.client ? { client: relativeFile(directory, app.client) } : {}),
      })),
    };
  }
  async current(): Promise<Generation | null> {
    const pointer = await optionalJson<ActivePointer>(this.activeFile);
    return pointer ? this.generation(pointer.id) : null;
  }
  async listApplications(): Promise<GenerationApplication[]> {
    return (await this.current())?.applications ?? [];
  }
  async status(): Promise<{ currentId: string | null; pendingId?: string; lastError?: string }> {
    const active = await optionalJson<ActivePointer>(this.activeFile);
    const pending = await optionalJson<{ id: string }>(this.pendingFile);
    const error = await optionalJson<{ message: string }>(this.errorFile);
    return { currentId: active?.id ?? null, ...(pending ? { pendingId: pending.id } : {}),
      ...(error ? { lastError: error.message } : {}) };
  }
  private coreDirectory(generation: Pick<Generation, "directory" | "manifest">): string {
    if (generation.manifest.schemaVersion === 1) return generation.directory;
    const ref = generation.manifest.core;
    if (!ref || !/^(?:cores|seeds|generations)\/[a-z0-9-]+$/.test(ref)) throw new Error("Invalid shared core reference");
    return relativeFile(this.root, ref);
  }
  private extensionDirectory(application: StoredApplication): string {
    if (!application.storage || !/^extensions\/[a-z0-9-]+$/.test(application.storage)) throw new Error("Invalid extension reference");
    return relativeFile(this.root, application.storage);
  }
  private async link(directory: string, name: string, target: string): Promise<void> {
    const filename = join(directory, name);
    await mkdir(dirname(filename), { recursive: true });
    // Candidate and published generation directories have the same depth.
    // Canonical relative links also survive moving the complete data directory.
    await symlink(relative(await realpath(dirname(filename)), await realpath(target)), filename);
  }
  private async assemble(directory: string, core: string, versions: Record<string, string>, applications: StoredApplication[]): Promise<void> {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await this.link(directory, ".core", core);
    for (const name of Object.keys(versions)) {
      const target = await findPackageDirectory(name, core);
      if (!target) throw new Error(`Missing shared runtime package: ${name}`);
      await this.link(directory, `node_modules/${name}`, target);
    }
    for (const app of applications) {
      const extension = this.extensionDirectory(app);
      await this.link(directory, `applications/${app.id}`, join(extension, "package"));
      await this.link(directory, `node_modules/${app.packageName}`, join(extension, "package"));
      await this.link(directory, app.archive, join(extension, "archive.tgz"));
    }
    // A generation is a selection, not a package-manager workspace. Only extension
    // installation directories have package.json / bun.lock and may run an installer.
  }
  private async verify(directory: string, core: string, versions: Record<string, string>, applications: StoredApplication[]): Promise<void> {
    await verifyGenerationDependencies(directory, versions,
      ["@semicoder/fn-runtime", "@semicoder/fn-sdk", ...applications.map(app => app.packageName)],
      { coreDirectory: core, applicationDirectories: applications.map(app => this.extensionDirectory(app)) });
  }
  private async materializeSeed(seed: SeedManifest, seedDirectory = this.options.seedDirectory): Promise<Generation> {
    if (seed.schemaVersion !== 1 || seed.bunVersion !== Bun.version || !generationId.test(seed.id))
      throw new Error(`Runtime seed requires schema 1 and Bun ${seed.bunVersion}`);
    const id = `shared-${seed.id}`;
    const directory = this.directory(id);
    const existing = await optionalJson<GenerationManifest>(join(directory, "generation.json"));
    if (existing) return this.generation(id);
    let core = join(this.root, "seeds", seed.id);
    if (resolve(seedDirectory) !== resolve(core)) {
      core = join(this.root, "cores", seed.id);
      await mkdir(dirname(core), { recursive: true, mode: 0o700 });
      if (!await optionalJson(join(core, "seed.json"))) {
        const temporary = `${core}.${randomUUID()}.partial`;
        try {
          this.options.progress?.("copy");
          await copyGenerationDirectory(seedDirectory, temporary);
          await verifyGenerationDependencies(temporary, seed.coreVersions, ["@semicoder/fn-runtime", "@semicoder/fn-sdk"]);
          await rename(temporary, core);
        } finally { await rm(temporary, { recursive: true, force: true }); }
      }
    }
    const staging = join(this.root, "generations", `initial-${randomUUID()}`);
    try {
      await this.assemble(staging, core, seed.coreVersions, []);
      const manifest: GenerationManifest = {
        schemaVersion: 2, id, core: relative(this.root, core), seedId: seed.id, createdAt: new Date().toISOString(),
        runtimeEntry: `.core/${seed.runtimeEntry}`, coreVersions: seed.coreVersions, applications: [],
        dependencyLockSha256: await this.lockHash(core),
      };
      this.options.progress?.("verify");
      await this.verify(staging, core, seed.coreVersions, []);
      await atomicJson(join(staging, "generation.json"), manifest);
      await rename(staging, directory);
      return this.generation(id);
    } finally { await rm(staging, { recursive: true, force: true }); }
  }
  /** Adopt an old full-tree generation without changing it or the active pointer. */
  private async layered(current: Generation): Promise<Generation> {
    if (current.manifest.schemaVersion === 2) return current;
    const id = `gen-${randomUUID()}`;
    const directory = this.directory(id);
    await this.assemble(directory, current.directory, current.manifest.coreVersions, []);
    await atomicJson(join(directory, "generation.json"), {
      ...current.manifest, schemaVersion: 2, id, core: relative(this.root, current.directory),
      runtimeEntry: `.core/${current.manifest.runtimeEntry}`, applications: [],
    } satisfies GenerationManifest);
    let next = await this.generation(id);
    for (const app of current.applications) next = await this.buildCandidate(next, app.archive, false, { origin: app.origin });
    return next;
  }
  async initialize(): Promise<Generation> {
    return this.serial(async () => {
      await mkdir(join(this.root, "generations"), { recursive: true, mode: 0o700 });
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (pointer) {
        if (pointer.state === "activating" && pointer.attempted && pointer.previousId) {
          const failed = await this.generation(pointer.id);
          await atomicJson(this.activeFile, { schemaVersion: 1, id: pointer.previousId, state: "ready" });
          await atomicJson(this.errorFile, { seedId: failed.manifest.seedId, activeId: pointer.previousId,
            message: `Runtime activation ${pointer.id} did not finish; restored ${pointer.previousId}` });
          const pending = await optionalJson<{ id: string }>(this.pendingFile);
          if (pending?.id === pointer.id) await rm(this.pendingFile, { force: true });
          return this.generation(pointer.previousId);
        }
        if (pointer.state === "activating")
          await atomicJson(this.activeFile, { ...pointer, attempted: true });
        // Existing generations must boot without reinstalling applications or
        // consulting the registry. A new app seed is prepared by stageSeed()
        // after the old backend is ready, outside FIA's readiness deadline.
        return this.generation(pointer.id);
      }
      const seed = await json<SeedManifest>(join(this.options.seedDirectory, "seed.json"));
      const initial = await this.materializeSeed(seed);
      await atomicJson(this.activeFile, { schemaVersion: 1, id: initial.id, state: "ready" });
      return initial;
    });
  }
  private async lockHash(directory: string): Promise<string | null> {
    try { return digest(await readFile(join(directory, "bun.lock"))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  /** Build a new engine with the complete selected application set; never switch the active pointer here. */
  async stageSeed(seedDirectory = this.options.seedDirectory): Promise<Generation> {
    return this.serial(async () => {
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (!pointer || pointer.state !== "ready") throw new Error("Runtime is not ready for a seed upgrade");
      const active = await this.generation(pointer.id);
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      const source = pending ? await this.generation(pending.id) : active;
      let seedId: string | undefined;
      try {
        const seed = await json<SeedManifest>(join(seedDirectory, "seed.json"));
        seedId = seed.id;
        if (seed.schemaVersion !== 1 || seed.bunVersion !== Bun.version)
          throw new Error("Unsupported runtime seed schema or Bun version");
        if (source.manifest.seedId === seed.id) return source;
        const failed = await optionalJson<{ seedId?: string; activeId?: string; sourceId?: string; message: string }>(this.errorFile);
        if (failed?.seedId === seed.id && failed.activeId === active.id &&
          (failed.sourceId ?? active.id) === source.id) throw new Error(failed.message);
        let candidate = await this.materializeSeed(seed, seedDirectory);
        for (const application of source.applications)
          candidate = await this.buildCandidate(candidate, application.archive, false, { origin: application.origin });
        // buildCandidate preflights every application and the runtime together.
        // An empty application set still needs to validate the new runtime entry.
        if (!source.applications.length) {
          this.options.progress?.("preflight");
          await execute([this.options.execPath ?? process.execPath, "--no-env-file", "--no-install", "--no-macros",
            "--eval", `await import(${JSON.stringify(candidate.runtimeEntry)});`], candidate.directory);
        }
        await atomicJson(this.pendingFile, { schemaVersion: 1, id: candidate.id });
        await rm(this.errorFile, { force: true });
        return candidate;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await atomicJson(this.errorFile, {
          seedId, activeId: active.id, sourceId: source.id,
          message: message.startsWith("Runtime seed upgrade failed:") ? message : `Runtime seed upgrade failed: ${message}`,
        });
        throw error;
      }
    });
  }
  async stageInstall(source: string, options: InstallExpectation = {}): Promise<Generation> {
    return this.serial(async () => {
      const active = await this.current();
      if (!active) throw new Error("Initialize the runtime before installing an application");
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (pointer?.state === "activating") throw new Error("Runtime activation is in progress");
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      const current = pending ? await this.generation(pending.id) : active;
      return this.buildCandidate(current, source, true, options);
    });
  }
  private async buildCandidate(current: Generation, source: string, pending = true, options: InstallExpectation = {}): Promise<Generation> {
      current = await this.layered(current);
      const staging = join(this.root, `install-${randomUUID()}`);
      const unpack = join(staging, "unpack");
      const candidate = join(staging, "candidate");
      await mkdir(unpack, { recursive: true, mode: 0o700 });
      let extension: string | undefined;
      let published = false;
      try {
        this.options.progress?.("download");
        const bytes = await sourceBytes(source);
        this.options.progress?.("extract");
        if (options.expected && digest(bytes) !== options.expected.sha256) throw new Error("市场归档 SHA-256 不匹配");
        const extracted = await extractApplication(bytes, unpack);
        const pkg = await json<PackageManifest>(join(extracted, "package.json"));
        const parsed = parseApplication(pkg, current.manifest.coreVersions);
        if (pkg.fn?.iconSvg) {
          const svg = await readFile(join(extracted, pkg.fn.iconSvg), "utf8");
          if (Buffer.byteLength(svg) > 8192 || !/^(?:\s|\uFEFF)*(?:<\?xml\s[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg(?=[\s/>])[^>]*(?:\/>|>[\s\S]*<\/svg>)\s*$/.test(svg)) throw new Error("Application icon must be an SVG image of at most 8 KiB");
          parsed.application.iconSvg = svg;
        }
        if (options.updating && (parsed.application.id !== options.updating.id || parsed.application.packageName !== options.updating.packageName || Bun.semver.order(parsed.application.version, options.updating.version) < 0))
          throw new Error("更新归档身份不一致或版本低于已安装版本");
        if (options.expected && ["id", "packageName", "version"].some(key => parsed.application[key as "id" | "packageName" | "version"] !== options.expected![key as "id" | "packageName" | "version"]))
          throw new Error("归档身份与市场声明不一致");
        const id = `gen-${randomUUID()}`;
        const appDirectory = `applications/${parsed.application.id}`;
        this.options.progress?.("copy");
        extension = join(this.root, "extensions", randomUUID());
        await mkdir(extension, { recursive: true, mode: 0o700 });
        await rename(extracted, join(extension, "package"));
        const archive = `.archives/${parsed.application.id}-${digest(bytes)}.tgz`;
        await writeFile(join(extension, "archive.tgz"), bytes, { mode: 0o600 });
        const application: StoredApplication = {
          ...parsed.application,
          entry: `${appDirectory}/${parsed.application.entry.slice(2)}`,
          ...(parsed.application.client ? { client: `${appDirectory}/${parsed.application.client.slice(2)}` } : {}),
          archive, storage: relative(this.root, extension),
          origin: options.origin ?? (pending ? { source } : undefined),
        };
        for (const file of [application.entry, application.client].filter((value): value is string => Boolean(value))) {
          const filename = relativeFile(join(extension, "package"), file.slice(appDirectory.length + 1));
          if (!(await stat(filename)).isFile()) throw new Error(`Application export is not a file: ${file}`);
        }
        const applications = current.manifest.applications.filter((app) => app.id !== application.id);
        if (applications.some((app) => app.packageName === application.packageName))
          throw new Error("Another application already uses this npm package name");
        applications.push(application);
        applications.sort((left, right) => left.id.localeCompare(right.id));
        const core = this.coreDirectory(current);
        this.options.progress?.("dependencies");
        await this.prepareExtension(extension, pkg, core, current.manifest.coreVersions, parsed.dependencies);
        application.dependencyLockSha256 = await this.lockHash(extension);
        await this.assemble(candidate, core, current.manifest.coreVersions, applications);
        this.options.progress?.("verify");
        await this.verify(candidate, core, current.manifest.coreVersions, applications);
        this.options.progress?.("preflight");
        const entryPaths = [current.manifest.runtimeEntry, ...applications.map((app) => app.entry)];
        const preflight = join(candidate, ".preflight.ts");
        await writeFile(preflight,
          `for (const file of ${JSON.stringify(entryPaths)}) await import(new URL(file, import.meta.url).href);\n`);
        await execute([this.options.execPath ?? process.execPath, "--no-env-file", "--no-install", "--no-macros", preflight],
          candidate);
        await rm(preflight);
        const manifest: GenerationManifest = {
          ...current.manifest, id, createdAt: new Date().toISOString(), applications,
          dependencyLockSha256: current.manifest.dependencyLockSha256,
        };
        await atomicJson(join(candidate, "generation.json"), manifest);
        await rename(candidate, this.directory(id));
        published = true;
        if (pending) await atomicJson(this.pendingFile, { schemaVersion: 1, id });
        return this.generation(id);
      } finally {
        await rm(staging, { recursive: true, force: true });
        if (extension && !published) await rm(extension, { recursive: true, force: true });
      }
  }
  private async prepareExtension(directory: string, pkg: PackageManifest, core: string, versions: Record<string, string>, needsInstall: boolean): Promise<void> {
    const external = (values: Record<string, string> = {}) => Object.fromEntries(Object.entries(values).filter(([name]) => !sharedPackage(name)));
    const peers = external(pkg.peerDependencies);
    const optionalPeers = Object.fromEntries(Object.entries(peers).filter(([name]) => pkg.peerDependenciesMeta?.[name]?.optional));
    const dependencies = { ...Object.fromEntries(Object.entries(peers).filter(([name]) => !pkg.peerDependenciesMeta?.[name]?.optional)), ...external(pkg.dependencies) };
    const optionalDependencies = { ...optionalPeers, ...external(pkg.optionalDependencies) };
    const overrides: Record<string, string> = {};
    if (needsInstall) {
      for (const [name, version] of Object.entries(versions)) {
        const path = `.host-peers/${name.replaceAll("/", "_")}`;
        overrides[name] = `file:./${path}`;
        await atomicJson(join(directory, path, "package.json"), { name, version, private: true });
      }
    }
    await atomicJson(join(directory, "package.json"), { name: "fn-extension-dependencies", private: true, type: "module", dependencies, optionalDependencies, overrides });
    if (needsInstall) {
      const executable = this.options.execPath ?? process.execPath;
      await execute([executable, "install", "--ignore-scripts", "--omit=dev", "--linker=hoisted", "--registry=https://registry.npmjs.org"], directory, 180_000);
      if (!await this.lockHash(directory)) throw new Error("Dependency installation did not produce a lockfile");
      await execute([executable, "install", "--ignore-scripts", "--production", "--linker=hoisted", "--frozen-lockfile", "--registry=https://registry.npmjs.org"], directory, 180_000);
      await rm(join(directory, ".install-cache"), { recursive: true, force: true });
      // Replace only the installer's local, metadata-only host placeholders.
      // Unexpected actual core copies/aliases remain for the graph audit to reject.
      const wire = async (modules: string): Promise<void> => {
        let entries;
        try { entries = await readdir(modules, { withFileTypes: true }); }
        catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; }
        for (const entry of entries) {
          if (entry.name.startsWith(".")) continue;
          const path = join(modules, entry.name);
          if (entry.name.startsWith("@")) { await wire(path); continue; }
          const manifest = await optionalJson<PackageManifest>(join(path, "package.json"));
          if (!manifest) continue;
          if (sharedPackage(manifest.name)) {
            const declared = join(directory, ".host-peers", manifest.name.replaceAll("/", "_"), "package.json");
            if (!versions[manifest.name] || await readFile(join(path, "package.json"), "utf8") !== await readFile(declared, "utf8"))
              throw new Error(`Unexpected installed shared runtime package: ${manifest.name}`);
            await rm(path, { recursive: true, force: true });
            await this.link(dirname(path), entry.name, (await findPackageDirectory(manifest.name, core))!);
          } else await wire(join(path, "node_modules"));
        }
      };
      await wire(join(directory, "node_modules"));
    } else {
      // Let the pinned Bun version produce its empty lock format, without registry
      // access, dependency installation, or exposing any shared core links to it.
      await execute([this.options.execPath ?? process.execPath, "install", "--offline", "--lockfile-only", "--ignore-scripts"], directory);
    }
    for (const name of Object.keys(versions)) {
      const link = join(directory, "node_modules", name);
      await rm(link, { recursive: true, force: true });
      await this.link(directory, `node_modules/${name}`, (await findPackageDirectory(name, core))!);
    }
  }
  async stageRemove(applicationId: string): Promise<Generation> {
    return this.serial(async () => {
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (!pointer || pointer.state !== "ready") throw new Error("Runtime is not ready for installation");
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      const current = await this.layered(await this.generation(pending?.id ?? pointer.id));
      const removed = current.manifest.applications.find((app) => app.id === applicationId);
      if (!removed) throw new Error(`Application is not installed: ${applicationId}`);
      const id = `gen-${randomUUID()}`;
      const candidate = join(this.root, "generations", `remove-${randomUUID()}`);
      try {
        this.options.progress?.("copy");
        const applications = current.manifest.applications.filter((app) => app.id !== applicationId);
        const core = this.coreDirectory(current);
        await this.assemble(candidate, core, current.manifest.coreVersions, applications);
        this.options.progress?.("verify");
        await this.verify(candidate, core, current.manifest.coreVersions, applications);
        await atomicJson(join(candidate, "generation.json"), {
          ...current.manifest, id, applications, createdAt: new Date().toISOString(),
          dependencyLockSha256: current.manifest.dependencyLockSha256,
        } satisfies GenerationManifest);
        await rename(candidate, this.directory(id));
        await atomicJson(this.pendingFile, { schemaVersion: 1, id });
        return this.generation(id);
      } finally { await rm(candidate, { recursive: true, force: true }); }
    });
  }
  async activateWhenIdle(): Promise<{ activated: boolean; pending: boolean; id?: string }> {
    return this.serial(async () => {
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      if (!pending) return { activated: false, pending: false };
      if (await this.options.busy()) return { activated: false, pending: true, id: pending.id };
      const previous = await this.current();
      if (!previous) throw new Error("No active runtime generation");
      const next = await this.generation(pending.id);
      await atomicJson(this.activeFile, {
        schemaVersion: 1, id: next.id, previousId: previous.id, state: "activating", attempted: false,
      } satisfies ActivePointer);
      try { await this.options.restart(next, previous); }
      catch (error) {
        await atomicJson(this.activeFile, { schemaVersion: 1, id: previous.id, state: "ready" });
        throw error;
      }
      await rm(this.pendingFile, { force: true });
      return { activated: true, pending: false, id: next.id };
    });
  }
  /** Call only after the new engine and every application have opened successfully. */
  async confirmActivation(): Promise<void> {
    return this.serial(async () => {
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (pointer?.state === "activating") {
        await atomicJson(this.activeFile, { schemaVersion: 1, id: pointer.id, state: "ready" });
        await rm(this.errorFile, { force: true });
      }
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      if (pending?.id === pointer?.id) await rm(this.pendingFile, { force: true });
    });
  }
  async rollbackActivation(retry = false): Promise<Generation | null> {
    return this.serial(async () => {
      const pointer = await optionalJson<ActivePointer>(this.activeFile);
      if (pointer?.state !== "activating" || !pointer.previousId) return this.current();
      const failed = await this.generation(pointer.id);
      await atomicJson(this.activeFile, { schemaVersion: 1, id: pointer.previousId, state: "ready" });
      await atomicJson(this.errorFile, { seedId: failed.manifest.seedId, activeId: pointer.previousId,
        message: `Runtime activation ${pointer.id} failed; restored ${pointer.previousId}` });
      const pending = await optionalJson<{ id: string }>(this.pendingFile);
      if (retry) await atomicJson(this.pendingFile, { schemaVersion: 1, id: pointer.id });
      else if (pending?.id === pointer.id) await rm(this.pendingFile, { force: true });
      return this.generation(pointer.previousId);
    });
  }
}
