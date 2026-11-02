import type {
  ResponseEvent,
  ResponseRequest,
  ResponseResource,
} from "../../src/responses.ts";
import { encodeSSE } from "../../src/sse.ts";
export const request: ResponseRequest = {
  model: "test",
  input: [{ type: "message", role: "user", content: "hello" }],
  store: false,
  stream: true,
};
export function resource(
  overrides: Partial<ResponseResource> = {},
): ResponseResource {
  return {
    id: "resp_test",
    object: "response",
    created_at: 1,
    completed_at: 2,
    status: "completed",
    incomplete_details: null,
    model: "test",
    previous_response_id: null,
    instructions: null,
    output: [],
    error: null,
    tools: [],
    tool_choice: "auto",
    truncation: "disabled",
    parallel_tool_calls: true,
    text: { format: { type: "text" } },
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    top_logprobs: 0,
    temperature: 1,
    reasoning: null,
    usage: {
      input_tokens: 1,
      output_tokens: 1,
      total_tokens: 2,
      input_tokens_details: { cached_tokens: 0 },
      output_tokens_details: { reasoning_tokens: 0 },
    },
    max_output_tokens: null,
    max_tool_calls: null,
    store: false,
    background: false,
    service_tier: "default",
    metadata: null,
    safety_identifier: null,
    prompt_cache_key: null,
    ...overrides,
  };
}
export const delta = {
  type: "response.output_text.delta",
  sequence_number: 1,
  item_id: "msg_test",
  output_index: 0,
  content_index: 0,
  delta: "hello",
} satisfies ResponseEvent;
export const completed = {
  type: "response.completed",
  sequence_number: 2,
  response: resource(),
} satisfies ResponseEvent;
export function responseFrom(events: unknown[], done = false): Response {
  const chunks = events.map((event) =>
    encodeSSE(event, (event as { type: string }).type),
  );
  if (done) chunks.push(new TextEncoder().encode("data: [DONE]\n\n"));
  return new Response(Buffer.concat(chunks), {
    headers: { "content-type": "text/event-stream" },
  });
}
