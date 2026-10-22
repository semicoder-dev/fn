import { defineBackend, implementAPI } from "@semicoder/fia/backend";
import { createSourceContext, webSearch, webFetchResult } from "agent-webtool";
import { join, dirname, relative, isAbsolute, sep } from "node:path";
import { mkdir, readFile, rename, writeFile, realpath } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import api, { runtimeConnection } from "../shared/runtime-api";
import type { GenerationPhase } from "../packages/runtime/src/generation-progress";
import { GenerationManager, materializeRuntimeSeed, type Generation } from "../packages/runtime/src/generations";
import { boundedPage, checkedKvValue } from "../packages/runtime/src/limits";
import type { FnRuntime, Json, AssistantStreamFrame } from "../packages/runtime/src/index";
import type { ConnectionProfile, ConnectionInfo } from "../packages/runtime/src/connections";
import { RuntimeProduct } from "./runtime-product";
import { RuntimeAuth } from "./runtime-auth";
import { SessionChatService } from "./chat-next/service";

let runtime: FnRuntime;
let generations: GenerationManager;
let active: Generation;
let auth: RuntimeAuth;
let chat: SessionChatService;
let product: RuntimeProduct;
let setAppearance: (input: Parameters<RuntimeProduct["appearance"]>[0]) => ReturnType<RuntimeProduct["appearance"]>;
let dataDirectory = "";
let installing = false;
let installPhase: GenerationPhase | null = null;
let pending = false;
let switching = false;
let reloadRequested = false;
let updateError: string | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
let settings: { disabled: string[] } = { disabled: [] };
let project: (id: string, offset: number, limit: number) => Promise<Json>;
let change: (kind: string) => void = () => {};
let reloadSeed: (input: { epoch: string; seedId: string }) => Promise<{ accepted: boolean; reason?: string }> =
  async () => ({ accepted: false, reason: "后台尚未就绪" });
let restartBackend: () => Promise<void>;
class RestartDeferred extends Error {}

function status() {
  return { id: active?.id ?? "", pending: pending || reloadRequested, installing, phase: installPhase, error: updateError };
}
function connectionSummary(value: ConnectionInfo) {
  // Provider profiles can contain a whole model catalog. The list is a summary,
  // so a large catalog cannot push the initial UI snapshot past FIA's 1 MiB cap.
  return runtimeConnection.parse({ ...value, profile: typeof value.profile.baseURL === "string" ? { baseURL: value.profile.baseURL.slice(0, 4096) } : {} });
}
function writable() {
  if (switching || !runtime) throw new Error("后台正在切换，请等待重连");
}
function kv(appId: string) { runtime.application(appId); return runtime.store.kv(appId); }
async function saveSettings() {
  const target = join(dataDirectory, "settings.json");
  const tmp = `${target}.${crypto.randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(settings), { mode: 0o600 });
  await rename(tmp, target);
}
function progress(phase: GenerationPhase) {
  if (!installing || installPhase === phase) return;
  installPhase = phase;
  change("generation");
}
function stage(operation: () => Promise<Generation>, phase: GenerationPhase = "download") {
  writable();
  if (installing || switching) throw new Error("已有安装正在进行");
  installing = true;
  installPhase = phase;
  updateError = null;
  change("generation");
  void operation().then(() => { pending = true; }, error => {
    updateError = String(error).slice(0, 2000);
  }).finally(() => { installing = false; installPhase = null; change("generation"); });
  return status();
}
async function applyPending() {
  if ((!pending && !reloadRequested) || installing || switching || runtime.busy() || chat.busy() || product.busy()) return;
  const backendOnly = !pending && reloadRequested;
  try {
    if (pending) {
      const result = await generations.activateWhenIdle();
      pending = result.pending;
      if (result.activated) reloadRequested = false;
    } else {
      reloadRequested = false;
      await restartBackend();
    }
  } catch (error) {
    switching = false;
    if (error instanceof RestartDeferred || (error as { code?: string })?.code === "update_busy") {
      pending = Boolean((await generations.status()).pendingId);
      reloadRequested ||= backendOnly;
      change("generation");
      return;
    }
    updateError = String(error).slice(0, 2000);
    // Explicit retry after a failed switch avoids a tight restart loop.
    pending = false;
    reloadRequested = false;
    change("generation");
  }
}

export default defineBackend({
  api: implementAPI(api, {
    "cards.list": ({ sessionId, offset, limit }) => boundedPage(runtime.cards(sessionId), offset, limit),
    "cards.respond": async ({ sessionId, cardId, actionId, values }) => { writable(); await runtime.respondCard(sessionId, cardId, actionId, values); return null; },
    "appearance.get": () => product.value.appearance,
    "appearance.set": input => { writable(); return setAppearance(input); },
    "models.saved": ({ offset, limit }) => boundedPage(product.value.models.filter(model => runtime.connections.list().some(connection => connection.id === model.connectionId)), offset, limit),
    "models.select": async ({ connectionId, modelId, selected }) => {
      writable();
      const model = selected ? (await runtime.connections.listModels(connectionId)).find(model => model.id === modelId) : undefined;
      if (selected && !model) throw new Error("模型不在此连接的可用目录中，请刷新目录");
      await product.update(draft => {
        draft.models = draft.models.filter(model => model.connectionId !== connectionId || model.id !== modelId);
        if (model) draft.models.push({ connectionId, id: model.id, name: model.name ?? model.id });
      }); return null;
    },
    "market.list": () => product.listMarkets(),
    "market.add": async ({ name, url }) => { writable(); await product.addMarket(name, url); return null; },
    "market.change": async ({ id, ...patch }) => { writable(); await product.update(draft => {
      const source = draft.markets.find(source => source.id === id); if (!source) throw new Error("市场源不存在");
      Object.assign(source, patch);
    }); return null; },
    "market.remove": async ({ id }) => { writable(); await product.update(draft => { draft.markets = draft.markets.filter(source => source.id !== id); }); return null; },
    "market.refresh": ({ id }) => { writable(); void product.refresh(id).catch(() => {}); return null; },
    "market.catalog": ({ query, offset, limit }) => boundedPage(product.catalog(active.applications, active.manifest.coreVersions)
      .filter(entry => `${entry.name} ${entry.description} ${entry.packageName}`.toLowerCase().includes(query.toLowerCase())), offset, limit),
    "market.install": ({ marketId, appId }) => stage(async () => {
      const { entry, origin } = await product.resolve(marketId, appId, active.applications, active.manifest.coreVersions);
      return generations.stageInstall(entry.url, { expected: entry, origin });
    }, "catalog"),
    "apps.update": ({ appId }) => stage(async () => {
      const app = active.applications.find(app => app.id === appId);
      if (!app?.origin) throw new Error("此应用未记录安装来源，请从地址安装新版归档");
      if (app.origin.marketId) {
        progress("catalog");
        const { entry, origin } = await product.resolve(app.origin.marketId, appId, active.applications, active.manifest.coreVersions);
        return generations.stageInstall(entry.url, { expected: entry, origin });
      }
      return generations.stageInstall(app.origin.source, { updating: app, origin: app.origin });
    }),
    "runtime.status": () => ({ epoch: runtime.epoch, seedId: active.manifest.seedId,
      busy: runtime.busy() || chat.busy() || product.busy() || installing || switching, generation: status(), dataDirectory }),
    "runtime.reloadSeed": input => reloadSeed(input),
    "runtime.applyUpdate": () => { writable(); pending = true; updateError = null; return status(); },
    "apps.list": () => runtime.applications().map(app => ({
      ...app, origin: active.applications.find(value => value.id === app.id)?.origin, ...(app.client ? { clientURL: `/api/app-assets/${active.id}/${app.id}/client.js` } : {}),
    })),
    "apps.install": ({ source }) => stage(() => generations.stageInstall(source)),
    "apps.remove": ({ appId }) => stage(() => generations.stageRemove(appId), "copy"),
    "apps.enable": async ({ appId, enabled }) => {
      writable();
      if (enabled) { await runtime.enable(appId); settings.disabled = settings.disabled.filter(id => id !== appId); }
      else { await runtime.unload(appId); settings.disabled = [...new Set([...settings.disabled, appId])]; }
      await saveSettings();
      return null;
    },
    "apps.invoke": ({ appId, name, args }) => { writable(); return runtime.invoke(appId, name, args); },
    "apps.kv.get": ({ appId, key }) => checkedKvValue(kv(appId).get(key) ?? null),
    "apps.kv.set": ({ appId, key, value }) => { writable(); kv(appId).set(key, checkedKvValue(value)); return null; },
    "apps.kv.delete": ({ appId, key }) => { writable(); kv(appId).delete(key); return null; },
    "apps.kv.list": ({ appId, offset, limit }) => boundedPage(kv(appId).list(), offset, limit),
    "connections.presets": ({ provider, offset, limit }) => boundedPage(runtime.connections.auth.presetModels(provider).map(model => ({ id: model.id, name: model.name })), offset, limit),
    "connections.refresh": async ({ id }) => { writable(); if (!runtime.connections.refreshModels) throw new Error("模型目录功能正在随内核更新，请等待后台准备完成"); await runtime.connections.refreshModels(id); change("connections"); return null; },
    "connections.providers": () => runtime.connections.auth.providers().map(provider => ({ ...provider, modelCount: provider.modelCount ?? 0, dynamic: provider.dynamic ?? false })),
    "connections.list": ({ offset, limit }) => boundedPage(runtime.connections.list().map(connectionSummary), offset, limit),
    "connections.create": async input => { writable(); return connectionSummary(await runtime.connections.create({ ...input, profile: input.profile as ConnectionProfile | undefined })); },
    "connections.rename": async ({ id, name }) => { writable(); return connectionSummary(await runtime.connections.update(id, { name })); },
    "connections.remove": async ({ id }) => { writable(); await runtime.connections.remove(id); return null; },
    "connections.setKey": async ({ id, key }) => { writable(); await runtime.connections.setApiKey(id, key); change("connections"); return null; },
    "connections.models": async ({ id, offset, limit }) => boundedPage(
      (await runtime.connections.listModels(id)).map(model => ({ id: model.id, name: model.name ?? model.id })), offset, limit),
    "auth.start": ({ connectionId }) => { writable(); return auth.start(connectionId); },
    "auth.list": () => auth.list(),
    "auth.reply": ({ id, promptId, value }) => { auth.reply(id, promptId, value); return null; },
    "auth.cancel": async ({ id }) => { await auth.cancel(id); return null; },
    "auth.logout": async ({ connectionId }) => { writable(); await runtime.connections.auth.logout(connectionId); change("connections"); return null; },
    "sessions.list": ({ appId, offset, limit }) => boundedPage(
      runtime.sessions(appId).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)), offset, limit),
    "sessions.create": input => { writable(); return runtime.createSession(input); },
    "sessions.send": ({ id, text, requestId }) => { writable(); return runtime.send(id, text, requestId); },
    "sessions.cancel": async ({ id }) => { await runtime.cancel(id); return null; },
    "sessions.model": ({ id, modelId }) => { writable(); return runtime.setModel(id, modelId); },
    "sessions.archive": ({ id, archived }) => { writable(); return runtime.archive(id, archived); },
    "sessions.projection": ({ id, offset, limit }) => project(id, offset, limit),
    "approvals.list": () => runtime.pendingApprovals(),
    "approvals.reply": ({ id, allow }) => { runtime.answerApproval(id, allow); return null; },
    "chat.status": () => chat.snapshot(),
    "chat.connect": async () => { writable(); await chat.connect(); return null; },
    "chat.sync": async () => { writable(); await chat.sync(); return null; },
  }),
  http: {
    async fetch(request) {
      const match = /^\/app-assets\/([^/]+)\/([^/]+)\/(.+)$/.exec(new URL(request.url).pathname);
      if (!match || match[1] !== active?.id) return new Response("Not found", { status: 404 });
      const app = active.applications.find(value => value.id === match[2]);
      if (!app?.client || !runtime.application(app.id).enabled) return new Response("Not found", { status: 404 });
      const root = await realpath(dirname(app.client));
      let file: string;
      try {
        file = await realpath(match[3] === "client.js" ? app.client : join(root, decodeURIComponent(match[3]!)));
      } catch { return new Response("Not found", { status: 404 }); }
      const path = relative(root, file);
      if (isAbsolute(path) || path === ".." || path.startsWith(`..${sep}`))
        return new Response("Not found", { status: 404 });
      return new Response(Bun.file(file), { headers: { "Cache-Control": "private, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
    },
  },
  async start(context) {
    dataDirectory = join(context.app.dataDirectory, "cordis-v1");
    await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
    try { settings = JSON.parse(await readFile(join(dataDirectory, "settings.json"), "utf8")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    change = kind => context.emit("runtime.changed", { epoch: runtime?.epoch ?? "", kind });
    product = new RuntimeProduct(dataDirectory, () => change("product"));
    await product.open();
    await context.native.application.setAppearance({ mode: product.value.appearance.theme });
    setAppearance = async input => {
      const value = await product.appearance(input, mode => context.native.application.setAppearance({ mode }));
      context.emit("appearance.changed", value); return value;
    };
    const seedSource = {
      archive: join(context.app.runtimeDirectory, "resources/runtime-seed.tgz"),
      metadata: join(context.app.runtimeDirectory, "resources/runtime-seed.json"), dataDirectory,
    };
    restartBackend = async () => {
        // Recheck synchronously after the generation pointer's asynchronous I/O.
        if (runtime.busy() || chat.busy() || product.busy() || installing) throw new RestartDeferred("任务已开始，暂缓后台重启");
        switching = true;
        runtime.setAccepting(false);
        try { await context.restart(); }
        catch (error) { switching = false; runtime.setAccepting(true); throw error; }
    };
    generations = new GenerationManager({
      // The seed path is needed only for a genuinely empty installation. An
      // existing generation must start even if the new archive cannot unpack.
      dataDirectory, seedDirectory: join(dataDirectory, "runtime", "unmaterialized"), progress,
      execPath: process.execPath, busy: () => (runtime?.busy() ?? false) || (chat?.busy() ?? false) || (product?.busy() ?? false),
      restart: () => restartBackend(),
    });
    if (!await generations.current())
      generations.options.seedDirectory = await materializeRuntimeSeed(seedSource);
    active = await generations.initialize();
    reloadSeed = async input => {
      if (context.app.mode !== "development") return { accepted: false, reason: "仅开发模式支持源码重载" };
      const metadataPath = join(context.app.runtimeDirectory, "resources/runtime-seed.json");
      const metadataBefore = await readFile(metadataPath, "utf8");
      const metadata = JSON.parse(metadataBefore);
      if (input.seedId !== metadata.id) return { accepted: false, reason: "开发产物已更新" };
      // Recheck every admission condition after the asynchronous read.
      if (input.epoch !== runtime.epoch)
        return { accepted: false, reason: "后台或开发产物已更新" };
      if (runtime.busy() || chat.busy() || product.busy() || installing || pending || switching || reloadRequested)
        return { accepted: false, reason: "等待应用、模型、同步或安装任务空闲" };
      // Preparation can include package installation. Keep it outside both the
      // RPC deadline and FIA's backend readiness window; old work stays usable.
      installing = true; installPhase = "copy"; updateError = null; change("generation");
      void (async () => {
        const nextSeed = await materializeRuntimeSeed({
          archive: join(context.app.runtimeDirectory, "resources/runtime-seed.tgz"),
          metadata: metadataPath, dataDirectory,
        });
        if (await readFile(metadataPath, "utf8") !== metadataBefore)
          throw new Error("验包期间开发产物已更新，请保存源码后重试");
        await generations.stageSeed(nextSeed);
        pending = Boolean((await generations.status()).pendingId);
        reloadRequested = true;
      })().catch(error => {
        updateError = String(error).slice(0, 2000);
      }).finally(() => { installing = false; installPhase = null; change("generation"); });
      return { accepted: true };
    };
    const generationState = await generations.status();
    pending = Boolean(generationState.pendingId);
    updateError = generationState.lastError ?? null;
    // A variable URL keeps this module outside the FIA bundle. Plugins, SDK and
    // engine all resolve their shared core within one immutable generation.
    try {
    const engineURL = pathToFileURL(active.runtimeEntry).href;
    const engine = await import(/* @vite-ignore */ engineURL) as typeof import("../packages/runtime/src/index");
    runtime = await engine.FnRuntime.open({
      dataDirectory,
      changed: event => {
        let data: Json | undefined;
        if (event.kind === "stream") {
          const frame = event.data as AssistantStreamFrame;
          if (frame.type === "start" || frame.type === "end")
            data = { type: frame.type, attemptId: frame.attemptId, revision: frame.revision };
          else if (frame.chunk.type === "text-delta" || frame.chunk.type === "reasoning-delta")
            data = { type: "delta", attemptId: frame.attemptId, revision: frame.revision, index: frame.index,
              text: frame.chunk.text.slice(0, 32768), reasoning: frame.chunk.type === "reasoning-delta" };
          else return;
        }
        context.emit("runtime.changed", { epoch: runtime?.epoch ?? "", kind: event.kind, sessionId: event.sessionId, appId: event.appId, data });
      },
      tools: {
        web: {
          search: (input, signal) => webSearch({ query: input.query, limit: input.limit ?? 5 }, { signal, sources: createSourceContext() }),
          fetch: (input, signal) => webFetchResult({ url: input.url, maxBytes: 128 * 1024 }, { signal, sources: createSourceContext() }),
        },
        openURL: async (url, signal) => {
          signal.throwIfAborted();
          await context.native.system.openURL({ url }, { signal });
        },
      },
    });
    auth = new RuntimeAuth(runtime, async url => { await context.native.system.openURL({ url }); }, () => change("connections"));
    project = async (id, offset, limit) => {
      runtime.session(id);
      return JSON.parse(JSON.stringify(await engine.readSessionProjection(runtime.ctx, id, offset, limit))) as Json;
    };
    chat = new SessionChatService({
      root: dataDirectory, mode: context.app.mode ?? "production", bundleId: context.app.identifier,
      native: context.native, runtime: () => runtime,
      selectedModels: () => product.value.models,
      projection: (id, offset, limit) => engine.readSessionProjection(runtime.ctx, id, offset, limit),
      changed: () => change("chat"),
      accepting: () => !switching,
    });
      const builtin = await runtime.load({
        manifest: { id: "fn-chat", name: "fn Chat", version: "1", packageName: "@semicoder/fn-chat" },
        plugin: {
          name: "fn-chat", inject: ["app", "tools", "systemPrompt"],
          apply(ctx) {
            ctx.app.chat({ id: "chat", name: "对话" });
            ctx.app.useTools(["read_file", "write_file", "run_command", "web_search", "web_fetch", "open_url"]);
          },
        },
      });
      if (builtin.status !== "active") throw new Error(`fn Chat 启动失败：${builtin.error}`);
      for (const app of active.applications) {
        const module = await import(/* @vite-ignore */ pathToFileURL(app.entry).href);
        const info = await runtime.load({ manifest: app, plugin: module.default ?? module }, !settings.disabled.includes(app.id));
        if (info.status === "error") throw new Error(`应用 ${app.name} 启动失败：${info.error}`);
      }
      await generations.confirmActivation();
    } catch (error) {
      try { await runtime?.close(); }
      finally { await generations.rollbackActivation(); }
      throw error;
    }
    const title = context.app.mode === "production" ? "fn" : `fn · ${context.app.mode === "development" ? "开发版" : "预览版"}`;
    await context.native.windows.update({ id: "main", title, width: 1200, height: 800 });
    await context.native.windows.setTitlebar({ id: "main", items: [] });
    timer = setInterval(() => { void applyPending(); }, 1000);
    timer.unref();
    void readFile(seedSource.metadata, "utf8").then(text => {
      const packagedSeed = JSON.parse(text);
      if (active.manifest.seedId !== packagedSeed.id && !installing && !pending && !switching)
        stage(async () => generations.stageSeed(await materializeRuntimeSeed(seedSource)), "copy");
    }).catch(error => { updateError = `运行内核升级：${String(error).slice(0, 1000)}`; change("generation"); });
    void chat.start().catch(error => { updateError = `Chat: ${String(error)}`; change("chat"); });
  },
  beforeUpdate: () => {
    const ready = !installing && !runtime?.busy() && !chat?.busy() && !product?.busy();
    return { ready, reason: "应用、模型、同步或登录任务正在运行" };
  },
  async stop() {
    clearInterval(timer);
    await product?.stop();
    await chat?.stop();
    await auth?.close();
    await runtime?.close();
  },
});
