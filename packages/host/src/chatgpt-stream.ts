import { FnError } from "@semicoder/fn-sdk/types";
import { encodeSSE, readSSE } from "@semicoder/fn-sdk/sse";

/** ChatGPT emits moderation metadata outside the standard event vocabulary.
 * Namespace this one known provider event without changing the pinned schema. */
export function chatGPTStream(response: Response, signal: AbortSignal) {
  const lifetime = new AbortController();
  const frames = readSSE(response, AbortSignal.any([signal, lifetime.signal]), {
    preserveDone: true,
  });
  const finish = async (reason: unknown) => {
    lifetime.abort(reason);
    await frames.return(undefined);
    // Cancellation can happen before the lazy generator acquires its reader.
    if (!response.body?.locked) await response.body?.cancel(reason);
  };
  return new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          const next = await frames.next();
          if (next.done) return controller.close();
          const frame = next.value;
          if (frame.done) {
            controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
            return;
          }
          const value =
            frame.data &&
            typeof frame.data === "object" &&
            !Array.isArray(frame.data)
              ? (frame.data as Record<string, unknown>)
              : undefined;
          if (
            frame.event === "response.metadata" ||
            value?.type === "response.metadata"
          ) {
            if (
              frame.event !== "response.metadata" ||
              value?.type !== "response.metadata" ||
              !Number.isSafeInteger(value.sequence_number) ||
              (value.sequence_number as number) < 0 ||
              typeof value.response_id !== "string" ||
              !value.response_id ||
              !value.metadata ||
              typeof value.metadata !== "object" ||
              Array.isArray(value.metadata)
            )
              throw new FnError(
                "invalid_event",
                "Invalid ChatGPT response.metadata event",
              );
            controller.enqueue(
              encodeSSE(
                { ...value, type: "openai:response.metadata" },
                "openai:response.metadata",
              ),
            );
          } else controller.enqueue(encodeSSE(frame.data, frame.event));
        } catch (error) {
          await finish(error);
          controller.error(error);
        }
      },
      async cancel(reason) {
        await finish(reason);
      },
    },
    { highWaterMark: 0 },
  );
}
