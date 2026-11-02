import { FnError } from "./types.ts";
import { schemas, eventSchemas } from "./openresponses/schemas.ts";
import { validateSchema } from "./openresponses/schema.ts";
import type {
  CreateResponseBody,
  ItemParam,
  SystemMessageItemParam,
  StreamingEvent,
  ProtocolTypes,
  ResponseFailedStreamingEvent,
  ResponseIncompleteStreamingEvent,
  ErrorStreamingEvent,
} from "./openresponses/types.ts";
export type * from "./openresponses/types.ts";

/** Connection policy, separate from the unmodified OpenResponses contract. */
export const unsupportedResponseParameters = [
  "background",
  "conversation",
  "max_output_tokens",
  "max_tool_calls",
  "metadata",
  "moderation",
  "multi_agent",
  "prompt",
  "prompt_cache_retention",
  "safety_identifier",
  "temperature",
  "top_logprobs",
  "top_p",
  "truncation",
  "user",
  "previous_response_id",
] as const;
type UnsupportedParameter = (typeof unsupportedResponseParameters)[number];
export type ResponseInputItem = Exclude<ItemParam, SystemMessageItemParam>;
export type ResponseRequest = Omit<
  CreateResponseBody,
  UnsupportedParameter | "model" | "input" | "store" | "stream"
> & {
  model: string;
  input: ResponseInputItem[];
  store: false;
  stream: true;
} & Partial<Record<UnsupportedParameter, never>>;
export type ResponseEvent = StreamingEvent;
/** Providers may add events; readResponses validates their envelope and ignores
 * them. They never widen the discriminants of the standard event union. */
export interface ProviderResponseEvent {
  type: `${string}:${string}`;
  sequence_number: number;
  [key: string]: unknown;
}
export type ResponseFailureEvent =
  | ResponseFailedStreamingEvent
  | ResponseIncompleteStreamingEvent
  | ErrorStreamingEvent;
const streamErrorBrand = Symbol.for("@semicoder/fn-sdk/ResponseStreamError");
export class ResponseStreamError extends FnError {
  readonly [streamErrorBrand] = true;
  // The host runner bundles the SDK while application backends load their own
  // frozen copy. Both share the symbol registry, but not constructor identity.
  static [Symbol.hasInstance](value: unknown): boolean {
    return (
      !!value &&
      typeof value === "object" &&
      (value as { [streamErrorBrand]?: boolean })[streamErrorBrand] === true
    );
  }
  constructor(public readonly event: ResponseFailureEvent) {
    const detail = event.type === "error" ? event.error : event.response.error;
    super(
      detail?.code ?? event.type,
      detail?.message ??
        (event.type === "response.incomplete"
          ? "Model response is incomplete"
          : "Model response failed"),
    );
    this.name = "ResponseStreamError";
  }
}
/** Also useful for storing/replaying protocol resources. No coercion or mutation. */
export function parseProtocol<K extends keyof ProtocolTypes>(
  name: K,
  value: unknown,
): ProtocolTypes[K] {
  if (!Object.hasOwn(schemas, name))
    throw new FnError("invalid_protocol", "Unknown protocol schema");
  const issue = validateSchema(schemas[name], value, schemas);
  if (issue)
    throw new FnError(
      "invalid_protocol",
      `${name} ${issue.path}: ${issue.message}`,
    );
  return value as ProtocolTypes[K];
}
export function validateResponseRequest(value: unknown): ResponseRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FnError("invalid_request", "Expected Responses request object");
  const input = value as Record<string, unknown>;
  for (const key of unsupportedResponseParameters)
    if (Object.hasOwn(input, key) && input[key] !== undefined)
      throw new FnError(
        "unsupported_parameter",
        key + " is not supported by this connection",
      );
  for (const key of Object.keys(input))
    if (
      !Object.hasOwn(schemas.CreateResponseBody.properties!, key) &&
      input[key] !== undefined
    )
      throw new FnError(
        "unsupported_parameter",
        "Unknown Responses parameter: " + key,
      );
  if (
    typeof input.model !== "string" ||
    !input.model.trim() ||
    !Array.isArray(input.input) ||
    input.store !== false ||
    input.stream !== true
  )
    throw new FnError(
      "invalid_request",
      "Responses requires model, input array, store:false and stream:true",
    );
  if (Array.isArray(input.tools))
    for (const tool of input.tools) {
      if (
        tool &&
        typeof tool === "object" &&
        typeof tool.type === "string" &&
        tool.type !== "function"
      )
        throw new FnError(
          "unsupported_parameter",
          "Unsupported tool: " + tool.type,
        );
    }
  const issue = validateSchema(schemas.CreateResponseBody, value, schemas);
  if (issue)
    throw new FnError("invalid_request", `${issue.path}: ${issue.message}`);
  if (
    input.input.some(
      (item) => item.type === "message" && item.role === "system",
    )
  )
    throw new FnError(
      "unsupported_parameter",
      "Use instructions or developer messages",
    );
  return value as ResponseRequest;
}
export function parseResponseEvent(
  value: unknown,
): ResponseEvent | ProviderResponseEvent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new FnError("invalid_event", "Expected Responses event object");
  const event = value as Record<string, unknown>;
  if (
    typeof event.type !== "string" ||
    !Number.isSafeInteger(event.sequence_number) ||
    (event.sequence_number as number) < 0
  )
    throw new FnError(
      "invalid_event",
      "Responses requires type and nonnegative sequence_number",
    );
  if (Object.hasOwn(eventSchemas, event.type)) {
    const name = eventSchemas[event.type as keyof typeof eventSchemas];
    const issue = validateSchema(schemas[name], value, schemas);
    if (issue)
      throw new FnError(
        "invalid_event",
        `${name} ${issue.path}: ${issue.message}`,
      );
    return value as ResponseEvent;
  }
  if (/^[a-z][a-z0-9_-]*:[a-zA-Z0-9_.-]+$/.test(event.type))
    return value as ProviderResponseEvent;
  throw new FnError(
    "invalid_event",
    "Unknown core Responses event: " + event.type,
  );
}
export function isProviderResponseEvent(
  event: ResponseEvent | ProviderResponseEvent,
): event is ProviderResponseEvent {
  return event.type.includes(":");
}
