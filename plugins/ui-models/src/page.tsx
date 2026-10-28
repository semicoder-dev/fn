import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import { Modal } from "@semicoder/fn-ui";
import { Button, Select, Input, Textarea } from "@semicoder/fn-ui";
import React, { useEffect, useState } from "react";
import type { APIClient } from "@semicoder/fia/api";
import type { ClientPlatform } from "@semicoder/fn-sdk/client";
import type connectionApi from "@semicoder/fn-connections/contract";
import type authApi from "@semicoder/fn-connections/login-contract";
import type modelApi from "@semicoder/fn-models/contract";
import { readAllPages } from "@semicoder/fn-sdk/client";
export interface Clients {
  connectionsApi: APIClient<typeof connectionApi>;
  authApi: APIClient<typeof authApi>;
  modelsApi: APIClient<typeof modelApi>;
  native: ClientPlatform["native"];
}
type Connection =
  Awaited<ReturnType<Clients["connectionsApi"]["call"]>> extends never
    ? never
    : import("@semicoder/fia/api").z.infer<
        typeof connectionApi.methods.list.output
      >["items"][number];
type Provider = import("@semicoder/fia/api").z.infer<
  typeof connectionApi.methods.providers.output
>[number];
type Login = import("@semicoder/fia/api").z.infer<typeof authApi.methods.list.output>[number];
type Action = (operation: () => Promise<unknown>) => Promise<void>;
type Model = {
  id: string;
  name: string;
};
export default function ModelsPage({
  connections,
  refresh,
  action,
  clients,
}: {
  connections: Connection[];
  refresh: () => Promise<void>;
  action: Action;
  clients: Clients;
}) {
  const { connectionsApi, authApi, modelsApi, native } = clients;
  const providers = () => connectionsApi.call("providers", {});
  const logins = () => authApi.call("list", {});
  const [catalog, setCatalog] = useState<Provider[]>([]);
  const [attempts, setAttempts] = useState<Login[]>([]);
  const [saved, setSaved] = useState<
    (Model & {
      connectionId: string;
    })[]
  >([]);
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
  const chosen = catalog.find((item) => item.id === provider);
  const current = connections.find((connection) => connection.id === selected);
  const loadSaved = async () =>
    setSaved(await readAllPages((offset, limit) => modelsApi.call("saved", { offset, limit })));
  useEffect(() => {
    let alive = true;
    void providers()
      .then((value) => {
        if (alive) setCatalog(value);
      })
      .catch((caught) => setError(String(caught)));
    const read = () => {
      void Promise.all([
        providers(),
        logins(),
        readAllPages((offset, limit) => modelsApi.call("saved", { offset, limit })),
      ])
        .then(([catalog, attempts, models]) => {
          if (alive) {
            setCatalog(catalog);
            setAttempts(attempts);
            setSaved(models);
          }
        })
        .catch((caught) => {
          if (alive) setError(String(caught));
        });
    };
    read();
    const offs = [
      connectionsApi.on("changed", read),
      authApi.on("changed", read),
      modelsApi.on("changed", read),
    ];
    const reconnect = connectionsApi.onReconnect(read);
    return () => {
      alive = false;
      offs.forEach((off) => off());
      reconnect();
    };
  }, []);
  useEffect(() => {
    if (pending) return;
    if (!connections.some((connection) => connection.id === selected))
      setSelected(connections[0]?.id ?? "");
  }, [connections, selected, pending]);
  useEffect(() => {
    let alive = true;
    setModels([]);
    setModelId("");
    if (current?.configured)
      void readAllPages((offset, limit) =>
        connectionsApi.call("models", { id: current.id, offset, limit }),
      )
        .then((value) => {
          if (alive) {
            setModels(value);
            setModelId(value[0]?.id ?? "");
          }
        })
        .catch((caught) => {
          if (alive) setError(String(caught));
        });
    return () => {
      alive = false;
    };
  }, [current?.id, current?.configured]);
  async function run(operation: () => Promise<unknown>) {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await operation();
      await refresh();
      await loadSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }
  function choose(providerId: string) {
    const item = catalog.find((item) => item.id === providerId);
    setProvider(providerId);
    setAuth(item?.methods.some((method) => method.id === "api-key") || !item ? "api-key" : "oauth");
    setName("");
    setKey("");
    setBaseURL("");
    setCustomModels("");
    setEditing("new");
    setError("");
  }
  async function add() {
    const profile = {
      ...(baseURL ? { baseURL } : {}),
      ...(!chosen ? { api: protocol } : {}),
      ...(customModels.trim()
        ? {
            models: customModels
              .split(/\n/)
              .map((id) => id.trim())
              .filter(Boolean)
              .map((id) => ({ id, name: id })),
          }
        : {}),
    };
    const connection = await connectionsApi.call("create", {
      name: name.trim() || chosen?.name || provider,
      provider,
      auth,
      profile,
    });
    setSelected(connection.id);
    if (auth === "api-key" && key.trim())
      await connectionsApi.call("setKey", { id: connection.id, key });
    else await authApi.call("start", { connectionId: connection.id });
    setKey("");
    setEditing(null);
  }
  return (
    <section className={cx("runtime-settings product-models")}>
      <div className={cx("product-heading")}>
        <div>
          <h1>模型服务</h1>
          <p className={cx("runtime-muted")}>管理账号、服务商和应用可用的模型。</p>
        </div>
        <Button onClick={() => choose("openai")} type="button">
          添加连接
        </Button>
      </div>
      {error && (
        <p role="alert" className={cx("product-alert")}>
          {error}
        </p>
      )}
      <h2>
        账号与连接 <small>{connections.length}</small>
      </h2>
      {!connections.length && (
        <p className={cx("runtime-muted")}>连接 API Key 或订阅账号，查看可用模型并添加到列表。</p>
      )}
      <div className={cx("product-list")}>
        {connections.map((connection) => (
          <article
            className={cx(`product-row ${selected === connection.id ? "selected" : ""}`)}
            key={connection.id}
          >
            <Button
              className={cx("product-row-main")}
              onClick={() => setSelected(connection.id)}
              type="button"
            >
              <strong>{connection.name}</strong>
              <small>
                {catalog.find((item) => item.id === connection.provider)?.name ??
                  connection.provider}{" "}
                · {connection.auth === "oauth" ? "订阅登录" : "API Key"} ·{" "}
                {connection.configured ? "已连接" : "未连接"}
              </small>
            </Button>
            <div className={cx("runtime-actions")}>
              <Button
                disabled={pending}
                onClick={() => {
                  setEditing(connection.id);
                  setName(connection.name);
                  setKey("");
                }}
                type="button"
              >
                管理
              </Button>
              {!connection.configured && (
                <Button
                  disabled={pending}
                  onClick={() =>
                    connection.auth === "oauth"
                      ? void run(() => authApi.call("start", { connectionId: connection.id }))
                      : (setEditing(connection.id), setName(connection.name), setKey(""))
                  }
                  type="button"
                >
                  连接
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {current?.configured && (
        <article className={cx("runtime-card product-catalog")}>
          <h2>{current.name}的模型目录</h2>
          <label>
            选择模型
            <Select
              value={modelId}
              onValueChange={(value) => setModelId(value)}
              label={"选择模型"}
              options={[
                { value: "", label: models.length ? "选择模型" : "暂无目录，请刷新模型" },
                ...(models.map((model) => ({ value: model.id, label: model.name })) ?? []),
              ]}
            />
          </label>
          <p>
            {models.length} 个模型，
            {catalog.find((item) => item.id === current.provider)?.dynamic
              ? "来自当前连接的账号目录"
              : "来自服务商预设或此连接的自定义配置"}
            。
          </p>
          <div className={cx("runtime-actions")}>
            <Button
              className={cx("runtime-primary")}
              disabled={
                pending ||
                !modelId ||
                saved.some((model) => model.connectionId === selected && model.id === modelId)
              }
              onClick={() =>
                void run(() =>
                  modelsApi.call("select", { connectionId: selected, modelId, selected: true }),
                )
              }
              type="button"
              variant="primary"
            >
              添加到模型列表
            </Button>
            <Button
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  await connectionsApi.call("refresh", { id: selected });
                  const value = await readAllPages((offset, limit) =>
                    connectionsApi.call("models", { id: selected, offset, limit }),
                  );
                  setModels(value);
                  setModelId(value[0]?.id ?? "");
                })
              }
              type="button"
            >
              刷新模型
            </Button>
          </div>
          <p>
            添加模型不会发起生成请求。预设目录不代表账号权限，连接和模型权限会在首次调用时验证。
          </p>
        </article>
      )}
      {attempts
        .filter((attempt) => attempt.status === "running" || attempt.status === "failed")
        .map((attempt) => (
          <LoginInteraction key={attempt.id} attempt={attempt} action={action} clients={clients} />
        ))}
      <div className={cx("product-heading product-section")}>
        <h2>
          已添加的模型 <small>{saved.length}</small>
        </h2>
        <Input
          aria-label="搜索已添加模型"
          placeholder="搜索模型或服务商"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className={cx("product-list")}>
        {saved
          .filter((model) =>
            `${model.name} ${model.id} ${connections.find((c) => c.id === model.connectionId)?.name ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((model) => {
            const connection = connections.find(
              (connection) => connection.id === model.connectionId,
            );
            return (
              <article className={cx("product-row")} key={`${model.connectionId}:${model.id}`}>
                <span className={cx("product-avatar")}>
                  {connection?.provider.slice(0, 1).toUpperCase()}
                </span>
                <div className={cx("product-row-main")}>
                  <strong>{model.name}</strong>
                  <small>
                    {connection?.name ?? "连接已移除"} · {model.id}
                  </small>
                </div>
                <span className={cx("product-badge")}>
                  {connection?.auth === "oauth" ? "订阅" : "API Key"}
                </span>
                <Button
                  disabled={pending}
                  onClick={() =>
                    void run(() =>
                      modelsApi.call("select", {
                        connectionId: model.connectionId,
                        modelId: model.id,
                        selected: false,
                      }),
                    )
                  }
                  type="button"
                >
                  删除
                </Button>
              </article>
            );
          })}
        {!saved.length && (
          <p className={cx("product-empty")}>尚未添加模型。在账号目录中选择模型后添加。</p>
        )}
      </div>
      <div className={cx("product-section")}>
        <h2>从常用服务商开始</h2>
        <p className={cx("runtime-muted")}>
          内置 Pi 的 {catalog.length} 个服务商预设，自动匹配模型与调用协议。
        </p>
      </div>
      <div className={cx("product-provider-grid")}>
        {catalog.map((item) => (
          <Button key={item.id} onClick={() => choose(item.id)} type="button">
            <strong>{item.name}</strong>
            <small>
              {item.dynamic ? "账号模型目录" : `${item.modelCount} 个预设模型`} ·{" "}
              {item.methods
                .map((method) => (method.subscription ? "订阅" : method.label))
                .join(" / ")}
            </small>
          </Button>
        ))}
        <Button onClick={() => choose("custom")} type="button">
          <strong>自定义服务</strong>
          <small>兼容协议、端点与模型 ID</small>
        </Button>
      </div>
      {editing && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={editing === "new" ? "添加模型连接" : "管理模型连接"}
          closeLabel="关闭"
          className={cx("runtime-dialog")}
          contentClassName={cx("dialog-content")}
        >
          <form
            className={cx("runtime-form")}
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                if (editing === "new") await add();
                else {
                  await connectionsApi.call("rename", { id: editing, name });
                  if (key) await connectionsApi.call("setKey", { id: editing, key });
                  setKey("");
                  setEditing(null);
                }
              });
            }}
          >
            {editing === "new" && (
              <>
                <label>
                  服务商
                  <Select
                    value={chosen ? provider : "custom"}
                    onValueChange={(value) => choose(value)}
                    label={"服务商"}
                    options={[
                      ...(catalog.map((item) => ({ value: item.id, label: item.name })) ?? []),
                      { value: "custom", label: "自定义服务" },
                    ]}
                  />
                </label>
                {!chosen && (
                  <label>
                    服务标识
                    <Input
                      value={provider}
                      onChange={(event) => setProvider(event.target.value)}
                      pattern="[a-z][a-z0-9-]*"
                      required
                    />
                  </label>
                )}
                <label>
                  认证方式
                  <Select
                    value={auth}
                    onValueChange={(value) => setAuth(value as typeof auth)}
                    label={"认证方式"}
                    options={[
                      ...((chosen?.methods ?? [{ id: "api-key", label: "API Key" }]).map(
                        (method) => ({
                          value: method.id,
                          label: method.id === "oauth" ? "订阅 / OAuth 登录" : "API Key / Token",
                        }),
                      ) ?? []),
                    ]}
                  />
                </label>
              </>
            )}
            <label>
              连接名称
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={chosen?.name ?? "例如：工作账号"}
                required={editing !== "new"}
              />
            </label>
            {(editing === "new"
              ? auth === "api-key"
              : connections.find((c) => c.id === editing)?.auth === "api-key") && (
              <label>
                API Key
                <Input
                  type="password"
                  autoComplete="off"
                  value={key}
                  onChange={(event) => setKey(event.target.value)}
                  placeholder={editing === "new" ? "可留空，使用服务商交互认证" : "留空保持不变"}
                  required={editing === "new" && !chosen}
                />
              </label>
            )}
            {editing === "new" && (
              <details open={!chosen}>
                <summary>自定义端点与模型</summary>
                <label>
                  API 地址
                  <Input
                    type="url"
                    value={baseURL}
                    onChange={(event) => setBaseURL(event.target.value)}
                    placeholder="使用服务商默认地址"
                    required={!chosen}
                  />
                </label>
                {!chosen && (
                  <label>
                    调用协议
                    <Select
                      value={protocol}
                      onValueChange={(value) => setProtocol(value)}
                      label={"调用协议"}
                      options={[
                        { value: "openai-completions", label: "OpenAI Chat Completions" },
                        { value: "openai-responses", label: "OpenAI Responses" },
                        { value: "anthropic-messages", label: "Anthropic Messages" },
                        { value: "google-generative-ai", label: "Google Generative AI" },
                      ]}
                    />
                  </label>
                )}
                <label>
                  模型 ID（每行一个）
                  <Textarea
                    value={customModels}
                    onChange={(event) => setCustomModels(event.target.value)}
                    placeholder="留空使用预设目录"
                    required={!chosen}
                  />
                </label>
              </details>
            )}
            {error && <p role="alert">{error}</p>}
            <Button
              className={cx("runtime-primary")}
              disabled={pending}
              type="submit"
              variant="primary"
            >
              {pending
                ? "正在保存…"
                : editing === "new"
                  ? auth === "oauth"
                    ? "添加并登录"
                    : "添加连接"
                  : "保存"}
            </Button>
          </form>

          {editing !== "new" && (
            <div className={cx("runtime-actions")}>
              <Button
                disabled={pending}
                onClick={() => void run(() => authApi.call("logout", { connectionId: editing }))}
                type="button"
              >
                断开账号
              </Button>
              <Button
                disabled={pending}
                onClick={() =>
                  void run(async () => {
                    await connectionsApi.call("remove", { id: editing });
                    setEditing(null);
                  })
                }
                type="button"
              >
                移除连接
              </Button>
            </div>
          )}

          <p className={cx("runtime-muted")}>
            同一服务商可添加多个账号。已有会话使用的账号或端点改变时，请新建连接。
          </p>
        </Modal>
      )}
    </section>
  );
}
function LoginInteraction({
  attempt,
  action,
  clients,
}: {
  attempt: Login;
  action: Action;
  clients: Clients;
}) {
  const { native, authApi } = clients;
  const [answer, setAnswer] = useState("");
  const prompt = attempt.prompt as {
    id: string;
    type: string;
    message: string;
    options?: {
      id: string;
      label: string;
    }[];
    placeholder?: string;
  } | null;
  useEffect(() => setAnswer(""), [prompt?.id]);
  return (
    <article className={cx("runtime-card runtime-login")}>
      <h2>账号登录</h2>
      {attempt.events.slice(-4).map((raw, index) => {
        const event = raw as {
          type: string;
          url?: string;
          verificationUri?: string;
          userCode?: string;
          message?: string;
          instructions?: string;
        };
        return (
          <p key={index}>
            {event.message ?? event.instructions}
            {event.userCode && <strong> 验证码：{event.userCode}</strong>}
            {(event.url || event.verificationUri) && (
              <Button
                onClick={() =>
                  void native.system.openURL({ url: event.url ?? event.verificationUri! })
                }
                type="button"
              >
                打开登录页面
              </Button>
            )}
          </p>
        );
      })}
      {prompt && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void action(() =>
              authApi.call("reply", { id: attempt.id, promptId: prompt.id, value: answer }),
            );
          }}
        >
          <label>
            {prompt.message}
            {prompt.type === "select" ? (
              <Select
                value={answer}
                onValueChange={(value) => setAnswer(value)}
                required
                label={prompt.message}
                options={[
                  { value: "", label: "请选择" },
                  ...(prompt.options?.map((option) => ({
                    value: option.id,
                    label: option.label,
                  })) ?? []),
                ]}
              />
            ) : (
              <Input
                type={prompt.type === "secret" ? "password" : "text"}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={prompt.placeholder}
                autoComplete="off"
              />
            )}
          </label>
          <Button type="submit">继续</Button>
        </form>
      )}
      {attempt.error && <p role="alert">{attempt.error}</p>}
      {attempt.status === "running" && (
        <Button
          onClick={() => void action(() => authApi.call("cancel", { id: attempt.id }))}
          type="button"
        >
          取消登录
        </Button>
      )}
    </article>
  );
}
