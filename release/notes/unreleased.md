# 待发布改动

日常开发不改版本或 build，完成的功能与修复继续归集于此；仅用户明确要求后按 [发布手册](../../docs/github-release.md) 准备下一版本。

2026-10-11，原清单全部选定内容已随应用 0.4.1 / build 5 和 SDK 0.3.0 公开发行，说明归档于 [0.4.1](0.4.1.md)。公开产物及独立消费验收通过，证据见 [应用发行](../../docs/github-release.md) 与 [SDK 发行](../../docs/npm-release.md)。官网内容已合入并推送，生产部署验收由 workspace 发布记录单独跟踪，不将其等同于应用已发布。

2026-10-11 用户已授权本轮发行，以下内容冻结为应用 0.4.2 / build 6、SDK 0.3.1 和官方插件首次发行，说明见 [0.4.2](0.4.2.md)。完成公开验收后归档本清单；FIA 独立 npm 继续暂停。

## 主题切换入口统一

- 来源：2026-10-11 用户要求；实现提交 `f74b85b`，分支 `codex/settings-theme-only`，基线 `181f5d6`。
- 行为：删除侧栏主题按钮与专用浮层，主题模式和配色统一在「设置 → 外观」切换；侧栏底部保留应用中心与设置。清理专用样式及 ActivityButton 不再使用的提示禁用分支。
- 兼容：不改应用版本 / build、SDK、FIA、主题 API 或数据结构，无迁移要求。
- 验证：check（含框架 CLI / Swift）、85 项应用测试、build 通过；ego-browser 确认侧栏只保留应用中心 / 设置，设置页浅色、深色、跟随系统切换及刷新持久化通过，已恢复原浅色偏好；官网 content / docs / 格式检查、生产 build 与 31 个静态页面检查通过。首次受沙箱监听限制，放开本地验证权限后完整重跑通过；框架已有 no-useless-escape 警告未改动。原生窗口未单独目视验收。
- 官网：第一次使用指南及来源记录同步，明确此调整尚未发布、公开 0.4.1 仍有快捷按钮；安装入口保持已公开版本，未推送或部署。

## 插件市场与独立官方插件

- 来源：2026-10-11 用户确认完整方案；本地未提交实现分支 `codex/plugin-marketplace`，基线 `380ee16`。官方插件独立仓库 `malatang-plugins` / `codex/official-plugins`，官网 `codex/plugin-marketplace-docs`。
- 行为：取消内置翻译与随包随手记，首次进入应用中心；所有插件自主安装。新增静态 HTTPS 多源市场、缓存搜索分页、源管理、SHA-256 核验、绑定原来源的手动更新与失败恢复；保留 npm/Git/本地包入口。
- 契约：删除 `builtin` 和 `plugins.installExample`，新增 `marketplaces.*`、`plugins.installFromMarket/update`，插件记录增加包身份/版本/来源，任务增加 operation/targetVersion。开发阶段无旧接口兼容或迁移；不会主动清除模型、凭证、KV 或历史。应用、SDK、FIA 版本及 build 不变。
- 工程：翻译、随手记迁到独立仓库，固定使用公开 SDK 0.3.0；宿主构建仅保留 SDK 开发资源，归档消费改用模板与独立后端 fixture。官方索引目前为空，候选归档未上架；发布工作流先验收公开归档，再提出索引 PR。
- 验证：宿主完整 check（框架 77 项 TypeScript、48 项 Swift）、97 项应用测试、build、SDK 归档独立消费；市场/更新失败回归、真实原生文件选择/安装/笔记保存、浏览器共享 KV 与市场 UI 回归；官方插件独立 check/test/pack、翻译离线 UI 回归，工作流 actionlint 均通过。最终计数和细节见 workspace `docs/agent/sessions/2026-10-11-plugin-marketplace.md`。
- 官网：插件、开发、首次使用、自动化及来源记录补充未发布说明，公开 0.4.1 安装入口保留。未推送、发布或部署；真实官方远端建仓、GitHub 发布流程和线上市场安装更新仍待发布授权。
