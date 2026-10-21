import { copyFile, mkdir, rename, rm, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";

interface CommandContext { args: string[]; cwd: string; assetsDirectory: string }
const help = `fn application create <directory> [--id id] [--name name] [--service] [--json]
fn application check|build|pack [directory] [--json]

Create an ordinary Cordis npm application with a TypeScript backend.
The optional browser entry is compiled with shared host React and Cordis.
Install dependencies with bun install --ignore-scripts before checking.
`;
async function create(context: CommandContext): Promise<string> {
  const args = context.args.slice(1).filter(arg => arg !== "--json");
  const target = args.shift();
  if (!target || target.startsWith("-")) throw new Error("create requires a new target directory");
  let id = basename(resolve(context.cwd, target));
  let name = id;
  let service = false;
  while (args.length) {
    const flag = args.shift();
    if (flag === "--service") service = true;
    else if (flag === "--id" || flag === "--name") {
      const value = args.shift();
      if (!value || value.startsWith("-")) throw new Error(`${flag} requires a value`);
      if (flag === "--id") id = value;
      else name = value;
    } else throw new Error(`Unknown option ${flag}`);
  }
  if (!/^[a-z][a-z0-9-]{0,99}$/.test(id)) throw new Error("id must use lowercase letters, numbers and hyphens");
  if (!name.trim() || name.length > 100) throw new Error("name must contain 1–100 characters");
  const directory = resolve(context.cwd, target);
  try { await stat(directory); throw new Error("Target already exists; choose a new directory"); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const archive = join(context.assetsDirectory, "resources/sdk/fn-sdk.tgz");
  if (!(await Bun.file(archive).exists())) throw new Error("The host SDK snapshot is missing");
  const read = Bun.spawn(["tar", "-xOf", archive, "package/package.json"], { stdout: "pipe", stderr: "pipe" });
  const [json, stderr, status] = await Promise.all([
    new Response(read.stdout).text(), new Response(read.stderr).text(), read.exited,
  ]);
  if (status) throw new Error(`Cannot read SDK snapshot: ${stderr}`);
  const sdk = JSON.parse(json);
  if (!sdk.exports?.["./build-cordis"]) throw new Error("The host SDK does not support Cordis applications");
  const peers = sdk.peerDependencies as Record<string, string>;
  await mkdir(dirname(directory), { recursive: true });
  const temporary = join(dirname(directory), `.fn-create-${crypto.randomUUID()}`);
  await mkdir(temporary);
  try {
    await mkdir(join(temporary, "vendor"));
    await copyFile(archive, join(temporary, "vendor/fn-sdk.tgz"));
    await Bun.write(join(temporary, "package.json"), JSON.stringify({
      name: id, version: "0.0.0", private: true, type: "module",
      files: ["src", "dist"],
      exports: { ".": "./src/index.ts", ...(!service ? { "./client": "./dist/client.js" } : {}) },
      fn: { schemaVersion: 1, id, name, description: "A Cordis application for fn" },
      scripts: { check: "bun tools.ts check", build: "bun tools.ts build", pack: "bun tools.ts pack" },
      peerDependencies: {
        "@deepseek-ai/cordis": peers["@deepseek-ai/cordis"],
        "@semicoder/fn-sdk": sdk.version,
        ...(!service ? { react: "19.2.7", "react-dom": "19.2.7" } : {}),
      },
      devDependencies: {
        "@semicoder/fn-sdk": "file:vendor/fn-sdk.tgz",
        "@types/bun": "1.4.0", "@types/react": "19.2.17", "@types/react-dom": "19.2.3",
        typescript: "7.0.2",
      },
    }, null, 2) + "\n");
    await Bun.write(join(temporary, "tsconfig.json"), JSON.stringify({
      compilerOptions: {
        strict: true, skipLibCheck: true, target: "ES2023", module: "Preserve",
        moduleResolution: "Bundler", jsx: "react-jsx", noEmit: true,
        allowImportingTsExtensions: true, lib: ["ESNext", "DOM"], types: ["bun"],
      }, include: ["src", "tools.ts"],
    }, null, 2) + "\n");
    await Bun.write(join(temporary, "tools.ts"),
      'import { runCordisTool } from "@semicoder/fn-sdk/build-cordis";\nprocess.exitCode = await runCordisTool(process.argv.slice(2), import.meta.dir);\n');
    await Bun.write(join(temporary, "src/index.ts"),
      'import type { Context } from "@deepseek-ai/cordis";\nimport type {} from "@semicoder/fn-sdk";\nexport const inject = ["app"];\nexport function apply(ctx: Context) {\n  ctx.app.method("echo", input => input);\n}\n');
    if (!service) await Bun.write(join(temporary, "src/client.tsx"), `import type { Context } from "@deepseek-ai/cordis";
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
    try { await api.kv.set("draft", text); setStatus("已保存"); }
    catch (error) { setStatus(String(error)); }
  }
  return <main style={{ padding: 32, display: "grid", gap: 16 }}>
    <h1>{${JSON.stringify(name)}}</h1>
    <textarea aria-label="内容" value={text} onChange={event => setText(event.target.value)} rows={8} />
    <button onClick={() => void save()}>保存</button><p role="status">{status}</p>
  </main>;
}
export const inject = ["clientApp"];
export function apply(ctx: Context) {
  const api = ctx.clientApp;
  api.page({ id: "main", title: ${JSON.stringify(name)}, component: () => <Page api={api} /> });
}
`);
    await Bun.write(join(temporary, ".gitignore"), "node_modules/\ndist/\nartifacts/\n");
    await Bun.write(join(temporary, "README.md"), `# ${name}

本项目使用随开发宿主提供的固定 SDK 归档。此 Cordis 契约尚未发布，不能替换为同版本号的公开 SDK。

\`\`\`sh
bun install --ignore-scripts
bun run check
bun run build
bun run pack
\`\`\`

后端 \`src/index.ts\` 是普通 Cordis 插件，由 Bun 直接执行。${service ? "本包没有浏览器入口；可以提供服务或 Chat 入口。" : "浏览器插件使用 ctx.clientApp.page 注册页面；React 与 Cordis 来自宿主共享模块。"}
通过宿主应用安装界面安装 artifacts 中的归档。插件是受信任代码；使用 ctx.effect 管理资源，更新在空闲后重启 Bun。
`);
    await rename(temporary, directory);
    return directory;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

/** Invoked by FIA's supervised application command process. */
export default async function application(context: CommandContext): Promise<number> {
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
    if (!["check", "build", "pack"].includes(command)) throw new Error("Unknown command; run fn application --help");
    const args = context.args.slice(1).filter(arg => arg !== "--json");
    if (args.length > 1 || args[0]?.startsWith("-")) throw new Error("Invalid arguments; run fn application --help");
    const directory = resolve(context.cwd, args[0] ?? ".");
    const entry = createRequire(join(directory, "package.json")).resolve("@semicoder/fn-sdk/build-cordis");
    const bun = Bun.which("bun");
    if (!bun) throw new Error("Install developer Bun 1.4.3 before building applications");
    const child = Bun.spawn([bun, entry, command, directory, ...(json ? ["--json"] : [])], {
      cwd: context.cwd, stdin: "inherit", stdout: "inherit", stderr: "inherit",
    });
    return await child.exited;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    if (json) console.log(JSON.stringify({ ok: false, error: message }));
    return 1;
  }
}
