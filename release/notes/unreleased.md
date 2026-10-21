# 待发布改动

2026-10-21：用户授权合并与发布（包含新版手机内测）。以下历史开发条目归集至 [0.5.0 发布说明](0.5.0.md)，SDK 为 0.4.0，手机为 0.3.0（4）；发行尚在执行，逐项公开验收完成后再清空。下文“版本不变/未授权”均描述当时阶段。

2026-10-21 卡片与手机模型补齐：新增 `ctx.app.cards.action/create/cancel` 及共享 `./cards` 契约，桌面与原生 Chat 表单、持久认领/重连/过期与失败不重放；手机目录筛选桌面已添加且仍可用的模型，离线命令在执行前重新校验。新增 CloudKit v3 卡片类型仅保存在源码，未部署。应用/SDK 版本与 build 不变，验证见 `docs/runtime-validation.md`。

2026-10-21 继续验收：修复异步账号选择浏览器回归的定时器依赖；恢复页面 keepAlive、共享 SDK UI、SVG/文字图标与 Git 来源安装，Chat v3 增加共享已读游标及未读计数。OpenAI 预设目录明确区分账号权限；真实订阅、多轮网页工具与重启历史验证通过。所有改动未发布，详情见 `docs/runtime-validation.md`。

## Cordis 桌面核心能力补齐（2026-10-21，未发布）

恢复紧凑侧栏、设置二级导航、完整外观和 FIA 应用更新页。模型管理增加 Pi 服务商预设、账号目录与刷新、已添加模型、同服务多账号和自定义协议表单。应用中心增加新协议市场、来源管理、归档/npm 安装、按原来源更新及安装身份/完整性校验；官方新市场尚未发布，旧市场不混用。三个 Cordis 示例改为消费用户已添加的模型。此前新架构验收只覆盖内核和基础页面，不能视为已完成全部产品功能；补充证据见 [验证记录](../../docs/runtime-validation.md)。版本、build、公开安装入口不变。

## Bun + 原版 dsh Cordis 架构（2026-10-20，开发中，未发布）

用户确认 greenfield 重设计，`codex/dsh-runtime` 基线 `6d5d748`；版本/build不变。原版 dsh 发行包 + Bun SQLite、隔离连接与凭证、Cordis/npm 应用、新 SDK/桌面/Chat v3、官方 Bun 工具、完整运行目录与空闲重启。旧数据不读取、不迁移、不删除。FIA 新增后台重启及完整运行时资源；需完整应用包。详情与验证见 [架构](../../docs/cordis-runtime.md)和[验收](../../docs/runtime-validation.md)。官网新增未发布预览说明，公开入口不变。

Dev 由 fn 监督 runtime/SDK 快照重建及 backend/shared 重载，旧代后台准备候选，等待任务空闲后原子关闭新请求再重启；源码变化、构建失败和端点暂不可用不杀正在运行的任务。11 项监督器回归覆盖启动旧 seed、忙时等待、构建失败、构建中变更、重启失败、响应丢失、回滚和依赖变更边界；框架/配置/命令及根依赖仍沿用 FIA 原有重启流程。新 CLI 使用 `application create/check/build/pack`，不保留旧 `plugin` 命令别名。`npm:pack` 默认验证新 Cordis SDK 的实际归档与独立消费，包含共享模块、分页、后端 TS、客户端构建和应用包解包导入。

## fn Chat Markdown（2026-10-19，手机内测已分发，Mac 未发布）

来源：`codex/chat-markdown`，基线 `8c44331` 加工作树。iOS/Mac 共用 `ChatMarkdown`，用户/机器人正文与卡片文字块支持 GFM；保留换行、代码复制、原文复制及宽内容横向滚动。固定 MarkdownUI 2.4.1 与 SwiftPM 锁文件。网页/邮件链接受协议限制，图片不自动下载；无 HTML 执行、语法高亮、公式或 Mermaid。

仅客户端渲染改变，既有历史与 CloudKit/SDK 契约不变；既有 TestFlight 0.2.0（2）不含此更新。用户随后明确要求 TestFlight 新版本，手机 0.2.1（3）已完成 Apple 处理并加入原内部测试组，状态“正在测试”，状态见 [TestFlight](../../clients/apple/TESTFLIGHT.md)。Mac/SDK 仍未发布，版本不变；官网安装与后端聊天指南随内测结果同步。验证结果见 workspace `docs/agent/sessions/2026-10-19-fn-chat-markdown.md`。

## 插件 SVG 图标（2026-10-18，本地未发布）

来源：codex/plugin-svg-icons，fn 基线 2e315eb；官方插件基线 0f00988，官网基线 6b84c0a。作者通过 src/icon.svg 和可选 iconSvg: dist/icon.svg 提供单色图标（8 KiB）；SDK 检查/构建/验包，模板和三个官方插件联动。PluginInfo 增加可空 iconURL；停用/后端错误仅放行声明图标。市场可选 iconSvg 携带内容，统一图片/CSS mask 跟随前景色，保留文字回退及 fn Chat 文字。

三个官方开发插件统一使用带来源哈希的固定开发 SDK，正式市场与公开归档不改。应用/SDK/插件版本及 build 不变；发行前需公开兼容 SDK/宿主并为插件选择新版本。官网清单、分发、插件管理指南只增加未发布说明，默认公开安装路径不变。验证：完整 check、146 项应用测试、build、SDK/插件独立归档消费、原生与浏览器明暗/状态/430px 界面通过；官网内容、链接和格式通过。详见 workspace 的 SVG 交付记录。

2026-10-18 追加授权：聊天 v2 的 iOS **0.2.0（2）** 已完成 Apple 处理并加入本人内部 TestFlight 组，v2 生产 schema 和订阅已部署验证；详情见 [TestFlight 记录](../../clients/apple/TESTFLIGHT.md)。下方是先前本地实施边界，手机内测不代表 Mac/SDK 公开发行，相关改动继续留在本清单。

## 宿主 Agent loop 与结构化消息（2026-10-18，本地未发布）

后续插件消费：用户追加要求搜索插件接入 fn Chat，已在独立 fn-plugins `codex/web-search-chat` 实现 `web-search` 0.1.0，使用固定开发 SDK 快照；网页与 Chat 共享宿主循环，原生模型选择卡片、进度、答案/来源和取消均已接入。本次无宿主协议或客户端改动，未上架；说明见该插件 README，验证见 workspace 搜索插件交付记录。

真实搜索反馈修复：Agent 每次模型请求附宿主当前时间和时区，避免猜测“今天”；web_search 的空白 site 视为不限站点，timeRange 支持 all 映射为无时间筛选，公共 web API 不变。插件补充空结果放宽限制、动态空页面换源策略，按当前轮次展示来源和具体查询/结果数，直接显示失败与无来源提示。开发插件重装保留原有设置与历史，手机协议无变化。

搜索引擎验证码曾被误判为正常零结果：通用识别修复位于 agent-webtool `codex/search-challenge-detection`，fn 开发分支暂时固定消费 `vendor/agent-webtool-dev.tgz`，哈希与来源见同目录 JSON；不是公开 npm 0.8.1。发布前必须切回独立验收的公开版本。插件在引擎受阻时报告原因，并尝试直接读取公开新闻栏目及具体报道。

来源：`codex/agent-loop`，基线 `6649a64`；参考 DeepSeek Harness `687f282e86`，不引入运行时依赖。应用/SDK/FIA 版本及 build 保持不变。

- 前后端 `agents` SDK 与共享 API：显式工具选择、多步循环、后续轮次、状态和分页事件、取消与空闲会话删除。
- text/reasoning/tool-call 消息、模型 usage/opaque replay、工具模型内容与展示 meta 分离；独立 SQLite 事件日志及重启中断不重放。
- 宿主 web_search/web_fetch 和插件 defineTool 声明；参数校验、顺序执行、错误结果、有界时限/体积/步数及插件/模型/应用更新占用。
- 模型继续复用 Pi；自定义兼容服务走 Chat Completions，ChatGPT 订阅走账号绑定的 Responses，不切换计费路径。旧文本 models/runs 保持可用。
- 说明与边界见 [Agent 文档](../../docs/agents.md)。Semicoder 前后端 SDK/自动化页同步未发布范围，默认公开安装入口不变。
- 验证：完整 check、最终 142 项应用测试 / 1342 断言、应用构建、隔离数据的打包启动/退出及 SDK 归档独立消费通过；官网内容/链接、生产构建和 38 个静态页面检查通过。追加真实 GPT-6-Luna 天气/新闻基础验收已返回带来源答案，插件最终归档通过 ChatRunner/Agent 模拟集成；手机再次发送和推送尚未复验。未发布应用、SDK 或插件。

## 多端机器人聊天 v2（2026-10-18，本地未发布）

来源：`codex/ios-communication`，基线 `b915d82` 加当前工作树；保留已有 CloudKit/签名开发改动。应用、SDK、FIA 与手机版本/build 均未改变。普通开发未授权推送、发布、TestFlight 上传或生产 schema 部署。

- fn 宿主作为可切换服务端，每个插件对应固定机器人聊天；多 iOS / Mac 聊天客户端共享历史、卡片结果、已读和归档。宿主保留插件页面，通信页改为只读监控。
- 新增 `clients/apple/FnChatCore` / `FnChatUI`、iOS 启动层及独立 Mac `fn Chat`。聊天端只发文字，机器人下发文字或原生交互卡片。
- v2 独立 zone、SQLite、记录类型和 outbox，停用本应用旧订阅；保留旧数据，不做兼容或迁移，不消费旧请求。
- SDK `chat` 替换未发布的 `communication/remoteActions`；显式持久 `onMessage/onResponse`、会话串行、版本校验、有限超时、异常中断不重放。
- FIA 增加通用 zone 静默订阅和幂等退订。机器人创建记录才触发可见提醒，其余变更仅提示同步。
- 本轮只适配 `chat/acceptance`，官方插件和公开市场保持原状。新增完整协议/卡片 fixtures、持久化/竞争/路由/账号隔离测试。

开发说明：[fn Chat](../../clients/apple/README.md)。工程及真实验收见 workspace `docs/agent/sessions/2026-10-18-fn-chat.md`；未验证项必须在发行前补齐。Semicoder 安装、后端 SDK 与 FIA 分发页面同步未发布边界，未推送部署。

## 此前阶段证据

2026-10-16 的 v1 CloudKit 原型和内部 TestFlight 0.1.0 (1) 属于历史实现，不能证明 v2 已验收。记录保留于 [历史 iOS 说明](../../ios/README.md)、[TestFlight 历史](../../ios/TESTFLIGHT.md)。公开 fn 0.4.5/build 9、SDK 0.3.5 不包含本节聊天能力。
