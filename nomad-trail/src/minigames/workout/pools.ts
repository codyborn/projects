// Pure data for the workout session (no Phaser imports: safe for node/vitest). Classes read their card word/instruction/duration from META.
import type { ActivityId } from '../../core/types';
export interface MicroMeta { /** the micro-game's own name: the HUD title */ name: string; word: string; instr: string; durationSec: number; }
export const META: Record<string, MicroMeta> = {
  pushup:      { name: 'Push-ups',      word: 'TAP!',      instr: 'Tap when the ring lands on the target.', durationSec: 7 },
  plank:       { name: 'Plank',         word: 'HOLD!',     instr: 'Hold. Drag left/right to keep the marker centred.', durationSec: 7 },
  jumprope:    { name: 'Jump Rope',     word: 'JUMP!',     instr: 'Tap as the rope passes under your feet.', durationSec: 8 },
  curls:       { name: 'Curls',         word: 'SWIPE!',    instr: 'Swipe UP on the side the arrow shows. Before it fades.', durationSec: 8 },
  burpee:      { name: 'Burpees',       word: 'CHAIN!',    instr: 'Do the move on the big card: TAP, swipe UP, swipe DOWN or HOLD. Four moves; the next one is previewed. The athlete shows you.', durationSec: 8 },
  squat:       { name: 'Squats',        word: 'HOLD!',     instr: 'Hold to lower. Let go inside the green band.', durationSec: 8 },
  sprint:      { name: 'Sprint & Stop', word: 'GO!',       instr: 'Tap fast to sprint. When the whistle flashes: STOP tapping.', durationSec: 8 },
  stretch:     { name: 'Stretch',       word: 'EASY!',     instr: 'Drag the slider all the way across. Slowly. Jerks fail it.', durationSec: 8 },
  boulderbeta: { name: 'Boulder Beta',  word: 'MEMORISE!', instr: 'Watch the holds light up. Then tap them back in the same order before your grip runs out.', durationSec: 9 },
  dyno:        { name: 'Dyno',          word: 'CATCH!',    instr: 'Tap at the top of the swing to catch the next hold.', durationSec: 8 },
  riverstones: { name: 'River Stones',  word: 'HOP!',      instr: 'Tap when the next stone is at its highest.', durationSec: 8 },
  swimbreath:  { name: 'Swim Breathing', word: 'STROKE!',  instr: "Tap LEFT, RIGHT, LEFT... When the bubble appears, DON'T tap: breathe.", durationSec: 8 },
  balance:     { name: 'Balance Board', word: 'STEADY!',   instr: 'Hold LEFT or RIGHT to lean against the gusts. Stay centred.', durationSec: 7 },
  pose:        { name: 'Yoga',          word: 'YOGA!',     instr: 'Scroll the wheel on the right to the pose the shadow shows: Downward Dog, Cobra, Warrior II or Plank. Hold it half a second.', durationSec: 8 },
  cityrun:     { name: 'City Run',      word: 'CROSS!',    instr: 'Tap to run forward a lane. Tap the sides to sidestep. Swipe DOWN to step back. Do not get hit.', durationSec: 9 },
  runner:      { name: 'Trail Run',     word: 'RUN!',      instr: 'TAP to jump the rocks. Press and HOLD to duck under the branches; let go and you jump.', durationSec: 8 },
  pace:        { name: 'Pace',          word: 'PACE!',     instr: 'Hold to walk. Keep the marker in the green band. Too fast and you get dizzy.', durationSec: 8 },
};
export const MICRO_IDS = Object.keys(META);
export const POOLS: Partial<Record<ActivityId, string[]>> = {
  bands: ['pushup', 'plank', 'jumprope', 'curls', 'burpee', 'squat', 'sprint', 'stretch'],   // hotel room: the eight
  boulder: ['boulderbeta', 'dyno'],
  trailrun: ['runner', 'riverstones'],
  hike: ['sprint', 'stretch', 'riverstones', 'pace', 'balance'],
  swim: ['swimbreath'],
  yoga: ['balance', 'pose'], surf: ['balance', 'pose'], ski: ['balance', 'pose'],
};
/** How many different games a session chains, each played once at normal speed: hotel room and hike play three, everything else one. */
export const SESSION_GAMES: Partial<Record<ActivityId, number>> = { bands: 3, hike: 3 };
export function sessionLen(activity: string) { return SESSION_GAMES[activity as ActivityId] ?? 1; }
/** Cities where a run is a Frogger game: cyclists, cabs and buses instead of rocks and branches. */
export const DENSE_CITIES = new Set(['newyork', 'tokyo', 'bangkok', 'hongkong', 'london']);
/** Pick the workout's micro-game(s) for an activity (unknown → hotel room): a shuffle of the pool cut to sessionLen(), seeded by city+day upstream so days differ. */
export function pickSession(activity: string, rng: () => number, city?: string): string[] {
  if (city && DENSE_CITIES.has(city) && (activity === 'trailrun' || activity === 'bands' || !POOLS[activity as ActivityId]) && rng() < 0.8) return ['cityrun'];
  const pool = [...(POOLS[activity as ActivityId] ?? POOLS.bands!)];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(sessionLen(POOLS[activity as ActivityId] ? activity : 'bands'), pool.length));
}
export function pickOne(activity: string, rng: () => number, city?: string): string { return pickSession(activity, rng, city)[0]; }
/** mulberry32 */
export function seededRng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
