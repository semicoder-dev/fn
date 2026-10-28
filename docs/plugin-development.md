# 插件开发（未发布契约）

先阅读 [SDK](../packages/sdk/README.md) 和[架构](cordis-runtime.md)。当前源码与公开 SDK 0.4.0 的 API 不同，开发消费本地生成且记录哈希的归档，不将候选作为公开安装默认值。

后端是普通 Cordis 插件：apply、Service、inject、Config、事件、effect。纯服务无需页面；纯前端只导出 `./client`；双端包同时导出两个入口。名称为 `@semicoder/fn-<能力名>`，实例 ID 在 profile 中设置。具体业务类型从所属插件导出，Agent/Session/Tools 从 dsh 导入。

插件按需 inject connections/sessionController/chat/cards/rpc 等具体服务。外部应用可注册自己的 session target、Chat 入口或命名空间 API，不使用 ctx.app/ctx.clientApp。接口由服务所有者定义，不能通过导入另一个产品页面实现复用业务。

前端按父插件声明的 typed Slot 注册贡献。布局可整体替换；新布局必须声明其贡献使用的插槽，并提供 layoutSlots 等相应依赖。UI、监听和样式通过 effect 清理，纯前端生命周期由独立 Cordis 根控制。后台禁用通过命名空间依赖使 UI 停用。

UI 使用 [fn-ui](../packages/ui/README.md) 提供的原版 dsh Button、Input、Menu、Modal 等控件，包声明精确 peer，由宿主共享。SDK 不再导出 UI。基础主题由 `fn-ui-base` 统一加载；页面使用 CSS Modules 与 `--dsw-*` 语义 token，不写全局控件样式、不引入另一套组件库或 Tailwind。Select 组合上游 Menu；配色覆盖和 FIA 标题栏同步由 `fn-ui-theme` 管理。模态框用 `data-modal-autofocus` 指定初始焦点，表单提交按钮明确 `type="submit"`。

`bun run styles:check` 校验旧依赖/token、原生替代控件、CSS Modules 与原样主题文件 SHA。主题快照仅因上游发行包缺少独立 CSS 导出而存在，来源固定在 `packages/ui/upstream/manifest.json`；升级需复核控件、主题和依赖闭包。还需实际检查浅/深色、菜单与弹窗键盘、窄窗口、插件撤销，不能用静态规则代替视觉验收。

安装阶段先验证 npm peer 与共享核心单实例，生成候选目录；运行阶段不安装依赖。配置修改使用 `plugins.configure`，支持完整条目或 bundles/patches；等待 fn-activity 空闲再重启。不直接修改活动目录。调试用 FIA 生成 schema 和浏览器入口，不启动旁路服务。

发布不属于日常开发。三个旧测试插件已从本地官方市场删除，回归夹具仅位于测试目录，不上架。
