import { expect, test } from "bun:test";
import { chatGPTStream } from "../src/chatgpt-stream.ts";
import { readResponses, readSSE, encodeSSE } from "@semicoder/fn-sdk/sse";
import { completed, responseFrom } from "../../sdk/tests/fixtures/responses.ts";
const metadata = {
  type: "response.metadata",
  sequence_number: 0,
  response_id: "resp_test",
  metadata: { openai_chatgpt_moderation_metadata: { prompt: {} } },
};
const adapted = (response: Response) =>
  new Response(chatGPTStream(response, new AbortController().signal));
test("ChatGPT metadata is namespaced without widening the standard protocol", async () => {
  const frames = await Array.fromAsync(
    readSSE(adapted(responseFrom([metadata]))),
  );
  expect(frames[0]).toEqual({
    event: "openai:response.metadata",
    data: { ...metadata, type: "openai:response.metadata" },
  });
  const events = await Array.fromAsync(
    readResponses(
      adapted(responseFrom([metadata, { ...completed, sequence_number: 1 }])),
    ),
  );
  expect(events.map((e) => e.type)).toEqual(["response.completed"]);
  expect(metadata.type).toBe("response.metadata");
  await expect(
    Array.fromAsync(
      readResponses(
        responseFrom([metadata, { ...completed, sequence_number: 1 }]),
      ),
    ),
  ).rejects.toThrow("Unknown core");
});
test("provider adaptation rejects malformed metadata and preserves unknown core rejection", async () => {
  for (const patch of [
    { sequence_number: -1 },
    { response_id: null },
    { metadata: [] },
    { metadata: null },
  ]) {
    await expect(
      Array.fromAsync(
        readSSE(adapted(responseFrom([{ ...metadata, ...patch }]))),
      ),
    ).rejects.toThrow("Invalid ChatGPT");
  }
  await expect(
    Array.fromAsync(
      readSSE(adapted(new Response(encodeSSE(metadata, "response.created")))),
    ),
  ).rejects.toThrow("Invalid ChatGPT");
  await expect(
    Array.fromAsync(
      readResponses(
        adapted(
          responseFrom([{ type: "response.unknown", sequence_number: 0 }]),
        ),
      ),
    ),
  ).rejects.toThrow("Unknown core");
});
test("adaptation preserves literal DONE and cancellation releases upstream", async () => {
  const bytes = Buffer.concat([
    encodeSSE({ ...completed, sequence_number: 0 }, "response.completed"),
    Buffer.from("data: [DONE]\n\n"),
  ]);
  expect(
    await Array.fromAsync(readResponses(adapted(new Response(bytes)))),
  ).toHaveLength(1);
  let cancelled = false;
  const stream = adapted(
    new Response(
      new ReadableStream({
        cancel() {
          cancelled = true;
        },
      }),
    ),
  );
  const reader = stream.body!.getReader();
  const pending = reader.read();
  await reader.cancel();
  await pending;
  expect(cancelled).toBe(true);
});
