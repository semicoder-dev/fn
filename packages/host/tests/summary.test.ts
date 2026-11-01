import { expect, test } from "bun:test";
import { mkdtemp, rm, rename } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PlatformStore, type Installation } from "../src/store.ts";
import { ApplicationPlatform } from "../src/index.ts";
import { manifestSchema } from "@semicoder/fn-sdk/manifest";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "fn-summary-contract-"));
  const store = await PlatformStore.open(root);
  async function install(id: string, dynamic = true) {
    const directory = join(root, "packages", id);
    await Bun.write(
      join(directory, "summary.json"),
      JSON.stringify({ version: 1, text: "Initial" }),
    );
    await Bun.write(join(directory, "en.json"), "{}");
    const manifest = manifestSchema.parse({
      manifestVersion: 1,
      hostApi: 2,
      id,
      version: "0.1.0",
      name: id,
      entries: { backend: "backend.ts" },
      locales: { default: "en", messages: { en: "en.json" } },
      uses: dynamic ? ["application.summary"] : [],
      contributes: { summary: { initial: "summary.json" } },
    });
    const installation: Installation = {
      instanceId: id,
      directory,
      build: { format: 1, manifest, backend: "backend.ts" },
    };
    await store.register(installation);
    return installation;
  }
  return {
    root,
    store,
    install,
    dispose: () => rm(root, { recursive: true, force: true }),
  };
}

test("summary snapshots replace fields, clear to initial, persist independently and recover from corrupt cache", async () => {
  const f = await fixture();
  try {
    const app = await f.install("test-app");
    const before = await Bun.file(join(f.root, "platform.json")).text();
    await f.store.setSummary(
      app,
      { version: 1, text: "First", metrics: [{ value: 12 }] },
      () => {},
    );
    await f.store.setSummary(app, { version: 1, text: "Second" }, () => {});
    const reopened = await PlatformStore.open(f.root);
    expect((await reopened.summary(app))?.snapshot).toEqual({
      version: 1,
      text: "Second",
    });
    expect((await reopened.summary(app))?.updatedAt).toBeNumber();
    expect(await Bun.file(join(f.root, "platform.json")).text()).toBe(before);
    await reopened.setSummary(app, null, () => {});
    expect(await reopened.summary(app)).toEqual({
      snapshot: { version: 1, text: "Initial" },
    });
    const files = await Array.fromAsync(
      new Bun.Glob("*.json").scan(join(f.root, "summaries")),
    );
    await Bun.write(join(f.root, "summaries", files[0]!), "corrupt");
    expect((await reopened.summary(app))?.snapshot.text).toBe("Initial");
  } finally {
    await f.dispose();
  }
});

test("queued updates are ordered; invalid, failed and expired writes preserve the last valid snapshot", async () => {
  const f = await fixture();
  try {
    const app = await f.install("test-app");
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        f.store.setSummary(app, { version: 1, text: String(i) }, () => {}),
      ),
    );
    expect((await f.store.summary(app))?.snapshot.text).toBe("11");
    expect(() =>
      f.store.setSummary(app, { version: 1, progress: { value: 2 } }, () => {}),
    ).toThrow();
    let checks = 0;
    await expect(
      f.store.setSummary(app, { version: 1, text: "Stale" }, () => {
        if (++checks === 2) throw Error("Expired before commit");
      }),
    ).rejects.toThrow("Expired");
    expect((await f.store.summary(app))?.snapshot.text).toBe("11");
    await rename(join(f.root, "summaries"), join(f.root, "saved-summaries"));
    await Bun.write(join(f.root, "summaries"), "not a directory");
    await expect(
      f.store.setSummary(app, { version: 1, text: "Failed" }, () => {}),
    ).rejects.toThrow();
    await rm(join(f.root, "summaries"));
    await rename(join(f.root, "saved-summaries"), join(f.root, "summaries"));
    expect((await f.store.summary(app))?.snapshot.text).toBe("11");
    await f.store.setSummary(app, { version: 1, text: "Recovered" }, () => {});
    expect((await f.store.summary(app))?.snapshot.text).toBe("Recovered");
  } finally {
    await f.dispose();
  }
});

test("backend summary authorization, run isolation and data notifications are independent", async () => {
  const f = await fixture();
  try {
    const one = await f.install("app-one"),
      two = await f.install("app-two", false);
    const platform = new ApplicationPlatform({ native: {} } as any);
    platform.store = f.store;
    const run = (instanceId: string) =>
      ({
        instanceId,
        id: instanceId + "-run",
        token: instanceId + "-token",
        state: "running",
        controller: new AbortController(),
        pending: new Map(),
        modelCalls: 0,
      }) as any;
    const first = run(one.instanceId),
      second = run(two.instanceId);
    platform.runs.set(one.instanceId, first);
    platform.runs.set(two.instanceId, second);
    const messages: Record<string, unknown[]> = {
      one: [],
      two: [],
      stale: [],
      admin: [],
    };
    const socket = (key: string) =>
      ({
        getBufferedAmount: () => 0,
        send: (data: string) => messages[key]!.push(JSON.parse(data)),
      }) as any;
    platform.admins.add(socket("admin"));
    for (const [key, instanceId, runId] of [
      ["one", one.instanceId, first.id],
      ["two", two.instanceId, second.id],
      ["stale", one.instanceId, "expired"],
    ])
      platform.views.set(key!, {
        id: key,
        token: key,
        instanceId,
        runId,
        controller: new AbortController(),
        socket: socket(key!),
      } as any);
    const request = async (
      path: string,
      body: unknown,
      headers: Record<string, string> = {},
    ) =>
      (await platform.fetch(
        new Request("http://localhost/fn/v1" + path, {
          method: "POST",
          headers: { "content-type": "application/json", ...headers },
          body: JSON.stringify(body),
        }),
        {} as any,
      ))!;
    const bearer = { authorization: "Bearer " + first.token };
    expect(
      (
        await request(
          "/apps/summary",
          { snapshot: { version: 1, text: "Live" } },
          bearer,
        )
      ).status,
    ).toBe(200);
    expect((await f.store.summary(one))?.snapshot.text).toBe("Live");
    expect(messages.one).toEqual([]);
    expect(messages.admin).toEqual([{ type: "changed" }]);
    expect(
      (
        await request(
          "/apps/summary",
          { snapshot: { version: 1 } },
          { "x-fn-view": "one" },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await request(
          "/apps/summary",
          { snapshot: { version: 1 } },
          { authorization: "Bearer " + second.token },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await request(
          "/apps/summary",
          { snapshot: { version: 1 }, instanceId: two.instanceId },
          bearer,
        )
      ).status,
    ).toBe(400);
    expect((await f.store.summary(two))?.snapshot.text).toBe("Initial");
    expect((await request("/apps/data-changed", {}, bearer)).status).toBe(200);
    expect(messages.one).toEqual([{ type: "dataChanged" }]);
    expect(messages.two).toEqual([]);
    expect(messages.stale).toEqual([]);
    expect(messages.admin).toHaveLength(1);
    first.controller.abort();
    expect(
      (
        await request(
          "/apps/summary",
          { snapshot: { version: 1, text: "Late" } },
          bearer,
        )
      ).status,
    ).toBe(401);
    expect((await f.store.summary(one))?.snapshot.text).toBe("Live");
    // A removed run token must not be accepted as backend credentials.
    platform.runs.delete(one.instanceId);
    expect((await request("/apps/data-changed", {}, bearer)).status).toBe(403);
    expect((await request("/widgets/publish", {}, bearer)).status).toBe(404);
  } finally {
    await f.dispose();
  }
});

test("legacy applications remain manageable but cannot spawn; order includes every installation once", async () => {
  const f = await fixture();
  try {
    const one = await f.install("app-one"),
      two = await f.install("app-two");
    (one.build.manifest as any).hostApi = 1;
    const platform = new ApplicationPlatform({
      native: {
        processes: {
          spawn: () => {
            throw Error("must not spawn");
          },
        },
      },
    } as any);
    platform.store = f.store;
    await expect(platform.open(one.instanceId)).rejects.toMatchObject({
      code: "unsupported_host_api",
    });
    expect(platform.runs.size).toBe(0);
    expect(
      f.store.desktopOrder([two.instanceId, two.instanceId, "missing"]),
    ).toEqual([two.instanceId, one.instanceId]);
    expect(await f.store.summary(one)).toBeUndefined();
  } finally {
    await f.dispose();
  }
});
