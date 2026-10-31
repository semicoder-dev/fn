import { appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const packageName = "@semicoder/fn-sdk";
export const repository = "semicoder-dev/fn";
export const registry = "https://registry.npmjs.org";

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Stable SDK releases only; plugin compatibility is expressed by npm peers.
export function validVersion(version: unknown): version is string {
  return (
    typeof version === "string" &&
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) &&
    version.split(".").every((part) => Number.isSafeInteger(Number(part)))
  );
}

export function validatePackage(pkg: Record<string, any>, kind = "sdk") {
  assert(pkg.name === `@semicoder/fn-${kind}`, "Unexpected package name");
  assert(validVersion(pkg.version), "SDK version must be stable x.y.z");
  assert(pkg.private !== true, "SDK must be publishable");
  assert(
    pkg.repository?.url === `git+https://github.com/${repository}.git` &&
      pkg.repository.directory === `packages/${kind}`,
    "SDK repository metadata differs from the publisher",
  );
  assert(
    pkg.publishConfig?.access === "public" &&
      pkg.publishConfig.registry === registry,
    "SDK must publish publicly to npm",
  );
  for (const kind of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const version of Object.values(pkg[kind] ?? {})) {
      assert(
        typeof version === "string" &&
          !/^(workspace:|file:|link:|\.\.?\/|\/)/.test(version),
        "Published SDK cannot depend on local workspace paths",
      );
    }
  }
  return {
    version: pkg.version as string,
    tag: `sdk-v${pkg.version}`,
    filename: `semicoder-fn-${kind}-${pkg.version}.tgz`,
  };
}

export function validateTrigger(
  version: string,
  env: Record<string, string | undefined>,
) {
  if (!env.GITHUB_ACTIONS) return;
  assert(
    env.GITHUB_REPOSITORY === repository,
    "SDK publishing is only enabled in the configured repository",
  );
  if (env.GITHUB_EVENT_NAME === "push") {
    assert(
      env.GITHUB_REF === `refs/tags/sdk-v${version}`,
      "Tag and SDK version differ",
    );
  } else {
    assert(
      env.GITHUB_EVENT_NAME === "workflow_dispatch",
      "Unexpected SDK release trigger",
    );
  }
}

if (import.meta.main) {
  assert(Bun.version === "1.4.4", "Use Bun 1.4.4");
  const release = validatePackage(
    await Bun.file(
      new URL("../../packages/sdk/package.json", import.meta.url),
    ).json(),
  );
  const uiPackage = await Bun.file(
    new URL("../../packages/ui/package.json", import.meta.url),
  ).json();
  const ui = validatePackage(uiPackage, "ui");
  assert(
    uiPackage.peerDependencies?.[packageName] === release.version,
    "UI must use this SDK release",
  );
  if (process.argv.includes("--release"))
    validateTrigger(release.version, process.env);
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `version=${release.version}\nfilename=${release.filename}\nui_filename=${ui.filename}\n`,
    );
  console.log(
    `SDK/UI configuration valid: ${packageName}@${release.version}, @semicoder/fn-ui@${ui.version} (${release.tag})`,
  );
}
