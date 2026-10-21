import { sessionCardSchema, cardValuesSchema } from "../packages/runtime/src/card-contract.ts";
import { appearanceSchema, appearanceUpdate } from "./theme";
import { runtimeMarket, runtimeCatalogEntry, savedModel, catalogModel, marketURL } from "./runtime-product";
import { defineAPI, z } from "@semicoder/fia/api";
import { jsonBytes, MAX_KV_VALUE_BYTES, MAX_LIST_PAGE_BYTES } from "../packages/runtime/src/limits";

const id = z.string().min(1).max(100);
const empty = z.strictObject({});
const selection = { connectionId: id, modelId: z.string().min(1).max(256) };
const policy = z.enum(["controlled", "automatic"]);
const pagination = {
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().min(1).max(100).default(50),
};
const page = <T extends z.ZodType>(item: T) => z.object({
  items: z.array(item).max(100), nextOffset: z.number().int().nonnegative(), hasMore: z.boolean(),
}).refine(value => jsonBytes(value) <= MAX_LIST_PAGE_BYTES, "List response exceeds the 512 KiB JSON page budget");
const kvValue = z.json().refine(value => jsonBytes(value) <= MAX_KV_VALUE_BYTES,
  "KV value exceeds 256 KiB of UTF-8 JSON; use application-managed files for larger content");
export const runtimeSession = z.object({
  id, appId: id, ...selection, title: z.string(), createdAt: z.number(), updatedAt: z.number(),
  archived: z.boolean(), policy, cwd: z.string().optional(), endpointId: id.optional(),
  status: z.enum(["idle", "running", "unloaded"]),
});
export const runtimeApplication = z.object({
  icon: z.string().max(4).optional(), iconSvg: z.string().max(8192).optional(),
  id, name: z.string(), description: z.string().optional(), version: z.string(),
  packageName: z.string(), client: z.string().optional(), clientURL: z.string().optional(),
  origin: z.object({ source: z.string(), marketId: z.string().optional(), marketURL: z.string().optional() }).optional(),
  enabled: z.boolean(), status: z.enum(["active", "disabled", "error"]),
  error: z.string().optional(), methods: z.array(z.string()),
  chats: z.array(z.object({ id, name: z.string(), systemPrompt: z.string().optional() })),
});
export const runtimeConnection = z.object({
  id, name: z.string(), provider: z.string(), auth: z.enum(["api-key", "oauth"]),
  profile: z.record(z.string(), z.json()), configured: z.boolean(), error: z.string().optional(),
});
const approval = z.object({ id, sessionId: id, toolName: z.string(), reason: z.string().optional() });
const login = z.object({
  id, connectionId: id, status: z.enum(["running", "completed", "failed", "cancelled"]),
  events: z.array(z.json()), prompt: z.json().nullable(), error: z.string().nullable(),
});
const generation = z.object({
  id: z.string(), pending: z.boolean(), installing: z.boolean(), error: z.string().nullable(),
});
const method = <I extends z.ZodType, O extends z.ZodType>(description: string, input: I, output: O) =>
  ({ description, input, output });

export default defineAPI({
  methods: {
    "cards.list": method("Read durable application interaction cards", z.object({ sessionId: id, ...pagination }), page(sessionCardSchema as unknown as z.ZodType<import("../packages/runtime/src/card-contract.ts").SessionCard>)),
    "cards.respond": method("Claim a one-shot card response before invoking its application", z.object({ sessionId: id, cardId: id, actionId: id, values: cardValuesSchema }), z.null()),
    "appearance.get": method("Read appearance preferences", empty, appearanceSchema),
    "appearance.set": method("Persist colors and native appearance", appearanceUpdate, appearanceSchema),
    "models.saved": method("Read selected models", z.object(pagination), page(savedModel)),
    "models.select": method("Add or remove a model from the workspace picker", z.object({ ...selection, selected: z.boolean() }), z.null()),
    "market.list": method("List Cordis application market sources", empty, z.array(runtimeMarket.extend({ count: z.number(), refreshing: z.boolean() }))),
    "market.add": method("Add a market source", z.object({ name: z.string().trim().min(1).max(100), url: marketURL }), z.null()),
    "market.change": method("Rename or enable a source", z.object({ id, name: z.string().trim().min(1).max(100).optional(), enabled: z.boolean().optional() }), z.null()),
    "market.remove": method("Remove a market source", z.object({ id }), z.null()),
    "market.refresh": method("Refresh catalogs without installing code", z.object({ id: id.optional() }), z.null()),
    "market.catalog": method("Search application catalogs", z.object({ query: z.string().max(200).default(""), ...pagination }), page(runtimeCatalogEntry)),
    "market.install": method("Verify a market archive and stage installation", z.object({ marketId: id, appId: id }), generation),
    "apps.update": method("Check the original source and stage an application update", z.object({ appId: id }), generation),
    "runtime.status": method("Read the running kernel and update state", empty,
      z.object({ epoch: z.string(), seedId: z.string(), busy: z.boolean(), generation, dataDirectory: z.string() })),
    "runtime.reloadSeed": method("Restart an idle development backend after a verified seed rebuild",
      z.object({ epoch: z.string(), seedId: z.string() }),
      z.object({ accepted: z.boolean(), reason: z.string().optional() })),
    "runtime.applyUpdate": method("Apply a staged runtime when idle", empty, generation),
    "apps.list": method("List installed Cordis applications", empty, z.array(runtimeApplication)),
    "apps.install": method("Stage a trusted npm application archive", z.object({ source: z.string().min(1).max(4096) }), generation),
    "apps.remove": method("Stage application removal", z.object({ appId: id }), generation),
    "apps.enable": method("Enable or drain and disable an application", z.object({ appId: id, enabled: z.boolean() }), z.null()),
    "apps.invoke": method("Invoke an application method", z.object({ appId: id, name: z.string(), args: z.json() }), z.json()),
    "apps.kv.get": method("Read application KV (up to 256 KiB UTF-8 JSON)", z.object({ appId: id, key: z.string().min(1).max(256) }), kvValue),
    "apps.kv.set": method("Write application KV (up to 256 KiB UTF-8 JSON)", z.object({ appId: id, key: z.string().min(1).max(256), value: kvValue }), z.null()),
    "apps.kv.delete": method("Delete application KV", z.object({ appId: id, key: z.string().max(256) }), z.null()),
    "apps.kv.list": method("Read a bounded page of application KV", z.object({ appId: id, ...pagination }),
      page(z.object({ key: z.string(), value: kvValue }))),
    "connections.providers": method("List Pi authentication methods", empty,
      z.array(z.object({ id: z.string(), name: z.string(), modelCount: z.number(), dynamic: z.boolean(), methods: z.array(z.object({ id: z.string(), label: z.string(), subscription: z.boolean() })) }))),
    "connections.presets": method("Read Pi preset models without credentials", z.object({ provider: z.string(), ...pagination }), page(catalogModel)),
    "connections.refresh": method("Refresh the selected account catalog", z.object({ id }), z.null()),
    "connections.list": method("Read a bounded page of model connections", z.object(pagination), page(runtimeConnection)),
    "connections.create": method("Create a connection with its own credentials", z.object({
      name: z.string().trim().min(1).max(100), provider: z.string().min(1).max(100),
      auth: z.enum(["api-key", "oauth"]), profile: z.record(z.string(), z.json()).optional(),
    }), runtimeConnection),
    "connections.rename": method("Rename a model connection", z.object({ id, name: z.string().trim().min(1).max(100) }), runtimeConnection),
    "connections.remove": method("Remove an unused connection", z.object({ id }), z.null()),
    "connections.setKey": method("Set explicit API key for a new connection", z.object({ id, key: z.string().min(1).max(16384) }), z.null()),
    "connections.models": method("Read a bounded page of upstream models", z.object({ id, ...pagination }),
      page(z.object({ id: z.string(), name: z.string() }))),
    "auth.start": method("Start a managed Pi login", z.object({ connectionId: id }), login),
    "auth.list": method("Read active authentication interactions", empty, z.array(login)),
    "auth.reply": method("Answer a pending login prompt", z.object({ id, promptId: id, value: z.string().max(16384) }), z.null()),
    "auth.cancel": method("Cancel a login and its callback listener", z.object({ id }), z.null()),
    "auth.logout": method("Remove connection credentials", z.object({ connectionId: id }), z.null()),
    "sessions.list": method("Read a bounded page of application sessions", z.object({ appId: id.optional(), ...pagination }), page(runtimeSession)),
    "sessions.create": method("Create a session bound to one connection", z.object({
      appId: id, ...selection, title: z.string().max(200).optional(),
      cwd: z.string().max(4096).optional(), endpointId: id.optional(), policy: policy.optional(),
    }), runtimeSession),
    "sessions.send": method("Durably enqueue input; requestId makes retries idempotent", z.object({
      id, text: z.string().min(1).max(262144), requestId: id,
    }), runtimeSession),
    "sessions.cancel": method("Cancel the current agent turn", z.object({ id }), z.null()),
    "sessions.model": method("Select another model on the same connection", z.object({ id, modelId: z.string().min(1).max(256) }), runtimeSession),
    "sessions.archive": method("Archive or restore a session", z.object({ id, archived: z.boolean() }), runtimeSession),
    "sessions.projection": method("Read a durable, bounded display projection", z.object({
      id, offset: z.number().int().nonnegative().default(0), limit: z.number().int().min(1).max(100).default(50),
    }), z.json()),
    "approvals.list": method("Read pending tool approval requests", empty, z.array(approval)),
    "approvals.reply": method("Approve once or reject an explicit tool request", z.object({ id, allow: z.boolean() }), z.null()),
    "chat.status": method("Read CloudKit synchronization state", empty, z.json()),
    "chat.connect": method("Connect Chat to this iCloud account", empty, z.null()),
    "chat.sync": method("Synchronize Chat commands and session projections", empty, z.null()),
  },
  events: {
    "appearance.changed": { description: "Appearance changed in another window", payload: appearanceSchema },
    "runtime.changed": {
      description: "Ephemeral invalidation; clients reread durable state after reconnect",
      payload: z.object({ epoch: z.string(), kind: z.string(), sessionId: z.string().optional(), appId: z.string().optional(), data: z.json().optional() }),
    },
  },
});
