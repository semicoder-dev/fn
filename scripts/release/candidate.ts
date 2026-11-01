import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  assert,
  config,
  pkg,
  readManifest,
  root,
  validateConfig,
} from "./config";
import { checksum, verifyRelease } from "./verify";
import { command } from "./process";
import { parsePolicy, auditUpdatePath } from "./update-path";
import {
  inventory,
  validateEvidence,
  verifyCandidate,
  type CandidateInput,
  type CandidateReport,
} from "./candidate-manifest";
import { runtimeInputs } from "../../framework/fia/tools/runtime-inputs";
import { loadProjectConfig } from "../../framework/fia/packages/cli/src/project-config";
import {
  parseRuntimeLock,
  runtimeConfiguration,
  withRuntimeBaseline,
} from "../../framework/fia/packages/cli/src/runtime-baseline";
import { releaseApplication } from "../../framework/fia/packages/cli/src/application";

const directory = resolve(root, "artifacts/release/candidate");
const action = process.argv[2];
validateConfig();
if (action === "seal") {
  const input: CandidateInput = await Bun.file(
    resolve(directory, "build.input.json"),
  ).json();
  validateEvidence(
    input,
    await Bun.file(resolve(directory, "e2e.report.json")).json(),
  );
  const report: CandidateReport = {
    ...input,
    status: "verified",
    files: await inventory(directory),
  };
  await Bun.write(
    resolve(directory, "candidate.report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  await verifyCandidate(directory);
  console.log("Candidate sealed. Promotion must use these exact artifacts.");
} else {
  assert(action === "build", "Usage: candidate.ts build | seal");
  assert(
    process.env.GITHUB_REPOSITORY === config.repository &&
      process.env.GITHUB_EVENT_NAME === "workflow_dispatch" &&
      process.env.GITHUB_REF === "refs/heads/main",
    "Signed candidates must be explicitly dispatched from main",
  );
  assert(
    !(await command(["git", "status", "--porcelain"], root)),
    "Candidate source must be clean",
  );
  const commit = await command(["git", "rev-parse", "HEAD"], root);
  assert(commit === process.env.GITHUB_SHA, "Candidate SHA mismatch");
  assert(
    !(await Bun.file(resolve(directory, "build.input.json")).exists()),
    "Candidate output already exists; use a fresh run",
  );
  await mkdir(directory, { recursive: true });
  const response = await fetch(config.updatesURL, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  assert(response.ok, "Public baseline unavailable");
  const baselineText = await response.text(),
    baseline = readManifest(baselineText);
  assert(
    config.build > baseline.build,
    "Candidate build must exceed the public build",
  );
  await Bun.write(resolve(directory, "baseline.signed.json"), baselineText);
  const policy = parsePolicy(
    await Bun.file(resolve(root, "release/update-policy.json")).json(),
  );
  const lockPath = resolve(root, "release/runtime.lock.json");
  const lock = parseRuntimeLock(await Bun.file(lockPath).json());
  const runtimeResponse = await fetch(lock.origin.manifestURL, {
    signal: AbortSignal.timeout(60_000),
  });
  assert(runtimeResponse.ok, "Public runtime baseline unavailable");
  const runtimeText = await runtimeResponse.text();
  assert(
    new Bun.CryptoHasher("sha256").update(runtimeText).digest("hex") ===
      lock.origin.manifestSHA256,
    "Public runtime baseline changed",
  );
  const runtimeBaseline = readManifest(runtimeText);
  await Bun.write(
    resolve(directory, "runtime-baseline.signed.json"),
    runtimeText,
  );
  await cp(lockPath, resolve(directory, "runtime.lock.json"));
  // Only build the TypeScript toolchain for code releases. No call to framework:prepare.
  await command(
    [process.execPath, "framework/fia/packages/cli/scripts/build.ts"],
    root,
  );
  await command([process.execPath, "scripts/build-runner.ts"], root);
  const project = await loadProjectConfig(root);
  const native = await runtimeInputs();
  const configuration = await runtimeConfiguration(project);
  if (policy.kind === "code") {
    assert(
      native === lock.nativeInputs &&
        configuration === lock.configuration &&
        baseline.runtimeId === lock.runtimeId,
      "Code candidate cannot change native inputs, runtime configuration or the published runtime family",
    );
    await withRuntimeBaseline(project, lockPath, (baseline) =>
      releaseApplication(project, false, { baseline, withUpdate: true }),
    );
  } else {
    assert(
      policy.version === pkg.version && policy.build === config.build,
      "Installer policy must target this release",
    );
    assert(
      native !== lock.nativeInputs || configuration !== lock.configuration,
      "Recompilation drift is not an installer change",
    );
    await command([process.execPath, "run", "framework:prepare"], root);
    await releaseApplication(project, false, { withUpdate: true });
  }
  const manifest = await verifyRelease(
    resolve(root, "dist/updates"),
    resolve(root, "dist/Fn.app"),
  );
  const candidateText = await Bun.file(
    resolve(root, "dist/updates/latest.json"),
  ).text();
  auditUpdatePath(baselineText, candidateText, policy);
  const installer = `Fn-${pkg.version}-${config.build}-mac-arm64.dmg`;
  for (const name of [
    installer,
    installer + ".sha256",
    installer + ".report.json",
  ])
    await cp(resolve(root, "dist", name), resolve(directory, name));
  await cp(
    resolve(root, "dist/updates/latest.json"),
    resolve(directory, "latest.json"),
  );
  await command([
    "tar",
    "-czf",
    resolve(directory, "updates.tar.gz"),
    "-C",
    resolve(root, "dist/updates"),
    ".",
  ]);
  const input: CandidateInput = {
    schema: 1,
    commit,
    runId: Number(process.env.GITHUB_RUN_ID),
    runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    version: pkg.version,
    build: config.build,
    runtimeId: manifest.runtimeId,
    policy,
    baselineSHA256: await checksum(resolve(directory, "baseline.signed.json")),
    runtimeLockSHA256: await checksum(lockPath),
    nativeInputs: native,
    runtimeConfiguration: configuration,
    runtimeBaselineBuild: runtimeBaseline.build,
    previousBuild: baseline.build,
    manifestSHA256: await checksum(resolve(directory, "latest.json")),
    installer,
    installerSHA256: await checksum(resolve(directory, installer)),
  };
  await Bun.write(
    resolve(directory, "build.input.json"),
    JSON.stringify(input, null, 2) + "\n",
  );
  console.log(
    "Signed candidate built once. Actual upgrade verification is required before sealing.",
  );
}
