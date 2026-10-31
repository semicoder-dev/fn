import { resolve } from "node:path";
// Publish precisely the tested archive. A retry may only reuse identical public bytes.
for (const filename of process.argv.slice(2)) {
  const path = resolve(filename);
  const bytes = await Bun.file(path).bytes();
  const files = await new Bun.Archive(bytes).files();
  const pkg = JSON.parse(await files.get("package/package.json")!.text());
  if (!["@semicoder/fn-sdk", "@semicoder/fn-ui"].includes(pkg.name))
    throw new Error("Unexpected package archive");
  const url = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`;
  const current = await fetch(url);
  if (current.ok) {
    const metadata = (await current.json()) as { dist: { integrity: string } };
    const integrity =
      "sha512-" + new Bun.CryptoHasher("sha512").update(bytes).digest("base64");
    if (metadata.dist.integrity !== integrity)
      throw new Error(
        `${pkg.name}@${pkg.version} already exists with different bytes`,
      );
    console.log(`Verified existing ${pkg.name}@${pkg.version}`);
    continue;
  }
  if (current.status !== 404)
    throw new Error("Cannot verify registry state: " + current.status);
  const child = Bun.spawn(
    [
      "npm",
      "publish",
      path,
      "--access",
      "public",
      "--tag",
      "latest",
      "--ignore-scripts",
      "--registry=https://registry.npmjs.org",
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  if (await child.exited)
    throw new Error("npm publication failed: " + pkg.name);
}
