import { defineAPI, z } from "@semicoder/fia/api";
import { id, empty, pagination, page, method } from "@semicoder/fn-host/contract";
export const runtimeConnection = z.object({
  id,
  name: z.string(),
  provider: z.string(),
  auth: z.enum(["api-key", "oauth"]),
  profile: z.record(z.string(), z.json()),
  configured: z.boolean(),
  error: z.string().optional(),
});
export const catalogModel = z.object({ id: z.string(), name: z.string() });

export default defineAPI({
  methods: {
    providers: method(
      "List Pi authentication methods",
      empty,
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          modelCount: z.number(),
          dynamic: z.boolean(),
          methods: z.array(
            z.object({ id: z.string(), label: z.string(), subscription: z.boolean() }),
          ),
        }),
      ),
    ),
    presets: method(
      "Read Pi preset models without credentials",
      z.object({ provider: z.string(), ...pagination }),
      page(catalogModel),
    ),
    refresh: method("Refresh the selected account catalog", z.object({ id }), z.null()),
    list: method(
      "Read a bounded page of model connections",
      z.object(pagination),
      page(runtimeConnection),
    ),
    create: method(
      "Create a connection with its own credentials",
      z.object({
        name: z.string().trim().min(1).max(100),
        provider: z.string().min(1).max(100),
        auth: z.enum(["api-key", "oauth"]),
        profile: z.record(z.string(), z.json()).optional(),
      }),
      runtimeConnection,
    ),
    rename: method(
      "Rename a model connection",
      z.object({ id, name: z.string().trim().min(1).max(100) }),
      runtimeConnection,
    ),
    remove: method("Remove an unused connection", z.object({ id }), z.null()),
    setKey: method(
      "Set explicit API key for a new connection",
      z.object({ id, key: z.string().min(1).max(16384) }),
      z.null(),
    ),
    models: method(
      "Read a bounded page of upstream models",
      z.object({ id, ...pagination }),
      page(z.object({ id: z.string(), name: z.string() })),
    ),
  },
  events: { changed: { description: "Connection state changed", payload: empty } },
});
