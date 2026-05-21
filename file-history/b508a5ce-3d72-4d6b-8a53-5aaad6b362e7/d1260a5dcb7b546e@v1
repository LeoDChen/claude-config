---
name: desktop-sync-workflow
description: 台式机同步后笔记本必须执行的三仓库 pull + OB 归档全量保存流程
metadata:
  type: project
---

# 台式机同步 → 笔记本同步流程

**Why:** 两台电脑通过 GitHub 三个独立仓库同步。台式机 push 后，笔记本必须主动 pull 才能拿到最新数据。之前漏拉 claude-workspace，且忘了把台式机的对话记录归档到笔记本 OB 中。

**How to apply:** 每次台式机说"已同步到 git"或笔记本开机时，执行以下全部步骤，不跳过：

## 步骤

### 1. 连接 VPN
代理 `127.0.0.1:57890`（Clash Verge），GitHub 需翻墙。

### 2. 拉取三个仓库
```bash
cd "D:/ClaudeCode workspace" && git pull     # claude-config
cd "D:/ClaudeWorkspace" && git pull           # claude-workspace
cd "D:/Obsidian仓库" && git pull              # ob-vault
```

### 3. 检查台式机新增的对话记录
- 查看 `projects/C--Users-67240/` 目录（台式机特有项目文件）
- 查看 `session-data/` 目录下的 `.tmp` 文件（台式机会话数据）
- 查看 `projects/d--ClaudeCode-workspace/` 下新增的 jsonl

### 4. 将新增对话写入笔记本 OB
- 对话文件 → `D:/Obsidian仓库/对话归档/CC/YYYY-MM/`
- 更新 `对话归档索引.md`
- 更新 `主题索引/`
- 更新 `客户档案/`

### 5. 提交 OB 变更
```bash
cd "D:/Obsidian仓库" && git add -A && git commit -m "auto: 台式机对话归档同步" && git push
```

## 参考
- OB 归档同步操作详见 [[OB归档同步操作]]
- 三仓库架构：claude-config / claude-workspace / ob-vault
