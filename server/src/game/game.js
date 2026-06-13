const { createDeck, deal } = require("./deck");

class Game {
  constructor(pids) {
    this.playerIds = pids;
    this.targetRank = "A";
    this.currentPlayerIndex = 0;
    this.centralPile = [];
    this.roundHistory = [];
    this.passCount = 0;
    this.roundNumber = 0;
    this.claimCount = 0;
  }

  currentPlayerId() { return this.playerIds[this.currentPlayerIndex]; }

  handleAction(cid, act, pay) {
    if (cid !== this.currentPlayerId()) return { type: "ERROR", message: "还没轮到你" };
    switch (act) {
      case "playCards": return this.handlePlayCards(cid, pay);
      case "challenge": return this.handleChallenge(cid);
      case "follow": return this.handleFollow(cid, pay);
      case "pass": return this.handlePass(cid);
      default: return { type: "ERROR", message: "未知操作" };
    }
  }

  handlePlayCards(cid, { cardIds }) {
    if (!cardIds || cardIds.length < 1 || cardIds.length > 4) return { type: "ERROR", message: "每次出牌 1-4 张" };
    this.centralPile.push(...cardIds);
    this.claimCount += 1;
    this.passCount = 0;
    this.advanceTurn();
    return { type: "OK" };
  }

  handleChallenge(cid) {
    if (this.claimCount === 0) return { type: "ERROR", message: "还没有人出牌" };
    const prevIdx = (this.currentPlayerIndex - 1 + this.playerIds.length) % this.playerIds.length;
    const isBluff = this.centralPile.some((cardId) => cardId.replace(/[SHDC]/, "") !== this.targetRank);
    const bid = this.playerIds[prevIdx];
    if (isBluff) return { type: "ROUND_RESULT", loserId: bid, challengerId: cid, reason: "bluff_caught" };
    return { type: "ROUND_RESULT", loserId: cid, blufferId: bid, reason: "bluff_failed" };
  }

  handleFollow(cid, { cardIds }) {
    if (!cardIds || cardIds.length < 1 || cardIds.length > 4) return { type: "ERROR", message: "每次跟牌 1-4 张" };
    this.centralPile.push(...cardIds);
    this.passCount = 0;
    this.advanceTurn();
    return { type: "OK" };
  }

  handlePass(cid) {
    this.passCount += 1;
    if (this.passCount >= this.playerIds.length - 1) {
      const li = this.findLastPlayer();
      return { type: "ROUND_RESULT", winnerId: this.playerIds[li], reason: "all_passed" };
    }
    this.advanceTurn();
    return { type: "OK" };
  }

  findLastPlayer() {
    return (this.currentPlayerIndex - this.passCount + this.playerIds.length) % this.playerIds.length;
  }

  advanceTurn() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerIds.length;
  }

  advanceRound(players) {
    this.roundNumber += 1;
    this.centralPile = [];
    this.roundHistory = [];
    this.passCount = 0;
    this.claimCount = 0;
    const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const idx = order.indexOf(this.targetRank);
    this.targetRank = order[(idx + 1) % order.length];
  }

  toClientState(ps) {
    return {
      targetRank: this.targetRank,
      currentPlayerId: this.currentPlayerId(),
      centralPileCount: this.centralPile.length,
      roundNumber: this.roundNumber,
      players: ps.map((p) => ({
        id: p.id, nickname: p.nickname, lives: p.lives, isAlive: p.isAlive,
        handCardCount: p.handCards ? p.handCards.length : 0,
        handCards: p.handCards || [],
      })),
    };
  }

  static createDeck(n) { return deal(createDeck(), n); }
}

module.exports = Game;
