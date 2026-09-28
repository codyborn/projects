/* THE INACCESSIBLE PINNACLE (Sgùrr Dearg, Skye): the Highlands hike, redesigned after Cody played it. Three beats.
   (1) Intro: the pixel profile of the In Pinn from the ridge (fog, the blade, scree, a tiny climber) with a short travel-log description
       scrolling up over the lower third; tap to skip, otherwise 6 s. The clocks are paused.
   (2) The frame's READY card with the instructions.
   (3) The game, third person from behind: the ridge runs away from the camera toward the summit rock, fog on both sides. HOLD anywhere
       to walk (progress fills), release to stop. A balance needle drifts while you walk (barely while you stand); tap the LEFT or RIGHT
       half (or arrows) to correct it. Gusts are telegraphed 0.7 s ahead (fog streaks, a big arrow, WHOOSH); during a gust the drift is
       violent if you are walking (4.5x) and moderate if you stand still (1x). Red light, green light with wind. Needle past the edge for
       0.6 s = a fall into the fog (MISS). Summit = score by how little time the needle spent in the red, plus a small bonus under par. */
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, H, clamp, txt } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';

const INTRO_SEC = 6, TELEGRAPH = 0.7, FALL_HOLD = 0.6, EDGE = 100, RED = 68, WALK_SEC = 14, PAR = 22, TAP_MS = 180;   /* 14 s of walking; with the stops for gusts the ridge takes about 25 s */
const VX = W / 2, VY = 214;                    /* vanishing point: the summit sits here */
const ATH_Y = 486;
const V = (pts: { x: number; y: number }[]) => pts.map(q => new Phaser.Math.Vector2(q.x, q.y));
const INTRO_LINES = ['Sgùrr Dearg, Isle of Skye. The only Munro', 'summit that needs a rope.', 'A blade of basalt 50 metres long, a few', 'metres wide. The wind has opinions.', '', 'Cody climbed it in fog, July 2025.'];

export class Pinnacle extends Micro {
  readonly id = 'pinnacle'; readonly word = META.pinnacle.word; readonly instr = META.pinnacle.instr; readonly durationSec = META.pinnacle.durationSec;
  /** WorkoutScene: this game draws its own intro before the READY card */
  readonly selfIntro = true;
  private phase: 'intro' | 'card' | 'climb' | 'summit' | 'fall' = 'intro';
  private x = 0; private v = 0; private meander = 0; private lastTap = 0; private prog = 0; private red = 0; private total = 0; private overT = 0; private walking = false; private downAt = 0; private downSide = 0; private pendingWalk = false;
  private gustDir = 0; private gustT = 0; private gustPow = 0; private nextG = 2.2; private warnFrom = 0; private whoosh?: Phaser.GameObjects.Text;
  private shot?: Phaser.GameObjects.Container; private introT = 0; private scroll?: Phaser.GameObjects.Container; private fog!: Phaser.GameObjects.Graphics; private climbT = 0; private flag = false;

  /** harness */
  hint() { return { phase: this.phase, x: this.x, walking: this.walking, wind: this.gustT > 0 ? this.gustDir * this.gustPow : 0, warn: this.warnFrom, gustIn: this.nextG - this.t, prog: this.prog, over: this.overT, red: this.red, t: this.t, climbT: this.climbT }; }
  /** harness: tap-correct left (-1) or right (1) */
  press(side: -1 | 1) { if (this.phase === 'climb') this.correct(side); }
  /** harness: walk or stop */
  hold(on: boolean) { if (this.phase === 'climb') this.walking = on; }
  /** harness: skip the intro shot (goes to the READY card) */
  skipIntro() { if (this.phase === 'intro') this.showCard(); }

  protected begin() {
    const sc = this.ctx.scene;
    this.ctx.athlete.show(false);
    /* the clocks wait for the game itself: pause the frame cap and the session's countdown while the intro and the card are up */
    const cd = (sc as any).cdTimer as Phaser.Time.TimerEvent | undefined; if (cd) cd.paused = true;   /* the session countdown waits for the game itself */
    this.on('pointerdown', (p: any) => { if (this.phase === 'intro') { this.showCard(); return; } if (this.phase !== 'climb') return; this.downAt = sc.time.now; this.downSide = p.x < W / 2 ? -1 : 1; this.pendingWalk = true; });
    this.on('pointerup', () => { if (this.phase !== 'climb') return; const held = sc.time.now - this.downAt; this.pendingWalk = false; this.walking = false; if (held < TAP_MS) this.correct(this.downSide as -1 | 1); });
    this.key('keydown-SPACE', () => { if (this.phase === 'intro') { this.showCard(); return; } if (this.phase === 'climb') this.walking = true; }); this.key('keyup-SPACE', () => { this.walking = false; });
    this.key('keydown-LEFT', () => this.press(-1)); this.key('keydown-RIGHT', () => this.press(1));
    this.fog = this.add(sc.add.graphics().setDepth(7));
    this.buildIntro();
    this.ctx.frame.setProgress('');
    /* the frame is active during the intro (so the loop runs) but no cap is armed; the loop pauses itself while the card is up */
    this.loop(dt => { if (this.phase === 'intro') this.tickIntro(dt); else if (this.phase === 'climb') this.tickClimb(dt); });
  }

  /* ---------- beat 1: the profile shot with the scrolling description ---------- */
  private buildIntro() {
    const sc = this.ctx.scene; const c = this.add(sc.add.container(W / 2, H / 2).setDepth(4)); this.shot = c; const g = sc.add.graphics(); c.add(g);
    for (let i = 0; i < 12; i++) { g.fillStyle(i < 4 ? PAL.gray2 : i < 8 ? PAL.gray1 : PAL.gray0, 1); g.fillRect(-W / 2, -H / 2 + 26 + i * 52, W, 52); }
    g.fillStyle(PAL.white, 0.25); g.fillRect(-W / 2, -H / 2 + 26, W, 120);
    g.fillStyle(PAL.gray1, 0.8); g.fillPoints(V([{ x: -W / 2, y: 190 }, { x: -140, y: 150 }, { x: -60, y: 168 }, { x: 20, y: 140 }, { x: 120, y: 166 }, { x: W / 2, y: 150 }, { x: W / 2, y: 320 }, { x: -W / 2, y: 320 }]), true);
    const blade = [{ x: -150, y: 150 }, { x: -110, y: 120 }, { x: -70, y: 74 }, { x: -30, y: 18 }, { x: 4, y: -50 }, { x: 30, y: -128 }, { x: 44, y: -170 }, { x: 52, y: -186 }, { x: 60, y: -170 }, { x: 68, y: -120 }, { x: 84, y: -84 }, { x: 96, y: -66 }, { x: 104, y: -28 }, { x: 122, y: -4 }, { x: 130, y: 36 }, { x: 150, y: 70 }, { x: 156, y: 120 }, { x: 170, y: 150 }, { x: 170, y: 200 }, { x: -150, y: 200 }];
    g.fillStyle(PAL.night3, 1); g.fillPoints(V(blade), true);
    g.fillStyle(PAL.gray0, 0.55); g.fillPoints(V(blade.map(p => ({ x: p.x + 6, y: p.y + 4 }))), true);
    g.fillStyle(PAL.night3, 1); g.fillPoints(V(blade.filter((_, i) => i < 9 || i >= 18)), true);
    g.lineStyle(1, PAL.gray0, 0.7); for (let i = 0; i < 9; i++) g.lineBetween(-20 + i * 14, -20 + i * 22, 30 + i * 12, 10 + i * 20);
    g.fillStyle(PAL.night2, 1); g.fillPoints(V([{ x: -W / 2, y: 260 }, { x: -120, y: 196 }, { x: -40, y: 176 }, { x: 40, y: 190 }, { x: 120, y: 172 }, { x: W / 2, y: 210 }, { x: W / 2, y: H / 2 }, { x: -W / 2, y: H / 2 }]), true);
    g.fillStyle(PAL.earth0, 1); g.fillPoints(V([{ x: -W / 2, y: 274 }, { x: -100, y: 214 }, { x: 0, y: 200 }, { x: 110, y: 196 }, { x: W / 2, y: 236 }, { x: W / 2, y: H / 2 }, { x: -W / 2, y: H / 2 }]), true);
    const rng = this.ctx.rng; for (let i = 0; i < 90; i++) { const x = -W / 2 + rng() * W, y = 200 + rng() * 110; if (y > 196 + (x + W / 2) * 0.02) { g.fillStyle(i % 3 ? PAL.gray0 : PAL.grass0, 0.9); g.fillRect(Math.round(x), Math.round(y), 2 + Math.round(rng() * 3), 2); } }
    g.fillStyle(PAL.sun3, 1); g.fillRect(-124, 150, 6, 5); g.fillStyle(PAL.gray0, 1); g.fillRect(-124, 155, 6, 9); g.fillStyle(PAL.ink, 1); g.fillRect(-124, 164, 2, 8); g.fillRect(-120, 164, 2, 8);
    c.add([txt(sc, 0, -H / 2 + 62, 'THE INACCESSIBLE PINNACLE', 14, PAL.night1), txt(sc, 0, -H / 2 + 84, 'SGÙRR DEARG · SKYE', 9, PAL.night3)]);
    /* the description: a dark band over the lower third, lines scroll up through it and settle */
    const band = sc.add.rectangle(0, H / 2 - 110, W, 150, PAL.night0, 0.72); c.add(band);
    const sc2 = sc.add.container(0, 0); c.add(sc2); this.scroll = sc2;
    INTRO_LINES.forEach((ln, i) => sc2.add(txt(sc, 0, H / 2 + 40 + i * 20, ln, 10, i === INTRO_LINES.length - 1 ? PAL.sun3 : PAL.gray2)));
    const mask = sc.make.graphics({}); mask.fillRect(0, H - 185, W, 150); sc2.setMask(mask.createGeometryMask()); this.add(mask as any);
    c.add(txt(sc, 0, H / 2 - 26, 'tap to skip', 8, PAL.gray1));
  }
  private tickIntro(dt: number) {
    this.introT += dt; const lift = Math.min(this.introT * 34, 6 * 20 + 20); if (this.scroll) this.scroll.y = -lift;
    const g = this.fog; g.clear();
    for (let k = 0; k < 6; k++) { const yy = 60 + k * 70 + Math.sin(this.introT * 0.7 + k) * 6; const xx = ((k * 131 + this.introT * (18 + k * 6)) % (W + 200)) - 100; g.fillStyle(PAL.white, 0.14 + 0.04 * (k % 2)); g.fillRoundedRect(xx, yy, 180 + k * 20, 26, 12); }
    if (this.introT >= INTRO_SEC) this.showCard();
  }
  /* ---------- beat 2: the READY card ---------- */
  private showCard() {
    if (this.phase !== 'intro') return; this.phase = 'card'; this.fog.clear(); this.shot?.setVisible(false);
    this.ctx.frame.card(this.instr, () => this.startClimb(), { height: 300, title: 'The In Pinn' });
  }
  private startClimb() {
    this.phase = 'climb'; const sc = this.ctx.scene;
    const cd = (sc as any).cdTimer as Phaser.Time.TimerEvent | undefined; if (cd) cd.paused = false;
    /* the 40 s clocks start now: drop whatever cap the frame armed before the intro and arm a fresh one from this moment */
    const f = this.ctx.frame as any; f.capTimer?.remove(); f.capTimer = undefined; f.active = false; this.ctx.frame.capSec = 40; this.ctx.frame.beginPlay();
    this.ctx.athlete.show(true).pose(0); this.ctx.athlete.sprite.setDepth(5).setScale(1);
    this.ctx.frame.setProgress('HOLD TO WALK');
  }

  /* ---------- beat 3: the ridge from behind ---------- */
  private correct(side: -1 | 1) { const now = this.ctx.scene.time.now; if (now - this.lastTap < 130) return; this.lastTap = now; this.x = clamp(this.x + side * 14, -EDGE, EDGE); this.meander *= 0.6; }
  private tickClimb(dt: number) {
    const rng = this.ctx.rng; const spd = this.ctx.speed; const win = this.ctx.window; const sc = this.ctx.scene;
    if (this.pendingWalk && sc.time.now - this.downAt >= TAP_MS) { this.walking = true; this.pendingWalk = false; }
    this.total += dt; this.climbT += dt;
    if (this.walking) this.prog = clamp(this.prog + dt / WALK_SEC, 0, 1);
    /* wind: telegraph, then the gust */
    if (this.warnFrom === 0 && this.gustT <= 0 && this.t + TELEGRAPH >= this.nextG) { this.warnFrom = rng() < 0.5 ? -1 : 1; this.say('WHOOSH'); }
    if (this.gustT <= 0 && this.t >= this.nextG) { this.gustDir = this.warnFrom || 1; this.warnFrom = 0; this.gustPow = (42 + rng() * 16) * spd * (1.15 - 0.15 * win); this.gustT = 1.0 + rng() * 0.5; this.nextG = this.t + this.gustT + 1.6 + rng() * 2.0 * win; this.ctx.frame.shake(80, 0.002); }
    if (this.gustT > 0) this.gustT -= dt;
    const gust = this.gustT > 0; const wind = gust ? this.gustDir * this.gustPow : 0;
    /* drift in px/s: a slow meander while walking, almost nothing standing; a gust adds ~55 px/s standing and ~250 px/s walking (4.5x),
       against taps of 14 px at most every 130 ms (~108 px/s): walking through a gust cannot be held, standing in one can */
    this.meander += ((rng() - 0.5) * 240 - this.meander * 1.6) * dt;
    const drift = (this.walking ? this.meander : this.meander * 0.08) + wind * (this.walking ? 4.5 : 1) + this.x * (this.walking ? 0.35 : -0.5);
    this.x = clamp(this.x + drift * dt, -EDGE, EDGE); this.v = drift;
    if (Math.abs(this.x) > RED) this.red += dt;
    if (Math.abs(this.x) >= EDGE - 1) this.overT += dt; else this.overT = Math.max(0, this.overT - dt * 2);
    this.draw(wind);
    if (this.overT >= FALL_HOLD) { this.fall(); return; }
    if (this.prog >= 1) this.summit();
  }
  private say(s: string) { this.whoosh?.destroy(); const t = this.label(W / 2, 176, s, 12, PAL.white); this.whoosh = t; this.ctx.scene.tweens.add({ targets: t, alpha: 0, y: 160, duration: 700, delay: 300, onComplete: () => t.destroy() }); }
  private draw(wind: number) {
    const g = this.g; g.clear(); const f = this.fog; f.clear(); const p = this.prog;
    g.fillStyle(PAL.gray1).fillRect(0, 26, W, H - 26); g.fillStyle(PAL.gray2, 0.75).fillRect(0, 26, W, VY - 26);
    /* the ridge in perspective: from a wide base at the bottom to the summit at the vanishing point; the summit rock grows as you approach */
    const halfBase = 70, y0 = H;
    g.fillStyle(PAL.night3).fillPoints(V([{ x: VX - halfBase, y: y0 }, { x: VX - 4, y: VY }, { x: VX + 4, y: VY }, { x: VX + halfBase, y: y0 }]), true);
    g.fillStyle(PAL.gray0, 0.3).fillPoints(V([{ x: VX - halfBase + 14, y: y0 }, { x: VX - 2, y: VY }, { x: VX + 2, y: VY }, { x: VX + halfBase - 14, y: y0 }]), true);
    /* scrolling cross-lines give the walking motion */
    for (let i = 0; i < 12; i++) { const k = ((i / 12 + p * 6) % 1); const y = VY + (y0 - VY) * k * k; const hw = 4 + (halfBase - 4) * k * k; g.fillStyle(PAL.gray0, 0.35 + 0.4 * k).fillRect(VX - hw, y, hw * 2, 2); }
    /* the summit rock ahead, growing */
    const s = 0.35 + 1.5 * p; const rock = [{ x: -22, y: 0 }, { x: -10, y: -34 }, { x: -2, y: -60 }, { x: 4, y: -66 }, { x: 10, y: -52 }, { x: 18, y: -30 }, { x: 24, y: 0 }].map(q => ({ x: VX + q.x * s, y: VY + 6 + q.y * s }));
    g.fillStyle(PAL.night2).fillPoints(V(rock), true); g.fillStyle(PAL.gray0, 0.4).fillPoints(V(rock.map(q => ({ x: q.x + 3 * s, y: q.y + 2 * s }))), true);
    if (this.flag) { const fx = VX + 4 * s, fy = VY + 6 - 66 * s; g.fillStyle(PAL.gray0).fillRect(fx, fy - 30, 2, 30); g.fillStyle(PAL.red).fillTriangle(fx + 2, fy - 30, fx + 20, fy - 24, fx + 2, fy - 18); }
    /* fog on both sides of the blade */
    for (let k = 0; k < 6; k++) { const yy = VY + 40 + k * 68 + Math.sin(this.t * 0.8 + k) * 6; const drift = Math.sin(this.t * 0.5 + k * 2) * 14; f.fillStyle(PAL.white, 0.18).fillRoundedRect(-30 + drift, yy, VX - halfBase * ((yy - VY) / (y0 - VY)) + 10, 30, 14); f.fillStyle(PAL.white, 0.18).fillRoundedRect(VX + halfBase * ((yy - VY) / (y0 - VY)) - 10 - drift, yy + 20, W, 30, 14); }
    /* the athlete from behind, on the ridge, leaning with the needle */
    this.ctx.athlete.at(VX + this.x * 0.16, ATH_Y + (this.walking ? Math.sin(this.t * 14) * 2 : 0)); this.ctx.athlete.sprite.setAngle(this.x * 0.2); this.ctx.athlete.pose(this.walking ? (Math.floor(this.t * 6) % 2 ? 3 : 0) : 0);
    /* balance needle */
    const bx = 40, bw = W - 80, by = 60; g.fillStyle(PAL.ink).fillRect(bx, by, bw, 14);
    g.fillStyle(PAL.red, 0.5).fillRect(bx, by, (bw / 2) * (1 - RED / EDGE), 14); g.fillStyle(PAL.red, 0.5).fillRect(bx + bw - (bw / 2) * (1 - RED / EDGE), by, (bw / 2) * (1 - RED / EDGE), 14);
    g.fillStyle(PAL.grass1, 0.6).fillRect(bx + bw / 2 - 0.25 * bw / 2, by, 0.25 * bw, 14);
    g.fillStyle(this.overT > 0 ? PAL.red : Math.abs(this.x) > RED ? PAL.sun2 : PAL.neon).fillRect(bx + bw / 2 + (this.x / EDGE) * (bw / 2) - 3, by - 5, 6, 24);
    if (this.overT > 0) g.fillStyle(PAL.red, 0.9).fillRect(bx, by + 18, bw * clamp(this.overT / FALL_HOLD, 0, 1), 4);
    g.fillStyle(PAL.ink).fillRect(bx, 90, bw, 6); g.fillStyle(PAL.sky3).fillRect(bx, 90, bw * p, 6);
    /* wind: telegraph and gust from the incoming side */
    const side = wind ? Math.sign(wind) : this.warnFrom; const strong = wind !== 0;
    if (side) { f.lineStyle(strong ? 2 : 1, PAL.white, strong ? 0.85 : 0.45); for (let k = 0; k < (strong ? 10 : 5); k++) { const yy = 120 + ((k * 61 + this.t * 260) % 440); const base = ((k * 89 + this.t * (strong ? 720 : 240)) % (W + 120)) - 60; const xx = side > 0 ? W - base : base; f.lineBetween(xx, yy, xx + (strong ? 36 : 18) * -side, yy + 2); }
      const ax = side < 0 ? 28 : W - 28; f.fillStyle(PAL.white, strong ? 0.95 : 0.7); f.fillTriangle(ax + 14 * -side, 300, ax - 14 * -side, 280, ax - 14 * -side, 320); f.fillRect(ax - (side < 0 ? 22 : 0) + 8 * -side, 296, 14, 8); }
    this.ctx.frame.setProgress(this.overT > 0 ? 'LEAN BACK!' : strong ? (this.walking ? 'STOP!' : 'HOLD ON') : this.walking ? 'WALKING' : 'HOLD TO WALK');
  }
  private summit() {
    this.phase = 'summit'; const sc = this.scoreNow(); this.walking = false; this.ctx.athlete.pose(2); this.ctx.athlete.sprite.setAngle(0); this.ctx.frame.setProgress('SUMMIT');
    if (sc >= 0.9) { this.flag = true; this.pop(W / 2, 150, 'SUMMIT FLAG', PAL.sun2); } else this.pop(W / 2, 150, 'SUMMIT', PAL.neon);
    this.draw(0); this.after(800, () => this.finish(sc));
  }
  private fall() {
    this.phase = 'fall'; const s = this.ctx.scene; const spr = this.ctx.athlete.sprite; this.ctx.frame.shake(200, 0.008); this.ctx.frame.setProgress('FALL');
    s.tweens.add({ targets: spr, y: spr.y + 200, x: spr.x + this.x * 0.8, angle: this.x > 0 ? 160 : -160, alpha: 0, duration: 650, ease: 'Quad.In' });
    this.pop(W / 2, 200, 'INTO THE FOG', PAL.red);
    this.after(720, () => { spr.setAlpha(1); this.finish(Math.min(0.45, this.scoreNow() * 0.4)); });
  }
  protected scoreNow() {
    if (this.phase === 'intro' || this.phase === 'card') return 0;
    const clean = clamp(1 - (this.red / Math.max(1, this.total)) * 2.2, 0, 1); const bonus = this.prog >= 1 && this.climbT <= PAR ? 0.08 : 0;
    return this.phase === 'fall' ? Math.min(0.45, clean * 0.4) : clamp(clean * 0.92 * (0.3 + 0.7 * this.prog) + bonus, 0, 1);
  }
  destroy() { this.ctx.athlete.sprite.setAngle(0).setAlpha(1).setScale(1); this.ctx.athlete.pose(0); this.whoosh?.destroy(); const cd = (this.ctx.scene as any).cdTimer as Phaser.Time.TimerEvent | undefined; if (cd) cd.paused = false; super.destroy(); }
}
