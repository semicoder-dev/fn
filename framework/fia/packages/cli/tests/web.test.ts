import { test, expect } from "bun:test";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildWeb, startWebDevelopment } from "../src/web.ts";
test("Bun builds shared CSS Modules with the same development and production pipeline", async () => {
  const root = await mkdtemp(join(tmpdir(), "fia-web-"));
  let dev: Awaited<ReturnType<typeof startWebDevelopment>> | undefined;
  try {
    await mkdir(join(root, "src"));
    await Bun.write(
      join(root, "src/index.html"),
      '<head></head><body><script type="module" src="./main.ts"></script></body>',
    );
    await Bun.write(
      join(root, "src/main.ts"),
      'import style from "./shared.module.css";import {other} from "./other.ts";document.body.className=style.box;document.body.textContent=other;',
    );
    await Bun.write(
      join(root, "src/other.ts"),
      'import style from "./shared.module.css";export const other=style.box;',
    );
    await Bun.write(
      join(root, "src/shared.module.css"),
      ".box{color:rgb(1,2,3)}",
    );
    const options = {
      root: join(root, "src"),
      dist: join(root, "dist"),
      projectRoot: root,
      port: 0,
      endpointFile: join(root, "endpoint.json"),
    };
    await buildWeb(options);
    const html = await Bun.file(join(root, "dist/index.html")).text();
    expect(html).toContain("/_fia/browser/runtime.js");
    dev = await startWebDevelopment(options);
    const origin = dev.server.url;
    const first = await (
      await fetch(new URL("/__fia_dev_revision", origin))
    ).json();
    expect(first.error).toBeUndefined();
    await Bun.write(
      join(root, "src/shared.module.css"),
      ".box{color:rgb(4,5,6)}",
    );
    let next = first;
    for (let i = 0; i < 60 && next.revision === first.revision; i++) {
      await Bun.sleep(50);
      next = await (await fetch(new URL("/__fia_dev_revision", origin))).json();
    }
    expect(next.revision).toBeGreaterThan(first.revision);
    expect(next.error).toBeUndefined();
    const files = await Array.fromAsync(
      new Bun.Glob("*.css").scan(options.dist),
    );
    expect(
      (
        await Promise.all(
          files.map((f) => Bun.file(join(options.dist, f)).text()),
        )
      ).some((css) => css.includes("#040506") || css.includes("4, 5, 6")),
    ).toBe(true);
  } finally {
    await dev?.stop();
    await rm(root, { recursive: true, force: true });
  }
});

test("development forwards local HTTP, SSE and WebSocket without an environment proxy", async () => {
  const root = await mkdtemp(join(tmpdir(), "fia-web-proxy-"));
  let proxyRequests = 0;
  let streamCancelled = false;
  const backend = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    idleTimeout: 0,
    async fetch(request, server) {
      const path = new URL(request.url).pathname;
      if (path === "/api/socket" && server.upgrade(request)) return;
      if (path === "/api/events")
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("data: ready\n\n"));
            },
            cancel() {
              streamCancelled = true;
            },
          }),
          { headers: { "content-type": "text/event-stream" } },
        );
      if (path === "/_fia/bootstrap")
        return new Response(null, {
          status: 302,
          headers: {
            location: "/",
            "set-cookie": "test-session=ready; HttpOnly",
          },
        });
      return Response.json({
        path,
        body: await request.text(),
        cookie: request.headers.get("cookie"),
        origin: request.headers.get("origin"),
      });
    },
    websocket: {
      message(socket, message) {
        socket.send(message);
      },
    },
  });
  const proxy = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch() {
      proxyRequests++;
      return new Response("Unexpected proxy request", { status: 502 });
    },
  });
  let child: Bun.Subprocess<"ignore", "pipe", "pipe"> | undefined;
  try {
    await Bun.write(
      join(root, "src/index.html"),
      "<head></head><body>Test</body>",
    );
    await Bun.write(
      join(root, "endpoint.json"),
      JSON.stringify({ origin: backend.url.origin }),
    );
    const options = {
      root: join(root, "src"),
      dist: join(root, "dist"),
      projectRoot: root,
      port: 0,
      endpointFile: join(root, "endpoint.json"),
    };
    // A separate runtime reads the proxy environment without mutating other tests.
    child = Bun.spawn(
      [
        process.execPath,
        "-e",
        `
      import assert from "node:assert/strict";
      import {startWebDevelopment} from ${JSON.stringify(new URL("../src/web.ts", import.meta.url).href)};
      const dev = await startWebDevelopment(${JSON.stringify(options)});
      let socket;
      const abort = new AbortController();
      try {
        const base = dev.server.url;
        const bootstrap = await fetch(new URL("/_fia/bootstrap", base), {proxy: false, redirect: "manual"});
        assert.equal(bootstrap.status, 302);
        assert.equal(bootstrap.headers.get("location"), "/");
        assert.equal(bootstrap.headers.get("set-cookie"), "test-session=ready; HttpOnly");
        const json = await fetch(new URL("/api/echo", base), {proxy: false, method: "POST", headers: {cookie: "test-session=ready", origin: base.origin}, body: "input"});
        assert.deepEqual(await json.json(), {path: "/api/echo", body: "input", cookie: "test-session=ready", origin: base.origin});
        const events = await fetch(new URL("/api/events", base), {proxy: false, signal: abort.signal});
        assert.equal(events.headers.get("content-type"), "text/event-stream");
        const reader = events.body.getReader();
        assert.equal(new TextDecoder().decode((await reader.read()).value), "data: ready\\n\\n");
        abort.abort();
        socket = new WebSocket(new URL("/api/socket", base).href.replace(/^http/, "ws"), {proxy: false});
        await new Promise((resolve, reject) => {
          socket.onopen = () => socket.send("echo");
          socket.onmessage = event => { try { assert.equal(event.data, "echo"); resolve(); } catch (error) { reject(error); } };
          socket.onerror = () => reject(new Error("WebSocket failed"));
          socket.onclose = () => reject(new Error("WebSocket closed before echo"));
        });
        console.log("forwarded");
      } finally { abort.abort(); socket?.close(); await dev.stop(); }
    `,
      ],
      {
        env: {
          ...process.env,
          HTTP_PROXY: proxy.url.origin,
          HTTPS_PROXY: proxy.url.origin,
          ALL_PROXY: proxy.url.origin,
          http_proxy: proxy.url.origin,
          https_proxy: proxy.url.origin,
          all_proxy: proxy.url.origin,
          NO_PROXY: "",
          no_proxy: "",
        },
        stdin: "ignore",
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const timeout = setTimeout(() => child?.kill(), 10_000);
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]).finally(() => clearTimeout(timeout));
    expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
    expect(stdout.trim()).toBe("forwarded");
    expect(proxyRequests).toBe(0);
    for (let i = 0; i < 60 && !streamCancelled; i++) await Bun.sleep(50);
    expect(streamCancelled).toBe(true);
  } finally {
    child?.kill();
    await child?.exited;
    await backend.stop(true);
    await proxy.stop(true);
    await rm(root, { recursive: true, force: true });
  }
}, 15_000);
