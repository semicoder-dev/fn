# 小组件

小组件为 `{version:1,body:node}` JSON。宿主统一渲染，不加载 React、JavaScript、HTML、任意 CSS 或 iframe。整张卡片打开应用，首期不提供业务按钮和表单。

```json
{"version":1,"body":{"type":"column","gap":"md","children":[{"type":"text","text":{"key":"summary.title"},"variant":"title"},{"type":"metric","value":12,"label":{"key":"summary.count"}},{"type":"progress","value":0.75},{"type":"sparkline","values":[1,3,2,5,4,7],"tone":"success"}]}}
```

| type | 字段 |
| --- | --- |
| row / column / list | children，gap 为 xs / sm / md |
| text | text，variant 为 title / body / caption |
| metric | value，label 可选 |
| badge | text，tone 为 neutral / success / warning / danger |
| progress | value 在 0–1，label 可选 |
| divider | 无额外字段 |
| sparkline | values 为 2–120 个有限数，tone 可选 |

文本使用字符串或 `{key,args}` 词条引用。结构限制为 128 节点、8 层深度、每组最多 32 子节点、序列化大小 65536 字符。非法快照被拒绝，最后有效快照不变。

每个声明的小组件有一个默认实例。在 fn.app.json 中直接声明固定的网格尺寸：

```json
{
  "id": "summary",
  "size": "2x2",
  "initial": "widgets/summary.json"
}
```

size 为必填的“列数x行数”字符串，列数和行数均为 1–4，可任意组合，例如 1x1、2x2、3x1、4x4。每个小组件只有一个固定尺寸，由插件决定；缺失值、数组、非整数及超出范围的尺寸被拒绝。

| 尺寸 | 网格占用 | 基准尺寸（未分配余宽） |
| --- | --- | --- |
| 1x1 | 一列一行 | 240 × 240px |
| 2x1 | 两列一行 | 492 × 240px |
| 1x2 | 一列两行 | 240 × 492px |
| 2x2 | 两列两行 | 492 × 492px |
| 3x1 | 三列一行 | 744 × 240px |

网格以 240px 为基准列宽、240px 为行高，间距 12px。先按可容纳的列数排布，再把不足一列的剩余宽度均分给所有列；例如可用宽度 720px 时，两列各 354px，中间留 12px。跨列卡片按相同列宽计算，高度仍按行数计算。最后一行沿用相同列宽，未占用的完整格位保留。容器较窄时，实际列跨度最多为容器能容纳的列数，Manifest 声明保持不变；不足一格宽时限制在容器内。内容在卡片范围内展示，JSON 的 row/column 保留各自语义；请用预览器检查声明的固定尺寸，完整内容可进入应用查看。

「整理桌面」支持排序和移除，应用中心可恢复卡片。宿主直接使用插件声明的 size；尺寸随应用包更新，不保存用户尺寸偏好。关闭显示缓存、更新时间和停止状态。

```sh
fn plugin widget widgets/summary.json
fn plugin widget widgets/summary.json --preview
```

预览复用正式卡片布局和 renderer，显示固定尺寸，提供主题、语言和运行状态切换。预览文件对应 Manifest 的 initial 时，使用声明的 size；独立 JSON 默认以 1x1 预览。读取所在应用的 locales，JSON 修改自动刷新；修改 Manifest 后重新启动预览。Ctrl-C 结束预览。

增加 `--url` 可输出一次性授权链接；默认自动打开浏览器。
