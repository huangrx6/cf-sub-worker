/**
 * API 处理模块
 */

import { jsonResponse } from './utils.js';
import { listSubsFromKV, readSubMetaFromKV, hydrateSubsMeta, upsertSubMetaInKV } from './kv.js';

/**
 * 处理管理 API 请求
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境对象
 * @param {Object} options - 选项
 * @returns {Promise<Response>}
 */
export async function handleManageApi(request, env, { defaultTitle }) {
    if (!env?.KV) return jsonResponse({ ok: false, error: '未绑定KV空间' }, { status: 400 });

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse({ ok: false, error: '请求体不是有效 JSON' }, { status: 400 });
    }

    const action = String(payload?.action || '');

    if (action === 'list') {
        const subs = await listSubsFromKV(env);
        const main = await readSubMetaFromKV(env, 'main', defaultTitle);
        const meta = await hydrateSubsMeta(env, subs, { defaultTitle });
        return jsonResponse({ ok: true, main, subs: meta });
    }

    if (action === 'saveMeta') {
        try {
            const id = String(payload?.id || '');
            const displayName = typeof payload?.displayName === 'string' ? payload.displayName : '';
            const FileName = typeof payload?.FileName === 'string' ? payload.FileName : '';
            await upsertSubMetaInKV(env, id, { displayName, FileName }, defaultTitle);
            return jsonResponse({ ok: true });
        } catch (e) {
            return jsonResponse({ ok: false, error: e?.message || String(e) }, { status: 400 });
        }
    }

    if (action === 'deleteSub') {
        try {
            const id = String(payload?.id || '');
            if (!id || id === 'main') throw new Error('无法删除此订阅');

            // 删除配置和链接文件
            await env.KV.delete(`${id}_CONFIG`);
            await env.KV.delete(`${id}_LINK.txt`);
            return jsonResponse({ ok: true });
        } catch (e) {
            return jsonResponse({ ok: false, error: e?.message || String(e) }, { status: 400 });
        }
    }

    return jsonResponse({ ok: false, error: '未知 action' }, { status: 400 });
}

/**
 * 发送 Telegram 消息
 * @param {string} BotToken - Bot Token
 * @param {string} ChatID - Chat ID
 * @param {string} type - 消息类型
 * @param {string} ip - IP 地址
 * @param {string} addData - 附加数据
 */
export async function sendTelegramMessage(BotToken, ChatID, type, ip, addData = '') {
    if (!BotToken || !ChatID) return;

    const msg = `${type}\nIP: <tg-spoiler>${ip}</tg-spoiler>\n${addData}`;
    const url = `https://api.telegram.org/bot${BotToken}/sendMessage`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ChatID,
                text: msg,
                parse_mode: 'HTML',
            }),
        });
    } catch (e) {
        console.error('发送 Telegram 消息失败:', e);
    }
}

/**
 * 代理 URL
 * @param {string} proxyURL - 代理目标
 * @param {URL} url - 原始 URL
 * @returns {Promise<Response>}
 */
export async function proxyURL(proxyURL, url) {
    const newUrl = new URL(proxyURL);
    newUrl.pathname = url.pathname;
    newUrl.search = url.search;

    try {
        const response = await fetch(newUrl.toString());
        return new Response(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (e) {
        return new Response('Proxy Error: ' + e.message, { status: 502 });
    }
}
