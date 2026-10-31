import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import * as Cordis from "@deepseek-ai/cordis";
import Loader from "@deepseek-ai/cordis-plugin-loader";
import * as Store from "@deepseek-ai/dsh-client-store";
import type * as Modules from "@deepseek-ai/dsh-client-modules/client";
import { nextModules } from "../../../frontend/live-modules.ts";
import { reconcileEntries } from "../src/live-profile.ts";

// Execute the actual pinned browser module factory, not a mock of its caching behavior.
test("client updates preserve root/fibers and cached core exports across install, update and removal", async () => {
  const require = createRequire(import.meta.url);
  const registrations: Modules.ClientBundleRegistration[] = [];
  new Function(
    "window",
    await Bun.file(require.resolve("@deepseek-ai/dsh-client-modules/client")).text(),
  )({
    __ModuleLoader__: {
      load: (entry: Modules.ClientBundleRegistration) => registrations.push(entry),
    },
  });
  const shared: Record<string, unknown> = {
    "@deepseek-ai/cordis": Cordis,
    "@deepseek-ai/dsh-client-store": Store,
  };
  const exports = registrations[0]!.factory(
    Object.assign((id: string) => shared[id], { async: async (id: string) => shared[id] }),
  ) as unknown as typeof Modules;
  const root = new Cordis.Context();
  const stable = { id: "stable", name: "stable" };
  let modules: Modules.ClientModuleSystem | undefined;
  let applied = 0,
    removed = 0,
    stableFactories = 0;
  const graph = (version: number, include: boolean): Modules.WebBootGraph => {
    const entries = [
      "@deepseek-ai/dsh-client-modules",
      "stable",
      ...(include ? ["extra"] : []),
    ].map((id) => ({
      id,
      rev: id === "extra" ? String(version) : "stable",
      url: `/gen-${version}/${id}?rev=${id === "extra" ? version : "stable"}`,
    }));
    return {
      rev: String(version),
      entries,
      batches: entries.map((row) => ({
        phase: row.id === "@deepseek-ai/dsh-client-modules" ? "bootstrap" : "application",
        url: row.url,
        rev: row.rev,
        entries: [row.id],
      })),
    };
  };
  async function system(version: number, include: boolean) {
    const target = {
      mode: "queue",
      pendingQueue: [],
      load() {},
    } as unknown as Modules.ClientModuleLoaderTarget;
    return nextModules(
      exports,
      target,
      graph(version, include),
      shared,
      async (url) => {
        const id = url.includes("/extra?") ? "extra" : "stable";
        target.load({
          id,
          factory: () => {
            if (id === "stable") stableFactories++;
            return {
              apply(ctx: Cordis.Context) {
                if (id === "stable") ctx.provide("stable", { draft: "unchanged" });
                else {
                  ctx.provide("version", version);
                  ctx.effect(() => {
                    applied++;
                    return () => {
                      removed++;
                    };
                  });
                }
              },
            };
          },
        });
      },
      modules,
    );
  }
  try {
    await root.plugin(Loader);
    modules = await system(0, false);
    root.loader.internal = modules as unknown as Loader["internal"];
    await root.loader.root.update([stable]);
    await root.loader.await();
    const fiber = root.loader.resolve("stable").fiber,
      service = root.get("stable");
    const installed = [stable, { id: "extra", name: "extra" }];
    modules = await system(1, true);
    root.loader.internal = modules as unknown as Loader["internal"];
    await reconcileEntries(root.loader, [stable], installed, new Set(["extra"]));
    expect(root.get("version")).toBe(1);
    modules = await system(2, true);
    root.loader.internal = modules as unknown as Loader["internal"];
    await reconcileEntries(root.loader, installed, installed, new Set(["extra"]));
    expect(root.get("version")).toBe(2);
    expect(applied).toBe(2);
    expect(removed).toBe(1);
    expect(root.loader.resolve("stable").fiber).toBe(fiber);
    expect(root.get("stable")).toBe(service);
    expect(stableFactories).toBe(1);
    modules = await system(3, false);
    root.loader.internal = modules as unknown as Loader["internal"];
    await reconcileEntries(root.loader, installed, [stable], new Set(["extra"]));
    expect(root.get("version")).toBeUndefined();
    expect(removed).toBe(2);
  } finally {
    await root.fiber.dispose();
  }
});
