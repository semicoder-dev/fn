# fn Chat TestFlight

## 2026-10-21 Chat v3：0.3.0（4）

用户明确将新版手机内测纳入本次主干发布。构建 **0.3.0（4）** 于 2026-10-21 09:09（北京时间）上传成功，Apple 已处理完成并加入原“fn 内部测试”组（1 名测试员），中文测试说明已保存。构建 ID 为 `1f885f57-275a-4ab4-9066-c6e136c7c78c`。配套桌面需要 fn 0.5.0；旧 Chat v2 数据保留，新客户端只使用 `fn-chat-production-v3`。

实际 IPA 为 1,797,847 字节，SHA-256 `6d33a6c5ca81bd2495906d6ef60d84b510b88f9cbbb0f5a8120d910a4f67539d`；生产 CloudKit、推送、禁用调试、签名、版本及 `session-contracts.json`（含 `FnSessionCard`）验证通过。此哈希不代表 Apple 重签后的分发包。源代码为 fn `f67b51d` 的手机文件；辅助源码和签名材料分别位于 `tools/BootstrapSessionSubscriptions.swift` 与忽略目录 `.fia/testflight/chat-v3-0.3.0-4/`。

目标容器 `iCloud.com.semicoder.fn.production` 的原 18 个类型逐字节保留，新增 9 个 `FnSession*` 类型；Apple Validation Passed 与 Changes Deployed 均已确认。Development 与 Production 均已实际创建 v3 zone、宿主/手机静默订阅、回复/卡片提醒订阅。正式桌面 App ID 为 `com.semicoder.fn`，独立 profile 与 CI release secrets 已配置；不再要求用户运行 Beta 身份宿主。

本地 FnChatCore、FnChatUI、两种宽度/主题卡片测试及签名归档验证通过。TestFlight 真机安装、新卡片跨设备交互、锁屏通知点击仍需用户手机实测，不能由上传或生产订阅成功代替。

下方为旧版本历史证据，不代表新客户端使用 v2。

## 2026-10-19 Markdown 更新：0.2.1（3）

用户明确要求发布新的 TestFlight。`FnPhoneTestFlight` 独立升级至 **0.2.1（3）**，沿用 `com.semicoder.fn.ios`、生产 CloudKit 容器和原本人内部组。仅客户端增加 Markdown；生产 schema、SDK、Mac 宿主和历史存储不变。生产签名归档、导出 IPA 验证通过；2026-10-19 22:24:45 上传成功，Apple 已完成处理，已加入原“fn 内部测试”组（1 个内部组、1 名测试员），最终状态“正在测试”。中文 Markdown 测试说明已保存。构建 ID `ce11fa13-3ce2-4289-b05c-913e72fcd3c8`；用户于 2026-10-19 确认收到 Apple 解决问题的邮件后，现已能正常通过 TestFlight 安装；手机 Markdown 交互与生产业务/通知仍待实测。

源码为 `codex/chat-markdown` / `8c44331` 加工作树；源码快照、哈希、归档、IPA、日志与中文测试说明保存在忽略目录 `.fia/testflight/chat-markdown-0.2.1-3/`。本次未推送源码或部署官网。 IPA 为 1,483,407 字节，SHA-256 `0b0f285b5d46580e527bada6a605ef70219aa4583014929943049e6a7f5bd9b8`（不是 Apple 重签后分发包哈希）；实际生产推送/CloudKit、禁止调试、签名、协议资源及 Markdown 二进制链接均验证通过。

## 上次内测：0.2.0（2）

上一内部测试版本：**0.2.0（2）**，`FnPhoneTestFlight` target，`com.semicoder.fn.ios`。App Store Connect 记录仍为 **fn Companion**（Apple ID `6823626850`）。用户于 2026-10-18 追加授权发布新版 TestFlight，包含所需的 v2 生产 schema 和本机配套宿主；仅原“fn 内部测试”本人群组，自动分发关闭，不公开上架。

本次上传于 2026-10-18 12:39 成功，Apple 已处理完成并显示“准备测试”，随后加入“fn 内部测试”（1 个内部组、1 名测试员），中文测试说明已保存。构建 ID `06dbebb9-52f0-4207-be8b-5e63b9784dc5`；用户随后确认仍提示 App 不可用或无法安装，生产手机验收被安装问题阻塞。证据见 workspace `docs/agent/sessions/2026-10-18-fn-chat-testflight.md`。

## 身份与版本

- iPhone TestFlight：`com.semicoder.fn.ios`，iOS 17+，0.2.1（3），生产容器 `iCloud.com.semicoder.fn.production`。
- 本机配套宿主：`com.semicoder.fn.beta`，独立 fn Beta、数据目录和 CLI；使用同一生产容器，正式更新源关闭。Mac 应用和 SDK 发行版本不随手机升版。
- 开发手机、Mac 聊天端和 fn Dev 继续使用开发容器，不能从 TestFlight 看见开发历史。独立 Mac 聊天端仍为本地开发构建，本次没有 Mac 聊天端的 TestFlight 分发。
- 新版只使用 `fn-chat-production-v2` private zone。旧 v1 zone、类型和数据保留，不兼容、不迁移、不处理旧请求；旧 0.1.0（1）的发行证据见 [历史记录](../../ios/TESTFLIGHT.md)。

## 构建与核验

下方保留 0.2.0（2）的构建示例；后续版本须使用新的归档路径，不覆盖历史产物。从 fn 根目录执行，使用已配置的 Team 和 App Store Connect 登录。签名/profile/导出选项保存在忽略目录 `.fia/testflight/`，不提交凭据。

```sh
xcodegen generate --spec clients/apple/project.yml
xcodebuild -project clients/apple/FnChat.xcodeproj -scheme FnPhoneTestFlight \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath .fia/testflight/chat-v2-0.2.0-2/fn-chat.xcarchive \
  -allowProvisioningUpdates DEVELOPMENT_TEAM='<TEAM_ID>' archive
python3 ios/verify-archive.py .fia/testflight/chat-v2-0.2.0-2/fn-chat.xcarchive
python3 clients/apple/verify-build.py .fia/testflight/chat-v2-0.2.0-2/fn-chat.xcarchive/Products/Applications/FnPhoneTestFlight.app
```

先用 `destination=export` 导出 IPA，核对真实版本/build、容器、环境和共享契约资源，再使用 `destination=upload` 的 ExportOptions 上传。两份选项均为 `method=app-store-connect`、`testFlightInternalTestingOnly=true`、`manageAppVersionAndBuildNumber=false`、`iCloudContainerEnvironment=Production`。已上传的版本/build 不覆盖；重试处理状态查询不重新上传或升号。

0.2.0（2）本地导出 IPA：595,020 字节，SHA-256 `da123d870fffc1e88ac90eb4785a5d9f99c0118ac4394d62c6d23ac9c6429fc1`。上传归档对应同一源码工作树，未提交/推送源码；本地 IPA 哈希不是 Apple 重签后的分发 IPA 哈希。

## CloudKit 与配套宿主

先导出目标生产容器的 Development schema，保留原定义，再合入 `chat/cloudkit-schema.ckdb` 的新 `FnChat*` 类型。2026-10-18 实际校验原 8 个定义逐字节不变、仅新增 10 个类型，CloudKit 验证和 Production 部署成功。不能把仅含 v2 的参考文件直接覆盖一个已有其他类型的容器。

使用 `tools/BootstrapSubscriptions.swift` 构建签名辅助 app：先在该容器 Development 环境初始化 v2 zone、宿主/客户端静默订阅与机器人创建订阅，再 Deploy Schema；部署后使用该容器 Production entitlements 和 Developer ID 签名重验。辅助程序只建 zone/订阅，不写业务记录。环境由实际签名决定，禁止在正式客户端中回退到 Development。此次三种生产订阅创建均已通过。

本机 `fn Beta.app` 已用同一工作树重新构建并通过 Developer ID 严格签名检查。只做本机配套验收，不生成或公开未经公证的 DMG。宿主数据目录的 `Backend/communication-config.json` 指定生产容器和名称 `fn Beta Mac`；新 `chat-acceptance` 插件已安装，生产 v2 同步成功。用户从 TestFlight 安装后进入“fn Beta Mac → 聊天验收”。

## 测试与限制

测试文字回声、批准/选择/表单、共享历史/已读/归档、宿主退出后排队恢复，以及锁屏通知点击定位。开发环境已经完成的验证不等于 TestFlight 分发包验证。四设备矩阵、真实账号切换和大量历史压力仍未验证。

旧 0.1.0（1）曾在 TestFlight 报“所请求的 App 不可用或者不存在”，用户确认新 0.2.0（2）仍提示 App 不可用或无法安装。2026-10-18 复核：二进制已验证、设备要求兼容、组内测试员已接受、免费 App 协议有效，未发现这些前置项异常；根因尚未确定。用户随后授权追加，已通过原 Apple 支持案例 `102998738671` 的电子邮件表单发送新版失败、复现步骤及核验结果，成功页确认收到，等待回复；详情见 workspace 发布记录。上传成功不等于安装成功，生产手机业务/通知未验证。

2026-10-19 后续：用户确认 Apple 已发来解决问题的邮件，现在可以正常通过 TestFlight 安装，安装阻塞已解除。邮件内容未读取，不推断技术根因或支持案例是否正式关闭；Markdown 交互和生产手机业务/通知仍待验收。
