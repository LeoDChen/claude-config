---
name: okki
description: 生命周期判定和紧急程度判定的两段式重构方案讨论 — 待在新对话中继续
metadata: 
  node_type: memory
  type: project
  originSessionId: 4b6889ef-6826-48bc-8208-e9762bf0319a
---

# OKKI 分类准确度重构

## 问题

`enhanced_classify.js` 中的 `determineLifecycle()` 和 `getAction()` 不可靠：
- 正则匹配关键词无法区分"讨论过"和"已完成"（如"我会发PI"匹配到PI→误判为PI已发）
- 纯计时器无法区分"报价等决策"和"客户提问没回"

## 已确认的方向

两段式：脚本提取数据 + AI 判断

### 脚本改动
1. 新增 `extractConversationSnippet()` — 提取最近N条真实消息原文
2. `determineLifecycle()` 降级为 `estimateStage()` + confidence 标记
3. `getAction()` 简化为只输出 direction/to_them, days, lastMsgType
4. 新增输出文件 `data/s2_ai_input.json`

### 待决定
- 脚本继续做判定（修阈值）还是只提取数据全交给AI
- extractConversationSnippet 的 N 取多少

## 相关文件
- `08_客户跟进/Okki/scripts/enhanced_classify.js` — 主脚本，getAction()在L219-276
- `08_客户跟进/Okki/knowledge/analysis-framework.md` — 7问框架
- `C:\Users\Administrator\.claude\projects\d--ClaudeWorkspace\memory\okki_analysis_lessons.md` — 用户9条修正规则

## 计划文件
- `C:\Users\Administrator\.claude\plans\flickering-wiggling-abelson.md`
