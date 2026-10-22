import { applyEntryPatches } from "@deepseek-ai/cordis-plugin-include";
import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { Profile } from "./index.ts";
import { profileSchema, profileSourceSchema, type ProfileSource } from "./profile-schema.ts";
export {
  profileSchema,
  profileSourceSchema,
  profileEntries,
  children,
  type ProfileSource,
} from "./profile-schema.ts";
/** All patch evaluation is the pinned upstream Include implementation. */
export function composeProfile(base: Profile, patches: ProfileSource["patches"] = {}): Profile {
  const warn = (message: string, ...values: unknown[]) => {
    throw new Error(message.replace(/%C/g, () => String(values.shift())));
  };
  return profileSchema.parse({
    plugins: applyEntryPatches(base.plugins, patches.plugins ?? [], warn),
    client: applyEntryPatches(base.client, patches.client ?? [], warn),
  });
}
/** Bundle order → profile entries → profile patches, resolved before publishing an immutable generation. */
export async function resolveProfile(
  source: ProfileSource,
  directory: string,
  stack: string[] = [],
): Promise<Profile> {
  source = profileSourceSchema.parse(source);
  if (stack.length > 20) throw new Error("Profile bundle nesting limit exceeded");
  let result: Profile = { plugins: [], client: [] };
  for (const reference of source.bundles ?? []) {
    let filename: string;
    if (reference.startsWith("./")) filename = await realpath(resolve(directory, reference));
    else {
      if (!/^(@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(reference))
        throw new Error("Bundle must be a relative JSON file or an installed npm package");
      // Package metadata resolution does not execute package code or depend on a package.json export.
      let base = resolve(directory),
        found = "";
      while (true) {
        const candidate = join(base, "node_modules", reference, "package.json");
        if (await Bun.file(candidate).exists()) {
          found = candidate;
          break;
        }
        const parent = dirname(base);
        if (parent === base) break;
        base = parent;
      }
      if (!found) throw new Error(`Bundle is not installed: ${reference}`);
      const manifest = JSON.parse(await readFile(found, "utf8"));
      const bundle = manifest.fn?.bundle ?? manifest.fn?.profile;
      if (typeof bundle !== "string" || !bundle.startsWith("./"))
        throw new Error(`Package has no fn.bundle or fn.profile: ${reference}`);
      filename = await realpath(resolve(dirname(found), bundle));
      const path = relative(await realpath(dirname(found)), filename);
      if (isAbsolute(path) || path === ".." || path.startsWith("../"))
        throw new Error("Bundle escapes its package");
    }
    if (!filename.endsWith(".json")) throw new Error("Profile bundles must use JSON");
    if (stack.includes(filename)) throw new Error(`Profile bundle cycle: ${filename}`);
    const next = await resolveProfile(
      JSON.parse(await readFile(filename, "utf8")),
      dirname(filename),
      [...stack, filename],
    );
    result = composeProfile(result, {
      plugins: [{ insert: next.plugins }],
      client: [{ insert: next.client }],
    });
  }
  result = composeProfile(result, {
    plugins: [{ insert: source.plugins ?? [] }],
    client: [{ insert: source.client ?? [] }],
  });
  return composeProfile(result, source.patches);
}
