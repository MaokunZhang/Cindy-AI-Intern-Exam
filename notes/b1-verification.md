# B1「我的 PR 看板」验证记录

## 环境与版本

- Windows Cindy 开发版 `0.0.0 · main@f283cce`，官方源码 commit `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`；Cindy 核心未修改。
- 插件最终版本 `1.0.3`；普通任务 API：`cindy.tasks.capabilities/create/send/getRun`；网络 `cindy.fetch`；Token 为 Host `/secrets`；回执为插件 `/kv`。
- 最低版本 `0.1.97`，其正式标签已经包含所需[普通任务 API](https://github.com/makecindy/cindy/blob/v0.1.97/apps/desktop/src/main/cindy-brain/taskSlot.ts)。
- 设计提交 `5b8b587` 先于实现提交 `e8e288c`；`3c9bc3a` 修复外链，`84e063f` 增加 Actions 降级。

## 自动化验证

`node --test tests/core.test.cjs`：**14 / 14 通过**。覆盖分页与三类关系去重、当前 SHA、最新 status context、失败优先级、权限与限流错误、响应截断、Actions 降级与失败步骤、未读取注释数量不填 0、持久请求键、send 回执丢失后恢复、保存失败、连续点击、外部 runId 拒绝、证据字节上限。

`tests/browser-smoke.cjs`：**9 项检查通过**。运行真实 main/core/panel/settings，只替换 Host 与 GitHub 响应。验证 CI 标记、筛选、重复点击只发送一次、任务终态、300px 窄屏与深色、Token 只交给秘密存储且输入清空、不进入 KV、页面无脚本错误和同页外链。`screenshots/b1-fixtures` 为模拟数据截图，不能替代实机证据。

GitHub main 最终代码提交 `dbe0fdc` 的正式测试：[run 41170182532](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/actions/runs/41170182532)，`completed / success`。最终版本的本地 14 / 14 与 9 项检查在打包前再次通过。

## 打包与导入

当前环境没有 Cindy Forge MCP 工具入口，调用固定源码中的生产 `packGhostDir`，实际执行清单校验与打包；再用 Cindy 的“从文件安装”导入。不是手工修改 Host 安装目录或授权记录。

- 安装包：`my-pr-dashboard-1.0.3.cindy`
- 大小：22,551 字节
- SHA-256：`aa9b73426a3f415f5534235b078d701ca4ea37805dbe616f4126ad2d09227139`
- 初次能力授权、PAT 输入与权限设置由用户完成。1.0.3 已实际导入，详情页显示该版本与“Token 已保存”；后续版本保持同一能力声明与 Token。

## 真实 GitHub → Cindy → AI 链路

1. 用户补充 PAT 的 Pull requests、Actions、Commit statuses 读取权限后，Cindy 显示 `@MaokunZhang` 的 1 个待处理 PR，CI 为失败。
2. [验收草稿 PR #1](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/pull/1) head：`e9471c60f5b48171ed6b48492d5ca4a71391d780`。两个 Actions run `41168716430`、`41168713361` 的失败步骤均为 `Emit a reproducible diagnostic for the PR dashboard`。
3. 点击排查按钮，Cindy 创建可见普通任务 `CI 排查 · MaokunZhang/Cindy-AI-Intern-Exam#1`，消息来源标记为插件。
4. Pi · DeepSeek V4 Flash 完成真实回复，识别工作流 `exit 1` 的故意失败，并给出结论、证据、建议和验证步骤。界面显示本次约 $0.01、工作 3m 4s，任务 `e28ec3cf`；这些是宿主当时显示值。
5. 面板调用 `getRun` 得到 `completed`。再次点击相同 PR/head，提示已有任务，未新建第二个任务。

实机截图：`01-live-pr-list.png`、`02-task-submitted.png`、`03-live-ai-conclusion.png`、`04-live-completed.png`、`05-installed-1.0.3.png`。前四张记录 1.0.2 的实际运行；随后据 AI 回复中发现的注释数量问题修正为 1.0.3，最后一张展示升级后的安装与 Token 状态。

## 问题与修正

- `_blank` 外链不触发宿主正常导航：改为同页链接。1.0.3 在 Cindy 点击“前往 GitHub 创建”，Chrome 实际打开新建 fine-grained PAT 页面；仅核对导航，未创建新 Token。
- PAT 只有仓库范围、没有读取权限：用户补齐后恢复真实查询。
- fine-grained PAT 不支持私有 Checks 读取：改用 Actions，并提示第三方 Checks 未计入。参考 [GitHub Check runs 鉴权类型](https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference)。
- Actions 没有注释数量，最初却填 0，误导 AI 追加排查：1.0.3 不再填入该数值，明确写未读取。
- 首次本地 UI 测试被沙箱拦截回环网络，批准本机测试后通过。扩展 PR 文件差异后，测试 mock 的宽泛 `/pulls/` 匹配误吞 `/files`，已精确匹配 PR 详情路径并补齐文件响应；产品请求路径正确。
- 旧伙伴对话的 `cindy_openai` / `cindy_gateway` 不匹配错误只影响该旧对话。新建 Pi / DeepSeek 任务已完成；没有为测试改动全局 provider。

## 复测

在任意 Cindy 任务点“显示侧栏”→“我的 PR 看板”→“刷新”。点击 PR 排查，在左侧打开同名任务，点面板“查看运行状态”。现有 head 会复用原任务；PR 有新提交时可创建新任务。

验收分支故意为红灯，main 正式测试为绿灯。保留该草稿供复测，不合并。未实现的扩展包括自动轮询、完整日志下载和第三方 Checks 的 GitHub App OAuth。
