import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import { UIProvider } from "@semicoder/fn-sdk/ui";
import type {} from "@semicoder/fn-sdk/client";
import type { PropsRenderSlots } from "@deepseek-ai/dsh-client-ui-slots";
import { useNavigation } from "@semicoder/fn-ui-navigation/view";
import type Navigation from "@semicoder/fn-ui-navigation/types";
import type {} from "./contract.ts";
import "./style.css";
export const inject = ["uiSession", "uiBase", "slots", "navigation"];
const children = {
  "fn.sidebar.top": { kind: "list", scope: "root" },
  "fn.sidebar.bottom": { kind: "list", scope: "root" },
  "fn.main": { kind: "keyed", scope: "root" },
  "fn.toolbar": { kind: "list", scope: "root" },
  "fn.status": { kind: "list", scope: "root" },
  "fn.overlay": { kind: "list", scope: "root" },
} as const;
function Layout({
  renderSlot,
  navigation,
}: PropsRenderSlots<keyof typeof children> & { navigation: Navigation }) {
  const path = useNavigation(navigation);
  return (
    <UIProvider>
      <div className="runtime-shell app-shell">
        <nav className="activity-bar" aria-label="主导航">
          <div className="activity-apps">{renderSlot("fn.sidebar.top", {})}</div>
          <div className="activity-bottom">{renderSlot("fn.sidebar.bottom", {})}</div>
        </nav>
        <main className="runtime-main">
          {renderSlot("fn.toolbar", {})}
          {renderSlot("fn.status", {})}
          <div className="fn-layout-content">
            {renderSlot("fn.main", {}, { entryKey: path.split("/")[0] })}
          </div>
        </main>
        {renderSlot("fn.overlay", {})}
      </div>
    </UIProvider>
  );
}
export function apply(ctx: Context) {
  ctx.slots.register(
    { name: "root", children, inject: () => ({ navigation: ctx.navigation }) },
    Layout,
  );
  ctx.provide("layoutSlots", true);
}
