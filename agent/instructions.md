# fn 全插件化候选工作流

本地源码未发布，公开边界仍为 fn 0.5.2。使用 FIA 的实时 `schema --json` 查看当前启用插件的方法。没有固定全业务 RPC 表，不猜测未注册接口。默认从应用中心启动，不加载 Chat 页面、默认聊天 target、卡片或 iCloud 同步；`bun run dev --experimental-chat` 才启用实验组合，暂不发行。通用 Session/模型/工具能力保留；默认没有可直接使用的聊天 target，应先查询实际插件贡献。仅新 `plugins-v1` 数据空间；禁止读取、迁移或删除旧数据。不要输出凭证、验证码或 OAuth 回调秘密。

- `host.status` 查看 epoch/ready/error/命名空间；`host.recover({mode:"previous"|"default"})` 在空闲时恢复组合。布局损坏时仍可用 CLI。
- `plugins.list/status/profile` 查看包、任务与组合；install/update/remove/configure 准备候选，任务空闲后自动重启。通过新 epoch 和持久状态确认完成，不能把“准备成功”当作“已激活”。profile 支持 bundles、plugins、client 和 patches；实例 ID 与包名独立。
- `market.*` 管理 schema 3 市场；当前官方新索引只在本地，生产源未变。不要安装旧应用 SDK 插件。所有插件为可信本地代码。
- `connections.providers/presets/list/create/models/refresh/setKey/rename/remove` 管理独立连接。模型选择始终是 connectionId＋modelId，同 provider 可以多个连接。账号身份/端点变化建立新连接，不自动更换会话计费来源。
- `auth.start/list/reply/cancel/logout` 复用 Pi 交互与凭证刷新；登录必须由用户在官方页面完成。目录可用不代表鉴权通过。
- `models.saved/select` 管理用户添加模型，不发起生成；手机只显示已添加且仍可用的模型。
- `sessions.create` 指定 targetId、connectionId、modelId，可选 cwd/policy。默认 controlled，只有明确授权才选 automatic。`sessions.send` 的 requestId 在重试时保持不变；返回只代表持久接收。使用 projection/list 读取完成状态，cancel 取消实际调用与子进程。
- `sessions.model` 仅空闲时在同连接内切换；archive 保留历史。流式内容临时展示，持久 Session 投影为唯一历史。中断的写入/进程不自动重放。
- `approvals.list/reply` 对具体副作用批准一次或拒绝；不扩大自动执行范围。
- `cards.list/respond` 基于已展示卡片操作，先持久认领再执行，过期、重复、卸载或中断操作不能重复触发。
- 仅实验组合：`chat.endpoints` 提供入口；`cloudkit.status/connect/sync` 为 Chat v4，同账号命令去重和历史补齐。同步成功不代表真机已收到或通知已投递。
- 列表按 nextOffset/hasMore 翻页。事件是实时失效通知，不回放；首次连接和重连重新读取状态和持久投影。页面关闭不停止任务。

开发使用 `plugin check/build/pack`，普通 Cordis apply/inject/Service/Config/effect。后端 TypeScript 直接运行；前端为 `./client` 工厂，通过类型化 Slots 与注入服务协作。没有公开 KV 或网页工具 API。不得启动旁路服务器、原地修改运行目录或引入 Node HMR。

普通实施不授权推送、发布、生产 CloudKit schema 或 TestFlight 上传。候选 SDK 版本字符串尚未调整，不等同公开 npm 产物。
