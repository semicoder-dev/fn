# Fn

使用平台管理本地应用、模型与消息。先读取 help/schema 与 platform.command state。打开应用使用 open，关闭使用 close；busy 时应说明任务或未保存内容并取得用户意图后再 force。窗口最小化不会停止后台。

插件开发使用 plugin init/check/build/pack/dev。开发实例单独隔离，修改会中断任务，不自动重放。模型授权由用户在官方登录界面完成，不读取或输出宿主凭证文件。手机等待消息不会自动启动关闭的应用。

首页每个已安装应用一行，按顺序展示动态摘要；plugin summary 校验/预览结构化快照。新应用采用 hostApi 2，setSummary 与 notifyDataChanged 各自负责摘要和页面刷新。旧契约应用需更新包，不能运行；不清空业务数据。
