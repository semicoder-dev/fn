import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, pagination, page, method } from "@semicoder/fn-host/contract";
import { selection } from "@semicoder/fn-connections/selection";
export const savedModel = z.object({ id: z.string(), name: z.string(), connectionId: id });
export default defineAPI({
  methods: {
    saved: method("Read selected models", z.object(pagination), page(savedModel)),
    select: method(
      "Add or remove a model from the workspace picker",
      z.object({ ...selection, selected: z.boolean() }),
      z.null(),
    ),
  },
  events: { changed: { description: "Selected models changed", payload: empty } },
});
