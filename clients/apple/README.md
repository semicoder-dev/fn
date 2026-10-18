# fn Chat 开发指南

iOS 17+ 和 macOS 14+ 的原生聊天客户端，使用同一套 `FnChatCore` / `FnChatUI`。源码位于 `codex/ios-communication`；公开 fn 0.4.5、SDK 0.3.5 和历史 TestFlight 0.1.0 (1) 均不含聊天 v2。用户追加授权的 iOS 0.2.0（2）内部测试状态见 [TestFlight](TESTFLIGHT.md)，Mac/SDK 公开版本未变化，不可用相同版本字符串判断源码内容。

## 工程

- `FnChatCore`：v2 契约、SQLite、持久 outbox、CloudKit 条件写入、游标与账号隔离。
- `FnChatUI`：服务端选择、机器人列表、文字会话、原生请求卡片、已读/归档与通知定位。
- `iOS` / `macOS`：启动、窗口、APNs、前台/唤醒适配；Mac 独立应用名称 fn Chat，开发显示 fn Chat Dev。
- `../../chat/fixtures/v2.json`：TypeScript/Swift 共用样例。`../../chat/generate-contracts.ts` 从 SDK 的 Zod 契约生成 Swift 校验资源；语义校验两端仍独立测试。
- `../../ios`：历史 CloudKit 探针和宿主签名辅助工程，不再包含聊天业务实现。

聊天设备仅登记 `FnChatClient`，fn 插件宿主登记 `FnChatHost`。同一系统 iCloud 账号下，服务端选择是本设备偏好，所有服务器仍后台同步；聊天历史、已读和归档在聊天设备间共享。每个宿主＋插件只有一个固定会话。失效插件保留目录/历史并禁用输入。没有附件、历史删除、会话分支或逐字流式输出。

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
