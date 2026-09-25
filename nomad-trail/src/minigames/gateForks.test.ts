import { describe, it, expect } from 'vitest';
import { LETTERS, genFork, genDoors, parentSet, sideContains, type ForkSide } from './gateForks';
import { seededRng } from './workout/pools';
const allGates = LETTERS.flatMap(L => Array.from({ length: 99 }, (_, i) => [L, i + 1] as [string, number]));
const inSide = (s: ForkSide) => allGates.filter(([L, n]) => sideContains(s, L, n)).map(([L, n]) => `${L}${n}`);
describe('gate dash forks', () => {
  it('over 200 seeds the two sides are disjoint, together exactly the parent set, and exactly one side holds the gate', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rng = seededRng(seed); const letter = LETTERS[Math.floor(rng() * 6)]; const num = 1 + Math.floor(rng() * 99);
      for (const stage of [0, 1, 2, 3] as const) {
        const f = genFork(stage, letter, num, rng); const L = new Set(inSide(f.left)), R = new Set(inSide(f.right));
        for (const g of L) expect(R.has(g), `${seed} stage ${stage} overlap ${g}: ${f.left.label} | ${f.right.label}`).toBe(false);
        const parent = new Set(inSide(parentSet(stage, letter, num))); expect(new Set([...L, ...R]), `${seed} stage ${stage} union`).toEqual(parent);
        const holds = [sideContains(f.left, letter, num), sideContains(f.right, letter, num)].filter(Boolean).length; expect(holds, `${seed} stage ${stage} ${letter}${num}`).toBe(1);
        expect(sideContains(f.correct === 0 ? f.left : f.right, letter, num)).toBe(true);
        expect(f.left.label).not.toBe(f.right.label);
      }
      const d = genDoors(letter, num, rng); expect(new Set(d.doors).size).toBe(3); expect(d.doors.filter(x => x === `${letter}${num}`).length).toBe(1); expect(d.doors[d.correct]).toBe(`${letter}${num}`);
    }
  });
  it('labels read as ranges or lists, never a single letter against a range that includes it', () => {
    const f = genFork(1, 'B', 56, () => 0.1); const [one, two] = f.left.letters.length === 1 ? [f.left, f.right] : [f.right, f.left];
    expect(one.label).toBe('GATES B'); expect(two.label).toBe('GATES A, C');
    const f0 = genFork(0, 'B', 56, () => 0.9); expect(f0.right.label).toBe('GATES A–C'); expect(f0.left.label).toBe('GATES D–F');
  });
});
