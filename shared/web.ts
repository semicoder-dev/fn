import { z } from "@semicoder/fia/api";
const engine = z.enum(["baidu", "wechat", "toutiao", "duckduckgo"]);
const format = z.enum(["markdown", "text", "html"]);
const timeoutMs = z.number().int().positive().max(120_000).optional();
export const webSearchInput = z.strictObject({
  query: z.string().trim().min(1).max(4000),
  engines: z
    .array(engine)
    .min(1)
    .max(4)
    .refine((values) => new Set(values).size === values.length, "引擎不能重复")
    .optional(),
  limit: z.number().int().positive().max(30).optional(),
  timeRange: z.enum(["day", "week", "month", "year"]).optional(),
  site: z.string().trim().min(1).max(253).optional(),
  timeoutMs,
});
export const webFetchInput = z.strictObject({
  url: z
    .url()
    .max(2000)
    .refine((value) => {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
    }, "仅支持不含凭证的 HTTP(S) URL"),
  format: format.optional(),
  maxBytes: z.number().int().positive().max(1_000_000).optional(),
  timeoutMs,
});
const source = z.strictObject({
  id: z.number().int().positive(),
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  score: z.number(),
  engines: z.array(engine),
  meta: z.record(z.string(), z.string()),
  fetched: z.boolean(),
});
export const webSearchResult = z.strictObject({
  text: z.string(),
  results: z.array(source),
  engines: z.array(
    z.strictObject({
      engine,
      status: z.enum(["success", "no_results", "invalid_results", "error"]),
      ok: z.boolean(),
      count: z.number().int().nonnegative(),
      rawCount: z.number().int().nonnegative(),
      error: z.string().optional(),
    }),
  ),
});
export const webFetchResult = z.strictObject({
  url: z.string(),
  finalUrl: z.string(),
  status: z.number().int(),
  contentType: z.string(),
  title: z.string(),
  format,
  text: z.string(),
  truncated: z.boolean(),
  redirect: z
    .strictObject({ from: z.string(), to: z.string(), status: z.number().int() })
    .optional(),
});
export const webTask = z.strictObject({
  id: z.string(),
  pluginId: z.string(),
  kind: z.enum(["search", "fetch"]),
  status: z.enum(["running", "completed", "failed", "cancelled"]),
  result: z.union([webSearchResult, webFetchResult]).nullable(),
  error: z.strictObject({ code: z.string(), message: z.string() }).nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export const webChange = webTask.pick({ pluginId: true, id: true, kind: true, status: true });
