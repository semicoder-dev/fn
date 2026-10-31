# Fn 发布流程

开发、测试、提交和合并均不自动发布。只有用户明确要求发布，才准备版本、build、签名、标签、推送和部署。日常改动汇总到 `release/notes/unreleased.md`，不修改版本号。

1. 完成根检查、测试、FIA 独立消费、SDK/UI 独立消费、官方应用检查打包，以及隔离浏览器/原生验收。
2. 核对 `release/config.json`、产品显示名称 Fn、Bun 1.4.4、原生运行时摘要及禁止依赖扫描。
3. 经授权准备应用与 SDK/UI/官方应用版本；不得覆盖已公开版本或标签。
4. 在 macOS runner 生成完整 DMG，验证深签名、公证、Gatekeeper、镜像和隔离启动退出。CloudKit 使用相应 entitlement、profile 与容器，不能用普通 ad-hoc 包证明真机通信可用。
5. 仅在本次授权内发布 GitHub Release、应用更新清单、npm、应用市场；逐一验证实际下载摘要和独立消费。
6. 同步 Semicoder 文档与安装入口，分别记录源码、归档、公开产物和网站部署。推送 Semicoder main 会部署，不包含在普通开发授权中。

工作流：`ci.yml` 验证测试 DMG；`release.yml` 管理应用签名和发布；`publish-npm.yml` 验证/发布 SDK 归档。手机单独按 `clients/apple/README.md` 构建与真机验收，不因模拟器构建通过而标记完成。

签名准备见 [Apple 配置](apple-signing-setup.md)，npm 见 [SDK/UI 归档](npm-release.md)。历史发行证据由 Git 标签、Release 和 workspace 会话记录保存。
