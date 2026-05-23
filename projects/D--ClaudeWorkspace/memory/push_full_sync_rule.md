---
name: push-full-sync-rule
description: push 全量同步规则 — 三仓库全推 + 对话全量归档 OB + 索引更新
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 086890c5-18fb-46e1-b804-e9b4cb2495de
---

# Push 全量同步规则

**规则**：每次 push（手动或自动），必须完成：
1. `convert_to_ob_v3.js` 全量扫描 JSONL → 归档所有未保存对话到 OB
2. 三仓库 `add + commit + pull --rebase + push`：OB vault (D/E 双盘自适应) + Workspace + .claude config

**Why**: 2026-05-22 发现 Codex 配置对话因用户没说"保存到OB"而丢失，只推了 git 仓库没归档对话。此前 push 只推已保存文件，未归档的对话永久丢失。

**How to apply**:
- auto_push.bat 每 2 小时自动执行：先跑 `node scripts/convert_to_ob_v3.js`，再 git 三仓库
- 用户手动说 push 时：先跑 `convert_to_ob_v3.js` 补归档，再 push
- OB vault 路径自适应：`D:\Obsidian仓库` 优先，否则 `E:\道友的宝贝\道友的宝贝`
- 每台电脑独立跑归档脚本，确保对话在本地 OB 中有副本

**关联记忆**：
- [[desktop-sync-workflow]] — 台式机→笔记本同步流程
- [[push-three-repos]] — 三仓库全量同步
- [[ob_archive_system]] — OB 对话归档系统
