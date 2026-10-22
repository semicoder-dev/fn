import { afterEach, expect, test } from "bun:test";
import { chmod, lstat, mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { copyGenerationDirectory } from "../src/copy-generation";

const temporary: string[] = [];
afterEach(async () => {
  for (const directory of temporary.splice(0)) await rm(directory, { recursive: true, force: true });
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "fn-copy-generation-test-")); temporary.push(root);
  const source = join(root, "source"), target = join(root, "target"); await mkdir(source);
  return { root, source, target };
}

test("copies deep trees, literal links and modes with independent file identities", async () => {
  const { root, source, target } = await fixture();
  await mkdir(join(source, "node_modules/core"), { recursive: true });
  // More than a worker batch, with a small initial directory level.
  for (let i = 0; i < 100; i++) await writeFile(join(source, "node_modules/core", `${i}.ts`), `source-${i}`);
  await writeFile(join(source, "run"), "executable"); await chmod(join(source, "run"), 0o751);
  await mkdir(join(source, "read-only")); await writeFile(join(source, "read-only/file"), "read only");
  await chmod(join(source, "read-only"), 0o500);
  await mkdir(join(source, "group-writable")); await chmod(join(source, "group-writable"), 0o770);
  await symlink("core", join(source, "node_modules/alias"));
  await symlink("missing", join(source, "dangling"));
  await writeFile(join(root, "outside"), "outside"); await symlink("../outside", join(source, "outside-link"));
  await copyGenerationDirectory(source, target);
  for (let i = 0; i < 100; i++) expect(await readFile(join(target, "node_modules/core", `${i}.ts`), "utf8")).toBe(`source-${i}`);
  expect(await readlink(join(target, "node_modules/alias"))).toBe("core");
  expect(await readlink(join(target, "dangling"))).toBe("missing");
  expect(await readlink(join(target, "outside-link"))).toBe("../outside");
  expect((await lstat(join(target, "run"))).mode & 0o777).toBe(0o751);
  expect((await lstat(join(target, "read-only"))).mode & 0o777).toBe(0o500);
  expect((await lstat(join(target, "group-writable"))).mode & 0o777).toBe(0o770);
  expect(await readFile(join(target, "read-only/file"), "utf8")).toBe("read only");
  expect((await lstat(join(target, "run"))).ino).not.toBe((await lstat(join(source, "run"))).ino);
  await writeFile(join(target, "run"), "changed");
  await writeFile(join(target, "node_modules/alias/0.ts"), "candidate changed");
  expect(await readFile(join(source, "run"), "utf8")).toBe("executable");
  expect(await readFile(join(source, "node_modules/core/0.ts"), "utf8")).toBe("source-0");
  await chmod(join(source, "read-only"), 0o700); await chmod(join(target, "read-only"), 0o700);
});

test("refuses existing destinations without deleting their contents", async () => {
  const { source, target } = await fixture(); await mkdir(target); await writeFile(join(target, "keep"), "keep");
  await expect(copyGenerationDirectory(source, target)).rejects.toThrow();
  expect(await readFile(join(target, "keep"), "utf8")).toBe("keep");
});

test.skipIf(process.platform === "win32")("failed copy drains pending writes before removing its candidate", async () => {
  const { source, target } = await fixture();
  for (let i = 0; i < 70; i++) await writeFile(join(source, `${i}.txt`), "unchanged");
  const fifo = Bun.spawn(["mkfifo", join(source, "special")], { stdout: "pipe", stderr: "pipe" });
  expect(await fifo.exited).toBe(0);
  await expect(copyGenerationDirectory(source, target)).rejects.toThrow("Unsupported generation file");
  expect(await Bun.file(join(target, "0.txt")).exists()).toBe(false);
  await expect(lstat(target)).rejects.toMatchObject({ code: "ENOENT" });
  expect(await readFile(join(source, "0.txt"), "utf8")).toBe("unchanged");
});
