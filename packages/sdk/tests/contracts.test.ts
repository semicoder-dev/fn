import { expect, test } from "bun:test";
import { manifestSchema } from "../src/manifest.ts";
import { parseSummary } from "../src/summary.ts";
import { readSSE } from "../src/sse.ts";
const manifest = {
  manifestVersion: 1,
  id: "example-app",
  version: "0.1.0",
  hostApi: 2,
  name: { key: "name" },
  entries: {},
  locales: { default: "en", messages: { en: "locales/en.json" } },
  uses: [],
  contributes: {},
};
test("summary declarations require explicit capability, backend and new host API", () => {
  const dynamic = {
    ...manifest,
    entries: { backend: "src/backend.ts" },
    uses: ["application.summary"],
    contributes: { summary: { initial: "summary/initial.json" } },
  };
  expect(manifestSchema.parse(dynamic).hostApi).toBe(2);
  for (const invalid of [
    { ...dynamic, hostApi: 1 },
    { ...dynamic, entries: {} },
    { ...dynamic, contributes: {} },
    { ...dynamic, contributes: { summary: { initial: "../secret" } } },
    { ...dynamic, contributes: { summary: { size: "2x2" } } },
    { ...manifest, contributes: { widgets: [] } },
    { ...dynamic, uses: ["widgets.publish"] },
  ])
    expect(() => manifestSchema.parse(invalid)).toThrow();
  expect(
    manifestSchema.parse({ ...manifest, contributes: { summary: {} } })
      .contributes.summary,
  ).toEqual({});
});
test("manifest permits a status-only application and rejects unsafe paths and chat without a backend", () => {
  expect(manifestSchema.parse(manifest).entries).toEqual({});
  for (const path of [
    "../secret",
    "/secret",
    "src/../secret",
    "a\\b",
    "https://x",
  ]) {
    expect(() =>
      manifestSchema.parse({ ...manifest, entries: { backend: path } }),
    ).toThrow();
  }
  expect(() =>
    manifestSchema.parse({
      ...manifest,
      contributes: { chat: { id: "chat", name: "Chat" } },
    }),
  ).toThrow();
});
test("cancellation closes an idle SSE reader without waiting for another network frame", async () => {
  const controller = new AbortController();
  let cancelled = false;
  const response = new Response(
    new ReadableStream({
      cancel() {
        cancelled = true;
      },
    }),
  );
  const stream = readSSE(response, controller.signal);
  const pending = stream.next();
  controller.abort(new Error("cancelled by caller"));
  await expect(pending).rejects.toThrow("cancelled by caller");
  expect(cancelled).toBe(true);
});
test("summaries bound content and reject layout, code, invalid numeric values and unknown fields", () => {
  expect(
    parseSummary({
      version: 1,
      metrics: [{ value: 12, label: { key: "count" } }],
    }).metrics?.[0]?.value,
  ).toBe(12);
  for (const fields of [
    { html: "<script>" },
    { body: { type: "column", children: [] } },
    { progress: { value: 2 } },
    { metrics: Array.from({ length: 4 }, () => ({ value: 1 })) },
    { badges: Array.from({ length: 3 }, () => ({ text: "ok" })) },
    { sparkline: { values: [NaN, 2] } },
    { sparkline: { values: [1] } },
    { sparkline: { values: Array(121).fill(1) } },
    { text: "x".repeat(4001) },
    { metrics: [{ value: Infinity }] },
    {
      text: {
        key: "text",
        args: Object.fromEntries(
          Array.from({ length: 40 }, (_, i) => [String(i), "中".repeat(500)]),
        ),
      },
    },
  ])
    expect(() => parseSummary({ version: 1, ...fields })).toThrow();
  expect(parseSummary({ version: 1, text: "<b>plain text</b>" }).text).toBe(
    "<b>plain text</b>",
  );
});
test("SSE decodes split UTF-8 and CRLF frames and detects truncated frames", async () => {
  const bytes = new TextEncoder().encode(
    'event: data\r\ndata: {"text":"你好"}\r\n\r\nevent: done\ndata: null\n\n',
  );
  const stream = new ReadableStream({
    start(c) {
      for (const byte of bytes) c.enqueue(Uint8Array.of(byte));
      c.close();
    },
  });
  const values = await Array.fromAsync(readSSE(new Response(stream)));
  expect(values).toEqual([
    { event: "data", data: { text: "你好" } },
    { event: "done", data: null },
  ]);
  await expect(
    Array.fromAsync(readSSE(new Response('data: {"text":"unfinished"}'))),
  ).rejects.toThrow();
});
