# fn

基于 FIA 的本地插件应用平台。宿主提供模型、存储和统一界面组件，独立插件组合这些能力，拥有自己的应用页面。

当前发行版本为 **0.4.5 / build 9**，内嵌 **SDK 0.3.5 / manifest 0.3**。应用、SDK、官方插件和官网分别验收，实际公开结果见[应用发布记录](docs/github-release.md)和[SDK 发行证据](docs/npm-release.md)。不提供旧名称兼容或数据迁移，不读取或删除旧应用数据。

官网为 [Semicoder · fn](https://semicoder.dev/fn)，统一入口为[下载与安装](https://semicoder.dev/fn/docs/installation)。0.4.5 完整 DMG 已通过签名、公证和独立安装验收；源码开发见下方步骤。

## 开发运行

iOS 与独立 Mac 原生聊天客户端已在特性分支接入：以 fn 宿主为服务端、每个插件为机器人，共享 v2 CloudKit 聊天、请求卡片和已读/归档。尚未发布；开发安装见 [fn Chat 开发指南](clients/apple/README.md)，插件接口见 [SDK 文档](packages/sdk/README.md)。公开 0.4.5 / SDK 0.3.5 不包含这些能力。

支持 macOS 14+ / Apple Silicon。源码开发需要 Bun 1.4.3 和 Swift 6 工具链（Xcode / Command Line Tools）。进入本仓库根目录：

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
```

FIA 活跃源码在 `framework/fia/`，与 fn 共用 workspace 和根锁文件。首次运行自动准备原生运行时和 CLI；框架 TypeScript 或 Swift/C 修改后自动重建并重启应用，前端保持 HMR。重启会清除未保存页面状态，使浏览器授权失效。依赖或工具链改变时按提示重新安装或重启。fn 稳定后再独立拆出 FIA，详见[共仓开发](docs/fia-integration.md)。

| 模式 | 应用 / CLI | Bundle ID | 默认数据目录 |
| --- | --- | --- | --- |
| 开发 | `fn Dev` / `fn-dev` | `com.semicoder.fn.dev` | `.fia/dev/data/com.semicoder.fn` |
| 预览 | `fn Preview` / `fn-preview` | `com.semicoder.fn.preview` | `.fia/preview/data/com.semicoder.fn` |
| 正式身份构建 | `fn.app` / `fn` | `com.semicoder.fn` | 用户 Application Support 下的 `com.semicoder.fn` |

`bun run run` 启动隔离预览；`bun run build` 生成 `dist/fn.app`，直接打开它会使用 fn 正式数据目录。开发和预览禁用正式更新源，分别带 DEV / PREV 标记。三种模式互相隔离，均不复用旧应用身份。

```sh
bun run run
bun run agent --preview quit
bun run build
```

框架专用入口为 `framework:prepare`、`framework:check`、`framework:pack`、`framework:verify`。构建来源、工具链及产物哈希见 `framework/fia/.fia/framework-build/report.json`。不需要相邻 FIA checkout，公开 FIA 0.18.0 与当前源码产物不能仅按版本号互换。

## 使用与能力

1. 在应用中心从官方市场自主安装译文或随手记；也可从独立 `fn-plugins` 仓库构建后，通过“从地址安装”选择本地 `.tgz`。市场只上架已验收的公开归档，宿主不内置插件。
2. 在「设置 → 模型服务」配置 API Key / Token、自定义 OpenAI-compatible 服务，或通过 Continue with ChatGPT 连接订阅账号并添加模型。
3. 打开译文选择模型、输入文字并生成；随手记使用本地 KV，无需模型。未配置模型时不会生成模拟结果。
4. 在「设置 → 外观」选择浅色、深色、跟随系统，以及默认、GitHub 或自定义配色；公共 UI 与插件继承主题。

支持插件启停、卸载、手动更新、取消模型生成和读取运行历史；卸载 fn 插件保留其 KV 和历史。插件可显式声明 `keepAlive` 保留当前窗口内切页状态，不跨重启恢复未保存草稿。公开版尚无工具注册和预设 agent loop；开发分支新增宿主 Agent 会话与多步工具循环，见 [Agent 文档](docs/agents.md)。其他订阅服务和插件自动升级尚未实现。

插件按可信本地代码执行，不构成安全沙箱。宿主模型能力使用 `@earendil-works/pi-ai@1.0.2` 的目录及适配器；账号目录与真实联网模型可用性需分别验证。凭证不通过业务 API 返回前端，ChatGPT 账号及 token 明文保存在数据目录的 `chatgpt-auth.json`，普通 API Key 与设置保存在 `platform.json`；目录权限 0700，文件权限 0600。凭证文件损坏时保留原文件并禁用相关登录能力。

标题栏由 FIA 提供置顶与浏览器按钮，浏览器共享同一实例的后端和持久数据。重启或断开浏览器连接后需要重新授权：

```sh
bun run agent open --browser
bun run agent --preview open --browser --url
```

## SDK 与独立插件

包名为 `@semicoder/fn-sdk`，清单字段为 `fn`，样式例外字段为 `fnStyleExceptions`。仅接受 fn 契约，没有旧字段或包名别名。完整能力见 [SDK](packages/sdk/README.md)、[开发 CLI](docs/plugin-development.md)和[市场契约](docs/plugin-marketplace.md)。

运行开发宿主后创建独立项目：

```sh
bun run agent plugin create /tmp/my-notes --template notes
cd /tmp/my-notes
bun install --ignore-scripts
bun run check
bun run build
bun run pack
```

另有 `--template model`。生成项目携带 `vendor/fn-sdk.tgz`，可脱离 workspace 开发。显式安装本地 CLI 后，开发版用 `fn-dev plugin …`，预览版用 `fn-preview plugin …`，正式版用 `fn plugin …`。官方插件独立维护，宿主构建不读取其源码或产物。

## 自动化与验证

开发中复用 FIA 命令，不启动额外服务：

```sh
bun run agent call models.list --json '{}'
bun run agent call plugins.list --json '{}'
bun run agent call plugins.install --json '{"source":"/absolute/path/plugin.tgz"}'
bun run agent call plugins.jobs --json '{}'
bun run agent call plugins.invoke --json '{"pluginId":"translate","method":"translate","input":{"text":"Hello","target":"简体中文","modelId":"从 models.list 取得的模型 id"}}'
bun run agent call runs.list --json '{"pluginId":"translate"}'
```

安装和生成返回任务 ID，需查询终态；动态插件方法通过 `plugins.list.methods` 发现。检查和实际 SDK 归档独立消费：

```sh
bun run check
bun run test
bun run build
bun run npm:check
bun run npm:pack
```

同一开发实例的 `/tests/keep-alive.html`、`/tests/chatgpt-login.html`、`/tests/plugin-marketplace.html` 提供离线 UI 回归；生产构建不包含测试页面。官方插件仓库另有翻译模型 UI fixtures。离线验证不代表真实账号、模型或远端发行验收。

## 发布

日常不升版本或 build，改动归集到[待发布清单](release/notes/unreleased.md)。仅明确要求发布时准备新版本，应用 `v*`、SDK `sdk-v*`、官方插件和官网分别验收；不复用历史标签。

网络工具接口已随 SDK 0.3.5 / 应用 0.4.5 发布，精确依赖 agent-webtool 0.8.1。官方插件保持 0.1.2，无需重建；从 0.4.4 升级需要完整 DMG，保留现有 fn 数据。官网按同批产物同步，部署独立验收。新应用身份需要独立更新站状态，不读取旧身份清单。完整流程见[应用发布说明](docs/github-release.md)和[SDK 发布说明](docs/npm-release.md)。FIA 独立 npm 在共仓期间继续暂停。

## 插件网络工具

fn 0.4.5 / SDK 0.3.5 增加插件前后端 `web.search/fetch` 与宿主后台任务 API，详见 [SDK 网络工具](packages/sdk/README.md#网络工具sdk-035--fn-045)。每次调用独立来源编号，支持取消，不保存网络历史；已有插件接口保持兼容。

宿主后端精确消费 `agent-webtool@0.8.1`，依赖由 npm 和锁文件固定，安装和构建不读取相邻项目；前端 SDK 不携带网页抓取依赖。实现及验证见[网络工具说明](docs/web-tools.md)，发行状态见上述发布记录。
