# FIA 共仓开发

`framework/fia/` 是活跃源码，提供通用框架能力。Fn 在根 workspace 使用同一构建产物，不能在应用层长期绕过框架问题。

```sh
bun run framework:prepare
bun run framework:check
bun run framework:pack
bun run framework:verify
bun run dev
```

prepare 构建固定 Bun 1.4.4、Swift Host 与 CLI；verify 导出框架到独立目录并构建消费者。报告位于框架构建目录和 `artifacts/fia/`，使用文件摘要区分内容。

Fn 使用 FIA 的 managedClose 原生窗口、动态状态菜单、processes 受管理进程组和 HTTP pages/authorize 扩展。框架不读取 fn.app.json，不实现应用生命周期业务或模型协议。

共仓开发会监听框架和应用源码，构建完成后重启实例。页面统一 Bun 构建，更新后整页刷新。公开 SDK 不依赖框架内部 stdio；插件通过本机网关连接 Fn。
