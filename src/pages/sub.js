/**
 * 订阅页模板 - 极简设计风格
 */

import { escapeHtml, escapeJsString } from '../utils.js';
import { baseStyles, darkThemeStyles, subLinkStyles } from './styles.js';

/**
 * 渲染订阅页
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderSubPage({ subId, displayName, origin, hostname, guestToken }) {
    const safeName = escapeHtml(displayName || subId);
    const base = `${origin}/${subId}/sub?token=${encodeURIComponent(guestToken || '')}`;

    const links = [
        { key: '通用', url: base },
        { key: 'Base64', url: `${base}&b64` },
        { key: 'Clash', url: `${base}&clash` },
        { key: 'Sing-box', url: `${base}&sb` },
        { key: 'Surge', url: `${base}&surge` },
        { key: 'QuanX', url: `${base}&quanx` },
        { key: 'Loon', url: `${base}&loon` },
    ];

    const linkItems = links.map((l) => {
        const safeUrl = escapeJsString(l.url);
        return `
      <div class="sub-link-item">
        <div class="sub-link-icon">${escapeHtml(l.key.slice(0, 2).toUpperCase())}</div>
        <div class="sub-link-label">${escapeHtml(l.key)}</div>
        <div class="sub-link-actions">
          <button class="btn btn-secondary" onclick="copyLink('${safeUrl}')">复制</button>
          <button class="btn btn-secondary" onclick="showQR('${safeUrl}', '${escapeJsString(l.key)}')">二维码</button>
        </div>
      </div>`;
    }).join('');

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☁️</text></svg>">
  <title>${safeName}</title>
  <style>
    ${baseStyles}
    ${darkThemeStyles}
    ${subLinkStyles}

    .header {
      text-align: center;
      padding: 48px 0 40px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .header .subtitle {
      color: var(--text-secondary);
      font-size: 15px;
    }
    .header .path {
      margin-top: 16px;
      font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
      font-size: 13px;
      color: var(--text-tertiary);
      background: #f5f5f7;
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
    }
    @media (prefers-color-scheme: dark) {
      .header .path { background: #2c2c2e; }
    }

    .footer {
      text-align: center;
      padding: 40px 0;
      color: var(--text-tertiary);
      font-size: 13px;
    }
    .footer a { color: var(--text-secondary); text-decoration: none; }
    .footer a:hover { color: var(--text-primary); }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${safeName}</h1>
      <p class="subtitle">访客订阅地址 · 点击复制或生成二维码</p>
      <div class="path">${escapeHtml(hostname || '')}/${escapeHtml(subId || '')}</div>
    </header>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">订阅链接</h2>
      </div>
      <div class="sub-links">
        ${linkItems}
      </div>
    </div>

    <footer class="footer">
      <p>Powered by <a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">CF-Workers-SUB</a></p>
    </footer>
  </div>

  <!-- QR Modal -->
  <dialog id="qrModal">
    <div class="modal-box">
      <button class="modal-close" onclick="closeQR()">×</button>
      <h3 id="qrTitle" style="margin-top:0;margin-bottom:16px;">二维码</h3>
      <div id="qrCanvas"></div>
      <p id="qrUrl" style="margin-top:16px;font-size:12px;color:var(--text-secondary);word-break:break-all;max-width:300px;"></p>
    </div>
  </dialog>

  <div class="toast" id="toast">已复制</div>

  <script>
    // ===== Toast 提示 =====
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
      toast.textContent = msg || '已复制';
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // ===== 复制链接 =====
    async function copyLink(text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('已复制');
      } catch(e) {
        showToast('复制失败');
      }
    }

    // ===== QR 码 =====
    function showQR(text, title) {
      const modal = document.getElementById('qrModal');
      const canvas = document.getElementById('qrCanvas');
      const titleEl = document.getElementById('qrTitle');
      const urlEl = document.getElementById('qrUrl');

      canvas.innerHTML = '';
      titleEl.textContent = title || '二维码';
      urlEl.textContent = text;

      new QRCode(canvas, {
        text: text,
        width: 240,
        height: 240,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });

      modal.showModal();

      // 点击背景关闭
      modal.addEventListener('click', (e) => {
        const rect = modal.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) {
          modal.close();
        }
      });
    }

    function closeQR() {
      document.getElementById('qrModal').close();
    }
  </script>
</body>
</html>`;
}
