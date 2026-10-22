import type { Context } from "@deepseek-ai/cordis";
import "./style.css";
export function apply(ctx: Context) {
  ctx.effect(() => {
    document.documentElement.classList.add("fn-ui");
    return () => document.documentElement.classList.remove("fn-ui");
  });
  ctx.provide("uiBase", true);
}
