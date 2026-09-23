// STUB — the SIM agent replaces this file. Minimal plausible behavior so scenes run in dev.
import type { RunState, PackedItem, Leg, CityAction, MinigameResult, Ending, City, Item } from '../types';
import { saveRun, loadRun, clearRun, loadSettings, saveSettings } from './save';
import citiesJson from '../../data/cities.json';
import itemsJson from '../../data/items.json';
const cities = citiesJson as unknown as City[];
const items = itemsJson as unknown as Item[];
const gridSpecs = { checked: { cols: 8, rows: 10, maxLb: 50 }, backpack: { cols: 5, rows: 6, maxLb: 25 } };
function weights(state: RunState) {
  const w = { checked: 0, backpack: 0 };
  for (const p of state.items) { const it = items.find(i => i.id === p.id); if (it) w[p.bag] += it.weightLb; }
  return w;
}
export const Sim = {
  gridSpecs,
  createRun(seed: number, startCity: string, direction: 'east' | 'west'): RunState {
    return { version: 1, seed, day: 1, startCity, cityId: startCity, direction, health: 100, energy: 100, mood: 100, cleanClothes: 7, maxClothes: 7,
      items: [], lostItems: [], bagLockedDays: 0, wheelBroken: false, backInjuryDays: 0, sickDays: 0, fatigue: 0, legsLast30: [], visited: [startCity],
      stamps: { [startCity]: 'plain' }, route: [startCity], achievements: [], log: [{ day: 1, city: startCity, text: 'Day 1. Everything you own is on the floor.' }],
      workStreak: 0, coffeeMornings: 0, phase: 'pack', stayDays: 0 };
  },
  setPack(state: RunState, packed: PackedItem[]) {
    state.items = packed; const w = weights(state); const errors: string[] = [];
    if (w.checked > gridSpecs.checked.maxLb) errors.push('Checked bag over 50 lb');
    if (w.backpack > gridSpecs.backpack.maxLb) errors.push('Backpack over 25 lb');
    state.maxClothes = 3 + packed.reduce((a, p) => a + (items.find(i => i.id === p.id)?.clothesDays ?? 0), 0); state.cleanClothes = state.maxClothes;
    if (errors.length === 0) state.phase = 'route';
    return { ok: errors.length === 0, errors, weights: w };
  },
  availableLegs(state: RunState): Leg[] {
    const c = cities.find(x => x.id === state.cityId); const m = Sim.monthOf(state.day);
    return (c?.legs ?? []).filter(l => !l.months || l.months.includes(m));
  },
  travelTo(state: RunState, cityId: string) {
    const leg = Sim.availableLegs(state).find(l => l.to === cityId);
    state.day += leg?.days ?? 1; state.energy = Math.max(0, state.energy - (leg?.energy ?? 10)); state.cityId = cityId; state.stayDays = 0;
    if (!state.visited.includes(cityId)) state.visited.push(cityId); state.route.push(cityId); state.stamps[cityId] = state.stamps[cityId] ?? 'plain';
    state.log.push({ day: state.day, city: cityId, text: `Arrived in ${cities.find(c => c.id === cityId)?.name ?? cityId}.` }); state.phase = 'city';
    return { state, events: [] as string[] };
  },
  cityAction(state: RunState, action: CityAction) {
    state.day += 1; state.stayDays += 1; state.cleanClothes = Math.max(0, state.cleanClothes - 1);
    let minigame: { key: string; payload?: any; difficulty: number } | undefined;
    if (action === 'work') { state.energy -= 10; state.mood += 2; state.workStreak++; }
    if (action === 'explore') { state.mood += 8; state.energy -= 8; }
    if (action === 'rest') { state.energy = Math.min(100, state.energy + 25); }
    if (action === 'laundry') { state.cleanClothes = state.maxClothes; }
    if (action === 'train') minigame = { key: 'Workout', difficulty: 1, payload: { activity: 'bands' } };
    if (action === 'cook') minigame = { key: 'Cooking', difficulty: 1, payload: { dish: (cities.find(c => c.id === state.cityId)?.dishes ?? [])[0] } };
    if (action === 'moveon') state.phase = 'route';
    state.energy = Math.max(0, Math.min(100, state.energy)); state.mood = Math.max(0, Math.min(100, state.mood));
    state.log.push({ day: state.day, city: state.cityId, text: `Day ${state.day}: ${action}.` });
    return { state, events: [] as string[], minigame };
  },
  applyMinigameResult(state: RunState, _key: string, r: MinigameResult) { state.mood = Math.min(100, state.mood + (r.failed ? -5 : 5 + Math.round(r.score / 20))); return state; },
  resolveChoice(state: RunState, _eventId: string, _choice: number) { return state; },
  checkEnding(state: RunState): Ending | undefined {
    if (state.health <= 0) return { kind: 'hospital', text: 'You woke up in a hospital.', score: Sim.score(state) };
    if (state.mood <= 0) return { kind: 'flewhome', text: 'You flew home.', score: Sim.score(state) };
    if (state.day > 365) return { kind: 'outofdays', text: 'The year ended somewhere else.', score: Sim.score(state) };
    if (state.route.length > 3 && state.cityId === state.startCity) return { kind: 'win', text: 'Home. Same bag, fewer wheels.', score: Sim.score(state) };
    return undefined;
  },
  score(state: RunState) { return Math.max(0, (366 - state.day)) * Math.max(1, state.health) + state.visited.length * 100; },
  monthOf(day: number) { return ((Math.floor((day - 1) / 30.4)) % 12) + 1; },
  coffeePacked(state: RunState) { return state.items.some(p => items.find(i => i.id === p.id)?.tags.includes('coffee')); },
  save: saveRun, load: loadRun, clearSave: clearRun, loadSettings, saveSettings,
};
