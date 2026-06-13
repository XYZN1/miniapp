Page({
  data: { winner: "", players: [] },
  onLoad(options) {
    try {
      this.setData({
        winner: options.winner || "未知",
        players: JSON.parse(options.players || "[]"),
      });
    } catch (e) { this.setData({ winner: "未知", players: [] }); }
  },
  onPlayAgain() { wx.redirectTo({ url: "/pages/index/index" }); },
  onBackHome() { wx.redirectTo({ url: "/pages/index/index" }); },
});
