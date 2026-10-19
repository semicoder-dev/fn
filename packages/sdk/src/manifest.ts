import { z } from "zod";

export const MAX_ICON_SVG_BYTES = 8 * 1024;
/** Image data only. Consumers must never insert this markup into the host DOM. */
export const iconSvgSchema = z
  .string()
  .min(1)
  .max(MAX_ICON_SVG_BYTES)
  .refine(
    (value) => new TextEncoder().encode(value).byteLength <= MAX_ICON_SVG_BYTES,
    "SVG 图标不能超过 8 KiB",
  )
  .refine(
    (value) =>
      /^(?:\s|\uFEFF)*(?:<\?xml\s[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg(?=[\s/>])[^>]*(?:\/>|>[\s\S]*<\/svg>)\s*$/.test(
        value,
      ),
    "图标必须是 SVG 图片",
  );

export const manifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z
    .string()
    .regex(/^[a-z][a-z0-9-]{1,63}$/)
    .refine((value) => !["models", "plugins", "settings", "chat"].includes(value), "宿主保留名称"),
  name: z.string().trim().min(1).max(60),
  description: z.string().max(240),
  icon: z.string().min(1).max(4),
  iconSvg: z.literal("dist/icon.svg").optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sdkVersion: z.literal("0.3"),
  frontend: z.literal("dist/client.js"),
  backend: z.literal("dist/backend.js").optional(),
  styles: z.literal("dist/client.css"),
  keepAlive: z.boolean().default(false),
});
