import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, method } from "@semicoder/fn-host/contract";
const login = z.object({
  id,
  connectionId: id,
  status: z.enum(["running", "completed", "failed", "cancelled"]),
  events: z.array(z.json()),
  prompt: z.json().nullable(),
  error: z.string().nullable(),
});

export default defineAPI({
  methods: {
    start: method("Start a managed Pi login", z.object({ connectionId: id }), login),
    list: method("Read active authentication interactions", empty, z.array(login)),
    reply: method(
      "Answer a pending login prompt",
      z.object({ id, promptId: id, value: z.string().max(16384) }),
      z.null(),
    ),
    cancel: method("Cancel a login and its callback listener", z.object({ id }), z.null()),
    logout: method("Remove connection credentials", z.object({ connectionId: id }), z.null()),
  },
  events: { changed: { description: "Login interaction changed", payload: empty } },
});
