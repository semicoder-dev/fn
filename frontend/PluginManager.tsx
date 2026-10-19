import React, { useCallback, useEffect, useRef, useState } from "react";
import PluginIcon from "./PluginIcon";
import {
  Alert,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
  Badge,
  Button,
  Input,
  Page,
  PageHeader,
  Panel,
  Loading,
  EmptyState,
  Tabs,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Field,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@semicoder/fn-sdk/ui";
import type { InstallJob, PluginInfo } from "@semicoder/fn-sdk/types";
import type { CatalogPage, MarketInfo } from "../shared/marketplace";
import { app } from "./bridge";
import { native } from "@semicoder/fia/client";

export default function PluginManager({
  plugins,
  open,
  visible = true,
}: {
  plugins: PluginInfo[];
  open: (id: string) => void;
  visible?: boolean;
}) {
  const [tab, setTab] = useState("market");
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [catalog, setCatalog] = useState<CatalogPage>({ items: [], total: 0, nextOffset: null });
  const [jobs, setJobs] = useState<InstallJob[]>([]);
  const [query, setQuery] = useState("");
  const [marketId, setMarketId] = useState("all");
  const [offset, setOffset] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [sourceURL, setSourceURL] = useState("");
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [manual, setManual] = useState<{ pluginId?: string } | null>(null);
  const [source, setSource] = useState("");
  const [removing, setRemoving] = useState<PluginInfo | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const [sources, page, tasks] = await Promise.all([
        app.call("marketplaces.list", {}),
        app.call("marketplaces.catalog", {
          query,
          ...(marketId === "all" ? {} : { marketId }),
          offset,
          limit: 20,
        }),
        app.call("plugins.jobs", {}),
      ]);
      if (request !== generation.current) return;
      setMarkets(sources);
      setCatalog(page);
      setJobs(tasks);
      setLoading(false);
    } catch (e) {
      if (request === generation.current) {
        setError(String(e));
        setLoading(false);
      }
    }
  }, [query, marketId, offset]);
  useEffect(() => {
    const off = app.on("plugins.changed", () => void refresh());
    const marketOff = app.on("marketplaces.changed", () => void refresh());
    const reconnect = app.onReconnect(() => void refresh());
    void refresh();
    return () => {
      generation.current++;
      off();
      marketOff();
      reconnect();
    };
  }, [refresh]);
  useEffect(() => {
    if (visible && tab === "market")
      void app.call("marketplaces.refresh", {}).catch((e) => setError(String(e)));
  }, [visible, tab]);
  const act = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError("");
    try {
      await action();
      await refresh();
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setPending(false);
    }
  };
  const installing = pending || jobs.some((job) => job.status === "installing");
  const refreshing = markets.some((market) => market.refreshing);
  const labels = {
    available: "未安装",
    installed: "已安装",
    update: "可更新",
    incompatible: "SDK 不兼容",
    conflict: "已从其他来源安装",
  };
  return (
    <Page>
      <PageHeader
        title="应用中心"
        description="发现、安装和管理你的插件。"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSourcesOpen(true)}>
              市场源
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSource("");
                setManual({});
              }}
            >
              从地址安装
            </Button>
          </div>
        }
      />
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList>
          <TabsTrigger value="market">插件市场</TabsTrigger>
          <TabsTrigger value="installed">已安装 · {plugins.length}</TabsTrigger>
        </TabsList>
      </Tabs>
      {error && <Alert>{error}</Alert>}
      {jobs.slice(0, 2).map((job) => (
        <div className={`job-row ${job.status}`} role="status" key={job.id}>
          {job.status === "installing" && <Loading />}
          <div>
            <strong>{job.message}</strong>
            <small>
              {job.operation === "update" ? "更新" : "安装"} {job.pluginId ?? ""}{" "}
              {job.targetVersion ? `→ ${job.targetVersion}` : ""}
            </small>
          </div>
        </div>
      ))}
      {tab === "market" ? (
        <>
          <div className="market-toolbar">
            <Input
              aria-label="搜索插件"
              placeholder="搜索插件名称或描述"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOffset(0);
              }}
            />
            <Select
              value={marketId}
              onValueChange={(value) => {
                setMarketId(String(value));
                setOffset(0);
              }}
            >
              <SelectTrigger aria-label="筛选市场">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部市场</SelectItem>
                {markets
                  .filter((m) => m.enabled)
                  .map((m) => (
                    <SelectItem value={m.id} key={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              disabled={refreshing || pending}
              onClick={() => void act(() => app.call("marketplaces.refresh", {}))}
            >
              {refreshing ? "正在检查…" : "检查更新"}
            </Button>
          </div>
          {markets
            .filter((m) => m.enabled && m.error)
            .map((m) => (
              <Alert key={m.id}>
                {m.name}：{m.error}。
                {m.updatedAt
                  ? `显示 ${new Date(m.updatedAt).toLocaleString()} 的缓存；安装前需重新连接。`
                  : "暂时无法读取市场，请稍后重试。"}
              </Alert>
            ))}
          {loading ? (
            <Loading />
          ) : catalog.items.length === 0 ? (
            <EmptyState
              title={markets.some((m) => m.enabled) ? "暂无可显示的插件" : "尚未启用市场源"}
              description="可以调整搜索条件、配置市场源，或从地址安装插件。"
            />
          ) : (
            <div className="plugin-list">
              {catalog.items.map((entry) => (
                <div className="plugin-row" key={`${entry.marketId}:${entry.id}`}>
                  <span className="app-icon" style={{ background: entry.color }}>
                    <PluginIcon icon={entry.icon} iconSvg={entry.iconSvg} />
                  </span>
                  <div className="plugin-row-info">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3>{entry.name}</h3>
                      <Badge>{labels[entry.state]}</Badge>
                    </div>
                    <p>{entry.description}</p>
                    <small>
                      {entry.marketName} · v{entry.version}
                      {entry.state === "update" ? ` · 当前 v${entry.installedVersion}` : ""}
                    </small>
                  </div>
                  {entry.state === "available" && (
                    <Button
                      disabled={installing}
                      onClick={() =>
                        void act(() =>
                          app.call("plugins.installFromMarket", {
                            marketId: entry.marketId,
                            pluginId: entry.id,
                          }),
                        )
                      }
                    >
                      安装
                    </Button>
                  )}
                  {entry.state === "update" && (
                    <Button
                      disabled={installing}
                      onClick={() =>
                        void act(() => app.call("plugins.update", { pluginId: entry.id }))
                      }
                    >
                      更新
                    </Button>
                  )}
                  {entry.state === "installed" && (
                    <Button
                      variant="secondary"
                      disabled={!plugins.some((p) => p.id === entry.id && p.status === "active")}
                      onClick={() => open(entry.id)}
                    >
                      打开
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          {catalog.total > 20 && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 20))}
              >
                上一页
              </Button>
              <span>
                {offset + 1}–{Math.min(offset + 20, catalog.total)} / {catalog.total}
              </span>
              <Button
                variant="secondary"
                disabled={catalog.nextOffset === null}
                onClick={() => setOffset(catalog.nextOffset!)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      ) : plugins.length === 0 ? (
        <EmptyState
          title="还没有安装插件"
          description="前往插件市场选择需要的插件，或从地址安装。"
        />
      ) : (
        <div className="plugin-list">
          {plugins.map((plugin) => (
            <div className="plugin-row" key={plugin.id}>
              <span className="app-icon" style={{ background: plugin.color }}>
                <PluginIcon icon={plugin.icon} iconURL={plugin.iconURL} />
              </span>
              <div className="plugin-row-info">
                <div className="flex flex-wrap items-center gap-2">
                  <h3>{plugin.name}</h3>
                  <Badge tone={plugin.status === "error" ? "error" : "neutral"}>
                    {plugin.status === "active"
                      ? "已启用"
                      : plugin.status === "error"
                        ? "加载失败"
                        : "已停用"}
                  </Badge>
                </div>
                <p>{plugin.description}</p>
                <small>
                  v{plugin.version} ·{" "}
                  {plugin.market
                    ? (markets.find((m) => m.id === plugin.market?.marketId)?.name ??
                      "原市场已删除")
                    : "手动安装"}
                </small>
                {plugin.error && <Alert>{plugin.error}</Alert>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={plugin.status !== "active"}
                  onClick={() => open(plugin.id)}
                >
                  打开
                </Button>
                <Button
                  variant="secondary"
                  disabled={installing}
                  onClick={() => {
                    if (plugin.market)
                      void act(() => app.call("plugins.update", { pluginId: plugin.id }));
                    else {
                      setSource("");
                      setManual({ pluginId: plugin.id });
                    }
                  }}
                >
                  更新
                </Button>
                <Button
                  variant="ghost"
                  disabled={installing}
                  onClick={() =>
                    void act(() =>
                      app.call("plugins.setEnabled", {
                        pluginId: plugin.id,
                        enabled: !plugin.enabled,
                      }),
                    )
                  }
                >
                  {plugin.enabled ? "停用" : "启用"}
                </Button>
                <Button variant="ghost" disabled={installing} onClick={() => setRemoving(plugin)}>
                  卸载
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="install-note">
        插件可执行本机代码，请只安装可信来源。更新会重新加载插件页面，请先保存草稿。
      </p>
      <Dialog open={sourcesOpen} onOpenChange={setSourcesOpen}>
        <DialogContent>
          <DialogTitle>市场源</DialogTitle>
          <DialogDescription>添加 HTTPS 市场索引。删除或停用源不会卸载插件。</DialogDescription>
          <div className="flex flex-col gap-3">
            {markets.map((market) => (
              <Panel key={market.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="flex-1">{market.name}</strong>
                  <Badge>{market.enabled ? "已启用" : "已停用"}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      setEditingSource(market.id);
                      setSourceName(market.name);
                      setSourceURL(market.url);
                    }}
                  >
                    重命名
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      void act(() =>
                        app.call("marketplaces.update", {
                          id: market.id,
                          enabled: !market.enabled,
                        }),
                      )
                    }
                  >
                    {market.enabled ? "停用" : "启用"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      void act(() => app.call("marketplaces.remove", { id: market.id })).then(
                        (ok) => {
                          if (ok) {
                            if (marketId === market.id) setMarketId("all");
                            if (editingSource === market.id) {
                              setEditingSource(null);
                              setSourceName("");
                              setSourceURL("");
                            }
                          }
                        },
                      )
                    }
                  >
                    删除
                  </Button>
                </div>
                <p className="break-all text-sm text-muted">{market.url}</p>
                <small>
                  {market.updatedAt
                    ? `上次成功更新：${new Date(market.updatedAt).toLocaleString()}`
                    : "尚未获取索引"}
                </small>
              </Panel>
            ))}
            <Field label="名称">
              <Input value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
            </Field>
            <Field label="索引 URL">
              <Input
                placeholder="https://example.com/marketplace.json"
                disabled={!!editingSource}
                value={sourceURL}
                onChange={(e) => setSourceURL(e.target.value)}
              />
            </Field>
            {error && <Alert>{error}</Alert>}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setEditingSource(null);
                setSourceName("");
                setSourceURL("");
                setSourcesOpen(false);
              }}
            >
              关闭
            </Button>
            <Button
              disabled={pending || !sourceName.trim() || !sourceURL.trim()}
              onClick={() =>
                void act(async () => {
                  if (editingSource)
                    await app.call("marketplaces.update", { id: editingSource, name: sourceName });
                  else {
                    const added = await app.call("marketplaces.add", {
                      name: sourceName,
                      url: sourceURL,
                    });
                    void app
                      .call("marketplaces.refresh", { id: added.id })
                      .catch((e) => setError(String(e)));
                  }
                  setEditingSource(null);
                  setSourceName("");
                  setSourceURL("");
                })
              }
            >
              {editingSource ? "保存名称" : "添加市场"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!manual}
        onOpenChange={(value) => {
          if (!value && !pending) setManual(null);
        }}
      >
        <DialogContent>
          <DialogTitle>{manual?.pluginId ? "从地址更新插件" : "从地址安装插件"}</DialogTitle>
          <DialogDescription>
            支持 npm 包名、Git 地址或本地 .tgz 绝对路径。更新须使用同一插件的更高版本。
          </DialogDescription>
          <Field label="插件安装来源">
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="npm 包名、Git 地址或本地归档路径"
            />
          </Field>
          {error && <Alert>{error}</Alert>}
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={installing}
              onClick={() =>
                void native.dialogs
                  .openFiles({ multiple: false })
                  .then((paths) => {
                    if (paths?.[0]) setSource(paths[0]);
                  })
                  .catch((e) => setError(String(e)))
              }
            >
              选择文件
            </Button>
            <Button
              disabled={installing || !source.trim()}
              onClick={() =>
                void act(() =>
                  manual?.pluginId
                    ? app.call("plugins.update", { pluginId: manual.pluginId, source })
                    : app.call("plugins.install", { source }),
                ).then((ok) => {
                  if (ok) setManual(null);
                })
              }
            >
              {manual?.pluginId ? "更新" : "安装"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!removing}
        onOpenChange={(value) => {
          if (!value && !pending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>卸载 {removing?.name}？</AlertDialogTitle>
          <AlertDialogDescription>插件将被移除，KV 数据和历史记录保留。</AlertDialogDescription>
          {error && <Alert>{error}</Alert>}
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="secondary" disabled={pending} />}>
              取消
            </AlertDialogClose>
            <Button
              variant="danger"
              loading={pending}
              onClick={() => {
                if (removing)
                  void act(() => app.call("plugins.uninstall", { pluginId: removing.id })).then(
                    (ok) => {
                      if (ok) setRemoving(null);
                    },
                  );
              }}
            >
              卸载
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
}
