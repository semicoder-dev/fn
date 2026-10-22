import { Service, type Context } from "@deepseek-ai/cordis";
import { implementAPI } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-session-controller/service";
import type {} from "@semicoder/fn-rpc";
import api from "./contract.ts";
export interface ChatEndpoint {
  targetId: string;
  name: string;
  description?: string;
}
/** Optional Chat entries are contributions; a plugin need not contribute a page or an Agent. */
export default class Chat extends Service {
  static inject = ["sessionController", "rpc"];
  private endpoints = new Map<string, ChatEndpoint>();
  constructor(ctx: Context) {
    super(ctx, "chat");
  }
  async *[Service.init]() {
    this.ctx.rpc.register("chat", implementAPI(api, { endpoints: () => this.list() }));
  }
  register(endpoint: ChatEndpoint): () => void {
    this.ctx.sessionController.target(endpoint.targetId);
    if (this.endpoints.has(endpoint.targetId)) throw new Error("Duplicate Chat target");
    const value = Object.freeze({ ...endpoint });
    return this.ctx.effect(() => {
      this.endpoints.set(value.targetId, value);
      this.changed();
      return () => {
        this.endpoints.delete(value.targetId);
        this.changed();
      };
    });
  }
  list() {
    return [...this.endpoints.values()];
  }
  require(targetId: string) {
    const value = this.endpoints.get(targetId);
    if (!value) throw new Error("Chat endpoint is unavailable");
    return value;
  }
  private changed() {
    this.ctx.rpc.emit("chat", "changed", {});
    this.ctx.emit("fn/chat-change");
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    chat: Chat;
  }
  interface Events {
    "fn/chat-change"(): void;
  }
}
