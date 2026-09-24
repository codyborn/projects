// Pure data for the workout session (no Phaser imports: safe for node/vitest). Classes read their card word/instruction/duration from META.
import type { ActivityId } from '../../core/types';
export interface MicroMeta { word: string; instr: string; durationSec: number; }
export const META: Record<string, MicroMeta> = {
  pushup:      { word: 'TAP!',      instr: 'Tap when the ring lands on the target.', durationSec: 7 },
  plank:       { word: 'HOLD!',     instr: 'Hold. Drag left/right to keep the marker centred.', durationSec: 7 },
  jumprope:    { word: 'JUMP!',     instr: 'Tap as the rope passes under your feet.', durationSec: 8 },
  curls:       { word: 'SWIPE!',    instr: 'Swipe UP on the side the arrow shows. Before it fades.', durationSec: 8 },
  burpee:      { word: 'CHAIN!',    instr: 'Follow the icons: TAP, swipe UP, swipe DOWN, HOLD.', durationSec: 8 },
  squat:       { word: 'HOLD!',     instr: 'Hold to lower. Let go inside the green band.', durationSec: 8 },
  kettlebell:  { word: 'SWIPE!',    instr: 'Swipe UP at the top of each swing.', durationSec: 8 },
  sprint:      { word: 'GO!',       instr: 'Tap fast to sprint. When the whistle flashes: STOP tapping.', durationSec: 8 },
  stretch:     { word: 'EASY!',     instr: 'Drag the slider all the way across. Slowly. Jerks fail it.', durationSec: 8 },
  boulderbeta: { word: 'MEMORISE!', instr: 'Watch the holds light up. Then tap them back in the same order before your grip runs out.', durationSec: 9 },
  dyno:        { word: 'CATCH!',    instr: 'Tap at the top of the swing to catch the next hold.', durationSec: 8 },
  riverstones: { word: 'HOP!',      instr: 'Tap when the next stone is at its highest.', durationSec: 8 },
  swimbreath:  { word: 'STROKE!',   instr: "Tap LEFT, RIGHT, LEFT... When the bubble appears, DON'T tap: breathe.", durationSec: 8 },
  balance:     { word: 'STEADY!',   instr: 'Hold LEFT or RIGHT to lean against the gusts. Stay centred.', durationSec: 7 },
  pose:        { word: 'MATCH!',    instr: 'Drag up/down to rotate the arm until it matches the shadow.', durationSec: 7 },
  runner:      { word: 'RUN!',      instr: 'Tap to jump the rocks. Swipe DOWN to duck the branches.', durationSec: 8 },
  pace:        { word: 'PACE!',     instr: 'Hold to walk. Keep the marker in the green band. Too fast and you get dizzy.', durationSec: 8 },
};
export const MICRO_IDS = Object.keys(META);
export const POOLS: Partial<Record<ActivityId, string[]>> = {
  bands: ['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'kettlebell', 'sprint', 'stretch'],
  boulder: ['boulderbeta', 'dyno', 'kettlebell', 'plank', 'stretch'],
  trailrun: ['runner', 'riverstones', 'sprint'],
  hike: ['riverstones', 'pace', 'balance', 'stretch'],
  swim: ['swimbreath', 'plank', 'stretch'],
  yoga: ['balance', 'pose', 'plank', 'stretch'], surf: ['balance', 'pose', 'plank', 'stretch'], ski: ['balance', 'pose', 'plank', 'stretch'],
};
export const SESSION_LEN = 3;
/** Pick SESSION_LEN distinct micro-game ids for an activity (unknown → bands), shuffled with rng(). */
export function pickSession(activity: string, rng: () => number): string[] {
  const pool = [...(POOLS[activity as ActivityId] ?? POOLS.bands!)];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(SESSION_LEN, pool.length));
}
/** mulberry32 */
export function seededRng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
