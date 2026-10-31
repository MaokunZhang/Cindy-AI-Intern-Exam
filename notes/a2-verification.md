# A2 配置排查报告：核验记录

日期：2026-10-31（Australia/Sydney）。

## 题目约束与核验目标

原题明确报告中的路径、代码片段、字段值和数量属实。本次接受这些事实，重点核验版本契约、缓存保护的用途、影响范围及修复路径。当前 checkout 的完整实现用于说明这些契约与已有保护。

## 源码依据

- [目录发布规则](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/dev-rules/model-catalog-maintenance.md#L321)：revision 递增、内容不可变、实际接口回读和运行时验收。
- [维护与回撤步骤](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/docs/dev-rules/model-catalog-maintenance.md#L108)：更新时增加 updatedAt，回撤使用新 revision。
- [Registry 版本比较](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/src/modelRegistry.ts#L156)：比较时间版本，区分同版本同内容与冲突。
- [缓存快照选择](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/src/source.ts#L562)：保留较新快照，同版本异内容保留最后有效配置。
- [比较与日志](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/src/source.ts#L675)：下载后再次选择快照，并记录冲突或旧版本情况。
- [冲突回归测试](https://github.com/makecindy/cindy/blob/f283ccebd3b9ef11d89807934b6ccafec6ef23a4/packages/model-providers/src/__tests__/source-registry.test.ts#L938)：同版本不同内容保留有效缓存并产生 warning。

## 已执行的测试

在 Cindy checkout 根目录，使用工作区配置的 Node 22 / pnpm：

```powershell
. '..\scripts\enter-env.ps1'
pnpm --filter @cindy/model-providers exec vitest run src/__tests__/source-registry.test.ts -t 'uses a newer primary|persists a valid remote snapshot|keeps a newer cached|rejects a remote registry|adopts the newer snapshot' --maxWorkers=1
```

结果：

```text
Vitest v3.2.7
source-registry.test.ts: 71 tests, 5 passed, 66 skipped by name filter
Test Files: 1 passed
Tests: 5 passed | 66 skipped
Duration: 795ms; tests: 79ms
```

这五项测试调用现有加载/合并入口，覆盖采用较新完整快照、持久化后离线回退、拒绝旧远端覆盖、同版本异内容冲突，以及串行缓存提交中的版本选择。源码和测试均保持原样；本次执行使用依赖注入的受控数据。

## 后续现场验证

保留问题客户端的缓存，用题中 45/46 条配置做只提高 updatedAt 的对照实验；随后按答案中的正常发布、接口回读和客户端刷新步骤验收。生产发布、账号准入和界面最终显示属于该现场验证阶段。
