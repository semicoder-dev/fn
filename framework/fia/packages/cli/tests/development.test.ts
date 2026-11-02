import { expect, test } from "bun:test";
import {
  hasProcessExited,
  isDevelopmentServerReady,
} from "../src/application.ts";

test("development readiness bypasses proxy environment and checks HTTP status", async () => {
  let status = 200;
  let serverRequests = 0;
  let proxyRequests = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => {
      serverRequests++;
      return new Response("ready", { status });
    },
  });
  const proxy = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => {
      proxyRequests++;
      return new Response(null, { status: 502 });
    },
  });
  try {
    const source = new URL("../src/application.ts", import.meta.url).href;
    const child = Bun.spawn(
      [
        process.execPath,
        "-e",
        `import assert from "node:assert/strict"; import {isDevelopmentServerReady} from ${JSON.stringify(source)}; const environment = JSON.stringify(process.env); console.log(await isDevelopmentServerReady(${server.port})); assert.equal(JSON.stringify(process.env), environment);`,
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
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
    expect(stdout.trim()).toBe("true");
    expect(proxyRequests).toBe(0);
    expect(serverRequests).toBe(1);
    status = 503;
    expect(await isDevelopmentServerReady(server.port!)).toBe(false);
    expect(serverRequests).toBe(2);
    expect(proxyRequests).toBe(0);
  } finally {
    await server.stop(true);
    await proxy.stop(true);
  }
});

test("development readiness accepts only 2xx responses and does not follow redirects", async () => {
  let status = 204;
  let redirectedRequests = 0;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      if (new URL(request.url).pathname !== "/") {
        redirectedRequests++;
        return new Response("ready");
      }
      return new Response(null, { status, headers: { location: "/ready" } });
    },
  });
  try {
    for (status of [204, 206, 299, 300, 302, 307, 404, 500]) {
      expect({
        status,
        ready: await isDevelopmentServerReady(server.port!),
      }).toEqual({
        status,
        ready: status >= 200 && status < 300,
      });
    }
    expect(redirectedRequests).toBe(0);
  } finally {
    await server.stop(true);
  }
});

test("development readiness uses headers without waiting for a streaming body", async () => {
  let cancelled = false;
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("ready"));
          },
          cancel() {
            cancelled = true;
          },
        }),
      ),
  });
  try {
    expect(await isDevelopmentServerReady(server.port!)).toBe(true);
    for (let i = 0; i < 60 && !cancelled; i++) await Bun.sleep(10);
    expect(cancelled).toBe(true);
  } finally {
    await server.stop(true);
  }
});

test("development readiness returns false on timeout and connection failure", async () => {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch: () => new Promise<Response>(() => {}),
  });
  const port = server.port!;
  try {
    const start = Date.now();
    expect(await isDevelopmentServerReady(port)).toBe(false);
    expect(Date.now() - start).toBeGreaterThanOrEqual(900);
    expect(Date.now() - start).toBeLessThan(3000);
  } finally {
    await server.stop(true);
  }
  expect(await isDevelopmentServerReady(port)).toBe(false);
});

test("development detects both normal and signal-terminated child processes", async () => {
  const normal = Bun.spawn([process.execPath, "-e", "process.exit(0)"]);
  await normal.exited;
  expect(hasProcessExited(normal)).toBe(true);

  for (const signal of ["SIGINT", "SIGTERM", "SIGKILL"] as const) {
    const child = Bun.spawn(["/bin/sleep", "60"]);
    try {
      expect(hasProcessExited(child)).toBe(false);
      child.kill(signal);
      await child.exited;
      expect(child.signalCode).toBe(signal);
      expect(hasProcessExited(child)).toBe(true);
    } finally {
      if (!hasProcessExited(child)) child.kill("SIGKILL");
      await child.exited;
    }
  }
});

test("development startup excludes native interaction wait but still times out afterwards", async () => {
  const { waitUntil } = await import("../src/smoke.ts");
  const start = Date.now();
  const result = await waitUntil(
    async () => (Date.now() - start > 350 ? "ready" : undefined),
    200,
    "startup",
    async () => Date.now() - start < 300,
  );
  expect(result).toBe("ready");
  await expect(
    waitUntil(
      async () => undefined,
      120,
      "startup",
      async () => false,
    ),
  ).rejects.toThrow("timed out");
});
