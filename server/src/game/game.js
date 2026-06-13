const { createDeck, deal } = require("./deck");

class Game {
  constructor(pids) {
    this.playerIds = pids;
    this.targetRank = "A";
    this.currentPlayerIndex = 0;
    this.centralPile = [];    // flat card IDs for pile count
    this.roundHistory = []; // [{playerId, cardIds}] for per-player tracking
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
    this.roundHistory.push({ playerId: cid, cardIds: cardIds.slice() });
    this.claimCount += 1;
    this.passCount = 0;
    this.advanceTurn();
    return { type: "OK" };
  }

  handleChallenge(cid) {
    if (this.claimCount === 0) return { type: "ERROR", message: "还没有人出牌" };
    // Only check the LAST player who played cards
    var lastEntry = this.roundHistory[this.roundHistory.length - 1];
    if (!lastEntry) return { type: "ERROR", message: "没有出牌记录" };
    var lastPlayerId = lastEntry.playerId;
    var isBluff = lastEntry.cardIds.some(function(cardId) {
      return cardId.replace(/[SHDC]/, "") !== this.targetRank;
    }, this);
    if (isBluff) return { type: "ROUND_RESULT", loserId: lastPlayerId, challengerId: cid, reason: "bluff_caught" };
    return { type: "ROUND_RESULT", loserId: cid, blufferId: lastPlayerId, reason: "bluff_failed" };
  }

  handleFollow(cid, { cardIds }) {
    if (!cardIds || cardIds.length < 1 || cardIds.length > 4) return { type: "ERROR", message: "每次跟牌 1-4 张" };
    this.centralPile.push(...cardIds);
    this.roundHistory.push({ playerId: cid, cardIds: cardIds.slice() });
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

  advanceRound(players, nextPlayerId) {
    this.roundNumber += 1;
    this.centralPile = [];
    this.roundHistory = [];
    this.passCount = 0;
    this.claimCount = 0;
    const order = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const idx = order.indexOf(this.targetRank);
    this.targetRank = order[(idx + 1) % order.length];
    if (nextPlayerId) {
      this.currentPlayerIndex = this.playerIds.indexOf(nextPlayerId);
    }
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

  static createDeck(n) {
    var fullDeck = createDeck();
    var shuffled = shuffle(fullDeck);
    var total = Math.min(5 * n, shuffled.length);
    var hands = Array.from({ length: n }, function() { return []; });
    for (var i = 0; i < total; i++) hands[i % n].push(shuffled[i]);
    return hands;
  }
}

module.exports = Game;
