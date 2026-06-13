# 🃏 骗子酒馆 — 微信小程序

一款基于社交推理与欺骗的多人卡牌游戏。玩家通过虚张声势、真假混打出牌，在欢笑与互相质疑中决出最后的赢家。

## 项目结构

```
E:\miniapp\
├── client/                    # 微信小程序前端
│   ├── pages/                 # 页面
│   │   ├── index/            # 首页（创建/加入房间）
│   │   ├── room/             # 房间页
│   │   ├── game/             # 游戏页
│   │   ├── result/           # 结算页
│   │   └── rules/            # 规则页
│   ├── components/           # 公共组件
│   │   ├── card/             # 卡牌组件
│   │   ├── player-seat/      # 玩家座位组件
│   │   ├── countdown/        # 倒计时组件
│   │   └── action-panel/     # 操作面板组件
│   ├── utils/                # 工具函数
│   ├── app.js / app.json / app.wxss
│   └── project.config.json
├── server/                    # Node.js 游戏服务端
│   ├── src/
│   │   ├── index.js          # 入口 + WebSocket 服务
│   │   ├── game/             # 游戏核心逻辑（发牌、规则、回合）
│   │   ├── room/             # 房间管理
│   │   └── ws/               # WebSocket 消息处理
│   └── package.json
├── requirements.md            # 需求文档（随进度更新）
└── README.md                  # 本文件
```

## 快速开始

### 服务端

```bash
cd E:\miniapp\server
npm install
npm run dev      # 启动 WebSocket 服务，默认端口 3000
```

### 客户端

1. 打开 **微信开发者工具**
2. 导入 `E:\miniapp\client` 目录
3. 在 `project.config.json` 中填入你的 AppID
4. 点击编译

## 核心玩法

| 行动 | 说明 |
|------|------|
| **出牌** | 选择 1-4 张手牌面朝下打出，声明是当前目标点数（可以说谎） |
| **质疑** | 翻开上家的牌查验真假。说假话则出牌者扣命，说真话则质疑者扣命 |
| **跟牌** | 继续出牌并声明同一目标点数 |
| **过** | 跳过本轮，不操作 |

目标点数按轮递增：A → 2 → 3 → ... → K → A ...

## 技术栈

- **前端**：微信原生小程序（WXML + WXSS + JS）
- **后端**：Node.js + ws（WebSocket）
- **通信**：WebSocket 全双工实时通信

## 开发状态

当前版本：**v0.2** — 项目脚手架搭建完成。
