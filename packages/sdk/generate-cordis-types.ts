import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../runtime/src/types.ts", import.meta.url));
const target = fileURLToPath(new URL("./src/cordis-types.ts", import.meta.url));
export const generatedHeader = "// Generated from packages/runtime/src/types.ts. Run bun packages/sdk/generate-cordis-types.ts.\n";
export async function generateCordisTypes(): Promise<void> {
  await Bun.write(target, generatedHeader + await Bun.file(source).text());
  await Bun.write(new URL("./src/card-contract.ts", import.meta.url), generatedHeader + await Bun.file(new URL("../runtime/src/card-contract.ts", import.meta.url)).text());
}
if (import.meta.main) await generateCordisTypes();
