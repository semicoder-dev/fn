# Fn

Fn 是一个本地多应用平台。桌面卡片显示应用状态，点击后打开独立窗口；翻译、笔记和看板各自拥有页面与 Bun 后台。宿主统一管理模型、标准 UI、小组件、安装更新。手机文字中转保留为开发预览。

桌面顶部只有一行搜索、整理桌面和添加应用。底部 Dock 常驻应用、通知和设置，点击以弹窗打开；运行中的普通应用排在竖线另一侧，支持打开、聚焦和关闭。模型连接位于设置；手机入口仅在开发构建中显示。

当前公开版本为 Fn 0.7.0 / SDK 0.6.0 / Fn UI 0.1.0。[下载安装包](https://semicoder.dev/fn/docs/installation)，或从源码运行。产品显示名称为 Fn；包名、目录、CLI 和应用 ID 使用小写。

## 本地运行

需要 macOS 14+ Apple Silicon、Bun 1.4.4 和 Xcode/Swift 6。框架源码位于 `framework/fia/`；根目录安装依赖。

```sh
bun install --frozen-lockfile --ignore-scripts
bun run dev
# 打包代码的隔离预览
bun run run
# 构建本地安装包
bun run build --dmg
```

Dev、Preview、正式构建分别使用独立身份和数据目录。验收使用隔离预览；构建不表示发布，也不替换日常应用。

`bun dev` 与 `bun run dev` 等价，启动后进入 Fn 桌面；终端需保持运行，按 Ctrl-C 退出。开发网关的本机通信自动直连，使用 HTTP 代理时无需关闭代理或手动修改 `NO_PROXY`。

首次进入桌面后，点击 Dock 的「应用」，加载官方市场并安装翻译、笔记和看板 0.2.0。开发应用也可在「应用中心 → 本地安装」选择独立 `fn-plugins` 仓库打包的 `.fn.tgz`：

- `plugins/translate/fn-translate-0.2.0.fn.tgz`
- `plugins/notes/fn-notes-0.2.0.fn.tgz`
- `plugins/kanban/fn-kanban-0.2.0.fn.tgz`

安装后点击桌面卡片打开应用。笔记和看板可以直接使用；翻译需先在「设置 → 模型」登录 ChatGPT 并选择默认模型。标题栏右侧「在浏览器中打开」可打开同一开发实例的浏览器界面。

## 应用与数据

- 打开启动后台，重复打开聚焦窗口；最小化继续运行，关闭应用停止其后台和受管理进程组。
- 关闭桌面窗口隐藏桌面；退出 Fn 停止全部应用。重启恢复桌面布局和小组件快照，应用保持关闭。
- 浏览器与原生窗口连接同一真实宿主。关闭浏览器标签只断开该视图并取消所属请求；显式关闭应用才停止后台。
- 业务数据位于宿主提供的应用专属目录，由应用使用 Bun SQLite 或文件管理；代码安装目录不可写。
- ChatGPT 官方账号在设置中授权，宿主持有凭证，应用使用 OpenResponses。工具与 Agent loop 由应用实现。
- 开发构建中的手机按桌面和应用发送文字。关闭的应用不会被消息唤醒；启动后处理等待消息。真机验收状态见验收记录。

三个官方应用在独立 `fn-plugins` 仓库构建，宿主构建不依赖它。没有后台或没有自定义页面的应用也可安装。

## 开发与验证

```sh
bun run check
bun run test
bun run framework:check
bun run framework:pack
bun run framework:verify
bun run npm:check
bun run npm:pack
```

Bun 负责构建、测试、依赖、归档及格式化，`bun run format` 使用 `bun fmt`。前端以同一 Bun 构建路径进行开发和生产构建；开发修改重建并刷新页面，不保留 React 内存状态。

- [架构与生命周期](docs/architecture.md)
- [应用定义与 SDK](docs/plugin-development.md)
- [小组件](docs/widgets.md)
- [安装更新](docs/plugin-marketplace.md)
- [验收与未验证项目](docs/ui-validation.md)
- [手机开发](clients/apple/README.md)
- [FIA 联调](docs/fia-integration.md)
- [发布流程](docs/github-release.md)
