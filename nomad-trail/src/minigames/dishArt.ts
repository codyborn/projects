// Hand-authored pixel art for every dish: a vessel plus 2 to 5 layers, drawn on a 96x64 canvas in 2 px chunks
// (a 48x32 grid) with 1 px ink outlines. Palette colours only. `drawDish(scene, id, upTo)` renders the vessel plus the
// first `upTo` layers (progressive reveal while cooking) and caches the texture under `dish_<id>_<n>`.
import type Phaser from 'phaser';
import { PAL, type PalKey } from '../core/palette';

export type Vessel = 'plate' | 'bowl' | 'board' | 'mat' | 'stick' | 'glass' | 'cone' | 'basket' | 'boat' | 'slice' | 'pan' | 'grill' | 'tagine' | 'thali' | 'tray' | 'stonebowl' | 'paper';
export type Shape = 'mound' | 'slices' | 'noodles' | 'sauce' | 'cubes' | 'leaves' | 'egg' | 'steam' | 'sprinkles' | 'wedge' | 'patty' | 'bun' | 'bunbottom' | 'fries' | 'sticks'
  | 'ring' | 'fish' | 'shrimp' | 'dome' | 'stripes' | 'pile' | 'roll' | 'nigiri' | 'dumpling' | 'claw' | 'stack' | 'sausage' | 'pretzel' | 'shot' | 'cup' | 'medley' | 'halfmoon' | 'nori' | 'tart' | 'waffle' | 'yolk' | 'chopsticks' | 'grate' | 'bread' | 'tortilla';
export interface Layer { s: Shape; c?: PalKey; c2?: PalKey; c3?: PalKey; x?: number; y?: number; w?: number; h?: number; n?: number; }
export interface DishArtSpec { vessel: Vessel; vc?: PalKey; layers: Layer[]; }

const U = 2;                       // pixels per grid unit
const GW = 48, GH = 32;            // grid size (96x64 px)
export const DISH_TEX_W = GW * U, DISH_TEX_H = GH * U;

// Content anchor per vessel (grid units): where the food sits.
const ANCHOR: Record<Vessel, { x: number; y: number }> = {
  plate: { x: 24, y: 19 }, bowl: { x: 24, y: 17 }, board: { x: 24, y: 18 }, mat: { x: 24, y: 18 }, stick: { x: 24, y: 17 }, glass: { x: 24, y: 18 }, cone: { x: 24, y: 13 },
  basket: { x: 24, y: 17 }, boat: { x: 24, y: 16 }, slice: { x: 24, y: 17 }, pan: { x: 22, y: 18 }, grill: { x: 24, y: 17 }, tagine: { x: 24, y: 17 }, thali: { x: 24, y: 18 }, tray: { x: 24, y: 18 }, stonebowl: { x: 24, y: 17 }, paper: { x: 24, y: 19 },
};

// deterministic scatter
function scatter(seed: number, n: number, w: number, h: number) { const out: { x: number; y: number }[] = []; let s = seed * 9301 + 49297; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; const a = (s % 1000) / 1000; s = (s * 1103515245 + 12345) & 0x7fffffff; const b = (s % 1000) / 1000; out.push({ x: Math.round((a - 0.5) * w), y: Math.round((b - 0.5) * h) }); } return out; }

class Px {
  constructor(public ctx: CanvasRenderingContext2D) {}
  col(k: PalKey | number) { const v = typeof k === 'number' ? k : PAL[k]; return '#' + v.toString(16).padStart(6, '0'); }
  rect(x: number, y: number, w: number, h: number, c: PalKey | number) { this.ctx.fillStyle = this.col(c); this.ctx.fillRect(Math.round(x) * U, Math.round(y) * U, Math.round(w) * U, Math.round(h) * U); }
  dot(x: number, y: number, c: PalKey | number) { this.rect(x, y, 1, 1, c); }
  /** filled ellipse in grid units, with 1 px ink outline (outline drawn as a 1-unit ring in ink first when `outline`) */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: PalKey | number, outline = true) {
    if (outline) this.ellipseRaw(cx, cy, rx + 0.6, ry + 0.6, 'ink');
    this.ellipseRaw(cx, cy, rx, ry, c);
  }
  ellipseRaw(cx: number, cy: number, rx: number, ry: number, c: PalKey | number) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) { const dy = (y + 0.5 - cy) / ry; if (Math.abs(dy) > 1) continue; const hw = rx * Math.sqrt(1 - dy * dy); const x0 = Math.round(cx - hw), x1 = Math.round(cx + hw); if (x1 > x0) this.rect(x0, y, x1 - x0, 1, c); }
  }
  /** rounded-ish filled rect with ink outline */
  box(x: number, y: number, w: number, h: number, c: PalKey | number, outline = true) {
    if (outline) { this.rect(x - 0.5, y, w + 1, h, 'ink'); this.rect(x, y - 0.5, w, h + 1, 'ink'); }
    this.rect(x, y, w, h, c);
  }
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: PalKey | number) {
    const ys = [y0, y1, y2]; const minY = Math.floor(Math.min(...ys)), maxY = Math.ceil(Math.max(...ys));
    for (let y = minY; y <= maxY; y++) { const xs: number[] = []; const edge = (ax: number, ay: number, bx: number, by: number) => { if ((y + 0.5 >= Math.min(ay, by)) && (y + 0.5 < Math.max(ay, by))) xs.push(ax + (y + 0.5 - ay) * (bx - ax) / (by - ay)); }; edge(x0, y0, x1, y1); edge(x1, y1, x2, y2); edge(x2, y2, x0, y0); if (xs.length >= 2) { const a = Math.round(Math.min(...xs)), b = Math.round(Math.max(...xs)); if (b > a) this.rect(a, y, b - a, 1, c); } }
  }
}

function drawVessel(p: Px, v: Vessel, vc?: PalKey) {
  const cx = 24;
  switch (v) {
    case 'plate': p.ellipse(cx, 21, 21, 9, vc ?? 'white'); p.ellipseRaw(cx, 21, 15, 6, 'gray2'); p.ellipseRaw(cx, 20.5, 14, 5.5, vc ?? 'white'); break;
    case 'paper': p.box(4, 12, 40, 18, vc ?? 'gray2'); p.rect(5, 13, 38, 16, 'white'); for (let i = 0; i < 6; i++) p.rect(6 + i * 6, 27, 3, 1, 'gray2'); break;
    case 'thali': p.ellipse(cx, 21, 22, 9, 'gray2'); p.ellipseRaw(cx, 21, 19, 7, 'gray1'); p.ellipseRaw(cx, 20, 18, 6.5, 'gray2'); break;
    case 'bowl': p.ellipse(cx, 24, 17, 6, vc ?? 'sea0'); p.rect(7, 17, 34, 7, vc ?? 'sea0'); p.rect(6.5, 17, 1, 7, 'ink'); p.rect(40.5, 17, 1, 7, 'ink'); p.ellipse(cx, 17, 17, 6, vc ?? 'sea0'); p.ellipseRaw(cx, 17, 15, 5, 'night1'); break;
    case 'stonebowl': p.ellipse(cx, 24, 17, 6, 'gray0'); p.rect(7, 16, 34, 8, 'gray0'); p.rect(6.5, 16, 1, 8, 'ink'); p.rect(40.5, 16, 1, 8, 'ink'); p.ellipse(cx, 16, 17, 6, 'gray0'); p.ellipseRaw(cx, 16, 15, 5, 'ink'); break;
    case 'board': p.box(5, 12, 38, 16, 'earth2'); p.rect(6, 13, 36, 2, 'earth3'); p.rect(6, 25, 36, 2, 'earth1'); p.box(43, 17, 3, 6, 'earth2'); break;
    case 'mat': p.box(5, 11, 38, 17, 'grass0'); for (let i = 0; i < 12; i++) p.rect(6 + i * 3, 12, 1, 15, 'earth3'); break;
    case 'tray': p.box(6, 11, 36, 17, 'earth3'); for (let i = 0; i < 8; i++) p.rect(7, 12 + i * 2, 34, 1, 'earth2'); p.box(11, 27, 26, 2, 'earth1', false); break;
    case 'stick': p.rect(4, 19.5, 40, 1, 'earth1'); p.rect(2, 19, 4, 2, 'earth0'); break;
    case 'glass': p.box(17, 6, 14, 22, 'gray2'); p.rect(18, 7, 12, 20, 'sky3'); p.rect(18, 7, 2, 18, 'white'); break;
    case 'cone': p.tri(12, 6, 36, 6, 24, 30, 'ink'); p.tri(13, 7, 35, 7, 24, 28, 'white'); p.tri(15, 8, 24, 8, 21, 20, 'gray2'); break;
    case 'basket': p.ellipse(cx, 22, 18, 6, 'earth3'); p.rect(6, 15, 36, 7, 'earth3'); p.rect(5.5, 15, 1, 7, 'ink'); p.rect(41.5, 15, 1, 7, 'ink'); for (let i = 0; i < 6; i++) p.rect(8 + i * 6, 16, 1, 6, 'earth2'); p.ellipse(cx, 15, 18, 6, 'earth3'); p.ellipseRaw(cx, 15, 16, 5, 'earth2'); for (let i = 0; i < 5; i++) p.rect(10, 12 + i * 1.6, 28, 0.6, 'earth1'); break;
    case 'boat': p.ellipse(cx, 22, 19, 7, 'earth3'); p.ellipseRaw(cx, 21, 17, 5.5, 'sun3'); p.rect(5, 15, 38, 7, 'earth3'); p.rect(4.5, 15, 1, 8, 'ink'); p.rect(42.5, 15, 1, 8, 'ink'); p.ellipse(cx, 15, 19, 5, 'earth3', false); p.rect(6, 15, 36, 1, 'earth2'); break;
    case 'slice': p.tri(8, 6, 40, 6, 24, 30, 'ink'); p.tri(9, 7, 39, 7, 24, 28, 'earth3'); p.rect(9, 7, 30, 3, 'earth2'); break;
    case 'pan': p.ellipse(22, 19, 17, 8, 'gray0'); p.ellipseRaw(22, 19, 15, 7, 'ink'); p.rect(38, 18, 9, 2, 'gray0'); p.rect(38, 17.5, 9, 0.6, 'gray1'); break;
    case 'grill': p.box(5, 9, 38, 20, 'ink'); for (let i = 0; i < 9; i++) p.rect(6, 10 + i * 2.2, 36, 1, 'gray0'); p.rect(6, 10, 36, 1, 'gray1'); break;
    case 'tagine': p.ellipse(cx, 22, 20, 7, 'sun0'); p.ellipseRaw(cx, 21, 18, 6, 'earth2'); p.ellipseRaw(cx, 20.5, 17, 5.5, 'sun0'); p.tri(40, 8, 46, 8, 43, 3, 'sun0'); p.rect(39, 8, 8, 2, 'earth2'); break;
  }
}

function drawLayer(p: Px, v: Vessel, L: Layer, idx: number) {
  const a = ANCHOR[v]; const cx = a.x + (L.x ?? 0), cy = a.y + (L.y ?? 0); const c = L.c ?? 'sun1', c2 = L.c2, c3 = L.c3; const n = L.n ?? 3; const w = L.w ?? 16, h = L.h ?? 7;
  switch (L.s) {
    case 'mound': p.ellipse(cx, cy, w / 2, h / 2, c); if (c2) p.ellipseRaw(cx - w / 6, cy - h / 6, w / 5, h / 5, c2); break;
    case 'dome': p.ellipse(cx, cy, w / 2, h / 2, c); p.rect(cx - w / 2, cy, w, 1, c); if (c2) p.ellipseRaw(cx - w / 5, cy - h / 5, w / 6, h / 6, c2); break;
    case 'sauce': p.ellipse(cx, cy, w / 2, h / 2, c, false); if (c2) p.ellipseRaw(cx + w / 8, cy, w / 6, h / 6, c2); break;
    case 'slices': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 2.5 + i * 5; p.box(x - 2.5, cy - 1.5 + (i % 2), 5, 3, c); if (c2) p.rect(x - 1.5, cy - 0.5 + (i % 2), 3, 1, c2); } break;
    case 'medley': { const cols: PalKey[] = [c, c2 ?? c, c3 ?? c]; for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 1.8 + i * 3.6; p.ellipse(x, cy, 2, 2.5, cols[i % 3]); p.dot(x, cy - 1, 'sun3'); } break; }
    case 'noodles': for (let i = 0; i < 4; i++) { const y = cy - 2 + i * 1.4; for (let x = cx - w / 2; x < cx + w / 2; x += 2) p.rect(x, y + ((Math.floor(x / 2) + i) % 2) * 0.6, 2, 1, c); } if (c2) for (let i = 0; i < 3; i++) p.rect(cx - w / 2 + 2 + i * 6, cy - 1 + i * 0.5, 3, 1, c2); break;
    case 'cubes': for (const s of scatter(idx + 1, n, w, h)) { p.box(cx + s.x - 1.5, cy + s.y - 1.5, 3, 3, c); if (c2) p.dot(cx + s.x - 1, cy + s.y - 1, c2); } break;
    case 'pile': for (const s of scatter(idx + 7, n, w, h)) { p.ellipse(cx + s.x, cy + s.y, 2, 1.5, c); if (c2) p.dot(cx + s.x, cy + s.y - 1, c2); } break;
    case 'leaves': for (const s of scatter(idx + 3, n, w, h)) { p.rect(cx + s.x - 1, cy + s.y, 3, 1, c); p.rect(cx + s.x, cy + s.y - 1, 1, 3, c); } break;
    case 'sprinkles': for (const s of scatter(idx + 5, n, w, h)) p.dot(cx + s.x, cy + s.y, c); break;
    case 'egg': p.ellipse(cx, cy, 4, 3, 'white'); p.ellipse(cx, cy, 1.6, 1.3, c2 ?? 'sun2', false); break;
    case 'yolk': p.ellipse(cx, cy, 2.2, 1.8, c2 ?? 'sun2'); p.dot(cx - 1, cy - 1, 'sun3'); break;
    case 'wedge': p.tri(cx - 3, cy + 2, cx + 3, cy + 2, cx, cy - 3, 'ink'); p.tri(cx - 2, cy + 1.5, cx + 2, cy + 1.5, cx, cy - 2, c); p.tri(cx - 1, cy + 1, cx + 1, cy + 1, cx, cy - 0.5, c2 ?? 'sun3'); break;
    case 'patty': p.box(cx - w / 2, cy - h / 2, w, h, c); p.rect(cx - w / 2 + 1, cy - h / 2, w - 2, 1, c2 ?? 'earth1'); break;
    case 'bunbottom': p.box(cx - w / 2, cy, w, 2, c); break;
    case 'bun': p.ellipse(cx, cy, w / 2, h / 2, c); p.rect(cx - w / 2, cy, w, 1, c); for (let i = 0; i < 4; i++) p.dot(cx - 5 + i * 3, cy - 2 + (i % 2), 'sun3'); break;
    case 'fries': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 1.5 + i * 3; const hh = h + (i % 3); p.rect(x - 0.5, cy - hh + 1, 2, hh, 'ink'); p.rect(x, cy - hh + 1, 1, hh, c); } break;
    case 'sticks': for (let i = 0; i < n; i++) { const y = cy - (n - 1) * 1.2 + i * 2.4; p.box(cx - w / 2, y, w, 1, c); } break;
    case 'chopsticks': p.rect(cx + 8, cy - 9, 1, 18, 'earth1'); p.rect(cx + 10, cy - 9, 1, 18, 'earth1'); break;
    case 'ring': p.ellipse(cx, cy, w / 2, h / 2, c); p.ellipse(cx, cy, w / 5, h / 5, c2 ?? 'white', false); if (c3) for (let i = 0; i < 6; i++) p.dot(cx - 5 + i * 2, cy - 2 + (i % 2) * 4, c3); break;
    case 'fish': p.ellipse(cx, cy, w / 2, h / 2, c); p.tri(cx + w / 2 - 1, cy, cx + w / 2 + 3, cy - 3, cx + w / 2 + 3, cy + 3, c); p.dot(cx - w / 2 + 2, cy - 1, 'ink'); if (c2) p.rect(cx - 2, cy - 1, 4, 1, c2); break;
    case 'shrimp': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 3 + i * 6, y = cy + (i % 2); p.ellipse(x, y, 2.5, 1.5, c); p.rect(x + 1, y - 2, 1, 2, c); p.dot(x - 2, y, c2 ?? 'sun3'); } break;
    case 'stripes': for (let i = 0; i < n; i++) { const y = cy - (n - 1) * 1.5 + i * 3; p.box(cx - w / 2, y, w, 2, c); p.rect(cx - w / 2 + 1, y + 0.5, w - 2, 0.6, c2 ?? 'sun3'); } break;
    case 'roll': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 3 + i * 6; p.ellipse(x, cy, 2.6, 2.6, c); p.ellipse(x, cy, 1.8, 1.8, c2 ?? 'white', false); p.dot(x, cy, c3 ?? 'red'); } break;
    case 'nigiri': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 4 + i * 8; p.box(x - 3, cy - 0.5, 6, 2.5, 'white'); p.box(x - 3.5, cy - 2.5, 7, 2, i % 2 ? (c2 ?? 'sun0') : c); } break;
    case 'dumpling': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 3 + i * 6, y = cy + (i % 2) * 1.2; p.ellipse(x, y, 3, 2.2, c); p.rect(x - 1.5, y - 2.5, 3, 1, c); p.dot(x - 1, y - 1.5, 'ink'); p.dot(x + 1, y - 1.5, 'ink'); if (c2) p.dot(x, y + 0.5, c2); } break;
    case 'halfmoon': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 5 + i * 10; p.tri(x - 5, cy + 2, x + 5, cy + 2, x, cy - 4, 'ink'); p.ellipse(x, cy + 1, 5, 2.4, c); p.rect(x - 4, cy - 1, 8, 1, c2 ?? 'earth2'); for (let k = 0; k < 4; k++) p.dot(x - 3 + k * 2, cy + 1, c2 ?? 'earth2'); } break;
    case 'claw': p.ellipse(cx, cy, 5, 3, c); p.tri(cx + 3, cy - 3, cx + 9, cy - 5, cx + 7, cy - 1, c); p.tri(cx + 3, cy + 1, cx + 9, cy + 3, cx + 7, cy - 1, c); p.rect(cx + 6, cy - 4, 2, 1, 'ink'); p.rect(cx - 4, cy - 1, 1, 2, 'sun3'); break;
    case 'stack': for (let i = 0; i < n; i++) { p.ellipse(cx, cy - i * 1.5, w / 2, 2, i % 2 ? (c2 ?? c) : c); } break;
    case 'sausage': for (let i = 0; i < n; i++) { const y = cy - (n - 1) * 2 + i * 4; p.ellipse(cx - w / 2 + 1.5, y, 1.6, 1.6, c); p.ellipse(cx + w / 2 - 1.5, y, 1.6, 1.6, c); p.box(cx - w / 2 + 1, y - 1.5, w - 2, 3, c); p.rect(cx - w / 2 + 3, y - 1, w - 6, 0.6, c2 ?? 'gray2'); } break;
    case 'pretzel': p.ellipse(cx, cy, 6, 4.5, c); p.ellipse(cx - 2.5, cy + 0.5, 1.7, 1.4, 'white', false); p.ellipse(cx + 2.5, cy + 0.5, 1.7, 1.4, 'white', false); p.ellipse(cx, cy - 2, 1.5, 1.1, 'white', false); for (let i = 0; i < 5; i++) p.dot(cx - 4 + i * 2, cy - 3 + (i % 2) * 5, 'white'); break;
    case 'shot': p.box(cx - 2, cy - 4, 4, 5, 'gray2'); p.rect(cx - 1.5, cy - 2, 3, 2.5, c); break;
    case 'cup': p.ellipse(cx, cy + 2, 4, 1.6, c2 ?? 'gray2'); p.rect(cx - 4, cy - 2, 8, 4, c2 ?? 'gray2'); p.rect(cx - 4.5, cy - 2, 1, 4, 'ink'); p.rect(cx + 3.5, cy - 2, 1, 4, 'ink'); p.ellipse(cx, cy - 2, 4, 1.6, c2 ?? 'gray2'); p.ellipseRaw(cx, cy - 2, 3, 1.1, c); break;
    case 'nori': p.box(cx - 2.5, cy - 4, 5, 5, 'ink'); p.rect(cx - 2, cy - 3.5, 4, 4, 'grass0'); break;
    case 'tart': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 4.5 + i * 9; p.ellipse(x, cy, 4.2, 2.8, 'earth3'); p.ellipse(x, cy - 0.3, 3, 2, c, false); p.dot(x - 1, cy - 1, 'earth0'); p.dot(x + 1.5, cy, 'earth0'); } break;
    case 'waffle': p.ellipse(cx, cy, w / 2, h / 2, c); for (let i = -3; i <= 3; i++) { p.rect(cx + i * 2, cy - h / 2 + 1, 0.6, h - 2, c2 ?? 'earth1'); } for (let j = -1; j <= 1; j++) p.rect(cx - w / 2 + 2, cy + j * 1.8, w - 4, 0.6, c2 ?? 'earth1'); break;
    case 'grate': for (let i = 0; i < n; i++) p.rect(cx - w / 2, cy - h / 2 + i * 2, w, 0.6, c); break;
    case 'bread': p.box(cx - w / 2, cy - h / 2, w, h, c); p.rect(cx - w / 2 + 1, cy - h / 2 + 1, w - 2, 1, c2 ?? 'earth3'); break;
    case 'tortilla': p.ellipse(cx, cy + 1, w / 2, h / 2, c); p.ellipse(cx, cy, w / 2 - 1, h / 2 - 1, c2 ?? 'sun3', false); break;
    case 'steam': for (let i = 0; i < n; i++) { const x = cx - (n - 1) * 3 + i * 6; for (let k = 0; k < 4; k++) p.dot(x + ((k + i) % 2), cy - 8 - k * 2, 'gray2'); } break;
  }
}

/** One spec per dish, keyed by id. */
export const dishArtSpecs: Record<string, DishArtSpec> = {
  // --- USA
  stonecrab: { vessel: 'plate', layers: [{ s: 'sauce', c: 'sun3', x: -6, y: 1, w: 12, h: 4 }, { s: 'claw', c: 'sun0', x: 2, y: -1 }, { s: 'claw', c: 'sun0', x: -8, y: 2 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 12, y: 0 }] },
  cubano: { vessel: 'board', layers: [{ s: 'bunbottom', c: 'earth3', w: 26 }, { s: 'stripes', c: 'dusk3', c2: 'pink', n: 1, w: 24, y: -1 }, { s: 'patty', c: 'earth2', c2: 'earth3', w: 24, h: 2, y: -3 }, { s: 'sticks', c: 'sun3', n: 1, w: 22, y: -5 }, { s: 'patty', c: 'earth3', c2: 'sun3', w: 26, h: 3, y: -7 }] },
  pizza: { vessel: 'slice', layers: [{ s: 'sauce', c: 'red', w: 20, h: 14, y: -2 }, { s: 'mound', c: 'sun3', c2: 'white', w: 16, h: 11, y: -2 }, { s: 'leaves', c: 'grass1', n: 3, w: 10, h: 6, y: -2 }] },
  bagel: { vessel: 'plate', layers: [{ s: 'ring', c: 'earth2', c2: 'white', c3: 'ink', w: 22, h: 10 }, { s: 'mound', c: 'white', w: 14, h: 5, y: -1 }, { s: 'slices', c: 'sun0', c2: 'pink', n: 3, y: -2 }, { s: 'sprinkles', c: 'grass0', n: 6, w: 12, h: 4, y: -2 }] },
  greenchile: { vessel: 'bowl', layers: [{ s: 'sauce', c: 'grass1', w: 26, h: 8 }, { s: 'cubes', c: 'earth3', c2: 'earth2', n: 4, w: 18, h: 4 }, { s: 'cubes', c: 'sun3', n: 3, w: 16, h: 4, y: 1 }, { s: 'sprinkles', c: 'grass3', n: 5, w: 20, h: 5 }] },
  bisonburger: { vessel: 'plate', layers: [{ s: 'bunbottom', c: 'earth3', w: 18, y: 1 }, { s: 'patty', c: 'earth0', c2: 'earth1', w: 18, h: 3, y: -1 }, { s: 'sticks', c: 'sun1', n: 1, w: 20, y: -3 }, { s: 'ring', c: 'white', c2: 'white', w: 8, h: 2, y: -4 }, { s: 'bun', c: 'earth3', w: 18, h: 6, y: -6 }] },
  huckleberry: { vessel: 'plate', layers: [{ s: 'stack', c: 'sun1', c2: 'sun2', n: 3, w: 20, y: 1 }, { s: 'sauce', c: 'earth1', w: 14, h: 3, y: -3 }, { s: 'pile', c: 'dusk1', c2: 'dusk3', n: 6, w: 16, h: 4, y: -4 }, { s: 'cubes', c: 'sun3', n: 1, w: 1, h: 1, y: -6 }] },
  buffet: { vessel: 'plate', layers: [{ s: 'mound', c: 'earth2', c2: 'earth3', w: 12, h: 6, x: -7 }, { s: 'mound', c: 'sun1', w: 10, h: 5, x: 6, y: 1 }, { s: 'fries', c: 'sun2', n: 4, h: 5, x: 10, y: -1 }, { s: 'shrimp', c: 'sun0', n: 2, x: -4, y: -3 }, { s: 'egg', x: 2, y: -2 }] },
  chili: { vessel: 'bowl', vc: 'gray0', layers: [{ s: 'sauce', c: 'red', w: 26, h: 8 }, { s: 'pile', c: 'earth1', c2: 'earth2', n: 7, w: 20, h: 5 }, { s: 'cubes', c: 'white', n: 3, w: 16, h: 3, y: -1 }, { s: 'sprinkles', c: 'sun2', n: 6, w: 18, h: 4, y: -1 }] },
  fishtacos: { vessel: 'boat', layers: [{ s: 'cubes', c: 'white', c2: 'earth3', n: 4, w: 24, h: 3 }, { s: 'leaves', c: 'grass2', n: 6, w: 26, h: 3, y: -1 }, { s: 'sauce', c: 'white', w: 12, h: 2, y: -3 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 16, y: 3 }] },
  poutine: { vessel: 'tray', layers: [{ s: 'fries', c: 'sun2', n: 9, h: 8, y: 2 }, { s: 'pile', c: 'white', c2: 'sun3', n: 6, w: 22, h: 4, y: -3 }, { s: 'sauce', c: 'earth1', w: 20, h: 4, y: -1 }] },
  // --- Mexico / Central America
  tacos: { vessel: 'boat', layers: [{ s: 'cubes', c: 'sun0', c2: 'earth2', n: 6, w: 26, h: 3 }, { s: 'cubes', c: 'sun2', c2: 'sun3', n: 3, w: 20, h: 3, y: -1 }, { s: 'leaves', c: 'grass2', n: 5, w: 24, h: 2, y: -2 }, { s: 'sprinkles', c: 'white', n: 6, w: 22, h: 3, y: -2 }] },
  bajatacos: { vessel: 'boat', layers: [{ s: 'stripes', c: 'sun1', c2: 'sun2', n: 1, w: 18, y: 0 }, { s: 'leaves', c: 'grass3', n: 6, w: 26, h: 3, y: -2 }, { s: 'sauce', c: 'white', w: 10, h: 2, y: -3 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 15, y: 3 }, { s: 'sprinkles', c: 'red', n: 3, w: 16, h: 2, y: -3 }] },
  conchsoup: { vessel: 'bowl', vc: 'sun0', layers: [{ s: 'sauce', c: 'sun3', w: 26, h: 8 }, { s: 'cubes', c: 'white', c2: 'pink', n: 4, w: 18, h: 4 }, { s: 'slices', c: 'sun1', c2: 'sun2', n: 3, y: 1 }, { s: 'leaves', c: 'grass2', n: 3, w: 16, h: 3, y: -2 }] },
  baleada: { vessel: 'plate', layers: [{ s: 'tortilla', c: 'earth3', c2: 'sun3', w: 24, h: 9, y: 1 }, { s: 'mound', c: 'earth0', w: 18, h: 3, y: 0 }, { s: 'sprinkles', c: 'white', n: 7, w: 16, h: 2, y: 0 }, { s: 'egg', x: 5, y: -2 }, { s: 'patty', c: 'earth3', c2: 'sun3', w: 24, h: 4, y: -4 }] },
  // --- South America
  ceviche: { vessel: 'bowl', vc: 'white', layers: [{ s: 'cubes', c: 'white', c2: 'sky3', n: 6, w: 22, h: 5 }, { s: 'slices', c: 'dusk3', c2: 'pink', n: 3, y: -1 }, { s: 'leaves', c: 'grass2', n: 4, w: 18, h: 3, y: -2 }, { s: 'sprinkles', c: 'red', n: 4, w: 18, h: 3 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 11, y: -2 }] },
  completo: { vessel: 'plate', layers: [{ s: 'bunbottom', c: 'earth3', w: 28, y: 1 }, { s: 'sausage', c: 'earth1', c2: 'earth2', n: 1, w: 26, y: -1 }, { s: 'cubes', c: 'red', n: 4, w: 22, h: 2, y: -3 }, { s: 'mound', c: 'grass2', c2: 'grass3', w: 24, h: 4, y: -4 }, { s: 'sauce', c: 'white', w: 18, h: 2, y: -6 }] },
  asado: { vessel: 'board', layers: [{ s: 'stripes', c: 'earth0', c2: 'dusk3', n: 3, w: 22, y: 0 }, { s: 'sauce', c: 'grass1', c2: 'grass2', w: 10, h: 4, x: 14, y: 3 }, { s: 'sprinkles', c: 'white', n: 6, w: 20, h: 4, y: -1 }] },
  empanada: { vessel: 'plate', layers: [{ s: 'halfmoon', c: 'sun1', c2: 'earth2', n: 3, y: -1 }, { s: 'sprinkles', c: 'earth1', n: 4, w: 24, h: 3, y: -2 }] },
  // --- Iberia
  pasteldenata: { vessel: 'plate', layers: [{ s: 'tart', c: 'sun2', n: 3 }, { s: 'sprinkles', c: 'earth1', n: 5, w: 26, h: 3, y: -1 }, { s: 'sprinkles', c: 'white', n: 4, w: 24, h: 2 }] },
  bacalhau: { vessel: 'plate', layers: [{ s: 'noodles', c: 'sun2', c2: 'sun1', w: 22, y: 1 }, { s: 'mound', c: 'sun3', c2: 'white', w: 16, h: 5, y: -1 }, { s: 'cubes', c: 'white', n: 3, w: 14, h: 3, y: -1 }, { s: 'sprinkles', c: 'ink', n: 4, w: 18, h: 3, y: -1 }, { s: 'leaves', c: 'grass1', n: 3, w: 14, h: 2, y: -2 }] },
  paella: { vessel: 'pan', layers: [{ s: 'sauce', c: 'sun1', w: 28, h: 12 }, { s: 'sprinkles', c: 'sun2', n: 10, w: 26, h: 8 }, { s: 'shrimp', c: 'sun0', c2: 'sun3', n: 3, y: -1 }, { s: 'slices', c: 'red', c2: 'sun0', n: 3, y: 3 }, { s: 'wedge', c: 'sun2', c2: 'sun3', x: 11, y: -3 }] },
  tortilla: { vessel: 'plate', layers: [{ s: 'dome', c: 'sun1', c2: 'sun2', w: 22, h: 7, y: -1 }, { s: 'wedge', c: 'sun3', c2: 'sun2', x: 5, y: 1 }, { s: 'sprinkles', c: 'earth2', n: 5, w: 18, h: 4, y: -1 }] },
  // --- UK / Benelux / France
  fishandchips: { vessel: 'paper', layers: [{ s: 'fries', c: 'sun2', n: 7, h: 7, x: 9, y: 4 }, { s: 'fish', c: 'sun1', c2: 'earth3', w: 18, h: 7, x: -6 }, { s: 'pile', c: 'grass1', c2: 'grass2', n: 6, w: 10, h: 4, x: -12, y: 4 }, { s: 'wedge', c: 'sun2', c2: 'sun3', x: 4, y: -4 }] },
  sundayroast: { vessel: 'plate', layers: [{ s: 'stripes', c: 'earth1', c2: 'pink', n: 2, w: 12, x: -8 }, { s: 'cubes', c: 'sun1', c2: 'sun2', n: 3, w: 8, h: 4, x: 6, y: 1 }, { s: 'sticks', c: 'sun0', n: 2, w: 8, x: 8, y: -3 }, { s: 'dome', c: 'earth3', c2: 'sun3', w: 8, h: 5, x: 0, y: -3 }, { s: 'sauce', c: 'earth0', w: 14, h: 2, y: 3 }] },
  moules: { vessel: 'bowl', vc: 'gray1', layers: [{ s: 'sauce', c: 'sun3', w: 26, h: 8 }, { s: 'pile', c: 'night3', c2: 'sun1', n: 8, w: 22, h: 6 }, { s: 'pile', c: 'ink', c2: 'sun2', n: 5, w: 18, h: 4, y: -1 }, { s: 'fries', c: 'sun2', n: 5, h: 8, x: 13, y: -3 }, { s: 'leaves', c: 'grass2', n: 3, w: 14, h: 2, y: -2 }] },
  frites: { vessel: 'cone', layers: [{ s: 'fries', c: 'sun2', n: 9, h: 9, y: 0 }, { s: 'sauce', c: 'sun1', c2: 'sun2', w: 8, h: 3, y: -6 }] },
  stroopwafel: { vessel: 'plate', layers: [{ s: 'waffle', c: 'earth2', c2: 'earth1', w: 20, h: 8, y: 1 }, { s: 'sauce', c: 'earth1', w: 8, h: 2, x: 8, y: 3 }, { s: 'waffle', c: 'earth3', c2: 'earth2', w: 18, h: 7, y: -2, x: -2 }] },
  bouillabaisse: { vessel: 'bowl', vc: 'sun0', layers: [{ s: 'sauce', c: 'sun0', c2: 'sun1', w: 26, h: 8 }, { s: 'cubes', c: 'white', c2: 'sky3', n: 4, w: 18, h: 4 }, { s: 'shrimp', c: 'sun1', c2: 'sun3', n: 2, x: 4, y: -1 }, { s: 'bread', c: 'earth3', c2: 'sun3', w: 6, h: 3, x: -9, y: -2 }, { s: 'leaves', c: 'grass2', n: 3, w: 16, h: 2, y: -2 }] },
  ratatouille: { vessel: 'pan', layers: [{ s: 'sauce', c: 'red', w: 26, h: 10 }, { s: 'medley', c: 'red', c2: 'sun2', c3: 'dusk1', n: 7, y: -1 }, { s: 'leaves', c: 'grass1', n: 4, w: 20, h: 4, y: 2 }] },
  // --- Highlands / Iceland / Alps
  haggis: { vessel: 'plate', layers: [{ s: 'mound', c: 'earth0', c2: 'earth1', w: 12, h: 6, x: -8 }, { s: 'mound', c: 'sun1', c2: 'sun2', w: 10, h: 5, x: 4, y: 1 }, { s: 'mound', c: 'white', c2: 'sun3', w: 10, h: 5, x: 11, y: -2 }, { s: 'shot', c: 'sun1', x: 18, y: -5 }] },
  plokkfiskur: { vessel: 'plate', layers: [{ s: 'mound', c: 'white', c2: 'sun3', w: 20, h: 7 }, { s: 'sprinkles', c: 'earth3', n: 8, w: 16, h: 4 }, { s: 'bread', c: 'earth0', c2: 'earth1', w: 8, h: 4, x: 13, y: 1 }, { s: 'leaves', c: 'grass2', n: 4, w: 14, h: 2, y: -2 }] },
  lamb: { vessel: 'bowl', vc: 'gray1', layers: [{ s: 'sauce', c: 'sun3', c2: 'white', w: 26, h: 8 }, { s: 'cubes', c: 'earth1', c2: 'earth2', n: 4, w: 18, h: 4 }, { s: 'cubes', c: 'sun0', n: 3, w: 16, h: 3, y: 1 }, { s: 'leaves', c: 'grass1', n: 3, w: 16, h: 2, y: -2 }] },
  weisswurst: { vessel: 'plate', layers: [{ s: 'sausage', c: 'white', c2: 'gray2', n: 2, w: 20, x: -4, y: 1 }, { s: 'pretzel', c: 'earth2', x: 12, y: -2 }, { s: 'sauce', c: 'sun1', c2: 'sun2', w: 8, h: 3, x: -12, y: -4 }] },
  kaiserschmarrn: { vessel: 'plate', layers: [{ s: 'pile', c: 'sun1', c2: 'sun2', n: 10, w: 24, h: 6 }, { s: 'pile', c: 'sun2', c2: 'sun3', n: 5, w: 18, h: 4, y: -2 }, { s: 'sprinkles', c: 'white', n: 9, w: 22, h: 5, y: -2 }, { s: 'sauce', c: 'dusk2', c2: 'dusk3', w: 8, h: 3, x: 13, y: 2 }] },
  kaspressknoedel: { vessel: 'bowl', vc: 'earth2', layers: [{ s: 'sauce', c: 'sun3', w: 26, h: 8 }, { s: 'patty', c: 'earth2', c2: 'earth3', w: 9, h: 4, x: -5, y: -1 }, { s: 'patty', c: 'earth2', c2: 'earth3', w: 9, h: 4, x: 5, y: 1 }, { s: 'sprinkles', c: 'grass2', n: 6, w: 20, h: 4, y: -1 }] },
  // --- Morocco
  tagine: { vessel: 'tagine', layers: [{ s: 'cubes', c: 'earth0', c2: 'earth1', n: 5, w: 22, h: 5 }, { s: 'pile', c: 'sun1', c2: 'sun2', n: 5, w: 20, h: 4, y: -1 }, { s: 'sprinkles', c: 'earth3', n: 6, w: 20, h: 4, y: -1 }, { s: 'sauce', c: 'sun0', w: 24, h: 3, y: 3 }] },
  couscous: { vessel: 'plate', layers: [{ s: 'dome', c: 'sun3', c2: 'white', w: 24, h: 9, y: -1 }, { s: 'sticks', c: 'sun0', n: 2, w: 6, x: -6, y: -3 }, { s: 'cubes', c: 'grass2', n: 3, w: 14, h: 4, y: -2 }, { s: 'sprinkles', c: 'sun2', n: 8, w: 20, h: 5, y: -2 }, { s: 'sauce', c: 'red', w: 5, h: 2, x: 12, y: 2 }] },
  // --- Asia
  bibimbap: { vessel: 'stonebowl', layers: [{ s: 'dome', c: 'white', c2: 'sun3', w: 26, h: 8, y: -1 }, { s: 'medley', c: 'grass2', c2: 'sun0', c3: 'earth1', n: 6, y: -2 }, { s: 'pile', c: 'sun3', c2: 'white', n: 3, w: 14, h: 2, y: 1 }, { s: 'yolk', c2: 'sun2', y: -3 }, { s: 'sauce', c: 'red', w: 4, h: 2, x: 8, y: -4 }] },
  kbbq: { vessel: 'grill', layers: [{ s: 'stripes', c: 'pink', c2: 'white', n: 3, w: 16, x: -8 }, { s: 'leaves', c: 'grass2', n: 5, w: 12, h: 6, x: 12, y: -2 }, { s: 'cubes', c: 'red', c2: 'sun0', n: 3, w: 10, h: 4, x: 12, y: 4 }, { s: 'sprinkles', c: 'white', n: 4, w: 14, h: 4, x: -8, y: 3 }] },
  khaosoi: { vessel: 'bowl', vc: 'sea1', layers: [{ s: 'sauce', c: 'sun1', c2: 'sun2', w: 26, h: 8 }, { s: 'noodles', c: 'sun2', w: 20, y: 0 }, { s: 'cubes', c: 'earth3', n: 3, w: 16, h: 3, y: 0 }, { s: 'pile', c: 'sun0', c2: 'sun1', n: 5, w: 12, h: 3, y: -3 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 10, y: -1 }] },
  padthai: { vessel: 'plate', layers: [{ s: 'noodles', c: 'sun1', c2: 'sun0', w: 24, y: 0 }, { s: 'shrimp', c: 'sun0', c2: 'sun3', n: 3, y: -2 }, { s: 'cubes', c: 'sun3', n: 3, w: 16, h: 3, y: 1 }, { s: 'sprinkles', c: 'earth2', n: 8, w: 22, h: 4 }, { s: 'wedge', c: 'grass2', c2: 'grass3', x: 13, y: 2 }] },
  dimsum: { vessel: 'basket', layers: [{ s: 'dumpling', c: 'white', c2: 'pink', n: 3, y: -2 }, { s: 'leaves', c: 'grass2', n: 2, w: 18, h: 2, y: 1 }, { s: 'steam', n: 3, y: -4 }] },
  wonton: { vessel: 'bowl', layers: [{ s: 'sauce', c: 'sun3', c2: 'white', w: 26, h: 8 }, { s: 'noodles', c: 'sun2', w: 20, y: 1 }, { s: 'dumpling', c: 'white', c2: 'pink', n: 3, y: -2 }, { s: 'leaves', c: 'grass1', n: 4, w: 20, h: 3, y: 0 }] },
  ramen: { vessel: 'bowl', vc: 'red', layers: [{ s: 'sauce', c: 'earth3', c2: 'sun3', w: 26, h: 8 }, { s: 'noodles', c: 'sun2', w: 22, y: 1 }, { s: 'slices', c: 'earth2', c2: 'white', n: 2, x: -6, y: -2 }, { s: 'egg', c2: 'sun2', x: 6, y: -2 }, { s: 'nori', x: 10, y: -3 }] },
  sushi: { vessel: 'mat', layers: [{ s: 'roll', c: 'ink', c2: 'white', c3: 'red', n: 4, x: -6, y: 2 }, { s: 'nigiri', c: 'red', c2: 'sun0', n: 2, x: 9, y: -3 }, { s: 'mound', c: 'grass2', w: 3, h: 2, x: -14, y: -4 }, { s: 'chopsticks', x: 8, y: 0 }] },
  soba: { vessel: 'tray', layers: [{ s: 'noodles', c: 'earth1', c2: 'gray1', w: 20, x: -4, y: 0 }, { s: 'cup', c: 'earth0', c2: 'gray2', x: 13, y: -1 }, { s: 'sprinkles', c: 'grass2', n: 5, w: 14, h: 3, x: -4, y: -2 }, { s: 'mound', c: 'grass2', w: 3, h: 2, x: 9, y: 4 }] },
  // --- Nepal
  dalbhat: { vessel: 'thali', layers: [{ s: 'dome', c: 'white', c2: 'sun3', w: 14, h: 6, x: -2, y: -1 }, { s: 'cup', c: 'sun1', c2: 'gray2', x: 12, y: -3 }, { s: 'mound', c: 'grass0', c2: 'grass1', w: 8, h: 4, x: -13, y: 0 }, { s: 'sauce', c: 'sun0', w: 4, h: 2, x: 9, y: 3 }, { s: 'sprinkles', c: 'sun2', n: 4, w: 10, h: 3, x: -2, y: -2 }] },
  momo: { vessel: 'basket', layers: [{ s: 'dumpling', c: 'white', c2: 'earth2', n: 3, x: -3, y: -1 }, { s: 'dumpling', c: 'white', c2: 'earth2', n: 2, x: 3, y: -4 }, { s: 'sauce', c: 'red', c2: 'sun0', w: 6, h: 3, x: 14, y: 2 }, { s: 'steam', n: 2, y: -6 }] },
};

export const DISH_ART_IDS = Object.keys(dishArtSpecs);
const GENERIC: DishArtSpec = { vessel: 'plate', layers: [{ s: 'mound', c: 'earth2', c2: 'earth3', w: 18, h: 7 }, { s: 'sprinkles', c: 'grass2', n: 4, w: 14, h: 3 }] };

export function specFor(dishId: string, art?: string): DishArtSpec { return dishArtSpecs[art ?? dishId] ?? dishArtSpecs[dishId] ?? GENERIC; }

/** Render the vessel plus the first `upTo` layers onto a canvas (upTo defaults to all). */
export function renderDishCanvas(dishId: string, upTo?: number, art?: string): HTMLCanvasElement {
  const spec = specFor(dishId, art); const canvas = document.createElement('canvas'); canvas.width = DISH_TEX_W; canvas.height = DISH_TEX_H;
  const ctx = canvas.getContext('2d')!; ctx.imageSmoothingEnabled = false; const p = new Px(ctx);
  drawVessel(p, spec.vessel, spec.vc);
  const n = upTo === undefined ? spec.layers.length : Math.max(0, Math.min(spec.layers.length, upTo));
  for (let i = 0; i < n; i++) drawLayer(p, spec.vessel, spec.layers[i], i);
  return canvas;
}

/** Texture key for the dish with `upTo` layers (cached per scene texture manager). */
export function drawDish(scene: Phaser.Scene, dishId: string, upTo?: number, art?: string): string {
  const spec = specFor(dishId, art); const n = upTo === undefined ? spec.layers.length : Math.max(0, Math.min(spec.layers.length, upTo));
  const key = `dish_${art ?? dishId}_${n}`;
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, renderDishCanvas(dishId, n, art));
  return key;
}
export function layerCount(dishId: string, art?: string) { return specFor(dishId, art).layers.length; }
