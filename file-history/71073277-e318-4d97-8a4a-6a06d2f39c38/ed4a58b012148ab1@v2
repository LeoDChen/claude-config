---
name: okki-redesign-may15
description: 2026-05-15 OKKI 项目第六轮重构讨论——三层客户知识架构方案
metadata: 
  node_type: memory
  type: project
  originSessionId: 71073277-e318-4d97-8a4a-6a06d2f39c38
---

# OKKI 重设计方案（2026-05-15 第六轮）

## 本轮进展

确认了核心架构方向，写入设计文档。

### 核心架构：三层客户知识
1. **简报（Brief）** — 每次自动加载，掌握客户现状+卡点+下一步
2. **深度档案（Archive）** — 深度分析产物，需要时检索
3. **原始数据（Raw）** — 完整聊天记录，不再默认重读

### 关键决策
- 不再做全量分类系统，改为"跟进清单"模式
- 不用等级标注（S/A/B/C/D）
- 简报存项目目录 `08_客户跟进/Okki/data/briefs/`，命名 `{cid}_{name}.md`
- 简报 frontmatter + 6 区块（画像/现状/卡点/关键事实/下一步/深度档案）
- 脚本检测新消息 → AI 判断是否实质变化 → 更新简报
- 深度分析也不默认重读完整记录，读简报+档案即可
- HTML 仪表盘：三区布局（概览+散点矩阵+列表），脚本生成
- 暂不集成 Obsidian
- 客户分层（T1/T2/T3）是施工顺序，按消息量分段，不是客户等级
- 分层阈值待看数据分布后定

### 待新对话继续
1. 深度档案格式
2. 定点检索机制
3. 客户分层阈值（先跑脚本看消息量分布）
4. 脚本改动范围
5. INDEX.md 格式
6. 简报首次生成流程

### 设计文档
`C:\Users\Administrator\.claude\plans\okki-branstorming-humble-catmull.md`
