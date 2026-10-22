import { expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Context } from "@deepseek-ai/cordis";
import Loader from "@deepseek-ai/cordis-plugin-loader";
import { applyEntryPatches } from "@deepseek-ai/cordis-plugin-include";

test("published Loader boots Bun TypeScript; dependency withdrawal unwinds effects", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-loader-"));
  const ctx = new Context();
  try {
    await writeFile(
      join(directory, "provider.ts"),
      `export function apply(ctx: any) { ctx.provide('counter', { count: 0 }); }`,
    );
    await writeFile(
      join(directory, "consumer.ts"),
      `export const inject = ['counter']; export function apply(ctx: any) { ctx.effect(() => { const counter = ctx.counter; counter.count++; return () => { counter.count--; }; }); }`,
    );
    await ctx.plugin(Loader, { baseUrl: pathToFileURL(directory + "/").href });
    await ctx.loader.root.update([
      { id: "consumer", name: "./consumer.ts" },
      { id: "provider", name: "./provider.ts" },
    ]);
    await ctx.loader.await();
    expect(ctx.loader.resolve("consumer").fiber?.uid).toBeTruthy();
    const activeState = ctx.loader.resolve("consumer").fiber?.state;
    const counter = ctx.get("counter") as { count: number };
    expect(counter.count).toBe(1);
    await ctx.loader.resolve("provider").fiber?.dispose();
    await ctx.loader.await();
    expect(counter.count).toBe(0);
    expect(ctx.loader.resolve("consumer").fiber?.state).not.toBe(activeState);
  } finally {
    await ctx.fiber.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});

test("profile patches use the upstream whole-config replacement semantics", () => {
  const base = [{ id: "layout", name: "fn-ui-layout", config: { old: true } }];
  const result = applyEntryPatches(
    base,
    [{ id: "layout", config: { mode: "compact" } }],
    (message) => {
      throw new Error(message);
    },
  );
  expect(result[0]?.config).toEqual({ mode: "compact" });
  expect(base[0]?.config).toEqual({ old: true });
});
