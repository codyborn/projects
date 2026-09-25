import Phaser from 'phaser';
import { buildPixelFont } from './font';
import { buildNomadSheets, buildBags, buildTransport, buildStatIcons, buildCoffeeKit } from './sprites';
export * from './pixel'; export * from './font'; export * from './sprites'; export * from './skyline'; export * from './globe';
/** Generate all shared art once (call from BootScene). Idempotent. */
export function generateAllArt(scene: Phaser.Scene) {
  buildPixelFont(scene); buildNomadSheets(scene); buildBags(scene); buildTransport(scene); buildStatIcons(scene); buildCoffeeKit(scene);
}
import { buildSkyline } from './skyline';
import { drawGlobe } from './globe';
import citiesJson from '../data/cities.json';
import type { City, RunState } from '../core/types';
const CITIES = citiesJson as unknown as City[];
/** Hooks consumed by the SCENES layer (see scenes/README.md). */
export function skylineHook(scene: Phaser.Scene, cityId: string, x: number, y: number, w: number, h: number) {
  const c = CITIES.find(k => k.id === cityId); const run = scene.registry.get('run') as RunState | undefined;
  const tod = run ? (['day', 'dusk', 'day', 'dawn'] as const)[run.stayDays % 4] : 'day';
  const sk = buildSkyline(scene, cityId, tod, c?.climate ?? 'temperate', w, h, Math.round(h * 0.66), c?.region);
  sk.container.setPosition(x, y).setDepth(1); scene.events.on('update', (_t: number, dt: number) => sk.update(dt)); return sk;
}
export function globeHook(scene: Phaser.Scene, cx: number, cy: number, r: number, run: RunState) {
  const cur = CITIES.find(k => k.id === run.cityId);
  return drawGlobe(scene, cx, cy, r, CITIES, run.visited, run.cityId, run.route, cur ? -cur.lon : 0);
}
export function skylineAt(scene: Phaser.Scene, cityId: string, tod: 'dawn' | 'day' | 'dusk' | 'night', x: number, y: number, w: number, h: number) {
  const c = CITIES.find(k => k.id === cityId); const sk = buildSkyline(scene, cityId, tod, c?.climate ?? 'temperate', w, h, Math.round(h * 0.66), c?.region); sk.container.setPosition(x, y); return sk;
}
(window as any).__nomadArt = { generate: generateAllArt, skyline: skylineHook, skylineAt, globe: globeHook };
