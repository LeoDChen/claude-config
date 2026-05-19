---
name: okki-stage-transition-design
description: OKKI 9阶段自动流转系统（阶段流转表已定稿，因子终止条件待定）
metadata: 
  node_type: memory
  type: project
  originSessionId: da569e7c-985a-45b7-b9eb-f9a64ef551f9
---

# OKKI 阶段自动流转系统

> 定稿：2026-05-18 | 状态：阶段流转表定稿，因子终止条件已完成（2026-05-19）

完整规则（含流转表+订单类型定义+人工介入三层+因子终点对齐表）见：[stage-transition-system-v1.md](d:\ClaudeWorkspace\08_客户跟进\Okki\knowledge\stage-transition-system-v1.md)

**本轮关键决策**：待付款拆为样品10d/现货30d/大货60d；样品不区分现货定制；大货=≥500件；已发货→已签收=transit+5d；售后不自动衰减走人工。

**已完成（2026-05-19）**：逐阶段对齐因子终止条件。3处修改 — S1 去掉Day45兜底→30d；S2 按子类型分段（样品15d/大货30d）；S7 按客户类型分层（样品60d/大货90d/老客120d）。factor_baselines.json已初始化（40个客户，19份阶段修正）。38张草稿卡阶段修正已完成。

**下一步**：看板HTML接入真实数据 / SOON层建卡（~80人）/ 冷层清单
