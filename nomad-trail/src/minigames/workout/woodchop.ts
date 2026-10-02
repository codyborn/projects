/* WOOD CHOP (Bozeman): Cody chopped wood in Montana. Seen from above, looking down at the chopping block: the round of
   firewood is end-grain up with the splitting line marked across it, and the axe head circles the round on the end of a
   handle that runs down to the chopper at the bottom of the screen, sweeping through about ±40° of the line. SWIPE DOWN, tap or SPACE to chop when the head is over the line.
   Within ±6° = a clean split (the round opens along the line and the halves slide apart); ±6° to ±18° = glancing (the
   head bites across the grain and the round only cracks); beyond = a miss (the head skids off the edge, 0.6 s lost).
   Eight rounds; the sweep speeds up each round and after round 4 the period jitters so it cannot be pure rhythm. Split
   rounds stack into a woodpile beside the block. Score = clean × 100/8 + glancing × 40/8.
   (Round 100: this was drawn side-on with the axe swinging on a pivot above the block, which read as a guillotine.) */
import Phaser from 'phaser';
import { Audio } from '../../audio/synth';
import { PAL } from '../../core/palette';
import { W, clamp, txt } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

const ROUNDS = 8, ARC = 40, CLEAN = 6, GLANCE = 18;
/* everything is measured from the middle of the block, looking straight down at it */
const CX = W / 2, CY = 338, STUMP_R = 92, ROUND_R = 54, GUIDE_R = 74, HEAD_R = 66, HANDLE_R = 400;   /* long enough that the handle always leaves the bottom of the screen, whatever the angle */
const V = (pts: { x: number; y: number }[]) => pts.map(q => new Phaser.Math.Vector2(q.x, q.y));

export class WoodChop extends Micro {
  readonly id = 'woodchop'; readonly word = META.woodchop.word; readonly instr = META.woodchop.instr; readonly durationSec = META.woodchop.durationSec;
  private round = 0; private clean = 0; private glancing = 0; private misses = 0;
  private phase: 'swing' | 'anim' | 'done' = 'swing'; private ph = -Math.PI / 2;   /* each round starts with the axe at the far left, never straight down */ private omega = 0; private jitter = 1; private lastHalf = -1;
  private angle = 0; private stuckAngle = 0; private wobble = 0; private crack = false;
  private axeG!: Phaser.GameObjects.Graphics; private fx!: Phaser.GameObjects.Graphics; private pile: number[] = []; private halves: { x: number; y: number; vx: number; vy: number; rot: number }[] = [];
  private msg?: Phaser.GameObjects.Text;

  /** harness: the swing right now */
  hint() { return { phase: this.phase, round: this.round, angle: this.angle, absDeg: Math.abs(this.angle), dir: Math.sign(Math.cos(this.ph)), clean: this.clean, glancing: this.glancing, misses: this.misses, t: this.t }; }
  /** harness: chop now */
  chop() { this.onChop(); }

  protected begin() {
    const sc = this.ctx.scene;
    this.ctx.athlete.show(false);   /* a side-on figure has nowhere to stand in a view looking straight down */
    this.axeG = this.add(sc.add.graphics().setDepth(5)); this.fx = this.add(sc.add.graphics().setDepth(6));
    this.omega = (Math.PI * 2) / (1.7 / this.ctx.speed);   /* one full swing (left→right→left) per period; the period shrinks each round */
    this.onTap(() => this.onChop());
    this.onSwipe(d => { if (d === 'down') this.onChop(); });
    this.ctx.frame.setProgress(`0/${ROUNDS}`);
    this.loop(dt => this.tick(dt));
  }
  private period() { return (1.7 / this.ctx.speed) * Math.pow(0.9, this.round) * (0.85 + 0.15 * this.ctx.window); }
  private tick(dt: number) {
    if (this.phase === 'swing') {
      this.omega = (Math.PI * 2) / this.period() * this.jitter; this.ph += this.omega * dt; this.angle = ARC * Math.sin(this.ph);
      const half = Math.floor(this.ph / Math.PI); if (half !== this.lastHalf) { this.lastHalf = half; this.jitter = this.round >= 4 ? 0.86 + this.ctx.rng() * 0.3 : 1; }
    }
    /* falling halves */
    /* from above a split round slides off the block and comes to rest: no gravity, just friction */
    for (const h of this.halves) { h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vx * 0.06 * dt; h.vx *= Math.pow(0.12, dt); h.vy *= Math.pow(0.12, dt); }
    this.draw();
  }
  private onChop() {
    if (this.phase !== 'swing') return; const a = Math.abs(this.angle); this.phase = 'anim'; this.stuckAngle = this.angle;
    if (a <= CLEAN) { this.clean++; this.crack = false; this.burst(); Audio.playSfx('thunk'); this.ctx.frame.shake(110, 0.006); this.say('SPLIT!', PAL.neon);
      this.halves.push({ x: CX - 8, y: CY, vx: -150 - this.ctx.rng() * 60, vy: -30 + this.ctx.rng() * 60, rot: 0 }, { x: CX + 8, y: CY, vx: 150 + this.ctx.rng() * 60, vy: -30 + this.ctx.rng() * 60, rot: 0 });
      this.after(520, () => this.nextRound(true)); }
    else if (a <= GLANCE) { this.glancing++; this.crack = true; Audio.playSfx('crack'); this.ctx.frame.shake(70, 0.003); this.say('GLANCING', PAL.sun2); this.after(560, () => this.nextRound(false)); }
    else { this.misses++; this.crack = false; this.wobble = 1; Audio.playSfx('cancel'); this.ctx.frame.shake(60, 0.002); this.say('MISS', PAL.red); this.after(600 + 300, () => this.nextRound(false)); }
    this.ctx.frame.setProgress(`${this.round + 1}/${ROUNDS}`);
  }
  private nextRound(split: boolean) {
    if (split) { this.pile.push(this.pile.length); }
    this.halves = []; this.round++; this.crack = false; this.wobble = 0;
    if (this.round >= ROUNDS) { this.phase = 'done'; this.ctx.frame.setProgress('DONE'); this.after(450, () => this.finish(this.scoreNow())); return; }
    this.ph = -Math.PI / 2; this.lastHalf = Math.floor(this.ph / Math.PI); this.jitter = 1; this.phase = 'swing';
  }
  private say(s: string, color: number) { this.msg?.destroy(); this.msg = this.label(CX, 150, s, 14, color); const m = this.msg; this.ctx.scene.tweens.add({ targets: m, y: 128, alpha: 0, duration: 520, onComplete: () => m.destroy() }); }
  private burst() {
    const sc = this.ctx.scene; for (let i = 0; i < 10; i++) { const c = this.add(sc.add.rectangle(CX + (this.ctx.rng() - 0.5) * 14, CY + (this.ctx.rng() - 0.5) * 14, 3, 2, i % 3 ? PAL.sun3 : PAL.earth2).setDepth(7));
      sc.tweens.add({ targets: c, x: c.x + (this.ctx.rng() - 0.5) * 150, y: c.y + (this.ctx.rng() - 0.5) * 150, alpha: 0, angle: 180, duration: 380 + this.ctx.rng() * 200, ease: 'Quad.Out', onComplete: () => c.destroy() }); }
  }
  private draw() {
    const g = this.g; g.clear(); const ax = this.axeG; ax.clear(); const fx = this.fx; fx.clear();
    const R = Phaser.Math.DegToRad;
    /* the yard from above: grass, scattered chips and bark, the woodpile up at the top where the handle never sweeps */
    g.fillStyle(PAL.grass1).fillRect(0, 26, W, 614);
    for (let i = 0; i < 46; i++) { const x = (i * 97) % W, y = 40 + (i * 131) % 580; g.fillStyle(i % 3 ? PAL.grass2 : PAL.grass0, 0.6).fillRect(x, y, 3 + (i % 3), 2); }
    for (let i = 0; i < 10; i++) { const x = 30 + (i * 71) % (W - 60), y = 70 + (i * 157) % 520; g.fillStyle(PAL.earth2, 0.5).fillRect(x, y, 5, 3); }
    /* the woodpile: split rounds seen end-on, stacked in rows */
    this.pile.forEach((_, i) => { const row = Math.floor(i / 2), col = i % 2; const px = 34 + col * 26, py = 76 + row * 26;
      g.fillStyle(PAL.earth1).fillCircle(px, py, 11); g.fillStyle(PAL.earth2).fillCircle(px, py, 9);
      g.lineStyle(1, PAL.earth3, 0.7); g.strokeCircle(px, py, 5); g.strokeCircle(px, py, 8); });
    /* the chopping block: end grain with rings and a chewed-up top */
    g.fillStyle(PAL.ink, 0.25).fillCircle(CX + 4, CY + 5, STUMP_R);
    g.fillStyle(PAL.earth0).fillCircle(CX, CY, STUMP_R); g.fillStyle(PAL.earth1).fillCircle(CX, CY, STUMP_R - 4);
    g.lineStyle(1, PAL.earth0, 0.8); for (let r = 16; r < STUMP_R - 6; r += 13) g.strokeCircle(CX, CY, r);
    for (let i = 0; i < 14; i++) { const a = R(i * 26 + 7), rr = STUMP_R - 10 - (i % 4) * 9; g.fillStyle(PAL.earth0, 0.7).fillRect(CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 4, 3); }
    /* the guide ring: the whole sweep in ink, the glancing band amber, the splitting line green */
    fx.lineStyle(3, PAL.ink, 0.45); fx.beginPath(); fx.arc(CX, CY, GUIDE_R, R(90 - ARC), R(90 + ARC), false); fx.strokePath();
    fx.lineStyle(4, PAL.sun1, 0.55); fx.beginPath(); fx.arc(CX, CY, GUIDE_R, R(90 - GLANCE), R(90 - CLEAN), false); fx.strokePath();
    fx.beginPath(); fx.arc(CX, CY, GUIDE_R, R(90 + CLEAN), R(90 + GLANCE), false); fx.strokePath();
    fx.lineStyle(6, PAL.grass2, 0.9); fx.beginPath(); fx.arc(CX, CY, GUIDE_R, R(90 - CLEAN), R(90 + CLEAN), false); fx.strokePath();
    /* the round of firewood, end-grain up, with the splitting line across it */
    const split = this.halves.length > 0;
    if (!split && this.phase !== 'done') {
      g.fillStyle(PAL.earth2).fillCircle(CX, CY, ROUND_R); g.fillStyle(PAL.sun3).fillCircle(CX, CY, ROUND_R - 5);
      g.lineStyle(1, PAL.earth2, 0.8); for (let r = 10; r < ROUND_R - 8; r += 11) g.strokeCircle(CX, CY, r);
      g.fillStyle(PAL.earth2).fillCircle(CX, CY, 3);
      /* the line you are aiming at, dashed up and down the grain */
      g.fillStyle(this.crack ? PAL.ink : PAL.earth3, this.crack ? 1 : 0.8);
      for (let d = -ROUND_R + 6; d < ROUND_R - 6; d += 9) g.fillRect(CX - 1, CY + d, 2, 6);
      if (this.crack) { const ca = R(this.stuckAngle + 90); g.lineStyle(2, PAL.ink, 0.9).lineBetween(CX, CY, CX + Math.cos(ca) * (ROUND_R - 6), CY + Math.sin(ca) * (ROUND_R - 6)); }
    }
    /* halves sliding off the block after a split: each is a round with a flat face */
    for (const h of this.halves) {
      const side = Math.sign(h.vx) || 1;                                  // which way this half slid: its flat face points back at the other
      const half = (rad: number, from: number, to: number) => { const pts = [] as { x: number; y: number }[];
        for (let k = 0; k <= 16; k++) { const a2 = R(from + (to - from) * k / 16); pts.push({ x: h.x + Math.cos(a2) * rad, y: h.y + Math.sin(a2) * rad }); } return pts; };
      const from = side > 0 ? -90 : 90, to = side > 0 ? 90 : 270;
      g.fillStyle(PAL.earth2).fillPoints(V(half(ROUND_R, from, to)), true);          // bark round the curved side
      g.fillStyle(PAL.sun3).fillPoints(V(half(ROUND_R - 5, from, to)), true);        // the end grain
      g.lineStyle(1, PAL.earth2, 0.7); for (let r = 12; r < ROUND_R - 10; r += 11) { const arc = half(r, from, to); g.strokePoints(V(arc), false); }
      g.fillStyle(PAL.earth3, 0.9).fillRect(h.x - 1, h.y - ROUND_R + 4, 2, ROUND_R * 2 - 8);   // the fresh split face
    }
    /* the axe, seen from above: the handle runs out of frame to the chopper, the head sits over the round */
    let a = this.phase === 'swing' ? this.angle : this.stuckAngle;
    if (this.phase === 'anim' && this.wobble > 0) { this.wobble = Math.max(0, this.wobble - 0.04); a = this.stuckAngle + Math.sin(this.t * 40) * 7 * this.wobble; }
    if (this.phase === 'done') a = ARC + 18;
    const rad = R(a + 90), cos = Math.cos(rad), sin = Math.sin(rad);   /* +90: the handle runs down to the chopper standing at the bottom of the screen */
    const hx = CX + cos * HEAD_R, hy = CY + sin * HEAD_R;
    ax.lineStyle(7, PAL.earth1, 1); ax.lineBetween(CX + cos * (HEAD_R + 6), CY + sin * (HEAD_R + 6), CX + cos * HANDLE_R, CY + sin * HANDLE_R);
    ax.lineStyle(3, PAL.earth2, 1); ax.lineBetween(CX + cos * (HEAD_R + 8), CY + sin * (HEAD_R + 8), CX + cos * HANDLE_R, CY + sin * HANDLE_R);
    /* the head: a wedge across the handle, bit inward, with a lit edge */
    const nx = -sin, ny = cos;
    ax.fillStyle(PAL.gray1).fillPoints(V([
      { x: hx + nx * 11 + cos * 12, y: hy + ny * 11 + sin * 12 }, { x: hx - nx * 11 + cos * 12, y: hy - ny * 11 + sin * 12 },
      { x: hx - nx * 6 - cos * 14, y: hy - ny * 6 - sin * 14 }, { x: hx + nx * 6 - cos * 14, y: hy + ny * 6 - sin * 14 }]), true);
    ax.fillStyle(PAL.white, 0.85).fillPoints(V([
      { x: hx - nx * 6 - cos * 14, y: hy - ny * 6 - sin * 14 }, { x: hx + nx * 6 - cos * 14, y: hy + ny * 6 - sin * 14 },
      { x: hx + nx * 5 - cos * 18, y: hy + ny * 5 - sin * 18 }, { x: hx - nx * 5 - cos * 18, y: hy - ny * 5 - sin * 18 }]), true);
    ax.fillStyle(PAL.ink, 0.8).fillRect(hx + cos * 10 - 2, hy + sin * 10 - 2, 4, 4);
  }
  protected scoreNow() { return clamp((this.clean * 100 + this.glancing * 40) / (ROUNDS * 100), 0, 1); }
  destroy() { this.ctx.athlete.show(true).pose(0); this.msg?.destroy(); super.destroy(); }
}
