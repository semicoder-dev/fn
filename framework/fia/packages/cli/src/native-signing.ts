import { open, readdir } from "node:fs/promises";
import { join } from "node:path";

type Run = (command: string[]) => Promise<void>;
const execute: Run = async (command) => {
  const child = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
  const [code, out, error] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code) throw new Error(`Native resource signing failed: ${error || out}`);
};

/** Sign copied native dependencies before an application archives or hashes them. */
export async function signNativeCodeTree(directory: string, identity: string, run: Run = execute) {
  if (!identity.startsWith("Developer ID Application:"))
    throw new Error("Native distribution resources require a Developer ID Application identity");
  const signed: string[] = [];
  const magic = new Set([
    "feedface",
    "cefaedfe",
    "feedfacf",
    "cffaedfe",
    "cafebabe",
    "bebafeca",
    "cafebabf",
    "bfbafeca",
  ]);
  async function walk(root: string) {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const filename = join(root, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (entry.isFile()) {
        const file = await open(filename, "r");
        const header = Buffer.alloc(8);
        try {
          await file.read(header, 0, 8, 0);
        } finally {
          await file.close();
        }
        const format = header.subarray(0, 4).toString("hex");
        if (!magic.has(format)) continue;
        if (["cafebabe", "cafebabf", "bebafeca", "bfbafeca"].includes(format)) {
          const architectures = format.startsWith("ca")
            ? header.readUInt32BE(4)
            : header.readUInt32LE(4);
          // Java class files share CAFEBABE but put a version, not an architecture count, next.
          if (!architectures || architectures > 32) continue;
        }
        await run([
          "/usr/bin/codesign",
          "--force",
          "--sign",
          identity,
          "--options",
          "runtime",
          "--timestamp",
          filename,
        ]);
        await run(["/usr/bin/codesign", "--verify", "--strict", filename]);
        signed.push(filename);
      }
      // Relative module links point to files already visited; never follow external links.
    }
  }
  await walk(directory);
  return signed;
}
