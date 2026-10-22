import type { Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import { join } from "node:path";
import type {} from "@semicoder/fn-models";
import { readSessionProjection } from "@semicoder/fn-session-controller/projection";
import { SessionChatService } from "./service.ts";
import api from "./contract.ts";
export const name = "fn-chat-cloudkit";
export const inject = [
  "chat",
  "cards",
  "models",
  "connections",
  "sessionController",
  "sessionPersistence",
  "rpc",
  "activity",
];
export async function apply(ctx: Context) {
  const service = new SessionChatService({
    root: join(ctx.host.dataDirectory, "chat"),
    mode: ctx.host.platform.app.mode ?? "development",
    bundleId: ctx.host.platform.app.identifier,
    native: ctx.host.platform.native,
    context: ctx,
    projection: (id, offset, limit) => readSessionProjection(ctx, id, offset, limit),
    selectedModels: () => ctx.models.list(),
    accepting: () => ctx.activity.accepting,
    changed: () => ctx.rpc.emit("cloudkit", "changed", {}),
  });
  ctx.rpc.register(
    "cloudkit",
    implementAPI(api, {
      status: () => service.snapshot(),
      connect: () => {
        ctx.activity.assertAccepting();
        void service.connect();
        return null;
      },
      sync: () => {
        ctx.activity.assertAccepting();
        void service.sync();
        return null;
      },
    }),
  );
  ctx.activity.watch(() => service.busy());
  ctx.effect(() => () => service.stop());
  await service.start();
}
