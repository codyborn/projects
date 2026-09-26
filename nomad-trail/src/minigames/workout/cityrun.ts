// CITY RUN (round 10): a top-down street runner for dense cities. FIVE lanes (columns) drawn as squares on the street; the runner
// snaps one lane per press. Traffic, pedestrians and street furniture come down the street one lane at a time, each telegraphed by a
// blinking "!" on the far kerb half a second before it enters. UP jumps low stuff (bags, cones), DOWN ducks under shop signs, LEFT/RIGHT
// change lane; anything else (cabs, cyclists, pedestrians) must be sidestepped. Controls: the console's D-pad (Pad from console/input.ts,
// read-only) at the bottom, swipes on the street, arrow keys. 25 s; a hit costs 0.9 s of invulnerability, three hits end the run.
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';
import { Pad, type PadKey, type PadLayout } from '../console/input';

type ObKind = 'cab' | 'bike' | 'ped' | 'bag' | 'cone' | 'sign';
interface Ob { kind: ObKind; col: number; y: number; h: number; hit?: boolean; passed?: boolean; threat?: boolean; }
interface Warn { kind: ObKind; col: number; t: number; }
const COLS = 5, COL_W = 56, COL0 = W / 2 - 2 * COL_W;             // lane centres 68, 124, 180, 236, 292
const TOP = 62, STREET_BOTTOM = 432, RUNNER_Y = 396;               // the street; the runner sits on the second-to-last row
const LOW = new Set<ObKind>(['bag', 'cone']), HIGH = new Set<ObKind>(['sign']);
const WARN_SEC = 0.5, SCROLL = 150, RAMP_AT = 20, ACT_SEC = 0.45;
const LAYOUT: PadLayout = { dpad: { x: W / 2, y: 540, r: 64 }, a: { x: -200, y: -200, r: 0 }, b: { x: -200, y: -200, r: 0 }, start: new Phaser.Geom.Rectangle(-1, -1, 0, 0), select: new Phaser.Geom.Rectangle(-1, -1, 0, 0), screen: new Phaser.Geom.Rectangle(0, TOP, W, STREET_BOTTOM - TOP) };

export class CityRun extends Micro {
  readonly id = 'cityrun'; readonly word = META.cityrun.word; readonly instr = META.cityrun.instr; readonly durationSec = META.cityrun.durationSec;
  private col = 2; private rx = W / 2; private obs: Ob[] = []; private warns: Warn[] = []; private next = 1.2; private jumpT = 0; private duckT = 0; private lock = 0;
  private hits = 0; private dodged = 0; private inv = 0; private scroll = 0; private pad?: Pad; private padG?: Phaser.GameObjects.Graphics; private lastPad = ''; private ended = false;
  private handlers: Array<[string, (...a: any[]) => void]> = []; private sd?: { x: number; y: number };
  private colX(c: number) { return COL0 + c * COL_W; }
  private speed() { return SCROLL * (this.t < RAMP_AT ? 1 : 1 + Math.min(0.4, (this.t - RAMP_AT) * 0.05)); }
  private interval() { return Math.max(0.85, 1.4 - 0.02 * this.t); }
  /** harness: the lane, what is coming (dy = px until it reaches the runner), the telegraphs, and what the runner is doing */
  hint() { return { col: this.col, obs: this.obs.filter(o => !o.hit && !o.passed).map(o => ({ col: o.col, kind: o.kind, dy: RUNNER_Y - o.y, low: LOW.has(o.kind), high: HIGH.has(o.kind) })), warns: this.warns.map(w => ({ col: w.col, kind: w.kind })), jumping: this.jumpT > 0, ducking: this.duckT > 0, hits: this.hits, dodged: this.dodged, t: this.t }; }
  /** one discrete action: a lane step or an instant jump / duck */
  act(k: 'left' | 'right' | 'up' | 'down') {
    if (this.ended) return;
    if (k === 'left' || k === 'right') { if (this.lock > 0) return; this.lock = 0.12; this.col = clamp(this.col + (k === 'left' ? -1 : 1), 0, COLS - 1); this.ctx.athlete.pose(3); this.after(100, () => { if (this.jumpT <= 0 && this.duckT <= 0) this.ctx.athlete.pose(0); }); }
    else if (k === 'up') { if (this.jumpT > 0 || this.duckT > 0) return; this.jumpT = ACT_SEC; this.ctx.athlete.pose(2); }
    else { if (this.jumpT > 0 || this.duckT > 0) return; this.duckT = ACT_SEC; this.ctx.athlete.pose(1); }
  }
  protected begin() {
    const rng = this.ctx.rng; const sc = this.ctx.scene; const ath = this.ctx.athlete; this.rx = this.colX(this.col);
    ath.at(this.rx, RUNNER_Y).pose(0).show(true); ath.sprite.setDepth(6).setScale(0.4);   // the athlete texture is 4x (48 x 64); 0.4 -> ~19 x 26 px
    // the D-pad: the console's Pad, read per frame; drawn here in the console's style
    this.pad = new Pad(sc, LAYOUT); this.padG = this.add(sc.add.graphics().setDepth(7)); this.drawPad();
    this.label(W / 2, 466, 'JUMP', 8, PAL.gray1); this.label(W / 2, 616, 'DUCK', 8, PAL.gray1); this.label(W / 2 - 96, 540, 'LANE', 8, PAL.gray1); this.label(W / 2 + 96, 540, 'LANE', 8, PAL.gray1);
    // swipes on the street as an alternative: left / right / down here (the Pad already turns a swipe UP into a jump pulse)
    const down = (p: Phaser.Input.Pointer) => { this.sd = p.y < STREET_BOTTOM ? { x: p.x, y: p.y } : undefined; };
    const up = (p: Phaser.Input.Pointer) => { const s = this.sd; this.sd = undefined; if (!s) return; const dx = p.x - s.x, dy = p.y - s.y; if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return; if (Math.abs(dx) >= Math.abs(dy)) this.act(dx < 0 ? 'left' : 'right'); else if (dy > 0) this.act('down'); };
    sc.input.on('pointerdown', down); sc.input.on('pointerup', up); this.handlers.push(['pointerdown', down], ['pointerup', up]);
    this.loop(dt => {
      if (this.ended) return; const v = this.speed(); this.scroll = (this.scroll + v * dt) % COL_W;
      this.pad!.update(); for (const k of ['left', 'right', 'up', 'down'] as const) if (this.pad!.justPressed(k)) this.act(k); if (this.pad!.justPressed('a')) this.act('up');
      const sig = JSON.stringify(this.pad!.pressed); if (sig !== this.lastPad) { this.lastPad = sig; this.drawPad(); }
      if (this.lock > 0) this.lock -= dt; if (this.inv > 0) this.inv -= dt;
      if (this.jumpT > 0) { this.jumpT -= dt; if (this.jumpT <= 0) ath.pose(0); } if (this.duckT > 0) { this.duckT -= dt; if (this.duckT <= 0) ath.pose(0); }
      // waves: a telegraph on the far kerb, then the obstacle enters that lane. One lane at a time; a second obstacle (after 15 s, sometimes)
      // is never in the runner's reach set when the first is, so a clear lane is always one move away.
      if (this.t >= this.next) { this.next = this.t + this.interval(); const kinds: ObKind[] = ['cab', 'cab', 'bike', 'bike', 'ped', 'bag', 'bag', 'cone', 'sign', 'sign']; const c1 = Math.floor(rng() * COLS); this.warns.push({ kind: kinds[Math.floor(rng() * kinds.length)], col: c1, t: WARN_SEC });
        if (this.t > 15 && rng() < 0.35) { const reach = (c: number) => Math.abs(c - this.col) <= 1; const opts = [0, 1, 2, 3, 4].filter(c => Math.abs(c - c1) >= 2 && !(reach(c1) && reach(c))); if (opts.length) this.warns.push({ kind: kinds[Math.floor(rng() * kinds.length)], col: opts[Math.floor(rng() * opts.length)], t: WARN_SEC }); } }
      for (const w of this.warns) { w.t -= dt; if (w.t <= 0) this.obs.push({ kind: w.kind, col: w.col, y: TOP - 30, h: w.kind === 'cab' ? 48 : w.kind === 'bike' ? 34 : w.kind === 'sign' ? 14 : 18 }); } this.warns = this.warns.filter(w => w.t > 0);
      // motion + collisions
      const tx = this.colX(this.col); this.rx += (tx - this.rx) * Math.min(1, dt * 22);
      for (const o of this.obs) { o.y += v * dt;
        if (!o.threat && o.col === this.col && o.y > RUNNER_Y - 150 && o.y < RUNNER_Y - 90) o.threat = true;   // it was coming at the runner: dodging it counts
        if (!o.hit && !o.passed && o.col === this.col && Math.abs(o.y - RUNNER_Y) < o.h / 2 + 10) {
          if ((LOW.has(o.kind) && this.jumpT > 0) || (HIGH.has(o.kind) && this.duckT > 0)) { o.passed = true; this.dodged++; this.pop(this.rx, RUNNER_Y - 40, LOW.has(o.kind) ? 'HOP' : 'DUCK'); }
          else if (this.inv <= 0) { o.hit = true; this.hits++; this.inv = 0.9; this.ctx.frame.shake(160, 0.007); this.pop(this.rx, RUNNER_Y - 40, o.kind === 'bike' ? 'CYCLIST!' : o.kind === 'cab' ? 'CAB!' : o.kind === 'ped' ? 'SORRY!' : o.kind === 'sign' ? 'SIGN!' : 'OOF', PAL.red); if (this.hits >= 3) { this.ended = true; this.after(350, () => this.finish(this.scoreNow())); } } }
        if (!o.hit && !o.passed && o.y > RUNNER_Y + o.h / 2 + 12) { o.passed = true; if (o.threat) this.dodged++; } }
      this.obs = this.obs.filter(o => o.y < STREET_BOTTOM + 60);
      // the runner: jump lifts and grows the sprite over a shadow left on the ground; duck crouches and shrinks
      const air = this.jumpT > 0 ? Math.sin((1 - this.jumpT / ACT_SEC) * Math.PI) : 0; ath.at(this.rx, RUNNER_Y - air * 18); ath.sprite.setScale(this.duckT > 0 ? 0.34 : 0.4 + air * 0.16).setAlpha(this.inv > 0 && Math.floor(this.t * 12) % 2 ? 0.4 : 1);
      this.draw(air); this.ctx.frame.setProgress(`${this.dodged} dodged · ${this.hits} hit`); if (this.t >= this.durationSec) { this.ended = true; this.finish(this.scoreNow()); } });
    this.ctx.frame.setProgress('0 dodged · 0 hit');
  }
  private draw(air: number) {
    const g = this.g; g.clear(); g.fillStyle(PAL.night2).fillRect(0, 26, W, 614);
    // kerbs and the street
    g.fillStyle(PAL.gray1).fillRect(0, TOP - 30, W, 30); g.fillStyle(PAL.gray1).fillRect(0, STREET_BOTTOM, W, 26); g.fillStyle(PAL.gray0).fillRect(0, TOP - 3, W, 3); g.fillStyle(PAL.gray0).fillRect(0, STREET_BOTTOM, W, 3);
    for (let x = 0; x < W; x += 24) { g.fillStyle(PAL.gray2, 0.4).fillRect(x, TOP - 30, 1, 30); g.fillStyle(PAL.gray2, 0.4).fillRect(x, STREET_BOTTOM, 1, 26); }
    g.fillStyle(PAL.gray0).fillRect(0, TOP, W, STREET_BOTTOM - TOP); g.fillStyle(PAL.gray1, 0.5).fillRect(0, TOP, COL0 - COL_W / 2, STREET_BOTTOM - TOP).fillRect(COL0 + (COLS - 0.5) * COL_W, TOP, W, STREET_BOTTOM - TOP);   // parked-car verges beyond the five lanes
    // the squares: faint lane lines and scrolling row lines; the runner's lane glows a little
    for (let c = 0; c <= COLS; c++) g.fillStyle(PAL.gray2, 0.22).fillRect(COL0 - COL_W / 2 + c * COL_W, TOP, 1, STREET_BOTTOM - TOP);
    for (let y = TOP + this.scroll; y < STREET_BOTTOM; y += COL_W) g.fillStyle(PAL.gray2, 0.14).fillRect(COL0 - COL_W / 2, y, COLS * COL_W, 1);
    g.fillStyle(PAL.white, 0.05).fillRect(this.colX(this.col) - COL_W / 2 + 1, TOP, COL_W - 2, STREET_BOTTOM - TOP);
    // telegraphs: a blinking "!" on the far kerb over the lane the next hazard enters, and a faint tint down that lane
    for (const w of this.warns) { const x = this.colX(w.col); const on = Math.floor(this.t * 8) % 2 === 0; g.fillStyle(PAL.sun2, 0.08).fillRect(x - COL_W / 2 + 1, TOP, COL_W - 2, STREET_BOTTOM - TOP);
      g.fillStyle(PAL.ink).fillRect(x - 11, TOP - 27, 22, 22); g.fillStyle(on ? PAL.sun2 : PAL.sun0).fillRect(x - 9, TOP - 25, 18, 18); g.fillStyle(PAL.ink).fillRect(x - 2, TOP - 22, 4, 8).fillRect(x - 2, TOP - 12, 4, 3); }
    // hazards, top-down, heading down the street toward the runner
    for (const o of this.obs) { const x = this.colX(o.col), y = o.y; const a = o.hit ? 0.35 : 1;
      switch (o.kind) {
        case 'cab': g.fillStyle(PAL.ink, a).fillRect(x - 21, y - 25, 42, 50); g.fillStyle(PAL.sun2, a).fillRect(x - 20, y - 24, 40, 48); g.fillStyle(PAL.sky3, a).fillRect(x - 15, y + 6, 30, 10).fillRect(x - 15, y - 20, 30, 7); g.fillStyle(PAL.ink, a).fillRect(x - 8, y - 6, 16, 8); g.fillStyle(PAL.sun3, a).fillRect(x - 19, y + 19, 6, 4).fillRect(x + 13, y + 19, 6, 4); break;
        case 'bike': g.fillStyle(PAL.ink, a).fillRect(x - 3, y - 17, 6, 34); g.fillStyle(PAL.dusk2, a).fillRect(x - 2, y - 10, 4, 20); g.fillStyle(PAL.sun0, a).fillRect(x - 9, y - 4, 18, 8); g.fillStyle(PAL.earth3, a).fillCircle(x, y, 5); g.fillStyle(PAL.ink, a).fillRect(x - 12, y - 6, 4, 3).fillRect(x + 8, y - 6, 4, 3); break;
        case 'ped': { const bob = Math.sin(this.t * 9) * 2; g.fillStyle(PAL.ink, a).fillRect(x - 10, y - 6, 20, 12); g.fillStyle(PAL.dusk1, a).fillRect(x - 9, y - 5, 18, 10); g.fillStyle(PAL.earth3, a).fillCircle(x, y, 5); g.fillStyle(PAL.earth0, a).fillRect(x - 4, y - 5, 8, 4); g.fillStyle(PAL.ink, a).fillRect(x - 12 - bob, y - 2, 3, 4).fillRect(x + 9 + bob, y - 2, 3, 4); break; }
        case 'bag': g.fillStyle(PAL.ink, a).fillRect(x - 13, y - 10, 26, 20); g.fillStyle(PAL.red, a).fillRect(x - 12, y - 9, 24, 18); g.fillStyle(PAL.ink, a).fillRect(x - 6, y - 12, 12, 3); g.fillStyle(PAL.sun3, a).fillRect(x - 8, y - 4, 16, 2); break;
        case 'cone': g.fillStyle(PAL.ink, a).fillRect(x - 9, y - 9, 18, 18); g.fillStyle(PAL.sun0, a).fillRect(x - 8, y - 8, 16, 16); g.fillStyle(PAL.white, a).fillRect(x - 6, y - 6, 12, 12); g.fillStyle(PAL.sun0, a).fillRect(x - 4, y - 4, 8, 8); break;
        case 'sign': g.fillStyle(PAL.ink, 0.25 * a).fillRect(x - 24, y + 8, 48, 8); g.fillStyle(PAL.gray2, a).fillRect(x - 27, y - 8, 4, 16).fillRect(x + 23, y - 8, 4, 16); g.fillStyle(PAL.ink, a).fillRect(x - 25, y - 8, 50, 14); g.fillStyle(PAL.dusk2, a).fillRect(x - 24, y - 7, 48, 12); g.fillStyle(PAL.sun3, a).fillRect(x - 18, y - 3, 10, 4).fillRect(x - 5, y - 3, 14, 4).fillRect(x + 12, y - 3, 6, 4); break;
      } }
    g.fillStyle(PAL.ink, 0.35 * (1 - air * 0.5)).fillEllipse(this.rx, RUNNER_Y + 12, 22 * (1 - air * 0.4), 6 * (1 - air * 0.4));   // the runner's shadow stays on the ground while he jumps
    if ((window as any).__hitboxes) { g.lineStyle(1, PAL.neon, 1); g.strokeRect(this.rx - 8, RUNNER_Y - 10, 16, 20); g.lineStyle(1, PAL.red, 1); for (const o of this.obs) g.strokeRect(this.colX(o.col) - 20, o.y - o.h / 2, 40, o.h); }
  }
  /** The D-pad in the console's style (CarryOnScene.drawPad): a cross with lit arms, a hub dot, four arrows. */
  private drawPad() {
    const g = this.padG; if (!g) return; g.clear(); const p = this.pad?.pressed; const L = LAYOUT.dpad; const arm = 40, len = 120;
    g.fillStyle(PAL.night1).fillRect(0, STREET_BOTTOM + 26, W, 640 - STREET_BOTTOM - 26); g.fillStyle(PAL.night3).fillRect(0, STREET_BOTTOM + 26, W, 2);
    const lit = (k: PadKey) => (p && p[k]) ? PAL.gray2 : PAL.night0;
    g.fillStyle(PAL.ink).fillRoundedRect(L.x - len / 2 - 2, L.y - arm / 2 - 2, len + 4, arm + 4, 6).fillRoundedRect(L.x - arm / 2 - 2, L.y - len / 2 - 2, arm + 4, len + 4, 6);
    g.fillStyle(lit('left')).fillRect(L.x - len / 2, L.y - arm / 2, len / 2 - arm / 2, arm); g.fillStyle(lit('right')).fillRect(L.x + arm / 2, L.y - arm / 2, len / 2 - arm / 2, arm);
    g.fillStyle(lit('up')).fillRect(L.x - arm / 2, L.y - len / 2, arm, len / 2 - arm / 2); g.fillStyle(lit('down')).fillRect(L.x - arm / 2, L.y + arm / 2, arm, len / 2 - arm / 2);
    g.fillStyle(PAL.night1).fillRect(L.x - arm / 2, L.y - arm / 2, arm, arm); g.fillStyle(PAL.gray1, 0.6).fillCircle(L.x, L.y, 5);
    g.fillStyle(PAL.gray1, 0.9); g.fillTriangle(L.x - 46, L.y, L.x - 32, L.y - 9, L.x - 32, L.y + 9); g.fillTriangle(L.x + 46, L.y, L.x + 32, L.y - 9, L.x + 32, L.y + 9);
    g.fillTriangle(L.x, L.y - 46, L.x - 9, L.y - 32, L.x + 9, L.y - 32); g.fillTriangle(L.x, L.y + 46, L.x - 9, L.y + 32, L.x + 9, L.y + 32);
  }
  protected scoreNow() { const base = clamp((this.dodged - this.hits) / Math.max(5, this.dodged + this.hits), 0, 1); return this.hits >= 3 ? base * clamp(this.t / this.durationSec, 0, 1) : base; }
  destroy() { const inp = this.ctx.scene.input; for (const [ev, fn] of this.handlers) inp.off(ev, fn); this.handlers = []; this.pad?.destroy(); this.pad = undefined; this.ctx.athlete.sprite.setAlpha(1).setDepth(5).setScale(1); this.ctx.athlete.pose(0); super.destroy(); }
}
