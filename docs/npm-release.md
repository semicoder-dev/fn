# SDK/UI 归档与发布

SDK 0.6.0 与 UI 0.1.0 为同批契约。应用安装这两个精确 npm 版本，UI 通过 peer 复用应用安装的 SDK。Bun 1.4.4 是统一工具链。

本地运行 `bun run npm:check && bun run npm:pack`。`artifacts/sdk/manifest.json` 记录摘要归档，`artifacts/npm/` 保存可发布文件。临时目录独立安装 SDK/UI、React，检查类型、禁用依赖、前后台构建，不使用 overrides。

准备版本使用 `bun run version:sdk <sdk-version> <ui-version>`，同步 CLI init 模板和示例。提交并检查后，由 `sdk-v<SDK版本>` 标签触发 `publish-npm.yml`：macOS 构建验证两包，npm 环境通过 OIDC 顺序发布 SDK/UI。手动工作流只构建归档，不发布。

首次创建 UI 包需维护者完成 npm 登录及双重验证，发布同一 CI 归档后配置受信任发布者：GitHub `semicoder-dev/fn`、`publish-npm.yml`、环境 `npm`。已存在版本必须与归档的 registry integrity 一致；失败重试不得覆盖公共版本。发布后独立下载摘要核对，并从公开 registry 创建新应用消费。

插件发行归档冻结运行依赖，宿主安装不执行依赖脚本。

## 0.6.0 / 0.1.0 发行证据

`sdk-v0.6.0` 固定 `22615f4`，Actions `41217989599` 成功。SDK 0.6.0 经真实 OIDC 发布并带 provenance；UI 0.1.0 首包经维护者安全验证发布相同 CI 归档，未生成 provenance。公开下载与 CI 归档逐字节相同；三个官方应用和 CLI 新建示例已在仓库外使用公开 npm 安装、检查与打包。

UI 受信任发布者已保存，但首次真实 OIDC 发布尚未验证，幂等重试跳过已存在版本不算验证。npm 当前显示 Pending validation，未使用的配置将在 2026-11-02 16:11 UTC 到期；下次 UI 发版前须检查并按需要重建同一精确配置，再用实际新版本验收，不重写已公开版本。
