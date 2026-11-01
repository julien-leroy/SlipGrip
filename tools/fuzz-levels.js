// tools/fuzz-levels.js — Random inputs at random spots of every race, for several species;
// counts frames where a body segment crosses a platform (impaled / threaded body).
// Usage: node tools/fuzz-levels.js   (expect 0 everywhere)
const { spawn } = require('child_process');
const path = require('path');
const PORT = 22000 + Math.floor(Math.random() * 1000);
const { chromium } = require('playwright');
(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(`http://localhost:${PORT}/`); await p.waitForTimeout(800);
  await p.click('#btn-solo-practice'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const g = window.slipGripGame; g.pauseGameLoop();
    let seed = 777; const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const out = [];
    for (let lvl = 0; lvl < 13; lvl++) { const where = {};
      let bad = 0, frames = 0;
      for (const cls of ['classique', 'dodue', 'voltigeuse', 'arpenteuse']) {
        g.caterpillar.setBodyType(cls); g.loadLevel(lvl); g.introCinematicTimer = -1; g.raceStarted = true;
        const L = g.level;
        for (let ep = 0; ep < 8; ep++) {
          const x = 300 + rand() * (L.finishX - 500);
          // spawn above the ground at x and let it fall
          let y = 100; for (const ch of g.world.terrainChains) for (let i=0;i<ch.points.length-1;i++){ const [x1,y1]=ch.points[i],[x2,y2]=ch.points[i+1]; if (x>=Math.min(x1,x2)&&x<=Math.max(x1,x2)&&Math.abs(x2-x1)>1){ const yy=y1+(y2-y1)*(x-x1)/(x2-x1); if (ch.isGroundMass && yy>y) y=yy; } }
          g.caterpillar.reset(x, y - 80); g.lastCheckpoint = { x, y: y - 80 };
          const inp = g.inputs; let next = 0, rear = false, front = false;
          for (let f = 0; f < 60 * 12; f++) {
            if (f >= next) { next = f + 6 + Math.floor(rand() * 30); const q = rand();
              if (q < 0.22) { rear = !rear; g.caterpillar.setRearHold(rear, g.particles); }
              else if (q < 0.44) { front = !front; g.caterpillar.setFrontHold(front, g.particles); }
              else if (q < 0.58) inp.space = !inp.space;
              else { inp.left = rand() < 0.3; inp.right = !inp.left && rand() < 0.6; inp.up = rand() < 0.3; inp.down = !inp.up && rand() < 0.3; } }
            g.update(1 / 60);
            const c = g.caterpillar; let crossing = false;
            for (let i = 0; i < c.nodes.length - 1 && !crossing; i++) {
              const a = c.nodes[i], bb = c.nodes[i + 1];
              const segs = g.world.getAllSegmentsNear((a.x + bb.x) / 2, (a.y + bb.y) / 2, Math.hypot(bb.x - a.x, bb.y - a.y) / 2 + 40);
              if (segs.some(sg => c.edgeCrossesSegment(a, bb, sg, segs))) crossing = true;
            }
            if (crossing) { bad++; const k = cls + '@' + Math.round(c.head.x/50)*50 + ',' + Math.round(c.head.y/50)*50; where[k] = (where[k]||0)+1; } frames++;
          }
          g.caterpillar.setRearHold(false, g.particles); g.caterpillar.setFrontHold(false, g.particles);
          Object.assign(inp, { space: false, left: false, right: false, up: false, down: false });
        }
      }
      out.push(`niveau ${lvl}: ${bad}/${frames} ` + JSON.stringify(where));
    }
    return out;
  });
  console.log(r.join('\n')); await b.close(); server.kill();
})();
