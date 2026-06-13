# 骗子酒馆 · Liars' Bar

> 一款基于社交推理与欺骗的多人实时卡牌游戏。
> 玩家通过虚张声势、真假混打，在欢笑与互相质疑中决出最后的赢家。

---

## 目录

- [项目简介](#项目简介)
- [核心玩法](#核心玩法)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [WebSocket 消息协议](#websocket-消息协议)
- [部署指南](#部署指南)
- [开发路线图](#开发路线图)
- [致谢](#致谢)
- [许可证](#许可证)

---

## 项目简介

**骗子酒馆** 是一款将经典社交推理桌游搬上微信小程序的实时多人在线游戏。游戏的核心机制围绕"欺骗与识破"展开——每位玩家轮流打出手牌，可以诚实出牌也可以虚张声势，下家可以选择相信、跟牌或质疑。质疑成功则说谎者受罚，质疑失败则质疑者自担后果。游戏过程充满心理博弈与欢声笑语。

### 设计目标

- **低门槛**：5 分钟上手，15 分钟一局，适合朋友聚会、线上连麦
- **沉浸感**：西部酒馆主题 UI，卡牌动画与音效反馈
- **实时性**：WebSocket 全双工通信，操作反馈 < 500ms
- **社交化**：微信好友邀请、房间分享、局内表情互动

---

## 核心玩法

### 游戏准备

| 项目 | 说明 |
|------|------|
| 人数 | 2-6 人 |
| 牌组 | 标准 52 张扑克牌（去掉大小王），每人随机发 5 张 |
| 生命值 | 每位玩家 3 条命 |
| 目标 | 成为最后存活的玩家 |

### 回合流程

1. **目标点数** 按轮递增：A → 2 → 3 → ... → K → A → ...（循环）
2. **当前玩家** 选择 1-4 张手牌打出（牌面朝下），声称这些牌即是目标点数
    - 可以说真话，也可以说谎
3. **下家** 有以下三种选择：
    - **质疑** — 翻开上家的牌查验。有假则出牌者扣命，全真则质疑者扣命。本回合结束。
    - **跟牌** — 继续打出 1-4 张牌，声明同一目标点数。出牌权传递。
    - **过** — 跳过本回合。若所有其他玩家都过，出牌者获胜，本回合结束。
4. 一轮结束后目标点数 +1，从扣命者（或出牌者）的下家开始新一轮

### 淘汰与胜利

- 生命值归零时淘汰
- 最后存活的一名玩家获胜

---

## 功能特性

### 已实现 ✅

- **房间系统**：创建房间（6 位随机码）、加入房间、准备/取消准备
- **实时对战**：2-6 人 WebSocket 实时同步，支持多端同时在线
- **出牌操作**：选牌-确认出牌流程，支持 1-4 张同时打出
- **质疑/跟牌/过**：下家三种操作，完整的回合逻辑
- **出牌效果**：对手座位旁显示本轮出牌数量标记（红圈数字）
- **自己的已出牌**：手牌区上方展示自己打出的牌（牌面朝上）
- **倒计时**：15 秒操作时限，最后 5 秒红圈闪烁，超时震动提醒
- **回合结果**：质疑成功/失败/全员通过的结果浮层展示
- **操作面板**：底部悬浮面板，根据游戏阶段切换按钮
- **游戏结束**：胜者展示，当局数据统计
- **房间号复制**：一键复制房间号分享好友
- **页面导航**：首页→房间页→游戏页→结算页的完整流程

### 计划中 📋

- **微信分享**：分享房间卡片到好友/群聊
- **微信登录**：自动获取微信头像与昵称
- **发牌动画**：牌从桌面飞到手牌区的视觉效果
- **翻牌动画**：质疑时翻牌 + 高亮判定特效
- **音效系统**：出牌、质疑、扣命等音效
- **战绩统计**：总局数、胜场、胜率
- **局内表情**：快速发送表情或预设消息
- **断线重连**：30 秒内断线恢复对局
- **游戏规则页**：内嵌图文规则说明
- **房主设置**：可调节倒计时时长、最大人数等

---

## 技术栈

### 前端

| 技术 | 用途 | 状态 |
|------|------|------|
| 微信原生小程序（WXML + WXSS + JS） | 跨平台移动端 UI | ✅ 已使用 |
| WebSocket（wx.connectSocket） | 实时通信 | ✅ 已使用 |
| CSS Animation | 卡牌动画、UI 过渡效果 | ✅ 已使用 |
| wx.createAnimation | 复杂动画编排 | 📋 计划 |
| 微信登录 API | 用户信息获取 | 📋 计划 |
| 微信分享 API | 分享卡片到聊天 | 📋 计划 |
| 微信音频 API（InnerAudioContext） | 游戏音效 | 📋 计划 |

### 后端

| 技术 | 用途 | 状态 |
|------|------|------|
| Node.js | 运行时环境 | ✅ 已使用 |
| ws（npm 库） | WebSocket 服务器 | ✅ 已使用 |
| uuid（npm 库） | 客户端 ID 生成 | ✅ 已使用 |
| Socket.IO（可选升级） | 更高级的实时通信（房间、广播、重连） | 📋 计划 |
| Redis | 房间状态持久化、在线玩家管理 | 📋 计划 |
| PM2 | 进程守护与负载均衡 | 📋 计划 |
| Nginx | 反向代理、SSL 终止 | 📋 计划 |
| Docker | 容器化部署 | 📋 计划 |

### 开发工具

| 工具 | 用途 |
|------|------|
| 微信开发者工具 | 小程序开发、调试与预览 |
| Visual Studio Code | 代码编辑 |
| Git | 版本控制 |
| npm / yarn | 包管理 |

---

## 项目结构

```
E:\miniapp\
├── client\                             # 微信小程序前端
│   ├── pages\                          # 页面
│   │   ├── index.js                     # 首页 - 创建/加入房间
│   │   ├── index.wxml & .wxss
│   │   ├── room.js                      # 房间页 - 玩家列表/准备
│   │   ├── game.js                      # 游戏页 - 核心对战
│   │   ├── result.js                    # 结算页 - 胜者展示
│   │   └── rules.js                     # 规则页
│   ├── components\                     # 公共组件
│   │   ├── card\                        # 卡牌（正面/背面）
│   │   ├── player-seat\                # 玩家座位（命数/手牌数）
│   │   ├── countdown\                  # 倒计时器
│   │   └── action-panel\               # 操作面板（出牌/质疑/跟牌/过）
│   ├── utils\                          # 工具函数
│   │   ├── ws.js                        # WebSocket 连接管理器
│   │   ├── constants.js                 # 游戏常量
│   │   └── game-logic.js                # 游戏逻辑工具
│   ├── app.js                           # 小程序入口
│   ├── app.json                         # 全局配置
│   ├── app.wxss                         # 全局样式
│   ├── project.config.json              # 项目配置
│   └── sitemap.json
│
├── server\                             # Node.js 游戏服务端
│   ├── src\
│   │   ├── index.js                     # 入口 - HTTP + WebSocket 服务器
│   │   ├── game\
│   │   │   ├── deck.js                  # 牌组创建、洗牌、发牌
│   │   │   ├── game.js                  # 游戏引擎（状态机）
│   │   │   └── rules.js                 # 规则校验
│   │   ├── room\
│   │   │   ├── room.js                  # 房间对象
│   │   │   └── manager.js               # 房间管理器
│   │   └── ws\
│   │       ├── handler.js               # 消息分发处理器
│   │       └── types.js                 # 消息类型定义
│   ├── package.json
│   ├── start.bat                        # Windows 一键启动
│   └── .gitignore
│
├── requirements.md                      # 需求文档与开发进度
├── README.md                            # 本文件
└── .gitignore
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9
- 微信开发者工具（最新版）
- 微信小程序 AppID

### 服务端启动

```bash
# 进入服务端目录
cd E:\miniapp\server

# 安装依赖
npm install

# 启动服务（开发模式，支持热重载）
npm run dev

# 或直接双击 start.bat
```

服务端默认监听 `ws://0.0.0.0:3000`。

### 客户端启动

1. 打开**微信开发者工具**
2. 导入 `E:\miniapp\client` 目录
3. 修改 `project.config.json` 中的 appid 为你的小程序 AppID
4. **详情 → 本地设置**，勾选「不校验合法域名、web-view、TLS 版本以及 HTTPS 证书」
5. **设置 → 代理设置**，选择「不使用任何代理」
6. 点击编译

### 联网测试

在同一局域网下的设备测试：

1. 服务端启动后，找到电脑的局域网 IP（如 `192.168.1.100`）
2. 修改 `client/pages/index.js` 中的 WebSocket 地址：
   ```javascript
   ws.connect("ws://192.168.1.100:3000");
   ```
3. 手机端用微信扫码预览，即可连上电脑端的服务端

---

## WebSocket 消息协议

### 客户端 → 服务端

| 消息类型 | 说明 | 载荷 |
|----------|------|------|
| `CREATE_ROOM` | 创建房间 | `{ maxPlayers: 6 }` |
| `JOIN_ROOM` | 加入房间 | `{ roomId: "ABC123" }` |
| `LEAVE_ROOM` | 离开房间 | - |
| `PLAYER_READY` | 准备/取消准备 | - |
| `START_GAME` | 开始游戏 | - |
| `PLAY_CARDS` | 出牌 | `{ cardIds: ["SA","H3"] }` |
| `CHALLENGE` | 质疑 | - |
| `FOLLOW` | 跟牌 | `{ cardIds: ["D5"] }` |
| `PASS` | 过 | - |

### 服务端 → 客户端

| 消息类型 | 说明 | 载荷 |
|----------|------|------|
| `CONNECTED` | 连接成功 | `{ clientId: "uuid" }` |
| `ROOM_UPDATE` | 房间状态更新 | `{ roomId, players, hostId, ... }` |
| `GAME_STATE` | 游戏状态 | `{ targetRank, currentPlayerId, handCards, players, roundHistory, ... }` |
| `ROUND_RESULT` | 回合结果 | `{ loserId, reason: "bluff_caught" | "bluff_failed" | "all_passed" }` |
| `GAME_OVER` | 游戏结束 | `{ winnerId, players }` |
| `ERROR` | 错误 | `{ message: "错误描述" }` |

### 数据流示例

```
[客户端 A]  ── CREATE_ROOM ──▶ [服务端]
[客户端 B]  ── JOIN_ROOM ────▶ [服务端]
[服务端]    ── ROOM_UPDATE ──▶ [A, B]
[客户端 A]  ── PLAYER_READY ─▶ [服务端]
[客户端 B]  ── PLAYER_READY ─▶ [服务端]
[客户端 A]  ── START_GAME ───▶ [服务端]
[服务端]    ── GAME_STATE ───▶ [A, B]
[客户端 A]  ── PLAY_CARDS ───▶ [服务端]
[服务端]    ── GAME_STATE ───▶ [A, B]
[客户端 B]  ── CHALLENGE ────▶ [服务端]
[服务端]    ── ROUND_RESULT ─▶ [A, B]
[服务端]    ── GAME_STATE ───▶ [A, B]
...
[服务端]    ── GAME_OVER ────▶ [A, B]
```

---

## 部署指南

### 云服务器部署

```bash
# 1. 上传项目到服务器
scp -r E:\miniapp user@your-server:/opt/

# 2. 安装依赖
cd /opt/miniapp/server
npm install --production

# 3. 使用 PM2 守护进程
npm install -g pm2
pm2 start src/index.js --name liars-bar

# 4. 配置 Nginx 反向代理（可选）
cat > /etc/nginx/sites-available/liars-bar << 'EOF'
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# 5. 设置开机自启
pm2 startup
pm2 save
```

### Docker 部署（计划）



### 微信小程序发布

1. 开发者工具 → 上传
2. 微信公众平台 → 版本管理 → 提交审核
3. 审核通过后发布

> 注意：生产环境需将 WebSocket 地址改为 `wss://your-domain.com`，并在小程序后台配置 Socket 合法域名。

---

## 开发路线图

### v1.0 — MVP（当前阶段）

- [x] 房间系统（创建、加入、准备）
- [x] 核心玩法（出牌、质疑、跟牌、过）
- [x] 游戏页 UI（牌桌、手牌、操作面板）
- [x] 倒计时与超时处理
- [x] 出牌视觉效果
- [ ] 发牌动画
- [ ] 质疑翻牌动画
- [ ] 音效系统
- [ ] 微信分享与邀请

### v1.1 — 体验增强

- [ ] 回合翻牌动画（质疑时高亮判定）
- [ ] 扣命特效（心碎动画）
- [ ] 音效：背景音、出牌、质疑、扣命、胜利
- [ ] 操作倒计时自动跳过（房主可配置时长）
- [ ] 断线重连机制
- [ ] 微信头像与昵称同步

### v1.2 — 社交化

- [ ] 微信好友邀请卡片
- [ ] 局内表情与快捷消息
- [ ] 个人战绩统计（总局数、胜率）
- [ ] 好友列表与快捷加入

### v2.0 — 扩展

- [ ] 牌桌皮肤系统
- [ ] 自定义房间规则
- [ ] 观战模式

---

## 致谢

本项目得以顺利推进，离不开以下优秀工具与平台的大力支持：

### AI 辅助开发

- **[Codex](https://codex.openai.com/)** — 全程参与的 AI 编程伙伴。从项目脚手架搭建、业务逻辑实现到 Bug 定位修复，Codex 在每一个开发环节都提供了高质量的代码生成、问题诊断与架构优化建议，大幅提升了开发效率。
- **[CC Switch](https://cc-switch.dev/)** — 高效的模型路由与切换工具。在开发过程中灵活调配不同 AI 模型的能力，确保在代码生成、逻辑推理与文本处理等不同任务场景下始终使用最合适的模型。
- **[DeepSeek](https://deepseek.com/)** — 强大的推理引擎。在需求分析、规则设计、复杂 Bug 根因分析以及多组件交互逻辑推演中，DeepSeek 展现了出色的深度推理能力，为技术决策提供了可靠依据。

### 开发工具

- **微信开发者工具** — 小程序调试与预览
- **Git** — 版本控制
- **Node.js** & **npm** — JavaScript 运行时与包管理



## 许可证

本项目基于 MIT 许可证开源。

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

> **项目状态**：v0.5 开发中 · 最后更新：2026-06-13
