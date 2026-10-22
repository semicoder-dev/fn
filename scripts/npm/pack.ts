import { cp, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { assert, packageName, registry, root, validatePackage } from "./check";

async function run(command: string[], cwd: string) {
  const child = Bun.spawn(command, { cwd, stdout: "inherit", stderr: "inherit" });
  assert((await child.exited) === 0, `Failed: ${command[0]} ${command[1]}`);
}

// Validate the actual archive, then use it outside the source workspace.
const release = validatePackage(await Bun.file(join(root, "packages/sdk/package.json")).json());
const output = join(root, "artifacts/npm");
await mkdir(output, { recursive: true });
const archive = join(output, release.filename);
await rm(archive, { force: true });
await run(
  ["npm", "pack", "--workspace", packageName, "--pack-destination", output, "--ignore-scripts"],
  root,
);
const temporary = await mkdtemp(join(tmpdir(), "fn-sdk-"));
try {
  await run(["tar", "-xzf", archive, "-C", temporary], root);
  const unpacked = join(temporary, "package");
  const pkg = await Bun.file(join(unpacked, "package.json")).json();
  assert(validatePackage(pkg).version === release.version, "Packed SDK version differs");
  const allowed = new Set(["package.json", "README.md", "src", "build.ts", "styles.ts", "dist"]);
  for (const entry of await readdir(unpacked, { withFileTypes: true })) {
    assert(
      allowed.has(entry.name) && !entry.isSymbolicLink(),
      `Unexpected SDK archive entry: ${entry.name}`,
    );
  }
  for (const name of [
    ".",
    "./client",
    "./build",
    "./ui",
    "./theme.css",
    "./ui.css",
    "./tailwind.css",
  ]) {
    const target = pkg.exports?.[name];
    assert(
      typeof target === "string" && target.startsWith("./") && !target.split("/").includes(".."),
      `Missing/unsafe SDK export: ${name}`,
    );
    assert(await Bun.file(resolve(unpacked, target)).exists(), `Missing SDK export file: ${name}`);
  }
  assert(await Bun.file(join(unpacked, "README.md")).exists(), "SDK README is missing");
  const consumer = join(temporary, "consumer");
  await mkdir(consumer);
  const digest = new Bun.CryptoHasher("sha256")
    .update(await Bun.file(archive).arrayBuffer())
    .digest("hex");
  const consumerArchive = `fn-sdk-${digest}.tgz`;
  await cp(archive, join(consumer, consumerArchive));
  const react = await Bun.file(join(root, "node_modules/react/package.json")).json();
  const developmentDependencies: Record<string, string> = {};
  for (const name of ["typescript", "@types/bun", "@types/react", "@types/react-dom"])
    developmentDependencies[name] = (
      await Bun.file(join(root, "node_modules", name, "package.json")).json()
    ).version;
  await Bun.write(
    join(consumer, "package.json"),
    JSON.stringify({
      name: "sdk-package-smoke",
      private: true,
      type: "module",
      dependencies: {
        ...pkg.peerDependencies,
        [packageName]: `file:./${consumerArchive}`,
        react: react.version,
        "react-dom": react.version,
      },
      devDependencies: developmentDependencies,
    }),
  );
  await run([process.execPath, "install", "--ignore-scripts", "--registry", registry], consumer);
  await cp(new URL("./plugin-smoke.fixture.ts", import.meta.url), join(consumer, "smoke.ts"));
  await run([process.execPath, "run", "smoke.ts"], consumer);
  console.log(`Verified SDK archive and standalone plugin consumption: ${archive}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
