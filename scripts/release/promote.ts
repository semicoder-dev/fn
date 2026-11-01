import { mkdtemp, rm, appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { assert, config, root } from "./config";
import { command, github } from "./process";
import { checksum } from "./verify";
import {
  candidateArtifactName,
  candidateWorkflow,
  verifyCandidate,
  verifyLiveBaseline,
} from "./candidate-manifest";

export interface PromotionBinding {
  schema: 1;
  commit: string;
  runId: number;
  artifactId: number;
  reportSHA256: string;
  version: string;
  build: number;
}
export function parseBinding(message: string): PromotionBinding {
  assert(
    message.startsWith("Fn verified candidate\n"),
    "Release tag lacks a verified candidate binding",
  );
  const value = JSON.parse(
    message.slice(message.indexOf("\n") + 1),
  ) as PromotionBinding;
  assert(
    value.schema === 1 &&
      /^[a-f0-9]{40}$/.test(value.commit) &&
      /^[a-f0-9]{64}$/.test(value.reportSHA256) &&
      /^\d+\.\d+\.\d+$/.test(value.version) &&
      [value.runId, value.artifactId, value.build].every(
        (n) => Number.isSafeInteger(n) && n > 0,
      ),
    "Invalid release tag binding",
  );
  return value;
}
export function validateRun(
  run: {
    event: string;
    head_branch: string;
    head_sha: string;
    conclusion: string;
    path: string;
    repository: { full_name: string };
  },
  commit?: string,
) {
  assert(
    run.event === "workflow_dispatch" &&
      run.head_branch === "main" &&
      run.conclusion === "success" &&
      run.path === candidateWorkflow &&
      run.repository.full_name === config.repository &&
      /^[a-f0-9]{40}$/.test(run.head_sha) &&
      (!commit || run.head_sha === commit),
    "Candidate must come from a successful main-branch candidate workflow in this repository",
  );
}
async function downloadRun(
  runId: number,
  directory: string,
  expected?: PromotionBinding,
) {
  assert(Number.isSafeInteger(runId) && runId > 0, "Invalid candidate run ID");
  const run = JSON.parse(
    await github("api", `repos/${config.repository}/actions/runs/${runId}`),
  );
  validateRun(run, expected?.commit);
  const result = JSON.parse(
    await github(
      "api",
      `repos/${config.repository}/actions/runs/${runId}/artifacts?per_page=100`,
    ),
  );
  const artifacts = result.artifacts.filter(
    (item: { name: string }) => item.name === candidateArtifactName,
  );
  assert(
    artifacts.length === 1 && !artifacts[0].expired,
    "Candidate artifact is missing, ambiguous or expired; rebuild and revalidate explicitly",
  );
  const artifact = artifacts[0];
  assert(
    !expected || expected.artifactId === artifact.id,
    "Candidate artifact ID differs from the release tag",
  );
  const temporary = await mkdtemp(resolve(tmpdir(), "fn-candidate-download-"));
  try {
    const archive = resolve(temporary, "artifact.zip");
    const child = Bun.spawn(
      [
        "gh",
        "api",
        `repos/${config.repository}/actions/artifacts/${artifact.id}/zip`,
      ],
      { stdout: Bun.file(archive), stderr: "pipe" },
    );
    const error = await new Response(child.stderr).text();
    assert(
      (await child.exited) === 0,
      "Exact artifact download failed: " + error,
    );
    if (artifact.digest)
      assert(
        artifact.digest === "sha256:" + (await checksum(archive)),
        "GitHub artifact digest mismatch",
      );
    const names = (await command(["unzip", "-Z1", archive])).split("\n");
    assert(
      names.every(
        (name) =>
          /^[A-Za-z0-9_.-]+$/.test(name) && name !== "." && name !== "..",
      ),
      "Candidate archive contains unexpected paths",
    );
    await mkdir(directory, { recursive: true });
    await command(["unzip", "-q", "-n", archive, "-d", directory]);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  const report = await verifyCandidate(directory, expected);
  assert(
    report.commit === run.head_sha &&
      report.runId === runId &&
      report.runAttempt === run.run_attempt,
    "Candidate provenance does not match its successful workflow attempt",
  );
  const comparison = JSON.parse(
    await github(
      "api",
      `repos/${config.repository}/compare/${report.commit}...main`,
    ),
  );
  assert(
    ["ahead", "identical"].includes(comparison.status),
    "Candidate commit is not on main",
  );
  return { report, artifactId: artifact.id as number };
}
if (import.meta.main) {
  const [action, value, destination] = process.argv.slice(2);
  if (action === "--from-tag") {
    assert(
      value &&
        destination &&
        process.env.GITHUB_EVENT_NAME === "push" &&
        process.env.GITHUB_REF === "refs/tags/" + value,
      "Resolve only the triggering release tag",
    );
    const raw = await command(["git", "cat-file", "tag", value], root);
    const binding = parseBinding(raw.slice(raw.indexOf("\n\n") + 2));
    assert(
      value === "v" + binding.version &&
        (await command(["git", "rev-parse", value + "^{commit}"], root)) ===
          binding.commit,
      "Tag target differs from verified candidate",
    );
    await downloadRun(binding.runId, resolve(destination), binding);
    await verifyLiveBaseline(resolve(destination), true);
    if (process.env.GITHUB_OUTPUT)
      await appendFile(
        process.env.GITHUB_OUTPUT,
        `run_id=${binding.runId}\nartifact_id=${binding.artifactId}\n`,
      );
  } else {
    assert(
      action === "--run-id" && /^\d+$/.test(value ?? "") && !destination,
      "Usage: release:promote --run-id <candidate-run-id>",
    );
    assert(
      !process.env.GITHUB_ACTIONS,
      "Run promotion with the maintainer's GitHub session; GITHUB_TOKEN-created tags do not trigger release workflows",
    );
    const temporary = await mkdtemp(resolve(tmpdir(), "fn-promote-"));
    try {
      const directory = resolve(temporary, "candidate");
      const { report, artifactId } = await downloadRun(
        Number(value),
        directory,
      );
      await verifyLiveBaseline(directory);
      const binding: PromotionBinding = {
        schema: 1,
        commit: report.commit,
        runId: report.runId,
        artifactId,
        reportSHA256: await checksum(
          resolve(directory, "candidate.report.json"),
        ),
        version: report.version,
        build: report.build,
      };
      const tag = "v" + report.version;
      const tags = JSON.parse(
        await github(
          "api",
          `repos/${config.repository}/git/matching-refs/tags/${tag}`,
        ),
      );
      assert(
        !tags.some((item: { ref: string }) => item.ref === "refs/tags/" + tag),
        "Tag already exists; retry its workflow without replacing the tag",
      );
      const body = resolve(temporary, "tag.json");
      await Bun.write(
        body,
        JSON.stringify({
          tag,
          message: "Fn verified candidate\n" + JSON.stringify(binding),
          object: report.commit,
          type: "commit",
        }),
      );
      const object = JSON.parse(
        await github(
          "api",
          "--method",
          "POST",
          `repos/${config.repository}/git/tags`,
          "--input",
          body,
        ),
      );
      await Bun.write(
        body,
        JSON.stringify({ ref: "refs/tags/" + tag, sha: object.sha }),
      );
      await github(
        "api",
        "--method",
        "POST",
        `repos/${config.repository}/git/refs`,
        "--input",
        body,
      );
      console.log(
        `Promoted ${tag} from verified candidate run ${report.runId}; no rebuild or signing requested.`,
      );
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }
}
