import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { verifyTheme } from "./upstream/ui-theme.ts";
const failures: string[] = [];
async function check(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", "dist", "upstream"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await check(path);
      continue;
    }
    if (!/\.(?:tsx?|css)$/.test(path)) continue;
    const source = await readFile(path, "utf8");
    if (
      /--(?:m|rt)-|@base-ui\/|lucide-react|tailwindcss|fn-sdk\/(?:ui|theme|tailwind)/.test(source)
    )
      failures.push(`${path}: replaced UI dependency or token`);
    if (
      /\.css$/.test(path) &&
      !path.endsWith(".module.css") &&
      !["plugins/ui-base/src/style.css", "packages/ui/theme.css"].includes(path)
    )
      failures.push(`${path}: use CSS Modules`);
    if (/\.tsx$/.test(path) && /<\/?(?:button|select|dialog)\b/.test(source))
      failures.push(`${path}: use original DSH controls`);
    if (/runtime-modal-backdrop|showModal\(/.test(source))
      failures.push(`${path}: use original DSH Modal`);
  }
}
if ((await readdir("frontend")).some((name) => name.endsWith(".css")))
  failures.push("Host must not own product CSS");
for (const name of await readdir("plugins"))
  if (name.startsWith("ui-")) await check(join("plugins", name));
await check("packages/ui");
const themeManifest = await verifyTheme();
const themeEntry = await readFile("packages/ui/theme.css", "utf8");
const themeSheets: string[] = [];
for (const { file } of themeManifest.files) {
  if (!file.endsWith(".css")) continue;
  if (!themeEntry.includes(`"./upstream/${file}"`))
    failures.push(`Theme resource is verified but not loaded: ${file}`);
  themeSheets.push(await readFile(join("packages/ui/upstream", file), "utf8"));
}
// Validate the CSS dependencies of the original controls we expose, including
// menu material and elevation. Checking only fn's own styles misses these.
const controls = await Promise.all(
  [
    "Button",
    "Input",
    "Checkbox",
    "Switch",
    "Menu",
    "MenuSurface",
    "Modal",
    "Tooltip",
    "Tag",
    "SegmentedControl",
  ].map((name) =>
    readFile(
      new URL(`${name}.module.css`, import.meta.resolve("@deepseek-ai/dsh-client-ui-primitives")),
      "utf8",
    ),
  ),
);
const definitions = new Set(
  [...[...themeSheets, ...controls].join("\n").matchAll(/(--[\w-]+)\s*:/g)].map(
    (match) => match[1],
  ),
);
for (const match of controls.join("\n").matchAll(/var\(\s*(--dsw-[\w-]+)\s*\)/g))
  if (!definitions.has(match[1]))
    failures.push(`Original control requires missing theme token: ${match[1]}`);
if (failures.length) throw new Error(failures.join("\n"));
console.log(
  "UI uses shared DSH controls, semantic tokens, scoped styles and verified original theme resources",
);
