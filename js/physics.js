import { GAMEPLAY_CONFIG } from './gameplayConfig.js?v=41';
import { sound } from './sound.js?v=41';

export const MATERIALS = {
  dirt:    { friction: 0.90, gripSlide: 0.0,  restitution: 0.05, name: 'Terre meuble' },
  root:    { friction: 0.85, gripSlide: 0.0,  restitution: 0.08, name: 'Racine & Branche' },
  moss:    { friction: 0.08, gripSlide: 0.85, restitution: 0.05, name: 'Mousse glissante' },
  stem:    { friction: 0.96, gripSlide: 0.0,  restitution: 0.06, name: 'Tige de tomate' },
  leaf:    { friction: 0.82, gripSlide: 0.0,  restitution: 0.12, name: 'Feuille de chou' },
  hose:    { friction: 0.45, gripSlide: 0.35, restitution: 0.15, name: 'Tuyau instable' },
  can:     { friction: 0.30, gripSlide: 0.40, restitution: 0.18, name: 'Canette métallique' },
  plastic: { friction: 0.65, gripSlide: 0.10, restitution: 0.22, name: 'Plastique froissé' },
  fork:    { friction: 0.55, gripSlide: 0.15, restitution: 0.12, name: 'Fourchette' }
};

export class PhysicsWorld {
  constructor() {
    this._gravity = GAMEPLAY_CONFIG.gravity;
    this.staticSegments = [];
    this.terrainChains = [];
    this.dynamicPlatforms = [];
    this.mushrooms = [];
    this.aphids = [];
    this.hedgehogs = [];
    this.powerUps = [];
    this.stickyCrumbs = [];
    this.props = [];
    this.checkpoints = [];
    this.decorations = [];
    this.nextSegId = 1;
  }

  get gravity() {
    return GAMEPLAY_CONFIG ? GAMEPLAY_CONFIG.gravity : (this._gravity || 490);
  }

  set gravity(v) {
    this._gravity = v;
    if (GAMEPLAY_CONFIG) GAMEPLAY_CONFIG.gravity = v;
  }

  clear() {
    this.staticSegments = [];
    this.terrainChains = [];
    this.dynamicPlatforms = [];
    this.mushrooms = [];
    this.aphids = [];
    this.hedgehogs = [];
    this.powerUps = [];
    this.stickyCrumbs = [];
    this.props = [];
    this.checkpoints = [];
    this.decorations = [];
    this.nextSegId = 1;
  }

  addPowerUp(x, y, type = 'speed') {
    const powerUp = {
      id: this.nextSegId++,
      x,
      y,
      baseY: y,
      type,
      radius: 22,
      collected: false,
      respawnTimer: 0,
      time: Math.random() * 10
    };
    this.powerUps.push(powerUp);
    return powerUp;
  }

  addCheckpoint(x, y, label = '') {
    this.checkpoints.push({
      id: this.checkpoints.length + 1,
      x,
      y,
      label: label || `CP ${this.checkpoints.length + 1}`,
      activated: false
    });
  }

  addDecoration(type, x, y, scale = 1, angle = 0) {
    this.decorations.push({ type, x, y, scale, angle });
  }

  buildPropLocalPolygon(type, r) {
    const pts = [];
    if (type === 'pinecone') {
      const numPts = 18;
      for (let i = 0; i < numPts; i++) {
        const a = (i / numPts) * Math.PI * 2 - Math.PI * 0.5;
        const sinA = Math.sin(a);
        const widthFactor = 0.88 + 0.14 * sinA;
        const isTip = i % 2 === 0;
        const radial = isTip ? r * 1.02 : r * 0.80;
        pts.push([Math.cos(a) * radial * widthFactor, Math.sin(a) * radial * 1.02]);
      }
      pts.push([pts[0][0], pts[0][1]]);
    }
    return pts;
  }

  addProp(type, x, y, scale = 1) {
    const isPinecone = type === 'pinecone';
    // Acorn = 2x bigger (38px radius), Pinecone = 5x bigger (104px radius, giant heavy boulder!)
    const radius = (isPinecone ? 104 : 38) * scale;

    let adjustedY = y - (radius - 18);
    const surf = this.findClosestSurface(x, y, 180);
    if (surf && surf.ny < -0.2) {
      adjustedY = surf.cy - radius - 2;
    }

    const prop = {
      id: this.nextSegId++,
      type,
      x,
      y: adjustedY,
      spawnX: x,
      spawnY: adjustedY,
      vx: 0,
      vy: 0,
      angle: isPinecone ? 0.08 : (Math.random() - 0.5) * 0.3,
      angVel: 0,
      radius,
      scale,
      // Heavy boulder masses so they never glitch or fly away when gripped
      mass: isPinecone ? 36.0 : 6.5,
      localPoints: this.buildPropLocalPolygon(type, radius),
      onGround: false,
      isHeld: false
    };

    this.props.push(prop);
    return prop;
  }

  addPolyline(points, material = 'dirt', options = {}) {
    const thickness = options.thickness || 20;
    const isGroundMass = options.isGroundMass !== undefined ? options.isGroundMass : (material === 'dirt' || material === 'moss');

    this.terrainChains.push({
      id: this.nextSegId++,
      points,
      material,
      thickness,
      isGroundMass,
      subtype: options.subtype || material
    });

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      this.staticSegments.push({
        id: this.nextSegId++,
        x1: p1[0],
        y1: p1[1],
        x2: p2[0],
        y2: p2[1],
        material,
        thickness,
        isDynamic: false,
        isGroundMass: isGroundMass
      });
    }
  }

  addDynamicPlatform(config) {
    const plat = {
      id: this.nextSegId++,
      type: config.type || 'leaf',
      material: config.material || (config.type === 'hose' ? 'hose' : 'leaf'),
      pivotX: config.pivotX,
      pivotY: config.pivotY,
      basePivotX: config.pivotX,
      basePivotY: config.pivotY,
      moveX: config.moveX || 0,
      moveY: config.moveY || 0,
      moveSpeed: config.moveSpeed || 1.2,
      pivotVx: 0,
      pivotVy: 0,
      baseAngle: config.baseAngle || 0,
      angle: config.baseAngle || 0,
      angVel: 0,
      stiffness: config.stiffness || 16,
      damping: config.damping || 2.8,
      maxAngle: config.maxAngle || 0.48,
      inertia: config.inertia || 18000,
      wobbleFreq: config.wobbleFreq || 0,
      wobbleAmp: config.wobbleAmp || 0,
      time: Math.random() * 10,
      localPoints: config.localPoints || [[-90, 0], [90, 0]],
      thickness: config.thickness || 20,
      worldSegments: []
    };
    this.updatePlatformWorldSegments(plat);
    this.dynamicPlatforms.push(plat);
    return plat;
  }

  updatePlatformWorldSegments(plat) {
    const cos = Math.cos(plat.angle);
    const sin = Math.sin(plat.angle);
    plat.worldSegments = [];
    for (let i = 0; i < plat.localPoints.length - 1; i++) {
      const lp1 = plat.localPoints[i];
      const lp2 = plat.localPoints[i + 1];
      const x1 = plat.pivotX + lp1[0] * cos - lp1[1] * sin;
      const y1 = plat.pivotY + lp1[0] * sin + lp1[1] * cos;
      const x2 = plat.pivotX + lp2[0] * cos - lp2[1] * sin;
      const y2 = plat.pivotY + lp2[0] * sin + lp2[1] * cos;
      plat.worldSegments.push({
        id: plat.id * 100 + i,
        plat,
        segIndex: i,
        x1, y1, x2, y2,
        material: plat.material,
        thickness: plat.thickness,
        isDynamic: true,
        isGroundMass: false
      });
    }
  }

  platformLocalToWorld(plat, lx, ly) {
    const cos = Math.cos(plat.angle);
    const sin = Math.sin(plat.angle);
    return {
      x: plat.pivotX + lx * cos - ly * sin,
      y: plat.pivotY + lx * sin + ly * cos
    };
  }

  platformWorldToLocal(plat, wx, wy) {
    const dx = wx - plat.pivotX;
    const dy = wy - plat.pivotY;
    const cos = Math.cos(-plat.angle);
    const sin = Math.sin(-plat.angle);
    return {
      lx: dx * cos - dy * sin,
      ly: dx * sin + dy * cos
    };
  }

  applyPlatformForce(plat, wx, wy, fx, fy, dt) {
    const rx = wx - plat.pivotX;
    const ry = wy - plat.pivotY;
    const torque = rx * fy - ry * fx;
    plat.angVel += (torque / plat.inertia) * dt;
  }

  addMushroom(x, y, radius = 38, bounceSpeed = 380, angle = 0) {
    this.mushrooms.push({
      x,
      y,
      radius,
      bounceSpeed,
      angle,
      squash: 0
    });
  }

  addAphid(x, y, radius = 22, patrolMinX = x - 80, patrolMaxX = x + 80) {
    this.aphids.push({
      x,
      y,
      vx: 16 * (Math.random() > 0.5 ? 1 : -1),
      vy: 0,
      radius,
      patrolMinX,
      patrolMaxX,
      squashX: 1,
      squashY: 1,
      facing: 1,
      isHeld: false,
      isFlying: false,
      mass: 3.5,
      maxHp: 40,
      hp: 40,
      isDefeated: false,
      damageCooldown: 0,
      hpBarTimer: 0
    });
  }

  addHedgehog(x, y, radius = 28, patrolMinX = x - 110, patrolMaxX = x + 110) {
    const hedgehog = {
      id: this.nextSegId++,
      x,
      y,
      vx: 18 * (Math.random() > 0.5 ? 1 : -1),
      vy: 0,
      radius,
      patrolMinX,
      patrolMaxX,
      facing: 1, // 1 for right, -1 for left
      squashX: 1,
      squashY: 1,
      isHeld: false,
      isFlying: false,
      mass: 5.0,
      maxHp: 75,
      hp: 75,
      isDefeated: false,
      damageCooldown: 0,
      hpBarTimer: 0
    };
    this.hedgehogs.push(hedgehog);
    return hedgehog;
  }

  damageEnemy(enemy, amount, impactX, impactY, particles, reason = '') {
    if (!enemy || enemy.isDefeated || enemy.damageCooldown > 0) return;
    const dmg = Math.round(Math.max(1, amount));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    enemy.damageCooldown = 0.12;
    enemy.hpBarTimer = 3.5;

    if (sound && sound.playLaunch) {
      sound.playLaunch(0.30);
    }
    if (particles) {
      particles.spawnPopup(impactX, impactY - 18, `-${dmg} HP`, '#ff4757');
      particles.spawnMud(impactX, impactY, 0, -1, 5, 0.45);
    }

    if (enemy.hp <= 0) {
      enemy.isDefeated = true;
      enemy.isFlying = false;
      enemy.vx *= 0.2;
      if (particles) {
        particles.spawnPopup(impactX, impactY - 32, 'K.O. ! 💫', '#ffd93b');
      }
    }
  }

  addStickyCrumb(x, y, radius = 26) {
    this.stickyCrumbs.push({
      x,
      y,
      radius,
      wobble: Math.random() * Math.PI * 2
    });
  }

  update(dt, particles = null) {
    // 1. Dynamic platforms (including moving translation)
    for (const plat of this.dynamicPlatforms) {
      plat.time += dt;

      if (plat.moveX || plat.moveY) {
        const prevX = plat.pivotX;
        const prevY = plat.pivotY;
        const phase = Math.sin(plat.time * plat.moveSpeed);
        plat.pivotX = plat.basePivotX + (plat.moveX || 0) * phase;
        plat.pivotY = plat.basePivotY + (plat.moveY || 0) * phase;
        plat.pivotVx = (plat.pivotX - prevX) / Math.max(0.0001, dt);
        plat.pivotVy = (plat.pivotY - prevY) / Math.max(0.0001, dt);
      }

      let targetAngle = plat.baseAngle;
      if (plat.wobbleFreq > 0) {
        targetAngle += Math.sin(plat.time * plat.wobbleFreq * 0.65) * plat.wobbleAmp;
      }
      const angleDiff = targetAngle - plat.angle;
      const springAccel = angleDiff * plat.stiffness - plat.angVel * plat.damping;
      plat.angVel += springAccel * dt;
      plat.angle += plat.angVel * dt;

      const rel = plat.angle - plat.baseAngle;
      if (rel > plat.maxAngle) {
        plat.angle = plat.baseAngle + plat.maxAngle;
        plat.angVel *= -0.25;
      } else if (rel < -plat.maxAngle) {
        plat.angle = plat.baseAngle - plat.maxAngle;
        plat.angVel *= -0.25;
      }

      this.updatePlatformWorldSegments(plat);
    }

    // 1b. Power-Ups
    if (this.powerUps) {
      for (const p of this.powerUps) {
        p.time += dt;
        if (p.collected) {
          p.respawnTimer -= dt;
          if (p.respawnTimer <= 0) {
            p.collected = false;
          }
        }
      }
    }

    // 2. Mushrooms
    for (const m of this.mushrooms) {
      if (m.squash > 0) {
        m.squash = Math.max(0, m.squash - dt * 3.2);
      }
    }

    // 3. Soft Squishy & Throwable Aphids
    for (const a of this.aphids) {
      a.damageCooldown = Math.max(0, (a.damageCooldown || 0) - dt);
      a.hpBarTimer = Math.max(0, (a.hpBarTimer || 0) - dt);

      if (a.isHeld) {
        // While held by caterpillar, position is directly controlled by the foot/mouth
        a.squashX += (0.82 - a.squashX) * Math.min(1, dt * 8);
        a.squashY += (1.22 - a.squashY) * Math.min(1, dt * 8);
        continue;
      }

      a.squashX += (1 - a.squashX) * Math.min(1, dt * 8);
      a.squashY += (1 - a.squashY) * Math.min(1, dt * 8);

      const speed = Math.hypot(a.vx, a.vy);
      if (speed > 45) {
        a.isFlying = true;
      }

      if (a.isFlying) {
        // Projectile trajectory through the air
        a.vy += this.gravity * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.vx *= 0.992;
        a.facing = a.vx >= 0 ? 1 : -1;

        const hit = this.findClosestSurface(a.x, a.y, a.radius + 6);
        if (hit && hit.dist < a.radius) {
          const overlap = a.radius - hit.dist;
          a.x += hit.nx * overlap;
          a.y += hit.ny * overlap;
          const vn = a.vx * hit.nx + a.vy * hit.ny;
          if (vn < 0) {
            a.vx -= hit.nx * vn * 1.45;
            a.vy -= hit.ny * vn * 1.45;
            a.squashX = 1.35;
            a.squashY = 0.65;

            // Damage from high impact / throw proportional to inertia!
            if (vn < -55) {
              const impactSpeed = -vn;
              const dmg = Math.pow(impactSpeed / 34, 1.45) * (a.mass || 3.5);
              this.damageEnemy(a, dmg, a.x, a.y, particles, 'impact');
            }
          }
          if (Math.hypot(a.vx, a.vy) < 45) {
            a.isFlying = false;
            a.patrolMinX = a.x - 90;
            a.patrolMaxX = a.x + 90;
          }
        }
      } else if (a.isDefeated) {
        // Defeated aphid rests peacefully knocked out on the ground
        a.vx *= Math.pow(0.85, dt * 60);
        a.vy += this.gravity * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        const hit = this.findClosestSurface(a.x, a.y, a.radius + 6);
        if (hit && hit.dist < a.radius) {
          const overlap = a.radius - hit.dist;
          a.x += hit.nx * overlap;
          a.y += hit.ny * overlap;
          a.vx *= 0.8;
          a.vy = 0;
        }
      } else {
        // Standard gentle ground patrol
        if (a.x < a.patrolMinX) a.vx = Math.abs(a.vx) + 12 * dt;
        if (a.x > a.patrolMaxX) a.vx = -Math.abs(a.vx) - 12 * dt;
        if (Math.abs(a.vx) < 14) a.vx += (a.facing || 1) * 18 * dt;
        a.facing = a.vx >= 0 ? 1 : -1;

        a.vy += this.gravity * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.vx *= 0.985;

        const hit = this.findClosestSurface(a.x, a.y, a.radius + 6);
        if (hit && hit.dist < a.radius) {
          const overlap = a.radius - hit.dist;
          a.x += hit.nx * overlap;
          a.y += hit.ny * overlap;
          const vn = a.vx * hit.nx + a.vy * hit.ny;
          if (vn < 0) {
            a.vx -= hit.nx * vn * 1.1;
            a.vy -= hit.ny * vn * 1.1;
          }
        }
      }
    }

    // 3b. Hedgehogs (Hérissons) with Spikes on Back and Soft Front Snout
    for (const h of this.hedgehogs) {
      h.damageCooldown = Math.max(0, (h.damageCooldown || 0) - dt);
      h.hpBarTimer = Math.max(0, (h.hpBarTimer || 0) - dt);

      if (h.isHeld) {
        h.squashX += (0.9 - h.squashX) * Math.min(1, dt * 8);
        h.squashY += (1.15 - h.squashY) * Math.min(1, dt * 8);
        continue;
      }

      h.squashX += (1 - h.squashX) * Math.min(1, dt * 8);
      h.squashY += (1 - h.squashY) * Math.min(1, dt * 8);

      const speed = Math.hypot(h.vx, h.vy);
      if (speed > 45) {
        h.isFlying = true;
      }

      if (h.isFlying) {
        h.vy += this.gravity * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.vx *= 0.992;
        if (Math.abs(h.vx) > 10) h.facing = h.vx >= 0 ? 1 : -1;

        const hit = this.findClosestSurface(h.x, h.y, h.radius + 6);
        if (hit && hit.dist < h.radius) {
          const overlap = h.radius - hit.dist;
          h.x += hit.nx * overlap;
          h.y += hit.ny * overlap;
          const vn = h.vx * hit.nx + h.vy * hit.ny;
          if (vn < 0) {
            h.vx -= hit.nx * vn * 1.35;
            h.vy -= hit.ny * vn * 1.35;
            h.squashX = 1.35;
            h.squashY = 0.65;

            // Damage from high impact / throw proportional to inertia!
            if (vn < -55) {
              const impactSpeed = -vn;
              const dmg = Math.pow(impactSpeed / 34, 1.45) * (h.mass || 5.0);
              this.damageEnemy(h, dmg, h.x, h.y, particles, 'impact');
            }
          }
          if (Math.hypot(h.vx, h.vy) < 45) {
            h.isFlying = false;
            h.patrolMinX = h.x - 110;
            h.patrolMaxX = h.x + 110;
          }
        }
      } else if (h.isDefeated) {
        // Defeated hedgehog rests safely on ground
        h.vx *= Math.pow(0.85, dt * 60);
        h.vy += this.gravity * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        const hit = this.findClosestSurface(h.x, h.y, h.radius + 6);
        if (hit && hit.dist < h.radius) {
          const overlap = h.radius - hit.dist;
          h.x += hit.nx * overlap;
          h.y += hit.ny * overlap;
          h.vx *= 0.8;
          h.vy = 0;
        }
      } else {
        if (h.x < h.patrolMinX) h.vx = Math.abs(h.vx) + 14 * dt;
        if (h.x > h.patrolMaxX) h.vx = -Math.abs(h.vx) - 14 * dt;
        if (Math.abs(h.vx) < 16) h.vx += (h.facing || 1) * 20 * dt;
        h.facing = h.vx >= 0 ? 1 : -1;

        h.vy += this.gravity * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.vx *= 0.985;

        const hit = this.findClosestSurface(h.x, h.y, h.radius + 6);
        if (hit && hit.dist < h.radius) {
          const overlap = h.radius - hit.dist;
          h.x += hit.nx * overlap;
          h.y += hit.ny * overlap;
          const vn = h.vx * hit.nx + h.vy * hit.ny;
          if (vn < 0) {
            h.vx -= hit.nx * vn * 1.1;
            h.vy -= hit.ny * vn * 1.1;
          }
        }
      }
    }

    // 4. Heavy Boulder Pinecones & Acorns
    for (let i = 0; i < this.props.length; i++) {
      const p = this.props[i];
      p.onGround = false;
      if (p.isHeld) {
        this.resolvePropSegmentCollisions(p);
        this.resolvePropPropCollisions(p);
        continue;
      }

      p.vy += this.gravity * dt;
      // Heavy damping so pinecones act like massive stable boulders
      const linDamp = p.type === 'pinecone' ? 0.96 : 0.98;
      const angDamp = p.type === 'pinecone' ? 0.90 : 0.94;
      p.vx *= Math.pow(linDamp, dt * 60);
      p.vy *= Math.pow(linDamp, dt * 60);
      p.angVel *= Math.pow(angDamp, dt * 60);

      // Clamp max velocity so props can never glitch or fly off
      p.vx = Math.max(-220, Math.min(220, p.vx));
      p.vy = Math.max(-260, Math.min(320, p.vy));
      p.angVel = Math.max(-2.5, Math.min(2.5, p.angVel));

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.angVel * dt;

      if (p.y > 1250) {
        p.x = p.spawnX;
        p.y = p.spawnY - 40;
        p.vx = 0;
        p.vy = 0;
        p.angVel = 0;
      }

      const candidates = this.getAllSegmentsNear(p.x, p.y, p.radius + 32);
      for (const seg of candidates) {
        const cp = this.closestPointOnSegment(p.x, p.y, seg);
        const minDist = p.radius * 0.94 + (seg.thickness || 20) * 0.5;
        if (cp.dist < minDist) {
          const overlap = minDist - cp.dist;
          const slopeGrade = Math.abs(cp.tx) > 0.05 ? Math.abs(cp.ty / cp.tx) : 999;

          const isRestingGentle =
            slopeGrade <= 0.30 &&
            seg.material !== 'moss' &&
            Math.abs(p.vx) < 22 &&
            Math.abs(p.angVel * p.radius) < 22;

          if (isRestingGentle && cp.ny < -0.5) {
            p.y -= overlap / Math.abs(cp.ny);
            p.vx = 0;
            p.vy = Math.min(0, p.vy);
            p.angVel = 0;
            p.onGround = true;
          } else {
            p.x += cp.nx * overlap;
            p.y += cp.ny * overlap;
            p.onGround = true;

            const vn = p.vx * cp.nx + p.vy * cp.ny;
            const vt = p.vx * cp.tx + p.vy * cp.ty;
            if (vn < 0) {
              const newVn = -vn * 0.08;
              const rollVel = p.angVel * p.radius * (cp.tx >= 0 ? 1 : -1);
              const rollDamp = p.type === 'pinecone' ? 5.0 : 3.0;
              let newVt = (vt * 0.55 + rollVel * 0.45) * Math.max(0, 1 - rollDamp * dt);
              if (slopeGrade <= 0.30 && seg.material !== 'moss' && Math.abs(newVt) < 14) {
                newVt = 0;
              }
              p.vx = cp.nx * newVn + cp.tx * newVt;
              p.vy = cp.ny * newVn + cp.ty * newVt;
              p.angVel = (newVt / p.radius) * (cp.tx >= 0 ? 1 : -1);
            }
          }
        }
      }

      // Prop-to-Prop collisions
      for (let j = i + 1; j < this.props.length; j++) {
        const q = this.props[j];
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = (p.radius + q.radius) * 0.94;
        if (dist < minDist) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          const totalMass = p.mass + q.mass;
          const wp = q.mass / totalMass;
          const wq = p.mass / totalMass;
          p.x -= nx * overlap * wp;
          p.y -= ny * overlap * wp;
          q.x += nx * overlap * wq;
          q.y += ny * overlap * wq;

          const rvx = q.vx - p.vx;
          const rvy = q.vy - p.vy;
          const rvn = rvx * nx + rvy * ny;
          if (rvn < 0) {
            const imp = -rvn * 1.1;
            p.vx -= nx * imp * wp;
            p.vy -= ny * imp * wp;
            q.vx += nx * imp * wq;
            q.vy += ny * imp * wq;
          }
        }
      }

      // Prop-to-Enemy collisions: moving props deal damage proportional to inertia!
      const propSpeed = Math.hypot(p.vx, p.vy);
      if (propSpeed > 30) {
        const allEnemies = [...this.aphids, ...this.hedgehogs];
        for (const e of allEnemies) {
          if (e.isHeld) continue;
          const edx = e.x - p.x;
          const edy = e.y - p.y;
          const edist = Math.hypot(edx, edy) || 0.0001;
          const minHitDist = p.radius + e.radius;
          if (edist < minHitDist) {
            const relVx = p.vx - e.vx;
            const relVy = p.vy - e.vy;
            const relSpeed = Math.hypot(relVx, relVy);
            if (relSpeed > 38) {
              const hitDmg = Math.pow(relSpeed / 36, 1.35) * (p.mass * 0.45);
              const midX = (p.x + e.x) * 0.5;
              const midY = (p.y + e.y) * 0.5;
              this.damageEnemy(e, hitDmg, midX, midY, particles, 'prop_impact');

              // Knockback enemy
              const enx = edx / edist;
              const eny = edy / edist;
              e.vx += enx * relSpeed * 0.70;
              e.vy += eny * relSpeed * 0.70 - 70;
              e.isFlying = true;

              // Prop rebound
              p.vx -= enx * 35;
              p.vy -= eny * 35;
            }
          }
        }
      }
    }

    // Flying enemy-to-enemy bowling collisions:
    for (let i = 0; i < this.aphids.length; i++) {
      const a = this.aphids[i];
      if (!a.isFlying) continue;
      for (const h of this.hedgehogs) {
        if (h.isHeld) continue;
        const dx = h.x - a.x;
        const dy = h.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        if (dist < a.radius + h.radius) {
          const relSpeed = Math.hypot(a.vx - h.vx, a.vy - h.vy);
          if (relSpeed > 45) {
            const dmg = Math.pow(relSpeed / 36, 1.35) * 14;
            this.damageEnemy(h, dmg, (a.x + h.x) * 0.5, (a.y + h.y) * 0.5, particles, 'aphid_bowling');
            this.damageEnemy(a, dmg * 0.65, a.x, a.y, particles, 'impact');
          }
        }
      }
    }

    for (const c of this.stickyCrumbs) {
      c.wobble += dt * 2.5;
    }
  }

  resolvePropSegmentCollisions(p) {
    const candidates = this.getAllSegmentsNear(p.x, p.y, p.radius + 32);
    for (const seg of candidates) {
      const cp = this.closestPointOnSegment(p.x, p.y, seg);
      const minDist = p.radius * 0.94 + (seg.thickness || 20) * 0.5;
      if (cp.dist < minDist) {
        const overlap = minDist - cp.dist;
        p.x += cp.nx * overlap;
        p.y += cp.ny * overlap;
        p.onGround = true;

        const vn = p.vx * cp.nx + p.vy * cp.ny;
        if (vn < 0) {
          p.vx -= cp.nx * vn;
          p.vy -= cp.ny * vn;
        }
      }
    }

    for (const m of this.mushrooms) {
      const dx = p.x - m.x;
      const dy = p.y - m.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const minDist = p.radius + m.radius;
      if (dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        p.x += nx * overlap;
        p.y += ny * overlap;
        const vn = p.vx * nx + p.vy * ny;
        if (vn < 0) {
          p.vx -= nx * vn * 1.5;
          p.vy -= ny * vn * 1.5;
        }
      }
    }
  }

  resolvePropPropCollisions(p) {
    for (const q of this.props) {
      if (q === p) continue;
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const minDist = (p.radius + q.radius) * 0.94;
      if (dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        const wProp = q.isHeld ? 1.0 : (p.isHeld ? 0 : 0.5);
        p.x += nx * overlap * (1 - wProp);
        p.y += ny * overlap * (1 - wProp);
        if (!q.isHeld) {
          q.x -= nx * overlap * wProp;
          q.y -= ny * overlap * wProp;
        }
      }
    }
  }

  resolveEntitySegmentCollisions(e) {
    const candidates = this.getAllSegmentsNear(e.x, e.y, e.radius + 24);
    for (const seg of candidates) {
      const cp = this.closestPointOnSegment(e.x, e.y, seg);
      const minDist = e.radius * 0.94 + (seg.thickness || 20) * 0.5;
      if (cp.dist < minDist) {
        const overlap = minDist - cp.dist;
        e.x += cp.nx * overlap;
        e.y += cp.ny * overlap;
        e.onGround = true;
      }
    }
  }

  // Find closest surface point on a Pinecone or Acorn (smooth wall-like surface contact)
  findClosestPropSurface(px, py, maxSurfaceDist) {
    let best = null;
    let bestDist = maxSurfaceDist;
    for (const p of this.props) {
      const dx = px - p.x;
      const dy = py - p.y;
      const centerDist = Math.hypot(dx, dy) || 0.0001;
      const effRadius = p.radius * 0.95;
      const surfDist = centerDist - effRadius;
      if (surfDist < bestDist) {
        const nx = dx / centerDist;
        const ny = dy / centerDist;
        const cx = p.x + nx * effRadius;
        const cy = p.y + ny * effRadius;

        // Never grab props through a wall or platform!
        if (!this.hasLineOfSight(px, py, cx, cy)) continue;

        bestDist = surfDist;
        const worldAngle = Math.atan2(dy, dx);
        best = {
          prop: p,
          dist: surfDist,
          nx,
          ny,
          tx: -ny,
          ty: nx,
          cx,
          cy,
          localAngle: worldAngle - p.angle
        };
      }
    }
    return best;
  }

  // Find closest enemy Aphid for grabbing/carrying/projecting
  findClosestAphid(px, py, maxSurfaceDist) {
    let best = null;
    let bestDist = maxSurfaceDist;
    for (const a of this.aphids) {
      const dx = px - a.x;
      const dy = py - a.y;
      const centerDist = Math.hypot(dx, dy) || 0.0001;
      const surfDist = centerDist - a.radius;
      if (surfDist < bestDist) {
        const nx = dx / centerDist;
        const ny = dy / centerDist;
        const cx = a.x + nx * a.radius;
        const cy = a.y + ny * a.radius;

        // Never grab aphids through a wall!
        if (!this.hasLineOfSight(px, py, cx, cy)) continue;

        bestDist = surfDist;
        best = {
          aphid: a,
          dist: surfDist,
          nx,
          ny,
          tx: -ny,
          ty: nx,
          cx,
          cy
        };
      }
    }
    return best;
  }

  // Find closest enemy Hedgehog (differentiating safe snout vs prickly back/rear spikes)
  findClosestHedgehog(px, py, maxSurfaceDist) {
    let best = null;
    let bestDist = maxSurfaceDist;
    for (const h of this.hedgehogs) {
      if (h.isHeld) continue;
      const dx = px - h.x;
      const dy = py - h.y;
      const centerDist = Math.hypot(dx, dy) || 0.0001;
      const surfDist = centerDist - h.radius;
      if (surfDist < bestDist) {
        const nx = dx / centerDist;
        const ny = dy / centerDist;
        const cx = h.x + nx * h.radius;
        const cy = h.y + ny * h.radius;

        // Never grab hedgehogs through a wall!
        if (!this.hasLineOfSight(px, py, cx, cy)) continue;

        // Front safe snout is oriented in the direction of h.facing (+1 right, -1 left), or whole body if defeated
        const isFrontHead = (nx * h.facing > 0.35 && ny > -0.65) || !!h.isDefeated;
        const isSpiky = !isFrontHead;

        bestDist = surfDist;
        best = {
          hedgehog: h,
          dist: surfDist,
          nx,
          ny,
          tx: -ny,
          ty: nx,
          cx,
          cy,
          isFrontHead,
          isSpiky
        };
      }
    }
    return best;
  }

  getAllSegmentsNear(x, y, maxDist) {
    const results = [];
    const r = maxDist + 45;

    for (const s of this.staticSegments) {
      const minX = Math.min(s.x1, s.x2) - r;
      const maxX = Math.max(s.x1, s.x2) + r;
      if (x < minX || x > maxX) continue;
      const minY = Math.min(s.y1, s.y2) - r;
      const maxY = Math.max(s.y1, s.y2) + r;
      if (y < minY || y > maxY) continue;
      results.push(s);
    }

    for (const plat of this.dynamicPlatforms) {
      for (const s of plat.worldSegments) {
        const minX = Math.min(s.x1, s.x2) - r;
        const maxX = Math.max(s.x1, s.x2) + r;
        if (x < minX || x > maxX) continue;
        const minY = Math.min(s.y1, s.y2) - r;
        const maxY = Math.max(s.y1, s.y2) + r;
        if (y < minY || y > maxY) continue;
        results.push(s);
      }
    }

    return results;
  }

  closestPointOnSegment(px, py, s) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const lenSq = dx * dx + dy * dy;
    let t = 0;
    if (lenSq > 0.0001) {
      t = ((px - s.x1) * dx + (py - s.y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }
    const cx = s.x1 + t * dx;
    const cy = s.y1 + t * dy;
    const distDx = px - cx;
    const distDy = py - cy;
    const dist = Math.hypot(distDx, distDy) || 0.0001;

    const segLen = Math.sqrt(lenSq) || 1;
    const surfNx = dy / segLen;
    const surfNy = -dx / segLen;

    let nx = surfNx;
    let ny = surfNy;

    if (!s.isGroundMass || s.isDynamic) {
      // Two-sided thin platform / branch / leaf / ceiling / wall:
      // Normal ALWAYS points outward from segment toward the querying object!
      // This strictly prevents passing through platforms from below, from above, or from the sides.
      nx = distDx / dist;
      ny = distDy / dist;
    } else {
      // Ground mass (solid ground underneath):
      if (t <= 0.001 || t >= 0.999) {
        const vnx = distDx / dist;
        const vny = distDy / dist;
        if (vnx * surfNx + vny * surfNy > -0.05) {
          nx = vnx;
          ny = vny;
        }
      } else {
        const dot = (distDx * surfNx + distDy * surfNy);
        if (dot < 0) {
          // Inside ground mass: push upward to surface
          nx = surfNx;
          ny = surfNy;
        } else {
          nx = distDx / dist;
          ny = distDy / dist;
        }
      }
    }

    return { cx, cy, dist, nx, ny, t, segLen, tx: dx / segLen, ty: dy / segLen };
  }

  // Line of sight raycast: verifies if a straight line from (x1, y1) to (x2, y2)
  // is unobstructed by any intermediate wall or platform segment.
  hasLineOfSight(x1, y1, x2, y2, targetSeg = null) {
    const rxMin = Math.min(x1, x2) - 4;
    const rxMax = Math.max(x1, x2) + 4;
    const ryMin = Math.min(y1, y2) - 4;
    const ryMax = Math.max(y1, y2) + 4;

    const midX = (x1 + x2) * 0.5;
    const midY = (y1 + y2) * 0.5;
    const rayLen = Math.hypot(x2 - x1, y2 - y1) || 0.001;
    const candidates = this.getAllSegmentsNear(midX, midY, rayLen * 0.5 + 24);

    for (const s of candidates) {
      if (s === targetSeg) continue;
      const sMinX = Math.min(s.x1, s.x2);
      const sMaxX = Math.max(s.x1, s.x2);
      const sMinY = Math.min(s.y1, s.y2);
      const sMaxY = Math.max(s.y1, s.y2);
      if (rxMax < sMinX || rxMin > sMaxX || ryMax < sMinY || ryMin > sMaxY) continue;

      const denom = (s.y2 - s.y1) * (x2 - x1) - (s.x2 - s.x1) * (y2 - y1);
      if (Math.abs(denom) < 1e-6) continue; // parallel

      const ua = ((s.x2 - s.x1) * (y1 - s.y1) - (s.y2 - s.y1) * (x1 - s.x1)) / denom;
      const ub = ((x2 - x1) * (y1 - s.y1) - (y2 - y1) * (x1 - s.x1)) / denom;

      // True intersection across the span
      if (ua > 0.06 && ua < 0.94 && ub > 0.02 && ub < 0.98) {
        return false; // Interrupted by wall/platform segment s!
      }
    }
    return true;
  }

  findClosestSurface(px, py, maxDist) {
    const candidates = this.getAllSegmentsNear(px, py, maxDist);
    let best = null;
    let bestEffectiveDist = maxDist;

    for (const s of candidates) {
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      const lenSq = dx * dx + dy * dy;
      let t = 0;
      if (lenSq > 0.0001) {
        t = ((px - s.x1) * dx + (py - s.y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const cx = s.x1 + t * dx;
      const cy = s.y1 + t * dy;
      const distDx = px - cx;
      const distDy = py - cy;
      const dist = Math.hypot(distDx, distDy) || 0.0001;
      const segLen = Math.sqrt(lenSq) || 1;

      // Surface normal along polyline direction (outward for ground mass)
      const surfNx = dy / segLen;
      const surfNy = -dx / segLen;

      if (s.isGroundMass) {
        // Ground mass: can ONLY grab the top/outer surface facing the air.
        // If the paw is underneath or behind the ground mass (dot < -2), cannot grab through the earth!
        const dot = distDx * surfNx + distDy * surfNy;
        if (dot < -2.0) {
          continue;
        }
      }

      // Outward normal facing directly toward the querying paw (strictly the NEAR side!):
      const nearNx = distDx / dist;
      const nearNy = distDy / dist;

      const halfThick = (s.thickness || 20) * 0.5;
      const effectiveDist = dist - halfThick;
      if (effectiveDist >= bestEffectiveDist) {
        continue;
      }

      // Point on the NEAR surface facing the paw:
      const surfaceX = cx + nearNx * halfThick;
      const surfaceY = cy + nearNy * halfThick;

      // Line of sight check: ensure no other wall or platform lies between the paw and the surface point
      if (!this.hasLineOfSight(px, py, surfaceX, surfaceY, s)) {
        continue;
      }

      bestEffectiveDist = effectiveDist;
      best = {
        seg: s,
        cx: surfaceX,
        cy: surfaceY,
        rawCx: cx,
        rawCy: cy,
        dist: effectiveDist,
        nx: nearNx,
        ny: nearNy,
        tx: -nearNy,
        ty: nearNx,
        t,
        segLen,
        material: s.material
      };
    }
    return best;
  }
}
