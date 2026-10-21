import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

export function parseGitSource(source: string): { url: string; ref: string } | undefined {
  if (!source.startsWith("github:") && !source.startsWith("git+") && !/^https:\/\/[^#]+\.git(?:#|$)/.test(source)) return;
  let value = source;
  if (value.startsWith("github:")) {
    if (!/^github:[\w.-]+\/[\w.-]+(?:#[^#]+)?$/.test(value)) throw new Error("Invalid GitHub source");
    value = `https://github.com/${value.slice(7).replace(/(#|$)/, ".git$1")}`;
  } else if (value.startsWith("git+")) value = value.slice(4);
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search) throw new Error("Git sources require an HTTPS repository URL without credentials");
  const ref = url.hash ? decodeURIComponent(url.hash.slice(1)) : "HEAD";
  if (!ref || ref.length > 256 || ref.startsWith("-") || /[\s\x00-\x1f~^:?*\[\\]/.test(ref) || ref.includes("..") || ref.includes("@{")) throw new Error("Invalid Git revision");
  url.hash = "";
  return { url: url.href, ref };
}

/** Fetch committed files only; never check out or run a repository's build/install scripts. */
export async function archiveGitSource(source: { url: string; ref: string }, execute: (argv: string[], cwd: string) => Promise<string>): Promise<Uint8Array> {
  const directory = await mkdtemp(join(tmpdir(), "fn-git-source-"));
  const git = ["git", "-c", "core.hooksPath=/dev/null", "-c", "protocol.file.allow=never"];
  try {
    await execute([...git, "init", "--bare", "."], directory);
    await execute([...git, "fetch", "--depth=1", "--no-tags", "--", source.url, source.ref], directory);
    const tar = join(directory, "application.tar");
    await execute([...git, "archive", "--format=tar", "--prefix=package/", `--output=${tar}`, "FETCH_HEAD"], directory);
    if ((await stat(tar)).size > 256 * 1024 * 1024) throw new Error("Git application archive is too large");
    const bytes = gzipSync(await readFile(tar));
    if (bytes.length > 64 * 1024 * 1024) throw new Error("Application archive exceeds 64 MiB");
    return bytes;
  } finally { await rm(directory, { recursive: true, force: true }); }
}
