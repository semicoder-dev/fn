import { z } from "@semicoder/fia/api";
import { jsonBytes, MAX_LIST_PAGE_BYTES } from "./pagination.ts";
export const id = z.string().min(1).max(160);
export const empty = z.strictObject({});
export const pagination = {
  offset: z.number().int().nonnegative().default(0),
  limit: z.number().int().min(1).max(100).default(50),
};
export const page = <T extends z.ZodType>(item: T) =>
  z
    .object({
      items: z.array(item).max(100),
      nextOffset: z.number().int().nonnegative(),
      hasMore: z.boolean(),
    })
    .refine((value) => jsonBytes(value) <= MAX_LIST_PAGE_BYTES, "List exceeds 512 KiB");
export const method = <I extends z.ZodType, O extends z.ZodType>(
  description: string,
  input: I,
  output: O,
) => ({ description, input, output });
