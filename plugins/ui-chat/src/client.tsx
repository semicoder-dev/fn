import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import { Checkbox } from "@semicoder/fn-ui";
import { Modal } from "@semicoder/fn-ui";
import {
  Button,
  Textarea,
  Select,
  Input,
  IconNewChatOutlineRegular,
  IconPaperPlaneOutlineRegular,
  IconStopFillRegular,
  IconArchiveOutlineRegular,
  IconUnarchiveOutlineRegular,
} from "@semicoder/fn-ui";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import type { APIClient, z } from "@semicoder/fia/api";
import { client, readAllPages } from "@semicoder/fn-sdk/client";
import type { PropsRenderSlots } from "@deepseek-ai/dsh-client-ui-slots";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import type UiSession from "@semicoder/fn-ui-session/types";
import type Navigation from "@semicoder/fn-ui-navigation/types";
import type {} from "@semicoder/fn-ui-layout/contract";
import type {} from "./contract.ts";
import sessionApi, { runtimeSession } from "@semicoder/fn-session-controller/contract";
import approvalApi from "@semicoder/fn-session-controller/approval-contract";
import connectionApi, { runtimeConnection } from "@semicoder/fn-connections/contract";
import modelApi from "@semicoder/fn-models/contract";
import chatApi from "@semicoder/fn-chat/contract";
import type {
  SessionDisplayItem,
  SessionProjectionPage,
} from "@semicoder/fn-session-controller/projection";
export const inject = [
  "uiSession",
  "layoutSlots",
  "api:sessions",
  "api:chat",
  "api:connections",
  "api:models",
  "api:approvals",
  "slots",
  "navigation",
  "platform",
];
type Session = z.infer<typeof runtimeSession>;
type Connection = z.infer<typeof runtimeConnection>;
type Approval = {
  id: string;
  sessionId: string;
  toolName: string;
  reason?: string;
};
type Endpoint = {
  targetId: string;
  name: string;
};
type Remote = {
  sessions: APIClient<typeof sessionApi>;
  approvals: APIClient<typeof approvalApi>;
  connections: APIClient<typeof connectionApi>;
  models: APIClient<typeof modelApi>;
  chat: APIClient<typeof chatApi>;
};
const children = {
  "fn.chat.message": { kind: "single", scope: "root" },
  "fn.chat.cards": { kind: "list", scope: "root" },
  "fn.chat.input-actions": { kind: "list", scope: "root" },
} as const;
function Conversation({
  remote,
  navigation,
  selection,
  renderSlot,
}: PropsRenderSlots<keyof typeof children> & {
  remote: Remote;
  navigation: Navigation;
  selection: UiSession;
}) {
  const [sessions, setSessions] = useState<Session[]>([]),
    [connections, setConnections] = useState<Connection[]>([]),
    [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]),
    [items, setItems] = useState<SessionDisplayItem[]>([]);
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem("fn.plugins-v1.session") ?? "",
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [archived, setArchived] = useState(false),
    [creating, setCreating] = useState(false),
    [sending, setSending] = useState(false);
  const [error, setError] = useState(""),
    [online, setOnline] = useState(false);
  const [stream, setStream] = useState<{
    attemptId: string;
    index: number;
    text: string;
    reasoning: string;
  } | null>(null);
  const revision = useRef(0),
    current = useRef(sessionId),
    mounted = useRef(false);
  const requestIds = useRef(
    new Map<
      string,
      {
        text: string;
        id: string;
      }
    >(),
  );
  current.current = sessionId;
  useEffect(() => {
    selection.select(sessionId);
    return () => selection.select();
  }, [sessionId, selection]);
  const active = sessions.find((session) => session.id === sessionId),
    text = drafts[sessionId] ?? "";
  const visibleSessions = sessions.filter((session) => session.archived === archived);
  const activeDescription = active
    ? [
        endpoints.find((endpoint) => endpoint.targetId === active.targetId)?.name ??
          active.targetId,
        connections.find((connection) => connection.id === active.connectionId)?.name ??
          active.connectionId,
        active.archived ? "已归档" : undefined,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  const refresh = useCallback(async () => {
    const call = ++revision.current;
    try {
      const [sessions, connections, endpoints, approvals] = await Promise.all([
        readAllPages((offset, limit) => remote.sessions.call("list", { offset, limit })),
        readAllPages((offset, limit) => remote.connections.call("list", { offset, limit })),
        remote.chat.call("endpoints", {}),
        remote.approvals.call("list", {}),
      ]);
      if (!mounted.current || call !== revision.current) return;
      setSessions(sessions.sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id)));
      setConnections(connections);
      setEndpoints(endpoints);
      setApprovals(approvals);
      setOnline(true);
      const id = current.current,
        result: SessionDisplayItem[] = [];
      let offset = 0;
      if (id && sessions.some((session) => session.id === id))
        for (let page = 0; page < 1000; page++) {
          const projection = (await remote.sessions.call("projection", {
            id,
            offset,
            limit: 100,
          })) as unknown as SessionProjectionPage;
          result.push(...projection.items);
          if (!projection.hasMore) break;
          if (projection.nextOffset <= offset)
            throw new Error("Session projection did not advance");
          offset = projection.nextOffset;
        }
      if (mounted.current && call === revision.current && current.current === id) setItems(result);
    } catch (error) {
      if (mounted.current && call === revision.current) {
        setOnline(false);
        setError(String(error));
      }
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (!timer)
        timer = setTimeout(() => {
          timer = undefined;
          void refresh();
        }, 100);
    };
    const off = remote.sessions.on("changed", (event) => {
      if (event.kind === "stream" && event.sessionId === current.current && event.data) {
        const frame = event.data as {
          type: string;
          attemptId: string;
          index?: number;
          text?: string;
          reasoning?: boolean;
        };
        if (frame.type === "end") setStream(null);
        else if (frame.type === "start")
          setStream({ attemptId: frame.attemptId, index: -1, text: "", reasoning: "" });
        else
          setStream((previous) => {
            const value =
              previous?.attemptId === frame.attemptId
                ? previous
                : { attemptId: frame.attemptId, index: -1, text: "", reasoning: "" };
            if ((frame.index ?? -1) <= value.index) return value;
            const key = frame.reasoning ? "reasoning" : "text";
            return {
              ...value,
              index: frame.index ?? value.index,
              [key]: (value[key] + (frame.text ?? "")).slice(-262144),
            };
          });
      }
      schedule();
    });
    const stops = [
      off,
      remote.connections.on("changed", schedule),
      remote.chat.on("changed", schedule),
      remote.sessions.onReconnect(() => {
        setStream(null);
        schedule();
      }),
    ];
    void refresh();
    return () => {
      mounted.current = false;
      revision.current++;
      clearTimeout(timer);
      stops.forEach((stop) => stop());
    };
  }, [refresh]);
  useEffect(() => {
    localStorage.setItem("fn.plugins-v1.session", sessionId);
    setStream(null);
    setItems([]);
    void refresh();
  }, [sessionId, refresh]);
  const action = async (operation: () => Promise<unknown>) => {
    setError("");
    try {
      await operation();
      await refresh();
    } catch (error) {
      if (mounted.current) setError(String(error));
    }
  };
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!active || !text.trim() || sending) return;
    const id = active.id,
      body = text;
    let request = requestIds.current.get(id);
    if (!request || request.text !== body) {
      request = { text: body, id: crypto.randomUUID() };
      requestIds.current.set(id, request);
    }
    setSending(true);
    setError("");
    try {
      await remote.sessions.call("send", { id, text: body, requestId: request.id });
      requestIds.current.delete(id);
      if (mounted.current)
        setDrafts((previous) => (previous[id] === body ? { ...previous, [id]: "" } : previous));
      await refresh();
    } catch (error) {
      if (mounted.current) setError(String(error));
    } finally {
      if (mounted.current) setSending(false);
    }
  }
  return (
    <div className={cx("chat-page")}>
      {error && (
        <div role="alert" className={cx("runtime-error")}>
          <span>{error}</span>
          <Button onClick={() => setError("")} type="button">
            关闭
          </Button>
        </div>
      )}
      <div className={cx("runtime-chat")}>
        <aside className={cx("runtime-sessions")} aria-label="会话列表">
          <div className={cx("sessions-toolbar")}>
            <h2>会话</h2>
            <Button
              onClick={() => setCreating(true)}
              type="button"
              size="sm"
              icon={<IconNewChatOutlineRegular />}
              aria-label="新建会话"
              title="新建会话"
            />
          </div>
          <div className={cx("sessions-group")}>
            <span>{archived ? "已归档" : "最近会话"}</span>
            <Button onClick={() => setArchived(!archived)} type="button" size="sm">
              {archived ? "返回" : "归档"}
            </Button>
          </div>
          <div className={cx("sessions-list")}>
            {!visibleSessions.length && (
              <p className={cx("sessions-empty")}>
                {archived ? "没有已归档会话" : "新建一个会话，开始工作。"}
              </p>
            )}
            {visibleSessions.map((session) => (
              <Button
                key={session.id}
                className={cx("session-row", session.id === sessionId && "selected")}
                aria-current={session.id === sessionId ? "page" : undefined}
                onClick={() => setSessionId(session.id)}
                type="button"
                title={session.title}
              >
                <span className={cx("session-row-content")}>
                  <strong>{session.title}</strong>
                  <small>
                    {endpoints.find((endpoint) => endpoint.targetId === session.targetId)?.name ??
                      session.targetId}
                    {session.status === "running" ? " · 运行中" : ""}
                  </small>
                </span>
              </Button>
            ))}
          </div>
        </aside>
        <section className={cx("runtime-conversation")}>
          {active ? (
            <>
              <header className={cx("conversation-header")}>
                <div className={cx("conversation-heading")}>
                  <h1>{active.title}</h1>
                  <p title={activeDescription}>{activeDescription}</p>
                </div>
                <Button
                  onClick={() =>
                    void action(async () => {
                      await remote.sessions.call("archive", {
                        id: active.id,
                        archived: !active.archived,
                      });
                      setArchived(!active.archived);
                    })
                  }
                  type="button"
                  size="sm"
                  icon={
                    active.archived ? (
                      <IconUnarchiveOutlineRegular />
                    ) : (
                      <IconArchiveOutlineRegular />
                    )
                  }
                >
                  {active.archived ? "恢复会话" : "归档"}
                </Button>
              </header>
              <div className={cx("runtime-messages")}>
                <div className={cx("message-column")}>
                  {!items.length && (
                    <div className={cx("runtime-empty")}>发送消息，开始这次对话。</div>
                  )}
                  {items.map((item) => (
                    <React.Fragment key={item.id}>
                      {renderSlot("fn.chat.message", { item })}
                    </React.Fragment>
                  ))}
                  {renderSlot("fn.chat.cards", {
                    sessionId: active.id,
                    enabled: endpoints.some((endpoint) => endpoint.targetId === active.targetId),
                  })}
                  {stream && (
                    <article className={cx("runtime-message assistant")}>
                      <div className={cx("runtime-message-label")}>助手 · 正在生成</div>
                      {stream.reasoning && (
                        <details>
                          <summary>思考过程</summary>
                          <pre>{stream.reasoning}</pre>
                        </details>
                      )}
                      <div className={cx("runtime-message-text")}>{stream.text}</div>
                    </article>
                  )}
                  {active.status === "running" && (
                    <p className={cx("conversation-status")} role="status">
                      正在处理…
                    </p>
                  )}
                </div>
              </div>
              {approvals
                .filter((approval) => approval.sessionId === active.id)
                .map((approval) => (
                  <div className={cx("runtime-approval")} key={approval.id}>
                    <strong>允许执行 {approval.toolName}？</strong>
                    <p>{approval.reason}</p>
                    <div className={cx("approval-actions")}>
                      <Button
                        onClick={() =>
                          void action(() =>
                            remote.approvals.call("reply", { id: approval.id, allow: false }),
                          )
                        }
                        type="button"
                        size="sm"
                      >
                        拒绝
                      </Button>
                      <Button
                        onClick={() =>
                          void action(() =>
                            remote.approvals.call("reply", { id: approval.id, allow: true }),
                          )
                        }
                        type="button"
                        variant="primary"
                        size="sm"
                      >
                        允许一次
                      </Button>
                    </div>
                  </div>
                ))}
              <form className={cx("runtime-composer")} onSubmit={send}>
                <Textarea
                  aria-label="消息"
                  placeholder="输入消息…"
                  value={text}
                  onChange={(event) =>
                    setDrafts((previous) => ({ ...previous, [sessionId]: event.target.value }))
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <div className={cx("composer-toolbar")}>
                  <div className={cx("composer-model")}>
                    <SessionModel remote={remote} session={active} action={action} />
                  </div>
                  <div className={cx("composer-actions")}>
                    {renderSlot("fn.chat.input-actions", { session: active })}
                    {active.status === "running" && (
                      <Button
                        type="button"
                        size="sm"
                        icon={<IconStopFillRegular />}
                        onClick={() =>
                          void action(() => remote.sessions.call("cancel", { id: active.id }))
                        }
                      >
                        停止
                      </Button>
                    )}
                    <Button
                      disabled={!online || sending || !text.trim()}
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={<IconPaperPlaneOutlineRegular />}
                    >
                      {sending ? "正在提交…" : "发送"}
                    </Button>
                  </div>
                </div>
              </form>
              <p className={cx("composer-hint")}>
                {active.policy === "controlled" ? "写入与外部操作需要批准" : "已启用自动执行"} · ⌘
                Enter 发送
              </p>
            </>
          ) : (
            <div className={cx("runtime-welcome")}>
              <div className={cx("welcome-heading")}>
                <span className={cx("runtime-mark")}>fn</span>
                <h1>开始新的工作</h1>
              </div>
              <p>新建会话，或从左侧继续之前的对话。</p>
              <Button
                onClick={() =>
                  connections.some((connection) => connection.configured)
                    ? setCreating(true)
                    : navigation.go("settings/models")
                }
                type="button"
                variant="primary"
                icon={<IconNewChatOutlineRegular />}
              >
                {connections.some((connection) => connection.configured)
                  ? "新建会话"
                  : "添加模型连接"}
              </Button>
            </div>
          )}
        </section>
      </div>
      {creating && (
        <NewSession
          remote={remote}
          endpoints={endpoints}
          connections={connections}
          close={() => setCreating(false)}
          created={(id) => {
            setSessionId(id);
            setCreating(false);
            void refresh();
          }}
        />
      )}
    </div>
  );
}
function Message({ item }: { item: SessionDisplayItem }) {
  return (
    <article className={cx(`runtime-message ${item.kind}`)}>
      <div className={cx("runtime-message-label")}>
        {item.kind === "user"
          ? "你"
          : item.kind === "assistant"
            ? "助手"
            : (item.toolName ?? "会话状态")}
        {item.state ? ` · ${item.state}` : ""}
      </div>
      {item.reasoning && (
        <details>
          <summary>思考过程</summary>
          <pre>{item.reasoning}</pre>
        </details>
      )}
      <div className={cx("runtime-message-text")}>{item.text}</div>
      {item.truncated && <small>此条内容较长，展示已截断。</small>}
    </article>
  );
}
export function apply(ctx: Context) {
  const remote = {
    sessions: client(ctx, "sessions", sessionApi),
    approvals: client(ctx, "approvals", approvalApi),
    connections: client(ctx, "connections", connectionApi),
    models: client(ctx, "models", modelApi),
    chat: client(ctx, "chat", chatApi),
  };
  ctx.slots.register({ name: "fn.sidebar.top", id: "chat", order: 0 }, () => (
    <NavigationButton navigation={ctx.navigation} path="chat" label="fn Chat" compact>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z" />
      </svg>
    </NavigationButton>
  ));
  ctx.slots.register(
    {
      name: "fn.main",
      key: "chat",
      children,
      inject: () => ({ remote, navigation: ctx.navigation, selection: ctx.uiSession }),
    },
    Conversation,
  );
  ctx.slots.register({ name: "fn.chat.message", priority: 0 }, Message);
  ctx.provide("chatSlots", true);
}
function SessionModel({
  remote,
  session,
  action,
}: {
  remote: Remote;
  session: Session;
  action: (operation: () => Promise<unknown>) => Promise<void>;
}) {
  const [models, setModels] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    setModels([]);
    setError("");
    void readAllPages((offset, limit) =>
      remote.connections.call("models", { id: session.connectionId, offset, limit }),
    )
      .then((value) => {
        if (!disposed) setModels(value);
      })
      .catch((caught) => {
        if (!disposed) setError(String(caught));
      });
    return () => {
      disposed = true;
    };
  }, [session.connectionId]);
  return (
    <div className={cx("session-model")}>
      <Select
        value={session.modelId}
        disabled={session.status === "running" || !models.length}
        onValueChange={(value) => {
          const modelId = value;
          void action(() => remote.sessions.call("model", { id: session.id, modelId }));
        }}
        label={"会话模型"}
        options={[
          ...(!models.some((model) => model.id === session.modelId)
            ? [{ value: session.modelId, label: session.modelId }]
            : []),
          ...(models.map((model) => ({ value: model.id, label: model.name })) ?? []),
        ]}
      />
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
function NewSession({
  remote,
  endpoints,
  connections,
  close,
  created,
}: {
  remote: Remote;
  endpoints: Endpoint[];
  connections: Connection[];
  close: () => void;
  created: (id: string) => void;
}) {
  const available = connections.filter((connection) => connection.configured);
  const [targetId, setTargetId] = useState(endpoints[0]?.targetId ?? "");
  const [connectionId, setConnectionId] = useState(available[0]?.id ?? "");
  const [modelId, setModelId] = useState("");
  const [models, setModels] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [title, setTitle] = useState("");
  const [cwd, setCwd] = useState("");
  const [automatic, setAutomatic] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setModelId("");
    setModels([]);
    if (connectionId)
      void readAllPages((offset, limit) => remote.models.call("saved", { offset, limit }))
        .then((value) => value.filter((model) => model.connectionId === connectionId))
        .then(
          (result) => {
            if (alive) {
              setModels(result);
              setModelId(result[0]?.id ?? "");
            }
          },
          (caught) => {
            if (alive) setError(String(caught));
          },
        );
    return () => {
      alive = false;
    };
  }, [connectionId]);
  async function create(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const session = await remote.sessions.call("create", {
        targetId,
        connectionId,
        modelId,
        title: title || "新会话",
        ...(cwd ? { cwd } : {}),
        policy: automatic ? "automatic" : "controlled",
      });
      created(session.id);
    } catch (caught) {
      setError(String(caught));
    } finally {
      setPending(false);
    }
  }
  return (
    <Modal
      open
      onClose={close}
      title={"新会话"}
      closeLabel="关闭"
      className={cx("runtime-dialog")}
      contentClassName={cx("dialog-content")}
    >
      <form onSubmit={create} className={cx("runtime-form")}>
        <label>
          对话入口
          <Select
            value={targetId}
            onValueChange={(value) => setTargetId(value)}
            label={"对话入口"}
            options={[
              ...(endpoints.map((endpoint) => ({
                value: endpoint.targetId,
                label: endpoint.name,
              })) ?? []),
            ]}
          />
        </label>
        <label>
          连接
          <Select
            value={connectionId}
            onValueChange={(value) => setConnectionId(value)}
            required
            label={"连接"}
            options={[
              ...(available.map((connection) => ({
                value: connection.id,
                label: connection.name,
              })) ?? []),
            ]}
          />
        </label>
        <label>
          模型
          <Select
            value={modelId}
            onValueChange={(value) => setModelId(value)}
            required
            label={"模型"}
            options={[
              { value: "", label: models.length ? "选择模型" : "请先在设置中添加模型" },
              ...(models.map((model) => ({ value: model.id, label: model.name })) ?? []),
            ]}
          />
        </label>
        <label>
          标题
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="新会话" />
        </label>
        <label>
          工作目录
          <Input
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            placeholder="可选，填写本机绝对路径"
          />
          <span className={cx("field-note")}>文件与进程工具将在此目录中工作。</span>
        </label>
        <Checkbox
          className={cx("runtime-checkbox")}
          checked={automatic}
          onChange={(checked) => setAutomatic(checked)}
          label={"自动批准此会话的工具操作"}
        />
        {error && <p role="alert">{error}</p>}
        <div className={cx("dialog-actions")}>
          <Button type="button" onClick={close} disabled={pending}>
            取消
          </Button>
          <Button disabled={pending || !connectionId || !modelId} type="submit" variant="primary">
            {pending ? "正在创建…" : "创建会话"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
