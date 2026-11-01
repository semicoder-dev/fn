# Fn 应用平台架构

FIA 维护 Bun 工具链、本机网关、浏览器授权、原生窗口、动态状态栏、进程组和 CloudKit 传输。Fn 维护应用平台、模型、桌面、应用摘要、公共 UI 和消息路由。应用拥有业务、数据和 Agent loop；手机是文字入口。

桌面使用单行搜索、排序和添加应用工具栏；应用中心、通知、设置是 Dock 常驻入口，以宿主弹窗呈现。运行中的普通应用在竖线另一侧，使用 FIA 独立窗口。模型和手机连接位于设置，手机消息从手机连接页打开。

首页按安装实例显示唯一行，全部已安装应用可见；固定区域呈现动态摘要，关闭保留缓存。详情见[应用摘要](summaries.md)。

## 运行实例

每个已安装应用至多一个普通运行实例。开发实例以 `dev-` 身份隔离，数据独立。有后台的实例启动一个内置 Bun 进程；纯前端不启动进程。页面、摘要发布和聊天处理共用该后台。

状态为 `closed / starting / running / minimized / stopping / failed`。启动有就绪期限，失败不自动重试；重复打开共用启动 Promise。关闭先取消调用、标记执行中手机消息中断、使视图失效，再通知后台清理；三秒后按超时策略终止整个进程组。原生关闭有活动任务或未保存内容时需要确认。

进程是生命周期和故障边界。应用按可信本地代码运行，不提供 OS 沙箱。宿主不提供通用业务 KV、Agent Session 或 Agent loop。

## 传输与身份

所有通信共用 FIA loopback 网关。HTTP JSON 承载方法，SSE 承载流，WebSocket 承载事件、后台注册和调用分发。后台主动连接，不监听端口。SDK 不依赖 Bun IPC。

FIA 负责浏览器/原生会话；Fn 的调用身份绑定应用实例、随机运行代和视图。后台凭证仅通过启动环境引导，页面只得到视图凭证。更新或停止后凭证失效，陈旧页面必须重载。视图断开会取消其请求与未决确认，不停止后台独立任务。

请求取消一路传播到后台 AbortSignal 和真实模型 fetch；流采用有界队列和消费确认。HTTP/SSE 的终态不能用“连接已关闭”代替成功。

## 安装与存储

平台数据根为 `context.app.dataDirectory/platform`：`platform.json` 保存安装、应用顺序、偏好和通知，`summaries/` 独立保存按实例隔离的派生摘要，`chatgpt-auth.json` 保存受限授权资料，`applications/` 为带摘要的不可变代码，`data/<instance>/` 保存业务数据、缓存和日志，`relay/` 保存按账号隔离的手机队列。

代码与业务数据分离。安装验证摘要、身份、相对路径、归档大小、构建描述、入口和资源。切换前要求目标应用已关闭；其他应用继续运行。安装不运行依赖脚本。宿主启动不会读取、迁移或删除其他产品数据。

## 模型

宿主实现官方 ChatGPT PKCE 登录、OIDC 身份验证、动态客户端注册、账号目录、原子凭证刷新和撤销。凭证文件权限为 0600。应用只得到连接 ID 和账号可用模型目录。

公开请求和事件使用 OpenResponses；连接 ID、身份与 AbortSignal 在调用上下文中。请求必须显式提供完整 input 数组，`store:false`、`stream:true`。不支持的参数直接报错；成功必须收到 `response.completed`，失败、未完成、额度和流中断分别处理。应用负责工具结果和下一次请求。

来源：[OpenResponses](https://www.openresponses.org/specification)、[官方授权](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)、[模型与调用](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)。

## 手机开发预览

正式桌面版本不显示手机入口、不自动连接 CloudKit，并拒绝 phone-connect；仅开发构建提供文字中转。生产手机版本另行发布。

CloudKit private database 按账号和环境隔离。消息有稳定 ID，宿主先持久化再执行；重复投递不重复执行。应用关闭时状态为 waiting，不唤醒；启动后领取。执行时关闭、崩溃或宿主重启变为 interrupted，不自动重放。

回复先提交本地 outbox，再写 CloudKit。只同步完整回复；长回复在完成后按有界记录分块，手机收齐后展示。状态和正文到达顺序可以不同。游标、系统字段、冲突与补送由同步层处理，推送只作为拉取提示。首个聊天入口为翻译。
