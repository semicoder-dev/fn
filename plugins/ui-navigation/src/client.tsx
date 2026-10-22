import { Service, type Context } from "@deepseek-ai/cordis";
export default class Navigation extends Service {
  private path = "plugins";
  private listeners = new Set<() => void>();
  constructor(ctx: Context) {
    super(ctx, "navigation");
  }
  snapshot = () => this.path;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  go(path: string) {
    this.path = path;
    for (const listener of this.listeners) listener();
  }
}
declare module "@deepseek-ai/cordis" {
  interface Context {
    navigation: Navigation;
  }
}
