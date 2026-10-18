import { randomUUID } from "node:crypto";
import {
  messageSchema,
  deliverySchema,
  requestStateSchema,
  validateResponse,
  type ChatUserMessage,
  type ChatResponse,
  type Delivery,
  type ChatEventContext,
} from "../../shared/chat/protocol";
import { ChatEngine, cloudRecord, errorReason, canonical } from "./engine";
export interface ChatExecutor {
  chatVersion(pluginId: string): { version: string; timeoutMs: number };
  executeChat(
    event: ChatUserMessage | ChatResponse,
    context: Pick<ChatEventContext, "eventId" | "conversationId" | "signal" | "progress">,
  ): Promise<void>;
}
export class ChatRunner {
  private running = new Map<string, { controller: AbortController; done: Promise<void> }>();
  private scanning = false;
  private stopped = false;
  constructor(
    private engine: ChatEngine,
    private executor: ChatExecutor,
    private changed: () => void = () => {},
    private now = Date.now,
  ) {}
  stop() {
    this.stopped = true;
    for (const r of this.running.values()) r.controller.abort(new Error("宿主退出或账号变化"));
  }
  busy() {
    return this.running.size > 0;
  }
  async settled() {
    await Promise.all([...this.running.values()].map((r) => r.done));
  }
  async scan() {
    if (this.scanning || this.stopped) return;
    this.scanning = true;
    try {
      const events = this.engine
        .messages()
        .filter(
          (m): m is ChatUserMessage | ChatResponse =>
            (m.kind === "userText" || m.kind === "response") &&
            m.hostId === this.engine.store.deviceId,
        );
      const handled = new Set<string>();
      for (const event of events) {
        if (this.stopped) return;
        if (this.running.has(event.conversationId) || handled.has(event.conversationId)) continue;
        const record = await this.engine.transport.read("delivery:" + event.id);
        if (this.stopped) return;
        const remote = record && deliverySchema.parse(JSON.parse(record.fields.payload!));
        if (remote && remote.status !== "running") continue;
        const local = this.engine.store.executions().find((e) => e.requestId === event.id);
        if (local?.result) {
          await this.publish(JSON.parse(local.result));
          continue;
        }
        if (local || remote) {
          const outcome: Delivery = {
            protocolVersion: 2,
            eventId: event.id,
            hostId: event.hostId,
            pluginId: event.pluginId,
            conversationId: event.conversationId,
            attemptId: remote?.attemptId ?? local!.attemptId,
            status: "interrupted",
            error: "执行中断，结果待确认；不会自动重试",
            updatedAt: this.now(),
          };
          this.engine.store.claimExecution(event.id, outcome.attemptId);
          this.engine.store.finishExecution(event.id, "interrupted", outcome);
          await this.publish(outcome);
          continue;
        }
        const original = await this.engine.transport.read("message:" + event.id);
        if (!original || canonical(JSON.parse(original.fields.payload!)) !== canonical(event))
          continue;
        const attemptId = randomUUID();
        // Persist the attempt before claiming remotely. A lost acknowledgement must not replay effects.
        if (!this.engine.store.claimExecution(event.id, attemptId)) continue;
        const claimed: Delivery = {
          protocolVersion: 2,
          eventId: event.id,
          hostId: event.hostId,
          pluginId: event.pluginId,
          conversationId: event.conversationId,
          attemptId,
          status: "running",
          updatedAt: this.now(),
        };
        try {
          const saved = await this.engine.transport.commit([
            cloudRecord("FnChatDelivery", claimed),
          ]);
          this.engine.store.acknowledge("", saved);
        } catch (e) {
          if (errorReason(e) === "serverRecordChanged") continue;
          throw e;
        }
        if (this.stopped) return;
        handled.add(event.conversationId);
        const controller = new AbortController();
        const done = this.run(event, claimed, controller)
          .catch(() => {})
          .finally(() => {
            this.running.delete(event.conversationId);
            this.changed();
          });
        this.running.set(event.conversationId, { controller, done });
      }
    } finally {
      this.scanning = false;
    }
  }
  private async publish(outcome: Delivery) {
    if (this.stopped) return;
    const previous = await this.engine.transport.read("delivery:" + outcome.eventId);
    if (this.stopped) return;
    const current = previous && deliverySchema.parse(JSON.parse(previous.fields.payload!));
    if (current && (current.attemptId !== outcome.attemptId || current.status !== "running"))
      return;
    const saved = await this.engine.transport.commit([
      cloudRecord("FnChatDelivery", outcome, previous),
    ]);
    if (!this.stopped) {
      this.engine.store.acknowledge("", saved);
      this.changed();
    }
  }
  private async run(
    event: ChatUserMessage | ChatResponse,
    claimed: Delivery,
    controller: AbortController,
  ) {
    let timer: ReturnType<typeof setTimeout> | undefined,
      handler: Promise<void> | undefined,
      outcome: Delivery;
    try {
      const declaration = this.executor.chatVersion(event.pluginId);
      if (declaration.version !== event.botVersion) throw new Error("插件版本已改变，请重新发送");
      if (event.kind === "response") {
        const rr = await this.engine.transport.read("message:" + event.requestId),
          sr = await this.engine.transport.read("state:" + event.requestId);
        const req = rr && messageSchema.parse(JSON.parse(rr.fields.payload!)),
          state = sr && requestStateSchema.parse(JSON.parse(sr.fields.payload!));
        if (
          !req ||
          req.kind !== "request" ||
          req.conversationId !== event.conversationId ||
          req.botVersion !== event.botVersion ||
          req.expiresAt <= this.now() ||
          state?.phase !== "responded" ||
          state.responseId !== event.id
        )
          throw new Error("卡片请求已失效或回复未生效");
        validateResponse(req.card, event.actionId, event.values);
      }
      controller.signal.throwIfAborted();
      const abort = new Promise<never>((_, reject) =>
        controller.signal.addEventListener("abort", () => reject(controller.signal.reason), {
          once: true,
        }),
      );
      timer = setTimeout(
        () => controller.abort(new Error("处理超时；外部副作用可能已发生")),
        declaration.timeoutMs,
      );
      handler = this.executor.executeChat(event, {
        eventId: event.id,
        conversationId: event.conversationId,
        signal: controller.signal,
        progress: async (text) => {
          controller.signal.throwIfAborted();
          if (this.stopped || text.length > 512) throw new Error("状态更新不可用或过长");
          const r = await this.engine.transport.read("delivery:" + event.id);
          controller.signal.throwIfAborted();
          if (!r) throw new Error("处理状态丢失");
          const d = deliverySchema.parse(JSON.parse(r.fields.payload!));
          if (d.attemptId !== claimed.attemptId || d.status !== "running")
            throw new Error("处理已结束");
          const saved = await this.engine.transport.commit([
            cloudRecord("FnChatDelivery", { ...d, progress: text, updatedAt: this.now() }, r),
          ]);
          if (!this.stopped) {
            this.engine.store.acknowledge("", saved);
            this.changed();
          }
        },
      });
      await Promise.race([handler, abort]);
      outcome = { ...claimed, status: "completed", updatedAt: this.now() };
    } catch (e) {
      outcome = {
        ...claimed,
        status: this.stopped ? "interrupted" : "failed",
        updatedAt: this.now(),
        error: String(e instanceof Error ? e.message : e).slice(0, 1024),
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
    this.engine.store.finishExecution(
      event.id,
      outcome.status as "completed" | "failed" | "interrupted",
      outcome,
    );
    try {
      await this.publish(outcome);
    } finally {
      await handler?.catch(() => {});
    }
  }
}
