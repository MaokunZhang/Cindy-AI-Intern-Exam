# 每日单词卡：运行与验证记录

日期：2026-10-31，Australia/Sydney。任务为 Part 0「一个具体需求」，不是 Part B1「我的 PR 看板」。

## 验证结论

插件已导入本机 Cindy 开发版，在真实插件沙箱中成功生成并展示 10 条例句。关闭面板后重新打开，结果从持久缓存恢复，日志中的模型请求次数没有增加。真实模型为 **`xd/deepseek/deepseek-v4-flash`**。

| 检查 | 结果 | 证据或范围 |
|---|---|---|
| 宿主启动 | 通过 | 官方入口第二次启动返回 `DESKTOP_DEV_VERDICT=ready`；第一次为 `STARTUP_TIMEOUT` |
| 官方 Forge 打包 | 通过 | 调用本地固定版本的生产 `packGhostDir`，`ok: true` |
| Cindy 插件安装 | 通过 | 用户亲自确认能力；14:30:18.967 宿主记录 installed，14:30:19.633 runtime running |
| 真实模型请求 | 通过 | 14:30:38.884 start → 14:30:44.043 done，日志间隔约 5.159 秒 |
| 输出内容 | 通过本次抽查 | 10 个指定词各一条例句与中文翻译；内容涉及插件、测试、API、模型和调试 |
| 关闭重开 | 通过 | 界面重新显示原来的十条结果与模型名；start/done 日志各一条 |
| 核心逻辑单元测试 | 12/12 通过 | 日期、70 词循环、结构校验、缓存、并发去重、失败保留、存储异常、请求跨午夜 |
| 独立浏览器集成测试 | 8 项通过 | 使用真实 main/panel/core，但 `/kv` 和模型响应为测试夹具；非真实模型证据 |
| 深浅主题、窄屏 | 通过模拟界面检查 | Chromium；窄屏 390 px 无横向溢出；模型文本不会执行 HTML |

本次没有给插件填写任何 OpenAI API Key。生成使用 Cindy 的既有模型通道；没有测量 token 数或费用，不能据此次成功推断所有用户都无需配置宿主模型。

## 固定版本与安装产物

- 实际宿主：本机 Windows，UI 显示 `0.0.0 · main@f283cce`。
- 源码：`f283ccebd3b9ef11d89807934b6ccafec6ef23a4`；未修改 Cindy 的 tracked 源码。
- 开发隔离环境：`cindy-exam`，global 区域。
- 插件：`daily-word-cards`，版本 `1.0.0`，Manifest v3。
- 插件包：`plugins/daily-word-cards/daily-word-cards-1.0.0.cindy`，14,660 字节。
- SHA-256：`b4dd70b0af0ef93dfcdeb773b541985160589312d510997db61fc3de7b54c380`。
- `minCindyVersion: 0.1.64`：已对照官方 v0.1.61（v2）和 v0.1.64（v3）源码核验，并核对 v0.1.64 的 oneshot、tab 面板、`/kv`、`/wake` 支持。没有在旧正式客户端上逐一实测。

版本依据：[v0.1.61 的协议源码](https://github.com/makecindy/cindy/blob/1e165ea83c806a62439fe6b7ad3ac2279f9f3d87/packages/plugin-protocol/src/manifest.ts)、[v0.1.64 的协议源码](https://github.com/makecindy/cindy/blob/c4a908856167b41078245e053ca2ac670f812685/packages/plugin-protocol/src/manifest.ts)、[v0.1.64 的模型实现](https://github.com/makecindy/cindy/blob/c4a908856167b41078245e053ca2ac670f812685/apps/desktop/src/main/cindy-brain/cindySlot.ts)、[v0.1.64 的沙箱协议](https://github.com/makecindy/cindy/blob/c4a908856167b41078245e053ca2ac670f812685/apps/desktop/src/main/cindy-brain/runtime/electronSandboxAdapter.ts)。

## 可复现检查

在答题仓库根目录运行：

```sh
node --test plugins/daily-word-cards/tests/core.test.cjs
node scripts/pack-plugin.cjs ../cindy plugins/daily-word-cards .cache/forge-pack
```

第二条需要先安装 Cindy checkout 的依赖。独立浏览器检查需要 Chrome 与 Playwright：

```sh
node scripts/browser-smoke.cjs plugins/daily-word-cards .cache/browser-qa <含playwright的node_modules目录>
```

也可以省略第三个参数，使用正常 Node 模块解析找到已安装的 Playwright。该测试启动独立的无头 Chrome 配置和本机临时 HTTP 服务，不使用日常浏览器的用户配置。

真实验收步骤：导入插件 → 由用户确认能力 → 打开面板 → 保留默认 AI 工程实习生场景 → 点击「生成今日例句」 → 核对十张卡片 → 关闭面板 → 点击「使用」重新打开 → 核对原结果 → 检查本插件 oneshot 日志次数未增加。

## 运行截图与日志

- `screenshots/daily-word-cards/live/cindy-live-01.png`：已安装插件、日期、场景、模型名和第一张卡。
- `screenshots/daily-word-cards/live/cindy-live-02.png`：reproduce、diagnose、isolate。
- `screenshots/daily-word-cards/live/cindy-live-03.png`：inspect、trace、resolve、regression。
- `screenshots/daily-word-cards/live/cindy-live-04.png`：exception、workaround、reliable。
- `notes/daily-word-cards-host-log.txt`：仅截取与本次插件安装和模型请求有关的宿主日志。
- `notes/daily-word-cards-live-examples.md`：从实际 Cindy 面板提取的十条例句和翻译。
- `screenshots/daily-word-cards/simulated/`：浅色、深色及窄屏模拟测试截图，图上明确标注“模拟模型响应”。

截图为真实客户端窗口的原始捕获，没有把模拟数据合成到 Cindy 窗口。当前宿主的 `tab` 面板在插件页右侧以较窄区域显示，因此真实截图以纵向滚动展示十词。

## 排查与边界

首次启动在 120 秒等待窗口内未就绪，官方入口报告 `STARTUP_TIMEOUT`。检查日志后从同一官方入口重试，得到 ready；无法仅凭这两次结果断定超时根因。缺少 Cargo 导致的系统拖拽/截图辅助模块警告未阻断本插件运行。

打包和独立浏览器检查曾分别遇到工作区沙箱对桌面依赖链接、loopback 网络的限制；通过任务授权的执行审批后成功，没有更改 Cindy 的权限校验。用户完成登录与插件安装确认；未读取或改写用户凭证、批准状态或已安装插件目录。

测试中的超时、限流、坏 JSON、权限拒绝和存储失败使用注入依赖模拟，没有故意让真实模型产生错误或额外费用。跨日期/DST 的行为通过单元测试验证，未等待真实跨日；本次真实模型只生成一批。未测试模型供应商切换、Cindy 完整进程重启和长期学习效果。

模型例句人工查看未发现明显不贴合场景的内容，但这不是严格的英语教学质量评测。词库只有 70 词，每七天循环；未实现自定义词库、发音、间隔复习或后台定时推送。

## AI 与提交说明

Codex 完成仓库检索、设计稿、插件代码、测试、打包和文档整理；Cindy 宿主实际执行了插件和例句生成。没有把这些代码称为由 Cindy 聊天 Agent 编写。用户负责登录和亲自确认插件安装能力。

本地提交保留源码与说明。GitHub 远端尚未配置；因此“本地代码和提交已完成”不等于题目要求的 GitHub 链接已经交付。
