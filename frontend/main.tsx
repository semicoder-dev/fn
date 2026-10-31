import { WidgetPreview } from "./widget-preview.tsx";
import messagesEn from "./locales/en.json";
import messagesZh from "./locales/zh-CN.json";
import React, { useEffect, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { native } from "@semicoder/fia/client";
import { jsonHost, openHostSocket } from "@semicoder/fn-sdk/client";
import type {
  InstalledApplication,
  Preferences,
  Model,
  Connection,
  RelayMessage,
} from "@semicoder/fn-sdk/types";
import { widgetDimensions, type TextValue } from "@semicoder/fn-sdk/widgets";
import {
  Button,
  Icon,
  Input,
  Modal,
  Toast,
  Select,
  useTheme,
  Notice,
  Menu,
} from "@semicoder/fn-ui";
import { Widget } from "@semicoder/fn-ui/widgets";
import s from "./desktop.module.css";
import p from "./platform.module.css";
type State = {
  notifications: {
    id: string;
    instanceId?: string;
    text: string;
    createdAt: number;
  }[];
  preferences: Preferences;
  applications: InstalledApplication[];
  connections: Connection[];
  relay: {
    available: boolean;
    connected: boolean;
    error?: string;
    messages: RelayMessage[];
  };
  markets: { id: string; name: string; url: string }[];
  catalog: {
    id: string;
    version: string;
    name: string;
    description: string;
    marketId: string;
  }[];
  catalogErrors: string[];
};
function AppIcon({ id, icon }: { id: string; icon?: string }) {
  const name = id.includes("translate")
    ? "translate"
    : id.includes("note")
      ? "note"
      : id.includes("kanban")
        ? "board"
        : id.includes("stock")
          ? "chart"
          : "grid";
  return (
    <span className={p.appIcon} data-icon={name}>
      {icon ? (
        <img src={icon} alt="" width={24} height={24} />
      ) : (
        <Icon name={name} size={21} />
      )}
    </span>
  );
}
function Desktop() {
  const [state, setState] = useState<State>();
  const [error, setError] = useState("");
  const [appMenu, setAppMenu] = useState<string>();
  const [panel, setPanel] = useState<string>();
  const [tab, setTab] = useState("general");
  useEffect(() => setAppMenu(undefined), [panel]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmation, setConfirmation] = useState<{
    text: string;
    action: () => void;
  }>();
  const [models, setModels] = useState<Model[]>([]);
  const [marketName, setMarketName] = useState("");
  const [marketURL, setMarketURL] = useState("");
  const [drag, setDrag] = useState<string>();
  const [busy, setBusy] = useState(false);
  const zh = (state?.preferences.locale ?? "zh-CN") === "zh-CN";
  const t = (key: string) =>
    (zh ? messagesZh : messagesEn)[key as keyof typeof messagesEn] ?? key;
  useTheme(state?.preferences.theme);
  useEffect(() => {
    document.documentElement.lang = state?.preferences.locale ?? "zh-CN";
  }, [state?.preferences.locale]);
  const refresh = useCallback(async () => {
    try {
      setState(await jsonHost("/state"));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }, []);
  const command = async (action: string, input: unknown = {}) => {
    try {
      const result = await jsonHost("/platform/" + action, input);
      await refresh();
      return result;
    } catch (e) {
      setToast(String(e instanceof Error ? e.message : e));
      throw e;
    }
  };
  const act = (action: string, input: unknown = {}) => {
    void command(action, input).catch(() => {});
  };
  const text = (value: TextValue, app: InstalledApplication) => {
    if (typeof value === "string") return value;
    let result =
      app.messages[state?.preferences.locale ?? "en"]?.[value.key] ??
      app.messages.en?.[value.key] ??
      value.key;
    for (const [key, v] of Object.entries(value.args ?? {}))
      result = result.replaceAll("{" + key + "}", String(v));
    return result;
  };
  const name = (app: InstalledApplication) => text(app.manifest.name, app);
  const label = (status: string) =>
    ({
      closed: t("closed"),
      starting: t("starting"),
      running: t("running"),
      minimized: t("minimized"),
      stopping: t("stopping"),
      failed: t("needs_attention"),
      waiting: t("waiting_for_app"),
      processing: t("processing"),
      completed: t("completed"),
      interrupted: t("interrupted"),
      cancelled: t("cancelled"),
    })[status] ?? status;
  const open = async (app: InstalledApplication) => {
    const browser =
      new URLSearchParams(location.search).get("fiaBrowser") === "1";
    const placeholder = browser ? window.open("about:blank", "_blank") : null;
    try {
      const result = await command("open", {
        instanceId: app.instanceId,
        browser,
      });
      if (placeholder && result.url) placeholder.location.replace(result.url);
      setPanel(undefined);
    } catch {
      placeholder?.close();
    }
  };
  const close = (app: InstalledApplication) => {
    if (app.busy)
      setConfirmation({
        text: t("closing_stops_active_tasks"),
        action: () => act("close", { instanceId: app.instanceId, force: true }),
      });
    else act("close", { instanceId: app.instanceId });
  };
  useEffect(() => {
    let disposed = false;
    let socket: WebSocket;
    let timer: ReturnType<typeof setTimeout>;
    const connect = async () => {
      try {
        socket = await openHostSocket(
          "/api/fn/v1/events?windowId=" +
            encodeURIComponent(
              new URLSearchParams(location.search).get("fiaWindow") ?? "",
            ),
        );
        if (disposed) {
          socket.close();
          return;
        }
        socket.onmessage = (e) => {
          const message = JSON.parse(e.data);
          if (message.type === "changed") void refresh();
          if (message.type === "toast") setToast(message.value.text);
          if (message.type === "closeRequested")
            setConfirmation({
              text: t("closing_stops_tasks_and_discards_unsaved_changes"),
              action: () => {
                void jsonHost("/platform/close", {
                  instanceId: message.value.instanceId,
                  force: true,
                });
              },
            });
        };
        socket.onclose = () => {
          if (!disposed)
            timer = setTimeout(() => {
              void connect();
              void refresh();
            }, 1000);
        };
      } catch {
        if (!disposed) timer = setTimeout(() => void connect(), 1000);
      }
    };
    void refresh().finally(() => native.ready().catch(() => {}));
    void connect();
    return () => {
      disposed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, [refresh, zh]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanel("search");
        setQuery("");
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => {
    if (panel === "settings" && tab === "models")
      void jsonHost("/models")
        .then(setModels)
        .catch((e) => setToast(String(e)));
  }, [panel, tab, state?.connections.length]);
  const prefs = (input: Partial<Preferences>) => act("preferences", input);
  const pin = (app: InstalledApplication, key: "desktop" | "menu") => {
    const list = state!.preferences[key];
    const entries =
      key === "menu" || !app.manifest.contributes.widgets.length
        ? [app.instanceId]
        : app.manifest.contributes.widgets.map(
            (w) => app.instanceId + "/" + w.id,
          );
    prefs({
      [key]: entries.every((id) => list.includes(id))
        ? list.filter((id) => !entries.includes(id))
        : [...new Set([...list, ...entries])],
    });
  };
  const reorder = (source: string, target: string) => {
    const list = [...state!.preferences.desktop];
    list.splice(list.indexOf(source), 1);
    list.splice(list.indexOf(target), 0, source);
    prefs({ desktop: list });
  };
  if (!state)
    return (
      <div className={p.loading}>
        <strong>Fn</strong>
        <p>{error || t("opening_your_desktop")}</p>
        <Button onClick={() => void refresh()}>{t("retry")}</Button>
      </div>
    );
  const applications = state.applications;
  const running = applications.filter(
    (a) => !["closed", "failed"].includes(a.state),
  );
  const desktop = state.preferences.desktop.flatMap((key) => {
    const [id, widgetId] = key.split("/");
    const app = applications.find((a) => a.instanceId === id);
    if (!app) return [];
    const definition = app.manifest.contributes.widgets.find(
      (w) => w.id === widgetId,
    );
    const size = definition?.size ?? "1x1";
    return [
      {
        key,
        app,
        widget: widgetId ? app.widgets[widgetId] : undefined,
        size,
        ...widgetDimensions(size),
      },
    ];
  });
  const waiting = state.relay.messages.filter(
    (m) => m.status === "waiting",
  ).length;
  const statusId = new URLSearchParams(location.search).get("status");
  const statusApp = applications.find((a) => a.instanceId === statusId);
  const install = async (
    item?: State["catalog"][number],
    confirmationId?: string,
  ) => {
    setBusy(true);
    try {
      const result = await command(
        confirmationId ? "install-confirm" : item ? "install" : "install-local",
        confirmationId ? { confirmationId } : item,
      );
      if (result?.confirmationId)
        setConfirmation({
          text: t("close_this_app_to_update_its_data"),
          action: () => {
            void install(undefined, result.confirmationId);
          },
        });
      else if (result) setToast(t("application_installed"));
    } catch {
    } finally {
      setBusy(false);
    }
  };
  if (statusId)
    return (
      <main className={p.status}>
        <AppIcon id={statusId} />
        <h1>{statusApp ? name(statusApp) : statusId}</h1>
        <p>{label(statusApp?.state ?? "closed")}</p>
        {statusApp?.error && <Notice>{statusApp.error}</Notice>}
        <p>{t("this_app_uses_the_standard_status_page")}</p>
        <div className={p.actions}>
          <Button onClick={() => act("minimize", { instanceId: statusId })}>
            {t("minimize")}
          </Button>
          <Button onClick={() => statusApp && close(statusApp)}>
            {t("close_app")}
          </Button>
        </div>
        {confirmation && (
          <Modal
            title={t("close_app")}
            onClose={() => setConfirmation(undefined)}
          >
            <p>{confirmation.text}</p>
            <Button
              onClick={() => {
                confirmation.action();
                setConfirmation(undefined);
              }}
            >
              {t("close")}
            </Button>
          </Modal>
        )}
      </main>
    );
  return (
    <div className={s.shell}>
      <header className={s.topbar}>
        <button
          className={s.searchTrigger}
          aria-label={t("search_apps")}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={() => {
            setPanel("search");
            setQuery("");
          }}
        >
          <Icon name="search" size={16} />
          <span>{t("search_apps")}</span>
          <kbd aria-hidden="true">⌘ K</kbd>
        </button>
        <div className={s.headingActions}>
          <Button
            variant={editing ? "primary" : "secondary"}
            aria-pressed={editing}
            onClick={() => setEditing(!editing)}
          >
            <Icon name={editing ? "check" : "edit"} size={15} />
            {editing ? t("done") : t("edit_desktop")}
          </Button>
          <Button onClick={() => setPanel("apps")}>
            <Icon name="plus" size={16} />
            {t("add_apps")}
          </Button>
        </div>
      </header>
      <main className={s.main}>
        <h1 className={p.srOnly}>{t("my_desktop")}</h1>
        {error && <Notice>{error}</Notice>}
        <div className={p.grid}>
          {desktop.map(({ key, app, widget, size, columns, rows }, index) => (
            <section
              key={key}
              className={p.card}
              onClick={(event) => {
                if (
                  !editing &&
                  !(event.target as HTMLElement).closest("button")
                )
                  void open(app);
              }}
              data-size={size}
              data-columns={columns}
              style={
                {
                  "--widget-columns": columns,
                  "--widget-rows": rows,
                } as React.CSSProperties
              }
              draggable={editing}
              onDragStart={() => setDrag(key)}
              onDragOver={(e) => {
                if (editing) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (drag && drag !== key) reorder(drag, key);
                setDrag(undefined);
              }}
            >
              <div className={p.cardHeading}>
                <AppIcon
                  id={app.manifest.id}
                  icon={
                    app.manifest.icon
                      ? "/pages/" + encodeURIComponent(app.instanceId) + "/icon"
                      : undefined
                  }
                />
                <span>{name(app)}</span>
                <span className={p.state} data-running={running.includes(app)}>
                  {label(app.state)}
                </span>
              </div>
              <button
                className={p.widgetButton}
                aria-label={t("open") + name(app)}
                onClick={() => void open(app)}
              >
                {widget && (
                  <Widget
                    snapshot={widget.snapshot}
                    text={(value) => text(value, app)}
                  />
                )}
                {!widget && (
                  <div className={p.noWidget}>
                    {app.manifest.description
                      ? text(app.manifest.description, app)
                      : t("open_to_get_started")}
                  </div>
                )}
              </button>
              <footer className={p.cardFooter}>
                <span>
                  {app.error ||
                    t("updated") +
                      (widget
                        ? new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(widget.updatedAt)
                        : "—")}
                </span>
                {editing ? (
                  <div className={p.actions}>
                    <Button
                      size="sm"
                      disabled={!index}
                      onClick={() => reorder(key, desktop[index - 1]!.key)}
                    >
                      ←
                    </Button>
                    <Button
                      size="sm"
                      disabled={index === desktop.length - 1}
                      aria-label={t("move_after")}
                      onClick={() => reorder(desktop[index + 1]!.key, key)}
                    >
                      →
                    </Button>
                    <Button
                      size="sm"
                      aria-label={t("remove_widget")}
                      onClick={() =>
                        prefs({
                          desktop: state.preferences.desktop.filter(
                            (id) => id !== key,
                          ),
                        })
                      }
                    >
                      <Icon name="close" size={13} />
                    </Button>
                  </div>
                ) : (
                  <Icon name="arrow" size={14} />
                )}
              </footer>
            </section>
          ))}
        </div>
        {!desktop.length && (
          <div className={p.empty}>
            <Icon name="grid" size={36} />
            <h2>{t("make_room_for_your_first_app")}</h2>
            <p>{t("install_an_app_to_keep_its_information")}</p>
            <Button variant="primary" onClick={() => setPanel("apps")}>
              {t("browse_apps")}
            </Button>
          </div>
        )}
      </main>
      <nav className={s.dock} aria-label={t("dock")}>
        <div className={s.dockPermanent}>
          <button
            className={s.dockSystem}
            aria-haspopup="dialog"
            aria-expanded={panel === "apps"}
            onClick={() => setPanel("apps")}
          >
            <Icon name="grid" size={21} />
            <span>{t("apps")}</span>
          </button>
          <button
            className={s.dockSystem}
            aria-label={t("notifications")}
            aria-haspopup="dialog"
            aria-expanded={panel === "notifications"}
            onClick={() => setPanel("notifications")}
          >
            <Icon name="bell" size={21} />
            <span>{t("notifications")}</span>
            {state.notifications.length > 0 && (
              <span className={s.dockBadge}>
                {state.notifications.length > 99
                  ? "99+"
                  : state.notifications.length}
              </span>
            )}
          </button>
          <button
            className={s.dockSystem}
            aria-label={t("settings")}
            aria-haspopup="dialog"
            aria-expanded={panel === "settings" || panel === "phone"}
            onClick={() => {
              setTab("general");
              setPanel("settings");
            }}
          >
            <Icon name="settings" size={21} />
            <span>{t("settings")}</span>
            {waiting > 0 && (
              <span className={s.dockBadge}>
                {waiting > 99 ? "99+" : waiting}
              </span>
            )}
          </button>
        </div>
        {running.length > 0 && (
          <>
            <span className={s.dockDivider} aria-hidden="true" />
            <div className={s.dockRunning} aria-label={t("running_apps")}>
              {running.map((app) => (
                <div key={app.instanceId} className={s.dockItem}>
                  <button
                    className={s.dockApp}
                    onClick={() => void open(app)}
                    title={name(app)}
                    aria-label={t("open") + name(app)}
                  >
                    <AppIcon
                      id={app.manifest.id}
                      icon={
                        app.manifest.icon
                          ? "/pages/" +
                            encodeURIComponent(app.instanceId) +
                            "/icon"
                          : undefined
                      }
                    />
                    <i />
                  </button>
                  <button
                    className={s.dockClose}
                    aria-label={t("close_79c8") + name(app)}
                    onClick={() => close(app)}
                  >
                    <Icon name="close" size={10} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </nav>
      {panel === "apps" && (
        <Modal
          title={t("your_apps")}
          wide
          className={p.appsDialog}
          onClose={() => setPanel(undefined)}
        >
          <div className={p.library}>
            <div className={p.libraryActions}>
              <Button disabled={busy} onClick={() => void install()}>
                <Icon name="plus" size={15} />
                {t("install_package")}
              </Button>
              <Button disabled={busy} onClick={() => act("market-refresh")}>
                <Icon name="refresh" size={15} />
                {t("check_updates")}
              </Button>
            </div>
            <h3>{t("installed")}</h3>
            {applications.map((app) => {
              const available = state.catalog.find(
                (i) =>
                  i.id === app.manifest.id &&
                  i.version !== app.manifest.version,
              );
              return (
                <section key={app.instanceId} className={p.appRow}>
                  <AppIcon
                    id={app.manifest.id}
                    icon={
                      app.manifest.icon
                        ? "/pages/" +
                          encodeURIComponent(app.instanceId) +
                          "/icon"
                        : undefined
                    }
                  />
                  <div className={p.grow}>
                    <strong>{name(app)}</strong>
                    <p>
                      {label(app.state)} · {app.manifest.version}
                    </p>
                  </div>
                  <Button onClick={() => pin(app, "desktop")}>
                    {state.preferences.desktop.some(
                      (id) =>
                        id === app.instanceId ||
                        id.startsWith(app.instanceId + "/"),
                    )
                      ? t("remove_widget")
                      : t("add_widget")}
                  </Button>
                  <Button
                    onClick={() => pin(app, "menu")}
                    title={t("menu_bar_shortcut")}
                  >
                    <Icon name="pin" size={15} />
                    {state.preferences.menu.includes(app.instanceId) ? "✓" : ""}
                  </Button>
                  {available && (
                    <Button
                      disabled={busy}
                      onClick={() => void install(available)}
                    >
                      {t("update")}
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => void open(app)}>
                    {t("open_ed07")}
                  </Button>
                  <Menu
                    open={appMenu === app.instanceId}
                    onClose={() => setAppMenu(undefined)}
                    anchor={
                      <Button
                        aria-label={t("app_actions")}
                        onClick={() => setAppMenu(app.instanceId)}
                      >
                        <Icon name="more" />
                      </Button>
                    }
                    items={[
                      {
                        id: "close",
                        label: t("close_app"),
                        disabled: app.state === "closed",
                      },
                      {
                        id: "uninstall",
                        label: t("uninstall"),
                        danger: true,
                      },
                    ]}
                    onSelect={(id) => {
                      if (id === "close") close(app);
                      else
                        setConfirmation({
                          text: t("uninstall_this_app_its_data_will_be"),
                          action: () =>
                            act("uninstall", {
                              instanceId: app.instanceId,
                              force: true,
                            }),
                        });
                    }}
                  />
                </section>
              );
            })}
            {!applications.length && (
              <Notice>{t("no_apps_installed_browse_a_market_or")}</Notice>
            )}
            <h3>{t("discover")}</h3>
            {state.catalog.map((item) => (
              <section className={p.appRow} key={item.marketId + item.id}>
                <AppIcon id={item.id} />
                <div className={p.grow}>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                </div>
                <Button
                  disabled={
                    busy || applications.some((a) => a.manifest.id === item.id)
                  }
                  onClick={() => void install(item)}
                >
                  {t("install")}
                </Button>
              </section>
            ))}
            {state.catalogErrors.map((error) => (
              <Notice key={error}>{error}</Notice>
            ))}
            {!state.catalog.length && (
              <Button onClick={() => act("market-refresh")}>
                {t("load_markets")}
              </Button>
            )}
            <h3>{t("app_sources")}</h3>
            {state.markets.map((m) => (
              <div className={p.source} key={m.id}>
                <span>{m.name}</span>
                <small>{m.url}</small>
              </div>
            ))}
            <div className={p.actions}>
              <Input
                aria-label={t("source_name")}
                placeholder={t("name")}
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
              />
              <Input
                aria-label={t("market_url")}
                placeholder="https://…"
                value={marketURL}
                onChange={(e) => setMarketURL(e.target.value)}
              />
              <Button
                disabled={!marketName || !marketURL}
                onClick={() =>
                  act("market-add", { name: marketName, url: marketURL })
                }
              >
                {t("add_source")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {panel === "search" && (
        <Modal title={t("search_apps")} onClose={() => setPanel(undefined)}>
          <Input
            className={p.searchInput}
            autoFocus
            type="search"
            aria-label={t("search_apps")}
            placeholder={t("search_installed_apps")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={p.launcher}>
            {applications
              .filter((a) =>
                name(a).toLowerCase().includes(query.toLowerCase()),
              )
              .map((app) => (
                <button key={app.instanceId} onClick={() => void open(app)}>
                  <AppIcon
                    id={app.manifest.id}
                    icon={
                      app.manifest.icon
                        ? "/pages/" +
                          encodeURIComponent(app.instanceId) +
                          "/icon"
                        : undefined
                    }
                  />
                  <span>{name(app)}</span>
                  <small>{label(app.state)}</small>
                  <Icon name="arrow" size={14} />
                </button>
              ))}
          </div>
        </Modal>
      )}
      {panel === "settings" && (
        <Modal title={t("settings")} wide onClose={() => setPanel(undefined)}>
          <div className={p.settings}>
            <nav>
              {[
                "general",
                "models",
                ...(state.relay.available ? ["phone"] : []),
              ].map((key) => (
                <Button
                  key={key}
                  variant={tab === key ? "primary" : "ghost"}
                  onClick={() => setTab(key)}
                >
                  {key === "general"
                    ? t("general")
                    : key === "models"
                      ? t("models")
                      : t("phone")}
                </Button>
              ))}
            </nav>
            <section>
              {tab === "general" ? (
                <>
                  <h3>{t("make_fn_feel_like_yours")}</h3>
                  <p className={p.secondary}>
                    {t("your_desktop_and_apps_share_these_preferences")}
                  </p>
                  <div className={p.settingRow}>
                    <span>{t("appearance")}</span>
                    <Select
                      value={state.preferences.theme}
                      onValueChange={(theme) =>
                        prefs({ theme: theme as Preferences["theme"] })
                      }
                      label={t("appearance")}
                      options={[
                        { value: "system", label: t("system") },
                        { value: "light", label: t("light") },
                        { value: "dark", label: t("dark") },
                      ]}
                    />
                  </div>
                  <div className={p.settingRow}>
                    <span>{t("language")}</span>
                    <Select
                      value={state.preferences.locale}
                      onValueChange={(locale) =>
                        prefs({ locale: locale as Preferences["locale"] })
                      }
                      label={t("language")}
                      options={[
                        { value: "zh-CN", label: "简体中文" },
                        { value: "en", label: "English" },
                      ]}
                    />
                  </div>
                </>
              ) : tab === "models" ? (
                <>
                  <h3>ChatGPT</h3>
                  <p className={p.secondary}>
                    {t("use_your_chatgpt_plan_with_models_managed")}
                  </p>
                  {state.connections.map((account) => (
                    <div className={p.settingRow} key={account.id}>
                      <div>
                        {account.email}
                        <small>
                          {account.enabled
                            ? t("plan_usage_enabled")
                            : t("plan_consent_required")}
                        </small>
                      </div>
                      {!account.enabled && (
                        <Button
                          onClick={() =>
                            void command("login", { connectionId: account.id })
                              .then(({ url }) => native.system.openURL({ url }))
                              .catch(() => {})
                          }
                        >
                          {t("sign_in_again")}
                        </Button>
                      )}
                      <Button
                        disabled={!account.enabled}
                        onClick={() =>
                          setConfirmation({
                            text: t("sign_out_of_this_account"),
                            action: () =>
                              void command("logout", {
                                connectionId: account.id,
                              })
                                .then((result) => {
                                  if (!result.revoked)
                                    setToast(
                                      t(
                                        "signed_out_locally_remote_revocation_was_not",
                                      ),
                                    );
                                })
                                .catch(() => {}),
                          })
                        }
                      >
                        {t("sign_out")}
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="primary"
                    onClick={() => {
                      void command("login")
                        .then(({ url }) => native.system.openURL({ url }))
                        .catch(() => {});
                    }}
                  >
                    Continue with ChatGPT
                  </Button>
                  <div className={p.settingRow}>
                    <span>{t("default_model")}</span>
                    <Select
                      value={
                        state.preferences.defaultModel
                          ? state.preferences.defaultModel.connectionId +
                            "/" +
                            state.preferences.defaultModel.model
                          : ""
                      }
                      label={t("choose_model")}
                      onValueChange={(value) => {
                        const model = models.find(
                          (m) => m.connectionId + "/" + m.id === value,
                        );
                        if (model)
                          prefs({
                            defaultModel: {
                              connectionId: model.connectionId,
                              model: model.id,
                            },
                          });
                      }}
                      options={models.map((m) => ({
                        value: m.connectionId + "/" + m.id,
                        label: m.name,
                      }))}
                    />
                  </div>
                  <a
                    href="https://chatgpt.com/#settings/usage"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("manage_chatgpt_usage")}
                  </a>
                </>
              ) : (
                <>
                  <h3>{t("chat_anywhere_run_on_your_desktop")}</h3>
                  <p className={p.secondary}>
                    {t("messages_wait_until_you_start_their_desktop")}
                  </p>
                  <Notice>
                    {state.relay.error ??
                      (state.relay.connected
                        ? t("connected_to_icloud")
                        : t("not_connected"))}
                  </Notice>
                  <div className={p.actions}>
                    <Button
                      onClick={() =>
                        act(
                          state.relay.connected
                            ? "phone-disconnect"
                            : "phone-connect",
                        )
                      }
                    >
                      {state.relay.connected
                        ? t("disconnect")
                        : t("connect_icloud")}
                    </Button>
                    <Button onClick={() => setPanel("phone")}>
                      <Icon name="phone" size={16} />
                      {t("phone_messages")}
                      {waiting > 0 ? ` · ${waiting}` : ""}
                    </Button>
                  </div>
                </>
              )}
            </section>
          </div>
        </Modal>
      )}
      {panel === "notifications" && (
        <Modal title={t("notifications")} onClose={() => setPanel(undefined)}>
          {!state.notifications.length && <p>{t("no_notifications")}</p>}
          {state.notifications.map((notice) => (
            <article key={notice.id} className={p.message}>
              <small>
                {new Date(notice.createdAt).toLocaleString(
                  state.preferences.locale,
                )}{" "}
                ·{" "}
                {(applications.find((a) => a.instanceId === notice.instanceId)
                  ?.manifest.name &&
                  name(
                    applications.find(
                      (a) => a.instanceId === notice.instanceId,
                    )!,
                  )) ||
                  "Fn"}
              </small>
              <p>{notice.text}</p>
            </article>
          ))}
          {!!state.notifications.length && (
            <Button onClick={() => act("notifications-clear")}>
              {t("clear_notifications")}
            </Button>
          )}
        </Modal>
      )}
      {panel === "phone" && state.relay.available && (
        <Modal title={t("phone_messages")} onClose={() => setPanel(undefined)}>
          {!state.relay.connected && (
            <Button onClick={() => act("phone-connect")}>
              {t("connect_icloud")}
            </Button>
          )}
          {state.relay.error && <Notice>{state.relay.error}</Notice>}
          {!state.relay.messages.length && (
            <p className={p.secondary}>
              {t("messages_appear_here_closed_apps_stay_closed")}
            </p>
          )}
          {state.relay.messages.map((message) => (
            <div className={p.message} key={message.id}>
              <small>{label(message.status)}</small>
              <p>{message.text}</p>
              {message.reply && <blockquote>{message.reply}</blockquote>}
              {message.error && <Notice>{message.error}</Notice>}
              {message.status === "waiting" && (
                <div className={p.actions}>
                  <Button
                    onClick={() => {
                      const app = applications.find(
                        (a) => a.instanceId === message.instanceId,
                      );
                      if (app) void open(app);
                    }}
                  >
                    {t("start_app")}
                  </Button>
                  <Button
                    onClick={() => act("phone-cancel", { id: message.id })}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Modal>
      )}
      {confirmation && (
        <Modal title={t("confirm")} onClose={() => setConfirmation(undefined)}>
          <p>{confirmation.text}</p>
          <div className={p.actions}>
            <Button onClick={() => setConfirmation(undefined)}>
              {t("cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                confirmation.action();
                setConfirmation(undefined);
              }}
            >
              {t("confirm")}
            </Button>
          </div>
        </Modal>
      )}
      {toast && <Toast text={toast} onClose={() => setToast("")} />}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  new URLSearchParams(location.search).has("widget-preview") ? (
    <WidgetPreview
      id={new URLSearchParams(location.search).get("widget-preview")!}
    />
  ) : (
    <Desktop />
  ),
);
