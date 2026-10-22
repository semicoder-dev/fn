import { createAPIRegistry } from "@semicoder/fia/api";
import type { Context, Plugin } from "@deepseek-ai/cordis";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openHost, type HostEnvironment, type Profile } from "../src/index.ts";
import source from "../../../profiles/default.json";
import { resolveProfile } from "../src/profile.ts";
const defaults = await resolveProfile(source, resolve(import.meta.dir, "../../../profiles"));
const callbacks = new Map<string, Plugin>();
(globalThis as any).__fnFixturePlugins = callbacks;
export async function fixtureHost(dataDirectory: string) {
  const api = createAPIRegistry();
  const environment = {
    dataDirectory,
    codeDirectory: resolve(import.meta.dir, "../../.."),
    epoch: crypto.randomUUID(),
    api,
    platform: {
      emit() {},
      app: { mode: "development", identifier: "test.fn" },
      native: {
        application: { async setAppearance() {} },
        on() {
          return () => {};
        },
      },
    },
  } as unknown as HostEnvironment;
  return openHost(environment, {
    ...defaults,
    plugins: defaults.plugins.filter(
      (entry) => !["plugin-manager", "plugin-market"].includes(entry.id),
    ),
  } as Profile);
}
export async function fixturePlugin(ctx: Context, id: string, plugin: Plugin) {
  const key = crypto.randomUUID();
  callbacks.set(key, plugin);
  const directory = join(ctx.host.dataDirectory, "fixtures");
  await mkdir(directory, { recursive: true });
  const file = join(directory, `${key}.ts`);
  await writeFile(
    file,
    `export default globalThis.__fnFixturePlugins.get(${JSON.stringify(key)});`,
  );
  await ctx.loader.root.update([...ctx.loader.root.data, { id, name: pathToFileURL(file).href }]);
  await ctx.loader.await();
  const entry = ctx.loader.resolve(id);
  if (entry.fiber?.state !== 2) throw new Error(`Fixture did not activate: ${id}`);
  return async () => {
    ctx.loader.remove(id);
    await ctx.loader.await();
    callbacks.delete(key);
  };
}
