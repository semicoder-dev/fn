# Fn 手机文字中转

手机按桌面设备与应用组织文字对话。执行逻辑在桌面应用；手机负责收发、任务状态与本地记录。首个入口为翻译，笔记与看板不提供手机聊天。

## 构建

需要 Xcode、Swift 6 和 XcodeGen。在 `clients/apple/` 运行 `xcodegen generate`，打开生成的工程，选择 FnPhone scheme。模拟器构建可关闭签名；真机须配置团队、App ID、profile、iCloud 和 Push entitlement。

```sh
swift test --package-path FnChatCore
swift test --package-path FnChatUI
xcodebuild -project FnChat.xcodeproj -scheme FnPhone -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

`project.yml` 为工程定义。技术 Bundle ID 保持小写，显示名称为 Fn / Fn Dev。`cloudkit-schema.ckdb` 描述 FnRelayHost、FnRelayRequest、FnRelayStatus、FnRelayReply；开发与生产分别使用配置的容器和 zone。

## 同步契约

请求先入本地 outbox，使用稳定 UUID、桌面 ID、应用 ID、conversationId、locale 和正文。宿主持久接收去重；应用关闭时等待，显式启动后处理。执行中断后由用户重新发送，不自动重放。

回复由桌面先写 outbox，再同步最终状态和完整正文。长回复完成后按记录拆分；收齐前不显示半条成功回复。无逐 token CloudKit 写入。游标和记录原子保存，重复投递、ack 丢失和账号切换均保持数据边界。

推送只触发补拉，前台定期同步；离线保持队列。不同 iCloud 账号或容器的数据分别保存。手机与桌面需使用同一账号、同一环境。

## 真机验收

开发签名构建已在 iPhone 17 Pro Max 与隔离桌面宿主完成真实文字收发、桌面离线等待、关闭应用不唤醒、启动后处理、最小化继续、中断后手动重试、重复投递去重和跨重启回复补送。1,421 字符完整译文与桌面逐字一致，两端待发送队列均已清空。具体方法、故障注入范围和证据见 [本地验收](../../docs/ui-validation.md)。

超出单记录大小的真实分片传输、后台静默推送、锁屏通知及点击恢复仍待验证。生产 schema 部署与 TestFlight 另行授权执行，不能用开发容器或模拟测试替代生产验收。
