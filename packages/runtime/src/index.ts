import { cardSchema, cardValuesSchema, sessionCardSchema, validateResponse, type ApplicationCards, type CardResponse, type SessionCard } from "./card-contract.ts";
import { Context, Service, type Fiber } from "@deepseek-ai/cordis";
import AgentRegistry, { type Agent, type AgentHandle } from "@deepseek-ai/dsh-agent";
import AgentLoop from "@deepseek-ai/dsh-agent-loop";
import LlmRuntime, { freezeMessage, MessageId } from "@deepseek-ai/dsh-llm";
import * as LlmRetry from "@deepseek-ai/dsh-llm-retry";
import SessionStore, { SessionId, type SessionEvent } from "@deepseek-ai/dsh-session";
import SessionProjectionRegistry from "@deepseek-ai/dsh-session-projection";
import * as CheckpointPolicy from "@deepseek-ai/dsh-session-checkpoint-policy";
import SystemPrompt from "@deepseek-ai/dsh-system-prompt";
import ToolRuntime from "@deepseek-ai/dsh-tools";
import ApprovalService from "@deepseek-ai/dsh-user-approval";
import { bindScopeParent, createScope, scopeOf, type Scope } from "@deepseek-ai/dsh-scope";
import { mkdir } from "node:fs/promises";
import { join, isAbsolute } from "node:path";
import { ConnectionService } from "./connections.ts";
import SqliteSessionPersistence from "./persistence.ts";
import { RuntimeStore } from "./store.ts";
import { registerBunTools, type BunToolsOptions } from "./tools.ts";
import type {
  ApplicationInfo, ApplicationLoad, ApplicationRuntime, ChatEndpoint, CreateSession,
  Json, RuntimeChange, SessionInfo, SessionPage,
} from "./types.ts";

export * from "./types.ts";
export * from "./projection.ts";
export { ConnectionService } from "./connections.ts";
export type { AssistantStreamFrame } from "@deepseek-ai/dsh-agent";

interface AppSlot {
  owner: Fiber;
  scope: Scope;
  definition: ApplicationLoad;
  info: ApplicationInfo;
  methods: Map<string, (input: Json) => Json | Promise<Json>>;
  chats: Map<string, ChatEndpoint>;
  cardActions: Map<string, (response: CardResponse) => void | Promise<void>>;
  operations: Set<Promise<unknown>>;
}
export interface RuntimeOptions {
  /** An exclusive, new architecture data directory, never the legacy fn data root. */
  dataDirectory: string;
  changed?: (event: RuntimeChange) => void;
  tools?: Pick<BunToolsOptions, "web" | "openURL">;
}
export interface PendingApproval {
  id: string;
  sessionId: string;
  toolName: string;
  reason?: string;
}
class ApplicationService extends Service implements ApplicationRuntime {
  readonly info: ApplicationRuntime["info"];
  readonly kv: ApplicationRuntime["kv"];
  constructor(ctx: Context, private config: { host: FnRuntime; slot: AppSlot }) {
    super(ctx, "app");
    this.info = Object.freeze({ ...config.slot.definition.manifest });
    this.kv = config.host.store.kv(this.info.id);
  }
  get cards(): ApplicationCards {
    const ctx = this.ctx, config = this.config;
    return {
      action: (name, handler) => {
        if (!/^[a-z][a-zA-Z0-9_.-]{0,99}$/.test(name) || config.slot.cardActions.has(name)) throw new Error("Invalid or duplicate card action");
        return ctx.effect(() => { config.slot.cardActions.set(name, handler); return () => { if (config.slot.cardActions.get(name) === handler) config.slot.cardActions.delete(name); }; });
      },
      create: (sessionId, input) => config.host.createCard(this.info.id, sessionId, input),
      cancel: id => config.host.cancelCard(this.info.id, id),
    };
  }
  method(name: string, handler: (input: Json) => Json | Promise<Json>): () => void {
    if (!/^[a-z][a-zA-Z0-9_.-]{0,99}$/.test(name)) throw new Error("Invalid application method name");
    const methods = this.config.slot.methods;
    if (methods.has(name)) throw new Error(`Method ${name} is already registered`);
    return this.ctx.effect(() => {
      methods.set(name, handler);
      return () => { if (methods.get(name) === handler) methods.delete(name); };
    });
  }
  chat(endpoint: ChatEndpoint): () => void {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(endpoint.id)) throw new Error("Invalid chat endpoint id");
    const chats = this.config.slot.chats;
    if (chats.has(endpoint.id)) throw new Error(`Chat endpoint ${endpoint.id} is already registered`);
    return this.ctx.effect(() => {
      chats.set(endpoint.id, Object.freeze({ ...endpoint }));
      return () => { chats.delete(endpoint.id); };
    });
  }
  useTools(names: string[]): () => void {
    const host = this.config.host;
    return registerBunTools(this.ctx, {
      ...host.options.tools, names,
      workingDirectory: agent => agent ? host.session(agent.id).cwd : undefined,
      policy: agent => agent ? host.session(agent.id).policy : "controlled",
    });
  }
  createSession(input: Omit<CreateSession, "appId">) {
    return this.config.host.createSession({ ...input, appId: this.info.id });
  }
  send(sessionId: string, text: string, requestId?: string) {
    this.config.host.assertOwner(this.info.id, sessionId);
    return this.config.host.send(sessionId, text, requestId);
  }
  agent(sessionId: string) {
    this.config.host.assertOwner(this.info.id, sessionId);
    return this.config.host.agent(sessionId);
  }
}

/** One process, one upstream kernel. Product state is separate from canonical Session events. */
export class FnRuntime {
  readonly ctx = new Context();
  readonly store: RuntimeStore;
  readonly epoch = crypto.randomUUID();
  private readonly apps = new Map<string, AppSlot>();
  private readonly handles = new Map<string, AgentHandle>();
  private readonly loading = new Map<string, Promise<Agent>>();
  private readonly sending = new Map<string, Promise<unknown>>();
  private readonly unloading = new Map<string, Promise<void>>();
  private readonly enabling = new Map<string, Promise<ApplicationInfo>>();
  private readonly approvals = new Map<string, { info: PendingApproval; settle: (allow: boolean) => void }>();
  private stopping = false;
  private accepting = true;
  private constructor(readonly options: RuntimeOptions) {
    this.store = new RuntimeStore(join(options.dataDirectory, "applications.sqlite"));
  }
  static async open(options: RuntimeOptions): Promise<FnRuntime> {
    await mkdir(options.dataDirectory, { recursive: true, mode: 0o700 });
    const host = new FnRuntime(options);
    try { await host.initialize(); return host; }
    catch (error) { await host.close().catch(() => {}); throw error; }
  }
  get connections(): ConnectionService { return this.ctx.connections; }
  private async initialize() {
    const ctx = this.ctx;
    await ctx.plugin(LlmRuntime);
    await ctx.plugin(SessionStore);
    await ctx.plugin(SessionProjectionRegistry);
    await ctx.plugin(SystemPrompt, {});
    await ctx.plugin(ToolRuntime, {});
    await ctx.plugin(AgentRegistry);
    await ctx.plugin(ApprovalService, {});
    await ctx.plugin(SqliteSessionPersistence, { path: join(this.options.dataDirectory, "sessions.sqlite") });
    await ctx.plugin(ConnectionService, {
      dataDirectory: join(this.options.dataDirectory, "connections"),
      isSessionBusy: (id: string) => this.handles.get(id)?.agent.status === "running",
    });
    await ctx.plugin(AgentLoop, { agents: [] });
    await ctx.plugin(CheckpointPolicy);
    await ctx.plugin(LlmRetry, {});
    ctx.on("session/event", (session) => this.notify({ kind: "session", sessionId: session.id }));
    ctx.on("agent/status", ({ agent }) => {
      const value = this.store.session(agent.id);
      if (value) this.store.putSession({ ...value, updatedAt: Date.now() });
      this.notify({ kind: "session", sessionId: agent.id });
    });
    ctx.on("agent/assistant-stream", ({ agent, frame }) => this.notify({ kind: "stream", sessionId: agent.id, data: frame }));
    ctx.on("approval/request", (request) => new Promise((resolve) => {
      const id = crypto.randomUUID();
      const finish = (allow: boolean) => {
        request.signal?.removeEventListener("abort", cancel);
        this.approvals.delete(id);
        this.notify({ kind: "approval", sessionId: request.agent.id });
        resolve(request.signal?.aborted ? "cancelled" : allow ? "allowed-once" : "rejected");
      };
      const cancel = () => finish(false);
      if (request.signal?.aborted) { resolve("cancelled"); return; }
      this.approvals.set(id, {
        info: { id, sessionId: request.agent.id, toolName: request.toolName, reason: request.reason },
        settle: finish,
      });
      request.signal?.addEventListener("abort", cancel, { once: true });
      this.notify({ kind: "approval", sessionId: request.agent.id });
    }));
  }
  private notify(event: RuntimeChange) {
    try { this.options.changed?.(event); } catch (error) { console.warn("Runtime observer failed", error); }
  }
  private assertRunning() {
    if (this.stopping || !this.accepting) throw new Error("Runtime is stopping");
  }
  setAccepting(accepting: boolean) { this.accepting = accepting; }
  async load(definition: ApplicationLoad, enabled = true): Promise<ApplicationInfo> {
    this.assertRunning();
    const { manifest } = definition;
    if (!/^[a-z][a-z0-9-]{0,99}$/.test(manifest.id)) throw new Error("Invalid application id");
    if (this.apps.has(manifest.id)) throw new Error(`Application ${manifest.id} already loaded`);
    let scope!: Scope;
    const owner = await this.ctx.inject(["agents", "tools", "systemPrompt"], (ctx) => {
      scope = createScope(ctx, {});
    });
    const slot: AppSlot = {
      definition, scope, owner, methods: new Map(), chats: new Map(), cardActions: new Map(), operations: new Set(),
      info: { ...manifest, enabled: true, status: "active", methods: [], chats: [] },
    };
    this.apps.set(manifest.id, slot);
    if (!enabled) {
      slot.info.enabled = false;
      slot.info.status = "disabled";
      return this.application(manifest.id);
    }
    try {
      const appCtx = scope.ctx.isolate("app");
      await appCtx.plugin(ApplicationService, { host: this, slot });
      await appCtx.plugin(definition.plugin, definition.config ?? {});
    } catch (error) {
      await owner.dispose();
      slot.info.status = "error";
      slot.info.error = String(error);
    }
    this.notify({ kind: "applications", appId: manifest.id });
    return this.application(manifest.id);
  }
  application(id: string): ApplicationInfo {
    const slot = this.apps.get(id);
    if (!slot) throw new Error(`Unknown application ${id}`);
    return { ...slot.info, methods: [...slot.methods.keys()], chats: [...slot.chats.values()] };
  }
  applications(): ApplicationInfo[] { return [...this.apps.keys()].map(id => this.application(id)); }
  private activeApp(id: string): AppSlot {
    const slot = this.apps.get(id);
    if (!slot || slot.info.status !== "active") throw new Error(`Application ${id} is unavailable`);
    return slot;
  }
  async unload(appId: string): Promise<void> {
    const pending = this.unloading.get(appId);
    if (pending) return pending;
    const slot = this.apps.get(appId);
    if (!slot) return;
    slot.info.enabled = false;
    slot.info.status = "disabled";
    const operation = Promise.resolve().then(async () => {
      // Publication is disabled first, then creations and owned work drain.
      await Promise.allSettled([...this.loading.values()]);
      for (const [id, handle] of this.handles) {
        if (this.store.session(id)?.appId === appId) handle.agent.cancel({ kind: "disposed" });
      }
      await Promise.allSettled([...slot.operations]);
      for (const [id, handle] of this.handles) {
        if (this.store.session(id)?.appId !== appId) continue;
        await handle.dispose();
        this.handles.delete(id);
      }
      await slot.owner.dispose();
      this.notify({ kind: "applications", appId });
    });
    this.unloading.set(appId, operation);
    try { await operation; }
    finally { if (this.unloading.get(appId) === operation) this.unloading.delete(appId); }
  }
  async enable(appId: string): Promise<ApplicationInfo> {
    const pending = this.enabling.get(appId);
    if (pending) return pending;
    const operation = Promise.resolve().then(async () => {
      await this.unloading.get(appId);
      const slot = this.apps.get(appId);
      if (!slot) throw new Error("Unknown application");
      if (slot.info.status === "active") return this.application(appId);
      this.apps.delete(appId);
      return this.load(slot.definition);
    });
    this.enabling.set(appId, operation);
    try { return await operation; }
    finally { if (this.enabling.get(appId) === operation) this.enabling.delete(appId); }
  }
  async invoke(appId: string, method: string, input: Json): Promise<Json> {
    this.assertRunning();
    const slot = this.activeApp(appId);
    const handler = slot.methods.get(method);
    if (!handler) throw new Error("Unknown application method");
    const operation = Promise.resolve().then(() => handler(input));
    slot.operations.add(operation);
    try { return await operation; } finally { slot.operations.delete(operation); }
  }
  createCard(appId: string, sessionId: string, input: Parameters<ApplicationCards["create"]>[1]): SessionCard {
    this.assertRunning(); this.activeApp(appId); this.assertOwner(appId, sessionId);
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(input.key)) throw new Error("Invalid card key");
    if (!this.activeApp(appId).cardActions.has(input.handler)) throw new Error("Card action handler is unavailable");
    const card = cardSchema.parse(input.card);
    if (Buffer.byteLength(JSON.stringify(card)) > 65536) throw new Error("Card exceeds 64 KiB");
    const previous = this.store.cards(sessionId).find(value => value.key === input.key);
    if (previous) {
      if (previous.handler !== input.handler || JSON.stringify(previous.card) !== JSON.stringify(card) || (input.expiresAt !== undefined && input.expiresAt !== previous.expiresAt)) throw new Error("Card key reused for a different request");
      return this.cards(sessionId).find(value => value.id === previous.id)!;
    }
    const createdAt = Date.now(), expiresAt = input.expiresAt ?? createdAt + 86400000;
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= createdAt || expiresAt > createdAt + 30 * 86400000) throw new Error("Invalid card expiry");
    const value = { id: crypto.randomUUID(), sessionId, createdAt, expiresAt, state: "pending" as const, card };
    this.store.putCard({ ...value, appId, key: input.key, handler: input.handler });
    this.notify({ kind: "session", sessionId, appId }); return value;
  }
  cards(sessionId: string): SessionCard[] {
    this.session(sessionId);
    return this.store.cards(sessionId).map(value => {
      if (value.state === "pending" && value.expiresAt <= Date.now()) {
        value.state = "expired"; this.store.putCard(value, "pending");
      }
      const { appId: _app, handler: _handler, key: _key, ...publicValue } = value;
      return sessionCardSchema.parse(publicValue);
    });
  }
  cancelCard(appId: string, id: string) {
    this.assertRunning(); this.activeApp(appId);
    const value = this.store.card(id);
    if (!value || value.appId !== appId) throw new Error("Card does not belong to this application");
    if (!this.store.putCard({ ...value, state: "cancelled" }, "pending")) throw new Error("Card is no longer pending");
    this.notify({ kind: "session", sessionId: value.sessionId, appId });
  }
  async respondCard(sessionId: string, id: string, actionId: string, input: CardResponse["values"]): Promise<void> {
    this.assertRunning();
    const value = this.store.card(id);
    if (!value || value.sessionId !== sessionId) throw new Error("Card does not belong to this Session");
    const slot = this.activeApp(value.appId), handler = slot.cardActions.get(value.handler);
    if (!handler) throw new Error("Card action handler is unavailable");
    if (value.state !== "pending" || value.expiresAt <= Date.now()) throw new Error("Card was answered, cancelled or expired");
    const values = cardValuesSchema.parse(input);
    if (Buffer.byteLength(JSON.stringify(values)) > 32768) throw new Error("Card response exceeds 32 KiB");
    validateResponse(value.card, actionId, values);
    value.answer = { actionId, values }; value.state = "running";
    if (!this.store.putCard(value, "pending")) throw new Error("Card was already answered");
    this.notify({ kind: "session", sessionId, appId: value.appId });
    const operation = Promise.resolve().then(() => handler({ sessionId, cardId: id, actionId, values }));
    slot.operations.add(operation);
    try { await operation; value.state = "completed"; }
    catch (error) { value.state = "failed"; value.error = "Application card action failed; it will not be replayed."; throw error; }
    finally {
      try { this.store.putCard(value, "running"); this.notify({ kind: "session", sessionId, appId: value.appId }); }
      finally { slot.operations.delete(operation); }
    }
  }
  assertOwner(appId: string, sessionId: string): void {
    if (this.store.session(sessionId)?.appId !== appId) throw new Error("Session does not belong to this application");
  }
  async createSession(input: CreateSession): Promise<SessionInfo> {
    this.assertRunning();
    const slot = this.activeApp(input.appId);
    if (input.cwd !== undefined && !isAbsolute(input.cwd)) throw new Error("Session working directory must be absolute");
    if (input.endpointId && !slot.chats.has(input.endpointId)) throw new Error("Unknown Chat endpoint");
    await this.connections.resolveModel(input.connectionId, input.modelId);
    const id = crypto.randomUUID();
    const value: SessionInfo = {
      ...input, id, title: input.title || "新会话", policy: input.policy ?? "controlled",
      createdAt: Date.now(), updatedAt: Date.now(), archived: false, status: "unloaded",
    };
    await this.connections.bindSession(id, input.connectionId);
    this.store.putSession(value);
    try {
      const agent = await this.attach(value, false);
      await this.ctx.sessions.flush(agent.session);
      return this.session(id);
    } catch (error) {
      const handle = this.handles.get(id);
      await handle?.dispose();
      this.handles.delete(id);
      this.store.deleteSessionMetadata(id);
      throw error;
    }
  }
  session(id: string): SessionInfo {
    const value = this.store.session(id);
    if (!value) throw new Error("Unknown session");
    return { ...value, status: this.handles.get(id)?.agent.status ?? "unloaded" };
  }
  sessions(appId?: string): SessionInfo[] {
    return this.store.sessions(appId).map(value => this.session(value.id));
  }
  async agent(id: string): Promise<Agent> {
    this.assertRunning();
    const existing = this.handles.get(id)?.agent;
    if (existing) return existing;
    const pending = this.loading.get(id);
    if (pending) return pending;
    const task = this.attach(this.session(id), true);
    this.loading.set(id, task);
    try { return await task; } finally { this.loading.delete(id); }
  }
  private async attach(value: SessionInfo, resume: boolean): Promise<Agent> {
    const slot = this.activeApp(value.appId);
    const connection = this.connections.get(value.connectionId);
    const options = {
      agentOptions: { provider: connection.provider, model: value.modelId },
      setup: (ctx: Context) => {
        bindScopeParent(scopeOf(ctx)!, scopeOf(slot.scope.ctx)!);
        const endpoint = value.endpointId ? slot.chats.get(value.endpointId) : undefined;
        if (endpoint?.systemPrompt) ctx.systemPrompt.section({ name: "fn-chat", order: 100, text: endpoint.systemPrompt, interpolate: false });
        return { commit: () => { this.assertRunning(); this.activeApp(value.appId); } };
      },
    };
    const handle = resume
      ? await slot.scope.ctx.agents.resume({ ...options, resumeSessionId: SessionId(value.id) })
      : await slot.scope.ctx.agents.create({ ...options, sessionId: SessionId(value.id), meta: value.cwd ? { cwd: value.cwd } : {} });
    this.handles.set(value.id, handle);
    return handle.agent;
  }
  async send(id: string, text: string, requestId: string = crypto.randomUUID()): Promise<SessionInfo> {
    if (!text.trim() || Buffer.byteLength(text) > 256 * 1024) throw new Error("Input must contain 1–262144 bytes");
    this.assertRunning();
    const prior = this.sending.get(id) ?? Promise.resolve();
    const operation = prior.catch(() => {}).then(async () => {
      const agent = await this.agent(id);
      const pending = this.store.enqueue(requestId, id, text);
      if (pending.state === "admitted") return;
      // A crash may fall between Session flush and the product inbox acknowledgement.
      const seen = agent.session.snapshotEvents().some(event => {
        if (event.type === "user/message") return event.data.id === pending.messageId;
        if (event.type === "agent/inbox/spliced") return event.data.inserted.some(message => message.id === pending.messageId);
        return false;
      });
      if (!seen) agent.send(freezeMessage({
        id: MessageId(pending.messageId), role: "user", source: { kind: "user" },
        content: [{ type: "text", text }],
      }), "next-turn", true);
      // The upstream checkpoint policy blocks model/tool dispatch until intake is durable.
      await this.ctx.sessions.flush(agent.session);
      this.store.admitted(requestId);
    });
    this.sending.set(id, operation);
    try { await operation; return this.session(id); }
    finally { if (this.sending.get(id) === operation) this.sending.delete(id); }
  }
  async events(id: string, offset = 0, limit = 100): Promise<SessionPage> {
    this.session(id);
    if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Invalid event offset");
    const handle = await this.ctx.sessionPersistence.open(SessionId(id), "read");
    try {
      const { events } = await handle.read(offset, Math.min(100, Math.max(1, limit)) + 1);
      const page: SessionEvent[] = [];
      let bytes = 0;
      for (const event of events.slice(0, limit)) {
        const size = Buffer.byteLength(JSON.stringify(event));
        if (page.length && bytes + size > 512 * 1024) break;
        page.push(event); bytes += size;
      }
      return { events: page, nextOffset: offset + page.length, hasMore: events.length > page.length };
    } finally { await handle.close(); }
  }
  async cancel(id: string): Promise<void> {
    const agent = this.handles.get(id)?.agent;
    if (agent) { agent.cancel({ kind: "user" }); await agent.whenIdle(); }
  }
  async setModel(id: string, modelId: string): Promise<SessionInfo> {
    const value = this.session(id);
    const agent = await this.agent(id);
    if (agent.status !== "idle") throw new Error("Change models between turns");
    await this.connections.resolveModel(value.connectionId, modelId);
    agent.options.model = modelId;
    this.store.putSession({ ...value, modelId, updatedAt: Date.now() });
    return this.session(id);
  }
  archive(id: string, archived: boolean): SessionInfo {
    const value = this.session(id);
    this.store.putSession({ ...value, archived, updatedAt: Date.now() });
    return this.session(id);
  }
  pendingApprovals(): PendingApproval[] { return [...this.approvals.values()].map(value => value.info); }
  answerApproval(id: string, allow: boolean): void {
    const value = this.approvals.get(id);
    if (!value) throw new Error("Approval expired or already answered");
    value.settle(allow);
  }
  busy(): boolean {
    return this.loading.size > 0 || this.sending.size > 0 || this.unloading.size > 0 || this.enabling.size > 0 || this.connections?.isBusy() ||
      [...this.apps.values()].some(slot => slot.operations.size > 0) ||
      [...this.handles.values()].some(handle => handle.agent.status === "running");
  }
  async close(): Promise<void> {
    if (this.stopping) return;
    this.stopping = true;
    for (const approval of this.approvals.values()) approval.settle(false);
    for (const handle of this.handles.values()) handle.agent.cancel({ kind: "disposed" }, { keepInbox: true });
    await Promise.allSettled([...this.loading.values(), ...this.sending.values()]);
    await Promise.allSettled([...this.unloading.values()]);
    await Promise.allSettled([...this.enabling.values()]);
    const results: PromiseSettledResult<unknown>[] = await Promise.allSettled([...this.handles.values()].map(handle => handle.dispose()));
    results.push(...await Promise.allSettled([...this.apps.values()].flatMap(slot => [...slot.operations])));
    results.push(...await Promise.allSettled([Promise.resolve().then(() => this.ctx.get("sessionPersistence")?.flush())]));
    results.push(...await Promise.allSettled([this.ctx.fiber.dispose()]));
    this.store.close();
    const failures = results.filter(result => result.status === "rejected");
    if (failures.length) throw new AggregateError(failures.map(result => result.reason), "Agent shutdown failed");
  }
}
