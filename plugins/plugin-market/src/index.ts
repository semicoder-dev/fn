import { Service, type Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import { Document } from "@semicoder/fn-host/document";
import { boundedPage } from "@semicoder/fn-host/pagination";
import { pluginPackageId, type InstalledPlugin } from "@semicoder/fn-host/generations";
import type {} from "@semicoder/fn-plugin-manager";
import {
  pluginIndex,
  marketURL,
  marketDocument,
  type MarketDocument,
  type CatalogEntry,
} from "./schema.ts";
import { download } from "./download.ts";
import api from "./contract.ts";
export default class PluginMarket extends Service {
  static inject = ["rpc", "activity", "plugins"];
  private document!: Document<MarketDocument>;
  private pending = new Map<string, Promise<void>>();
  private controller = new AbortController();
  private fetcher = fetch;
  constructor(ctx: Context) {
    super(ctx, "market");
  }
  private changed() {
    if (this.controller.signal.aborted) return;
    this.ctx.rpc.emit("market", "changed", {});
  }
  private get installed() {
    return this.ctx.host.installation!.active.plugins;
  }
  private get core() {
    return this.ctx.host.installation!.active.manifest.coreVersions;
  }
  async *[Service.init]() {
    this.document = await Document.open(
      join(this.ctx.host.dataDirectory, "market", "sources.json"),
      [
        {
          id: "official",
          name: "官方插件市场",
          url: "https://raw.githubusercontent.com/semicoder-dev/fn-plugins/main/marketplace.json",
          enabled: true,
          updatedAt: null,
          error: null,
          index: null,
        },
      ],
      (value) => marketDocument.parse(value),
    );
    yield async () => {
      this.controller.abort();
      await Promise.allSettled(this.pending.values());
      await this.document.close();
    };
    this.ctx.activity.watch(() => this.document.busy() || this.pending.size > 0);
    this.ctx.rpc.register(
      "market",
      implementAPI(api, {
        list: () => this.listMarkets(),
        add: async ({ name, url }) => {
          await this.addMarket(name, url);
          this.changed();
          return null;
        },
        change: async ({ id, ...patch }) => {
          this.ctx.activity.assertAccepting();
          await this.document.update((sources) => {
            const source = sources.find((source) => source.id === id);
            if (!source) throw new Error("市场源不存在");
            Object.assign(source, patch);
          });
          this.changed();
          return null;
        },
        remove: async ({ id }) => {
          this.ctx.activity.assertAccepting();
          await this.document.update((sources) => {
            const index = sources.findIndex((source) => source.id === id);
            if (index !== -1) sources.splice(index, 1);
          });
          this.changed();
          return null;
        },
        refresh: ({ id }) => {
          this.ctx.activity.assertAccepting();
          void this.refresh(id);
          return null;
        },
        catalog: ({ query, offset, limit }) =>
          boundedPage(
            this.catalog(this.installed, this.core).filter((entry) =>
              `${entry.name} ${entry.description} ${entry.packageName}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            ),
            offset,
            limit,
          ),
        install: ({ marketId, id }) => {
          this.ctx.plugins.stage(async () => {
            const { entry, origin } = await this.resolve(marketId, id, this.installed, this.core);
            return this.ctx.host.installation!.manager.stageInstall(entry.url, {
              expected: entry,
              origin,
            });
          });
          return null;
        },
      }),
    );
  }
  listMarkets() {
    return this.document.value.map(({ index, ...source }) => ({
      ...source,
      count: index?.plugins.length ?? 0,
      refreshing: this.pending.has(source.id),
    }));
  }
  async addMarket(name: string, url: string) {
    this.ctx.activity.assertAccepting();
    const normalized = new URL(marketURL.parse(url)).href;
    await this.document.update((draft) => {
      if (draft.some((source) => source.url === normalized)) throw new Error("市场源已存在");
      draft.push({
        id: crypto.randomUUID(),
        name,
        url: normalized,
        enabled: true,
        index: null,
        error: null,
        updatedAt: null,
      });
    });
  }
  refresh(id?: string): Promise<void> {
    if (this.controller.signal.aborted) return Promise.resolve();
    if (id && !this.document.value.some((source) => source.id === id))
      throw new Error("市场源不存在");
    return Promise.all(
      this.document.value
        .filter((source) => source.enabled && (!id || source.id === id))
        .map((source) => {
          const existing = this.pending.get(source.id);
          if (existing) return existing;
          const operation = (async () => {
            try {
              const bytes = await download(
                source.url,
                2 * 1024 * 1024,
                AbortSignal.any([this.controller.signal, AbortSignal.timeout(15000)]),
                this.fetcher,
              );
              this.controller.signal.throwIfAborted();
              const value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
              if (value.schemaVersion !== 3)
                throw new Error("该市场使用旧插件协议，请添加 新版插件市场源");
              const index = pluginIndex.parse(value);
              await this.document.update((draft) => {
                const record = draft.find((item) => item.id === source.id);
                if (record) Object.assign(record, { index, error: null, updatedAt: Date.now() });
              });
            } catch (error) {
              if (this.controller.signal.aborted) return;
              await this.document.update((draft) => {
                const record = draft.find((item) => item.id === source.id);
                if (record)
                  record.error =
                    source.id === "official" && String(error).includes("404")
                      ? "官方 插件市场尚未发布，可添加自定义市场或从地址安装。"
                      : String(error).slice(0, 1000);
              });
            } finally {
              this.pending.delete(source.id);
              this.changed();
            }
          })();
          this.pending.set(source.id, operation);
          this.changed();
          return operation;
        }),
    ).then(() => {});
  }
  catalog(installed: InstalledPlugin[], core: Record<string, string>): CatalogEntry[] {
    return this.document.value
      .filter((source) => source.enabled)
      .flatMap((source) =>
        (source.index?.plugins ?? []).map((entry) => {
          const app = installed.find((app) => app.packageName === entry.packageName);
          const compatible = Object.entries(entry.peers).every(
            ([key, range]) => !!core[key] && Bun.semver.satisfies(core[key]!, range),
          );
          const conflict =
            app &&
            (app.packageName !== entry.packageName ||
              app.origin?.marketId !== source.id ||
              app.origin?.marketURL !== source.url);
          const state: CatalogEntry["state"] = conflict
            ? "conflict"
            : !compatible
              ? "incompatible"
              : !app
                ? "available"
                : Bun.semver.order(entry.version, app.version) > 0
                  ? "update"
                  : "installed";
          return {
            ...entry,
            id: pluginPackageId(entry.packageName),
            marketId: source.id,
            marketName: source.name,
            installedVersion: app?.version ?? null,
            state,
          };
        }),
      );
  }
  async resolve(
    marketId: string,
    appId: string,
    installed: InstalledPlugin[],
    core: Record<string, string>,
  ) {
    await this.refresh(marketId);
    const source = this.document.value.find((source) => source.id === marketId);
    if (!source?.enabled || source.error) throw new Error(source?.error ?? "市场源不存在或已停用");
    const entry = this.catalog(installed, core).find(
      (entry) => entry.marketId === marketId && entry.id === appId,
    );
    if (!entry || entry.state === "incompatible" || entry.state === "conflict")
      throw new Error("应用不可安装：已下架、核心不兼容或安装来源冲突");
    if (entry.installedVersion && Bun.semver.order(entry.version, entry.installedVersion) < 0)
      throw new Error("市场版本低于已安装版本，不能通过更新降级");
    return { entry, origin: { source: entry.url, marketId, marketURL: source.url } };
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    market: PluginMarket;
  }
}
