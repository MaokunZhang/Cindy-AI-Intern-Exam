# Part 0 · C：提交记录

已于 **2026-10-31（Australia/Sydney）** 将 Part 0 的笔记、答案、源码与验证证据推送到个人 GitHub 仓库。

- 仓库：[MaokunZhang/Cindy-AI-Intern-Exam](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam)
- 分支：`main`
- 可见性：**私有**。评阅者需要被授予访问权限；本次没有自动邀请任何账号。
- 提交历史：[查看全部 commits](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commits/main/)

## 实质提交

题目要求至少两次 commit。下面五次已有提交按先阅读、再设计、后实现与验证的顺序完整保留；本文件所在的后续提交补充 GitHub 交付入口和同步状态。

| Commit | 提交说明 | 内容 |
|---|---|---|
| [b2fcf0d](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commit/b2fcf0d109f8a629c1d2da171d48bb5b5723f9bf) | `docs(part0): map Cindy architecture and verify plugin capability evidence` | 记录项目组成、插件能力、源码依据与阅读过程。 |
| [d8cec81](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commit/d8cec8143a9e403fd970210e2f0300387752e7f6) | `docs(part0): answer vocabulary model design and deliver one-page guide` | 在实现前回答每日单词卡的三问，完成一页导览和设计边界。 |
| [4402c8c](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commit/4402c8cf0446c2cdebead50a1d6e93afd61f1c4b) | `feat(part0): implement daily word cards with Cindy oneshot and persistent cache` | 实现每日单词卡、宿主模型调用、持久缓存、测试和打包脚本。 |
| [ec2dac9](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commit/ec2dac9cc5623e14d36f851b4ff9bd0bad722b52) | `docs(part0): answer model design questions and record live Cindy validation` | 补齐正式答案、真实模型输出、运行日志与原始截图，并区分模拟检查。 |
| [8ad2663](https://github.com/MaokunZhang/Cindy-AI-Intern-Exam/commit/8ad26632e572c2f152663930683199f39caeace5) | `docs(part0): simplify guide source labels while preserving one-page layout` | 按用户要求去掉导览中的 H/R 简写，保留源码链接及一页排版。 |

## 交付入口

- [Part 0 完整回答](00-onboarding.md)
- [一页项目导览](Cindy项目导览.docx)
- [每日单词卡三问与实现说明](00b-daily-word-cards.md)
- [插件源码及使用方法](../plugins/daily-word-cards/README.md)
- [运行与验证记录](../notes/daily-word-cards-verification.md)
- [真实模型输出](../notes/daily-word-cards-live-examples.md)
- [真实 Cindy 截图](../screenshots/daily-word-cards/live/)

源码作为普通 Git 文件提交；`.cindy` 仅是便于安装的附加产物，不代替源码。开发依赖、用户凭证、整个 Cindy 上游 checkout，以及其他题目的占位稿均未纳入本次 Part 0 推送。

## 核验方式

本地答题目录为桌面 `Cindy-AI-Intern-Exam/submission`。已配置 `origin` 和 `main` 的远端跟踪；保留原有提交，没有压成单次提交或强制推送。可以在该目录复核：

```sh
git remote -v
git log --oneline
git rev-parse HEAD
git ls-remote --heads origin main
git status --short
```

`git rev-parse HEAD` 与 `git ls-remote --heads origin main` 返回的 SHA 应一致；`git status --short` 用于检查尚未提交的文件。

以上提交表保留 Part 0 的实际完成顺序。后续 Part A、Part B 和个人 AI 使用说明也已完成，继续使用同一仓库提交。完整答题入口见[仓库首页](../README.md)，最后检查见[完整性检查记录](../notes/final-review.md)。
