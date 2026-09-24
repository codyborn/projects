// Hold / release / reaction micro-games.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

/** PLANK: hold a finger down; a balance marker drifts with growing wobble; micro-drag left/right to keep it in the band. */
export class Plank extends Micro {
  readonly id = 'plank'; readonly word = META.plank.word; readonly instr = META.plank.instr; readonly durationSec = META.plank.durationSec;
  private holding = false; private px = 0; private m = 0; private v = 0; private inBand = 0; private total = 0; private meter = 1;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(1).show(true); const band = 0.16 * this.ctx.window + 0.06;
    this.on('pointerdown', (p: any) => { this.holding = true; this.px = p.x; }); this.on('pointerup', () => { this.holding = false; });
    this.on('pointermove', (p: any) => { if (!this.holding) return; const dx = p.x - this.px; this.px = p.x; this.m = clamp(this.m + dx / 180, -1, 1); });
    this.key('keydown-SPACE', () => { this.holding = true; }); this.key('keyup-SPACE', () => { this.holding = false; }); this.key('keydown-LEFT', () => { this.m -= 0.12; }); this.key('keydown-RIGHT', () => { this.m += 0.12; });
    this.loop(dt => { this.total += dt; const wob = 0.6 + this.t * 0.35 * this.ctx.speed; this.v += (Math.sin(this.t * 3.1) * 0.9 + Math.sin(this.t * 7.3) * 0.5) * wob * dt; this.v *= 0.96; this.m = clamp(this.m + this.v * dt * 2, -1, 1);
      const ok = this.holding && Math.abs(this.m) < band; if (ok) this.inBand += dt; else this.meter = clamp(this.meter - dt * 0.35, 0, 1);
      this.g.clear(); this.backdrop(380, 400); this.g.fillStyle(PAL.ink).fillRect(40, 240, W - 80, 14); this.g.fillStyle(PAL.grass1, 0.6).fillRect(cx - band * (W / 2 - 40), 240, band * (W - 80), 14); this.g.fillStyle(ok ? PAL.neon : PAL.red).fillRect(cx + this.m * (W / 2 - 40) - 3, 234, 6, 26);
      this.g.fillStyle(PAL.ink).fillRect(40, 450, W - 80, 10); this.g.fillStyle(this.meter > 0.4 ? PAL.sun2 : PAL.red).fillRect(40, 450, (W - 80) * this.meter, 10);
      this.ctx.athlete.sprite.angle = this.m * 12; this.ctx.frame.setProgress(this.holding ? `${Math.round(this.inBand * 10) / 10}s` : 'HOLD');
      if (this.meter <= 0) this.finish(this.scoreNow()); });
  }
  protected scoreNow() { return clamp(this.inBand / (this.durationSec * 0.75), 0, 1) * (0.5 + 0.5 * this.meter); }
  destroy() { this.ctx.athlete.sprite.angle = 0; super.destroy(); }
}

/** SQUAT DEPTH: hold to lower; release inside the green depth band. 4 reps, band narrows. */
export class Squat extends Micro {
  readonly id = 'squat'; readonly word = META.squat.word; readonly instr = META.squat.instr; readonly durationSec = META.squat.durationSec;
  private depth = 0; private holding = false; private reps = 0; private need = 4; private scores: number[] = []; private bandW = 0.22;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); this.bandW = 0.2 * this.ctx.window + 0.08; const bandC = 0.7;
    const release = () => { if (!this.holding) return; this.holding = false; const err = Math.abs(this.depth - bandC); const ok = err < this.bandW / 2; this.scores.push(ok ? clamp(1 - err / (this.bandW / 2), 0.5, 1) : 0);
      this.pop(cx, 220, ok ? (err < this.bandW / 6 ? 'DEEP' : 'GOOD') : this.depth < bandC ? 'SHALLOW' : 'TOO DEEP', ok ? PAL.neon : PAL.red); this.reps++; this.bandW *= 0.8; this.ctx.frame.setProgress(`${this.scores.filter(s => s > 0).length}/${this.need}`);
      if (this.reps >= this.need) this.after(400, () => this.finish(this.scoreNow())); };
    this.onHold(() => { if (this.reps < this.need) this.holding = true; }, release);
    this.loop(dt => { this.depth = clamp(this.depth + (this.holding ? 1.1 * this.ctx.speed : -2.5) * dt, 0, 1); if (this.holding && this.depth >= 1) { release(); }
      this.ctx.athlete.pose(this.depth > 0.5 ? 1 : 0); this.ctx.athlete.sprite.y = 330 + this.depth * 30;
      this.g.clear(); this.backdrop(380, 400); const x0 = 40, w = W - 80; this.g.fillStyle(PAL.ink).fillRect(x0, 200, w, 16); this.g.fillStyle(PAL.grass1, 0.7).fillRect(x0 + (bandC - this.bandW / 2) * w, 200, this.bandW * w, 16); this.g.fillStyle(PAL.sun2).fillRect(x0 + this.depth * w - 3, 194, 6, 28); });
  }
  protected scoreNow() { return this.scores.length ? this.scores.reduce((a, b) => a + b, 0) / this.need : 0; }
}

/** STRETCH: drag a slider end to end smoothly; exceeding the speed limit turns the speedometer red and fails the pass. */
export class Stretch extends Micro {
  readonly id = 'stretch'; readonly word = META.stretch.word; readonly instr = META.stretch.instr; readonly durationSec = META.stretch.durationSec;
  private pos = 0; private last = 0; private jerks = 0; private passes = 0; private need = 2; private dir = 1; private speed = 0; private holding = false;
  protected begin() {
    const y = 250; this.ctx.athlete.at(W / 2, 380).pose(3).show(true); const limit = 160 * (0.6 + 0.4 * this.ctx.window) * (1 / this.ctx.speed);
    this.on('pointerdown', (p: any) => { this.holding = true; this.last = p.x; }); this.on('pointerup', () => { this.holding = false; });
    this.on('pointermove', (p: any) => { if (!this.holding) return; const dx = p.x - this.last; this.last = p.x; this.speed = Math.abs(dx) / 0.016; if (Math.abs(dx) / 0.016 > limit) { this.jerks++; this.pop(W / 2, 200, 'TOO FAST', PAL.red); this.ctx.frame.shake(100, 0.004); this.pos = this.dir > 0 ? 0 : 1; return; }
      this.pos = clamp(this.pos + dx / (W - 80), 0, 1); if ((this.dir > 0 && this.pos >= 1) || (this.dir < 0 && this.pos <= 0)) { this.passes++; this.dir *= -1; this.pop(W / 2, 200, 'AHH'); this.ctx.frame.setProgress(`${this.passes}/${this.need}`); if (this.passes >= this.need) this.after(300, () => this.finish(this.scoreNow())); } });
    this.key('keydown-RIGHT', () => { this.pos = clamp(this.pos + 0.08, 0, 1); }); this.key('keydown-LEFT', () => { this.pos = clamp(this.pos - 0.08, 0, 1); });
    this.loop(dt => { this.speed *= 0.8; void dt; this.g.clear(); this.backdrop(430, 450); const x0 = 40, w = W - 80; this.g.fillStyle(PAL.ink).fillRect(x0, y, w, 12); this.g.fillStyle(PAL.sea2).fillRect(x0, y, this.pos * w, 12); this.g.fillStyle(PAL.white).fillRect(x0 + this.pos * w - 5, y - 6, 10, 24);
      this.g.fillStyle(PAL.gray2).fillTriangle(this.dir > 0 ? W - 30 : 30, y + 6, this.dir > 0 ? W - 44 : 44, y - 2, this.dir > 0 ? W - 44 : 44, y + 14);
      const f = clamp(this.speed / limit, 0, 1); this.g.fillStyle(PAL.ink).fillRect(x0, 300, w, 8); this.g.fillStyle(f > 0.85 ? PAL.red : f > 0.6 ? PAL.sun1 : PAL.neon).fillRect(x0, 300, w * f, 8); this.ctx.athlete.sprite.scaleX = 1 + this.pos * 0.25; });
  }
  protected scoreNow() { return clamp(this.passes / this.need - this.jerks * 0.25, 0, 1); }
  destroy() { this.ctx.athlete.sprite.scaleX = 1; super.destroy(); }
}

/** BALANCE BOARD: a ball on a board; hold left/right to counter gusts shown as streaks. Stay centred. */
export class BalanceBoard extends Micro {
  readonly id = 'balance'; readonly word = META.balance.word; readonly instr = META.balance.instr; readonly durationSec = META.balance.durationSec;
  private x = 0; private v = 0; private gust = 0; private gustT = 0; private nextG = 0.6; private off = 0; private total = 0; private hL = false; private hR = false;
  protected begin() {
    const cx = W / 2, cy = 330; this.ctx.athlete.at(cx, cy - 30).pose(0).show(true);
    this.on('pointerdown', (p: any) => { this.hL = p.x < W / 2; this.hR = !this.hL; }); this.on('pointermove', (p: any) => { if (p.isDown) { this.hL = p.x < W / 2; this.hR = !this.hL; } }); this.on('pointerup', () => { this.hL = this.hR = false; });
    this.key('keydown-LEFT', () => { this.hL = true; }); this.key('keyup-LEFT', () => { this.hL = false; }); this.key('keydown-RIGHT', () => { this.hR = true; }); this.key('keyup-RIGHT', () => { this.hR = false; });
    this.loop(dt => { this.total += dt; if (this.t > this.nextG) { this.gust = (this.ctx.rng() < 0.5 ? -1 : 1) * (120 + this.ctx.rng() * 120) * this.ctx.speed; this.gustT = 0.5 + this.ctx.rng() * 0.5; this.nextG = this.t + 0.9 + this.ctx.rng() * 0.9; }
      if (this.gustT > 0) this.gustT -= dt; const wind = this.gustT > 0 ? this.gust : 0; const lean = (this.hL ? -1 : 0) + (this.hR ? 1 : 0); this.v += (wind + lean * 190 + this.x * 1.6) * dt; this.v *= 0.94; this.x = clamp(this.x + this.v * dt, -110, 110);
      const okB = Math.abs(this.x) < 30; if (!okB) this.off += dt; if (Math.abs(this.x) >= 110) { this.finish(this.scoreNow() * 0.5); return; }
      this.g.clear(); this.backdrop(400, 420); this.g.fillStyle(PAL.ink).fillRect(cx - 100, cy + 40, 200, 10); this.g.fillStyle(PAL.earth2).fillRect(cx - 100, cy + 40, 200, 8); this.g.fillStyle(PAL.gray1).fillTriangle(cx - 20, cy + 70, cx, cy + 48, cx + 20, cy + 70);
      this.g.fillStyle(okB ? PAL.neon : PAL.red).fillCircle(cx + this.x, cy + 30, 10); this.ctx.athlete.at(cx + this.x, cy - 30); this.ctx.athlete.sprite.angle = this.x * 0.15;
      if (this.gustT > 0) { this.g.lineStyle(1, PAL.sky3, 0.8); for (let k = 0; k < 7; k++) { const yy = 60 + ((k * 61 + this.t * 300) % 500); const xx = ((k * 97 + this.t * 600 * Math.sign(wind)) % W + W) % W; this.g.lineBetween(xx, yy, xx + 24 * Math.sign(wind), yy); } }
      this.ctx.frame.setProgress(okB ? 'STEADY' : 'LEAN!'); });
  }
  protected scoreNow() { return clamp(1 - this.off / Math.max(0.5, this.total) * 1.6, 0, 1) * clamp(this.total / (this.durationSec * 0.7), 0, 1); }
  destroy() { this.ctx.athlete.sprite.angle = 0; super.destroy(); }
}

/** SPRINT & STOP: mash-tap to run; when the whistle flashes, stop tapping within 250 ms. 2 to 3 rounds. */
export class SprintStop extends Micro {
  readonly id = 'sprint'; readonly word = META.sprint.word; readonly instr = META.sprint.instr; readonly durationSec = META.sprint.durationSec;
  private round = 0; private rounds = 3; private taps = 0; private state: 'run' | 'stop' | 'gap' = 'gap'; private stopAt = 0; private results: number[] = []; private runFor = 0; private dist = 0;
  protected begin() {
    const cx = W / 2; this.ctx.athlete.at(cx, 330).pose(0).show(true); const react = 0.25 * (0.7 + 0.3 * this.ctx.window) * (1 / this.ctx.speed) + 0.05;
    const next = () => { if (this.round >= this.rounds) { this.finish(this.scoreNow()); return; } this.round++; this.taps = 0; this.state = 'run'; this.runFor = 1.2 + this.ctx.rng() * 1.3; this.stopAt = this.t + this.runFor; };
    this.onTap(() => { if (this.state === 'run') { this.taps++; this.dist += 6; this.ctx.athlete.pose(this.taps % 2 ? 3 : 0); } else if (this.state === 'stop') { const late = this.t - this.stopAt; if (late > react) { this.results.push(0); this.pop(cx, 220, 'FALSE START', PAL.red); this.ctx.frame.shake(120, 0.005); this.state = 'gap'; this.after(500, next); } } });
    this.after(300, next);
    this.loop(dt => { void dt; if (this.state === 'run' && this.t >= this.stopAt) { this.state = 'stop'; this.after(react * 1000 + 350, () => { if (this.state === 'stop') { const pace = clamp(this.taps / (this.runFor * 6), 0, 1); this.results.push(0.5 + 0.5 * pace); this.pop(cx, 220, pace > 0.8 ? 'FAST + STOPPED' : 'STOPPED'); this.state = 'gap'; this.after(450, next); } }); }
      this.g.clear(); this.g.fillStyle(this.state === 'stop' ? PAL.red : PAL.night2).fillRect(0, 26, W, 614); this.g.fillStyle(PAL.grass0).fillRect(0, 380, W, 260); for (let i = 0; i < 8; i++) this.g.fillStyle(PAL.grass2, 0.5).fillRect(((i * 60 - this.dist * 4) % W + W) % W, 384, 30, 3);
      if (this.state === 'stop') { this.g.fillStyle(PAL.white).fillCircle(cx, 180, 26); this.g.fillStyle(PAL.ink).fillRect(cx - 4, 160, 8, 12); }
      this.ctx.frame.setProgress(this.state === 'run' ? `RUN ${this.round}/${this.rounds}` : this.state === 'stop' ? 'STOP!' : ''); });
  }
  protected scoreNow() { return this.results.length ? this.results.reduce((a, b) => a + b, 0) / this.rounds : 0; }
}
