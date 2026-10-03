// Pure data for the workout session (no Phaser imports: safe for node/vitest). Classes read their card word/instruction/duration from META.
import type { ActivityId } from '../../core/types';
export interface MicroMeta { /** the micro-game's own name: the HUD title */ name: string; /** kept for the harness only: nothing displays it since round 10 */ word: string; instr: string; /** one line (<= 32 chars) shown in the HUD strip for the whole game */ hint?: string; durationSec: number; }
export const META: Record<string, MicroMeta> = {
  pushup:      { name: 'Jumping Jacks', word: 'TAP!',      instr: 'Tap when the ring lands on the target.', hint: 'TAP when the rings meet', durationSec: 7 },
  plank:       { name: 'Plank',         word: 'HOLD!',     instr: 'Hold. Drag left/right to keep the marker centred.', hint: 'HOLD - drag left/right', durationSec: 7 },
  curls:       { name: 'Curls',         word: 'SWIPE!',    instr: 'Swipe UP on the side the arrow shows. Before it fades.', hint: 'SWIPE UP on the arrow side', durationSec: 8 },
  burpee:      { name: 'Burpees',       word: 'CHAIN!',    instr: 'Five burpees. Each one is three moves cued on screen: DROP (swipe down), PLANK (hold 0.6 s), JUMP (swipe up). Score = clean moves out of 15.', hint: 'DROP - PLANK - JUMP x5', durationSec: 16 },
  squat:       { name: 'Squats',        word: 'HOLD!',     instr: 'Hold to lower. Let go inside the green band.', hint: 'HOLD - let go in the green', durationSec: 8 },
  sprint:      { name: 'Sprint & Stop', word: 'GO!',       instr: 'Tap fast to sprint. When the whistle flashes: STOP tapping.', hint: 'TAP fast - STOP on the whistle', durationSec: 8 },
  stretch:     { name: 'Stretch',       word: 'EASY!',     instr: 'Drag the slider all the way across. Keep it smooth; a yank costs you ground.', hint: 'DRAG slowly - lifting pauses', durationSec: 8 },
  boulderbeta: { name: 'Boulder Beta',  word: 'MEMORISE!', instr: 'Watch the holds light up. Then tap them back in the same order before your grip runs out. Four problems, each one longer.', hint: 'WATCH, then TAP the holds', durationSec: 20 },
  dyno:        { name: 'Dyno',          word: 'CATCH!',    instr: 'Tap at the top of the swing to catch the next hold.', hint: 'TAP at the top of the swing', durationSec: 8 },
  riverstones: { name: 'River Stones',  word: 'HOP!',      instr: 'Tap when the next stone lights up.', hint: 'TAP when the stone is lit', durationSec: 8 },
  swimbreath:  { name: 'Swim Breathing', word: 'STROKE!',  instr: "Tap LEFT, RIGHT, LEFT... When the bubble appears, DON'T tap: breathe.", hint: 'TAP L, R, L - not on the bubble', durationSec: 8 },
  balance:     { name: 'Balance Board', word: 'STEADY!',   instr: 'Hold LEFT or RIGHT to lean against the gusts. Stay centred.', hint: 'HOLD left/right vs gusts', durationSec: 7 },
  pose:        { name: 'Yoga',          word: 'YOGA!',     instr: 'Scroll the wheel on the right to the pose the shadow shows: Downward Dog, Cobra, Warrior II or Plank. Hold it half a second.', hint: 'SCROLL the wheel - hold it', durationSec: 40 }   /* a proper session, not a cameo: five times the old eight seconds */,
  cityrun:     { name: 'City Run',      word: 'HOP!',      instr: 'Frogger. The whole screen is the D-pad: TAP above, below or to either side of the runner to hop one square. Cross the traffic, rest on the median, reach the coffee shop. Make it across once and the coffee is yours. 3 lives.', hint: 'TAP a side to hop - coffee', durationSec: 28 },
  runner:      { name: 'Trail Run',     word: 'RUN!',      instr: 'TAP to jump the rocks. Press and HOLD to duck under the branches; let go and you jump.', hint: 'TAP jump - HOLD duck', durationSec: 13 },
  woodchop:    { name: 'Wood Chop',     word: 'CHOP!',     instr: 'The axe circles the round. SWIPE DOWN (or tap) when the head is over the green splitting line. Eight rounds; it gets faster.', durationSec: 22 },
  slalom:      { name: 'Slalom',        word: 'CARVE!',   instr: 'HOLD the left or right half of the screen to carve (arrow keys work too). Through the poles on twelve gates. The skis keep their line after you let go, so turn early.', hint: 'HOLD left/right to carve', durationSec: 24 },
  pinnacle:    { name: 'The In Pinn',   word: 'STEADY!',   instr: 'HOLD anywhere to walk. TILT the phone left / right to balance (or tap the halves). When the fog streaks and the arrow appear: STOP. Wind while walking is almost impossible to balance. Reach the end of the ridge. Or fall.', durationSec: 3600 },
};
export const MICRO_IDS = Object.keys(META);
export const POOLS: Partial<Record<ActivityId, string[]>> = {
  bands: ['pushup', 'plank', 'curls', 'burpee', 'squat', 'sprint', 'stretch'],   // hotel room: the seven
  boulder: ['boulderbeta'],   /* the dyno was a different game bolted on the end; bouldering is the beta */
  trailrun: ['runner', 'riverstones'],
  hike: ['sprint', 'stretch', 'riverstones', 'balance'],
  swim: ['swimbreath'],
  yoga: ['balance', 'pose'], surf: ['balance', 'pose'],
  ski: ['slalom'],   /* round 102: the warm layer unlocks skiing, so skiing has to be skiing and not a balance board */
};
/** How many different games a session chains, each played once at normal speed: hotel room and hike play three, everything else one. */
export const SESSION_GAMES: Partial<Record<ActivityId, number>> = { bands: 3, hike: 3 };
export function sessionLen(activity: string) { return SESSION_GAMES[activity as ActivityId] ?? 1; }
/** The Highlands hike (and trail run) is always the Inaccessible Pinnacle traverse: one game, a profile shot first. */
export const PINNACLE_CITIES = new Set(['highlands']);
/** Bozeman: hike, trail run and hotel-room days are an afternoon at the chopping block, one game. */
export const WOODCHOP_CITIES = new Set(['bozeman']);
/** Cities where a run is a Frogger game: cyclists, cabs and buses instead of rocks and branches. */
export const DENSE_CITIES = new Set(['newyork', 'tokyo', 'bangkok', 'hongkong', 'london']);
/** Pick the workout's micro-game(s) for an activity (unknown → hotel room): a shuffle of the pool cut to sessionLen(), seeded by city+day upstream so days differ. */
export function pickSession(activity: string, rng: () => number, city?: string): string[] {
  if (city && PINNACLE_CITIES.has(city) && (activity === 'hike' || activity === 'trailrun')) return ['pinnacle'];
  if (city && WOODCHOP_CITIES.has(city) && (activity === 'hike' || activity === 'trailrun' || activity === 'bands')) return ['woodchop'];
  if (city && DENSE_CITIES.has(city) && (activity === 'trailrun' || activity === 'bands' || !POOLS[activity as ActivityId]) && rng() < 0.8) return ['cityrun'];
  const pool = [...(POOLS[activity as ActivityId] ?? POOLS.bands!)];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.min(sessionLen(POOLS[activity as ActivityId] ? activity : 'bands'), pool.length));
}
export function pickOne(activity: string, rng: () => number, city?: string): string { return pickSession(activity, rng, city)[0]; }
/** mulberry32 */
export function seededRng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
