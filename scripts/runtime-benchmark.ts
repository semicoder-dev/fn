import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { cpus, release, tmpdir, totalmem } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GenerationManager } from "../packages/runtime/src/generations.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
interface Sample {
  moduleImportMs: number;
  runtimeOpenMs: number;
  workerReadyMs: number;
  firstMockTurnDurableMs: number;
  idleRssMiB: number;
  requests: number;
}
if (process.argv[2] === "--worker") {
  const started = performance.now();
  const [entry, dataDirectory] = process.argv.slice(3) as [string, string];
  const module = await import(entry);
  const imported = performance.now();
  const host = await module.FnRuntime.open({ dataDirectory });
  const opened = performance.now();
  process.env.NO_PROXY = "localhost,127.0.0.1";
  let requests = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1", port: 0,
    fetch() {
      requests++;
      const chunks = [{ content: "mock task completed" }, {}].map((delta, index) => "data: " + JSON.stringify({
        id: "benchmark", object: "chat.completion.chunk", created: 0, model: "mock",
        choices: [{ index: 0, delta, finish_reason: index ? "stop" : null }],
      }));
      return new Response([...chunks, "data: [DONE]", ""].join("\n\n"),
        { headers: { "content-type": "text/event-stream" } });
    },
  });
  try {
    await host.load({
      manifest: { id: "benchmark", name: "Benchmark", packageName: "@fn/benchmark", version: "0.0.0" },
      plugin() {},
    });
    const connection = await host.connections.create({
      name: "Local mock", provider: "benchmark", auth: "api-key",
      profile: { api: "openai-completions", baseURL: server.url.href,
        models: [{ id: "mock", contextWindow: 4096, maxTokens: 128 }] },
    });
    await host.connections.setApiKey(connection.id, "fixture-not-a-secret");
    const session = await host.createSession({
      appId: "benchmark", connectionId: connection.id, modelId: "mock", policy: "automatic",
    });
    const taskStarted = performance.now();
    await host.send(session.id, "Complete the benchmark task", "benchmark-first-task");
    await (await host.agent(session.id)).whenIdle();
    await host.ctx.sessionPersistence.flush();
    const taskFinished = performance.now();
    const rss: number[] = [];
    // Natural idle sampling: no forced GC and no active agent work.
    for (let i = 0; i < 3; i++) {
      await Bun.sleep(250);
      rss.push(process.memoryUsage().rss / 1024 / 1024);
    }
    const sample: Sample = {
      moduleImportMs: imported - started, runtimeOpenMs: opened - imported,
      workerReadyMs: opened - started, firstMockTurnDurableMs: taskFinished - taskStarted,
      idleRssMiB: rss.reduce((sum, value) => sum + value, 0) / rss.length, requests,
    };
    if (requests !== 1) throw new Error(`Unexpected mock request count: ${requests}`);
    console.log(JSON.stringify(sample));
  } finally {
    await host.close();
    await server.stop(true);
  }
} else {
  const samples = Number(process.argv.find(arg => arg.startsWith("--samples="))?.split("=")[1] ?? 7);
  if (!Number.isSafeInteger(samples) || samples < 3 || samples > 30) throw new Error("Use 3–30 samples");
  const output = process.argv.find(arg => arg.startsWith("--output="))?.slice("--output=".length);
  const temporary = await mkdtemp(join(tmpdir(), "fn-runtime-benchmark-"));
  try {
    const seedDirectory = join(root, "resources/runtime-seed");
    const seed = JSON.parse(await readFile(join(seedDirectory, "seed.json"), "utf8"));
    const manager = new GenerationManager({
      dataDirectory: join(temporary, "generation-data"), seedDirectory,
      busy: () => false, restart: () => {},
    });
    // Installation/copy time is intentionally excluded from startup samples.
    const generation = await manager.initialize();
    const results: Sample[] = [];
    for (let i = 0; i < samples; i++) {
      const dataDirectory = join(temporary, `state-${i}`);
      await mkdir(dataDirectory);
      const child = Bun.spawn([process.execPath, "--no-env-file", "--no-install", "--no-macros",
        fileURLToPath(import.meta.url), "--worker", generation.runtimeEntry, dataDirectory], {
        cwd: temporary, stdout: "pipe", stderr: "pipe",
      });
      const [stdout, stderr, code] = await Promise.all([
        new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
      ]);
      if (code) throw new Error(`Benchmark worker failed: ${stderr || stdout}`);
      const sample = JSON.parse(stdout.trim()) as Sample;
      results.push(sample);
      console.error(`sample ${i + 1}/${samples}: open ${sample.workerReadyMs.toFixed(1)} ms; mock ${sample.firstMockTurnDurableMs.toFixed(1)} ms; RSS ${sample.idleRssMiB.toFixed(1)} MiB`);
    }
    const stats = (key: keyof Omit<Sample, "requests">) => {
      const values = results.map(sample => sample[key]).sort((a, b) => a - b);
      return { min: values[0], median: values[Math.floor(values.length / 2)],
        p95: values[Math.min(values.length - 1, Math.ceil(values.length * 0.95) - 1)], max: values.at(-1) };
    };
    const result = {
      measuredAt: new Date().toISOString(), bun: Bun.version, platform: process.platform, arch: process.arch,
      osRelease: release(), cpu: cpus()[0]?.model, logicalCpus: cpus().length,
      memoryGiB: Math.round(totalmem() / 1024 ** 3), seedId: seed.id, samples,
      methodology: "Fresh Bun process and empty state databases per sample; already materialized generation; OS filesystem cache uncontrolled; worker timing starts before dynamic runtime import; mock localhost SSE, one assistant response, SQLite flush included; idle RSS mean at 250/500/750 ms; no forced GC.",
      summary: Object.fromEntries((["moduleImportMs", "runtimeOpenMs", "workerReadyMs",
        "firstMockTurnDurableMs", "idleRssMiB"] as const).map(key => [key, stats(key)])),
      results,
    };
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (output) await writeFile(resolve(output), text);
    console.log(text);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
