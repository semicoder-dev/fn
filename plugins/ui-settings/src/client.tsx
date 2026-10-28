import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import type { PropsRenderSlots } from "@deepseek-ai/dsh-client-ui-slots";
import { IconSettingsOutlineRegular } from "@semicoder/fn-ui";
import type {} from "@semicoder/fn-sdk/client";
import type {} from "@semicoder/fn-ui-layout/contract";
import type {} from "./contract.ts";
import { NavigationButton, useNavigation } from "@semicoder/fn-ui-navigation/view";
import type Navigation from "@semicoder/fn-ui-navigation/types";
export const inject = ["layoutSlots", "slots", "navigation"];
function SettingsPage({
  renderSlot,
  navigation,
}: PropsRenderSlots<"fn.settings.navigation" | "fn.settings.content"> & {
  navigation: Navigation;
}) {
  const path = useNavigation(navigation);
  return (
    <div className={cx("settings-layout")}>
      <aside className={cx("settings-nav")}>
        <h1>设置</h1>
        <p>管理你的工作空间</p>
        {renderSlot("fn.settings.navigation", {})}
      </aside>
      <section className={cx("settings-main")}>
        {renderSlot("fn.settings.content", {}, { entryKey: path.split("/")[1] ?? "models" })}
      </section>
    </div>
  );
}
export function apply(ctx: Context) {
  ctx.slots.register({ name: "fn.sidebar.bottom", id: "settings", order: 100 }, () => (
    <NavigationButton navigation={ctx.navigation} path="settings/models" label="设置" compact>
      <IconSettingsOutlineRegular />
    </NavigationButton>
  ));
  ctx.slots.register(
    {
      name: "fn.main",
      key: "settings",
      children: {
        "fn.settings.navigation": { kind: "list", scope: "root" },
        "fn.settings.content": { kind: "keyed", scope: "root" },
      },
      inject: () => ({ navigation: ctx.navigation }),
    },
    SettingsPage,
  );
  ctx.provide("settingsSlots", true);
}
