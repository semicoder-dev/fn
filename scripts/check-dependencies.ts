import { resolve } from "node:path";
const root = resolve(import.meta.dir, "..");
for await (const file of new Bun.Glob(
  "{package.json,bun.lock,packages/*/package.json,framework/fia/package.json,framework/fia/packages/*/package.json}",
).scan(root)) {
  if (
    /"(?:cordis|@cordisjs\/[^"\s]+)"|@deepseek-ai\/|@earendil-works\/pi-ai|@mariozechner\/pi-ai|"(?:vite|oxfmt|@vitejs\/plugin-react)"/.test(
      await Bun.file(resolve(root, file)).text(),
    )
  )
    throw new Error("Forbidden dependency: " + file);
}
console.log("Fn dependency policy passed");
