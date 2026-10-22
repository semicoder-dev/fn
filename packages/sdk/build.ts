import { mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import type { PluginMetadata } from "./src/index.ts";
export const sharedClientModules = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "@deepseek-ai/cordis",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-store",
  "@semicoder/fia/api",
  "@semicoder/fia/client",
  "@semicoder/fn-sdk/client",
  "@semicoder/fn-sdk/ui",
];
export function parsePluginMetadata(value: unknown): PluginMetadata {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid fn metadata");
  const metadata = value as Record<string, unknown>;
  for (const key of Object.keys(metadata))
    if (
      !["name", "description", "icon", "iconSvg", "clientSource", "bundle", "profile"].includes(key)
    )
      throw new Error(`Unknown fn metadata: ${key}`);
  for (const key of ["name", "description", "icon", "iconSvg", "clientSource", "bundle", "profile"])
    if (metadata[key] !== undefined && typeof metadata[key] !== "string")
      throw new Error(`Invalid fn.${key}`);
  return metadata as PluginMetadata;
}
async function inside(root: string, path: string) {
  if (!path.startsWith("./")) throw new Error("Exports must be package-relative");
  const target = await realpath(resolve(root, path));
  const rel = relative(root, target);
  if (isAbsolute(rel) || rel === ".." || rel.startsWith("../"))
    throw new Error("Export escapes package");
  return target;
}
export async function inspectPlugin(directory: string) {
  const root = await realpath(directory),
    pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  if (
    !/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(pkg.name) ||
    pkg.type !== "module" ||
    !(
      typeof pkg.version === "string" &&
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
        pkg.version,
      )
    )
  )
    throw new Error("Plugin requires npm name/version and type: module");
  if (
    pkg.name.startsWith("@semicoder/") &&
    (!pkg.name.startsWith("@semicoder/fn-") || pkg.name.startsWith("@semicoder/fn-cordis-"))
  )
    throw new Error("Use @semicoder/fn-<capability>");
  const metadata = parsePluginMetadata(pkg.fn);
  if (!pkg.exports?.["."] && !pkg.exports?.["./client"])
    throw new Error("Plugin requires a backend or client export");
  if (typeof pkg.exports["."] === "string") await inside(root, pkg.exports["."]);
  if (pkg.exports["./client"] && pkg.exports["./client"] !== "./dist/client.js")
    throw new Error("Client output must be ./dist/client.js");
  return { root, pkg, metadata };
}
/** Build the upstream lazy CommonJS factory ABI; shared modules stay external. */
export async function buildPlugin(directory: string): Promise<void> {
  const { root, pkg, metadata } = await inspectPlugin(directory);
  if (!pkg.exports["./client"]) return;
  const source = await inside(root, metadata.clientSource ?? "./src/client.tsx");
  const output = resolve(root, "dist"),
    staging = resolve(root, `.fn-build-${crypto.randomUUID()}`);
  try {
    const result = await Bun.build({
      entrypoints: [source],
      target: "browser",
      format: "cjs",
      outdir: staging,
      external: sharedClientModules,
      jsx: { development: false },
      naming: "[name].[ext]",
      publicPath: "__FN_ASSET_BASE__/",
    });
    if (!result.success) throw new AggregateError(result.logs, "Plugin client build failed");
    const javascript = result.outputs.find((file) => file.path.endsWith(".js"));
    if (!javascript) throw new Error("Missing browser module");
    const css = (
      await Promise.all(
        result.outputs.filter((file) => file.path.endsWith(".css")).map((file) => file.text()),
      )
    ).join("\n");
    const javascriptSource = (await javascript.text()).replace(
      /(["'])__FN_ASSET_BASE__\/([^"']+)\1/g,
      (_match, _quote, file: string) => `new URL(${JSON.stringify(file)},assetBase).href`,
    );
    const code = `(function(assetBase){window.__ModuleLoader__.load({id:${JSON.stringify(pkg.name + "/client")},factory:function(require){\nvar module={exports:{}};var exports=module.exports;\n${javascriptSource}\nconst exported=module.exports;\n${css ? `const plugin=exported.default??exported;return {...exported,default:{...plugin,name:plugin.name,inject:plugin.inject,Config:plugin.Config,async apply(ctx,config){ctx.effect(()=>{const node=document.createElement("style");node.textContent=${JSON.stringify(css)}.replaceAll("__FN_ASSET_BASE__/",assetBase);document.head.append(node);return ()=>node.remove();});await ctx.plugin(plugin,config);}}};` : "return exported;"}\n}});})(new URL(".",document.currentScript.src).href);\n`;
    await mkdir(output, { recursive: true });
    await writeFile(resolve(staging, "client.js"), code);
    await rename(resolve(staging, "client.js"), resolve(output, "client.js"));
    for (const asset of result.outputs.filter((file) => !/\.(?:js|css)$/.test(file.path))) {
      const path = resolve(output, relative(staging, asset.path));
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, new Uint8Array(await asset.arrayBuffer()));
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
export async function packPlugin(
  directory: string,
  destination: string = resolve(directory, "artifacts"),
) {
  await buildPlugin(directory);
  await mkdir(resolve(destination), { recursive: true });
  const child = Bun.spawn([process.execPath, "pm", "pack", "--destination", resolve(destination)], {
    cwd: directory,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, out, err] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (code) throw new Error(err || out);
  return out.trim();
}
