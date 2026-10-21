import type { Context } from "@deepseek-ai/cordis";
import type { Agent } from "@deepseek-ai/dsh-agent";
import { scopeOf } from "@deepseek-ai/dsh-scope";
import { defineTool, type ToolDefinition } from "@deepseek-ai/dsh-tools";
import { snapshotJsonValue } from "@deepseek-ai/dsh-util-values";
import { constants } from "node:fs";
import { open, realpath, rename, unlink } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve, sep } from "node:path";

export const BUN_TOOL_NAMES = ["read_file", "write_file", "run_command", "web_search", "web_fetch", "open_url"] as const;
export type BunToolName = typeof BUN_TOOL_NAMES[number];
export const MAX_TOOL_OUTPUT_BYTES = 64 * 1024;
export const MAX_TOOL_FILE_BYTES = 1024 * 1024;

export interface WebSearchInput { query: string; limit?: number }
export interface WebFetchInput { url: string }
export interface BunToolsOptions {
  names: readonly string[];
  workingDirectory?: (agent: Agent | undefined) => string | undefined;
  policy?: (agent: Agent | undefined) => "controlled" | "automatic";
  /** Providers must forward cancellation and settle only after their request stops. */
  web?: {
    search(input: WebSearchInput, signal: AbortSignal): Promise<unknown>;
    fetch(input: WebFetchInput, signal: AbortSignal): Promise<unknown>;
  };
  openURL?: (url: string, signal: AbortSignal) => Promise<void> | void;
}
export type BunToolOptions = BunToolsOptions;

function checkedText(value: string, name: string, limit = 16 * 1024): string {
  if (value.trim().length === 0 || value.includes("\0")) throw new Error(`${name} must be non-empty text without NUL`);
  if (Buffer.byteLength(value, "utf8") > limit) throw new Error(`${name} exceeds ${limit} bytes`);
  return value;
}

function httpURL(value: string): string {
  checkedText(value, "url", 8192);
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP and HTTPS URLs are supported");
  return url.href;
}

function limitedText(value: string, max = MAX_TOOL_OUTPUT_BYTES): { text: string; truncated: boolean } {
  const bytes = Buffer.from(value);
  if (bytes.length <= max) return { text: value, truncated: false };
  // Streaming decode omits a partial final UTF-8 codepoint.
  return { text: new TextDecoder().decode(bytes.subarray(0, max), { stream: true }), truncated: true };
}

function within(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

async function workspace(options: BunToolOptions, agent?: Agent): Promise<string> {
  const candidate = options.workingDirectory?.(agent) ?? agent?.session.header.cwd;
  if (candidate === undefined || !isAbsolute(candidate)) throw new Error("This session has no absolute working directory");
  return realpath(candidate);
}

/**
 * Canonical checks confine these file providers. They are not an OS sandbox:
 * trusted plugins and approved shell commands still execute as the host user.
 */
async function filePath(root: string, requested: string, creating: boolean): Promise<string> {
  checkedText(requested, "path", 8192);
  const candidate = resolve(root, requested);
  if (!within(root, candidate)) throw new Error("File path is outside the session working directory");
  let canonical: string;
  try {
    canonical = await realpath(candidate);
  } catch (error) {
    if (!creating || (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    canonical = resolve(await realpath(dirname(candidate)), basename(candidate));
  }
  if (!within(root, canonical)) throw new Error("File symlink resolves outside the session working directory");
  return canonical;
}

async function readFileBounded(path: string, signal: AbortSignal): Promise<Uint8Array> {
  signal.throwIfAborted();
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error("read_file requires a regular file");
    if (stat.size > MAX_TOOL_FILE_BYTES) throw new Error(`File exceeds ${MAX_TOOL_FILE_BYTES} bytes`);
    const bytes = Buffer.alloc(MAX_TOOL_FILE_BYTES + 1);
    let total = 0;
    while (total < bytes.length) {
      signal.throwIfAborted();
      const part = await handle.read(bytes, total, Math.min(64 * 1024, bytes.length - total), total);
      if (part.bytesRead === 0) break;
      total += part.bytesRead;
    }
    signal.throwIfAborted();
    if (total > MAX_TOOL_FILE_BYTES) throw new Error(`File exceeds ${MAX_TOOL_FILE_BYTES} bytes`);
    return bytes.subarray(0, total);
  } finally {
    await handle.close();
  }
}

async function writeFileAtomic(root: string, requested: string, content: string, signal: AbortSignal) {
  const bytes = Buffer.from(content);
  if (bytes.length > MAX_TOOL_FILE_BYTES) throw new Error(`File content exceeds ${MAX_TOOL_FILE_BYTES} bytes`);
  signal.throwIfAborted();
  const target = await filePath(root, requested, true);
  const temporary = resolve(dirname(target), `.fn-write-${crypto.randomUUID()}.tmp`);
  const handle = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try {
    await handle.writeFile(bytes, { signal });
    await handle.sync();
    signal.throwIfAborted();
    // Resolve again before publication so a normal path/symlink replacement
    // during an awaited write is rejected. No race-proof OS confinement claim.
    if (await filePath(root, requested, true) !== target) throw new Error("File path changed while writing");
    signal.throwIfAborted();
    await rename(temporary, target);
    return { path: target, bytes: bytes.length };
  } finally {
    await handle.close();
    await unlink(temporary).catch(error => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
}

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
    cwd, detached: true, stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  const budget = { bytes: 0, truncated: false };
  let termination: Promise<void> | undefined;
  let timedOut = false;
  const terminate = (): Promise<void> => termination ??= (async () => {
    if (!signalGroup(child.pid, "SIGTERM")) return;
    await Bun.sleep(150);
    signalGroup(child.pid, "SIGKILL");
  })();
  let terminationError: unknown;
  const stop = () => { void terminate().catch(error => { terminationError = error; }); };
  const onAbort = () => stop();
  signal.addEventListener("abort", onAbort, { once: true });
  if (signal.aborted) stop();
  const timer = setTimeout(() => { timedOut = true; stop(); }, timeoutMs);
  const consume = async (stream: ReadableStream<Uint8Array>): Promise<string> => {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    try {
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        const remaining = MAX_TOOL_OUTPUT_BYTES - budget.bytes;
        const accepted = next.value.subarray(0, Math.max(0, remaining));
        if (accepted.length > 0) { chunks.push(accepted.slice()); budget.bytes += accepted.length; }
        if (accepted.length < next.value.length) { budget.truncated = true; stop(); }
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

async function webCall(operation: (signal: AbortSignal) => Promise<unknown>, signal: AbortSignal) {
  signal.throwIfAborted();
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(new Error("Web tool exceeded its 30 second timeout")), 30_000);
  const combined = AbortSignal.any([signal, timeout.signal]);
  try {
    const result = await operation(combined);
    combined.throwIfAborted();
    const value = snapshotJsonValue(result);
    if (value === undefined) throw new Error("Web provider returned a value that is not lossless JSON");
    return limitedText(typeof value === "string" ? value : JSON.stringify(value));
  } finally {
    clearTimeout(timer);
  }
}

function definitions(options: BunToolOptions): Record<BunToolName, ToolDefinition> {
  return {
    read_file: defineTool({
      name: "read_file",
      description: "Read a UTF-8 regular file within the session working directory. Maximum file size 1 MiB; output is limited to 64 KiB.",
      parameters: { path: { type: "string", required: true } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: {
          path: { type: "string", required: true }, content: { type: "string", required: true },
          bytes: { type: "integer", required: true }, truncated: { type: "boolean", required: true },
        } },
        render: (_args, value) => [{ type: "text", text: value.content + (value.truncated ? "\n[Output truncated]" : "") }],
      },
      isConcurrencySafe: () => true,
      async execute({ path }, exec) {
        const root = await workspace(options, exec.agent);
        const target = await filePath(root, path, false);
        const bytes = await readFileBounded(target, exec.signal);
        if (bytes.includes(0)) throw new Error("read_file does not read binary files");
        const output = limitedText(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        return { path: target, content: output.text, bytes: bytes.length, truncated: output.truncated };
      },
    }),
    write_file: defineTool({
      name: "write_file",
      description: "Create or replace a UTF-8 text file within the session working directory. Parent directory must exist; content is limited to 1 MiB.",
      parameters: { path: { type: "string", required: true }, content: { type: "string", required: true } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: {
          path: { type: "string", required: true }, bytes: { type: "integer", required: true },
        } },
        render: (_args, value) => [{ type: "text", text: `Wrote ${value.bytes} bytes to ${value.path}` }],
      },
      async execute({ path, content }, exec) {
        return writeFileAtomic(await workspace(options, exec.agent), path, content, exec.signal);
      },
    }),
    run_command: defineTool({
      name: "run_command",
      description: "Run a foreground /bin/sh command in the session working directory as the host user. This is not an OS sandbox. Background descendants are terminated on completion. Output limit 64 KiB; timeout at most 120 seconds.",
      parameters: { command: { type: "string", required: true }, timeout_ms: { type: "integer" } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: {
          stdout: { type: "string", required: true }, stderr: { type: "string", required: true },
          exitCode: { type: "integer", required: true }, truncated: { type: "boolean", required: true },
        } },
        render: (_args, value) => [{ type: "text", text: `Exit code: ${value.exitCode}\n${value.stdout}${value.stderr ? `\n${value.stderr}` : ""}${value.truncated ? "\n[Output limit reached; command stopped]" : ""}` }],
      },
      async execute({ command, timeout_ms }, exec) {
        checkedText(command, "command");
        const timeoutMs = timeout_ms ?? 30_000;
        if (timeoutMs < 100 || timeoutMs > 120_000) throw new Error("timeout_ms must be between 100 and 120000");
        return runCommand(command, await workspace(options, exec.agent), exec.signal, timeoutMs);
      },
    }),
    web_search: defineTool({
      name: "web_search",
      description: "Search the web using the host's configured search provider.",
      parameters: { query: { type: "string", required: true }, limit: { type: "integer" } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: {
          text: { type: "string", required: true }, truncated: { type: "boolean", required: true },
        } },
        render: (_args, value) => [{ type: "text", text: value.text + (value.truncated ? "\n[Output truncated]" : "") }],
      },
      isConcurrencySafe: () => true,
      async execute({ query, limit }, exec) {
        checkedText(query, "query");
        if (limit !== undefined && (limit < 1 || limit > 20)) throw new Error("limit must be between 1 and 20");
        return webCall(signal => options.web!.search({ query, ...(limit === undefined ? {} : { limit }) }, signal), exec.signal);
      },
    }),
    web_fetch: defineTool({
      name: "web_fetch",
      description: "Fetch an HTTP or HTTPS page using the host's configured web provider.",
      parameters: { url: { type: "string", required: true } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: {
          text: { type: "string", required: true }, truncated: { type: "boolean", required: true },
        } },
        render: (_args, value) => [{ type: "text", text: value.text + (value.truncated ? "\n[Output truncated]" : "") }],
      },
      isConcurrencySafe: () => true,
      async execute({ url }, exec) {
        const address = httpURL(url);
        return webCall(signal => options.web!.fetch({ url: address }, signal), exec.signal);
      },
    }),
    open_url: defineTool({
      name: "open_url",
      description: "Open an HTTP or HTTPS URL in the user's browser.",
      parameters: { url: { type: "string", required: true } },
      output: {
        schema: { type: "object", additionalProperties: false, properties: { url: { type: "string", required: true } } },
        render: (_args, value) => [{ type: "text", text: `Opened ${value.url}` }],
      },
      async execute({ url }, exec) {
        const address = httpURL(url);
        exec.signal.throwIfAborted();
        await options.openURL!(address, exec.signal);
        exec.signal.throwIfAborted();
        return { url: address };
      },
    }),
  };
}

/** Register only the requested official tools in one application Cordis scope. */
export function registerBunTools(ctx: Context, options: BunToolOptions): () => void {
  if (scopeOf(ctx) === undefined) throw new Error("Official Bun tools require an application scope");
  const names = new Set(options.names);
  if (names.size !== options.names.length) throw new Error("Duplicate official tool name");
  for (const name of names) {
    if (!(BUN_TOOL_NAMES as readonly string[]).includes(name)) throw new Error(`Unknown official tool "${name}"`);
  }
  if ((names.has("web_search") || names.has("web_fetch")) && options.web === undefined) throw new Error("Web tools require a host web provider");
  if (names.has("open_url") && options.openURL === undefined) throw new Error("open_url requires a host browser provider");
  const tools = definitions(options);
  const disposers: Array<() => void> = [];
  const dispose = () => { for (const stop of disposers.splice(0).reverse()) stop(); };
  try {
    disposers.push(ctx.on("tools/pre-execute", async (exec, next) => {
      const decision = await next();
      if (decision.kind !== "allow" || !names.has(exec.name)) return decision;
      if (!["write_file", "run_command", "open_url"].includes(exec.name)) return decision;
      if (options.policy?.(exec.agent) === "automatic") return decision;
      const args = exec.arguments as Record<string, unknown>;
      let reason: string;
      if (exec.name === "run_command") {
        reason = `Run in ${options.workingDirectory?.(exec.agent) ?? exec.agent?.session.header.cwd ?? "(no working directory)"}:\n${String(args.command)}`;
      } else if (exec.name === "open_url") {
        reason = `Open in the browser:\n${String(args.url)}`;
      } else {
        const content = String(args.content);
        const preview = limitedText(content, 2048);
        reason = `Write ${String(args.path)} (${Buffer.byteLength(content)} bytes):\n${preview.text}${preview.truncated ? "\n[Content preview truncated]" : ""}`;
      }
      if (Buffer.byteLength(JSON.stringify(reason)) > 32 * 1024) return { kind: "deny", reason: "Approval details exceed the display limit" };
      return { kind: "ask", reason };
    }));
    for (const name of names) disposers.push(ctx.tools.register(tools[name as BunToolName]));
    return ctx.effect(() => dispose, "official Bun tools");
  } catch (error) {
    dispose();
    throw error;
  }
}
