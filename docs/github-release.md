# fn 应用发布

fn **0.5.2 / build 12** 已公开；官网为 `https://semicoder.dev/fn`，安装页为其 `/docs/installation`，更新源为 `https://semicoder-dev.github.io/fn/updates/latest.json`。公开标签及附件不移动、不覆盖。

## 0.5.2 插件安装提速（2026-10-22）

`v0.5.2` 固定 `f6edfc3a1941c1199739a73d772bb4a1a1b702cb`。[正式工作流 39701865820](https://github.com/semicoder-dev/fn/actions/runs/39701865820) 成功，主干 CI 为 [39701720899](https://github.com/semicoder-dev/fn/actions/runs/39701720899)。完整 check、267 项测试/2316 断言、build、FIA 与 SDK 独立消费通过；FIA 88 JS/48 Swift。github-pages 仅增加精确 v0.5.2 标签许可。

- [公开 DMG](https://github.com/semicoder-dev/fn/releases/download/v0.5.2/fn-0.5.2-12-mac-arm64.dmg)：66,101,814 字节，SHA-256 `ed7f08d19912ff8f5b39fdab039156a664d8b6653d688d940bb8e5023e9ff224`。五附件匿名摘要、Developer ID、Apple 公证票据、Gatekeeper、生产 CloudKit/profile、2 个原生依赖签名及 55 项内嵌 SDK 文件独立验收通过。
- seed `be3f798487d6bef4d5e89ee1`，runtime ID `b910f3a2bc20c6a7b011963f10194c34284c4131a1fb4df817f544573ee5ab73`。签名更新清单、32 个在线文件大小/摘要及镜像逐文件比对通过；旧 build 11 两个文件抽检保留。本次需要完整 DMG。
- 正式 seed 从真实市场 refresh/resolve 下载、校验并安装三个原始 0.1.0 插件，忙时等待、空闲重启、active/installed、卸载释放及 KV 恢复通过。实际 0.5.1 原版建立的运行代升级后插件/KV 保留，旧代不改写。
- 空目录启动至正常退出 9,432 ms，后台只启动一次，受管进程组清理通过。该数值是单次 smoke，不能作为冷启动基准。

共享固定内核、独立插件依赖与小型 generation 消除每次安装的全量复制；本地同组准备中位数 5.808 s → 0.189 s，范围见 [测量记录](runtime-validation.md)。旧运行目录保留回退，历史目录暂不自动回收。0.5.x 数据保留，0.4.x 仍遵循独立目录规则。SDK、官方插件、手机、agent-webtool 版本不变；官网安装入口和指南对应 Semicoder `54adc7f`，已完成本地质量、51 单元/12 Worker 测试、构建和 39 页面检查；两环境部署及线上验收单独记录于 workspace `docs/agent/sessions/2026-10-22-fn-052-release.md`。

## 0.5.1 官方市场修复（2026-10-21）

`v0.5.1` 固定 `9825765af9cdf61e5dc3393c9f30675c29238508`。[正式工作流 39612788964](https://github.com/semicoder-dev/fn/actions/runs/39612788964) 与[主干 CI 39612373554](https://github.com/semicoder-dev/fn/actions/runs/39612373554) 均成功。完整 check、262 项应用测试/2157 断言、build、SDK 与 FIA 独立消费通过；FIA 88 JS/48 Swift。仅 github-pages 增加精确 v0.5.1 标签许可，其他保护保留。

- [公开 DMG](https://github.com/semicoder-dev/fn/releases/download/v0.5.1/fn-0.5.1-11-mac-arm64.dmg)：66,111,761 字节，SHA-256 `9e7d5f803119376919f21af5735448b5525f4bbf5354c687d4618ba416524340`。五附件匿名下载与 digest 一致；Developer ID、Apple 公证票据、Gatekeeper、生产 CloudKit/profile、2 个原生依赖签名与内嵌 SDK 55 文件通过独立核验。
- seed `69a91926d31e7939fb88a8fe`，runtime ID `d758ae9094ea855539ce8727e6cc436b368360ef2f33686205284b82f7b3d362`。公开更新清单签名、32 文件大小/哈希、镜像内代码比对通过；旧 build 10 两文件抽检保留。新运行时身份要求完整 DMG。
- 正式 DMG seed 在临时空目录经过真实官方市场 refresh/resolve 后下载并安装三个原始 Cordis 0.1.0 归档，摘要、共享实例、忙时等待、空闲重启、三应用 active/installed、卸载释放与 KV 恢复通过。
- 从实际 0.5.0 归档建立旧运行目录，安装随手记并保存测试笔记，再切到正式新 seed，验证应用/KV 保留、旧代不变、忙时等待和市场恢复；不读取用户数据。新包启动到退出 16,486 ms，仅一次后台启动，进程组清理通过。

0.5.0 的 seed 漏登记 React/React DOM，导致三个官方应用经过市场门禁被误判不兼容。此前底层归档安装验证漏过这个入口；修复保留严格版本检查，不覆盖旧附件或修改官方插件。SDK 0.4.0、插件 0.1.0、手机 0.3.0（4）及 agent-webtool 0.8.2 均不变。0.5.0 数据保留；从 0.4.x 升级仍遵循独立数据目录规则，见[版本说明](../release/notes/0.5.1.md)。官网安装与修复说明来源为 Semicoder `e1abcba4e5e54304046a54e29d5f0b5fff38bdbb`；[官网工作流 39615386873](https://github.com/semicoder-dev/semicoder/actions/runs/39615386873) 独立管理两环境部署，状态与最终线上验收另记于 workspace 的本次发行记录，不以应用 Release 代替官网完成。

## 0.5.0 Cordis 联合发行（2026-10-21）

`v0.5.0` 固定 `4f37222c23c5acc5cdcd139df971be0f4847ebc3`。[正式工作流 39533452898](https://github.com/semicoder-dev/fn/actions/runs/39533452898)、候选 39532302857 和同提交主干 CI 39532302656 均成功。fn check、259 项应用测试/2131 断言、build、SDK 独立消费和 FIA 独立源码/归档/应用消费通过；FIA 88 JS/48 Swift 测试通过。

- [公开 DMG](https://github.com/semicoder-dev/fn/releases/download/v0.5.0/fn-0.5.0-10-mac-arm64.dmg)：66,055,111 字节，SHA-256 `c4dbd5fe51c30f8318476eef3ad1ee3c3301aaed5e3df7e6db96924f431e3a02`。五附件匿名下载摘要、Developer ID、Apple 公证票据、Gatekeeper、生产 CloudKit/profile 均通过独立验收。
- runtime ID `db4ec1b5ff56e6b244e223ec9f8405ffa8b7107641005af79468c32c4a23b244`；公开更新清单 Ed25519 签名和全部 32 文件大小/哈希通过，与镜像内代码逐文件相同；旧 build 9 历史抽检保留。原生运行时已改变，须完整 DMG。
- 内嵌 SDK 0.4.0 的 55 文件与公开 npm 一致；两项 seed 原生依赖在压缩前签名，Developer ID 与 timestamp 严格验证通过。空数据启动至退出 14,795 ms，仅一次后台启动，进程组正常清理。
- SDK 0.4.0、agent-webtool 0.8.2、三个官方 Cordis 应用 0.1.0 与新市场先行公开并验收。手机 0.3.0（4）已进入既有内部 TestFlight 组，Chat v3 生产 schema/两环境订阅已部署；详见 [TestFlight](../clients/apple/TESTFLIGHT.md)。
- 首轮发行候选暴露 seed 原生签名与初始化期限问题；修复 Apple 最终状态判定、归档前签名及有界 startupTimeoutMs 后重新完整验收。公开标签固定最终通过的提交，未跳过公证或启动检查。

旧 SDK、插件、Chat v2 与数据不兼容；新目录 `Backend/cordis-v1/` 不读取、迁移或删除旧数据，需重新配置连接及应用。手机新卡片/模型跨设备交互与通知点击、新 OAuth 登录/过期刷新/第二真实账号尚未实测；不将发布成功等同于这些场景通过。官网按此公开产物同步并独立部署，FIA 独立 npm 继续暂停。

## 0.4.5 网络工具发行（2026-10-16）

`v0.4.5` 固定 `690eb1d0962b07a08e5c271e000037a5d484e6e2`。[候选 38824928141](https://github.com/semicoder-dev/fn/actions/runs/38824928141)、[正式发行 38825817130](https://github.com/semicoder-dev/fn/actions/runs/38825817130) 和主干 CI 38824926438 全部成功。本地 check、113 项应用测试 / 1179 断言、build、FIA 独立归档消费通过。

- [公开 DMG](https://github.com/semicoder-dev/fn/releases/download/v0.4.5/fn-0.4.5-9-mac-arm64.dmg)：36,014,151 字节，SHA-256 `3d2bd971e3d0ac654bf5139d54b97593bf502eaf03b6802ebc443ea69a28421e`。五附件匿名摘要、镜像完整性、应用和 DMG 签名、公证票据及 Gatekeeper 通过。
- 内嵌 SDK 0.3.5 的 45 文件与公开 npm 一致；宿主精确依赖公开 agent-webtool 0.8.1，开发归档保留于实现提交 cdd1c06 的历史。
- HTTPS 更新清单 Ed25519 签名、全部 30 文件大小/哈希和与应用逐文件比较通过。runtimeId `11d652150693100bf055d58a4b72bf6ce360b047317e34ff47611531a31f3872` 与 0.4.4 不同，必须使用完整 DMG 升级；现有 fn 数据保留，官方插件 0.1.2 不需要重建。
- 全新隔离数据及干净启动环境下，公开 SDK 构建的临时插件前后端抓取 example.com 返回 200；baidu/wechat/toutiao/duckduckgo 本次均成功，前端立即取消返回 AbortError。前端产物不含 agent-webtool 服务端代码；真实联网经过既有系统代理配置。
- 两个公开官方插件 0.1.2 安装激活、KV 写入和重启恢复通过；重启清空网络任务，正常退出及进程退出通过。未访问正式用户数据，临时验收数据随后清理。
- 发行检查发现安装终态早于异步清理/回滚完成的竞态，已修复并增加确定性回归。SDK 内容未变，原 sdk-v0.3.5 标签的完整检查重跑成功后发布；最终应用重新签名验收，没有移动标签或跳过检查。

仅追加精确 sdk-v0.3.5 / v0.4.5 环境许可，其余保护保留。官网按已验收公开产物更新并独立部署。实际引擎结果仅代表本次网络条件；不同代理拓扑、动态登录页面、所有模型和跨版本代码更新不在本轮验收范围。

## 0.4.4 更名首次发行（2026-10-15）

`v0.4.4` 固定 `0ddaeaaff7257085ff5a421b9fbc8b04c48a6440`。[候选验收 38689503294](https://github.com/semicoder-dev/fn/actions/runs/38689503294)、[正式发行 38690994572](https://github.com/semicoder-dev/fn/actions/runs/38690994572) 均成功。普通 CI 38689501688 通过；本地 check、99 项应用测试、build、框架独立消费与 SDK 归档消费通过。仅为 github-pages 追加精确 v0.4.4 标签许可，其余环境保护和签名配置保留。

- [公开 DMG](https://github.com/semicoder-dev/fn/releases/download/v0.4.4/fn-0.4.4-8-mac-arm64.dmg)：35,442,136 字节，SHA-256 `0258a257fec62dd3a4c081572103053a9025a4ffdabb9379f8f0a805c5909994`。五个 Release 附件匿名下载的大小和摘要均一致；DMG 镜像、签名、公证票据、Gatekeeper 和内含应用签名通过。
- 应用名称 fn、标识 com.semicoder.fn、版本 0.4.4 / build 8、CLI fn；内嵌 SDK 0.3.4 的 43 文件与 npm 一致。runtimeId `63fc8f3442ec566b4502fa3e008db0a67237043546055380be32c71ff789d5b2`。
- 独立 `fn-updates-site` 与新身份更新源发布成功。公开清单 Ed25519 签名、30 个文件的 HTTPS 直连/大小/哈希及与 DMG 应用逐文件一致性通过。Pages 设置 API 的 https_enforced 字段仍为 false、修改返回证书未就绪，UI 开关禁用并提示默认域名要求 HTTPS；实际配置和全部下载使用已验证的 HTTPS，不绕过或放宽设置。
- 公开应用在全新数据目录启动，初始没有模型或插件；从市场安装译文和随手记 0.1.2 后均 active。页面、随手记保存/刷新、KV、临时目录安装的 CLI、正常退出/重启后插件与笔记持久化均通过。新 fn Dev 使用公开译文归档完成用户已授权 GPT-6-Luna 真实调用，demo:false；没有读取、迁移或删除旧应用数据。
- SDK 0.3.4 和官方市场先完成公开验收，再发行本应用；官网安装和指南按同批产物同步。首次 fn 尚无跨版本公开应用更新实测，真实令牌刷新/撤销及其他模型未在本轮验证。

两个 GitHub 仓库更名时保留历史仓库身份、标签和 51 个附件的名称/ID/大小/摘要。旧更新分支不读取或改写，旧标签不移动。应用使用完整 DMG 与独立数据目录，不提供旧身份回退；FIA 独立 npm 继续暂停。

## 版本规则与发布时机

2026-10-10 起采用“持续开发、集中归集、明确授权后统一发布”。普通任务完成、提交、合并或 CI 通过均不意味着发布；只有用户明确提出发布，才进入本文的发布准备流程。不按时间、提交数量或最低特性数量自动发版。

| 变化                                        | 应用版本处理                                 |
| ------------------------------------------- | -------------------------------------------- |
| 日常开发、提交、合并、测试构建              | 不修改版本号和 build                         |
| 一批普通功能、体验优化、性能改进和 bug 修复 | 第三位递增，例如 `0.4.0 → 0.4.1`             |
| 用户确认的大功能或产品阶段升级              | 第二位递增，第三位归零，例如 `<version> → 0.5.0` |
| 用户明确确认进入 1.0 正式阶段               | 才将第一位改为 `1`                           |

发布大小按内容判断，不按代码量、提交数量或是否需要完整 DMG 判断。涉及插件兼容或数据迁移时，发布前列出影响，由用户确认版本归类。公开发布 0.x 安装包仍处于 1.0 之前；本文的“正式发行”指公开签名安装包，不代表产品已进入 1.0。

已有 `0.4.0` 和历史标签保留，后续按此规则演进。当前公开版本为 `0.5.2 / build 12`；下一次普通发行可采用 0.5.3 候选，只有明确授权时才准备版本，日常开发不提前修改。应用、SDK、插件与 FIA 独立管理版本；应用发行不自动带动其他包升版。FIA 共仓期继续暂停独立 npm 发布。

## 日常开发与待发布清单

- 沿用短期 `codex/` 特性分支，验证后按授权合入 `main`；不新增长期 `develop` 分支。日常开发不调用 `version:app`，不创建发布标签。
- 每次完成改动后更新 [待发布清单](../release/notes/unreleased.md)，按“新增与改进、问题修复、内部工程、兼容与升级”归类。每项注明简短说明、来源提交、验证证据和官网影响；尚未提交时明确标记工作树，提交后补来源。未完成需求留在待办，不当作已完成内容归集。
- 清单是已完成、尚未公开发行改动的唯一汇总入口，不预先绑定版本或发布日期。发布前仍需对照上次正式标签以来的实际差异，确认无遗漏、无重复。
- 日常体验用 `bun run dev` 或 `bun run run` 的 Dev / Preview，通过提交号和 `framework/fia/.fia/framework-build/report.json` 区分开发内容。同版本字符串不能证明开发产物等于公开产物。`bun run build` 仍生成正式身份应用，默认访问正式数据，不用它代替隔离预览。
- 普通交付报告说明“已完成、已验证、尚未发布”；推送源码、应用发行、SDK npm 与官网部署分别按本次授权执行。

## 工作流

- `Build fn`：`main` 提交、PR 或手动触发。执行 check、测试、`build --dmg`（含挂载镜像、签名完整性和应用启动退出检查），上传测试 DMG、校验文件和报告。应用仅 ad-hoc 签名、关闭更新，DMG 不签名公证；不使用发布密钥。
- `Release fn`：`v*` 标签触发正式发布。手动运行也会签名、公证并上传验收产物，但不发布 Release 或 Pages。
- `Publish fn SDK`：独立 `sdk-v*` 标签通过 OIDC 发布 `@semicoder/fn-sdk`；手动运行只验收归档。普通 CI 同时验证 SDK 的 npm 打包和独立插件构建。首次 npm 账号 / Trusted Publisher 配置见 [SDK 发布说明](npm-release.md)。
- 正式流程：版本校验 → 冻结安装根 workspace → 从同一提交构建 FIA → 框架与应用检查 / 测试 → 临时钥匙串 → Developer ID Application 签名应用与 DMG → 对 DMG 公证 / staple / Gatekeeper 验证 → 挂载后验证应用签名、Gatekeeper 和启动退出 → 签名代码更新 → 安装包与更新逐文件比对 → GitHub Release → 保存更新历史到 `fn-updates-site` → Pages 部署。
- 发布按仓库串行运行。已公开 Release 的附件不覆盖；同一 build 的更新内容不可改写；旧标签重跑不得倒退更新源。Pages 部署失败可以重跑发布 job，沿用已发布内容。

## 首次配置

从未配置 Apple 签名时，先按 [Apple 签名与公证逐步操作](apple-signing-setup.md) 准备证书、公证密码及 GitHub 环境。

1. 创建仓库并推送源码。公开仓库可使用免费 GitHub Pages；私有仓库需要支持 Pages 的计划，更新文件仍需能被未登录客户端访问。更新产物包含业务代码，不应包含任何用户数据或凭证。
2. 将 `framework/fia/` 源码、根 workspace 和锁文件一起纳入仓库，CI 从同一提交准备 FIA，再构建应用；无需先公开 FIA 包。旧发行标签的固定归档仅用于历史重现。
3. Settings → Pages → Source 选择 **GitHub Actions**，不配置自定义域名。确认公开地址直接为 `https://semicoder-dev.github.io/fn/`，不得跨域跳转。更新地址写入完整 DMG；组织不能再设置会使项目 Pages 继承其他域名的账号级自定义域名。
4. 创建 `release` 和 `github-pages` Environments，核对待发布标签及手动验收分支的部署许可。首发时 `github-pages` 原先仅允许 `main`，本次保留其他保护、仅新增精确 `v0.1.0` 标签规则。0.2.0 发布经用户明确许可追加精确 `v0.2.0` 规则，其余保护不变。以后每次发布前检查对应标签的 allowlist，按该次发布授权增加必要规则，不改为允许全部分支或标签。保护发布分支及标签，发布凭据仅供可信源码使用。`fn-updates-site` 是新身份的生成数据分支，不将它合回 `main`；旧 `updates-site` / `gh-pages` 仅保留历史，不读取或改写。
5. 在 `release` 环境中配置以下 Secrets，内容不要提交到 Git：

| Secret                        | 内容                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| `APPLE_CERTIFICATE_P12`       | 含私钥的 **Developer ID Application** `.p12` 文件的 Base64 |
| `APPLE_CERTIFICATE_PASSWORD`  | `.p12` 导出密码                                            |
| `APPLE_ID`                    | Apple Developer 登录邮箱                                   |
| `APPLE_TEAM_ID`               | Apple 团队 ID                                              |
| `APPLE_APP_SPECIFIC_PASSWORD` | 用于 `notarytool` 的 Apple 专用密码                        |
| `FIA_UPDATE_PRIVATE_KEY`      | Ed25519 更新私钥的完整 PEM 文本                            |

6. 在 `release` 环境 Variables 设置 `APPLE_SIGNING_IDENTITY`，值为完整身份，如 `Developer ID Application: Your Name (TEAMID)`。此名称参与运行时兼容判断；变更时需要完整安装包。
7. 先手动运行 `Release fn`，确认签名、公证、smoke 和产物校验全部通过，再发布首个标签。

首次生成的更新私钥保存在本机 `.fia/release-secrets/update-private.pem`（权限 0600）；公钥已写入 `release/config.json`。备份私钥并上传 Secret，不能每次发布重新生成。更换公钥需重新安装可信安装包。可用已登录的 GitHub CLI 安全上传，不在终端输出密钥：

```sh
gh secret set FIA_UPDATE_PRIVATE_KEY --repo semicoder-dev/fn --env release < .fia/release-secrets/update-private.pem
base64 < /path/to/DeveloperID.p12 | gh secret set APPLE_CERTIFICATE_P12 --repo semicoder-dev/fn --env release
gh secret set APPLE_CERTIFICATE_PASSWORD --repo semicoder-dev/fn --env release
gh secret set APPLE_ID --repo semicoder-dev/fn --env release
gh secret set APPLE_TEAM_ID --repo semicoder-dev/fn --env release
gh secret set APPLE_APP_SPECIFIC_PASSWORD --repo semicoder-dev/fn --env release
gh variable set APPLE_SIGNING_IDENTITY --repo semicoder-dev/fn --env release --body 'Developer ID Application: Your Name (TEAMID)'
```

GitHub runner 使用临时钥匙串，最后恢复默认钥匙串并删除私钥 / 证书。构建任务仅有仓库读取权限；发布任务才有 Release 与 Pages 写入权限。私钥与签名凭据不进入 artifact。

## 发布版本

`package.json.version` 是版本号，`release/config.json.build` 是严格递增构建号，`fia.config.ts` 引用二者。build 与三段版本号分别管理，升级第二位也不重置 build。发布流程如下：

1. **用户明确提出发布**后，对照待发布清单、最新正式标签及实际代码差异，确定本次内容与版本类别。普通功能、优化和修复集中发布补丁版；大功能或产品阶段升级由用户确认后发布第二位递增的版本。
2. 冻结本次内容和候选提交，不再混入其他特性。把选定条目整理为用户可读的 `release/notes/<version>.md`，说明可见变化、兼容和升级方式；准备对应官网文档及迁移说明。内部构建记录按用户需要取舍，不直接复制整份清单。
3. 仅在发布准备阶段执行一次 `bun run version:app <version>`，同时增加应用版本和 build。审阅版本文件与对应说明，纳入最终发布提交；后续验收固定该提交，修复导致内容变化时重新确认范围和必要检查。未公开候选的重复验收不反复升号。
4. 完成 `bun run release:check`、`bun run check`、`bun run test`、`bun run build`，并按影响验证框架、SDK、独立消费及安装升级；发布前仍须验证 `bun run framework:verify`。需要验收签名公证时运行手动发布工作流，该方式不公开发行。记录实际结果，未验证项目明确列出。
5. 按本次授权将最终发布提交合入 `main` 并推送，在该提交创建和推送精确 `v<version>` 标签；复核 `release` / `github-pages` 环境允许该精确标签。GitHub 正式流程生成、验证并公开 DMG 和更新源。
6. 核验公开产物与更新源，完成下述官网同步，分别记录发行和部署状态。已公开条目从待发布清单移出，保留版本说明和发行证据；其他未发布条目继续归集。官网等遗留交付项单独记录，不能因清单移出就宣称全部完成。

只有明确获准发布且版本范围已确定时，才使用以下示例；`<version>` 为本次发行候选，不是现在应执行的任务。在应用仓库执行：

```sh
# 先准备 release/notes/<version>.md 和受影响官网内容
bun run version:app <version>
bun run release:check
bun run check
bun run test
bun run build
bun run framework:verify
# 完成其他受影响检查，审阅并提交；按授权合入 main，确认 HEAD 为已验发布提交后：
git push origin main
git tag -a v<version> -m 'fn <version>'
git push origin v<version>
```

当前脚本只支持无后缀的 `x.y.z`；预发布不能进入稳定更新源。发布提交必须包含对应的 `release/notes/<version>.md`，发布脚本会将其追加到正式 Release 说明。版本分类和说明完整性由维护者按本流程核对：现有版本脚本只校验格式、递增和 build，发布脚本允许缺少说明；本次不新增脚本约束或 CI。

严重线上问题可以单独发布补丁，仍由用户明确要求。若 `main` 含尚不适合发布的内容，从最新正式标签建立临时 `codex/` 修复分支，只纳入必要修复、版本和说明，沿用该基线对应的构建方式（旧标签可能仍使用固定 FIA 归档），在已验证的修复提交打标签。发布后将修复、版本 / build 基线和发行记录同步回 `main`，调整后续候选并对照清单移出已发行条目，避免重复使用已发布版本或 build。这是先合主干再发布的例外，不把主干中未就绪的内容混入热修复。

Release 与更新源发布完成后，核对正式 DMG 附件、SHA-256、签名公证报告及匿名下载，必须在同一发布任务同步 Semicoder 安装页、项目介绍、受影响使用指南/迁移说明与 `docs/project-sources.md`，并记录官网内容及部署状态。网站主干推送会独立触发部署，按当次授权执行；受阻时明确记录未完成项与完成条件，不能仅以应用已发布宣称整次交付完成。新 Release notes 包含官网与安装页链接，已公开版本不回写。

新安装包与签名更新的 `downloadURL` 仅允许官网安装页。旧个人 GitHub 下载入口和旧更新域名均拒绝；不可改写的历史清单留在旧数据分支及 Release 中。

FIA 的 `runtimeId` 包含 `updates.downloadURL`，因此此次入口修改会改变新安装包的 runtime ID。已有旧入口验收包应完整安装正式 DMG；未来更高 build 的更新发现 runtime ID 不同也会要求完整安装，不能只用代码更新替换该配置。历史清单可读不表示旧安装包与新运行时兼容。

自动更新会在启动时 / 每 24 小时检查并下载；用户确认后生效。设置 → 应用更新可手动操作。模型、插件或登录任务进行时 `beforeUpdate` 阻止切换；安装会重新加载页面，未保存草稿不会跨更新恢复。启动 / 观察失败回退代码，业务数据不回滚，持久化格式更改必须兼容旧代码。独立安装插件不随宿主自动升级。

原生宿主、Bun、权限、图标、更新密钥或签名身份等改变 runtime ID 时，旧客户端提示下载完整安装包，不静默替换 `.app`。初次安装的老版本未包含更新地址，需要手动安装本次新包一次。

## 保留历史与恢复

`fn-updates-site/updates/releases/<build>/` 是不可变目录，每次部署携带新更新站的全部历史，避免客户端取到旧清单后下载 404。不要手工删改。接近 Pages 1 GB 限制时脚本在 900 MB 拒绝发布，需要先规划迁移更新源。安装包仅放 Releases，不进入 Pages。

- 构建、公证或签名失败：没有发布 job；修复配置后重跑。
- Release 已公开但 Pages 失败：重跑失败 job；不覆盖已公开安装包。相同清单可重试。
- 重跑完整 workflow 得到与已发布版本不同的代码文件：拒绝覆盖，升版本 / build 后再发布。
- 已发版本业务出错：提交修复并提高版本 / build，不通过覆盖 `latest.json` 或旧标签强制远程降级。
- 本地可用 `bun scripts/release/verify.ts dist/updates dist/fn.app` 验证更新签名、每个文件及安装包一致性；首发公网清单与文件已独立验收，跨版本客户端升级尚未实测，网站部署另行核实。

依据：[GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[GitHub macOS 签名证书](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications)、[FIA 构建与代码更新](../node_modules/@semicoder/fia/docs/framework/README.md)。


## 历史发行证据（原名，非 fn 发布状态）

## 已公开发行证据

2026-10-11 组织首次发行 **[v0.4.3 / build 7](https://github.com/semicoder-dev/malatang/releases/tag/v0.4.3)** 固定 `34faa9890eed6475516dfa823d664d92181966f5`，[正式工作流 38117729757](https://github.com/semicoder-dev/malatang/actions/runs/38117729757) 成功。公开 DMG 为 35437084 字节，SHA-256 `b83c7fb57aee9829d8adc09086821d8e2eb3cb773fffc554f975c117e16b575f`。五附件 digest、公证票据、Gatekeeper、应用签名、安装包/更新逐文件比对、Bun 1.4.3 与隔离启动退出通过；内嵌 SDK 0.3.2 的 43 个文件与 CI/公开 npm 内容一致。

新 `updates-site` 从空站点初始化，旧 `gh-pages` 保持 `e1030330e8abb788e9ab357fe9e0ef23a5bbd153`。新 HTTPS 清单签名、30 个在线文件的大小/哈希均通过，下载禁止重定向；runtimeId `ee666cda40041089e002b7e202ac69aecc68eca3034208d4346bee27df129a84`。独立 API 失败不视为空历史、旧域名拒绝、版本防倒退和 build 不可变回归包含于 98 项应用测试；共仓 check、build、SDK 与框架独立消费通过。

从公开 DMG 复制安装到临时目录，使用干净数据实际通过新默认市场安装翻译与随手记 0.1.1，插件激活与 KV 读写通过；没有调用真实模型或使用用户数据。已有市场源与插件来源绑定不自动迁移，旧用户使用完整 DMG，卸载旧源插件后手动替换市场源并重装，相同 ID 的 KV/历史保留。官网安装和插件文档随本次迁移单独部署。

以下为历史发行证据：

2026-10-11 已发布 **[v0.4.2 / build 6](https://github.com/potato47/malatang/releases/tag/v0.4.2)**，固定 `b107dee8ae5c6237593f84be8904a9916566a9ec`。主干 [CI 38111323784](https://github.com/potato47/malatang/actions/runs/38111323784)、[签名候选 38111324000](https://github.com/potato47/malatang/actions/runs/38111324000) 与[正式发行 38111793067](https://github.com/potato47/malatang/actions/runs/38111793067) 成功。公开 DMG SHA-256 `e92d4cdd0ca4865f1592178e732201c00a756d129bf7c11e9a974cd590b223b0`，35,436,992 字节；五附件、签名更新及 30 个在线文件已核验，runtimeId `14d936e9e1127d21408150977e041bc2637c9c45d0b368a3bd3673242bc471ba`。本机公证票据、Gatekeeper、应用签名、安装包/更新逐文件比对、Bun 1.4.3、隔离启动退出全部通过。

本地完整 check、97 应用测试、build、SDK 与 FIA 独立消费通过。内嵌 SDK 0.3.1 的 43 个展开文件与正式 npm 内容一致，安装包不携带官方插件。官方翻译/随手记 0.1.0 和 Raw 市场已上线；全新隔离宿主从真实市场安装、原生/浏览器页面、笔记保存与卸载重装 KV 保留通过。同版本更新被拒绝；首次官方发行暂无更高版本，更新成功/回滚通过 fixtures 验证，未声称真实官方跨版本更新已验收。

升级前在旧版卸载手动插件，再用完整 DMG 替换。旧安装记录不迁移，模型、凭证、KV 和历史不主动清除；详见 [0.4.2 说明](../release/notes/0.4.2.md)。SDK npm 与官网分别记录，FIA 独立 npm 继续暂停。

2026-10-11 已发布 **[v0.4.1 / build 5](https://github.com/potato47/malatang/releases/tag/v0.4.1)**，标签固定 `4e222972c1de39a4e241cc3c0b8a2ba8af15fce0`。[主干 CI 38069368438](https://github.com/potato47/malatang/actions/runs/38069368438)、[签名手动验收 38069379373](https://github.com/potato47/malatang/actions/runs/38069379373) 和 [正式发布 38070028805](https://github.com/potato47/malatang/actions/runs/38070028805) 全部成功。框架同提交构建、独立导出消费、77 CLI / 48 Swift、85 应用测试、SDK 消费及 DMG 启动退出通过；FIA 独立 npm 继续暂停。

公开五附件匿名 digest / 大小核对通过，DMG 为 35,652,251 字节，SHA-256 `17c486c7dd4b9132eb784847813aa6090047bb440da8be58c8b709684cc0201f`。本机 hdiutil、公证票据、Gatekeeper DMG / app、codesign、安装包与更新逐文件比对及隔离启动 / ready / 退出 / 进程清理通过；实际内置 Bun 为 `1.4.3+c6da4a4d3`。公网清单与 Release 一致，Ed25519 签名及全部 35 个在线文件大小 / SHA-256 通过；runtimeId `ec123685665929a602e6a12b173814d31699ff1d921332dfd1927a4e7d85fdbf`。内嵌 SDK 快照使用 Bun 打包，npm 归档使用 npm 打包，展开的 43 个文件逐字节一致。

SDK 0.3.0 已首次 OIDC 独立发布，标签固定 `1a66de5`，见 [SDK 发布说明](npm-release.md)。本次需完整 DMG，ChatGPT 旧登录不迁移，需重新登录并添加订阅模型；旧 SDK 插件更新重建，普通密钥 / KV / 外观 / 历史保留。未在本轮操作真实账号、旧钥匙串或调用模型；跨版本代码热更新仍未实测。官网同步内容与部署分别验收。

首个正式流程 38068339105 在测试阶段失败且无公开产物；用户明确允许修复后更新未发布应用标签，重新验收完成后才公开。旧对象保存在本地 refs/archive/v0.4.1-initial，SDK 标签及历史 Release / 更新文件未改写。以下为旧版发行证据：

2026-10-09 已发布 **[v0.4.0 / build 4](https://github.com/potato47/malatang/releases/tag/v0.4.0)**，源码标签 `620d19a450578ca98c58c3ae1b7e13b524e57368`。[主干 CI 37888908778](https://github.com/potato47/malatang/actions/runs/37888908778) 与 [正式发布 37888912203](https://github.com/potato47/malatang/actions/runs/37888912203) 成功，实际消费 FIA 官方 v0.18.0 归档；本机 check / 69 测试 / build 与原生 Dev / Preview 置顶、取消置顶通过。SDK 保持 0.2.1。`github-pages` 仅增加精确 v0.4.0 tag 规则，其余保护未改动。

五项公开附件匿名下载与 digest 核对通过。DMG 为 30,513,939 字节，SHA-256 `8aca60752d1e25a28e50dbd122b03b505ed40088408d73bab0ab7077617ffef7`；独立 hdiutil / stapler / Gatekeeper DMG 与 app / codesign、安装包与签名更新逐文件比对通过。公网清单与 Release 一致，Ed25519 签名和 33 个在线文件大小 / SHA-256 通过。runtimeId `9cd13e79576bff74bb3ca30f659e0cd1e40a9d407b3b0102dd9f2895ee63dbf4`。

公开 DMG 在临时独立数据目录启动，CLI 确认 0.4.0 / build 4 / FIA 0.18.0 / ready，原生 UI 实际点击置顶与取消置顶反馈通过。未操作用户正式账号或调用模型；旧版需要完整 DMG 升级，账号、模型、KV 和历史保留。跨版本代码热更新未实测。Semicoder 安装入口、介绍与置顶指南同步，官网部署单独记录。

2026-10-09 此前已发布 [v0.3.0 / build 3](https://github.com/potato47/malatang/releases/tag/v0.3.0)，标签固定于 `7c0f237986728d13063fd25e38e0a826738af213`。[主干 CI](https://github.com/potato47/malatang/actions/runs/37868718881) 与 [正式发布工作流](https://github.com/potato47/malatang/actions/runs/37868966391) 全部成功。

五项附件经匿名下载与 GitHub digest 核对；`Malatang-0.3.0-3-mac-arm64.dmg` 为 30,516,155 字节，SHA-256 `8784f623d3a97fbf2f7acc7f2e00fa098154f939209aca5503b33d35fc589145`。独立 hdiutil / stapler / Gatekeeper / codesign 与只读挂载应用、签名更新逐文件比对通过；公网清单 Ed25519 签名与全部 33 个在线文件的大小 / SHA-256 通过。runtimeId 为 `2f469910b09105865dc6df75930f16b39c8fa707ebddc31ef8a35844a259f22d`。

正式 DMG 另在本机临时独立数据目录启动，原生首屏 ready、标题栏入口、CLI 浏览器授权、Chromium 动态插件页面及原生文件面板打开通过；退出时面板请求取消、浏览器显示统一失效提示。文件最终选取与超过 30 秒等待、Safari 和模型流的实测证据来自此前本地同实现验收，本次没有再次操作真实模型或用户数据。

0.3.0 原生 Host 已改变，从 0.2.0 或更早版本升级需完整 DMG；账号、配置、KV 和历史保留，SDK 0.2 插件继续兼容。SDK 0.2.1 已独立发布 npm，见 [SDK 发布说明](npm-release.md)。跨版本代码热更新仍未实测；官网由独立 Semicoder 主干工作流同步。

以下为 0.2.0 历史发行证据，新版本不覆盖旧标签或附件：

2026-10-05 已发布 [v0.2.0 / build 2](https://github.com/potato47/malatang/releases/tag/v0.2.0)，标签固定于 `c82d6adebf0f1dfe81ded21ce15ef4b7c15040be`。[正式发布工作流](https://github.com/potato47/malatang/actions/runs/37289643139) 全部成功，五项附件已匿名下载验证。DMG SHA-256 为 `5d8171ab67748b5203f1abf8a3af9938edf474acf12e4441a3370899d34c03b5`；镜像完整性、公证、Gatekeeper、应用签名及安装包与更新逐文件一致性通过。公网清单 Ed25519 签名与 33 个在线文件的 size / SHA-256 校验通过。

0.2.0 使用新的 FIA runtime ID，0.1.0 用户需完整 DMG 升级；旧 SDK 插件需迁移重建，账号、模型配置、KV 和历史保留。SDK 0.2.0 已独立发布 npm，具体方式与 OIDC 验收边界见 [SDK 发布说明](npm-release.md)。跨版本代码更新仍未实测。以下配置步骤用于环境重建；后续发行必须增加版本和 build，不能重建或移动已发布标签。

## 当前 FIA 构建与历史固定包

当前 CI 冻结安装根 workspace，再从同一提交的 `framework/fia/` 构建运行时与 CLI。无需预先发布 FIA；框架检查和应用检查均通过后才生成 DMG / SDK 归档。来源报告记录提交、源码指纹、工具链和产物哈希，缓存仅用于加速。0.4.1 已在真实 GitHub runner 完成共仓构建、框架独立消费和正式签名发布；框架指纹 `6adf4f197a6dd795933c9b4e06ffc7e4ab9882660c4661aac2c074f461375186`，Bun 1.4.3 / Swift 6.3.3 / SDK 26.5。签名公证、更新签名、runtimeId 兼容及环境保护保持，详见 [共仓说明](fia-integration.md)。

以下归档与 runtime lock 仅描述历史发行；保留原标签和附件供重现，不作为当前发布前置条件：

0.4.0 / build 4 使用 FIA 官方 [v0.18.0](https://github.com/semicoder-dev/fia/releases/tag/v0.18.0)，归档来自正式 GitHub Actions 的同一 npm artifact，SHA-256 `faf196b9408cc2fa4b9edfb0145c592a9a87b6fbc0b0245ad6b89c6c0e7ff4e2`，源码 `85206f6f532242fb2dfcfdf2a4b608f131726bf5`。无需复制为麻辣烫的新框架预发布；旧 `fia-runtime-*` 保留供历史版本重现。官方 npm 公开消费与应用正式发行结果分别验收。

0.2.0 所用归档来自 FIA dd430c851192，包含应用子命令和启动等待修复；源码提交、附件名、专用标签及 SHA-256 均在对应历史标签的 runtime lock 中。`0.16.1` 是当时的本地包版本，不表示它与 npm 同版本包内容相同。归档已上传至 [fia-runtime-dd430c851192](https://github.com/semicoder-dev/malatang/releases/tag/fia-runtime-dd430c851192)，不要重复创建该标签或覆盖附件。

历史重现时核对归档 SHA-256，不重新打包后覆盖同一附件；即使源码没变，工具链也可能改变二进制哈希。当前 FIA 修改随应用候选提交一起构建和验证，不再增加固定归档或 runtime lock。未来框架稳定后拆出及恢复 npm 发布，需届时授权和独立验收。

## 0.3.0 浏览器界面与运行时

0.3.0 / build 3 接入 FIA 0.17.0 默认浏览器入口、独立会话与原生权限白名单，以及文件对话框连接与等待修复。`release/runtime-lock.json` 已切换到公开 [fia-runtime-4689c707913c](https://github.com/semicoder-dev/malatang/releases/tag/fia-runtime-4689c707913c)，源码提交 `4689c707913ca31f93b03cfe4deb61466c9e69f2`，归档 SHA-256 `521a07c387efa5b2c7ddbb76807b5c613b5b26cdf6e9c84fb965d27a5dd536b6`；已匿名下载并与验收包逐字节核对。旧归档保留。

本次发布授权下，`github-pages` 仅新增精确 `v0.3.0` 标签许可，其他保护保持不变。Host 标题栏与菜单变化需要完整 DMG，从 0.2.0 或更早版本升级不能只安装代码更新。SDK 为 0.2.1，manifest 兼容版本仍为 0.2；SDK 与应用发行分别验收。浏览器文件选择在白名单内，不开放钥匙串、屏幕捕获或其他被拒绝的 Native 能力。
