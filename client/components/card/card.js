Component({
  properties: {
    cardId: { type: String, value: "" },
    faceUp: { type: Boolean, value: false },
  },
  data: { rank: "", suit: "", suitSymbol: "", color: "#333" },
  observers: {
    cardId(id) {
      if (!id) return;
      const suit = id[0], rank = id.slice(1);
      const m = { S: "♠", H: "♥", D: "♦", C: "♣" };
      const c = { S: "#333", H: "#c0392b", D: "#c0392b", C: "#333" };
      this.setData({ rank, suit, suitSymbol: m[suit] || suit, color: c[suit] || "#333" });
    },
  },
});
