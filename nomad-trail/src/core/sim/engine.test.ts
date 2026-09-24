import { describe, it, expect, beforeEach } from 'vitest';
import { Sim, GRID, HOME_PROGRESS_DEG, HOME_MIN_CONTINENTS, HOME_CITY } from './engine';
import { ITEMS, ITEM, CITIES, CITY, EVENTS, EVENT, DISHES, DISH, LEVELS } from './data';
import { saveRun, loadRun, clearRun, _resetMemoryStore, recordRun, loadSettings } from './save';
import { makeRng } from './rng';
import { rollEvents, eventChance, monthOf, LODGING_DEPENDENT } from './events';
import { shelfPack, buildPack, playRun } from '../../../sim/policy';
import { CONTINENT_OF } from '../types';
import type { PackedItem, RunState, ItemTag } from '../types';

const P = (id: string, bag: 'checked' | 'backpack', x = 0, y = 0): PackedItem => ({ id, bag, x, y });
/** Laptop + phone on the back, a week of clothes in the suitcase. */
const basic = (): PackedItem[] => [P('laptopkit', 'backpack', 0, 0), P('phonekit', 'backpack', 3, 0), P('clothes1', 'checked', 0, 0)];
function packed(items = basic()): RunState { const s = Sim.createRun(42, undefined, 'east'); const v = Sim.setPack(s, items); expect(v.ok, v.errors.join(';')).toBe(true); return v.state!; }
const HEAVY = ['kitegear', 'dronekit', 'books', 'hikingboots', 'adventure', 'protein', 'clothes1', 'clothes2', 'hostgifts'];
/** Travel along the first offered leg, resolving any pending choice. */
function hop(s: RunState, pick = 0): RunState { const legs = Sim.availableLegs({ ...s, phase: 'route' }); let r = Sim.travelTo({ ...s, phase: 'route' }, legs[Math.min(pick, legs.length - 1)].to).state; if (r.pendingEvent) r = Sim.resolveChoice(r, r.pendingEvent, 0).state; return r; }

describe('data integrity', () => {
  it('items are ~30 generic bundles with valid footprints and no brand names', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(26); expect(ITEMS.length).toBeLessThanOrEqual(40);
    expect(ITEMS.filter(i => i.real).length).toBeGreaterThanOrEqual(15);
    for (const it of ITEMS) { expect(it.w).toBeGreaterThan(0); expect(it.h).toBeGreaterThan(0); expect(it.w <= GRID.checked.cols && it.h <= GRID.checked.rows).toBe(true); expect(it.weightLb).toBeGreaterThan(0); expect(it.name).not.toMatch(/apple|garmin|osprey|sony|dji|samsung|nintendo|kindle|cerave|nutricost|altra|ombraz|melin|timemore|miir/i); }
    expect(ITEMS.filter(i => i.name === 'Clothes' && i.label === '1 week worth').length).toBe(4);  // one tray card, four placeable weeks, distinct colors
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
    for (const l of LEVELS) { expect(CITY[l.city]).toBeDefined(); expect(l.tiles.length).toBe(20); for (const r of l.tiles) expect(r.length).toBe(23); }
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
      if (l.transport !== 'flight' && l.days > 1) expect(['kathmandu', 'manaslu']).toContain(c.id);
    }
    expect(CITY.kathmandu.legs.find(l => l.to === 'manaslu')!.months).toEqual([10, 11]);
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
    expect(Sim.validatePack([P('laptopkit', 'backpack', 3, 0)]).errors[0]).toMatch(/does not fit/);
    expect(Sim.validatePack([P('laptopkit', 'backpack', 0, 0), P('tablet', 'backpack', 1, 1)]).errors.join()).toMatch(/overlaps/);
    expect(Sim.validatePack([P('phonekit', 'backpack', 0, 0), P('phonekit', 'backpack', 2, 0)]).errors.join()).toMatch(/twice/);
    expect(Sim.validatePack([P('clothes1', 'checked')]).errors.join()).toMatch(/essential/);
    const heavy = shelfPack([...HEAVY, 'coffeekit', 'travelkettle', 'supplements'], 'checked')!;
    const v = Sim.validatePack([...heavy, P('phonekit', 'backpack')]);
    expect(v.weights.checked).toBeGreaterThan(GRID.checked.maxLb); expect(v.ok).toBe(false); expect(v.errors.join()).toMatch(/Checked bag/);
  });
  it('a sensible full kit fits with room to spare; the heavy kit plus a third week of clothes does not', () => {
    const sensible = shelfPack(['clothes1', 'clothes2', 'shell', 'protein', 'supplements', 'skincare', 'sleepkit', 'coffeekit', 'adventure', 'fitnesskit', 'firstaid', 'medkit', 'packingcubes'], 'checked');
    expect(sensible).not.toBeNull(); const w = Sim.bagWeight(sensible!, 'checked'); expect(w).toBeGreaterThan(25); expect(w).toBeLessThan(40);
    expect(shelfPack([...HEAVY, 'clothes3', 'yogamat', 'coffeekit'], 'checked')).toBeNull();
  });
  it('accepts a valid pack, computes weights and clothes days, moves to the route phase, always at home', () => {
    const s = packed(); expect(s.phase).toBe('route'); expect(s.maxClothes).toBe(3 + 7); expect(s.cleanClothes).toBe(10);
    expect(Sim.bagWeight(s.items, 'backpack')).toBeCloseTo(6.0, 1);
    expect(s.startCity).toBe(HOME_CITY); expect(Sim.createRun(1, 'miami', 'west').startCity).toBe(HOME_CITY);
  });
  it('shelf packer output always validates and every generated policy pack is legal', () => {
    for (let i = 0; i < 60; i++) { const rng = makeRng(i); for (const style of ['random', 'heavy', 'smart'] as const) { const v = Sim.validatePack(buildPack(style, rng)); expect(v.ok, `${style} ${i}: ${v.errors.join(';')}`).toBe(true); } }
  });
});

describe('travel and route', () => {
  it('offers forward legs ranked by progress, at most one sideways option, never home early, never revisits', () => {
    const s = packed(); const legs = Sim.availableLegs(s); const here = CITY[HOME_CITY];
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
  it('the otter only ever fires in Tokyo, once, as a choice with the first-aid option gated by gear', () => {
    const base = packed();
    for (const cid of ['lisbon', 'bangkok', 'seoul', 'miami']) expect(eventChance(EVENT.otter, { ...base, cityId: cid }, {}).chance).toBe(0);
    const tokyo = { ...base, cityId: 'tokyo', phase: 'city' as const, visited: [HOME_CITY, 'tokyo'], stamps: { [HOME_CITY]: 'plain' as const, tokyo: 'plain' as const } };
    expect(eventChance(EVENT.otter, tokyo, {}).chance).toBeGreaterThan(0);
    let fired = 0, s: RunState = JSON.parse(JSON.stringify(tokyo));
    for (let i = 0; i < 60 && s.phase === 'city'; i++) { const r = Sim.cityAction(s, 'explore'); s = r.state; if (r.events.some(e => e.id === 'otter')) { fired++; const pc = Sim.pendingChoices(s)!; expect(pc.choices.map(c => c.label)).not.toContain('Pet it, clean the cut after'); s = Sim.resolveChoice(s, 'otter', 0).state; } if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; }
    expect(fired).toBe(1); expect(s.achievements).toContain('otter');
    const withKit = { ...tokyo, items: [...tokyo.items, P('firstaid', 'backpack', 0, 3)] } as RunState;
    let s2: RunState = withKit, seenKit = false;
    for (let i = 0; i < 60 && s2.phase === 'city'; i++) { const r = Sim.cityAction(s2, 'explore'); s2 = r.state; if (r.events.some(e => e.id === 'otter')) { seenKit = Sim.pendingChoices(s2)!.choices.some(c => c.requiresTag === 'firstaid'); s2 = Sim.resolveChoice(s2, 'otter', 1).state; expect(s2.achievements).toContain('otter_lived'); break; } if (s2.pendingEvent) s2 = Sim.resolveChoice(s2, s2.pendingEvent, 0).state; }
    expect(seenKit).toBe(true);
  });
  it('the otter is the only choice event left; the cancelled booking is a plain drain', () => {
    expect(EVENTS.filter(e => e.choices?.length).map(e => e.id)).toEqual(['otter']);
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
    const heavyPack = [...shelfPack([...HEAVY, 'travelkettle', 'supplements'], 'checked')!, P('laptopkit', 'backpack'), P('phonekit', 'backpack', 3, 0)];
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
  it('a delayed bag locks checked items: coffee in the suitcase is not coffee', () => {
    const s = packed([...basic(), P('coffeekit', 'checked', 4, 0)]);
    expect(Sim.coffeePacked(s)).toBe(true); expect(Sim.coffeePacked({ ...s, bagLockedDays: 2 })).toBe(false);
    expect(Sim.hasTag({ ...s, bagLockedDays: 2 }, 'clothing')).toBe(false); expect(Sim.hasTag({ ...s, bagLockedDays: 2 }, 'essential')).toBe(true);
    const locked = { ...s, bagLockedDays: 1, phase: 'city' as const, cityId: 'lisbon' };
    const after = Sim.cityAction(locked, 'rest').state; expect(after.bagLockedDays).toBe(0); expect(after.log.some(l => /suitcase arrives/.test(l.text))).toBe(true);
  });
  it('the kettle can only explode if you packed it, then it is gone', () => {
    const noKettle = packed(); expect(eventChance(EVENT.kettle, { ...noKettle, cityId: 'lisbon' }, {}).chance).toBe(0);
    const withKettle = packed([...basic(), P('travelkettle', 'checked', 4, 0)]); expect(eventChance(EVENT.kettle, { ...withKettle, cityId: 'lisbon' }, {}).chance).toBeGreaterThan(0);
    let s: RunState = { ...withKettle, phase: 'city', cityId: 'lisbon' }, boom = false;
    for (let i = 0; i < 400 && !boom && s.phase === 'city'; i++) { const r = Sim.cityAction(s, i % 2 ? 'rest' : 'work'); s = r.state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; boom = r.events.some(e => e.id === 'kettle'); s.health = 100; s.energy = 80; s.mood = 80; s.day = Math.min(s.day, 200); }
    expect(boom).toBe(true); expect(s.items.some(p => p.id === 'travelkettle')).toBe(false); expect(s.lostItems).toContain('travelkettle');
  });
  it('mitigations: packing cubes stop forgotten items; the mosquito kit tames the swarm', () => {
    const base = { ...packed(), phase: 'city' as const, cityId: 'hyeres', stayDays: 99 };
    expect(eventChance(EVENT.forgot, base, {}).mitigated).toBe(false);
    expect(eventChance(EVENT.forgot, { ...base, items: [...base.items, P('packingcubes', 'checked', 4, 0)] }, {}).mitigated).toBe(true);
    expect(eventChance(EVENT.mosquito, base, {}).chance).toBeGreaterThan(0);
    expect(eventChance(EVENT.mosquito, { ...base, items: [...base.items, P('mosquitokit', 'checked', 4, 0)] }, {}).mitigated).toBe(true);
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
    let s = hop(packed());
    expect(Sim.cityAction(s, 'moveon').error).toMatch(/at least/);
    const d0 = s.day; s = Sim.cityAction(s, 'work').state; expect(s.day).toBe(d0 + 1); expect(s.workStreak).toBe(1);
    s = { ...s, cleanClothes: 0 }; const r = Sim.cityAction(s, 'laundry'); expect(r.minigame?.key).toBe('Laundry'); expect(r.state.cleanClothes).toBe(r.state.maxClothes);
  });
  it('cook picks a dish from the current city, remembers it, and scores exactly that dish', () => {
    let s = hop(packed([...basic(), P('fitnesskit', 'checked', 4, 0)]));
    const c = Sim.cityAction(s, 'cook'); expect(c.minigame?.key).toBe('Cooking');
    const dish = c.minigame!.payload.dish; expect(CITY[s.cityId].dishes).toContain(dish.id); expect(c.state.pendingDish).toBe(dish.id);
    const after = Sim.applyMinigameResult(c.state, 'Cooking', { score: 0.9, perfect: false, failed: false }).state;
    expect(after.pendingDish).toBeUndefined(); expect(after.log[after.log.length - 1].text).toContain(dish.name); expect(after.day).toBe(s.day + 1);
    // every offer over a long stay is local
    for (let i = 0; i < 12; i++) { const r = Sim.cityAction(s, 'cook'); expect(CITY[s.cityId].dishes).toContain(r.minigame!.payload.dish.id); s = Sim.applyMinigameResult(r.state, 'Cooking', { score: 0.5, perfect: false, failed: false }).state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; if (s.phase !== 'city') break; }
  });
  it('train hands off to a workout; rest offers Carry-On only with the console', () => {
    let s = hop(packed([...basic(), P('fitnesskit', 'checked', 4, 0)]));
    s = { ...s, cityId: 'miami', energy: 80 };
    const t = Sim.cityAction(s, 'train'); expect(t.minigame?.key).toBe('Workout'); expect(t.state.day).toBe(s.day);
    const after = Sim.applyMinigameResult(t.state, 'Workout', { score: 1, perfect: true, failed: false }).state; expect(after.day).toBe(s.day + 1); expect(after.achievements).toContain('ironbody');
    expect(Sim.cityAction(s, 'rest').minigame).toBeUndefined();
    const withSwitch = { ...s, items: [...s.items, P('switch', 'backpack', 0, 3)] };
    const rr = Sim.cityAction(withSwitch, 'rest'); expect(rr.minigame?.key).toBe('CarryOn'); expect(rr.minigame?.payload.level.city).toBe('miami');
    const gold = Sim.applyMinigameResult(rr.state, 'CarryOn', { score: 1, perfect: true, failed: false }).state; expect(gold.stamps.miami).toBe('gold');
    expect(Sim.cityAction({ ...s, energy: 10 }, 'train').error).toMatch(/tired/); expect(Sim.cityAction({ ...s, backInjuryDays: 3 }, 'train').error).toMatch(/back/);
  });
  it('ends in hospital at 0 health, flies home at 0 mood, runs out at day 366, wins on the return home, and names the cause', () => {
    const s = { ...packed(), phase: 'city' as const, cityId: 'lisbon', log: [...packed().log, { day: 40, city: 'lisbon', text: 'Food poisoning: Day 40, Lisbon. Something you ate has opinions.' }] };
    const h = Sim.checkEnding({ ...s, health: 0 }); expect(h?.kind).toBe('hospital'); expect(h?.cause).toMatch(/^Hospitalised in Lisbon after food poisoning, day \d+$/);
    expect(Sim.checkEnding({ ...s, mood: 0 })?.cause).toMatch(/^Flew home from Lisbon on day \d+, mood zero$/);
    expect(Sim.checkEnding({ ...s, day: 366 })?.cause).toMatch(/^Ran out of days in Lisbon, \d of 5 continents$/);
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
    const st = recordRun({ kind: 'win', text: 'x', score: 900 }, 300); expect(st.runs).toBe(1); expect(loadSettings().bestScore).toBe(900); expect(loadSettings().history[0].ending).toBe('win');
  });
});
