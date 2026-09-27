import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, H, pixTexture } from '../_shared';

/** Seeded rng (mulberry32) so a dive is repeatable for a given city + seed. */
export function rng32(seed: number) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const SAND_Y = 586;           /* top of the sand */
export const HUD_H = 26;

/** Pixel sprites: diver (2 frames: fins up / down), lionfish (2 frames), reef fish, spear tip. */
export function buildScubaSprites(scene: Phaser.Scene) {
  const M = { k: PAL.ink, b: PAL.night3, s: PAL.gray2, f: PAL.sun0, y: PAL.sun2, w: PAL.white, t: PAL.sea3, r: PAL.red, p: PAL.pink, d: PAL.dusk3, n: PAL.neon, g: PAL.gray1, o: PAL.sun1, e: PAL.earth1 };
  const diver = (fin: string[]) => [
    '.......ww........',
    '......wttw..kkk..',
    '......wttw.kbbbk.',
    '.....bbbbbkbbbbbk',
    '....bbbbbbbbbbbb.',
    '...bbbbbbbbbbb...',
    '..bbbbbbbbbbb....',
    ...fin,
  ];
  pixTexture(scene, 'sc_diver0', diver(['.ffbbbbbbbb......', 'ffff.............']), M, 1);
  pixTexture(scene, 'sc_diver1', diver(['..bbbbbbbbb......', '.ffff............', 'ffff.............']), M, 1);
  /* lionfish: striped body, fanned spines (drawn as separate dorsal rays) */
  pixTexture(scene, 'sc_lion0', [
    '....r..r..r.....',
    '...r.r.r.r.r....',
    '..rrrrrrrrrrr...',
    '.rowowowowowor..',
    'rowowowowowowowr',
    '.rowowowowowor..',
    '..rrrrrrrrrrr...',
    '...r.r.r.r.r....',
    '....r..r..r.....',
  ], M, 1);
  pixTexture(scene, 'sc_lion1', [
    '...r..r..r......',
    '..r.r.r.r.r.....',
    '..rrrrrrrrrrr...',
    '.rowowowowowor..',
    'rowowowowowowowr',
    '.rowowowowowor..',
    '..rrrrrrrrrrr...',
    '..r.r.r.r.r.....',
    '...r..r..r......',
  ], M, 1);
  pixTexture(scene, 'sc_lion_dead', [
    '................',
    '...g..g..g......',
    '..ggggggggggg...',
    '.ggsgsgsgsgsgg..',
    'ggsgsgsgsgsgsgsg',
    '.ggsgsgsgsgsgg..',
    '..ggggggggggg...',
    '...g..g..g......',
    '................',
  ], M, 1);
  pixTexture(scene, 'sc_fish_y', ['..yyy..', '.yyyyyy', 'yykyyyy', '.yyyyyy', '..yyy..'], M, 1);
  pixTexture(scene, 'sc_fish_t', ['..ttt..', '.tttttt', 'ttkttt.', '.tttttt', '..ttt..'], M, 1);
  pixTexture(scene, 'sc_fish_p', ['..ppp..', '.pppppp', 'ppkpppp', '.pppppp', '..ppp..'], M, 1);
  pixTexture(scene, 'sc_tip', ['s', 's', 'w'], M, 1);
}

export type Coral = { x: number; y: number; w: number; h: number; kind: 'brain' | 'fan' | 'branch' | 'rock' | 'anemone'; color: number };

/** Lay out the reef: a wall on the right, clumps along the sand. Returns coral shapes (also used as hiding spots). */
export function layoutReef(rand: () => number, murky: boolean): Coral[] {
  const out: Coral[] = [];
  const kinds: Coral['kind'][] = ['brain', 'fan', 'branch', 'rock', 'anemone'];
  const cols = [PAL.dusk3, PAL.sun0, PAL.sun2, PAL.pink, PAL.dusk2, PAL.sun1];
  /* the wall: stacked rocks on the right edge */
  for (let y = 120; y < SAND_Y; y += 46 + Math.floor(rand() * 18)) out.push({ x: W - 44 - rand() * 18, y, w: 60 + rand() * 20, h: 40 + rand() * 16, kind: 'rock', color: PAL.gray0 });
  /* wall growth */
  for (let i = 0; i < 5; i++) out.push({ x: W - 46 - rand() * 12, y: 150 + i * 88 + rand() * 20, w: 22 + rand() * 10, h: 22 + rand() * 12, kind: kinds[Math.floor(rand() * 3)], color: cols[Math.floor(rand() * cols.length)] });
  /* clumps along the sand */
  let x = 18;
  while (x < W - 90) { const w = 34 + rand() * 30, h = 26 + rand() * 30; out.push({ x, y: SAND_Y - h + 6, w, h, kind: kinds[Math.floor(rand() * kinds.length)], color: cols[Math.floor(rand() * cols.length)] }); x += w + 6 + rand() * 26; }
  /* a mid-water bommie (an isolated coral head) to hide behind */
  out.push({ x: 60 + rand() * 120, y: 330 + rand() * 90, w: 54, h: 44, kind: 'rock', color: PAL.gray0 });
  out.push({ x: out[out.length - 1].x + 8, y: out[out.length - 1].y - 18, w: 36, h: 26, kind: murky ? 'branch' : 'fan', color: cols[Math.floor(rand() * cols.length)] });
  return out;
}

/** Draw coral shapes into a graphics layer (static, drawn once). */
export function drawCoral(g: Phaser.GameObjects.Graphics, c: Coral, rand: () => number) {
  const dark = (col: number) => Phaser.Display.Color.IntegerToColor(col).darken(28).color;
  switch (c.kind) {
    case 'rock': {
      g.fillStyle(dark(c.color)).fillRoundedRect(c.x, c.y + 3, c.w, c.h, 8); g.fillStyle(c.color).fillRoundedRect(c.x, c.y, c.w, c.h - 4, 8);
      g.fillStyle(PAL.gray1, 0.5); for (let i = 0; i < 4; i++) g.fillRect(c.x + 6 + rand() * (c.w - 14), c.y + 4 + rand() * (c.h - 12), 3, 2);
      break; }
    case 'brain': {
      g.fillStyle(dark(c.color)).fillEllipse(c.x + c.w / 2, c.y + c.h / 2 + 3, c.w, c.h); g.fillStyle(c.color).fillEllipse(c.x + c.w / 2, c.y + c.h / 2, c.w, c.h - 4);
      g.lineStyle(1, dark(c.color), 0.9); for (let i = 0; i < 5; i++) { const yy = c.y + 6 + i * (c.h - 12) / 4; g.beginPath(); for (let xx = 0; xx <= c.w - 8; xx += 3) { const y2 = yy + Math.sin(xx / 5 + i) * 2.5; if (xx === 0) g.moveTo(c.x + 4 + xx, y2); else g.lineTo(c.x + 4 + xx, y2); } g.strokePath(); }
      break; }
    case 'fan': {
      const cx = c.x + c.w / 2, by = c.y + c.h; g.lineStyle(2, dark(c.color), 1);
      for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.22; g.beginPath(); g.moveTo(cx, by); g.lineTo(cx + Math.cos(a) * c.h, by + Math.sin(a) * c.h); g.strokePath(); }
      g.lineStyle(1, c.color, 1); for (let r = 8; r < c.h; r += 7) { g.beginPath(); g.arc(cx, by, r, -Math.PI / 2 - 0.7, -Math.PI / 2 + 0.7, false); g.strokePath(); }
      break; }
    case 'branch': {
      const cx = c.x + c.w / 2, by = c.y + c.h; g.lineStyle(4, c.color, 1);
      const arm = (x0: number, y0: number, a: number, len: number, d: number) => { const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; g.lineStyle(Math.max(1, 4 - d), d ? c.color : dark(c.color), 1); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokePath(); if (d < 3) { arm(x1, y1, a - 0.5 - rand() * 0.3, len * 0.65, d + 1); arm(x1, y1, a + 0.5 + rand() * 0.3, len * 0.65, d + 1); } };
      arm(cx, by, -Math.PI / 2, c.h * 0.55, 0);
      break; }
    case 'anemone': {
      const cx = c.x + c.w / 2, by = c.y + c.h; g.fillStyle(dark(c.color)).fillEllipse(cx, by - 4, c.w * 0.7, 10);
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.16; const len = c.h * (0.6 + rand() * 0.4); g.lineStyle(3, c.color, 1); g.beginPath(); g.moveTo(cx, by - 6); g.lineTo(cx + Math.cos(a) * len, by - 6 + Math.sin(a) * len); g.strokePath(); g.fillStyle(PAL.white, 0.8).fillCircle(cx + Math.cos(a) * len, by - 6 + Math.sin(a) * len, 1.5); }
      break; }
  }
}

/** Water background: gradient bands, light rays, sand. Murky water (Miami) is greener and dimmer. */
export function drawWater(g: Phaser.GameObjects.Graphics, murky: boolean) {
  const bands = murky ? [PAL.sea1, PAL.sea1, PAL.sea0, PAL.sea0, PAL.night2] : [PAL.sea2, PAL.sea1, PAL.sea1, PAL.sea0, PAL.sea0];
  const bh = (SAND_Y - HUD_H) / bands.length;
  bands.forEach((c, i) => g.fillStyle(c).fillRect(0, HUD_H + i * bh, W, bh + 1));
  /* dithered transitions */
  bands.forEach((c, i) => { if (!i) return; const y0 = HUD_H + i * bh; g.fillStyle(bands[i - 1]); for (let x = 0; x < W; x += 4) for (let k = 0; k < 3; k++) if (((x >> 2) + k) % 2 === 0) g.fillRect(x, y0 + k * 3, 2, 2); });
  /* sand */
  g.fillStyle(murky ? PAL.earth2 : PAL.earth3).fillRect(0, SAND_Y, W, H - SAND_Y); g.fillStyle(murky ? PAL.earth1 : PAL.earth2, 0.6); for (let x = 0; x < W; x += 9) g.fillRect(x + ((x / 9) % 2) * 3, SAND_Y + 6 + ((x / 9) % 3) * 9, 5, 1);
  g.fillStyle(PAL.sea3, murky ? 0.15 : 0.35).fillRect(0, SAND_Y, W, 2);
}

export function drawRays(g: Phaser.GameObjects.Graphics, t: number, murky: boolean) {
  g.clear();
  const n = murky ? 3 : 5;
  for (let i = 0; i < n; i++) { const x0 = 30 + i * 74 + Math.sin(t * 0.4 + i) * 10; const a = murky ? 0.05 : 0.09 + 0.03 * Math.sin(t * 0.9 + i * 1.3); g.fillStyle(PAL.sky3, a); g.fillTriangle(x0, HUD_H, x0 + 28, HUD_H, x0 + 70 + Math.sin(t * 0.3 + i) * 12, SAND_Y - 40); }
}
