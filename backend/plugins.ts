import type {
  ChatClient,
  ChatEventContext,
  ChatUserMessage,
  ChatResponse,
} from "@semicoder/fn-sdk/chat";
import type { WebTools } from "./web";
import type { Agents, PluginAgentTools } from "./agent/service";
import { agentToolInfo, type AgentClient } from "@semicoder/fn-sdk/agent";
import { mkdir, realpath, rm } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "@semicoder/fia/api";
import type {
  BackendPlugin,
  InstallJob,
  JSONValue,
  PluginContext,
  PluginInfo,
  PluginManifest,
} from "@semicoder/fn-sdk/types";
import { createHash } from "node:crypto";
import {
  compareVersions,
  stableVersion,
  type MarketBinding,
  type MarketEntry,
} from "../shared/marketplace";
import { Marketplaces } from "./marketplaces";
import { download } from "./download";
import { Store } from "./store";
import { Models } from "./models";

export { manifestSchema } from "@semicoder/fn-sdk/manifest";
import { manifestSchema } from "@semicoder/fn-sdk/manifest";
type Loaded = {
  invalidManifest?: boolean;
  info: PluginInfo;
  manifest: PluginManifest;
  root: string;
  backend?: BackendPlugin;
  agentDisposers?: Set<() => void>;
  calls: number;
  changing: boolean;
};
const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function containedFile(root: string, name: string) {
  if (isAbsolute(name) || name.includes("\\") || name.split("/").includes(".."))
    throw new Error("插件入口必须是包内相对路径");
  const base = await realpath(root);
  const target = await realpath(resolve(base, name));
  const rel = relative(base, target);
  if (rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel))
    throw new Error("插件资源越出包目录");
  if (!(await Bun.file(target).exists())) throw new Error("插件资源不存在：" + name);
  return target;
}

export class Plugins {
  private registry = new Map<string, Loaded>();
  private jobs: InstallJob[] = [];
  private installation?: {
    job: InstallJob;
    process?: Bun.Subprocess;
    done: Promise<void>;
    controller: AbortController;
  };
  private stopping = false;
  constructor(
    private store: Store,
    private models: Models,
    private changed: () => void,
    private markets?: Marketplaces,
    private fetcher: typeof fetch = fetch,
    private web?: WebTools,
    private chat?: (pluginId: string) => ChatClient,
    private agents?: Agents,
  ) {}
  async open() {
    for (const record of this.store.value.plugins) {
      try {
        await this.load(record.root, record.source, record.market);
      } catch (error) {
        this.registry.set(record.id, {
          invalidManifest: true,
          root: record.root,
          manifest: {
            schemaVersion: 1,
            id: record.id,
            name: record.id,
            description: "安装文件缺失或清单无效，请卸载后重新安装。",
            icon: "!",
            color: "#bc6452",
            sdkVersion: "0.3",
            frontend: "dist/client.js",
            styles: "dist/client.css",
          },
          calls: 0,
          changing: false,
          info: {
            id: record.id,
            name: record.id,
            description: "安装文件无法加载",
            icon: "!",
            color: "#bc6452",
            version: record.version,
            packageName: record.packageName,
            source: record.source,
            market: record.market,
            enabled: false,
            status: "error",
            error: message(error),
            clientURL: "",
            styleURL: null,
            keepAlive: false,
            methods: [],
          },
        });
      }
    }
  }
  list() {
    return [...this.registry.values()].map((item) => structuredClone(item.info));
  }
  get(id: string) {
    const plugin = this.registry.get(id);
    if (!plugin) throw new Error("插件不存在");
    return plugin;
  }
  async use<T>(id: string, action: (plugin: Loaded) => T | Promise<T>): Promise<T> {
    const plugin = this.get(id);
    if (this.stopping || plugin.changing || plugin.info.status !== "active")
      throw new Error("插件未就绪或已停用");
    plugin.calls++;
    try {
      return await action(plugin);
    } finally {
      plugin.calls--;
    }
  }
  private context(id: string): PluginContext {
    const agentClient = () => {
      if (!this.agents) throw new Error("Agent 能力不可用");
      return this.agents.client(id);
    };
    const agents: AgentClient = {
      tools: () => this.use(id, () => agentClient().tools()),
      create: input => this.use(id, () => agentClient().create(input)),
      send: (sessionId, text) => this.use(id, () => agentClient().send(sessionId, text)),
      list: () => agentClient().list(), get: sessionId => agentClient().get(sessionId),
      events: (sessionId, after) => agentClient().events(sessionId, after),
      cancel: sessionId => agentClient().cancel(sessionId), remove: sessionId => agentClient().remove(sessionId),
      onChange: listener => {
        const plugin = this.get(id);
        const dispose = agentClient().onChange(listener);
        plugin.agentDisposers ??= new Set();
        const cleanup = () => { dispose(); plugin.agentDisposers?.delete(cleanup); };
        plugin.agentDisposers.add(cleanup);
        return cleanup;
      },
    };
    return {
      pluginId: id,
      agents,
      ...(this.chat ? { chat: this.chat(id) } : {}),
      web: {
        search: (input, options) =>
          this.use(id, () => {
            if (!this.web) throw new Error("网络工具不可用");
            return this.web.client(id).search(input, options);
          }),
        fetch: (input, options) =>
          this.use(id, () => {
            if (!this.web) throw new Error("网络工具不可用");
            return this.web.client(id).fetch(input, options);
          }),
      },
      models: {
        list: () => this.models.list(),
        start: (input) => this.use(id, () => this.models.start(id, input)),
      },
      kv: {
        get: (key) => this.store.get(id, key),
        set: (key, value) => this.store.set(id, key, value),
        delete: (key) => this.store.delete(id, key),
      },
    };
  }
  private async inspect(
    root: string,
    source: string,
    market: MarketBinding | null,
  ): Promise<Loaded> {
    const pkg = await Bun.file(join(root, "package.json")).json();
    if (pkg.fn?.sdkVersion !== "0.3")
      throw new Error(
        "插件 SDK 版本不兼容：请使用 SDK 0.3 重新构建并安装插件；原有 KV 数据仍会保留。",
      );
    if (["models", "plugins", "settings", "inbox"].includes(pkg.fn?.id))
      throw new Error("此插件 ID 为宿主保留名称");
    const manifest = manifestSchema.parse(pkg.fn);
    if (["models", "plugins", "settings", "inbox"].includes(manifest.id))
      throw new Error("此插件 ID 为宿主保留名称");
    if (typeof pkg.name !== "string" || typeof pkg.version !== "string")
      throw new Error("插件缺少 package name/version");
    await containedFile(root, manifest.frontend);
    if (manifest.backend) await containedFile(root, manifest.backend);
    if (manifest.styles) await containedFile(root, manifest.styles);
    stableVersion.parse(pkg.version);
    const enabled = !this.store.value.disabled.includes(manifest.id);
    const prefix = `/api/plugins/${manifest.id}/`;
    const revision = `?v=${Bun.hash(root + pkg.version).toString(36)}`;
    return {
      root,
      manifest,
      calls: 0,
      changing: false,
      info: {
        id: manifest.id,
        name: manifest.name,
        description: manifest.description,
        icon: manifest.icon,
        color: manifest.color,
        version: pkg.version,
        packageName: pkg.name,
        source,
        market,
        enabled,
        status: "disabled",
        error: null,
        clientURL: prefix + manifest.frontend + revision,
        styleURL: manifest.styles ? prefix + manifest.styles + revision : null,
        keepAlive: manifest.keepAlive,
        methods: [],
      },
    };
  }
  private async load(root: string, source: string, market: MarketBinding | null) {
    const plugin = await this.inspect(root, source, market);
    if (this.registry.has(plugin.info.id)) throw new Error("插件 ID 已安装：" + plugin.info.id);
    this.registry.set(plugin.info.id, plugin);
    if (plugin.info.enabled) await this.activate(plugin);
    return plugin;
  }
  private async activate(plugin: Loaded) {
    try {
      if (plugin.manifest.backend) {
        const file = await containedFile(plugin.root, plugin.manifest.backend);
        const mod = await import(pathToFileURL(file).href);
        const backend = mod.default as BackendPlugin;
        if (!backend || typeof backend.methods !== "object")
          throw new Error("后端未导出 definePlugin 对象");
        plugin.info.methods = Object.entries(backend.methods).map(([name, method]) => {
          if (typeof method.execute !== "function" || typeof method.description !== "string")
            throw new Error("无效的插件方法：" + name);
          return {
            name,
            description: method.description,
            inputSchema: z.json().parse(method.inputSchema),
          };
        });
        if (backend.chat) {
          const chat = backend.chat;
          if (
            !Number.isSafeInteger(chat.version) ||
            chat.version < 1 ||
            typeof chat.onMessage !== "function" ||
            typeof chat.onResponse !== "function"
          )
            throw new Error("聊天处理器声明无效");
          const timeout = chat.timeoutMs ?? 600_000;
          if (!Number.isSafeInteger(timeout) || timeout < 1000 || timeout > 86_400_000)
            throw new Error("聊天处理超时配置无效");
        }
        if (Object.keys(backend.tools ?? {}).length > 32) throw new Error("插件最多声明 32 个工具");
        for (const [name, tool] of Object.entries(backend.tools ?? {})) {
          if (["web_search", "web_fetch"].includes(name)) throw new Error("插件工具不能覆盖宿主网络工具");
          agentToolInfo.parse({ name, description: tool.description, inputSchema: tool.inputSchema });
          if (Buffer.byteLength(JSON.stringify(tool.inputSchema)) > 16 * 1024) throw new Error("工具参数声明超过 16 KiB");
          if (typeof tool.execute !== "function") throw new Error("无效的插件工具：" + name);
          if (!tool.inputSchema || typeof tool.inputSchema !== "object" || Array.isArray(tool.inputSchema) || tool.inputSchema.type !== "object") throw new Error("工具参数必须声明 JSON Schema object");
          z.fromJSONSchema(tool.inputSchema);
        }
        plugin.backend = backend;
        await backend.activate?.(this.context(plugin.info.id));
      }
      plugin.info.status = "active";
      plugin.info.error = null;
    } catch (error) {
      for (const dispose of plugin.agentDisposers ?? []) dispose();
      plugin.info.status = "error";
      plugin.info.error = message(error);
    }
  }
  private async dispose(plugin: Loaded) {
    try { await plugin.backend?.dispose?.(); }
    finally { for (const dispose of plugin.agentDisposers ?? []) dispose(); }
  }
  chatCatalog() {
    return [...this.registry.values()]
      .filter((p) => p.backend?.chat)
      .map((p) => ({
        pluginId: p.info.id,
        name: p.info.name,
        icon: p.info.icon,
        enabled: p.info.enabled && p.info.status === "active",
        version: p.info.version + ":" + p.backend!.chat!.version,
      }));
  }
  agentTools(id: string): PluginAgentTools {
    const plugin = this.get(id);
    if (this.stopping || plugin.changing || plugin.info.status !== "active") throw new Error("插件未就绪或已停用");
    return Object.fromEntries(Object.entries(plugin.backend?.tools ?? {}).map(([name, definition]) => [name, {
      definition,
      execute: (input: unknown, signal: AbortSignal, sessionId: string, callId: string) => this.use(id, async () => {
        signal.throwIfAborted();
        return definition.execute(input, { ...this.context(id), signal, sessionId, callId });
      }),
    }]));
  }
  chatVersion(pluginId: string) {
    const p = this.get(pluginId);
    if (p.changing || !p.info.enabled || p.info.status !== "active" || !p.backend?.chat)
      throw new Error("目标机器人不可用");
    return {
      version: p.info.version + ":" + p.backend.chat.version,
      timeoutMs: p.backend.chat.timeoutMs ?? 600_000,
    };
  }
  async executeChat(
    event: ChatUserMessage | ChatResponse,
    context: Pick<ChatEventContext, "eventId" | "conversationId" | "signal" | "progress">,
  ) {
    await this.use(event.pluginId, async (p) => {
      if (this.chatVersion(event.pluginId).version !== event.botVersion)
        throw new Error("机器人版本已改变");
      context.signal.throwIfAborted();
      const full = { ...this.context(event.pluginId), ...context };
      if (full.chat) {
        const chat = full.chat;
        full.chat = {
          sendText: async (text) => {
            context.signal.throwIfAborted();
            return chat.sendText(text);
          },
          request: async (input) => {
            context.signal.throwIfAborted();
            return chat.request(input);
          },
          get: async (id) => {
            context.signal.throwIfAborted();
            return chat.get(id);
          },
          list: async (input) => {
            context.signal.throwIfAborted();
            return chat.list(input);
          },
          cancel: async (id) => {
            context.signal.throwIfAborted();
            return chat.cancel(id);
          },
        };
      }
      // Captured clients stop with the account; delayed handlers cannot send under a new identity.
      if (event.kind === "userText") await p.backend!.chat!.onMessage(event, full);
      else await p.backend!.chat!.onResponse(event, full);
    });
  }
  async invoke(id: string, method: string, input: JSONValue): Promise<JSONValue> {
    return this.use(id, async (plugin) => {
      if (!Object.hasOwn(plugin.backend?.methods ?? {}, method)) throw new Error("插件方法不存在");
      const result = await plugin.backend!.methods[method]!.execute(input, this.context(id));
      const json = z.json().parse(result);
      if (Buffer.byteLength(JSON.stringify(json)) > 256 * 1024)
        throw new Error("插件结果超过 256 KiB 上限");
      return json;
    });
  }
  async setEnabled(id: string, enabled: boolean) {
    const plugin = this.get(id);
    if (
      this.stopping ||
      plugin.changing ||
      plugin.calls ||
      this.models.busy(id) ||
      this.web?.busy(id)
    )
      throw new Error("插件正在运行，请先停止任务");
    if (enabled && plugin.invalidManifest)
      throw new Error(plugin.info.error ?? "插件清单无效，请重新构建安装");
    if (plugin.info.enabled === enabled && plugin.info.status !== "error")
      return structuredClone(plugin.info);
    plugin.changing = true;
    try {
      if (!enabled) await this.dispose(plugin);
      await this.store.update((state) => {
        state.disabled = [
          ...state.disabled.filter((item) => item !== id),
          ...(enabled ? [] : [id]),
        ];
      });
      plugin.info.enabled = enabled;
      if (enabled) await this.activate(plugin);
      else {
        this.web?.clear(id);
        plugin.info.status = "disabled";
        plugin.backend = undefined;
      }
      this.changed();
      return structuredClone(plugin.info);
    } finally {
      plugin.changing = false;
    }
  }
  async uninstall(id: string) {
    const plugin = this.get(id);
    if (
      this.stopping ||
      plugin.changing ||
      plugin.calls ||
      this.models.busy(id) ||
      this.web?.busy(id)
    )
      throw new Error("插件正在运行，请先停止任务");
    plugin.changing = true;
    try {
      await this.dispose(plugin);
      const record = this.store.value.plugins.find((item) => item.id === id);
      await this.store.update((state) => {
        state.plugins = state.plugins.filter((item) => item.id !== id);
        state.disabled = state.disabled.filter((item) => item !== id);
      });
      this.registry.delete(id);
      this.web?.clear(id);
      this.changed();
      if (
        record &&
        relative(join(this.store.directory, "packages"), record.installation).match(/^[a-f0-9-]+$/)
      )
        await rm(record.installation, { recursive: true, force: true });
    } finally {
      plugin.changing = false;
    }
  }
  listJobs() {
    return structuredClone(this.jobs);
  }
  private validateSource(source: string) {
    if (source.startsWith("-") || /[\x00-\x1f]/.test(source)) throw new Error("无效安装来源");
    if (
      !(isAbsolute(source) && source.endsWith(".tgz")) &&
      !/^(?:@?[a-z0-9][a-z0-9._/-]*(?:@[^\s]+)?|git\+https:\/\/\S+|https:\/\/\S+\.git(?:#\S+)?|github:[^\s]+)$/.test(
        source,
      )
    )
      throw new Error("请输入 npm 包名、Git HTTPS 地址或本地 .tgz 绝对路径");
  }
  install(source: string): InstallJob {
    this.validateSource(source);
    return this.startInstall(source, null);
  }
  installFromMarket(marketId: string, pluginId: string) {
    if (this.registry.has(pluginId)) throw new Error("插件已安装，请使用更新");
    if (!this.markets) throw new Error("市场未初始化");
    return this.startInstall("市场：" + marketId, null, {
      binding: this.markets.binding(marketId),
      pluginId,
    });
  }
  update(id: string, source?: string) {
    const plugin = this.get(id);
    if (
      this.stopping ||
      plugin.changing ||
      plugin.calls ||
      this.models.busy(id) ||
      this.web?.busy(id)
    )
      throw new Error("插件正在运行，请先停止任务");
    if (source) {
      this.validateSource(source);
      if (plugin.info.market) throw new Error("市场插件只能通过原市场更新；切换来源请先卸载");
      return this.startInstall(source, id);
    }
    if (!plugin.info.market || !this.markets) throw new Error("请指定手动更新来源");
    return this.startInstall("市场：" + plugin.info.market.marketId, id, {
      binding: plugin.info.market,
      pluginId: id,
    });
  }
  private startInstall(
    source: string,
    updateId: string | null,
    market?: { binding: MarketBinding; pluginId: string },
  ): InstallJob {
    if (this.stopping || this.installation) throw new Error("已有安装任务正在运行");
    const job: InstallJob = {
      id: crypto.randomUUID(),
      source,
      operation: updateId ? "update" : "install",
      targetVersion: null,
      status: "installing",
      message: "正在获取插件包…",
      pluginId: updateId ?? market?.pluginId ?? null,
      createdAt: Date.now(),
    };
    this.jobs = [job, ...this.jobs].slice(0, 20);
    const slot = {
      job,
      done: Promise.resolve(),
      process: undefined as Bun.Subprocess | undefined,
      controller: new AbortController(),
    };
    this.installation = slot;
    slot.done = this.performInstall(slot, updateId, market);
    this.changed();
    return structuredClone(job);
  }
  private async performInstall(
    slot: NonNullable<Plugins["installation"]>,
    updateId: string | null,
    market?: { binding: MarketBinding; pluginId: string },
  ) {
    const installation = join(this.store.directory, "packages", slot.job.id);
    let committed = false;
    let old: Loaded | undefined;
    let candidate: Loaded | undefined;
    let switching = false;
    let finalStatus: "completed" | "failed" = "failed";
    const signal = AbortSignal.any([slot.controller.signal, AbortSignal.timeout(120000)]);
    try {
      await mkdir(installation, { recursive: true });
      let source = slot.job.source;
      let entry: MarketEntry | undefined;
      if (market) {
        entry = await this.markets!.resolve(market.binding, market.pluginId);
        signal.throwIfAborted();
        slot.job.targetVersion = entry.version;
        slot.job.source = entry.url;
        this.changed();
        const bytes = await download(entry.url, 50 * 1024 * 1024, signal, this.fetcher);
        if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256)
          throw new Error("插件归档 SHA-256 校验失败");
        source = join(installation, "download.tgz");
        await Bun.write(source, bytes);
      }
      if (isAbsolute(source) && !(await Bun.file(source).exists()))
        throw new Error("本地归档不存在");
      await Bun.write(
        join(installation, "package.json"),
        JSON.stringify({ name: "fn-plugin-installation", private: true }),
      );
      signal.throwIfAborted();
      slot.process = Bun.spawn([process.execPath, "add", "--ignore-scripts", source], {
        cwd: installation,
        stdout: "ignore",
        stderr: "ignore",
      });
      const kill = () => slot.process?.kill();
      signal.addEventListener("abort", kill, { once: true });
      let exit: number;
      try {
        exit = await slot.process.exited;
      } finally {
        signal.removeEventListener("abort", kill);
      }
      signal.throwIfAborted();
      if (exit !== 0) throw new Error("包获取失败。请检查地址、网络及预构建产物。");
      const receipt = await Bun.file(join(installation, "package.json")).json();
      const names = Object.keys(receipt.dependencies ?? {});
      if (names.length !== 1) throw new Error("安装包未声明唯一入口");
      const root = join(installation, "node_modules", names[0]!);
      candidate = await this.inspect(root, slot.job.source, market?.binding ?? null);
      const plugin = candidate;
      slot.job.pluginId = plugin.info.id;
      slot.job.targetVersion = plugin.info.version;
      if (
        entry &&
        (plugin.info.id !== entry.id ||
          plugin.info.packageName !== entry.packageName ||
          plugin.info.version !== entry.version ||
          plugin.manifest.sdkVersion !== entry.sdkVersion)
      )
        throw new Error("包身份或版本与市场索引不一致");
      if (market) {
        const binding = this.markets!.binding(market.binding.marketId);
        if (binding.marketURL !== market.binding.marketURL) throw new Error("市场源已变更");
      }
      if (updateId) {
        old = this.get(updateId);
        if (old.info.id !== plugin.info.id || old.info.packageName !== plugin.info.packageName)
          throw new Error("更新包身份不匹配");
        if (JSON.stringify(old.info.market) !== JSON.stringify(plugin.info.market))
          throw new Error("更新来源不匹配");
        if (compareVersions(plugin.info.version, old.info.version) <= 0)
          throw new Error("更新版本必须高于已安装版本");
        if (old.changing || old.calls || this.models.busy(updateId) || this.web?.busy(updateId))
          throw new Error("插件正在运行，请先停止任务");
        plugin.info.enabled = old.info.enabled;
      } else if (this.registry.has(plugin.info.id)) throw new Error("插件已安装，请使用更新");
      signal.throwIfAborted();
      slot.job.message = "已校验插件，正在切换…";
      switching = true;
      plugin.changing = true;
      if (old) {
        old.changing = true;
        await this.dispose(old);
      }
      this.registry.set(plugin.info.id, plugin);
      if (plugin.info.enabled) {
        await this.activate(plugin);
        if (plugin.info.status === "error") throw new Error("后端激活失败：" + plugin.info.error);
      }
      signal.throwIfAborted();
      const previous = this.store.value.plugins.find((item) => item.id === plugin.info.id);
      await this.store.update((state) => {
        state.plugins = state.plugins.filter((item) => item.id !== plugin.info.id);
        state.plugins.push({
          id: plugin.info.id,
          packageName: plugin.info.packageName,
          version: plugin.info.version,
          root,
          installation,
          source: slot.job.source,
          market: plugin.info.market,
        });
      });
      committed = true;
      this.web?.clear(plugin.info.id);
      plugin.changing = false;
      finalStatus = "completed";
      slot.job.message = updateId ? "更新完成" : "安装完成，可以从侧栏打开";
      if (
        previous &&
        relative(join(this.store.directory, "packages"), previous.installation).match(
          /^[a-f0-9-]+$/,
        )
      )
        await rm(previous.installation, { recursive: true, force: true }).catch(() => {});
      await rm(join(installation, "download.tgz"), { force: true }).catch(() => {});
    } catch (error) {
      slot.job.message = this.stopping ? "应用关闭，安装已取消" : message(error);
      if (switching && candidate && !committed) {
        await Promise.resolve()
          .then(() => candidate && this.dispose(candidate))
          .catch(() => {});
        if (old) {
          this.registry.set(old.info.id, old);
          old.backend = undefined;
          if (old.info.enabled) await this.activate(old);
          old.changing = false;
          if (old.info.status === "error")
            slot.job.message += "；旧版本恢复失败：" + old.info.error;
        } else this.registry.delete(candidate.info.id);
      }
      if (!committed) await rm(installation, { recursive: true, force: true }).catch(() => {});
    } finally {
      this.installation = undefined;
      // A terminal job must also be ready for the next operation, including
      // rollback activation and temporary-file cleanup.
      slot.job.status = finalStatus;
      this.changed();
    }
  }
  async asset(request: Request) {
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("Method not allowed", { status: 405 });
    try {
      const match = new URL(request.url).pathname.match(/^\/plugins\/([^/]+)\/(.+)$/);
      if (!match) return new Response("Not found", { status: 404 });
      const plugin = this.get(decodeURIComponent(match[1]!));
      if (plugin.info.status !== "active")
        return new Response("Plugin is disabled", { status: 404 });
      const name = decodeURIComponent(match[2]!);
      // Frontend bundles and their assets live in dist; never serve backend source or package credentials.
      if (
        !name.startsWith("dist/") ||
        name === plugin.manifest.backend ||
        !/\.(js|css|svg|png|jpe?g|webp|woff2?)$/.test(name)
      )
        return new Response("Not found", { status: 404 });
      const file = Bun.file(await containedFile(plugin.root, name));
      return new Response(request.method === "HEAD" ? null : file, {
        headers: {
          "Content-Type": file.type,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }
  busy() {
    return (
      Boolean(this.installation) ||
      Boolean(this.web?.busy()) ||
      [...this.registry.values()].some((item) => item.calls || item.changing)
    );
  }
  async stop() {
    this.stopping = true;
    this.installation?.controller.abort();
    this.installation?.process?.kill();
    await this.installation?.done;
    await Promise.allSettled(
      [...this.registry.values()].map((plugin) => this.dispose(plugin)),
    );
  }
}
