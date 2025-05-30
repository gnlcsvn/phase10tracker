const KEY = "phase10_v1";

/* ---------- Helper ---------- */
function loadSave() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { version: 1, players: [], history: [] };
  try      { return JSON.parse(raw); }
  catch(e) { console.error("Corrupt save – resetting.", e);
             return { version: 1, players: [], history: [] }; }
}

function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

/* ---------- Public API ---------- */
export function createPlayer(name) {
  const db = loadSave();
  const id = "p" + crypto.randomUUID().slice(0, 8);
  db.players.push({ id, name });
  save(db);
  return id;
}

export function startGame(playerIds) {
  const db = loadSave();
  db.currentGame = {
    id: Date.now().toString(),
    started: new Date().toISOString(),
    scores: playerIds.map(id => ({ playerId: id, phase: 1, points: 0 }))
  };
  save(db);
}

export function updateScore(playerId, patch) {
  const db = loadSave();
  if (!db.currentGame) return;
  const s = db.currentGame.scores.find(x => x.playerId === playerId);
  Object.assign(s, patch);
  save(db);
}

export function finishGame(winnerId) {
  const db = loadSave();
  if (!db.currentGame) return;
  db.currentGame.ended    = new Date().toISOString();
  db.currentGame.winnerId = winnerId;
  db.history.push(db.currentGame);
  delete db.currentGame;
  save(db);
}

export function getStats() {
  const db   = loadSave();
  const wins = {};
  db.history.forEach(g => {
    wins[g.winnerId] = (wins[g.winnerId] || 0) + 1;
  });
  return { players: db.players, wins };
}

export function clearAll() { localStorage.removeItem(KEY); }
