import { z } from "zod";
export const textValue = z.union([
  z.string().max(4000),
  z.strictObject({
    key: z.string().max(160),
    args: z
      .record(z.string(), z.union([z.string().max(500), z.number()]))
      .optional(),
  }),
]);
export type TextValue = z.infer<typeof textValue>;
