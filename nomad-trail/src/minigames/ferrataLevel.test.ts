import { describe, it, expect } from 'vitest';
import { genLedges, validateLedges, horizontalReach, FERRATA } from './ferrataLevel';
describe('ferrata ledges', () => {
  it('bounce apex clears the rise with margin', () => { expect((FERRATA.bounce ** 2) / (2 * FERRATA.gravity)).toBeGreaterThan(FERRATA.rise + 20); });
  it('every seed yields a reachable, staggered, in-bounds column with anchors every 6th ledge', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const ls = genLedges(seed); expect(ls.length).toBe(FERRATA.ledges + 1); expect(validateLedges(ls)).toEqual([]);
      expect(ls.filter(l => l.kind === 'anchor').length).toBeGreaterThanOrEqual(3);
      // staggered: no two consecutive ledges share a centre (a straight bounce must miss at least most of the time)
      let straight = 0; for (let i = 1; i < ls.length; i++) if (Math.abs((ls[i].x + ls[i].w / 2) - (ls[i - 1].x + ls[i - 1].w / 2)) < 20) straight++;
      expect(straight).toBeLessThan(3);
    }
  });
  it('horizontal reach is a sane thumb distance', () => { expect(horizontalReach()).toBeGreaterThan(90); expect(horizontalReach()).toBeLessThan(220); });
});
