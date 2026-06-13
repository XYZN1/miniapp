Component({
  properties: {
    isMyTurn: { type: Boolean, value: false },
    gamePhase: { type: String, value: "play" },
    selectedCards: { type: Array, value: [] },
    currentPlayerName: { type: String, value: "" },
  },
  data: { show: true, canFollow: false, phaseText: "" },
  observers: {
    gamePhase(p) { const m = { play: "选择要出的牌", challenge: "选择行动", waiting: "等待其他玩家" }; this.setData({ phaseText: m[p] || "" }); },
    selectedCards(c) { this.setData({ canFollow: c.length >= 1 && c.length <= 4 }); },
  },
  methods: {
    onPlay() { this.triggerEvent("playcards"); },
    onChallenge() { this.triggerEvent("challenge"); },
    onFollow() { this.triggerEvent("follow"); },
    onPass() { this.triggerEvent("pass"); },
  },
});
