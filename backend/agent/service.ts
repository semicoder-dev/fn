import { z } from "@semicoder/fia/api";
import {
  agentCreate,
  agentAssistant,
  agentToolInfo,
  agentToolResult,
  deriveAgentMessages,
  type AgentCreate,
  type AgentSession,
  type AgentEventData,
  type AgentAssistant,
  type AgentTool,
  type AgentClient,
  type AgentChange,
  type AgentToolInfo,
} from "@semicoder/fn-sdk/agent";
import type { Models } from "../models";
import type { WebTools } from "../web";
import { webSearchInput, webFetchInput } from "../../shared/web";
import { AgentJournal } from "./journal";
import { createAgentModel, type AgentModel } from "./model";

type Tool = AgentToolInfo & {
  parse: (input: unknown) => unknown;
  execute: (
    input: unknown,
    signal: AbortSignal,
    sessionId: string,
    callId: string,
  ) => ReturnType<AgentTool["execute"]>;
};
export type PluginAgentTools = Record<string, { definition: AgentTool; execute: Tool["execute"] }>;
type Slot = {
  session: AgentSession;
  partial: AgentAssistant | null;
  controller: AbortController;
  done: Promise<void>;
};
const errorText = (error: unknown) =>
  (error instanceof Error ? error.message : "Agent 运行失败").slice(0, 600);
const outputSchema = z.strictObject({
  content: agentToolResult.shape.content,
  isError: z.boolean().optional(),
  meta: z.json().optional(),
});

export class Agents {
  readonly journal: AgentJournal;
  private active = new Map<string, Slot>();
  private listeners = new Set<(change: AgentChange) => void>();
  private stopping = false;
  private failures = new Map<string, Slot>();
  constructor(
    directory: string,
    private models: Models,
    private web: WebTools,
    private pluginTools: (pluginId: string) => PluginAgentTools,
    private changed: (change: AgentChange) => void,
    private generate: AgentModel = createAgentModel(),
  ) {
    this.journal = new AgentJournal(directory);
  }
  async open() {
    await this.journal.open();
    for (const session of this.journal.list()) {
      if (["running", "cancelling"].includes(session.status)) {
        const slot: Slot = {
          session,
          partial: null,
          controller: new AbortController(),
          done: Promise.resolve(),
        };
        this.finish(slot, "interrupted", "应用已重新启动；未完成工具不自动重试，结果可能未知。");
      }
    }
  }
  busy(pluginId?: string) {
    return [...this.active.values()].some(
      (slot) => !pluginId || slot.session.pluginId === pluginId,
    );
  }
  private notify(slot: Slot) {
    const change: AgentChange = {
      pluginId: slot.session.pluginId,
      sessionId: slot.session.id,
      seq: slot.session.seq,
      status: slot.session.status,
      revision: slot.session.revision,
    };
    // Notifications cannot invalidate a committed fact or stop a running tool.
    for (const listener of [this.changed, ...this.listeners]) {
      try {
        listener(change);
      } catch (error) {
        console.warn("Agent notification failed", errorText(error));
      }
    }
  }
  private commit(slot: Slot, data: AgentEventData[]) {
    slot.session = this.journal.commit(slot.session, data);
    if (
      !this.active.has(slot.session.id) ||
      ["running", "cancelling"].includes(slot.session.status)
    )
      this.notify(slot);
  }
  private tools(pluginId: string, names: string[], enforceLimit = true): Tool[] {
    const client = this.web.client(pluginId);
    // Models sometimes encode an omitted site filter as whitespace. Accept that
    // at the Agent boundary; keep the public web API's validated contract intact.
    const searchInput = webSearchInput.extend({
      timeRange: z
        .enum(["all", "day", "week", "month", "year"])
        .optional()
        .describe(
          "Use all (or omit) for unrestricted search. A date filter can hide relevant pages; remove it when results are empty and verify dates in the content.",
        ),
      site: z
        .string()
        .trim()
        .max(253)
        .optional()
        .describe(
          "Optional domain filter. Omit or use an empty string to search all sites. Do not invent a domain when none is requested.",
        ),
    });
    const parseSearch = (input: unknown) => {
      const parsed = searchInput.parse(input);
      if (!parsed.site) delete parsed.site;
      return webSearchInput.parse({
        ...parsed,
        timeRange: parsed.timeRange === "all" ? undefined : parsed.timeRange,
      });
    };
    const webTools: Record<string, Tool> = {
      web_search: {
        name: "web_search",
        description:
          "Search the web. Returns sources with URLs and per-engine diagnostics. Source IDs are local to this call. Start without site/timeRange restrictions unless needed. If results are empty, simplify the query and remove filters before concluding there is no information.",
        inputSchema: z.json().parse(z.toJSONSchema(searchInput)),
        parse: parseSearch,
        execute: async (input, signal) => {
          const result = await client.search(parseSearch(input), { signal });
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      },
      web_fetch: {
        name: "web_fetch",
        description:
          "Read a public page as text or Markdown. Does not execute JavaScript or use browser login. Check status, redirects and truncation. HTTP 200 does not guarantee useful content: when a page is only navigation or a dynamic shell, search for a different source or a text/desktop page before giving up.",
        inputSchema: z.json().parse(z.toJSONSchema(webFetchInput)),
        parse: (input) => webFetchInput.parse(input),
        execute: async (input, signal) => {
          const result = await client.fetch(webFetchInput.parse(input), { signal });
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      },
    };
    const custom = this.pluginTools(pluginId);
    const tools = names.map((name) => {
      if (Object.hasOwn(webTools, name)) return webTools[name]!;
      const tool = Object.hasOwn(custom, name) ? custom[name] : undefined;
      if (!tool) throw new Error("工具不存在或未属于当前插件：" + name);
      const info = agentToolInfo.parse({
        name,
        description: tool.definition.description,
        inputSchema: tool.definition.inputSchema,
      });
      if (
        !info.inputSchema ||
        typeof info.inputSchema !== "object" ||
        Array.isArray(info.inputSchema) ||
        info.inputSchema.type !== "object"
      )
        throw new Error("工具参数必须声明为 JSON Schema object：" + name);
      const schema = z.fromJSONSchema(info.inputSchema);
      return { ...info, parse: (input: unknown) => schema.parse(input), execute: tool.execute };
    });
    if (
      enforceLimit &&
      Buffer.byteLength(
        JSON.stringify(
          tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
        ),
      ) >
        64 * 1024
    )
      throw new Error("工具声明总量超过 64 KiB，请减少工具或简化参数");
    return tools;
  }
  create(pluginId: string, input: AgentCreate): AgentSession {
    if (this.stopping) throw new Error("应用正在退出");
    const config = agentCreate.parse(input);
    this.tools(pluginId, config.tools);
    if (!this.models.list().some((model) => model.id === config.modelId && model.configured))
      throw new Error("请先配置可用模型");
    if (this.journal.list(pluginId).length >= 100)
      throw new Error("最多保存 100 个 Agent 会话，请删除不需要的会话");
    const now = Date.now();
    return this.journal.commit(
      {
        ...config,
        id: crypto.randomUUID(),
        pluginId,
        formatVersion: 1,
        status: "idle",
        turn: 0,
        step: 0,
        seq: 0,
        revision: 0,
        error: null,
        createdAt: now,
        updatedAt: now,
      },
      [{ type: "session/create", config }],
    );
  }
  list(pluginId: string) {
    return this.journal.list(pluginId).map((item) => {
      const { system: _system, ...session } = this.get(pluginId, item.id).session;
      return session;
    });
  }
  catalog(pluginId: string) {
    return this.tools(
      pluginId,
      ["web_search", "web_fetch", ...Object.keys(this.pluginTools(pluginId))],
      false,
    ).map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));
  }
  get(pluginId: string, id: string) {
    const session = this.journal.get(pluginId, id);
    const slot = this.active.get(id) ?? this.failures.get(id);
    return structuredClone({
      session: slot?.session ?? session,
      partial: slot?.partial ?? null,
      revision: slot?.session.revision ?? session.revision,
    });
  }
  events(pluginId: string, id: string, after = 0) {
    if (!Number.isSafeInteger(after) || after < 0) throw new Error("无效的事件游标");
    return this.journal.events(pluginId, id, after);
  }
  remove(pluginId: string, id: string) {
    this.journal.get(pluginId, id);
    if (this.active.has(id)) throw new Error("Agent 正在运行，请先停止任务");
    this.journal.remove(pluginId, id);
    this.failures.delete(id);
  }
  send(pluginId: string, id: string, text: string): AgentSession {
    if (this.stopping) throw new Error("应用正在退出");
    const session = this.journal.get(pluginId, id);
    if (this.active.has(id)) throw new Error("此会话正在运行");
    if (this.failures.has(id) || ["running", "cancelling"].includes(session.status))
      throw new Error("会话持久化未完成，请重启应用后核对历史");
    if (!text.trim() || text.length > 16000) throw new Error("消息不能为空或超过 16000 字符");
    if (session.seq > 4000) throw new Error("会话已达到长度上限，请新建会话");
    const tools = this.tools(pluginId, session.tools);
    const lease = this.models.reserveAgent(pluginId, session.modelId);
    const slot: Slot = {
      session: { ...session, status: "running", turn: session.turn + 1, step: 0, error: null },
      partial: null,
      controller: new AbortController(),
      done: Promise.resolve(),
    };
    this.active.set(id, slot);
    try {
      this.commit(slot, [
        { type: "turn/start", turn: slot.session.turn, step: 0 },
        {
          type: "user/message",
          turn: slot.session.turn,
          step: 0,
          message: { role: "user", content: [{ type: "text", text }] },
        },
      ]);
    } catch (error) {
      this.active.delete(id);
      lease.release();
      throw error;
    }
    const started = structuredClone(slot.session);
    slot.done = this.run(slot, tools, lease.config)
      .catch((error) => {
        slot.session.status = "failed";
        slot.session.error = "会话持久化失败，请检查磁盘并重启后核对工具结果。";
        slot.partial = null;
        this.failures.set(id, slot);
        console.warn("Agent settlement failed", errorText(error));
      })
      .finally(() => {
        lease.release();
        this.active.delete(id);
        this.notify(slot);
      });
    // Storage failure keeps a failed in-memory snapshot; restart recovery uses the last durable facts.
    void slot.done.catch((error) => console.warn("Agent settlement failed", errorText(error)));
    return started;
  }
  private async run(
    slot: Slot,
    tools: Tool[],
    config: ReturnType<Models["reserveAgent"]>["config"],
  ) {
    const { controller } = slot;
    const timer = setTimeout(
      () => controller.abort(new Error("Agent 运行超时")),
      slot.session.timeoutMs,
    );
    const signal = controller.signal;
    try {
      for (let step = 1; step <= slot.session.maxSteps; step++) {
        signal.throwIfAborted();
        slot.session.step = step;
        slot.partial = null;
        const position = { turn: slot.session.turn, step };
        const history = this.journal.all(slot.session.pluginId, slot.session.id);
        const messages = deriveAgentMessages(history);
        if (Buffer.byteLength(JSON.stringify(messages)) > 384 * 1024)
          throw new Error("会话上下文已达上限，请新建会话；历史未被静默裁剪");
        this.commit(slot, [
          {
            type: "step/start",
            ...position,
            model: config.model,
            provider: config.chatgptProfileId ? "chatgpt" : (config.preset ?? config.provider),
            tools: tools.map(({ name, description, inputSchema }) => ({
              name,
              description,
              inputSchema,
            })),
          },
        ]);
        let lastNotify = 0;
        const assistant = agentAssistant.parse(
          await this.generate({
            config,
            system: `${slot.session.system}\n\nCurrent host time: ${new Date().toISOString()}. Host time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Resolve today, tomorrow and other relative dates using this clock, not model training data or dates found on unrelated pages.`,
            messages,
            tools,
            signal,
            partial: (message) => {
              signal.throwIfAborted();
              if (Buffer.byteLength(JSON.stringify(message)) > 80 * 1024)
                throw new Error("模型输出超过 80 KiB");
              slot.partial = structuredClone(message);
              slot.session.revision++;
              if (Date.now() - lastNotify > 60) {
                lastNotify = Date.now();
                this.notify(slot);
              }
            },
          }),
        );
        signal.throwIfAborted();
        if (Buffer.byteLength(JSON.stringify(assistant)) > 160 * 1024)
          throw new Error("模型消息及回放数据超过 160 KiB");
        const calls = assistant.content.filter((block) => block.type === "tool-call");
        const previousCalls = new Set(
          history.filter((event) => event.type === "tool/call").map((event) => event.call.id),
        );
        if (calls.some((call) => previousCalls.has(call.id)))
          throw new Error("模型重复使用工具调用标识");
        if (assistant.finishReason === "length")
          throw new Error("模型达到输出限制，未执行未完成的工具调用");
        if (calls.length > 16 || new Set(calls.map((call) => call.id)).size !== calls.length)
          throw new Error("模型工具调用数量或标识无效");
        if (calls.length > 0 !== (assistant.finishReason === "tool-calls"))
          throw new Error("模型工具调用与结束原因不一致");
        if (!assistant.content.length) throw new Error("模型返回空消息");
        this.commit(slot, [
          { type: "assistant/message", ...position, message: assistant },
          ...calls.map((call) => ({ type: "tool/call" as const, ...position, call })),
        ]);
        slot.partial = null;
        for (const call of calls) {
          signal.throwIfAborted();
          const tool = tools.find((tool) => tool.name === call.name);
          let output: z.infer<typeof outputSchema>;
          try {
            if (!tool) throw new Error("当前会话未授权工具：" + call.name);
            const input = tool.parse(JSON.parse(call.arguments));
            output = outputSchema.parse(
              await tool.execute(input, signal, slot.session.id, call.id),
            );
            if (Buffer.byteLength(JSON.stringify(output)) > 96 * 1024)
              throw new Error("工具结果超过 96 KiB，请缩小请求范围");
          } catch (error) {
            output = { content: [{ type: "text", text: errorText(error) }], isError: true };
          }
          this.commit(slot, [
            {
              type: "tool/result",
              ...position,
              message: {
                role: "tool",
                callId: call.id,
                name: call.name,
                content: output.content,
                isError: output.isError ?? false,
              },
              ...(output.meta === undefined ? {} : { meta: output.meta }),
            },
          ]);
          signal.throwIfAborted();
        }
        this.commit(slot, [{ type: "step/end", ...position }]);
        if (!calls.length) {
          this.finish(slot, "completed", null);
          return;
        }
      }
      throw new Error("已达到本轮最大模型步数");
    } catch (error) {
      const cancelled = signal.aborted && signal.reason?.name === "AbortError";
      const message = errorText(signal.aborted ? signal.reason : error);
      if (slot.partial)
        this.commit(slot, [
          {
            type: "assistant/attempt",
            turn: slot.session.turn,
            step: slot.session.step,
            content: slot.partial.content,
            error: message,
          },
        ]);
      this.finish(slot, cancelled ? "cancelled" : "failed", message);
    } finally {
      clearTimeout(timer);
      slot.partial = null;
    }
  }
  private finish(
    slot: Slot,
    status: "completed" | "cancelled" | "failed" | "interrupted",
    error: string | null,
  ) {
    const events = this.journal
      .all(slot.session.pluginId, slot.session.id)
      .filter((event) => "turn" in event && event.turn === slot.session.turn);
    const results = new Set(
      events.filter((event) => event.type === "tool/result").map((event) => event.message.callId),
    );
    const position = { turn: slot.session.turn, step: slot.session.step };
    const pending: AgentEventData[] = events
      .filter((event) => event.type === "tool/call" && !results.has(event.call.id))
      .map((event) => {
        if (event.type !== "tool/call") throw new Error("无效的工具事件");
        return {
          type: "tool/result",
          turn: event.turn,
          step: event.step,
          message: {
            role: "tool",
            callId: event.call.id,
            name: event.call.name,
            isError: true,
            content: [{ type: "text", text: error ?? "工具未完成，结果未知；不会自动重试。" }],
          },
        };
      });
    if (
      events.at(-1)?.type !== "step/end" &&
      events.some((event) => event.type === "step/start" && event.step === slot.session.step)
    )
      pending.push({ type: "step/end", ...position });
    slot.session.status = status;
    slot.session.error = error;
    this.commit(slot, [...pending, { type: "turn/end", ...position, status, error }]);
  }
  cancel(pluginId: string, id: string): AgentSession {
    const session = this.journal.get(pluginId, id);
    const slot = this.active.get(id);
    if (!slot || !["running", "cancelling"].includes(slot.session.status)) return session;
    slot.controller.abort(new DOMException("Agent 已取消", "AbortError"));
    slot.session.status = "cancelling";
    this.commit(slot, []);
    return structuredClone(slot.session);
  }
  client(pluginId: string): AgentClient {
    return {
      create: async (input) => this.create(pluginId, input),
      list: async () => this.list(pluginId),
      tools: async () => this.catalog(pluginId),
      get: async (id) => this.get(pluginId, id),
      events: async (id, after) => this.events(pluginId, id, after),
      send: async (id, text) => this.send(pluginId, id, text),
      cancel: async (id) => this.cancel(pluginId, id),
      remove: async (id) => this.remove(pluginId, id),
      onChange: (listener) => {
        const scoped = (change: AgentChange) => {
          if (change.pluginId === pluginId) listener(change);
        };
        this.listeners.add(scoped);
        return () => {
          this.listeners.delete(scoped);
        };
      },
    };
  }
  async stop() {
    this.stopping = true;
    for (const slot of this.active.values())
      slot.controller.abort(new DOMException("应用正在退出", "AbortError"));
    await Promise.allSettled([...this.active.values()].map((slot) => slot.done));
    this.listeners.clear();
    this.journal.close();
  }
}
