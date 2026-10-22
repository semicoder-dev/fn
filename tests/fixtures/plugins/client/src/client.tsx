import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
import pixel from "./pixel.png";
import "./style.css";
export const inject = ["slots", "uiSession"];
export function apply(ctx: Context, config: { layout?: boolean; failRender?: boolean } = {}) {
  if (config.layout)
    ctx.slots.register({ name: "root", priority: 100 }, () => {
      if (config.failRender) throw new Error("acceptance root render failure");
      return (
        <main className="fixture-client">
          <h1>替换布局验收</h1>
          <img src={pixel} alt="验收资源" />
          <p>独立前端插件已替换整个布局。</p>
        </main>
      );
    });
  else
    ctx.inject(["layoutSlots"], (scope) => {
      scope.slots.register({ name: "fn.status", id: "fixture-client" }, () => (
        <aside className="fixture-client">
          纯前端插件已加载
          <img src={pixel} alt="验收资源" />
        </aside>
      ));
    });
}
