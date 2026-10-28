import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const directory = resolve(import.meta.dir, "../../packages/ui/upstream");
export async function verifyTheme() {
  const manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
  if (!/^[a-f0-9]{40}$/.test(manifest.commit))
    throw new Error("Theme source requires a fixed commit");
  for (const entry of manifest.files) {
    const bytes = await readFile(join(directory, entry.file));
    if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256)
      throw new Error(`Upstream theme modified: ${entry.file}`);
  }
  const pkg = JSON.parse(await readFile(resolve(directory, "../package.json"), "utf8"));
  if (pkg.dependencies["@deepseek-ai/dsh-client-ui-primitives"] !== manifest.release)
    throw new Error("Theme and controls must be reviewed together when upgrading");
  return manifest;
}
// Optional read-only source audit; never runs the reference project's build/install.
if (import.meta.main) {
  const manifest = await verifyTheme();
  const reference = process.argv[2];
  if (reference)
    for (const entry of manifest.files) {
      const child = Bun.spawn(["git", "show", `${manifest.commit}:${entry.source}`], {
        cwd: reference,
        stdout: "pipe",
        stderr: "pipe",
      });
      const bytes = await new Response(child.stdout).arrayBuffer();
      if (
        (await child.exited) ||
        createHash("sha256").update(new Uint8Array(bytes)).digest("hex") !== entry.sha256
      )
        throw new Error(`Source differs: ${entry.source}`);
    }
  console.log(
    `Verified unchanged DSH theme at ${manifest.commit.slice(0, 10)} (${manifest.files.length} files)`,
  );
}
