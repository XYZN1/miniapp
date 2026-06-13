const SUITS = ["S", "H", "D", "C"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_ORDER = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };

function createDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push({ id: s + r, suit: s, rank: r });
  return deck;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deal(deck, n) {
  const s = shuffle([...deck]);
  const h = Array.from({ length: n }, () => []);
  for (let i = 0; i < s.length; i++) h[i % n].push(s[i]);
  return h;
}

module.exports = { createDeck, shuffle, deal, SUITS, RANKS, RANK_ORDER };
