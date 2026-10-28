# fn 插件宿主开发规范

当前源码为未发布全插件化候选，产品功能放在 plugins/。host/ 仅负责 FIA、启动、配置、运行目录和恢复；frontend/ 只负责原版模块/Loader/renderer 启动，不导入产品页面。动态契约在插件独立 contract 导出中定义，由 fn-rpc 绑定 FIA APIRegistry；host/api.ts 仅保留宿主状态/恢复。不要创建新全局业务 Bridge、集中 FnRuntime 或万能 ctx.app/clientApp。

共享内核、React 和 SDK 单实例；自有插件命名 @semicoder/fn-<能力名>。配置由 profiles/ 的 bundle/patch 组合，使用原版 Cordis Loader/Include 和 dsh Slots。纯服务/前端均可，实例 ID 独立于包名。所有任务通过 fn-activity 判断空闲，插件变化等待空闲后重启，不引入 Node HMR。

UI 统一从 @semicoder/fn-ui 使用原版 dsh 控件，宿主共享静态模块；功能 CSS 使用 CSS Modules 与 --dsw 语义 token，不新增全局控件规则、Base UI 或 Tailwind。主题仅由 ui-base/ui-theme 管理，packages/ui/upstream 资源原样保留，禁止格式化改写；升级先验证来源 SHA 和依赖闭包。运行 styles:check，并实际验收菜单/弹窗焦点、明暗和窄窗口。

FIA 原生能力、动态 API、通用构建和取消属于 framework/fia/。禁止旁路服务器；自定义资源通过 defineBackend.http 的 /api 相对路由。浏览器使用 FIA open --browser，窗口与标题栏由 FIA 管理；首次成功或故障页挂载后调用 native.ready。各服务独立持久化到 plugins-v1，不读取旧数据，不恢复公开 KV/网页工具接口。Apple 活跃代码集中在 clients/apple/，只使用 Chat v4。

## fn 项目协作

- 先阅读 README、SDK 与相关发布文档，检查 Git 状态。模型、插件平台、SDK/UI 与业务工作流由本仓库维护；通用 GUI/原生/构建问题先在 FIA 修复并验证，再接入应用。
- FIA 活跃源码位于 `framework/fia/`，通过 workspace 包与本应用共同开发，稳定后再独立拆出。框架目录自己的规范仍有效；禁止反向依赖 fn 业务。根目录安装依赖，只有一份有效 `bun.lock`。
- `dev` 自动准备并监听 FIA；`run/build/check/release` 自动准备产物。以构建报告的源码指纹、工具链和哈希核实消费内容；不再刷新相邻包或下载 runtime lock。保留包/API/独立模板边界，发布前仍验证框架可导出和独立消费。
- 修改业务 API、模型、插件契约时，核对 插件的 `contract` 导出、`agent/instructions.md`、`packages/sdk/README.md` 及独立官方插件仓库及根 README；模型目录升级同时维护迁移与不可用状态说明。
- 官网在独立 Semicoder 仓库的 `content/projects/fn/`，workspace 入口为 `../semicoder/`。可见行为、SDK、安装与发布变化需在同一任务检查对应页面，并在网站 `docs/project-sources.md` 记录来源。网站不是应用运行/构建依赖。
- 每次应用或 SDK 版本发布必须同步官网安装、插件开发及受影响指南，并记录版本证据和网站部署状态；两种发行不能互相代替。
- 应用 `v*`、SDK `sdk-v*` 与网站主干部署分别管理；应用更新源由应用发布流程维护，不因官网迁入个人网站而更换。未发布变更与公开固定快照分开说明，普通开发不自动推送或发布。
- 应用采用“持续开发、集中归集、明确授权后统一发布”：日常开发、提交、合并和测试构建不改版本或 build。普通功能、优化和修复集中递增第三位；用户确认的大功能或产品阶段升级才递增第二位并将第三位归零；进入 1.0 必须由用户明确确认。完整 DMG 的需要不决定版本级别，兼容或迁移影响须在发布前说明。
- 每次完成改动更新 [待发布清单](release/notes/unreleased.md)，记录来源提交、验证和官网影响；未完成需求留在待办。沿用短期 `codex/` 分支，不新增长期 `develop`；日常体验用 Dev / Preview 和来源报告区分开发产物。
- 只有用户明确提出发布，才按 [发布手册](docs/github-release.md) 归集范围、生成对应版本说明、执行一次 `version:app` 并验收；重复验收不反复升号。应用、SDK、插件和 FIA 版本独立管理，共仓期 FIA npm 继续暂停。严重线上修复也需明确发布要求，遵循手册的临时修复分支与回主干流程。
- workspace 内遵守根 `docs/agent/development.md`。以上 check/build 要求适用于实现修改；仅文档/规范修改按 workspace 规则检查事实、链接、格式与差异，不启动应用或运行无关完整测试。
