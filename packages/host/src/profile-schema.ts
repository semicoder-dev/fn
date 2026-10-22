import { z } from "@semicoder/fia/api";
import type { PatchOptions } from "@deepseek-ai/cordis-plugin-include";
import type { EntryOptions } from "@deepseek-ai/cordis-plugin-loader";
import type { Profile } from "./index.ts";
const entry: z.ZodType<EntryOptions> = z
  .object({
    id: z.string().regex(/^[A-Za-z0-9_.-]{1,100}$/),
    name: z.string().min(1).max(256),
    config: z.json().optional(),
    disabled: z.boolean().optional(),
    group: z.boolean().optional(),
    inject: z
      .union([
        z.array(z.string()),
        z.record(
          z.string(),
          z.union([z.boolean(), z.object({ required: z.boolean().optional() }).passthrough()]),
        ),
      ])
      .optional(),
  })
  .passthrough() as z.ZodType<EntryOptions>;
export function children(row: EntryOptions): EntryOptions[] {
  if (row.group && Array.isArray(row.config)) return row.config;
  // A target is a scope created by a plugin; its children are still ordinary Loader entries.
  if (
    row.config &&
    typeof row.config === "object" &&
    !Array.isArray(row.config) &&
    Array.isArray(row.config.plugins)
  )
    return row.config.plugins;
  return [];
}
export function* profileEntries(rows: EntryOptions[]): Generator<EntryOptions> {
  for (const row of rows) {
    yield row;
    yield* profileEntries(children(row));
  }
}
export const profileSchema: z.ZodType<Profile> = z
  .object({ plugins: z.array(entry).max(500), client: z.array(entry).max(500) })
  .superRefine((profile, context) => {
    let count = 0;
    const validate = (rows: EntryOptions[], depth = 0, ids = new Set<string>()) => {
      if (depth > 20 || (count += rows.length) > 1000) {
        context.addIssue({ code: "custom", message: "Profile is too deeply nested or too large" });
        return;
      }
      for (const row of rows) {
        if (ids.has(row.id!))
          context.addIssue({
            code: "custom",
            message: "Duplicate plugin instance ID in one Loader tree",
          });
        ids.add(row.id!);
      }
      for (const row of rows) {
        const nested = children(row);
        for (const child of nested) {
          const result = entry.safeParse(child);
          if (!result.success)
            context.addIssue({ code: "custom", message: "Invalid nested plugin entry" });
        }
        validate(nested, depth + 1, row.group ? ids : new Set());
      }
    };
    validate(profile.plugins);
    validate(profile.client);
  });
export interface ProfileSource {
  bundles?: string[];
  plugins?: EntryOptions[];
  client?: EntryOptions[];
  patches?: { plugins?: PatchOptions[]; client?: PatchOptions[] };
}
export const profileSourceSchema: z.ZodType<ProfileSource> = z
  .object({
    bundles: z.array(z.string().min(1).max(256)).max(100).optional(),
    plugins: z.array(entry).max(500).optional(),
    client: z.array(entry).max(500).optional(),
    patches: z
      .object({
        plugins: z.array(z.json()).max(1000).optional(),
        client: z.array(z.json()).max(1000).optional(),
      })
      .optional(),
  })
  .strict() as z.ZodType<ProfileSource>;
