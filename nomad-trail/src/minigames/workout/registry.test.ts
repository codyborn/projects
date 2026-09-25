import { describe, it, expect } from 'vitest';
import { META, MICRO_IDS, POOLS, DENSE_CITIES, pickSession, pickOne, seededRng, sessionLen, SESSION_GAMES } from './pools';
describe('workout micro-game pools', () => {
  it('every pool entry has metadata; every micro has a name, a command word, an instruction and a 4 to 9 s duration', () => {
    for (const [act, ids] of Object.entries(POOLS)) for (const id of ids!) expect(META[id], `${act}:${id}`).toBeDefined();
    for (const id of MICRO_IDS) { const m = META[id]; expect(m.name.length).toBeGreaterThan(2); expect(m.word.endsWith('!')).toBe(true); expect(m.instr.length).toBeGreaterThan(10); expect(m.durationSec).toBeGreaterThanOrEqual(4); expect(m.durationSec).toBeLessThanOrEqual(9); }
    expect(MICRO_IDS.length).toBeGreaterThanOrEqual(15); expect(META.kettlebell).toBeUndefined(); expect(MICRO_IDS.includes('kettlebell')).toBe(false);
  });
  it('hotel room and hike sessions chain THREE different games; every other activity is one game; unknown activities use the hotel room', () => {
    expect(SESSION_GAMES).toEqual({ bands: 3, hike: 3 }); expect(sessionLen('boulder')).toBe(1); expect(sessionLen('bogus')).toBe(1);
    for (const act of ['bands', 'hike']) { const a = pickSession(act, seededRng(42)); const b = pickSession(act, seededRng(42)); expect(a).toEqual(b); expect(a.length).toBe(3); expect(new Set(a).size).toBe(3); for (const id of a) expect(POOLS[act as 'bands' | 'hike']).toContain(id); }
    for (const act of ['boulder', 'trailrun', 'swim', 'yoga', 'surf', 'ski']) expect(pickSession(act, seededRng(7)).length).toBe(1);
    const bogus = pickSession('bogus', seededRng(1)); expect(bogus.length).toBe(3); for (const id of bogus) expect(POOLS.bands).toContain(id);
    const seen = new Set([7, 8, 9, 10, 11, 12].map(s => pickSession('bands', seededRng(s)).join('>'))); expect(seen.size).toBeGreaterThan(1);   // different days, different combinations
  });
  it('the game matches the real workout', () => {
    expect(POOLS.bands).toEqual(['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'sprint', 'stretch']);
    expect(POOLS.boulder).toEqual(['boulderbeta', 'dyno']); expect(POOLS.trailrun).toEqual(['runner', 'riverstones']); expect(POOLS.hike).toEqual(['sprint', 'stretch', 'riverstones', 'pace', 'balance']);
    expect(POOLS.swim).toEqual(['swimbreath']); for (const a of ['yoga', 'surf', 'ski'] as const) expect(POOLS[a]).toEqual(['balance', 'pose']);
  });
  it('dense cities turn a run into City Run (Frogger); other cities keep the trail runner; the pick is seeded', () => {
    expect(META.cityrun.word).toBe('CROSS!'); expect(META.cityrun.name).toBe('City Run'); expect(DENSE_CITIES.has('newyork')).toBe(true);
    let city = 0, elsewhere = 0; for (let s = 1; s <= 40; s++) { if (pickOne('trailrun', seededRng(s), 'newyork') === 'cityrun') city++; if (pickOne('trailrun', seededRng(s), 'boulder') === 'cityrun') elsewhere++; }
    expect(city).toBeGreaterThan(24); expect(elsewhere).toBe(0);
    expect(pickOne('bands', seededRng(3), 'tokyo')).toBe(pickOne('bands', seededRng(3), 'tokyo'));
  });
  it('three of the longest hotel-room games plus result banners stay under the 36 s session cap', () => {
    const worst = Math.max(...POOLS.bands!.map(id => META[id].durationSec)); expect(worst * 3 + 0.65 * 3 + 1.5).toBeLessThanOrEqual(36);
  });
});
