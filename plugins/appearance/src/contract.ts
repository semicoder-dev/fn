import { defineAPI } from "@semicoder/fia/api";
import { empty, method } from "@semicoder/fn-host/contract";
import { appearanceSchema, appearanceUpdate } from "./theme.ts";
export default defineAPI({
  methods: {
    get: method("Read appearance preferences", empty, appearanceSchema),
    set: method("Persist light, dark or system appearance", appearanceUpdate, appearanceSchema),
  },
  events: { changed: { description: "Appearance changed", payload: appearanceSchema } },
});
