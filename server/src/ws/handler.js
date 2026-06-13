const T = require("./types");

class WsHandler {
  constructor(mgr) { this.mgr = mgr; }

  handle(ws, msg) {
    const { type, payload = {} } = msg;
    switch (type) {
      case T.CREATE_ROOM: return this.hCreateRoom(ws, payload);
      case T.JOIN_ROOM: return this.hJoinRoom(ws, payload);
      case T.LEAVE_ROOM: return this.hLeaveRoom(ws);
      case T.PLAYER_READY: return this.hPlayerReady(ws);
      case T.START_GAME: return this.hStartGame(ws);
      case T.PLAY_CARDS: return this.mgr.handleAction(ws.clientId, "playCards", payload);
      case T.CHALLENGE: return this.mgr.handleAction(ws.clientId, "challenge", {});
      case T.FOLLOW: return this.mgr.handleAction(ws.clientId, "follow", payload);
      case T.PASS: return this.mgr.handleAction(ws.clientId, "pass", {});
      default: ws.send(JSON.stringify({ type: T.ERROR, payload: { message: "未知消息类型" } }));
    }
  }

  hCreateRoom(ws, p) {
    const r = this.mgr.createRoom(ws.clientId, Math.min(p.maxPlayers || 6, 6));
    this.mgr.joinRoom(r.id, ws.clientId);
    r.registerWs(ws.clientId, ws);
    ws.send(JSON.stringify(r.toJSON()));
    r.broadcast();
  }

  hJoinRoom(ws, p) {
    if (!this.mgr.joinRoom(p.roomId, ws.clientId)) {
      ws.send(JSON.stringify({ type: T.ERROR, payload: { message: "房间不存在或已满" } }));
      return;
    }
    const r = this.mgr.getRoom(p.roomId);
    r.registerWs(ws.clientId, ws);
    r.broadcast();
  }

  hLeaveRoom(ws) { this.mgr.leaveRoom(ws.clientId); }
  hPlayerReady(ws) { const r = this.mgr.findRoomByClient(ws.clientId); if (r) { r.toggleReady(ws.clientId); r.broadcast(); } }
  hStartGame(ws) { const r = this.mgr.findRoomByClient(ws.clientId); if (r && r.startGame(ws.clientId)) r.broadcastGameState(); }
}

module.exports = WsHandler;
