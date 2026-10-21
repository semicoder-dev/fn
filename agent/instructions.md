## fn Cordis 应用工作流（开发分支，未发布）

当前宿主使用 Bun、原版 dsh 和 Cordis。公开 fn 0.4.5 / SDK 0.3.5 不含这些新契约；本地版本号不等于发布证据。先读取 FIA 生成的 API schema，按实际方法调用，不使用旧 plugins/models/runs/agents/chatgpt 接口。

`bun run dev` 使用 fn Dev，`bun run run` 使用 fn Preview；分别通过 `bun run agent` 和 `bun run agent --preview` 操作。生产 `.app` 默认使用生产目录，本地验收使用 Preview。新架构数据全部在各模式数据根下的 `cordis-v1/`，不读取、导入、迁移或删除旧数据。不得输出凭证或登录秘密。

- `models.saved` 分页读取用户添加的模型；`models.select` 添加/移除列表项，不发起生成或删除会话。`connections.providers/presets/refresh` 提供服务商与隔离账号目录；不得将静态目录存在视为账号鉴权成功。
- `market.list/add/change/remove/refresh/catalog/install` 管理 schemaVersion 2 市场；官方新索引尚未发布，不能混用旧市场。`apps.update` 按记录的原来源更新并验证身份；状态由 `runtime.status` 和 `runtime.changed` 读取。应用自身更新走 FIA，Dev/Preview 默认关闭正式更新。
- `runtime.status` 返回 epoch、seedId、busy 和运行目录状态。`runtime.changed` 只用于失效通知，没有事件回放；初次连接和重连都重新读状态与持久投影。页面关闭、客户端断线不终止任务。
- `apps.list` 列出已加载应用、方法名称和 Chat 入口。应用是可信本机代码，具有 Bun 能力；Cordis scope 不是安全沙箱。调用 `apps.invoke({appId,name,args})` 前阅读该应用的接口说明，不猜测未知方法。
- `apps.install({source})` 接受 npm 包、HTTPS 归档或本地 tgz，返回准备状态。安装不立即等于启用：轮询 `runtime.status`，确认新 epoch 和 `apps.list`。候选目录验包后等待空闲，再 flush、销毁和重启 Bun。失败保留可用目录并报告错误。`runtime.applyUpdate` 显式重试待切换目录。
- `apps.enable` 启停 Cordis 应用；停用等待调用完成、取消 Agent 并释放资源。`apps.remove` 准备不含该应用的新运行目录，保留 KV 与历史。全局核心依赖和精确 peer 版本由宿主固定，不能在运行目录内原地安装依赖。
- `connections.providers` 列出认证方式。`connections.create` 建立独立连接，`connections.setKey` 保存新连接的 API Key。一个 provider 可有多个连接。`connections.models({id,...page})` 读取该连接模型，模型选择始终为 `{connectionId,modelId}`；不自动切换账号或计费来源。
- 订阅登录使用 `auth.start({connectionId})`、`auth.list` 和 `auth.reply({id,promptId,value})`，由锁定 Pi 协议驱动。让用户在官方浏览器完成登录；不将 token、验证码、登录 URL 写进对话日志。`auth.cancel` 取消交互并释放回调；`auth.logout` 清除凭证。已经绑定历史的连接不能覆盖账号身份，需新连接和新会话；正常 token 刷新不改变连接。
- `connections.list`、`connections.models`、`sessions.list`、`apps.kv.list` 都返回 `{items,nextOffset,hasMore}`。传 `offset` 和 `limit`（最多100）；有后续页时使用 nextOffset。SDK 浏览器端可用 `ctx.clientApp.api.list` 或 `readAllPages` 聚合。不要把第一页当全集。
- `sessions.create` 必须指定 appId、connectionId 和 modelId，可指定 endpointId、cwd 与 policy。默认 controlled；读取和搜索按应用启用范围执行，写入、进程和外部操作请求批准。只有明确授权时才选择 automatic。
- `sessions.send({id,text,requestId})` 持久接收输入；重试同一消息必须保持同一个 requestId。返回代表接收成功，不代表模型完成。通过 `sessions.list` 的 status 和 `sessions.projection` 观察结果；`sessions.cancel` 传播取消到模型和子进程。未知结果不得用新 requestId 重复发送。
- `sessions.projection({id,offset,limit})` 返回持久展示项与日志游标。使用 nextOffset 补齐，不能按可见行数算游标。流式文本仅临时展示；Session 才是唯一 Agent 历史。崩溃后显示中断，不自动重放写文件或 shell 副作用。
- `sessions.model` 仅在空闲时切换同一连接内模型；更换端点或账号须新会话。`sessions.archive` 支持归档和恢复，不删除历史。
- `cards.list({sessionId,offset,limit})` 读取持久交互卡片；`cards.respond({sessionId,cardId,actionId,values})` 按已展示的操作与输入回复。宿主先认领再执行；重复、过期、停用或中断卡片不可重放，未知执行结果先重读状态。卡片不替代 dsh 消息历史。
- 手机新建/切换模型只接受桌面已添加且当前连接仍可用的模型；移除不改写现有会话的连接和模型。
- `approvals.list` / `approvals.reply({id,allow})` 对明确的工具请求批准一次或拒绝。审批不是 OS 沙箱。不要替用户扩大自动执行范围。
- `apps.kv.*` 按 appId 隔离；单值最大256 KiB UTF-8 JSON。缺失返回 null。较大内容由应用管理文件，KV 只存索引。
- `chat.status/connect/sync` 管理新的 CloudKit v3 传输。远端入口创建的会话由该 iCloud 账号拥有；普通桌面会话不会自动上传。远端命令有去重与确认；不能把 sync 成功当作手机已收到。生产 schema 与签名客户端必须单独验收。

## 应用开发

使用宿主 `application create/check/build/pack` 命令，生成项目固定开发 SDK 归档。后端是标准 Cordis 插件（apply/inject/Config/effect），可由 Bun 直接执行 ESM TypeScript；`exports["./client"]` 可选，提供浏览器产物。SDK 提供 ctx.app、ctx.clientApp 和页面注册，上游 Agent/Session/Tool 类型直接从 dsh 导入。接口与示例见 `packages/sdk/README.md`、`docs/cordis-runtime.md`。

开发源码变化同样通过空闲后重启后台生效；不要使用 Node HMR、修改运行目录或在任务运行时强制杀进程。FIA 的窗口、系统能力、后台生命周期与应用更新仍由框架负责。普通实施不授权推送、发布、生产 CloudKit 部署或 TestFlight 分发。
