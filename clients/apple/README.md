# Apple Chat v4（未发布）

当前 iOS/macOS 源码统一位于本目录，使用 FnChatCore、FnChatUI 和 SessionRootView。公开 iPhone 内测仍是 0.3.0（4）/ Chat v3；工程版本号暂不修改，本地构建不等同该公开内测产物。

新的 `fn-chat-<environment>-v4` private zone、`chat-v4` 本地空间只消费当前协议，不读取、迁移或删除 v1/v2/v3 数据。手机不加载 React 插件；它消费 fn-chat-cloudkit 的命令和展示协议，卡片由 fn-chat-cards 提供。

保留多会话、同连接内切换已添加模型、停止、审批、卡片、Markdown、归档、已读、持久 outbox、去重、离线补齐、账号隔离和通知定位。手机只展示桌面已添加且当前连接可用的模型；离线命令回到宿主后再次校验。Session 是唯一 Agent 历史，流式模型内部对象和凭证不经 CloudKit 传输。进程崩溃后未确认副作用显示中断，不自动重放。

## 本地验证

从 fn 根目录执行：

```sh
bun plugins/chat-cloudkit/generate-schema.ts --check
swift test --package-path clients/apple/FnChatCore
swift test --package-path clients/apple/FnChatUI
xcodegen generate --spec clients/apple/project.yml
xcodebuild -project clients/apple/FnChat.xcodeproj -scheme FnPhone -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath .fia/plugins-v1-phone CODE_SIGNING_ALLOWED=NO build
python3 clients/apple/verify-build.py .fia/plugins-v1-phone/Build/Products/Debug-iphonesimulator/FnPhone.app
```

协议源为 `plugins/chat-cloudkit/src/protocol.ts`，Swift JSON schema 资源由生成脚本同步。Core 测试包含模型过滤、卡片回复、持久命令和账号隔离；UI 测试覆盖手机/桌面宽度的卡片和 Markdown。模拟器编译或本地测试不能证明真实 iCloud、APNs、OAuth 或跨设备链路。

## 开发签名

将 Config/Local.xcconfig.example 复制为忽略的 Local.xcconfig 并填写 Developer Team。FnPhone / FnChatMac 使用开发容器；FnPhoneTestFlight 使用生产容器。需要开发团队已启用 CloudKit 和推送。

宿主签名辅助目标 FnMacHostSigning / FnMacBetaSigning 也在本工程；它们只用于生成与 FIA 宿主身份匹配的 profile，不含旧探针实现。将展开后的 entitlements/profile 保存到 .fia/cloudkit-signing，通过 FN_CLOUDKIT_DEVELOPMENT_IDENTITY/ENTITLEMENTS/PROFILE 提供给 FIA。旧顶层 ios 探针已删除，历史可查 Git。

## 云端与发布

fn-chat-cloudkit 在 plugins-v1 下独立保存配置及账号队列。首次连接根据宿主模式选择容器；已存在的当前配置保留。回复和卡片创建可触发可见通知，zone 通知用于补拉；通知不作为执行确认。启动、前台、网络恢复和定期补拉提供持久恢复。

本轮未部署 CloudKit schema、订阅或手机。真实设备、推送定位、第二账号和 token 刷新仍需单独验收。后续发布先按 [TestFlight 流程](TESTFLIGHT.md) 验证固定产物，再取得并执行发布授权。
