import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { buildPlugin, packPlugin } from "@semicoder/fn-sdk/build";
import { manifestSchema } from "@semicoder/fn-sdk/manifest";
const root = join(process.cwd(), "app");
await mkdir(root);
const manifest = {
  manifestVersion: 1,
  id: "independent-app",
  version: "0.1.0",
  hostApi: 2,
  name: "Independent",
  entries: { backend: "src/backend.ts", page: "src/page.tsx" },
  locales: { default: "en", messages: { en: "locales/en.json" } },
  uses: [],
  contributes: { summary: { initial: "summary/initial.json" } },
};
await Bun.write(join(root, "fn.app.json"), JSON.stringify(manifest));
await Bun.write(
  join(root, "package.json"),
  JSON.stringify({
    name: "independent-app",
    type: "module",
    files: ["src", "locales", "summary"],
    dependencies: { "@semicoder/fn-sdk": "0.7.0" },
  }),
);
await Bun.write(join(root, "locales/en.json"), "{}");
await Bun.write(
  join(root, "summary/initial.json"),
  JSON.stringify({ version: 1, metrics: [{ value: 3 }] }),
);
await Bun.write(
  join(root, "src/backend.ts"),
  'import {defineBackend} from "@semicoder/fn-sdk/backend";import {defineContract,method,z} from "@semicoder/fn-sdk/contract";export default defineBackend({api:defineContract({read:method({input:z.object({}),output:z.string()})}),setup:()=>({handlers:{read:()=>"independent"}})});',
);
await Bun.write(
  join(root, "src/page.tsx"),
  'import {createRoot} from "react-dom/client";import {Button} from "@semicoder/fn-ui";import {Summary} from "@semicoder/fn-ui/summary";createRoot(document.getElementById("root")!).render(<><Button>Independent</Button><Summary snapshot={{version:1,metrics:[{value:3}]}} /></>);',
);
await buildPlugin(root);
const packed = await packPlugin(root);
const bytes = await Bun.file(packed.path).bytes();
const files = await new Bun.Archive(bytes).files();
const installedManifest = manifestSchema.parse(
  JSON.parse(await files.get("fn.app.json")!.text()),
);
if (installedManifest.contributes.summary?.initial !== "summary/initial.json")
  throw new Error("Summary definition missing from independent archive");
if (
  !files.has("page/index.html") ||
  !(await files.get("src/backend.ts")?.text())?.includes("independent")
)
  throw new Error("Invalid app archive");
// Move the complete installation away from the consumer's node_modules.
const { mkdtemp } = await import("node:fs/promises");
const { tmpdir } = await import("node:os");
const installed = await mkdtemp(join(tmpdir(), "fn-installed-"));
try {
  for (const [name, file] of files)
    await Bun.write(join(installed, name), await file.bytes());
  const backend = (await import(join(installed, "src/backend.ts"))).default;
  const app = await backend.setup({});
  if ((await app.handlers.read({})) !== "independent")
    throw new Error("Frozen backend dependencies failed");
} finally {
  await rm(installed, { recursive: true, force: true });
}
