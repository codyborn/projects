// Gesture micro-games: swipes, chains, rhythm, pose matching.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** CURLS: an arrow appears on the left or right; swipe UP on that side before it fades. Sequences get faster. */
export class Curls extends Micro {
  readonly id = 'curls'; readonly word = META.curls.word; readonly instr = META.curls.instr; readonly durationSec = META.curls.durationSec;
  private side: -1 | 1 | 0 = 0; private life = 0; private need = 6; private hits = 0; private misses = 0; private ttl = 1.2;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); this.ttl = (1.25 * this.ctx.window + 0.45) / this.ctx.speed;
    const spawn = () => { this.side = this.ctx.rng() < 0.5 ? -1 : 1; this.life = this.ttl; };
    const resolve = (ok: boolean) => { if (ok) { this.hits++; this.pop(cx + this.side * 90, 250, 'CURL'); this.ctx.athlete.pose(2); } else { this.misses++; this.pop(cx, 250, 'MISS', PAL.red); this.ctx.frame.shake(100, 0.004); }
      this.side = 0; this.ttl *= 0.9; this.ctx.frame.setProgress(`${this.hits}/${this.need}`); if (this.hits + this.misses >= this.need) this.after(300, () => this.finish(this.scoreNow())); else this.after(280, () => { this.ctx.athlete.pose(0); spawn(); }); };
    this.onSwipe((dir, p) => { if (this.side === 0 || dir !== 'up') return; const s = p.x < W / 2 ? -1 : 1; resolve(s === this.side); });
    this.key('keydown-LEFT', () => { if (this.side) resolve(this.side === -1); }); this.key('keydown-RIGHT', () => { if (this.side) resolve(this.side === 1); });
    this.after(300, spawn);
    this.loop(dt => { if (this.side) { this.life -= dt; if (this.life <= 0) resolve(false); }
      this.g.clear(); this.backdrop(380, 400); this.g.lineStyle(1, PAL.night3).lineBetween(cx, 40, cx, 620);
      if (this.side) { const a = clamp(this.life / this.ttl, 0, 1); const x = cx + this.side * 90; this.g.fillStyle(PAL.sun2, a).fillTriangle(x, 200, x - 26, 240, x + 26, 240); this.g.fillStyle(PAL.sun2, a).fillRect(x - 8, 240, 16, 30); this.g.fillStyle(PAL.ink).fillRect(x - 30, 285, 60, 4); this.g.fillStyle(PAL.neon).fillRect(x - 30, 285, 60 * a, 4); } });
  }
  protected scoreNow() { return clamp(this.hits / this.need, 0, 1); }
}

/** BURPEE CHAIN: quick-time chain of gestures (tap / swipe up / swipe down / hold) with a shrinking timer per prompt. */
export class Burpee extends Micro {
  readonly id = 'burpee'; readonly word = META.burpee.word; readonly instr = META.burpee.instr; readonly durationSec = META.burpee.durationSec;
  private chain: ('tap' | 'up' | 'down' | 'hold')[] = []; private i = 0; private life = 0; private ttl = 1.3; private hits = 0; private holdT = 0; private holding = false;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); const kinds = ['tap', 'up', 'down', 'hold'] as const; this.chain = Array.from({ length: 6 }, () => kinds[Math.floor(this.ctx.rng() * 4)]); this.ttl = (1.4 * this.ctx.window + 0.5) / this.ctx.speed;
    const poses: Record<string, 0 | 1 | 2 | 3> = { tap: 1, up: 2, down: 1, hold: 3 };
    const step = (ok: boolean) => { if (ok) { this.hits++; this.pop(cx, 230, 'YES'); this.ctx.athlete.pose(poses[this.chain[this.i]]); } else { this.pop(cx, 230, 'NOPE', PAL.red); this.ctx.frame.shake(100, 0.004); } this.i++; this.ttl *= 0.9; this.life = this.ttl; this.holdT = 0; this.ctx.frame.setProgress(`${this.i}/${this.chain.length}`); if (this.i >= this.chain.length) this.after(300, () => this.finish(this.scoreNow())); };
    const cur = () => this.chain[this.i];
    this.onSwipe(dir => { if (this.i >= this.chain.length) return; if (dir === 'up' || dir === 'down') step(cur() === dir); }, 22);
    let downAt = 0; this.on('pointerdown', () => { downAt = this.t; this.holding = true; }); this.on('pointerup', (p: any) => { this.holding = false; const dur = this.t - downAt; if (this.i >= this.chain.length) return; if (cur() === 'tap' && dur < 0.25) step(true); else if (cur() === 'tap' && dur >= 0.25 && this.holdT < 0.5) { /* handled by hold path below if it was a hold */ } void p; });
    this.key('keydown-SPACE', () => { if (cur() === 'tap') step(true); });
    this.life = this.ttl;
    this.loop(dt => { if (this.i >= this.chain.length) return; this.life -= dt; if (this.holding && cur() === 'hold') { this.holdT += dt; if (this.holdT > 0.6) step(true); } else if (this.holding && cur() !== 'hold' && this.holdT > 0.5) { step(false); } if (this.holding) this.holdT += 0; if (this.life <= 0) step(false);
      this.g.clear(); this.backdrop(380, 400); const a = clamp(this.life / this.ttl, 0, 1); this.g.fillStyle(PAL.ink).fillRect(60, 300, W - 120, 6); this.g.fillStyle(PAL.neon).fillRect(60, 300, (W - 120) * a, 6);
      for (let k = 0; k < this.chain.length; k++) { const x = 40 + k * 48, y = 180, done = k < this.i, now = k === this.i; this.g.fillStyle(done ? PAL.grass1 : now ? PAL.sun2 : PAL.night3).fillRect(x - 18, y - 18, 36, 36); this.g.fillStyle(PAL.ink);
        const kd = this.chain[k]; if (kd === 'tap') this.g.fillCircle(x, y, 7); else if (kd === 'up') this.g.fillTriangle(x, y - 10, x - 9, y + 8, x + 9, y + 8); else if (kd === 'down') this.g.fillTriangle(x, y + 10, x - 9, y - 8, x + 9, y - 8); else this.g.fillRect(x - 9, y - 4, 18, 8); } });
  }
  protected scoreNow() { return this.chain.length ? this.hits / this.chain.length : 0; }
}

/** SWIM BREATH: alternate LEFT/RIGHT taps in rhythm; when the breath bubble shows, do NOT tap for that beat. */
export class SwimBreath extends Micro {
  readonly id = 'swimbreath'; readonly word = META.swimbreath.word; readonly instr = META.swimbreath.instr; readonly durationSec = META.swimbreath.durationSec;
  private beat = 0; private period = 0.6; private expect: 'L' | 'R' | 'B' = 'L'; private got = false; private good = 0; private bad = 0; private beats = 12; private idx = 0; private drift = 0;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(3).show(true); this.period = 0.62 / this.ctx.speed; const seq: ('L' | 'R' | 'B')[] = []; let s: 'L' | 'R' = 'L'; for (let k = 0; k < this.beats; k++) { if (k > 1 && this.ctx.rng() < 0.25 && seq[k - 1] !== 'B') seq.push('B'); else { seq.push(s); s = s === 'L' ? 'R' : 'L'; } } this.expect = seq[0];
    const tap = (side: 'L' | 'R') => { if (this.idx >= this.beats) return; if (this.expect === 'B') { this.bad++; this.got = true; this.pop(cx, 220, 'GULP', PAL.red); this.ctx.frame.shake(120, 0.005); } else if (!this.got) { this.got = true; if (side === this.expect) { this.good++; this.drift += side === 'L' ? -3 : 3; this.ctx.athlete.sprite.angle = side === 'L' ? -12 : 12; } else { this.bad++; this.pop(cx, 220, 'WRONG ARM', PAL.red); } } };
    this.onTap(p => { if (!p) return; tap(p.x < W / 2 ? 'L' : 'R'); }); this.key('keydown-LEFT', () => tap('L')); this.key('keydown-RIGHT', () => tap('R'));
    this.loop(dt => { this.beat += dt; if (this.beat >= this.period) { this.beat -= this.period; if (this.expect !== 'B' && !this.got) this.bad++; else if (this.expect === 'B' && !this.got) this.good++; this.idx++; this.got = false; this.expect = seq[this.idx] ?? 'L'; this.ctx.frame.setProgress(`${this.idx}/${this.beats}`); if (this.idx >= this.beats) { this.after(200, () => this.finish(this.scoreNow())); return; } }
      this.drift *= 0.97; this.ctx.athlete.at(cx + this.drift, 330);
      this.g.clear(); this.g.fillStyle(PAL.sea1).fillRect(0, 26, W, 614); for (let i = 0; i < 12; i++) this.g.fillStyle(PAL.sea2, 0.35).fillRect((i * 37 + this.t * 80) % W, 60 + ((i * 53) % 520), 20, 2);
      const f = this.beat / this.period; this.g.fillStyle(PAL.ink).fillRect(40, 200, W - 80, 8); this.g.fillStyle(PAL.sea3).fillRect(40, 200, (W - 80) * (1 - f), 8);
      if (this.expect === 'B') { this.g.fillStyle(PAL.sky3, 0.9).fillCircle(cx, 150, 24); this.g.fillStyle(PAL.white).fillCircle(cx - 8, 142, 5); } else { const x = this.expect === 'L' ? cx - 90 : cx + 90; this.g.fillStyle(this.got ? PAL.grass1 : PAL.sun2).fillTriangle(x, 130, x - 22, 170, x + 22, 170); } });
  }
  protected scoreNow() { return clamp((this.good - this.bad * 0.5) / this.beats, 0, 1); }
  destroy() { this.ctx.athlete.sprite.angle = 0; super.destroy(); }
}

/** POSE MATCH: drag to rotate the figure's raised arm to match the target silhouette angle within tolerance. */
export class PoseMatch extends Micro {
  readonly id = 'pose'; readonly word = META.pose.word; readonly instr = META.pose.instr; readonly durationSec = META.pose.durationSec;
  private ang = 0; private target = 0; private hold = 0; private matched = 0; private need = 3; private tol = 0.2;
  protected begin() {
    const cx = W / 2, cy = 330; this.ctx.athlete.at(cx, cy).pose(0).show(true); this.tol = 0.16 * this.ctx.window + 0.08; const nextT = () => { this.target = -1.4 + this.ctx.rng() * 2.2; this.hold = 0; };
    let ly = 0; this.on('pointerdown', (p: any) => { ly = p.y; }); this.on('pointermove', (p: any) => { if (!p.isDown) return; this.ang = clamp(this.ang - (p.y - ly) / 90, -1.6, 1.6); ly = p.y; }); this.key('keydown-UP', () => { this.ang = clamp(this.ang + 0.12, -1.6, 1.6); }); this.key('keydown-DOWN', () => { this.ang = clamp(this.ang - 0.12, -1.6, 1.6); });
    nextT();
    this.loop(dt => { const ok = Math.abs(this.ang - this.target) < this.tol; if (ok) { this.hold += dt; if (this.hold > 0.5) { this.matched++; this.pop(cx, 200, 'MATCH'); this.ctx.frame.setProgress(`${this.matched}/${this.need}`); if (this.matched >= this.need) { this.after(250, () => this.finish(this.scoreNow())); return; } nextT(); } } else this.hold = 0;
      this.g.clear(); this.backdrop(380, 400); const sx = cx + 22, sy = cy - 20;
      this.g.lineStyle(10, PAL.night3, 0.9).lineBetween(sx, sy, sx + Math.cos(this.target) * 60, sy - Math.sin(this.target) * 60);      // shadow target
      this.g.lineStyle(8, ok ? PAL.neon : PAL.sun0).lineBetween(sx, sy, sx + Math.cos(this.ang) * 60, sy - Math.sin(this.ang) * 60);      // the arm
      this.g.fillStyle(PAL.ink).fillRect(cx - 40, 420, 80, 6); this.g.fillStyle(PAL.neon).fillRect(cx - 40, 420, 80 * clamp(this.hold / 0.5, 0, 1), 6); });
  }
  protected scoreNow() { return clamp(this.matched / this.need, 0, 1); }
}
