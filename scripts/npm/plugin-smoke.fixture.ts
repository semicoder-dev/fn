import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { inspectPlugin, buildPlugin, packPlugin } from "@semicoder/fn-sdk/build";
import * as Cordis from "@deepseek-ai/cordis";
import * as React from "react";
import * as Slots from "@deepseek-ai/dsh-client-ui-slots";
const root = join(process.cwd(), "fixture");
await mkdir(join(root, "src"), { recursive: true });
await Bun.write(
  join(root, "package.json"),
  JSON.stringify({
    name: "@semicoder/fn-fixture",
    version: "0.0.0",
    type: "module",
    files: ["src", "dist"],
    exports: { ".": "./src/index.ts", "./client": "./dist/client.js" },
    fn: { name: "Fixture" },
  }),
);
await Bun.write(
  join(root, "src/index.ts"),
  'export function apply(ctx) { ctx.provide("fixture", true); }',
);
await Bun.write(
  join(root, "src/client.tsx"),
  `import type { Context } from "@deepseek-ai/cordis";
import React from "react";
import "./style.css";
export const inject = ["slots"];
export function apply(ctx: Context) { ctx.slots.register({ name: "root" }, () => <main>Fixture</main>); }`,
);
await Bun.write(join(root, "src/style.css"), ".fixture { color: red }");
await inspectPlugin(root);
await buildPlugin(root);
let registration: any;
const nodes = new Set<object>();
const window = {
  __ModuleLoader__: {
    load(value: unknown) {
      registration = value;
    },
  },
};
const document = {
  currentScript: { src: "https://fn.invalid/api/plugin-assets/g/p/client.js" },
  createElement() {
    const value = {
      textContent: "",
      remove() {
        nodes.delete(value);
      },
    };
    return value;
  },
  head: {
    append(value: object) {
      nodes.add(value);
    },
  },
};
new Function("window", "document", await readFile(join(root, "dist/client.js"), "utf8"))(
  window,
  document,
);
const shared: Record<string, unknown> = {
  react: React,
  "react/jsx-runtime": await import("react/jsx-runtime"),
  "@deepseek-ai/cordis": Cordis,
  "@deepseek-ai/dsh-client-ui-slots": Slots,
};
const module = registration.factory((name: string) => {
  if (!(name in shared)) throw new Error(`Unexpected bundled dependency: ${name}`);
  return shared[name];
});
const ctx = new Cordis.Context();
const { createRequire } = await import("node:module");
const require = createRequire(import.meta.url);
let renderer: any;
new Function(
  "window",
  await readFile(require.resolve("@deepseek-ai/dsh-client-ui-renderer/client"), "utf8"),
)({
  __ModuleLoader__: {
    load(value: unknown) {
      renderer = value;
    },
  },
});
Object.assign(shared, {
  "react-dom": await import("react-dom"),
  "react-dom/client": await import("react-dom/client"),
});
const rendererModule = renderer.factory((name: string) => shared[name]);
await ctx.plugin(rendererModule.default ?? rendererModule);
const slots = ctx.slots;
await ctx.plugin(module.default ?? module);
if (nodes.size !== 1 || slots.entries("root").length !== 1)
  throw new Error("Client activation failed");
await ctx.fiber.dispose();
if (Number(nodes.size) !== 0 || slots.entries("root").length !== 0)
  throw new Error("Client resources leaked");
await packPlugin(root, join(process.cwd(), "packed"));
console.log("Standalone SDK backend/client pack and original slot/CSS cleanup passed");
