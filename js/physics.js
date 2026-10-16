// js/physics.js — Stable 2D Physics World with Continuous Terrain & Heavy Boulder Pinecones / Acorns

import { GAMEPLAY_CONFIG } from './gameplayConfig.js?v=36';

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
    this.stickyCrumbs = [];
    this.props = [];
    this.checkpoints = [];
    this.decorations = [];
    this.nextSegId = 1;
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
      onGround: false
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
        isDynamic: false
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
        isDynamic: true
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
      facing: 1
    });
  }

  addStickyCrumb(x, y, radius = 26) {
    this.stickyCrumbs.push({
      x,
      y,
      radius,
      wobble: Math.random() * Math.PI * 2
    });
  }

  update(dt) {
    // 1. Dynamic platforms
    for (const plat of this.dynamicPlatforms) {
      plat.time += dt;
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

    // 2. Mushrooms
    for (const m of this.mushrooms) {
      if (m.squash > 0) {
        m.squash = Math.max(0, m.squash - dt * 3.2);
      }
    }

    // 3. Soft Aphids
    for (const a of this.aphids) {
      if (a.x < a.patrolMinX) a.vx = Math.abs(a.vx) + 12 * dt;
      if (a.x > a.patrolMaxX) a.vx = -Math.abs(a.vx) - 12 * dt;
      if (Math.abs(a.vx) < 14) a.vx += (a.facing || 1) * 18 * dt;
      a.facing = a.vx >= 0 ? 1 : -1;

      a.vy += this.gravity * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.vx *= 0.985;

      a.squashX += (1 - a.squashX) * Math.min(1, dt * 8);
      a.squashY += (1 - a.squashY) * Math.min(1, dt * 8);

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

    // 4. Heavy Boulder Pinecones & Acorns
    for (let i = 0; i < this.props.length; i++) {
      const p = this.props[i];
      p.onGround = false;

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
    }

    for (const c of this.stickyCrumbs) {
      c.wobble += dt * 2.5;
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
        bestDist = surfDist;
        const nx = dx / centerDist;
        const ny = dy / centerDist;
        const worldAngle = Math.atan2(dy, dx);
        best = {
          prop: p,
          dist: surfDist,
          nx,
          ny,
          tx: -ny,
          ty: nx,
          cx: p.x + nx * effRadius,
          cy: p.y + ny * effRadius,
          localAngle: worldAngle - p.angle
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
    const dist = Math.hypot(distDx, distDy);

    const segLen = Math.sqrt(lenSq) || 1;
    const surfNx = dy / segLen;
    const surfNy = -dx / segLen;

    let nx = surfNx;
    let ny = surfNy;

    if (t <= 0.001 || t >= 0.999) {
      if (dist > 0.0001) {
        const vnx = distDx / dist;
        const vny = distDy / dist;
        // At vertex corner, point along radial vector as long as it points outward from the surface
        if (vnx * surfNx + vny * surfNy > -0.05) {
          nx = vnx;
          ny = vny;
        }
      }
    } else {
      // Along the segment span, outward normal is always surfNx, surfNy
      nx = surfNx;
      ny = surfNy;
    }

    return { cx, cy, dist, nx, ny, t, segLen, tx: dx / segLen, ty: dy / segLen };
  }

  findClosestSurface(px, py, maxDist) {
    const candidates = this.getAllSegmentsNear(px, py, maxDist);
    let best = null;
    let bestEffectiveDist = maxDist;

    for (const s of candidates) {
      const cp = this.closestPointOnSegment(px, py, s);
      const halfThick = (s.thickness || 20) * 0.5;
      const effectiveDist = cp.dist - halfThick;
      if (effectiveDist < bestEffectiveDist) {
        bestEffectiveDist = effectiveDist;
        best = {
          seg: s,
          cx: cp.cx + cp.nx * halfThick,
          cy: cp.cy + cp.ny * halfThick,
          rawCx: cp.cx,
          rawCy: cp.cy,
          dist: effectiveDist,
          nx: cp.nx,
          ny: cp.ny,
          tx: cp.tx,
          ty: cp.ty,
          t: cp.t,
          segLen: cp.segLen,
          material: s.material
        };
      }
    }
    return best;
  }
}
