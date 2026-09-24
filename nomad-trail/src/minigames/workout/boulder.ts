// BOULDER BETA: memorise the lit sequence of holds, then reproduce it while your grip drains. Plus a dyno catch.
import { PAL } from '../../core/palette';
import { W, clamp } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

export class BoulderBeta extends Micro {
  readonly id = 'boulderbeta'; readonly word = META.boulderbeta.word; readonly instr = META.boulderbeta.instr; readonly durationSec = META.boulderbeta.durationSec;
  private holds: { x: number; y: number }[] = []; private seq: number[] = []; private showing = true; private showIdx = -1; private input: number[] = []; private grip = 1; private rounds = 0; private need = 2; private correct = 0; private dyno = false; private ph = 0; private caught = false;
  protected begin() {
    const cols = [70, 140, 210, 280], rows = [140, 230, 320, 410]; this.holds = []; for (const y of rows) for (const x of cols) this.holds.push({ x: x + (this.ctx.rng() * 20 - 10), y });
    this.ctx.athlete.show(true).pose(2);
    const startRound = () => { const len = 3 + this.rounds; this.seq = []; while (this.seq.length < len) { const k = Math.floor(this.ctx.rng() * this.holds.length); if (!this.seq.includes(k)) this.seq.push(k); } this.input = []; this.showing = true; this.showIdx = -1; let k = 0;
      const show = () => { this.showIdx = k; k++; if (k <= this.seq.length) this.after(520 / this.ctx.speed, show); else this.after(300, () => { this.showing = false; this.showIdx = -1; this.grip = 1; }); }; this.after(300, show); };
    const tapHold = (i: number) => { if (this.showing || this.dyno) return; this.input.push(i); const pos = this.input.length - 1; if (this.seq[pos] !== i) { this.pop(this.holds[i].x, this.holds[i].y - 30, 'WRONG', PAL.red); this.ctx.frame.shake(120, 0.005); this.rounds++; this.ctx.frame.setProgress(`${this.correct}/${this.need}`); if (this.rounds >= this.need) this.after(300, () => this.finish(this.scoreNow())); else startRound(); return; }
      this.ctx.athlete.at(this.holds[i].x, this.holds[i].y + 40); this.pop(this.holds[i].x, this.holds[i].y - 30, 'OK');
      if (this.input.length === this.seq.length) { this.correct++; this.rounds++; this.ctx.frame.setProgress(`${this.correct}/${this.need}`); if (this.rounds >= this.need) { this.dyno = true; this.ph = 0; } else startRound(); } };
    this.on('pointerdown', (p: any) => { if (this.dyno) { if (this.caught) return; this.caught = true; const up = Math.sin(this.ph); const ok = up > 1 - (0.3 * this.ctx.window + 0.1); this.pop(W / 2, 100, ok ? 'DYNO!' : 'SLIP', ok ? PAL.neon : PAL.red); if (ok) this.correct += 0.5; this.after(400, () => this.finish(this.scoreNow())); return; }
      let best = -1, bd = 1e9; this.holds.forEach((h, i) => { const d = (h.x - p.x) ** 2 + (h.y - p.y) ** 2; if (d < bd) { bd = d; best = i; } }); if (bd < 40 * 40) tapHold(best); });
    startRound();
    this.loop(dt => { if (!this.showing && !this.dyno) { this.grip -= dt * (0.16 + 0.08 * this.rounds) * this.ctx.speed; if (this.grip <= 0) { this.pop(W / 2, 480, 'PUMPED OUT', PAL.red); this.rounds++; if (this.rounds >= this.need) { this.after(300, () => this.finish(this.scoreNow())); return; } startRound(); } }
      if (this.dyno) this.ph += 2.6 * this.ctx.speed * dt;
      this.g.clear(); this.g.fillStyle(PAL.gray0).fillRect(0, 26, W, 614); for (let i = 0; i < 9; i++) this.g.fillStyle(PAL.night3, 0.5).fillRect(0, 60 + i * 64, W, 5);
      this.holds.forEach((h, i) => { const lit = this.showing && this.seq[this.showIdx] === i; const done = !this.showing && this.input.includes(i); this.g.fillStyle(PAL.ink).fillCircle(h.x, h.y, 16); this.g.fillStyle(lit ? PAL.sun2 : done ? PAL.grass1 : [PAL.sky1, PAL.dusk3, PAL.earth2, PAL.pink][i % 4]).fillCircle(h.x, h.y, 13); });
      this.g.fillStyle(PAL.ink).fillRect(40, 500, W - 80, 10); this.g.fillStyle(this.grip > 0.3 ? PAL.neon : PAL.red).fillRect(40, 500, (W - 80) * clamp(this.grip, 0, 1), 10);
      if (this.dyno) { const s = Math.sin(this.ph); this.g.fillStyle(PAL.sun2).fillRect(W / 2 - 16, 60, 32, 10); this.ctx.athlete.at(W / 2 + Math.cos(this.ph) * 50, 200 - Math.max(0, s) * 90); this.g.fillStyle(s > 0.7 ? PAL.neon : PAL.gray2, 0.3).fillRect(W / 2 - 60, 100, 120, 8); }
      this.ctx.frame.setTimer(this.showing ? 'WATCH' : this.dyno ? 'TAP AT THE TOP' : 'YOUR TURN'); });
  }
  protected scoreNow() { return clamp(this.correct / (this.need + 0.5), 0, 1); }
}
