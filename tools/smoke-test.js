// tools/smoke-test.js — Headless end-to-end checks (solo + 2-player cup + reconnect).
// Usage: node tools/smoke-test.js   (needs Playwright + Chromium available)
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 18000 + Math.floor(Math.random() * 1000);
const URL = `http://localhost:${PORT}/`;
const failures = [];

function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures.push(label);
}

async function openPage(browser, errors) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 850 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  page.on('dialog', (d) => d.dismiss());
  await page.goto(URL);
  await page.waitForTimeout(900);
  return page;
}

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore'
  });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const errors = [];

  try {
    // ---------- Solo ----------
    const A = await openPage(browser, errors);
    await A.click('#btn-solo-practice');
    await A.waitForTimeout(4200);

    const start = await A.evaluate(() => window.slipGripGame.caterpillar.head.x);
    await A.keyboard.down('ArrowRight');
    await A.waitForTimeout(2000);
    await A.keyboard.up('ArrowRight');
    const moved = (await A.evaluate(() => window.slipGripGame.caterpillar.head.x)) - start;
    check('solo: caterpillar crawls forward', moved > 20, `${Math.round(moved)} px in 2 s`);

    // Whip: front grip + charged space release
    await A.keyboard.down('KeyD');
    await A.waitForTimeout(300);
    await A.keyboard.down('Space');
    await A.waitForTimeout(1000);
    await A.keyboard.up('Space');
    await A.waitForTimeout(700);
    await A.keyboard.up('KeyD');
    const whip = await A.evaluate(() => window.slipGripGame.caterpillar.whipCrackTimer);
    check('solo: whip ends and game keeps running', whip === 0, `timer=${whip}`);

    const frame = await A.evaluate(() => {
      const g = window.slipGripGame;
      g.draw();
      const t0 = performance.now();
      for (let i = 0; i < 60; i++) { g.update(1 / 60); g.draw(); }
      return (performance.now() - t0) / 60;
    });
    check('solo: frame cost under 8 ms', frame < 8, `${frame.toFixed(2)} ms`);

    // ---------- Multiplayer ----------
    await A.evaluate(() => window.slipGripGame.ui.showScreen('home'));
    const B = await openPage(browser, errors);
    await A.evaluate(() => window.slipGripGame.network.createRoom(window.slipGripGame.caterpillar.cosmetics));
    await A.waitForTimeout(300);
    const code = await A.evaluate(() => window.slipGripGame.network.currentRoom.code);
    await B.evaluate((c) => window.slipGripGame.network.joinRoom(c, window.slipGripGame.caterpillar.cosmetics), code);
    await B.waitForTimeout(300);
    await A.evaluate(() => window.slipGripGame.network.updateRoomConfig({ cupId: 'coupe_bourgeons', jumpBoost: 2.0, gripDistance: 40 }));
    await A.waitForTimeout(200);
    await A.evaluate(() => window.slipGripGame.network.startCup());
    await A.waitForTimeout(4500);

    const cfg = await B.evaluate(async () => {
      const c = (await import('/js/gameplayConfig.js')).GAMEPLAY_CONFIG;
      return { jumpBoost: c.jumpBoost, grip: c.gripDistance };
    });
    check('mp: room settings reach the caterpillar', cfg.jumpBoost === 2 && cfg.grip === 40, JSON.stringify(cfg));
    check('mp: remote caterpillar spawned', (await B.evaluate(() => window.slipGripGame.remoteCaterpillars.size)) === 1);

    const idBefore = await B.evaluate(() => window.slipGripGame.network.playerId);
    await B.evaluate(() => window.slipGripGame.network.ws.close());
    await B.waitForTimeout(3200);
    const after = await B.evaluate(() => ({ id: window.slipGripGame.network.playerId, inRoom: !!window.slipGripGame.network.currentRoom }));
    check('mp: reconnect keeps id and room slot', after.id === idBefore && after.inRoom);

    await B.evaluate(() => {
      const g = window.slipGripGame;
      const dx = g.level.finishX + 30 - g.caterpillar.head.x;
      for (const n of g.caterpillar.nodes) n.x += dx;
    });
    await A.waitForTimeout(600);
    const popups = await A.evaluate(() => window.slipGripGame.particles.popups.map((p) => p.text).join(' | '));
    check('mp: finish popup shows rank', /termine 1er/.test(popups), popups);

    check('no page errors / failed requests', errors.length === 0, errors.slice(0, 3).join(' ; '));
  } finally {
    await browser.close();
    server.kill();
  }

  console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed');
  process.exit(failures.length ? 1 : 0);
})();
