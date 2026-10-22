import { z } from "@semicoder/fia/api";

export const marketURL = z
  .string()
  .max(2000)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash;
  }, "市场地址须为不含凭证的 HTTPS URL");
export const pluginEntry = z.strictObject({
  icon: z.string().min(1).max(4).optional(),
  iconSvg: z
    .string()
    .max(8192)
    .refine(
      (value) => new TextEncoder().encode(value).byteLength <= 8192 && /<svg(?=[\s/>])/.test(value),
      "Invalid SVG image",
    )
    .optional(),
  packageName: z
    .string()
    .max(214)
    .regex(/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/),
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/),
  url: marketURL,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  peers: z.record(z.string().max(214), z.string().max(64)),
});
export const pluginIndex = z
  .strictObject({
    schemaVersion: z.literal(3),
    name: z.string().min(1).max(100),
    plugins: z.array(pluginEntry).max(1000),
  })
  .refine(
    (value) =>
      new Set(value.plugins.map((plugin) => plugin.packageName)).size === value.plugins.length,
    "包名重复",
  );
export const runtimeMarket = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(100),
  url: marketURL,
  enabled: z.boolean(),
  updatedAt: z.number().nullable(),
  error: z.string().nullable(),
});
export const runtimeCatalogEntry = pluginEntry.extend({
  id: z.string(),
  marketId: z.string(),
  marketName: z.string(),
  installedVersion: z.string().nullable(),
  state: z.enum(["available", "installed", "update", "incompatible", "conflict"]),
});
export const marketDocument = z
  .array(runtimeMarket.extend({ index: pluginIndex.nullable() }))
  .max(20);
export type MarketDocument = z.infer<typeof marketDocument>;
export type CatalogEntry = z.infer<typeof runtimeCatalogEntry>;
