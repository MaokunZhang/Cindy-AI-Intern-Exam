# Part 0 上手题回答

基于 Cindy 源码 `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。本回答先完成阅读与设计判断，再实现单词卡插件；最终三问回答与实现见 [每日单词卡](00b-daily-word-cards.md)，真实运行证据见 [验证记录](../notes/daily-word-cards-verification.md)。

一页排版版见 [Cindy 项目导览](Cindy项目导览.docx)。以下保留导览全文及单词卡三问，便于评阅和后续编辑。每条源码链接均固定到本次核验的 commit。

## Cindy 项目导览

面向新同事｜基于源码 `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`｜2026-10-31

Cindy 是一个把 AI Agent 接入真实工作的开源客户端：用户在统一界面使用 Claude Code、Codex 或 Pi，连接模型、文件、浏览器和插件，让 Agent 完成任务；电脑与手机可以继续访问同一任务。这个仓库包含桌面端、手机端及共享代码，服务端另仓维护。 依据：[README](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/README.zh-CN.md#L22)、[产品原则](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/product-rules/core-product-principles.md#L32)。

### 主要组成

| 位置 | 职责 |
| --- | --- |
| `apps/desktop` | Electron 桌面端。main 承担宿主能力、任务与插件运行；renderer 显示界面；preload 提供受控桥接。 |
| `apps/mobile` | Expo / React Native 手机端，提供移动交互及远程访问电脑任务与能力的入口。 |
| `packages/maker-core` | Agent 抽象、任务编排和事件流；核心逻辑不依赖 Electron。 |
| `packages/model-providers` / `packages/device-link` | 前者管理模型目录及路由；后者处理跨设备协议、请求配对和重连。maker-shared 提供共享数据契约。 |
| `config / scripts / tools / docs` | 分别保存端点配置、工程脚本、配套运行文件的版本与下载逻辑、开发和产品规则。 |

模块依据：[仓库地图](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/dev-rules/repo-map.md#L37)、[maker-core/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/maker-core/package.json#L5)、[mobile/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/mobile/package.json#L6)、[model-providers/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/package.json#L5)、[device-link/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/device-link/package.json#L5)。

### 插件可以复用什么

**存储**：fetch('/kv') 保存隔离的 JSON 配置；文件用 cindy.fs。需长期保留的用户作品可用 Library，其数据不会随卸载删除。 依据：[plugin-settings.md:58](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md#L58)、[plugin-files-and-library.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-files-and-library.md#L1)。

**联网**：cindy.fetch 由宿主代发。当前 Agent 调用凭有效 callId 访问普通 HTTPS；自主联网须声明域名，托管凭证须显式声明并匹配目标域名。 依据：[plugin-network.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md#L1)、[plugin-agent-call-context.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-call-context.md#L1)。

**模型**：声明 cindy.text: ["oneshot"] 后，经 cindy.send 请求 oneshot_text，复用宿主快速模型通道；适合例句、摘要等一次文本生成。 依据：[plugin-runtime.md:248](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md#L248)、[cindySlot.ts:1506](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/cindySlot.ts#L1506)。

**Agent 与界面**：cindy.agent.run 可继续关联任务；新工作用 cindy.tasks.create / send。插件还可提供工具、聊天卡片和面板，按接口声明能力并接受宿主授权。 依据：[plugin-agent-tasks.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L1)、[plugin-agent-tasks.md:197](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L197)、[plugin-panels.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-panels.md#L1)。

插件以 `.cindy` 包分发；`ghost.json` 描述身份与能力，`main.js` 承接逻辑，HTML/CSS/JS 提供界面。宿主实现入口在 `apps/desktop/src/main/cindy-brain/`。依据：[插件目录手册](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-structure.md#L1)、[公开桥接接口](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/preload/ghostPreload.ts#L53)。

### 阅读过程与 AI 使用

我委托 Codex 先读原题、AGENTS.md、README 与仓库地图，再查各模块 package.json；随后按插件手册定位存储、联网、模型和任务接口，并交叉核对 preload、宿主实现和已有测试。Codex 完成检索与初稿整理；11 个快问快答定向测试通过。初始导览阶段未验证 GUI、账号或真实模型调用；后续已完成插件导入、真实例句生成与缓存复用验证，详见运行记录。

## 每日单词卡的设计判断

### 插件怎样用上模型

我会复用 Cindy 已提供的快问快答能力。插件清单声明 `cindy.text` 包含 `oneshot`，逻辑页通过公开的 `cindy.send` 发送 `type: 'cindy-request'`、`kind: 'oneshot_text'` 和提示词。由宿主选择并调用已有模型通道，插件收到文本结果；如果源于 Agent 的 tool-call，就透传当次 `msg.callId` 供归因。

这里的任务是“根据已给定的单词和工作场景生成例句”，无需工具访问、文件读取或多步执行，因此一次文本请求即可；只有需求扩展为读取工作资料或进行调查时，才考虑适当授权后的 Agent 任务。工作场景应由用户明确提供，例如岗位、行业和常用沟通情境；快问快答不会自动读到用户文件或整段会话。

具体流程是：按用户本地日期选择 10 个词，把词表和用户提供的工作场景一次送入请求，要求返回逐词对应的结构化结果。可以设置 `expectJson: true`，但插件仍需验证恰好 10 条、字段类型、单词一一对应以及例句非空。当天结果按日期、词表及场景版本缓存，重复打开直接展示；词表或场景改变时再生成。以上是写代码前形成的设计；后续实现和实际验证见单词卡正式回答与运行记录。

模型选择的实际优先级是：用户为该插件明确选择的模型组合 → 清单中可解析的 `oneshotModel` 偏好 → 系统辅助模型链。为减少配置负担，我的初版不固定模型，跟随宿主默认设置；如果用户主动固定模型，失败就明确报告，不能擅自切换。

### 用户是否需要额外配置

如果 Cindy 已有可用的快速模型通道，用户无需为此插件另申请或输入模型 API Key。用户需要提供或选择工作场景，并批准插件所声明的能力；独立的插件模型选择是可选项。

这不等于任何安装状态都能零配置使用：若宿主没有可用模型或凭证，可能返回 `NO_CANDIDATE`，应引导用户在 Cindy 的模型设置中完成配置；如果用户明确选定的通道失效，就报告该通道问题。调用仍可能消耗用户订阅额度或产生模型费用。“每天展示”可在每天首次打开时更新；若要求未打开时也按时预生成，需要另行设计自动化，不能假设插件沙箱长期运行。

### 如何评价插件直接收集 OpenAI API Key

这个需求已有宿主接口，我不采用“每个插件再加一个 OpenAI Key 输入框”的方案。它会要求用户重复配置，把功能绑定到特定供应商，并在插件内重复承担模型选型、凭证和错误处理；用户已经配置的订阅、供应商或本地能力也无法自然复用。

如果未来接入的是宿主不提供的专用第三方服务，可以讨论独立凭证方案；凭证应通过宿主声明的 `network.secrets` 等机制托管，限制注入域名，不能保存到 `/kv`、普通浏览器存储、日志或源码。需要带凭证的请求仍要按网络契约声明，不能因为有 `callId` 就假设主机会向任意地址注入 token。

### 失败与验证范围

明确处理 `NO_CANDIDATE`、`TIMEOUT`、`BAD_MODEL_OUTPUT` 和权限拒绝；保留已有卡片并展示原因，不在后台无限重试。JSON 可解析并不保证教学内容正确，例句贴合度和质量还需真实样本验证。初始阶段完成方案、源码核验及 11 个已有定向单元测试；随后实现插件，12 项新增核心测试、8 项模拟浏览器检查及一次真实模型生成通过。关闭重开面板复用缓存，真实模型请求次数未增加。

依据：

- [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md:248](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md#L248)：oneshot_text 的声明、调用、模型选择与失败边界。
- [apps/desktop/src/preload/ghostPreload.ts:53](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/preload/ghostPreload.ts#L53)：沙箱实际暴露的 send、fetch、fs、agent、tasks 接口。
- [apps/desktop/src/main/cindy-brain/cindySlot.ts:1506](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/cindySlot.ts#L1506)：能力检查、模型优先级、JSON 校验与错误处理。
- [apps/desktop/src/main/cindy-brain/index.ts:5545](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/index.ts#L5545)：调用 requestUtilityText 与宿主模型配置。
- [apps/desktop/src/main/utility-model/oneShotCandidates.ts:335](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/utility-model/oneShotCandidates.ts#L335)：显式供应商路径与默认轻量模型路径的分派。
- [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md:58](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md#L58)：/kv 的隔离存储、整体覆盖、容量与生命周期。
- [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md#L1)：在途 Agent 调用与自主联网的不同声明要求。
- [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md:197](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L197)：新建普通任务的 tasks.create 与 send 接口。
- [apps/desktop/src/main/cindy-brain/__tests__/cindySlot.test.ts:1825](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/__tests__/cindySlot.test.ts#L1825)：现有快问快答测试组。


## 提交记录

实现前的两次本地设计提交：

1. `b2fcf0d109f8a629c1d2da171d48bb5b5723f9bf` — `docs(part0): map Cindy architecture and verify plugin capability evidence`。记录项目导览、实际阅读过程、源码依据和定向测试结果。
2. `d8cec8143a9e403fd970210e2f0300387752e7f6` — `docs(part0): answer vocabulary model design and deliver one-page guide`。补充单词卡三问、失败与配置边界、经渲染确认的一页 Word 导览，以及完整答题稿。后续插件实现与运行证据另行提交，完整记录以 `git log --oneline` 为准。

2026-10-31 已推送到个人私有仓库 [https://github.com/MaokunZhang/Cindy-AI-Intern-Exam](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam)，分支为 `main`。原有阅读、设计、实现和验证提交完整保留，详细说明见 [C 部分：提交记录](00c-submission.md)。评阅者需拥有仓库访问权限。
