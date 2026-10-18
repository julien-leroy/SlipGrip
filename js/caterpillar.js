// js/caterpillar.js — Viscous Arcade Larval Caterpillar with Configurable Physics & Responsive Controls
import { MATERIALS } from './physics.js?v=48';
import { sound } from './audio.js?v=48';
import { GAMEPLAY_CONFIG, CATERPILLAR_CLASSES, BODY_SHAPES } from './gameplayConfig.js?v=48';

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

export class Caterpillar {
  constructor(startX, startY) {
    this.cosmetics = {
      palette: 'emerald',
      hat: 'crown',
      face: 'cute',
      bodyType: 'classique',
      bodyShape: 'larve'
    };
    this.loadCosmetics();

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

    this.reset(startX, startY);
  }

  applyBodyClass(typeId, morphExisting = false) {
    const cls = CATERPILLAR_CLASSES[typeId] || CATERPILLAR_CLASSES.classique;
    this.bodyClass = cls;
    this.cosmetics.bodyType = cls.id;
    const reachMult = GAMEPLAY_CONFIG.unbendReachBonus || 1.0;
    this.extendedSegLen = cls.extendedSegLen * reachMult;
    this.contractedSegLen = cls.contractedSegLen;
    this.fullLength = this.extendedSegLen * (cls.numNodes - 1);

    if (morphExisting && this.nodes && this.nodes.length > 0) {
      const oldLen = this.nodes.length;
      const targetNum = cls.numNodes;
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
          r: cls.radii[i] || 16,
          mass: cls.massMult || 1.0,
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
      this.numNodes = cls.numNodes;
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
      anchored: false,
      slipping: false,
      propRef: null,
      aphidRef: null,
      hedgehogRef: null,
      propLocalAngle: 0,
      stuckCrumb: null,
      stuckStrength: 0,
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

  takeDamage(amount, knockX = 0, knockY = -180, particles = null, sound = null) {
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

    for (let i = 0; i < this.numNodes; i++) {
      this.nodes[i].vx += knockX * 0.8;
      this.nodes[i].vy += knockY * 0.8;
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
    this.activePowerUp = {
      type,
      timer: duration,
      duration
    };

    const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
    const baseRadii = cls.radii || [14.0, 16.5, 17.5, 16.5, 17.5];

    if (type === 'giant') {
      this.sizeScale = 1.45;
      for (let i = 0; i < this.numNodes; i++) {
        if (this.nodes[i]) this.nodes[i].r = (baseRadii[i] || 16) * 1.45;
      }
    } else {
      this.sizeScale = 1.0;
      for (let i = 0; i < this.numNodes; i++) {
        if (this.nodes[i]) this.nodes[i].r = baseRadii[i] || 16;
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

  addPermanentSegment(particles) {
    const N = this.numNodes;
    if (N >= 10) return; // reasonable max
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
    this.hp = Math.min(this.maxHp, this.hp + 50);
    this.expression = 'happy';
    if (sound) sound.playCheckpoint();
    if (particles) {
      particles.spawnPopup(this.head.x, this.head.y - 30, '+1 SEGMENT ! 🍏', '#38d84e');
      particles.spawnConfetti(this.head.x, this.head.y - 10, 20);
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
        if (parsed.bodyType && CATERPILLAR_CLASSES[parsed.bodyType]) this.cosmetics.bodyType = parsed.bodyType;
        if (parsed.bodyShape && BODY_SHAPES[parsed.bodyShape]) this.cosmetics.bodyShape = parsed.bodyShape;
      }
    } catch {
      // Ignore storage error
    }
  }

  saveCosmetics() {
    try {
      localStorage.setItem('slipgrip_cosmetics', JSON.stringify(this.cosmetics));
    } catch {
      // Ignore storage error
    }
  }

  reset(startX, startY) {
    const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
    this.numNodes = cls.numNodes;
    const reachMult = GAMEPLAY_CONFIG.unbendReachBonus || 1.0;
    this.extendedSegLen = cls.extendedSegLen * reachMult;
    this.contractedSegLen = cls.contractedSegLen;
    this.fullLength = this.extendedSegLen * (this.numNodes - 1);

    this.maxHp = 100;
    this.hp = 100;
    this.invulnerableTimer = 0;

    this.activePowerUp = {
      type: null,
      timer: 0,
      duration: 15.0
    };
    this.sizeScale = 1.0;
    this.jumpCooldown = 0;

    this.nodes = [];
    const radii = cls.radii || [14.0, 16.5, 17.5, 16.5, 17.5];
    for (let i = 0; i < this.numNodes; i++) {
      const x = startX + i * this.extendedSegLen;
      const y = startY;
      this.nodes.push({
        index: i,
        x,
        y,
        vx: 0,
        vy: 0,
        r: radii[i] || 16,
        mass: cls.massMult || 1.0,
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
    this.chargeDuration = 0;
    this.chargeShake = 0;
    this.wasFullyCharged = false;
    this.launchSpineDir = null;
    this.launchSpinePower = 0;
    this.flipCooldown = 0;
    this.bodyRigidity = 0;
    this.rigidityTimer = 0;
    this.dorsalSign = 1;
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
    if (anchor.hedgehogRef || anchor.aphidRef) return true;
    const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
    if (anchor.propRef && (anchor.propRef.type === 'acorn' || anchor.propRef.mass < 15 || hasStrength)) return true;
    return false;
  }

  setRearHold(isHolding, particles) {
    if (this.rearAnchor.holdingKey === isHolding) return;
    this.rearAnchor.holdingKey = isHolding;

    if (!isHolding) {
      if (this.rearAnchor.stuckCrumb && this.rearAnchor.stuckStrength > 0) {
        particles.spawnPopup(this.rear.x, this.rear.y, 'ENGLUÉ ! (ESPACE)', '#ff4757');
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
        particles.spawnPopup(this.head.x, this.head.y, 'ENGLUÉ ! (ESPACE)', '#ff4757');
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

    // Fling / Throw grabbable enemy aphids!
    if (anchor.aphidRef) {
      const aphid = anchor.aphidRef;
      aphid.isHeld = false;
      aphid.isFlying = true;

      let { dx, dy } = this.getFrontVector();
      if (!isFront) { dx = -dx; dy = -dy; }

      const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
      const strengthMult = hasStrength ? 3.0 : 1.0;
      const boost = (this.extensionTimer > 0 ? 2.5 : 1.7);
      const throwSpeed = (320 + (this.extensionMomentum.power || 0) * 380) * boost * strengthMult;
      aphid.vx = node.vx * 0.8 + dx * throwSpeed;
      aphid.vy = node.vy * 0.8 + dy * throwSpeed - (hasStrength ? 200 : 120);
      aphid.squashX = 1.45;
      aphid.squashY = 0.55;

      sound.playLaunch(0.85);
      if (particles) {
        particles.spawnMud(node.x, node.y, -dx, -dy, 8, 0.75);
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

      let { dx, dy } = this.getFrontVector();
      if (!isFront) { dx = -dx; dy = -dy; }

      const steerX = (this.lastInputs.right ? 1 : 0) - (this.lastInputs.left ? 1 : 0);
      const steerY = (this.lastInputs.up ? -1 : 0) + (this.lastInputs.down ? 1 : 0);
      let aimX = dx;
      let aimY = dy;
      if (steerX !== 0 || steerY !== 0) {
        const sLen = Math.hypot(steerX, steerY) || 1;
        aimX = dx * 0.35 + (steerX / sLen) * 0.65;
        aimY = dy * 0.35 + (steerY / sLen) * 0.65;
        const aLen = Math.hypot(aimX, aimY) || 1;
        aimX /= aLen;
        aimY /= aLen;
      }

      const chargeT = (this.extensionMomentum && this.extensionMomentum.chargeTime) || this.chargeDuration || 0;
      const boost = (this.extensionTimer > 0 || chargeT >= 1.0) ? 2.5 : 1.5;
      const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
      const strengthMult = hasStrength ? 3.0 : 1.0;
      const throwSpeed = (300 + Math.pow(Math.min(1.0, chargeT / 3.0), 2.0) * 400) * boost * strengthMult;

      hedgehog.vx = node.vx * 0.7 + aimX * throwSpeed;
      hedgehog.vy = node.vy * 0.7 + aimY * throwSpeed - (hasStrength ? 200 : 120);
      hedgehog.squashX = 1.45;
      hedgehog.squashY = 0.55;

      sound.playLaunch(0.85);
      if (particles) {
        particles.spawnMud(node.x, node.y, -aimX, -aimY, 8, 0.75);
        if (hasStrength) {
          particles.spawnConfetti(node.x, node.y, 14);
        }
      }
      anchor.hedgehogRef = null;
    }

    // Fling / Throw grabbable props (acorns, and pinecones with superforce!)
    if (anchor.propRef) {
      const prop = anchor.propRef;
      prop.isHeld = false;
      const hasStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
      if (prop.type === 'acorn' || prop.mass < 15 || hasStrength || (this.bodyClass && this.bodyClass.massMult > 1.4)) {
        let { dx, dy } = this.getFrontVector();
        if (!isFront) { dx = -dx; dy = -dy; }

        const steerX = (this.lastInputs.right ? 1 : 0) - (this.lastInputs.left ? 1 : 0);
        const steerY = (this.lastInputs.up ? -1 : 0) + (this.lastInputs.down ? 1 : 0);
        let aimX = dx;
        let aimY = dy;
        if (steerX !== 0 || steerY !== 0) {
          const sLen = Math.hypot(steerX, steerY) || 1;
          aimX = dx * 0.35 + (steerX / sLen) * 0.65;
          aimY = dy * 0.35 + (steerY / sLen) * 0.65;
          const aLen = Math.hypot(aimX, aimY) || 1;
          aimX /= aLen;
          aimY /= aLen;
        }

        const chargeT = (this.extensionMomentum && this.extensionMomentum.chargeTime) || this.chargeDuration || 0;
        const boost = (this.extensionTimer > 0 || chargeT >= 1.0) ? 2.5 : 1.5;
        const strengthMult = hasStrength ? 3.0 : 1.0;
        const clsMass = (this.bodyClass && this.bodyClass.massMult) || 1.0;
        const baseSpeed = prop.type === 'pinecone' ? 320 : 350;
        const throwSpeed = (baseSpeed + Math.pow(Math.min(1.0, chargeT / 2.5), 2.0) * 440) * boost * strengthMult * (clsMass > 1.2 ? 1.35 : 1.0);

        prop.vx = node.vx * 0.7 + aimX * throwSpeed;
        prop.vy = node.vy * 0.7 + aimY * throwSpeed - (hasStrength ? 180 : 100);
        prop.angVel = aimX * (hasStrength ? 20.0 : 14.0);

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
    anchor.segRef = null;
    anchor.localPt = null;
    sound.playRelease(isFront);
    particles.spawnSuctionRing(node.x, node.y, isFront ? '#a8ffbc' : '#e4b8ff');

    const otherAnchor = isFront ? this.rearAnchor : this.frontAnchor;
    if (!otherAnchor.anchored) {
      if (this.extensionMomentum.timer > 0 && !this.extensionMomentum.consumed && (this.extensionMomentum.chargeTime || 0) >= 1.0) {
        const chargeTime = this.extensionMomentum.chargeTime;
        const maxChargeTime = Math.max(0.5, GAMEPLAY_CONFIG.jumpChargeTime || 4.0);
        // Normalized power over [1.0s, maxChargeTime]
        const p = Math.min(1.0, Math.max(0, (chargeTime - 1.0) / (maxChargeTime - 1.0)));
        // Strictly quadratic scaling (power = p^2): almost zero push at 1-2s, max at 4s
        const quadPower = p * p;
        const baseMaxSpeed = GAMEPLAY_CONFIG.maxJumpSpeed || 175;
        let launchSpeed = quadPower * baseMaxSpeed;

        const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
        const jumpMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.00) * clsJump;
        const strengthMult = (this.activePowerUp && this.activePowerUp.type === 'strength') ? 1.55 : 1.0;
        const speedMult = (this.activePowerUp && this.activePowerUp.type === 'speed') ? 1.35 : 1.0;
        launchSpeed *= jumpMult * strengthMult * speedMult;

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
          const frontRatio = 0.85 + 0.30 * (i / (this.numNodes - 1));
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
      aimY = dy * 0.40 + ((steerY < 0 ? steerY * (GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.30) : steerY) / sDist) * 0.60;
      const len = Math.hypot(aimX, aimY) || 1;
      aimX /= len;
      aimY /= len;
    }

    const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
    const jumpMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.10) * clsJump;
    const hopSpeed = (160 + power * 190) * jumpMult;
    const vx = aimX * hopSpeed;
    const vy = aimY * hopSpeed;

    for (let i = 0; i < this.numNodes; i++) {
      const frontBias = 0.85 + 0.30 * (i / (this.numNodes - 1));
      this.nodes[i].vx = vx * frontBias;
      this.nodes[i].vy = vy * frontBias;
      this.nodes[i].onGround = false;
    }
    this.hopTimer = 0.45;
    sound.playLaunch(0.40 + power * 0.40);
    particles.spawnMud(this.rear.x, this.rear.y, -aimX, -aimY, 6, power * 0.6);
  }

  update(dt, world, inputs, particles) {
    const safeDt = Math.min(dt, 1 / 30);
    const speed = Math.hypot(this.head.vx, this.head.vy);
    this.propellerAngle += safeDt * (10 + speed * 0.08);
    this.crawlPhase += safeDt * (5.5 + speed * 0.08);
    this.wiggleTime += safeDt * (3.0 + speed * 0.05);
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
          this.sizeScale = 1.0;
          const cls = this.bodyClass || CATERPILLAR_CLASSES[this.cosmetics.bodyType] || CATERPILLAR_CLASSES.classique;
          const baseRadii = cls.radii || [12.5, 14.2, 14.8, 13.8, 14.8];
          for (let i = 0; i < this.numNodes; i++) {
            if (this.nodes[i]) this.nodes[i].r = baseRadii[i] || 14;
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

    // Live surface proximity detection for Q and D visual aids
    const extraGrip = (this.bodyClass && this.bodyClass.gripExtraDistance) || 0;
    const gripDist = (GAMEPLAY_CONFIG.gripDistance || 24) + extraGrip;
    const rearRange = this.rear.r + gripDist;
    const headRange = this.head.r + gripDist;

    const rearHedgehog = world.findClosestHedgehog ? world.findClosestHedgehog(this.rear.x, this.rear.y, rearRange) : null;
    const rearAphid = world.findClosestAphid(this.rear.x, this.rear.y, rearRange);
    const rearProp = world.findClosestPropSurface(this.rear.x, this.rear.y, rearRange);
    const rearSurf = rearHedgehog || rearAphid || rearProp || world.findClosestSurface(this.rear.x, this.rear.y, rearRange);
    this.rearCanGrip = !!rearSurf;
    this.rearTargetPt = rearSurf ? { x: rearSurf.cx, y: rearSurf.cy } : null;

    const headHedgehog = world.findClosestHedgehog ? world.findClosestHedgehog(this.head.x, this.head.y, headRange) : null;
    const headAphid = world.findClosestAphid(this.head.x, this.head.y, headRange);
    const headProp = world.findClosestPropSurface(this.head.x, this.head.y, headRange);
    const headSurf = headHedgehog || headAphid || headProp || world.findClosestSurface(this.head.x, this.head.y, headRange);
    this.frontCanGrip = !!headSurf;
    this.frontTargetPt = headSurf ? { x: headSurf.cx, y: headSurf.cy } : null;

    const anyAnchored = this.rearAnchor.anchored || this.frontAnchor.anchored;

    // SPACEBAR: Pure longitudinal contraction of segment lengths (never lifts body into air!)
    const spaceHeld = !!inputs.space;
    if (spaceHeld) {
      this.extensionTimer = 0; // Never allow extension to fight contraction
      this.extensionMomentum.timer = 0;
      this.extensionMomentum.consumed = false;
      const maxChargeTime = Math.max(1.0, GAMEPLAY_CONFIG.jumpChargeTime || 3.0);
      const chargeSpeed = (this.bodyClass && this.bodyClass.chargeSpeedMult) || 1.0;
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
      const bendSpeed = GAMEPLAY_CONFIG.bendContractSpeed || 20.0;
      this.contraction += (1 - this.contraction) * Math.min(1, safeDt * bendSpeed);
      this.storedContraction = Math.max(this.storedContraction, chargeRatio);
      if (anyAnchored) {
        this.hadAnchorDuringContraction = true;
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

        // PROGRESSIVE JUMP: strictly ZERO push between 0 and 0.5s!
        const minJumpCharge = 0.50;
        const maxChargeTime = Math.max(1.0, GAMEPLAY_CONFIG.jumpChargeTime || 3.0);
        const canJump = this.chargeDuration >= minJumpCharge && this.jumpCooldown <= 0;
        if (canJump) {
          // 3-tier progressive jump: strictly 0 jump below 0.5s of charge!
          // 0.5-1.2s: petit saut (~0.35-0.48), 1.2-2.2s: moyen saut (~0.48-0.74), 2.2-3.0s: gros saut (~0.75-1.00)
          const u = Math.min(1.0, Math.max(0, (this.chargeDuration - minJumpCharge) / (maxChargeTime - minJumpCharge)));
          const effectivePower = 0.35 + 0.65 * Math.pow(u, 1.35);
          this.rigidityTimer = 0.35;
          this.bodyRigidity = 0.85;
          this.extensionTimer = 0.32 + 0.16 * effectivePower; // Active deployment phase
          this.jumpCooldown = 0.35;
          this.onReleaseSpace(effectivePower, this.hadAnchorDuringContraction, inputs, particles);
        } else {
          // Under 0.5s: purely release contraction without any jump impulse (no spam jumping/flying!)
          // BUT actively unfurl and extend LENGTHWISE in the direction of the body (never curling into a round circle!)
          this.rigidityTimer = 0.22;
          this.bodyRigidity = 0.55;
          this.extensionTimer = 0.24;
          this.launchSpinePower = 0;
          this.extensionMomentum.timer = 0;
          this.extensionMomentum.consumed = true;
          this.extensionMomentum.chargeTime = 0;
        }
      }
      this.chargeDuration = 0;
      this.chargeShake = 0;
      this.wasFullyCharged = false;
      if (this.extensionTimer > 0) {
        this.extensionTimer = Math.max(0, this.extensionTimer - safeDt);
      }
      const unbendSpeed = GAMEPLAY_CONFIG.unbendExtensionSpeed || 28.0;
      this.contraction += (0 - this.contraction) * Math.min(1, safeDt * unbendSpeed);
      if (this.contraction < 0.02 && this.extensionTimer <= 0) {
        this.contraction = 0;
        this.storedContraction = 0;
        this.hadAnchorDuringContraction = false;
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

  onReleaseSpace(power, hadAnchor, inputs, particles) {
    if (this.rearAnchor.stuckCrumb && power > 0.40) {
      const c = this.rearAnchor.stuckCrumb;
      this.rearAnchor.stuckCrumb = null;
      this.rearAnchor.anchored = false;
      sound.playSticky(true);
      particles.spawnStickyGoo(c.x, c.y, 8);
    }
    if (this.frontAnchor.stuckCrumb && power > 0.40) {
      const c = this.frontAnchor.stuckCrumb;
      this.frontAnchor.stuckCrumb = null;
      this.frontAnchor.anchored = false;
      sound.playSticky(true);
      particles.spawnStickyGoo(c.x, c.y, 8);
    }

    // Ground & anchor check: cannot jump if flying in mid-air!
    const anyOnGround = this.nodes.some(n => n.onGround) || hadAnchor || this.rearAnchor.anchored || this.frontAnchor.anchored;
    if (!anyOnGround) {
      return;
    }

    const N = this.numNodes;
    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const steerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);

    if (this.bodyClass && this.bodyClass.canJump === false) {
      // Mastodonte is too heavy to jump!
      sound.playSticky(false);
      if (particles) {
        particles.spawnPopup(this.head.x, this.head.y - 20, 'TROP LOURD POUR SAUTER ! 🦣', '#ffd93b');
      }
      return;
    }

    const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
    const jumpBoostMult = (GAMEPLAY_CONFIG.jumpBoost !== undefined ? GAMEPLAY_CONFIG.jumpBoost : 1.00) * clsJump;
    const strengthMult = (this.activePowerUp && this.activePowerUp.type === 'strength') ? 1.55 : 1.0;
    const speedMult = (this.activePowerUp && this.activePowerUp.type === 'speed') ? 1.35 : 1.0;

    // 1. Average direction of all body segments (organic spine orientation from tail to head)
    let avgDx = 0;
    let avgDy = 0;
    for (let i = 0; i < N - 1; i++) {
      const segDx = this.nodes[i + 1].x - this.nodes[i].x;
      const segDy = this.nodes[i + 1].y - this.nodes[i].y;
      const len = Math.hypot(segDx, segDy) || 1;
      avgDx += segDx / len;
      avgDy += segDy / len;
    }
    const avgLen = Math.hypot(avgDx, avgDy) || 1;
    avgDx /= avgLen;
    avgDy /= avgLen;

    let aimX = avgDx;
    let aimY = avgDy;
    if (steerX !== 0 || steerY !== 0) {
      const sDist = Math.hypot(steerX, steerY) || 1;
      const keyAimX = steerX / sDist;
      const keyAimY = (steerY < 0 ? steerY * (GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.30) : steerY) / sDist;
      const kLen = Math.hypot(keyAimX, keyAimY) || 1;
      aimX = avgDx * 0.45 + (keyAimX / kLen) * 0.55;
      aimY = avgDy * 0.45 + (keyAimY / kLen) * 0.55;
      const len = Math.hypot(aimX, aimY) || 1;
      aimX /= len;
      aimY /= len;
    }

    this.launchSpineDir = { x: aimX, y: aimY };
    this.launchSpinePower = power;

    // Jump stance multipliers:
    // Jump is always possible (unless in mid-air).
    // Better when jumping off rear paws, and even better when rear paws are anchored!
    const hadRearAnchor = this.rearAnchor.anchored;
    const rearOnGround = (this.rear && this.rear.onGround) || (this.nodes[1] && this.nodes[1].onGround) || hadRearAnchor;
    let stanceMult = 1.0;
    if (hadRearAnchor) {
      stanceMult = 1.55; // Maximum catapult boost!
    } else if (rearOnGround) {
      stanceMult = 1.25; // Good strong push off the rear feet!
    }

    // If holding a prop/enemy with one paw while the other was anchored to ground:
    // The spring uncoiling catapults the object!
    if (this.frontAnchor.propRef && !this.rearAnchor.propRef) {
      this.releaseAnchor(this.frontAnchor, true, particles);
    } else if (this.rearAnchor.propRef && !this.frontAnchor.propRef) {
      this.releaseAnchor(this.rearAnchor, false, particles);
    }

    // Release any anchor grips immediately so the caterpillar launches into the air with full momentum
    if (this.rearAnchor.anchored) {
      this.releaseAnchor(this.rearAnchor, false, particles);
    }
    if (this.frontAnchor.anchored) {
      this.releaseAnchor(this.frontAnchor, true, particles);
    }

    // Progressive jump power
    if (power <= 0.005) {
      return;
    }

    const baseMaxSpeed = GAMEPLAY_CONFIG.maxJumpSpeed || 520;
    const jumpSpeed = (power * baseMaxSpeed) * jumpBoostMult * strengthMult * speedMult * stanceMult;

    for (let i = 0; i < N; i++) {
      const trunkBonus = Math.sin((i / (N - 1)) * Math.PI) * 0.16;
      const frontBonus = 0.88 + 0.18 * (i / (N - 1)) + trunkBonus;
      this.nodes[i].vx = aimX * jumpSpeed * frontBonus;
      this.nodes[i].vy = aimY * jumpSpeed * frontBonus;
      this.nodes[i].onGround = false;
    }

    this.hopTimer = 0.45;
    this.extensionTimer = 0.32 + 0.16 * power;
    this.extensionMomentum.consumed = true;
    this.extensionMomentum.timer = 0;

    if (particles) {
      const mudCount = Math.round((4 + power * 8) * (hadRearAnchor ? 1.6 : 1.0));
      particles.spawnMud(this.rear.x, this.rear.y, -aimX, -aimY, mudCount, power * (hadRearAnchor ? 1.1 : 0.75));
    }
    sound.playLaunch(0.20 + power * 0.70 + (hadRearAnchor ? 0.30 : 0));
  }

  // Locked segment alignment: when a paw grabs a surface (rear foot or front foot),
  // that segment (0-1 for rear, N-2 to N-1 for front) remains glued flat against the surface.
  // It cannot rotate; rotations and steering are performed exclusively on the other segments!
  // When released, the segment unpins and smoothly blends back into the soft-body dynamics.
  // Locked segment alignment: when a paw grabs a surface (rear foot or front foot),
  // that segment remains glued flat against the surface during resting and crawling.
  // When both feet are anchored, or when bending, it forms an elegant Omega arch (Ω) without pinching!
  enforceGrippedSegmentLocks(curSegLen = this.extendedSegLen) {
    const N = this.numNodes;
    if (N < 3) return;

    const rearIsGround = this.rearAnchor.anchored && !this.isHoldingMovable(this.rearAnchor) && !this.rearAnchor.slipping;
    const frontIsGround = this.frontAnchor.anchored && !this.isHoldingMovable(this.frontAnchor) && !this.frontAnchor.slipping;
    const bothAnchored = rearIsGround && frontIsGround;
    if (bothAnchored) {
      // BOTH paws are anchored: the caterpillar forms a clean, beautiful Omega arch (Ω)!
      // The body rises away from the ground along the surface normal.
      // Interior nodes arch smoothly without folding, pinching, or crossing each other!
      const headIdx = N - 1;
      const rNode = this.nodes[0];
      const hNode = this.nodes[headIdx];

      // Surface normal (pointing out of ground)
      let upX = 0;
      let upY = -1;
      if (this.rearAnchor.propRef && this.rearAnchor.propRef === this.frontAnchor.propRef) {
        const prop = this.rearAnchor.propRef;
        const midAx = (rNode.x + hNode.x) * 0.5 - prop.x;
        const midAy = (rNode.y + hNode.y) * 0.5 - prop.y;
        const mLen = Math.hypot(midAx, midAy) || 1;
        upX = midAx / mLen;
        upY = midAy / mLen;
      } else {
        const rNx = this.rearAnchor.nx || 0;
        const rNy = this.rearAnchor.ny !== undefined ? this.rearAnchor.ny : -1;
        const fNx = this.frontAnchor.nx || 0;
        const fNy = this.frontAnchor.ny !== undefined ? this.frontAnchor.ny : -1;
        upX = (rNx + fNx) * 0.5;
        upY = (rNy + fNy) * 0.5;
        const uLen = Math.hypot(upX, upY) || 1;
        upX /= uLen;
        upY /= uLen;
      }

      const chordX = hNode.x - rNode.x;
      const chordY = hNode.y - rNode.y;
      const chordDist = Math.hypot(chordX, chordY);

      // Height of the Omega arch: rises gracefully with contraction!
      const archVisual = GAMEPLAY_CONFIG.omegaArchVisual !== undefined ? GAMEPLAY_CONFIG.omegaArchVisual : 1.0;
      const naturalArchH = Math.max(16, (this.fullLength - chordDist) * 0.48 + 18);
      const archHeight = (naturalArchH + this.contraction * 34) * archVisual;

      for (let i = 1; i < N - 1; i++) {
        const t = i / (N - 1);
        const baseX = rNode.x + chordX * t;
        const baseY = rNode.y + chordY * t;
        const archLift = Math.sin(t * Math.PI) * archHeight;

        const targetX = baseX + upX * archLift;
        const targetY = baseY + upY * archLift;

        const blend = 0.50 + this.contraction * 0.35;
        this.nodes[i].x += (targetX - this.nodes[i].x) * blend;
        this.nodes[i].y += (targetY - this.nodes[i].y) * blend;
        this.nodes[i].vx *= 0.55;
        this.nodes[i].vy *= 0.55;
      }
      return;
    }

    // Only one paw anchored:
    // 1. Rear gripped segment lock (Segment 0 between Node 0 and Node 1)
    if (rearIsGround) {
      const isRearingHigh = (this.rearingProgress || 0) > 0.20;
      const isCoiling = this.contraction > 0.15;

      if (!isRearingHigh && !isCoiling) {
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
          const dot = toHeadX * tx + toHeadY * ty;
          const sign = dot >= 0 ? 1 : -1;

          this.nodes[1].x = this.nodes[0].x + tx * sign * curSegLen;
          this.nodes[1].y = this.nodes[0].y + ty * sign * curSegLen;
          this.nodes[1].vx = 0;
          this.nodes[1].vy = 0;
        }
      }
    }

    // 2. Front gripped segment lock (Segment N-2 between Node N-2 and Node N-1)
    if (frontIsGround) {
      const isCoiling = this.contraction > 0.15;
      const headIdx = N - 1;
      const neckIdx = N - 2;

      if (!isCoiling) {
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
          const dot = toTailX * tx + toTailY * ty;
          const sign = dot >= 0 ? 1 : -1;

          this.nodes[neckIdx].x = this.nodes[headIdx].x + tx * sign * curSegLen;
          this.nodes[neckIdx].y = this.nodes[headIdx].y + ty * sign * curSegLen;
          this.nodes[neckIdx].vx = 0;
          this.nodes[neckIdx].vy = 0;
        }
      }
    }
  }

  stepPhysics(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const rear = this.rear;
    const head = this.head;

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
    const isExtending = !inputs.space && this.contraction > 0.08;
    const anyOnGround = this.nodes.some(n => n.onGround) || rearLocked || frontLocked;
    const isAirborne = !anyOnGround;

    const isBending = !!inputs.space;
    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    // When bending (holding SPACE), orientation is fully permitted unless specifically toggled off:
    let steerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);
    if (isBending && GAMEPLAY_CONFIG.bendCanOrientVertically === false) {
      steerY = 0;
    }
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

        const clsAgility = (this.bodyClass && this.bodyClass.agilityMult) || 1.0;
        for (let i = 0; i < N; i++) {
          const rx = this.nodes[i].x - cx;
          const ry = this.nodes[i].y - cy;
          this.nodes[i].vx += -ry * spinDir * 8.5 * clsAgility * dt;
          this.nodes[i].vy += rx * spinDir * 8.5 * clsAgility * dt;
        }
      } else {
        // On the ground / anchored:
        const inertiaBoost = (isExtending || isHopping) ? 1.5 : 1.0;
        const resp = GAMEPLAY_CONFIG.orientationResponsiveness || 2.2;
        const clsAgility = (this.bodyClass && this.bodyClass.agilityMult) || 1.0;
        const clsMass = (this.bodyClass && this.bodyClass.massMult) || 1.0;
        // Bending: orient continues smoothly at ~0.50x speed as requested; normal is full speed & snappy
        const bendMult = isBending ? (GAMEPLAY_CONFIG.bendOrientationPower !== undefined ? GAMEPLAY_CONFIG.bendOrientationPower : 0.50) : 1.0;
        const agilityRatio = (clsAgility / clsMass) * bendMult;

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

        if (!bothAnchored) {
          if (!rearLocked && !frontLocked) {
            // Free caterpillar on the ground:
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
              const liftEffort = (isHoldingFront && !hasSuperStrength) ? 0.70 : 1.0;
              const headReachForce = (GAMEPLAY_CONFIG.orientationUpForce || 2100) * resp * agilityRatio * liftEffort;

              // 1. Head rises first and foremost:
              const headLift = isLiftingFree ? Math.min(1.0, this.freeRearingProg / 0.28) : 1.0;
              this.head.vx += aimDirX * headReachForce * (isLiftingFree ? 0.75 : 1.0) * dt;
              this.head.vy += aimDirY * headReachForce * headLift * dt;

              // 2. Neck follows progressively only after head is already airborne:
              const neckLift = isLiftingFree ? Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.22) / 0.45)) : 1.0;
              this.nodes[N - 2].vx += aimDirX * headReachForce * 0.45 * neckLift * dt;
              this.nodes[N - 2].vy += aimDirY * headReachForce * 0.48 * neckLift * dt;

              // 3. Mid vertebra only follows later if Up continues to be held:
              const midLift = isLiftingFree ? Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.55) / 0.40)) : 1.0;
              this.nodes[N - 3].vx += aimDirX * headReachForce * 0.20 * midLift * dt;
              this.nodes[N - 3].vy += aimDirY * headReachForce * 0.22 * midLift * dt;

              // 4. Rear and pelvic nodes (0 and 1) stay weighted on the ground!
              // Keeps the tail planted firmly on the floor so the body arches naturally instead of levitating like a board:
              if (isLiftingFree) {
                this.nodes[0].vy += 160 * dt;
                this.nodes[1].vy += 100 * dt;
              }

              // Lower body crawl push is kept calm and deliberate so walking does NOT get faster:
              const crawlPush = 35.0 * clsAgility;
              if (steerX !== 0) {
                this.nodes[0].vx += steerX * crawlPush * dt;
                this.nodes[1].vx += steerX * crawlPush * dt;
              }

              // Active peeling / unsticking force if the head is touching an obstacle and steering away/up:
              if (this.head.onGround && this.head.groundNx !== undefined) {
                const dotAway = aimDirX * this.head.groundNx + aimDirY * this.head.groundNy;
                if (dotAway > -0.3 || effSteerY < 0) {
                  const unstick = (950 * liftEffort) * dt;
                  this.head.vx += this.head.groundNx * unstick;
                  this.head.vy += (this.head.groundNy < 0 ? this.head.groundNy * unstick : -unstick * 0.7);
                  this.head.onGround = false;
                }
              }
            }
          } else if (rearLocked && !frontLocked) {
            // Rear is anchored:
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
            // When player steers with arrows:
            // - Down arrow alone: wraps/hugs around surface contour (targetProg = 0.0)
            // - Up, Left, Right or diagonal arrows: directly aims and rears the head towards that direction (targetProg = 1.0)!
            // - Neutral (no arrow): rests draped along the surface (targetProg = 0.0)
            const isPureDown = isPressingDown && !isPressingLeft && !isPressingRight && !isPressingUp;
            let targetProg = 0.0;
            if (hasSteer && !isPureDown) {
              targetProg = 1.0;
            } else if (isBending) {
              targetProg = isPressingUp ? 1.0 : (hasSteer ? 0.35 : 0.20);
            } else {
              targetProg = 0.0;
            }

            const hasSuperStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
            const liftEffort = (isHoldingFront && !hasSuperStrength) ? 0.70 : 1.0;
            const rearRate = (targetProg > this.rearingProgress ? 4.8 : 8.5) * (GAMEPLAY_CONFIG.orientationResponsiveness || 2.2) * liftEffort;
            this.rearingProgress += (targetProg - this.rearingProgress) * Math.min(1, dt * rearRate);

            // Aim angle for steered head posture
            let targetAimAngle = surfAngle;
            if (hasSteer) {
              if (isPureDown) {
                targetAimAngle = surfAngle;
              } else {
                const aimDx = steerX !== 0 ? steerX : (surfTx * 0.35);
                const aimDy = effSteerY !== 0 ? effSteerY : (isPressingUp ? -1.0 : 0);
                targetAimAngle = Math.atan2(aimDy, aimDx);
              }
            }

            let curAngleDiff = targetAimAngle - this.rearingSmoothedAngle;
            while (curAngleDiff > Math.PI) curAngleDiff -= Math.PI * 2;
            while (curAngleDiff < -Math.PI) curAngleDiff += Math.PI * 2;
            const rotSpeed = (isPressingUp || effSteerY < 0) ? 24.0 : 18.0;
            this.rearingSmoothedAngle += curAngleDiff * Math.min(1, dt * rotSpeed * (GAMEPLAY_CONFIG.orientationResponsiveness || 2.2));

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

            // Progressive segment-by-segment lift:
            // Head (i=N-1) rises first, followed by neck (i=N-2), then mid-body (i=N-3).
            // Tail (i=0) and proleg (i=1) stay anchored to the surface!
            for (let i = 2; i < N; i++) {
              const segFraction = (i - 1) / (N - 2); // for i=2: 0.33, i=3: 0.67, i=4: 1.0 (head)
              // Threshold: Head begins lifting at 0.0, neck at ~0.22, mid-body at ~0.55
              const threshold = (1.0 - segFraction) * 0.65;
              const rawProg = Math.max(0, Math.min(1.0, (this.rearingProgress - threshold) / Math.max(0.01, 1.0 - threshold)));
              // Organic ease curve
              const segProg = rawProg * rawProg * (3.0 - 2.0 * rawProg);

              // Curvature: segment angle bends smoothly from surface angle to target aim angle
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
              tx[i] = groundX * (1 - segProg) + rearedX[i] * segProg;
              ty[i] = groundY * (1 - segProg) + rearedY[i] * segProg;

              const errX = tx[i] - this.nodes[i].x;
              let errY = ty[i] - this.nodes[i].y;

              // If player is steering UP, never let spine target pull nodes down toward the ground!
              if ((isPressingUp || effSteerY < 0) && errY > 0) {
                errY = 0;
              }

              const stiff = (rearProp && segProg < 0.2) ? 45.0 : (24.0 + 20.0 * segProg);
              const damp = 9.0 + 4.0 * segProg;
              this.nodes[i].vx += (errX * stiff - this.nodes[i].vx * damp) * dt;
              this.nodes[i].vy += (errY * stiff - this.nodes[i].vy * damp) * dt;
            }

            // 4. Active head aiming & reach authority:
            if (hasSteer && !isPureDown) {
              const headReachForce = (GAMEPLAY_CONFIG.orientationUpForce || 2100) * resp * agilityRatio * liftEffort;
              const aimDx = Math.cos(this.rearingSmoothedAngle);
              const aimDy = Math.sin(this.rearingSmoothedAngle);
              
              // Head always lifts first:
              this.head.vx += aimDx * headReachForce * 0.95 * dt;
              this.head.vy += aimDy * headReachForce * 0.95 * dt;

              // Neck follows progressively once head is up:
              const neckLift = Math.max(0, Math.min(1.0, (this.rearingProgress - 0.22) / 0.78));
              this.nodes[N - 2].vx += aimDx * headReachForce * 0.50 * neckLift * dt;
              this.nodes[N - 2].vy += aimDy * headReachForce * 0.50 * neckLift * dt;

              // Mid-body follows later:
              if (N > 3) {
                const midLift = Math.max(0, Math.min(1.0, (this.rearingProgress - 0.52) / 0.48));
                this.nodes[N - 3].vx += aimDx * headReachForce * 0.22 * midLift * dt;
                this.nodes[N - 3].vy += aimDy * headReachForce * 0.22 * midLift * dt;
              }

              // Direct immediate upward lift when pressing UP so held objects (acorn, enemy) rise effortlessly:
              if (isPressingUp || effSteerY < 0) {
                const upBoost = headReachForce * 0.90 * dt;
                this.head.vy -= upBoost;
                this.nodes[N - 2].vy -= upBoost * 0.50 * neckLift;
                if (N > 3) {
                  const midLift = Math.max(0, Math.min(1.0, (this.rearingProgress - 0.52) / 0.48));
                  this.nodes[N - 3].vy -= upBoost * 0.22 * midLift;
                }
                this.head.onGround = false;
              }

              // Peeling force if head touches an irregular obstacle, round prop or stairs while aiming away / up
              if (this.head.onGround || isPressingUp) {
                const unstick = (1100 * liftEffort) * dt;
                this.head.vy -= unstick;
                this.head.onGround = false;
              }
            }

            if (rearProp && (isPureDown || !hasSteer)) {
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

              if (isPressingDown) {
                // DOWN ARROW: wraps all the way around the circumference along the contour!
                this.head.vx += tangX * 420 * dt;
                this.head.vy += tangY * 420 * dt;
                if (this.head.y < rearProp.y) {
                  this.head.vy += 250 * dt;
                }
              }
            } else if (isPureDown) {
              if (this.head.onGround && this.head.groundNx !== undefined) {
                this.head.vx -= this.head.groundNx * 350 * dt;
                this.head.vy -= this.head.groundNy * 350 * dt;
              }
              const downForce = 850 * dt;
              this.head.vy += downForce;
              this.nodes[N - 2].vy += downForce * 0.70;
            }

            // Gravity assistance when suspended:
            // If body is suspended/hanging in the air (nodes not on ground), gravity naturally helps unroll the head down!
            const isSuspended = !this.head.onGround && !this.nodes[N - 2].onGround;
            if (isSuspended && (isPressingDown || effSteerY > 0 || !hasSteer)) {
              const hangGravityAid = (isPressingDown || effSteerY > 0) ? (980 * dt) : (380 * dt);
              this.head.vy += hangGravityAid;
              this.nodes[N - 2].vy += hangGravityAid * 0.75;
              if (N > 3) this.nodes[N - 3].vy += hangGravityAid * 0.45;
            }
          } else if (frontLocked && !rearLocked) {
            // Front is anchored: The player controls the tail with the arrows!
            // Rule: Can only lift slightly upward if several front segments touch the ground/surface,
            // and never like a flagpole ("pas trop vers le haut").
            const tail = this.rear;
            const matName = tail.groundMaterial || 'dirt';
            const mat = MATERIALS[matName] || MATERIALS.dirt;
            const slideEase = Math.max(0.25, 1.15 - mat.friction * 0.70);

            // Count how many consecutive front nodes are touching / resting on a surface
            let frontGroundCount = 1; // Head (N-1) is anchored
            for (let i = N - 2; i >= 0; i--) {
              if (this.nodes[i].onGround || this.nodes[i].groundMaterial) {
                frontGroundCount++;
              } else {
                break;
              }
            }
            // Support ratio: 0.15 if only head is on surface, up to 1.0 if 3+ front nodes touch the ground
            const frontSupportRatio = Math.max(0.15, Math.min(1.0, (frontGroundCount - 1) / 2.0));

            // Vector from tail toward front anchor:
            const toFrontX = this.frontAnchor.x - tail.x;
            const toFrontY = this.frontAnchor.y - tail.y;
            const toFrontDist = Math.hypot(toFrontX, toFrontY) || 1;
            const dirX = toFrontX / toFrontDist;
            const dirY = toFrontY / toFrontDist;

            // 1. Horizontal tail steering (Left / Right arrows)
            // Allows player to swing, slide, or sway the tail onto ledges or away/closer!
            if (steerX !== 0) {
              const tailHorizontalForce = 1500 * slideEase * resp * dt;
              for (let i = 0; i < N - 2; i++) {
                const ratio = (N - 2 - i) / (N - 2);
                this.nodes[i].vx += steerX * tailHorizontalForce * ratio;
              }
            }

            // Quick unrolling when tail forms a circle / curled loop with body:
            const tailToHeadDist = Math.hypot(this.rear.x - this.head.x, this.rear.y - this.head.y);
            if (tailToHeadDist < this.extendedSegLen * 2.8) {
              const uncurlThrust = 1350 * resp * dt;
              const uncurlDirX = steerX !== 0 ? steerX : (this.rear.x - this.head.x);
              const uncurlDirY = effSteerY !== 0 ? effSteerY : (this.rear.y - this.head.y);
              const uLen = Math.hypot(uncurlDirX, uncurlDirY) || 1;
              for (let i = 0; i < N - 2; i++) {
                const ratio = (N - 2 - i) / (N - 2);
                this.nodes[i].vx += (uncurlDirX / uLen) * uncurlThrust * ratio;
                this.nodes[i].vy += (uncurlDirY / uLen) * uncurlThrust * ratio;
              }
            }

            // 2. Longitudinal pull / push (Bending / Space or directional pull)
            if (isBending) {
              // Holding Space draws the tail smoothly toward the front anchor
              const pullForce = 750 * slideEase * resp * dt;
              for (let i = 0; i < N - 2; i++) {
                const ratio = (N - 2 - i) / (N - 2);
                this.nodes[i].vx += dirX * pullForce * ratio;
                this.nodes[i].vy += dirY * pullForce * ratio;
              }
            }

            // 3. Vertical tail control (Up / Down arrows):
            // - Down arrow: presses tail firmly against ground/surface for easy Q gripping
            // - Up arrow: lifts and arches the tail to aim direction before launching or flinging
            if (effSteerY > 0) {
              // Press tail down
              const downForce = 850 * resp * dt;
              for (let i = 0; i < N - 2; i++) {
                const ratio = (N - 2 - i) / (N - 2);
                this.nodes[i].vy += downForce * ratio;
              }
            } else if (effSteerY < 0) {
              // Lift tail up! Responsive lift to point tail upward or diagonally (boosted if holding object)
              const liftForce = (isHoldingRear ? 1300 : 1050) * resp * dt;
              for (let i = 0; i < N - 2; i++) {
                const ratio = Math.pow((N - 2 - i) / (N - 2), 0.95);
                this.nodes[i].vy -= liftForce * ratio;
              }
              // Ceiling clamp: allows generous natural lift (up to 85px above front anchor)
              const maxTailElevation = this.frontAnchor.y - 85;
              if (tail.y < maxTailElevation) {
                tail.y = maxTailElevation;
                tail.vy = Math.max(0, tail.vy);
              }
            }
          }
        }
      }
    }

    // 3. Integrate Heavier Gravity, Viscous Damping & Physical Larval Breathing
    let currentGravity = world.gravity || GAMEPLAY_CONFIG.gravity || 740;
    if (this.activePowerUp && this.activePowerUp.type === 'feather') {
      currentGravity *= 0.35;
    }

    for (let i = 0; i < N; i++) {
      const n = this.nodes[i];
      if ((i === 0 && rearLocked) || (i === 1 && rearLocked) || (i === N - 1 && frontLocked) || (i === N - 2 && frontLocked)) {
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
        !isHopping &&
        !isExtending &&
        !isBending &&
        !hasSteer &&
        Math.hypot(n.vx, n.vy) < 22;

      n.onGround = false;

      if (!restingOnGentleSlope) {
        const heightAboveGround = Math.max(0, lowestY - n.y);
        const isAnchoredOnePaw = (rearLocked && !frontLocked) || (frontLocked && !rearLocked);
        const isHeadPart = (i >= N - 2);
        const isLiftingHead = isHeadPart && effSteerY < 0;
        // Ground snapping must NEVER drag down the head when lifting or aiming
        const snapMult = (!isAnchoredOnePaw && !isLiftingHead && n.vy >= 0 && heightAboveGround < 50) ? (1.0 + (GAMEPLAY_CONFIG.groundSnapping || 1.3) * 0.35) : 1.0;

        let liftRelief = 1.0;
        if (effSteerY < 0 || (rearLocked && !frontLocked && this.rearingProgress > 0.1)) {
          if (rearLocked && !frontLocked) {
            const t = i / (N - 1);
            const threshold = (1.0 - t) * 0.40;
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
              const neckLift = Math.max(0, Math.min(1.0, (this.freeRearingProg - 0.22) / 0.45));
              liftRelief = 1.0 - neckLift * (isHoldingFront ? 0.45 : 0.65);
            } else {
              liftRelief = 1.0;
            }
          }
        } else if (hasSteer && effSteerY < 0) {
          liftRelief = isHeadPart ? (isAnchoredOnePaw ? (isHoldingFront ? 0.45 : 0.25) : (isHoldingFront ? 0.65 : 0.50)) : 1.0;
        }
        const holdGravityMult = (isBending && (rearLocked || frontLocked)) ? (effSteerY < 0 ? 0.25 : 0.85) : liftRelief;
        n.vy += currentGravity * snapMult * holdGravityMult * dt;
      } else {
        n.vx *= 0.45;
        n.vy = Math.max(0, n.vy) + currentGravity * 0.25 * dt;
      }

      // Calm, slow crawl speed on ground when just steering with arrows:
      // (Only applies to rear and body feet so head can reach freely over obstacles!)
      if (!isHopping && !isExtending && anyOnGround && i < N - 2) {
        const maxGroundCrawl = GAMEPLAY_CONFIG.maxGroundCrawl || 26;
        if (n.onGround || n.groundMaterial) {
          if (n.vx > maxGroundCrawl) n.vx = maxGroundCrawl;
          else if (n.vx < -maxGroundCrawl) n.vx = -maxGroundCrawl;
        }
      }

      // Smooth viscous damping
      const drag = isAirborne ? 0.994 : (hasSteer ? 0.968 : 0.978);
      n.vx *= Math.pow(drag, dt * 60);
      n.vy *= Math.pow(drag, dt * 60);

      n.x += n.vx * dt;
      n.y += n.vy * dt;
    }

    // Viscous velocity coupling between neighbor segments
    for (let i = 0; i < N - 1; i++) {
      const a = this.nodes[i];
      const b = this.nodes[i + 1];
      const aPinned = (i === 0 && rearLocked) || (i === 1 && rearLocked);
      const bPinned = (i + 1 === N - 1 && frontLocked) || (i + 1 === N - 2 && frontLocked);
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
          const idealX = anchorPt.x + aimX * curExtendedSegLen * (i - 1);
          const idealY = anchorPt.y + aimY * curExtendedSegLen * (i - 1);
          this.nodes[i].vx += (idealX - this.nodes[i].x) * (26.0 * extRatio) * ratio * dt;
          this.nodes[i].vy += (idealY - this.nodes[i].y) * (26.0 * extRatio) * ratio * dt;
        }
      } else if (frontLocked && !rearLocked) {
        let aimX = steerX;
        let aimY = effSteerY;
        const aimDist = Math.hypot(aimX, aimY);
        if (aimDist > 0.1) {
          aimX /= aimDist;
          aimY /= aimDist;
        } else {
          const fv = this.getFrontVector();
          aimX = -fv.dx;
          aimY = -fv.dy;
        }

        // Tail unbending is fast and responsive:
        const thrust = 720 * extRatio;
        const anchorPt = this.nodes[N - 2];
        for (let i = 0; i < N - 2; i++) {
          const ratio = (N - 2 - i) / (N - 2);
          this.nodes[i].vx += aimX * thrust * ratio * dt;
          this.nodes[i].vy += aimY * thrust * ratio * dt;

          const segCountFromFront = N - 2 - i;
          const idealX = anchorPt.x + aimX * curExtendedSegLen * segCountFromFront;
          const idealY = anchorPt.y + aimY * curExtendedSegLen * segCountFromFront;
          this.nodes[i].vx += (idealX - this.nodes[i].x) * (34.0 * extRatio) * ratio * dt;
          this.nodes[i].vy += (idealY - this.nodes[i].y) * (34.0 * extRatio) * ratio * dt;
        }
      } else if (!rearLocked && !frontLocked) {
        let aimX = 0;
        let aimY = 0;
        if (this.launchSpineDir) {
          aimX = this.launchSpineDir.x;
          aimY = this.launchSpineDir.y;
        } else {
          let sDx = 0, sDy = 0;
          for (let i = 0; i < N - 1; i++) {
            const segDx = this.nodes[i + 1].x - this.nodes[i].x;
            const segDy = this.nodes[i + 1].y - this.nodes[i].y;
            const sDist = Math.hypot(segDx, segDy) || 1;
            sDx += segDx / sDist;
            sDy += segDy / sDist;
          }
          const sLen = Math.hypot(sDx, sDy) || 1;
          aimX = sDx / sLen;
          aimY = sDy / sLen;
        }

        // Center of mass as reference point for symmetric lengthwise deployment:
        // Spreads out straight along the body direction, eliminating round curling!
        let cx = 0, cy = 0;
        for (let i = 0; i < N; i++) {
          cx += this.nodes[i].x;
          cy += this.nodes[i].y;
        }
        cx /= N;
        cy /= N;

        const thrust = (35 * (this.launchSpinePower || 0)) * extRatio;
        const midIdx = (N - 1) * 0.5;

        for (let i = 0; i < N; i++) {
          const offsetFromMid = i - midIdx;
          // Spring uncoiling: straightens the entire spine lengthwise along the body direction!
          const idealX = cx + aimX * (curExtendedSegLen * offsetFromMid);
          const idealY = cy + aimY * (curExtendedSegLen * offsetFromMid);
          const straightenPower = 28.0 * extRatio;
          this.nodes[i].vx += (idealX - this.nodes[i].x) * straightenPower * dt;
          this.nodes[i].vy += (idealY - this.nodes[i].y) * straightenPower * dt;

          if (thrust > 0) {
            const trunkWeight = Math.sin((i / (N - 1)) * Math.PI);
            const ratio = 0.35 * (i / (N - 1)) + 0.65 * trunkWeight;
            this.nodes[i].vx += aimX * thrust * ratio * dt;
            this.nodes[i].vy += aimY * thrust * ratio * dt;
          }
        }
      }

      // Extension damage: uncoiling/extending body strikes nearby enemies and knocks them back!
      const allEnemies = [...(world.aphids || []), ...(world.hedgehogs || [])];
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
    const targetSegLen =
      (this.extendedSegLen * reachBonus * lengthMult) * (1 - this.contraction) +
      (this.contractedSegLen * lengthMult) * this.contraction;

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
        const curTargetSegLen = ((i === 0 && rearLocked) || (i === N - 2 && frontLocked))
          ? this.extendedSegLen
          : targetSegLen;

        const diff = (d - curTargetSegLen) / d;

        const aPinned = (i === 0 && rearLocked) || (i === 1 && rearLocked);
        const bPinned = (i + 1 === N - 1 && frontLocked) || (i + 1 === N - 2 && frontLocked);

        const stiff = this.extensionTimer > 0 ? 0.90 : (0.55 + this.bodyRigidity * 0.20);
        if (aPinned && !bPinned) {
          b.x -= dx * diff * stiff;
          b.y -= dy * diff * stiff;
        } else if (bPinned && !aPinned) {
          a.x += dx * diff * stiff;
          a.y += dy * diff * stiff;
        } else if (!aPinned && !bPinned) {
          a.x += dx * diff * stiff * 0.5;
          a.y += dy * diff * stiff * 0.5;
          b.x -= dx * diff * stiff * 0.5;
          b.y -= dy * diff * stiff * 0.5;
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
        const minSkipDist = ((i === 0 && rearLocked) || (i + 2 === N - 1 && frontLocked))
          ? (this.extendedSegLen + targetSegLen) * 0.76
          : targetSegLen * 1.52;
        if (d < minSkipDist) {
          const diff = (d - minSkipDist) / d; // negative
          const aPinned = (i === 0 && rearLocked) || (i === 1 && rearLocked);
          const cPinned = (i + 2 === N - 1 && frontLocked) || (i + 2 === N - 2 && frontLocked);
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

    // Run gripped segment lock once per substep (smooth, no redundant velocity killing)
    this.enforceGrippedSegmentLocks(this.extendedSegLen);

    // 5. Handle World Collisions
    this.handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep);

    // 6. Sprite / Texture Flip:
    // Only flip when landed mostly on its back (dorsal side in contact with surface),
    // with at least 3 segments touching on the back and at least one foot touching on the back.
    if (isFirstSubstep && this.flipCooldown <= 0) {
      let dorsalTouches = 0;
      let footOnDorsal = false;

      for (let i = 0; i < N; i++) {
        const n = this.nodes[i];
        if (!n.onGround) continue;

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

        // Ground normal n.groundNx, n.groundNy points outward from surface to node center.
        // Surface is in direction (-n.groundNx, -n.groundNy) from node center.
        // If surface contact is in direction of the dorsal side (back against surface):
        const dot = (n.groundNx || 0) * dNx + (n.groundNy || 0) * dNy;
        if (dot < -0.25) {
          dorsalTouches++;
          if (i === 0 || i === N - 1) {
            footOnDorsal = true;
          }
        }
      }

      const minDorsalSegments = 3;
      if (dorsalTouches >= minDorsalSegments && footOnDorsal) {
        this.dorsalSign = -this.dorsalSign;
        this.flipCooldown = 0.50;
        sound.playLaunch(0.35);
      }
    }
  }

  handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const isHopping = this.hopTimer > 0;
    const isExtending = this.extensionTimer > 0 || (!inputs.space && this.contraction > 0.04);
    const isBending = !!inputs.space || this.contraction > 0.04;
    const hasSteer = !!(inputs.left || inputs.right || inputs.up || inputs.down);
    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const { dx } = this.getFrontVector();
    const facingDir = dx >= 0 ? 1 : -1;
    const isReverse = (steerX !== 0) && (Math.sign(steerX) !== facingDir);

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

          if (!isPinned) {
            if (seg.material !== 'moss' && slopeGrade <= 0.30 && cp.ny < -0.5) {
              n.x += cp.nx * overlap;
              n.y += cp.ny * overlap;

              const vn = n.vx * cp.nx + n.vy * cp.ny;
              const vt = n.vx * cp.tx + n.vy * cp.ty;
              const newVn = vn < 0 ? -vn * mat.restitution * 0.3 : vn;

              // Ground traction: allow free natural arching/contracting without locking feet into the dirt!
              const isHead = (i === N - 1);
              const frictionRate = (isHead && hasSteer) ? 2.5 : ((isHopping || isExtending || isBending) ? 8.0 : (hasSteer ? (isReverse ? 45.0 : 34.0) : 48.0));
              let newVt = vt * Math.max(0, 1 - frictionRate * dt);
              if (!hasSteer && !isHopping && !isExtending && !isBending && Math.abs(newVt) < 24) {
                newVt = 0;
              }

              n.vx = cp.nx * newVn + cp.tx * newVt;
              n.vy = cp.ny * newVn + cp.ty * newVt;
              if (!hasSteer && !isHopping && !isExtending && !isBending && Math.abs(newVt) === 0 && vn <= 0) {
                n.vx = 0;
                n.vy = 0;
              }
            } else {
              n.x += cp.nx * overlap;
              n.y += cp.ny * overlap;

              const vn = n.vx * cp.nx + n.vy * cp.ny;
              const vt = n.vx * cp.tx + n.vy * cp.ty;
              const newVn = vn < 0 ? -vn * mat.restitution : vn;

              let newVt = vt;
              if (seg.material === 'moss') {
                newVt = vt * Math.max(0, 1 - 1.2 * dt);
              } else {
                const excessSlope = Math.max(0, slopeGrade - 0.30);
                const isHead = (i === N - 1);
                const damping = (isHead && hasSteer) ? 1.5 : (hasSteer ? 5.5 : Math.max(2.0, 18.0 - excessSlope * 20.0));
                newVt = vt * Math.max(0, 1 - damping * dt);
              }

              n.vx = cp.nx * newVn + cp.tx * newVt;
              n.vy = cp.ny * newVn + cp.ty * newVt;
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

        // For props when held (acorns, or pinecones held with superforce): skip collision with body nodes to prevent self-propulsion
        if (prop.isHeld) {
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
        if (a.isHeld) continue;
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
          if (h.isHeld) continue;
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
            this.applyPowerUp(p.type, 15.0, particles, sound);
            break;
          }
        }
      }

      // Collectible Healing Apples (+1 Permanent Segment for whole game!)
      if (world.apples && world.apples.length > 0) {
        for (const apple of world.apples) {
          if (apple.collected) continue;
          const adx = n.x - apple.x;
          const ady = n.y - apple.y;
          const adist = Math.hypot(adx, ady);
          if (adist < n.r + apple.radius + 6) {
            apple.collected = true;
            this.addPermanentSegment(particles);
            break;
          }
        }
      }
    }

    // Sticky Crumbs
    for (const c of world.stickyCrumbs) {
      this.checkStickyTrap(this.rearAnchor, this.rear, false, c, particles);
      this.checkStickyTrap(this.frontAnchor, this.head, true, c, particles);
    }
  }

  checkStickyTrap(anchor, node, isFront, crumb, particles) {
    if (anchor.stuckCrumb === crumb) return;
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
      particles.spawnStickyGoo(crumb.x, crumb.y, 7);
      particles.spawnPopup(crumb.x, crumb.y - 20, 'ENGLUÉ ! (ESPACE)', '#ff4757');
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
      if (anchor.propRef) {
        anchor.propRef.isHeld = false;
        anchor.propRef = null;
      }
      anchor.segRef = null;
      anchor.localPt = null;
      return;
    }

    if (anchor.anchored) {
      if (anchor.hedgehogRef) {
        const hedgehog = anchor.hedgehogRef;
        hedgehog.isHeld = true;
        const hDist = hedgehog.radius * 0.92 + node.r * 0.70;
        let attachNx = anchor.nx !== undefined ? anchor.nx : 1;
        let attachNy = anchor.ny !== undefined ? anchor.ny : 0;
        const aLen = Math.hypot(attachNx, attachNy) || 1;
        attachNx /= aLen;
        attachNy /= aLen;

        hedgehog.x = node.x - attachNx * hDist;
        hedgehog.y = node.y - attachNy * hDist;
        world.resolveEntitySegmentCollisions(hedgehog);
        node.x = hedgehog.x + attachNx * hDist;
        node.y = hedgehog.y + attachNy * hDist;
        hedgehog.vx = node.vx;
        hedgehog.vy = node.vy;

        anchor.x = node.x;
        anchor.y = node.y;
        return;
      }

      if (anchor.aphidRef) {
        const aphid = anchor.aphidRef;
        aphid.isHeld = true;
        const aDist = aphid.radius * 0.90 + node.r * 0.70;
        let attachNx = anchor.nx !== undefined ? anchor.nx : 1;
        let attachNy = anchor.ny !== undefined ? anchor.ny : 0;
        const aLen = Math.hypot(attachNx, attachNy) || 1;
        attachNx /= aLen;
        attachNy /= aLen;

        aphid.x = node.x - attachNx * aDist;
        aphid.y = node.y - attachNy * aDist;
        world.resolveEntitySegmentCollisions(aphid);
        node.x = aphid.x + attachNx * aDist;
        node.y = aphid.y + attachNy * aDist;
        aphid.vx = node.vx;
        aphid.vy = node.vy;

        anchor.x = node.x;
        anchor.y = node.y;
        return;
      }

      if (anchor.propRef) {
        const prop = anchor.propRef;
        const hasSuperStrength = (this.activePowerUp && this.activePowerUp.type === 'strength');
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
          // Grabbable light props (Acorns) move with the caterpillar's mouth or tail!
          // Can be lifted into the air, carried around, dragged or hoisted effortlessly.
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

      if (anchor.material === 'moss' && anchor.segRef) {
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

      node.x = anchor.x;
      node.y = anchor.y;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    const extraGrip = (this.bodyClass && this.bodyClass.gripExtraDistance) || 0;
    const isReaching = (this.extensionTimer > 0) || (anchor.holdingKey && (this.rearAnchor.anchored || this.frontAnchor.anchored));
    const reachBonus = isReaching ? 16 : 0;
    const maxSurfaceGap = (GAMEPLAY_CONFIG.gripDistance || 26) + extraGrip + reachBonus;
    const suctionRange = node.r + maxSurfaceGap;

    // Check grabbable enemy hedgehogs (safe front snout, dangerous spikes on back/rear!)
    if (world.findClosestHedgehog) {
      const hHit = world.findClosestHedgehog(node.x, node.y, suctionRange);
      if (hHit) {
        if (hHit.isFrontHead) {
          anchor.anchored = true;
          anchor.hedgehogRef = hHit.hedgehog;
          anchor.aphidRef = null;
          anchor.propRef = null;
          anchor.segRef = null;
          anchor.localPt = null;
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
        } else if (hHit.isSpiky) {
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
      anchor.propRef = null;
      anchor.segRef = null;
      anchor.localPt = null;
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

    const propHit = world.findClosestPropSurface(node.x, node.y, suctionRange);
    if (propHit) {
      anchor.anchored = true;
      anchor.propRef = propHit.prop;
      anchor.aphidRef = null;
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
      return;
    }

    const hit = world.findClosestSurface(node.x, node.y, suctionRange);
    if (hit) {
      anchor.anchored = true;
      anchor.segRef = hit.seg;
      anchor.aphidRef = null;
      anchor.propRef = null;
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
    this.drawSuctionFoot(ctx, rear.x, rear.y, tailSeg.ux, tailSeg.uy, tailSeg.nx, tailSeg.ny, this.rearAnchor, false, this.rearCanGrip, pal, time);

    // 2b. Front suction foot (mouth / head clasper / D)
    const frontSeg = samples[numSamples - 2];
    this.drawSuctionFoot(ctx, head.x, head.y, frontSeg.ux, frontSeg.uy, frontSeg.nx, frontSeg.ny, this.frontAnchor, true, this.frontCanGrip, pal, time);

    // 2c. Thoracic true legs (3 cute pairs near the front: s = 15, 17, 19)
    const legIndices = [15, 17, 19];
    for (let li = 0; li < legIndices.length; li++) {
      const s = legIndices[li];
      const seg = samples[s];
      const legSwing = Math.sin(this.crawlPhase * 1.5 - li * 0.9) * 3.2;
      const bx = seg.x - seg.nx * (seg.r * 0.75);
      const by = seg.y - seg.ny * (seg.r * 0.75);
      const tipX = bx - seg.nx * 8.0 + seg.ux * (legSwing + 2);
      const tipY = by - seg.ny * 8.0 + seg.uy * (legSwing + 2);

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.strokeStyle = pal.belly;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
    }

    // 2d. Abdominal prolegs (2 cute fleshy pairs along mid-belly: s = 6, 10)
    const prolegIndices = [6, 10];
    for (let pi = 0; pi < prolegIndices.length; pi++) {
      const s = prolegIndices[pi];
      const seg = samples[s];
      const pSwing = Math.sin(this.crawlPhase * 1.2 - pi * 1.1) * 2.4;
      const bx = seg.x - seg.nx * (seg.r * 0.82);
      const by = seg.y - seg.ny * (seg.r * 0.82);
      const tipX = bx - seg.nx * 6.5 + seg.ux * pSwing;
      const tipY = by - seg.ny * 6.5 + seg.uy * pSwing;

      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.strokeStyle = pal.bodyFill;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
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
      const foldFractions = [0.22, 0.42, 0.62, 0.80];
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
        if (pal.isStriped) {
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
    }

    // 6. CUTE LARVAL HEAD CAPSULE
    const headSample = samples[numSamples - 1];
    const headAngle = Math.atan2(headSample.uy, headSample.ux);
    this.drawCuteLarvalHead(ctx, head.x, head.y, headAngle, pal, time);

    // 7. SUPERIMPOSED VISUAL BADGES (Q & D)
    if (GAMEPLAY_CONFIG.showBadgesOverlay) {
      const rearBadgeX = rear.x - tailSeg.nx * 14;
      const rearBadgeY = rear.y - tailSeg.ny * 14 + 22;
      const frontBadgeX = head.x - frontSeg.nx * 14;
      const frontBadgeY = head.y - frontSeg.ny * 14 + 22;

      this.drawAnchorBadge(ctx, rearBadgeX, rearBadgeY, 'Q', this.rearAnchor, this.rearCanGrip, this.rearTargetPt, '#b84eff', time);
      this.drawAnchorBadge(ctx, frontBadgeX, frontBadgeY, 'D', this.frontAnchor, this.frontCanGrip, this.frontTargetPt, '#24bd4c', time);
    }

    ctx.restore();
  }

  drawSuctionFoot(ctx, x, y, ux, uy, nx, ny, anchor, isFront, canGrip, pal, time) {
    const activeColor = isFront ? '#24bd4c' : '#b84eff';
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
      ctx.fillStyle = isFront ? 'rgba(56, 216, 78, 0.40)' : 'rgba(184, 78, 255, 0.40)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 16 * pulse, 7 * pulse, 0, 0, Math.PI * 2);
      ctx.fill();
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
    // 0 = wide open on the sides (reaching / in air)
    // 1 = clamped inward to center, hugging the ground surface
    let gripT = 0.18;
    if (anchor.anchored) {
      gripT = 1.0;
    } else if (canGrip) {
      gripT = 0.0 + Math.sin(time * 14) * 0.05;
    } else if (anchor.holdingKey) {
      gripT = 0.50 + Math.sin(time * 12) * 0.18;
    }

    // Helper to draw a cute, plump, curved grasping claw
    // dir: -1 (left / rear), +1 (right / front)
    const drawSideClaw = (dir, baseX, baseY, length, baseWidth, openRot, closedRot) => {
      ctx.save();
      ctx.translate(baseX, baseY);

      const curRot = dir * (openRot * (1 - gripT) + closedRot * gripT);
      ctx.rotate(curRot);

      // Inward curvature towards center
      const curveX = -dir * (length * 0.28);
      // When anchored, claw hugs horizontally along the surface without plunging into the ground
      const tipY = length * (anchor.anchored ? 0.72 : 1.0);
      const tipX = curveX;

      ctx.beginPath();
      ctx.moveTo(-baseWidth * 0.5, 0);
      // Outer smooth curved contour
      ctx.quadraticCurveTo(-baseWidth * 0.35 + curveX * 0.25, tipY * 0.55, tipX, tipY);
      // Sweet rounded tip
      ctx.arc(tipX, tipY, 1.3, 0, Math.PI * 0.5);
      // Inner curved contour (talon arch)
      ctx.quadraticCurveTo(baseWidth * 0.45 + curveX * 0.75, tipY * 0.5, baseWidth * 0.5, 0);
      ctx.closePath();

      // Shiny warm ivory gradient
      const grad = ctx.createLinearGradient(0, 0, tipX, tipY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.65, '#fffce8');
      grad.addColorStop(1, anchor.anchored ? '#ffd93b' : '#ffeed4');

      ctx.fillStyle = grad;
      ctx.strokeStyle = pal.outline;
      ctx.lineWidth = 2.4;
      ctx.fill();
      ctx.stroke();

      // Cute round joint at claw base
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.arc(0, 0.5, baseWidth * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glossy highlight dot
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(tipX * 0.55, tipY * 0.5, 1.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw opposing claws on each side (-1: left/rear, +1: right/front)
    const classScale = (this.bodyClass && this.bodyClass.visualScale) || 1.0;
    const scaleFactor = ((GAMEPLAY_CONFIG.clawScale !== undefined ? GAMEPLAY_CONFIG.clawScale : 1.35) / 1.35) * classScale;
    for (const dir of [-1, 1]) {
      // Main gripping claw (lower, contacts ground horizontally)
      const mainBaseX = dir * (6.5 - gripT * 2.2);
      const mainBaseY = 1.0;
      drawSideClaw(dir, mainBaseX, mainBaseY, 12.0 * scaleFactor, 4.2 * scaleFactor, 1.05, -0.55);

      // Secondary upper claw (cute layered proleg hook)
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

    // 1. Target contact marker and dotted link line on nearest surface if canGrip
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

      // Surface docking target circle
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

    // 2. Badge Keycap Rendering - strictly 'Q' and 'D' only
    ctx.font = '900 13px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let bg = 'rgba(22, 28, 38, 0.85)';
    let border = 'rgba(255, 255, 255, 0.6)';
    let badgeScale = 1.0;

    if (anchor.stuckCrumb) {
      bg = '#ff4757';
      border = '#ffffff';
    } else if (anchor.propRef) {
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
}
