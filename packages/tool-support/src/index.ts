import type { Context } from "@deepseek-ai/cordis";
import type { Agent } from "@deepseek-ai/dsh-agent";
import { scopeOf } from "@deepseek-ai/dsh-scope";
import type { ToolDefinition } from "@deepseek-ai/dsh-tools";
import { realpath } from "node:fs/promises";
import { isAbsolute, relative, sep } from "node:path";
import type {} from "@semicoder/fn-session-controller/service";
export const MAX_TOOL_OUTPUT_BYTES = 64 * 1024;
export const MAX_TOOL_FILE_BYTES = 1024 * 1024;
export interface ToolContext {
  workingDirectory?: (agent: Agent | undefined) => string | undefined;
  policy?: (agent: Agent | undefined) => "controlled" | "automatic";
}
export function toolContext(ctx: Context): ToolContext {
  return {
    workingDirectory: (agent) => (agent ? ctx.sessionController.session(agent.id).cwd : undefined),
    policy: (agent) => (agent ? ctx.sessionController.session(agent.id).policy : "controlled"),
  };
}
export function checkedText(value: string, name: string, limit = 16 * 1024): string {
  if (value.trim().length === 0 || value.includes("\0"))
    throw new Error(`${name} must be non-empty text without NUL`);
  if (Buffer.byteLength(value, "utf8") > limit) throw new Error(`${name} exceeds ${limit} bytes`);
  return value;
}

export function httpURL(value: string): string {
  checkedText(value, "url", 8192);
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:")
    throw new Error("Only HTTP and HTTPS URLs are supported");
  return url.href;
}

export function limitedText(
  value: string,
  max = MAX_TOOL_OUTPUT_BYTES,
): { text: string; truncated: boolean } {
  const bytes = Buffer.from(value);
  if (bytes.length <= max) return { text: value, truncated: false };
  // Streaming decode omits a partial final UTF-8 codepoint.
  return {
    text: new TextDecoder().decode(bytes.subarray(0, max), { stream: true }),
    truncated: true,
  };
}

export function within(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

export async function workspace(options: ToolContext, agent?: Agent): Promise<string> {
  const candidate = options.workingDirectory?.(agent) ?? agent?.session.header.cwd;
  if (candidate === undefined || !isAbsolute(candidate))
    throw new Error("This session has no absolute working directory");
  return realpath(candidate);
}

/** The upstream registry and scope own registrations and approval dispatch. */
export function registerTools(ctx: Context, definitions: ToolDefinition[], writes: string[]) {
  if (!scopeOf(ctx)) throw new Error("Tools require a Session target scope");
  const options = toolContext(ctx);
  ctx.on("tools/pre-execute", async (exec, next) => {
    const decision = await next();
    if (
      decision.kind !== "allow" ||
      !writes.includes(exec.name) ||
      options.policy?.(exec.agent) === "automatic"
    )
      return decision;
    const args = exec.arguments as Record<string, unknown>;
    const detail =
      exec.name === "run_command"
        ? `Run in ${options.workingDirectory?.(exec.agent)}:\n${String(args.command)}`
        : exec.name === "open_url"
          ? `Open in browser:\n${String(args.url)}`
          : `Write ${String(args.path)}:\n${limitedText(String(args.content), 2048).text}`;
    if (Buffer.byteLength(JSON.stringify(detail)) > 32 * 1024)
      return { kind: "deny", reason: "Approval details exceed display limit" };
    return { kind: "ask", reason: detail };
  });
  for (const definition of definitions) ctx.tools.register(definition);
}
