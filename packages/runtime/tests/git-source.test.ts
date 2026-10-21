import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { archiveGitSource, parseGitSource } from "../src/git-source.ts";

test("Git sources preserve refs and reject credentials, option injection and non-HTTPS protocols", () => {
  expect(parseGitSource("github:org/app#release/v1")).toEqual({ url: "https://github.com/org/app.git", ref: "release/v1" });
  expect(parseGitSource("git+https://example.test/app#abcdef")).toEqual({ url: "https://example.test/app", ref: "abcdef" });
  expect(parseGitSource("https://example.test/app.git")).toEqual({ url: "https://example.test/app.git", ref: "HEAD" });
  expect(parseGitSource("https://example.test/app.tgz")).toBeUndefined();
  for (const source of ["git+file:///tmp/repo", "git+https://user:secret@example.test/app", "github:org/app#--upload-pack=x", "github:org/app#HEAD~1"]) expect(() => parseGitSource(source)).toThrow();
});

test("Git installation archives the requested committed tree without checkout or lifecycle scripts", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fn-git-test-"));
  const execute = async (argv: string[], cwd: string) => {
    const child = Bun.spawn(argv, { cwd, stdout: "pipe", stderr: "pipe" });
    const [output, error, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
    if (exit) throw new Error(error); return output;
  };
  let stage = "";
  try {
    await execute(["git", "init", "-q"], directory);
    await Bun.write(join(directory, "package.json"), '{"scripts":{"postinstall":"touch SHOULD_NOT_EXIST"}}');
    await Bun.write(join(directory, "dist/client.js"), "export const version = 1;");
    await execute(["git", "add", "."], directory);
    await execute(["git", "-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", "fixture"], directory);
    const ref = (await execute(["git", "rev-parse", "HEAD"], directory)).trim();
    await Bun.write(join(directory, "dist/client.js"), "uncommitted must not ship");
    const bytes = await archiveGitSource({ url: "https://example.test/app.git", ref }, async (argv, cwd) => {
      stage = cwd;
      // Local transport substitutes only the remote; execute the real fetch/archive path.
      return execute(argv.map(value => value === "protocol.file.allow=never" ? "protocol.file.allow=always" : value === "https://example.test/app.git" ? directory : value), cwd);
    });
    const archive = join(directory, "result.tar"); await Bun.write(archive, gunzipSync(bytes));
    expect(await execute(["tar", "-xOf", archive, "package/dist/client.js"], directory)).toBe("export const version = 1;");
    expect(await execute(["tar", "-tf", archive], directory)).not.toContain(".git/");
    expect(await Bun.file(join(directory, "SHOULD_NOT_EXIST")).exists()).toBe(false);
    expect(await Bun.file(join(stage, "HEAD")).exists()).toBe(false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
