import { resolve } from "node:path";
import { mkdir, rename, rm } from "node:fs/promises";
export async function buildRunner() {
  const directory = resolve(import.meta.dir, "../resources");
  const result = await Bun.build({
    entrypoints: [resolve(import.meta.dir, "../packages/sdk/src/runner.ts")],
    target: "bun",
    minify: false,
  });
  if (!result.success)
    throw new AggregateError(result.logs, "Application runner build failed");
  await mkdir(directory, { recursive: true });
  const temporary = resolve(
    directory,
    "app-runner." + crypto.randomUUID() + ".partial",
  );
  try {
    await Bun.write(temporary, result.outputs[0]!);
    await rename(temporary, resolve(directory, "app-runner.js"));
  } finally {
    await rm(temporary, { force: true });
  }
}
if (import.meta.main) await buildRunner();
