import type { Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-rpc";
import CardsService from "./service.ts";
import api from "./api.ts";
import { boundedPage } from "@semicoder/fn-host/pagination";
export const name = "fn-chat-cards";
export const inject = ["sessionController", "activity", "rpc"];
export async function apply(ctx: Context) {
  await ctx.plugin(CardsService);
  await ctx.inject(["cards"], (scope) => {
    scope.rpc.register(
      "cards",
      implementAPI(api, {
        list: ({ sessionId, offset, limit }) =>
          boundedPage(scope.cards.cards(sessionId), offset, limit),
        respond: async ({ sessionId, cardId, actionId, values }) => {
          await scope.cards.respondCard(sessionId, cardId, actionId, values);
          return null;
        },
      }),
    );
    scope.on("fn/cards-change", (sessionId) => scope.rpc.emit("cards", "changed", { sessionId }));
  });
}
