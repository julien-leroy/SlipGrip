// js/particles.js — Expressive Cartoon Particle & Visual FX System

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.rings = [];
    this.popups = [];
  }

  clear() {
    this.particles.length = 0;
    this.rings.length = 0;
    this.popups.length = 0;
  }

  // Mud / Soil splatters
  spawnMud(x, y, nx = 0, ny = -1, count = 8, intensity = 1) {
    const colors = ['#5c3a1e', '#784c27', '#422813', '#8f5d32'];
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 2.2;
      const speed = (90 + Math.random() * 190) * intensity;
      const angle = Math.atan2(ny, nx) + spread;
      this.particles.push({
        type: 'mud',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        r: 3.5 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 680,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35
      });
    }
  }

  // Friction sparks (on cans, forks, hard stems, fast launches)
  spawnSparks(x, y, nx = 0, ny = -1, count = 7) {
    const colors = ['#fff799', '#ffd000', '#ff7b00', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 2.4;
      const speed = 130 + Math.random() * 240;
      const angle = Math.atan2(ny, nx) + spread;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        r: 2.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 420,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.22
      });
    }
  }

  // Dew bubbles (on slippery moss & garden hose)
  spawnDewBubbles(x, y, count = 5) {
    const colors = ['rgba(176, 247, 255, 0.88)', 'rgba(110, 232, 255, 0.85)', 'rgba(220, 255, 245, 0.9)'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'bubble',
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 80,
        vy: -50 - Math.random() * 95,
        r: 3.5 + Math.random() * 5.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: -65, // floats upward!
        wobble: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.45
      });
    }
  }

  // Sticky jam / crumb goo drops
  spawnStickyGoo(x, y, count = 10) {
    const colors = ['#ff3b6b', '#d91b4b', '#ff85a2', '#f0a500'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        type: 'mud',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        r: 4 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 580,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3
      });
    }
  }

  // Confetti at the finish line
  spawnConfetti(x, y, count = 35) {
    const colors = ['#ff3b6b', '#ffd93b', '#38d84e', '#2ee6ff', '#b84eff', '#ff8a1e'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 150 + Math.random() * 340;
      this.particles.push({
        type: 'confetti',
        x: x + (Math.random() - 0.5) * 50,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 12,
        gravity: 260,
        life: 0,
        maxLife: 1.4 + Math.random() * 1.1
      });
    }
  }

  // Suction cup ring pulse
  spawnSuctionRing(x, y, color = '#38d84e') {
    this.rings.push({
      x,
      y,
      r: 6,
      maxR: 28,
      color,
      life: 0,
      maxLife: 0.24
    });
  }

  // Comic popup text ("POP!", "BOING!", "SLIP!", "SCHLURP!")
  spawnPopup(x, y, text, color = '#ffd93b') {
    if (this.popups.length > 8) this.popups.shift();
    this.popups.push({
      x,
      y: y - 16,
      vy: -55,
      text,
      color,
      life: 0,
      maxLife: 0.65
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      if (p.type === 'bubble') {
        p.wobble += dt * 9;
        p.x += (p.vx + Math.sin(p.wobble) * 32) * dt;
      } else {
        p.x += p.vx * dt;
      }
      p.y += p.vy * dt;
      if (p.rot !== undefined) {
        p.rot += p.vrot * dt;
      }
    }

    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      if (r.life >= r.maxLife) {
        this.rings.splice(i, 1);
        continue;
      }
      const t = r.life / r.maxLife;
      r.r = 6 + (r.maxR - 6) * (1 - Math.pow(1 - t, 2));
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += dt;
      if (pop.life >= pop.maxLife) {
        this.popups.splice(i, 1);
        continue;
      }
      pop.y += pop.vy * dt;
      pop.vy *= 0.94;
    }
  }

  draw(ctx) {
    // Draw rings
    for (const r of this.rings) {
      const alpha = 1 - r.life / r.maxLife;
      ctx.save();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3.5 * alpha;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'mud') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#26170a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.032, p.y - p.vy * 0.032);
        ctx.stroke();
      } else if (p.type === 'bubble') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Highlight dot
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#2a1b0e';
        ctx.lineWidth = 1.2;
        ctx.fillRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
        ctx.strokeRect(-p.r, -p.r * 0.55, p.r * 2, p.r * 1.1);
      }

      ctx.restore();
    }

    // Draw comic popups
    for (const pop of this.popups) {
      const t = pop.life / pop.maxLife;
      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      const scale = t < 0.18 ? 0.6 + (t / 0.18) * 0.55 : 1.05;
      ctx.save();
      ctx.translate(pop.x, pop.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = '900 18px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#2a1b0e';
      ctx.strokeText(pop.text, 0, 0);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, 0, 0);
      ctx.restore();
    }
  }
}
