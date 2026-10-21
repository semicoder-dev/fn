import * as Cordis from "@deepseek-ai/cordis";
import { Context, Service, type Fiber, type Plugin } from "@deepseek-ai/cordis";
import * as React from "react";
import * as JSX from "react/jsx-runtime";
import * as JSXDev from "react/jsx-dev-runtime";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as UI from "./ui.tsx";
import * as Cards from "./card-contract.ts";
import type { Json } from "./cordis.ts";

/** The transport is supplied by the desktop host; the SDK owns no connection. */
export type RuntimeCall = (method: string, params: Record<string, unknown>) => Promise<unknown>;
export interface RuntimePage<T> { items: T[]; nextOffset: number; hasMore: boolean; }

/** Follow bounded RPC pages without silently truncating a model/KV/session list. */
export async function readAllPages<T>(
  load: (offset: number, limit: number) => Promise<RuntimePage<T>>,
): Promise<T[]> {
  const values: T[] = [];
  let offset = 0;
  while (true) {
    const page = await load(offset, 100);
    if (!page || !Array.isArray(page.items) || typeof page.hasMore !== "boolean"
      || !Number.isSafeInteger(page.nextOffset) || page.nextOffset !== offset + page.items.length
      || (page.hasMore && !page.items.length))
      throw new Error("Invalid runtime list page: cursor did not advance");
    values.push(...page.items);
    if (!page.hasMore) return values;
    offset = page.nextOffset;
  }
}

export interface ClientPage {
  /** Retain UI state while hidden in the current window; defaults to false. */
  keepAlive?: boolean;
  id: string;
  title: string;
  component: React.ComponentType;
}
export interface RegisteredClientPage extends ClientPage {
  appId: string;
  /** Stable across page mounts; unique across applications. */
  key: string;
}
export interface ClientApplication {
  readonly context: Readonly<{ appId: string }>;
  call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
  /** Read every bounded list page. Transport failures reject rather than return a partial list. */
  list<T>(method: string, params?: Record<string, unknown>): Promise<T[]>;
  invoke<T extends Json = Json>(name: string, args?: Json): Promise<T>;
  readonly kv: {
    get<T extends Json = Json>(key: string): Promise<T | null>;
    set(key: string, value: Json): Promise<void>;
    delete(key: string): Promise<void>;
    list(): Promise<{ key: string; value: Json }[]>;
  };
  /** The page is automatically removed when its owning Cordis plugin is disposed. */
  page(definition: ClientPage): () => void;
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    clientApp: ClientApplication;
  }
}

interface ClientSlot {
  appId: string;
  owner: Fiber;
  pages: Map<string, RegisteredClientPage>;
}
interface ClientServiceOptions {
  slot: ClientSlot;
  call: RuntimeCall;
  changed: () => void;
}
class ClientApplicationService extends Service implements ClientApplication {
  readonly context: ClientApplication["context"];
  readonly kv: ClientApplication["kv"];
  constructor(ctx: Context, private options: ClientServiceOptions) {
    super(ctx, "clientApp");
    const appId = options.slot.appId;
    this.context = Object.freeze({ appId });
    this.kv = Object.freeze({
      get: <T extends Json = Json>(key: string) =>
        this.call<T | null>("apps.kv.get", { appId, key }),
      set: async (key: string, value: Json) => {
        await this.call("apps.kv.set", { appId, key, value });
      },
      delete: async (key: string) => {
        await this.call("apps.kv.delete", { appId, key });
      },
      list: () => this.list<{ key: string; value: Json }>("apps.kv.list", { appId }),
    });
  }
  call<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    this.ctx.fiber.assertActive();
    return this.options.call(method, params) as Promise<T>;
  }
  invoke<T extends Json = Json>(name: string, args: Json = null): Promise<T> {
    return this.call<T>("apps.invoke", { appId: this.context.appId, name, args });
  }
  list<T>(method: string, params: Record<string, unknown> = {}): Promise<T[]> {
    return readAllPages<T>((offset, limit) => this.call<RuntimePage<T>>(method, { ...params, offset, limit }));
  }
  page(definition: ClientPage): () => void {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(definition.id)) throw new Error("Invalid page id");
    if (!definition.title.trim()) throw new Error("Page title is required");
    const { slot, changed } = this.options;
    if (slot.pages.has(definition.id)) throw new Error(`Page ${definition.id} is already registered`);
    const page = Object.freeze({
      ...definition,
      appId: slot.appId,
      key: `${slot.appId}:${definition.id}`,
    });
    return this.ctx.effect(() => {
      slot.pages.set(page.id, page);
      changed();
      return () => {
        if (slot.pages.get(page.id) === page) slot.pages.delete(page.id);
        changed();
      };
    });
  }
}

export interface BrowserHostOptions {
  call: RuntimeCall;
  onPagesChanged?: (pages: readonly RegisteredClientPage[]) => void;
}

/** A single browser Cordis kernel, with one clientApp service scope per application. */
export class BrowserPluginHost {
  readonly ctx = new Context();
  private readonly slots = new Map<string, ClientSlot>();
  private readonly loading = new Set<string>();
  private closed = false;

  constructor(private options: BrowserHostOptions) {
    installBrowserModules();
  }
  pages(): readonly RegisteredClientPage[] {
    return [...this.slots.values()].flatMap((slot) => [...slot.pages.values()]);
  }
  private changed = () => {
    this.options.onPagesChanged?.(this.pages());
  };
  async load(appId: string, plugin: Plugin, config: Record<string, unknown> = {}): Promise<void> {
    if (this.closed) throw new Error("Browser plugin host is closed");
    if (!/^[a-z][a-z0-9-]{0,99}$/.test(appId)) throw new Error("Invalid application id");
    if (this.slots.has(appId) || this.loading.has(appId))
      throw new Error(`Application ${appId} is already loaded`);
    this.loading.add(appId);
    let owner: Fiber | undefined;
    try {
      owner = await this.ctx.plugin({ name: `client:${appId}`, apply() {} });
      const slot: ClientSlot = { appId, owner, pages: new Map() };
      this.slots.set(appId, slot);
      const scope = owner.ctx.isolate("clientApp");
      await scope.plugin(ClientApplicationService, { slot, call: this.options.call, changed: this.changed });
      await scope.plugin(plugin, config);
    } catch (error) {
      await owner?.dispose();
      this.slots.delete(appId);
      throw error;
    } finally {
      this.loading.delete(appId);
      this.changed();
    }
  }
  async unload(appId: string): Promise<void> {
    if (this.loading.has(appId)) throw new Error(`Application ${appId} is loading`);
    const slot = this.slots.get(appId);
    if (!slot) return;
    await slot.owner.dispose();
    this.slots.delete(appId);
    this.changed();
  }
  async dispose(): Promise<void> {
    this.closed = true;
    await this.ctx.fiber.dispose();
    this.slots.clear();
    this.changed();
  }
}
export function createBrowserHost(options: BrowserHostOptions): BrowserPluginHost {
  return new BrowserPluginHost(options);
}

type SharedModule = Record<string, unknown>;
declare global {
  // A compiled application reads these module namespaces instead of bundling a second copy.
  var __FN_CORDIS_MODULES__: Readonly<Record<string, SharedModule>> | undefined;
}

/** Must run before importing a built application's ./client entry. */
export function installBrowserModules(): void {
  const existing = globalThis.__FN_CORDIS_MODULES__;
  if (existing) {
    if (existing.react !== React || existing["@deepseek-ai/cordis"] !== Cordis)
      throw new Error("The browser already has a different fn runtime");
    return;
  }
  globalThis.__FN_CORDIS_MODULES__ = Object.freeze({
    react: React,
    "react/jsx-runtime": JSX,
    "react/jsx-dev-runtime": JSXDev,
    "react-dom": ReactDOM,
    "react-dom/client": ReactDOMClient,
    "@deepseek-ai/cordis": Cordis,
    "@semicoder/fn-sdk/ui": UI,
      "@semicoder/fn-sdk/cards": Cards,
    "@semicoder/fn-sdk/cordis-client": {
      BrowserPluginHost, createBrowserHost, installBrowserModules, readAllPages,
    },
  });
}
