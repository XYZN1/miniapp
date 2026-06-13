var ws = require("../utils/ws");
var app = getApp();
Page({
  data: { roomId: "", maxPlayers: 6, players: [], hostId: "", isReady: false, isHost: false, allReady: false },

  onLoad: function() {
    var saved = app.globalData.currentRoom;
    if (saved) {
      app.globalData.currentRoom = null;
      this._processRoomUpdate(saved);
    }
  },

  _processRoomUpdate: function(msg) {
    var p = msg.payload;
    this.setData({
      roomId: p.roomId, maxPlayers: p.maxPlayers, players: p.players, hostId: p.hostId,
      isHost: p.hostId === app.globalData.clientId,
      isReady: (p.players.find(function(pl) { return pl.id === app.globalData.clientId; }) || {}).isReady || false,
      allReady: p.players.length >= 2 && p.players.every(function(pl) { return pl.isReady; }),
    });
  },

  onWsMessage: function(msg) {
  onWsMessage(msg) {
    if (msg.type === "ROOM_UPDATE") {
      var p = msg.payload;
      this.setData({
        roomId: p.roomId, maxPlayers: p.maxPlayers, players: p.players, hostId: p.hostId,
        isHost: p.hostId === app.globalData.clientId,
        isReady: (p.players.find(function(pl) { return pl.id === app.globalData.clientId; }) || {}).isReady || false,
        allReady: p.players.length >= 2 && p.players.every(function(pl) { return pl.isReady; }),
      });
    }
    if (msg.type === "GAME_STATE") { app.globalData.currentGameState = msg; wx.redirectTo({ url: "/pages/game" }); }
    if (msg.type === "ERROR") wx.showToast({ title: msg.payload.message, icon: "none" });
  },
  onToggleReady() { ws.send("PLAYER_READY"); },
  onStartGame() { ws.send("START_GAME"); },
  onLeaveRoom() { ws.send("LEAVE_ROOM"); wx.navigateBack(); },
  onCopyRoomId() { wx.setClipboardData({ data: this.data.roomId }); wx.showToast({ title: "已复制", icon: "success" }); },
});
