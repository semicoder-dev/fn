# 应用列表与动态摘要

每个已安装应用在首页固定显示一行。宿主控制图标、名称、运行状态、更新时间、菜单和键盘焦点；点击整行或 Enter 打开应用。搜索直接过滤列表，「排序」支持拖动和上下按钮，聚焦行后 Alt+↑/↓ 调整顺序。所有应用始终在列表中，不设置隐藏或卡片尺寸。

应用声明可选 `contributes.summary: {initial: "summary/initial.json"}`；initial 可省略。动态发布需后台入口和 `application.summary` 能力。摘要使用受限 JSON，宿主渲染，不执行 HTML、React、CSS、脚本或 iframe。

```json
{
  "version": 1,
  "text": { "key": "summary.text" },
  "detail": "最近一次操作",
  "metrics": [{ "value": 12, "label": { "key": "count" } }],
  "badges": [{ "text": "待处理", "tone": "warning" }],
  "progress": { "value": 0.75, "label": "完成进度" },
  "sparkline": { "values": [1, 3, 2, 5, 4, 7], "tone": "success" }
}
```

除 version 外均为可选字段；metrics 最多三个、badges 最多两个、progress 为 0–1、sparkline 为 2–120 个有限数值。tone 可为 neutral/success/warning/danger。文字接受字符串或 `{key,args}`，单段最多 4000 字符，指标字符串最多 100 字符；整个快照最多 16 KiB UTF-8 JSON。未知字段、任意布局及非法值被拒绝。

文字最多显示两行、detail 一行；宽窗横向排列，窄窗摘要下移、指标换行并隐藏趋势图。行内不提供业务按钮或表单，完整内容进入应用查看。

```ts
await host.application.setSummary({ version: 1, text: "已保存", metrics: [{ value: 12 }] });
await host.application.setSummary(null); // 清除动态内容，回退到包内初始摘要或应用描述
await host.application.notifyDataChanged(); // 独立通知当前运行代的所有应用视图
```

每次 setSummary 完整替换，省略字段即删除旧字段；只允许拥有能力的本应用后台调用。发布按实例串行、运行代校验、原子写入独立摘要文件，成功后通知首页；不重写平台配置、不触发页面数据事件。写入失败保留最后有效摘要；业务数据提交不能以摘要更新成功作为成功条件，应用应分别处理派生展示失败。

页面通过 `view.addEventListener("dataChanged", refresh)` 订阅业务变更，重连后重新读取数据。notifyDataChanged 仅通知本实例当前运行代，不能跨应用；事件不持久化、不用于可靠业务投递。

关闭或重启后显示最后摘要和停止状态，不自动启动后台。首次打开前使用初始摘要；没有声明时显示应用描述。更新应用包清除派生摘要，回退到新包初始内容；业务数据不受影响。

```sh
fn plugin summary summary/initial.json
fn plugin summary summary/initial.json --preview
fn plugin summary summary/initial.json --preview --url
```

预览复用真实应用行和 renderer，可切换主题、语言、运行状态；自动读取所在应用名称/词条，文件修改自动刷新。修改清单后重新启动；Ctrl-C 结束预览。`--url` 输出一次性授权链接，不要写入共享日志。
