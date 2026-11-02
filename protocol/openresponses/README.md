# OpenResponses 固定协议

`openapi.json` 和 `LICENSE` 从 `source.json` 指定的只读上游提交原样复制。不要格式化快照或用相同日期标签替代 SHA-256；Fn 的通用格式命令有意不包含本目录。

在 Fn 根执行 `bun run protocol:generate` 生成 SDK 类型与校验数据，`bun run protocol:check` 校验来源摘要和生成漂移。显式同步上游时先核对契约、更新快照与 source.json，再生成并补回归。普通安装、构建、检查和 SDK 运行不访问相邻仓库。实现边界与验收见 [模型协议](../../docs/model-protocol.md)。
