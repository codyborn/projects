// PACK-TRIS: pack the suitcase. A 10x16 well, plain coloured tetrominoes (the original skin); the FRAGILE piece is drawn as glass and labelled in red.
// D-pad left/right, DOWN held = soft drop (~10x gravity), A / B rotate. No hard drop, no clock.
// Flavour: a FRAGILE wine bottle every 6th piece (land on it before its row clears and it shatters: −1 line, the column above drops);
// a ZIPPER pull every 5 lines (bottom row removed, everything drops, speed steps up); a rare BATTERY (clears a 3x3 blast where it locks);
// the end is "close the suitcase": reach 8 lines with the stack under the lid line, tidiness bonus for fewer holes. Top-out still fails.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import { clamp } from '../../_shared';
import { hex } from '../../../core/palette';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

const COLS = 10, ROWS = 16, CELL = 16, GOAL = 8, LID = 4, ZIP_EVERY = 5, FRAGILE_EVERY = 6;
const SHAPES: Record<string, number[][][]> = {
  I: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]], [[0, 2], [1, 2], [2, 2], [3, 2]], [[1, 0], [1, 1], [1, 2], [1, 3]]],
  O: [[[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [2, 1]]],
  T: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]],
  S: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]], [[1, 1], [2, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [1, 2]]],
  Z: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[2, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [1, 2], [2, 2]], [[1, 0], [0, 1], [1, 1], [0, 2]]],
  J: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]],
  L: [[[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]], [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]]],
};
/** cell colours (the original skin) */
const COLORS: Record<string, number> = { I: PAL.sky1, O: PAL.sun1, T: PAL.dusk3, S: PAL.grass2, Z: PAL.red, J: PAL.sea2, L: PAL.earth2 };
const NAMES = Object.keys(SHAPES);
interface Cell { k: string; f?: number; b?: boolean }
interface Piece { k: string; r: number; x: number; y: number; f?: number; b?: boolean }

export class TetrisGame implements ConsoleGame {
  readonly id = 'tetris' as const; readonly name = 'PACK-TRIS'; readonly controls = ['D-PAD  move · hold DOWN to drop faster', 'A / B  rotate', 'START  pause']; readonly capSec = 0;   // 0 = no cap: play until the case closes or the well fills
  readonly instructions = `Pack ${GOAL} lines and keep the pile under the lid to close the case. Mind the FRAGILE bottle. D-pad moves, hold DOWN to drop faster, A / B rotate.`;
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void;
  private grid: (Cell | null)[][] = []; private cur: Piece = { k: 'T', r: 0, x: 3, y: 0 }; private next: Piece = { k: 'I', r: 0, x: 3, y: 0 }; private bag: string[] = [];
  private lines = 0; private t = 0; private fall = 0; private level = 0; private level0 = 0; private das = 0; private dasDir = 0; private ended = false; private lockT = 0;
  private pieces = 0; private fid = 0; private lastBattery = -99; private nextZip = ZIP_EVERY; private zipT = 0;
  /** counters the harness reads */ stats = { shatters: 0, zips: 0, batteries: 0, rotations: 0 };
  private g!: Phaser.GameObjects.Graphics; private fx!: Phaser.GameObjects.Graphics; private ox = 0; private oy = 0; private objs: Phaser.GameObjects.GameObject[] = [];

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; const s = ctx.scene;
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null)); this.level = Math.floor(ctx.rng() * 3) + Math.round(ctx.difficulty * 2); this.level0 = this.level;
    this.ox = Math.round(ctx.screen.x + 60); this.oy = Math.round(ctx.screen.y + (ctx.screen.height - ROWS * CELL) / 2);
    this.objs.push(s.add.rectangle(ctx.screen.centerX, ctx.screen.centerY, ctx.screen.width, ctx.screen.height, ctx.palette[0]).setDepth(ctx.depth));
    this.g = s.add.graphics().setDepth(ctx.depth + 2); this.objs.push(this.g); this.fx = s.add.graphics().setDepth(ctx.depth + 4); this.objs.push(this.fx);
    const tx = this.ox + COLS * CELL + 16; const mono = (y: number, txt: string, color: string, name?: string) => { const t = s.add.text(tx, y, txt, { fontFamily: 'monospace', fontSize: '10px', color }).setDepth(ctx.depth + 3); if (name) t.setName(name); this.objs.push(t); return t; };
    mono(this.oy + 6, 'NEXT', '#b4b9c4'); mono(this.oy + 66, '', hex(PAL.red), 'tt_item'); mono(this.oy + 96, '', '#f7cf6b', 'tt_lines'); mono(this.oy + 150, 'LID: keep the\npile under\nthe line', '#6f7b8f');
    const tag = s.add.text(this.ox - 5, this.oy + 10, 'FRAGILE', { fontFamily: 'monospace', fontSize: '9px', color: hex(PAL.red) }).setOrigin(1, 0).setDepth(ctx.depth + 3).setName('tt_tag').setVisible(false); this.objs.push(tag); s.tweens.add({ targets: tag, alpha: 0.4, yoyo: true, repeat: -1, duration: 500 });
    this.next = this.makePiece(); this.spawn(); ctx.setHearts(0, 0); this.hud();
  }
  private hud() { (this.ctx.scene.children.getByName('tt_lines') as Phaser.GameObjects.Text | null)?.setText(`LINES  ${this.lines} / ${GOAL}\nLEVEL  ${this.level + 1}\nZIP in ${Math.max(0, this.nextZip - this.lines)}`); const item = this.ctx.scene.children.getByName('tt_item') as Phaser.GameObjects.Text | null; item?.setText(this.next.f ? 'FRAGILE' : this.next.b ? 'BATTERY' : '').setColor(this.next.f ? hex(PAL.red) : hex(PAL.sun2)); (this.ctx.scene.children.getByName('tt_tag') as Phaser.GameObjects.Text | null)?.setVisible(!!this.cur.f); this.ctx.setStatus(this.lines >= GOAL ? 'CLOSE THE LID' : `${this.lines}/${GOAL}`); }
  private draw() { if (!this.bag.length) { this.bag = NAMES.slice(); for (let i = this.bag.length - 1; i > 0; i--) { const j = Math.floor(this.ctx.rng() * (i + 1)); [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]; } } return this.bag.pop()!; }
  /** the next piece: a fragile bottle every 6th, a rare battery, else a bag draw */
  private makePiece(): Piece { this.pieces++; if (this.pieces % FRAGILE_EVERY === 0) return { k: 'I', r: 0, x: 3, y: 0, f: ++this.fid }; if (this.pieces > 4 && this.pieces - this.lastBattery > 8 && this.ctx.rng() < 0.1) { this.lastBattery = this.pieces; return { k: 'O', r: 0, x: 3, y: 0, b: true }; } return { k: this.draw(), r: 0, x: 3, y: 0 }; }
  private spawn() { this.cur = { ...this.next, r: 0, x: 3, y: 0 }; this.next = this.makePiece(); this.lockT = 0; this.hud(); if (this.collides(this.cur.x, this.cur.y, this.cur.r)) this.topOut(); }
  private cells(k: string, r: number, x: number, y: number) { return SHAPES[k][r].map(([cx, cy]) => [x + cx, y + cy] as [number, number]); }
  private collides(x: number, y: number, r: number) { return this.cells(this.cur.k, r, x, y).some(([cx, cy]) => cx < 0 || cx >= COLS || cy >= ROWS || (cy >= 0 && this.grid[cy][cx])); }
  private gravity() { return Math.max(0.12, 0.8 * Math.pow(0.82, this.level)) / this.ctx.speed; }

  update(dt: number, pad: Pad) {
    if (this.ended) return; this.t += dt; const c = this.cur; if (this.t > (this.level - this.level0 + 1) * 25) this.level++;   // time also raises the level
    if (this.zipT > 0) { this.zipT -= dt; this.render(); return; }   // zipper animation: the well is frozen for a beat
    const ax = pad.axisX; if (ax !== this.dasDir) { this.dasDir = ax; this.das = 0; if (ax && !this.collides(c.x + ax, c.y, c.r)) c.x += ax; } else if (ax) { this.das += dt; if (this.das > 0.16) { this.das -= 0.05; if (!this.collides(c.x + ax, c.y, c.r)) c.x += ax; } }
    // rotation never touches y or the fall accumulator; the wall kick is horizontal only
    const rot = pad.justPressed('a') ? 1 : pad.justPressed('b') ? -1 : 0; if (rot) this.rotate(rot);
    // soft drop only (DOWN held), never on a rotate frame; nothing slams a piece to the bottom
    const soft = pad.held('down') && !rot; this.fall += dt * (soft ? 10 : 1);
    if (this.fall >= this.gravity()) { this.fall = 0; if (!this.collides(c.x, c.y + 1, c.r)) c.y++; else { this.lockT += this.gravity(); if (this.lockT >= 0.3) this.lock(); } }
    this.render();
  }
  private rotate(d: number) { const c = this.cur; const r = (c.r + d + 4) % 4; for (const kick of [0, -1, 1, -2, 2]) if (!this.collides(c.x + kick, c.y, r)) { c.r = r; c.x += kick; this.stats.rotations++; this.ctx.sfx('blip'); return; } }

  private lock() {
    const c = this.cur; const placed = this.cells(c.k, c.r, c.x, c.y);
    for (const [x, y] of placed) { if (y < 0) { this.topOut(); return; } this.grid[y][x] = { k: c.k, f: c.f, b: c.b }; }
    if (c.b) this.blast(placed);
    else { const hit = new Set<number>(); for (const [x, y] of placed) { const below = y + 1 < ROWS ? this.grid[y + 1][x] : null; if (below && below.f !== undefined && below.f !== c.f) hit.add(below.f); } for (const id of hit) this.shatter(id); }
    let cleared = 0; for (let y = ROWS - 1; y >= 0; y--) if (this.grid[y].every(v => v)) { this.grid.splice(y, 1); this.grid.unshift(Array(COLS).fill(null)); cleared++; y++; }
    if (cleared) { this.lines += cleared; this.level += cleared >= 2 ? 1 : 0; this.ctx.flash(PAL.sun2, 40); this.ctx.sfx(cleared >= 4 ? 'win' : 'coin'); }
    while (this.lines >= this.nextZip) { this.nextZip += ZIP_EVERY; this.zipper(); }
    this.hud();
    if (this.lines >= GOAL && this.underLid()) { this.closeCase(); return; }
    this.spawn();
  }
  private underLid() { for (let y = 0; y < LID; y++) if (this.grid[y].some(v => v)) return false; return true; }
  /** empty cells with something above them in the same column */
  private holes() { let n = 0; for (let x = 0; x < COLS; x++) { let seen = false; for (let y = 0; y < ROWS; y++) { if (this.grid[y][x]) seen = true; else if (seen) n++; } } return n; }
  private shatter(id: number) {
    const cols = new Set<number>(); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (this.grid[y][x]?.f === id) { cols.add(x); this.shards(x, y); this.grid[y][x] = null; }
    for (const x of cols) { const stack: Cell[] = []; for (let y = ROWS - 1; y >= 0; y--) if (this.grid[y][x]) stack.push(this.grid[y][x]!); for (let y = ROWS - 1; y >= 0; y--) this.grid[y][x] = stack[ROWS - 1 - y] || null; }   // the column above drops
    this.lines = Math.max(0, this.lines - 1); this.stats.shatters++; this.ctx.shake(180, 0.008); this.ctx.flash(PAL.red, 60); this.ctx.sfx('hurt'); this.toast('FRAGILE! −1 line', PAL.red);
  }
  private blast(placed: [number, number][]) {
    const xs = placed.map(p => p[0]), ys = placed.map(p => p[1]); const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;   // 3x3 ring around the 2x2 battery
    for (let y = Math.max(0, y0); y <= Math.min(ROWS - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(COLS - 1, x1); x++) { if ((x === x0 || x === x1) && (y === y0 || y === y1)) continue; if (this.grid[y][x]) this.sparks(x, y); this.grid[y][x] = null; }
    this.stats.batteries++; this.ctx.shake(220, 0.012); this.ctx.flash(PAL.white, 90); this.ctx.sfx('pop'); this.toast('BATTERY BLAST', PAL.sun2);
  }
  private zipper() {
    this.grid.splice(ROWS - 1, 1); this.grid.unshift(Array(COLS).fill(null)); this.level++; this.stats.zips++; this.zipT = 0.6; this.ctx.sfx('whoosh'); this.toast('ZIPPER! speed up', PAL.neon);
    const s = this.ctx.scene; const y = this.oy - 6; const slider = s.add.rectangle(this.ox, y, 10, 8, PAL.sun2).setStrokeStyle(1, PAL.ink).setDepth(this.ctx.depth + 5); this.objs.push(slider);
    const teeth = s.add.graphics().setDepth(this.ctx.depth + 4); this.objs.push(teeth); for (let x = 0; x < COLS * CELL; x += 4) teeth.fillStyle(x % 8 ? PAL.gray1 : PAL.gray2).fillRect(this.ox + x, y - 2, 3, 4);
    s.tweens.add({ targets: slider, x: this.ox + COLS * CELL, duration: 500, ease: 'Sine.InOut', onComplete: () => { slider.destroy(); s.tweens.add({ targets: teeth, alpha: 0, duration: 200, onComplete: () => teeth.destroy() }); } });
  }
  private closeCase() {
    this.ended = true; this.render(); const holes = this.holes(); const bonus = Math.round(30 * Math.max(0, 1 - holes / 12)); const score = clamp(70 + bonus - Math.max(0, this.t - 75) * 0.3, 55, 100);
    const s = this.ctx.scene; const lid = s.add.rectangle(this.ox + COLS * CELL / 2, this.oy - ROWS * CELL, COLS * CELL + 8, ROWS * CELL, this.ctx.palette[2]).setStrokeStyle(2, PAL.ink).setDepth(this.ctx.depth + 6).setOrigin(0.5, 0); this.objs.push(lid);   // the lid swings down
    this.ctx.sfx('confirm'); s.tweens.add({ targets: lid, y: this.oy, duration: 450, ease: 'Bounce.Out', onComplete: () => { this.ctx.shake(160, 0.006); this.ctx.sfx('stamp'); this.toast(`PACKED! tidiness +${bonus} (${holes} hole${holes === 1 ? '' : 's'})`, PAL.sun2, 1400); s.time.delayedCall(1500, () => this.done({ score, perfect: score >= 99, detail: `TIDINESS +${bonus} · ${holes} hole${holes === 1 ? '' : 's'}` })); } });
  }
  private topOut() { if (this.ended) return; this.ended = true; this.ctx.shake(200, 0.01); this.ctx.sfx('lose'); this.render(); this.toast("won't close: overpacked", PAL.red, 900); this.ctx.scene.time.delayedCall(700, () => this.done({ score: (this.lines / GOAL) * 60, failed: true, detail: `${this.lines} of ${GOAL} lines` })); }

  // ---- fx
  private toast(msg: string, color: number, ms = 800) { const s = this.ctx.scene; const t = s.add.text(this.ox + COLS * CELL / 2, this.oy + 30, msg, { fontFamily: 'monospace', fontSize: '11px', color: '#' + color.toString(16).padStart(6, '0'), backgroundColor: '#0b0f1acc', padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(this.ctx.depth + 7); this.objs.push(t); s.tweens.add({ targets: t, y: this.oy + 16, alpha: 0, duration: ms, delay: ms * 0.5, onComplete: () => t.destroy() }); }
  private burst(x: number, y: number, colors: number[], n: number, spread: number) { const s = this.ctx.scene; const cx = this.ox + x * CELL + CELL / 2, cy = this.oy + y * CELL + CELL / 2; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + this.ctx.rng(); const r = s.add.rectangle(cx, cy, 3, 3, colors[i % colors.length]).setDepth(this.ctx.depth + 6); this.objs.push(r); s.tweens.add({ targets: r, x: cx + Math.cos(a) * spread, y: cy + Math.sin(a) * spread + 10, alpha: 0, angle: 180, duration: 350 + this.ctx.rng() * 200, onComplete: () => r.destroy() }); } }
  private shards(x: number, y: number) { this.burst(x, y, [PAL.grass3, PAL.white, PAL.red], 6, 22); }
  private sparks(x: number, y: number) { this.burst(x, y, [PAL.sun2, PAL.white, PAL.sun3], 4, 26); }

  // ---- drawing: each cell is a slice of its luggage item
  private block(x: number, y: number, cell: Cell, ghost = false) {
    const g = this.g; const px = this.ox + x * CELL, py = this.oy + y * CELL; const col = cell.f ? PAL.sky3 : cell.b ? PAL.sun2 : COLORS[cell.k];
    if (ghost) { g.lineStyle(1, col, 0.5).strokeRect(px + 2, py + 2, CELL - 4, CELL - 4); return; }
    if (cell.f) {   // glass: pale translucent fill, white highlight edge, a small shine
      g.fillStyle(PAL.ink).fillRect(px, py, CELL, CELL); g.fillStyle(PAL.night0).fillRect(px + 1, py + 1, CELL - 2, CELL - 2); g.fillStyle(PAL.sky3, 0.45).fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      g.fillStyle(PAL.white, 0.9).fillRect(px + 1, py + 1, CELL - 2, 1).fillRect(px + 1, py + 1, 1, CELL - 2); g.fillStyle(PAL.white).fillRect(px + 3, py + 3, 3, 2).fillRect(px + 3, py + 5, 2, 1); g.fillStyle(PAL.white, 0.35).fillRect(px + CELL - 4, py + CELL - 6, 1, 3); return; }
    g.fillStyle(PAL.ink).fillRect(px, py, CELL, CELL); g.fillStyle(col).fillRect(px + 1, py + 1, CELL - 2, CELL - 2); g.fillStyle(PAL.white, 0.25).fillRect(px + 2, py + 2, CELL - 4, 2); g.fillStyle(PAL.ink, 0.35).fillRect(px + 2, py + CELL - 4, CELL - 4, 2); g.fillStyle(PAL.ink, 0.5).fillRect(px + 6, py + 7, 4, 2);
    if (cell.b) g.fillStyle(PAL.ink).fillRect(px + 8, py + 3, 3, 5).fillRect(px + 5, py + 7, 6, 2).fillRect(px + 6, py + 9, 3, 5);   // lightning bolt
  }
  private render() {
    const g = this.g; g.clear(); g.fillStyle(PAL.ink).fillRect(this.ox - 2, this.oy - 2, COLS * CELL + 4, ROWS * CELL + 4); g.fillStyle(PAL.night0).fillRect(this.ox, this.oy, COLS * CELL, ROWS * CELL);
    g.lineStyle(1, PAL.night2, 0.6); for (let x = 1; x < COLS; x++) g.lineBetween(this.ox + x * CELL, this.oy, this.ox + x * CELL, this.oy + ROWS * CELL);
    // lid line
    const ly = this.oy + LID * CELL; const lidCol = this.lines >= GOAL && !this.underLid() ? PAL.red : PAL.sun1; for (let x = 0; x < COLS * CELL; x += 6) g.fillStyle(lidCol, 0.8).fillRect(this.ox + x, ly - 1, 3, 1);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const c = this.grid[y][x]; if (c) this.block(x, y, c); }
    const c = this.cur; const cell: Cell = { k: c.k, f: c.f, b: c.b };
    if (!this.ended) { let gy = c.y; while (!this.collides(c.x, gy + 1, c.r)) gy++; for (const [x, y] of this.cells(c.k, c.r, c.x, gy)) if (y >= 0) this.block(x, y, cell, true); }
    for (const [x, y] of this.cells(c.k, c.r, c.x, c.y)) if (y >= 0) this.block(x, y, cell);
    // next preview
    const nx = this.ox + COLS * CELL + 16, ny = this.oy + 20; g.fillStyle(PAL.night0).fillRect(nx - 2, ny - 2, 4 * 10 + 4, 4 * 10 + 4); const ncol = this.next.f ? PAL.sky3 : this.next.b ? PAL.sun2 : COLORS[this.next.k];
    for (const [x, y] of SHAPES[this.next.k][0]) { const qx = nx + x * 10, qy = ny + y * 10; g.fillStyle(PAL.ink).fillRect(qx, qy, 10, 10); if (this.next.f) { g.fillStyle(PAL.night0).fillRect(qx + 1, qy + 1, 8, 8); g.fillStyle(PAL.sky3, 0.45).fillRect(qx + 1, qy + 1, 8, 8); g.fillStyle(PAL.white, 0.9).fillRect(qx + 1, qy + 1, 8, 1).fillRect(qx + 1, qy + 1, 1, 8); g.fillStyle(PAL.white).fillRect(qx + 3, qy + 3, 2, 1); } else g.fillStyle(ncol).fillRect(qx + 1, qy + 1, 8, 8); }
  }
  scoreNow() { return (this.lines / GOAL) * 70; }
  destroy() { const kill = (o?: { destroy: () => void }) => { try { if (o && (o as any).scene) o.destroy(); } catch { /* gone */ } }; this.objs.forEach(kill); }
}
