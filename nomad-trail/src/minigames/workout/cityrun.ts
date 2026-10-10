// CITY RUN (round 10, Frogger): top-down street crossing on a 9 x 9 grid of 40 px tiles. Start on the bottom kerb, hop one tile per
// tap, cross three lanes of traffic, rest on the median, cross three more, reach the coffee shop on
// the far kerb. Cabs, buses, cyclists, scooters (and a tram in Lisbon / Amsterdam) scroll left or right at their own speeds. Nothing is
// telegraphed: it is Frogger. A hit costs a life and puts you back on the kerb; 3 lives. One crossing wins it (round 12: three crossings
// plus a per-crossing clock made it the hardest thing in the game, and the session timer is limit enough). Score = 70 for the coffee plus
// 10 a life left, so an untouched crossing is 100. READY card and result flow as usual.
// Round 102: the drawn D-pad is gone and the WHOLE SCREEN is the pad. A tap is read against the runner's own position —
// above them hops up, below hops down, to either side hops sideways — so your thumb never has to find a widget and can
// stay out of the lane you are watching. Arrow keys still work.
import Phaser from 'phaser';
import { Audio } from '../../audio/synth';
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

type Kind = 'cab' | 'bus' | 'bike' | 'scooter' | 'tram';
interface Car { x: number; w: number; color: number; }
interface Lane { row: number; kind: Kind; dir: 1 | -1; speed: number; cars: Car[]; gap: number; }
const TILE = 40, COLS = 9, ROWS = 9, Y0 = 148;   /* the board sits in the middle of the screen now that the D-pad widget has gone: the space it used to fill is the space your thumb taps in */                    // row r centre = Y0 + r*TILE + 20; rows 0 far kerb, 1-3 lanes, 4 median, 5-7 lanes, 8 start kerb
const START = { row: 8, col: 4 }; const LANE_ROWS = [1, 2, 3, 5, 6, 7];
const TRAM_CITIES = new Set(['lisbon', 'amsterdam']);
const cx = (c: number) => 20 + c * TILE, cy = (r: number) => Y0 + r * TILE + 20;

export class CityRun extends Micro {
  readonly id = 'cityrun'; readonly word = META.cityrun.word; readonly instr = META.cityrun.instr; readonly durationSec = META.cityrun.durationSec;
  private row = START.row; private col = START.col; private px = cx(START.col); private py = cy(START.row); private hopT = 0; private lanes: Lane[] = [];
  private lives = 3; private crossings = 0; private inv = 0; private busy = false; private ended = false; private mult = 1;
  private handlers: Array<[string, (...a: any[]) => void]> = []; private guide = 2.6;   /* seconds the four arrows stay up around the runner, long enough to read once */
  /** harness: the grid state and every vehicle */
  hint() { return { row: this.row, col: this.col, lives: this.lives, crossings: this.crossings, hopping: this.hopT > 0 || this.busy, t: this.t, lanes: this.lanes.map(L => ({ row: L.row, dir: L.dir, speed: L.speed * this.mult, cars: L.cars.map(c => ({ x: c.x, w: c.w })) })) }; }
  /** one hop */
  act(k: 'left' | 'right' | 'up' | 'down') {
    if (this.ended || this.busy || this.hopT > 0) return;
    const r = this.row + (k === 'up' ? -1 : k === 'down' ? 1 : 0), c = this.col + (k === 'left' ? -1 : k === 'right' ? 1 : 0);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    this.row = r; this.col = c; this.hopT = 0.12; this.ctx.athlete.pose(2); this.ctx.athlete.sprite.setFlipX(k === 'left');
    if (this.row === 0) this.arrive();
  }
  private arrive() {
    this.crossings++; this.busy = true; Audio.playSfx('coin'); this.pop(cx(this.col), cy(0) - 24, 'COFFEE!', PAL.sun2); this.ctx.frame.pulse(PAL.sun2, 300); this.progress();
    this.ended = true; this.after(600, () => this.finish(this.scoreNow()));
  }
  private lose(why: string) {
    if (this.ended) return; this.lives--; this.inv = 1.0; this.busy = true; Audio.playSfx('hurt'); this.ctx.frame.shake(160, 0.007); this.pop(this.px, this.py - 30, why, PAL.red); this.progress();
    if (this.lives <= 0) { this.ended = true; this.after(400, () => this.finish(this.scoreNow())); return; }
    this.after(450, () => this.respawn());
  }
  private respawn() { this.row = START.row; this.col = START.col; this.px = cx(this.col); this.py = cy(this.row); this.hopT = 0; this.busy = false; this.ctx.athlete.pose(0); }
  private progress() { this.ctx.frame.setProgress(`${'♥'.repeat(this.lives)}${'·'.repeat(3 - this.lives)}  coffee ${this.crossings}/1`); }
  protected begin() {
    const rng = this.ctx.rng; const sc = this.ctx.scene; const ath = this.ctx.athlete; const tram = TRAM_CITIES.has((this.ctx.city || '').toLowerCase());
    const kinds: Kind[] = ['cab', tram ? 'tram' : 'bus', 'bike', 'scooter', 'cab', 'bus'];
    this.lanes = LANE_ROWS.map((row, i) => { const kind = kinds[i]; const dir: 1 | -1 = i % 2 ? -1 : 1; const base = kind === 'bike' ? 70 : kind === 'scooter' ? 90 : kind === 'cab' ? 80 : kind === 'bus' ? 50 : 60;
      return { row, kind, dir, speed: base * (0.9 + rng() * 0.2), cars: [], gap: (kind === 'bus' || kind === 'tram' ? 3.4 : kind === 'cab' ? 2.6 : 2.2) * TILE }; });   // fair gaps: at least 2.2 tiles of road between vehicles
    for (const L of this.lanes) { let x = -80 + rng() * 60; while (x < W + 80) { const c = this.mk(L); c.x = x; L.cars.push(c); x += c.w + L.gap * (1 + rng() * 0.6); } }
    ath.at(this.px, this.py).pose(0).show(true); ath.sprite.setDepth(6).setScale(0.4); this.progress(); this.ctx.frame.setHint('TAP a side to hop · coffee');
    /* the whole screen is the D-pad: the tap is read against where the runner is standing, so the quadrant you mean is
       the quadrant you point at. A tap right on top of them is ignored rather than guessed at. */
    const down = (p: Phaser.Input.Pointer) => { const dx = p.x - this.px, dy = p.y - this.py;
      if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
      this.guide = 0; this.act(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down')); };
    sc.input.on('pointerdown', down); this.handlers.push(['pointerdown', down]);
    this.key('keydown-LEFT', () => this.act('left')); this.key('keydown-RIGHT', () => this.act('right'));
    this.key('keydown-UP', () => this.act('up')); this.key('keydown-DOWN', () => this.act('down'));
    this.key('keydown-SPACE', () => this.act('up'));
    this.loop(dt => {
      if (this.ended) return;
      if (this.guide > 0) this.guide -= dt;
      if (this.inv > 0) this.inv -= dt; if (this.hopT > 0) { this.hopT -= dt; if (this.hopT <= 0 && !this.busy) ath.pose(0); }
      // traffic
      for (const L of this.lanes) { const v = L.speed * this.mult * L.dir; for (const c of L.cars) c.x += v * dt; L.cars = L.cars.filter(c => c.x > -260 && c.x < W + 260);
        const edge = L.dir > 0 ? Math.min(...L.cars.map(c => c.x), 1e9) : Math.max(...L.cars.map(c => c.x + c.w), -1e9); const room = L.dir > 0 ? edge : W - edge;
        if (room > L.gap * (1 + rng() * 0.6)) { const c = this.mk(L); c.x = L.dir > 0 ? -c.w - 4 : W + 4; L.cars.push(c); } }
      // the runner slides to its tile; a hit while on a lane tile (tight box: 10 px either side of the tile centre)
      const tx = cx(this.col), ty = cy(this.row); this.px += (tx - this.px) * Math.min(1, dt * 20); this.py += (ty - this.py) * Math.min(1, dt * 20);
      const L = this.lanes.find(l => l.row === this.row);
      if (L && !this.busy && this.inv <= 0) for (const c of L.cars) if (c.x < this.px + 10 && c.x + c.w > this.px - 10) { this.lose(L.kind === 'bike' ? 'CYCLIST!' : L.kind === 'tram' ? 'TRAM!' : L.kind === 'bus' ? 'BUS!' : L.kind === 'scooter' ? 'SCOOTER!' : 'CAB!'); break; }
      const hop = this.hopT > 0 ? Math.sin((this.hopT / 0.12) * Math.PI) : 0; ath.at(this.px, this.py - hop * 8); ath.sprite.setScale(0.4 + hop * 0.08).setAlpha(this.inv > 0 && Math.floor(this.t * 12) % 2 ? 0.4 : 1);
      this.draw(); if (this.t >= this.durationSec) { this.ended = true; this.finish(this.scoreNow()); } });
  }
  private mk(L: Lane): Car { const rng = this.ctx.rng; const k = L.kind; const w = k === 'tram' ? 140 : k === 'bus' ? 100 : k === 'cab' ? 52 : k === 'scooter' ? 28 : 24; const color = k === 'cab' ? (rng() < 0.75 ? PAL.sun2 : PAL.gray2) : k === 'bus' ? PAL.sky0 : k === 'tram' ? PAL.sun0 : k === 'scooter' ? PAL.dusk3 : PAL.dusk2; return { x: 0, w, color }; }
  private draw() {
    const g = this.g; g.clear(); g.fillStyle(PAL.night2).fillRect(0, 26, W, 614); const road = (r: number) => g.fillStyle(PAL.gray0).fillRect(0, cy(r) - 20, W, TILE);
    // kerbs (far kerb with the coffee shop; start kerb), the median, the roads
    g.fillStyle(PAL.gray1).fillRect(0, cy(0) - 20, W, TILE).fillRect(0, cy(8) - 20, W, TILE); for (let x = 0; x < W; x += 20) g.fillStyle(PAL.gray2, 0.35).fillRect(x, cy(0) - 20, 1, TILE).fillRect(x, cy(8) - 20, 1, TILE);
    for (const r of LANE_ROWS) road(r); g.fillStyle(PAL.gray1).fillRect(0, cy(4) - 20, W, TILE); g.fillStyle(PAL.grass1).fillRect(0, cy(4) - 6, W, 12); for (let x = 12; x < W; x += 60) { g.fillStyle(PAL.earth1).fillRect(x - 2, cy(4) - 2, 4, 10); g.fillStyle(PAL.grass2).fillCircle(x, cy(4) - 6, 7); }
    for (const r of [1, 2, 5, 6]) for (let x = 0; x < W; x += 28) g.fillStyle(PAL.gray2, 0.6).fillRect(x, cy(r) + 19, 14, 2);   // dashes between lanes
    for (const L of this.lanes) if (L.kind === 'tram') { g.fillStyle(PAL.gray2, 0.8).fillRect(0, cy(L.row) - 10, W, 2).fillRect(0, cy(L.row) + 8, W, 2); } else if (L.kind === 'bike') g.fillStyle(PAL.grass0, 0.3).fillRect(0, cy(L.row) - 18, W, TILE - 4);
    // faint tile grid so the hops read as squares
    for (let c = 0; c <= COLS; c++) g.fillStyle(PAL.white, 0.06).fillRect(c * TILE, Y0, 1, ROWS * TILE); for (let r = 0; r <= ROWS; r++) g.fillStyle(PAL.white, 0.05).fillRect(0, Y0 + r * TILE, W, 1);
    g.fillStyle(PAL.white, 0.05).fillRect(cx(this.col) - 19, cy(this.row) - 19, 38, 38);
    // the coffee shop: awning over tiles 3-5, a door in the middle, a cup sign, tables either side
    { const x = cx(4), y = cy(0); g.fillStyle(PAL.earth1).fillRect(x - 62, y - 20, 124, 40); g.fillStyle(PAL.sky3, 0.8).fillRect(x - 54, y - 14, 30, 16).fillRect(x + 24, y - 14, 30, 16); g.fillStyle(PAL.earth0).fillRect(x - 16, y - 20, 32, 40); g.fillStyle(PAL.sun3).fillRect(x - 12, y - 16, 24, 30); g.fillStyle(PAL.ink).fillRect(x - 2, y - 14, 4, 26);
      for (let i = 0; i < 8; i++) g.fillStyle(i % 2 ? PAL.white : PAL.sun0).fillRect(x - 64 + i * 16, y - 22, 16, 8); g.fillStyle(PAL.ink).fillRect(x - 64, y - 14, 128, 2);
      g.fillStyle(PAL.ink).fillRect(x - 9, y - 34, 18, 12); g.fillStyle(PAL.white).fillRect(x - 7, y - 32, 12, 8); g.fillStyle(PAL.white).fillRect(x + 5, y - 30, 3, 4); g.fillStyle(PAL.gray2, 0.7).fillRect(x - 4, y - 40, 2, 5).fillRect(x + 1, y - 42, 2, 7); }
    // vehicles, top-down
    for (const L of this.lanes) for (const c of L.cars) { const y = cy(L.row); const x = c.x, w = c.w;
      if (L.kind === 'bike' || L.kind === 'scooter') { g.fillStyle(PAL.ink).fillRect(x, y - 3, w, 6); g.fillStyle(c.color).fillRect(x + 4, y - 6, w - 8, 12); g.fillStyle(PAL.earth3).fillCircle(x + w / 2, y, 5); g.fillStyle(PAL.ink).fillRect(x + (L.dir > 0 ? w - 4 : 0), y - 5, 4, 10); }
      else { g.fillStyle(PAL.ink).fillRect(x - 1, y - 15, w + 2, 30); g.fillStyle(c.color).fillRect(x, y - 14, w, 28); g.fillStyle(PAL.sky3, 0.9).fillRect(x + 8, y - 10, w - 16, 7); if (L.kind !== 'tram') g.fillStyle(PAL.sky3, 0.9).fillRect(x + (L.dir > 0 ? w - 14 : 6), y - 10, 8, 20); if (L.kind === 'tram') { for (let k = 14; k < w - 10; k += 22) g.fillStyle(PAL.sky3).fillRect(x + k, y + 2, 14, 8); g.fillStyle(PAL.ink).fillRect(x + w / 2 - 1, y - 20, 2, 8); }
        if (L.kind === 'cab' && c.color === PAL.sun2) g.fillStyle(PAL.ink).fillRect(x + w / 2 - 5, y - 3, 10, 6); g.fillStyle(L.dir > 0 ? PAL.sun3 : PAL.red).fillRect(L.dir > 0 ? x + w - 3 : x, y - 12, 3, 8).fillRect(L.dir > 0 ? x + w - 3 : x, y + 4, 3, 8); } }
    // the session clock under the grid: standing still costs nothing now, only the traffic can end it
    const f = clamp(1 - this.t / this.durationSec, 0, 1); g.fillStyle(PAL.ink).fillRect(40, Y0 + ROWS * TILE + 8, W - 80, 6); g.fillStyle(f > 0.3 ? PAL.neon : PAL.red).fillRect(40, Y0 + ROWS * TILE + 8, (W - 80) * f, 6);
    this.drawGuide();
    if ((window as any).__hitboxes) { g.lineStyle(1, PAL.neon, 1); g.strokeRect(this.px - 10, this.py - 12, 20, 24); g.lineStyle(1, PAL.red, 1); for (const L of this.lanes) for (const c of L.cars) g.strokeRect(c.x, cy(L.row) - 14, c.w, 28); }
  }
  /** The first seconds show where the taps are: four arrows around the runner, which fade once you have used one. */
  private drawGuide() {
    if (this.guide <= 0) return; const g = this.g; const a = clamp(this.guide / 2.6, 0, 1) * 0.75;
    const arrow = (dx: number, dy: number) => { const bx = this.px + dx, by = this.py + dy;
      g.fillStyle(PAL.white, a); g.fillTriangle(bx + dx * 0.22, by + dy * 0.22, bx - dy * 0.14 - dx * 0.1, by + dx * 0.14 - dy * 0.1, bx + dy * 0.14 - dx * 0.1, by - dx * 0.14 - dy * 0.1); };
    arrow(0, -52); arrow(0, 52); arrow(-52, 0); arrow(52, 0);
  }
  protected scoreNow() { return clamp((this.crossings ? 70 + this.lives * 10 : this.lives * 10) / 100, 0, 1); }
  destroy() { const inp = this.ctx.scene.input; for (const [ev, fn] of this.handlers) inp.off(ev, fn); this.handlers = []; this.ctx.athlete.sprite.setAlpha(1).setDepth(5).setScale(1).setFlipX(false); this.ctx.athlete.pose(0); super.destroy(); }
}
