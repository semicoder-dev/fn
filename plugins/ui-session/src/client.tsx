import { Service, type Context } from "@deepseek-ai/cordis";
import type {
  StandardSourceBinding,
  ScopedStandardSourceBinding,
} from "@deepseek-ai/dsh-client-ui-slots";
import type {} from "@deepseek-ai/dsh-client-ui-renderer/client";
/** Supplies the renderer's required optional Session scope; no Agent objects cross to the browser. */
export default class UiSession extends Service {
  static inject = ["slots"];
  private listeners = new Set<() => void>();
  private absent: StandardSourceBinding = {
    key: undefined,
    hooks: {},
    keyedHooks: {},
    props: { sessionId: undefined },
  };
  private bindings = new Map<string, ScopedStandardSourceBinding>();
  private current: StandardSourceBinding = this.absent;
  constructor(ctx: Context) {
    super(ctx, "uiSession");
  }
  async *[Service.init]() {
    this.ctx.slots.installScope("session", {
      current: {
        getSnapshot: () => this.current,
        subscribe: (listener) => {
          this.listeners.add(listener);
          return () => {
            this.listeners.delete(listener);
          };
        },
      },
      bindingSource: (target) => {
        const binding = typeof target === "string" ? this.binding(target) : this.absent;
        return { getSnapshot: () => binding, subscribe: () => () => {} };
      },
    });
    yield () => {
      this.listeners.clear();
      this.bindings.clear();
      this.current = this.absent;
    };
  }
  private binding(id: string) {
    if (!this.bindings.has(id))
      this.bindings.set(id, {
        key: id,
        ctx: this.ctx,
        hooks: {},
        keyedHooks: {},
        props: { sessionId: id },
      });
    return this.bindings.get(id)!;
  }
  select(id?: string) {
    this.current = id ? this.binding(id) : this.absent;
    for (const listener of this.listeners) listener();
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    uiSession: UiSession;
  }
}
declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotScopeTargetMap {
    session: string;
  }
}
