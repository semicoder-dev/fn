# fn Chat 开发指南

当前开发入口已切换为未发布的 Session Chat v3：iOS/macOS 均使用 `SessionRootView`，独立 `fn-chat-<environment>-v3` zone 和 `chat-v3` 本地目录。v2 文件保留供历史构建参考，当前入口不消费 v2 数据。下方 v2/TestFlight 说明是已发布历史，不能作为当前开发版的协议说明。

v3 通过应用 Chat endpoint 创建多会话，每个会话固定一个模型连接，可在同连接内换模型；支持消息、停止、归档/恢复及工具批准一次/拒绝。宿主复用 dsh Agent loop，但 CloudKit 和客户端只传输 fn 展示 DTO，不包含 dsh 事件、provider replay 或凭证。仅当前 iCloud 账号创建并绑定的会话会同步；普通桌面会话不会自动上传。命令持久去重，宿主重启时未确认完成的操作标记中断，不自动重放；客户端离线命令保留到联网重试。

v3 增加跨设备已读游标和未读计数；只标记当前前台会话中已收到的内容，离线已读命令持久重试，宿主单调合并并限制在持久历史范围。v3 自定义卡片采用新的 Session 接口（不消费旧卡片协议），支持确认、选择、表单及五类输入，离线回复、并发去重、过期与处理状态。手机只展示宿主已添加且仍可用的模型，空连接隐藏；离线新建/切换时宿主再次校验。当前不包含附件和逐字流式输出。UI 显示已落盘的完整助手消息与工具结果，旧业务数据不迁移。新 CloudKit 类型和生产 schema 尚未部署，真实 iCloud/APNs、iPhone 与多设备链路尚待验证；本次没有发版或 TestFlight 上传。

```sh
bun backend/chat-next/generate-schema.ts --check
bun test backend/chat-next/chat.test.ts packages/runtime/tests/cards.test.ts packages/runtime/tests/chat-integration.test.ts
swift test --package-path clients/apple/FnChatCore
swift build --package-path clients/apple/FnChatUI
```

v3 schema 由 `backend/chat-next/protocol.ts` 生成到 `SessionContract` 使用的 `Resources/session-contracts.json`；宿主装配 `SessionChatService`，继续使用 FIA CloudKit transport。当前 BFF 把 `context.app.dataDirectory/cordis-v1` 传给服务，配置文件位于其中的 `communication-config.json`；新的 carrier SQLite 保存在同目录的 `chat-v3/<account hash>/chat.sqlite`。可见推送订阅 `FnSessionReply` 和 `FnSessionCard` 的创建；卡片回复/状态变化仅触发 zone 补拉，工具、用户消息和状态更新不产生可见推送。卡片通知定位到所属 Session。

宿主首次点击“连接 iCloud”时，会在新目录写入默认配置：production 使用 `iCloud.com.semicoder.fn.production`，development/preview 使用 `iCloud.com.semicoder.fn.development`，名称默认为系统 hostname。无需手写配置，也不读取旧目录配置。若新目录已有手动 `communication-config.json`，服务保留并使用它；container 后缀必须匹配当前环境。缺少当前环境的 CloudKit 签名、entitlement 或 iCloud 登录仍会明确报告连接错误，写入默认配置不代表原生或远端授权已经完成。

`backend/chat-next/cloudkit-schema.ckdb` 是 v3 新类型参考，只用于新的 private zone；此次仅生成本地文件，没有部署生产 schema。首次开发同步尚未产生回复类型时，客户端继续同步目录和命令，稍后重试可见通知订阅。

## v2 发行历史

iOS 17+ 和 macOS 14+ 的原生聊天客户端，使用同一套 `FnChatCore` / `FnChatUI`。聊天 v2 起始于 `codex/ios-communication`，Markdown 更新位于 `codex/chat-markdown`；公开 fn 0.4.5、SDK 0.3.5 和历史 TestFlight 0.1.0 (1) 均不含聊天 v2。用户追加授权的 iOS 0.2.0（2）内部测试状态见 [TestFlight](TESTFLIGHT.md)，Mac/SDK 公开版本未变化，不可用相同版本字符串判断源码内容。

## 工程

- `FnChatCore`：v2 契约、SQLite、持久 outbox、CloudKit 条件写入、游标与账号隔离。
- `FnChatUI`：服务端选择、机器人列表、文字会话、原生请求卡片、已读/归档与通知定位。
- `iOS` / `macOS`：启动、窗口、APNs、前台/唤醒适配；Mac 独立应用名称 fn Chat，开发显示 fn Chat Dev。
- `../../chat/fixtures/v2.json`：TypeScript/Swift 共用样例。`../../chat/generate-contracts.ts` 从 SDK 的 Zod 契约生成 Swift 校验资源；语义校验两端仍独立测试。
- `../../ios`：历史 CloudKit 探针和宿主签名辅助工程，不再包含聊天业务实现。

聊天设备仅登记 `FnChatClient`，fn 插件宿主登记 `FnChatHost`。同一系统 iCloud 账号下，服务端选择是本设备偏好，所有服务器仍后台同步；聊天历史、已读和归档在聊天设备间共享。每个宿主＋插件只有一个固定会话。失效插件保留目录/历史并禁用输入。没有附件、历史删除、会话分支或逐字流式输出。

## Markdown（2026-10-19，手机内测更新）

两端共用 `FnChatUI/ChatMarkdown.swift`：用户和机器人文字消息、请求卡片的 `text` 块支持标题、粗体/斜体/删除线、嵌套列表/任务列表、引用、链接、行内代码、围栏代码块、表格和分隔线。保留普通消息换行；代码与宽表格横向滚动，代码可复制，消息菜单可复制 Markdown 原文。卡片标题、摘要、字段和操作按钮继续按纯文字展示。

采用原生 SwiftUI [MarkdownUI 2.4.1](https://github.com/gonzalezreal/swift-markdown-ui/releases/tag/2.4.1)，精确版本和 `FnChatUI/Package.resolved` 固定依赖；该库已进入维护模式，本次使用其稳定 GFM 能力。链接仅允许 HTTP(S) 和 mailto，原始 HTML 不执行。独立图片显示“查看图片”链接，行内图片显示占位，不在消息展示时自动下载；不新增附件、公式、Mermaid 或代码语法高亮。

历史仍存原字符串，CloudKit schema、SDK 记录格式和宿主无需更新。既有 TestFlight 0.2.0（2）不含本次改动。手机 0.2.1（3）已完成 Apple 处理并加入既有本人内部测试组，状态“正在测试”，证据见 [TestFlight](TESTFLIGHT.md)；Mac 聊天端仍需本地构建。

```sh
swift test --package-path clients/apple/FnChatUI
```

布局回归覆盖 280/560pt 明暗两种模式、长链接、长代码和未闭合 Markdown。设置 `FN_MARKDOWN_SNAPSHOTS` 为已存在目录可导出 macOS 离屏原生视图截图，无需 iCloud 或模型调用。

## 开发签名与运行

从 fn 仓库根执行；需要 Xcode、XcodeGen 和已启用 CloudKit / Push 的 Apple Developer Team。将 `clients/apple/Config/Local.xcconfig.example` 复制为 `Local.xcconfig`，填写 Team；本地配置、构建与 profile 均忽略。

| 应用 | 开发 Bundle ID | 容器 |
| --- | --- | --- |
| fn 插件宿主 | com.semicoder.fn.dev | iCloud.com.semicoder.fn.development |
| iPhone 聊天端 | com.semicoder.fn.ios.dev | 同上 |
| Mac 聊天端 | com.semicoder.fn.chat.dev | 同上 |

三个 App ID 均须绑定同一开发容器、启用 CloudKit 和推送。Mac 聊天端不复用宿主身份，可同时运行。iOS 新开发包会替换原同标识开发应用，但不会读取、迁移或清理旧业务缓存。iOS 系统账号与 Developer Team 登录是两回事。

```sh
xcodegen generate --spec clients/apple/project.yml
xcodebuild -project clients/apple/FnChat.xcodeproj -scheme FnChatMac -configuration Debug -derivedDataPath .fia/chat-mac-signed -allowProvisioningUpdates build
xcodebuild -project clients/apple/FnChat.xcodeproj -scheme FnPhone -configuration Debug -destination 'generic/platform=iOS' -derivedDataPath .fia/chat-phone-signed -allowProvisioningUpdates build
swift test --package-path clients/apple/FnChatCore
bun chat/generate-contracts.ts --check
python3 clients/apple/verify-build.py .fia/chat-mac-signed/Build/Products/Debug/FnChatMac.app .fia/chat-phone-signed/Build/Products/Debug-iphoneos/FnPhone.app
```

可在 Xcode 选择具体已配对 iPhone 安装；模拟器构建使用 `generic/platform=iOS Simulator`。命令行构建 Swift Package 资源时如提示缺 Team，同时传 `DEVELOPMENT_TEAM='<TEAM_ID>'`。Mac 开发包在 `.fia/chat-mac-signed/Build/Products/Debug/FnChatMac.app`。

宿主继续使用原有 FIA 分模式签名：先以 `ios/project.yml` 的 `FnMacHostSigning` 生成与 `com.semicoder.fn.dev` 匹配的开发 profile，展开 entitlements 保存到 `.fia/cloudkit-signing/`，通过 `FN_CLOUDKIT_DEVELOPMENT_IDENTITY`、`FN_CLOUDKIT_DEVELOPMENT_ENTITLEMENTS`、`FN_CLOUDKIT_DEVELOPMENT_PROFILE` 运行 `bun run dev`。不要将 Xcode 未展开的变量直接当作 entitlements。

在宿主数据目录 `Backend/communication-config.json` 配置：

```json
{"container":"iCloud.com.semicoder.fn.development","name":"我的 Mac"}
```

开发实例默认位于 `.fia/dev/data/com.semicoder.fn/Backend/`。宿主侧栏“机器人通信”只读查看本机会话与处理状态；手机和 fn Chat 才能发文字、填写卡片。设置中允许通知后，所有服务端的机器人来信可提醒。

## 数据与通知

使用独立 `fn-chat-<development|preview|production>-v2` private zone 和 `chat-v2` SQLite 目录。v1 zone / SQLite / tombstone 保留但不消费；升级应用停用自身旧 `fn-messages-<bundleId>` 订阅。不兼容旧 `communication` / `remoteActions`，不迁移旧请求。

`FnChatBotMessage` 的创建订阅提供可见提醒；zone 订阅仅提示补拉，覆盖用户文字、卡片回复、进度、已读与归档。首次历史同步静默；离线补拉汇总。订阅受 Apple 系统投递规则约束，不作为消息日志或执行凭据。启动、联网、前台、唤醒和 Mac 60 秒补拉负责恢复；iOS 不保持后台轮询。点击通知先保存目标，完成同步后切换对应宿主和机器人。

新开发容器第一次创建可见订阅前，需已有 `FnChatBotMessage` 记录类型。可先用验收插件主动发一条文字，再让客户端同步。`chat/cloudkit-schema.ckdb` 是 v2 的新容器 schema 参考；已有容器保留旧类型，仅增加 v2 类型。2026-10-18 用户追加 TestFlight 授权后已部署 v2 生产 schema 并验证生产订阅，具体上传/分发和验收状态见 [TestFlight](TESTFLIGHT.md)。

## 验收

见 [验收插件](../../chat/acceptance/README.md)。先测试回声，再发“批准”“选择”“表单”，填写全部控件，检查进度及独立回复消息。宿主离线时客户端显示“待发送”或“云端已接收”，恢复后仅原宿主处理。两个客户端抢答时只有一个回复有效；失败者显示原因，不能覆盖成功回复。

默认每次处理十分钟，卡片二十四小时；开始过但异常中断的回调不自动重放。插件保存自己的业务检查点，用持久 `onResponse` 继续；取消或超时无法撤回已经发生的外部副作用。

工程与真机验证结果记录于 workspace `docs/agent/sessions/2026-10-18-fn-chat.md`。2026-10-18 用户确认 iPhone 开发环境锁屏通知、退出应用后点击定位的会话和消息均正确。完整四设备、Mac/跨服务端通知、首次历史静默/离线汇总可见性和系统账号切换仍未验证，不能以单机自动化或模拟器替代。
