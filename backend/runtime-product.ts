import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { productDocument, applicationIndex, marketURL, type ProductDocument, type CatalogEntry } from "../shared/runtime-product";
import { defaultColorTheme, appearanceUpdate, type AppearanceUpdate } from "../shared/theme";
import type { GenerationApplication } from "../packages/runtime/src/generations";
import { download } from "./download";

/** Product preferences belong to the new data root, independently of agent history. */
export class RuntimeProduct {
  value: ProductDocument = { version: 1, appearance: { theme: "system", colorTheme: defaultColorTheme() }, models: [], markets: [{
    id: "official", name: "官方插件市场", url: "https://raw.githubusercontent.com/semicoder-dev/fn-plugins/main/marketplace-cordis.json",
    enabled: true, updatedAt: null, error: null, index: null,
  }] };
  private queue: Promise<unknown> = Promise.resolve();
  private pending = new Map<string, Promise<void>>();
  private controller = new AbortController();
  private writing = 0;
  constructor(private root: string, private changed: () => void, private fetcher: typeof fetch = fetch) {}
  async open() {
    try { this.value = productDocument.parse(JSON.parse(await readFile(join(this.root, "product.json"), "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  busy() { return this.writing > 0 || this.pending.size > 0; }
  update(change: (draft: ProductDocument) => void | Promise<void>, rollback?: () => Promise<unknown>) {
    this.writing++;
    const operation = this.queue.then(async () => {
      const draft = structuredClone(this.value);
      try {
      await change(draft);
      productDocument.parse(draft);
      await mkdir(this.root, { recursive: true, mode: 0o700 });
      const filename = join(this.root, "product.json"), temp = `${filename}.${crypto.randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify(draft), { mode: 0o600 });
      await rename(temp, filename);
      this.value = draft;
      } catch (error) { await rollback?.(); throw error; }
      this.changed();
    }).finally(() => { this.writing--; });
    this.queue = operation.catch(() => {});
    return operation;
  }
  async appearance(input: AppearanceUpdate, apply: (mode: ProductDocument["appearance"]["theme"]) => Promise<unknown>) {
    const patch = appearanceUpdate.parse(input);
    let previous = this.value.appearance.theme;
    await this.update(async draft => {
      previous = draft.appearance.theme;
      if (patch.theme) await apply(patch.theme);
      Object.assign(draft.appearance, patch);
      if (!patch.theme) draft.appearance.theme = previous;
    }, () => apply(previous));
    return structuredClone(this.value.appearance);
  }
  listMarkets() { return this.value.markets.map(({ index, ...source }) => ({ ...source, count: index?.applications.length ?? 0, refreshing: this.pending.has(source.id) })); }
  async addMarket(name: string, url: string) {
    const normalized = new URL(marketURL.parse(url)).href;
    await this.update(draft => {
      if (draft.markets.some(source => source.url === normalized)) throw new Error("市场源已存在");
      draft.markets.push({ id: crypto.randomUUID(), name, url: normalized, enabled: true, index: null, error: null, updatedAt: null });
    });
  }
  refresh(id?: string): Promise<void> {
    if (id && !this.value.markets.some(source => source.id === id)) throw new Error("市场源不存在");
    return Promise.all(this.value.markets.filter(source => source.enabled && (!id || source.id === id)).map(source => {
      const existing = this.pending.get(source.id);
      if (existing) return existing;
      const operation = (async () => {
        try {
          const bytes = await download(source.url, 2 * 1024 * 1024, AbortSignal.any([this.controller.signal, AbortSignal.timeout(15000)]), this.fetcher);
          const value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
          if (value.schemaVersion !== 2) throw new Error("该市场使用旧插件协议，请添加 Cordis 应用市场源");
          const index = applicationIndex.parse(value);
          await this.update(draft => { const record = draft.markets.find(item => item.id === source.id); if (record) Object.assign(record, { index, error: null, updatedAt: Date.now() }); });
        } catch (error) {
          await this.update(draft => { const record = draft.markets.find(item => item.id === source.id); if (record) record.error = source.id === "official" && String(error).includes("404")
            ? "官方 Cordis 市场尚未发布，可添加自定义市场或从地址安装。" : String(error).slice(0, 1000); });
        } finally { this.pending.delete(source.id); this.changed(); }
      })();
      this.pending.set(source.id, operation); this.changed(); return operation;
    })).then(() => {});
  }
  catalog(installed: GenerationApplication[], core: Record<string, string>): CatalogEntry[] {
    return this.value.markets.filter(source => source.enabled).flatMap(source => (source.index?.applications ?? []).map(entry => {
      const app = installed.find(app => app.id === entry.id);
      const compatible = entry.core["@semicoder/fn-sdk"] === core["@semicoder/fn-sdk"] && Object.entries(entry.core).every(([key, value]) => core[key] === value);
      const conflict = app && (app.packageName !== entry.packageName || app.origin?.marketId !== source.id || app.origin?.marketURL !== source.url);
      const state: CatalogEntry["state"] = conflict ? "conflict" : !compatible ? "incompatible" : !app ? "available" : Bun.semver.order(entry.version, app.version) > 0 ? "update" : "installed";
      return { ...entry, marketId: source.id, marketName: source.name, installedVersion: app?.version ?? null, state };
    }));
  }
  async resolve(marketId: string, appId: string, installed: GenerationApplication[], core: Record<string, string>) {
    await this.refresh(marketId);
    const source = this.value.markets.find(source => source.id === marketId);
    if (!source?.enabled || source.error) throw new Error(source?.error ?? "市场源不存在或已停用");
    const entry = this.catalog(installed, core).find(entry => entry.marketId === marketId && entry.id === appId);
    if (!entry || entry.state === "incompatible" || entry.state === "conflict") throw new Error("应用不可安装：已下架、核心不兼容或安装来源冲突");
    if (entry.installedVersion && Bun.semver.order(entry.version, entry.installedVersion) < 0) throw new Error("市场版本低于已安装版本，不能通过更新降级");
    return { entry, origin: { source: entry.url, marketId, marketURL: source.url } };
  }
  async stop() { this.controller.abort(); await Promise.allSettled(this.pending.values()); await this.queue; }
}
