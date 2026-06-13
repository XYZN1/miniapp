Component({
  properties: {
    nickname: { type: String, value: "" },
    lives: { type: Number, value: 5 },
    cardCount: { type: Number, value: 0 },
    isActive: { type: Boolean, value: false },
    isAlive: { type: Boolean, value: true },
  },
  data: { initial: "", lifeHearts: [] },
  observers: {
    nickname(n) { this.setData({ initial: n ? n[0] : "?" }); },
    lives(n) { this.setData({ lifeHearts: Array.from({ length: n }, () => "❤") }); },
  },
});
