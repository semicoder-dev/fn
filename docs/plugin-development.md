# SDK 0.3 开发契约与插件 CLI

fn 使用 `@semicoder/fn-sdk`；应用与 SDK 发行状态分别见对应发布手册。manifest 使用 `fn` 字段和 `sdkVersion: "0.3"`，不接受旧清单。完整接口见 [SDK README](../packages/sdk/README.md)。

开发者使用 Bun >=1.4.2。先运行 `bun run dev`，再运行 `bun run agent plugin create /tmp/my-plugin --template notes`（或 model）。进入生成目录执行 `bun install --ignore-scripts`、`bun run check`、`bun run build`、`bun run pack`。项目携带 SDK 归档，支持仓库外开发。

## 构建与职责

- `sdk:styles` 编译 SDK 公共 CSS；sdk:snapshot、npm:pack 在打包前准备样式。SDK 归档包含源码、编译 CSS、主题映射、CLI 与两种模板。
- 插件 Tailwind 扫描自身 src，使用 p: 前缀；AST 处理选择器、内部变量、@property 和动画名，隔离页面和 Portal。其余自定义 CSS 使用 Modules。
- 宿主 Vite 集成官方 Tailwind 插件，只加载一次 Preflight；前端共享 React/ReactDOM/Base UI 与 SDK 组件。禁止插件直接导入底层实现。
- 应用命令仅导入轻量 create/help；check/build/pack 使用开发项目里的 SDK 和 Bun，Tailwind 编译器不会作为应用运行依赖。
- build 失败清除 dist，pack 只输出清单和完整 dist 并解包验收；模型、账号、KV、历史的标识和数据不迁移。

开发设置的基础组件页覆盖主题、三档尺寸、表单、菜单、对话框、通知和隐藏页面生命周期；正式构建隐藏入口。`bun run npm:pack` 验证真实归档的独立消费。

FIA 仅提供运行时和受管命令，沿用[共仓开发](fia-integration.md)。名称重构不改变框架契约；FIA 独立 npm 继续暂停。

## 插件市场

官方插件已迁到独立 fn-plugins 仓库；宿主仅保留 SDK 模板与开发 CLI，不打包插件。第三方可托管 HTTPS 索引和预构建归档，协议、哈希、来源绑定与更新行为见[市场契约](plugin-marketplace.md)。官方插件以独立版本发行，公开归档验收后才上架。

## Agent 开发接口（未发布）

宿主可执行多步模型/工具循环，插件通过前后端 `agents` API 使用；自定义工具由 `defineTool` / `BackendPlugin.tools` 显式声明。已有 notes/model 模板及旧文本调用保持可用，不自动启用 Agent。新插件需使用包含本次改动的宿主生成的 SDK 快照，公开 0.3.5 尚无该接口；方法、消息、历史恢复和取消见 [Agent 文档](agents.md)。

## SVG 插件图标（开发分支，未发布）

此能力需要包含本次 SVG 改动的开发宿主及其固定 SDK 归档；公开 fn 0.4.5 / SDK 0.3.5 不识别新增字段。manifest 的 schemaVersion / sdkVersion 仍为 1 / 0.3，旧文字图标继续可用。

在 `src/icon.svg` 放置带 `xmlns="http://www.w3.org/2000/svg"`、viewBox 和透明背景的单色 SVG；推荐 24 × 24 图形，使用 currentColor。文件最多 8 KiB（UTF-8 字节），必须位于项目内，不能通过软链接访问包外资源。清单中保留 `icon` 文字作为回退，并声明：

```json
{ "icon": "记", "iconSvg": "dist/icon.svg" }
```

`check` 检查源图标，`build` 自动复制为 `dist/icon.svg`，`pack` 包含并验证该文件；模板已默认提供。清单只接受固定包内路径，不接受 SVG 源码或远程 URL。声明文件缺失、超限或不含 SVG 根元素时检查/安装失败；图片解码和显示阶段加载失败时显示文字。

宿主侧栏与应用中心通过图片和 CSS mask 使用当前位置的前景色，不保留 SVG 原色，不把源码插入宿主 DOM。应用中心保留插件色块；停用或后端启动失败时仍可显示已验证的声明图标。`PluginInfo.iconURL: string | null` 提供带版本标识的宿主资源 URL。fn Chat 仍使用原 `icon` 文字，不传输 SVG。
