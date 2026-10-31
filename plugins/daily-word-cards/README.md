# 每日单词卡

Part 0「一个具体需求」的最小插件。每天按电脑本地日期展示 10 个英语单词，调用 Cindy 的快问快答生成工作场景例句与中文翻译。

## 使用

在 Cindy 的插件页导入 `daily-word-cards-1.0.0.cindy`，打开「每日单词卡」，填写工作场景后点击「生成今日例句」。首次安装需要按宿主提示审阅能力。

同一天、同一场景重复打开会读取缓存；下一天打开时生成新的十词例句。修改场景后点击生成，或点击「重新生成」，会产生一次新的模型请求。插件跟随 Cindy 的可用模型设置，不要求另填 OpenAI API Key。

## 实现

- `ghost.json`：Manifest v3，仅声明文本快问快答与插件页内面板。
- `core.js`：70 词循环、当地日期、提示词、结果校验与缓存服务。
- `main.js`：独立沙箱逻辑，调用 `cindy.send({type:'cindy-request',kind:'oneshot_text',...})`；唯一的 `/kv` 写入者。
- `panel.html`、`panel.css`、`panel.js`：面板、宿主主题、工作场景编辑、例句显示、唤醒及消息回执。
- `tests/core.test.cjs`：日期、缓存、并发去重、失败保留等单元测试。

面板先访问 `/wake` 唤醒逻辑页，再用同源 BroadcastChannel 发送请求；等待回执期间按请求 ID 重发，逻辑页按 ID 去重。十个词合为一次模型请求，`expectJson` 之外还检查十条完整结果、词条对应、非空字段及例句含原词。所有模型文本通过 `textContent` 显示。

只保留最后一次成功的批次。日期、工作场景、词表和缓存版本共同决定复用资格；失败不会覆盖旧卡片。程序不读用户文件或其他会话，不保存凭证，不直接请求第三方模型接口。

## 测试与打包

在此目录运行：

```sh
node --test tests/core.test.cjs
```

答题仓库提供 `scripts/pack-plugin.cjs`，使用指定 Cindy checkout 的生产 `packGhostDir` 校验并打包，必须先安装该 checkout 的依赖。在答题仓库根目录运行：

```sh
node scripts/pack-plugin.cjs ../cindy plugins/daily-word-cards .cache/forge-pack
```

打包器不安装插件，也不写入 Cindy 的授权状态。源码参考及开发宿主固定在 `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。清单下限 `0.1.64` 来自官方标签核验：v0.1.61 仍是 Manifest v2；其后的首个公开稳定标签 v0.1.64 已支持 v3、tab 面板、oneshot、`/kv` 与 `/wake`。本次实际验收使用上述开发构建，没有声称在所有中间版本上逐一运行过。

## 范围

词库为原创整理的 70 个常用工作词，每七天循环；暂不含自定义词库、发音、间隔复习和后台定时任务。第一次由用户点击生成，以后在打开面板或跨日恢复时更新。Cindy 未运行时不会自动生成。AI 例句的语法与场景贴合度仍需要人工核对。

实际运行证据和验收结果见答题仓库 `notes/daily-word-cards-verification.md`，模拟测试截图不能作为真实模型调用的证据。
