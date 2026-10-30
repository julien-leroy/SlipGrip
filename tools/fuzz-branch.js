// tools/fuzz-branch.js — Physics fuzzer: drives the caterpillar with random inputs
// around a floating branch and counts frames where the body passes THROUGH it.
// Usage: node tools/fuzz-branch.js [episodes=40] [seconds=10]
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const EPISODES = Number(process.argv[2] || 40);
const SECONDS = Number(process.argv[3] || 10);
const PORT = 19000 + Math.floor(Math.random() * 1000);

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 700));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(600);

  const result = await page.evaluate(async ({ EPISODES, SECONDS, SEED }) => {
    const { PhysicsWorld } = await import('/js/physics.js');
    const { Caterpillar } = await import('/js/caterpillar.js');
    const { ParticleSystem } = await import('/js/particles.js');
    const { sound } = await import('/js/audio.js');
    sound.muted = true;
    const classes = ['classique', 'arpenteuse', 'dodue', 'voltigeuse', 'monarque'];

    // Deterministic PRNG so runs are comparable before/after a fix
    let seed = Number(SEED) || 12345;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

    const BR = { x1: 300, y1: 420, x2: 900, y2: 420, thickness: 52 };
    const half = BR.thickness / 2;

    function edgeCrossesBranch(a, b) {
      // Proper intersection of body edge a-b with the branch centerline, away from the tips
      const d = (BR.y2 - BR.y1) * (b.x - a.x) - (BR.x2 - BR.x1) * (b.y - a.y);
      if (Math.abs(d) < 1e-9) return false;
      const ua = ((BR.x2 - BR.x1) * (a.y - BR.y1) - (BR.y2 - BR.y1) * (a.x - BR.x1)) / d;
      const ub = ((b.x - a.x) * (a.y - BR.y1) - (b.y - a.y) * (a.x - BR.x1)) / d;
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return false;
      const len = Math.hypot(BR.x2 - BR.x1, BR.y2 - BR.y1);
      const along = ub * len;
      const margin = Math.min(half, Math.max(a.r, b.r)); // same tip tolerance as the game
      return along > margin && along < len - margin;
    }

    const stats = { episodes: 0, badFrames: 0, frames: 0, badEpisodes: 0, byClass: {} };
    for (let ep = 0; ep < EPISODES; ep++) {
      const cls = classes[ep % classes.length];
      const world = new PhysicsWorld();
      world.addPolyline([[-200, 640], [1400, 640]], 'dirt', { thickness: 40, isGroundMass: true });
      world.addPolyline([[BR.x1, BR.y1], [BR.x2, BR.y2]], 'root', { thickness: BR.thickness, isGroundMass: false });
      const particles = new ParticleSystem();
      const cat = new Caterpillar(0, 0);
      cat.setBodyType(cls);
      // Start on top of the branch, near a tip, facing outwards (or under it)
      const nearRight = rand() < 0.5;
      const startX = nearRight ? 780 : 330;
      cat.reset(startX, BR.y1 - half - 20);
      world.caterpillars = [cat];

      const inputs = { space: false, left: false, right: false, up: false, down: false };
      let rear = false, front = false, nextChange = 0;
      let bad = 0;
      let hungUnder = false;
      const dt = 1 / 60;
      for (let f = 0; f < SECONDS * 60; f++) {
        if (f >= nextChange) {
          // Random but "player-like" input changes every 0.1–0.6 s
          nextChange = f + 6 + Math.floor(rand() * 30);
          const r = rand();
          if (r < 0.22) { rear = !rear; cat.setRearHold(rear, particles); }
          else if (r < 0.44) { front = !front; cat.setFrontHold(front, particles); }
          else if (r < 0.58) inputs.space = !inputs.space;
          else {
            inputs.left = rand() < 0.3; inputs.right = !inputs.left && rand() < 0.5;
            inputs.up = rand() < 0.3; inputs.down = !inputs.up && rand() < 0.3;
          }
        }
        world.update(dt, particles);
        cat.update(dt, world, inputs, particles);
        let frameBad = false;
        for (let i = 0; i < cat.nodes.length - 1 && !frameBad; i++) {
          if (edgeCrossesBranch(cat.nodes[i], cat.nodes[i + 1])) frameBad = true;
        }
        if (frameBad) {
          if (!stats.firstBad) {
            stats.firstBad = { cls, f, prev: stats._prev, now: cat.nodes.map(n => [Math.round(n.x), Math.round(n.y)]),
              rearA: cat.rearAnchor.anchored ? [Math.round(cat.rearAnchor.x), Math.round(cat.rearAnchor.y)] : null,
              frontA: cat.frontAnchor.anchored ? [Math.round(cat.frontAnchor.x), Math.round(cat.frontAnchor.y)] : null,
              inputs: { ...inputs, rear, front }, whip: cat.whipCrackTimer, ext: cat.extensionTimer,
              radii: cat.nodes.map(n => +n.r.toFixed(1)) };
            const probe = cat.nodes.map(n => ({ ...n }));
            if (cat.keepBodyOutsideSegments) cat.keepBodyOutsideSegments(world, particles);
            let still = false;
            for (let i = 0; i < cat.nodes.length - 1; i++) if (edgeCrossesBranch(cat.nodes[i], cat.nodes[i + 1])) still = true;
            stats.firstBad.afterExtraFix = cat.nodes.map(n => [Math.round(n.x), Math.round(n.y)]);
            stats.firstBad.stillBad = still;
            cat.nodes.forEach((n, k) => Object.assign(n, probe[k]));
          }
          bad++;
        }
        stats._prev = cat.nodes.map(n => [Math.round(n.x), Math.round(n.y)]);
        stats.frames++;
        // Legit 360° climbing: whole body hanging under the branch, gripping it
        if (!hungUnder && cat.nodes.every((n) => n.y > BR.y1 + half && n.y < BR.y1 + half + 60 && n.x > BR.x1 && n.x < BR.x2) &&
            (cat.rearAnchor.anchored || cat.frontAnchor.anchored)) hungUnder = true;
      }
      stats.episodes++;
      if (hungUnder) stats.hungUnder = (stats.hungUnder || 0) + 1;
      stats.badFrames += bad;
      if (bad > 0) stats.badEpisodes++;
      stats.byClass[cls] = (stats.byClass[cls] || 0) + bad;
    }
    return stats;
  }, { EPISODES, SECONDS, SEED: process.env.SEED });

  console.log(`episodes=${result.episodes} frames=${result.frames}`);
  console.log(`episodes with body through branch: ${result.badEpisodes}/${result.episodes}`);
  console.log(`frames with body through branch:   ${result.badFrames} (${(100 * result.badFrames / result.frames).toFixed(2)}%)`);
  console.log(`episodes where the body reached the underside legitimately: ${result.hungUnder || 0}`);
  console.log('bad frames by class:', JSON.stringify(result.byClass));
  if (process.env.DEBUG && result.firstBad) console.log('first bad frame:', JSON.stringify(result.firstBad));
  await browser.close();
  server.kill();
})();
