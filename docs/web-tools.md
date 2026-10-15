# 网络工具接口

网络接口自 fn 0.4.5 / SDK 0.3.5 提供，manifest 保持 0.3。实现提交 `cdd1c06`，基线 fn `6e11ea8` / agent-webtool `0c7e769`；发行状态分别见[应用发布记录](github-release.md)与[SDK 发布记录](npm-release.md)。

## 接口与归属

`backend/web.ts::WebTools` 提供宿主任务，`shared/web.ts` 定义 fn 自有 schema；插件 SDK 通过 `web.search/fetch` 直接等待结果并支持 AbortSignal。宿主 API `web.search/fetch` 接受 `{pluginId,input}` 并立即返回 WebTask，`web.get/cancel` 接受 `{pluginId,taskId}`；`web.changed` 通知标识与状态。前端先订阅再启动，拿到 ID 后立即读，断线重读，每秒轮询兜底；状态读取和取消的连接异常可按任务 ID 重试，最长等待 150 秒后清理监听。启动回复丢失时不自动重发，后台任务按总时限回收。

每次调用创建独立 SourceContext，编号不跨调用累计。任务无磁盘持久化；8 并发、120 秒总时限、256 KiB 完整序列化结果上限、32 条终态/10 分钟保留。HTTP 错误页返回状态与正文，跨域跳转返回元数据；搜索即使全部引擎失败也保留逐引擎诊断。退出取消在途任务，插件启停/更新/卸载及应用更新检查网络占用。可信插件边界不变，pluginId 检查不是恶意插件沙箱。

抓取、搜索、缓存、结构化页面结果、流式 10 MiB 上限和 DNS/正文取消归 agent-webtool；框架无需修改。模型工具调用、agent loop、通用 HTTP、动态浏览器和新官方插件不在本次范围。

## 正式依赖与开发历史

发行候选精确消费 `agent-webtool@0.8.1`，由 package.json 与 bun.lock 固定；普通安装和构建不读取相邻项目。fn SDK 和前端包不依赖此服务端包，旧插件不强制重建。

开发阶段固定归档 `0.8.0-fn.dev1718dd4499f7` 的来源指纹及校验记录保存在实现提交 `cdd1c06`，SHA-256 为 `0a2d0882fd4cf29acea512811d6cd128e9c7d922ea56070ed9666f3098226823`。该归档是未发布开发快照，不等于公开 0.8.0；发行时在公开 0.8.1 独立消费验收后替换，旧归档和刷新脚本不参与正式构建。

## 实现阶段验证（2026-10-16）

- agent-webtool：check、108 项测试 / 626 断言、build、npm:pack 通过；Node ESM/CJS、TypeScript、CLI/MCP 实际归档独立消费通过。
- fn：check（含 FIA 77 项 CLI、48 项 Swift）、112 项应用测试 / 1173 断言、build、npm:pack 通过。新增 13 项覆盖宿主 API、直接 SDK、来源隔离、所有权、启动期间取消、重连/漏通知、容量/TTL、结果限制与插件生命周期。
- 仓库外临时源码副本不含 node_modules 或构建输出，冻结安装和完整构建通过，无相邻 agent-webtool 仓库依赖；快照校验脚本后续增加安装版本和输入指纹自检，单独校验及 TypeScript 检查通过。
- 临时插件在全新数据目录的 fn Preview 安装，前后端 SDK 实际抓取 example.com 返回 200；浏览器前端搜索 `Bun runtime`，baidu/wechat/toutiao/duckduckgo 本次均成功，聚合限制 2 条。前端立即取消返回 AbortError，前端产物不含 undici、DNS 或服务端代理实现。
- Preview 以干净环境启动，系统 HTTP/HTTPS 代理启用，FIA 原生代理接入下实际联网通过；未改系统代理配置。重启清空网络任务、保留临时插件；正常退出及原进程组清理通过。
- 最终复核补强查询/取消的断线重试并新增回归；fn check/test/build、SDK 归档验收再次通过。以上 Preview 联网和干净副本构建发生在此补强之前。
- 官网 content:generate/check、docs:check、变更文件格式、build/build:check 通过，38 个静态页面与锚点通过。默认安装入口保持公开版本，仅增加未发布说明。

沙箱内套接字和 npm 缓存/网络限制曾导致检查失败；已用本次临时缓存及允许本地端口/联网的执行环境重验通过，没有放宽项目规则或改全局配置。真实引擎结果只代表本次网络和查询，不保证长期可用；复杂动态页面/登录态、不同代理拓扑和签名公证发行未验收。

以上为实现阶段证据；用户随后追加发布授权，版本与公开产物验证另记于发布手册，官网部署独立验收。
