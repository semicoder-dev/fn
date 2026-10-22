import { Service, type Context } from "@deepseek-ai/cordis";
import type { Agent, AgentHandle } from "@deepseek-ai/dsh-agent";
import { freezeMessage, MessageId } from "@deepseek-ai/dsh-llm";
import { SessionId, type SessionEvent } from "@deepseek-ai/dsh-session";
import { bindScopeParent, createScope, scopeOf } from "@deepseek-ai/dsh-scope";
import { join, isAbsolute } from "node:path";
import type {} from "@semicoder/fn-host";
import type {} from "@semicoder/fn-activity";
import type {} from "@semicoder/fn-connections/service";
import { SessionMetadata } from "./store.ts";
import type {
  SessionInfo,
  CreateSession,
  SessionPage,
  SessionTarget,
  TargetBinding,
  SessionChange,
  PendingApproval,
} from "./types.ts";

/** Session ownership and commands, independent of package loading and UI. */
export default class SessionController extends Service {
  static inject = [
    "agents",
    "agentLoop",
    "sessions",
    "sessionPersistence",
    "connections",
    "activity",
    "tools",
    "systemPrompt",
  ];
  readonly store: SessionMetadata;
  private readonly targets = new Map<string, TargetBinding>();
  private readonly handles = new Map<string, AgentHandle>();
  private readonly loading = new Map<string, Promise<Agent>>();
  private readonly sending = new Map<string, Promise<unknown>>();
  private readonly approvals = new Map<
    string,
    { info: PendingApproval; settle: (allow: boolean) => void }
  >();
  private stopping = false;
  constructor(ctx: Context) {
    super(ctx, "sessionController");
    this.store = new SessionMetadata(join(ctx.host.dataDirectory, "sessions", "metadata.sqlite"));
  }
  async *[Service.init]() {
    yield () => this.stop();
    this.ctx.activity.watch(() => this.busy());
    this.ctx.on("session/event", (session) =>
      this.notify({ kind: "session", sessionId: session.id }),
    );
    this.ctx.on("agent/status", ({ agent }) => {
      const value = this.store.session(agent.id);
      if (value) this.store.putSession({ ...value, updatedAt: Date.now() });
      this.notify({ kind: "session", sessionId: agent.id });
    });
    this.ctx.on("agent/assistant-stream", ({ agent, frame }) =>
      this.notify({ kind: "stream", sessionId: agent.id, data: frame }),
    );
    this.ctx.on(
      "approval/request",
      (request) =>
        new Promise((resolve) => {
          const id = crypto.randomUUID();
          let settled = false;
          const finish = (allow: boolean) => {
            if (settled) return;
            settled = true;
            request.signal?.removeEventListener("abort", cancel);
            this.approvals.delete(id);
            this.notify({ kind: "approval", sessionId: request.agent.id });
            resolve(request.signal?.aborted ? "cancelled" : allow ? "allowed-once" : "rejected");
          };
          const cancel = () => finish(false);
          if (request.signal?.aborted) {
            resolve("cancelled");
            return;
          }
          this.approvals.set(id, {
            info: {
              id,
              sessionId: request.agent.id,
              toolName: request.toolName,
              reason: request.reason,
            },
            settle: finish,
          });
          request.signal?.addEventListener("abort", cancel, { once: true });
          this.notify({ kind: "approval", sessionId: request.agent.id });
        }),
    );
  }
  registerTarget(definition: SessionTarget): TargetBinding {
    this.assertRunning();
    if (!/^[a-z][a-z0-9-]{0,99}$/.test(definition.id) || this.targets.has(definition.id))
      throw new Error("Invalid or duplicate Session target");
    const scope = createScope(this.ctx, {});
    const binding = Object.freeze({ ...definition, scope, context: scope.ctx });
    this.ctx.effect(() => {
      this.targets.set(definition.id, binding);
      this.notify({ kind: "targets", targetId: definition.id });
      return async () => {
        this.targets.delete(definition.id);
        for (const [id, handle] of this.handles)
          if (this.store.session(id)?.targetId === definition.id)
            handle.agent.cancel({ kind: "disposed" });
        await Promise.allSettled(
          [...this.loading, ...this.sending]
            .filter(([id]) => this.store.session(id)?.targetId === definition.id)
            .map(([, task]) => task),
        );
        for (const [id, handle] of this.handles)
          if (this.store.session(id)?.targetId === definition.id) {
            await handle.dispose();
            this.handles.delete(id);
          }
        await scope.dispose();
        this.notify({ kind: "targets", targetId: definition.id });
      };
    });
    return binding;
  }
  listTargets(): SessionTarget[] {
    return [...this.targets.values()].map(({ id, name, systemPrompt }) => ({
      id,
      name,
      systemPrompt,
    }));
  }
  target(id: string): TargetBinding {
    const target = this.targets.get(id);
    if (!target) throw new Error(`Session target is unavailable: ${id}`);
    return target;
  }
  private notify(event: SessionChange) {
    this.ctx.emit("fn/session-change", event);
  }
  private assertRunning() {
    if (this.stopping) throw new Error("Session service is stopping");
    this.ctx.activity.assertAccepting();
  }
  createSession(input: CreateSession): Promise<SessionInfo> {
    return this.ctx.activity.run(() => this.create(input));
  }
  private async create(input: CreateSession): Promise<SessionInfo> {
    this.assertRunning();
    this.target(input.targetId);
    if (input.cwd !== undefined && !isAbsolute(input.cwd))
      throw new Error("Session working directory must be absolute");
    await this.ctx.connections.resolveModel(input.connectionId, input.modelId);
    const id = crypto.randomUUID();
    const value: SessionInfo = {
      ...input,
      id,
      title: input.title || "新会话",
      policy: input.policy ?? "controlled",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
      status: "unloaded",
    };
    await this.ctx.connections.bindSession(id, input.connectionId);
    try {
      this.store.putSession(value);
      const agent = await this.attach(value, false);
      await this.ctx.sessions.flush(agent.session);
      return this.session(id);
    } catch (error) {
      const handle = this.handles.get(id);
      await handle?.dispose();
      this.handles.delete(id);
      this.store.deleteSessionMetadata(id);
      await this.ctx.connections.releaseFailedSession(id);
      throw error;
    }
  }
  session(id: string): SessionInfo {
    const value = this.store.session(id);
    if (!value) throw new Error("Unknown session");
    return { ...value, status: this.handles.get(id)?.agent.status ?? "unloaded" };
  }
  sessions(targetId?: string): SessionInfo[] {
    return this.store.sessions(targetId).map((value) => this.session(value.id));
  }
  async agent(id: string): Promise<Agent> {
    this.assertRunning();
    const existing = this.handles.get(id)?.agent;
    if (existing) return existing;
    const pending = this.loading.get(id);
    if (pending) return pending;
    const task = this.attach(this.session(id), true);
    this.loading.set(id, task);
    try {
      return await task;
    } finally {
      this.loading.delete(id);
    }
  }
  private async attach(value: SessionInfo, resume: boolean): Promise<Agent> {
    const slot = this.target(value.targetId);
    const connection = this.ctx.connections.get(value.connectionId);
    const options = {
      agentOptions: { provider: connection.provider, model: value.modelId },
      setup: (ctx: Context) => {
        bindScopeParent(scopeOf(ctx)!, scopeOf(slot.scope.ctx)!);
        if (slot.systemPrompt)
          ctx.systemPrompt.section({
            name: "fn-target",
            order: 100,
            text: slot.systemPrompt,
            interpolate: false,
          });
        return {
          commit: () => {
            this.assertRunning();
            this.target(value.targetId);
          },
        };
      },
    };
    const handle = resume
      ? await slot.scope.ctx.agents.resume({ ...options, resumeSessionId: SessionId(value.id) })
      : await slot.scope.ctx.agents.create({
          ...options,
          sessionId: SessionId(value.id),
          meta: value.cwd ? { cwd: value.cwd } : {},
        });
    this.handles.set(value.id, handle);
    return handle.agent;
  }
  async send(
    id: string,
    text: string,
    requestId: string = crypto.randomUUID(),
  ): Promise<SessionInfo> {
    if (!text.trim() || Buffer.byteLength(text) > 256 * 1024)
      throw new Error("Input must contain 1–262144 bytes");
    this.assertRunning();
    const prior = this.sending.get(id) ?? Promise.resolve();
    const operation = prior
      .catch(() => {})
      .then(async () => {
        const agent = await this.agent(id);
        const pending = this.store.enqueue(requestId, id, text);
        if (pending.state === "admitted") return;
        // A crash may fall between Session flush and the product inbox acknowledgement.
        const seen = agent.session.snapshotEvents().some((event) => {
          if (event.type === "user/message") return event.data.id === pending.messageId;
          if (event.type === "agent/inbox/spliced")
            return event.data.inserted.some((message) => message.id === pending.messageId);
          return false;
        });
        if (!seen)
          agent.send(
            freezeMessage({
              id: MessageId(pending.messageId),
              role: "user",
              source: { kind: "user" },
              content: [{ type: "text", text }],
            }),
            "next-turn",
            true,
          );
        // The upstream checkpoint policy blocks model/tool dispatch until intake is durable.
        await this.ctx.sessions.flush(agent.session);
        this.store.admitted(requestId);
      });
    this.sending.set(id, operation);
    try {
      await operation;
      return this.session(id);
    } finally {
      if (this.sending.get(id) === operation) this.sending.delete(id);
    }
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
        page.push(event);
        bytes += size;
      }
      return {
        events: page,
        nextOffset: offset + page.length,
        hasMore: events.length > page.length,
      };
    } finally {
      await handle.close();
    }
  }
  async cancel(id: string): Promise<void> {
    const agent = this.handles.get(id)?.agent;
    if (agent) {
      agent.cancel({ kind: "user" });
      await agent.whenIdle();
    }
  }
  setModel(id: string, modelId: string): Promise<SessionInfo> {
    return this.ctx.activity.run(() => this.changeModel(id, modelId));
  }
  private async changeModel(id: string, modelId: string): Promise<SessionInfo> {
    const value = this.session(id);
    const agent = await this.agent(id);
    if (agent.status !== "idle") throw new Error("Change models between turns");
    await this.ctx.connections.resolveModel(value.connectionId, modelId);
    if (agent.status !== "idle") throw new Error("Change models between turns");
    agent.options.model = modelId;
    this.store.putSession({ ...value, modelId, updatedAt: Date.now() });
    return this.session(id);
  }
  archive(id: string, archived: boolean): SessionInfo {
    this.assertRunning();
    const value = this.session(id);
    this.store.putSession({ ...value, archived, updatedAt: Date.now() });
    return this.session(id);
  }
  pendingApprovals(): PendingApproval[] {
    return [...this.approvals.values()].map((value) => value.info);
  }
  answerApproval(id: string, allow: boolean): void {
    const value = this.approvals.get(id);
    if (!value) throw new Error("Approval expired or already answered");
    value.settle(allow);
  }
  busy(): boolean {
    return (
      this.loading.size > 0 ||
      this.sending.size > 0 ||
      [...this.handles.values()].some((handle) => handle.agent.status === "running")
    );
  }
  async stop() {
    if (this.stopping) return;
    this.stopping = true;
    for (const pending of this.approvals.values()) pending.settle(false);
    for (const handle of this.handles.values())
      handle.agent.cancel({ kind: "disposed" }, { keepInbox: true });
    await Promise.allSettled([...this.loading.values(), ...this.sending.values()]);
    const results = await Promise.allSettled(
      [...this.handles.values()].map((handle) => handle.dispose()),
    );
    try {
      await this.ctx.sessionPersistence.flush();
    } finally {
      this.store.close();
    }
    const errors = results.filter((result) => result.status === "rejected");
    if (errors.length)
      throw new AggregateError(
        errors.map((result) => result.reason),
        "Session shutdown failed",
      );
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    sessionController: SessionController;
  }
  interface Events {
    "fn/session-change"(event: SessionChange): void;
  }
}
