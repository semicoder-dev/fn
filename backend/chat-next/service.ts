import { hostname } from "node:os";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { BackendRouteContext, CloudKitScope } from "@semicoder/fia/backend";
import type { FnRuntime } from "../../packages/runtime/src/index.ts";
import type { SessionProjectionPage } from "../../packages/runtime/src/projection.ts";
import { cloudRecord, commandSchema, errorReason, parseRecord, type ChatTransport, type CloudRecord, type SessionCommand } from "./protocol.ts";
import { SessionChatStore } from "./store.ts";

export interface SessionChatOptions {
  root: string;
  mode: string;
  bundleId: string;
  native: BackendRouteContext["native"];
  runtime(): FnRuntime;
  projection(id: string, offset?: number, limit?: number): Promise<SessionProjectionPage>;
  changed(): void;
  selectedModels?(): { connectionId: string; id: string }[];
  /** Host admission gate: do not begin background synchronization during restart. */
  accepting?(): boolean;
}
type Runtime = Pick<FnRuntime, "applications" | "sessions" | "session" | "createSession" | "send" | "cancel" | "setModel" | "archive" | "pendingApprovals" | "answerApproval" | "connections" | "cards" | "respondCard">;
function displayLabel(value: string, limit: number): string {
  const text = value.slice(0, limit), tail = text.charCodeAt(text.length - 1);
  return tail >= 0xd800 && tail <= 0xdbff ? text.slice(0, -1) : text;
}
/** Serial carrier driver; command claims and results survive process restarts. */
export class SessionChatEngine {
  private stopped = false;
  private work?: Promise<void>;
  constructor(readonly store: SessionChatStore, readonly transport: ChatTransport, private runtime: () => Runtime,
    private projection: SessionChatOptions["projection"], private selectedModels: NonNullable<SessionChatOptions["selectedModels"]> = () => []) {}
  stop() { this.stopped = true; }
  private active() { if (this.stopped) throw new Error("Chat account changed or synchronization stopped"); }
  async settled() { await this.work; }
  sync() {
    if (this.work) return this.work;
    this.work = this.run().finally(() => { this.work = undefined; });
    return this.work;
  }
  private async run() {
    this.active();
    let token = this.store.meta("cursor");
    let reset = false;
    do {
      let page;
      try { page = await this.transport.changes(token); }
      catch (error) {
        if (errorReason(error) !== "changeTokenExpired") throw error;
        token = undefined; reset = true;
        page = await this.transport.changes();
      }
      this.active();
      this.store.ingest(page.records, page.deletedIDs, page.token, reset);
      reset = false; token = page.token;
      if (!page.moreComing) break;
    } while (true);
    const commands = this.store.list("FnSessionCommand").map(record => commandSchema.parse(JSON.parse(record.fields.payload!)))
      .filter(command => command.hostId === this.store.deviceId).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
    for (const command of commands) {
      this.active();
      if (!this.store.claim(command)) continue;
      try {
        const id = await this.execute(command);
        this.active();
        this.store.finish(command, "completed", id);
      } catch (error) {
        this.store.finish(command, this.stopped ? "interrupted" : "failed", undefined, error instanceof Error ? error.message : String(error));
        this.active();
      }
    }
    await this.publish();
    for (const record of this.store.pending()) {
      this.active();
      const previous = await this.transport.read(record.id);
      this.active();
      if (previous?.fields.payload === record.fields.payload) { this.store.acknowledge(record, previous); continue; }
      const saved = await this.transport.commit([{ ...record, ...(previous?.systemFields ? { systemFields: previous.systemFields } : {}) }]);
      this.active();
      const result = saved.find(value => value.id === record.id);
      if (!result) throw new Error("CloudKit did not acknowledge the queued record");
      this.store.acknowledge(record, result);
    }
  }
  private async requireSelected(connectionId: string, modelId: string) {
    if (!this.selectedModels().some(value => value.connectionId === connectionId && value.id === modelId)) throw new Error("模型已从宿主的已添加列表移除，请同步后重新选择");
    if (!this.runtime().connections.list().some(value => value.id === connectionId && value.configured)) throw new Error("模型连接不可用");
    if (!(await this.runtime().connections.listModels(connectionId)).some(value => value.id === modelId)) throw new Error("模型已不在连接目录中");
    this.active();
    if (!this.selectedModels().some(value => value.connectionId === connectionId && value.id === modelId)) throw new Error("模型已从宿主的已添加列表移除");
  }
  private async execute(command: SessionCommand): Promise<string | undefined> {
    const runtime = this.runtime();
    if (command.action === "create") {
      const app = runtime.applications().find(app => app.id === command.appId && app.enabled && app.status === "active");
      if (!app?.chats.some(endpoint => endpoint.id === command.endpointId)) throw new Error("Chat endpoint is unavailable");
      await this.requireSelected(command.connectionId, command.modelId);
      const session = await runtime.createSession({
        appId: command.appId, endpointId: command.endpointId, connectionId: command.connectionId,
        modelId: command.modelId, title: command.title, policy: "controlled",
      });
      this.active();
      this.store.ownSession(session.id);
      return session.id;
    }
    if (!this.store.ownsSession(command.sessionId)) throw new Error("Session does not belong to this Chat account");
    const session = runtime.session(command.sessionId);
    if (command.action === "read") {
      const page = await this.projection(session.id, 0, 1);
      this.active();
      const key = `read:${session.id}`;
      const previous = Number(this.store.meta(key) ?? -1);
      this.store.setMeta(key, String(Math.max(previous, Math.min(command.seq, page.asOfSeq))));
      return session.id;
    }
    const app = runtime.applications().find(app => app.id === session.appId && app.enabled && app.status === "active");
    if (!session.endpointId || !app?.chats.some(endpoint => endpoint.id === session.endpointId)) throw new Error("Chat endpoint is unavailable");
    switch (command.action) {
      case "send": await runtime.send(session.id, command.text, command.id); break;
      case "cancel": await runtime.cancel(session.id); break;
      case "model": await this.requireSelected(session.connectionId, command.modelId); await runtime.setModel(session.id, command.modelId); break;
      case "card": await runtime.respondCard(session.id, command.cardId, command.actionId, command.values); break;
      case "archive": runtime.archive(session.id, command.archived); break;
      case "approval":
        if (!runtime.pendingApprovals().some(value => value.id === command.approvalId && value.sessionId === session.id)) throw new Error("Approval expired or belongs to another session");
        runtime.answerApproval(command.approvalId, command.allow); break;
    }
    return session.id;
  }
  private async publish() {
    this.active();
    const runtime = this.runtime(), hostId = this.store.deviceId;
    const endpoints = new Set<string>();
    for (const app of runtime.applications()) for (const endpoint of app.chats) {
      const id = createHash("sha256").update(JSON.stringify([app.id, endpoint.id])).digest("hex");
      endpoints.add(id);
      this.store.queue(cloudRecord("FnSessionEndpoint", {
        protocolVersion: 3, hostId, id, appId: app.id, endpointId: endpoint.id,
        name: `${app.name} · ${endpoint.name}`.slice(0, 200), enabled: app.enabled && app.status === "active",
      }));
    }
    for (const previous of this.store.list("FnSessionEndpoint")) {
      const value = JSON.parse(previous.fields.payload!);
      if (value.hostId === hostId && !endpoints.has(value.id)) this.store.queue(cloudRecord("FnSessionEndpoint", { ...value, enabled: false }));
    }
    const connections = new Set<string>();
    for (const connection of runtime.connections.list()) {
      connections.add(connection.id);
      let models: { id: string; name: string }[] = [];
      let enabled = connection.configured;
      if (enabled) {
        try {
          let bytes = 0;
          for (const model of await runtime.connections.listModels(connection.id)) {
            if (!this.selectedModels().some(value => value.connectionId === connection.id && value.id === model.id)) continue;
            // IDs are executable selections, never display labels. Skip an ID
            // outside the wire contract instead of truncating it into another model.
            if (typeof model.id !== "string" || !model.id.trim() || model.id.length > 256) continue;
            if (models.length >= 2000) break;
            const value = { id: model.id, name: displayLabel(typeof model.name === "string" && model.name ? model.name : model.id, 512) };
            bytes += Buffer.byteLength(JSON.stringify(value));
            if (bytes > 128 * 1024) break;
            models.push(value);
          }
        }
        catch { enabled = false; }
      }
      this.active();
      this.store.queue(cloudRecord("FnSessionConnection", { protocolVersion: 3, hostId, id: connection.id, name: displayLabel(connection.name, 100), enabled: enabled && models.length > 0, models }));
    }
    for (const previous of this.store.list("FnSessionConnection")) {
      const value = JSON.parse(previous.fields.payload!);
      if (value.hostId === hostId && !connections.has(value.id)) this.store.queue(cloudRecord("FnSessionConnection", { ...value, enabled: false, models: [] }));
    }
    for (const id of this.store.sessionIds()) {
      this.active();
      let session;
      try { session = runtime.session(id); } catch { continue; }
      for (const card of runtime.cards(id)) this.store.queue(cloudRecord("FnSessionCard", { protocolVersion: 3, hostId, id: card.id, sessionId: id, card }));
      let offset = 0, asOfSeq = -1;
      do {
        const page = await this.projection(id, offset, 50);
        this.active();
        asOfSeq = page.asOfSeq;
        for (const item of page.items) this.store.queue(cloudRecord(item.kind === "assistant" ? "FnSessionReply" : "FnSessionItem", { protocolVersion: 3, hostId, id: item.id, sessionId: id, item }));
        if (!page.hasMore) break;
        if (page.nextOffset <= offset) throw new Error("Session projection did not advance");
        offset = page.nextOffset;
      } while (true);
      const approvals: { id: string; toolName: string; reason?: string }[] = [];
      let approvalBytes = 0;
      for (const { id: approvalId, toolName, reason, sessionId } of runtime.pendingApprovals()) {
        if (sessionId !== id) continue;
        const approval = { id: approvalId, toolName, ...(reason ? { reason } : {}) };
        const size = Buffer.byteLength(JSON.stringify(approval));
        // Publish complete reasons in bounded batches. After these approvals
        // settle, the next sync presents the remainder without hiding details.
        if (approvals.length >= 100 || approvalBytes + size > 128 * 1024) break;
        approvals.push(approval); approvalBytes += size;
      }
      this.store.queue(cloudRecord("FnSessionSummary", { protocolVersion: 3, hostId, id, session, asOfSeq, readSeq: Number(this.store.meta(`read:${id}`) ?? -1), approvals }));
    }
  }
}

export class SessionChatService {
  private store?: SessionChatStore;
  private engine?: SessionChatEngine;
  private off?: () => void;
  private timer?: ReturnType<typeof setTimeout>;
  private connecting?: Promise<void>;
  private work?: Promise<void>;
  private epoch = 0;
  private stopped = false;
  private status = "Chat 尚未连接";
  private lastSync: number | null = null;
  constructor(private options: SessionChatOptions) {}
  private scheduleSync() {
    if (this.stopped) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.sync().catch(error => { this.status = String(error); this.options.changed(); });
    }, 3000);
    this.timer.unref();
  }
  busy(): boolean { return this.connecting !== undefined || this.work !== undefined; }
  snapshot() { return { connected: !!this.engine, status: this.status, hostId: this.store?.deviceId ?? null,
    lastSync: this.lastSync, pending: this.store?.pending().length ?? 0, failures: this.store?.failures() ?? [] }; }
  async start() {
    this.off = this.options.native.on?.("cloudKit.changed", payload => {
      if ((payload as { reason?: string }).reason === "accountChanged") {
        void (async () => {
          await this.isolate();
          await this.connecting;
          if (!this.stopped) await this.connect();
        })().catch(error => { this.status = String(error); this.options.changed(); });
      } else void this.sync().catch(error => { this.status = String(error); this.options.changed(); });
    });
    if (await Bun.file(join(this.options.root, "communication-config.json")).exists()) await this.connect();
  }
  private async isolate() {
    ++this.epoch; clearTimeout(this.timer);
    const engine = this.engine, store = this.store;
    this.engine = undefined; this.store = undefined; this.lastSync = null;
    engine?.stop();
    await engine?.settled().catch(() => {});
    store?.close();
    this.options.changed();
  }
  async stop() { this.stopped = true; this.off?.(); await this.isolate(); await this.connecting; }
  async connect(): Promise<void> {
    if (this.stopped) return;
    if (this.options.accepting?.() === false) {
      if (this.engine) this.scheduleSync();
      return;
    }
    if (this.connecting) return this.connecting;
    this.connecting = this.connectOnce().catch(async error => {
      await this.isolate();
      this.status = error instanceof Error ? error.message : String(error);
      this.options.changed();
    }).finally(() => { this.connecting = undefined; });
    return this.connecting;
  }
  private async connectOnce(): Promise<void> {
    if (this.engine) return this.sync();
    if (!["development", "preview", "production"].includes(this.options.mode))
      throw new Error("Unknown Chat environment");
    const epoch = this.epoch;
    const check = () => { if (epoch !== this.epoch || this.stopped) throw new Error("iCloud account changed"); };
    const path = join(this.options.root, "communication-config.json");
    const file = Bun.file(path);
    if (!await file.exists()) {
      check();
      await mkdir(this.options.root, { recursive: true, mode: 0o700 });
      const container = `iCloud.com.semicoder.fn.${this.options.mode === "production" ? "production" : "development"}`;
      try {
        // An explicit file wins, including if it appears between the existence
        // check and this first write. Never consult a legacy data directory.
        await writeFile(path, JSON.stringify({ container, name: hostname() }, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
    }
    // BunFile caches metadata from exists(); reread after creating the file.
    const config = await Bun.file(path).json() as { container?: unknown; name?: unknown };
    if (typeof config.container !== "string" || !/^iCloud\.[\w.-]+$/.test(config.container) ||
      !config.container.endsWith(this.options.mode === "production" ? ".production" : ".development")) throw new Error("CloudKit container does not match this environment");
    check();
    const native = this.options.native;
    const account = await native.cloudKit.account({ container: config.container });
    check();
    if (!account.accountKey) throw new Error("请登录 iCloud");
    const scope: CloudKitScope = { container: config.container, accountKey: account.accountKey, zone: `fn-chat-${this.options.mode}-v3` };
    await native.cloudKit.ensureZone(scope); check();
    const store = SessionChatStore.open(this.options.root, this.options.mode, config.container, account.accountKey);
    const transport: ChatTransport = {
      read: async id => {
        check();
        try { const result = await native.cloudKit.read({ scope, id }); check(); return result; }
        catch (error) { if (errorReason(error) === "unknownItem") return undefined; throw error; }
      },
      commit: async records => { check(); const result = await native.cloudKit.commit({ scope, records, deletedIDs: [] }); check(); return result; },
      changes: async token => { check(); const result = await native.cloudKit.changes({ scope, token }); check(); return result; },
    };
    this.store = store;
    this.engine = new SessionChatEngine(store, transport, this.options.runtime, this.options.projection, this.options.selectedModels);
    store.queue(cloudRecord("FnSessionHost", {
      protocolVersion: 3, id: store.deviceId, hostId: store.deviceId,
      name: (typeof config.name === "string" ? config.name : hostname()).slice(0, 80), updatedAt: Date.now(),
    }));
    await native.cloudKit.subscribeZone({ scope, id: `fn-chat-v3-host-${this.options.bundleId}-${this.options.mode}` }); check();
    await native.cloudKit.registerPush(); check();
    await this.sync();
  }
  async sync(): Promise<void> {
    if (this.stopped) return;
    if (this.options.accepting?.() === false) {
      if (this.engine) this.scheduleSync();
      return;
    }
    if (!this.engine) { if (!this.connecting) return this.connect(); return; }
    if (this.work) return this.work;
    const epoch = this.epoch, engine = this.engine;
    this.work = engine.sync().then(() => {
      if (epoch !== this.epoch) return;
      this.status = "同步成功"; this.lastSync = Date.now();
    }).catch(async error => {
      if (epoch !== this.epoch) return;
      this.status = error instanceof Error ? error.message : String(error);
      if (errorReason(error) === "accountChanged") await this.isolate();
    }).finally(() => {
      this.work = undefined;
      if (epoch === this.epoch && !this.stopped) {
        this.options.changed(); this.scheduleSync();
      }
    });
    return this.work;
  }
}
