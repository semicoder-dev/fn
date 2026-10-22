import { Service, type Context } from "@deepseek-ai/cordis";

/** Sources describe work, never product types. New work is rejected while draining. */
export default class ActivityService extends Service {
  private readonly sources = new Map<symbol, () => boolean>();
  private leases = 0;
  accepting = true;
  constructor(ctx: Context) {
    super(ctx, "activity");
  }
  assertAccepting() {
    if (!this.accepting) throw new Error("The host is draining for restart");
  }
  watch(source: () => boolean): () => void {
    const key = Symbol();
    return this.ctx.effect(() => {
      this.sources.set(key, source);
      return () => {
        this.sources.delete(key);
      };
    });
  }
  async run<T>(operation: () => T | Promise<T>): Promise<T> {
    this.assertAccepting();
    this.leases++;
    try {
      return await operation();
    } finally {
      this.leases--;
    }
  }
  busy(): boolean {
    return this.leases > 0 || [...this.sources.values()].some((source) => source());
  }
  drain(): boolean {
    if (this.busy()) return false;
    this.accepting = false;
    return true;
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    activity: ActivityService;
  }
}
