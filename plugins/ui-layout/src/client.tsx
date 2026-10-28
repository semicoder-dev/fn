import { classes } from "@semicoder/fn-ui";
import styles from "./style.module.css";
const cx = (...values: (string | false | undefined)[]) => classes(styles, ...values);
import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk/client";
import type { PropsRenderSlots } from "@deepseek-ai/dsh-client-ui-slots";
import { useNavigation } from "@semicoder/fn-ui-navigation/view";
import type Navigation from "@semicoder/fn-ui-navigation/types";
import type {} from "./contract.ts";
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
}: PropsRenderSlots<keyof typeof children> & {
  navigation: Navigation;
}) {
  const path = useNavigation(navigation);
  return (
    <>
      <div className={cx("runtime-shell app-shell")}>
        <nav className={cx("activity-bar")} aria-label="主导航">
          <div className={cx("activity-apps")}>{renderSlot("fn.sidebar.top", {})}</div>
          <div className={cx("activity-bottom")}>{renderSlot("fn.sidebar.bottom", {})}</div>
        </nav>
        <main className={cx("runtime-main")}>
          {renderSlot("fn.toolbar", {})}
          {renderSlot("fn.status", {})}
          <div className={cx("fn-layout-content")}>
            {renderSlot("fn.main", {}, { entryKey: path.split("/")[0] })}
          </div>
        </main>
        {renderSlot("fn.overlay", {})}
      </div>
    </>
  );
}
export function apply(ctx: Context) {
  ctx.slots.register(
    { name: "root", children, inject: () => ({ navigation: ctx.navigation }) },
    Layout,
  );
  ctx.provide("layoutSlots", true);
}
