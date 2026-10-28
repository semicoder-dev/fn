# @semicoder/fn-ui

未发布的全插件化候选。由宿主提供单份静态模块，产品页面仍是独立 Cordis 插件。

Button、Input、Checkbox、Switch、Menu、Modal、Tooltip、SegmentedControl 和图标直接重导出锁定的 DSH `ui-primitives`，不复制控件实现。DSH 发行包未声明完整浏览器依赖，本包精确补齐其依赖闭包。`Select` 组合原版 Menu 和 Button；Textarea、Notice、页面和设置分组是 DSH 暂无的少量组合。

```tsx
import { Button, Modal, Input } from "@semicoder/fn-ui";
// Modal 负责 portal、焦点、Escape 和清理；表单按钮须显式 type="submit"。
<Modal open={open} onClose={close} title="编辑" closeLabel="关闭">
  <Input data-modal-autofocus aria-label="名称" />
  <Button variant="primary" onClick={save}>保存</Button>
</Modal>
```

插件声明 `@semicoder/fn-ui: 0.0.0` peer，通过 fn SDK 构建时保持 external。不要将 UI 或 React 打入插件。基础主题仅由 `fn-ui-base` 加载一次，插件使用 CSS Modules 和 `--dsw-alias-*` / `--dsw-specific-*` 语义变量。不要写全局 button/input/select 样式或直接修改 body 主题。

`theme.css` 引用 `upstream/` 的原样资源；公开 DSH 主题包没有独立 CSS 导出，所以资源固定到 `manifest.json` 中的来源 commit、文件 SHA-256 和 MIT 许可证。升级时显式从相应 Git SHA 更新清单和文件，运行 `bun scripts/upstream/ui-theme.ts [reference-checkout]` 验证；禁止从编译 JS 中提取 CSS。控件版本与主题来源须同时复核。

fn 通过 `fn-ui-theme` 设置 body 的 `data-ds-dark-theme` 和自定义语义 token，保留 FIA 标题栏同步。不要设置 DSH Electron 专用的 `html[data-platform=darwin]`：FIA 使用 WebKit，普通网页菜单材质适用于本宿主。

共享主题包含原版 `gradient-shadow-text.css`，提供菜单背景模糊、浮层阴影和字体变量；仅加载颜色表会使半透明菜单失去层次。`styles:check` 同时核对主题资源实际导入，以及导出控件 CSS 所需的主题变量，避免遗漏上游样式依赖。

源码规则运行 `bun run styles:check`；新增控件须覆盖键盘、焦点返回、深浅主题、窄窗口及插件卸载。源码规则约束官方插件，不是可信本地第三方插件的安全沙箱。
