# Cordis 应用运行栈（开发分支，未发布）

2026-10-20，`codex/dsh-runtime`。公开 fn 0.4.5 / SDK 0.3.5 不含本页契约；同版本开发归档不能当作公开 npm 包。应用版本与 build 未改变。

## 运行与职责

FIA 启动一个固定 Bun 1.4.3 进程。`backend/runtime.ts` 只装配产品 API，通过动态入口从完整运行目录加载 `packages/runtime`。原版 dsh 包不进入 FIA 后端 bundle，应用、SDK 与内核解析到同一份 Cordis 与 dsh 服务。

根 Context 共享 AgentRegistry、AgentLoop、LlmRuntime、SessionStore、SessionProjection、SystemPrompt、ToolRuntime、UserApproval、checkpoint 和 retry policy。应用持有 scope，Agent 的公开 setup 在发布前绑定父 scope。页面和 Chat 是客户端，关页与断线不取消任务。

`fia.config.ts` 指向 `shared/runtime-api.ts`、`backend/runtime.ts`、`frontend/RuntimeApp.tsx`。旧实现保留为历史源码，不是活动入口。运行数据全部写入 FIA 数据目录下的 `cordis-v1/`，不读取、迁移或删除旧 `platform.json`、凭证、插件与 Chat 数据。

## 插件

普通 npm 包的 `exports["."]` 指向 Cordis `apply/inject/Config` 插件，可以直接使用 ESM TypeScript。可选 `exports["./client"]` 指向浏览器产物；后端无页面也合法。`fn` 元数据只有 `schemaVersion: 1`、`id`、`name`、可选 `description`、文字 `icon` 及 `iconSvg: "dist/icon.svg"`（8 KiB SVG，SDK 从 src 构建）。

`ctx.app` 提供 KV、方法、Chat 入口、Session 和官方工具注册；Agent/Session/Tool 类型从上游包导入。浏览器有独立根 Cordis、应用隔离的 `ctx.clientApp` 和 React 页面。SDK 构建将 React/Cordis 和 `@semicoder/fn-sdk/ui` 引用转换到宿主模块注册表。页面可用 `keepAlive: true` 保留本次窗口的切页状态，默认卸载；停用/代次切换仍销毁。

插件是可信本机扩展，可以直接使用 Bun 与文件系统。scope 组织生命周期和可见服务，不提供权限沙箱。官方工具默认对写文件、执行进程和打开外部 URL 请求一次性批准；创建会话时可显式选择自动执行。读取目录检查和进程组回收是工具行为，不等同于 OS 沙箱。

## 桌面产品能力（2026-10-21 补齐）

桌面恢复紧凑应用侧栏，应用入口在上方，Chat、应用中心和设置在底部。设置使用独立二级导航：模型服务、外观、应用更新和聊天同步。明暗模式与原生标题栏同步，配色、预览、取消及跨窗口同步复用现有主题组件，写入新的 `cordis-v1/product.json`。

模型服务展示锁定 Pi 的服务商、认证方式及模型目录，支持同服务多连接、API Key、订阅交互登录和自定义协议/端点。`models.saved` 保存用户选中的 `{connectionId,id,name}`；新会话及官方示例通过此分页接口选择模型。添加模型不发起生成请求，删除列表项不删除历史。动态目录刷新只使用目标连接凭证，已有会话保持账号绑定。Pi OpenAI 当前提供预设目录，不表示账号模型授权；已有订阅真实调用与工具循环已验收，新的交互登录及真实过期 token 刷新仍待验证。

应用中心提供市场/已安装页、搜索、来源管理、地址安装、打开、更新、停用和卸载。地址支持 HTTPS 归档、本地 `.tgz`、npm 包规格与 Git HTTPS/GitHub 来源；npm 安装校验 registry 的 SHA-512，市场安装额外校验声明的 SHA-256、包身份及核心版本。更新固定原来源，拒绝身份变化和降级；后台任务空闲后切换运行目录。

新市场使用 `schemaVersion: 2`，与旧插件索引明确分离。索引结构为 `{schemaVersion:2,name,applications:[{id,packageName,name,description,version,url,sha256,core}]}`；`core` 精确匹配宿主共享包版本，必须声明 `@semicoder/fn-sdk`。默认 `marketplace-cordis.json` 尚未发布，界面明确报告，不展示旧包为可安装的新应用。开发示例仍从独立归档安装。

应用自身更新继续使用 FIA 的检查、下载、完整安装包提示和忙时延后流程。正式构建启动时及每 24 小时自动检查；Dev/Preview 默认关闭正式更新，避免覆盖开发构建。插件更新与应用更新使用不同入口，前者只重启后台，后者遵循 FIA 发行清单。

## 连接与凭证

模型选择为 `{ connectionId, modelId }`。一个 Session 固定一个连接，空闲时可在该连接内换模型。账号或端点改变需要新连接和新 Session。

`connections.ts` 为每个连接挂载原版 `llm-pi-ai` 和 `credentials-local`，捕获公开 adapter 注册/替换/销毁。根 Router 在 `prepareCall` 固定具体 adapter，保留 canonical provider。目录等无 Agent 操作必须明确 connectionId。

`auth.ts` 使用锁定 Pi 的登录与刷新协议，集中转换 Pi 与 dsh 凭证格式。环境凭证默认不可见；每连接文件、权限、原子写和刷新锁由原版凭证服务管理。登录交互由 `runtime-auth.ts` 承载，窗口关闭后继续；取消或后台退出释放登录及 provider 回调。已绑定历史的连接不允许用另一组 API Key 或重新登录覆盖身份，正常 token 刷新不受影响。

## Session、Chat 与恢复

`persistence.ts` 实现原版 SessionPersistence：Bun SQLite WAL/FULL、单写者、连续 seq、事务提交、失败队列、flush、恢复及分支。模型请求和工具副作用前由原版 checkpoint 持久化。`applications.sqlite` 只保存产品归属、KV 和收件确认；原版 Session 事件是唯一 Agent 历史。

`projection.ts` 用原版 Session 消息解释器派生展示行，隐藏 provider replay 与内部对象。分页按持久日志游标，不按可见行数。单条/整页限制体积。流式文本仅临时展示，重连重新读取持久投影。输入 requestId 去重，崩溃恢复不自动重放工具副作用。

Chat 使用新的 v3 CloudKit zone 和账号隔离存储，独立命令、确认、目录、会话与展示投影。手机与桌面控制同一个 Agent。旧 v2 客户端和数据不参与此协议。手机模型目录只发布“已添加模型”与当前连接目录的交集，新建和切换命令执行前再次校验；不改写已有会话绑定。

应用通过 `ctx.app.cards.action/create/cancel` 贡献 Session 卡片。`applications.sqlite` 单独保存定义、状态及接受的输入；这属于 fn 产品交互状态，Agent 消息仍唯一来自 dsh Session。回复先持久认领再执行，处理中卡片阻止更新；失败或崩溃不重放。handler 随应用/子 scope 清理，重启重新注册同名 handler 后可继续待答卡片。客户端传输 `FnSessionCard` 展示 DTO，不暴露内部 handler 名称。完整契约见 [SDK](../packages/sdk/README.md#session-自定义卡片开发契约)。

## 安装与升级

`scripts/runtime-seed.ts` 产生自包含 seed。`GenerationManager` 以 seed 和应用归档物化完整依赖图，安装阶段忽略 lifecycle scripts、生成并验证 lock，检查单例和精确 peers；运行期 `--no-install`。

候选先通过独立进程预导入。更新排队等待空闲，禁止新请求，flush 和销毁后由 FIA 重启 Bun，原生窗口保留。只有内核与全部应用完成启动才确认代次；失败或未确认崩溃回到上一运行目录。依赖撤销与停用释放 Cordis effects。

seed 变化会先启动已有可用代次，在旧后台仍可工作时重新装配已安装应用并复验；准备完成后等待空闲切换。启动路径不重装插件，避免把安装时间计入 FIA 的后台就绪时限。运行目录回滚不回滚数据库。未来修改 Session 存储格式必须先在副本验证转换并维护读取版本门槛，禁止把新格式数据库直接交给旧内核。

## 源码开发

`bun run dev` 由 `scripts/runtime-dev.ts` 监督。首次先生成 SDK snapshot 和 seed，再启动 FIA Dev；修改 `packages/runtime/` 或 `packages/sdk/` 后重新生成两者。构建中继续编辑会废弃该候选并重新构建，构建失败保留当前后台，等待下一次修改重试。

`backend/`、`shared/` 修改共用空闲重载。监督器先读取 `runtime.status`，再由开发模式专用的 `runtime.reloadSeed` 检查 epoch、seed 和任务状态。后台异步准备并验收完整候选，旧代继续服务；候选就绪且任务空闲时，原子暂停新请求并让 FIA 重启 Bun。已有运行目录的 Dev 启动先恢复上次可用代次，再后台准备新 seed，避免把依赖安装放进后台启动期限。不会因这些源码修改向运行中的任务发送终止信号。浏览器授权随后台重启失效，需要重新打开；前端继续 Vite HMR。

框架、根依赖/锁文件、配置和自定义命令入口继续使用 FIA 原有重启流程，不受该空闲门槛保护，修改前先结束任务。runtime/SDK 自身依赖声明改变会提示显式安装和重启，不在后台自动换依赖。维护脚本修改需显式重启 Dev，测试文件修改不触发应用重载。Dev 监督器报构建失败或等待空闲时，无需手动结束已有任务；可以修复源码或正常等待完成。

`bun run npm:pack` 检查实际 SDK 归档的三个 Cordis 入口，再在独立临时项目安装该归档，验证后端 TypeScript、客户端共享模块与分页、构建和应用归档解包导入。旧模板消费仅在显式 `--legacy` 时追加；默认 CI 检查新契约。

## 上游同步

`upstream.lock.json` 记录 dsh 0.2.1-rc.2、Cordis 4.0.5、Pi 1.1.0、Bun 1.4.3 和实际闭包。`vendor/dsh/` 是精确 npm 发行 tarball，带完整性与来源记录，不修改上游源码。参考审计 commit `687f282e8625c6b8d11ff58211a90524be2e4317` 不冒充 npm 包的 gitHead（registry 未提供）。

```sh
bun run upstream:verify
bun scripts/upstream/smoke.ts
bun run test:runtime
bun run check
bun run build
bun run framework:verify
```

升级先获取同版本 dsh 家族，更新锁定组合、在独立目录验证模型/认证、Session、生命周期、插件解析和客户端合同，再正常发版。未发行修复必须固定 SHA、独立构建归档并记录来源；不能替换同版本已固定 tarball。

测试与性能结果见 [验证记录](runtime-validation.md)。真实账号登录、外部模型与 CloudKit 业务验收须与模拟合同测试分别记录。

## 发行资源签名

`runtime-seed.ts --distribution` 要求 `FN_SIGNING_IDENTITY`，在 seed 副本中通过 FIA `signNativeCodeTree` 为 Mach-O 依赖签名和验证，再计算 seed ID、归档与摘要。普通 check/build 不读取签名凭据；发布时先准备临时 keychain，再构建 seed。上游原始归档和安装依赖不被改写。`release:update` 复用同一 seed，避免安装包与更新包的资源身份不同。

首次安装需要校验、解包和复制完整 seed，fn 将 FIA `backend.startupTimeoutMs` 显式设置为 60000 毫秒；普通启动复用已有 generation。该值随完整运行时身份固定，打包冒烟最多等待 75 秒，超时仍阻止发布并保留后台/原生请求诊断；不改变模型请求、浏览器回归或工具取消的期限。
