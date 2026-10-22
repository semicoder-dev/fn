import type { Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import type { AssistantStreamFrame } from "@deepseek-ai/dsh-agent";
import type {} from "@semicoder/fn-rpc";
import SessionController from "./service.ts";
import api from "./contract.ts";
import approvalApi from "./approval-contract.ts";
import { boundedPage } from "@semicoder/fn-host/pagination";
import { readSessionProjection } from "./projection.ts";
export const name = "fn-session-controller";
export const inject = [
  "agents",
  "agentLoop",
  "sessions",
  "sessionPersistence",
  "connections",
  "activity",
  "tools",
  "systemPrompt",
  "rpc",
];
export async function apply(ctx: Context) {
  await ctx.plugin(SessionController);
  await ctx.inject(["sessionController"], (scope) => {
    const service = scope.sessionController;
    scope.rpc.register(
      "sessions",
      implementAPI(api, {
        list: ({ targetId, offset, limit }) =>
          boundedPage(
            service
              .sessions(targetId)
              .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)),
            offset,
            limit,
          ),
        create: (input) => service.createSession(input),
        send: ({ id, text, requestId }) => service.send(id, text, requestId),
        cancel: async ({ id }) => {
          await service.cancel(id);
          return null;
        },
        model: ({ id, modelId }) => service.setModel(id, modelId),
        archive: ({ id, archived }) => service.archive(id, archived),
        projection: async ({ id, offset, limit }) => {
          service.session(id);
          return JSON.parse(JSON.stringify(await readSessionProjection(scope, id, offset, limit)));
        },
      }),
    );
    scope.rpc.register(
      "approvals",
      implementAPI(approvalApi, {
        list: () => service.pendingApprovals(),
        reply: ({ id, allow }) => {
          service.answerApproval(id, allow);
          return null;
        },
      }),
    );
    scope.on("fn/session-change", (event) => {
      let data: unknown;
      if (event.kind === "stream") {
        const frame = event.data as AssistantStreamFrame;
        if (frame.type === "start" || frame.type === "end")
          data = { type: frame.type, attemptId: frame.attemptId, revision: frame.revision };
        else if (frame.chunk.type === "text-delta" || frame.chunk.type === "reasoning-delta")
          data = {
            type: "delta",
            attemptId: frame.attemptId,
            revision: frame.revision,
            index: frame.index,
            text: frame.chunk.text.slice(0, 32768),
            reasoning: frame.chunk.type === "reasoning-delta",
          };
        else return;
      }
      scope.rpc.emit("sessions", "changed", { ...event, data });
    });
  });
}
