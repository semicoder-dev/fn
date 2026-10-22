import { expect, test } from "bun:test";
import { createRequire } from "node:module";
import * as Cordis from "@deepseek-ai/cordis";
import Loader from "@deepseek-ai/cordis-plugin-loader";
import * as Slots from "@deepseek-ai/dsh-client-ui-slots";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as JSX from "react/jsx-runtime";
import type * as Modules from "@deepseek-ai/dsh-client-modules/client";
import type {
  ClientBundleRegistration,
  ClientModuleLoaderTarget,
} from "@deepseek-ai/dsh-client-modules/client";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";

test("published browser module factories load the original slot renderer and unwind contributions", async () => {
  const require = createRequire(import.meta.url);
  const seed: Record<string, unknown> = {
    react: React,
    "react-dom": ReactDOM,
    "react-dom/client": ReactDOMClient,
    "react/jsx-runtime": JSX,
    "@deepseek-ai/cordis": Cordis,
    "@deepseek-ai/dsh-client-ui-slots": Slots,
  };
  const registrations: ClientBundleRegistration[] = [];
  const target = {
    mode: "queue",
    pendingQueue: registrations,
    load: (entry: ClientBundleRegistration) => {
      registrations.push(entry);
    },
  } as ClientModuleLoaderTarget;
  const modulesId = "@deepseek-ai/dsh-client-modules",
    rendererId = "@deepseek-ai/dsh-client-ui-renderer";
  for (const id of [modulesId, rendererId]) {
    const source = await Bun.file(require.resolve(`${id}/client`)).text();
    new Function("window", source)({ __ModuleLoader__: target });
  }
  const moduleExports = registrations
    .find((entry) => entry.id === modulesId)!
    .factory(
      Object.assign((name: string) => seed[name], { async: async (name: string) => seed[name] }),
    ) as unknown as typeof Modules;
  registrations.splice(
    registrations.findIndex((entry) => entry.id === modulesId),
    1,
  );
  const entries = [modulesId, rendererId].map((id) => ({
    id,
    url: `/modules/${id}?rev=test`,
    rev: "test",
  }));
  const system = moduleExports.createClientModuleSystem(
    target,
    { id: modulesId, exports: moduleExports as unknown as Record<string, unknown> },
    {
      boot: {
        rev: "test",
        entries,
        batches: entries.map((entry) => ({
          phase: "bootstrap",
          url: entry.url,
          rev: "test",
          entries: [entry.id],
        })),
      },
      staticModules: seed,
      loadBundle: async () => {},
    },
  );
  const ctx = new Cordis.Context();
  try {
    await ctx.plugin(Loader);
    ctx.loader.internal = system as unknown as Loader["internal"];
    await ctx.loader.root.update(entries.map((entry) => ({ id: entry.id, name: entry.id })));
    await ctx.loader.await();
    expect(ctx.get("uiRenderer")).toBeDefined();
    const owner = await ctx.plugin({
      name: "fn-test-layout",
      inject: ["slots"],
      apply(scope) {
        scope.slots.register({ name: "root" }, () => React.createElement("main", null, "fn slots"));
      },
    });
    expect(ctx.slots.entries("root")).toHaveLength(1);
    expect(React.isValidElement(ctx.slots.renderSlot("root", {}))).toBe(true);
    await owner.dispose();
    expect(ctx.slots.entries("root")).toHaveLength(0);
  } finally {
    await ctx.fiber.dispose();
  }
});
