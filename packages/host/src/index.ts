import { resolve, dirname } from "node:path";
import { hostname, homedir } from "node:os";
import { z } from "zod";
import type { BackendContext } from "@semicoder/fia/backend";
import {
  FnError,
  type InstalledApplication,
  type ApplicationState,
} from "@semicoder/fn-sdk/types";
import { parseSummary } from "@semicoder/fn-sdk/summary";
import { textValue } from "@semicoder/fn-sdk/text";
import { encodeSSE } from "@semicoder/fn-sdk/sse";
import { PlatformStore, inside, type Installation } from "./store.ts";
import { Models } from "./models.ts";
import { Relay } from "./relay.ts";
import { download } from "./download.ts";

type Frame = {
  type: string;
  id?: string;
  value?: unknown;
  code?: string;
  message?: string;
  [key: string]: unknown;
};
interface Pending {
  queue: Frame[];
  bytes: number;
  wake?: () => void;
  controller: AbortController;
  done: boolean;
  viewId?: string;
}
interface Run {
  id: string;
  instanceId: string;
  token: string;
  state: ApplicationState;
  controller: AbortController;
  socket?: Bun.ServerWebSocket<SocketData>;
  pending: Map<string, Pending>;
  ready: Promise<void>;
  resolve: () => void;
  reject: (e: unknown) => void;
  error?: string;
  modelCalls: number;
  stopped?: () => void;
}
interface View {
  dirty: boolean;
  windowId?: string;
  id: string;
  instanceId: string;
  runId: string;
  token: string;
  controller: AbortController;
  socket?: Bun.ServerWebSocket<SocketData>;
  timer?: ReturnType<typeof setTimeout>;
}
export type SocketData =
  | { kind: "runtime"; run: Run }
  | { kind: "view"; view: View }
  | { kind: "admin"; windowId?: string };
const credential = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
const json = (value: unknown) =>
  Response.json(value, { headers: { "cache-control": "no-store" } });
const errorResponse = (error: unknown) => {
  const value =
    error instanceof FnError
      ? error
      : new FnError(
          "invalid_request",
          error instanceof Error ? error.message : String(error),
        );
  return Response.json(
    { code: value.code, message: value.message },
    {
      status:
        value.code === "unauthorized"
          ? 401
          : value.code === "forbidden"
            ? 403
            : value.code === "busy"
              ? 409
              : 400,
    },
  );
};
const send = (
  socket: Bun.ServerWebSocket<SocketData> | undefined,
  value: unknown,
) => {
  if (!socket) return;
  const text = JSON.stringify(value);
  if (socket.getBufferedAmount() > 2 * 1024 * 1024) {
    socket.close(1009, "Backpressure limit");
    return;
  }
  socket.send(text);
};

export class ApplicationPlatform {
  store!: PlatformStore;
  models!: Models;
  relay!: Relay;
  runs = new Map<string, Run>();
  views = new Map<string, View>();
  private previews = new Map<string, unknown>();
  admins = new Set<Bun.ServerWebSocket<SocketData>>();
  private names = new Map<string, Record<string, Record<string, string>>>();
  private installing = new Set<string>();
  private pendingInstalls = new Map<string, Installation>();
  private errors = new Map<string, string>();
  private closing = new Map<string, Promise<void>>();
  private chatBusy = new Set<string>();
  private off: (() => void)[] = [];
  private confirmations = new Map<
    string,
    { viewId: string; resolve: (value: boolean) => void }
  >();
  private catalog: unknown[] = [];
  private catalogErrors: string[] = [];
  private shuttingDown = false;
  constructor(readonly context: BackendContext<SocketData>) {}
  get phoneAvailable() {
    return this.context.app.mode !== "production";
  }
  async start() {
    const root = resolve(this.context.app.dataDirectory, "platform");
    this.store = await PlatformStore.open(root);
    this.models = new Models(root);
    await this.models.open();
    this.store.document.installations =
      this.store.document.installations.filter((i) => !i.development);
    this.store.document.preferences.desktop = this.store.desktopOrder();
    await this.store.save();
    for (const installation of this.store.document.installations)
      this.names.set(
        installation.instanceId,
        await this.store.locales(installation),
      );
    this.relay = new Relay(
      root,
      this.store.document.hostId,
      this.context.native,
      this.context.app.mode === "production" ? "production" : "development",
      () => ({
        id: this.store.document.hostId,
        name: hostname(),
        updatedAt: Date.now(),
        applications: this.store.document.installations
          .filter((i) => i.build.manifest.contributes.chat)
          .map((i) => ({
            id: i.instanceId,
            name: this.appName(i),
            state: this.runs.get(i.instanceId)?.state ?? "closed",
          })),
      }),
      () => {
        this.changed();
        void this.drainChats();
      },
    );
    this.off.push(
      this.context.native.on("windows.closeRequested", (value) => {
        const id = (value as { windowId: string }).windowId;
        const installation = this.store.document.installations.find(
          (i) => this.windowId(i.instanceId) === id,
        );
        if (installation) void this.requestClose(installation.instanceId);
      }),
    );
    this.off.push(
      this.context.native.on("windows.changed", (value) => {
        const current = (value as any).current;
        for (const run of this.runs.values())
          if (this.windowId(run.instanceId) === current.id) {
            if (current.lifecycle === "closed" && run.state !== "stopping")
              void this.close(run.instanceId, true);
            else if (["running", "minimized"].includes(run.state)) {
              run.state = current.miniaturized ? "minimized" : "running";
              this.changed();
            }
          }
      }),
    );
    this.off.push(
      this.context.native.on("statusItem.action", (value) => {
        void this.open((value as { id: string }).id).catch((error) =>
          this.notice(String(error)),
        );
      }),
    );
    this.off.push(
      this.context.native.on("processes.exited", (value) => {
        const id = (value as { id: string }).id;
        const run = [...this.runs.values()].find((r) => r.id === id);
        if (run && run.state !== "stopping") {
          run.socket?.close();
          run.socket = undefined;
          void this.fail(run, "Application process exited");
        }
      }),
    );
    await this.menu();
    if (this.phoneAvailable && this.store.document.preferences.phoneEnabled)
      void this.relay.connect().catch((error) => this.notice(String(error)));
  }
  private installation(id: string) {
    const value = this.store.document.installations.find(
      (i) => i.instanceId === id,
    );
    if (!value) throw new FnError("not_found", "Application not installed");
    return value;
  }
  private windowId(id: string) {
    return (
      "app-" +
      new Bun.CryptoHasher("sha256").update(id).digest("hex").slice(0, 24)
    );
  }
  private appName(i: Installation) {
    const name = i.build.manifest.name;
    const messages = this.names.get(i.instanceId);
    return typeof name === "string"
      ? name
      : (messages?.[this.store.document.preferences.locale]?.[name.key] ??
          messages?.en?.[name.key] ??
          i.build.manifest.id);
  }
  async snapshot() {
    const applications: InstalledApplication[] = await Promise.all(
      this.store.document.installations.map(async (i) => ({
        instanceId: i.instanceId,
        manifest: i.build.manifest,
        state:
          this.runs.get(i.instanceId)?.state ??
          (this.errors.has(i.instanceId) ? "failed" : "closed"),
        runId: this.runs.get(i.instanceId)?.id,
        error: this.errors.get(i.instanceId),
        busy: this.busy(i.instanceId),
        summary: await this.store.summary(i),
        requiresUpdate: i.build.manifest.hostApi !== 2,
        messages: await this.store.locales(i),
      })),
    );
    return {
      preferences: this.store.document.preferences,
      applications,
      connections: this.models.list(),
      relay: {
        available: this.phoneAvailable,
        connected: this.relay.connected,
        error: this.relay.error,
        messages: this.relay.store?.list() ?? [],
      },
      markets: this.store.document.markets,
      catalog: this.catalog,
      catalogErrors: this.catalogErrors,
      notifications: this.store.document.notifications ?? [],
    };
  }
  private busy(id: string) {
    const run = this.runs.get(id);
    return (
      (run?.pending.size ?? 0) +
      (run?.modelCalls ?? 0) +
      [...this.views.values()].filter((v) => v.instanceId === id && v.dirty)
        .length
    );
  }
  changed() {
    for (const socket of this.admins) send(socket, { type: "changed" });
    void this.menu().catch(() => {});
  }
  private notice(text: string, instanceId?: string) {
    const list = (this.store.document.notifications ??= []);
    list.unshift({
      id: crypto.randomUUID(),
      text,
      instanceId,
      createdAt: Date.now(),
    });
    list.splice(100);
    void this.store.save().catch(() => {});
    this.changed();
    for (const socket of this.admins)
      send(socket, { type: "toast", value: { text } });
  }
  private async menu() {
    if (!this.store) return;
    const items = await Promise.all(
      this.store.document.preferences.menu.map(async (id) => {
        const i = this.store.document.installations.find(
          (a) => a.instanceId === id,
        );
        if (!i) return;
        const dict = await this.store.locales(i);
        const name = i.build.manifest.name;
        return {
          id,
          label:
            typeof name === "string"
              ? name
              : (dict[this.store.document.preferences.locale]?.[name.key] ??
                dict.en?.[name.key] ??
                id),
          checked: this.runs.has(id),
        };
      }),
    );
    await this.context.native.statusItem.setMenu({
      items: items.filter((i): i is NonNullable<typeof i> => !!i),
      locale: this.store.document.preferences.locale,
    });
  }
  async open(id: string, browser = false) {
    if (this.shuttingDown) throw new FnError("stopping", "Fn is stopping");
    if (this.installing.has(id))
      throw new FnError("busy", "Application update is in progress");
    if (this.closing.has(id)) await this.closing.get(id);
    if (this.installing.has(id))
      throw new FnError("busy", "Application update is in progress");
    const installation = this.installation(id);
    if (installation.build.manifest.hostApi !== 2)
      throw new FnError(
        "unsupported_host_api",
        this.store.document.preferences.locale === "zh-CN"
          ? "应用需要更新：请安装支持当前 Fn 的新版应用包。"
          : "Application update required. Install a package built for this Fn API.",
      );
    let run = this.runs.get(id);
    if (!run) {
      let accept!: () => void, decline!: (error: unknown) => void;
      const ready = new Promise<void>((resolve, reject) => {
        accept = resolve;
        decline = reject;
      });
      run = {
        id: "run-" + crypto.randomUUID(),
        instanceId: id,
        token: credential(),
        state: "starting",
        controller: new AbortController(),
        pending: new Map(),
        modelCalls: 0,
        ready,
        resolve: accept,
        reject: decline,
      };
      this.runs.set(id, run);
      this.errors.delete(id);
      this.changed();
      // Attach the rejection before native spawn can fail.
      void ready.catch(() => {});
      const timeout = setTimeout(
        () =>
          run!.reject(
            new FnError("startup_timeout", "Application did not become ready"),
          ),
        15_000,
      );
      try {
        if (installation.build.backend) {
          const config = {
            origin: this.context.url().origin,
            token: run.token,
            runId: run.id,
            entry: await inside(
              installation.directory,
              installation.build.backend,
            ),
            paths: await this.store.paths(id),
          };
          await this.context.native.processes.spawn({
            id: run.id,
            executable: process.execPath,
            arguments: [
              "--no-env-file",
              "--install=disable",
              resolve(
                this.context.app.codeDirectory,
                "resources/app-runner.js",
              ),
            ],
            directory: installation.directory,
            environment: {
              PATH: process.env.PATH ?? "/usr/bin:/bin",
              HOME: homedir(),
              BUN_RUNTIME_TRANSPILER_CACHE_PATH: resolve(
                config.paths.cache,
                "bun",
              ),
              FN_RUNTIME_CONFIG: JSON.stringify(config),
            },
          });
        } else run.resolve();
        await ready;
        run.state = "running";
      } catch (error) {
        await this.fail(
          run,
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    } else await run.ready;
    run.controller.signal.throwIfAborted();
    if (this.runs.get(id) !== run)
      throw new FnError("stale", "Application stopped while opening");
    const route = installation.build.page
      ? `/pages/${encodeURIComponent(id)}/${installation.development ? "current" : run.id}/?app=${encodeURIComponent(id)}`
      : `/?status=${encodeURIComponent(id)}`;
    if (browser) {
      const url = this.context.browserURL(route);
      void this.drainChats();
      this.changed();
      return { url, instanceId: id };
    }
    await this.context.native.windows.create({
      id: this.windowId(id),
      route,
      title: this.appName(installation),
      width: 1000,
      height: 720,
      managedClose: true,
    });
    await this.context.native.windows.open({ id: this.windowId(id) });
    run.state = "running";
    this.changed();
    void this.drainChats();
    return { instanceId: id };
  }
  private async requestClose(id: string) {
    const candidates = [...this.views.values()].filter(
      (view) => view.instanceId === id && view.socket?.readyState === 1,
    );
    const target =
      candidates.find((view) => view.windowId === this.windowId(id)) ??
      candidates[0];
    // Let the page observe its current draft before host-side dirty notifications settle.
    if (target) {
      send(target.socket, {
        type: "closeRequested",
        value: { instanceId: id, busy: this.busy(id) > 0 },
      });
      return;
    }
    try {
      await this.close(id);
    } catch (error) {
      if (error instanceof FnError && error.code === "busy") {
        const candidates = [...this.views.values()].filter(
          (v) => v.instanceId === id && v.socket,
        );
        const view =
          candidates.find((v) => v.windowId === this.windowId(id)) ??
          candidates[0];
        if (view)
          send(view.socket, {
            type: "closeRequested",
            value: { instanceId: id },
          });
        else {
          const sockets = [...this.admins];
          const socket =
            sockets.find(
              (s) =>
                s.data.kind === "admin" &&
                s.data.windowId === this.windowId(id),
            ) ??
            sockets.find(
              (s) => s.data.kind === "admin" && s.data.windowId === "main",
            ) ??
            sockets[0];
          send(socket, { type: "closeRequested", value: { instanceId: id } });
        }
      } else this.notice(String(error));
    }
  }
  async close(id: string, force = false) {
    if (this.closing.has(id)) return this.closing.get(id);
    const run = this.runs.get(id);
    if (!run) return;
    if (this.busy(id) && !force)
      throw new FnError("busy", "Application has active tasks");
    const task = (async () => {
      run.state = "stopping";
      run.reject(new FnError("cancelled", "Application stopped while opening"));
      run.controller.abort();
      this.relay.store?.interrupt(id);
      for (const [requestId, call] of run.pending) {
        call.controller.abort();
        call.queue.push({
          type: "error",
          code: "cancelled",
          message: "Application closed",
        });
        call.wake?.();
        send(run.socket, { type: "cancel", id: requestId });
      }
      for (const view of [...this.views.values()].filter(
        (v) => v.instanceId === id,
      )) {
        send(view.socket, { type: "stale" });
        this.disposeView(view);
      }
      this.changed();
      if (run.socket?.readyState === 1)
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 3000);
          run.stopped = () => {
            clearTimeout(timer);
            resolve();
          };
          send(run.socket, { type: "stop" });
        });
      try {
        await this.context.native.processes.stop(
          { id: run.id },
          { timeoutMs: 6000 },
        );
      } finally {
        run.socket?.close();
        this.runs.delete(id);
        try {
          await this.context.native.windows.close({ id: this.windowId(id) });
        } catch {}
        this.changed();
      }
    })().finally(() => this.closing.delete(id));
    this.closing.set(id, task);
    return task;
  }
  private async fail(run: Run, message: string) {
    if (this.runs.get(run.instanceId) !== run || run.state === "stopping")
      return;
    run.reject(new FnError("application_failed", message));
    this.errors.set(run.instanceId, message);
    await this.close(run.instanceId, true);
  }
  async stop() {
    this.shuttingDown = true;
    for (const off of this.off) off();
    await Promise.allSettled(
      [...this.runs.keys()].map((id) => this.close(id, true)),
    );
    this.relay.close();
    for (const socket of this.admins) socket.close();
    await this.store.save();
  }
  authorize(request: Request) {
    const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
    return (
      !!token &&
      [...this.runs.values()].some(
        (r) => r.token === token && !r.controller.signal.aborted,
      )
    );
  }
  private identity(request: Request): {
    run?: Run;
    view?: View;
    admin: boolean;
  } {
    const bearer = request.headers
      .get("authorization")
      ?.replace(/^Bearer /, "");
    const run = [...this.runs.values()].find((r) => r.token === bearer);
    if (run) {
      if (run.controller.signal.aborted)
        throw new FnError("unauthorized", "Run has ended");
      return { run, admin: false };
    }
    const token = request.headers.get("x-fn-view");
    if (token) {
      const view = this.views.get(token);
      if (!view || view.controller.signal.aborted)
        throw new FnError("unauthorized", "View has ended");
      const run = this.runs.get(view.instanceId);
      if (!run || run.id !== view.runId)
        throw new FnError("stale", "Application restarted");
      return { run, view, admin: false };
    }
    return { admin: true };
  }
  private allow(run: Run, capability: string) {
    if (
      !this.installation(run.instanceId).build.manifest.uses.includes(
        capability as any,
      )
    )
      throw new FnError(
        "forbidden",
        "Application has not declared " + capability,
      );
  }
  private disposeView(view: View) {
    clearTimeout(view.timer);
    view.controller.abort();
    view.socket?.close();
    this.views.delete(view.token);
    for (const [id, confirmation] of this.confirmations)
      if (confirmation.viewId === view.id) {
        confirmation.resolve(false);
        this.confirmations.delete(id);
      }
  }
  private async invoke(
    run: Run,
    method: string,
    input: unknown,
    signal: AbortSignal,
    viewId?: string,
    chat = false,
  ) {
    if (!run.socket || !["running", "minimized"].includes(run.state))
      throw new FnError("not_running", "Application is not running");
    if (run.pending.size >= 32)
      throw new FnError("busy", "Too many application requests");
    signal.throwIfAborted();
    const id = crypto.randomUUID();
    const call: Pending = {
      queue: [],
      bytes: 0,
      controller: new AbortController(),
      done: false,
      viewId,
    };
    run.pending.set(id, call);
    const cancel = () => {
      call.controller.abort();
      call.wake?.();
      send(run.socket, { type: "cancel", id });
    };
    signal.addEventListener("abort", cancel, { once: true });
    send(run.socket, { type: "call", id, method, input, viewId, chat });
    this.changed();
    const changed = () => this.changed();
    return (async function* () {
      try {
        while (true) {
          while (!call.queue.length && !call.controller.signal.aborted)
            await new Promise<void>((resolve) => {
              call.wake = resolve;
            });
          call.controller.signal.throwIfAborted();
          const frame = call.queue.shift()!;
          call.bytes -= JSON.stringify(frame).length;
          if (frame.type === "error")
            throw new FnError(
              frame.code ?? "application_error",
              frame.message ?? "Application failed",
            );
          if (frame.type === "done") return;
          if (frame.type === "yield") send(run.socket, { type: "credit", id });
          yield frame.value;
        }
      } finally {
        signal.removeEventListener("abort", cancel);
        if (!call.done) send(run.socket, { type: "cancel", id });
        run.pending.delete(id);
        changed();
      }
    })();
  }
  private async drainChats() {
    const store = this.relay.store;
    if (!store || !this.relay.connected) return;
    for (const run of this.runs.values()) {
      if (
        !["running", "minimized"].includes(run.state) ||
        this.chatBusy.has(run.instanceId)
      )
        continue;
      const chat = this.installation(run.instanceId).build.manifest.contributes
        .chat;
      if (!chat) continue;
      this.chatBusy.add(run.instanceId);
      void (async () => {
        try {
          let message;
          while (
            !run.controller.signal.aborted &&
            (message = store.claim(run.instanceId))
          ) {
            this.changed();
            try {
              const stream = await this.invoke(
                run,
                chat.id,
                message,
                run.controller.signal,
                undefined,
                true,
              );
              for await (const _ of stream) {
              }
              const result = store.get(message.id);
              if (result?.status === "processing")
                store.set({
                  ...result,
                  status: "failed",
                  error: "Application did not return a reply",
                });
            } catch (error) {
              const result = store.get(message.id);
              if (result?.status === "processing")
                store.set({
                  ...result,
                  status: run.controller.signal.aborted
                    ? "interrupted"
                    : "failed",
                  error: String(error).slice(0, 1000),
                });
            }
            this.changed();
            void this.relay.sync();
          }
        } finally {
          this.chatBusy.delete(run.instanceId);
        }
      })();
    }
  }
  websocket = {
    open: (socket: Bun.ServerWebSocket<SocketData>) => {
      const data = socket.data;
      if (data.kind === "admin") this.admins.add(socket);
      else if (data.kind === "runtime") {
        if (data.run.socket) {
          socket.close(4003, "Already connected");
          return;
        }
        data.run.socket = socket;
      } else {
        clearTimeout(data.view.timer);
        data.view.socket = socket;
      }
    },
    message: (
      socket: Bun.ServerWebSocket<SocketData>,
      raw: string | Buffer,
    ) => {
      if (socket.data.kind !== "runtime") return;
      const run = socket.data.run;
      try {
        const frame = JSON.parse(String(raw)) as Frame;
        if (frame.type === "ready") {
          run.resolve();
          return;
        }
        if (frame.type === "stopped") {
          run.stopped?.();
          return;
        }
        if (frame.type === "fatal") {
          void this.fail(run, frame.message ?? "Initialization failed");
          return;
        }
        const call = frame.id ? run.pending.get(frame.id) : undefined;
        if (!call || call.done) return;
        if (!["yield", "result", "done", "error"].includes(frame.type))
          throw new Error("Invalid runtime frame");
        call.bytes += String(raw).length;
        if (call.bytes > 2 * 1024 * 1024 || call.queue.length > 32)
          throw new Error("Application stream overflow");
        call.queue.push(frame);
        if (frame.type === "done" || frame.type === "error") call.done = true;
        call.wake?.();
      } catch {
        void this.fail(run, "Invalid application transport");
      }
    },
    close: (socket: Bun.ServerWebSocket<SocketData>) => {
      const data = socket.data;
      if (data.kind === "admin") this.admins.delete(socket);
      else if (data.kind === "view") this.disposeView(data.view);
      else {
        data.run.stopped?.();
        if (data.run.state !== "stopping")
          void this.fail(data.run, "Application disconnected");
      }
    },
  };
  async callback(request: Request) {
    try {
      await this.models.callback(new URL(request.url));
      this.changed();
      return new Response(
        "<!doctype html><meta charset=utf-8><title>Fn</title><p>已连接 / Connected. You can return to Fn.</p>",
        { headers: { "content-type": "text/html; charset=utf-8" } },
      );
    } catch (error) {
      return errorResponse(error);
    }
  }
  async fetch(
    request: Request,
    server: Bun.Server<SocketData>,
  ): Promise<Response | undefined> {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/^\/fn\/v1/, "");
      const identity = this.identity(request);
      if (path === "/runtime") {
        if (!identity.run || identity.view)
          throw new FnError("forbidden", "Runtime credentials required");
        if (
          server.upgrade(request, {
            data: { kind: "runtime", run: identity.run },
          })
        )
          return;
        throw new Error("WebSocket required");
      }
      if (path === "/events") {
        const view = url.searchParams.get("view");
        if (view) {
          const value = this.views.get(view);
          if (!value) throw new FnError("unauthorized", "View expired");
          if (server.upgrade(request, { data: { kind: "view", view: value } }))
            return;
        } else if (
          identity.admin &&
          server.upgrade(request, {
            data: {
              kind: "admin",
              windowId: url.searchParams.get("windowId") ?? undefined,
            },
          })
        )
          return;
        throw new FnError("forbidden", "Invalid event connection");
      }
      const body = async () => request.json();
      if (path === "/views") {
        if (!identity.admin)
          throw new FnError(
            "forbidden",
            "View initialization requires a host session",
          );
        const { instanceId, runId, windowId } = z
          .object({
            instanceId: z.string(),
            runId: z.string(),
            windowId: z.string().optional(),
          })
          .parse(await body());
        const installation = this.installation(instanceId);
        const run = this.runs.get(instanceId);
        if (!run || !["running", "minimized"].includes(run.state))
          throw new FnError("not_running", "Application is closed");
        if (runId && run.id !== runId)
          throw new FnError("stale", "Application restarted; reload from Fn");
        if (this.views.size >= 128)
          throw new FnError("busy", "Too many application views");
        const view: View = {
          id: crypto.randomUUID(),
          dirty: false,
          windowId,
          instanceId,
          runId: run.id,
          token: credential(),
          controller: new AbortController(),
        };
        view.timer = setTimeout(() => this.disposeView(view), 30_000);
        this.views.set(view.token, view);
        return json({
          viewId: view.id,
          instanceId,
          runId: run.id,
          token: view.token,
          preferences: this.store.document.preferences,
          messages: await this.store.locales(installation),
        });
      }
      if (path === "/preferences" && request.method === "GET")
        return json(this.store.document.preferences);
      if (path === "/models" || path === "/models/default") {
        if (identity.run) this.allow(identity.run, "models.responses");
        const models = await this.models.catalog();
        if (path === "/models") return json(models);
        const selected = this.store.document.preferences.defaultModel;
        const model =
          models.find(
            (m) =>
              m.connectionId === selected?.connectionId &&
              m.id === selected.model,
          ) ?? models[0];
        if (!model)
          throw new FnError(
            "not_connected",
            "Connect a ChatGPT account and select a model",
          );
        return json({ ...model, model: model.id });
      }
      if (path === "/responses") {
        if (!identity.run)
          throw new FnError("forbidden", "Application credentials required");
        this.allow(identity.run, "models.responses");
        const signal = AbortSignal.any([
          request.signal,
          identity.run.controller.signal,
          ...(identity.view ? [identity.view.controller.signal] : []),
        ]);
        const run = identity.run;
        run.modelCalls++;
        this.changed();
        let ended = false;
        const finish = () => {
          if (!ended) {
            ended = true;
            signal.removeEventListener("abort", finish);
            run.modelCalls--;
            this.changed();
          }
        };
        signal.addEventListener("abort", finish, { once: true });
        if (signal.aborted) finish();
        try {
          const response = await this.models.responses(
            request.headers.get("x-fn-connection") ?? "",
            await body(),
            signal,
          );
          const reader = response.body!.getReader();
          return new Response(
            new ReadableStream({
              async pull(controller) {
                try {
                  const value = await reader.read();
                  if (value.done) {
                    finish();
                    controller.close();
                  } else controller.enqueue(value.value);
                } catch (error) {
                  finish();
                  controller.error(error);
                }
              },
              async cancel() {
                try {
                  await reader.cancel();
                } finally {
                  finish();
                }
              },
            }),
            { headers: response.headers },
          );
        } catch (error) {
          finish();
          throw error;
        }
      }
      if (path === "/apps/summary" || path === "/apps/data-changed") {
        if (!identity.run || identity.view)
          throw new FnError("forbidden", "Backend credentials required");
        const run = identity.run;
        const assertCurrent = () => {
          if (
            this.runs.get(run.instanceId) !== run ||
            run.controller.signal.aborted ||
            run.state === "stopping"
          )
            throw new FnError("stale", "Application run expired");
        };
        if (path === "/apps/summary") {
          this.allow(run, "application.summary");
          const installation = this.installation(run.instanceId);
          if (!installation.build.manifest.contributes.summary)
            throw new Error("Summary not declared");
          const { snapshot } = z
            .strictObject({
              snapshot: z
                .unknown()
                .refine((v) => v !== undefined, "Snapshot required"),
            })
            .parse(await body());
          await this.store.setSummary(
            installation,
            snapshot === null ? null : parseSummary(snapshot),
            assertCurrent,
          );
          // Summary refreshes do not touch the platform file, menu or app views.
          for (const socket of this.admins) send(socket, { type: "changed" });
        } else {
          z.strictObject({}).parse(await body());
          assertCurrent();
          for (const view of this.views.values())
            if (view.instanceId === run.instanceId && view.runId === run.id)
              send(view.socket, { type: "dataChanged" });
        }
        return json(null);
      }
      if (path === "/relay/reply") {
        if (!identity.run || identity.view)
          throw new FnError("forbidden", "Backend credentials required");
        this.allow(identity.run, "chat.receive");
        const input = z
          .object({
            messageId: z.string().uuid(),
            text: z.string().min(1).max(200000),
          })
          .parse(await body());
        if (!this.relay.store) throw new Error("Phone is disconnected");
        this.relay.store.reply(
          identity.run.instanceId,
          input.messageId,
          input.text,
        );
        this.changed();
        return json(null);
      }
      if (path.startsWith("/ui/")) {
        if (!identity.run)
          throw new FnError("forbidden", "Application credentials required");
        const input = await body();
        const view =
          identity.view ??
          [...this.views.values()].find(
            (v) =>
              v.id === input.viewId &&
              v.instanceId === identity.run!.instanceId,
          );
        if (path === "/ui/toast") {
          const text = z.string().max(2000).parse(input.text);
          if (view) send(view.socket, { type: "toast", value: { text } });
          else this.notice(text, identity.run.instanceId);
          return json(null);
        }
        if (path === "/ui/confirm") {
          if (!view?.socket)
            throw new FnError("view_unavailable", "No target view");
          const text = z.string().max(2000).parse(input.text);
          const id = crypto.randomUUID();
          return json(
            await new Promise<boolean>((resolve) => {
              this.confirmations.set(id, { viewId: view.id, resolve });
              send(view.socket, { type: "confirm", value: { id, text } });
            }),
          );
        }
        if (path === "/ui/answer" && identity.view) {
          const answer = this.confirmations.get(input.id);
          if (answer?.viewId !== identity.view.id)
            throw new Error("Confirmation expired");
          answer.resolve(input.value === true);
          this.confirmations.delete(input.id);
          return json(null);
        }
      }
      if (path.startsWith("/apps/methods/")) {
        if (!identity.view || !identity.run)
          throw new FnError("forbidden", "View credentials required");
        const cancellation = new AbortController();
        const signal = AbortSignal.any([
          request.signal,
          cancellation.signal,
          identity.view.controller.signal,
          identity.run.controller.signal,
        ]);
        const stream = await this.invoke(
          identity.run,
          decodeURIComponent(path.slice(14)),
          await body(),
          signal,
          identity.view.id,
        );
        if (request.headers.get("accept") !== "text/event-stream") {
          let value: unknown = null;
          for await (const item of stream) value = item;
          return json(value);
        }
        return new Response(
          new ReadableStream<Uint8Array>({
            async pull(controller) {
              try {
                const next = await stream.next();
                if (next.done) {
                  controller.enqueue(encodeSSE(null, "done"));
                  controller.close();
                } else controller.enqueue(encodeSSE(next.value, "data"));
              } catch (error) {
                controller.enqueue(
                  encodeSSE(
                    {
                      code:
                        error instanceof FnError ? error.code : "interrupted",
                      message: String(
                        error instanceof Error ? error.message : error,
                      ),
                    },
                    "error",
                  ),
                );
                controller.close();
              }
            },
            async cancel() {
              cancellation.abort();
              await stream.return();
            },
          }),
          {
            headers: {
              "content-type": "text/event-stream",
              "cache-control": "no-store",
            },
          },
        );
      }
      if (path.startsWith("/apps/") && identity.view) {
        const id = identity.view.instanceId;
        if (path === "/apps/dirty") {
          identity.view.dirty = z
            .object({ dirty: z.boolean() })
            .parse(await body()).dirty;
          this.changed();
          return json(null);
        }
        if (path === "/apps/close") {
          const input = await body();
          await this.close(id, input.force === true);
          return json(null);
        }
        if (path === "/apps/minimize" || path === "/apps/maximize") {
          await this.context.native.windows[
            path.endsWith("minimize") ? "minimize" : "maximize"
          ]({ id: this.windowId(id) });
          return json(null);
        }
      }
      if (!identity.admin)
        throw new FnError(
          "forbidden",
          "Host management requires a host session",
        );
      if (path.startsWith("/summary-preview/")) {
        const value = this.previews.get(path.slice(17));
        if (!value) throw new FnError("not_found", "Preview ended");
        return json(value);
      }
      if (path === "/state") return json(await this.snapshot());
      if (path.startsWith("/platform/"))
        return json(await this.command(path.slice(10), await body()));
      return new Response("Not Found", { status: 404 });
    } catch (error) {
      return errorResponse(error);
    }
  }
  async page(path: string) {
    const [, id, runId, ...rest] = path.slice(1).split("/");
    const installation = this.installation(decodeURIComponent(id!));
    if (runId === "icon" && installation.build.manifest.icon)
      return new Response(
        Bun.file(
          await inside(
            installation.directory,
            installation.build.manifest.icon,
          ),
        ),
        { headers: { "cache-control": "no-store" } },
      );
    const run = this.runs.get(installation.instanceId);
    if (installation.development && runId === "_revision")
      return json({ runId: run?.id ?? null });
    if (
      !run ||
      (run.id !== runId && !(installation.development && runId === "current"))
    )
      return new Response("Application closed. Open it from Fn.", {
        status: 409,
      });
    const file = await inside(
      installation.directory,
      dirname(installation.build.page!) +
        "/" +
        (rest.join("/") || "index.html"),
    );
    const content = Bun.file(file);
    if (file.endsWith(".html"))
      return new Response(
        (await content.text()).replace(
          /<head[^>]*>/i,
          `$&<meta name="fn-run-id" content="${run.id}"><script src="/_fia/browser/runtime.js"></script>`,
        ),
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store",
          },
        },
      );
    return new Response(content, { headers: { "cache-control": "no-store" } });
  }
  async command(action: string, input: any = {}): Promise<any> {
    if (action === "notifications-clear") {
      this.store.document.notifications = [];
      await this.store.save();
      this.changed();
      return null;
    }
    if (action === "summary-preview") {
      const id =
        typeof input.id === "string" && this.previews.has(input.id)
          ? input.id
          : crypto.randomUUID();
      if (this.previews.size >= 32 && !this.previews.has(id))
        throw new FnError("busy", "Too many previews");
      this.previews.set(id, {
        snapshot: parseSummary(input.snapshot),
        name: textValue.parse(input.name ?? "Application"),
        messages: z
          .record(z.string(), z.record(z.string(), z.string()))
          .parse(input.messages ?? {}),
      });
      this.changed();
      const url = this.context.browserURL("/?summary-preview=" + id);
      if (input.openBrowser === true)
        await this.context.native.system.openURL({ url });
      return { id, url };
    }
    if (action === "summary-preview-end") {
      this.previews.delete(input.id);
      this.changed();
      return null;
    }
    if (action === "open")
      return this.open(
        z.string().parse(input.instanceId),
        input.browser === true,
      );
    if (action === "close") {
      await this.close(
        z.string().parse(input.instanceId),
        input.force === true,
      );
      return null;
    }
    if (action === "minimize") {
      await this.context.native.windows.minimize({
        id: this.windowId(z.string().parse(input.instanceId)),
      });
      return null;
    }
    if (action === "desktop") {
      await Promise.allSettled(
        [...this.runs.keys()].map((id) =>
          this.context.native.windows.minimize({ id: this.windowId(id) }),
        ),
      );
      await this.context.native.windows.open({ id: "main" });
      return null;
    }
    if (action === "preferences") {
      const update = z
        .strictObject({
          locale: z.enum(["zh-CN", "en"]).optional(),
          theme: z.enum(["light", "dark", "system"]).optional(),
          desktop: z.array(z.string()).max(200).optional(),
          menu: z.array(z.string()).max(200).optional(),
          defaultModel: z
            .object({ connectionId: z.string(), model: z.string() })
            .optional(),
        })
        .parse(input);
      if (update.desktop)
        update.desktop = this.store.desktopOrder(update.desktop);
      if (update.menu)
        update.menu = [...new Set(update.menu)].filter((id) =>
          this.store.document.installations.some((i) => i.instanceId === id),
        );
      Object.assign(this.store.document.preferences, update);
      await this.store.save();
      for (const view of this.views.values())
        send(view.socket, {
          type: "preferences",
          value: this.store.document.preferences,
        });
      for (const installation of this.store.document.installations)
        if (this.runs.has(installation.instanceId))
          await this.context.native.windows
            .update({
              id: this.windowId(installation.instanceId),
              title: this.appName(installation),
            })
            .catch(() => {});
      await this.context.native.application.setAppearance({
        mode: this.store.document.preferences.theme,
      });
      this.changed();
      return this.store.document.preferences;
    }
    if (action === "login") {
      const url = this.models.signIn(
        this.context.url("/api/fn/auth/callback").href,
        input.connectionId,
      );
      return { url };
    }
    if (action === "logout") {
      const result = await this.models.logout(
        z.string().parse(input.connectionId),
      );
      this.changed();
      return result;
    }
    if (action === "phone-connect") {
      if (!this.phoneAvailable)
        throw new FnError(
          "unavailable",
          "Phone relay is available in development builds only",
        );
      await this.relay.connect();
      this.store.document.preferences.phoneEnabled = true;
      await this.store.save();
      return null;
    }
    if (action === "phone-disconnect") {
      this.relay.disconnect();
      this.store.document.preferences.phoneEnabled = false;
      await this.store.save();
      return null;
    }
    if (action === "phone-cancel") {
      const message = this.relay.store?.get(input.id);
      if (!message || message.status !== "waiting")
        throw new Error("Message cannot be cancelled");
      this.relay.store!.set({ ...message, status: "cancelled" });
      this.changed();
      return null;
    }
    if (action === "install-local") {
      const paths = input.path
        ? [z.string().parse(input.path)]
        : await this.context.native.dialogs.openFiles({ multiple: false });
      if (!paths?.[0]) return null;
      return this.install(await Bun.file(paths[0]).bytes(), undefined, true);
    }
    if (action === "install") {
      const item = (this.catalog as any[]).find(
        (c) => c.id === input.id && c.marketId === input.marketId,
      );
      if (!item) throw new Error("Refresh the application catalog first");
      const bytes = await download(
        item.url,
        (url) => this.checkURL(url),
        64 * 1024 * 1024,
        60_000,
      );
      return this.install(bytes, item, true);
    }
    if (action === "install-confirm") {
      const id = z.string().parse(input.confirmationId);
      const installation = this.pendingInstalls.get(id);
      if (!installation)
        throw new FnError("stale", "Installation confirmation expired");
      this.pendingInstalls.delete(id);
      if (this.installing.has(installation.instanceId))
        throw new FnError("busy", "Application update is in progress");
      this.installing.add(installation.instanceId);
      try {
        await this.close(installation.instanceId, true);
        await this.store.register(installation);
        this.names.set(
          installation.instanceId,
          await this.store.locales(installation),
        );
        this.changed();
        return { instanceId: installation.instanceId };
      } finally {
        this.installing.delete(installation.instanceId);
      }
    }
    if (action === "uninstall") {
      const id = z.string().parse(input.instanceId);
      await this.close(id, input.force === true);
      this.store.document.installations =
        this.store.document.installations.filter((i) => i.instanceId !== id);
      this.store.document.preferences.desktop =
        this.store.document.preferences.desktop.filter((x) => x !== id);
      this.store.document.preferences.menu =
        this.store.document.preferences.menu.filter((x) => x !== id);
      await this.store.clearSummary(id);
      await this.store.save();
      this.changed();
      return null;
    }
    if (action === "market-add") {
      const item = z
        .object({ name: z.string().min(1).max(100), url: z.string().url() })
        .parse(input);
      this.checkURL(item.url);
      this.store.document.markets.push({ id: crypto.randomUUID(), ...item });
      await this.store.save();
      return this.command("market-refresh");
    }
    if (action === "market-refresh") {
      const catalog: any[] = [];
      this.catalogErrors = [];
      for (const market of this.store.document.markets)
        try {
          this.checkURL(market.url);
          const bytes = await download(
            market.url,
            (url) => this.checkURL(url),
            4 * 1024 * 1024,
            15_000,
          );
          const index = z
            .object({
              schema: z.literal(1),
              applications: z
                .array(
                  z.object({
                    id: z.string().regex(/^[a-z][a-z0-9._-]{2,99}$/),
                    version: z.string().regex(/^\d+\.\d+\.\d+$/),
                    name: z.string().max(200),
                    description: z.string().max(2000),
                    url: z.string().url(),
                    sha256: z.string().regex(/^[a-f0-9]{64}$/),
                  }),
                )
                .max(1000),
            })
            .parse(JSON.parse(new TextDecoder().decode(bytes)));
          for (const item of index.applications) {
            this.checkURL(item.url);
            catalog.push({ ...item, marketId: market.id });
          }
        } catch (error) {
          this.catalogErrors.push(market.name + ": " + String(error));
        }
      this.catalog = catalog;
      this.changed();
      return catalog;
    }
    if (action === "dev-register") {
      const directory = (await Bun.file(
        resolve(input.directory, "fn-build.json"),
      ).exists())
        ? resolve(input.directory)
        : undefined;
      if (!directory) throw new Error("Build the application first");
      const build = await this.store.inspect(directory);
      const instanceId =
        "dev-" +
        new Bun.CryptoHasher("sha256")
          .update(directory)
          .digest("hex")
          .slice(0, 24);
      await this.close(instanceId, true);
      await this.store.register({
        instanceId,
        directory,
        build,
        development: true,
      });
      this.names.set(
        instanceId,
        await this.store.locales(this.installation(instanceId)),
      );
      const result = await this.open(instanceId, input.browser === true);
      if (input.openBrowser === true && typeof result.url === "string")
        await this.context.native.system.openURL({ url: result.url });
      return result;
    }
    if (action === "state") return this.snapshot();
    throw new FnError("not_found", "Unknown platform command");
  }
  private checkURL(value: string) {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      !(
        url.protocol === "https:" ||
        (this.context.app.mode === "development" &&
          url.protocol === "http:" &&
          url.hostname === "127.0.0.1")
      )
    )
      throw new Error("Expected HTTPS URL");
  }
  private async install(
    bytes: Uint8Array,
    expected?: any,
    interactive = false,
  ) {
    // Inspect identity before replacing an installation. Running applications must be explicitly closed.
    if (!interactive && expected?.id && this.runs.has(expected.id))
      throw new FnError("busy", "Close the application before updating");
    let installing: string | undefined;
    let waiting: Installation | undefined;
    try {
      const result = await this.store.install(
        bytes,
        expected,
        (installation) => {
          if (
            interactive &&
            this.runs.has(installation.instanceId) &&
            !this.installing.has(installation.instanceId)
          ) {
            waiting = installation;
            throw new FnError("busy", "Close the application before updating");
          }
          if (
            this.runs.has(installation.instanceId) ||
            this.installing.has(installation.instanceId)
          )
            throw new FnError("busy", "Close the application before updating");
          installing = installation.instanceId;
          this.installing.add(installing);
        },
      );
      this.names.set(result.instanceId, await this.store.locales(result));
      this.changed();
      return { instanceId: result.instanceId };
    } catch (error) {
      if (!waiting) throw error;
      const confirmationId = crypto.randomUUID();
      this.pendingInstalls.set(confirmationId, waiting);
      while (this.pendingInstalls.size > 16)
        this.pendingInstalls.delete(this.pendingInstalls.keys().next().value!);
      return { confirmationId, instanceId: waiting.instanceId };
    } finally {
      if (installing) this.installing.delete(installing);
    }
  }
}
