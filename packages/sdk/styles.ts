import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const sdk = dirname(fileURLToPath(import.meta.url));
async function compile(source: string, from: string) {
  return (
    await postcss([tailwind({ base: sdk, optimize: { minify: false } })]).process(source, { from })
  ).css;
}
const imports = (prefix: string) =>
  `@import "tailwindcss/theme.css" layer(theme) prefix(${prefix});\n@import "tailwindcss/utilities.css" layer(utilities) prefix(${prefix}) source(none);\n@import ${JSON.stringify(join(sdk, "src/tailwind.css"))};\n`;
/** Public CSS is precompiled for archive consumers; no application runtime compiler. */
export async function buildUIStyles() {
  const source = imports("ui") + `@source ${JSON.stringify(join(sdk, "src/ui"))};\n`;
  const utilities = await compile(source, join(sdk, "ui.input.css"));
  await mkdir(join(sdk, "dist"), { recursive: true });
  await writeFile(
    join(sdk, "dist/ui.css"),
    utilities + "\n" + (await readFile(join(sdk, "src/ui.css"), "utf8")),
  );
}
if (import.meta.main) await buildUIStyles();
