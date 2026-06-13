const Room = require("./room");
class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.clientRoom = new Map();
  }
  createRoom(hostId, maxP) {
    const r = new Room(hostId, maxP);
    this.rooms.set(r.id, r);
    return r;
  }
  getRoom(id) { return this.rooms.get(id) || null; }
  findRoomByClient(cid) {
    const rid = this.clientRoom.get(cid);
    return rid ? this.rooms.get(rid) : null;
  }
  joinRoom(rid, cid) {
    const r = this.rooms.get(rid);
    if (!r || r.players.length >= r.maxPlayers || r.status !== "waiting") return false;
    r.addPlayer(cid);
    this.clientRoom.set(cid, rid);
    return true;
  }
  leaveRoom(cid) {
    const r = this.findRoomByClient(cid);
    if (!r) return;
    r.removePlayer(cid);
    r.unregisterWs(cid);
    this.clientRoom.delete(cid);
    if (r.players.length === 0) this.rooms.delete(r.id); else r.broadcast();
  }
  handleDisconnect(cid) { this.leaveRoom(cid); }
  handleAction(cid, act, pay) {
    const r = this.findRoomByClient(cid);
    if (!r || r.status !== "playing") return;
    r.handleAction(cid, act, pay);
  }
  count() { return this.rooms.size; }
}
module.exports = RoomManager;
