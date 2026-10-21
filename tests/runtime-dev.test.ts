import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  developmentInputs,
  RuntimeDevelopmentSupervisor,
  runtimeWatchIgnores,
  type DevelopmentInputs,
  type DevelopmentStatus,
  type ReloadSeedRequest,
} from "../scripts/runtime-dev";

function fixture() {
  let input: DevelopmentInputs = { seed: "source-1", backend: "backend-1", dependencies: "deps-1" };
  let status: DevelopmentStatus = {
    epoch: "process-1",
    seedId: "seed-1",
    busy: false,
    generation: { pending: false, installing: false, error: null },
  };
  const reloads: ReloadSeedRequest[] = [];
  const logs: string[] = [];
  let builds = 0;
  const options = {
    inputs: async () => ({ ...input }),
    build: async () => {
      builds++;
      return "seed-2";
    },
    status: async () => status,
    reload: async (request: ReloadSeedRequest) => {
      reloads.push(request);
      return { accepted: true };
    },
    log: (message: string) => {
      logs.push(message);
    },
  };
  const supervisor = new RuntimeDevelopmentSupervisor(options, input, "seed-1");
  return {
    supervisor,
    options,
    reloads,
    logs,
    setInput: (patch: Partial<DevelopmentInputs>) => {
      input = { ...input, ...patch };
    },
    setStatus: (patch: Partial<DevelopmentStatus>) => {
      status = { ...status, ...patch };
    },
    builds: () => builds,
  };
}

test("runtime edits build once and wait for idle, then verify the replacement process", async () => {
  const f = fixture();
  f.setInput({ seed: "source-2" });
  f.setStatus({ busy: true });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.builds()).toBe(1);
  expect(f.reloads).toEqual([]);
  f.setStatus({ busy: false });
  await f.supervisor.poll();
  expect(f.reloads).toEqual([{ epoch: "process-1", seedId: "seed-2" }]);
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
  f.setStatus({ epoch: "process-2", seedId: "seed-2" });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
  expect(f.logs.at(-1)).toContain("backend ready with seed seed-2");
});

test("startup detects the previous ready seed and activates the new seed after busy work finishes", async () => {
  const f = fixture();
  f.setStatus({ seedId: "previous-seed", busy: true });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.builds()).toBe(0);
  expect(f.reloads).toHaveLength(0);
  f.setStatus({ busy: false });
  await f.supervisor.poll();
  expect(f.reloads).toEqual([{ epoch: "process-1", seedId: "seed-1" }]);
  f.setStatus({ epoch: "process-2", seedId: "seed-1" });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
});

test("backend changes reuse the seed and retry when the atomic reload gate reports busy", async () => {
  const f = fixture();
  f.setInput({ backend: "backend-2" });
  f.options.reload = async (request) => {
    f.reloads.push(request);
    return { accepted: false, reason: "busy" };
  };
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.builds()).toBe(0);
  expect(f.reloads).toEqual([
    { epoch: "process-1", seedId: "seed-1" },
    { epoch: "process-1", seedId: "seed-1" },
  ]);
});

test("failed builds keep the running backend and retry only after another edit", async () => {
  const f = fixture();
  let attempts = 0;
  f.options.build = async () => {
    attempts++;
    throw new Error("syntax error");
  };
  f.setInput({ seed: "source-2" });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(attempts).toBe(1);
  expect(f.reloads).toHaveLength(0);
  f.options.build = async () => {
    attempts++;
    return "seed-3";
  };
  f.setInput({ seed: "source-3" });
  await f.supervisor.poll();
  expect(attempts).toBe(2);
  expect(f.reloads).toEqual([{ epoch: "process-1", seedId: "seed-3" }]);
});

test("an edit during seed copying invalidates the candidate even if the source is then reverted", async () => {
  const f = fixture();
  f.setInput({ seed: "source-2" });
  f.options.build = async () => {
    f.setInput({ seed: "source-3" });
    return "mixed-seed";
  };
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(0);
  f.setInput({ seed: "source-2" });
  let rebuilt = false;
  f.options.build = async () => {
    rebuilt = true;
    return "stable-seed";
  };
  await f.supervisor.poll();
  expect(rebuilt).toBe(true);
  expect(f.reloads[0]?.seedId).toBe("stable-seed");
});

test("unavailable endpoints and pending installations defer without another process control path", async () => {
  const f = fixture();
  f.setInput({ backend: "backend-2" });
  f.options.status = async () => {
    throw new Error("starting");
  };
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(0);
  f.options.status = async () => ({
    epoch: "process-1",
    seedId: "seed-1",
    busy: false,
    generation: { pending: true, installing: false, error: null },
  });
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(0);
});

test("an activation rollback is reported once instead of restarting repeatedly", async () => {
  const f = fixture();
  f.setInput({ seed: "source-2" });
  await f.supervisor.poll();
  f.setStatus({
    epoch: "process-2",
    seedId: "seed-1",
    generation: { pending: false, installing: false, error: "plugin incompatible" },
  });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
  expect(f.logs.at(-1)).toContain("plugin incompatible");
  f.setInput({ seed: "source-3" });
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(2);
});

test("runtime dependency edits require an explicit restart and do not modify the live process", async () => {
  const f = fixture();
  f.setInput({ seed: "source-2", dependencies: "deps-2" });
  await f.supervisor.poll();
  expect(f.builds()).toBe(0);
  expect(f.reloads).toHaveLength(0);
  expect(f.logs[0]).toContain("finish tasks");
});

test("an asynchronous restart failure resumes watching and retries after a backend edit", async () => {
  const f = fixture();
  f.setInput({ backend: "backend-2" });
  await f.supervisor.poll();
  f.setStatus({ generation: { pending: false, installing: false, error: "restart refused" } });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
  expect(f.logs.at(-1)).toContain("restart refused");
  f.setInput({ backend: "backend-3" });
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(2);
});

test("a reply lost during restart is reconciled against epoch instead of restarting twice", async () => {
  const f = fixture();
  f.setInput({ backend: "backend-2" });
  f.options.reload = async (request) => {
    f.reloads.push(request);
    throw new Error("connection closed");
  };
  await f.supervisor.poll();
  f.setStatus({ epoch: "process-2" });
  await f.supervisor.poll();
  await f.supervisor.poll();
  expect(f.reloads).toHaveLength(1);
  expect(f.logs.at(-1)).toContain("backend ready");
});

const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});
test("source fingerprints exclude generated files and retain separate backend/dependency inputs", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-runtime-dev-"));
  temporary.push(root);
  for (const directory of [
    "packages/runtime/src",
    "packages/runtime/tests",
    "packages/runtime/node_modules/pkg",
    "packages/sdk/src",
    "packages/sdk/dist",
    "backend",
    "shared",
    "resources",
  ])
    await mkdir(join(root, directory), { recursive: true });
  const write = (path: string, contents = "fixture") => writeFile(join(root, path), contents);
  await write("packages/runtime/package.json", "{}");
  await write("packages/sdk/package.json", "{}");
  await write("packages/runtime/src/index.ts");
  await write("packages/sdk/src/cordis-client.tsx");
  const initial = await developmentInputs(root);
  for (const path of [
    "packages/runtime/tests/test.ts",
    "packages/runtime/node_modules/pkg/index.ts",
    "packages/sdk/src/cordis-types.ts",
    "packages/sdk/src/card-contract.ts",
    "packages/sdk/dist/ui.css",
    "resources/runtime-seed.json",
  ])
    await write(path);
  expect(await developmentInputs(root)).toEqual(initial);
  await write("backend/runtime.ts");
  const backend = await developmentInputs(root);
  expect(backend.seed).toBe(initial.seed);
  expect(backend.backend).not.toBe(initial.backend);
  await write("packages/runtime/package.json", '{"dependencies":{}}');
  const dependencies = await developmentInputs(root);
  expect(dependencies.seed).toBe(initial.seed);
  expect(dependencies.dependencies).not.toBe(initial.dependencies);
  await write("packages/runtime/src/index.ts", "updated");
  expect((await developmentInputs(root)).seed).not.toBe(initial.seed);
  expect(runtimeWatchIgnores).toEqual([
    "packages/runtime",
    "packages/sdk",
    "backend",
    "shared",
    "resources",
    "tests",
    "scripts",
  ]);
});
