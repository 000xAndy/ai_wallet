# AI Wallet

基于 AI 对话的加密钱包，通过自然语言即可完成转账、联系人管理等钱包操作。

## 功能

- **钱包管理** — 创建 HD 钱包、导入助记词/私钥、导出私钥
- **AI 对话** — 通过自然语言触发钱包操作（转账、查余额、保存联系人）
- **联系人** — 保存常用地址，AI 可通过名称查找
- **多链支持** — 默认支持 BSC、Ethereum、Polygon
- **本地加密** — 私钥/助记词使用 AES-GCM 加密存储于浏览器 IndexedDB

## 快速开始

```bash
npm install
npm run dev
```

## 使用指南

1. 在**钱包**页面创建或导入钱包
2. 在**设置**页面配置 AI API Key（支持 OpenAI 及兼容接口）
3. 进入 **AI 对话**页面，通过自然语言操作钱包

### 对话示例

```
- 帮我查询钱包余额
- 给 0xABCD... 转 100 USDT，通过 BSC 网络
- 把 0xABCD... 保存为联系人 阿刁
```

## 技术栈

| 层 | 技术 |
|------|----------|
| 框架 | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + Lucide Icons |
| 钱包 | ethers.js v6 + bip39 |
| AI | Vercel AI SDK (`ai` + `@ai-sdk/openai`) |
| 存储 | IndexedDB (idb) |
| 加密 | Web Crypto API (AES-GCM + PBKDF2) |
| 状态 | Zustand |

## 安全

- **私钥从不离开浏览器** — 所有签名在客户端完成
- **静态加密** — 助记词/私钥使用 AES-GCM 加密，密钥由 PBKDF2 派生
- **AI 仅接收工具参数** — 不暴露原始密钥给 AI

## 项目结构

```
src/
├── components/
│   ├── wallet/        # 钱包 UI（仪表盘、创建/导入/导出）
│   ├── chat/          # AI 对话 UI（聊天、消息、确认）
│   ├── contacts/      # 联系人 UI
│   ├── settings/      # 设置（API Key 配置）
│   └── layout/        # 布局（侧边栏）
├── services/          # 核心服务（钱包、RPC、AI、加密）
├── stores/            # Zustand 状态管理
├── db/                # IndexedDB 层
├── types/             # TypeScript 类型
└── lib/               # 常量、工具函数
```

## License

MIT
