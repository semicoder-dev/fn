import { FnError, type ResponseEvent } from "./types.ts";
import {
  parseResponseEvent,
  isProviderResponseEvent,
  ResponseStreamError,
} from "./responses.ts";
/** UTF-8 and frame boundaries are independent of HTTP chunk boundaries. */
export async function* readSSE(
  response: Response,
  signal?: AbortSignal,
  options: { preserveDone?: boolean } = {},
): AsyncGenerator<{ event: string; data: unknown; done?: true }> {
  signal?.throwIfAborted();
  if (!response.ok) {
    const value = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new FnError(
      value.code ?? "http_error",
      value.message ?? value.error?.message ?? response.statusText,
    );
  }
  if (!response.body) throw new FnError("interrupted", "Missing response body");
  const reader = response.body.getReader();
  const abort = () => {
    void reader.cancel(signal?.reason).catch(() => {});
  };
  signal?.addEventListener("abort", abort, { once: true });
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      signal?.throwIfAborted();
      const next = await reader.read();
      signal?.throwIfAborted();
      buffer += decoder.decode(next.value, { stream: !next.done });
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        if (match.index > 2 * 1024 * 1024)
          throw new FnError("resource_limit", "SSE frame limit exceeded");
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        let event = "message";
        const data: string[] = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
        }
        if (data.length) {
          const raw = data.join("\n");
          if (raw === "[DONE]") {
            if (options.preserveDone)
              yield { event, data: undefined, done: true };
            continue;
          }
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch {
            throw new FnError("invalid_event", "Invalid SSE JSON");
          }
          yield { event, data: parsed };
        }
      }
      if (buffer.length > 2 * 1024 * 1024)
        throw new FnError("resource_limit", "SSE frame limit exceeded");
      if (next.done) break;
    }
    if (buffer.trim()) throw new FnError("interrupted", "Incomplete SSE frame");
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export const encodeSSE = (data: unknown, event = "message") =>
  new TextEncoder().encode(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
  );

/** A clean HTTP EOF is not proof of successful inference. */
export async function* readResponses(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<ResponseEvent> {
  let completed = false;
  let done = false;
  let sequence = -1;
  let responseId: string | undefined;
  for await (const frame of readSSE(response, signal, { preserveDone: true })) {
    if (frame.done) {
      if (!completed || done)
        throw new FnError("invalid_event", "Unexpected Responses [DONE]");
      done = true;
      continue;
    }
    if (completed)
      throw new FnError(
        "invalid_event",
        "Responses event after terminal response",
      );
    const event = parseResponseEvent(frame.data);
    if (frame.event !== event.type)
      throw new FnError("invalid_event", "SSE event does not match body type");
    if (event.sequence_number <= sequence)
      throw new FnError(
        "invalid_event",
        "Responses sequence_number must increase",
      );
    sequence = event.sequence_number;
    if (isProviderResponseEvent(event)) continue;
    if (
      event.type === "response.created" ||
      event.type === "response.queued" ||
      event.type === "response.in_progress" ||
      event.type === "response.completed" ||
      event.type === "response.failed" ||
      event.type === "response.incomplete"
    ) {
      if (responseId !== undefined && event.response.id !== responseId)
        throw new FnError(
          "invalid_event",
          "Response identity changed within stream",
        );
      responseId = event.response.id;
      const expected = event.type.slice("response.".length);
      if (
        ["completed", "failed", "incomplete", "in_progress", "queued"].includes(
          expected,
        ) &&
        event.response.status !== expected
      )
        throw new FnError(
          "invalid_event",
          "Response status does not match event",
        );
    }
    if (
      event.type === "response.failed" ||
      event.type === "response.incomplete" ||
      event.type === "error"
    )
      throw new ResponseStreamError(event);
    if (event.type === "response.completed") completed = true;
    yield event;
  }
  if (!completed)
    throw new FnError("interrupted", "Model stream ended before completion");
}
