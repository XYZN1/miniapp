const { v4: uuid } = require("uuid");
const Game = require("../game/game");

class Room {
  constructor(hostId, maxP) {
    this.id = uuid().slice(0, 6).toUpperCase();
    this.hostId = hostId;
    this.maxPlayers = maxP;
    this.players = [];
    this.status = "waiting";
    this.game = null;
    this.wsClients = new Map();
  }

  addPlayer(cid) {
    if (this.players.length >= this.maxPlayers) return false;
    this.players.push({ id: cid, nickname: "玩家" + (this.players.length + 1), lives: 5, isReady: false, isAlive: true });
    return true;
  }

  removePlayer(cid) {
    this.players = this.players.filter((p) => p.id !== cid);
    if (this.players.length === 0) return;
    if (this.hostId === cid) this.hostId = this.players[0].id;
  }

  toggleReady(cid) {
    const p = this.players.find((pl) => pl.id === cid);
    if (p) p.isReady = !p.isReady;
  }

  registerWs(cid, ws) { this.wsClients.set(cid, ws); }
  unregisterWs(cid) { this.wsClients.delete(cid); }

  broadcast(data) {
    const m = JSON.stringify(data || this.toJSON());
    for (const [, w] of this.wsClients) w.send(m);
  }

  broadcastGameState() {
    this.broadcast({ type: "GAME_STATE", payload: this.game.toClientState(this.players) });
  }

  canStart(hid) {
    if (hid !== this.hostId) return false;
    if (this.players.length < 2) return false;
    return this.players.every((p) => p.isReady);
  }

  startGame(hid) {
    if (!this.canStart(hid)) return false;
    this.status = "playing";
    const n = this.players.length;
    const deck = Game.createDeck(n);
    for (let i = 0; i < n; i++) this.players[i].handCards = deck[i];
    this.game = new Game(this.players.map((p) => p.id));
    return true;
  }

  handleAction(cid, act, pay) {
    if (!this.game) return;
    const r = this.game.handleAction(cid, act, pay);
    if (r.type === "ROUND_RESULT") {
      const loser = this.players.find((p) => p.id === r.loserId);
      if (loser) {
        loser.lives -= 1;
        if (loser.handCards && loser.handCards.length > 0) loser.handCards.pop();
        if (loser.lives <= 0) loser.isAlive = false;
      }
      const alive = this.players.filter((p) => p.isAlive);
      if (alive.length <= 1) {
        this.status = "finished";
        this.broadcast({ type: "GAME_OVER", payload: { winnerId: alive[0]?.id || null, players: this.players } });
        return;
      }
      this.broadcast({ type: "ROUND_RESULT", payload: r });
      this.game.advanceRound(this.players);
    }
    this.broadcastGameState();
  }

  toJSON() {
    return {
      type: "ROOM_UPDATE",
      payload: {
        roomId: this.id,
        hostId: this.hostId,
        maxPlayers: this.maxPlayers,
        players: this.players.map((p) => ({ ...p, handCards: undefined })),
        status: this.status,
      },
    };
  }
}

module.exports = Room;
