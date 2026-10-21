import { z } from "@semicoder/fia/api";
import { appearanceSchema } from "./theme";

export const marketURL = z.string().max(2000).url().refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.hash;
}, "市场地址须为不含凭证的 HTTPS URL");
export const catalogModel = z.object({ id: z.string().min(1).max(256), name: z.string().max(256) });
export const savedModel = catalogModel.extend({ connectionId: z.string().min(1).max(100) });
export const applicationEntry = z.strictObject({
  icon: z.string().min(1).max(4).optional(),
  iconSvg: z.string().max(8192).refine(value => new TextEncoder().encode(value).byteLength <= 8192 && /<svg(?=[\s/>])/.test(value), "Invalid SVG image").optional(),
  id: z.string().regex(/^[a-z][a-z0-9-]{0,99}$/),
  packageName: z.string().max(214).regex(/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/),
  name: z.string().min(1).max(100), description: z.string().max(1000),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/),
  url: marketURL, sha256: z.string().regex(/^[a-f0-9]{64}$/),
  core: z.record(z.string().max(214), z.string().max(64)),
});
export const applicationIndex = z.strictObject({
  schemaVersion: z.literal(2), name: z.string().min(1).max(100), applications: z.array(applicationEntry).max(1000),
}).refine(value => new Set(value.applications.map(app => app.id)).size === value.applications.length, "应用 ID 重复");
export const runtimeMarket = z.object({
  id: z.string(), name: z.string().trim().min(1).max(100), url: marketURL, enabled: z.boolean(),
  updatedAt: z.number().nullable(), error: z.string().nullable(),
});
export const runtimeCatalogEntry = applicationEntry.extend({
  marketId: z.string(), marketName: z.string(), installedVersion: z.string().nullable(),
  state: z.enum(["available", "installed", "update", "incompatible", "conflict"]),
});
export const productDocument = z.object({
  version: z.literal(1), appearance: appearanceSchema,
  models: z.array(savedModel).max(1000),
  markets: z.array(runtimeMarket.extend({ index: applicationIndex.nullable() })).max(20),
});
export type ProductDocument = z.infer<typeof productDocument>;
export type CatalogEntry = z.infer<typeof runtimeCatalogEntry>;
export type MarketEntry = z.infer<typeof applicationEntry>;
