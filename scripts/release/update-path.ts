import { resolve } from "node:path";
import { assert, config, pkg, readManifest, root } from "./config";

export type UpdatePolicy =
  | { kind: "code" }
  | { kind: "installer"; version: string; build: number; reason: string };

// The publish job intentionally runs without installed workspace dependencies.
export function parsePolicy(value: unknown): UpdatePolicy {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    "Invalid update policy",
  );
  const policy = value as Record<string, unknown>;
  const keys = Object.keys(policy).sort().join(",");
  if (policy.kind === "code") {
    assert(keys === "kind", "Unknown code update policy fields");
    return { kind: "code" };
  }
  assert(
    policy.kind === "installer" &&
      keys === "build,kind,reason,version" &&
      typeof policy.version === "string" &&
      /^\d+\.\d+\.\d+$/.test(policy.version) &&
      typeof policy.build === "number" &&
      Number.isSafeInteger(policy.build) &&
      policy.build > 0 &&
      typeof policy.reason === "string" &&
      policy.reason.trim().length > 0,
    "Installer policy requires an exact version/build and nonempty reason",
  );
  return {
    kind: "installer",
    version: policy.version,
    build: policy.build,
    reason: policy.reason.trim(),
  };
}

const canonical = (value: unknown) =>
  JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
        )
      : item,
  );

/** Both manifests must be signed by the application's permanent update key. */
export function auditUpdatePath(
  previousText: string,
  candidateText: string,
  policyValue: unknown,
  publicKey = config.publicKey,
) {
  const previous = readManifest(previousText, publicKey);
  const candidate = readManifest(candidateText, publicKey);
  const policy = parsePolicy(policyValue);
  const summary = ({ version, build, runtimeId }: typeof candidate) => ({
    version,
    build,
    runtimeId,
  });
  const base = {
    kind: policy.kind,
    previous: summary(previous),
    candidate: summary(candidate),
  };
  if (candidate.build === previous.build) {
    assert(
      canonical(previous) === canonical(candidate),
      "The published build already exists with different contents; use a new version/build",
    );
    return { ...base, status: "already-current" as const };
  }
  assert(
    candidate.build > previous.build,
    "Candidate build must exceed the published build",
  );
  const oldParts = previous.version.split(".").map(Number);
  const newParts = candidate.version.split(".").map(Number);
  const first = newParts.findIndex((part, index) => part !== oldParts[index]);
  assert(
    first >= 0 && newParts[first]! > oldParts[first]!,
    "Candidate version must exceed the published version",
  );
  if (policy.kind === "code") {
    assert(
      previous.runtimeId === candidate.runtimeId,
      `Code update blocked: runtimeId changed from ${previous.runtimeId} to ${candidate.runtimeId}. The installed public version would require a new installer. Verify and reuse the fixed runtime before publishing.`,
    );
    return { ...base, status: "compatible" as const };
  }
  assert(
    policy.version === candidate.version && policy.build === candidate.build,
    "Installer policy must name this exact candidate version/build; a previous exception cannot be reused",
  );
  assert(
    previous.runtimeId !== candidate.runtimeId,
    "Installer policy requires an actual runtime identity change",
  );
  return {
    ...base,
    status: "installer-required" as const,
    reason: policy.reason,
  };
}

/** Fail closed: an unavailable or unverifiable baseline never means a fresh release. */
export async function checkPublishedUpdatePath(candidateText: string) {
  const response = await fetch(config.updatesURL, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  assert(
    response.ok,
    `Cannot read published update baseline: HTTP ${response.status}`,
  );
  return auditUpdatePath(
    await response.text(),
    candidateText,
    await Bun.file(resolve(root, "release/update-policy.json")).json(),
  );
}

if (import.meta.main) {
  const text = await Bun.file(
    resolve(process.argv[2] ?? "dist/updates/latest.json"),
  ).text();
  const candidate = readManifest(text);
  assert(
    candidate.version === pkg.version && candidate.build === config.build,
    "Candidate does not match the source version/build",
  );
  const report = await checkPublishedUpdatePath(text);
  await Bun.write(
    resolve(root, "artifacts/release/update-path.report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(`Update path verified: ${report.status}`);
}
