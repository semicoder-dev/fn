import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { UIProvider } from "@semicoder/fn-sdk/ui";
import "../tailwind.css";
import "../style.css";
import { app } from "../bridge";
import PluginManager from "../PluginManager";
import type { PluginInfo } from "@semicoder/fn-sdk/types";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
app.close();
const calls: { method: string; input: any }[] = [];
const source = {
  id: "fixture",
  name: "测试市场",
  url: "https://fixture.test/index.json",
  enabled: true,
  updatedAt: 1,
  error: null,
  refreshing: false,
  count: 2,
};
const installed: PluginInfo = {
  id: "notes",
  packageName: "notes",
  name: "笔记",
  description: "已安装插件",
  version: "1.0.0",
  icon: "记",
  iconURL: null,
  color: "#686868",
  source: "fixture",
  market: { marketId: "fixture", marketURL: source.url },
  status: "active",
  enabled: true,
  error: null,
  keepAlive: true,
  methods: [],
  clientURL: "",
  styleURL: null,
};
const entries = [
  { id: "translate", name: "翻译", state: "available", installedVersion: null },
  { id: "notes", name: "笔记", state: "update", installedVersion: "1.0.0" },
].map((entry) => ({
  ...entry,
  marketId: source.id,
  marketName: source.name,
  packageName: entry.id,
  description: "插件说明",
  icon: "文",
  color: "#686868",
  version: "2.0.0",
  sdkVersion: "0.3",
  url: `https://fixture.test/${entry.id}.tgz`,
  sha256: "0".repeat(64),
}));
let sources = [source];
let fail = false;
Object.assign(app, {
  call: async (method: string, input: any) => {
    calls.push({ method, input });
    if (method === "marketplaces.list" || method === "marketplaces.refresh")
      return structuredClone(sources);
    if (method === "marketplaces.catalog") {
      const items = entries.filter((entry) => entry.name.includes(input.query ?? ""));
      return { items, total: items.length, nextOffset: null };
    }
    if (method === "plugins.jobs") return [];
    if (
      method === "plugins.installFromMarket" ||
      method === "plugins.update" ||
      method === "plugins.install"
    ) {
      if (fail) throw new Error("fixture install error");
      return { id: "job" };
    }
    if (method === "marketplaces.update") {
      sources = sources.map((source) =>
        source.id === input.id ? { ...source, ...input } : source,
      );
      return sources[0];
    }
    if (method === "marketplaces.remove") {
      sources = [];
      return null;
    }
    if (method === "marketplaces.add") {
      const added = { ...source, ...input, id: "added" };
      sources.push(added);
      return added;
    }
    throw Error("Unexpected call " + method);
  },
  on: () => () => {},
  onReconnect: () => () => {},
});
const root = createRoot(document.getElementById("fixture")!);
const results: string[] = [];
function assert(value: unknown, message: string) {
  if (!value) throw Error(message);
  results.push("PASS " + message);
}
function button(text: string) {
  const found = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
    (item) => item.textContent?.trim() === text,
  );
  if (!found) throw Error("Button not found: " + text);
  return found;
}
async function click(text: string) {
  await act(async () => {
    button(text).click();
  });
}
async function run() {
  await act(async () => {
    root.render(
      <UIProvider>
        <PluginManager plugins={[installed]} open={() => {}} />
      </UIProvider>,
    );
  });
  assert(
    calls.some((call) => call.method === "marketplaces.refresh"),
    "entering market checks updates",
  );
  assert(document.body.textContent?.includes("可更新"), "available updates are visible");
  await click("安装");
  assert(
    calls.some(
      (call) => call.method === "plugins.installFromMarket" && call.input.marketId === "fixture",
    ),
    "install preserves the selected source",
  );
  await click("更新");
  assert(
    calls.some((call) => call.method === "plugins.update" && call.input.pluginId === "notes"),
    "update targets installed plugin",
  );
  fail = true;
  await click("安装");
  assert(
    document.body.textContent?.includes("fixture install error"),
    "mutation errors remain visible",
  );
  fail = false;
  await click("已安装 · 1");
  assert(document.body.textContent?.includes("已启用"), "installed tab shows activation state");
  await click("从地址安装");
  assert(
    document.querySelector('[role="dialog"]')?.textContent?.includes("npm"),
    "manual installation remains available",
  );
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await act(async () => {
    root.unmount();
  });
  document.getElementById("results")!.textContent = results.join("\n") + "\nALL PASS";
}
if (new URLSearchParams(location.search).has("preview")) {
  root.render(
    <UIProvider>
      <PluginManager plugins={[installed]} open={() => {}} />
    </UIProvider>,
  );
  document.getElementById("results")!.hidden = true;
} else
  void run().catch((error) => {
    document.getElementById("results")!.textContent =
      results.join("\n") + "\nFAIL " + String(error);
  });
