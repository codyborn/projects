// Pixel globe with continents, city dots, route polyline. Pure-canvas renderer + Phaser wrapper.
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import type { City } from '../core/types';
import { makeCanvas, P, R, line, Ctx } from './pixel';

// 64x32 land mask, equirectangular, lon -180..180 left->right, lat 90..-90 top->bottom. '#' = land.
const LAND = [
'................................................................',
'..........######.....................##########################.',
'......###########.....#..........###########################....',
'.....#############...##.......#################################.',
'......#############.####....###################################.',
'.......############.####...###################################..',
'........###########..##...#################################.....',
'.........#########.......################################.......',
'..........########.......############.#################.........',
'...........######........##########..###############............',
'............#####.........#########....############.............',
'.............####.........#########....#####.####...............',
'..............###..........#######......###...###...............',
'..............####.........######.......##.....##...............',
'...............#####........#####..............#................',
'................######.......####....................#..........',
'.................#######.....####..................####.........',
'.................########....###..................#####.........',
'..................########....##.................######.........',
'..................#######.....#.................#######.........',
'..................######.......................#######..........',
'...................#####........................####............',
'...................####..........................#..............',
'...................###..........................................',
'...................##...........................................',
'...................#............................................',
'....................#...........................................',
'................................................................',
'................................................................',
'.......##########################################...............',
'..##############################################################',
'################################################################'];

export interface GlobeOpts { rotation: number; tilt?: number; ocean?: [number, number]; land?: [number, number]; showGrid?: boolean; }
function project(lat: number, lon: number, rot: number, tilt: number, r: number) {
  const la = lat * Math.PI / 180, lo = (lon + rot) * Math.PI / 180;
  const x = Math.cos(la) * Math.sin(lo), y0 = Math.sin(la), z0 = Math.cos(la) * Math.cos(lo);
  const ct = Math.cos(tilt), st = Math.sin(tilt); const y = y0 * ct - z0 * st, z = y0 * st + z0 * ct;
  return { x: x * r, y: -y * r, z };
}
/** Render globe into ctx at cx,cy radius r. Returns projector for overlays. */
export function renderGlobe(ctx: Ctx, cx: number, cy: number, r: number, cities: City[], visited: string[], currentId: string | undefined, routeIds: string[], o: GlobeOpts) {
  const tilt = o.tilt ?? 0.35, [oc0, oc1] = o.ocean ?? [PAL.sea0, PAL.sea1], [ld0, ld1] = o.land ?? [PAL.grass1, PAL.grass0];
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  for (let py = -r; py <= r; py++) for (let px = -r; px <= r; px++) {
    const d2 = px * px + py * py; if (d2 > r * r) continue;
    const nx = px / r, ny = -py / r, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const y0 = ny * ct + nz * st, z0 = -ny * st + nz * ct; // inverse tilt
    const lat = Math.asin(Math.max(-1, Math.min(1, y0))) * 180 / Math.PI; let lon = Math.atan2(nx, z0) * 180 / Math.PI - o.rotation; lon = ((lon + 540) % 360) - 180;
    const mx = Math.floor((lon + 180) / 360 * 64) % 64, my = Math.min(31, Math.floor((90 - lat) / 180 * 32));
    const land = LAND[my][mx] === '#'; const shade = nz; const dith = ((px + py) & 1) === 0;
    let c: number; if (land) c = shade > 0.55 || (shade > 0.3 && dith) ? ld0 : ld1; else c = shade > 0.6 || (shade > 0.3 && dith) ? oc1 : oc0;
    if (d2 > (r - 1.5) * (r - 1.5)) c = PAL.ink; else if (nx * 0.6 + ny * 0.5 > 0.75 && dith) c = land ? PAL.grass2 : PAL.sea2;
    P(ctx, cx + px, cy + py, c);
  }
  const proj = (lat: number, lon: number) => { const p = project(lat, lon, o.rotation, tilt, r); return { x: cx + p.x, y: cy + p.y, z: p.z }; };
  // route polyline (great-circle-ish via interpolation)
  const byId = new Map(cities.map(c => [c.id, c]));
  for (let i = 1; i < routeIds.length; i++) { const a = byId.get(routeIds[i - 1]), b = byId.get(routeIds[i]); if (!a || !b) continue;
    let dlon = b.lon - a.lon; if (dlon > 180) dlon -= 360; if (dlon < -180) dlon += 360; const steps = 24; let prev: { x: number; y: number; z: number } | null = null;
    for (let s = 0; s <= steps; s++) { const t = s / steps; const p = proj(a.lat + (b.lat - a.lat) * t, a.lon + dlon * t); if (prev && p.z > 0 && prev.z > 0 && (s % 2 === 0)) line(ctx, prev.x, prev.y, p.x, p.y, PAL.sun2); prev = p; } }
  for (const c of cities) { const p = proj(c.lat, c.lon); if (p.z <= 0.02) continue; const v = visited.includes(c.id);
    if (c.id === currentId) { R(ctx, p.x - 2, p.y - 2, 5, 5, PAL.ink); R(ctx, p.x - 1, p.y - 1, 3, 3, PAL.white); } else { P(ctx, p.x, p.y, v ? PAL.sun2 : (c.hero ? PAL.white : PAL.gray2)); if (v) { P(ctx, p.x - 1, p.y, PAL.sun1); P(ctx, p.x + 1, p.y, PAL.sun1); } } }
  return proj;
}
/** Phaser wrapper: returns an Image whose texture is redrawn by redraw(rotation). */
export function drawGlobe(scene: Phaser.Scene, cx: number, cy: number, r: number, cities: City[], visitedIds: string[], currentId: string | undefined, routeIds: string[], rotation = 0) {
  const key = 'globe_' + Math.random().toString(36).slice(2, 8); const size = r * 2 + 4;
  const canvas = makeCanvas(size, size, ctx => renderGlobe(ctx, r + 2, r + 2, r, cities, visitedIds, currentId, routeIds, { rotation }));
  const tex = scene.textures.addCanvas(key, canvas); const img = scene.add.image(cx, cy, key);
  let pulse = 0;
  const api = {
    image: img,
    redraw(rot: number, vis = visitedIds, cur = currentId, route = routeIds) { const ctx = canvas.getContext('2d')!; ctx.clearRect(0, 0, size, size); renderGlobe(ctx, r + 2, r + 2, r, cities, vis, cur, route, { rotation: rot }); (tex as any).refresh(); },
    /** rotation that centers a lon on screen */ rotationFor(lon: number) { return -lon; },
    project(lat: number, lon: number, rot: number) { const p = project(lat, lon, rot, 0.35, r); return { x: cx + p.x, y: cy + p.y, z: p.z }; },
    pulse(dt: number) { pulse += dt; img.setScale(1 + Math.sin(pulse / 300) * 0.004); },
    destroy() { img.destroy(); scene.textures.remove(key); },
  };
  return api;
}
/** Offscreen globe canvas for the share card. */
export function globeCanvas(size: number, cities: City[], visited: string[], routeIds: string[], rotation: number): HTMLCanvasElement {
  const r = Math.floor(size / 2) - 2; return makeCanvas(size, size, ctx => renderGlobe(ctx, r + 2, r + 2, r, cities, visited, routeIds[routeIds.length - 1], routeIds, { rotation }));
}
export const routeToPolylinePNG = globeCanvas;
