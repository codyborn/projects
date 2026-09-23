// Low-level procedural pixel-art helpers. Everything draws into canvases -> Phaser textures. Palette only.
import Phaser from 'phaser';
import { PAL, PAL_LIST, hex } from '../core/palette';

export const H = hex;
export type Ctx = CanvasRenderingContext2D;

/** Seeded RNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { next, int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)), pick: <T>(arr: T[]) => arr[Math.floor(next() * arr.length)], chance: (p: number) => next() < p };
}
export function seedOf(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Make a crisp canvas of w x h and draw into it. */
export function makeCanvas(w: number, h: number, draw: (ctx: Ctx) => void): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d')!; ctx.imageSmoothingEnabled = false; draw(ctx); return c;
}
/** Create (or replace) a Phaser texture from a canvas drawing. Returns key. */
export function px(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void): string {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, makeCanvas(w, h, draw));
  return key;
}
/** Create a spritesheet texture from a canvas of frames laid out horizontally. */
export function pxSheet(scene: Phaser.Scene, key: string, fw: number, fh: number, frames: number, draw: (ctx: Ctx, frame: number) => void, rows = 1): string {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const perRow = Math.ceil(frames / rows);
  const c = makeCanvas(fw * perRow, fh * rows, ctx => {
    for (let f = 0; f < frames; f++) { ctx.save(); ctx.translate((f % perRow) * fw, Math.floor(f / perRow) * fh); ctx.beginPath(); ctx.rect(0, 0, fw, fh); ctx.clip(); draw(ctx, f); ctx.restore(); }
  });
  scene.textures.addSpriteSheet(key, c as any, { frameWidth: fw, frameHeight: fh });
  return key;
}

export const P = (ctx: Ctx, x: number, y: number, c: number, w = 1, h = 1) => { ctx.fillStyle = H(c); ctx.fillRect(Math.round(x), Math.round(y), w, h); };
export const R = (ctx: Ctx, x: number, y: number, w: number, h: number, c: number) => { ctx.fillStyle = H(c); ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export function rectOutline(ctx: Ctx, x: number, y: number, w: number, h: number, fill: number, line: number) { R(ctx, x, y, w, h, line); R(ctx, x + 1, y + 1, w - 2, h - 2, fill); }
export function circle(ctx: Ctx, cx: number, cy: number, r: number, c: number) {
  for (let y = -r; y <= r; y++) { const hw = Math.floor(Math.sqrt(r * r - y * y) + 0.5); R(ctx, cx - hw, cy + y, hw * 2 + 1, 1, c); }
}
export function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, c: number) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
  for (;;) { P(ctx, x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
}
const BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const BAYER2 = [[0, 2], [3, 1]];
/** Ordered-dither vertical gradient between palette colors (stops = [color,...] top->bottom). */
export function ditherGradient(ctx: Ctx, x: number, y: number, w: number, h: number, stops: number[], size: 2 | 4 = 4) {
  const n = stops.length - 1; if (n <= 0) { R(ctx, x, y, w, h, stops[0]); return; }
  const M = size === 4 ? BAYER4 : BAYER2, mm = size * size;
  for (let yy = 0; yy < h; yy++) {
    const t = (yy / Math.max(1, h - 1)) * n; const i = Math.min(n - 1, Math.floor(t)); const f = t - i;
    for (let xx = 0; xx < w; xx++) { const th = (M[(y + yy) % size][(x + xx) % size] + 0.5) / mm; P(ctx, x + xx, y + yy, f > th ? stops[i + 1] : stops[i]); }
  }
}
/** Dithered horizontal blend region. */
export function ditherH(ctx: Ctx, x: number, y: number, w: number, h: number, a: number, b: number) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const t = xx / Math.max(1, w - 1); const th = (BAYER4[(y + yy) % 4][(x + xx) % 4] + 0.5) / 16; P(ctx, x + xx, y + yy, t > th ? b : a); }
}
/** Speckle noise fill (stars, sand, texture). */
export function speckle(ctx: Ctx, x: number, y: number, w: number, h: number, c: number, density: number, r: ReturnType<typeof rng>) {
  const n = Math.floor(w * h * density); for (let i = 0; i < n; i++) P(ctx, x + r.int(0, w - 1), y + r.int(0, h - 1), c);
}
/** 1px outline around all opaque pixels of the canvas region (in place). */
export function outline(ctx: Ctx, w: number, h: number, c: number) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data, out = new Uint8ClampedArray(d);
  const [rr, gg, bb] = [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; if (d[i + 3] > 0) continue;
    let near = false;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + ox, ny = y + oy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; if (d[(ny * w + nx) * 4 + 3] > 0) { near = true; break; } }
    if (near) { out[i] = rr; out[i + 1] = gg; out[i + 2] = bb; out[i + 3] = 255; }
  }
  img.data.set(out); ctx.putImageData(img, 0, 0);
}
/** Snap every opaque pixel to the nearest palette color. */
export function quantize(ctx: Ctx, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  const pal = PAL_LIST.map(c => [(c >> 16) & 255, (c >> 8) & 255, c & 255]);
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue; let best = 0, bd = 1e9;
    for (let k = 0; k < pal.length; k++) { const p = pal[k]; const dd = (p[0] - d[i]) ** 2 + (p[1] - d[i + 1]) ** 2 + (p[2] - d[i + 2]) ** 2; if (dd < bd) { bd = dd; best = k; } }
    d[i] = pal[best][0]; d[i + 1] = pal[best][1]; d[i + 2] = pal[best][2];
  }
  ctx.putImageData(img, 0, 0);
}
/** Draw a 5-bit-row glyph pattern (array of strings of '0'/'1'/'.') at x,y scaled. */
export function glyph(ctx: Ctx, pat: string[], x: number, y: number, c: number, s = 1) {
  pat.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) if (row[rx] === '1' || row[rx] === '#') R(ctx, x + rx * s, y + ry * s, s, s, c); });
}
export const PALX = PAL;
