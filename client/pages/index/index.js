const ws = require("../../utils/ws");
const app = getApp();

Page({
  data: { roomId: "", roomIdInput: false },

  onLoad() {
    ws.connect("ws://localhost:3000");
  },

  onRoomIdInput(e) {
    const val = e.detail.value.toUpperCase();
    this.setData({ roomId: val, roomIdInput: val.length > 0 });
  },

  onCreateRoom() {
    wx.showLoading({ title: "创建房间中..." });
    ws.send("CREATE_ROOM", { maxPlayers: 6 });
  },

  onJoinRoom() {
    if (!this.data.roomId) {
      wx.showToast({ title: "请输入房间号", icon: "none" });
      return;
    }
    wx.showLoading({ title: "加入房间中..." });
    ws.send("JOIN_ROOM", { roomId: this.data.roomId });
  },

  onGoRules() {
    wx.navigateTo({ url: "/pages/rules/rules" });
  },

  onWsMessage(msg) {
    if (msg.type === "CONNECTED") {
      app.globalData.clientId = msg.payload.clientId;
    }
    if (msg.type === "ROOM_UPDATE") {
      wx.hideLoading();
      app.globalData.roomId = msg.payload.roomId;
      wx.navigateTo({ url: "/pages/room/room" });
    }
    if (msg.type === "ERROR") {
      wx.hideLoading();
      wx.showToast({ title: msg.payload.message, icon: "none" });
    }
  },
});
