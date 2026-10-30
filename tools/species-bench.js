// tools/species-bench.js — Measures each species on flat ground: crawl speed,
// full-charge jump (apex / distance), and inchworm (Ω) gait speed.
// Usage: node tools/species-bench.js
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');
const PORT = 20000 + Math.floor(Math.random() * 1000);

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 700));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(600);

  const rows = await page.evaluate(async () => {
    const { PhysicsWorld } = await import('/js/physics.js');
    const { Caterpillar } = await import('/js/caterpillar.js');
    const { ParticleSystem } = await import('/js/particles.js');
    const { CATERPILLAR_CLASSES } = await import('/js/gameplayConfig.js');
    const { sound } = await import('/js/audio.js');
    sound.muted = true;
    const dt = 1 / 60;
    const mkWorld = () => {
      const w = new PhysicsWorld();
      w.addPolyline([[-500, 600], [6000, 600]], 'dirt', { thickness: 40, isGroundMass: true });
      return w;
    };
    const none = { space: false, left: false, right: false, up: false, down: false };
    const run = (cat, w, p, frames, inputs) => { for (let f = 0; f < frames; f++) { w.update(dt, p); cat.update(dt, w, inputs, p); } };
    const comX = (c) => c.nodes.reduce((a, n) => a + n.x, 0) / c.nodes.length;
    const setup = (cls) => {
      const w = mkWorld(); const p = new ParticleSystem(); const c = new Caterpillar(0, 0);
      c.setBodyType(cls); c.reset(200, 560); w.caterpillars = [c]; run(c, w, p, 60, none);
      return { w, p, c };
    };

    const out = [];
    for (const cls of Object.keys(CATERPILLAR_CLASSES)) {
      // Crawl: hold → for 4 s
      let { w, p, c } = setup(cls);
      let x0 = comX(c); run(c, w, p, 240, { ...none, right: true });
      const crawl = (comX(c) - x0) / 4;

      // Jump: rear gripped, full charge aiming up-right, release Space (Q released at once,
      // the Geometridae would otherwise unroll instead of leaping)
      ({ w, p, c } = setup(cls));
      c.setRearHold(true, p); run(c, w, p, 20, none);
      run(c, w, p, 200, { ...none, space: true, right: true, up: true });
      x0 = comX(c); const y0 = Math.min(...c.nodes.map((n) => n.y));
      c.setRearHold(false, p); c.rearAnchor.anchored = true; // still gripped, key just released
      c.update(dt, w, { ...none, right: true, up: true }, p);
      let apex = 0, landX = null, wasAir = false;
      for (let f = 0; f < 240 && landX === null; f++) {
        w.update(dt, p); c.update(dt, w, none, p);
        apex = Math.max(apex, y0 - Math.min(...c.nodes.map((n) => n.y)));
        const grounded = c.nodes.some((n) => n.onGround);
        if (!grounded) wasAir = true;
        else if (wasAir && f > 5) landX = comX(c);
      }
      if (landX === null) landX = comX(c);

      // Inchworm gait: D grip → hold Space → Q grip → release D → release Space → repeat
      ({ w, p, c } = setup(cls));
      x0 = comX(c);
      for (let k = 0; k < 6; k++) {
        c.setFrontHold(true, p); run(c, w, p, 6, none);
        c.setRearHold(false, p); run(c, w, p, 45, { ...none, space: true });
        c.setRearHold(true, p); run(c, w, p, 6, { ...none, space: true });
        c.setFrontHold(false, p); run(c, w, p, 2, { ...none, space: true, right: true });
        run(c, w, p, 40, { ...none, right: true });
      }
      const inch = (comX(c) - x0) / (6 * 99 / 60);

      // Ω check: front gripped + full contraction → loop height vs feet distance
      ({ w, p, c } = setup(cls));
      c.setFrontHold(true, p); run(c, w, p, 10, none);
      run(c, w, p, 90, { ...none, space: true });
      const feet = Math.hypot(c.head.x - c.rear.x, c.head.y - c.rear.y);
      const loopH = Math.max(...c.nodes.map((n) => 600 - n.y)) - c.nodes[0].r;

      out.push({ cls, nodes: c.nodes.length, mass: CATERPILLAR_CLASSES[cls].massMult, crawl: Math.round(crawl), jumpApex: Math.round(apex), jumpDist: Math.round(landX - x0), inchworm: Math.round(inch), feetGap: Math.round(feet), loopH: Math.round(loopH) });
    }
    return out;
  });
  console.log('species      nodes mass  crawl px/s  jump apex  jump dist  inchworm px/s  contracted: feet gap / loop height');
  for (const r of rows) {
    console.log(`${r.cls.padEnd(12)} ${String(r.nodes).padEnd(5)} ${String(r.mass).padEnd(5)} ${String(r.crawl).padEnd(11)} ${String(r.jumpApex).padEnd(10)} ${String(r.jumpDist).padEnd(10)} ${String(r.inchworm).padEnd(14)} ${r.feetGap} / ${r.loopH}`);
  }
  await browser.close();
  server.kill();
})();
