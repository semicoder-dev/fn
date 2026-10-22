# 插件市场（未发布契约）

市场由 fn-plugin-market 提供，安装与组合由 fn-plugin-manager 提供，两者可独立配置。索引采用 `{schemaVersion:3,name,plugins:[]}`；条目包含 packageName/name/description/version/url/sha256/peers 和可选图标。版本范围按实际共享内核判断，下载后验证归档身份与完整性。

新官方索引候选在独立 `fn-plugins` 仓库；三个测试应用、旧开发归档及发行工作流已从活跃源码移除。生产 marketplace-cordis.json 和历史 Git 标签/附件保持原状。本轮没有市场远端改动，新候选可能提示生产索引仍是旧协议。待明确发布时再部署新索引。

支持 npm、HTTPS、本地归档和固定 Git 来源。更新沿用已记录来源，不接受来源冲突或市场降级。纯后端/前端/双端包都可安装；实例和启停属于 profile，不是旧应用 manifest。准备失败不切换，空闲后重启，不在已生效目录执行安装。数据由插件持有，卸载包不会清空会话/凭证或同步队列。
