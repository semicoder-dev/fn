import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import {
  parseProtocol,
  validateResponseRequest,
  parseResponseEvent,
  ResponseStreamError,
  type ResponseRequest,
  type ResponseEvent,
} from "../src/responses.ts";
import { readResponses, encodeSSE } from "../src/sse.ts";
import { schemas, eventSchemas } from "../src/openresponses/schemas.ts";
import { validateSchema } from "../src/openresponses/schema.ts";
import {
  request,
  resource,
  delta,
  completed,
  responseFrom,
} from "./fixtures/responses.ts";
const read = (events: unknown[], done = false) =>
  Array.fromAsync(readResponses(responseFrom(events, done)));

test("OpenResponses request preserves tools, results, reasoning, phase, nullable and structured text fields", () => {
  const value: ResponseRequest = {
    ...request,
    instructions: null,
    reasoning: { effort: "high", summary: "auto" },
    include: ["reasoning.encrypted_content"],
    tools: [
      {
        type: "function",
        name: "weather",
        parameters: {
          type: "object",
          properties: { city: { type: "string" } },
        },
        strict: true,
      },
    ],
    tool_choice: { type: "function", name: "weather" },
    parallel_tool_calls: false,
    text: {
      format: {
        type: "json_schema",
        name: "result",
        schema: { type: "object" },
        strict: null,
      },
    },
    input: [
      ...request.input,
      {
        type: "reasoning",
        summary: [],
        content: null,
        encrypted_content: "encrypted",
      },
      {
        type: "message",
        role: "assistant",
        content: "checking",
        phase: "commentary",
      },
      {
        type: "function_call",
        call_id: "call_test",
        name: "weather",
        arguments: "{}",
      },
      {
        type: "function_call_output",
        call_id: "call_test",
        output: [{ type: "input_text", text: "sunny" }],
      },
    ],
  };
  expect(validateResponseRequest(value)).toBe(value);
  expect(
    validateResponseRequest({ ...request, instructions: undefined }),
  ).toHaveProperty("model", "test");
  expect(
    parseProtocol("CreateResponseBody", {
      input: "hello",
      store: true,
      stream: false,
    }),
  ).toEqual({ input: "hello", store: true, stream: false });
  expect(
    parseProtocol("ReasoningItemParam", {
      type: "reasoning",
      summary: [],
      content: null,
    }),
  ).toHaveProperty("content", null);
  expect(() =>
    parseProtocol("ReasoningItemParam", {
      type: "reasoning",
      summary: [],
      content: [],
    }),
  ).toThrow();
  expect(
    parseProtocol("CreateResponseBody", {
      tools: null,
      reasoning: null,
      text: null,
    }),
  ).toEqual({ tools: null, reasoning: null, text: null });
});

test("request rejects audit regressions, forbidden parameters, unknown core fields and malformed nested items", () => {
  for (const fields of [
    { input: [42] },
    { input: [null] },
    { input: [{ role: "system", content: "x" }] },
    { input: [{ type: "message", role: "system", content: "x" }] },
    {
      input: [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: 42 }],
        },
      ],
    },
    { input: [{ type: "function_call_output", call_id: "id", output: 42 }] },
    {
      input: [
        { type: "message", role: "assistant", phase: "final", content: "x" },
      ],
    },
    { reasoning: { effort: 42 } },
    { reasoning: { effort: "minimal" } },
    { tools: [{ type: "function" }] },
    { tools: [{ type: "function", name: "bad name" }] },
    { tools: [{ type: "function", name: "x", strict: null }] },
    { tools: [{ type: "mcp" }] },
    { tool_choice: 42 },
    { parallel_tool_calls: "true" },
    { stream_options: { include_obfuscation: "yes" } },
    { model: "" },
    { input: "hello" },
    { store: true },
    { stream: false },
    { previous_response_id: null },
    { temperature: 1 },
    { typo: true },
  ])
    expect(() => validateResponseRequest({ ...request, ...fields })).toThrow();
});

test("protocol validator enforces required nullable fields, Unicode lengths, numbers, maps, oneOf and allOf", () => {
  const valid = resource();
  expect(parseProtocol("ResponseResource", valid)).toBe(valid);
  const missing = { ...valid } as Record<string, unknown>;
  delete missing.metadata;
  expect(() => parseProtocol("ResponseResource", missing)).toThrow("metadata");
  expect(() =>
    parseProtocol("ResponseResource", { ...valid, created_at: 1.5 }),
  ).toThrow();
  expect(() =>
    parseProtocol("ResponseResource", { ...valid, temperature: NaN }),
  ).toThrow();
  expect(() =>
    parseProtocol(
      "MetadataParam",
      Object.fromEntries(
        Array.from({ length: 17 }, (_, i) => [String(i), "x"]),
      ),
    ),
  ).toThrow();
  expect(() => parseProtocol("MetadataParam", { key: 3 })).toThrow();
  expect(
    parseProtocol("MetadataParam", { key: "😀".repeat(512) }),
  ).toHaveProperty("key");
  expect(() =>
    parseProtocol("MetadataParam", { key: "😀".repeat(513) }),
  ).toThrow();
  expect(
    parseProtocol("WebSocketResponseCreateEvent", {
      type: "response.create",
      model: "test",
    }),
  ).toHaveProperty("type", "response.create");
  expect(() =>
    parseProtocol("WebSocketResponseCreateEvent", {
      type: "response.create",
      stream: true,
    }),
  ).toThrow();
  expect(
    validateSchema(
      { oneOf: [{ type: "number" }, { type: "integer" }] },
      1,
      schemas,
    ),
  ).toBeDefined();
  expect(
    validateSchema(
      { type: "object", additionalProperties: false },
      { extra: 1 },
      schemas,
    ),
  ).toBeDefined();
});

test("all 24 SSE variants require their full schema; no default creates missing fields", () => {
  expect(Object.keys(eventSchemas)).toHaveLength(24);
  for (const type of Object.keys(eventSchemas))
    expect(() => parseResponseEvent({ type, sequence_number: 0 })).toThrow();
  expect(() => parseResponseEvent({ type: "response.completed" })).toThrow();
  expect(() => parseResponseEvent({ ...delta, delta: 42 })).toThrow();
  expect(() => parseResponseEvent({ ...delta, content_index: 0.5 })).toThrow();
  expect(() => parseResponseEvent({ ...delta, sequence_number: -1 })).toThrow();
  expect(
    parseResponseEvent({ ...delta, "provider:trace": "keep" }),
  ).toHaveProperty("provider:trace", "keep");
});

test("SSE completion works with or without DONE, preserving fields and ignoring namespaced extension events", async () => {
  for (const done of [true, false])
    expect(
      await read(
        [
          delta,
          { type: "acme:trace", sequence_number: 2, data: {} },
          { ...completed, sequence_number: 3 },
        ],
        done,
      ),
    ).toEqual([delta, { ...completed, sequence_number: 3 }]);
  const text = { ...delta, delta: "你好😀" };
  const bytes = new Uint8Array(
    await responseFrom([text, completed]).arrayBuffer(),
  );
  const split = new ReadableStream({
    start(c) {
      for (const byte of bytes) c.enqueue(Uint8Array.of(byte));
      c.close();
    },
  });
  expect(await Array.fromAsync(readResponses(new Response(split)))).toEqual([
    text,
    completed,
  ]);
});

test("SSE rejects malformed data, event mismatch, repeated/out-of-order sequence, terminal mismatch and trailing events", async () => {
  for (const events of [
    [{ type: "response.completed" }],
    [{ ...delta, delta: 42 }, completed],
    [delta, { ...completed, sequence_number: 1 }],
    [delta, { ...completed, sequence_number: 0 }],
    [completed, delta],
    [completed, { ...completed, sequence_number: 3 }],
    [{ ...completed, response: resource({ status: "in_progress" }) }],
    [
      {
        type: "response.created",
        sequence_number: 0,
        response: resource({ id: "another", status: "in_progress" }),
      },
      completed,
    ],
    [{ type: "response.typo", sequence_number: 0 }, completed],
    [{ type: "acme:trace" }, completed],
  ])
    await expect(read(events)).rejects.toMatchObject({ code: "invalid_event" });
  for (const body of [
    new TextDecoder().decode(encodeSSE(completed)),
    "event: response.completed\ndata: {invalid}\n\n",
    "data: [DONE]\n\n",
  ])
    await expect(
      Array.fromAsync(readResponses(new Response(body))),
    ).rejects.toMatchObject({ code: "invalid_event" });
  await expect(read([delta])).rejects.toMatchObject({ code: "interrupted" });
  await expect(
    Array.fromAsync(
      readResponses(new Response("event: response.completed\ndata: {}")),
    ),
  ).rejects.toMatchObject({ code: "interrupted" });
});

test("stream failures retain typed full response, incomplete details, error param and quota code", async () => {
  for (const event of [
    {
      type: "response.incomplete",
      sequence_number: 1,
      response: resource({
        status: "incomplete",
        completed_at: null,
        incomplete_details: { reason: "max_output_tokens" },
      }),
    },
    {
      type: "response.failed",
      sequence_number: 1,
      response: resource({
        status: "failed",
        completed_at: null,
        error: {
          code: "subscription_sharing_usage_limit_exceeded",
          message: "limit",
        },
      }),
    },
    {
      type: "error",
      sequence_number: 1,
      error: {
        type: "invalid_request",
        code: null,
        param: "tools",
        message: "bad tool",
      },
    },
  ]) {
    const failure = await read([event]).catch((error) => error);
    expect(failure).toBeInstanceOf(ResponseStreamError);
    expect(failure.event).toEqual(event);
    expect(failure.code).toBe(
      event.type === "response.failed"
        ? "subscription_sharing_usage_limit_exceeded"
        : event.type,
    );
  }
});

test("model cancellation and protocol failure cancel the upstream reader", async () => {
  let cancelled = 0;
  const abort = new AbortController();
  const stream = readResponses(
    new Response(
      new ReadableStream({
        cancel() {
          cancelled++;
        },
      }),
    ),
    abort.signal,
  );
  const pending = stream.next();
  abort.abort(new Error("stop"));
  await expect(pending).rejects.toThrow("stop");
  const invalid = new Response(
    new ReadableStream({
      start(c) {
        c.enqueue(
          encodeSSE({ type: "response.completed" }, "response.completed"),
        );
      },
      cancel() {
        cancelled++;
      },
    }),
  );
  await expect(Array.fromAsync(readResponses(invalid))).rejects.toMatchObject({
    code: "invalid_event",
  });
  expect(cancelled).toBe(2);
});

test("bundled host stream errors remain recognizable by a separately loaded SDK", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-model-error-bundle-"));
  try {
    const build = await Bun.build({
      entrypoints: [new URL("../src/responses.ts", import.meta.url).pathname],
      target: "bun",
      outdir: directory,
    });
    expect(build.success).toBe(true);
    const bundled = await import(join(directory, "responses.js"));
    const error = new bundled.ResponseStreamError({
      type: "response.incomplete",
      sequence_number: 1,
      response: resource({
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
      }),
    });
    expect(error).toBeInstanceOf(ResponseStreamError);
    expect(error.event.response.incomplete_details.reason).toBe(
      "max_output_tokens",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("function call streaming and round-trip input preserve arguments and reasoning metadata", async () => {
  const call = {
    type: "function_call" as const,
    id: "fc_test",
    call_id: "call_test",
    name: "weather",
    arguments: '{"city":"Paris"}',
    status: "completed" as const,
  };
  const events: ResponseEvent[] = [
    {
      type: "response.output_item.added",
      sequence_number: 0,
      output_index: 0,
      item: { ...call, arguments: "", status: "in_progress" },
    },
    {
      type: "response.function_call_arguments.delta",
      sequence_number: 1,
      item_id: call.id,
      output_index: 0,
      delta: call.arguments,
    },
    {
      type: "response.function_call_arguments.done",
      sequence_number: 2,
      item_id: call.id,
      output_index: 0,
      arguments: call.arguments,
    },
    {
      type: "response.output_item.done",
      sequence_number: 3,
      output_index: 0,
      item: call,
    },
    {
      ...completed,
      sequence_number: 4,
      response: resource({
        output: [call],
        reasoning: { effort: "high", summary: null },
      }),
    },
  ];
  expect(await read(events)).toEqual(events);
  expect(
    validateResponseRequest({
      ...request,
      input: [
        ...request.input,
        call,
        {
          type: "function_call_output",
          call_id: call.call_id,
          output: "sunny",
        },
      ],
    }).input,
  ).toHaveLength(3);
  // An extension property on a core delta is not a response lifecycle event.
  const extended = [{ ...delta, response: null }, completed];
  expect(JSON.stringify(await read(extended))).toBe(JSON.stringify(extended));
});

test("only a literal DONE frame is a marker, and it cannot repeat", async () => {
  const body = await responseFrom([completed]).text();
  for (const suffix of [
    'data: "[DONE]"\n\n',
    "data: [DONE]\n\ndata: [DONE]\n\n",
  ]) {
    await expect(
      Array.fromAsync(readResponses(new Response(body + suffix))),
    ).rejects.toMatchObject({ code: "invalid_event" });
  }
});
