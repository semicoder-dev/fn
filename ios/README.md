# CloudKit 历史探针与签名辅助

2026-10-18：业务客户端已迁到 [clients/apple](../clients/apple/README.md)，使用共享 FnChatCore / FnChatUI 和协议 v2。本目录只保留 Probe、ProbeCore 与宿主签名辅助 target。下面是 2026-10-16 的历史验收证据，旧 FnPhone / CommunicationCore 构建命令已停用，不能用于验证 v2。

# fn iOS 通信开发

当前已接入开发版 SwiftUI 收件箱、设备/远程操作入口和 SQLite 同步，**尚未完成整体多端验收，不可发布**。应用/SDK 公开发行版本保持不变。用户随后授权 TestFlight 内部测试，进展见 [TestFlight 安装与构建](TESTFLIGHT.md)。

## 工程与边界

- `project.yml`：XcodeGen 工程，iPhone iOS 17+、Mac macOS 14+；使用 Swift 6。
- `App/`：`FnPhone` 原生收件箱、批准/问答、已读/归档/删除、设备和有限操作表单。
- `CommunicationCore/`：协议、SQLite 分账号缓存/outbox、CloudKit 条件回复与删除重试。
- `Probe/`：两端共享 SwiftUI 验证界面，账号检查、发送队列、增量拉取、可见订阅、APNs 回调和发送端本地提醒。
- `ProbeCore/`：仅供原型使用的原子 JSON journal，账号/容器分文件，保留未确认发送和同步游标。正式通信仍按计划使用 SQLite，本原型不替代该实现。
- `../framework/fia/native/CloudKitTransport`：不依赖 AppKit 或 fn 业务的独立 Swift Package；已接入 FIA Host/TypeScript Native SDK。

原型只接受 `*.development` 容器及 `fn-communication-probe-v1` zone。两端 bundle ID 不同：`com.semicoder.fn.cloudkit-probe.dev` 与 `com.semicoder.fn.ios.dev`。仅发送测试内容；不要填写凭证、真实任务或私密资料。

## 本地安装

需要 Xcode、iOS Simulator runtime、XcodeGen，以及有 CloudKit 能力的 Apple Developer Team。系统 iCloud 登录与开发者网站登录相互独立。

1. 将 `Config/Local.xcconfig.example` 复制为 `Config/Local.xcconfig`，填写自己的 `DEVELOPMENT_TEAM`。本地文件已忽略。
2. 在 Developer Portal 创建专用开发容器，将两个明确 App ID 的 iCloud（Include CloudKit support）绑定到同一容器，并启用 Push Notifications。不要复用其他应用的私有数据容器。
3. `Config/Development.xcconfig` 中配置容器。Debug/Release 均为开发验证，Release 不代表生产环境。
4. 在本目录运行 `xcodegen generate --spec project.yml`，用 Xcode 打开生成的 `FnCommunicationProbe.xcodeproj`。
5. 选择 `FnMacProbe` 或 `FnPhoneProbe`，配置开发签名并运行。真机需要开发者模式；模拟器需要在系统设置登录同一 iCloud。
6. 两端点击“连接 iCloud”“允许系统通知”，使用“保存并发送”双向发送测试消息。关闭一端后发送多条，再启动/同步，检查队列、游标与汇总提醒。成功连接后启动/前台恢复会重新连接；账号变更会隔离旧队列并要求手动连接。

命令行示例（从 fn 仓库根运行，team 可来自本地 xcconfig）：

```sh
xcodegen generate --spec ios/project.yml
xcodebuild -project ios/FnCommunicationProbe.xcodeproj -scheme FnMacProbe -configuration Debug -derivedDataPath .fia/mac-probe-signed -allowProvisioningUpdates build
xcodebuild -project ios/FnCommunicationProbe.xcodeproj -scheme FnPhoneProbe -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath .fia/ios-simulator build
swift test --package-path framework/fia/native/CloudKitTransport
swift test --package-path ios/ProbeCore
```

## 验证状态（2026-10-16）

- 已构建：签名 Mac、iPhone device SDK、iPhone 12 / iOS 26.1 真机安装运行、iPhone 17 Pro / iOS 26.5 模拟器。
- 已通过：传输包 5 项测试，journal 4 项测试；Mac 签名严格验证；两端显示 APNs 注册成功。
- 已配置：专用 `iCloud.com.semicoder.fn.development` 容器及两端开发 App ID 绑定。
- 原容器访问错误已不再重现（具体原因未确定）。补齐空开发容器首次写入后再创建订阅的顺序；保留一条明确的初始化验证记录。Mac 与 iPhone 12 的双向记录收发已通过：手机确认收到 Mac 指定测试文本，Mac 实际拉取到 iPhone 回传记录。
- 已验证：用户确认 iPhone 12 锁屏收到安全摘要通知；Mac 系统设置打开原型通知后，通知中心实际显示发送端“本机验证消息已入队”。
- 已验证：Mac 退出期间 iPhone 发送两条消息，Mac 重启自动连接并补拉成功。汇总提醒实际展示尚未确认；应用退出不能替代真实断网测试。
- 已验证：用户完成 iPhone 飞行模式/关闭 Wi-Fi 入队并恢复网络同步，Mac 共享列表出现一条对应消息。
- 未验证：首次历史静默、完整业务多端竞争、两 Mac 两 iPhone。模拟器不能替代真机验收。
- FIA 原生桥与分模式签名配置已实现；签名 FIA Host 真实读写、条件冲突、游标与订阅通过，独立导出消费通过。
- 业务链路已接入：真实 fn Dev 与 `FnPhone` 共用 `fn-communication-development-v1`；用户确认手机收件箱同步成功，Mac 核实手机批准和问答已生效。手机提交回声操作后，仅指定 Mac 执行完成，手机确认收到结果和提醒。已读状态由手机同步至 Mac。
- 桌面新开发身份曾返回 `Invalid bundle ID for container`，绑定和 profile 核对正确，后续已恢复；不将传播延迟写成已确定原因。
- 自动化已覆盖回复竞争、取消、超时/崩溃不重放、操作版本和占用、严格表单及删除恢复；真实删除使用本轮新建的精确测试会话 ID，云端同步完成且队列为空。
- 仍待：完整四设备矩阵、业务版离线/首次静默/汇总可见性及冷启动、离线等通知跳转边界的真机复验；大量历史与并发新增/删除边界仍需专项检查。
- 通知点击修复：真机日志定位系统完成回调线程错误，改为 MainActor 显式完成；用户确认修复后点击系统通知正常打开会话、不再闪退。
- 最终工程复验：fn check/build、142 项应用测试（1280 断言）、SDK 独立打包消费通过；CommunicationCore 7 项测试及最新真机/模拟器构建通过，最终补丁已安装至 iPhone。用户确认暂时没有第二台 Mac/iPhone，四设备矩阵保留未验证。

## 发布前另行验收

生产 Developer ID + CloudKit profile、生产 schema、开发/预览/生产隔离、后台唤醒和系统通知均须独立验收。当前原型不承诺提醒必达、恰好一次执行或正式请求恢复。

## 开发版 fn 与手机收件箱

以下命令从 fn 根目录执行，替换 `<TEAM_ID>` 为自己的开发团队：

```sh
xcodegen generate --spec ios/project.yml
xcodebuild -project ios/FnCommunicationProbe.xcodeproj -scheme FnPhone -configuration Debug -destination 'generic/platform=iOS' -derivedDataPath .fia/phone-app-device -allowProvisioningUpdates DEVELOPMENT_TEAM='<TEAM_ID>' CODE_SIGN_IDENTITY='Apple Development' build
swift test --package-path ios/CommunicationCore
```

`FnPhone` 使用 `com.semicoder.fn.ios.dev`，会替换同标识 Probe；旧 Probe journal 不迁入业务库。`FnMacHostSigning` 仅用于 Xcode 生成 `com.semicoder.fn.dev` 开发 profile，不是桌面 fn，也不要同时运行它和 fn Dev。

桌面需将上述 App ID 绑定开发容器，从 Xcode 的 `FnMacHostSigning` 开发构建取得展开后的 entitlements 和 embedded.provisionprofile，保存于忽略目录 `.fia/cloudkit-signing/`。设置以下三个环境变量后运行 `bun run dev`：

- `FN_CLOUDKIT_DEVELOPMENT_IDENTITY`：Apple Development 签名身份。
- `FN_CLOUDKIT_DEVELOPMENT_ENTITLEMENTS`：展开后的 `.xcent`/entitlements 路径，不能含 Xcode 变量。
- `FN_CLOUDKIT_DEVELOPMENT_PROFILE`：对应 embedded.provisionprofile 路径。

本地开发数据目录 `.fia/dev/data/com.semicoder.fn/Backend/communication-config.json`：

```json
{"container":"iCloud.com.semicoder.fn.development","name":"开发 Mac"}
```

普通未设置上述变量的构建保持原路径，通信未配置不阻塞已有功能。不能用开发签名变量运行 preview/production 构建；这两个模式须显式提供各自配置。业务 zone 使用模式名隔离，生产容器要求 `.production` 后缀。

开发版手机进入设置连接 iCloud 并授权通知。桌面侧栏“收件箱”，设置“设备与同步”。验收插件源码见 `communication/acceptance`，仅本地构建和安装，不进入官方市场。

请求 ID 持久存在不等于插件业务能自动恢复。插件必须持久保存请求 ID 和自己的检查点，订阅后及重连后通过 `get/list` 重读；运行中断的操作不自动重放。取消和超时不会撤销已发生的外部副作用。
