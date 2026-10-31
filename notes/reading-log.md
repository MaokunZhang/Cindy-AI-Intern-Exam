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

AI 完成了文档检索、源码定位、测试执行、初稿和版式整理。初始导览阶段没有进行真实模型调用；后续已在 Cindy 完成真实生成，新增记录与初始阅读阶段分开列出。最后一题已结合本人提供的小车 RL 协作记录和本次会话用量填写，c、d、e 由本人确认后定稿。

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

## Part 0 C：GitHub 推送

2026-10-31，用户要求按题目推送，并选择新建私有仓库。核验 GitHub 与本机 Git 账号均为 MaokunZhang 后，创建 Cindy-AI-Intern-Exam，配置 origin，正常推送 main。原有四次实质提交完整保留，并补交此前已验证的一页导览标签修改；随后补充 C 部分答案与实际推送状态。通过 git ls-remote 核对本地和远端分支 SHA。其他题目的占位文件仍留在本地，未作为已完成答案提交。

## Part A A1：时间上下文方案分析

2026-10-31，重读 A1 原题，核对 Cindy 固定源码 f283cce 的 Agent 工程规则第 3.1、3.4、4 节、Claude system 拼装、StartSessionOptions.userPrompt 和 UsageTracker.getCacheStats。发现 userPrompt 字段实际属于会话启动时的 system 追加段，不能仅凭字段名把动态日期放进去。

另外查阅 Claude 与 OpenAI 官方 prompt caching 文档，确认稳定前缀和动态消息的边界。形成三问回答，区分已核验的源码事实、假设成本示例和待实施的时间上下文方案。用日期运算复核示例周区间，核对假设成本比值为 3.57；未改动 Cindy 程序、未跑真实模型 A/B 或线上灰度，没有把假设数字写成实测结果。A1 完成时，A2 仍为占位稿；当时这部分答案尚未推送。后续完成情况见下一节及最终检查记录。

## Part A A2：配置排查报告审阅

2026-10-31，先读原题，按题目要求接受路径、片段、字段值和 45/46 条数量为事实。随后核对模型目录维护规则、source.ts 的加载与缓存选择、modelRegistry.ts 的版本比较，以及相邻回归测试。确认 updatedAt 是递增且内容不可变的 revision；把同版本修改内容作为发布冲突处理，优先通过提高发布版本和受控实验验证修复路径。

运行 source-registry.test.ts 中五个既有测试，5 项通过、66 项按名称筛选跳过；Vitest 报告总耗时 795ms。源码与测试保持原样。完整命令、来源和现场验证步骤见 [A2 核验记录](a2-verification.md)。形成报告推理问题、最小对照实验、影响分组、发布修复与验收方案，并写入 answers/01-judgment.md；A1 正文保持原样。该阶段先完成并保存 A1、A2 本地答案，最终与后续题目一并提交。

## 最终检查与汇总提交

2026-10-31，对照原题检查 Part 0、A1、A2、B1、B2 和最后一题，补齐最后阶段的文档状态与首页入口。复跑两个插件的 26 项核心测试、8 项单词卡浏览器检查、9 项 PR 看板浏览器检查，全部通过；Skill 格式校验通过。核对安装包内运行文件与源码一致、真实截图与模拟截图分开保存、本地文档链接和固定 commit 的源码路径有效。Word 重新导出确认导览为 A4 一页。详细结果见[最终完整性检查](final-review.md)。
