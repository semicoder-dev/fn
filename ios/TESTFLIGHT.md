# TestFlight v1 历史记录

2026-10-18：下文是旧版 0.1.0 (1) 的上传与签名证据，不是当前操作指南。聊天 v2 改用 `clients/apple/project.yml`，与旧 zone 无兼容/迁移。用户追加授权的新 0.2.0（2）流程与状态见 [v2 TestFlight](../clients/apple/TESTFLIGHT.md)，开发入口见 [fn Chat](../clients/apple/README.md)。旧订阅初始化脚本已随未发布 v1 源码停用。

# fn TestFlight 内部测试

本轮只向账户持有人分发，不公开上架、不推送正式 fn 更新、不发布 SDK。

## 身份与数据

| 用途 | Bundle ID | CloudKit 容器 | 环境 |
| --- | --- | --- | --- |
| 现有 fn Dev / 手机 Dev | com.semicoder.fn.dev / com.semicoder.fn.ios.dev | iCloud.com.semicoder.fn.development | Development |
| Mac Beta / TestFlight 手机 | com.semicoder.fn.beta / com.semicoder.fn.ios | iCloud.com.semicoder.fn.production | Production |

手机商店记录为 **fn Companion**，图标下仍显示 fn。“fn”商店名称已被占用；App Store Connect ID 为 6823626850。首个内部测试版本 0.1.0 (1)，独立于 Mac 0.4.5/build 9 和 SDK 0.3.5。新上传须递增手机 build；内部测试专用包不能直接用于外部测试或公开上架。

两端共用 `fn-communication-production-v1` private zone。开发历史不会自动迁移；fn Beta 数据与正式 fn、fn Dev 分开，正式更新源关闭。测试版的“生产环境”指 CloudKit 服务环境，不代表已公开发行。

## 配置与构建

1. 在 Apple Developer 注册上表身份、绑定专用容器并启用 CloudKit/Push。
2. `xcodegen generate --spec ios/project.yml`，归档 scheme `FnPhoneTestFlight`；配置自己的 Team，Archive 后先运行 `python3 ios/verify-archive.py <archive路径>`，检查实际包内的生产环境、容器、图标和签名字段，再导出 App Store Connect 内部测试包。生产 entitlements 与开发文件分开。
3. 通过 CloudKit Console 验证并导入 `communication/cloudkit-schema.ckdb` 到新容器的 Development，再部署 Production。
4. **订阅类型也需要初始化**：使用开发签名、绑定生产容器的辅助 app 执行 `communication/tools/BootstrapSubscriptions.swift`，随后再次 Deploy Schema。即便界面没有可见差异也需要部署，否则 Production 可能拒绝新订阅。辅助程序只创建 zone/订阅，不写业务消息；不可拿正式 app 在运行时回退到 Development。
5. Mac `FnMacBetaSigning` 辅助 target 先用 Apple Development 归档，再导出 Developer ID，获得 Production entitlements 与 embedded profile；它不是可用的 fn 桌面应用。
6. 构建真实 fn Beta 时设置 `FN_TESTFLIGHT_COMPANION=1`、`FN_SIGNING_IDENTITY`、`FN_BETA_ENTITLEMENTS`、`FN_BETA_PROFILE`，运行 `bun run release`，输出独立 `fn Beta.app`。该命令还要求 `fn-notary` 公证凭据；缺少时公证失败，已生成 app 只能标为本地签名测试包，不能宣称公证完成。

签名/profile/导出配置保存于忽略目录 `.fia/testflight`，不提交密钥。普通 fn 构建路径不变。Beta 生产身份自动配置容器，其他身份不会自动连接生产。

## 测试与当前状态

已完成：生产 schema（七个业务类型）、开发订阅初始化后的第二次部署；Mac Beta 的 Developer ID 真实生产同步成功。Swift 8 项测试、应用 143 项测试/1283 断言、fn check 通过。手机 Archive 和内部测试导出通过；实际归档字段校验通过，本机安装的生产配置手机已由用户确认收到 Mac 验收消息并允许通知。

首个内部测试包于 2026-10-16 21:51 上传成功。Apple 服务恢复后，0.1.0 (1) 已显示“准备测试”并加入“fn 内部测试”，详情确认仅 1 个内部群组、1 名测试员；中文测试说明已保存。自动分发保持关闭。用户已接受邀请并在 TestFlight 看到构建，但安装报“所请求的 App 不可用或者不存在”；实际安装验收未通过。后台群组、邀请和免费 App 协议状态已核实正常，根因待定位。Mac Beta 公证因本机 fn-notary 凭据缺失未完成。

安装后需验证：手机生产同步、双向请求/回复、指定 Mac 执行、锁屏通知及点击详情。开发版已通过的行为不能直接当成 TestFlight 发行包证据。第二台 Mac/iPhone 暂缺，四设备验收仍未验证。
