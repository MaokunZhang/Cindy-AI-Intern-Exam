# Part 0 · 一个具体需求：每日单词卡

题目要求在写代码前回答设计问题。设计判断已先记录在 `00-onboarding.md`，并提交于 `d8cec81`；随后按用户要求实现插件。以下整理三问的正式回答与最终实现，运行记录单独保存在 `notes/daily-word-cards-verification.md`。

## 1. 插件应该怎样用上模型？依据是什么？

复用 Cindy 的 **快问快答 `oneshot_text`**。本需求的输入已经完整：十个单词和用户填写的工作场景；输出只是十条例句，不需要 Agent 读取文件、使用工具或规划多步任务，因此一次文本请求足够。

清单中声明：

```json
"cindy": { "text": ["oneshot"] }
```

由插件逻辑页调用公开桥接接口：

```js
const result = await cindy.send({
  type: 'cindy-request',
  kind: 'oneshot_text',
  prompt,                // 十个指定单词 + 用户明确填写的工作场景
  expectJson: true
});
```

宿主负责模型选择和调用。优先级为用户为插件明确选择的模型组合、清单中的有效 `oneshotModel` 偏好、系统辅助模型链。这个初版不固定供应商或模型，跟随 Cindy 的现有设置。若用户主动固定了模型，失败应明确报告，不能偷偷换用别的模型。

本插件从面板按钮触发，因此不虚构 `callId`；如果以后增加由 Agent 调用的工具，应透传真实 `msg.callId` 供宿主归因。

仓库依据均固定到实际开发宿主的 commit `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`：

- [plugin-runtime.md:248](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-runtime.md#L248)：声明方式、`oneshot_text` 请求、模型选择、响应和错误约定。
- [ghostPreload.ts:53](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/preload/ghostPreload.ts#L53)：插件沙箱实际获得的 `cindy.send` 等公开接口。
- [cindySlot.ts:1506](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/cindySlot.ts#L1506)：检查文本能力、选择模型、处理超时和 JSON 结果。
- [cindy-brain/index.ts:5545](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/cindy-brain/index.ts#L5545)、[oneShotCandidates.ts:335](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/src/main/utility-model/oneShotCandidates.ts#L335)：实际接入 `requestUtilityText`，复用宿主模型通道。

`expectJson` 只保证可解析，不保证业务正确。所以我额外验证：恰好十项、词条一一对应且不重复、例句和中文翻译非空且有长度限制、英文例句包含指定词。按词库顺序展示，并使用本地可信释义。模型文本用 `textContent` 渲染，不能当作 HTML 执行。

## 2. 用户需要额外配置什么？为什么？

**已经配置好可用模型的 Cindy 用户，不需要为插件再申请或填写模型 API Key。** 用户填写或修改自己的工作场景即可；首次安装要在 Cindy 中确认插件能力。单独为插件选择模型属于可选配置。

这不等于任何安装状态都能零配置使用。如果 Cindy 本身没有可用模型或凭证，宿主可能返回 `NO_CANDIDATE`；应引导用户在 Cindy 的模型设置中完成配置。权限未批准、模型超时或供应商限流也需要按对应原因处理。调用可能消耗既有订阅额度或产生模型费用。

工作场景需要显式传入提示词，因为快问快答不会自动读到用户文件、项目资料或整段对话。本插件不为这项需求申请文件、网络直连或 Agent 权限。

本地词库包含 70 个工作常用词，每日取一组十词，连续七天不重复。同一天的日期、词表、工作场景及缓存版本一致时，直接复用成功结果；改变场景或手动重新生成才再次调用。通过宿主 `/kv` 保存最后一次成功的批次，生成失败不覆盖旧记录。依据：[plugin-settings.md:58](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-settings.md#L58)。

“每天展示”在此版本中指当天打开面板时更新，面板跨午夜或恢复前台时也检查日期。第一次由用户点击生成，之后有已保存场景时自动获取当天例句。Cindy 未运行时不会后台预生成；若需求进一步要求定时推送，需要另行设计自动化。

## 3. 如何评价「填写自己的 OpenAI API Key，插件直接调接口」？

这个需求已有宿主接口，我不采用该方案。它要求用户重复配置，把功能绑定到一个供应商，还让每个插件重复承担模型路由、凭证保护和错误处理。用户在 Cindy 中已有的可用通道也无法自然复用。

此外，普通插件沙箱不能任意直接联网。不能假设在面板中加一个 Key 输入框，再直接 `fetch` 外部模型接口就符合 Cindy 的接口与安全约定。API Key 也不应写进源码、日志、普通浏览器存储或 `/kv`。

若未来需求确实依赖 Cindy 未提供的专用第三方服务，可以讨论独立凭证；应通过宿主的 `network.secrets` 等机制声明并托管，限定凭证注入域名，使用宿主网络代理。不能因为请求带有 `callId`，就认为凭证可注入任意地址。依据：[plugin-network.md](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-network.md#L1)、[plugin-sandbox.md](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/apps/desktop/resources/system-skills/cindy-plugin-creator/references/plugin-sandbox.md#L1)。

## 实现与交付

源码位于 `plugins/daily-word-cards/`，使用说明在该目录的 `README.md`。它提供工作场景编辑、每日十词、英文例句与中文翻译、缓存、重新生成及明确错误提示。`main.js` 负责 Cindy 调用及单点存储写入；`core.js` 负责可测试的日期、校验和缓存逻辑；面板通过 `/wake` 与同源 BroadcastChannel 连接后台，并按请求 ID 去重。

最小版本暂不包含自定义词库、发音、间隔复习或后台定时推送。结果校验只能排除结构错误，无法证明语法、事实和教学质量；真实例句仍需人工抽查。

代码由 Codex 根据 Cindy 随包插件开发手册和宿主源码实现，并使用 Cindy 的生产 Forge 打包器生成 `.cindy` 文件。实际客户端导入和模型调用的结果以运行记录为准。源码按题目要求保留在 Git 仓库中；`.cindy` 是供客户端安装的产物，不代替 GitHub 源码提交。

本次实测：插件已安装在 Cindy，使用 `xd/deepseek/deepseek-v4-flash` 一次生成十条例句，宿主日志间隔约 5.159 秒；关闭并重开面板后缓存完整恢复，模型请求次数未增加。12 项核心单元测试和 8 项使用模拟模型的浏览器检查通过。完整证据见 [验证记录](../notes/daily-word-cards-verification.md) 和 [真实例句](../notes/daily-word-cards-live-examples.md)。
