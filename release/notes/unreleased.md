# 待发布改动

## 全插件化候选（2026-10-22，本地提交，未发布）

- Bun/FIA 最小宿主；取消集中 FnRuntime、旧应用 SDK 和固定前端分支，采用原版 Cordis Loader、Include patch、客户端模块和 Slots/renderer。
- 修复全插件化 UI 的侧栏按钮边框与设置页收缩：通用控件默认样式使用 base 层，默认布局按原版 display:contents 插槽拉伸页面；设置内容独立滚动。
- 产品能力拆为 `@semicoder/fn-*` 插件；默认 profiles 组合模型、会话、Chat/卡片/CloudKit、文件/进程/原生工具、市场、布局、主题和更新。
- FIA 增加可撤销命名空间 API 注册与取消清理。共享内核、增量安装、忙时等待重启及恢复链路保留。
- 删除公开 KV、网页工具接口、旧协议/入口/模板/探针，以及本地官方市场三个测试应用。独立 agent-webtool 和远端生产市场不修改。
- 新数据根 `plugins-v1`、Apple Chat v4；不读取、迁移或删除旧数据。未来发行需要完整 DMG 与配套手机/CloudKit 发布，不可原地把旧插件视为兼容。
- SDK 文档、官网未发布候选页与 workspace 知识库同步；公开安装仍指向已发布的 0.5.2。

验证与真实设备/OAuth边界见 [验收记录](../../docs/runtime-validation.md)和[能力矩阵](../../docs/core-capability-audit.md)。应用 0.5.2/build 12、SDK 0.4.0、手机 0.3.0（4）的版本字符串暂不修改；本地候选不是这些公开发行产物。
