import { resolve } from "node:path";
import { assert, config, readManifest } from "./config";
import { verifyCandidate } from "./candidate-manifest";
import { checksum } from "./verify";

export async function verifyPublicFiles(
  directory: string,
  phase: "staged" | "active" | "release",
) {
  const report = await verifyCandidate(directory);
  const manifest = readManifest(
    await Bun.file(resolve(directory, "latest.json")).text(),
  );
  const digest = (data: Uint8Array) =>
    new Bun.CryptoHasher("sha256").update(data).digest("hex");
  async function match(url: string, expected: string) {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
    assert(
      response.ok &&
        digest(new Uint8Array(await response.arrayBuffer())) === expected,
      "Public artifact mismatch: " + url,
    );
  }
  if (phase === "release") {
    for (const file of [
      ...report.files,
      {
        name: "candidate.report.json",
        sha256: await checksum(resolve(directory, "candidate.report.json")),
      },
    ])
      await match(
        `https://github.com/${config.repository}/releases/download/v${report.version}/${file.name}`,
        file.sha256,
      );
  } else {
    for (const file of manifest.files)
      await match(new URL(file.path, manifest.baseURL).href, file.sha256);
    if (phase === "active")
      await match(config.updatesURL, report.manifestSHA256);
    else {
      const response = await fetch(config.updatesURL, {
        cache: "no-store",
        signal: AbortSignal.timeout(60_000),
      });
      assert(response.ok, "Public feed unavailable");
      const actual = digest(new Uint8Array(await response.arrayBuffer()));
      assert(
        [report.baselineSHA256, report.manifestSHA256].includes(actual),
        "Staging changed the live feed or baseline advanced",
      );
    }
  }
}
if (import.meta.main) {
  const [directory, phase] = process.argv.slice(2);
  assert(
    directory && ["staged", "active", "release"].includes(phase!),
    "Usage: verify-public.ts <candidate> staged|active|release",
  );
  // Bounded CDN propagation retries; no mutation and no fallback to a different candidate.
  for (let attempt = 0; ; attempt++) {
    try {
      await verifyPublicFiles(
        resolve(directory),
        phase as "staged" | "active" | "release",
      );
      break;
    } catch (error) {
      if (attempt === 11) throw error;
      await Bun.sleep(5000);
    }
  }
  console.log(`Anonymous ${phase} verification passed`);
}
