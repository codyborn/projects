// Debug / e2e API exposed as window.__nomad. Coded against the contracts in ARCHITECTURE.md; uses loose typing on purpose.
import type Phaser from 'phaser';
import type { RunState, MinigameResult } from './core/types';
import { MINIGAME_KEYS } from './core/types';
import { buildPack } from './core/sim/pack';
import { makeRng } from './core/sim/rng';
import { renderDishCanvas } from './minigames/dishArt';
import { META as WORKOUT_META, POOLS as WORKOUT_POOLS, DENSE_CITIES } from './minigames/workout/pools';
import { CONSOLE_GAME_IDS } from './minigames/console/games';
import citiesJson from './data/cities.json';
import dishesJson from './data/dishes.json';
import eventsJson from './data/events.json';
import itemsJson from './data/items.json';

export function installDebug(game: Phaser.Game) {
  const w = window as any;
  let SimMod: any = null;
  import('./core/sim').then(m => { SimMod = (m as any).Sim ?? m; w.__nomad.sim = SimMod; });
  const anyScene = () => game.scene.getScenes(true)[0];
  const run = (): RunState | undefined => game.registry.get('run');
  const setRun = (s: RunState) => { game.registry.set('run', s); SimMod?.save?.(s); };
  const stopAll = () => game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key));
  const go = (key: string, data?: any) => { stopAll(); game.scene.start(key, data); };
  let lastMinigameDone: ((r: MinigameResult) => void) | null = null;
  const api = {
    ready: false, game, sim: null as any,
    scene: (key: string) => game.scene.getScene(key),
    goto: go,
    state: run,
    hasSave: () => !!SimMod?.load?.(),
    newRun: (start = 'orangecounty', dir: 'east' | 'west' = 'east', seed?: number) => { const s = SimMod.createRun(seed ?? (Date.now() % 100000), start, dir); setRun(s); go('Pack'); },
    autoPack: (style: 'balanced' | 'heavy' | 'light' = 'balanced') => {
      const s = run()!; const pick = buildPack(style === 'light' ? 'smart' : style === 'heavy' ? 'heavy' : 'random', makeRng(s.seed));
      const res = SimMod.setPack(s, pick); setRun(res.state ?? s); return { ok: res.ok, errors: res.errors, weights: res.weights };
    },
    depart: () => { const s = run()!; if (s.phase === 'pack') s.phase = 'route'; setRun(s); go('Route'); },
    travelFirst: () => { const s = run()!; const legs = SimMod.availableLegs(s); if (!legs.length) return 'no legs'; go('Travel', { leg: legs[0] }); return legs[0].to; },
    act: (a: string) => { const sc: any = game.scene.getScene('City'); if (sc && game.scene.isActive('City')) { sc.act(a); return 'ok'; } return 'not-in-city:' + game.scene.getScenes(true).map(x => x.scene.key).join(','); },
    dismissEvents: () => { const ev: any = game.scene.getScene('Event'); if (ev && (game.scene.isActive('Event') || game.scene.isPaused('Event'))) { ev.autoResolve ? ev.autoResolve() : game.scene.stop('Event'); } },
    lastResult: null as MinigameResult | null,
    minigame: (key: string, payload?: any) => { go(key, { energy: 80, difficulty: 0.4, payload, onDone: (r: MinigameResult) => { api.lastResult = r; lastMinigameDone = null; } }); return key; },
    /** finish the active mini-game with a score and press CONTINUE on its result card */
    finishMinigame: (score = 70) => {
      for (const k of Object.values(MINIGAME_KEYS)) { const sc: any = game.scene.getScene(k); if (sc && game.scene.isActive(k)) { if (sc.frame?.finish) { sc.frame.finish(score); sc.frame.proceed?.(); } else if (sc.finish) sc.finish(score); else game.scene.stop(k); return k; } }
      const c: any = game.scene.getScene('Coffee'); if (c && game.scene.isActive('Coffee')) { c.skip?.() ?? game.scene.stop('Coffee'); return 'Coffee'; }
      return null;
    },
    continueRun: () => { const s = SimMod.load(); if (!s) return false; game.registry.set('run', s); go(s.phase === 'pack' ? 'Pack' : s.phase === 'route' ? 'Route' : s.phase === 'ended' ? 'End' : 'City'); return true; },
    forceEnding: (kind: 'win' | 'hospital' | 'flewhome' | 'outofdays' | 'quit' = 'hospital') => { const s = run()!; if (kind === 'hospital') s.health = 0; if (kind === 'flewhome') s.mood = 0; if (kind === 'outofdays') s.day = 366; if (kind === 'win') { s.cityId = s.startCity; s.visited = Array.from(new Set([...s.visited, 'tokyo', 'lisbon'])); s.day = Math.max(s.day, 200); } const e = SimMod.checkEnding(s, kind === 'win'); s.ending = e ?? { kind, text: 'forced', score: 0 }; s.phase = 'ended'; setRun(s); go('End'); },
    activeScenes: () => game.scene.getScenes(true).map(s => s.scene.key),
    errors: [] as string[],
  };
  // review hub data (tools/review.mjs)
  (api as any).review = {
    cities: citiesJson, dishes: dishesJson, events: eventsJson, items: itemsJson,
    workoutMeta: WORKOUT_META, workoutPools: WORKOUT_POOLS, denseCities: Array.from(DENSE_CITIES), consoleGames: CONSOLE_GAME_IDS,
    dishPng: (id: string) => renderDishCanvas(id).toDataURL('image/png'),
  };
  w.__nomad = api;
  window.addEventListener('error', e => api.errors.push(String(e.message)));
  game.events.once('ready', () => { api.ready = true; });
  setTimeout(() => { api.ready = true; }, 1500);
  void anyScene;
}
