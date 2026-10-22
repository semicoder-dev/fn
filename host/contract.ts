import { defineAPI, z } from "@semicoder/fia/api";
export default defineAPI({
  methods: {
    ready: {
      description: "Confirm the current composition after its root UI rendered",
      input: z.object({ epoch: z.string() }),
      output: z.null(),
    },
    status: {
      description: "Read host readiness",
      input: z.object({}),
      output: z.object({
        ready: z.boolean(),
        epoch: z.string(),
        error: z.string().nullable(),
        namespaces: z.array(z.string()),
      }),
    },
    recover: {
      description: "Restart with previous or default plugin composition",
      input: z.object({ mode: z.enum(["previous", "default"]) }),
      output: z.null(),
    },
  },
  events: {
    apis: {
      description: "Available plugin API namespaces changed",
      payload: z.object({ namespaces: z.array(z.string()) }),
    },
  },
});
