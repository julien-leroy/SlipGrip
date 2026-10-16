// js/caterpillar.js — Viscous Arcade Larval Caterpillar with Configurable Physics & Responsive Controls
import { MATERIALS } from './physics.js?v=24';
import { sound } from './audio.js?v=24';
import { GAMEPLAY_CONFIG, CATERPILLAR_CLASSES } from './gameplayConfig.js?v=24';

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
    name: 'Lavande',
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
  }
};

export class Caterpillar {
  constructor(startX, startY) {
    this.cosmetics = {
      palette: 'emerald',
      hat: 'crown',
      face: 'cute',
      bodyType: 'classique'
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

    this.wiggleTime = 0;
    this.crawlPhase = 0;
    this.cameraFocus = { x: startX + 69, y: startY };

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
    this.numNodes = cls.numNodes;
    const reachMult = GAMEPLAY_CONFIG.unbendReachBonus || 1.0;
    this.extendedSegLen = cls.extendedSegLen * reachMult;
    this.contractedSegLen = cls.contractedSegLen;
    this.fullLength = this.extendedSegLen * (this.numNodes - 1);

    if (morphExisting && this.nodes && this.nodes.length > 0) {
      const oldRear = { x: this.rear.x, y: this.rear.y, vx: this.rear.vx, vy: this.rear.vy };
      const oldHead = { x: this.head.x, y: this.head.y, vx: this.head.vx, vy: this.head.vy };
      const newNodes = [];
      for (let i = 0; i < this.numNodes; i++) {
        const t = i / (this.numNodes - 1);
        const u = t * (this.nodes.length - 1);
        const idx = Math.min(this.nodes.length - 2, Math.floor(u));
        const f = u - idx;
        const nA = this.nodes[idx];
        const nB = this.nodes[Math.min(this.nodes.length - 1, idx + 1)];
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
      if (this.rearAnchor.anchored) {
        this.rearAnchor.x = this.rear.x;
        this.rearAnchor.y = this.rear.y;
      }
      if (this.frontAnchor.anchored) {
        this.frontAnchor.x = this.head.x;
        this.frontAnchor.y = this.head.y;
      }
    }
  }

  setBodyType(typeId) {
    this.applyBodyClass(typeId, true);
    this.saveCosmetics();
  }

  createEmptyAnchor(x, y) {
    return {
      holdingKey: false,
      anchored: false,
      slipping: false,
      propRef: null,
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

  loadCosmetics() {
    try {
      const saved = localStorage.getItem('slipgrip_cosmetics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.palette && COSMETIC_PALETTES[parsed.palette]) this.cosmetics.palette = parsed.palette;
        if (parsed.hat) this.cosmetics.hat = parsed.hat;
        if (parsed.face) this.cosmetics.face = parsed.face;
        if (parsed.bodyType && CATERPILLAR_CLASSES[parsed.bodyType]) this.cosmetics.bodyType = parsed.bodyType;
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

    this.nodes = [];
    const radii = cls.radii || [13.5, 15.5, 17.0, 17.8, 17.0, 16.0, 17.5];
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

    this.wiggleTime = 0;
    this.crawlPhase = 0;

    this.cameraFocus = { x: startX + 69, y: startY };
    this.expression = 'happy';
  }

  get rear() {
    return this.nodes[0];
  }

  get head() {
    return this.nodes[this.numNodes - 1];
  }

  get omegaCharge() {
    const maxChargeTime = GAMEPLAY_CONFIG.jumpChargeTime || 3.0;
    const durRatio = this.chargeDuration / maxChargeTime;
    return Math.min(1.0, Math.max(this.contraction, durRatio));
  }

  get centerOfMass() {
    return this.cameraFocus;
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

    // Fling / Throw grabbable light props (like acorns) with inertia!
    if (anchor.propRef) {
      const prop = anchor.propRef;
      if (prop.type === 'acorn' || prop.mass < 15) {
        prop.vx = Math.max(-260, Math.min(260, node.vx * 1.30));
        prop.vy = Math.max(-260, Math.min(260, node.vy * 1.30 - 35));
        sound.playLaunch(0.6);
      }
    }

    anchor.anchored = false;
    anchor.slipping = false;
    anchor.propRef = null;
    anchor.segRef = null;
    anchor.localPt = null;
    sound.playRelease(isFront);
    particles.spawnSuctionRing(node.x, node.y, isFront ? '#a8ffbc' : '#e4b8ff');

    const otherAnchor = isFront ? this.rearAnchor : this.frontAnchor;
    if (!otherAnchor.anchored) {
      if (this.extensionMomentum.timer > 0 || this.contraction > 0.05) {
        // Releasing anchor while jump extension is active:
        // Carry forward launch velocity to all nodes so the entire caterpillar
        // flies forward smoothly and finishes its expansion without getting stopped!
        const power = Math.max(this.extensionMomentum.power || 0, this.storedContraction || 0.4);
        const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
        const pushMult = (GAMEPLAY_CONFIG.groundPushForce || GAMEPLAY_CONFIG.jumpBoost || 1.05) * clsJump;
        const launchSpeed = (95 + power * 105) * pushMult;

        let aimX = 0;
        let aimY = 0;
        if (this.lastLaunchDir) {
          aimX = this.lastLaunchDir.aimX;
          aimY = this.lastLaunchDir.aimY;
        } else {
          const fv = this.getFrontVector();
          aimX = isFront ? -fv.dx : fv.dx;
          aimY = isFront ? -fv.dy : fv.dy;
        }

        for (let i = 0; i < this.numNodes; i++) {
          this.nodes[i].vx = aimX * launchSpeed;
          this.nodes[i].vy = aimY * launchSpeed;
          this.nodes[i].onGround = false;
        }

        this.extensionMomentum.consumed = true;
        this.extensionMomentum.timer = 0.35;
        sound.playLaunch(0.4 + power * 0.4);
      }
    }
  }

  // Forward vector oriented toward the front of the caterpillar
  getFrontVector() {
    const N = this.numNodes;
    const rear = this.nodes[0];
    const neck = this.nodes[N - 3];
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

    let aimX = dx + steerX * 0.70;
    let aimY = dy + (steerY < 0 ? steerY * (GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.55) : steerY * 0.55);
    const len = Math.hypot(aimX, aimY) || 1;
    aimX /= len;
    aimY /= len;

    const hopSpeed = (85 + power * 95) * (GAMEPLAY_CONFIG.jumpBoost || 1.05);
    const vx = aimX * hopSpeed;
    const upImpulse = steerY < 0 ? (45 + power * 80) : 22;
    const vy = aimY * hopSpeed - upImpulse;

    for (let i = 0; i < this.numNodes; i++) {
      const frontBias = 0.75 + 0.45 * (i / (this.numNodes - 1));
      this.nodes[i].vx = vx * frontBias;
      this.nodes[i].vy = vy * frontBias;
      this.nodes[i].onGround = false;
    }

    particles.spawnMud(this.rear.x, this.rear.y, 0, -1, 6, power * 0.6);
  }

  update(dt, world, inputs, particles) {
    const safeDt = Math.min(dt, 1 / 30);
    const speed = Math.hypot(this.head.vx, this.head.vy);
    this.propellerAngle += safeDt * (10 + speed * 0.08);
    this.crawlPhase += safeDt * (5.5 + speed * 0.08);
    this.wiggleTime += safeDt * (3.0 + speed * 0.05);
    this.lastInputs = { ...inputs };

    if (this.extensionMomentum.timer > 0) {
      this.extensionMomentum.timer = Math.max(0, this.extensionMomentum.timer - safeDt);
    }

    // Live surface proximity detection for Q and D visual aids
    const extraGrip = (this.bodyClass && this.bodyClass.gripExtraDistance) || 0;
    const gripDist = (GAMEPLAY_CONFIG.gripDistance || 24) + extraGrip;
    const rearRange = this.rear.r + gripDist;
    const headRange = this.head.r + gripDist;

    const rearProp = world.findClosestPropSurface(this.rear.x, this.rear.y, rearRange);
    const rearSurf = rearProp || world.findClosestSurface(this.rear.x, this.rear.y, rearRange);
    this.rearCanGrip = !!rearSurf;
    this.rearTargetPt = rearSurf ? { x: rearSurf.cx, y: rearSurf.cy } : null;

    const headProp = world.findClosestPropSurface(this.head.x, this.head.y, headRange);
    const headSurf = headProp || world.findClosestSurface(this.head.x, this.head.y, headRange);
    this.frontCanGrip = !!headSurf;
    this.frontTargetPt = headSurf ? { x: headSurf.cx, y: headSurf.cy } : null;

    const anyAnchored = this.rearAnchor.anchored || this.frontAnchor.anchored;

    // SPACEBAR: Pure longitudinal contraction of segment lengths (never lifts body into air!)
    const spaceHeld = !!inputs.space;
    if (spaceHeld) {
      const maxChargeTime = Math.max(4.0, GAMEPLAY_CONFIG.jumpChargeTime || 4.8);
      const chargeSpeed = (this.bodyClass && this.bodyClass.chargeSpeedMult) || 1.0;
      this.chargeDuration = Math.min(maxChargeTime, this.chargeDuration + safeDt * chargeSpeed);
      const chargeRatio = this.chargeDuration / maxChargeTime;

      // Quick contraction into bended pose without changing orientation
      this.contraction += (1 - this.contraction) * Math.min(1, safeDt * 10.0);
      this.storedContraction = Math.max(this.storedContraction, chargeRatio);
      if (anyAnchored) {
        this.hadAnchorDuringContraction = true;
      }
      this.rigidityTimer = 0.38;
      this.bodyRigidity += (0.85 - this.bodyRigidity) * Math.min(1, safeDt * 6.5);
    } else {
      if (this.wasSpaceHeld) {
        // Space released: always trigger full maximum reach extension!
        const effectivePower = Math.max(this.storedContraction, this.contraction, 0.20);
        this.rigidityTimer = 0.45;
        this.bodyRigidity = 1.0;
        this.extensionTimer = 0.50; // Active maximum extension phase
        this.onReleaseSpace(effectivePower, this.hadAnchorDuringContraction, inputs, particles);
      }
      this.chargeDuration = 0;
      if (this.extensionTimer > 0) {
        this.extensionTimer = Math.max(0, this.extensionTimer - safeDt);
      }
      const unbendSpeed = GAMEPLAY_CONFIG.unbendExtensionSpeed || 10.0;
      this.contraction += (0 - this.contraction) * Math.min(1, safeDt * unbendSpeed);
      if (this.contraction < 0.05 && this.extensionTimer <= 0) {
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

    // Sub-stepped soft-body physics (8 substeps)
    const subSteps = 8;
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
    sound.playLaunch(0.3 + power * 0.50);

    if (this.rearAnchor.stuckCrumb && power > 0.35) {
      const c = this.rearAnchor.stuckCrumb;
      this.rearAnchor.stuckCrumb = null;
      this.rearAnchor.anchored = false;
      sound.playSticky(true);
      particles.spawnStickyGoo(c.x, c.y, 8);
      particles.spawnPopup(this.rear.x, this.rear.y, 'LIBÉRÉ !', '#38d84e');
    }
    if (this.frontAnchor.stuckCrumb && power > 0.35) {
      const c = this.frontAnchor.stuckCrumb;
      this.frontAnchor.stuckCrumb = null;
      this.frontAnchor.anchored = false;
      sound.playSticky(true);
      particles.spawnStickyGoo(c.x, c.y, 8);
      particles.spawnPopup(this.head.x, this.head.y, 'LIBÉRÉ !', '#38d84e');
    }

    const rearLocked = this.rearAnchor.anchored && !this.rearAnchor.slipping;
    const frontLocked = this.frontAnchor.anchored && !this.frontAnchor.slipping;
    const anyOnGround = this.nodes.some(n => n.onGround);

    const steerX = (inputs.right ? 1 : 0) - (inputs.left ? 1 : 0);
    const steerY = (inputs.up ? -1 : 0) + (inputs.down ? 1 : 0);

    const clsJump = (this.bodyClass && this.bodyClass.jumpMult) || 1.0;
    const pushMult = (GAMEPLAY_CONFIG.groundPushForce || GAMEPLAY_CONFIG.jumpBoost || 1.05) * clsJump;

    if (!rearLocked && !frontLocked && !hadAnchor) {
      if (anyOnGround) {
        let { dx } = this.getFrontVector();
        const facingDir = dx >= 0 ? 1 : -1;

        if (steerY < 0) {
          // Clean upward jump in the aimed/facing direction, NO backward recoil/slip!
          const upHopSpeed = (85 + power * 95) * pushMult;
          const forwardDir = steerX !== 0 ? steerX : facingDir;
          const forwardSpeed = (25 + power * 35) * pushMult;

          for (let i = 0; i < this.numNodes; i++) {
            const ratio = i / (this.numNodes - 1);
            this.nodes[i].vx += forwardDir * forwardSpeed * (0.6 + ratio * 0.4);
            this.nodes[i].vy = -upHopSpeed * (0.85 + ratio * 0.25);
            this.nodes[i].onGround = false;
          }

          particles.spawnMud(this.rear.x, this.rear.y, -forwardDir, 0.35, 8, power * 0.7);
          sound.playLaunch(0.45 + power * 0.45);
        } else {
          // Normal horizontal hop along the ground in aimed or facing direction
          const baseSpeed = (55 + power * 75) * pushMult;
          const aimX = steerX !== 0 ? steerX : facingDir;
          for (let i = 0; i < this.numNodes; i++) {
            const ratio = i / (this.numNodes - 1);
            this.nodes[i].vx += aimX * baseSpeed * ratio;
          }
        }
      }
      // In the air without anchors: pure body extension without artificial flight thrust!
      return;
    }

    this.extensionMomentum.timer = 0.45;
    this.extensionMomentum.power = power;
    this.extensionMomentum.consumed = false;

    if (!rearLocked && !frontLocked && hadAnchor) {
      this.triggerNaturalHop(power, particles);
      this.extensionMomentum.consumed = true;
    } else if (rearLocked && !frontLocked) {
      let { dx, dy } = this.getFrontVector();
      const surfNx = this.rearAnchor.nx || 0;
      const surfNy = this.rearAnchor.ny !== undefined ? this.rearAnchor.ny : -1;

      // When steerX/steerY are pressed, strictly obey user arrow keys in screen space:
      // Right arrow -> always moves right (+X), Up arrow -> always moves up (-Y)
      let aimX = 0;
      if (steerX !== 0) {
        aimX = steerX * 0.90 + surfNx * 0.35;
      } else {
        aimX = dx + surfNx * 0.35;
      }

      let aimY = 0;
      if (steerY !== 0) {
        aimY = (steerY < 0 ? -(GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.45) : 0.65) + surfNy * 0.35;
      } else {
        aimY = dy + surfNy * 0.35;
      }

      const len = Math.hypot(aimX, aimY) || 1;
      aimX /= len;
      aimY /= len;

      const speed = (95 + power * 105) * pushMult;
      this.lastLaunchDir = { aimX, aimY, speed };

      for (let i = 1; i < this.numNodes; i++) {
        const ratio = i / (this.numNodes - 1);
        this.nodes[i].vx = aimX * speed * ratio;
        this.nodes[i].vy = aimY * speed * ratio - (steerY < 0 ? 35 * ratio : 14 * ratio);
      }
      particles.spawnMud(this.rear.x, this.rear.y, -surfNx, -surfNy, 5, power * 0.5);
    } else if (frontLocked && !rearLocked) {
      let { dx, dy } = this.getFrontVector();
      const surfNx = this.frontAnchor.nx || 0;
      const surfNy = this.frontAnchor.ny !== undefined ? this.frontAnchor.ny : -1;

      // Front anchored: tail moves in the exact screen direction of pressed arrow!
      // Right arrow -> always moves tail to the right (+X)
      // Left arrow -> always moves tail to the left (-X)
      // Up arrow -> always moves tail up (-Y)
      // Down arrow -> always moves tail down (+Y)
      let aimX = 0;
      if (steerX !== 0) {
        aimX = steerX * 0.90 + surfNx * 0.35;
      } else {
        aimX = -dx + surfNx * 0.35;
      }

      let aimY = 0;
      if (steerY !== 0) {
        aimY = (steerY < 0 ? -(GAMEPLAY_CONFIG.jumpUpAngleBonus || 1.45) : 0.65) + surfNy * 0.35;
      } else {
        aimY = -dy + surfNy * 0.35;
      }

      const len = Math.hypot(aimX, aimY) || 1;
      aimX /= len;
      aimY /= len;

      const speed = (85 + power * 95) * pushMult;
      this.lastLaunchDir = { aimX, aimY, speed };

      for (let i = 0; i < this.numNodes - 1; i++) {
        const ratio = 1 - i / (this.numNodes - 1);
        this.nodes[i].vx = aimX * speed * ratio;
        this.nodes[i].vy = aimY * speed * ratio - (steerY < 0 ? 40 * ratio : 16 * ratio);
      }
      particles.spawnMud(this.head.x, this.head.y, -surfNx, -surfNy, 5, power * 0.5);
    }
  }

  stepPhysics(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const rear = this.rear;
    const head = this.head;

    // 1. Update Suction Anchors
    this.updateAnchor(this.rearAnchor, rear, false, dt, world, particles, isFirstSubstep);
    this.updateAnchor(this.frontAnchor, head, true, dt, world, particles, isFirstSubstep);

    const bothAnchored = this.rearAnchor.anchored && this.frontAnchor.anchored;
    const bothOnSameProp = bothAnchored && this.rearAnchor.propRef && this.frontAnchor.propRef && (this.rearAnchor.propRef === this.frontAnchor.propRef);

    const rearLocked = this.rearAnchor.anchored && (!this.rearAnchor.propRef || this.rearAnchor.propRef.mass >= 15 || bothOnSameProp);
    const frontLocked = this.frontAnchor.anchored && (!this.frontAnchor.propRef || this.frontAnchor.propRef.mass >= 15 || bothOnSameProp);
    const isHopping = this.extensionMomentum.timer > 0.15;
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
        const resp = GAMEPLAY_CONFIG.orientationResponsiveness || 1.6;
        const clsAgility = (this.bodyClass && this.bodyClass.agilityMult) || 1.0;
        const clsMass = (this.bodyClass && this.bodyClass.massMult) || 1.0;
        // Bending: orient continues smoothly at ~0.50x speed as requested; normal is full speed & snappy
        const bendMult = isBending ? (GAMEPLAY_CONFIG.bendOrientationPower !== undefined ? GAMEPLAY_CONFIG.bendOrientationPower : 0.50) : 1.0;
        const agilityRatio = (clsAgility / clsMass) * bendMult;

        const upForce = (GAMEPLAY_CONFIG.orientationUpForce || 1350) * resp * agilityRatio;
        const downForce = 950 * resp * agilityRatio;
        const sideCurlForce = 1250 * resp * agilityRatio;

        const headSpan = Math.max(1, Math.min(N - 1, GAMEPLAY_CONFIG.orientationHeadSpan || 4));
        const holdingPropWithoutAnchor = (this.frontAnchor.anchored && this.frontAnchor.propRef && !this.rearAnchor.anchored) ||
                                         (this.rearAnchor.anchored && this.rearAnchor.propRef && !this.frontAnchor.anchored);
        const effSteerY = holdingPropWithoutAnchor ? Math.max(0, steerY) : steerY;

        if (!bothAnchored) {
          if (!rearLocked && !frontLocked) {
            // Free caterpillar on the ground:
            // Full vertical force allows freely orienting, raising the head and curling the spine.
            // Forward ground crawl is slow and deliberate (0.08x); backward sliding is completely eliminated (0.01x)!
            const { dx } = this.getFrontVector();
            const facingDir = dx >= 0 ? 1 : -1;
            const isReverse = (steerX !== 0) && (Math.sign(steerX) !== facingDir);
            const crawlMult = isReverse ? 0.01 : 0.08;
            const groundCrawlForce = sideCurlForce * crawlMult;

            const startIdx = N - headSpan;
            for (let i = startIdx; i < N; i++) {
              const w = Math.pow((i - startIdx + 1) / headSpan, 1.1) * inertiaBoost * dt;
              if (effSteerY < 0) this.nodes[i].vy -= upForce * w;
              else if (effSteerY > 0) this.nodes[i].vy += downForce * w;

              if (steerX !== 0) {
                this.nodes[i].vx += steerX * groundCrawlForce * w;
              }
            }
          } else if (rearLocked && !frontLocked) {
            // Rear is anchored: all free body segments (1 to N-1) smoothly curve and orient in the direction of the arrow keys
            for (let i = 1; i < N; i++) {
              const w = Math.pow(i / (N - 1), 1.15) * inertiaBoost * dt;
              if (effSteerY < 0) this.nodes[i].vy -= upForce * w;
              else if (effSteerY > 0) this.nodes[i].vy += downForce * w;

              if (steerX !== 0) {
                this.nodes[i].vx += steerX * sideCurlForce * w;
              }
            }
          } else if (frontLocked && !rearLocked) {
            // Front is anchored: tail and body (0 to N-2) move directly in the screen direction of the pressed arrow key!
            // Right arrow -> moves tail to the right (+X), Left arrow -> moves tail to the left (-X)
            // Up arrow -> moves tail up (-Y), Down arrow -> moves tail down (+Y)
            const freeSpan = N - 1;
            for (let i = 0; i < freeSpan; i++) {
              const w = Math.pow((freeSpan - i) / freeSpan, 1.15) * inertiaBoost * dt;
              if (effSteerY < 0) this.nodes[i].vy -= upForce * w;
              else if (effSteerY > 0) this.nodes[i].vy += downForce * w;

              if (steerX !== 0) {
                this.nodes[i].vx += steerX * sideCurlForce * w;
              }
            }
          }
        }
      }
    }

    // 3. Integrate Heavier Gravity, Viscous Damping & Physical Larval Wiggle
    const currentGravity = world.gravity || GAMEPLAY_CONFIG.gravity || 550;

    for (let i = 0; i < N; i++) {
      const n = this.nodes[i];
      if ((i === 0 && rearLocked) || (i === N - 1 && frontLocked)) {
        n.vx = 0;
        n.vy = 0;
        continue;
      }

      const prev = this.nodes[Math.max(0, i - 1)];
      const next = this.nodes[Math.min(N - 1, i + 1)];
      const segDx = next.x - prev.x;
      const segDy = next.y - prev.y;
      const segLen = Math.hypot(segDx, segDy) || 1;
      const locNx = segDy / segLen;
      const locNy = -segDx / segLen;

      // Physical larval wiggle (faster and more responsive in normal state)
      const midWeight = Math.sin((i / (N - 1)) * Math.PI);
      const wiggleWave = Math.sin(this.wiggleTime * 6.0 - i * 1.1) * (GAMEPLAY_CONFIG.wigglePhysicsAmount || 24) * midWeight;
      n.vx += locNx * wiggleWave * dt;
      n.vy += locNy * wiggleWave * dt;

      // Subtle passive rotational drift in the air when doing nothing
      if (isAirborne && !hasSteer) {
        const centeredIdx = i - (N - 1) * 0.5;
        const passiveSpin = Math.sin(this.wiggleTime * 1.6) * 6.5;
        n.vx += locNx * centeredIdx * passiveSpin * dt;
        n.vy += locNy * centeredIdx * passiveSpin * dt;
      }

      const restingOnGentleSlope =
        n.onGround &&
        n.groundMaterial !== 'moss' &&
        n.groundSlopeGrade <= 0.30 &&
        !isHopping &&
        !isExtending &&
        !hasSteer &&
        Math.hypot(n.vx, n.vy) < 22;

      n.onGround = false;

      if (!restingOnGentleSlope) {
        const heightAboveGround = Math.max(0, lowestY - n.y);
        const heavyLiftFactor = isAirborne ? 1.0 : (1.0 + Math.min(1.15, Math.pow(heightAboveGround / 85, 1.45)));
        const snapMult = (n.vy >= 0 && heightAboveGround < 50) ? (1.0 + (GAMEPLAY_CONFIG.groundSnapping || 1.5) * 0.35) : 1.0;
        // When bending while anchored, muscular tension supports the body so aiming with left/right never collapses to the ground:
        const holdGravityMult = (isBending && (rearLocked || frontLocked)) ? 0.20 : 1.0;
        n.vy += currentGravity * heavyLiftFactor * snapMult * holdGravityMult * dt;
      } else {
        n.vx *= 0.45;
        n.vy = Math.max(0, n.vy) + currentGravity * 0.25 * dt;
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

    // Active outward extension thrust during space release:
    // Ensures the caterpillar unfolds to its maximum size every single time space is released!
    if (this.extensionTimer > 0) {
      const extRatio = this.extensionTimer / 0.50;
      if (rearLocked && !frontLocked) {
        // Project head and free segments forward along the spine
        const thrust = 340 * extRatio;
        for (let i = 1; i < N; i++) {
          const prev = this.nodes[i - 1];
          const cur = this.nodes[i];
          const dx = cur.x - prev.x;
          const dy = cur.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          cur.vx += (dx / len) * thrust * dt;
          cur.vy += (dy / len) * thrust * dt;
        }
      } else if (frontLocked && !rearLocked) {
        // Project tail outward from front anchor to full reach
        const thrust = 300 * extRatio;
        for (let i = 0; i < N - 1; i++) {
          const next = this.nodes[i + 1];
          const cur = this.nodes[i];
          const dx = cur.x - next.x;
          const dy = cur.y - next.y;
          const len = Math.hypot(dx, dy) || 1;
          cur.vx += (dx / len) * thrust * dt;
          cur.vy += (dy / len) * thrust * dt;
        }
      } else if (!rearLocked && !frontLocked) {
        const { dx, dy } = this.getFrontVector();
        const thrust = 180 * extRatio;
        for (let i = 0; i < N; i++) {
          const ratio = i / (N - 1);
          this.nodes[i].vx += dx * thrust * ratio * dt;
          this.nodes[i].vy += dy * thrust * ratio * dt;
        }
      }
    }

    // 4. SKELETON CONSTRAINTS:
    // Pure longitudinal contraction / full extension to maximum reach
    const reachBonus = this.extensionTimer > 0 ? (GAMEPLAY_CONFIG.unbendReachBonus || 1.05) : 1.0;
    const targetSegLen =
      (this.extendedSegLen * reachBonus) * (1 - this.contraction) +
      this.contractedSegLen * this.contraction;

    const constraintIterations = this.extensionTimer > 0 ? 6 : 3;
    for (let iter = 0; iter < constraintIterations; iter++) {
      // Neighbor distance constraints
      for (let i = 0; i < N - 1; i++) {
        const a = this.nodes[i];
        const b = this.nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - targetSegLen) / d;

        const aPinned = (i === 0 && (rearLocked || this.rearAnchor.anchored));
        const bPinned = (i + 1 === N - 1 && (frontLocked || this.frontAnchor.anchored));

        const stiff = this.extensionTimer > 0 ? 0.82 : (0.44 + this.bodyRigidity * 0.16);
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
    }

    // 5. Handle World Collisions
    this.handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep);
  }

  handleWorldCollisions(dt, world, particles, inputs, isFirstSubstep) {
    const N = this.numNodes;
    const isHopping = this.extensionMomentum.timer > 0.15;
    const isExtending = this.extensionTimer > 0 || (!inputs.space && this.contraction > 0.04);
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

          if (seg.material !== 'moss' && slopeGrade <= 0.30 && cp.ny < -0.5) {
            n.y -= overlap / Math.abs(cp.ny);

            const vn = n.vx * cp.nx + n.vy * cp.ny;
            const vt = n.vx * cp.tx + n.vy * cp.ty;
            const newVn = vn < 0 ? -vn * mat.restitution * 0.3 : vn;

            // Ground traction: viscous launch in air/hop, but strong controlled traction when crawling on the ground
            const frictionRate = (isHopping || isExtending) ? 6.5 : (hasSteer ? (isReverse ? 45.0 : 34.0) : 48.0);
            let newVt = vt * Math.max(0, 1 - frictionRate * dt);
            if (!hasSteer && !isHopping && !isExtending && Math.abs(newVt) < 24) {
              newVt = 0;
            }

            n.vx = cp.nx * newVn + cp.tx * newVt;
            n.vy = cp.ny * newVn + cp.ty * newVt;
            if (!hasSteer && !isHopping && !isExtending && Math.abs(newVt) === 0 && vn <= 0) {
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
              const damping = hasSteer ? 5.5 : Math.max(2.0, 18.0 - excessSlope * 20.0);
              newVt = vt * Math.max(0, 1 - damping * dt);
            }

            n.vx = cp.nx * newVn + cp.tx * newVt;
            n.vy = cp.ny * newVn + cp.ty * newVt;
          }
        }
      }

      // Solid Collision with Heavy Boulder Pinecones & Acorns
      for (const prop of world.props) {
        if (
          (i === 0 && this.rearAnchor.anchored && this.rearAnchor.propRef === prop) ||
          (i === N - 1 && this.frontAnchor.anchored && this.frontAnchor.propRef === prop)
        ) {
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
          const isHeldProp = (this.rearAnchor.anchored && this.rearAnchor.propRef === prop) ||
                             (this.frontAnchor.anchored && this.frontAnchor.propRef === prop);

          const totalMass = n.mass + prop.mass;
          const wNode = (rearPinned || frontPinned) ? 0 : 1.0;
          const wProp = (isHeldProp || rearPinned || frontPinned) ? 0 : (n.mass / totalMass);

          n.x += nx * overlap * wNode;
          n.y += ny * overlap * wNode;
          if (wProp > 0) {
            prop.x -= nx * overlap * wProp * 0.5;
            prop.y -= ny * overlap * wProp * 0.5;
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

          if (!isHeldProp) {
            const torque = rx * (n.mass * world.gravity * 0.6) - ry * (-nx * n.mass * world.gravity * 0.3);
            const inertia = 0.65 * prop.mass * effPropRadius * effPropRadius;
            prop.angVel += (torque / inertia) * dt * 6;
          }

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
      anchor.propRef = null;
      anchor.segRef = null;
      anchor.localPt = null;
      return;
    }

    if (anchor.anchored) {
      if (anchor.propRef) {
        const prop = anchor.propRef;
        const isLightProp = prop.type === 'acorn' || prop.mass < 15;
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
          const otherIsAnchoredToSolid = otherAnchor.anchored && !!otherAnchor.segRef;

          if (otherIsAnchoredToSolid) {
            // When anchored to a solid surface (ground/wall/ceiling), the caterpillar can lift the acorn!
            const pullFactor = 0.50;
            prop.x += pullX * pullFactor;
            prop.y += pullY * pullFactor;
            prop.vx = prop.vx * 0.70 + node.vx * 0.30;
            prop.vy = prop.vy * 0.70 + node.vy * 0.30;
          } else {
            // NOT anchored to a solid surface:
            // The acorn cannot be lifted into the air! Its weight keeps it grounded.
            // Horizontal nudges only; vertical pull cannot lift the acorn upward (pullY < 0 disallowed)
            const effectivePullX = pullX * 0.35;
            const effectivePullY = Math.max(0, pullY * 0.35);
            prop.x += effectivePullX;
            prop.y += effectivePullY;

            prop.vx = prop.vx * 0.85 + node.vx * 0.15;
            // Never impart upward launch velocity to the acorn without a solid anchor
            prop.vy = Math.max(prop.vy, prop.vy * 0.85 + node.vy * 0.15);

            // The acorn grounds the node: if node tries to float above acorn surface, pull it down to the acorn
            if (node.y < surfY) {
              node.y = surfY;
              node.vy = Math.max(0, node.vy);
            }
          }

          // Clamp maximum speed so physics never glitches
          prop.vx = Math.max(-260, Math.min(260, prop.vx));
          prop.vy = Math.max(-260, Math.min(300, prop.vy));

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

        const wProp = (node.mass / (node.mass + prop.mass)) * 0.15;
        prop.x += pullX * wProp;
        prop.y += pullY * wProp;

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
    const maxSurfaceGap = (GAMEPLAY_CONFIG.gripDistance || 24) + extraGrip;
    const suctionRange = node.r + maxSurfaceGap;

    const checkInvertedGrip = (surfNx, surfNy) => {
      const idx = node.index;
      const other = isFront ? this.nodes[idx - 1] : this.nodes[idx + 1];
      const dx = isFront ? (node.x - other.x) : (other.x - node.x);
      const dy = isFront ? (node.y - other.y) : (other.y - node.y);
      const len = Math.hypot(dx, dy) || 1;
      const curUx = dx / len;
      const curUy = dy / len;
      const curDorsalNx = curUy * this.dorsalSign;
      const curDorsalNy = -curUx * this.dorsalSign;

      // Surface normal points outward from surface into the world
      const dot = curDorsalNx * surfNx + curDorsalNy * surfNy;
      if (dot < (GAMEPLAY_CONFIG.gripAngleTolerance !== undefined ? GAMEPLAY_CONFIG.gripAngleTolerance : -0.15)) {
        // Gripping with top/dorsal side touching the surface triggers flipping!
        this.dorsalSign = -this.dorsalSign;
        sound.playLaunch(0.4);
      }
    };

    const propHit = world.findClosestPropSurface(node.x, node.y, suctionRange);
    if (propHit) {
      anchor.anchored = true;
      anchor.propRef = propHit.prop;
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

      checkInvertedGrip(propHit.nx, propHit.ny);
      sound.playGrip(isFront);
      particles.spawnSuctionRing(anchor.x, anchor.y, '#ffd93b');
      return;
    }

    const hit = world.findClosestSurface(node.x, node.y, suctionRange);
    if (hit) {
      anchor.anchored = true;
      anchor.segRef = hit.seg;
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

      checkInvertedGrip(hit.nx, hit.ny);
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

  // ==================== LARVAL CATERPILLAR RENDERING (ZERO TEXTURE FLIPPING!) ====================
  draw(ctx, time) {
    const pal = COSMETIC_PALETTES[this.cosmetics.palette] || COSMETIC_PALETTES.emerald;
    const N = this.numNodes;
    const rear = this.rear;
    const head = this.head;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const samples = [];
    const numSamples = 11;
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
      const x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * frac +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );
      const y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * frac +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      const tx = p2.x - p1.x;
      const ty = p2.y - p1.y;
      const tLen = Math.hypot(tx, ty) || 1;
      const ux = tx / tLen;
      const uy = ty / tLen;

      // Dynamic dorsal normal based on dorsalSign (flips when gripping upside-down!)
      const nx = uy * this.dorsalSign;
      const ny = -ux * this.dorsalSign;

      const normS = s / (numSamples - 1);
      const wave = Math.sin(this.crawlPhase - s * 0.65) * 1.1;
      const profile = Math.sin(normS * Math.PI);
      const plump = 1 + this.contraction * 0.14;
      const r = (14.5 + profile * 4.8 + wave) * plump;

      // Visual Omega (Ω) arch and goofy cartoon charging wiggle during SPACE contraction
      let sx = x;
      let sy = y;
      if (this.contraction > 0.02) {
        const normS = s / (numSamples - 1);
        const archFactor = Math.sin(normS * Math.PI);
        const omegaMult = (GAMEPLAY_CONFIG.omegaArchVisual !== undefined ? GAMEPLAY_CONFIG.omegaArchVisual : 1.0);
        const maxArch = 20.0 * this.contraction * omegaMult;
        const wiggleTremble = Math.sin(time * 30.0 + s * 1.5) * (3.2 * this.contraction * (omegaMult > 0.2 ? 1 : 0.3));
        sx += nx * (archFactor * maxArch + wiggleTremble);
        sy += ny * (archFactor * maxArch + wiggleTremble);
      }

      samples.push({ x: sx, y: sy, ux, uy, nx, ny, r, normS });
    }

    // 2. Cute Little Larval Legs ("petites pattes") along the underside (-nx, -ny)
    for (let s = 0; s < numSamples - 1; s++) {
      const seg = samples[s];
      if (s === 0) {
        this.drawSuctionFoot(ctx, rear.x, rear.y, seg.ux, seg.uy, seg.nx, seg.ny, this.rearAnchor, false, this.rearCanGrip, pal, time);
      } else if (s === numSamples - 2) {
        this.drawSuctionFoot(ctx, head.x, head.y, seg.ux, seg.uy, seg.nx, seg.ny, this.frontAnchor, true, this.frontCanGrip, pal, time);
      } else {
        const legSwing = Math.sin(this.crawlPhase * 1.4 - s * 0.9) * 3.2;
        const bx = seg.x - seg.nx * (seg.r * 0.78);
        const by = seg.y - seg.ny * (seg.r * 0.78);
        const tipX = bx - seg.nx * 7.5 + seg.ux * legSwing;
        const tipY = by - seg.ny * 7.5 + seg.uy * legSwing;

        ctx.strokeStyle = pal.outline;
        ctx.lineWidth = 7.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = pal.belly;
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
      }
    }

    // 3. PASS 1: Continuous Dark Cartoon Outline of the Larval Body
    ctx.fillStyle = pal.outline;
    const tailSeg = samples[0];
    const tailTipX = tailSeg.x - tailSeg.ux * (tailSeg.r * 0.75) + tailSeg.nx * 2;
    const tailTipY = tailSeg.y - tailSeg.uy * (tailSeg.r * 0.75) + tailSeg.ny * 2;
    ctx.beginPath();
    ctx.arc(tailTipX, tailTipY, 9.5, 0, Math.PI * 2);
    ctx.fill();

    for (let s = 0; s < numSamples - 1; s++) {
      const seg = samples[s];
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.r + 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. PASS 2: Tail Tip
    ctx.fillStyle = pal.spots;
    ctx.beginPath();
    ctx.arc(tailTipX, tailTipY, 6.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. PASS 3: Plump Larval Segments, Creamy Belly & Glossy Sheen
    for (let s = 0; s < numSamples - 1; s++) {
      const seg = samples[s];

      const grad = ctx.createRadialGradient(
        seg.x + seg.nx * (seg.r * 0.35),
        seg.y + seg.ny * (seg.r * 0.35),
        seg.r * 0.12,
        seg.x,
        seg.y,
        seg.r
      );
      grad.addColorStop(0, pal.bodyTop);
      grad.addColorStop(0.62, pal.bodyFill);
      grad.addColorStop(1, pal.bodyShade);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, seg.r * 0.95, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = pal.belly;
      ctx.beginPath();
      ctx.arc(seg.x - seg.nx * (seg.r * 0.70), seg.y - seg.ny * (seg.r * 0.70), seg.r * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (s > 0) {
        ctx.strokeStyle = 'rgba(20, 54, 31, 0.28)';
        ctx.lineWidth = 2.0;
        const baseA = Math.atan2(seg.uy, seg.ux);
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, seg.r * 0.92, baseA + Math.PI * 0.62, baseA + Math.PI * 1.38);
        ctx.stroke();
      }

      if (s >= 1 && s <= numSamples - 3 && s % 2 === 1) {
        ctx.fillStyle = pal.spots;
        ctx.beginPath();
        ctx.ellipse(
          seg.x + seg.nx * (seg.r * 0.48),
          seg.y + seg.ny * (seg.r * 0.48),
          seg.r * 0.24,
          seg.r * 0.14,
          Math.atan2(seg.uy, seg.ux),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Continuous glossy highlight along the back
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    for (let s = 1; s < numSamples - 2; s++) {
      const seg = samples[s];
      const hx = seg.x + seg.nx * (seg.r * 0.66);
      const hy = seg.y + seg.ny * (seg.r * 0.66);
      if (s === 1) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.restore();

    // 6. Draw Cute Larval Head at exact front segment tangent angle
    const headSample = samples[numSamples - 1];
    const headAngle = Math.atan2(headSample.uy, headSample.ux);
    this.drawCuteLarvalHead(ctx, head.x, head.y, headAngle, pal, time);

    // 7. Superimposed Visual Badges (Q & D) underneath the feet and claws
    if (GAMEPLAY_CONFIG.showBadgesOverlay) {
      const rearSeg = samples[0];
      const rearFootX = rear.x - rearSeg.nx * 14;
      const rearFootY = rear.y - rearSeg.ny * 14;

      const frontSeg = samples[numSamples - 2];
      const frontFootX = head.x - frontSeg.nx * 14;
      const frontFootY = head.y - frontSeg.ny * 14;

      // Positioned underneath (below the claws)
      const rearBadgeX = rearFootX;
      const rearBadgeY = rearFootY + 22;
      const frontBadgeX = frontFootX;
      const frontBadgeY = frontFootY + 22;

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
    for (const dir of [-1, 1]) {
      // Main gripping claw (lower, contacts ground horizontally)
      const mainBaseX = dir * (6.5 - gripT * 2.2);
      const mainBaseY = 1.0;
      drawSideClaw(dir, mainBaseX, mainBaseY, 12.0, 4.2, 1.05, -0.55);

      // Secondary upper claw (cute layered proleg hook)
      const secBaseX = dir * (5.2 - gripT * 1.8);
      const secBaseY = -2.2;
      drawSideClaw(dir, secBaseX, secBaseY, 8.8, 3.2, 1.25, -0.38);
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

    const headR = 20.5;

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
