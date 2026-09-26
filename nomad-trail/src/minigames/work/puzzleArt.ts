import Phaser from 'phaser';
import { PAL } from '../../core/palette';

/** Small illustrated frame above a puzzle: procedural pixel art at 2 px per dot.
 *  art: 'laptop' (default; a laptop with a pink unicorn sticker and a mug), 'pool' (two beakers and the x*y curve),
 *  'chart' (candles), 'code' (a screen full of code), 'chain' (linked blocks), 'whiteboard' (boxes and arrows). */
export function drawPuzzleArt(scene: Phaser.Scene, x: number, y: number, w: number, h: number, art?: string) {
  const g = scene.add.graphics(); const U = 2;
  const R = (px: number, py: number, pw: number, ph: number, c: number) => { g.fillStyle(c); g.fillRect(x + px * U, y + py * U, pw * U, ph * U); };
  const cols = Math.floor(w / U), rows = Math.floor(h / U);
  // backdrop: a desk edge and a wall
  R(0, 0, cols, rows, PAL.night1); R(0, rows - 10, cols, 10, PAL.earth0); R(0, rows - 10, cols, 1, PAL.earth2);
  const cx = Math.floor(cols / 2);
  const mug = (mx: number) => { R(mx, rows - 20, 8, 10, PAL.white); R(mx + 8, rows - 18, 3, 5, PAL.white); R(mx + 9, rows - 17, 1, 3, PAL.night1); R(mx + 1, rows - 19, 6, 2, PAL.earth1); R(mx + 2, rows - 26, 1, 4, PAL.gray1); R(mx + 5, rows - 28, 1, 5, PAL.gray1); };
  const laptop = (lx: number) => {
    R(lx, rows - 34, 40, 24, PAL.gray0); R(lx + 2, rows - 32, 36, 20, PAL.night0);            // lid + screen
    for (let i = 0; i < 6; i++) R(lx + 4, rows - 30 + i * 3, 6 + ((i * 7) % 20), 1, i % 3 === 0 ? PAL.pink : i % 3 === 1 ? PAL.neon : PAL.sky2);   // code lines
    R(lx - 3, rows - 10, 46, 3, PAL.gray1); R(lx + 2, rows - 9, 36, 1, PAL.gray0);              // base / keyboard
    R(lx + 30, rows - 22, 6, 6, PAL.pink); R(lx + 32, rows - 24, 1, 2, PAL.white); R(lx + 33, rows - 20, 1, 1, PAL.ink);   // unicorn sticker: pink blob, horn, eye
  };
  switch (art) {
    case 'pool': {
      // two beakers, one tall and thin (ETH), one short and wide (USDC), and the hyperbola on a card behind
      R(cx - 30, 6, 40, 30, PAL.white); R(cx - 28, 8, 36, 26, PAL.sun3);
      for (let i = 0; i < 30; i++) { const px = cx - 26 + i; const py = 8 + Math.min(24, Math.round(60 / (i + 3))); R(px, py, 1, 1, PAL.dusk3); }
      R(cx - 44, rows - 40, 12, 30, PAL.sky1); R(cx - 42, rows - 26, 8, 15, PAL.sky2); R(cx - 46, rows - 42, 16, 2, PAL.gray2);
      R(cx + 18, rows - 26, 26, 16, PAL.grass1); R(cx + 20, rows - 18, 22, 7, PAL.grass2); R(cx + 16, rows - 28, 30, 2, PAL.gray2);
      mug(6); break; }
    case 'chart': {
      R(8, 6, cols - 16, rows - 20, PAL.night0); R(9, 7, cols - 18, rows - 22, PAL.night2);
      for (let i = 0; i < 12; i++) { const bx = 14 + i * Math.floor((cols - 28) / 12); const up = (i * 7) % 3 !== 0; const hgt = 6 + ((i * 5) % 12); const top = rows - 26 - hgt - ((i * 3) % 8); R(bx + 1, top - 3, 1, hgt + 6, up ? PAL.grass2 : PAL.red); R(bx, top, 3, hgt, up ? PAL.grass2 : PAL.red); }
      R(12, rows - 18, cols - 24, 1, PAL.gray1); mug(cols - 22); break; }
    case 'code': {
      R(6, 4, cols - 12, rows - 16, PAL.gray0); R(8, 6, cols - 16, rows - 20, PAL.night0);
      for (let i = 0; i < 8; i++) { const ind = (i % 4) * 4; R(10 + ind, 9 + i * 3, 4, 1, PAL.dusk3); R(15 + ind, 9 + i * 3, 8 + ((i * 11) % 24), 1, i % 2 ? PAL.neon : PAL.sky2); }
      R(cols - 30, 10, 1, 20, PAL.pink); mug(cols - 20); break; }
    case 'chain': {
      for (let i = 0; i < 5; i++) { const bx = 10 + i * 24; R(bx, rows - 32, 16, 16, PAL.gray1); R(bx + 2, rows - 30, 12, 12, PAL.night3); R(bx + 4, rows - 27, 8, 1, PAL.neon); R(bx + 4, rows - 24, 6, 1, PAL.gray2); if (i < 4) R(bx + 16, rows - 25, 8, 2, PAL.sun2); }
      R(cols - 34, 8, 20, 12, PAL.sun3); R(cols - 32, 10, 16, 8, PAL.sun1); break; }
    case 'whiteboard': {
      R(6, 4, cols - 12, rows - 18, PAL.gray1); R(8, 6, cols - 16, rows - 22, PAL.white);
      R(14, 12, 18, 10, PAL.sky0); R(44, 12, 18, 10, PAL.sky0); R(74, 12, 18, 10, PAL.sky0); R(32, 16, 12, 1, PAL.ink); R(62, 16, 12, 1, PAL.ink);
      R(16, 14, 14, 6, PAL.white); R(46, 14, 14, 6, PAL.white); R(76, 14, 14, 6, PAL.white);
      R(30, 30, 40, 1, PAL.red); R(30, 30, 1, 10, PAL.red); for (let i = 0; i < 20; i++) R(32 + i * 2, 40 - Math.round(i * 0.45), 2, 1, PAL.dusk3);
      R(cols - 14, rows - 30, 6, 14, PAL.red); R(cols - 14, rows - 32, 6, 2, PAL.ink); break; }
    default: laptop(cx - 20); mug(cx + 30);
  }
  return g;
}
