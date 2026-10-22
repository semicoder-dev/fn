import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, method } from "@semicoder/fn-host/contract";
export const endpoint = z.object({
  targetId: id,
  name: z.string(),
  description: z.string().optional(),
});
export default defineAPI({
  methods: { endpoints: method("List Chat entries", empty, z.array(endpoint)) },
  events: { changed: { description: "Chat entries changed", payload: empty } },
});
