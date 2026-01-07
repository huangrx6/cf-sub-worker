/**
 * 订阅页模板
 */

import { escapeHtml, escapeJsString } from '../utils.js';
import { baseStyles, darkThemeStyles, qrStyles } from './styles.js';

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

    const cards = links.map((l) => {
        const safeUrl = escapeJsString(l.url);
        const htmlUrl = escapeHtml(l.url);
        return `
      <div class="link-card">
        <div class="link-top">
          <div class="link-key">${escapeHtml(l.key)}</div>
          <div class="link-actions">
            <button class="btn ghost" onclick="copyText('${safeUrl}')">复制</button>
            <button class="btn ghost" onclick="showQR('${safeUrl}')">二维码</button>
            <a class="btn ghost" href="${htmlUrl}" target="_blank" rel="noreferrer">打开</a>
          </div>
        </div>
        <div class="mono url">${htmlUrl}</div>
      </div>`;
    }).join('');

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230071e3'><path d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z'/></svg>">
  <title>${safeName}</title>
  <style>
    ${baseStyles}
    ${darkThemeStyles}
    ${qrStyles}
    
    .hero {
      padding: 40px 20px;
    }
    .k {
      color: #86868b;
      font-size: 13px;
    }
    h1 {
      margin: 8px 0 4px;
      font-size: 28px;
      font-weight: 600;
    }
    .sub {
      color: #86868b;
      line-height: 1.7;
    }
    .grid {
      margin-top: 20px;
      display: grid;
      gap: 12px;
    }
    .link-card {
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.6);
    }
    .link-top {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    .link-key {
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .link-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .url {
      margin-top: 10px;
      word-break: break-all;
      color: #86868b;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>
  <div class="wrap">
    <div class="hero card">
      <div class="k">SUB 页面 · ${escapeHtml(hostname || '')} /${escapeHtml(subId || '')}</div>
      <h1>${safeName}</h1>
      <div class="sub">下方为该 SUB 的访客订阅地址（可复制/生成二维码）。</div>
      <div class="grid">${cards}</div>
    </div>
  </div>

  <div class="toast" id="toast">已复制</div>

  <div class="qr-backdrop" id="qrBackdrop" onclick="closeQR(event)">
    <div class="qr-modal" role="dialog" aria-modal="true">
      <div class="qr-head">
        <div class="qr-title">订阅二维码</div>
        <button class="btn ghost" onclick="hideQR()">关闭</button>
      </div>
      <div id="qr"></div>
      <div class="mono" id="qrText" style="margin-top:12px;word-break:break-all;color:#86868b;font-size:12px;"></div>
    </div>
  </div>

  <script>
    const toast = document.getElementById('toast');
    let toastTimer;
    
    function showToast(msg) {
      toast.textContent = msg || '已复制';
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
    }
    
    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('已复制');
      } catch(e) {
        showToast('复制失败');
      }
    }
    
    function showQR(text) {
      const backdrop = document.getElementById('qrBackdrop');
      const qrDiv = document.getElementById('qr');
      const qrText = document.getElementById('qrText');
      qrDiv.innerHTML = '';
      qrText.textContent = text;
      backdrop.style.display = 'flex';
      new QRCode(qrDiv, { text, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.Q });
    }
    
    function hideQR() {
      document.getElementById('qrBackdrop').style.display = 'none';
    }
    
    function closeQR(e) {
      if (e.target && e.target.id === 'qrBackdrop') hideQR();
    }
  </script>
</body>
</html>`;
}
