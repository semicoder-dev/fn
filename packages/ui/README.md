# @semicoder/fn-ui

Fn 自有 React UI。ApplicationProvider 接入宿主主题、语言、Toast、确认弹窗和应用关闭提示。Button、Input、Textarea、Select、Checkbox、Menu、Modal、Surface、Notice 等使用一致的语义变量和键盘交互。

页面使用 CSS Modules，可从 `./theme.css` 导入主题。`./widgets` 为宿主与开发工具共用的小组件 renderer。页面打包自身的 React、SDK 和 UI；小组件只接收 JSON，不执行插件页面代码。

本分支使用与 SDK 同批的摘要归档。开发、明暗主题、中英、窄窗、焦点恢复和减少动态效果均为交付检查项。

配色统一定义于 `src/theme.css` 的 `--fn-*` 语义变量，参考 DeepSeek Harness 的原版明暗配色：白色/近黑底色、中性主按钮、蓝色焦点与强调色。宿主和插件页面均从 Fn UI 导入主题；页面只消费变量，不重定义全局主题。Fn UI 不依赖 dsh 包。
