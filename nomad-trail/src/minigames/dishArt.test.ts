import { describe, it, expect } from 'vitest';
import dishes from '../data/dishes.json';
import { dishArtSpecs, DISH_ART_IDS, specFor } from './dishArt';
const KINDS = ['chop', 'slice', 'stir', 'flip', 'season', 'pour', 'knead', 'grill', 'dice', 'roll', 'simmer', 'shake', 'fold', 'plate', 'skewer'];
describe('dish art + steps', () => {
  it('every dish has a hand-authored art spec with a vessel and 2 to 5 layers', () => {
    for (const d of dishes as any[]) { const spec = dishArtSpecs[d.art ?? d.id]; expect(spec, d.id).toBeTruthy(); expect(spec.layers.length).toBeGreaterThanOrEqual(2); expect(spec.layers.length).toBeLessThanOrEqual(5); expect(specFor(d.id)).toBe(spec); }
    expect(DISH_ART_IDS.length).toBeGreaterThanOrEqual((dishes as any[]).length);
  });
  it('every dish uses 4 to 5 known step kinds and no two dishes in one city share a sequence', () => {
    const seen = new Map<string, Set<string>>();
    for (const d of dishes as any[]) {
      expect(d.steps.length, d.id).toBeGreaterThanOrEqual(4); expect(d.steps.length, d.id).toBeLessThanOrEqual(5);
      for (const s of d.steps) { expect(KINDS, `${d.id}:${s.kind}`).toContain(s.kind); expect(s.count).toBeGreaterThan(0); }
      const key = d.steps.map((s: any) => s.kind).join('>'); const set = seen.get(d.city) ?? new Set(); expect(set.has(key), `${d.city} duplicate ${key}`).toBe(false); set.add(key); seen.set(d.city, set);
    }
  });
  it('all fifteen step kinds are used by at least one dish', () => {
    const used = new Set((dishes as any[]).flatMap(d => d.steps.map((s: any) => s.kind)));
    for (const k of KINDS) expect(used.has(k), k).toBe(true);
  });
});
