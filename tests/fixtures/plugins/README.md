# 仅用于验收的插件

三个私有夹具覆盖纯服务、纯前端、双端插件、任务登记、API、资源/CSS、卡片、布局替换和启动故障。使用 SDK `packPlugin` 构建，仅在隔离应用数据目录安装；不登记市场、不发布。配置 `service.fail` 注入后端启动失败；`client.layout` 替换布局，`client.failRender` 注入前端渲染失败。
