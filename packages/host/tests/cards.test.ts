import { afterEach, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { fixtureHost, fixturePlugin } from "./fixture.ts";
import { cardSchema, validateResponse } from "../../../plugins/chat-cards/src/contract.ts";
import { CardStore } from "../../../plugins/chat-cards/src/store.ts";
import { PluginGroup } from "../src/index.ts";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const finish: (() => Promise<unknown>)[] = [];
afterEach(async () => {
  for (const fn of finish.splice(0).reverse()) await fn();
});
const card = cardSchema.parse({
  version: 1,
  template: "form",
  title: "Confirm",
  summary: "",
  blocks: [{ type: "text", text: "**Review**" }],
  inputs: [
    { id: "text", label: "Text", type: "text", required: true, maxLength: 5 },
    { id: "number", label: "Number", type: "number", required: true, minimum: 1, maximum: 3 },
    { id: "flag", label: "Flag", type: "boolean", required: true },
    {
      id: "choice",
      label: "Choice",
      type: "select",
      required: true,
      options: [{ id: "a", label: "A" }],
    },
    {
      id: "multi",
      label: "Multi",
      type: "multiSelect",
      required: false,
      options: [{ id: "a", label: "A" }],
    },
  ],
  actions: [{ id: "ok", label: "OK", style: "primary" }],
});
const values = { text: "hello", number: 2, flag: false, choice: "a" };
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "fn-cards-"));
  finish.push(() => rm(root, { recursive: true, force: true }));
  const host = await fixtureHost(root);
  finish.push(() => host.close());
  let api!: Context["cards"];
  const unload = await fixturePlugin(host.ctx, "cards", {
    inject: ["cards"],
    apply(ctx: Context) {
      api = ctx.cards;
    },
  });
  host.ctx.sessionController.store.putSession({
    id: "s",
    targetId: "chat",
    connectionId: "c",
    modelId: "m",
    title: "Cards",
    createdAt: 1,
    updatedAt: 1,
    policy: "controlled",
    archived: false,
    status: "idle",
  });
  return { host, api, root, unload };
}
test("card validation covers all inputs and rejects invalid structure and responses", () => {
  validateResponse(card, "ok", values);
  for (const input of [
    { ...values, text: "too long" },
    { ...values, number: 4 },
    { ...values, flag: "false" },
    { ...values, choice: "missing" },
    { ...values, multi: ["a", "a"] },
    { ...values, extra: 1 },
  ])
    expect(() => validateResponse(card, "ok", input)).toThrow();
  expect(() => validateResponse(card, "missing", values)).toThrow();
  expect(() => cardSchema.parse({ ...card, inputs: [...card.inputs, card.inputs[0]] })).toThrow();
});
test("card claims persist before handler execution; concurrent devices and restart cannot replay effects", async () => {
  const { host, api, root } = await fixture();
  let calls = 0,
    release!: () => void;
  api.register("save", async () => {
    calls++;
    await new Promise<void>((resolve) => {
      release = resolve;
    });
  });
  const input = { key: "once", handler: "save", card };
  const created = api.create("s", input);
  expect(api.create("s", input).id).toBe(created.id);
  expect(() => api.create("s", { ...input, card: { ...card, title: "changed" } })).toThrow();
  const first = host.ctx.cards.respondCard("s", created.id, "ok", values);
  await Promise.resolve();
  expect(calls).toBe(1);
  expect(host.ctx.activity.busy()).toBe(true);
  await expect(host.ctx.cards.respondCard("s", created.id, "ok", values)).rejects.toThrow();
  expect(host.ctx.cards.store.card(created.id)?.state).toBe("running");
  release();
  await first;
  expect(host.ctx.cards.cards("s")[0]?.state).toBe("completed");
  expect(host.ctx.activity.busy()).toBe(false);
  // Persist a claimed action as if the process died before recording its outcome.
  const interrupted = api.create("s", { ...input, key: "crash" });
  host.ctx.cards.store.putCard(
    { ...host.ctx.cards.store.card(interrupted.id)!, state: "running" },
    "pending",
  );
  await host.close();
  const reopened = new CardStore(join(root, "cards/state.sqlite"));
  expect(reopened.card(created.id)?.state).toBe("completed");
  expect(reopened.card(interrupted.id)?.state).toBe("interrupted");
  reopened.close();
});
test("ownership, expiry, cancellation, missing handlers and failed storage prevent side effects", async () => {
  const { host, api, root } = await fixture();
  let calls = 0;
  const dispose = api.register("save", () => {
    calls++;
  });
  const create = (key: string) => api.create("s", { key, handler: "save", card });
  const expired = create("expiry");
  host.ctx.cards.store.putCard({ ...host.ctx.cards.store.card(expired.id)!, expiresAt: 1 });
  await expect(host.ctx.cards.respondCard("s", expired.id, "ok", values)).rejects.toThrow();
  expect(host.ctx.cards.cards("s")[0]?.state).toBe("expired");
  const cancelled = create("cancel");
  api.cancel(cancelled.id);
  await expect(host.ctx.cards.respondCard("s", cancelled.id, "ok", values)).rejects.toThrow();
  const value = create("valid");
  await expect(host.ctx.cards.respondCard("foreign", value.id, "ok", values)).rejects.toThrow();
  expect(() => host.ctx.cards.cancelCard("other", value.id)).toThrow();
  const db = new Database(join(root, "cards/state.sqlite"));
  db.exec(
    "CREATE TRIGGER fail_card BEFORE UPDATE ON cards BEGIN SELECT RAISE(ABORT,'card-write-failed'); END",
  );
  await expect(host.ctx.cards.respondCard("s", value.id, "ok", values)).rejects.toThrow(
    "card-write-failed",
  );
  db.exec("DROP TRIGGER fail_card");
  db.close();
  dispose();
  await expect(host.ctx.cards.respondCard("s", value.id, "ok", values)).rejects.toThrow(
    "unavailable",
  );
  expect(calls).toBe(0);
});
test("configured instance removal revokes its card handlers", async () => {
  const { host, api, unload } = await fixture();
  api.register("save", () => {});
  const pending = api.create("s", { key: "pending", handler: "save", card });
  await unload();
  await expect(host.ctx.cards.respondCard("s", pending.id, "ok", values)).rejects.toThrow(
    "unavailable",
  );
});

test("failed card handlers are terminal and retain the accepted response without automatic retries", async () => {
  const { host, api } = await fixture();
  let effects = 0;
  api.register("fail", () => {
    effects++;
    throw new Error("fixture failure");
  });
  const value = api.create("s", { key: "failed", handler: "fail", card });
  await expect(host.ctx.cards.respondCard("s", value.id, "ok", values)).rejects.toThrow(
    "fixture failure",
  );
  expect(host.ctx.cards.cards("s")[0]).toMatchObject({
    state: "failed",
    answer: { actionId: "ok", values },
  });
  await expect(host.ctx.cards.respondCard("s", value.id, "ok", values)).rejects.toThrow();
  expect(effects).toBe(1);
  expect(host.ctx.activity.busy()).toBe(false);
});

test("same local action IDs in two nested plugin scopes stay isolated and disposal cancels only its owner", async () => {
  const { host, root } = await fixture();
  const contexts: Context[] = [];
  const key = crypto.randomUUID();
  (globalThis as any)[key] = {
    inject: ["cards"],
    apply(ctx: Context) {
      contexts.push(ctx);
    },
  };
  const file = join(root, "nested-card.ts");
  await writeFile(file, `export default globalThis[${JSON.stringify(key)}];`);
  const group = {
    apply: async (ctx: Context) => {
      await new PluginGroup(ctx).mount([{ id: "same", name: pathToFileURL(file).href }]);
    },
  };
  const left = await fixturePlugin(host.ctx, "left", group);
  await fixturePlugin(host.ctx, "right", { ...group });
  let rightCalls = 0;
  contexts[0]!.cards.register(
    "save",
    ({ signal }) =>
      new Promise<void>((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
  );
  contexts[1]!.cards.register("save", () => {
    rightCalls++;
  });
  const a = contexts[0]!.cards.create("s", { key: "same", handler: "save", card });
  const b = contexts[1]!.cards.create("s", { key: "same", handler: "save", card });
  expect(a.id).not.toBe(b.id);
  const operation = host.ctx.cards.respondCard("s", a.id, "ok", values);
  const rejected = operation.then(
    () => undefined,
    (error) => error,
  );
  await Promise.resolve();
  await left();
  expect(String(await rejected)).toContain("disposed");
  await host.ctx.cards.respondCard("s", b.id, "ok", values);
  expect(rightCalls).toBe(1);
  expect(host.ctx.cards.cards("s").find((item) => item.id === a.id)?.state).toBe("failed");
  delete (globalThis as any)[key];
});
