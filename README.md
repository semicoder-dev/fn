# fn

fn 是运行在 Bun＋FIA 上的 Cordis 插件平台。当前源码面向 **fn 0.6.0 / build 13** 和 **SDK 0.5.0**，采用全插件化架构。实际公开版本与下载产物以 [正式安装入口](https://semicoder.dev/fn/docs/installation) 和 GitHub Releases 为准；iPhone 内测仍为 0.3.0（4），不与本版桌面提供聊天同步。

默认组合提供紧凑侧栏、模型连接、插件管理、外观和应用更新，启动进入应用中心。聊天用途尚未定稿，Chat 页面、默认助手、卡片和 iCloud 同步暂不纳入本阶段首版发行。Agent、Session、模型适配及工具调度使用锁定的原版 dsh；布局和全部产品页面也是插件。关闭页面或断线不终止后台 Agent。界面统一使用原版 dsh 控件与主题，仅保留浅色、深色和跟随系统，不再提供自定义配色。

聊天源码保留在独立实验组合中，使用 `bun run dev --experimental-chat` 按需启用；普通 `dev/run/build/release` 均使用无聊天的默认组合。默认运行归档不包含六个聊天专属包，Agent、Session、模型与工具底层继续供插件使用。切回普通 `bun run dev` 后会在空闲时撤下聊天组合，已有会话与插件业务数据保留。

## 代码结构

| 目录                      | 职责                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `host/`、`packages/host/` | FIA 启动、配置装配、不可变运行目录、资源传输和故障恢复      |
| `plugins/`                | 按能力拆分的后端和 UI 插件，名称为 `@semicoder/fn-<能力名>` |
| `profiles/`               | 默认 bundle、顺序及上游 patch 配置                          |
| `packages/sdk/`           | Cordis 插件构建、公共契约和泛型客户端；不提供业务聚合服务   |
| `packages/ui/`            | 原版 dsh 控件共享入口、固定主题资源和少量页面组合           |
| `clients/apple/`          | Chat v4 的 SwiftUI 客户端、协议资源与签名辅助               |
| `framework/fia/`          | 通用窗口、原生能力、动态 API、进程和更新框架                |
| `scripts/`、`commands/`   | 构建、验证和开发工具                                        |

## 开发

要求 Apple Silicon macOS 14+、Bun 1.4.3、Swift 6 / Xcode。在本仓库根执行：

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
bun run agent open --browser
bun run agent schema --json
bun run check
bun run test
bun run build
bun run npm:pack
bun run framework:verify
```

插件后端直接执行 ESM TypeScript，前端通过 `exports["./client"]` 提供上游模块工厂。`bun run agent plugin check/build/pack <目录>` 验证、构建、打包；纯服务、纯前端和双端插件均可。插件源码变更通过后台重启加载；安装先准备完整候选目录，空闲后切换。运行阶段关闭自动安装，禁止修改已生效目录。

新源码仅使用 `Backend/plugins-v1/` 与 Chat v4 数据空间，不读取、迁移或删除既有数据。不保留旧 SDK、应用 Bridge、公开 KV、网页抓取或网页搜索接口；fn 不再依赖 agent-webtool。旧三个测试插件从本地市场源码移除，生产市场尚未更改。插件属于可信本地代码，Cordis 不提供安全沙箱。

[架构](docs/cordis-runtime.md) · [插件开发](docs/plugin-development.md) · [SDK](packages/sdk/README.md) · [验收](docs/runtime-validation.md) · [Apple 客户端](clients/apple/README.md) · [待发布清单](release/notes/unreleased.md)。

日常开发不升版、不推送、不发布。发布必须另行授权，并分别验证应用、SDK、市场、手机、CloudKit 和官网；FIA 独立 npm 仍暂停。
