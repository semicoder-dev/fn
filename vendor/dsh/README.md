# dsh 上游发行产物

此目录保存 `upstream.lock.json` 指定的公开 npm 归档，源码审计基线为 dsh `687f282e8625c6b8d11ff58211a90524be2e4317`。公开包元数据没有 `gitHead`，所以审计提交不作为归档构建提交的证明；实际消费证据为 registry URL、SHA-512 integrity、归档 SHA-256、包内 manifest 和根 `bun.lock`。

当前组合为 dsh `0.2.1-rc.2`、Cordis `4.0.5`、Cosmokit `1.8.6`、Schemastery `3.18.5`，共 33 个共享包。fn runtime 另精确声明 Pi `1.1.0` 和 zod `4.4.3`；第三方传递依赖由根 `bun.lock` 固定。只有根锁文件参与开发安装。

从 fn 项目根运行：

```sh
# 显式获取已审查版本，不跟随 latest/next/master。
bun scripts/upstream/acquire.ts

# 无网络：核对归档、共享依赖闭包和根锁文件中的同一发行产物。
bun scripts/upstream/verify.ts

# 完成根依赖安装后，核对实际 ESM 导入、共享实例与 Cordis 生命周期。
bun --no-env-file --no-install scripts/upstream/smoke.ts

bun test scripts/upstream/upstream.test.ts

# 根依赖已安装后，离线生成可打包的 TypeScript runtime + 完整依赖闭包。
bun run runtime:seed

# 临时数据目录消费真实 seed、安装 TS 插件及普通 npm 依赖、重启并确认。
# 首次依赖安装可能访问 npm；所有 lifecycle scripts 被禁用。
bun --no-env-file --no-install scripts/upstream/generation-smoke.ts

bun test packages/runtime/tests/generations.test.ts
```

升级先修改 `scripts/upstream/policy.ts` 并审查新增依赖，再获取新归档、同步 `packages/runtime/package.json` 与根 overrides、更新 `bun.lock`、完成独立消费及 engine 行为验收。不会执行参考仓库脚本、复制其 `node_modules`，也不依赖 workspace 外的相邻源码目录。

归档内保留上游许可证。此目录不包含 Node HMR、dsh CLI/GUI，也不表示所有可选 provider 已加入运行 profile。依赖安装和 Cordis 服务组合分别验证。

`resources/runtime-seed` 为生成资产，不提交。脚本复制实际安装图中的全部包字节，并将链接改为 seed 内相对路径；应用复制到 dataDirectory 后动态导入该目录中的 runtime，不修改签名包或依赖相邻 checkout。seed 身份包含源码和依赖内容；更新 seed 时，管理器在新目录重放已保存的应用归档、校验精确共享 peer 和唯一解析路径，再试启。失败保留上一代并报告原因；首次试启必须确认，未确认的进程崩溃会在下次启动回滚。
