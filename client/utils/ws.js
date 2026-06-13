const app = getApp();
function connect(url) {
  const ws = wx.connectSocket({ url, timeout: 5000 });
  app.globalData.ws = ws;
  ws.onOpen(() => console.log("[ws] 已连接"));
  ws.onMessage((res) => {
    try {
      const msg = JSON.parse(res.data);
      const pages = getCurrentPages();
      const page = pages[pages.length - 1];
      if (page && page.onWsMessage) page.onWsMessage(msg);
    } catch (e) { console.error("[ws] 消息解析失败", e); }
  });
  ws.onClose(() => { console.log("[ws] 连接断开"); setTimeout(() => connect(url), 3000); });
  ws.onError((e) => console.error("[ws] 连接错误", e));
}
function send(type, payload) {
  const ws = app.globalData.ws;
  if (ws && ws.readyState === WebSocket.OPEN) ws.send({ data: JSON.stringify({ type, payload: payload || {} }) });
}
module.exports = { connect, send };
