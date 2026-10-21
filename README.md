# fn

fn 是基于 FIA 的本地插件应用平台。Bun 直接执行 TypeScript 后端，原版 dsh / Cordis 提供 Agent、模型适配、工具和 Session；FIA 负责原生窗口、系统交互和进程生命周期。

本次发行候选为 **fn 0.5.0 / build 10、SDK 0.4.0、iPhone 内测 0.3.0（4）**。实际公开状态分别见[应用发行](docs/github-release.md)、[SDK 发行](docs/npm-release.md)和[TestFlight](clients/apple/TESTFLIGHT.md)。统一[下载入口](https://semicoder.dev/fn/docs/installation)。

## 使用

- 从应用中心自主安装译文、随手记或网络搜索；宿主不内置插件。新市场 `marketplace-cordis.json` 与旧市场独立。
- 在设置中创建模型连接，同一 provider 可添加多个账号。支持 API Key、Pi 订阅登录与自定义端点；添加模型后在应用或 Chat 中选择。
- Agent 在后台运行，关闭页面不取消任务。写入、进程及外部副作用默认需要批准，应用可以显式选择自动执行。
- Chat v3 使用同一 iCloud 账号连接桌面与手机，支持多会话、离线重试、已读、审批及应用自定义卡片。手机只展示桌面已添加且仍可用的模型。
- 支持紧凑侧栏、主题、SVG 图标、页面 keepAlive、插件启停/卸载/更新和 FIA 应用更新。插件更新等待任务空闲后重启后台，窗口自动重连。

升级必须使用完整 DMG。旧 SDK、插件、Chat v2 和数据均不兼容；重新配置连接与应用。新数据写入各模式数据目录的 `Backend/cordis-v1/`，不读取、迁移或删除旧数据。插件为可信本地代码，Cordis 作用域不是安全沙箱。

## 开发

macOS 14+ / Apple Silicon，Bun 1.4.3、Swift 6 / Xcode：

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
```

FIA 活跃源码在 `framework/fia/`，自动从本提交构建。fn 后台变化准备新运行目录，等待任务空闲后重启；前端使用 HMR。开发、预览、正式数据互相隔离。开发依赖变动与原生框架变动可能需要完整重启。

```sh
bun run agent application create /tmp/my-app
bun run agent open --browser
bun run check
bun run test
bun run build
bun run npm:pack
bun run framework:verify
```

应用是普通 npm 包：`exports["."]` 为 Cordis 后端，`exports["./client"]` 为可选预构建前端；React、Cordis 和 SDK 由宿主共享。使用 `application check/build/pack` 验证独立应用。旧 `plugin` CLI 与 SDK 接口不适用于此版本。

[架构与开发流程](docs/cordis-runtime.md) · [SDK](packages/sdk/README.md) · [验收证据](docs/runtime-validation.md) · [核心能力核对](docs/core-capability-audit.md)

模型内核锁定 dsh 0.2.1-rc.2、Cordis 4.0.5，实际闭包见 `upstream.lock.json`；模型请求使用锁定 Pi 适配器。网页工具精确依赖公开 agent-webtool 0.8.2。模型凭证按连接独立存储在权限受限文件，不通过业务 API 返回前端。

## 发布

日常改动集中记录在[待发布清单](release/notes/unreleased.md)，只有明确发布时升版。应用、SDK、官方插件、手机与官网分别验收；FIA 独立 npm 在共仓期间暂停。发布需完成签名公证、运行目录、CloudKit 和客户端验收，不能仅凭版本字符串认定已发布。
