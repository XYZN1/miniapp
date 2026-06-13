var ws = require("../utils/ws");
var app = getApp();

Page({
  data: {
    targetRank: "A", currentPlayerId: "", centralPileCount: 0, roundNumber: 1,
    handCards: [], opponents: [], selectedCards: [], isMyTurn: false,
    gamePhase: "waiting", currentPlayerName: "",
    showResult: false, resultIcon: "", resultTitle: "", resultDesc: "",
    countdownCurrent: 15, countdownRunning: false, countdownUrgent: false,
  },

  onLoad: function() {
    var saved = app.globalData.currentGameState;
    if (saved) {
      app.globalData.currentGameState = null;
      this._processGameState(saved);
    }
  },

  onWsMessage: function(msg) {
    if (msg.type === "GAME_STATE") { this._processGameState(msg); return; }

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

  _timerId: null,

  _startTimer: function() {
    this._stopTimer();
    var that = this;
    that.setData({ countdownCurrent: 15, countdownRunning: true, countdownUrgent: false });
    that._timerId = setInterval(function() {
      var next = that.data.countdownCurrent - 1;
      if (next <= 0) {
        that._stopTimer();
        that.onTimeout();
        return;
      }
      that.setData({ countdownCurrent: Math.max(next, 0), countdownUrgent: next <= 5 });
    }, 1000);
  },

  _stopTimer: function() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    this.setData({ countdownRunning: false, countdownUrgent: false });
  },

  onTimeout: function() {
    this.setData({ countdownRunning: false, countdownUrgent: false });
    wx.vibrateShort({ type: "heavy" });
    this.setData({ countdownCurrent: 0 });
    wx.showToast({ title: "时间到！请操作", icon: "none" });
  },

    _processGameState: function(msg) {
    var p = msg.payload;
    var me = p.players.find(function(pl) { return pl.id === app.globalData.clientId; });
    var opponents = p.players.filter(function(pl) { return pl.id !== app.globalData.clientId; });
    var currentPlayer = p.players.find(function(pl) { return pl.id === p.currentPlayerId; });

    this.setData({
      targetRank: p.targetRank, currentPlayerId: p.currentPlayerId,
      centralPileCount: p.centralPileCount, roundNumber: (p.roundNumber || 0) + 1,
      roundHistory: (p.roundHistory || []).map(function(e) {
        return {
          playerId: e.playerId,
          cardIds: e.cardIds.slice(),
          isMine: e.playerId === app.globalData.clientId
        };
      }),
      handCards: (me ? me.handCards || [] : []).map(function(c) {
        return typeof c === "string" ? { id: c, selected: false } : { id: c.id, suit: c.suit, rank: c.rank, selected: false };
      }),
      myPlayedCards: (function() {
        var myId = app.globalData.clientId;
        var result = [];
        var entries = (p.roundHistory || []).filter(function(e) { return e.playerId === myId; });
        for (var ei = 0; ei < entries.length; ei++) {
          for (var ci = 0; ci < entries[ei].cardIds.length; ci++) {
            result.push({ cardId: entries[ei].cardIds[ci], faceUp: true });
          }
        }
        return result;
      })(),
            opponents: opponents.map(function(o) {
        var myId = app.globalData.clientId;
        // Find cards this opponent played in roundHistory
        var played = (p.roundHistory || []).filter(function(e) { return e.playerId === o.id; });
        var playedCards = [];
        for (var pi = 0; pi < played.length; pi++) {
          for (var ci = 0; ci < played[pi].cardIds.length; ci++) {
            playedCards.push({
              cardId: played[pi].cardIds[ci],
              faceUp: o.id === myId
            });
          }
        }
        o.playedCards = playedCards;
        return o;
      }),
      isMyTurn: p.currentPlayerId === app.globalData.clientId,
      countdownRunning: p.currentPlayerId === app.globalData.clientId && !this.data.showResult,
      gamePhase: this._phase(p),
      currentPlayerName: currentPlayer ? currentPlayer.nickname : "",
      selectedCards: [],
      showResult: false,
    });
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
