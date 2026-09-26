// Dev-only entry for harness.html: ?auto=1 drives every mini-game with synthetic input and reports results into #results.
import Phaser from 'phaser';
import { GAME_W, GAME_H, MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { PAL } from '../core/palette';
import { launchHarness, MINIGAME_SCENES } from './devHarness';
import { DEFAULT_LEVEL } from './CarryOnScene';
import dishesJson from '../data/dishes.json';
import { drawDish, DISH_ART_IDS, renderDishCanvas, DISH_TEX_W, DISH_TEX_H } from './dishArt';

const game = new Phaser.Game({ type: Phaser.CANVAS, parent: 'game', width: GAME_W, height: GAME_H, pixelArt: true, backgroundColor: PAL.night0,
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } }, scene: [] });
(window as any).__game = game; const q = new URLSearchParams(location.search); if (q.get('hitboxes') === '1') (window as any).__hitboxes = true;
// result cards hold until CONTINUE: the harness presses it for every scene (holdResult=1 keeps it up for screenshots)
if (q.get('holdResult') !== '1') setInterval(() => { for (const sc of game.scene.getScenes(true)) { const f = (sc as any).frame; if (f?.finished && f.continueHandler) f.proceed?.(); } }, 200);
const out = document.getElementById('results')!; const prog = (m: string) => { (window as any).__progress = m; document.getElementById('progress')!.textContent = m; };
const errors: string[] = []; window.addEventListener('error', e => errors.push(String(e.message) + ' @ ' + String((e as any).error?.stack || '').split('\n').slice(1, 4).join(' | '))); window.addEventListener('unhandledrejection', e => errors.push('rej:' + String((e as any).reason)));

if (q.get('auto') === '1') {
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  const runs: { key: string; payload?: any; energy: number; extraLives?: number }[] = [
    { key: MINIGAME_KEYS.cooking, energy: 100 }, { key: MINIGAME_KEYS.cooking, energy: 20, payload: { id: 'x', name: 'Tacos', city: 'lapaz', ingredients: ['a'], health: 1, mood: 1, steps: [{ kind: 'season', count: 3 }, { kind: 'pour', count: 1 }, { kind: 'stir', count: 1 }] } },
    ...(['chop', 'slice', 'grill', 'dice', 'roll', 'simmer', 'shake', 'fold', 'plate', 'skewer'] as const).map(k => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { id: 'ramen', name: 'Step ' + k, city: 'tokyo', ingredients: ['x'], health: 1, mood: 1, steps: [{ kind: k, count: 3 }] } })),
    ...(['ramen', 'tacos', 'kaiserschmarrn', 'sushi'] as const).map(id => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { dish: (dishesJson as any[]).find(d => d.id === id), cityName: id } })),
    ...(['bands', 'boulder', 'ferrata', 'trailrun', 'hike', 'swim', 'yoga', 'surf', 'ski', 'bogus'] as const).map(a => ({ key: MINIGAME_KEYS.workout, energy: a === 'hike' ? 30 : 100, payload: { activity: a, city: 'Test', day: 7 } })),
    { key: MINIGAME_KEYS.workout, energy: 100, payload: { activity: 'trailrun', city: 'newyork', day: 5 } }, { key: MINIGAME_KEYS.workout, energy: 100, extraLives: 1, payload: { activity: 'bands', city: 'newyork', plan: ['cityrun'] } }, { key: MINIGAME_KEYS.workout, energy: 40, payload: { activity: 'bands', city: 'tokyo', plan: ['cityrun'] } },
    ...[0.95, 0.7, 0.4, 0.1].map(debugAccuracy => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { dish: (dishesJson as any[]).find(d => d.id === 'ramen'), cityName: 'tokyo', debugAccuracy } })),
    ...['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'sprint', 'stretch', 'boulderbeta', 'dyno', 'riverstones', 'swimbreath', 'balance', 'pose', 'runner', 'pace', 'cityrun'].map(id => ({ key: MINIGAME_KEYS.workout, energy: 100, payload: { activity: 'bands', city: 'Solo', plan: [id] } })),
    ...(['bands', 'boulder', 'ferrata', 'trailrun', 'hike', 'swim', 'yoga'] as const).map(a => ({ key: MINIGAME_KEYS.workout, energy: 100, extraLives: 1, payload: { activity: a, city: 'Boots', day: 3 } })),
    { key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'tetris', city: 'lisbon', cityName: 'Lisbon', seed: 11 } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'heli', city: 'bangkok', cityName: 'Bangkok', hazard: 'tuktuk', seed: 12 } }, { key: MINIGAME_KEYS.carryon, energy: 60, payload: { game: 'heli', city: 'dakhla', cityName: 'Dakhla', hazard: 'gust', seed: 13 } },
    ...[1, 2, 3].map(seed => ({ key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'carryon', city: 'innsbruck', cityName: 'Innsbruck', hazard: (['rock', 'otter', 'snow'] as const)[seed - 1], seed, climate: 'alpine' } })),
    { key: MINIGAME_KEYS.carryon, energy: 100 }, { key: MINIGAME_KEYS.carryon, energy: 40, payload: { ...DEFAULT_LEVEL, hazard: 'gust' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'rock' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'wave' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'otter' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'ice' } },
    { key: MINIGAME_KEYS.kite, energy: 100 }, { key: MINIGAME_KEYS.airport, energy: 100 }, { key: MINIGAME_KEYS.airport, energy: 30 }, { key: MINIGAME_KEYS.laundry, energy: 100 },
  ];
  const only = q.get('only'); const limit = Number(q.get('limit') || 0); let runsSel = only ? runs.filter(r => r.key === only) : [...runs];   // a copy: the list is emptied and refilled below if (limit) runsSel = runsSel.slice(0, limit); runs.length = 0; runs.push(...runsSel);
  const results: any[] = []; let i = 0; let driver: number | undefined;
  const mkPointer = (x: number, y: number, down: boolean) => { const p = game.input.activePointer; p.x = x; p.y = y; (p as any).worldX = x; (p as any).worldY = y; (p as any).isDown = down; return p; };
  const next = () => {
    if (driver) clearInterval(driver);
    if (i >= runs.length) { out.textContent = JSON.stringify({ results, errors }); document.title = 'HARNESS_DONE'; return; }
    const r = runs[i++]; const t0 = performance.now(); const v0 = game.getTime(); let doneCalls = 0;
    const launch: MinigameLaunch = { energy: r.energy, difficulty: 0.5, payload: r.payload, extraLives: r.extraLives, onDone: (res) => { doneCalls++; results.push({ key: r.key, payload: r.payload?.game || r.payload?.activity || r.payload?.hazard || r.payload?.name || '', energy: r.energy, lives: r.extraLives ?? 0, ...res, ms: Math.round(performance.now() - t0), vms: Math.round(game.getTime() - v0), doneCalls }); setTimeout(next, 300); } };
    prog(`run ${i}/${runs.length} ${r.key} ${r.payload?.activity || r.payload?.hazard || ''}`);
    game.scene.start(r.key, launch);
    const scene = game.scene.getScene(r.key);
    driver = window.setInterval(() => {
      if (!scene.scene.isActive()) return;
      const x = 20 + Math.random() * 320, y = 40 + Math.random() * 580;
      const p = mkPointer(x, y, true); scene.input.emit('pointerdown', p);
      // drag a little (stir / kite / carry-on swipe)
      for (let k = 0; k < 4; k++) { const pm = mkPointer(x + Math.cos(k) * 30, y - k * 15 + Math.sin(k) * 30, true); scene.input.emit('pointermove', pm); }
      setTimeout(() => { const pu = mkPointer(x, y - 60, false); scene.input.emit('pointerup', pu); }, 60);
      const keys = [32, 37, 38, 39, 40, 49, 50, 51, 13, 90, 88]; const kc = keys[Math.floor(Math.random() * keys.length)];   // + ENTER (START), Z (A), X (B) for the console
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: kc, which: kc, code: 'KeyX' } as any)); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { keyCode: kc, which: kc } as any)), 80);
      // interactive objects (boulder holds, airport bins/gates) get poked via emit
      scene.children.list.forEach(o => { if ((o as any).input && Math.random() < 0.08) o.emit('pointerdown', p); });
      if ((scene as any).frame && !(scene as any).frame.active && Math.random() < 0.3) (scene as any).frame.ready?.();
    }, 120);
    // safety: if a scene never finishes in 150s, record and move on
    setTimeout(() => { if (results.length < i) { results.push({ key: r.key, payload: r.payload?.activity || r.payload?.hazard || '', energy: r.energy, TIMEOUT: true }); scene.scene.stop(); next(); } }, 150000);
  };
  game.events.once('ready', () => {
    // render every dish art (all layer counts) once; any exception lands in `errors`
    try { let count = 0; for (const id of DISH_ART_IDS) { renderDishCanvas(id); renderDishCanvas(id, 0); count++; } for (const d of dishesJson as any[]) renderDishCanvas(d.id, undefined, d.art); (window as any).__dishArtRendered = count; } catch (e) { errors.push('dishart:' + String(e)); }
    if (q.get('fast') === '1') { // virtual clock: drive Phaser's TimeStep manually, ~30x real time
      game.loop.stop(); let t = performance.now(); const fps = Number(q.get('fps') || 8);
      setInterval(() => { for (let k = 0; k < fps; k++) { t += 16.67; game.loop.step(t); } }, 0);
    }
    setTimeout(next, 200);
  });
} else if (q.get('rt') === '1') {
  // real-time (wall clock) check: one Workout session with NO input must end on its own; report seconds + onDone count
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, extraLives: Number(q.get('lives') || 0), payload: { activity: q.get('activity') || 'bands', city: 'Realtime', day: Number(q.get('day') || 3), plan: q.get('plan') ? [q.get('plan')!] : undefined }, onDone: () => { calls++; out.textContent = JSON.stringify({ seconds: (performance.now() - t0) / 1000, calls, errors }); document.title = 'RT_DONE'; } };
    game.scene.start(MINIGAME_KEYS.workout, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.workout); setInterval(() => { if (scene.scene.isActive() && !scene.frame?.active) scene.frame?.ready?.(); }, 400); });   // no gameplay input: only READY / CONTINUE
} else if (q.get('cook')) {
  // real-time cooking reveal check: start ramen with a forced per-step accuracy; the driver (puppeteer) calls scene.endStep() to run the steps
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { game.scene.start(MINIGAME_KEYS.cooking, { energy: 100, difficulty: 0.5, payload: { dish: (dishesJson as any[]).find(d => d.id === (q.get('dish') || 'ramen')), cityName: 'Tokyo', debugAccuracy: Number(q.get('cook')) }, onDone: () => { document.title = 'COOK_DONE'; } } as MinigameLaunch); document.title = 'COOK_UP'; });
} else if (q.get('gate')) {
  // gate dash checks: 'rt' = real-time, no input, must fail at the boarding deadline; 'perfect' = scripted perfect path via scene.hint() under the virtual clock
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('gate')!; const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, payload: { gate: q.get('g') || 'B56' }, onDone: (res) => { calls++; out.textContent = JSON.stringify({ mode, res, secs: (performance.now() - t0) / 1000, calls, errors }); document.title = 'GATE_DONE'; } };
    game.scene.start(MINIGAME_KEYS.airport, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.airport);
    // the scripted player reads scene.hint() once per virtual frame and presses arrow keys (real key events through Phaser's keyboard plugin)
    const key = (kc: number) => { window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: kc, which: kc } as any)); window.dispatchEvent(new KeyboardEvent('keyup', { keyCode: kc, which: kc } as any)); };
    const steer = () => { if (!scene.scene.isActive() || !scene.frame?.active) { if (q.get('holdResult') !== '1') scene.frame?.proceed?.(); return; } if (scene.waiting) { scene.startRun(); return; } const hnt = scene.hint(); if (hnt.lane < scene.lane) key(37); else if (hnt.lane > scene.lane) key(39); else if (hnt.jump) key(38); };
    if (mode === 'perfect' && q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; steer(); game.loop.step(t); } }, 0); }
    else if (mode === 'perfect') setInterval(steer, 16);
    else if (mode === 'rt' && !q.get('hold')) setTimeout(() => { if (scene.waiting) scene.startRun(); }, 1500);   // no gameplay input: only READY is tapped (hold=1 keeps the card up for screenshots)
  });
} else if (q.get('chop') || q.get('slice') || q.get('chopslice')) {
  // chop / slice checks (real time). chop=1: N evenly spaced taps -> 100. slice=aligned|off: three strokes per slice on / 26 px beside the line.
  // chopslice=1: a full real dish that has both (completo); non-knife steps are skipped with endStep(1) so the check is about the knife steps + onDone once.
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('chop') ? 'chop' : q.get('slice') ? `slice:${q.get('slice')}` : 'chopslice'; let calls = 0; const t0 = performance.now();
    const steps = mode === 'chop' ? [{ kind: 'chop', count: Number(q.get('n') || 6) }] : mode.startsWith('slice') ? [{ kind: 'slice', count: 2 }] : null;
    const payload = steps ? { id: 'completo', name: 'Knife test', city: 'santiago', ingredients: q.get('ing') ? [q.get('ing')] : ['tomato', 'onion'], health: 1, mood: 1, steps } : { dish: (dishesJson as any[]).find(d => d.id === 'completo'), cityName: 'Santiago' };
    game.scene.start(MINIGAME_KEYS.cooking, { energy: 100, difficulty: 0.5, payload, onDone: (res: any) => { calls++; out.textContent = JSON.stringify({ mode, res, accs: (scene as any).accuracies, secs: (performance.now() - t0) / 1000, calls, errors }); document.title = 'KNIFE_DONE'; } } as MinigameLaunch);
    const scene: any = game.scene.getScene(MINIGAME_KEYS.cooking); let busy = false; let shot = false;
    const drive = async () => { if (busy || !scene.scene.isActive()) return; if (!scene.frame?.active) { scene.frame?.ready?.(); return; } const c = scene.cook; const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
      if (!c) { if (mode === 'chopslice' && scene.stepIdx < scene.dish.steps.length && !scene.cleanup.length) return; if (mode === 'chopslice' && scene.stepIdx < scene.dish.steps.length && scene.cleanup.length && !['chop', 'slice'].includes(scene.dish.steps[scene.stepIdx].kind)) { busy = true; await sleep(300); scene.endStep(1); busy = false; } return; }
      busy = true;
      if (c.kind === 'chop') { await sleep(420); if (scene.cook === c) c.tap(); if (shot && document.title === 'SHOT_CHOP') document.title = 'KNIFE_UP'; if (!shot && c.hint().cuts === 3) { shot = true; document.title = 'SHOT_CHOP'; } }   /* the shot title rides along without pausing the rhythm */
      else { const off = mode === 'slice:off' ? 26 : 0; const h = c.hint(); const x = h.lineX + off; c.down(x, h.y0 + 4); await sleep(40); if (!shot && mode !== 'chop') { shot = true; c.move(x, (h.y0 + h.y1) / 2); document.title = 'SHOT_SLICE'; await sleep(400); document.title = 'KNIFE_UP'; }
        for (let k = 0; k < 3; k++) { for (let i = 1; i <= 6; i++) { if (scene.cook !== c) break; c.move(x, h.y0 + (h.y1 - h.y0) * (k % 2 === 0 ? i / 6 : 1 - i / 6)); await sleep(16); } } if (scene.cook === c) c.up(); await sleep(200); }
      busy = false; };
    setInterval(drive, 50); document.title = 'KNIFE_UP';
  });
} else if (q.get('micro') || q.get('session')) {
  // micro=burpee|runner&mode=good|random: one forced game, scripted through the micro's hint()/press()/release() hooks (good) or random pointer input.
  // session=bands|hike: a whole seeded session with random input; every card is passed with frame.ready(). Reports games played, titles seen, onDone count.
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const micro = q.get('micro'); const mode = q.get('mode') || (q.get('session') ? 'random' : 'good'); const activity = q.get('session') || (micro === 'runner' ? 'trailrun' : 'bands'); const t0 = performance.now(); let calls = 0; const titles = new Set<string>(); const games: string[] = [];
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, extraLives: Number(q.get('lives') || 0), payload: { activity, city: q.get('city') || 'bozeman', day: Number(q.get('day') || 3), plan: micro ? [micro] : undefined }, onDone: (res) => { calls++; out.textContent = JSON.stringify({ micro, mode, activity, res, games, titles: [...titles], scores: (scene as any).scores, secs: (performance.now() - t0) / 1000, calls, errors }); document.title = 'MICRO_DONE'; } };
    game.scene.start(MINIGAME_KEYS.workout, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.workout);
    const mk = (x: number, y: number, down: boolean) => { const p = game.input.activePointer; p.x = x; p.y = y; (p as any).worldX = x; (p as any).worldY = y; (p as any).isDown = down; return p; };
    let holdUntil = -1, holding = false, lastId = '';
    const drive = () => {
      if (!scene.scene.isActive()) return; if (!scene.frame?.active) { if (Math.random() < 0.5 && !(q.get('holdResult') === '1' && scene.frame?.continueHandler)) scene.frame?.ready?.(); return; }
      const cur = scene.current; if (!cur) return; if (cur.id !== lastId) { lastId = cur.id; games.push(cur.id); } titles.add(scene.frame.title);
      if (mode === 'random') { const x = 20 + Math.random() * 320, y = 100 + Math.random() * 400; if (Math.random() < 0.5) { scene.input.emit('pointerdown', mk(x, y, true)); setTimeout(() => scene.input.emit('pointerup', mk(x, y - (Math.random() < 0.3 ? 60 : 0), false)), 40 + Math.random() * 400); } return; }
      if (cur.id === 'burpee') { const h = cur.hint(); if (holding) { if (cur.t >= holdUntil) { holding = false; cur.release(180, 300); } return; } if (h.done) return; const mv = h.move; const x = 180, y = 300;
        if (mv === 'tap') { cur.press(x, y); cur.release(x, y); } else if (mv === 'up') { cur.press(x, y); cur.release(x, y - 60); } else if (mv === 'down') { cur.press(x, y); cur.release(x, y + 60); } else { cur.press(x, y); holding = true; holdUntil = cur.t + 0.75; }
      }
      if (cur.id === 'runner') { const h = cur.hint(); const o = h.next; if (!o) { if (h.ducking) cur.release(); return; }
        const dist = o.x - 92;   // px until the obstacle reaches the runner's front
        if (h.ducking) { if (o.high) return; if (dist < 70 && dist > 20) cur.release(); return; }   // stay ducked under branches; letting go jumps, so time it for the next rock
        if (o.high) { if (dist < 140 && h.onGround) cur.press(); }                                    // hold early: the duck starts 150 ms after the press
        else if (dist < 70 && dist > 20 && h.onGround) { cur.press(); cur.release(); }               // quick tap = jump the rock
      }
    };
    if (q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; drive(); game.loop.step(t); } }, 0); } else setInterval(drive, 16);
  });
} else if (q.get('shake')) {
  // shake step checks (real time): 'motion' = READY then synthetic devicemotion events (alternating ±16 m/s²) → shake mode, N shakes → 100;
  // 'swipe' = no motion events → after 1.5 s the step switches to swipe mode and the driver swipes; both report the mode the step ended in.
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('shake')!; let calls = 0; const t0 = performance.now(); const modes: string[] = [];
    game.scene.start(MINIGAME_KEYS.cooking, { energy: 100, difficulty: 0.5, payload: { id: 'sushi', name: 'Shake test', city: 'tokyo', ingredients: ['rice'], health: 1, mood: 1, steps: [{ kind: 'shake', count: Number(q.get('n') || 6) }] }, onDone: (res: any) => { calls++; out.textContent = JSON.stringify({ mode, res, modes: [...new Set(modes)], motion: (scene as any).motion?.state, shakes: (scene as any).motion?.count, secs: (performance.now() - t0) / 1000, calls, errors }); document.title = 'SHAKE_DONE'; } } as MinigameLaunch);
    const scene: any = game.scene.getScene(MINIGAME_KEYS.cooking); let dir = 1; let readyAt = 0;
    const drive = () => { if (!scene.scene.isActive()) return; if (!scene.frame?.active) { scene.frame?.ready?.(); readyAt = performance.now(); return; } const c = scene.cook; if (!c || c.kind !== 'shake') return; const h = c.hint(); modes.push(h.mode);
      if (mode === 'motion') { dir = -dir; window.dispatchEvent(new (window as any).DeviceMotionEvent('devicemotion', { acceleration: { x: 16 * dir, y: 1, z: 0 }, interval: 16 })); if (!(window as any).__shot && h.mode === 'shake' && h.count >= 2) { (window as any).__shot = true; document.title = 'SHOT_SHAKE'; } }
      else if (h.mode === 'swipe') { if (!(window as any).__shot) { (window as any).__shot = true; document.title = 'SHOT_SWIPE'; } c.swing(dir); dir = -dir; } };
    setInterval(drive, 150); void readyAt;
  });
} else if (q.get('knead') === '1') {
  // knead check: a single knead step, real time; the driver taps and screenshots mid-step; title flips when the step completes
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  let kneadCalls = 0;
  game.events.once('ready', () => { game.scene.start(MINIGAME_KEYS.cooking, { energy: 100, difficulty: 0.5, payload: { id: 'ramen', name: 'Knead test', city: 'tokyo', ingredients: ['dough'], health: 1, mood: 1, steps: [{ kind: 'knead', count: 6 }] }, onDone: (res: any) => { kneadCalls++; out.textContent = JSON.stringify({ res, calls: kneadCalls, errors }); document.title = 'KNEAD_DONE'; } }); });
} else if (q.get('stall') === '1') {
  // Pack-Tris with NO input: must end only on top-out (never a clock). Reports wall seconds, doneCalls.
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { const t0 = performance.now(); let calls = 0; game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 10; k++) { t += 16.67; game.loop.step(t); } }, 0);
    game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, payload: { game: 'tetris', city: 'lisbon', cityName: 'Lisbon', seed: Number(q.get('seed') || 5) }, difficulty: Number(q.get('diff') || 0.5), onDone: (r) => { calls++; out.textContent = JSON.stringify({ virtualSeconds: (game.getTime()) / 1000, wall: (performance.now() - t0) / 1000, calls, result: r, errors }); document.title = 'STALL_DONE'; } } as MinigameLaunch); });
} else if (q.get('kite')) {
  // kite checks: 'rt' = READY only, no riding input, must finish on its own; 'perfect' = scripted hold-in-zone / release-on-crest under the virtual clock
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('kite')!; const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, payload: { city: 'laventana', cityName: 'La Ventana' }, onDone: (res) => { calls++; out.textContent = JSON.stringify({ mode, res, secs: (performance.now() - t0) / 1000, clean: (scene as any).clean, wipeouts: (scene as any).wipeouts, air: (scene as any).airTotal, calls, errors }); document.title = 'KITE_DONE'; } };
    game.scene.start(MINIGAME_KEYS.kite, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.kite);
    const ride = () => { if (!scene.scene.isActive() || !scene.frame?.active) { if (q.get('holdResult') !== '1') scene.frame?.proceed?.(); return; } if (scene.waiting) { scene.startRun(); return; } const hnt = scene.hint(); if (hnt.recovering) return; if (hnt.airborne) { /* press to drop only when the fast drop touches down on the swell (not a trough) */ if (!scene.held && hnt.dropLand > 0.3) scene.press(hnt.x); else if (scene.held && hnt.dropLand < -0.2) scene.held = false; return; } if (!scene.held) scene.press(hnt.x); else { scene.fingerX = hnt.x; if (hnt.speed > 0.85 && hnt.crest) scene.letGo(); } };
    if (mode === 'perfect' && q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; ride(); game.loop.step(t); } }, 0); }
    else if (mode === 'perfect') setInterval(ride, 16);
    else if (mode === 'rt' && !q.get('hold')) setTimeout(() => { if (scene.waiting) scene.startRun(); }, 1500);
  });
} else if (q.get('ferrata')) {
  // ferrata checks: 'perfect' = scripted climb toward the next ledge under the virtual clock; 'random' = random steering, give-up hatch shortened via giveUpAt
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('ferrata')!; const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, payload: { activity: 'ferrata', city: 'innsbruck', day: 3, giveUpAt: Number(q.get('giveUpAt') || 120) }, onDone: (res) => { calls++; const f = (scene as any).ferr?.hint?.(); out.textContent = JSON.stringify({ mode, res, secs: (performance.now() - t0) / 1000, falls: f?.falls, climbSecs: f?.t, calls, errors }); document.title = 'FERRATA_DONE'; } };
    game.scene.start(MINIGAME_KEYS.workout, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.workout);
    const drive = () => { if (!scene.scene.isActive()) return; if (!scene.frame?.active) { scene.frame?.ready?.(); return; } const f = scene.ferr; if (!f) return; if (mode === 'perfect') { const hn = f.hint(); const dx = hn.targetX - hn.mx; f.steer(Math.abs(dx) < 6 ? 0 : dx > 0 ? 1 : -1); } else { if (Math.random() < 0.1) f.steer([-1, 0, 1][Math.floor(Math.random() * 3)]); if (f.giveUp && Math.random() < 0.2) f.giveUp(); } };
    if (q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; drive(); game.loop.step(t); } }, 0); } else setInterval(drive, 16);
  });
} else if (q.get('cityrun')) {
  // city run checks: 'safe' = scripted crossing that only steps into a clear lane; 'random' = random taps/swipes; both press READY
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('cityrun')!; const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, payload: { activity: 'bands', city: 'newyork', day: 5, plan: ['cityrun'] }, onDone: (res) => { calls++; const cur = (scene as any).current; out.textContent = JSON.stringify({ mode, res, secs: (performance.now() - t0) / 1000, hits: cur?.hits, crossings: cur?.crossings, calls, errors }); document.title = 'CITYRUN_DONE'; } };
    game.scene.start(MINIGAME_KEYS.workout, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.workout);
    const mk = (x: number, y: number, downF: boolean) => { const p = game.input.activePointer; p.x = x; p.y = y; (p as any).isDown = downF; return p; };
    let hitsSeen = 0;
    const drive = () => { if (!scene.scene.isActive()) return; if (!scene.frame?.active) { scene.frame?.ready?.(); return; } const cur = scene.current; if (!cur) { scene.input.emit('pointerdown', mk(180, 500, true)); scene.input.emit('pointerup', mk(180, 500, false)); return; }
      if (cur.hits > hitsSeen) hitsSeen = cur.hits;
      if (mode === 'safe') cur.autoSafe?.(); else if (Math.random() < 0.15) { const x = 40 + Math.random() * 280, y = 200 + Math.random() * 300; scene.input.emit('pointerdown', mk(x, y, true)); scene.input.emit('pointerup', mk(x + (Math.random() - 0.5) * 60, y - Math.random() * 60, false)); } };
    if (q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; drive(); game.loop.step(t); } }, 0); } else setInterval(drive, 16);
  });
} else if (q.get('yoga')) {
  // yoga checks: 'perfect' = scroll the wheel to the target pose each frame (virtual clock); 'shots' = hold each pose for screenshots (real time, no finish)
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => {
    const mode = q.get('yoga')!; const t0 = performance.now(); let calls = 0;
    const launch: MinigameLaunch = { energy: 100, difficulty: 0.5, payload: { activity: 'yoga', city: 'laventana', day: 4, plan: ['pose'] }, onDone: (res) => { calls++; out.textContent = JSON.stringify({ mode, res, secs: (performance.now() - t0) / 1000, calls, errors }); document.title = 'YOGA_DONE'; } };
    game.scene.start(MINIGAME_KEYS.workout, launch); const scene: any = game.scene.getScene(MINIGAME_KEYS.workout);
    const mk = (x: number, y: number, downF: boolean) => { const p = game.input.activePointer; p.x = x; p.y = y; (p as any).isDown = downF; return p; };
    const drive = () => { if (!scene.scene.isActive()) return; if (!scene.frame?.active) { scene.frame?.ready?.(); return; } const cur = scene.current; if (!cur) { scene.input.emit('pointerdown', mk(180, 500, true)); scene.input.emit('pointerup', mk(180, 500, false)); return; } if (mode === 'perfect') cur.setPose?.(cur.target); };
    if (mode === 'perfect' && q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; drive(); game.loop.step(t); } }, 0); } else setInterval(drive, 16);
  });
} else if (q.get('console')) {
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: 0.5, payload: { game: q.get('console'), city: q.get('city') || 'tokyo', cityName: q.get('cityName') || 'Tokyo', hazard: q.get('hazard') || 'otter', seed: Number(q.get('seed') || 7) }, onDone: () => { document.title = 'CONSOLE_DONE'; } } as MinigameLaunch); document.title = 'CONSOLE_UP'; if (q.get('autostart') !== '0') { const press = setInterval(() => { const sc: any = game.scene.getScene(MINIGAME_KEYS.carryon); if (sc?.titleCard && !sc.started) { sc.beginPlay(); clearInterval(press); } }, 300); } });
} else if (q.get('sheet') === '1') {
  // contact sheet: draw finished dishes into #results as a single canvas
  const ids = (q.get('ids') || 'ramen,tacos,kaiserschmarrn,sushi,paella,bibimbap').split(',');
  const cols = 3, scale = 3; const sheet = document.createElement('canvas'); sheet.width = cols * (DISH_TEX_W * scale + 12); sheet.height = Math.ceil(ids.length / cols) * (DISH_TEX_H * scale + 28); const ctx = sheet.getContext('2d')!; ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#141a2e'; ctx.fillRect(0, 0, sheet.width, sheet.height);
  ids.forEach((id, i) => { const c = renderDishCanvas(id); const x = (i % cols) * (DISH_TEX_W * scale + 12) + 6, y = Math.floor(i / cols) * (DISH_TEX_H * scale + 28) + 4; ctx.drawImage(c, x, y, DISH_TEX_W * scale, DISH_TEX_H * scale); ctx.fillStyle = '#f7cf6b'; ctx.font = '12px monospace'; ctx.fillText((dishesJson as any[]).find(d => d.id === id)?.name ?? id, x, y + DISH_TEX_H * scale + 16); });
  sheet.id = 'sheet'; document.body.appendChild(sheet); document.title = 'SHEET_DONE'; void drawDish;
} else {
  game.events.once('ready', () => launchHarness(game));
}
