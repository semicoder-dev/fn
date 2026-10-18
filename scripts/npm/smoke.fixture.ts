import { messageSchema as chatMessageSchema } from "@semicoder/fn-sdk/chat";
// Copied to a temporary consumer of the npm archive by pack.ts.
import { strict as assert } from "node:assert";
import { buildPlugin } from "@semicoder/fn-sdk/build";
import { defineMethod, definePlugin, defineTool, z } from "@semicoder/fn-sdk/runtime";
import { createPluginClient } from "@semicoder/fn-sdk/client";
import { Button, Panel } from "@semicoder/fn-sdk/ui";

assert.equal(typeof createPluginClient, "function");
assert.equal(typeof Button, "function");
assert.equal(typeof Panel, "function");
const method = defineMethod("echo", z.object({ text: z.string() }), (input) => input.text);
const plugin = definePlugin({ methods: { echo: method } });
assert.equal(plugin.methods?.echo, method);
assert.equal(await method.execute({ text: "archive works" }, {} as never), "archive works");
assert.throws(() => method.execute({ text: 1 }, {} as never));
for (const directory of ["notes", "model"]) {
  await buildPlugin(directory);
  const client = await Bun.file(`${directory}/dist/client.js`).text();
  assert(client.includes("__FN_MODULES__"), "Plugin must use the host React runtime");
  const imports = new Bun.Transpiler({ loader: "js" }).scanImports(client);
  assert.equal(imports.length, 0, "Plugin dependencies must be bundled or supplied by the host");
}

const backend = (await import(`${process.cwd()}/model/dist/backend.js`)).default;
assert.equal(await backend.methods.echo.execute("built backend"), "built backend");
assert(
  (await Bun.file(new URL(import.meta.resolve("@semicoder/fn-sdk/theme.css"))).text()).includes(
    "--m-bg",
  ),
);
console.log("Standalone SDK imports, schema validation and frontend/backend builds passed");

const webFixture = {
  id: "web",
  pluginId: "smoke",
  kind: "search",
  status: "completed",
  result: { text: "archive network API", results: [], engines: [] },
  error: null,
  createdAt: 1,
  updatedAt: 1,
};
Object.assign(globalThis, {
  __FN_BRIDGE__: {
    call: async () => webFixture,
    on: () => () => {},
    onReconnect: () => () => {},
  },
});
assert.equal(
  (await createPluginClient("smoke").web.search({ query: "archive" })).text,
  "archive network API",
);

const chatMessage = chatMessageSchema.parse({
  protocolVersion: 2,
  id: "event",
  hostId: "host",
  pluginId: "smoke",
  conversationId: "chat:host:smoke",
  deviceId: "client",
  createdAt: 1,
  kind: "userText",
  text: "archive chat",
  botVersion: "1:1",
});
const received: string[] = [];
const chatPlugin = definePlugin({
  methods: {},
  chat: {
    version: 1,
    onMessage: (message) => {
      received.push(message.id);
    },
    onResponse: () => {},
  },
});
assert.equal(chatMessage.kind, "userText");
if (chatMessage.kind !== "userText") throw new Error("Wrong chat message kind");
await chatPlugin.chat!.onMessage(chatMessage, {} as never);
assert.deepEqual(received, ["event"]);
if (chatMessageSchema.safeParse({ protocolVersion: 2 }).success)
  throw new Error("Invalid chat message accepted");

const agentProtocol = await import("@semicoder/fn-sdk/agent");
const agentConfig = agentProtocol.agentCreate.parse({ modelId: "model", tools: ["web_search"] });
assert.equal(agentConfig.maxSteps, 8);
const agentTool = defineTool("Echo", z.object({ text: z.string() }), input => ({ content: [{ type: "text", text: input.text }] }));
assert.deepEqual(await agentTool.execute({ text: "agent archive" }, {} as never), { content: [{ type: "text", text: "agent archive" }] });
assert.throws(() => agentTool.execute({ text: 1 }, {} as never));
assert.equal(typeof createPluginClient("smoke").agents.events, "function");
assert.equal(typeof createPluginClient("smoke").agents.remove, "function");
