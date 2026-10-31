/** Acknowledgements bind to both the page and the immutable composition, never just a process epoch. */
export class ActivationClients {
  private clients = new Map<string, number>();
  private pending?: {
    generation: string;
    waiting: Set<string>;
    resolve: () => void;
    reject: (error: Error) => void;
  };
  touch(clientId: string, generation: string, error?: string) {
    this.clients.set(clientId, Date.now());
    const pending = this.pending;
    if (!pending || pending.generation !== generation) return;
    if (error) {
      pending.reject(new Error(`客户端更新失败：${error}`));
      return;
    }
    pending.waiting.delete(clientId);
    if (!pending.waiting.size) pending.resolve();
  }
  wait(generation: string, timeout = 20_000) {
    for (const [id, time] of this.clients) if (Date.now() - time >= 15_000) this.clients.delete(id);
    const waiting = new Set(this.clients.keys());
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error("等待客户端应用插件超时")), timeout);
      const finish = (error?: Error) => {
        clearTimeout(timer);
        this.pending = undefined;
        error ? reject(error) : resolve();
      };
      this.pending = { generation, waiting, resolve: () => finish(), reject: finish };
      if (!waiting.size) finish();
    });
  }
}
