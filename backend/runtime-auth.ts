import type { FnRuntime } from "../packages/runtime/src/index.ts";
import type { AuthEvent, AuthPrompt } from "../packages/runtime/src/auth.ts";
import type { Json } from "../packages/runtime/src/types.ts";

interface LoginState {
  id: string;
  connectionId: string;
  status: "running" | "completed" | "failed" | "cancelled";
  events: Json[];
  prompt: Json | null;
  error: string | null;
}
interface Attempt {
  value: LoginState;
  controller: AbortController;
  done: Promise<void>;
  reply?: { id: string; settle(value: string): void };
}

/** UI interactions outlive a window; Pi owns the authentication protocol. */
export class RuntimeAuth {
  private readonly attempts = new Map<string, Attempt>();
  private closed = false;
  constructor(
    private readonly runtime: FnRuntime,
    private readonly openURL: (url: string) => Promise<void>,
    private readonly changed: () => void,
  ) {}
  list(): LoginState[] { return [...this.attempts.values()].map(({ value }) => structuredClone(value)); }
  start(connectionId: string): LoginState {
    if (this.closed) throw new Error("登录服务已关闭");
    if ([...this.attempts.values()].some(a => a.value.connectionId === connectionId && a.value.status === "running"))
      throw new Error("该连接已有登录进行中");
    // Keep only bounded completed UI records. Credentials never enter this journal.
    for (const [id, old] of this.attempts) {
      if (this.attempts.size < 32) break;
      if (old.value.status !== "running") this.attempts.delete(id);
    }
    const value: LoginState = {
      id: crypto.randomUUID(), connectionId, status: "running", events: [], prompt: null, error: null,
    };
    const attempt: Attempt = { value, controller: new AbortController(), done: Promise.resolve() };
    this.attempts.set(value.id, attempt);
    attempt.done = Promise.resolve().then(() => this.runtime.connections.auth.login(connectionId, {
      signal: attempt.controller.signal,
      notify: event => this.notify(attempt, event),
      prompt: prompt => this.prompt(attempt, prompt),
    })).then(() => { value.status = "completed"; }, () => {
      value.status = attempt.controller.signal.aborted ? "cancelled" : "failed";
      // Provider errors can include token endpoint bodies or entered credentials.
      value.error = value.status === "failed" ? "登录失败，请检查连接设置后重试。" : null;
    }).finally(() => { value.prompt = null; attempt.reply = undefined; this.changed(); });
    this.changed();
    return structuredClone(value);
  }
  private notify(attempt: Attempt, event: AuthEvent) {
    attempt.value.events.push(JSON.parse(JSON.stringify(event)) as Json);
    if (attempt.value.events.length > 30) attempt.value.events.shift();
    this.changed();
    const url = event.type === "auth_url" ? event.url : event.type === "device_code" ? event.verificationUri : undefined;
    if (url && /^https?:\/\//.test(url)) {
      void this.openURL(url).catch(() => {
        attempt.value.events.push({ type: "info", message: "无法自动打开浏览器，请使用登录链接。" });
        this.changed();
      });
    }
  }
  private prompt(attempt: Attempt, prompt: AuthPrompt): Promise<string> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const { signal: promptSignal, ...display } = prompt;
      const signal = promptSignal === undefined ? attempt.controller.signal
        : AbortSignal.any([attempt.controller.signal, promptSignal]);
      const cleanup = () => {
        signal.removeEventListener("abort", abort);
        if (attempt.reply?.id === id) { attempt.reply = undefined; attempt.value.prompt = null; this.changed(); }
      };
      const abort = () => { cleanup(); reject(signal.reason ?? new DOMException("Cancelled", "AbortError")); };
      attempt.reply = { id, settle: value => { cleanup(); resolve(value); } };
      attempt.value.prompt = { id, ...display } as Json;
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) abort();
      this.changed();
    });
  }
  reply(id: string, promptId: string, value: string) {
    const attempt = this.attempts.get(id);
    if (!attempt?.reply || attempt.reply.id !== promptId) throw new Error("登录提示已过期");
    attempt.reply.settle(value);
  }
  async cancel(id: string) {
    const attempt = this.attempts.get(id);
    if (!attempt) return;
    attempt.controller.abort();
    await attempt.done;
  }
  async close() {
    this.closed = true;
    for (const attempt of this.attempts.values()) attempt.controller.abort();
    await Promise.allSettled([...this.attempts.values()].map(a => a.done));
  }
}
