# UI 主题与配色

统一入口是 `packages/ui/src/theme.css`：浅色和 `:root[data-theme="dark"]` 的颜色、阴影、字体与基础状态。`packages/ui/src/ui.module.css` 定义标准控件；`frontend/desktop.module.css`、`frontend/platform.module.css` 定义宿主布局并消费语义变量，不定义第二套主题。应用页面自包含打包 Fn UI，通过 ApplicationProvider 接收宿主明暗设置。

配色参考 DeepSeek Harness `687f282e8625c6b8d11ff58211a90524be2e4317` 的 `packages/client/ui-theme/src/styles/design-platform.css` 与 `focus.css`，将需要的颜色值映射到 Fn 语义变量。参考源码仅只读核对，未引入运行依赖或复制主题插件。Fn 的布局、尺寸、阴影和组件实现由自身维护。

| Fn 变量 | dsh 语义来源 | 浅色 / 深色 |
| --- | --- | --- |
| --fn-bg | bg-base | #ffffff / #151517 |
| --fn-surface | bg-layer-1 | #ffffff / #232324 |
| --fn-surface-raised | bg-layer-2 | #ffffff / #2c2c2e |
| --fn-input | specific-input-major | #ffffff / #2c2c2e |
| --fn-text | label-primary | #0f1115 / #f9fafb |
| --fn-secondary | label-secondary | #61666b / #cfd3d6 |
| --fn-muted | label-tertiary | #81858c / #adb2b8 |
| --fn-accent | button-primary-fill | #0f1115 / #f9fafb |
| --fn-on-accent | label-primary-foreground | #ffffff / #0f1115 |
| --fn-info、--fn-focus | state-business-primary | #4176e6 / #7aaaff |
| --fn-border | border-l2 | 黑色 10% / 白色 12% |
| --fn-line | border-l1 | 黑色 4% / 白色 6% |
| --fn-green | state-success-primary | #22c55e |
| --fn-danger | state-error-primary | #ec1313 / #f25a5a |

图标、按钮、输入、菜单、弹窗、Toast 和小组件使用同一套变量。业务内容的颜色（如看板标签）由应用管理。焦点、遮罩、文本选择和浮层阴影集中管理，新增页面不要硬编码另一套主题。仅支持浅色、深色和跟随系统。
