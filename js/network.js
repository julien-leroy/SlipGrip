// js/network.js — Client WebSocket Temps Réel, Gestionnaire de Rooms & Synchronisation Multijoueur SlipGrip

export class NetworkManager {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.playerId = null;
    this.serverIp = window.location.hostname || 'localhost';
    this.serverPort = window.location.port || '8080';
    this.currentRoom = null;
    this.openRooms = [];
    this.listeners = new Map();
    this.reconnectTimer = null;

    this.pseudo = this.loadPseudo();
  }

  loadPseudo() {
    try {
      const saved = localStorage.getItem('slipgrip_pseudo');
      if (saved && saved.trim()) return saved.trim().slice(0, 18);
    } catch {
      // Ignore
    }
    const num = Math.floor(10 + Math.random() * 89);
    return `Chenille_${num}`;
  }

  savePseudo(newPseudo) {
    const clean = String(newPseudo || '').trim().slice(0, 18) || 'Chenille';
    this.pseudo = clean;
    try {
      localStorage.setItem('slipgrip_pseudo', clean);
    } catch {
      // Ignore
    }
    return clean;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      for (const cb of list) {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in network listener [${event}]:`, err);
        }
      }
    }
  }

  connect(initialCosmetics = {}) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:8080';
    const wsUrl = `${proto}//${host}`;

    try {
      this.ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn('WebSocket connection failed, retrying...', err);
      this.scheduleReconnect(initialCosmetics);
      return;
    }

    this.ws.addEventListener('open', () => {
      this.connected = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.send('hello', {
        pseudo: this.pseudo,
        cosmetics: initialCosmetics
      });
      this.emit('connected', {});
    });

    this.ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.handleMessage(msg);
      } catch (err) {
        // Ignore malformed message
      }
    });

    this.ws.addEventListener('close', () => {
      this.connected = false;
      this.emit('disconnected', {});
      this.scheduleReconnect(initialCosmetics);
    });

    this.ws.addEventListener('error', () => {
      this.connected = false;
    });
  }

  scheduleReconnect(initialCosmetics) {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(initialCosmetics);
    }, 2000);
  }

  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify({ type, ...payload }));
      return true;
    } catch {
      return false;
    }
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        this.playerId = msg.playerId;
        if (msg.serverIp) this.serverIp = msg.serverIp;
        if (msg.serverPort) this.serverPort = msg.serverPort;
        if (Array.isArray(msg.rooms)) {
          this.openRooms = msg.rooms;
          this.emit('rooms_list', this.openRooms);
        }
        this.emit('welcome', msg);
        break;

      case 'rooms_list':
        this.openRooms = msg.rooms || [];
        this.emit('rooms_list', this.openRooms);
        break;

      case 'room_joined':
        this.currentRoom = msg.room;
        if (msg.playerId) this.playerId = msg.playerId;
        this.emit('room_joined', msg.room);
        break;

      case 'room_state':
        this.currentRoom = msg.room;
        this.emit('room_state', msg.room);
        break;

      case 'left_room':
        this.currentRoom = null;
        if (Array.isArray(msg.rooms)) {
          this.openRooms = msg.rooms;
        }
        this.emit('left_room', msg);
        break;

      case 'room_error':
        this.emit('room_error', msg);
        break;

      case 'cup_race_start':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('cup_race_start', msg);
        break;

      case 'remote_player_state':
        this.emit('remote_player_state', msg);
        break;

      case 'remote_world_sync':
        this.emit('remote_world_sync', msg);
        break;

      case 'remote_entity_throw':
        this.emit('remote_entity_throw', msg);
        break;

      case 'remote_pvp_action':
        this.emit('remote_pvp_action', msg);
        break;

      case 'player_crossed_finish':
        this.emit('player_crossed_finish', msg);
        break;

      case 'race_countdown_started':
        this.emit('race_countdown_started', msg);
        break;

      case 'cup_draft_start':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('cup_draft_start', msg);
        break;

      case 'modifier_selected':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('modifier_selected', msg);
        break;

      case 'draft_all_ready':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('draft_all_ready', msg);
        break;

      case 'cup_podium_start':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('cup_podium_start', msg);
        break;

      case 'returned_to_lobby':
        if (msg.room) this.currentRoom = msg.room;
        this.emit('returned_to_lobby', msg.room);
        break;
    }
  }

  isHost() {
    return !!(this.currentRoom && this.playerId && this.currentRoom.hostId === this.playerId);
  }

  getLocalPlayer() {
    if (!this.currentRoom || !Array.isArray(this.currentRoom.players)) return null;
    return this.currentRoom.players.find(p => p.id === this.playerId) || null;
  }

  async fetchServerInfo() {
    try {
      const res = await fetch('/api/server-info');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore
    }
    return {
      ip: this.serverIp,
      port: this.serverPort,
      url: window.location.origin,
      rooms: this.openRooms
    };
  }

  requestRoomsList() {
    this.send('list_rooms');
  }

  createRoom(cosmetics) {
    this.send('create_room', {
      pseudo: this.pseudo,
      cosmetics
    });
  }

  joinRoom(code, cosmetics) {
    this.send('join_room', {
      code: String(code || '').trim(),
      pseudo: this.pseudo,
      cosmetics
    });
  }

  leaveRoom() {
    this.send('leave_room');
    this.currentRoom = null;
  }

  updateProfile(pseudo, cosmetics, ready = true) {
    if (pseudo) this.savePseudo(pseudo);
    this.send('update_profile', {
      pseudo: this.pseudo,
      cosmetics,
      ready
    });
  }

  updateRoomConfig(config) {
    if (!this.isHost()) return;
    this.send('update_room_config', { config });
  }

  startCup() {
    if (!this.isHost()) return;
    this.send('start_cup');
  }

  sendPlayerState(state) {
    if (!this.currentRoom) return;
    this.send('player_state', { state });
  }

  sendWorldSync(worldState) {
    if (!this.currentRoom) return;
    this.send('world_sync', { worldState });
  }

  sendEntityThrow(payload) {
    if (!this.currentRoom) return;
    this.send('entity_throw', payload);
  }

  sendPvpAction(payload) {
    if (!this.currentRoom) return;
    this.send('pvp_action', payload);
  }

  sendPlayerFinished(raceTime) {
    if (!this.currentRoom) return;
    this.send('player_finished', { raceTime });
  }

  selectModifier(modifierId) {
    if (!this.currentRoom) return;
    this.send('select_modifier', { modifierId });
  }

  nextCupRace() {
    if (!this.isHost()) return;
    this.send('next_cup_race');
  }

  returnToLobby() {
    if (!this.currentRoom) return;
    this.send('return_to_lobby');
  }
}
