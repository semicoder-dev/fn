import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildPlugin } from "../packages/sdk/build.ts";
export async function buildPlugins() {
  for (const entry of (
    await readdir(resolve(import.meta.dir, "../plugins"), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const directory = resolve(import.meta.dir, "../plugins", entry.name);
    const manifest = await Bun.file(join(directory, "package.json")).json();
    if (!manifest.exports?.["./client"]) continue;
    await buildPlugin(directory);
  }
}
if (import.meta.main) await buildPlugins();
