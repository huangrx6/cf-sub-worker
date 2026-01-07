/**
 * 订阅处理模块
 */

import { base64Decode, isValidBase64, clashFix, ADD } from './utils.js';

/**
 * 获取订阅内容
 * @param {string[]} api - 订阅 URL 列表
 * @param {Request} request - 原始请求
 * @param {string} 追加UA - 追加的 UA
 * @param {string} userAgentHeader - 原始 UA
 * @returns {Promise<[string[], string]>} [节点列表, URL列表]
 */
export async function getSUB(api, request, 追加UA, userAgentHeader) {
    if (!api || api.length === 0) return [[], ''];

    const headers = {
        'User-Agent': `${追加UA} cmliu/CF-Workers-SUB ${userAgentHeader}`,
    };

    const results = await Promise.allSettled(
        api.map(url => getUrl(request, url, 追加UA, userAgentHeader))
    );

    const lines = [];
    const validUrls = [];

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled' && result.value) {
            const content = result.value;
            // 尝试 Base64 解码
            if (isValidBase64(content.trim())) {
                try {
                    const decoded = base64Decode(content.trim());
                    lines.push(...decoded.split('\n').filter(l => l.trim()));
                } catch {
                    lines.push(...content.split('\n').filter(l => l.trim()));
                }
            } else {
                lines.push(...content.split('\n').filter(l => l.trim()));
            }
            validUrls.push(api[i]);
        }
    }

    return [lines, validUrls.join('|')];
}

/**
 * 获取远程 URL 内容
 * @param {Request} request - 原始请求
 * @param {string} targetUrl - 目标 URL
 * @param {string} 追加UA - 追加的 UA
 * @param {string} userAgentHeader - 原始 UA
 * @returns {Promise<string|null>}
 */
export async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': `${追加UA} cmliu/CF-Workers-SUB ${userAgentHeader}`,
                'Accept': '*/*',
            },
        });
        if (!response.ok) return null;
        return await response.text();
    } catch (e) {
        console.error(`获取 ${targetUrl} 失败:`, e);
        return null;
    }
}

/**
 * 解析 IP/域名列表
 * @param {string} rawText - 原始文本
 * @returns {string[]} 解析后的列表
 */
export function parseHostList(rawText) {
    if (!rawText) return [];
    const tokens = rawText.split(/[,\s\n]+/).filter(t => t.trim());
    return tokens.map(t => normalizeHostToken(t)).filter(Boolean);
}

/**
 * 规范化 IP/域名
 * @param {string} token - 原始 token
 * @returns {string|null}
 */
function normalizeHostToken(token) {
    const t = String(token || '').trim();
    if (!t) return null;

    // IPv6
    if (t.includes(':')) {
        const ipv6 = t.replace(/^\[|\]$/g, '');
        if (/^[a-fA-F0-9:]+$/.test(ipv6)) return ipv6;
        return null;
    }

    // IPv4 或域名
    if (/^[\d.]+$/.test(t)) {
        const parts = t.split('.');
        if (parts.length === 4 && parts.every(p => {
            const n = parseInt(p, 10);
            return !isNaN(n) && n >= 0 && n <= 255;
        })) {
            return t;
        }
        return null;
    }

    // 域名
    if (/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(t)) {
        return t;
    }

    return null;
}

/**
 * 去重 IP/域名列表
 * @param {string[]} hosts - 原始列表
 * @returns {string[]}
 */
export function uniqueHostList(hosts) {
    const seen = new Set();
    return hosts.filter(h => {
        const key = h.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * 格式化 IP 用于 URL
 * @param {string} host - IP 或域名
 * @returns {string}
 */
export function formatHostForUrl(host) {
    // IPv6 需要方括号
    if (host.includes(':') && !host.startsWith('[')) {
        return `[${host}]`;
    }
    return host;
}

/**
 * 获取优选 IP 列表
 * @param {string} bestIPUrl - 远程 URL
 * @returns {Promise<string[]>}
 */
export async function getBestIPs(bestIPUrl) {
    if (!bestIPUrl) return [];
    try {
        const response = await fetch(bestIPUrl);
        if (!response.ok) return [];
        const text = await response.text();
        return parseHostList(text);
    } catch (e) {
        console.error('获取优选IP失败:', e);
        return [];
    }
}

/**
 * 替换节点中的域名为优选 IP
 * @param {string} proxyUrl - 原始节点
 * @param {string} bestIP - 优选 IP
 * @param {number} ipIndex - IP 索引
 * @returns {string}
 */
export function replaceProxyWithBestIP(proxyUrl, bestIP, ipIndex) {
    const formattedIP = formatHostForUrl(bestIP);

    // 处理不同协议
    if (proxyUrl.startsWith('vmess://')) {
        return replaceVmess(proxyUrl, formattedIP, ipIndex);
    } else if (proxyUrl.startsWith('vless://') || proxyUrl.startsWith('trojan://')) {
        return replaceVlessTrojan(proxyUrl, formattedIP, ipIndex);
    } else if (proxyUrl.startsWith('ss://')) {
        return replaceSS(proxyUrl, formattedIP, ipIndex);
    } else if (proxyUrl.startsWith('ssr://')) {
        return replaceSSR(proxyUrl, formattedIP, ipIndex);
    } else if (proxyUrl.startsWith('hysteria2://') || proxyUrl.startsWith('hy2://')) {
        return replaceHysteria2(proxyUrl, formattedIP, ipIndex);
    }

    return proxyUrl;
}

// VMess 替换
function replaceVmess(proxyUrl, ip, index) {
    try {
        const content = proxyUrl.substring(8);
        const decoded = base64Decode(content);
        const config = JSON.parse(decoded);

        // 保存原始地址到 host
        if (!config.host) config.host = config.add;
        config.add = ip.replace(/^\[|\]$/g, '');

        // 更新名称
        if (config.ps) {
            config.ps = `${config.ps}_${index + 1}`;
        }

        return 'vmess://' + btoa(JSON.stringify(config));
    } catch (e) {
        console.error('替换 VMess 失败:', e);
        return proxyUrl;
    }
}

// VLESS/Trojan 替换
function replaceVlessTrojan(proxyUrl, ip, index) {
    try {
        const url = new URL(proxyUrl);
        const originalHost = url.hostname;

        // 保存原始地址到 host 参数
        if (!url.searchParams.has('host')) {
            url.searchParams.set('host', originalHost);
        }

        // 替换地址
        url.hostname = ip.replace(/^\[|\]$/g, '');

        // 更新名称
        const hash = decodeURIComponent(url.hash.slice(1));
        url.hash = encodeURIComponent(`${hash}_${index + 1}`);

        return url.toString();
    } catch (e) {
        console.error('替换 VLESS/Trojan 失败:', e);
        return proxyUrl;
    }
}

// SS 替换
function replaceSS(proxyUrl, ip, index) {
    try {
        // ss://base64@host:port#name 或 ss://base64#name
        const match = proxyUrl.match(/^ss:\/\/([^@#]+)(@([^:]+):(\d+))?(#(.*))?$/);
        if (!match) return proxyUrl;

        const [, encoded, , host, port, , name] = match;
        const newName = name ? `${decodeURIComponent(name)}_${index + 1}` : `SS_${index + 1}`;

        if (host && port) {
            return `ss://${encoded}@${ip}:${port}#${encodeURIComponent(newName)}`;
        }

        return proxyUrl;
    } catch (e) {
        console.error('替换 SS 失败:', e);
        return proxyUrl;
    }
}

// SSR 替换
function replaceSSR(proxyUrl, ip, index) {
    try {
        const content = proxyUrl.substring(6);
        const decoded = base64Decode(content);
        const parts = decoded.split(':');
        if (parts.length >= 6) {
            parts[0] = ip.replace(/^\[|\]$/g, '');
            return 'ssr://' + btoa(parts.join(':'));
        }
        return proxyUrl;
    } catch (e) {
        console.error('替换 SSR 失败:', e);
        return proxyUrl;
    }
}

// Hysteria2 替换
function replaceHysteria2(proxyUrl, ip, index) {
    try {
        const url = new URL(proxyUrl);
        const originalHost = url.hostname;

        // 保存原始地址到 sni 参数
        if (!url.searchParams.has('sni')) {
            url.searchParams.set('sni', originalHost);
        }

        // 替换地址
        url.hostname = ip.replace(/^\[|\]$/g, '');

        // 更新名称
        const hash = decodeURIComponent(url.hash.slice(1));
        url.hash = encodeURIComponent(`${hash}_${index + 1}`);

        return url.toString();
    } catch (e) {
        console.error('替换 Hysteria2 失败:', e);
        return proxyUrl;
    }
}
