import React, { useEffect, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import { client } from "@semicoder/fn-sdk/client";
import type { APIClient } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-ui-settings/contract";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import api from "@semicoder/fn-chat-cloudkit/contract";
export const inject = ["settingsSlots", "api:cloudkit", "slots", "navigation", "platform"];
function SyncSettings({ remote }: { remote: APIClient<typeof api> }) {
  const [status, setStatus] = useState<{ status: string; lastSync?: number | null }>();
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const read = () =>
      void remote
        .call("status", {})
        .then((value) => {
          if (alive) setStatus(value as typeof status);
        })
        .catch((error) => {
          if (alive) setError(String(error));
        });
    const off = remote.on("changed", read),
      reconnect = remote.onReconnect(read);
    read();
    return () => {
      alive = false;
      off();
      reconnect();
    };
  }, []);
  const action = (method: "connect" | "sync") => {
    void remote.call(method, {}).catch((error) => setError(String(error)));
  };
  return (
    <section className="runtime-settings">
      <h1>聊天同步</h1>
      <p>通过 iCloud，让桌面和手机连接同一个会话。</p>
      <article className="runtime-card">
        <h2>fn Chat</h2>
        <p>{status?.status ?? "读取状态中…"}</p>
        {status?.lastSync && <p>上次同步 {new Date(status.lastSync).toLocaleString()}</p>}
        <div className="runtime-actions">
          <button onClick={() => action("connect")}>连接 iCloud</button>
          <button onClick={() => action("sync")}>立即同步</button>
        </div>
        {error && <p role="alert">{error}</p>}
        <p>只有通过手机创建的会话参与同步。此开发组合使用独立的 Chat v4 数据空间。</p>
      </article>
    </section>
  );
}
export function apply(ctx: Context) {
  const remote = client(ctx, "cloudkit", api);
  ctx.slots.register({ name: "fn.settings.navigation", id: "cloudkit", order: 30 }, () => (
    <NavigationButton navigation={ctx.navigation} path="settings/chat" label="聊天同步" />
  ));
  ctx.slots.register(
    { name: "fn.settings.content", key: "chat", inject: () => ({ remote }) },
    SyncSettings,
  );
}
