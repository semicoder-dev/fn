# fn SDK

## Cordis 契约（SDK 0.4.0 / fn 0.5.0）

2026-10-21 产品接口补充：页面用 `ctx.clientApp.list("models.saved")` 读取用户已添加的模型，按 `connectionId` 筛选后使用 `{connectionId,modelId: item.id}` 创建会话。账号完整目录仍通过 `connections.models` 获取。模型服务、外观和应用中心由宿主管理，插件无需重复实现账号管理。

SDK 0.4.0 使用全新 Cordis 插件规范，要求 fn 0.5.0。SDK 0.3.5 与 fn 0.4.5 不包含此契约。应用通过 peer dependencies 精确声明共享核心，开发 CLI 也可使用宿主随附的固定 SDK 归档。旧插件、会话和凭证不在此接口的兼容范围内。

应用是普通 npm 包：后端导出标准 Cordis 插件，由 Bun 直接执行 TypeScript。`fn` 只保存产品身份；页面、方法和 Chat 入口由插件运行时贡献。纯服务插件可以不提供 `./client`。

```json
{
  "name": "@example/my-app",
  "version": "0.0.0",
  "type": "module",
  "files": ["src", "dist"],
  "exports": { ".": "./src/index.ts", "./client": "./dist/client.js" },
  "fn": { "schemaVersion": 1, "id": "my-app", "name": "我的应用", "description": "用途说明" },
  "peerDependencies": { "@deepseek-ai/cordis": "4.0.5", "@semicoder/fn-sdk": "0.4.0", "react": "19.2.7", "react-dom": "19.2.7" }
}
```

SDK 根入口只导出 fn 类型；Cordis、Agent、Session、LLM、Tools 类型从对应 `@deepseek-ai/*` 公开包导入，不由 SDK 包装。`src/cordis-types.ts` 从 `packages/runtime/src/types.ts` 生成，合同测试校验两者一致；公开归档不会依赖私有 `@semicoder/fn-runtime`。

```ts
// src/index.ts
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk";

export const inject = ["app"];
export function apply(ctx: Context) {
  ctx.app.method("echo", input => input);
  ctx.app.chat({ id: "assistant", name: "助手", systemPrompt: "帮助用户完成任务。" });
  ctx.app.useTools(["web_search", "web_fetch"]);
}
```

`ctx.app` 提供 `info`、同步 JSON `kv.get/set/delete/list`、`method(name, handler)`、`chat(endpoint)`、`useTools(names)`、`createSession(selection)`、`send(sessionId, text, requestId?)`、`agent(sessionId)`。`createSession` 必须显式指定 `connectionId/modelId`，可指定 `endpointId/policy/cwd/title`。每个 Session 固定一个连接；换账号创建新 Session。同连接切模型遵循上游行为。

`send` 返回已持久化接收的会话状态，模型结果继续由上游 Agent 异步生成。长任务应及时返回 Session ID；不要等待完整生成再结束 RPC。读取显示结果使用宿主 `sessions.projection`，上游原始 replay 数据不作为页面接口。`method` 参数和结果必须为 JSON，插件负责校验业务输入。

前端也是标准 Cordis 插件；服务名为 `clientApp`，与后端 `app` 分开：

```tsx
// src/client.tsx
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk/cordis-client";
export const inject = ["clientApp"];
export function apply(ctx: Context) {
  const api = ctx.clientApp;
  api.page({
    id: "main", title: "我的应用",
    component: () => <button onClick={() => void api.kv.set("draft", "hello")}>保存</button>,
  });
}
```

`clientApp.context.appId` 是当前应用 ID。`call<T>(method, params)` 调用宿主 RPC；`invoke(name, args)` 固定映射到 `apps.invoke({appId,name,args})`。异步 `kv.get/set/delete/list` 固定带当前 `appId`；不存在的键返回 `null`。KV 单值上限为序列化后 **256 KiB UTF-8 JSON**（含 JSON 引号/转义），后端直接写入遵守相同上限；较大内容使用应用自行管理的文件。

`apps.kv.list`、`sessions.list`、`connections.list`、`connections.models` 的 RPC 参数包含 `offset`（默认 0）和 `limit`（默认 50，最多 100），返回 `{items,nextOffset,hasMore}`；单页 JSON 最多 512 KiB，可能少于请求条数。`clientApp.list<T>(method, params)` 自动读取全部页面，例如 `api.list<SessionInfo>("sessions.list", {appId: api.context.appId})`；`api.kv.list()` 已自动翻页，仍返回完整数组。页面失败会拒绝整个读取，不把半份列表当作完整结果。

页面可设置 `keepAlive: true`，在当前窗口切页时保留 React 状态；默认关闭，首次访问才挂载。隐藏页面的共享浮层停用，插件停用或后台代次变化会销毁页面；跨重启数据使用 KV。页面注册随其 Cordis 插件自动释放；React effect 仍须清理定时器和订阅。插件与宿主处于同一受信任进程/页面，这些作用域不是安全沙箱。

浏览器构建从 `src/client.tsx` 输出 `dist/client.js`，通过宿主模块表共享 React、JSX runtime、React DOM、Cordis 和 `@semicoder/fn-sdk/ui`，不能打包第二份框架。可直接从 `@semicoder/fn-sdk/ui` 导入 Button、Dialog 等宿主组件并继承主题；SDK 不自动注入独立 CSS 文件。宿主在导入客户端包之前调用 `createBrowserHost({call,onPagesChanged})`，再 `host.load(appId, plugin)`；`host.unload` 和 `dispose` 清理贡献。

```sh
fn-dev application create ./my-app --name 我的应用
cd my-app
bun install --ignore-scripts
fn-dev application check
fn-dev application build
fn-dev application pack
```

以上使用已安装 CLI 的开发宿主；源码项目也可运行 `bun run agent application …`，预览版使用 `fn-preview application …`。新命令名为 `application`，不保留旧 `plugin` 别名。`create --service` 生成无前端的服务包。创建命令复制宿主 SDK 归档到 `vendor/fn-sdk.tgz`，不会安装依赖或发布。项目 `tools.ts` 使用 `@semicoder/fn-sdk/build-cordis` 的 `runCordisTool`；也可直接调用 `checkCordisApplication`、`buildCordisApplication`、`packCordisApplication`。CLI build/pack 先执行项目类型检查；pack 使用普通 npm 打包规则并核对导出入口。构建失败保留前一次完整 dist。开发者 Bun 固定使用 1.4.3。

应用更新先安装到候选 generation，空闲后重启 Bun 切换；不尝试卸载 JavaScript 模块缓存。纯服务插件按 Cordis 生命周期管理资源，使用 `ctx.effect` 注册清理。安装插件代表信任其代码；不执行第三方包安装脚本。

应用可声明 `fn.icon`（1–4 个字符）及 `fn.iconSvg: "dist/icon.svg"`。构建器从 `src/icon.svg` 读取不超过 8 KiB 的 SVG，连同客户端一次性替换 dist；服务插件也可携带图标。宿主验包后读取图标，以图片/CSS mask 展示，使用文字作为回退，不将 SVG 插入页面 DOM。

手动安装接受 npm、HTTPS `.tgz`、本地归档以及 `github:owner/repo#ref`、`git+https://…#ref`、HTTPS `.git#ref`。Git 安装只归档指定提交的文件，不执行构建脚本；需提交浏览器产物。更新重新读取原来源，因此可变分支会随更新变化，固定 SHA 可复现。

### Session 自定义卡片（开发契约）

应用在后端注册持久处理入口，再向自己拥有的 Session 创建卡片。桌面和 Apple Chat 使用同一条卡片记录；手机只接收当前 iCloud 账号拥有的 Chat Session。卡片是 fn 的交互状态，不写入或替代 dsh 的 Agent 消息历史。

```ts
import type { Context } from "@deepseek-ai/cordis";
import type {} from "@semicoder/fn-sdk";
export const inject = ["app"];
export function apply(ctx: Context) {
  ctx.app.chat({ id: "main", name: "笔记" });
  ctx.app.cards.action("save-note", ({ cardId, values }) => {
    ctx.app.kv.set(`note:${cardId}`, { text: values.text });
  });
  ctx.app.method("request-note", (input) => {
    if (typeof input !== "string") throw new Error("需要 Session ID");
    return ctx.app.cards.create(input, {
      key: "first-note", handler: "save-note",
      card: {
        version: 1, template: "form", title: "保存笔记", summary: "确认后保存到此应用",
        blocks: [{ type: "text", text: "填写需要保留的内容。" }],
        inputs: [{ id: "text", label: "内容", type: "text", required: true, maxLength: 2000 }],
        actions: [{ id: "save", label: "保存", style: "primary" }],
      },
    });
  });
}
```

`ctx.app.cards.action(name, handler)` 返回注销函数，并跟随调用它的 Cordis scope 自动清理。处理函数收到 `{sessionId,cardId,actionId,values}`。应用重载时必须再次注册同名 handler，才能继续处理待答卡片；页面卸载不撤销它。应快速完成持久业务写入，或交给应用管理的任务后返回；处理期间宿主视为忙，更新和退出会等待它，接口没有强制中断任意插件代码的能力。

`create(sessionId,{key,handler,card,expiresAt?})` 返回 `SessionCard`。key 在该 Session 内幂等，同 key/定义返回原记录，不能换内容覆盖已发布卡片；新问题使用新 key。`cancel(cardId)` 只取消本应用仍待答的卡片。默认一天过期，最长 30 天；定义最多 64 KiB，回复最多 32 KiB。模板支持 approval/choice/form，输入支持文字、数字、布尔、单选、多选，可声明必填、长度及数值范围；块支持文字、字段列表和分隔线。原生客户端文字块支持 Markdown，桌面当前按纯文字显示。

宿主先持久认领回复，再调用 handler。多设备竞争只有首个成功认领的回复有效；无效输入不会消耗卡片，过期、取消、应用停用或 handler 已销毁均拒绝调用。完成状态和接受的输入用于重连恢复；handler 失败标为 failed，进程重启前已认领但未完成的记录标为 interrupted，均不自动重放副作用。外部副作用不具有 exactly-once 保证，应用应以 cardId 保存自己的业务检查点。

前端可从 `@semicoder/fn-sdk/cards` 导入 `ChatCard`、`SessionCard`、`CardValues` 与 `validateResponse`，该模块由宿主共享。`cards.list({sessionId,offset,limit})` 返回分页记录；`cards.respond({sessionId,cardId,actionId,values})` 提交回复。远端使用 v3 `FnSessionCard` 与 card 命令，离线回复重试沿用同一命令 ID；收到传输确认后继续锁定操作，直至宿主结果返回。此契约不兼容旧 `./chat` 卡片接口。

手机模型选择只展示桌面“已添加模型”与当前连接目录的交集。没有选中模型的连接不展示；离线排队的新建/切换命令会在宿主重新校验选择。移除模型不改写既有会话绑定，也不会把会话转到其他账号。

## 旧版 0.3 契约（仅供已发布版本参考）

以下内容描述原插件运行时，不适用于上面的 fn 0.5 Cordis 宿主。

包名为 `@semicoder/fn-sdk`，manifest `sdkVersion` 为 `0.3`。仅适用于 fn 宿主，不支持旧包名、清单字段或运行时全局标识。使用 Base UI 1.9 + Tailwind CSS 4.3；CLI 随应用携带固定 SDK 归档，创建的项目可独立开发。

应用、SDK 和官网分别发布；npm 包版本见当前 package.json。开发时也可使用经过校验的 SDK 归档，宿主安装与版本状态见[官网安装页](https://semicoder.dev/fn/docs/installation)。

## 一个插件包

```json
{
  "name": "@example/my-plugin",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist"],
  "fn": {
    "schemaVersion": 1,
    "id": "my-plugin",
    "name": "我的应用",
    "description": "一句话介绍",
    "icon": "文",
    "color": "#cf633c",
    "sdkVersion": "0.3",
    "frontend": "dist/client.js",
    "styles": "dist/client.css",
    "backend": "dist/backend.js",
    "keepAlive": true
  }
}
```

`frontend: dist/client.js` 与 `styles: dist/client.css` 必需；存在 `src/backend.ts` 时声明 `backend: dist/backend.js`，否则省略。入口须在包内；浏览器资源放在 `dist/`，不通过资源路由公开后端入口。`id` 是 2–64 位小写字母、数字和连字符，首位为字母；`models` / `plugins` / `settings` 为宿主保留。ID 同时定义持久数据命名空间，勿随意更改。版本不兼容或重复 ID 会拒绝安装。

`keepAlive` 是可选布尔值，默认 `false`。仅需要保留页面实例的插件声明为 `true`；现有未声明的插件仍在切页时卸载。schemaVersion / sdkVersion 为 1 / 0.3。KV、模型、账号和历史不清除。

## 前端

`src/client.tsx` 默认导出 React 组件：

```tsx
import { createPluginClient } from "@semicoder/fn-sdk/client";
import { PageHeader, Button, Panel } from "@semicoder/fn-sdk/ui";
const host = createPluginClient("my-plugin");
export default function Page() {
  return <Panel><PageHeader title="我的应用" />
    <Button onClick={() => host.kv.set("example", "hello")}>保存</Button>
  </Panel>;
}
```

能力：`models.list/start/onChange`、`runs.list/get/cancel/onChange`、`kv.get/set/delete`、`invoke(method,input)`、`onReconnect`。运行事件只通知变化，订阅后读取快照，重连时再次读取；UI 卸载时解除订阅。`runs.list` 返回最近 30 条摘要（输入输出最多各 300 字符），`runs.get` 返回完整状态。每个模型输出最多 64 KiB，输入/系统提示词各 16,000 字符，最长 180 秒，同时最多 8 次生成。

模型由宿主「设置 → 模型服务」管理。`ModelInfo.kind` 为 `openai-compatible`、`pi` 或 `chatgpt`；`preset` 为 Pi provider ID 或 null，`options` 为非密钥配置，`hasApiKey` 仅指是否已保存密钥，`configured` 不代表连通性已验证。没有配置时返回空列表，不再提供模拟模型；插件应提示配置并禁用生成。`ModelRun.demo` 仅兼容旧演示历史，新运行恒为 false。API 不返回密钥。插件仍使用宿主模型 `id` 调用，无需依赖 Pi 或选择协议。`models.onChange(listener)` 返回取消订阅函数；订阅后和重连时重读 `models.list()`，避免 keepAlive 页面缓存过期列表。

Pi 预设模型退出当前目录时，即使 `hasApiKey: true` 也会变为 `configured: false`；插件应提示回设置选择可用模型，不自动换用其他模型或服务商。宿主保留原配置、模型 ID 与历史。

KV 每值最多 64 KiB。不存在的键返回 null。读写只接受 JSON，值在宿主数据目录持久化。

### 页面生命周期

- 所有页面均首次访问才加载。`keepAlive: false` 时切走卸载，React effect cleanup 应释放订阅、定时器及页面资源；返回时重新初始化。
- `keepAlive: true` 时切走会关闭所有 SDK 弹层、释放其键盘监听且不向隐藏触发器恢复焦点；页面主体只隐藏，保留组件状态、DOM 与独立滚动位置；隐藏页面不参与布局、键盘导航和无障碍访问，effect 和事件订阅继续运行。此模式会持续占用内存，重页面应谨慎开启。
- 插件停用、卸载、后端激活状态失效，或版本 / 前端 / 样式资源 URL / keepAlive 声明变化时释放旧实例；重新启用后首次访问再创建。普通目录刷新、短暂连接失败不清空已保留的页面。
- 保留仅限当前窗口运行期间，无自动淘汰。刷新或重启不恢复未保存草稿，需持久化的数据继续使用 KV。翻译、随手记显式开启，应用中心与设置面板（含各设置分类）由宿主保留以避免切页丢失表单。
- 页面卸载不等于后端插件停用，不取消宿主模型任务，也不保证回收已导入的 JS 模块缓存或插件自行泄漏的全局对象。不要把“切页”当作任务取消信号。

`plugins.list` 返回归一化的 `keepAlive` 布尔值。已经安装的旧随手记归档不会被宿主隐式修改；插件须使用当前开发契约构建，卸载重装仍保留原有 KV。

## 可选后端

```ts
import { definePlugin, defineMethod, z } from "@semicoder/fn-sdk/runtime";
export default definePlugin({
  methods: {
    generate: defineMethod("生成文本", z.object({ text: z.string(), modelId: z.string() }), (input, ctx) =>
      ctx.models.start({ modelId: input.modelId, prompt: input.text }))
  }
});
```

后端 `context` 提供 models 和 KV，`defineMethod` 生成用于发现的 JSON Schema 并在调用时校验输入。方法返回 JSON（最多 256 KiB），长任务调用 `models.start` 返回运行记录，勿长时间占用 `plugins.invoke`。`activate` / `dispose` 可用于短时初始化和资源释放；不要在激活期间启动模型。插件后台自建的长任务尚无宿主管理能力，首版不要绕过宿主创建常驻任务。模型运行或方法调用期间不允许停用 / 卸载。

## UI 约定

统一从 `@semicoder/fn-sdk/ui` 导入；宿主拥有主题、48px 侧栏和共享实现。插件不直接依赖 Base UI、Lucide 或宿主私有类。需要的图标也从 UI 入口导入。

| 分类 | 组件 |
| --- | --- |
| 基础与表单 | Button、IconButton、Input、Textarea、SearchInput、InputGroup、Field、Checkbox、RadioGroup/Radio、Switch、NumberField、Slider、Select、Combobox |
| 布局 | Page、PageHeader、Panel/Header/Content/Footer、SettingsGroup/SettingsRow、Tabs/List/Trigger/Content、Accordion/Item/Trigger/Content、Separator、ScrollArea |
| 浮层 | Dialog、AlertDialog、Popover、Tooltip、Menu、ContextMenu；配套 Trigger/Content、标题、描述、关闭与页脚；菜单支持分组、勾选、单选和子菜单 |
| 反馈 | Alert、Badge、Loading、EmptyState、Skeleton、Progress、Avatar、Kbd、useToast |
| 业务 | ModelSelect：搜索和服务商分组、不可用模型及订阅用量入口 |

Button 默认 `type="button"`；variant 为 primary/secondary/ghost/danger，size 为 sm/md/lg（28/36/40px），loading 同时禁用。IconButton 必填 label。Input 保留原生事件；Select/Combobox 使用 `value/onValueChange`，Checkbox/Switch 使用 `checked/onCheckedChange`。Field 内放一个控件，自动关联标签、说明和错误；组合选择控件的关联落在 Trigger/Input。

```tsx
import { Button, Dialog, DialogTrigger, DialogContent, DialogTitle,
  DialogDescription, DialogFooter, DialogClose, Field, Input,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  useToast } from "@semicoder/fn-sdk/ui";

export function Example() {
  const toast = useToast();
  return <Dialog>
    <DialogTrigger render={<Button />}>编辑</DialogTrigger>
    <DialogContent>
      <DialogTitle>编辑内容</DialogTitle>
      <DialogDescription>更改当前页面的显示设置。</DialogDescription>
      <Field label="名称"><Input /></Field>
      <Field label="语言"><Select defaultValue="zh">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="zh">中文</SelectItem>
          <SelectItem value="en">English</SelectItem></SelectContent>
      </Select></Field>
      <DialogFooter><DialogClose render={<Button variant="secondary" />}>取消</DialogClose>
        <Button onClick={() => toast.add({ title: "保存完成" })}>保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
```

浮层支持 `open/onOpenChange`；使用 `render` 组合元素，自定义触发器须透传 props 和 ref。Popup 定位参数放在 Content：side、align、sideOffset、collisionPadding。SelectContent 默认与触发器同宽；Select 可通过 `items` 显式提供显示标签，也会读取直接组合的 SelectItem 标签。ModelSelect 使用字符串模型 ID、`onValueChange(id)`。

宿主 UIProvider 建立 Portal、通知和可见性作用域。隐藏页面关闭浮层、取消通知；恢复时不重开，不向隐藏触发器恢复焦点。插件不要将浮层放入 document.body；使用 SDK 的 Content。Toast 由 `useToast().add({title, description})` 发起，Provider 自动渲染并清理。

## Tailwind 与局部样式

模板的 `src/styles.css` 仅包含以下入口，由 CLI 处理；不要直接导入 Tailwind 全局 reset：

```css
@import "@semicoder/fn-sdk/tailwind.css";
```

```tsx
import "./styles.css";
// 类名必须完整、静态可扫描；不要拼接 `p:bg-${tone}`。
<div className="p:flex p:gap-4 p:rounded-xl p:bg-surface p:text-foreground">内容</div>
```

CLI 只扫描本插件 src，在构建阶段编译 `p:` 工具类。宿主使用普通类，SDK 内部使用 `ui:`。语义颜色包括 background/surface/hover/popup/foreground/muted/border/primary/on-primary/error/success/warning/focus。基础值由 `--m-*` token 提供，light/dark/system 共用几何与字体。

复杂局部样式仍用 `.module.css` 与语义 token；禁止全局选择器、主题重定义、引用 `.m-*`/`ui:` 私有类或导入公共 CSS。品牌/数据颜色可用 `fnStyleExceptions` 按 CSS 文件注明理由。插件工具类不要使用任意颜色覆盖公共视觉。

编译结果按插件 ID 作用域化；Tailwind 内部变量、`@property` 与动画名也隔离。不要在 JS 中引用编译器内部变量或动画名。页面和 Portal 具有相同作用域；样式仅在页面可见时启用，卸载时移除。宿主只加载一次 Preflight 和公共 UI CSS，运行时不编译 Tailwind。

CSS 相对 url 由 Bun 处理；JS 图片使用 `new URL(asset, import.meta.url).href`。安装包保留完整 dist。SDK 归档内 `ui.css` 已预编译，`tailwind.css` 只是构建映射，不能作为插件全局样式注入。

## 插件开发 CLI

应用自带已校验的 SDK 快照。创建项目复制到 `vendor/fn-sdk.tgz`，以相对 `file:` 依赖消费，项目可移到 workspace 外；不依赖公开 npm SDK。

```sh
fn plugin create ./my-notes --template notes --name 我的笔记
cd my-notes
bun install --ignore-scripts
fn plugin check
fn plugin build
fn plugin pack
```

开发宿主使用 `bun run agent plugin …`。create 必须指定目标目录，模板为 notes（默认）或 model；ID 默认由目录生成，名称默认目录名，也可用 --id/--name 覆盖。拒绝无效 ID、保留名称、空名称与非空目录。不会自动安装依赖、初始化 Git 或安装插件。

check/build/pack 的目录默认调用者 cwd，支持含空格路径。开发者需安装 Bun >=1.4.2；CLI 使用该 Bun 和项目安装的 SDK 工具。生成的 `bun run check/build/pack` 调用同一实现。所有子命令有 --help/--json；诊断在 stderr，结果在 stdout。Ctrl-C 由 FIA 监督清理子进程；命令执行期间占用更新锁。

check 不改源码；build 先检查，再生成完整 dist，失败删除旧 dist 和半成品；pack 总是重新检查构建，只打包 manifest 与完整 dist，并解包校验资源。使用现有 `plugins.install` 安装归档，无热更新或自动发布。

notes 展示 Field、Textarea、保存状态、图片资源和 KV；model 展示空模型状态、ModelSelect、流式结果、取消、错误，以及卸载/重连时订阅清理。生成项目包含源码、CSS Modules、TS 配置、tools.ts、README、AGENTS.md 与 SDK 快照。

## 独立构建与打包

在fn仓库下创建插件目录，开发依赖引用 `"@semicoder/fn-sdk": "workspace:*"`。外部项目可先安装本地 SDK 路径或经 `bun run npm:pack` 验收的 `.tgz`；实际发布后再使用对应 npm 版本。

```sh
bun packages/sdk/build.ts /absolute/path/my-plugin
cd /absolute/path/my-plugin
bun pm pack
```

外部项目可通过 SDK 的 build 入口编写 `build.ts`，再执行 `bun run build.ts`：

```ts
import { buildPlugin } from "@semicoder/fn-sdk/build";
await buildPlugin(".");
```

构建器把 `src/client.tsx` 和可选的 `src/backend.ts` 编译为对应 `dist` 文件。业务 JS 依赖被打包；React 与 JSX runtime 从宿主共享，插件无需访问宿主源码。不要把服务器代码导入前端。此 MVP 构建器尚未处理原生依赖和额外资源复制。

本地 `bun pm pack`、npm 发布包和 Git 仓库遵循同一个 manifest / dist 格式。Git 来源需要包含预构建 dist，宿主只获取依赖并禁用安装脚本，不替插件构建源码。页面或 CLI 安装后立即激活；前端渲染失败与后端激活失败分别显示。开发中宿主提供用户触发的更新：保留 KV、历史与启停状态，激活或保存失败恢复旧包；不自动升级。

### ChatGPT 订阅模型

`ModelInfo.kind` 增加 `chatgpt`，`chatgptProfileId` 是宿主账号引用；不包含邮箱、token 或授权 URL。模型固定绑定该账号，设置页切换账号不会改变已有模型。插件继续通过 `models.list/start` 调用，SDK 的 `ModelSelect` 自动显示订阅用量标识；自行绘制选择器时应同样标明使用 ChatGPT plan。宿主负责登录、实时模型目录、刷新、限额和退出，不会悄悄改用 API Key 计费。`configured: false` 表示需回设置恢复登录或订阅授权。

当前订阅模型仍使用 MVP 文本请求接口；宿主以官方 public Responses HTTP/SSE 发送 `instructions` 和输入，仅显式完成事件才算成功，断流保留部分文本但标为失败。其他 Pi provider 沿用现有 API Key 适配。

### 自定义主题继承

宿主可在运行时覆盖 `--m-*` 配色，分别保存浅色和深色主题；`theme.css` 提供默认值，`tailwind.css` 的语义工具类引用这些变量。SDK 组件、插件页面及同作用域 Portal 自动继承，不需重新构建。插件不得重定义主题 token；固定品牌色和数据颜色仍使用明确的样式例外。主题设置和预览由宿主管理，原生标题栏只跟随明暗模式。

## 网络工具（SDK 0.3.5 / fn 0.4.5）

本节接口需要 SDK 0.3.5 / fn 0.4.5 或以上。已有插件 API 与 manifest 0.3 保持兼容，使用旧接口的插件不需要重建。

```ts
const controller = new AbortController();
const search = await client.web.search(
  { query: "Bun runtime", engines: ["duckduckgo"], limit: 5 },
  { signal: controller.signal },
);
const page = await client.web.fetch(
  { url: "https://example.com", format: "markdown", maxBytes: 100_000 },
  { signal: controller.signal },
);
// 用户取消、组件卸载时调用 controller.abort()。
```

后端 `PluginContext.web.search/fetch` 接受相同参数并直接等待结果。前端 SDK 封装后台任务、订阅、重连重读与每秒轮询兜底；已取得任务 ID 后，查询和取消的连接异常会重试，最多等待 150 秒；`AbortSignal` 实际取消宿主网络请求，已发起请求不会因重连自动重发。页面卸载时由插件主动 abort。

搜索输入：query（1–4000 字符）、engines（baidu/wechat/toutiao/duckduckgo，默认全部，不重复）、limit（1–30，默认 10）、timeRange（day/week/month/year）、site、timeoutMs（每引擎默认 3000，最大 120000）。结果保留 text、results 和各引擎 engines 状态；全部引擎失败仍返回逐引擎状态，不能把空结果等同于没有相关网页。

抓取输入：url（HTTP(S)、不含凭证、最长 2000）、format（markdown/text/html，默认 markdown）、maxBytes（默认 100000，最大 1000000）、timeoutMs（每请求默认 30000，最大 120000）。结果含 url、finalUrl、status、contentType、title、format、text、truncated 和可选 redirect。HTTP 错误页保留状态及正文，跨域跳转需要调用者显式决定后续抓取；HTTP 地址会升级到 HTTPS。静态网页抓取不执行页面 JavaScript，不复用浏览器登录状态。

每次调用独立编号，不跨调用累计来源；没有会话 API 或持久化网络历史。宿主最多并发 8 项，单任务总时限 120 秒；完整 JSON 结果最多 256 KiB（含转义和元数据，独立于 maxBytes），超限拒绝并提供 code="result_too_large"。任务失败通过带 code 的 Error 返回，主动取消为 AbortError。完成任务最多在内存保留 32 条/10 分钟，重启清空；需要长期保存时由插件自行保存。

网络任务运行时阻止对应插件停用、更新、卸载和应用更新；退出应用会取消任务。宿主 API 为 web.search/web.fetch（`{ pluginId, input }` → WebTask）、web.get/web.cancel（`{ pluginId, taskId }` → WebTask），事件 web.changed 只携带标识和状态，需重读结果。首次启动回复丢失时 SDK 报连接错误、不重复提交；未取得 ID 的任务由宿主总时限回收。

## 机器人聊天（开发分支，未发布）

源码新增 `@semicoder/fn-sdk/chat`、可选 `PluginContext.chat` 和 `BackendPlugin.chat`。公开 SDK 0.3.5 / fn 0.4.5 没有这些接口。本次直接替换未发布的 `communication` / `remoteActions`，不提供兼容层。开发安装见 [fn Chat](../../clients/apple/README.md)。官方翻译、随手记无需改动，不声明聊天的插件不会出现在机器人目录。

每个“宿主实例＋插件”只有一个固定会话。宿主接收用户纯文字与结构化卡片回复，插件自行理解文字；普通 `methods` 不会自动变成远程入口。iOS / Mac 聊天端不运行插件或模型。

```ts
import { definePlugin } from "@semicoder/fn-sdk/runtime";
import type { ChatCard } from "@semicoder/fn-sdk/chat";

const card: ChatCard = {
  version: 1, template: "approval", title: "继续处理？", summary: "确认后继续本次任务。",
  blocks: [{ type: "text", text: "这里展示用户需要确认的具体内容。" }],
  inputs: [],
  actions: [{ id: "approve", label: "批准", style: "primary" }, { id: "reject", label: "拒绝" }],
};
export default definePlugin({
  methods: {},
  chat: {
    version: 1,
    async onMessage(message, ctx) {
      await ctx.progress("正在准备请求");
      const requestId = await ctx.chat!.request({ card });
      await ctx.kv.set("request:" + requestId, { sourceEventId: ctx.eventId, text: message.text });
    },
    async onResponse(response, ctx) {
      const checkpoint = ctx.kv.get("request:" + response.requestId);
      if (!checkpoint) throw new Error("业务检查点不存在，需人工确认");
      ctx.signal.throwIfAborted();
      await ctx.chat!.sendText(response.actionId === "approve" ? "已确认" : "已拒绝");
    },
  },
});
```

| 方法 | 契约 |
| --- | --- |
| `sendText(text)` | 创建完整机器人文字，立即返回持久消息 ID，可多次调用 |
| `request({card, expiresAt?})` | 创建不可变请求卡片，立即返回持久 ID；默认二十四小时过期 |
| `get(id)` | 读取本插件消息及请求/处理状态，不属于本插件时返回 null |
| `list({before?, limit?})` | 新到旧分页，默认 20 条，最多 50 条，同时受返回体大小限制；使用返回的 next 继续 |
| `cancel(id)` | 持久排队取消自己的请求；云端条件提交后生效，不能撤回已接受回复或已发生副作用 |

开发版 fn Chat 会将 `sendText` 的正文和卡片 `text` 块渲染为 Markdown（标题、列表、引用、代码、表格和链接）；继续传原始字符串，无新增 SDK 字段。卡片标题、摘要、字段与按钮仍为纯文字。需更新聊天客户端；iOS 0.2.1（3）TestFlight 已加入既有本人内部测试组，实际分发状态见 [TestFlight](../../clients/apple/TESTFLIGHT.md)，旧 0.2.0（2）不含此次渲染更新。

发送成功只表示本地持久化；云端接受和宿主处理状态分开。所有写入绑定创建时的宿主、插件和账号，切换服务端或系统账号不会重定向队列。新系统账号不能使用旧回调捕获的 chat client。可在本地插件方法中主动发文字或卡片；客户端没有主动操作表单。

处理回调取得稳定 `eventId`、`conversationId`、`signal` 和 `progress(text)`。同一会话串行，不同机器人可并行；默认超时十分钟，`timeoutMs` 可在宿主限定范围内调整。宿主保存领取和处理结果，已开始但异常中断的事件显示“结果待确认”，不自动重放。回调应使用 `eventId` 做业务幂等并遵循取消信号；超时/取消后不能继续通过该回调上下文发送聊天消息。运行期间仍遵守插件占用规则。

`request` 不创建等待用户的长寿命 Promise。插件持久保存业务检查点，通过持久 `onResponse` 继续；`get/list` 用于核对历史，不会重新执行回调。`chat.version` 是处理语义版本，插件包版本和此版本一起组成机器人版本；变更后，旧排队文字和旧卡片不能进入新处理器。

卡片是 fn 的有限 JSON 契约，不执行 Slack JSON、HTML 或脚本：

- `version: 1`；模板 `approval`、`choice`、`form`。
- 必填标题、摘要、`blocks`、`inputs`、`actions`。展示块为文字、标签/值字段和分隔线。
- 输入类型 `text`、`number`、`boolean`、`select`、`multiSelect`，均声明稳定 `id`、`label`、`required`；可选字段省略时不回传。文本可限长度，数字可限最小/最大，选择必须来自 options，多选不可重复。
- 按钮声明 `id`、`label` 和可选样式 `normal/primary/danger`。回复事件携带 `requestId`、`actionId` 和 values。
- 整个序列化消息 payload 不超过 64 KiB；文字最多 16,000 个 UTF-16 单元，进度最多 512。无附件，无逐字流式输出。

回复与终态在同一 zone 原子提交，首个有效回复生效；取消、过期参与同一状态竞争。执行前再次验证宿主、插件、机器人版本、有效期和输入。未知卡片显示摘要并禁用提交。请求内容不能修改，进度/处理状态使用独立记录，不产生新的可见提醒。

完整示例：[验收插件](../../chat/acceptance/src/backend.ts)；两端共用样例：`chat/fixtures/v2.json`。有限卡片组合与交互回传参考 [Slack Block Kit](https://docs.slack.dev/block-kit/)，同步提示使用 [CKRecordZoneSubscription](https://developer.apple.com/documentation/cloudkit/ckrecordzonesubscription)。

## Agent 会话（开发分支，未发布）

`client.agents` / `PluginContext.agents` 新增 `tools/create/list/get/events/send/cancel/remove/onChange`；`@semicoder/fn-sdk/agent` 导出消息、会话、事件 schema/types 与 `deriveAgentMessages`。`defineTool` 从 runtime 导出，`BackendPlugin.tools` 声明插件自己的模型工具。公开 SDK 0.3.5 / fn 0.4.5 不包含这些能力，开发时消费同一次宿主构建的 SDK 快照。

宿主负责有界多步模型调用、工具校验与执行、取消及持久事件。工具必须由会话明确选中；普通插件 methods 不会自动成为模型工具。text/reasoning/tool-call 内容块、工具结果和展示 meta 分离；provider replay 数据保留续接信息。旧 models/runs 接口继续支持单次文本生成。

`send` 立即返回，不等待最终答案；`cancel` 返回 cancelling，需读取终态。订阅后立即 get，使用 events 的 seq 游标补取历史，重连重读，不自动重发不确定请求。页面卸载只清理订阅，任务仍由宿主管理。后端插件订阅随插件 dispose 清理。工具 signal 必须传给可取消的网络或异步操作；取消不回滚副作用。

完整方法、示例、消息事件及限制见 [Agent 文档](../../docs/agents.md)。它与 fn Chat 的跨设备消息是不同协议；业务插件自行选择何时发送聊天结果。

## SVG 插件图标（开发分支，未发布）

此能力需要包含本次 SVG 改动的开发宿主及其固定 SDK 归档；公开 fn 0.4.5 / SDK 0.3.5 不识别新增字段。manifest 的 schemaVersion / sdkVersion 仍为 1 / 0.3，旧文字图标继续可用。

在 `src/icon.svg` 放置带 `xmlns="http://www.w3.org/2000/svg"`、viewBox 和透明背景的单色 SVG；推荐 24 × 24 图形，使用 currentColor。文件最多 8 KiB（UTF-8 字节），必须位于项目内，不能通过软链接访问包外资源。清单中保留 `icon` 文字作为回退，并声明：

```json
{ "icon": "记", "iconSvg": "dist/icon.svg" }
```

`check` 检查源图标，`build` 自动复制为 `dist/icon.svg`，`pack` 包含并验证该文件；模板已默认提供。清单只接受固定包内路径，不接受 SVG 源码或远程 URL。声明文件缺失、超限或不含 SVG 根元素时检查/安装失败；图片解码和显示阶段加载失败时显示文字。

宿主侧栏与应用中心通过图片和 CSS mask 使用当前位置的前景色，不保留 SVG 原色，不把源码插入宿主 DOM。应用中心保留插件色块；停用或后端启动失败时仍可显示已验证的声明图标。`PluginInfo.iconURL: string | null` 提供带版本标识的宿主资源 URL。fn Chat 仍使用原 `icon` 文字，不传输 SVG。
