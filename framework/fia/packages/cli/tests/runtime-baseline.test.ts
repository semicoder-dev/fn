import { test, expect } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  runtimeConfiguration,
  assertVerifiedBaseline,
  type RuntimeBaseline,
} from "../src/runtime-baseline.ts";
import { validateConfig } from "../src/project-config.ts";
import { releaseBuiltCode } from "../src/application.ts";
import { releaseFiles, type CodeRelease } from "../src/artifacts.ts";
import { generateUpdateKeys, verifyRelease } from "../src/updates.ts";
import { parseApplicationReleaseOptions } from "../src/release-options.ts";
import { runtimeInputs } from "../../../tools/runtime-inputs.ts";

test("runtime compatibility excludes code/version/build but includes immutable behavior and resources", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "fia-frozen-inputs-"));
  try {
    await writeFile(resolve(root, "fixed.txt"), "one");
    const config = validateConfig(
      {
        app: {
          name: "Frozen",
          identifier: "test.frozen",
          version: "1.0.0",
          build: 1,
        },
        agent: { command: "frozen", description: "Test" },
      },
      root,
    );
    const original = await runtimeConfiguration(config);
    expect(
      await runtimeConfiguration({
        ...config,
        app: { ...config.app, version: "1.0.1", build: 2 },
        backend: {
          ...config.backend,
          entry: "other.ts",
          assets: ["new-code.json"],
        },
      }),
    ).toBe(original);
    for (const modified of [
      { ...config, permissions: { NSCameraUsageDescription: "Camera" } },
      { ...config, backend: { ...config.backend, startupTimeoutMs: 20_000 } },
      { ...config, agent: { ...config.agent, description: "Changed" } },
      { ...config, runtime: { assets: ["fixed.txt"] } },
      { ...config, statusItem: { symbol: "star" } },
      { ...config, signing: { releaseIdentity: "changed" } },
    ])
      expect(await runtimeConfiguration(modified)).not.toBe(original);
    const fixed = { ...config, runtime: { assets: ["fixed.txt"] } };
    const before = await runtimeConfiguration(fixed);
    await writeFile(resolve(root, "fixed.txt"), "two");
    expect(await runtimeConfiguration(fixed)).not.toBe(before);
    expect(() =>
      assertVerifiedBaseline({
        app: root,
        lock: { runtimeId: "a".repeat(64) },
      } as RuntimeBaseline),
    ).toThrow("not been verified");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("native input identity ignores packaging docs and directory location, but detects native changes", async () => {
  const roots = await Promise.all(
    ["a", "b"].map((prefix) =>
      mkdtemp(resolve(tmpdir(), "fia-input-" + prefix)),
    ),
  );
  try {
    for (const root of roots) {
      await mkdir(resolve(root, "Sources"));
      await writeFile(resolve(root, "Sources/main.swift"), "print(1)");
    }
    const initial = await runtimeInputs(roots[0]);
    expect(await runtimeInputs(roots[1])).toBe(initial);
    await writeFile(
      resolve(roots[0]!, "packaging.ts"),
      "changed build workflow",
    );
    expect(await runtimeInputs(roots[0])).toBe(initial);
    await writeFile(resolve(roots[0]!, "Sources/main.swift"), "print(2)");
    expect(await runtimeInputs(roots[0])).not.toBe(initial);
  } finally {
    for (const root of roots) await rm(root, { recursive: true, force: true });
  }
});

test("combined release signs exactly the already-built code and rejects post-build changes", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "fia-release-built-"));
  const oldKey = process.env.FIA_UPDATE_PRIVATE_KEY_FILE;
  try {
    const key = await generateUpdateKeys(resolve(root, "keys"));
    process.env.FIA_UPDATE_PRIVATE_KEY_FILE = key.privateKeyFile;
    const config = validateConfig(
      {
        app: {
          name: "Frozen",
          identifier: "test.frozen",
          version: "1.0.1",
          build: 2,
        },
        agent: { command: "frozen", description: "Test" },
        updates: {
          url: "https://example.com/updates/latest.json",
          publicKey: key.publicKey,
        },
      },
      root,
    );
    const code = resolve(root, "sealed-code");
    await mkdir(resolve(code, "backend"), { recursive: true });
    await mkdir(resolve(code, "web"));
    await writeFile(
      resolve(code, "backend/index.js"),
      "console.log('already built')",
    );
    await writeFile(
      resolve(code, "web/index.html"),
      "<main>Already built</main>",
    );
    const release: CodeRelease = {
      schema: 1,
      identifier: config.app.identifier,
      version: "1.0.1",
      build: 2,
      runtimeId: "a".repeat(64),
      baseURL: "https://example.com/updates/releases/2/",
      files: await releaseFiles(code),
    };
    await writeFile(resolve(code, "manifest.json"), JSON.stringify(release));
    const result = await releaseBuiltCode(config, code);
    expect(
      verifyRelease(await Bun.file(result.manifest).json(), key.publicKey),
    ).toEqual(release);
    await writeFile(resolve(code, "backend/index.js"), "tampered");
    await expect(releaseBuiltCode(config, code)).rejects.toThrow(
      "changed after assembly",
    );
    expect(
      verifyRelease(await Bun.file(result.manifest).json(), key.publicKey),
    ).toEqual(release);
  } finally {
    if (oldKey === undefined) delete process.env.FIA_UPDATE_PRIVATE_KEY_FILE;
    else process.env.FIA_UPDATE_PRIVATE_KEY_FILE = oldKey;
    await rm(root, { recursive: true, force: true });
  }
});
test("release options cannot silently switch update type or omit a runtime lock", () => {
  expect(
    parseApplicationReleaseOptions([
      "--runtime-base",
      "release/runtime.lock.json",
      "--with-update",
    ]),
  ).toEqual({
    update: false,
    withUpdate: true,
    runtimeBase: "release/runtime.lock.json",
  });
  for (const args of [
    ["--update", "--with-update"],
    ["--runtime-base"],
    ["--update", "--update"],
    ["--force"],
  ])
    expect(() => parseApplicationReleaseOptions(args)).toThrow();
});
