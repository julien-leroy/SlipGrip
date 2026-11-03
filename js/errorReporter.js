// js/errorReporter.js — Sends players' errors to the server console with enough game
// context to understand them quickly. Identical errors are sent once, then summarised.
let getGame = () => null;
const sent = new Map(); // key -> { repeats, lastSent }
const RESEND_SUMMARY_MS = 30000;

let frames = 0;
let fps = 0;
let fpsWindowStart = performance.now();

export function countFrame() {
  frames++;
  const now = performance.now();
  if (now - fpsWindowStart >= 1000) {
    fps = Math.round((frames * 1000) / (now - fpsWindowStart));
    frames = 0;
    fpsWindowStart = now;
  }
}

function shortStack(stack) {
  return String(stack || '').split('\n')
    .filter((l) => /\s+at\s|@/.test(l))
    .slice(0, 5)
    .map((l) => l.trim().replace(/https?:\/\/[^/]+\//g, '').replace(/\?v=\d+/g, ''));
}

function browserLabel() {
  const ua = navigator.userAgent;
  const browser = (ua.match(/(Firefox|Edg|OPR|Chrome|Safari)\/(\d+)/) || [])
    .slice(1, 3).join(' ').replace('Edg', 'Edge').replace('OPR', 'Opera');
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'autre';
  return `${browser || 'inconnu'} / ${os} / ${window.innerWidth}×${window.innerHeight}`;
}

// Snapshot of what the player was doing; every access is guarded so a broken game state
// can never make the reporter itself throw
function gameContext() {
  const ctx = { browser: browserLabel(), fps };
  try {
    const g = getGame();
    if (!g) return ctx;
    const c = g.caterpillar;
    ctx.pseudo = g.network && g.network.pseudo;
    ctx.screen = g.ui && g.ui.activeScreen;
    ctx.level = g.level && g.level.name;
    ctx.roomCode = g.network && g.network.currentRoom && g.network.currentRoom.code;
    ctx.raceTime = typeof g.raceTime === 'number' ? g.raceTime.toFixed(1) : undefined;
    if (c) {
      ctx.species = c.cosmetics && c.cosmetics.bodyType;
      if (c.head) ctx.head = `(${Math.round(c.head.x)},${Math.round(c.head.y)})`;
      ctx.grips = `Q=${c.rearAnchor && c.rearAnchor.anchored ? 'oui' : 'non'} D=${c.frontAnchor && c.frontAnchor.anchored ? 'oui' : 'non'}`;
    }
    if (g.inputs) {
      const held = Object.entries(g.inputs).filter(([, v]) => v).map(([k]) => k);
      if (c && c.rearAnchor && c.rearAnchor.holdingKey) held.push('Q');
      if (c && c.frontAnchor && c.frontAnchor.holdingKey) held.push('D');
      ctx.keys = held.join('+') || 'aucune';
    }
  } catch {
    // Keep whatever was collected
  }
  return ctx;
}

export function reportError(err, kind = 'erreur') {
  try {
    const message = err && err.message ? `${err.name || 'Error'}: ${err.message}` : String(err);
    const stack = shortStack(err && err.stack);
    const key = `${message}|${stack[0] || ''}`;
    const now = Date.now();
    const seen = sent.get(key);
    if (seen) {
      seen.repeats++;
      if (now - seen.lastSent < RESEND_SUMMARY_MS) return;
      seen.lastSent = now;
    } else {
      sent.set(key, { repeats: 0, lastSent: now });
    }
    const report = { kind, message, stack, repeats: seen ? seen.repeats : 0, context: gameContext() };
    if (seen) seen.repeats = 0;

    const g = getGame();
    const viaSocket = g && g.network && g.network.send && g.network.send('client_error', { report });
    if (!viaSocket) {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // Never let error reporting break the game
  }
}

export function installErrorReporter(gameGetter) {
  getGame = gameGetter;
  window.addEventListener('error', (e) => {
    reportError(e.error || { name: 'Error', message: `${e.message} (${e.filename}:${e.lineno})` }, 'erreur');
  });
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promesse'));
}
