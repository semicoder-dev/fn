import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolveProfile, profileSchema } from "../src/profile.ts";
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
