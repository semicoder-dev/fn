import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Store } from "../backend/store";
export const fixturePackage = {
  name: "test-plugin",
  version: "0.1.0",
  type: "module",
  files: ["dist"],
  malatang: {
    schemaVersion: 1,
    id: "translate",
    name: "Fixture",
    description: "Test fixture",
    icon: "T",
    color: "#123456",
    sdkVersion: "0.3",
    frontend: "dist/client.js",
    styles: "dist/client.css",
    backend: "dist/backend.js",
    keepAlive: true,
  },
};
export async function fixture(
  root: string,
  options: { id?: string; version?: string; backend?: string; packageName?: string } = {},
) {
  const pkg = structuredClone(fixturePackage);
  pkg.malatang.id = options.id ?? "translate";
  pkg.version = options.version ?? "0.1.0";
  pkg.name = options.packageName ?? "test-plugin";
  await mkdir(join(root, "dist"), { recursive: true });
  await Bun.write(join(root, "package.json"), JSON.stringify(pkg));
  await Bun.write(
    join(root, "dist/client.js"),
    "export default function Fixture() { return null; }",
  );
  await Bun.write(join(root, "dist/client.css"), "");
  await Bun.write(
    join(root, "dist/backend.js"),
    options.backend ??
      'export default { methods: { translate: { description: "Fixture generation", inputSchema: {}, execute: (input, context) => context.models.start({ modelId: input.modelId, prompt: input.text }) } } }',
  );
  return pkg;
}
export async function registerFixture(
  store: Store,
  root: string,
  options: Parameters<typeof fixture>[1] = {},
) {
  const pkg = await fixture(root, options);
  await store.update((state) => {
    state.plugins.push({
      id: pkg.malatang.id,
      packageName: pkg.name,
      version: pkg.version,
      root,
      installation: root,
      source: "fixture",
      market: null,
    });
  });
  return pkg;
}
export async function archiveFixture(root: string, options: Parameters<typeof fixture>[1] = {}) {
  const pkg = await fixture(root, options);
  const archive = join(root, "fixture.tgz");
  const child = Bun.spawn(
    [process.execPath, "pm", "pack", "--filename", archive, "--ignore-scripts"],
    { cwd: root, stdout: "ignore", stderr: "pipe" },
  );
  if (await child.exited) throw new Error(await new Response(child.stderr).text());
  return { archive, pkg };
}
export async function waitFor(predicate: () => boolean, ms = 10000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error("Timed out");
    await Bun.sleep(10);
  }
}
