# Cindy AI 工程实习生笔试提交

状态：Part 0 的一页导览、单词卡三问、插件实现、真实模型调用与缓存验证已完成；Part 0 提交已完整推送至 [GitHub 私有仓库](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam)。Part A 的 A1、A2 已在本地完成（见 [Part A 答案](answers/01-judgment.md)）；Part B1 的 PR 看板设计、实现与真实模型验收已完成；B2 与个人 AI 使用说明待完成。

## 提交清单

- [x] Part 0：一页项目导览、能力及源码依据、阅读过程、单词卡设计判断
- [x] Part 0：每日单词卡源码、安装包、真实运行截图、验证记录
- [x] Part 0：至少两次有意义的 Git commit，已推送个人 GitHub 仓库（见 [C 部分](answers/00c-submission.md)）
- [x] A1：时间方案评估、影响范围、可观测性和替代方案（本地文档已完成）
- [x] A2：报告审阅、版本契约核验、5 项已有测试及处理建议（本地文档已完成）
- [x] B1：实现前设计判断、插件源码、真实截图、过程与扩展边界说明
- [ ] B2：可执行的 SKILL.md、固定动作与判断划分、Skill / 插件选择理由
- [ ] 最后一题：本人经历、AI 失误、规则文件片段、用量、模型、不确定项
- [x] Part 0：仓库链接和答题文档（其余题目待完成）

所有答案、插件源码、Skill、截图都保留在此仓库。`../cindy` 为独立参考与开发源码，不要直接把整个工作区作为答题提交。

## 每日单词卡交付入口

- [题目三问与实现说明](answers/00b-daily-word-cards.md)
- [运行与验证记录](notes/daily-word-cards-verification.md)
- [真实模型的十条例句](notes/daily-word-cards-live-examples.md)
- [源码与使用说明](plugins/daily-word-cards/README.md)
- 安装包：`plugins/daily-word-cards/daily-word-cards-1.0.0.cindy`（源码同时保留，安装包不代替 GitHub 提交）。

## PR 看板交付入口

- [B1 四项设计与实现回答](answers/02-plugin.md)
- [源码与安装说明](plugins/my-pr-dashboard/README.md)
- [验证记录](notes/b1-verification.md) · [真实运行截图](screenshots/b1-live/)
- 当前安装包：`plugins/my-pr-dashboard/my-pr-dashboard-1.0.3.cindy`。
- [验收草稿 PR #1](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/pull/1)：仅该验收分支故意失败，供复测，不合并。
