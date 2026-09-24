// Thin adapter between scenes and the SIM agent's engine. Scenes import ONLY from here (never from ../core/sim directly).
import { Sim as Engine } from '../core/sim';
import type { RunState, PackedItem, Leg, CityAction, MinigameResult, Ending, Item, City, GameEvent, Settings, Dish } from '../core/types';
import { CONTINENT_OF } from '../core/types';
import itemsJson from '../data/items.json';
import citiesJson from '../data/cities.json';
import eventsJson from '../data/events.json';
import dishesJson from '../data/dishes.json';
export interface SimApi {
  gridSpecs: { checked: { cols: number; rows: number; maxLb: number }; backpack?: { cols: number; rows: number; maxLb: number } };
  createRun(seed: number, startCity: string, direction: 'east' | 'west'): RunState;
  setPack(state: RunState, packed: PackedItem[]): { ok: boolean; errors: string[]; weights: { checked: number; backpack?: number } };
  availableLegs(state: RunState): Leg[];
  travelTo(state: RunState, cityId: string): { state: RunState; events: string[] };
  cityAction(state: RunState, action: CityAction): { state: RunState; events: string[]; minigame?: { key: string; payload?: any; difficulty: number } };
  applyMinigameResult(state: RunState, key: string, result: MinigameResult): RunState;
  resolveChoice(state: RunState, eventId: string, choiceIdx: number): RunState;
  checkEnding(state: RunState): Ending | undefined;
  score(state: RunState): number;
  monthOf(day: number): number;
  coffeePacked(state: RunState): boolean;
  save(state: RunState): void; load(): RunState | undefined; clearSave(): void;
  loadSettings(): Settings; saveSettings(s: Settings): void;
  visibleAchievements(state: RunState): string[];
  continentsVisited(state: RunState): string[];
  CONTINENTS_ALL: string[];
  /** 0 = Sunday. Day 1 of the run is Thu 1 Jan 2026. */
  weekdayOf(day: number): number;
  isWeekend(day: number): boolean;
  /** A legal random pack (Surprise Me). */
  randomPack(seed: number): PackedItem[];
  /** Fare for a leg, if the engine prices legs. */
  legCost(state: RunState, leg: Leg): number | undefined;
}
import { loadSettings as _loadSettings, saveSettings as _saveSettings, recordRun } from '../core/sim';
export { recordRun };
const E = Engine as any;
/** Adapter: the engine returns StepResult {state, events: ResolvedEvent[]} and mutates nothing; scenes expect ids + plain states. */
export const Sim: SimApi = {
  gridSpecs: E.GRID,
  createRun: (seed, start, dir) => E.createRun(seed, start, dir),
  setPack: (state, packed) => { const r = E.setPack(state, packed); if (r.ok && r.state) Object.assign(state, r.state); return { ok: r.ok, errors: r.errors, weights: r.weights }; },
  availableLegs: (state) => E.availableLegs(state),
  travelTo: (state, cityId) => { const r = E.travelTo(state, cityId); if (r.error) console.warn('travelTo:', r.error); return { state: r.state, events: r.events.map((e: any) => e.id) }; },
  cityAction: (state, action) => { const r = E.cityAction(state, action); if (r.error) console.warn('cityAction:', r.error); return { state: r.state, events: r.events.map((e: any) => e.id), minigame: r.minigame }; },
  applyMinigameResult: (state, key, result) => E.applyMinigameResult(state, key, result).state,
  resolveChoice: (state, eventId, idx) => { const r = E.resolveChoice(state, eventId, idx); if (r.error) console.warn('resolveChoice:', r.error); return r.state; },
  checkEnding: (state) => E.checkEnding(state),
  score: (state) => E.score(state),
  monthOf: (day) => E.monthOf(day),
  coffeePacked: (state) => E.coffeePacked(state),
  save: (state) => E.save(state), load: () => E.load() ?? undefined, clearSave: () => E.clear(),
  loadSettings: () => _loadSettings(), saveSettings: (s) => _saveSettings(s),
  visibleAchievements: (state) => E.visibleAchievements(state),
  // engine may lag behind the scenes: derive from city regions when the engine has no continent helpers yet
  continentsVisited: (state) => E.continentsVisited ? E.continentsVisited(state) : Array.from(new Set(state.visited.map(id => { const c = cities.find(x => x.id === id); return c ? (CONTINENT_OF[c.region] as string) : ''; }).filter(x => !!x))),
  CONTINENTS_ALL: E.CONTINENTS_ALL ?? ['North America', 'South America', 'Europe', 'Africa', 'Asia'],
  weekdayOf: (day) => E.weekdayOf ? E.weekdayOf(day) : ((day - 1) + 4) % 7,
  isWeekend: (day) => { if (E.isWeekend) return E.isWeekend(day); const w = ((day - 1) + 4) % 7; return w === 0 || w === 6; },
  randomPack: (seed) => E.randomPack ? E.randomPack(seed) : fallbackRandomPack(seed),
  legCost: (state, leg) => (leg as any).cost ?? (E.fareFor && E.CITY?.[state.cityId] ? E.fareFor(E.CITY[state.cityId], leg) : undefined),
};
/** Local stand-in until the engine ships randomPack: shuffle bundles, first-fit them into the suitcase up to ~35 lb. */
function fallbackRandomPack(seed: number): PackedItem[] {
  const g = (Engine as any).GRID?.checked ?? { cols: 8, rows: 10, maxLb: 50 }; let r = (seed >>> 0) || 1; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const pool = [...items].sort(() => rnd() - 0.5); const occ = Array.from({ length: g.rows }, () => Array(g.cols).fill(false)); const out: PackedItem[] = []; let lb = 0;
  const fits = (x: number, y: number, w: number, h: number) => { if (x + w > g.cols || y + h > g.rows) return false; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (occ[yy][xx]) return false; return true; };
  const mark = (x: number, y: number, w: number, h: number) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) occ[yy][xx] = true; };
  const must = pool.filter(i => i.tags.includes('work')).slice(0, 1); const rest = pool.filter(i => !must.includes(i));
  for (const it of [...must, ...rest]) {
    if (lb + it.weightLb > Math.min(g.maxLb, 36)) continue; if (!must.includes(it) && rnd() < 0.35) continue;
    let done = false;
    for (let y = 0; y < g.rows && !done; y++) for (let x = 0; x < g.cols && !done; x++) if (fits(x, y, it.w, it.h)) { mark(x, y, it.w, it.h); out.push({ id: it.id, bag: 'checked', x, y }); lb += it.weightLb; done = true; }
  }
  return out;
}
/** Choices the engine will accept right now (filtered by accessible gear); EventScene must use these, not the raw definition. */
export const pendingChoices = (state: RunState): { id: string; title: string; text: string; choices: any[] } | null => E.pendingChoices(state);
export const engineEvents = (state: RunState) => E; // escape hatch
const items = itemsJson as unknown as Item[]; const cities = citiesJson as unknown as City[]; const events = eventsJson as unknown as GameEvent[]; const dishes = dishesJson as unknown as Dish[];
export const Data = {
  items, cities, events, dishes,
  item: (id: string) => items.find(i => i.id === id),
  city: (id: string) => cities.find(c => c.id === id),
  event: (id: string) => events.find(e => e.id === id),
  dish: (id: string) => dishes.find(d => d.id === id),
};
/** Registry helpers: the run lives in scene.registry under 'run'. */
export function getRun(scene: Phaser.Scene): RunState { return scene.registry.get('run') as RunState; }
export function putRun(scene: Phaser.Scene, s: RunState) { scene.registry.set('run', s); Sim.save(s); }
export function getSettings(scene: Phaser.Scene): Settings { let s = scene.registry.get('settings') as Settings | undefined; if (!s) { s = Sim.loadSettings(); scene.registry.set('settings', s); } return s; }
export function putSettings(scene: Phaser.Scene, s: Settings) { scene.registry.set('settings', s); Sim.saveSettings(s); }
import type Phaser from 'phaser';
