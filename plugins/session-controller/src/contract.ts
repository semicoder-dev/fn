import { defineAPI, z } from "@semicoder/fia/api";
import { id, pagination, page, method } from "@semicoder/fn-host/contract";
import { selection } from "@semicoder/fn-connections/selection";
const policy = z.enum(["controlled", "automatic"]);
export const runtimeSession = z.object({
  id,
  targetId: id,
  ...selection,
  title: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  archived: z.boolean(),
  policy,
  cwd: z.string().optional(),
  status: z.enum(["idle", "running", "unloaded"]),
});

export default defineAPI({
  methods: {
    list: method(
      "Read a bounded page of application sessions",
      z.object({ targetId: id.optional(), ...pagination }),
      page(runtimeSession),
    ),
    create: method(
      "Create a session bound to one connection",
      z.object({
        targetId: id,
        ...selection,
        title: z.string().max(200).optional(),
        cwd: z.string().max(4096).optional(),
        policy: policy.optional(),
      }),
      runtimeSession,
    ),
    send: method(
      "Durably enqueue input; requestId makes retries idempotent",
      z.object({
        id,
        text: z.string().min(1).max(262144),
        requestId: id,
      }),
      runtimeSession,
    ),
    cancel: method("Cancel the current agent turn", z.object({ id }), z.null()),
    model: method(
      "Select another model on the same connection",
      z.object({ id, modelId: z.string().min(1).max(256) }),
      runtimeSession,
    ),
    archive: method(
      "Archive or restore a session",
      z.object({ id, archived: z.boolean() }),
      runtimeSession,
    ),
    projection: method(
      "Read a durable, bounded display projection",
      z.object({
        id,
        offset: z.number().int().nonnegative().default(0),
        limit: z.number().int().min(1).max(100).default(50),
      }),
      z.json(),
    ),
  },
  events: {
    changed: {
      description: "Session invalidation and transient stream",
      payload: z.object({
        kind: z.string(),
        sessionId: id.optional(),
        targetId: id.optional(),
        data: z.json().optional(),
      }),
    },
  },
});
