// Shortened versions of the original trail-run and hike pace games as 8-second micro-games.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** RUNNER: tap (< 150 ms) to jump rocks; press and HOLD to duck under branches for as long as held; letting go after a hold jumps. 8 s. */
export class Runner extends Micro {
  readonly id = 'runner'; readonly word = META.runner.word; readonly instr = META.runner.instr; readonly durationSec = META.runner.durationSec;
  private hits = 0; private cleared = 0; private y = 0; private vy = 0; private ducking = false; private downAt = -1;
  private obs: { x: number; w: number; h: number; high: boolean; hit: boolean; passed: boolean }[] = []; private groundY = 470;
  /** harness: the nearest obstacle ahead of the runner and the runner's state */
  hint() { const o = this.obs.filter(o => !o.passed && o.x + o.w > 68).sort((a, b) => a.x - b.x)[0]; return { next: o ? { x: o.x, high: o.high, w: o.w } : undefined, onGround: this.y >= this.groundY, ducking: this.ducking, cleared: this.cleared, hits: this.hits }; }
  press() { if (this.downAt < 0) this.downAt = this.t; }
  release() {
    if (this.downAt < 0) return; const dur = this.t - this.downAt; this.downAt = -1;
    if (this.ducking) { this.ducking = false; this.jump(); }          // releasing after a hold = jump
    else if (dur < 0.15) this.jump();                                  // a quick press = jump
  }
  private jump() { if (this.y >= this.groundY) { this.vy = -460; this.ctx.athlete.pose(2); } }
  protected begin() {
    const groundY = this.groundY; let next = 0.4, dist = 0; const spd = 200 * this.ctx.speed; this.y = groundY; this.obs = [];
    const ath = this.ctx.athlete.at(80, groundY - 32).pose(0).show(true);
    this.on('pointerdown', () => this.press()); this.on('pointerup', () => this.release());
    this.key('keydown-SPACE', () => this.press()); this.key('keyup-SPACE', () => this.release());
    this.key('keydown-DOWN', () => { if (this.y >= groundY) { this.ducking = true; this.downAt = this.t - 1; } }); this.key('keyup-DOWN', () => { if (this.ducking) { this.ducking = false; ath.pose(0); this.downAt = -1; } });
    this.key('keydown-UP', () => this.jump());
    this.loop(dt => { dist += spd * dt; const obs = this.obs;
      if (this.t > next) { const high = this.ctx.rng() < 0.4; obs.push({ x: W + 20, w: high ? 40 : 18 + this.ctx.rng() * 10, h: high ? 12 : 16 + this.ctx.rng() * 12, high, hit: false, passed: false }); next = this.t + (0.75 + this.ctx.rng() * 0.6) / this.ctx.speed; }
      if (this.downAt >= 0 && !this.ducking && this.t - this.downAt >= 0.15 && this.y >= groundY) { this.ducking = true; ath.pose(1); }   // held long enough: duck
      this.vy += 1200 * dt; this.y += this.vy * dt; if (this.y >= groundY) { this.y = groundY; this.vy = 0; if (!this.ducking && ath.sprite.texture.key !== 'ath_stand') ath.pose(0); }
      if (this.ducking && ath.sprite.texture.key !== 'ath_crouch') ath.pose(1);
      ath.at(80, this.y - 32 + (this.ducking ? 12 : 0));
      this.g.clear(); this.g.fillStyle(PAL.sky1).fillRect(0, 26, W, 444); this.g.fillStyle(PAL.grass0).fillRect(0, groundY, W, 170); this.g.fillStyle(PAL.earth2).fillRect(0, groundY, W, 6);
      const MW = 140, period = W + MW; for (let i = 0; i < 5; i++) { const mx = ((i * 100 - dist * 0.3) % period + period) % period - MW; this.g.fillStyle(PAL.night3).fillTriangle(mx, groundY, mx + MW / 2, groundY - 120 - i * 10, mx + MW, groundY); }
      for (const o of obs) { o.x -= spd * dt; const top = o.high ? groundY - 70 : groundY - o.h; this.g.fillStyle(o.hit ? PAL.red : o.high ? PAL.earth1 : PAL.gray1).fillRect(o.x, top, o.w, o.high ? 10 : o.h);
        const athTop = this.y - 64 + (this.ducking ? 24 : 0), athBottom = this.y; const overlap = o.x < 92 && o.x + o.w > 68;
        if (!o.hit && !o.passed && overlap) { const collide = o.high ? athTop < groundY - 60 : athBottom > top + 4; if (collide) { o.hit = true; this.hits++; this.ctx.frame.shake(120, 0.005); this.pop(80, 380, o.high ? 'BRANCH' : 'ROCK', PAL.red); } }
        if (!o.passed && o.x + o.w < 68) { o.passed = true; if (!o.hit) this.cleared++; } }
      if (this.downAt >= 0 && this.ducking) { this.g.fillStyle(PAL.neon, 0.8).fillRect(60, groundY + 14, 40, 4); }   // duck indicator under the runner
      this.ctx.frame.setProgress(`${this.cleared} clear · ${this.hits} hit`); if (this.t >= this.durationSec) this.finish(this.scoreNow()); });
  }
  protected scoreNow() { return clamp((this.cleared - this.hits) / Math.max(4, this.cleared + this.hits), 0, 1); }
}

/** PACE: hold to walk uphill; keep the pace marker in the green. Too fast = dizzy. 8 s. */
export class Pace extends Micro {
  readonly id = 'pace'; readonly word = META.pace.word; readonly instr = META.pace.instr; readonly durationSec = META.pace.durationSec;
  private pace = 0; private holding = false; private inBand = 0; private total = 0; private dizzy = 0; private dizzyEvents = 0;
  protected begin() {
    const band: [number, number] = [0.42 - 0.08 * (1 - this.ctx.window), 0.66 + 0.06 * this.ctx.window]; this.ctx.athlete.at(W / 2, 400).pose(0).show(true);
    this.onHold(() => { this.holding = true; }, () => { this.holding = false; });
    this.loop(dt => { this.pace = clamp(this.pace + (this.holding ? 0.9 * this.ctx.speed : -0.7) * dt * (1 + 0.4 * this.ctx.hard), 0, 1); this.total += dt; const ok = this.pace >= band[0] && this.pace <= band[1]; if (ok) this.inBand += dt; if (this.pace > band[1]) this.dizzy += dt; else this.dizzy = Math.max(0, this.dizzy - dt * 2);
      if (this.dizzy > 1) { this.dizzyEvents++; this.dizzy = 0; this.pace = 0.1; this.ctx.frame.shake(250, 0.008); this.pop(W / 2, 200, 'DIZZY', PAL.red); }
      this.g.clear(); this.g.fillStyle(PAL.sky2).fillRect(0, 26, W, 614); for (let i = 0; i < 6; i++) { const y = 560 - ((i * 90 + this.total * 45 * this.pace * 10) % 540); this.g.fillStyle(i % 2 ? PAL.earth2 : PAL.earth1).fillRect(0, y, W, 4); } this.g.fillStyle(PAL.white).fillTriangle(W / 2 - 90, 220, W / 2, 90, W / 2 + 90, 220);
      const x0 = 40, w = W - 80; this.g.fillStyle(PAL.ink).fillRect(x0, 500, w, 12); this.g.fillStyle(PAL.grass1, 0.6).fillRect(x0 + band[0] * w, 500, (band[1] - band[0]) * w, 12); this.g.fillStyle(ok ? PAL.neon : this.pace > band[1] ? PAL.red : PAL.sun2).fillRect(x0 + this.pace * w - 3, 494, 6, 24);
      this.ctx.athlete.sprite.y = 400 + Math.sin(this.total * (4 + this.pace * 8)) * 2 * this.pace; this.ctx.frame.setProgress(ok ? 'GOOD PACE' : this.pace > band[1] ? 'TOO FAST' : 'WALK'); if (this.total >= this.durationSec) this.finish(this.scoreNow()); });
  }
  protected scoreNow() { return clamp(this.inBand / (this.durationSec * 0.7) - this.dizzyEvents * 0.3, 0, 1); }
}
