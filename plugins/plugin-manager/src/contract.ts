import { defineAPI, z } from "@semicoder/fia/api";
import { empty, id, method } from "@semicoder/fn-host/contract";
import { profileSchema, profileSourceSchema } from "@semicoder/fn-host/profile-schema";
export const pluginInfo = z.object({
  id,
  packageName: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  client: z.string().optional(),
  entry: z.string().optional(),
  icon: z.string().optional(),
  iconSvg: z.string().optional(),
  origin: z
    .object({
      source: z.string(),
      marketId: z.string().optional(),
      marketURL: z.string().optional(),
    })
    .optional(),
});
export const statusSchema = z.object({
  epoch: id,
  seedId: z.string(),
  generationId: z.string(),
  busy: z.boolean(),
  installing: z.boolean(),
  phase: z.string().nullable(),
  pending: z.boolean(),
  error: z.string().nullable(),
});
export default defineAPI({
  methods: {
    status: method("Read plugin activation state", empty, statusSchema),
    list: method("List installed packages", empty, z.array(pluginInfo)),
    profile: method("Read configured plugin instances", empty, profileSchema),
    configure: method("Validate and stage plugin composition", profileSourceSchema, z.null()),
    install: method(
      "Install a trusted npm archive or Git source",
      z.object({ source: z.string().min(1).max(4096) }),
      z.null(),
    ),
    update: method("Update installed package from its recorded source", z.object({ id }), z.null()),
    remove: method("Remove package and its configured instances", z.object({ id }), z.null()),
    activate: method("Apply prepared composition when idle", empty, z.null()),
    reload: method(
      "Prepare a development seed",
      z.object({ epoch: id, seedId: z.string() }),
      z.object({ accepted: z.boolean(), reason: z.string().optional() }),
    ),
  },
  events: { changed: { description: "Plugin state changed", payload: empty } },
});
