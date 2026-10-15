import { createSourceContext, webSearch, webFetchResult } from "agent-webtool";
import type {
  WebClient,
  WebFetchInput,
  WebSearchInput,
  WebTask,
  WebOptions,
} from "@semicoder/fn-sdk/types";
import {
  webFetchInput,
  webSearchInput,
  webFetchResult as fetchResultSchema,
  webSearchResult,
} from "../shared/web";

export class WebError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "WebError";
  }
}
type Slot = { task: WebTask; controller: AbortController; done: Promise<void> };
export interface WebServices {
  search: typeof webSearch;
  fetch: typeof webFetchResult;
  now: () => number;
}
/** Short-lived task storage. Never writes platform.json or shares citation state. */
export class WebTools {
  private active = new Map<string, Slot>();
  private terminal = new Map<string, WebTask>();
  private stopping = false;
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private changed: (task: WebTask) => void,
    private services: WebServices = { search: webSearch, fetch: webFetchResult, now: Date.now },
  ) {}
  busy(pluginId?: string) {
    return [...this.active.values()].some((slot) => !pluginId || slot.task.pluginId === pluginId);
  }
  private prune() {
    clearTimeout(this.cleanupTimer);
    for (const [id, task] of this.terminal)
      if (this.services.now() - task.updatedAt >= 600_000) this.terminal.delete(id);
    while (this.terminal.size > 32) this.terminal.delete(this.terminal.keys().next().value!);
    if (this.terminal.size) {
      const next = Math.min(...[...this.terminal.values()].map((task) => task.updatedAt)) + 600_000;
      this.cleanupTimer = setTimeout(() => this.prune(), Math.max(1, next - this.services.now()));
      this.cleanupTimer.unref();
    }
  }
  get(pluginId: string, id: string): WebTask {
    this.prune();
    const task = this.active.get(id)?.task ?? this.terminal.get(id);
    if (!task || task.pluginId !== pluginId)
      throw new WebError("not_found", "网络任务不存在或已过期");
    return structuredClone(task);
  }
  start(pluginId: string, kind: "search", input: WebSearchInput): WebTask;
  start(pluginId: string, kind: "fetch", input: WebFetchInput): WebTask;
  start(pluginId: string, kind: WebTask["kind"], input: WebSearchInput | WebFetchInput): WebTask {
    if (this.stopping) throw new WebError("stopping", "应用正在退出");
    if (this.active.size >= 8) throw new WebError("busy", "最多同时运行 8 个网络任务");
    const parsed = kind === "search" ? webSearchInput.parse(input) : webFetchInput.parse(input);
    this.prune();
    const now = this.services.now();
    const task: WebTask = {
      id: crypto.randomUUID(),
      pluginId,
      kind,
      status: "running",
      result: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };
    const slot: Slot = { task, controller: new AbortController(), done: Promise.resolve() };
    this.active.set(task.id, slot);
    slot.done = Promise.resolve().then(() => this.perform(slot, parsed));
    this.changed(structuredClone(task));
    return structuredClone(task);
  }
  private async perform(slot: Slot, input: WebSearchInput | WebFetchInput) {
    const { task, controller } = slot;
    const timeout = setTimeout(
      () => controller.abort(new WebError("timeout", "网络任务超过 120 秒")),
      120_000,
    );
    try {
      const deps = { signal: controller.signal, sources: createSourceContext() };
      controller.signal.throwIfAborted();
      const result =
        task.kind === "search"
          ? webSearchResult.parse(
              await this.waitForOperation(
                this.services.search(input as WebSearchInput, deps),
                controller.signal,
              ),
            )
          : fetchResultSchema.parse(
              await this.waitForOperation(
                this.services.fetch(input as WebFetchInput, deps),
                controller.signal,
              ),
            );
      controller.signal.throwIfAborted();
      if (Buffer.byteLength(JSON.stringify(result)) > 256 * 1024)
        throw new WebError("result_too_large", "网络结果超过 256 KiB，请减少结果数或 maxBytes");
      task.result = result;
      task.status = "completed";
    } catch (caught) {
      const error = controller.signal.aborted ? controller.signal.reason : caught;
      task.status =
        controller.signal.aborted && error?.name === "AbortError" ? "cancelled" : "failed";
      task.error =
        task.status === "cancelled"
          ? null
          : {
              code: error && typeof error.code === "string" ? error.code : "network_error",
              message: (error instanceof Error ? error.message : String(error)).slice(0, 2000),
            };
    } finally {
      clearTimeout(timeout);
      task.updatedAt = this.services.now();
      this.active.delete(task.id);
      this.terminal.set(task.id, structuredClone(task));
      this.prune();
      this.changed(structuredClone(task));
    }
  }
  private waitForOperation<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
    return new Promise((resolve, reject) => {
      const cleanup = () => signal.removeEventListener("abort", abort);
      const abort = () => {
        cleanup();
        reject(signal.reason);
      };
      signal.addEventListener("abort", abort, { once: true });
      operation.then(
        (value) => {
          cleanup();
          resolve(value);
        },
        (error) => {
          cleanup();
          reject(error);
        },
      );
      if (signal.aborted) abort();
    });
  }
  async cancel(pluginId: string, id: string) {
    const task = this.get(pluginId, id);
    const slot = this.active.get(id);
    if (!slot) return task;
    slot.controller.abort();
    await slot.done;
    return structuredClone(slot.task);
  }
  client(pluginId: string): WebClient {
    const call = async (
      kind: WebTask["kind"],
      input: WebSearchInput | WebFetchInput,
      { signal }: WebOptions = {},
    ) => {
      signal?.throwIfAborted();
      const task =
        kind === "search"
          ? this.start(pluginId, kind, input as WebSearchInput)
          : this.start(pluginId, kind, input as WebFetchInput);
      const slot = this.active.get(task.id)!;
      const abort = () => slot.controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      try {
        if (signal?.aborted) abort();
        await slot.done;
        signal?.throwIfAborted();
        if (slot.task.status === "cancelled")
          throw new DOMException("网络任务已取消", "AbortError");
        if (slot.task.error) throw new WebError(slot.task.error.code, slot.task.error.message);
        return slot.task.result!;
      } finally {
        signal?.removeEventListener("abort", abort);
      }
    };
    return {
      search: (input, options) => call("search", input, options) as ReturnType<WebClient["search"]>,
      fetch: (input, options) => call("fetch", input, options) as ReturnType<WebClient["fetch"]>,
    };
  }
  clear(pluginId: string) {
    for (const [id, task] of this.terminal)
      if (task.pluginId === pluginId) this.terminal.delete(id);
  }
  async stop() {
    this.stopping = true;
    const slots = [...this.active.values()];
    for (const slot of slots) slot.controller.abort();
    await Promise.allSettled(slots.map((slot) => slot.done));
    this.terminal.clear();
    clearTimeout(this.cleanupTimer);
  }
}
