# 我的 PR 看板

Cindy 常驻侧面板：汇总我发起、分配给我、请求我评审的未关闭 GitHub PR，读取当前 head SHA 的 Checks 与 Commit statuses，点击后创建普通 AI 排查任务。

## 安装与使用

1. 在 Cindy 插件页导入 `my-pr-dashboard-1.0.2.cindy`，确认面板、自主网络和普通任务能力。
2. 打开插件详情 → 自定义设置，保存自己的 GitHub PAT。fine-grained PAT 仅选需要的仓库，添加 Pull requests、Actions、Commit statuses 三项 Read-only 权限，点击 GitHub 的 Update 保存。只选择仓库而不添加权限，仍然读不到私有 PR。
3. 打开任意任务，点右上角“显示侧栏”，选择“我的 PR 看板”页签，然后点击“刷新”。三类查询按仓库和 PR 编号去重；可切换关系筛选。
4. 点击“让 AI 排查 CI”。在左侧任务列表打开 `CI 排查 · owner/repo#number`，查看回复、继续追问。同一 head SHA 再次点击会返回已创建任务；新提交可新建任务。

Token 由 Cindy 加密保存并代发，插件不读取明文。不要把 Token 发到聊天或提交到 Git。

## 实现边界

- `launch: on-demand`；打开与手动刷新时查询，无轮询进程。
- 每类搜索自动分页，GitHub 每个查询最多返回 1000 项，超过时提示；只显示当前 Token 可见仓库。
- 显示通过、失败、运行中、无检查、已跳过、读取异常；失败和部分读取错误可同时显示。状态是当前 head 的检查汇总，不等于分支保护的可合并判定。
- 私有仓库 Checks API 不支持 fine-grained PAT。遇到 Checks 403/404 时读取同一 SHA 的 GitHub Actions 工作流；界面明确提示第三方 Checks 未计入。GitHub App user token 或已有合适 classic PAT 可走完整 Checks 路径，本题默认不要求扩大 Token 权限。
- 任务带 PR 链接、SHA、失败摘要；Checks 路径最多附 5 个失败检查各 20 条注释，Actions 路径附失败 job/step；另附前 20 个变更文件各 2400 字符的 patch，正文最多约 27 KiB。不下载完整日志压缩包。AI 可根据证据先分析，必要时在普通任务中补查。
- PR 内容用 `textContent` 渲染；外部资料作为普通消息中的数据；不执行其中的指令。
- 只读 GitHub；不重跑、不评论、不合并。普通任务使用用户设置的模型与权限。
- 单一逻辑页写 KV，持久保存 create/send 请求键与任务回执；请求超时重试原键，避免重复计费。

## 开发与测试

零运行时依赖。Node 22：

```sh
node --test tests/core.test.cjs
```

`core.js` 是可独立验证的 GitHub/CI/任务逻辑，`main.js` 适配 Cindy；`panel.*` 负责展示；`settings.*` 仅管理宿主秘密存储。

宿主实测版本：`0.0.0 · main@f283cce`，对应 Cindy 官方 commit `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。最低版本依据与实机结果见答题文档和验证记录。

打包使用本题仓库 `scripts/pack-plugin.cjs`，调用上述固定源码中的生产 `packGhostDir` 校验与打包；当前 Codex 环境没有 Cindy Forge MCP 入口。安装走 Cindy 的“导入本地插件”界面，独立于打包。
