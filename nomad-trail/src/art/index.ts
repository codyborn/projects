import Phaser from 'phaser';
import { buildPixelFont } from './font';
import { buildNomadSheets, buildBags, buildTransport, buildStatIcons, buildCoffeeKit } from './sprites';
export * from './pixel'; export * from './font'; export * from './sprites'; export * from './skyline'; export * from './globe';
/** Generate all shared art once (call from BootScene). Idempotent. */
export function generateAllArt(scene: Phaser.Scene) {
  buildPixelFont(scene); buildNomadSheets(scene); buildBags(scene); buildTransport(scene); buildStatIcons(scene); buildCoffeeKit(scene);
}
(window as any).__nomadArt = { generate: generateAllArt };
