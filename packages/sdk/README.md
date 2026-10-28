# @semicoder/fn-sdk

**本地全插件化候选，未发布。** 当前 package.json 仍是 0.4.0，内容不等同公开 npm 0.4.0。使用 `bun run npm:pack` 生成并验证本地归档；正式包必须待后续授权重新定版。

SDK 只提供构建工具与泛型客户端。没有应用聚合 Context、KV、web fetch/search、Agent loop 或 Session 副本。

## npm 包

```json
{
  "name": "@semicoder/fn-example",
  "version": "0.1.0",
  "type": "module",
  "exports": { ".": "./src/index.ts", "./client": "./dist/client.js" },
  "files": ["src", "dist"],
  "peerDependencies": {
    "@deepseek-ai/cordis": "4.0.5",
    "@semicoder/fn-sdk": "0.4.0"
  },
  "fn": { "name": "示例", "clientSource": "./src/client.tsx" }
}
```

删除 `./client` 即纯后端；删除 `.` 即纯前端。fn 元数据仅允许 name/description/icon/iconSvg/clientSource/bundle/profile。bundle/profile 可指向包内 JSON 装配文件，使用上游插入/覆盖 patch 规则；版本兼容由 npm peers 表达，不再使用应用 schemaVersion/sdkVersion。共享依赖不能打入插件私有副本。

## 后端与通信

```ts
import type { Context } from "@deepseek-ai/cordis";
import { defineAPI, implementAPI, z } from "@semicoder/fia/api";
// 此 contract 应放在浏览器安全的独立导出中。
const contract = defineAPI({
  methods: {
    read: { description: "Read status", input: z.object({}), output: z.string() },
  },
});
export const inject = ["rpc"];
export function apply(ctx: Context) {
  ctx.rpc.register("example", implementAPI(contract, { read: () => "ready" }));
}
```

`fn-rpc` 的类型从 `@semicoder/fn-rpc` 导入；消费者须声明实际使用的插件 peer。命名空间由实例配置选择，避免多实例碰撞；同一包名不等于一个实例。注册绑定 Cordis effect，卸载关闭入口并取消在途调用。

前端通过 `client(ctx, 'example', contract)` 调用，inject `platform`、`api:example` 和所用插槽的声明服务。`./client` 提供 `client`、`readAllPages`。UI 从独立的 `@semicoder/fn-ui` 导入，原样复用 dsh 控件；声明该包的 peer 并由宿主共享。SDK 不再提供 `./ui`、主题或 Tailwind 导出。`fn-ui-base` 统一加载上游主题，插件只使用 CSS Modules 与 `--dsw-*` 语义变量。

```tsx
import type { Context } from "@deepseek-ai/cordis";
export const inject = ["slots", "layoutSlots"];
export function apply(ctx: Context) {
  ctx.slots.register({ name: "fn.status", id: "example" }, () => <span>示例已连接</span>);
}
```

Slot 类型直接来自 `@deepseek-ai/dsh-client-ui-slots`，布局声明类型由所属插件导出。后台 Session/模型/工具类型分别来自所属 fn 插件和原版 dsh。`fn-chat-cards` 提供持久卡片与回复处理，原生手机消费 Chat v4 展示协议，不运行桌面 React。

## 构建

```sh
bun run agent plugin check /path/to/plugin
bun run agent plugin build /path/to/plugin
bun run agent plugin pack /path/to/plugin
```

构建工具也可从 `@semicoder/fn-sdk/build` 调用 inspectPlugin/buildPlugin/packPlugin。输出原版客户端模块 factory，React/Cordis/FIA/`@semicoder/fn-ui` 保持 external。CSS 随插件生命周期注入与撤销。TypeScript 后端由 Bun 直接运行。

插件均是可信本地扩展，能直接执行本机代码；Cordis 的作用域用于组织服务与事件，不承担沙箱。后台任务应向 fn-activity 登记。页面关闭不负责取消 Agent，注销/禁用及显式取消必须释放真正的资源。
