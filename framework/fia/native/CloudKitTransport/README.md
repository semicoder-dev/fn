# FIACloudKit（开发中）

独立 Swift Package，最低 macOS 14 / iOS 17，Swift 6；只依赖 Foundation 和 CloudKit。已接入本地 FIA Host 与 TypeScript Native SDK；尚未 npm 发行。

`CloudKitTransport` 提供 private database 账号标识、custom zone、读取、同 zone 条件原子提交、增量变更、创建记录的可见订阅及安全游标序列化。调用方负责业务校验、本地事务、账号隔离、重试退避、通知授权/APNs 生命周期和生产配置。

所有入口在 MainActor；调用方提交期间不得修改 CKRecord。`commit` 使用 `ifServerRecordUnchanged`，限制同 zone、非空、最多 200 条且记录 ID 唯一；检查全部单项错误，优先传播并发冲突。服务端 change tag 来自拉取的记录，不能自行伪造。游标须和已落盘变更一起持久化；失效游标由调用方恢复。

`subscribeToCreations` 仅为新记录生成安全的统一提醒，不对状态更新提醒，也不保证每条通知送达。它不替代同步，也不隔离同账号设备的读权限。宿主必须提供有效 CloudKit/APNs entitlements 和 provisioning profile。

运行 `swift test --package-path framework/fia/native/CloudKitTransport`（fn 根目录）。真实网络验证入口见 [`ios/README.md`](../../../../ios/README.md)；单元测试不能证明签名、云端事务或推送工作正常。
