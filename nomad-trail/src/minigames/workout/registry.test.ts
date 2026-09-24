import { describe, it, expect } from 'vitest';
import { META, MICRO_IDS, POOLS, pickSession, seededRng, SESSION_LEN } from './pools';
describe('workout micro-game pools', () => {
  it('every pool entry has metadata; every micro has a command word, an instruction and a 4 to 9 s duration', () => {
    for (const [act, ids] of Object.entries(POOLS)) for (const id of ids!) expect(META[id], `${act}:${id}`).toBeDefined();
    for (const id of MICRO_IDS) { const m = META[id]; expect(m.word.endsWith('!')).toBe(true); expect(m.instr.length).toBeGreaterThan(10); expect(m.durationSec).toBeGreaterThanOrEqual(4); expect(m.durationSec).toBeLessThanOrEqual(9); }
    expect(MICRO_IDS.length).toBeGreaterThanOrEqual(15);
  });
  it('a session is 3 distinct micro-games, seeded and repeatable; unknown activities use the hotel-room pool', () => {
    for (const act of [...Object.keys(POOLS), 'bogus']) { const a = pickSession(act, seededRng(42)); const b = pickSession(act, seededRng(42)); expect(a).toEqual(b); expect(new Set(a).size).toBe(a.length); expect(a.length).toBe(Math.min(SESSION_LEN, (POOLS[act as keyof typeof POOLS] ?? POOLS.bands!).length)); }
    expect(pickSession('bogus', seededRng(1)).every(id => POOLS.bands!.includes(id))).toBe(true);
    const seen = new Set([7, 8, 9, 10, 11].map(s => pickSession('bands', seededRng(s)).join())); expect(seen.size).toBeGreaterThan(1);
  });
  it('a full session stays under the 32 s budget at x1.0 (three longest games plus cards, intro and result)', () => {
    const worst = Math.max(...MICRO_IDS.map(id => META[id].durationSec)); expect(worst * 3 + 0.7 * 3 + 1 + 1.5).toBeLessThanOrEqual(32);
  });
});
