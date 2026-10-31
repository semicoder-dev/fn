# SDK/UI 归档与发布

SDK 0.6.0 与 UI 0.1.0 为同批契约。应用安装这两个精确 npm 版本，UI 通过 peer 复用应用安装的 SDK。Bun 1.4.4 是统一工具链。

本地运行 `bun run npm:check && bun run npm:pack`。`artifacts/sdk/manifest.json` 记录摘要归档，`artifacts/npm/` 保存可发布文件。临时目录独立安装 SDK/UI、React，检查类型、禁用依赖、前后台构建，不使用 overrides。

准备版本使用 `bun run version:sdk <sdk-version> <ui-version>`，同步 CLI init 模板和示例。提交并检查后，由 `sdk-v<SDK版本>` 标签触发 `publish-npm.yml`：macOS 构建验证两包，npm 环境通过 OIDC 顺序发布 SDK/UI。手动工作流只构建归档，不发布。

首次创建 UI 包需维护者完成 npm 登录及双重验证，发布同一 CI 归档后配置受信任发布者：GitHub `semicoder-dev/fn`、`publish-npm.yml`、环境 `npm`。已存在版本必须与归档的 registry integrity 一致；失败重试不得覆盖公共版本。发布后独立下载摘要核对，并从公开 registry 创建新应用消费。

插件发行归档冻结运行依赖，宿主安装不执行依赖脚本。
