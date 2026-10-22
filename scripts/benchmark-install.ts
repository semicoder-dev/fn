import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GenerationManager } from "../packages/host/src/generations";
import type { GenerationPhase } from "../packages/host/src/generation-progress";

// Use an already extracted seed, so initial unpacking is outside the measured interval.
const input = process.argv[2];
if (!input || process.argv.length < 4)
  throw new Error(
    "Usage: bun scripts/benchmark-install.ts <extracted-seed-directory> <fixture.tgz>...",
  );
const seedDirectory = resolve(input);
const seed = JSON.parse(await readFile(join(seedDirectory, "seed.json"), "utf8"));
const fixtures = process.argv.slice(3).map((path) => resolve(path));
const dataDirectory = await mkdtemp(join(tmpdir(), "fn-install-benchmark-"));
let phase: GenerationPhase | undefined,
  last = 0;
let timings: Partial<Record<GenerationPhase, number>> = {};
function finishPhase(now: number) {
  if (phase) timings[phase] = Math.round(now - last);
}
const manager = new GenerationManager({
  dataDirectory,
  seedDirectory,
  busy: () => false,
  restart: () => {},
  progress(next) {
    const now = performance.now();
    finishPhase(now);
    phase = next;
    last = now;
  },
});
try {
  await manager.initialize();
  const samples = [];
  for (const archive of fixtures) {
    phase = undefined;
    timings = {};
    const start = performance.now();
    await manager.stageInstall(archive);
    finishPhase(performance.now());
    samples.push({ archive, totalMs: Math.round(performance.now() - start), phasesMs: timings });
    await manager.activateWhenIdle();
    await manager.initialize();
    await manager.confirmActivation();
  }
  console.log(
    JSON.stringify(
      {
        seedId: seed.id,
        platform: process.platform,
        bun: Bun.version,
        scope:
          "Offline stageInstall; excludes initial seed, market/network, FIA restart and frontend reconnect; OS caches unchanged",
        samples,
      },
      null,
      2,
    ),
  );
} finally {
  await rm(dataDirectory, { recursive: true, force: true });
}
