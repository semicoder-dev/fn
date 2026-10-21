import { afterEach, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, stat } from "node:fs/promises";
import { hostname, tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "@semicoder/fia/api";
import type { FnRuntime, SessionInfo } from "../../packages/runtime/src/index.ts";
import { SessionChatEngine, SessionChatService, type SessionChatOptions } from "./service.ts";
import { SessionChatStore } from "./store.ts";
import { cloudRecord, identity, parseRecord, recordSchemas, type ChatTransport, type CloudRecord, type SessionCommand } from "./protocol.ts";

const stores: SessionChatStore[] = [], directories: string[] = [], services: SessionChatService[] = [];
afterEach(async () => {
  for (const service of services.splice(0)) await service.stop();
  for (const store of stores.splice(0)) store.close();
  for (const dir of directories.splice(0)) await rm(dir, { recursive: true, force: true });
});
class MemoryTransport implements ChatTransport {
  records = new Map<string, CloudRecord>();
  commits = 0;
  async read(id: string) { return this.records.get(id); }
  async commit(records: CloudRecord[]) { this.commits += records.length; for (const record of records) this.records.set(record.id, record); return records; }
  async changes() { return { records: [...this.records.values()], deletedIDs: [], token: "cursor", moreComing: false }; }
}
function fixture() {
  const store = new SessionChatStore(":memory:"); stores.push(store);
  const transport = new MemoryTransport();
  let sends = 0, creates = 0;
  const sessions = new Map<string, SessionInfo>();
  const selected = [{ connectionId: "connection", id: "model" }];
  const runtime = {
    applications: () => [{ id: "app", name: "App", enabled: true, status: "active", chats: [{ id: "chat", name: "Chat" }] }],
    connections: { list: () => [{ id: "connection", name: "Connection", configured: true }], listModels: async () => [{ id: "model", name: "Model" }] },
    createSession: async () => {
      creates++;
      const session: SessionInfo = { id: "session", appId: "app", endpointId: "chat", title: "Session", connectionId: "connection", modelId: "model", policy: "controlled", status: "idle", archived: false, createdAt: 1, updatedAt: 1 };
      sessions.set(session.id, session); return session;
    },
    session: (id: string) => { const session = sessions.get(id); if (!session) throw new Error("Unknown session"); return session; },
    send: async () => { sends++; return sessions.get("session")!; },
    cards: () => [], respondCard: async () => {},
    pendingApprovals: () => [], cancel: async () => {}, setModel: async () => sessions.get("session")!,
    archive: () => sessions.get("session")!, answerApproval: () => {},
  } as unknown as FnRuntime;
  const engine = new SessionChatEngine(store, transport, () => runtime, async id => ({
    schemaVersion: 1, sessionId: id, asOfSeq: 1, items: [{ id: `${id}:1`, seq: 1, createdAt: 1, kind: "assistant", text: "hello", truncated: false }], nextOffset: 2, hasMore: false,
  }), () => selected);
  const command = (value: Record<string, unknown>) => cloudRecord("FnSessionCommand", {
    protocolVersion: 3, id: crypto.randomUUID(), hostId: store.deviceId, deviceId: "phone", createdAt: 1, ...value,
  } as SessionCommand);
  return { store, transport, runtime, engine, command, selected, counts: () => ({ sends, creates }) };
}
test("v3 commands are durably deduplicated and publication uses fn display records", async () => {
  const f = fixture();
  const create = f.command({ action: "create", appId: "app", endpointId: "chat", connectionId: "connection", modelId: "model" });
  f.transport.records.set(create.id, create);
  await f.engine.sync(); await f.engine.sync();
  expect(f.counts().creates).toBe(1);
  expect(f.store.ownsSession("session")).toBe(true);
  const send = f.command({ action: "send", sessionId: "session", text: "hello" });
  f.transport.records.set(send.id, send);
  await f.engine.sync(); await f.engine.sync();
  expect(f.counts().sends).toBe(1);
  expect(f.store.list("FnSessionReply")).toHaveLength(1);
  const reply = parseRecord(f.store.list("FnSessionReply")[0]!);
  expect(JSON.stringify(reply)).not.toContain("replayState");
  expect(f.store.pending()).toHaveLength(0);
});
test("commands cannot reach sessions from another iCloud account", async () => {
  const f = fixture();
  const send = f.command({ action: "send", sessionId: "unowned", text: "hello" });
  f.transport.records.set(send.id, send);
  await f.engine.sync();
  expect(f.counts().sends).toBe(0);
  expect(JSON.parse(f.store.list("FnSessionResult")[0]!.fields.payload!)).toMatchObject({ status: "failed" });
});
test("long local catalog labels do not block Chat and invalid model IDs are never rewritten", async () => {
  const f = fixture(), connection = f.runtime.connections.list()[0]!;
  const model = (await f.runtime.connections.listModels(connection.id))[0]!;
  f.runtime.connections.list = () => [{ ...connection, name: "n".repeat(160) }];
  const exactId = "m".repeat(256);
  f.selected.push({ connectionId: "connection", id: exactId }, { connectionId: "connection", id: "unchanged/model-id" });
  f.runtime.connections.listModels = async () => [
    { ...model, id: "x".repeat(257), name: "Must be skipped" },
    { ...model, id: "", name: "Empty ID" },
    { ...model, id: "  ", name: "Whitespace ID" },
    { ...model, id: exactId, name: "A" + "🙂".repeat(300) },
    { ...model, id: "unchanged/model-id", name: "Readable" },
  ];
  const create = f.command({ action: "create", appId: "app", endpointId: "chat", connectionId: "connection", modelId: exactId });
  f.transport.records.set(create.id, create);
  await f.engine.sync();
  const catalog = recordSchemas.FnSessionConnection.parse(JSON.parse(f.store.list("FnSessionConnection")[0]!.fields.payload!));
  expect(catalog.name).toBe("n".repeat(100));
  expect(catalog.enabled).toBe(true);
  expect(catalog.models).toEqual([
    { id: exactId, name: "A" + "🙂".repeat(255) },
    { id: "unchanged/model-id", name: "Readable" },
  ]);
  expect(JSON.parse(f.store.list("FnSessionResult")[0]!.fields.payload!)).toMatchObject({ status: "completed" });
  expect(f.store.list("FnSessionReply")).toHaveLength(1);
  expect(f.store.pending()).toHaveLength(0);
});
test("large concurrent approvals are published in complete bounded batches", async () => {
  const f = fixture();
  const create = f.command({ action: "create", appId: "app", endpointId: "chat", connectionId: "connection", modelId: "model" });
  f.transport.records.set(create.id, create);
  const pending = Array.from({ length: 12 }, (_, index) => ({
    id: `approval-${index}`, sessionId: "session", toolName: "run_command", reason: `${index}:` + "x".repeat(32000),
  }));
  f.runtime.pendingApprovals = () => pending;
  const received: string[] = [];
  while (pending.length) {
    await f.engine.sync();
    const record = f.store.list("FnSessionSummary")[0]!;
    expect(Buffer.byteLength(record.fields.payload!)).toBeLessThan(192 * 1024);
    const { approvals } = JSON.parse(record.fields.payload!) as { approvals: Omit<(typeof pending)[number], "sessionId">[] };
    expect(approvals.length).toBeGreaterThan(0);
    expect(approvals.length).toBeLessThanOrEqual(4);
    expect(approvals).toEqual(pending.slice(0, approvals.length).map(({ sessionId, ...value }) => value));
    received.push(...approvals.map(value => value.id));
    pending.splice(0, approvals.length);
  }
  expect(received).toHaveLength(12);
  expect(new Set(received).size).toBe(12);
});
test("restart marks claimed operations interrupted without replaying effects", async () => {
  const dir = await mkdtemp(join(tmpdir(), "fn-chat-v3-")); directories.push(dir);
  const path = join(dir, "chat.sqlite");
  let store = new SessionChatStore(path);
  const command: SessionCommand = { protocolVersion: 3, id: "command", hostId: store.deviceId, deviceId: "phone", createdAt: 1, action: "send", sessionId: "s", text: "hi" };
  expect(store.claim(command)).toBe(true); store.close();
  store = new SessionChatStore(path); stores.push(store);
  expect(store.claim(command)).toBe(false);
  expect(JSON.parse(store.pending()[0]!.fields.payload!)).toMatchObject({ status: "interrupted" });
  expect(() => store.claim({ ...command, text: "changed" })).toThrow("different content");
});
test("unknown protocol and mismatched identities are quarantined without losing the cursor", () => {
  const f = fixture();
  const value = f.command({ action: "cancel", sessionId: "s" });
  f.store.ingest([{ ...value, id: "wrong" }], [], "new-token");
  expect(f.store.list("FnSessionCommand")).toHaveLength(0);
  expect(f.store.meta("cursor")).toBe("new-token");
  expect(f.store.failures()).toHaveLength(1);
});
test("Swift shares exact generated v3 schemas and database paths isolate accounts", async () => {
  const schemas = await Bun.file("clients/apple/FnChatCore/Sources/FnChatCore/Resources/session-contracts.json").json();
  expect(schemas).toEqual(Object.fromEntries(Object.entries(recordSchemas).map(([key, value]) => [key, z.toJSONSchema(value)])));
  const dir = await mkdtemp(join(tmpdir(), "fn-chat-v3-path-")); directories.push(dir);
  const a = SessionChatStore.open(dir, "development", "iCloud.test.development", "a");
  const b = SessionChatStore.open(dir, "development", "iCloud.test.development", "b"); stores.push(a, b);
  expect(a.path).not.toBe(b.path); expect(a.path).toContain("chat-v3");
});

function nativeFixture(account: (container: string) => Promise<{ accountKey: string }> = async () => ({ accountKey: "test-account" })) {
  const records = new Map<string, CloudRecord>(), calls: string[] = [], containers: string[] = [];
  const native = {
    cloudKit: {
      account: async ({ container }: { container: string }) => { calls.push("account"); containers.push(container); return account(container); },
      ensureZone: async () => { calls.push("ensureZone"); return {}; },
      subscribeZone: async () => { calls.push("subscribeZone"); return {}; },
      registerPush: async () => { calls.push("registerPush"); return {}; },
      changes: async () => { calls.push("changes"); return { records: [...records.values()], deletedIDs: [], token: "cursor", moreComing: false }; },
      read: async ({ id }: { id: string }) => {
        calls.push("read");
        const record = records.get(id);
        if (!record) throw Object.assign(new Error("Missing record"), { reason: "unknownItem" });
        return record;
      },
      commit: async ({ records: values }: { records: CloudRecord[] }) => {
        calls.push("commit");
        for (const record of values) records.set(record.id, record);
        return values;
      },
    },
  } as unknown as SessionChatOptions["native"];
  return { native, calls, containers, records };
}
async function serviceFixture(mode: string, native: SessionChatOptions["native"], accepting?: () => boolean) {
  const directory = await mkdtemp(join(tmpdir(), "fn-chat-service-")); directories.push(directory);
  const root = join(directory, "cordis-v1"), f = fixture();
  const service = new SessionChatService({ root, mode, bundleId: "com.semicoder.fn.test", native,
    runtime: () => f.runtime, accepting, changed() {},
    projection: async id => ({ schemaVersion: 1, sessionId: id, asOfSeq: -1, items: [], nextOffset: 0, hasMore: false }),
  });
  services.push(service);
  return { service, root, directory, config: join(root, "communication-config.json") };
}

test("Chat admission gate prevents new native work and polling recovers after a failed restart", async () => {
  let accepting = false;
  const account = Promise.withResolvers<{ accountKey: string }>();
  const native = nativeFixture(() => account.promise);
  const f = await serviceFixture("development", native.native, () => accepting);
  await f.service.connect(); await f.service.sync();
  expect(native.calls).toHaveLength(0);
  expect(f.service.busy()).toBe(false);
  expect(await Bun.file(f.config).exists()).toBe(false);
  accepting = true;
  const connecting = f.service.connect();
  expect(f.service.busy()).toBe(true);
  account.resolve({ accountKey: "test-account" });
  await connecting;
  expect(f.service.snapshot()).toMatchObject({ connected: true, status: "同步成功" });
  expect(f.service.busy()).toBe(false);
  expect(await Bun.file(f.config).json()).toEqual({ container: "iCloud.com.semicoder.fn.development", name: hostname() });
  expect((await stat(f.config)).mode & 0o077).toBe(0);
  const before = native.calls.length;
  accepting = false;
  await f.service.sync(); await f.service.connect();
  expect(native.calls).toHaveLength(before);
  expect(f.service.busy()).toBe(false);
  accepting = true;
  const deadline = Date.now() + 4500;
  while (native.calls.length === before && Date.now() < deadline) await Bun.sleep(20);
  expect(native.calls.length).toBeGreaterThan(before);
  expect(f.service.snapshot().status).toBe("同步成功");
}, 10000);

test("first Chat connection saves mode-specific defaults without reading legacy config, and retains native errors", async () => {
  for (const mode of ["production", "preview"]) {
    const native = nativeFixture(async () => { throw new Error("CloudKit signing entitlement missing"); });
    const f = await serviceFixture(mode, native.native);
    await Bun.write(join(f.directory, "communication-config.json"), JSON.stringify({ container: "iCloud.legacy.production", name: "Legacy" }));
    await f.service.connect();
    const container = `iCloud.com.semicoder.fn.${mode === "production" ? "production" : "development"}`;
    expect(await Bun.file(f.config).json()).toEqual({ container, name: hostname() });
    expect(native.containers).toEqual([container]);
    expect(f.service.snapshot()).toMatchObject({ connected: false, status: "CloudKit signing entitlement missing" });
    expect(f.service.busy()).toBe(false);
    expect((await Bun.file(join(f.directory, "communication-config.json")).json()).name).toBe("Legacy");
  }
});

test("explicit Chat configuration is preserved and a mismatched environment fails before native access", async () => {
  const native = nativeFixture();
  const f = await serviceFixture("preview", native.native);
  await mkdir(f.root);
  const override = JSON.stringify({ container: "iCloud.custom.development", name: "Explicit host" }, null, 2);
  await Bun.write(f.config, override);
  await f.service.connect();
  expect(native.containers).toEqual(["iCloud.custom.development"]);
  expect(await Bun.file(f.config).text()).toBe(override);
  expect([...native.records.values()].filter(record => record.type === "FnSessionHost").map(record => JSON.parse(record.fields.payload!).name)).toEqual(["Explicit host"]);
  await f.service.stop();
  const invalidNative = nativeFixture();
  const invalid = await serviceFixture("development", invalidNative.native);
  await mkdir(invalid.root);
  const invalidConfig = '{"container":"iCloud.custom.production","name":"Do not overwrite"}';
  await Bun.write(invalid.config, invalidConfig);
  await invalid.service.connect();
  expect(invalidNative.calls).toHaveLength(0);
  expect(invalid.service.snapshot().status).toBe("CloudKit container does not match this environment");
  expect(await Bun.file(invalid.config).text()).toBe(invalidConfig);
});

test("read receipts are monotonic, bounded by persisted history, account scoped and deduplicated", async () => {
  const f = fixture();
  const create = f.command({ action: "create", appId: "app", endpointId: "chat", connectionId: "connection", modelId: "model" });
  f.transport.records.set(create.id, create); await f.engine.sync();
  for (const seq of [999, 0]) {
    const read = f.command({ action: "read", sessionId: "session", seq });
    f.transport.records.set(read.id, read); await f.engine.sync(); await f.engine.sync();
    expect(f.store.meta("read:session")).toBe("1");
  }
  const other = f.command({ action: "read", sessionId: "other", seq: 1 });
  f.transport.records.set(other.id, other); await f.engine.sync();
  expect(f.store.meta("read:other")).toBeUndefined();
  expect(f.counts()).toEqual({ sends: 0, creates: 1 });
  expect(JSON.parse(f.store.pending().find(record => record.type === "FnSessionSummary")?.fields.payload ?? f.transport.records.get(`FnSessionSummary:${f.store.deviceId}:session`)!.fields.payload!)).toMatchObject({ readSeq: 1 });
});


test("phone catalog includes only selected models from each account's current catalog", async () => {
  const f = fixture(), connection = f.runtime.connections.list()[0]!;
  f.runtime.connections.list = () => [connection, {...connection,id:"second"}, {...connection,id:"unconfigured",configured:false}];
  f.runtime.connections.listModels = async () => [{id:"model",name:"Model"},{id:"other",name:"Other"}] as any;
  f.selected.push({connectionId:"connection",id:"removed-upstream"},{connectionId:"second",id:"other"},{connectionId:"unconfigured",id:"model"});
  await f.engine.sync();
  const catalog = () => f.store.list("FnSessionConnection").map(record => recordSchemas.FnSessionConnection.parse(JSON.parse(record.fields.payload!)));
  expect(catalog().find(value => value.id === "connection")?.models.map(value=>value.id)).toEqual(["model"]);
  expect(catalog().find(value => value.id === "second")?.models.map(value=>value.id)).toEqual(["other"]);
  expect(catalog().find(value => value.id === "unconfigured")).toMatchObject({enabled:false,models:[]});
  f.selected.splice(0); await f.engine.sync();
  expect(catalog().every(value=>!value.enabled && !value.models.length)).toBe(true);
});
test("stale offline selections cannot create or switch sessions, while an existing binding still sends", async () => {
  const f=fixture();let switches=0;
  f.runtime.setModel=async()=>{switches++;return f.runtime.session("session");};
  const push=(fields:Record<string,unknown>)=>{const command=f.command(fields);f.transport.records.set(command.id,command);return command;};
  push({action:"create",appId:"app",endpointId:"chat",connectionId:"connection",modelId:"model"});await f.engine.sync();
  f.selected.splice(0);
  const rejected=[push({action:"create",appId:"app",endpointId:"chat",connectionId:"connection",modelId:"model"}),push({action:"model",sessionId:"session",modelId:"model"})];
  push({action:"send",sessionId:"session",text:"continue"});await f.engine.sync();
  expect(f.counts()).toEqual({creates:1,sends:1});expect(switches).toBe(0);
  const results=f.store.list("FnSessionResult").map(value=>JSON.parse(value.fields.payload!));
  for(const command of rejected) expect(results.find(value=>value.id===JSON.parse(command.fields.payload!).id)).toMatchObject({status:"failed"});
  // Selection removal during the asynchronous model lookup must also be honored.
  f.selected.push({connectionId:"connection",id:"model"});
  f.runtime.connections.listModels=async()=>{f.selected.splice(0);return [{id:"model",name:"Model"}] as any;};
  push({action:"model",sessionId:"session",modelId:"model"});await f.engine.sync();expect(switches).toBe(0);
});
