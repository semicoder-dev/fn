# Fn 应用平台开发规范

用户已确认多应用平台重构。Fn 管理应用生命周期、模型、标准 UI、应用摘要、安装更新和手机文字中转；应用持有业务与 Agent loop。首批官方应用为翻译、笔记、看板，在独立 fn-plugins 仓库维护。

- Bun 1.4.4、TypeScript、React、CSS Modules、自有 @semicoder/fn-ui；使用 Bun 构建与 bun fmt。禁止 Cordis、dsh、pi-ai、Vite、oxfmt、Tailwind 依赖。
- 每个有后台的运行应用一个 Bun 进程。打开启动、最小化继续、关闭停止。纯前端应用无需进程；无页面应用使用宿主状态页。应用崩溃不自动重启或重放任务。
- 公共通信使用 FIA 单一本机网关的 HTTP JSON、SSE、WebSocket。浏览器调试使用相同真实 API；标签关闭仅断开视图，视图所属调用取消。
- FIA 通用窗口、菜单、进程组、通信、CloudKit 和开发构建能力放在 framework/fia；Fn 的应用平台、SDK、模型与消息路由归 Fn。框架不反向依赖业务。
- 模型采用 OpenResponses，首期仅官方 ChatGPT 订阅授权。凭证由宿主持有；应用负责上下文和工具执行。宿主不提供 Agent loop、通用 Session 或业务 KV。
- 首页每个已安装应用一行，固定区域显示结构化动态摘要；宿主 renderer 不加载应用代码或 iframe。hostApi 2，关闭保留摘要和停止标记；业务视图通知与摘要独立。
- 配色统一定义在 packages/ui/src/theme.css，参考 dsh 原版明暗色值并映射为 --fn-*；宿主/应用消费变量，不在页面中重定义全局主题，不引入 dsh 包。
- UI 采用语义 CSS 变量；中英词条、明暗/系统主题和公共交互统一管理。技术标识小写，产品显示 Fn。
- 全新契约，无兼容层或数据迁移。业务数据与插件代码分离，不自动删除用户现有数据。
- 先检查 Git 状态；保留用户改动。短期 codex/ 分支；普通开发不升版、不推送、不发布、不替换日常应用。
- 修改契约同步 SDK、示例、框架文档、官网和根知识库。文档只描述目标方案及实际完成状态，不加入版本对照或迁移章节。
- 根目录统一安装依赖。FIA 先完成 framework:check/pack/verify，再验证 Fn 消费同一构建产物；实现需要类型、格式、测试、构建和浏览器/原生验证。
- 每轮维护 release/notes/unreleased.md。发布仍须明确授权，按 docs/github-release.md 执行；Semicoder 推送会部署，不能自动执行。
- 发布必须从上一公开安装版验证用户实际更新路径，区分完整 DMG 替换与在线代码更新；新包启动、数据保留和更新文件一致性不能替代旧版在线升级证据。
- 普通代码更新默认使用 release/update-policy.json 的 code 策略；runtimeId 漂移必须阻断发布并排查，不能为让 CI 通过而改成 installer。真正需要完整安装包时，例外须限定精确版本/build 并说明实际原生能力、权限或固定资源变化。
- 正式桌面发布使用 release-candidate.yml 构建一次并验收，再以 release:promote --run-id 提升同一产物；release.yml 不重新构建或签名。普通候选复用 release/runtime.lock.json，输入/摘要不符即阻断，完整 DMG 不等于必须重装。
