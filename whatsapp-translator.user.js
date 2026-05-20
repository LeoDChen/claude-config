// ==UserScript==
// @name         WhatsApp 实时翻译助手
// @namespace    https://github.com/leodchen/whatsapp-translator
// @version      1.0.0
// @description  在 WhatsApp Web 中一键/自动翻译消息，使用 DeepSeek API
// @author       LeoDChen
// @match        https://web.whatsapp.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @connect      api.deepseek.com
// ==/UserScript==

(function () {
  'use strict';

  // ==================== 默认配置 ====================
  const DEFAULTS = {
    apiKey: '',
    model: 'deepseek-chat',
    incomingTarget: 'Chinese',       // 收到的消息翻译成什么语言
    outgoingTarget: 'English',       // 发出的消息（中文→英文）
    autoTranslate: true,             // 自动翻译入站消息
    showButton: true,                // 是否显示手动翻译按钮
  };

  function cfg(key) {
    return GM_getValue(key, DEFAULTS[key]);
  }
  function setCfg(key, val) {
    GM_setValue(key, val);
  }

  // ==================== 状态 ====================
  const translatedMessages = new Set();   // 已翻译消息 ID，避免重复
  let observer = null;
  let settingsVisible = false;

  // ==================== DeepSeek API ====================
  async function translateText(text, targetLang) {
    const apiKey = cfg('apiKey');
    if (!apiKey) {
      console.warn('[WhatsApp翻译] 未设置 API Key，请在设置中配置');
      return null;
    }

    const prompt =
      targetLang === 'Chinese' || targetLang === '中文'
        ? `Translate the following text to Chinese. If it's already in Chinese, return it unchanged. Only output the translation, nothing else:\n\n${text}`
        : `Translate the following text to ${targetLang}. Only output the translation, nothing else:\n\n${text}`;

    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://api.deepseek.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        data: JSON.stringify({
          model: cfg('model'),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 4096,
        }),
        onload(resp) {
          try {
            const data = JSON.parse(resp.responseText);
            resolve(data.choices?.[0]?.message?.content?.trim() || null);
          } catch (e) {
            console.error('[WhatsApp翻译] API 响应解析失败', e);
            resolve(null);
          }
        },
        onerror(err) {
          console.error('[WhatsApp翻译] API 请求失败', err);
          resolve(null);
        },
        ontimeout() {
          console.error('[WhatsApp翻译] API 请求超时');
          resolve(null);
        },
        timeout: 15000,
      });
    });
  }

  // ==================== UI：翻译结果显示 ====================
  function showTranslation(messageEl, translation) {
    // 移除旧翻译
    const old = messageEl.querySelector('.wt-translation');
    if (old) old.remove();

    const div = document.createElement('div');
    div.className = 'wt-translation';
    div.style.cssText =
      'margin-top:4px;padding:6px 10px;background:rgba(37,211,102,0.1);border-left:3px solid #25d366;border-radius:4px;font-size:13px;color:var(--primary-strong, #111);line-height:1.4;max-width:100%;word-break:break-word;';
    div.textContent = translation;
    messageEl.appendChild(div);
  }

  function showTranslating(messageEl) {
    const old = messageEl.querySelector('.wt-translation');
    if (old) old.remove();

    const div = document.createElement('div');
    div.className = 'wt-translation wt-translating';
    div.style.cssText =
      'margin-top:4px;padding:6px 10px;color:#999;font-size:12px;font-style:italic;';
    div.textContent = '翻译中...';
    messageEl.appendChild(div);
  }

  // ==================== 获取消息文本 ====================
  function getMessageText(messageEl) {
    // WhatsApp 消息文本在可复制的 span 中
    const spans = messageEl.querySelectorAll('span.selectable-text, span[dir]');
    if (spans.length === 0) return null;
    return Array.from(spans)
      .map((s) => s.textContent)
      .join(' ')
      .trim();
  }

  // 判断是否为入站消息（别人发的）
  function isIncomingMessage(messageEl) {
    // 入站消息通常在左侧，有特定 class 或 data 属性
    return !!(
      messageEl.closest('[data-pre-plain-text]') ||
      messageEl.querySelector('[data-pre-plain-text]') ||
      messageEl.classList.contains('message-in')
    );
  }

  // 判断是否为出站消息（我发的）
  function isOutgoingMessage(messageEl) {
    return (
      !isIncomingMessage(messageEl) &&
      getMessageText(messageEl) !== null &&
      messageEl.closest('[role="row"]') !== null
    );
  }

  // 生成消息唯一 ID
  function getMessageId(messageEl) {
    // 使用消息内容 + 相邻时间戳生成 ID
    const text = getMessageText(messageEl);
    if (!text) return null;
    // 截取前 80 个字符做 hash
    const hash = text.substring(0, 80).split('').reduce((a, c) => {
      a = (a << 5) - a + c.charCodeAt(0);
      return a & 0x7fffffff;
    }, 0);
    return `${hash}_${text.length}`;
  }

  // ==================== 翻译按钮 ====================
  function createTranslateButton(messageEl, isIncoming) {
    const btn = document.createElement('button');
    btn.className = 'wt-translate-btn';
    btn.title = isIncoming ? '翻译成中文' : '翻译成英文';
    btn.style.cssText =
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:22px;height:22px;border:none;border-radius:50%;' +
      'background:rgba(37,211,102,0.15);color:#25d366;cursor:pointer;' +
      'font-size:12px;margin-left:4px;opacity:0.6;transition:opacity 0.15s;' +
      'vertical-align:middle;flex-shrink:0;padding:0;line-height:1;';
    btn.textContent = '译';
    btn.onmouseenter = () => (btn.style.opacity = '1');
    btn.onmouseleave = () => (btn.style.opacity = '0.6');

    btn.onclick = async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const text = getMessageText(messageEl);
      if (!text) return;
      showTranslating(messageEl);
      const target = isIncoming ? cfg('incomingTarget') : cfg('outgoingTarget');
      const translation = await translateText(text, target);
      if (translation) {
        showTranslation(messageEl, translation);
        translatedMessages.add(getMessageId(messageEl));
      } else {
        const el = messageEl.querySelector('.wt-translation');
        if (el) el.textContent = '翻译失败，请检查 API Key';
      }
    };

    return btn;
  }

  // ==================== 将翻译按钮添加到消息 ====================
  function addTranslateButton(messageEl) {
    if (!cfg('showButton')) return;
    if (messageEl.querySelector('.wt-translate-btn')) return; // 已有按钮

    const text = getMessageText(messageEl);
    if (!text || text.length < 2) return; // 太短不处理

    const isIncoming = isIncomingMessage(messageEl);

    // 找到消息气泡内可以插入按钮的位置
    // 在消息文本区域后面插入
    const textContainer =
      messageEl.querySelector('.copyable-text') ||
      messageEl.querySelector('[data-pre-plain-text]')?.parentElement ||
      messageEl.querySelector('.selectable-text')?.closest('div') ||
      messageEl;

    const btn = createTranslateButton(messageEl, isIncoming);
    textContainer.appendChild(btn);
  }

  // ==================== 自动翻译 ====================
  async function autoTranslateIfNeeded(messageEl) {
    if (!cfg('autoTranslate')) return;
    const msgId = getMessageId(messageEl);
    if (!msgId || translatedMessages.has(msgId)) return;

    const text = getMessageText(messageEl);
    if (!text || text.length < 3) return;

    // 快速跳过纯中文（不需要翻译）
    const chineseChars = (text.match(/[一-鿿]/g) || []).length;
    if (chineseChars > text.length * 0.5) return; // 大部分是中文，跳过

    const isIncoming = isIncomingMessage(messageEl);
    if (!isIncoming) return; // 只自动翻译入站消息

    showTranslating(messageEl);
    const translation = await translateText(text, cfg('incomingTarget'));
    if (translation) {
      showTranslation(messageEl, translation);
      translatedMessages.add(msgId);
    } else {
      const el = messageEl.querySelector('.wt-translating');
      if (el) el.remove();
    }
  }

  // ==================== 出站翻译：输入框处理 ====================
  function setupOutgoingTranslation() {
    // 在发送按钮旁边添加翻译按钮
    const addSendAreaButton = () => {
      const sendBtn = document.querySelector('button[data-tab="11"]');
      if (!sendBtn) return;

      const footer = sendBtn.closest('div[role="button"]')?.parentElement;
      if (!footer) return;
      if (footer.querySelector('.wt-send-translate-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'wt-send-translate-btn';
      btn.title = '翻译输入内容后发送';
      btn.style.cssText =
        'width:40px;height:40px;border:none;border-radius:50%;' +
        'background:rgba(37,211,102,0.12);color:#25d366;cursor:pointer;' +
        'font-size:16px;display:flex;align-items:center;justify-content:center;' +
        'transition:background 0.15s;';
      btn.textContent = '译';
      btn.onmouseenter = () => (btn.style.background = 'rgba(37,211,102,0.25)');
      btn.onmouseleave = () => (btn.style.background = 'rgba(37,211,102,0.12)');

      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 获取输入框
        const inputArea = document.querySelector(
          'div[contenteditable="true"][role="textbox"]'
        );
        if (!inputArea) return;

        const originalText = inputArea.innerText?.trim();
        if (!originalText) return;

        // 显示翻译中状态
        btn.textContent = '…';
        btn.style.opacity = '0.6';

        const translation = await translateText(originalText, cfg('outgoingTarget'));
        if (translation) {
          // 替换输入框内容
          inputArea.focus();
          // 清空输入框
          inputArea.innerHTML = '';
          // 插入翻译结果
          const textNode = document.createTextNode(translation);
          inputArea.appendChild(textNode);
          // 触发 input 事件让 WhatsApp 识别内容变化
          inputArea.dispatchEvent(new Event('input', { bubbles: true }));

          // 把光标移到末尾
          const range = document.createRange();
          range.selectNodeContents(inputArea);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }

        btn.textContent = '译';
        btn.style.opacity = '1';
      };

      // 插入到发送按钮前面
      const sendButton = footer.querySelector('button[data-tab="11"]');
      if (sendButton) {
        sendButton.parentElement?.insertBefore(btn, sendButton);
      }
    };

    // 定期检查发送按钮是否渲染（DOM 可能动态变化）
    setInterval(addSendAreaButton, 2000);
    addSendAreaButton();
  }

  // ==================== 消息监控 ====================
  function findMessageContainer() {
    // WhatsApp Web 的消息列表区域
    const selectors = [
      'div[role="application"]',
      '#main div[style*="overflow"]',
      '#main ._3BcI_',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // 回退：找主面板中的可滚动区域
    const main = document.querySelector('#main');
    if (!main) return null;
    const scrollables = main.querySelectorAll('div');
    for (const div of scrollables) {
      if (div.scrollHeight > div.clientHeight + 50) return div;
    }
    return null;
  }

  function processMessageNode(node) {
    // 判断是否为消息行
    if (node.nodeType !== 1) return; // 非元素节点

    // WhatsApp 消息通常是 role="row" 或其子元素
    const messageRow =
      node.matches?.('[role="row"]') ||
      node.querySelector?.('[role="row"]');

    const target = messageRow || node;

    // 检查是否包含可复制文本
    if (target.querySelector?.('.selectable-text, .copyable-text, [data-pre-plain-text]')) {
      addTranslateButton(target);
      autoTranslateIfNeeded(target);
    }

    // 也检查 node 本身是否包含消息内容
    if (
      node.querySelectorAll &&
      (node.querySelector('.selectable-text') ||
        node.querySelector('.copyable-text') ||
        node.querySelector('[data-pre-plain-text]'))
    ) {
      addTranslateButton(node);
      autoTranslateIfNeeded(node);
    }
  }

  function startObserving() {
    const container = findMessageContainer();
    if (!container) {
      console.warn('[WhatsApp翻译] 未找到消息容器，2秒后重试');
      setTimeout(startObserving, 2000);
      return;
    }

    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          processMessageNode(node);
        }
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // 处理已存在的消息
    document.querySelectorAll('[role="row"]').forEach(processMessageNode);

    console.log('[WhatsApp翻译] 消息监控已启动');
  }

  // ==================== 设置面板 ====================
  function createSettingsPanel() {
    GM_addStyle(`
      .wt-settings-overlay {
        position: fixed; top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.5);z-index:99999;
        display:flex;align-items:center;justify-content:center;
      }
      .wt-settings-panel {
        background:#fff;border-radius:12px;padding:24px;width:380px;
        max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        color:#333;
      }
      .wt-settings-panel h2 {margin:0 0 16px;font-size:18px;color:#25d366;}
      .wt-settings-panel label {display:block;margin-bottom:12px;font-size:13px;font-weight:500;}
      .wt-settings-panel input[type="text"],
      .wt-settings-panel select {
        width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;
        font-size:13px;margin-top:4px;box-sizing:border-box;
      }
      .wt-settings-panel input[type="checkbox"] {margin-right:6px;}
      .wt-settings-panel button {
        padding:8px 16px;border:none;border-radius:6px;cursor:pointer;font-size:13px;
      }
      .wt-settings-panel .wt-save-btn {
        background:#25d366;color:#fff;margin-right:8px;
      }
      .wt-settings-panel .wt-save-btn:hover {background:#20bd5a;}
      .wt-settings-panel .wt-close-btn {
        background:#eee;color:#666;
      }
      .wt-settings-btn {
        position:fixed;top:16px;right:16px;z-index:99990;
        width:36px;height:36px;border-radius:50%;border:none;
        background:#25d366;color:#fff;cursor:pointer;font-size:18px;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:transform 0.15s;
      }
      .wt-settings-btn:hover {transform:scale(1.1);}
    `);

    // 创建设置齿轮按钮
    const gearBtn = document.createElement('button');
    gearBtn.className = 'wt-settings-btn';
    gearBtn.textContent = '⚙';
    gearBtn.title = '翻译设置';
    gearBtn.onclick = () => {
      if (document.querySelector('.wt-settings-overlay')) {
        closeSettings();
      } else {
        openSettings();
      }
    };
    document.body.appendChild(gearBtn);

    return gearBtn;
  }

  function openSettings() {
    if (document.querySelector('.wt-settings-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'wt-settings-overlay';

    overlay.innerHTML = `
      <div class="wt-settings-panel">
        <h2>翻译设置</h2>
        <label>DeepSeek API Key
          <input type="text" id="wt-api-key" value="${escapeHtml(cfg('apiKey'))}" placeholder="sk-...">
        </label>
        <label>模型
          <select id="wt-model">
            <option value="deepseek-chat" ${cfg('model') === 'deepseek-chat' ? 'selected' : ''}>deepseek-chat</option>
            <option value="deepseek-reasoner" ${cfg('model') === 'deepseek-reasoner' ? 'selected' : ''}>deepseek-reasoner</option>
          </select>
        </label>
        <label>入站翻译目标语言
          <input type="text" id="wt-incoming-target" value="${escapeHtml(cfg('incomingTarget'))}" placeholder="Chinese">
        </label>
        <label>出站翻译目标语言（输入中文→翻译成）
          <input type="text" id="wt-outgoing-target" value="${escapeHtml(cfg('outgoingTarget'))}" placeholder="English">
        </label>
        <label style="display:flex;align-items:center;font-weight:normal;">
          <input type="checkbox" id="wt-auto-translate" ${cfg('autoTranslate') ? 'checked' : ''}>
          自动翻译入站消息
        </label>
        <label style="display:flex;align-items:center;font-weight:normal;">
          <input type="checkbox" id="wt-show-button" ${cfg('showButton') ? 'checked' : ''}>
          显示手动翻译按钮
        </label>
        <div style="margin-top:16px;display:flex;">
          <button class="wt-save-btn" id="wt-save">保存</button>
          <button class="wt-close-btn" id="wt-close">取消</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSettings();
    });

    overlay.querySelector('#wt-save').onclick = () => {
      setCfg('apiKey', overlay.querySelector('#wt-api-key').value.trim());
      setCfg('model', overlay.querySelector('#wt-model').value);
      setCfg('incomingTarget', overlay.querySelector('#wt-incoming-target').value.trim());
      setCfg('outgoingTarget', overlay.querySelector('#wt-outgoing-target').value.trim());
      setCfg('autoTranslate', overlay.querySelector('#wt-auto-translate').checked);
      setCfg('showButton', overlay.querySelector('#wt-show-button').checked);
      closeSettings();
      console.log('[WhatsApp翻译] 设置已保存');
    };

    overlay.querySelector('#wt-close').onclick = closeSettings;

    document.body.appendChild(overlay);
  }

  function closeSettings() {
    const overlay = document.querySelector('.wt-settings-overlay');
    if (overlay) overlay.remove();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== 键盘快捷键 ====================
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+T: 翻译输入框内容
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        const inputArea = document.querySelector(
          'div[contenteditable="true"][role="textbox"]'
        );
        if (!inputArea || document.activeElement !== inputArea) return;

        e.preventDefault();
        const text = inputArea.innerText?.trim();
        if (!text) return;

        // 显示临时提示
        showTranslating(inputArea.closest('[role="row"]') || inputArea);

        translateText(text, cfg('outgoingTarget')).then((translation) => {
          if (translation) {
            inputArea.innerHTML = '';
            inputArea.appendChild(document.createTextNode(translation));
            inputArea.dispatchEvent(new Event('input', { bubbles: true }));
            const range = document.createRange();
            range.selectNodeContents(inputArea);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        });
      }
    });
  }

  // ==================== 初始化 ====================
  function init() {
    console.log('[WhatsApp翻译] 初始化...');

    // 创建设置按钮
    createSettingsPanel();

    // 启动消息监控（延迟等待 WhatsApp 加载）
    setTimeout(startObserving, 3000);

    // 设置出站翻译
    setupOutgoingTranslation();

    // 键盘快捷键
    setupKeyboardShortcuts();

    // URL 变化时重新初始化（WhatsApp Web SPA 导航）
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(startObserving, 1500);
      }
    }).observe(document.querySelector('body') || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // 等待页面基本加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
