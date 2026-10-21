import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { sharedDependencyRequests, verifyIntegrity, type RegistryManifest } from "./lib.ts";

test("rejects modified archive bytes before consumption", () => {
  const original = Buffer.from("verified archive");
  const integrity = `sha512-${createHash("sha512").update(original).digest("base64")}`;
  expect(() => verifyIntegrity(original, integrity)).not.toThrow();
  expect(() => verifyIntegrity(Buffer.from("modified archive"), integrity)).toThrow("mismatch");
  expect(() => verifyIntegrity(original, "sha1-deadbeef")).toThrow("SHA-512");
});

test("required peers join the closure and mismatched DSH releases fail", () => {
  const manifest: RegistryManifest = {
    name: "@deepseek-ai/dsh-agent-loop",
    version: "0.2.1-rc.2",
    dist: { tarball: "", integrity: "" },
    dependencies: { "@deepseek-ai/dsh-brand": "0.2.1-rc.2" },
    peerDependencies: {
      "@deepseek-ai/cordis": "~4.0.5",
      "@deepseek-ai/dsh-session": "0.2.1-rc.2",
      "@deepseek-ai/cordis-plugin-loader": "~1.0.6",
    },
    peerDependenciesMeta: { "@deepseek-ai/cordis-plugin-loader": { optional: true } },
  };
  expect(sharedDependencyRequests(manifest)).toEqual([
    "@deepseek-ai/cordis",
    "@deepseek-ai/dsh-brand",
    "@deepseek-ai/dsh-session",
  ]);
  manifest.peerDependencies!["@deepseek-ai/dsh-session"] = "0.2.0-rc.2";
  expect(() => sharedDependencyRequests(manifest)).toThrow("differs from reviewed");
});
