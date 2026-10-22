# 全插件化架构（本地候选，未发布）

本次替代 0.5.2 的集中 FnRuntime/应用 SDK。基线保持 dsh 0.2.1-rc.2、Cordis 4.0.5、Bun 1.4.3，未修改上游源码。归档与闭包记录于 `upstream.lock.json`。上游客户端 store 的发行包缺少运行时 zustand/immer 声明，宿主明确固定 4.5.7 / 10.2.0，随闭包验证；不依赖本机参考仓库。

## 装配与生命周期

`profiles/default.json` 顺序引用 kernel、desktop bundle；每层先叠加 bundle 和插件条目，再调用原版 Include 的 `applyEntryPatches`。包可用 `fn.bundle` 或 `fn.profile` 指向相对 JSON。安装阶段解析为不可变 profile；未匹配 patch、同一 Loader tree 的重复实例 ID、循环 bundle 和不可用包会拒绝。实例 ID 独立于 npm 包名，同包可多实例配置。原版 `cordis:group` 共用所在树的 ID 空间；target 的独立 EntryTree 拥有局部 ID 空间。

`openHost` 只提供基础 HostEnvironment 并启动原版 Loader。产品插件通过具体 Service、inject 和事件协作。默认 Session 服务全局共享，Chat target 与 Agent 使用原版独立 scope；Agent 的公开 setup 在发布前绑定父作用域。页面是订阅者，后台生命周期不依赖页面。

`fn-activity` 汇总任务租约和插件自报忙状态。安装/更新/启停/组合修改使用同一代目录切换；先验证共享依赖与启动入口，空闲后停止接收新任务、flush、销毁、重启 Bun。FIA 保留窗口，客户端按 epoch 重建。后台启动失败回到上一有效组合；根 UI 成功渲染后通过 epoch 确认新代，未确认的布局不会覆盖回退点；布局失败可使用最小故障页或 `host.recover` 恢复。恢复默认组合保留已安装包和业务数据。

## 产品插件

- `fn-connections`：独立连接、受控凭证环境、Pi 登录和刷新、原版模型 adapter 注册及路由；连接固定 provider/端点/账号身份。
- `fn-session-sqlite`、`fn-session-controller`：原版 SessionPersistence、产品会话归属、持久接收去重、投影、模型切换、审批。原版 checkpoint policy 阻止未落盘的模型/工具副作用。
- `fn-chat`、`fn-chat-cards`、`fn-chat-cloudkit`：可选入口、持久卡片处理及 Chat v4 传输。执行过但未确认完成的副作用不自动重放。
- `fn-tool-file/process/native`：按 target 显式启用的工具，默认受控执行，取消传播到请求和进程组。
- `fn-models`、`fn-appearance`、`fn-plugin-manager/market`：各自持久模型选择、外观、组合与市场来源。
- `fn-ui-*`、`fn-app-update`：具体 UI 和 FIA 更新服务适配；没有宿主固定页面分支。

## 客户端与插槽

宿主只挂载 `root`，使用原版 `dsh-client-modules`、`ui-slots` 与 `ui-renderer`。FIA 适配认证资源传输和启动清单；模块索引用包名，`/client` 由上游正规化。React、Cordis 和基础 UI 共享单实例。没有自建 Slot 引擎或 Node HMR。

默认 `fn-ui-layout` 声明 sidebar.top/bottom、main、toolbar、status、overlay。`fn-ui-settings` 声明设置分类和内容；`fn-ui-chat` 声明消息、卡片及输入操作。声明方发布具体的 layoutSlots/settingsSlots/chatSlots 依赖，贡献方 inject，避免异步加载顺序引发未声明插槽。替换布局需提供同样的插槽/服务，或者连同其贡献组合一起替换。样式通过插件 effect 添加和撤销；共享基础样式是 `fn-ui-base`。`fn-ui-session` 为上游 renderer 提供必要的可选 Session scope 适配器；仅传输 Session ID，不将 Agent 对象带入浏览器。

FIA `APIRegistry` 按命名空间注册 contract/handlers，原子检查重复、实时更新 schema、撤销入口、取消并等待活动调用。`fn-rpc` 将其绑定到 Cordis effect。宿主仅静态声明 host 状态/恢复；前端依赖 `api:<namespace>`，后端撤销对应服务时贡献自动停用。`client(ctx, namespace, contract)` 使用泛型服务接口，没有全局业务 Bridge。

## 数据与升级

新根目录为 `plugins-v1`，Chat 使用独立 v4 zone 与本地目录。Session 是 Agent 历史的唯一来源；连接、卡片、同步队列、选择与主题分别由所属插件保存。无公开 KV，也没有读取旧目录、格式兼容或自动迁移分支。

运行目录回滚不等于数据库回滚；后续升级先用数据副本验证。共享内核与每个插件依赖安装目录不可变，整个依赖图固定版本；profile 和字节均参与 seed 身份。运行时禁止自动安装。上游发行家族整体升级，合同变化集中调整适配插件。历史 Git 标签、已发布附件和生产市场保持原状。

运行 seed 不重复携带 FIA CLI 的 `assets/` 原生二进制；FIAHost 与 Bun 由应用外层原生 runtime 提供，seed 保留 FIA JS 导出。CLI 构建工具在开发环境运行。
