import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import {
  Button,
  Notice,
  PageHeader,
  SettingsSection,
  SettingsRow,
  IconNewChatOutlineRegular,
} from "@semicoder/fn-ui";
import React, { useEffect, useState } from "react";
import type { Context } from "@deepseek-ai/cordis";
import { client } from "@semicoder/fn-sdk/client";
import type { APIClient } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-ui-settings/contract";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import api from "@semicoder/fn-chat-cloudkit/contract";
export const inject = ["settingsSlots", "api:cloudkit", "slots", "navigation", "platform"];
function SyncSettings({ remote }: { remote: APIClient<typeof api> }) {
  const [status, setStatus] = useState<{
    status: string;
    lastSync?: number | null;
  }>();
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
    <section className={cx("settings-page")}>
      <PageHeader title="聊天同步" description="通过 iCloud，在桌面和手机之间同步会话。" />
      <SettingsSection title="iCloud" description="连接设备上登录的 iCloud 账号。">
        <SettingsRow label="连接状态" description={status?.status ?? "读取状态中…"}>
          <Button variant="outline" onClick={() => action("connect")} type="button">
            连接 iCloud
          </Button>
        </SettingsRow>
        <SettingsRow
          label="会话同步"
          description={
            status?.lastSync
              ? `上次同步 ${new Date(status.lastSync).toLocaleString()}`
              : "尚无同步记录"
          }
        >
          <Button variant="outline" onClick={() => action("sync")} type="button">
            立即同步
          </Button>
        </SettingsRow>
      </SettingsSection>
      {error && <Notice className={cx("sync-error")}>{error}</Notice>}
      <p className={cx("settings-note")}>只有通过手机创建的会话参与同步。</p>
    </section>
  );
}
export function apply(ctx: Context) {
  const remote = client(ctx, "cloudkit", api);
  ctx.slots.register({ name: "fn.settings.navigation", id: "cloudkit", order: 30 }, () => (
    <NavigationButton navigation={ctx.navigation} path="settings/chat" label="聊天同步">
      <IconNewChatOutlineRegular />
    </NavigationButton>
  ));
  ctx.slots.register(
    { name: "fn.settings.content", key: "chat", inject: () => ({ remote }) },
    SyncSettings,
  );
}
