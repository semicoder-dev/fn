import { z } from "@semicoder/fia/api";

export const httpsURL = z
  .string()
  .max(2000)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash;
  }, "请输入不含凭证或片段的 HTTPS 地址");
export const stableVersion = z
  .string()
  .regex(/^(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})\.(0|[1-9]\d{0,8})$/, "请输入稳定语义版本 x.y.z");
export function compareVersions(a: string, b: string) {
  const left = stableVersion.parse(a).split(".").map(Number);
  const right = stableVersion.parse(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i]! - right[i]!;
  return 0;
}
export const marketEntry = z.strictObject({
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]{1,63}$/)
    .refine((id) => !["models", "plugins", "settings"].includes(id)),
  packageName: z
    .string()
    .max(214)
    .regex(/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/),
  name: z.string().trim().min(1).max(100),
  description: z.string().max(1000),
  icon: z.string().min(1).max(16),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  version: stableVersion,
  sdkVersion: z.string().max(20),
  url: httpsURL,
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});
export const marketIndex = z
  .strictObject({
    schemaVersion: z.literal(1),
    name: z.string().trim().min(1).max(100),
    plugins: z.array(marketEntry).max(1000),
  })
  .refine(
    (index) => new Set(index.plugins.map((plugin) => plugin.id)).size === index.plugins.length,
    "市场包含重复插件 ID",
  );
export const marketRecord = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(100),
  url: httpsURL,
  enabled: z.boolean(),
  index: marketIndex.nullable(),
  updatedAt: z.number().nullable(),
  error: z.string().max(1000).nullable(),
});
export const marketInfo = marketRecord
  .omit({ index: true })
  .extend({ refreshing: z.boolean(), count: z.number() });
export const catalogEntry = marketEntry.extend({
  marketId: z.string(),
  marketName: z.string(),
  installedVersion: z.string().nullable(),
  state: z.enum(["available", "installed", "update", "incompatible", "conflict"]),
});
export const catalogQuery = z.strictObject({
  marketId: z.string().optional(),
  query: z.string().max(200).default(""),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(20),
});
export const catalogPage = z.strictObject({
  items: z.array(catalogEntry),
  total: z.number(),
  nextOffset: z.number().nullable(),
});
export const marketBinding = z.object({ marketId: z.string(), marketURL: httpsURL });
export type MarketEntry = z.infer<typeof marketEntry>;
export type MarketBinding = z.infer<typeof marketBinding>;
export type MarketInfo = z.infer<typeof marketInfo>;
export type CatalogEntry = z.infer<typeof catalogEntry>;
export type CatalogPage = z.infer<typeof catalogPage>;
export const defaultMarkets = () => [
  {
    id: "official",
    name: "官方插件市场",
    url: "https://raw.githubusercontent.com/potato47/malatang-plugins/main/marketplace.json",
    enabled: true,
    index: null,
    updatedAt: null,
    error: null,
  },
];
