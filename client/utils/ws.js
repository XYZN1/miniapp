var app = getApp();
var pendingQueue = [];

function connect(url) {
  var ws = wx.connectSocket({ url, timeout: 5000 });
  app.globalData.ws = ws;

  ws.onOpen(function() {
    console.log("[ws] 已连接");
    // 发送积压消息
    while (pendingQueue.length) {
      var msg = pendingQueue.shift();
      ws.send({ data: JSON.stringify(msg) });
    }
  });

  ws.onMessage(function(res) {
    try {
      var msg = JSON.parse(res.data);
      var pages = getCurrentPages();
      var page = pages[pages.length - 1];
      if (page && page.onWsMessage) page.onWsMessage(msg);
    } catch (e) { console.error("[ws] 消息解析失败", e); }
  });

  ws.onClose(function() {
    console.log("[ws] 连接断开");
    setTimeout(function() { connect(url); }, 3000);
  });

  ws.onError(function(e) { console.error("[ws] 连接错误", e); });
}

function send(type, payload) {
  var msg = { type: type, payload: payload || {} };
  var ws = app.globalData.ws;
  if (!ws) { pendingQueue.push(msg); return; }
  // SocketTask.readyState: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
  if (ws.readyState === 1) {
    ws.send({ data: JSON.stringify(msg) });
  } else if (ws.readyState === 0) {
    pendingQueue.push(msg);
  }
}

module.exports = { connect, send };
