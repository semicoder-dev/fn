# fn

fn 是运行在 Bun＋FIA 上的 Cordis 插件平台。当前源码正在进行**全插件化重构，尚未发布**。公开版本仍为 fn **0.5.2 / build 12**、SDK **0.4.0**、iPhone 内测 **0.3.0（4）**；本地版本字符串没有递增，不能用于判断候选代码是否已公开。[正式安装入口](https://semicoder.dev/fn/docs/installation)。

默认组合提供紧凑侧栏、模型连接、Chat、卡片、插件管理、外观和应用更新。Agent、Session、模型适配及工具调度使用锁定的原版 dsh；布局和全部产品页面也是插件。关闭页面或断线不终止后台 Agent。

## 代码结构

| 目录                      | 职责                                                        |
| ------------------------- | ----------------------------------------------------------- |
| `host/`、`packages/host/` | FIA 启动、配置装配、不可变运行目录、资源传输和故障恢复      |
| `plugins/`                | 按能力拆分的后端和 UI 插件，名称为 `@semicoder/fn-<能力名>` |
| `profiles/`               | 默认 bundle、顺序及上游 patch 配置                          |
| `packages/sdk/`           | Cordis 插件构建、泛型客户端和基础 UI；不提供业务聚合服务    |
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
