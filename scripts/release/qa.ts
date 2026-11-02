import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { assert, config, readManifest, root } from "./config";
import { checksum, verifyRelease } from "./verify";
import { command } from "./process";
import { QAApplication, confirmUpdate, eventually } from "./qa-client";
import { startReplay } from "./https-replay";
import {
  validateEvidence,
  type CandidateInput,
  type UpdateEvidence,
} from "./candidate-manifest";
import { fingerprint } from "../../framework/fia/tools/prepare";
import {
  verifyBaselineSignature,
  type RuntimeLock,
} from "../../framework/fia/packages/cli/src/runtime-baseline";

const directory = resolve(process.argv[2] ?? "artifacts/release/candidate");
const publicMode = process.argv[3] === "--public";
assert(
  process.argv.length <= 4 && (!process.argv[3] || publicMode),
  "Usage: qa.ts <candidate> [--public]",
);
const input: CandidateInput = await Bun.file(
  resolve(directory, "build.input.json"),
).json();
const lock: RuntimeLock = await Bun.file(
  resolve(directory, "runtime.lock.json"),
).json();
assert(
  (await checksum(resolve(directory, "latest.json"))) ===
    input.manifestSHA256 &&
    (await checksum(resolve(directory, "baseline.signed.json"))) ===
      input.baselineSHA256,
  "QA input changed",
);
const candidate = readManifest(
  await Bun.file(resolve(directory, "latest.json")).text(),
);
const previous = readManifest(
  await Bun.file(resolve(directory, "baseline.signed.json")).text(),
);
const temporary = await mkdtemp(resolve(tmpdir(), "fn-update-qa-"));
const applications: QAApplication[] = [];
const mounts: string[] = [];
let replay: Awaited<ReturnType<typeof startReplay>> | undefined;
const evidence: UpdateEvidence = {
  schema: 1,
  mode: publicMode ? "public" : "prepublication-https-replay",
  candidateSHA256: input.manifestSHA256,
  baselineSHA256: input.baselineSHA256,
  runtimeId: input.runtimeId,
  originalAppsVerified: false,
  cases: [],
};
const appChecks: { app: string; digest: string }[] = [];
async function download(url: string, path: string, expected?: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });
  assert(response.ok, "QA public baseline unavailable: " + url);
  await Bun.write(path, await response.arrayBuffer());
  if (expected)
    assert(
      (await checksum(path)) === expected,
      "QA public baseline checksum mismatch",
    );
}
async function installer(version: string, build: number, expected?: string) {
  const filename = `Fn-${version}-${build}-mac-arm64.dmg`;
  const url = `https://github.com/${config.repository}/releases/download/v${version}/${filename}`;
  const dmg = resolve(temporary, filename);
  if (version === candidate.version && build === candidate.build)
    await cp(resolve(directory, filename), dmg);
  else {
    if (!expected) {
      const response = await fetch(url + ".sha256");
      assert(response.ok, "Missing published installer digest");
      expected = (await response.text()).split(/\s/)[0];
    }
    await download(url, dmg, expected);
  }
  assert(
    !expected || (await checksum(dmg)) === expected,
    "Installer differs from frozen candidate",
  );
  await command(["hdiutil", "verify", dmg]);
  await command(["xcrun", "stapler", "validate", dmg]);
  await command([
    "spctl",
    "-a",
    "-t",
    "open",
    "--context",
    "context:primary-signature",
    dmg,
  ]);
  const mount = resolve(temporary, `mount-${build}`);
  await command([
    "hdiutil",
    "attach",
    dmg,
    "-readonly",
    "-nobrowse",
    "-mountpoint",
    mount,
  ]);
  mounts.push(mount);
  const app = resolve(temporary, `app-${build}`, "Fn.app");
  await mkdir(resolve(temporary, `app-${build}`));
  await cp(resolve(mount, "Fn.app"), app, { recursive: true });
  await verifyBaselineSignature(app, lock.teamIdentifier);
  appChecks.push({ app, digest: await fingerprint(app, ["Contents"]) });
  return app;
}
async function probeArchive() {
  const source = resolve(temporary, "probe.ts");
  await Bun.write(
    source,
    `import {defineBackend} from ${JSON.stringify(resolve(root, "packages/sdk/src/backend.ts"))};
import {defineContract,method,stream,z} from ${JSON.stringify(resolve(root, "packages/sdk/src/contract.ts"))};
export default defineBackend({api:defineContract({read:method({input:z.object({}),output:z.string()}),hold:stream({input:z.object({}),chunk:z.number()})}),async setup({host}){
const path=host.paths.data+'/probe.json';if(!await Bun.file(path).exists())await Bun.write(path,JSON.stringify({value:'persisted before update'}));
await host.application.setSummary({version:1,text:'Update QA data'});
return {handlers:{read:async()=>await Bun.file(path).text(),hold:async function*(_,ctx){while(!ctx.signal.aborted){yield 1;await Bun.sleep(100);}}}};}});`,
  );
  const built = await Bun.build({
    entrypoints: [source],
    target: "bun",
    format: "esm",
    packages: "bundle",
  });
  assert(built.success, "Could not build update QA application");
  const manifest = {
    manifestVersion: 1,
    id: "update-qa-probe",
    version: "0.1.0",
    hostApi: 2,
    name: "Update QA",
    entries: { backend: "backend.js" },
    locales: { default: "en", messages: { en: "en.json" } },
    uses: ["application.summary"],
    contributes: { summary: {} },
  };
  const path = resolve(temporary, "probe.fn.tgz");
  await Bun.write(
    path,
    await new Bun.Archive(
      {
        "fn.app.json": JSON.stringify(manifest),
        "fn-build.json": JSON.stringify({
          format: 1,
          manifest,
          backend: "backend.js",
        }),
        "backend.js": await built.outputs[0]!.text(),
        "en.json": "{}",
      },
      { compress: "gzip" },
    ).bytes(),
  );
  return path;
}
async function create(app: string, name: string, archive: string) {
  const instance = new QAApplication(app, resolve(temporary, name));
  applications.push(instance);
  await instance.launch();
  await instance.platform("preferences", { locale: "en", theme: "dark" });
  await instance.platform("install-local", { path: archive });
  await instance.platform("open", {
    instanceId: "update-qa-probe",
    browser: true,
  });
  await instance.platform("close", { instanceId: "update-qa-probe" });
  return instance;
}
async function dataSnapshot(instance: QAApplication) {
  const state = await instance.platform("state");
  const dataPath = resolve(
    instance.data,
    "com.semicoder.fn/Backend/platform/data/update-qa-probe/probe.json",
  );
  return JSON.stringify({
    preferences: state.preferences,
    applications: state.applications.map((app: any) => ({
      id: app.instanceId,
      version: app.manifest.version,
      summary: app.summary,
    })),
    business: await checksum(dataPath),
  });
}
async function prepared(instance: QAApplication) {
  const session = await instance.session();
  const state = await eventually(async () => {
    try {
      const value = await session.call("updates.check");
      return ["available", "downloaded", "current", "requiresInstall"].includes(
        value.phase,
      )
        ? value
        : undefined;
    } catch (error) {
      if (String(error).includes("already running")) return undefined;
      throw error;
    }
  }, "update check");
  return { session, state };
}
async function begin(
  instance: QAApplication,
  session: Awaited<ReturnType<QAApplication["session"]>>,
) {
  const apply = session.call("updates.apply", {}, 60_000);
  const confirm = confirmUpdate(instance.child!.pid);
  const result = await Promise.allSettled([apply, confirm]);
  for (const item of result) if (item.status === "rejected") throw item.reason;
}
async function update(instance: QAApplication, targetBuild: number) {
  const { session, state } = await prepared(instance);
  try {
    assert(
      ["available", "downloaded"].includes(state.phase),
      "Expected code update, received " + state.phase,
    );
    await session.call("updates.download", {}, 120_000);
    await begin(instance, session);
    await eventually(async () => {
      const journal = await instance.journal();
      return journal.active === targetBuild && journal.pending == null
        ? true
        : undefined;
    }, "code activation commit");
    await instance.ready(targetBuild);
  } finally {
    session.close();
  }
}
function record(name: string, installedBuild: number) {
  evidence.cases.push({
    name,
    passed: true,
    installedBuild,
    targetBuild: candidate.build,
  });
  console.log(`Verified ${name}: ${installedBuild} -> ${candidate.build}`);
}

async function replaceInstaller(
  instance: QAApplication,
  newApp: string,
  name: string,
  startingBuild: number,
) {
  const before = await dataSnapshot(instance);
  const { session, state } = await prepared(instance);
  assert(
    state.phase === "requiresInstall",
    "Native release must require its installer",
  );
  session.close();
  record("requires-installer", startingBuild);
  await instance.stop();
  const replacement = new QAApplication(newApp, instance.data);
  applications.push(replacement);
  await replacement.launch();
  await replacement.ready(candidate.build);
  assert(
    (await dataSnapshot(replacement)) === before,
    "Installer upgrade changed user data",
  );
  const current = await replacement.session();
  try {
    const info = await current.call("application.info");
    assert(
      info.version === candidate.version && info.build === candidate.build,
      "Installer upgrade retained a stale active version",
    );
  } finally {
    current.close();
  }
  record(name, startingBuild);
  record("data-preserved", startingBuild);
  await replacement.stop();
  await replacement.launch();
  await replacement.ready(candidate.build);
  assert(
    (await dataSnapshot(replacement)) === before,
    "Installer restart changed user data",
  );
  await replacement.stop();
  record("restart", startingBuild);
}

const cleanupErrors: unknown[] = [];
try {
  console.log(
    `Starting ${evidence.mode} QA for ${candidate.version} (${candidate.build}), runtime ${candidate.runtimeId}`,
  );
  const baselineEnvelope = resolve(temporary, "runtime-baseline.json");
  await download(
    lock.origin.manifestURL,
    baselineEnvelope,
    lock.origin.manifestSHA256,
  );
  const baseline = readManifest(await Bun.file(baselineEnvelope).text());
  const baseApp = await installer(
    baseline.version,
    baseline.build,
    lock.origin.sha256,
  );
  const latestApp =
    previous.build === baseline.build
      ? baseApp
      : await installer(previous.version, previous.build);
  const newApp = await installer(
    candidate.version,
    candidate.build,
    input.installerSHA256,
  );
  const factory = await Bun.file(
    resolve(newApp, "Contents/Resources/code/manifest.json"),
  ).json();
  assert(
    factory.runtimeId === candidate.runtimeId &&
      factory.build === candidate.build &&
      factory.version === candidate.version &&
      JSON.stringify(factory.files) === JSON.stringify(candidate.files),
    "DMG code manifest differs from signed update",
  );
  for (const file of candidate.files)
    assert(
      (await checksum(
        resolve(newApp, "Contents/Resources/code", file.path),
      )) === file.sha256,
      "DMG/update code mismatch: " + file.path,
    );
  const updates = resolve(temporary, "updates");
  await mkdir(updates);
  await command([
    "tar",
    "-xzf",
    resolve(directory, "updates.tar.gz"),
    "-C",
    updates,
  ]);
  await verifyRelease(updates);
  const routes: Record<string, string> = {
    [config.updatesURL]: resolve(directory, "latest.json"),
    [config.updatesURL + "?previous"]: resolve(
      directory,
      "baseline.signed.json",
    ),
  };
  for (const file of candidate.files)
    routes[new URL(file.path, candidate.baseURL).href] = resolve(
      updates,
      "releases",
      String(candidate.build),
      file.path,
    );
  for (const file of previous.files) {
    const path = resolve(temporary, "previous-files", file.path);
    await download(
      new URL(file.path, previous.baseURL).href,
      path,
      file.sha256,
    );
    routes[new URL(file.path, previous.baseURL).href] = path;
  }
  const archive = await probeArchive();
  if (!publicMode)
    replay = await startReplay(temporary, routes, config.updatesURL);
  const fresh = await create(newApp, "new-install", archive);
  await fresh.ready(candidate.build);
  await dataSnapshot(fresh);
  await fresh.stop();
  record("new-install", candidate.build);
  if (input.policy.kind === "installer") {
    for (const [name, app, build] of [
      ["baseline-installer-upgrade", baseApp, baseline.build],
      ["installer-upgrade", latestApp, previous.build],
    ] as const) {
      const instance = await create(app, name, archive);
      await replaceInstaller(instance, newApp, name, build);
    }
    if (!publicMode && previous.build > baseline.build) {
      assert(
        previous.runtimeId === baseline.runtimeId,
        "The previous code release must belong to the locked runtime family",
      );
      await replay!.set("none", config.updatesURL + "?previous");
      const instance = await create(
        baseApp,
        "updated-installer-upgrade",
        archive,
      );
      const before = await dataSnapshot(instance);
      await update(instance, previous.build);
      assert(
        (await dataSnapshot(instance)) === before,
        "The preceding code update changed user data",
      );
      await instance.stop();
      await instance.launch();
      await instance.ready(previous.build);
      await replay!.set("none", config.updatesURL);
      await replaceInstaller(
        instance,
        newApp,
        "updated-installer-upgrade",
        baseline.build,
      );
    }
  } else {
    for (const [name, app, build] of [
      ["baseline-upgrade", baseApp, baseline.build],
      ["latest-upgrade", latestApp, previous.build],
    ] as const) {
      const instance = await create(app, name, archive),
        before = await dataSnapshot(instance);
      await update(instance, candidate.build);
      assert(
        (await dataSnapshot(instance)) === before,
        "Code update changed data or preferences",
      );
      record(name, build);
      record("data-preserved", build);
      await instance.stop();
      await instance.launch();
      await instance.ready(candidate.build);
      assert(
        (await dataSnapshot(instance)) === before,
        "Restart changed update data",
      );
      record("restart", build);
      const { session, state } = await prepared(instance);
      assert(
        state.phase === "current",
        "An applied release must not be offered again",
      );
      session.close();
      if (previous.build === baseline.build) record("repeat-check", build);
      await instance.stop();
    }
    if (!publicMode && previous.build > baseline.build) {
      await replay!.set("none", config.updatesURL + "?previous");
      const instance = await create(baseApp, "sequential", archive);
      await update(instance, previous.build);
      await replay!.set("none", config.updatesURL);
      await update(instance, candidate.build);
      await instance.stop();
      record("repeat-upgrade", baseline.build);
    }
    if (!publicMode) {
      for (const fault of ["interrupt", "corrupt"] as const) {
        await replay!.set(fault, config.updatesURL);
        const instance = await create(latestApp, "download-" + fault, archive);
        const { session } = await prepared(instance);
        let rejected = false;
        try {
          await session.call("updates.download", {}, 120_000);
        } catch {
          rejected = true;
        }
        assert(
          rejected &&
            (await instance.inspection())?.build === previous.build &&
            (await instance.journal()).active == null,
          "Failed download affected the active code",
        );
        session.close();
        await instance.stop();
        record(
          fault === "corrupt" ? "download-corrupt" : "download-interrupted",
          previous.build,
        );
      }
      await replay!.set("none", config.updatesURL);
      for (const fault of ["crash", "interrupted", "exit"] as const) {
        const instance = await create(
            latestApp,
            "activation-" + fault,
            archive,
          ),
          before = await dataSnapshot(instance);
        const { session } = await prepared(instance);
        await session.call("updates.download", {}, 120_000);
        await begin(instance, session);
        const trial = await eventually(async () => {
          const state = await instance.inspection(),
            journal = await instance.journal();
          return journal.pending === candidate.build &&
            state?.build === candidate.build &&
            state.processGroups.length
            ? state
            : undefined;
        }, "candidate trial process");
        if (fault === "crash")
          process.kill(-trial.processGroups[0]!, "SIGKILL");
        else {
          await instance.stop(fault === "interrupted");
          await instance.launch();
        }
        await eventually(
          async () =>
            (await instance.journal()).failed.includes(candidate.build)
              ? true
              : undefined,
          "failed candidate rollback",
        );
        await instance.ready(previous.build);
        assert(
          (await dataSnapshot(instance)) === before,
          "Rollback changed user data",
        );
        session.close();
        await instance.stop();
        record("activation-" + fault, previous.build);
      }
      const busy = await create(latestApp, "busy", archive);
      await busy.platform("open", {
        instanceId: "update-qa-probe",
        browser: true,
      });
      const { session } = await prepared(busy);
      await session.call("updates.download", {}, 120_000);
      const viewResponse = await session.request("/api/fn/v1/views", {
        instanceId: "update-qa-probe",
        runId: "",
      });
      assert(viewResponse.ok, "Could not create update probe view");
      const view = (await viewResponse.json()) as { token: string };
      const controller = new AbortController();
      const held = await session.request(
        "/api/fn/v1/apps/methods/hold",
        {},
        { "x-fn-view": view.token, accept: "text/event-stream" },
        controller.signal,
      );
      assert(held.ok, "Could not hold an application task");
      const reader = held.body!.getReader();
      await reader.read();
      let refused = false;
      try {
        await begin(busy, session);
      } catch (error) {
        refused = String(error).includes("active tasks");
      }
      assert(
        refused &&
          (await session.call("updates.state")).phase === "downloaded" &&
          (await busy.inspection())?.build === previous.build,
        "Busy task did not defer update",
      );
      controller.abort();
      await reader.cancel().catch(() => {});
      session.close();
      await eventually(async () => {
        const state = await busy.platform("state");
        return state.applications.find(
          (app: any) => app.instanceId === "update-qa-probe",
        )?.busy === 0
          ? true
          : undefined;
      }, "application task cancellation");
      await update(busy, candidate.build);
      await busy.stop();
      record("busy-deferred", previous.build);
    }
  }
  for (const check of appChecks) {
    assert(
      (await fingerprint(check.app, ["Contents"])) === check.digest,
      "QA modified the installed application bundle",
    );
    await verifyBaselineSignature(check.app, lock.teamIdentifier);
  }
  evidence.originalAppsVerified = true;
  if (!publicMode) validateEvidence(input, evidence);
  await Bun.write(
    resolve(
      directory,
      publicMode ? "../public-e2e.report.json" : "e2e.report.json",
    ),
    JSON.stringify(evidence, null, 2) + "\n",
  );
  console.log(
    `${publicMode ? "Public" : "Prepublication"} update path verified; ${evidence.cases.length} cases passed.`,
  );
} catch (error) {
  await Bun.write(
    resolve(root, ".fia/release-qa-diagnostics.json"),
    JSON.stringify(
      {
        mode: evidence.mode,
        candidate: candidate.build,
        cases: evidence.cases,
        error: String(error),
        applications: await Promise.all(
          applications.map(async (instance) => ({
            profile: instance.data.split("/").pop(),
            state: await instance.inspection(),
            journal: await instance.journal().catch(() => null),
          })),
        ),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  for (const instance of applications)
    await instance
      .stop()
      .catch(() => instance.stop(true))
      .catch((error) => cleanupErrors.push(error));
  if (replay) await replay.close().catch((error) => cleanupErrors.push(error));
  for (const mount of mounts.reverse())
    await command(["hdiutil", "detach", mount]).catch((error) =>
      cleanupErrors.push(error),
    );
  await rm(temporary, { recursive: true, force: true });
}
if (cleanupErrors.length)
  throw new AggregateError(cleanupErrors, "QA cleanup failed");
