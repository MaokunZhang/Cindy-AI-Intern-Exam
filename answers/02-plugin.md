# B1：我的 PR 看板

## 实现前的四个设计判断

### 1. 选择常驻面板

这是一项反复查看、比较和筛选多个 PR 的工作，适合独立于某次聊天的常驻面板。纯工具要求用户每次发起对话；聊天卡片适合展示一次查询结果，但旧消息里的状态很快过期。面板可以持续显示列表、更新时间和刷新入口，切换聊天时仍保留看板。

实现使用 `panel.position: "right"`。这里的“常驻”描述界面，不等于后台进程一直运行：逻辑页采用 `launch: "on-demand"`，打开和手动刷新时获取数据，先不做定时轮询。用户已确认“待处理”包括我发起的、分配给我的、请求我评审的三类未关闭 PR，按 `owner/repo#number` 合并并保留各类关系标签。

### 2. 看板属于插件主动联网，需要声明

打开面板、点刷新并没有正在执行的 Agent tool-call，因此使用自主网络能力：在 `ghost.json` 声明 `network.hosts: ["api.github.com"]`，由逻辑页调用 `cindy.fetch`。界面不直接访问 GitHub，也不伪造 `callId`。

另一种情况是 AI 正在调用插件工具：把宿主给出的真实 `msg.callId` 传入 `cindy.fetch`，普通 HTTPS 请求可以不预先声明域名，宿主仍执行 URL、SSRF、体积、超时和重定向检查。**涉及宿主凭证代发时，两种路径都必须声明凭证和注入范围**；有在途调用不等于能把 Token 发往任意地址。

### 3. Token 由用户提供，交给 Cindy 保管

最小版本使用用户为目标仓库授权的 GitHub PAT。优先使用限制到所需仓库的 fine-grained PAT，配置 Pull requests、Checks、Commit statuses 的读取权限；额外读取 Actions 信息时再加 Actions 读取权限。看板展示 Token 可见范围内的 PR。

清单声明 `network.secrets`，由设置页通过 `PUT /secrets/github_token` 一次性交给宿主凭证保险库。Host 加密保存，只向 `api.github.com` 注入 `Authorization: Bearer {value}`。页面只读取“是否保存”状态，逻辑页、普通 KV、源码、日志和 AI 消息均不保存 Token。设置页提供替换和清除入口。

第三方插件不能使用官方 `cindy-github` 专属的 `source: "gh-cli"`，也不应读取 Git Credential Manager 或其它插件的凭证。完整产品可以接入自己注册并获准使用的 OAuth；本题采用 PAT，避免假装拥有官方插件的登录能力。

### 4. 点 PR 后新建可见的普通 AI 任务

点击“让 AI 排查 CI”后，先重新读取该 PR 当前的 `head.sha` 和 CI 证据，再用 `cindy.tasks.create` 创建普通任务，用 `cindy.tasks.send` 派发用户消息；清单声明 `agent: { tasks: true }`。任务标题包含仓库和 PR 编号，正文包含 PR 链接、提交 SHA、失败检查、摘要、注释及相关链接，让 AI 解释失败原因、给出修复建议与验证步骤。缺少详细日志时，明确列出下一步要读取的检查，不能把状态红灯本身当成根因。

请求进入普通用户消息，不进入 system prompt。任务沿用 Cindy 的模型与权限设置；面板保存请求键、taskId、runId，显示“已提交”与真实运行状态，用户可在任务列表查看和继续。相同点击重传使用相同请求键，避免重复派活；接口受理不等于分析完成。

PR 标题、描述和 CI 输出作为外部资料处理，不能变成新的执行指令。最小版本只提出诊断任务，不自动重跑工作流、修改代码、评论或合并 PR。

## 实现计划与验收

先完成三类 PR 分页查询、去重、关系筛选和手动刷新。CI 按当前 head SHA 合并 Checks 与 Commit statuses；失败优先于运行中，通过需要已完成且没有失败。无检查、查询失败、取消或跳过分别展示，避免把“没有数据”画成通过。搜索达到 GitHub 上限、接口缺权或限流时给出明确提示。

随后验证浅色/深色与窄面板布局、Token 缺失/401/403/429、查询分页、CI 聚合和重复点击。最后在 Cindy 导入安装包，连接真实 GitHub 数据，点击 PR 创建任务，记录运行截图和实际结果。

## 查阅依据

宿主为本机 Cindy 开发版 `0.0.0 · main@f283cce`，对应官方源码 commit `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。

- [面板与主题契约](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-panels.md)
- [网络与凭证契约](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md)
- [普通任务 API](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#4113-新建任务与继续任务普通-session)
- [GitHub Search：分页、搜索上限与授权范围](https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests)
- [GitHub Check runs](https://docs.github.com/en/rest/checks/runs)
- [GitHub Commit statuses](https://docs.github.com/en/rest/commits/statuses)

## 实现与运行记录

本节在实现和实机验证后补充；以上四项设计先于插件代码保存。
