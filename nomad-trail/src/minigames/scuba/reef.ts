import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { pixTexture } from '../_shared';

/** Seeded rng (mulberry32) so a dive is repeatable for a given city + seed. */
export function rng32(seed: number) {
  let a = (seed >>> 0) || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The reef is a world about three screens wide and two tall; the camera follows the diver. */
export const WW = 1080, WH = 1200;
export const SAND_Y = WH - 60;       /* top of the sand */
export const HUD_H = 26;

/** Pixel sprites: diver (2 frames: fins up / down), lionfish (2 frames), reef fish, spear tip. */
export function buildScubaSprites(scene: Phaser.Scene) {
  const M = { k: PAL.ink, b: PAL.night3, s: PAL.gray2, f: PAL.sun0, y: PAL.sun2, w: PAL.white, t: PAL.sea3, r: PAL.red, m: PAL.dusk2, p: PAL.pink, d: PAL.dusk1, n: PAL.neon, g: PAL.gray1, o: PAL.sun1, e: PAL.earth3 };
  /* diver, 28x18 drawn at 3x: dark wetsuit, hooded head with a lighter visor, regulator hose to a yellow tank on the back
     (valve visible), two legs from hip to fin (near leg in the wetsuit colour, far leg darker), spear gun held forward.
     Three frames of flutter kick (near leg up / both level / near leg down); the scene ping-pongs 0-1-2-1. Faces right. */
  pixTexture(scene, 'sc_diver0', [
    'f...........................',
    'ff..........................',
    '.f..........................',
    '.fb.....oooooooooo..........',
    '..bb...oyyyyyyyyyyss........',
    '...bb..oyyyyyyyyyys.g.......',
    '....bb..oooooooooo...g......',
    '.....bbbnbbbnbbbnbbbnbbkttw.',
    '.....bbbbbbbbbbbbbbbbbbkttt.',
    '.....bbbbbbbbbbbbbbbbbbbeee.',
    '.....bbbbbbbbbbbbbbbbbbbkkb.',
    '....kk.............bbbbbb...',
    '...kk.................sssssw',
    '..kk...................bb...',
    '.fk.........................',
    '.f..........................',
    'ff..........................',
    'f...........................',
  ], M, 1);
  pixTexture(scene, 'sc_diver1', [
    '............................',
    '............................',
    '............................',
    '........oooooooooo..........',
    '.......oyyyyyyyyyyss........',
    '.......oyyyyyyyyyys.g.......',
    '........oooooooooo...g......',
    'fbbbbbbbnbbbnbbbnbbbnbbkttw.',
    'fbbbbbbbbbbbbbbbbbbbbbbkttt.',
    '....kbbbbbbbbbbbbbbbbbbbeee.',
    'fkkkkbbbbbbbbbbbbbbbbbbbkkb.',
    'fkkk...............bbbbbb...',
    '......................sssssw',
    '.......................bb...',
    '............................',
    '............................',
    '............................',
    '............................',
  ], M, 1);
  pixTexture(scene, 'sc_diver2', [
    'f...........................',
    'ff..........................',
    '.f..........................',
    '.fk.....oooooooooo..........',
    '..kk...oyyyyyyyyyyss........',
    '...kk..oyyyyyyyyyys.g.......',
    '....kk..oooooooooo...g......',
    '.....bbbnbbbnbbbnbbbnbbkttw.',
    '.....bbbbbbbbbbbbbbbbbbkttt.',
    '.....bbbbbbbbbbbbbbbbbbbeee.',
    '.....bbbbbbbbbbbbbbbbbbbkkb.',
    '....bb.............bbbbbb...',
    '...bb.................sssssw',
    '..bb...................bb...',
    '.fb.........................',
    '.f..........................',
    'ff..........................',
    'f...........................',
  ], M, 1);
  /* lionfish, 28x20 (drawn at 2x = 56x40, roughly the 25 px danger halo): maroon/white banded body, a tall crest of separate dorsal
     rays, a feathered pectoral fan spreading down and back, a fanned tail, a dark bar through the eye, a down-turned mouth.
     Frame 0 fins flared, frame 1 relaxed; the dead frame is the same silhouette gone grey. Faces right; the scene mirrors it. */
  pixTexture(scene, 'sc_lion0', [
    '............................',
    '.............w..............',
    '...........w.d.w............',
    '.w.........d.d.d............',
    '..d......w.d.d.d.w..........',
    '...d.....d.d.d.d.d..........',
    '....d....d.d.d.d.d.w........',
    'wd.mmmmm..rrwrrwrrwd........',
    '..dmmmmm.wrrwrrwrrwrrrk.....',
    '...mmmmmrwrrwrrwrrwrrwkwr...',
    'wddmmmmmrwrrwrrwrrwrrrkrrr..',
    '...mmmmmrwrrwrrwrrwrrrrrk...',
    '..dmmmmm.wrrwrrwrrwrrrr..k..',
    'wd.mmmmm..rrdrdwdrdddd......',
    '....d......d.d..d.d.d.dd....',
    '...d......d.d...d.d..d..dd..',
    '..d.....dd..d...d.d..d....w.',
    '.w.....d...d...d...d..d.....',
    '......d...d....d...d...w....',
    '.....w...w.....w...w........',
  ], M, 1);
  pixTexture(scene, 'sc_lion1', [
    '.............w..............',
    '...........w.d.w............',
    '...........d.d.d............',
    '.........w.d.d.d.w..........',
    '.w.......d.d.d.d.d..........',
    '..d......d.d.d.d.d.w........',
    '...d.....d.d.d.d.d.d........',
    'wd.mmmmm..rrwrrwrrwd........',
    '..dmmmmm.wrrwrrwrrwrrrk.....',
    '...mmmmmrwrrwrrwrrwrrwkwr...',
    'wddmmmmmrwrrwrrwrrwrrrkrrr..',
    '...mmmmmrwrrwrrwrrwrrrrrk...',
    '..dmmmmm.wrrwrrwrrwrrrr..k..',
    'wd.mmmmm..rrdrdwdrddd.......',
    '...d.......d.d..d.d.ddd.....',
    '..d.......d..d.d..d.d..dd...',
    '.w.......d..d..d..d..d...w..',
    '........d..d...d..d..d......',
    '.......d...d..d...d...w.....',
    '......w...w...w...w.........',
  ], M, 1);
  pixTexture(scene, 'sc_lion_dead', [
    '.............w..............',
    '...........w.d.w............',
    '...........d.d.d............',
    '.........w.d.d.d.w..........',
    '.w.......d.d.d.d.d..........',
    '..d......d.d.d.d.d.w........',
    '...d.....d.d.d.d.d.d........',
    'wd.mmmmm..rrwrrwrrwd........',
    '..dmmmmm.wrrwrrwrrwrrrk.....',
    '...mmmmmrwrrwrrwrrwrrwkwr...',
    'wddmmmmmrwrrwrrwrrwrrrkrrr..',
    '...mmmmmrwrrwrrwrrwrrrrrk...',
    '..dmmmmm.wrrwrrwrrwrrrr..k..',
    'wd.mmmmm..rrdrdwdrddd.......',
    '...d.......d.d..d.d.ddd.....',
    '..d.......d..d.d..d.d..dd...',
    '.w.......d..d..d..d..d...w..',
    '........d..d...d..d..d......',
    '.......d...d..d...d...w.....',
    '......w...w...w...w.........',
  ], { ...M, r: PAL.gray1, m: PAL.gray0, w: PAL.gray2, d: PAL.gray0, k: PAL.ink }, 1);
  pixTexture(scene, 'sc_fish_y', ['..yyy..', '.yyyyyy', 'yykyyyy', '.yyyyyy', '..yyy..'], M, 1);
  pixTexture(scene, 'sc_fish_t', ['..ttt..', '.tttttt', 'ttkttt.', '.tttttt', '..ttt..'], M, 1);
  pixTexture(scene, 'sc_fish_p', ['..ppp..', '.pppppp', 'ppkpppp', '.pppppp', '..ppp..'], M, 1);
  pixTexture(scene, 'sc_tip', ['s', 's', 'w'], M, 1);
}

export type Coral = { x: number; y: number; w: number; h: number; kind: 'brain' | 'fan' | 'branch' | 'rock' | 'anemone'; color: number };

/** Lay out the reef across the world: a wall on the right edge, clumps along the sand, ledges and bommies mid-water. */
export function layoutReef(rand: () => number, murky: boolean): Coral[] {
  const out: Coral[] = [];
  const kinds: Coral['kind'][] = ['brain', 'fan', 'branch', 'rock', 'anemone'];
  const cols = [PAL.dusk3, PAL.sun0, PAL.sun2, PAL.pink, PAL.dusk2, PAL.sun1];
  /* the wall */
  for (let y = HUD_H + 60; y < SAND_Y; y += 46 + Math.floor(rand() * 18)) out.push({ x: WW - 48 - rand() * 18, y, w: 66 + rand() * 20, h: 40 + rand() * 16, kind: 'rock', color: PAL.gray0 });
  for (let i = 0; i < 12; i++) out.push({ x: WW - 50 - rand() * 12, y: HUD_H + 90 + i * 88 + rand() * 20, w: 22 + rand() * 10, h: 22 + rand() * 12, kind: kinds[Math.floor(rand() * 3)], color: cols[Math.floor(rand() * cols.length)] });
  /* clumps along the sand */
  let x = 18;
  while (x < WW - 100) { const w = 34 + rand() * 30, h = 26 + rand() * 30; out.push({ x, y: SAND_Y - h + 6, w, h, kind: kinds[Math.floor(rand() * kinds.length)], color: cols[Math.floor(rand() * cols.length)] }); x += w + 6 + rand() * 30; }
  /* mid-water bommies and ledges to hide behind: one per ~150 px of width, staggered in height */
  for (let i = 0; i < 9; i++) {
    const bx = 60 + i * 110 + rand() * 60, by = HUD_H + 120 + rand() * (SAND_Y - HUD_H - 300); const bw = 50 + rand() * 30, bh = 40 + rand() * 20;
    out.push({ x: bx, y: by, w: bw, h: bh, kind: 'rock', color: PAL.gray0 });
    out.push({ x: bx + 8, y: by - 18, w: 36, h: 26, kind: murky ? 'branch' : kinds[Math.floor(rand() * 3)], color: cols[Math.floor(rand() * cols.length)] });
    if (rand() < 0.5) out.push({ x: bx + bw - 14, y: by - 12, w: 20, h: 18, kind: 'anemone', color: cols[Math.floor(rand() * cols.length)] });
  }
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

/** Water background over the whole world: gradient bands, dithered transitions, sand. Murky water (Miami) is greener and dimmer. */
export function drawWater(g: Phaser.GameObjects.Graphics, murky: boolean) {
  const bands = murky ? [PAL.sea1, PAL.sea1, PAL.sea0, PAL.sea0, PAL.night2, PAL.night2] : [PAL.sea2, PAL.sea1, PAL.sea1, PAL.sea0, PAL.sea0, PAL.night2];
  const bh = (SAND_Y - HUD_H) / bands.length;
  bands.forEach((c, i) => g.fillStyle(c).fillRect(0, HUD_H + i * bh, WW, bh + 1));
  bands.forEach((c, i) => { if (!i) return; const y0 = HUD_H + i * bh; g.fillStyle(bands[i - 1]); for (let x = 0; x < WW; x += 4) for (let k = 0; k < 3; k++) if (((x >> 2) + k) % 2 === 0) g.fillRect(x, y0 + k * 3, 2, 2); });
  g.fillStyle(murky ? PAL.earth2 : PAL.earth3).fillRect(0, SAND_Y, WW, WH - SAND_Y); g.fillStyle(murky ? PAL.earth1 : PAL.earth2, 0.6); for (let x = 0; x < WW; x += 9) g.fillRect(x + ((x / 9) % 2) * 3, SAND_Y + 6 + ((x / 9) % 3) * 9, 5, 1);
  g.fillStyle(PAL.sea3, murky ? 0.15 : 0.35).fillRect(0, SAND_Y, WW, 2);
  g.fillStyle(PAL.sky3, 0.15).fillRect(0, HUD_H, WW, 3);   /* the surface */
}

export function drawRays(g: Phaser.GameObjects.Graphics, t: number, murky: boolean) {
  g.clear();
  const n = murky ? 8 : 14;
  for (let i = 0; i < n; i++) { const x0 = 30 + i * (WW / n) + Math.sin(t * 0.4 + i) * 10; const a = murky ? 0.05 : 0.09 + 0.03 * Math.sin(t * 0.9 + i * 1.3); g.fillStyle(PAL.sky3, a); g.fillTriangle(x0, HUD_H, x0 + 28, HUD_H, x0 + 90 + Math.sin(t * 0.3 + i) * 12, SAND_Y - 200); }
}
