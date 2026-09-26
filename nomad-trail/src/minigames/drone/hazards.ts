// Hazard objects for the drone flight. World-anchored (wx) so static things scroll with the landscape; movers add their own drift.
import Phaser from 'phaser';
import type { HazardKind } from './sets';

export interface Hazard {
  kind: HazardKind; wx: number; y: number; t: number; alive: boolean;
  /** solid boxes are collidable; zones (updraft, gust, mist) only push */
  solid: boolean;
  /** kind-specific numbers */ a: number; b: number; c: number; phase: number;
  spr?: Phaser.GameObjects.Sprite;
}

export const MOVER_SPEED: Partial<Record<HazardKind, number>> = { gull: 42, pigeon: 72, eagle: 28, toucan: 55, dust: 14, steam: 22 };
export const ZONES: HazardKind[] = ['updraft', 'gust', 'mist'];
export const STATIC: HazardKind[] = ['kiteline', 'crane', 'laundry', 'cliff', 'cable', 'spray', 'plume', 'geyser'];

/** Create a hazard at world x with the ground top (screen y) under it. rng in [0,1). */
export function makeHazard(kind: HazardKind, wx: number, groundY: number, rng: () => number, level: number): Hazard {
  const h: Hazard = { kind, wx, y: 0, t: 0, alive: true, solid: !ZONES.includes(kind), a: 0, b: 0, c: 0, phase: rng() * 6 };
  switch (kind) {
    case 'gull': h.y = 70 + rng() * 260; h.a = rng() < 0.5 ? 1 : 0; break;                    // a=1: dives at the drone once close
    case 'pigeon': h.y = 90 + rng() * 240; break;
    case 'eagle': h.y = 80 + rng() * 240; break;
    case 'toucan': h.y = 90 + rng() * 240; h.a = 30 + rng() * 40; break;                      // sine amplitude
    case 'steam': h.y = 80 + rng() * 280; break;
    case 'dust': h.y = groundY; h.a = 70 + rng() * 50 + 10 * level; break;                      // column height
    case 'kiteline': h.y = groundY; h.a = 60 + rng() * 90; break;                              // kite altitude (screen y = a)
    case 'crane': h.y = groundY; h.a = 90 + rng() * 60; h.b = rng() < 0.5 ? -1 : 1; break;      // top y, arm side
    case 'laundry': h.y = groundY; h.a = 24 + rng() * 22; break;                               // line height above roof
    case 'cliff': h.y = groundY; h.a = 90 + rng() * 70 + 10 * level; break;                     // column height
    case 'cable': h.y = groundY - 40 - rng() * 60; h.a = 160; h.b = 40 + rng() * 30; h.c = rng(); break;   // span, rise, car position 0..1
    case 'spray': case 'geyser': h.y = groundY; h.a = 90 + rng() * 70; h.b = 2.6 + rng() * 1.2; break;    // plume height, cycle length
    case 'plume': h.y = groundY; h.a = 120 + rng() * 60; break;
    case 'updraft': h.y = 0; h.a = 46; break;
    case 'gust': h.y = 0; h.a = 70; h.b = rng() < 0.5 ? -1 : 1; break;
    case 'mist': h.y = 0; h.a = 80; break;
  }
  return h;
}

/** Is a periodic plume up right now? (spray / geyser) 0 = down, 1 = full */
export function plumeUp(h: Hazard): number {
  const c = (h.t + h.phase) % h.b; const upStart = h.b - 1.1;
  if (c < upStart) return 0; const k = (c - upStart) / 1.1; return k < 0.25 ? k / 0.25 : k > 0.8 ? (1 - k) / 0.2 : 1;
}
/** Warning phase for a geyser (bubbles before it blows) */
export function plumeWarn(h: Hazard): boolean { const c = (h.t + h.phase) % h.b; return c > h.b - 1.9 && c < h.b - 1.1; }

/** Collision boxes (screen space) for a hazard; x is its screen x. */
export function boxes(h: Hazard, x: number): Phaser.Geom.Rectangle[] {
  const R = (bx: number, by: number, w: number, hh: number) => new Phaser.Geom.Rectangle(bx, by, w, hh);
  switch (h.kind) {
    case 'gull': return [R(x - 9, h.y - 4, 18, 8)];
    case 'pigeon': return [0, 1, 2].map(i => R(x + i * 16 - 5, h.y + (i % 2) * 6 - 3, 10, 6));
    case 'eagle': return [R(x - 11, h.y - 4, 22, 9)];
    case 'toucan': return [R(x - 8, h.y - 5, 16, 10)];
    case 'steam': return [R(x - 18, h.y - 9, 36, 18)];
    case 'dust': return [R(x - 8, h.y - h.a, 16, h.a)];
    case 'kiteline': return [R(x - 1, h.a, 3, h.y - h.a), R(x - 8, h.a - 10, 16, 12)];
    case 'crane': return [R(x - 3, h.a, 6, h.y - h.a), R(h.b < 0 ? x - 72 : x, h.a - 3, 72, 5)];
    case 'laundry': return [R(x - 30, h.y - h.a - 1, 60, 3)];
    case 'cliff': return [R(x - 13, h.y - h.a, 26, h.a)];
    case 'cable': { const car = 0.5 + 0.5 * Math.sin(h.t * 0.7 + h.c * 6); const cx = x + car * h.a, cy = h.y - car * h.b; return [R(cx - 6, cy, 12, 10)]; }
    case 'spray': case 'geyser': { const u = plumeUp(h); return u > 0.1 ? [R(x - 7, h.y - h.a * u, 14, h.a * u)] : []; }
    case 'plume': return [R(x - 6 + Math.sin(h.t * 2) * 4, h.y - h.a, 12, h.a)];
    default: return [];
  }
}
/** the diagonal cable itself: y of the line at screen x, or null if x is off the span */
export function cableY(h: Hazard, x: number, sx: number): number | null { const k = (sx - x) / h.a; if (k < 0 || k > 1) return null; return h.y - k * h.b; }
