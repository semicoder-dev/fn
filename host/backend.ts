import { defineBackend, implementAPI } from "@semicoder/fia/backend";
import { ApplicationPlatform, type SocketData } from "@semicoder/fn-host";
import api from "./api.ts";
let platform: ApplicationPlatform;
export default defineBackend<SocketData>({
  api: implementAPI(api, {
    "platform.command": async ({ action, input }) =>
      JSON.parse(
        JSON.stringify((await platform.command(action, input)) ?? null),
      ),
  }),
  http: {
    authorize: (request) => platform?.authorize(request) ?? false,
    callbacks: { "/fn/auth/callback": (request) => platform.callback(request) },
    fetch: (request, server) => platform.fetch(request, server),
    pages: (request) => platform.page(new URL(request.url).pathname),
    maxRequestBodySize: 1024 * 1024,
    websocket: {
      maxPayloadLength: 1024 * 1024,
      backpressureLimit: 2 * 1024 * 1024,
      closeOnBackpressureLimit: true,
      open: (socket) => platform.websocket.open(socket),
      message: (socket, message) => platform.websocket.message(socket, message),
      close: (socket) => platform.websocket.close(socket),
    },
  },
  async start(context) {
    platform = new ApplicationPlatform(context);
    await platform.start();
  },
  async beforeUpdate() {
    return {
      ready: ![...platform.runs.values()].some((r) => r.pending.size > 0),
      reason: "Applications have active tasks",
    };
  },
  async stop() {
    await platform.stop();
  },
});
