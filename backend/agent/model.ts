import {
  createModels,
  InMemoryCredentialStore,
  type AssistantMessage,
  type Message,
  type Model,
  type Api,
  type Tool,
} from "@earendil-works/pi-ai";
import { z } from "@semicoder/fia/api";
import {
  agentAssistant,
  type AgentAssistant,
  type AgentMessage,
  type AgentToolInfo,
} from "@semicoder/fn-sdk/agent";
import type { ModelConfig } from "../store";
import type { ChatGPT } from "../chatgpt";
import { getProvider } from "../providers";
import { streamSimple as streamCompletions } from "@earendil-works/pi-ai/api/openai-completions";
import { normalizeContext } from "@earendil-works/pi-ai/utils/transcript";

export interface AgentModelRequest {
  config: ModelConfig;
  system: string;
  messages: AgentMessage[];
  tools: AgentToolInfo[];
  signal: AbortSignal;
  partial: (message: AgentAssistant) => void;
}
export type AgentModel = (request: AgentModelRequest) => Promise<AgentAssistant>;
const json = (value: unknown) => z.json().parse(JSON.parse(JSON.stringify(value)));

export function modelRoute(config: ModelConfig) {
  return JSON.stringify([
    config.preset,
    config.model,
    config.baseURL,
    config.chatgptProfileId ?? null,
    config.options,
  ]);
}
function messagesForPi(messages: AgentMessage[], route: string): Message[] {
  return messages.map((message): Message => {
    if (message.role === "user") return { role: "user", content: message.content, timestamp: 0 };
    if (message.role === "tool")
      return {
        role: "toolResult",
        toolCallId: message.callId,
        toolName: message.name,
        content: message.content,
        isError: message.isError,
        timestamp: 0,
      };
    if (message.replay?.adapter !== "pi-1" || message.replay.route !== route)
      throw new Error("会话模型连接已改变，请新建会话以保留正确的模型历史");
    // Data is written only by this adapter, admitted by the versioned journal.
    return message.replay.data as unknown as AssistantMessage;
  });
}

export function createAgentModel(chatgpt?: ChatGPT, fetcher: typeof fetch = fetch): AgentModel {
  const generate = async (
    request: AgentModelRequest,
    transport: typeof fetch,
    checkEvent?: (event: unknown) => void,
  ): Promise<AgentAssistant> => {
    const { config, signal } = request;
    const provider = getProvider(config.preset ?? "openai");
    const credentials = new InMemoryCredentialStore();
    const env: Record<string, string> = {};
    const { accountId, gatewayId, region, apiVersion, deployment } = config.options;
    if (accountId) env.CLOUDFLARE_ACCOUNT_ID = accountId;
    if (gatewayId) env.CLOUDFLARE_GATEWAY_ID = gatewayId;
    if (region) env.AWS_REGION = region;
    if (apiVersion) env.AZURE_OPENAI_API_VERSION = apiVersion;
    if (deployment) env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP = `${config.model}=${deployment}`;
    await credentials.modify(provider.id, async () => ({
      type: "api_key",
      key: config.apiKey || "fn-managed",
      env,
    }));
    const runtime = createModels({
      credentials,
      authContext: { env: async () => undefined, fileExists: async () => false },
    });
    runtime.setProvider(provider);
    const preset = config.preset
      ? provider.getModels().find((model) => model.id === config.model)
      : undefined;
    if (config.preset && !preset) throw new Error("预设模型已不存在");
    const model: Model<Api> = preset
      ? { ...preset, ...(config.baseURL ? { baseUrl: config.baseURL } : {}) }
      : {
          id: config.model,
          name: config.name,
          provider: "openai",
          api: config.chatgptProfileId ? "openai-responses" : "openai-completions",
          baseUrl: config.baseURL,
          input: ["text"],
          reasoning: false,
          contextWindow: 32768,
          maxTokens: 8192,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        };
    const route = modelRoute(config);
    const rawArguments = new Map<number, string>();
    const convert = (message: AssistantMessage, replay: boolean): AgentAssistant =>
      agentAssistant.parse({
        role: "assistant",
        model: message.model,
        provider: config.chatgptProfileId ? "chatgpt" : message.provider,
        finishReason:
          message.stopReason === "toolUse"
            ? "tool-calls"
            : message.stopReason === "length"
              ? "length"
              : "stop",
        content: message.content.flatMap((block, index): AgentAssistant["content"] => {
          if (block.type === "text") return [{ type: "text", text: block.text }];
          if (block.type === "thinking")
            return [{ type: "reasoning", text: block.redacted ? "" : block.thinking }];
          if (!replay && (!block.id || !block.name)) return [];
          return [
            {
              type: "tool-call",
              id: block.id,
              name: block.name,
              arguments: rawArguments.get(index) ?? JSON.stringify(block.arguments),
            },
          ];
        }),
        usage: {
          input: message.usage.input,
          output: message.usage.output,
          cacheRead: message.usage.cacheRead,
          cacheWrite: message.usage.cacheWrite,
        },
        ...(replay ? { replay: { adapter: "pi-1", route, data: json(message) } } : {}),
      });
    const child = new AbortController();
    const combined = AbortSignal.any([signal, child.signal]);
    const wireFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (!config.apiKey && !config.preset && !config.chatgptProfileId)
        headers.delete("authorization");
      return transport(input, { ...init, headers });
    }) as typeof fetch;
    try {
      const context = {
        systemPrompt: request.system,
        messages: messagesForPi(request.messages, route),
        tools: request.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema as Tool["parameters"],
        })),
      };
      const options = {
        signal: combined,
        env,
        maxTokens: Math.min(model.maxTokens, 8192),
        maxRetries: 0,
        fetch: wireFetch,
        onProviderStreamEvent: checkEvent,
      };
      const stream =
        !config.preset && !config.chatgptProfileId
          ? streamCompletions(model as Model<"openai-completions">, normalizeContext(context), {
              ...options,
              apiKey: config.apiKey || "fn-keyless",
            })
          : runtime.streamSimple(model, context, options);
      for await (const event of stream) {
        signal.throwIfAborted();
        if ("partial" in event && Buffer.byteLength(JSON.stringify(event.partial)) > 160 * 1024)
          throw new Error("模型流超过 160 KiB");
        if (event.type === "toolcall_delta")
          rawArguments.set(
            event.contentIndex,
            (rawArguments.get(event.contentIndex) ?? "") + event.delta,
          );
        if (
          event.type === "text_delta" ||
          event.type === "thinking_delta" ||
          event.type === "toolcall_delta" ||
          event.type === "toolcall_end"
        )
          request.partial(convert(event.partial, false));
        if (event.type === "error")
          throw new Error("模型请求失败：" + (event.error.errorMessage ?? event.reason));
        if (event.type === "done") return convert(event.message, true);
      }
      throw new Error("模型连接在生成完成前中断");
    } catch (error) {
      if (signal.aborted) throw signal.reason;
      const message = error instanceof Error ? error.message : "模型请求失败";
      throw new Error(
        (config.apiKey ? message.replaceAll(config.apiKey, "[已隐藏]") : message).slice(0, 600),
      );
    } finally {
      child.abort();
      await credentials.delete(provider.id);
    }
  };
  return (request) => {
    if (request.config.chatgptProfileId) {
      if (!chatgpt) throw new Error("ChatGPT 登录不可用");
      return chatgpt.agentRequest(
        request.config.chatgptProfileId,
        request.config.model,
        request.signal,
        (transport, signal, checkEvent) => generate({ ...request, signal }, transport, checkEvent),
      );
    }
    return generate(request, fetcher);
  };
}
