import type { RunState, PackedItem, Bag, ItemTag, CityAction, Ending, Leg, City, EventChoice } from '../types';
import { MINIGAME_KEYS, type MinigameResult } from '../types';
import { ITEM, CITY, CITIES, EVENT, DISH, LEVEL_BY_CITY } from './data';
import { makeRng, hash32, type Rng } from './rng';
import { rollEvents, applyEffects, hasTag, hasFlag, setFlag, clamp, monthOf, energyCap, recomputeClothes, fmt, accessibleItems, visibleAchievements, availableChoices, type ResolvedEvent } from './events';
import { saveRun, loadRun, clearRun } from './save';

export const GRID = {
  checked: { cols: 8, rows: 10, maxLb: 50, label: 'Checked suitcase' },
  backpack: { cols: 5, rows: 6, maxLb: 25, label: 'Backpack' },
} as const;
export const TOTAL_DAYS = 365;
export const HOME_PROGRESS_DEG = 330;   // longitude to cover before the flight home unlocks

export interface PackValidation { ok: boolean; errors: string[]; weights: Record<Bag, number>; ratio: number; state?: RunState; }
export interface MinigameRequest { key: string; payload: any; difficulty: number; }
export interface StepResult { state: RunState; events: ResolvedEvent[]; minigame?: MinigameRequest; error?: string; }
export interface AvailableLeg extends Leg { city: City; home: boolean; }

const clone = <T>(s: T): T => JSON.parse(JSON.stringify(s));
const rngFor = (s: RunState, salt = 0): Rng => makeRng(hash32(s.seed, s.day, s.log.length, s.route.length, salt));
const wrap = (d: number) => ((d + 540) % 360) - 180;

export function createRun(seed: number, startCity: 'miami' | 'newyork' | string = 'miami', direction: 'east' | 'west' = 'east'): RunState {
  if (!CITY[startCity]) throw new Error('unknown start city ' + startCity);
  return { version: 1, seed, day: 1, startCity, cityId: startCity, direction, health: 100, energy: 85, mood: 80, cleanClothes: 3, maxClothes: 3,
    items: [], lostItems: [], bagLockedDays: 0, wheelBroken: false, backInjuryDays: 0, sickDays: 0, fatigue: 0, legsLast30: [],
    visited: [startCity], stamps: { [startCity]: 'plain' }, route: [startCity], achievements: [], log: [{ day: 1, city: startCity, text: `Day 1, ${CITY[startCity].name}. Two bags, one year, the whole planet. Pack.` }],
    workStreak: 0, coffeeMornings: 0, phase: 'pack', stayDays: 0 };
}

// ---------- Packing ----------
export function bagWeight(items: PackedItem[], bag: Bag) { return round1(items.filter(p => p.bag === bag).reduce((a, p) => a + (ITEM[p.id]?.weightLb ?? 0), 0)); }
const round1 = (n: number) => Math.round(n * 10) / 10;
export function weightRatio(items: PackedItem[]) { return Math.max(bagWeight(items, 'checked') / GRID.checked.maxLb, bagWeight(items, 'backpack') / GRID.backpack.maxLb); }
export function validatePack(items: PackedItem[]): PackValidation {
  const errors: string[] = [];
  const seen = new Set<string>();
  const occ: Record<Bag, Set<string>> = { checked: new Set(), backpack: new Set() };
  for (const p of items) {
    const it = ITEM[p.id];
    if (!it) { errors.push(`unknown item ${p.id}`); continue; }
    if (seen.has(p.id)) errors.push(`${it.name} packed twice`); seen.add(p.id);
    const g = GRID[p.bag]; if (!g) { errors.push(`bad bag for ${it.name}`); continue; }
    if (p.x < 0 || p.y < 0 || p.x + it.w > g.cols || p.y + it.h > g.rows) { errors.push(`${it.name} does not fit in the ${g.label}`); continue; }
    for (let dx = 0; dx < it.w; dx++) for (let dy = 0; dy < it.h; dy++) {
      const k = `${p.x + dx},${p.y + dy}`; if (occ[p.bag].has(k)) errors.push(`${it.name} overlaps another item`); occ[p.bag].add(k);
    }
  }
  const weights = { checked: bagWeight(items, 'checked'), backpack: bagWeight(items, 'backpack') };
  if (weights.checked > GRID.checked.maxLb) errors.push(`Checked bag is ${weights.checked} lb (max ${GRID.checked.maxLb})`);
  if (weights.backpack > GRID.backpack.maxLb) errors.push(`Backpack is ${weights.backpack} lb (max ${GRID.backpack.maxLb})`);
  if (!items.some(p => ITEM[p.id]?.tags.includes('essential'))) errors.push('Pack at least one essential (laptop, phone, charger)');
  return { ok: errors.length === 0, errors: [...new Set(errors)], weights, ratio: weightRatio(items) };
}
export function setPack(state: RunState, items: PackedItem[]): PackValidation {
  const v = validatePack(items); if (!v.ok) return v;
  const s = clone(state); s.items = clone(items); recomputeClothes(s); s.cleanClothes = s.maxClothes; s.phase = 'route';
  s.log.push({ day: s.day, city: s.cityId, text: `Packed: ${v.weights.checked} lb checked, ${v.weights.backpack} lb on the back. ${s.maxClothes} days of clean clothes.` });
  if (v.ratio >= 0.95) s.log.push({ day: s.day, city: s.cityId, text: 'The bag is at the limit. Your back has noted this.' });
  return { ...v, state: s };
}
export const coffeePacked = (s: RunState) => accessibleItems(s).some(p => ITEM[p.id]?.tags.includes('coffee') && !ITEM[p.id]?.tags.includes('kettle') && p.id !== 'nze') || accessibleItems(s).some(p => p.id === 'nze');
export const totalWeight = (s: RunState) => round1(bagWeight(s.items, 'checked') + bagWeight(s.items, 'backpack'));

// ---------- Route ----------
/** Signed longitude progress along the route in the chosen direction (degrees). */
export function progress(s: RunState): number {
  let p = 0;
  for (let i = 1; i < s.route.length; i++) {
    const d = wrap(CITY[s.route[i]].lon - CITY[s.route[i - 1]].lon);
    p += s.direction === 'east' ? d : -d;
  }
  return p;
}
export function homeUnlocked(s: RunState) { return progress(s) >= HOME_PROGRESS_DEG; }
export function availableLegs(s: RunState): AvailableLeg[] {
  const here = CITY[s.cityId]; const month = monthOf(s.day);
  const out: AvailableLeg[] = [];
  for (const l of here.legs) {
    const to = CITY[l.to]; if (!to) continue;
    const d = wrap(to.lon - here.lon); const ahead = s.direction === 'east' ? d : -d;
    if (ahead < -30) continue;                                  // no big backtracks
    if (l.months && !l.months.includes(monthOf(s.day + l.days))) continue;
    if (l.to === s.startCity && !homeUnlocked(s)) continue;      // no early return
    if (l.to !== s.startCity && s.visited.includes(l.to)) continue; // no revisits: the trail only goes forward
    out.push({ ...l, city: to, home: l.to === s.startCity });
  }
  // Dead end (every neighbour already visited): you can always fly. Offer the 3 nearest unvisited cities ahead.
  if (!out.some(o => !o.home)) {
    const cands = CITIES.filter(c => c.id !== s.cityId && !s.visited.includes(c.id) && c.id !== s.startCity)
      .map(c => { const d = wrap(c.lon - here.lon); const ahead = s.direction === 'east' ? d : -d; return { c, ahead }; })
      .filter(x => x.ahead > -30).sort((a, b) => Math.abs(a.ahead) - Math.abs(b.ahead)).slice(0, 3);
    for (const { c } of cands) {
      const l = c.legs.find(l => l.months); if (l && !l.months!.includes(month)) continue;
      const tz = Math.abs(c.timezone - here.timezone);
      out.push({ to: c.id, transport: 'flight', days: tz > 6 ? 3 : 2, energy: 30 + Math.floor(tz / 3) * 4, timezones: tz, city: c, home: false });
    }
  }
  if (homeUnlocked(s) && s.cityId !== s.startCity && !out.some(o => o.home) && here.legs.some(l => l.transport === 'flight')) {
    const home = CITY[s.startCity]; const tz = Math.abs(home.timezone - here.timezone);
    out.push({ to: s.startCity, transport: 'flight', days: tz > 6 ? 2 : 1, energy: 18 + Math.floor(tz / 3) * 4, timezones: tz, city: home, home: true });
  }
  return out;
}

// ---------- Travel ----------
export function travelTo(state: RunState, cityId: string): StepResult {
  if (state.phase !== 'route') return { state, events: [], error: 'not in route phase' };
  if (state.pendingEvent) return { state, events: [], error: 'resolve the pending event first' };
  const leg = availableLegs(state).find(l => l.to === cityId);
  if (!leg) return { state, events: [], error: 'no such leg from here' };
  const s = clone(state); const rng = rngFor(s, 1); const events: ResolvedEvent[] = [];
  const from = CITY[s.cityId];
  // fatigue: legs in the last 30 days, before this one
  s.legsLast30 = s.legsLast30.filter(d => s.day - d <= 45); s.fatigue = s.legsLast30.length;
  const fatigueEnergy = 6 * s.fatigue, fatigueMood = 4 * s.fatigue;
  s.energy = clamp(s.energy - leg.energy - fatigueEnergy - (s.wheelBroken ? 8 : 0), 0, energyCap(s));
  s.mood = clamp(s.mood - fatigueMood - (s.wheelBroken ? 3 : 0), 0, 100);
  s.day += leg.days; s.legsLast30.push(s.day); s.fatigue = s.legsLast30.length;
  s.cleanClothes = Math.max(0, s.cleanClothes - leg.days);
  const ratio = weightRatio(s.items);
  const ctx = { transport: leg.transport, timezones: leg.timezones, overweightRatio: ratio };
  s.log.push({ day: s.day, city: cityId, text: `${leg.transport === 'trek' ? 'Fourteen days on foot' : leg.transport[0].toUpperCase() + leg.transport.slice(1)} from ${from.name} to ${leg.city.name}.${s.fatigue >= 3 ? ' Too many legs too fast; everything aches.' : ''}` });
  if (leg.transport === 'flight') events.push(...rollEvents(s, 'flight', ctx, rng, 1));
  events.push(...rollEvents(s, 'leg', ctx, rng, 2));
  // arrive
  s.cityId = cityId; s.route.push(cityId); if (!s.visited.includes(cityId)) s.visited.push(cityId);
  if (!s.stamps[cityId]) s.stamps[cityId] = 'plain';
  s.stayDays = 0; s.phase = 'city';
  const lodging = leg.city.lodgings[0];
  events.push(...rollEvents(s, 'arrive', { ...ctx, lodgingCancel: lodging?.cancelChance ?? 0 }, rngFor(s, 2), 2));
  if (leg.city.altitude && leg.city.altitude >= 3500 && !events.some(e => e.id === 'altitude')) { /* altitude event already weighted; nothing */ }
  if (leg.home) { s.log.push({ day: s.day, city: cityId, text: `Day ${s.day}. ${leg.city.name} again. The same skyline, a different person under it.` }); }
  checkEnding(s);
  return { state: s, events };
}

// ---------- City days ----------
function tickDay(s: RunState, rng: Rng, opts: { rest?: boolean } = {}): ResolvedEvent[] {
  const city = CITY[s.cityId]; const lodging = city.lodgings[0];
  s.day += 1; s.stayDays += 1;
  s.cleanClothes -= 1;
  const dirty = s.cleanClothes < 0; if (dirty) { s.cleanClothes = 0; s.mood -= 5; s.health -= 1; }
  s.energy += 5 + (lodging?.energyPerDay ?? 0) + (opts.rest ? 0 : 0);
  s.mood += (lodging?.moodPerDay ?? 0) - 1;
  // slow wear: the year itself is the opponent. Routine (training, cooking, supplements) pushes back.
  s.health -= 0.10 + s.day * 0.0017 + (s.energy < 40 ? 0.35 : 0) + (hasTag(s, 'fitness') ? 0 : 0.2);
  if (coffeePacked(s)) { s.energy += 15; s.mood += 2; s.coffeeMornings += 1; }
  if (s.sickDays > 0) { s.sickDays -= 1; s.health -= 4; s.energy -= 5; }
  if (s.backInjuryDays > 0) s.backInjuryDays -= 1;
  if (s.bagLockedDays > 0) { s.bagLockedDays -= 1; if (s.bagLockedDays === 0) s.log.push({ day: s.day, city: s.cityId, text: 'The suitcase arrives, apologetic and slightly damp.' }); }
  if (s.energy < 25) { s.health -= 2; s.mood -= 3; }
  if (s.mood < 25) s.energy -= 3;
  if (hasTag(s, 'health') && s.energy > 50) s.health += 0.4;
  s.health = clamp(s.health, 0, 100); s.energy = clamp(s.energy, 0, energyCap(s)); s.mood = clamp(s.mood, 0, 100);
  const ev = rollEvents(s, 'day', { overweightRatio: weightRatio(s.items) }, rng, 1);
  return ev;
}
const DAILY: Record<string, string> = {
  work: 'A work day. Meetings at odd hours, the laptop on a kitchen table.',
  explore: 'You go out and get lost on purpose.',
  rest: 'A slow day. Nowhere to be.',
  laundry: 'Laundry day. The glamorous part.',
};
export function cityAction(state: RunState, action: CityAction): StepResult {
  if (state.phase !== 'city') return { state, events: [], error: 'not in a city' };
  if (state.pendingEvent) return { state, events: [], error: 'resolve the pending event first' };
  const s = clone(state); const rng = rngFor(s, 3); let events: ResolvedEvent[] = []; const city = CITY[s.cityId];
  const ctx = { overweightRatio: weightRatio(s.items) };
  const diff = clamp(1 + (60 - s.energy) / 100, 0.6, 1.6);
  switch (action) {
    case 'work': events = tickDay(s, rng); s.energy = clamp(s.energy - 12, 0, energyCap(s)); s.mood = clamp(s.mood - 1, 0, 100); s.workStreak += 1; s.log.push({ day: s.day, city: s.cityId, text: DAILY.work }); break;
    case 'explore': events = tickDay(s, rng); s.energy = clamp(s.energy - 12, 0, energyCap(s)); s.mood = clamp(s.mood + 7, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: DAILY.explore }); events.push(...rollEvents(s, 'action', ctx, rngFor(s, 4), 1)); break;
    case 'rest': {
      events = tickDay(s, rng, { rest: true }); s.energy = clamp(s.energy + 28, 0, energyCap(s)); s.mood = clamp(s.mood + 2, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: DAILY.rest });
      const lvl = LEVEL_BY_CITY[s.cityId];
      if (hasTag(s, 'switch') && lvl) { checkEnding(s); return { state: s, events, minigame: { key: MINIGAME_KEYS.carryon, payload: { level: lvl, city: city.id }, difficulty: diff } }; }
      break; }
    case 'laundry': events = tickDay(s, rng); s.cleanClothes = s.maxClothes; s.energy = clamp(s.energy - 4, 0, energyCap(s)); s.mood = clamp(s.mood - 2, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: DAILY.laundry }); checkEnding(s); return { state: s, events, minigame: { key: MINIGAME_KEYS.laundry, payload: { items: s.items.length }, difficulty: diff } };
    case 'train': {
      if (s.backInjuryDays > 0) return { state, events: [], error: 'Your back says no. Not today.' };
      if (s.energy < 20) return { state, events: [], error: 'Too tired to train. Rest first.' };
      const acts = city.activities.filter(a => (a !== 'kite' || hasTag(s, 'kite')) && (a !== 'boulder' && a !== 'ferrata' || hasTag(s, 'climb')) && (a !== 'swim' || hasTag(s, 'swim')) && (a !== 'bands' || hasTag(s, 'fitness')) && (a !== 'ski' || hasTag(s, 'cold')) && (a !== 'yoga' || hasTag(s, 'fitness')));
      const activity = acts.length ? acts[(s.stayDays + s.day) % acts.length] : 'trailrun';
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.workout, payload: { activity, city: city.id }, difficulty: diff } }; }
    case 'cook': {
      const dish = DISH[city.dishes[(s.stayDays + s.route.length) % city.dishes.length]] ?? DISH[city.dishes[0]];
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.cooking, payload: { dish, city: city.id }, difficulty: diff } }; }
    case 'checkroom': setFlag(s, 'roomchecked', true); s.energy = clamp(s.energy - 2, 0, energyCap(s)); s.log.push({ day: s.day, city: s.cityId, text: 'You check under the bed, behind the door, in the shower. Twice.' }); return { state: s, events: [] };
    case 'moveon': {
      if (s.stayDays < city.minStay) return { state, events: [], error: `Stay at least ${city.minStay} days in ${city.name}.` };
      events = rollEvents(s, 'leave', ctx, rng, 1); setFlag(s, 'roomchecked', false); s.phase = 'route';
      s.log.push({ day: s.day, city: s.cityId, text: `You leave ${city.name} after ${s.stayDays} days.` });
      break; }
  }
  checkEnding(s);
  return { state: s, events };
}

export function applyMinigameResult(state: RunState, key: string, result: MinigameResult): StepResult {
  const s = clone(state); const rng = rngFor(s, 5); let events: ResolvedEvent[] = []; const raw = Number.isFinite(result.score) ? result.score : 0; const score = clamp(result.failed ? 0 : (raw > 1 ? raw / 100 : raw), 0, 1); /* score is 0..100 */ const city = CITY[s.cityId];
  switch (key) {
    case MINIGAME_KEYS.workout: {
      events = tickDay(s, rng); s.energy = clamp(s.energy - 10, 0, energyCap(s)); s.health = clamp(s.health + 2 + Math.round(score * 5), 0, 100); s.mood = clamp(s.mood + 3 + Math.round(score * 6), 0, 100);
      if (result.perfect) unlock(s, 'ironbody'); s.log.push({ day: s.day, city: s.cityId, text: result.failed ? 'Training, badly. Still counts.' : `Training in ${city.name}. ${result.perfect ? 'Flawless.' : 'Good enough.'}` }); break; }
    case MINIGAME_KEYS.cooking: {
      events = tickDay(s, rng); const dish = DISH[city.dishes[(s.stayDays - 1 + s.route.length) % city.dishes.length]] ?? DISH[city.dishes[0]];
      s.health = clamp(s.health + Math.round(dish.health * score), 0, 100); s.mood = clamp(s.mood + Math.round(dish.mood * score), 0, 100); s.energy = clamp(s.energy - 5, 0, energyCap(s));
      if (result.perfect) unlock(s, 'chef'); if (result.failed) s.mood = clamp(s.mood - 4, 0, 100);
      s.log.push({ day: s.day, city: s.cityId, text: result.failed ? `You attempt ${dish.name}. The kitchen survives.` : `You cook ${dish.name}. ${result.perfect ? 'Better than the restaurant.' : 'Nobody complains.'}` }); break; }
    case MINIGAME_KEYS.carryon: {
      s.mood = clamp(s.mood + 8 + Math.round(score * 12), 0, 100);
      if (result.perfect || score >= 0.99) { s.stamps[s.cityId] = 'gold'; unlock(s, 'gold_' + s.cityId); s.log.push({ day: s.day, city: s.cityId, text: `Carry-On: ${city.name} cleared. Gold stamp.` }); }
      break; }
    case MINIGAME_KEYS.laundry: { if (result.failed) { unlock(s, 'pinkshirts'); s.mood = clamp(s.mood - 2, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: 'Everything is slightly pink now.' }); } else if (result.perfect) s.mood = clamp(s.mood + 3, 0, 100); break; }
    case MINIGAME_KEYS.kite: { s.mood = clamp(s.mood + 5 + Math.round(score * 15), 0, 100); s.energy = clamp(s.energy - 12, 0, energyCap(s)); if (result.perfect) unlock(s, 'kitemaster'); break; }
    case MINIGAME_KEYS.airport: { if (result.failed) { s.energy = clamp(s.energy - 12, 0, energyCap(s)); s.mood = clamp(s.mood - 6, 0, 100); } break; }
  }
  checkEnding(s);
  return { state: s, events };
}
function unlock(s: RunState, a: string) { if (!s.achievements.includes(a)) s.achievements.push(a); }

export function resolveChoice(state: RunState, eventId: string, choiceIndex: number): StepResult {
  if (state.pendingEvent !== eventId) return { state, events: [], error: 'no such pending event' };
  const ev = EVENT[eventId]; const choice: EventChoice | undefined = ev?.choices ? availableChoices(state, ev.choices)[choiceIndex] : undefined;
  if (!choice) return { state, events: [], error: 'bad choice' };
  const s = clone(state); const rng = rngFor(s, 6);
  const lost = applyEffects(s, choice.effects, rng);
  const text = fmt(choice.text, s, lost);
  s.log.push({ day: s.day, city: s.cityId, text: `${ev.title} — ${choice.label}: ${text}` });
  s.pendingEvent = undefined; checkEnding(s);
  return { state: s, events: [{ id: eventId, title: ev.title, text, effects: choice.effects, mitigated: false, pending: false }] };
}

// ---------- Ending & score ----------
export function score(s: RunState): number {
  const daysLeft = Math.max(0, TOTAL_DAYS - s.day);
  const gold = Object.values(s.stamps).filter(v => v === 'gold').length;
  const base = s.visited.length * 25 + gold * 30 + visibleAchievements(s).length * 40 + s.coffeeMornings;
  return s.ending?.kind === 'win' ? base + daysLeft * 2 + s.health * 3 + s.mood + 500 : Math.round(base * 0.6);
}
export function checkEnding(s: RunState): Ending | undefined {
  if (s.phase === 'ended') return s.ending;
  let e: Ending | undefined;
  const home = CITY[s.startCity].name;
  if (s.health <= 0) e = { kind: 'hospital', text: `Day ${s.day}. ${CITY[s.cityId].name}. A hospital bed with a view of a parking lot. The trail ends here; the story does not.`, score: 0 };
  else if (s.mood <= 0) e = { kind: 'flewhome', text: `Day ${s.day}. You book the flight home from ${CITY[s.cityId].name} without telling anyone. ${home} is nice this time of year.`, score: 0 };
  else if (s.day > TOTAL_DAYS) e = { kind: 'outofdays', text: `Day 366. The year ends in ${CITY[s.cityId].name}, ${Math.round(Math.max(0, HOME_PROGRESS_DEG + 60 - progress(s)))} degrees of longitude from home. Next year, maybe.`, score: 0 };
  else if (s.cityId === s.startCity && s.route.length > 1 && homeUnlocked(s)) e = { kind: 'win', text: `Day ${s.day}. ${home}. ${s.visited.length} cities, ${365 - s.day} days to spare, ${s.lostItems.length} things left in ${s.lostItems.length === 1 ? 'a room' : 'rooms'} around the world. You circled it.`, score: 0 };
  if (e) { s.ending = e; s.phase = 'ended'; s.pendingEvent = undefined; e.score = score(s); s.log.push({ day: s.day, city: s.cityId, text: e.text }); }
  return e;
}

export function pendingChoices(s: RunState): { id: string; title: string; text: string; choices: EventChoice[] } | null {
  if (!s.pendingEvent) return null; const ev = EVENT[s.pendingEvent]; if (!ev?.choices) return null;
  return { id: ev.id, title: ev.title, text: fmt(ev.text, s), choices: availableChoices(s, ev.choices) };
}

export const Sim = {
  GRID, TOTAL_DAYS, CITIES, CITY, ITEM, DISH, LEVEL_BY_CITY,
  createRun, validatePack, setPack, bagWeight, weightRatio, totalWeight, coffeePacked, hasTag, hasFlag,
  availableLegs, travelTo, cityAction, applyMinigameResult, resolveChoice, pendingChoices, checkEnding, score, progress, homeUnlocked, monthOf,
  visibleAchievements, energyCap, accessibleItems,
  save: saveRun, load: loadRun, clear: clearRun,
};
export type SimApi = typeof Sim;
