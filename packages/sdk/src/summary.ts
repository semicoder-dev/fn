import { z } from "zod";
import { textValue } from "./text.ts";
const tone = z.enum(["neutral", "success", "warning", "danger"]);
export const applicationSummarySchema = z.strictObject({
  version: z.literal(1),
  text: textValue.optional(),
  detail: textValue.optional(),
  metrics: z
    .array(
      z.strictObject({
        value: z.union([z.string().max(100), z.number().finite()]),
        label: textValue.optional(),
      }),
    )
    .max(3)
    .optional(),
  badges: z
    .array(z.strictObject({ text: textValue, tone: tone.optional() }))
    .max(2)
    .optional(),
  progress: z
    .strictObject({
      value: z.number().min(0).max(1),
      label: textValue.optional(),
    })
    .optional(),
  sparkline: z
    .strictObject({
      values: z.array(z.number().finite()).min(2).max(120),
      label: textValue.optional(),
      tone: tone.optional(),
    })
    .optional(),
});
export type ApplicationSummary = z.infer<typeof applicationSummarySchema>;
export interface SummaryState {
  snapshot: ApplicationSummary;
  updatedAt?: number;
}
export function parseSummary(input: unknown): ApplicationSummary {
  const serialized = JSON.stringify(input);
  if (!serialized || new TextEncoder().encode(serialized).byteLength > 16384)
    throw new Error("Summary size limit");
  return applicationSummarySchema.parse(input);
}
