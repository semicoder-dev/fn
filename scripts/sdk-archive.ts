import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
/** Fixed local SDK artifacts. Archives contain no workspace paths. */
const output = resolve(process.argv[2] ?? "artifacts/sdk");
await mkdir(output, { recursive: true });
const evidence: Record<string, unknown> = {};
for (const name of ["sdk", "ui"]) {
  const root = resolve("packages", name);
  const pkg = await Bun.file(resolve(root, "package.json")).json();
  if (pkg.dependencies?.["@semicoder/fn-sdk"]?.startsWith("workspace:"))
    pkg.dependencies["@semicoder/fn-sdk"] = (
      await Bun.file("packages/sdk/package.json").json()
    ).version;
  const files: Record<string, Uint8Array | string> = {
    "package/package.json": JSON.stringify(pkg, null, 2),
  };
  for (const entry of pkg.files ?? ["src", "build.ts", "README.md"]) {
    const path = resolve(root, entry);
    if (
      (await Bun.file(path).exists()) &&
      !(
        await import("node:fs/promises").then((m) => m.stat(path))
      ).isDirectory()
    )
      files["package/" + entry] = await Bun.file(path).bytes();
    else
      for await (const file of new Bun.Glob(entry + "/**/*").scan({
        cwd: root,
        onlyFiles: true,
        dot: true,
      }))
        files["package/" + file] = await Bun.file(resolve(root, file)).bytes();
  }
  const archive = new Bun.Archive(files, { compress: "gzip" });
  const bytes = await archive.bytes();
  const sha256 = new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
  const file = `semicoder-fn-${name}-${sha256.slice(0, 12)}.tgz`;
  await Bun.write(resolve(output, file), bytes);
  evidence[pkg.name] = { file, version: pkg.version, sha256 };
}
await Bun.write(
  resolve(output, "manifest.json"),
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(JSON.stringify(evidence, null, 2));
