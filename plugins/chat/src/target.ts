import type { Context } from "@deepseek-ai/cordis";
import { EntryGroup, type EntryOptions } from "@deepseek-ai/cordis-plugin-loader";
import { PluginGroup } from "@semicoder/fn-host";
import type {} from "./index.ts";
export const name = "fn-chat-target";
export const inject = ["sessionController", "chat", "loader"];
export interface Config {
  id: string;
  name: string;
  systemPrompt?: string;
  plugins?: EntryOptions[];
}
export async function apply(ctx: Context, config: Config) {
  const target = ctx.sessionController.registerTarget({
    id: config.id,
    name: config.name,
    systemPrompt: config.systemPrompt,
  });
  ctx.chat.register({ targetId: config.id, name: config.name });
  const tree = new PluginGroup(target.context);
  await tree.mount(config.plugins ?? []);
}
