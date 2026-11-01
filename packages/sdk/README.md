# @semicoder/fn-sdk

Fn TypeScript 应用契约、页面客户端、后台注册与 Bun 构建工具。使用 Bun 1.4.4；SDK 0.7.0 / UI 0.2.0 对应 Fn 0.8 的 hostApi 2；新应用不使用旧 widgets 契约。

- `./manifest`：fn.app.json 的 Zod schema、summaryDefinitionSchema 与构建描述。
- `./contract`：defineContract、method、stream、z；输入/输出均验证。
- `./backend`：defineBackend、Host、CallContext、ChatCall。
- `./client`：connectView、类型化 call/stream、models、ui、application。
- `./react`：useApplication、useI18n、useUnsavedChanges。
- `./summary`：ApplicationSummary、SummaryState、applicationSummarySchema、parseSummary。
- `./text`：TextValue 与国际化词条结构。
- `./sse`：SSE 与 Responses 完成终态处理。
- `./build`：inspectPlugin、buildPlugin、packPlugin。

页面使用 React 和独立 Fn UI，通过 HTTP JSON、SSE、WebSocket 访问真实宿主。后台运行内置 Bun，主动连接宿主。业务数据使用 host.paths，停止清理使用 setup 返回的 stop。

每个应用一行，后台 `host.application.setSummary(snapshot | null)` 更新唯一摘要，`notifyDataChanged()` 独立通知页面。清单使用可选 contributes.summary；动态摘要要求后台和 application.summary。完整替换、关闭缓存、重启保留，更新包重置派生摘要。
