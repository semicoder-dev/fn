# Fn 发布流程

日常开发、测试、提交和合并不升版本、不发布。只有用户明确要求发布，才准备版本/build、候选、标签和远端部署。应用、SDK/UI npm、独立应用各自发布；完整 DMG 的生成不决定版本级别或已有用户的更新方式。

## 更新类型与固定运行时

默认 `release/update-policy.json` 为 `{"kind":"code"}`。页面、样式、宿主 TypeScript 和可更新资源复用 `release/runtime.lock.json` 指定的公开运行时。当前锁来自公开 **0.8.1/build 17**，包括 DMG 与签名清单地址/摘要、源码提交、Developer ID Team、runtimeId、固定文件清单、配置及原生输入摘要。

原生输入由 `framework/fia/tools/runtime-inputs.ts` 列出：Swift/C 源码及依赖清单、`native-recipe.ts` 的编译参数、Bun、协议与目标平台。`runtimeConfiguration` 覆盖固定 JS、权限/entitlements/profile、更新配置、图标、启动配置及固定资源。版本/build 与业务代码不属于运行时身份；脚本、文档与测试由候选源码提交追溯。构建路径不进入兼容摘要。

`withRuntimeBaseline` 验证下载摘要、签名、公证、Gatekeeper、固定文件以及安装包与公开签名清单一致后，才允许构建器消费。只复制原生 Host、Bun、固定 CLI/preload/资源，替换代码与版本信息，重新签名、公证完整应用。运行时兼容身份沿用验证过的基线；新 DMG 及签名后的文件另行校验完整性。禁止手填旧 runtimeId，禁止失败后自动重编或改成 installer。

Swift/C、Bun、权限、固定资源或协议确有变化时，使用精确的 `{"kind":"installer","version":"…","build":18,"reason":"实际变化"}`（示例 build 须替换）。评审列明变化；版本/build 必须对应当前候选，且输入确实改变。发布后登记新基线，再恢复默认 code 策略。重编造成哈希漂移不是原生升级理由。

## 冻结、构建与验收

1. 完成 Fn 检查/测试、FIA check/pack/verify、受影响 SDK/UI 与应用独立消费、界面和原生验收；归集 `release/notes/unreleased.md`。
2. 获得当次发布授权后准备版本/build、发行说明、更新类型和官网内容。将候选合入 main，固定提交；保留现有 release / github-pages 环境保护及精确标签许可。
3. 手动运行 `Verify Fn release candidate`（`release-candidate.yml`）的 main。普通候选构建只编译 TypeScript 工具链，不调用 Swift 或 `framework:prepare`；质量检查可以另行验证框架源码。独立 runtime-reuse job 使用空缓存和不同工作目录验证相同身份，报告并入候选；随后签名构建在另一 runner 再次验证同一基线。FIA 一次构建代码，通过 `release --runtime-base release/runtime.lock.json --with-update` 同时生成 DMG 和更新包。Fn 的 `release` / `release:candidate` 仅在该工作流运行；原分开构建的 `release:update` 入口已移除。
4. 同一候选完成签名、公证、新装检查及真实旧版更新/恢复验证。`qa.ts` 使用未修改的公开应用、隔离数据、正式候选原始签名字节和原有 URL/公钥。在临时 macOS runner 内配置受控 HTTPS 回放；退出清理 DNS、证书与子进程，禁止在日常机器运行回放。原生确认按钮由 UI 自动化点击，不能绕过验签或修改应用。
5. 覆盖基线直升、上一公开版直升、重启、应用列表/摘要/偏好/业务数据；中断/损坏下载、候选后台崩溃、观察期退出和繁忙任务。故障由中断候选进程注入，不另发故障版本。首次 runtime 家族尚无中间公开代码版本时，只记录 `repeat-check` 幂等检查，明确不等同连续升级；出现同家族中间版本后必须完成 `repeat-upgrade` 两次真实升级。
6. `candidate.ts seal` 仅接受绑定候选与公开基线的完整通过证据；生成 `candidate.report.json`，绑定提交、run ID/attempt、策略、运行时锁、原生/配置摘要、产物摘要和验收文件。任一失败不上传可提升候选；重建必须重新验收。

本地回归不能替代临时 runner 的真实 HTTPS/原生确认验证。`0.8.0 → 0.8.1` 的真实签名清单保留为失败回归，默认 code 策略必须拒绝。

## 提升同一产物

确认成功候选的报告与官网内容后，在已授权的发布任务中执行：

```sh
bun run release:promote --run-id <候选运行ID>
```

命令核对仓库、工作流路径、main、成功状态、精确提交/run attempt、唯一 artifact ID、报告及文件摘要，并重新核对公开基线。使用维护者 GitHub 会话创建绑定这些信息的 annotated tag；不使用 GITHUB_TOKEN 创建标签，以免不触发后续工作流。标签存在时只重试原发布工作流，不能覆盖标签。普通开发不得运行此命令。

`release.yml` 仅下载标签绑定的 run ID / artifact ID 并验证，不编译、不签名、不用“最近成功构建”。候选有效期 90 天；过期未发布候选须新建并重新验收。公开标签、版本/build、附件和更新目录不可变。

## 分阶段上线与恢复

1. `publish.ts … stage` 上传不可变更新文件，保留旧 `latest.json`，部署 Pages 并匿名校验每个文件。
2. `publish.ts … release` 公开同一候选 DMG、签名清单、更新包和报告；匿名下载逐项验证摘要。
3. `publish.ts … activate` 才切换 `latest.json`，再次部署和验证。每阶段重查公开基线；若已变为其他版本则停止，不静默换包。重试仅接受原产物，已切换到本候选允许幂等完成。
4. `public-upgrade` 从原公开安装包对真实更新源执行检查、下载、确认、应用和重启，生成独立公网证据。通过后才按授权上线 Semicoder 对应文档与下载入口，记录源码、公开附件、更新源和官网部署状态。

切换前失败旧更新入口仍有效。切换后业务故障用更高版本/build 发布修复或上一稳定代码；不能降低清单 build 绕过防降级，代码回退不回滚业务数据。

新原生版本公开并验证后，使用生产签名配置、其源码和固定 JS，执行 `bun run release:runtime capture <公开版本> [缓存DMG]`。后续基线须有公开候选报告，且源码、配置、runtimeId 和安装包摘要相符；更新锁需要正常代码评审。`release:runtime check` 检查原生输入，`release:runtime verify-code` 实际验证空缓存及不同目录构建。

## 用户边界与交付状态

0.8.1 是沿用的运行时基线；未来普通更新可应用内更新。0.8.0 需一次完整安装，可直接安装新流程的最新版。每版仍提供 DMG 给新用户。热更新是下载代码、用户确认、重启后台和刷新界面，保留业务数据，不保证未保存界面状态。

此前 0.8.1 验收包含完整 DMG 替换及数据保留，不是 0.8.0 在线更新成功；不能沿用错误表述。分别报告：①固定复用及真实升级/回退通过；②线上流水线已验收同产物发布；③新版本正式更新源与官网上线。三者均完成才关闭问题。普通开发不改版本；公开基线和既有发行产物不可覆盖，发布验收使用隔离应用与数据目录。

签名见 [Apple 配置](apple-signing-setup.md)，独立 npm 见 [SDK/UI 归档](npm-release.md)。手机按 `clients/apple/README.md` 独立验收。FIA 通用接口与应用发布策略分别维护；本流程无需修改旧客户端协议。

## 0.8.2 线上流程证据

`v0.8.2` / build 18 固定 `be4cc687fe0af96fcdbbcc095d77e5c460049e10`；[候选 41317927910](https://github.com/semicoder-dev/fn/actions/runs/41317927910) 的 artifact `13088581248` 经提升进入 [正式流程 41321697415](https://github.com/semicoder-dev/fn/actions/runs/41321697415)，发布过程未重建或重新签名。运行时沿用 0.8.1，发布前 HTTPS 回放中的真实升级与故障恢复通过；正式更新源的未修改 0.8.1 在线升级、数据保留和重启再次通过。完整 DMG 支持 0.8.0 一次升级至 0.8.2，隔离数据和重启已另行验证。

公开附件、12 个更新文件及 latest 经工作流外匿名校验，与原候选摘要一致。完整报告随 [Release](https://github.com/semicoder-dev/fn/releases/tag/v0.8.2) 提供；公网升级证据为正式运行的 `fn-public-upgrade-evidence`。首个失败候选因 QA 子进程退出状态判断错误被门禁阻止；修复后新提交完整重建/重验，未复用失败产物。后续每个候选仍须执行全部检查。
