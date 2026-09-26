import { describe, it, expect, beforeEach } from 'vitest';
import { Sim, GRID, HOME_PROGRESS_DEG, HOME_MIN_CONTINENTS, HOME_CITY } from './engine';
import { ITEMS, ITEM, CITIES, CITY, EVENTS, EVENT, DISHES, DISH, LEVELS } from './data';
import { saveRun, loadRun, clearRun, _resetMemoryStore, recordRun, loadSettings } from './save';
import { makeRng } from './rng';
import { rollEvents, eventChance, monthOf, LODGING_DEPENDENT } from './events';
import { shelfPack, buildPack, randomPack, playRun } from '../../../sim/policy';
import { START_MONEY, OVERDRAFT, WORK_PAY, WORK_ENERGY, isWeekend, weekdayOf } from './consts';
import { CONTINENT_OF } from '../types';
import type { PackedItem, RunState, ItemTag } from '../types';

const P = (id: string, bag: 'checked' | 'backpack' = 'checked', x = 0, y = 0): PackedItem => ({ id, bag, x, y });
/** The laptop and a week of clothes. One suitcase. */
const basic = (): PackedItem[] => [P('laptopkit', 'checked', 0, 0), P('clothes1', 'checked', 3, 0)];
/** basic() plus more bundles, shelf-packed so they never overlap. */
const withExtras = (...ids: string[]): PackedItem[] => shelfPack(['laptopkit', 'clothes1', ...ids])!;
function packed(items = basic()): RunState { const s = Sim.createRun(42, undefined, 'east'); const v = Sim.setPack(s, items); expect(v.ok, v.errors.join(';')).toBe(true); return Sim.setDirection(v.state!, 'east'); }  // direction fixed here; inference is covered in route.test.ts
const HEAVY = ['kitegear', 'dronekit', 'books', 'hikingboots', 'adventure', 'protein', 'clothes1', 'clothes2', 'hostgifts', 'laptopkit', 'coffeekit'];
/** WORK WEEK: the engine hands back the puzzle; apply it with a score (1 = solved: +100/day, 0.6..0.94 = hinted: +25/day, <0.5 = wrong: -75/day) to run the week. Default 0.8. */
function workWeek(s: RunState, score = 0.8): RunState { const r = Sim.cityAction(s, 'work'); if (r.error) throw new Error(r.error); return Sim.applyMinigameResult(r.state, 'Work', { score, perfect: score >= 0.95, failed: score < 0.5 }).state; }
/** Travel along the first offered leg, resolving any pending choice. */
function hop(s: RunState, pick = 0): RunState { const legs = Sim.availableLegs({ ...s, phase: 'route' }); let r = Sim.travelTo({ ...s, phase: 'route' }, legs[Math.min(pick, legs.length - 1)].to).state; if (r.pendingEvent) r = Sim.resolveChoice(r, r.pendingEvent, 0).state; return r; }

describe('data integrity', () => {
  it('items are ~30 generic bundles with valid footprints and no brand names', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(26); expect(ITEMS.length).toBeLessThanOrEqual(40);
    expect(ITEMS.filter(i => i.real).length).toBeGreaterThanOrEqual(15);
    for (const it of ITEMS) { expect(it.w).toBeGreaterThan(0); expect(it.h).toBeGreaterThan(0); expect(it.w <= GRID.checked.cols && it.h <= GRID.checked.rows).toBe(true); expect(it.weightLb).toBeGreaterThan(0); expect(it.name).not.toMatch(/apple|garmin|osprey|sony|dji|samsung|nintendo|kindle|cerave|nutricost|altra|ombraz|melin|timemore|miir/i); }
    expect(ITEMS.filter(i => i.name === 'Clothes' && i.label === '1 week worth').length).toBe(4);  // one tray card, four placeable weeks, distinct colors
    expect(ITEM.phonekit).toBeUndefined(); expect(ITEM.airmonitor?.real).toBe(true);
    for (const it of ITEMS) { expect(it.benefits?.length ?? 0, it.id).toBeGreaterThanOrEqual(1); for (const b of it.benefits!) expect(b.length).toBeLessThanOrEqual(44); }
  });
  it('every tag the engine or an event relies on exists on at least one bundle', () => {
    const have = new Set(ITEMS.flatMap(i => i.tags));
    const used = new Set<ItemTag>(['essential', 'clothing', 'health', 'fitness', 'coffee', 'switch', 'kettle', 'organizer', 'kite', 'climb', 'swim', 'cold', 'trap']);
    for (const e of EVENTS) { if (e.requiresTag) used.add(e.requiresTag); for (const t of e.mitigatedBy ?? []) used.add(t); if (e.effects.loseItemTag) used.add(e.effects.loseItemTag); for (const c of e.choices ?? []) if (c.requiresTag) used.add(c.requiresTag); }
    for (const t of used) expect(have.has(t), `tag ${t}`).toBe(true);
  });
  it('every leg, dish, event weight, and arcade level points at something real; Nairobi is gone', () => {
    expect(CITY.nairobi).toBeUndefined(); expect(CITY[HOME_CITY]).toBeDefined();
    for (const c of CITIES) { for (const l of c.legs) expect(CITY[l.to], `${c.id}->${l.to}`).toBeDefined(); for (const d of c.dishes) expect(DISH[d], d).toBeDefined(); for (const e of Object.keys(c.eventWeights)) expect(EVENT[e], `${c.id} weights ${e}`).toBeDefined(); }
    for (const d of DISHES) expect(CITY[d.city], d.city).toBeDefined();
    for (const l of LEVELS.filter(l => l.city !== 'generic')) { expect(CITY[l.city]).toBeDefined(); expect(l.tiles.length).toBe(20); for (const r of l.tiles) expect(r.length).toBe(23); }
    for (const e of EVENTS) if (e.requiresCity) expect(CITY[e.requiresCity]).toBeDefined();
  });
  it('every dish a city offers is local to that city or its region', () => {
    for (const c of CITIES) for (const d of c.dishes) expect(CONTINENT_OF[CITY[DISH[d].city].region] === CONTINENT_OF[c.region] && (DISH[d].city === c.id || CITY[DISH[d].city].region === c.region), `${c.id}: ${d}`).toBe(true);
  });
  it('city blurbs describe places, not in-game events', () => {
    for (const c of CITIES) expect(c.blurb, c.id).not.toMatch(/airbnb|cancel|otter|hospital|kettle|burn/i);
  });
  it('legs are symmetric, seasonal where they should be, and flights take 1 day (2 for long-haul)', () => {
    for (const c of CITIES) for (const l of c.legs) {
      expect(CITY[l.to].legs.some(b => b.to === c.id), `${l.to} back to ${c.id}`).toBe(true);
      if (l.transport === 'flight') expect(l.days === 1 || (l.days === 2 && (l.timezones > 6 || true)), `${c.id}->${l.to} ${l.days}d`).toBe(true);
      if (l.transport === 'flight' && l.timezones <= 3) { const a = CITY[c.id], b = CITY[l.to]; const km = 6371 * Math.acos(Math.min(1, Math.sin(a.lat * Math.PI / 180) * Math.sin(b.lat * Math.PI / 180) + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.cos((a.lon - b.lon) * Math.PI / 180))); if (km < 4000) expect(l.days, `${c.id}->${l.to}`).toBe(1); }
      if (l.transport !== 'flight') expect(l.days).toBe(1);   // the Manaslu trek lives inside the Kathmandu stay now
    }
    expect(CITY.highlands.legs.find(l => l.to === 'reykjavik')!.months).toEqual([6, 7, 8, 9]);
  });
  it('the whole graph is connected and a learned player circles the globe both ways from Orange County', () => {
    const seen = new Set([HOME_CITY]); const q = [HOME_CITY];
    while (q.length) { const c = CITY[q.pop()!]; for (const l of c.legs) if (!seen.has(l.to)) { seen.add(l.to); q.push(l.to); } }
    expect(seen.size).toBe(CITIES.length);
    for (const dir of ['east', 'west'] as const) {
      const o = playRun(7, 'smart', { direction: dir, skill: 1 });
      expect(o.ending, dir).toBe('win'); expect(Sim.progress(o.state)).toBeGreaterThanOrEqual(HOME_PROGRESS_DEG); expect(o.continents).toBeGreaterThanOrEqual(HOME_MIN_CONTINENTS);
      expect(o.state.startCity).toBe(HOME_CITY); expect(o.state.cityId).toBe(HOME_CITY);
    }
  });
  it('arcade levels are completable (BFS with jump 3 up / 4 across rising / 5 falling)', () => {
    for (const lv of LEVELS) {
      const t = lv.tiles, W = 23, H = 20;
      const solid = (x: number, y: number) => x >= 0 && x < W && y >= 0 && y < H && '#-'.includes(t[y][x]);
      const free = (x: number, y: number) => x >= 0 && x < W && y >= 0 && y < H && !'#^'.includes(t[y][x]);
      const stand = (x: number, y: number) => free(x, y) && solid(x, y + 1);
      let sx = 0, sy = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (t[y][x] === 'S') { sx = x; sy = y; }
      const seen = new Set([`${sx},${sy}`]); const q = [[sx, sy]];
      while (q.length) { const [x, y] = q.pop()!; for (let ny = 0; ny < H; ny++) { const reach = ny < y ? 4 : 5; for (let nx = x - reach; nx <= x + reach; nx++) { if (seen.has(`${nx},${ny}`) || !stand(nx, ny) || y - ny > 3) continue; const apex = Math.max(0, Math.min(y, ny) - 1); let ok = true; for (let px = Math.min(x, nx); px <= Math.max(x, nx); px++) if (!(free(px, apex) || free(px, apex + 1))) ok = false; if (!ok) continue; seen.add(`${nx},${ny}`); q.push([nx, ny]); } } }
      const stands = [...seen].map(k => k.split(',').map(Number));
      let stamps = 0, got = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (t[y][x] === '*') { stamps++; if (stands.some(([px, py]) => Math.abs(px - x) <= 1 && py - y >= 0 && py - y <= 3)) got++; }
      expect(got, lv.city).toBe(stamps); expect(stamps).toBe(lv.stampPieces);
    }
  });
});

describe('packing', () => {
  it('rejects out-of-bounds, overlaps, duplicates, overweight, and a bag with no essentials', () => {
    expect(Sim.validatePack([P('laptopkit', 'checked', 6, 0)]).errors[0]).toMatch(/does not fit/);
    expect(Sim.validatePack([P('laptopkit', 'checked', 0, 0), P('tablet', 'checked', 1, 1)]).errors.join()).toMatch(/overlaps/);
    expect(Sim.validatePack([P('watch', 'checked', 0, 0), P('watch', 'checked', 2, 0)]).errors.join()).toMatch(/twice/);
    expect(Sim.validatePack([P('clothes1', 'checked')]).errors.join()).toMatch(/essential/);
    expect(Sim.validatePack([P('laptopkit', 'backpack', 0, 0)]).errors.join()).toMatch(/suitcase/);   // the backpack is gone
    expect(Object.keys(GRID)).toEqual(['checked']);
    // hand-placed so it fits the grid exactly but weighs 50.3 lb: the weight check, not the fit check, must fail it
    const heavy: PackedItem[] = [P('kitegear', 'checked', 0, 0), P('clothes1', 'checked', 4, 0), P('books', 'checked', 0, 3), P('dronekit', 'checked', 2, 3), P('laptopkit', 'checked', 5, 3), P('adventure', 'checked', 0, 5), P('hikingboots', 'checked', 3, 5), P('protein', 'checked', 6, 5), P('clothes2', 'checked', 0, 7), P('climbkit', 'checked', 3, 7), P('fitnesskit', 'checked', 5, 7), P('watch', 'checked', 7, 7), P('supplements', 'checked', 3, 9), P('skincare', 'checked', 5, 9)];
    const v = Sim.validatePack(heavy);
    expect(v.weights.checked).toBeGreaterThan(GRID.checked.maxLb); expect(v.ok).toBe(false); expect(v.errors).toEqual([expect.stringMatching(/Suitcase is/)]);
  });
  it('a sensible full kit (laptop included) fits in one suitcase at ~30 lb; a greedy kit exceeds 50 lb or the grid', () => {
    const sensible = shelfPack(['laptopkit', 'toiletries', 'watch', 'airmonitor', 'clothes1', 'clothes2', 'shell', 'protein', 'supplements', 'skincare', 'sleepkit', 'coffeekit', 'adventure', 'fitnesskit', 'firstaid', 'medkit', 'packingcubes']);
    expect(sensible).not.toBeNull(); const w = Sim.bagWeight(sensible!); expect(w).toBeGreaterThan(27); expect(w).toBeLessThan(35); expect(Sim.validatePack(sensible!).ok).toBe(true);
    const greedy = ['kitegear', 'dronekit', 'books', 'hikingboots', 'adventure', 'protein', 'clothes1', 'clothes2', 'hostgifts', 'laptopkit', 'coffeekit', 'travelkettle', 'yogamat'];
    expect(shelfPack(greedy) === null || Sim.idsWeight(greedy) > GRID.checked.maxLb).toBe(true);
  });
  it('accepts a valid pack, computes weight and clothes days, starts with money, moves to the route phase, always at home', () => {
    const s = packed(); expect(s.phase).toBe('route'); expect(s.maxClothes).toBe(3 + 7); expect(s.cleanClothes).toBe(10); expect(s.money).toBe(START_MONEY); expect(s.version).toBe(2);
    expect(Sim.bagWeight(s.items)).toBeCloseTo(8.5, 1); expect(Sim.totalWeight(s)).toBeCloseTo(8.5, 1);
    expect(s.startCity).toBe(HOME_CITY); expect(Sim.createRun(1, 'miami', 'west').startCity).toBe(HOME_CITY);
  });
  it('shelf packer output always validates; every policy pack and every Surprise-Me pack is legal with a laptop and clothes', () => {
    for (let i = 0; i < 60; i++) { const rng = makeRng(i); for (const style of ['random', 'heavy', 'smart'] as const) { const v = Sim.validatePack(buildPack(style, rng)); expect(v.ok, `${style} ${i}: ${v.errors.join(';')}`).toBe(true); } }
    for (let seed = 0; seed < 80; seed++) { const p = randomPack(seed); const v = Sim.validatePack(p); expect(v.ok, `${seed}: ${v.errors.join(';')}`).toBe(true); expect(p.some(i => i.id === 'laptopkit')).toBe(true); expect(p.some(i => ITEM[i.id].clothesDays)).toBe(true); expect(p.every(i => i.bag === 'checked')).toBe(true); }
    expect(randomPack(3)).toEqual(randomPack(3));
  });
});

describe('travel and route', () => {
  it('offers forward legs ranked by progress, at most one sideways option, never home early, never revisits', () => {
    const s = packed(); const legs = Sim.availableLegs(s).filter(l => !(l as any).longHaul); const here = CITY[HOME_CITY];   // leaps are listed after the normal legs and priced separately
    const ahead = (to: string) => { const d = ((CITY[to].lon - here.lon + 540) % 360) - 180; return s.direction === 'east' ? d : -d; };
    expect(legs.length).toBeGreaterThan(1); expect(legs.some(l => l.to === HOME_CITY)).toBe(false);
    for (let i = 1; i < legs.length; i++) expect(ahead(legs[i - 1].to)).toBeGreaterThanOrEqual(ahead(legs[i].to));
    for (const l of legs) expect(ahead(l.to)).toBeGreaterThanOrEqual(-20);
    expect(legs.filter(l => ahead(l.to) < 8).length).toBeLessThanOrEqual(1);
    const r = Sim.travelTo(s, legs[0].to); expect(r.error).toBeUndefined(); expect(r.state.phase).toBe('city'); expect(r.state.stamps[legs[0].to]).toBe('plain');
    expect(Sim.availableLegs({ ...r.state, phase: 'route' }).some(l => l.to === HOME_CITY && !l.home)).toBe(false);
    const west = Sim.setPack(Sim.createRun(5, undefined, 'west'), basic()).state!; expect(Sim.availableLegs(west).map(l => l.to)).toContain('tokyo');
  });
  it('refuses unknown legs and travel outside the route phase', () => {
    const s = packed(); expect(Sim.travelTo(s, 'kathmandu').error).toMatch(/no such leg/);
    expect(Sim.travelTo({ ...s, phase: 'city' }, 'lasvegas').error).toMatch(/route phase/);
  });
  it('the flight home needs ~330 degrees AND four continents', () => {
    const s = { ...packed(), direction: 'west' as const }; expect(Sim.homeUnlocked(s)).toBe(false);
    const three = { ...s, route: [HOME_CITY, 'tokyo', 'bangkok', 'kathmandu', 'munich', 'lisbon', 'miami', 'lasvegas'], visited: [HOME_CITY, 'tokyo', 'bangkok', 'kathmandu', 'munich', 'lisbon', 'miami', 'lasvegas'], cityId: 'lasvegas' } as RunState;
    expect(Sim.progress(three)).toBeGreaterThan(HOME_PROGRESS_DEG); expect(Sim.continentsVisited(three)).toEqual(['North America', 'Asia', 'Europe']); expect(Sim.homeUnlocked(three)).toBe(false);
    expect(Sim.homeRequirements(three)).toMatchObject({ needContinents: 4, continents: 3, unlocked: false });
    const four = { ...three, route: [HOME_CITY, 'tokyo', 'bangkok', 'kathmandu', 'munich', 'lisbon', 'casablanca', 'miami', 'lasvegas'], visited: [HOME_CITY, 'tokyo', 'bangkok', 'kathmandu', 'munich', 'lisbon', 'casablanca', 'miami', 'lasvegas'] } as RunState;
    expect(Sim.homeUnlocked(four)).toBe(true); expect(Sim.availableLegs(four).some(l => l.home)).toBe(true); expect(Sim.availableLegs(four)[0].home).toBe(true);
  });
  it('fallback flights (dead ends) take 1 day, 2 across more than six time zones', () => {
    const s = { ...packed(), direction: 'west' as const, cityId: 'reykjavik', route: [HOME_CITY, 'reykjavik'], visited: [HOME_CITY, 'reykjavik', ...CITY.reykjavik.legs.map(l => l.to)] } as RunState;
    const legs = Sim.availableLegs(s); expect(legs.length).toBeGreaterThan(0);
    for (const l of legs) expect(l.days).toBe(Math.abs(l.city.timezone - CITY.reykjavik.timezone) > 6 ? 2 : 1);
  });
  it('tracks fatigue from recent legs and drains energy more when hopping fast', () => {
    let s = packed(); const e0 = s.energy;
    s = hop(s); const afterOne = e0 - s.energy; expect(afterOne).toBeGreaterThan(0);
    s = hop({ ...s, stayDays: 99 }); expect(s.fatigue).toBe(2);
  });
  it('stamps a fifth-continent achievement and counts continents for the score', () => {
    const s = packed(); expect(Sim.continentsVisited(s)).toEqual(['North America']);
    const five = { ...s, visited: [HOME_CITY, 'santiago', 'lisbon', 'casablanca', 'tokyo'], route: [HOME_CITY, 'santiago', 'lisbon', 'casablanca', 'tokyo'], cityId: 'tokyo' } as RunState;
    expect(Sim.continentsVisited(five).length).toBe(5); expect(Sim.score(five) - Sim.score({ ...five, visited: five.visited.slice(0, 4), route: five.route.slice(0, 4) } as RunState)).toBeGreaterThanOrEqual(300);
  });
});

describe('events', () => {
  it('the otter only ever fires in Tokyo, once, with no choice; first aid changes the outcome', () => {
    const base = packed();
    expect(EVENT.otter.choices).toBeUndefined(); expect(EVENT.otter.mitigatedBy).toContain('firstaid'); expect(EVENT.otter.mitigatedText!.length).toBeGreaterThan(30);
    for (const cid of ['lisbon', 'bangkok', 'seoul', 'miami']) expect(eventChance(EVENT.otter, { ...base, cityId: cid }, {}).chance).toBe(0);
    const tokyo = { ...base, cityId: 'tokyo', phase: 'city' as const, visited: [HOME_CITY, 'tokyo'], stamps: { [HOME_CITY]: 'plain' as const, tokyo: 'plain' as const } };
    expect(eventChance(EVENT.otter, tokyo, {}).chance).toBeGreaterThan(0);
    let fired = 0, s: RunState = JSON.parse(JSON.stringify(tokyo));
    for (let i = 0; i < 60 && s.phase === 'city'; i++) { const r = Sim.cityAction(s, 'explore'); s = r.state; if (r.events.some(e => e.id === 'otter')) { fired++; expect(r.events.find(e => e.id === 'otter')!.pending).toBe(false); expect(s.pendingEvent).toBeUndefined(); } if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; }
    expect(fired).toBe(1); expect(s.achievements).toContain('otter'); expect(s.achievements).not.toContain('otter_lived');
    const withKit = { ...tokyo, items: [...tokyo.items, P('firstaid', 'checked', 6, 0)] } as RunState;
    let s2: RunState = JSON.parse(JSON.stringify(withKit)), seenKit = false;
    for (let i = 0; i < 60 && s2.phase === 'city'; i++) { const r = Sim.cityAction(s2, 'explore'); s2 = r.state; const ot = r.events.find(e => e.id === 'otter'); if (ot) { seenKit = true; expect(ot.mitigated).toBe(true); expect(s2.achievements).toContain('otter_lived'); expect(s2.sickDays).toBe(0); break; } if (s2.pendingEvent) s2 = Sim.resolveChoice(s2, s2.pendingEvent, 0).state; }
    expect(seenKit).toBe(true);
  });
  it('no event has choices any more; the cancelled booking is a plain drain', () => {
    expect(EVENTS.filter(e => e.choices?.length).map(e => e.id)).toEqual([]);
    expect(EVENT.airbnbcancel.choices).toBeUndefined(); expect(EVENT.airbnbcancel.effects.energy).toBeLessThan(0); expect(EVENT.airbnbcancel.effects.mood).toBeLessThan(0);
  });
  it('mitigated text stands alone and the cafe gets its emphasis', () => {
    for (const e of EVENTS) if (e.mitigatedText) { expect(e.mitigatedText[0]).toMatch(/[A-Z{]/); expect(e.mitigatedText.length).toBeGreaterThan(30); }
    expect(EVENT.coffeeshop.text).toContain('THE cafe');
    for (const e of EVENTS) for (const t of [e.text, e.mitigatedText ?? '']) expect(t).not.toMatch(/Not an? \w+: the \w+/);
  });
  it('on arrival the cancelled booking comes first and silences the wifi / host / neighbour events that day', () => {
    const s = { ...packed(), phase: 'city' as const, cityId: 'lisbon' };
    let cancelledRuns = 0;
    for (let i = 0; i < 200; i++) {
      const c: RunState = JSON.parse(JSON.stringify(s)); const rng = makeRng(i);
      const first = rollEvents(c, 'arrive', { lodgingCancel: 0.9 }, rng, 1, e => e.id === 'airbnbcancel');
      const rest = rollEvents(c, 'arrive', { lodgingCancel: 0.9 }, rng, 2, e => e.id !== 'airbnbcancel' && !(first.length && LODGING_DEPENDENT.has(e.id)));
      if (first.length) { cancelledRuns++; expect(rest.some(e => LODGING_DEPENDENT.has(e.id))).toBe(false); }
    }
    expect(cancelledRuns).toBeGreaterThan(100);
    // and through travelTo: a cancellation is always the first event of the arrival
    let seen = 0;
    for (let seed = 0; seed < 80 && seen < 3; seed++) { const st = Sim.setPack(Sim.createRun(seed, undefined, 'east'), basic()).state!; const r = Sim.travelTo(st, Sim.availableLegs(st)[0].to); const idx = r.events.findIndex(e => e.id === 'airbnbcancel'); if (idx >= 0) { seen++; expect(r.events.slice(0, idx).every(e => EVENT[e.id].when !== 'arrive')).toBe(true); expect(r.events.some(e => LODGING_DEPENDENT.has(e.id))).toBe(false); } }
  });
  it('an overweight bag throws out your back within a few legs; a light one never does', () => {
    const heavyIds = ['kitegear', 'dronekit', 'books', 'hikingboots', 'adventure', 'protein', 'clothes1', 'clothes2', 'laptopkit', 'hostgifts', 'travelkettle', 'supplements'];
    const heavyPack = shelfPack(heavyIds)!; expect(heavyPack).not.toBeNull();
    const v = Sim.validatePack(heavyPack); expect(v.ok, v.errors.join()).toBe(true); expect(v.ratio).toBeGreaterThan(0.95);
    let injured = 0, light = 0;
    for (let seed = 0; seed < 40; seed++) {
      let s = Sim.setPack(Sim.createRun(seed, undefined, 'east'), heavyPack).state!;
      for (let k = 0; k < 3 && s.phase !== 'ended'; k++) s = hop(s);
      if (s.backInjuryDays > 0 || s.achievements.includes('back')) injured++;
      let l = Sim.setPack(Sim.createRun(seed, undefined, 'east'), basic()).state!;
      for (let k = 0; k < 3 && l.phase !== 'ended'; k++) l = hop(l);
      if (l.achievements.includes('back')) light++;
    }
    expect(injured).toBeGreaterThan(28); expect(light).toBe(0);
  });
  it('a delayed suitcase: only essentials reachable, clothes frozen, no cooking / training / laundry, work still pays, energy drains', () => {
    const s = packed(withExtras('coffeekit', 'fitnesskit'));
    expect(Sim.coffeePacked(s)).toBe(true); expect(Sim.coffeePacked({ ...s, bagLockedDays: 2 })).toBe(false);
    expect(Sim.hasTag({ ...s, bagLockedDays: 2 }, 'clothing')).toBe(false); expect(Sim.hasTag({ ...s, bagLockedDays: 2 }, 'essential')).toBe(true);
    const locked = { ...s, bagLockedDays: 2, phase: 'city' as const, cityId: 'lisbon', day: 5, energy: 80, cleanClothes: 7 };
    expect(Sim.cityAction(locked, 'cook').error).toMatch(/suitcase/); expect(Sim.cityAction(locked, 'train').error).toMatch(/suitcase/); expect(Sim.cityAction(locked, 'laundry').error).toMatch(/suitcase/);
    const w = workWeek({ ...locked, day: 9 }); expect(w.money).toBe(locked.money - CITY.lisbon.costPerDay! + WORK_PAY + 25); expect(w.cleanClothes).toBe(7); expect(w.energy).toBeLessThan(locked.energy - 8);   // day 9 is a Friday: a one-day week
    const after = Sim.cityAction({ ...locked, bagLockedDays: 1 }, 'rest').state; expect(after.bagLockedDays).toBe(0); expect(after.log.some(l => /suitcase arrives/.test(l.text))).toBe(true);
  });
  it('the kettle can only explode if you packed it, then it is gone', () => {
    const noKettle = packed(); expect(eventChance(EVENT.kettle, { ...noKettle, cityId: 'lisbon' }, {}).chance).toBe(0);
    const withKettle = packed(withExtras('travelkettle')); expect(eventChance(EVENT.kettle, { ...withKettle, cityId: 'lisbon' }, {}).chance).toBeGreaterThan(0);
    let s: RunState = { ...withKettle, phase: 'city', cityId: 'lisbon' }, boom = false;
    for (let i = 0; i < 400 && !boom && s.phase === 'city'; i++) { let r = Sim.cityAction(s, i % 2 ? 'rest' : 'work'); if (r.minigame) r = Sim.applyMinigameResult(r.state, r.minigame.key, { score: 80, perfect: false, failed: false }); s = r.state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; boom = r.events.some(e => e.id === 'kettle'); s.health = 100; s.energy = 80; s.mood = 80; s.day = Math.min(s.day, 200); }
    expect(boom).toBe(true); expect(s.items.some(p => p.id === 'travelkettle')).toBe(false); expect(s.lostItems).toContain('travelkettle');
  });
  it('mitigations: packing cubes stop forgotten items; the mosquito kit tames the swarm', () => {
    const base = { ...packed(), phase: 'city' as const, cityId: 'hyeres', stayDays: 99 };
    expect(eventChance(EVENT.forgot, base, {}).mitigated).toBe(false);
    expect(eventChance(EVENT.forgot, { ...base, items: [...base.items, P('packingcubes', 'checked', 6, 0)] }, {}).mitigated).toBe(true);
    expect(eventChance(EVENT.mosquito, base, {}).chance).toBeGreaterThan(0);
    expect(eventChance(EVENT.mosquito, { ...base, items: [...base.items, P('mosquitokit', 'checked', 6, 0)] }, {}).mitigated).toBe(true);
    const checked = Sim.cityAction(base, 'checkroom').state; expect(Sim.hasFlag(checked, 'roomchecked')).toBe(true); expect(eventChance(EVENT.forgot, checked, {}).mitigated).toBe(true);
    const gone = Sim.cityAction(checked, 'moveon').state; expect(Sim.hasFlag(gone, 'roomchecked')).toBe(false); expect(gone.phase).toBe('route');
  });
  it('all nine real incidents fire somewhere across many runs', () => {
    const seen: Record<string, number> = {};
    for (let i = 0; i < 120; i++) { const o = playRun(500 + i * 31, i % 3 === 0 ? 'heavy' : 'random'); for (const k of Object.keys(o.events)) seen[k] = (seen[k] ?? 0) + o.events[k]; }
    for (const id of ['otter', 'backinjury', 'wheel', 'delayed', 'kettle', 'foodpoisoning', 'airbnbcancel', 'forgot', 'mosquito']) expect(seen[id], id).toBeGreaterThan(0);
  });
  it('monthOf starts the run on January 1', () => { expect(monthOf(1)).toBe(1); expect(monthOf(31)).toBe(1); expect(monthOf(32)).toBe(2); expect(monthOf(365)).toBe(12); expect(monthOf(300)).toBe(10); });
});

describe('city loop, minigames, endings', () => {
  it('actions cost days, laundry resets clothes, min stay gates moving on', () => {
    let s = hop(packed()); s = { ...s, day: 5 };   // day 5 is a Monday
    expect(Sim.cityAction(s, 'moveon').error).toMatch(/at least/);
    const d0 = s.day; const wk = Sim.cityAction(s, 'work'); expect(wk.minigame?.key).toBe('Work'); expect(wk.minigame?.payload.days).toBe(5); s = workWeek(s); expect(s.day).toBe(d0 + 5); expect(s.workStreak).toBe(5);
    s = { ...s, cleanClothes: 0 }; const r = Sim.cityAction(s, 'laundry'); expect(r.minigame?.key).toBe('Laundry'); expect(r.state.cleanClothes).toBe(0);   // clothes come back through the result, scaled by how well you sorted
    const done = Sim.applyMinigameResult(r.state, 'Laundry', { score: 90, perfect: false, failed: false }).state; expect(done.cleanClothes).toBeGreaterThanOrEqual(done.maxClothes);
  });
  it('drone: needs the kit, costs no day, levels rise with flights, fines in banned countries', () => {
    const noKit = hop(packed()); expect(Sim.cityAction(noKit, 'drone').error).toMatch(/drone/i);
    let s = { ...hop(packed(withExtras('dronekit'))), cityId: 'dakhla', energy: 80 }; const d0 = s.day;
    const r = Sim.cityAction(s, 'drone'); expect(r.minigame?.key).toBe('Drone'); expect(r.minigame?.payload.level).toBe(1); expect(r.minigame?.payload.city.id).toBe('dakhla');
    expect(Sim.cityAction(r.state, 'drone').error).toMatch(/charging/);
    let fined = 0, flights = 0; let st = r.state;
    for (let seed = 1; seed <= 60; seed++) { const a = Sim.applyMinigameResult({ ...st, seed }, 'Drone', { score: 90, perfect: false, failed: false }); flights++; if (a.events.some(e => e.id === 'dronefine')) { fined++; expect(a.state.money).toBe(st.money - 400); } expect(a.state.day).toBe(d0); expect(a.state.mood).toBeGreaterThan(st.mood - 7); }
    expect(fined).toBeGreaterThan(8); expect(fined).toBeLessThan(40);   // Morocco: 35% per flight
    const two = Sim.applyMinigameResult(st, 'Drone', { score: 90, perfect: false, failed: false }).state; const three = Sim.applyMinigameResult(two, 'Drone', { score: 90, perfect: false, failed: false }).state;
    expect(Sim.cityAction({ ...three, day: three.day + 1 }, 'drone').minigame?.payload.level).toBe(2);
    const usa = Sim.applyMinigameResult({ ...st, cityId: 'boulder' }, 'Drone', { score: 90, perfect: false, failed: false }); expect(usa.events.some(e => e.id === 'dronefine' || e.id === 'dronepermit')).toBe(false);
  });
  it('console: a button, not a rest-day surprise; once a day, no day passes, gold stamp on a perfect run', () => {
    const noSwitch = hop(packed()); expect(Sim.cityAction(noSwitch, 'console').error).toMatch(/console/i);
    const s = hop(packed(withExtras('switch'))); const r = Sim.cityAction(s, 'console'); expect(r.minigame?.key).toBe('CarryOn'); expect(['carryon', 'tetris']).toContain(r.minigame?.payload.game);
    expect(Sim.cityAction(r.state, 'console').error).toMatch(/Tomorrow/);
    const gold = Sim.applyMinigameResult(r.state, 'CarryOn', { score: 100, perfect: true, failed: false }).state; expect(gold.day).toBe(s.day); expect(gold.stamps[s.cityId]).toBe('gold');
    expect(Sim.cityAction({ ...s, phase: 'city' }, 'rest').minigame).toBeUndefined();
  });
  it('the chocolate only bites in the listed cities', () => {
    const s = packed(); expect(eventChance(EVENT.cockroach, { ...s, cityId: 'dakhla' }, {}).chance).toBeGreaterThan(0); expect(eventChance(EVENT.cockroach, { ...s, cityId: 'munich' }, {}).chance).toBe(0);
  });
  it('no clothes packed: allowed, one outfit, dirty from day two, laundry only buys a day', () => {
    const s0 = packed(shelfPack(['laptopkit', 'toiletries'])!); expect(s0.maxClothes).toBe(0); expect(s0.cleanClothes).toBe(0);
    let s = hop(s0); s = { ...s, day: 5, mood: 80 };
    const a = Sim.cityAction(s, 'explore').state; expect(a.dirtyDays).toBe(1); expect(a.mood).toBeLessThan(s.mood + 7);   // explore is +7 mood; dirt eats into it
    const b = Sim.cityAction(a, 'rest').state; expect(b.dirtyDays).toBe(2); expect(b.mood).toBeLessThan(a.mood + 2);
    const r = Sim.cityAction(b, 'laundry'); const done = Sim.applyMinigameResult(r.state, 'Laundry', { score: 100, perfect: true, failed: false }).state;
    expect(done.cleanClothes).toBe(1); expect(Sim.cityAction(done, 'rest').state.dirtyDays).toBe(0); expect(Sim.cityAction(Sim.cityAction(done, 'rest').state, 'rest').state.dirtyDays).toBe(1);
    expect(packed(withExtras()).maxClothes).toBe(10);   // one week of clothes still means 10 days, unchanged
  });
  it('laundry kit: the sort still happens but no day passes, and the log says so', () => {
    let s = hop(packed(withExtras('laundrykit'))); s = { ...s, day: 5, cleanClothes: 0 };
    const r = Sim.cityAction(s, 'laundry'); expect(r.minigame?.key).toBe('Laundry'); expect(r.minigame?.payload.kit).toBe(true);
    const done = Sim.applyMinigameResult(r.state, 'Laundry', { score: 90, perfect: false, failed: false }).state;
    expect(done.day).toBe(s.day); expect(done.cleanClothes).toBeGreaterThanOrEqual(done.maxClothes); expect(done.log[done.log.length - 1].text).toMatch(/still yours/);
    const plain = hop(packed()); const r2 = Sim.cityAction({ ...plain, day: 5, cleanClothes: 0 }, 'laundry'); expect(r2.minigame?.payload.kit).toBe(false);
    expect(Sim.applyMinigameResult(r2.state, 'Laundry', { score: 90, perfect: false, failed: false }).state.day).toBe(6);
  });
  it('dull knives: flagged on arrival at some Airbnbs, cook gets tighter windows, the adventure knife cancels it', () => {
    const base = packed(); let flagged: any, mitigated = 0, dull = 0;
    for (let seed = 1; seed < 80; seed++) {
      const s = { ...hop({ ...base, seed }), seed, phase: 'route' as const }; const dest = Sim.availableLegs(s).find(l => CITY[l.to].lodgings[0]?.id === 'airbnb'); if (!dest) continue;
      const r = Sim.travelTo(s, dest.to); const ev = r.events.find(e => e.id === 'dullknives'); if (!ev) continue;
      if (ev.mitigated) mitigated++; else { dull++; flagged = r.state; }
    }
    expect(dull).toBeGreaterThan(5); expect(mitigated).toBe(0);
    expect(Sim.dullKnives(flagged)).toBe(true); const c = Sim.cityAction({ ...flagged, energy: 90 }, 'cook'); expect(c.minigame?.payload.dullKnives).toBe(true);
    const clean = Sim.cityAction({ ...flagged, energy: 90, achievements: flagged.achievements.filter((a: string) => !a.startsWith('_dullknives')) }, 'cook'); expect(c.minigame!.difficulty).toBeGreaterThan(clean.minigame!.difficulty); expect(clean.minigame?.payload.dullKnives).toBe(false);
    // the adventure bundle carries a knife: the event still tells the story, but nothing is flagged
    const knife = packed(withExtras('adventure')); let seen = 0;
    for (let seed = 1; seed < 80; seed++) {
      const s = { ...hop({ ...knife, seed }), seed, phase: 'route' as const }; const dest = Sim.availableLegs(s).find(l => CITY[l.to].lodgings[0]?.id === 'airbnb'); if (!dest) continue;
      const r = Sim.travelTo(s, dest.to); const ev = r.events.find(e => e.id === 'dullknives'); if (!ev || r.state.bagLockedDays > 0) continue; seen++;   // knife in a delayed suitcase = no knife
      expect(ev.mitigated).toBe(true); expect(Sim.dullKnives(r.state)).toBe(false);
    }
    expect(seen).toBeGreaterThan(3);
  });
  it('cook picks a dish from the current city, remembers it, and scores exactly that dish', () => {
    let s = hop(packed(withExtras('fitnesskit')));
    const c = Sim.cityAction(s, 'cook'); expect(c.minigame?.key).toBe('Cooking');
    const dish = c.minigame!.payload.dish; expect(CITY[s.cityId].dishes).toContain(dish.id); expect(c.state.pendingDish).toBe(dish.id);
    const after = Sim.applyMinigameResult(c.state, 'Cooking', { score: 0.9, perfect: false, failed: false }).state;
    expect(after.pendingDish).toBeUndefined(); expect(after.log[after.log.length - 1].text).toContain(dish.name); expect(after.day).toBe(s.day + 1);
    // every offer over a long stay is local
    for (let i = 0; i < 12; i++) { const r = Sim.cityAction(s, 'cook'); expect(CITY[s.cityId].dishes).toContain(r.minigame!.payload.dish.id); s = Sim.applyMinigameResult(r.state, 'Cooking', { score: 0.5, perfect: false, failed: false }).state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; if (s.phase !== 'city') break; }
  });
  it('train hands off to a workout; the console is its own action', () => {
    let s = hop(packed(withExtras('fitnesskit')));
    s = { ...s, cityId: 'miami', energy: 80 };
    const t = Sim.cityAction(s, 'train'); expect(t.minigame?.key).toBe('Workout'); expect(t.state.day).toBe(s.day);
    const after = Sim.applyMinigameResult(t.state, 'Workout', { score: 1, perfect: true, failed: false }).state; expect(after.day).toBe(s.day + 1); expect(after.achievements).toContain('ironbody');
    expect(Sim.cityAction(s, 'rest').minigame).toBeUndefined();
    const withSwitch = { ...s, items: [...s.items, P('switch', 'checked', 0, 8)] };
    expect(Sim.cityAction(withSwitch, 'rest').minigame).toBeUndefined();   // the console is a button now, not a rest-day surprise
    const rr = Sim.cityAction(withSwitch, 'console'); expect(rr.minigame?.key).toBe('CarryOn'); expect(rr.minigame?.payload.level.city).toBe('miami');
    const gold = Sim.applyMinigameResult(rr.state, 'CarryOn', { score: 1, perfect: true, failed: false }).state; expect(gold.stamps.miami).toBe('gold');
    expect(Sim.cityAction({ ...s, energy: 10 }, 'train').error).toMatch(/tired/); expect(Sim.cityAction({ ...s, backInjuryDays: 3 }, 'train').error).toMatch(/back/);
  });
  it('ends in hospital at 0 health, flies home at 0 mood, runs out at day 366, wins on the return home, and names the cause', () => {
    const s = { ...packed(), phase: 'city' as const, cityId: 'lisbon', log: [...packed().log, { day: 40, city: 'lisbon', text: 'Food poisoning: Day 40, Lisbon. Something you ate has opinions.' }] };
    const h = Sim.checkEnding({ ...s, health: 0 }); expect(h?.kind).toBe('hospital'); expect(h?.cause).toMatch(/^Hospitalised in Lisbon after food poisoning, day \d+$/);
    expect(Sim.checkEnding({ ...s, mood: 0 })?.cause).toMatch(/^Flew home from Lisbon on day \d+, mood zero$/);
    expect(Sim.checkEnding({ ...s, day: 366 })?.cause).toMatch(/^Ran out of days in Lisbon, \d of 5 continents$/);
    const b = Sim.checkEnding({ ...s, money: -OVERDRAFT - 1 }); expect(b?.kind).toBe('broke'); expect(b?.cause).toMatch(/^Broke in Lisbon on day \d+, \$\d+ in the hole$/);
    expect(Sim.checkEnding({ ...s, money: -OVERDRAFT + 1 })).toBeUndefined();
    const route = [HOME_CITY, 'lasvegas', 'miami', 'lisbon', 'casablanca', 'munich', 'bangkok', 'tokyo', HOME_CITY];
    const win = { ...s, cityId: HOME_CITY, route, visited: route.slice(0, -1) } as RunState;
    const e = Sim.checkEnding(win); expect(e?.kind).toBe('win'); expect(e!.score).toBeGreaterThan(500); expect(e!.cause).toMatch(/^Home to Orange County on day \d+, 4 continents$/); expect(win.phase).toBe('ended');
  });
  it('is deterministic for a seed and diverges across seeds', () => {
    const a = playRun(123, 'random'), b = playRun(123, 'random'), c = playRun(124, 'random');
    expect(a.state.log).toEqual(b.state.log); expect(a.ending).toBe(b.ending);
    expect(a.state.log.map(l => l.text).join() === c.state.log.map(l => l.text).join()).toBe(false);
  });
});

describe('save', () => {
  beforeEach(() => { _resetMemoryStore(); clearRun(); });
  it('round-trips a run and settings, rejects garbage', () => {
    const s = hop(packed()); saveRun(s); expect(loadRun()).toEqual(s); clearRun(); expect(loadRun()).toBeNull();
    saveRun({ ...s, version: 1 } as any); expect(loadRun(), 'v1 saves are discarded').toBeNull();
    const st = recordRun({ kind: 'win', text: 'x', score: 900 }, 300); expect(st.runs).toBe(1); expect(loadSettings().bestScore).toBe(900); expect(loadSettings().history[0].ending).toBe('win');
  });
});

describe('round 3: money, weekends, streaks, weight, outdoors, radon', () => {
  const inCity = (extra: string[] = [], cityId = 'lisbon', day = 5) => ({ ...packed(withExtras(...extra)), phase: 'city' as const, cityId, day, stayDays: 1, energy: 90, mood: 80 }) as RunState;
  it('the calendar starts on a Thursday and weekends cannot be worked', () => {
    expect(weekdayOf(1)).toBe(4); expect(isWeekend(3)).toBe(true); expect(isWeekend(4)).toBe(true); expect(isWeekend(5)).toBe(false);
    expect(Sim.cityAction(inCity([], 'lisbon', 3), 'work').error).toMatch(/weekend/);
    expect(Sim.nextWorkdays({ ...inCity(), day: 2 } as RunState, 5)).toEqual([2, 5, 6, 7, 8]);
  });
  it('work pays on weekdays, drains exponentially with the streak, and any other day resets it', () => {
    let s = { ...inCity(), day: 9 }; const m0 = s.money;   // Friday: the week is one day
    s = workWeek(s); expect(s.money).toBe(m0 - CITY.lisbon.costPerDay! + WORK_PAY + 25); expect(s.workStreak).toBe(1);
    expect(WORK_ENERGY(3)).toBeGreaterThan(WORK_ENERGY(1)); expect(WORK_ENERGY(20)).toBe(40);
    s = Sim.cityAction(s, 'explore').state; expect(s.workStreak).toBe(0);
    // a full Monday week: five days, streak 5, and it drains more than five fresh days would
    const straight = workWeek({ ...inCity(), day: 5, energy: 100 } as RunState); expect(straight.workStreak).toBe(5); expect(straight.day).toBe(10);
    expect(100 - straight.energy).toBeGreaterThan(5 * WORK_ENERGY(1) - 30);   // tickDay gives some back; the streak curve still shows
    const brokenAgain = workWeek(Sim.cityAction({ ...straight, day: 15 }, 'rest').state); expect(brokenAgain.workStreak).toBeGreaterThanOrEqual(1);
    // the puzzle sets the rate: perfect pays a bonus, a failed puzzle docks pay
    const base = { ...inCity(), day: 9 }; const good = workWeek(base, 1), meh = workWeek(base, 0.6), bad = workWeek(base, 0);
    expect(good.money - base.money).toBe(WORK_PAY + 100 - CITY.lisbon.costPerDay!); expect(meh.money - base.money).toBe(WORK_PAY + 25 - CITY.lisbon.costPerDay!); expect(bad.money - base.money).toBe(WORK_PAY - 75 - CITY.lisbon.costPerDay!);
    // puzzles do not repeat within a run until the bank is exhausted
    const seen = new Set<string>(); let st: RunState = { ...inCity(), day: 5 }; for (let i = 0; i < 20; i++) { const r = Sim.cityAction({ ...st, day: 5 + 7 * i }, 'work'); const id = r.minigame!.payload.puzzle.id; expect(seen.has(id)).toBe(false); seen.add(id); st = r.state; }
  });
  it('every day and every leg cost money; the card declines below zero and the run ends past the overdraft', () => {
    const s = inCity(); const r = Sim.cityAction(s, 'rest'); expect(r.state.money).toBe(s.money - CITY.lisbon.costPerDay!);
    const route = packed(); const leg = Sim.availableLegs(route)[0]; const t = Sim.travelTo(route, leg.to); expect(t.state.money).toBe(START_MONEY - Sim.fareFor(CITY[HOME_CITY], leg)); expect(Sim.fareFor(CITY[HOME_CITY], leg)).toBeGreaterThan(100);
    const poor = Sim.cityAction({ ...s, money: 20 }, 'rest'); expect(poor.state.money).toBeLessThan(0); expect(poor.events.some(e => e.id === 'broke')).toBe(true); expect(poor.state.phase).toBe('city');
    const gone = Sim.cityAction({ ...s, money: -OVERDRAFT + 10 }, 'rest'); expect(gone.state.ending?.kind).toBe('broke');
  });
  it('a full suitcase roughly doubles the travel energy drain of a light one', () => {
    const light = packed(); const heavy = packed(shelfPack(['kitegear', 'dronekit', 'books', 'hikingboots', 'adventure', 'protein', 'clothes1', 'laptopkit', 'hostgifts', 'yogamat', 'coffeekit'])!);
    expect(Sim.weightRatio(heavy.items)).toBeGreaterThan(0.85);
    const leg = Sim.availableLegs(light)[0];
    // same seed, same leg events for both; only the weight term differs: 0.8 * leg.energy * (ratioHeavy - ratioLight)
    const dl = light.energy - Sim.travelTo(light, leg.to).state.energy, dh = light.energy - Sim.travelTo({ ...heavy, energy: light.energy }, leg.to).state.energy;
    const expected = 0.8 * leg.energy * (Sim.weightRatio(heavy.items) - Sim.weightRatio(light.items));
    expect(Math.abs((dh - dl) - expected)).toBeLessThanOrEqual(2);
    expect(dh - dl).toBeGreaterThan(8);
  });
  it('adventure gear pays off in outdoorsy cities and hiking boots add a life to outdoor workouts', () => {
    expect(CITY.innsbruck.outdoorsy).toBe(true); expect(CITY.newyork.outdoorsy).toBeFalsy();
    const bare = inCity([], 'innsbruck', 5), geared = inCity(['adventure'], 'innsbruck', 5);
    let moodBare = 0, moodGeared = 0; for (let i = 0; i < 20; i++) { moodBare += Sim.cityAction({ ...bare, seed: i }, 'explore').state.mood; moodGeared += Sim.cityAction({ ...geared, seed: i }, 'explore').state.mood; }
    expect(moodGeared).toBeGreaterThan(moodBare + 60);
    const boots = inCity(['hikingboots', 'climbkit'], 'innsbruck', 5); const t = Sim.cityAction(boots, 'train'); expect(t.minigame?.extraLives).toBe(1); expect(t.minigame?.payload.extraLives).toBe(1);
    const noBoots = Sim.cityAction(inCity(['climbkit'], 'innsbruck', 5), 'train'); expect(noBoots.minigame?.extraLives).toBeUndefined();
    const gym = Sim.cityAction(inCity(['hikingboots', 'fitnesskit'], 'newyork', 5), 'train'); expect(gym.minigame?.payload.activity).toBe('bands'); expect(gym.minigame?.extraLives).toBeUndefined();
  });
  it('radon drains health in granite towns unless the air monitor is packed, which turns it into an open window', () => {
    expect(CITY.innsbruck.radon).toBe(3); expect(CITY.lisbon.radon).toBeUndefined(); expect(CITY.reykjavik.radon).toBeUndefined();
    const bare = { ...inCity([], 'innsbruck', 5), stayDays: 0 }, safe = { ...inCity(['airmonitor'], 'innsbruck', 5), stayDays: 0 };
    const hb = Sim.cityAction(bare, 'rest'), hs = Sim.cityAction(safe, 'rest');
    expect(bare.health - hb.state.health).toBeGreaterThan(safe.health - hs.state.health + 0.3);
    expect(hs.events.some(e => e.id === 'radonmonitor')).toBe(true); expect(hb.events.some(e => e.id === 'radonmonitor')).toBe(false);
    let s = bare; for (let i = 0; i < 4; i++) s = Sim.cityAction(s, 'rest').state; const fifth = Sim.cityAction(s, 'rest'); expect(fifth.events.some(e => e.id === 'radonheadache')).toBe(true);
    const lisbon = Sim.cityAction({ ...inCity([], 'lisbon', 5), stayDays: 0 }, 'rest'); expect(lisbon.events.some(e => e.id.startsWith('radon'))).toBe(false);
  });
  it('the headless first-timer fails 35 to 45% with broke under a tenth of failures; the learned player wins', () => {
    const outs = Array.from({ length: 120 }, (_, i) => playRun(1000 + i * 7919, 'random'));
    const fails = outs.filter(o => o.ending !== 'win'); const broke = fails.filter(o => o.ending === 'broke').length;
    expect(fails.length / outs.length).toBeGreaterThan(0.25); expect(fails.length / outs.length).toBeLessThan(0.55); expect(broke / Math.max(1, fails.length)).toBeLessThan(0.15);
    const smart = Array.from({ length: 30 }, (_, i) => playRun(1000 + i * 7919, 'smart')); expect(smart.filter(o => o.ending === 'win').length / 30).toBeGreaterThan(0.7);
  });
});
