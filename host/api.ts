import { defineAPI, z } from "@semicoder/fia/api";
export default defineAPI({
  methods: {
    "platform.command": {
      description: "Manage Fn applications and isolated development instances",
      input: z.object({ action: z.string(), input: z.json().optional() }),
      output: z.json(),
    },
  },
  events: {
    "platform.changed": {
      description: "Application platform changed",
      payload: z.object({}),
    },
  },
});
