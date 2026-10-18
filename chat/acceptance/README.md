# 聊天验收插件

仅本地开发，不随宿主内置，不进入官方市场。当前 SDK 源码新增 `chat`；公开 SDK 0.3.5 不包含该接口。

从 fn 根目录构建并打包：

```sh
bun -e 'import { buildPlugin } from "@semicoder/fn-sdk/build"; await buildPlugin("chat/acceptance")'
bun pm pack --cwd chat/acceptance --destination ../../artifacts
```

在 fn Dev 插件页安装生成的 `fn-chat-acceptance-0.0.0.tgz`，启用后同步。手机或 fn Chat 中进入“聊天验收”：普通文字回声；“批准”展示批准/拒绝；“选择”展示单选、多选；“表单”再加入文字、数字、布尔和可选字段。后端 `onResponse` 从 KV 读取请求检查点、报告进度、发新文字并保存结果。

本地 `notify` 方法用于验证插件主动下发；`cancel` 用于验证取消与回复竞争。这些方法没有被发布为聊天端主动操作。宿主监控页不能填卡片或发文字。真实验收仅使用本插件的测试内容，不调用模型或外部业务。
