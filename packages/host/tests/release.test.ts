import { test, expect } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApplicationPlatform } from "../src/index.ts";
import { PlatformStore } from "../src/store.ts";
import { download } from "../src/download.ts";

test("production never starts the deferred phone relay, even with a persisted preference", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "fn-release-"));
  const store = await PlatformStore.open(join(temporary, "platform"));
  store.document.preferences.phoneEnabled = true;
  await store.save();
  let cloudCalls = 0;
  const platform = new ApplicationPlatform({
    app: { mode: "production", dataDirectory: temporary },
    native: {
      on: () => () => {},
      statusItem: { setMenu: async () => {} },
      cloudKit: new Proxy(
        {},
        {
          get: () => async () => {
            cloudCalls++;
          },
        },
      ),
    },
  } as any);
  try {
    await platform.start();
    expect((await platform.snapshot()).relay).toMatchObject({
      available: false,
      connected: false,
      messages: [],
    });
    await expect(platform.command("phone-connect", {})).rejects.toMatchObject({
      code: "unavailable",
    });
    expect(cloudCalls).toBe(0);
  } finally {
    await platform.stop();
    await rm(temporary, { recursive: true, force: true });
  }
});

test("market downloads follow validated CDN redirects, reject unsafe hops, loops and oversized content", async () => {
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      const path = new URL(request.url).pathname;
      if (path === "/download")
        return new Response(null, {
          status: 302,
          headers: { location: "/cdn" },
        });
      if (path === "/unsafe")
        return new Response(null, {
          status: 307,
          headers: { location: "http://other.invalid/file" },
        });
      if (path === "/loop")
        return new Response(null, {
          status: 302,
          headers: { location: "/loop" },
        });
      if (path === "/large")
        return new Response(
          new ReadableStream({
            start(c) {
              c.enqueue(new Uint8Array(5));
              c.close();
            },
          }),
        );
      return new Response("file");
    },
  });
  const seen: string[] = [];
  const validate = (url: string) => {
    if (new URL(url).origin !== server.url.origin)
      throw new Error("Unsafe URL");
    seen.push(new URL(url).pathname);
  };
  const get = (path: string) =>
    download(new URL(path, server.url).href, validate, 4, 1000);
  try {
    expect(new TextDecoder().decode(await get("/download"))).toBe("file");
    expect(seen).toEqual(["/download", "/cdn"]);
    await expect(get("/unsafe")).rejects.toThrow("Unsafe URL");
    await expect(get("/loop")).rejects.toThrow("Too many download redirects");
    await expect(get("/large")).rejects.toThrow("Download exceeds size limit");
  } finally {
    server.stop(true);
  }
});
