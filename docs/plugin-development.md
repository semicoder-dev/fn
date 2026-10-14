# SDK 0.3 开发契约与插件 CLI

fn 与 `@semicoder/fn-sdk` 当前为本地开发、尚未发布；manifest 使用 `fn` 字段和 `sdkVersion: "0.3"`，不接受旧清单。完整接口见 [SDK README](../packages/sdk/README.md)。

开发者使用 Bun >=1.4.2。先运行 `bun run dev`，再运行 `bun run agent plugin create /tmp/my-plugin --template notes`（或 model）。进入生成目录执行 `bun install --ignore-scripts`、`bun run check`、`bun run build`、`bun run pack`。项目携带 SDK 归档，支持仓库外开发。

## 构建与职责

- `sdk:styles` 编译 SDK 公共 CSS；sdk:snapshot、npm:pack 在打包前准备样式。SDK 归档包含源码、编译 CSS、主题映射、CLI 与两种模板。
- 插件 Tailwind 扫描自身 src，使用 p: 前缀；AST 处理选择器、内部变量、@property 和动画名，隔离页面和 Portal。其余自定义 CSS 使用 Modules。
- 宿主 Vite 集成官方 Tailwind 插件，只加载一次 Preflight；前端共享 React/ReactDOM/Base UI 与 SDK 组件。禁止插件直接导入底层实现。
- 应用命令仅导入轻量 create/help；check/build/pack 使用开发项目里的 SDK 和 Bun，Tailwind 编译器不会作为应用运行依赖。
- build 失败清除 dist，pack 只输出清单和完整 dist 并解包验收；模型、账号、KV、历史的标识和数据不迁移。

开发设置的基础组件页覆盖主题、三档尺寸、表单、菜单、对话框、通知和隐藏页面生命周期；正式构建隐藏入口。`bun run npm:pack` 验证真实归档的独立消费。

FIA 仅提供运行时和受管命令，沿用[共仓开发](fia-integration.md)。本次名称重构不改变框架契约，不自动发布应用、SDK、FIA 或网站。

## 插件市场（未发布）

官方插件已迁到独立 fn-plugins 仓库；宿主仅保留 SDK 模板与开发 CLI，不打包插件。第三方可托管 HTTPS 索引和预构建归档，协议、哈希、来源绑定与更新行为见[市场契约](plugin-marketplace.md)。宿主与 SDK 版本暂未调整。
