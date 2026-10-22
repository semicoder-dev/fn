import "./style.css";
import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import { RefreshCw } from "@semicoder/fn-sdk/ui";
import type {} from "@semicoder/fn-sdk/client";
import type {} from "@semicoder/fn-app-update/types";
import type {} from "@semicoder/fn-ui-settings/contract";
import { NavigationButton } from "@semicoder/fn-ui-navigation/view";
import UpdateSettings from "./page.tsx";
export const inject = ["settingsSlots", "slots", "navigation", "appUpdates"];
export function apply(ctx: Context) {
  ctx.slots.register({ name: "fn.settings.navigation", id: "updates", order: 20 }, () => (
    <NavigationButton navigation={ctx.navigation} path="settings/updates" label="应用更新">
      <RefreshCw size={18} />
    </NavigationButton>
  ));
  ctx.slots.register(
    { name: "fn.settings.content", key: "updates", inject: () => ({ updates: ctx.appUpdates }) },
    UpdateSettings,
  );
}
