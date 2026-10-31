# Chat 实验组合（2026-10-31）

用户确认聊天用途尚未设计完成，本阶段首版暂不发行。源码保留，默认以应用中心为首页，空市场沿用添加市场源或从地址安装的引导。

- 默认：`bun run dev`、`bun run run`、`bun run build` 与 `bun run release`。
- 实验开发：先结束当前 Dev，再执行 `bun run dev --experimental-chat`。使用同一 Dev 数据目录，已有聊天与应用数据保留；切回普通 `bun run dev` 撤下聊天组合。
- 独立实验归档：`bun run runtime:seed .fia/chat-experimental-seed --experimental-chat`。普通构建始终重新生成默认归档；`--distribution` 与实验选项不能组合。

默认 profile 为 kernel＋desktop；实验 profile 在其后叠加 Chat bundle。六个聊天专属包不复制进默认 seed、不出现在共享核心、工作区及锁文件中；通用 Agent、Session、连接、模型、文件/进程/原生工具与 renderer 必需的 ui-session scope 保留。依赖检测阻止默认包间接引入聊天专属包。

已有安装切换 seed 时，移除新核心不再提供的插件条目，添加新核心包默认条目；其他用户组合配置和已安装插件保留。该过程不删除聊天 SQLite、模型凭证、应用数据或旧回退代。旧回退代可能仍含聊天源码，不属于新发行归档。

## 验证结果

- `bun run check` 通过：框架 90 项 JS / 48 项 Swift 测试及应用 TypeScript 检查；本机地址通过 NO_PROXY 绕过开发代理。最初沙箱内端口监听失败、随后代理影响本机请求，修正执行环境后完整通过，无代码绕过。
- `bun run test`：115 项、858 断言通过，覆盖默认/实验真实服务注册、退出撤销、组合裁剪、用户配置保留及原有 Chat 测试。新增发行检查脚本后的最终 `fia check` 与 `styles:check` 通过。
- `bun run build` 通过。最终默认 seed `6060d62b0c5729f8af344062` 共 290 包；实验 seed `9a9b795f825eb0fbe0ad7504` 共 296 包。默认归档不含六个聊天专属包及其工作区、锁文件登记；`check-default-seed.ts` 校验实际归档，代码更新复用同一签名归档，不重新签名改变字节。
- 实际归档在独立临时目录完成实验 → 默认 → 实验切换，额外安装的纯服务插件仍激活，模型连接、持久会话及恢复加载通过；未调用真实模型。实验＋发行参数的拒绝检查通过。
- 打包应用以专用隔离数据/控制目录启动并正常 ready，无 pending/error；默认命名空间不含 chat/cards/cloudkit。Chromium 1200px 浅色、560px 深色无横向溢出，应用中心空态、设置分类、安装弹窗与 Escape 焦点恢复通过。最终模型页使用“为插件配置可用的模型”文案。
- 官网 34 篇内容生成/校验、文档检查、生产构建及 40 个静态页面检查通过。安装入口保持公开版本；候选市场仍提示现有生产源为旧协议，正式新市场待单独发行。

本轮没有改动 FIA 源码或独立插件 API；已安装测试插件实测通过，现有看板/模型目录的页面与存储契约不变。未验证真实 OAuth、真实模型、CloudKit/手机或正式签名公证；后两者不属于本次无聊天交付。未替换 `/Applications` 中用户应用，未升版、提交、合并、推送、发布或部署。
