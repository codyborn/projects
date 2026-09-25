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
(window as any).__game = game; const q = new URLSearchParams(location.search);
const out = document.getElementById('results')!; const prog = (m: string) => { (window as any).__progress = m; document.getElementById('progress')!.textContent = m; };
const errors: string[] = []; window.addEventListener('error', e => errors.push(String(e.message) + ' @ ' + String((e as any).error?.stack || '').split('\n').slice(1, 4).join(' | '))); window.addEventListener('unhandledrejection', e => errors.push('rej:' + String((e as any).reason)));

if (q.get('auto') === '1') {
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  const runs: { key: string; payload?: any; energy: number; extraLives?: number }[] = [
    { key: MINIGAME_KEYS.cooking, energy: 100 }, { key: MINIGAME_KEYS.cooking, energy: 20, payload: { id: 'x', name: 'Tacos', city: 'lapaz', ingredients: ['a'], health: 1, mood: 1, steps: [{ kind: 'season', count: 3 }, { kind: 'pour', count: 1 }, { kind: 'stir', count: 1 }] } },
    ...(['grill', 'dice', 'roll', 'simmer', 'shake', 'fold', 'plate', 'skewer'] as const).map(k => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { id: 'ramen', name: 'Step ' + k, city: 'tokyo', ingredients: ['x'], health: 1, mood: 1, steps: [{ kind: k, count: 3 }] } })),
    ...(['ramen', 'tacos', 'kaiserschmarrn', 'sushi'] as const).map(id => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { dish: (dishesJson as any[]).find(d => d.id === id), cityName: id } })),
    ...(['bands', 'boulder', 'ferrata', 'trailrun', 'hike', 'swim', 'yoga', 'surf', 'ski', 'bogus'] as const).map(a => ({ key: MINIGAME_KEYS.workout, energy: a === 'hike' ? 30 : 100, payload: { activity: a, city: 'Test', day: 7 } })),
    { key: MINIGAME_KEYS.workout, energy: 100, payload: { activity: 'trailrun', city: 'newyork', day: 5 } }, { key: MINIGAME_KEYS.workout, energy: 100, extraLives: 1, payload: { activity: 'bands', city: 'newyork', plan: ['cityrun'] } }, { key: MINIGAME_KEYS.workout, energy: 40, payload: { activity: 'bands', city: 'tokyo', plan: ['cityrun'] } },
    ...[0.95, 0.7, 0.4, 0.1].map(debugAccuracy => ({ key: MINIGAME_KEYS.cooking, energy: 100, payload: { dish: (dishesJson as any[]).find(d => d.id === 'ramen'), cityName: 'tokyo', debugAccuracy } })),
    ...['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'kettlebell', 'sprint', 'stretch', 'boulderbeta', 'dyno', 'riverstones', 'swimbreath', 'balance', 'pose', 'runner', 'pace', 'cityrun'].map(id => ({ key: MINIGAME_KEYS.workout, energy: 100, payload: { activity: 'bands', city: 'Solo', plan: [id] } })),
    ...(['bands', 'boulder', 'ferrata', 'trailrun', 'hike', 'swim', 'yoga'] as const).map(a => ({ key: MINIGAME_KEYS.workout, energy: 100, extraLives: 1, payload: { activity: a, city: 'Boots', day: 3 } })),
    { key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'tetris', city: 'lisbon', cityName: 'Lisbon', seed: 11 } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'heli', city: 'bangkok', cityName: 'Bangkok', hazard: 'tuktuk', seed: 12 } }, { key: MINIGAME_KEYS.carryon, energy: 60, payload: { game: 'heli', city: 'dakhla', cityName: 'Dakhla', hazard: 'gust', seed: 13 } },
    ...[1, 2, 3].map(seed => ({ key: MINIGAME_KEYS.carryon, energy: 100, payload: { game: 'carryon', city: 'innsbruck', cityName: 'Innsbruck', hazard: (['rock', 'otter', 'snow'] as const)[seed - 1], seed, climate: 'alpine' } })),
    { key: MINIGAME_KEYS.carryon, energy: 100 }, { key: MINIGAME_KEYS.carryon, energy: 40, payload: { ...DEFAULT_LEVEL, hazard: 'gust' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'rock' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'wave' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'otter' } }, { key: MINIGAME_KEYS.carryon, energy: 100, payload: { ...DEFAULT_LEVEL, hazard: 'ice' } },
    { key: MINIGAME_KEYS.kite, energy: 100 }, { key: MINIGAME_KEYS.airport, energy: 100 }, { key: MINIGAME_KEYS.airport, energy: 30 }, { key: MINIGAME_KEYS.laundry, energy: 100 },
  ];
  const only = q.get('only'); const limit = Number(q.get('limit') || 0); let runsSel = only ? runs.filter(r => r.key === only) : runs; if (limit) runsSel = runsSel.slice(0, limit); runs.length = 0; runs.push(...runsSel);
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
      const keys = [32, 37, 38, 39, 40, 49, 50, 51]; const kc = keys[Math.floor(Math.random() * keys.length)];
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: kc, which: kc, code: 'KeyX' } as any)); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { keyCode: kc, which: kc } as any)), 80);
      // interactive objects (boulder holds, airport bins/gates) get poked via emit
      scene.children.list.forEach(o => { if ((o as any).input && Math.random() < 0.08) o.emit('pointerdown', p); });
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
    game.scene.start(MINIGAME_KEYS.workout, launch); });
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
    const steer = () => { if (!scene.scene.isActive() || !scene.frame?.active) return; const hnt = scene.hint(); if (hnt.lane < scene.lane) key(37); else if (hnt.lane > scene.lane) key(39); else if (hnt.jump) key(38); };
    if (mode === 'perfect' && q.get('fast') === '1') { game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 6; k++) { t += 16.67; steer(); game.loop.step(t); } }, 0); }
    else if (mode === 'perfect') setInterval(steer, 16);
  });
} else if (q.get('knead') === '1') {
  // knead check: a single knead step, real time; the driver taps and screenshots mid-step; title flips when the step completes
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { game.scene.start(MINIGAME_KEYS.cooking, { energy: 100, difficulty: 0.5, payload: { id: 'ramen', name: 'Knead test', city: 'tokyo', ingredients: ['dough'], health: 1, mood: 1, steps: [{ kind: 'knead', count: 6 }] }, onDone: (res: any) => { out.textContent = JSON.stringify({ res, errors }); document.title = 'KNEAD_DONE'; } }); });
} else if (q.get('console')) {
  MINIGAME_SCENES.forEach(S => game.scene.add(new S().sys.settings.key, S as any, false));
  game.events.once('ready', () => { game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: 0.5, payload: { game: q.get('console'), city: q.get('city') || 'tokyo', cityName: q.get('cityName') || 'Tokyo', hazard: q.get('hazard') || 'otter', seed: Number(q.get('seed') || 7) }, onDone: () => { document.title = 'CONSOLE_DONE'; } } as MinigameLaunch); document.title = 'CONSOLE_UP'; });
} else if (q.get('sheet') === '1') {
  // contact sheet: draw finished dishes into #results as a single canvas
  const ids = (q.get('ids') || 'ramen,tacos,kaiserschmarrn,sushi,paella,bibimbap').split(',');
  const cols = 3, scale = 3; const sheet = document.createElement('canvas'); sheet.width = cols * (DISH_TEX_W * scale + 12); sheet.height = Math.ceil(ids.length / cols) * (DISH_TEX_H * scale + 28); const ctx = sheet.getContext('2d')!; ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#141a2e'; ctx.fillRect(0, 0, sheet.width, sheet.height);
  ids.forEach((id, i) => { const c = renderDishCanvas(id); const x = (i % cols) * (DISH_TEX_W * scale + 12) + 6, y = Math.floor(i / cols) * (DISH_TEX_H * scale + 28) + 4; ctx.drawImage(c, x, y, DISH_TEX_W * scale, DISH_TEX_H * scale); ctx.fillStyle = '#f7cf6b'; ctx.font = '12px monospace'; ctx.fillText((dishesJson as any[]).find(d => d.id === id)?.name ?? id, x, y + DISH_TEX_H * scale + 16); });
  sheet.id = 'sheet'; document.body.appendChild(sheet); document.title = 'SHEET_DONE'; void drawDish;
} else {
  game.events.once('ready', () => launchHarness(game));
}
