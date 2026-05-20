(function () {
  'use strict';

  const DEFAULTS = {
    apiKey: '',
    model: 'deepseek-chat',
    incomingTarget: 'Chinese',
    outgoingTarget: 'English',
    autoTranslate: true,
    showButton: true,
  };

  let settings = { ...DEFAULTS };
  const translatedMessages = new Set();
  let observer = null;

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(DEFAULTS, (items) => { settings = items; resolve(); });
    });
  }
  function saveSetting(key, val) { settings[key] = val; chrome.storage.local.set({ [key]: val }); }

  // ==================== DeepSeek API ====================
  async function translateText(text, targetLang) {
    if (!settings.apiKey) return null;
    const prompt = (targetLang === 'Chinese' || targetLang === '中文')
      ? `Translate the following text to Chinese. If it's already in Chinese, return it unchanged. Only output the translation, nothing else:\n\n${text}`
      : `Translate the following text to ${targetLang}. Only output the translation, nothing else:\n\n${text}`;
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
        body: JSON.stringify({ model: settings.model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 4096 }),
      });
      const data = await resp.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) { console.error('[WAT] API fail', e); return null; }
  }

  // ==================== Toast ====================
  function showToast(msg, type) {
    const colors = { ok: '#25d366', error: '#e53935', warn: '#ff9800', info: '#888' };
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999999;padding:8px 20px;border-radius:8px;color:#fff;font-size:14px;font-weight:600;pointer-events:none;background:' + (colors[type] || '#333') + ';';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; }, 1500);
    setTimeout(() => { t.remove(); }, 2000);
  }

  // ==================== DOM 工具 ====================
  function getEditor() {
    return document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('#main div[contenteditable="true"]') ||
      document.querySelector('footer div[contenteditable="true"]');
  }

  function getSendBtn() {
    return document.querySelector('span[data-icon="send"]')?.closest('button') ||
      document.querySelector('button[data-tab="11"]') ||
      document.querySelector('[aria-label="Send"]')?.closest('button');
  }

  function replaceEditorText(editor, text) {
    editor.focus();
    document.execCommand('selectAll');
    document.execCommand('insertText', false, text);
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    editor.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function hasChinese(text) { return /[一-鿿]/.test(text); }

  // ==================== 入站翻译 ====================
  function getMessageText(el) {
    const spans = el.querySelectorAll('span.selectable-text, span[dir]');
    if (spans.length === 0) return null;
    return Array.from(spans).map(s => s.textContent).join(' ').trim();
  }
  function isIncoming(el) {
    return !!(el.closest('[data-pre-plain-text]') || el.querySelector('[data-pre-plain-text]'));
  }
  function getMsgId(el) {
    const text = getMessageText(el);
    if (!text) return null;
    const hash = text.substring(0, 80).split('').reduce((a, c) => { a = (a << 5) - a + c.charCodeAt(0); return a & 0x7fffffff; }, 0);
    return hash + '_' + text.length;
  }
  function showTranslation(el, translation) {
    const old = el.querySelector('.wt-t');
    if (old) old.remove();
    const d = document.createElement('div');
    d.className = 'wt-t';
    d.style.cssText = 'margin-top:4px;padding:6px 10px;background:rgba(37,211,102,0.1);border-left:3px solid #25d366;border-radius:4px;font-size:13px;color:#d1d7db;line-height:1.4;word-break:break-word;';
    d.textContent = translation;
    el.appendChild(d);
  }
  function showTranslating(el) {
    const old = el.querySelector('.wt-t');
    if (old) old.remove();
    const d = document.createElement('div');
    d.className = 'wt-t wt-t-ing';
    d.style.cssText = 'margin-top:4px;padding:6px 10px;color:#8696a0;font-size:12px;font-style:italic;';
    d.textContent = '翻译中...';
    el.appendChild(d);
  }
  function addTranslateBtn(el) {
    if (!settings.showButton || el.querySelector('.wt-tb')) return;
    const text = getMessageText(el);
    if (!text || text.length < 2) return;
    const btn = document.createElement('span');
    btn.className = 'wt-tb';
    btn.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:rgba(37,211,102,0.15);color:#25d366;cursor:pointer;font-size:12px;margin-left:4px;opacity:0.6;vertical-align:middle;flex-shrink:0;';
    btn.textContent = '译';
    btn.onmouseenter = () => btn.style.opacity = '1';
    btn.onmouseleave = () => btn.style.opacity = '0.6';
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); e.preventDefault();
      showTranslating(el);
      const r = await translateText(text, isIncoming(el) ? settings.incomingTarget : settings.outgoingTarget);
      if (r) { showTranslation(el, r); translatedMessages.add(getMsgId(el)); }
      else { const x = el.querySelector('.wt-t'); if (x) x.textContent = '翻译失败'; }
    });
    const tc = el.querySelector('.copyable-text') || el.querySelector('[data-pre-plain-text]')?.parentElement || el;
    tc.appendChild(btn);
  }
  async function autoTranslate(el) {
    if (!settings.autoTranslate) return;
    const id = getMsgId(el);
    if (!id || translatedMessages.has(id)) return;
    const text = getMessageText(el);
    if (!text || text.length < 3) return;
    if ((text.match(/[一-鿿]/g) || []).length > text.length * 0.5) return;
    if (!isIncoming(el)) return;
    showTranslating(el);
    const r = await translateText(text, settings.incomingTarget);
    if (r) { showTranslation(el, r); translatedMessages.add(id); }
    else { const x = el.querySelector('.wt-t-ing'); if (x) x.remove(); }
  }

  function processNode(node) {
    if (node.nodeType !== 1) return;
    if (node.querySelector?.('span[dir]') || node.querySelector?.('.selectable-text') || node.querySelector?.('.copyable-text') || node.querySelector?.('[data-pre-plain-text]')) {
      addTranslateBtn(node); autoTranslate(node);
    }
    if (node.matches?.('[role="row"]') && node.querySelector?.('span[dir]')) { addTranslateBtn(node); autoTranslate(node); }
  }
  function scanAll() {
    document.querySelectorAll('[role="row"]').forEach(processNode);
    document.querySelectorAll('span[dir]').forEach(s => {
      const row = s.closest('[role="row"]') || s.closest('div[style]');
      if (row) processNode(row);
    });
  }
  function startObserving() {
    const app = document.querySelector('#app') || document.querySelector('#main');
    if (!app) { setTimeout(startObserving, 2000); return; }
    if (observer) observer.disconnect();
    observer = new MutationObserver(muts => { for (const m of muts) for (const n of m.addedNodes) processNode(n); });
    observer.observe(app, { childList: true, subtree: true });
    scanAll();
    console.log('[WAT] observing');
  }
  setInterval(scanAll, 3000);
  document.addEventListener('click', e => {
    const row = (e.target.nodeType === 3 ? e.target.parentElement : e.target)?.closest?.('[role="row"]');
    if (row && row.closest('#pane-side')) { setTimeout(scanAll, 800); setTimeout(scanAll, 2000); }
  }, true);

  // ==================== 独立翻译面板（不依赖 WhatsApp 事件） ====================
  function createPanel() {
    try {
      if (document.querySelector('.wt-panel-wrap')) return;
      console.log('[WAT] 开始创建面板...');

      // 容器
      const wrap = document.createElement('div');
      wrap.className = 'wt-panel-wrap';
      wrap.style.cssText =
        'position:fixed;bottom:20px;right:20px;z-index:999999;' +
        'width:300px;background:#1f2c33;border-radius:12px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.5);overflow:hidden;' +
        'font-family:system-ui,sans-serif;';
      console.log('[WAT] wrap created');

      // 头部
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#2a3942;cursor:pointer;';
      header.innerHTML = '<span style="color:#aebac1;font-size:13px;font-weight:600;">翻译面板</span><span style="color:#8696a0;font-size:18px;" class="wt-panel-toggle">−</span>';
      wrap.appendChild(header);

      // 内容区
      const body = document.createElement('div');
      body.className = 'wt-panel-body';
      body.style.cssText = 'padding:8px 12px 12px;';

      // 输入框
      const input = document.createElement('textarea');
      input.placeholder = '输入中文，翻译后发送...';
      input.style.cssText = 'width:100%;height:60px;background:#2a3942;border:1px solid #3b4a54;border-radius:8px;color:#d1d7db;padding:8px;font-size:14px;resize:none;box-sizing:border-box;font-family:system-ui,sans-serif;outline:none;';
      body.appendChild(input);

      // 按钮行
      const btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:8px;margin-top:8px;';

      const fillBtn = document.createElement('button');
      fillBtn.textContent = '翻译 → 填入';
      fillBtn.style.cssText = 'flex:1;padding:8px;background:#25d366;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;';

      const sendBtn = document.createElement('button');
      sendBtn.textContent = '翻译并发送';
      sendBtn.style.cssText = 'flex:1;padding:8px;background:#008069;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;';

      btnRow.appendChild(fillBtn);
      btnRow.appendChild(sendBtn);
      body.appendChild(btnRow);

      // 状态
      const status = document.createElement('div');
      status.style.cssText = 'margin-top:6px;color:#8696a0;font-size:12px;text-align:center;min-height:16px;';
      body.appendChild(status);

      wrap.appendChild(body);
      document.body.appendChild(wrap);
      console.log('[WAT] 面板已添加到 DOM');

      // 折叠/展开
      let collapsed = false;
      header.addEventListener('click', () => {
        collapsed = !collapsed;
        body.style.display = collapsed ? 'none' : '';
        header.querySelector('.wt-panel-toggle').textContent = collapsed ? '+' : '−';
        console.log('[WAT] panel toggle:', collapsed);
      });

      // 填入
      fillBtn.addEventListener('click', async () => {
        console.log('[WAT] fillBtn clicked');
        const text = input.value.trim();
        if (!text) { status.textContent = '请先输入文字'; return; }
        if (!hasChinese(text)) { status.textContent = '不含中文'; return; }
        status.textContent = '翻译中...';
        const translation = await translateText(text, settings.outgoingTarget);
        if (translation) {
          const editor = getEditor();
          if (editor) {
            replaceEditorText(editor, translation);
            status.textContent = '已填入';
            input.value = '';
          } else {
            status.textContent = '未找到输入框';
          }
        } else {
          status.textContent = '翻译失败';
        }
      });

      // 发送
      sendBtn.addEventListener('click', async () => {
        console.log('[WAT] sendBtn clicked');
        const text = input.value.trim();
        if (!text) { status.textContent = '请先输入文字'; return; }
        if (!hasChinese(text)) { status.textContent = '不含中文'; return; }
        status.textContent = '翻译中...';
        const translation = await translateText(text, settings.outgoingTarget);
        if (translation) {
          const editor = getEditor();
          if (editor) {
            replaceEditorText(editor, translation);
            await new Promise(r => setTimeout(r, 400));
            const sbtn = getSendBtn();
            if (sbtn) { sbtn.click(); status.textContent = '已发送!'; input.value = ''; }
            else { status.textContent = '已填入（请手动发送）'; }
          } else {
            status.textContent = '未找到输入框';
          }
        } else {
          status.textContent = '翻译失败';
        }
      });

      // Ctrl+Enter = 发送
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
          e.preventDefault();
          sendBtn.click();
        }
      });

      console.log('[WAT] 面板创建完成');
    } catch (err) {
      console.error('[WAT] 面板创建失败', err);
      // 兜底：建一个红点验证 DOM 写入
      try {
        const dot = document.createElement('div');
        dot.style.cssText = 'position:fixed;bottom:20px;right:20px;width:20px;height:20px;background:red;border-radius:50%;z-index:999999;';
        dot.textContent = 'E';
        dot.style.color = 'white';
        dot.style.fontSize = '12px';
        dot.style.textAlign = 'center';
        dot.style.lineHeight = '20px';
        document.body.appendChild(dot);
      } catch (e2) { console.error('[WAT] 兜底也失败', e2); }
    }
  }

  // ==================== 设置面板 ====================
  function injectStyles() {
    const s = document.createElement('style');
    s.textContent =
      '.wt-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;}' +
      '.wt-sp{background:#fff;border-radius:12px;padding:24px;width:380px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:sans-serif;color:#333;}' +
      '.wt-sp h2{margin:0 0 16px;font-size:18px;color:#25d366;}' +
      '.wt-sp label{display:block;margin-bottom:12px;font-size:13px;font-weight:500;}' +
      '.wt-sp input[type="text"],.wt-sp select{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;margin-top:4px;box-sizing:border-box;}' +
      '.wt-sp .save{background:#25d366;color:#fff;margin-right:8px;}' +
      '.wt-sp .cancel{background:#eee;color:#666;}' +
      '.wt-sp button{padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;}' +
      '.wt-g{position:fixed;top:16px;right:16px;z-index:999990;width:36px;height:36px;border-radius:50%;border:none;background:#25d366;color:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);}';
    document.head.appendChild(s);
  }

  function createGear() {
    if (document.querySelector('.wt-g')) return;
    const b = document.createElement('button');
    b.className = 'wt-g'; b.textContent = '⚙'; b.title = '设置';
    b.addEventListener('click', () => document.querySelector('.wt-overlay') ? closeSettings() : openSettings());
    document.body.appendChild(b);
  }

  function openSettings() {
    if (document.querySelector('.wt-overlay')) return;
    const o = document.createElement('div');
    o.className = 'wt-overlay';
    o.innerHTML =
      '<div class="wt-sp"><h2>翻译设置</h2>' +
      '<label>DeepSeek API Key<input type="text" id="wt-k" value="' + esc(settings.apiKey) + '" placeholder="sk-..."></label>' +
      '<label>模型<select id="wt-m"><option value="deepseek-chat" ' + (settings.model === 'deepseek-chat' ? 'selected' : '') + '>deepseek-chat</option><option value="deepseek-reasoner" ' + (settings.model === 'deepseek-reasoner' ? 'selected' : '') + '>deepseek-reasoner</option></select></label>' +
      '<label>入站翻译目标<input type="text" id="wt-it" value="' + esc(settings.incomingTarget) + '" placeholder="Chinese"></label>' +
      '<label>出站翻译目标<input type="text" id="wt-ot" value="' + esc(settings.outgoingTarget) + '" placeholder="English"></label>' +
      '<label style="display:flex;align-items:center;font-weight:normal;"><input type="checkbox" id="wt-at" ' + (settings.autoTranslate ? 'checked' : '') + '>自动翻译入站消息</label>' +
      '<label style="display:flex;align-items:center;font-weight:normal;"><input type="checkbox" id="wt-sb" ' + (settings.showButton ? 'checked' : '') + '>显示手动翻译按钮</label>' +
      '<div style="margin-top:16px;"><button class="save" id="wt-sv">保存</button><button class="cancel" id="wt-cl">取消</button></div></div>';
    o.addEventListener('click', e => { if (e.target === o) closeSettings(); });
    o.querySelector('#wt-sv').addEventListener('click', () => {
      saveSetting('apiKey', o.querySelector('#wt-k').value.trim());
      saveSetting('model', o.querySelector('#wt-m').value);
      saveSetting('incomingTarget', o.querySelector('#wt-it').value.trim());
      saveSetting('outgoingTarget', o.querySelector('#wt-ot').value.trim());
      saveSetting('autoTranslate', o.querySelector('#wt-at').checked);
      saveSetting('showButton', o.querySelector('#wt-sb').checked);
      closeSettings(); console.log('[WAT] saved');
    });
    o.querySelector('#wt-cl').addEventListener('click', closeSettings);
    document.body.appendChild(o);
  }
  function closeSettings() { const o = document.querySelector('.wt-overlay'); if (o) o.remove(); }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ==================== Init ====================
  async function init() {
    console.log('[WAT] init');
    await loadSettings();
    injectStyles();
    createGear();
    createPanel();
    setInterval(createPanel, 5000); // 防止被 WhatsApp 干掉后重新注入
    setInterval(createGear, 5000);
    setTimeout(startObserving, 2000);

    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) { lastUrl = location.href; setTimeout(startObserving, 1500); }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
