import {
  validateResponseRequest,
  parseProtocol,
  ResponseStreamError,
} from "@semicoder/fn-sdk/responses";
import { readResponses } from "@semicoder/fn-sdk/sse";
import {
  request,
  delta,
  completed,
  resource,
  responseFrom,
} from "../../packages/sdk/tests/fixtures/responses.ts";
const valid = validateResponseRequest(request);
if (valid.input[0]?.type !== "message")
  throw new Error("Request contract missing from archive");
parseProtocol("ResponseResource", resource());
for (const invalid of [
  { ...request, input: [42] },
  { ...request, tools: [{ type: "function" }] },
]) {
  let rejected = false;
  try {
    validateResponseRequest(invalid);
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error("Archive accepted invalid model request");
}
let text = "";
for await (const event of readResponses(responseFrom([delta, completed], true)))
  if (event.type === "response.output_text.delta") text += event.delta;
if (text !== "hello") throw new Error("Archive stream decoding failed");
try {
  await Array.fromAsync(
    readResponses(
      responseFrom([
        {
          type: "response.incomplete",
          sequence_number: 1,
          response: resource({
            status: "incomplete",
            incomplete_details: { reason: "max_output_tokens" },
          }),
        },
      ]),
    ),
  );
  throw new Error("Incomplete response accepted");
} catch (error) {
  if (
    !(error instanceof ResponseStreamError) ||
    error.event.type !== "response.incomplete" ||
    error.event.response.incomplete_details?.reason !== "max_output_tokens"
  )
    throw error;
}
console.log(
  "Independent model request, SSE, typed errors and protocol snapshot verified",
);
