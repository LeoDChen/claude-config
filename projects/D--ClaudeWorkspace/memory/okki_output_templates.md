---
name: OKKI 客户看板和行动清单模板
description: output/ 目录中 daily_*.xlsx 和 actions_*.md 的用途和格式参考，用于未来制作类似报告
type: project
originSessionId: 7bfae09a-02df-4773-bef2-e23a049d581a
---
每次运行 daily_pipeline.js 会在 `output/` 生成两个文件：

**Excel 看板**：`output/daily_2026-05-09.xlsx`
- 全量客户梯队分类表
- 最后一列可手动覆盖梯队标记
- 供用户打开浏览、筛选、排序

**行动清单**：`output/actions_2026-05-09.md`
- 统计概览（各梯队人数）
- 沉默风险预警（标红/标黄客户列表）
- 快速了解当天需要关注谁

**生成流程**：数据同步 → 脚本读 tier_rules.json 分类 → 输出 Excel + MD

Why: 用户以后可能需要制作类似的客户看板和行动清单，这两个文件是参考模板。
How to apply: 当用户需要生成客户看板时，参考这两个文件的格式和内容结构。
