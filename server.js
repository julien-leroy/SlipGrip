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

// ==================== CUPS & DEFAULT ROOM SETTINGS ====================
const CUPS_CATALOG = {
  coupe_bourgeons: {
    id: 'coupe_bourgeons',
    name: 'Coupe des Bourgeons (Facile)',
    icon: '🌱',
    levels: [0, 1, 2],
    levelNames: ['1. L’Orée des Pousses', '2. Les Ponts de Lianes', '3. Le Verger Fleuri']
  },
  coupe_vents: {
    id: 'coupe_vents',
    name: 'Coupe des Vents (Moyen)',
    icon: '🍃',
    levels: [3, 4, 5],
    levelNames: ['4. La Grotte aux Spores', '5. Le Gouffre Poids-Plume', '6. La Falaise des Cimes']
  },
  coupe_titans: {
    id: 'coupe_titans',
    name: 'Coupe des Titans (Difficile)',
    icon: '⚡',
    levels: [6, 7, 8],
    levelNames: ['7. Le Tronc des Titans', '8. La Ruche des Cires', '9. Le Festin des Tempêtes']
  },
  coupe_fourmiliere: {
    id: 'coupe_fourmiliere',
    name: 'Coupe de la Fourmilière Royale (Maître)',
    icon: '🐜',
    levels: [9, 10, 11],
    levelNames: ['10. L’Arbre Creux Millénaire', '11. Jardins Suspendus d’Ambre', '12. Citadelle des Mandibules']
  },
  potager_geant: {
    id: 'potager_geant',
    name: 'Coupe des Bourgeons (Facile)',
    icon: '🌱',
    levels: [0, 1, 2],
    levelNames: ['1. L’Orée des Pousses', '2. Les Ponts de Lianes', '3. Le Verger Fleuri']
  },
  vallee_folle: {
    id: 'vallee_folle',
    name: 'Coupe des Vents (Moyen)',
    icon: '🍃',
    levels: [3, 4, 5],
    levelNames: ['4. La Grotte aux Spores', '5. Le Gouffre Poids-Plume', '6. La Falaise des Cimes']
  },
  pique_nique_royal: {
    id: 'pique_nique_royal',
    name: 'Coupe des Titans (Difficile)',
    icon: '⚡',
    levels: [6, 7, 8],
    levelNames: ['7. Le Tronc des Titans', '8. La Ruche des Cires', '9. Le Festin des Tempêtes']
  },
  fourmiliere_royale: {
    id: 'fourmiliere_royale',
    name: 'Coupe de la Fourmilière Royale (Maître)',
    icon: '🐜',
    levels: [9, 10, 11],
    levelNames: ['10. L’Arbre Creux Millénaire', '11. Jardins Suspendus d’Ambre', '12. Citadelle des Mandibules']
  }
};

function createDefaultRoomConfig() {
  return {
    cupId: null, // No cup selected by default
    maxPlayers: 4,
    jumpBoost: 1.0,
    startScale: 1.0,
    startSegments: 5,
    gravity: 740,
    gripDistance: 26,
    pvpDamageMult: 1.0
  };
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
    const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG.potager_geant;
    list.push({
      code: room.code,
      hostName: host ? host.pseudo : 'Hôte',
      cupId: cup.id,
      cupName: cup.name,
      cupIcon: cup.icon,
      playerCount: room.players.size,
      maxPlayers: room.config.maxPlayers || 4,
      state: room.state,
      raceIndex: room.raceIndex
    });
  }
  return list;
}

function serializeRoom(room) {
  const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG.potager_geant;
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

  const cup = CUPS_CATALOG[room.config.cupId] || CUPS_CATALOG.potager_geant;
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
  if (room.players.size === 0) {
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
      if (room.players.size >= (room.config.maxPlayers || 4) && !room.players.has(client.id)) {
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
          room.config.maxPlayers = Math.max(2, Math.min(8, parseInt(msg.config.maxPlayers, 10) || 4));
        }
        if (msg.config.jumpBoost !== undefined) {
          room.config.jumpBoost = Math.max(0.5, Math.min(2.5, parseFloat(msg.config.jumpBoost) || 1.0));
        }
        if (msg.config.startScale !== undefined) {
          room.config.startScale = Math.max(0.6, Math.min(1.8, parseFloat(msg.config.startScale) || 1.0));
        }
        if (msg.config.startSegments !== undefined) {
          room.config.startSegments = Math.max(4, Math.min(9, parseInt(msg.config.startSegments, 10) || 5));
        }
        if (msg.config.gravity !== undefined) {
          room.config.gravity = Math.max(250, Math.min(1100, parseInt(msg.config.gravity, 10) || 740));
        }
        if (msg.config.gripDistance !== undefined) {
          room.config.gripDistance = Math.max(12, Math.min(48, parseInt(msg.config.gripDistance, 10) || 26));
        }
        if (msg.config.pvpDamageMult !== undefined) {
          room.config.pvpDamageMult = Math.max(0.25, Math.min(3.0, parseFloat(msg.config.pvpDamageMult) || 1.0));
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
        try {
          const str = payload.toString('utf8');
          const parsed = JSON.parse(str);
          const rebound = handleWsMessage(client, parsed);
          if (rebound) client = rebound;
        } catch (err) {
          // Ignore malformed JSON
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
  console.log(`SlipGrip Multiplayer Server running at:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://${ip}:${PORT}`);
});
