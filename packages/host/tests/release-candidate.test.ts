import { test, expect } from "bun:test";
import { generateKeyPairSync, sign, createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { config } from "../../../scripts/release/config";
import {
  codeScenarios,
  candidateWorkflow,
  inventory,
  validateEvidence,
  verifyCandidate,
  type CandidateInput,
  type CandidateReport,
  type UpdateEvidence,
} from "../../../scripts/release/candidate-manifest";
import { parseBinding, validateRun } from "../../../scripts/release/promote";
import { command } from "../../../scripts/release/process";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const pair = generateKeyPairSync("ed25519");
const publicKey = pair.publicKey
  .export({ format: "der", type: "spki" })
  .subarray(-32)
  .toString("base64");
function signed(build: number) {
  const payload = Buffer.from(
    JSON.stringify({
      schema: 1,
      identifier: "com.semicoder.fn",
      version: `0.8.${build - 16}`,
      build,
      runtimeId: "a".repeat(64),
      baseURL: `https://semicoder-dev.github.io/fn/updates/releases/${build}/`,
      downloadURL: config.downloadURL,
      files: ["backend/index.js", "web/index.html"].map((path) => ({
        path,
        size: 4,
        sha256: hash("code"),
      })),
    }),
  );
  return JSON.stringify({
    payload: payload.toString("base64"),
    signature: sign(null, payload, pair.privateKey).toString("base64"),
  });
}
function inputs(): CandidateInput {
  return {
    schema: 1,
    commit: "b".repeat(40),
    runId: 123,
    runAttempt: 1,
    version: "0.8.1",
    build: 17,
    runtimeId: "a".repeat(64),
    policy: { kind: "code" },
    baselineSHA256: hash(signed(16)),
    manifestSHA256: hash(signed(17)),
    runtimeLockSHA256: hash(lockText()),
    nativeInputs: "c".repeat(64),
    runtimeConfiguration: "d".repeat(64),
    runtimeBaselineBuild: 16,
    previousBuild: 16,
    installer: "Fn-0.8.1-17-mac-arm64.dmg",
    installerSHA256: hash("installer"),
  };
}
function lockText() {
  return JSON.stringify({
    origin: { manifestSHA256: hash(signed(16)) },
    runtimeId: "a".repeat(64),
    nativeInputs: "c".repeat(64),
    configuration: "d".repeat(64),
  });
}
function evidence(input = inputs()): UpdateEvidence {
  return {
    schema: 1,
    mode: "prepublication-https-replay",
    candidateSHA256: input.manifestSHA256,
    baselineSHA256: input.baselineSHA256,
    runtimeId: input.runtimeId,
    originalAppsVerified: true,
    cases: [...codeScenarios, "repeat-check", "new-install"].map((name) => ({
      name,
      passed: true,
      installedBuild: name === "new-install" ? 17 : 16,
      targetBuild: 17,
    })),
  };
}
test("a candidate requires actual bound upgrade/recovery evidence, not a successful new-app smoke", () => {
  const input = inputs(),
    valid = evidence(input);
  expect(() => validateEvidence(input, valid)).not.toThrow();
  expect(() =>
    validateEvidence({ ...input, runtimeBaselineBuild: 15 }, valid),
  ).toThrow("repeat-upgrade");
  for (const invalid of [
    { ...valid, mode: "public" as const },
    { ...valid, originalAppsVerified: false },
    { ...valid, baselineSHA256: "f".repeat(64) },
    {
      ...valid,
      cases: valid.cases.filter((item) => item.name !== "activation-crash"),
    },
    {
      ...valid,
      cases: valid.cases.map((item) => ({ ...item, targetBuild: 18 })),
    },
    {
      ...valid,
      cases: valid.cases.map((item) => ({ ...item, installedBuild: 17 })),
    },
  ])
    expect(() => validateEvidence(input, invalid)).toThrow();
});
test("promotion rejects untrusted workflows, unfinished runs, missing bindings and mismatched artifacts", async () => {
  const run = {
    event: "workflow_dispatch",
    head_branch: "main",
    head_sha: "b".repeat(40),
    conclusion: "success",
    path: candidateWorkflow,
    repository: { full_name: config.repository },
  };
  expect(() => validateRun(run)).not.toThrow();
  for (const invalid of [
    { ...run, event: "pull_request" },
    { ...run, conclusion: "failure" },
    { ...run, head_branch: "feature" },
    { ...run, path: ".github/workflows/ci.yml" },
    { ...run, repository: { full_name: "another/repo" } },
  ])
    expect(() => validateRun(invalid)).toThrow();
  expect(() => validateRun(run, "c".repeat(40))).toThrow();
  expect(() => parseBinding("v0.8.1")).toThrow();
  const directory = await mkdtemp(join(tmpdir(), "fn-candidate-test-"));
  try {
    const input = inputs();
    const contents: Record<string, string> = {
      "latest.json": signed(17),
      "baseline.signed.json": signed(16),
      "runtime-baseline.signed.json": signed(16),
      "runtime.lock.json": lockText(),
      "runtime-reuse.json": JSON.stringify({
        schema: 1,
        commit: input.commit,
        runId: input.runId,
        runtimeLockSHA256: input.runtimeLockSHA256,
        checks: ["project", "temporary"].map((cwd) => ({
          cwd,
          emptyCache: true,
          runtimeId: input.runtimeId,
        })),
      }),
      "build.input.json": JSON.stringify(input),
      "e2e.report.json": JSON.stringify(evidence()),
      "updates.tar.gz": "archive",
      [input.installer]: "installer",
      [input.installer + ".sha256"]: hash("installer"),
      [input.installer + ".report.json"]: '{"ok":true}',
    };
    for (const [name, text] of Object.entries(contents))
      await Bun.write(join(directory, name), text);
    const report: CandidateReport = {
      ...input,
      status: "verified",
      files: await inventory(directory),
    };
    const text = JSON.stringify(report);
    await Bun.write(join(directory, "candidate.report.json"), text);
    const binding = {
      schema: 1 as const,
      commit: input.commit,
      runId: input.runId,
      artifactId: 456,
      reportSHA256: hash(text),
      version: input.version,
      build: input.build,
    };
    expect(
      parseBinding("Fn verified candidate\n" + JSON.stringify(binding)),
    ).toEqual(binding);
    expect((await verifyCandidate(directory, binding, publicKey)).status).toBe(
      "verified",
    );
    await expect(
      verifyCandidate(
        directory,
        { ...binding, reportSHA256: "d".repeat(64) },
        publicKey,
      ),
    ).rejects.toThrow("binding");
    await Bun.write(join(directory, input.installer), "rebuilt installer");
    await expect(
      verifyCandidate(directory, binding, publicKey),
    ).rejects.toThrow("changed after verification");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
test("publishing stages immutable code while retaining the old feed, then activates the same bytes idempotently", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-staged-publish-"));
  try {
    await mkdir(join(directory, "scripts/release"), { recursive: true });
    await mkdir(join(directory, "release"));
    for (const name of ["site.ts", "verify.ts", "config.ts"])
      await cp(
        resolve(import.meta.dir, "../../../scripts/release", name),
        join(directory, "scripts/release", name),
      );
    await Bun.write(
      join(directory, "release/config.json"),
      JSON.stringify({ ...config, build: 17, publicKey }),
    );
    await Bun.write(join(directory, "package.json"), '{"version":"0.8.1"}');
    await Bun.write(join(directory, "source/latest.json"), signed(17));
    await Bun.write(join(directory, "site/updates/latest.json"), signed(16));
    for (const version of [16, 17])
      for (const path of ["backend/index.js", "web/index.html"])
        await Bun.write(
          join(
            directory,
            version === 17 ? "source" : "site/updates",
            "releases",
            String(version),
            path,
          ),
          "code",
        );
    await Bun.write(
      join(directory, "test.ts"),
      `import {stageSite} from './scripts/release/site';
const original=await Bun.file('site/updates/latest.json').text();
await stageSite('source','site',{activate:false});
if(await Bun.file('site/updates/latest.json').text()!==original)throw Error('stage advanced feed');
await stageSite('source','site');await stageSite('source','site');
if(await Bun.file('site/updates/latest.json').text()!==await Bun.file('source/latest.json').text())throw Error('wrong activation');
if(await Bun.file('site/updates/releases/16/backend/index.js').text()!=='code')throw Error('lost history');
await Bun.write('source/releases/17/backend/index.js','tampered');
let rejected=false;try{await stageSite('source','site')}catch{rejected=true}if(!rejected)throw Error('accepted corruption');`,
    );
    await command([process.execPath, "test.ts"], directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
