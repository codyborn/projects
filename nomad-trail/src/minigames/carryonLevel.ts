// Pure (no Phaser) level data, validator and procedural generator for Carry-On, so it can be unit-tested in node.
import type { ArcadeLevel, Hazard } from '../core/types';
import { PAL } from '../core/palette';

export const TILE = 16;
export const PAR_DEFAULT = 30;
export const MAX_STAMPS = 8;
export const COLS = 23, ROWS = 20;
/**
 * Player physics used by the Carry-On game; the validator mirrors them.
 * jump 330 / g 900 → apex 60.5 px = 3.8 tiles (a 3-tile rise with room to spare); flat air time 0.73 s × run 118 px/s ≈ 5.4 tiles,
 * so a 4-tile gap is comfortable. Snow has a weaker jump (apex ≈ 3.1 tiles → 2-row steps) and the generator builds 2-row steps for it.
 */
export const PHYS = { jump: 330, gravity: 900, run: 118, snowJump: 300 };
/** Body height margin the apex must clear on top of the rise, in px (player sprite is 13 px tall on a 16 px tile). */
const HEAD = 6;

/** Built-in level (also the fallback when no payload). Every rise <= 3 rows, every gap <= 3 tiles. */
export const DEFAULT_LEVEL: ArcadeLevel = {
  city: 'Nowhere in particular', hazard: 'pigeon', palette: [PAL.night2, PAL.night3, PAL.gray1], stampPieces: 10, parTime: PAR_DEFAULT,
  tiles: [
    '#######################',
    '#..........H..........#',
    '#.....................#',
    '#.........*...........#',
    '#........###..........#',
    '#.....................#',
    '#....*..........*.....#',
    '#...###........###....#',
    '#.....................#',
    '#......*.....*........#',
    '#.....###...###.......#',
    '#.....................#',
    '#..*..............*...#',
    '#.###............###..#',
    '#.....................#',
    '#.....*.......*.......#',
    '#....###.....###......#',
    '#.....................#',
    '#S.......^.......^..*.#',
    '#######################',
  ],
};

/** Keep at most `max` stamp pieces, the ones nearest the start (Manhattan), turning the rest into empty tiles. Pure. */
export function trimStamps(level: ArcadeLevel, max = MAX_STAMPS): ArcadeLevel {
  const rows = level.tiles.map(r => [...r]); let sx = 0, sy = 0; const stamps: [number, number][] = [];
  rows.forEach((r, y) => r.forEach((c, x) => { if (c === 'S') { sx = x; sy = y; } if (c === '*') stamps.push([x, y]); }));
  if (stamps.length <= max) return level;
  stamps.sort((a, b) => (Math.abs(a[0] - sx) + Math.abs(a[1] - sy)) - (Math.abs(b[0] - sx) + Math.abs(b[1] - sy)));
  for (const [x, y] of stamps.slice(max)) rows[y][x] = '.';
  return { ...level, tiles: rows.map(r => r.join('')), stampPieces: max };
}

// ---------------------------------------------------------------- kinematics shared by the validator and the generator
export function jumpFor(level: Pick<ArcadeLevel, 'hazard'>, snow?: boolean) { return snow || level.hazard === 'snow' ? PHYS.snowJump : PHYS.jump; }
/** Max rise in rows the player can land on (apex minus head margin). */
export function maxRiseRows(jump: number) { return Math.floor(((jump * jump) / (2 * PHYS.gravity) - HEAD) / TILE); }
/** Horizontal reach in tiles when landing `rise` rows higher (negative = falling), -1 if impossible. Descending-branch landing time. */
export function reachTiles(jump: number, rise: number) {
  const g = PHYS.gravity; const h = rise * TILE + (rise > 0 ? HEAD : 0); const disc = jump * jump - 2 * g * h; if (disc < 0) return -1;
  const t = (jump + Math.sqrt(disc)) / g; return Math.floor((t * PHYS.run * 0.92) / TILE);   // 0.92: players do not hit the edge at full speed
}

const isStand = (at: (x: number, y: number) => string, x: number, y: number) => { const c = at(x, y); if (c === '#' || c === '^') return false; const b = at(x, y + 1); return b === '#' || b === '-' || b === 'C'; };

/** Standable cells reachable from S with the real jump arcs (BFS). Coarse: ignores mid-air ceilings except directly above the take-off. */
export function reachableCells(tiles: string[], jump: number): { reach: Set<string>; start: [number, number] | null } {
  const hgt = tiles.length, wid = Math.max(...tiles.map(r => r.length));
  const at = (x: number, y: number) => (y < 0 || y >= hgt || x < 0 || x >= wid) ? '#' : (tiles[y][x] || '.');
  let start: [number, number] | null = null;
  for (let y = 0; y < hgt; y++) for (let x = 0; x < wid; x++) if (at(x, y) === 'S') start = [x, y];
  const reach = new Set<string>(); if (!start) return { reach, start };
  let [sx, sy] = start; while (!isStand(at, sx, sy) && sy < hgt - 1) sy++;
  const maxRise = maxRiseRows(jump); const q: [number, number][] = [[sx, sy]]; reach.add(`${sx},${sy}`);
  while (q.length) {
    const [x, y] = q.shift()!;
    for (let ty = y - maxRise; ty <= Math.min(hgt - 1, y + 14); ty++) {
      const rise = y - ty; const r = reachTiles(jump, rise); if (r < 0) continue;
      for (let tx = x - r; tx <= x + r; tx++) {
        if (!isStand(at, tx, ty) || reach.has(`${tx},${ty}`)) continue;
        if (rise > 0 && [...Array(rise)].some((_, k) => at(x, y - 1 - k) === '#')) continue;   // head room above the take-off
        reach.add(`${tx},${ty}`); q.push([tx, ty]);
      }
    }
  }
  return { reach, start: [sx, sy] };
}

/** Design-mistake catcher: start, stamp count, and every stamp reachable (stand in/under it within a jump, or 1 tile beside). */
export function validateLevel(level: ArcadeLevel, opts: { snow?: boolean } = {}): string[] {
  const rows = level.tiles, issues: string[] = []; const hgt = rows.length, wid = Math.max(...rows.map(r => r.length));
  const at = (x: number, y: number) => (y < 0 || y >= hgt || x < 0 || x >= wid) ? '#' : (rows[y][x] || '.');
  const stamps: [number, number][] = []; let hasStart = false;
  for (let y = 0; y < hgt; y++) for (let x = 0; x < wid; x++) { const c = at(x, y); if (c === 'S') hasStart = true; if (c === '*') stamps.push([x, y]); }
  if (!hasStart) issues.push('no start (S)'); if (!stamps.length) issues.push('no stamp pieces (*)');
  if (level.stampPieces && level.stampPieces !== stamps.length) issues.push(`stampPieces=${level.stampPieces} but ${stamps.length} '*' tiles`);
  if (!hasStart) return issues;
  const jump = jumpFor(level, opts.snow); const { reach } = reachableCells(rows, jump); const maxRise = maxRiseRows(jump);
  for (const [x, y] of stamps) {
    let ok = false;
    for (let dy = 0; dy <= maxRise + 1 && !ok; dy++) for (let dx = -1; dx <= 1 && !ok; dx++) if (reach.has(`${x + dx},${y + dy}`)) ok = true;
    if (!ok) issues.push(`stamp at ${x},${y} is not reachable from S`);
  }
  return issues;
}

// ---------------------------------------------------------------- procedural levels
export type LevelFamily = 'towers' | 'staircase' | 'zigzag' | 'islands' | 'bridges';
export const FAMILIES: LevelFamily[] = ['towers', 'staircase', 'zigzag', 'islands', 'bridges'];

/** mulberry32: small seeded RNG, deterministic across node and browser. */
export function levelRng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function hashSeed(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

const PALETTES: Record<string, [number, number, number]> = {
  hot: [PAL.dusk1, PAL.dusk2, PAL.sun1], temperate: [PAL.night2, PAL.night3, PAL.gray1], cold: [PAL.sky0, PAL.sky1, PAL.sky3],
  alpine: [PAL.night3, PAL.sea0, PAL.grass3], rainy: [PAL.night1, PAL.gray0, PAL.sea2],
};
export function paletteFor(climate?: string): [number, number, number] { return PALETTES[climate || 'temperate'] || PALETTES.temperate; }

export interface GenOpts { city?: string; hazard?: Hazard; palette?: [number, number, number]; family?: LevelFamily; climate?: string; stamps?: number; }

/** Which family a seed picks (also what the tests histogram). */
export function familyFor(seed: number, hazard?: Hazard): LevelFamily {
  void hazard; const r = levelRng(hashSeed('family:' + seed)); r(); return FAMILIES[Math.floor(r() * FAMILIES.length)];
}

/**
 * Generate a one-screen 23x20 level for a city from a seed. Geometry from a layout family, then stamps are placed ONLY on cells the
 * validator's BFS can reach, so the result is completable by construction. Tries a few seed variants; falls back to the built-in level.
 */
export function generateLevel(seed: number, opts: GenOpts = {}): ArcadeLevel & { family: LevelFamily } {
  const hazard = opts.hazard || 'pigeon'; const want = Math.max(6, Math.min(8, opts.stamps ?? 6 + Math.floor(levelRng(seed ^ 0x99)() * 3)));
  const family = opts.family || familyFor(seed, hazard);
  for (let attempt = 0; attempt < 20; attempt++) {
    const rng = levelRng(hashSeed(`lvl:${seed}:${attempt}`)); const grid = emptyGrid(); const step = Math.max(2, maxRiseRows(jumpFor({ hazard })));   // 3 rows normally, 2 on snow
    buildFamily(grid, family, rng, step);
    placeStart(grid, rng, family);
    const tiles = grid.map(r => r.join('')); const jump = jumpFor({ hazard });
    const { reach, start } = reachableCells(tiles, jump); if (!start) continue;
    // candidate stamp cells: reachable standable cells, not the start row cluster, spread out
    const all = [...reach].map(k => k.split(',').map(Number) as [number, number]).filter(([x, y]) => !(Math.abs(x - start[0]) <= 2 && y === start[1]) && grid[y][x] === '.');
    const upper = all.filter(([, y]) => y < ROWS - 2); if (upper.length < want - 1) continue;   // stamps live on platforms; at most one on the ground
    const groundPick = all.filter(([, y]) => y === ROWS - 2); const cands = groundPick.length ? [...upper, groundPick[Math.floor(rng() * groundPick.length)]] : upper;
    if (cands.length < want) continue;
    // greedy spread: farthest-point sampling so pieces cover the level
    const chosen: [number, number][] = []; let pool = cands.slice();
    chosen.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    while (chosen.length < want && pool.length) { let best = 0, bd = -1; pool.forEach((c, i) => { const d = Math.min(...chosen.map(s => Math.abs(s[0] - c[0]) + Math.abs(s[1] - c[1]) * 1.5)); if (d > bd) { bd = d; best = i; } }); chosen.push(pool.splice(best, 1)[0]); }
    for (const [x, y] of chosen) grid[y][x] = '*';
    // hazard spawners: one or two at the top for fallers/flyers, on ledges for walkers
    const hzTop = ['rock', 'pigeon', 'mosquito', 'gust'].includes(hazard);
    const spots = hzTop ? [[6 + Math.floor(rng() * 5), 1], [13 + Math.floor(rng() * 5), 1]] : [...reach].map(k => k.split(',').map(Number)).filter(([x, y]) => grid[y][x] === '.' && y < ROWS - 2 && Math.abs(x - start[0]) > 5).slice(0, 40);
    let placed = 0; for (const [x, y] of spots) { if (placed >= 2) break; if (grid[y][x] === '.') { grid[y][x] = 'H'; placed++; } }
    // spikes on the ground, never next to the start, never under a stamp column
    const ground = ROWS - 2; for (let x = 3; x < COLS - 2 && ['wave', 'ice'].indexOf(hazard) < 0; x++) if (grid[ground][x] === '.' && grid[ground - 1][x] !== '*' && Math.abs(x - start[0]) > 3 && rng() < 0.12) grid[ground][x] = '^';
    const level: ArcadeLevel & { family: LevelFamily } = { city: opts.city || 'Somewhere', hazard, palette: opts.palette || paletteFor(opts.climate), stampPieces: chosen.length, parTime: PAR_DEFAULT, tiles: grid.map(r => r.join('')), family };
    if (validateLevel(level).length === 0) return level;
  }
  const fb = trimStamps(DEFAULT_LEVEL); return { ...fb, city: opts.city || fb.city, hazard, palette: opts.palette || fb.palette, family };
}

function emptyGrid(): string[][] {
  const g: string[][] = []; for (let y = 0; y < ROWS; y++) { const row: string[] = []; for (let x = 0; x < COLS; x++) row.push(y === 0 || y === ROWS - 1 || x === 0 || x === COLS - 1 ? '#' : '.'); g.push(row); }
  return g;
}
const plat = (g: string[][], x0: number, y: number, w: number, ch = '#') => { for (let x = Math.max(1, x0); x < Math.min(COLS - 1, x0 + w); x++) if (y > 0 && y < ROWS - 1) g[y][x] = ch; };
const pillar = (g: string[][], x: number, y0: number, y1: number) => { for (let y = Math.max(1, y0); y <= Math.min(ROWS - 2, y1); y++) if (x > 0 && x < COLS - 1) g[y][x] = '#'; };

function buildFamily(g: string[][], fam: LevelFamily, rng: () => number, step: number) {
  const ground = ROWS - 2; const ri = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1)); const S = step;
  switch (fam) {
    case 'towers': {   // 3 to 4 stepped towers of stacked ledges, gaps between them
      const n = ri(3, 4); const wTower = Math.floor((COLS - 2) / n);
      for (let i = 0; i < n; i++) { const cx = 1 + i * wTower + Math.floor(wTower / 2); const h = ri(3, 5); let y = ground - S + 1;
        for (let k = 0; k < h && y > 2; k++) { const w = ri(2, 3); plat(g, cx - Math.floor(w / 2) + (k % 2 ? ri(-1, 1) : 0), y, w); y -= S; } }
      if (rng() < 0.5) pillar(g, ri(4, COLS - 5), ground - 2, ground - 1);
      break; }
    case 'staircase': {   // two flights: up to the right, back up to the left, landings at the turn
      let y = ground - S + 1, x = 2; const run = ri(2, 3);
      while (x < COLS - 4 && y > 8) { plat(g, x, y, 3); x += run + 1; y -= S; }
      plat(g, COLS - 6, y + S, 4);   // landing
      x = COLS - 7; while (x > 2 && y > 2) { plat(g, x, y, 3); x -= run + 1; y -= S; }
      break; }
    case 'zigzag': {   // alternating ledges every 3 rows, the classic
      let side = rng() < 0.5 ? 0 : 1;
      // alternating ledges must overlap horizontally within jump reach (3 tiles at a 3-row rise), so each spans past the middle
      for (let y = ground - S + 1; y > 2; y -= S) { const w = ri(11, 13); const x = side ? COLS - 1 - w - ri(0, 1) : 1 + ri(0, 1); plat(g, x, y, w); if (rng() < 0.35) plat(g, side ? 2 + ri(0, 2) : COLS - 5 - ri(0, 2), y, 2); side ^= 1; }
      break; }
    case 'islands': {   // scattered floating platforms on a loose 3-row grid with jitter
      for (let y = ground - S + 1; y > 2; y -= S) { let x = 1 + ri(0, 3); while (x < COLS - 3) { const w = ri(2, 4); if (rng() < 0.75) plat(g, x, y + (rng() < 0.3 && S > 2 ? -1 : 0), w); x += w + ri(2, 4); } }
      break; }
    case 'bridges': {   // long one-way and crumble bridges over spike pits, pillars as anchors
      const pits: [number, number][] = [[ri(4, 7), ri(3, 4)], [ri(12, 15), ri(3, 5)]];
      for (const [px, pw] of pits) for (let x = px; x < px + pw && x < COLS - 1; x++) g[ground][x] = '^';
      let y = ground - S + 1;
      for (let flight = 0; y > 2; flight++) { const x0 = 1 + ri(0, 3), len = ri(8, 14); const ch = flight % 2 ? 'C' : '-'; plat(g, x0, y, len, ch); const px = x0 + ri(1, Math.max(1, len - 2)); pillar(g, px, y + 1, y + 1); y -= S; }
      break; }
  }
}
function placeStart(g: string[][], rng: () => number, fam: LevelFamily) {
  const ground = ROWS - 2; const x = fam === 'staircase' ? 1 : 1 + Math.floor(rng() * 3);
  for (let dx = 0; dx < 3; dx++) if (g[ground][x + dx] === '^') g[ground][x + dx] = '.';
  g[ground][x] = 'S';
}
