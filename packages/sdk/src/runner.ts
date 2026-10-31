import { pathToFileURL } from "node:url";
import { readResponses } from "./sse.ts";
import { FnError } from "./types.ts";
import type { BackendDefinition, Host } from "./backend.ts";

interface Configuration {
  origin: string;
  token: string;
  runId: string;
  entry: string;
  paths: Host["paths"];
}
const config: Configuration = JSON.parse(
  process.env.FN_RUNTIME_CONFIG ?? "null",
);
if (!config || !/^http:\/\/127\.0\.0\.1:\d+$/.test(config.origin))
  throw new Error("Missing Fn runtime configuration");
delete process.env.FN_RUNTIME_CONFIG;
const lifetime = new AbortController();
async function request(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
  extraHeaders: Record<string, string> = {},
) {
  const response = await fetch(config.origin + "/api/fn/v1" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: "Bearer " + config.token,
      "content-type": "application/json",
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.any([lifetime.signal, ...(signal ? [signal] : [])]),
  });
  if (!response.ok) {
    const value = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new FnError(
      value.code ?? "request_failed",
      value.message ?? response.statusText,
    );
  }
  return response;
}
const host: Host = {
  paths: config.paths,
  preferences: async () => (await request("/preferences")).json(),
  models: {
    list: async () => (await request("/models")).json(),
    default: async () => (await request("/models/default")).json(),
    async *responses(body, options) {
      const signal = AbortSignal.any([
        lifetime.signal,
        ...(options.signal ? [options.signal] : []),
      ]);
      const response = await request("/responses", body, signal, {
        "x-fn-connection": options.connectionId,
      });
      yield* readResponses(response, signal);
    },
  },
  widgets: {
    publish: async (id, snapshot) => {
      await request("/widgets/publish", { id, snapshot });
    },
  },
  ui: {
    toast: async (text, options) => {
      await request("/ui/toast", { text, ...options });
    },
    confirm: async (text, options) =>
      (await request("/ui/confirm", { text, ...options })).json(),
  },
};
const socket = new (
  WebSocket as unknown as {
    new (url: string, options: { headers: Record<string, string> }): WebSocket;
  }
)(config.origin.replace(/^http/, "ws") + "/api/fn/v1/runtime", {
  headers: { authorization: "Bearer " + config.token },
});
const calls = new Map<
  string,
  { controller: AbortController; credits: number; resume?: () => void }
>();
let implementation: Awaited<ReturnType<BackendDefinition["setup"]>>;
let definition: BackendDefinition;
let stopping = false;
const send = (value: unknown) => {
  const text = JSON.stringify(value);
  if (
    Buffer.byteLength(text) > 1024 * 1024 ||
    socket.bufferedAmount > 2 * 1024 * 1024
  )
    throw new Error("Runtime transport limit");
  socket.send(text);
};
const stop = async () => {
  if (stopping) return;
  stopping = true;
  lifetime.abort();
  for (const call of calls.values()) {
    call.controller.abort();
    call.resume?.();
  }
  await implementation?.stop?.();
  try {
    send({ type: "stopped" });
  } catch {}
  socket.close();
  process.exitCode = 0;
};
socket.onopen = async () => {
  try {
    definition = (await import(pathToFileURL(config.entry).href)).default;
    implementation = await definition.setup({ host });
    send({ type: "ready", methods: Object.keys(definition.api) });
  } catch {
    send({ type: "fatal", message: "Application initialization failed" });
    await stop();
  }
};
socket.onmessage = async (event) => {
  let message: Record<string, any>;
  try {
    message = JSON.parse(String(event.data));
  } catch {
    await stop();
    return;
  }
  if (message.type === "stop") {
    await stop();
    return;
  }
  const existing = calls.get(message.id);
  if (message.type === "cancel") {
    existing?.controller.abort();
    existing?.resume?.();
    return;
  }
  if (message.type === "credit") {
    if (existing) {
      existing.credits++;
      existing.resume?.();
    }
    return;
  }
  if (message.type !== "call" || stopping || !implementation) return;
  if (calls.size >= 64 || calls.has(message.id)) {
    send({
      type: "error",
      id: message.id,
      code: "busy",
      message: "Application call limit",
    });
    return;
  }
  const call = {
    controller: new AbortController(),
    credits: 16,
    resume: undefined as (() => void) | undefined,
  };
  calls.set(message.id, call);
  const signal = AbortSignal.any([call.controller.signal, lifetime.signal]);
  try {
    const context = { signal, requestId: message.id, viewId: message.viewId };
    if (message.chat) {
      const handler = implementation.chat?.[message.method];
      if (!handler) throw new FnError("not_found", "Chat entry not found");
      await handler({
        ...context,
        message: message.input,
        reply: {
          complete: async (value) => {
            await request(
              "/relay/reply",
              { messageId: message.input.id, text: value.text },
              signal,
            );
          },
        },
      });
    } else {
      const procedure = definition.api[message.method];
      if (!procedure) throw new FnError("not_found", "Method not found");
      const output = await implementation.handlers[message.method]!(
        procedure.input.parse(message.input),
        context,
      );
      if (procedure.streaming) {
        if (!output || !(Symbol.asyncIterator in Object(output)))
          throw new Error("Streaming method must return an AsyncIterable");
        for await (const value of output as AsyncIterable<unknown>) {
          while (call.credits <= 0 && !signal.aborted)
            await new Promise<void>((resolve) => {
              call.resume = resolve;
            });
          signal.throwIfAborted();
          call.credits--;
          send({
            type: "yield",
            id: message.id,
            value: procedure.output.parse(value),
          });
        }
      } else {
        signal.throwIfAborted();
        send({
          type: "result",
          id: message.id,
          value: procedure.output.parse(output),
        });
      }
    }
    signal.throwIfAborted();
    send({ type: "done", id: message.id });
  } catch (error) {
    try {
      send({
        type: "error",
        id: message.id,
        code: signal.aborted
          ? "cancelled"
          : error instanceof FnError
            ? error.code
            : "application_error",
        message: signal.aborted
          ? "Cancelled"
          : String(error instanceof Error ? error.message : error).slice(
              0,
              1000,
            ),
      });
    } catch {
      await stop();
    }
  } finally {
    calls.delete(message.id);
  }
};
socket.onclose = () => {
  void stop();
};
socket.onerror = () => {
  void stop();
};
process.on("SIGTERM", () => {
  void stop();
});
process.on("SIGINT", () => {
  void stop();
});
