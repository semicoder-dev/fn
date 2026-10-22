import { createRequire } from "node:module";
import { join, resolve } from "node:path";
/** FIA runs this command outside the background process; no product service is required. */
export default async function plugin(context: { args: string[]; cwd: string }) {
  const [action, directory = "."] = context.args;
  if (!action || context.args.includes("--help")) {
    console.log(
      "fn plugin check|build|pack [directory]\nOrdinary npm Cordis plugins; install project dependencies before building.",
    );
    return 0;
  }
  if (!["check", "build", "pack"].includes(action) || context.args.length > 2)
    throw new Error("fn plugin check|build|pack [directory]");
  const root = resolve(context.cwd, directory);
  const entry = createRequire(join(root, "package.json")).resolve("@semicoder/fn-sdk/build");
  const sdk = await import(entry);
  const result =
    action === "check"
      ? await sdk.inspectPlugin(root)
      : action === "build"
        ? await sdk.buildPlugin(root)
        : await sdk.packPlugin(root);
  console.log(JSON.stringify(result));
  return 0;
}
