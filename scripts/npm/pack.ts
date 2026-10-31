import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
const root = process.cwd();
const artifacts = await Bun.file("artifacts/sdk/manifest.json").json();
const temporary = await mkdtemp(join(tmpdir(), "fn-sdk-consumer-"));
async function run(args: string[]) {
  const child = Bun.spawn(args, {
    cwd: temporary,
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  });
  if (await child.exited)
    throw new Error("Independent SDK command failed: " + args.join(" "));
}
try {
  const dependencies: Record<string, string> = {
    react: "19.2.7",
    "react-dom": "19.2.7",
    "@types/bun": "1.4.0",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    typescript: "7.0.2",
  };
  for (const [name, item] of Object.entries(artifacts) as [
    string,
    { file: string; sha256: string },
  ][]) {
    const bytes = await Bun.file(resolve("artifacts/sdk", item.file)).bytes();
    if (
      new Bun.CryptoHasher("sha256").update(bytes).digest("hex") !== item.sha256
    )
      throw new Error("Archive hash mismatch");
    await cp(resolve("artifacts/sdk", item.file), join(temporary, item.file));
    dependencies[name] = "file:./" + item.file;
    const files = await new Bun.Archive(bytes).files();
    for (const [path, file] of files) {
      if (path.endsWith(".ts") || path.endsWith(".tsx"))
        if (!(await file.bytes()).length)
          throw new Error("Empty source in SDK: " + path);
    }
  }
  await Bun.write(
    join(temporary, "package.json"),
    JSON.stringify({
      name: "independent-fn-sdk",
      private: true,
      type: "module",
      dependencies,
    }),
  );
  await cp("scripts/npm/plugin-smoke.fixture.ts", join(temporary, "smoke.ts"));
  await run([process.execPath, "install", "--ignore-scripts"]);
  if (
    /cordis|@deepseek-ai|pi-ai|"vite"|"oxfmt"/.test(
      await Bun.file(join(temporary, "bun.lock")).text(),
    )
  )
    throw new Error("Independent consumer resolved a forbidden dependency");
  await run([process.execPath, "smoke.ts"]);
  await Bun.write(
    join(temporary, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "bundler",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        allowImportingTsExtensions: true,
        types: ["bun"],
      },
      include: ["app/src"],
    }),
  );
  await run([process.execPath, "run", "tsc", "--noEmit"]);
  await mkdir(resolve(root, "artifacts/npm"), { recursive: true });
  for (const [name, item] of Object.entries(artifacts) as [
    string,
    { file: string; version: string },
  ][]) {
    await cp(
      resolve(root, "artifacts/sdk", item.file),
      resolve(
        root,
        "artifacts/npm",
        name.replace("@", "").replace("/", "-") + "-" + item.version + ".tgz",
      ),
    );
  }
  console.log("Independent SDK/UI archive, backend and page verified");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
