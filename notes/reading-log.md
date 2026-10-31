# 阅读与操作记录

## 环境准备阶段

Codex 已提取题目、克隆官方源码、安装匹配的 Node/pnpm 与依赖，并创建本地答题目录。详细环境结果见工作区根目录 SETUP-STATUS.txt。

## Part 0 阅读与核验

日期：2026-10-31（Australia/Sydney）。本次由本人委托 Codex 检索、核对和起草，下面记录实际执行顺序，不声称本人已逐行独立审阅全部源码。

1. 重新读原题与答题模板，确认导览必须覆盖组成、插件能力和阅读过程；单词卡设计判断应先于实现。
2. 读 AGENTS.md、README.zh-CN.md、repo-map.md 与产品原则，确定客户端仓库边界。
3. 查 desktop、mobile、maker-core、model-providers、device-link 的 package.json，核对框架、依赖和模块职责。
4. 从内置 cindy-plugin-creator 手册索引按需阅读 runtime、network、agent-call-context、settings、files-and-library、agent-tasks、panels 与 structure。
5. 用 rg 定位 oneshot_text，跟进 ghostPreload.ts 的公开桥接、cindySlot.ts 的能力检查及 index.ts → requestUtilityText 的接线。
6. 核对 ghostKvEndpoint.ts、networkSlot.ts、agentSlot.ts，避免把所有能力概括成同一套权限规则。
7. 阅读并运行已有快问快答测试组，11 个通过，122 个被过滤跳过；详细命令与范围见 evidence.md。
8. 整理固定 commit 的证据索引，形成一页项目导览；再写每日单词卡的模型调用、用户配置与 API Key 方案判断。

## AI 使用边界

AI 完成了文档检索、源码定位、测试执行、初稿和版式整理。初始导览阶段没有进行真实模型调用；后续已在 Cindy 完成真实生成，新增记录与初始阅读阶段分开列出。题目中本人近期经历、用量与费用仍需在最后一题据实填写。

## 文档验证

一页导览已使用本机 Word 导出验证 PDF，再渲染为 PNG 逐页检查，最终为 A4 一页。修正了初稿的跨页引用和默认标题边框。最终交付 DOCX 与 Markdown，验证用 PDF/PNG 留在临时工作目录。

## Part 0 每日单词卡实现与真实验收

1. 用户确认继续做 Part 0 的每日单词卡。前述设计已在 `d8cec81` 中提交，先于实现。
2. Codex 按内置插件手册实现 Manifest v3、oneshot_text 批量生成、/kv 缓存、面板、错误提示与输出校验。代码由 Codex 编写，Cindy 负责实际运行插件与调用模型。
3. 12 项核心单元测试、8 项模拟模型浏览器检查通过；模拟截图与真实截图分目录保存。
4. 通过固定版本 Cindy 的生产 Forge 打包器打包，使用官方开发入口启动隔离客户端；用户亲自完成登录及插件安装能力确认。
5. 真实调用由 `xd/deepseek/deepseek-v4-flash` 生成十条例句，约 5.159 秒。关闭重开插件面板，十条结果完整恢复，日志仍只有一次模型请求。
6. 保存原始客户端截图、相关日志摘录和原始十条例句。没有测试完整进程重启或真实跨日；错误及日期边界使用模拟依赖验证。

详细过程、命令和边界见 [验证记录](daily-word-cards-verification.md)。此前的一页项目导览 DOCX 未改动。
