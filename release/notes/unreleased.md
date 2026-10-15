# 待发布改动

## fn 全面更名（已归集至 0.4.4 候选，待正式验收）

2026-10-15 用户授权依次发行，版本说明见 [0.4.4](0.4.4.md)。以下保留更名阶段的来源与验收事实，正式发布完成后移出待发布清单。

- 来源：应用基线 cc183e1，特性分支 codex/rename-fn；本条随完整更名实现提交，来源可通过本文件 Git 历史定位。应用保持 0.4.3 / build 7，SDK 0.3.2 / manifest 0.3，FIA 0.18.0。
- 名称与身份：显示名 fn、com.semicoder.fn、fn / fn-dev / fn-preview；包名 @semicoder/fn-sdk、清单 fn、fnStyleExceptions、`__FN_BRIDGE__` / `__FN_MODULES__`；应用/SDK/插件/CI/发布配置全部同步。
- 无旧名兼容、旧 manifest 回退、旧 URL 重定向或数据迁移；更新历史独立使用 `fn-updates-site`，保留旧更新分支；新身份使用独立数据目录，不读取或删除旧应用数据。旧公开标签与产物保持不变。
- 官方插件本地仓库改为 fn-plugins，固定 vendor SDK 归档独立构建；本地市场索引为空，仅生成未发布候选。新 GitHub 仓库名称、npm SDK、DMG、更新源、市场和官网均未发布。
- 官网：content/projects/fn，/fn、project-fn / docs-fn-*；当前提供本地源码与插件归档步骤，历史证据保留旧名。网站未推送或部署。
- 验证：应用完整 check、99 项测试、build、实际 SDK npm:pack 独立消费；框架 77 CLI / 48 Swift；官方插件干净目录安装及 check/test/pack/index:check；Dev 真实安装、两插件页面、KV 保存/刷新、模型缺失校验；Preview 数据隔离、三种 bundle 身份、正式包隔离 smoke 通过。官网 check、51 单元 / 12 Workers、build、38 页面及搜索检查通过。
- 2026-10-15 补充验收：源码 a304dfa 的 fn Dev 由用户完成独立官方 OAuth，实时目录 7 个模型；官方译文归档以 GPT-6-Luna 完成一次真实调用，事件、后台终态与页面一致，demo:false。正常退出重启后账号、模型和结果保留；新凭证目录 0700 / 文件 0600，未读取或迁移旧数据。
- 边界：令牌刷新/撤销、其余模型、正式 fn 签名公证仍未验证。远端只读预检确认旧仓库与发布环境存在，CLI GitHub/npm 认证均 401；新仓库、SDK、更新源及官网入口仍未上线。后续发布须明确授权，先完成仓库更名、新 SDK 公开验收、插件新版本与索引，以及新身份独立更新站，再发布完整 DMG 与官网；不复用已公开标签。

## 历史公开版本

2026-10-11 原名麻辣烫应用 **0.4.3 / build 7**、旧 SDK **0.3.2** 和旧名官方插件 **0.1.1** 已发布。它们不代表 fn 已发布，原始证据见 [0.4.3](0.4.3.md)、[应用发布手册](../../docs/github-release.md)与[SDK 发布手册](../../docs/npm-release.md)。日常开发不升版本，下一次版本在明确发行时确定。
