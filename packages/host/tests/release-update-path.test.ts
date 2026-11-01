import { expect, test } from "bun:test";
import { generateKeyPairSync, sign } from "node:crypto";
import { resolve } from "node:path";
import {
  config,
  readManifest,
  type Manifest,
} from "../../../scripts/release/config";
import { auditUpdatePath } from "../../../scripts/release/update-path";

const fixtures = resolve(import.meta.dir, "../../../scripts/release/fixtures");
const oldText = await Bun.file(
  resolve(fixtures, "fn-0.8.0.signed.json"),
).text();
const newText = await Bun.file(
  resolve(fixtures, "fn-0.8.1.signed.json"),
).text();

function signedPair(change: Partial<Manifest> = {}) {
  const keys = generateKeyPairSync("ed25519");
  const publicKey = keys.publicKey
    .export({ format: "der", type: "spki" })
    .subarray(-32)
    .toString("base64");
  const previous = readManifest(newText);
  const candidate = {
    ...previous,
    version: "0.8.2",
    build: 18,
    baseURL: new URL("releases/18/", config.updatesURL).href,
    files: previous.files.map((file, index) =>
      index === 0 ? { ...file, sha256: "a".repeat(64) } : file,
    ),
    ...change,
  };
  const envelope = (manifest: Manifest) => {
    const bytes = Buffer.from(JSON.stringify(manifest));
    return JSON.stringify({
      payload: bytes.toString("base64"),
      signature: sign(null, bytes, keys.privateKey).toString("base64"),
    });
  };
  return {
    previous: envelope(previous),
    candidate: envelope(candidate),
    publicKey,
  };
}

test("the actual 0.8.0 to 0.8.1 manifests block an unintended installer-only UI update", () => {
  expect(() => auditUpdatePath(oldText, newText, { kind: "code" })).toThrow(
    "Code update blocked: runtimeId changed",
  );
  expect(auditUpdatePath(newText, newText, { kind: "code" }).status).toBe(
    "already-current",
  );
});

test("signed new code on the existing runtime passes, while rollback and build reuse fail", () => {
  const pair = signedPair();
  expect(
    auditUpdatePath(
      pair.previous,
      pair.candidate,
      { kind: "code" },
      pair.publicKey,
    ).status,
  ).toBe("compatible");
  expect(() =>
    auditUpdatePath(
      pair.candidate,
      pair.previous,
      { kind: "code" },
      pair.publicKey,
    ),
  ).toThrow("Candidate build must exceed");
  const reused = signedPair({
    version: "0.8.1",
    build: 17,
    baseURL: new URL("releases/17/", config.updatesURL).href,
  });
  expect(() =>
    auditUpdatePath(
      reused.previous,
      reused.candidate,
      { kind: "code" },
      reused.publicKey,
    ),
  ).toThrow("already exists with different contents");
});

test("installer exceptions need a reason and the exact target, and cannot justify an unchanged runtime", () => {
  const policy = {
    kind: "installer",
    version: "0.8.1",
    build: 17,
    reason: "Native API changed",
  };
  expect(auditUpdatePath(oldText, newText, policy).status).toBe(
    "installer-required",
  );
  expect(() =>
    auditUpdatePath(oldText, newText, { ...policy, reason: " " }),
  ).toThrow();
  expect(() =>
    auditUpdatePath(oldText, newText, { ...policy, build: 18 }),
  ).toThrow("exact candidate");
  const pair = signedPair();
  expect(() =>
    auditUpdatePath(
      pair.previous,
      pair.candidate,
      { ...policy, version: "0.8.2", build: 18 },
      pair.publicKey,
    ),
  ).toThrow("actual runtime identity change");
});

test("a higher build without a higher version, invalid signatures and unknown policy fields fail closed", () => {
  const pair = signedPair({ version: "0.8.1" });
  expect(() =>
    auditUpdatePath(
      pair.previous,
      pair.candidate,
      { kind: "code" },
      pair.publicKey,
    ),
  ).toThrow("Candidate version must exceed");
  const envelope = JSON.parse(newText);
  envelope.signature = Buffer.alloc(64).toString("base64");
  for (const [previous, candidate] of [
    [oldText, JSON.stringify(envelope)],
    [JSON.stringify(envelope), newText],
  ]) {
    expect(() =>
      auditUpdatePath(previous!, candidate!, { kind: "code" }),
    ).toThrow("Invalid update signature");
  }
  expect(() => auditUpdatePath(oldText, newText, { kind: "skip" })).toThrow();
  expect(() =>
    auditUpdatePath(oldText, newText, { kind: "code", force: true }),
  ).toThrow();
});
