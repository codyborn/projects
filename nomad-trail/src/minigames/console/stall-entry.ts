// Dev-only: boots ONLY the console shell (no other mini-game imports) so a broken neighbour file cannot block these checks.
//   ?game=tetris&seed=5&diff=0.5            no input, virtual clock, harness presses START; reports when the cartridge ends itself
//   ?game=tetris&softdrop=1                 DOWN held the whole run + random left/right/rotate; records the max rows any single update moved a piece
//   ?game=carryon&drop=1                    fixed level: player starts on a thin '-' ledge over the ground; presses DOWN twice (once on the ledge, once on the ground)
//   ?game=tetris&rot=1                      gravity frozen, A pressed 20x: piece y and fall accumulator must not change; plus D-pad geometry (low RIGHT thumb = right only)
//   ?game=tetris&mech=1                     scripted FRAGILE shatter, ZIPPER pull and BATTERY blast against a hand-set well
//   ?game=carryon&hazard=wave&water=1       samples the water line: grace before it moves, time to peak, rise rate
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
  const finish = (title: string, data: any) => { out.textContent = JSON.stringify({ ...data, errors }); document.title = title; };
  if (q.get('rot') === '1') { const run = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started) return; clearInterval(run); c.gravity = () => 1e9;
      const y0 = c.cur.y, x0 = c.cur.x, fall0 = c.fall, t0 = c.t; let n = 0; const rep = setInterval(() => { key(90, true); setTimeout(() => key(90, false), 40); if (++n >= 20) { clearInterval(rep); setTimeout(() => {
        // D-pad geometry: a thumb low on the RIGHT arm, and one on the A button, must never register DOWN
        const L = s.pad.layout; s.pad.setTouch({ id: 901, x: L.dpad.x + 40, y: L.dpad.y + 30 }); s.pad.setTouch({ id: 902, x: L.a.x, y: L.a.y }); const right = [...s.pad.touch.get(901)], a = [...s.pad.touch.get(902)]; s.pad.touch.clear();
        finish('ROT_DONE', { rot: { rotationsApplied: c.stats.rotations, yBefore: y0, yAfter: c.cur.y, xBefore: x0, xAfter: c.cur.x, fallGrewOnlyByTime: Math.abs((c.fall - fall0) - (c.t - t0)) < 0.5, fallDelta: +(c.fall - fall0).toFixed(2), timeDelta: +(c.t - t0).toFixed(2), downEverHeld: !!(window as any).__downSeen, lowRightThumb: right, aButton: a } }); }, 300); } }, 120);
      const orig = c.update.bind(c); c.update = (dt: number, pad: any) => { if (pad.held('down')) (window as any).__downSeen = true; orig(dt, pad); }; }, 100); }
  if (q.get('mech') === '1') { const run = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started) return; clearInterval(run); c.gravity = () => 1e9; const R: any = {}; const empty = () => { for (let y = 0; y < 16; y++) for (let x = 0; x < 10; x++) c.grid[y][x] = null; };
      // 1. FRAGILE: a bottle lying on the floor, an O lands on it
      empty(); c.lines = 3; for (let x = 2; x <= 5; x++) c.grid[15][x] = { k: 'I', f: 1 }; c.cur = { k: 'O', r: 0, x: 2, y: 13 }; c.lock();
      R.fragile = { shatters: c.stats.shatters, linesAfter: c.lines, bottleGone: !c.grid.flat().some((v: any) => v && v.f === 1), oDroppedToFloor: c.grid[15][3]?.k === 'O' && c.grid[15][4]?.k === 'O' };
      // 2. ZIPPER: 4 lines banked, a vertical I completes the 5th; the marker row below must be zipped away
      empty(); c.lines = 4; c.nextZip = 5; const lvl = c.level; for (let x = 0; x <= 8; x++) c.grid[15][x] = { k: 'T' }; for (let x = 0; x <= 4; x++) c.grid[14][x] = { k: 'S' }; c.cur = { k: 'I', r: 1, x: 7, y: 12 }; c.lock();
      R.zipper = { zips: c.stats.zips, lines: c.lines, levelStep: c.level - lvl, markerRowGone: c.grid[15][0] === null, animRunning: c.zipT > 0 };
      // 3. BATTERY: two full rows, the battery locks on top; a 3-wide ring around it is blasted, the floor row stays
      empty(); c.zipT = 0; c.lines = 0; for (let y = 14; y <= 15; y++) for (let x = 0; x < 9; x++) c.grid[y][x] = { k: 'Z' }; c.cur = { k: 'O', r: 0, x: 3, y: 12, b: true }; c.lock();   // col 9 left open so no row clears as a line
      R.battery = { batteries: c.stats.batteries, ringCleared: c.grid[14][4] === null && c.grid[14][5] === null && c.grid[13][3] === null && c.grid[13][6] === null && c.grid[12][3] === null, cornersSpared: !!c.grid[14][3] && !!c.grid[14][6], edgesKept: !!c.grid[14][0] && !!c.grid[14][2] && !!c.grid[14][7], floorKept: !!c.grid[15][4] && !!c.grid[15][0], pieceGone: c.grid[13][4] === null && c.grid[12][5] === null };
      R.holesFn = c.holes(); finish('MECH_DONE', { mech: R }); }, 100); }
  if (q.get('water') === '1') { const samples: [number, number][] = []; const run = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started) return; c.hurt = () => {};   // invulnerable so the idle player does not drown before the peak
      samples.push([c.t, c.waterY]); if (c.t > 14 || c.ended) { clearInterval(run);
      const base = samples[0][1]; const firstMove = samples.find(([, w]) => base - w > 1); let peak = samples[0]; for (const sm of samples) if (sm[1] < peak[1]) peak = sm; const rise = base - peak[1]; const riseRate = rise / (peak[0] - (firstMove ? firstMove[0] : 0));
      finish('WATER_DONE', { water: { graceUntilS: firstMove ? +firstMove[0].toFixed(2) : null, peakAtS: +peak[0].toFixed(2), risePx: +rise.toFixed(1), riseTiles: +(rise / 16).toFixed(2), riseRatePxPerS: +riseRate.toFixed(1), samples: samples.length } }); } }, 20); }
  const payload = q.get('drop') === '1' ? { game: 'carryon', level: DROP_LEVEL, city: 'droptest', cityName: 'Drop Test' } : { game: q.get('game') || 'tetris', city: q.get('city') || 'lisbon', cityName: q.get('cityName') || 'Lisbon', hazard: (q.get('hazard') || 'pigeon') as any, seed: Number(q.get('seed') || 5) };
  game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: Number(q.get('diff') || 0.5), payload,
    onDone: (r) => { calls++; const rs = (window as any).__resultSeen; out.textContent = JSON.stringify({ virtualSeconds: game.getTime() / 1000, wall: (performance.now() - t0) / 1000, calls, result: r, cardSeenAt: (window as any).__cardSeenVirtual, resultSeenVirtual: rs?.virtual, heldWallMs: rs ? Math.round(performance.now() - rs.wall) : null, ...(extra.soft ? { soft: extra.soft } : {}), errors }); document.title = 'STALL_DONE'; } } as MinigameLaunch);
});
