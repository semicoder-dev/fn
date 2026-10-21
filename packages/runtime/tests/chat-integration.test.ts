import { expect, test } from "bun:test";
import type { Context } from "@deepseek-ai/cordis";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FnRuntime, readSessionProjection } from "../src/index.ts";
import { SessionChatEngine } from "../../../backend/chat-next/service.ts";
import { SessionChatStore } from "../../../backend/chat-next/store.ts";
import { cloudRecord, type ChatTransport, type CloudRecord, type SessionCommand } from "../../../backend/chat-next/protocol.ts";

test("Chat command -> unmodified AgentLoop -> SQLite -> fn projection survives restart without duplicate calls", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-chat-core-"));
  const previousNoProxy = process.env.NO_PROXY;
  process.env.NO_PROXY = "localhost,127.0.0.1";
  let requests = 0;
  const server = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch() {
    requests++;
    return new Response([
      { content: `reply-${requests}` }, {},
    ].map((delta, index) => "data: " + JSON.stringify({
      id: `reply-${requests}`, object: "chat.completion.chunk", created: 0, model: "test",
      choices: [{ index: 0, delta, finish_reason: index ? "stop" : null }],
    })).concat("data: [DONE]", "").join("\n\n"), { headers: { "content-type": "text/event-stream" } });
  } });
  const records = new Map<string, CloudRecord>();
  const transport: ChatTransport = {
    read: async id => records.get(id),
    commit: async values => { for (const value of values) records.set(value.id, value); return values; },
    changes: async () => ({ records: [...records.values()], deletedIDs: [], token: "cursor", moreComing: false }),
  };
  let host: FnRuntime | undefined, store: SessionChatStore | undefined;
  let cards!: Context["app"]["cards"], cardCalls = 0;
  const app = {
    manifest: { id: "chat-app", name: "Chat", version: "0.0.0", packageName: "chat-fixture" },
    plugin: { inject: ["app"], apply(ctx: Context) { ctx.app.chat({ id: "main", name: "Chat" }); cards=ctx.app.cards; cards.action("save",({values})=>{cardCalls++;ctx.app.kv.set("answer",values);}); } },
  };
  try {
    host = await FnRuntime.open({ dataDirectory: join(directory, "runtime") });
    await host.load(app);
    const connection = await host.connections.create({ name: "Fixture", provider: "fixture", auth: "api-key",
      profile: { api: "openai-completions", baseURL: server.url.href, models: [{ id: "test", contextWindow: 4096, maxTokens: 128 }] } });
    await host.connections.setApiKey(connection.id, "fixture");
    store = new SessionChatStore(join(directory, "chat.sqlite"));
    let engine = new SessionChatEngine(store, transport, () => host!, (id, offset, limit) => readSessionProjection(host!.ctx, id, offset, limit), () => [{ connectionId: connection.id, id: "test" }]);
    const push = (input: Record<string, unknown>) => {
      const record = cloudRecord("FnSessionCommand", { protocolVersion: 3, id: crypto.randomUUID(), hostId: store!.deviceId,
        deviceId: "phone", createdAt: Date.now(), ...input } as SessionCommand);
      records.set(record.id, record);
    };
    push({ action: "create", appId: "chat-app", endpointId: "main", connectionId: connection.id, modelId: "test" });
    await engine.sync();
    const sessionId = store.sessionIds()[0]!;
    expect(sessionId).toBeDefined();
    const card=cards.create(sessionId,{key:"choice",handler:"save",card:{version:1,template:"choice",title:"Choose",summary:"",blocks:[],inputs:[{id:"value",label:"Value",type:"text",required:true}],actions:[{id:"save",label:"Save"}]}});
    await engine.sync();
    expect(JSON.parse(store.list("FnSessionCard")[0]!.fields.payload!).card.state).toBe("pending");
    push({action:"card",sessionId,cardId:card.id,actionId:"save",values:{unknown:true}});await engine.sync();expect(cardCalls).toBe(0);expect(host.cards(sessionId)[0]!.state).toBe("pending");
    push({action:"card",sessionId:"foreign",cardId:card.id,actionId:"save",values:{value:"no"}});await engine.sync();expect(cardCalls).toBe(0);
    push({action:"card",sessionId,cardId:card.id,actionId:"save",values:{value:"first"}});
    push({action:"card",sessionId,cardId:card.id,actionId:"save",values:{value:"second"},deviceId:"other-phone"});
    await engine.sync();await engine.sync();expect(cardCalls).toBe(1);
    const published=JSON.parse(store.list("FnSessionCard")[0]!.fields.payload!);
    expect(published.card).toMatchObject({state:"completed",answer:{actionId:"save"}});
    expect(["first","second"]).toContain(published.card.answer.values.value);

    expect(JSON.stringify(published)).not.toContain('"handler"');
    push({ action: "send", sessionId, text: "first" });
    await engine.sync(); await (await host.agent(sessionId)).whenIdle(); await engine.sync();
    expect(requests).toBe(1);
    expect(store.list("FnSessionReply").map(record => JSON.parse(record.fields.payload!).item.text)).toEqual(["reply-1"]);
    engine.stop(); await engine.settled(); store.close(); store = undefined; await host.close();
    host = await FnRuntime.open({ dataDirectory: join(directory, "runtime") }); await host.load(app);
    store = new SessionChatStore(join(directory, "chat.sqlite"));
    engine = new SessionChatEngine(store, transport, () => host!, (id, offset, limit) => readSessionProjection(host!.ctx, id, offset, limit), () => [{ connectionId: connection.id, id: "test" }]);
    await engine.sync();
    expect(requests).toBe(1);
    expect(host.session(sessionId).status).toBe("unloaded");
    expect(host.cards(sessionId)[0]!.state).toBe("completed");expect(cardCalls).toBe(1);
    push({ action: "send", sessionId, text: "second" });
    await engine.sync(); await (await host.agent(sessionId)).whenIdle(); await engine.sync();
    expect(requests).toBe(2);
    expect(store.list("FnSessionReply").map(record => JSON.parse(record.fields.payload!).item.text).sort()).toEqual(["reply-1", "reply-2"]);
    engine.stop(); await engine.settled();
  } finally {
    store?.close(); await host?.close(); await server.stop(true); await rm(directory, { recursive: true, force: true });
    if (previousNoProxy === undefined) delete process.env.NO_PROXY; else process.env.NO_PROXY = previousNoProxy;
  }
}, 20000);
