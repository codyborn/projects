// Procedural sprites: nomad, bags, transport, item icons, stat icons, passport stamps, coffee kit.
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import type { Item, City, ItemTag } from '../core/types';
import { px, pxSheet, P, R, circle, line, glyph, rng, seedOf, outline, Ctx } from './pixel';

export const NOMAD_W = 24, NOMAD_H = 32;
export type NomadVariant = 'base' | 'suitcase' | 'brokenwheel' | 'limp' | 'shell' | 'shell_suitcase';
/** Frame layout per nomad sheet: 0-1 idle, 2-5 walk. */
export const NOMAD_FRAMES = { idle: [0, 1], walk: [2, 3, 4, 5] };

function drawNomad(ctx: Ctx, f: number, v: NomadVariant) {
  const walk = f >= 2, wf = walk ? f - 2 : 0, bob = walk ? [0, -1, 0, -1][wf] : (f === 1 ? 1 : 0);
  const limp = v === 'limp', shell = v === 'shell' || v === 'shell_suitcase', bag = v === 'suitcase' || v === 'brokenwheel' || v === 'shell_suitcase';
  const ox = bag ? 2 : 6, y0 = 4 + bob + (limp ? 1 : 0);
  // backpack
  R(ctx, ox - 1, y0 + 9, 4, 11, PAL.earth1); R(ctx, ox, y0 + 10, 2, 9, PAL.earth2);
  // legs
  const legs = walk ? [[0, 0], [1, -1], [0, 0], [-1, 1]][wf] : [0, 0];
  R(ctx, ox + 3 + legs[0], y0 + 20, 3, 8 - Math.abs(legs[0]), PAL.night2); R(ctx, ox + 7 + legs[1], y0 + 20, 3, 8 - Math.abs(legs[1]), PAL.night2);
  R(ctx, ox + 3 + legs[0], y0 + 27, 4, 1, PAL.ink); R(ctx, ox + 7 + legs[1], y0 + 27, 4, 1, PAL.ink);
  // torso
  R(ctx, ox + 2, y0 + 9, 9, 11, shell ? PAL.sun0 : PAL.sea1); if (shell) { R(ctx, ox + 2, y0 + 9, 9, 3, PAL.earth0); R(ctx, ox + 6, y0 + 12, 1, 8, PAL.sun1); }
  // arms
  R(ctx, ox + 1, y0 + 10, 2, 7 + (limp ? 2 : 0), shell ? PAL.sun0 : PAL.sea1); R(ctx, ox + 11, y0 + 10, 2, 7, shell ? PAL.sun0 : PAL.sea1);
  R(ctx, ox + 1, y0 + 17, 2, 2, PAL.earth3); R(ctx, ox + 11, y0 + 17, 2, 2, PAL.earth3);
  // head + cap
  R(ctx, ox + 3, y0 + 1, 7, 8, PAL.earth3); R(ctx, ox + 2, y0, 9, 3, PAL.grass0); R(ctx, ox + 2, y0 + 3, 11, 1, PAL.grass0); P(ctx, ox + 5, y0 + 5, PAL.ink); P(ctx, ox + 8, y0 + 5, PAL.ink);
  if (limp) { R(ctx, ox + 4, y0 + 8, 5, 1, PAL.ink); } // grimace line
  if (bag) {
    const tilt = v === 'brokenwheel' ? 2 : 0; const sx = ox + 14, sy = y0 + 14 + tilt;
    line(ctx, ox + 12, y0 + 18, sx + 3, sy, PAL.gray1); // handle
    R(ctx, sx, sy, 8, 13 - tilt, PAL.dusk3); R(ctx, sx + 1, sy + 1, 6, 11 - tilt, PAL.dusk2); R(ctx, sx + 2, sy + 4, 4, 1, PAL.dusk3);
    P(ctx, sx + 1, sy + 13 - tilt, PAL.ink); if (v !== 'brokenwheel') P(ctx, sx + 6, sy + 13 - tilt, PAL.ink); else P(ctx, sx + 7, sy + 12, PAL.red);
  }
}
export function buildNomadSheets(scene: Phaser.Scene) {
  const vs: NomadVariant[] = ['base', 'suitcase', 'brokenwheel', 'limp', 'shell', 'shell_suitcase'];
  for (const v of vs) {
    pxSheet(scene, 'nomad_' + v, NOMAD_W, NOMAD_H, 6, (ctx, f) => { drawNomad(ctx, f, v); outline(ctx, NOMAD_W, NOMAD_H, PAL.ink); });
    if (!scene.anims.exists('nomad_' + v + '_idle')) {
      scene.anims.create({ key: 'nomad_' + v + '_idle', frames: scene.anims.generateFrameNumbers('nomad_' + v, { frames: NOMAD_FRAMES.idle }), frameRate: 2, repeat: -1 });
      scene.anims.create({ key: 'nomad_' + v + '_walk', frames: scene.anims.generateFrameNumbers('nomad_' + v, { frames: NOMAD_FRAMES.walk }), frameRate: v === 'limp' ? 4 : 8, repeat: -1 });
    }
  }
}
export function buildBags(scene: Phaser.Scene) {
  px(scene, 'suitcase', 40, 56, ctx => { R(ctx, 4, 6, 32, 46, PAL.dusk3); R(ctx, 6, 8, 28, 42, PAL.dusk2); for (let i = 0; i < 6; i++) R(ctx, 6, 10 + i * 7, 28, 1, PAL.dusk3); R(ctx, 14, 0, 12, 7, PAL.gray1); R(ctx, 16, 2, 8, 4, PAL.night1); R(ctx, 8, 52, 6, 4, PAL.ink); R(ctx, 26, 52, 6, 4, PAL.ink); R(ctx, 8, 26, 24, 6, PAL.sun2); outline(ctx, 40, 56, PAL.ink); });
  px(scene, 'suitcase_broken', 40, 56, ctx => { R(ctx, 4, 6, 32, 46, PAL.dusk3); R(ctx, 6, 8, 28, 42, PAL.dusk2); R(ctx, 14, 0, 12, 7, PAL.gray1); R(ctx, 8, 52, 6, 4, PAL.ink); R(ctx, 27, 51, 4, 3, PAL.red); R(ctx, 8, 26, 24, 6, PAL.sun2); outline(ctx, 40, 56, PAL.ink); });
  px(scene, 'backpack', 32, 40, ctx => { R(ctx, 4, 6, 24, 32, PAL.earth1); R(ctx, 6, 8, 20, 28, PAL.earth2); R(ctx, 8, 20, 16, 12, PAL.earth1); R(ctx, 10, 0, 12, 7, PAL.earth0); R(ctx, 8, 12, 16, 2, PAL.sun1); R(ctx, 4, 38, 24, 2, PAL.earth0); outline(ctx, 32, 40, PAL.ink); });
}
export function buildTransport(scene: Phaser.Scene) {
  px(scene, 'tr_plane', 48, 20, ctx => { R(ctx, 4, 8, 36, 6, PAL.white); R(ctx, 38, 9, 8, 4, PAL.gray2); R(ctx, 18, 2, 6, 7, PAL.gray2); R(ctx, 14, 12, 14, 4, PAL.gray2); R(ctx, 2, 4, 6, 5, PAL.red); for (let i = 0; i < 6; i++) P(ctx, 12 + i * 4, 10, PAL.sky1); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_train', 48, 20, ctx => { R(ctx, 2, 4, 44, 12, PAL.red); R(ctx, 2, 4, 44, 3, PAL.white); for (let i = 0; i < 5; i++) R(ctx, 6 + i * 8, 8, 5, 4, PAL.sky2); R(ctx, 4, 16, 6, 3, PAL.ink); R(ctx, 20, 16, 6, 3, PAL.ink); R(ctx, 38, 16, 6, 3, PAL.ink); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_bus', 48, 20, ctx => { R(ctx, 4, 2, 40, 14, PAL.sun2); R(ctx, 4, 2, 40, 5, PAL.sky1); for (let i = 0; i < 4; i++) R(ctx, 8 + i * 9, 4, 6, 4, PAL.sky3); R(ctx, 8, 15, 6, 4, PAL.ink); R(ctx, 34, 15, 6, 4, PAL.ink); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_ferry', 48, 20, ctx => { R(ctx, 2, 12, 44, 6, PAL.night2); R(ctx, 10, 6, 28, 6, PAL.white); R(ctx, 20, 1, 4, 5, PAL.red); for (let i = 0; i < 5; i++) P(ctx, 13 + i * 5, 8, PAL.sky1); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_campervan', 48, 20, ctx => { R(ctx, 4, 3, 40, 13, PAL.white); R(ctx, 4, 3, 40, 6, PAL.sea2); R(ctx, 8, 5, 8, 4, PAL.sky2); R(ctx, 30, 5, 10, 4, PAL.sky2); R(ctx, 8, 15, 6, 4, PAL.ink); R(ctx, 34, 15, 6, 4, PAL.ink); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_trek', 48, 20, ctx => { R(ctx, 12, 8, 10, 8, PAL.earth1); R(ctx, 10, 14, 14, 4, PAL.earth0); R(ctx, 26, 8, 10, 8, PAL.earth1); R(ctx, 24, 14, 14, 4, PAL.earth0); R(ctx, 14, 4, 6, 4, PAL.red); R(ctx, 28, 4, 6, 4, PAL.red); outline(ctx, 48, 20, PAL.ink); });
  px(scene, 'tr_car', 48, 20, ctx => { R(ctx, 6, 8, 36, 8, PAL.sea1); R(ctx, 14, 3, 20, 6, PAL.sea1); R(ctx, 16, 4, 7, 4, PAL.sky2); R(ctx, 25, 4, 7, 4, PAL.sky2); R(ctx, 10, 15, 6, 4, PAL.ink); R(ctx, 32, 15, 6, 4, PAL.ink); outline(ctx, 48, 20, PAL.ink); });
}
/** Stat icons 10x10: 'ic_heart','ic_bolt','ic_smile','ic_shirt','ic_weight','ic_day','ic_coffee','ic_bag','ic_pack'. */
export function buildStatIcons(scene: Phaser.Scene) {
  const g = (k: string, pat: string[], c: number) => px(scene, k, 10, 10, ctx => glyph(ctx, pat, 0, 0, c));
  g('ic_heart', ['0110001100', '1111111110', '1111111110', '1111111110', '0111111100', '0011111000', '0001110000', '0000100000', '0000000000', '0000000000'], PAL.red);
  g('ic_bolt', ['0000111000', '0001110000', '0011100000', '0111111100', '0000111000', '0001110000', '0011100000', '0011000000', '0010000000', '0000000000'], PAL.sun2);
  g('ic_smile', ['0011111000', '0100000100', '1000000010', '1010001010', '1000000010', '1010001010', '1001110010', '0100000100', '0011111000', '0000000000'], PAL.sun1);
  g('ic_shirt', ['0110001100', '1111111110', '1111111110', '1101111010', '0001111000', '0001111000', '0001111000', '0001111000', '0001111000', '0000000000'], PAL.sky1);
  g('ic_weight', ['0001111000', '0001001000', '0011111100', '0111111110', '0111111110', '0111111110', '0111111110', '0011111100', '0000000000', '0000000000'], PAL.gray2);
  g('ic_day', ['0111111100', '1000000010', '1011111010', '1000000010', '1010101010', '1000000010', '1010101010', '1000000010', '0111111100', '0000000000'], PAL.white);
  g('ic_coffee', ['0010100000', '0101000000', '0010100000', '1111111100', '1111111110', '1111111110', '1111111100', '0111111000', '0011110000', '0000000000'], PAL.earth3);
  g('ic_bag', ['0011110000', '0100001000', '1111111100', '1111111100', '1111111100', '1111111100', '1111111100', '1111111100', '0100001000', '0000000000'], PAL.dusk3);
  g('ic_pack', ['0001100000', '0011110000', '0111111000', '0111111000', '0111111000', '0110011000', '0111111000', '0111111000', '0011110000', '0000000000'], PAL.earth2);
  g('ic_gold', ['0000100000', '0001110000', '0011111000', '1111111110', '0011111000', '0111011100', '0110001100', '0000000000', '0000000000', '0000000000'], PAL.sun2);
  g('ic_mute', ['0000100000', '0001100000', '0111100000', '0111100000', '0111100000', '0001100000', '0000100000', '1000000010', '0100000100', '0010001000'], PAL.gray2);
  g('ic_sound', ['0000100000', '0001100100', '0111100010', '0111101010', '0111101010', '0001100010', '0000100100', '0000000000', '0000000000', '0000000000'], PAL.gray2);
}
const TAG_GLYPH: Partial<Record<ItemTag, string[]>> = {
  work: ['0000000000000000', '0011111111111100', '0010000000000100', '0010111111010100', '0010000000000100', '0010111111010100', '0010000000000100', '0011111111111100', '0000000000000000', '0111111111111110', '0100000000000010', '0111111111111110', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  clothing: ['0000000000000000', '0011100000111000', '0111111111111100', '1111111111111110', '1111111111111110', '1110111111101110', '0000111111100000', '0000111111100000', '0000111111100000', '0000111111100000', '0000111111100000', '0000111111100000', '0000111111100000', '0000111111100000', '0000000000000000', '0000000000000000'],
  health: ['0000000000000000', '0000001111000000', '0000001111000000', '0000001111000000', '0001111111111000', '0001111111111000', '0001111111111000', '0001111111111000', '0000001111000000', '0000001111000000', '0000001111000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  coffee: ['0000000000000000', '0000010100000000', '0000101000000000', '0000010100000000', '0000000000000000', '0011111111110000', '0011111111111100', '0011111111110100', '0011111111110100', '0011111111111100', '0011111111110000', '0001111111100000', '0000111111000000', '0011111111110000', '0000000000000000', '0000000000000000'],
  fitness: ['0000000000000000', '0000000000000000', '0110000000000110', '0110000000000110', '0111111111111110', '0111111111111110', '0110000000000110', '0110000000000110', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  firstaid: ['0000000000000000', '0111111111111110', '0100000000000010', '0100000110000010', '0100000110000010', '0100011111100010', '0100011111100010', '0100000110000010', '0100000110000010', '0100000000000010', '0111111111111110', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  switch: ['0000000000000000', '0000000000000000', '0011100000011100', '0111111111111110', '0110111111110110', '0100111111110010', '0100111111110010', '0110111111110110', '0111111111111110', '0011100000011100', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  kettle: ['0000000000000000', '0000001111000000', '0000000110000000', '0001111111111000', '0011111111111100', '1111111111111100', '0111111111111100', '0011111111111000', '0011111111111000', '0001111111110000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  camera: ['0000000000000000', '0000000000000000', '0000011100000000', '0111111111111110', '0100000000000010', '0100011111000010', '0100110001100010', '0100110001100010', '0100011111000010', '0100000000000010', '0111111111111110', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  kite: ['0000000000000000', '0000000111100000', '0000011111111000', '0001111111111100', '0011111111111000', '0011111111110000', '0001111111100000', '0000011110000000', '0000000100000000', '0000001000000000', '0000010000000000', '0000100000000000', '0001000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  meds: ['0000000000000000', '0000000000000000', '0000000001111000', '0000000011111100', '0000000111111100', '0000001111111000', '0000011111110000', '0000111111100000', '0001111111000000', '0011111110000000', '0011111100000000', '0001111000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
  sleep: ['0000000000000000', '0000000000000000', '0011111111111100', '0111111111111110', '0111000110001110', '0111000110001110', '0111111111111110', '0011111111111100', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'],
};
const GENERIC = ['0000000000000000', '0001111111111000', '0011111111111100', '0011111111111100', '0011111111111100', '0011111111111100', '0011111111111100', '0011111111111100', '0011111111111100', '0011111111111100', '0001111111111000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000', '0000000000000000'];
/** 16x16 item icon texture key 'item_<id>' (created on demand). */
export function itemIcon(scene: Phaser.Scene, item: Item): string {
  const key = 'item_' + item.id; if (scene.textures.exists(key)) return key;
  const tag = (['switch', 'kettle', 'coffee', 'firstaid', 'camera', 'kite', 'meds', 'work', 'fitness', 'clothing', 'health', 'sleep'] as ItemTag[]).find(t => item.tags.includes(t));
  const pat = (tag && TAG_GLYPH[tag]) || GENERIC;
  return px(scene, key, 16, 16, ctx => {
    glyph(ctx, pat, 0, 0, item.color);
    // a second shade for depth
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (pat[y][x] === '1' && (x + y) % 5 === 0) P(ctx, x, y, PAL.white);
    outline(ctx, 16, 16, PAL.ink);
  });
}
/** Big item art for the packing grid: w*cell x h*cell tile with icon, label handled by caller. key 'itemtile_<id>_<cell>' */
export function itemTile(scene: Phaser.Scene, item: Item, cell: number): string {
  const key = `itemtile_${item.id}_${cell}`; if (scene.textures.exists(key)) return key;
  const W = item.w * cell, Hh = item.h * cell; itemIcon(scene, item);
  return px(scene, key, W, Hh, ctx => {
    R(ctx, 0, 0, W, Hh, PAL.ink); R(ctx, 1, 1, W - 2, Hh - 2, item.color); R(ctx, 2, 2, W - 4, 1, PAL.white); R(ctx, 2, 2, 1, Hh - 4, PAL.white);
    for (let y = 2; y < Hh - 2; y++) for (let x = 2; x < W - 2; x++) if ((x + y) % 4 === 0) P(ctx, x, y, PAL.night1);
    R(ctx, 1, Hh - 3, W - 2, 2, PAL.night1);
  });
}
/** Passport stamp texture 'stamp_<cityId>_<plain|gold>' 44x44 with initials, glyph, and date arc. */
export function stampTexture(scene: Phaser.Scene, city: Pick<City, 'id' | 'name' | 'stampIcon' | 'country'>, gold: boolean, dayLabel = ''): string {
  const key = `stamp_${city.id}_${gold ? 'gold' : 'plain'}`; if (scene.textures.exists(key)) return key;
  const ink = gold ? PAL.sun1 : [PAL.red, PAL.sky0, PAL.grass1, PAL.dusk2][seedOf(city.id) % 4];
  const r = rng(seedOf(city.id)); const round = r.chance(0.5);
  return px(scene, key, 44, 44, ctx => {
    if (round) { circle(ctx, 22, 22, 20, ink); circle(ctx, 22, 22, 18, PAL.white); circle(ctx, 22, 22, 17, ink); circle(ctx, 22, 22, 15, PAL.white); }
    else { R(ctx, 3, 5, 38, 34, ink); R(ctx, 5, 7, 34, 30, PAL.white); R(ctx, 6, 8, 32, 28, ink); R(ctx, 8, 10, 28, 24, PAL.white); }
    const ini = city.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    // initials via mini 3x5 glyphs
    const MINI: Record<string, string[]> = { A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'], D: ['110', '101', '101', '101', '110'], E: ['111', '100', '110', '100', '111'], F: ['111', '100', '110', '100', '100'], G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'], J: ['011', '001', '001', '101', '010'], K: ['101', '110', '100', '110', '101'], L: ['100', '100', '100', '100', '111'], M: ['101', '111', '111', '101', '101'], N: ['110', '101', '101', '101', '101'], O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'], Q: ['010', '101', '101', '011', '001'], R: ['110', '101', '110', '101', '101'], S: ['011', '100', '010', '001', '110'], T: ['111', '010', '010', '010', '010'], U: ['101', '101', '101', '101', '111'], V: ['101', '101', '101', '101', '010'], W: ['101', '101', '111', '111', '101'], X: ['101', '101', '010', '101', '101'], Y: ['101', '101', '010', '010', '010'], Z: ['111', '001', '010', '100', '111'] };
    ini.split('').forEach((ch, i) => glyph(ctx, MINI[ch] || MINI.O, 12 + i * 7, 26, ink, 1));
    drawStampGlyph(ctx, city.stampIcon, 22, 17, ink);
    // date arc dots
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + 0.7 * i / 8); P(ctx, 22 + Math.cos(a) * 12, 12 + Math.sin(a) * 4 - 1, ink); }
    if (gold) { P(ctx, 6, 6, PAL.sun3); P(ctx, 37, 8, PAL.sun3); P(ctx, 8, 36, PAL.sun3); }
    if (dayLabel) { /* caller overlays text */ }
    // grunge: knock out random pixels for the inked look
    const img = ctx.getImageData(0, 0, 44, 44); for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3] && r.chance(0.08)) img.data[i + 3] = 0; ctx.putImageData(img, 0, 0);
  });
}
/** Tiny glyphs for stamps and map pins by stampIcon key. */
export function drawStampGlyph(ctx: Ctx, icon: string, cx: number, cy: number, c: number) {
  const g = (pat: string[]) => glyph(ctx, pat, cx - Math.floor(pat[0].length / 2), cy - Math.floor(pat.length / 2), c);
  switch (icon) {
    case 'palm': g(['0010100', '0101010', '1101011', '0011100', '0001000', '0001000', '0001000']); break;
    case 'skyline': g(['0000100', '0010110', '0110110', '0110111', '1110111', '1111111', '1111111']); break;
    case 'tram': g(['0101010', '0111110', '0100010', '0111110', '0111110', '0010100', '0111110']); break;
    case 'mountain': case 'peak': g(['0001000', '0011100', '0111110', '1111111', '0000000', '0000000', '0000000'].map((r, i) => i < 4 ? r : '0000000')); g(['0000000', '0000000', '0000000', '0000000', '0001000', '0011100', '0111110']); break;
    case 'torii': g(['1111111', '0111110', '0100010', '1111111', '0100010', '0100010', '0100010']); break;
    case 'whale': g(['0000010', '1100100', '1111111', '0111110', '0011100', '0000000', '0000000']); break;
    case 'kite': g(['0001000', '0011100', '0111110', '0011100', '0001000', '0000100', '0000010']); break;
    case 'wave': g(['0000000', '0110000', '1001001', '0000110', '0000000', '0110000', '1001001']); break;
    case 'stupa': g(['0001000', '0011100', '0001000', '0011100', '0111110', '1111111', '1111111']); break;
    case 'dune': g(['0000000', '0000000', '0011100', '0110011', '1100001', '0000000', '0000000']); break;
    case 'aurora': g(['1000100', '0100010', '0010001', '0100010', '1000100', '0000000', '0000000']); break;
    case 'cactus': g(['0001000', '1001001', '1001001', '1111111', '0001000', '0001000', '0001000']); break;
    case 'dome': g(['0001000', '0011100', '0111110', '0111110', '1111111', '1000001', '1111111']); break;
    case 'castle': g(['1010101', '1111111', '1111111', '1101011', '1101011', '1111111', '1111111']); break;
    case 'temple': g(['0001000', '0011100', '0111110', '0011100', '1111111', '1011101', '1111111']); break;
    case 'tower': g(['0001000', '0001000', '0011100', '0011100', '0011100', '0111110', '1111111']); break;
    case 'lake': g(['0001000', '0011100', '0000000', '1111111', '0111110', '0011100', '0000000']); break;
    case 'barn': g(['0001000', '0011100', '0111110', '1111111', '1101011', '1101011', '1111111']); break;
    case 'flatiron': g(['0000001', '0000011', '0000111', '0001111', '0011111', '0111111', '1111111']); break;
    case 'dice': g(['1111111', '1100011', '1100011', '1001001', '1100011', '1100011', '1111111']); break;
    case 'leaf': g(['0000001', '0000110', '0011100', '0111000', '1110000', '1100000', '1000000']); break;
    case 'bridge': g(['0000000', '0001000', '0111110', '1100011', '1001001', '1001001', '1111111']); break;
    case 'sun': g(['0001000', '0100010', '0011100', '1111111', '0011100', '0100010', '0001000']); break;
    default: g(['0011100', '0100010', '1000001', '1001001', '1000001', '0100010', '0011100']);
  }
}
/** Coffee kit sprites: 'cf_grinder' (2-frame sheet), 'cf_kettle', 'cf_dripper', 'cf_cup'. */
export function buildCoffeeKit(scene: Phaser.Scene) {
  pxSheet(scene, 'cf_grinder', 20, 40, 2, (ctx, f) => { R(ctx, 4, 8, 12, 30, PAL.gray0); R(ctx, 6, 10, 8, 26, PAL.gray1); R(ctx, 5, 4, 10, 5, PAL.gray2); R(ctx, 9, 0, 2, 5, PAL.gray2); line(ctx, 10, 1, f ? 18 : 2, 1, PAL.gray2); R(ctx, 6, 30, 8, 6, PAL.night2); outline(ctx, 20, 40, PAL.ink); });
  px(scene, 'cf_kettle', 36, 30, ctx => { R(ctx, 8, 10, 20, 16, PAL.gray2); R(ctx, 10, 12, 16, 12, PAL.white); R(ctx, 14, 5, 8, 5, PAL.gray2); R(ctx, 17, 2, 2, 3, PAL.ink); line(ctx, 8, 14, 1, 24, PAL.gray2); line(ctx, 9, 14, 2, 24, PAL.gray2); R(ctx, 28, 8, 4, 14, PAL.ink); R(ctx, 28, 8, 6, 2, PAL.ink); outline(ctx, 36, 30, PAL.ink); });
  px(scene, 'cf_dripper', 24, 20, ctx => { for (let y = 0; y < 14; y++) R(ctx, 2 + y * 0.6, y, 20 - y * 1.2, 1, PAL.gray2); R(ctx, 4, 14, 16, 2, PAL.gray1); R(ctx, 9, 16, 6, 4, PAL.earth1); outline(ctx, 24, 20, PAL.ink); });
  pxSheet(scene, 'cf_cup', 24, 20, 5, (ctx, f) => { R(ctx, 4, 6, 14, 12, PAL.white); R(ctx, 18, 9, 3, 6, PAL.white); R(ctx, 19, 10, 1, 4, PAL.night0); const fill = Math.round((f / 4) * 9); if (fill) R(ctx, 5, 16 - fill, 12, fill, PAL.earth0); R(ctx, 2, 18, 18, 2, PAL.gray2); outline(ctx, 24, 20, PAL.ink); });
  px(scene, 'cf_steam', 4, 4, ctx => { R(ctx, 0, 0, 4, 4, PAL.white); });
  px(scene, 'dot', 2, 2, ctx => R(ctx, 0, 0, 2, 2, PAL.white));
  px(scene, 'px1', 1, 1, ctx => R(ctx, 0, 0, 1, 1, PAL.white));
}
