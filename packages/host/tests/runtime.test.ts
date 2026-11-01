import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { ApplicationPlatform, type SocketData } from "../src/index.ts";
import { readSSE } from "@semicoder/fn-sdk/sse";
const root = resolve(import.meta.dir, "../../..");
async function archive(id: string, version = "0.1.0") {
  const manifest = {
    manifestVersion: 1,
    id,
    version,
    hostApi: 2,
    name: "Runtime test",
    entries: { backend: "src/backend.ts" },
    locales: { default: "en", messages: { en: "locales/en.json" } },
    uses: ["application.summary"],
    contributes: { summary: {} },
  };
  const source = `import {defineBackend} from ${JSON.stringify(join(root, "packages/sdk/src/backend.ts"))};import {defineContract,method,stream,z} from ${JSON.stringify(join(root, "packages/sdk/src/contract.ts"))};export default defineBackend({api:defineContract({echo:method({input:z.string(),output:z.string()}),wait:stream({input:z.object({}),chunk:z.number()})}),async setup({host}){await host.application.setSummary({version:1,text:"Started"});return {handlers:{echo:async(v)=>{await host.application.setSummary({version:1,text:v});await host.application.notifyDataChanged();return v;},wait:async function*(_,ctx){try{for(let i=0;i<100;i++){ctx.signal.throwIfAborted();yield i;await Bun.sleep(10);}}finally{await Bun.write(host.paths.data+"/cancelled","yes");}}},stop:()=>Bun.write(host.paths.data+"/stopped","yes")};}});`;
  return new Bun.Archive(
    {
      "fn.app.json": JSON.stringify(manifest),
      "fn-build.json": JSON.stringify({
        format: 1,
        manifest,
        backend: "src/backend.ts",
      }),
      "src/backend.ts": source,
      "locales/en.json": "{}",
    },
    { compress: "gzip" },
  ).bytes();
}
test("real Bun apps isolate runs, reject stale views, cancel view streams, and preserve other apps during crashes", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "fn-runtime-"));
  const processes = new Map<string, Bun.Subprocess>(),
    listeners = new Map<string, Set<(value: any) => void>>();
  let spawned = 0;
  let platform: ApplicationPlatform;
  const native: any = {
    on: (name: string, fn: any) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(fn);
      return () => listeners.get(name)!.delete(fn);
    },
    statusItem: { setMenu: async () => {} },
    application: { setAppearance: async () => {} },
    windows: {
      create: async () => {},
      open: async () => {},
      close: async () => {},
      update: async () => {},
      minimize: async () => {},
      maximize: async () => {},
    },
    processes: {
      spawn: async (input: any) => {
        spawned++;
        const child = Bun.spawn([input.executable, ...input.arguments], {
          cwd: input.directory,
          env: input.environment,
          stdout: "ignore",
          stderr: "inherit",
        });
        processes.set(input.id, child);
        void child.exited.then(() => {
          for (const callback of listeners.get("processes.exited") ?? [])
            callback({ id: input.id });
        });
        return { id: input.id, pid: child.pid };
      },
      stop: async ({ id }: any) => {
        const child = processes.get(id);
        if (child) {
          child.kill();
          await child.exited;
          processes.delete(id);
        }
      },
    },
  };
  const server = Bun.serve<SocketData>({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request, server) {
      const url = new URL(request.url);
      url.pathname = url.pathname.replace(/^\/api/, "");
      Object.defineProperty(request, "url", {
        value: url.href,
        configurable: true,
      });
      return platform.fetch(request, server);
    },
    websocket: {
      open: (s) => platform.websocket.open(s),
      message: (s, m) => platform.websocket.message(s, m),
      close: (s) => platform.websocket.close(s),
    },
  });
  const context: any = {
    app: { dataDirectory: temporary, codeDirectory: root, mode: "development" },
    url: (path = "/") => new URL(path, server.url),
    browserURL: (path: string) => new URL(path, server.url).href,
    native,
  };
  platform = new ApplicationPlatform(context);
  const request = async (path: string, body?: unknown, token?: string) => {
    const response = await fetch(new URL("/api/fn/v1" + path, server.url), {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { "x-fn-view": token } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { response, value: await response.json() };
  };
  try {
    await platform.start();
    for (const id of ["test-one", "test-two"]) {
      const file = join(temporary, id + ".fn.tgz");
      await Bun.write(file, await archive(id));
      await platform.command("install-local", { path: file });
    }
    await Promise.all([
      platform.open("test-one", true),
      platform.open("test-one", true),
    ]);
    expect(spawned).toBe(1);
    await platform.open("test-two", true);
    expect(spawned).toBe(2);
    const old = platform.runs.get("test-one")!.id;
    const view = (
      await request("/views", { instanceId: "test-one", runId: old })
    ).value;
    const socket = new WebSocket(
      new URL("/api/fn/v1/events?view=" + view.token, server.url).href.replace(
        "http:",
        "ws:",
      ),
    );
    await new Promise<void>((res, rej) => {
      socket.onopen = () => res();
      socket.onerror = rej;
    });
    const notifications: string[] = [];
    socket.onmessage = (event) =>
      notifications.push(JSON.parse(event.data).type);
    expect(
      (await request("/apps/methods/echo", "real process", view.token)).value,
    ).toBe("real process");
    expect(
      (await platform.snapshot()).applications.find(
        (a) => a.instanceId === "test-one",
      )?.summary?.snapshot.text,
    ).toBe("real process");
    for (let i = 0; i < 30 && !notifications.includes("dataChanged"); i++)
      await Bun.sleep(10);
    expect(notifications).toContain("dataChanged");
    expect(
      (await request("/platform/state", {}, view.token)).response.status,
    ).toBe(403);
    await request("/apps/dirty", { dirty: true }, view.token);
    await expect(platform.close("test-one")).rejects.toMatchObject({
      code: "busy",
    });
    await request("/apps/dirty", { dirty: false }, view.token);
    const stream = await fetch(
      new URL("/api/fn/v1/apps/methods/wait", server.url),
      {
        method: "POST",
        headers: {
          "x-fn-view": view.token,
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: "{}",
      },
    );
    const events = readSSE(stream);
    expect((await events.next()).value?.data).toBe(0);
    socket.close();
    await events.return(undefined);
    const cancelled = join(temporary, "platform/data/test-one/cancelled");
    for (let i = 0; i < 100 && !(await Bun.file(cancelled).exists()); i++)
      await Bun.sleep(10);
    expect(await Bun.file(cancelled).text()).toBe("yes");
    expect(platform.runs.has("test-one")).toBe(true);
    const otherRun = platform.runs.get("test-two")!.id;
    const replacement = join(temporary, "update.fn.tgz");
    await Bun.write(replacement, await archive("test-one", "0.1.1"));
    const prepared = await platform.command("install-local", {
      path: replacement,
    });
    expect(prepared.confirmationId).toBeString();
    expect(platform.runs.get("test-one")!.id).toBe(old);
    expect(
      platform.store.document.installations.find(
        (i) => i.instanceId === "test-one",
      )!.build.manifest.version,
    ).toBe("0.1.0");
    await Bun.write(replacement, "changed after validation");
    await platform.command("install-confirm", {
      confirmationId: prepared.confirmationId,
    });
    await expect(
      platform.command("install-confirm", {
        confirmationId: prepared.confirmationId,
      }),
    ).rejects.toMatchObject({ code: "stale" });
    expect(
      platform.store.document.installations.find(
        (i) => i.instanceId === "test-one",
      )!.build.manifest.version,
    ).toBe("0.1.1");
    expect(platform.runs.get("test-two")!.id).toBe(otherRun);
    expect(platform.runs.has("test-two")).toBe(true);
    expect(
      await Bun.file(join(temporary, "platform/data/test-one/stopped")).text(),
    ).toBe("yes");
    await platform.open("test-one", true);
    expect(platform.runs.get("test-one")!.id).not.toBe(old);
    expect(
      (await request("/views", { instanceId: "test-one", runId: old })).value
        .code,
    ).toBe("stale");
    expect(
      (await request("/apps/methods/echo", "stale", view.token)).response
        .status,
    ).toBe(401);
    const crash = platform.runs.get("test-one")!.id;
    processes.get(crash)!.kill("SIGKILL");
    for (let i = 0; i < 100 && platform.runs.has("test-one"); i++)
      await Bun.sleep(10);
    expect(platform.runs.has("test-one")).toBe(false);
    expect(platform.runs.has("test-two")).toBe(true);
    expect(
      (await platform.snapshot()).applications.find(
        (a) => a.instanceId === "test-one",
      )!.state,
    ).toBe("failed");
  } finally {
    await platform.stop().catch(() => {});
    for (const child of processes.values()) {
      child.kill();
      await child.exited;
    }
    await server.stop(true);
    await rm(temporary, { recursive: true, force: true });
  }
  expect(processes.size).toBe(0);
}, 15000);
