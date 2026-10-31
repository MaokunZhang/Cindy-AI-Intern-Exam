# Cindy AI 工程实习生笔试提交

Part 0、Part A、Part B 和最后一题均已完成。仓库包含全部答题文档、两个插件的源码与安装包、收工 Skill、真实运行截图和验证记录。

仓库：[MaokunZhang/Cindy-AI-Intern-Exam](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam)（私有，评阅者需有访问权限）。Cindy 参考源码固定为 `f283ccebd3b9ef11d89807934b6ccafec6ef23a4`。

## 答题入口

| 题目 | 回答及交付物 | 状态 |
| --- | --- | --- |
| Part 0 A 项目导览 | [一页 Word 导览](answers/Cindy项目导览.docx) · [Markdown 导览](answers/00-project-guide.md) · [阅读及设计记录](answers/00-onboarding.md) | 完成 |
| Part 0 B 每日单词卡 | [三问回答与实现](answers/00b-daily-word-cards.md) · [源码与安装说明](plugins/daily-word-cards/README.md) | 完成 |
| Part 0 C 提交记录 | [仓库链接与多次 commit 记录](answers/00c-submission.md) | 完成 |
| Part A A1、A2 | [时间方案评估与排查报告审阅](answers/01-judgment.md) | 完成 |
| Part B B1 我的 PR 看板 | [四项设计与实现回答](answers/02-plugin.md) · [源码与安装说明](plugins/my-pr-dashboard/README.md) | 完成 |
| Part B B2 收工 | [完整 SKILL.md](skills/wrap-up/SKILL.md) · [两项设计回答](answers/03-skill.md) | 完成 |
| 最后一题 你怎么用 AI | [a–e 完整回答](answers/04-ai-usage.md) · [用量统计依据](notes/ai-usage-proposals.md) | 完成 |

## 安装与验收证据

- 每日单词卡：`plugins/daily-word-cards/daily-word-cards-1.0.0.cindy`；[真实调用与缓存验证](notes/daily-word-cards-verification.md)、[十条例句](notes/daily-word-cards-live-examples.md)、[实机截图](screenshots/daily-word-cards/live/)。
- 我的 PR 看板：`plugins/my-pr-dashboard/my-pr-dashboard-1.0.3.cindy`；[验证记录](notes/b1-verification.md)、[实机截图](screenshots/b1-live/)。
- 收工 Skill：[隔离走查记录](notes/b2-verification.md)，包含测试通过后清理残留、测试失败后继续检查两个场景。
- [最终完整性检查](notes/final-review.md)：题目覆盖、测试结果、文件与安装包核对。

`.cindy` 是安装便利文件，插件源码同时作为普通 Git 文件提交。真实 Cindy 截图与模拟浏览器截图分目录保存。`../cindy` 是独立的上游参考及开发目录，不属于本答题仓库。

[验收草稿 PR #1](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/pull/1) 专门提供失败 CI；仅验收分支故意失败，保留供复测，不合并。正式插件测试在 `main` 运行。
