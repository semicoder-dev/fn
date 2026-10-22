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
import { constants } from "node:fs";
import { open, realpath, rename, unlink } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
/**
 * Canonical checks confine these file providers. They are not an OS sandbox:
 * trusted plugins and approved shell commands still execute as the host user.
 */
async function filePath(root: string, requested: string, creating: boolean): Promise<string> {
  checkedText(requested, "path", 8192);
  const candidate = resolve(root, requested);
  if (!within(root, candidate))
    throw new Error("File path is outside the session working directory");
  let canonical: string;
  try {
    canonical = await realpath(candidate);
  } catch (error) {
    if (!creating || (error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    canonical = resolve(await realpath(dirname(candidate)), basename(candidate));
  }
  if (!within(root, canonical))
    throw new Error("File symlink resolves outside the session working directory");
  return canonical;
}

async function readFileBounded(path: string, signal: AbortSignal): Promise<Uint8Array> {
  signal.throwIfAborted();
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error("read_file requires a regular file");
    if (stat.size > MAX_TOOL_FILE_BYTES)
      throw new Error(`File exceeds ${MAX_TOOL_FILE_BYTES} bytes`);
    const bytes = Buffer.alloc(MAX_TOOL_FILE_BYTES + 1);
    let total = 0;
    while (total < bytes.length) {
      signal.throwIfAborted();
      const part = await handle.read(
        bytes,
        total,
        Math.min(64 * 1024, bytes.length - total),
        total,
      );
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

async function writeFileAtomic(
  root: string,
  requested: string,
  content: string,
  signal: AbortSignal,
) {
  const bytes = Buffer.from(content);
  if (bytes.length > MAX_TOOL_FILE_BYTES)
    throw new Error(`File content exceeds ${MAX_TOOL_FILE_BYTES} bytes`);
  signal.throwIfAborted();
  const target = await filePath(root, requested, true);
  const temporary = resolve(dirname(target), `.fn-write-${crypto.randomUUID()}.tmp`);
  const handle = await open(
    temporary,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(bytes, { signal });
    await handle.sync();
    signal.throwIfAborted();
    // Resolve again before publication so a normal path/symlink replacement
    // during an awaited write is rejected. No race-proof OS confinement claim.
    if ((await filePath(root, requested, true)) !== target)
      throw new Error("File path changed while writing");
    signal.throwIfAborted();
    await rename(temporary, target);
    return { path: target, bytes: bytes.length };
  } finally {
    await handle.close();
    await unlink(temporary).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  }
}

export const name = "fn-tool-file";
export const inject = ["tools", "sessionController"];
export function apply(ctx: Context) {
  const options = toolContext(ctx);
  registerTools(
    ctx,
    [
      defineTool({
        name: "read_file",
        description:
          "Read a UTF-8 regular file within the session working directory. Maximum file size 1 MiB; output is limited to 64 KiB.",
        parameters: { path: { type: "string", required: true } },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", required: true },
              content: { type: "string", required: true },
              bytes: { type: "integer", required: true },
              truncated: { type: "boolean", required: true },
            },
          },
          render: (_args, value) => [
            { type: "text", text: value.content + (value.truncated ? "\n[Output truncated]" : "") },
          ],
        },
        isConcurrencySafe: () => true,
        async execute({ path }, exec) {
          const root = await workspace(options, exec.agent);
          const target = await filePath(root, path, false);
          const bytes = await readFileBounded(target, exec.signal);
          if (bytes.includes(0)) throw new Error("read_file does not read binary files");
          const output = limitedText(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
          return {
            path: target,
            content: output.text,
            bytes: bytes.length,
            truncated: output.truncated,
          };
        },
      }),
      defineTool({
        name: "write_file",
        description:
          "Create or replace a UTF-8 text file within the session working directory. Parent directory must exist; content is limited to 1 MiB.",
        parameters: {
          path: { type: "string", required: true },
          content: { type: "string", required: true },
        },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              path: { type: "string", required: true },
              bytes: { type: "integer", required: true },
            },
          },
          render: (_args, value) => [
            { type: "text", text: `Wrote ${value.bytes} bytes to ${value.path}` },
          ],
        },
        async execute({ path, content }, exec) {
          return writeFileAtomic(await workspace(options, exec.agent), path, content, exec.signal);
        },
      }),
    ],
    ["write_file"],
  );
}
