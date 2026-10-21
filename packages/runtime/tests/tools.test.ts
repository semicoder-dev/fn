import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, realpath, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Context } from "@deepseek-ai/cordis";
import type { Agent } from "@deepseek-ai/dsh-agent";
import { ToolCallId } from "@deepseek-ai/dsh-llm";
import { createScope, type Scope } from "@deepseek-ai/dsh-scope";
import SessionStore, { SessionId } from "@deepseek-ai/dsh-session";
import SystemPrompt from "@deepseek-ai/dsh-system-prompt";
import ToolRuntime from "@deepseek-ai/dsh-tools";
import ApprovalService from "@deepseek-ai/dsh-user-approval";
import { MAX_TOOL_FILE_BYTES, MAX_TOOL_OUTPUT_BYTES, registerBunTools, type BunToolOptions } from "../src/tools.ts";

const contexts: Context[] = [];
const directories: string[] = [];

afterEach(async () => {
  for (const ctx of contexts.splice(0).reverse()) await ctx.fiber.dispose();
  for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true });
});

async function fixture(options: Omit<BunToolOptions, "workingDirectory">) {
  const directory = await mkdtemp(join(tmpdir(), "fn-bun-tools-"));
  directories.push(directory);
  const root = join(directory, "workspace");
  await mkdir(root);
  const ctx = new Context();
  contexts.push(ctx);
  await ctx.plugin(SystemPrompt, {});
  await ctx.plugin(ToolRuntime, {});
  await ctx.plugin(SessionStore);
  await ctx.plugin(ApprovalService, {});
  const appKey = {};
  let app!: Scope;
  await ctx.inject(["tools", "sessions", "systemPrompt", "approval"], (inner) => {
    app = createScope(inner, appKey);
  });
  registerBunTools(app.ctx, options);
  const agent = { id: SessionId(crypto.randomUUID()), options: {} } as Agent;
  const scope = createScope(app.ctx, agent, { parent: appKey });
  Object.assign(agent, { ctx: scope.ctx, session: scope.ctx.sessions.create(agent.id, { meta: { cwd: root } }) });
  agent.session.append("turn/start", { turn: 1 });
  const call = (name: string, args: unknown, signal: AbortSignal = new AbortController().signal) => ctx.tools.execute({
    callId: ToolCallId(crypto.randomUUID()), name, arguments: args, agent, signal,
  });
  return { ctx, app, scope, agent, call, root, directory };
}

function alive(pid: number): boolean {
  try { process.kill(pid, 0); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ESRCH") return false; throw error; }
}

async function until(check: () => boolean | Promise<boolean>, timeout = 3000) {
  const deadline = Date.now() + timeout;
  while (!await check()) {
    if (Date.now() > deadline) throw new Error("condition did not settle");
    await Bun.sleep(10);
  }
}

describe("official Bun tools", () => {
  test("tools are scoped, selections are validated before registration, and disposal removes them", async () => {
    const { ctx, app, agent } = await fixture({ names: ["read_file"] });
    expect(ctx.tools.get("read_file", agent)).toBeDefined();
    expect(ctx.tools.get("write_file", agent)).toBeUndefined();
    expect(ctx.tools.get("read_file")).toBeUndefined();
    expect(() => registerBunTools(app.ctx, { names: ["write_file", "unknown"] })).toThrow("Unknown official tool");
    expect(ctx.tools.get("write_file", agent)).toBeUndefined();
    expect(() => registerBunTools(app.ctx, { names: ["web_search"] })).toThrow("host web provider");
    expect(() => registerBunTools(ctx, { names: ["read_file"] })).toThrow("application scope");
    await app.dispose();
    expect(ctx.tools.get("read_file", agent)).toBeUndefined();
  });

  test("controlled reads need no approval; writes fail closed then run only after an audited grant", async () => {
    const { ctx, agent, call, root } = await fixture({ names: ["read_file", "write_file"] });
    await Bun.write(join(root, "input.txt"), "hello");
    expect(await call("read_file", { path: "input.txt" })).toMatchObject({ isError: false, value: { content: "hello" } });
    expect(agent.session.snapshotEvents().some(event => event.type === "approval/asked")).toBe(false);
    expect((await call("write_file", { path: "denied.txt", content: "denied" })).isError).toBe(true);
    expect(await Bun.file(join(root, "denied.txt")).exists()).toBe(false);
    let requests = 0;
    ctx.on("approval/request", async () => { requests += 1; return "allowed-once"; });
    expect(await call("write_file", { path: "approved.txt", content: "approved" })).toMatchObject({
      isError: false, value: { bytes: 8 },
    });
    expect(await readFile(join(root, "approved.txt"), "utf8")).toBe("approved");
    expect(requests).toBe(1);
    expect(agent.session.snapshotEvents().filter(event => event.type === "approval/decided").at(-1)).toMatchObject({
      data: { outcome: "allowed-once" },
    });
  });

  test("cancelling an approval never starts the file mutation", async () => {
    const { ctx, call, root } = await fixture({ names: ["write_file"] });
    let requested = false;
    ctx.on("approval/request", () => { requested = true; return new Promise(() => {}); });
    const controller = new AbortController();
    const result = call("write_file", { path: "cancelled.txt", content: "not written" }, controller.signal);
    await until(() => requested);
    controller.abort(new Error("cancel approval"));
    expect((await result).isError).toBe(true);
    expect(await Bun.file(join(root, "cancelled.txt")).exists()).toBe(false);
  });

  test("automatic writes and reads enforce real paths, symlink boundaries, and argument schemas", async () => {
    const { call, root, directory } = await fixture({ names: ["read_file", "write_file"], policy: () => "automatic" });
    const outside = join(directory, "outside.txt");
    await Bun.write(outside, "private");
    await symlink(outside, join(root, "escape.txt"));
    await symlink(directory, join(root, "escape-dir"));
    for (const path of ["../outside.txt", outside, "escape.txt", "escape-dir/outside.txt"]) {
      expect((await call("read_file", { path })).isError).toBe(true);
      expect((await call("write_file", { path, content: "changed" })).isError).toBe(true);
    }
    expect(await readFile(outside, "utf8")).toBe("private");
    expect((await call("read_file", { path: 7 })).isError).toBe(true);
    expect((await call("write_file", { path: "missing.txt" })).isError).toBe(true);
    expect(await call("write_file", { path: "normal.txt", content: "你好" })).toMatchObject({ isError: false, value: { bytes: 6 } });
    await symlink(join(root, "normal.txt"), join(root, "inside-link"));
    expect(await call("read_file", { path: "inside-link" })).toMatchObject({ isError: false, value: { content: "你好" } });
  });

  test("file and output limits retain valid UTF-8 and refuse oversized or binary content", async () => {
    const { call, root } = await fixture({ names: ["read_file", "write_file"], policy: () => "automatic" });
    await Bun.write(join(root, "large.txt"), "你".repeat(30_000));
    const result = await call("read_file", { path: "large.txt" });
    expect(result.isError).toBe(false);
    if (result.isError) throw new Error(result.error.message);
    const value = result.value as { content: string; truncated: boolean };
    expect(value.truncated).toBe(true);
    expect(value.content.includes("\uFFFD")).toBe(false);
    expect(Buffer.byteLength(value.content)).toBeLessThanOrEqual(MAX_TOOL_OUTPUT_BYTES);
    await Bun.write(join(root, "oversized.txt"), "x".repeat(MAX_TOOL_FILE_BYTES + 1));
    expect((await call("read_file", { path: "oversized.txt" })).isError).toBe(true);
    expect((await call("write_file", { path: "oversized-write.txt", content: "x".repeat(MAX_TOOL_FILE_BYTES + 1) })).isError).toBe(true);
    expect(await Bun.file(join(root, "oversized-write.txt")).exists()).toBe(false);
    await Bun.write(join(root, "binary"), new Uint8Array([0, 1, 2]));
    expect((await call("read_file", { path: "binary" })).isError).toBe(true);
  });

  test("shell returns bounded output and exit status, using the session working directory", async () => {
    const { call, root } = await fixture({ names: ["run_command"], policy: () => "automatic" });
    const result = await call("run_command", { command: "pwd; printf error >&2; exit 3" });
    expect(result).toMatchObject({ isError: false, value: { exitCode: 3, stderr: "error", truncated: false } });
    if (result.isError) throw new Error(result.error.message);
    expect((result.value as { stdout: string }).stdout.trim()).toBe(await realpath(root));
    expect((await call("run_command", { command: "true", timeout_ms: 1 })).isError).toBe(true);
    const loud = await call("run_command", { command: "yes x" });
    expect(loud.isError).toBe(false);
    if (loud.isError) throw new Error(loud.error.message);
    const value = loud.value as { stdout: string; stderr: string; truncated: boolean };
    expect(value.truncated).toBe(true);
    expect(Buffer.byteLength(value.stdout) + Buffer.byteLength(value.stderr)).toBeLessThanOrEqual(MAX_TOOL_OUTPUT_BYTES);
  });

  test("controlled shell approval contains the full command and rejects oversized serialized details", async () => {
    const { ctx, call, root } = await fixture({ names: ["run_command"] });
    const reasons: string[] = [];
    ctx.on("approval/request", async request => { reasons.push(request.reason!); return "rejected"; });
    expect((await call("run_command", { command: "printf reviewed-command" })).isError).toBe(true);
    expect(reasons).toEqual([`Run in ${root}:\nprintf reviewed-command`]);
    expect((await call("run_command", { command: "\u0001".repeat(6000) })).isError).toBe(true);
    expect(reasons).toHaveLength(1);
  });

  test("shell cancellation kills the detached process group, including a child ignoring TERM", async () => {
    const { call, root } = await fixture({ names: ["run_command"], policy: () => "automatic" });
    const controller = new AbortController();
    const result = call("run_command", {
      command: "/bin/sh -c 'trap \"\" TERM; echo $$ > child.pid; while :; do sleep 30; done' & wait",
    }, controller.signal);
    await until(() => Bun.file(join(root, "child.pid")).exists());
    const pid = Number(await Bun.file(join(root, "child.pid")).text());
    expect(alive(pid)).toBe(true);
    controller.abort(new Error("cancel command"));
    expect((await result).isError).toBe(true);
    await until(() => !alive(pid));
  });

  test("shell timeout and foreground completion terminate remaining background work", async () => {
    const { call, root } = await fixture({ names: ["run_command"], policy: () => "automatic" });
    const before = Date.now();
    expect((await call("run_command", { command: "sleep 30", timeout_ms: 100 })).isError).toBe(true);
    expect(Date.now() - before).toBeLessThan(3000);
    const result = await call("run_command", { command: "sleep 30 & echo $! > background.pid; printf done" });
    expect(result).toMatchObject({ isError: false, value: { stdout: "done" } });
    const pid = Number(await Bun.file(join(root, "background.pid")).text());
    await until(() => !alive(pid));
  });

  test("web tools validate inputs, bound results, and propagate cancellation through the provider", async () => {
    let stopped = false;
    let started = false;
    const { call, agent } = await fixture({
      names: ["web_search", "web_fetch"],
      web: {
        search: async (input, signal) => {
          signal.throwIfAborted();
          return { query: input.query, text: "x".repeat(MAX_TOOL_OUTPUT_BYTES + 100) };
        },
        fetch: async (_input, signal) => {
          started = true;
          return new Promise((_resolve, reject) => {
            const stop = () => { stopped = true; reject(signal.reason); };
            if (signal.aborted) stop();
            else signal.addEventListener("abort", stop, { once: true });
          });
        },
      },
    });
    expect(await call("web_search", { query: "test", limit: 3 })).toMatchObject({ isError: false, value: { truncated: true } });
    expect((await call("web_search", { query: "test", limit: 21 })).isError).toBe(true);
    expect((await call("web_fetch", { url: "file:///etc/passwd" })).isError).toBe(true);
    const controller = new AbortController();
    const result = call("web_fetch", { url: "https://example.test" }, controller.signal);
    await until(() => started);
    controller.abort(new Error("stop network"));
    expect((await result).isError).toBe(true);
    expect(stopped).toBe(true);
    expect(agent.session.snapshotEvents().some(event => event.type === "approval/asked")).toBe(false);
  });

  test("opening a URL requires controlled approval and preserves cancellation", async () => {
    const opened: string[] = [];
    const { ctx, call } = await fixture({
      names: ["open_url"],
      openURL: async (url, signal) => { signal.throwIfAborted(); opened.push(url); },
    });
    expect((await call("open_url", { url: "https://example.test" })).isError).toBe(true);
    expect(opened).toHaveLength(0);
    ctx.on("approval/request", async () => "allowed-once");
    expect((await call("open_url", { url: "https://example.test" })).isError).toBe(false);
    expect(opened).toEqual(["https://example.test/"]);
    expect((await call("open_url", { url: "file:///etc/passwd" })).isError).toBe(true);
    const controller = new AbortController();
    controller.abort();
    expect((await call("open_url", { url: "https://example.test/cancelled" }, controller.signal)).isError).toBe(true);
    expect(opened).toHaveLength(1);
  });
});
