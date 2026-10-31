import type { Contract, Input, Output } from "./contract.ts";
import type {
  ViewBootstrap,
  Preferences,
  Model,
  ResponseRequest,
  ResponseEvent,
} from "./types.ts";
import { FnError } from "./types.ts";
import { readSSE, readResponses } from "./sse.ts";
interface BrowserTransport {
  request(path: string, init?: RequestInit): Promise<Response>;
  onEnd(listener: () => void): () => void;
}
declare global {
  interface Window {
    fiaTransport?: BrowserTransport;
  }
}
export const requestHost = (path: string, init?: RequestInit) =>
  window.fiaTransport?.request(path, init) ??
  fetch(path, { ...init, credentials: "same-origin" });
export async function openHostSocket(path: string) {
  let url = new URL(path, location.href);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  if (window.fiaTransport) {
    const response = await requestHost("/_fia/browser/socket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) throw new Error("Browser session ended");
    url = new URL((await response.json()).url);
  }
  const socket = new WebSocket(url);
  const off = window.fiaTransport?.onEnd(() => socket.close());
  if (off) socket.addEventListener("close", off, { once: true });
  return socket;
}
export async function jsonHost(
  path: string,
  body?: unknown,
  headers?: HeadersInit,
  signal?: AbortSignal,
) {
  const response = await requestHost("/api/fn/v1" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      ...Object.fromEntries(new Headers(headers)),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const value = await response.json();
  if (!response.ok)
    throw new FnError(
      value.code ?? "request_failed",
      value.message ?? "Request failed",
    );
  return value;
}
export class ViewClient<C extends Contract> extends EventTarget {
  bootstrap?: ViewBootstrap;
  ready: Promise<void>;
  #socket?: WebSocket;
  #closed = false;
  #unsaved = new Set<string>();
  #dirtyWrite = Promise.resolve<unknown>(undefined);
  #lifetime = new AbortController();
  constructor(readonly contract: C) {
    super();
    this.ready = this.#connect();
    window.addEventListener("pagehide", () => this.dispose(), { once: true });
    window.addEventListener("beforeunload", (event) => {
      if (!this.#closed && this.#unsaved.size) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }
  async #connect() {
    const instanceId = new URL(location.href).searchParams.get("app");
    if (!instanceId) throw new Error("Open this page through Fn");
    const pathRun =
      location.pathname.match(/\/pages\/[^/]+\/(run-[^/]+)\//)?.[1] ??
      document.querySelector<HTMLMetaElement>('meta[name="fn-run-id"]')
        ?.content;
    this.bootstrap = await jsonHost("/views", {
      instanceId,
      runId: pathRun,
      windowId:
        new URL(location.href).searchParams.get("fiaWindow") ?? undefined,
    });
    await this.#events();
    const query = new URLSearchParams(location.search);
    await requestHost("/_fia/ready", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        windowId: query.get("fiaWindow") ?? "main",
        generation: query.get("fiaGeneration"),
        ...(query.get("fiaBrowser") === "1" ? { browser: true } : {}),
      }),
    });
  }
  async #events() {
    if (this.#closed || !this.bootstrap) return;
    this.#socket = await openHostSocket(
      "/api/fn/v1/events?view=" + encodeURIComponent(this.bootstrap.token),
    );
    this.#socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "preferences") {
        this.bootstrap!.preferences = message.value;
      }
      if (message.type === "stale") {
        this.dispose();
        this.dispatchEvent(new CustomEvent("stale"));
        this.#developmentReload();
        return;
      }
      this.dispatchEvent(
        new CustomEvent(message.type, { detail: message.value }),
      );
    };
    this.#socket.onclose = () => {
      if (this.#closed) return;
      this.#lifetime.abort();
      const reconnect = async () => {
        if (this.#closed) return;
        try {
          const previous = this.bootstrap!;
          this.bootstrap = await jsonHost("/views", {
            instanceId: previous.instanceId,
            runId: previous.runId,
          });
          this.#lifetime = new AbortController();
          await this.#events();
          this.dispatchEvent(new Event("reconnected"));
        } catch (error) {
          if (
            error instanceof FnError &&
            ["stale", "not_running"].includes(error.code)
          ) {
            this.dispose();
            this.dispatchEvent(new Event("stale"));
            this.#developmentReload();
          } else setTimeout(reconnect, 1500);
        }
      };
      setTimeout(reconnect, 500);
    };
  }
  #developmentReload() {
    if (!location.pathname.match(/^\/pages\/dev-[^/]+\/current\//)) return;
    const previous = this.bootstrap?.runId;
    const poll = async () => {
      try {
        const url = location.pathname.replace(/current\/.*$/, "_revision/");
        const response = await fetch(url, { cache: "no-store" });
        if (response.ok) {
          const next = await response.json();
          if (next.runId && next.runId !== previous) {
            location.reload();
            return;
          }
        }
      } catch {}
      setTimeout(poll, 750);
    };
    setTimeout(poll, 750);
  }
  models = {
    list: (): Promise<Model[]> => this.request("/models"),
    default: (): Promise<Model> => this.request("/models/default"),
    responses: (
      body: ResponseRequest,
      options: { connectionId: string; signal?: AbortSignal },
    ) => this.#responses(body, options),
  };
  async *#responses(
    body: ResponseRequest,
    options: { connectionId: string; signal?: AbortSignal },
  ): AsyncGenerator<ResponseEvent> {
    await this.ready;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      this.#lifetime.signal,
      ...(options.signal ? [options.signal] : []),
    ]);
    try {
      const response = await requestHost("/api/fn/v1/responses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-fn-view": this.bootstrap!.token,
          "x-fn-connection": options.connectionId,
        },
        body: JSON.stringify(body),
        signal,
      });
      yield* readResponses(response, signal);
    } finally {
      controller.abort();
    }
  }
  async request(path: string, body?: unknown, signal?: AbortSignal) {
    await this.ready;
    return jsonHost(
      path,
      body,
      { "x-fn-view": this.bootstrap!.token },
      AbortSignal.any([this.#lifetime.signal, ...(signal ? [signal] : [])]),
    );
  }
  async call<K extends keyof C & string>(
    name: K,
    input: Input<C[K]>,
    options?: { signal?: AbortSignal },
  ): Promise<Output<C[K]>> {
    this.contract[name]!.input.parse(input);
    return this.contract[name]!.output.parse(
      await this.request(
        "/apps/methods/" + encodeURIComponent(name),
        input,
        options?.signal,
      ),
    ) as Output<C[K]>;
  }
  async *stream<K extends keyof C & string>(
    name: K,
    input: Input<C[K]>,
    options?: { signal?: AbortSignal },
  ): AsyncGenerator<Output<C[K]>> {
    await this.ready;
    this.contract[name]!.input.parse(input);
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      this.#lifetime.signal,
      ...(options?.signal ? [options.signal] : []),
    ]);
    let completed = false;
    try {
      const response = await requestHost(
        "/api/fn/v1/apps/methods/" + encodeURIComponent(name),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-fn-view": this.bootstrap!.token,
            accept: "text/event-stream",
          },
          body: JSON.stringify(input),
          signal,
        },
      );
      for await (const frame of readSSE(response, signal)) {
        const message = frame.data as any;
        if (frame.event === "error")
          throw new FnError(message.code, message.message);
        if (frame.event === "done") completed = true;
        else if (frame.event === "data")
          yield this.contract[name]!.output.parse(message) as Output<C[K]>;
      }
      if (!completed)
        throw new FnError("interrupted", "Application stream interrupted");
    } finally {
      controller.abort();
    }
  }
  ui = {
    toast: async (text: string) => {
      await this.ready;
      this.dispatchEvent(new CustomEvent("toast", { detail: { text } }));
    },
    confirm: async (text: string): Promise<boolean> => {
      await this.ready;
      return new Promise((resolve) => {
        this.dispatchEvent(
          new CustomEvent("confirm", { detail: { text, resolve } }),
        );
      });
    },
  };
  get hasUnsavedChanges() {
    return this.#unsaved.size > 0;
  }
  application = {
    setUnsavedChanges: (dirty: boolean, scope = "page") => {
      if (dirty) this.#unsaved.add(scope);
      else this.#unsaved.delete(scope);
      const value = this.#unsaved.size > 0;
      this.#dirtyWrite = this.#dirtyWrite
        .catch(() => {})
        .then(() =>
          this.#closed
            ? undefined
            : this.request("/apps/dirty", { dirty: value }),
        );
      return this.#dirtyWrite;
    },
    close: async () => {
      if (this.hasUnsavedChanges) {
        this.dispatchEvent(new Event("closeRequested"));
        return;
      }
      try {
        await this.request("/apps/close", {});
      } catch (error) {
        if (error instanceof FnError && error.code === "busy")
          this.dispatchEvent(new Event("closeRequested"));
        else if (!this.#closed) throw error;
      }
    },
    minimize: () => this.request("/apps/minimize", {}),
    maximize: () => this.request("/apps/maximize", {}),
  };
  dispose() {
    if (this.#closed) return;
    this.#closed = true;
    this.#lifetime.abort();
    this.#socket?.close();
    this.dispatchEvent(new Event("disposed"));
  }
  get preferences(): Preferences | undefined {
    return this.bootstrap?.preferences;
  }
}
export function connectView<const C extends Contract>(contract: C) {
  return new ViewClient(contract);
}
