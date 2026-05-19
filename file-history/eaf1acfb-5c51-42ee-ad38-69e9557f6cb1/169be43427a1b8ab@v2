---
name: ob-archive-system
description: 对话全量归档到 OB 的自动化系统——脚本+AI混合方案，已首次同步完成
metadata: 
  node_type: memory
  type: reference
  originSessionId: eaf1acfb-5c51-42ee-ad38-69e9557f6cb1
---

# OB 对话归档系统

## 当前状态

- 首次全量同步完成：2026-05-19
- 231 个 JSONL → 223 个 OB 文件（8 个噪音跳过）
- 46 个客户档案，13 个主题索引
- 覆盖日期：2026-04-20 ~ 2026-05-19

## 数据流向

```
.claude/projects/D--ClaudeWorkspace/*.jsonl (原始对话)
    ↓ convert_to_ob_v2.js (提取+分类+写入)
E:\道友的宝贝\...\对话归档\CC\ (OB 归档)
```

## 目录结构

```
CC/
├── 对话归档索引.md       ← 总入口
├── 2026-04/  (66个文件)
├── 2026-05/  (117个文件)  
├── 客户档案/ (46个)
├── 主题索引/ (13个)
└── 经验库/、项目-*/ 等 (手动文件，脚本不覆盖)
```

## 每日同步操作

1. 用户说"同步" → git add -A + commit + push
2. 运行 `convert_to_ob_v2.js`
3. 验证客户/主题匹配质量

## 脚本位置

- `D:\ClaudeWorkspace\scripts\extract_sessions_meta.js` — 提取元数据
- `D:\ClaudeWorkspace\scripts\convert_to_ob_v2.js` — 转OB（V2增强版）
