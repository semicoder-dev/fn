import { z } from "zod";
import { textValue, widgetSizeSchema } from "./widgets.ts";
export const relativePath = z
  .string()
  .min(1)
  .max(240)
  .refine(
    (v) =>
      !v.startsWith("/") &&
      !v.includes("\\") &&
      !v.includes(":") &&
      !/[\p{Cc}]/u.test(v) &&
      v.split("/").every((x) => x !== ".." && x !== "." && x !== ""),
    "Expected a package-relative path",
  );
export const appId = z.string().regex(/^[a-z][a-z0-9._-]{2,99}$/);
export const widgetDefinitionSchema = z.strictObject({
  id: appId,
  size: widgetSizeSchema,
  initial: relativePath,
});
export type WidgetDefinition = z.infer<typeof widgetDefinitionSchema>;
export const manifestSchema = z
  .strictObject({
    manifestVersion: z.literal(1),
    id: appId,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    hostApi: z.literal(1),
    name: textValue,
    description: textValue.optional(),
    icon: relativePath
      .refine(
        (value) => /\.(svg|png|jpe?g|webp)$/.test(value),
        "Icon must be SVG, PNG, JPEG or WebP",
      )
      .optional(),
    entries: z.strictObject({
      backend: relativePath.optional(),
      page: relativePath.optional(),
    }),
    locales: z.strictObject({
      default: z.enum(["zh-CN", "en"]),
      messages: z.record(z.string(), relativePath),
    }),
    uses: z
      .array(z.enum(["models.responses", "widgets.publish", "chat.receive"]))
      .max(3),
    contributes: z.strictObject({
      widgets: z.array(widgetDefinitionSchema).max(4).default([]),
      chat: z.strictObject({ id: appId, name: textValue }).optional(),
    }),
  })
  .superRefine((v, c) => {
    if (
      v.contributes.chat &&
      (!v.entries.backend || !v.uses.includes("chat.receive"))
    )
      c.addIssue({
        code: "custom",
        message: "Chat requires a backend and chat.receive",
      });
    if (
      new Set(v.contributes.widgets.map((w) => w.id)).size !==
      v.contributes.widgets.length
    )
      c.addIssue({ code: "custom", message: "Duplicate widget id" });
    if (!v.locales.messages[v.locales.default])
      c.addIssue({ code: "custom", message: "Missing default locale" });
  });
export type AppManifest = z.infer<typeof manifestSchema>;
export interface BuiltApplication {
  format: 1;
  manifest: AppManifest;
  backend?: string;
  page?: string;
}
