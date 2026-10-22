import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, method } from "@semicoder/fn-host/contract";
const approval = z.object({
  id,
  sessionId: id,
  toolName: z.string(),
  reason: z.string().optional(),
});
export default defineAPI({
  methods: {
    list: method("Read pending tool approval requests", empty, z.array(approval)),
    reply: method(
      "Approve once or reject an explicit tool request",
      z.object({ id, allow: z.boolean() }),
      z.null(),
    ),
  },
  events: {},
});
