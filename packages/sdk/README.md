# @semicoder/fn-sdk

Fn TypeScript 应用契约、页面客户端、后台注册与 Bun 构建工具。使用 Bun 1.4.4；安装 `@semicoder/fn-sdk@0.6.0`，页面配合 `@semicoder/fn-ui@0.1.0`。

- `./manifest`：fn.app.json 的 Zod schema、widgetDefinitionSchema 与构建描述。
- `./contract`：defineContract、method、stream、z；输入/输出均验证。
- `./backend`：defineBackend、Host、CallContext、ChatCall。
- `./client`：connectView、类型化 call/stream、models、ui、application。
- `./react`：useApplication、useI18n、useUnsavedChanges。
- `./widgets`：JSON DSL 类型、parseWidget、WidgetSize、widgetSizeSchema 与 widgetDimensions。
- `./sse`：SSE 与 Responses 完成终态处理。
- `./build`：inspectPlugin、buildPlugin、packPlugin。

页面使用 React 和独立 Fn UI，通过 HTTP JSON、SSE、WebSocket 访问真实宿主。后台运行内置 Bun，主动连接宿主。业务数据使用 host.paths，停止清理使用 setup 返回的 stop。

小组件声明单个固定 `size: "2x2"`，表示列数 x 行数，支持 1–4 列/行的任意组合。宿主按 Manifest 尺寸在固定网格中靠左排列；整理桌面支持排序和移除。预览器读取相同声明并复用桌面卡片规则。
