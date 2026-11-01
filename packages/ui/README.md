# @semicoder/fn-ui

Fn 自有 React UI。ApplicationProvider 接入宿主主题、语言、Toast、确认弹窗和应用关闭提示。Button、Input、Textarea、Select、Checkbox、Menu、Modal、Surface、Notice 等使用一致的语义变量和键盘交互。

Input 与 Textarea 聚焦时将原有单层边框变为焦点色，不额外添加外圈；鼠标与键盘聚焦均保留可见提示。

Button 与 Select 的键盘焦点同样复用原边框；菜单项和无边框弹窗关闭按钮使用内部细焦点线，避免向外扩展。

页面使用 CSS Modules，可从 `./theme.css` 导入主题。`./summary` 的 Summary 为宿主与开发工具共用的固定区域摘要 renderer。页面打包自身的 React、SDK 和 UI；摘要只接收结构化数据，不执行应用页面代码。

UI 0.2.1 精确配套 SDK 0.7.1；应用行使用公共 Summary renderer，新契约不导出旧 widgets renderer。开发、明暗主题、中英、窄窗、焦点恢复和减少动态效果均为交付检查项。

配色统一定义于 `src/theme.css` 的 `--fn-*` 语义变量，参考 DeepSeek Harness 的原版明暗配色：白色/近黑底色、中性主按钮、蓝色焦点与强调色。宿主和插件页面均从 Fn UI 导入主题；页面只消费变量，不重定义全局主题。Fn UI 不依赖 dsh 包。
