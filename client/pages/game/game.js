const ws = require("../../utils/ws");
const app = getApp();

Page({
  data: {
    targetRank: "A", currentPlayerId: "", centralPileCount: 0, roundNumber: 1,
    handCards: [], opponents: [], selectedCards: [], isMyTurn: false, gamePhase: "play",
  },

  onWsMessage(msg) {
    if (msg.type === "GAME_STATE") {
      const p = msg.payload;
      const me = p.players.find((pl) => pl.id === app.globalData.clientId);
      const opponents = p.players.filter((pl) => pl.id !== app.globalData.clientId);
      this.setData({
        targetRank: p.targetRank, currentPlayerId: p.currentPlayerId,
        centralPileCount: p.centralPileCount, roundNumber: p.roundNumber + 1,
        handCards: (me?.handCards || []).map((c) => (typeof c === "string" ? { id: c, selected: false } : { ...c, selected: false })),
        opponents,
        isMyTurn: p.currentPlayerId === app.globalData.clientId,
        gamePhase: this.determinePhase(p),
        selectedCards: [],
      });
    }
    if (msg.type === "ROUND_RESULT") {
      const r = msg.payload;
      let t = "";
      if (r.reason === "bluff_caught") t = "质疑成功！说谎者被抓住了！";
      else if (r.reason === "bluff_failed") t = "质疑失败！对方说的是真话";
      else if (r.reason === "all_passed") t = "全员通过！";
      wx.showToast({ title: t, icon: "none", duration: 2000 });
    }
    if (msg.type === "GAME_OVER") {
      const p = msg.payload;
      const w = p.players.find((pl) => pl.id === p.winnerId);
      wx.redirectTo({
        url: "/pages/result/result?winner=" + encodeURIComponent(w?.nickname || "") + "&players=" + encodeURIComponent(JSON.stringify(p.players)),
      });
    }
  },

  determinePhase(state) {
    if (state.currentPlayerId !== app.globalData.clientId) return "waiting";
    if (state.centralPileCount === 0) return "play";
    return "challenge";
  },

  onSelectCard(e) {
    if (!this.data.isMyTurn) return;
    const cardId = e.currentTarget.dataset.id;
    const cards = this.data.handCards.map((c) => {
      if (c.id === cardId) c.selected = !c.selected;
      return c;
    });
    const selected = cards.filter((c) => c.selected);
    if (selected.length > 4) { wx.showToast({ title: "最多选 4 张", icon: "none" }); return; }
    this.setData({ handCards: cards, selectedCards: selected.map((c) => c.id) });
  },

  onPlayCards() {
    if (this.data.selectedCards.length < 1) { wx.showToast({ title: "请先选牌", icon: "none" }); return; }
    ws.send("PLAY_CARDS", { cardIds: this.data.selectedCards });
  },
  onChallenge() { ws.send("CHALLENGE"); },
  onFollow() {
    if (this.data.selectedCards.length < 1) { wx.showToast({ title: "请先选牌", icon: "none" }); return; }
    ws.send("FOLLOW", { cardIds: this.data.selectedCards });
  },
  onPass() { ws.send("PASS"); },
});
