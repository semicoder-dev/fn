# 自动化与业务 API

当前候选通过 FIA 动态 API registry 暴露插件自己的命名空间。使用 `bun run agent schema --json` 获取实际方法，`call`、`exec`、`events` 的传输由 FIA 统一提供。事件无回放，重连必须重读状态；消息限制为 1 MiB，长列表使用分页。

具体业务和取消/去重要求见 [Agent 指令](../agent/instructions.md)。插件 CLI 仅 check/build/pack；故障恢复始终可通过 `host.recover`。启动浏览器使用 `bun run agent open --browser`，授权在后台重启时失效。
