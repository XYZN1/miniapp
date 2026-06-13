# 骗子酒馆 - 微信小程序

一款基于社交推理与欺骗的多人实时卡牌游戏。玩家通过虚张声势、真假混打，在欢笑与互相质疑中决出最后的赢家。

## 项目结构

```
E:\miniapp\
├── client/              微信小程序前端（WXML + WXSS + JS）
│   ├── pages/           页面：首页、房间、游戏、结算、规则
│   ├── components/      组件：卡牌、座位、倒计时、操作面板
│   └── utils/           工具：WebSocket 连接、常量、游戏逻辑
├── server/              Node.js 游戏服务端
│   ├── src/game/        游戏引擎（发牌、回合、质疑判定）
│   ├── src/room/        房间管理
│   ├── src/ws/          WebSocket 消息处理
│   └── start.bat        一键启动脚本
├── requirements.md      需求文档与开发进度
└── README.md            本文件
```

## 快速开始

### 服务端

```bash
cd E:\miniapp\server
npm install
npm run dev
```

或直接双击 `start.bat`。

### 客户端

1. 打开微信开发者工具
2. 导入 `E:\miniapp\client` 目录
3. 修改 `project.config.json` 中的 appid
4. 勾选「不校验合法域名、web-view、TLS 版本以及 HTTPS 证书」
5. 点击编译

## 游戏规则

见 [requirements.md](requirements.md) 第二章。

## 技术栈

- 前端：微信原生小程序
- 后端：Node.js + ws（WebSocket）
- 通信：全双工 WebSocket

## 致谢

本项目的开发离不开以下优秀的工具与平台的支持：

- **Codex** — 全程协作开发的 AI 编程助手，提供代码生成、调试与架构建议
- **CC Switch** — 高效的模型切换与管理工具，为开发流程提供灵活支撑
- **DeepSeek** — 强大的推理模型，在需求分析、问题诊断与方案优化中发挥了关键作用

感谢以上项目让开发过程更加高效顺畅。

## 许可证

MIT
