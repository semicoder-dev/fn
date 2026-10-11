# 插件市场（开发中，未发布）

宿主不再携带或自动安装插件，首次进入应用中心。公开 0.4.1 仍采用内置翻译与随手记示例；本页描述后续开发契约，无旧 API 兼容或数据迁移层。

## 使用

应用中心分为插件市场、已安装。进入市场检查新版，用户逐个点击安装或更新；不会自动安装。可搜索、筛选市场、手动刷新，或在市场源中添加、重命名、启停、删除源。官方源也可删除，重启不恢复。市场删除不卸载插件。

从地址安装保留 npm spec、Git HTTPS/GitHub spec、本地 `.tgz` 绝对路径（含文件选择）。包必须预构建，安装脚本禁用；可信插件激活后可执行本机代码。手动安装的插件更新时需显式指定同包名、同 ID 的更高稳定版本，不自动关联市场。

市场插件绑定原市场 ID、URL 和包身份，不按同名跨源替换；源停用、删除、网络失败或插件下架后无法从该源更新，但已安装插件继续运行。需要换源时先卸载再从新源安装。卸载保留 KV 和运行历史。

## 静态索引 v1

索引 URL 为无凭证、无片段的 HTTPS 地址；重定向仍须 HTTPS。默认地址为 `https://raw.githubusercontent.com/semicoder-dev/malatang-plugins/main/marketplace.json`，仓库与线上索引尚未发布。

```json
{
  "schemaVersion": 1,
  "name": "示例市场",
  "plugins": [{
    "id": "my-plugin",
    "packageName": "@example/my-plugin",
    "name": "我的插件",
    "description": "一句话介绍",
    "icon": "记",
    "color": "#6e8169",
    "version": "1.0.0",
    "sdkVersion": "0.3",
    "url": "https://example.com/my-plugin-1.0.0.tgz",
    "sha256": "替换为实际归档的64位小写十六进制SHA-256"
  }]
}
```

每个 ID 仅一个稳定版本，版本为 `x.y.z`；首版没有预发布通道、降级、批量更新或私有市场认证。宿主最多配置 20 个市场，每个索引最多 1000 条、2 MiB，索引请求最长 15 秒；插件归档最多 50 MiB，获取与安装最长 120 秒，最多跟随 5 次重定向。

索引由后端获取并持久缓存。刷新失败保留上次成功结果及时间，各源独立报告错误。缓存可浏览，安装更新必须重新获取并核对条目、归档 SHA-256、包名、ID、版本及 SDK。哈希确认归档与索引相符，并不是作者签名。

## API / CLI

通过现有 `malatang call <method> --json '<input>'`（开发版使用 `bun run agent call`）：

- `marketplaces.list({})`：源、更新时间、错误、刷新状态和缓存条目数。
- `marketplaces.add({name,url})`、`update({id,name?,enabled?})`、`remove({id})`：配置源，URL 不可原位更换。
- `marketplaces.refresh({id?})`：刷新一个或全部启用的源。
- `marketplaces.catalog({marketId?,query?,offset?,limit?})`：缓存搜索，默认每页 20、最多 50，返回 `items/total/nextOffset`；条目含 `available/installed/update/incompatible/conflict` 状态。
- `plugins.installFromMarket({marketId,pluginId})`、`plugins.install({source})`、`plugins.update({pluginId,source?})`：立即返回任务，查询 `plugins.jobs` 取得终态。

任务含 `operation`、`targetVersion`。`plugins.list` 用可空 `market` 表达来源，不再含 `builtin`；`plugins.installExample` 删除。订阅 `marketplaces.changed` 与 `plugins.changed` 后读取快照；重连也重新读取。

## 更新与故障

在唯一暂存目录下载、验证，成功后才替换当前插件。运行中的模型任务、方法调用或生命周期切换阻止更新；更新切换期间阻止新调用和启停卸载。保留启停状态、KV 和历史，停用插件不激活新后端。新后端激活或持久化失败会恢复旧包和旧后端；无法恢复会明确报错。插件自行产生的外部副作用不属于包替换回滚范围。

成功更新使前端资源 URL 改变，释放旧页面与样式。未保存草稿不会保留，请先保存。文件切换以持久安装记录为准；进程在提交前中断时仍从旧记录启动，可能残留的未引用暂存目录不被加载。

## 官方仓库

官方插件独立维护于 `semicoder-dev/malatang-plugins`，翻译 `translate` 与随手记 `quick-notes` 保持原 ID。宿主构建、测试和 SDK 归档验证不依赖该仓库。正式索引只列已经发布并验收的归档；首次公开发行已获授权，归档和市场上线结果在发布手册及官方仓库记录；候选归档不等于已上架。
