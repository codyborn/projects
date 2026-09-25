// Pure fork generation for Gate Dash (no Phaser: unit-tested). Every fork splits the current gate set into two DISJOINT, COMPLEMENTARY
// sides; exactly one side contains the target gate. Stages: letters A–C | D–F → the letter | the other two → numbers 1–50 | 51–99 →
// the half of that → the three doors across the lanes.
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export interface ForkSide { label: string; letters: string[]; lo: number; hi: number; }
export interface ForkSpec { left: ForkSide; right: ForkSide; /** lane of the side that contains the gate: 0 = left, 2 = right */ correct: 0 | 2; }
export function sideContains(side: ForkSide, letter: string, num: number) { return side.letters.includes(letter) && num >= side.lo && num <= side.hi; }
/** The gate set a stage is splitting (stage 0 splits everything; stage 3 splits the number half that holds the gate). */
export function parentSet(stage: number, letter: string, num: number): ForkSide {
  const li = LETTERS.indexOf(letter); const half = li < 3 ? LETTERS.slice(0, 3) : LETTERS.slice(3);
  if (stage === 0) return { label: 'ALL', letters: LETTERS, lo: 1, hi: 99 };
  if (stage === 1) return { label: 'HALF', letters: half, lo: 1, hi: 99 };
  if (stage === 2) return { label: 'LETTER', letters: [letter], lo: 1, hi: 99 };
  return { label: 'NUMHALF', letters: [letter], lo: num <= 50 ? 1 : 51, hi: num <= 50 ? 50 : 99 };
}
export function genFork(stage: 0 | 1 | 2 | 3, letter: string, num: number, rng: () => number): ForkSpec {
  const li = LETTERS.indexOf(letter); const half = li < 3 ? LETTERS.slice(0, 3) : LETTERS.slice(3); const other = li < 3 ? LETTERS.slice(3) : LETTERS.slice(0, 3);
  let a: ForkSide, b: ForkSide;   // a always contains the gate
  switch (stage) {
    case 0: a = { label: `GATES ${half[0]}–${half[2]}`, letters: half, lo: 1, hi: 99 }; b = { label: `GATES ${other[0]}–${other[2]}`, letters: other, lo: 1, hi: 99 }; break;
    case 1: { const rest = half.filter(x => x !== letter); a = { label: `GATES ${letter}`, letters: [letter], lo: 1, hi: 99 }; b = { label: `GATES ${rest.join(', ')}`, letters: rest, lo: 1, hi: 99 }; break; }
    case 2: { const low = { label: `${letter}1–${letter}50`, letters: [letter], lo: 1, hi: 50 }, high = { label: `${letter}51–${letter}99`, letters: [letter], lo: 51, hi: 99 }; a = num <= 50 ? low : high; b = num <= 50 ? high : low; break; }
    default: { const lo = num <= 50 ? 1 : 51, hi = num <= 50 ? 50 : 99, mid = Math.floor((lo + hi) / 2);
      const low = { label: `${letter}${lo}–${letter}${mid}`, letters: [letter], lo, hi: mid }, high = { label: `${letter}${mid + 1}–${letter}${hi}`, letters: [letter], lo: mid + 1, hi }; a = num <= mid ? low : high; b = num <= mid ? high : low; }
  }
  const correct: 0 | 2 = rng() < 0.5 ? 0 : 2;
  return { left: correct === 0 ? a : b, right: correct === 2 ? a : b, correct };
}
/** The last stage: three distinct gate doors across the lanes (consecutive numbers, step 1 or 2); exactly one is the target. */
export function genDoors(letter: string, num: number, rng: () => number): { doors: string[]; correct: number } {
  let lane = Math.floor(rng() * 3); let step = rng() < 0.5 ? 1 : 2;
  let base = Math.min(Math.max(num - lane * step, 1), 99 - 2 * step); lane = Math.round((num - base) / step);
  if (base + lane * step !== num || lane < 0 || lane > 2) { step = 1; base = Math.min(Math.max(num - 1, 1), 97); lane = num - base; }
  return { doors: [0, 1, 2].map(i => `${letter}${base + i * step}`), correct: lane };
}
