# @semicoder/fn-sdk

Fn TypeScript 应用契约、页面客户端、后台注册与 Bun 构建工具。使用 Bun 1.4.4；SDK 0.8.0 / UI 0.2.2 对应 Fn 0.8 的 hostApi 2；新应用不使用旧 widgets 契约。

- `./manifest`：fn.app.json 的 Zod schema、summaryDefinitionSchema 与构建描述。
- `./contract`：defineContract、method、stream、z；输入/输出均验证。
- `./backend`：defineBackend、Host、CallContext、ChatCall。
- `./client`：connectView、类型化 call/stream、models、ui、application。
- `./react`：useApplication、useI18n、useUnsavedChanges。
- `./summary`：ApplicationSummary、SummaryState、applicationSummarySchema、parseSummary。
- `./text`：TextValue 与国际化词条结构。
- `./sse`：SSE 与 Responses 完成终态处理。
- `./build`：inspectPlugin、buildPlugin、packPlugin。

模型入口为 `host.models.responses(request, { connectionId, signal })` 和 `view.models.responses(request, options)`。当前开发源码（未发布）按固定 OpenResponses 2026-04-24 / dce9ddb 同步 108 个协议类型与 24 个 SSE 事件，`ResponseEvent` 按 type 收窄。`./responses` 导出完整协议类型、Fn 连接请求类型、`validateResponseRequest`、`parseProtocol`、`parseResponseEvent` 和保留完整失败事件的 `ResponseStreamError`。包内 `third-party/openresponses.LICENSE` 为上游许可证；SDK 运行不依赖相邻仓库或生成器。

每条输入消息必须显式包含 `type: "message"`。完整 input 数组、`store:false`、`stream:true` 是 Fn 当前连接限制，previous_response_id 等禁用参数仍被拒绝。页面/后台请求前与宿主入口均校验嵌套结构；模型 SSE 校验封套、资源、序号、状态和终态，失败事件保留在 `ResponseStreamError.event`。提供商前缀扩展事件验证后忽略；未知核心事件拒绝。完整协议类型的导出不意味着 Fn 提供 WebSocket/compact 或全部提供商能力。本次 SDK 0.8.0 正式纳入该契约。

页面使用 React 和独立 Fn UI，通过 HTTP JSON、SSE、WebSocket 访问真实宿主。后台运行内置 Bun，主动连接宿主。业务数据使用 host.paths，停止清理使用 setup 返回的 stop。

每个应用一行，后台 `host.application.setSummary(snapshot | null)` 更新唯一摘要，`notifyDataChanged()` 独立通知页面。清单使用可选 contributes.summary；动态摘要要求后台和 application.summary。完整替换、关闭缓存、重启保留，更新包重置派生摘要。
