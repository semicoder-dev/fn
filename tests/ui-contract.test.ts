import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { Context } from "@deepseek-ai/cordis";
import { buildPlugin } from "../packages/sdk/build.ts";

test("shared UI JS stays external while theme CSS is bundled and disposed with its plugin", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-ui-contract-"));
  const ctx = new Context();
  const nodes = new Set<{ textContent: string; remove(): void }>();
  try {
    await mkdir(join(root, "src"));
    await mkdir(join(root, "node_modules/@semicoder"), { recursive: true });
    await symlink(
      resolve(import.meta.dir, "../packages/ui"),
      join(root, "node_modules/@semicoder/fn-ui"),
    );
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({
        name: "@semicoder/fn-ui-fixture",
        version: "0.0.0",
        type: "module",
        exports: { "./client": "./dist/client.js" },
      }),
    );
    await writeFile(
      join(root, "src/client.tsx"),
      `import { Button } from '@semicoder/fn-ui';
import '@semicoder/fn-ui/theme.css';
export function apply(ctx) { ctx.provide('fixtureUi', Button); }`,
    );
    await buildPlugin(root);
    const code = await Bun.file(join(root, "dist/client.js")).text();
    let registration: { factory(require: (name: string) => unknown): any } | undefined;
    const document = {
      currentScript: { src: "https://test.invalid/plugins/ui/client.js" },
      head: {
        append(node: typeof nodes extends Set<infer T> ? T : never) {
          nodes.add(node);
        },
      },
      createElement() {
        const node = {
          textContent: "",
          remove() {
            nodes.delete(node);
          },
        };
        return node;
      },
    };
    new Function("window", "document", code)(
      {
        __ModuleLoader__: {
          load(value: typeof registration) {
            registration = value;
          },
        },
      },
      document,
    );
    const button = () => null;
    const plugin = registration!.factory((name) => {
      expect(name).toBe("@semicoder/fn-ui");
      return { Button: button };
    });
    await ctx.plugin(plugin.default ?? plugin);
    expect(ctx.get("fixtureUi")).toBe(button);
    expect(nodes.size).toBe(1);
    const css = [...nodes][0]!.textContent;
    expect(css).toContain("--dsw-alias-bg-layer-1");
    expect(css).toContain("data-ds-dark-theme");
    // These original tokens give translucent menus their blur and elevation.
    // Colors alone leave underlying page content visible through the menu.
    expect(css).toContain("--dsw-menu-backdrop-filter:");
    expect(css).toContain("--dsw-elevation-prominent:");
    expect(css).toContain("--dsw-elevation-soft:");
    expect(css).not.toMatch(/@import\s+["']@/);
    await ctx.fiber.dispose();
    expect(nodes.size).toBe(0);
  } finally {
    await ctx.fiber.dispose();
    await rm(root, { recursive: true, force: true });
  }
});
