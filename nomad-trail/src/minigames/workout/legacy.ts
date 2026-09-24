// Shortened versions of the original trail-run and hike pace games as 8-second micro-games.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** RUNNER: tap to jump rocks, swipe down to duck branches. 8 s. */
export class Runner extends Micro {
  readonly id = 'runner'; readonly word = META.runner.word; readonly instr = META.runner.instr; readonly durationSec = META.runner.durationSec;
  private hits = 0; private cleared = 0; private y = 0; private vy = 0; private duck = 0;
  protected begin() {
    const groundY = 470; const obs: { x: number; w: number; h: number; high: boolean; hit: boolean; passed: boolean }[] = []; let next = 0.4, dist = 0; const spd = 200 * this.ctx.speed; this.y = groundY;
    const ath = this.ctx.athlete.at(80, groundY - 32).pose(0).show(true);
    this.onTap(() => { if (this.y >= groundY && this.duck <= 0) { this.vy = -460; ath.pose(2); } }); this.onSwipe(d => { if (d === 'down' && this.y >= groundY) { this.duck = 0.45; ath.pose(1); } }, 18);
    this.loop(dt => { dist += spd * dt; if (this.t > next) { const high = this.ctx.rng() < 0.4; obs.push({ x: W + 20, w: high ? 40 : 18 + this.ctx.rng() * 10, h: high ? 12 : 16 + this.ctx.rng() * 12, high, hit: false, passed: false }); next = this.t + (0.75 + this.ctx.rng() * 0.6) / this.ctx.speed; }
      this.vy += 1200 * dt; this.y += this.vy * dt; if (this.y >= groundY) { this.y = groundY; this.vy = 0; if (this.duck <= 0 && ath.sprite.texture.key !== 'ath_stand') ath.pose(0); } if (this.duck > 0) { this.duck -= dt; if (this.duck <= 0) ath.pose(0); }
      ath.at(80, this.y - 32 + (this.duck > 0 ? 12 : 0));
      this.g.clear(); this.g.fillStyle(PAL.sky1).fillRect(0, 26, W, 444); this.g.fillStyle(PAL.grass0).fillRect(0, groundY, W, 170); this.g.fillStyle(PAL.earth2).fillRect(0, groundY, W, 6);
      const MW = 140, period = W + MW; for (let i = 0; i < 5; i++) { const mx = ((i * 100 - dist * 0.3) % period + period) % period - MW; this.g.fillStyle(PAL.night3).fillTriangle(mx, groundY, mx + MW / 2, groundY - 120 - i * 10, mx + MW, groundY); }
      for (const o of obs) { o.x -= spd * dt; const top = o.high ? groundY - 70 : groundY - o.h; this.g.fillStyle(o.hit ? PAL.red : o.high ? PAL.earth1 : PAL.gray1).fillRect(o.x, top, o.w, o.high ? 10 : o.h);
        const athTop = this.y - 64 + (this.duck > 0 ? 24 : 0), athBottom = this.y; const overlap = o.x < 92 && o.x + o.w > 68;
        if (!o.hit && !o.passed && overlap) { const collide = o.high ? athTop < groundY - 60 : athBottom > top + 4; if (collide) { o.hit = true; this.hits++; this.ctx.frame.shake(120, 0.005); this.pop(80, 380, o.high ? 'BRANCH' : 'ROCK', PAL.red); } }
        if (!o.passed && o.x + o.w < 68) { o.passed = true; if (!o.hit) this.cleared++; } }
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
