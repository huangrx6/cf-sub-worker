/**
 * CF Workers 订阅聚合与优选工具 - 入口文件
 */

import { loadConfig } from './config.js';
import {
    ADD, htmlResponse, nginx, MD5MD5, clashFix, escapeHtml
} from './utils.js';
import {
    listSubsFromKV, readSubMetaFromKV, hydrateSubsMeta, migrateAddressList
} from './kv.js';
import {
    getSUB, getBestIPs, parseHostList, uniqueHostList, replaceProxyWithBestIP
} from './subscription.js';
import { handleManageApi, sendTelegramMessage, proxyURL } from './api.js';
import { renderHomePage } from './pages/home.js';
import { renderSubPage } from './pages/sub.js';
import { renderManagePage } from './pages/manage.js';
import { renderEditPage } from './pages/edit.js';

export default {
    async fetch(request, env) {
        const userAgentHeader = request.headers.get('User-Agent');
        const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : 'null';
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        const acceptHeader = request.headers.get('Accept') || '';
        const wantsHtml = acceptHeader.includes('text/html') || userAgent.includes('mozilla');

        // 加载配置
        const config = loadConfig(env);

        // 解析路径
        const pathMatch = url.pathname.match(/^\/(sub\d+)(\/|$|\?)/);
        const subName = pathMatch ? pathMatch[1] : null;
        const pathSegments = url.pathname.split('/').filter(Boolean);
        const pathTokenCandidate = subName ? (pathSegments[1] || '') : (pathSegments[0] || '');

        // 多订阅配置
        const envBestIPUrl = env.BESTIPURL || env.BESTIP || '';
        const envCustomHosts = env.CUSTOMHOSTS || env.CUSTOMHOST || '';
        let currentSubConfig = {
            MainData: config.MainData,
            FileName: config.FileName,
            displayName: config.FileName,
            subConfig: config.subConfig,
            bestIPUrl: envBestIPUrl,
            customHosts: envCustomHosts,
        };

        // 从 KV 加载订阅配置
        if (env.KV) {
            const configKey = subName ? `${subName}_CONFIG` : 'MAIN_CONFIG';
            const subConfigData = await env.KV.get(configKey);
            if (subConfigData) {
                try {
                    const parsed = JSON.parse(subConfigData);
                    currentSubConfig.FileName = parsed.FileName || (subName ? `${config.FileName}-${subName}` : config.FileName);
                    currentSubConfig.displayName = parsed.displayName || parsed.FileName || currentSubConfig.FileName;
                    currentSubConfig.subConfig = parsed.subConfig || config.subConfig;
                    if (typeof parsed.bestIPUrl === 'string') currentSubConfig.bestIPUrl = parsed.bestIPUrl;
                    if (typeof parsed.customHosts === 'string') currentSubConfig.customHosts = parsed.customHosts;
                } catch (e) {
                    console.error('解析订阅配置失败:', e);
                }
            }
        }

        // 计算动态 token
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const timeTemp = Math.ceil(currentDate.getTime() / 1000);
        const fakeToken = await MD5MD5(`${config.mytoken}${timeTemp}`);
        const guestToken = config.guestToken || await MD5MD5(config.mytoken);

        const isAdmin = token === config.mytoken || pathTokenCandidate === config.mytoken;

        // ===== 路由处理 =====

        // 首页
        if (request.method === 'GET' && wantsHtml && (url.pathname === '/' || url.pathname === '/index.html')) {
            return htmlResponse(renderHomePage({ title: config.FileName, hasKV: !!env.KV }));
        }

        // 多订阅 SUB 页面
        if (request.method === 'GET' && wantsHtml && subName && (url.pathname === `/${subName}` || url.pathname === `/${subName}/`)) {
            return htmlResponse(renderSubPage({
                subId: subName,
                displayName: currentSubConfig.displayName || currentSubConfig.FileName || `${config.FileName}-${subName}`,
                origin: url.origin,
                hostname: url.hostname,
                guestToken,
            }));
        }

        // 管理页
        if (request.method === 'GET' && wantsHtml && isAdmin && (url.pathname === `/${config.mytoken}` || url.pathname === `/${config.mytoken}/`)) {
            const subs = env.KV ? await listSubsFromKV(env) : [];
            const mainMeta = env.KV ? await readSubMetaFromKV(env, 'main', config.FileName) : {
                id: 'main',
                displayName: config.FileName,
                FileName: config.FileName,
            };
            const subsWithMeta = env.KV ? await hydrateSubsMeta(env, subs, { defaultTitle: config.FileName }) : [];
            return htmlResponse(renderManagePage({
                title: config.FileName,
                origin: url.origin,
                hostname: url.hostname,
                adminPath: `/${config.mytoken}`,
                mainEditPath: `/${config.mytoken}/edit`,
                guestToken,
                main: mainMeta,
                subs: subsWithMeta,
                hasKV: !!env.KV,
            }));
        }

        // /manage 重定向
        if ((url.pathname === '/manage' || url.pathname === '/manage/') && isAdmin) {
            return Response.redirect(`/${config.mytoken}`, 302);
        }

        // 管理 API
        if (request.method === 'POST' && isAdmin &&
            (url.pathname === `/${config.mytoken}` || url.pathname === `/${config.mytoken}/` || url.pathname === '/manage' || url.pathname === '/manage/')) {
            return await handleManageApi(request, env, { defaultTitle: config.FileName });
        }

        // 验证访问权限
        let isValidAccess = false;
        if (subName) {
            const pathToken = url.pathname.split('/').filter(p => p && p !== subName)[0];
            isValidAccess = [config.mytoken, fakeToken, guestToken].includes(token) ||
                [config.mytoken, fakeToken, guestToken].includes(pathToken);
        } else {
            isValidAccess = [config.mytoken, fakeToken, guestToken].includes(token) ||
                pathTokenCandidate === config.mytoken;
        }

        if (!isValidAccess) {
            if (config.TG === 1 && url.pathname !== '/' && url.pathname !== '/favicon.ico') {
                await sendTelegramMessage(
                    config.BotToken, config.ChatID,
                    `#异常访问 ${config.FileName}`,
                    request.headers.get('CF-Connecting-IP'),
                    `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`
                );
            }
            if (env.URL302) return Response.redirect(env.URL302, 302);
            if (env.URL) return await proxyURL(env.URL, url);
            return new Response(nginx(), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            });
        }

        // KV 编辑页面处理
        if (env.KV) {
            const kvKey = subName ? `${subName}_LINK.txt` : 'LINK.txt';
            await migrateAddressList(env, kvKey);

            const isEditEndpoint = !url.search && (
                (subName && pathTokenCandidate === config.mytoken && (pathSegments.length === 2 || pathSegments[2] === 'edit')) ||
                (!subName && pathTokenCandidate === config.mytoken && pathSegments[1] === 'edit')
            );

            if (isEditEndpoint && (request.method === 'GET' && wantsHtml || request.method === 'POST')) {
                await sendTelegramMessage(
                    config.BotToken, config.ChatID,
                    `#编辑订阅 ${currentSubConfig.FileName}`,
                    request.headers.get('CF-Connecting-IP'),
                    `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`
                );
                return await handleKVEdit(request, env, kvKey, guestToken, subName, currentSubConfig, config, url);
            } else {
                currentSubConfig.MainData = await env.KV.get(kvKey) || config.MainData;
            }
        } else {
            currentSubConfig.MainData = env.LINK || config.MainData;
            if (env.LINKSUB) config.urls = await ADD(env.LINKSUB);
        }

        // 订阅生成
        return await generateSubscription(request, env, config, currentSubConfig, url, userAgent, userAgentHeader, fakeToken, subName, guestToken);
    }
};

/**
 * 处理 KV 编辑页面
 */
async function handleKVEdit(request, env, kvKey, guestToken, subName, currentSubConfig, config, url) {
    // POST 请求处理
    if (request.method === 'POST') {
        const contentType = request.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
            // JSON 请求 - 保存配置
            try {
                const payload = await request.json();
                const action = payload.action;

                if (action === 'saveMeta') {
                    const configKey = subName ? `${subName}_CONFIG` : 'MAIN_CONFIG';
                    let existing = {};
                    try {
                        const raw = await env.KV.get(configKey);
                        if (raw) existing = JSON.parse(raw);
                    } catch { }

                    if (payload.displayName) existing.displayName = payload.displayName;
                    if (payload.FileName) existing.FileName = payload.FileName;

                    await env.KV.put(configKey, JSON.stringify(existing));
                    return new Response('名称保存成功', { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
                }

                if (action === 'saveSubConfig') {
                    const configKey = subName ? `${subName}_CONFIG` : 'MAIN_CONFIG';
                    let existing = {};
                    try {
                        const raw = await env.KV.get(configKey);
                        if (raw) existing = JSON.parse(raw);
                    } catch { }

                    if (typeof payload.bestIPUrl === 'string') existing.bestIPUrl = payload.bestIPUrl;
                    if (typeof payload.customHosts === 'string') existing.customHosts = payload.customHosts;

                    await env.KV.put(configKey, JSON.stringify(existing));
                    return new Response('优选配置保存成功', { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
                }

                return new Response('未知操作', { status: 400 });
            } catch (e) {
                return new Response('解析失败: ' + e.message, { status: 400 });
            }
        } else {
            // 纯文本请求 - 保存链接内容
            try {
                const body = await request.text();
                await env.KV.put(kvKey, body);
                return new Response('链接保存成功', { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
            } catch (e) {
                return new Response('保存失败: ' + e.message, { status: 500 });
            }
        }
    }

    // GET 请求 - 渲染编辑页面
    let content = '';
    try {
        content = await env.KV.get(kvKey) || '';
    } catch (e) {
        content = '读取数据失败: ' + e.message;
    }

    const subPathPrefix = subName ? `/${subName}` : '';
    const managePath = `/${config.mytoken}`;
    const publicSubPath = subName ? `/${subName}` : '/';

    const html = renderEditPage({
        content,
        displayFileName: currentSubConfig.FileName,
        displaySubConfig: currentSubConfig.subConfig,
        displayBestIPUrl: currentSubConfig.bestIPUrl || '',
        displayCustomHosts: currentSubConfig.customHosts || '',
        displayDisplayName: currentSubConfig.displayName || currentSubConfig.FileName,
        subName,
        subPathPrefix,
        managePath,
        publicSubPath,
        guest: guestToken,
        mytoken: config.mytoken,
        url,
        subProtocol: config.subProtocol,
        subConverter: config.subConverter,
        hasKV: true,
    });

    return htmlResponse(html);
}

/**
 * 生成订阅内容
 */
async function generateSubscription(request, env, config, currentSubConfig, url, userAgent, userAgentHeader, fakeToken, subName, guestToken) {
    // 汇总所有链接
    let allLinks = await ADD(currentSubConfig.MainData + '\n' + config.urls.join('\n'));
    let selfNodes = '';
    let subUrls = '';

    for (let x of allLinks) {
        if (x.toLowerCase().startsWith('http')) {
            subUrls += x + '\n';
        } else {
            selfNodes += x + '\n';
        }
    }

    currentSubConfig.MainData = selfNodes;
    const urls = await ADD(subUrls);

    await sendTelegramMessage(
        config.BotToken, config.ChatID,
        `#获取订阅 ${currentSubConfig.FileName}`,
        request.headers.get('CF-Connecting-IP'),
        `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`
    );

    // 判断订阅格式
    let format = 'base64';
    if (userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox')) {
        format = 'base64';
    } else if (userAgent.includes('clash') || url.searchParams.has('clash')) {
        format = 'clash';
    } else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
        format = 'singbox';
    } else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
        format = 'surge';
    } else if (userAgent.includes('quantumult%20x') || url.searchParams.has('quanx')) {
        format = 'quanx';
    } else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
        format = 'loon';
    }

    // 获取订阅内容
    let appendUA = 'v2rayn';
    if (url.searchParams.has('clash')) appendUA = 'clash';
    else if (url.searchParams.has('singbox')) appendUA = 'singbox';
    else if (url.searchParams.has('surge')) appendUA = 'surge';
    else if (url.searchParams.has('quanx')) appendUA = 'Quantumult%20X';
    else if (url.searchParams.has('loon')) appendUA = 'Loon';

    const [subContent, subUrlList] = await getSUB(urls, request, appendUA, userAgentHeader);
    let reqData = currentSubConfig.MainData + subContent.join('\n');

    // 生成订阅转换 URL
    const subPathPrefix = subName ? `/${subName}` : '';
    let subConvertUrl = `${url.origin}${subPathPrefix}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
    if (subUrlList) subConvertUrl += '|' + subUrlList;
    if (env.WARP) subConvertUrl += '|' + (await ADD(env.WARP)).join('|');

    // 获取优选 IP
    let bestIPs = [];
    if (currentSubConfig.bestIPUrl) {
        bestIPs = await getBestIPs(currentSubConfig.bestIPUrl);
    }
    if (currentSubConfig.customHosts) {
        const customHosts = parseHostList(currentSubConfig.customHosts);
        if (customHosts.length > 0) {
            bestIPs = uniqueHostList(bestIPs.concat(customHosts));
        }
    }

    // 去重
    const uniqueLines = new Set(reqData.split('\n'));
    let result = [...uniqueLines].join('\n');

    // 优选处理
    if (bestIPs.length > 0) {
        const lines = result.split('\n');
        const expandedLines = [];

        for (let line of lines) {
            if (!line) {
                expandedLines.push(line);
                continue;
            }

            if (line.includes('://') && !line.startsWith('http')) {
                let shouldOptimize = false;
                let cleanLine = line;

                if (/\|true\s*$/.test(line)) {
                    shouldOptimize = true;
                    cleanLine = line.replace(/\|true\s*$/, '');
                } else if (/\|false\s*$/.test(line)) {
                    cleanLine = line.replace(/\|false\s*$/, '');
                }

                if (shouldOptimize) {
                    for (let i = 0; i < bestIPs.length; i++) {
                        expandedLines.push(replaceProxyWithBestIP(cleanLine, bestIPs[i], i));
                    }
                } else {
                    expandedLines.push(cleanLine);
                }
            } else {
                expandedLines.push(line);
            }
        }

        result = expandedLines.join('\n');
    }

    // Base64 编码
    let base64Data;
    try {
        base64Data = btoa(result);
    } catch {
        const binary = new TextEncoder().encode(result);
        let base64 = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        for (let i = 0; i < binary.length; i += 3) {
            const byte1 = binary[i];
            const byte2 = binary[i + 1] || 0;
            const byte3 = binary[i + 2] || 0;
            base64 += chars[byte1 >> 2];
            base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
            base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
            base64 += chars[byte3 & 63];
        }
        const padding = 3 - (binary.length % 3 || 3);
        base64Data = base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
    }

    // 返回 Base64 格式
    if (format === 'base64' || url.searchParams.get('token') === fakeToken) {
        return new Response(base64Data, {
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'Profile-Update-Interval': `${config.SUBUpdateTime}`,
            }
        });
    }

    // 订阅转换
    let subConverterUrl;
    const targetConfig = encodeURIComponent(currentSubConfig.subConfig);
    const targetUrl = encodeURIComponent(subConvertUrl);

    switch (format) {
        case 'clash':
            subConverterUrl = `${config.subProtocol}://${config.subConverter}/sub?target=clash&url=${targetUrl}&insert=false&config=${targetConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
            break;
        case 'singbox':
            subConverterUrl = `${config.subProtocol}://${config.subConverter}/sub?target=singbox&url=${targetUrl}&insert=false&config=${targetConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
            break;
        case 'surge':
            subConverterUrl = `${config.subProtocol}://${config.subConverter}/sub?target=surge&ver=4&url=${targetUrl}&insert=false&config=${targetConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
            break;
        case 'quanx':
            subConverterUrl = `${config.subProtocol}://${config.subConverter}/sub?target=quanx&url=${targetUrl}&insert=false&config=${targetConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
            break;
        case 'loon':
            subConverterUrl = `${config.subProtocol}://${config.subConverter}/sub?target=loon&url=${targetUrl}&insert=false&config=${targetConfig}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
            break;
        default:
            return new Response(base64Data, {
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'Profile-Update-Interval': `${config.SUBUpdateTime}`,
                }
            });
    }

    try {
        const subConverterResponse = await fetch(subConverterUrl);
        if (!subConverterResponse.ok) {
            return new Response(base64Data, {
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'Profile-Update-Interval': `${config.SUBUpdateTime}`,
                }
            });
        }
        let subConverterContent = await subConverterResponse.text();
        if (format === 'clash') subConverterContent = clashFix(subConverterContent);

        return new Response(subConverterContent, {
            headers: {
                'Content-Disposition': `attachment; filename*=utf-8''${encodeURIComponent(currentSubConfig.FileName)}`,
                'content-type': 'text/plain; charset=utf-8',
                'Profile-Update-Interval': `${config.SUBUpdateTime}`,
            },
        });
    } catch {
        return new Response(base64Data, {
            headers: {
                'content-type': 'text/plain; charset=utf-8',
                'Profile-Update-Interval': `${config.SUBUpdateTime}`,
            }
        });
    }
}
