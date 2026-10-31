import { nextModules } from "./live-modules.ts";
import { packageName, reconcileEntries } from "../packages/host/src/live-profile.ts";
import * as Cordis from "@deepseek-ai/cordis";
import Loader, { Group } from "@deepseek-ai/cordis-plugin-loader";
import * as Slots from "@deepseek-ai/dsh-client-ui-slots";
import * as Store from "@deepseek-ai/dsh-client-store";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as JSX from "react/jsx-runtime";
import * as JSXDev from "react/jsx-dev-runtime";
import * as FIAClient from "@semicoder/fia/client";
import * as FIAApi from "@semicoder/fia/api";
import * as Client from "@semicoder/fn-sdk/client";
import * as UI from "@semicoder/fn-ui";
import type * as Modules from "@deepseek-ai/dsh-client-modules/client";
import type {
  ClientBundleRegistration,
  ClientModuleLoaderTarget,
} from "@deepseek-ai/dsh-client-modules/client";
import type { ClientBoot } from "../packages/host/src/client-assets.ts";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
const api = FIAClient.createClient();
const container = document.getElementById("root")!;
const shared: Record<string, unknown> = {
  react: React,
  "react/jsx-runtime": JSX,
  "react/jsx-dev-runtime": JSXDev,
  "react-dom": ReactDOM,
  "react-dom/client": ReactDOMClient,
  "@deepseek-ai/cordis": Cordis,
  "@deepseek-ai/dsh-client-ui-slots": Slots,
  "@deepseek-ai/dsh-client-store": Store,
  "@semicoder/fia/api": FIAApi,
  "@semicoder/fia/client": FIAClient,
  "@semicoder/fn-sdk/client": Client,
  "@semicoder/fn-ui": UI,
};
let ctx: Cordis.Context | undefined,
  unmount: (() => void) | undefined,
  epoch = "";
let loading: Promise<void> | undefined;
let current: ClientBoot | undefined;
let modules: Modules.ClientModuleSystem | undefined;
let moduleExports: typeof Modules | undefined;
let synchronizeAPIs: ((value: { namespaces: string[] }) => Promise<void>) | undefined;
const clientId = crypto.randomUUID();
const scriptTargets = new Map<string, ClientModuleLoaderTarget>();
// Each script registers with the engine that requested it, including old factories' lazy chunks.
(
  window as unknown as { __ModuleLoader__: Pick<ClientModuleLoaderTarget, "load"> }
).__ModuleLoader__ = {
  load(entry) {
    const source = (document.currentScript as HTMLScriptElement | null)?.src;
    const target = source && scriptTargets.get(source);
    if (!target) throw new Error("Unowned plugin script registration");
    target.load(entry);
  },
};
function registrationTarget() {
  const pendingQueue: ClientBundleRegistration[] = [];
  return {
    mode: "queue",
    pendingQueue,
    load: (entry: ClientBundleRegistration) => pendingQueue.push(entry),
  } as unknown as ClientModuleLoaderTarget;
}
function ready(manifest: ClientBoot) {
  return api.call("host.ready", {
    epoch: manifest.epoch,
    generationId: manifest.generationId,
    clientId,
  });
}
function failure(error: unknown) {
  container.replaceChildren();
  const page = document.createElement("main");
  page.style.cssText = "padding:40px;font:15px system-ui;max-width:800px;margin:auto";
  const title = document.createElement("h1");
  title.textContent = "fn 插件组合未能启动";
  const detail = document.createElement("pre");
  detail.style.whiteSpace = "pre-wrap";
  detail.textContent = String(error);
  page.append(title, detail);
  for (const [mode, label] of [
    ["previous", "恢复上一个有效组合"],
    ["default", "恢复默认组合"],
  ] as const) {
    const button = document.createElement("button");
    button.textContent = label;
    button.onclick = () => {
      button.disabled = true;
      void api.call("host.recover", { mode }).catch((error) => {
        detail.textContent = String(error);
        button.disabled = false;
      });
    };
    page.append(button);
  }
  const retry = document.createElement("button");
  retry.textContent = "重新连接";
  retry.onclick = () => {
    void boot();
  };
  page.append(retry);
  container.append(page);
}
function loadScript(url: string, target: ClientModuleLoaderTarget) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    scriptTargets.set(script.src, target);
    const finish = (error?: Error) => {
      clearTimeout(timer);
      scriptTargets.delete(script.src);
      script.remove();
      error ? reject(error) : resolve();
    };
    const timer = setTimeout(() => finish(new Error(`模块加载超时：${url}`)), 15000);
    script.onload = () => finish();
    script.onerror = () => finish(new Error(`模块加载失败：${url}`));
    document.head.append(script);
  });
}

function boot() {
  if (loading) return loading;
  const mounted = ctx;
  loading = (async () => {
    const response = await FIAClient.fetchBackend("/api/plugins/boot", {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "后台尚未就绪");
    const manifest = payload as ClientBoot;
    if (ctx && epoch === manifest.epoch && current && modules && moduleExports) {
      if (current.generationId === manifest.generationId) {
        await ready(manifest);
        return;
      }
      try {
        const target = registrationTarget();
        const next = nextModules(
          moduleExports,
          target,
          manifest.boot,
          shared,
          (url) => loadScript(url, target),
          modules,
        );
        const revisions = new Map(modules.manifest.modules.map((row) => [row.id, row.rev]));
        const changed = new Set(
          next.manifest.modules
            .filter((row) => revisions.get(row.id) !== row.rev)
            .map((row) => packageName(row.id)),
        );
        if (changed.has("@deepseek-ai/dsh-client-modules")) throw new Error("启动模块变化需要重启");
        ctx.loader.internal = next as unknown as Loader["internal"];
        await synchronizeAPIs?.({ namespaces: manifest.namespaces ?? [] });
        await reconcileEntries(ctx.loader, current.profile, manifest.profile, changed);
        if (!ctx.get("uiRenderer") || !ctx.slots.entries("root").length)
          throw new Error("组合没有提供 root 布局");
        modules = next;
        current = manifest;
        await ready(manifest);
      } catch (error) {
        await api.call("host.updateFailed", {
          epoch: manifest.epoch,
          generationId: manifest.generationId,
          clientId,
          error: String(error).slice(0, 2000),
        });
      }
      return;
    }
    unmount?.();
    unmount = undefined;
    await ctx?.fiber.dispose();
    ctx = undefined;
    container.textContent = "正在加载插件…";
    const target = registrationTarget();
    const pendingQueue = target.pendingQueue;
    await loadScript(manifest.bootstrap, target);
    const id = "@deepseek-ai/dsh-client-modules";
    const registration = pendingQueue.find((entry) => entry.id === id);
    if (!registration) throw new Error("上游客户端模块未注册");
    const exports = registration.factory(
      Object.assign(
        (name: string) => {
          if (!(name in shared)) throw new Error(`Missing shared module: ${name}`);
          return shared[name];
        },
        { async: async (name: string) => shared[name] },
      ),
    ) as unknown as typeof Modules;
    pendingQueue.splice(pendingQueue.indexOf(registration), 1);
    moduleExports = exports;
    modules = nextModules(exports, target, manifest.boot, shared, (url) => loadScript(url, target));
    const root = new Cordis.Context();
    ctx = root;
    root.provide("platform", { native: FIAClient.native, api });
    const providers = new Map<string, () => void | Promise<void>>();
    const synchronize = async ({ namespaces }: { namespaces: string[] }) => {
      for (const [name, dispose] of providers)
        if (!namespaces.includes(name)) {
          providers.delete(name);
          await dispose();
        }
      for (const name of namespaces)
        if (!providers.has(name)) providers.set(name, root.provide(`api:${name}`, true));
    };
    synchronizeAPIs = synchronize;
    await synchronize({ namespaces: manifest.namespaces ?? [] });
    root.effect(() =>
      api.on("host.apis", (payload) => {
        void synchronize(payload as { namespaces: string[] });
      }),
    );
    await root.plugin(Loader);
    root.loader.internal = modules as unknown as Loader["internal"];
    root.loader.builtins.group = Group;
    await root.loader.root.update(manifest.profile);
    await root.loader.await();
    const failed = [...root.loader.entries()].filter(
      (entry) => !entry.disabled && (!entry.fiber || entry.fiber.state === 3),
    );
    if (failed.length) {
      const details = await Promise.all(
        failed.map(async (entry) => {
          try {
            await entry.fiber?.await();
          } catch (error) {
            return `${entry.id}: ${String(error)}`;
          }
          return `${entry.id}: ${modules?.importError(entry.options.name) ?? "插件未创建"}`;
        }),
      );
      throw new Error(`未能激活插件：\n${details.join("\n")}`);
    }
    if (!root.get("uiRenderer") || !root.slots.entries("root").length)
      throw new Error("组合没有提供 root 布局");
    // The upstream renderer contains React errors at slot boundaries. A broken
    // root must still expose host recovery, independently of any UI plugin.
    const observer = new MutationObserver(() => {
      const failedRoot = container.querySelector('[data-slot-error="root"]');
      if (!failedRoot || ctx !== root) return;
      const message = failedRoot.textContent || "root 布局渲染失败";
      observer.disconnect();
      unmount?.();
      unmount = undefined;
      ctx = undefined;
      void root.fiber.dispose().finally(async () => {
        failure(message);
        await FIAClient.native.ready();
      });
    });
    root.effect(() => {
      observer.observe(container, { childList: true, subtree: true });
      return () => observer.disconnect();
    });
    container.replaceChildren();
    unmount = root.uiRenderer.mount(container);
    epoch = manifest.epoch;
    current = manifest;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    if (ctx !== root) return;
    await ready(manifest);
    await FIAClient.native.ready();
  })()
    .catch(async (error) => {
      // A missed poll or transient transport error must not erase a mounted page.
      if (ctx && ctx === mounted && current && epoch === current.epoch) return;
      unmount?.();
      unmount = undefined;
      await ctx?.fiber.dispose();
      ctx = undefined;
      failure(error);
      await FIAClient.native.ready();
    })
    .finally(() => {
      loading = undefined;
    });
  return loading;
}
api.on("host.composition", () => {
  void boot();
});
// Also recover a missed event or a background tab without rebuilding unchanged UI.
setInterval(() => {
  void boot();
}, 3000);
api.onReconnect(() => {
  void boot();
});
void boot();
