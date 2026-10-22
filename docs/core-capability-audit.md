# 全插件化候选能力核对

2026-10-22，本地未发布。公开应用仍为 0.5.2；本表覆盖本次源码，不代替真机/生产环境验收。历史发行证据见 `v0.5.2` 标签及 [发行记录](github-release.md)。

| 能力                              | 当前归属与证据                                                                                        | 边界                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 紧凑侧栏、二级设置、布局替换      | fn-ui-layout/settings/navigation，原版 Slots；真实浏览器挂载、切页、替换/故障恢复                     | 默认布局可被 profile 整体替换                                   |
| 多 provider、多连接、API Key/订阅 | fn-connections/models，原 Pi adapter；模拟并发隔离、刷新、流式取消、重放合同                          | 新 OAuth 登录、过期刷新、真实第二账号未验证                     |
| 主题、原生外观、更新              | fn-ui-theme/appearance、fn-app-update/ui-updates；浏览器主题与更新状态通过，FIA 更新合同保留          | 未下载或安装新发行包                                            |
| 插件安装、启停、更新、卸载        | fn-plugin-manager/market；真实纯服务/前端/双端夹具安装、空闲重启和坏候选回退，归档/依赖合同           | 本地市场为空，生产旧市场未变；新协议不读取旧索引                |
| 配置装配与依赖生命周期            | 原 Loader/Include，profile/bundle/patch；禁用/撤销/初始化失败、嵌套同名贡献与异步清理                 | 同一 Loader tree 的 ID 唯一；target 的独立子树可使用相同局部 ID |
| 会话、审批、后台任务              | 原 dsh Session/AgentLoop + fn-session-*；SQLite 故障阻止工具副作用、恢复不重放，浏览器审批后写文件    | 关闭页面不终止任务；进程工具仍为可信本机执行                    |
| Chat、卡片、模型筛选、离线去重    | fn-chat/cards/cloudkit + Apple Chat v4；桌面卡片、Swift 队列/投影/卡片测试与手机编译                  | v4 CloudKit schema 未部署，设备/多端通知定位未实测              |
| UI/SDK                            | 标准 npm exports/Cordis；原模块 factory 和 renderer，样式 effect 清理、资源 URL、SDK 真实独立归档消费 | 不保留旧 SDK、应用 Bridge、keepAlive 元数据；状态由插件自己管理 |
| KV、web fetch/search、测试应用    | 从活跃宿主/SDK/seed/本地市场移除                                                                      | 不提供替代插件，不修改 agent-webtool 独立项目                   |

完整命令、性能范围与未验证项见 [验证记录](runtime-validation.md)。本轮按用户要求本地提交，无升版、推送、签名发行、TestFlight 上传或部署。
