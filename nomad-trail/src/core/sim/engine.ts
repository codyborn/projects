import type { RunState, PackedItem, Bag, ItemTag, CityAction, Ending, Leg, City, EventChoice, Continent } from '../types';
import { MINIGAME_KEYS, CONTINENT_OF, type MinigameResult } from '../types';
import { ITEM, ITEMS, CITY, CITIES, EVENT, DISH, LEVEL_BY_CITY, PUZZLES } from './data';
import { makeRng, hash32, type Rng } from './rng';
import STRINGS from '../../data/strings.json';
export const STR = STRINGS as typeof STRINGS;
/** Fill {placeholders} in a copy string. */
export function tpl(t: string, vars: Record<string, string | number>): string { return t.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`)); }
import { rollEvents, applyEffects, hasTag, hasFlag, setFlag, clamp, monthOf, energyCap, recomputeClothes, fmt, accessibleItems, visibleAchievements, availableChoices, forceEvent, LODGING_DEPENDENT, type ResolvedEvent } from './events';
import { saveRun, loadRun, clearRun } from './save';
import { GRID, TOTAL_DAYS, HOME_PROGRESS_DEG, HOME_CITY, HOME_MIN_CONTINENTS, START_MONEY, OVERDRAFT, WORK_PAY, DEFAULT_COST_PER_DAY, FARE, WORK_ENERGY, WORK_MOOD, weekdayOf, isWeekend, OUTDOOR_ACTIVITIES } from './consts';
import { shelfPack, buildPack, randomPack, idsWeight } from './pack';
export { GRID, TOTAL_DAYS, HOME_PROGRESS_DEG, HOME_CITY, HOME_MIN_CONTINENTS, START_MONEY, OVERDRAFT, WORK_PAY, weekdayOf, isWeekend } from './consts';
export { shelfPack, buildPack, randomPack, type PackStyle } from './pack';
export const CONTINENTS_ALL: Continent[] = ['North America', 'South America', 'Europe', 'Africa', 'Asia'];

export interface PackValidation { ok: boolean; errors: string[]; weights: Record<Bag, number>; ratio: number; state?: RunState; }
export interface MinigameRequest { key: string; payload: any; difficulty: number; extraLives?: number; }
export interface StepResult { state: RunState; events: ResolvedEvent[]; minigame?: MinigameRequest; error?: string; }
export interface AvailableLeg extends Leg { city: City; home: boolean; }

const clone = <T>(s: T): T => JSON.parse(JSON.stringify(s));
const rngFor = (s: RunState, salt = 0): Rng => makeRng(hash32(s.seed, s.day, s.log.length, s.route.length, salt));
const wrap = (d: number) => ((d + 540) % 360) - 180;

export function createRun(seed: number, _startCity: string = HOME_CITY, direction: 'east' | 'west' = 'east'): RunState {
  const startCity = HOME_CITY;  // the start city argument is kept for API compatibility; the trail always starts and ends at home
  return { version: 2, seed, day: 1, startCity, cityId: startCity, direction, health: 100, energy: 85, mood: 80, cleanClothes: 3, maxClothes: 3, money: START_MONEY,
    items: [], lostItems: [], bagLockedDays: 0, wheelBroken: false, backInjuryDays: 0, sickDays: 0, fatigue: 0, legsLast30: [],
    visited: [startCity], stamps: { [startCity]: 'plain' }, route: [startCity], achievements: [], log: [{ day: 1, city: startCity, text: tpl(STR.log.start, { city: CITY[startCity].name }) }],
    workStreak: 0, coffeeMornings: 0, phase: 'pack', stayDays: 0 };
}

// ---------- Packing ----------
/** Weight of a bag. Only the suitcase exists now; the backpack argument is kept so old call sites compile and return 0. */
export function bagWeight(items: PackedItem[], bag: Bag = 'checked') { return round1(items.filter(p => p.bag === bag).reduce((a, p) => a + (ITEM[p.id]?.weightLb ?? 0), 0)); }
const round1 = (n: number) => Math.round(n * 10) / 10;
export function weightRatio(items: PackedItem[]) { return bagWeight(items, 'checked') / GRID.checked.maxLb; }
export function validatePack(items: PackedItem[]): PackValidation {
  const errors: string[] = [];
  const seen = new Set<string>(); const occ = new Set<string>();
  for (const p of items) {
    const it = ITEM[p.id];
    if (!it) { errors.push(`unknown item ${p.id}`); continue; }
    if (seen.has(p.id)) errors.push(`${it.name} packed twice`); seen.add(p.id);
    if (p.bag !== 'checked') { errors.push(`${it.name}: everything goes in the suitcase now`); continue; }
    const g = GRID.checked;
    if (p.x < 0 || p.y < 0 || p.x + it.w > g.cols || p.y + it.h > g.rows) { errors.push(`${it.name} does not fit in the ${g.label}`); continue; }
    for (let dx = 0; dx < it.w; dx++) for (let dy = 0; dy < it.h; dy++) {
      const k = `${p.x + dx},${p.y + dy}`; if (occ.has(k)) errors.push(`${it.name} overlaps another item`); occ.add(k);
    }
  }
  const weights: Record<Bag, number> = { checked: bagWeight(items, 'checked'), backpack: 0 };
  if (weights.checked > GRID.checked.maxLb) errors.push(`Suitcase is ${weights.checked} lb (max ${GRID.checked.maxLb})`);
  if (!items.some(p => ITEM[p.id]?.tags.includes('essential'))) errors.push('Pack at least one essential (the laptop kit, at minimum)');
  return { ok: errors.length === 0, errors: [...new Set(errors)], weights, ratio: weightRatio(items) };
}
export function setPack(state: RunState, items: PackedItem[]): PackValidation {
  const v = validatePack(items); if (!v.ok) return v;
  const s = clone(state); s.items = clone(items); recomputeClothes(s); s.cleanClothes = s.maxClothes; s.phase = 'route';
  s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.packed, { weight: v.weights.checked, clothes: s.maxClothes }) });
  if (v.ratio >= 0.95) s.log.push({ day: s.day, city: s.cityId, text: STR.log.bagLimit });
  return { ...v, state: s };
}
export const coffeePacked = (s: RunState) => accessibleItems(s).some(p => ITEM[p.id]?.tags.includes('coffee'));
export const bundles = () => ITEMS;
export const totalWeight = (s: RunState) => round1(bagWeight(s.items, 'checked'));
/** A specific bundle, reachable right now (not in a delayed bag). */
export const hasItem = (s: RunState, id: string) => accessibleItems(s).some(p => p.id === id);
/** True while this city's Airbnb kitchen has the dull knife and you have none of your own (flag set on arrival, per city). */
export const dullKnives = (s: RunState) => hasFlag(s, 'dullknives_' + s.cityId) && !hasTag(s, 'knife');   // your own knife (once the suitcase is here) fixes it
export const isOutdoorsy = (s: RunState) => !!CITY[s.cityId]?.outdoorsy;
const km = (a: City, b: City) => { const r = Math.PI / 180; return 6371 * Math.acos(Math.min(1, Math.sin(a.lat * r) * Math.sin(b.lat * r) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.cos((a.lon - b.lon) * r))); };
/** Fare for a leg, USD: base + per-km, by transport. The trek is a one-off permits-and-guide fee. */
/** Fares grow faster than distance: a 1,000 km hop is cheap, a 9,000 km leap costs a week of work. Giant leaps stay possible if you saved. */
export const LEAP_KM = 3000, LEAP_DIV = 8000;
export function fareFor(from: City, leg: Leg): number { const [base, perKm] = FARE[leg.transport] ?? FARE.bus; const to = CITY[leg.to]; const d = to ? km(from, to) : 0; const leap = Math.max(0, d - LEAP_KM); return Math.round(base + perKm * d + perKm * leap * leap / LEAP_DIV); }  // linear to 3,000 km, then quadratic
/** Upcoming weekdays you could work, starting today. */
export function nextWorkdays(s: RunState, n = 5): number[] { const out: number[] = []; for (let d = s.day; out.length < n && d < s.day + 14; d++) if (!isWeekend(d)) out.push(d); return out; }

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
export function homeUnlocked(s: RunState) { return progress(s) >= HOME_PROGRESS_DEG && continentsVisited(s).length >= HOME_MIN_CONTINENTS; }
/** What still stands between the player and the flight home (for the route screen). */
export function homeRequirements(s: RunState) {
  const p = progress(s), c = continentsVisited(s).length;
  return { progress: Math.round(p), needProgress: HOME_PROGRESS_DEG, continents: c, needContinents: HOME_MIN_CONTINENTS, unlocked: p >= HOME_PROGRESS_DEG && c >= HOME_MIN_CONTINENTS };
}
/** Continents touched so far, in visit order. The second goal: all five. */
export function continentsVisited(s: RunState): Continent[] {
  const out: Continent[] = [];
  for (const id of s.visited) { const c = CITY[id]; if (!c) continue; const k = CONTINENT_OF[c.region]; if (!out.includes(k)) out.push(k); }
  return out;
}
const aheadOf = (s: RunState, here: City, to: City) => { const d = wrap(to.lon - here.lon); return s.direction === 'east' ? d : -d; };
/** No direction until the first leg is taken: the first city you pick decides east or west. */
export const directionUndecided = (s: RunState) => !s.directionSet && s.route.length <= 1;
/** Force a direction (tests, the headless player). Players never call this: their first city decides. */
export function setDirection(state: RunState, direction: 'east' | 'west'): RunState { const s = clone(state); s.direction = direction; s.directionSet = true; return s; }
export interface LongHaulLeg extends AvailableLeg { longHaul: true; }
const fallbackFlight = (s: RunState, here: City, c: City, home: boolean): AvailableLeg => {
  const tz = Math.abs(c.timezone - here.timezone);
  return { to: c.id, transport: 'flight', days: tz > 6 ? 2 : 1, energy: (home ? 18 : 22) + Math.floor(tz / 3) * 4, timezones: tz, city: c, home };
};
/** Legs on offer: forward progress first (most ahead at the top), at most one near-sideways option, nothing more than 20 degrees backwards. */
export function availableLegs(s: RunState): AvailableLeg[] {
  const here = CITY[s.cityId]; const month = monthOf(s.day);
  let out: AvailableLeg[] = [];
  for (const l of here.legs) {
    const to = CITY[l.to]; if (!to) continue;
    if (!directionUndecided(s) && aheadOf(s, here, to) < -20) continue;  // no backtracks (both ways are open before the first leg)
    if (l.months && !l.months.includes(monthOf(s.day + l.days))) continue;
    if (l.to === s.startCity && !homeUnlocked(s)) continue;         // no early return
    if (l.to !== s.startCity && s.visited.includes(l.to)) continue; // no revisits: the trail only goes forward
    out.push({ ...l, city: to, home: l.to === s.startCity });
  }
  // Dead end (every neighbour already visited): you can always fly. Offer the 3 nearest unvisited cities ahead.
  if (!out.some(o => !o.home)) {
    const cands = CITIES.filter(c => c.id !== s.cityId && !s.visited.includes(c.id) && c.id !== s.startCity)
      .map(c => ({ c, ahead: aheadOf(s, here, c) }))
      .filter(x => directionUndecided(s) || x.ahead > -20).sort((a, b) => Math.abs(a.ahead) - Math.abs(b.ahead)).slice(0, 3);
    for (const { c } of cands) {
      const l = c.legs.find(l => l.months); if (l && !l.months!.includes(month)) continue;
      out.push(fallbackFlight(s, here, c, false));
    }
  }
  if (homeUnlocked(s) && s.cityId !== s.startCity && !out.some(o => o.home) && here.legs.some(l => l.transport === 'flight')) out.push(fallbackFlight(s, here, CITY[s.startCity], true));
  // Giant leaps: always offer up to two long-haul flights (5,000 km+, the most forward progress) at superlinear fares.
  if (!directionUndecided(s)) {
    const have = new Set(out.map(o => o.to));
    const leaps = CITIES.filter(c => c.id !== s.cityId && !s.visited.includes(c.id) && c.id !== s.startCity && !have.has(c.id) && km(here, c) >= 5000 && aheadOf(s, here, c) >= 20)
      .filter(c => { const l = c.legs.find(l => l.months); return !(l && !l.months!.includes(month)); })
      .sort((a, b) => aheadOf(s, here, b) - aheadOf(s, here, a)).slice(0, 2);
    for (const c of leaps) { const f = fallbackFlight(s, here, c, false); if (s.money >= fareFor(here, f) * 1.5) out.push({ ...f, energy: f.energy + 8, longHaul: true } as LongHaulLeg); }   // only if you saved up
  }
  if (directionUndecided(s)) { out.sort((a, b) => km(here, a.city) - km(here, b.city)); return out; }   // first pick: nearest first, both ways
  // rank: home flight first when available, then by forward progress; keep at most one sideways (< 8 degrees ahead) option; long hauls last
  out.sort((a, b) => Number(b.home) - Number(a.home) || Number(!!(a as any).longHaul) - Number(!!(b as any).longHaul) || aheadOf(s, here, b.city) - aheadOf(s, here, a.city));
  let sideways = 0;
  out = out.filter(o => { if (o.home || (o as any).longHaul || aheadOf(s, here, o.city) >= 8) return true; return sideways++ < 1; });
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
  if (directionUndecided(s)) { s.direction = wrap(leg.city.lon - from.lon) >= 0 ? 'east' : 'west'; s.directionSet = true; }   // the first city decides
  // fatigue: legs in the last 30 days, before this one
  s.legsLast30 = s.legsLast30.filter(d => s.day - d <= 45); s.fatigue = s.legsLast30.length;
  const fatigueEnergy = 6 * s.fatigue, fatigueMood = 4 * s.fatigue;
  const ratio0 = weightRatio(s.items); const legEnergy = Math.round(leg.energy * (0.8 + 0.8 * ratio0));   // a full suitcase roughly doubles the drain of a light one
  s.energy = clamp(s.energy - legEnergy - fatigueEnergy - (s.wheelBroken ? 8 : 0), 0, energyCap(s));
  const fare = fareFor(from, leg); s.money -= fare; s.workStreak = 0;
  if (hasTag(s, 'luxury') && s.items.some(p => p.id === 'ereader')) s.mood = clamp(s.mood + 2, 0, 100);
  s.mood = clamp(s.mood - fatigueMood - (s.wheelBroken ? 3 : 0), 0, 100);
  s.day += leg.days; s.legsLast30.push(s.day); s.fatigue = s.legsLast30.length;
  s.cleanClothes = Math.max(0, s.cleanClothes - leg.days);
  const ratio = weightRatio(s.items);
  const ctx = { transport: leg.transport, timezones: leg.timezones, overweightRatio: ratio };
  s.log.push({ day: s.day, city: cityId, text: tpl(STR.log.travel, { transport: leg.transport === 'trek' ? STR.log.trek : leg.transport[0].toUpperCase() + leg.transport.slice(1), from: from.name, to: leg.city.name, fare }) + (ratio0 >= 0.85 ? STR.log.travelHeavy : '') + (s.fatigue >= 3 ? STR.log.travelFatigue : '') });
  if (leg.transport === 'flight') events.push(...rollEvents(s, 'flight', ctx, rng, 1));
  // the taxi died on the way to the airport: the gate dash (Temple Run through the terminal) decides whether you make the flight
  let dash: MinigameRequest | undefined;
  if (events.some(e => e.id === 'taxibreakdown')) { const gate = `${'ABCDEF'[rng.int(0, 5)]}${rng.int(1, 99)}`; s.pendingGate = gate; dash = { key: MINIGAME_KEYS.airport, payload: { gate }, difficulty: clamp(0.3 + s.day / 600, 0, 0.8) }; }
  events.push(...rollEvents(s, 'leg', ctx, rng, 2));
  // arrive
  s.cityId = cityId; s.route.push(cityId); if (!s.visited.includes(cityId)) s.visited.push(cityId);
  if (!s.stamps[cityId]) s.stamps[cityId] = 'plain';
  s.stayDays = 0; s.phase = 'city';
  const lodging = leg.city.lodgings[0];
  const arriveCtx = { ...ctx, lodgingCancel: lodging?.cancelChance ?? 0 };
  const cancelled = rollEvents(s, 'arrive', arriveCtx, rngFor(s, 2), 1, e => e.id === 'airbnbcancel');
  events.push(...cancelled, ...rollEvents(s, 'arrive', arriveCtx, rngFor(s, 7), cancelled.length ? 1 : 2, e => e.id !== 'airbnbcancel' && !(cancelled.length && LODGING_DEPENDENT.has(e.id))));
  // Airbnb kitchens: about a third come with one knife that has never been sharpened. Known on arrival; every cooking step in this city
  // needs more precision until you move on. The adventure bundle's knife cancels it.
  if (lodging?.id === 'airbnb' && !cancelled.length && rngFor(s, 13).chance(0.3)) {
    if (hasTag(s, 'knife')) events.push(forceEvent(s, 'dullknives', rng, true));
    else { setFlag(s, 'dullknives_' + cityId, true); events.push(forceEvent(s, 'dullknives', rng)); }
  }
  const conts = continentsVisited(s);
  if (conts.length === CONTINENTS_ALL.length && !s.achievements.includes('fivecontinents')) { s.achievements.push('fivecontinents'); s.log.push({ day: s.day, city: cityId, text: STR.log.fiveContinents }); }
  if (leg.city.altitude && leg.city.altitude >= 3500 && !events.some(e => e.id === 'altitude')) { /* altitude event already weighted; nothing */ }
  if (hasItem(s, 'hostgifts') && (leg.city.lodgings[0]?.id === 'airbnb' || leg.city.lodgings[0]?.id === 'coliving')) s.mood = clamp(s.mood + 3, 0, 100);
  if (leg.home) { s.log.push({ day: s.day, city: cityId, text: tpl(STR.log.homeAgain, { day: s.day, city: leg.city.name }) }); }
  checkEnding(s);
  return dash ? { state: s, events, minigame: dash } : { state: s, events };
}

// ---------- City days ----------
function tickDay(s: RunState, rng: Rng, opts: { rest?: boolean; work?: boolean } = {}): ResolvedEvent[] {
  const city = CITY[s.cityId]; const lodging = city.lodgings[0]; const out: ResolvedEvent[] = [];
  s.day += 1; s.stayDays += 1;
  s.money -= city.costPerDay ?? DEFAULT_COST_PER_DAY;
  const locked = s.bagLockedDays > 0;
  if (locked) { s.energy -= 8; }                                   // living out of one carry-on outfit
  else { s.cleanClothes -= 1; const dirty = s.cleanClothes < 0; if (dirty) { s.cleanClothes = 0; s.dirtyDays = (s.dirtyDays ?? 0) + 1; s.mood -= Math.min(10, 4 + s.dirtyDays); s.health -= 1; } else s.dirtyDays = 0; }
  // radon: granite and alpine bedrock, realistic. The air monitor turns it into a window you open.
  const radon = city.radon ?? 0;
  if (radon) {
    if (hasItem(s, 'airmonitor')) { if (s.stayDays === 1 && !hasFlag(s, 'radon_' + s.cityId)) { setFlag(s, 'radon_' + s.cityId, true); out.push(forceEvent(s, 'radonmonitor', rng)); } }
    else { s.health -= 0.15 * radon; if (radon >= 2 && s.stayDays === 5 && !hasFlag(s, 'radon_' + s.cityId)) { setFlag(s, 'radon_' + s.cityId, true); out.push(forceEvent(s, 'radonheadache', rng)); } }
  }
  s.energy += 5 + (lodging?.energyPerDay ?? 0) + (opts.rest ? 0 : 0);
  s.mood += (lodging?.moodPerDay ?? 0) - 1;
  // slow wear: the year itself is the opponent. Routine (training, cooking, supplements) pushes back.
  s.health -= 0.09 + s.day * 0.0017 + (s.energy < 40 ? (opts.work ? 0.15 : 0.35) : 0) + (hasTag(s, 'fitness') ? 0 : 0.2);   /* a laptop week indoors wears less than a tired day out */
  if (coffeePacked(s)) { s.energy += 15; s.mood += 2; s.coffeeMornings += 1; }
  if (s.sickDays > 0) { s.sickDays -= 1; s.health -= 4; s.energy -= 5; }
  if (s.backInjuryDays > 0) s.backInjuryDays -= 1;
  if (s.bagLockedDays > 0) { s.bagLockedDays -= 1; if (s.bagLockedDays === 0) s.log.push({ day: s.day, city: s.cityId, text: STR.log.suitcaseArrives }); }
  if (s.energy < 25) { s.health -= 2; s.mood -= 3; }
  if (s.mood < 25) s.energy -= 3;
  if (hasTag(s, 'health') && s.energy > 50) s.health += 0.4;
  if (hasItem(s, 'travelkettle')) s.mood += 1;                      // tea at night; the other thing it does lives in events.json
  if (hasItem(s, 'tablet') && opts.rest) s.mood += 2;
  s.health = clamp(s.health, 0, 100); s.energy = clamp(s.energy, 0, energyCap(s)); s.mood = clamp(s.mood, 0, 100);
  out.push(...rollEvents(s, 'day', { overweightRatio: weightRatio(s.items) }, rng, 1));
  if (s.money < 0 && !hasFlag(s, 'broke')) { setFlag(s, 'broke', true); out.push(forceEvent(s, 'broke', rng)); }
  return out;
}
const DAILY: Record<string, string> = STR.daily;
export function cityAction(state: RunState, action: CityAction): StepResult {
  if (state.phase !== 'city') return { state, events: [], error: 'not in a city' };
  if (state.pendingEvent) return { state, events: [], error: 'resolve the pending event first' };
  const s = clone(state); const rng = rngFor(s, 3); let events: ResolvedEvent[] = []; const city = CITY[s.cityId];
  const ctx = { overweightRatio: weightRatio(s.items) };
  const outdoors = !!city.outdoorsy, geared = hasTag(s, 'hike');
  const diff = clamp(1 + (60 - s.energy) / 100 - (outdoors && geared ? 0.1 : 0), 0.5, 1.6);
  const locked = s.bagLockedDays > 0;
  switch (action) {
    case 'work': {
      if (isWeekend(s.day)) return { state, events: [], error: 'It is the weekend. Nobody is paying.' };
      // the work week is a puzzle before standup (Professor Layton, Uniswap flavour); the result scales the whole week's pay (applyMinigameResult)
      const seen = new Set(s.puzzlesSeen ?? []); let pool = PUZZLES.filter(pz => !seen.has(pz.id)); if (!pool.length) { pool = PUZZLES; s.puzzlesSeen = []; }
      const puzzle = pool[hash32(s.seed, s.day, 41) % pool.length]; s.puzzlesSeen = [...(s.puzzlesSeen ?? []), puzzle.id];
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.work, payload: { puzzle, pay: WORK_PAY, day: s.day, days: workDaysAhead(s.day) }, difficulty: 0.5 } }; }
    case 'drone': {
      if (!hasItem(s, 'dronekit')) return { state, events: [], error: 'No drone in the bag.' };
      if (locked) return { state, events: [], error: 'The drone is in the suitcase. The suitcase is somewhere else.' };
      if (s.energy < 15) return { state, events: [], error: 'Too tired to fly. Rest first.' };
      if (hasFlag(s, 'drone_' + s.day)) return { state, events: [], error: 'The battery is charging. Tomorrow.' };
      setFlag(s, 'drone_' + s.day, true); const flights = s.droneFlights ?? 0; const level = Math.min(3, 1 + Math.floor(flights / 2));
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.drone, payload: { city, cityName: city.name, seed: hash32(s.seed, s.day, flights, 55), level }, difficulty: clamp(0.3 + 0.2 * level, 0, 1) } }; }
    case 'console': {
      if (!hasTag(s, 'switch')) return { state, events: [], error: 'No console in the bag.' };
      if (hasFlag(s, 'console_' + s.day)) return { state, events: [], error: 'One evening of that is enough. Tomorrow.' };
      const lvl = LEVEL_BY_CITY[s.cityId] ?? (LEVEL_BY_CITY['generic'] ? { ...LEVEL_BY_CITY['generic'], city: city.name, hazard: city.hazard } : undefined);
      if (!lvl) return { state, events: [], error: 'No cartridge for this city.' };
      setFlag(s, 'console_' + s.day, true); const games = ['carryon', 'tetris'] as const; const ci = Math.max(0, CITIES.findIndex(c => c.id === s.cityId)); const game = games[hash32(s.seed, s.day, ci, 77) % games.length];
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.carryon, payload: { game, level: lvl, city: city.id, cityName: city.name, hazard: city.hazard, climate: city.climate, seed: hash32(s.seed, ci, s.day, 99) }, difficulty: diff } }; }
    case 'explore': {
      s.workStreak = 0; events = tickDay(s, rng);
      const bonus = outdoors && geared; s.energy = clamp(s.energy - (bonus ? 9 : 12), 0, energyCap(s)); s.mood = clamp(s.mood + 7 + (bonus ? 6 : 0), 0, 100);
      s.log.push({ day: s.day, city: s.cityId, text: bonus ? `You go out with the whole kit. ${city.name} is built for it.` : DAILY.explore });
      if (outdoors && !geared && rng.chance(0.3)) { s.mood = clamp(s.mood - 3, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: STR.log.wrongShoes }); }
      events.push(...rollEvents(s, 'action', ctx, rngFor(s, 4), 1)); break; }
    case 'rest': {
      s.workStreak = 0; events = tickDay(s, rng, { rest: true }); s.energy = clamp(s.energy + 28, 0, energyCap(s)); s.mood = clamp(s.mood + 2, 0, 100); s.log.push({ day: s.day, city: s.cityId, text: DAILY.rest });
      break; }
    case 'laundry': {
      if (locked) return { state, events: [], error: 'The clothes are in the suitcase. The suitcase is somewhere else.' };
      // the day is spent either way; how many clean days you get back depends on how the sorting goes (applyMinigameResult)
      s.workStreak = 0; checkEnding(s);
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.laundry, payload: { city: city.id, kit: hasTag(s, 'laundry') }, difficulty: diff } }; }
    case 'train': {
      if (locked) return { state, events: [], error: 'The gear is in the suitcase. The suitcase is somewhere else.' };
      if (s.backInjuryDays > 0) return { state, events: [], error: 'Your back says no. Not today.' };
      if (s.energy < 20) return { state, events: [], error: 'Too tired to train. Rest first.' };
      const acts = city.activities.filter(a => (a !== 'kite' || hasTag(s, 'kite')) && (a !== 'boulder' && a !== 'ferrata' || hasTag(s, 'climb')) && (a !== 'swim' || hasTag(s, 'swim')) && (a !== 'bands' || hasTag(s, 'fitness')) && (a !== 'ski' || hasTag(s, 'cold')) && (a !== 'yoga' || hasTag(s, 'fitness')));
      // kite cities with the kite packed: the first training day is a kite day, then rotate
      const ordered = acts.includes('kite') ? ['kite', ...acts.filter(a => a !== 'kite')] : acts;
      const activity = ordered.length ? ordered[(s.stayDays + s.day) % ordered.length] : 'trailrun';
      const extraLives = hasItem(s, 'hikingboots') && OUTDOOR_ACTIVITIES.has(activity) && activity !== 'kite' ? 1 : 0;
      s.workStreak = 0;
      if (activity === 'kite') return { state: s, events: [], minigame: { key: MINIGAME_KEYS.kite, payload: { city: city.id, day: s.day }, difficulty: diff } };
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.workout, payload: { activity, city: city.id, day: s.day, extraLives }, difficulty: diff, ...(extraLives ? { extraLives } : {}) } }; }
    case 'cook': {
      if (locked) return { state, events: [], error: 'No kitchen kit, no clean anything. The suitcase is somewhere else.' };
      s.workStreak = 0;
      const dish = DISH[city.dishes[(s.stayDays + s.route.length) % city.dishes.length]] ?? DISH[city.dishes[0]];
      s.pendingDish = dish.id; const dull = dullKnives(s);
      return { state: s, events: [], minigame: { key: MINIGAME_KEYS.cooking, payload: { dish, city: city.id, dullKnives: dull }, difficulty: clamp(diff + (dull ? 0.15 : 0), 0.5, 1.6) } }; }
    case 'checkroom': setFlag(s, 'roomchecked', true); s.energy = clamp(s.energy - 2, 0, energyCap(s)); s.log.push({ day: s.day, city: s.cityId, text: STR.log.checkRoom }); return { state: s, events: [] };
    case 'moveon': {
      if (s.stayDays < city.minStay) return { state, events: [], error: `Stay at least ${city.minStay} days in ${city.name}.` };
      events = rollEvents(s, 'leave', ctx, rng, 1); setFlag(s, 'roomchecked', false); s.phase = 'route';
      s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.leave, { city: city.name, stayDays: s.stayDays }) });
      break; }
  }
  checkEnding(s);
  return { state: s, events };
}

/** What a mini-game result confers, before the day tick: the same numbers applyMinigameResult writes and the result card shows. */
export interface MinigameRewards { health: number; mood: number; energy: number; money: number; days: number; clothes?: number; notes: string[]; }
export function minigameRewards(s: RunState, key: string, result: MinigameResult): MinigameRewards {
  const raw = Number.isFinite(result.score) ? result.score : 0; const score = clamp(result.failed ? 0 : (raw > 1 ? raw / 100 : raw), 0, 1); const city = CITY[s.cityId];
  const r: MinigameRewards = { health: 0, mood: 0, energy: 0, money: 0, days: 0, notes: [] };
  switch (key) {
    case MINIGAME_KEYS.workout: r.energy = -10; r.health = 2 + Math.round(score * 5); r.mood = 3 + Math.round(score * 6); r.days = 1; break;
    case MINIGAME_KEYS.cooking: { const dish = (s.pendingDish && DISH[s.pendingDish]) || DISH[city.dishes[0]]; r.health = Math.round(dish.health * score); r.mood = Math.round(dish.mood * score) - (result.failed ? 4 : 0); r.energy = -5; r.days = 1; if (result.failed) r.notes.push('1 in 4 chance of food poisoning'); break; }
    case MINIGAME_KEYS.carryon: r.mood = 3 + Math.round(score * 7); r.energy = -3; if (result.perfect || score >= 0.99) r.notes.push('gold stamp'); r.notes.push('an evening, no day lost'); break;
    case MINIGAME_KEYS.drone: { r.mood = result.failed ? 1 : 4 + Math.round(score * 10); r.energy = -6; r.notes.push('an afternoon, no day lost'); const rule = city.droneRule ?? 'ok'; if (rule !== 'ok') r.notes.push(rule === 'banned' ? 'drones are illegal here: fines' : 'permit country: fines possible'); break; }
    case MINIGAME_KEYS.work: {
      const days = workDaysAhead(s.day); const perDay = WORK_PAY + (result.perfect ? 100 : result.failed ? -75 : 25);
      r.money = days * perDay; r.days = days; r.mood = result.perfect ? 3 : result.failed ? -3 : 0;
      let en = 0; for (let i = 1; i <= days; i++) en += WORK_ENERGY(s.workStreak + i); r.energy = -Math.round(en);
      r.notes.push(result.perfect ? 'bonus: shipped it' : result.failed ? 'pay docked' : 'a hint cost the bonus'); break; }
    case MINIGAME_KEYS.laundry: {
      const kit = hasTag(s, 'laundry'); r.energy = kit ? -2 : -4; r.days = kit ? 0 : 1;
      const bonus = result.perfect ? 3 : score >= 0.8 ? 2 : score >= 0.6 ? 1 : 0;
      const back = result.failed ? Math.ceil(s.maxClothes * 0.5) : Math.round(s.maxClothes * (0.6 + 0.4 * score)) + bonus;
      r.clothes = s.maxClothes ? clamp(back, 1, s.maxClothes + 3) : (result.failed ? 0 : 1);   // no clothes packed: you wash what you are wearing, clean for one day
      r.mood = result.failed ? -3 : result.perfect ? 3 : 0; if (result.failed) r.notes.push('everything is pink now'); if (kit) r.notes.push('laundry kit: no day lost'); break; }
    case MINIGAME_KEYS.kite: r.mood = 5 + Math.round(score * 15); r.energy = -12; break;
    case MINIGAME_KEYS.airport: if (result.failed) { r.days = 1; r.energy = -15; r.mood = -10; r.notes.push('missed the flight'); } else { r.mood = 6; r.energy = -6; r.notes.push('made the flight'); } break;
  }
  return r;
}
/** Result-card lines for a mini-game outcome, e.g. ["+5 health · +7 mood · -5 energy", "a day passes"]. */
export function previewMinigame(s: RunState, key: string, result: MinigameResult): string[] {
  const r = minigameRewards(s, key, result); const sg = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const stats = [r.money ? `${r.money > 0 ? '+' : '-'}$${Math.abs(r.money).toLocaleString('en-US')}` : '', r.health ? `${sg(r.health)} health` : '', r.mood ? `${sg(r.mood)} mood` : '', r.energy ? `${sg(r.energy)} energy` : ''].filter(Boolean);
  const extra = [r.clothes !== undefined ? `${r.clothes} clean days` : '', r.days ? (key === MINIGAME_KEYS.airport ? 'a day lost' : r.days > 1 ? `${r.days} days pass` : 'a day passes') : '', ...r.notes].filter(Boolean);
  const out: string[] = []; if (stats.length) out.push(stats.join(' · ')); if (extra.length) out.push(extra.join(' · ')); return out;
}

/** How many days a WORK WEEK tap covers from `day`: today through Friday, at most 5. */
export function workDaysAhead(day: number): number { let n = 0; while (n < 5 && !isWeekend(day + n)) n++; return Math.max(1, n); }
/** Drone fines by country rule: chance and amount. */
export const DRONE_FINE = { banned: { chance: 0.35, fine: 400 }, permit: { chance: 0.12, fine: 150 }, ok: { chance: 0, fine: 0 } } as const;

export function applyMinigameResult(state: RunState, key: string, result: MinigameResult): StepResult {
  const s = clone(state); const rng = rngFor(s, 5); let events: ResolvedEvent[] = []; const raw = Number.isFinite(result.score) ? result.score : 0; const score = clamp(result.failed ? 0 : (raw > 1 ? raw / 100 : raw), 0, 1); /* score is 0..100 */ const city = CITY[s.cityId]; const rw = minigameRewards(s, key, result);
  switch (key) {
    case MINIGAME_KEYS.workout: {
      events = tickDay(s, rng); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s)); s.health = clamp(s.health + rw.health, 0, 100); s.mood = clamp(s.mood + rw.mood, 0, 100);
      if (result.perfect) unlock(s, 'ironbody'); s.log.push({ day: s.day, city: s.cityId, text: result.failed ? 'Training, badly. Still counts.' : `Training in ${city.name}. ${result.perfect ? 'Flawless.' : 'Good enough.'}` }); break; }
    case MINIGAME_KEYS.cooking: {
      events = tickDay(s, rng); const dish = (s.pendingDish && DISH[s.pendingDish]) || DISH[city.dishes[0]]; s.pendingDish = undefined;
      s.health = clamp(s.health + rw.health, 0, 100); s.mood = clamp(s.mood + rw.mood, 0, 100); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s));
      if (result.perfect) unlock(s, 'chef');
      s.log.push({ day: s.day, city: s.cityId, text: result.failed ? `You attempt ${dish.name}. The kitchen survives.` : `You cook ${dish.name}. ${result.perfect ? 'Better than the restaurant.' : 'Nobody complains.'}` });
      // cooked very badly: the dish fights back (25% food poisoning on a failed dish; the medicine kit still softens it)
      if (result.failed && rng.chance(0.25)) { const fp = EVENT['foodpoisoning']; const mit = !!fp?.mitigatedBy?.some(t => hasTag(s, t)); events.push(forceEvent(s, 'foodpoisoning', rng, mit)); }
      break; }
    case MINIGAME_KEYS.carryon: {
      s.mood = clamp(s.mood + rw.mood, 0, 100); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s));
      s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.consoleEvening, { city: city.name, outcome: result.perfect || score >= 0.99 ? STR.log.consoleGold : STR.log.consoleOk }) });
      if (result.perfect || score >= 0.99) { s.stamps[s.cityId] = 'gold'; unlock(s, 'gold_' + s.cityId); s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.carryonGold, { city: city.name }) }); }
      break; }
    case MINIGAME_KEYS.laundry: {
      // a good sort buys extra clean days (folded, sorted, nothing lost); a bad one gives back less and turns things pink
      // the laundry kit (detergent sheets + bag) turns the launderette day into an evening: no day passes, the day's action is still open
      const kit = hasTag(s, 'laundry'); const bonus = result.perfect ? 3 : score >= 0.8 ? 2 : score >= 0.6 ? 1 : 0;
      if (!kit) events = tickDay(s, rng); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s));
      s.cleanClothes = rw.clothes ?? s.cleanClothes; s.mood = clamp(s.mood + rw.mood, 0, 100);
      if (result.failed) { unlock(s, 'pinkshirts'); s.log.push({ day: s.day, city: s.cityId, text: tpl(kit ? STR.log.laundryKitBad : STR.log.laundryBad, { days: s.cleanClothes }) }); }
      else { s.log.push({ day: s.day, city: s.cityId, text: tpl(kit ? STR.log.laundryKit : bonus ? STR.log.laundryGreat : STR.log.laundryOk, { days: s.cleanClothes }) }); }
      break; }
    case MINIGAME_KEYS.drone: {
      s.droneFlights = (s.droneFlights ?? 0) + 1; const level = Math.min(3, 1 + Math.floor((s.droneFlights - 1) / 2));
      s.mood = clamp(s.mood + rw.mood, 0, 100); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s));
      if (result.perfect) unlock(s, 'dronepilot');
      s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.droneFlight, { city: city.name, level, outcome: result.failed ? STR.log.droneCrash : result.perfect ? STR.log.droneWin : STR.log.droneOk }) });
      /* the law: banned countries fine you often, permit countries sometimes; the fine leaves the travel fund */
      const rule = DRONE_FINE[city.droneRule ?? 'ok']; if (rule.chance && rng.chance(rule.chance)) { s.money -= rule.fine; s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.droneFine, { fine: rule.fine, city: city.name }) }); events.push(forceEvent(s, city.droneRule === 'banned' ? 'dronefine' : 'dronepermit', rng)); }
      break; }
    case MINIGAME_KEYS.work: {
      /* the week: today through Friday (at most 5 days), each day drains by the streak; the puzzle result set the day rate */
      const days = rw.days; const perDay = Math.round(rw.money / days); let earned = 0;
      for (let i = 0; i < days; i++) { if (checkEnding(s)) break; if (i > 0 && (s.energy < 30 || s.mood < 15)) { s.log.push({ day: s.day, city: s.cityId, text: STR.log.workStopped }); break; }   /* running on fumes: the week ends early */ s.workStreak += 1; const n = s.workStreak; events.push(...tickDay(s, rng, { work: true })); s.energy = clamp(s.energy - WORK_ENERGY(n), 0, energyCap(s)); s.mood = clamp(s.mood - WORK_MOOD(n), 0, 100); s.money += perDay; earned += perDay; }
      s.mood = clamp(s.mood + rw.mood, 0, 100);
      s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.workWeek, { days: Math.round(earned / perDay), money: earned.toLocaleString('en-US'), flavor: result.perfect ? STR.log.workPerfect : result.failed ? STR.log.workBad : STR.log.workOk }) });
      break; }
    case MINIGAME_KEYS.kite: { s.mood = clamp(s.mood + rw.mood, 0, 100); s.energy = clamp(s.energy + rw.energy, 0, energyCap(s)); if (result.perfect) unlock(s, 'kitemaster'); break; }
    case MINIGAME_KEYS.airport: {
      const gate = s.pendingGate ?? '?'; s.pendingGate = undefined;
      s.energy = clamp(s.energy + rw.energy, 0, energyCap(s)); s.mood = clamp(s.mood + rw.mood, 0, 100);
      if (result.failed) { s.day += 1; s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.gateMissed, { gate }) }); }
      else { if (result.perfect) unlock(s, 'gatedash'); s.log.push({ day: s.day, city: s.cityId, text: tpl(STR.log.gateMade, { gate }) }); }
      break; }
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
  const conts = continentsVisited(s).length;
  const base = s.visited.length * 25 + gold * 30 + visibleAchievements(s).length * 40 + s.coffeeMornings + conts * 150 + (conts === CONTINENTS_ALL.length ? 500 : 0);
  return s.ending?.kind === 'win' ? base + daysLeft * 2 + s.health * 3 + s.mood + 500 + Math.max(0, Math.round(s.money / 20)) : Math.round(base * 0.6);
}
export function checkEnding(s: RunState): Ending | undefined {
  if (s.phase === 'ended') return s.ending;
  let e: Ending | undefined;
  const home = CITY[s.startCity].name;
  if (s.health <= 0) e = { kind: 'hospital', text: tpl(STR.endings.hospital, { day: s.day, city: CITY[s.cityId].name, home }), score: 0 };
  else if (s.mood <= 0) e = { kind: 'flewhome', text: tpl(STR.endings.flewhome, { day: s.day, city: CITY[s.cityId].name, home }), score: 0 };
  else if (s.money < -OVERDRAFT) e = { kind: 'broke', text: tpl(STR.endings.broke, { day: s.day, city: CITY[s.cityId].name, home }), score: 0 };
  else if (s.day > TOTAL_DAYS) e = { kind: 'outofdays', text: tpl(STR.endings.outofdays, { day: s.day, city: CITY[s.cityId].name, home, degrees: Math.round(Math.max(0, HOME_PROGRESS_DEG + 60 - progress(s))) }), score: 0 };
  else if (s.cityId === s.startCity && s.route.length > 1 && homeUnlocked(s)) e = { kind: 'win', text: tpl(STR.endings.win, { day: s.day, city: CITY[s.cityId].name, home, cities: s.visited.length, daysLeft: 365 - s.day, lost: s.lostItems.length, roomWord: s.lostItems.length === 1 ? 'a room' : 'rooms' }), score: 0 };
  if (e) { e.cause = endingCause(s, e.kind); s.ending = e; s.phase = 'ended'; s.pendingEvent = undefined; e.score = score(s); s.log.push({ day: s.day, city: s.cityId, text: e.text }); }
  return e;
}
/** One line for the share card: what did it, where, when. Derived from the last damaging event in the log. */
export function endingCause(s: RunState, kind: Ending['kind']): string {
  const city = CITY[s.cityId]?.name ?? s.cityId;
  let last: string | undefined;
  for (let i = s.log.length - 1; i >= 0 && !last; i--) { const t = s.log[i].text; for (const [id, phrase] of Object.entries(CAUSE_PHRASE)) if (EVENT[id] && t.startsWith(EVENT[id].title)) { last = phrase; break; } }
  const conts = continentsVisited(s).length;
  switch (kind) {
    case 'hospital': return last ? tpl(STR.causes.hospitalAfter, { city, what: last, day: s.day }) : tpl(STR.causes.hospitalWorn, { city, day: s.day });
    case 'flewhome': return tpl(STR.causes.flewhome, { city, day: s.day });
    case 'broke': return tpl(STR.causes.broke, { city, day: s.day, owed: Math.max(0, Math.round(-s.money)) });
    case 'outofdays': return tpl(STR.causes.outofdays, { city, continents: conts });
    case 'win': return tpl(STR.causes.win, { city, day: s.day, continents: conts, s: conts === 1 ? '' : 's' });
    default: return `Left the trail in ${city} on day ${s.day}`;
  }
}
/** How each damaging event reads in the cause line. */
const CAUSE_PHRASE: Record<string, string> = { otter: 'the otter', kettle: 'the kettle', foodpoisoning: 'food poisoning', backinjury: 'a thrown-out back', altitude: 'thin air', seaurchin: 'a sea urchin', rockfall: 'rockfall', mosquito: 'the mosquitoes', oktoberfest: 'Oktoberfest', sunburn: 'sunburn' };

export function pendingChoices(s: RunState): { id: string; title: string; text: string; choices: EventChoice[] } | null {
  if (!s.pendingEvent) return null; const ev = EVENT[s.pendingEvent]; if (!ev?.choices) return null;
  return { id: ev.id, title: ev.title, text: fmt(ev.text, s), choices: availableChoices(s, ev.choices) };
}

export const Sim = {
  GRID, TOTAL_DAYS, HOME_CITY, HOME_MIN_CONTINENTS, HOME_PROGRESS_DEG, CONTINENTS_ALL, START_MONEY, OVERDRAFT, WORK_PAY, CITIES, CITY, ITEM, DISH, LEVEL_BY_CITY,
  createRun, validatePack, setPack, bagWeight, weightRatio, totalWeight, coffeePacked, bundles, hasTag, hasFlag, hasItem, dullKnives, minigameRewards, previewMinigame, workDaysAhead, isOutdoorsy,
  shelfPack, buildPack, randomPack, idsWeight, weekdayOf, isWeekend, nextWorkdays, fareFor, directionUndecided, setDirection,
  availableLegs, travelTo, cityAction, applyMinigameResult, resolveChoice, pendingChoices, checkEnding, score, progress, homeUnlocked, homeRequirements, continentsVisited, endingCause, monthOf,
  visibleAchievements, energyCap, accessibleItems,
  save: saveRun, load: loadRun, clear: clearRun,
};
export type SimApi = typeof Sim;
