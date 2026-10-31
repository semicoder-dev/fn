import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { materializeRuntimeSeed, type SeedManifest } from "../packages/host/src/generations.ts";
import { resolveProfile } from "../packages/host/src/profile.ts";
import source from "../profiles/default.json";
import { experimentalChatPackages } from "./runtime-profile.ts";

// Reuse the signed seed bytes for the matching code update; never re-sign them here.
const temporary = await mkdtemp(join(tmpdir(), "fn-default-seed-"));
try {
  const directory = await materializeRuntimeSeed({
    archive: fileURLToPath(new URL("../resources/runtime-seed.tgz", import.meta.url)),
    metadata: fileURLToPath(new URL("../resources/runtime-seed.json", import.meta.url)),
    dataDirectory: temporary,
  });
  const seed = JSON.parse(await readFile(join(directory, "seed.json"), "utf8")) as SeedManifest;
  for (const name of [...Object.keys(seed.coreVersions), ...seed.packages.map((pkg) => pkg.name)])
    if (experimentalChatPackages.has(name))
      throw new Error(`Experimental Chat cannot be released: ${name}`);
  const defaults = await resolveProfile(
    source,
    fileURLToPath(new URL("../profiles", import.meta.url)),
  );
  if (JSON.stringify(seed.profile) !== JSON.stringify(defaults))
    throw new Error("Release requires the current default profile; rebuild the default seed");
  console.log(`Default distribution boundary verified: ${seed.id}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
