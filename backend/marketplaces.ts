import type { PluginInfo } from "@semicoder/fn-sdk/types";
import {
  catalogQuery,
  compareVersions,
  httpsURL,
  marketIndex,
  marketRecord,
  type MarketBinding,
  type CatalogEntry,
} from "../shared/marketplace";
import { Store } from "./store";
import { download } from "./download";

export class Marketplaces {
  private pending = new Map<string, Promise<void>>();
  private controller = new AbortController();
  constructor(
    private store: Store,
    private changed: () => void,
    private fetcher: typeof fetch = fetch,
  ) {}
  list() {
    return this.store.value.marketplaces.map(({ index, ...record }) => ({
      ...record,
      count: index?.plugins.length ?? 0,
      refreshing: this.pending.has(record.id),
    }));
  }
  async add(name: string, url: string) {
    const normalized = new URL(httpsURL.parse(url)).href;
    const record = marketRecord.parse({
      id: crypto.randomUUID(),
      name,
      url: normalized,
      enabled: true,
      index: null,
      updatedAt: null,
      error: null,
    });
    await this.store.update((state) => {
      if (state.marketplaces.length >= 20) throw new Error("最多配置 20 个市场源");
      if (state.marketplaces.some((source) => source.url === normalized))
        throw new Error("市场源已存在");
      state.marketplaces.push(record);
    });
    this.changed();
    return this.list().find((source) => source.id === record.id)!;
  }
  async update(id: string, change: { name?: string; enabled?: boolean }) {
    await this.store.update((state) => {
      const source = state.marketplaces.find((source) => source.id === id);
      if (!source) throw new Error("市场源不存在");
      Object.assign(source, change);
      marketRecord.parse(source);
    });
    this.changed();
    return this.list().find((source) => source.id === id)!;
  }
  async remove(id: string) {
    await this.store.update((state) => {
      state.marketplaces = state.marketplaces.filter((source) => source.id !== id);
    });
    this.changed();
  }
  private refreshOne(id: string): Promise<void> {
    const current = this.pending.get(id);
    if (current) return current;
    const source = this.store.value.marketplaces.find((source) => source.id === id);
    if (!source?.enabled || this.controller.signal.aborted) return Promise.resolve();
    const task = (async () => {
      try {
        const bytes = await download(
          source.url,
          2 * 1024 * 1024,
          AbortSignal.any([this.controller.signal, AbortSignal.timeout(15000)]),
          this.fetcher,
        );
        const index = marketIndex.parse(
          JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)),
        );
        await this.store.update((state) => {
          const saved = state.marketplaces.find((item) => item.id === id);
          if (saved) {
            saved.index = index;
            saved.updatedAt = Date.now();
            saved.error = null;
          }
        });
      } catch (error) {
        await this.store.update((state) => {
          const saved = state.marketplaces.find((item) => item.id === id);
          if (saved)
            saved.error = String(error instanceof Error ? error.message : error).slice(0, 1000);
        });
      } finally {
        this.pending.delete(id);
        this.changed();
      }
    })();
    this.pending.set(id, task);
    this.changed();
    return task;
  }
  async refresh(id?: string) {
    if (id && !this.store.value.marketplaces.some((source) => source.id === id))
      throw new Error("市场源不存在");
    await Promise.all(
      this.store.value.marketplaces
        .filter((source) => source.enabled && (!id || source.id === id))
        .map((source) => this.refreshOne(source.id)),
    );
    return this.list();
  }
  async resolve(binding: MarketBinding, pluginId: string) {
    await this.refresh(binding.marketId);
    const source = this.store.value.marketplaces.find((source) => source.id === binding.marketId);
    if (!source?.enabled || source.url !== binding.marketURL)
      throw new Error("原市场源已删除或停用");
    if (source.error) throw new Error("无法重新核对市场：" + source.error);
    const entry = source.index?.plugins.find((entry) => entry.id === pluginId);
    if (!entry) throw new Error("插件已从原市场下架");
    if (entry.sdkVersion !== "0.3") throw new Error("插件 SDK 版本不兼容");
    return structuredClone(entry);
  }
  binding(id: string): MarketBinding {
    const source = this.store.value.marketplaces.find((source) => source.id === id);
    if (!source?.enabled) throw new Error("市场源不存在或已停用");
    return { marketId: source.id, marketURL: source.url };
  }
  catalog(input: unknown, installed: PluginInfo[]) {
    const query = catalogQuery.parse(input);
    const entries = this.store.value.marketplaces
      .filter((source) => source.enabled && (!query.marketId || source.id === query.marketId))
      .flatMap((source) =>
        (source.index?.plugins ?? []).map((entry) => {
          const plugin = installed.find((plugin) => plugin.id === entry.id);
          const conflict =
            plugin &&
            (plugin.market?.marketId !== source.id ||
              plugin.market.marketURL !== source.url ||
              plugin.packageName !== entry.packageName);
          const state: CatalogEntry["state"] = conflict
            ? "conflict"
            : entry.sdkVersion !== "0.3"
              ? "incompatible"
              : !plugin
                ? "available"
                : compareVersions(entry.version, plugin.version) > 0
                  ? "update"
                  : "installed";
          return {
            ...entry,
            marketId: source.id,
            marketName: source.name,
            installedVersion: plugin?.version ?? null,
            state,
          };
        }),
      )
      .filter((entry) =>
        `${entry.name} ${entry.description} ${entry.id}`
          .toLocaleLowerCase()
          .includes(query.query.toLocaleLowerCase()),
      );
    return {
      items: entries.slice(query.offset, query.offset + query.limit),
      total: entries.length,
      nextOffset: query.offset + query.limit < entries.length ? query.offset + query.limit : null,
    };
  }
  async stop() {
    this.controller.abort();
    await Promise.allSettled(this.pending.values());
  }
}
