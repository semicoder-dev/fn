import { mkdir, mkdtemp, rm, cp } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { config, root, readManifest, assert } from "./config";
import { command } from "./process";
import { loadProjectConfig } from "../../framework/fia/packages/cli/src/project-config";
import {
  runtimeConfiguration,
  runtimeFiles,
  parseRuntimeLock,
  verifyBaselineSignature,
  withRuntimeBaseline,
  type RuntimeLock,
} from "../../framework/fia/packages/cli/src/runtime-baseline";
import { runtimeInputs } from "../../framework/fia/tools/runtime-inputs";
import {
  infoPlist,
  buildCode,
} from "../../framework/fia/packages/cli/src/application";
import { canonical } from "../../framework/fia/packages/cli/src/runtime-baseline";
import { sha256 } from "../../framework/fia/packages/cli/src/artifacts";
import { bunEntitlements } from "../../framework/fia/packages/cli/src/runtime-recipe";

export async function checkRuntimeInputs(lock: RuntimeLock) {
  assert(
    (await runtimeInputs()) === lock.nativeInputs,
    "Native inputs changed. Code releases must reuse their frozen runtime; prepare an explicit installer release instead.",
  );
}

// Maintainer command: bootstrap/update a lock only from an already public signed installer.
// Local files are a download cache, never an alternative identity or trust source.
if (import.meta.main) {
  const [action, version, cachedDMG] = process.argv.slice(2);
  if (action === "verify-code") {
    const lockPath = resolve(root, "release/runtime.lock.json");
    const lock = parseRuntimeLock(await Bun.file(lockPath).json());
    await checkRuntimeInputs(lock);
    const project = await loadProjectConfig(root);
    const temporary = await mkdtemp(resolve(tmpdir(), "fn-frozen-build-"));
    const checks: { cwd: string; emptyCache: boolean; runtimeId: string }[] =
      [];
    try {
      for (const [index, cwd] of [root, temporary].entries()) {
        await withRuntimeBaseline(
          project,
          lockPath,
          async (baseline) => {
            const previousDirectory = process.cwd();
            try {
              process.chdir(cwd);
              const result = await buildCode(
                project,
                resolve(temporary, "code-" + index),
                undefined,
                false,
                undefined,
                baseline,
              );
              assert(
                result.runtimeId === lock.runtimeId,
                "Runtime drifted across build directories",
              );
              checks.push({
                cwd: index === 0 ? "project" : "temporary",
                emptyCache: true,
                runtimeId: result.runtimeId,
              });
            } finally {
              process.chdir(previousDirectory);
            }
          },
          { cacheDirectory: resolve(temporary, "cache-" + index) },
        );
      }
      await Bun.write(
        resolve(root, "artifacts/release/runtime-reuse.json"),
        JSON.stringify(
          {
            schema: 1,
            commit: await command(["git", "rev-parse", "HEAD"], root),
            runId: Number(process.env.GITHUB_RUN_ID) || null,
            runtimeLockSHA256: await sha256(lockPath),
            checks,
          },
          null,
          2,
        ) + "\n",
      );
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  } else if (action === "check") {
    await checkRuntimeInputs(
      parseRuntimeLock(
        await Bun.file(resolve(root, "release/runtime.lock.json")).json(),
      ),
    );
    console.log("Native inputs match the frozen runtime");
  } else {
    assert(
      action === "capture" && /^\d+\.\d+\.\d+$/.test(version ?? ""),
      "Usage: runtime.ts check | verify-code | capture <public-version> [cached-dmg]",
    );
    const tag = "v" + version;
    const commit = await command(["git", "rev-parse", tag + "^{commit}"], root);
    const metadata = JSON.parse(
      await command(["git", "show", `${tag}:release/config.json`], root),
    );
    const filename = `Fn-${version}-${metadata.build}-mac-arm64.dmg`;
    const url = `https://github.com/${config.repository}/releases/download/${tag}/${filename}`;
    const manifestURL = `https://github.com/${config.repository}/releases/download/${tag}/latest.json`;
    const temporary = await mkdtemp(resolve(tmpdir(), "fn-runtime-capture-"));
    const mount = resolve(temporary, "mount");
    let mounted = false;
    try {
      for (const [name, address] of [
        ["baseline.dmg.sha256", url + ".sha256"],
        ["latest.json", manifestURL],
      ]) {
        const response = await fetch(address!, {
          signal: AbortSignal.timeout(60_000),
        });
        assert(response.ok, "Public runtime evidence unavailable");
        await Bun.write(
          resolve(temporary, name!),
          await response.arrayBuffer(),
        );
      }
      const dmg = resolve(temporary, "baseline.dmg");
      if (cachedDMG) await cp(resolve(cachedDMG), dmg);
      else {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(120_000),
        });
        assert(response.ok, "Public installer unavailable");
        await Bun.write(dmg, await response.arrayBuffer());
      }
      const checksum = (
        await Bun.file(resolve(temporary, "baseline.dmg.sha256")).text()
      ).split(/\s/)[0];
      assert(
        (await sha256(dmg)) === checksum,
        "Public installer checksum mismatch",
      );
      const signed = await Bun.file(resolve(temporary, "latest.json")).text();
      const release = readManifest(signed);
      assert(
        release.version === version && release.build === metadata.build,
        "Public release identity mismatch",
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
      await command([
        "hdiutil",
        "attach",
        dmg,
        "-readonly",
        "-nobrowse",
        "-mountpoint",
        mount,
      ]);
      mounted = true;
      const app = resolve(mount, "Fn.app");
      const team = "947ZA68N2J";
      await verifyBaselineSignature(app, team);
      const expectedBunEntitlements = resolve(
        temporary,
        "bun-entitlements.plist",
      );
      const actualBunEntitlements = resolve(
        temporary,
        "public-bun-entitlements.plist",
      );
      await Bun.write(expectedBunEntitlements, bunEntitlements);
      await Bun.write(
        actualBunEntitlements,
        await command([
          "codesign",
          "-d",
          "--entitlements",
          ":-",
          resolve(app, "Contents/Helpers/bun"),
        ]),
      );
      const plistJSON = async (path: string) =>
        canonical(
          JSON.parse(
            await command(["plutil", "-convert", "json", "-o", "-", path]),
          ),
        );
      assert(
        (await plistJSON(expectedBunEntitlements)) ===
          (await plistJSON(actualBunEntitlements)),
        "Public Bun signing permissions differ",
      );
      const runtime = await Bun.file(
        resolve(app, "Contents/Resources/fia.runtime.json"),
      ).json();
      assert(
        runtime.runtimeId === release.runtimeId &&
          runtime.updates.publicKey === config.publicKey,
        "Installer/update runtime mismatch",
      );
      // Prove that today's native inputs still describe the public source revision.
      const archive = resolve(temporary, "source.tar");
      await command(
        [
          "git",
          "archive",
          "--format=tar",
          `--output=${archive}`,
          commit,
          "framework/fia",
        ],
        root,
      );
      await command(["tar", "-xf", archive, "-C", temporary]);
      assert(
        (await runtimeInputs(resolve(temporary, "framework/fia"))) ===
          (await runtimeInputs()),
        "Current native source differs from the requested public baseline",
      );
      const project = await loadProjectConfig(root);
      assert(
        project.signing?.releaseIdentity ===
          `Developer ID Application: Duoxing Fu (${team})`,
        "Configure the production signing identity before recording its baseline",
      );
      const expectedPlist = resolve(temporary, "expected.plist");
      await Bun.write(
        expectedPlist,
        infoPlist(
          project,
          undefined,
          undefined,
          project.signing.application?.production?.cloudKitContainers,
        ),
      );
      const normalizedPlist = async (path: string) => {
        const value = JSON.parse(
          await command(["plutil", "-convert", "json", "-o", "-", path]),
        );
        delete value.CFBundleVersion;
        delete value.CFBundleShortVersionString;
        return canonical(value);
      };
      assert(
        (await normalizedPlist(expectedPlist)) ===
          (await normalizedPlist(resolve(app, "Contents/Info.plist"))),
        "Public native permissions/configuration differ",
      );
      assert(
        runtime.app.name === project.app.name &&
          runtime.app.identifier === project.app.identifier &&
          JSON.stringify(runtime.updates) === JSON.stringify(project.updates) &&
          runtime.backendStartupTimeoutMs === project.backend.startupTimeoutMs,
        "Public runtime configuration differs",
      );
      for (const name of ["agent-cli", "script-preload"])
        assert(
          (await sha256(resolve(app, "Contents/Resources", name + ".js"))) ===
            (await sha256(
              resolve(root, "framework/fia/packages/cli/dist", name + ".js"),
            )),
          "Fixed CLI differs from public runtime",
        );
      assert(
        canonical(runtime.agent) ===
          canonical({
            command: project.agent.command,
            description: project.agent.description,
          }) && canonical(runtime.statusItem) === canonical(project.statusItem),
        "Public fixed runtime metadata differs",
      );
      if (project.app.icon)
        assert(
          (await sha256(resolve(root, project.app.icon))) ===
            (await sha256(resolve(app, "Contents/Resources/AppIcon.icns"))),
          "Public runtime icon differs",
        );
      if (version === "0.8.1")
        assert(
          checksum ===
            "61b693f20bfe109ca8af8d6aa1eb465e5e1112eb4a4d09deb0acba9e35d627fe" &&
            commit === "6bb370ee9eaf60ed71581b26314d91c94fd0ef0f",
          "Unexpected bootstrap baseline",
        );
      else {
        const reportResponse = await fetch(
          `https://github.com/${config.repository}/releases/download/${tag}/candidate.report.json`,
        );
        assert(
          reportResponse.ok,
          "New runtime baseline requires its public candidate provenance",
        );
        const report = (await reportResponse.json()) as {
          status: string;
          commit: string;
          nativeInputs: string;
          runtimeConfiguration: string;
          runtimeId: string;
          installerSHA256: string;
        };
        assert(
          report.status === "verified" &&
            report.commit === commit &&
            report.nativeInputs === (await runtimeInputs()) &&
            report.runtimeConfiguration ===
              (await runtimeConfiguration(project)) &&
            report.runtimeId === runtime.runtimeId &&
            report.installerSHA256 === checksum,
          "Public native provenance differs",
        );
      }
      const lock: RuntimeLock = {
        schema: 1,
        origin: {
          url,
          sha256: checksum!,
          manifestURL,
          manifestSHA256: await sha256(resolve(temporary, "latest.json")),
          sourceCommit: commit,
        },
        runtimeId: release.runtimeId,
        teamIdentifier: team,
        appName: "Fn",
        configuration: await runtimeConfiguration(project),
        nativeInputs: await runtimeInputs(),
        files: await runtimeFiles(app),
      };
      parseRuntimeLock(lock);
      const cache = resolve(root, ".fia/runtime-baselines", checksum!);
      await mkdir(cache, { recursive: true });
      await cp(dmg, resolve(cache, "baseline.dmg"));
      await cp(
        resolve(temporary, "latest.json"),
        resolve(cache, "latest.json"),
      );
      await Bun.write(
        resolve(root, "release/runtime.lock.json"),
        JSON.stringify(lock, null, 2) + "\n",
      );
      console.log(`Recorded verified ${tag} runtime ${release.runtimeId}`);
    } finally {
      if (mounted) await command(["hdiutil", "detach", mount]);
      await rm(temporary, { recursive: true, force: true });
    }
  }
}
