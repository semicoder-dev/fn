import type { HostBridge } from "./types";
import type { WebClient, WebFetchInput, WebSearchInput, WebOptions, WebTask } from "./web";

function failure(code: string, message: string) {
  return Object.assign(new Error(message), { name: "WebError", code });
}
function retryable(error: unknown) {
  return (
    error !== null && typeof error === "object" && "code" in error &&
    ["disconnected", "execution_unknown", "timeout"].includes(String(error.code))
  );
}
/** Keep the long-running operation on the host; individual bridge calls stay short. */
export function createWebClient(bridge: HostBridge, pluginId: string): WebClient {
  const execute = async (
    kind: "search" | "fetch",
    input: WebSearchInput | WebFetchInput,
    { signal }: WebOptions = {},
  ) => {
    signal?.throwIfAborted();
    return new Promise<NonNullable<WebTask["result"]>>((resolve, reject) => {
      let id: string | undefined;
      let finished = false,
        reading = false,
        cancelling = false;
      let timer: ReturnType<typeof setInterval> | undefined;
      let deadline: ReturnType<typeof setTimeout> | undefined;
      const cleanups: (() => void)[] = [];
      const finish = (task?: WebTask, error?: unknown) => {
        if (finished) return;
        if (!error && task?.status === "running") return;
        finished = true;
        clearInterval(timer);
        clearTimeout(deadline);
        for (const cleanup of cleanups) cleanup();
        if (error) reject(error);
        else if (signal?.aborted) reject(signal.reason);
        else if (task?.status === "cancelled")
          reject(new DOMException("网络任务已取消", "AbortError"));
        else if (task?.error) reject(failure(task.error.code, task.error.message));
        else if (task?.status === "completed" && task.result) resolve(task.result);
        else reject(failure("invalid_result", "网络任务返回无效结果"));
      };
      const read = async () => {
        if (!id || reading || finished || cancelling) return;
        reading = true;
        try {
          finish((await bridge.call("web.get", { pluginId, taskId: id })) as WebTask);
        } catch (error) {
          if (!retryable(error)) finish(undefined, error);
        } finally {
          reading = false;
        }
      };
      const cancel = async () => {
        if (!id || finished || cancelling) return;
        cancelling = true;
        try {
          finish((await bridge.call("web.cancel", { pluginId, taskId: id })) as WebTask);
        } catch (error) {
          if (!retryable(error)) finish(undefined, error);
        } finally {
          cancelling = false;
        }
      };
      const abort = () => {
        void cancel();
      };
      try {
        cleanups.push(
          bridge.on("web.changed", (payload) => {
            const change = payload as { pluginId: string; id: string };
            if (change.pluginId === pluginId && change.id === id) void read();
          }),
        );
        cleanups.push(
          bridge.onReconnect(() => {
            if (signal?.aborted) void cancel();
            else void read();
          }),
        );
        signal?.addEventListener("abort", abort, { once: true });
        cleanups.push(() => signal?.removeEventListener("abort", abort));
        // Also catches completion notifications lost before start returned, or during reconnect.
        timer = setInterval(() => {
          if (signal?.aborted) void cancel();
          else void read();
        }, 1000);
        void bridge.call(`web.${kind}`, { pluginId, input }).then(
          (value) => {
            const task = value as WebTask;
            id = task.id;
            // Host work lasts at most 120 seconds; allow transport recovery without
            // retaining subscriptions forever when the application is gone.
            deadline = setTimeout(
              () => finish(undefined, failure("timeout", "等待网络任务结果超时")),
              150_000,
            );
            if (signal?.aborted) void cancel();
            else {
              finish(task);
              if (!finished) void read();
            }
          },
          (error) => finish(undefined, error),
        );
      } catch (error) {
        finish(undefined, error);
      }
    });
  };
  return {
    search: (input, options) =>
      execute("search", input, options) as ReturnType<WebClient["search"]>,
    fetch: (input, options) => execute("fetch", input, options) as ReturnType<WebClient["fetch"]>,
  };
}
