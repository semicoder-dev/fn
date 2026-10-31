import { expect, test } from "bun:test";
import { manifestSchema, widgetDefinitionSchema } from "../src/manifest.ts";
import { parseWidget, widgetDimensions } from "../src/widgets.ts";
import { readSSE } from "../src/sse.ts";
const manifest = {
  manifestVersion: 1,
  id: "example-app",
  version: "0.1.0",
  hostApi: 1,
  name: { key: "name" },
  entries: {},
  locales: { default: "en", messages: { en: "locales/en.json" } },
  uses: [],
  contributes: { widgets: [] },
};
test("widget declarations require one fixed grid size within bounds", () => {
  const widget = {
    id: "summary",
    size: "2x2",
    initial: "widgets/summary.json",
  };
  expect(widgetDefinitionSchema.parse(widget).size).toBe("2x2");
  expect(widgetDimensions("3x2")).toEqual({ columns: 3, rows: 2 });
  expect(widgetDefinitionSchema.parse({ ...widget, size: "4x4" }).size).toBe(
    "4x4",
  );
  for (const size of [
    undefined,
    null,
    [],
    ["1x1"],
    ["1x1", "2x2"],
    "0x1",
    "1x0",
    "5x1",
    "1x5",
    "1.5x1",
    "2×2",
    "small",
  ])
    expect(() =>
      manifestSchema.parse({
        ...manifest,
        contributes: { widgets: [{ ...widget, size }] },
      }),
    ).toThrow();
  expect(() =>
    widgetDefinitionSchema.parse({ ...widget, sizes: ["1x1", "2x2"] }),
  ).toThrow();
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
test("widgets reject code, unsafe content, excessive depth and unbounded values", () => {
  expect(
    parseWidget({
      version: 1,
      body: { type: "metric", value: 12, label: { key: "count" } },
    }).body.type,
  ).toBe("metric");
  for (const body of [
    { type: "react", component: "App" },
    { type: "text", text: "ok", html: "<script>" },
    { type: "progress", value: 2 },
    {
      type: "list",
      children: Array.from({ length: 33 }, () => ({ type: "divider" })),
    },
  ])
    expect(() => parseWidget({ version: 1, body })).toThrow();
  let body: any = { type: "text", text: "hello" };
  for (let i = 0; i < 10; i++) body = { type: "column", children: [body] };
  expect(() => parseWidget({ version: 1, body })).toThrow();
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
