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
  pose:        { word: 'YOGA!',     instr: 'Scroll the wheel on the right to the pose the shadow shows: Downward Dog, Cobra, Warrior II or Plank. Hold it half a second.', durationSec: 8 },
  cityrun:     { word: 'CROSS!',    instr: 'Tap to run forward a lane. Tap the sides to sidestep. Swipe DOWN to step back. Do not get hit.', durationSec: 9 },
  runner:      { word: 'RUN!',      instr: 'Tap to jump the rocks. Swipe DOWN to duck the branches.', durationSec: 8 },
  pace:        { word: 'PACE!',     instr: 'Hold to walk. Keep the marker in the green band. Too fast and you get dizzy.', durationSec: 8 },
};
export const MICRO_IDS = Object.keys(META);
export const POOLS: Partial<Record<ActivityId, string[]>> = {
  bands: ['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'kettlebell', 'sprint', 'stretch'],   // hotel room
  boulder: ['boulderbeta', 'dyno'],
  trailrun: ['runner', 'riverstones'],
  hike: ['pace', 'riverstones'],
  swim: ['swimbreath'],
  yoga: ['balance', 'pose'], surf: ['balance', 'pose'], ski: ['balance', 'pose'],
};
/** One micro-game per workout; it escalates over ROUNDS rounds instead of chaining different games. */
export const SESSION_LEN = 1;
export const ROUNDS = 3;
export const ROUND_SPEEDS = [1.0, 1.3, 1.6];
/** Pick the workout's micro-game(s) for an activity (unknown → hotel room), shuffled with rng(); seeded by city+day upstream so days differ. */
/** Cities where a run is a Frogger game: cyclists, cabs and buses instead of rocks and branches. */
export const DENSE_CITIES = new Set(['newyork', 'tokyo', 'bangkok', 'hongkong', 'london']);
export function pickSession(activity: string, rng: () => number, city?: string): string[] {
  if (city && DENSE_CITIES.has(city) && (activity === 'trailrun' || activity === 'bands' || !POOLS[activity as ActivityId]) && rng() < 0.8) return ['cityrun'];
  const pool = [...(POOLS[activity as ActivityId] ?? POOLS.bands!)];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(SESSION_LEN, pool.length));
}
export function pickOne(activity: string, rng: () => number, city?: string): string { return pickSession(activity, rng, city)[0]; }
/** mulberry32 */
export function seededRng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
