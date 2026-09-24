// Pure (no Phaser) level data + validator for Carry-On, so it can be unit-tested in node.
import type { ArcadeLevel } from '../core/types';
import { PAL } from '../core/palette';

export const TILE = 16;
export const PAR_DEFAULT = 30;
export const MAX_STAMPS = 8;
/** Player physics used by CarryOnScene; the validator mirrors them. */
export const PHYS = { jump: 310, gravity: 900, run: 115, snowJump: 235 };

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

/**
 * Reachability check with the real jump kinematics: BFS over standable cells from S. A jump from a standing cell can land on a
 * standable cell that is at most `maxRise` rows higher (jump apex = v^2/2g) and within the horizontal distance the arc allows for
 * that rise (falls allow more). Stamps count as reached when the player can stand in/under them within 1 row or pass through
 * them on a jump column. Coarse (ignores mid-air ceilings), meant to catch design mistakes, not to prove every pixel.
 */
export function validateLevel(level: ArcadeLevel, opts: { snow?: boolean } = {}): string[] {
  const rows = level.tiles, issues: string[] = []; const hgt = rows.length, wid = Math.max(...rows.map(r => r.length));
  const at = (x: number, y: number) => (y < 0 || y >= hgt || x < 0 || x >= wid) ? '#' : (rows[y][x] || '.');
  const solid = (x: number, y: number) => at(x, y) === '#';
  const standable = (x: number, y: number) => !solid(x, y) && at(x, y) !== '^' && (solid(x, y + 1) || at(x, y + 1) === '-');
  const jump = opts.snow || level.hazard === 'snow' ? PHYS.snowJump : PHYS.jump, g = PHYS.gravity;
  const apex = (jump * jump) / (2 * g); const maxRise = Math.floor(apex / TILE);
  // horizontal reach (in tiles) for landing `rise` rows higher (negative rise = falling): time on the descending branch where y(t) = rise*TILE
  const reach = (rise: number) => { const h = rise * TILE; const disc = jump * jump - 2 * g * h; if (disc < 0) return -1; const t = (jump + Math.sqrt(disc)) / g; return Math.floor((t * PHYS.run) / TILE); };
  let start: [number, number] | null = null; const stamps: [number, number][] = [];
  for (let y = 0; y < hgt; y++) for (let x = 0; x < wid; x++) { const c = at(x, y); if (c === 'S') start = [x, y]; if (c === '*') stamps.push([x, y]); }
  if (!start) issues.push('no start (S)'); if (!stamps.length) issues.push('no stamp pieces (*)');
  if (level.stampPieces && level.stampPieces !== stamps.length) issues.push(`stampPieces=${level.stampPieces} but ${stamps.length} '*' tiles`);
  if (!start) return issues;
  // settle start onto the ground
  let [sx, sy] = start; while (!standable(sx, sy) && sy < hgt - 1) sy++;
  const seen = new Set<string>(); const q: [number, number][] = [[sx, sy]]; seen.add(`${sx},${sy}`);
  while (q.length) {
    const [x, y] = q.shift()!;
    for (let ty = y - maxRise; ty <= Math.min(hgt - 1, y + 12); ty++) {
      const rise = y - ty; const r = rise > 0 ? reach(rise) : reach(rise); if (r < 0) continue;
      for (let tx = x - r; tx <= x + r; tx++) {
        if (!standable(tx, ty) || seen.has(`${tx},${ty}`)) continue;
        // head clearance for a rise: the column above the start must be open up to the apex
        if (rise > 0 && [...Array(rise)].some((_, k) => solid(x, y - 1 - k))) continue;
        seen.add(`${tx},${ty}`); q.push([tx, ty]);
      }
    }
  }
  for (const [x, y] of stamps) {
    let ok = false;
    for (let dy = 0; dy <= maxRise + 1 && !ok; dy++) for (let dx = -1; dx <= 1 && !ok; dx++) if (seen.has(`${x + dx},${y + dy}`)) ok = true;
    if (!ok) issues.push(`stamp at ${x},${y} is not reachable from S`);
  }
  return issues;
}
