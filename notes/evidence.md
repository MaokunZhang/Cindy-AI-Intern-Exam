# Part 0 源码证据

核验版本：`f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。全部链接固定到该 commit，用于核对本次开发宿主的实现；已发布客户端的支持范围按具体版本确认。

| 结论或用途 | 仓库文件与起始行 |
| --- | --- |
| 产品定位、跨设备使用及仓库边界 | [README.zh-CN.md:22](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/README.zh-CN.md#L22) |
| 主要模块及职责导航 | [docs/dev-rules/repo-map.md:37](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/dev-rules/repo-map.md#L37) |
| Agent 抽象与编排不依赖 Electron | [packages/maker-core/package.json:5](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/maker-core/package.json#L5) |
| 桌面应用的入口、脚本与依赖 | [apps/desktop/package.json:2](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/package.json#L2) |
| Expo 手机端及共享包依赖 | [apps/mobile/package.json:6](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/mobile/package.json#L6) |
| 模型目录与路由职责 | [packages/model-providers/package.json:5](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/package.json#L5) |
| 跨设备协议与客户端职责 | [packages/device-link/package.json:5](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/device-link/package.json#L5) |
| ghost.json、main.js 与 UI 文件的插件结构 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-structure.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-structure.md#L1) |
| /kv 的隔离存储、整体覆盖、容量与生命周期 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md:58](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md#L58) |
| 受控文件操作与持久 Library 的区别 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-files-and-library.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-files-and-library.md#L1) |
| 在途 Agent 调用与自主联网的不同声明要求 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md#L1) |
| callId 的绑定、用途与有效期 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-call-context.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-call-context.md#L1) |
| oneshot_text 的声明、调用、模型选择与失败边界 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md:248](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md#L248) |
| 继续任务的公开 agent.run 接口与点击票 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L1) |
| 新建普通任务的 tasks.create 与 send 接口 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md:197](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-agent-tasks.md#L197) |
| 面板展示与生命周期 | [apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-panels.md:1](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-panels.md#L1) |
| 沙箱实际暴露的 send、fetch、fs、agent、tasks 接口 | [apps/desktop/src/preload/ghostPreload.ts:53](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/preload/ghostPreload.ts#L53) |
| 能力检查、模型优先级、JSON 校验与错误处理 | [apps/desktop/src/main/cindy-brain/cindySlot.ts:1506](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/cindySlot.ts#L1506) |
| 调用 requestUtilityText 与宿主模型配置 | [apps/desktop/src/main/cindy-brain/index.ts:5545](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/index.ts#L5545) |
| 显式供应商路径与默认轻量模型路径的分派 | [apps/desktop/src/main/utility-model/oneShotCandidates.ts:335](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/utility-model/oneShotCandidates.ts#L335) |
| /kv 的 GET、PUT/POST 与有界读写实现 | [apps/desktop/src/main/cindy-brain/runtime/ghostKvEndpoint.ts:79](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/runtime/ghostKvEndpoint.ts#L79) |
| 核实严格在途授权及声明 host 的凭证边界 | [apps/desktop/src/main/cindy-brain/networkSlot.ts:1089](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/networkSlot.ts#L1089) |
| 现有快问快答测试组 | [apps/desktop/src/main/cindy-brain/__tests__/cindySlot.test.ts:1825](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/__tests__/cindySlot.test.ts#L1825) |
| 连接人与 Agent、工具、设备及交付物 | [docs/product-rules/core-product-principles.md:32](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/product-rules/core-product-principles.md#L32) |

## 交叉核验发现

- `oneshot_text` 是一次文本生成，不启动带工具的 Agent 任务；宿主手册与 `handleOneshotText`、`requestUtilityText` 接线一致。
- 没有为插件固定模型时才走宿主默认轻量模型链；用户固定模型后失败不会悄悄回落。插件清单的模型偏好解析不到时按未声明处理。
- `expectJson` 只保证 JSON 能解析，不保证条数、字段和单词对应关系；这些仍由插件验证。
- “所有插件联网都必须预先声明域名”不符合当前源码；必须区分严格在途 Agent 调用和插件自主访问。凭证注入仍受声明约束。
- `/kv` 是有限容量、整体覆盖的插件配置存储，不适合密钥或无上限的历史记录。
- 仓库地图属于定位入口；例如其中对 Mobile 依赖包数量的概述未完全跟上当前 package.json，导览不使用该数量。

## 已运行的验证

命令（在 Cindy 源码根目录、专用 Node/pnpm 环境中执行）：

```powershell
pnpm --filter desktop exec vitest run src/main/cindy-brain/__tests__/cindySlot.test.ts -t '快问快答' --maxWorkers=2
```

结果：1 个文件通过，11 个测试通过，122 个不匹配筛选条件的测试跳过；总耗时 3.94 秒。未修改测试。
这些是宿主层的现有单元测试，不能替代真实账号、实际模型响应、插件安装或端到端运行验证。
