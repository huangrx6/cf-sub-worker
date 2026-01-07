/**
 * 通用工具函数
 */

/**
 * 解析逗号/换行分隔的链接列表
 * 注意：不要将 | 作为分隔符，因为 |true 和 |false 是优选标记
 * @param {string} envadd - 原始字符串
 * @returns {string[]} 链接数组
 */
export function ADD(envadd) {
    // 移除了 | 作为分隔符，因为 |true 和 |false 是优选标记
    let addtext = envadd.replace(/[\t"'\r\n]+/g, ',').replace(/,+/g, ',');
    if (addtext.charAt(0) === ',') addtext = addtext.slice(1);
    if (addtext.charAt(addtext.length - 1) === ',') addtext = addtext.slice(0, addtext.length - 1);
    return addtext.split(',');
}

/**
 * 创建 HTML 响应
 * @param {string} html - HTML 内容
 * @param {Object} init - 响应初始化选项
 * @returns {Response}
 */
export function htmlResponse(html, init = {}) {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'text/html; charset=UTF-8');
    headers.set('Cache-Control', 'no-store');
    return new Response(html, { status: init.status || 200, headers });
}

/**
 * 创建 JSON 响应
 * @param {any} data - 数据
 * @param {Object} init - 响应初始化选项
 * @returns {Response}
 */
export function jsonResponse(data, init = {}) {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json; charset=UTF-8');
    headers.set('Cache-Control', 'no-store');
    return new Response(JSON.stringify(data), { status: init.status || 200, headers });
}

/**
 * HTML 转义
 * @param {string} input - 输入字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(input) {
    return String(input || '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[c]));
}

/**
 * JavaScript 单引号字符串转义
 * @param {string} input - 输入字符串
 * @returns {string} 转义后的字符串
 */
export function escapeJsString(input) {
    return String(input || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}

/**
 * 安全的 JSON 字符串化（用于嵌入到 script 标签）
 * @param {any} data - 数据
 * @returns {string} 安全的 JSON 字符串
 */
export function safeJsonStringify(data) {
    return JSON.stringify(data)
        .replace(/<\//g, '<\\/')  // 防止 </script> 注入
        .replace(/\u2028/g, '\\u2028')  // 行分隔符
        .replace(/\u2029/g, '\\u2029'); // 段落分隔符
}

/**
 * 规范化订阅 ID
 * @param {string} value - 输入值
 * @returns {string|null} 规范化后的 ID 或 null
 */
export function normalizeSubId(value) {
    const v = String(value || '').trim();
    if (!/^sub\d+$/.test(v)) return null;
    return v;
}

/**
 * 排序订阅 ID
 * @param {string[]} ids - ID 数组
 * @returns {string[]} 排序后的数组
 */
export function sortSubIds(ids) {
    return (ids || []).slice().sort((a, b) => {
        const na = Number(String(a).slice(3)) || 0;
        const nb = Number(String(b).slice(3)) || 0;
        if (na !== nb) return na - nb;
        return String(a).localeCompare(String(b));
    });
}

/**
 * Base64 解码
 * @param {string} str - Base64 字符串
 * @returns {string} 解码后的字符串
 */
export function base64Decode(str) {
    const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

/**
 * 验证 Base64 字符串
 * @param {string} str - 字符串
 * @returns {boolean}
 */
export function isValidBase64(str) {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str) && str.length % 4 === 0;
}

/**
 * 双重 MD5 哈希
 * @param {string} text - 输入文本
 * @returns {Promise<string>} 哈希结果
 */
export async function MD5MD5(text) {
    const encoder = new TextEncoder();
    const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
    const firstHex = Array.from(new Uint8Array(firstPass))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex));
    return Array.from(new Uint8Array(secondPass))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 修复 Clash 配置
 * @param {string} content - 原始内容
 * @returns {string} 修复后的内容
 */
export function clashFix(content) {
    if (content.includes('proxies:')) {
        const [head, tail] = content.split('proxies:');
        const lines = tail.split('\n');
        const fixedLines = lines.map(line => {
            if (line.includes(', server:')) {
                return line.replace(/, server:/g, ',server:');
            }
            return line;
        });
        return head + 'proxies:' + fixedLines.join('\n');
    }
    return content;
}

/**
 * 生成伪装的 nginx 页面
 * @returns {string} HTML 内容
 */
export function nginx() {
    return `<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working.</p>
<p><em>Thank you for using nginx.</em></p>
</body>
</html>`;
}
