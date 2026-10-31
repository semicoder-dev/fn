import { watch } from "node:fs";
import { resolve } from "node:path";
import { developApplication } from "../framework/fia/tools/develop-app.ts";
import { buildRunner } from "./build-runner.ts";
await buildRunner();
let pending = false,
  building = false;
let timer: ReturnType<typeof setTimeout> | undefined;
async function rebuild() {
  pending = true;
  if (building) return;
  building = true;
  try {
    while (pending) {
      pending = false;
      await buildRunner();
    }
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
  }
}
const watcher = watch(resolve("packages/sdk/src"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => void rebuild(), 100);
});
try {
  process.exitCode = await developApplication(
    process.cwd(),
    process.argv.slice(2),
  );
} finally {
  watcher.close();
  clearTimeout(timer);
}
