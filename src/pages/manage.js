/**
 * 管理页模板
 */

import { escapeHtml, escapeJsString } from '../utils.js';
import { baseStyles, darkThemeStyles, subLinkStyles } from './styles.js';

/**
 * 渲染管理页
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderManagePage({ title, origin, hostname, adminPath, mainEditPath, guestToken, main, subs, hasKV }) {
  const safeTitle = escapeHtml(title || 'SUB 管理');
  const safeGuest = String(guestToken || '').trim();
  const adminToken = String(adminPath || '').replace(/^\//, '').trim();
  const mainAdminUrl = adminToken ? `${origin}/sub?token=${encodeURIComponent(adminToken)}` : '';
  const mainDisplayName = escapeHtml(main?.displayName || title || '主订阅');
  const mainFileName = escapeHtml(main?.FileName || title || 'main');
  const mainGuestBase = safeGuest ? `${origin}/sub?token=${encodeURIComponent(safeGuest)}` : '';

  // 生成主订阅卡片
  const mainCard = generateSubCard({
    id: 'main',
    displayName: mainDisplayName,
    fileName: mainFileName,
    hostname,
    viewPath: '/',
    editPath: escapeHtml(mainEditPath),
    adminUrl: mainAdminUrl,
    guestUrl: mainGuestBase,
    adminToken,
    safeGuest,
    isMain: true,
  });

  // 生成子订阅卡片
  const subCards = (subs || []).map((s) => {
    const id = escapeHtml(s.id);
    const displayName = escapeHtml(s.displayName || s.FileName || s.id);
    const fileName = escapeHtml(s.FileName || s.displayName || s.id);
    const viewPath = `/${id}`;
    const editPath = `/${id}${adminPath}`;
    const guestBase = safeGuest ? `${origin}/${id}/sub?token=${encodeURIComponent(safeGuest)}` : '';
    const adminBase = adminToken ? `${origin}/${id}/sub?token=${encodeURIComponent(adminToken)}` : '';

    return generateSubCard({
      id,
      displayName,
      fileName,
      hostname,
      viewPath,
      editPath: escapeHtml(editPath),
      adminUrl: adminBase,
      guestUrl: guestBase,
      adminToken,
      safeGuest,
      isMain: false,
    });
  }).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☁️</text></svg>">
  <title>${safeTitle}</title>
  <style>
    ${baseStyles}
    ${darkThemeStyles}
    ${subLinkStyles}
    
    /* Spinner */
    .spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 6px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .hero {
      text-align: center;
      padding-bottom: 32px;
      margin-bottom: 24px;
      border-bottom: 1px dashed var(--border-light);
    }
    .k { color: var(--text-tertiary); font-size: 13px; margin-bottom: 8px; font-family: monospace; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 12px;
      margin-bottom: 16px;
      background: #f5f5f7;
      color: #666;
    }
    .status-badge.ok { background: #dcfce7; color: #166534; }
    .status-badge.err { background: #fee2e2; color: #991b1b; }
    
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 16px;
    }
    
    .card-sub { color: var(--text-secondary); margin-top: 4px; font-size: 12px; font-family: 'SF Mono', monospace; }
    
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    
    .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .form { grid-template-columns: 1fr; }
    }
    
    .link-section {
      background: #f9fafb;
      padding: 16px;
      border-radius: 12px;
    }
    @media (prefers-color-scheme: dark) {
      .link-section { background: rgba(255,255,255,0.05); }
    }
    
    .link-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .link-row:last-child { margin-bottom: 0; }
    
    .tag {
      background: rgba(0, 0, 0, 0.05);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
      flex-shrink: 0;
    }
    
    .hint { color: var(--text-secondary); font-size: 12px; font-family: monospace; word-break: break-all; }
    
    .card-footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .site-footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border-light);
      color: var(--text-secondary);
      font-size: 12px;
    }
    .site-footer a { color: var(--text-primary); text-decoration: none; }
    .site-footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container manage-container">
    <div class="hero">
      <div class="k">${escapeHtml(hostname || '')}</div>
      <h1>${safeTitle}</h1>
      
      <div class="status-badge ${hasKV ? 'ok' : 'err'}">
        <div class="dot"></div>
        ${hasKV ? 'KV 存储已连接' : 'KV 未绑定 (仅只读)'}
      </div>

      <div class="toolbar">
        <a class="btn btn-secondary" href="/" target="_blank">预览首页</a>
        ${hasKV ? '<button class="btn btn-primary" onclick="createNewSub()">+ 新建子订阅</button>' : ''}
      </div>
    </div>

    <div class="grid">
      ${mainCard}
      ${subCards}
    </div>
    
    <footer class="site-footer">
      <p>Powered by <a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">CF-Workers-SUB</a> & <a href="https://github.com/lzxaf/CF-Workers-SUB-Modified" target="_blank">Modified Version</a></p>
    </footer>
  </div>

  <div class="toast" id="toast">已复制</div>

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
    
    async function saveMeta(id) {
      const card = document.querySelector('[data-id="' + id + '"]');
      if (!card) return;
      
      const displayName = card.querySelector('[name="displayName"]').value;
      const FileName = card.querySelector('[name="FileName"]').value;
      const btn = card.querySelector('.btn-primary');
      const originalText = btn.innerHTML;
      
      try {
        if (btn) {
           btn.disabled = true;
           btn.innerHTML = '<span class="spinner"></span> 保存中...';
        }

        const res = await fetch(window.location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveMeta', id, displayName, FileName })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('保存成功');
        } else {
          showToast('保存失败: ' + (data.error || '未知错误'));
        }
      } catch (e) {
        showToast('保存失败: ' + e.message);
      } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
      }
    }
    
    async function deleteSub(id) {
      if (!confirm('⚠️ 确定要彻底删除订阅 "' + id + '" 吗？\\n此操作无法撤销。')) return;
      
      const card = document.querySelector('[data-id="' + id + '"]');
      const btn = card.querySelector('.btn[onclick*="deleteSub"]');
      const originalText = btn ? btn.innerHTML : '删除订阅';

      try {
        if (btn) {
           btn.disabled = true;
           btn.innerHTML = '<span class="spinner" style="border-top-color:#ef4444; border-color:rgba(239,68,68,0.3)"></span> 删除中...';
        }
        
        const res = await fetch(window.location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteSub', id })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('删除成功');
          setTimeout(() => location.reload(), 800);
        } else {
          showToast('删除失败: ' + (data.error || '未知错误'));
        }
      } catch (e) {
        showToast('请求失败: ' + e.message);
      } finally {
        if (btn && !data.ok) { // Only revert if failed, otherwise page reloads
           btn.disabled = false;
           btn.innerHTML = originalText;
        }
      }
    }
    
    function createNewSub() {
      const id = prompt('请输入新订阅的 ID (英文字母或数字，例如 sub2)：');
      if (!id) return;
      if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        alert('ID 包含非法字符，请仅使用字母、数字、下划线或连字符。');
        return;
      }
      // 直接跳转到新订阅的编辑页面，实际上就是创建
      window.location.href = '/' + id + '${escapeJsString(adminPath)}';
    }
  </script>
</body>
</html>`;
}

/**
 * 生成订阅卡片 HTML
 */
function generateSubCard({
  id, displayName, fileName, hostname, viewPath, editPath,
  adminUrl, guestUrl, adminToken, safeGuest, isMain
}) {
  const safeAdminUrl = escapeJsString(adminUrl);
  const safeGuestUrl = escapeJsString(guestUrl);

  return `
    <div class="card" data-id="${id}">
      <div class="card-head">
        <div>
          <div class="card-title">${isMain ? '主订阅' : displayName}</div>
          <div class="card-sub">${escapeHtml(viewPath)}</div>
        </div>
        <div class="actions">
          ${isMain ? '' : `<a class="btn btn-secondary" href="${escapeHtml(viewPath)}" target="_blank">预览页面</a>`}
          <a class="btn btn-secondary" href="${editPath}" target="_blank">管理链接</a>
        </div>
      </div>

      <div class="form">
        <div class="form-group">
          <label class="form-label">显示名称</label>
          <input name="displayName" value="${displayName}" placeholder="例如：我的订阅" />
        </div>
        <div class="form-group">
          <label class="form-label">导出文件名</label>
          <input name="FileName" value="${fileName}" placeholder="例如：MySubscribe" />
        </div>
      </div>
      
      <div class="link-section">
        <div class="link-row">
          <span class="tag">管理员</span>
          <span class="hint">${adminToken ? escapeHtml(adminUrl) : '（无）'}</span>
          <button class="icon-btn" onclick="copyText('${safeAdminUrl}')" title="复制">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          </button>
        </div>
        <div class="link-row">
          <span class="tag">访客用</span>
          <span class="hint">${safeGuest ? escapeHtml(guestUrl) : '未设置 Token'}</span>
          <button class="icon-btn" onclick="copyText('${safeGuestUrl}')" title="复制">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          </button>
        </div>
      </div>
      
      <div class="card-footer">
        <div>
           ${!isMain ? `<button class="btn" style="color:#ef4444; border:1px solid #fee2e2; background:#fff1f2;" onclick="deleteSub('${id}')">删除订阅</button>` : ''}
        </div>
        <button class="btn btn-primary" onclick="saveMeta('${id}')">保存设置</button>
      </div>
    </div>`;
}
