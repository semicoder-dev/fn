import { FnError, type ResponseEvent } from "./types.ts";
/** UTF-8 and frame boundaries are independent of HTTP chunk boundaries. */
export async function* readSSE(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<{ event: string; data: unknown }> {
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
      if (buffer.length > 2 * 1024 * 1024)
        throw new FnError("resource_limit", "SSE frame limit exceeded");
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
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
          if (raw === "[DONE]") continue;
          yield { event, data: JSON.parse(raw) };
        }
      }
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
  for await (const frame of readSSE(response, signal)) {
    const event = frame.data as ResponseEvent;
    if (!event || typeof event.type !== "string")
      throw new FnError("invalid_event", "Invalid Responses event");
    if (
      ["response.failed", "response.incomplete", "error"].includes(event.type)
    ) {
      const failure = event as any;
      const detail = failure.response?.error ?? failure.error ?? failure;
      throw new FnError(
        detail.code ?? event.type,
        detail.message ??
          (event.type === "response.incomplete"
            ? "Model response is incomplete"
            : "Model response failed"),
      );
    }
    yield event;
    if (event.type === "response.completed") completed = true;
  }
  if (!completed)
    throw new FnError("interrupted", "Model stream ended before completion");
}
