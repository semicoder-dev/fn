// pack.ts copies this fixture into a standalone consumer of the actual archive.
import { strict as assert } from "node:assert";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import * as React from "react";
import {
  buildCordisApplication,
  checkCordisApplication,
  packCordisApplication,
} from "@semicoder/fn-sdk/build-cordis";
import { validateResponse } from "@semicoder/fn-sdk/cards";
import { createBrowserHost, readAllPages } from "@semicoder/fn-sdk/cordis-client";

// This peer is installed in the standalone consumer; the host root is not its owner.
const cordisPackage: string = "@deepseek-ai/cordis";
const { Context } = await import(cordisPackage);
const directory = join(process.cwd(), "cordis-application");
await mkdir(directory);
const sdk = await Bun.file(
  join(process.cwd(), "node_modules/@semicoder/fn-sdk/package.json"),
).json();
await Bun.write(
  join(directory, "package.json"),
  JSON.stringify({
    name: "sdk-cordis-archive-smoke",
    version: "0.0.0",
    type: "module",
    files: ["src", "dist"],
    exports: { ".": "./src/index.ts", "./client": "./dist/client.js" },
    fn: { schemaVersion: 1, id: "archive-smoke", name: "SDK archive smoke" },
    peerDependencies: {
      "@semicoder/fn-sdk": sdk.version,
      "@deepseek-ai/cordis": sdk.peerDependencies["@deepseek-ai/cordis"],
    },
  }),
);
await Bun.write(
  join(directory, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      target: "ES2023",
      module: "Preserve",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      allowImportingTsExtensions: true,
      lib: ["ESNext", "DOM"],
      types: ["bun", "react"],
    },
    include: ["src"],
  }),
);
await Bun.write(
  join(directory, "src/index.ts"),
  `
import { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk";
export const identity = Context;
export const inject = ["app"];
export function apply(ctx: Context) {
  ctx.app.method("echo", input => input);
  ctx.app.useTools(["read_file"]);
  ctx.app.cards.action("save", ({values}) => { ctx.app.kv.set("answer", values); });
  ctx.app.method("card", input => ctx.app.cards.create(String(input), {key:"save",handler:"save",card:{version:1,template:"approval",title:"Save",summary:"",blocks:[],inputs:[],actions:[{id:"ok",label:"OK"}]}}));
}
`,
);
await Bun.write(
  join(directory, "src/client.tsx"),
  `
import { Context } from "@deepseek-ai/cordis";
import { useState } from "react";
import { readAllPages, type ClientApplication } from "@semicoder/fn-sdk/cordis-client";
import { validateResponse } from "@semicoder/fn-sdk/cards";
export const identities = { Context, useState, readAllPages, validateResponse };
export let app: ClientApplication;
export const inject = ["clientApp"];
export function apply(ctx: Context) {
  app = ctx.clientApp;
  app.page({id: "main", title: "Archive", component: () => <p>Standalone Cordis archive</p>});
}
`,
);
await checkCordisApplication(directory);
const output = await buildCordisApplication(directory);
const backend = await import(join(directory, "src/index.ts"));
assert.equal(backend.identity, Context, "Backend TS must resolve the consumer's Cordis");
assert.equal(typeof backend.apply, "function");
assert.equal(await Bun.file(join(directory, "dist/index.js")).exists(), false);
const pages: number[] = [];
const host = createBrowserHost({
  call: async (method, params) => {
    assert.equal(method, "connections.list");
    const offset = Number(params.offset);
    pages.push(offset);
    return { items: [offset], nextOffset: offset + 1, hasMore: offset === 0 };
  },
});
try {
  const client = await import(output.client!);
  assert.equal(client.identities.Context, Context);
  assert.equal(client.identities.useState, React.useState);
  assert.equal(client.identities.readAllPages, readAllPages);
  assert.equal(client.identities.validateResponse, validateResponse);
  await host.load("archive-smoke", client);
  assert.equal(host.pages()[0]?.key, "archive-smoke:main");
  assert.deepEqual(await client.app.list("connections.list"), [0, 1]);
  assert.deepEqual(pages, [0, 1]);
  await host.unload("archive-smoke");
  assert.equal(host.pages().length, 0);
} finally {
  await host.dispose();
}

const archive = await packCordisApplication(directory);
const extracted = await mkdtemp(join(process.cwd(), "packed-"));
try {
  const tar = Bun.spawn(["tar", "-xzf", archive, "-C", extracted], {
    stdout: "inherit",
    stderr: "inherit",
  });
  assert.equal(await tar.exited, 0);
  const pkg = await Bun.file(join(extracted, "package/package.json")).json();
  assert.equal(pkg.exports["."], "./src/index.ts");
  assert.equal(pkg.exports["./client"], "./dist/client.js");
  const packedBackend = await import(join(extracted, "package/src/index.ts"));
  assert.equal(packedBackend.identity, Context);
  const packedClient = await import(join(extracted, "package/dist/client.js"));
  assert.equal(packedClient.identities.readAllPages, readAllPages);
} finally {
  await rm(extracted, { recursive: true, force: true });
}
console.log(
  "Standalone Cordis SDK types, backend TS, browser singleton sharing, pagination, build and pack passed",
);
