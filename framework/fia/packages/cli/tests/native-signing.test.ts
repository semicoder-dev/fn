import { expect, test } from "bun:test";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { signNativeCodeTree } from "../src/native-signing";

test("native resource signing detects Mach-O bytes, skips symlinks and stops on failure", async () => {
  const root = await mkdtemp(join(tmpdir(), "fia-native-signing-"));
  try {
    const binary = join(root, "native-without-extension");
    await writeFile(binary, Buffer.from("cffaedfe00000000", "hex"));
    await writeFile(join(root, "plain.node"), "not native code");
    await writeFile(join(root, "Example.class"), Buffer.from("cafebabe00000034", "hex"));
    await symlink(binary, join(root, "linked"));
    const commands: string[][] = [];
    expect(
      await signNativeCodeTree(root, "Developer ID Application: Test", async (command) => {
        commands.push(command);
      }),
    ).toEqual([binary]);
    expect(commands).toHaveLength(2);
    expect(commands[0]).toContain("--timestamp");
    expect(commands[0]).toContain("runtime");
    expect(commands[1]).toContain("--verify");
    await expect(signNativeCodeTree(root, "-", async () => {})).rejects.toThrow("Developer ID");
    let attempts = 0;
    await expect(
      signNativeCodeTree(root, "Developer ID Application: Test", async () => {
        attempts++;
        throw new Error("certificate unavailable");
      }),
    ).rejects.toThrow("certificate unavailable");
    expect(attempts).toBe(1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
