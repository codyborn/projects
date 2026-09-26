// Tiny pixel icons for the city action buttons: 'ico_drone' (quadcopter, 14x10), 'ico_switch' (handheld, 14x10), 'ico_map' (globe, 12x12).
// buildIcons(scene) registers them once per texture manager; use with scene.add.image(x, y, 'ico_drone').setScale(2).
import Phaser from 'phaser';
import { PAL } from '../core/palette';

function tex(scene: Phaser.Scene, key: string, rows: string[], map: Record<string, number>) {
  if (scene.textures.exists(key)) return key;
  const h = rows.length, w = Math.max(...rows.map(r => r.length)); const g = scene.add.graphics();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.' && map[c] !== undefined) g.fillStyle(map[c]).fillRect(x, y, 1, 1); }));
  g.generateTexture(key, w, h); g.destroy(); return key;
}

export function buildIcons(scene: Phaser.Scene) {
  tex(scene, 'ico_drone', [
    '.AAA....AAA...',
    'AAAAA..AAAAA..',
    '..B......B....',
    '..BBBBBBBB....',
    '.BBCCCCCCBB...',
    '..BBBRBBBB....',
    '...D....D.....',
    '..DD....DD....',
    '..............',
    '..............'], { A: PAL.gray2, B: PAL.gray1, C: PAL.gray0, R: PAL.red, D: PAL.ink });
  tex(scene, 'ico_switch', [
    'RRRGGGGGGGGBBB',
    'RRRGSSSSSSGBBB',
    'RDRGSSSSSSGBBB',
    'DDDGSSSSSSGBAB',
    'RDRGSSSSSSGABA',
    'RRRGSSSSSSGBAB',
    'RRRGSSSSSSGBBB',
    'RRRGGGGGGGGBBB',
    '..............',
    '..............'], { R: PAL.red, B: PAL.sky1, G: PAL.gray0, S: PAL.neon, D: PAL.ink, A: PAL.ink });
  tex(scene, 'ico_map', [
    '....OOOO....',
    '..OOWWGGOO..',
    '.OWGGWWGGWO.',
    '.OWWGGWWWWO.',
    'OGGWWWGGWWWO',
    'OGGGWWGGGWWO',
    'OWGGWWWGGGWO',
    'OWWWGGWWGGWO',
    '.OWWGGGWWGO.',
    '.OGWWWGGWWO.',
    '..OOGGWWOO..',
    '....OOOO....'], { O: PAL.sky0, W: PAL.sky1, G: PAL.grass1 });
  return ['ico_drone', 'ico_switch', 'ico_map'];
}
