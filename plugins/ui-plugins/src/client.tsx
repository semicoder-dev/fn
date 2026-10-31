import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import { Modal } from "@semicoder/fn-ui";
import {
  Button,
  Input,
  Textarea,
  PageHeader,
  SegmentedControl,
  Tag,
  IconPlusOutlineRegular,
  IconRefreshOutlineRegular,
} from "@semicoder/fn-ui";
import React, { useEffect, useId, useState } from "react";
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
              ? "插件已准备，等待任务空闲后应用。"
              : "插件已准备，正在应用更新…")}
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
  const tabsId = useId();
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
  const search = query.trim().toLowerCase();
  const visibleCatalog = catalog.filter((entry) =>
    `${entry.name} ${entry.description} ${entry.packageName}`.toLowerCase().includes(search),
  );
  const visiblePackages = packages.filter((plugin) =>
    `${plugin.name} ${plugin.description} ${plugin.packageName}`.toLowerCase().includes(search),
  );
  return (
    <section className={cx("runtime-settings product-apps")}>
      <PageHeader
        title="应用中心"
        description="发现、安装和管理你的插件。"
        actions={
          <div className={cx("header-actions")}>
            <Button variant="ghost" size="sm" onClick={() => setMarketsOpen(true)} type="button">
              市场源
            </Button>
            <Button variant="primary" size="sm" onClick={() => setInstallOpen(true)} type="button">
              <IconPlusOutlineRegular /> 从地址安装
            </Button>
          </div>
        }
      />
      <div className={cx("page-toolbar")}>
        <SegmentedControl
          id={tabsId}
          label="应用中心分类"
          value={tab}
          onChange={setTab}
          options={[
            { value: "market", label: "插件市场" },
            { value: "installed", label: `已安装 · ${packages.length}` },
            { value: "profile", label: "默认组合" },
          ]}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={working}
          onClick={() => void action(() => remote.market.call("refresh", {}))}
          type="button"
        >
          <IconRefreshOutlineRegular /> 检查更新
        </Button>
      </div>
      {error && (
        <p role="alert" className={cx("product-alert")}>
          {error}
        </p>
      )}
      <div id={`${tabsId}-${tab}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${tab}`}>
        {tab !== "profile" && (
          <Input
            className={cx("plugin-search")}
            aria-label="搜索插件"
            placeholder="搜索名称、描述或包名"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        {tab === "market" && (
          <>
            <div className={cx("product-list")}>
              {visibleCatalog.map((entry) => (
                <article
                  className={cx("product-row")}
                  key={`${entry.marketId}:${entry.packageName}`}
                >
                  <span className={cx("plugin-icon")} aria-hidden="true">
                    <IconCordisPluginOutlineRegular />
                  </span>
                  <div className={cx("product-row-main")}>
                    <strong>{entry.name}</strong>
                    {entry.description && (
                      <p className={cx("plugin-description")}>{entry.description}</p>
                    )}
                    <small>
                      v{entry.version} · {entry.marketName}
                    </small>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
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
              {!visibleCatalog.length && (
                <div className={cx("product-empty empty-state")}>
                  <IconCordisPluginOutlineRegular aria-hidden="true" />
                  <strong>{catalog.length ? "没有匹配的插件" : "市场暂无插件"}</strong>
                  <p>
                    {catalog.length
                      ? "试试其他名称、描述或包名。"
                      : "添加市场源，或从地址安装你信任的插件。"}
                  </p>
                </div>
              )}
            </div>
            {markets
              .filter((market) => market.enabled && market.error)
              .map((market) => (
                <p role="alert" className={cx("product-alert")} key={market.id}>
                  {market.name}：{market.error}
                </p>
              ))}
          </>
        )}
        {tab === "installed" && (
          <div className={cx("product-list")}>
            {visiblePackages.map((plugin) => (
              <article className={cx("product-row")} key={plugin.id}>
                <span className={cx("plugin-icon")} aria-hidden="true">
                  <IconCordisPluginOutlineRegular />
                </span>
                <div className={cx("product-row-main")}>
                  <div className={cx("title-row")}>
                    <strong>{plugin.name}</strong>
                    <Tag>{enabled(plugin.packageName) ? "已启用" : "已停用"}</Tag>
                  </div>
                  {plugin.description && (
                    <p className={cx("plugin-description")}>{plugin.description}</p>
                  )}
                  <small>
                    v{plugin.version} · {plugin.packageName}
                  </small>
                </div>
                <div className={cx("runtime-actions")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy || !plugin.origin}
                    onClick={() =>
                      void action(() => remote.plugins.call("update", { id: plugin.id }))
                    }
                    type="button"
                  >
                    更新
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void action(async () => toggle(plugin.packageName))}
                    type="button"
                  >
                    {enabled(plugin.packageName) ? "停用" : "启用"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cx("runtime-danger")}
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
            {!visiblePackages.length && (
              <div className={cx("product-empty empty-state")}>
                <IconCordisPluginOutlineRegular aria-hidden="true" />
                <strong>{packages.length ? "没有匹配的插件" : "尚未安装扩展插件"}</strong>
                <p>
                  {packages.length
                    ? "试试其他名称、描述或包名。"
                    : "前往插件市场，添加需要的功能。"}
                </p>
                {!packages.length && (
                  <Button variant="outline" size="sm" onClick={() => setTab("market")}>
                    浏览插件市场
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        {tab === "profile" && (
          <>
            <div className={cx("profile-heading")}>
              <p className={cx("runtime-muted")}>
                管理默认启用的功能。更改在任务空闲后生效，后台将重新启动。
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={busy || !profile}
                onClick={() => setEditor(JSON.stringify(profile, null, 2))}
                type="button"
              >
                编辑组合配置
              </Button>
            </div>
            {profile &&
              (["plugins", "client"] as const).map((side) => (
                <section className={cx("profile-group")} key={side}>
                  <h2>
                    {side === "client" ? "界面插件" : "后台插件"}{" "}
                    <span>{profile[side].length}</span>
                  </h2>
                  <div className={cx("product-list")}>
                    {profile[side].map((row) => (
                      <article className={cx("product-row profile-row")} key={row.id}>
                        <div className={cx("product-row-main")}>
                          <strong>{row.id}</strong>
                          <small>{row.name}</small>
                        </div>
                        <Tag>{row.disabled ? "已停用" : "已启用"}</Tag>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              const next = structuredClone(profile);
                              next[side].find((entry) => entry.id === row.id)!.disabled =
                                !row.disabled;
                              await remote.plugins.call("configure", next);
                            })
                          }
                          type="button"
                        >
                          {row.disabled ? "启用" : "停用"}
                        </Button>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
          </>
        )}
      </div>
      <p className={cx("runtime-muted page-note")}>
        插件可执行本机代码，请只安装可信来源。普通插件将在任务空闲后局部更新；无法安全热更新时会重启后台，请先保存插件内的草稿。
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
              <Input
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="https://… / 本地归档路径 / Git 来源"
                required
              />
            </label>
            {error && (
              <p role="alert" className={cx("product-alert")}>
                {error}
              </p>
            )}
            <Button variant="primary" disabled={busy} type="submit">
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
          <div className={cx("source-list")}>
            {markets.map((market) => (
              <article className={cx("source-row")} key={market.id}>
                <div className={cx("source-main")}>
                  <div className={cx("title-row")}>
                    <strong>{market.name}</strong>
                    <Tag>{market.enabled ? "已启用" : "已停用"}</Tag>
                  </div>
                  <p>{market.url}</p>
                  {market.error && <p className={cx("runtime-danger")}>{market.error}</p>}
                </div>
                <div className={cx("header-actions")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
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
                    variant="ghost"
                    size="sm"
                    className={cx("runtime-danger")}
                    disabled={busy}
                    onClick={() =>
                      void action(() => remote.market.call("remove", { id: market.id }))
                    }
                    type="button"
                  >
                    删除
                  </Button>
                </div>
              </article>
            ))}
            {!markets.length && <p className={cx("runtime-muted")}>尚未添加市场源。</p>}
          </div>
          <h2 className={cx("dialog-section-title")}>添加市场源</h2>

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
            {error && (
              <p role="alert" className={cx("product-alert")}>
                {error}
              </p>
            )}
            <Button variant="primary" disabled={busy} type="submit">
              添加市场源
            </Button>
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
            <p className={cx("runtime-muted")}>
              实例 ID 与包名独立。同一包可配置多个实例；客户端布局可整体替换。
            </p>
            <Textarea
              className={cx("profile-editor")}
              aria-label="插件组合 JSON"
              spellCheck={false}
              rows={18}
              value={editor}
              onChange={(event) => setEditor(event.target.value)}
            />
            {error && (
              <p role="alert" className={cx("product-alert")}>
                {error}
              </p>
            )}
            <Button variant="primary" disabled={busy} type="submit">
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
