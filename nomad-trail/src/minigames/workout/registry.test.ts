import { describe, it, expect } from 'vitest';
import { META, MICRO_IDS, POOLS, pickSession, pickOne, seededRng, SESSION_LEN, ROUNDS } from './pools';
describe('workout micro-game pools', () => {
  it('every pool entry has metadata; every micro has a command word, an instruction and a 4 to 9 s duration', () => {
    for (const [act, ids] of Object.entries(POOLS)) for (const id of ids!) expect(META[id], `${act}:${id}`).toBeDefined();
    for (const id of MICRO_IDS) { const m = META[id]; expect(m.word.endsWith('!')).toBe(true); expect(m.instr.length).toBeGreaterThan(10); expect(m.durationSec).toBeGreaterThanOrEqual(4); expect(m.durationSec).toBeLessThanOrEqual(9); }
    expect(MICRO_IDS.length).toBeGreaterThanOrEqual(15);
  });
  it('a workout is ONE micro-game from the activity pool, seeded and repeatable; unknown activities use the hotel-room pool', () => {
    expect(SESSION_LEN).toBe(1);
    for (const act of [...Object.keys(POOLS), 'bogus']) { const a = pickSession(act, seededRng(42)); const b = pickSession(act, seededRng(42)); expect(a).toEqual(b); expect(a.length).toBe(1); expect(META[a[0]]).toBeDefined(); }
    expect(POOLS.bands!.includes(pickOne('bogus', seededRng(1)))).toBe(true);
    const seen = new Set([7, 8, 9, 10, 11, 12].map(s => pickOne('bands', seededRng(s)))); expect(seen.size).toBeGreaterThan(1);   // different days, different games
  });
  it('the game matches the real workout', () => {
    expect(POOLS.boulder).toEqual(['boulderbeta', 'dyno']); expect(POOLS.trailrun).toEqual(['runner', 'riverstones']); expect(POOLS.hike).toEqual(['pace', 'riverstones']);
    expect(POOLS.swim).toEqual(['swimbreath']); for (const a of ['yoga', 'surf', 'ski'] as const) expect(POOLS[a]).toEqual(['balance', 'pose']);
    for (const id of POOLS.bands!) expect(['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'kettlebell', 'sprint', 'stretch']).toContain(id);
  });
  it('three rounds of the longest game plus cards, intro and result stay under the 32 s budget', () => {
    const worst = Math.max(...MICRO_IDS.map(id => META[id].durationSec)); const play = [1.0, 1.3, 1.6].slice(0, ROUNDS).reduce((a, sp) => a + worst / sp, 0); expect(play + 0.7 + 0.5 * (ROUNDS - 1) + 0.65 * ROUNDS + 1 + 1.5).toBeLessThanOrEqual(30);
  });
});
