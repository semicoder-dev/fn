import { Service, type Context } from "@deepseek-ai/cordis";
import type { APIContract, APIImplementation } from "@semicoder/fia/api";
import type {} from "@semicoder/fn-host";

/** Binds the framework's generic API registration to the caller's Cordis fiber. */
export default class RpcService extends Service {
  constructor(ctx: Context) {
    super(ctx, "rpc");
  }
  register<C extends APIContract>(namespace: string, implementation: APIImplementation<C>) {
    return this.ctx.effect(() => this.ctx.host.api.register(namespace, implementation));
  }
  emit(namespace: string, event: string, payload: unknown) {
    this.ctx.host.platform.emit(`${namespace}.${event}`, payload);
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    rpc: RpcService;
  }
}
