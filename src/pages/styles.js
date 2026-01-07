/**
 * 共享样式模块 - Minimalist & Sophisticated Redesign
 * 关键词：极简、黑白灰、克制、杂志感、空间感
 */

export const baseStyles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  /* Monochrome Palette */
  --bg-body: #fbfbfd;
  --bg-card: #ffffff;
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --text-tertiary: #aeaeb2;
  
  /* Accent */
  --accent-color: #000000;
  --accent-hover: #333333;
  
  /* Borders & Shadows */
  --border-light: #e5e5e5;
  --border-focus: #000000;
  
  /* Visual Effects */
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  
  /* Fixed Card Gradient (Light Blue + Theme Blue at Top Right) */
  --card-gradient: radial-gradient(circle at top right, rgba(59, 130, 246, 0.08) 0%, transparent 40%);
  
  /* Layout */
  --container-width: 900px;
  --radius-card: 20px;
  --radius-input: 10px;
  --radius-btn: 8px;
  
  /* Transition */
  --ease-function: cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-body);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  line-height: 1.5;
  min-height: 100vh;
}

.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 60px 24px;
}

/* Typography */
h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 8px;
}

h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 24px 0;
}

p { color: var(--text-secondary); font-size: 14px; }

/* Cards */
.card {
  background: var(--bg-card);
  background-image: radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-card);
  padding: 32px;
  margin-bottom: 24px;
  transition: all 0.3s var(--ease-function);
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-hover);
  border-color: rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header, .form-group, .sub-links, .config-info, p, h2 { position: relative; z-index: 2; }


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f7;
}

.card-title { font-size: 18px; font-weight: 600; margin: 0; }
.card-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; margin-top: -12px; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: var(--radius-btn);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  text-decoration: none;
  position: relative; z-index: 2;
}

.btn:active { transform: scale(0.98); }

.btn-primary {
  background: var(--accent-color);
  color: white;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
.btn-secondary:hover {
  background: #f5f5f7;
  border-color: #d1d1d6;
}

/* Icon Button - 精致化 */
.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  background: rgba(0,0,0,0.06);
  color: var(--text-primary);
}
.icon-btn:active { transform: scale(0.92); }


/* Forms */
.form-group { margin-bottom: 24px; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-hint { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }

input, textarea, select {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-input);
  border: 1px solid var(--border-light);
  background: #ffffff;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  position: relative; z-index: 2;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 1px var(--border-focus);
}

/* Modal / Dialog - 紧凑型 */
dialog {
  border: none;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 0;
  width: fit-content;
  max-width: 320px; /* 限制最大宽度，比二维码稍大 */
  background: var(--bg-card);
  color: var(--text-primary);
  overflow: visible;
}
dialog::backdrop {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px); /* 毛玻璃背景 */
}
.modal-box {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.modal-close {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 16px;
  z-index: 10;
}
.modal-close:hover { background: #f0f0f0; color: black; }

/* Toast */
.toast {
  position: fixed;
  bottom: 32px; /* 改到底部，更稳重 */
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #000000;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-floating);
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

export const darkThemeStyles = `
@media (prefers-color-scheme: dark) {
  :root {
    --bg-body: #000000;
    --bg-card: #1c1c1e;
    --text-primary: #f5f5f7;
    --text-secondary: #86868b;
    --border-light: #2c2c2e;
    --border-focus: #ffffff;
    --accent-color: #ffffff;
    --accent-hover: #e5e5e7;
  }
  
  .btn-primary { color: black; }
  
  input, textarea, select {
    background: #1c1c1e;
    border-color: #2c2c2e;
    color: white;
  }
}
`;

export const authStyles = ``;

export const dashboardStyles = `
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
.stat-card {
  text-align: left; /* 改为左对齐，更专业 */
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.stat-value {
  font-size: 42px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}
.stat-label { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
`;

export const linkCardStyles = `
/* 链接卡片布局优化 - 分层结构，更加舒展 */
.link-card {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

@media (prefers-color-scheme: dark) {
  .link-card { background: #1c1c1e; }
}

.link-card:hover {
  border-color: var(--text-secondary);
}

/* 顶部：序号 + 名称 + 按钮 */
.link-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.link-card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.link-card-number {
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
  font-size: 12px;
  color: var(--text-secondary);
  background: #f5f5f7;
  padding: 4px 8px;
  border-radius: 4px;
}
@media (prefers-color-scheme: dark) {
  .link-card-number { background: #2c2c2e; }
}

/* 中间：输入框区域 */
.link-card-fields {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.link-field { width: 100%; }
.link-field label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}

.link-input {
  background: #fbfbfd;
  font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace; /* URL 使用等宽字体，更专业 */
  font-size: 13px;
  border-color: transparent; /* 输入框默认无边框，更洁净 */
}
@media (prefers-color-scheme: dark) {
  .link-input { background: #2c2c2e; }
}
.link-input:focus { background: var(--bg-card); border-color: var(--border-focus); }

/* 底部：操作栏 */
.link-options {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

/* 优选开关优化 */
.link-optimize {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f7; /* 给开关加个背景胶囊 */
  padding: 6px 12px;
  border-radius: 99px;
}
@media (prefers-color-scheme: dark) {
  .link-optimize { background: #2c2c2e; }
}

.link-optimize-label { font-size: 12px; color: var(--text-primary); font-weight: 500; }

.switch { position: relative; display: inline-block; width: 36px; height: 20px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #d1d1d6;
  transition: .3s;
  border-radius: 34px;
}
.slider:before {
  position: absolute; content: "";
  height: 16px; width: 16px;
  left: 2px; bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
input:checked + .slider { background-color: #000000; } /* 黑色开关 */
@media (prefers-color-scheme: dark) {
  input:checked + .slider { background-color: #ffffff; }
}
input:checked + .slider:before { transform: translateX(16px); }

/* 图标按钮 */
.icon-btn {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.icon-btn:hover { background: #f5f5f7; color: var(--text-primary); }
.icon-btn.delete:hover { background: #fff1f2; color: #be123c; }
`;

export const subLinkStyles = `
/* 订阅列表：极简方块 */
.sub-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.sub-link-item {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左对齐 */
}

@media (prefers-color-scheme: dark) {
  .sub-link-item { background: #1c1c1e; }
}

.sub-link-item:hover {
  border-color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.sub-link-icon {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  border: 1px solid var(--border-light);
  padding: 4px 8px;
  border-radius: 6px;
  background: #fbfbfd;
}
@media (prefers-color-scheme: dark) {
  .sub-link-icon { background: #2c2c2e; color: white; }
}

.sub-link-label { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.sub-link-url { display: none; } /* 隐藏 URL 显示，保持界面整洁 */

.sub-link-actions {
  margin-top: auto;
  padding-top: 16px;
  width: 100%;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 8px;
}

.sub-link-actions .btn {
  flex: 1;
  font-size: 12px;
  padding: 6px;
  border-radius: 6px;
  background: #fbfbfd;
}
.sub-link-actions .btn:hover { background: #f5f5f7; border-color: #d1d1d6; }
`;

export const qrStyles = `
.qr-container {
  display: none;
  margin-top: 16px;
  padding: 24px;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  justify-content: center;
}
.qr-container.show { display: flex; }
`;
