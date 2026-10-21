import * as Cordis from "@deepseek-ai/cordis";
import * as React from "react";
import * as JSX from "react/jsx-runtime";
import * as JSXDev from "react/jsx-dev-runtime";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as UI from "./src/ui.tsx";
import * as Cards from "./src/card-contract.ts";
import { iconSvgSchema } from "./src/manifest.ts";
import { mkdir, realpath, rename, rm } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { createRequire } from "node:module";

export interface ApplicationMetadata {
  icon?: string;
  iconSvg?: "dist/icon.svg";
  schemaVersion: 1;
  id: string;
  name: string;
  description?: string;
}
export function parseApplicationMetadata(value: unknown): ApplicationMetadata {
  if (!value || typeof value !== "object") throw new Error("package.json requires fn metadata");
  const meta = value as Record<string, unknown>;
  if (meta.schemaVersion !== 1) throw new Error("Unsupported fn.schemaVersion");
  if (typeof meta.id !== "string" || !/^[a-z][a-z0-9-]{0,99}$/.test(meta.id))
    throw new Error("Invalid fn.id");
  if (typeof meta.name !== "string" || !meta.name.trim() || meta.name.length > 100)
    throw new Error("Invalid fn.name");
  if (meta.description !== undefined && typeof meta.description !== "string")
    throw new Error("Invalid fn.description");
  if (meta.icon !== undefined && (typeof meta.icon !== "string" || !meta.icon.length || meta.icon.length > 4)) throw new Error("Invalid fn.icon");
  if (meta.iconSvg !== undefined && meta.iconSvg !== "dist/icon.svg") throw new Error("fn.iconSvg must be dist/icon.svg");
  return {
    schemaVersion: 1, id: meta.id, name: meta.name,
    ...(meta.icon ? { icon: meta.icon as string } : {}),
    ...(meta.iconSvg ? { iconSvg: "dist/icon.svg" as const } : {}),
    ...(meta.description !== undefined ? { description: meta.description as string } : {}),
  };
}

const shared: Record<string, readonly string[]> = {
  react: Object.keys(React),
  "react/jsx-runtime": Object.keys(JSX),
  "react/jsx-dev-runtime": Object.keys(JSXDev),
  "react-dom": Object.keys(ReactDOM),
  "react-dom/client": Object.keys(ReactDOMClient),
  "@deepseek-ai/cordis": Object.keys(Cordis),
  "@semicoder/fn-sdk/ui": Object.keys(UI),
  "@semicoder/fn-sdk/cards": Object.keys(Cards),
  "@semicoder/fn-sdk/cordis-client": ["BrowserPluginHost", "createBrowserHost", "installBrowserModules", "readAllPages"],
};
function within(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel !== ".." && !rel.startsWith("../") && !isAbsolute(rel);
}
async function packageSource(root: string, path: string): Promise<string> {
  if (!path.startsWith("./") || !within(root, resolve(root, path)))
    throw new Error("Application entry must be inside its package");
  const actual = await realpath(resolve(root, path));
  if (!within(root, actual)) throw new Error("Application entry resolves outside its package");
  return actual;
}
async function readApplication(directory: string) {
  const root = await realpath(resolve(directory));
  const pkg = await Bun.file(resolve(root, "package.json")).json();
  const metadata = parseApplicationMetadata(pkg.fn);
  if (pkg.type !== "module" || typeof pkg.name !== "string" ||
      !/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(pkg.name) ||
      typeof pkg.version !== "string" || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(pkg.version))
    throw new Error("Applications require npm name, version and type: module");
  const entry = pkg.exports?.["."];
  if (typeof entry !== "string") throw new Error('Application requires a string exports["."]');
  await packageSource(root, entry);
  const client = pkg.exports?.["./client"];
  if (client !== undefined && client !== "./dist/client.js")
    throw new Error('exports["./client"] must be "./dist/client.js"');
  return { root, pkg, metadata, entry, client };
}
async function run(command: string[], cwd: string): Promise<string> {
  const child = Bun.spawn(command, { cwd, stdin: "inherit", stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, status] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ]);
  if (status) throw new Error(`${stdout}\n${stderr}`.trim() || `Command failed (${status})`);
  return stdout.trim();
}

/** Checks metadata, entry boundaries and the application's own TypeScript project. */
export async function checkCordisApplication(directory: string): Promise<void> {
  const { root, client } = await readApplication(directory);
  if (client) await packageSource(root, "./src/client.tsx");
  await packageSource(root, "./tsconfig.json");
  let tsc: string;
  try {
    const manifest = createRequire(resolve(root, "package.json")).resolve("typescript/package.json");
    const compiler = await Bun.file(manifest).json();
    if (typeof compiler.bin?.tsc !== "string") throw new Error("TypeScript has no tsc executable");
    tsc = resolve(dirname(manifest), compiler.bin.tsc);
  }
  catch { throw new Error("Install application development dependencies before checking"); }
  await run([process.execPath, tsc, "--noEmit", "--project", resolve(root, "tsconfig.json")], root);
}

/**
 * Validate an ordinary npm application's TS backend, then build only its browser entry.
 * Standard exports: "." -> "./src/index.ts"; optional "./client" -> "./dist/client.js".
 * Backend dependencies stay in node_modules and are loaded directly by Bun.
 */
export async function buildCordisApplication(directory: string): Promise<{ client?: string }> {
  const { root, client, metadata } = await readApplication(directory);
  if (client === undefined && !metadata.iconSvg) return {};
  const source = client ? await packageSource(root, "./src/client.tsx") : undefined;
  const staging = resolve(root, `.fn-client-${crypto.randomUUID()}`);
  const output = resolve(root, "dist");
  await mkdir(staging);
  try {
    if (source) {
    const result = await Bun.build({
      entrypoints: [source],
      outdir: staging,
      target: "browser",
      format: "esm",
      jsx: { development: false },
      naming: { entry: "[name].[ext]", asset: "assets/[name]-[hash].[ext]" },
      publicPath: "./",
      plugins: [{
        name: "fn-cordis-host-modules",
        setup(build) {
          build.onResolve({
            filter: /^(?:react(?:\/.*)?|react-dom(?:\/.*)?|@deepseek-ai\/cordis(?:\/.*)?|@semicoder\/fn-sdk(?:\/.*)?)$/,
          }, (args) => {
            if (!shared[args.path]) throw new Error(`Unsupported browser SDK/runtime import: ${args.path}`);
            return { path: args.path, namespace: "fn-shared" };
          });
          build.onLoad({ filter: /.*/, namespace: "fn-shared" }, (args) => ({
            loader: "js",
            contents: [
              `const runtime = globalThis.__FN_CORDIS_MODULES__?.[${JSON.stringify(args.path)}];`,
              `if (!runtime) throw new Error("The fn host has not provided ${args.path}");`,
              "export default runtime.default ?? runtime;",
              ...shared[args.path]!.filter((name) => name !== "default" && /^[a-zA-Z_$][\w$]*$/.test(name))
                .map((name) => `export const ${name} = runtime[${JSON.stringify(name)}];`),
            ].join("\n"),
          }));
        },
      }],
    });
    if (!result.success) throw new AggregateError(result.logs, result.logs.map(String).join("\n"));
    }
    if (metadata.iconSvg) await Bun.write(resolve(staging, "icon.svg"), iconSvgSchema.parse(await Bun.file(await packageSource(root, "./src/icon.svg")).text()));
    // A failed build leaves the previous usable dist intact.
    await rm(output, { recursive: true, force: true });
    await mkdir(dirname(output), { recursive: true });
    await rename(staging, output);
    return client ? { client: resolve(output, "client.js") } : {};
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

/** Packs ordinary npm files and checks that both exported entrypoints are present. */
export async function packCordisApplication(directory: string): Promise<string> {
  await checkCordisApplication(directory);
  await buildCordisApplication(directory);
  const { root, pkg, entry, client } = await readApplication(directory);
  const output = resolve(root, "artifacts");
  await mkdir(output, { recursive: true });
  const archive = resolve(output, `${pkg.fn.id}-${pkg.version}.tgz`);
  await run([process.execPath, "pm", "pack", "--filename", archive, "--ignore-scripts"], root);
  const files = new Set((await run(["tar", "-tzf", archive], root)).split("\n"));
  for (const file of ["package.json", entry.slice(2), ...(client ? [client.slice(2)] : []), ...(pkg.fn.iconSvg ? [pkg.fn.iconSvg] : [])]) {
    if (!files.has(`package/${file}`)) throw new Error(`Packed application is missing ${file}; check package.json files`);
  }
  return archive;
}

export async function runCordisTool(args: string[], cwd = process.cwd()): Promise<number> {
  const json = args.includes("--json");
  const [command, directory = "."] = args.filter(arg => arg !== "--json");
  try {
    if (args.filter(arg => arg !== "--json").length > 2 || !["check", "build", "pack"].includes(command ?? ""))
      throw new Error("Usage: check|build|pack [directory] [--json]");
    const root = resolve(cwd, directory);
    let archive: string | undefined;
    if (command === "pack") archive = await packCordisApplication(root);
    else {
      await checkCordisApplication(root);
      if (command === "build") await buildCordisApplication(root);
    }
    console.log(json ? JSON.stringify({ ok: true, command, directory: root, ...(archive ? { archive } : {}) }) : archive ?? `${command} completed: ${root}`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    if (json) console.log(JSON.stringify({ ok: false, error: message }));
    return 1;
  }
}
if (import.meta.main) process.exitCode = await runCordisTool(process.argv.slice(2));
