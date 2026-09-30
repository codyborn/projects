// Dev-only: boots ONLY the console shell (no other mini-game imports) so a broken neighbour file cannot block these checks.
//   ?game=tetris&seed=5&diff=0.5            no input, virtual clock, harness presses START; reports when the cartridge ends itself
//   ?game=tetris&softdrop=1                 DOWN held the whole run + random left/right/rotate; records the max rows any single update moved a piece
//   ?game=carryon&drop=1                    fixed level: player starts on a thin '-' ledge over the ground; presses DOWN twice (once on the ledge, once on the ground)
//   ?game=tetris&rot=1                      gravity frozen, A pressed 20x: piece y and fall accumulator must not change; plus D-pad geometry (low RIGHT thumb = right only)
//   ?game=tetris&mech=1                     scripted FRAGILE shatter, ZIPPER pull and BATTERY blast against a hand-set well
//   ?game=carryon&hazard=wave&water=1       samples the water line: grace before it moves, time to peak, rise rate
//   ?game=carryon&bot=1&seed=N              a hold-RIGHT bot that jumps at walls, pits, spikes and hazards: must reach the flag (add &god=1 to make it invulnerable, &sprint=1 to hold B)
//   ?game=carryon&noinput=1                 nothing pressed: must end by death or the 90 s cap, onDone once
//   ?game=carryon&critter=1                 scripted: drop onto a critter (stomp kills it and bounces), then walk into one (contact costs a heart)
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
  if (q.get('bot') === '1' || q.get('noinput') === '1') { const bot = q.get('bot') === '1'; const log: any = { jumps: 0 };
    // the bot runs INSIDE the cartridge's update (once per virtual frame) and writes the pad snapshot directly: hold RIGHT, jump at walls, pits, spikes, hazards, or when stuck
    const hook = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started || !c.player || (c as any).__bot) return; (c as any).__bot = true; clearInterval(hook); if (q.get('god') === '1') c.hurt = () => {}; if (!bot) return;
      let jumpFrames = 0, stuck = 0, lastX = -1; const orig = c.update.bind(c);
      c.update = (dt: number, pad: any) => {
        if (!c.ended) { pad.cur.right = true; if (q.get('sprint') === '1') pad.cur.b = true; const p = c.player, b = p.body, grounded = b.blocked.down || b.touching.down, feet = p.y + 8; const tA = (dx: number, dy: number) => c.tileAt(p.x + dx, feet + dy);
          const pit = tA(12, 6) === '.' || tA(24, 6) === '.'; const spike = tA(16, -2) === '^' || tA(28, -2) === '^'; const foe = c.movers.some((m: any) => m.alive && m.spr.x > p.x && m.spr.x - p.x < 44 && Math.abs(m.spr.y - p.y) < 20);
          if (p.x > lastX + 1) { lastX = p.x; stuck = 0; } else stuck += dt;
          // how wide is the gap ahead (tiles until something standable reappears at foot level or up to 3 rows above)? short gap = short hop
          let gap = 0; if (pit) { for (let k = 1; k <= 6; k++) { let found = false; for (let up = 0; up <= 3; up++) { const t = tA(k * 16, 6 - up * 16); if (t === '#' || t === '-' || t === 'C' || t === 'M') found = true; } if (found) break; gap = k; } }
          // moving platforms: ride one to its right end before jumping off; wait at a pit edge until a mover swings close
          const mps = c.movingPlats.getChildren() as any[]; const riding = mps.find(mp => Math.abs(p.x - mp.x) < 18 && Math.abs(feet - (mp.y - 4)) < 9); const aheadMp = mps.find(mp => mp.getData('x0') - p.x > -10 && mp.getData('x0') - p.x < 150);
          const noStaticLanding = pit && gap >= 6;
          if (grounded && riding) { pad.cur.right = false; stuck = 0; const x0 = riding.getData('x0'); if (jumpFrames <= 0 && riding.x >= x0 + 40) { jumpFrames = 22; log.jumps++; pad.prev.a = false; } }
          else if (grounded && noStaticLanding && aheadMp) { const d = aheadMp.x - p.x; stuck = 0; if (jumpFrames <= 0 && d > 16 && d < 64 && aheadMp.body.velocity.x < 0) { jumpFrames = 14; log.jumps++; pad.prev.a = false; } else if (jumpFrames <= 0) pad.cur.right = false; }
          else if (jumpFrames <= 0 && grounded && (b.blocked.right || pit || spike || foe || stuck > 1.0)) { jumpFrames = pit && gap <= 2 && !b.blocked.right ? 9 : pit && gap === 3 ? 15 : 22; log.jumps++; stuck = 0; pad.prev.a = false; }
          if (jumpFrames > 0) { pad.cur.a = true; jumpFrames--; }
          // landing rule: descending with something standable under the feet → stop drifting right and drop onto it
          if (!grounded && b.velocity.y > 0) { const u = tA(0, 6); if (u === '#' || u === '-' || u === 'C' || u === 'M') pad.cur.right = false; } }
        orig(dt, pad); }; }, 50);
    Object.defineProperty(extra, 'bot', { get: () => { const s = sc(); const c = s?.cart; return { ...log, sprint: q.get('sprint') === '1', sprintSec: +(c?.stats?.sprintSec ?? 0).toFixed(1), reachedFlag: c?.stats?.reachedFlag, hearts: c?.hearts, coins: `${c?.collected}/${c?.total}`, progress: +(c?.progress ?? 0).toFixed(2), stomps: c?.stats?.stomps, pits: c?.stats?.pits, playSeconds: +(c?.t ?? 0).toFixed(1), screens: s?.level?.tiles?.[0]?.length / 23, families: s?.level?.families?.join(',') }; } }); }
  if (q.get('critter') === '1') { const run = setInterval(() => { const s = sc(); const c = s?.cart; if (!c || !s.started || !c.player) return; clearInterval(run); const R: any = {};
      const crits = c.movers.filter((m: any) => m.kind === 'critter'); R.critters = crits.length; R.kinds = [...new Set(crits.map((m: any) => m.critter))]; R.textures = ['co_tick0', 'co_tick1', 'co_tick_sq', 'co_bug0', 'co_bug1', 'co_bug_sq'].every(k => s.textures.exists(k));
      if (crits.length < 2) { finish('CRITTER_DONE', { critter: { ...R, note: 'need 2 critters' } }); return; }
      // 1. stomp: park the player 24 px above the first critter, falling; capture the frame the stomp lands
      const a = crits[0]; const p = c.player; const b = p.body; let bounceVy: number | null = null; const orig = c.update.bind(c); c.update = (dt: number, pad: any) => { const before = c.stats.stomps; orig(dt, pad); if (c.stats.stomps > before && bounceVy === null) bounceVy = Math.round(b.velocity.y); };
      const heartsBefore = c.hearts; c.iframes = 0; p.setPosition(a.spr.x, a.spr.y - 24); b.setVelocity(0, 200); c.camX = a.spr.x - 150;
      setTimeout(() => { R.stomp = { stomps: c.stats.stomps, critterDead: !a.alive, squashTexture: a.spr.texture?.key, bounceVy, heartsAfterStomp: c.hearts };
        // 2. contact: walk into the second critter at its own height
        const k = crits[1]; c.iframes = 0; c.hearts = 3; b.setAllowGravity(true); p.setPosition(k.spr.x - 14, k.spr.y - 2); b.setVelocity(0, 0);
        setTimeout(() => { R.contact = { heartsBefore: 3, heartsAfter: c.hearts, critterAlive: k.alive }; finish('CRITTER_DONE', { critter: R }); }, 250); }, 250); }, 100); void 0; }
  const payload = q.get('drop') === '1' ? { game: 'carryon', level: DROP_LEVEL, city: 'droptest', cityName: 'Drop Test' } : { game: q.get('game') || 'tetris', city: q.get('city') || 'lisbon', cityName: q.get('cityName') || 'Lisbon', hazard: (q.get('hazard') || 'pigeon') as any, seed: Number(q.get('seed') || 5) };
  game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: Number(q.get('diff') || 0.5), payload,
    onDone: (r) => { calls++; const rs = (window as any).__resultSeen; out.textContent = JSON.stringify({ virtualSeconds: game.getTime() / 1000, wall: (performance.now() - t0) / 1000, calls, result: r, cardSeenAt: (window as any).__cardSeenVirtual, resultSeenVirtual: rs?.virtual, heldWallMs: rs ? Math.round(performance.now() - rs.wall) : null, ...(extra.soft ? { soft: extra.soft } : {}), ...(extra.bot ? { bot: extra.bot } : {}), errors }); document.title = 'STALL_DONE'; } } as MinigameLaunch);
});
