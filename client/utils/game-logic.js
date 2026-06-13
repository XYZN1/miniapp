const { RANKS } = require("./constants");
function getNextRank(current) { const idx = RANKS.indexOf(current); return RANKS[(idx + 1) % RANKS.length]; }
function parseCardId(id) { return { suit: id[0], rank: id.slice(1) }; }
function sortCards(cards) { return [...cards].sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank) || a.suit.localeCompare(b.suit)); }
module.exports = { getNextRank, parseCardId, sortCards };
