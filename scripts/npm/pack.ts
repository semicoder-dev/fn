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
const legacy = process.argv.includes("--legacy");
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
  const allowed = new Set([
    "package.json",
    "README.md",
    "src",
    "build.ts",
    "build-cordis.ts",
    "plugin.ts",
    "templates",
    "styles.ts",
    "create.ts",
    "dist",
  ]);
  for (const entry of await readdir(unpacked, { withFileTypes: true })) {
    assert(
      allowed.has(entry.name) && !entry.isSymbolicLink(),
      `Unexpected SDK archive entry: ${entry.name}`,
    );
  }
  for (const name of [
    ".",
    "./cordis-client",
    "./build-cordis",
    ...(legacy
      ? [
          "./types",
          "./chat",
          "./agent",
          "./client",
          "./ui",
          "./runtime",
          "./build",
          "./theme.css",
          "./ui.css",
          "./plugin",
          "./manifest",
          "./tailwind.css",
        ]
      : []),
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
  await cp(
    new URL("./cordis-smoke.fixture.ts", import.meta.url),
    join(consumer, "cordis-smoke.ts"),
  );
  await run([process.execPath, "run", "cordis-smoke.ts"], consumer);
  for (const template of legacy ? ["notes", "model"] : []) {
    const target = join(consumer, template);
    await cp(join(unpacked, "templates", template, "src"), join(target, "src"), {
      recursive: true,
    });
    for await (const path of new Bun.Glob("**/*").scan({ cwd: target, onlyFiles: true })) {
      const file = join(target, path);
      await Bun.write(
        file,
        (await Bun.file(file).text())
          .replaceAll("__PLUGIN_ID__", template)
          .replaceAll("__PLUGIN_NAME_JSON__", JSON.stringify(template)),
      );
    }
    if (template === "model")
      await Bun.write(
        join(target, "src/backend.ts"),
        'import { definePlugin, defineMethod, z } from "@semicoder/fn-sdk/runtime"; export default definePlugin({ methods: { echo: defineMethod("Echo", z.string(), value => value) } });',
      );
    await Bun.write(
      join(target, "package.json"),
      JSON.stringify({
        name: `fixture-${template}`,
        version: "0.1.0",
        type: "module",
        fn: {
          schemaVersion: 1,
          id: template,
          name: template,
          description: "SDK archive consumer",
          icon: "T",
          color: "#123456",
          sdkVersion: "0.3",
          frontend: "dist/client.js",
          styles: "dist/client.css",
          ...(template === "model" ? { backend: "dist/backend.js" } : {}),
        },
      }),
    );
  }
  if (legacy) {
    await cp(new URL("./smoke.fixture.ts", import.meta.url), join(consumer, "smoke.ts"));
    await run([process.execPath, "run", "smoke.ts"], consumer);
  }
  console.log(`Verified SDK archive and standalone Cordis application builds: ${archive}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
