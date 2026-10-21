import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { parseDevelopmentOptions } from "../framework/fia/packages/cli/src/development-options";

export interface DevelopmentInputs {
  seed: string;
  backend: string;
  dependencies: string;
}
export interface DevelopmentStatus {
  epoch: string;
  seedId: string;
  busy: boolean;
  generation: { pending: boolean; installing: boolean; error: string | null };
}
export interface ReloadSeedRequest {
  epoch: string;
  seedId: string;
}
export interface ReloadSeedResult {
  accepted: boolean;
  reason?: string;
}

const seedDirectories = ["packages/runtime", "packages/sdk"];
const backendDirectories = ["backend", "shared"];
const generated = new Set(["packages/sdk/src/cordis-types.ts", "packages/sdk/src/card-contract.ts"]);
const excluded = new Set(["node_modules", ".git", ".fia", ".DS_Store", "tests", "dist"]);

/** Hash source bytes, not mtime, so generated output cannot cause a rebuild loop. */
export async function developmentInputs(root: string): Promise<DevelopmentInputs> {
  async function fingerprint(paths: string[], packageManifests = false) {
    const hash = createHash("sha256");
    async function visit(path: string): Promise<void> {
      let entries;
      try {
        entries = await readdir(path, { withFileTypes: true });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOTDIR") throw error;
        hash
          .update(relative(root, path))
          .update("\0")
          .update(await readFile(path))
          .update("\0");
        return;
      }
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        const file = join(path, entry.name);
        if (
          excluded.has(entry.name) ||
          generated.has(relative(root, file)) ||
          (!packageManifests && entry.name === "package.json")
        )
          continue;
        // Workspace source must be local; never traverse dependency symlinks.
        if (entry.isDirectory() || entry.isFile()) await visit(file);
      }
    }
    for (const path of paths) await visit(join(root, path));
    return hash.digest("hex");
  }
  const [seed, backend, dependencies] = await Promise.all([
    fingerprint(seedDirectories),
    fingerprint(backendDirectories),
    fingerprint(
      seedDirectories.map((path) => `${path}/package.json`),
      true,
    ),
  ]);
  return { seed, backend, dependencies };
}

interface SupervisorOptions {
  inputs(): Promise<DevelopmentInputs>;
  build(): Promise<string>;
  status(): Promise<DevelopmentStatus>;
  reload(request: ReloadSeedRequest): Promise<ReloadSeedResult>;
  log(message: string): void;
}

/** One serialized poll: never sends process signals for a source change. */
export class RuntimeDevelopmentSupervisor {
  private built: string;
  private seedId: string;
  private runningSeedId?: string;
  private applied: DevelopmentInputs;
  private failed?: string;
  private failedReload?: string;
  private waiting?: {
    epoch: string;
    inputs: DevelopmentInputs;
    seedId: string;
    uncertain?: boolean;
  };
  private message = "";

  constructor(
    private options: SupervisorOptions,
    inputs: DevelopmentInputs,
    seedId: string,
  ) {
    this.built = inputs.seed;
    this.seedId = seedId;
    this.applied = inputs;
  }

  private report(message: string) {
    if (this.message === message) return;
    this.message = message;
    this.options.log(message);
  }

  async poll(): Promise<void> {
    const input = await this.options.inputs();
    if (input.dependencies !== this.applied.dependencies) {
      this.report(
        "runtime/SDK dependency declarations changed; finish tasks, install if needed, then restart dev",
      );
      return;
    }
    if (this.waiting) {
      const status = await this.readStatus();
      if (!status) return;
      if (status.epoch === this.waiting.epoch) {
        if (!status.busy && this.waiting.uncertain) {
          // A lost reply may have arrived before admission. Retry only after
          // observing that the same backend is still available and accepting.
          this.waiting = undefined;
        } else if (!status.busy && status.generation.error) {
          this.failedReload = JSON.stringify(this.waiting.inputs);
          this.waiting = undefined;
          this.report(
            `reload failed; running backend retained. Edit sources to retry: ${status.generation.error}`,
          );
        }
        return;
      }
      this.applied = this.waiting.inputs;
      if (status.seedId !== this.waiting.seedId) {
        this.failedReload = JSON.stringify(this.waiting.inputs);
        this.report(
          `seed activation failed; current runtime retained: ${status.generation.error ?? "unexpected seed"}`,
        );
      } else this.report(`backend ready with seed ${status.seedId}`);
      this.waiting = undefined;
      return;
    }
    if (this.failedReload === JSON.stringify(input)) return;
    if (input.seed !== this.built) {
      if (this.failed === input.seed) return;
      this.report("rebuilding SDK snapshot and runtime seed");
      try {
        this.seedId = await this.options.build();
        this.built = input.seed;
        this.failed = undefined;
      } catch (error) {
        this.failed = input.seed;
        this.report(
          `build failed; running tasks are unchanged. Edit sources to retry: ${String(error)}`,
        );
        return;
      }
      const latest = await this.options.inputs();
      // An edit during copying can produce a mixed snapshot. Never activate it.
      if (latest.seed !== input.seed || latest.dependencies !== input.dependencies) {
        this.built = "";
        this.report("sources changed during build; waiting for the next stable snapshot");
        return;
      }
    }
    const sourcesUnchanged =
      input.seed === this.applied.seed && input.backend === this.applied.backend;
    if (this.failed === input.seed || (sourcesUnchanged && this.runningSeedId === this.seedId))
      return;
    const status = await this.readStatus();
    if (!status) return;
    // initialize() keeps the last ready generation responsive. A newly built
    // startup seed still needs background preparation even without a later edit.
    if (sourcesUnchanged && status.seedId === this.seedId) return;
    if (status.busy || status.generation.pending || status.generation.installing) {
      this.report(
        "changes ready; waiting for model, tool, login, sync and installation tasks to become idle",
      );
      return;
    }
    try {
      const result = await this.options.reload({ epoch: status.epoch, seedId: this.seedId });
      if (!result.accepted) {
        this.report(`reload deferred: ${result.reason ?? "backend is busy"}`);
        return;
      }
      this.waiting = { epoch: status.epoch, inputs: input, seedId: this.seedId };
      this.report("idle reload accepted; preparing the candidate and waiting for the new backend");
    } catch (error) {
      // The endpoint may disappear while a separately requested update restarts it.
      // Never substitute a kill signal for an unavailable application endpoint.
      this.waiting = { epoch: status.epoch, inputs: input, seedId: this.seedId, uncertain: true };
      this.report(`reload unavailable; waiting for Dev: ${String(error)}`);
    }
  }

  private async readStatus(): Promise<DevelopmentStatus | undefined> {
    try {
      const status = await this.options.status();
      this.runningSeedId = status.seedId;
      return status;
    } catch (error) {
      this.report(`waiting for Dev endpoint: ${String(error)}`);
      return undefined;
    }
  }
}

export const runtimeWatchIgnores = [
  ...seedDirectories,
  ...backendDirectories,
  "resources",
  // Test edits do not change the application. Maintainer scripts require an
  // explicit dev restart, just like dependency/toolchain changes.
  "tests",
  "scripts",
] as const;

export async function runRuntimeDevelopment(root: string, args: string[]): Promise<number> {
  root = resolve(root);
  parseDevelopmentOptions(args);
  let stopped = false;
  let command: Bun.Subprocess | undefined;
  let child: Bun.Subprocess | undefined;
  const log = (message: string) => console.log(`fn dev: ${message}`);
  const stop = () => {
    stopped = true;
    // Only an explicit user termination stops the managed Dev, never a source edit.
    command?.kill("SIGTERM");
    child?.kill("SIGTERM");
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  async function run(args: string[], capture = false): Promise<string> {
    if (stopped) throw new Error("Development stopped");
    command = Bun.spawn([process.execPath, ...args], {
      cwd: root,
      stdin: "ignore",
      stdout: capture ? "pipe" : "inherit",
      stderr: capture ? "pipe" : "inherit",
    });
    const process_ = command;
    const timeout = capture ? setTimeout(() => process_.kill("SIGTERM"), 10_000) : undefined;
    try {
      const [stdout, stderr, code] = await Promise.all([
        capture ? new Response(process_.stdout as ReadableStream).text() : "",
        capture ? new Response(process_.stderr as ReadableStream).text() : "",
        process_.exited,
      ]);
      if (code !== 0)
        throw new Error(
          capture ? stderr.trim().slice(0, 500) || `CLI exited ${code}` : `Build exited ${code}`,
        );
      return stdout;
    } finally {
      clearTimeout(timeout);
      if (command === process_) command = undefined;
    }
  }
  async function build() {
    await run(["run", "sdk:snapshot"]);
    await run(["run", "runtime:seed"]);
    const metadata = JSON.parse(await readFile(join(root, "resources/runtime-seed.json"), "utf8"));
    if (typeof metadata.id !== "string") throw new Error("Runtime seed metadata is missing its id");
    return metadata.id as string;
  }
  async function call<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return JSON.parse(
      await run(
        [
          "framework/fia/packages/cli/bin/fia",
          "agent",
          "call",
          method,
          "--json",
          JSON.stringify(params),
        ],
        true,
      ),
    ) as T;
  }
  try {
    let initial: DevelopmentInputs;
    let seedId: string;
    do {
      initial = await developmentInputs(root);
      seedId = await build();
    } while (!stopped && JSON.stringify(initial) !== JSON.stringify(await developmentInputs(root)));
    if (stopped) return 130;
    child = Bun.spawn(
      [
        process.execPath,
        "framework/fia/tools/develop-app.ts",
        ".",
        ...args,
        ...runtimeWatchIgnores.flatMap((path) => ["--watch-ignore", path]),
      ],
      { cwd: root, stdin: "ignore", stdout: "inherit", stderr: "inherit" },
    );
    const supervisor = new RuntimeDevelopmentSupervisor(
      {
        inputs: () => developmentInputs(root),
        build,
        status: () => call<DevelopmentStatus>("runtime.status"),
        reload: (request) => call<ReloadSeedResult>("runtime.reloadSeed", { ...request }),
        log,
      },
      initial,
      seedId,
    );
    log("watching runtime, SDK, backend and shared sources; reload waits for idle");
    log("framework, dependency, configuration and command changes use the FIA restart workflow");
    let previous = initial;
    while (!stopped && child.exitCode === null && child.signalCode === null) {
      await Bun.sleep(500);
      try {
        const current = await developmentInputs(root);
        // Two equal polls debounce saves; content hashing ignores generated mtime changes.
        if (JSON.stringify(current) === JSON.stringify(previous)) await supervisor.poll();
        previous = current;
      } catch (error) {
        // Atomic editor saves can briefly remove a file. Losing a source snapshot
        // or a control request must never shut down active application work.
        if (!stopped) log(`source check unavailable; keeping Dev alive: ${String(error)}`);
      }
    }
    return stopped ? 130 : (child.exitCode ?? 1);
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGTERM");
      await child.exited;
    }
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
  }
}

if (import.meta.main) {
  try {
    process.exitCode = await runRuntimeDevelopment(
      resolve(import.meta.dir, ".."),
      process.argv.slice(2),
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
