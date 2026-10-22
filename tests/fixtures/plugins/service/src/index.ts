import type { Context } from "@deepseek-ai/cordis";
import { defineAPI, implementAPI, z } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-rpc";
import type {} from "@semicoder/fn-activity";
export const inject = ["rpc", "activity"];
export function apply(ctx: Context, config: { fail?: boolean } = {}) {
  if (config.fail) throw new Error("acceptance initialization failure");
  const contract = defineAPI({
    methods: {
      ping: { description: "Acceptance ping", input: z.object({}), output: z.string() },
      hold: {
        description: "Acceptance task",
        input: z.object({ ms: z.number().max(15000) }),
        output: z.null(),
      },
    },
  });
  ctx.rpc.register(
    "fixture",
    implementAPI(contract, {
      ping: () => "service-ready",
      hold: ({ ms }, request) =>
        ctx.activity.run(async () => {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, ms);
            request.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                reject(request.signal.reason);
              },
              { once: true },
            );
          });
          return null;
        }),
    }),
  );
}
