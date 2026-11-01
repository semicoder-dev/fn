import { z } from "zod";
import { textValue } from "./text.ts";
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
export const summaryDefinitionSchema = z.strictObject({
  initial: relativePath.optional(),
});
export const manifestSchema = z
  .strictObject({
    manifestVersion: z.literal(1),
    id: appId,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    hostApi: z.literal(2),
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
      .array(
        z.enum(["models.responses", "application.summary", "chat.receive"]),
      )
      .max(3),
    contributes: z.strictObject({
      summary: summaryDefinitionSchema.optional(),
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
      v.uses.includes("application.summary") &&
      (!v.entries.backend || !v.contributes.summary)
    )
      c.addIssue({
        code: "custom",
        message: "Dynamic summary requires a backend and contributes.summary",
      });
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
