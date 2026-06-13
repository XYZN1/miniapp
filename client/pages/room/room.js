const ws = require("../../utils/ws");
const app = getApp();

Page({
  data: { roomId: "", maxPlayers: 6, players: [], hostId: "", isReady: false, isHost: false, allReady: false },
  onWsMessage(msg) {
    if (msg.type === "ROOM_UPDATE") {
      const p = msg.payload;
      const isHost = p.hostId === app.globalData.clientId;
      const me = p.players.find((pl) => pl.id === app.globalData.clientId);
      this.setData({
        roomId: p.roomId, maxPlayers: p.maxPlayers, players: p.players, hostId: p.hostId,
        isHost, isReady: me?.isReady || false,
        allReady: p.players.length >= 2 && p.players.every((pl) => pl.isReady),
      });
    }
    if (msg.type === "GAME_STATE") wx.redirectTo({ url: "/pages/game/game" });
    if (msg.type === "ERROR") wx.showToast({ title: msg.payload.message, icon: "none" });
  },
  onToggleReady() { ws.send("PLAYER_READY"); },
  onStartGame() { ws.send("START_GAME"); },
  onLeaveRoom() { ws.send("LEAVE_ROOM"); wx.navigateBack(); },
});
