const { RANK_ORDER } = require("./deck");

function validatePlay(cardIds, cards, declaredRank) {
  if (cardIds.length < 1 || cardIds.length > 4) return { valid: false, reason: "每次出牌 1-4 张" };
  return { valid: true };
}

function checkBluff(cardIds, cards, declaredRank) {
  const played = cardIds.map((id) => cards.find((c) => c.id === id));
  return played.some((c) => c.rank !== declaredRank);
}

module.exports = { validatePlay, checkBluff };
