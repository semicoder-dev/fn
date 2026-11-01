import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PlatformStore } from "../src/store.ts";
import { RelayStore, replyChunks } from "../src/relay.ts";
import { ApplicationPlatform } from "../src/index.ts";
async function archive(version = "0.1.0") {
  const manifest = {
    manifestVersion: 1,
    id: "test-app",
    version,
    hostApi: 2,
    name: "Test",
    entries: { backend: "src/backend.ts" },
    locales: { default: "en", messages: { en: "locales/en.json" } },
    uses: [],
    contributes: { summary: { initial: "summary/initial.json" } },
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
      "summary/initial.json": JSON.stringify({
        version: 1,
        text: "Initial",
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

test("updates keep exactly one visible application and reset only derived summary data", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-summary-"));
  try {
    const store = await PlatformStore.open(root);
    const one = await store.install(await archive());
    await store.setSummary(one, { version: 1, text: "Live" }, () => {});
    expect(store.document.preferences.desktop).toEqual(["test-app"]);
    store.document.preferences.desktop = ["missing", "test-app", "test-app"];
    const two = await store.install(await archive("0.1.1"));
    expect(store.document.preferences.desktop).toEqual(["test-app"]);
    expect((await store.summary(two))?.snapshot.text).toBe("Initial");
    const platform = new ApplicationPlatform({
      native: {
        statusItem: { setMenu: async () => {} },
        application: { setAppearance: async () => {} },
      },
    } as any);
    platform.store = store;
    await platform.command("preferences", { desktop: [] });
    expect(store.document.preferences.desktop).toEqual(["test-app"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
