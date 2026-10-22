import React from "react";
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
export const inject = ["layoutSlots", "api:fixtureCards", "slots"];
export function apply(ctx: Context) {
  ctx.slots.register({ name: "fn.status", id: "fixture-dual" }, () => (
    <aside>双端插件已加载</aside>
  ));
}
