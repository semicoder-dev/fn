import { watch } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import { injectBrowserRuntime } from "./browser-assets.ts";

export interface WebBuildOptions {
  root: string;
  dist: string;
}

/** The same Bun pipeline is used for development and distribution. */
export async function buildWeb({ root, dist }: WebBuildOptions): Promise<void> {
  await mkdir(dist, { recursive: true });
  const result = await Bun.build({
    entrypoints: [resolve(root, "index.html")],
    outdir: dist,
    target: "browser",
    minify: false,
    sourcemap: "linked",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  if (!result.success)
    throw new AggregateError(result.logs, "Frontend build failed");
  const html = resolve(dist, "index.html");
  await Bun.write(html, injectBrowserRuntime(await Bun.file(html).text()));
}

export async function startWebDevelopment(
  options: WebBuildOptions & {
    projectRoot: string;
    port: number;
    endpointFile: string;
  },
) {
  let revision = 0;
  let closed = false;
  let building = false;
  let dirty = false;
  let error: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const rebuild = async () => {
    dirty = true;
    if (building) return;
    building = true;
    while (dirty && !closed) {
      dirty = false;
      try {
        await buildWeb(options);
        error = undefined;
        revision++;
      } catch (cause) {
        error = String(cause);
        console.error(error);
      }
    }
    building = false;
  };
  await rebuild();
  if (error) throw new Error(error);
  const endpoint = async () => {
    const value = JSON.parse(await readFile(options.endpointFile, "utf8")) as {
      origin: string;
    };
    if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(value.origin))
      throw new Error("Invalid backend origin");
    return value.origin;
  };
  type SocketData = {
    upstream: WebSocket;
    queue: (string | ArrayBuffer | Uint8Array)[];
    bytes: number;
  };
  const server = Bun.serve<SocketData>({
    hostname: "127.0.0.1",
    port: options.port,
    idleTimeout: 0,
    async fetch(request, server) {
      const url = new URL(request.url);
      if (/^\/(?:api|_fia|pages)(?:\/|$)/.test(url.pathname)) {
        const target = new URL(url.pathname + url.search, await endpoint());
        if (request.headers.get("upgrade")?.toLowerCase() === "websocket") {
          const headers = new Headers(request.headers);
          for (const key of [
            "host",
            "connection",
            "upgrade",
            "sec-websocket-key",
            "sec-websocket-version",
            "sec-websocket-extensions",
          ])
            headers.delete(key);
          const upstream = new (
            WebSocket as unknown as {
              new (
                url: string,
                options: { headers: Headers; proxy: false },
              ): WebSocket;
            }
          )(target.href.replace(/^http/, "ws"), { headers, proxy: false });
          if (
            server.upgrade(request, { data: { upstream, queue: [], bytes: 0 } })
          )
            return;
          upstream.close();
          return new Response("Upgrade failed", { status: 400 });
        }
        const headers = new Headers(request.headers);
        headers.delete("host");
        return fetch(target, {
          // The validated upstream is always local, regardless of shell proxy settings.
          // @ts-expect-error Bun 1.4.4 supports false; pinned bun-types 1.4.0 does not yet declare it.
          proxy: false,
          method: request.method,
          headers,
          body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : request.body,
          signal: request.signal,
          redirect: "manual",
        });
      }
      if (url.pathname === "/__fia_dev_revision")
        return Response.json(
          { revision, error },
          { headers: { "cache-control": "no-store" } },
        );
      const decoded = decodeURIComponent(url.pathname);
      const path = resolve(options.dist, "." + decoded);
      const rel = relative(options.dist, path);
      if (rel === ".." || rel.startsWith(".." + sep))
        return new Response(null, { status: 403 });
      let file = Bun.file(path);
      if (!(await file.exists()) || decoded === "/")
        file = Bun.file(resolve(options.dist, "index.html"));
      if (file.type.startsWith("text/html")) {
        const script = `<script>let r=${revision};setInterval(async()=>{try{const s=await(await fetch('/__fia_dev_revision',{cache:'no-store'})).json();if(s.revision!==r)location.reload();}catch{}},700);</script>`;
        return new Response(
          (await file.text()).replace("</body>", script + "</body>"),
          {
            headers: {
              "content-type": "text/html",
              "cache-control": "no-store",
            },
          },
        );
      }
      return new Response(file, { headers: { "cache-control": "no-store" } });
    },
    websocket: {
      maxPayloadLength: 1024 * 1024,
      backpressureLimit: 2 * 1024 * 1024,
      closeOnBackpressureLimit: true,
      open(socket) {
        const data = socket.data;
        data.upstream.binaryType = "arraybuffer";
        data.upstream.onopen = () => {
          for (const value of data.queue)
            data.upstream.send(
              typeof value === "string" || value instanceof ArrayBuffer
                ? value
                : new Uint8Array(value).buffer,
            );
          data.queue = [];
          data.bytes = 0;
        };
        data.upstream.onmessage = (event) => {
          socket.send(event.data);
        };
        data.upstream.onclose = () => socket.close();
        data.upstream.onerror = () => socket.close(1011, "Backend unavailable");
      },
      message(socket, message) {
        const data = socket.data;
        if (data.upstream.readyState === WebSocket.OPEN)
          data.upstream.send(message);
        else {
          data.bytes +=
            typeof message === "string"
              ? Buffer.byteLength(message)
              : message.byteLength;
          if (data.bytes > 2 * 1024 * 1024) socket.close(1009, "Queue limit");
          else data.queue.push(message);
        }
      },
      close(socket) {
        socket.data.upstream.close();
      },
    },
  });
  const generated = relative(options.projectRoot, options.dist).replaceAll(
    sep,
    "/",
  );
  const watcher = watch(
    options.projectRoot,
    { recursive: true },
    (_event, file) => {
      const path = file?.toString().replaceAll(sep, "/");
      if (
        !path ||
        path.startsWith(generated + "/") ||
        /(^|\/)(node_modules|\.git|\.fia|\.build|dist)(\/|$)/.test(path)
      )
        return;
      if (!/\.(tsx?|jsx?|css|html|json)$/.test(path)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        void rebuild();
      }, 120);
    },
  );
  return {
    server,
    async stop() {
      closed = true;
      clearTimeout(timer);
      watcher.close();
      await server.stop(true);
    },
  };
}
