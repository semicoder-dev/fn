import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import application from "../../../commands/application.ts";

const directories: string[] = [];
afterEach(async () => {
  for (const path of directories.splice(0)) await rm(path, { recursive: true, force: true });
});
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "fn-application-command-"));
  directories.push(root);
  const assetsDirectory = join(root, "assets");
  const sdk = join(root, "sdk", "package");
  await mkdir(join(assetsDirectory, "resources/sdk"), { recursive: true });
  await Bun.write(join(sdk, "package.json"), JSON.stringify({
    version: "0.3.5", exports: { "./build-cordis": "./build-cordis.ts" },
    peerDependencies: { "@deepseek-ai/cordis": "4.0.5" },
  }));
  const child = Bun.spawn(["tar", "-czf", join(assetsDirectory, "resources/sdk/fn-sdk.tgz"), "-C", join(root, "sdk"), "package"]);
  expect(await child.exited).toBe(0);
  return { root, assetsDirectory };
}
test("application create writes portable TS/Cordis package and refuses to overwrite it", async () => {
  const { root, assetsDirectory } = await fixture();
  const args = ["create", "my-application", "--name", "我的应用", "--json"];
  expect(await application({ args, cwd: root, assetsDirectory })).toBe(0);
  const directory = join(root, "my-application");
  const pkg = await Bun.file(join(directory, "package.json")).json();
  expect(pkg.exports).toEqual({ ".": "./src/index.ts", "./client": "./dist/client.js" });
  expect(pkg.fn).toMatchObject({ schemaVersion: 1, id: "my-application", name: "我的应用" });
  expect(pkg.devDependencies["@semicoder/fn-sdk"]).toBe("file:vendor/fn-sdk.tgz");
  expect(await Bun.file(join(directory, "src/client.tsx")).text()).toContain("api.page(");
  expect(await application({ args, cwd: root, assetsDirectory })).toBe(1);
  expect(await Bun.file(join(directory, "package.json")).json()).toEqual(pkg);
});
test("service scaffold omits the browser entry without requiring a second plugin protocol", async () => {
  const { root, assetsDirectory } = await fixture();
  expect(await application({ args: ["create", "service", "--service"], cwd: root, assetsDirectory })).toBe(0);
  expect((await Bun.file(join(root, "service/package.json")).json()).exports).toEqual({ ".": "./src/index.ts" });
  expect(await Bun.file(join(root, "service/src/client.tsx")).exists()).toBe(false);
  expect(await Bun.file(join(root, "service/src/index.ts")).text()).toContain('export const inject = ["app"]');
});
