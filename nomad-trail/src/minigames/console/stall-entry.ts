// Dev-only: boots ONLY the console shell (no other mini-game imports) so a broken neighbour file cannot block these checks.
//   ?game=tetris&seed=5&diff=0.5            no input, virtual clock, harness presses START; reports when the cartridge ends itself
//   ?game=tetris&softdrop=1                 DOWN held the whole run + random left/right/rotate; records the max rows any single update moved a piece
//   ?game=carryon&drop=1                    fixed level: player starts on a thin '-' ledge over the ground; presses DOWN twice (once on the ledge, once on the ground)
//   &rt=1                                   real-time loop (for screenshots)   &autostart=0  leave the title card up
import Phaser from 'phaser';
import { GAME_W, GAME_H, MINIGAME_KEYS, type MinigameLaunch } from '../../core/types';
import { PAL } from '../../core/palette';
import { CarryOnScene } from '../CarryOnScene';
const q = new URLSearchParams(location.search); const out = document.getElementById('results')!;
const game = new Phaser.Game({ type: Phaser.CANVAS, parent: 'game', width: GAME_W, height: GAME_H, pixelArt: true, backgroundColor: PAL.night0, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } }, scene: [] });
(window as any).__game = game; const errors: string[] = []; window.addEventListener('error', e => errors.push(String(e.message)));
game.scene.add(MINIGAME_KEYS.carryon, CarryOnScene as any, false);
const key = (code: number, down: boolean) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { keyCode: code, which: code } as any));
const DROP_LEVEL = { city: 'Drop test', hazard: 'pigeon', palette: [PAL.night2, PAL.night3, PAL.gray1], stampPieces: 1, parTime: 30, tiles: [
  '#######################', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#',
  '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#.....................#', '#..S..................#', '#.-------.............#', '#.....................#', '#..................*..#', '#######################'] };
game.events.once('ready', () => {
  const t0 = performance.now(); let calls = 0;
  if (q.get('rt') !== '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 10; k++) { t += 16.67; game.loop.step(t); } }, 0); }
  const sc = () => game.scene.getScene(MINIGAME_KEYS.carryon) as any;
  if (q.get('autostart') !== '0') { const press = setInterval(() => { const s = sc(); if (s?.titleCard && !s.started) { (window as any).__cardSeenVirtual = game.getTime() / 1000; s.beginPlay(); clearInterval(press); } }, Number(q.get('pressAfterMs') || 300)); }
  // result card: note when it appears; dismiss only after `resultHoldMs` (default 6 s) via the frame's CONTINUE
  const watch = setInterval(() => { const s = sc(); if (s?.frame?.continueHandler && (window as any).__resultSeen === undefined) { (window as any).__resultSeen = { virtual: game.getTime() / 1000, wall: performance.now() }; setTimeout(() => { (window as any).__pressedAt = game.getTime() / 1000; (s.frame as any).ready ? s.frame.ready() : s.onPadPress('start'); }, Number(q.get('resultHoldMs') || 6000)); clearInterval(watch); } }, 100);
  const extra: any = {};
  if (q.get('softdrop') === '1') {   // hold DOWN forever; random left/right/A/B; instrument the cartridge's update for the max rows moved per update
    let maxStep = 0, updates = 0, softRows = 0; const hook = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started || (c as any).__hooked) return; (c as any).__hooked = true; key(40, true);
      const orig = c.update.bind(c); c.update = (dt: number, pad: any) => { const before = c.cur.y, k = c.cur.k; orig(dt, pad); updates++; if (c.cur.k === k && c.cur.y >= before) { maxStep = Math.max(maxStep, c.cur.y - before); softRows += c.cur.y - before; } };
      setInterval(() => { if (!s.started || c.ended) return; const codes = [37, 39, 90, 88]; const kc = codes[Math.floor(Math.random() * codes.length)]; key(kc, true); setTimeout(() => key(kc, false), 60); }, 150); clearInterval(hook); }, 100);
    Object.defineProperty(extra, 'soft', { get: () => ({ maxRowsPerUpdate: maxStep, updates, softRows, downHeld: !!sc()?.pad?.cur?.down }) });
  }
  if (q.get('drop') === '1') {   // scripted: stand on the ledge, press DOWN, expect to land on the ground; then press DOWN on the ground, expect no change
    const log: any = {}; let phase = 0; const tick = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started || !c.player) return; const p = c.player; const grounded = p.body.blocked.down || p.body.touching.down;
      if (phase === 0 && grounded) { log.ledgeY = p.y; log.onThin = c.onThinPlatform(); key(40, true); setTimeout(() => key(40, false), 80); phase = 1; log.t1 = game.getTime(); }
      else if (phase === 1 && grounded && game.getTime() - log.t1 > 400) { log.afterDropY = p.y; log.droppedRows = Math.round((p.y - log.ledgeY) / 16); log.onThinAfter = c.onThinPlatform(); key(40, true); setTimeout(() => key(40, false), 80); phase = 2; log.t2 = game.getTime(); }
      else if (phase === 2 && game.getTime() - log.t2 > 400) { log.afterGroundDownY = p.y; log.groundUnchanged = Math.abs(p.y - log.afterDropY) < 1; phase = 3; clearInterval(tick); out.textContent = JSON.stringify({ drop: log, errors }); document.title = 'DROP_DONE'; }
    }, 50);
  }
  const payload = q.get('drop') === '1' ? { game: 'carryon', level: DROP_LEVEL, city: 'droptest', cityName: 'Drop Test' } : { game: q.get('game') || 'tetris', city: 'lisbon', cityName: 'Lisbon', hazard: (q.get('hazard') || 'pigeon') as any, seed: Number(q.get('seed') || 5) };
  game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: Number(q.get('diff') || 0.5), payload,
    onDone: (r) => { calls++; const rs = (window as any).__resultSeen; out.textContent = JSON.stringify({ virtualSeconds: game.getTime() / 1000, wall: (performance.now() - t0) / 1000, calls, result: r, cardSeenAt: (window as any).__cardSeenVirtual, resultSeenVirtual: rs?.virtual, heldWallMs: rs ? Math.round(performance.now() - rs.wall) : null, ...(extra.soft ? { soft: extra.soft } : {}), errors }); document.title = 'STALL_DONE'; } } as MinigameLaunch);
});
