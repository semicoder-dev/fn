import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-host";
import { join } from "node:path";
import SqliteSessionPersistence from "./provider.ts";
export const name = "fn-session-sqlite";
export function apply(ctx: Context) {
  return ctx.plugin(SqliteSessionPersistence, {
    path: join(ctx.host.dataDirectory, "sessions", "events.sqlite"),
  });
}
