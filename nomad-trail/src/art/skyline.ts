// Per-city parallax skylines: sky + far + mid + near layers as TileSprites, with animated bits.
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import type { City, Region } from '../core/types';
import { makeCanvas, ditherGradient, R, P, line, circle, rng, seedOf, speckle, Ctx } from './pixel';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Climate = City['climate'];
export interface Skyline {
  container: Phaser.GameObjects.Container; layers: Phaser.GameObjects.TileSprite[]; sky: Phaser.GameObjects.Image;
  horizonY: number; width: number; height: number;
  scroll(dx: number): void; update(dt: number): void; destroy(): void; setTimeOfDay(t: TimeOfDay): void;
}
const SKY: Record<TimeOfDay, number[]> = {
  dawn: [PAL.night2, PAL.dusk0, PAL.dusk2, PAL.sun1, PAL.sun3], day: [PAL.sky0, PAL.sky1, PAL.sky2, PAL.sky3],
  dusk: [PAL.night1, PAL.dusk1, PAL.dusk3, PAL.sun0, PAL.sun2], night: [PAL.night0, PAL.night0, PAL.night1, PAL.night2],
};
const GROUND: Record<TimeOfDay, number> = { dawn: PAL.night0, day: PAL.night1, dusk: PAL.night0, night: PAL.night0 };
const SIL: Record<TimeOfDay, [number, number, number]> = { // far, mid, near silhouette colors
  dawn: [PAL.dusk0, PAL.night2, PAL.night1], day: [PAL.sky1, PAL.night3, PAL.night2], dusk: [PAL.dusk1, PAL.night2, PAL.night1], night: [PAL.night1, PAL.night1, PAL.night0],
};
const WIN: Record<TimeOfDay, number> = { dawn: PAL.sun2, day: PAL.sky3, dusk: PAL.sun2, night: PAL.sun3 };

type Drawer = (ctx: Ctx, w: number, hy: number, layer: 'far' | 'mid' | 'near', c: number, win: number, r: ReturnType<typeof rng>, tod: TimeOfDay) => void;

function mountains(ctx: Ctx, w: number, hy: number, c: number, r: ReturnType<typeof rng>, amp: number, jag: number, snow?: number) {
  let x = 0; const pts: number[] = []; while (x <= w) { pts.push(hy - r.int(amp * 0.3, amp)); x += jag; }
  for (let px = 0; px < w; px++) { const i = Math.floor(px / jag), t = (px % jag) / jag; const y = Math.round(pts[i] * (1 - t) + (pts[Math.min(i + 1, pts.length - 1)]) * t); R(ctx, px, y, 1, hy - y + 2, c); if (snow !== undefined && y < hy - amp * 0.6) R(ctx, px, y, 1, Math.min(3, hy - y), snow); }
}
/** Like mountains(), but snow only caps the highest peaks (capFrac of the amplitude) instead of lining every upper slope. */
function peaks(ctx: Ctx, w: number, hy: number, c: number, r: ReturnType<typeof rng>, amp: number, jag: number, snow: number, capFrac = 0.82) {
  let x = 0; const pts: number[] = []; while (x <= w) { pts.push(hy - r.int(amp * 0.3, amp)); x += jag; }
  for (let px = 0; px < w; px++) { const i = Math.floor(px / jag), t = (px % jag) / jag; const y = Math.round(pts[i] * (1 - t) + (pts[Math.min(i + 1, pts.length - 1)]) * t); R(ctx, px, y, 1, hy - y + 2, c); if (y < hy - amp * capFrac) R(ctx, px, y, 1, Math.min(4, Math.round((hy - amp * capFrac - y) * 0.6) + 1), snow); }
}
function buildings(ctx: Ctx, w: number, hy: number, c: number, win: number, r: ReturnType<typeof rng>, minH: number, maxH: number, minW: number, maxW: number, lit = 0.35) {
  let x = -r.int(0, 8); while (x < w) { const bw = r.int(minW, maxW), bh = r.int(minH, maxH); R(ctx, x, hy - bh, bw, bh + 2, c);
    for (let wy = hy - bh + 3; wy < hy - 2; wy += 4) for (let wx = x + 2; wx < x + bw - 2; wx += 3) if (r.chance(lit)) P(ctx, wx, wy, win);
    if (r.chance(0.3)) R(ctx, x + Math.floor(bw / 2), hy - bh - r.int(3, 9), 1, 9, c); x += bw + r.int(1, 4); }
}
function palms(ctx: Ctx, w: number, hy: number, c: number, r: ReturnType<typeof rng>, n: number) {
  for (let i = 0; i < n; i++) { const x = r.int(4, w - 4), h = r.int(22, 40); for (let y = 0; y < h; y++) P(ctx, x + Math.round(Math.sin(y / 9) * 2), hy - y, c); const top = hy - h;
    for (const [dx, dy] of [[-8, 2], [8, 2], [-6, -3], [6, -3], [0, -5], [-3, 4], [3, 4]]) line(ctx, x, top, x + dx * 1.4, top + dy * 1.4, c); }
}
function dunes(ctx: Ctx, w: number, hy: number, c: number, r: ReturnType<typeof rng>) { let x = 0; while (x < w) { const dw = r.int(60, 120), dh = r.int(10, 26); for (let i = 0; i < dw; i++) { const y = Math.round(Math.sin((i / dw) * Math.PI) * dh); R(ctx, x + i, hy - y, 1, y + 2, c); } x += dw - 10; } }
function trees(ctx: Ctx, w: number, hy: number, c: number, r: ReturnType<typeof rng>, n: number, pine = true) { for (let i = 0; i < n; i++) { const x = r.int(0, w), h = r.int(10, 22); if (pine) for (let y = 0; y < h; y++) { const hw = Math.max(0, Math.round((y / h) * 5)); R(ctx, x - hw, hy - h + y, hw * 2 + 1, 1, c); } else { circle(ctx, x, hy - h, r.int(4, 7), c); R(ctx, x, hy - h, 1, h, c); } } }
function neonSigns(ctx: Ctx, w: number, hy: number, r: ReturnType<typeof rng>, n: number) { const cols = [PAL.neon, PAL.pink, PAL.sun2, PAL.sky2, PAL.red]; for (let i = 0; i < n; i++) { const x = r.int(4, w - 12), y = hy - r.int(20, 70), sw = r.int(4, 10), sh = r.int(6, 16); R(ctx, x, y, sw, sh, r.pick(cols)); R(ctx, x + 1, y + 1, sw - 2, sh - 2, PAL.night1); for (let k = 0; k < 3; k++) P(ctx, x + 2, y + 2 + k * 3, r.pick(cols)); } }
function flags(ctx: Ctx, w: number, hy: number, r: ReturnType<typeof rng>) { const cols = [PAL.sky1, PAL.white, PAL.red, PAL.grass2, PAL.sun2]; for (let s = 0; s < 3; s++) { const y0 = hy - r.int(50, 90), x0 = r.int(0, 40), x1 = x0 + r.int(120, 220); for (let x = x0; x < x1; x += 7) { const y = Math.round(y0 + Math.sin((x - x0) / (x1 - x0) * Math.PI) * 14); line(ctx, x, y, x + 6, y + 1, PAL.gray0); R(ctx, x + 1, y + 1, 4, 5, cols[(x / 7 | 0) % 5]); } } }
function water(ctx: Ctx, w: number, y: number, h: number, tod: TimeOfDay, r: ReturnType<typeof rng>) { const cs = tod === 'night' ? [PAL.night1, PAL.night2] : tod === 'day' ? [PAL.sea1, PAL.sea2] : [PAL.sea0, PAL.dusk2]; R(ctx, 0, y, w, h, cs[0]); for (let i = 0; i < w * h / 14; i++) R(ctx, r.int(0, w), y + r.int(0, h - 1), r.int(2, 6), 1, cs[1]); }

/** Cities that paint their own ground in the near layer (ocean to the bottom, resort tiles). */
const NO_GROUND = new Set(['orangecounty', 'roatan']);
/** Blocky 3x5 letters for signs. */
const GLYPH3: Record<string, string[]> = { L: ['100','100','100','100','111'], A: ['010','101','111','101','101'], S: ['111','100','111','001','111'], V: ['101','101','101','101','010'], E: ['111','100','110','100','111'], G: ['111','100','101','101','111'], ' ': ['000','000','000','000','000'] };
function signText(ctx: Ctx, x: number, y: number, txt: string, c: number, sc = 1) { let cx = x; for (const ch of txt) { const g = GLYPH3[ch] ?? GLYPH3[' ']; for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (g[r][k] === '1') R(ctx, cx + k * sc, y + r * sc, sc, sc, c); cx += 4 * sc; } }
function joshuaTree(ctx: Ctx, x: number, base: number, h: number, c: number, r: ReturnType<typeof rng>) {
  R(ctx, x - 2, base - h, 5, h, c);                                                    // thick trunk
  const spikeBall = (bx: number, by: number, rad: number) => { circle(ctx, bx, by, 3, c); for (let a = 0; a < 16; a++) { const ang = (a / 16) * Math.PI * 2 + r.next() * 0.2; const len = rad + r.int(-2, 2); const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len; line(ctx, bx, by, ex, ey, c); line(ctx, bx + 1, by, ex + 1, ey, c); } };
  const nb = r.int(2, 4); for (let b = 0; b < nb; b++) { const dir = b % 2 ? 1 : -1; const y0 = base - h + r.int(2, Math.max(3, h / 2)); const ex = x + dir * r.int(8, 16), ey = y0 - r.int(6, 14); line(ctx, x, y0, ex, ey, c); line(ctx, x + 1, y0, ex + 1, ey, c); line(ctx, x, y0 + 1, ex, ey + 1, c); spikeBall(ex, ey - 2, r.int(7, 10)); }
  spikeBall(x, base - h - 3, r.int(8, 11));                                             // crown
}
/** Kites over the water: wide arcs, two thin lines converging on a rider standing at waterTop. */
function kites(ctx: Ctx, w: number, waterTop: number, r: ReturnType<typeof rng>, n: number) {
  for (let i = 0; i < n; i++) { const x = r.int(20, w - 20), y = waterTop - r.int(36, 90), kw = r.int(20, 26), col = r.pick([PAL.red, PAL.sun2, PAL.neon, PAL.pink]);
    for (let k = 0; k <= kw; k++) { const dy = Math.pow(k - kw / 2, 2) / (kw * 0.9); R(ctx, x - kw / 2 + k, y + dy, 1, 3, col); }
    const rx = x + r.int(-6, 6), ry = waterTop - 1; line(ctx, x - kw / 2 + 2, y + kw / 4, rx, ry, PAL.gray1); line(ctx, x + kw / 2 - 2, y + kw / 4, rx, ry, PAL.gray1); R(ctx, rx - 1, ry - 4, 2, 4, PAL.ink); }
}
/** A gothic facade: stepped ornate gable, pointed-arch windows, a spire with a finial. */
function gothic(ctx: Ctx, x: number, hy: number, bw: number, bh: number, c: number, win: number, spire = true) {
  R(ctx, x, hy - bh, bw, bh + 2, c);
  for (let s = 0; s < 6; s++) R(ctx, x + s * Math.floor(bw / 12), hy - bh - 3 - s * 3, bw - s * Math.floor(bw / 6), 3, c);   // stepped gable
  if (spire) { const sx = x + Math.floor(bw / 2); for (let y = 0; y < 26; y++) R(ctx, sx - Math.round((26 - y) / 6), hy - bh - 18 - y, Math.round((26 - y) / 3) + 1, 1, c); P(ctx, sx, hy - bh - 46, PAL.sun2, 1, 3); }
  for (let wy = hy - bh + 6; wy < hy - 6; wy += 9) for (let wx = x + 3; wx < x + bw - 4; wx += 6) { R(ctx, wx, wy + 2, 3, 5, win); P(ctx, wx + 1, wy + 1, win); }   // pointed arches
  R(ctx, x + Math.floor(bw / 2) - 2, hy - 8, 5, 8, PAL.ink); P(ctx, x + Math.floor(bw / 2), hy - 9, PAL.ink);                 // door
}
/** Forest canopy: layered rounded clumps along a hill line. */
function canopy(ctx: Ctx, w: number, hy: number, r: ReturnType<typeof rng>, amp: number, cols: number[]) {
  for (let pass = 0; pass < cols.length; pass++) for (let x = -6; x < w + 6; x += r.int(6, 10)) { const y = hy - r.int(2, amp) + pass * 4; circle(ctx, x, y, r.int(5, 8), cols[pass]); }
}
/** Small birds: two-stroke chevrons. */
function birds(ctx: Ctx, w: number, y0: number, r: ReturnType<typeof rng>, n: number, c: number) { for (let i = 0; i < n; i++) { const x = r.int(10, w - 10), y = y0 - r.int(0, 30); line(ctx, x - 3, y - 2, x, y, c); line(ctx, x, y, x + 3, y - 2, c); } }
function loungeChair(ctx: Ctx, x: number, y: number, stripe: number) { R(ctx, x, y + 8, 26, 2, PAL.gray0); R(ctx, x + 2, y + 10, 2, 4, PAL.gray0); R(ctx, x + 22, y + 10, 2, 4, PAL.gray0); for (let i = 0; i < 16; i += 2) R(ctx, x + 4 + i, y + 4, 2, 4, i % 4 ? PAL.white : stripe); for (let i = 0; i < 8; i++) R(ctx, x + 18 + i, y + 4 - i, 2, 2, i % 2 ? PAL.white : stripe); }

const CITY: Record<string, Drawer> = {
  tokyo: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 40, 110, 8, 18, 0.5);
    else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 30, 80, 10, 22, 0.5); neonSigns(ctx, w, hy, r, 12);
      // Godzilla, Shinjuku-style: head and shoulders peeking over a rooftop in the mid layer
      const gx = Math.floor(w * 0.24), gt = hy - 58; R(ctx, gx - 22, gt + 10, 44, 60, c); for (let wy = gt + 14; wy < hy; wy += 4) for (let wx = gx - 20; wx < gx + 20; wx += 3) if (r.chance(0.4)) P(ctx, wx, wy, win);   // the building he is behind
      R(ctx, gx - 14, gt - 6, 28, 16, PAL.ink); R(ctx, gx - 6, gt - 18, 16, 14, PAL.ink); R(ctx, gx + 8, gt - 14, 8, 6, PAL.ink);   // shoulders, head, snout
      for (let i = 0; i < 4; i++) { const sy = gt - 16 + i * 6; for (let k = 0; k < 5; k++) R(ctx, gx - 10 - k, sy + k, 1, 5 - k, PAL.ink); }   // back spines
      P(ctx, gx + 4, gt - 13, PAL.sun2, 2, 2);
      // the Yamanote-style train on an elevated track
      const ty = hy - 46; R(ctx, 0, ty + 8, w, 3, c); for (let x = 12; x < w; x += 40) R(ctx, x, ty + 11, 4, hy - ty - 11, c);
      for (let seg = 0; seg < 4; seg++) { const tx = 20 + seg * 26; R(ctx, tx, ty - 2, 24, 10, PAL.gray2); R(ctx, tx, ty + 4, 24, 2, PAL.grass1); for (let k = 2; k < 22; k += 5) R(ctx, tx + k, ty, 3, 3, win); }
    } else { buildings(ctx, w, hy, c, win, r, 10, 34, 14, 30, 0.3); neonSigns(ctx, w, hy, r, 8); } },
  innsbruck: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 120, 26, PAL.white); else if (L === 'mid') { mountains(ctx, w, hy, c, r, 60, 40); trees(ctx, w, hy, c, r, 30); } else { buildings(ctx, w, hy, c, win, r, 14, 30, 12, 22, 0.4); const x = Math.floor(w * 0.3); R(ctx, x, hy - 60, 8, 60, c); circle(ctx, x + 4, hy - 64, 6, c); R(ctx, x + 3, hy - 74, 2, 6, c); P(ctx, x + 2, hy - 50, win); P(ctx, x + 5, hy - 50, win); } },
  dakhla: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') dunes(ctx, w, hy, c, r); else if (L === 'mid') { water(ctx, w, hy - 14, 14, tod, r); kites(ctx, w, hy - 14, r, 8); } else dunes(ctx, w, hy + 6, c, r); },
  lisbon: (ctx, w, hy, L, c, win, r) => { if (L === 'far') { buildings(ctx, w, hy, c, win, r, 20, 60, 8, 16, 0.3); const x = Math.floor(w * 0.15); R(ctx, x, hy - 90, 6, 90, c); R(ctx, x + 40, hy - 90, 6, 90, c); line(ctx, x - 40, hy - 70, x, hy - 88, c); line(ctx, x + 6, hy - 88, x + 40, hy - 88, c); line(ctx, x + 46, hy - 88, x + 90, hy - 70, c); } else if (L === 'mid') { for (let x = 0; x < w; x += 18) { const h = 20 + Math.round(Math.sin(x / 50) * 12); R(ctx, x, hy - h, 17, h + 2, c); R(ctx, x, hy - h - 3, 17, 3, PAL.sun0); for (let wy = hy - h + 4; wy < hy - 2; wy += 5) P(ctx, x + 6, wy, win); } } else { line(ctx, 0, hy - 30, w, hy - 30, c); for (let x = 0; x < w; x += 40) R(ctx, x, hy - 32, 1, 32, c); R(ctx, 120, hy - 16, 40, 14, PAL.sun2); R(ctx, 122, hy - 14, 36, 5, PAL.sky2); R(ctx, 126, hy - 2, 6, 3, c); R(ctx, 148, hy - 2, 6, 3, c); } },
  bangkok: (ctx, w, hy, L, c, win, r) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 40, 100, 10, 20, 0.45);
    else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 14, 40, 10, 22, 0.4);
      // the wat: red hall with three tiers of gold roof, upturned eaves and finials, a bell-shaped chedi beside it
      const x = Math.floor(w * 0.3); R(ctx, x - 26, hy - 26, 52, 28, PAL.red); for (let k = 0; k < 5; k++) R(ctx, x - 22 + k * 10, hy - 22, 4, 22, PAL.sun2);
      for (let t = 0; t < 3; t++) { const y = hy - 26 - t * 11, hw = 30 - t * 7; for (let k = 0; k < 9; k++) R(ctx, x - hw + k, y - 9 + k, hw * 2 - k * 2, 1, PAL.sun2); R(ctx, x - hw - 2, y - 3, 3, 5, PAL.sun2); R(ctx, x + hw - 1, y - 3, 3, 5, PAL.sun2); }
      R(ctx, x - 1, hy - 66, 3, 8, PAL.sun2); P(ctx, x, hy - 68, PAL.sun3, 1, 2);
      const cx2 = x + 52; R(ctx, cx2 - 10, hy - 12, 20, 14, PAL.sun2); circle(ctx, cx2, hy - 18, 10, PAL.sun2); for (let y = 0; y < 30; y++) R(ctx, cx2 - Math.round((30 - y) / 5), hy - 28 - y, Math.round((30 - y) / 2.5) + 1, 1, PAL.sun2); P(ctx, cx2, hy - 60, PAL.sun3, 1, 3);
    } else { buildings(ctx, w, hy, c, win, r, 8, 24, 12, 26, 0.3); for (let i = 0; i < 4; i++) { const x = r.int(0, w); R(ctx, x, hy - 8, 10, 6, r.pick([PAL.sun2, PAL.pink, PAL.neon])); } } },
  hyeres: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 40, 50); } else if (L === 'mid') { water(ctx, w, hy - 12, 12, tod, r); kites(ctx, w, hy - 12, r, 5); buildings(ctx, w, hy - 12, c, win, r, 10, 24, 12, 24, 0.3); } else palms(ctx, w, hy + 4, c, r, 7); },
  patagonia: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') {
      mountains(ctx, w, hy, c, r, 60, 40);
      // granite towers: a cluster of broad-based spires with white tips, plus a second cluster a half-wrap later
      for (const base of [w * 0.28, w * 0.78]) for (let i = 0; i < 5; i++) { const x = Math.round(base + (i - 2) * 26 + r.int(-6, 6)), th = r.int(80, 140) - Math.abs(i - 2) * 14, bw = r.int(22, 34);
        for (let y = 0; y < th; y++) { const hw = Math.max(1, Math.round(bw * 0.5 * (1 - Math.pow(y / th, 1.6)))); R(ctx, x - hw, hy - y, hw * 2, 1, c); if (y > th - 18) R(ctx, x - Math.max(1, hw - 1), hy - y, Math.max(1, hw * 2 - 2), 1, PAL.white); } }
      for (let i = 0; i < 6; i++) { const x = r.int(0, w - 40), y = hy - r.int(150, 200); R(ctx, x, y, r.int(14, 34), 1, PAL.gray2); }
    } else if (L === 'mid') { water(ctx, w, hy - 22, 22, tod, r); mountains(ctx, w, hy - 22, c, r, 26, 34);   // the glacier lake and its moraine
      for (let i = 0; i < 8; i++) { const x = r.int(0, w), h = r.int(14, 24); for (let y = 0; y < h; y++) P(ctx, x + Math.round(y * y / 60), hy - 22 - y, c); for (let k = 0; k < 4; k++) line(ctx, x + Math.round(h * h / 60), hy - 22 - h, x + Math.round(h * h / 60) + 6 + k * 3, hy - 22 - h + 2 + k, c); }   // wind-bent lenga
    } else { R(ctx, 0, hy - 4, w, 6, c); for (let i = 0; i < 70; i++) { const x = r.int(0, w), h = r.int(3, 9); line(ctx, x, hy - 2, x + 3, hy - 2 - h, c); } } },
  miami: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 50, 120, 10, 18, 0.5); else if (L === 'mid') { water(ctx, w, hy - 20, 20, tod, r); line(ctx, 0, hy - 24, w, hy - 24, c); for (let x = 0; x < w; x += 30) R(ctx, x, hy - 24, 3, 6, c); neonSigns(ctx, w, hy - 30, r, 5); } else palms(ctx, w, hy + 4, c, r, 6); },
  newyork: (ctx, w, hy, L, c, win, r) => { if (L === 'far') { buildings(ctx, w, hy, c, win, r, 80, 160, 8, 16, 0.55); const x = Math.floor(w / 2); R(ctx, x, hy - 190, 10, 190, c); R(ctx, x + 4, hy - 205, 2, 15, c); } else if (L === 'mid') buildings(ctx, w, hy, c, win, r, 40, 100, 12, 22, 0.5); else { buildings(ctx, w, hy, c, win, r, 12, 30, 16, 30, 0.35); for (let x = 0; x < w; x += 6) P(ctx, x, hy - 2, PAL.sun2); } },
  boulder: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 90, 40, PAL.white);
    else if (L === 'mid') { mountains(ctx, w, hy, c, r, 34, 60);                                                        // foothills the slabs rise from
      for (let i = 0; i < 4; i++) { const bx = 40 + i * 88, sh = 58 - i * 5, lean = 0.42;                                    // Flatirons: broad tilted slabs leaning right, sunlit face on the left edge
        for (let y = 0; y < sh; y++) { const t = y / sh; const x0 = Math.round(bx + (sh - y) * lean), wdt = Math.round(14 + t * 26); R(ctx, x0, hy - sh + y, wdt, 1, c); R(ctx, x0, hy - sh + y, Math.max(2, Math.round(wdt * 0.3)), 1, PAL.gray1); } } }
    else { trees(ctx, w, hy, c, r, 24); R(ctx, 0, hy - 2, w, 4, c); } },
  montana: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 50, 60, PAL.white);
    else if (L === 'mid') { R(ctx, 0, hy - 3, w, 5, c); const x = Math.floor(w * 0.275), cw = 44, ch = 26;
      R(ctx, x, hy - ch, cw, ch, PAL.earth1); for (let ly = hy - ch + 2; ly < hy; ly += 3) R(ctx, x, ly, cw, 1, PAL.earth0);              // log walls
      R(ctx, x - 1, hy - ch, 1, ch, PAL.ink); R(ctx, x + cw, hy - ch, 1, ch, PAL.ink);
      for (let i = 0; i < 14; i++) { const half = Math.round(i * 1.9) + 2; R(ctx, x + cw / 2 - half, hy - ch - 14 + i, half * 2, 1, i === 0 || i === 13 ? PAL.ink : PAL.earth0); }   // peaked roof, apex up
      R(ctx, x + cw - 12, hy - ch - 10, 4, 12, PAL.gray0); R(ctx, x + 6, hy - ch + 8, 8, 7, win); R(ctx, x + cw / 2 - 3, hy - 10, 6, 10, PAL.earth0);   // chimney, lit window, door
      for (let i = 0; i < 10; i++) { let tx = r.int(0, w); if (tx > x - 14 && tx < x + cw + 14) tx = (tx + cw + 40) % w; const h = r.int(10, 22); for (let y = 0; y < h; y++) { const hw = Math.max(0, Math.round((y / h) * 5)); R(ctx, tx - hw, hy - h + y, hw * 2 + 1, 1, c); } } }   // pines, never in front of the cabin
    else { for (let x = 0; x < w; x += 20) { R(ctx, x, hy - 10, 1, 10, c); line(ctx, x, hy - 8, x + 20, hy - 8, c); line(ctx, x, hy - 4, x + 20, hy - 4, c); } } },
  lapaz: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') mountains(ctx, w, hy, c, r, 30, 90); else if (L === 'mid') { water(ctx, w, hy - 30, 30, tod, r);
      const tx = r.int(80, w - 80), ty = hy - 34; for (let k = 0; k < 6; k++) R(ctx, tx - 2, ty - k * 2, 4, 2, PAL.night3); R(ctx, tx - 10, ty - 14, 8, 3, PAL.night3); R(ctx, tx + 2, ty - 14, 8, 3, PAL.night3); R(ctx, tx - 13, ty - 16, 5, 2, PAL.night3); R(ctx, tx + 8, ty - 16, 5, 2, PAL.night3);   // whale tail
      for (let i = 0; i < 3; i++) { const bx = r.int(10, w - 30); R(ctx, bx, hy - 33, 18, 4, PAL.white); R(ctx, bx + 2, hy - 35, 14, 2, PAL.sky0); } }   // pangas
    else { R(ctx, 0, hy - 6, w, 8, PAL.earth3); palms(ctx, w, hy, c, r, 2);
      for (const base of [w * 0.34, w * 0.34 + w / 2]) for (let i = 0; i < 5; i++) { const cx = Math.round(base + i * 20 + r.int(-4, 4)), ch = r.int(25, 45), cw = 6;   // cardón cacti, grouped on the right
        R(ctx, cx, hy - ch, cw, ch, PAL.grass0); R(ctx, cx + 1, hy - ch, 1, ch, PAL.grass1); R(ctx, cx + cw / 2 - 1, hy - ch - 1, 2, 1, PAL.grass0);
        const arms = r.int(1, 2); for (let a = 0; a < arms; a++) { const side = a % 2 ? 1 : -1; const ay = hy - ch + r.int(8, ch - 12); R(ctx, side < 0 ? cx - 6 : cx + cw, ay, 6, 4, PAL.grass0); R(ctx, side < 0 ? cx - 6 : cx + cw + 2, ay - r.int(8, 14), 4, r.int(10, 16), PAL.grass0); } } } },
  laventana: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') mountains(ctx, w, hy, c, r, 40, 60); else if (L === 'mid') { water(ctx, w, hy - 30, 30, tod, r); kites(ctx, w, hy - 30, r, 10); }
    else { R(ctx, 0, hy - 6, w, 8, PAL.earth3); palms(ctx, w, hy, c, r, 3); } },
  roatan: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') mountains(ctx, w, hy, c, r, 30, 50); else if (L === 'mid') { water(ctx, w, hy - 26, 26, tod, r); for (let i = 0; i < 20; i++) P(ctx, r.int(0, w), hy - r.int(2, 24), PAL.sea3); }
    else { // resort deck: hedge along the water's edge, stone tiles to the bottom, lounge chairs
      for (let ty = hy - 30; ty < hy + 70; ty += 8) for (let tx = 0; tx < w; tx += 14) { R(ctx, tx, ty, 14, 8, PAL.gray1); R(ctx, tx + 1, ty + 1, 12, 6, (Math.floor(tx / 14) + Math.floor(ty / 8)) % 2 ? PAL.gray2 : PAL.earth3); }
      for (let x = 0; x < w; x += 6) { const bh = 6 + (x % 18 === 0 ? 2 : 0); R(ctx, x, hy - 30 - bh, 6, bh + 2, PAL.grass1); R(ctx, x + 1, hy - 30 - bh, 2, 2, PAL.grass2); } R(ctx, 0, hy - 30, w, 1, PAL.grass0);
      for (const cx of [w * 0.12, w * 0.3, w * 0.62, w * 0.8]) loungeChair(ctx, Math.round(cx), hy - 22, r.pick([PAL.sky1, PAL.sun1, PAL.pink])); palms(ctx, w, hy - 26, c, r, 3); } },
  madrid: (ctx, w, hy, L, c, win, r) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 30, 70, 10, 20, 0.35); else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 20, 40, 16, 30, 0.35); const x = Math.floor(w * 0.2); R(ctx, x, hy - 70, 16, 70, c); circle(ctx, x + 8, hy - 74, 8, c); } else { for (let x = 0; x < w; x += 12) trees(ctx, w, hy, c, r, 1, false); R(ctx, 0, hy - 2, w, 4, c); } },
  granada: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 80, 40, PAL.white); else if (L === 'mid') { const x = Math.floor(w * 0.25); R(ctx, x - 60, hy - 40, 120, 40, PAL.earth2); R(ctx, x - 50, hy - 56, 18, 16, PAL.earth2); R(ctx, x + 30, hy - 60, 20, 20, PAL.earth2); for (let k = 0; k < 6; k++) P(ctx, x - 44 + k * 18, hy - 30, win); trees(ctx, w, hy, c, r, 14); } else { for (let x = 0; x < w; x += 14) { R(ctx, x, hy - 14, 13, 14, PAL.white); R(ctx, x, hy - 17, 13, 3, PAL.sun0); } } },
  riviera: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') mountains(ctx, w, hy, c, r, 50, 50); else if (L === 'mid') { buildings(ctx, w, hy - 10, c, win, r, 12, 30, 14, 28, 0.35); water(ctx, w, hy - 10, 10, tod, r); for (let i = 0; i < 5; i++) { const x = r.int(0, w); R(ctx, x, hy - 6, 6, 3, PAL.white); R(ctx, x + 3, hy - 14, 1, 8, PAL.white); } }
    else { // the castle walkway: stone ramparts with crenellations, a flagstone path
      R(ctx, 0, hy - 46, w, 48, PAL.gray1); for (let x = 0; x < w; x += 12) R(ctx, x, hy - 52, 7, 6, PAL.gray1); for (let y = hy - 44; y < hy; y += 6) for (let x = ((y / 6) | 0) % 2 ? 0 : 6; x < w; x += 12) R(ctx, x, y, 11, 5, PAL.gray2); for (let x = 0; x < w; x += 12) R(ctx, x, hy - 46, 12, 1, PAL.gray0);
      for (let y = hy + 2; y < hy + 40; y += 7) for (let x = ((y / 7) | 0) % 2 ? 0 : 8; x < w; x += 16) { R(ctx, x, y, 15, 6, PAL.gray1); R(ctx, x, y + 6, 15, 1, PAL.gray0); R(ctx, x + 15, y, 1, 7, PAL.gray0); } } },
  scotland: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 70, 70); mountains(ctx, w, hy + 10, c, r, 40, 50); }
    else if (L === 'mid') { mountains(ctx, w, hy - 10, c, r, 30, 60); water(ctx, w, hy - 10, 10, tod, r);
      // the Old Man of Storr: a tall leaning pinnacle on the ridge, smaller ones beside it
      const x = Math.floor(w * 0.32); for (let y = 0; y < 76; y++) { const hw = Math.max(1, Math.round(9 * (1 - y / 76)) + 1); R(ctx, x + Math.round(y * 0.18) - hw, hy - 10 - y, hw * 2, 1, c); }
      for (const [dx, h, lean] of [[24, 40, 0.1], [-18, 30, -0.12], [38, 22, 0.05]]) for (let y = 0; y < h; y++) { const hw = Math.max(1, Math.round(5 * (1 - y / h)) + 1); R(ctx, x + dx + Math.round(y * lean) - hw, hy - 10 - y, hw * 2, 1, c); }
    } else { R(ctx, 0, hy - 3, w, 5, c); for (let i = 0; i < 60; i++) { const x = r.int(0, w), h = r.int(3, 8); line(ctx, x, hy - 1, x + 1, hy - 1 - h, c); if (i % 3 === 0) P(ctx, x + 1, hy - 2 - h, PAL.dusk3); } } },
  iceland: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { // broad dark mountains under wide glacier caps
      let x = 0; const pts: number[] = []; while (x <= w) { pts.push(hy - r.int(30, 80)); x += 60; }
      for (let px = 0; px < w; px++) { const i = Math.floor(px / 60), t = (px % 60) / 60; const y = Math.round(pts[i] * (1 - t) + (pts[Math.min(i + 1, pts.length - 1)]) * t); R(ctx, px, y, 1, hy - y + 2, c); const cap = hy - 52; if (y < cap) R(ctx, px, y, 1, cap - y + 2, PAL.white); }
    } else if (L === 'mid') { R(ctx, 0, hy - 10, w, 12, PAL.ink); speckle(ctx, 0, hy - 10, w, 12, PAL.gray0, 0.15, r);   // black sand
    } else { R(ctx, 0, hy - 4, w, 6, PAL.ink); speckle(ctx, 0, hy - 4, w, 6, PAL.gray0, 0.2, r);
      const vx = Math.floor(w * 0.36), vb = hy - 6;   // the campervan, right third of the vista, fully in frame
      R(ctx, vx - 29, vb - 31, 58, 27, PAL.ink); R(ctx, vx - 27, vb - 29, 54, 23, PAL.sun3);                                  // body
      R(ctx, vx - 27, vb - 16, 54, 1, PAL.earth3); R(ctx, vx + 2, vb - 29, 1, 23, PAL.earth3);                                 // trim line, door line
      R(ctx, vx - 26, vb - 27, 14, 9, PAL.night2); R(ctx, vx - 24, vb - 26, 10, 3, PAL.sky2);                                   // windshield with glint
      R(ctx, vx - 9, vb - 27, 10, 8, PAL.night2); R(ctx, vx + 4, vb - 27, 10, 8, PAL.night2); R(ctx, vx + 16, vb - 27, 9, 8, PAL.night2);   // side windows
      R(ctx, vx - 24, vb - 35, 48, 3, PAL.gray0); for (let k = 0; k < 5; k++) R(ctx, vx - 22 + k * 11, vb - 32, 2, 2, PAL.gray0);   // roof rack
      R(ctx, vx + 26, vb - 30, 5, 26, PAL.gray1); for (let k = 0; k < 5; k++) R(ctx, vx + 26, vb - 28 + k * 5, 5, 1, PAL.gray0);   // ladder
      circle(ctx, vx - 16, vb - 2, 6, PAL.ink); circle(ctx, vx + 14, vb - 2, 6, PAL.ink); circle(ctx, vx - 16, vb - 2, 3, PAL.gray2); circle(ctx, vx + 14, vb - 2, 3, PAL.gray2); P(ctx, vx - 16, vb - 2, PAL.gray0); P(ctx, vx + 14, vb - 2, PAL.gray0);
      R(ctx, vx - 29, vb - 12, 3, 3, PAL.sun2); R(ctx, vx + 27, vb - 12, 2, 3, PAL.red); } },
  munich: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 30, 60, PAL.white); else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 20, 40, 14, 26, 0.35); for (const dx of [-24, 6]) { const x = Math.floor(w * 0.25) + dx; R(ctx, x, hy - 80, 16, 80, c); circle(ctx, x + 8, hy - 84, 8, PAL.sea1); R(ctx, x + 7, hy - 96, 2, 6, c); } } else { for (let x = 0; x < w; x += 16) { R(ctx, x, hy - 20, 15, 20, c); R(ctx, x, hy - 24, 15, 4, PAL.sun0); P(ctx, x + 7, hy - 12, win); } } },
  salzkammergut: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { const mc = tod === 'day' ? PAL.night3 : tod === 'night' ? PAL.night2 : PAL.dusk0; peaks(ctx, w, hy, mc, r, 96, 30, PAL.white, 0.8); R(ctx, 0, hy - 2, w, 4, mc); } /* Dachstein: crisp peaks, snow on the summits only */ else if (L === 'mid') { trees(ctx, w, hy - 18, c, r, 30); water(ctx, w, hy - 18, 18, tod, r); const x = Math.floor(w * 0.175); R(ctx, x, hy - 44, 10, 26, PAL.white); R(ctx, x + 4, hy - 54, 2, 10, c); R(ctx, x + 2, hy - 48, 6, 4, c); } else { R(ctx, 0, hy - 4, w, 6, c); trees(ctx, w, hy, c, r, 12); } },
  casablanca: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { water(ctx, w, hy - 10, 10, tod, r); } else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 14, 34, 14, 26, 0.3); const x = Math.floor(w * 0.25); R(ctx, x, hy - 110, 12, 110, c); R(ctx, x + 2, hy - 116, 8, 6, PAL.sea2); } else { for (let x = 0; x < w; x += 20) { R(ctx, x, hy - 16, 19, 16, PAL.white); R(ctx, x + 7, hy - 22, 5, 6, PAL.white); } } },
  seoul: (ctx, w, hy, L, c, win, r) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 70, 40); const x = Math.floor(w * 0.3); R(ctx, x, hy - 130, 4, 130, c); circle(ctx, x + 2, hy - 120, 6, c); } else if (L === 'mid') buildings(ctx, w, hy, c, win, r, 40, 90, 10, 20, 0.5); else { buildings(ctx, w, hy, c, win, r, 10, 28, 14, 30, 0.35); neonSigns(ctx, w, hy, r, 10); } },
  chiangmai: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 60, 50); else if (L === 'mid') { for (let i = 0; i < 3; i++) { const x = 40 + i * 120; for (let y = 0; y < 34; y++) { const hw = Math.round((1 - y / 34) * 9) + 1; R(ctx, x - hw, hy - 20 - y, hw * 2, 1, PAL.sun2); } R(ctx, x - 12, hy - 20, 24, 22, c); } trees(ctx, w, hy, c, r, 16, false); } else { R(ctx, 0, hy - 3, w, 5, c); for (let i = 0; i < 8; i++) { const x = r.int(0, w); R(ctx, x, hy - 14, 3, 12, PAL.sun1); } } },
  hongkong: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { mountains(ctx, w, hy - 40, c, r, 80, 40); buildings(ctx, w, hy, c, win, r, 90, 170, 6, 12, 0.6); }
    else if (L === 'mid') { buildings(ctx, w, hy - 20, c, win, r, 50, 120, 8, 16, 0.6); water(ctx, w, hy - 20, 20, tod, r);
      // a red-sailed junk in the harbour
      const jx = Math.floor(w * 0.4), jy = hy - 8; R(ctx, jx - 16, jy - 4, 34, 5, PAL.ink); R(ctx, jx - 12, jy - 7, 26, 3, PAL.earth0); for (let k = 0; k < 4; k++) R(ctx, jx + 14 + k, jy - 8 + k, 1, 4, PAL.ink);
      for (const [mx, mh, mw] of [[-8, 20, 9], [2, 26, 11], [12, 18, 8]]) { R(ctx, jx + mx, jy - 7 - mh, 1, mh, PAL.ink); for (let y = 0; y < mh; y++) { const sw = Math.round(mw * (0.4 + 0.6 * y / mh)); R(ctx, jx + mx + 1, jy - 7 - mh + y, sw, 1, y % 4 === 0 ? PAL.earth0 : PAL.red); } }
    } else { for (let i = 0; i < 4; i++) { const x = r.int(0, w); R(ctx, x, hy - 8, 20, 6, c); R(ctx, x + 4, hy - 14, 12, 6, c); P(ctx, x + 8, hy - 12, win); } } },
  kathmandu: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { const mc = tod === 'day' ? PAL.night3 : tod === 'night' ? PAL.night2 : PAL.dusk0; peaks(ctx, w, hy, mc, r, 76, 22, PAL.white, 0.7); R(ctx, 0, hy - 2, w, 4, mc); }   // the Himalaya: bases at the horizon, summits inside the frame, snow on the caps only
    else if (L === 'mid') { // Boudhanath: white dome, gold harmika with the eyes, thirteen-step spire, prayer flags
      const x = Math.floor(w * 0.3), by = hy - 6; R(ctx, x - 44, by - 8, 88, 10, PAL.gray2); for (let y = 0; y < 30; y++) { const hw = Math.round(Math.sqrt(1 - Math.pow(1 - y / 30, 2)) * 40); R(ctx, x - hw, by - 8 - 30 + y, hw * 2, 1, PAL.white); }
      R(ctx, x - 9, by - 54, 18, 16, PAL.sun2); R(ctx, x - 7, by - 50, 4, 3, PAL.ink); R(ctx, x + 3, by - 50, 4, 3, PAL.ink); R(ctx, x - 6, by - 52, 3, 1, PAL.ink); R(ctx, x + 3, by - 52, 3, 1, PAL.ink); P(ctx, x, by - 46, PAL.red, 1, 3);
      for (let y = 0; y < 26; y++) R(ctx, x - Math.round((26 - y) / 3), by - 54 - y, Math.round((26 - y) / 1.5) + 1, 1, y % 2 ? PAL.sun2 : PAL.sun1); R(ctx, x - 1, by - 84, 3, 5, PAL.sun3);
      buildings(ctx, w, hy, c, win, r, 8, 22, 12, 22, 0.3);
      const cols = [PAL.sky1, PAL.white, PAL.red, PAL.grass2, PAL.sun2]; const poles: [number, number][] = [[x - 130, hy - 70], [x + 120, hy - 64]];
      for (const [px2, py] of poles) R(ctx, px2, py, 2, hy - py, PAL.earth0);
      const strands: [number, number, number, number][] = [[poles[0][0], poles[0][1], x, by - 82], [x, by - 82, poles[1][0], poles[1][1]], [poles[0][0], poles[0][1] + 16, poles[1][0], poles[1][1] + 14]];
      for (const [x0, y0, x1, y1] of strands) for (let xx = x0; xx < x1; xx += 7) { const t = (xx - x0) / (x1 - x0); const yy = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 12); const yn = Math.round(y0 + (y1 - y0) * (t + 7 / (x1 - x0)) + Math.sin((t + 7 / (x1 - x0)) * Math.PI) * 12); line(ctx, xx, yy, xx + 7, yn, PAL.gray0); R(ctx, xx + 1, yy + 1, 4, 5, cols[(xx / 7 | 0) % 5]); }
    } else { buildings(ctx, w, hy, c, win, r, 10, 26, 12, 22, 0.3); } },
  iguazu: (ctx, w, hy, L, c, win, r) => { if (L === 'far') { mountains(ctx, w, hy, PAL.grass0, r, 70, 50); for (let px = 0; px < w; px += 2) for (let y = hy - 70; y < hy; y += 2) if (((px + y) / 2) % 3 === 0 && r.chance(0.35)) P(ctx, px, y, PAL.grass1); trees(ctx, w, hy - 40, PAL.grass0, r, 6); }
    else if (L === 'mid') { mountains(ctx, w, hy, PAL.grass1, r, 46, 40); for (let px = 0; px < w; px += 2) for (let y = hy - 46; y < hy; y += 2) if (((px + y) / 2) % 4 === 0 && r.chance(0.3)) P(ctx, px, y, PAL.grass2);
      for (let i = 0; i < 5; i++) { const x = 40 + i * 60 + r.int(-10, 10), top = hy - r.int(30, 44), fw = r.int(8, 16); R(ctx, x, top, fw, hy - top, PAL.white); R(ctx, x + 2, top, fw - 4, hy - top, PAL.sky3); speckle(ctx, x - 6, hy - 14, fw + 12, 16, PAL.white, 0.35, r); }   // the falls and their mist
      trees(ctx, w, hy - 30, PAL.grass0, r, 5); birds(ctx, w, hy - 80, r, 6, PAL.ink);
    } else { R(ctx, 0, hy - 4, w, 6, PAL.grass0); trees(ctx, w, hy, PAL.grass0, r, 8); } },
  edinburgh: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 50, 60);
      const x = Math.floor(w * 0.36); for (let y = 0; y < 40; y++) R(ctx, x - 30 - Math.round(y * 0.8), hy - y, 60 + Math.round(y * 1.6), 1, c);   // castle rock
      R(ctx, x - 26, hy - 60, 52, 22, c); for (let k = 0; k < 7; k++) R(ctx, x - 26 + k * 8, hy - 64, 4, 4, c); R(ctx, x - 6, hy - 72, 12, 14, c); R(ctx, x + 14, hy - 68, 8, 10, c);
    } else if (L === 'mid') { let x = r.int(0, 8); while (x < w) { const bw = r.int(22, 34), bh = r.int(34, 60); R(ctx, x, hy - bh, bw, bh + 2, c); for (let st = 0; st < 5; st++) R(ctx, x + st * 3, hy - bh - 3 - st * 3, bw - st * 6, 3, c);   // crow-stepped gables
        for (let wy = hy - bh + 5; wy < hy - 4; wy += 8) for (let wx = x + 3; wx < x + bw - 3; wx += 6) if (r.chance(0.5)) R(ctx, wx, wy, 2, 3, win); x += bw + r.int(1, 3); }
      const sx = Math.floor(w * 0.22); R(ctx, sx - 5, hy - 70, 10, 40, c); for (let y = 0; y < 30; y++) R(ctx, sx - Math.round((30 - y) / 6), hy - 70 - y, Math.round((30 - y) / 3) + 1, 1, c);
    } else { let x = 0; while (x < w) { const bw = r.int(24, 36), bh = r.int(18, 30); R(ctx, x, hy - bh, bw, bh + 2, c); for (let st = 0; st < 4; st++) R(ctx, x + st * 3, hy - bh - 3 - st * 3, bw - st * 6, 3, c); for (let wy = hy - bh + 4; wy < hy - 4; wy += 7) for (let wx = x + 3; wx < x + bw - 3; wx += 7) if (r.chance(0.6)) R(ctx, wx, wy, 3, 4, win); R(ctx, x + Math.floor(bw / 2) - 2, hy - 7, 4, 7, PAL.ink); x += bw + r.int(2, 5); } } },
  minakami: (ctx, w, hy, L, c, win, r) => { if (L === 'far') peaks(ctx, w, hy, c, r, 110, 30, PAL.white, 0.5);
    else if (L === 'mid') { mountains(ctx, w, hy, c, r, 30, 40); trees(ctx, w, hy, c, r, 30);
      const tx = Math.floor(w * 0.35); R(ctx, tx - 22, hy - 44, 4, 44, PAL.red); R(ctx, tx + 18, hy - 44, 4, 44, PAL.red); R(ctx, tx - 28, hy - 48, 56, 4, PAL.red); R(ctx, tx - 24, hy - 40, 48, 3, PAL.red); R(ctx, tx - 2, hy - 48, 4, 8, PAL.red);   // torii
      const ox = Math.floor(w * 0.42); R(ctx, ox - 24, hy - 8, 48, 10, PAL.gray0); water(ctx, 40, hy - 6, 6, 'day', r); for (let i = 0; i < 18; i++) P(ctx, ox - 20 + r.int(0, 40), hy - 10 - r.int(0, 30), PAL.gray2, 1, 2);   // onsen pool and steam
    } else { R(ctx, 0, hy - 3, w, 5, c); trees(ctx, w, hy, c, r, 14); } },
  santiago: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { const mc = tod === 'day' ? PAL.night3 : tod === 'night' ? PAL.night2 : PAL.dusk0; peaks(ctx, w, hy, mc, r, 88, 34, PAL.white, 0.8); R(ctx, 0, hy - 2, w, 4, mc); }   // the Andes: crisp against every sky, snow only on the summits
    else if (L === 'mid') { mountains(ctx, w, hy - 6, c, r, 26, 50);                                                    // foothill band
      let x = -r.int(0, 8); while (x < w) { const bw = r.int(10, 18), bh = r.int(18, 46); R(ctx, x, hy - bh, bw, bh + 2, c); for (let wy = hy - bh + 3; wy < hy - 2; wy += 4) for (let wx = x + 2; wx < x + bw - 2; wx += 3) if (r.chance(0.45)) P(ctx, wx, wy, win); x += bw + r.int(1, 4); } }   // towers, no antennas
    else buildings(ctx, w, hy, c, win, r, 10, 30, 16, 30, 0.3); },
  buenosaires: (ctx, w, hy, L, c, win, r) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 40, 90, 10, 20, 0.4); else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 24, 50, 16, 30, 0.4); const x = Math.floor(w * 0.25); R(ctx, x, hy - 96, 8, 96, PAL.white); R(ctx, x - 6, hy - 40, 20, 8, PAL.white); } else { for (let x = 0; x < w; x += 16) { R(ctx, x, hy - 18, 15, 18, r.pick([PAL.sun2, PAL.sky1, PAL.pink, PAL.grass2])); P(ctx, x + 7, hy - 10, win); } } },
  montreal: (ctx, w, hy, L, c, win, r) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 40, 80); const x = Math.floor(w * 0.25); R(ctx, x, hy - 60, 2, 20, PAL.white); R(ctx, x - 5, hy - 54, 12, 2, PAL.white); } else if (L === 'mid') buildings(ctx, w, hy, c, win, r, 30, 80, 10, 20, 0.45); else { buildings(ctx, w, hy, c, win, r, 12, 30, 14, 28, 0.3); for (let x = 0; x < w; x += 22) { for (let s = 0; s < 8; s++) R(ctx, x + 2 + s, hy - 6 - s * 3, 10, 1, c); } } },
  lasvegas: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 40, 60); else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 50, 120, 14, 28, 0.6); const x = Math.floor(w * 0.225); R(ctx, x, hy - 150, 6, 150, c); circle(ctx, x + 3, hy - 156, 5, PAL.sun2); }
    else { neonSigns(ctx, w, hy, r, 12); R(ctx, 0, hy - 4, w, 6, c); palms(ctx, w, hy, c, r, 3);
      for (const sx of [Math.floor(w * 0.36), Math.floor(w * 0.36 + w / 2)]) { const top = hy - 74;                       // the sign: diamond, red trim, starburst, pole
        R(ctx, sx - 1, hy - 40, 3, 40, PAL.gray1);
        for (let i = 0; i < 18; i++) { const half = Math.round(i < 9 ? 6 + i * 3.2 : 6 + (17 - i) * 3.2); R(ctx, sx - half, top + i * 2, half * 2, 2, PAL.white); R(ctx, sx - half, top + i * 2, 2, 2, PAL.red); R(ctx, sx + half - 2, top + i * 2, 2, 2, PAL.red); }
        signText(ctx, sx - 5, top + 12, 'LAS', PAL.night0, 1); signText(ctx, sx - 9, top + 20, 'VEGAS', PAL.red, 1);
        for (let a = 0; a < 8; a++) { const ang = a / 8 * Math.PI * 2; line(ctx, sx, top - 6, sx + Math.cos(ang) * 8, top - 6 + Math.sin(ang) * 8, PAL.sun2); } circle(ctx, sx, top - 6, 2, PAL.sun3); } } },
  joshuatree: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 30, 70);
    else if (L === 'mid') { for (let i = 0; i < 6; i++) { const x = r.int(0, w); circle(ctx, x, hy - 6, r.int(6, 12), c); circle(ctx, x + 9, hy - 4, r.int(4, 8), c); } for (let i = 0; i < 6; i++) joshuaTree(ctx, r.int(10, w - 10), hy, r.int(16, 26), c, r); }   // boulder piles + distant trees
    else { R(ctx, 0, hy - 2, w, 4, PAL.earth2); for (let i = 0; i < 7; i++) joshuaTree(ctx, r.int(10, w - 10), hy, r.int(24, 40), c, r); } },
  orangecounty: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') { mountains(ctx, w, hy, c, r, 30, 80); } else if (L === 'mid') { water(ctx, w, hy - 14, 14, tod, r); }
    else { water(ctx, w, hy - 40, 110, tod, r);                                                                          // the ocean runs to the bottom of the frame
      const yT = hy - 42, yB = hy + 10, xc = w / 4, wT = 14, wB = 200;                                                    // the visible frame ends around hy - 8, so the pier widens fast                                                   // the pier: a trapezoid from under your feet out to the horizon
      for (let y = yT; y < yB; y++) { const t = (y - yT) / (yB - yT); const half = (wT + (wB - wT) * t) / 2; R(ctx, xc - half, y, half * 2, 1, (y - yT) % Math.max(2, Math.round(2 + t * 5)) === 0 ? PAL.earth0 : PAL.earth1); R(ctx, xc - half, y, 1, 1, PAL.ink); R(ctx, xc + half - 1, y, 1, 1, PAL.ink); }
      for (let i = 0; i < 7; i++) { const t = i / 7; const y = yT + (yB - yT) * t; const half = (wT + (wB - wT) * t) / 2; R(ctx, xc - half - 2, y, 2, 6 + t * 10, PAL.earth0); R(ctx, xc + half, y, 2, 6 + t * 10, PAL.earth0); }   // pilings
      R(ctx, xc - 8, yT - 3, 16, 1, PAL.earth0); R(ctx, xc - 8, yT - 3, 1, 4, PAL.earth0); R(ctx, xc + 7, yT - 3, 1, 4, PAL.earth0);   // a low rail at the far end, nothing on it
      // the same pier again half a wrap later so the tile repeats cleanly
      const xc2 = xc + w / 2; for (let y = yT; y < yB; y++) { const t = (y - yT) / (yB - yT); const half = (wT + (wB - wT) * t) / 2; R(ctx, xc2 - half, y, half * 2, 1, (y - yT) % Math.max(2, Math.round(2 + t * 5)) === 0 ? PAL.earth0 : PAL.earth1); } } },
  london: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 40, 100, 10, 20, 0.4); else if (L === 'mid') { water(ctx, w, hy - 10, 10, tod, r); const x = Math.floor(w * 0.15); R(ctx, x, hy - 90, 12, 80, c); R(ctx, x + 2, hy - 80, 8, 8, PAL.sun2); R(ctx, x + 4, hy - 98, 4, 8, c); circle(ctx, w / 2 - 60, hy - 60, 40, c); circle(ctx, w / 2 - 60, hy - 60, 36, PAL.night0); for (let a = 0; a < 16; a++) line(ctx, w / 2 - 60, hy - 60, w / 2 - 60 + Math.cos(a / 16 * Math.PI * 2) * 38, hy - 60 + Math.sin(a / 16 * Math.PI * 2) * 38, c); } else { for (let x = 0; x < w; x += 14) { R(ctx, x, hy - 22, 13, 22, PAL.earth1); P(ctx, x + 6, hy - 14, win); P(ctx, x + 6, hy - 8, win); } } },
  amsterdam: (ctx, w, hy, L, c, win, r, tod) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 20, 40, 8, 14, 0.4); else if (L === 'mid') { for (let x = 0; x < w; x += 12) { const h = r.int(30, 50); R(ctx, x, hy - h, 11, h, r.pick([PAL.earth1, PAL.night3, PAL.earth0])); for (let s = 0; s < 4; s++) R(ctx, x + 1 + s, hy - h - 4 + s, 9 - s * 2, 1, c); P(ctx, x + 5, hy - h + 8, win); P(ctx, x + 5, hy - h + 16, win); } } else { water(ctx, w, hy - 12, 12, tod, r); for (let i = 0; i < 6; i++) { const x = r.int(0, w); R(ctx, x, hy - 30, 2, 20, c); R(ctx, x - 5, hy - 30, 12, 2, c); } } },
  brussels: (ctx, w, hy, L, c, win, r) => { if (L === 'far') buildings(ctx, w, hy, c, win, r, 30, 70, 10, 20, 0.4);
    else if (L === 'mid') { let x = r.int(0, 10); while (x < w) { const bw = r.int(26, 44), bh = r.int(40, 70); gothic(ctx, x, hy, bw, bh, c, win, r.chance(0.5)); x += bw + r.int(2, 6); } }
    else { for (let x = 0; x < w; x += 22) { const bh = r.int(20, 30); R(ctx, x, hy - bh, 20, bh, c); for (let s = 0; s < 5; s++) R(ctx, x + s * 2, hy - bh - 3 - s * 3, 20 - s * 4, 3, c); for (let wy = hy - bh + 4; wy < hy - 4; wy += 7) { R(ctx, x + 5, wy + 1, 2, 4, win); P(ctx, x + 6, wy, win); R(ctx, x + 12, wy + 1, 2, 4, win); P(ctx, x + 13, wy, win); } } } },
  nairobi: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 30, 90); else if (L === 'mid') { R(ctx, 0, hy - 2, w, 4, c); for (let i = 0; i < 5; i++) { const x = r.int(10, w - 10); R(ctx, x, hy - 18, 2, 16, c); R(ctx, x - 12, hy - 22, 26, 5, c); } } else { for (let i = 0; i < 4; i++) { const x = r.int(0, w); R(ctx, x, hy - 10, 12, 8, c); R(ctx, x + 2, hy - 14, 8, 4, c); line(ctx, x + 8, hy - 18, x + 8, hy - 14, c); } } },
  santamonica: (ctx, w, hy, L, c, win, r, tod) => CITY.orangecounty(ctx, w, hy, L, c, win, r, tod),
  seattle: (ctx, w, hy, L, c, win, r) => { if (L === 'far') mountains(ctx, w, hy, c, r, 90, 60, PAL.white); else if (L === 'mid') { buildings(ctx, w, hy, c, win, r, 30, 90, 10, 20, 0.45); const x = Math.floor(w * 0.3); R(ctx, x, hy - 120, 3, 120, c); R(ctx, x - 10, hy - 126, 23, 6, c); } else trees(ctx, w, hy, c, r, 30); },
};
const REGION_FALLBACK: Record<Region, keyof typeof CITY> = { northamerica: 'boulder', mexico: 'laventana', southamerica: 'santiago', europe: 'madrid', alps: 'innsbruck', africa: 'dakhla', asia: 'bangkok', himalaya: 'kathmandu' };
const ALIASES: Record<string, string> = { antibes: 'riviera', cannes: 'riviera', marseille: 'riviera', hyères: 'hyeres', aviemore: 'scotland', skye: 'scotland', glencoe: 'scotland', highlands: 'scotland', reykjavik: 'iceland', hallstatt: 'salzkammergut', nikko: 'innsbruck', denver: 'boulder', tabernash: 'montana', bozeman: 'montana', yorbalinda: 'orangecounty', oc: 'orangecounty', carvoeiro: 'riviera', sintra: 'lisbon', puertosancarlos: 'laventana', rotholz: 'innsbruck', vitalia: 'roatan', colonia: 'buenosaires', badgoisern: 'salzkammergut', gosau: 'salzkammergut', edgecity: 'patagonia' };

export function resolveSkylineKey(cityId: string, region?: Region): string {
  const id = cityId.toLowerCase().replace(/[^a-z]/g, '');
  if (CITY[id]) return id; if (ALIASES[id]) return ALIASES[id];
  for (const k of Object.keys(CITY)) if (id.includes(k)) return k;
  return region ? REGION_FALLBACK[region] : 'boulder';
}

/** Build a parallax skyline filling w x h (default 360x640). horizonY defaults to 62% down. */
export function buildSkyline(scene: Phaser.Scene, cityIdOrRegion: string, tod: TimeOfDay, climate: Climate = 'temperate', w = 360, h = 640, horizonY = Math.round(h * 0.62), region?: Region): Skyline {
  const key = resolveSkylineKey(cityIdOrRegion, region ?? (cityIdOrRegion as Region));
  const draw = CITY[key] || CITY.boulder; const r = rng(seedOf(key));
  const sil = SIL[tod], win = WIN[tod];
  const mk = (name: string, cw: number, ch: number, fn: (ctx: Ctx) => void) => { const k = `sky_${key}_${tod}_${name}`; if (!scene.textures.exists(k)) scene.textures.addCanvas(k, makeCanvas(cw, ch, fn)); return k; };
  const skyKey = mk('sky', w, h, ctx => { ditherGradient(ctx, 0, 0, w, horizonY + 20, SKY[tod]); if (tod === 'night' || tod === 'dawn') { const rr = rng(7); for (let i = 0; i < (tod === 'night' ? 90 : 25); i++) P(ctx, rr.int(0, w - 1), rr.int(0, horizonY - 40), rr.chance(0.3) ? PAL.white : PAL.gray2); }
    if (tod === 'dusk' || tod === 'dawn') { const sx = tod === 'dusk' ? w * 0.125 : w * 0.35; circle(ctx, sx, horizonY - 30, 16, PAL.sun3); circle(ctx, sx, horizonY - 30, 12, PAL.sun2); }
    if (tod === 'night') circle(ctx, w * 0.375, 90, 14, PAL.sun3), circle(ctx, w * 0.375 + 6, 86, 12, SKY.night[1]);
    if (key === 'iceland' && tod === 'night') { for (let x = 0; x < w; x++) { const y = 120 + Math.round(Math.sin(x / 40) * 30); for (let k = 0; k < 40; k++) if ((x + k) % 3 === 0) P(ctx, x, y + k, k < 14 ? PAL.neon : k < 28 ? PAL.sea2 : PAL.dusk2); } }
    R(ctx, 0, horizonY + 20, w, h - horizonY - 20, GROUND[tod]); });
  const LW = w * 2; // layers are 2x wide for seamless wrap
  const layer = (name: 'far' | 'mid' | 'near', c: number) => mk(name, LW, h, ctx => { const rr = rng(seedOf(key + name)); const hy = horizonY + (name === 'near' ? 60 : name === 'mid' ? 24 : 0); draw(ctx, LW, hy, name, c, win, rr, tod); if (name === 'near' && !NO_GROUND.has(key)) { R(ctx, 0, hy + 2, LW, h - hy - 2, GROUND[tod]); speckle(ctx, 0, hy + 2, LW, h - hy - 2, sil[2], 0.02, rr); R(ctx, 0, hy + 1, LW, 1, sil[1]); } });
  const farK = layer('far', sil[0]), midK = layer('mid', sil[1]), nearK = layer('near', sil[2]);
  const container = scene.add.container(0, 0);
  const sky = scene.add.image(0, 0, skyKey).setOrigin(0);
  const far = scene.add.tileSprite(0, 0, w, h, farK).setOrigin(0), mid = scene.add.tileSprite(0, 0, w, h, midK).setOrigin(0), near = scene.add.tileSprite(0, 0, w, h, nearK).setOrigin(0);
  container.add([sky, far, mid, near]);
  // animated bits
  const anim: Phaser.GameObjects.GameObject[] = []; let t = 0;
  const rainy = climate === 'rainy' || key === 'tokyo' || key === 'scotland' || key === 'seattle';
  let rain: Phaser.GameObjects.Graphics | undefined;
  if (rainy && tod !== 'day') { rain = scene.add.graphics(); container.add(rain); anim.push(rain); }
  const neon: Phaser.GameObjects.Rectangle[] = [];
  if (['tokyo', 'seoul', 'lasvegas', 'hongkong', 'bangkok', 'miami'].includes(key) && tod !== 'day') { const rr = rng(3); for (let i = 0; i < 6; i++) { const n = scene.add.rectangle(rr.int(10, w - 10), horizonY - rr.int(20, 80), rr.int(3, 8), rr.int(2, 5), rr.pick([PAL.neon, PAL.pink, PAL.sun2, PAL.red])).setOrigin(0); (n as any).__ph = rr.next() * 6; neon.push(n); container.add(n); } }
  const speeds = [0.15, 0.4, 1];
  const sl: Skyline = {
    container, layers: [far, mid, near], sky, horizonY, width: w, height: h,
    scroll(dx) { far.tilePositionX += dx * speeds[0]; mid.tilePositionX += dx * speeds[1]; near.tilePositionX += dx * speeds[2]; },
    update(dt) { t += dt / 1000;
      if (rain) { rain.clear(); rain.lineStyle(1, PAL.sky2, 0.55); const rr = rng(Math.floor(t * 12)); for (let i = 0; i < 40; i++) { const x = rr.int(0, w), y = rr.int(0, h); rain.lineBetween(x, y, x - 2, y + 9); } }
      for (const n of neon) n.setVisible(Math.sin(t * 3 + (n as any).__ph) > -0.7); },
    destroy() { container.destroy(true); },
    setTimeOfDay(nt) { const nk = buildSkyline(scene, cityIdOrRegion, nt, climate, w, h, horizonY, region); sky.setTexture(nk.sky.texture.key); far.setTexture(nk.layers[0].texture.key); mid.setTexture(nk.layers[1].texture.key); near.setTexture(nk.layers[2].texture.key); nk.destroy(); },
  };
  return sl;
}
export function scrollSkyline(s: Skyline, dx: number) { s.scroll(dx); }
export const SKYLINE_KEYS = Object.keys(CITY);
