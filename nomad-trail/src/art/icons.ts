// Tiny pixel icons for the city action buttons: 'ico_drone' (quadcopter, 14x10), 'ico_switch' (handheld, 14x10),
// 'ico_casino' (poker chip, drawn with arcs at 28x28 and used at scale 1), 'ico_map' (globe, 12x12).
// buildIcons(scene) registers them once per texture manager; use with scene.add.image(x, y, 'ico_drone').setScale(2).
import Phaser from 'phaser';
import { PAL } from '../core/palette';

function tex(scene: Phaser.Scene, key: string, rows: string[], map: Record<string, number>) {
  if (scene.textures.exists(key)) return key;
  const h = rows.length, w = Math.max(...rows.map(r => r.length)); const g = scene.add.graphics();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.' && map[c] !== undefined) g.fillStyle(map[c]).fillRect(x, y, 1, 1); }));
  g.generateTexture(key, w, h); g.destroy(); return key;
}

/** The casino chip, drawn with arcs at its final 28 px rather than as a 14 px grid blown up: at icon size the
 *  curve is the whole read, and a 14 px circle has four flat sides. Everything else here stays a pixel grid. */
function chip(scene: Phaser.Scene) {
  const key = 'ico_casino'; if (scene.textures.exists(key)) return key;
  const S = 28, c = S / 2, g = scene.add.graphics();
  g.fillStyle(PAL.ink).fillCircle(c, c, 13.5);                               // a dark edge so it reads on any button
  g.fillStyle(PAL.red).fillCircle(c, c, 12.5);
  /* six cream dashes set into the rim, drawn as wedges and then cut back to the inner radius */
  for (let i = 0; i < 6; i++) {
    const a0 = (i * 60 - 13) * Math.PI / 180, a1 = (i * 60 + 13) * Math.PI / 180;
    g.fillStyle(PAL.white).beginPath(); g.arc(c, c, 12.5, a0, a1, false); g.arc(c, c, 8.5, a1, a0, true); g.closePath(); g.fillPath();
  }
  g.fillStyle(PAL.ink).fillCircle(c, c, 8.5); g.fillStyle(PAL.red).fillCircle(c, c, 8);   // the face, ringed
  g.fillStyle(PAL.white).fillCircle(c, c, 6); g.fillStyle(PAL.red).fillCircle(c, c, 4.5);
  g.fillStyle(PAL.white).fillCircle(c, c, 1.6);                              // the pip in the middle
  g.generateTexture(key, S, S); g.destroy(); return key;
}

export function buildIcons(scene: Phaser.Scene) {
  tex(scene, 'ico_sound_on', [
    '...W.....',
    '..WW..W..',
    'WWWW.W.W.',
    'WWWW.W.W.',
    'WWWW.W.W.',
    '..WW..W..',
    '...W.....'], { W: PAL.white });
  tex(scene, 'ico_sound_off', [
    '...W.....',
    '..WW.R.R.',
    'WWWW..R..',
    'WWWW.R.R.',
    'WWWW.....',
    '..WW.....',
    '...W.....'], { W: PAL.gray1, R: PAL.red });
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
  chip(scene);
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
  return ['ico_drone', 'ico_switch', 'ico_casino', 'ico_map'];
}
