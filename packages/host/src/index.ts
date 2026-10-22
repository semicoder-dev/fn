import { Context } from "@deepseek-ai/cordis";
import Loader, { EntryTree, Group, type EntryOptions } from "@deepseek-ai/cordis-plugin-loader";
export { composeProfile, resolveProfile } from "./profile.ts";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { APIRegistry } from "@semicoder/fia/api";
import type { BackendContext } from "@semicoder/fia/backend";

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export interface HostEnvironment {
  readonly dataDirectory: string;
  readonly codeDirectory: string;
  readonly epoch: string;
  readonly api: APIRegistry;
  readonly platform: BackendContext;
  readonly installation?: {
    manager: import("./generations.ts").GenerationManager;
    active: import("./generations.ts").Generation;
    bundledSeedId: string;
    seed(expectedId?: string): Promise<string>;
  };
}
declare module "@deepseek-ai/cordis" {
  interface Events {
    "host/ready"(): void | Promise<void>;
  }
  interface Context {
    host: HostEnvironment;
  }
}

export interface Profile {
  plugins: EntryOptions[];
  client: EntryOptions[];
}

/** Product-agnostic Bun bootstrap. All authoritative state belongs to loaded services. */
export async function openHost(environment: HostEnvironment, profile: Profile) {
  await mkdir(environment.dataDirectory, { recursive: true, mode: 0o700 });
  const ctx = new Context();
  ctx.provide("host", Object.freeze(environment));
  try {
    await ctx.plugin(BunLoader, { baseUrl: pathToFileURL(environment.codeDirectory + "/").href });
    ctx.loader.builtins.group = Group;
    await ctx.loader.root.update(structuredClone(profile.plugins));
    await ctx.loader.await();
    const failures = [...ctx.loader.entries()].filter(
      (entry) => !entry.disabled && (!entry.fiber || entry.fiber.state === 3),
    );
    if (failures.length)
      throw new Error(
        `Plugin composition did not activate: ${failures.map((entry) => entry.id).join(", ")}`,
      );
    return { ctx, profile, close: () => ctx.fiber.dispose() };
  } catch (error) {
    await ctx.fiber.dispose().catch(() => {});
    throw error;
  }
}

/** Resolve from the selected generation, including nested groups and bundles. */
class BunLoader extends Loader {
  override import(name: string, getOuterStack?: () => string[]) {
    if (name.startsWith("cordis:") || name.startsWith("file:"))
      return super.import(name, getOuterStack);
    const require = createRequire(new URL("package.json", this.ctx.baseUrl));
    return super.import(pathToFileURL(require.resolve(name)).href, getOuterStack);
  }
}
/** Upstream nested tree, with Bun resolution inherited from the root loader. */
export class PluginGroup extends EntryTree {
  override import(name: string, stack?: () => string[]) {
    return this.ctx.loader.import(name, stack);
  }
  write() {}
  async mount(entries: EntryOptions[]) {
    this.ctx.effect(() => () => this.root.stop());
    await this.root.update(structuredClone(entries));
  }
}
