// js/caterpillar.js — Viscous Arcade Larval Caterpillar with Configurable Physics & Responsive Controls
import { MATERIALS } from './physics.js';
import { sound } from './audio.js';
import { GAMEPLAY_CONFIG, CATERPILLAR_CLASSES, BODY_SHAPES, RACE_MODIFIERS, GRIP_STYLES } from './gameplayConfig.js';

export const COSMETIC_PALETTES = {
  emerald: {
    name: 'Vert Pomme',
    bodyTop: '#8cf5ab',
    bodyFill: '#33d977',
    bodyShade: '#1ca350',
    belly: '#eefcd2',
    spots: '#fffa75',
    outline: '#13361f',
    cheek: '#ff7675'
  },
  monarch: {
    name: 'Monarque Zébré',
    bodyTop: '#ffa502',
    bodyFill: '#ff7f50',
    bodyShade: '#2f3542',
    belly: '#ffffff',
    spots: '#ffffff',
    outline: '#1e272e',
    cheek: '#ff4757',
    isStriped: true
  },
  axolotl: {
    name: 'Rose Bonbon',
    bodyTop: '#ffd4e4',
    bodyFill: '#ff85b3',
    bodyShade: '#d94b82',
    belly: '#fff2f7',
    spots: '#ffffff',
    outline: '#3b1224',
    cheek: '#ff3864'
  },
  pastel_blue: {
    name: 'Bleu Lagon',
    bodyTop: '#b3ebff',
    bodyFill: '#48dbfb',
    bodyShade: '#0abde3',
    belly: '#ebfcff',
    spots: '#fff275',
    outline: '#102e45',
    cheek: '#ff85a2'
  },
  amber: {
    name: 'Mandarine',
    bodyTop: '#ffc88a',
    bodyFill: '#ff9f43',
    bodyShade: '#e07516',
    belly: '#fff7de',
    spots: '#fff200',
    outline: '#301805',
    cheek: '#ff5252'
  },
  cosmic: {
    name: 'Nébuleuse',
    bodyTop: '#e0d6ff',
    bodyFill: '#a29bfe',
    bodyShade: '#6c5ce7',
    belly: '#f5f0ff',
    spots: '#ffeaa7',
    outline: '#211340',
    cheek: '#ff70a6'
  },
  solar: {
    name: 'Soleil Doré',
    bodyTop: '#fff59e',
    bodyFill: '#ffd32a',
    bodyShade: '#f09300',
    belly: '#fffbeb',
    spots: '#ffffff',
    outline: '#362404',
    cheek: '#ff595e'
  },
  shadow: {
    name: 'Ombre Nocturne',
    bodyTop: '#57606f',
    bodyFill: '#2f3542',
    bodyShade: '#1e272e',
    belly: '#70a1ff',
    spots: '#7bed9f',
    outline: '#000000',
    cheek: '#ff6b81'
  },
  ruby: {
    name: 'Rubis Flamme',
    bodyTop: '#ff6b6b',
    bodyFill: '#ee5253',
    bodyShade: '#c0392b',
    belly: '#ffeaa7',
    spots: '#ffd32a',
    outline: '#2c000e',
    cheek: '#ff4757'
  }
};

// After a jump, feet can't re-grip for this long (s) even if Q/D are still held
const JUMP_NO_GRIP_TIME = 0.25;

export class Caterpillar {
  constructor(startX, startY, options = {}) {
    this.playerId = options.playerId || null;
    this.pseudo = options.pseudo || '';
    this.isRemote = !!options.isRemote;
    this.modifiers = Array.isArray(options.modifiers) ? [...options.modifiers] : [];
    this.roomConfig = options.roomConfig || null;
    this.onThrowEntityCallback = options.onThrowEntityCallback || null;
    this.onPvpActionCallback = options.onPvpActionCallback || null;

    this.cosmetics = {
      palette: 'emerald',
      hat: 'cap',
      face: 'cute',
      grip: 'classic',
      bodyType: 'classique',
      bodyShape: 'larve'
    };
    if (!this.isRemote) {
      this.loadCosmetics();
    } else if (options.cosmetics) {
      Object.assign(this.cosmetics, options.cosmetics);
    }
    this.loadAppleSegments();

    this.nodes = [];
    this.applyBodyClass(this.cosmetics.bodyType || 'classique', false);

    this.rearAnchor = this.createEmptyAnchor(startX, startY);
    this.frontAnchor = this.createEmptyAnchor(startX + this.fullLength, startY);

    // Pure longitudinal contraction state (0 = extended, 1 = contracted)
    this.contraction = 0;
    this.wasSpaceHeld = false;
    this.storedContraction = 0;
    this.chargeDuration = 0;
    this.hadAnchorDuringContraction = false;

    // Visual proximity detection for Q and D overlays
    this.rearCanGrip = false;
    this.frontCanGrip = false;
    this.rearTargetPt = null;
    this.frontTargetPt = null;

    // Body rigidification: 0 in normal viscous state, >0 ONLY when pressing/releasing SPACE!
    this.bodyRigidity = 0;
    this.rigidityTimer = 0;

    this.lastInputs = {
      space: false,
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.extensionMomentum = {
      timer: 0,
      power: 0,
      consumed: false
    };
    this.extensionTimer = 0;
    this.hopTimer = 0;

    this.wiggleTime = 0;
    this.crawlPhase = 0;
    this.cameraFocus = { x: startX + 69, y: startY };

    // Rearing and bending posture tracking (tail segment stays anchored to surface)
    this.rearingProgress = 0;
    this.freeRearingProg = 0;
    this.rearingTargetAngle = -Math.PI / 2;
    this.rearingSmoothedAngle = -Math.PI / 2;

    this.expression = 'happy';
    this.blinkTimer = 2.0;
    this.propellerAngle = 0;
    this.dorsalSign = 1;
    this.whipCrackTimer = 0;
    this.whipPower = 0;
    this.whipDir = { x: 0, y: 0 };
    this.whipHitEntities = new Set();

    this.reset(startX, startY);
  }

  getDefaultRadius(cls, i, totalNodes) {
    const radii = (cls && cls.radii) || [14.0, 16.5, 17.5, 16.5, 17.5];
    if (radii.length === 0) return 16;
    if (i === 0) return radii[0];
    if (i === totalNodes - 1) return radii[radii.length - 1];
    if (radii.length <= 2) return radii[0];
    const mid = radii.slice(1, -1);
    return mid[(i - 1) % mid.length];
  }

  loadAppleSegments() {
    this.extraAppleSegments = 0;
    try {
      localStorage.removeItem('slipgrip_apple_segments');
    } catch {
      // Ignore storage error
    }
  }

  saveAppleSegments() {
    // Session only: do not persist extra segments to localStorage
  }

  // Geometridae (inchworm) contraction: the body keeps its length while its two ends
  // come together, so the spine is laid on a circular arc whose chord shrinks with
  // the contraction. Past a half circle the arc bulges wider than its base: the Ω.
  // Gait: grip the head (D), hold Space (the tail is drawn up under the loop), grip
  // the tail (Q), let go of the head and Space: the body unrolls far ahead.
  applyOmegaLoop(segLen, locks) {
    const N = this.nodes.length;
    const rear = this.nodes[0];
    const head = this.nodes[N - 1];
    const L = segLen * (N - 1);
    const OMEGA_CLOSE = 0.8; // at full contraction the feet are 20% of the body length apart
    const targetChord = L * (1 - OMEGA_CLOSE * this.contraction);

    let ux = head.x - rear.x;
    let uy = head.y - rear.y;
    const cur = Math.hypot(ux, uy) || 1;
    ux /= cur;
    uy /= cur;

    // 1. Draw the free foot (or both) toward the target chord length
    const END_PULL = 0.35;
    const delta = (cur - targetChord) * END_PULL;
    if (locks.rear && !locks.front) {
      head.x -= ux * delta;
      head.y -= uy * delta;
    } else if (locks.front && !locks.rear) {
      rear.x += ux * delta;
      rear.y += uy * delta;
    } else if (!locks.rear && !locks.front) {
      head.x -= ux * delta * 0.5;
      head.y -= uy * delta * 0.5;
      rear.x += ux * delta * 0.5;
      rear.y += uy * delta * 0.5;
    }

    const chord = Math.hypot(head.x - rear.x, head.y - rear.y) || 1;
    ux = (head.x - rear.x) / chord;
    uy = (head.y - rear.y) / chord;
    if (chord >= L * 0.995) return;

    // 2. Half-angle φ of the arc of length L spanning the chord: sin(φ)/φ = chord/L
    const ratio = chord / L;
    let lo = 0.0001;
    let hi = Math.PI - 0.0001;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) * 0.5;
      if (Math.sin(mid) / mid > ratio) lo = mid;
      else hi = mid;
    }
    const phi = (lo + hi) * 0.5;
    const r = L / (2 * phi);

    // 3. Bulge side: away from the gripped surface, else keep the current bulge, else up
    let vx = -uy;
    let vy = ux;
    const grip = locks.front ? this.frontAnchor : (locks.rear ? this.rearAnchor : null);
    let side = 0;
    if (grip && grip.nx !== undefined) {
      side = Math.sign(vx * grip.nx + vy * grip.ny);
    }
    if (!side) {
      let bulge = 0;
      for (let i = 1; i < N - 1; i++) {
        bulge += (this.nodes[i].x - rear.x) * vx + (this.nodes[i].y - rear.y) * vy;
      }
      side = Math.abs(bulge) > 4 ? Math.sign(bulge) : (vy < 0 ? 1 : -1);
    }
    vx *= side;
    vy *= side;

    // 4. Pull every free node toward its place on the arc
    const mx = (rear.x + head.x) * 0.5;
    const my = (rear.y + head.y) * 0.5;
    const ARC_PULL = 0.4;
    for (let i = 0; i < N; i++) {
      const pinned = (i === 0 && locks.rear) || (i === 1 && locks.rearSeg) ||
                     (i === N - 1 && locks.front) || (i === N - 2 && locks.frontSeg);
      if (pinned) continue;
      const a = phi - 2 * phi * (i / (N - 1));
      const along = -r * Math.sin(a);
      const lift = r * Math.cos(a) - r * Math.cos(phi);
      const tx = mx + ux * along + vx * lift;
      const ty = my + uy * along + vy * lift;
      const n = this.nodes[i];
      n.x += (tx - n.x) * ARC_PULL;
      n.y += (ty - n.y) * ARC_PULL;
    }
  }

  // Current species data (see CATERPILLAR_CLASSES for the meaning of each field)
  getSpecies() {
    return this.bodyClass || CATERPILLAR_CLASSES.classique;
  }

  // Compute combined multipliers from roomConfig and cumulative race modifiers
  getModifierStats() {
    let scaleMult = (this.roomConfig && this.roomConfig.startScale) ? this.roomConfig.startScale : 1.0;
    let massMult = 1.0;
    let hpBonus = 0;
    let speedMult = 1.0;
    let jumpMult = (this.roomConfig && this.roomConfig.jumpBoost) ? this.roomConfig.jumpBoost : 1.0;
    let extraSegments = 0;
    let reachMult = 1.0;
    let gravityMult = 1.0;
    let strengthMult = 1.0;

    if (this.roomConfig && this.roomConfig.startSegments !== undefined) {
      extraSegments += (this.roomConfig.startSegments - 5);
    }

    if (Array.isArray(this.modifiers)) {
      for (const modId of this.modifiers) {
        const mod = RACE_MODIFIERS[modId];
        if (!mod) continue;
        scaleMult *= (mod.scaleMult || 1.0);
        massMult *= (mod.massMult || 1.0);
        hpBonus += (mod.hpBonus || 0);
        speedMult *= (mod.speedMult || 1.0);
        jumpMult *= (mod.jumpMult || 1.0);
        extraSegments += (mod.extraSegments || 0);
        reachMult *= (mod.reachMult || 1.0);
        gravityMult *= (mod.gravityMult || 1.0);
        strengthMult *= (mod.strengthMult || 1.0);
      }
    }

    return {
      scaleMult,
      massMult,
      hpBonus,
      speedMult,
      jumpMult,
      extraSegments,
      reachMult,
      gravityMult,
      strengthMult,
      extraGrip: 0
    };
  }

  setModifiers(modIds = [], roomConfig = null) {
    this.modifiers = Array.isArray(modIds) ? [...modIds] : [];
    if (roomConfig) this.roomConfig = roomConfig;
    this.applyBodyClass(this.cosmetics.bodyType || 'classique', true);
  }

  applyBodyClass(typeId, morphExisting = false) {
    const cls = CATERPILLAR_CLASSES[typeId] || CATERPILLAR_CLASSES.classique;
    this.bodyClass = cls;
    this.cosmetics.bodyType = cls.id;
    const mStats = this.getModifierStats();
    const reachMult = (GAMEPLAY_CONFIG.unbendReachBonus || 1.0) * mStats.reachMult;
    this.extendedSegLen = cls.extendedSegLen * reachMult;
    this.contractedSegLen = cls.contractedSegLen;
    const targetNum = Math.max(4, Math.min(12, cls.numNodes + (this.extraAppleSegments || 0) + mStats.extraSegments));
    this.fullLength = this.extendedSegLen * (targetNum - 1);
    this.sizeScale = mStats.scaleMult;

    if (morphExisting && this.nodes && this.nodes.length > 0) {
      const oldLen = this.nodes.length;
      const newNodes = [];
      for (let i = 0; i < targetNum; i++) {
        const t = targetNum > 1 ? (i / (targetNum - 1)) : 0;
        const u = t * (oldLen - 1);
        const idx = Math.min(oldLen - 2, Math.floor(u));
        const f = u - idx;
        const nA = this.nodes[idx];
        const nB = this.nodes[Math.min(oldLen - 1, idx + 1)];
        newNodes.push({
          index: i,
          x: nA.x + (nB.x - nA.x) * f,
          y: nA.y + (nB.y - nA.y) * f,
          vx: nA.vx + (nB.vx - nA.vx) * f,
          vy: nA.vy + (nB.vy - nA.vy) * f,
          r: this.getDefaultRadius(cls, i, targetNum) * mStats.scaleMult,
          mass: (cls.massMult || 1.0) * mStats.massMult,
          onGround: nA.onGround || nB.onGround,
          groundSlopeGrade: nA.groundSlopeGrade,
          groundNx: nA.groundNx,
          groundNy: nA.groundNy,
          groundMaterial: nA.groundMaterial
        });
      }
      this.nodes = newNodes;
      this.numNodes = targetNum;
      if (this.rearAnchor.anchored) {
        this.rearAnchor.x = this.nodes[0].x;
        this.rearAnchor.y = this.nodes[0].y;
      }
      if (this.frontAnchor.anchored) {
        this.frontAnchor.x = this.nodes[targetNum - 1].x;
        this.frontAnchor.y = this.nodes[targetNum - 1].y;
      }
    } else {
      this.numNodes = targetNum;
    }
  }

  setBodyType(typeId) {
    this.applyBodyClass(typeId, true);
    this.saveCosmetics();
  }

  setBodyShape(shapeId) {
    if (BODY_SHAPES[shapeId]) {
      this.cosmetics.bodyShape = shapeId;
      this.saveCosmetics();
    }
  }

  createEmptyAnchor(x, y) {
    return {
      holdingKey: false,
      noGripTimer: 0,
      anchored: false,
      slipping: false,
      propRef: null,
      aphidRef: null,
      hedgehogRef: null,
      playerRef: null,
      playerNodeIndex: 0,
      propLocalAngle: 0,
      stuckCrumb: null,
      stuckStrength: 0,
      stuckCooldown: 0,
      x,
      y,
      nx: 0,
      ny: -1,
      tx: 1,
      ty: 0,
      segRef: null,
      localPt: null,
      material: 'dirt'
    };
  }

  takeDamage(amount, knockX = 0, knockY = -180, particles = null, sound = null, detachAnchors = false) {
    if (this.activePowerUp && this.activePowerUp.type === 'giant') {
      if (particles) {
        particles.spawnPopup(this.head.x, this.head.y - 28, 'INVULNÉRABLE ! 🛡️', '#ffd93b');
      }
      return false;
    }
    if (this.invulnerableTimer > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = 1.3;
    this.expression = 'scared';

    if (detachAnchors) {
      if (this.rearAnchor.aphidRef) this.rearAnchor.aphidRef.isHeld = false;
      if (this.rearAnchor.hedgehogRef) this.rearAnchor.hedgehogRef.isHeld = false;
      if (this.rearAnchor.antRef) this.rearAnchor.antRef.isHeld = false;
      this.rearAnchor.anchored = false;
      this.rearAnchor.propRef = null;
      this.rearAnchor.aphidRef = null;
      this.rearAnchor.hedgehogRef = null;
      this.rearAnchor.antRef = null;
      this.rearAnchor.playerRef = null;
      if (this.frontAnchor.aphidRef) this.frontAnchor.aphidRef.isHeld = false;
      if (this.frontAnchor.hedgehogRef) this.frontAnchor.hedgehogRef.isHeld = false;
      if (this.frontAnchor.antRef) this.frontAnchor.antRef.isHeld = false;
      this.frontAnchor.anchored = false;
      this.frontAnchor.propRef = null;
      this.frontAnchor.aphidRef = null;
      this.frontAnchor.hedgehogRef = null;
      this.frontAnchor.antRef = null;
      this.frontAnchor.playerRef = null;
    }

    const mStats = this.getModifierStats();
    const totalMass = mStats.massMult * (this.getSpecies().massMult || 1.0);
    const kbResist = Math.max(0.45, Math.min(1.5, 1 / Math.sqrt(totalMass)));

    for (let i = 0; i < this.numNodes; i++) {
      this.nodes[i].vx += knockX * 0.8 * kbResist;
      this.nodes[i].vy += knockY * 0.8 * kbResist;
      this.nodes[i].onGround = false;
    }

    if (sound) sound.playSticky(false);
    if (particles) {
      particles.spawnPopup(this.head.x, this.head.y - 28, `-${amount} ❤️`, '#ff4757');
      particles.spawnMud(this.head.x, this.head.y, 0, -1, 8, 0.75);
    }
    return true;
  }

  applyPowerUp(type, duration = 15.0, particles = null, sound = null) {
    const finalDuration = type === 'feather' ? Math.min(duration, 3.0) : duration;
    this.activePowerUp = {
      type,
      timer: finalDuration,
      duration: finalDuration
    };

    const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
    const mStats = this.getModifierStats();

    if (type === 'giant') {
      this.sizeScale = 1.45 * mStats.scaleMult;
      for (let i = 0; i < this.numNodes; i++) {
        if (this.nodes[i]) this.nodes[i].r = this.getDefaultRadius(cls, i, this.numNodes) * this.sizeScale;
      }
    } else {
      this.sizeScale = mStats.scaleMult;
      for (let i = 0; i < this.numNodes; i++) {
        if (this.nodes[i]) this.nodes[i].r = this.getDefaultRadius(cls, i, this.numNodes) * this.sizeScale;
      }
    }

    if (sound) sound.playCheckpoint();
    if (particles) {
      const labels = {
        speed: '⚡ VITESSE MAX !',
        strength: '💪 SUPER FORCE !',
        giant: '🎈 TAILLE COLOSSALE !',
        length: '📏 LONGUEUR MAX !',
        feather: '🪶 VOLTIGE LÉGÈRE !'
      };
      const colors = {
        speed: '#00d2d3',
        strength: '#ff9f43',
        giant: '#ee5253',
        length: '#10ac84',
        feather: '#54a0ff'
      };
      particles.spawnPopup(this.head.x, this.head.y - 36, labels[type] || 'BONUS !', colors[type] || '#ffd93b');
      particles.spawnConfetti(this.head.x, this.head.y - 10, 16);
    }
  }

  healFromApple(amount = 20, particles = null) {
    const prevHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const healed = Math.round(this.hp - prevHp);
    this.expression = 'happy';
    if (sound) sound.playCheckpoint();
    if (particles) {
      const label = healed > 0 ? `+${healed} ❤️ SOIN ! 🍎` : `PV MAX (+20 ❤️) ! 🍎`;
      particles.spawnPopup(this.head.x, this.head.y - 30, label, '#ff6b81');
      particles.spawnConfetti(this.head.x, this.head.y - 10, 14);
    }
  }

  resetProgression() {
    this.extraAppleSegments = 0;
    this.modifiers = [];
    this.activePowerUp = {
      type: null,
      timer: 0,
      duration: 15.0
    };
  }

  addPermanentSegment(particles) {
    this.extraAppleSegments = (this.extraAppleSegments || 0) + 1;

    const N = this.nodes.length;
    const preHead = this.nodes[N - 2];
    const head = this.nodes[N - 1];
    const mx = (preHead.x + head.x) * 0.5;
    const my = (preHead.y + head.y) * 0.5;
    const midR = (preHead.r + head.r) * 0.5;
    const newNode = {
      index: N - 1,
      x: mx,
      y: my,
      prevX: mx,
      prevY: my,
      vx: (preHead.vx + head.vx) * 0.5,
      vy: (preHead.vy + head.vy) * 0.5,
      r: midR,
      mass: 1.0,
      onGround: false
    };
    head.index = N;
    this.nodes.splice(N - 1, 0, newNode);
    this.numNodes = this.nodes.length;
    this.fullLength = this.extendedSegLen * (this.numNodes - 1);
    const mStats = this.getModifierStats();
    this.maxHp = 100 + (this.extraAppleSegments || 0) * 10 + mStats.hpBonus;
    this.hp = Math.min(this.maxHp, this.hp + 20);
    this.expression = 'happy';
    if (sound) sound.playCheckpoint();
    if (particles) {
      particles.spawnPopup(this.head.x, this.head.y - 30, `+1 SEGMENT (Total: ${this.numNodes}) ! 🍏`, '#38d84e');
      particles.spawnConfetti(this.head.x, this.head.y - 10, 25);
    }
  }

  loadCosmetics() {
    try {
      const saved = localStorage.getItem('slipgrip_cosmetics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.palette && COSMETIC_PALETTES[parsed.palette]) this.cosmetics.palette = parsed.palette;
        if (parsed.hat) this.cosmetics.hat = parsed.hat;
        if (parsed.face) this.cosmetics.face = parsed.face;
        if (parsed.grip && GRIP_STYLES[parsed.grip]) this.cosmetics.grip = parsed.grip;
        if (parsed.bodyType && CATERPILLAR_CLASSES[parsed.bodyType]) this.cosmetics.bodyType = parsed.bodyType;
        if (parsed.bodyShape && BODY_SHAPES[parsed.bodyShape]) this.cosmetics.bodyShape = parsed.bodyShape;
      }
    } catch {
      // Ignore storage error
    }
  }

  saveCosmetics() {
    if (this.isRemote) return;
    try {
      localStorage.setItem('slipgrip_cosmetics', JSON.stringify(this.cosmetics));
    } catch {
      // Ignore storage error
    }
  }

  reset(startX, startY) {
    const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
    const mStats = this.getModifierStats();
    const roomDelta = typeof this.roomStartSegments === 'number' ? (this.roomStartSegments - 5) : 0;
    this.numNodes = Math.max(4, Math.min(12, cls.numNodes + roomDelta + (this.extraAppleSegments || 0) + mStats.extraSegments));
    const reachMult = (GAMEPLAY_CONFIG.unbendReachBonus || 1.0) * mStats.reachMult;
    this.extendedSegLen = cls.extendedSegLen * reachMult;
    this.contractedSegLen = cls.contractedSegLen;
    this.fullLength = this.extendedSegLen * (this.numNodes - 1);

    this.maxHp = 100 + (this.extraAppleSegments || 0) * 10 + mStats.hpBonus;
    this.hp = this.maxHp;
    this.invulnerableTimer = 0;

    this.activePowerUp = {
      type: null,
      timer: 0,
      duration: 15.0
    };
    this.sizeScale = mStats.scaleMult;
    this.jumpCooldown = 0;

    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      const x = startX + i * this.extendedSegLen;
      const y = startY;
      this.nodes.push({
        index: i,
        x,
        y,
        vx: 0,
        vy: 0,
        r: this.getDefaultRadius(cls, i, this.numNodes) * mStats.scaleMult,
        mass: (cls.massMult || 1.0) * mStats.massMult,
        onGround: false,
        groundSlopeGrade: 0,
        groundNx: 0,
        groundNy: -1,
        groundMaterial: 'dirt'
      });
    }

    this.rearAnchor = this.createEmptyAnchor(startX, startY);
    this.frontAnchor = this.createEmptyAnchor(startX + this.fullLength, startY);

    this.contraction = 0;
    this.wasSpaceHeld = false;
    this.storedContraction = 0;
    this.hadAnchorDuringContraction = false;
    this.hadRearAnchorDuringContraction = false;
    this.hadFrontAnchorDuringContraction = false;
    this.launchedFromHead = false;
    this.chargeDuration = 0;
    this.chargeShake = 0;
    this.wasFullyCharged = false;
    this.launchSpineDir = null;
    this.launchSpinePower = 0;
    this.flipCooldown = 0;
    this.bodyRigidity = 0;
    this.rigidityTimer = 0;
    this.dorsalSign = 1;
    this.whipCrackTimer = 0;
    this.whipPower = 0;
    this.whipDir = { x: 0, y: 0 };
    if (this.whipHitEntities) this.whipHitEntities.clear();
    else this.whipHitEntities = new Set();
    this.lastInputs = {
      space: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    this.extensionMomentum = {
      timer: 0,
      power: 0,
      consumed: false
    };
    this.extensionTimer = 0;
    this.hopTimer = 0;

    this.wiggleTime = 0;
    this.crawlPhase = 0;

    this.rearingProgress = 0;
    this.freeRearingProg = 0;
    this.rearingTargetAngle = -Math.PI / 2;
    this.rearingSmoothedAngle = -Math.PI / 2;

    this.cameraFocus = { x: startX + 69, y: startY };
    this.expression = 'happy';
  }

  get rear() {
    return this.nodes && this.nodes.length > 0 ? this.nodes[0] : null;
  }

  get tail() {
    return this.rear;
  }

  get head() {
    return this.nodes && this.nodes.length > 0 ? this.nodes[this.nodes.length - 1] : null;
  }

  get omegaCharge() {
    const maxChargeTime = Math.max(0.5, GAMEPLAY_CONFIG.jumpChargeTime || 3.0);
    return Math.min(1.0, this.chargeDuration / maxChargeTime);
  }

  get centerOfMass() {
    return this.cameraFocus;
  }

  isHoldingMovable(anchor) {
    if (!anchor || !anchor.anchored) return false;
    if (anchor.hedgehogRef || anchor.aphidRef || anchor.antRef || anchor.playerRef) return true;
    const mStats = this.getModifierStats();
    const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') || mStats.strengthMult > 1.35;
    if (anchor.propRef && (anchor.propRef.type === 'acorn' || anchor.propRef.mass < 15 || hasStrength)) return true;
    return false;
  }

  // Orient body dorsal/ventral sign so legs and claws face the supporting surface:
  // "quand on accroche une surface on retourne le corps dans le sens de cette surface afin que les griffes soient du coté de la surface"
  alignDorsalToSurface(anchor, isFront) {
    if (!anchor || anchor.nx === undefined) return;
    const N = this.numNodes;
    if (N < 2) return;

    let tx = 0, ty = 0;
    if (isFront) {
      tx = this.nodes[N - 1].x - this.nodes[N - 2].x;
      ty = this.nodes[N - 1].y - this.nodes[N - 2].y;
    } else {
      tx = this.nodes[1].x - this.nodes[0].x;
      ty = this.nodes[1].y - this.nodes[0].y;
    }
    const tLen = Math.hypot(tx, ty) || 1;
    const ux = tx / tLen;
    const uy = ty / tLen;

    const nx = anchor.nx;
    const ny = anchor.ny !== undefined ? anchor.ny : -1;

    // Cross product between local spine tangent (ux, uy) and outward surface normal (nx, ny):
    // Ventral side (legs/claws) will face the supporting surface when cross * dorsalSign > 0
    const cross = uy * nx - ux * ny;
    if (cross > 0.05) {
      this.dorsalSign = 1;
    } else if (cross < -0.05) {
      this.dorsalSign = -1;
    }
    this.flipCooldown = 0.40;
  }

  // Melee whip crack collision detection:
  // "l'arme de mélée la plus puissante de la chenille comme un genre de coup de fouet"
  checkWhipMeleeCollisions(world, particles) {
    if (!world || this.whipCrackTimer <= 0) return;
    const N = this.numNodes;
    const mStats = this.getModifierStats();
    const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') ||
                        (this.modifiers && this.modifiers.includes('super_forte')) ||
                        mStats.strengthMult > 1.35;
    const strengthMult = hasStrength ? 1.8 : 1.0;
    const baseWhipDmg = (65 + 35 * (this.whipPower || 0.5)) * mStats.strengthMult * strengthMult;
    const whipDirX = this.whipDir ? this.whipDir.x : (this.rear.x - this.head.x);
    const whipDirY = this.whipDir ? this.whipDir.y : (this.rear.y - this.head.y);
    const wLen = Math.hypot(whipDirX, whipDirY) || 1;
    const wNx = whipDirX / wLen;
    const wNy = whipDirY / wLen;

    // Check tail nodes (especially Node 0, 1, 2 which have the longest lever arm and greatest whip speed)
    const checkNodes = [this.nodes[0], this.nodes[1], this.nodes[2] || this.nodes[1]];

    // 1. Aphids
    if (world.aphids) {
      for (const aphid of world.aphids) {
        if (aphid.isDefeated || aphid.isHeld || this.whipHitEntities.has(aphid)) continue;
        for (const n of checkNodes) {
          const d = Math.hypot(n.x - aphid.x, n.y - aphid.y);
          if (d < aphid.radius + n.r + 20) {
            this.whipHitEntities.add(aphid);
            world.damageEnemy(aphid, baseWhipDmg, aphid.x, aphid.y, particles, 'coup_de_fouet');
            aphid.vx = wNx * 950;
            aphid.vy = wNy * 950 - 180;
            aphid.isFlying = true;
            aphid.squashX = 1.45;
            aphid.squashY = 0.55;
            if (this.onThrowEntityCallback) {
              this.onThrowEntityCallback({
                entityType: 'aphid',
                x: aphid.x,
                y: aphid.y,
                vx: aphid.vx,
                vy: aphid.vy
              });
            }
            if (particles) {
              particles.spawnPopup(aphid.x, aphid.y - 28, `💥 FOUETTÉ ! -${Math.round(baseWhipDmg)}`, '#ffd93b');
              particles.spawnConfetti(aphid.x, aphid.y, 8);
            }
            if (sound && sound.playLaunch) sound.playLaunch(0.95);
            break;
          }
        }
      }
    }

    // 2. Hedgehogs
    if (world.hedgehogs) {
      for (const h of world.hedgehogs) {
        if (h.isDefeated || h.isHeld || this.whipHitEntities.has(h)) continue;
        for (const n of checkNodes) {
          const d = Math.hypot(n.x - h.x, n.y - h.y);
          if (d < h.radius + n.r + 20) {
            this.whipHitEntities.add(h);
            world.damageEnemy(h, baseWhipDmg, h.x, h.y, particles, 'coup_de_fouet');
            h.vx = wNx * 880;
            h.vy = wNy * 880 - 160;
            h.isFlying = true;
            if (this.onThrowEntityCallback) {
              this.onThrowEntityCallback({
                entityType: 'hedgehog',
                x: h.x,
                y: h.y,
                vx: h.vx,
                vy: h.vy
              });
            }
            if (particles) {
              particles.spawnPopup(h.x, h.y - 28, `💥 FOUETTÉ ! -${Math.round(baseWhipDmg)}`, '#ffd93b');
              particles.spawnConfetti(h.x, h.y, 8);
            }
            if (sound && sound.playLaunch) sound.playLaunch(0.95);
            break;
          }
        }
      }
    }

    // 3. Ants
    if (world.ants) {
      for (const ant of world.ants) {
        if (ant.isDefeated || ant.isHeld || this.whipHitEntities.has(ant)) continue;
        for (const n of checkNodes) {
          const d = Math.hypot(n.x - ant.x, n.y - ant.y);
          if (d < ant.radius + n.r + 22) {
            this.whipHitEntities.add(ant);
            world.damageEnemy(ant, baseWhipDmg, ant.x, ant.y, particles, 'coup_de_fouet');
            ant.vx = wNx * 850;
            ant.vy = wNy * 850 - 180;
            ant.aiState = 'cooldown';
            ant.windupTimer = 0;
            ant.grabCooldown = 2.0;
            ant.squashX = 1.45;
            ant.squashY = 0.55;
            if (this.onThrowEntityCallback) {
              this.onThrowEntityCallback({
                entityType: 'ant',
                x: ant.x,
                y: ant.y,
                vx: ant.vx,
                vy: ant.vy
              });
            }
            if (particles) {
              particles.spawnPopup(ant.x, ant.y - 32, `💥 FOUETTÉ ! -${Math.round(baseWhipDmg)}`, '#ffd93b');
              particles.spawnConfetti(ant.x, ant.y, 10);
            }
            if (sound && sound.playLaunch) sound.playLaunch(0.95);
            break;
          }
        }
      }
    }

    // 4. Props (Acorns, Pinecones)
    if (world.props) {
      for (const prop of world.props) {
        if (prop.isHeld || prop.isBroken || this.whipHitEntities.has(prop)) continue;
        for (const n of checkNodes) {
          const d = Math.hypot(n.x - prop.x, n.y - prop.y);
          if (d < prop.radius + n.r + 20) {
            this.whipHitEntities.add(prop);
            prop.vx = wNx * 1050;
            prop.vy = wNy * 1050 - 160;
            if (world.damageProp) {
              world.damageProp(prop, 45, prop.x, prop.y, particles, 'coup_de_fouet');
            }
            if (this.onThrowEntityCallback) {
              this.onThrowEntityCallback({
                entityType: 'prop',
                x: prop.x,
                y: prop.y,
                vx: prop.vx,
                vy: prop.vy
              });
            }
            if (particles) {
              particles.spawnMud(prop.x, prop.y, wNx, wNy, 8, 0.85);
            }
            if (sound && sound.playLaunch) sound.playLaunch(0.85);
            break;
          }
        }
      }
    }

    // 5. Rival Caterpillars in Multiplayer PvP
    if (world.caterpillars && world.caterpillars.length > 0) {
      for (const other of world.caterpillars) {
        if (other === this || other.hp <= 0 || this.whipHitEntities.has(other)) continue;
        for (const n of checkNodes) {
          for (let oi = 0; oi < other.nodes.length; oi++) {
            const on = other.nodes[oi];
            const d = Math.hypot(n.x - on.x, n.y - on.y);
            if (d < n.r + on.r + 16) {
              this.whipHitEntities.add(other);
              const pvpDmg = Math.round(34 * (this.whipPower || 0.6) * strengthMult);
              other.takeDamage(pvpDmg, wNx * 820, wNy * 750 - 180, particles, sound, true);
              if (this.onPvpActionCallback && other.playerId) {
                this.onPvpActionCallback({
                  targetId: other.playerId,
                  damage: pvpDmg,
                  vx: wNx * 820,
                  vy: wNy * 750 - 180,
                  actionType: 'tail_whip'
                });
              }
              if (particles) {
                particles.spawnPopup(on.x, on.y - 32, `💥 FOUETTÉ ! -${pvpDmg} ❤️`, '#ff4757');
              }
              if (sound && sound.playLaunch) sound.playLaunch(1.0);
              break;
            }
          }
          if (this.whipHitEntities.has(other)) break;
        }
      }
    }
  }

  setRearHold(isHolding, particles) {
    if (this.rearAnchor.holdingKey === isHolding) return;
    this.rearAnchor.holdingKey = isHolding;

    if (!isHolding) {
      if (this.rearAnchor.stuckCrumb && this.rearAnchor.stuckStrength > 0) {
        sound.playSticky(false);
        return;
      }
      if (this.rearAnchor.anchored) {
        this.releaseAnchor(this.rearAnchor, false, particles);
      }
    }
  }

  setFrontHold(isHolding, particles) {
    if (this.frontAnchor.holdingKey === isHolding) return;
    this.frontAnchor.holdingKey = isHolding;

    if (!isHolding) {
      if (this.frontAnchor.stuckCrumb && this.frontAnchor.stuckStrength > 0) {
        sound.playSticky(false);
        return;
      }
      if (this.frontAnchor.anchored) {
        this.releaseAnchor(this.frontAnchor, true, particles);
      }
    }
  }

  releaseAnchor(anchor, isFront, particles) {
    const node = isFront ? this.head : this.rear;
    const mStats = this.getModifierStats();
    const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') || mStats.strengthMult > 1.35;
    const strengthMult = (this.activePowerUp && this.activePowerUp.type === 'strength' ? 2.5 : 1.0) * mStats.strengthMult;
    const swingVx = anchor.swingVx !== undefined ? (anchor.swingVx * 0.6 + node.vx * 0.4) : node.vx;
    const swingVy = anchor.swingVy !== undefined ? (anchor.swingVy * 0.6 + node.vy * 0.4) : node.vy;
    const swingSpeed = Math.hypot(swingVx, swingVy);

    // Release grabbed rival caterpillar (caterpillars can be held, dragged, slowed down or used as bridges, but never thrown or dealt launch damage)
    if (anchor.playerRef) {
      anchor.playerRef = null;
      anchor.playerNodeIndex = -1;
      sound.playGrip(false);
      return;
    }

    // Helper to compute aim direction combining spine, arrow inputs, and active caterpillar whip inertia
    const computeThrowAim = () => {
      let { dx, dy } = this.getFrontVector();
      if (!isFront) { dx = -dx; dy = -dy; }
      const steerX = (this.lastInputs.right ? 1 : 0) - (this.lastInputs.left ? 1 : 0);
      const steerY = (this.lastInputs.up ? -1 : 0) + (this.lastInputs.down ? 1 : 0);
      let aimX = dx;
      let aimY = dy;
      if (steerX !== 0 || steerY !== 0) {
        const sLen = Math.hypot(steerX, steerY) || 1;
        aimX = dx * 0.25 + (steerX / sLen) * 0.75;
        aimY = dy * 0.25 + (steerY / sLen) * 0.75;
      }
      if (swingSpeed > 45) {
        aimX = aimX * 0.55 + (swingVx / swingSpeed) * 0.45;
        aimY = aimY * 0.55 + (swingVy / swingSpeed) * 0.45;
      }
      const aLen = Math.hypot(aimX, aimY) || 1;
      return { aimX: aimX / aLen, aimY: aimY / aLen };
    };

    // Fling / Throw grabbable enemy aphids!
    if (anchor.aphidRef) {
      const aphid = anchor.aphidRef;
      aphid.isHeld = false;
      aphid.isFlying = true;

      const { aimX, aimY } = computeThrowAim();
      const boost = (this.extensionTimer > 0 ? 2.4 : 1.65);
      const throwSpeed = (290 + swingSpeed * 0.85 + (this.extensionMomentum.power || 0) * 360) * boost * strengthMult;
      aphid.vx = swingVx * 1.75 + aimX * throwSpeed;
      aphid.vy = swingVy * 1.75 + aimY * throwSpeed - (hasStrength ? 200 : 135);
      aphid.squashX = 1.45;
      aphid.squashY = 0.55;
      aphid.thrownBy = this.playerId || 'local';
      aphid.thrownByPseudo = this.pseudo || 'Joueur';
      aphid.throwGraceTimer = 0.25;
      aphid.throwDamageMult = mStats.strengthMult;

      if (this.onThrowEntityCallback) {
        this.onThrowEntityCallback({
          entityType: 'aphid',
          x: aphid.x,
          y: aphid.y,
          vx: aphid.vx,
          vy: aphid.vy,
          damageMult: mStats.strengthMult
        });
      }

      sound.playLaunch(0.85);
      if (particles) {
        particles.spawnMud(node.x, node.y, -aimX, -aimY, 8, 0.75);
        if (hasStrength) {
          particles.spawnConfetti(node.x, node.y, 14);
        }
      }
      anchor.aphidRef = null;
    }

    // Fling / Eject grabbable enemy Hedgehogs!
    if (anchor.hedgehogRef) {
      const hedgehog = anchor.hedgehogRef;
      hedgehog.isHeld = false;
      hedgehog.isFlying = true;

      const { aimX, aimY } = computeThrowAim();
      const chargeT = (this.extensionMomentum && this.extensionMomentum.chargeTime) || this.chargeDuration || 0;
      const boost = (this.extensionTimer > 0 || chargeT >= 1.0) ? 2.4 : 1.55;
      const throwSpeed = (280 + swingSpeed * 0.85 + Math.pow(Math.min(1.0, chargeT / 3.0), 1.8) * 380) * boost * strengthMult;

      hedgehog.vx = swingVx * 1.75 + aimX * throwSpeed;
      hedgehog.vy = swingVy * 1.75 + aimY * throwSpeed - (hasStrength ? 200 : 135);
      hedgehog.squashX = 1.45;
      hedgehog.squashY = 0.55;
      hedgehog.thrownBy = this.playerId || 'local';
      hedgehog.thrownByPseudo = this.pseudo || 'Joueur';
      hedgehog.throwGraceTimer = 0.25;
      hedgehog.throwDamageMult = mStats.strengthMult;

      if (this.onThrowEntityCallback) {
        this.onThrowEntityCallback({
          entityType: 'hedgehog',
          x: hedgehog.x,
          y: hedgehog.y,
          vx: hedgehog.vx,
          vy: hedgehog.vy,
          damageMult: mStats.strengthMult
        });
      }

      sound.playLaunch(0.85);
      if (particles) {
        particles.spawnMud(node.x, node.y, -aimX, -aimY, 8, 0.75);
        if (hasStrength) {
          particles.spawnConfetti(node.x, node.y, 14);
        }
      }
      anchor.hedgehogRef = null;
    }

    // Fling / Eject grabbable enemy Ants (Fourmis Guerrières)!
    if (anchor.antRef) {
      const ant = anchor.antRef;
      ant.isHeld = false;
      ant.isFlying = true;
      ant.aiState = 'patrol';
      ant.windupTimer = 0;
      ant.grabCooldown = 1.6;

      const { aimX, aimY } = computeThrowAim();
      const chargeT = (this.extensionMomentum && this.extensionMomentum.chargeTime) || this.chargeDuration || 0;
      const boost = (this.extensionTimer > 0 || chargeT >= 1.0) ? 2.4 : 1.60;
      const throwSpeed = (300 + swingSpeed * 0.85 + Math.pow(Math.min(1.0, chargeT / 3.0), 1.8) * 380) * boost * strengthMult;

      ant.vx = swingVx * 1.80 + aimX * throwSpeed;
      ant.vy = swingVy * 1.80 + aimY * throwSpeed - (hasStrength ? 210 : 145);
      ant.squashX = 1.45;
      ant.squashY = 0.55;
      ant.thrownBy = this.playerId || 'local';
      ant.thrownByPseudo = this.pseudo || 'Joueur';
      ant.throwGraceTimer = 0.25;
      ant.throwDamageMult = mStats.strengthMult;

      if (this.onThrowEntityCallback) {
        this.onThrowEntityCallback({
          entityType: 'ant',
          x: ant.x,
          y: ant.y,
          vx: ant.vx,
          vy: ant.vy,
          damageMult: mStats.strengthMult
        });
      }

      sound.playLaunch(0.85);
      if (particles) {
        particles.spawnMud(node.x, node.y, -aimX, -aimY, 8, 0.75);
        if (hasStrength) {
          particles.spawnConfetti(node.x, node.y, 14);
        }
      }
      anchor.antRef = null;
    }

    // Fling / Throw grabbable props (acorns, and pinecones with superforce!)
    if (anchor.propRef) {
      const prop = anchor.propRef;
      prop.isHeld = false;
      if (prop.type === 'acorn' || prop.mass < 15 || hasStrength || (this.bodyClass && this.bodyClass.massMult > 1.4)) {
        const { aimX, aimY } = computeThrowAim();
        const chargeT = (this.extensionMomentum && this.extensionMomentum.chargeTime) || this.chargeDuration || 0;
        const boost = (this.extensionTimer > 0 || chargeT >= 1.0) ? 2.4 : 1.55;
        const clsMass = ((this.bodyClass && this.bodyClass.massMult) || 1.0) * mStats.massMult;
        const baseSpeed = prop.type === 'pinecone' ? 300 : 330;
        const throwSpeed = (baseSpeed + swingSpeed * 0.85 + Math.pow(Math.min(1.0, chargeT / 3.0), 1.8) * 420) * boost * strengthMult * (clsMass > 1.2 ? 1.35 : 1.0);

        prop.vx = swingVx * 1.75 + aimX * throwSpeed;
        prop.vy = swingVy * 1.75 + aimY * throwSpeed - (hasStrength ? 180 : 120);
        prop.angVel = aimX * (hasStrength ? 20.0 : 14.0);
        prop.thrownBy = this.playerId || 'local';
        prop.thrownByPseudo = this.pseudo || 'Joueur';
        prop.throwGraceTimer = 0.25;
        prop.throwDamageMult = mStats.strengthMult;

        if (this.onThrowEntityCallback) {
          this.onThrowEntityCallback({
            entityType: 'prop',
            x: prop.x,
            y: prop.y,
            vx: prop.vx,
            vy: prop.vy,
            angVel: prop.angVel,
            damageMult: mStats.strengthMult
          });
        }

        sound.playLaunch(0.70);
        if (particles) {
          particles.spawnMud(node.x, node.y, -aimX, -aimY, 9, 0.75);
          if (hasStrength) {
            particles.spawnConfetti(node.x, node.y, 16);
          }
        }
      }
    }

    anchor.anchored = false;
    anchor.slipping = false;
    anchor.propRef = null;
    anchor.aphidRef = null;
    anchor.hedgehogRef = null;
    anchor.antRef = null;
    anchor.playerRef = null;
    anchor.segRef = null;
    anchor.localPt = null;
    anchor.facingSign = undefined;
    anchor.swingVx = 0;
    anchor.swingVy = 0;
    sound.playRelease(isFront);
    particles.spawnSuctionRing(node.x, node.y, isFront ? '#a8ffbc' : '#e4b8ff');

    const otherAnchor = isFront ? this.rearAnchor : this.frontAnchor;
    if (!otherAnchor.anchored) {
      if (this.extensionMomentum.timer > 0 && !this.extensionMomentum.consumed && (this.extensionMomentum.chargeTime || 0) >= 0.8) {
        const chargeTime = this.extensionMomentum.chargeTime;
        const maxChargeTime = 3.0;
        // Normalized power over [1.0s, maxChargeTime]
        const p = Math.min(1.0, Math.max(0, (chargeTime - 1.0) / (maxChargeTime - 1.0)));
        // Strictly quadratic scaling (power = p^2): almost zero push at 1-2s, max at 4s
        const quadPower = p * p;
        const baseMaxSpeed = GAMEPLAY_CONFIG.maxJumpSpeed || 300;
        let launchSpeed = quadPower * baseMaxSpeed * 0.75;

        const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
        const jumpMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.00) * clsJump * mStats.jumpMult;
        const powStrengthMult = (this.activePowerUp && this.activePowerUp.type === 'strength') ? 1.35 : 1.0;
        const speedMult = ((this.activePowerUp && this.activePowerUp.type === 'speed') ? 1.25 : 1.0) * mStats.speedMult;
        launchSpeed *= jumpMult * powStrengthMult * speedMult;

        let aimX = 0;
        let aimY = 0;
        if (this.extensionMomentum.aimX !== undefined && this.extensionMomentum.aimY !== undefined) {
          aimX = this.extensionMomentum.aimX;
          aimY = this.extensionMomentum.aimY;
        } else if (this.lastLaunchDir) {
          aimX = this.lastLaunchDir.aimX;
          aimY = this.lastLaunchDir.aimY;
        } else {
          const fv = this.getFrontVector();
          aimX = isFront ? -fv.dx : fv.dx;
          aimY = isFront ? -fv.dy : fv.dy;
        }

        for (let i = 0; i < this.numNodes; i++) {
          const leadRatio = isFront ? ((this.numNodes - 1 - i) / (this.numNodes - 1)) : (i / (this.numNodes - 1));
          const frontRatio = 0.88 + 0.16 * leadRatio;
          this.nodes[i].vx = aimX * launchSpeed * frontRatio;
          this.nodes[i].vy = aimY * launchSpeed * frontRatio;
          this.nodes[i].onGround = false;
        }

        this.extensionMomentum.consumed = true;
        this.extensionMomentum.timer = 0;
        this.hopTimer = 0.45;
        sound.playLaunch(0.40);
      }
    }
  }

  // Forward vector oriented toward the front of the caterpillar
  getFrontVector() {
    const N = this.numNodes;
    const rear = this.nodes[0];
    const neck = this.nodes[Math.max(1, N - 2)];
    const head = this.nodes[N - 1];
    let dx = head.x - rear.x;
    let dy = head.y - rear.y;
    let len = Math.hypot(dx, dy);
    if (len < 16) {
      dx = head.x - neck.x;
      dy = head.y - neck.y;
      len = Math.hypot(dx, dy) || 1;
    }
    return { dx: dx / len, dy: dy / len };
  }

  // Punchy arcade hop along the caterpillar's front vector aimed with arrow keys
  triggerNaturalHop(power, particles) {
    let { dx, dy } = this.getFrontVector();
    const steerX = (this.lastInputs.right ? 1 : 0) - (this.lastInputs.left ? 1 : 0);
    const steerY = (this.lastInputs.up ? -1 : 0) + (this.lastInputs.down ? 1 : 0);

    let aimX = dx;
    let aimY = dy;
    if (steerX !== 0 || steerY !== 0) {
      const sDist = Math.hypot(steerX, steerY) || 1;
      aimX = dx * 0.40 + (steerX / sDist) * 0.60;
      aimY = dy * 0.40 + ((steerY < 0 ? steerY * (GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.25) : steerY) / sDist) * 0.60;
      const len = Math.hypot(aimX, aimY) || 1;
      aimX /= len;
      aimY /= len;
    }

    const mStats = this.getModifierStats();
    const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
    const jumpMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.00) * clsJump * mStats.jumpMult;
    const hopSpeed = (120 + power * 140) * jumpMult;
    const vx = aimX * hopSpeed;
    const vy = aimY * hopSpeed;

    for (let i = 0; i < this.numNodes; i++) {
      const frontBias = 0.88 + 0.16 * (i / (this.numNodes - 1));
      this.nodes[i].vx = vx * frontBias;
      this.nodes[i].vy = vy * frontBias;
      this.nodes[i].onGround = false;
    }
    this.hopTimer = 0.45;
    sound.playLaunch(0.40 + power * 0.40);
    particles.spawnMud(this.rear.x, this.rear.y, -aimX, -aimY, 6, power * 0.6);
  }

  findClosestGripCandidate(world, px, py, range) {
    const candidates = [];
    if (world.findClosestOtherCaterpillar) {
      const r = world.findClosestOtherCaterpillar(this, px, py, range);
      if (r) candidates.push(r);
    }
    if (world.findClosestHedgehog) {
      const h = world.findClosestHedgehog(px, py, range);
      if (h) candidates.push(h);
    }
    const a = world.findClosestAphid(px, py, range);
    if (a) candidates.push(a);
    const p = world.findClosestPropSurface(px, py, range);
    if (p) candidates.push(p);
    const s = world.findClosestSurface(px, py, range);
    if (s) candidates.push(s);

    if (candidates.length === 0) return null;
    candidates.sort((c1, c2) => (c1.dist ?? 999) - (c2.dist ?? 999));
    return candidates[0];
  }

  update(dt, world, inputs, particles) {
    if (this.isRemote) {
      this.updateRemote(dt);
      return;
    }

    const safeDt = Math.min(dt, 1 / 30);
    const mStats = this.getModifierStats();
    const speed = Math.hypot(this.head.vx, this.head.vy);
    this.propellerAngle += safeDt * (10 + speed * 0.08);
    this.crawlPhase += safeDt * (5.5 + speed * 0.08) * mStats.speedMult;
    this.wiggleTime += safeDt * (3.0 + speed * 0.05) * mStats.speedMult;
    this.lastInputs = { ...inputs };

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - safeDt);
    }
    if (this.jumpCooldown > 0) {
      this.jumpCooldown = Math.max(0, this.jumpCooldown - safeDt);
    }
    if (this.activePowerUp && this.activePowerUp.timer > 0) {
      this.activePowerUp.timer = Math.max(0, this.activePowerUp.timer - safeDt);
      if (this.activePowerUp.timer <= 0) {
        if (this.activePowerUp.type === 'giant') {
          this.sizeScale = mStats.scaleMult;
          const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
          for (let i = 0; i < this.numNodes; i++) {
            if (this.nodes[i]) this.nodes[i].r = this.getDefaultRadius(cls, i, this.numNodes) * this.sizeScale;
          }
        }
        this.activePowerUp.type = null;
        if (particles) {
          particles.spawnPopup(this.head.x, this.head.y - 25, 'FIN DU BONUS', '#b2bec3');
        }
      }
    }
    if (this.extensionMomentum.timer > 0) {
      this.extensionMomentum.timer = Math.max(0, this.extensionMomentum.timer - safeDt);
    }
    if (this.hopTimer > 0) {
      this.hopTimer = Math.max(0, this.hopTimer - safeDt);
    }
    if (this.flipCooldown > 0) {
      this.flipCooldown = Math.max(0, this.flipCooldown - safeDt);
    }
    if (this.spamPenaltyTimer > 0) {
      this.spamPenaltyTimer = Math.max(0, this.spamPenaltyTimer - safeDt);
    }

    // Live surface proximity detection for Q and D visual aids (strictly closest within paw radius!)
    const extraGrip = ((this.bodyClass && this.bodyClass.gripExtraDistance) || 0) + (mStats.extraGrip || 0);
    const baseGripDist = (this.roomConfig && this.roomConfig.gripDistance) || GAMEPLAY_CONFIG.gripDistance || 22;
    const gripDist = Math.max(8, Math.min(44, baseGripDist + extraGrip));
    const rearRange = this.rear.r + gripDist;
    const headRange = this.head.r + gripDist;

    const rearSurf = this.findClosestGripCandidate(world, this.rear.x, this.rear.y, rearRange);
    this.rearCanGrip = !!rearSurf;
    this.rearTargetPt = rearSurf ? { x: rearSurf.cx, y: rearSurf.cy } : null;

    const headSurf = this.findClosestGripCandidate(world, this.head.x, this.head.y, headRange);
    this.frontCanGrip = !!headSurf;
    this.frontTargetPt = headSurf ? { x: headSurf.cx, y: headSurf.cy } : null;

    const anyAnchored = this.rearAnchor.anchored || this.frontAnchor.anchored;

    // SPACEBAR: Pure longitudinal contraction of segment lengths (never lifts body into air!)
    const spaceHeld = !!inputs.space;
    this.updateStickyExtraction(safeDt, spaceHeld, particles);
    if (spaceHeld) {
      this.extensionTimer = 0; // Never allow extension to fight contraction
      this.extensionMomentum.timer = 0;
      this.extensionMomentum.consumed = false;
      const maxChargeTime = 3.0;
      const chargeSpeed = ((this.bodyClass && this.bodyClass.chargeSpeedMult) || 1.0) * mStats.speedMult;
      this.chargeDuration = Math.min(maxChargeTime, this.chargeDuration + safeDt * chargeSpeed);
      const chargeRatio = this.chargeDuration / maxChargeTime;

      // Subtle concentration tension shaking/tremor at the end of the charge (from 2.2s to 3.0s)
      if (this.chargeDuration >= 2.2) {
        this.chargeShake = Math.min(1.0, (this.chargeDuration - 2.2) / 0.8);
      } else {
        this.chargeShake = 0;
      }

      if (chargeRatio >= 0.98 && !this.wasFullyCharged) {
        this.wasFullyCharged = true;
        sound.playCheckpoint();
        if (particles) {
          particles.spawnPopup(this.head.x, this.head.y - 25, 'MAX ! ⚡🚀', '#ffd93b');
        }
      }

      // Clean, solid contraction into bent pose like an inchworm walking
      const bendSpeed = (GAMEPLAY_CONFIG.bendContractSpeed || 20.0) * mStats.speedMult;
      this.contraction += (1 - this.contraction) * Math.min(1, safeDt * bendSpeed);
      this.storedContraction = Math.max(this.storedContraction, chargeRatio);
      if (anyAnchored) {
        this.hadAnchorDuringContraction = true;
      }
      if (this.rearAnchor.anchored) {
        this.hadRearAnchorDuringContraction = true;
      }
      if (this.frontAnchor.anchored) {
        this.hadFrontAnchorDuringContraction = true;
      }
      this.rigidityTimer = 0.38;
      this.bodyRigidity += (0.85 - this.bodyRigidity) * Math.min(1, safeDt * 10.0);
    } else {
      if (this.wasSpaceHeld) {
        // Space released: snap unbend with organic spring inertia
        // Compute overall body spine orientation from tail to head
        const N = this.numNodes;
        let spineDx = 0, spineDy = 0;
        for (let i = 0; i < N - 1; i++) {
          const segDx = this.nodes[i + 1].x - this.nodes[i].x;
          const segDy = this.nodes[i + 1].y - this.nodes[i].y;
          const sDist = Math.hypot(segDx, segDy) || 1;
          spineDx += segDx / sDist;
          spineDy += segDy / sDist;
        }
        const sLen = Math.hypot(spineDx, spineDy) || 1;
        this.launchSpineDir = { x: spineDx / sLen, y: spineDy / sLen };

        const relSteerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
        const relSteerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);
        const headToTailX = this.rear.x - this.head.x;
        const headToTailY = this.rear.y - this.head.y;
        const isSteeredTowardTail = (relSteerX !== 0 || relSteerY !== 0) &&
          ((relSteerX * headToTailX + relSteerY * headToTailY) > 0 || (relSteerX !== 0 && relSteerX * (this.head.x - this.rear.x) < 0));
        this.launchedTowardTail = isSteeredTowardTail && !this.rearAnchor.anchored;

        // PROGRESSIVE JUMP: requires at least 0.50s of charge to jump, reaching 100% at 3.0s!
        const minJumpCharge = 0.50;
        const maxChargeTime = 3.0;
        const canJump = this.chargeDuration >= minJumpCharge && this.jumpCooldown <= 0;
        if (canJump) {
          const u = Math.min(1.0, Math.max(0, (this.chargeDuration - minJumpCharge) / (maxChargeTime - minJumpCharge)));
          const effectivePower = 0.15 + 0.85 * Math.pow(u, 1.25);
          this.rigidityTimer = 0.35;
          this.bodyRigidity = 0.85;
          this.extensionTimer = 0.30 + 0.14 * effectivePower; // Active deployment phase
          this.jumpCooldown = 0.30;
          this.onReleaseSpace(effectivePower, this.hadAnchorDuringContraction, inputs, particles, world);
        } else {
          // Under 0.50s (Spam or quick tap): advance just a tiny bit (never backward, and strictly slower than normal walking!)
          const { dx: fDx } = this.getFrontVector();
          const facingSign = fDx >= 0 ? 1 : -1;
          const microRatio = Math.min(1.0, this.chargeDuration / minJumpCharge);
          const microPush = 8 + 10 * microRatio; // ~8..18 px/s nudge (strictly slower than normal walking speed)
          for (let i = 0; i < N; i++) {
            const pinned = (i === 0 && this.rearAnchor.anchored) || (i === N - 1 && this.frontAnchor.anchored);
            if (!pinned && (this.nodes[i].onGround || anyAnchored)) {
              if (this.launchedTowardTail) {
                const tailWeight = 0.35 + 0.65 * ((N - 1 - i) / (N - 1));
                const tailDirSign = headToTailX !== 0 ? Math.sign(headToTailX) : -facingSign;
                this.nodes[i].vx = this.nodes[i].vx * 0.55 + tailDirSign * microPush * tailWeight;
                this.nodes[i].vy += 28 * tailWeight;
              } else {
                const segWeight = 0.35 + 0.65 * (i / (N - 1));
                this.nodes[i].vx = this.nodes[i].vx * 0.55 + facingSign * microPush * segWeight;
              }
            }
          }
          this.spamPenaltyTimer = this.chargeDuration < 0.22 ? 0.16 : 0;
          this.rigidityTimer = 0.16;
          this.bodyRigidity = 0.36;
          this.extensionTimer = this.hadAnchorDuringContraction ? 0.24 : 0.12;
          this.launchSpinePower = 0;
          this.extensionMomentum.timer = this.hadAnchorDuringContraction ? 0.22 : 0;
          this.extensionMomentum.consumed = !this.hadAnchorDuringContraction;
          this.extensionMomentum.chargeTime = 0;
        }
        this.hadRearAnchorDuringContraction = false;
        this.hadFrontAnchorDuringContraction = false;
      }
      this.chargeDuration = 0;
      this.chargeShake = 0;
      this.wasFullyCharged = false;
      if (this.extensionTimer > 0) {
        this.extensionTimer = Math.max(0, this.extensionTimer - safeDt);
        if (this.extensionTimer <= 0) {
          this.launchedFromHead = false;
          this.launchedTowardTail = false;
          this.launchSpineDir = null;
        }
      }
      const unbendSpeed = (GAMEPLAY_CONFIG.unbendExtensionSpeed || 28.0) * mStats.speedMult;
      this.contraction += (0 - this.contraction) * Math.min(1, safeDt * unbendSpeed);
      if (this.contraction < 0.02 && this.extensionTimer <= 0) {
        this.contraction = 0;
        this.storedContraction = 0;
        this.hadAnchorDuringContraction = false;
        this.hadRearAnchorDuringContraction = false;
        this.hadFrontAnchorDuringContraction = false;
      }

      if (this.rigidityTimer > 0) {
        this.rigidityTimer = Math.max(0, this.rigidityTimer - safeDt);
        this.bodyRigidity += (0.95 - this.bodyRigidity) * Math.min(1, safeDt * 10.0);
      } else {
        this.bodyRigidity += (0 - this.bodyRigidity) * Math.min(1, safeDt * 5.0);
      }
    }
    this.wasSpaceHeld = spaceHeld;

    // Sub-stepped soft-body physics (6 substeps: optimal balance of stability and high framerate)
    const subSteps = 6;
    const subDt = safeDt / subSteps;
    for (let step = 0; step < subSteps; step++) {
      this.stepPhysics(subDt, world, particles, inputs, step === 0);
    }

    // Ultra-calm camera focus point
    const midX = (this.rear.x + this.head.x) * 0.5;
    const groundFootY = Math.max(this.rear.y, this.head.y);
    this.cameraFocus.x += (midX - this.cameraFocus.x) * Math.min(1, safeDt * 2.5);
    this.cameraFocus.y += (groundFootY - this.cameraFocus.y) * Math.min(1, safeDt * 1.8);

    this.updateExpressions(safeDt);
  }

  onReleaseSpace(power, hadAnchor, inputs, particles, world) {
    inputs = inputs || {};
    if (this.rearAnchor.stuckCrumb && power > 0.40) {
      const c = this.rearAnchor.stuckCrumb;
      this.rearAnchor.stuckCrumb = null;
      this.rearAnchor.anchored = false;
      this.rearAnchor.stuckStrength = 0;
      this.rearAnchor.stuckCooldown = 1.0;
      sound.playSticky(true);
      if (particles) {
        particles.spawnStickyGoo(c.x, c.y, 8);
      }
    }
    if (this.frontAnchor.stuckCrumb && power > 0.40) {
      const c = this.frontAnchor.stuckCrumb;
      this.frontAnchor.stuckCrumb = null;
      this.frontAnchor.anchored = false;
      this.frontAnchor.stuckStrength = 0;
      this.frontAnchor.stuckCooldown = 1.0;
      sound.playSticky(true);
      if (particles) {
        particles.spawnStickyGoo(c.x, c.y, 8);
      }
    }

    const N = this.numNodes;
    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const steerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);

    // Geometridae stride: tail still gripped (Q held), head free → the Ω loop unrolls
    // forward from the tail (applyOmegaLoop) instead of leaping off the ground.
    const tailHeld = this.rearAnchor.anchored && this.rearAnchor.holdingKey && !this.isHoldingMovable(this.rearAnchor);
    if (this.getSpecies().contractStyle === 'omega' && tailHeld && !this.frontAnchor.anchored) {
      this.extensionTimer = 0.25;
      return;
    }

    // Special Whip Crack ("Coup de Fouet") when releasing détente while anchored by the head:
    // "je veux que quand on accroche par la tete et qu'on lache la detente ca oriente la queue droit dans cette direction pour la detendre. ceci faisant en plus l'arme de mélée la plus puissante de la chenille comme un genre de coup de fouet."
    const isAnchoredByHead = this.frontAnchor.anchored && !this.isHoldingMovable(this.frontAnchor);
    if (isAnchoredByHead) {
      if (this.rearAnchor.anchored) {
        this.releaseAnchor(this.rearAnchor, false, particles);
      }

      const mStats = this.getModifierStats();
      const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') ||
                          (this.modifiers && this.modifiers.includes('super_forte')) ||
                          mStats.strengthMult > 1.35;
      const strengthMult = hasStrength ? 1.8 : 1.0;

      let whipAimX = 0;
      let whipAimY = 0;
      if (steerX !== 0 || steerY !== 0) {
        const sDist = Math.hypot(steerX, steerY) || 1;
        whipAimX = steerX / sDist;
        whipAimY = steerY / sDist;
      } else {
        whipAimX = this.rear.x - this.head.x;
        whipAimY = this.rear.y - this.head.y;
        const wDist = Math.hypot(whipAimX, whipAimY) || 1;
        whipAimX /= wDist;
        whipAimY /= wDist;
        if (Math.hypot(whipAimX, whipAimY) < 0.2) {
          whipAimX = this.frontAnchor.nx || 0;
          whipAimY = this.frontAnchor.ny !== undefined ? this.frontAnchor.ny : -1;
        }
      }

      const finalAimLen = Math.hypot(whipAimX, whipAimY) || 1;
      whipAimX /= finalAimLen;
      whipAimY /= finalAimLen;

      const whipPower = Math.max(0.35, power);
      this.whipCrackTimer = 0.38;
      this.whipPower = whipPower;
      this.whipDir = { x: whipAimX, y: whipAimY };
      this.whipHitEntities.clear();
      this.extensionTimer = 0.35;
      this.contraction = 0;

      // Project the tail straight in the aimed direction:
      const whipSpeed = (1850 + 950 * whipPower) * mStats.speedMult * strengthMult;

      // Velocities only: the tail used to be teleported onto the aim line, which put it
      // straight through any branch the head was gripping. The straightening pass in
      // stepPhysics pulls it into line within a few substeps, under collision checks.
      for (let i = 0; i < N - 1; i++) {
        const nodeWeight = Math.pow((N - 1 - i) / (N - 1), 0.72);
        this.nodes[i].vx = whipAimX * whipSpeed * nodeWeight;
        this.nodes[i].vy = whipAimY * whipSpeed * nodeWeight;
        this.nodes[i].onGround = false;
      }

      sound.playLaunch(1.0);
      sound.playSticky(true);
      if (particles) {
        particles.spawnPopup(this.rear.x, this.rear.y - 28, '💥 COUP DE FOUET !', '#ffd93b');
        particles.spawnMud(this.head.x, this.head.y, whipAimX, whipAimY, 12, 0.95);
        particles.spawnConfetti(this.rear.x, this.rear.y, 8);
      }

      // Immediate check of melee collisions right upon release
      this.checkWhipMeleeCollisions(world, particles);

      this.hopTimer = 0.35;
      this.extensionMomentum.consumed = true;
      this.extensionMomentum.timer = 0;
      return;
    }

    // Check if the player's desired direction is oriented more toward the tail than the head:
    const headToTailDx = this.rear.x - this.head.x;
    const headToTailDy = this.rear.y - this.head.y;
    const desiredTowardTail = (steerX !== 0 || steerY !== 0) &&
      ((steerX * headToTailDx + steerY * headToTailDy) > 0 || (steerX !== 0 && steerX * (this.head.x - this.rear.x) < 0));

    // Ground & anchor check: "si la chenille a bien les pates arrieres encrés, pret a bien sauter. si on le fait sans avoir de vrai appuie il n'y a aucune poussées."
    const hadFrontAnchor = this.frontAnchor.anchored || (this.hadFrontAnchorDuringContraction && !this.rearAnchor.anchored);
    const hadRearAnchor = this.rearAnchor.anchored || (this.hadRearAnchorDuringContraction && !this.frontAnchor.anchored);
    const jumpingFromHead = (!this.rearAnchor.anchored && this.frontAnchor.anchored) || (hadFrontAnchor && !hadRearAnchor);
    const tailDirectedRelease = jumpingFromHead || (!this.rearAnchor.anchored && desiredTowardTail);
    this.launchedFromHead = tailDirectedRelease;
    this.launchedTowardTail = tailDirectedRelease || desiredTowardTail;

    const anyNodeOnGround = this.nodes.some(n => n.onGround || n.groundMaterial !== undefined);
    const hasTrueSupport = hadRearAnchor || this.rearAnchor.anchored ||
                           (jumpingFromHead && (hadFrontAnchor || this.frontAnchor.anchored)) ||
                           anyNodeOnGround;
    if (!hasTrueSupport) {
      // Released without true physical support: zero push impulse!
      if (this.rearAnchor.anchored) {
        this.releaseAnchor(this.rearAnchor, false, particles);
      }
      if (this.frontAnchor.anchored) {
        this.releaseAnchor(this.frontAnchor, true, particles);
      }
      this.hopTimer = 0;
      this.extensionTimer = 0;
      this.extensionMomentum.consumed = true;
      this.extensionMomentum.timer = 0;
      return;
    }

    const mStats = this.getModifierStats();
    const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
    const jumpBoostMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.00) * (clsJump || 1.0) * mStats.jumpMult;
    const speedMult = ((this.activePowerUp && this.activePowerUp.type === 'speed') ? 1.25 : 1.0) * mStats.speedMult;

    // 1. Natural Spring Jump direction:
    // If the desired direction is more toward the tail than the head (tailDirectedRelease / desiredTowardTail),
    // the détente straightens cleanly along the body axis without crossing head over tail,
    // and projects the tail outward & downward ("c'est la queue qui est projetée vers le bas")!
    let aimX, aimY;
    if (tailDirectedRelease || desiredTowardTail) {
      const headNode = this.head;
      const tailNode = this.rear;
      let bodyDx = tailNode.x - headNode.x;
      let bodyDy = tailNode.y - headNode.y;
      const bLen = Math.hypot(bodyDx, bodyDy) || 1;
      bodyDx /= bLen;
      bodyDy /= bLen;

      const tailSignX = bodyDx !== 0 ? Math.sign(bodyDx) : (steerX !== 0 ? Math.sign(steerX) : -1);
      aimX = Math.abs(bodyDx) > 0.25 ? bodyDx : tailSignX * 0.78;
      if (steerX !== 0 && Math.sign(steerX) === tailSignX) {
        aimX = aimX * 0.65 + Math.sign(steerX) * 0.35;
      }
      // Project the tail downward ("projetée vers le bas") while straightening the spine
      aimY = Math.max(0.28, bodyDy * 0.55 + 0.35);

      const finalLen = Math.hypot(aimX, aimY) || 1;
      aimX /= finalLen;
      aimY /= finalLen;

      // Keep launchSpineDir oriented from tail to head so the spine never inverts!
      this.launchSpineDir = { x: -aimX, y: -aimY };
    } else {
      // Rear catapult jump: thrust pushes away from base along the spine towards head
      const springDx = this.head.x - this.rear.x;
      const springDy = this.head.y - this.rear.y;
      const springLen = Math.hypot(springDx, springDy) || 1;
      aimX = springDx / springLen;
      aimY = springDy / springLen;

      // Ground constraint: if resting flat horizontally, ground normal reaction deflects push upward
      if (aimY > -0.25) {
        aimY = -0.35;
        const norm = Math.hypot(aimX, aimY) || 1;
        aimX /= norm;
        aimY /= norm;
      }

      // Player directional steering fine-tunes the launch angle (only when aligned with head!)
      if (steerX !== 0 || steerY !== 0) {
        const sDist = Math.hypot(steerX, steerY) || 1;
        const keyAimX = steerX / sDist;
        const keyAimY = (steerY < 0 ? steerY * 1.15 : steerY) / sDist;
        const kLen = Math.hypot(keyAimX, keyAimY) || 1;
        aimX = aimX * 0.65 + (keyAimX / kLen) * 0.35;
        aimY = aimY * 0.65 + (keyAimY / kLen) * 0.35;
        const len = Math.hypot(aimX, aimY) || 1;
        aimX /= len;
        aimY /= len;
      }

      // Spine uncoiling direction matches jump direction (tail -> head)
      this.launchSpineDir = { x: aimX, y: aimY };
    }

    // Maximum spring speed: charged jump pushes up to 2/3 of the caterpillar's length!
    // Formula from projectile dynamics: v = sqrt(2 * g * H_max)
    const worldGrav = (typeof world !== 'undefined' && world && world.gravity) ? world.gravity : (GAMEPLAY_CONFIG.gravity || 740);
    // Apex as a fraction of body length: long/heavy species jump further, light ones hop
    const targetMaxHeight = this.fullLength * (this.getSpecies().jumpHeightFrac || 0.67);
    const maxSpringSpeed = Math.sqrt(2 * worldGrav * targetMaxHeight);

    // Super Force effect: "l'effet force doit nous faire sauter 3 fois plus loin"
    const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') ||
                        (this.modifiers && this.modifiers.includes('super_forte')) ||
                        mStats.strengthMult > 1.35;
    const strengthJumpMult = hasStrength ? 3.0 : 1.0;

    let stanceMult = 0.85;
    if (tailDirectedRelease || desiredTowardTail) {
      stanceMult = 0.55; // Controlled tailward & downward projection without flipping head over tail
      this.launchSpinePower = power * 0.22;
    } else if (hadRearAnchor || this.rearAnchor.anchored) {
      stanceMult = 1.0; // Full spring catapult when rear paws are solidly anchored!
      this.launchSpinePower = power * 0.40;
    } else {
      stanceMult = 0.85; // Ground push without rear anchor lock
      this.launchSpinePower = power * 0.25;
    }

    // Release any anchor grips immediately. The grip keys are usually still held at
    // this point: without a short no-grip window the feet re-stuck to the ground on
    // the very next substep and smothered the jump.
    if (this.rearAnchor.anchored) {
      this.releaseAnchor(this.rearAnchor, false, particles);
    }
    if (this.frontAnchor.anchored) {
      this.releaseAnchor(this.frontAnchor, true, particles);
    }
    this.rearAnchor.noGripTimer = JUMP_NO_GRIP_TIME;
    this.frontAnchor.noGripTimer = JUMP_NO_GRIP_TIME;

    // Progressive jump power
    if (power <= 0.005) {
      return;
    }

    const jumpSpeed = (power * maxSpringSpeed) * jumpBoostMult * strengthJumpMult * speedMult * stanceMult;

    for (let i = 0; i < N; i++) {
      if (tailDirectedRelease || desiredTowardTail) {
        // Straight détente projecting the TAIL outward and downward ("la queue qui est projetée vers le bas")
        // while keeping the head behind as the natural pivot so head never teleports in front of tail!
        const tailRatio = (N - 1 - i) / (N - 1);
        const nodeScale = 0.25 + 0.85 * Math.pow(tailRatio, 1.15);
        this.nodes[i].vx = aimX * jumpSpeed * nodeScale;
        this.nodes[i].vy = Math.max(-90, aimY * jumpSpeed * nodeScale);
      } else {
        const trunkBonus = Math.sin((i / (N - 1)) * Math.PI) * 0.05;
        const leadRatio = i / (N - 1);
        const nodeBonus = 0.90 + 0.15 * leadRatio + trunkBonus;

        this.nodes[i].vx = aimX * jumpSpeed * nodeBonus;
        // Vertical safety cap, scaled with the species' own jump so big jumpers keep their edge
        const vyCap = hasStrength ? -1100 : -420 * Math.sqrt(targetMaxHeight / 109);
        this.nodes[i].vy = Math.max(vyCap, aimY * jumpSpeed * nodeBonus);
      }
      this.nodes[i].onGround = false;
    }

    this.hopTimer = 0.42;
    this.extensionTimer = 0.28 + 0.14 * power;
    this.extensionMomentum.consumed = true;
    this.extensionMomentum.timer = 0;

    if (particles) {
      const mudOrigin = jumpingFromHead ? this.head : this.rear;
      const mudCount = Math.round((4 + power * 7) * ((hadRearAnchor || hadFrontAnchor) ? 1.3 : 1.0));
      particles.spawnMud(mudOrigin.x, mudOrigin.y, -aimX, -aimY, mudCount, power * 0.85);
    }
    sound.playLaunch(0.20 + power * 0.65);
  }

  // Locked segment alignment: when a paw grabs a surface (rear foot or front foot),
  // that segment (0-1 for rear, N-2 to N-1 for front) remains glued flat against the surface.
  // It cannot rotate; rotations and steering are performed exclusively on the other segments!
  // When released, the segment unpins and smoothly blends back into the soft-body dynamics.
  // Locked segment alignment: when a paw grabs a surface (rear foot or front foot),
  // that segment remains glued flat against the surface during resting and crawling.
  enforceGrippedSegmentLocks(curSegLen = this.extendedSegLen) {
    const N = this.numNodes;
    if (N < 3) return;

    const rearIsGround = this.rearAnchor.anchored && !this.isHoldingMovable(this.rearAnchor) && !this.rearAnchor.slipping;
    const frontIsGround = this.frontAnchor.anchored && !this.isHoldingMovable(this.frontAnchor) && !this.frontAnchor.slipping;
    const bothAnchored = rearIsGround && frontIsGround;
    const chordDist = (bothAnchored && this.nodes[0] && this.nodes[N - 1])
      ? Math.hypot(this.nodes[N - 1].x - this.nodes[0].x, this.nodes[N - 1].y - this.nodes[0].y)
      : this.fullLength;

    // 1. Rear gripped segment lock (Segment 0 between Node 0 and Node 1)
    if (rearIsGround) {
      const bothClamped = bothAnchored && chordDist < curSegLen * 1.4;
      const isRearingHigh = (this.rearingProgress || 0) > 0.20 && !this.wasSpaceHeld;

      if (!bothClamped && !isRearingHigh) {
        if (this.rearAnchor.propRef) {
          const prop = this.rearAnchor.propRef;
          const rdx = this.rearAnchor.x - prop.x;
          const rdy = this.rearAnchor.y - prop.y;
          const rAng = Math.atan2(rdy, rdx);
          const effR = prop.radius * 0.95 + this.nodes[0].r * 0.80;

          const hAng = Math.atan2(this.head.y - prop.y, this.head.x - prop.x);
          let diff = hAng - rAng;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const sign = diff >= 0 ? 1 : -1;

          const wrapAngle = rAng + sign * (curSegLen / Math.max(10, effR));
          this.nodes[1].x = prop.x + Math.cos(wrapAngle) * effR;
          this.nodes[1].y = prop.y + Math.sin(wrapAngle) * effR;
          this.nodes[1].vx = prop.vx || 0;
          this.nodes[1].vy = prop.vy || 0;
        } else {
          let tx = this.rearAnchor.tx;
          let ty = this.rearAnchor.ty;
          if (tx === undefined || (tx === 0 && ty === 0)) {
            const nx = this.rearAnchor.nx || 0;
            const ny = this.rearAnchor.ny !== undefined ? this.rearAnchor.ny : -1;
            tx = -ny;
            ty = nx;
          }
          const toHeadX = this.head.x - this.nodes[0].x;
          const toHeadY = this.head.y - this.nodes[0].y;
          const headDot = toHeadX * tx + toHeadY * ty;
          let sign = this.rearAnchor.facingSign;
          if (sign === undefined || Math.abs(headDot) > curSegLen * 0.35) {
            sign = headDot >= 0 ? 1 : -1;
            this.rearAnchor.facingSign = sign;
          }

          this.nodes[1].x = this.nodes[0].x + tx * sign * curSegLen;
          this.nodes[1].y = this.nodes[0].y + ty * sign * curSegLen;
          this.nodes[1].vx = 0;
          this.nodes[1].vy = 0;
        }
      }
    }

    // 2. Front gripped segment lock (Segment N-2 between Node N-2 and Node N-1)
    if (frontIsGround) {
      const bothClamped = bothAnchored && chordDist < curSegLen * 1.4;
      const headIdx = N - 1;
      const neckIdx = N - 2;

      if (!bothClamped) {
        if (this.frontAnchor.propRef) {
          const prop = this.frontAnchor.propRef;
          const fdx = this.frontAnchor.x - prop.x;
          const fdy = this.frontAnchor.y - prop.y;
          const fAng = Math.atan2(fdy, fdx);
          const effR = prop.radius * 0.95 + this.nodes[headIdx].r * 0.80;

          const rAng = Math.atan2(this.rear.y - prop.y, this.rear.x - prop.x);
          let diff = rAng - fAng;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const sign = diff >= 0 ? 1 : -1;
          this.frontAnchor.facingSign = sign;

          const wrapAngle = fAng + sign * (curSegLen / Math.max(10, effR));
          this.nodes[neckIdx].x = prop.x + Math.cos(wrapAngle) * effR;
          this.nodes[neckIdx].y = prop.y + Math.sin(wrapAngle) * effR;
          this.nodes[neckIdx].vx = prop.vx || 0;
          this.nodes[neckIdx].vy = prop.vy || 0;
        } else {
          let tx = this.frontAnchor.tx;
          let ty = this.frontAnchor.ty;
          if (tx === undefined || (tx === 0 && ty === 0)) {
            const nx = this.frontAnchor.nx || 0;
            const ny = this.frontAnchor.ny !== undefined ? this.frontAnchor.ny : -1;
            tx = -ny;
            ty = nx;
          }
          const toTailX = this.rear.x - this.nodes[headIdx].x;
          const toTailY = this.rear.y - this.nodes[headIdx].y;
          const tailDot = toTailX * tx + toTailY * ty;
          let sign = this.frontAnchor.facingSign;
          if (sign === undefined || Math.abs(tailDot) > curSegLen * 0.30) {
            sign = tailDot >= 0 ? 1 : -1;
            this.frontAnchor.facingSign = sign;
          }

          // When flipping the tail across the head, allow the neck to flex smoothly over the head instead of rigid locking
          const isFlippingOverHead = Math.abs(tailDot) < curSegLen * 1.65 && (this.rear.y < this.head.y + 15);
          if (!isFlippingOverHead) {
            this.nodes[neckIdx].x = this.nodes[headIdx].x + tx * sign * curSegLen;
            this.nodes[neckIdx].y = this.nodes[headIdx].y + ty * sign * curSegLen;
            this.nodes[neckIdx].vx = 0;
            this.nodes[neckIdx].vy = 0;
          }
        }
      }
    }
  }

  stepPhysics(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const rear = this.rear;
    const head = this.head;
    const mStats = this.getModifierStats();
    const resp = (GAMEPLAY_CONFIG.orientationResponsiveness || 2.2) * mStats.speedMult;

    for (let i = 0; i < N; i++) {
      this.nodes[i].stepStartX = this.nodes[i].x;
      this.nodes[i].stepStartY = this.nodes[i].y;
    }

    // 1. Update Suction Anchors
    this.updateAnchor(this.rearAnchor, rear, false, dt, world, particles, isFirstSubstep);
    this.updateAnchor(this.frontAnchor, head, true, dt, world, particles, isFirstSubstep);

    const isHoldingFront = this.isHoldingMovable(this.frontAnchor);
    const isHoldingRear = this.isHoldingMovable(this.rearAnchor);

    const rearLocked = this.rearAnchor.anchored && !isHoldingRear && !this.rearAnchor.slipping;
    const frontLocked = this.frontAnchor.anchored && !isHoldingFront && !this.frontAnchor.slipping;

    const bothAnchored = rearLocked && frontLocked;
    const bothOnSameProp = bothAnchored && this.rearAnchor.propRef && this.frontAnchor.propRef && (this.rearAnchor.propRef === this.frontAnchor.propRef);

    this.enforceGrippedSegmentLocks(this.extendedSegLen);
    const isHopping = this.hopTimer > 0;
    const isExtending = !inputs.space && this.extensionTimer > 0;
    const anyOnGround = this.nodes.some(n => n.onGround) || rearLocked || frontLocked;
    const isAirborne = !anyOnGround;

    const isBending = !!inputs.space;
    const isCoiling = this.contraction > 0.15 || isBending;
    const rearSegmentLocked = rearLocked;
    const frontSegmentLocked = frontLocked;

    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const steerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);
    const hasSteer = steerX !== 0 || steerY !== 0;
    const effSteerY = steerY;

    // Lowest Y of the caterpillar (ground contact level) to compute vertical lift resistance
    let lowestY = rear.y;
    for (let i = 1; i < N; i++) {
      if (this.nodes[i].y > lowestY) lowestY = this.nodes[i].y;
    }

    // 2. Front-Oriented Steering Vector & Smooth Air Rotation
    if (hasSteer) {
      if (isAirborne) {
        // In the air: pure rotational torque so caterpillar rotates smoothly without linear drift
        const spinDir = steerX !== 0 ? steerX : steerY;
        let cx = 0, cy = 0;
        for (let i = 0; i < N; i++) { cx += this.nodes[i].x; cy += this.nodes[i].y; }
        cx /= N; cy /= N;

        const clsAgility = ((this.bodyClass && this.bodyClass.agilityMult) || 1.0) * mStats.speedMult;
        for (let i = 0; i < N; i++) {
          const rx = this.nodes[i].x - cx;
          const ry = this.nodes[i].y - cy;
          this.nodes[i].vx += -ry * spinDir * 8.5 * clsAgility * dt;
          this.nodes[i].vy += rx * spinDir * 8.5 * clsAgility * dt;
        }
      } else {
        // On the ground / anchored:
        const inertiaBoost = (isExtending || isHopping) ? 1.5 : 1.0;
        const clsAgility = ((this.bodyClass && this.bodyClass.agilityMult) || 1.0) * mStats.speedMult;
        const clsMass = (this.bodyClass && this.bodyClass.massMult) || 1.0;
        // Bending: orient with muscular resistance (~2.2x slower) as user requested
        const bendMult = isBending ? (GAMEPLAY_CONFIG.bendOrientationPower !== undefined ? GAMEPLAY_CONFIG.bendOrientationPower * 0.45 : 0.45) : 1.0;
        const agilityRatio = (clsAgility / clsMass) * bendMult;

        const upForce = (GAMEPLAY_CONFIG.orientationUpForce || 2100) * resp * agilityRatio;
        const downForce = 1200 * resp * agilityRatio;
        const sideCurlForce = 1500 * resp * agilityRatio;

        if (bothOnSameProp) {
          const prop = this.rearAnchor.propRef;
          // Natural physics: Caterpillar weight causes the prop to tilt or roll according to gravity!
          const com = this.centerOfMass;
          const relX = com.x - prop.x;
          // Gravitational torque rolls the prop towards whichever side the caterpillar hangs on:
          const rollTorque = (relX / Math.max(12, prop.radius)) * 5.5;
          prop.angVel += rollTorque * dt;
          prop.angVel *= Math.pow(0.92, dt * 60);
          prop.vx *= Math.pow(0.94, dt * 60);
          // Downward weight of the caterpillar:
          prop.vy += 160 * dt;
        }

        if (bothAnchored) {
          // When both paws are anchored, the caterpillar body behaves completely naturally:
          // Soft-body physics and gravity govern the spine, while the player can steer/sway with arrows
          // or contract naturally into a flexible curved arch with Space!
          if (hasSteer) {
            // Horizontal steering (Left / Right): lean/sway the body naturally
            if (steerX !== 0) {
              const swayForce = 850 * resp * dt;
              for (let i = 1; i < N - 1; i++) {
                const ratio = Math.sin((i / (N - 1)) * Math.PI);
                this.nodes[i].vx += steerX * swayForce * ratio;
              }
            }
            // Vertical steering (Up / Down):
            // - Up: arch the spine upward naturally
            // - Down: hug the surface lower
            if (effSteerY < 0) {
              const liftForce = 950 * resp * dt;
              for (let i = 1; i < N - 1; i++) {
                const ratio = Math.sin((i / (N - 1)) * Math.PI);
                this.nodes[i].vy -= liftForce * ratio;
              }
            } else if (effSteerY > 0) {
              const downForce = 850 * resp * dt;
              for (let i = 1; i < N - 1; i++) {
                const ratio = Math.sin((i / (N - 1)) * Math.PI);
                this.nodes[i].vy += downForce * ratio;
              }
            }
          }

          // Gentle natural dorsal spine guidance when contracting (holding Space):
          // Subtle natural muscle tension keeps the caterpillar's back arched outward cleanly without a rigid stencil!
          if (isBending || this.contraction > 0.08) {
            const headIdx = N - 1;
            const chordX = this.nodes[headIdx].x - this.nodes[0].x;
            const chordDy = this.nodes[headIdx].y - this.nodes[0].y;
            const cLen = Math.hypot(chordX, chordDy) || 1;
            let normX = -chordDy / cLen;
            let normY = chordX / cLen;
            if (normY > 0) { normX = -normX; normY = -normY; }

            const naturalArchThrust = (this.contraction * 360) * dt;
            for (let i = 1; i < N - 1; i++) {
              const ratio = Math.sin((i / (N - 1)) * Math.PI);
              this.nodes[i].vx += normX * naturalArchThrust * ratio;
              this.nodes[i].vy += normY * naturalArchThrust * ratio;
            }
          }
        } else {
          if (!rearLocked && !frontLocked) {
            // Free caterpillar on the ground:
            if (isBending) {
              // Direct muscular spring aiming while charging jump on ground:
              // Full 360° steering (Up, Down, Left, Right, diagonals) with ~2.2x slower resistance
              let aimDirX = 0;
              let aimDirY = 0;
              if (hasSteer) {
                const aimDist = Math.hypot(steerX, effSteerY) || 1;
                aimDirX = steerX / aimDist;
                aimDirY = effSteerY / aimDist;
              } else {
                const fv = this.getFrontVector();
                aimDirX = fv.dx;
                aimDirY = fv.dy;
              }

              for (let i = 1; i < N; i++) {
                const ratio = i / (N - 1);
                const w = Math.pow(ratio, 1.10) * inertiaBoost * dt;
                if (effSteerY < 0) this.nodes[i].vy -= upForce * 1.50 * w;
                else if (effSteerY > 0) this.nodes[i].vy += downForce * w;

                if (steerX !== 0) {
                  this.nodes[i].vx += steerX * (sideCurlForce * 0.85) * w;
                }

                if (hasSteer) {
                  const reachGuide = 750 * resp * agilityRatio * ratio;
                  this.nodes[i].vx += aimDirX * reachGuide * dt;
                  this.nodes[i].vy += aimDirY * reachGuide * dt;
                }
              }
              this.nodes[0].vy += 140 * dt; // Rear grounded as pivot
              this.head.onGround = false;

              const targetAngle = Math.atan2(aimDirY, aimDirX);
              let diff = targetAngle - this.rearingSmoothedAngle;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              this.rearingSmoothedAngle += diff * Math.min(1, dt * 9.0 * resp * bendMult);
              this.rearingProgress = 1.0;
            } else {
              // Progressive segment-by-segment lift:
              // The player raises the HEAD first, followed progressively by neck and mid-body!
              // Rear feet stay grounded to prevent rising like a rigid pole (piquet).
              const isLiftingFree = hasSteer && (effSteerY < 0 || inputs.up);
              if (isLiftingFree) {
                this.freeRearingProg += (1.0 - this.freeRearingProg) * Math.min(1, dt * 5.0);
              } else {
                this.freeRearingProg += (0.0 - this.freeRearingProg) * Math.min(1, dt * 8.0);
              }

              let aimDirX = 0;
              let aimDirY = 0;
              if (hasSteer) {
                const aimDist = Math.hypot(steerX, effSteerY) || 1;
                aimDirX = steerX / aimDist;
                aimDirY = effSteerY / aimDist;

                const hasSuperStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
                const liftEffort = (isHoldingFront && !hasSuperStrength) ? 1.05 : 1.0;
                const headReachForce = (GAMEPLAY_CONFIG.orientationUpForce || 2200) * resp * agilityRatio * liftEffort;

                const { dx: frontDx } = this.getFrontVector();
                const facingDir = frontDx >= 0 ? 1 : -1;
                const isReversing = (steerX !== 0) && (Math.sign(steerX) !== facingDir);

                // Head Aiming & Vertical control (when head is NOT anchored, only the head & front segments lead;
                // the tail never moves in the steered direction on its own — it is naturally pulled taut behind the body!):
                const hasSpeedBoost = (this.activePowerUp && this.activePowerUp.type === 'speed');
                const headLift = !isLiftingFree ? 1.0 : Math.min(1.0, this.freeRearingProg / 0.25);
                const spamBlock = (this.spamPenaltyTimer > 0 && !isReversing) ? 0.25 : 1.0;

                // Evaluate surface inclination & upside-down penalty so walking uphill or on a ceiling is slower:
                let surfNyAvg = -1;
                let groundedCount = 0;
                for (let i = 0; i < N; i++) {
                  if (this.nodes[i].onGround && this.nodes[i].groundNy !== undefined) {
                    surfNyAvg += this.nodes[i].groundNy;
                    groundedCount++;
                  }
                }
                if (groundedCount > 0) surfNyAvg /= (groundedCount + 1);
                const isCeilingWalk = surfNyAvg > 0.15;
                const isSteepWall = Math.abs(surfNyAvg) <= 0.45;
                // Climbing uphill or walking upside-down is naturally slower (~0.58x..0.72x)
                let terrainPaceMult = 1.0;
                if (isCeilingWalk) {
                  terrainPaceMult = 0.62;
                } else if (isSteepWall) {
                  terrainPaceMult = 0.72;
                } else if (this.head.groundNy !== undefined && this.head.groundNx !== undefined) {
                  // Uphill check: if moving against gravity along a slope
                  const slopeTangentY = (steerX >= 0) ? this.head.groundNx : -this.head.groundNx;
                  if (slopeTangentY < -0.18) {
                    terrainPaceMult = Math.max(0.58, 1.0 + slopeTangentY * 0.55);
                  }
                }

                const baseForwardDrive = (hasSpeedBoost ? 0.96 : 0.74) * terrainPaceMult;
                const baseReverseDrive = (hasSpeedBoost ? 0.62 : 0.44) * terrainPaceMult;
                const xHeadDrive = (isReversing ? baseReverseDrive : baseForwardDrive) * spamBlock;
                this.head.vx += aimDirX * headReachForce * (isLiftingFree ? 0.92 : 1.0) * xHeadDrive * dt;
                this.head.vy += aimDirY * headReachForce * headLift * dt;

                // 2. Neck follows progressively once head is already airborne:
                const neckLift = !isLiftingFree ? 0.78 : Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.18) / 0.42));
                this.nodes[N - 2].vx += aimDirX * headReachForce * 0.55 * neckLift * xHeadDrive * dt;
                this.nodes[N - 2].vy += aimDirY * headReachForce * 0.55 * neckLift * dt;

                // 3. Mid vertebra follows progressively:
                const midLift = !isLiftingFree ? 0.52 : Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.48) / 0.40));
                this.nodes[N - 3].vx += aimDirX * headReachForce * 0.26 * midLift * xHeadDrive * dt;
                this.nodes[N - 3].vy += aimDirY * headReachForce * 0.26 * midLift * dt;

                // Active uncoiling / extension thrust when releasing Space while steering:
                if (isExtending && hasSteer && (this.launchSpinePower > 0 || this.hadAnchorDuringContraction) && this.spamPenaltyTimer <= 0) {
                  const extLeadThrust = (this.launchSpinePower > 0 ? 2200 : 850) * resp * dt;
                  const headToTailX = this.rear.x - this.head.x;
                  const headToTailY = this.rear.y - this.head.y;
                  const isTailDir = this.launchedTowardTail || ((aimDirX * headToTailX + aimDirY * headToTailY) > 0) || (steerX !== 0 && steerX * (this.head.x - this.rear.x) < 0);
                  if (isTailDir) {
                    // Desired direction is more toward the tail: project the tail outward & downward ("projetée vers le bas")!
                    const tailDownY = Math.max(0.42, aimDirY);
                    const tLen = Math.hypot(aimDirX, tailDownY) || 1;
                    const txDir = aimDirX / tLen;
                    const tyDir = tailDownY / tLen;
                    this.nodes[0].vx += txDir * extLeadThrust;
                    this.nodes[0].vy += tyDir * extLeadThrust;
                    this.nodes[1].vx += txDir * extLeadThrust * 0.70;
                    this.nodes[1].vy += tyDir * extLeadThrust * 0.70;
                  } else {
                    this.head.vx += aimDirX * extLeadThrust;
                    this.head.vy += aimDirY * extLeadThrust;
                    this.nodes[N - 2].vx += aimDirX * extLeadThrust * 0.70;
                    this.nodes[N - 2].vy += aimDirY * extLeadThrust * 0.70;
                    this.head.onGround = false;
                  }
                }

                // 4. Natural tail tension & tail fall when head is NOT anchored:
                // The tail (nodes 0 and 1) is never actively driven by the arrows here; instead it is pulled
                // along the spine tension vector toward the front of the body and settles naturally onto the ground!
                for (let i = 0; i < N - 2; i++) {
                  const nextNode = this.nodes[i + 1];
                  const pullDx = nextNode.x - this.nodes[i].x;
                  const pullDy = nextNode.y - this.nodes[i].y;
                  const pullDist = Math.hypot(pullDx, pullDy) || 1;
                  // Natural alignment tension pulling the tail taut behind the advancing body
                  const baseTension = (hasSpeedBoost ? (steerX !== 0 ? 255 : 115) : (steerX !== 0 ? 85 : 42)) * terrainPaceMult;
                  const tensionPull = baseTension * clsAgility * spamBlock * dt;
                  this.nodes[i].vx += (pullDx / pullDist) * tensionPull;
                  if (this.nodes[i].onGround || (this.nodes[i].surfaceAdhesionTimer || 0) > 0) {
                    this.nodes[i].vy += (pullDy / pullDist) * tensionPull * 0.55;
                  } else {
                    // Coherent tail fall ("retombée de la queue") when airborne
                    this.nodes[i].vy += 240 * dt;
                  }
                }
                if (isLiftingFree) {
                  this.nodes[0].vy += 210 * dt;
                  this.nodes[1].vy += 135 * dt;
                }

                // Active peeling / unsticking force ONLY if steering explicitly away from the surface normal:
                if (this.head.onGround && this.head.groundNx !== undefined) {
                  const dotAway = aimDirX * this.head.groundNx + aimDirY * this.head.groundNy;
                  if (dotAway > 0.42) {
                    const unstick = (1050 * liftEffort) * dt;
                    this.head.vx += this.head.groundNx * unstick;
                    this.head.vy += this.head.groundNy * unstick;
                    this.head.onGround = false;
                    this.head.surfaceAdhesionTimer = 0;
                  }
                }
              }
            }
          } else if (rearLocked && !frontLocked) {
            // Rear is anchored:
            if (isBending) {
              // Direct muscular spring aiming while charging jump with rear anchored!
              // Full 360° steering in any direction (Up, Down, Left, Right, diagonals)
              // with natural physical resistance (~2.2x slower, bendMult = 0.45)
              let aimDirX = 0;
              let aimDirY = 0;
              if (hasSteer) {
                const aimDist = Math.hypot(steerX, effSteerY) || 1;
                aimDirX = steerX / aimDist;
                aimDirY = effSteerY / aimDist;
              } else {
                const fv = this.getFrontVector();
                aimDirX = fv.dx;
                aimDirY = fv.dy;
              }

              for (let i = 2; i < N; i++) {
                const ratio = (i - 1) / (N - 2);
                const w = Math.pow(ratio, 1.10) * inertiaBoost * dt;
                if (effSteerY < 0) this.nodes[i].vy -= upForce * 1.85 * w;
                else if (effSteerY > 0) this.nodes[i].vy += downForce * w;

                if (steerX !== 0) {
                  this.nodes[i].vx += steerX * sideCurlForce * w;
                }

                if (hasSteer) {
                  const reachGuide = 850 * resp * agilityRatio * ratio;
                  this.nodes[i].vx += aimDirX * reachGuide * dt;
                  this.nodes[i].vy += aimDirY * reachGuide * dt;
                }
              }
              this.head.onGround = false;

              const targetAngle = Math.atan2(aimDirY, aimDirX);
              let diff = targetAngle - this.rearingSmoothedAngle;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              this.rearingSmoothedAngle += diff * Math.min(1, dt * 9.0 * resp * bendMult);
              this.rearingProgress = 1.0;
            } else {
              // The tail (Node 0) is firmly pinned at the anchor.
              // When player steers with Right / Left / Down, or rests: the body hugs and drapes along the surface!
              // When player actively presses Up: muscle force rears the head into the air.

              // 1. Surface orientation at rear anchor
            let surfNx = this.rearAnchor.nx || 0;
            let surfNy = this.rearAnchor.ny !== undefined ? this.rearAnchor.ny : -1;
            const surfLen = Math.hypot(surfNx, surfNy) || 1;
            surfNx /= surfLen;
            surfNy /= surfLen;

            const isPressingDown = inputs.down || steerY > 0;
            const isPressingUp = inputs.up || steerY < 0;
            const isPressingRight = inputs.right || steerX > 0;
            const isPressingLeft = inputs.left || steerX < 0;

            const rearProp = this.rearAnchor.propRef;
            let rearAngleOnProp = 0;
            let effPropR = 0;
            if (rearProp) {
              const rdx = this.rear.x - rearProp.x;
              const rdy = this.rear.y - rearProp.y;
              rearAngleOnProp = Math.atan2(rdy, rdx);
              effPropR = rearProp.radius * 0.95 + this.rear.r * 0.85;
            }

            // Facing direction along surface
            const dotHead = (this.head.x - this.rear.x) * (-surfNy) + (this.head.y - this.rear.y) * surfNx;
            let facingSign = dotHead >= 0 ? 1 : -1;
            if (rearProp) {
              // On left of prop and pressing Right: facingSign is definitely forward over top
              if (isPressingRight && this.rear.x <= rearProp.x) facingSign = 1;
              else if (isPressingLeft && this.rear.x >= rearProp.x) facingSign = -1;
            }
            const surfTx = -surfNy * facingSign;
            const surfTy = surfNx * facingSign;
            const surfAngle = Math.atan2(surfTy, surfTx);

            // 2. Head steering & reach authority:
            const isPureDown = isPressingDown && !isPressingLeft && !isPressingRight && !isPressingUp;
            let targetProg = 0.0;
            if (isBending) {
              targetProg = hasSteer ? 1.0 : (this.rearingProgress > 0.3 ? 0.50 : 0.20);
            } else if (hasSteer && !isPureDown) {
              targetProg = 1.0;
            } else {
              targetProg = 0.0;
            }

            const hasSuperStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
            const liftEffort = (isHoldingFront && !hasSuperStrength) ? 1.05 : 1.0;
            const baseRearRate = (targetProg > this.rearingProgress ? 5.4 : 9.0) * (GAMEPLAY_CONFIG.orientationResponsiveness || 2.25) * liftEffort;
            const rearRate = isBending ? baseRearRate * 0.45 : baseRearRate;
            this.rearingProgress += (targetProg - this.rearingProgress) * Math.min(1, dt * rearRate);

            // Aim angle for steered head posture
            let targetAimAngle = surfAngle;
            if (hasSteer) {
              if (isPureDown && !isBending) {
                targetAimAngle = surfAngle;
              } else {
                let aimDx = steerX;
                let aimDy = effSteerY;
                if (aimDx === 0 && aimDy === 0) {
                  aimDx = surfTx;
                  aimDy = surfTy;
                } else if (aimDx === 0) {
                  aimDx = surfTx * 0.35;
                }
                targetAimAngle = Math.atan2(aimDy, aimDx);
              }
            }

            let curAngleDiff = targetAimAngle - this.rearingSmoothedAngle;
            while (curAngleDiff > Math.PI) curAngleDiff -= Math.PI * 2;
            while (curAngleDiff < -Math.PI) curAngleDiff += Math.PI * 2;
            const baseRotSpeed = (isPressingUp || effSteerY < 0) ? 24.0 : 18.0;
            const bendSpeedMult = (isBending || this.contraction > 0.15) ? 0.38 : 1.0;
            const rotSpeed = baseRotSpeed * bendSpeedMult;
            this.rearingSmoothedAngle += curAngleDiff * Math.min(1, dt * rotSpeed * (GAMEPLAY_CONFIG.orientationResponsiveness || 2.25));

            // 3. Construct target spine positions:
            const tx = new Float32Array(N);
            const ty = new Float32Array(N);
            tx[0] = this.rear.x;
            ty[0] = this.rear.y;

            const bodySegLen = (this.extendedSegLen * (this.extensionTimer > 0 ? (GAMEPLAY_CONFIG.unbendReachBonus || 1.20) : 1.0)) * (1 - this.contraction) +
                               this.contractedSegLen * this.contraction;

            // Tail segment (Node 0 to 1) stays hugging the surface
            if (rearProp) {
              const tailWrapAngle = rearAngleOnProp + facingSign * (this.extendedSegLen / effPropR);
              tx[1] = rearProp.x + Math.cos(tailWrapAngle) * effPropR;
              ty[1] = rearProp.y + Math.sin(tailWrapAngle) * effPropR;
            } else {
              tx[1] = tx[0] + surfTx * this.extendedSegLen;
              ty[1] = ty[0] + surfTy * this.extendedSegLen;
            }

            this.nodes[1].x = tx[1];
            this.nodes[1].y = ty[1];
            this.nodes[1].vx = rearProp ? rearProp.vx : 0;
            this.nodes[1].vy = rearProp ? rearProp.vy : 0;

            // Compute ideal unhindered reared spine chain starting from Node 1:
            let spinalDiff = this.rearingSmoothedAngle - surfAngle;
            while (spinalDiff > Math.PI) spinalDiff -= Math.PI * 2;
            while (spinalDiff < -Math.PI) spinalDiff += Math.PI * 2;

            const rearedX = new Float32Array(N);
            const rearedY = new Float32Array(N);
            rearedX[0] = tx[0];
            rearedY[0] = ty[0];
            rearedX[1] = tx[1];
            rearedY[1] = ty[1];

            for (let i = 2; i < N; i++) {
              const segFraction = (i - 1) / (N - 2);
              const threshold = isBending ? 0.0 : (1.0 - segFraction) * 0.65;
              const rawProg = Math.max(0, Math.min(1.0, (this.rearingProgress - threshold) / Math.max(0.01, 1.0 - threshold)));
              const segProg = rawProg * rawProg * (3.0 - 2.0 * rawProg);

              const segAngle = surfAngle + spinalDiff * segProg;
              rearedX[i] = rearedX[i - 1] + Math.cos(segAngle) * bodySegLen;
              rearedY[i] = rearedY[i - 1] + Math.sin(segAngle) * bodySegLen;

              let groundX, groundY;
              if (rearProp) {
                const nodeWrapAngle = rearAngleOnProp + facingSign * (this.extendedSegLen / effPropR + (i - 1) * (bodySegLen / effPropR));
                groundX = rearProp.x + Math.cos(nodeWrapAngle) * effPropR;
                groundY = rearProp.y + Math.sin(nodeWrapAngle) * effPropR;
              } else {
                groundX = tx[1] + surfTx * (bodySegLen * (i - 1));
                groundY = ty[1] + surfTy * (bodySegLen * (i - 1));
              }

              // Blend smoothly between ground surface posture and S-curved reared posture
              tx[i] = groundX * (1 - segProg) + rearedX[i] * segProg;
              ty[i] = groundY * (1 - segProg) + rearedY[i] * segProg;

              const errX = tx[i] - this.nodes[i].x;
              let errY = ty[i] - this.nodes[i].y;

              if (!isBending && (isPressingUp || effSteerY < 0) && errY > 0) {
                errY = 0;
              }

              const stiff = (rearProp && segProg < 0.2) ? 45.0 : (24.0 + 20.0 * segProg);
              const damp = 9.0 + 4.0 * segProg;
              this.nodes[i].vx += (errX * stiff - this.nodes[i].vx * damp) * dt;
              this.nodes[i].vy += (errY * stiff - this.nodes[i].vy * damp) * dt;
            }

            // 4. Active head aiming & reach authority:
            if (hasSteer && (!isPureDown || isBending)) {
              const bendForceMult = isBending ? 0.40 : 1.0;
              const headReachForce = (GAMEPLAY_CONFIG.orientationUpForce || 2200) * resp * agilityRatio * liftEffort * bendForceMult;
              const aimDx = Math.cos(this.rearingSmoothedAngle);
              const aimDy = Math.sin(this.rearingSmoothedAngle);
              
              // Head always lifts first:
              this.head.vx += aimDx * headReachForce * 0.98 * dt;
              this.head.vy += aimDy * headReachForce * 0.98 * dt;

              // Neck follows progressively once head is up:
              const neckLift = isBending ? 1.0 : Math.max(0, Math.min(1.0, (this.rearingProgress - 0.18) / 0.82));
              this.nodes[N - 2].vx += aimDx * headReachForce * 0.55 * neckLift * dt;
              this.nodes[N - 2].vy += aimDy * headReachForce * 0.55 * neckLift * dt;

              // Mid-body follows later:
              if (N > 3) {
                const midLift = isBending ? 0.80 : Math.max(0, Math.min(1.0, (this.rearingProgress - 0.48) / 0.52));
                this.nodes[N - 3].vx += aimDx * headReachForce * 0.25 * midLift * dt;
                this.nodes[N - 3].vy += aimDy * headReachForce * 0.25 * midLift * dt;
              }

              // Direct immediate upward lift when pressing UP so held objects (acorn, enemy) rise effortlessly:
              if (isPressingUp || effSteerY < 0) {
                const upBoost = headReachForce * 0.95 * dt;
                this.head.vy -= upBoost;
                this.nodes[N - 2].vy -= upBoost * 0.55 * neckLift;
                if (N > 3) {
                  const midLift = isBending ? 0.80 : Math.max(0, Math.min(1.0, (this.rearingProgress - 0.48) / 0.52));
                  this.nodes[N - 3].vy -= upBoost * 0.25 * midLift;
                }
                this.head.onGround = false;
              }

              // Peeling force if head touches an irregular obstacle, round prop or stairs while aiming away / up
              if (this.head.onGround || isPressingUp) {
                const unstick = (1150 * liftEffort) * dt;
                this.head.vy -= unstick;
                this.head.onGround = false;
              }
            }

            if (rearProp && ((isPureDown && !isBending) || !hasSteer)) {
              const headTargetX = tx[N - 1];
              const headTargetY = ty[N - 1];
              this.head.vx += (headTargetX - this.head.x) * 45.0 * dt;
              this.head.vy += (headTargetY - this.head.y) * 45.0 * dt;

              // Pull inward towards prop center so head and body cling firmly to the round contour
              const inDx = (rearProp.x - this.head.x) / effPropR;
              const inDy = (rearProp.y - this.head.y) / effPropR;
              this.head.vx += inDx * 560 * dt;
              this.head.vy += inDy * 560 * dt;
              const inDx2 = (rearProp.x - this.nodes[N - 2].x) / effPropR;
              const inDy2 = (rearProp.y - this.nodes[N - 2].y) / effPropR;
              this.nodes[N - 2].vx += inDx2 * 360 * dt;
              this.nodes[N - 2].vy += inDy2 * 360 * dt;

              // Tangent vector along circumference of the round prop
              const headWrapAngle = rearAngleOnProp + facingSign * ((N - 1) * (bodySegLen / effPropR));
              const tangX = -Math.sin(headWrapAngle) * facingSign;
              const tangY = Math.cos(headWrapAngle) * facingSign;

              if (isPressingDown && !isBending) {
                // DOWN ARROW: wraps all the way around the circumference along the contour!
                this.head.vx += tangX * 420 * dt;
                this.head.vy += tangY * 420 * dt;
                if (this.head.y < rearProp.y) {
                  this.head.vy += 250 * dt;
                }
              }
            } else if (isPureDown && !isBending) {
              if (this.head.onGround && this.head.groundNx !== undefined) {
                this.head.vx -= this.head.groundNx * 350 * dt;
                this.head.vy -= this.head.groundNy * 350 * dt;
              }
              const downForce = 850 * dt;
              this.head.vy += downForce;
              this.nodes[N - 2].vy += downForce * 0.70;
            }

            // Gravity assistance when suspended:
            const isSuspended = !this.head.onGround && !this.nodes[N - 2].onGround;
            if (!isBending && isSuspended && (isPressingDown || effSteerY > 0 || !hasSteer)) {
              const hangGravityAid = (isPressingDown || effSteerY > 0) ? (980 * dt) : (420 * dt);
              this.head.vy += hangGravityAid;
              this.nodes[N - 2].vy += hangGravityAid * 0.75;
              if (N > 3) this.nodes[N - 3].vy += hangGravityAid * 0.45;
            }
            }
          } else if (frontLocked && !rearLocked) {
            // Front is anchored: The player controls the tail with the arrows!
            // Allows easy flipping ("retournement") over the anchored front paw if grabbed in the wrong direction,
            // and natural tail fall ("retombée de la queue") when not pressing Up!
            const tail = this.rear;
            const matName = tail.groundMaterial || 'dirt';
            const mat = MATERIALS[matName] || MATERIALS.dirt;
            const slideEase = Math.max(0.35, 1.15 - mat.friction * 0.65);

            // Vector from tail toward front anchor:
            const toFrontX = this.frontAnchor.x - tail.x;
            const toFrontY = this.frontAnchor.y - tail.y;
            const toFrontDist = Math.hypot(toFrontX, toFrontY) || 1;
            const dirX = toFrontX / toFrontDist;
            const dirY = toFrontY / toFrontDist;

            // 1. Horizontal tail steering (Left / Right arrows)
            // Responsive control so the player can easily flip the tail across the anchored head!
            if (steerX !== 0) {
              const movingTowardsHead = (steerX * toFrontX > 0);
              const dirResistance = movingTowardsHead ? 0.85 : 1.0;
              const tailHorizontalForce = 2500 * dirResistance * Math.max(0.85, slideEase) * resp * dt;
              for (let i = 0; i < N - 1; i++) {
                const ratio = Math.pow((N - 1 - i) / (N - 1), 0.75);
                this.nodes[i].vx += steerX * tailHorizontalForce * ratio;
              }

              // Only unstick grounded nodes or vault over the head when crossing close to the front anchor,
              // so the tail doesn't float artificially in mid-air when extended away from the head!
              const isCrossingHead = Math.abs(toFrontX) < this.extendedSegLen * 2.1;
              for (let i = 0; i < N - 1; i++) {
                const ratio = Math.pow((N - 1 - i) / (N - 1), 0.85);
                if (this.nodes[i].onGround) {
                  this.nodes[i].vy -= 260 * ratio * dt;
                  this.nodes[i].onGround = false;
                } else if (isCrossingHead && movingTowardsHead) {
                  // Vaulting arc over the anchored front paw to complete the flip cleanly
                  this.nodes[i].vy -= 420 * ratio * dt;
                }
              }
            }

            // 2. Longitudinal pull / push (Bending / Space)
            if (isBending) {
              const pullForce = 750 * slideEase * resp * dt;
              for (let i = 0; i < N - 2; i++) {
                const ratio = (N - 2 - i) / (N - 2);
                this.nodes[i].vx += dirX * pullForce * ratio;
                if (effSteerY >= 0 || dirY < 0) {
                  this.nodes[i].vy += dirY * pullForce * ratio;
                }
              }
            }

            // 3. Vertical tail control (Up / Down arrows) & Coherent Tail Fall ("retombée de la queue"):
            if (effSteerY > 0) {
              const downForce = 950 * resp * dt;
              for (let i = 0; i < N - 1; i++) {
                const ratio = (N - 1 - i) / (N - 1);
                this.nodes[i].vy += downForce * ratio;
              }
            } else if (effSteerY < 0) {
              let minBodyY = this.head.y;
              for (let i = 1; i < N; i++) {
                if (this.nodes[i].y < minBodyY) minBodyY = this.nodes[i].y;
              }
              const heightAboveBody = minBodyY - tail.y;

              let effortFactor = 1.0;
              if (heightAboveBody > 0) {
                effortFactor = Math.max(0.32, 1.0 / (1.0 + heightAboveBody * 0.008));
              }

              const baseLift = (isHoldingRear ? 1500 : 1280) * resp * dt;
              const liftForce = baseLift * effortFactor;
              for (let i = 0; i < N - 1; i++) {
                const ratio = Math.pow((N - 1 - i) / (N - 1), 0.85);
                this.nodes[i].vy -= liftForce * ratio;
              }

              if (heightAboveBody > 0 && tail.vy < 0) {
                const maxAscentSpeed = -80 - 260 * effortFactor;
                if (tail.vy < maxAscentSpeed) {
                  tail.vy = maxAscentSpeed;
                }
              }
            } else {
              // Not pressing Up: natural downward gravity assist on airborne tail segments so the tail drops cleanly!
              for (let i = 0; i < N - 2; i++) {
                if (!this.nodes[i].onGround) {
                  const ratio = (N - 2 - i) / (N - 2);
                  this.nodes[i].vy += 320 * ratio * dt;
                }
              }
            }
          }
        }
      }
    }

    // 3. Integrate Heavier Gravity, Surface-Normal Caterpillar Adhesion & Physical Larval Breathing
    const species = this.getSpecies();
    let currentGravity = (world.gravity || GAMEPLAY_CONFIG.gravity || 740) * mStats.gravityMult * (species.gravityMult || 1.0);
    const isVoltige = (this.activePowerUp && this.activePowerUp.type === 'feather') ||
                      (this.modifiers && (this.modifiers.includes('lune') || this.modifiers.includes('voltige')));
    if (isVoltige) {
      currentGravity *= 0.22; // Much lighter gravity: floats and glides gracefully!
    }
    // Light species glide gently while falling with an arrow held (much weaker than the feather)
    const isSpeciesGlide = !isVoltige && species.glide && hasSteer;

    for (let i = 0; i < N; i++) {
      const n = this.nodes[i];
      if (n.surfaceAdhesionTimer > 0) {
        n.surfaceAdhesionTimer = Math.max(0, n.surfaceAdhesionTimer - dt);
      }
      if ((i === 0 && rearLocked) || (i === 1 && rearSegmentLocked) || (i === N - 1 && frontLocked) || (i === N - 2 && frontSegmentLocked)) {
        if (i <= 1 && this.rearAnchor.propRef) {
          n.vx = this.rearAnchor.propRef.vx;
          n.vy = this.rearAnchor.propRef.vy;
        } else if (i >= N - 2 && this.frontAnchor.propRef) {
          n.vx = this.frontAnchor.propRef.vx;
          n.vy = this.frontAnchor.propRef.vy;
        } else {
          n.vx = 0;
          n.vy = 0;
        }
        continue;
      }

      const prev = this.nodes[Math.max(0, i - 1)];
      const next = this.nodes[Math.min(N - 1, i + 1)];
      const segDx = next.x - prev.x;
      const segDy = next.y - prev.y;
      const segLen = Math.hypot(segDx, segDy) || 1;
      const locNx = segDy / segLen;
      const locNy = -segDx / segLen;

      // Subtle, calm physical breathing wave (NO violent shaking!)
      const midWeight = Math.sin((i / (N - 1)) * Math.PI);
      const wiggleWave = Math.sin(this.wiggleTime * 3.5 - i * 0.8) * (GAMEPLAY_CONFIG.wigglePhysicsAmount || 4) * midWeight;
      n.vx += locNx * wiggleWave * dt;
      n.vy += locNy * wiggleWave * dt;

      // Subtle passive rotational drift in the air when doing nothing
      if (isAirborne && !hasSteer) {
        const centeredIdx = i - (N - 1) * 0.5;
        const passiveSpin = Math.sin(this.wiggleTime * 1.6) * 5.0;
        n.vx += locNx * centeredIdx * passiveSpin * dt;
        n.vy += locNy * centeredIdx * passiveSpin * dt;
      }

      const restingOnGentleSlope =
        n.onGround &&
        n.groundMaterial !== 'moss' &&
        n.groundSlopeGrade <= 0.30 &&
        (n.groundNy === undefined || n.groundNy < -0.5) &&
        !isHopping &&
        !isExtending &&
        !isBending &&
        !hasSteer &&
        Math.hypot(n.vx, n.vy) < 22;

      const wasGroundedOrAdhered = n.onGround || (n.surfaceAdhesionTimer > 0 && !isHopping && !isExtending);
      n.onGround = false;

      if (!restingOnGentleSlope) {
        const heightAboveGround = Math.max(0, lowestY - n.y);
        const isAnchoredOnePaw = (rearLocked && !frontLocked) || (frontLocked && !rearLocked);
        const isHeadPart = (i >= N - 2);
        const isLiftingHead = isHeadPart && effSteerY < 0;

        // Per-segment Surface-Normal Gravity Vector ("vecteur de gravité vers la plateforme sur laquelle elle est"):
        // When a segment rests on a platform/branch/wall/ceiling (except slippery moss) and isn't jumping or deliberately peeling away,
        // its local gravity pulls it toward that surface (-groundNx, -groundNy) so the caterpillar clings and crawls along walls & undersides!
        const canAdhereToSurface =
          wasGroundedOrAdhered &&
          n.groundMaterial !== 'moss' &&
          n.groundNx !== undefined &&
          n.groundNy !== undefined &&
          !isHopping &&
          !isExtending;

        let peelingAway = false;
        if (canAdhereToSurface && isHeadPart && hasSteer) {
          const steerPullOut = steerX * n.groundNx + effSteerY * n.groundNy;
          if (steerPullOut > 0.45 && n.groundNy < 0.2) {
            peelingAway = true;
          }
        }

        if (canAdhereToSurface && !peelingAway && (n.groundNy > -0.65 || Math.abs(n.groundNx) > 0.35)) {
          // Local surface adhesion gravity vector pulling the segment onto its supporting wall/branch/ceiling
          const adhereStrength = currentGravity * 1.08;
          n.vx -= n.groundNx * adhereStrength * dt;
          n.vy -= n.groundNy * adhereStrength * dt;
          // Slight world gravity residual (18%) so hanging upside-down still feels organic
          n.vy += currentGravity * 0.18 * dt;
        } else {
          // Standard world gravity with ground snapping
          const snapMult = (!isAnchoredOnePaw && !isLiftingHead && n.vy >= 0 && heightAboveGround < 50) ? (1.0 + (GAMEPLAY_CONFIG.groundSnapping || 1.3) * 0.35) : 1.0;

          let liftRelief = 1.0;
          if (effSteerY < 0 || (rearLocked && !frontLocked && this.rearingProgress > 0.1) || (isBending && hasSteer)) {
            if (rearLocked && !frontLocked) {
              const t = i / (N - 1);
              const threshold = isBending ? 0.0 : (1.0 - t) * 0.40;
              const segProg = Math.max(0, Math.min(1, (this.rearingProgress - threshold) / (1.0 - threshold)));
              const minRelief = isHoldingFront ? 0.35 : 0.08;
              liftRelief = Math.max(minRelief, 1.0 - segProg * (1.0 - minRelief));
            } else if (frontLocked && !rearLocked) {
              liftRelief = 0.85; // Tail stays down on surface
            } else {
              // Free on ground: Head lifts first with immediate relief; neck follows progressively; rear stays heavily grounded!
              if (i === N - 1) {
                liftRelief = isHoldingFront ? 0.35 : 0.05;
              } else if (i === N - 2) {
                const neckLift = isBending ? 1.0 : Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.22) / 0.45));
                liftRelief = 1.0 - neckLift * (isHoldingFront ? 0.45 : 0.65);
              } else {
                liftRelief = isBending ? 0.50 : 1.0;
              }
            }
          } else if (hasSteer && effSteerY < 0) {
            liftRelief = isHeadPart ? (isAnchoredOnePaw ? (isHoldingFront ? 0.45 : 0.25) : (isHoldingFront ? 0.65 : 0.50)) : 1.0;
          }
          const holdGravityMult = (isBending && (rearLocked || frontLocked || hasSteer)) ? 0.15 : liftRelief;
          n.vy += currentGravity * snapMult * holdGravityMult * dt;
        }
      } else {
        n.vx *= 0.45;
        n.vy = Math.max(0, n.vy) + currentGravity * 0.25 * dt;
      }

      // Crawl speed on ground/walls/ceilings when steering with arrows:
      // Forward base speed = 58 (or 102 with Speed Boost ⚡), Reverse base speed = 35 (or 62 with Speed Boost ⚡),
      // automatically slower when upside-down or climbing steep slopes!
      if (!isHopping && !isExtending && !frontLocked && anyOnGround && i < N - 2) {
        const { dx: frontDx } = this.getFrontVector();
        const facingDir = frontDx >= 0 ? 1 : -1;
        const isRev = (steerX !== 0) && (Math.sign(steerX) !== facingDir);
        const hasSpeedBoost = (this.activePowerUp && this.activePowerUp.type === 'speed');
        let slopeMult = 1.0;
        if (n.groundNy !== undefined && !species.wallClimber) {
          if (n.groundNy > 0.15) slopeMult = 0.62; // Slower upside down
          else if (Math.abs(n.groundNy) <= 0.45) slopeMult = 0.72; // Slower on steep walls
          else if (n.groundNx !== undefined) {
            const moveTangentY = (steerX >= 0) ? n.groundNx : -n.groundNx;
            if (moveTangentY < -0.18) slopeMult = Math.max(0.60, 1.0 + moveTangentY * 0.50);
          }
        }
        const crawlMult = species.crawlMult || 1.0;
        const baseForwardCrawl = 58 * crawlMult * (hasSpeedBoost ? 1.76 : 1.0) * slopeMult;
        const baseRevCrawl = 35 * crawlMult * (hasSpeedBoost ? 1.76 : 1.0) * slopeMult;
        const maxGroundCrawl = isRev ? baseRevCrawl : baseForwardCrawl;
        if (n.onGround || n.groundMaterial) {
          if (n.vx > maxGroundCrawl) n.vx = maxGroundCrawl;
          else if (n.vx < -maxGroundCrawl) n.vx = -maxGroundCrawl;
        }
      }

      // Voltige aerodynamic gliding & floating physics: floats like a leaf and planes with arrow keys
      if (isVoltige && isAirborne) {
        if (n.vy > 85) {
          n.vy = n.vy * 0.88 + 85 * 0.12; // Terminal fall speed capped: floats down gently!
        }
        if (hasSteer && steerX !== 0) {
          n.vx += steerX * 240 * dt;
          if (n.vy > 0) n.vy *= 0.93; // Aerodynamic lift while gliding!
        }
        if (particles && isFirstSubstep && i === Math.floor(N / 2) && Math.random() < 0.28) {
          particles.spawnFeatherDrift(n.x, n.y, 1);
        }
      }

      if (isSpeciesGlide && isAirborne && n.vy > 160) {
        n.vy = n.vy * 0.94 + 160 * 0.06;
      }

      // Smooth viscous damping
      const drag = isAirborne ? (isVoltige ? 0.997 : 0.994) : (hasSteer ? 0.968 : 0.978);
      n.vx *= Math.pow(drag, dt * 60);
      n.vy *= Math.pow(drag, dt * 60);

      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }

    // Viscous velocity coupling between neighbor segments
    for (let i = 0; i < N - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      const aPinned = (i === 0 && rearLocked);
      const bPinned = (i + 1 === N - 1 && frontLocked);
      const dvx = (b.vx - a.vx) * 0.14;
      const dvy = (b.vy - a.vy) * 0.14;
      if (!aPinned) {
        a.vx += dvx;
        a.vy += dvy;
      }
      if (!bPinned) {
        b.vx -= dvx;
        b.vy -= dvy;
      }
    }

    // Active outward skeletal détente during space release (true unfolding of the spine):
    // Snaps open the entire skeleton along the aim/facing vector to catch distant points!
    if (this.extensionTimer > 0) {
      const extRatio = Math.pow(this.extensionTimer / 0.36, 0.65);
      const reachBonus = GAMEPLAY_CONFIG.unbendReachBonus || 1.15;
      const curExtendedSegLen = this.extendedSegLen * reachBonus;

      if (rearLocked && !frontLocked) {
        let aimX = 0;
        let aimY = 0;
        if (this.extensionMomentum.aimX !== undefined && this.extensionMomentum.aimY !== undefined) {
          aimX = this.extensionMomentum.aimX;
          aimY = this.extensionMomentum.aimY;
        } else {
          let spineDx = this.head.x - this.rear.x;
          let spineDy = this.head.y - this.rear.y;
          const spineDist = Math.hypot(spineDx, spineDy) || 1;
          aimX = spineDx / spineDist;
          aimY = spineDy / spineDist;
        }

        const thrust = 750 * extRatio;
        const anchorPt = this.nodes[1];
        for (let i = 2; i < N; i++) {
          const ratio = (i - 1) / (N - 2);
          // Outward skeletal velocity thrust along true aimed spine
          this.nodes[i].vx += aimX * thrust * ratio * dt;
          this.nodes[i].vy += aimY * thrust * ratio * dt;

          // Smooth velocity-driven unrolling of curled spine towards full extension
          let idealX = anchorPt.x + aimX * curExtendedSegLen * (i - 1);
          let idealY = anchorPt.y + aimY * curExtendedSegLen * (i - 1);
          const obsHit1 = world.checkSegmentIntersection(anchorPt.x, anchorPt.y, idealX, idealY);
          if (obsHit1) {
            idealX = obsHit1.x + obsHit1.surfNx * (this.nodes[i].r + 3);
            idealY = obsHit1.y + obsHit1.surfNy * (this.nodes[i].r + 3);
          }
          const maxDelta1 = 110 * dt;
          this.nodes[i].vx += Math.max(-maxDelta1, Math.min(maxDelta1, (idealX - this.nodes[i].x) * (20.0 * extRatio) * ratio * dt));
          this.nodes[i].vy += Math.max(-maxDelta1, Math.min(maxDelta1, (idealY - this.nodes[i].y) * (20.0 * extRatio) * ratio * dt));
        }
      } else if (frontLocked && !rearLocked) {
        let aimX = steerX;
        let aimY = effSteerY;
        const aimDist = Math.hypot(aimX, aimY);
        if (aimDist > 0.1) {
          aimX /= aimDist;
          aimY /= aimDist;
        } else if (this.whipDir && (this.whipDir.x !== 0 || this.whipDir.y !== 0)) {
          aimX = this.whipDir.x;
          aimY = this.whipDir.y;
        } else {
          const fv = this.getFrontVector();
          aimX = -fv.dx;
          aimY = -fv.dy;
        }

        const isWhipping = this.whipCrackTimer > 0;
        const thrust = isWhipping ? 2600 : 340 * extRatio;
        const anchorPt = this.head;
        for (let i = 0; i < N - 1; i++) {
          const ratio = (N - 1 - i) / (N - 1);
          this.nodes[i].vx += aimX * thrust * ratio * dt;
          this.nodes[i].vy += aimY * thrust * ratio * dt;

          const segCountFromFront = N - 1 - i;
          let idealX = anchorPt.x + aimX * curExtendedSegLen * segCountFromFront;
          let idealY = anchorPt.y + aimY * curExtendedSegLen * segCountFromFront;
          const obsHit2 = world.checkSegmentIntersection(anchorPt.x, anchorPt.y, idealX, idealY);
          if (obsHit2 && !isWhipping) {
            idealX = obsHit2.x + obsHit2.surfNx * (this.nodes[i].r + 3);
            idealY = obsHit2.y + obsHit2.surfNy * (this.nodes[i].r + 3);
          }
          const maxDelta2 = (isWhipping ? 320 : 110) * dt;
          this.nodes[i].vx += Math.max(-maxDelta2, Math.min(maxDelta2, (idealX - this.nodes[i].x) * (isWhipping ? 50.0 : 20.0 * extRatio) * ratio * dt));
          this.nodes[i].vy += Math.max(-maxDelta2, Math.min(maxDelta2, (idealY - this.nodes[i].y) * (isWhipping ? 50.0 : 20.0 * extRatio) * ratio * dt));
        }
      } else if (!rearLocked && !frontLocked) {
        const headToTailX = this.rear.x - this.head.x;
        const headToTailY = this.rear.y - this.head.y;
        const isTailDetente = this.launchedFromHead || this.launchedTowardTail ||
          (hasSteer && ((steerX * headToTailX + effSteerY * headToTailY) > 0 || (steerX !== 0 && steerX * (this.head.x - this.rear.x) < 0)));

        let aimX = 0;
        let aimY = 0;
        if (isTailDetente) {
          // Desired direction is more toward the tail than the head:
          // Keep the détente straight along the head-to-tail axis and project the tail downward ("la queue qui est projetée vers le bas")
          // so the head NEVER teleports or crosses in front of the tail!
          const htLen = Math.hypot(headToTailX, headToTailY) || 1;
          let tDirX = headToTailX / htLen;
          let tDirY = headToTailY / htLen;
          if (hasSteer && steerX !== 0 && Math.sign(steerX) === Math.sign(tDirX)) {
            tDirX = tDirX * 0.65 + Math.sign(steerX) * 0.35;
          }
          // Project the tail downward ("vers le bas")
          tDirY = Math.max(0.32, tDirY * 0.60 + 0.35);
          const normT = Math.hypot(tDirX, tDirY) || 1;
          aimX = tDirX / normT;
          aimY = tDirY / normT;
        } else if (hasSteer) {
          // If player is steering in the head's direction, unbend directly in that direction!
          const sDist = Math.hypot(steerX, effSteerY) || 1;
          aimX = steerX / sDist;
          aimY = effSteerY / sDist;
        } else if (this.launchSpineDir) {
          aimX = this.launchSpineDir.x;
          aimY = this.launchSpineDir.y;
        } else {
          let sDx = this.head.x - this.rear.x;
          let sDy = this.head.y - this.rear.y;
          const sDist = Math.hypot(sDx, sDy);
          if (sDist > 12) {
            aimX = sDx / sDist;
            aimY = sDy / sDist;
          } else {
            const fv = this.getFrontVector();
            aimX = fv.dx;
            aimY = fv.dy;
          }
        }

        // When steering / advancing on the ground after a real jump or anchored inchworm step:
        const isAdvancingOnGround = anyOnGround && (hasSteer || steerX !== 0) && !isTailDetente && (this.launchSpinePower > 0 || this.hadAnchorDuringContraction) && this.spamPenaltyTimer <= 0;
        let anchorX, anchorY;
        if (isTailDetente) {
          // Tailward détente: anchor is at the head, and segments unfold straight towards the tail & downward!
          anchorX = this.head.x;
          anchorY = this.head.y;
        } else if (isAdvancingOnGround) {
          anchorX = this.nodes[0].x;
          anchorY = this.nodes[0].y;
        } else {
          let cx = 0, cy = 0;
          for (let i = 0; i < N; i++) { cx += this.nodes[i].x; cy += this.nodes[i].y; }
          anchorX = cx / N;
          anchorY = cy / N;
        }

        const thrust = (35 * (this.launchSpinePower || 0)) * extRatio;
        const midIdx = (N - 1) * 0.5;

        for (let i = 0; i < N; i++) {
          let idealX, idealY;
          if (isTailDetente) {
            // Segment i extends straight from the head toward the tail (and downward) according to its index from the front
            const segFromHead = (N - 1) - i;
            idealX = anchorX + aimX * (curExtendedSegLen * segFromHead);
            idealY = anchorY + aimY * (curExtendedSegLen * segFromHead);
          } else if (isAdvancingOnGround) {
            // Forward inchworm deployment: segment i extends strictly in front of segment i-1!
            idealX = anchorX + aimX * (curExtendedSegLen * i);
            idealY = anchorY + aimY * (curExtendedSegLen * i);
          } else {
            const offsetFromMid = i - midIdx;
            idealX = anchorX + aimX * (curExtendedSegLen * offsetFromMid);
            idealY = anchorY + aimY * (curExtendedSegLen * offsetFromMid);
          }
          const obsHit3 = world.checkSegmentIntersection(anchorX, anchorY, idealX, idealY);
          if (obsHit3) {
            idealX = obsHit3.x + obsHit3.surfNx * (this.nodes[i].r + 3);
            idealY = obsHit3.y + obsHit3.surfNy * (this.nodes[i].r + 3);
          }

          const ratio = isTailDetente ? ((N - 1 - i) / (N - 1)) : (isAdvancingOnGround ? (i / (N - 1)) : 1.0);
          const straightenPower = (18.0 + ((isAdvancingOnGround || isTailDetente) ? 10.0 : 0)) * extRatio;
          const maxAirDelta = 110 * dt;
          this.nodes[i].vx += Math.max(-maxAirDelta, Math.min(maxAirDelta, (idealX - this.nodes[i].x) * straightenPower * ratio * dt));
          this.nodes[i].vy += Math.max(-maxAirDelta, Math.min(maxAirDelta, (idealY - this.nodes[i].y) * straightenPower * ratio * dt));

          if (isTailDetente) {
            // Project the tail outward and downward ("c'est la queue qui est projetée vers le bas")
            const tailPush = 210 * ratio * extRatio * dt;
            this.nodes[i].vx += aimX * tailPush;
            this.nodes[i].vy += Math.max(0.40, aimY) * tailPush;
          } else if (isAdvancingOnGround) {
            // Calm crawling advance on ground
            const headLeadThrust = 180 * ratio * extRatio * dt;
            this.nodes[i].vx += aimX * headLeadThrust;
            this.nodes[i].vy += aimY * headLeadThrust;
          }

          if (thrust > 0 && !isTailDetente) {
            const trunkWeight = Math.sin((i / (N - 1)) * Math.PI);
            const rThrust = 0.35 * (i / (N - 1)) + 0.65 * trunkWeight;
            this.nodes[i].vx += aimX * thrust * rThrust * dt;
            this.nodes[i].vy += aimY * thrust * rThrust * dt;
          }
        }

      }

      // Extension damage: uncoiling/extending body strikes nearby enemies and knocks them back!
      const allEnemies = [...(world.aphids || []), ...(world.hedgehogs || []), ...(world.ants || [])];
      for (const e of allEnemies) {
        if (e.isHeld || e.isDefeated) continue;
        for (let i = 0; i < N; i++) {
          const n = this.nodes[i];
          const edx = e.x - n.x;
          const edy = e.y - n.y;
          const edist = Math.hypot(edx, edy) || 0.0001;
          const minHitDist = n.r + e.radius + 6;
          if (edist < minHitDist) {
            const pushDirX = edx / edist;
            const pushDirY = edy / edist;
            e.vx += pushDirX * 260;
            e.vy += (pushDirY < 0 ? pushDirY * 260 : -140);
            e.isFlying = true;
            if (world.damageEnemy) {
              world.damageEnemy(e, 8 + extRatio * 14, e.x, e.y, particles, 'extension_kick');
            }
            break;
          }
        }
      }

      // Extension kick on acorns: hitting them with body expansion helps crack them open!
      if (world.props) {
        for (const p of world.props) {
          if (p.isHeld || p.type !== 'acorn') continue;
          for (let i = 0; i < N; i++) {
            const n = this.nodes[i];
            const pdx = p.x - n.x;
            const pdy = p.y - n.y;
            const pdist = Math.hypot(pdx, pdy) || 0.0001;
            const minHitDist = n.r + p.radius + 6;
            if (pdist < minHitDist) {
              const pushDirX = pdx / pdist;
              const pushDirY = pdy / pdist;
              p.vx += pushDirX * 320;
              p.vy += (pushDirY < 0 ? pushDirY * 320 : -160);
              if (world.damageProp) {
                world.damageProp(p, 14 + extRatio * 18, p.x, p.y, particles, 'extension_kick');
              }
              break;
            }
          }
        }
      }
    }

    // 4. SKELETON CONSTRAINTS:
    // Pure longitudinal contraction / full extension to maximum reach
    // When steering while anchored, extend reach so players can stretch to surfaces with arrows alone:
    const steerExtensionBonus = (hasSteer && (rearLocked || frontLocked)) ? 1.06 : 1.0;
    const reachBonus = this.extensionTimer > 0 ? (GAMEPLAY_CONFIG.unbendReachBonus || 1.15) : steerExtensionBonus;
    const lengthMult = (this.activePowerUp && this.activePowerUp.type === 'length') ? 1.45 : 1.0;
    // Geometridae never shorten their segments: contraction folds them into an Ω loop instead
    const isOmega = this.getSpecies().contractStyle === 'omega';
    const targetSegLen = isOmega
      ? this.extendedSegLen * reachBonus * lengthMult
      : (this.extendedSegLen * reachBonus * lengthMult) * (1 - this.contraction) +
        (this.contractedSegLen * lengthMult) * this.contraction;

    const isSteeredTowardTail = this.launchedFromHead || this.launchedTowardTail ||
      (hasSteer && ((steerX * (this.rear.x - this.head.x) + effSteerY * (this.rear.y - this.head.y)) > 0 || (steerX !== 0 && steerX * (this.head.x - this.rear.x) < 0)));

    const constraintIterations = 4;
    for (let iter = 0; iter < constraintIterations; iter++) {
      // 1. Neighbor distance constraints
      for (let i = 0; i < N - 1; i++) {
        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;

        // Tail segment (i === 0) and head segment (i === N - 2) when anchored do NOT contract!
        const curTargetSegLen = ((i === 0 && rearLocked && rearSegmentLocked) || (i === N - 2 && frontLocked && frontSegmentLocked))
          ? this.extendedSegLen
          : targetSegLen;

        const diff = (d - curTargetSegLen) / d;

        const aPinned = (i === 0 && rearLocked) || (i === 1 && rearSegmentLocked);
        const bPinned = (i + 1 === N - 1 && frontLocked) || (i + 1 === N - 2 && frontSegmentLocked);

        const stiff = this.extensionTimer > 0 ? 0.90 : (0.55 + this.bodyRigidity * 0.20);
        if (aPinned && !bPinned) {
          b.x -= dx * diff * stiff;
          b.y -= dy * diff * stiff;
        } else if (bPinned && !aPinned) {
          a.x += dx * diff * stiff;
          a.y += dy * diff * stiff;
        } else if (!aPinned && !bPinned) {
          let wB = 0.5;
          if (!isBending && this.spamPenaltyTimer <= 0) {
            const hasSpeedBoost = (this.activePowerUp && this.activePowerUp.type === 'speed');
            if (diff < 0 && ((isExtending && (this.launchSpinePower > 0 || this.hadAnchorDuringContraction)) || (hasSteer && !frontLocked))) {
              if (isSteeredTowardTail && !rearLocked) {
                // Tailward uncoiling: push tail-ward node (a) outward (wA = 1 - wB = 0.88 / 0.74) instead of pushing head (b)!
                wB = (i === 0) ? 0.12 : 0.26;
              } else {
                // Compression / uncoiling: push head-ward node (b) forward
                wB = (i === N - 2) ? 0.88 : 0.74;
              }
            } else if (diff > 0 && hasSteer && !frontLocked) {
              // Tension when advancing: head (b) leads and pulls tail-ward node (a) taut behind the body!
              // Gentle bias (0.38..0.42) at normal walking speed so it doesn't accelerate the body; stronger bias (0.16..0.24) during Speed Boost!
              wB = hasSpeedBoost ? ((i === 0) ? 0.16 : 0.24) : ((i === 0) ? 0.38 : 0.42);
            } else if (diff > 0 && hasSteer && frontLocked && !rearLocked) {
              // When head is anchored and player steers the tail: tail (a) leads and pulls mid-body (b)
              wB = 0.76;
            }
          }
          const wA = 1.0 - wB;
          a.x += dx * diff * stiff * wA;
          a.y += dy * diff * stiff * wA;
          b.x -= dx * diff * stiff * wB;
          b.y -= dy * diff * stiff * wB;
        }
      }

      // 2. Anti-Crumple Skip-1 Distance Constraints: GUARANTEES the spine can NEVER knot or fold back!
      for (let i = 0; i < N - 2; i++) {
        const a = this.nodes[i];
        const c = this.nodes[i + 2];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        // Clean skip distance scaled smoothly so curled ball pose never buzzes or glitches
        const isFoldingTail = frontLocked && !rearLocked && (hasSteer || isBending);
        const minSkipDist = isFoldingTail
          ? targetSegLen * 0.62
          : (((i === 0 && rearSegmentLocked) || (i + 2 === N - 1 && frontSegmentLocked))
            ? (this.extendedSegLen + targetSegLen) * 0.72
            : targetSegLen * 1.48);
        if (d < minSkipDist) {
          const diff = (d - minSkipDist) / d; // negative
          const aPinned = (i === 0 && rearLocked) || (i === 1 && rearSegmentLocked);
          const cPinned = (i + 2 === N - 1 && frontLocked) || (i + 2 === N - 2 && frontSegmentLocked);
          const skipStiff = 0.50;

          if (aPinned && !cPinned) {
            c.x -= dx * diff * skipStiff;
            c.y -= dy * diff * skipStiff;
          } else if (cPinned && !aPinned) {
            a.x += dx * diff * skipStiff;
            a.y += dy * diff * skipStiff;
          } else if (!aPinned && !cPinned) {
            a.x += dx * diff * skipStiff * 0.5;
            a.y += dy * diff * skipStiff * 0.5;
            c.x -= dx * diff * skipStiff * 0.5;
            c.y -= dy * diff * skipStiff * 0.5;
          }
        }
      }
    }

    if (isOmega && this.contraction > 0.02) {
      this.applyOmegaLoop(targetSegLen, {
        rear: rearLocked, rearSeg: rearSegmentLocked, front: frontLocked, frontSeg: frontSegmentLocked
      });
    }

    // 3. Directional Détente Constraint:
    // When desired direction is aligned with the head, align Head ahead of Neck.
    // When desired direction is more toward the tail (isSteeredTowardTail), NEVER teleport the head across the neck!
    // Instead, straighten and project the TAIL (Node 0 & Node 1) downward along the tailward axis!
    if (isExtending && hasSteer && !frontLocked) {
      const aimDist = Math.hypot(steerX, effSteerY) || 1;
      const detDirX = steerX / aimDist;
      const detDirY = effSteerY / aimDist;

      if (isSteeredTowardTail && !rearLocked) {
        const tailDownY = Math.max(0.35, detDirY);
        const tLen = Math.hypot(detDirX, tailDownY) || 1;
        const tDirX = detDirX / tLen;
        const tDirY = tailDownY / tLen;

        const seg1 = this.nodes[1];
        const tDx = this.rear.x - seg1.x;
        const tDy = this.rear.y - seg1.y;
        const curTDist = Math.hypot(tDx, tDy) || targetSegLen;
        const tDot = (tDx * tDirX + tDy * tDirY) / curTDist;
        if (tDot < 0.75) {
          const targetTx = seg1.x + tDirX * curTDist;
          const targetTy = seg1.y + tDirY * curTDist;
          this.rear.x += (targetTx - this.rear.x) * 0.65;
          this.rear.y += (targetTy - this.rear.y) * 0.65;
        }
      } else {
        // Align Head (Node N-1) ahead of Neck (Node N-2) along detDir
        const neck = this.nodes[N - 2];
        const hDx = this.head.x - neck.x;
        const hDy = this.head.y - neck.y;
        const curHDist = Math.hypot(hDx, hDy) || targetSegLen;
        const hDot = (hDx * detDirX + hDy * detDirY) / curHDist;
        if (hDot < 0.75) {
          const targetHx = neck.x + detDirX * curHDist;
          const targetHy = neck.y + detDirY * curHDist;
          this.head.x += (targetHx - this.head.x) * 0.75;
          this.head.y += (targetHy - this.head.y) * 0.75;
        }

        // Also align Neck (Node N-2) ahead of thorax (Node N-3)
        if (N >= 3) {
          const thorax = this.nodes[N - 3];
          const nDx = neck.x - thorax.x;
          const nDy = neck.y - thorax.y;
          const curNDist = Math.hypot(nDx, nDy) || targetSegLen;
          const nDot = (nDx * detDirX + nDy * detDirY) / curNDist;
          if (nDot < 0.50) {
            const targetNx = thorax.x + detDirX * curNDist;
            const targetNy = thorax.y + detDirY * curNDist;
            neck.x += (targetNx - neck.x) * 0.50;
            neck.y += (targetNy - neck.y) * 0.50;
          }
        }
      }
    }

    // Straighten and uncoil the tail during a head-anchored whip crack ("oriente la queue droit dans cette direction"):
    if (this.whipCrackTimer > 0 && frontLocked) {
      const wDirX = this.whipDir ? this.whipDir.x : -1;
      const wDirY = this.whipDir ? this.whipDir.y : 0;
      for (let i = N - 2; i >= 0; i--) {
        const pivot = this.nodes[i + 1];
        const curDist = Math.hypot(this.nodes[i].x - pivot.x, this.nodes[i].y - pivot.y) || targetSegLen;
        const targetX = pivot.x + wDirX * curDist;
        const targetY = pivot.y + wDirY * curDist;
        this.nodes[i].x += (targetX - this.nodes[i].x) * 0.72;
        this.nodes[i].y += (targetY - this.nodes[i].y) * 0.72;
      }
    }

    // Immediate platform barrier enforcement after constraint iterations:
    for (let i = 0; i < N; i++) {
      const n = this.nodes[i];
      const isPinned = (i === 0 && rearLocked) || (i === 1 && rearSegmentLocked) ||
                       (i === N - 1 && frontLocked) || (i === N - 2 && frontSegmentLocked);
      if (isPinned) continue;

      const hit = world.checkSegmentIntersection(n.stepStartX, n.stepStartY, n.x, n.y);
      if (hit) {
        n.x = hit.x + hit.surfNx * (n.r + 2);
        n.y = hit.y + hit.surfNy * (n.r + 2);
        const vn = n.vx * hit.surfNx + n.vy * hit.surfNy;
        if (vn < 0) {
          n.vx -= hit.surfNx * vn;
          n.vy -= hit.surfNy * vn;
        }
      }
    }

    // Run gripped segment lock once per substep (smooth, no redundant velocity killing)
    this.enforceGrippedSegmentLocks(this.extendedSegLen);

    // 5. Handle World Collisions
    this.handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep);

    // Check melee whip strikes against enemies, props, and rival caterpillars:
    if (this.whipCrackTimer > 0) {
      this.checkWhipMeleeCollisions(world, particles);
    }
    // dt is the substep duration here, so the timer must tick on every substep
    if (this.whipCrackTimer > 0) {
      this.whipCrackTimer = Math.max(0, this.whipCrackTimer - dt);
    }

    // 6. Sprite / Texture Flip (Coherent Retournement):
    // Automatically rights the caterpillar when it lands on its back in mid-air.
    // "mais une fois qu'on a agrippé et qu'on ne lache pas on ne retourne plus la chenille jusqu'a lacher prise"
    const isGripped = (this.rearAnchor && this.rearAnchor.anchored) || (this.frontAnchor && this.frontAnchor.anchored);
    if (isFirstSubstep && this.flipCooldown <= 0 && !isGripped) {
      let dorsalTouches = 0;
      let footOnDorsal = false;

      for (let i = 0; i < N; i++) {
        const n = this.nodes[i];
        const hasSurface = n.onGround || (i === 0 && this.rearAnchor.anchored) || (i === N - 1 && this.frontAnchor.anchored);
        if (!hasSurface) continue;

        let tx = 0, ty = 0;
        if (i < N - 1) {
          tx = this.nodes[i + 1].x - this.nodes[i].x;
          ty = this.nodes[i + 1].y - this.nodes[i].y;
        } else {
          tx = this.nodes[i].x - this.nodes[i - 1].x;
          ty = this.nodes[i].y - this.nodes[i - 1].y;
        }
        const tLen = Math.hypot(tx, ty) || 1;
        const ux = tx / tLen;
        const uy = ty / tLen;

        const dNx = uy * this.dorsalSign;
        const dNy = -ux * this.dorsalSign;

        const surfNx = n.groundNx !== undefined ? n.groundNx : (i === 0 && this.rearAnchor.anchored ? this.rearAnchor.nx : (i === N - 1 && this.frontAnchor.anchored ? this.frontAnchor.nx : 0));
        const surfNy = n.groundNy !== undefined ? n.groundNy : (i === 0 && this.rearAnchor.anchored ? this.rearAnchor.ny : (i === N - 1 && this.frontAnchor.anchored ? this.frontAnchor.ny : -1));

        const dot = (surfNx || 0) * dNx + (surfNy || 0) * dNy;
        if (dot < -0.22) {
          dorsalTouches++;
          if (i === 0 || i === N - 1) {
            footOnDorsal = true;
          }
        }
      }

      if (dorsalTouches >= 3 && footOnDorsal) {
        this.dorsalSign = -this.dorsalSign;
        this.flipCooldown = 0.35;
        sound.playLaunch(0.35);
      }
    }
  }

  handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const isHopping = this.hopTimer > 0;
    const isExtending = this.extensionTimer > 0;
    const isBending = !!inputs.space || this.contraction > 0.04;
    const hasSteer = !!(inputs.left || inputs.right || inputs.up || inputs.down);
    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const { dx } = this.getFrontVector();
    const facingDir = dx >= 0 ? 1 : -1;
    const isReverse = !isBending && (steerX !== 0) && (Math.sign(steerX) !== facingDir);

    for (let i = 0; i < N; i++) {
      const n = this.nodes[i];
      const candidates = world.getAllSegmentsNear(n.x, n.y, n.r + 24);

      for (const seg of candidates) {
        const cp = world.closestPointOnSegment(n.x, n.y, seg);
        const minDist = n.r + (seg.thickness || 20) * 0.5;

        if (cp.dist < minDist) {
          const overlap = minDist - cp.dist;
          const slopeGrade = Math.abs(cp.tx) > 0.05 ? Math.abs(cp.ty / cp.tx) : 999;

          n.onGround = true;
          n.surfaceAdhesionTimer = 0.22;
          n.groundSlopeGrade = slopeGrade;
          n.groundNx = cp.nx;
          n.groundNy = cp.ny;
          n.groundMaterial = seg.material;

          const mat = MATERIALS[seg.material] || MATERIALS.dirt;

          if (seg.isDynamic && seg.plat) {
            const pushForce = n.mass * world.gravity * 1.25;
            world.applyPlatformForce(seg.plat, cp.cx, cp.cy, -cp.nx * pushForce, -cp.ny * pushForce, dt);
          }

          const isPinned = (i === 0 && this.rearAnchor.anchored) || (i === N - 1 && this.frontAnchor.anchored);

          if (!isPinned && n.stepStartX !== undefined) {
            const ccdHit = world.checkSegmentIntersection(n.stepStartX, n.stepStartY, n.x, n.y);
            if (ccdHit) {
              n.x = ccdHit.x + ccdHit.surfNx * (n.r + 2);
              n.y = ccdHit.y + ccdHit.surfNy * (n.r + 2);
              const vnCcd = n.vx * ccdHit.surfNx + n.vy * ccdHit.surfNy;
              if (vnCcd < 0) {
                n.vx -= ccdHit.surfNx * vnCcd;
                n.vy -= ccdHit.surfNy * vnCcd;
              }
              n.onGround = true;
            }
          }

          if (!isPinned) {
            let colNx = cp.nx;
            let colNy = cp.ny;

            const isHead = (i === N - 1);
            const isSteeredTail = (this.frontAnchor.anchored && !this.rearAnchor.anchored && (steerX !== 0 || inputs.up || inputs.down) && i < N - 1);

            if (seg.material !== 'moss' && slopeGrade <= 0.30 && colNy < -0.5) {
              n.x += colNx * overlap;
              n.y += colNy * overlap;

              const vn = n.vx * colNx + n.vy * colNy;
              const vt = n.vx * cp.tx + n.vy * cp.ty;
              const newVn = vn < 0 ? -vn * mat.restitution * 0.3 : vn;

              // Ground traction: allow free natural arching/contracting/tail-sliding/reversing without locking into dirt!
              const isLeadingReverse = isReverse && hasSteer && (i <= 1);
              const frictionRate = ((isHead && hasSteer) || isSteeredTail || isLeadingReverse)
                ? 2.5
                : ((isHopping || isExtending || isBending)
                  ? 8.0
                  : (hasSteer ? 8.5 : 48.0));
              let newVt = vt * Math.max(0, 1 - frictionRate * dt);
              if (!hasSteer && !isHopping && !isExtending && !isBending && Math.abs(newVt) < 24) {
                newVt = 0;
              }

              n.vx = colNx * newVn + cp.tx * newVt;
              n.vy = colNy * newVn + cp.ty * newVt;
              if (!hasSteer && !isHopping && !isExtending && !isBending && Math.abs(newVt) === 0 && vn <= 0) {
                n.vx = 0;
                n.vy = 0;
              }
            } else {
              n.x += colNx * overlap;
              n.y += colNy * overlap;

              const vn = n.vx * colNx + n.vy * colNy;
              const vt = n.vx * cp.tx + n.vy * cp.ty;
              const newVn = vn < 0 ? -vn * mat.restitution : vn;

              let newVt = vt;
              if (seg.material === 'moss') {
                newVt = vt * Math.max(0, 1 - 1.2 * dt);
              } else {
                const excessSlope = Math.max(0, slopeGrade - 0.30);
                const isLeadingReverse = isReverse && hasSteer && (i <= 1);
                const damping = ((isHead && hasSteer) || isSteeredTail || isLeadingReverse) ? 1.5 : (hasSteer ? 4.5 : Math.max(2.0, 18.0 - excessSlope * 20.0));
                newVt = vt * Math.max(0, 1 - damping * dt);
              }

              n.vx = colNx * newVn + cp.tx * newVt;
              n.vy = colNy * newVn + cp.ty * newVt;
            }
          }
        }
      }

      // Solid Collision with Heavy Boulder Pinecones & Acorns
      for (const prop of world.props) {
        // Skip only the specific paw node that is currently gripping this prop
        const isGrippingThisProp = (i === 0 && this.rearAnchor.anchored && this.rearAnchor.propRef === prop) ||
                                   (i === N - 1 && this.frontAnchor.anchored && this.frontAnchor.propRef === prop);
        if (isGrippingThisProp) {
          continue;
        }

        // For props when held or recently thrown: skip collision with body nodes to prevent self-propulsion!
        if (prop.isHeld || (prop.throwGraceTimer > 0 && prop.thrownBy === (this.playerId || 'local'))) {
          continue;
        }

        const dx = n.x - prop.x;
        const dy = n.y - prop.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const effPropRadius = prop.radius * 0.95;
        const minDist = n.r + effPropRadius;

        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          const rearPinned = (i === 0 && this.rearAnchor.anchored);
          const frontPinned = (i === N - 1 && this.frontAnchor.anchored);

          const bothOnThisProp = (this.rearAnchor.anchored && this.rearAnchor.propRef === prop) &&
                                 (this.frontAnchor.anchored && this.frontAnchor.propRef === prop);
          const totalMass = n.mass + prop.mass;
          const wNode = (rearPinned || frontPinned) ? 0 : 1.0;
          const wProp = (prop.isHeld || bothOnThisProp || rearPinned || frontPinned) ? 0 : (n.mass / totalMass);

          n.x += nx * overlap * wNode;
          n.y += ny * overlap * wNode;
          if (wProp > 0) {
            prop.x -= nx * overlap * wProp * 0.5;
            prop.y -= ny * overlap * wProp * 0.5;
            world.resolvePropSegmentCollisions(prop);
            world.resolvePropPropCollisions(prop);
          }

          if (ny < -0.35) {
            n.onGround = true;
            n.groundSlopeGrade = Math.abs(ny) > 0.05 ? Math.abs(nx / ny) : 999;
            n.groundNx = nx;
            n.groundNy = ny;
            n.groundMaterial = 'root';
          }

          const rx = nx * effPropRadius;
          const ry = ny * effPropRadius;
          const surfVx = prop.vx - prop.angVel * ry;
          const surfVy = prop.vy + prop.angVel * rx;

          const rvx = n.vx - surfVx;
          const rvy = n.vy - surfVy;
          const rvn = rvx * nx + rvy * ny;
          const tx = -ny;
          const ty = nx;
          const rvt = rvx * tx + rvy * ty;

          if (rvn < 0) {
            const imp = -rvn * 1.05;
            if (!rearPinned && !frontPinned) {
              n.vx += nx * imp * wNode;
              n.vy += ny * imp * wNode;
            }
            if (wProp > 0) {
              prop.vx -= nx * imp * wProp * 0.5;
              prop.vy -= ny * imp * wProp * 0.5;
            }
          }

          const torque = rx * (n.mass * world.gravity * 0.6) - ry * (-nx * n.mass * world.gravity * 0.3);
          const inertia = 0.65 * prop.mass * effPropRadius * effPropRadius;
          prop.angVel += (torque / inertia) * dt * 6;

          if (!rearPinned && !frontPinned) {
            n.vx -= tx * rvt * Math.min(1, dt * 20);
            n.vy -= ty * rvt * Math.min(1, dt * 20);
          }
        }
      }

      // Bouncy Mushroom Bumpers
      for (const m of world.mushrooms) {
        const dx = n.x - m.x;
        const dy = n.y - m.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = n.r + m.radius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          n.x = m.x + nx * minDist;
          n.y = m.y + ny * minDist;

          const bounceX = nx * 0.55 + Math.sin(m.angle) * 0.45;
          const bounceY = Math.min(-0.55, ny * 0.8 - 0.35);
          const bLen = Math.hypot(bounceX, bounceY) || 1;

          this.rearAnchor.anchored = false;
          this.rearAnchor.propRef = null;
          this.frontAnchor.anchored = false;
          this.frontAnchor.propRef = null;

          for (let k = 0; k < N; k++) {
            this.nodes[k].vx = (bounceX / bLen) * m.bounceSpeed * 0.58;
            this.nodes[k].vy = (bounceY / bLen) * m.bounceSpeed * 0.58;
          }

          if (m.squash <= 0.1) {
            m.squash = 1.0;
            sound.playBoing();
            particles.spawnDewBubbles(m.x, m.y - m.radius * 0.6, 6);
            particles.spawnPopup(m.x, m.y - m.radius, 'BOING !', '#ff85a2');
          }
        }
      }

      // Soft Squishy Aphids
      for (const a of world.aphids) {
        if (a.isHeld || a.isDefeated || (a.throwGraceTimer > 0 && a.thrownBy === (this.playerId || 'local'))) continue;
        const dx = n.x - a.x;
        const dy = n.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = n.r + a.radius;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          n.x += nx * overlap * 0.5;
          n.y += ny * overlap * 0.5;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          world.resolveEntitySegmentCollisions(a);

          const relVx = n.vx - a.vx;
          const relVy = n.vy - a.vy;
          const relVn = relVx * nx + relVy * ny;
          if (relVn < 0) {
            const imp = -relVn * 0.65;
            n.vx += nx * imp * 0.5;
            n.vy += ny * imp * 0.5;
            a.vx -= nx * imp * 0.8;
            a.vy -= ny * imp * 0.5;
            a.squashX = 1.3;
            a.squashY = 0.72;
            if (isFirstSubstep && imp > 35) {
              sound.playSqueak();
              particles.spawnPopup(a.x, a.y - a.radius, 'POUIC !', '#a8ff78');
            }
          }
        }
      }

      // Hedgehogs (Hérissons): Spikes hurt on back/rear, safe on front snout!
      if (world.hedgehogs) {
        for (const h of world.hedgehogs) {
          if (h.isHeld || h.isDefeated || (h.throwGraceTimer > 0 && h.thrownBy === (this.playerId || 'local'))) continue;
          const dx = n.x - h.x;
          const dy = n.y - h.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = n.r + h.radius;
          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            // Snout is in direction of h.facing (+1 right, -1 left)
            const isFrontSnout = (nx * h.facing > 0.35) && (ny > -0.65);
            if (!isFrontSnout && !h.isDefeated) {
              // Prickly spikes on back or rear!
              const knockDirX = nx * 340;
              const knockDirY = (ny < 0 ? ny * 340 : -220);
              this.takeDamage(25, knockDirX, knockDirY, particles, sound);
              h.squashX = 1.35;
              h.squashY = 0.70;
            } else {
              // Soft front snout bump
              const overlap = minDist - dist;
              n.x += nx * overlap * 0.5;
              n.y += ny * overlap * 0.5;
              h.x -= nx * overlap * 0.5;
              h.y -= ny * overlap * 0.5;
              world.resolveEntitySegmentCollisions(h);
            }
          }
        }
      }

      // Collectible Power-ups Check
      if (world.powerUps && world.powerUps.length > 0) {
        for (const p of world.powerUps) {
          if (p.collected) continue;
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < n.r + p.radius) {
            p.collected = true;
            p.respawnTimer = 20.0;
            this.applyPowerUp(p.type, p.type === 'feather' ? 3.0 : 15.0, particles, sound);
            break;
          }
        }
      }

      // Collectible Apples:
      // - 'heal' (from defeated Enemies & broken Acorns): restores +25 HP
      // - 'segment' (rare map secrets): adds +1 Permanent Segment
      if (world.apples && world.apples.length > 0) {
        for (const apple of world.apples) {
          if (apple.collected) continue;
          const adx = n.x - apple.x;
          const ady = n.y - apple.y;
          const adist = Math.hypot(adx, ady);
          if (adist < n.r + apple.radius + 6) {
            apple.collected = true;
            if (apple.kind === 'segment') {
              this.addPermanentSegment(particles);
            } else {
              this.healFromApple(25, particles);
            }
            break;
          }
        }
      }

      // Prickly Thorn Bushes (Ronces épineuses)
      if (world.thorns && world.thorns.length > 0) {
        for (const thorn of world.thorns) {
          const tdx = n.x - thorn.x;
          const tdy = n.y - thorn.y;
          const tdist = Math.hypot(tdx, tdy) || 0.0001;
          if (tdist < n.r + thorn.radius * 0.78) {
            const tnx = tdx / tdist;
            const tny = tdy / tdist;
            this.takeDamage(15, tnx * 280, Math.min(-180, tny * 260), particles, sound);
            break;
          }
        }
      }
    }

    // 2. Segment Link Collision Resolution with Platforms (guarantees the spine between nodes cannot pierce or pass through platforms!)
    for (let i = 0; i < N - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      const segDx = b.x - a.x;
      const segDy = b.y - a.y;
      const segLen = Math.hypot(segDx, segDy);
      if (segLen < 0.001) continue;

      const midX = (a.x + b.x) * 0.5;
      const midY = (a.y + b.y) * 0.5;
      const sampleR = (a.r + b.r) * 0.5;

      const aPinned = (i === 0 && this.rearAnchor.anchored);
      const bPinned = (i + 1 === N - 1 && this.frontAnchor.anchored);

      // A. Sample points along segment: midpoint (t=0.5) and extra points if segment is stretched
      const numSamples = segLen > 20 ? 3 : 1;
      const tValues = numSamples === 3 ? [0.25, 0.50, 0.75] : [0.50];

      for (const t of tValues) {
        const sx = a.x + segDx * t;
        const sy = a.y + segDy * t;
        const sr = (a.r * (1 - t) + b.r * t);

        const candidates = world.getAllSegmentsNear(sx, sy, sr + 24);
        for (const seg of candidates) {
          const cp = world.closestPointOnSegment(sx, sy, seg);
          const minDist = sr + (seg.thickness || 20) * 0.5;

          if (cp.dist < minDist) {
            const overlap = minDist - cp.dist;
            let colNx = cp.nx;
            let colNy = cp.ny;

            const wA = aPinned ? 0 : (bPinned ? 1.0 : (1 - t));
            const wB = bPinned ? 0 : (aPinned ? 1.0 : t);
            const sumW = wA + wB || 1.0;

            a.x += colNx * overlap * (wA / sumW);
            a.y += colNy * overlap * (wA / sumW);
            b.x += colNx * overlap * (wB / sumW);
            b.y += colNy * overlap * (wB / sumW);

            // Cancel inward velocity
            const vnA = a.vx * colNx + a.vy * colNy;
            if (vnA < 0) {
              a.vx -= colNx * vnA;
              a.vy -= colNy * vnA;
            }
            const vnB = b.vx * colNx + b.vy * colNy;
            if (vnB < 0) {
              b.vx -= colNx * vnB;
              b.vy -= colNy * vnB;
            }
          }
        }
      }

      // B. Line segment crossing test: detects if segment (a, b) physically intersects a platform segment
      const candidates = world.getAllSegmentsNear(midX, midY, segLen + 20);
      for (const seg of candidates) {
        const d = (b.x - a.x) * (seg.y2 - seg.y1) - (b.y - a.y) * (seg.x2 - seg.x1);
        if (Math.abs(d) > 0.0001) {
          const tLine = ((seg.x1 - a.x) * (seg.y2 - seg.y1) - (seg.y1 - a.y) * (seg.x2 - seg.x1)) / d;
          const uLine = -((b.x - a.x) * (seg.y1 - a.y) - (b.y - a.y) * (seg.x1 - a.x)) / d;
          if (tLine >= 0 && tLine <= 1 && uLine >= 0 && uLine <= 1) {
            // Piercing detected! Push nodes out along platform surface normal
            const sDx = seg.x2 - seg.x1;
            const sDy = seg.y2 - seg.y1;
            const sL = Math.hypot(sDx, sDy) || 1;
            const pNx = sDy / sL;
            const pNy = -sDx / sL;
            const clearPush = (sampleR + (seg.thickness || 20) * 0.5) * 1.1;
            if (!aPinned) {
              a.x += pNx * clearPush * 0.5;
              a.y += pNy * clearPush * 0.5;
              const vnA = a.vx * pNx + a.vy * pNy;
              if (vnA < 0) { a.vx -= pNx * vnA; a.vy -= pNy * vnA; }
            }
            if (!bPinned) {
              b.x += pNx * clearPush * 0.5;
              b.y += pNy * clearPush * 0.5;
              const vnB = b.vx * pNx + b.vy * pNy;
              if (vnB < 0) { b.vx -= pNx * vnB; b.vy -= pNy * vnB; }
            }
          }
        }
      }
    }

    // Absolute velocity safety clamp across all nodes (prevents exploding or flying away when coiled/entangled)
    const mStats = this.getModifierStats();
    const hasStrengthPower = (this.activePowerUp && this.activePowerUp.type === 'strength') ||
                            (this.modifiers && this.modifiers.includes('super_forte')) ||
                            mStats.strengthMult > 1.35;
    // Speed cap scaled with the species' own jump (body length × apex fraction, relative to
    // the classic caterpillar), otherwise every species' jump was clipped to the same speed
    const sp = this.getSpecies();
    const jumpScale = Math.max(1, Math.sqrt((this.fullLength * (sp.jumpHeightFrac || 0.67)) / 109));
    const maxSafeSpeed = (hasStrengthPower ? 640 : 360) * jumpScale;
    for (let i = 0; i < N; i++) {
      const spd = Math.hypot(this.nodes[i].vx, this.nodes[i].vy);
      if (spd > maxSafeSpeed) {
        this.nodes[i].vx = (this.nodes[i].vx / spd) * maxSafeSpeed;
        this.nodes[i].vy = (this.nodes[i].vy / spd) * maxSafeSpeed;
      }
    }

    this.keepBodyOutsideSegments(world, particles);

    // Sticky Crumbs
    for (const c of world.stickyCrumbs) {
      this.checkStickyTrap(this.rearAnchor, this.rear, false, c, particles);
      this.checkStickyTrap(this.frontAnchor, this.head, true, c, particles);
    }
  }

  // Final safety net of each substep: no body edge may cross a world segment.
  // Nodes are collided one by one, so a node shoved past the midline of a thick
  // branch (by constraints, anchors or segment locks) used to pop out on the far
  // side, leaving the body threaded through the branch. Here the offending node is
  // put back on the same side as its neighbour.
  keepBodyOutsideSegments(world, particles) {
    const N = this.nodes.length;
    // A foot only counts as fixed when the node is still near its grip point
    // (a stale anchor far from its node must not freeze the correction)
    const isPinnedAt = (anchor, node) => anchor.anchored && !this.isHoldingMovable(anchor) &&
      Math.hypot(node.x - anchor.x, node.y - anchor.y) < node.r * 4;
    const rearPinned = isPinnedAt(this.rearAnchor, this.rear);
    const frontPinned = isPinnedAt(this.frontAnchor, this.head);

    // Corrections propagate away from gripped feet: of the two nodes of a crossing
    // edge, move the one further (along the body) from a fixed foot.
    const pinnedIdx = [];
    if (rearPinned) pinnedIdx.push(0);
    if (frontPinned) pinnedIdx.push(N - 1);
    const chainDist = (idx) => pinnedIdx.length ? Math.min(...pinnedIdx.map((p) => Math.abs(p - idx))) : Infinity;

    for (let pass = 0; pass < N; pass++) {
      let corrected = false;
      for (let i = 0; i < N - 1; i++) {
        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        const reach = Math.hypot(b.x - a.x, b.y - a.y) * 0.5 + 40;
        const segs = world.getAllSegmentsNear((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, reach);
        for (const seg of segs) {
          const cross = this.edgeCrossesSegment(a, b, seg, segs);
          if (!cross) continue;

          const aPinned = i === 0 && rearPinned;
          const bPinned = i + 1 === N - 1 && frontPinned;
          let mover;
          if (aPinned && bPinned) {
            // Both feet gripped on opposite faces of the same branch: impossible pose,
            // the tail lets go.
            this.releaseAnchor(this.rearAnchor, false, particles);
            mover = a;
          } else if (aPinned) {
            mover = b;
          } else if (bPinned) {
            mover = a;
          } else if (chainDist(i) !== chainDist(i + 1)) {
            mover = chainDist(i) > chainDist(i + 1) ? a : b;
          } else {
            // Prefer the node that changed side during this substep
            const crossedA = a.stepStartX !== undefined && Math.sign(this.signedSegDist(seg, a.stepStartX, a.stepStartY)) !== Math.sign(cross.da);
            const crossedB = b.stepStartX !== undefined && Math.sign(this.signedSegDist(seg, b.stepStartX, b.stepStartY)) !== Math.sign(cross.db);
            if (crossedA !== crossedB) mover = crossedA ? a : b;
            else mover = Math.abs(cross.da) < Math.abs(cross.db) ? a : b;
          }
          // Solid ground only has one valid side: its outward face
          const side = (seg.isGroundMass && !seg.isDynamic) ? 1 : Math.sign(mover === a ? cross.db : cross.da) || 1;

          const cp = world.closestPointOnSegment(mover.x, mover.y, seg);
          const nx = cp.surfNx * side;
          const ny = cp.surfNy * side;
          const clearance = (seg.thickness || 20) * 0.5 + mover.r + 1;
          mover.x = cp.cx + nx * clearance;
          mover.y = cp.cy + ny * clearance;
          const vn = mover.vx * nx + mover.vy * ny;
          if (vn < 0) {
            mover.vx -= nx * vn;
            mover.vy -= ny * vn;
          }
          corrected = true;
        }
      }
      if (!corrected) return;
    }

    // Still threaded after every pass: the feet hold the body in an impossible pose
    // (typically gripped on opposite faces of a branch). The tail lets go.
    if (this.rearAnchor.anchored) {
      for (let i = 0; i < N - 1; i++) {
        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        const segs = world.getAllSegmentsNear((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, Math.hypot(b.x - a.x, b.y - a.y) * 0.5 + 40);
        if (segs.some((seg) => this.edgeCrossesSegment(a, b, seg, segs))) {
          this.releaseAnchor(this.rearAnchor, false, particles);
          // Give the body a moment to slide back before the held key re-grips
          this.rearAnchor.noGripTimer = 0.25;
          return;
        }
      }
    }
  }

  signedSegDist(seg, px, py) {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.hypot(dx, dy) || 1;
    return ((px - seg.x1) * dy - (py - seg.y1) * dx) / len;
  }

  // Returns the signed distances of a and b when edge a-b crosses the segment's
  // centerline, ignoring crossings at a free tip (wrapping around a branch end is legal).
  edgeCrossesSegment(a, b, seg, neighbours) {
    const da = this.signedSegDist(seg, a.x, a.y);
    const db = this.signedSegDist(seg, b.x, b.y);
    if (da === 0 || db === 0 || Math.sign(da) === Math.sign(db)) return null;
    const t = da / (da - db);
    const ix = a.x + (b.x - a.x) * t;
    const iy = a.y + (b.y - a.y) * t;
    const sdx = seg.x2 - seg.x1;
    const sdy = seg.y2 - seg.y1;
    const len = Math.hypot(sdx, sdy) || 1;
    const along = ((ix - seg.x1) * sdx + (iy - seg.y1) * sdy) / len;
    if (along < 0 || along > len) return null;
    const tipMargin = Math.min((seg.thickness || 20) * 0.5, Math.max(a.r, b.r));
    const isFreeEnd = (x, y) => !neighbours.some((o) => o !== seg &&
      ((Math.abs(o.x1 - x) < 1 && Math.abs(o.y1 - y) < 1) || (Math.abs(o.x2 - x) < 1 && Math.abs(o.y2 - y) < 1)));
    if (along < tipMargin && isFreeEnd(seg.x1, seg.y1)) return null;
    if (along > len - tipMargin && isFreeEnd(seg.x2, seg.y2)) return null;
    return { da, db };
  }

  checkStickyTrap(anchor, node, isFront, crumb, particles) {
    if (anchor.stuckCrumb === crumb) return;
    if (anchor.stuckCooldown > 0) return;
    const dist = Math.hypot(node.x - crumb.x, node.y - crumb.y);
    if (dist < node.r + crumb.radius * 0.7) {
      anchor.stuckCrumb = crumb;
      anchor.stuckStrength = 1.0;
      anchor.anchored = true;
      anchor.x = crumb.x;
      anchor.y = crumb.y - crumb.radius * 0.25;
      anchor.nx = 0;
      anchor.ny = -1;
      anchor.tx = 1;
      anchor.ty = 0;
      anchor.material = 'sticky';
      sound.playSticky(false);
      if (particles) {
        particles.spawnStickyGoo(crumb.x, crumb.y, 7);
      }
    }
  }

  updateStickyExtraction(safeDt, spaceHeld, particles) {
    if (this.rearAnchor.stuckCooldown > 0) {
      this.rearAnchor.stuckCooldown = Math.max(0, this.rearAnchor.stuckCooldown - safeDt);
    }
    if (this.frontAnchor.stuckCooldown > 0) {
      this.frontAnchor.stuckCooldown = Math.max(0, this.frontAnchor.stuckCooldown - safeDt);
    }

    const rearStuck = !!this.rearAnchor.stuckCrumb;
    const frontStuck = !!this.frontAnchor.stuckCrumb;
    if (!rearStuck && !frontStuck) return;

    // Pulling occurs when holding space or when contracting
    const isPulling = spaceHeld || this.contraction > 0.18;

    // 1. Rear paw is stuck, front paw grips a surface/prop/branch:
    if (rearStuck && this.frontAnchor.anchored && !frontStuck) {
      if (isPulling) {
        this.rearAnchor.stuckStrength = Math.max(0, (this.rearAnchor.stuckStrength !== undefined ? this.rearAnchor.stuckStrength : 1.0) - safeDt * (3.0 + this.contraction * 4.5));
        if (particles && Math.random() < 0.35) {
          particles.spawnStickyGoo(this.rear.x, this.rear.y, 2);
        }
        if (this.rearAnchor.stuckStrength <= 0 || this.contraction >= 0.30) {
          const c = this.rearAnchor.stuckCrumb;
          this.rearAnchor.stuckCrumb = null;
          this.rearAnchor.anchored = false;
          this.rearAnchor.stuckStrength = 0;
          this.rearAnchor.stuckCooldown = 1.0;
          sound.playSticky(true);
          sound.playLaunch(0.35);
          if (particles) {
            particles.spawnStickyGoo(c.x, c.y, 12);
            particles.spawnMud(this.rear.x, this.rear.y, 0, -1, 6, 0.45);
          }
          const pullDx = this.head.x - this.rear.x;
          const pullDy = this.head.y - this.rear.y;
          const pDist = Math.hypot(pullDx, pullDy) || 1;
          this.rear.vx += (pullDx / pDist) * 260;
          this.rear.vy += (pullDy / pDist) * 260 - 70;
        }
      }
    }
    // 2. Front paw is stuck, rear paw grips a surface/prop/branch:
    else if (frontStuck && this.rearAnchor.anchored && !rearStuck) {
      if (isPulling) {
        this.frontAnchor.stuckStrength = Math.max(0, (this.frontAnchor.stuckStrength !== undefined ? this.frontAnchor.stuckStrength : 1.0) - safeDt * (3.0 + this.contraction * 4.5));
        if (particles && Math.random() < 0.35) {
          particles.spawnStickyGoo(this.head.x, this.head.y, 2);
        }
        if (this.frontAnchor.stuckStrength <= 0 || this.contraction >= 0.30) {
          const c = this.frontAnchor.stuckCrumb;
          this.frontAnchor.stuckCrumb = null;
          this.frontAnchor.anchored = false;
          this.frontAnchor.stuckStrength = 0;
          this.frontAnchor.stuckCooldown = 1.0;
          sound.playSticky(true);
          sound.playLaunch(0.35);
          if (particles) {
            particles.spawnStickyGoo(c.x, c.y, 12);
            particles.spawnMud(this.head.x, this.head.y, 0, -1, 6, 0.45);
          }
          const pullDx = this.rear.x - this.head.x;
          const pullDy = this.rear.y - this.head.y;
          const pDist = Math.hypot(pullDx, pullDy) || 1;
          this.head.vx += (pullDx / pDist) * 260;
          this.head.vy += (pullDy / pDist) * 260 - 70;
        }
      }
    }
  }

  updateAnchor(anchor, node, isFront, dt, world, particles, isFirstSubstep) {
    if (anchor.stuckCrumb) {
      const c = anchor.stuckCrumb;
      node.x = c.x;
      node.y = c.y - c.radius * 0.2;
      node.vx = 0;
      node.vy = 0;
      anchor.x = node.x;
      anchor.y = node.y;
      return;
    }

    if (!anchor.holdingKey) {
      anchor.anchored = false;
      anchor.slipping = false;
      if (anchor.aphidRef) {
        anchor.aphidRef.isHeld = false;
        anchor.aphidRef = null;
      }
      if (anchor.hedgehogRef) {
        anchor.hedgehogRef.isHeld = false;
        anchor.hedgehogRef = null;
      }
      if (anchor.antRef) {
        anchor.antRef.isHeld = false;
        anchor.antRef = null;
      }
      if (anchor.propRef) {
        anchor.propRef.isHeld = false;
        anchor.propRef = null;
      }
      anchor.playerRef = null;
      anchor.playerNodeIndex = -1;
      anchor.segRef = null;
      anchor.localPt = null;
      anchor.swingVx = 0;
      anchor.swingVy = 0;
      return;
    }

    const mStats = this.getModifierStats();
    anchor.swingVx = (anchor.swingVx || 0) * 0.65 + node.vx * 0.35;
    anchor.swingVy = (anchor.swingVy || 0) * 0.65 + node.vy * 0.35;

    if (anchor.anchored) {
      if (anchor.playerRef) {
        const otherCat = anchor.playerRef;
        if (!otherCat.nodes || otherCat.nodes.length === 0) {
          anchor.playerRef = null;
          anchor.anchored = false;
          return;
        }
        const pIdx = Math.max(0, Math.min(otherCat.nodes.length - 1, anchor.playerNodeIndex || 0));
        const targetNode = otherCat.nodes[pIdx];
        if (targetNode) {
          const dx = targetNode.x - node.x;
          const dy = targetNode.y - node.y;
          const dist = Math.hypot(dx, dy) || 1;
          const attachDist = (node.r + targetNode.r) * 0.78;
          const nx = dx / dist;
          const ny = dy / dist;
          const diff = dist - attachDist;
          const otherAnchor = isFront ? this.rearAnchor : this.frontAnchor;
          const selfGrounded = otherAnchor.anchored && !this.isHoldingMovable(otherAnchor);
          const pullRivalWeight = selfGrounded ? Math.min(0.84, 0.56 * mStats.strengthMult) : 0.46;
          const pullSelfWeight = 1.0 - pullRivalWeight;
          node.x += nx * diff * pullSelfWeight;
          node.y += ny * diff * pullSelfWeight;
          targetNode.x -= nx * diff * pullRivalWeight;
          targetNode.y -= ny * diff * pullRivalWeight;
          targetNode.vx = targetNode.vx * 0.65 + node.vx * 0.35;
          targetNode.vy = targetNode.vy * 0.65 + node.vy * 0.35;
          anchor.x = node.x;
          anchor.y = node.y;
          anchor.nx = -nx;
          anchor.ny = -ny;
          return;
        }
      }

      // Helper to carry a grabbed enemy effortlessly at the tip of the paw (never dragging the caterpillar node down!)
      const holdEnemyOnPaw = (enemy, distFactor = 0.88) => {
        enemy.isHeld = true;
        const holdDist = enemy.radius * distFactor + node.r * 0.68;
        let { dx, dy } = this.getFrontVector();
        if (!isFront) { dx = -dx; dy = -dy; }
        // Slight upward bias (-0.38) so the held enemy clears the ground easily when lifting
        let outX = dx;
        let outY = dy - 0.38;
        const outLen = Math.hypot(outX, outY) || 1;
        outX /= outLen;
        outY /= outLen;

        enemy.x = node.x + outX * holdDist;
        enemy.y = node.y + outY * holdDist;
        world.resolveEntitySegmentCollisions(enemy);
        enemy.vx = node.vx;
        enemy.vy = node.vy;

        anchor.nx = -outX;
        anchor.ny = -outY;
        anchor.x = node.x;
        anchor.y = node.y;
      };

      if (anchor.hedgehogRef) {
        holdEnemyOnPaw(anchor.hedgehogRef, 0.90);
        return;
      }

      if (anchor.aphidRef) {
        holdEnemyOnPaw(anchor.aphidRef, 0.88);
        return;
      }

      if (anchor.antRef) {
        const ant = anchor.antRef;
        ant.aiState = 'patrol';
        ant.windupTimer = 0;
        holdEnemyOnPaw(ant, 0.90);
        return;
      }

      if (anchor.propRef) {
        const prop = anchor.propRef;
        const hasSuperStrength = (this.activePowerUp && this.activePowerUp.type === 'strength') || mStats.strengthMult > 1.35;
        const isLightProp = prop.type === 'acorn' || prop.mass < 15 || hasSuperStrength;
        const effR = prop.radius * 0.95 + node.r * 0.80;
        const worldAngle = prop.angle + anchor.propLocalAngle;
        const nx = Math.cos(worldAngle);
        const ny = Math.sin(worldAngle);
        const surfX = prop.x + nx * effR;
        const surfY = prop.y + ny * effR;

        const pullX = node.x - surfX;
        const pullY = node.y - surfY;

        const otherAnchor = isFront ? this.rearAnchor : this.frontAnchor;
        const bothOnSameProp = otherAnchor.anchored && otherAnchor.propRef === prop;

        if (bothOnSameProp) {
          // When holding the prop with BOTH paws, internal forces must NEVER pull/push the prop
          // Stabilize the prop (prevent phantom rolling or displacement)
          prop.angVel *= 0.60;
          prop.vx *= 0.85;

          world.resolvePropSegmentCollisions(prop);
          world.resolvePropPropCollisions(prop);

          anchor.nx = nx;
          anchor.ny = ny;
          anchor.tx = -ny;
          anchor.ty = nx;
          anchor.x = prop.x + nx * effR;
          anchor.y = prop.y + ny * effR;

          node.x = anchor.x;
          node.y = anchor.y;
          node.vx = prop.vx;
          node.vy = prop.vy;
          return;
        }

        if (isLightProp) {
          // Grabbable light props (Acorns or Pinecones with Super Forte) move with the caterpillar's mouth or tail!
          prop.isHeld = true;
          const targetPropX = node.x - nx * effR;
          const targetPropY = node.y - ny * effR;
          prop.x = targetPropX;
          prop.y = targetPropY;
          world.resolvePropSegmentCollisions(prop);
          world.resolvePropPropCollisions(prop);

          node.x = prop.x + nx * effR;
          node.y = prop.y + ny * effR;
          prop.vx = node.vx;
          prop.vy = node.vy;
          if (prop.onGround && node.vy > 0) {
            node.vy = 0;
            node.onGround = true;
          }

          anchor.nx = nx;
          anchor.ny = ny;
          anchor.tx = -ny;
          anchor.ty = nx;
          anchor.x = node.x;
          anchor.y = node.y;
          return;
        }

        const wProp = (node.mass / (node.mass + prop.mass)) * 0.15;
        prop.x += pullX * wProp;
        prop.y += pullY * wProp;
        world.resolvePropSegmentCollisions(prop);
        world.resolvePropPropCollisions(prop);

        const rx = nx * prop.radius * 0.95;
        const ry = ny * prop.radius * 0.95;
        const torque = rx * (pullY * 6 + node.mass * world.gravity * 0.2) - ry * (pullX * 6);
        const inertia = 0.65 * prop.mass * prop.radius * prop.radius;
        prop.angVel += (torque / inertia) * dt * 2.0;

        anchor.nx = nx;
        anchor.ny = ny;
        anchor.tx = -ny;
        anchor.ty = nx;
        anchor.x = prop.x + nx * effR;
        anchor.y = prop.y + ny * effR;

        node.x = anchor.x;
        node.y = anchor.y;
        node.vx = prop.vx;
        node.vy = prop.vy;
        return;
      }

      if (anchor.segRef && anchor.segRef.isDynamic && anchor.segRef.plat && anchor.localPt) {
        const plat = anchor.segRef.plat;
        const wp = world.platformLocalToWorld(plat, anchor.localPt.lx, anchor.localPt.ly);
        anchor.x = wp.x;
        anchor.y = wp.y;
        const cp = world.closestPointOnSegment(anchor.x, anchor.y, anchor.segRef);
        anchor.nx = cp.nx;
        anchor.ny = cp.ny;
        anchor.tx = cp.tx;
        anchor.ty = cp.ty;
        world.applyPlatformForce(plat, anchor.x, anchor.y, 0, node.mass * world.gravity * 1.3, dt);
      }

      if (anchor.material === 'moss' && anchor.segRef && !this.getSpecies().mossGrip) {
        anchor.slipping = true;
        const s = anchor.segRef;
        const cp = world.closestPointOnSegment(node.x, node.y, s);

        const slideSpeed = (world.gravity * cp.ty) * 0.35;
        const halfThick = (s.thickness || 20) * 0.5 + node.r * 0.85;
        anchor.x = cp.cx + cp.nx * halfThick + cp.tx * slideSpeed * dt;
        anchor.y = cp.cy + cp.ny * halfThick + cp.ty * slideSpeed * dt;
        anchor.nx = cp.nx;
        anchor.ny = cp.ny;
        anchor.tx = cp.tx;
        anchor.ty = cp.ty;

        if (isFirstSubstep && Math.abs(slideSpeed) > 8 && Math.random() < 0.25) {
          particles.spawnDewBubbles(anchor.x, anchor.y, 1);
          sound.playSlipBubble();
        }
      } else {
        anchor.slipping = false;
      }

      // The foot is snapped back onto its grip point every substep. If the body was
      // dragged to the other side of a branch meanwhile, that snap would teleport it
      // through the wood: let go instead.
      if (Math.hypot(anchor.x - node.x, anchor.y - node.y) > node.r &&
          world.checkSegmentIntersection(node.x, node.y, anchor.x, anchor.y)) {
        this.releaseAnchor(anchor, isFront, particles);
        return;
      }

      node.x = anchor.x;
      node.y = anchor.y;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    if (anchor.noGripTimer > 0) {
      anchor.noGripTimer -= dt;
      return;
    }

    const extraGrip = ((this.bodyClass && this.bodyClass.gripExtraDistance) || 0) + (mStats.extraGrip || 0);
    const baseGripDist = (this.roomConfig && this.roomConfig.gripDistance) || GAMEPLAY_CONFIG.gripDistance || 22;
    const maxSurfaceGap = Math.max(8, Math.min(44, baseGripDist + extraGrip));
    const suctionRange = node.r + maxSurfaceGap;

    // Check grabbable enemy Ants (Fourmis) — Counter-grab neutralizes their suplex!
    if (world.findClosestAnt) {
      const antHit = world.findClosestAnt(node.x, node.y, suctionRange + 8);
      if (antHit) {
        anchor.anchored = true;
        anchor.antRef = antHit.ant;
        anchor.hedgehogRef = null;
        anchor.aphidRef = null;
        anchor.propRef = null;
        anchor.playerRef = null;
        anchor.segRef = null;
        anchor.localPt = null;
        anchor.facingSign = undefined;
        anchor.slipping = false;
        anchor.material = 'stem';
        anchor.nx = antHit.nx;
        anchor.ny = antHit.ny;
        anchor.tx = antHit.tx;
        anchor.ty = antHit.ty;
        anchor.x = antHit.cx;
        anchor.y = antHit.cy;
        antHit.ant.isHeld = true;
        antHit.ant.aiState = 'patrol';
        antHit.ant.windupTimer = 0;

        node.x = anchor.x;
        node.y = anchor.y;

        sound.playGrip(isFront);
        if (particles) {
          particles.spawnSuctionRing(anchor.x, anchor.y, '#ff6b6b');
          particles.spawnPopup(anchor.x, anchor.y - 28, '🐜 FOURMI SAISIE !', '#ffd93b');
        }
        return;
      }
    }

    // Check grabbable enemy hedgehogs (safe front snout, dangerous spikes on back/rear!)
    if (world.findClosestHedgehog) {
      const hHit = world.findClosestHedgehog(node.x, node.y, suctionRange);
      if (hHit) {
        if (hHit.isFrontHead) {
          anchor.anchored = true;
          anchor.hedgehogRef = hHit.hedgehog;
          anchor.antRef = null;
          anchor.aphidRef = null;
          anchor.propRef = null;
          anchor.playerRef = null;
          anchor.segRef = null;
          anchor.localPt = null;
          anchor.facingSign = undefined;
          anchor.slipping = false;
          anchor.material = 'stem';
          anchor.nx = hHit.nx;
          anchor.ny = hHit.ny;
          anchor.tx = hHit.tx;
          anchor.ty = hHit.ty;
          anchor.x = hHit.cx;
          anchor.y = hHit.cy;
          hHit.hedgehog.isHeld = true;

          node.x = anchor.x;
          node.y = anchor.y;

          sound.playGrip(isFront);
          particles.spawnSuctionRing(anchor.x, anchor.y, '#ffd93b');
          return;
        } else if (hHit.isSpiky && !hHit.hedgehog.isDefeated) {
          this.takeDamage(25, hHit.nx * 340, -220, particles, sound);
          return;
        }
      }
    }

    // Check grabbable enemy aphids first!
    const aphidHit = world.findClosestAphid(node.x, node.y, suctionRange);
    if (aphidHit) {
      anchor.anchored = true;
      anchor.aphidRef = aphidHit.aphid;
      anchor.antRef = null;
      anchor.propRef = null;
      anchor.playerRef = null;
      anchor.segRef = null;
      anchor.localPt = null;
      anchor.facingSign = undefined;
      anchor.slipping = false;
      anchor.material = 'stem';
      anchor.nx = aphidHit.nx;
      anchor.ny = aphidHit.ny;
      anchor.tx = aphidHit.tx;
      anchor.ty = aphidHit.ty;
      anchor.x = aphidHit.cx;
      anchor.y = aphidHit.cy;
      aphidHit.aphid.isHeld = true;

      node.x = anchor.x;
      node.y = anchor.y;

      sound.playGrip(isFront);
      particles.spawnSuctionRing(anchor.x, anchor.y, '#a8ff78');
      return;
    }

    // Check grabbable rival caterpillars in shared world PvP!
    if (world.findClosestOtherCaterpillar) {
      const catHit = world.findClosestOtherCaterpillar(this, node.x, node.y, suctionRange);
      if (catHit) {
        anchor.anchored = true;
        anchor.playerRef = catHit.caterpillar;
        anchor.playerNodeIndex = catHit.nodeIndex;
        anchor.hedgehogRef = null;
        anchor.antRef = null;
        anchor.aphidRef = null;
        anchor.propRef = null;
        anchor.segRef = null;
        anchor.localPt = null;
        anchor.facingSign = undefined;
        anchor.slipping = false;
        anchor.material = 'stem';
        anchor.nx = catHit.nx;
        anchor.ny = catHit.ny;
        anchor.tx = catHit.tx;
        anchor.ty = catHit.ty;
        anchor.x = catHit.cx;
        anchor.y = catHit.cy;

        node.x = anchor.x;
        node.y = anchor.y;

        sound.playGrip(isFront);
        if (particles) {
          particles.spawnSuctionRing(anchor.x, anchor.y, '#ff6b81');
          particles.spawnPopup(anchor.x, anchor.y - 24, 'AGRIPPÉ ! 🤼', '#ff6b81');
        }
        return;
      }
    }

    const propHit = world.findClosestPropSurface(node.x, node.y, suctionRange);
    const hit = world.findClosestSurface(node.x, node.y, suctionRange);

    if (propHit && (!hit || propHit.dist <= hit.dist + 4)) {
      anchor.anchored = true;
      anchor.propRef = propHit.prop;
      anchor.aphidRef = null;
      anchor.playerRef = null;
      anchor.segRef = null;
      anchor.localPt = null;
      anchor.facingSign = undefined;
      anchor.propLocalAngle = propHit.localAngle;
      anchor.slipping = false;
      anchor.material = 'root';
      anchor.nx = propHit.nx;
      anchor.ny = propHit.ny;
      anchor.tx = propHit.tx;
      anchor.ty = propHit.ty;
      anchor.x = propHit.cx + propHit.nx * (node.r * 0.80);
      anchor.y = propHit.cy + propHit.ny * (node.r * 0.80);

      node.x = anchor.x;
      node.y = anchor.y;
      node.vx = propHit.prop.vx;
      node.vy = propHit.prop.vy;

      sound.playGrip(isFront);
      particles.spawnSuctionRing(anchor.x, anchor.y, '#ffd93b');
      this.alignDorsalToSurface(anchor, isFront);
      return;
    }

    if (hit) {
      anchor.anchored = true;
      anchor.segRef = hit.seg;
      anchor.aphidRef = null;
      anchor.propRef = null;
      anchor.playerRef = null;
      anchor.facingSign = undefined;
      anchor.material = hit.material;
      anchor.nx = hit.nx;
      anchor.ny = hit.ny;
      anchor.tx = hit.tx;
      anchor.ty = hit.ty;
      anchor.x = hit.cx + hit.nx * (node.r * 0.82);
      anchor.y = hit.cy + hit.ny * (node.r * 0.82);

      if (hit.seg.isDynamic && hit.seg.plat) {
        anchor.localPt = world.platformWorldToLocal(hit.seg.plat, anchor.x, anchor.y);
      } else {
        anchor.localPt = null;
      }

      anchor.slipping = hit.material === 'moss';

      node.x = anchor.x;
      node.y = anchor.y;
      node.vx = 0;
      node.vy = 0;

      sound.playGrip(isFront);
      particles.spawnSuctionRing(anchor.x, anchor.y, isFront ? '#38d84e' : '#b84eff');
      this.alignDorsalToSurface(anchor, isFront);
    }
  }

  updateExpressions(dt) {
    const head = this.head;
    const speed = Math.hypot(head.vx, head.vy);

    this.blinkTimer -= dt;
    if (this.blinkTimer < -0.14) {
      this.blinkTimer = 2.2 + Math.random() * 2.5;
    }

    if (
      this.rearAnchor.stuckCrumb ||
      this.frontAnchor.stuckCrumb ||
      this.contraction > 0.45
    ) {
      this.expression = 'strain';
    } else if (!this.rearAnchor.anchored && !this.frontAnchor.anchored && (head.vy > 130 || speed > 210)) {
      this.expression = 'panic';
    } else {
      this.expression = 'happy';
    }
  }

  // ==================== ORGANIC CONTINUOUS CATERPILLAR RENDERING ====================
  draw(ctx, time) {
    const pal = COSMETIC_PALETTES[this.cosmetics.palette] || COSMETIC_PALETTES.emerald;
    const N = this.numNodes;
    const rear = this.rear;
    const head = this.head;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Damage invulnerability blinking (i-frames visual feedback)
    if (this.invulnerableTimer > 0 && Math.floor(time * 24) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Dynamic whip slash trail during whip crack attack (world space, drawn behind the body)
    if (this.whipCrackTimer > 0) {
      const alpha = Math.min(1.0, this.whipCrackTimer / 0.25);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 234, 167, ${0.85 * alpha})`;
      ctx.lineWidth = 14 * alpha;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(this.head.x, this.head.y);
      for (let i = this.nodes.length - 2; i >= 0; i--) {
        ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
      }
      ctx.stroke();

      ctx.strokeStyle = `rgba(253, 203, 110, ${0.95 * alpha})`;
      ctx.lineWidth = 6 * alpha;
      ctx.stroke();
      ctx.restore();
    }


    // 1. DENSE SMOOTH SPINE SPLINE (24 samples along 5-node skeleton)
    const numSamples = 24;
    const centerPoints = [];

    // Pass 1: Catmull-Rom spline positions + concentrated trunk tension tremor
    for (let s = 0; s < numSamples; s++) {
      const u = (s / (numSamples - 1)) * (N - 1);
      const idx = Math.min(N - 2, Math.floor(u));
      const frac = u - idx;

      const p0 = this.nodes[Math.max(0, idx - 1)];
      const p1 = this.nodes[idx];
      const p2 = this.nodes[idx + 1];
      const p3 = this.nodes[Math.min(N - 1, idx + 2)];

      const t2 = frac * frac;
      const t3 = t2 * frac;
      let sx = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * frac +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      let sy = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * frac +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      const normS = s / (numSamples - 1); // 0 at rear, 1 at head
      const trunkWeight = Math.sin(normS * Math.PI); // 0 at feet and head, peak at midsection

      // Concentrated trunk tension tremor during maximum bend/charge
      // (Feet and head remain planted and calm: trembling is purely in the muscular trunk!)
      if (this.chargeShake > 0) {
        const trunkTremorAmp = this.chargeShake * 1.5 * trunkWeight;
        const txShake = Math.sin(time * 50.0 + s * 1.5) * trunkTremorAmp;
        const tyShake = Math.cos(time * 65.0 + s * 1.5) * trunkTremorAmp;
        sx += txShake;
        sy += tyShake;
      }

      centerPoints.push({ x: sx, y: sy, normS, trunkWeight });
    }

    // Pass 2: Calculate smooth tangents & true perpendicular normals on the bent spine
    // (Prevents any self-intersection, pinching, or polygon tearing artifacts!)
    const rawTangents = [];
    for (let s = 0; s < numSamples; s++) {
      const prev = centerPoints[Math.max(0, s - 1)];
      const next = centerPoints[Math.min(numSamples - 1, s + 1)];
      let tx = next.x - prev.x;
      let ty = next.y - prev.y;
      if (s === 0) {
        tx = next.x - centerPoints[0].x;
        ty = next.y - centerPoints[0].y;
      } else if (s === numSamples - 1) {
        tx = centerPoints[numSamples - 1].x - prev.x;
        ty = centerPoints[numSamples - 1].y - prev.y;
      }
      const tLen = Math.hypot(tx, ty) || 1;
      rawTangents.push({ ux: tx / tLen, uy: ty / tLen });
    }

    const samples = [];
    const classScale = (this.bodyClass && this.bodyClass.visualScale) || 1.0;
    const sizeMult = (this.sizeScale || 1.0) * classScale;
    const bodyShape = this.cosmetics.bodyShape || 'larve';

    for (let s = 0; s < numSamples; s++) {
      const pt = centerPoints[s];

      // 3-tap smoothed tangent across adjacent samples (suppresses any local spline curvature spikes)
      const pT = rawTangents[Math.max(0, s - 1)];
      const cT = rawTangents[s];
      const nT = rawTangents[Math.min(numSamples - 1, s + 1)];
      let ux = pT.ux * 0.25 + cT.ux * 0.50 + nT.ux * 0.25;
      let uy = pT.uy * 0.25 + cT.uy * 0.50 + nT.uy * 0.25;
      const uLen = Math.hypot(ux, uy) || 1;
      ux /= uLen;
      uy /= uLen;

      // True perpendicular dorsal/ventral normal along the actual curved spine
      const nx = uy * this.dorsalSign;
      const ny = -ux * this.dorsalSign;

      // Per-segment leg orientation ("retourner ses pattes en fonction de la plateforme sur laquelle chaque segment repose"):
      // Check the nearest physical node's supporting surface normal (groundNx, groundNy) or anchor normal.
      // If the platform is on the opposite side of default ventral (-nx, -ny), flip legSign for this segment so its feet plant onto that platform!
      const nodeFloat = pt.normS * (N - 1);
      const nearIdx = Math.max(0, Math.min(N - 1, Math.round(nodeFloat)));
      const nearNode = this.nodes[nearIdx];
      let legSign = 1;
      if (nearNode) {
        let sNx = 0;
        let sNy = 0;
        let hasSurf = false;
        if (nearIdx === 0 && this.rearAnchor.anchored) {
          sNx = this.rearAnchor.nx || 0;
          sNy = this.rearAnchor.ny !== undefined ? this.rearAnchor.ny : -1;
          hasSurf = true;
        } else if (nearIdx === N - 1 && this.frontAnchor.anchored) {
          sNx = this.frontAnchor.nx || 0;
          sNy = this.frontAnchor.ny !== undefined ? this.frontAnchor.ny : -1;
          hasSurf = true;
        } else if ((nearNode.onGround || (nearNode.surfaceAdhesionTimer || 0) > 0) && nearNode.groundNx !== undefined) {
          sNx = nearNode.groundNx;
          sNy = nearNode.groundNy;
          hasSurf = true;
        }
        if (hasSurf) {
          // sNx, sNy points outward from the platform toward the segment center.
          // Default dorsal is (nx, ny). If dot(sN, dorsal) < -0.18, the platform is on the dorsal side of this segment, so flip its legs toward the platform!
          const dotDorsal = sNx * nx + sNy * ny;
          if (dotDorsal < -0.18) {
            legSign = -1;
          }
        }
      }

      // Body thickness profile tailored to chosen body shape
      const profile = Math.sin(Math.pow(pt.normS, 0.72) * Math.PI);
      const plump = 1 + this.contraction * 0.12;

      let baseR = 12.8 + profile * 4.2;
      if (bodyShape === 'fin') {
        // Filiforme & fin
        baseR = 7.6 + profile * 2.6;
      } else if (bodyShape === 'boudine') {
        // Segments renflés en accordéon
        const lobeWave = Math.sin(pt.normS * (N - 1) * Math.PI);
        baseR = 11.5 + profile * 3.6 + Math.abs(lobeWave) * 4.5;
      }
      const r = baseR * plump * sizeMult;

      const dx = pt.x + nx * r;
      const dy = pt.y + ny * r;
      const vx = pt.x - nx * r;
      const vy = pt.y - ny * r;

      samples.push({
        x: pt.x,
        y: pt.y,
        ux,
        uy,
        nx,
        ny,
        legNx: nx * legSign,
        legNy: ny * legSign,
        r,
        normS: pt.normS,
        dx,
        dy,
        vx,
        vy
      });
    }

    // 2. FEET & LEGS UNDERNEATH BODY
    // 2a. Rear suction foot (anal clasper / Q)
    const tailSeg = samples[0];
    this.drawSuctionFoot(ctx, rear.x, rear.y, tailSeg.ux, tailSeg.uy, tailSeg.legNx, tailSeg.legNy, this.rearAnchor, false, this.rearCanGrip, pal, time);

    // 2b. Front suction foot (mouth / head clasper / D)
    const frontSeg = samples[numSamples - 2];
    this.drawSuctionFoot(ctx, head.x, head.y, frontSeg.ux, frontSeg.uy, frontSeg.legNx, frontSeg.legNy, this.frontAnchor, true, this.frontCanGrip, pal, time);

    // 2c. Cute Multilegged Caterpillar Feet along belly:
    // 10 pairs of adorable little feet (abdominal prolegs + thoracic true legs) with plump stalks and rounded toe pads!
    const allLegSamples = [
      { s: 2, isThoracic: false },
      { s: 4, isThoracic: false },
      { s: 6, isThoracic: false },
      { s: 8, isThoracic: false },
      { s: 10, isThoracic: false },
      { s: 12, isThoracic: false },
      { s: 14, isThoracic: false },
      { s: 16, isThoracic: true },
      { s: 18, isThoracic: true },
      { s: 20, isThoracic: true }
    ];
    // Geometridae have no legs mid-body: only rear prolegs and front true legs
    const species = this.getSpecies();
    const legSamples = species.contractStyle === 'omega'
      ? allLegSamples.filter((l) => l.s <= 4 || l.s >= 18)
      : allLegSamples;

    const isAirborne = !this.nodes.some(n => n.onGround);
    const crawlSpeed = Math.hypot(this.nodes[0].vx, this.nodes[0].vy) + Math.hypot(this.head.vx, this.head.vy);
    const isMoving = crawlSpeed > 10;
    const crawlPhase = this.crawlPhase || 0;

    const drawCuteLeg = (cfg, legIdx, isBackRow) => {
      const seg = samples[cfg.s];
      if (!seg) return;

      const lnx = seg.legNx !== undefined ? seg.legNx : seg.nx;
      const lny = seg.legNy !== undefined ? seg.legNy : seg.ny;

      const phaseOffset = isBackRow ? Math.PI : 0;
      const legPhase = crawlPhase * 2.2 - legIdx * 0.65 + phaseOffset;

      const swingAmp = isMoving ? (cfg.isThoracic ? 4.2 : 3.2) : (isAirborne ? Math.sin(time * 5.0 + legIdx * 0.8) * 2.5 : 1.0);
      const swing = Math.sin(legPhase) * swingAmp;
      const liftAmp = isMoving ? 2.5 : 0;
      const lift = Math.max(0, Math.cos(legPhase)) * liftAmp;

      // Base of the leg oriented toward the supporting surface (-lnx, -lny)
      const depthOffset = isBackRow ? -seg.r * 0.16 : 0;
      const bx = seg.x - lnx * (seg.r * 0.82 + depthOffset);
      const by = seg.y - lny * (seg.r * 0.82 + depthOffset);

      const legLen = (cfg.isThoracic ? 8.5 : 7.0) * sizeMult;
      const effLen = Math.max(2.5, legLen - lift);
      const tipX = bx - lnx * effLen + seg.ux * (swing + (cfg.isThoracic ? 1.5 : 0));
      const tipY = by - lny * effLen + seg.uy * (swing + (cfg.isThoracic ? 1.5 : 0));

      const stalkWidth = (isBackRow ? (cfg.isThoracic ? 3.8 : 4.8) : (cfg.isThoracic ? 5.2 : 6.4)) * sizeMult;
      const padR = (isBackRow ? (cfg.isThoracic ? 2.4 : 3.0) : (cfg.isThoracic ? 3.2 : 4.0)) * sizeMult;

      // Stalk outline
      ctx.strokeStyle = isBackRow ? '#140c06' : pal.outline;
      ctx.lineWidth = stalkWidth + 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Stalk fleshy fill
      ctx.strokeStyle = isBackRow ? '#385828' : (cfg.isThoracic ? pal.belly : pal.bodyFill);
      ctx.lineWidth = stalkWidth;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Cute rounded tip pad / bean
      ctx.fillStyle = isBackRow ? '#55823e' : (cfg.isThoracic ? pal.belly : '#ff9eb5');
      ctx.strokeStyle = isBackRow ? '#140c06' : pal.outline;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(tipX, tipY, padR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cute shiny highlight on front row pads
      if (!isBackRow) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(tipX - seg.nx * 0.6 - 0.7, tipY - seg.ny * 0.6 - 0.7, padR * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Draw back row first (far side depth), then front row
    for (let li = 0; li < legSamples.length; li++) {
      drawCuteLeg(legSamples[li], li, true);
    }
    for (let li = 0; li < legSamples.length; li++) {
      drawCuteLeg(legSamples[li], li, false);
    }

    // 3. CONTINUOUS SMOOTH CATERPILLAR BODY HULL (No overlapping balls!)
    const buildBodyHullPath = () => {
      ctx.beginPath();
      const t0 = samples[0];
      const tailBackX = t0.x - t0.ux * (t0.r * 0.85);
      const tailBackY = t0.y - t0.uy * (t0.r * 0.85);
      ctx.moveTo(tailBackX, tailBackY);

      // Curve around tail to first dorsal point
      ctx.quadraticCurveTo(t0.x - t0.ux * (t0.r * 0.4) + t0.nx * (t0.r * 0.7), t0.y - t0.uy * (t0.r * 0.4) + t0.ny * (t0.r * 0.7), t0.dx, t0.dy);

      // Smooth spline along dorsal edge to neck
      for (let s = 1; s < numSamples - 1; s++) {
        const prev = samples[s - 1];
        const curr = samples[s];
        const midX = (prev.dx + curr.dx) * 0.5;
        const midY = (prev.dy + curr.dy) * 0.5;
        ctx.quadraticCurveTo(prev.dx, prev.dy, midX, midY);
      }
      const tHead = samples[numSamples - 1];
      ctx.lineTo(tHead.dx, tHead.dy);

      // Rounded neck / head junction
      ctx.quadraticCurveTo(tHead.x + tHead.ux * 4, tHead.y + tHead.uy * 4, tHead.vx, tHead.vy);

      // Smooth spline along ventral edge back down to tail
      for (let s = numSamples - 2; s >= 0; s--) {
        const next = samples[s + 1];
        const curr = samples[s];
        const midX = (next.vx + curr.vx) * 0.5;
        const midY = (next.vy + curr.vy) * 0.5;
        ctx.quadraticCurveTo(next.vx, next.vy, midX, midY);
      }

      // Close around tail clasper
      ctx.quadraticCurveTo(t0.x - t0.ux * (t0.r * 0.4) - t0.nx * (t0.r * 0.7), t0.y - t0.uy * (t0.r * 0.4) - t0.ny * (t0.r * 0.7), tailBackX, tailBackY);
      ctx.closePath();
    };

    if (bodyShape === 'spheres') {
      // 3. RETRO CONNECTED SPHERES (Style V1 des premières versions)
      for (let i = 0; i < N - 1; i++) {
        const node = this.nodes[i];
        const nextNode = this.nodes[i + 1];
        const segDx = nextNode.x - node.x;
        const segDy = nextNode.y - node.y;
        const segLen = Math.hypot(segDx, segDy) || 1;
        const ux = segDx / segLen;
        const uy = segDy / segLen;
        const nx = uy * this.dorsalSign;
        const ny = -ux * this.dorsalSign;

        const sphereR = (node.r || 16) * sizeMult * (1 + this.contraction * 0.12);

        // Power-up aura glow
        if (this.activePowerUp && this.activePowerUp.timer > 0) {
          const auraColors = { speed: '#00d2d3', strength: '#ff9f43', giant: '#ee5253', length: '#10ac84', feather: '#54a0ff' };
          const auraColor = auraColors[this.activePowerUp.type] || '#ffd93b';
          ctx.save();
          ctx.strokeStyle = auraColor;
          ctx.lineWidth = 10;
          ctx.globalAlpha = 0.45;
          ctx.beginPath();
          ctx.arc(node.x, node.y, sphereR + 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Dark cartoon outline
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, sphereR + 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pal.outline;
        ctx.fill();

        // 3D Spherical Radial Gradient
        const sGrad = ctx.createRadialGradient(
          node.x + nx * (sphereR * 0.35) - ux * (sphereR * 0.2),
          node.y + ny * (sphereR * 0.35) - uy * (sphereR * 0.2),
          sphereR * 0.12,
          node.x,
          node.y,
          sphereR
        );
        sGrad.addColorStop(0, pal.bodyTop);
        sGrad.addColorStop(0.55, pal.bodyFill);
        sGrad.addColorStop(1, pal.bodyShade);

        ctx.beginPath();
        ctx.arc(node.x, node.y, sphereR, 0, Math.PI * 2);
        ctx.fillStyle = sGrad;
        ctx.fill();

        // Creamy ventral belly crescent
        ctx.save();
        ctx.clip();
        ctx.fillStyle = pal.belly;
        ctx.beginPath();
        ctx.arc(node.x - nx * (sphereR * 0.55), node.y - ny * (sphereR * 0.55), sphereR * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Specular shine reflection dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
        ctx.beginPath();
        ctx.arc(
          node.x + nx * (sphereR * 0.45) - ux * (sphereR * 0.25),
          node.y + ny * (sphereR * 0.45) - uy * (sphereR * 0.25),
          sphereR * 0.26,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Dorsal spot or monarch zebra stripe
        if (pal.isStriped) {
          ctx.strokeStyle = '#1e272e';
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          ctx.moveTo(node.x + nx * (sphereR * 0.2), node.y + ny * (sphereR * 0.2));
          ctx.lineTo(node.x + nx * sphereR, node.y + ny * sphereR);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(node.x + nx * (sphereR * 0.25) + ux * 2, node.y + ny * (sphereR * 0.25) + uy * 2);
          ctx.lineTo(node.x + nx * sphereR + ux * 2, node.y + ny * sphereR + uy * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = pal.spots;
          ctx.beginPath();
          ctx.arc(node.x + nx * (sphereR * 0.52), node.y + ny * (sphereR * 0.52), sphereR * 0.20, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    } else {
      // PASS 0: Power-up magical aura glow
      if (this.activePowerUp && this.activePowerUp.timer > 0) {
        const auraColors = {
          speed: '#00d2d3',
          strength: '#ff9f43',
          giant: '#ee5253',
          length: '#10ac84',
          feather: '#54a0ff'
        };
        const auraColor = auraColors[this.activePowerUp.type] || '#ffd93b';
        const pulse = 1 + Math.sin(time * 12) * 0.15;
        ctx.save();
        buildBodyHullPath();
        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 14 * pulse;
        ctx.globalAlpha = 0.42 + Math.sin(time * 10) * 0.18;
        ctx.stroke();
        ctx.restore();
      }

      // PASS A: Solid dark cartoon outline
      ctx.save();
      buildBodyHullPath();
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 4.8;
      ctx.stroke();

      // PASS B: Body fill with rich skin gradient
      const midSample = samples[Math.floor(numSamples * 0.5)];
      const grad = ctx.createLinearGradient(
        midSample.x + midSample.nx * 20,
        midSample.y + midSample.ny * 20,
        midSample.x - midSample.nx * 20,
        midSample.y - midSample.ny * 20
      );
      grad.addColorStop(0, pal.bodyTop);
      grad.addColorStop(0.55, pal.bodyFill);
      grad.addColorStop(1, pal.bodyShade);
      ctx.fillStyle = grad;
      ctx.fill();

      // PASS C: Creamy soft belly contour clipped to body
      ctx.save();
      ctx.clip();
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.moveTo(samples[0].vx, samples[0].vy);
      for (let s = 1; s < numSamples; s++) {
        ctx.lineTo(samples[s].vx, samples[s].vy);
      }
      for (let s = numSamples - 1; s >= 0; s--) {
        const seg = samples[s];
        const bx = seg.x - seg.nx * (seg.r * 0.28);
        const by = seg.y - seg.ny * (seg.r * 0.28);
        ctx.lineTo(bx, by);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();

      // 4. SEGMENT ANNULI & FOLDS (Authentic caterpillar segments)
      const foldFractions = species.contractStyle === 'omega'
        ? [0.14, 0.26, 0.38, 0.50, 0.62, 0.74, 0.86] // thin twig-like rings
        : (species.id === 'monarque' ? [0.16, 0.30, 0.44, 0.58, 0.72, 0.86] : [0.22, 0.42, 0.62, 0.80]);
      for (let fi = 0; fi < foldFractions.length; fi++) {
        const sIdx = Math.floor(foldFractions[fi] * (numSamples - 1));
        const seg = samples[sIdx];

        // Transverse segment crease from ventral to dorsal
        ctx.save();
        ctx.strokeStyle = 'rgba(19, 54, 31, 0.30)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const cMidX = seg.x - seg.ux * 2.2;
        const cMidY = seg.y - seg.uy * 2.2;
        ctx.moveTo(seg.vx, seg.vy);
        ctx.quadraticCurveTo(cMidX, cMidY, seg.dx, seg.dy);
        ctx.stroke();

        // Subtle light highlight edge on the fold
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(seg.vx + seg.ux * 1.5, seg.vy + seg.uy * 1.5);
        ctx.quadraticCurveTo(cMidX + seg.ux * 1.5, cMidY + seg.uy * 1.5, seg.dx + seg.ux * 1.5, seg.dy + seg.uy * 1.5);
        ctx.stroke();
        ctx.restore();

        // Cute spot or monarch stripes on dorsal side of this segment
        ctx.save();
        if (species.id === 'monarque' && !pal.isStriped) {
          // Monarch identity: black / white / yellow bands whatever the palette
          const bandColors = ['#1e272e', '#fdfdfd', '#ffd32a'];
          const col = bandColors[fi % 3];
          ctx.strokeStyle = col;
          ctx.lineWidth = col === '#1e272e' ? 4.6 : 3.0;
          ctx.beginPath();
          ctx.moveTo(seg.x + seg.nx * (seg.r * 0.05), seg.y + seg.ny * (seg.r * 0.05));
          ctx.quadraticCurveTo(seg.x + seg.nx * seg.r * 0.6 - seg.ux * 2, seg.y + seg.ny * seg.r * 0.6 - seg.uy * 2, seg.dx, seg.dy);
          ctx.stroke();
        } else if (pal.isStriped) {
          ctx.strokeStyle = '#1e272e';
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(seg.x + seg.nx * (seg.r * 0.15), seg.y + seg.ny * (seg.r * 0.15));
          ctx.lineTo(seg.dx, seg.dy);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(seg.x + seg.nx * (seg.r * 0.20) + seg.ux * 2, seg.y + seg.ny * (seg.r * 0.20) + seg.uy * 2);
          ctx.lineTo(seg.dx + seg.ux * 2, seg.dy + seg.uy * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = pal.spots;
          ctx.beginPath();
          const spotX = seg.x + seg.nx * (seg.r * 0.52);
          const spotY = seg.y + seg.ny * (seg.r * 0.52);
          ctx.ellipse(spotX, spotY, seg.r * 0.22, seg.r * 0.13, Math.atan2(seg.uy, seg.ux), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. GLOSSY BACK HIGHLIGHT RIBBON
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (let s = 2; s < numSamples - 2; s++) {
        const seg = samples[s];
        const hx = seg.x + seg.nx * (seg.r * 0.65);
        const hy = seg.y + seg.ny * (seg.r * 0.65);
        if (s === 2) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
      ctx.restore();

      this.drawSpeciesDetails(ctx, samples, time, pal);
    }

    // 6. CUTE LARVAL HEAD CAPSULE
    const headSample = samples[numSamples - 1];
    const headAngle = Math.atan2(headSample.uy, headSample.ux);
    this.drawCuteLarvalHead(ctx, head.x, head.y, headAngle, pal, time);

    // 7. SUPERIMPOSED VISUAL BADGES (Q & D) - Only for local player
    if (!this.isRemote && GAMEPLAY_CONFIG.showBadgesOverlay) {
      const rearBadgeX = rear.x - tailSeg.nx * 14;
      const rearBadgeY = rear.y - tailSeg.ny * 14 + 22;
      const frontBadgeX = head.x - frontSeg.nx * 14;
      const frontBadgeY = head.y - frontSeg.ny * 14 + 22;

      const gripStyle = GRIP_STYLES[this.cosmetics.grip || 'classic'] || GRIP_STYLES.classic;
      this.drawAnchorBadge(ctx, rearBadgeX, rearBadgeY, 'Q', this.rearAnchor, this.rearCanGrip, this.rearTargetPt, gripStyle.rearColor, time);
      this.drawAnchorBadge(ctx, frontBadgeX, frontBadgeY, 'D', this.frontAnchor, this.frontCanGrip, this.frontTargetPt, gripStyle.frontColor, time);
    }

    // 8. FLOATING PLAYER PSEUDO + MODIFIER BADGES + HP BAR
    if (!this.hideFloatingTag && (this.isRemote || this.pseudo || (this.modifiers && this.modifiers.length > 0))) {
      this.drawFloatingPlayerTag(ctx, head.x, head.y, pal, time);
    }

    ctx.restore();
  }

  drawFloatingPlayerTag(ctx, hx, hy, pal, time) {
    ctx.save();
    const classScale = (this.bodyClass && this.bodyClass.visualScale) || 1.0;
    const sizeMult = (this.sizeScale || 1.0) * classScale;
    const tagY = hy - 38 * sizeMult - (this.cosmetics.hat && this.cosmetics.hat !== 'none' ? 14 : 0);

    // Modifier icons string
    let modIcons = '';
    if (this.modifiers && this.modifiers.length > 0) {
      modIcons = ' ' + this.modifiers.map(m => (RACE_MODIFIERS[m] ? RACE_MODIFIERS[m].icon : '')).join('');
    }
    const label = (this.pseudo || 'Chenille') + modIcons;

    ctx.font = '800 13px "Fredoka", sans-serif';
    const textW = ctx.measureText(label).width;
    const pillW = Math.max(64, textW + 18);
    const pillH = 22;

    // Cartoon dark pill background with colored border
    ctx.fillStyle = this.isRemote ? 'rgba(18, 24, 38, 0.85)' : 'rgba(20, 48, 28, 0.88)';
    ctx.strokeStyle = this.isRemote ? pal.bodyTop : '#ffd93b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(hx - pillW * 0.5, tagY - pillH * 0.5, pillW, pillH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, hx, tagY + 0.5);

    // Mini HP bar below name tag if damaged or remote player
    if (this.hp < this.maxHp || this.isRemote) {
      const hpRatio = Math.max(0, Math.min(1, this.hp / Math.max(1, this.maxHp)));
      const barW = Math.min(68, pillW - 8);
      const barH = 5;
      const barX = hx - barW * 0.5;
      const barY = tagY + pillH * 0.5 + 3;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 3);
      ctx.fill();

      ctx.fillStyle = hpRatio > 0.5 ? '#2ed573' : (hpRatio > 0.25 ? '#ffa502' : '#ff4757');
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * hpRatio, barH, 2.5);
      ctx.fill();
    }

    ctx.restore();
  }

  drawSuctionFoot(ctx, x, y, ux, uy, nx, ny, anchor, isFront, canGrip, pal, time) {
    const gripStyle = GRIP_STYLES[this.cosmetics.grip || 'classic'] || GRIP_STYLES.classic;
    const activeColor = isFront ? gripStyle.frontColor : gripStyle.rearColor;
    const footX = x - nx * 14;
    const footY = y - ny * 14;
    const angle = Math.atan2(uy, ux);

    ctx.save();
    ctx.translate(footX, footY);
    ctx.rotate(angle);

    if (this.dorsalSign < 0) {
      ctx.scale(1, -1);
    }

    // Soft suction contact glow when anchored or in range
    if (anchor.anchored) {
      const pulse = 1 + Math.sin(time * 10) * 0.08;
      ctx.fillStyle = activeColor;
      ctx.globalAlpha = 0.38;
      ctx.beginPath();
      ctx.ellipse(0, 3, 16 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else if (canGrip) {
      const pulse = 1 + Math.sin(time * 12) * 0.12;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.4;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(0, 3, 16 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Cute fleshy foot base/leg stalk (plump rounded proleg)
    ctx.fillStyle = pal.bodyFill;
    ctx.strokeStyle = pal.outline;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.roundRect(-7, -6, 14, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Central fleshy suction pad (coussinet doux)
    ctx.fillStyle = anchor.anchored ? activeColor : pal.belly;
    ctx.strokeStyle = pal.outline;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 7.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Claw grasp progression:
    let gripT = 0.18;
    if (anchor.anchored) {
      gripT = 1.0;
    } else if (canGrip) {
      gripT = 0.0 + Math.sin(time * 14) * 0.05;
    } else if (anchor.holdingKey) {
      gripT = 0.50 + Math.sin(time * 12) * 0.18;
    }

    const drawSideClaw = (dir, baseX, baseY, length, baseWidth, openRot, closedRot) => {
      ctx.save();
      ctx.translate(baseX, baseY);

      const curRot = dir * (openRot * (1 - gripT) + closedRot * gripT);
      ctx.rotate(curRot);

      const curveX = -dir * (length * 0.28);
      const tipY = length * (anchor.anchored ? 0.72 : 1.0);
      const tipX = curveX;

      ctx.beginPath();
      ctx.moveTo(-baseWidth * 0.5, 0);
      ctx.quadraticCurveTo(-baseWidth * 0.35 + curveX * 0.25, tipY * 0.55, tipX, tipY);
      ctx.arc(tipX, tipY, 1.3, 0, Math.PI * 0.5);
      ctx.quadraticCurveTo(baseWidth * 0.45 + curveX * 0.75, tipY * 0.5, baseWidth * 0.5, 0);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, 0, tipX, tipY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.65, gripStyle.clawTint || '#fffce8');
      grad.addColorStop(1, anchor.anchored ? activeColor : (gripStyle.clawTint || '#ffeed4'));

      ctx.fillStyle = grad;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 2.4;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.arc(0, 0.5, baseWidth * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(tipX * 0.55, tipY * 0.5, 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const classScale = (this.bodyClass && this.bodyClass.visualScale) || 1.0;
    const scaleFactor = ((GAMEPLAY_CONFIG.clawScale !== undefined ? GAMEPLAY_CONFIG.clawScale : 1.35) / 1.35) * classScale;
    for (const dir of [-1, 1]) {
      const mainBaseX = dir * (6.5 - gripT * 2.2);
      const mainBaseY = 1.0;
      drawSideClaw(dir, mainBaseX, mainBaseY, 12.0 * scaleFactor, 4.2 * scaleFactor, 1.05, -0.55);

      const secBaseX = dir * (5.2 - gripT * 1.8);
      const secBaseY = -2.2;
      drawSideClaw(dir, secBaseX, secBaseY, 8.8 * scaleFactor, 3.2 * scaleFactor, 1.25, -0.38);
    }

    ctx.restore();
  }

  drawCuteLarvalHead(ctx, x, y, headAngle, pal, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(headAngle);

    if (this.dorsalSign < 0) {
      ctx.scale(1, -1);
    }

    const classScale = (this.bodyClass && this.bodyClass.visualScale) || 1.0;
    const headR = 23.5 * (this.sizeScale || 1.0) * classScale;

    const bob = Math.sin(time * 7) * 2.0;
    ctx.strokeStyle = pal.outline;
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-5, -headR * 0.75);
    ctx.quadraticCurveTo(-13, -headR - 12 + bob, -9, -headR - 16 + bob);
    ctx.stroke();
    ctx.fillStyle = pal.spots;
    ctx.beginPath();
    ctx.arc(-9, -headR - 16 + bob, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(4, -headR * 0.8);
    ctx.quadraticCurveTo(11, -headR - 14 - bob, 15, -headR - 12 - bob);
    ctx.stroke();
    ctx.fillStyle = pal.spots;
    ctx.beginPath();
    ctx.arc(15, -headR - 12 - bob, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pal.outline;
    ctx.beginPath();
    ctx.ellipse(2, 0, headR + 3.6, headR * 0.94 + 3.6, 0, 0, Math.PI * 2);
    ctx.fill();

    const headGrad = ctx.createRadialGradient(-2, -6, 3, 2, 0, headR);
    headGrad.addColorStop(0, pal.bodyTop);
    headGrad.addColorStop(0.65, pal.bodyFill);
    headGrad.addColorStop(1, pal.bodyShade);

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(2, 0, headR, headR * 0.94, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(2, 0, headR * 0.95, headR * 0.90, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = pal.belly;
    ctx.beginPath();
    ctx.ellipse(3, headR * 0.74, headR * 0.85, headR * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-3, -headR * 0.55, 7, 3.2, -0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = pal.cheek;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(-1, 5.5, 4.5, 2.6, 0, 0, Math.PI * 2);
    ctx.ellipse(16, 4.5, 4.0, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    const faceStyle = this.cosmetics.face || 'cute';
    const isBlinking = this.blinkTimer < 0;

    if (faceStyle === 'cool') {
      ctx.fillStyle = '#111622';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-2, -7.5, 11.5, 8.5, 2.5);
      ctx.roundRect(11, -7.5, 10.5, 8.5, 2.5);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#111622';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-11, -4.5);
      ctx.lineTo(21, -4.5);
      ctx.stroke();

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(8, 4.5, 4.5, 0.15, Math.PI * 0.78);
      ctx.stroke();
    } else {
      const eyes = [
        { ex: 3, ey: -2.5, r: 5.4 },
        { ex: 14, ey: -3.0, r: 4.9 }
      ];

      for (const eye of eyes) {
        if (isBlinking) {
          ctx.strokeStyle = pal.outline;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.arc(eye.ex, eye.ey + 1, eye.r * 0.75, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = pal.outline;
          ctx.lineWidth = 2.3;
          ctx.beginPath();
          ctx.arc(eye.ex, eye.ey, eye.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#141b29';
          ctx.beginPath();
          ctx.arc(eye.ex + 1.1, eye.ey, eye.r * 0.62, 0, Math.PI * 2);
          ctx.fill();

          if (faceStyle === 'starry') {
            this.drawMiniStar(ctx, eye.ex + 1.1, eye.ey, eye.r * 0.5, '#ffd93b');
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eye.ex - 0.5, eye.ey - 1.6, eye.r * 0.28, 0, Math.PI * 2);
            ctx.arc(eye.ex + 2.2, eye.ey + 1.1, eye.r * 0.14, 0, Math.PI * 2);
            ctx.fill();
          }

          if (faceStyle === 'determined' || this.expression === 'strain') {
            ctx.strokeStyle = pal.outline;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(eye.ex - eye.r, eye.ey - eye.r - 1);
            ctx.lineTo(eye.ex + eye.r, eye.ey - eye.r + 2.2);
            ctx.stroke();
          }
        }
      }

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 2.4;
      if (faceStyle === 'derpy') {
        ctx.beginPath();
        ctx.arc(8.5, 4.5, 4.2, 0.1, Math.PI - 0.1);
        ctx.stroke();
        ctx.fillStyle = '#ff5c8a';
        ctx.beginPath();
        ctx.roundRect(6.5, 6.5, 5.0, 6.0, 2.5);
        ctx.fill();
        ctx.stroke();
      } else if (this.expression === 'panic') {
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(8.5, 6.5, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (this.expression === 'strain') {
        ctx.beginPath();
        ctx.moveTo(4.5, 6.5);
        ctx.lineTo(7.5, 5.0);
        ctx.lineTo(10.5, 6.5);
        ctx.lineTo(13.5, 5.0);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(8.5, 4.2, 4.2, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }
    }

    this.drawCosmeticHat(ctx, -1, -headR + 1, time);

    ctx.restore();
  }

  drawCosmeticHat(ctx, hx, hy, time) {
    const hat = this.cosmetics.hat || 'none';
    if (hat === 'none') return;

    ctx.save();
    ctx.translate(hx, hy);

    if (hat === 'crown') {
      ctx.fillStyle = '#ffd93b';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-11, 2);
      ctx.lineTo(-13, -11);
      ctx.lineTo(-5, -4.5);
      ctx.lineTo(0, -14);
      ctx.lineTo(5, -4.5);
      ctx.lineTo(13, -11);
      ctx.lineTo(11, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff3864';
      ctx.beginPath();
      ctx.arc(0, -3.5, 2.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'cap') {
      // Casquette Sport Rouge/Blanche
      ctx.fillStyle = '#e84118';
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-1, 2, 13, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White front panel
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, 1, 7.5, Math.PI * 1.15, Math.PI * 1.9);
      ctx.fill();
      // Visor
      ctx.fillStyle = '#c23616';
      ctx.beginPath();
      ctx.ellipse(10, 1.5, 10, 3.2, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'pirate') {
      // Tricorne Pirate
      ctx.fillStyle = '#1e272e';
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-17, 2);
      ctx.quadraticCurveTo(-12, -14, 0, -15);
      ctx.quadraticCurveTo(12, -14, 17, 2);
      ctx.quadraticCurveTo(0, -3, -17, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Skull dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -6.5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'hardhat') {
      // Casque de Chantier Jaune
      ctx.fillStyle = '#ffd32a';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 2, 13.5, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Ridge & Visor
      ctx.fillStyle = '#ffa801';
      ctx.fillRect(-3, -13, 6, 12);
      ctx.beginPath();
      ctx.ellipse(2, 2, 16, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'tophat') {
      ctx.fillStyle = '#1e222d';
      ctx.strokeStyle = '#0d0f14';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-10, -17, 20, 17, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e84118';
      ctx.fillRect(-10, -5, 20, 3.8);

      ctx.fillStyle = '#1e222d';
      ctx.beginPath();
      ctx.ellipse(0, 1, 16, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hat === 'mushroom') {
      ctx.fillStyle = '#ff3864';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 2, 15, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-5.5, -4.5, 3.2, 0, Math.PI * 2);
      ctx.arc(4.5, -6.5, 3.8, 0, Math.PI * 2);
      ctx.arc(1, -2, 2.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'propeller') {
      ctx.fillStyle = '#3867d6';
      ctx.strokeStyle = '#1e272e';
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.arc(0, 2, 12, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -16);
      ctx.stroke();

      const bladeW = Math.cos(this.propellerAngle) * 13;
      ctx.strokeStyle = '#ff3838';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-bladeW, -16);
      ctx.lineTo(bladeW, -16);
      ctx.stroke();
    } else if (hat === 'flower') {
      ctx.strokeStyle = '#2d7a22';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.quadraticCurveTo(3, -7, 0, -13);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2a1b0e';
      ctx.lineWidth = 1.7;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 6, -13 + Math.sin(a) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd93b';
      ctx.beginPath();
      ctx.arc(0, -13, 4.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'alien') {
      const wobble = Math.sin(time * 8) * 2.3;
      ctx.strokeStyle = '#38d84e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.quadraticCurveTo(wobble, -9, wobble * 1.4, -17);
      ctx.stroke();

      ctx.fillStyle = '#7bed9f';
      ctx.strokeStyle = '#143821';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wobble * 1.4, -17, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Species silhouettes on top of the chosen palette, so species read at a glance
  drawSpeciesDetails(ctx, samples, time, pal) {
    const species = this.getSpecies();
    const n = samples.length;
    ctx.save();
    ctx.lineCap = 'round';
    if (species.id === 'dodue') {
      // Bristly tufts along the back of the heavy species
      ctx.strokeStyle = pal.outline || '#13361f';
      ctx.lineWidth = 2.2;
      for (let k = 3; k < n - 3; k += 2) {
        const seg = samples[k];
        const sway = Math.sin(time * 3 + k) * 0.15;
        for (const spread of [-0.35, 0, 0.35]) {
          const ax = seg.dx - seg.ux * spread * 6;
          const ay = seg.dy - seg.uy * spread * 6;
          const len = seg.r * 0.55;
          const dirX = seg.nx + seg.ux * (spread + sway);
          const dirY = seg.ny + seg.uy * (spread + sway);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + dirX * len, ay + dirY * len);
          ctx.stroke();
        }
      }
    } else if (species.id === 'voltigeuse') {
      // Two long, light tail filaments that trail behind
      const tail = samples[0];
      const bx = tail.x - tail.ux * tail.r * 0.6;
      const by = tail.y - tail.uy * tail.r * 0.6;
      ctx.strokeStyle = pal.outline || '#13361f';
      ctx.lineWidth = 2.0;
      for (const side of [-1, 1]) {
        const wave = Math.sin(time * 6 + side) * 5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(
          bx - tail.ux * 14 + tail.nx * (side * 6 + wave), by - tail.uy * 14 + tail.ny * (side * 6 + wave),
          bx - tail.ux * 26 + tail.nx * (side * 12), by - tail.uy * 26 + tail.ny * (side * 12));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawMiniStar(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const a2 = a1 + Math.PI / 5;
      if (i === 0) ctx.moveTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      else ctx.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
      ctx.lineTo(cx + Math.cos(a2) * (r * 0.45), cy + Math.sin(a2) * (r * 0.45));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawAnchorBadge(ctx, x, y, letter, anchor, canGrip, targetPt, activeColor, time) {
    ctx.save();

    if (canGrip && !anchor.anchored && targetPt) {
      const pulse = Math.sin(time * 9) * 2.5;
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(targetPt.x, targetPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(targetPt.x, targetPt.y, 8 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(targetPt.x, targetPt.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.font = '900 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let bg = 'rgba(22, 28, 38, 0.85)';
    let border = 'rgba(255, 255, 255, 0.6)';
    let badgeScale = 1.0;

    if (anchor.stuckCrumb) {
      bg = '#ff4757';
      border = '#ffffff';
    } else if (anchor.propRef || anchor.playerRef) {
      bg = '#f39c12';
      border = '#fff200';
      badgeScale = 1.08;
    } else if (anchor.slipping) {
      bg = '#00a8ff';
      border = '#ffffff';
    } else if (anchor.anchored) {
      bg = activeColor;
      border = '#ffffff';
      badgeScale = 1.08 + Math.sin(time * 8) * 0.04;
    } else if (canGrip) {
      bg = '#143820';
      border = '#55efc4';
      badgeScale = 1.1 + Math.sin(time * 10) * 0.06;
      ctx.shadowColor = '#55efc4';
      ctx.shadowBlur = 8;
    } else if (anchor.holdingKey) {
      bg = '#485460';
      border = activeColor;
    }

    ctx.translate(x, y);
    ctx.scale(badgeScale, badgeScale);

    const badgeSize = 22;
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-badgeSize * 0.5, -badgeSize * 0.5, badgeSize, badgeSize, 6);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(letter, 0, 1);
    ctx.restore();
  }

  // ==================== MULTIPLAYER STATE SYNC & PREVIEW ====================
  serializeState(progress = 0) {
    return {
      nodes: this.nodes.map(n => ({
        x: Math.round(n.x * 10) / 10,
        y: Math.round(n.y * 10) / 10,
        vx: Math.round(n.vx),
        vy: Math.round(n.vy),
        r: Math.round(n.r * 10) / 10
      })),
      rearAnchored: !!this.rearAnchor.anchored,
      frontAnchored: !!this.frontAnchor.anchored,
      contraction: Math.round(this.contraction * 100) / 100,
      hp: Math.round(this.hp),
      maxHp: Math.round(this.maxHp),
      sizeScale: this.sizeScale,
      dorsalSign: this.dorsalSign,
      expression: this.expression,
      extraAppleSegments: this.extraAppleSegments || 0,
      progress: Math.round(progress * 1000) / 1000
    };
  }

  applyRemoteState(state) {
    if (!state || !Array.isArray(state.nodes)) return;
    if (this.nodes.length !== state.nodes.length) {
      this.numNodes = state.nodes.length;
      this.nodes = state.nodes.map((sn, idx) => ({
        x: sn.x,
        y: sn.y,
        vx: sn.vx || 0,
        vy: sn.vy || 0,
        r: sn.r || 15,
        mass: idx === state.nodes.length - 1 ? 1.05 : 1.0,
        onGround: false
      }));
    }
    this.remoteTargetNodes = state.nodes;
    this.rearAnchor.anchored = !!state.rearAnchored;
    this.frontAnchor.anchored = !!state.frontAnchored;
    if (typeof state.contraction === 'number') this.contraction = state.contraction;
    if (typeof state.hp === 'number') this.hp = state.hp;
    if (typeof state.maxHp === 'number') this.maxHp = state.maxHp;
    if (typeof state.sizeScale === 'number') this.sizeScale = state.sizeScale;
    if (typeof state.dorsalSign === 'number') this.dorsalSign = state.dorsalSign;
    if (state.expression) this.expression = state.expression;
    if (typeof state.progress === 'number') this.remoteProgress = state.progress;
  }

  updateRemote(dt) {
    this.propellerAngle += dt * 15;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
    }
    this.blinkTimer -= dt;
    if (this.blinkTimer < -0.14) {
      this.blinkTimer = 2.2 + Math.random() * 2.5;
    }
    if (this.remoteTargetNodes && this.remoteTargetNodes.length === this.nodes.length) {
      const lerp = Math.min(1, dt * 18);
      for (let i = 0; i < this.nodes.length; i++) {
        const tn = this.remoteTargetNodes[i];
        this.nodes[i].x += (tn.x - this.nodes[i].x) * lerp;
        this.nodes[i].y += (tn.y - this.nodes[i].y) * lerp;
        this.nodes[i].vx = tn.vx || 0;
        this.nodes[i].vy = tn.vy || 0;
        if (tn.r) this.nodes[i].r = tn.r;
      }
    }
  }
}
