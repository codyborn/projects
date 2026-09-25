// PACK-TRIS: a 10x16 well, the seven tetrominoes as suitcase bundles. D-pad left/right, down = soft drop, up = hard drop, A / B rotate.
// No clock: the game ends only on 8 lines (win) or top-out (fail). Gravity ramps per level so a slow player is pressured by speed.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import { clamp } from '../../_shared';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

const COLS = 10, ROWS = 16, CELL = 16, GOAL = 8;
// tetromino cells (4 rotations each), colours from the suitcase bundles
const SHAPES: Record<string, number[][][]> = {
  I: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
  O: [[[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]]],
  T: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]],
  S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
  J: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
  L: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]],
};
const COLORS: Record<string, number> = { I: PAL.sky1, O: PAL.sun1, T: PAL.dusk3, S: PAL.grass2, Z: PAL.red, J: PAL.sea2, L: PAL.earth2 };
const NAMES = Object.keys(SHAPES);

export class TetrisGame implements ConsoleGame {
  readonly id = 'tetris' as const; readonly name = 'PACK-TRIS'; readonly controls = ['D-PAD  move · DOWN soft drop · UP hard drop', 'A / B  rotate', 'START  pause']; readonly capSec = 0;   // 0 = no cap: play until 8 lines or top-out
  readonly instructions = `Clear ${GOAL} lines. No clock: it ends when you do, or when the well fills. D-pad moves, DOWN soft-drops, UP hard-drops, A / B rotate.`;
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void;
  private grid: (string | null)[][] = []; private cur = { k: 'T', r: 0, x: 3, y: 0 }; private next = 'I'; private bag: string[] = [];
  private lines = 0; private t = 0; private fall = 0; private level = 0; private level0 = 0; private das = 0; private dasDir = 0; private ended = false; private lockT = 0;
  private g!: Phaser.GameObjects.Graphics; private ox = 0; private oy = 0; private objs: Phaser.GameObjects.GameObject[] = [];

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; const s = ctx.scene;
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)); this.level = Math.floor(ctx.rng() * 3) + Math.round(ctx.difficulty * 2); this.level0 = this.level;
    this.ox = Math.round(ctx.screen.x + 60); this.oy = Math.round(ctx.screen.y + (ctx.screen.height - ROWS * CELL) / 2);
    this.objs.push(s.add.rectangle(ctx.screen.centerX, ctx.screen.centerY, ctx.screen.width, ctx.screen.height, ctx.palette[0]).setDepth(ctx.depth));
    this.g = s.add.graphics().setDepth(ctx.depth + 2); this.objs.push(this.g);
    this.objs.push(s.add.text(this.ox + COLS * CELL + 16, this.oy + 6, 'NEXT', { fontFamily: 'monospace', fontSize: '10px', color: '#b4b9c4' }).setDepth(ctx.depth + 3));
    this.objs.push(s.add.text(this.ox + COLS * CELL + 16, this.oy + 90, `LINES  0 / ${GOAL}\nLEVEL  ${this.level + 1}`, { fontFamily: 'monospace', fontSize: '10px', color: '#f7cf6b' }).setDepth(ctx.depth + 3).setName('tt_lines'));
    this.next = this.draw(); this.spawn(); ctx.setHearts(0, 0); ctx.setStatus(`0/${GOAL}`);
  }
  private draw() { if (!this.bag.length) { this.bag = NAMES.slice(); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.ctx.rng() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } } return this.bag.pop()!; }
  private spawn() { this.cur = { k: this.next, r: 0, x: 3, y: 0 }; this.next = this.draw(); this.lockT = 0; if (this.collides(this.cur.x, this.cur.y, this.cur.r)) this.topOut(); }
  private cells(k: string, r: number, x: number, y: number) { return SHAPES[k][r].map(([cx, cy]) => [x + cx, y + cy] as [number, number]); }
  private collides(x: number, y: number, r: number) { return this.cells(this.cur.k, r, x, y).some(([cx, cy]) => cx < 0 || cx >= COLS || cy >= ROWS || (cy >= 0 && this.grid[cy][cx])); }
  private gravity() { return Math.max(0.12, 0.8 * Math.pow(0.82, this.level)) / this.ctx.speed; }

  update(dt: number, pad: Pad) {
    if (this.ended) return; this.t += dt; const c = this.cur; if (this.t > (this.level - this.level0 + 1) * 25) this.level++;   // time also raises the level
    // horizontal with DAS
    const ax = pad.axisX; if (ax !== this.dasDir) { this.dasDir = ax; this.das = 0; if (ax && !this.collides(c.x + ax, c.y, c.r)) c.x += ax; } else if (ax) { this.das += dt; if (this.das > 0.16) { this.das -= 0.05; if (!this.collides(c.x + ax, c.y, c.r)) c.x += ax; } }
    if (pad.justPressed('a')) this.rotate(1); if (pad.justPressed('b')) this.rotate(-1);
    if (pad.justPressed('up')) { while (!this.collides(c.x, c.y + 1, c.r)) c.y++; this.lock(); this.ctx.sfx('whoosh'); return; }
    this.fall += dt * (pad.held('down') ? 8 : 1);
    if (this.fall >= this.gravity()) { this.fall = 0; if (!this.collides(c.x, c.y + 1, c.r)) c.y++; else { this.lockT += this.gravity(); if (this.lockT >= 0.3) this.lock(); } }
    this.render();
  }
  private rotate(d: number) { const c = this.cur; const r = (c.r + d + 4) % 4; for (const kick of [0, -1, 1, -2, 2]) if (!this.collides(c.x + kick, c.y, r)) { c.r = r; c.x += kick; this.ctx.sfx('blip'); return; } }
  private lock() {
    const c = this.cur; for (const [x, y] of this.cells(c.k, c.r, c.x, c.y)) { if (y < 0) { this.topOut(); return; } this.grid[y][x] = c.k; }
    let cleared = 0; for (let y = ROWS - 1; y >= 0; y--) if (this.grid[y].every(v => v)) { this.grid.splice(y, 1); this.grid.unshift(Array(COLS).fill(null)); cleared++; y++; }
    if (cleared) { this.lines += cleared; this.level += cleared >= 2 ? 1 : 0; this.ctx.flash(PAL.sun2, 40); this.ctx.sfx(cleared >= 4 ? 'win' : 'coin'); (this.ctx.scene.children.getByName('tt_lines') as Phaser.GameObjects.Text | null)?.setText(`LINES  ${this.lines} / ${GOAL}\nLEVEL  ${this.level + 1}`); this.ctx.setStatus(`${this.lines}/${GOAL}`); }
    if (this.lines >= GOAL) { this.ended = true; this.render(); const score = clamp(100 - Math.max(0, this.t - 30) * 1.5, 60, 100); this.ctx.scene.time.delayedCall(500, () => this.done({ score, perfect: score >= 99 })); return; }
    this.spawn();
  }
  private topOut() { if (this.ended) return; this.ended = true; this.ctx.shake(200, 0.01); this.ctx.sfx('lose'); this.render(); this.ctx.scene.time.delayedCall(500, () => this.done({ score: (this.lines / GOAL) * 60, failed: true })); }
  private render() {
    const g = this.g; g.clear(); g.fillStyle(PAL.ink).fillRect(this.ox - 2, this.oy - 2, COLS * CELL + 4, ROWS * CELL + 4); g.fillStyle(PAL.night0).fillRect(this.ox, this.oy, COLS * CELL, ROWS * CELL);
    g.lineStyle(1, PAL.night2, 0.6); for (let x = 1; x < COLS; x++) g.lineBetween(this.ox + x * CELL, this.oy, this.ox + x * CELL, this.oy + ROWS * CELL);
    const block = (x: number, y: number, col: number, ghost = false) => { const px = this.ox + x * CELL, py = this.oy + y * CELL; if (ghost) { g.lineStyle(1, col, 0.5).strokeRect(px + 2, py + 2, CELL - 4, CELL - 4); return; } g.fillStyle(PAL.ink).fillRect(px, py, CELL, CELL); g.fillStyle(col).fillRect(px + 1, py + 1, CELL - 2, CELL - 2); g.fillStyle(PAL.white, 0.25).fillRect(px + 2, py + 2, CELL - 4, 2); g.fillStyle(PAL.ink, 0.35).fillRect(px + 2, py + CELL - 4, CELL - 4, 2); g.fillStyle(PAL.ink, 0.5).fillRect(px + 6, py + 7, 4, 2); };
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (this.grid[y][x]) block(x, y, COLORS[this.grid[y][x]!]);
    const c = this.cur; if (!this.ended) { let gy = c.y; while (!this.collides(c.x, gy + 1, c.r)) gy++; for (const [x, y] of this.cells(c.k, c.r, c.x, gy)) if (y >= 0) block(x, y, COLORS[c.k], true); }
    for (const [x, y] of this.cells(c.k, c.r, c.x, c.y)) if (y >= 0) block(x, y, COLORS[c.k]);
    // next preview
    const nx = this.ox + COLS * CELL + 16, ny = this.oy + 20; g.fillStyle(PAL.night0).fillRect(nx - 2, ny - 2, 4 * 10 + 4, 4 * 10 + 4);
    for (const [x, y] of SHAPES[this.next][0]) { g.fillStyle(PAL.ink).fillRect(nx + x * 10, ny + y * 10, 10, 10); g.fillStyle(COLORS[this.next]).fillRect(nx + x * 10 + 1, ny + y * 10 + 1, 8, 8); }
  }
  scoreNow() { return (this.lines / GOAL) * 100; }
  destroy() { this.objs.forEach(o => o.destroy()); }
}
