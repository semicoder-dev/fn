import React, { act, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserHost, type ClientApplication } from "@semicoder/fn-sdk/cordis-client";
import { Button } from "@semicoder/fn-sdk/ui";
import PageSlot from "../PageSlot";
import RuntimeApplications from "../RuntimeApplications";
import RuntimeModels from "../RuntimeModels";
import { runtimeClient } from "../runtime-bridge";
import type { z } from "@semicoder/fia/api";
import type { runtimeApplication } from "../../shared/runtime-api";
import "../style.css";
import "../runtime.css";
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const calls: { method: string; args: Record<string, unknown> }[] = [];
const listeners = new Set<() => void>();
const entry = { id: "test-app", packageName: "@test/app", name: "测试应用", description: "市场流程", version: "1.0.1", url: "https://example.test/app.tgz", sha256: "a".repeat(64), core: {}, marketId: "test", marketName: "测试市场", installedVersion: null, state: "available" };
const app: z.infer<typeof runtimeApplication> = { id: entry.id, packageName: entry.packageName, name: entry.name, version: "1.0.0", enabled: true, status: "active", methods: [], chats: [], clientURL: "/client.js", origin: { source: entry.url, marketId: "test" } };
Object.assign(runtimeClient, {
  call: async (method: string, args: Record<string, unknown>) => {
    calls.push({ method, args });
    if (method === "market.list") return [{ id: "test", name: "测试市场", url: "https://example.test/index.json", enabled: true, count: 1, updatedAt: null, error: null, refreshing: false }];
    if (method === "market.catalog") return { items: [entry], nextOffset: 1, hasMore: false };
    return null;
  },
  on: (_event: string, listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
  onReconnect: () => () => {},
});
const root = createRoot(document.getElementById("fixture")!);
const results: string[] = [];
const phase = (name: string) => { document.documentElement.dataset.testPhase = name; document.getElementById("results")!.textContent = [...results, `RUN ${name}`].join("\n"); };
const button = (text: string) => [...document.querySelectorAll("button")].find(button => button.textContent?.trim() === text)!;
const assert = (value: unknown, message: string) => { if (!value) throw new Error(message); };
async function click(text: string) { await act(async () => { button(text).click(); }); }
async function render(busy = false) { await act(async () => root.render(<div className="runtime-shell"><RuntimeApplications apps={[app]} action={async operation => { await operation(); }} open={id => calls.push({ method: "open", args: { id } })} busy={busy} /></div>)); }
async function run() {
  phase("market");
  await render();
  await click("安装"); assert(calls.some(call => call.method === "market.install" && call.args.appId === entry.id && call.args.marketId === "test"), "Market install carries source identity");
  results.push("PASS market discovery and installation");
  await click("已安装 · 1"); await click("打开"); await click("更新"); await click("停用"); await click("卸载");
  assert(["open", "apps.update", "apps.enable", "apps.remove"].every(method => calls.some(call => call.method === method)), "Installed app operations are reachable");
  results.push("PASS open, update, disable and remove");
  await render(true); assert(button("更新").disabled && button("卸载").disabled, "Pending generation prevents conflicting changes");
  await render(false); await click("市场源");
  await act(async () => { [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(button => button.textContent?.trim() === "停用")!.click(); });
  assert(calls.some(call => call.method === "market.change" && call.args.enabled === false), "Source can be disabled");
  results.push("PASS pending update admission and source management");
  await act(async () => root.unmount()); assert(listeners.size === 0, "Unmount cleans subscriptions");
  const modelRoot = createRoot(document.getElementById("fixture")!);
  phase("model connection");
  let finishLogin!: () => void;
  const loginPending = new Promise<void>(resolve => { finishLogin = resolve; });
  const connections = [{ id: "first", name: "原有账号", provider: "anthropic", auth: "api-key" as const, configured: true, profile: {} }];
  Object.assign(runtimeClient, { call: async (method: string, args: Record<string, unknown>) => {
    if (method === "connections.providers") return [{ id: "anthropic", name: "Anthropic", modelCount: 1, dynamic: false, methods: [{ id: "api-key", label: "API Key" }] }];
    if (method === "auth.list") return [];
    if (method === "models.saved") return { items: [], nextOffset: 0, hasMore: false };
    if (method === "connections.create") { const connection = { ...connections[0]!, id: "second", name: "新账号" }; connections.push(connection); return connection; }
    if (method === "auth.start") { await loginPending; return null; }
    if (method === "connections.models") return { items: [{ id: "test", name: args.id === "second" ? "新账号模型" : "原有模型" }], nextOffset: 1, hasMore: false };
    return null;
  } });
  const renderModels = async () => { modelRoot.render(<RuntimeModels connections={[...connections]} refresh={renderModels} action={async operation => { await operation(); }} />); };
  await act(renderModels);
  await act(async () => { [...document.querySelectorAll("button")].find(button => button.textContent?.startsWith("Anthropic"))!.click(); });
  await act(async () => { document.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  assert(button("正在保存…")?.disabled, "Authentication remains pending before the parent connection list refresh");
  phase("complete authentication");
  await act(async () => { finishLogin(); });
  assert(document.body.textContent?.includes("新账号的模型目录") && document.body.textContent.includes("新账号模型"), "Adding a second connection retains the new account selection");
  results.push("PASS new connection selection across asynchronous authentication");
  await act(async () => modelRoot.unmount());
  phase("page lifecycle");
  const pageRoot = createRoot(document.getElementById("fixture")!);
  const host = createBrowserHost({ call: async () => null });
  let mounted = 0;
  function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => { mounted++; return () => { mounted--; }; }, []);
    return <Button onClick={() => setCount(value => value + 1)}>Count {count}</Button>;
  }
  await host.load("retained", { inject: ["clientApp"], apply(ctx: { clientApp: ClientApplication }) { ctx.clientApp.page({ id: "main", title: "Retained", keepAlive: true, component: Counter }); } });
  const show = async (visible: boolean) => { await act(async () => pageRoot.render(<>{host.pages().map(page => <PageSlot key={page.key} pluginId={page.appId} label={page.title} visible={visible} keepAlive={page.keepAlive === true}><page.component /></PageSlot>)}</>)); };
  await show(false); assert(mounted === 0, "Retained page mounts lazily");
  await show(true); await click("Count 0");
  await show(false); assert(mounted === 1 && !!document.querySelector("section[hidden][inert]"), "Hidden retained page is inert but mounted");
  await show(true); assert(!!button("Count 1"), "Page state and host UI context survive navigation");
  await host.unload("retained"); await show(true); assert(mounted === 0, "Disabling plugin disposes retained pages");
  await host.load("default", { inject: ["clientApp"], apply(ctx: { clientApp: ClientApplication }) { ctx.clientApp.page({ id: "main", title: "Default", component: Counter }); } });
  await show(true); await click("Count 0"); await show(false); assert(mounted === 0, "Default page unloads when hidden");
  await show(true); assert(!!button("Count 0"), "Default page state resets");
  await act(async () => pageRoot.unmount()); await host.dispose();
  results.push("PASS shared UI, opt-in retained state, default unload and plugin disposal");
  document.getElementById("results")!.textContent = results.join("\n"); document.documentElement.dataset.testStatus = "passed";
}
void run().catch(error => { document.getElementById("results")!.textContent = `${results.join("\n")}\nFAIL ${error.stack}`; document.documentElement.dataset.testStatus = "failed"; });
