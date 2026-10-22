// @bun
// commands/application.ts
import { copyFile, mkdir, rename, rm, stat } from "fs/promises";
import { basename, dirname, join, resolve } from "path";
import { createRequire } from "module";
var help = `fn application create <directory> [--id id] [--name name] [--service] [--json]
fn application check|build|pack [directory] [--json]

Create an ordinary Cordis npm application with a TypeScript backend.
The optional browser entry is compiled with shared host React and Cordis.
Install dependencies with bun install --ignore-scripts before checking.
`;
async function create(context) {
  const args = context.args.slice(1).filter((arg) => arg !== "--json");
  const target = args.shift();
  if (!target || target.startsWith("-"))
    throw new Error("create requires a new target directory");
  let id = basename(resolve(context.cwd, target));
  let name = id;
  let service = false;
  while (args.length) {
    const flag = args.shift();
    if (flag === "--service")
      service = true;
    else if (flag === "--id" || flag === "--name") {
      const value = args.shift();
      if (!value || value.startsWith("-"))
        throw new Error(`${flag} requires a value`);
      if (flag === "--id")
        id = value;
      else
        name = value;
    } else
      throw new Error(`Unknown option ${flag}`);
  }
  if (!/^[a-z][a-z0-9-]{0,99}$/.test(id))
    throw new Error("id must use lowercase letters, numbers and hyphens");
  if (!name.trim() || name.length > 100)
    throw new Error("name must contain 1\u2013100 characters");
  const directory = resolve(context.cwd, target);
  try {
    await stat(directory);
    throw new Error("Target already exists; choose a new directory");
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
  }
  const archive = join(context.assetsDirectory, "resources/sdk/fn-sdk.tgz");
  if (!await Bun.file(archive).exists())
    throw new Error("The host SDK snapshot is missing");
  const read = Bun.spawn(["tar", "-xOf", archive, "package/package.json"], { stdout: "pipe", stderr: "pipe" });
  const [json, stderr, status] = await Promise.all([
    new Response(read.stdout).text(),
    new Response(read.stderr).text(),
    read.exited
  ]);
  if (status)
    throw new Error(`Cannot read SDK snapshot: ${stderr}`);
  const sdk = JSON.parse(json);
  if (!sdk.exports?.["./build-cordis"])
    throw new Error("The host SDK does not support Cordis applications");
  const peers = sdk.peerDependencies;
  await mkdir(dirname(directory), { recursive: true });
  const temporary = join(dirname(directory), `.fn-create-${crypto.randomUUID()}`);
  await mkdir(temporary);
  try {
    await mkdir(join(temporary, "vendor"));
    await copyFile(archive, join(temporary, "vendor/fn-sdk.tgz"));
    await Bun.write(join(temporary, "package.json"), JSON.stringify({
      name: id,
      version: "0.0.0",
      private: true,
      type: "module",
      files: ["src", "dist"],
      exports: { ".": "./src/index.ts", ...!service ? { "./client": "./dist/client.js" } : {} },
      fn: { schemaVersion: 1, id, name, description: "A Cordis application for fn" },
      scripts: { check: "bun tools.ts check", build: "bun tools.ts build", pack: "bun tools.ts pack" },
      peerDependencies: {
        "@deepseek-ai/cordis": peers["@deepseek-ai/cordis"],
        "@semicoder/fn-sdk": sdk.version,
        ...!service ? { react: "19.2.7", "react-dom": "19.2.7" } : {}
      },
      devDependencies: {
        "@semicoder/fn-sdk": "file:vendor/fn-sdk.tgz",
        "@types/bun": "1.4.0",
        "@types/react": "19.2.17",
        "@types/react-dom": "19.2.3",
        typescript: "7.0.2"
      }
    }, null, 2) + `
`);
    await Bun.write(join(temporary, "tsconfig.json"), JSON.stringify({
      compilerOptions: {
        strict: true,
        skipLibCheck: true,
        target: "ES2023",
        module: "Preserve",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        noEmit: true,
        allowImportingTsExtensions: true,
        lib: ["ESNext", "DOM"],
        types: ["bun"]
      },
      include: ["src", "tools.ts"]
    }, null, 2) + `
`);
    await Bun.write(join(temporary, "tools.ts"), `import { runCordisTool } from "@semicoder/fn-sdk/build-cordis";
process.exitCode = await runCordisTool(process.argv.slice(2), import.meta.dir);
`);
    await Bun.write(join(temporary, "src/index.ts"), `import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk";
export const inject = ["app"];
export function apply(ctx: Context) {
  ctx.app.method("echo", input => input);
}
`);
    if (!service)
      await Bun.write(join(temporary, "src/client.tsx"), `import type { Context } from "@deepseek-ai/cordis";
import type { ClientApplication } from "@semicoder/fn-sdk/cordis-client";
import { useEffect, useState } from "react";
function Page({ api }: { api: ClientApplication }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => {
    let active = true;
    api.kv.get<string>("draft").then(value => { if (active) setText(value ?? ""); })
      .catch(error => { if (active) setStatus(String(error)); });
    return () => { active = false; };
  }, [api]);
  async function save() {
    try { await api.kv.set("draft", text); setStatus("\u5DF2\u4FDD\u5B58"); }
    catch (error) { setStatus(String(error)); }
  }
  return <main style={{ padding: 32, display: "grid", gap: 16 }}>
    <h1>{${JSON.stringify(name)}}</h1>
    <textarea aria-label="\u5185\u5BB9" value={text} onChange={event => setText(event.target.value)} rows={8} />
    <button onClick={() => void save()}>\u4FDD\u5B58</button><p role="status">{status}</p>
  </main>;
}
export const inject = ["clientApp"];
export function apply(ctx: Context) {
  const api = ctx.clientApp;
  api.page({ id: "main", title: ${JSON.stringify(name)}, component: () => <Page api={api} /> });
}
`);
    await Bun.write(join(temporary, ".gitignore"), `node_modules/
dist/
artifacts/
`);
    await Bun.write(join(temporary, "README.md"), `# ${name}

\u672C\u9879\u76EE\u4F7F\u7528\u968F\u5F00\u53D1\u5BBF\u4E3B\u63D0\u4F9B\u7684\u56FA\u5B9A SDK \u5F52\u6863\u3002\u6B64 Cordis \u5951\u7EA6\u5C1A\u672A\u53D1\u5E03\uFF0C\u4E0D\u80FD\u66FF\u6362\u4E3A\u540C\u7248\u672C\u53F7\u7684\u516C\u5F00 SDK\u3002

\`\`\`sh
bun install --ignore-scripts
bun run check
bun run build
bun run pack
\`\`\`

\u540E\u7AEF \`src/index.ts\` \u662F\u666E\u901A Cordis \u63D2\u4EF6\uFF0C\u7531 Bun \u76F4\u63A5\u6267\u884C\u3002${service ? "\u672C\u5305\u6CA1\u6709\u6D4F\u89C8\u5668\u5165\u53E3\uFF1B\u53EF\u4EE5\u63D0\u4F9B\u670D\u52A1\u6216 Chat \u5165\u53E3\u3002" : "\u6D4F\u89C8\u5668\u63D2\u4EF6\u4F7F\u7528 ctx.clientApp.page \u6CE8\u518C\u9875\u9762\uFF1BReact \u4E0E Cordis \u6765\u81EA\u5BBF\u4E3B\u5171\u4EAB\u6A21\u5757\u3002"}
\u901A\u8FC7\u5BBF\u4E3B\u5E94\u7528\u5B89\u88C5\u754C\u9762\u5B89\u88C5 artifacts \u4E2D\u7684\u5F52\u6863\u3002\u63D2\u4EF6\u662F\u53D7\u4FE1\u4EFB\u4EE3\u7801\uFF1B\u4F7F\u7528 ctx.effect \u7BA1\u7406\u8D44\u6E90\uFF0C\u66F4\u65B0\u5728\u7A7A\u95F2\u540E\u91CD\u542F Bun\u3002
`);
    await rename(temporary, directory);
    return directory;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
async function application(context) {
  const [command] = context.args;
  if (!command || context.args.includes("--help") || context.args.includes("-h")) {
    process.stdout.write(help);
    return 0;
  }
  const json = context.args.includes("--json");
  try {
    if (command === "create") {
      const directory = await create(context);
      console.log(json ? JSON.stringify({ ok: true, directory }) : `Created ${directory}`);
      return 0;
    }
    if (!["check", "build", "pack"].includes(command))
      throw new Error("Unknown command; run fn application --help");
    const args = context.args.slice(1).filter((arg) => arg !== "--json");
    if (args.length > 1 || args[0]?.startsWith("-"))
      throw new Error("Invalid arguments; run fn application --help");
    const directory = resolve(context.cwd, args[0] ?? ".");
    const entry = createRequire(join(directory, "package.json")).resolve("@semicoder/fn-sdk/build-cordis");
    const bun = Bun.which("bun");
    if (!bun)
      throw new Error("Install developer Bun 1.4.3 before building applications");
    const child = Bun.spawn([bun, entry, command, directory, ...json ? ["--json"] : []], {
      cwd: context.cwd,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit"
    });
    return await child.exited;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    if (json)
      console.log(JSON.stringify({ ok: false, error: message }));
    return 1;
  }
}

// .fia/build/commands/application.ts
var exitCode = await application({ args: process.argv.slice(2), cwd: process.cwd(), assetsDirectory: process.env.FIA_COMMAND_ASSETS });
if (exitCode !== undefined && (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255))
  throw new Error("Invalid command exit code");
process.exitCode = exitCode ?? 0;
