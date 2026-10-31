# 应用安装与更新

应用中心管理官方市场、自定义市场和本地 `.fn.tgz` 包。市场使用 JSON schema 1，记录应用 ID、版本、名称、说明、归档地址和 SHA-256。自定义源必须为 HTTPS；开发实例允许 loopback HTTP。

默认官方源为 `https://semicoder-dev.github.io/fn-plugins/applications.json`。本地验收在 fn-plugins 运行 `bun run market:local`，添加输出的地址，或直接安装打包文件。正式市场只记录经过版本与 SHA-256 校验的 GitHub Release 归档；下载允许经逐跳校验的 HTTPS CDN 跳转。

下载后先校验，再切换不可变代码目录。更新运行中的应用时需要确认关闭，活动任务会中断；更新完成可重新打开。其他应用继续运行。浏览器旧视图失效，重载后绑定新运行代。

下载、摘要、身份或资源校验失败不会替换安装记录。数据目录与代码目录分离，更新和卸载保留业务数据。安装不运行脚本，也不从网络解析运行依赖。

开发实例由 `fn plugin dev . --browser` 管理，独立于普通已安装实例。该命令退出会停止并移除开发注册，保留开发业务数据。
