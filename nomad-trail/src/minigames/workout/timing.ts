// Timing micro-games: tap at the right instant.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** PUSH-UP: a ring shrinks onto the athlete; tap when it matches the target ring. */
export class PushUp extends Micro {
  readonly id = 'pushup'; readonly word = META.pushup.word; readonly instr = META.pushup.instr; readonly durationSec = META.pushup.durationSec;
  private reps = 0; private hits = 0; private total = 5; private r = 1; private live = false; private results: number[] = [];
  protected begin() {
    const cx = W / 2, cy = 330; this.ctx.athlete.at(cx, cy).pose(1).show(true); this.total = 4 + Math.round(this.ctx.rng() * 2);
    const win = 0.09 * this.ctx.window + 0.03; let shrink = 0.9 * this.ctx.speed; let target = 60;
    const rep = () => { this.r = 1; this.live = true; };
    this.onTap(() => { if (!this.live) return; this.live = false; const err = Math.abs(this.r * 160 - target) / target; const ok = err < win * 3;
      this.results.push(ok ? clamp(1 - err / (win * 3), 0.5, 1) : 0); if (ok) { this.hits++; this.pop(cx, 250, err < win ? 'PERFECT' : 'GOOD'); this.ctx.athlete.pose(2); this.ctx.athlete.bump(); } else { this.pop(cx, 250, 'EARLY', PAL.red); }
      this.reps++; this.ctx.frame.setProgress(`${this.hits}/${this.total}`); if (this.reps >= this.total) this.after(300, () => this.finish(this.scoreNow())); else { shrink *= 1.12; this.after(350, () => { this.ctx.athlete.pose(1); rep(); }); } });
    this.after(200, rep);
    this.loop(dt => { if (this.live) { this.r -= shrink * dt; if (this.r * 160 < target * 0.55) { this.live = false; this.results.push(0); this.reps++; this.pop(cx, 250, 'LATE', PAL.red); this.ctx.frame.setProgress(`${this.hits}/${this.total}`); if (this.reps >= this.total) this.after(300, () => this.finish(this.scoreNow())); else { shrink *= 1.12; this.after(350, rep); } } }
      this.g.clear(); this.backdrop(380, 420); this.g.lineStyle(3, PAL.gray1).strokeCircle(cx, cy, target); if (this.live) { const rr = this.r * 160; this.g.lineStyle(3, Math.abs(rr - target) < target * win * 3 ? PAL.neon : PAL.sun2).strokeCircle(cx, cy, rr); } });
  }
  protected scoreNow() { return this.results.length ? (this.results.reduce((a, b) => a + b, 0) / this.total) : 0; }
}

/** JUMP ROPE: the rope sweeps a circle; tap when it passes under the feet (bottom). It speeds up. A mistimed tap trips. */
export class JumpRope extends Micro {
  readonly id = 'jumprope'; readonly word = META.jumprope.word; readonly instr = META.jumprope.instr; readonly durationSec = META.jumprope.durationSec;
  private ang = 0; private jumps = 0; private trips = 0; private airborne = 0; private need = 6; private lastPass = -1; private caught = false;
  protected begin() {
    const cx = W / 2, cy = 320; this.ctx.athlete.at(cx, cy).pose(0).show(true);
    let omega = 3.2 * this.ctx.speed; const win = 0.45 * this.ctx.window + 0.15;
    this.onTap(() => { if (this.airborne > 0) return; this.airborne = 0.35; this.ctx.athlete.sprite.y = cy - 26; this.ctx.athlete.pose(2); });
    this.loop(dt => { this.ang += omega * dt; if (this.airborne > 0) { this.airborne -= dt; if (this.airborne <= 0) { this.ctx.athlete.sprite.y = cy; this.ctx.athlete.pose(0); } }
      // rope passes the feet at ang ≡ π/2 (bottom)
      const phase = ((this.ang - Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); const pass = Math.floor((this.ang - Math.PI / 2) / (Math.PI * 2));
      if (pass !== this.lastPass && phase < 0.05) { this.lastPass = pass; if (this.airborne > 0) { this.jumps++; omega *= 1.09; this.pop(cx, 230, 'HOP'); } else { this.trips++; this.pop(cx, 230, 'TRIP', PAL.red); this.ctx.frame.shake(120, 0.005); this.ctx.athlete.pose(1); this.after(300, () => this.ctx.athlete.pose(0)); }
        this.ctx.frame.setProgress(`${this.jumps}/${this.need}`); if (this.jumps >= this.need || this.trips >= 3) this.after(250, () => this.finish(this.scoreNow())); }
      this.g.clear(); this.backdrop(380, 400); const rx = Math.cos(this.ang) * 34, ry = Math.sin(this.ang) * 70;
      const near = phase < win || phase > Math.PI * 2 - win; this.g.lineStyle(3, near ? PAL.neon : PAL.sun3); this.g.beginPath(); this.g.moveTo(cx - 40, cy - 20); this.g.lineTo(cx + rx, cy + ry); this.g.lineTo(cx + 40, cy - 20); this.g.strokePath();
      this.g.fillStyle(PAL.ink).fillCircle(cx + rx, cy + ry, 4); });
  }
  protected scoreNow() { return clamp(this.jumps / this.need - this.trips * 0.2, 0, 1); }
}

/** KETTLEBELL: a pendulum swings; swipe up exactly at the top of the front arc. Accelerates. */
export class Kettlebell extends Micro {
  readonly id = 'kettlebell'; readonly word = META.kettlebell.word; readonly instr = META.kettlebell.instr; readonly durationSec = META.kettlebell.durationSec;
  private ph = 0; private swings = 0; private need = 5; private hits: number[] = []; private armed = true;
  protected begin() {
    const cx = W / 2, cy = 300; this.ctx.athlete.at(cx, cy + 40).pose(3).show(true); let omega = 2.4 * this.ctx.speed; const win = 0.35 * this.ctx.window + 0.12;
    const swing = () => { if (!this.armed) return; this.armed = false; const d = Math.abs(((this.ph + Math.PI / 2) % (Math.PI * 2)) - Math.PI); // top of front arc when sin(ph) = 1
      const err = Math.abs(Math.sin(this.ph) - 1); const ok = err < win * 0.6; this.hits.push(ok ? clamp(1 - err / (win * 0.6), 0.5, 1) : 0); void d;
      if (ok) { this.pop(cx, 200, err < win * 0.2 ? 'PERFECT' : 'SWING'); this.ctx.athlete.pose(2); omega *= 1.1; } else { this.pop(cx, 200, 'OFF', PAL.red); this.ctx.frame.shake(100, 0.004); }
      this.swings++; this.ctx.frame.setProgress(`${this.hits.filter(h => h > 0).length}/${this.need}`); this.after(300, () => { this.ctx.athlete.pose(3); this.armed = true; }); if (this.swings >= this.need) this.after(350, () => this.finish(this.scoreNow())); };
    this.onSwipe(dir => { if (dir === 'up') swing(); }); this.key('keydown-SPACE', swing);
    this.loop(dt => { this.ph += omega * dt; const a = Math.sin(this.ph) * 1.1; const bx = cx + Math.sin(a) * 110, by = cy + 10 - Math.cos(a) * 110 + 110;
      this.g.clear(); this.backdrop(380, 400); this.g.lineStyle(3, PAL.gray2).lineBetween(cx, cy + 10, bx, by); this.g.fillStyle(PAL.ink).fillCircle(bx, by, 16); this.g.fillStyle(Math.sin(this.ph) > 1 - win * 0.6 ? PAL.neon : PAL.gray0).fillCircle(bx, by, 13);
      this.g.lineStyle(2, PAL.sun2, 0.6).strokeCircle(cx + Math.sin(1.1) * 110, cy + 10 - Math.cos(1.1) * 110 + 110, 20); });
  }
  protected scoreNow() { return this.hits.length ? this.hits.reduce((a, b) => a + b, 0) / this.need : 0; }
}

/** DYNO: a climber swings on a hold; tap at the apex to catch the next one. 3 catches. */
export class Dyno extends Micro {
  readonly id = 'dyno'; readonly word = META.dyno.word; readonly instr = META.dyno.instr; readonly durationSec = META.dyno.durationSec;
  private ph = 0; private catches = 0; private misses = 0; private need = 3; private y = 440; private locked = false;
  protected begin() {
    const cx = W / 2; let omega = 2.6 * this.ctx.speed; const win = 0.28 * this.ctx.window + 0.1; this.ctx.athlete.show(true).pose(2);
    this.onTap(() => { if (this.locked) return; this.locked = true; const up = Math.sin(this.ph); const ok = up > 1 - win; if (ok) { this.catches++; this.pop(cx, this.y - 120, 'CAUGHT'); this.y -= 90; omega *= 1.15; } else { this.misses++; this.pop(cx, this.y - 100, 'SLIP', PAL.red); this.ctx.frame.shake(140, 0.006); }
      this.ctx.frame.setProgress(`${this.catches}/${this.need}`); if (this.catches >= this.need || this.misses >= 2) this.after(300, () => this.finish(this.scoreNow())); else this.after(250, () => { this.locked = false; }); });
    this.loop(dt => { this.ph += omega * dt; const s = Math.sin(this.ph); const ax = cx + Math.cos(this.ph) * 50, ay = this.y - 40 - Math.max(0, s) * 70;
      this.g.clear(); this.g.fillStyle(PAL.gray0).fillRect(0, 26, W, 640); for (let i = 0; i < 8; i++) this.g.fillStyle(PAL.night3, 0.6).fillRect(0, 60 + i * 72, W, 6);
      for (let k = 0; k <= this.need; k++) { const hy = 440 - k * 90 - 60; this.g.fillStyle(k <= this.catches ? PAL.sun2 : PAL.earth2).fillRect(cx - 14 + (k % 2) * 28 - 14, hy, 28, 10); }
      this.g.fillStyle(s > 1 - win ? PAL.neon : PAL.gray2, 0.35).fillRect(cx - 60, this.y - 40 - 70 - 6, 120, 8);
      this.ctx.athlete.at(ax, ay + 30); });
  }
  protected scoreNow() { return clamp(this.catches / this.need - this.misses * 0.15, 0, 1); }
}

/** RIVER STONES: stones bob; tap to jump when the next one is at its highest. 5 stones. */
export class RiverStones extends Micro {
  readonly id = 'riverstones'; readonly word = META.riverstones.word; readonly instr = META.riverstones.instr; readonly durationSec = META.riverstones.durationSec;
  private idx = 0; private wet = 0; private phases: number[] = []; private jumping = false;
  protected begin() {
    const n = 5; this.phases = Array.from({ length: n + 1 }, () => this.ctx.rng() * Math.PI * 2); let omega = 2.2 * this.ctx.speed; const win = 0.3 * this.ctx.window + 0.12;
    const sx = (i: number) => 40 + i * 56, sy = (i: number) => 380 + Math.sin(this.phases[i]) * 14; this.ctx.athlete.show(true).pose(0);
    this.onTap(() => { if (this.jumping || this.idx >= n) return; const next = this.idx + 1; const up = Math.sin(this.phases[next]); const ok = up > 1 - win; this.jumping = true;
      if (ok) { this.pop(sx(next), 300, up > 1 - win * 0.35 ? 'CLEAN' : 'HOP'); } else { this.wet++; this.pop(sx(next), 300, 'SPLASH', PAL.red); this.ctx.frame.shake(140, 0.006); }
      this.ctx.scene.tweens.add({ targets: this.ctx.athlete.sprite, x: sx(next), y: sy(next) - 60, duration: 220, ease: 'Quad.Out', onComplete: () => { this.idx = next; this.jumping = false; omega *= 1.1; this.ctx.frame.setProgress(`${this.idx}/${n}`); if (this.idx >= n || this.wet >= 3) this.after(250, () => this.finish(this.scoreNow())); } }); });
    this.loop(dt => { for (let i = 0; i < this.phases.length; i++) this.phases[i] += omega * dt * (1 + (i % 3) * 0.2);
      this.g.clear(); this.g.fillStyle(PAL.sea0).fillRect(0, 26, W, 640); for (let i = 0; i < 14; i++) this.g.fillStyle(PAL.sea2, 0.35).fillRect((i * 47 + this.t * 60) % W, 60 + (i * 41) % 560, 18, 2);
      for (let i = 0; i <= n; i++) { const up = Math.sin(this.phases[i]); const hi = i === this.idx + 1 && up > 1 - win; this.g.fillStyle(PAL.ink).fillEllipse(sx(i), sy(i) + 2, 44, 20); this.g.fillStyle(hi ? PAL.neon : PAL.gray1).fillEllipse(sx(i), sy(i), 40, 16); }
      if (!this.jumping) this.ctx.athlete.at(sx(this.idx), sy(this.idx) - 34); });
  }
  protected scoreNow() { return clamp(this.idx / 5 - this.wet * 0.2, 0, 1); }
}
