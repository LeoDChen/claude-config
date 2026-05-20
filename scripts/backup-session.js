/**
 * 对话归档 — Stop Hook 兜底脚本
 * 仅归档已注册的对话（用户明确说"保存到OB"的）
 */
const fs = require('fs');
const path = require('path');

const OBSIDIAN_DIR = (() => {
  for (const p of ['E:/道友的宝贝/道友的宝贝/对话归档/CC', 'D:/Obsidian仓库/对话归档/CC'])
    if (fs.existsSync(p)) return p;
  return 'D:/Obsidian仓库/对话归档/CC';
})();
const WORKSPACE_DIR = (() => {
  for (const p of ['D:/ClaudeWorkspace', path.resolve(__dirname, '..', '..')])
    if (fs.existsSync(p)) return p;
  return 'D:/ClaudeWorkspace';
})();
const REGISTRY_FILE = path.join(WORKSPACE_DIR, '.session_registry.json');
const SESSION_NOTE = path.join(WORKSPACE_DIR, '当前会话笔记.md');

if (!fs.existsSync(OBSIDIAN_DIR)) {
  fs.mkdirSync(OBSIDIAN_DIR, { recursive: true });
}

// Read session registry
let registry = {};
if (fs.existsSync(REGISTRY_FILE)) {
  try { registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8')); } catch (e) {}
}

// Only archive if this session is registered in Obsidian
const isRegistered = registry.obsidianNotePath && fs.existsSync(registry.obsidianNotePath);

if (isRegistered && fs.existsSync(SESSION_NOTE)) {
  const content = fs.readFileSync(SESSION_NOTE, 'utf-8');
  if (content.trim().length > 0) {
    fs.copyFileSync(SESSION_NOTE, registry.obsidianNotePath);
    console.log(`[backup-session] ✅ 已同步到 ${path.basename(registry.obsidianNotePath)}`);
  }
} else {
  console.log('[backup-session] ⏭ 无已注册的 Obsidian 笔记，跳过归档');
}

// Clean registry at session end (remove session ID, keep note reference)
if (fs.existsSync(REGISTRY_FILE)) {
  try {
    const reg = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    reg.activeSessionId = '';
    reg.lastSyncTime = new Date().toISOString();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(reg, null, 2));
  } catch (e) {}
}

console.log('[backup-session] ✅ 完成');
