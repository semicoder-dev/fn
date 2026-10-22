import RuntimeGenerationBanner from "./RuntimeGenerationBanner";
import RuntimeCard from "./RuntimeCards";
import type { SessionCard } from "@semicoder/fn-sdk/cards";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { native } from "@semicoder/fia/client";
import { createBrowserHost, readAllPages, type RegisteredClientPage } from "@semicoder/fn-sdk/cordis-client";
import type { z } from "@semicoder/fia/api";
import type { runtimeApplication, runtimeConnection, runtimeSession } from "../shared/runtime-api";
import { runtimeClient as client } from "./runtime-bridge";
import RuntimeModels from "./RuntimeModels";
import RuntimeApplications, { RuntimeChatSettings } from "./RuntimeApplications";
import AppearanceSettings from "./AppearanceSettings";
import UpdateSettings from "./UpdateSettings";
import PageSlot from "./PageSlot";
import ActivityButton from "./ActivityButton";
import PluginIcon from "./PluginIcon";
import { Package, Settings as SettingsIcon, SlidersHorizontal, Sun, RefreshCw } from "@semicoder/fn-sdk/ui";
import "./runtime.css";

function ChatIcon(props: React.SVGProps<SVGSVGElement>) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z" /></svg>; }

type App = z.infer<typeof runtimeApplication>;
type Connection = z.infer<typeof runtimeConnection>;
type Session = z.infer<typeof runtimeSession>;
type Approval = { id: string; sessionId: string; toolName: string; reason?: string };
type Item = { id: string; kind: string; text: string; reasoning?: string; toolName?: string; state?: string; truncated: boolean };
type Projection = { items: Item[]; nextOffset: number; hasMore: boolean };

class PageBoundary extends React.Component<{ children: React.ReactNode; resetKey: string }, { error: string }> {
  state = { error: "" };
  static getDerivedStateFromError(error: unknown) { return { error: String(error) }; }
  componentDidUpdate(previous: Readonly<{ resetKey: string }>) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: "" });
  }
  render() { return this.state.error ? <p role="alert">{this.state.error}</p> : this.props.children; }
}

export default function RuntimeApp() {
  const [view, setView] = useState("apps");
  const [settingsTab, setSettingsTab] = useState("models");
  const [apps, setApps] = useState<App[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [pages, setPages] = useState<readonly RegisteredClientPage[]>([]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem("fn.cordis.session") ?? "");
  const [cards, setCards] = useState<SessionCard[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draftRevisions = useRef(new Map<string, number>());
  const text = drafts[sessionId] ?? "";
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [stream, setStream] = useState<{ attemptId: string; text: string; reasoning: string; index: number } | null>(null);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof runtimeStatus>>>();
  const [newSession, setNewSession] = useState(false);
  const active = sessions.find(session => session.id === sessionId);
  const epoch = useRef("");
  const loaded = useRef(new Map<string, string>());
  const clientQueue = useRef(Promise.resolve());
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const refreshRevision = useRef(0);
  const host = useRef<ReturnType<typeof createBrowserHost> | undefined>(undefined);
  const currentSession = useRef(sessionId);
  currentSession.current = sessionId;
  const requestIds = useRef(new Map<string, string>());
  const showError = useCallback((caught: unknown) => setError(caught instanceof Error ? caught.message : String(caught)), []);

  const refresh = useCallback(async () => {
    const revision = ++refreshRevision.current;
    try {
      const [nextStatus, nextApps, nextConnections, nextSessions, nextApprovals] = await Promise.all([
        runtimeStatus(), client.call("apps.list", {}),
        readAllPages((offset, limit) => client.call("connections.list", { offset, limit })),
        readAllPages((offset, limit) => client.call("sessions.list", { offset, limit })),
        client.call("approvals.list", {}),
      ]);
      if (revision !== refreshRevision.current) return;
      setStatus(nextStatus); setApps(nextApps); setConnections(nextConnections);
      setSessions(nextSessions.sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id)));
      setApprovals(nextApprovals); setOnline(true);
      const wanted = nextApps.filter(app => app.enabled && app.status === "active" && app.clientURL);
      clientQueue.current = clientQueue.current.catch(() => {}).then(async () => {
        if (revision !== refreshRevision.current) return;
        if (epoch.current !== nextStatus.epoch) {
          await host.current?.dispose();
          host.current = createBrowserHost({
            call: (method, params) => client.call(method as never, params as never),
            onPagesChanged: setPages,
          });
          loaded.current.clear();
          epoch.current = nextStatus.epoch;
        }
        for (const [id, url] of loaded.current) {
          if (!wanted.some(app => app.id === id && app.clientURL === url)) {
            await host.current!.unload(id); loaded.current.delete(id);
          }
        }
        for (const app of wanted) {
          if (revision !== refreshRevision.current) return;
          if (loaded.current.has(app.id)) continue;
          const module = await import(/* @vite-ignore */ app.clientURL!);
          await host.current!.load(app.id, module.default ?? module);
          loaded.current.set(app.id, app.clientURL!);
        }
      });
      void clientQueue.current.catch(showError);
      const id = currentSession.current;
      if (id && nextSessions.some(session => session.id === id)) {
        const messages: Item[] = [];
        let offset = 0;
        for (let page = 0; page < 100; page++) {
          const result = await client.call("sessions.projection", { id, offset, limit: 100 }) as unknown as Projection;
          messages.push(...result.items);
          if (!result.hasMore || result.nextOffset <= offset) break;
          offset = result.nextOffset;
        }
        const nextCards = await readAllPages((offset, limit) => client.call("cards.list", { sessionId: id, offset, limit }));
        if (currentSession.current === id && revision === refreshRevision.current) { setItems(messages); setCards(nextCards); }
      } else { setItems([]); setCards([]); }
    } catch (caught) { if (revision === refreshRevision.current) { setOnline(false); showError(caught); } }
  }, [showError]);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) return;
    refreshTimer.current = setTimeout(() => { refreshTimer.current = undefined; void refresh(); }, 150);
  }, [refresh]);
  useEffect(() => {
    void native.ready();
    const off = client.on("runtime.changed", event => {
      if (event.kind === "stream" && event.sessionId === currentSession.current && event.data) {
        const frame = event.data as { type: string; attemptId: string; text?: string; index?: number; reasoning?: boolean };
        if (frame.type === "end") { setStream(null); scheduleRefresh(); }
        else if (frame.type === "start") setStream({ attemptId: frame.attemptId, text: "", reasoning: "", index: -1 });
        else setStream(previous => {
          const value = previous?.attemptId === frame.attemptId ? previous : { attemptId: frame.attemptId, text: "", reasoning: "", index: -1 };
          if ((frame.index ?? -1) <= value.index) return value;
          const key = frame.reasoning ? "reasoning" : "text";
          return { ...value, [key]: (value[key] + (frame.text ?? "")).slice(-262144), index: frame.index ?? value.index };
        });
      } else scheduleRefresh();
    });
    const reconnect = client.onReconnect(() => { setStream(null); scheduleRefresh(); });
    void refresh();
    return () => { off(); reconnect(); clearTimeout(refreshTimer.current); void host.current?.dispose(); };
  }, [refresh, scheduleRefresh]);
  useEffect(() => {
    localStorage.setItem("fn.cordis.session", sessionId);
    setItems([]); setCards([]);
    setStream(null);
    void refresh();
  }, [sessionId, refresh]);
  async function action(operation: () => Promise<unknown>) {
    setError("");
    try { await operation(); await refresh(); } catch (caught) { showError(caught); }
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!sessionId || !text.trim() || sending) return;
    const input = text;
    const targetSession = sessionId;
    const draftRevision = draftRevisions.current.get(targetSession) ?? 0;
    const key = `${sessionId}\n${input}`;
    const requestId = requestIds.current.get(key) ?? crypto.randomUUID();
    requestIds.current.set(key, requestId);
    setSending(true); setError("");
    try {
      await client.call("sessions.send", { id: sessionId, text: input, requestId });
      requestIds.current.delete(key);
      if ((draftRevisions.current.get(targetSession) ?? 0) === draftRevision)
        setDrafts(previous => ({ ...previous, [targetSession]: "" }));
      await refresh();
    } catch (caught) { showError(caught); }
    finally { setSending(false); }
  }
  const selectedPage = pages.find(page => page.key === view);
  return <div className="runtime-shell">
    <nav className="activity-bar" aria-label="应用导航">
      <div className="activity-apps">{pages.map(page => <ActivityButton key={page.key} label={page.title} aria-current={view === page.key ? "page" : undefined} className={`activity-button ${view === page.key ? "active" : ""}`} onClick={() => setView(page.key)}><PluginIcon icon={apps.find(app => app.id === page.appId)?.icon ?? page.title.slice(0, 1)} iconSvg={apps.find(app => app.id === page.appId)?.iconSvg} /></ActivityButton>)}</div>
      <div className="activity-tools">
        <ActivityButton label="fn Chat" aria-current={view === "chat" ? "page" : undefined} className={`activity-button ${view === "chat" ? "active" : ""}`} onClick={() => setView("chat")}><ChatIcon aria-hidden="true" /></ActivityButton>
        <ActivityButton label="应用中心" aria-current={view === "apps" ? "page" : undefined} className={`activity-button ${view === "apps" ? "active" : ""}`} onClick={() => setView("apps")}><Package aria-hidden="true" /></ActivityButton>
        <ActivityButton label="设置" aria-current={view === "settings" ? "page" : undefined} className={`activity-button ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}><SettingsIcon aria-hidden="true" /></ActivityButton>
      </div>
    </nav>
    <main className="runtime-main">
      <RuntimeGenerationBanner generation={status?.generation} retry={() => void action(() => client.call("runtime.applyUpdate", {}))} />
      {error && <div role="alert" className="runtime-error"><span>{error}</span><button aria-label="关闭错误提示" onClick={() => setError("")}>×</button></div>}
      {pages.map(page => <PageSlot key={`${status?.epoch}:${page.key}`} pluginId={page.appId} visible={page.key === view} keepAlive={page.keepAlive === true} label={page.title}>
        <PageBoundary resetKey={`${status?.epoch}:${page.key}`}><page.component /></PageBoundary>
      </PageSlot>)}
      {view === "settings" ? <div className="settings-layout">
        <nav className="settings-nav" aria-label="设置分类"><h1>设置</h1><p>管理你的工作空间</p>
          {[{ id: "models", title: "模型服务", Icon: SlidersHorizontal }, { id: "appearance", title: "外观", Icon: Sun }, { id: "updates", title: "应用更新", Icon: RefreshCw }, { id: "chat", title: "聊天同步", Icon: ChatIcon }].map(({ id, title, Icon }) => <button key={id} className={settingsTab === id ? "selected" : ""} aria-current={settingsTab === id ? "page" : undefined} onClick={() => setSettingsTab(id)}><Icon aria-hidden="true" />{title}</button>)}
        </nav><div className="settings-main">
          <PageSlot visible={settingsTab === "models"} keepAlive label="模型服务"><RuntimeModels connections={connections} refresh={refresh} action={action} /></PageSlot>
          <PageSlot visible={settingsTab === "appearance"} keepAlive label="外观"><AppearanceSettings visible={settingsTab === "appearance"} /></PageSlot>
          <PageSlot visible={settingsTab === "updates"} keepAlive={false} label="应用更新"><UpdateSettings /></PageSlot>
          <PageSlot visible={settingsTab === "chat"} keepAlive label="聊天同步"><RuntimeChatSettings action={action} /></PageSlot>
        </div>
      </div> : view === "apps" ? <RuntimeApplications apps={apps} action={action} busy={Boolean(status?.generation.installing || status?.generation.pending)} open={id => { const page = pages.find(page => page.appId === id); if (page) setView(page.key); }} /> :
      selectedPage ? null :
      <div className="runtime-chat">
        <section className="runtime-sessions">
          <button className="runtime-primary" onClick={() => setNewSession(true)}>＋ 新会话</button>
          <button onClick={() => setShowArchived(value => !value)}>{showArchived ? "返回当前会话" : "查看已归档"}</button>
          {sessions.filter(session => session.archived === showArchived).map(session =>
            <button key={session.id} className={session.id === sessionId ? "selected" : ""} onClick={() => { setSessionId(session.id); setView("chat"); }}>
              <strong>{session.title}</strong><small>{apps.find(app => app.id === session.appId)?.name ?? session.appId} · {session.status === "running" ? "运行中" : "空闲"}</small>
            </button>)}
        </section>
        <section className="runtime-conversation">
          {active ? <>
            <header><div><h1>{active.title}</h1><p>{connections.find(connection => connection.id === active.connectionId)?.name} · {active.modelId}</p></div>
              <SessionModel session={active} action={action} />
              <button onClick={() => void action(async () => {
                await client.call("sessions.archive", { id: active.id, archived: !active.archived });
                setShowArchived(!active.archived);
              })}>{active.archived ? "恢复会话" : "归档"}</button>
            </header>
            <div className="runtime-messages">
              {!items.length && <div className="runtime-empty">发送消息，开始这次对话。</div>}
              {items.map(item => <article key={item.id} className={`runtime-message ${item.kind}`}>
                <div className="runtime-message-label">{item.kind === "user" ? "你" : item.kind === "assistant" ? "助手" : item.toolName ?? "会话状态"}{item.state ? ` · ${item.state}` : ""}</div>
                {item.reasoning && <details><summary>思考过程</summary><pre>{item.reasoning}</pre></details>}
                <div className="runtime-message-text">{item.text}</div>
                {item.truncated && <small>此条内容较长，展示已截断。</small>}
              </article>)}
              {cards.map(card => <RuntimeCard key={card.id} record={card} enabled={apps.some(app => app.id === active.appId && app.enabled && app.status === "active")} refresh={refresh} />)}
              {stream && <article className="runtime-message assistant"><div className="runtime-message-label">助手 · 正在生成</div>
                {stream.reasoning && <details><summary>思考过程</summary><pre>{stream.reasoning}</pre></details>}
                <div className="runtime-message-text">{stream.text}</div>
              </article>}
              {active.status === "running" && <div className="runtime-working" role="status">正在处理…</div>}
            </div>
            {approvals.filter(approval => approval.sessionId === active.id).map(approval => <div className="runtime-approval" key={approval.id}>
              <strong>允许执行 {approval.toolName}？</strong><p>{approval.reason}</p>
              <button onClick={() => void action(() => client.call("approvals.reply", { id: approval.id, allow: false }))}>拒绝</button>
              <button className="runtime-primary" onClick={() => void action(() => client.call("approvals.reply", { id: approval.id, allow: true }))}>允许一次</button>
            </div>)}
            <form className="runtime-composer" onSubmit={send}>
              <textarea aria-label="消息" placeholder="输入消息…" value={text} onChange={event => {
                const value = event.target.value;
                draftRevisions.current.set(sessionId, (draftRevisions.current.get(sessionId) ?? 0) + 1);
                setDrafts(previous => ({ ...previous, [sessionId]: value }));
              }}
                onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
              <div><small>{active.policy === "controlled" ? "写入与外部操作需要批准" : "已启用自动执行"} · ⌘ Enter 发送</small>
                {active.status === "running" && <button type="button" onClick={() => void action(() => client.call("sessions.cancel", { id: active.id }))}>停止</button>}
                <button className="runtime-primary" disabled={!online || sending || !text.trim()}>{sending ? "正在提交…" : "发送"}</button>
              </div>
            </form>
          </> : <div className="runtime-welcome"><div className="runtime-mark">fn</div><h1>为每件事留一个会话</h1><p>选择模型连接，打开应用，继续你的工作。</p>
            <button className="runtime-primary" onClick={() => connections.some(connection => connection.configured) ? setNewSession(true) : (setSettingsTab("models"), setView("settings"))}>
              {connections.some(connection => connection.configured) ? "新建会话" : "添加模型连接"}
            </button></div>}
        </section>
      </div>}
    </main>
    {newSession && <NewSession apps={apps} connections={connections} close={() => setNewSession(false)} created={id => { setSessionId(id); setNewSession(false); setView("chat"); void refresh(); }} />}
  </div>;
}
const runtimeStatus = () => client.call("runtime.status", {});

function SessionModel({ session, action }: { session: Session; action: (operation: () => Promise<unknown>) => Promise<void> }) {
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    setModels([]); setError("");
    void readAllPages((offset, limit) => client.call("connections.models", { id: session.connectionId, offset, limit }))
      .then(value => { if (!disposed) setModels(value); })
      .catch(caught => { if (!disposed) setError(String(caught)); });
    return () => { disposed = true; };
  }, [session.connectionId]);
  return <div>
    <select aria-label="会话模型" value={session.modelId} disabled={session.status === "running" || !models.length}
      onChange={event => { const modelId = event.target.value; void action(() => client.call("sessions.model", { id: session.id, modelId })); }}>
      {!models.some(model => model.id === session.modelId) && <option value={session.modelId}>{session.modelId}</option>}
      {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
    </select>
    {error && <small role="alert">{error}</small>}
  </div>;
}

function NewSession({ apps, connections, close, created }: { apps: App[]; connections: Connection[]; close: () => void; created: (id: string) => void }) {
  const available = connections.filter(connection => connection.configured);
  const [appId, setAppId] = useState("fn-chat");
  const [endpointId, setEndpointId] = useState("");
  const endpoints = apps.find(app => app.id === appId)?.chats ?? [];
  const selectedEndpoint = endpoints.some(endpoint => endpoint.id === endpointId) ? endpointId : endpoints[0]?.id;
  const [connectionId, setConnectionId] = useState(available[0]?.id ?? "");
  const [modelId, setModelId] = useState("");
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [cwd, setCwd] = useState("");
  const [automatic, setAutomatic] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true; setModelId(""); setModels([]);
    if (connectionId) void readAllPages((offset, limit) => client.call("models.saved", { offset, limit })).then(value => value.filter(model => model.connectionId === connectionId))
      .then(result => { if (alive) { setModels(result); setModelId(result[0]?.id ?? ""); } }, caught => { if (alive) setError(String(caught)); });
    return () => { alive = false; };
  }, [connectionId]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const session = await client.call("sessions.create", { appId, connectionId, modelId, title: title || "新会话", ...(cwd ? { cwd } : {}), endpointId: selectedEndpoint, policy: automatic ? "automatic" : "controlled" });
      created(session.id);
    } catch (caught) { setError(String(caught)); } finally { setPending(false); }
  }
  return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true" aria-labelledby="new-session-title">
    <header><h2 id="new-session-title">新会话</h2><button aria-label="关闭" onClick={close}>×</button></header>
    <form onSubmit={create} className="runtime-form">
      <label>应用<select value={appId} onChange={e => setAppId(e.target.value)}>{apps.filter(app => app.enabled && app.status === "active" && app.chats.length).map(app => <option key={app.id} value={app.id}>{app.name}</option>)}</select></label>
      {endpoints.length > 1 && <label>对话入口<select value={selectedEndpoint} onChange={event => setEndpointId(event.target.value)}>
        {endpoints.map(endpoint => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}
      </select></label>}
      <label>连接<select value={connectionId} onChange={e => setConnectionId(e.target.value)} required>{available.map(connection => <option key={connection.id} value={connection.id}>{connection.name}</option>)}</select></label>
      <label>模型<select value={modelId} onChange={e => setModelId(e.target.value)} required><option value="">{models.length ? "选择模型" : "请先在设置中添加模型"}</option>{models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
      <label>标题<input value={title} onChange={e => setTitle(e.target.value)} placeholder="新会话" /></label>
      <label>工作目录<input value={cwd} onChange={e => setCwd(e.target.value)} placeholder="可选绝对路径；文件与进程工具需要此项" /></label>
      <label className="runtime-checkbox"><input type="checkbox" checked={automatic} onChange={e => setAutomatic(e.target.checked)} />自动批准此会话的工具操作</label>
      {error && <p role="alert">{error}</p>}<button className="runtime-primary" disabled={pending || !connectionId || !modelId}>{pending ? "正在创建…" : "创建会话"}</button>
    </form>
  </section></div>;
}
