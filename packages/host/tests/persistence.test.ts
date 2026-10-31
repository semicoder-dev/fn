import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PlatformStore } from "../src/store.ts";
import { RelayStore, replyChunks } from "../src/relay.ts";
import { ApplicationPlatform } from "../src/index.ts";
import type { WidgetDefinition } from "@semicoder/fn-sdk/manifest";
async function archive(
  version = "0.1.0",
  widgets: string[] = [],
  layout: Pick<WidgetDefinition, "size"> = {
    size: "1x1",
  },
) {
  const manifest = {
    manifestVersion: 1,
    id: "test-app",
    version,
    hostApi: 1,
    name: "Test",
    entries: { backend: "src/backend.ts" },
    locales: { default: "en", messages: { en: "locales/en.json" } },
    uses: [],
    contributes: {
      widgets: widgets.map((id) => ({
        id,
        ...layout,
        initial: "widgets/initial.json",
      })),
    },
  };
  return new Bun.Archive(
    {
      "fn.app.json": JSON.stringify(manifest),
      "fn-build.json": JSON.stringify({
        format: 1,
        manifest,
        backend: "src/backend.ts",
      }),
      "src/backend.ts": "export default {};",
      "locales/en.json": "{}",
      "widgets/initial.json": JSON.stringify({
        version: 1,
        body: { type: "text", text: "Initial" },
      }),
    },
    { compress: "gzip" },
  ).bytes();
}
test("complete phone replies split into bounded UTF-8 records without losing Unicode", () => {
  const reply = '你好😀\\\"\n'.repeat(20000);
  const chunks = replyChunks(reply);
  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks.join("")).toBe(reply);
  for (const chunk of chunks) {
    expect(Buffer.byteLength(JSON.stringify(chunk))).toBeLessThanOrEqual(48002);
    expect(chunk.includes("\uFFFD")).toBe(false);
  }
});
test("installed widget size comes from the package and changes only with an update", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-widget-size-"));
  try {
    const store = await PlatformStore.open(root);
    await store.install(await archive("0.1.0", ["summary"], { size: "2x2" }));
    const size = async () =>
      (await PlatformStore.open(root)).document.installations[0]?.build.manifest
        .contributes.widgets[0]?.size;
    expect(await size()).toBe("2x2");
    const platform = new ApplicationPlatform({ native: {} } as any);
    platform.store = store;
    const before = structuredClone(store.document.preferences);
    await expect(
      platform.command("preferences", {
        theme: "dark",
        widgetSizes: { "test-app/summary": "1x1" },
      }),
    ).rejects.toThrow();
    expect(store.document.preferences).toEqual(before);
    await store.install(await archive("0.1.1", ["summary"], { size: "3x1" }));
    expect(await size()).toBe("3x1");
    expect(store.document.preferences.desktop).toEqual(["test-app/summary"]);
    await expect(
      store.install(
        await archive("0.1.2", ["summary"], { size: "5x1" as any }),
      ),
    ).rejects.toThrow();
    expect(await size()).toBe("3x1");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("application archives are validated before activation and preserve separate data", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-install-"));
  try {
    const store = await PlatformStore.open(root);
    const one = await store.install(await archive());
    const paths = await store.paths(one.instanceId);
    await Bun.write(join(paths.data, "note.txt"), "persistent content");
    await expect(
      store.install(await archive("0.1.1"), { sha256: "0".repeat(64) }),
    ).rejects.toThrow("digest");
    expect(store.document.installations[0]?.directory).toBe(one.directory);
    await expect(
      store.install(await archive("0.1.1"), {}, () => {
        throw Error("running");
      }),
    ).rejects.toThrow("running");
    expect(store.document.installations[0]?.directory).toBe(one.directory);
    const next = await store.install(await archive("0.1.1"));
    expect(next.directory).not.toBe(one.directory);
    expect(await Bun.file(join(paths.data, "note.txt")).text()).toBe(
      "persistent content",
    );
    expect(await Bun.file(join(next.directory, "src/backend.ts")).text()).toBe(
      "export default {};",
    );
    const reopened = await PlatformStore.open(root);
    expect(reopened.document.installations[0]?.build.manifest.version).toBe(
      "0.1.1",
    );
    const bad = await new Bun.Archive({ "../escape": "no" }).bytes();
    await expect(store.install(bad)).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("phone requests remain waiting until claimed, deduplicate and persist interruption/outbox", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-relay-"));
  let store: RelayStore | undefined;
  try {
    const path = join(root, "relay.sqlite");
    store = new RelayStore(path);
    const hostId = crypto.randomUUID(),
      id = crypto.randomUUID();
    const input = {
      id,
      hostId,
      instanceId: "test-app",
      conversationId: crypto.randomUUID(),
      text: "Hello",
      locale: "en",
      createdAt: 1,
    };
    store.receive(input, hostId);
    store.receive(input, hostId);
    expect(store.list()).toHaveLength(1);
    expect(store.get(id)?.status).toBe("waiting");
    expect(store.claim("other-app")).toBeUndefined();
    expect(store.claim("test-app")?.status).toBe("processing");
    store.close();
    store = new RelayStore(path);
    expect(store.get(id)?.status).toBe("interrupted");
    expect(store.claim("test-app")).toBeUndefined();
    const retry = { ...input, id: crypto.randomUUID() };
    store.receive(retry, hostId);
    store.claim("test-app");
    store.reply("test-app", retry.id, "Reply");
    store.reply("test-app", retry.id, "Reply");
    expect(store.get(retry.id)?.status).toBe("completed");
    expect(
      (
        store.db
          .query("SELECT dirty FROM messages WHERE id=?")
          .get(retry.id) as { dirty: number }
      ).dirty,
    ).toBe(1);
    expect(() => store!.receive({ ...input, text: "Changed" }, hostId)).toThrow(
      "identity",
    );
  } finally {
    store?.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("updates create new widget instances without restoring deliberately removed cards", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-widgets-"));
  try {
    const store = await PlatformStore.open(root);
    await store.install(await archive("0.1.0", ["one"]));
    expect(store.document.preferences.desktop).toEqual(["test-app/one"]);
    store.document.preferences.desktop = [];
    await store.install(await archive("0.1.1", ["one", "two"]));
    expect(store.document.preferences.desktop).toEqual(["test-app/two"]);
    await store.install(await archive("0.1.2", ["one"]));
    expect(store.document.preferences.desktop).toEqual([]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
