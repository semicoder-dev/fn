import { classes } from "@semicoder/fn-ui";
const styles: Record<string, string> = {};
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import { Modal } from "@semicoder/fn-ui";
import { Button, Input, Textarea } from "@semicoder/fn-ui";
import React, { useEffect, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import type { APIClient, z } from "@semicoder/fia/api";
import { client, readAllPages } from "@semicoder/fn-sdk/client";
import { IconCordisPluginOutlineRegular } from "@semicoder/fn-ui";
import type {} from "@semicoder/fn-ui-layout/contract";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import api, { statusSchema, pluginInfo } from "@semicoder/fn-plugin-manager/contract";
import marketApi from "@semicoder/fn-plugin-market/contract";
import type { CatalogEntry } from "@semicoder/fn-plugin-market/schema";
import type { Profile } from "@semicoder/fn-host";
export const inject = [
  "layoutSlots",
  "api:plugins",
  "api:market",
  "slots",
  "navigation",
  "platform",
];
type Remote = {
  plugins: APIClient<typeof api>;
  market: APIClient<typeof marketApi>;
};
type Status = z.infer<typeof statusSchema>;
function useStatus(remote: Remote) {
  const [status, setStatus] = useState<Status>();
  useEffect(() => {
    let alive = true;
    const read = () =>
      void remote.plugins
        .call("status", {})
        .then((value) => {
          if (alive) setStatus(value);
        })
        .catch(() => {});
    const off = remote.plugins.on("changed", read),
      reconnect = remote.plugins.onReconnect(read);
    read();
    return () => {
      alive = false;
      off();
      reconnect();
    };
  }, []);
  return status;
}
const phaseLabels: Record<string, string> = {
  catalog: "读取市场",
  download: "下载插件",
  extract: "校验归档",
  copy: "准备运行目录",
  dependencies: "解析插件依赖",
  verify: "验证共享核心",
  preflight: "检查插件启动",
};
function UpdateBanner({ remote }: { remote: Remote }) {
  const status = useStatus(remote);
  if (!status || (!status.installing && !status.pending && !status.error)) return null;
  return (
    <div className={cx(status.error ? "runtime-error" : "runtime-banner")} role="status">
      <span>
        {status.error ??
          (status.installing
            ? `${phaseLabels[status.phase ?? ""] ?? "准备插件"}…`
            : status.busy
              ? "插件已准备，等待任务空闲后重启后台。"
              : "插件已准备，正在重新连接…")}
      </span>
      {status.error && status.pending && (
        <Button onClick={() => void remote.plugins.call("activate", {})} type="button">
          重试应用
        </Button>
      )}
    </div>
  );
}
function PluginsPage({ remote }: { remote: Remote }) {
  const [tab, setTab] = useState("market"),
    [query, setQuery] = useState("");
  const [packages, setPackages] = useState<z.infer<typeof pluginInfo>[]>([]),
    [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [markets, setMarkets] = useState<Awaited<ReturnType<typeof readMarkets>>>([]);
  const [profile, setProfile] = useState<Profile>(),
    [editor, setEditor] = useState<string | null>(null);
  const [source, setSource] = useState(""),
    [installOpen, setInstallOpen] = useState(false),
    [marketsOpen, setMarketsOpen] = useState(false);
  const [sourceName, setSourceName] = useState(""),
    [sourceURL, setSourceURL] = useState("");
  const [error, setError] = useState(""),
    [working, setWorking] = useState(false);
  const status = useStatus(remote),
    busy = working || status?.installing || status?.pending;
  const readMarkets = () => remote.market.call("list", {});
  async function refresh() {
    const [packages, catalog, markets, profile] = await Promise.all([
      remote.plugins.call("list", {}),
      readAllPages((offset, limit) => remote.market.call("catalog", { offset, limit })),
      readMarkets(),
      remote.plugins.call("profile", {}),
    ]);
    setPackages(packages);
    setCatalog(catalog);
    setMarkets(markets);
    setProfile(profile);
  }
  useEffect(() => {
    let alive = true;
    const read = () => {
      if (alive)
        void refresh().catch((error) => {
          if (alive) setError(String(error));
        });
    };
    const off = [
      remote.plugins.on("changed", read),
      remote.market.on("changed", read),
      remote.plugins.onReconnect(read),
    ];
    read();
    void remote.market.call("refresh", {}).catch((error) => setError(String(error)));
    return () => {
      alive = false;
      off.forEach((stop) => stop());
    };
  }, []);
  async function action(run: () => Promise<unknown>) {
    if (working) return;
    setWorking(true);
    setError("");
    try {
      await run();
      await refresh();
    } catch (error) {
      setError(String(error));
    } finally {
      setWorking(false);
    }
  }
  const enabled = (name: string) =>
    [...(profile?.plugins ?? []), ...(profile?.client ?? [])].some(
      (row) => (row.name === name || row.name === `${name}/client`) && !row.disabled,
    );
  const toggle = (name: string) => {
    if (!profile) return;
    const next = structuredClone(profile),
      disabled = enabled(name);
    for (const rows of [next.plugins, next.client])
      for (const row of rows)
        if (row.name === name || row.name === `${name}/client`) row.disabled = disabled;
    return remote.plugins.call("configure", next);
  };
  return (
    <section className={cx("runtime-settings product-apps")}>
      <div className={cx("product-heading")}>
        <div>
          <h1>应用中心</h1>
          <p className={cx("runtime-muted")}>发现、安装和管理你的插件。</p>
        </div>
        <div className={cx("runtime-actions")}>
          <Button onClick={() => setMarketsOpen(true)} type="button">
            市场源
          </Button>
          <Button onClick={() => setInstallOpen(true)} type="button">
            从地址安装
          </Button>
        </div>
      </div>
      <div className={cx("product-tabs")}>
        <Button
          className={cx(tab === "market" ? "selected" : "")}
          onClick={() => setTab("market")}
          type="button"
        >
          插件市场
        </Button>
        <Button
          className={cx(tab === "installed" ? "selected" : "")}
          onClick={() => setTab("installed")}
          type="button"
        >
          已安装 · {packages.length}
        </Button>
        <Button
          className={cx(tab === "profile" ? "selected" : "")}
          onClick={() => setTab("profile")}
          type="button"
        >
          默认组合
        </Button>
        <Button
          disabled={working}
          onClick={() => void action(() => remote.market.call("refresh", {}))}
          type="button"
        >
          检查更新
        </Button>
      </div>
      {error && (
        <p role="alert" className={cx("product-alert")}>
          {error}
        </p>
      )}
      {tab !== "profile" && (
        <Input
          aria-label="搜索插件"
          placeholder="搜索名称、描述或包名"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      )}
      {tab === "market" && (
        <>
          <div className={cx("product-list")}>
            {catalog
              .filter((entry) =>
                `${entry.name} ${entry.description} ${entry.packageName}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )
              .map((entry) => (
                <article
                  className={cx("product-row")}
                  key={`${entry.marketId}:${entry.packageName}`}
                >
                  <div className={cx("product-row-main")}>
                    <strong>{entry.name}</strong>
                    <p>{entry.description}</p>
                    <small>
                      v{entry.version} · {entry.marketName}
                    </small>
                  </div>
                  <Button
                    disabled={
                      busy || ["installed", "incompatible", "conflict"].includes(entry.state)
                    }
                    onClick={() =>
                      void action(() =>
                        remote.market.call("install", { marketId: entry.marketId, id: entry.id }),
                      )
                    }
                    type="button"
                  >
                    {
                      {
                        available: "安装",
                        update: "更新",
                        installed: "已安装",
                        incompatible: "核心版本不兼容",
                        conflict: "来源冲突",
                      }[entry.state]
                    }
                  </Button>
                </article>
              ))}
          </div>
          {!catalog.length && (
            <p className={cx("product-empty")}>
              市场暂无插件。可以添加市场源或从地址安装可信插件。
            </p>
          )}
          {markets
            .filter((market) => market.enabled && market.error)
            .map((market) => (
              <p role="alert" key={market.id}>
                {market.name}：{market.error}
              </p>
            ))}
        </>
      )}
      {tab === "installed" && (
        <div className={cx("product-list")}>
          {packages
            .filter((plugin) =>
              `${plugin.name} ${plugin.packageName}`.toLowerCase().includes(query.toLowerCase()),
            )
            .map((plugin) => (
              <article className={cx("product-row")} key={plugin.id}>
                <div className={cx("product-row-main")}>
                  <strong>
                    {plugin.name} <small>{enabled(plugin.packageName) ? "已启用" : "已停用"}</small>
                  </strong>
                  <p>{plugin.description}</p>
                  <small>
                    v{plugin.version} · {plugin.packageName}
                  </small>
                </div>
                <div className={cx("runtime-actions")}>
                  <Button
                    disabled={busy || !plugin.origin}
                    onClick={() =>
                      void action(() => remote.plugins.call("update", { id: plugin.id }))
                    }
                    type="button"
                  >
                    更新
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => void action(async () => toggle(plugin.packageName))}
                    type="button"
                  >
                    {enabled(plugin.packageName) ? "停用" : "启用"}
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void action(() => remote.plugins.call("remove", { id: plugin.id }))
                    }
                    type="button"
                  >
                    卸载
                  </Button>
                </div>
              </article>
            ))}
          {!packages.length && <p className={cx("product-empty")}>尚未安装扩展插件。</p>}
        </div>
      )}
      {tab === "profile" && (
        <>
          <p>默认组合也由插件构成。修改后等待任务空闲，重新启动后台并恢复窗口。</p>
          <Button
            disabled={busy || !profile}
            onClick={() => setEditor(JSON.stringify(profile, null, 2))}
            type="button"
          >
            编辑组合配置
          </Button>
          <div className={cx("product-list")}>
            {profile &&
              (["plugins", "client"] as const).flatMap((side) =>
                profile[side].map((row) => (
                  <article className={cx("product-row")} key={`${side}:${row.id}`}>
                    <div className={cx("product-row-main")}>
                      <strong>{row.id}</strong>
                      <small>
                        {side === "client" ? "前端" : "后端"} · {row.name}
                      </small>
                    </div>
                    <Button
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const next = structuredClone(profile);
                          next[side].find((entry) => entry.id === row.id)!.disabled = !row.disabled;
                          await remote.plugins.call("configure", next);
                        })
                      }
                      type="button"
                    >
                      {row.disabled ? "启用" : "停用"}
                    </Button>
                  </article>
                )),
              )}
          </div>
        </>
      )}
      <p className={cx("runtime-muted product-section")}>
        插件可执行本机代码，请只安装可信来源。更新等待任务空闲后重启后台；页面会重新加载，请先保存草稿。
      </p>
      {installOpen && (
        <Modal
          open
          onClose={() => setInstallOpen(false)}
          title={"从地址安装"}
          closeLabel="关闭"
          className={cx("runtime-dialog")}
          contentClassName={cx("dialog-content")}
        >
          <form
            className={cx("runtime-form")}
            onSubmit={(event) => {
              event.preventDefault();
              void action(async () => {
                await remote.plugins.call("install", { source });
                setInstallOpen(false);
              });
            }}
          >
            <label>
              归档路径、HTTPS 地址或 Git 来源
              <Input value={source} onChange={(event) => setSource(event.target.value)} required />
            </label>
            <Button disabled={busy} type="submit">
              安装
            </Button>
          </form>
        </Modal>
      )}
      {marketsOpen && (
        <Modal
          open
          onClose={() => setMarketsOpen(false)}
          title={"市场源"}
          closeLabel="关闭"
          className={cx("runtime-dialog")}
          contentClassName={cx("dialog-content")}
        >
          {markets.map((market) => (
            <article key={market.id}>
              <strong>{market.name}</strong>
              <p>{market.url}</p>
              <Button
                onClick={() =>
                  void action(() =>
                    remote.market.call("change", { id: market.id, enabled: !market.enabled }),
                  )
                }
                type="button"
              >
                {market.enabled ? "停用" : "启用"}
              </Button>
              <Button
                onClick={() => void action(() => remote.market.call("remove", { id: market.id }))}
                type="button"
              >
                删除
              </Button>
            </article>
          ))}

          <form
            className={cx("runtime-form")}
            onSubmit={(event) => {
              event.preventDefault();
              void action(async () => {
                await remote.market.call("add", { name: sourceName, url: sourceURL });
                setSourceName("");
                setSourceURL("");
              });
            }}
          >
            <label>
              名称
              <Input
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                required
              />
            </label>
            <label>
              HTTPS 地址
              <Input
                type="url"
                value={sourceURL}
                onChange={(event) => setSourceURL(event.target.value)}
                required
              />
            </label>
            <Button type="submit">添加市场源</Button>
          </form>
        </Modal>
      )}
      {editor !== null && (
        <Modal
          open
          onClose={() => setEditor(null)}
          title={"插件组合"}
          closeLabel="关闭"
          className={cx("runtime-dialog")}
          contentClassName={cx("dialog-content")}
        >
          <form
            className={cx("runtime-form")}
            onSubmit={(event) => {
              event.preventDefault();
              void action(async () => {
                await remote.plugins.call("configure", JSON.parse(editor));
                setEditor(null);
              });
            }}
          >
            <p>实例 ID 与包名独立。同一包可配置多个实例；客户端布局可整体替换。</p>
            <Textarea
              aria-label="插件组合 JSON"
              rows={18}
              value={editor}
              onChange={(event) => setEditor(event.target.value)}
            />
            <Button disabled={busy} type="submit">
              验证并应用
            </Button>
          </form>
        </Modal>
      )}
    </section>
  );
}
export function apply(ctx: Context) {
  const remote = { plugins: client(ctx, "plugins", api), market: client(ctx, "market", marketApi) };
  ctx.slots.register({ name: "fn.sidebar.bottom", id: "plugins", order: 0 }, () => (
    <NavigationButton navigation={ctx.navigation} path="plugins" label="应用中心" compact>
      <IconCordisPluginOutlineRegular />
    </NavigationButton>
  ));
  ctx.slots.register({ name: "fn.main", key: "plugins", inject: () => ({ remote }) }, PluginsPage);
  ctx.slots.register(
    { name: "fn.status", id: "plugin-update", inject: () => ({ remote }) },
    UpdateBanner,
  );
}
