# Fn 应用开发

需要 Bun 1.4.4 和 Fn 0.7。`fn plugin init` 创建的项目精确使用 SDK 0.6.0 与 Fn UI 0.1.0，从 npm 安装即可；应用可以在 workspace 外开发。

```sh
fn plugin init my-app
cd my-app
bun install --ignore-scripts
fn plugin check .
fn plugin dev . --browser
fn plugin build .
fn plugin pack .
```

`dev` 使用真实宿主、后台和模型。修改源码会构建、停止并重新启动对应开发实例，浏览器自动刷新；任务被中断，不重放。Ctrl-C 停止开发实例。仅关闭浏览器标签不停止实例。CLI 使用当前选中的 Fn 实例。

`--browser --url` 输出一次性授权链接，便于选择调试浏览器；不加 `--url` 时自动打开浏览器。链接不要写入共享日志。Fn UI 通过 peer 复用应用安装的 SDK。

## Manifest

`fn.app.json` 是应用定义。文件路径相对包根，名称与静态文案使用词条；入口均可选，无页面时由宿主显示标准状态页。

```json
{
  "manifestVersion": 1,
  "id": "my-app",
  "version": "0.1.0",
  "hostApi": 1,
  "name": { "key": "app.name" },
  "entries": { "backend": "src/backend.ts", "page": "src/page.tsx" },
  "locales": { "default": "en", "messages": { "en": "locales/en.json", "zh-CN": "locales/zh-CN.json" } },
  "uses": ["models.responses", "widgets.publish"],
  "contributes": { "widgets": [{ "id": "summary", "size": "1x1", "initial": "widgets/summary.json" }] }
}
```

可选 `description`、包内 `icon`；可选 `contributes.chat: {id,name}` 需要后台和 `chat.receive`。能力为 `models.responses / widgets.publish / chat.receive`。声明和调用均接受 Zod 校验。

## 类型化契约

```ts
// src/contract.ts
import { defineContract, method, stream, z } from "@semicoder/fn-sdk/contract";
export default defineContract({
  echo: method({ input: z.string(), output: z.string() }),
  translate: stream({ input: z.object({ text: z.string() }), chunk: z.string() }),
});
```

```ts
// src/backend.ts
import { defineBackend } from "@semicoder/fn-sdk/backend";
import api from "./contract.ts";
export default defineBackend({
  api,
  setup({ host }) {
    return {
      handlers: {
        echo: (text) => text,
        translate: async function* ({ text }, { signal }) {
          const model = await host.models.default();
          for await (const event of host.models.responses({
            model: model.id,
            instructions: "Translate the user's text into English.",
            input: [{ role: "user", content: [{ type: "input_text", text }] }],
            stream: true,
            store: false,
          }, { connectionId: model.connectionId, signal })) {
            if (event.type === "response.output_text.delta") yield String(event.delta);
          }
        },
      },
      stop: async () => { /* 关闭数据库、清理定时器与业务资源 */ },
    };
  },
});
```

`host.paths.data/cache/logs` 是应用专属目录。后台可使用 Bun SQLite 或文件。`host.widgets.publish(id, snapshot)` 发布完整快照。`host.ui.toast(text, {viewId})` 定向到发起视图；没有视图时进入宿主通知。`host.ui.confirm(text, {viewId})` 需要活跃视图，视图关闭后取消。

手机功能仅在开发构建中开放。聊天通过 setup 返回 `chat: { [manifestChatId]: async ({message, signal, reply}) => { ...; await reply.complete({text}); } }`。`reply.complete` 将最终文本写入宿主 outbox。手机消息不带页面视图，不能等待视图弹窗。

## 页面

```tsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { connectView } from "@semicoder/fn-sdk/client";
import { useI18n } from "@semicoder/fn-sdk/react";
import { ApplicationProvider, Button, Surface } from "@semicoder/fn-ui";
import api from "./contract.ts";
const view = connectView(api);
function Page() {
  const { t } = useI18n(view);
  const [text, setText] = useState("");
  return <Surface><Button onClick={() => void view.call("echo", "Hello").then(setText)}>{t("refresh")}</Button><p>{text}</p></Surface>;
}
createRoot(document.getElementById("root")!).render(<ApplicationProvider view={view}><Page /></ApplicationProvider>);
```

流式方法使用 `for await (const chunk of view.stream("translate", {text}, {signal}))`。`view.models` 也可直接使用模型目录和 Responses；页面所属流会随视图断开取消。`view.ui.toast/confirm`、`view.application.close/minimize/maximize` 提供公共交互。编辑器使用 `useUnsavedChanges(view, dirty)`，多编辑区域分别登记；关闭时统一确认。

页面自包含打包 React、SDK 和 Fn UI。通过 ApplicationProvider 接收主题、语言和公共弹窗。配色统一来自 Fn UI 的语义变量，见 [UI 主题与配色](ui-theme.md)。业务词条在应用 locales 中，用户输入内容不翻译。

## 归档

`.fn-build/` 包含后台 TypeScript、冻结的运行依赖、构建页面、词条和小组件资源；`<id>-<version>.fn.tgz` 为发行归档。宿主安装不执行 bun install 或依赖脚本。前端不引用 workspace 外路径；构建器拒绝未冻结依赖。运行代码不得写入安装目录。

[小组件](widgets.md) · [安装更新](plugin-marketplace.md) · [FIA 联调](fia-integration.md)
