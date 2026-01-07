# 🌐 CF-Workers-SUB (Enhanced Edition)

> 一个基于 Cloudflare Workers 的高性能订阅聚合与优选工具，拥有极简且精致的现代化 UI。

![Preview](assets/preview.png)
![Edit](assets/edit.png)

## ✨ 特性

- **⚡️ 极速体验**：部署于全球边缘网络，毫秒级响应。
- **🎨 极致 UI**：
  - **玻璃拟态**：全站采用现代化的磨砂玻璃质感。
  - **动态微效**：卡片悬停光晕、细腻的阴影处理。
  - **随机渐变**：每次加载都拥有不同的色彩心情（现已优化为稳重的右下角光晕）。
  - **原生组件**：使用 `<dialog>` 和 SVG 图标，轻量且流畅。
- **🛠 强大功能**：
  - **KV 存储**：支持持久化存储订阅信息，不再丢失。
  - **灵活管理**：可视化管理界面，支持添加、修改、删除订阅。
  - **智能优选**：支持自动优选节点，从此告别卡顿。
  - **二维码生成**：内置二维码生成器，一键扫码。
- **📱 全端适配**：完美适配移动端与桌面端，深色模式自动跟随系统。

## 🚀 快速部署

### 1. 准备工作
- 拥有一个 Cloudflare 账号。
- 安装 [Wrangler CI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)。

### 2. 克隆项目
```bash
git clone https://github.com/your-repo/cf-workers-sub-enhanced.git
cd cf-workers-sub-enhanced
npm install
```

### 3. 配置 KV
在 `wrangler.toml` 中填入你的 KV 命名空间 ID：
```toml
[[kv_namespaces]]
binding = "KV"
id = "你的_KV_ID"
```

### 4. 部署上线
```bash
npx wrangler deploy
```

## ⚙️ 配置变量

你可以在 **Cloudflare Dashboard** -> **Settings** -> **Variables** 中设置，或直接在 `wrangler.toml` 中配置：

| 变量名 | 说明 | 示例 |
|:---|:---|:---|
| `TOKEN` | **必填** 管理员访问密码 | `mysecretpassword` |
| `GUEST` / `GUESTTOKEN` | 访客访问密码 (可选) | `guestpassword` |
| `SUBAPI` | 订阅转换后端地址 | `api.v1. mk` |
| `SUBCONFIG` | 订阅转换配置文件 URL | `https://.../config.ini` |
| `SUBNAME` | 默认订阅文件名 | `MySubscription` |
| `TGTOKEN` | Telegram Bot Token | `123456:ABC-DEF...` |
| `TGID` | Telegram Chat ID | `12345678` |

## 🙏 致谢 & Credits

本项目基于开源社区的优秀作品修改与增强，特别感谢以下项目的作者：

- **Core Functionality**: Powered by [cmliu/CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB)  
  *感谢 cmliu 大佬提供的强大内核逻辑！*
  
- **Original Modification**: Based on [lzxaf/CF-Workers-SUB-Modified](https://github.com/lzxaf/CF-Workers-SUB-Modified)  
  *感谢 lzxaf 提供的基础修改版！*

---
Made with ❤️ by huangrx6
