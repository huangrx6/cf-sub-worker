/**
 * 全局配置
 * 这些值可以通过环境变量覆盖
 */

// 默认配置值
export const defaultConfig = {
    mytoken: '', // Placeholder: Set via env TOKEN
    guestToken: '', // Placeholder: Set via env GUESTTOKEN
    BotToken: '',
    ChatID: '',
    TG: 0,
    FileName: '订阅优选&聚合',
    SUBUpdateTime: 6, // 小时
    total: 99, // TB
    timestamp: 4102329600000, // 2099-12-31
    MainData: '',
    subConverter: 'SUBAPI.fxxk.dedyn.io',
    subConfig: 'https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini',
    subProtocol: 'https',
};

/**
 * 从环境变量加载配置
 * @param {Object} env - Cloudflare Workers 环境对象
 * @returns {Object} 合并后的配置
 */
export function loadConfig(env) {
    let subConverter = env.SUBAPI || defaultConfig.subConverter;
    let subProtocol = defaultConfig.subProtocol;

    if (subConverter.includes('http://')) {
        subConverter = subConverter.split('//')[1];
        subProtocol = 'http';
    } else {
        subConverter = subConverter.split('//')[1] || subConverter;
    }

    return {
        mytoken: env.TOKEN || defaultConfig.mytoken,
        guestToken: env.GUESTTOKEN || env.GUEST || defaultConfig.guestToken,
        BotToken: env.TGTOKEN || defaultConfig.BotToken,
        ChatID: env.TGID || defaultConfig.ChatID,
        TG: env.TG || defaultConfig.TG,
        FileName: env.SUBNAME || defaultConfig.FileName,
        SUBUpdateTime: env.SUBUPTIME || defaultConfig.SUBUpdateTime,
        total: defaultConfig.total * 1099511627776, // 转换为字节
        timestamp: defaultConfig.timestamp,
        MainData: env.LINK || defaultConfig.MainData,
        subConverter,
        subConfig: env.SUBCONFIG || defaultConfig.subConfig,
        subProtocol,
        urls: [],
    };
}
