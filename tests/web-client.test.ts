import { expect, test } from "bun:test";
import { createWebClient } from "../packages/sdk/src/web-client";
import type { HostBridge, WebTask } from "../packages/sdk/src/types";
const result = { text: "answer", results: [], engines: [] };
function fixture(start?: () => Promise<WebTask>) {
  let listener: ((value: unknown) => void) | undefined;
  let reconnect: (() => void) | undefined;
  const calls: string[] = [];
  const failures = new Map<string, number>();
  const task: WebTask = {
    id: "task",
    pluginId: "p",
    kind: "search",
    status: "running",
    result: null,
    error: null,
    createdAt: 1,
    updatedAt: 1,
  };
  const bridge: HostBridge = {
    async call(method) {
      calls.push(method);
      const remaining = failures.get(method) ?? 0;
      if (remaining) {
        failures.set(method, remaining - 1);
        throw Object.assign(new Error("connection lost"), { code: "execution_unknown" });
      }
      if (method === "web.search") return start ? start() : structuredClone(task);
      if (method === "web.cancel") task.status = "cancelled";
      return structuredClone(task);
    },
    on(_, callback) {
      listener = callback;
      return () => {
        listener = undefined;
      };
    },
    onReconnect(callback) {
      reconnect = callback;
      return () => {
        reconnect = undefined;
      };
    },
  };
  return {
    task,
    calls,
    failures,
    client: createWebClient(bridge, "p"),
    change: () => listener?.({ id: task.id, pluginId: "p" }),
    reconnect: () => reconnect?.(),
    get listeners() {
      return Boolean(listener || reconnect);
    },
  };
}

test("SDK reads authoritative results after reconnect and cleans subscriptions", async () => {
  const f = fixture();
  f.failures.set("web.get", 1);
  const pending = f.client.search({ query: "hello" });
  await Bun.sleep(0);
  f.task.status = "completed";
  f.task.result = result;
  f.reconnect();
  expect(await pending).toEqual(result);
  expect(f.calls.filter((value) => value === "web.search")).toHaveLength(1);
  expect(f.calls.filter((value) => value === "web.get")).toHaveLength(2);
  expect(f.listeners).toBe(false);
});

test("SDK cancels after a delayed start acknowledgement instead of abandoning host work", async () => {
  let acknowledge!: (task: WebTask) => void;
  const f = fixture(
    () =>
      new Promise((resolve) => {
        acknowledge = resolve;
      }),
  );
  const ctrl = new AbortController();
  const pending = f.client.search({ query: "hello" }, { signal: ctrl.signal });
  ctrl.abort();
  acknowledge(structuredClone(f.task));
  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  expect(f.calls).toEqual(["web.search", "web.cancel"]);
  expect(f.task.status).toBe("cancelled");
  expect(f.listeners).toBe(false);
});

test("completion before the start reply is observed; already-aborted SDK calls do not invoke", async () => {
  const f = fixture();
  f.task.status = "completed";
  f.task.result = result;
  expect(await f.client.search({ query: "hello" })).toEqual(result);
  expect(f.listeners).toBe(false);
  const count = f.calls.length;
  await expect(
    f.client.search({ query: "hello" }, { signal: AbortSignal.abort() }),
  ).rejects.toThrow();
  expect(f.calls).toHaveLength(count);
});

test("SDK polling recovers missed notifications and exposes structured task errors", async () => {
  const f = fixture();
  const pending = f.client.search({ query: "hello" });
  await Bun.sleep(0);
  f.task.status = "failed";
  f.task.error = { code: "too_large", message: "limit" };
  await expect(pending).rejects.toMatchObject({ code: "too_large", message: "limit" });
  expect(f.listeners).toBe(false);
});

test("SDK does not replay a failed start request", async () => {
  const f = fixture(async () => {
    throw new Error("connection lost");
  });
  await expect(f.client.search({ query: "hello" })).rejects.toThrow("connection lost");
  expect(f.calls).toEqual(["web.search"]);
  expect(f.listeners).toBe(false);
});

test("SDK retries cancellation by task ID after a transport failure", async () => {
  const f = fixture();
  f.failures.set("web.cancel", 1);
  const ctrl = new AbortController();
  const pending = f.client.search({ query: "hello" }, { signal: ctrl.signal });
  await Bun.sleep(0);
  ctrl.abort();
  await Bun.sleep(0);
  f.reconnect();
  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  expect(f.calls.filter((value) => value === "web.search")).toHaveLength(1);
  expect(f.calls.filter((value) => value === "web.cancel")).toHaveLength(2);
  expect(f.listeners).toBe(false);
});
