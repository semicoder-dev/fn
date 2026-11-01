import { readdir, lstat } from "node:fs/promises";
import { join } from "node:path";
import { assert, config, readManifest } from "./config";
import { checksum } from "./verify";
import { auditUpdatePath, type UpdatePolicy } from "./update-path";
import type { RuntimeLock } from "../../framework/fia/packages/cli/src/runtime-baseline";

export const candidateArtifactName = "fn-release-candidate";
export const candidateWorkflow = ".github/workflows/release-candidate.yml";
export const codeScenarios = [
  "baseline-upgrade",
  "latest-upgrade",
  "restart",
  "data-preserved",
  "download-interrupted",
  "download-corrupt",
  "activation-crash",
  "activation-interrupted",
  "activation-exit",
  "busy-deferred",
] as const;
export interface CandidateInput {
  schema: 1;
  commit: string;
  runId: number;
  runAttempt: number;
  version: string;
  build: number;
  runtimeId: string;
  policy: UpdatePolicy;
  baselineSHA256: string;
  runtimeLockSHA256: string;
  nativeInputs: string;
  runtimeConfiguration: string;
  runtimeBaselineBuild: number;
  previousBuild: number;
  manifestSHA256: string;
  installer: string;
  installerSHA256: string;
}
export interface UpdateEvidence {
  schema: 1;
  mode: "prepublication-https-replay" | "public";
  candidateSHA256: string;
  baselineSHA256: string;
  runtimeId: string;
  cases: {
    name: string;
    passed: boolean;
    installedBuild: number;
    targetBuild: number;
  }[];
  originalAppsVerified: boolean;
}
export interface CandidateReport extends CandidateInput {
  status: "verified";
  files: { name: string; sha256: string; size: number }[];
}
export function validateEvidence(
  input: CandidateInput,
  evidence: UpdateEvidence,
) {
  assert(
    evidence.schema === 1 &&
      evidence.mode === "prepublication-https-replay" &&
      evidence.originalAppsVerified === true &&
      evidence.candidateSHA256 === input.manifestSHA256 &&
      evidence.baselineSHA256 === input.baselineSHA256 &&
      evidence.runtimeId === input.runtimeId,
    "Upgrade evidence is not bound to this candidate/baseline",
  );
  const required =
    input.policy.kind === "code"
      ? [
          ...codeScenarios,
          input.previousBuild > input.runtimeBaselineBuild
            ? "repeat-upgrade"
            : "repeat-check",
        ]
      : [
          "installer-upgrade",
          "restart",
          "data-preserved",
          "requires-installer",
        ];
  assert(
    evidence.cases.some(
      (item) =>
        item.name === "new-install" &&
        item.passed &&
        item.installedBuild === input.build &&
        item.targetBuild === input.build,
    ),
    "Missing actual new installation evidence",
  );
  for (const name of required)
    assert(
      evidence.cases.some(
        (item) =>
          item.name === name &&
          item.passed === true &&
          item.targetBuild === input.build &&
          item.installedBuild < input.build,
      ),
      "Missing actual update evidence: " + name,
    );
  assert(
    evidence.cases.every((item) => item.passed === true),
    "A candidate test failed",
  );
  assert(
    input.previousBuild >= input.runtimeBaselineBuild &&
      input.previousBuild < input.build,
    "Invalid upgrade starting builds",
  );
}
export async function inventory(directory: string) {
  const result: CandidateReport["files"] = [];
  for (const name of (await readdir(directory)).sort()) {
    if (name === "candidate.report.json") continue;
    assert(/^[A-Za-z0-9_.-]+$/.test(name), "Unsafe candidate filename");
    const path = join(directory, name),
      stat = await lstat(path);
    assert(
      stat.isFile() && !stat.isSymbolicLink(),
      "Candidate bundle must contain regular files only",
    );
    result.push({ name, size: stat.size, sha256: await checksum(path) });
  }
  return result;
}
export async function verifyCandidate(
  directory: string,
  binding?: { commit: string; runId: number; reportSHA256: string },
  publicKey = config.publicKey,
) {
  const path = join(directory, "candidate.report.json");
  const report = (await Bun.file(path).json()) as CandidateReport;
  assert(
    report.schema === 1 &&
      report.status === "verified" &&
      /^[a-f0-9]{40}$/.test(report.commit) &&
      Number.isSafeInteger(report.runId) &&
      report.runId > 0 &&
      Number.isSafeInteger(report.runAttempt) &&
      report.runAttempt > 0,
    "Invalid candidate provenance",
  );
  if (binding)
    assert(
      report.commit === binding.commit &&
        report.runId === binding.runId &&
        (await checksum(path)) === binding.reportSHA256,
      "Candidate differs from tag binding",
    );
  const { status: _status, files: _files, ...input } = report;
  assert(
    JSON.stringify(input) ===
      JSON.stringify(
        await Bun.file(join(directory, "build.input.json")).json(),
      ),
    "Candidate report differs from its original build inputs",
  );
  assert(
    JSON.stringify(await inventory(directory)) === JSON.stringify(report.files),
    "Candidate artifacts changed after verification",
  );
  for (const name of [
    "latest.json",
    "baseline.signed.json",
    "runtime-baseline.signed.json",
    "runtime.lock.json",
    "build.input.json",
    "e2e.report.json",
    "updates.tar.gz",
    report.installer,
    report.installer + ".sha256",
    report.installer + ".report.json",
  ])
    assert(
      report.files.some((file) => file.name === name),
      "Candidate artifact missing: " + name,
    );
  const manifestText = await Bun.file(join(directory, "latest.json")).text();
  const manifest = readManifest(manifestText, publicKey);
  const lock = (await Bun.file(
    join(directory, "runtime.lock.json"),
  ).json()) as RuntimeLock;
  const runtimeBaseline = readManifest(
    await Bun.file(join(directory, "runtime-baseline.signed.json")).text(),
    publicKey,
  );
  const previous = readManifest(
    await Bun.file(join(directory, "baseline.signed.json")).text(),
    publicKey,
  );
  assert(
    (await checksum(join(directory, "runtime-baseline.signed.json"))) ===
      lock.origin.manifestSHA256 &&
      runtimeBaseline.runtimeId === lock.runtimeId &&
      runtimeBaseline.build === report.runtimeBaselineBuild &&
      previous.build === report.previousBuild,
    "Runtime baseline evidence mismatch",
  );
  if (report.policy.kind === "code") {
    assert(
      report.runtimeId === lock.runtimeId &&
        report.nativeInputs === lock.nativeInputs &&
        report.runtimeConfiguration === lock.configuration,
      "Code candidate changed frozen runtime inputs",
    );
    const reuse = await Bun.file(join(directory, "runtime-reuse.json")).json();
    assert(
      reuse.schema === 1 &&
        reuse.commit === report.commit &&
        reuse.runId === report.runId &&
        reuse.runtimeLockSHA256 === report.runtimeLockSHA256 &&
        reuse.checks.length === 2 &&
        new Set(reuse.checks.map((check: { cwd: string }) => check.cwd))
          .size === 2 &&
        reuse.checks.every(
          (check: { emptyCache: boolean; runtimeId: string }) =>
            check.emptyCache && check.runtimeId === report.runtimeId,
        ),
      "Missing independent runner / empty-cache runtime reuse evidence",
    );
  }
  assert(
    report.version === manifest.version &&
      report.build === manifest.build &&
      report.runtimeId === manifest.runtimeId &&
      report.installer === `Fn-${report.version}-${report.build}-mac-arm64.dmg`,
    "Candidate product identity mismatch",
  );
  assert(
    (await checksum(join(directory, "latest.json"))) ===
      report.manifestSHA256 &&
      (await checksum(join(directory, "baseline.signed.json"))) ===
        report.baselineSHA256 &&
      (await checksum(join(directory, "runtime.lock.json"))) ===
        report.runtimeLockSHA256 &&
      (await checksum(join(directory, report.installer))) ===
        report.installerSHA256,
    "Candidate baseline or runtime changed",
  );
  auditUpdatePath(
    await Bun.file(join(directory, "baseline.signed.json")).text(),
    manifestText,
    report.policy,
    publicKey,
  );
  validateEvidence(
    report,
    await Bun.file(join(directory, "e2e.report.json")).json(),
  );
  assert(
    (await Bun.file(join(directory, report.installer + ".report.json")).json())
      .ok === true,
    "Installer smoke check failed",
  );
  return report;
}
export async function verifyLiveBaseline(
  directory: string,
  allowPromoted = false,
) {
  const report = await verifyCandidate(directory);
  const response = await fetch(config.updatesURL, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  assert(response.ok, "Cannot verify live release baseline");
  const text = await response.text();
  readManifest(text);
  const sha = new Bun.CryptoHasher("sha256").update(text).digest("hex");
  assert(
    sha === report.baselineSHA256 ||
      (allowPromoted && sha === report.manifestSHA256),
    "Published baseline changed; revalidate this candidate before promotion",
  );
  return report;
}
