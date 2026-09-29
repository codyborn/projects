/* THE INACCESSIBLE PINNACLE (Sgùrr Dearg, Skye): the Highlands hike. Three beats, no clock.
   (1) Intro: a skyline-style pixel scene of the In Pinn (dithered sky, far ridge silhouette, the blade in flat tones with 1 px highlights,
       scree and grass tufts, the small climber) with the description laid out on a dark band; tap to continue.
   (2) The READY card, one control per line with an icon, like the kite game.
   (3) The game, third person from behind: the ridge is a lane with cliff edges dropping into fog on both sides; it widens as you go
       (a 40 px blade at the start, a 200 px plateau at the end). HOLD anywhere to walk, release to stop. Balance is a needle: it
       drifts while you walk, hardly at all standing; TILT the phone (gamma, dead zone 2°, full at 12°) to correct continuously, or
       tap the LEFT / RIGHT half / arrow keys as the fallback. Gusts are telegraphed 0.7 s ahead (fog streaks, a big arrow, WHOOSH);
       a gust while walking is ~4.5x the standing push, so you stop and hold on. Needle past the edge for 0.6 s = a fall into the fog
       (MISS). The run ends only at the end of the ridge or in the fog. Score = share of time the needle stayed out of the red. */
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, H, clamp, txt } from '../_shared';
import { Micro } from './micro';
import { META } from './pools';
import { TiltReader } from '../motion';
import { makeCanvas, ditherGradient, R, speckle, rng as pxRng } from '../../art/pixel';

const TELEGRAPH = 0.7, FALL_HOLD = 0.6, EDGE = 100, RED = 68, WALK_SEC = 14, TAP_MS = 180;
const VX = W / 2, VY = 214, ATH_Y = 486, LANE_NEAR_Y = H;
const V = (pts: { x: number; y: number }[]) => pts.map(q => new Phaser.Math.Vector2(q.x, q.y));
const INTRO_TITLE = 'THE INACCESSIBLE PINNACLE';
const INTRO_LINES = ['Sgùrr Dearg, Isle of Skye. The only Munro', 'summit that needs a rope. A blade of basalt', '50 metres long, a few metres wide.', 'The wind has opinions.', 'Cody climbed it in fog, July 2025.'];

export class Pinnacle extends Micro {
  readonly id = 'pinnacle'; readonly word = META.pinnacle.word; readonly instr = META.pinnacle.instr; readonly durationSec = META.pinnacle.durationSec;
  /** WorkoutScene: this game draws its own intro before the READY card */
  readonly selfIntro = true;
  private phase: 'intro' | 'card' | 'climb' | 'summit' | 'fall' = 'intro';
  private x = 0; private meander = 0; private lastTap = 0; private prog = 0; private red = 0; private total = 0; private overT = 0; private walking = false; private downAt = 0; private downSide = 0; private pendingWalk = false;
  private gustDir = 0; private gustT = 0; private gustPow = 0; private nextG = 2.2; private warnFrom = 0; private whoosh?: Phaser.GameObjects.Text;
  private introObjs: Phaser.GameObjects.GameObject[] = []; private introT = 0; private summitT = 0; private fog!: Phaser.GameObjects.Graphics; private climbT = 0; private flag = false;
  private tiltR = new TiltReader(2, 12);

  /** harness */
  hint() { return { phase: this.phase, x: this.x, walking: this.walking, wind: this.gustT > 0 ? this.gustDir * this.gustPow : 0, warn: this.warnFrom, gustIn: this.nextG - this.t, prog: this.prog, over: this.overT, red: this.red, t: this.t, climbT: this.climbT, tilt: this.tiltR.state }; }
  /** harness: tap-correct left (-1) or right (1) */
  press(side: -1 | 1) { if (this.phase === 'climb') this.correct(side); }
  /** harness: walk or stop */
  hold(on: boolean) { if (this.phase === 'climb') this.walking = on; }
  /** harness: skip the intro (goes to the READY card) */
  skipIntro() { if (this.phase === 'intro') this.showCard(); }
  /** harness: a tilt sample in degrees */
  tiltSample(gamma: number) { this.tiltR.feed(gamma, performance.now()); }

  protected begin() {
    const sc = this.ctx.scene;
    this.ctx.athlete.show(false);
    /* no clock for this game: the session countdown is parked and its bar hidden; the frame cap is replaced by a day-long one when the climb starts */
    const cd = (sc as any).cdTimer as Phaser.Time.TimerEvent | undefined; if (cd) cd.paused = true; ((sc as any).countdown as Phaser.GameObjects.Graphics | undefined)?.setVisible(false);
    this.on('pointerdown', (p: any) => { if (this.phase === 'intro') { this.showCard(); return; } if (this.phase !== 'climb') return; this.downAt = sc.time.now; this.downSide = p.x < W / 2 ? -1 : 1; this.pendingWalk = true; });
    this.on('pointerup', () => { if (this.phase !== 'climb') return; const held = sc.time.now - this.downAt; this.pendingWalk = false; this.walking = false; if (held < TAP_MS) this.correct(this.downSide as -1 | 1); });
    this.key('keydown-SPACE', () => { if (this.phase === 'intro') { this.showCard(); return; } if (this.phase === 'climb') this.walking = true; }); this.key('keyup-SPACE', () => { this.walking = false; });
    this.key('keydown-LEFT', () => this.press(-1)); this.key('keydown-RIGHT', () => this.press(1));
    this.fog = this.add(sc.add.graphics().setDepth(7));
    this.buildIntro();
    this.ctx.frame.setProgress(''); this.ctx.frame.setTimer('');
    this.loop(dt => { if (this.phase === 'intro') this.tickIntro(dt); else if (this.phase === 'climb') this.tickClimb(dt); else if (this.phase === 'summit') { this.summitT += dt; this.t += 0; this.draw(0); } });
  }

  /* ---------- beat 1: the intro scene, drawn the way the city skylines are ---------- */
  private buildIntro() {
    const sc = this.ctx.scene; const key = 'pinn_intro';
    if (!sc.textures.exists(key)) {
      const cv = makeCanvas(W, H, ctx => {
        const r = pxRng(711); const hy = 430;
        ditherGradient(ctx, 0, 0, W, hy, [PAL.gray2, PAL.gray1, PAL.gray1, PAL.gray0]);                              /* fog sky: pale up top, heavier low */
        R(ctx, 0, 0, W, 26, PAL.night0);
        /* far ridge: a soft silhouette in the mist */
        for (let px = 0; px < W; px++) { const y = 300 + Math.round(Math.sin(px / 47) * 14 + Math.sin(px / 19 + 2) * 6 + Math.sin(px / 7) * 2); R(ctx, px, y, 1, hy - y, PAL.gray0); }
        for (let px = 0; px < W; px++) { const y = 322 + Math.round(Math.sin(px / 33 + 1) * 10 + Math.sin(px / 11) * 3); R(ctx, px, y, 1, hy - y, PAL.night3); }
        /* the blade: long ramp on the left up to the summit, jagged face on the right; flat tones, 1 px highlight along the lit edge */
        const top = (px: number) => { const u = (px - 40) / 200;   /* 0 at the ramp foot, 1 at the summit */
          if (px < 40) return hy - 8; if (px <= 240) return Math.round(hy - 8 - 300 * Math.pow(u, 1.35)); const d = (px - 240) / 70; if (d > 1) return hy - 6;
          const steps = [0, 0.14, 0.2, 0.34, 0.38, 0.55, 0.6, 0.78, 0.84, 1][Math.min(9, Math.floor(d * 10))]; return Math.round(hy - 308 + 300 * steps + (d * 37 % 5)); };
        for (let px = 40; px <= 312; px++) { const y = top(px); R(ctx, px, y, 1, hy - y, px < 240 ? PAL.night2 : PAL.night3); }
        for (let px = 41; px <= 240; px++) { const y = top(px); R(ctx, px, y, 1, 1, PAL.gray1); if ((px * 7) % 23 === 0) R(ctx, px, y + 1, 1, 1, PAL.gray0); }   /* the ramp edge catches the light */
        for (let px = 241; px <= 310; px++) { const y = top(px); if (top(px) < top(px - 1)) R(ctx, px, y, 1, 1, PAL.gray0); }                                   /* lit steps on the face */
        for (let i = 0; i < 14; i++) { const x = 120 + i * 9, y0 = top(x) + 14 + (i * 17) % 40; R(ctx, x, y0, 1, 8 + (i * 5) % 12, PAL.night1); }               /* cracks in the basalt */
        /* scree ridge in the foreground with grass tufts */
        for (let px = 0; px < W; px++) { const y = hy - 18 + Math.round(Math.sin(px / 23) * 8 + Math.sin(px / 9 + 1) * 3); R(ctx, px, y, 1, H - y, PAL.night1); }
        R(ctx, 0, hy + 30, W, H - hy - 30, PAL.night0);
        speckle(ctx, 0, hy - 24, W, 44, PAL.gray0, 0.08, r); speckle(ctx, 0, hy - 10, W, 40, PAL.grass0, 0.05, r);
        for (let i = 0; i < 26; i++) { const x = r.int(0, W - 4), y = hy - 20 + r.int(0, 30); R(ctx, x, y - 3, 1, 3, PAL.grass1); R(ctx, x + 2, y - 4, 1, 4, PAL.grass0); R(ctx, x + 1, y - 1, 3, 1, PAL.grass0); }
        /* the climber at the foot of the ramp: helmet, jacket, legs, a 1 px rope back down */
        R(ctx, 58, hy - 40, 5, 4, PAL.sun3); R(ctx, 57, hy - 36, 7, 8, PAL.gray1); R(ctx, 58, hy - 28, 2, 7, PAL.night0); R(ctx, 61, hy - 28, 2, 7, PAL.night0); R(ctx, 52, hy - 34, 5, 1, PAL.red);
      });
      sc.textures.addCanvas(key, cv);
    }
    const add = (o: Phaser.GameObjects.GameObject) => { this.introObjs.push(this.add(o)); return o; };
    add(sc.add.image(W / 2, H / 2, key).setDepth(4));
    add(sc.add.rectangle(W / 2, H - 116, W, 170, PAL.night0, 0.82).setDepth(5));
    add(txt(sc, W / 2, H - 186, INTRO_TITLE, 12, PAL.sun3).setDepth(6));
    INTRO_LINES.forEach((ln, i) => add(txt(sc, W / 2, H - 160 + i * 18, ln, 9, i === INTRO_LINES.length - 1 ? PAL.sun2 : PAL.gray2).setDepth(6)));
    const hint = add(txt(sc, W / 2, H - 48, 'tap to continue', 8, PAL.gray1).setDepth(6)); sc.tweens.add({ targets: hint, alpha: 0.35, yoyo: true, repeat: -1, duration: 700 });
  }
  private tickIntro(dt: number) { this.introT += dt; }   /* the intro waits for the tap (SPACE on desktop); no auto-advance */

  /* ---------- beat 2: the READY card, one control per line ---------- */
  private showCard() {
    if (this.phase !== 'intro') return; this.phase = 'card'; this.introObjs.forEach(o => o.destroy()); this.introObjs = [];
    const extra = (s: Phaser.Scene, add: (o: Phaser.GameObjects.GameObject) => void) => {
      const top = H / 2 - 210; const ic = s.add.graphics(); add(ic);
      const row = (y: number, color: number, draw: () => void, label: string) => { ic.fillStyle(PAL.night3).fillRect(34, y - 16, 36, 32); draw(); add(txt(s, 80, y, label, 9, color, 'left')); };
      row(top + 86, PAL.neon, () => { ic.fillStyle(PAL.neon).fillCircle(52, top + 86, 8); ic.fillStyle(PAL.night3).fillCircle(52, top + 86, 4); }, 'HOLD anywhere to walk');
      row(top + 126, PAL.sky3, () => { ic.lineStyle(3, PAL.sky3).lineBetween(40, top + 132, 64, top + 120); ic.fillStyle(PAL.sky3).fillRect(50, top + 118, 4, 4); }, 'TILT the phone left / right to balance\n(desktop: LEFT / RIGHT keys or tap the halves)');
      row(top + 166, PAL.red, () => { ic.fillStyle(PAL.white).fillTriangle(62, top + 166, 44, top + 156, 44, top + 176); ic.fillStyle(PAL.red).fillRect(40, top + 180, 26, 3); }, 'When the fog streaks and arrow appear: STOP');
      row(top + 206, PAL.sun2, () => { ic.lineStyle(1, PAL.white); for (let k = 0; k < 4; k++) ic.lineBetween(38, top + 198 + k * 5, 66, top + 200 + k * 5); }, 'Wind while walking = almost\nimpossible to balance');
      row(top + 246, PAL.gray2, () => { ic.fillStyle(PAL.gray0).fillRect(50, top + 234, 2, 22); ic.fillStyle(PAL.red).fillTriangle(52, top + 234, 66, top + 239, 52, top + 244); }, 'Reach the end of the ridge. Or fall.');
    };
    this.ctx.frame.card('', () => this.startClimb(), { height: 420, title: 'The In Pinn', extra });
  }
  private startClimb() {
    this.phase = 'climb'; const sc = this.ctx.scene;
    /* no cap: the frame gets a day-long one so its bookkeeping stays consistent; the session countdown stays parked */
    const f = this.ctx.frame as any; f.capTimer?.remove(); f.capTimer = undefined; f.active = false; this.ctx.frame.capSec = 24 * 3600; this.ctx.frame.beginPlay();
    this.tiltR.request();   /* inside the READY tap: iOS grants or refuses here; taps stay live as the fallback either way */
    this.ctx.athlete.show(true).pose(0); this.ctx.athlete.sprite.setDepth(5).setScale(1);
    this.ctx.frame.setProgress('HOLD TO WALK');
  }

  /* ---------- beat 3: the lane ---------- */
  private laneHalf() { return 20 + 80 * this.prog; }   /* half width at the athlete's row: 40 px blade → 200 px plateau */
  private correct(side: -1 | 1) { const now = this.ctx.scene.time.now; if (now - this.lastTap < 130) return; this.lastTap = now; this.x = clamp(this.x + side * 14, -EDGE, EDGE); this.meander *= 0.6; }
  private tickClimb(dt: number) {
    const rng = this.ctx.rng; const spd = this.ctx.speed; const win = this.ctx.window; const sc = this.ctx.scene;
    if (this.pendingWalk && sc.time.now - this.downAt >= TAP_MS) { this.walking = true; this.pendingWalk = false; }
    this.total += dt; this.climbT += dt;
    if (this.walking) this.prog = clamp(this.prog + dt / WALK_SEC, 0, 1);
    if (this.warnFrom === 0 && this.gustT <= 0 && this.t + TELEGRAPH >= this.nextG) { this.warnFrom = rng() < 0.5 ? -1 : 1; this.say('WHOOSH'); }
    if (this.gustT <= 0 && this.t >= this.nextG) { this.gustDir = this.warnFrom || 1; this.warnFrom = 0; this.gustPow = (42 + rng() * 16) * spd * (1.15 - 0.15 * win); this.gustT = 1.0 + rng() * 0.5; this.nextG = this.t + this.gustT + 1.6 + rng() * 2.0 * win; this.ctx.frame.shake(80, 0.002); }
    if (this.gustT > 0) this.gustT -= dt;
    const gust = this.gustT > 0; const wind = gust ? this.gustDir * this.gustPow : 0;
    /* drift in px/s: a meander while walking, almost nothing standing; a gust adds ~55 px/s standing and ~250 px/s walking */
    this.meander += ((rng() - 0.5) * 240 - this.meander * 1.6) * dt;
    const drift = (this.walking ? this.meander : this.meander * 0.08) + wind * (this.walking ? 4.5 : 1) + this.x * (this.walking ? 0.35 : -0.5);
    /* tilt corrects continuously (up to ~110 px/s at full tilt), once the sensor has spoken; the tap fallback stays live regardless */
    const tiltLive = this.tiltR.state === 'yes' && performance.now() - this.tiltR.lastAt < 1500; const tilt = tiltLive ? this.tiltR.tilt : 0;
    this.x = clamp(this.x + (drift + tilt * 110) * dt, -EDGE, EDGE);
    if (Math.abs(this.x) > RED) this.red += dt;
    if (Math.abs(this.x) >= EDGE - 1) this.overT += dt; else this.overT = Math.max(0, this.overT - dt * 2);
    this.draw(wind);
    if (this.overT >= FALL_HOLD) { this.fall(); return; }
    if (this.prog >= 1) this.summit();
  }
  /** The goal on screen: the top of the blade with its cairn and pole, small on the horizon at the start, scaling up and coming down the
   *  screen toward the climber as progress grows; in the last 10% it sits right in front of them. */
  private summitPos() { const p = this.prog; const e = p * p * (3 - 2 * p); return { x: VX, y: VY + 6 + (ATH_Y - 58 - VY - 6) * e, s: 0.3 + 1.7 * e }; }
  private drawSummit(g: Phaser.GameObjects.Graphics) {
    const { x, y, s } = this.summitPos();
    /* the blade's top behind the cairn, then the cairn (three courses of stones) and the pole */
    g.fillStyle(PAL.night3).fillTriangle(x - 30 * s, y + 6, x, y - 34 * s, x + 30 * s, y + 6); g.fillStyle(PAL.gray0, 0.35).fillTriangle(x, y - 34 * s, x + 4 * s, y - 26 * s, x + 30 * s, y + 6);
    const course = (yy: number, w: number, c: number) => { g.fillStyle(c).fillRect(x - w / 2, yy - 6 * s, w, 6 * s); g.fillStyle(PAL.gray0, 0.5).fillRect(x - w / 2 + 2 * s, yy - 6 * s, 3 * s, 2 * s); };
    course(y, 30 * s, PAL.night2); course(y - 6 * s, 22 * s, PAL.night3); course(y - 12 * s, 12 * s, PAL.night2);
    g.fillStyle(PAL.gray0).fillRect(x - 1 * s, y - 46 * s, Math.max(1, 2 * s), 34 * s);
    if (this.flag) g.fillStyle(PAL.red).fillTriangle(x + 1 * s, y - 46 * s, x + 22 * s, y - 40 * s, x + 1 * s, y - 32 * s);
  }
  private say(s: string) { this.whoosh?.destroy(); const t = this.label(W / 2, 176, s, 12, PAL.white); this.whoosh = t; this.ctx.scene.tweens.add({ targets: t, alpha: 0, y: 160, duration: 700, delay: 300, onComplete: () => t.destroy() }); }
  private draw(wind: number) {
    const g = this.g; g.clear(); const f = this.fog; f.clear(); const p = this.prog; const half = this.laneHalf();
    const pull = this.phase === 'summit' ? clamp(this.summitT / 1.2, 0, 1) : 0;   /* the summit beat: fog pulls back, the far ridge appears */
    g.fillStyle(PAL.gray1).fillRect(0, 26, W, H - 26); g.fillStyle(PAL.gray2, 0.75).fillRect(0, 26, W, VY - 26);
    if (pull > 0) { g.fillStyle(PAL.gray0, 0.9 * pull); for (let px = 0; px < W; px += 2) { const y = VY - 30 + Math.round(Math.sin(px / 41) * 16 + Math.sin(px / 13 + 1) * 5); g.fillRect(px, y, 2, VY + 40 - y); } g.fillStyle(PAL.night3, 0.8 * pull); for (let px = 0; px < W; px += 2) { const y = VY - 8 + Math.round(Math.sin(px / 29 + 2) * 10 + Math.sin(px / 9) * 3); g.fillRect(px, y, 2, VY + 40 - y); } }
    /* the lane in perspective: the far end narrows to the vanishing point, the near end is `half` wide at the athlete's row and widens as the ridge does */
    const nearHalf = half * (LANE_NEAR_Y - VY) / (ATH_Y - VY); const farHalf = 3 + p * 6;
    const lane = [{ x: VX - nearHalf, y: LANE_NEAR_Y }, { x: VX - farHalf, y: VY }, { x: VX + farHalf, y: VY }, { x: VX + nearHalf, y: LANE_NEAR_Y }];
    g.fillStyle(PAL.night3).fillPoints(V(lane), true);
    g.fillStyle(PAL.gray0, 0.3).fillPoints(V([{ x: VX - nearHalf * 0.72, y: LANE_NEAR_Y }, { x: VX - farHalf * 0.6, y: VY }, { x: VX + farHalf * 0.6, y: VY }, { x: VX + nearHalf * 0.72, y: LANE_NEAR_Y }]), true);
    /* cliff edges: a dark lip on both sides, then the drop */
    g.lineStyle(3, PAL.night1, 1); g.lineBetween(VX - nearHalf, LANE_NEAR_Y, VX - farHalf, VY); g.lineBetween(VX + nearHalf, LANE_NEAR_Y, VX + farHalf, VY);
    g.lineStyle(1, PAL.gray0, 0.7); g.lineBetween(VX - nearHalf + 3, LANE_NEAR_Y, VX - farHalf + 1, VY); g.lineBetween(VX + nearHalf - 3, LANE_NEAR_Y, VX + farHalf - 1, VY);
    /* scrolling cross-lines carry the walking motion */
    for (let i = 0; i < 12; i++) { const k = ((i / 12 + p * 6) % 1); const kk = k * k; const y = VY + (LANE_NEAR_Y - VY) * kk; const hw = farHalf + (nearHalf - farHalf) * kk; g.fillStyle(PAL.gray0, 0.3 + 0.4 * k).fillRect(VX - hw, y, hw * 2, 2); }
    /* fog banks beyond the edges */
    for (let k = 0; k < 6; k++) { const yy = VY + 40 + k * 68 + Math.sin(this.t * 0.8 + k) * 6; const kk = (yy - VY) / (LANE_NEAR_Y - VY); const hw = farHalf + (nearHalf - farHalf) * kk * kk; const drift = Math.sin(this.t * 0.5 + k * 2) * 14; const back = pull * 170; f.fillStyle(PAL.white, 0.18 * (1 - 0.6 * pull)).fillRoundedRect(-30 + drift - back, yy, Math.max(0, VX - hw + 4), 30, 14); f.fillStyle(PAL.white, 0.18 * (1 - 0.6 * pull)).fillRoundedRect(VX + hw - 4 - drift + back, yy + 20, W, 30, 14); }
    this.drawSummit(g);
    /* the athlete from behind, leaning with the needle; the lean shows against the lane's width */
    const lean = this.x / EDGE; this.ctx.athlete.at(VX + lean * half * 0.8, ATH_Y + (this.walking ? Math.sin(this.t * 14) * 2 : 0)); this.ctx.athlete.sprite.setAngle(lean * 20); this.ctx.athlete.pose(this.walking ? (Math.floor(this.t * 6) % 2 ? 3 : 0) : 0);
    /* balance needle and progress */
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
    const tiltLive = this.tiltR.state === 'yes'; this.ctx.frame.setProgress(this.overT > 0 ? 'LEAN BACK!' : strong ? (this.walking ? 'STOP!' : 'HOLD ON') : this.walking ? 'WALKING' : tiltLive ? 'HOLD TO WALK · TILT' : 'HOLD TO WALK');
  }
  private summit() {
    this.phase = 'summit'; this.summitT = 0; const sc = this.scoreNow(); this.walking = false; this.ctx.athlete.pose(2); this.ctx.athlete.sprite.setAngle(0); this.ctx.frame.setProgress('SUMMIT');
    const t = this.label(W / 2, 150, 'SUMMIT', 22, PAL.white); this.ctx.scene.tweens.add({ targets: t, scale: { from: 1.6, to: 1 }, duration: 260, ease: 'Back.Out' });
    this.after(500, () => { if (sc >= 0.9) { this.flag = true; this.ctx.frame.shake(90, 0.003); this.pop(W / 2, 184, 'FLAG PLANTED', PAL.sun2); } else this.pop(W / 2, 184, 'no flag today', PAL.gray2); });
    this.draw(0); this.after(1900, () => this.finish(sc));
  }
  private fall() {
    this.phase = 'fall'; const s = this.ctx.scene; const spr = this.ctx.athlete.sprite; this.ctx.frame.shake(200, 0.008); this.ctx.frame.setProgress('FALL');
    s.tweens.add({ targets: spr, y: spr.y + 200, x: spr.x + this.x * 0.8, angle: this.x > 0 ? 160 : -160, alpha: 0, duration: 650, ease: 'Quad.In' });
    this.pop(W / 2, 200, 'INTO THE FOG', PAL.red);
    this.after(720, () => { spr.setAlpha(1); this.finish(Math.min(0.45, this.scoreNow() * 0.4)); });
  }
  protected scoreNow() {
    if (this.phase === 'intro' || this.phase === 'card') return 0;
    const clean = clamp(1 - (this.red / Math.max(1, this.total)) * 2.2, 0, 1);
    return this.phase === 'fall' ? Math.min(0.45, clean * 0.4) : clamp(clean * (0.3 + 0.7 * this.prog), 0, 1);
  }
  destroy() {
    this.tiltR.stop(); this.ctx.athlete.sprite.setAngle(0).setAlpha(1).setScale(1); this.ctx.athlete.pose(0); this.whoosh?.destroy();
    const sc = this.ctx.scene as any; if (sc.cdTimer) sc.cdTimer.paused = false; sc.countdown?.setVisible?.(true); super.destroy();
  }
}
