import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { cpus, release, tmpdir, totalmem } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { agentFetch } from "../framework/fia/packages/cli/src/agent-cli.ts";
import { createAPIClient, readResult } from "../framework/fia/packages/cli/src/api-client.ts";
import type { AgentRecord } from "../framework/fia/packages/cli/src/agent-server.ts";
import { readInspection, waitUntil } from "../framework/fia/packages/cli/src/smoke.ts";
import type api from "../shared/runtime-api.ts";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const MOCK_REPLY = "Local application benchmark completed.";
const LOOPBACK = "localhost,127.0.0.1,::1";
type Client = ReturnType<typeof createAPIClient<typeof api>>;
interface Projection {
  items: { kind: string; text: string }[];
  asOfSeq: number;
  hasMore: boolean;
}
interface MemorySample {
  elapsedSinceReadyMs: number;
  hostRssMiB: number;
  bunRssMiB: number;
}
interface LaunchSample {
  backendReadyMs: number;
  mainUiReadyMs: number;
  firstMockTurnDurableMs: number;
  projectionReads: number;
  mockRequests: number;
  hostRssMiB: number;
  bunRssMiB: number;
  hostAndBunRssMiB: number;
  memorySamples: MemorySample[];
  durableSessionRecovered: boolean | null;
  ordinaryQuitMs: number;
}

async function memory(host: number, bun: number) {
  const child = Bun.spawn(["/bin/ps", "-p", `${host},${bun}`, "-o", "pid=,ppid=,rss=,comm="], {
    stdout: "pipe", stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ]);
  if (code) throw new Error(`Process memory inspection failed: ${stderr}`);
  const rows = stdout.trim().split("\n").map(line => {
    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/.exec(line);
    if (!match) throw new Error("Invalid ps memory output");
    return { pid: Number(match[1]), parent: Number(match[2]), rss: Number(match[3]), command: match[4]! };
  });
  const hostRow = rows.find(row => row.pid === host), bunRow = rows.find(row => row.pid === bun);
  if (!hostRow?.command.endsWith("/FIAHost") || !bunRow?.command.endsWith("/bun") || bunRow.parent !== host)
    throw new Error("Inspection PIDs do not identify the spawned FIAHost and its Bun child");
  return { hostRssMiB: hostRow.rss / 1024, bunRssMiB: bunRow.rss / 1024 };
}

async function projection(client: Client, sessionId: string) {
  return await client.call("sessions.projection", { id: sessionId, offset: 0, limit: 100 }) as unknown as Projection;
}
function hasReply(value: Projection) {
  return value.items.some(item => item.kind === "assistant" && item.text === MOCK_REPLY);
}

async function launch(options: {
  app: string;
  root: string;
  control: string;
  data: string;
  identifier: string;
  runtimeId: string;
  seedId: string;
  previousSession?: string;
}): Promise<{ sample: LaunchSample; sessionId: string }> {
  await mkdir(options.control, { recursive: true });
  await mkdir(options.data, { recursive: true });
  const executable = join(options.app, "Contents/MacOS/FIAHost");
  const started = performance.now();
  const child = Bun.spawn([executable], {
    cwd: options.root,
    env: {
      PATH: "/usr/bin:/bin", TMPDIR: options.root,
      FIA_CONTROL_DIRECTORY: options.control, FIA_DATA_DIRECTORY: options.data,
      NO_PROXY: LOOPBACK, no_proxy: LOOPBACK,
      // Do not inherit provider credentials or the developer's proxy into Bun.
      HTTP_PROXY: "", HTTPS_PROXY: "", ALL_PROXY: "", http_proxy: "", https_proxy: "", all_proxy: "",
    },
    stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  let log = "";
  let record: AgentRecord | undefined;
  let client: Client | undefined;
  let mock: ReturnType<typeof Bun.serve> | undefined;
  let bunPid: number | undefined;
  let cleaned = false;
  const drain = async (stream: ReadableStream<Uint8Array>) => {
    for await (const chunk of stream) log = (log + new TextDecoder().decode(chunk)).slice(-32_768);
  };
  const drains = [drain(child.stdout), drain(child.stderr)];
  const stopped = async () => child.exitCode === null ? undefined : child.exitCode;
  const groupStopped = async () => {
    if (bunPid === undefined) return true;
    try { process.kill(-bunPid, 0); return undefined; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ESRCH") return true;
      throw error;
    }
  };
  try {
    let backendReadyMs: number | undefined;
    const ready = await waitUntil(async () => {
      if (child.exitCode !== null) throw new Error(`Packaged application exited before readiness (${child.exitCode})`);
      const state = await readInspection(options.control);
      if (!state) return;
      if (state.pid !== child.pid) throw new Error("Control directory belongs to a different Host");
      if (state.backend === "failed") throw new Error("Packaged backend failed");
      if (state.backend === "ready") backendReadyMs ??= performance.now() - started;
      return state.lifecycle === "running" && state.backend === "ready" &&
        Array.isArray(state.frontendsReady) && state.frontendsReady.includes("main") ? state : undefined;
    }, 120_000, "Packaged application backend/main UI readiness");
    const mainUiReadyMs = performance.now() - started;
    if (!Array.isArray(ready.processGroups) || ready.processGroups.length !== 1 ||
      !Number.isSafeInteger(ready.processGroups[0]) || ready.processGroups[0] <= 1)
      throw new Error("Expected exactly one managed Bun process");
    bunPid = ready.processGroups[0] as number;
    record = JSON.parse(await readFile(join(options.data, options.identifier, "Agent/instance.json"), "utf8")) as AgentRecord;
    if (record.hostPID !== child.pid || record.identifier !== options.identifier ||
      record.bundlePath !== options.app || record.runtimeId !== options.runtimeId || record.phase !== "ready")
      throw new Error("Private agent discovery does not match the spawned application");
    const send = agentFetch(record);
    const handshake = await readResult(await send("/handshake", { signal: AbortSignal.timeout(5000) })) as AgentRecord;
    if (handshake.hostPID !== child.pid || handshake.generation !== record.generation ||
      handshake.runtimeId !== options.runtimeId) throw new Error("Agent handshake mismatch");
    client = createAPIClient<typeof api>(send);
    const status = await client.call("runtime.status", {});
    if (status.seedId !== options.seedId || status.generation.error)
      throw new Error("Application did not activate the packaged runtime seed");
    const expectedData = await realpath(join(options.data, options.identifier, "Backend/cordis-v1"));
    if (await realpath(status.dataDirectory) !== expectedData) throw new Error("Backend data directory escaped benchmark isolation");
    const durableSessionRecovered = options.previousSession
      ? hasReply(await projection(client, options.previousSession)) : null;
    if (durableSessionRecovered === false) throw new Error("Restart lost the persisted mock reply");
    const memorySamples: MemorySample[] = [];
    for (let i = 0; i < 3; i++) {
      await Bun.sleep(250);
      memorySamples.push({ elapsedSinceReadyMs: performance.now() - started - mainUiReadyMs,
        ...await memory(child.pid, bunPid) });
    }
    let requests = 0;
    mock = Bun.serve({
      hostname: "127.0.0.1", port: 0,
      async fetch(request) {
        const url = new URL(request.url);
        if (request.method !== "POST" || url.pathname !== "/v1/chat/completions")
          return new Response("Unexpected mock route", { status: 404 });
        const input = await request.json() as { model?: string };
        if (input.model !== "mock") return new Response("Unexpected model", { status: 400 });
        requests++;
        const chunks = [{ role: "assistant", content: MOCK_REPLY }, {}].map((delta, index) =>
          "data: " + JSON.stringify({
            id: "local-benchmark", object: "chat.completion.chunk", created: 0, model: "mock",
            choices: [{ index: 0, delta, finish_reason: index ? "stop" : null }],
          }));
        return new Response([...chunks, "data: [DONE]", ""].join("\n\n"),
          { headers: { "content-type": "text/event-stream" } });
      },
    });
    const connection = await client.call("connections.create", {
      name: "Isolated local benchmark", provider: "benchmark", auth: "api-key",
      profile: { api: "openai-completions", baseURL: `${mock.url.href}v1`,
        models: [{ id: "mock", name: "Local mock", contextWindow: 4096, maxTokens: 128, input: ["text"] }] },
    });
    await client.call("connections.setKey", { id: connection.id, key: "local-benchmark-fixture" });
    const session = await client.call("sessions.create", {
      appId: "fn-chat", endpointId: "chat", connectionId: connection.id, modelId: "mock", policy: "controlled",
    });
    const taskStarted = performance.now();
    await client.call("sessions.send", { id: session.id, text: "Reply with the benchmark completion text.", requestId: crypto.randomUUID() });
    let projectionReads = 0;
    const deadline = performance.now() + 15_000;
    while (true) {
      const page = await projection(client, session.id);
      projectionReads++;
      if (hasReply(page)) break;
      if (performance.now() >= deadline) throw new Error("Durable assistant projection timed out");
      await Bun.sleep(5);
    }
    const firstMockTurnDurableMs = performance.now() - taskStarted;
    // Projection reads flush the live Session before reading SQLite. Also wait
    // for the agent's final lifecycle bookkeeping before ordinary shutdown.
    await waitUntil(async () => !(await client!.call("runtime.status", {})).busy ? true : undefined,
      10_000, "Mock task idle");
    if (requests !== 1) throw new Error(`Expected one local mock request, got ${requests}`);
    client.close();
    client = undefined;
    await mock.stop(true);
    mock = undefined;
    const quitStarted = performance.now();
    await writeFile(join(options.control, "quit"), "");
    const exitCode = await waitUntil(stopped, 20_000, "Benchmark application ordinary quit");
    const ordinaryQuitMs = performance.now() - quitStarted;
    if (exitCode !== 0) throw new Error(`Benchmark application quit with ${exitCode}`);
    await waitUntil(groupStopped, 5000, "Owned Bun process group cleanup");
    await Promise.all(drains);
    cleaned = true;
    const mean = (key: "hostRssMiB" | "bunRssMiB") =>
      memorySamples.reduce((sum, value) => sum + value[key], 0) / memorySamples.length;
    return { sessionId: session.id, sample: {
      backendReadyMs: backendReadyMs!, mainUiReadyMs, firstMockTurnDurableMs, projectionReads,
      mockRequests: requests, hostRssMiB: mean("hostRssMiB"), bunRssMiB: mean("bunRssMiB"),
      hostAndBunRssMiB: mean("hostRssMiB") + mean("bunRssMiB"), memorySamples,
      durableSessionRecovered, ordinaryQuitMs,
    } };
  } catch (error) {
    // The record/token never enter output; logs contain only isolated fixture data.
    const safeLog = record ? log.replaceAll(record.token, "[redacted]") : log;
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n${safeLog.slice(-4000)}`);
  } finally {
    client?.close();
    await mock?.stop(true);
    if (child.exitCode === null) {
      await writeFile(join(options.control, "quit"), "").catch(() => {});
      try { await waitUntil(stopped, 5000, "Benchmark cleanup"); }
      catch { child.kill("SIGKILL"); await child.exited; }
    }
    await Promise.all(drains);
    if (!cleaned) await waitUntil(groupStopped, 5000, "Owned child cleanup");
  }
}

async function main() {
  if (process.platform !== "darwin") throw new Error("The packaged FIA application benchmark requires macOS");
  const option = (name: string) => process.argv.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const samples = Number(option("samples") ?? 3);
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 10) throw new Error("Use --samples=1..10");
  const app = await realpath(resolve(option("app") ?? join(projectRoot, "dist/fn.app")));
  const output = option("output");
  const manifest = JSON.parse(await readFile(join(app, "Contents/Resources/fia.runtime.json"), "utf8"));
  if (manifest.schema !== 4 || manifest.localProfile || !manifest.app?.identifier || !manifest.runtimeId)
    throw new Error("Use a fully built production application, not a Dev/Preview profile");
  const seed = JSON.parse(await readFile(join(app, "Contents/Resources/runtime/resources/runtime-seed.json"), "utf8"));
  const codeManifest = await readFile(join(app, "Contents/Resources/code/manifest.json"));
  const root = await mkdtemp(join(tmpdir(), "fn-application-benchmark-"));
  const originalNoProxy = process.env.NO_PROXY, originalLowerNoProxy = process.env.no_proxy;
  process.env.NO_PROXY = process.env.no_proxy = LOOPBACK;
  try {
    const results: { sample: number; fresh: LaunchSample; restart: LaunchSample }[] = [];
    for (let i = 0; i < samples; i++) {
      const pair = join(root, `sample-${i + 1}`), data = join(pair, "data");
      await mkdir(pair);
      const base = { app, root: pair, data, identifier: manifest.app.identifier as string,
        runtimeId: manifest.runtimeId as string, seedId: seed.id as string };
      const fresh = await launch({ ...base, control: join(pair, "control-fresh") });
      const restart = await launch({ ...base, control: join(pair, "control-restart"), previousSession: fresh.sessionId });
      results.push({ sample: i + 1, fresh: fresh.sample, restart: restart.sample });
      console.error(`sample ${i + 1}/${samples}: fresh UI ${fresh.sample.mainUiReadyMs.toFixed(0)} ms; restart UI ${restart.sample.mainUiReadyMs.toFixed(0)} ms; mock ${fresh.sample.firstMockTurnDurableMs.toFixed(1)}/${restart.sample.firstMockTurnDurableMs.toFixed(1)} ms`);
    }
    const metrics = ["backendReadyMs", "mainUiReadyMs", "firstMockTurnDurableMs", "hostRssMiB", "bunRssMiB", "hostAndBunRssMiB"] as const;
    const summary = Object.fromEntries((["fresh", "restart"] as const).map(phase => [phase,
      Object.fromEntries(metrics.map(metric => {
        const values = results.map(result => result[phase][metric]).sort((a, b) => a - b);
        return [metric, { min: values[0], median: values[Math.floor(values.length / 2)],
          max: values.at(-1), p95: values[Math.min(values.length - 1, Math.ceil(values.length * 0.95) - 1)] }];
      })),
    ]));
    const report = {
      schemaVersion: 1, measuredAt: new Date().toISOString(), application: "dist/fn.app",
      appVersion: manifest.app.version, appBuild: manifest.app.build, runtimeId: manifest.runtimeId,
      codeManifestSha256: createHash("sha256").update(codeManifest).digest("hex"),
      seedId: seed.id, seedArchiveSha256: seed.sha256, bundledBun: seed.bunVersion, driverBun: Bun.version,
      platform: process.platform, arch: process.arch, osRelease: release(), cpu: cpus()[0]?.model,
      logicalCpus: cpus().length, memoryGiB: Math.round(totalmem() / 1024 ** 3), samples,
      methodology: {
        startup: "Directly spawn packaged FIAHost. Each fresh sample has an empty isolated data directory and includes seed verification, extraction and generation copying; restart reuses that sample's data and verifies the prior durable reply. Timing begins before spawn and ends at Host inspection reporting backend ready or main frontend ready. Host inspection and driver polling each have 100 ms intervals. OS filesystem cache is uncontrolled; this is process-cold, not disk-cold.",
        task: "Private Agent UDS API creates one local mock connection and session before timing. Timed send through the actual Pi adapter/dsh loop to an assistant item read from the persisted SQLite projection. Polling is every 5 ms and projection reads flush the live session. One localhost SSE reply, no real model, internet inference, OAuth or tool execution.",
        memory: "Mean of three ps RSS observations about 250/500/750 ms after UI readiness, before task setup. Only the directly spawned FIAHost and its verified Bun child are included. WebKit WebContent/GPU/Networking, other XPC services and the benchmark driver/mock server are excluded. RSS sums may double-count shared pages and are not application physical footprint.",
        isolation: "Fresh temporary FIA_CONTROL_DIRECTORY and FIA_DATA_DIRECTORY; no production data or provider credentials inherited; only the launched Host is asked to quit. All owned Bun process groups must exit. Temporary state is removed after verification.",
        limitations: "No interactive UI latency or real provider measurement. No Node/old-fn baseline. At small sample counts nearest-rank p95 is simply the maximum. Packaged automatic application update configuration is unchanged.",
      },
      summary, results,
    };
    const json = `${JSON.stringify(report, null, 2)}\n`;
    if (output) await writeFile(resolve(output), json);
    console.log(json);
  } finally {
    if (originalNoProxy === undefined) delete process.env.NO_PROXY; else process.env.NO_PROXY = originalNoProxy;
    if (originalLowerNoProxy === undefined) delete process.env.no_proxy; else process.env.no_proxy = originalLowerNoProxy;
    await rm(root, { recursive: true, force: true });
  }
}

if (import.meta.main) await main();
