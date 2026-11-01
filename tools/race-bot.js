// tools/race-bot.js — Plays each race with a simple bot (crawl, periodic charged jump, and
// suction-foot climbing when stalled) to check every race can be finished.
// Usage: node tools/race-bot.js [levels=0,1,...] [species=classique,...]
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');
const PORT = 21000 + Math.floor(Math.random() * 1000);

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://localhost:${PORT}/`); await p.waitForTimeout(800);
  await p.click('#btn-solo-practice'); await p.waitForTimeout(300);
  const lvls = (process.argv[2] || '0,1,2,3,4,5,6,7,8,9,10,11,12').split(',').map(Number); const clss = (process.argv[3] || 'classique').split(',');
  for (const lvl of lvls) for (const cls of clss) for (const strat of ['crawl+jump']) {
    const r = await p.evaluate(({ lvl, cls, strat }) => {
      const g = window.slipGripGame; g.pauseGameLoop(); g.caterpillar.setBodyType(cls); g.loadLevel(lvl); g.introCinematicTimer = -1; g.raceStarted = true;
      const inp = g.inputs; Object.assign(inp, { space: false, left: false, right: true, up: false, down: false });
      let t = 0, maxX = 0, stuckSince = 0, lastX = 0, respawns = 0, climbUntil = 0, climbStart = 0, lastCheckX = 0, climbs = 0;
      const origRespawn = g.respawnAtCheckpoint.bind(g); g.respawnAtCheckpoint = (...a) => { respawns++; return origRespawn(...a); };
      for (let f = 0; f < 60 * 120 && !g.raceFinished; f++) {
        t = f / 60;
        // Smarter bot: crawl + periodic jump; when stalled, climb with the suction feet
        if (climbUntil > f && f - climbStart < 90) {
          // Unstick, step 1: let go of everything and push/hop forward (mushrooms only
          // launch a caterpillar whose feet are free)
          if (f === climbStart) { g.caterpillar.setRearHold(false, g.particles); g.caterpillar.setFrontHold(false, g.particles); }
          inp.right = true; inp.up = false; inp.space = (f - climbStart) < 50;
        } else if (climbUntil > f) {
          // Unstick, step 2: climb with the suction feet
          const ph = (f - climbStart - 90) % 90; inp.up = true; inp.right = true;
          if (ph === 0) { g.caterpillar.setFrontHold(true, g.particles); g.caterpillar.setRearHold(false, g.particles); }
          if (ph === 45) { g.caterpillar.setRearHold(true, g.particles); g.caterpillar.setFrontHold(false, g.particles); }
          inp.space = ph < 40;
          if (f === climbUntil - 1) { g.caterpillar.setRearHold(false, g.particles); g.caterpillar.setFrontHold(false, g.particles); inp.up = false; inp.space = false; }
        } else if (g.caterpillar.getSpecies().contractStyle === 'omega') {
          // Geometridae gait: grip head, draw the tail in under the loop, grip tail,
          // let go of the head, unroll forward
          const ph = f % 100;
          inp.right = true; inp.up = false;
          if (ph === 0) { g.caterpillar.setFrontHold(true, g.particles); g.caterpillar.setRearHold(false, g.particles); }
          inp.space = ph < 50;
          if (ph === 48) g.caterpillar.setRearHold(true, g.particles);
          if (ph === 52) g.caterpillar.setFrontHold(false, g.particles);
          if (ph === 99) g.caterpillar.setRearHold(false, g.particles);
          if (f % 90 === 0) { if (g.caterpillar.head.x - lastCheckX < 25) { climbStart = f; climbUntil = f + 360; climbs++; } lastCheckX = g.caterpillar.head.x; }
        } else {
          const ph = f % 150;
          inp.space = ph >= 90 && ph < 140; inp.up = ph >= 90 && ph < 145;
          if (ph === 85) g.caterpillar.setRearHold(true, g.particles);
          if (ph === 141) g.caterpillar.setRearHold(false, g.particles);
          if (f % 90 === 0) { if (g.caterpillar.head.x - lastCheckX < 25) { climbStart = f; climbUntil = f + 360; climbs++; } lastCheckX = g.caterpillar.head.x; }
        }
        g.update(1 / 60);
        const x = g.caterpillar.head.x; maxX = Math.max(maxX, x);
        if (f % 300 === 0) { if (Math.abs(x - lastX) < 15) stuckSince = stuckSince || t; else stuckSince = 0; lastX = x; }
      }
      return { lvl, cls, strat, finished: g.raceFinished, time: +g.raceTime.toFixed(1), maxX: Math.round(maxX), stuckAt: stuckSince ? Math.round(lastX) : null, respawns, climbs };
    }, { lvl, cls, strat });
    console.log(JSON.stringify(r));
  }
  await b.close(); server.kill();
})();
