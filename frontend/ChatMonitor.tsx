import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  EmptyState,
  Page,
  PageHeader,
  Panel,
  PanelContent,
} from "@semicoder/fn-sdk/ui";
import { app } from "./bridge";
import type { ChatSnapshot } from "../shared/chat/api";
const phases: Record<string, string> = {
  pending: "等待回复",
  responded: "已回复",
  cancelled: "已取消",
  expired: "已过期",
  running: "处理中",
  completed: "已完成",
  failed: "处理失败",
  interrupted: "已中断，结果待确认",
};
export default function ChatMonitor({
  visible = true,
  settings = false,
}: {
  visible?: boolean;
  settings?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<ChatSnapshot | null>(null),
    [error, setError] = useState(""),
    [pluginId, setPlugin] = useState<string>(),
    [before, setBefore] = useState<string>();
  useEffect(() => {
    if (!visible) return;
    let live = true,
      version = 0;
    const refresh = () => {
      const id = ++version;
      void app
        .call("chat.snapshot", { pluginId, before })
        .then((s) => {
          if (live && id === version) {
            setSnapshot(s);
            setError("");
          }
        })
        .catch((e) => {
          if (live) setError(String(e));
        });
    };
    const off = app.on("chat.changed", refresh),
      reconnect = app.onReconnect(refresh);
    const focus = () => {
      void app.call("chat.sync", {});
      refresh();
    };
    window.addEventListener("focus", focus);
    refresh();
    return () => {
      live = false;
      off();
      reconnect();
      window.removeEventListener("focus", focus);
    };
  }, [visible, pluginId, before]);
  const act = async (method: "chat.connect" | "chat.sync") => {
    try {
      await app.call(method, {});
    } catch (e) {
      setError(String(e));
    }
  };
  return (
    <div className="page-scroll">
      <Page>
        <PageHeader
          title={settings ? "聊天同步" : "机器人通信"}
          description="查看本机机器人的会话。使用 iPhone 或 fn Chat 发送文字和填写卡片。"
          actions={
            <>
              <Button onClick={() => void act("chat.connect")}>连接 iCloud</Button>
              <Button onClick={() => void act("chat.sync")}>同步</Button>
            </>
          }
        />
        {error && <Alert tone="error">{error}</Alert>}
        <Panel>
          <PanelContent>
            <p role="status">{snapshot?.status ?? "正在读取…"}</p>
            <p>
              {snapshot?.host?.name ?? "本机服务端"} · 待发送 {snapshot?.pending ?? 0} 条
              {snapshot?.lastSync
                ? ` · 最近同步 ${new Date(snapshot.lastSync).toLocaleTimeString()}`
                : ""}
            </p>
            {!!snapshot?.unsupported && (
              <Alert>有 {snapshot.unsupported} 条不支持的记录，请更新配套客户端。</Alert>
            )}
            {snapshot?.failures.map((f) => (
              <Alert key={f.id} tone="error">
                {f.error}
              </Alert>
            ))}
          </PanelContent>
        </Panel>
        {!settings && (
          <div className="chat-monitor-columns">
            <section aria-label="机器人列表">
              {snapshot?.bots.map((bot) => (
                <Button
                  key={bot.pluginId}
                  variant={pluginId === bot.pluginId ? "primary" : "ghost"}
                  className="chat-monitor-bot"
                  onClick={() => {
                    setPlugin(bot.pluginId);
                    setBefore(undefined);
                  }}
                >
                  {bot.icon} {bot.name}
                  {bot.enabled ? "" : " · 不可用"}
                </Button>
              ))}
              {!snapshot?.bots.length && (
                <EmptyState
                  title="暂无聊天机器人"
                  description="安装显式声明聊天处理器的插件后显示。"
                />
              )}
            </section>
            <section aria-label="会话记录">
              {!pluginId ? (
                <EmptyState
                  title="选择一个机器人"
                  description="此处只读展示消息、卡片和处理状态。"
                />
              ) : (
                <>
                  {snapshot?.items
                    .slice()
                    .reverse()
                    .map(({ message: m, state, delivery }) => (
                      <Panel key={m.id}>
                        <PanelContent>
                          <p>
                            <strong>
                              {m.kind === "userText" || m.kind === "response" ? "我" : "机器人"}
                            </strong>{" "}
                            · {new Date(m.createdAt).toLocaleString()}
                          </p>
                          {m.kind === "userText" || m.kind === "botText" ? (
                            <p className="chat-monitor-text">{m.text}</p>
                          ) : m.kind === "request" ? (
                            <>
                              <h3>{m.card.title}</h3>
                              <p>{m.card.summary}</p>
                              {m.card.blocks.map((b, i) =>
                                b.type === "divider" ? (
                                  <hr key={i} />
                                ) : b.type === "text" ? (
                                  <p key={i} className="chat-monitor-text">
                                    {b.text}
                                  </p>
                                ) : (
                                  <dl key={i}>
                                    {b.fields.map((f, j) => (
                                      <React.Fragment key={j}>
                                        <dt>{f.label}</dt>
                                        <dd>{f.value}</dd>
                                      </React.Fragment>
                                    ))}
                                  </dl>
                                ),
                              )}
                              <p>
                                {phases[state?.phase ?? "pending"]}
                                {state?.phase === "pending" && m.expiresAt <= Date.now()
                                  ? " · 已过有效期"
                                  : ""}
                              </p>
                            </>
                          ) : (
                            <>
                              <p>卡片回复：{m.actionId}</p>
                              <pre>{JSON.stringify(m.values, null, 2)}</pre>
                            </>
                          )}
                          {delivery && (
                            <p role="status">
                              {phases[delivery.status]}
                              {delivery.progress ? ` · ${delivery.progress}` : ""}
                              {delivery.error ? ` · ${delivery.error}` : ""}
                            </p>
                          )}
                        </PanelContent>
                      </Panel>
                    ))}
                  {snapshot?.next && (
                    <Button onClick={() => setBefore(snapshot.next)}>更早消息</Button>
                  )}
                  {before && <Button onClick={() => setBefore(undefined)}>最新消息</Button>}
                </>
              )}
            </section>
          </div>
        )}
      </Page>
    </div>
  );
}
