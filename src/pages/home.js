/**
 * 首页模板
 */

import { escapeHtml } from '../utils.js';
import { baseStyles, darkThemeStyles } from './styles.js';

/**
 * 渲染首页
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderHomePage({ title, hasKV }) {
    const safeTitle = escapeHtml(title || 'CF-Workers-SUB');

    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230071e3'><path d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z'/></svg>">
  <title>${safeTitle}</title>
  <style>
    ${baseStyles}
    ${darkThemeStyles}
    
    .hero {
      text-align: center;
      padding: 60px 20px 80px;
    }
    .kicker {
      color: #86868b;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 48px;
      font-weight: 600;
      letter-spacing: -0.005em;
      color: #1d1d1f;
      margin-bottom: 12px;
    }
    .sub {
      color: #86868b;
      font-size: 17px;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }
    .grid {
      margin-top: 40px;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (max-width: 860px) {
      .grid { grid-template-columns: 1fr; }
      h1 { font-size: 32px; }
    }
    .label {
      font-size: 15px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 12px;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 16px;
    }
    .hint {
      margin-top: 12px;
      color: #86868b;
      font-size: 13px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 980px;
      background: rgba(0, 0, 0, 0.04);
      font-size: 13px;
      color: #86868b;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div class="kicker">Cloudflare Workers</div>
      <h1>${safeTitle}</h1>
      <div class="sub">高效的订阅聚合与优选工具，支持多种代理协议</div>
    </div>
    
    <div class="grid">
      <div class="card">
        <div class="label">管理员入口</div>
        <p class="card-desc">输入管理员 Token 进入后台管理</p>
        <div class="row">
          <input id="adminToken" type="password" placeholder="请输入 Token" class="mono" style="flex:1;min-width:200px;">
          <button class="btn btn-primary" onclick="goAdmin()">进入管理</button>
        </div>
      </div>
      
      <div class="card">
        <div class="label">项目信息</div>
        <p class="card-desc">基于 Cloudflare Workers 构建</p>
        <div class="hint" style="margin-top: 24px;">
          <span class="badge">KV：${hasKV ? '已绑定' : '未绑定'}</span>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function goAdmin() {
      const t = (document.getElementById('adminToken').value || '').trim();
      if (!t) return;
      window.location.href = '/' + encodeURIComponent(t);
    }
    document.getElementById('adminToken').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') goAdmin();
    });
  </script>
</body>
</html>`;
}
