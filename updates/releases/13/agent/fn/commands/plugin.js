// @bun
// commands/plugin.ts
import { createRequire } from "module";
import { join, resolve } from "path";
async function plugin(context) {
  const [action, directory = "."] = context.args;
  if (!action || context.args.includes("--help")) {
    console.log(`fn plugin check|build|pack [directory]
Ordinary npm Cordis plugins; install project dependencies before building.`);
    return 0;
  }
  if (!["check", "build", "pack"].includes(action) || context.args.length > 2)
    throw new Error("fn plugin check|build|pack [directory]");
  const root = resolve(context.cwd, directory);
  const entry = createRequire(join(root, "package.json")).resolve("@semicoder/fn-sdk/build");
  const sdk = await import(entry);
  const result = action === "check" ? await sdk.inspectPlugin(root) : action === "build" ? await sdk.buildPlugin(root) : await sdk.packPlugin(root);
  console.log(JSON.stringify(result));
  return 0;
}

// .fia/build/commands/plugin.ts
var exitCode = await plugin({ args: process.argv.slice(2), cwd: process.cwd(), assetsDirectory: process.env.FIA_COMMAND_ASSETS });
if (exitCode !== undefined && (!Number.isInteger(exitCode) || exitCode < 0 || exitCode > 255))
  throw new Error("Invalid command exit code");
process.exitCode = exitCode ?? 0;
