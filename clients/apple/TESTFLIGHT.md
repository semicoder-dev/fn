# TestFlight 发布边界

当前公开内测为 iPhone **0.3.0（4）/ Chat v3**。此次 Chat v4 全插件化修改未升版、未签名归档、未上传或分发；不得用相同版本号声称线上具备新协议。此前发布证据保留于 Git 历史及 workspace 发行记录。

后续明确授权发布时：

1. 固定 fn、SDK 和客户端组合，完成真实设备卡片/审批/模型筛选/离线重试/去重/通知定位。
2. 对照 `plugins/chat-cloudkit/cloudkit-schema.ckdb` 检查生产类型和权限，在全新 v4 zone 验证。部署与订阅单独记录，不修改旧数据。
3. 统一确定手机版本与 build，构建 FnPhoneTestFlight 的 Release archive；身份为 com.semicoder.fn.ios，生产容器 iCloud.com.semicoder.fn.production。
4. 运行 `python3 clients/apple/verify-archive.py <archive>` 与 verify-build.py，核对实际签名、entitlements 和协议资源。
5. 获得上传/分发授权后使用既有 App Store Connect 内部测试组，记录处理结果、安装和真机验收。

当前允许的本地编译命令见 README。没有授权时不请求 provisioning 更新、不部署生产 schema、不改变 App Store 记录。
