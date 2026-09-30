// The trail-run micro-game (the hike pace meter was removed in round 10).
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** RUNNER: tap (< 150 ms) to jump rocks; press and HOLD to duck under branches for as long as held; letting go after a hold jumps. 13 s.
 *  The athlete uses its side-on run cycle: four frames at a cadence tied to the scroll speed, held on the jump frame while airborne and
 *  the duck frame while held down, back to the cycle on landing or release. */
export class Runner extends Micro {
  readonly id = 'runner'; readonly word = META.runner.word; readonly instr = META.runner.instr; readonly durationSec = META.runner.durationSec;
  private hits = 0; private cleared = 0; private y = 0; private vy = 0; private ducking = false; private downAt = -1;
  private obs: { x: number; w: number; h: number; high: boolean; hit: boolean; passed: boolean }[] = []; private groundY = 470; private cyc = 0;
  /** harness: the animation frame showing right now (0-3 run cycle, 4 jump, 5 duck) */
  animFrame() { return this.y < this.groundY ? 4 : this.ducking ? 5 : Math.floor(this.cyc) % 4; }
  /** harness: the nearest obstacle ahead of the runner and the runner's state */
  hint() { const o = this.obs.filter(o => !o.passed && o.x + o.w > 68).sort((a, b) => a.x - b.x)[0]; return { next: o ? { x: o.x, high: o.high, w: o.w } : undefined, onGround: this.y >= this.groundY, ducking: this.ducking, cleared: this.cleared, hits: this.hits }; }
  press() { if (this.downAt < 0) this.downAt = this.t; }
  release() {
    if (this.downAt < 0) return; const dur = this.t - this.downAt; this.downAt = -1;
    if (this.ducking) { this.ducking = false; this.jump(); }          // releasing after a hold = jump
    else if (dur < 0.15) this.jump();                                  // a quick press = jump
  }
  private jump() { if (this.y >= this.groundY) { this.vy = -460; this.ctx.athlete.runFrame(4); } }
  protected begin() {
    const groundY = this.groundY; let next = 0.4, dist = 0; const spd = 200 * this.ctx.speed; this.y = groundY; this.obs = [];
    const ath = this.ctx.athlete.at(80, groundY - 40).runFrame(0).show(true);   // 12 x 20 box scaled 4x: feet on the ground line
    this.on('pointerdown', () => this.press()); this.on('pointerup', () => this.release());
    this.key('keydown-SPACE', () => this.press()); this.key('keyup-SPACE', () => this.release());
    this.key('keydown-DOWN', () => { if (this.y >= groundY) { this.ducking = true; this.downAt = this.t - 1; } }); this.key('keyup-DOWN', () => { if (this.ducking) { this.ducking = false; this.downAt = -1; } });
    this.key('keydown-UP', () => this.jump());
    this.loop(dt => { dist += spd * dt; const obs = this.obs;
      if (this.t > next) { const high = this.ctx.rng() < 0.4; obs.push({ x: W + 20, w: high ? 40 : 18 + this.ctx.rng() * 10, h: high ? 12 : 16 + this.ctx.rng() * 12, high, hit: false, passed: false }); next = this.t + (0.75 + this.ctx.rng() * 0.6) / this.ctx.speed; }
      if (this.downAt >= 0 && !this.ducking && this.t - this.downAt >= 0.15 && this.y >= groundY) this.ducking = true;   // held long enough: duck
      this.vy += 1200 * dt; this.y += this.vy * dt; if (this.y >= groundY) { this.y = groundY; this.vy = 0; }
      // the run cycle: cadence follows the scroll speed (one stride per ~26 px of trail); the jump and duck frames hold instead
      const airborne = this.y < groundY; if (!airborne && !this.ducking) this.cyc += (spd / 26) * dt;
      const fr = airborne ? 4 : this.ducking ? 5 : Math.floor(this.cyc) % 4; ath.runFrame(fr);
      const bob = airborne || this.ducking ? 0 : (Math.floor(this.cyc) % 2 === 1 ? -3 : 0);
      ath.at(80, this.y - 40 + bob);   // the duck frame draws itself low in the box, so the sprite centre never moves
      this.g.clear(); this.g.fillStyle(PAL.sky1).fillRect(0, 26, W, 444); this.g.fillStyle(PAL.grass0).fillRect(0, groundY, W, 170); this.g.fillStyle(PAL.earth2).fillRect(0, groundY, W, 6);
      const MW = 140, period = W + MW; for (let i = 0; i < 5; i++) { const mx = ((i * 100 - dist * 0.3) % period + period) % period - MW; this.g.fillStyle(PAL.night3).fillTriangle(mx, groundY, mx + MW / 2, groundY - 120 - i * 10, mx + MW, groundY); }
      for (const o of obs) { o.x -= spd * dt; const top = o.high ? groundY - 70 : groundY - o.h; this.g.fillStyle(o.hit ? PAL.red : o.high ? PAL.earth1 : PAL.gray1).fillRect(o.x, top, o.w, o.high ? 10 : o.h);
        // the boxes match the art: standing the head top is 80 px up, ducking it drops to 40 px (the branch underside sits 60 px up, so standing = hit, ducked = a 20 px miss)
        const athTop = this.y - 80 + (this.ducking ? 40 : 0), athBottom = this.y; const overlap = o.x < 92 && o.x + o.w > 68;
        if (!o.hit && !o.passed && overlap) { const collide = o.high ? athTop < groundY - 60 : athBottom > top + 4; if (collide) { o.hit = true; this.hits++; this.ctx.frame.shake(120, 0.005); this.pop(80, 380, o.high ? 'BRANCH' : 'ROCK', PAL.red); } }
        if (!o.passed && o.x + o.w < 68) { o.passed = true; if (!o.hit) this.cleared++; } }
      if (this.downAt >= 0 && this.ducking) { this.g.fillStyle(PAL.neon, 0.8).fillRect(60, groundY + 14, 40, 4); }   // duck indicator   // duck indicator under the runner
      this.ctx.frame.setProgress(`${this.cleared} clear · ${this.hits} hit`); if (this.t >= this.durationSec) this.finish(this.scoreNow()); });
  }
  protected scoreNow() { return clamp((this.cleared - this.hits) / Math.max(6, this.cleared + this.hits), 0, 1); }
}
