// Pure data for the Zeke's-Peak-style ferrata climb: a staggered column of ledges up a cliff. No Phaser here (unit-tested).
export type LedgeKind = 'normal' | 'thin' | 'crumble' | 'anchor';
export interface Ledge { x: number; y: number; w: number; kind: LedgeKind; }
/** Physics constants shared by the generator's reachability check and the scene. */
export const FERRATA = {
  width: 360, wallPad: 22,           // playable x range [wallPad, width - wallPad]
  gravity: 900, bounce: 450,          // px/s^2, px/s  -> apex height = bounce^2 / (2 g) = 112.5 px
  steer: 210,                         // horizontal speed while holding a side (px/s)
  rise: 80,                           // vertical gap between consecutive ledges
  radius: 8,                          // marble radius
  ledges: 22,                         // ledges above the start; the flag sits above the last one
};
/** Max horizontal distance the marble can cover between leaving a ledge and landing one `rise` higher (with a margin). */
export function horizontalReach(): number {
  const { gravity: g, bounce: v, rise, steer } = FERRATA;
  // time up to apex + time down from apex to (apex - rise)
  const apex = (v * v) / (2 * g); const tUp = v / g; const tDown = Math.sqrt((2 * Math.max(0, apex - rise)) / g);
  return steer * (tUp + tDown) * 0.85;
}
function mulberry(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Ledges from the ground (y = 0 is the start ledge; y decreases upward). Staggered so a straight bounce misses; every 6th is an anchor. */
export function genLedges(seed = 1): Ledge[] {
  const r = mulberry(seed); const { width, wallPad, rise, ledges } = FERRATA; const reach = horizontalReach();
  const out: Ledge[] = [{ x: width / 2 - 45, y: 0, w: 90, kind: 'anchor' }];
  let cx = width / 2, dir = r() < 0.5 ? -1 : 1;
  for (let i = 1; i <= ledges; i++) {
    const kind: LedgeKind = i % 6 === 0 ? 'anchor' : r() < 0.22 ? 'thin' : r() < 0.3 ? 'crumble' : 'normal';
    const w = kind === 'anchor' ? 80 : kind === 'thin' ? 24 : kind === 'crumble' ? 50 : 60;
    // stagger: move 45%..85% of reach sideways, flipping direction when a wall is near
    let dx = dir * (0.45 + 0.4 * r()) * reach; let nx = cx + dx;
    if (nx - w / 2 < wallPad || nx + w / 2 > width - wallPad) { dir = -dir; dx = dir * (0.45 + 0.4 * r()) * reach; nx = cx + dx; }
    nx = Math.max(wallPad + w / 2, Math.min(width - wallPad - w / 2, nx));
    out.push({ x: Math.round(nx - w / 2), y: -i * rise, w, kind }); cx = nx; if (r() < 0.35) dir = -dir;
  }
  return out;
}
/** Every consecutive pair must be reachable: exactly `rise` apart vertically and within horizontal reach centre-to-centre. */
export function validateLedges(ls: Ledge[]): string[] {
  const errs: string[] = []; const reach = horizontalReach();
  for (let i = 1; i < ls.length; i++) { const a = ls[i - 1], b = ls[i]; if (a.y - b.y !== FERRATA.rise) errs.push(`gap ${i}: ${a.y - b.y}`); const d = Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)); if (d > reach + b.w / 2) errs.push(`ledge ${i} too far: ${d.toFixed(0)} > ${(reach + b.w / 2).toFixed(0)}`); if (b.x < FERRATA.wallPad || b.x + b.w > FERRATA.width - FERRATA.wallPad) errs.push(`ledge ${i} in wall`); }
  return errs;
}
