import React, { useEffect, useState } from "react";
import { native } from "@semicoder/fia/client";
import { readAllPages } from "@semicoder/fn-sdk/cordis-client";
import { runtimeClient as client } from "./runtime-bridge";

type Connection = Awaited<ReturnType<typeof connectionsPage>>["items"][number];
const connectionsPage = () => client.call("connections.list", {});
const providers = () => client.call("connections.providers", {});
const logins = () => client.call("auth.list", {});
type Provider = Awaited<ReturnType<typeof providers>>[number];
type Login = Awaited<ReturnType<typeof logins>>[number];
type Action = (operation: () => Promise<unknown>) => Promise<void>;
type Model = { id: string; name: string };

export default function RuntimeModels({ connections, refresh, action }: { connections: Connection[]; refresh: () => Promise<void>; action: Action }) {
  const [catalog, setCatalog] = useState<Provider[]>([]);
  const [attempts, setAttempts] = useState<Login[]>([]);
  const [saved, setSaved] = useState<(Model & { connectionId: string })[]>([]);
  const [selected, setSelected] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [modelId, setModelId] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [provider, setProvider] = useState("openai");
  const [name, setName] = useState("");
  const [auth, setAuth] = useState<"api-key" | "oauth">("api-key");
  const [key, setKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [protocol, setProtocol] = useState("openai-completions");
  const [customModels, setCustomModels] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const chosen = catalog.find(item => item.id === provider);
  const current = connections.find(connection => connection.id === selected);
  const loadSaved = async () => setSaved(await readAllPages((offset, limit) => client.call("models.saved", { offset, limit })));
  useEffect(() => {
    let alive = true;
    void providers().then(value => { if (alive) setCatalog(value); }).catch(caught => setError(String(caught)));
    const read = () => { void Promise.all([providers(), logins(), readAllPages((offset, limit) => client.call("models.saved", { offset, limit }))])
      .then(([catalog, attempts, models]) => { if (alive) { setCatalog(catalog); setAttempts(attempts); setSaved(models); } }).catch(caught => { if (alive) setError(String(caught)); }); };
    read(); const off = client.on("runtime.changed", event => { if (["connections", "product"].includes(event.kind)) read(); });
    const reconnect = client.onReconnect(read);
    return () => { alive = false; off(); reconnect(); };
  }, []);
  useEffect(() => {
    if (pending) return;
    if (!connections.some(connection => connection.id === selected)) setSelected(connections[0]?.id ?? "");
  }, [connections, selected, pending]);
  useEffect(() => {
    let alive = true; setModels([]); setModelId("");
    if (current?.configured) void readAllPages((offset, limit) => client.call("connections.models", { id: current.id, offset, limit }))
      .then(value => { if (alive) { setModels(value); setModelId(value[0]?.id ?? ""); } }).catch(caught => { if (alive) setError(String(caught)); });
    return () => { alive = false; };
  }, [current?.id, current?.configured]);
  async function run(operation: () => Promise<unknown>) {
    if (pending) return;
    setPending(true); setError("");
    try { await operation(); await refresh(); await loadSaved(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : String(caught)); }
    finally { setPending(false); }
  }
  function choose(providerId: string) {
    const item = catalog.find(item => item.id === providerId);
    setProvider(providerId); setAuth(item?.methods.some(method => method.id === "api-key") || !item ? "api-key" : "oauth");
    setName(""); setKey(""); setBaseURL(""); setCustomModels(""); setEditing("new"); setError("");
  }
  async function add() {
    const profile = { ...(baseURL ? { baseURL } : {}), ...(!chosen ? { api: protocol } : {}),
      ...(customModels.trim() ? { models: customModels.split(/\n/).map(id => id.trim()).filter(Boolean).map(id => ({ id, name: id })) } : {}) };
    const connection = await client.call("connections.create", { name: name.trim() || chosen?.name || provider, provider, auth, profile });
    setSelected(connection.id);
    if (auth === "api-key" && key.trim()) await client.call("connections.setKey", { id: connection.id, key });
    else await client.call("auth.start", { connectionId: connection.id });
    setKey(""); setEditing(null);
  }
  return <section className="runtime-settings product-models">
    <div className="product-heading"><div><h1>模型服务</h1><p className="runtime-muted">管理账号、服务商和应用可用的模型。</p></div><button onClick={() => choose("openai")}>添加连接</button></div>
    {error && <p role="alert" className="product-alert">{error}</p>}
    <h2>账号与连接 <small>{connections.length}</small></h2>
    {!connections.length && <p className="runtime-muted">连接 API Key 或订阅账号，查看可用模型并添加到列表。</p>}
    <div className="product-list">{connections.map(connection => <article className={`product-row ${selected === connection.id ? "selected" : ""}`} key={connection.id}>
      <button className="product-row-main" onClick={() => setSelected(connection.id)}><strong>{connection.name}</strong><small>{catalog.find(item => item.id === connection.provider)?.name ?? connection.provider} · {connection.auth === "oauth" ? "订阅登录" : "API Key"} · {connection.configured ? "已连接" : "未连接"}</small></button>
      <div className="runtime-actions">
        <button disabled={pending} onClick={() => { setEditing(connection.id); setName(connection.name); setKey(""); }}>管理</button>
        {!connection.configured && <button disabled={pending} onClick={() => connection.auth === "oauth" ? void run(() => client.call("auth.start", { connectionId: connection.id })) : (setEditing(connection.id), setName(connection.name), setKey(""))}>连接</button>}
      </div>
    </article>)}</div>
    {current?.configured && <article className="runtime-card product-catalog"><h2>{current.name}的模型目录</h2>
      <label>选择模型<select value={modelId} onChange={event => setModelId(event.target.value)}><option value="">{models.length ? "选择模型" : "暂无目录，请刷新模型"}</option>{models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}</select></label>
      <p>{models.length} 个模型，{catalog.find(item => item.id === current.provider)?.dynamic ? "来自当前连接的账号目录" : "来自服务商预设或此连接的自定义配置"}。</p><div className="runtime-actions">
        <button className="runtime-primary" disabled={pending || !modelId || saved.some(model => model.connectionId === selected && model.id === modelId)} onClick={() => void run(() => client.call("models.select", { connectionId: selected, modelId, selected: true }))}>添加到模型列表</button>
        <button disabled={pending} onClick={() => void run(async () => { await client.call("connections.refresh", { id: selected }); const value = await readAllPages((offset, limit) => client.call("connections.models", { id: selected, offset, limit })); setModels(value); setModelId(value[0]?.id ?? ""); })}>刷新模型</button>
      </div><p>添加模型不会发起生成请求。预设目录不代表账号权限，连接和模型权限会在首次调用时验证。</p>
    </article>}
    {attempts.filter(attempt => attempt.status === "running" || attempt.status === "failed").map(attempt => <LoginInteraction key={attempt.id} attempt={attempt} action={action} />)}
    <div className="product-heading product-section"><h2>已添加的模型 <small>{saved.length}</small></h2><input aria-label="搜索已添加模型" placeholder="搜索模型或服务商" value={query} onChange={event => setQuery(event.target.value)} /></div>
    <div className="product-list">{saved.filter(model => `${model.name} ${model.id} ${connections.find(c => c.id === model.connectionId)?.name ?? ""}`.toLowerCase().includes(query.toLowerCase())).map(model => {
      const connection = connections.find(connection => connection.id === model.connectionId);
      return <article className="product-row" key={`${model.connectionId}:${model.id}`}><span className="product-avatar">{connection?.provider.slice(0, 1).toUpperCase()}</span><div className="product-row-main"><strong>{model.name}</strong><small>{connection?.name ?? "连接已移除"} · {model.id}</small></div><span className="product-badge">{connection?.auth === "oauth" ? "订阅" : "API Key"}</span><button disabled={pending} onClick={() => void run(() => client.call("models.select", { connectionId: model.connectionId, modelId: model.id, selected: false }))}>删除</button></article>;
    })}{!saved.length && <p className="product-empty">尚未添加模型。在账号目录中选择模型后添加。</p>}</div>
    <div className="product-section"><h2>从常用服务商开始</h2><p className="runtime-muted">内置 Pi 的 {catalog.length} 个服务商预设，自动匹配模型与调用协议。</p></div>
    <div className="product-provider-grid">{catalog.map(item => <button key={item.id} onClick={() => choose(item.id)}><strong>{item.name}</strong><small>{item.dynamic ? "账号模型目录" : `${item.modelCount} 个预设模型`} · {item.methods.map(method => method.subscription ? "订阅" : method.label).join(" / ")}</small></button>)}<button onClick={() => choose("custom")}><strong>自定义服务</strong><small>兼容协议、端点与模型 ID</small></button></div>
    {editing && <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true" aria-label={editing === "new" ? "添加模型连接" : "管理模型连接"}>
      <header><h2>{editing === "new" ? "添加模型连接" : "管理模型连接"}</h2><button aria-label="关闭" onClick={() => setEditing(null)}>×</button></header>
      <form className="runtime-form" onSubmit={event => { event.preventDefault(); void run(async () => { if (editing === "new") await add(); else { await client.call("connections.rename", { id: editing, name }); if (key) await client.call("connections.setKey", { id: editing, key }); setKey(""); setEditing(null); } }); }}>
        {editing === "new" && <><label>服务商<select value={chosen ? provider : "custom"} onChange={event => choose(event.target.value)}>{catalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}<option value="custom">自定义服务</option></select></label>
          {!chosen && <label>服务标识<input value={provider} onChange={event => setProvider(event.target.value)} pattern="[a-z][a-z0-9-]*" required /></label>}
          <label>认证方式<select value={auth} onChange={event => setAuth(event.target.value as typeof auth)}>{(chosen?.methods ?? [{ id: "api-key", label: "API Key" }]).map(method => <option key={method.id} value={method.id}>{method.id === "oauth" ? "订阅 / OAuth 登录" : "API Key / Token"}</option>)}</select></label></>}
        <label>连接名称<input value={name} onChange={event => setName(event.target.value)} placeholder={chosen?.name ?? "例如：工作账号"} required={editing !== "new"} /></label>
        {(editing === "new" ? auth === "api-key" : connections.find(c => c.id === editing)?.auth === "api-key") && <label>API Key<input type="password" autoComplete="off" value={key} onChange={event => setKey(event.target.value)} placeholder={editing === "new" ? "可留空，使用服务商交互认证" : "留空保持不变"} required={editing === "new" && !chosen} /></label>}
        {editing === "new" && <details open={!chosen}><summary>自定义端点与模型</summary><label>API 地址<input type="url" value={baseURL} onChange={event => setBaseURL(event.target.value)} placeholder="使用服务商默认地址" required={!chosen} /></label>
          {!chosen && <label>调用协议<select value={protocol} onChange={event => setProtocol(event.target.value)}><option value="openai-completions">OpenAI Chat Completions</option><option value="openai-responses">OpenAI Responses</option><option value="anthropic-messages">Anthropic Messages</option><option value="google-generative-ai">Google Generative AI</option></select></label>}
          <label>模型 ID（每行一个）<textarea value={customModels} onChange={event => setCustomModels(event.target.value)} placeholder="留空使用预设目录" required={!chosen} /></label></details>}
        {error && <p role="alert">{error}</p>}<button className="runtime-primary" disabled={pending}>{pending ? "正在保存…" : editing === "new" ? auth === "oauth" ? "添加并登录" : "添加连接" : "保存"}</button>
      </form>
      {editing !== "new" && <div className="runtime-actions"><button disabled={pending} onClick={() => void run(() => client.call("auth.logout", { connectionId: editing }))}>断开账号</button><button disabled={pending} onClick={() => void run(async () => { await client.call("connections.remove", { id: editing }); setEditing(null); })}>移除连接</button></div>}
      <p className="runtime-muted">同一服务商可添加多个账号。已有会话使用的账号或端点改变时，请新建连接。</p>
    </section></div>}
  </section>;
}
function LoginInteraction({ attempt, action }: { attempt: Login; action: (operation: () => Promise<unknown>) => Promise<void> }) {
  const [answer, setAnswer] = useState("");
  const prompt = attempt.prompt as { id: string; type: string; message: string; options?: { id: string; label: string }[]; placeholder?: string } | null;
  useEffect(() => setAnswer(""), [prompt?.id]);
  return <article className="runtime-card runtime-login"><h2>账号登录</h2>
    {attempt.events.slice(-4).map((raw, index) => {
      const event = raw as { type: string; url?: string; verificationUri?: string; userCode?: string; message?: string; instructions?: string };
      return <p key={index}>{event.message ?? event.instructions}{event.userCode && <strong> 验证码：{event.userCode}</strong>}
        {(event.url || event.verificationUri) && <button onClick={() => void native.system.openURL({ url: event.url ?? event.verificationUri! })}>打开登录页面</button>}</p>;
    })}
    {prompt && <form onSubmit={event => { event.preventDefault(); void action(() => client.call("auth.reply", { id: attempt.id, promptId: prompt.id, value: answer })); }}>
      <label>{prompt.message}{prompt.type === "select" ? <select value={answer} onChange={e => setAnswer(e.target.value)} required><option value="">请选择</option>{prompt.options?.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select> :
        <input type={prompt.type === "secret" ? "password" : "text"} value={answer} onChange={e => setAnswer(e.target.value)} placeholder={prompt.placeholder} autoComplete="off" />}</label><button>继续</button>
    </form>}
    {attempt.error && <p role="alert">{attempt.error}</p>}
    {attempt.status === "running" && <button onClick={() => void action(() => client.call("auth.cancel", { id: attempt.id }))}>取消登录</button>}
  </article>;
}
