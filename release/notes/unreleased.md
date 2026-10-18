# 待发布改动

2026-10-18 追加授权：聊天 v2 的 iOS **0.2.0（2）** 已完成 Apple 处理并加入本人内部 TestFlight 组，v2 生产 schema 和订阅已部署验证；详情见 [TestFlight 记录](../../clients/apple/TESTFLIGHT.md)。下方是先前本地实施边界，手机内测不代表 Mac/SDK 公开发行，相关改动继续留在本清单。

## 多端机器人聊天 v2（2026-10-18，本地未发布）

来源：`codex/ios-communication`，基线 `b915d82` 加当前工作树；保留已有 CloudKit/签名开发改动。应用、SDK、FIA 与手机版本/build 均未改变。普通开发未授权推送、发布、TestFlight 上传或生产 schema 部署。

- fn 宿主作为可切换服务端，每个插件对应固定机器人聊天；多 iOS / Mac 聊天客户端共享历史、卡片结果、已读和归档。宿主保留插件页面，通信页改为只读监控。
- 新增 `clients/apple/FnChatCore` / `FnChatUI`、iOS 启动层及独立 Mac `fn Chat`。聊天端只发文字，机器人下发文字或原生交互卡片。
- v2 独立 zone、SQLite、记录类型和 outbox，停用本应用旧订阅；保留旧数据，不做兼容或迁移，不消费旧请求。
- SDK `chat` 替换未发布的 `communication/remoteActions`；显式持久 `onMessage/onResponse`、会话串行、版本校验、有限超时、异常中断不重放。
- FIA 增加通用 zone 静默订阅和幂等退订。机器人创建记录才触发可见提醒，其余变更仅提示同步。
- 本轮只适配 `chat/acceptance`，官方插件和公开市场保持原状。新增完整协议/卡片 fixtures、持久化/竞争/路由/账号隔离测试。

开发说明：[fn Chat](../../clients/apple/README.md)。工程及真实验收见 workspace `docs/agent/sessions/2026-10-18-fn-chat.md`；未验证项必须在发行前补齐。Semicoder 安装、后端 SDK 与 FIA 分发页面同步未发布边界，未推送部署。

## 此前阶段证据

2026-10-16 的 v1 CloudKit 原型和内部 TestFlight 0.1.0 (1) 属于历史实现，不能证明 v2 已验收。记录保留于 [历史 iOS 说明](../../ios/README.md)、[TestFlight 历史](../../ios/TESTFLIGHT.md)。公开 fn 0.4.5/build 9、SDK 0.3.5 不包含本节聊天能力。
