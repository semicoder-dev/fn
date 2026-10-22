import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GenerationManager } from "../packages/runtime/src/generations";
import type { GenerationPhase } from "../packages/runtime/src/generation-progress";

// Use an already extracted seed, so initial unpacking is outside the measured interval.
const input = process.argv[2];
if (!input || process.argv.length !== 3) throw new Error("Usage: bun scripts/benchmark-install.ts <extracted-seed-directory>");
const seedDirectory = resolve(input);
const seed = JSON.parse(await readFile(join(seedDirectory, "seed.json"), "utf8"));
const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../tests/fixtures/cordis-market-0.1.0");
const index = JSON.parse(await readFile(join(fixtures, "index.json"), "utf8"));
const dataDirectory = await mkdtemp(join(tmpdir(), "fn-install-benchmark-"));
let phase: GenerationPhase | undefined, last = 0;
let timings: Partial<Record<GenerationPhase, number>> = {};
function finishPhase(now: number) { if (phase) timings[phase] = Math.round(now - last); }
const manager = new GenerationManager({
  dataDirectory, seedDirectory, busy: () => false, restart: () => {},
  progress(next) {
    const now = performance.now();
    finishPhase(now);
    phase = next; last = now;
  },
});
try {
  await manager.initialize();
  const samples = [];
  for (const entry of index.applications) {
    phase = undefined; timings = {};
    const start = performance.now();
    await manager.stageInstall(join(fixtures, `${entry.id}-${entry.version}.tgz`), { expected: entry });
    finishPhase(performance.now());
    samples.push({ id: entry.id, totalMs: Math.round(performance.now() - start), phasesMs: timings });
    await manager.activateWhenIdle(); await manager.initialize(); await manager.confirmActivation();
  }
  console.log(JSON.stringify({ seedId: seed.id, platform: process.platform, bun: Bun.version,
    scope: "Offline stageInstall; excludes initial seed, market/network, FIA restart and frontend reconnect; OS caches unchanged",
    samples }, null, 2));
} finally { await rm(dataDirectory, { recursive: true, force: true }); }
