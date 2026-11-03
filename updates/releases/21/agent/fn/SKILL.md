---
name: fn
description: "Manage Fn applications, models and messages."
compatibility: macOS 14+, Apple Silicon; requires the fn desktop application.
metadata:
  version: "0.8.5"
  build: "21"
---

# Fn

Use the installed `fn` command. The application owns its runtime; no separate Node.js or Bun install is needed.

Run `fn help` and `fn schema --json` for the active application's API. If the build differs from this skill, use the live schema. Read [API reference](references/api.md) for details.

Call a method with `fn call METHOD --json '{...}'`. Subscribe with `fn events EVENT --jsonl [--count N] [--timeout MS] [--match JSON]`. Match is a JSON object of top-level scalar fields (AND). Reaching count exits 0; timeout exits 124 without an error frame. Events have no replay: establish the subscription before triggering work and read current state again after waiting.

Compose operations in TypeScript:

```sh
fn exec <<'TS'
console.log(help());
// await app.call("method.name", { ... });
TS
```

Scripts receive app.call(), app.on(), app.onReconnect(), and help(). Use console.log for results. Type definitions are in [agent.d.ts](agent.d.ts). Each invocation is independent. Scripts are trusted local code with file and network access, not sandboxed. The default timeout is 60 seconds; --timeout takes milliseconds, with 0 disabling it.

CLI calls start the application in the background when necessary. Use `fn open` to show the desktop UI. Do not automatically repeat a call after an execution_unknown error: effects may already have occurred. app.on(event, listener, {match}) filters events on the server. Subscription changes reconnect the shared stream and trigger onReconnect. Event reconnection does not replay history; read current state again. Long-lived business jobs must be managed through the application's API.

# Fn

使用平台管理本地应用、模型与消息。先读取 help/schema 与 platform.command state。打开应用使用 open，关闭使用 close；busy 时应说明任务或未保存内容并取得用户意图后再 force。窗口最小化不会停止后台。

插件开发使用 plugin init/check/build/pack/dev。开发实例单独隔离，修改会中断任务，不自动重放。模型授权由用户在官方登录界面完成，不读取或输出宿主凭证文件。手机等待消息不会自动启动关闭的应用。

首页每个已安装应用一行，按顺序展示动态摘要；plugin summary 校验/预览结构化快照。新应用采用 hostApi 2，setSummary 与 notifyDataChanged 各自负责摘要和页面刷新。旧契约应用需更新包，不能运行；不清空业务数据。


## Application commands

- `fn plugin --help`: Create, build and debug Fn applications

These commands run in supervised processes, preserve the caller's working directory, and use the active application code. Their own documentation describes any development dependencies.
