---
name: okki-order-sync
description: OKKI 订单页 DOM 结构和 sync_orders.js 抓取经验
metadata: 
  node_type: memory
  type: reference
  originSessionId: 05d40904-11d4-4220-8f46-cc3600cc2d66
---

# OKKI 订单同步

## DOM 结构（crm.xiaoman.cn/order，2026-05-14 实测）

- **不是** `<table>`，是 **Vue virtual scroller**：`.vue-recycle-scroller__item-view` → `.row-item` → `.cell` → `.cell-inner`
- 每行 11 个 `.cell-inner`，通过 `data-cci` (column index) 区分：
  - cci=0: 复选框（空）
  - cci=1: 保障图标（空）
  - cci=2: **订单号前半**（如 "44"）
  - cci=3: **订单号后半**（如 "294358782001025359"）
  - cci=4: 日期（"昨天"/"05月10日"）
  - cci=5: 金额（"USD39.63"）
  - cci=6: 客户
  - cci=7: 订单状态（交易成功/待收款/待发货/已发货/交易取消/草稿）
  - cci=8: ERP状态（"--" 或具体状态）
  - cci=9-10: 空

**关键：订单号被拆成两个 cell（cci=2 + cci=3），必须拼接！**

## 抓取策略（v4，2026-05-14 验证通过，38/39条）

1. CDP 连接或启动 Chrome → 导航到 `crm.xiaoman.cn/order`
2. 等虚拟列表渲染：`waitForSelector('.vue-recycle-scroller__item-view')` + 1.5s buffer
3. 提取：`querySelectorAll('.vue-recycle-scroller__item-view')` → 每行取 `.cell-inner`
4. **跳过表头**：`rowItem.classList.contains('row-item__hidden_border_top')` 
5. **订单号拼接**：`texts[2] + texts[3]`，校验 `/^\d{15,}$/`
6. 滚动加载更多：`page.mouse.wheel` 在 `.vue-recycle-scroller` 上，每次 800px，2s 等渲染
7. 去重：用 Set 记录已有 orderNo
8. 翻页：用 `.okki-pagination-item` 找页码，或 `.okki-pagination-next:not(.okki-pagination-disabled)` 翻页

## 各版本踩坑记录

| 版本 | 问题 | 修复 |
|------|------|------|
| v2 | texts[3] 只取到订单号后半，不满足 `\d{10,}` 正则的某些行被跳过 | 改为拼接 texts[2]+texts[3]，校验 `\d{15,}` |
| v2 | 用 `row-item__title` 跳表头，实际表头 class 是 `row-item__hidden_border_top` | 改为检查 `row-item__hidden_border_top` |
| v2 | 翻页用 `.el-pagination`，实际是 `.okki-pagination` | 改为 okki-pagination 选择器 |
| v2 | 滚动容器 `.virtual-list-wrap` 不存在 | 改为 `.vue-recycle-scroller` |
| v1 | `page.evaluate` 设 `scrollTop` 不能触发虚拟列表重渲染 | 必须用 `page.mouse.wheel` |
| v1 | page_size=100 时数据一页但虚拟列表只渲染 ~19 个 DOM | 需要滚动加载 + 翻页组合 |
