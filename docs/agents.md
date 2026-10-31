# Fn 自动化入口

Fn 的应用 CLI 与 GUI 使用同一宿主。先启动对应 Dev/Preview 实例，再检查 `fn help` 和 API schema。技术命令保持小写。

```sh
fn call platform.command --json '{"action":"state"}'
fn call platform.command --json '{"action":"open","input":{"instanceId":"fn-notes"}}'
fn call platform.command --json '{"action":"close","input":{"instanceId":"fn-notes"}}'
fn plugin dev . --browser
```

关闭有活动任务时返回 busy；明确允许丢弃任务时才传 force:true。不要自动重放 execution_unknown、interrupted 或 failed 的写任务。CLI 启动不需要展示桌面窗口。
