// server.js — Serveur HTTP Statique + Serveur WebSocket Temps Réel (RFC 6455) & Gestionnaire de Rooms SlipGrip
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8090;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Detect primary LAN IPv4 address for QR code & local network joining
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let fallback = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.') || iface.address.startsWith('172.')) {
          return iface.address;
        }
        fallback = iface.address;
      }
    }
  }
  return fallback;
}

// ==================== LOGS ====================
// Short, readable console lines: games started (with players), race results, cup
// winners, and errors (from players' browsers and from the server itself).
const USE_COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const C = USE_COLOR
  ? { dim: '\x1b[2m', bold: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', reset: '\x1b[0m' }
  : { dim: '', bold: '', red: '', green: '', yellow: '', cyan: '', reset: '' };

function timeStamp() {
  return new Date().toTimeString().slice(0, 8);
}

function logLine(icon, text, color = '') {
  console.log(`${C.dim}[${timeStamp()}]${C.reset} ${icon} ${color}${text}${C.reset}`);
}

const SPECIES_NAMES = {
  classique: 'Classique', voltigeuse: 'Voltigeuse', dodue: 'Mastodonte', arpenteuse: 'Arpenteuse', monarque: 'Monarque'
};

function describePlayer(p) {
  const species = SPECIES_NAMES[p.cosmetics && p.cosmetics.bodyType] || 'Classique';
  return `${p.pseudo} (${species})`;
}

function raceLabel(room, raceIndex = room.raceIndex) {
  const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG[DEFAULT_CUP_ID];
  const name = (cup.levelNames && cup.levelNames[raceIndex]) || `course ${raceIndex + 1}`;
  return `course ${raceIndex + 1}/3 « ${name.replace(/^\d+\.\s*/, '')} »`;
}

// Keeps only the useful part of a stack: "fn (file:line:col)", no host / query string
function shortStack(stack, maxFrames = 4) {
  return String(stack || '').split('\n')
    .filter((l) => /\s+at\s|@/.test(l))
    .slice(0, maxFrames)
    .map((l) => l.trim().replace(/https?:\/\/[^/]+\//g, '').replace(/\?v=\d+/g, ''));
}

function logServerError(err, where) {
  console.log(`${C.red}${C.bold}─── 💥 ERREUR SERVEUR ─────────────────────────────${C.reset}`);
  logLine('💥', `${where} → ${err && err.name ? err.name + ': ' : ''}${err && err.message ? err.message : err}`, C.red);
  for (const frame of shortStack(err && err.stack)) console.log(`      ${C.dim}${frame}${C.reset}`);
}

// Client errors: identical reports from the same player are grouped (first one printed
// in full, repeats summarised) so a crash looping at 60 fps doesn't flood the console.
const clientErrorSeen = new Map(); // key -> { count, first, lastPrint }
const CLIENT_ERROR_REPEAT_MS = 30000;

function cleanText(v, max = 300) {
  return String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').slice(0, max);
}

function logClientError(report, client) {
  if (!report || typeof report !== 'object') return;
  const ctx = report.context && typeof report.context === 'object' ? report.context : {};
  const who = client ? `${client.pseudo} (${client.id})` : cleanText(ctx.pseudo || 'joueur inconnu', 40);
  const message = cleanText(report.message, 300);
  const stack = Array.isArray(report.stack) ? report.stack.slice(0, 5).map((l) => cleanText(l, 160)) : [];
  const key = `${client ? client.id : who}|${message}|${stack[0] || ''}`;
  const now = Date.now();
  const seen = clientErrorSeen.get(key);
  if (seen) {
    seen.count += 1 + (Number(report.repeats) || 0);
    if (now - seen.lastPrint < CLIENT_ERROR_REPEAT_MS) return;
    seen.lastPrint = now;
    logLine('🔁', `${who} : même erreur ×${seen.count} depuis ${new Date(seen.first).toTimeString().slice(0, 8)} → ${message}`, C.yellow);
    return;
  }
  clientErrorSeen.set(key, { count: 1, first: now, lastPrint: now });
  if (clientErrorSeen.size > 500) clientErrorSeen.delete(clientErrorSeen.keys().next().value);

  const room = client && client.roomCode ? rooms.get(client.roomCode) : null;
  const where = [
    room ? `room #${room.code}` : (ctx.roomCode ? `room #${cleanText(ctx.roomCode, 8)}` : 'solo'),
    room && room.state === 'racing' ? raceLabel(room) : cleanText(ctx.level, 60),
    ctx.species ? `espèce ${cleanText(ctx.species, 20)}` : ''
  ].filter(Boolean).join(' · ');

  console.log(`${C.red}${C.bold}─── ❌ ERREUR CHEZ UN JOUEUR ───────────────────────${C.reset}`);
  logLine('❌', `${who} · ${where}`, C.red);
  console.log(`      ${C.bold}${cleanText(report.kind, 40) ? `[${cleanText(report.kind, 40)}] ` : ''}${message}${C.reset}`);
  for (const frame of stack) console.log(`      ${C.dim}${frame}${C.reset}`);
  const details = [
    ctx.screen ? `écran=${cleanText(ctx.screen, 12)}` : '',
    ctx.raceTime !== undefined ? `t=${cleanText(ctx.raceTime, 8)}s` : '',
    ctx.head ? `tête=${cleanText(ctx.head, 20)}` : '',
    ctx.grips ? `ventouses ${cleanText(ctx.grips, 20)}` : '',
    ctx.keys ? `touches=${cleanText(ctx.keys, 30)}` : '',
    ctx.fps ? `fps≈${cleanText(ctx.fps, 4)}` : ''
  ].filter(Boolean).join(', ');
  if (details) console.log(`      contexte : ${details}`);
  if (ctx.browser) console.log(`      ${C.dim}navigateur : ${cleanText(ctx.browser, 60)}${C.reset}`);
}

process.on('uncaughtException', (err) => logServerError(err, 'exception non gérée'));
process.on('unhandledRejection', (err) => logServerError(err, 'promesse rejetée'));

// ==================== CUPS & DEFAULT ROOM SETTINGS ====================
const CUPS_CATALOG = {
  coupe_potager: {
    id: 'coupe_potager',
    name: 'Coupe du Potager',
    icon: '🥬',
    levels: [0, 1, 2],
    levelNames: ['1. Les rangs de laitues', '2. La tonnelle aux tomates', '3. Le carré de fraises']
  },
  coupe_sousbois: {
    id: 'coupe_sousbois',
    name: 'Coupe du Sous-Bois',
    icon: '🌳',
    levels: [3, 4, 5],
    levelNames: ['1. Les racines mêlées', '2. Le pont des branches', '3. La clairière aux champignons']
  },
  coupe_ruche: {
    id: 'coupe_ruche',
    name: 'Coupe de la Ruche',
    icon: '🍯',
    levels: [6, 7, 8],
    levelNames: ['1. Les alvéoles', '2. Le plafond de miel', '3. La coulée de cire']
  },
  coupe_rosee: {
    id: 'coupe_rosee',
    name: 'Coupe de la Rosée',
    icon: '🌙',
    levels: [9, 10, 11],
    levelNames: ['1. Les galets mouillés', '2. Le champ de trèfles', '3. Les grands rebonds']
  }
};
const DEFAULT_CUP_ID = 'coupe_potager';

// Host-editable settings, for one room only. Same bounds as ROOM_SETTINGS in
// js/gameplayConfig.js: modest tweaks, not another game.
const ROOM_SETTING_BOUNDS = {
  jumpBoost: { min: 0.85, max: 1.2, default: 1.0 },
  gravity: { min: 660, max: 820, default: 740 },
  gripDistance: { min: 20, max: 30, default: 24 },
  pvpDamageMult: { min: 0.5, max: 1.5, default: 1.0 },
  playerContact: { toggle: true, default: false },
  autoFlip: { toggle: true, default: false }
};

function createDefaultRoomConfig() {
  // No player limit by default (maxPlayers null); a host could still set one
  const config = { cupId: null, maxPlayers: null };
  for (const [key, b] of Object.entries(ROOM_SETTING_BOUNDS)) config[key] = b.default;
  return config;
}

// ==================== ROOMS & CLIENTS STATE ====================
const clients = new Map(); // socketId -> { id, socket, pseudo, cosmetics, roomCode }
const rooms = new Map();   // code (4 digits) -> Room object

function generateRoomCode() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    if (!rooms.has(code)) return code;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

function getPublicRoomList() {
  const list = [];
  for (const room of rooms.values()) {
    const host = room.players.get(room.hostId);
    const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG[DEFAULT_CUP_ID];
    list.push({
      code: room.code,
      hostName: host ? host.pseudo : 'Hôte',
      cupId: cup.id,
      cupName: cup.name,
      cupIcon: cup.icon,
      playerCount: room.players.size,
      maxPlayers: room.config.maxPlayers || null,
      state: room.state,
      raceIndex: room.raceIndex
    });
  }
  return list;
}

function serializeRoom(room) {
  const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG[DEFAULT_CUP_ID];
  const playersArr = [];
  for (const p of room.players.values()) {
    playersArr.push({
      id: p.id,
      pseudo: p.pseudo,
      isHost: p.id === room.hostId,
      ready: p.ready,
      cosmetics: p.cosmetics,
      score: p.score || 0,
      totalTime: p.totalTime || 0,
      modifiers: p.modifiers || [],
      extraAppleSegments: p.extraAppleSegments || 0,
      draftChoice: p.draftChoice || null,
      draftOptions: p.draftOptions || [],
      lastRank: p.lastRank || null,
      finishTime: p.finishTime || null,
      progress: p.progress || 0,
      connected: p.connected !== false
    });
  }
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    config: room.config,
    cup,
    raceIndex: room.raceIndex,
    players: playersArr
  };
}

// ==================== HTTP SERVER ====================
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/api/client-error' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) req.destroy();
    });
    req.on('end', () => {
      try {
        logClientError(JSON.parse(body), null);
      } catch (err) {
        // Ignore malformed reports
      }
      res.writeHead(204);
      res.end();
    });
    return;
  }

  if (urlPath === '/api/server-info') {
    const ip = getLocalIpAddress();
    const payload = JSON.stringify({
      ip,
      port: PORT,
      url: `http://${ip}:${PORT}`,
      rooms: getPublicRoomList()
    });
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(payload);
    return;
  }

  const relPath = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const filePath = path.join(ROOT, path.normalize(relPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

// ==================== NATIVE RFC 6455 WEBSOCKET IMPLEMENTATION ====================
function encodeWsFrame(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text frame
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function sendWs(client, type, data = {}) {
  if (!client || !client.socket || client.socket.destroyed || !client.socket.writable) return;
  try {
    const frame = encodeWsFrame(JSON.stringify({ type, ...data }));
    client.socket.write(frame);
  } catch (err) {
    // Ignore write error on closing socket
  }
}

function broadcastRoom(room, type, data = {}, excludeId = null) {
  if (!room) return;
  const frame = encodeWsFrame(JSON.stringify({ type, ...data }));
  for (const p of room.players.values()) {
    if (excludeId && p.id === excludeId) continue;
    const c = clients.get(p.id);
    if (c && c.socket && !c.socket.destroyed && c.socket.writable) {
      try {
        c.socket.write(frame);
      } catch (err) {
        // Ignore
      }
    }
  }
}

function broadcastLobbyList() {
  const list = getPublicRoomList();
  const frame = encodeWsFrame(JSON.stringify({ type: 'rooms_list', rooms: list }));
  for (const c of clients.values()) {
    if (!c.roomCode && c.socket && !c.socket.destroyed && c.socket.writable) {
      try {
        c.socket.write(frame);
      } catch (err) {
        // Ignore
      }
    }
  }
}

const ALL_MODIFIER_IDS = [
  'colosse',
  'micro_turbo',
  'sauteuse',
  'longue',
  'lune',
  'super_forte'
];

function pickDraftOptions(count = 3) {
  const pool = [...ALL_MODIFIER_IDS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function startRoomDraftTimer(room) {
  if (!room) return;
  if (room.draftTimerHandle) clearTimeout(room.draftTimerHandle);
  if (room.autoLaunchTimerHandle) clearTimeout(room.autoLaunchTimerHandle);

  room.draftStartedAt = Date.now();
  room.draftDurationSec = 15;

  room.draftTimerHandle = setTimeout(() => {
    room.draftTimerHandle = null;
    if (room.state !== 'draft') return;

    // Auto-pick random modifier for any unchosen non-winner (or solo player)
    for (const pl of room.players.values()) {
      const eligible = (pl.lastRank > 1) || (room.players.size === 1);
      if (eligible && !pl.draftChoice) {
        const pool = (pl.draftOptions && pl.draftOptions.length > 0) ? pl.draftOptions : ALL_MODIFIER_IDS;
        const autoMod = pool[Math.floor(Math.random() * pool.length)];
        pl.draftChoice = autoMod;
        pl.modifiers = pl.modifiers || [];
        pl.modifiers.push(autoMod);

        broadcastRoom(room, 'modifier_selected', {
          playerId: pl.id,
          pseudo: pl.pseudo,
          modifierId: autoMod,
          modifiers: pl.modifiers,
          autoPicked: true,
          room: serializeRoom(room)
        });
      }
    }

    broadcastRoom(room, 'draft_all_ready', { room: serializeRoom(room), autoPicked: true });

    room.autoLaunchTimerHandle = setTimeout(() => {
      room.autoLaunchTimerHandle = null;
      if (room.state === 'draft') {
        const nextIdx = (room.raceIndex || 0) + 1;
        if (nextIdx < 3) {
          launchRoomRace(room, nextIdx);
        }
      }
    }, 1200);
  }, 15000);
}

// Conclude current race and transition to Draft (after race 1 or 2) or Podium (after race 3)
function concludeRoomRace(room) {
  if (!room || room.state !== 'racing') return;
  if (room.raceTimerHandle) {
    clearTimeout(room.raceTimerHandle);
    room.raceTimerHandle = null;
  }

  const playersArr = Array.from(room.players.values());
  // Sort players: finished players ordered by finishOrder, then unfinished ordered by progress desc
  playersArr.sort((a, b) => {
    if (a.finished && b.finished) return (a.finishOrder || 99) - (b.finishOrder || 99);
    if (a.finished && !b.finished) return -1;
    if (!a.finished && b.finished) return 1;
    return (b.progress || 0) - (a.progress || 0);
  });

  const pointsTable = [10, 6, 4, 3, 2, 1];
  const raceStandings = [];

  playersArr.forEach((p, idx) => {
    const rank = idx + 1;
    const pts = pointsTable[idx] !== undefined ? pointsTable[idx] : 1;
    p.lastRank = rank;
    p.lastPoints = pts;
    p.score = (p.score || 0) + pts;
    p.totalTime = (p.totalTime || 0) + (p.finishTime || 120);

    // Players who did NOT finish 1st get 3 random modifier cards (or solo player in 1-player test room)
    const eligibleForModifier = (rank > 1) || (playersArr.length === 1);
    if (eligibleForModifier && room.raceIndex < 2) {
      p.draftOptions = pickDraftOptions(3);
      p.draftChoice = null;
    } else {
      p.draftOptions = [];
      p.draftChoice = null;
    }

    raceStandings.push({
      id: p.id,
      pseudo: p.pseudo,
      cosmetics: p.cosmetics,
      rank,
      pointsEarned: pts,
      totalScore: p.score,
      finishTime: p.finishTime,
      finished: !!p.finished,
      progress: p.progress || 0,
      modifiers: p.modifiers || [],
      draftOptions: p.draftOptions
    });
  });

  const resultLine = raceStandings.map((r) => r.finished
    ? `${r.rank}. ${r.pseudo} ${Number(r.finishTime || 0).toFixed(1)}s`
    : `${r.rank}. ${r.pseudo} (non arrivé, ${Math.round((r.progress || 0) * 100)}%)`).join(' · ');
  logLine('🥇', `room #${room.code} · fin ${raceLabel(room)} → ${resultLine}`, C.green);

  if (room.raceIndex < 2) {
    // Races 1 & 2 -> Inter-race Standings & Modifier Draft!
    room.state = 'draft';
    broadcastRoom(room, 'cup_draft_start', {
      raceIndex: room.raceIndex,
      standings: raceStandings,
      draftDuration: 15,
      room: serializeRoom(room)
    });
    startRoomDraftTimer(room);
    broadcastLobbyList();
  } else {
    // Race 3 finished -> Final Cup Podium & Cosmetic Gift for the Champion!
    room.state = 'podium';
    const overallStandings = [...playersArr].sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return (a.totalTime || 0) - (b.totalTime || 0);
    });
    const champion = overallStandings[0];
    if (champion) {
      const table = overallStandings.map((p) => `${p.pseudo} ${p.score || 0} pts`).join(', ');
      console.log(`${C.green}${C.bold}─── 👑 VAINQUEUR DE LA COUPE ──────────────────────${C.reset}`);
      logLine('👑', `room #${room.code} · ${champion.pseudo} gagne avec ${champion.score || 0} pts · classement : ${table}`, C.green);
    }

    broadcastRoom(room, 'cup_podium_start', {
      raceIndex: room.raceIndex,
      raceStandings,
      overallStandings: overallStandings.map((p, i) => ({
        id: p.id,
        pseudo: p.pseudo,
        cosmetics: p.cosmetics,
        overallRank: i + 1,
        totalScore: p.score || 0,
        totalTime: p.totalTime || 0,
        modifiers: p.modifiers || []
      })),
      championId: champion ? champion.id : null,
      championPseudo: champion ? champion.pseudo : 'Champion',
      room: serializeRoom(room)
    });
    broadcastLobbyList();
  }
}

function launchRoomRace(room, raceIndex) {
  if (!room) return;
  if (room.raceTimerHandle) {
    clearTimeout(room.raceTimerHandle);
    room.raceTimerHandle = null;
  }
  if (room.draftTimerHandle) {
    clearTimeout(room.draftTimerHandle);
    room.draftTimerHandle = null;
  }
  if (room.autoLaunchTimerHandle) {
    clearTimeout(room.autoLaunchTimerHandle);
    room.autoLaunchTimerHandle = null;
  }

  const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG[DEFAULT_CUP_ID];
  room.raceIndex = raceIndex;
  room.state = 'racing';
  room.finishCounter = 0;
  room.firstFinishHandled = false;

  for (const p of room.players.values()) {
    p.finished = false;
    p.finishTime = null;
    p.finishOrder = null;
    p.progress = 0;
    p.draftChoice = null;
    p.draftOptions = [];
  }

  const levelId = cup.levels[raceIndex % cup.levels.length];
  if (raceIndex === 0) {
    const names = Array.from(room.players.values()).map(describePlayer).join(', ');
    console.log(`${C.cyan}${C.bold}─── 🏆 COUPE LANCÉE ───────────────────────────────${C.reset}`);
    logLine('🏆', `room #${room.code} · ${cup.icon} ${cup.name} · ${room.players.size} joueur${room.players.size > 1 ? 's' : ''} : ${names}`, C.cyan);
  }
  logLine('🏁', `room #${room.code} · départ ${raceLabel(room, raceIndex)}`);
  broadcastRoom(room, 'cup_race_start', {
    raceIndex,
    totalRaces: 3,
    levelId,
    cup,
    config: room.config,
    room: serializeRoom(room)
  });
  broadcastLobbyList();
}

function removeClientFromRoom(client) {
  if (!client || !client.roomCode) return;
  const code = client.roomCode;
  client.roomCode = null;
  const room = rooms.get(code);
  if (!room) return;

  room.players.delete(client.id);
  if (room.state === 'racing' || room.state === 'draft') {
    logLine('🚪', `room #${room.code} · ${client.pseudo} a quitté la coupe (${raceLabel(room)})`, C.yellow);
  }
  if (room.players.size === 0) {
    if (room.state !== 'lobby' && room.state !== 'podium') logLine('⚠️', `room #${room.code} fermée : tous les joueurs sont partis pendant la coupe`, C.yellow);
    if (room.raceTimerHandle) clearTimeout(room.raceTimerHandle);
    if (room.draftTimerHandle) clearTimeout(room.draftTimerHandle);
    if (room.autoLaunchTimerHandle) clearTimeout(room.autoLaunchTimerHandle);
    rooms.delete(code);
  } else {
    if (room.hostId === client.id) {
      const nextHost = room.players.keys().next().value;
      room.hostId = nextHost;
    }
    // If room is in draft, check if remaining players have all chosen
    if (room.state === 'draft' && !room.autoLaunchTimerHandle) {
      let allChosen = true;
      for (const pl of room.players.values()) {
        const eligible = (pl.lastRank > 1) || (room.players.size === 1);
        if (eligible && !pl.draftChoice) {
          allChosen = false;
          break;
        }
      }
      if (allChosen) {
        if (room.draftTimerHandle) {
          clearTimeout(room.draftTimerHandle);
          room.draftTimerHandle = null;
        }
        broadcastRoom(room, 'draft_all_ready', { room: serializeRoom(room) });
        room.autoLaunchTimerHandle = setTimeout(() => {
          room.autoLaunchTimerHandle = null;
          if (room.state === 'draft') {
            const nextIdx = (room.raceIndex || 0) + 1;
            if (nextIdx < 3) launchRoomRace(room, nextIdx);
          }
        }, 1200);
      }
    }
    broadcastRoom(room, 'room_state', { room: serializeRoom(room) });
  }
  broadcastLobbyList();
}

// How long a disconnected player keeps their room slot, waiting for a reconnect
const RECONNECT_GRACE_MS = 30000;

function findResumableClient(token) {
  for (const c of clients.values()) {
    if (c.resumeToken === token && c.dropTimer) return c;
  }
  return null;
}

// Returns a client record when the socket must from now on be bound to another
// (already known) client, i.e. after a successful session resume.
function handleWsMessage(client, msg) {
  if (!msg || typeof msg.type !== 'string') return;

  switch (msg.type) {
    case 'hello': {
      // Session resume after a network drop: hand the new socket over to the
      // previous client record so the player keeps its id and its room slot.
      const previous = typeof msg.resumeToken === 'string' ? findResumableClient(msg.resumeToken) : null;
      if (previous && previous !== client) {
        clearTimeout(previous.dropTimer);
        previous.dropTimer = null;
        previous.socket = client.socket;
        clients.delete(client.id);
        const room = previous.roomCode ? rooms.get(previous.roomCode) : null;
        const p = room && room.players.get(previous.id);
        if (p) p.connected = true;
        sendWs(previous, 'welcome', {
          playerId: previous.id,
          resumeToken: previous.resumeToken,
          resumed: !!p,
          room: p ? serializeRoom(room) : null,
          serverIp: getLocalIpAddress(),
          serverPort: PORT,
          rooms: getPublicRoomList()
        });
        if (p) broadcastRoom(room, 'room_state', { room: serializeRoom(room) }, previous.id);
        return previous;
      }
      if (msg.pseudo) client.pseudo = String(msg.pseudo).slice(0, 18);
      if (msg.cosmetics) client.cosmetics = msg.cosmetics;
      sendWs(client, 'welcome', {
        playerId: client.id,
        resumeToken: client.resumeToken,
        resumed: false,
        serverIp: getLocalIpAddress(),
        serverPort: PORT,
        rooms: getPublicRoomList()
      });
      break;
    }

    case 'client_error': {
      logClientError(msg.report, client);
      break;
    }

    case 'list_rooms': {
      sendWs(client, 'rooms_list', { rooms: getPublicRoomList() });
      break;
    }

    case 'create_room': {
      removeClientFromRoom(client);
      if (msg.pseudo) client.pseudo = String(msg.pseudo).slice(0, 18);
      if (msg.cosmetics) client.cosmetics = msg.cosmetics;

      const code = generateRoomCode();
      const room = {
        code,
        hostId: client.id,
        state: 'lobby',
        raceIndex: 0,
        finishCounter: 0,
        firstFinishHandled: false,
        raceTimerHandle: null,
        config: createDefaultRoomConfig(),
        players: new Map()
      };

      room.players.set(client.id, {
        id: client.id,
        pseudo: client.pseudo,
        cosmetics: client.cosmetics,
        ready: true,
        score: 0,
        totalTime: 0,
        modifiers: [],
        extraAppleSegments: 0,
        progress: 0
      });

      rooms.set(code, room);
      client.roomCode = code;

      sendWs(client, 'room_joined', { room: serializeRoom(room), playerId: client.id });
      broadcastLobbyList();
      break;
    }

    case 'join_room': {
      const code = String(msg.code || '').trim();
      const room = rooms.get(code);
      if (!room) {
        sendWs(client, 'room_error', { message: `Aucune room trouvée avec le code #${code}.` });
        return;
      }
      if (room.config.maxPlayers && room.players.size >= room.config.maxPlayers && !room.players.has(client.id)) {
        sendWs(client, 'room_error', { message: `La room #${code} est complète (${room.players.size}/${room.config.maxPlayers}).` });
        return;
      }

      if (client.roomCode && client.roomCode !== code) {
        removeClientFromRoom(client);
      }

      if (msg.pseudo) client.pseudo = String(msg.pseudo).slice(0, 18);
      if (msg.cosmetics) client.cosmetics = msg.cosmetics;

      room.players.set(client.id, {
        id: client.id,
        pseudo: client.pseudo,
        cosmetics: client.cosmetics,
        ready: true,
        score: 0,
        totalTime: 0,
        modifiers: [],
        extraAppleSegments: 0,
        progress: 0
      });
      client.roomCode = code;

      sendWs(client, 'room_joined', { room: serializeRoom(room), playerId: client.id });
      broadcastRoom(room, 'room_state', { room: serializeRoom(room) }, client.id);
      broadcastLobbyList();
      break;
    }

    case 'leave_room': {
      removeClientFromRoom(client);
      sendWs(client, 'left_room', { rooms: getPublicRoomList() });
      break;
    }

    case 'update_profile': {
      if (msg.pseudo) client.pseudo = String(msg.pseudo).trim().slice(0, 18) || 'Chenille';
      if (msg.cosmetics) client.cosmetics = { ...client.cosmetics, ...msg.cosmetics };

      if (client.roomCode) {
        const room = rooms.get(client.roomCode);
        if (room && room.players.has(client.id)) {
          const p = room.players.get(client.id);
          p.pseudo = client.pseudo;
          p.cosmetics = client.cosmetics;
          if (msg.ready !== undefined) p.ready = !!msg.ready;
          broadcastRoom(room, 'room_state', { room: serializeRoom(room) });
          broadcastLobbyList();
        }
      }
      break;
    }

    case 'update_room_config': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.hostId !== client.id) return;

      if (msg.config && typeof msg.config === 'object') {
        if (msg.config.cupId && CUPS_CATALOG[msg.config.cupId]) {
          room.config.cupId = msg.config.cupId;
        }
        if (msg.config.maxPlayers !== undefined) {
          const max = parseInt(msg.config.maxPlayers, 10);
          room.config.maxPlayers = Number.isFinite(max) && max >= 2 ? max : null;
        }
        for (const [key, b] of Object.entries(ROOM_SETTING_BOUNDS)) {
          if (msg.config[key] === undefined) continue;
          if (b.toggle) {
            room.config[key] = !!msg.config[key];
          } else {
            const v = Number(msg.config[key]);
            if (Number.isFinite(v)) room.config[key] = Math.max(b.min, Math.min(b.max, v));
          }
        }
      }

      broadcastRoom(room, 'room_state', { room: serializeRoom(room) });
      broadcastLobbyList();
      break;
    }

    case 'start_cup': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.hostId !== client.id) return;

      if (!room.config.cupId) {
        sendWs(client, 'room_error', { message: 'Veuillez sélectionner une Coupe avant de lancer la compétition !' });
        return;
      }

      // Reset cup scores, times, extra segments, and modifiers for all players in the room
      for (const p of room.players.values()) {
        p.score = 0;
        p.totalTime = 0;
        p.modifiers = [];
        p.extraAppleSegments = 0;
        p.lastRank = null;
        p.draftChoice = null;
        p.draftOptions = [];
      }

      launchRoomRace(room, 0);
      break;
    }

    case 'player_state': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      const p = room.players.get(client.id);
      if (p && msg.state) {
        if (typeof msg.state.progress === 'number') {
          p.progress = msg.state.progress;
        }
        if (typeof msg.state.extraAppleSegments === 'number') {
          p.extraAppleSegments = Math.max(p.extraAppleSegments || 0, msg.state.extraAppleSegments);
        }
      }
      broadcastRoom(room, 'remote_player_state', {
        playerId: client.id,
        pseudo: client.pseudo,
        cosmetics: client.cosmetics,
        modifiers: p ? p.modifiers : [],
        state: msg.state
      }, client.id);
      break;
    }

    case 'world_sync': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      broadcastRoom(room, 'remote_world_sync', {
        senderId: client.id,
        worldState: msg.worldState
      }, client.id);
      break;
    }

    case 'entity_throw': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      broadcastRoom(room, 'remote_entity_throw', {
        playerId: client.id,
        pseudo: client.pseudo,
        entityType: msg.entityType,
        entityIndex: msg.entityIndex,
        x: msg.x,
        y: msg.y,
        vx: msg.vx,
        vy: msg.vy,
        angVel: msg.angVel || 0,
        damageMult: msg.damageMult || 1.0
      }, client.id);
      break;
    }

    case 'pvp_action': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      broadcastRoom(room, 'remote_pvp_action', {
        attackerId: client.id,
        attackerPseudo: client.pseudo,
        targetId: msg.targetId,
        actionType: msg.actionType, // 'hit' | 'grab' | 'throw_player' | 'pull'
        damage: msg.damage || 0,
        vx: msg.vx || 0,
        vy: msg.vy || 0,
        nodeIndex: msg.nodeIndex || 0,
        reason: msg.reason || ''
      }, client.id);
      break;
    }

    case 'player_finished': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.state !== 'racing') return;
      const p = room.players.get(client.id);
      if (!p || p.finished) return;

      room.finishCounter = (room.finishCounter || 0) + 1;
      p.finished = true;
      p.finishOrder = room.finishCounter;
      p.finishTime = typeof msg.raceTime === 'number' ? msg.raceTime : 0;
      p.progress = 1.0;

      broadcastRoom(room, 'player_crossed_finish', {
        playerId: client.id,
        pseudo: p.pseudo,
        finishOrder: p.finishOrder,
        finishTime: p.finishTime
      });

      // When 1st player crosses the finish line, start 20-second countdown if there are other players!
      if (!room.firstFinishHandled) {
        room.firstFinishHandled = true;
        if (room.players.size > 1) {
          const countdownSec = 20;
          broadcastRoom(room, 'race_countdown_started', {
            duration: countdownSec,
            firstFinisherId: p.id,
            firstFinisherPseudo: p.pseudo,
            finishTime: p.finishTime
          });
          room.raceTimerHandle = setTimeout(() => {
            concludeRoomRace(room);
          }, countdownSec * 1000);
        }
      }

      // Check if all players in the room have finished
      let allFinished = true;
      for (const pl of room.players.values()) {
        if (!pl.finished) {
          allFinished = false;
          break;
        }
      }
      if (allFinished) {
        setTimeout(() => concludeRoomRace(room), 1200);
      }
      break;
    }

    case 'select_modifier': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.state !== 'draft') return;
      const p = room.players.get(client.id);
      if (!p || (p.lastRank === 1 && room.players.size > 1)) return; // 1st place doesn't take a modifier in multiplayer

      const modId = msg.modifierId;
      if (!ALL_MODIFIER_IDS.includes(modId)) return;
      if (p.draftChoice) return; // Already selected for this round

      p.draftChoice = modId;
      p.modifiers = p.modifiers || [];
      p.modifiers.push(modId);

      broadcastRoom(room, 'modifier_selected', {
        playerId: p.id,
        pseudo: p.pseudo,
        modifierId: modId,
        modifiers: p.modifiers,
        autoPicked: false,
        room: serializeRoom(room)
      });

      // Check if all eligible players have made their choice
      let allChosen = true;
      for (const pl of room.players.values()) {
        const eligible = (pl.lastRank > 1) || (room.players.size === 1);
        if (eligible && !pl.draftChoice) {
          allChosen = false;
          break;
        }
      }
      if (allChosen) {
        if (room.draftTimerHandle) {
          clearTimeout(room.draftTimerHandle);
          room.draftTimerHandle = null;
        }
        broadcastRoom(room, 'draft_all_ready', { room: serializeRoom(room), autoPicked: false });

        if (room.autoLaunchTimerHandle) clearTimeout(room.autoLaunchTimerHandle);
        room.autoLaunchTimerHandle = setTimeout(() => {
          room.autoLaunchTimerHandle = null;
          if (room.state === 'draft') {
            const nextIdx = (room.raceIndex || 0) + 1;
            if (nextIdx < 3) {
              launchRoomRace(room, nextIdx);
            }
          }
        }, 1500);
      }
      break;
    }

    case 'next_cup_race': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.hostId !== client.id) return;

      if (room.draftTimerHandle) {
        clearTimeout(room.draftTimerHandle);
        room.draftTimerHandle = null;
      }
      if (room.autoLaunchTimerHandle) {
        clearTimeout(room.autoLaunchTimerHandle);
        room.autoLaunchTimerHandle = null;
      }

      // Auto-assign random modifier to any unchosen eligible player
      for (const pl of room.players.values()) {
        const eligible = (pl.lastRank > 1) || (room.players.size === 1);
        if (eligible && !pl.draftChoice) {
          const pool = (pl.draftOptions && pl.draftOptions.length > 0) ? pl.draftOptions : ALL_MODIFIER_IDS;
          const autoMod = pool[0];
          pl.draftChoice = autoMod;
          pl.modifiers = pl.modifiers || [];
          pl.modifiers.push(autoMod);
        }
      }

      const nextIdx = (room.raceIndex || 0) + 1;
      if (nextIdx < 3) {
        launchRoomRace(room, nextIdx);
      } else {
        concludeRoomRace(room);
      }
      break;
    }

    case 'return_to_lobby': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;
      if (room.raceTimerHandle) {
        clearTimeout(room.raceTimerHandle);
        room.raceTimerHandle = null;
      }
      if (room.draftTimerHandle) {
        clearTimeout(room.draftTimerHandle);
        room.draftTimerHandle = null;
      }
      if (room.autoLaunchTimerHandle) {
        clearTimeout(room.autoLaunchTimerHandle);
        room.autoLaunchTimerHandle = null;
      }
      room.state = 'lobby';
      room.raceIndex = 0;
      for (const p of room.players.values()) {
        p.finished = false;
        p.finishTime = null;
        p.progress = 0;
        p.score = 0;
        p.totalTime = 0;
        p.modifiers = [];
        p.extraAppleSegments = 0;
        p.lastRank = null;
        p.draftChoice = null;
        p.draftOptions = [];
      }
      broadcastRoom(room, 'returned_to_lobby', { room: serializeRoom(room) });
      broadcastLobbyList();
      break;
    }
  }
}

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];
  socket.write(responseHeaders.join('\r\n'));

  const clientId = 'p_' + crypto.randomBytes(5).toString('hex');
  let client = {
    id: clientId,
    resumeToken: crypto.randomBytes(16).toString('hex'),
    dropTimer: null,
    socket,
    pseudo: 'Chenille',
    cosmetics: {
      palette: 'emerald',
      hat: 'crown',
      face: 'cute',
      grip: 'classic',
      bodyType: 'classique',
      bodyShape: 'larve'
    },
    roomCode: null
  };
  clients.set(clientId, client);

  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const opcode = firstByte & 0x0f;
      const secondByte = buffer[1];
      const isMasked = (secondByte & 0x80) !== 0;
      let payloadLen = secondByte & 0x7f;
      let offset = 2;

      if (payloadLen === 126) {
        if (buffer.length < 4) return;
        payloadLen = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (buffer.length < 10) return;
        payloadLen = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskLen = isMasked ? 4 : 0;
      const totalFrameLen = offset + maskLen + payloadLen;
      if (buffer.length < totalFrameLen) return;

      let payload = buffer.slice(offset + maskLen, totalFrameLen);
      if (isMasked) {
        const mask = buffer.slice(offset, offset + 4);
        payload = Buffer.from(payload);
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i & 3];
        }
      }

      buffer = buffer.slice(totalFrameLen);

      if (opcode === 0x8) {
        // Close frame
        socket.end();
        return;
      } else if (opcode === 0x9) {
        // Ping -> Pong
        const pong = Buffer.alloc(2);
        pong[0] = 0x8a;
        pong[1] = 0;
        socket.write(pong);
      } else if (opcode === 0x1) {
        // Text frame
        let parsed = null;
        try {
          parsed = JSON.parse(payload.toString('utf8'));
        } catch (err) {
          // Ignore malformed JSON
        }
        if (parsed) {
          try {
            const rebound = handleWsMessage(client, parsed);
            if (rebound) client = rebound;
          } catch (err) {
            logServerError(err, `message « ${cleanText(parsed.type, 30)} » de ${client.pseudo} (${client.id})`);
          }
        }
      }
    }
  });

  const onSocketGone = () => {
    // Ignore the old socket of a client that already resumed on a new one
    if (client.socket !== socket || client.dropTimer) return;
    const room = client.roomCode ? rooms.get(client.roomCode) : null;
    if (!room) {
      clients.delete(client.id);
      return;
    }
    const p = room.players.get(client.id);
    if (p) p.connected = false;
    broadcastRoom(room, 'room_state', { room: serializeRoom(room) }, client.id);
    const dropped = client;
    dropped.dropTimer = setTimeout(() => {
      dropped.dropTimer = null;
      removeClientFromRoom(dropped);
      clients.delete(dropped.id);
    }, RECONNECT_GRACE_MS);
  };
  socket.on('close', onSocketGone);
  socket.on('error', onSocketGone);
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIpAddress();
  logLine('🐛', `Serveur SlipGrip prêt → http://localhost:${PORT}  ·  réseau local : http://${ip}:${PORT}`, C.bold);
});
