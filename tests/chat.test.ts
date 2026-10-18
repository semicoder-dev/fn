import { afterEach, expect, test } from "bun:test";
import { ChatStore, type CloudRecord } from "../backend/chat/store";
import { ChatEngine, cloudRecord, digest, type ChatTransport } from "../backend/chat/engine";
import { ChatRunner, type ChatExecutor } from "../backend/chat/runner";
import {
  parseRecord,
  messageSchema,
  cardSchema,
  validateResponse,
  type ChatMessage,
  type ChatRequest,
  type ChatUserMessage,
} from "../shared/chat/protocol";
import fixture from "../chat/fixtures/v2.json";
const stores: ChatStore[] = [];
afterEach(() => {
  for (const s of stores.splice(0)) s.close();
});
class Cloud implements ChatTransport {
  records = new Map<string, CloudRecord>();
  revision = 0;
  fail = false;
  expire = false;
  async read(id: string) {
    return structuredClone(this.records.get(id));
  }
  async commit(records: CloudRecord[]) {
    if (this.fail) throw new Error("offline");
    for (const r of records)
      if (this.records.get(r.id)?.systemFields !== r.systemFields)
        throw { reason: "serverRecordChanged" };
    const saved = records.map((r) => ({
      ...structuredClone(r),
      systemFields: String(++this.revision),
    }));
    for (const r of saved) this.records.set(r.id, r);
    return saved;
  }
  async changes(token?: string) {
    if (this.expire && token) {
      this.expire = false;
      throw { reason: "changeTokenExpired" };
    }
    return {
      records: structuredClone([...this.records.values()]),
      deletedIDs: [],
      token: String(this.revision),
      moreComing: false,
    };
  }
}
function setup(cloud = new Cloud(), host = "host-a") {
  const store = new ChatStore(":memory:");
  stores.push(store);
  Object.defineProperty(store, "deviceId", { value: host });
  const engine = new ChatEngine(
    store,
    cloud,
    () => {},
    () => 1792100000001,
  );
  return { store, engine, cloud };
}
const user = () =>
  messageSchema.parse(
    fixture.records.find((r) => r.type === "FnChatUserMessage")!.value,
  ) as ChatUserMessage;
const request = () =>
  messageSchema.parse(
    fixture.records.find((r) => (r.value as { kind?: string }).kind === "request")!.value,
  ) as ChatRequest;
async function catalog(cloud: Cloud) {
  const r = fixture.records.find((r) => r.type === "FnChatBot")!;
  await cloud.commit([cloudRecord("FnChatBot", parseRecord(r.type, JSON.stringify(r.value)))]);
}
test("shared v2 fixtures enforce direction, identity and all card fields", () => {
  for (const r of fixture.records)
    expect(() => parseRecord(r.type, JSON.stringify(r.value))).not.toThrow();
  for (const r of fixture.invalid)
    expect(() => parseRecord(r.type, JSON.stringify(r.value))).toThrow();
  const card = cardSchema.parse(request().card);
  validateResponse(card, "submit", fixture.values);
  for (const values of [
    { ...fixture.values, count: 6 },
    { ...fixture.values, choices: ["a", "a"] },
    { ...fixture.values, text: "" },
    { ...fixture.values, extra: true },
  ])
    expect(() => validateResponse(card, "submit", values)).toThrow();
  expect(() =>
    parseRecord(
      "FnChatBotMessage",
      JSON.stringify({
        ...request(),
        card: {
          ...card,
          blocks: Array.from({ length: 30 }, () => ({ type: "text", text: "x".repeat(16000) })),
        },
      }),
    ),
  ).toThrow("64 KiB");
});
test("offline queue, repeated commits and expired cursors preserve durable messages", async () => {
  const { engine, store, cloud } = setup();
  engine.create(user());
  cloud.fail = true;
  await expect(engine.sync()).rejects.toThrow("offline");
  expect(store.pending()).toHaveLength(1);
  cloud.fail = false;
  await engine.sync();
  expect(store.pending()).toHaveLength(0);
  await engine.sync();
  expect(cloud.records.size).toBe(1);
  engine.create({ ...user(), id: "user-b" });
  cloud.expire = true;
  await engine.sync();
  expect(engine.messages()).toHaveLength(2);
  expect(store.pending()).toHaveLength(0);
});
test("two clients race a card reply; one response wins and cannot be replayed", async () => {
  const a = setup(),
    b = setup(a.cloud, "phone-b");
  await catalog(a.cloud);
  a.engine.create(request());
  await a.engine.sync();
  await b.engine.sync();
  for (const [f, id] of [
    [a, "reply-a"],
    [b, "reply-b"],
  ] as const) {
    const m: ChatMessage = {
      ...user(),
      id,
      kind: "response",
      requestId: request().id,
      actionId: "submit",
      values: fixture.values,
    };
    delete (m as unknown as { text?: string }).text;
    f.store.enqueue(id, "respond", {
      kind: "respond",
      requestId: request().id,
      requestDigest: digest(request()),
      message: m,
    });
  }
  await Promise.all([a.engine.sync(), b.engine.sync()]);
  await a.engine.sync();
  await b.engine.sync();
  expect([...a.cloud.records.values()].filter((r) => r.type === "FnChatResponse")).toHaveLength(1);
  expect(a.store.failures().length + b.store.failures().length).toBe(1);
});
test("cancel and reply compete atomically, unknown or expired requests never authorize", async () => {
  const a = setup();
  await catalog(a.cloud);
  a.engine.create(request());
  await a.engine.sync();
  a.engine.cancel(request());
  await a.engine.sync();
  expect(a.engine.state(request().id)?.phase).toBe("cancelled");
  a.store.enqueue("late", "respond", {
    kind: "respond",
    requestId: request().id,
    requestDigest: digest(request()),
    message: {
      ...user(),
      kind: "response",
      id: "late",
      text: undefined,
      requestId: request().id,
      actionId: "submit",
      values: fixture.values,
    },
  });
  await a.engine.sync();
  expect(a.store.failures()).toHaveLength(1);
});
test("host routing, serial processing, durable completion and crash recovery", async () => {
  const f = setup();
  f.engine.create(user());
  f.engine.create({ ...user(), id: "user-b", createdAt: user().createdAt + 1 });
  f.engine.create({
    ...user(),
    id: "other",
    hostId: "host-b",
    conversationId: "chat:host-b:fixture",
  });
  await f.engine.sync();
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r)),
    calls: string[] = [];
  const executor: ChatExecutor = {
    chatVersion: () => ({ version: "0.0.0:1", timeoutMs: 1000 }),
    executeChat: async (m) => {
      calls.push(m.id);
      await gate;
    },
  };
  const runner = new ChatRunner(
    f.engine,
    executor,
    () => {},
    () => 1792100000002,
  );
  await runner.scan();
  expect(calls).toEqual(["user-a"]);
  await runner.scan();
  expect(calls).toHaveLength(1);
  release();
  await runner.settled();
  await runner.scan();
  await runner.settled();
  expect(calls).toEqual(["user-a", "user-b"]);
  await runner.scan();
  expect(calls).toHaveLength(2);
  f.engine.create({ ...user(), id: "crashed" });
  await f.engine.sync();
  f.store.claimExecution("crashed", "attempt");
  await runner.scan();
  expect(calls).toHaveLength(2);
  expect(f.engine.delivery("crashed")?.status).toBe("interrupted");
  runner.stop();
});
test("changed plugin versions reject events before calling handlers", async () => {
  const f = setup();
  f.engine.create(user());
  await f.engine.sync();
  let called = false;
  const r = new ChatRunner(
    f.engine,
    {
      chatVersion: () => ({ version: "new:2", timeoutMs: 1000 }),
      executeChat: async () => {
        called = true;
      },
    },
    () => {},
    () => 1792100000002,
  );
  await r.scan();
  await r.settled();
  expect(called).toBe(false);
  expect(f.engine.delivery(user().id)?.status).toBe("failed");
  r.stop();
});

test("expiration competes with cancellation and accepted responses stay terminal", async () => {
  const f = setup();
  f.engine.create({ ...request(), expiresAt: 1792100000001 });
  await f.engine.sync();
  await Promise.all([f.engine.expireRequests("host-a"), f.engine.sync()]);
  expect(f.engine.state(request().id)?.phase).toBe("expired");
  f.engine.cancel({ ...request(), expiresAt: 1792100000001 });
  await f.engine.sync();
  expect(f.engine.state(request().id)?.phase).toBe("expired");
  expect(f.store.failures()).toHaveLength(1);
});

test("lost acknowledgement after remote claim never repeats the callback", async () => {
  const f = setup();
  f.engine.create(user());
  await f.engine.sync();
  const commit = f.cloud.commit.bind(f.cloud);
  let lost = true;
  f.cloud.commit = async (records) => {
    const saved = await commit(records);
    if (lost && records.some((r) => r.type === "FnChatDelivery")) {
      lost = false;
      throw new Error("connection lost after save");
    }
    return saved;
  };
  let calls = 0;
  const runner = new ChatRunner(f.engine, {
    chatVersion: () => ({ version: "0.0.0:1", timeoutMs: 1000 }),
    executeChat: async () => {
      calls++;
    },
  });
  await expect(runner.scan()).rejects.toThrow("connection lost");
  await runner.scan();
  expect(calls).toBe(0);
  expect(f.engine.delivery(user().id)?.status).toBe("interrupted");
  runner.stop();
});

test("disabled plugins fail before execution; timeouts retain per-conversation occupancy", async () => {
  const f = setup();
  f.engine.create(user());
  await f.engine.sync();
  const unavailable = new ChatRunner(f.engine, {
    chatVersion: () => {
      throw new Error("插件不可用");
    },
    executeChat: async () => {
      throw new Error("must not execute");
    },
  });
  await unavailable.scan();
  await unavailable.settled();
  expect(f.engine.delivery(user().id)?.error).toBe("插件不可用");
  unavailable.stop();
  f.engine.create({ ...user(), id: "slow" });
  f.engine.create({ ...user(), id: "after", createdAt: user().createdAt + 1 });
  await f.engine.sync();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const calls: string[] = [];
  const runner = new ChatRunner(f.engine, {
    chatVersion: () => ({ version: "0.0.0:1", timeoutMs: 5 }),
    executeChat: async (m, ctx) => {
      calls.push(m.id);
      await gate;
      expect(ctx.signal.aborted).toBe(true);
    },
  });
  await runner.scan();
  await Bun.sleep(20);
  await runner.scan();
  expect(calls).toEqual(["slow"]);
  expect(f.engine.delivery("slow")?.status).toBe("failed");
  runner.stop();
  release();
  await runner.settled();
});
