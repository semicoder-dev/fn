// Compiled by repository typecheck and the independent archive consumer.
import type {
  ResponseRequest,
  ResponseEvent,
  ItemParam,
  ResponseResource,
  FunctionToolParam,
  ReasoningItemParam,
  CreateResponseBody,
} from "@semicoder/fn-sdk/types";
import type { Host } from "@semicoder/fn-sdk/backend";
import type { ViewClient } from "@semicoder/fn-sdk/client";
import type { Contract } from "@semicoder/fn-sdk/contract";
import type { ResponseStreamError } from "@semicoder/fn-sdk/responses";
export const valid: ResponseRequest = {
  model: "test",
  input: [{ type: "message", role: "user", content: "hello" }],
  store: false,
  stream: true,
  tools: [{ type: "function", name: "test", parameters: { type: "object" } }],
  reasoning: { effort: "high" },
};
export function narrowing(event: ResponseEvent): string {
  if (event.type === "response.output_text.delta") {
    const delta: string = event.delta;
    return delta;
  }
  if (event.type === "response.completed") {
    const response: ResponseResource = event.response;
    return response.output.map((item) => item.type).join(",");
  }
  if (
    event.type === "response.output_item.done" &&
    event.item?.type === "function_call"
  ) {
    const args: string = event.item.arguments;
    return args;
  }
  return event.type;
}
export function failures(error: ResponseStreamError): string | null {
  if (error.event.type === "error") return error.event.error.param;
  return error.event.response.incomplete_details?.reason ?? null;
}
export function callers(host: Host, view: ViewClient<Contract>) {
  const backend: AsyncIterable<ResponseEvent> = host.models.responses(valid, {
    connectionId: "test",
  });
  const page: AsyncIterable<ResponseEvent> = view.models.responses(valid, {
    connectionId: "test",
  });
  return { backend, page };
}
export const fullProtocol: CreateResponseBody = {
  input: "text",
  previous_response_id: null,
  temperature: 1,
  stream: false,
  store: true,
};
// @ts-expect-error function name is required
export const missingName: FunctionToolParam = { type: "function" };
// @ts-expect-error event envelope and response are required
export const missingResponse: ResponseEvent = { type: "response.completed" };
// @ts-expect-error message type is required even though upstream gives it a default
export const missingType: ItemParam = { role: "user", content: "x" };
export const badReasoning: ReasoningItemParam = {
  type: "reasoning",
  summary: [],
  // @ts-expect-error null-only field must not be broadened
  content: [],
};
export const unsupported: ResponseRequest = {
  ...valid,
  // @ts-expect-error standard protocol field forbidden by this connection
  previous_response_id: "resp_test",
};
export const typo: ResponseRequest = {
  ...valid,
  // @ts-expect-error no unknown top-level parameter escape hatch
  temparature: 1,
};
export const wrongEffort: ResponseRequest = {
  ...valid,
  // @ts-expect-error invalid enum must fail at compile time
  reasoning: { effort: "minimal" },
};
