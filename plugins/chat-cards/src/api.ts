import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, pagination, page, method } from "@semicoder/fn-host/contract";
import { sessionCardSchema, cardValuesSchema } from "./contract.ts";

export default defineAPI({
  methods: {
    list: method(
      "Read durable application interaction cards",
      z.object({ sessionId: id, ...pagination }),
      page(sessionCardSchema as unknown as z.ZodType<import("./contract.ts").SessionCard>),
    ),
    respond: method(
      "Claim a one-shot card response before invoking its application",
      z.object({ sessionId: id, cardId: id, actionId: id, values: cardValuesSchema }),
      z.null(),
    ),
  },
  events: { changed: { description: "Card state changed", payload: z.object({ sessionId: id }) } },
});
