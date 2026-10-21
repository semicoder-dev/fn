import { afterEach, expect, test } from "bun:test";
import { Context } from "@deepseek-ai/cordis";
import * as React from "react";
import { validateResponse } from "../src/card-contract.ts";
import { Button } from "../src/ui.tsx";
import { mkdir, mkdtemp, rm, symlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildCordisApplication, checkCordisApplication } from "../build-cordis.ts";
import { generatedHeader } from "../generate-cordis-types.ts";
import { createBrowserHost, readAllPages, type ClientApplication } from "../src/cordis-client.tsx";

const cleanups: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

test("published SDK type snapshot matches the backend contract without private imports", async () => {
  const source = await Bun.file(new URL("../../runtime/src/types.ts", import.meta.url)).text();
  const published = await Bun.file(new URL("../src/cordis-types.ts", import.meta.url)).text();
  expect(published).toBe(generatedHeader + source);
  expect(published).not.toContain("@semicoder/fn-runtime");
  expect(await Bun.file(new URL("../src/card-contract.ts",import.meta.url)).text()).toBe(generatedHeader+await Bun.file(new URL("../../runtime/src/card-contract.ts",import.meta.url)).text());
});

test("client pages and RPC use the calling application scope and unload with their plugin", async () => {
  const requests: { method: string; params: Record<string, unknown> }[] = [];
  const host = createBrowserHost({
    call: async (method, params) => {
      requests.push({ method, params });
      return method === "apps.kv.list" ? { items: [], nextOffset: 0, hasMore: false } : null;
    },
  });
  cleanups.push(() => host.dispose());
  const clients: ClientApplication[] = [];
  const plugin = {
    inject: ["clientApp"],
    apply(ctx: Context) {
      clients.push(ctx.clientApp);
      ctx.clientApp.page({ id: "main", title: "Page", component: () => null });
    },
  };
  await host.load("first", plugin);
  await host.load("second", plugin);
  expect(host.pages().map((page) => page.key)).toEqual(["first:main", "second:main"]);
  await clients[0]!.invoke("save", { text: "hello" });
  await clients[1]!.kv.set("draft", "two");
  await clients[0]!.kv.get("draft");
  await clients[0]!.kv.delete("draft");
  await clients[1]!.kv.list();
  await clients[1]!.call("connections.list");
  expect(requests).toEqual([
    { method: "apps.invoke", params: { appId: "first", name: "save", args: { text: "hello" } } },
    { method: "apps.kv.set", params: { appId: "second", key: "draft", value: "two" } },
    { method: "apps.kv.get", params: { appId: "first", key: "draft" } },
    { method: "apps.kv.delete", params: { appId: "first", key: "draft" } },
    { method: "apps.kv.list", params: { appId: "second", offset: 0, limit: 100 } },
    { method: "connections.list", params: {} },
  ]);
  await host.unload("first");
  expect(host.pages().map((page) => page.key)).toEqual(["second:main"]);
  expect(() => clients[0]!.invoke("save")).toThrow();
  await expect(host.load("second", plugin)).rejects.toThrow("already loaded");
});

test("page effects belong to the contributing subplugin and failed registration is rolled back", async () => {
  const host = createBrowserHost({ call: async () => null });
  cleanups.push(() => host.dispose());
  let removeChild: (() => Promise<void>) | undefined;
  await host.load("nested", {
    inject: ["clientApp"],
    async apply(ctx: Context) {
      ctx.clientApp.page({ id: "parent", title: "Parent", component: () => null });
      const child = await ctx.plugin({
        inject: ["clientApp"],
        apply(childCtx: Context) {
          childCtx.clientApp.page({ id: "child", title: "Child", component: () => null });
        },
      });
      removeChild = child.dispose;
    },
  });
  expect(host.pages()).toHaveLength(2);
  await removeChild!();
  expect(host.pages().map((page) => page.id)).toEqual(["parent"]);
  await expect(host.load("broken", {
    inject: ["clientApp"],
    apply(ctx: Context) {
      ctx.clientApp.page({ id: "main", title: "First", component: () => null });
      ctx.clientApp.page({ id: "main", title: "Duplicate", component: () => null });
    },
  })).rejects.toThrow();
  expect(host.pages().map((page) => page.appId)).toEqual(["nested"]);
});

async function fixture(client = true) {
  const directory = await mkdtemp(join(tmpdir(), "fn-cordis-sdk-"));
  cleanups.push(() => rm(directory, { recursive: true, force: true }));
  await Bun.write(join(directory, "package.json"), JSON.stringify({
    name: "@example/cordis-app", version: "0.0.0", type: "module",
    exports: { ".": "./src/index.ts", ...(client ? { "./client": "./dist/client.js" } : {}) },
    fn: { schemaVersion: 1, id: "sample", name: "Sample" },
  }));
  await Bun.write(join(directory, "src/index.ts"), "export function apply() {}\n");
  return directory;
}

test("compiled client shares the host's React and Cordis and backend remains TypeScript", async () => {
  const directory = await fixture();
  await Bun.write(join(directory, "src/client.tsx"), `
import { useState } from "react";
import { Context } from "@deepseek-ai/cordis";
import { readAllPages } from "@semicoder/fn-sdk/cordis-client";
import { Button } from "@semicoder/fn-sdk/ui";
import { validateResponse } from "@semicoder/fn-sdk/cards";
export const identities = { useState, Context, readAllPages, Button, validateResponse };
export const inject = ["clientApp"];
export function apply(ctx) {
  ctx.clientApp.page({ id: "home", title: "Home", component: () => <p>Shared runtime</p> });
}
`);
  const output = await buildCordisApplication(directory);
  const host = createBrowserHost({ call: async () => null });
  cleanups.push(() => host.dispose());
  const built = await import(pathToFileURL(output.client!).href);
  expect(built.identities.useState).toBe(React.useState);
  expect(built.identities.Context).toBe(Context);
  expect(built.identities.Button).toBe(Button);
  expect(built.identities.validateResponse).toBe(validateResponse);
  expect(built.identities.readAllPages).toBe(readAllPages);
  await host.load("sample", built);
  expect(host.pages()[0]?.key).toBe("sample:home");
  expect(await Bun.file(join(directory, "dist/index.js")).exists()).toBe(false);
  const contents = await Bun.file(output.client!).text();
  expect(contents).toContain("__FN_CORDIS_MODULES__");
  expect(contents.length).toBeLessThan(12_000);
});

test("pure service packages need no browser artifact; a failed client build preserves dist", async () => {
  expect(await buildCordisApplication(await fixture(false))).toEqual({});
  const directory = await fixture();
  await Bun.write(join(directory, "src/client.tsx"), "export const inject = [];\n");
  const output = await buildCordisApplication(directory);
  const previous = await Bun.file(output.client!).text();
  await Bun.write(join(directory, "src/client.tsx"), 'import "react/unsupported-internal";');
  await expect(buildCordisApplication(directory)).rejects.toThrow();
  expect(await Bun.file(output.client!).text()).toBe(previous);
});

test("check resolves TypeScript's public package bin and reports actual source type errors", async () => {
  const directory = await fixture(false);
  await mkdir(join(directory, "node_modules"));
  const compiler = dirname(createRequire(import.meta.url).resolve("typescript/package.json"));
  await symlink(compiler, join(directory, "node_modules/typescript"));
  await Bun.write(join(directory, "tsconfig.json"), JSON.stringify({
    compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, types: [], target: "ESNext" },
    include: ["src"],
  }));
  await checkCordisApplication(directory);
  await Bun.write(join(directory, "src/index.ts"), 'const text: string = 42; export { text };');
  await expect(checkCordisApplication(directory)).rejects.toThrow("not assignable");
});

test("SVG assets are built for service-only apps and invalid replacements preserve prior output", async () => {
  const directory = await fixture(false);
  const path = join(directory, "package.json"), manifest = await Bun.file(path).json();
  manifest.fn.icon = "记"; manifest.fn.iconSvg = "dist/icon.svg";
  await Bun.write(path, JSON.stringify(manifest));
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z"/></svg>';
  await Bun.write(join(directory, "src/icon.svg"), svg);
  await buildCordisApplication(directory);
  expect(await Bun.file(join(directory, "dist/icon.svg")).text()).toBe(svg);
  await Bun.write(join(directory, "src/icon.svg"), "not an SVG");
  await expect(buildCordisApplication(directory)).rejects.toThrow();
  expect(await Bun.file(join(directory, "dist/icon.svg")).text()).toBe(svg);
  manifest.fn.iconSvg = "../icon.svg"; await Bun.write(path, JSON.stringify(manifest));
  await expect(buildCordisApplication(directory)).rejects.toThrow();
});
