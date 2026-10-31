// @bun
// packages/sdk/src/runner.ts
import { pathToFileURL } from "url";

// packages/sdk/src/types.ts
class FnError extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "FnError";
  }
}

// packages/sdk/src/sse.ts
async function* readSSE(response, signal) {
  signal?.throwIfAborted();
  if (!response.ok) {
    const value = await response.json().catch(() => ({ message: response.statusText }));
    throw new FnError(value.code ?? "http_error", value.message ?? value.error?.message ?? response.statusText);
  }
  if (!response.body)
    throw new FnError("interrupted", "Missing response body");
  const reader = response.body.getReader();
  const abort = () => {
    reader.cancel(signal?.reason).catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  const decoder = new TextDecoder;
  let buffer = "";
  try {
    while (true) {
      signal?.throwIfAborted();
      const next = await reader.read();
      signal?.throwIfAborted();
      buffer += decoder.decode(next.value, { stream: !next.done });
      if (buffer.length > 2 * 1024 * 1024)
        throw new FnError("resource_limit", "SSE frame limit exceeded");
      let match;
      while (match = /\r?\n\r?\n/.exec(buffer)) {
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        let event = "message";
        const data = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:"))
            event = line.slice(6).trim();
          if (line.startsWith("data:"))
            data.push(line.slice(5).trimStart());
        }
        if (data.length) {
          const raw = data.join(`
`);
          if (raw === "[DONE]")
            continue;
          yield { event, data: JSON.parse(raw) };
        }
      }
      if (next.done)
        break;
    }
    if (buffer.trim())
      throw new FnError("interrupted", "Incomplete SSE frame");
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
async function* readResponses(response, signal) {
  let completed = false;
  for await (const frame of readSSE(response, signal)) {
    const event = frame.data;
    if (!event || typeof event.type !== "string")
      throw new FnError("invalid_event", "Invalid Responses event");
    if (["response.failed", "response.incomplete", "error"].includes(event.type)) {
      const failure = event;
      const detail = failure.response?.error ?? failure.error ?? failure;
      throw new FnError(detail.code ?? event.type, detail.message ?? (event.type === "response.incomplete" ? "Model response is incomplete" : "Model response failed"));
    }
    yield event;
    if (event.type === "response.completed")
      completed = true;
  }
  if (!completed)
    throw new FnError("interrupted", "Model stream ended before completion");
}

// packages/sdk/src/runner.ts
var config = JSON.parse(process.env.FN_RUNTIME_CONFIG ?? "null");
if (!config || !/^http:\/\/127\.0\.0\.1:\d+$/.test(config.origin))
  throw new Error("Missing Fn runtime configuration");
delete process.env.FN_RUNTIME_CONFIG;
var lifetime = new AbortController;
async function request(path, body, signal, extraHeaders = {}) {
  const response = await fetch(config.origin + "/api/fn/v1" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: "Bearer " + config.token,
      "content-type": "application/json",
      ...extraHeaders
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.any([lifetime.signal, ...signal ? [signal] : []])
  });
  if (!response.ok) {
    const value = await response.json().catch(() => ({ message: response.statusText }));
    throw new FnError(value.code ?? "request_failed", value.message ?? response.statusText);
  }
  return response;
}
var host = {
  paths: config.paths,
  preferences: async () => (await request("/preferences")).json(),
  models: {
    list: async () => (await request("/models")).json(),
    default: async () => (await request("/models/default")).json(),
    async* responses(body, options) {
      const signal = AbortSignal.any([
        lifetime.signal,
        ...options.signal ? [options.signal] : []
      ]);
      const response = await request("/responses", body, signal, {
        "x-fn-connection": options.connectionId
      });
      yield* readResponses(response, signal);
    }
  },
  widgets: {
    publish: async (id, snapshot) => {
      await request("/widgets/publish", { id, snapshot });
    }
  },
  ui: {
    toast: async (text, options) => {
      await request("/ui/toast", { text, ...options });
    },
    confirm: async (text, options) => (await request("/ui/confirm", { text, ...options })).json()
  }
};
var socket = new WebSocket(config.origin.replace(/^http/, "ws") + "/api/fn/v1/runtime", {
  headers: { authorization: "Bearer " + config.token }
});
var calls = new Map;
var implementation;
var definition;
var stopping = false;
var send = (value) => {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) > 1024 * 1024 || socket.bufferedAmount > 2 * 1024 * 1024)
    throw new Error("Runtime transport limit");
  socket.send(text);
};
var stop = async () => {
  if (stopping)
    return;
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
  let message;
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
  if (message.type !== "call" || stopping || !implementation)
    return;
  if (calls.size >= 64 || calls.has(message.id)) {
    send({
      type: "error",
      id: message.id,
      code: "busy",
      message: "Application call limit"
    });
    return;
  }
  const call = {
    controller: new AbortController,
    credits: 16,
    resume: undefined
  };
  calls.set(message.id, call);
  const signal = AbortSignal.any([call.controller.signal, lifetime.signal]);
  try {
    const context = { signal, requestId: message.id, viewId: message.viewId };
    if (message.chat) {
      const handler = implementation.chat?.[message.method];
      if (!handler)
        throw new FnError("not_found", "Chat entry not found");
      await handler({
        ...context,
        message: message.input,
        reply: {
          complete: async (value) => {
            await request("/relay/reply", { messageId: message.input.id, text: value.text }, signal);
          }
        }
      });
    } else {
      const procedure = definition.api[message.method];
      if (!procedure)
        throw new FnError("not_found", "Method not found");
      const output = await implementation.handlers[message.method](procedure.input.parse(message.input), context);
      if (procedure.streaming) {
        if (!output || !(Symbol.asyncIterator in Object(output)))
          throw new Error("Streaming method must return an AsyncIterable");
        for await (const value of output) {
          while (call.credits <= 0 && !signal.aborted)
            await new Promise((resolve) => {
              call.resume = resolve;
            });
          signal.throwIfAborted();
          call.credits--;
          send({
            type: "yield",
            id: message.id,
            value: procedure.output.parse(value)
          });
        }
      } else {
        signal.throwIfAborted();
        send({
          type: "result",
          id: message.id,
          value: procedure.output.parse(output)
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
        code: signal.aborted ? "cancelled" : error instanceof FnError ? error.code : "application_error",
        message: signal.aborted ? "Cancelled" : String(error instanceof Error ? error.message : error).slice(0, 1000)
      });
    } catch {
      await stop();
    }
  } finally {
    calls.delete(message.id);
  }
};
socket.onclose = () => {
  stop();
};
socket.onerror = () => {
  stop();
};
process.on("SIGTERM", () => {
  stop();
});
process.on("SIGINT", () => {
  stop();
});
