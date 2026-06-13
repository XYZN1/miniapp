var ws = require("../utils/ws");
var app = getApp();

Page({
  data: {
    targetRank: "A", currentPlayerId: "", centralPileCount: 0, roundNumber: 1,
    handCards: [], opponents: [], selectedCards: [], isMyTurn: false,
    gamePhase: "waiting", currentPlayerName: "",
    showResult: false, resultIcon: "", resultTitle: "", resultDesc: "",
  },

  onWsMessage(msg) {
    if (msg.type === "GAME_STATE") {
      var p = msg.payload;
      var me = p.players.find(function(pl) { return pl.id === app.globalData.clientId; });
      var opponents = p.players.filter(function(pl) { return pl.id !== app.globalData.clientId; });
      var currentPlayer = p.players.find(function(pl) { return pl.id === p.currentPlayerId; });

      this.setData({
        targetRank: p.targetRank, currentPlayerId: p.currentPlayerId,
        centralPileCount: p.centralPileCount, roundNumber: (p.roundNumber || 0) + 1,
        handCards: (me ? me.handCards || [] : []).map(function(c) {
          return typeof c === "string" ? { id: c, selected: false } : { id: c.id, suit: c.suit, rank: c.rank, selected: false };
        }),
        opponents: opponents,
        isMyTurn: p.currentPlayerId === app.globalData.clientId,
        gamePhase: this._phase(p),
        currentPlayerName: currentPlayer ? currentPlayer.nickname : "",
        selectedCards: [],
        showResult: false,
      });
    }

    if (msg.type === "ROUND_RESULT") {
      var r = msg.payload;
      var icon = "", title = "", desc = "";
      if (r.reason === "bluff_caught") {
        icon = "\ud83d\udd75"; title = "质疑成功！"; desc = "说谎者被当场抓住，失去一条命！";
      } else if (r.reason === "bluff_failed") {
        icon = "\ud83d\ude35"; title = "质疑失败！"; desc = "对方说的是真话，你失去一条命。";
      } else if (r.reason === "all_passed") {
        icon = "\u2705"; title = "全员通过！"; desc = "没人敢质疑，出牌者成功过关！";
      }
      this.setData({ showResult: true, resultIcon: icon, resultTitle: title, resultDesc: desc });
    }

    if (msg.type === "GAME_OVER") {
      var p = msg.payload;
      var w = p.players.find(function(pl) { return pl.id === p.winnerId; });
      wx.redirectTo({
        url: "/pages/result?winner=" + encodeURIComponent(w ? w.nickname : "") + "&players=" + encodeURIComponent(JSON.stringify(p.players)),
      });
    }
  },

  _phase: function(state) {
    if (state.currentPlayerId !== app.globalData.clientId) return "waiting";
    if (state.centralPileCount === 0) return "play";
    return "challenge";
  },

  onSelectCard: function(e) {
    if (!this.data.isMyTurn) return;
    var cardId = e.currentTarget.dataset.id;
    var cards = this.data.handCards.map(function(c) {
      if (c.id === cardId) c.selected = !c.selected;
      return c;
    });
    var selected = cards.filter(function(c) { return c.selected; });
    if (selected.length > 4) { wx.showToast({ title: "\u6700\u591a\u9009 4 \u5f20", icon: "none" }); return; }
    this.setData({ handCards: cards, selectedCards: selected.map(function(c) { return c.id; }) });
  },

  onPlayCards: function() {
    if (this.data.selectedCards.length < 1) { wx.showToast({ title: "\u8bf7\u5148\u9009\u724c", icon: "none" }); return; }
    ws.send("PLAY_CARDS", { cardIds: this.data.selectedCards });
  },

  onChallenge: function() { ws.send("CHALLENGE"); },

  onFollow: function() {
    if (this.data.selectedCards.length < 1) { wx.showToast({ title: "\u8bf7\u5148\u9009\u724c", icon: "none" }); return; }
    ws.send("FOLLOW", { cardIds: this.data.selectedCards });
  },

  onPass: function() { ws.send("PASS"); },

  onDismissResult: function() { this.setData({ showResult: false }); },
});
