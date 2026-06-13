const http = require("http");
const { WebSocketServer } = require("ws");
const { v4: uuidv4 } = require("uuid");
const RoomManager = require("./room/manager");
const WsHandler = require("./ws/handler");
const PORT = process.env.PORT || 3000;
const roomMgr = new RoomManager();
const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", rooms: roomMgr.count() }));
    return;
  }
  res.writeHead(404);
  res.end();
});
const wss = new WebSocketServer({ server });
const wsHandler = new WsHandler(roomMgr);
wss.on("connection", (ws, req) => {
  const cid = uuidv4();
  ws.clientId = cid;
  console.log("[connect]", cid);
  ws.on("message", (raw) => {
    try {
      wsHandler.handle(ws, JSON.parse(raw.toString()));
    } catch (e) {
      ws.send(JSON.stringify({ type: "ERROR", payload: { message: "消息格式错误" } }));
    }
  });
  ws.on("close", () => {
    console.log("[disconnect]", cid);
    roomMgr.handleDisconnect(cid);
  });
  ws.send(JSON.stringify({ type: "CONNECTED", payload: { clientId: cid } }));
});
server.listen(PORT, () => console.log("[server] 骗子酒馆服务端已启动 → ws://localhost:" + PORT));
