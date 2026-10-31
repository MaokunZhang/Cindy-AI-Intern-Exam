# Cindy 项目导览

面向新同事｜基于源码 `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`｜2026-10-31

Cindy 是一个把 AI Agent 接入真实工作的开源客户端：用户在统一界面使用 Claude Code、Codex 或 Pi，连接模型、文件、浏览器和插件，让 Agent 完成任务；电脑与手机可以继续访问同一任务。这个仓库包含桌面端、手机端及共享代码，服务端另仓维护。 依据：[README](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/README.zh-CN.md#L22)、[产品原则](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/product-rules/core-product-principles.md#L32)。

## 主要组成

| 位置 | 职责 |
| --- | --- |
| `apps/desktop` | Electron 桌面端。main 承担宿主能力、任务与插件运行；renderer 显示界面；preload 提供受控桥接。 |
| `apps/mobile` | Expo / React Native 手机端，提供移动交互及远程访问电脑任务与能力的入口。 |
| `packages/maker-core` | Agent 抽象、任务编排和事件流；核心逻辑不依赖 Electron。 |
| `packages/model-providers` / `packages/device-link` | 前者管理模型目录及路由；后者处理跨设备协议、请求配对和重连。maker-shared 提供共享数据契约。 |
| `config / scripts / tools / docs` | 分别保存端点配置、工程脚本、配套运行文件的版本与下载逻辑、开发和产品规则。 |

模块依据：[仓库地图](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/dev-rules/repo-map.md#L37)、[maker-core/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/maker-core/package.json#L5)、[mobile/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/mobile/package.json#L6)、[model-providers/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/package.json#L5)、[device-link/package.json](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/device-link/package.json#L5)。

## 插件可以复用什么

**存储**：fetch('/kv') 保存隔离的 JSON 配置；文件用 cindy.fs。需长期保留的用户作品可用 Library，其数据不会随卸载删除。 依据：[plugin-settings.md:58](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md#L58)、[plugin-files-and-library.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-files-and-library.md#L1)。

**联网**：cindy.fetch 由宿主代发。当前 Agent 调用凭有效 callId 访问普通 HTTPS；自主联网须声明域名，托管凭证须显式声明并匹配目标域名。 依据：[plugin-network.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md#L1)、[plugin-agent-call-context.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-call-context.md#L1)。

**模型**：声明 cindy.text: ["oneshot"] 后，经 cindy.send 请求 oneshot_text，复用宿主快速模型通道；适合例句、摘要等一次文本生成。 依据：[plugin-runtime.md:248](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md#L248)、[cindySlot.ts:1506](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/cindySlot.ts#L1506)。

**Agent 与界面**：cindy.agent.run 可继续关联任务；新工作用 cindy.tasks.create / send。插件还可提供工具、聊天卡片和面板，按接口声明能力并接受宿主授权。 依据：[plugin-agent-tasks.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L1)、[plugin-agent-tasks.md:197](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L197)、[plugin-panels.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-panels.md#L1)。

插件以 `.cindy` 包分发；`ghost.json` 描述身份与能力，`main.js` 承接逻辑，HTML/CSS/JS 提供界面。宿主实现入口在 `apps/desktop/src/main/cindy-brain/`。依据：[插件目录手册](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-structure.md#L1)、[公开桥接接口](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/preload/ghostPreload.ts#L53)。

## 阅读过程与 AI 使用

我委托 Codex 先读原题、AGENTS.md、README 与仓库地图，再查各模块 package.json；随后按插件手册定位存储、联网、模型和任务接口，并交叉核对 preload、宿主实现和已有测试。Codex 完成检索与初稿整理；11 个快问快答定向测试通过。初始阅读后，已完成插件导入、真实模型生成与缓存验证，详见[运行记录](../notes/daily-word-cards-verification.md)。
