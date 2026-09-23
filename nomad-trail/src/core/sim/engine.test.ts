import { describe, it, expect, beforeEach } from 'vitest';
import { Sim, GRID, HOME_PROGRESS_DEG } from './engine';
import { ITEMS, ITEM, CITIES, CITY, EVENTS, EVENT, DISHES, DISH, LEVELS } from './data';
import { saveRun, loadRun, clearRun, _resetMemoryStore, recordRun, loadSettings } from './save';
import { makeRng } from './rng';
import { rollEvents, eventChance, monthOf } from './events';
import { shelfPack, buildPack, playRun } from '../../../sim/policy';
import type { PackedItem, RunState } from '../types';

const P = (id: string, bag: 'checked' | 'backpack', x = 0, y = 0): PackedItem => ({ id, bag, x, y });
const basic = (): PackedItem[] => [P('macbook', 'backpack', 0, 0), P('pixel10', 'backpack', 4, 0), P('tees5', 'checked', 0, 0), P('underwear7', 'checked', 0, 2)];
function packed(items = basic()): RunState { const s = Sim.createRun(42, 'miami', 'east'); const v = Sim.setPack(s, items); expect(v.ok, v.errors.join(';')).toBe(true); return v.state!; }

describe('data integrity', () => {
  it('has the 68 real items and extras with valid footprints', () => {
    expect(ITEMS.filter(i => i.real).length).toBe(68); expect(ITEMS.length).toBeGreaterThan(95);
    for (const it of ITEMS) { expect(it.w).toBeGreaterThan(0); expect(it.h).toBeGreaterThan(0); expect(it.w <= GRID.checked.cols && it.h <= GRID.checked.rows).toBe(true); expect(it.weightLb).toBeGreaterThanOrEqual(0); }
    expect(ITEMS.some(i => i.tags.includes('kettle'))).toBe(true); expect(ITEMS.some(i => i.tags.includes('switch'))).toBe(true);
  });
  it('every leg, dish, event weight, and arcade level points at something real', () => {
    for (const c of CITIES) { for (const l of c.legs) expect(CITY[l.to], `${c.id}->${l.to}`).toBeDefined(); for (const d of c.dishes) expect(DISH[d], d).toBeDefined(); for (const e of Object.keys(c.eventWeights)) expect(EVENT[e], `${c.id} weights ${e}`).toBeDefined(); }
    for (const d of DISHES) expect(CITY[d.city], d.city).toBeDefined();
    for (const l of LEVELS) { expect(CITY[l.city]).toBeDefined(); expect(l.tiles.length).toBe(20); for (const r of l.tiles) expect(r.length).toBe(23); }
    for (const e of EVENTS) if (e.requiresCity) expect(CITY[e.requiresCity]).toBeDefined();
  });
  it('legs are symmetric and Nepal / Iceland legs are seasonal', () => {
    for (const c of CITIES) for (const l of c.legs) expect(CITY[l.to].legs.some(b => b.to === c.id), `${l.to} back to ${c.id}`).toBe(true);
    expect(CITY.kathmandu.legs.find(l => l.to === 'manaslu')!.months).toEqual([10, 11]);
    expect(CITY.highlands.legs.find(l => l.to === 'reykjavik')!.months).toEqual([6, 7, 8, 9]);
  });
  it('the whole graph is connected and circles the globe both ways from both start cities', () => {
    const seen = new Set(['miami']); const q = ['miami'];
    while (q.length) { const c = CITY[q.pop()!]; for (const l of c.legs) if (!seen.has(l.to)) { seen.add(l.to); q.push(l.to); } }
    expect(seen.size).toBe(CITIES.length);
    for (const start of ['miami', 'newyork']) for (const dir of ['east', 'west'] as const) {
      const o = playRun(7, 'smart', { start, direction: dir, skill: 1 });
      expect(o.ending, `${start} ${dir}`).toBe('win'); expect(Sim.progress(o.state)).toBeGreaterThanOrEqual(HOME_PROGRESS_DEG);
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
    expect(Sim.validatePack([P('macbook', 'backpack', 3, 0)]).errors[0]).toMatch(/does not fit/);
    expect(Sim.validatePack([P('macbook', 'backpack', 0, 0), P('galaxytab', 'backpack', 1, 1)]).errors.join()).toMatch(/overlaps/);
    expect(Sim.validatePack([P('pixel10', 'backpack', 0, 0), P('pixel10', 'backpack', 2, 0)]).errors.join()).toMatch(/twice/);
    expect(Sim.validatePack([P('tees5', 'checked')]).errors.join()).toMatch(/essential/);
    const heavy = shelfPack(['kitegear', 'kettlebell', 'hikingboots', 'casein', 'wine', 'books', 'proteintub', 'frenchpress', 'jeans', 'jeans2', 'creatine'], 'checked')!;
    const v = Sim.validatePack([...heavy, P('pixel10', 'backpack')]);
    expect(v.weights.checked).toBeGreaterThan(GRID.checked.maxLb); expect(v.ok).toBe(false); expect(v.errors.join()).toMatch(/Checked bag/);
  });
  it('accepts a valid pack, computes weights and clothes days, moves to the route phase', () => {
    const s = packed(); expect(s.phase).toBe('route'); expect(s.maxClothes).toBe(3 + 5 + 7); expect(s.cleanClothes).toBe(15);
    expect(Sim.bagWeight(s.items, 'backpack')).toBeCloseTo(3.9, 1);
  });
  it('shelf packer output always validates and every generated policy pack is legal', () => {
    for (let i = 0; i < 60; i++) { const rng = makeRng(i); for (const style of ['random', 'heavy', 'smart'] as const) { const v = Sim.validatePack(buildPack(style, rng)); expect(v.ok, `${style} ${i}: ${v.errors.join(';')}`).toBe(true); } }
  });
});

describe('travel and route', () => {
  it('offers only forward legs, never early return, never revisits', () => {
    const s = packed(); const legs = Sim.availableLegs(s);
    expect(legs.length).toBeGreaterThan(1); expect(legs.some(l => l.to === 'miami')).toBe(false);
    for (const l of legs) { const d = ((CITY[l.to].lon - CITY.miami.lon + 540) % 360) - 180; expect(d).toBeGreaterThan(-30); }
    const r = Sim.travelTo(s, legs[0].to); expect(r.error).toBeUndefined(); expect(r.state.phase).toBe('city'); expect(r.state.stamps[legs[0].to]).toBe('plain');
    expect(Sim.availableLegs({ ...r.state, phase: 'route' }).some(l => l.to === 'miami' && !l.home)).toBe(false);
  });
  it('refuses unknown legs and travel outside the route phase', () => {
    const s = packed(); expect(Sim.travelTo(s, 'tokyo').error).toMatch(/no such leg/);
    expect(Sim.travelTo({ ...s, phase: 'city' }, 'lisbon').error).toMatch(/route phase/);
  });
  it('unlocks the flight home only after ~330 degrees of longitude', () => {
    const s = packed(); expect(Sim.homeUnlocked(s)).toBe(false);
    const far = { ...s, route: ['miami', 'lisbon', 'munich', 'bangkok', 'tokyo', 'orangecounty'], visited: ['miami', 'lisbon', 'munich', 'bangkok', 'tokyo', 'orangecounty'], cityId: 'orangecounty' } as RunState;
    expect(Sim.progress(far)).toBeGreaterThan(300); expect(Sim.homeUnlocked(far)).toBe(false);
    const farther = { ...far, route: [...far.route, 'boulder'], cityId: 'boulder' } as RunState; expect(Sim.homeUnlocked(farther)).toBe(true);
    expect(Sim.availableLegs(farther).some(l => l.home)).toBe(true);
  });
  it('tracks fatigue from recent legs and drains energy more when hopping fast', () => {
    let s = packed(); const e0 = s.energy;
    s = Sim.travelTo(s, 'lisbon').state; const afterOne = e0 - s.energy;
    s = { ...s, phase: 'route', stayDays: 99 }; s = Sim.travelTo(s, Sim.availableLegs(s)[0].to).state; expect(s.fatigue).toBe(2); expect(afterOne).toBeGreaterThan(0);
  });
});

describe('events', () => {
  it('the otter only ever fires in Tokyo, once, as a choice with the first-aid option gated by gear', () => {
    const base = packed();
    for (const cid of ['lisbon', 'bangkok', 'seoul', 'miami']) expect(eventChance(EVENT.otter, { ...base, cityId: cid }, {}).chance).toBe(0);
    const tokyo = { ...base, cityId: 'tokyo', phase: 'city' as const, visited: ['miami', 'tokyo'], stamps: { miami: 'plain' as const, tokyo: 'plain' as const } };
    expect(eventChance(EVENT.otter, tokyo, {}).chance).toBeGreaterThan(0);
    let fired = 0, s: RunState = JSON.parse(JSON.stringify(tokyo));
    for (let i = 0; i < 60 && s.phase === 'city'; i++) { const r = Sim.cityAction(s, 'explore'); s = r.state; if (r.events.some(e => e.id === 'otter')) { fired++; const pc = Sim.pendingChoices(s)!; expect(pc.choices.map(c => c.label)).not.toContain('Pet it, clean the cut after'); s = Sim.resolveChoice(s, 'otter', 0).state; } if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; }
    expect(fired).toBe(1); expect(s.achievements).toContain('otter');
    const withKit = { ...tokyo, items: [...tokyo.items, P('firstaid', 'backpack', 0, 3)] } as RunState;
    let s2: RunState = withKit, seenKit = false;
    for (let i = 0; i < 60 && s2.phase === 'city'; i++) { const r = Sim.cityAction(s2, 'explore'); s2 = r.state; if (r.events.some(e => e.id === 'otter')) { seenKit = Sim.pendingChoices(s2)!.choices.some(c => c.requiresTag === 'firstaid'); s2 = Sim.resolveChoice(s2, 'otter', 1).state; expect(s2.achievements).toContain('otter_lived'); break; } if (s2.pendingEvent) s2 = Sim.resolveChoice(s2, s2.pendingEvent, 0).state; }
    expect(seenKit).toBe(true);
  });
  it('an overweight bag throws out your back within a few legs; a light one never does', () => {
    const heavyIds = ['kitegear', 'kettlebell', 'hikingboots', 'casein', 'wine', 'books', 'proteintub', 'frenchpress', 'tees5', 'underwear7'];
    const heavyPack = [...shelfPack(heavyIds, 'checked')!, P('macbook', 'backpack'), P('pixel10', 'backpack', 4, 0)];
    const v = Sim.validatePack(heavyPack); expect(v.ok, v.errors.join()).toBe(true); expect(v.ratio).toBeGreaterThan(0.9);
    let injured = 0, light = 0;
    for (let seed = 0; seed < 40; seed++) {
      let s = Sim.setPack(Sim.createRun(seed, 'miami', 'east'), heavyPack).state!;
      for (let k = 0; k < 3 && s.phase !== 'ended'; k++) { s = Sim.travelTo(s, Sim.availableLegs(s)[0].to).state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state; s = { ...s, phase: 'route' }; }
      if (s.backInjuryDays > 0 || s.achievements.includes('back')) injured++;
      let l = Sim.setPack(Sim.createRun(seed, 'miami', 'east'), basic()).state!;
      for (let k = 0; k < 3; k++) { l = Sim.travelTo(l, Sim.availableLegs(l)[0].to).state; if (l.pendingEvent) l = Sim.resolveChoice(l, l.pendingEvent, 0).state; l = { ...l, phase: 'route' }; }
      if (l.achievements.includes('back')) light++;
    }
    expect(injured).toBeGreaterThan(30); expect(light).toBe(0);
  });
  it('a delayed bag locks checked items: coffee in the suitcase is not coffee', () => {
    const s = packed([...basic(), P('pourigami', 'checked', 4, 0), P('timemore', 'checked', 5, 0), P('gooseneck', 'checked', 6, 0)]);
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
  it('mitigations: packing cubes stop forgotten items; repellent tames the swarm', () => {
    const base = { ...packed(), phase: 'city' as const, cityId: 'hyeres', stayDays: 99 };
    expect(eventChance(EVENT.forgot, base, {}).mitigated).toBe(false);
    expect(eventChance(EVENT.forgot, { ...base, items: [...base.items, P('packingcubes', 'checked', 4, 0)] }, {}).mitigated).toBe(true);
    expect(eventChance(EVENT.mosquito, base, {}).chance).toBeGreaterThan(0);
    expect(eventChance(EVENT.mosquito, { ...base, items: [...base.items, P('repellent', 'checked', 4, 0)] }, {}).mitigated).toBe(true);
    const checked = Sim.cityAction(base, 'checkroom').state; expect(Sim.hasFlag(checked, 'roomchecked')).toBe(true); expect(eventChance(EVENT.forgot, checked, {}).mitigated).toBe(true);
    const gone = Sim.cityAction(checked, 'moveon').state; expect(Sim.hasFlag(gone, 'roomchecked')).toBe(false); expect(gone.phase).toBe('route');
  });
  it('all nine real incidents fire somewhere across many runs', () => {
    const seen: Record<string, number> = {};
    for (let i = 0; i < 120; i++) { const o = playRun(500 + i * 31, i % 3 === 0 ? 'heavy' : 'random'); for (const k of Object.keys(o.events)) seen[k] = (seen[k] ?? 0) + o.events[k]; }
    for (const id of ['otter', 'backinjury', 'wheel', 'delayed', 'kettle', 'foodpoisoning', 'airbnbcancel', 'forgot', 'mosquito']) expect(seen[id], id).toBeGreaterThan(0);
  });
  it('monthOf starts the run on January 1', () => { expect(monthOf(1)).toBe(1); expect(monthOf(31)).toBe(1); expect(monthOf(32)).toBe(2); expect(monthOf(365)).toBe(12); expect(monthOf(300)).toBe(10); });
  it('rollEvents applies at most one choice event at a time', () => {
    const s = { ...packed(), phase: 'city' as const, cityId: 'lisbon' }; const rng = makeRng(3);
    for (let i = 0; i < 50; i++) { const c = JSON.parse(JSON.stringify(s)); const out = rollEvents(c, 'arrive', { lodgingCancel: 0.9 }, rng, 5); expect(out.filter(o => o.pending).length).toBeLessThanOrEqual(1); }
  });
});

describe('city loop, minigames, endings', () => {
  it('actions cost days, laundry resets clothes, min stay gates moving on', () => {
    let s = Sim.travelTo(packed(), 'lisbon').state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state;
    expect(Sim.cityAction(s, 'moveon').error).toMatch(/at least/);
    const d0 = s.day; s = Sim.cityAction(s, 'work').state; expect(s.day).toBe(d0 + 1); expect(s.workStreak).toBe(1);
    s = { ...s, cleanClothes: 0 }; const r = Sim.cityAction(s, 'laundry'); expect(r.minigame?.key).toBe('Laundry'); expect(r.state.cleanClothes).toBe(r.state.maxClothes);
  });
  it('train and cook hand off to minigames and apply results; rest offers Carry-On only with the Switch', () => {
    let s = Sim.travelTo(packed([...basic(), P('bands', 'checked', 4, 0)]), 'lisbon').state; if (s.pendingEvent) s = Sim.resolveChoice(s, s.pendingEvent, 0).state;
    const t = Sim.cityAction(s, 'train'); expect(t.minigame?.key).toBe('Workout'); expect(t.state.day).toBe(s.day);
    const after = Sim.applyMinigameResult(t.state, 'Workout', { score: 1, perfect: true, failed: false }).state; expect(after.day).toBe(s.day + 1); expect(after.achievements).toContain('ironbody');
    const c = Sim.cityAction(s, 'cook'); expect(c.minigame?.key).toBe('Cooking'); expect(c.minigame?.payload.dish.city).toBe('lisbon');
    expect(Sim.cityAction(s, 'rest').minigame).toBeUndefined();
    const withSwitch = { ...s, items: [...s.items, P('switch', 'backpack', 0, 3)] };
    const rr = Sim.cityAction(withSwitch, 'rest'); expect(rr.minigame?.key).toBe('CarryOn'); expect(rr.minigame?.payload.level.city).toBe('lisbon');
    const gold = Sim.applyMinigameResult(rr.state, 'CarryOn', { score: 1, perfect: true, failed: false }).state; expect(gold.stamps.lisbon).toBe('gold');
    expect(Sim.cityAction({ ...s, energy: 10 }, 'train').error).toMatch(/tired/); expect(Sim.cityAction({ ...s, backInjuryDays: 3 }, 'train').error).toMatch(/back/);
  });
  it('ends in hospital at 0 health, flies home at 0 mood, runs out at day 366, and wins on the return home', () => {
    const s = { ...packed(), phase: 'city' as const, cityId: 'lisbon' };
    expect(Sim.checkEnding({ ...s, health: 0 })?.kind).toBe('hospital'); expect(Sim.checkEnding({ ...s, mood: 0 })?.kind).toBe('flewhome'); expect(Sim.checkEnding({ ...s, day: 366 })?.kind).toBe('outofdays');
    const win = { ...s, cityId: 'miami', route: ['miami', 'lisbon', 'munich', 'bangkok', 'tokyo', 'orangecounty', 'lasvegas', 'miami'] } as RunState;
    const e = Sim.checkEnding(win); expect(e?.kind).toBe('win'); expect(e!.score).toBeGreaterThan(500); expect(win.phase).toBe('ended');
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
    const s = Sim.travelTo(packed(), 'lisbon').state; saveRun(s); expect(loadRun()).toEqual(s); clearRun(); expect(loadRun()).toBeNull();
    const st = recordRun({ kind: 'win', text: 'x', score: 900 }, 300); expect(st.runs).toBe(1); expect(loadSettings().bestScore).toBe(900); expect(loadSettings().history[0].ending).toBe('win');
  });
});
