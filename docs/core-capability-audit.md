# fn 0.5 产品能力与验收边界（2026-10-21）

发行后修正：公开 0.5.0 的 `coreVersions` 漏登记 React/React DOM，三个官方应用经过市场门禁均被误判不兼容。此前公开归档的底层安装通过，不能代表“官方市场点击安装”完整入口通过。`codex/market-core-versions` 已补齐版本/单例登记和真实市场回归；修复已归集到 0.5.1/build 11 候选，正式产物待验，见 [运行验证](runtime-validation.md)与[待发布清单](../release/notes/unreleased.md)。

对照旧活动入口 `frontend/App.tsx`、`Settings.tsx`、`PluginManager.tsx`、`backend/plugins.ts`、SDK UI/图标构建器及 Apple Chat v2；旧数据、旧 SDK 和旧协议不兼容，产品能力仍需单独核对。

| 原能力 | 新实现与验收 | 边界 |
| --- | --- | --- |
| 图标侧栏、应用中心、设置二级导航 | `RuntimeApp` + `RuntimeApplications`；真实 Preview 与浏览器验收 | 不增加第二栏应用列表 |
| 明暗模式、主题、原生标题栏、跨窗口同步 | 复用 `ThemeProvider` / `AppearanceSettings`；外观夹具通过 | 新数据独立保存 |
| 置顶、系统浏览器、窗口生命周期 | FIA 原生窗口继续提供；本轮 FIA 合同和独立消费验证 | 不由 Cordis 重写 |
| 多服务商、同服务多账号、订阅/API Key、自定义端点 | 42 个 Pi provider；连接隔离合同与真实 GPT 订阅请求、流式取消、网页工具通过 | 无第二个真实账号；交互登录和过期 token 刷新未验。OpenAI 是预设目录，不等于权限列表 |
| 已添加模型列表、模型切换、运行历史 | `models.saved`、Session 固定连接、投影；真实重启历史恢复 | 手机同步已添加列表与当前连接目录的交集；离线新建/切换再次校验，既有会话绑定保留 |
| 市场源、安装、更新、启停、卸载 | schema 2 市场与 immutable generation；来源/完整性/失败回滚/忙时更新合同和浏览器流程通过 | 三个官方 Cordis 0.1.0 与新市场已公开；不混用旧市场 |
| npm、归档及 Git 地址安装 | 新增 `github:owner/repo#ref`、`git+https://…#ref`、HTTPS `.git#ref`；真实 Git 本地 transport 夹具验证提交归档与清理 | 不执行仓库构建脚本，需要已提交前端产物；未测试远端 Git 服务可用性 |
| SDK 共享 UI、主题与浮层 | 新构建器共享 `@semicoder/fn-sdk/ui`；与宿主组件身份一致，独立 SDK 消费通过 | 独立 CSS 文件仍不自动注入，作者使用共享 UI/组件样式 |
| 文字/SVG 图标 | SDK 原子构建、验包后读取、图片/mask 渲染；非法 SVG 保留旧版本；三个例子重建 | SVG 不超过 8 KiB，不注入 DOM |
| 显式 keepAlive、页面与后台任务独立 | 页面默认卸载，可选保持当前窗口状态；浏览器验证延迟挂载、保留、默认销毁和插件卸载 | 重启/禁用销毁页面，草稿需要应用自行保存 |
| 自动检查、下载、忙时延后、失败回滚 | FIA 原生更新器与原页面复用；签名/哈希/下载/激活/回滚 fixture 和 UI 通过 | 公开 0.5.0 DMG 和签名更新源 32 文件独立验收通过；运行时变化须完整 DMG；Dev/Preview 不使用正式更新源 |
| Chat 离线队列、共享历史、归档、通知定位、Markdown/复制 | Session v3 + 现有原生 Markdown；TypeScript/Swift 合同及 iPhone 本地构建通过 | 生产 schema、两环境 zone/四类订阅与签名手机 0.3.0（4）分发已验；真机业务/通知未验 |
| 跨设备已读、未读计数 | 补充持久 read 命令；单调合并、历史上界、账号隔离、离线重试/重启与另一客户端测试通过 | 手机仅在前台阅读时标记；尚无真机链路证据 |
| Chat 自定义卡片 | `ctx.app.cards.action/create/cancel`、Session 关联持久记录、桌面和 Apple 表单；并发、重启、写入失败、作用域销毁、离线回复合同及浏览器回归通过 | 新 v3 卡片类型已部署，内部 TestFlight 已分发；不兼容旧协议。实际手机卡片交互与通知仍待验收 |

浏览器回归不再使用固定 10/30 ms 计时模拟认证，改为显式 deferred Promise；每阶段输出名称，失败保留上下文。稳定 Dev 上新夹具连续三次通过，未通过延长浏览器/后端超时掩盖问题。之前自动化超时未重现，不能仅凭此判定唯一根因；后台重启后必须重新签发浏览器授权。

真实模型验收使用现有用户授权的连接，未复制、导出或修改凭证。测试会话包含最小回复、多轮 web_fetch（HTTP 200）和首个 stream delta 后取消，最后归档保留审计记录；不自动重放工具。未进行新登录、强制 token 过期或另一账号授权。

详细数值与产物证据见 [验证记录](runtime-validation.md)。用户随后授权合并主干并发布，含新版手机内测。公开产物与部署证据见[应用发行](github-release.md)、[SDK 发行](npm-release.md)和[TestFlight](../clients/apple/TESTFLIGHT.md)。
