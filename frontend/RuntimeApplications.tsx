import PluginIcon from "./PluginIcon";
import React, { useEffect, useState } from "react";
import { native } from "@semicoder/fia/client";
import { readAllPages } from "@semicoder/fn-sdk/cordis-client";
import { runtimeClient as client } from "./runtime-bridge";
const applications = () => client.call("apps.list", {});
const markets = () => client.call("market.list", {});
const entries = () => client.call("market.catalog", {});
type App = Awaited<ReturnType<typeof applications>>[number];
type Market = Awaited<ReturnType<typeof markets>>[number];
type Entry = Awaited<ReturnType<typeof entries>>["items"][number];
type Action = (operation: () => Promise<unknown>) => Promise<void>;
const labels: Record<Entry["state"], string> = { available: "安装", installed: "已安装", update: "更新", incompatible: "核心版本不兼容", conflict: "安装来源不同" };

export default function RuntimeApplications({ apps, action, open, busy }: { apps: App[]; action: Action; open: (id: string) => void; busy: boolean }) {
  const [tab, setTab] = useState("market");
  const [sources, setSources] = useState<Market[]>([]);
  const [catalog, setCatalog] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<"sources" | "install" | null>(null);
  const [source, setSource] = useState("");
  const [marketName, setMarketName] = useState("");
  const [marketAddress, setMarketAddress] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true, revision = 0;
    const read = () => {
      const request = ++revision;
      void Promise.all([markets(), readAllPages((offset, limit) => client.call("market.catalog", { query, offset, limit }))])
        .then(([sources, entries]) => { if (alive && request === revision) { setSources(sources); setCatalog(entries); } })
        .catch(caught => { if (alive) setError(String(caught)); });
    };
    read(); const off = client.on("runtime.changed", read), reconnect = client.onReconnect(read);
    return () => { alive = false; off(); reconnect(); };
  }, [query]);
  const installed = apps.filter(app => app.id !== "fn-chat");
  const searching = sources.some(source => source.refreshing);
  const perform = (operation: () => Promise<unknown>) => {
    setError("");
    return action(async () => { try { return await operation(); } catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); throw caught; } });
  };
  return <section className="runtime-settings product-apps">
    <div className="product-heading"><div><h1>应用中心</h1><p className="runtime-muted">发现、安装和管理你的插件。</p></div><div className="runtime-actions"><button onClick={() => setDialog("sources")}>市场源</button><button onClick={() => setDialog("install")}>从地址安装</button></div></div>
    {error && <p className="product-alert" role="alert">{error}</p>}
    <div className="product-heading"><div className="product-tabs" role="tablist" aria-label="应用来源"><button role="tab" aria-selected={tab === "market"} onClick={() => setTab("market")}>插件市场</button><button role="tab" aria-selected={tab === "installed"} onClick={() => setTab("installed")}>已安装 · {installed.length}</button></div>
      <button disabled={searching} onClick={() => void perform(() => client.call("market.refresh", {}))}>{searching ? "正在检查…" : "检查更新"}</button></div>
    {tab === "market" && <><input aria-label="搜索插件" placeholder="搜索应用名称、描述或包名" value={query} onChange={event => setQuery(event.target.value)} />
      {sources.filter(source => source.enabled && source.error).map(source => <p className="product-alert" role="status" key={source.id}>{source.name}：{source.error}</p>)}
      {!catalog.length && <div className="product-empty"><h2>{searching ? "正在读取市场…" : "暂无可显示的应用"}</h2><p>点击“检查更新”读取市场目录，或添加市场源、从地址安装。</p></div>}
      <div className="product-list">{catalog.map(entry => <article className="product-row" key={`${entry.marketId}:${entry.id}`}><span className="product-avatar"><PluginIcon icon={entry.icon ?? entry.name.slice(0, 1)} iconSvg={entry.iconSvg} /></span><div className="product-row-main"><strong>{entry.name}</strong><p>{entry.description}</p><small>v{entry.version} · {entry.marketName}{entry.installedVersion && ` · 已安装 ${entry.installedVersion}`}</small></div><button disabled={busy || !["available", "update"].includes(entry.state)} onClick={() => void perform(() => client.call("market.install", { marketId: entry.marketId, appId: entry.id }))}>{labels[entry.state]}</button></article>)}</div>
    </>}
    {tab === "installed" && <div className="product-list">{installed.map(app => {
      const update = catalog.find(entry => entry.id === app.id && entry.state === "update");
      return <article className="product-row" key={app.id}><span className="product-avatar"><PluginIcon icon={app.icon ?? app.name.slice(0, 1)} iconSvg={app.iconSvg} /></span><div className="product-row-main"><strong>{app.name} <span className="product-badge">{app.status === "error" ? "加载失败" : app.enabled ? "已启用" : "已停用"}</span></strong><p>{app.description ?? app.packageName}</p><small>v{app.version} · {sources.find(source => source.id === app.origin?.marketId)?.name ?? (app.origin?.source ? "从地址安装" : "本地安装")}{update && ` · 新版本 ${update.version}`}</small>{app.error && <p role="alert">{app.error}</p>}</div>
        <div className="runtime-actions">{app.clientURL && app.enabled && <button onClick={() => open(app.id)}>打开</button>}<button disabled={busy || !app.origin} title={!app.origin ? "从地址重新安装以记录更新来源" : undefined} onClick={() => void perform(() => client.call("apps.update", { appId: app.id }))}>更新</button><button disabled={busy} onClick={() => void perform(() => client.call("apps.enable", { appId: app.id, enabled: !app.enabled }))}>{app.enabled ? "停用" : "启用"}</button><button disabled={busy} onClick={() => void perform(() => client.call("apps.remove", { appId: app.id }))}>卸载</button></div>
      </article>;
    })}{!installed.length && <div className="product-empty">还没有安装应用，前往插件市场或从地址安装。</div>}</div>}
    <p className="product-footnote">插件可执行本机代码，请只安装可信来源。更新等待任务空闲后重启后台，窗口保留；页面会重新加载，请先保存草稿。卸载不删除已保存的会话与 KV。</p>
    {dialog && <div className="runtime-modal-backdrop"><section className="runtime-modal product-market-modal" role="dialog" aria-modal="true" aria-label={dialog === "sources" ? "市场源" : "从地址安装"}><header><h2>{dialog === "sources" ? "市场源" : "从地址安装"}</h2><button aria-label="关闭" onClick={() => setDialog(null)}>×</button></header>
      {error && <p role="alert" className="product-alert">{error}</p>}
      {dialog === "install" ? <form className="runtime-form" onSubmit={event => { event.preventDefault(); void perform(async () => { await client.call("apps.install", { source }); setDialog(null); setTab("installed"); }); }}><label>应用包地址<input value={source} onChange={event => setSource(event.target.value)} placeholder="HTTPS 归档、Git 地址、npm 包名或本地 .tgz 路径" required /></label><button disabled={busy} className="runtime-primary">安装应用</button></form> : <>
        {sources.map(source => <article className="runtime-card" key={source.id}><strong>{source.name}</strong><p className="product-url">{source.url}</p><small>{source.count} 个应用{source.updatedAt && ` · ${new Date(source.updatedAt).toLocaleString()}`}</small>{source.error && <p role="alert">{source.error}</p>}<div className="runtime-actions"><button disabled={source.refreshing} onClick={() => void perform(() => client.call("market.refresh", { id: source.id }))}>刷新</button><button onClick={() => void perform(() => client.call("market.change", { id: source.id, enabled: !source.enabled }))}>{source.enabled ? "停用" : "启用"}</button><button onClick={() => void perform(() => client.call("market.remove", { id: source.id }))}>移除</button></div></article>)}
        <form className="runtime-form" onSubmit={event => { event.preventDefault(); void perform(async () => { await client.call("market.add", { name: marketName, url: marketAddress }); setMarketName(""); setMarketAddress(""); await client.call("market.refresh", {}); }); }}><h2>添加市场源</h2><label>名称<input value={marketName} onChange={event => setMarketName(event.target.value)} required /></label><label>市场索引 URL<input type="url" value={marketAddress} onChange={event => setMarketAddress(event.target.value)} placeholder="https://example.com/marketplace.json" required /></label><button>添加市场源</button></form>
      </>}
    </section></div>}
  </section>;
}

export function RuntimeChatSettings({ action }: { action: Action }) {
  const [status, setStatus] = useState<{ status: string; lastSync: number | null; pending: number }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const read = () => { void client.call("chat.status", {}).then(value => { if (alive) setStatus(value as NonNullable<typeof status>); }).catch(caught => { if (alive) setError(String(caught)); }); };
    read(); const off = client.on("runtime.changed", read); return () => { alive = false; off(); };
  }, []);
  return <section className="runtime-settings"><h1>聊天同步</h1><p className="runtime-muted">通过 iCloud，让桌面和手机连接同一个会话。</p><article className="runtime-card"><h2>fn Chat</h2><p>{status?.status ?? "读取状态中…"}</p>{status?.lastSync && <p>上次同步 {new Date(status.lastSync).toLocaleString()}</p>}<div className="runtime-actions"><button onClick={() => void action(() => client.call("chat.connect", {}))}>连接 iCloud</button><button onClick={() => void action(() => client.call("chat.sync", {}))}>立即同步</button></div>{error && <p role="alert">{error}</p>}<p>只有通过 Chat 创建的会话参与同步，普通桌面会话不会自动上传。</p></article><button onClick={() => void native.system.openURL({ url: "https://semicoder.dev/fn" })}>查看 fn 官网</button></section>;
}
