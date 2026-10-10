import { describe, it, expect, beforeEach } from 'vitest';
import { loadSettings, saveSettings, recordDish, recordStamps, recordBadges, _resetMemoryStore } from './save';

/* Round 103: Cody reported that a recipe he had just cooked was missing from the recipe book. The cause was not
   here — recordDish always wrote through to storage — it was that the scene layer cached Settings in the Phaser
   registry and never refreshed it. These tests pin the storage contract the scene layer now reads on every create. */
describe('the career store', () => {
  beforeEach(() => { _resetMemoryStore(); });
  it('a dish cooked now is readable on the next load, and only the best score survives', () => {
    recordDish('tagine', 72);
    expect(loadSettings().career!.dishes.tagine).toBe(72);
    recordDish('tagine', 40); expect(loadSettings().career!.dishes.tagine).toBe(72);   // a worse attempt does not overwrite
    recordDish('tagine', 95); expect(loadSettings().career!.dishes.tagine).toBe(95);
  });
  it('stamps and badges accumulate across runs, and gold beats plain', () => {
    recordStamps({ lisbon: 'plain', tokyo: 'plain' }); recordStamps({ lisbon: 'gold', madrid: 'plain' });
    const c = loadSettings().career!;
    expect(c.stamps).toEqual({ lisbon: 'gold', tokyo: 'plain', madrid: 'plain' });
    recordBadges(['chef', 'gold_lisbon']); recordBadges(['ironbody']);
    expect(Object.keys(loadSettings().career!.badges!).sort()).toEqual(['chef', 'ironbody']);   // gold_* is already a stamp
  });
  it('a write by one path is visible to a reader that loaded earlier', () => {
    const before = loadSettings();            // what a scene used to hold in the registry for the rest of the session
    recordDish('empanadas', 88);
    expect(before.career!.dishes.empanadas).toBeUndefined();   // the stale copy really is stale...
    expect(loadSettings().career!.dishes.empanadas).toBe(88);  // ...so the reader has to load again, which it now does
  });
});
