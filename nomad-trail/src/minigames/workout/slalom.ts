/* SLALOM (the ski days: Boulder, Bozeman, Innsbruck, Minakami). The warm layer unlocks skiing, and until round 102
   "skiing" handed you a balance board or a yoga mat, which Cody rightly called out.
   Looking down the fall line from behind the skier: the piste scrolls up past you, gates come at you in pairs, and
   you carve by HOLDING the left or right half of the screen (arrow keys too). Momentum is the game — the skis keep
   their line for a moment after you let go, so a late correction arrives late. Through the poles is a clean gate,
   a shoulder on a pole still counts for part of it, round the outside counts for nothing. Twelve gates, and the
   slope steepens: every gate comes a little faster than the one before.
   Score = (clean + 0.4 x clipped) / 12. */
import Phaser from 'phaser';
import { Audio } from '../../audio/synth';
import { PAL } from '../../core/palette';
import { W, H, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

const GATES = 12;
const SKI_Y = 470;                       // where the skier sits on screen; the course comes to them
const LANE_L = 34, LANE_R = W - 34;      // the piste edges: outside this is deep snow and the run is over
const ACCEL = 700, DRAG = 0.955;         // carve acceleration and how fast a carve bleeds off (the momentum)
const CLIP = 13;                         // how close to a pole still counts as a shoulder rather than a miss

interface Gate { y: number; cx: number; w: number; blue: boolean; judged: boolean; hit: 'clean' | 'clip' | 'miss' | null; }

export class Slalom extends Micro {
  readonly id = 'slalom'; readonly word = META.slalom.word; readonly instr = META.slalom.instr; readonly durationSec = META.slalom.durationSec;
  private x = W / 2; private vx = 0; private hL = false; private hR = false;
  private gates: Gate[] = []; private spawned = 0; private clean = 0; private clipped = 0; private missed = 0;
  private scroll = 0; private speed = 150; private over = false; private bogged = false;
  private trees: { x: number; y: number; big: boolean }[] = [];

  /** harness: the run right now */
  hint() { return { x: this.x, vx: this.vx, clean: this.clean, clipped: this.clipped, missed: this.missed, judged: this.clean + this.clipped + this.missed, next: this.gates.find(g => !g.judged) ?? null, over: this.over }; }
  /** harness: steer (-1 left, 0 off, 1 right) */
  steer(dir: -1 | 0 | 1) { this.hL = dir < 0; this.hR = dir > 0; }

  protected begin() {
    this.ctx.athlete.show(false);                      // the front-facing figure has no back; this game draws its own
    this.ctx.frame.setHint('HOLD left/right to carve');
    this.speed = 150 * this.ctx.speed;
    for (let i = 0; i < 14; i++) this.trees.push({ x: this.ctx.rng() < 0.5 ? 6 + this.ctx.rng() * 22 : W - 28 + this.ctx.rng() * 22, y: this.ctx.rng() * H, big: this.ctx.rng() < 0.4 });
    this.on('pointerdown', (p: Phaser.Input.Pointer) => { this.hL = p.x < W / 2; this.hR = !this.hL; });
    this.on('pointermove', (p: Phaser.Input.Pointer) => { if (p.isDown) { this.hL = p.x < W / 2; this.hR = !this.hL; } });
    this.on('pointerup', () => { this.hL = this.hR = false; });
    this.key('keydown-LEFT', () => { this.hL = true; }); this.key('keyup-LEFT', () => { this.hL = false; });
    this.key('keydown-RIGHT', () => { this.hR = true; }); this.key('keyup-RIGHT', () => { this.hR = false; });
    this.spawn(); this.spawn(); this.spawn();
    this.ctx.frame.setProgress(`0/${GATES}`);
    this.loop(dt => this.tick(dt));
  }

  /** Next gate up the hill: alternating sides, never a straight line of them, and tighter as the run goes on. */
  private spawn() {
    if (this.spawned >= GATES) return;
    const i = this.spawned++;
    const last = this.gates[this.gates.length - 1];
    const topY = last ? last.y - (190 - i * 4) : SKI_Y - 240;
    const side = i % 2 ? 1 : -1;                                   // the course swings across the fall line
    const swing = (0.3 + this.ctx.rng() * 0.45) * (W / 2 - 70);
    this.gates.push({ y: topY, cx: clamp(W / 2 + side * swing, 70, W - 70), w: 92 - i * 2.4, blue: i % 2 === 0, judged: false, hit: null });
  }

  private tick(dt: number) {
    if (this.over) { this.draw(); return; }
    this.speed += 9 * dt * this.ctx.speed;                         // the slope steepens
    const lean = (this.hL ? -1 : 0) + (this.hR ? 1 : 0);
    this.vx = (this.vx + lean * ACCEL * dt) * Math.pow(DRAG, dt * 60);
    this.x += this.vx * dt;
    /* the edge is deep snow, not a wall and not the end of the run: you bog down, bounce back onto the piste and the
       gate you were lining up goes by without you. Ending a twelve-gate run on one slip was too much for one mistake. */
    if (this.x <= LANE_L || this.x >= LANE_R) {
      this.x = clamp(this.x, LANE_L, LANE_R); this.vx = -this.vx * 0.35; this.speed = Math.max(110, this.speed * 0.8);
      const next = this.gates.find(g => !g.judged);
      if (next && !this.bogged) { next.judged = true; next.hit = 'miss'; this.missed++; this.ctx.frame.setProgress(`${this.clean + this.clipped + this.missed}/${GATES}`); this.spawn(); }
      if (!this.bogged) { this.bogged = true; Audio.playSfx('cancel'); this.ctx.frame.shake(120, 0.005); this.pop(W / 2, 300, 'DEEP SNOW', PAL.red); this.after(600, () => { this.bogged = false; }); }
    }
    this.scroll += this.speed * dt;
    for (const g of this.gates) g.y += this.speed * dt;
    for (const t of this.trees) { t.y += this.speed * dt; if (t.y > H + 20) { t.y = -20; t.x = this.ctx.rng() < 0.5 ? 6 + this.ctx.rng() * 22 : W - 28 + this.ctx.rng() * 22; } }
    for (const g of this.gates) {
      if (g.judged || g.y < SKI_Y) continue;
      g.judged = true; const d = Math.abs(this.x - g.cx), half = g.w / 2;
      if (d <= half - 6) { g.hit = 'clean'; this.clean++; Audio.playSfx('blip'); this.pop(W / 2, 300, 'CLEAN', PAL.neon); }
      else if (d <= half + CLIP) { g.hit = 'clip'; this.clipped++; this.vx *= 0.45; Audio.playSfx('crack'); this.ctx.frame.shake(70, 0.003); this.pop(W / 2, 300, 'POLE', PAL.sun2); }
      else { g.hit = 'miss'; this.missed++; Audio.playSfx('cancel'); this.pop(W / 2, 300, 'MISSED GATE', PAL.red); }
      this.ctx.frame.setProgress(`${this.clean + this.clipped + this.missed}/${GATES}`);
      this.spawn();
    }
    if (this.clean + this.clipped + this.missed >= GATES) { this.over = true; this.ctx.frame.setProgress('DONE'); this.after(600, () => this.finish(this.scoreNow())); }
    this.draw();
  }

  private draw() {
    const g = this.g; g.clear();
    /* the piste: bright snow between two walls of dark pine, with the groomer's corduroy scrolling up it */
    g.fillStyle(PAL.sky3).fillRect(0, 26, W, H - 26);
    g.fillStyle(PAL.white).fillRect(LANE_L - 6, 26, LANE_R - LANE_L + 12, H - 26);
    g.lineStyle(1, PAL.sky2, 0.55);
    for (let i = 0; i < 26; i++) { const y = 26 + ((i * 28 + this.scroll) % (H - 26)); g.lineBetween(LANE_L - 6, y, LANE_R + 6, y); }
    for (let i = 0; i < 18; i++) { const y = 26 + ((i * 41 + this.scroll * 0.8) % (H - 26)), x = 50 + ((i * 97) % (W - 100)); g.fillStyle(PAL.sky2, 0.5).fillEllipse(x, y, 16, 6); }   // moguls
    /* the trees at the edge: the only thing that tells you how fast you are going */
    for (const t of this.trees) { const h = t.big ? 26 : 18, w2 = t.big ? 9 : 6;
      g.fillStyle(PAL.earth0).fillRect(t.x - 1, t.y, 3, 6);
      g.fillStyle(PAL.grass0).fillTriangle(t.x, t.y - h, t.x - w2, t.y + 2, t.x + w2, t.y + 2);
      g.fillStyle(PAL.white, 0.75).fillTriangle(t.x, t.y - h, t.x - w2 * 0.45, t.y - h * 0.35, t.x + w2 * 0.45, t.y - h * 0.35); }
    /* gates: two poles and a banner, red one, blue the next */
    for (const g2 of this.gates) {
      if (g2.y < 10 || g2.y > H + 30) continue;
      const col = g2.hit === 'miss' ? PAL.gray1 : g2.blue ? PAL.sky0 : PAL.red;
      const l = g2.cx - g2.w / 2, r = g2.cx + g2.w / 2;
      g.fillStyle(PAL.gray0, 0.25).fillEllipse(l + 2, g2.y + 3, 10, 4); g.fillStyle(PAL.gray0, 0.25).fillEllipse(r + 2, g2.y + 3, 10, 4);
      for (const px of [l, r]) { g.fillStyle(col).fillRect(px - 2, g2.y - 46, 4, 46); g.fillStyle(col, 0.85).fillRect(px - 5, g2.y - 46, 10, 9); }
      if (g2.hit === 'clean') { g.lineStyle(2, PAL.neon, 0.8); g.lineBetween(l, g2.y - 42, r, g2.y - 42); }
    }
    /* the skier, from behind: skis first so the body sits on them, tipped into the turn */
    const tilt = clamp(this.vx / 260, -1, 1);
    const sx = this.x, sy = SKI_Y;
    if (Math.abs(this.vx) > 80 && !this.over) {                    // spray off the inside edge
      for (let i = 0; i < 5; i++) { const o = (i + 1) * 7; g.fillStyle(PAL.white, 0.65 - i * 0.1).fillCircle(sx - Math.sign(this.vx) * o, sy + 14 + i * 3, 3 - i * 0.4); } }
    g.fillStyle(PAL.ink, 0.22).fillEllipse(sx + 3, sy + 18, 30, 8);
    for (const s of [-7, 7]) { const bx = sx + s + tilt * 5;
      g.fillStyle(PAL.sun0).fillRect(bx - 2.5, sy + 2, 5, 26); g.fillStyle(PAL.sun1).fillRect(bx - 2.5, sy + 2, 5, 6); }
    g.fillStyle(PAL.night3).fillRect(sx - 8 + tilt * 3, sy - 6, 16, 14);          // legs/hips
    g.fillStyle(PAL.sea1).fillRect(sx - 10 + tilt * 4, sy - 24, 20, 20);          // jacket
    g.fillStyle(PAL.sea2).fillRect(sx - 10 + tilt * 4, sy - 24, 20, 5);
    g.fillStyle(PAL.earth3).fillRect(sx - 6 + tilt * 4, sy - 34, 12, 11);         // head
    g.fillStyle(PAL.ink).fillRect(sx - 7 + tilt * 4, sy - 35, 14, 5);             // helmet
    for (const s of [-13, 13]) { g.fillStyle(PAL.gray0).fillRect(sx + s + tilt * 5, sy - 18, 2, 26); }   // poles, tucked back
  }

  protected scoreNow() { return clamp((this.clean + this.clipped * 0.4) / GATES, 0, 1); }
  destroy() { this.ctx.athlete.show(true).pose(0); super.destroy(); }
}
