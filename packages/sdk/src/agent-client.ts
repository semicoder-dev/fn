import type { AgentClient } from "./agent";
import type { HostBridge } from "./types";

export function createAgentClient(bridge: HostBridge, pluginId: string): AgentClient {
  const call = <T>(method: string, input: object) =>
    bridge.call(method, { pluginId, ...input }) as Promise<T>;
  return {
    tools: () => call("agents.tools", {}),
    create: (input) => call("agents.create", { input }),
    list: () => call("agents.list", {}),
    get: (sessionId) => call("agents.get", { sessionId }),
    events: (sessionId, after = 0) => call("agents.events", { sessionId, after }),
    send: (sessionId, text) => call("agents.send", { sessionId, text }),
    cancel: (sessionId) => call("agents.cancel", { sessionId }),
    remove: async (sessionId) => {
      await call("agents.remove", { sessionId });
    },
    onChange: (listener) =>
      bridge.on("agents.changed", (value) => {
        const change = value as Parameters<typeof listener>[0];
        if (change.pluginId === pluginId) listener(change);
      }),
  };
}
