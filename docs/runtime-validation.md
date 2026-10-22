# 新 runtime 验证记录

日期：2026-10-20 起；2026-10-21 联合发行验收。此记录描述新 Cordis runtime，不能作为 fn 0.4.5 或旧插件接口的能力声明。上游锁定 dsh `0.2.1-rc.2`、Cordis `4.0.5`、Pi `1.1.0`；归档与来源见 `vendor/dsh/README.md`、`upstream.lock.json`。

## 2026-10-21 内核共享与增量安装（本地未发布）

用户确认参考 dsh 的内核/profile 分离。`GenerationManager` 新增 schema 2：共享固定 seed、独立插件和私有依赖目录、仅含清单和相对链接的 generation。普通安装、更新和卸载不复制整套内核或未改变的应用；原有目录仍可启动及回退，历史目录暂不自动回收。下方并发复制候选已被取代，其实现只用于外部开发 seed 首次接入。

同一正式 seed `69a91926d31e7939fb88a8fe` 与同一组三个公开归档，串行、无并行构建的本地 `stageInstall` 分别 **196 / 187 / 189 ms**（随手记/译文/搜索）。原版同组为 **5932 / 5808 / 5705 ms**，中位数减少约 **96.7%**。目录准备只占 0–1 ms，私有锁及引用准备 22–23 ms，共享图审计 59 ms，预导入及发布约 93–99 ms。仍排除网络、初始 seed 物化、空闲等待、FIA 重启和页面重连，未清 OS 缓存；不是端到端或冷启动承诺。[测量 JSON](install-benchmark-2026-10-21.json) 保留原版、复制候选与最终分层样本。

最终应用回归 **267 项 / 2316 断言**通过。真实 Bun + 本机 registry 验证两个私有依赖版本、传递 Cordis peer 的跨应用同一对象身份、生命周期脚本不执行、旧内核与锁文件不被安装器改写；缓存移除后使用不存在的安装器路径仍能恢复。冻结私有锁在安装阶段执行，发布后只审核锁摘要和真实依赖图，不在已绑定核心的目录重新运行安装器。

正式市场三包的兼容/摘要/安装/忙时延后/重启状态通过，并实际载入同一 `FnRuntime`，验证随手记方法、卸载释放和 KV 重启保留。另覆盖原 schema 1 不改写并可回退、schema 2 整目录搬移、共享 seed 同 ID 冲突拒绝、权限/链接/复制失败清理。新增测试曾暴露首次 `--production` 不生成 Bun 锁的问题，已改为先 `--omit=dev` 生成锁并要求非空，再用 `--production --frozen-lockfile` 校验。运行阶段无需联网或包管理器。

最终完整 `bun run check`（FIA 88 JS / 48 Swift）及 `bun run build` 通过；ego-browser 产品 6 组通过，包含安装阶段、空闲等待、失败重试和完成清空，专用空间和本轮 Dev 已正常退出。实际应用包在独立临时数据目录验证三个市场条目 available、前后端 ready、普通退出和受管进程组清理，仅一次后台启动。该本地包 seed `85fcd2e087a06fdc11a630ea`，runtime ID `93a15ada0a4cd6a449e233ddef776e77862860f2713748b6070dfafc02482bc9`。官网 33 篇内容、文档链接和改动格式检查通过。未提交、合并、推送、发布或替换正式应用；应用版本保持 0.5.1/build 11。

## 2026-10-21 并发复制候选（已被上方分层方案取代）

`codex/faster-plugin-install` 基于 `8ca60f7`，将 `GenerationManager` 的整代复制改为 32 并发、支持时写时复制、独立文件身份与字面符号链接。安装/卸载/seed 物化共用；新增阶段事件和桌面提示。未修改 SDK、官方插件、FIA 或手机端契约，不改变依赖审计、预导入、空闲切换和回退条件。

用相同正式 0.5.1 seed `69a91926d31e7939fb88a8fe`（23,222 文件、2,520 目录、507 链接、152.65 MiB 逻辑数据）与三个固定公开归档，从临时空目录顺次安装。最终串行测量随手记/译文/搜索旧版分别 **5.932 / 5.808 / 5.705 s**，新版 **4.203 / 3.492 / 3.481 s**，分别减少约 29% / 40% / 39%；两组三项中位数下降约 40%。首轮新版为 2.933 / 2.885 / 2.821 s，但与框架检查重叠，仅保留作波动记录，不采用最快值承诺。

以上只测 `stageInstall`，排除初始 seed 物化、联网市场/下载、FIA 重启与页面重连；没有清系统缓存。写时复制取决于文件系统，不保证任意设备的绝对耗时。可复测命令：`bun scripts/benchmark-install.ts <已解包的-seed-目录>`；数据见 [测量 JSON](install-benchmark-2026-10-21.json)。旧版对照使用基线原始 GenerationManager，运行同一脚本，不修改复制逻辑。

完整 `bun run check`（FIA 88 JS / 48 Swift）、265 项应用测试 / 2275 断言、`bun run build` 通过。新增复制回归覆盖深层目录与超批量文件、相对/悬空/外部链接、可执行/只读/受 umask 影响的目录权限、独立 inode、目标冲突与失败时排空写入后清理；现有真实市场、坏包拒绝、空闲切换、恢复与回退继续通过。ego-browser 产品 6 组通过，含七阶段提示、等待、错误重试、完成清空；测试空间和本轮启动的 Dev 已正常关闭。

首轮 Dev 启动与 check 同时重建 seed，导致输出目录 rename 冲突；等待完整构建结束后单独启动通过，未扩大超时或修改验证绕过。官网仅同步未发布说明，33 篇内容、文档链接和改动格式检查通过；未改版本、提交、推送、发布或替换正式应用。

## 2026-10-21 0.5.1 正式补丁验收

`v0.5.1` 固定 `9825765`；主干 CI 39612373554、正式发行 39612788964 成功。完整 check、262 测试/2157 断言、build、SDK 与 FIA 独立消费通过。公开五附件、签名、公证、Gatekeeper、生产权限、32 个在线签名更新文件与旧历史抽检通过，详见[发行记录](github-release.md)。

本次独立消费正式 DMG 的 seed，从真实市场 refresh/resolve 到三个归档下载/摘要/安装、忙时等待/空闲切换、active/installed、卸载释放和 KV 恢复全部通过。另用实际 0.5.0 归档的原版校验器建立旧代，验证现有插件和笔记保留、新 seed 空闲切换、旧代不改写及市场恢复。新包临时空目录启动至退出 16,486 ms，仅一次后台启动，所有受管进程退出；这是单次 smoke 时间，不是冷启动基准。

本机首轮 check 受代理转发 localhost 干扰；排除本地地址后完整重验通过。升级脚本首轮误用新版校验器物化旧 seed，正确拒绝缺失 React 元数据；改为以旧归档原版校验器建立旧代后，本地与正式包升级均通过。没有修改生产验证来跳过共享依赖审计。

下方“未发布”“候选”保留为当时开发阶段记录；SDK、插件、手机和模型认证能力不因本次补丁扩大验收范围。

## 2026-10-21 发行后验收更正

发行后纠正：0.5.0 的三个官方应用在真实市场入口均被误判不兼容。下述公开归档安装验证直接调用底层 GenerationManager，未覆盖 RuntimeProduct.resolve，不能代表市场入口通过。签名、公证、摘要与部署证据不受此问题影响。

## 2026-10-21 市场核心版本修复（0.5.1 候选）

`codex/market-core-versions` 在 seed 中从宿主精确依赖登记 React/React DOM，校验实际包、根链接、锁文件 override 与唯一实例；地址安装和市场保持严格 peer/版本校验。0.5.0 原来虽然携带 19.2.7，却没有在 coreVersions 登记，导致市场缺失值比较失败。SDK、官方插件归档和市场无需改写；此固定 seed 改变运行时身份，未来发行需要完整 DMG。

新增 `runtime-market-seed.test.ts` 使用固定的正式 schema 2 索引与三个原始公开 0.1.0 归档，修复前准确复现三个 incompatible；修复后从实际 seed 构建/压缩/解包，经市场 refresh/resolve、摘要与身份校验、安装、忙时等待、空闲切换、重启到 installed 和离线 frozen lock 均通过。没有从宿主版本表生成同源测试市场。另验证错误前端 peer、自带副本、重复实例被拒，以及已有旧代不改写、重放现有应用后空闲升级。

完整 `bun run check`、262 项应用测试/2157 断言和 `bun run build` 通过；check 包含 FIA 88 JS/48 Swift。首轮新测试 mock 的 typeof fetch 缺少 Bun preconnect 类型声明，改为与现有夹具一致的显式类型桥后完整复验通过。未改 FIA、SDK API 或手机端，不重复模型/CloudKit 业务验收。官网常见问题与来源说明仅本地更新，33 篇内容/链接和改动格式检查通过；上述为修复开发阶段验证；用户随后授权发布，应用现准备为 0.5.1/build 11，正式签名产物与官网部署另验。未替换用户已安装应用。

完整本地应用包独立验收通过：从 `dist/fn.app` 解包并校验实际 seed，React/React DOM 根包和 coreVersions 均为 19.2.7，三个固定官方条目均为 available；临时空目录启动、前后端 ready、正常退出和进程组清理通过，后台只启动一次。seed `3b97ff3a17342246c0f514d5`，runtime ID `f4a04379d4fedb91257f9d0a5eda4f792560ac928dcc7cc1c43e2d627f0306e1`，与公开 0.5.0 不同；这是未发布本地构建，未验证新正式签名/公证。

## 2026-10-21 原发行验证补充

SDK 0.4.0、三个 Cordis 0.1.0 官方应用和新市场已公开。公开 SDK 与候选/正式 CI 归档一致，干净 registry 消费与桌面内嵌 55 文件比对通过；公开插件真实 generation 安装、共享内核、空闲切换、加载、卸载和 KV 重启恢复通过。iPhone 0.3.0（4）已在原内部 TestFlight 组分发，生产新增 9 个 Session 类型、两环境四类订阅实际成功；真机交互和通知仍未验。

FIA 增加公证最终状态检查、归档前原生代码签名及有界后台初始化期限；88 项 JS/48 项 Swift、fn 完整 check/build 与框架独立消费通过。正式 `v0.5.0` 固定 `4f37222`，工作流 39533452898 成功；公开 DMG SHA-256 `c4dbd5fe51c30f8318476eef3ad1ee3c3301aaed5e3df7e6db96924f431e3a02`，签名、公证、Gatekeeper、生产权限、内嵌 SDK、32 个签名更新文件独立验收全部通过。首次启动至退出 14,795 ms，只有一次后台启动；旧更新历史保留。完整证据见 [应用发行](github-release.md)。下方未发布描述属于当时阶段。

## 2026-10-21 Session 自定义卡片与手机模型筛选

新增 `ctx.app.cards.action/create/cancel`、共享 SDK `./cards`、桌面与原生表单和 v3 `FnSessionCard`/card 命令。定义按 Session/key 幂等不可变；先持久认领回复再调用作用域内 handler。已验证输入、并发、写入失败、handler 失败、过期/取消/停用、子插件销毁与重启不重放；卡片是 fn 产品交互记录，不替代原 dsh Session 消息历史。

手机目录只包含桌面已添加且仍存在于当前连接目录的模型。同 provider 不同连接分别筛选；空/未配置连接隐藏，远端离线新建/切换执行前再次校验。移除列表项不会改变已有 Session 绑定，也不阻止其继续发送。

本轮完整 `bun run check`、`bun run build` 和 `bun run npm:pack` 独立归档消费通过。259 项应用测试 / 2131 断言；FnChatCore 12 项、FnChatUI 4 项通过，包含卡片 280/560pt 明暗布局。FnPhone Debug 无签名 iPhone 目标构建成功。新增 Swift 离线卡片测试验证重启队列、传输确认不解锁按钮、最终答案跨客户端恢复和账号隔离；内存 transport 不作为真实 CloudKit 证据。

ego-browser 卡片 3 组、原产品 5 组回归通过。验证五类输入、无效提交、等待锁定、失败重试、接受答案恢复和过期/停用状态；修正复选框受全宽输入规则影响的布局。首次用仓库相对地址 `/frontend/tests/...` 命中了 SPA 回退，正确 Vite 路径为 `/tests/runtime-cards.html`；没有扩大超时。浏览器空间已关闭，用户 Dev 保持运行，本轮未启动 Preview。

SDK 实际归档在独立目录安装 67 个包，类型检查、后端 TypeScript、`./cards` 共享模块身份、客户端构建和应用包解包后导入通过。三个已有官方示例不使用可选卡片接口，保留此前固定开发归档；新应用从当前宿主取新版快照。官网只同步未发布预览说明，33 篇内容及链接/格式检查通过；无公开安装入口变化。

当前 Dev 缺少 CloudKit container entitlement。v3 schema（含本次新增卡片类型）、签名手机、真实 iCloud/APNs 与多设备链路仍未验收；没有部署 schema、上传 TestFlight、发布或推送。本轮不重复性能测量，下方数值属于此前 seed。

最终 seed `bf77025dd0106b17ec3bdaeb`，SHA-256 `870915cdcca56488ae6fdf71c21e24975f10d31a10a62371d7a4c8b0174a2db7`；应用 runtime `c0a18e0df9dfbd4a3fe944afd3487b6da57d2a134183c3936175d8252940d2c9`。独立消费的 SDK 归档 SHA-256 `c1446d5fe85affca56c7aff5971f35defe9bfec8f1551cc67ac46ab97f0c379c`。这些是未发布本地产物，不改变公开版本。

## 2026-10-21 继续验收与原能力核对

完整能力矩阵见 [核对记录](core-capability-audit.md)。异步账号选择回归改为显式等待认证 Promise，新增共享 UI/keepAlive/卸载流程，稳定 Dev 连续三次通过；更新 5 组和外观 3 组浏览器夹具通过。旧超时未重现，不再标记该浏览器项为未验。

新增页面状态保留、共享 SDK UI、SVG/文字图标、Git 安装与 Chat 已读游标。完整 `bun run check`、252 项测试 / 2077 断言和应用构建通过；FnChatCore 9 项、FnChatUI 3 项通过，FnPhone Debug 无签名真机目标构建通过。真实 GPT 订阅最小回复、多轮 web_fetch（官网 HTTP 200）、首个 stream delta 后取消和后台重启历史恢复均通过。没有新建 OAuth 登录或强制刷新已有凭证。

当前 Dev 的 Chat 状态明确返回 `CloudKit container is not enabled in this signed application`，因此 v3 iCloud/APNs/真机和多设备验收仍待具备对应 entitlement 的开发签名。生产 schema、正式更新包和新官方市场保持未发布。该阶段尚缺的自定义卡片和手机筛选已在上方本轮补齐；当时的缺口保留在历史记录。

最终 SDK 独立归档消费、FIA 独立源码/归档/应用消费均通过（FIA 85 项 JS / 48 项 Swift）。三个官方例子固定 SDK `fn-cordis-sdk-c37e6332d7a5.tgz`，SHA-256 `c37e6332d7a57d592e233d542be39883d008a16af56bc1859f0f247a34e54267`，check、5 项测试 / 17 断言及三包构建通过。Preview 已逐个更新三个归档，均 active 且有 SVG；真实切页仅显示一个页面，随手记草稿保留，清空验收草稿后既有 KV 笔记仍在。

最终 seed `a5b2f758ab4ff448c0d43e14`、SHA-256 `7bd655da3d69d3ef38705e100dbc36eb2b77410622ed30c4a358c50e24fad2aa`；应用 runtime `faad4cc24e0154c7fca5ba51401044878020c19139157faf5a8801f695b2cbaf`。新 [完整应用测量](application-benchmark-2026-10-21.json) 在构建/安装结束后采集 3 次空目录启动和 3 次同目录重启，UI 中位数 **12.07 s / 0.91 s**；本地 mock 首任务落盘 **53.84 ms / 51.28 ms**，Host+Bun 空闲 RSS **257.07 / 205.89 MiB**。首次包括约 217 MiB 依赖图物化，RSS 不含 WebKit 子进程；没有清 OS 缓存，不等同于磁盘冷启动或真实网络任务时延。首轮与并行构建重叠的测量仅作诊断，不用于比较性能。不能据小样本声明相对 Node/旧版更快。

官网预览页同步，33 篇内容、生成内容、链接与改动格式检查通过；默认安装入口、版本和公开产物不变。测试会话已归档，未删除历史或改写凭证。

## 2026-10-21 产品能力补齐

此前记录验证了内核和基础页面，不能证明原产品能力已经完整交付。用户指出缺失后，已恢复紧凑侧栏、模型管理、外观、FIA 更新页和新协议应用中心。默认测试 247 项 / 2052 断言、完整 check、最终类型检查与 build 通过；独立示例 5 项测试 / 17 断言与打包通过。

真实 Preview 验证服务商目录、选中模型、账号移除、主题和应用中心；离线浏览器夹具验证市场/已安装操作、来源、更新状态、忙时拒绝及主题同步。新增异步账号选择夹具执行遇到浏览器超时，尚未验证。官方新市场尚未发布，真实 OAuth/远端刷新和签名应用更新不在这些测试的证明范围内。完整范围见 workspace [产品补齐记录](../../docs/agent/sessions/2026-10-21-fn-product-capabilities.md)。本轮 seed `27b4a9fc653bba4ac65726d0`，未重测下方历史性能样本。

## 2026-10-20 内核与基础页面验收

最终 `bun run check`、`bun run build` 通过；默认 `bun run test` 覆盖应用、runtime、SDK 与 Chat v3，共 240 项测试、2011 个断言，0 失败。FIA 含递归 JSON schema 声明修复的独立导出消费通过安装、lint、格式、类型检查、85 项 JS 测试 / 593 断言、48 项 Swift 测试（11 suites）、真实 npm 归档以及全新消费应用 check/build/smoke。最终产物为 `dist/fn.app`，runtime/seed 身份与完整应用测量一节一致。

最终 Preview 已完成以下桌面操作：

- 三个独立示例归档安装并加载页面。译文页面选择本地测试连接和模型，通过原版 Pi/dsh 建立 Session、显示持久回复；随手记 KV 跨后台和完整 Preview 重启保留，禁用后页面移除，重新启用后内容恢复。网络搜索页面加载通过，未调用真实搜索服务。
- 模型回复、会话内切换模型、归档/恢复、页面切换时的草稿保留，以及历史投影恢复通过。投影不再显示内部 `runtime-context` 或纯工具调用产生的空助手气泡。
- 工具审批前目标文件不存在；等待审批时准备的应用更新保持 pending，后台 epoch 不变。“允许一次”后实际写入临时文件，任务结束后自动切换运行目录；FIA Host 与窗口保留，前端恢复状态。浏览器 Agent 授权在后台重启后需要重新签发，原生窗口使用宿主重连流程。
- Dev 源码修改后等待长任务结束再切换，恢复源码后再次切换，详见下文。`RestartDeferred` 的最后一次忙状态复核通过类型检查、回归及启动验证，未对该精确竞态单独做真实时序注入。

上述模型使用 localhost SSE fixture，验证实际内核与产品链路，不代表真实推理质量、OAuth 或多账号远端刷新已验收。真实 API Key/OAuth、外部搜索、CloudKit v3 生产 schema、签名客户端与 iCloud/APNs/真机仍是发行前验证项。SDK、官网和知识库只更新本地未发布说明；未提交、推送、发布或部署。

验收结束后，本轮启动的 Dev、Preview 和 localhost fixture 已退出，专用浏览器空间已关闭；Preview 状态为 `running: false`。四个相关仓库的 `git diff --check` 和 31 份变更 Markdown 的相对链接检查通过。

## 隔离产物与生命周期

已运行：

- `bun scripts/upstream/verify.ts`：33 个公开 npm 归档的 SHA-512、SHA-256、包身份、共享依赖闭包、根锁文件匹配。
- `bun --no-env-file --no-install scripts/upstream/smoke.ts`：33 个包实际 ESM 导入，Cordis 注入、事件、卸载及唯一实例。
- `bun scripts/runtime-seed.ts`：runtime/SDK TypeScript 和完整已安装依赖图复制为自包含 seed，并生成 `.tgz` + 带 SHA-256 的 `.json` 元数据，作为 FIA runtime 资源随完整应用分发。当前 168 个包，展开目录约 217 MiB；包含 SDK 现有 UI/build 依赖。所有包间链接相对指向 seed 内部。
- `bun --no-env-file --no-install scripts/upstream/generation-smoke.ts`：在 checkout 外的独立临时 dataDirectory 物化 seed、导入 runtime、安装原始 TS 插件与普通 `zod@4.4.3` 依赖、校验共享 Cordis 实例、确认重启切换。插件 postinstall 未运行；随后移除普通依赖更新插件，离线 frozen lock 校验通过。
- `bun test packages/runtime/tests/generations.test.ts`：10 项测试 / 64 个断言，覆盖 runtime 资源归档校验/解压与篡改拒绝、候选累积、忙时延后、TS 预导入、共享 peer 不匹配、重复核心实例、非法链接归档、安装/重启失败、卸载、新 seed 在后台重放、不兼容新 seed 保留旧代及原 pending、未确认试启回滚且不反复重试。延迟预检用例验证候选尚未完成时旧 generation 仍能启动，启动路径不访问新 seed 或安装器；空应用新 seed 也必须通过 runtime 入口预导入。
- `bun test packages/runtime/tests/runtime-contract.test.ts`：依赖撤销与重新提供时的注册释放、禁用与重新启用等待旧方法/异步 cleanup、持久化失败阻止真实工具 execute。SQL 故障在 `tool/call` INSERT 时注入，模型确实返回工具调用，但工具实际执行次数为 0，随后 flush 与 shutdown 继续报告持久化错误。

runtime seed 归档从签名应用的只读 runtime 资源读取，验 SHA-256、路径和链接后解压到 dataDirectory 下的 `runtime/seeds/<id>`。真实归档约 29.07 MiB，已在独立临时目录完成解压、generation 物化和 `FnRuntime.open/close`；相同源码重复构建的 seed ID、归档 SHA-256 和归档 mtime 均保持不变。generation 在新的不可变目录内安装，只有验证成功才写 pending。已有 ready generation 的 `initialize()` 直接恢复旧代；`stageSeed(seedDirectory)` 在旧后台仍可用时重放完整应用集合、校验依赖图和预导入，安装网络不进入 FIA 的启动就绪时限。切换时先持久化试启指针；新进程加载成功需 `confirmActivation()`，未确认崩溃自动恢复前一代。新发行 seed 的后台准备失败会保留旧代，原因通过 generation status 暴露。`initialize()` 对已有可用代次只读指针并快速启动；新 seed 的插件重装、锁文件验证与预导入通过 `stageSeed()` 在旧后台运行时完成，准备成功才发布 pending。启动路径不进行网络安装，避免超过 FIA readiness 时限。开发重载同样异步准备，再等待空闲切换。原生实测见文末。

## RPC 体积边界

`apps.kv.list`、`sessions.list`、`connections.list`、`connections.models` 使用 `offset/limit` 和 `{items,nextOffset,hasMore}`，每页最多 100 项、JSON 最多 512 KiB。UI 和 SDK `clientApp.list()`、`clientApp.kv.list()` 自动聚合全部页面；读取中断不会返回半份列表。Session 页使用固定创建顺序，UI 聚合后按最近更新排序。

KV 单值最大为 256 KiB UTF-8 JSON，RuntimeStore 和 RPC 输入/输出均执行相同限制；超过限制明确拒绝，已有值保持不变。较大内容应由应用自行保存在文件中。Connection profile 也按 UTF-8 字节校验，列表只提供精简 profile。相关检查给 FIA 1 MiB envelope 留出余量。

`bun test tests/runtime-limits.test.ts packages/sdk/tests/cordis.test.ts packages/runtime/tests/connections.test.ts` 已通过 15 项测试 / 105 个断言，覆盖多页完整性、中文内容字节预算、SDK 自动翻页、非法/停滞游标拒绝、单值超限不写入、连接 profile 的多字节超限以及既有 SDK/连接回归。

## 性能样本

执行：

```sh
bun run runtime:seed
bun --no-install --no-env-file scripts/runtime-benchmark.ts \
  --samples=7 --output=docs/runtime-benchmark-2026-10-20.json
```

机器为 Apple M1 Pro / 10 逻辑核心 / 32 GiB 内存，Darwin `25.6.0` arm64，Bun `1.4.3`。固定 seed `6a72abef3e92a9108daeb692`，采集 7 个独立 Bun 进程，每次使用空 SQLite 数据库。原始样本见 [JSON 结果](runtime-benchmark-2026-10-20.json)。

| 指标 | 中位数 | 最小值 | 最大值 / 样本 p95 |
| --- | ---: | ---: | ---: |
| runtime 模块载入 + `FnRuntime.open` | 77.67 ms | 75.90 ms | 98.08 ms |
| 其中模块载入 | 62.61 ms | 61.75 ms | 66.43 ms |
| 其中 `FnRuntime.open` | 15.54 ms | 14.15 ms | 31.65 ms |
| 首个本地 mock 任务，含 SQLite flush | 37.33 ms | 36.74 ms | 41.66 ms |
| 任务后空闲 RSS | 44.50 MiB | 44.16 MiB | 44.84 MiB |

计时从子进程中的动态 runtime import 前开始，包含首次 SQLite 建表；不包含安装/复制 generation、Bun 启动脚本前开销、FIA/原生窗口、WebView 或 UI 渲染。每个样本是新进程，操作系统文件缓存未清空，因此属于进程冷启动而非磁盘冷读。7 个样本的 nearest-rank p95 等于最大值，不能据此估计长期尾延迟。

任务通过本地回环 HTTP SSE 返回一个 assistant 响应，经过实际 Pi 适配器和 dsh agent-loop，任务计时包含用户消息入队、模型请求、完成等待与 SQLite flush；它不包含真实模型推理、互联网延迟、OAuth 刷新或工具运行。RSS 为任务结束后 250/500/750 ms 三次自然空闲读数平均，不强制 GC。尚未做 Node 或旧 fn 对照，不能据此宣称相对性能提升。

## Session 持久化、工具与 Chat v3

以下检查已实际运行：

- `bun test packages/runtime/tests/persistence.test.ts`：15 项测试、86 个断言，覆盖延迟物化、单写者、连续事件序号、fork 前缀、事件队列排空、错误传播、真实 AgentLoop 创建/发送/恢复、派发前 checkpoint 和子进程 SIGKILL 后恢复。checkpoint 写入失败会阻止模型派发，未完成操作不会因恢复而自动重放。
- `bun test packages/runtime/tests/tools.test.ts packages/runtime/tests/projection.test.ts backend/chat-next/chat.test.ts`：阶段验收 27 项测试、204 个断言，覆盖应用作用域工具卸载、受控执行审批、文件规范路径/符号链接边界、输入/输出限制、子进程组取消/超时、网络 AbortSignal、投影剔除系统消息和 provider replay、压缩后展示历史、持久命令去重、iCloud 账号隔离、未完成命令中断和协议异常隔离。另覆盖 JSON 转义后的实际字节预算、完整 shell 审批详情及多条长审批分批发布，避免超限阻断同步。目录显示名称限长，空白或超长模型 ID 被跳过，有效 ID 原样保留；异常目录条目不阻断命令或回复同步。文件路径约束不等同于操作系统沙箱；插件和 shell 仍是受信任本机代码。
- `bun test packages/runtime/tests/chat-integration.test.ts`：1 项测试、7 个断言。以本地 HTTP SSE fixture 通过原版 Pi 适配器和 dsh AgentLoop，实际执行 CloudKit 命令抽象 → Session → SQLite → fn 展示投影；关闭并重新打开宿主后，重送旧命令不再调用模型，下一条命令继续已持久化历史。两次有效发送共调用模型两次。传输使用内存替身，不代表真实 CloudKit 已验收。
- 对工具、投影和 Chat 测试入口的独立 TypeScript 严格检查通过；`bun backend/chat-next/generate-schema.ts --check` 确认 Apple 校验资源与 TypeScript v3 schema 一致。
- `FnChatCore` 的 `swift test` 共 8 项通过（旧协议 5 项、新 Session v3 3 项）；`FnChatUI` 的 macOS 和 `arm64-apple-ios17.0-simulator` 构建通过。构建仍有既有 `ChatMarkdown.swift` actor isolation 警告。

Session Chat v3 使用独立 zone 和按 iCloud 账号隔离的本地 SQLite 目录。客户端入口已改为 `SessionRootView`；协议只发送 fn 展示 DTO，普通桌面会话不会自动上传。CloudKit 命令在执行前持久认领，进程中断后把未确认操作标为中断，不自动重试可能已经发生的副作用。

ChatService 新增测试验证：重启 gate 关闭时 connect/sync 不访问 native、不创建配置、不开始工作；已连接服务在 gate 恢复后自动继续轮询。首次连接仅在新目录写入按模式选择的 container 和 hostname，手动配置优先且不读取旧目录，原生签名错误明确保留。这里完全使用内存 native 替身，没有访问真实 iCloud。投影回归还验证仅隐藏精确 `runtime-context` source，内容相同的真实用户消息仍显示；纯工具调用的 assistant 事件不生成空白气泡，工具行仍保留。

`bun test tests/runtime-auth.test.ts`：4 项测试、25 个断言；使用 auth 替身验证当前 prompt ID 匹配、同连接登录互斥、提示独立取消、cancel/close 释放待答 Promise、关闭后禁止新登录，以及窗口快照不保存输入凭证或原始异常正文。已修复 BFF 独立提示信号遮蔽 attempt abort 的问题，并将登录/浏览器失败改为安全提示。定向 strict TypeScript 和 oxlint 通过；没有发起真实 OAuth，不代表实际登录与刷新已验收。

`backend/chat-next/cloudkit-schema.ckdb` 目前只是本地 schema 文件；新类型尚未部署到 CloudKit 生产环境。本轮没有签名客户端发行或 TestFlight 上传，真实 iCloud/APNs、iPhone、多设备同步及新版原生通知点击仍未验证。Apple 开发入口、生成命令和 v2 历史边界见 [Apple 开发指南](../clients/apple/README.md)。

## SDK 归档与独立示例

`bun run npm:pack` 已通过实际 SDK 归档检查及 workspace 外的独立安装（67 个包）。默认 CI 校验根入口、`./cordis-client`、`./build-cordis`，然后检查应用类型、Bun 直接导入后端 TypeScript、浏览器 React/Cordis/SDK 导出共享身份、分页、客户端构建、应用打包和解包后的再次导入。旧模板 smoke 只在显式 `--legacy` 时追加，本次未运行旧模板验收。

SDK 的 8 项测试 / 35 个断言通过。独立 `fn-plugins/examples/cordis` 固定消费 `fn-cordis-sdk-a27218b668db.tgz`，SHA-256 为 `a27218b668dbd3144dae90be9bf5517aaa3fe3586bf80ba36cbd9fb3f8e45d0a`；不从相邻仓库解析运行依赖。该目录的类型检查、5 项测试 / 17 个断言、三个应用构建/打包及 frozen lock 重装通过。归档仍是未发布开发产物。

## Dev 空闲重载实测

`bun test tests/runtime-dev.test.ts` 已通过 11 项测试 / 39 个断言，覆盖启动旧 seed、忙时等待、构建失败、构建中修改、重启失败、响应丢失、回滚、依赖边界及指纹排除规则。监督器与 npm 消费脚本的定向严格 TypeScript、oxlint、oxfmt 检查通过。

真实 FIA Dev 在已有运行目录上启动并后台升级 seed 后，安装一个临时纯服务应用持有长任务。修改 runtime 源码使 seed 从 `a2f2bcbf7be0597aa4e72095` 变为 `6ad66c67b8459bc41566d27a` 时，任务仍运行且 epoch 不变；主动释放任务得到正常结果后，候选完成准备并切到新 seed、新 epoch。恢复源码后自动切回原 seed，测试应用通过公开 API 卸载。最终状态为空闲、无 pending/安装/错误，只保留内置 `fn-chat`；临时源码标记已删除，本任务启动的 Dev 已正常退出，已有 Preview 未停止。

此前同步安装新 seed 曾超过 FIA 就绪期限。现已将已有代次的新 seed 解包、重装与预导入移到后台准备，保留旧代可用；没有放宽 FIA 超时。以上实测验证源码更新与任务生命周期，不包含真实模型、OAuth 或 CloudKit 调用。

## 完整应用启动与本地任务测量

对最终 `dist/fn.app` 执行：

```sh
NO_PROXY=localhost,127.0.0.1,::1 no_proxy=localhost,127.0.0.1,::1 \
  bun scripts/application-benchmark.ts --samples=3 \
  --output=docs/application-benchmark-2026-10-20.json
```

测量使用同一台 Apple M1 Pro / 10 逻辑核心 / 32 GiB / Darwin 25.6.0 / Bun 1.4.3。运行时 ID 为 `dd11e07fe5c1878ddc11d18675910185307f37ddc00b2eea572e41346345be0a`，包内 seed 为 `a2f2bcbf7be0597aa4e72095`，归档 SHA-256 为 `7479918fbb61a21411fa5bdee18b19ee6ff492737c5f52142912317741843d50`。应用版本仍为开发中的 `0.4.5 / build 9`，不能与公开同版本产物混同。原始样本和完整方法见 [全应用 JSON 结果](application-benchmark-2026-10-20.json)。

每组先在全新的临时数据目录启动最终应用，再正常退出并使用同一数据目录重启；共 6 次启动。计时从调用 `Bun.spawn(FIAHost)` 前开始，分别等到原生 inspection 报告后台 ready 和 main 前端 ready。首次包含归档校验、解包和 generation 复制；重启复用已物化目录。结果如下：

| 指标 | 首次空目录，中位数（范围） | 同目录重启，中位数（范围） |
| --- | ---: | ---: |
| 后台就绪 | 14.05 s（13.96–16.25） | 0.82 s（0.81–0.91） |
| main UI 就绪 | 14.15 s（13.96–16.25） | 1.01 s（0.91–1.02） |
| 首个本地 mock 任务到持久投影 | 55.73 ms（54.42–56.68） | 52.17 ms（52.01–54.36） |
| FIAHost 空闲 RSS | 100.27 MiB | 100.76 MiB |
| Bun 空闲 RSS | 156.86 MiB | 101.60 MiB |
| FIAHost + Bun RSS 合计 | 257.09 MiB | 202.36 MiB |

每次通过该次 Host 的私有 Agent UDS 创建一个只指向 `127.0.0.1` 的 mock 连接与会话，再计时 `sessions.send` 到已落盘的 assistant 展示投影。6 次均恰好发出 1 次本地 SSE 请求；3 次重启均读回上一次的持久回复。没有配置真实模型、执行工具或发起 OAuth/CloudKit；测试只关闭自己启动的 Host，并确认其受管 Bun 进程组退出。临时数据与控制目录已清理，没有访问生产数据或停止既有 Dev/Preview。

RSS 来自 UI 就绪后约 250/500/750 ms 的三次 `ps` 观察均值，在本次任务准备前采集，不强制 GC。数值只包含 FIAHost 与其已核对父子关系的 Bun，**不含 WebKit WebContent/GPU/Networking、其它 XPC 服务或测量脚本/mock server**；RSS 求和可能重复计算共享页，不能当成整个应用的物理内存占用。首次结果还包含 seed 物化后的驻留状态。

Host inspection 与脚本轮询各有 100 ms 间隔，启动时间为可观察到 ready 的耗时；任务投影每 5 ms 轮询，并会 flush 活跃 Session。系统文件缓存未清空，未测 UI 交互延迟或真实推理/网络延迟；3 个样本的 p95 等于最大值。应用自身更新配置保持原样。此前 77.67 ms 的数据只覆盖已物化内核导入与打开；完整应用首次启动目前仍需约 14–16 秒，同目录重启约 1 秒。尚无 Node 或旧 fn 对照，不能据此推断相对提速。

本轮收尾：测试 Preview 已确认退出（running: false），专用浏览器空间已关闭，用户原有 Dev 保持 ready/running。四个相关仓库差异检查和本轮 Markdown 相对链接核对通过；未提交、推送、升版、发布或部署。
