import { z } from "@semicoder/fia/api";
import {
  messageSchema,
  requestStateSchema,
  deliverySchema,
  botSchema,
  hostSchema,
} from "./protocol";
export const chatSnapshot = z.strictObject({
  connected: z.boolean(),
  status: z.string(),
  hostId: z.string().nullable(),
  lastSync: z.number().nullable(),
  pending: z.number(),
  unsupported: z.number(),
  failures: z.array(z.strictObject({ id: z.string(), error: z.string() })),
  host: hostSchema.nullable(),
  bots: z.array(botSchema),
  items: z.array(
    z.strictObject({
      message: messageSchema,
      state: requestStateSchema.optional(),
      delivery: deliverySchema.optional(),
    }),
  ),
  next: z.string().optional(),
});
export type ChatSnapshot = z.infer<typeof chatSnapshot>;
