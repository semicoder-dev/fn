import type { Context } from "@deepseek-ai/cordis";
import { defineTool } from "@deepseek-ai/dsh-tools";
import {
  checkedText,
  httpURL,
  limitedText,
  within,
  workspace,
  toolContext,
  registerTools,
  MAX_TOOL_OUTPUT_BYTES,
  MAX_TOOL_FILE_BYTES,
} from "@semicoder/fn-tool-support";
function signalGroup(pid: number, signal: NodeJS.Signals): boolean {
  try {
    process.kill(-pid, signal);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return false;
    throw error;
  }
}

async function runCommand(command: string, cwd: string, signal: AbortSignal, timeoutMs: number) {
  signal.throwIfAborted();
  const child = Bun.spawn(["/bin/sh", "-c", command], {
    cwd,
    detached: true,
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const budget = { bytes: 0, truncated: false };
  let termination: Promise<void> | undefined;
  let timedOut = false;
  const terminate = (): Promise<void> =>
    (termination ??= (async () => {
      if (!signalGroup(child.pid, "SIGTERM")) return;
      await Bun.sleep(150);
      signalGroup(child.pid, "SIGKILL");
    })());
  let terminationError: unknown;
  const stop = () => {
    void terminate().catch((error) => {
      terminationError = error;
    });
  };
  const onAbort = () => stop();
  signal.addEventListener("abort", onAbort, { once: true });
  if (signal.aborted) stop();
  const timer = setTimeout(() => {
    timedOut = true;
    stop();
  }, timeoutMs);
  const consume = async (stream: ReadableStream<Uint8Array>): Promise<string> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        const remaining = MAX_TOOL_OUTPUT_BYTES - budget.bytes;
        const accepted = next.value.subarray(0, Math.max(0, remaining));
        if (accepted.length > 0) {
          chunks.push(accepted.slice());
          budget.bytes += accepted.length;
        }
        if (accepted.length < next.value.length) {
          budget.truncated = true;
          stop();
        }
      }
    } finally {
      reader.releaseLock();
    }
    return new TextDecoder().decode(Buffer.concat(chunks), { stream: true });
  };
  const stdout = consume(child.stdout);
  const stderr = consume(child.stderr);
  try {
    const exitCode = await child.exited;
    // Foreground completion also closes ordinary background descendants and
    // their inherited pipes; run_command never starts an unmanaged daemon.
    await terminate();
    const [out, err] = await Promise.all([stdout, stderr]);
    if (terminationError !== undefined) throw terminationError;
    signal.throwIfAborted();
    if (timedOut) throw new Error(`Command exceeded its ${timeoutMs} ms timeout`);
    return { stdout: out, stderr: err, exitCode, truncated: budget.truncated };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
    await terminate();
    await Promise.allSettled([child.exited, stdout, stderr]);
  }
}

export const name = "fn-tool-process";
export const inject = ["tools", "sessionController"];
export function apply(ctx: Context) {
  const options = toolContext(ctx);
  registerTools(
    ctx,
    [
      defineTool({
        name: "run_command",
        description:
          "Run a foreground /bin/sh command in the session working directory as the host user. This is not an OS sandbox. Background descendants are terminated on completion. Output limit 64 KiB; timeout at most 120 seconds.",
        parameters: {
          command: { type: "string", required: true },
          timeout_ms: { type: "integer" },
        },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              stdout: { type: "string", required: true },
              stderr: { type: "string", required: true },
              exitCode: { type: "integer", required: true },
              truncated: { type: "boolean", required: true },
            },
          },
          render: (_args, value) => [
            {
              type: "text",
              text: `Exit code: ${value.exitCode}\n${value.stdout}${value.stderr ? `\n${value.stderr}` : ""}${value.truncated ? "\n[Output limit reached; command stopped]" : ""}`,
            },
          ],
        },
        async execute({ command, timeout_ms }, exec) {
          checkedText(command, "command");
          const timeoutMs = timeout_ms ?? 30_000;
          if (timeoutMs < 100 || timeoutMs > 120_000)
            throw new Error("timeout_ms must be between 100 and 120000");
          return runCommand(command, await workspace(options, exec.agent), exec.signal, timeoutMs);
        },
      }),
    ],
    ["run_command"],
  );
}
