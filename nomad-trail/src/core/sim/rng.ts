// Seeded RNG (mulberry32) + a hash so every engine call derives its stream from the state (deterministic, save-safe).
export type Rng = { next(): number; int(lo: number, hi: number): number; pick<T>(a: T[]): T; chance(p: number): boolean };
export function hash32(...nums: number[]): number {
  let h = 0x9e3779b9 >>> 0;
  for (const n of nums) { h ^= (n * 0x85ebca6b) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; }
  return (h ^ (h >>> 16)) >>> 0;
}
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), pick: (arr) => arr[Math.floor(next() * arr.length)], chance: (p) => next() < p };
}
