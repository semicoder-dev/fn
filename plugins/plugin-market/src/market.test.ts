import { expect, test } from "bun:test";
import { Context } from "@deepseek-ai/cordis";
import { createAPIRegistry } from "@semicoder/fia/api";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { HostEnvironment } from "@semicoder/fn-host";
import Rpc from "../../rpc/src/index.ts";
import Activity from "../../activity/src/index.ts";
import Market from "./index.ts";

test("closing during a market refresh cancels the request without publishing shutdown errors", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-market-close-"));
  const ctx = new Context();
  const api = createAPIRegistry();
  const events: string[] = [];
  let signal: AbortSignal | undefined;
  try {
    ctx.provide("host", {
      dataDirectory: directory,
      api,
      platform: { emit: (name: string) => events.push(name) },
    } as unknown as HostEnvironment);
    ctx.provide("plugins", {} as Context["plugins"]);
    await ctx.plugin(Rpc);
    await ctx.plugin(Activity);
    await ctx.plugin(Market);
    const market = ctx.market;
    (market as unknown as { fetcher: typeof fetch }).fetcher = ((_url, options) => {
      signal = options?.signal as AbortSignal;
      return new Promise<Response>((_resolve, reject) => {
        signal!.addEventListener("abort", () => reject(signal!.reason), { once: true });
      });
    }) as typeof fetch;
    const pending = market.refresh("official");
    expect(signal?.aborted).toBe(false);
    const before = events.length;
    await ctx.fiber.dispose();
    await pending;
    expect(signal?.aborted).toBe(true);
    expect(events).toHaveLength(before);
    expect(await Bun.file(join(directory, "market/sources.json")).exists()).toBe(false);
  } finally {
    await ctx.fiber.dispose();
    await api.dispose();
    await rm(directory, { recursive: true, force: true });
  }
});
