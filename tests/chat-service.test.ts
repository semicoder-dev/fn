import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ChatService } from "../backend/chat/service";
import type { CloudRecord } from "../backend/chat/store";
import type { Plugins } from "../backend/plugins";

test("SDK binds bot identity, paginates records and isolates captured clients across iCloud accounts", async () => {
  const root = await mkdtemp(join(tmpdir(), "fn-chat-service-"));
  let account = "account-a",
    revision = 0;
  const clouds = new Map<string, Map<string, CloudRecord>>();
  const cloud = () => {
    if (!clouds.has(account)) clouds.set(account, new Map());
    return clouds.get(account)!;
  };
  let event: ((value: { reason: string }) => void) | undefined;
  const subscriptions: string[] = [];
  const native = {
    on: (_name: string, callback: typeof event) => {
      event = callback;
      return () => {};
    },
    cloudKit: {
      account: async () => ({ accountKey: account }),
      ensureZone: async () => {},
      registerPush: async () => {},
      unsubscribe: async ({ id }: { id: string }) => {
        subscriptions.push("remove:" + id);
      },
      subscribeZone: async ({ id }: { id: string }) => {
        subscriptions.push(id);
      },
      read: async ({ id }: { id: string }) => structuredClone(cloud().get(id)),
      commit: async ({ records }: { records: CloudRecord[] }) => {
        for (const r of records)
          if (cloud().get(r.id)?.systemFields !== r.systemFields)
            throw { reason: "serverRecordChanged" };
        const saved = records.map((r) => ({
          ...structuredClone(r),
          systemFields: String(++revision),
        }));
        for (const r of saved) cloud().set(r.id, r);
        return saved;
      },
      changes: async () => ({
        records: structuredClone([...cloud().values()]),
        deletedIDs: [],
        token: String(revision),
        moreComing: false,
      }),
    },
  } as unknown as ConstructorParameters<typeof ChatService>[3];
  const plugins = {
    chatCatalog: () =>
      ["a", "b"].map((pluginId) => ({
        pluginId,
        name: pluginId,
        icon: "聊",
        enabled: true,
        version: "1:1",
      })),
    chatVersion: () => ({ version: "1:1", timeoutMs: 1000 }),
    executeChat: async () => {},
  } as unknown as Plugins;
  const service = new ChatService(
    root,
    "development",
    "test.fn",
    native,
    () => plugins,
    () => {},
  );
  try {
    await Bun.write(
      join(root, "communication-config.json"),
      JSON.stringify({ container: "iCloud.test.development", name: "Test Host" }),
    );
    await service.start();
    expect(service.snapshot().bots).toHaveLength(2);
    const a = service.client("a"),
      b = service.client("b");
    const id = await a.sendText("owned by a");
    expect((await a.get(id))?.message.pluginId).toBe("a");
    expect(await b.get(id)).toBeNull();
    await expect(b.cancel(id)).rejects.toThrow("不属于");
    for (let index = 0; index < 4; index++) await a.sendText("page " + index);
    const first = await a.list({ limit: 2 });
    const second = await a.list({ limit: 2, before: first.next });
    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(2);
    expect(new Set([...first.items, ...second.items].map((i) => i.message.id)).size).toBe(4);
    await service.sync();
    const originalHost = service.snapshot().hostId;
    account = "account-b";
    event!({ reason: "accountChanged" });
    await service.connect();
    expect(service.snapshot().hostId).not.toBe(originalHost);
    expect(service.snapshot().items).toHaveLength(0);
    await expect(a.sendText("must not cross accounts")).rejects.toThrow("账号已变化");
    expect(subscriptions).toContain("remove:fn-messages-test.fn");
    expect(subscriptions.some((s) => s.startsWith("fn-chat-v2-host-"))).toBe(true);
    expect([...cloud().values()].every((r) => r.type !== "FnChatClient")).toBe(true);
  } finally {
    service.stop();
    await Bun.sleep(0);
    await rm(root, { recursive: true, force: true });
  }
});
