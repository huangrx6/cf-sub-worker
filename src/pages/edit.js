/**
 * 编辑页模板
 */

import { escapeHtml, escapeJsString, safeJsonStringify } from '../utils.js';
import { baseStyles, darkThemeStyles, linkCardStyles, subLinkStyles, qrStyles } from './styles.js';

function normalizeViewPath(value) {
    const raw = String(value || '/').trim();
    if (!raw || raw === '/') return '/';
    const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
    const clean = withSlash.replace(/\/+$/, '');
    return clean || '/';
}

/**
 * 渲染编辑页
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderEditPage({
    content,
    displayFileName,
    displaySubConfig,
    displayBestIPUrl,
    displayCustomHosts,
    displayDisplayName,
    displayViewPath,
    subName,
    subPathPrefix,
    managePath,
    publicSubPath,
    guest,
    mytoken,
    url,
    subProtocol,
    subConverter,
    hasKV,
}) {
    const normalizedViewPath = normalizeViewPath(displayViewPath || (subName ? `/${subName}` : '/'));
    const safeFileName = escapeHtml(displayFileName);
    const safeDisplayName = escapeHtml(displayDisplayName);
    const safeViewPath = escapeHtml(normalizedViewPath);
    const safeSubConfig = escapeHtml(displaySubConfig);
    const safeBestIPUrl = escapeHtml(displayBestIPUrl || '');
    const safeCustomHosts = escapeHtml(displayCustomHosts || '');
    const basePath = subName
        ? `${subPathPrefix}/sub`
        : `${normalizedViewPath === '/' ? '' : normalizedViewPath}/sub`;
    const adminBaseUrl = `${url.origin}${basePath}?token=${mytoken}`;

    // 生成订阅链接
    const renderSubLink = (label, linkUrl) => {
        const safeUrl = escapeJsString(linkUrl);
        const htmlUrl = escapeHtml(linkUrl);
        const safeLabel = escapeJsString(label);
        return `
      <div class="sub-link-item">
        <div class="sub-link-icon">${escapeHtml(label.slice(0, 2).toUpperCase())}</div>
        <div class="sub-link-content">
          <div class="sub-link-label">${escapeHtml(label)}</div>
          <div class="sub-link-url">${htmlUrl}</div>
        </div>
        <div class="sub-link-actions">
          <button class="btn btn-secondary" onclick="copyLink('${safeUrl}')">复制</button>
          <button class="btn btn-secondary" onclick="showQR('${safeUrl}', '${safeLabel}')">二维码</button>
        </div>
      </div>`;
    };

    // 管理员订阅链接
    const adminLinks = [
        renderSubLink('通用', adminBaseUrl),
        renderSubLink('Base64', `${adminBaseUrl}&b64`),
        renderSubLink('Clash', `${adminBaseUrl}&clash`),
        renderSubLink('Singbox', `${adminBaseUrl}&sb`),
        renderSubLink('Surge', `${adminBaseUrl}&surge`),
        renderSubLink('Loon', `${adminBaseUrl}&loon`),
    ].join('');

    // 访客订阅链接
    const guestBaseUrl = `${url.origin}${subPathPrefix}/sub?token=${guest}`;
    const guestLinks = subName ? [
        renderSubLink('通用', guestBaseUrl),
        renderSubLink('Base64', `${guestBaseUrl}&b64`),
        renderSubLink('Clash', `${guestBaseUrl}&clash`),
        renderSubLink('Sing-box', `${guestBaseUrl}&sb`),
        renderSubLink('Surge', `${guestBaseUrl}&surge`),
        renderSubLink('Loon', `${guestBaseUrl}&loon`),
    ].join('') : '';

    // 安全地序列化 content 用于 JavaScript
    const safeContent = safeJsonStringify(content);

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <title>${safeFileName} 订阅编辑</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☁️</text></svg>">
  <style>
    ${baseStyles}
    ${darkThemeStyles}
    ${linkCardStyles}
    ${subLinkStyles}
    ${qrStyles}
    
    .header {
      text-align: center;
      padding: 40px 0 32px;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .header p { color: #86868b; font-size: 15px; }
    .header-nav {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      padding: 40px 0;
      color: #86868b;
      font-size: 13px;
    }
    .footer a { color: #0071e3; text-decoration: none; }
    .config-info {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 12px;
      padding: 16px;
    }
    .config-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .config-item:last-child { margin-bottom: 0; }
    .config-label {
      font-weight: 600;
      min-width: 100px;
      font-size: 13px;
    }
    .config-value {
      color: #86868b;
      word-break: break-all;
      font-size: 13px;
    }
    .toggle {
      cursor: pointer;
      color: #0071e3;
      font-size: 13px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${safeDisplayName}</h1>
      <p>${subName ? escapeHtml(subName) + ' · ' : ''}订阅编辑与管理</p>
      <div class="header-nav">
        <button class="btn btn-secondary" onclick="window.location.href='${escapeJsString(managePath)}'">
          ← 返回管理
        </button>
        ${subName ? `<button class="btn btn-secondary" onclick="window.location.href='${escapeJsString(publicSubPath)}'">SUB 页面</button>` : ''}
      </div>
    </header>

    <!-- 订阅名称设置 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">订阅名称</h2>
      </div>
      <div class="form-group">
        <label class="form-label">显示名称</label>
        <input id="displayNameInput" value="${safeDisplayName}" placeholder="输入显示名称">
      </div>
      <div class="form-group">
        <label class="form-label">文件名</label>
        <input id="fileNameInput" value="${safeFileName}" placeholder="输入文件名">
      </div>
      <div class="form-group">
        <label class="form-label">访问路径</label>
        <input id="viewPathInput" value="${safeViewPath}" placeholder="例如：/ 或 /main">
        <div class="form-hint">订阅的访问路径，默认为 ${subName ? `/${subName}` : '/'}</div>
      </div>
      <div style="margin-top: 12px;">
        <button class="btn btn-primary" onclick="saveMetaConfig(this)">保存名称</button>
        <span class="status" id="metaStatus"></span>
      </div>
    </div>

    <!-- 管理员订阅 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">管理员订阅</h2>
      </div>
      <p class="card-desc">点击复制或生成二维码</p>
      <div class="sub-links" style="margin-top: 16px;">
        ${adminLinks}
      </div>
    </div>

    ${subName ? `
    <!-- 访客订阅 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">访客订阅</h2>
        <div class="toggle" onclick="toggleGuest()">
          <span id="guestToggleText">展开 ▼</span>
        </div>
      </div>
      <p class="card-desc">Token: <code>${escapeHtml(guest)}</code></p>
      <div id="guestLinks" style="display:none;margin-top:16px;">
        <div class="sub-links">
          ${guestLinks}
        </div>
      </div>
    </div>
    ` : `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">访客订阅</h2>
      </div>
      <p class="card-desc">主订阅已禁用访客访问，仅管理员可用。</p>
    </div>
    `}

    <!-- 订阅转换配置 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">订阅转换配置</h2>
      </div>
      <div class="config-info">
        <div class="config-item">
          <span class="config-label">SUBAPI</span>
          <span class="config-value">${subProtocol}://${subConverter}</span>
        </div>
        <div class="config-item">
          <span class="config-label">SUBCONFIG</span>
          <span class="config-value">${safeSubConfig}</span>
        </div>
      </div>
      ${hasKV ? `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.06);">
        <h3 style="font-size:15px;font-weight:600;margin-bottom:12px;">优选 IP 设置</h3>
        <div class="form-group">
          <label class="form-label">优选IP列表链接（可选）</label>
          <input id="bestIPUrlInput" placeholder="https://example.com/bestip.txt" value="${safeBestIPUrl}">
          <div class="form-hint">远程IP列表，每行一个IP或域名</div>
        </div>
        <div class="form-group">
          <label class="form-label">自定义IP/域名（可选）</label>
          <textarea id="customHostsInput" placeholder="1.1.1.1&#10;example.com&#10;2606:4700::1111">${safeCustomHosts}</textarea>
          <div class="form-hint">支持逗号、空格、换行分隔；支持 IPv4/域名/IPv6</div>
        </div>
        <div>
          <button class="btn btn-primary" onclick="saveSubConfig(this)">保存</button>
          <span class="status" id="subConfigStatus"></span>
        </div>
      </div>
      ` : ''}
    </div>

    <!-- 链接编辑器 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">订阅链接</h2>
      </div>
      <p class="card-desc">添加订阅URL或节点链接，为每个链接单独配置优选选项</p>
      ${hasKV ? `
      <div style="margin-top: 16px;" id="linksContainer">
        <!-- 链接列表将通过 JavaScript 动态生成 -->
      </div>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06);">
        <button class="btn btn-secondary" onclick="addLink()">+ 添加链接</button>
        <button class="btn btn-primary" onclick="saveLinksContent(this)" style="margin-left: 12px;">保存全部</button>
        <span class="status" id="saveStatus"></span>
      </div>
      ` : '<p style="margin-top:12px;color:#ff453a;">请绑定 KV 命名空间</p>'}
    </div>

    <div class="footer">
      <p>Powered by <a href="https://github.com/cmliu/CF-Workers-SUB" target="_blank">CF-Workers-SUB</a> & <a href="https://github.com/lzxaf/CF-Workers-SUB-Modified" target="_blank">Modified Version</a></p>
    </div>
  </div>

  <!-- QR Modal -->
  <dialog id="qrModal">
    <div class="modal-box">
      <button class="modal-close" onclick="closeQR()">×</button>
      <h3 id="qrTitle" style="margin-top:0;margin-bottom:16px;">二维码</h3>
      <div id="qrCanvas"></div>
      <p id="qrUrl" style="margin-top:16px;font-size:12px;color:#86868b;word-break:break-all;max-width:300px;"></p>
    </div>
  </dialog>

  <div class="toast" id="toast">已复制</div>

  <script>
    // ===== 初始化数据 =====
    let linksData = [];
    const originalContent = ${safeContent};

    // ===== Toast 提示 =====
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
      toast.textContent = msg || '操作完成';
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

    // ===== 切换访客订阅显示 =====
    function toggleGuest() {
      const el = document.getElementById('guestLinks');
      const text = document.getElementById('guestToggleText');
      if (!el || !text) return;
      if (el.style.display === 'none') {
        el.style.display = 'block';
        text.textContent = '收起 ▲';
      } else {
        el.style.display = 'none';
        text.textContent = '展开 ▼';
      }
    }

    // ===== 解析链接数据 =====
    function parseLinks(content) {
      const lines = content.split('\\n').filter(line => line.trim());
      const links = [];
      lines.forEach((line, index) => {
        let url = line.trim();
        let name = '';
        let optimize = false;

        // 兼容旧格式
        const truePattern = /\\|true\\s*$/;
        const falsePattern = /\\|false\\s*$/;

        if (truePattern.test(url)) {
          optimize = true;
          url = url.replace(truePattern, '');
        } else if (falsePattern.test(url)) {
          optimize = false;
          url = url.replace(falsePattern, '');
        }

        // 提取名称
        const nameMatch = url.match(/#([^&|]+)$/);
        if (nameMatch) {
          try { name = decodeURIComponent(nameMatch[1]); } catch { name = nameMatch[1]; }
        } else if (url.startsWith('http')) {
          name = '订阅 ' + (index + 1);
        } else {
          name = '节点 ' + (index + 1);
        }

        if (url) {
          links.push({ id: Date.now() + index, name, url, optimize });
        }
      });
      return links;
    }

    // ===== 渲染链接卡片 =====
    function renderLinkCard(link, index) {
      const escapedName = link.name.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const escapedUrl = link.url.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      return '<div class="link-card" data-id="' + link.id + '">' +
        '<div class="link-card-header">' +
          '<div class="link-card-title">' +
            '<span class="link-card-number">#' + (index + 1) + '</span>' +
            '<span id="name_display_' + link.id + '">' + escapedName + '</span>' +
          '</div>' +
          '<div class="link-card-actions">' +
            '<button class="icon-btn" onclick="moveLink(' + link.id + ', -1)" title="上移"' + (index === 0 ? ' disabled style="opacity:0.3"' : '') + '>↑</button>' +
            '<button class="icon-btn" onclick="moveLink(' + link.id + ', 1)" title="下移">↓</button>' +
            '<button class="icon-btn delete" onclick="deleteLink(' + link.id + ')" title="删除">×</button>' +
          '</div>' +
        '</div>' +
        '<div class="link-card-fields">' +
          '<div class="link-field">' +
            '<label>名称</label>' +
            '<input type="text" class="link-input" id="name_' + link.id + '" value="' + escapedName + '" placeholder="输入名称" oninput="updateNameDisplay(' + link.id + ')">' +
          '</div>' +
          '<div class="link-field">' +
            '<label>链接</label>' +
            '<input type="text" class="link-input" id="url_' + link.id + '" value="' + escapedUrl + '" placeholder="https://... 或 vmess://...">' +
          '</div>' +
        '</div>' +
        '<div class="link-options">' +
          '<div class="link-optimize">' +
            '<span class="link-optimize-label">优选该链接</span>' +
            '<label class="switch">' +
              '<input type="checkbox" id="optimize_' + link.id + '"' + (link.optimize ? ' checked' : '') + '>' +
              '<span class="slider"></span>' +
            '</label>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    // ===== 渲染所有链接 =====
    function renderAllLinks() {
      const container = document.getElementById('linksContainer');
      if (!container) return;
      if (linksData.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📡</div><div class="empty-state-text">暂无订阅链接</div><div class="empty-state-hint">点击下方\"添加链接\"按钮开始添加</div></div>';
      } else {
        container.innerHTML = linksData.map((link, index) => renderLinkCard(link, index)).join('');
      }
    }

    // ===== 更新名称显示 =====
    function updateNameDisplay(id) {
      const nameInput = document.getElementById('name_' + id);
      const nameDisplay = document.getElementById('name_display_' + id);
      if (nameInput && nameDisplay) {
        const newName = nameInput.value.trim();
        nameDisplay.textContent = newName || '未命名';
        const link = linksData.find(l => l.id === id);
        if (link) link.name = newName || '链接 ' + (linksData.indexOf(link) + 1);
      }
    }

    // ===== 添加链接 =====
    function addLink() {
      const newId = Date.now();
      linksData.push({ id: newId, name: '链接 ' + (linksData.length + 1), url: '', optimize: false });
      renderAllLinks();
      setTimeout(() => {
        const urlInput = document.getElementById('url_' + newId);
        if (urlInput) urlInput.focus();
      }, 100);
    }

    // ===== 删除链接 =====
    function deleteLink(id) {
      if (!confirm('确定要删除这个链接吗？')) return;
      linksData = linksData.filter(link => link.id !== id);
      renderAllLinks();
    }

    // ===== 移动链接 =====
    function moveLink(id, direction) {
      const index = linksData.findIndex(link => link.id === id);
      if (index === -1) return;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= linksData.length) return;
      [linksData[index], linksData[newIndex]] = [linksData[newIndex], linksData[index]];
      renderAllLinks();
    }

    // ===== 链接转文本 =====
    function linksToText() {
      return linksData.map(link => {
        const urlInput = document.getElementById('url_' + link.id);
        const optimizeInput = document.getElementById('optimize_' + link.id);
        let url = urlInput ? urlInput.value.trim() : link.url;
        const optimize = optimizeInput ? optimizeInput.checked : link.optimize;
        if (url && optimize) {
          url = url + '|true';
        }
        return url;
      }).filter(line => line).join('\\n');
    }

    // ===== Loading Wrapper =====
    async function withLoading(btn, action) {
      if (btn) {
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> 保存中...';
        
        try {
          // Promise.all ensure at least 500ms (user said 1s, adjusting to 800ms for responsiveness)
          const start = Date.now();
          await action();
          const elapsed = Date.now() - start;
          if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      } else {
        await action();
      }
    }

    // ===== 保存链接内容 =====
    async function saveLinksContent(button) {
      await withLoading(button, async () => {
        try {
          const updatedLinks = [];
          linksData.forEach(link => {
            const nameInput = document.getElementById('name_' + link.id);
            const urlInput = document.getElementById('url_' + link.id);
            const optimizeInput = document.getElementById('optimize_' + link.id);
            if (nameInput && urlInput && optimizeInput) {
              const url = urlInput.value.trim();
              if (url) {
                updatedLinks.push({
                  id: link.id,
                  name: nameInput.value.trim(),
                  url: url,
                  optimize: optimizeInput.checked
                });
              }
            }
          });

          linksData = updatedLinks;
          const newContent = linksToText();

          const response = await fetch(window.location.href, {
            method: 'POST',
            body: newContent,
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            cache: 'no-cache'
          });

          if (!response.ok) throw new Error('HTTP ' + response.status);
          const text = await response.text();
          showToast(text || '保存成功');
        } catch (error) {
          console.error('保存失败:', error);
          showToast('保存失败: ' + error.message);
        }
      });
    }

    // ===== 保存名称配置 =====
    async function saveMetaConfig(button) {
      await withLoading(button, async () => {
        const displayName = document.getElementById('displayNameInput').value.trim();
        const FileName = document.getElementById('fileNameInput').value.trim();
        const viewPath = document.getElementById('viewPathInput').value.trim();

        try {
          const res = await fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ action: 'saveMeta', displayName, FileName, viewPath }),
            cache: 'no-cache'
          });
          const text = await res.text();
          if (!res.ok) throw new Error(text || 'HTTP ' + res.status);
          showToast(text || '名称保存成功');
        } catch (e) {
          showToast('保存失败: ' + (e.message || e));
        }
      });
    }

    // ===== 保存订阅配置 =====
    async function saveSubConfig(button) {
      await withLoading(button, async () => {
        const bestIPUrlElem = document.getElementById('bestIPUrlInput');
        const customHostsElem = document.getElementById('customHostsInput');
        const bestIPUrl = (bestIPUrlElem ? bestIPUrlElem.value : '').trim();
        const customHosts = customHostsElem ? customHostsElem.value : '';

        try {
          const res = await fetch(window.location.href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({ action: 'saveSubConfig', bestIPUrl, customHosts }),
            cache: 'no-cache'
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const text = await res.text();
          showToast(text || '保存成功');
        } catch (error) {
          console.error('Save sub config error:', error);
          showToast('保存失败: ' + (error.message || error));
        }
      });
    }

    // ===== 初始化 =====
    linksData = parseLinks(originalContent);
    renderAllLinks();
  </script>
</body>
</html>`;
}
