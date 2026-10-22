import type { Context } from "@deepseek-ai/cordis";
import { defineAPI, implementAPI, z } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-rpc";
import type {} from "@semicoder/fn-chat-cards/service";
export const inject = ["rpc", "cards"];
export function apply(ctx: Context) {
  let answered = 0;
  ctx.cards.register("confirm", () => {
    answered++;
  });
  const contract = defineAPI({
    methods: {
      create: {
        description: "Create acceptance card",
        input: z.object({ sessionId: z.string() }),
        output: z.string(),
      },
      count: { description: "Count accepted actions", input: z.object({}), output: z.number() },
    },
  });
  ctx.rpc.register(
    "fixtureCards",
    implementAPI(contract, {
      create: ({ sessionId }) =>
        ctx.cards.create(sessionId, {
          key: "acceptance",
          handler: "confirm",
          card: {
            version: 1,
            template: "form",
            title: "自定义卡片验收",
            summary: "只执行一次",
            blocks: [{ type: "text", text: "请确认这张插件卡片。" }],
            inputs: [{ id: "answer", label: "验收输入", type: "text", required: true }],
            actions: [{ id: "ok", label: "确认验收", style: "primary" }],
          },
        }).id,
      count: () => answered,
    }),
  );
}
