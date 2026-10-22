import { expect, test } from "bun:test";
import { createAPIRegistry, defineAPI, implementAPI, z } from "../src/business-api.ts";
import { APIServer } from "../src/api-server.ts";
import type { BackendNativeClient } from "../src/backend.ts";

function server() {
  const registry = createAPIRegistry();
  const api = new APIServer(registry, {
    native: {} as BackendNativeClient,
    app: {
      name: "test",
      identifier: "test",
      codeDirectory: "/tmp",
      runtimeDirectory: "/tmp",
      dataDirectory: "/tmp",
    },
  });
  api.ready = true;
  const call = (method: string) =>
    api.fetch(
      new Request("http://localhost/call", {
        method: "POST",
        body: JSON.stringify({ method, input: null, requestId: crypto.randomUUID() }),
      }),
      "ui",
    );
  return { registry, api, call };
}
const contract = defineAPI({
  methods: {
    read: { description: "Read provider", input: z.null(), output: z.string() },
  },
  events: { changed: { description: "Provider changed", payload: z.string() } },
});

test("live registration updates schema; colliding groups fail atomically; local names remain isolated", async () => {
  const { registry, api, call } = server();
  const first = implementAPI(contract, { read: () => "a" });
  const disposeA = registry.register("alpha", first);
  const disposeB = registry.register("beta", implementAPI(contract, { read: () => "b" }));
  expect(Object.keys(api.schema.methods)).toEqual(["alpha.read", "beta.read"]);
  expect(() => registry.register("alpha", first)).toThrow("already registered");
  expect(await (await call("alpha.read")).json()).toEqual({ result: "a" });
  expect(await (await call("beta.read")).json()).toEqual({ result: "b" });
  await disposeA();
  expect(Object.keys(api.schema.methods)).toEqual(["beta.read"]);
  expect(await (await call("alpha.read")).json()).toMatchObject({ error: { code: "not_found" } });
  expect(Object.keys(api.schema.events)).toEqual(["beta.changed"]);
  await disposeB();
  api.close();
});

test("unload closes admission, cancels active calls and awaits provider settlement before reuse", async () => {
  const { registry, api, call } = server();
  const started = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  let aborted = false;
  const dispose = registry.register(
    "provider",
    implementAPI(contract, {
      async read(_, context) {
        context.signal.addEventListener(
          "abort",
          () => {
            aborted = true;
          },
          { once: true },
        );
        context.emit("changed", "started");
        started.resolve();
        await release.promise;
        return "too late";
      },
    }),
  );
  const response = call("provider.read");
  await started.promise;
  const stopped = dispose();
  expect(aborted).toBe(true);
  expect(Object.keys(api.schema.methods)).toEqual([]);
  expect(() =>
    registry.register("provider", implementAPI(contract, { read: () => "new" })),
  ).toThrow();
  release.resolve();
  await stopped;
  expect(await (await response).json()).toHaveProperty("error");
  const replacement = registry.register("provider", implementAPI(contract, { read: () => "new" }));
  await dispose(); // An old disposer must not remove a new registration.
  expect(await (await call("provider.read")).json()).toEqual({ result: "new" });
  await replacement();
  api.close();
});
