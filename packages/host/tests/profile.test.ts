import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolveProfile, profileSchema, reconcileSeedProfile } from "../src/profile.ts";
test("upstream patches compose ordered bundles and replace a layout without mutating the bundle", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-bundles-"));
  const bundle = { client: [{ id: "layout", name: "@semicoder/fn-ui-layout/client" }] };
  try {
    await writeFile(join(root, "base.json"), JSON.stringify(bundle));
    const source = {
      bundles: ["./base.json"],
      patches: {
        client: [
          { id: "layout", disabled: true },
          { insert: [{ id: "replacement", name: "test/client" }] },
        ],
      },
    };
    const result = await resolveProfile(source, root);
    expect(result.client.map((row) => [row.id, !!row.disabled])).toEqual([
      ["layout", true],
      ["replacement", false],
    ]);
    expect(await Bun.file(join(root, "base.json")).json()).toEqual(bundle);
    await expect(
      resolveProfile(
        { bundles: ["./base.json"], patches: { client: [{ id: "missing", disabled: true }] } },
        root,
      ),
    ).rejects.toThrow("missing");
    await writeFile(join(root, "cycle.json"), JSON.stringify({ bundles: ["./cycle.json"] }));
    await expect(resolveProfile({ bundles: ["./cycle.json"] }, root)).rejects.toThrow("cycle");
    await mkdir(join(root, "node_modules/fn-bundle"), { recursive: true });
    await writeFile(
      join(root, "node_modules/fn-bundle/package.json"),
      JSON.stringify({ fn: { bundle: "./composition.json" } }),
    );
    await writeFile(join(root, "node_modules/fn-bundle/composition.json"), JSON.stringify(bundle));
    expect((await resolveProfile({ bundles: ["fn-bundle"] }, root)).client).toEqual(bundle.client);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("instance IDs are local to a scope, and malformed nested entries fail before activation", () => {
  const group = (id: string) => ({
    id,
    name: "fn-target",
    config: { plugins: [{ id: "same", name: "plugin" }] },
  });
  expect(
    profileSchema.parse({ plugins: [group("a"), group("b")], client: [] }).plugins,
  ).toHaveLength(2);
  expect(() => profileSchema.parse({ plugins: [group("a"), group("a")], client: [] })).toThrow(
    "Duplicate",
  );
  expect(() =>
    profileSchema.parse({
      plugins: ["a", "b"].map((id) => ({
        id,
        name: "cordis:group",
        group: true,
        config: [{ id: "same", name: "plugin" }],
      })),
      client: [],
    }),
  ).toThrow("Duplicate");
  expect(() =>
    profileSchema.parse({
      plugins: [{ id: "a", name: "target", config: { plugins: [{}] } }],
      client: [],
    }),
  ).toThrow("nested");
});

test("seed changes remove withdrawn core entries, preserve custom plugins and re-enable opt-in defaults", () => {
  const common = { "@semicoder/fn-models": "0.0.0" };
  const experimental = {
    ...common,
    "@semicoder/fn-chat": "0.0.0",
    "@semicoder/fn-ui-chat": "0.0.0",
  };
  const chat = { id: "chat", name: "@semicoder/fn-chat", config: {} };
  const ui = { id: "ui-chat", name: "@semicoder/fn-ui-chat/client" };
  const models = { id: "models", name: "@semicoder/fn-models", disabled: true };
  const own = { id: "my-plugin", name: "my-plugin", config: { keep: "unchanged" } };
  const current = {
    plugins: [
      models,
      chat,
      own,
      { id: "group", name: "cordis:group", group: true, config: [{ ...chat, id: "custom-chat" }] },
    ],
    client: [ui],
  };
  const snapshot = structuredClone(current);
  const normal = reconcileSeedProfile(current, experimental, common, {
    plugins: [models],
    client: [],
  });
  expect(normal).toEqual({
    plugins: [models, own, { id: "group", name: "cordis:group", group: true, config: [] }],
    client: [],
  });
  expect(current).toEqual(snapshot);
  const enabled = reconcileSeedProfile(normal, common, experimental, {
    plugins: [models, chat],
    client: [ui],
  });
  expect(enabled.plugins).toContainEqual(chat);
  expect(enabled.plugins).toContainEqual(models);
  expect(enabled.plugins).toContainEqual(own);
  expect(enabled.client).toEqual([ui]);
  const manuallyDisabled = {
    ...enabled,
    plugins: enabled.plugins.filter((row) => row.id !== "chat"),
  };
  expect(
    reconcileSeedProfile(manuallyDisabled, experimental, experimental, {
      plugins: [chat],
      client: [ui],
    }),
  ).toEqual(manuallyDisabled);
});
