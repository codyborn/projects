/* WOOD CHOP (Bozeman): Cody chopped wood in Montana. The athlete holds the axe overhead and it swings like a metronome, left to right
   through about ±40°, over a round of firewood on the block. SWIPE DOWN, tap or SPACE to chop at that instant. Within ±6° of straight
   down = a clean split (the round breaks in two, chips fly, thunk); ±6° to ±18° = glancing (the axe sticks in at an angle, the wood only
   cracks); beyond = a miss (the axe bounces, the athlete shakes it out, 0.6 s lost). Eight rounds, a fresh round each time; the swing
   speeds up every round and after round 4 the period jitters so it cannot be pure rhythm. Split halves stack into a woodpile at the
   side. Score = clean × 100/8 + glancing × 40/8. */
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, clamp, txt } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

const ROUNDS = 8, ARC = 40, CLEAN = 6, GLANCE = 18;
const CX = W / 2, PIVOT_Y = 286, HANDLE = 78, BLOCK_Y = 438, GROUND = 452;
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
    this.ctx.athlete.at(CX - 46, BLOCK_Y - 56).pose(2).show(true); this.ctx.athlete.sprite.setDepth(4);
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
    for (const h of this.halves) { h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vx * 0.02 * dt; if (h.y > GROUND + 6) { h.y = GROUND + 6; h.vy = 0; h.vx *= 0.6; } }
    this.draw();
  }
  private onChop() {
    if (this.phase !== 'swing') return; const a = Math.abs(this.angle); this.phase = 'anim'; this.stuckAngle = this.angle;
    this.ctx.athlete.pose(1);
    if (a <= CLEAN) { this.clean++; this.crack = false; this.burst(); this.ctx.frame.shake(110, 0.006); this.say('SPLIT!', PAL.neon);
      this.halves.push({ x: CX - 12, y: BLOCK_Y - 22, vx: -70 - this.ctx.rng() * 40, vy: -120, rot: 0 }, { x: CX + 12, y: BLOCK_Y - 22, vx: 70 + this.ctx.rng() * 40, vy: -120, rot: 0 });
      this.after(520, () => this.nextRound(true)); }
    else if (a <= GLANCE) { this.glancing++; this.crack = true; this.ctx.frame.shake(70, 0.003); this.say('GLANCING', PAL.sun2); this.after(560, () => this.nextRound(false)); }
    else { this.misses++; this.crack = false; this.wobble = 1; this.ctx.frame.shake(60, 0.002); this.say('MISS', PAL.red); this.after(600 + 300, () => this.nextRound(false)); }
    this.ctx.frame.setProgress(`${this.round + 1}/${ROUNDS}`);
  }
  private nextRound(split: boolean) {
    if (split) { this.pile.push(this.pile.length); }
    this.halves = []; this.round++; this.crack = false; this.wobble = 0;
    if (this.round >= ROUNDS) { this.phase = 'done'; this.ctx.athlete.pose(0); this.ctx.frame.setProgress('DONE'); this.after(450, () => this.finish(this.scoreNow())); return; }
    this.ph = -Math.PI / 2; this.lastHalf = Math.floor(this.ph / Math.PI); this.jitter = 1; this.phase = 'swing'; this.ctx.athlete.pose(2);
  }
  private say(s: string, color: number) { this.msg?.destroy(); this.msg = this.label(CX, 150, s, 14, color); const m = this.msg; this.ctx.scene.tweens.add({ targets: m, y: 128, alpha: 0, duration: 520, onComplete: () => m.destroy() }); }
  private burst() {
    const sc = this.ctx.scene; for (let i = 0; i < 10; i++) { const c = this.add(sc.add.rectangle(CX + (this.ctx.rng() - 0.5) * 12, BLOCK_Y - 24, 3, 2, i % 3 ? PAL.sun3 : PAL.earth2).setDepth(7));
      sc.tweens.add({ targets: c, x: c.x + (this.ctx.rng() - 0.5) * 120, y: c.y - 30 - this.ctx.rng() * 50, alpha: 0, angle: 180, duration: 380 + this.ctx.rng() * 200, ease: 'Quad.Out', onComplete: () => c.destroy() }); }
  }
  private draw() {
    const g = this.g; g.clear(); const ax = this.axeG; ax.clear(); const fx = this.fx; fx.clear();
    /* Montana: sky, ranges, the ranch house and fence from the skyline, grass */
    g.fillStyle(PAL.sky1).fillRect(0, 26, W, GROUND - 26); g.fillStyle(PAL.sky2, 0.6).fillRect(0, 26, W, 120);
    g.fillStyle(PAL.night3, 0.7).fillPoints(V([{ x: 0, y: 340 }, { x: 50, y: 300 }, { x: 100, y: 322 }, { x: 160, y: 262 }, { x: 214, y: 306 }, { x: 270, y: 274 }, { x: 320, y: 312 }, { x: W, y: 296 }, { x: W, y: 372 }, { x: 0, y: 372 }]), true);
    g.fillStyle(PAL.white, 0.5).fillTriangle(146, 278, 160, 262, 174, 278); g.fillStyle(PAL.white, 0.5).fillTriangle(258, 288, 270, 274, 282, 288);
    g.fillStyle(PAL.grass1).fillRect(0, 372, W, GROUND - 372);
    g.fillStyle(PAL.earth0).fillRect(228, 340, 96, 40); g.fillStyle(PAL.earth1).fillTriangle(222, 340, 276, 306, 330, 340); g.fillStyle(PAL.sun3, 0.8).fillRect(246, 352, 10, 12); g.fillRect(292, 352, 10, 12);   /* the ranch house */
    for (let x = 6; x < 200; x += 28) { g.fillStyle(PAL.earth2).fillRect(x, 348, 4, 30); } g.fillStyle(PAL.earth2).fillRect(6, 354, 190, 3); g.fillRect(6, 366, 190, 3);   /* the fence */
    g.fillStyle(PAL.grass0).fillRect(0, GROUND, W, 640 - GROUND); for (let i = 0; i < 20; i++) g.fillStyle(PAL.grass2, 0.7).fillRect((i * 37) % W, GROUND + 6 + (i * 13) % 40, 3, 4);
    /* arc guide behind the axe: the swing arc with the straight-down zone in green */
    fx.lineStyle(3, PAL.ink, 0.5); fx.beginPath(); fx.arc(CX, PIVOT_Y, HANDLE + 18, Phaser.Math.DegToRad(90 - ARC), Phaser.Math.DegToRad(90 + ARC), false); fx.strokePath();
    fx.lineStyle(6, PAL.grass2, 0.85); fx.beginPath(); fx.arc(CX, PIVOT_Y, HANDLE + 18, Phaser.Math.DegToRad(90 - CLEAN), Phaser.Math.DegToRad(90 + CLEAN), false); fx.strokePath();
    fx.lineStyle(3, PAL.sun1, 0.6); fx.beginPath(); fx.arc(CX, PIVOT_Y, HANDLE + 18, Phaser.Math.DegToRad(90 - GLANCE), Phaser.Math.DegToRad(90 - CLEAN), false); fx.strokePath(); fx.beginPath(); fx.arc(CX, PIVOT_Y, HANDLE + 18, Phaser.Math.DegToRad(90 + CLEAN), Phaser.Math.DegToRad(90 + GLANCE), false); fx.strokePath();
    /* chopping block and the round of wood (cracked after a glancing hit; gone after a split) */
    g.fillStyle(PAL.earth1).fillRect(CX - 26, BLOCK_Y - 10, 52, 34); g.fillStyle(PAL.earth2).fillRect(CX - 26, BLOCK_Y - 14, 52, 6);
    const split = this.phase === 'anim' && !this.crack && this.wobble === 0 && this.halves.length > 0;
    if (!split && this.phase !== 'done') { g.fillStyle(PAL.earth2).fillRect(CX - 14, BLOCK_Y - 36, 28, 24); g.fillStyle(PAL.sun3, 0.9).fillRect(CX - 14, BLOCK_Y - 40, 28, 6); g.fillStyle(PAL.earth1, 0.8).fillCircle(CX, BLOCK_Y - 37, 4); if (this.crack) { g.lineStyle(2, PAL.ink, 0.9); g.lineBetween(CX + this.stuckAngle * 0.3, BLOCK_Y - 40, CX + this.stuckAngle * 0.6, BLOCK_Y - 20); } }
    for (const h of this.halves) { g.fillStyle(PAL.earth2).fillRect(h.x - 7, h.y - 22, 14, 24); g.fillStyle(PAL.sun3, 0.9).fillRect(h.x - 7, h.y - 24, 14, 4); }
    /* the woodpile at the left */
    this.pile.forEach((_, i) => { const row = Math.floor(i / 3), col = i % 3; const px = 24 + col * 18 + (row % 2) * 9, py = GROUND - 6 - row * 12; g.fillStyle(PAL.earth2).fillRect(px, py - 10, 16, 10); g.fillStyle(PAL.sun3, 0.9).fillRect(px + 12, py - 10, 4, 10); });
    /* the axe: handle from the pivot, head at the end, rotated by the swing (or stuck / bouncing) */
    let a = this.phase === 'swing' ? this.angle : this.stuckAngle; let len = HANDLE;
    if (this.phase === 'anim') { if (this.wobble > 0) { this.wobble = Math.max(0, this.wobble - 0.04); a = this.stuckAngle + Math.sin(this.t * 40) * 8 * this.wobble; len = HANDLE - 8; } else len = HANDLE + 14; }   /* stuck: the head is down in the block */
    if (this.phase === 'done') { a = -30; len = HANDLE; }
    const rad = Phaser.Math.DegToRad(90 + a); const hx = CX + Math.cos(rad) * len, hy = PIVOT_Y + Math.sin(rad) * len;
    ax.lineStyle(5, PAL.earth2, 1); ax.lineBetween(CX, PIVOT_Y, hx, hy); ax.lineStyle(2, PAL.earth3, 1); ax.lineBetween(CX, PIVOT_Y, hx, hy);
    const nx = Math.cos(rad + Math.PI / 2), ny = Math.sin(rad + Math.PI / 2);
    ax.fillStyle(PAL.gray2).fillPoints(V([{ x: hx - nx * 12, y: hy - ny * 12 }, { x: hx + nx * 12, y: hy + ny * 12 }, { x: hx + nx * 16 + Math.cos(rad) * 12, y: hy + ny * 16 + Math.sin(rad) * 12 }, { x: hx - nx * 16 + Math.cos(rad) * 12, y: hy - ny * 16 + Math.sin(rad) * 12 }]), true);
    ax.fillStyle(PAL.white, 0.7).fillRect(hx + Math.cos(rad) * 10 - 1, hy + Math.sin(rad) * 10 - 1, 2, 2);
    /* the athlete's hands follow the pivot */
    this.ctx.athlete.at(CX - 46 + Math.sin(Phaser.Math.DegToRad(a)) * 6, BLOCK_Y - 56);
  }
  protected scoreNow() { return clamp((this.clean * 100 + this.glancing * 40) / (ROUNDS * 100), 0, 1); }
  destroy() { this.ctx.athlete.pose(0); this.msg?.destroy(); super.destroy(); }
}
