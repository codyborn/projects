/* THE INACCESSIBLE PINNACLE (Sgùrr Dearg, Skye): the Highlands hike. Two beats. (1) The profile shot from the ridge, as in Cody's
   photo: a blade of rock rising out of the scree, a long ramp on the left up to a sharp summit, a jagged drop on the right, all in
   fog; a tiny climber at the base; tap to skip. (2) The traverse: the athlete walks the east ridge on their own while gusts try to
   lean them off the blade. HOLD the LEFT or RIGHT half of the screen (arrow keys too) to lean against the wind. Gusts are telegraphed
   0.6 s ahead by fog streaks and a whistle from the side they come from. Lean past the meter for 0.8 s and you fall into the fog
   (one life, a MISS). Reach the summit and the score is how centred you stayed; 90%+ plants the summit flag. */
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, H, clamp, txt } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

const SHOT_SEC = 2.6, CLIMB_SEC = 16, TELEGRAPH = 0.6, FALL_HOLD = 0.8, EDGE = 110;
/* the ridge in the game view: base (left, low) to summit (right, high) */
const BX = 34, BY = 468, SX = 318, SY = 214;
const V = (pts: { x: number; y: number }[]) => pts.map(q => new Phaser.Math.Vector2(q.x, q.y));

export class Pinnacle extends Micro {
  readonly id = 'pinnacle'; readonly word = META.pinnacle.word; readonly instr = META.pinnacle.instr; readonly durationSec = META.pinnacle.durationSec;
  private phase: 'shot' | 'climb' | 'summit' | 'fall' = 'shot';
  private x = 0; private v = 0; private prog = 0; private off = 0; private total = 0; private overT = 0;
  private hL = false; private hR = false;
  private gustDir = 0; private gustT = 0; private gustPow = 0; private nextG = 1.4; private warnFrom = 0;
  private shot?: Phaser.GameObjects.Container; private shotG?: Phaser.GameObjects.Graphics; private shotT = 0; private fog?: Phaser.GameObjects.Graphics;
  private climbT = 0; private flag = false;

  /** harness: what the wind is doing and where the athlete leans */
  hint() { return { phase: this.phase, x: this.x, v: this.v, wind: this.gustT > 0 ? this.gustDir * this.gustPow : 0, warn: this.warnFrom, gustIn: this.nextG - this.t, prog: this.prog, over: this.overT, t: this.t }; }
  /** harness: lean input, -1 left / 1 right / 0 release */
  press(side: -1 | 0 | 1) { this.hL = side < 0; this.hR = side > 0; }
  /** harness: skip the opening shot */
  skipShot() { if (this.phase === 'shot') this.startClimb(); }

  protected begin() {
    const sc = this.ctx.scene;
    this.ctx.athlete.show(false);
    this.on('pointerdown', (p: any) => { if (this.phase === 'shot') { this.startClimb(); return; } this.hL = p.x < W / 2; this.hR = !this.hL; });
    this.on('pointermove', (p: any) => { if (p.isDown && this.phase === 'climb') { this.hL = p.x < W / 2; this.hR = !this.hL; } });
    this.on('pointerup', () => { this.hL = this.hR = false; });
    this.key('keydown-LEFT', () => { this.hL = true; }); this.key('keyup-LEFT', () => { this.hL = false; });
    this.key('keydown-RIGHT', () => { this.hR = true; }); this.key('keyup-RIGHT', () => { this.hR = false; });
    this.key('keydown-SPACE', () => { if (this.phase === 'shot') this.startClimb(); });
    this.fog = this.add(sc.add.graphics().setDepth(7));
    this.buildShot();
    this.ctx.frame.setProgress('THE IN PINN');
    this.loop(dt => { if (this.phase === 'shot') this.tickShot(dt); else if (this.phase === 'climb') this.tickClimb(dt); });
  }

  /* ---------- beat 1: the profile shot ---------- */
  private buildShot() {
    const sc = this.ctx.scene; const c = this.add(sc.add.container(W / 2, H / 2).setDepth(4)); this.shot = c; const g = sc.add.graphics(); this.shotG = g; c.add(g);
    /* fog sky: light grey bands, brighter at the top like the photo */
    for (let i = 0; i < 12; i++) { g.fillStyle(i < 4 ? PAL.gray2 : i < 8 ? PAL.gray1 : PAL.gray0, 1); g.fillRect(-W / 2, -H / 2 + 26 + i * 52, W, 52); }
    g.fillStyle(PAL.white, 0.25); g.fillRect(-W / 2, -H / 2 + 26, W, 120);
    /* the far ridge, soft in the mist */
    g.fillStyle(PAL.gray1, 0.8); g.fillPoints(V([{ x: -W / 2, y: 190 }, { x: -140, y: 150 }, { x: -60, y: 168 }, { x: 20, y: 140 }, { x: 120, y: 166 }, { x: W / 2, y: 150 }, { x: W / 2, y: 320 }, { x: -W / 2, y: 320 }]), true);
    /* the pinnacle: long ramp on the left, sharp summit, jagged right face (blade of rock) */
    const blade = [{ x: -150, y: 150 }, { x: -110, y: 120 }, { x: -70, y: 74 }, { x: -30, y: 18 }, { x: 4, y: -50 }, { x: 30, y: -128 }, { x: 44, y: -170 }, { x: 52, y: -186 }, { x: 60, y: -170 }, { x: 68, y: -120 }, { x: 84, y: -84 }, { x: 96, y: -66 }, { x: 104, y: -28 }, { x: 122, y: -4 }, { x: 130, y: 36 }, { x: 150, y: 70 }, { x: 156, y: 120 }, { x: 170, y: 150 }, { x: 170, y: 200 }, { x: -150, y: 200 }];
    g.fillStyle(PAL.night3, 1); g.fillPoints(V(blade), true);
    g.fillStyle(PAL.gray0, 0.55); g.fillPoints(V(blade.map(p => ({ x: p.x + 6, y: p.y + 4 }))), true);   /* lit right side, misted */
    g.fillStyle(PAL.night3, 1); g.fillPoints(V(blade.filter((_, i) => i < 9 || i >= 18)), true);         /* keep the ramp edge crisp */
    g.lineStyle(1, PAL.gray0, 0.7); for (let i = 0; i < 9; i++) g.lineBetween(-20 + i * 14, -20 + i * 22, 30 + i * 12, 10 + i * 20);   /* cracks on the face */
    /* scree ridge in the foreground */
    g.fillStyle(PAL.night2, 1); g.fillPoints(V([{ x: -W / 2, y: 260 }, { x: -120, y: 196 }, { x: -40, y: 176 }, { x: 40, y: 190 }, { x: 120, y: 172 }, { x: W / 2, y: 210 }, { x: W / 2, y: H / 2 }, { x: -W / 2, y: H / 2 }]), true);
    g.fillStyle(PAL.earth0, 1); g.fillPoints(V([{ x: -W / 2, y: 274 }, { x: -100, y: 214 }, { x: 0, y: 200 }, { x: 110, y: 196 }, { x: W / 2, y: 236 }, { x: W / 2, y: H / 2 }, { x: -W / 2, y: H / 2 }]), true);
    const rng = this.ctx.rng; for (let i = 0; i < 90; i++) { const x = -W / 2 + rng() * W, y = 200 + rng() * 110; if (y > 196 + (x + W / 2) * 0.02) { g.fillStyle(i % 3 ? PAL.gray0 : PAL.grass0, 0.9); g.fillRect(Math.round(x), Math.round(y), 2 + Math.round(rng() * 3), 2); } }
    /* the tiny climber at the base of the ramp: helmet, jacket, legs */
    g.fillStyle(PAL.sun3, 1); g.fillRect(-124, 150, 6, 5); g.fillStyle(PAL.gray0, 1); g.fillRect(-124, 155, 6, 9); g.fillStyle(PAL.ink, 1); g.fillRect(-124, 164, 2, 8); g.fillRect(-120, 164, 2, 8);
    const title = txt(this.ctx.scene, 0, -H / 2 + 62, 'THE INACCESSIBLE PINNACLE', 14, PAL.night1); const sub = txt(this.ctx.scene, 0, -H / 2 + 84, 'SGÙRR DEARG · SKYE', 9, PAL.night3); const tap = txt(this.ctx.scene, 0, H / 2 - 40, 'tap to climb', 9, PAL.night3);
    c.add([title, sub, tap]);
  }
  private tickShot(dt: number) {
    this.shotT += dt; const g = this.fog!; g.clear();
    /* drifting fog bands over the shot */
    for (let k = 0; k < 6; k++) { const yy = 60 + k * 96 + Math.sin(this.shotT * 0.7 + k) * 6; const xx = ((k * 131 + this.shotT * (18 + k * 6)) % (W + 200)) - 100; g.fillStyle(PAL.white, 0.16 + 0.05 * (k % 2)); g.fillRoundedRect(xx, yy, 180 + k * 20, 26, 12); }
    if (this.shotT >= SHOT_SEC) this.startClimb();
  }
  private startClimb() {
    if (this.phase !== 'shot') return; this.phase = 'climb';
    const sc = this.ctx.scene; const c = this.shot!;
    /* the "zoom": the profile rushes at the camera and dissolves into the ridge */
    sc.tweens.add({ targets: c, scaleX: 2.4, scaleY: 2.4, alpha: 0, duration: 520, ease: 'Quad.In', onComplete: () => { c.setVisible(false); } });
    this.ctx.athlete.show(true).pose(0); this.ctx.athlete.sprite.setDepth(5).setScale(1);
    this.ctx.frame.setProgress('STEADY');
  }

  /* ---------- beat 2: the traverse ---------- */
  private ridgeAt(p: number) { return { x: BX + (SX - BX) * p, y: BY + (SY - BY) * p }; }
  private tickClimb(dt: number) {
    const rng = this.ctx.rng; const spd = this.ctx.speed; const win = this.ctx.window;
    this.total += dt; this.climbT += dt; this.prog = clamp(this.climbT / CLIMB_SEC, 0, 1);
    /* wind: telegraph, then the gust; stronger and closer together as difficulty rises */
    if (this.warnFrom === 0 && this.t + TELEGRAPH >= this.nextG && this.gustT <= 0) this.warnFrom = rng() < 0.5 ? -1 : 1;
    if (this.t >= this.nextG && this.gustT <= 0) { this.gustDir = this.warnFrom || (rng() < 0.5 ? -1 : 1); this.warnFrom = 0; this.gustPow = (70 + rng() * 80) * spd * (1.25 - 0.25 * win); this.gustT = 0.55 + rng() * 0.5; this.nextG = this.t + this.gustT + 0.9 + rng() * 1.1 * win; this.ctx.frame.shake(90, 0.002); }
    if (this.gustT > 0) this.gustT -= dt;
    const wind = this.gustT > 0 ? this.gustDir * this.gustPow : 0; const lean = (this.hL ? -1 : 0) + (this.hR ? 1 : 0);
    /* leaning sets a target tilt (±55); a spring pulls the body there and the wind pushes it off: lean into the gust and you sit near
       centre, lean with it and you are over the edge, stand still and the blade slowly tips you */
    const target = lean !== 0 ? lean * 55 : this.x; const unstable = lean === 0 ? this.x * 1.5 : 0;
    this.v += ((target - this.x) * 9 + wind * 3 + unstable) * dt; this.v *= 0.85; this.x = clamp(this.x + this.v * dt, -EDGE, EDGE);
    const centred = Math.abs(this.x) < 32; if (!centred) this.off += dt;
    if (Math.abs(this.x) >= EDGE - 1) this.overT += dt; else this.overT = Math.max(0, this.overT - dt * 2);
    this.draw(wind);
    if (this.overT >= FALL_HOLD) { this.fall(); return; }
    if (this.prog >= 1) this.summit();
  }
  private draw(wind: number) {
    const g = this.g; g.clear(); const f = this.fog!; f.clear();
    /* sky and mist */
    g.fillStyle(PAL.gray1).fillRect(0, 26, W, H - 26); g.fillStyle(PAL.gray2, 0.7).fillRect(0, 26, W, 200);
    g.fillStyle(PAL.gray0, 0.6).fillPoints(V([{ x: 0, y: 400 }, { x: 60, y: 372 }, { x: 140, y: 392 }, { x: 220, y: 360 }, { x: W, y: 380 }, { x: W, y: H }, { x: 0, y: H }]), true);   /* far ridge */
    /* the blade: the ridge line from base to summit, rock below it, the jagged face beyond the summit */
    const rock = [{ x: BX - 40, y: H }, { x: BX - 40, y: BY + 10 }, { x: BX, y: BY }, { x: SX, y: SY }, { x: SX + 10, y: SY + 40 }, { x: SX + 26, y: SY + 70 }, { x: SX + 22, y: SY + 130 }, { x: W, y: SY + 180 }, { x: W, y: H }];
    g.fillStyle(PAL.night3).fillPoints(V(rock), true);
    g.fillStyle(PAL.gray0, 0.35).fillPoints(V([{ x: BX, y: BY }, { x: SX, y: SY }, { x: SX, y: SY + 60 }, { x: BX + 30, y: BY + 60 }]), true);   /* lit top of the blade */
    g.lineStyle(2, PAL.night2, 1); g.lineBetween(BX, BY, SX, SY);
    for (let i = 0; i < 10; i++) { const p = this.ridgeAt(i / 10 + 0.04); g.fillStyle(PAL.gray0, 0.8).fillRect(Math.round(p.x) - 1, Math.round(p.y) + 4 + (i % 3) * 9, 2, 2); }   /* holds and scree */
    /* the drop: fog below the ridge on the left */
    for (let k = 0; k < 4; k++) f.fillStyle(PAL.white, 0.14).fillRoundedRect(-40 + k * 30 + Math.sin(this.t + k) * 10, BY - 40 + k * 44, 220, 30, 14);
    /* the athlete on the ridge, leaning */
    const p = this.ridgeAt(this.prog); this.ctx.athlete.at(p.x + this.x * 0.12, p.y - 30); this.ctx.athlete.sprite.setAngle(this.x * 0.22); this.ctx.athlete.pose(Math.floor(this.t * 4) % 2 ? 3 : 0);
    /* balance meter */
    const bx = 40, bw = W - 80, by = 60; g.fillStyle(PAL.ink).fillRect(bx, by, bw, 14); g.fillStyle(PAL.grass1, 0.65).fillRect(bx + bw / 2 - (32 / EDGE) * (bw / 2), by, (64 / EDGE) * (bw / 2), 14);
    g.fillStyle(this.overT > 0 ? PAL.red : Math.abs(this.x) < 32 ? PAL.neon : PAL.sun2).fillRect(bx + bw / 2 + (this.x / EDGE) * (bw / 2) - 3, by - 5, 6, 24);
    if (this.overT > 0) { g.fillStyle(PAL.red, 0.9).fillRect(bx, by + 18, bw * clamp(this.overT / FALL_HOLD, 0, 1), 4); }
    /* progress up the ridge */
    g.fillStyle(PAL.ink).fillRect(bx, 88, bw, 6); g.fillStyle(PAL.sky3).fillRect(bx, 88, bw * this.prog, 6);
    /* wind: telegraph streaks from the coming side, then the gust itself */
    const side = wind ? Math.sign(wind) : this.warnFrom;
    if (side) { const strong = wind !== 0; f.lineStyle(strong ? 2 : 1, PAL.white, strong ? 0.85 : 0.45);
      for (let k = 0; k < (strong ? 9 : 5); k++) { const yy = 110 + ((k * 67 + this.t * 260) % 420); const base = ((k * 89 + this.t * (strong ? 700 : 260)) % (W + 120)) - 60; const xx = side > 0 ? base : W - base; f.lineBetween(xx, yy, xx + (strong ? 34 : 18) * side, yy + 2); } }
    if (this.warnFrom && !wind) { const wx = this.warnFrom < 0 ? 22 : W - 22; f.fillStyle(PAL.white, 0.9).fillTriangle(wx, 300, wx - 10 * this.warnFrom, 288, wx - 10 * this.warnFrom, 312); }
    this.ctx.frame.setProgress(this.overT > 0 ? 'LEAN BACK!' : Math.abs(this.x) < 32 ? 'STEADY' : 'LEAN!');
  }
  private summit() {
    this.phase = 'summit'; const s = this.ctx.scene; const p = this.ridgeAt(1); const sc = this.scoreNow();
    this.ctx.athlete.at(p.x, p.y - 30).pose(2); this.ctx.athlete.sprite.setAngle(0); this.ctx.frame.setProgress('SUMMIT');
    if (sc >= 0.9) { this.flag = true; const fg = this.add(s.add.graphics().setDepth(6)); fg.fillStyle(PAL.gray0).fillRect(p.x + 16, p.y - 52, 2, 40); fg.fillStyle(PAL.red).fillTriangle(p.x + 18, p.y - 52, p.x + 40, p.y - 44, p.x + 18, p.y - 36); this.pop(W / 2, 160, 'SUMMIT FLAG', PAL.sun2); }
    else this.pop(W / 2, 160, 'SUMMIT', PAL.neon);
    this.after(700, () => this.finish(sc));
  }
  private fall() {
    this.phase = 'fall'; const s = this.ctx.scene; const spr = this.ctx.athlete.sprite; this.ctx.frame.shake(200, 0.008); this.ctx.frame.setProgress('FALL');
    s.tweens.add({ targets: spr, y: spr.y + 220, x: spr.x + this.x * 0.6, angle: this.x > 0 ? 160 : -160, alpha: 0, duration: 650, ease: 'Quad.In' });
    this.pop(W / 2, 200, 'INTO THE FOG', PAL.red);
    this.after(720, () => { spr.setAlpha(1); this.finish(Math.min(0.45, this.scoreNow() * 0.4)); });
  }
  protected scoreNow() { if (this.phase === 'shot') return 0; const centred = clamp(1 - (this.off / Math.max(0.5, this.total)) * 1.4, 0, 1); return this.phase === 'fall' ? Math.min(0.45, centred * 0.4) : centred * (0.35 + 0.65 * this.prog); }
  destroy() { this.ctx.athlete.sprite.setAngle(0).setAlpha(1).setScale(1); this.ctx.athlete.pose(0); super.destroy(); }
}
