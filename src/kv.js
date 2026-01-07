/**
 * KV 存储操作
 */

import { normalizeSubId, sortSubIds } from './utils.js';

/**
 * 从 KV 获取订阅列表
 * @param {Object} env - 环境对象
 * @returns {Promise<string[]>} 订阅 ID 数组
 */
export async function listSubsFromKV(env) {
    if (!env?.KV) return [];

    const raw = await env.KV.get('SUBS_LIST');
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                const ids = [];
                for (const item of parsed) {
                    const id = normalizeSubId(item);
                    if (id) ids.push(id);
                }
                const unique = [...new Set(ids)];
                return sortSubIds(unique);
            }
        } catch {
            // ignore
        }
    }

    // 回退：扫描所有 key
    const found = new Set();
    let cursor = undefined;
    for (; ;) {
        const res = await env.KV.list({ prefix: 'sub', cursor, limit: 1000 });
        for (const key of res.keys || []) {
            const name = key?.name || '';
            const match = name.match(/^(sub\d+)_(?:CONFIG|LINK\.txt)$/);
            if (match) found.add(match[1]);
        }
        if (res.list_complete) break;
        cursor = res.cursor;
        if (!cursor) break;
    }
    return sortSubIds([...found]);
}

/**
 * 读取订阅元数据
 * @param {Object} env - 环境对象
 * @param {string} id - 订阅 ID 或 'main'
 * @param {string} defaultTitle - 默认标题
 * @returns {Promise<Object|null>}
 */
export async function readSubMetaFromKV(env, id, defaultTitle) {
    if (!env?.KV) return null;

    const isMain = id === 'main';
    const subId = isMain ? null : normalizeSubId(id);
    if (!isMain && !subId) return null;

    const configKey = isMain ? 'MAIN_CONFIG' : `${subId}_CONFIG`;
    const raw = await env.KV.get(configKey);
    let parsed = {};
    if (raw) {
        try {
            parsed = JSON.parse(raw) || {};
        } catch {
            parsed = {};
        }
    }

    const fallbackFileName = isMain ? defaultTitle : `${defaultTitle}-${subId}`;
    return {
        id: isMain ? 'main' : subId,
        displayName: parsed.displayName || parsed.FileName || fallbackFileName,
        FileName: parsed.FileName || fallbackFileName,
    };
}

/**
 * 批量加载订阅元数据
 * @param {Object} env - 环境对象
 * @param {string[]} subs - 订阅 ID 数组
 * @param {Object} options - 选项
 * @returns {Promise<Object[]>}
 */
export async function hydrateSubsMeta(env, subs, { defaultTitle }) {
    const out = [];
    for (const rawId of subs || []) {
        const id = normalizeSubId(rawId);
        if (!id) continue;
        const meta = await readSubMetaFromKV(env, id, defaultTitle);
        if (meta) out.push(meta);
    }
    return out;
}

/**
 * 更新或插入订阅元数据
 * @param {Object} env - 环境对象
 * @param {string} id - 订阅 ID 或 'main'
 * @param {Object} patch - 更新内容
 * @param {string} defaultTitle - 默认标题
 * @returns {Promise<Object>}
 */
export async function upsertSubMetaInKV(env, id, patch, defaultTitle) {
    if (!env?.KV) throw new Error('未绑定KV空间');

    const isMain = id === 'main';
    const subId = isMain ? null : normalizeSubId(id);
    if (!isMain && !subId) throw new Error('SUB ID 无效（仅支持 sub1/sub2/...）');

    const configKey = isMain ? 'MAIN_CONFIG' : `${subId}_CONFIG`;
    const raw = await env.KV.get(configKey);
    let config = {};
    if (raw) {
        try {
            config = JSON.parse(raw) || {};
        } catch {
            config = {};
        }
    }

    const next = { ...config };
    if (typeof patch?.displayName === 'string') next.displayName = patch.displayName.trim();
    if (typeof patch?.FileName === 'string') next.FileName = patch.FileName.trim();

    const fallbackFileName = isMain ? defaultTitle : `${defaultTitle}-${subId}`;
    next.FileName = next.FileName || fallbackFileName;
    next.displayName = next.displayName || next.FileName;

    await env.KV.put(configKey, JSON.stringify(next));

    if (!isMain) {
        const list = await listSubsFromKV(env);
        if (!list.includes(subId)) {
            const updated = sortSubIds(list.concat([subId]));
            await env.KV.put('SUBS_LIST', JSON.stringify(updated));
        }
    }
    return { ok: true };
}

/**
 * 迁移地址列表（兼容旧版本）
 * @param {Object} env - 环境对象
 * @param {string} txt - 目标 key
 */
export async function migrateAddressList(env, txt = 'ADD.txt') {
    if (!env?.KV) return;

    const oldKey = txt.replace('.txt', '').replace('LINK', 'ADD') + '.txt';
    if (oldKey === txt) return;

    const existing = await env.KV.get(txt);
    if (existing) return;

    const oldValue = await env.KV.get(oldKey);
    if (oldValue) {
        await env.KV.put(txt, oldValue);
        await env.KV.delete(oldKey);
        console.log(`迁移 ${oldKey} -> ${txt}`);
    }
}
