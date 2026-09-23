// Debug / e2e API exposed as window.__nomad. Coded against the contracts in ARCHITECTURE.md; uses loose typing on purpose.
import type Phaser from 'phaser';
import type { RunState, MinigameResult } from './core/types';
import { MINIGAME_KEYS } from './core/types';

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
    newRun: (start = 'miami', dir: 'east' | 'west' = 'east') => { const s = SimMod.createRun(Date.now() % 100000, start, dir); setRun(s); go('Pack'); },
    autoPack: (style: 'balanced' | 'heavy' | 'light' = 'balanced') => {
      const items = SimMod.items ?? SimMod.data?.items; const s = run()!;
      const pick = SimMod.autoPack ? SimMod.autoPack(style, items) : [];
      const res = SimMod.setPack(s, pick); setRun(res.state ?? s); return res;
    },
    depart: () => { const s = run()!; if (s.phase === 'pack') s.phase = 'route'; setRun(s); go('Route'); },
    travelFirst: () => { const s = run()!; const legs = SimMod.availableLegs(s); if (!legs.length) return 'no legs'; go('Travel', { to: legs[0].to }); return legs[0].to; },
    act: (a: string) => { const sc: any = game.scene.getScene('City'); if (sc?.doAction) return sc.doAction(a); const r = SimMod.cityAction(run()!, a); setRun(r.state); return r; },
    dismissEvents: () => { const ev: any = game.scene.getScene('Event'); if (ev && game.scene.isActive('Event')) { ev.dismissAll?.() ?? game.scene.stop('Event'); } },
    minigame: (key: string, payload?: any) => new Promise<MinigameResult>(res => { lastMinigameDone = res; go(key, { energy: 80, difficulty: 0.4, payload, onDone: (r: MinigameResult) => { lastMinigameDone = null; res(r); } }); }),
    finishMinigame: (score = 70) => {
      for (const k of Object.values(MINIGAME_KEYS)) { const sc: any = game.scene.getScene(k); if (sc && game.scene.isActive(k)) { sc.forceFinish?.(score) ?? sc.frame?.finish?.({ score, perfect: score >= 95, failed: score < 30 }) ?? game.scene.stop(k); return k; } }
      const c: any = game.scene.getScene('Coffee'); if (c && game.scene.isActive('Coffee')) { c.skip?.() ?? game.scene.stop('Coffee'); return 'Coffee'; }
      return null;
    },
    continueRun: () => { const s = SimMod.load(); if (!s) return false; game.registry.set('run', s); go(s.phase === 'pack' ? 'Pack' : s.phase === 'route' ? 'Route' : s.phase === 'ended' ? 'End' : 'City'); return true; },
    forceEnding: (kind: 'win' | 'hospital' | 'flewhome' | 'outofdays' | 'quit' = 'hospital') => { const s = run()!; if (kind === 'hospital') s.health = 0; if (kind === 'flewhome') s.mood = 0; if (kind === 'outofdays') s.day = 366; if (kind === 'win') { s.cityId = s.startCity; s.visited = Array.from(new Set([...s.visited, 'tokyo', 'lisbon'])); s.day = Math.max(s.day, 200); } const e = SimMod.checkEnding(s, kind === 'win'); s.ending = e ?? { kind, text: 'forced', score: 0 }; s.phase = 'ended'; setRun(s); go('End'); },
    activeScenes: () => game.scene.getScenes(true).map(s => s.scene.key),
    errors: [] as string[],
  };
  w.__nomad = api;
  window.addEventListener('error', e => api.errors.push(String(e.message)));
  game.events.once('ready', () => { api.ready = true; });
  setTimeout(() => { api.ready = true; }, 1500);
  void anyScene;
}
