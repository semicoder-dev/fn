import type { TextValue } from "@semicoder/fn-sdk/text";
import { createRequire } from "node:module";
import { watch } from "node:fs";
import { resolve, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { manifestSchema } from "@semicoder/fn-sdk/manifest";

export default async function plugin(context: { args: string[]; cwd: string }) {
  const [action, directory = ".", ...options] = context.args;
  if (!action || context.args.includes("--help")) {
    console.log(
      "fn plugin init|check|build|pack <directory>\nfn plugin dev <directory> --browser [--url]\nfn plugin summary <snapshot.json> [--preview] [--url]",
    );
    return 0;
  }
  const root = resolve(context.cwd, directory);
  if (action === "init") {
    await mkdir(root, { recursive: true });
    if (await Bun.file(join(root, "fn.app.json")).exists())
      throw new Error("Application already exists");
    const name = root
      .split("/")
      .at(-1)!
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const files: Record<string, unknown> = {
      "package.json": {
        name,
        private: true,
        type: "module",
        scripts: { check: "tsc --noEmit", build: "fn plugin build ." },
        dependencies: { "@semicoder/fn-sdk": "0.7.1" },
        devDependencies: {
          "@semicoder/fn-ui": "0.2.1",
          react: "19.2.7",
          "react-dom": "19.2.7",
          "@types/bun": "1.4.0",
          "@types/react": "19.2.17",
          "@types/react-dom": "19.2.3",
          typescript: "7.0.2",
        },
      },
      "fn.app.json": {
        manifestVersion: 1,
        id: name,
        version: "0.1.0",
        hostApi: 2,
        name: { key: "name" },
        entries: { backend: "src/backend.ts", page: "src/page.tsx" },
        locales: {
          default: "en",
          messages: { en: "locales/en.json", "zh-CN": "locales/zh-CN.json" },
        },
        uses: [],
        contributes: {},
      },
      "locales/en.json": {
        name: "My application",
        hello: "Hello from Bun",
        refresh: "Refresh",
      },
      "locales/zh-CN.json": {
        name: "我的应用",
        hello: "来自 Bun 的问候",
        refresh: "刷新",
      },
      "tsconfig.json": {
        compilerOptions: {
          target: "ESNext",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          allowImportingTsExtensions: true,
          types: ["bun"],
        },
        include: ["src"],
      },
      "src/contract.ts":
        'import {defineContract,method,z} from "@semicoder/fn-sdk/contract";\nexport default defineContract({read:method({input:z.object({}),output:z.object({time:z.string()})})});\n',
      "src/backend.ts":
        'import {defineBackend} from "@semicoder/fn-sdk/backend";\nimport api from "./contract.ts";\nexport default defineBackend({api,setup:()=>({handlers:{read:()=>({time:new Date().toISOString()})}})});\n',
      "src/page.tsx":
        'import React,{useState} from "react";\nimport {createRoot} from "react-dom/client";\nimport {connectView} from "@semicoder/fn-sdk/client";\nimport {useI18n} from "@semicoder/fn-sdk/react";\nimport {ApplicationProvider,Button,Surface} from "@semicoder/fn-ui";\nimport api from "./contract.ts";\nconst view=connectView(api);\nfunction Page(){const {t}=useI18n(view);const [value,set]=useState("");return <Surface><h1>{t("hello")}</h1><Button onClick={()=>void view.call("read",{}).then(v=>set(v.time))}>{t("refresh")}</Button><p>{value}</p></Surface>;}\ncreateRoot(document.getElementById("root")!).render(<ApplicationProvider view={view}><Page/></ApplicationProvider>);\n',
    };
    for (const [path, value] of Object.entries(files))
      await Bun.write(
        join(root, path),
        typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2) + "\n",
      );
    console.log(
      "Created " + root + ". Run bun install, then fn plugin dev . --browser.",
    );
    return 0;
  }
  if (action === "summary") {
    const { parseSummary } = await import("@semicoder/fn-sdk/summary");
    parseSummary(await Bun.file(root).json());
    if (!options.includes("--preview")) {
      console.log("Summary valid");
      return 0;
    }
    const app = (
      globalThis as unknown as {
        app: { call(name: string, input: unknown): Promise<any> };
      }
    ).app;
    let id: string | undefined,
      stopped = false,
      dirty = true;
    const stop = () => {
      stopped = true;
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
    const watcher = watch(root, () => {
      dirty = true;
    });
    let folder = resolve(root, "..");
    const messages: Record<string, unknown> = {};
    let name: TextValue = "Application";
    while (folder !== resolve(folder, "..")) {
      const manifest = Bun.file(join(folder, "fn.app.json"));
      if (await manifest.exists()) {
        const value = manifestSchema.parse(await manifest.json());
        name = value.name;
        for (const [locale, path] of Object.entries(value.locales.messages))
          messages[locale] = await Bun.file(
            join(folder, path as string),
          ).json();
        break;
      }
      folder = resolve(folder, "..");
    }
    try {
      while (!stopped) {
        if (dirty) {
          dirty = false;
          try {
            const first = !id;
            const result = await app.call("platform.command", {
              action: "summary-preview",
              input: {
                id,
                snapshot: parseSummary(await Bun.file(root).json()),
                name,
                messages,
                openBrowser: first && !options.includes("--url"),
              },
            });
            id = result.id;
            if (first) {
              if (options.includes("--url")) console.log(result.url);
            }
          } catch (error) {
            console.error(error);
          }
        }
        await Bun.sleep(300);
      }
    } finally {
      watcher.close();
      process.off("SIGINT", stop);
      process.off("SIGTERM", stop);
      if (id)
        await app.call("platform.command", {
          action: "summary-preview-end",
          input: { id },
        });
    }
    return 0;
  }
  const entry = createRequire(join(root, "package.json")).resolve(
    "@semicoder/fn-sdk/build",
  );
  const sdk = await import(entry);
  if (["check", "build", "pack"].includes(action)) {
    console.log(
      JSON.stringify(
        await sdk[
          action === "check"
            ? "inspectPlugin"
            : action === "build"
              ? "buildPlugin"
              : "packPlugin"
        ](root),
      ),
    );
    return 0;
  }
  if (
    action !== "dev" ||
    options.some((x) => !["--browser", "--url"].includes(x)) ||
    (options.includes("--url") && !options.includes("--browser"))
  )
    throw new Error("fn plugin dev <directory> [--browser]");
  const app = (
    globalThis as unknown as {
      app: { call(name: string, input: unknown): Promise<any> };
    }
  ).app;
  const call = (action: string, input: unknown) =>
    app.call("platform.command", { action, input });
  let instanceId: string | undefined,
    stopped = false,
    building = false,
    dirty = true,
    browserOpened = false;
  const stop = () => {
    stopped = true;
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  const watcher = watch(root, { recursive: true }, (_, path) => {
    if (
      !path ||
      /(^|\/)(node_modules|\.git|\.fn-build|\.fn-entry\.html|.*\.fn\.tgz)(\/|$)/.test(
        String(path),
      )
    )
      return;
    dirty = true;
  });
  try {
    while (!stopped) {
      if (dirty && !building) {
        dirty = false;
        building = true;
        try {
          if (instanceId) await call("close", { instanceId, force: true });
          console.log(
            "Building application; active development tasks are interrupted.",
          );
          const build = await sdk.buildPlugin(root);
          if (stopped) break;
          const result = await call("dev-register", {
            directory: build.directory,
            browser: options.includes("--browser"),
            openBrowser:
              options.includes("--browser") &&
              !browserOpened &&
              !options.includes("--url"),
          });
          instanceId = result.instanceId;
          if (result.url && !browserOpened) {
            browserOpened = true;
            if (options.includes("--url")) console.log(result.url);
          }
        } catch (error) {
          console.error(error);
        } finally {
          building = false;
        }
      }
      await Bun.sleep(350);
    }
  } finally {
    watcher.close();
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
    if (instanceId) await call("uninstall", { instanceId, force: true });
  }
  return 0;
}
