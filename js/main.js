// js/main.js — Main Game Loop, Hold-to-Grip Input Controller, Multiplayer Sync, Checkpoints, Camera & HUD Manager

import { PhysicsWorld } from './physics.js';
import { Caterpillar } from './caterpillar.js';
import { ParticleSystem } from './particles.js';
import { LEVEL_DEFINITIONS, LevelRenderer } from './levels.js';
import { sound } from './audio.js';
import {
  GAMEPLAY_CONFIG,
  GAMEPLAY_PRESETS,
  applyPreset,
  saveGameplayConfig,
  resetGameplayConfig,
  saveAsDefaultGameplayConfig,
  applyRoomGameplayConfig,
  restoreSoloGameplayConfig,
  isUsingRoomGameplayConfig,
  GRIP_STYLES
} from './gameplayConfig.js';
import { NetworkManager } from './network.js';
import { UIManager } from './uiManager.js';

// How far below a checkpoint / finish line (in px) the head may be and still validate it
const CHECKPOINT_BELOW_TOLERANCE = 160;

class SlipGripGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.world = new PhysicsWorld();
    this.particles = new ParticleSystem();
    this.renderer = new LevelRenderer();

    this.currentLevelIndex = 0;
    this.level = LEVEL_DEFINITIONS[0];
    this.caterpillar = new Caterpillar(this.level.startX, this.level.startY);

    // Multiplayer state
    this.isMultiplayer = false;
    this.remoteCaterpillars = new Map(); // playerId -> Caterpillar
    this.remoteFinishState = new Map(); // playerId -> { finished, finishTime }
    this.netSyncTimer = 0;

    this.lastCheckpoint = {
      x: this.level.startX,
      y: this.level.startY
    };

    this.inputs = {
      space: false,
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.raceStarted = false;
    this.raceFinished = false;
    this.raceTime = 0;
    this.bestTimes = this.loadBestTimes();
    this.confettiTimer = 0;

    this.camera = {
      x: 0,
      y: 0,
      focusX: this.level.startX + 120,
      focusY: this.level.startY - 40,
      scale: 0.62
    };

    this.introCinematicTimer = 0;
    this.introCinematicDuration = 3.2;
    this.introCountdownStage = -1;

    this.globalTime = 0;
    this.lastFrameTime = performance.now();

    // Initialize Network & UI Managers
    this.network = new NetworkManager();
    this.caterpillar.pseudo = this.network.pseudo;

    this.cacheDomElements();
    this.bindEvents();
    this.bindMultiplayerWorldCallbacks();

    this.ui = new UIManager(this, this.network);
    this.network.connect(this.caterpillar.cosmetics);

    this.isGameRunning = false;
    this.rafId = null;
    this.currentLevelIndex = 0;

    this.syncCosmeticsUI();
    this.syncTuningUI();
    this.resize();

    // Show Home screen on launch — game engine stays asleep until a race is launched
    this.ui.showScreen('home');
  }

  bindMultiplayerWorldCallbacks() {
    // 1. When local caterpillar throws a prop / aphid / hedgehog, broadcast to room
    this.caterpillar.onThrowEntityCallback = (evt) => {
      if (!this.isMultiplayer || !this.network.currentRoom) return;
      this.network.sendEntityThrow({
        entityType: evt.entityType,
        x: evt.x,
        y: evt.y,
        vx: evt.vx,
        vy: evt.vy,
        angVel: evt.angVel || 0
      });
    };

    // 2. When local caterpillar grabs and flings a rival caterpillar, send PvP action
    this.caterpillar.onPvpActionCallback = (evt) => {
      if (!this.isMultiplayer || !this.network.currentRoom) return;
      this.network.sendPvpAction({
        targetId: evt.targetId,
        damage: evt.damage,
        vx: evt.vx,
        vy: evt.vy,
        actionType: 'grab_throw'
      });
    };

    // 4. Listen for incoming network gameplay events
    this.network.on('welcome', (msg) => {
      this.caterpillar.playerId = (msg && msg.playerId) ? msg.playerId : msg;
    });

    this.network.on('remote_player_state', (msg) => {
      if (!this.isMultiplayer) return;
      const remoteCat = this.remoteCaterpillars.get(msg.playerId);
      if (remoteCat && msg.state) {
        remoteCat.applyRemoteState(msg.state);
      }
    });

    this.network.on('remote_entity_throw', (msg) => {
      if (!this.isMultiplayer) return;
      this.applyRemoteEntityThrow(msg);
    });

    this.network.on('remote_pvp_action', (msg) => {
      if (!this.isMultiplayer) return;
      if (msg.targetId === this.network.playerId) {
        // Local player was hit or thrown by a rival caterpillar!
        const dmg = msg.damage || 18;
        const kx = msg.vx || 0;
        const ky = msg.vy || -220;
        this.caterpillar.takeDamage(dmg, kx, ky, this.particles, sound);
        const label = msg.actionType === 'grab_throw' ? 'PROJETÉ PAR UN RIVAL ! 🤼' : 'TOUCHÉ ! 💥';
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 38, label, '#ff4757');
      }
    });

    this.network.on('player_crossed_finish', (msg) => {
      if (!this.isMultiplayer) return;
      const rank = msg.finishOrder;
      this.remoteFinishState.set(msg.playerId, {
        finished: true,
        finishTime: msg.finishTime,
        rank
      });
      if (msg.playerId !== this.network.playerId) {
        sound.playCheckpoint();
        this.particles.spawnPopup(
          this.caterpillar.head.x,
          this.caterpillar.head.y - 45,
          `🏁 ${msg.pseudo} termine ${rank === 1 ? '1er' : rank + 'e'} !`,
          '#ffd93b'
        );
      }
    });

    this.network.on('remote_world_sync', (msg) => {
      if (!this.isMultiplayer) return;
      if (this.network.isHost()) return;
      if (msg && msg.worldState) {
        this.applyRemoteWorldSync(msg.worldState);
      }
    });
  }

  serializeWorldState() {
    const aphids = (this.world.aphids || []).map(a => ({
      id: a.id,
      x: Math.round(a.x),
      y: Math.round(a.y),
      vx: Math.round(a.vx),
      vy: Math.round(a.vy),
      hp: a.hp,
      isDefeated: !!a.isDefeated,
      isHeld: !!a.isHeld,
      isFlying: !!a.isFlying,
      facing: a.facing
    }));

    const hedgehogs = (this.world.hedgehogs || []).map(h => ({
      id: h.id,
      x: Math.round(h.x),
      y: Math.round(h.y),
      vx: Math.round(h.vx),
      vy: Math.round(h.vy),
      hp: h.hp,
      isDefeated: !!h.isDefeated,
      isHeld: !!h.isHeld,
      isFlying: !!h.isFlying,
      facing: h.facing
    }));

    const ants = (this.world.ants || []).map(ant => ({
      id: ant.id,
      x: Math.round(ant.x),
      y: Math.round(ant.y),
      vx: Math.round(ant.vx),
      vy: Math.round(ant.vy),
      hp: ant.hp,
      isDefeated: !!ant.isDefeated,
      isHeld: !!ant.isHeld,
      isFlying: !!ant.isFlying,
      facing: ant.facing,
      aiState: ant.aiState,
      windupTimer: +(ant.windupTimer || 0).toFixed(2)
    }));

    const props = (this.world.props || []).map(p => ({
      id: p.id,
      x: Math.round(p.x),
      y: Math.round(p.y),
      vx: Math.round(p.vx),
      vy: Math.round(p.vy),
      angle: +(p.angle.toFixed(2)),
      angVel: +(p.angVel.toFixed(2)),
      hp: p.hp,
      isBroken: !!p.isBroken,
      isHeld: !!p.isHeld
    }));

    const apples = (this.world.apples || []).map(a => ({
      id: a.id,
      x: Math.round(a.x),
      y: Math.round(a.y),
      type: a.type || a.kind,
      collected: !!a.collected
    }));

    const platforms = (this.world.dynamicPlatforms || []).map(plat => ({
      id: plat.id,
      angle: +(plat.angle.toFixed(3)),
      angVel: +(plat.angVel.toFixed(3)),
      pivotX: Math.round(plat.pivotX),
      pivotY: Math.round(plat.pivotY)
    }));

    return { aphids, hedgehogs, ants, props, apples, platforms };
  }

  applyRemoteWorldSync(worldState) {
    if (!worldState) return;

    // 1. Synchronize Aphids
    if (Array.isArray(worldState.aphids)) {
      for (const sAphid of worldState.aphids) {
        let a = this.world.aphids.find(x => x.id === sAphid.id);
        if (!a && this.world.aphids.length > 0) {
          a = this.world.aphids.find(x => Math.hypot(x.x - sAphid.x, x.y - sAphid.y) < 220);
        }
        if (a) {
          const isHeldLocally = (this.caterpillar.rearAnchor.aphidRef === a || this.caterpillar.frontAnchor.aphidRef === a);
          if (!isHeldLocally) {
            const d = Math.hypot(a.x - sAphid.x, a.y - sAphid.y);
            if (d > 160) {
              a.x = sAphid.x;
              a.y = sAphid.y;
            } else {
              a.x += (sAphid.x - a.x) * 0.45;
              a.y += (sAphid.y - a.y) * 0.45;
            }
            a.vx = sAphid.vx;
            a.vy = sAphid.vy;
            a.isHeld = sAphid.isHeld;
            a.isFlying = sAphid.isFlying;
            if (sAphid.facing !== undefined) a.facing = sAphid.facing;
          }
          a.hp = sAphid.hp;
          a.isDefeated = sAphid.isDefeated;
        }
      }
    }

    // 2. Synchronize Hedgehogs
    if (Array.isArray(worldState.hedgehogs)) {
      for (const sHedgehog of worldState.hedgehogs) {
        let h = this.world.hedgehogs.find(x => x.id === sHedgehog.id);
        if (!h && this.world.hedgehogs.length > 0) {
          h = this.world.hedgehogs.find(x => Math.hypot(x.x - sHedgehog.x, x.y - sHedgehog.y) < 220);
        }
        if (h) {
          const isHeldLocally = (this.caterpillar.rearAnchor.hedgehogRef === h || this.caterpillar.frontAnchor.hedgehogRef === h);
          if (!isHeldLocally) {
            const d = Math.hypot(h.x - sHedgehog.x, h.y - sHedgehog.y);
            if (d > 160) {
              h.x = sHedgehog.x;
              h.y = sHedgehog.y;
            } else {
              h.x += (sHedgehog.x - h.x) * 0.45;
              h.y += (sHedgehog.y - h.y) * 0.45;
            }
            h.vx = sHedgehog.vx;
            h.vy = sHedgehog.vy;
            h.isHeld = sHedgehog.isHeld;
            h.isFlying = sHedgehog.isFlying;
            if (sHedgehog.facing !== undefined) h.facing = sHedgehog.facing;
          }
          h.hp = sHedgehog.hp;
          h.isDefeated = sHedgehog.isDefeated;
        }
      }
    }

    // 2b. Synchronize Ants
    if (Array.isArray(worldState.ants) && this.world.ants) {
      for (const sAnt of worldState.ants) {
        let ant = this.world.ants.find(x => x.id === sAnt.id);
        if (!ant && this.world.ants.length > 0) {
          ant = this.world.ants.find(x => Math.hypot(x.x - sAnt.x, x.y - sAnt.y) < 220);
        }
        if (ant) {
          const isHeldLocally = (this.caterpillar.rearAnchor.antRef === ant || this.caterpillar.frontAnchor.antRef === ant);
          if (!isHeldLocally) {
            const d = Math.hypot(ant.x - sAnt.x, ant.y - sAnt.y);
            if (d > 160) {
              ant.x = sAnt.x;
              ant.y = sAnt.y;
            } else {
              ant.x += (sAnt.x - ant.x) * 0.45;
              ant.y += (sAnt.y - ant.y) * 0.45;
            }
            ant.vx = sAnt.vx;
            ant.vy = sAnt.vy;
            ant.isHeld = sAnt.isHeld;
            ant.isFlying = sAnt.isFlying;
            if (sAnt.facing !== undefined) ant.facing = sAnt.facing;
            if (sAnt.aiState !== undefined) ant.aiState = sAnt.aiState;
            if (sAnt.windupTimer !== undefined) ant.windupTimer = sAnt.windupTimer;
          }
          ant.hp = sAnt.hp;
          ant.isDefeated = sAnt.isDefeated;
        }
      }
    }

    // 3. Synchronize Props (Acorns, Pinecones)
    if (Array.isArray(worldState.props)) {
      for (const sProp of worldState.props) {
        let p = this.world.props.find(x => x.id === sProp.id);
        if (!p && this.world.props.length > 0) {
          p = this.world.props.find(x => Math.hypot(x.x - sProp.x, x.y - sProp.y) < 260);
        }
        if (p) {
          const isHeldLocally = (this.caterpillar.rearAnchor.propRef === p || this.caterpillar.frontAnchor.propRef === p);
          if (!isHeldLocally) {
            const d = Math.hypot(p.x - sProp.x, p.y - sProp.y);
            if (d > 180) {
              p.x = sProp.x;
              p.y = sProp.y;
            } else {
              p.x += (sProp.x - p.x) * 0.45;
              p.y += (sProp.y - p.y) * 0.45;
            }
            p.vx = sProp.vx;
            p.vy = sProp.vy;
            p.angle = sProp.angle;
            p.angVel = sProp.angVel;
            p.isHeld = sProp.isHeld;
          }
          if (sProp.hp !== undefined) p.hp = sProp.hp;
          p.isBroken = sProp.isBroken;
        }
      }
    }

    // 4. Synchronize Bonus Apples
    if (Array.isArray(worldState.apples) && this.world.apples) {
      for (const sApple of worldState.apples) {
        let ap = this.world.apples.find(x => x.id === sApple.id);
        if (ap) {
          if (sApple.collected) ap.collected = true;
          ap.x = sApple.x;
          ap.y = sApple.y;
        }
      }
    }

    // 5. Synchronize Dynamic Platforms (Leaves, Hoses)
    if (Array.isArray(worldState.platforms) && this.world.dynamicPlatforms) {
      for (const sPlat of worldState.platforms) {
        const plat = this.world.dynamicPlatforms.find(x => x.id === sPlat.id);
        if (plat) {
          plat.angle = sPlat.angle;
          plat.angVel = sPlat.angVel;
          plat.pivotX = sPlat.pivotX;
          plat.pivotY = sPlat.pivotY;
          this.world.updatePlatformWorldSegments(plat);
        }
      }
    }
  }

  applyRemoteEntityThrow(msg) {
    const { entityType, x, y, vx, vy, angVel } = msg;
    let list = [];
    if (entityType === 'prop') list = this.world.props;
    else if (entityType === 'aphid') list = this.world.aphids;
    else if (entityType === 'hedgehog') list = this.world.hedgehogs;
    else if (entityType === 'ant') list = this.world.ants || [];

    let closest = null;
    let bestD = 320;
    for (const ent of list) {
      const d = Math.hypot(ent.x - x, ent.y - y);
      if (d < bestD) {
        bestD = d;
        closest = ent;
      }
    }
    if (closest) {
      closest.x = x;
      closest.y = y;
      closest.vx = vx;
      closest.vy = vy;
      if (typeof angVel === 'number') closest.angVel = angVel;
      closest.isHeld = false;
      closest.isFlying = true;
      closest.thrownBy = msg.playerId;
      closest.throwGraceTimer = 0.20;
    }
  }

  startSoloMode() {
    this.isMultiplayer = false;
    restoreSoloGameplayConfig();
    this.world.gravity = GAMEPLAY_CONFIG.gravity;
    this.isInActiveCup = false;
    this.remoteCaterpillars.clear();
    this.remoteFinishState.clear();
    this.caterpillar.roomStartScale = 1.0;
    this.caterpillar.roomStartSegments = 5;
    this.caterpillar.resetProgression();
    this.world.caterpillars = [this.caterpillar];
    document.getElementById('mp-race-hud')?.classList.add('hidden');
    if (this.ui && this.ui.elMultiMarkers) {
      this.ui.elMultiMarkers.innerHTML = '';
    }
    this.loadLevel(this.currentLevelIndex !== undefined ? this.currentLevelIndex : 0);
    this.startIntroCinematic(this.level.name);
    this.resumeGameLoop();
  }

  startMultiplayerRace(msg) {
    this.isMultiplayer = true;
    this.remoteCaterpillars.clear();
    this.remoteFinishState.clear();

    // Reset all progression (extra segments from training or previous cups) at the start of a Cup!
    if ((msg.raceIndex || 0) === 0 || !this.isInActiveCup) {
      this.caterpillar.resetProgression();
      this.isInActiveCup = true;
    }

    // Apply Room Admin settings
    const s = msg.config || msg.settings || (msg.room && msg.room.config) || {};
    applyRoomGameplayConfig(s);
    this.world.gravity = GAMEPLAY_CONFIG.gravity;
    this.world.pvpDamageMult = typeof s.pvpDamageMult === 'number' ? s.pvpDamageMult : 1.0;

    const startScale = typeof s.startScale === 'number' ? s.startScale : 1.0;
    const startSegments = typeof s.startSegments === 'number' ? s.startSegments : 5;

    this.caterpillar.playerId = this.network.playerId;
    this.caterpillar.pseudo = this.network.pseudo;
    this.caterpillar.roomStartScale = startScale;
    this.caterpillar.roomStartSegments = startSegments;

    // Find local player in room players to apply cumulative catch-up modifiers
    const players = (msg.room && msg.room.players) || msg.players || [];
    const me = players.find(p => p.id === this.network.playerId);
    this.caterpillar.setModifiers((me && me.modifiers) || []);

    // Load level matching msg.levelId
    let lvlIdx = 0;
    if (msg.levelId !== undefined) {
      const foundIdx = LEVEL_DEFINITIONS.findIndex(l => l.id === msg.levelId);
      lvlIdx = foundIdx >= 0 ? foundIdx : (Number(msg.levelId) % LEVEL_DEFINITIONS.length);
    } else if (msg.levelIndex !== undefined) {
      lvlIdx = Number(msg.levelIndex) % LEVEL_DEFINITIONS.length;
    }
    this.loadLevel(lvlIdx);

    // Spawn local & remote caterpillars side-by-side at start line
    players.forEach((p, idx) => {
      const spawnX = this.level.startX + idx * 22;
      const spawnY = this.level.startY - (idx % 2) * 14;
      if (p.id === this.network.playerId) {
        this.caterpillar.reset(spawnX, spawnY);
      } else {
        const rCat = new Caterpillar(spawnX, spawnY, {
          isRemote: true,
          playerId: p.id,
          pseudo: p.pseudo,
          cosmetics: p.cosmetics,
          modifiers: p.modifiers || [],
          roomStartScale: startScale,
          roomStartSegments: startSegments
        });
        rCat.extraAppleSegments = p.extraAppleSegments || 0;
        rCat.reset(spawnX, spawnY);
        this.remoteCaterpillars.set(p.id, rCat);
      }
    });

    this.world.caterpillars = [this.caterpillar, ...this.remoteCaterpillars.values()];
    this.raceStarted = false;
    this.raceFinished = false;
    this.raceTime = 0;

    // Update Multiplayer Race HUD Banner
    const cupPill = document.getElementById('mp-cup-race-pill');
    if (cupPill) {
      cupPill.textContent = `🏆 Course ${(msg.raceIndex || 0) + 1} / ${msg.totalRaces || 3} — ${this.level.name}`;
    }
    document.getElementById('mp-finish-countdown-banner')?.classList.add('hidden');
    document.getElementById('mp-race-hud')?.classList.remove('hidden');

    sound.playCheckpoint();
    if (this.caterpillar.modifiers.length > 0) {
      this.particles.spawnPopup(
        this.caterpillar.head.x,
        this.caterpillar.head.y - 45,
        `BONUS ACTIFS : ${this.caterpillar.modifiers.length} ⚡`,
        '#ffd93b'
      );
    }

    this.startIntroCinematic(this.level.name);
    this.resumeGameLoop();
  }

  startIntroCinematic(mapName) {
    this.introCinematicTimer = 3.2;
    this.introCinematicDuration = 3.2;
    this.introCountdownStage = 4;
    this.raceStarted = false;

    // Firmly anchor the caterpillar feet on the start line
    if (this.caterpillar.rearAnchor) this.caterpillar.rearAnchor.anchored = true;
    if (this.caterpillar.frontAnchor) this.caterpillar.frontAnchor.anchored = true;
    if (this.caterpillar.rear) {
      this.caterpillar.rear.vx = 0;
      this.caterpillar.rear.vy = 0;
    }
    if (this.caterpillar.head) {
      this.caterpillar.head.vx = 0;
      this.caterpillar.head.vy = 0;
    }

    // Camera starts zoomed out (scale 0.38) and positioned slightly ahead to preview the upcoming track
    this.camera.scale = 0.38;
    const com = this.caterpillar.centerOfMass;
    this.camera.focusX = com.x + 360;
    this.camera.focusY = com.y - 80;

    const overlay = document.getElementById('race-countdown-overlay');
    const mapEl = document.getElementById('race-countdown-map');
    const subEl = document.getElementById('race-countdown-sub');
    const textEl = document.getElementById('race-countdown-text');

    if (mapEl) mapEl.textContent = mapName || this.level.name;
    if (subEl) subEl.textContent = 'À VOS MARQUES...';
    if (textEl) {
      textEl.textContent = '3';
      textEl.className = 'race-countdown-text';
    }
    if (overlay) overlay.classList.remove('hidden');
  }

  cacheDomElements() {
    this.elTimer = document.getElementById('race-timer');
    this.elBest = document.getElementById('best-timer');
    this.elProgressFill = document.getElementById('race-progress-fill');
    this.elProgressBug = document.getElementById('race-progress-bug');

    this.elRearWidget = document.getElementById('anchor-rear-widget');
    this.elFrontWidget = document.getElementById('anchor-front-widget');
    this.elStateQ = document.getElementById('state-q');
    this.elStateD = document.getElementById('state-d');
    this.elIconQ = document.getElementById('icon-q');
    this.elIconD = document.getElementById('icon-d');

    this.elOmegaPct = document.getElementById('omega-pct');
    this.elOmegaFill = document.getElementById('omega-meter-fill');
    this.elComLeft = document.getElementById('com-left');
    this.elComRight = document.getElementById('com-right');

    this.elCoachText = document.getElementById('coach-text');

    this.elVictoryModal = document.getElementById('victory-modal');
    this.elVictoryTitle = document.getElementById('victory-title');
    this.elVictoryTime = document.getElementById('victory-time');
    this.elVictoryBest = document.getElementById('victory-best');
    this.elNewRecordBadge = document.getElementById('new-record-badge');

    this.elHealthValue = document.getElementById('health-value');
    this.elHealthFill = document.getElementById('health-bar-fill');
    this.elHealthCard = document.getElementById('health-card');

    this.elPowerUpCard = document.getElementById('powerup-card');
    this.elPowerUpIcon = document.getElementById('powerup-icon');
    this.elPowerUpLabel = document.getElementById('powerup-label');
    this.elPowerUpTimer = document.getElementById('powerup-timer');
    this.elPowerUpFill = document.getElementById('powerup-bar-fill');

    this.elHelpModal = document.getElementById('help-modal');
    this.elCosmeticsModal = document.getElementById('cosmetics-modal');
    this.elTuningModal = document.getElementById('tuning-modal');
    this.lvlButtons = Array.from(document.querySelectorAll('.lvl-btn'));
    this.lastHp = null;
    this.healthVisibleTimer = 0;
  }

  syncCosmeticsUI() {
    if (!this.elCosmeticsModal) return;
    const cos = this.caterpillar.cosmetics;
    document.querySelectorAll('#class-options .class-card').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.class === (cos.bodyType || 'classique'));
    });
    document.querySelectorAll('#shape-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.shape === (cos.bodyShape || 'larve'));
    });
    document.querySelectorAll('#palette-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.palette === cos.palette);
    });
    document.querySelectorAll('#hat-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.hat === cos.hat);
    });
    document.querySelectorAll('#grip-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.grip === (cos.grip || 'classic'));
    });
    document.querySelectorAll('#face-options .cos-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.face === cos.face);
    });
  }

  syncTuningUI() {
    if (!this.elTuningModal) return;
    const cfg = GAMEPLAY_CONFIG;

    const setSlider = (id, val) => {
      const slider = document.getElementById(`tune-${id}`);
      const readout = document.getElementById(`val-${id}`);
      if (slider) slider.value = val;
      if (readout) readout.textContent = val;
    };

    setSlider('gravity', cfg.gravity);
    setSlider('groundSnapping', cfg.groundSnapping);
    setSlider('orientationUpForce', cfg.orientationUpForce);
    setSlider('orientationResponsiveness', cfg.orientationResponsiveness);
    setSlider('bendOrientationPower', cfg.bendOrientationPower !== undefined ? cfg.bendOrientationPower : 1.0);
    setSlider('jumpBoost', cfg.jumpBoost);
    setSlider('groundPushForce', cfg.groundPushForce !== undefined ? cfg.groundPushForce : 1.35);
    setSlider('unbendExtensionSpeed', cfg.unbendExtensionSpeed !== undefined ? cfg.unbendExtensionSpeed : 8.0);
    setSlider('unbendReachBonus', cfg.unbendReachBonus !== undefined ? cfg.unbendReachBonus : 1.0);
    setSlider('jumpUpAngleBonus', cfg.jumpUpAngleBonus);
    setSlider('jumpChargeTime', cfg.jumpChargeTime);
    setSlider('gripDistance', cfg.gripDistance);
    setSlider('omegaArchVisual', cfg.omegaArchVisual);
    setSlider('wigglePhysicsAmount', cfg.wigglePhysicsAmount);
    setSlider('clawScale', cfg.clawScale);

    const chkBendOrient = document.getElementById('tune-bendCanOrientVertically');
    if (chkBendOrient) chkBendOrient.checked = cfg.bendCanOrientVertically !== false;

    const chkPreserveShape = document.getElementById('tune-preserveShapeOnBend');
    if (chkPreserveShape) chkPreserveShape.checked = cfg.preserveShapeOnBend !== false;

    const chkAirborneExt = document.getElementById('tune-airborneExtensionOnly');
    if (chkAirborneExt) chkAirborneExt.checked = cfg.airborneExtensionOnly !== false;

    const chkBadges = document.getElementById('tune-showBadgesOverlay');
    if (chkBadges) chkBadges.checked = !!cfg.showBadgesOverlay;

    const selBgMode = document.getElementById('tune-backgroundMode');
    if (selBgMode) selBgMode.value = cfg.backgroundMode || 'parallax';

    document.querySelectorAll('#preset-buttons .preset-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.preset === cfg.activePreset);
    });
  }

  toggleTuningModal() {
    if (!this.elTuningModal) return;
    if (isUsingRoomGameplayConfig() && this.elTuningModal.classList.contains('hidden')) {
      this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 30, 'RÉGLAGES VERROUILLÉS EN MULTIJOUEUR 🔒', '#ff7675');
      return;
    }
    const isHidden = this.elTuningModal.classList.contains('hidden');
    if (isHidden) {
      this.syncTuningUI();
      this.elTuningModal.classList.remove('hidden');
    } else {
      this.elTuningModal.classList.add('hidden');
    }
  }

  loadBestTimes() {
    try {
      const raw = localStorage.getItem('slipgrip_best_times');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveBestTimes() {
    try {
      localStorage.setItem('slipgrip_best_times', JSON.stringify(this.bestTimes));
    } catch {
      // Ignore storage errors
    }
  }

  formatTime(seconds) {
    if (seconds === undefined || seconds === null) return '--:--.--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('keydown', (e) => {
      // Ignore game keys when typing in a text input
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      if (this.ui && this.ui.activeScreen !== 'game') {
        return;
      }
      if (e.repeat) return;
      const code = e.code;
      const key = e.key.toLowerCase();

      if (['KeyQ', 'KeyA', 'KeyD', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(code)) {
        if (!this.raceStarted && !this.raceFinished) {
          this.raceStarted = true;
        }
      }

      // Hold Q (or A) -> Grip Rear Foot
      if (key === 'q' || key === 'a' || code === 'KeyQ') {
        e.preventDefault();
        this.caterpillar.setRearHold(true, this.particles);
      }

      // Hold D -> Grip Front Foot
      if (key === 'd' || code === 'KeyD') {
        e.preventDefault();
        this.caterpillar.setFrontHold(true, this.particles);
      }

      // Hold SPACE -> Contract into Omega (Ω)
      if (code === 'Space') {
        e.preventDefault();
        this.inputs.space = true;
      }

      // Arrow keys -> Orientation / Aiming
      if (code === 'ArrowLeft') { e.preventDefault(); this.inputs.left = true; }
      if (code === 'ArrowRight') { e.preventDefault(); this.inputs.right = true; }
      if (code === 'ArrowUp') { e.preventDefault(); this.inputs.up = true; }
      if (code === 'ArrowDown') { e.preventDefault(); this.inputs.down = true; }

      // C -> Respawn at latest Checkpoint
      if (key === 'c') {
        e.preventDefault();
        this.respawnAtCheckpoint();
      }

      // R -> Full level restart (only in solo mode; in multiplayer respawns at checkpoint)
      if (key === 'r') {
        e.preventDefault();
        if (this.isMultiplayer) {
          this.respawnAtCheckpoint();
        } else {
          this.loadLevel(this.currentLevelIndex);
        }
      }

      // T or Tab -> Toggle Gameplay & Physics Tuning Lab
      if (key === 't' || code === 'Tab') {
        e.preventDefault();
        this.toggleTuningModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      const key = e.key.toLowerCase();

      if (key === 'q' || key === 'a' || code === 'KeyQ') {
        this.caterpillar.setRearHold(false, this.particles);
      }

      if (key === 'd' || code === 'KeyD') {
        this.caterpillar.setFrontHold(false, this.particles);
      }

      if (code === 'Space') this.inputs.space = false;

      if (code === 'ArrowLeft') this.inputs.left = false;
      if (code === 'ArrowRight') this.inputs.right = false;
      if (code === 'ArrowUp') this.inputs.up = false;
      if (code === 'ArrowDown') this.inputs.down = false;
    });

    // Mouse / Touch press & release on Q / D HUD widgets
    this.elRearWidget.addEventListener('pointerdown', () => {
      if (!this.raceStarted && !this.raceFinished) this.raceStarted = true;
      this.caterpillar.setRearHold(true, this.particles);
    });
    this.elRearWidget.addEventListener('pointerup', () => {
      this.caterpillar.setRearHold(false, this.particles);
    });
    this.elRearWidget.addEventListener('pointerleave', () => {
      this.caterpillar.setRearHold(false, this.particles);
    });

    this.elFrontWidget.addEventListener('pointerdown', () => {
      if (!this.raceStarted && !this.raceFinished) this.raceStarted = true;
      this.caterpillar.setFrontHold(true, this.particles);
    });
    this.elFrontWidget.addEventListener('pointerup', () => {
      this.caterpillar.setFrontHold(false, this.particles);
    });
    this.elFrontWidget.addEventListener('pointerleave', () => {
      this.caterpillar.setFrontHold(false, this.particles);
    });

    // Home Menu button in top HUD
    document.getElementById('btn-home-menu')?.addEventListener('click', (e) => {
      e.currentTarget.blur();
      if (this.isMultiplayer && this.network.currentRoom) {
        this.ui.showScreen('room');
      } else {
        this.ui.showScreen('home');
      }
    });

    // Level selector buttons & Solo dropdown
    this.lvlButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.level, 10);
        this.loadLevel(idx);
        btn.blur();
      });
    });

    const soloSelect = document.getElementById('solo-level-select');
    if (soloSelect) {
      soloSelect.addEventListener('change', () => {
        const idx = parseInt(soloSelect.value, 10);
        if (!Number.isNaN(idx)) {
          this.loadLevel(idx);
        }
        soloSelect.blur();
      });
    }

    // Checkpoint respawn button
    document.getElementById('btn-checkpoint').addEventListener('click', (e) => {
      this.respawnAtCheckpoint();
      e.currentTarget.blur();
    });

    // Full Restart button
    document.getElementById('btn-restart').addEventListener('click', (e) => {
      if (this.isMultiplayer) {
        this.respawnAtCheckpoint();
      } else {
        this.loadLevel(this.currentLevelIndex);
      }
      e.currentTarget.blur();
    });

    // Mute button
    const btnMute = document.getElementById('btn-mute');
    btnMute.addEventListener('click', () => {
      const muted = sound.toggleMute();
      btnMute.textContent = muted ? '🔇' : '🔊';
      btnMute.blur();
    });

    // Cosmetics modal buttons
    const btnCosmetics = document.getElementById('btn-cosmetics');
    if (btnCosmetics && this.elCosmeticsModal) {
      btnCosmetics.addEventListener('click', () => {
        this.syncCosmeticsUI();
        this.elCosmeticsModal.classList.remove('hidden');
        btnCosmetics.blur();
      });
    }
    const btnCloseCosmetics = document.getElementById('btn-close-cosmetics');
    if (btnCloseCosmetics && this.elCosmeticsModal) {
      btnCloseCosmetics.addEventListener('click', () => {
        this.elCosmeticsModal.classList.add('hidden');
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    }

    document.querySelectorAll('#class-options .class-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const clsId = btn.dataset.class;
        this.caterpillar.setBodyType(clsId);
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
        const titleEl = btn.querySelector('.class-title');
        const name = titleEl ? titleEl.textContent.trim() : clsId;
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 30, `MORPHOLOGIE : ${name}`, '#ffd93b');
      });
    });

    document.querySelectorAll('#shape-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.setBodyShape(btn.dataset.shape);
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    });

    document.querySelectorAll('#palette-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.palette = btn.dataset.palette;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    });

    document.querySelectorAll('#hat-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.hat = btn.dataset.hat;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    });

    document.querySelectorAll('#grip-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.grip = btn.dataset.grip;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    });

    document.querySelectorAll('#face-options .cos-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.caterpillar.cosmetics.face = btn.dataset.face;
        this.caterpillar.saveCosmetics();
        this.syncCosmeticsUI();
        if (this.ui) this.ui.onLocalCosmeticChanged();
      });
    });

    // Tuning Modal Events
    const btnTuning = document.getElementById('btn-tuning');
    if (btnTuning) {
      btnTuning.addEventListener('click', () => {
        this.toggleTuningModal();
        btnTuning.blur();
      });
    }

    const btnCloseTuning = document.getElementById('btn-close-tuning');
    if (btnCloseTuning) {
      btnCloseTuning.addEventListener('click', () => this.toggleTuningModal());
    }

    const btnCloseTuningX = document.getElementById('btn-close-tuning-x');
    if (btnCloseTuningX) {
      btnCloseTuningX.addEventListener('click', () => this.toggleTuningModal());
    }

    // Preset selector buttons
    document.querySelectorAll('#preset-buttons .preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pKey = btn.dataset.preset;
        applyPreset(pKey);
        this.syncTuningUI();
        sound.playGrip(true);
        const name = btn.querySelector('strong') ? btn.querySelector('strong').textContent.trim() : pKey;
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, `PRESET : ${name}`, '#38d84e');
      });
    });

    // Sliders live binding
    const bindSlider = (prop, isInt = false) => {
      const input = document.getElementById(`tune-${prop}`);
      const readout = document.getElementById(`val-${prop}`);
      if (!input) return;
      input.addEventListener('input', () => {
        const val = isInt ? parseInt(input.value, 10) : parseFloat(input.value);
        GAMEPLAY_CONFIG[prop] = val;
        if (readout) readout.textContent = val;
        saveGameplayConfig();
      });
    };

    bindSlider('gravity', true);
    bindSlider('groundSnapping', false);
    bindSlider('orientationUpForce', true);
    bindSlider('orientationResponsiveness', false);
    bindSlider('bendOrientationPower', false);
    bindSlider('jumpBoost', false);
    bindSlider('groundPushForce', false);
    bindSlider('unbendExtensionSpeed', false);
    bindSlider('unbendReachBonus', false);
    bindSlider('jumpUpAngleBonus', false);
    bindSlider('jumpChargeTime', false);
    bindSlider('gripDistance', true);
    bindSlider('omegaArchVisual', false);
    bindSlider('wigglePhysicsAmount', true);
    bindSlider('clawScale', false);

    const bindCheckbox = (id, prop) => {
      const chk = document.getElementById(id);
      if (chk) {
        chk.addEventListener('change', () => {
          GAMEPLAY_CONFIG[prop] = chk.checked;
          saveGameplayConfig();
        });
      }
    };

    bindCheckbox('tune-bendCanOrientVertically', 'bendCanOrientVertically');
    bindCheckbox('tune-preserveShapeOnBend', 'preserveShapeOnBend');
    bindCheckbox('tune-airborneExtensionOnly', 'airborneExtensionOnly');
    bindCheckbox('tune-showBadgesOverlay', 'showBadgesOverlay');

    const selBgMode = document.getElementById('tune-backgroundMode');
    if (selBgMode) {
      selBgMode.addEventListener('change', () => {
        GAMEPLAY_CONFIG.backgroundMode = selBgMode.value;
      });
    }

    // Copy config button
    const btnCopyConfig = document.getElementById('btn-copy-config');
    if (btnCopyConfig) {
      btnCopyConfig.addEventListener('click', () => {
        const json = JSON.stringify(GAMEPLAY_CONFIG, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(json).then(() => {
            btnCopyConfig.textContent = '✅ Copié dans le presse-papier !';
            setTimeout(() => { btnCopyConfig.textContent = '📋 Copier la Config'; }, 2200);
            this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 30, 'CONFIG COPIÉE ! 📋', '#ffd93b');
          }).catch(() => {
            console.log('SlipGrip Gameplay Config:\n', json);
            alert('Config copiée dans la console F12 !');
          });
        } else {
          console.log('SlipGrip Gameplay Config:\n', json);
          alert('Config affichée dans la console développeur F12 !');
        }
      });
    }

    // Save as Default button
    const btnSaveDefault = document.getElementById('btn-save-default');
    if (btnSaveDefault) {
      btnSaveDefault.addEventListener('click', () => {
        saveAsDefaultGameplayConfig();
        saveGameplayConfig();
        sound.playCheckpoint();
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, 'DÉFAUT ENREGISTRÉ ! 💾', '#ffd93b');
        btnSaveDefault.textContent = '✅ Enregistré par défaut !';
        setTimeout(() => { btnSaveDefault.textContent = '💾 Définir par Défaut'; }, 2000);
      });
    }

    // Reset tuning button
    const btnResetTuning = document.getElementById('btn-reset-tuning');
    if (btnResetTuning) {
      btnResetTuning.addEventListener('click', () => {
        resetGameplayConfig();
        this.syncTuningUI();
        sound.playBoing();
        this.particles.spawnPopup(this.caterpillar.head.x, this.caterpillar.head.y - 25, 'RÉINITIALISÉ ! 🔄', '#ff7675');
      });
    }

    // Help modal buttons
    document.getElementById('btn-help').addEventListener('click', () => {
      this.elHelpModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
      this.elHelpModal.classList.add('hidden');
    });

    // Victory modal buttons
    document.getElementById('btn-replay-lvl').addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
    });
    document.getElementById('btn-next-lvl').addEventListener('click', () => {
      const nextIdx = (this.currentLevelIndex + 1) % LEVEL_DEFINITIONS.length;
      this.loadLevel(nextIdx);
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  loadLevel(index) {
    this.currentLevelIndex = index;
    this.level = LEVEL_DEFINITIONS[index] || LEVEL_DEFINITIONS[0];

    if (!this.isMultiplayer) {
      this.caterpillar.extraAppleSegments = 0;
    }

    this.lvlButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    const soloSelect = document.getElementById('solo-level-select');
    if (soloSelect) {
      soloSelect.value = String(index);
    }

    this.world.clear();
    this.particles.clear();
    this.level.build(this.world);

    this.lastCheckpoint = {
      x: this.level.startX,
      y: this.level.startY
    };

    this.caterpillar.reset(this.level.startX, this.level.startY);
    this.world.caterpillars = [this.caterpillar, ...this.remoteCaterpillars.values()];
    this.lastHp = this.caterpillar.hp;
    this.healthVisibleTimer = 0;

    this.raceStarted = false;
    this.raceFinished = false;
    this.raceTime = 0;
    this.confettiTimer = 0;

    this.elVictoryModal.classList.add('hidden');
    this.elCoachText.innerHTML = this.level.coachHint;
    this.elBest.textContent = this.formatTime(this.bestTimes[this.level.id]);

    const com = this.caterpillar.centerOfMass;
    this.camera.focusX = com.x + 120;
    this.camera.focusY = com.y - 30;
    this.camera.x = this.camera.focusX - (this.canvas.width / this.camera.scale) * 0.36;
    this.camera.y = this.camera.focusY - (this.canvas.height / this.camera.scale) * 0.58;
  }

  respawnAtCheckpoint(reason = 'CHECKPOINT ! 🚩') {
    this.caterpillar.reset(this.lastCheckpoint.x, this.lastCheckpoint.y);
    this.caterpillar.hp = this.caterpillar.maxHp;
    this.caterpillar.invulnerableTimer = 1.0;
    this.lastHp = this.caterpillar.hp;
    this.healthVisibleTimer = 2.0;
    const com = this.caterpillar.centerOfMass;
    this.camera.focusX = com.x + 120;
    this.camera.focusY = com.y - 30;
    this.particles.spawnPopup(this.lastCheckpoint.x + 70, this.lastCheckpoint.y - 30, reason, '#ffd93b');
  }

  checkCheckpoints() {
    const head = this.caterpillar.head;
    const rear = this.caterpillar.rear;
    for (const cp of this.world.checkpoints) {
      if (!cp.activated) {
        const distHead = Math.hypot(head.x - cp.x, head.y - cp.y);
        const distRear = Math.hypot(rear.x - cp.x, rear.y - cp.y);
        // Passing a checkpoint horizontally only counts when not far below it, so
        // vertical levels can't be skipped by running underneath a high checkpoint
        // and then dying to respawn on top. Upper alternate routes still count.
        const passedAbove = head.x >= cp.x && head.y <= cp.y + CHECKPOINT_BELOW_TOLERANCE;
        if (distHead < 85 || distRear < 85 || passedAbove) {
          cp.activated = true;
          // Several checkpoints can trigger on the same frame: keep the furthest one
          if (cp.x - 60 >= this.lastCheckpoint.x) {
            this.lastCheckpoint = {
              x: cp.x - 60,
              y: cp.y - 28
            };
          }
          sound.playCheckpoint();
          this.particles.spawnConfetti(cp.x, cp.y - 70, 20);
          this.particles.spawnPopup(cp.x, cp.y - 105, `${cp.label} VALIDÉ !`, '#38d84e');
        }
      }
    }
  }

  triggerVictory() {
    this.raceFinished = true;
    sound.playVictory();

    const finishX = this.level.finishX;
    const finishY = this.level.finishY;
    this.particles.spawnConfetti(finishX, finishY - 80, 55);
    this.particles.spawnPopup(finishX, finishY - 120, 'BRAVO ! 🏁', '#ffd93b');

    const prevBest = this.bestTimes[this.level.id];
    const isNewRecord = prevBest === undefined || this.raceTime < prevBest;
    if (isNewRecord) {
      this.bestTimes[this.level.id] = this.raceTime;
      this.saveBestTimes();
    }

    this.elBest.textContent = this.formatTime(this.bestTimes[this.level.id]);

    if (this.isMultiplayer && this.network.currentRoom) {
      // Notify multiplayer server that local player crossed the finish line!
      this.network.sendPlayerFinished(this.raceTime);
      this.remoteFinishState.set(this.network.playerId, {
        finished: true,
        finishTime: this.raceTime
      });
      return;
    }

    this.elVictoryTitle.textContent = `${this.level.name} Terminé !`;
    this.elVictoryTime.textContent = this.formatTime(this.raceTime);
    this.elVictoryBest.textContent = this.formatTime(this.bestTimes[this.level.id]);
    this.elNewRecordBadge.classList.toggle('hidden', !isNewRecord);

    setTimeout(() => {
      if (this.raceFinished && !this.isMultiplayer) {
        this.elVictoryModal.classList.remove('hidden');
      }
    }, 1350);
  }

  updateHUD(dt = 0.016) {
    this.elTimer.textContent = this.formatTime(this.raceTime);
    const progress = Math.max(0, Math.min(1, (this.caterpillar.head.x - this.level.startX) / (this.level.finishX - this.level.startX)));
    const pct = (progress * 100).toFixed(1) + '%';
    this.elProgressFill.style.width = pct;
    this.elProgressBug.style.left = pct;

    // Update Multiplayer Live Standings & Track Dots
    if (this.isMultiplayer && this.ui) {
      const playersInfo = [
        {
          playerId: this.network.playerId,
          pseudo: this.network.pseudo,
          palette: this.caterpillar.cosmetics.palette,
          modifiers: this.caterpillar.modifiers,
          progress,
          finished: this.raceFinished,
          finishTime: this.raceTime,
          isLocal: true
        }
      ];
      for (const [pid, rCat] of this.remoteCaterpillars.entries()) {
        const rProg = rCat.remoteProgress !== undefined
          ? rCat.remoteProgress
          : Math.max(0, Math.min(1, (rCat.head.x - this.level.startX) / (this.level.finishX - this.level.startX)));
        const fState = this.remoteFinishState.get(pid);
        playersInfo.push({
          playerId: pid,
          pseudo: rCat.pseudo,
          palette: rCat.cosmetics.palette,
          modifiers: rCat.modifiers,
          progress: rProg,
          finished: !!(fState && fState.finished),
          finishTime: (fState && fState.finishTime) || 9999,
          isLocal: false
        });
      }
      this.ui.updateLiveRaceHUD(playersInfo);
    }

    // Health bar update (appears only on damage/healing or if <= 10% HP)
    const hp = Math.max(0, Math.round(this.caterpillar.hp));
    const maxHp = this.caterpillar.maxHp || 100;
    const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    if (this.lastHp === null) {
      this.lastHp = hp;
    } else if (Math.abs(hp - this.lastHp) >= 0.5) {
      this.healthVisibleTimer = 2.8;
      this.lastHp = hp;
    }

    if (this.healthVisibleTimer > 0) {
      this.healthVisibleTimer = Math.max(0, this.healthVisibleTimer - dt);
    }

    const isCritical = hp > 0 && (hp <= maxHp * 0.10);
    const shouldShowHealth = (this.healthVisibleTimer > 0) || isCritical;

    if (this.elHealthValue) {
      this.elHealthValue.textContent = `${hp} / ${maxHp}`;
    }
    if (this.elHealthFill) {
      this.elHealthFill.style.width = `${hpPct}%`;
    }
    if (this.elHealthCard) {
      this.elHealthCard.classList.toggle('visible', shouldShowHealth);
      this.elHealthCard.classList.toggle('critical', isCritical);
      this.elHealthCard.classList.toggle('danger', hp <= 25);
    }

    // Power-up HUD update
    if (this.elPowerUpCard) {
      const pow = this.caterpillar.activePowerUp;
      if (pow && pow.type && pow.timer > 0) {
        this.elPowerUpCard.classList.remove('hidden');
        const icons = {
          speed: '⚡',
          strength: '💪',
          giant: '🎈',
          length: '📏',
          feather: '🪶'
        };
        const colors = {
          speed: '#00d2d3',
          strength: '#ff9f43',
          giant: '#ee5253',
          length: '#10ac84',
          feather: '#54a0ff'
        };
        if (this.elPowerUpIcon) this.elPowerUpIcon.textContent = icons[pow.type] || '⭐';
        if (this.elPowerUpTimer) this.elPowerUpTimer.textContent = `${pow.timer.toFixed(1)}s`;
        if (this.elPowerUpFill) {
          const dur = pow.duration || 15.0;
          const fillPct = Math.max(0, Math.min(100, (pow.timer / dur) * 100));
          this.elPowerUpFill.style.width = `${fillPct}%`;
          this.elPowerUpFill.style.background = colors[pow.type] || '#ffd93b';
        }
        this.elPowerUpCard.style.borderColor = colors[pow.type] || '#00d2d3';
        this.elPowerUpCard.style.boxShadow = `0 4px 0 var(--card-border), 0 0 12px ${colors[pow.type] || 'rgba(0, 210, 211, 0.45)'}`;
      } else {
        this.elPowerUpCard.classList.add('hidden');
      }
    }

    this.updateAnchorWidget(this.elRearWidget, this.elStateQ, this.elIconQ, this.caterpillar.rearAnchor, '🟣');
    this.updateAnchorWidget(this.elFrontWidget, this.elStateD, this.elIconD, this.caterpillar.frontAnchor, '🟢');

    const omegaPct = Math.round(this.caterpillar.omegaCharge * 100);
    this.elOmegaPct.textContent = `${omegaPct}%`;
    this.elOmegaFill.style.width = `${omegaPct}%`;

    this.elComLeft.classList.toggle('active', this.inputs.left);
    this.elComRight.classList.toggle('active', this.inputs.right);
  }

  updateAnchorWidget(widgetEl, stateEl, iconEl, anchor, defaultIcon) {
    widgetEl.classList.remove('anchored', 'armed', 'slipping', 'stuck');

    if (anchor.stuckCrumb) {
      widgetEl.classList.add('stuck');
      stateEl.textContent = 'ENGLUÉE !';
      iconEl.textContent = '🍯';
    } else if (anchor.playerRef) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = `AGRIPPÉE (${anchor.playerRef.pseudo || 'RIVAL'} !)`;
      iconEl.textContent = '🤼';
    } else if (anchor.hedgehogRef) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = 'AGRIPPÉE (HÉRISSON !)';
      iconEl.textContent = '🦔';
    } else if (anchor.aphidRef) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = 'AGRIPPÉE (PUCERON)';
      iconEl.textContent = '🐛';
    } else if (anchor.propRef) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = anchor.propRef.type === 'pinecone' ? 'AGRIPPÉE (POMME DE PIN)' : 'AGRIPPÉE (GLAND)';
      iconEl.textContent = '🌰';
    } else if (anchor.anchored && anchor.slipping) {
      widgetEl.classList.add('slipping');
      stateEl.textContent = 'GLISSE !';
      iconEl.textContent = '🫧';
    } else if (anchor.anchored) {
      widgetEl.classList.add('anchored');
      stateEl.textContent = 'AGRIPPÉE AU SOL';
      iconEl.textContent = defaultIcon;
    } else if (anchor.holdingKey) {
      widgetEl.classList.add('armed');
      stateEl.textContent = 'CHERCHE LE SOL...';
      iconEl.textContent = '🧲';
    } else {
      stateEl.textContent = 'LIBRE (RELÂCHÉE)';
      iconEl.textContent = '⚪';
    }
  }

  update(dt) {
    this.globalTime += dt;

    if (this.raceStarted && !this.raceFinished) {
      this.raceTime += dt;
    }

    // Race Start Intro Cinematic & Arcade Countdown
    if (this.introCinematicTimer > -0.6) {
      this.introCinematicTimer -= dt;
      const duration = this.introCinematicDuration || 3.2;
      const p = Math.max(0, Math.min(1, 1 - (this.introCinematicTimer / duration)));
      // Cubic ease-in-out smoothstep
      const smoothP = p * p * (3 - 2 * p);

      // Smoothly zoom in from 0.38 to 0.62
      this.camera.scale = 0.38 + (0.62 - 0.38) * smoothP;

      const com = this.caterpillar.centerOfMass;
      const startFocusX = com.x + 360;
      const startFocusY = com.y - 80;
      const targetFocusX = com.x + 120;
      const targetFocusY = com.y - 30;

      this.camera.focusX = startFocusX + (targetFocusX - startFocusX) * smoothP;
      this.camera.focusY = startFocusY + (targetFocusY - startFocusY) * smoothP;

      const overlay = document.getElementById('race-countdown-overlay');
      const textEl = document.getElementById('race-countdown-text');
      const subEl = document.getElementById('race-countdown-sub');

      // Countdown stages (3 -> 2 -> 1 -> PARTEZ !)
      if (this.introCinematicTimer > 2.2) {
        if (this.introCountdownStage !== 3) {
          this.introCountdownStage = 3;
          if (textEl) {
            textEl.textContent = '3';
            textEl.className = 'race-countdown-text';
          }
          if (subEl) subEl.textContent = 'À VOS MARQUES...';
          sound.playCountdownPip(false);
        }
      } else if (this.introCinematicTimer > 1.2) {
        if (this.introCountdownStage !== 2) {
          this.introCountdownStage = 2;
          if (textEl) {
            textEl.textContent = '2';
            textEl.className = 'race-countdown-text';
          }
          if (subEl) subEl.textContent = 'PRÊTS...';
          sound.playCountdownPip(false);
        }
      } else if (this.introCinematicTimer > 0.2) {
        if (this.introCountdownStage !== 1) {
          this.introCountdownStage = 1;
          if (textEl) {
            textEl.textContent = '1';
            textEl.className = 'race-countdown-text';
          }
          if (subEl) subEl.textContent = 'ATTENTION...';
          sound.playCountdownPip(false);
        }
      } else if (this.introCinematicTimer > -0.6) {
        if (this.introCountdownStage !== 0) {
          this.introCountdownStage = 0;
          this.raceStarted = true;
          if (textEl) {
            textEl.textContent = 'PARTEZ ! 🏁';
            textEl.className = 'race-countdown-text go';
          }
          if (subEl) subEl.textContent = "C'EST PARTI !";
          sound.playCountdownPip(true);
          this.particles.spawnConfetti(com.x, com.y - 40, 24);
        }
      }

      if (this.introCinematicTimer <= -0.6) {
        if (overlay) overlay.classList.add('hidden');
        this.introCinematicTimer = -1;
      }
    }

    // Keep world caterpillars list up to date for shared PvP physics
    this.world.caterpillars = [this.caterpillar, ...this.remoteCaterpillars.values()];

    this.world.update(dt, this.particles);

    // Suppress movement inputs during countdown until GO
    const effectiveInputs = (this.introCinematicTimer > 0.2)
      ? { front: false, rear: false, space: false, left: false, right: false, up: false, down: false }
      : this.inputs;

    if (this.introCinematicTimer > 0.2) {
      if (this.caterpillar.rearAnchor) this.caterpillar.rearAnchor.anchored = true;
      if (this.caterpillar.frontAnchor) this.caterpillar.frontAnchor.anchored = true;
      if (this.caterpillar.rear) {
        this.caterpillar.rear.vx = 0;
        this.caterpillar.rear.vy = 0;
      }
      if (this.caterpillar.head) {
        this.caterpillar.head.vx = 0;
        this.caterpillar.head.vy = 0;
      }
    }

    this.caterpillar.update(dt, this.world, effectiveInputs, this.particles);

    // Update remote caterpillars interpolation
    for (const rCat of this.remoteCaterpillars.values()) {
      rCat.updateRemote(dt);
    }

    this.particles.update(dt);

    // Broadcast local caterpillar state at 25Hz in multiplayer
    if (this.isMultiplayer && this.network.currentRoom) {
      this.netSyncTimer += dt;
      if (this.netSyncTimer >= 0.04) {
        this.netSyncTimer = 0;
        const progress = Math.max(0, Math.min(1, (this.caterpillar.head.x - this.level.startX) / (this.level.finishX - this.level.startX)));
        this.network.sendPlayerState(this.caterpillar.serializeState(progress));
      }

      // Authoritative room host synchronizes all enemies and objects at 12Hz
      if (this.network.isHost()) {
        this.netWorldSyncTimer = (this.netWorldSyncTimer || 0) + dt;
        if (this.netWorldSyncTimer >= 0.08) {
          this.netWorldSyncTimer = 0;
          this.network.sendWorldSync(this.serializeWorldState());
        }
      }
    }

    this.checkCheckpoints();

    const com = this.caterpillar.centerOfMass;
    if (this.caterpillar.hp <= 0) {
      sound.playBoing();
      this.particles.spawnPopup(com.x, com.y - 30, 'K.O. ! 💥', '#ff4757');
      this.respawnAtCheckpoint('RÉAPPARITION ! ❤️');
      return;
    }

    if (com.y > 1280) {
      sound.playBoing();
      this.particles.spawnPopup(com.x, com.y - 30, 'CHUTE DANS LE VIDE ! 🕳️', '#ff4757');
      this.respawnAtCheckpoint('RÉAPPARITION ! ❤️');
      return;
    }

    const head = this.caterpillar.head;
    if (!this.raceFinished && head.x >= this.level.finishX && head.y <= this.level.finishY + CHECKPOINT_BELOW_TOLERANCE) {
      this.triggerVictory();
    }

    if (this.raceFinished) {
      this.confettiTimer += dt;
      if (this.confettiTimer > 0.65) {
        this.confettiTimer = 0;
        this.particles.spawnConfetti(this.level.finishX, this.level.finishY - 70, 22);
      }
    }

    // Ultra-calm Deadzone Camera (active after intro cinematic)
    if (this.introCinematicTimer <= 0) {
      this.camera.scale = 0.62;
      const deadzoneRight = 160;
      const deadzoneLeft = 140;
      const deadzoneY = 140;

      if (com.x > this.camera.focusX + deadzoneRight) {
        this.camera.focusX = com.x - deadzoneRight;
      } else if (com.x < this.camera.focusX - deadzoneLeft) {
        this.camera.focusX = com.x + deadzoneLeft;
      }

      if (com.y > this.camera.focusY + deadzoneY) {
        this.camera.focusY = com.y - deadzoneY;
      } else if (com.y < this.camera.focusY - deadzoneY) {
        this.camera.focusY = com.y + deadzoneY;
      }
    }

    const viewW = this.canvas.width / this.camera.scale;
    const viewH = this.canvas.height / this.camera.scale;

    const targetCamX = this.camera.focusX - viewW * 0.36;
    const targetCamY = this.camera.focusY - viewH * 0.58;

    this.camera.x += (targetCamX - this.camera.x) * Math.min(1, dt * 2.2);
    this.camera.y += (targetCamY - this.camera.y) * Math.min(1, dt * 2.0);
    this.camera.y = Math.max(-680, Math.min(480, this.camera.y));

    this.updateHUD(dt);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    this.renderer.drawBackground(ctx, w, h, this.camera.x * this.camera.scale, this.camera.y * this.camera.scale, this.level, this.globalTime);

    ctx.save();
    ctx.scale(this.camera.scale, this.camera.scale);
    ctx.translate(-this.camera.x, -this.camera.y);

    this.renderer.drawWorld(ctx, this.world, this.level, this.globalTime, this.raceFinished);

    // Draw all remote caterpillars in the same shared world
    for (const rCat of this.remoteCaterpillars.values()) {
      rCat.draw(ctx, this.globalTime);
    }

    // Draw local caterpillar on top
    this.caterpillar.draw(ctx, this.globalTime);
    this.particles.draw(ctx);

    ctx.restore();
  }

  pauseGameLoop() {
    this.isGameRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  resumeGameLoop() {
    if (this.isGameRunning) return;
    this.isGameRunning = true;
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  loop(now) {
    if (!this.isGameRunning) {
      this.rafId = null;
      return;
    }
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(dt);
    this.draw();

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.slipGripGame = new SlipGripGame();
});
