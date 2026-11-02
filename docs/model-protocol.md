# 模型协议与 SDK

2026-11-02，按用户确认方案在 `codex/openresponses-contract` 实施。类型、运行时校验和回归已完成，准备 Fn 0.8.4/build 20、SDK 0.8.0、UI 0.2.2 与翻译 0.3.1 联合发行。OpenResponses 上游严格只读。

## 固定来源与生成

`protocol/openresponses/` 自包含未修改的 OpenAPI 快照、上游 LICENSE 和 `source.json`。来源为 `https://github.com/openresponses/openresponses` 的 `dce9ddb91921427c2ba06901c7dfaf0cc7056799`，`public/openapi/openapi.json`，规范标识 `2026-04-24`，SHA-256 `1f469fc044bc3c0ee9bb8210b76435ce2386ed792c16863f8dc9bd6070b87f6a`。本轮未 fetch 上游；与同日期归档的只读比较为契约 0 差异、文档 191 差异，二者字节不同。

- `bun run protocol:generate`：校验固定摘要，生成 SDK 的 108 个协议类型及运行时 schema 数据；生成器为 `scripts/protocol/generate.ts` v1，以本项目固定 Bun 格式化输出。
- `bun run protocol:check`：检查摘要、版本与生成结果漂移。已进入 `check` 和 `npm:pack`，不要求相邻仓库存在，不联网读取最新协议。
- 显式升级时，在 Fn 中更新快照、来源提交/摘要和许可证，再生成、审阅差异及运行回归；不在只读上游运行生成、安装或格式化命令。
- 生成器遇到未实现的 JSON Schema 校验关键字即失败。运行时支持该快照使用的 ref、anyOf/oneOf/allOf、required、enum、null、对象/数组、长度、范围、pattern、字典和属性数约束；不会应用 default、强制转换或删除扩展字段。oneOf 校验唯一匹配；递归深度上限为 128。
- npm 包携带生成代码及 `third-party/openresponses.LICENSE`。源快照保留在 Fn，SDK 运行不读文件系统、不依赖上游站点、生成工具或 Zod 3。

上游 `schema/*.tsp` 与 `src/specifications/2026-04-24.mdx` 用于理解语义；机器契约以固定 OpenAPI 为准。请求/输出的必填、可空及 null-only 字段保持分离，default 不使必填字段变为可选。

## 类型与调用

后台 `host.models.responses(request, { connectionId, signal })` 和页面 `view.models.responses(request, options)` 调用形式不变，返回 `AsyncIterable<ResponseEvent>`。连接 ID、凭证、取消、并发和 `models.list/default` 的模型目录 DTO 属于 Fn，未改成协议资源。

`@semicoder/fn-sdk/types` 与包主入口导出模型类型；`@semicoder/fn-sdk/responses` 同时导出类型、验证函数和 `ResponseStreamError`：

| 导出 | 含义 |
| --- | --- |
| `CreateResponseBody`、`ItemParam`、`ItemField`、`ResponseResource`、`Usage` 等 | 上游完整 schema 类型；包括 compact/WebSocket 的数据类型，不代表 Fn 提供相应服务 |
| `ResponseInputItem`、`ResponseRequest` | Fn 当前连接的请求；要求 model、完整 input 数组、store:false、stream:true，排除 system message 和禁用参数 |
| `ResponseEvent` / `StreamingEvent` | 24 种标准 SSE 事件的判别联合；type 判断后 delta、item、response 具有具体类型 |
| `ProviderResponseEvent` | 带提供商前缀的扩展事件，独立于标准联合，避免破坏 type 收窄 |
| `validateResponseRequest(value)` | 连接策略与上游嵌套请求校验，返回原对象；错误为 invalid_request 或 unsupported_parameter |
| `parseProtocol(name, value)` | 按固定 schema 验证任意协议资源，返回具体类型；失败为 invalid_protocol |
| `parseResponseEvent(value)` | 标准事件结构校验或扩展事件封套校验；失败为 invalid_event |
| `ResponseStreamError` | 模型失败事件对应的 FnError 子类，event 保存完整的 failed/incomplete/error 事件 |

```ts
import type { ResponseRequest } from "@semicoder/fn-sdk/types";
import { ResponseStreamError } from "@semicoder/fn-sdk/responses";

const request: ResponseRequest = {
  model: model.id,
  input: [{ type: "message", role: "user", content: "你好" }],
  store: false,
  stream: true,
};
try {
  for await (const event of host.models.responses(request, {
    connectionId: model.connectionId,
    signal,
  })) {
    if (event.type === "response.output_text.delta") consume(event.delta);
    if (event.type === "response.completed") save(event.response);
  }
} catch (error) {
  if (error instanceof ResponseStreamError && error.event.type === "response.incomplete") {
    report(error.event.response.incomplete_details?.reason);
  } else throw error;
}
```

示例中的 host、model、signal、consume/save/report 由应用提供。ResponseStreamError 用共享 symbol 标记，宿主 runner 打包的 SDK 与后台应用冻结 SDK 的构造器不同也可识别；错误对象不经过 JSON 序列化时保留 event。应用自身 API 的错误序列化仍遵循其原有通信契约。

## 连接与校验边界

当前连接保持 `unsupportedResponseParameters` 明确列出的限制，包括 previous_response_id、background、temperature、top_p、max_output_tokens 等；未知顶层参数也会拒绝。完整上游请求类型仍保留这些字段，不能用完整类型推断 ChatGPT 连接支持全部能力。

输入 item/content、工具定义与工具结果、reasoning、text 格式等按快照校验。当前核心工具仅 function，非标准工具不会因原先 unknown 类型放行而被视为已支持；system message 使用 instructions 或 developer message 替代。每条 message 必须显式带 `type: "message"`。任意 JSON schema、metadata 等上游开放字段保留其开放语义，标准字段仍有具体类型。

页面 SDK 与后台 runner 在请求发出前校验；宿主在读取凭证和占用模型槽位之前再次校验，防止绕过 SDK 的调用进入上游。翻译 0.3.1 显式发送 message type，使用 SDK 0.8.0 的事件判别联合；中断或失败不保存历史。

本次联合交付 SDK、宿主与翻译应用。按用户确认，不接受旧协议输入、不增加旧 SDK 或旧翻译包兼容层。

## SSE 与错误

两端共用 `readResponses()`：检查 JSON 和事件结构、SSE event/body type 一致、非负且递增的 sequence_number（允许间隔）、同一流的 response ID、事件/响应状态一致和完成后的额外事件。完整 response 字段必须存在，不补造资源或序号。ChatGPT 当前接口额外发送审核元数据 `response.metadata`；宿主 `chatgpt-stream.ts` 仅将这个已知扩展映射为 `openai:response.metadata`，保留原序号、response_id 与 metadata，并校验其封套。标准 SDK 不接受原始未命名空间的事件，也不放行其他未知核心事件。

- `response.completed` 后可直接 EOF，也可附一个 `[DONE]`；提前/重复 `[DONE]` 或终态之后再发事件报 invalid_event。
- 未收到完成终态即断流报 interrupted；取消传入 reader/fetch，错误或提前停止消费也会释放 reader。
- failed/incomplete/error 抛 ResponseStreamError；保留额度 code/message，以及完整响应、usage、incomplete_details 或 error.param。它们不会先作为正常事件交给调用者。
- 未知核心事件拒绝。符合 `provider:event` 命名且具合法序号的扩展事件验证封套后忽略，不扩大标准事件联合；已知资源中的附加字段原样保留。
- 泛用 readSSE/encodeSSE 仍可用于应用业务 SSE；严格模型消费不能用默认 event:message 冒充 Responses 事件。

当前不实现模型 WebSocket、compact、provider 自定义 item/tool 适配，也不宣称完整工具生命周期状态机或上游服务全量合规。任何提供商与基线存在差异时，应明确评估协议/适配边界，不能为通过请求而删去核心字段校验。

## 验证与已修复缺口

实施前 `3a45b84` 的 6 个探针分别放行 input 数字、错误 reasoning effort、缺少 name 的 function、缺少 type 的 system 消息、不完整 completed、数字 delta。原 9 项相关测试通过但未覆盖它们；现在均有负例回归，成功 fixture 使用完整协议数据。

- 编译期 `packages/sdk/tests/responses.types.ts`：type 收窄、请求/输出差异、必填 name/type/response、nullable/null-only、禁止参数、枚举与未知字段；同一文件也在仓库外实际归档消费时编译。
- `responses.test.ts` 与宿主模型回归：嵌套字段、24 事件结构、扩展、序号/状态/身份/终态、UTF-8 分块、取消、错误详情、跨 SDK 副本错误识别和宿主前置拒绝。
- SDK/UI 实际归档在全新临时目录安装，模型请求/SSE/错误运行、页面/后台构建与类型检查通过；不读取 workspace 协议目录。
- 独立应用候选验证：`fn-plugins` 的 `verify:sdk-candidate <manifest.json>` 校验归档哈希，在临时副本覆盖 SDK/UI，完成全部应用检查、30 项测试/142 断言及五包打包。翻译新增必填 type 和中断不提交历史回归。
- Fn 完整检查、49 测试/354 断言与最终应用构建通过；浏览器和原生 WebView 使用候选归档的隔离测试应用，各通过后台/页面请求拒绝、有效请求抵达未连接账号错误、原始 HTTP 绕过 SDK 的宿主拒绝、typed completion 和 malformed completed 共七项检查。测试进程及浏览器空间已关闭，日常应用未替换。

真实 ChatGPT `gpt-5.6-sol` 翻译、强制 function call 与工具结果回传三轮通过完整 SDK 校验，标准响应资源字段完整；验证发现并修复上述审核元数据事件边界。证据仅记录模型/事件种类/完成状态，不保存凭证或真实用户内容。模型契约不改 FIA 运行时；发行验收期间另修复 FIA TypeScript 打包工具的 DMG 卸载繁忙处理。正式发行继续执行固定 0.8.3 runtime 与真实升级路径门禁。
