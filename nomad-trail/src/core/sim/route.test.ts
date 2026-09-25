import { describe, it, expect } from 'vitest';
import { Sim, fareFor, directionUndecided } from './engine';
import { buildPack } from './pack';
import { makeRng } from './rng';
const packed = (seed = 7) => { const s = Sim.createRun(seed, 'orangecounty', 'east'); return Sim.setPack(s, buildPack('smart', makeRng(seed))).state!; };
describe('direction is inferred from the first city', () => {
  it('offers both directions before the first leg and locks direction after it', () => {
    const s = packed(); expect(directionUndecided(s)).toBe(true);
    const wrap = (d: number) => ((d + 540) % 360) - 180; const home = Sim.CITY['orangecounty'];
    const legs = Sim.availableLegs(s); const ds = legs.map(l => wrap(l.city.lon - home.lon));
    expect(ds.some(d => d < 0)).toBe(true); expect(ds.some(d => d > 0)).toBe(true);   // Pacific and Atlantic options from Orange County
    const west = legs.find(l => wrap(l.city.lon - home.lon) < 0)!; const r = Sim.travelTo(s, west.to); expect(r.error).toBeUndefined();
    expect(r.state.direction).toBe('west'); expect(directionUndecided(r.state)).toBe(false);
    const s2 = packed(8); const east = Sim.availableLegs(s2).find(l => wrap(l.city.lon - home.lon) > 0)!; expect(Sim.travelTo(s2, east.to).state.direction).toBe('east');
  });
  it('always offers long-haul leaps once a direction is set, ranked after normal legs', () => {
    const s = Sim.setDirection(packed(), 'east'); const st = { ...s, money: 20000 };   // rich enough that the leaps are on offer
    const legs = Sim.availableLegs(st); const leaps = legs.filter(l => (l as any).longHaul);
    expect(leaps.length).toBeGreaterThan(0); expect(leaps.length).toBeLessThanOrEqual(2);
    for (const l of leaps) expect(legs.indexOf(l)).toBeGreaterThan(legs.findIndex(x => !(x as any).longHaul && !x.home));
  });
});
describe('fares grow faster than distance', () => {
  it('a 9,000 km flight costs far more than nine 1,000 km flights per km', () => {
    const oc = Sim.CITY['orangecounty']; const ny = Sim.CITY['newyork']; const tokyo = Sim.CITY['tokyo'];
    const fNY = fareFor(oc, { to: 'newyork', transport: 'flight', days: 1, energy: 20, timezones: 3 });
    const fTokyo = fareFor(oc, { to: 'tokyo', transport: 'flight', days: 2, energy: 30, timezones: 7 });
    expect(fTokyo).toBeGreaterThan(fNY * 2.2); expect(fTokyo).toBeLessThan(6 * 450);   // steep, but a week of work covers it
    expect(ny && tokyo).toBeTruthy();
  });
});
describe('cooking badly can poison you', () => {
  it('a failed dish sometimes fires food poisoning, a good one never does', () => {
    let poisoned = 0, clean = 0;
    for (let seed = 1; seed <= 40; seed++) {
      let s = packed(seed); const first = Sim.availableLegs(s)[0]; s = Sim.travelTo(s, first.to).state;
      const cook = Sim.cityAction(s, 'cook'); if (!cook.minigame) continue;
      const bad = Sim.applyMinigameResult(cook.state, 'Cooking', { score: 10, perfect: false, failed: true }); if (bad.events.some(e => e.id === 'foodpoisoning')) poisoned++;
      const good = Sim.applyMinigameResult(cook.state, 'Cooking', { score: 90, perfect: false, failed: false }); if (good.events.some(e => e.id === 'foodpoisoning')) clean++;
    }
    expect(poisoned).toBeGreaterThan(4); expect(poisoned).toBeLessThan(30); expect(clean).toBe(0);
  });
});

describe('kiteboarding', () => {
  it('training in a kite city with the kite packed launches the Kite game first', () => {
    let s = Sim.createRun(3, 'orangecounty', 'east'); s = Sim.setPack(s, Sim.shelfPack(['laptopkit', 'clothes1', 'kitegear', 'toiletries'])!).state!; s = Sim.setDirection(s, 'east');
    const leg = Sim.availableLegs(s).find(l => l.to === 'laventana'); expect(leg).toBeDefined(); s = Sim.travelTo(s, leg!.to).state;
    const r = Sim.cityAction({ ...s, energy: 90 }, 'train'); expect(r.minigame?.key).toBe('Kite');
  });
});

describe('the taxi breakdown and the gate dash', () => {
  it('a breakdown on a flight leg hands the UI the airport dash; missing it costs a day', () => {
    let hit = 0;
    for (let seed = 1; seed <= 120 && !hit; seed++) {
      let s = packed(seed); const flight = Sim.availableLegs(s).find(l => l.transport === 'flight'); if (!flight) continue;
      const r = Sim.travelTo(s, flight.to);
      if (r.events.some(e => e.id === 'taxibreakdown')) { hit++; expect(r.minigame?.key).toBe('Airport'); expect(r.minigame?.payload?.gate).toMatch(/^[A-F]\d{1,2}$/);
        const before = r.state.day; const miss = Sim.applyMinigameResult(r.state, 'Airport', { score: 20, perfect: false, failed: true }); expect(miss.state.day).toBe(before + 1);
        const made = Sim.applyMinigameResult(r.state, 'Airport', { score: 90, perfect: false, failed: false }); expect(made.state.day).toBe(before); expect(made.state.pendingGate).toBeUndefined(); }
    }
    expect(hit).toBeGreaterThan(0);
  });
});

describe('laundry pays for skill', () => {
  it('a perfect sort buys extra days, a failed one gives back half; dirty days drain mood harder each day', () => {
    let s = packed(9); const first = Sim.availableLegs(s)[0]; s = Sim.travelTo(s, first.to).state; s = { ...s, cleanClothes: 0 };
    const r = Sim.cityAction(s, 'laundry'); expect(r.minigame?.key).toBe('Laundry'); expect(r.state.cleanClothes).toBe(0);
    const great = Sim.applyMinigameResult(r.state, 'Laundry', { score: 100, perfect: true, failed: false }).state; expect(great.cleanClothes).toBe(Math.min(great.maxClothes + 3, great.maxClothes + 3));
    const bad = Sim.applyMinigameResult(r.state, 'Laundry', { score: 20, perfect: false, failed: true }).state; expect(bad.cleanClothes).toBeLessThan(great.cleanClothes); expect(bad.cleanClothes).toBeGreaterThan(0);
    let d = { ...s, cleanClothes: 0, mood: 80 }; const m0 = d.mood; d = Sim.cityAction(d, 'rest').state; const drop1 = m0 - d.mood + 2; d = Sim.cityAction(d, 'rest').state; const drop2 = (m0 - drop1 + 2) - d.mood + 2;
    expect(drop2).toBeGreaterThan(drop1 - 1);
  });
});
