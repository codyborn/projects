import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ActivityId, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';
import { genLedges, FERRATA, type Ledge } from './ferrataLevel';
import { Athlete, type Micro, type MicroCtx } from './workout/micro';
import { MICRO_REGISTRY, pickOne, seededRng, hashStr, ROUNDS, ROUND_SPEEDS } from './workout';

export interface WorkoutPayload { activity: ActivityId; city: string; day?: number; seed?: number; /** dev/test: force these micro-game ids */ plan?: string[]; }
const TITLES: Partial<Record<ActivityId, string>> = { bands: 'Hotel room workout', boulder: 'Bouldering', ferrata: 'Via ferrata', trailrun: 'Trail run', hike: 'Acclimatization hike', swim: 'Open water swim', yoga: 'Yoga', surf: 'Surf', ski: 'Ski day' };

/**
 * Workout: ONE WarioWare-style fitness micro-game that matches the activity (hotel room, bouldering, trail run...),
 * picked per city+day, played for 3 escalating rounds (x1.0 → x1.3 → x1.6). Lives: 1 + extraLives (hiking boots);
 * a failed round costs a life and the session continues to the next round. Ferrata is the Zeke's Peak climb, unchanged.
 */
export class WorkoutScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private activity: ActivityId = 'bands'; private city = '';
  private g!: Phaser.GameObjects.Graphics; private meter!: Meter; private ticks: Phaser.Time.TimerEvent[] = [];
  private lives = 0; private heartsG?: Phaser.GameObjects.Graphics;
  // session
  private athlete!: Athlete; private current?: Micro; private scores: number[] = []; private microId = ''; private round = 0; private rng: () => number = Math.random; private countdown?: Phaser.GameObjects.Graphics; private cdTimer?: Phaser.Time.TimerEvent;

  constructor() { super(MINIGAME_KEYS.workout); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = (this.launch.payload || {}) as Partial<WorkoutPayload>;
    this.activity = (p.activity && TITLES[p.activity]) ? p.activity : 'bands'; this.city = p.city || ''; this.ticks = []; this.scores = []; this.round = 0; this.current = undefined;
    const seed = typeof p.seed === 'number' ? p.seed : typeof p.day === 'number' ? hashStr(`${p.city}|${p.day}`) : undefined;
    this.rng = seed !== undefined ? seededRng(seed) : Math.random;
  }

  create() {
    this.frame = new MinigameFrame(this, this.launch, TITLES[this.activity] || 'Workout');
    this.cameras.main.setBackgroundColor(PAL.night1);
    this.g = this.add.graphics().setDepth(3);
    this.meter = new Meter(this, 40, 600, W - 80, 8);
    if (this.city) txt(this, W / 2, 40, this.city.toUpperCase(), 9, PAL.gray1).setDepth(7);
    this.frame.hud();
    this.lives = 1 + (this.launch.extraLives ?? 0); this.heartsG = this.add.graphics().setDepth(801); this.drawHearts();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.ticks.forEach(t => t.remove()); this.current?.destroy(); this.cdTimer?.remove(); });
    if (this.activity === 'ferrata') {
      this.frame.capSec = 35;
      const scoreNow: Record<string, () => number> = {}; (this as any)._scoreNow = scoreNow; this.frame.scoreNow = () => (scoreNow.ferrata ? scoreNow.ferrata() : 50);
      this.frame.intro('The marble bounces on its own. Hold LEFT or RIGHT to steer it up the ledges. Green ledges save your progress. Reach the flag.', () => this.ferrata());
      return;
    }
    // ---- one micro-game, three escalating rounds
    this.frame.capSec = 30; const forced = ((this.launch.payload || {}) as Partial<WorkoutPayload>).plan?.filter(id => MICRO_REGISTRY[id]);
    this.microId = forced?.length ? forced[0] : pickOne(this.activity, this.rng, ((this.launch.payload || {}) as any).city); this.athlete = new Athlete(this, W / 2, 330); this.athlete.show(false);
    this.frame.scoreNow = () => this.sessionScore();
    const meta = MICRO_REGISTRY[this.microId]();
    this.frame.intro(`${meta.instr} ${ROUNDS} rounds. Each one faster.`, () => this.nextRound());
  }
  update(_t: number, dt: number) { this.frame.update(dt); }

  private sessionScore() { const done = this.scores.length; if (!done) return 0; return (this.scores.reduce((a, b) => a + b, 0) / Math.max(done, ROUNDS)) * 100; }

  /** Card (the command word on round 1, ROUND 2 / FINAL after) → the micro-game at this round's speed with a countdown bar → result → next round. */
  private nextRound() {
    if (!this.frame.active) return;
    if (this.round >= ROUNDS || this.lives <= 0) { this.finishSession(); return; }
    const micro = MICRO_REGISTRY[this.microId](); const speed = ROUND_SPEEDS[Math.min(this.round, ROUND_SPEEDS.length - 1)]; const first = this.round === 0;
    this.meter.set(this.round / ROUNDS, PAL.sun2); this.frame.setProgress(`ROUND ${this.round + 1}/${ROUNDS}  x${speed.toFixed(1)}`); this.frame.setTimer('');
    // card
    const card = this.add.container(0, 0).setDepth(700); const bg = this.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.9); const p = panel(this, 20, H / 2 - 70, W - 40, 140, [PAL.sun0, PAL.sea1, PAL.dusk2][this.round % 3]);
    const big = first ? micro.word : this.round === ROUNDS - 1 ? 'FINAL' : `ROUND ${this.round + 1}`;
    const word = txt(this, W / 2, H / 2 - 18, big, first ? 40 : 30, PAL.white); const sub = txt(this, W / 2, H / 2 + 34, first ? micro.instr : `${micro.word}  x${speed.toFixed(1)} speed`, 10, PAL.night0); sub.setWordWrapWidth(W - 80).setAlign('center');
    card.add([bg, p, word, sub]); word.setScale(0.4); this.tweens.add({ targets: word, scale: 1, duration: 220, ease: 'Back.Out' });
    // the athlete demonstrates on the card; tap anywhere to start early. Card time does not count against the cap.
    this.athlete.show(true).pose(0); this.athlete.sprite.setDepth(701).setPosition(W / 2, H / 2 - 120); const hint = txt(this, W / 2, H / 2 + 62, 'tap to start', 8, PAL.night0).setAlpha(0.8); card.add(hint);   // the athlete demonstrates above the card
    this.frame.pauseCap();
    let began = false; const begin = () => {
      if (began) return; began = true; cardTimer.remove(); this.input.off('pointerdown', begin); this.input.keyboard?.off('keydown-SPACE', begin);
      card.destroy(); this.frame.resumeCap(); if (!this.frame.active) return; this.current = micro; this.athlete.show(true).pose(0); this.athlete.sprite.setDepth(4).setPosition(W / 2, 330);
      const flash = txt(this, W / 2, H / 2, 'GO', 30, PAL.neon).setDepth(750); this.tweens.add({ targets: flash, alpha: 0, scale: 1.8, duration: 260, onComplete: () => flash.destroy() });
      startMicro();
    };
    const cardTimer = this.time.delayedCall(first ? 1800 : 1000, begin);
    this.time.delayedCall(120, () => { this.input.once('pointerdown', begin); this.input.keyboard?.once('keydown-SPACE', begin); });   // ignore the tap that opened the card
    const startMicro = () => {
      const ctx: MicroCtx = { scene: this, frame: this.frame, speed, window: this.frame.window, hard: this.frame.hard, rng: this.rng, athlete: this.athlete };
      const dur = micro.durationSec / speed * 1000; const t0 = this.time.now;   // later rounds are faster and shorter
      this.countdown = this.add.graphics().setDepth(802);
      const tick = this.time.addEvent({ delay: 50, loop: true, callback: () => { const f = clamp(1 - (this.time.now - t0) / dur, 0, 1); this.countdown!.clear(); this.countdown!.fillStyle(PAL.ink).fillRect(0, 26, W, 6); this.countdown!.fillStyle(f > 0.3 ? PAL.neon : PAL.red).fillRect(0, 26, W * f, 6); } });
      this.ticks.push(tick);
      this.cdTimer = this.time.delayedCall(dur, () => { if (this.current === micro) micro.timeUp(); });
      micro.start(ctx, (score01) => {
        tick.remove(); this.cdTimer?.remove(); this.countdown?.destroy(); this.current = undefined; this.athlete.show(false); this.athlete.sprite.setAngle(0).setScale(1);
        this.scores.push(score01); const ok = score01 >= 0.5;
        if (ok) this.banner(score01 >= 0.9 ? 'PERFECT!' : 'NICE!', PAL.neon);
        else { this.banner('MISS', PAL.red); if (this.loseLife()) { this.time.delayedCall(700, () => this.finishSession(true)); return; } }
        this.round++; this.time.delayedCall(650, () => this.nextRound());
      });
    };
  }
  private banner(s: string, color: number) { const t = txt(this, W / 2, H / 2, s, 26, color).setDepth(750); this.tweens.add({ targets: t, scale: { from: 1.5, to: 1 }, duration: 200, ease: 'Back.Out' }); this.tweens.add({ targets: t, alpha: 0, duration: 250, delay: 380, onComplete: () => t.destroy() }); }
  private finishSession(outOfLives = false) { if (!this.frame.active) return; const s = this.sessionScore(); this.frame.finish(outOfLives ? Math.min(s, 45) : s, outOfLives); }

  /** Pixel hearts under the HUD strip, right side. */
  private drawHearts() {
    const g = this.heartsG; if (!g) return; g.clear(); const max = Math.max(this.lives, 1 + (this.launch.extraLives ?? 0));
    for (let i = 0; i < max; i++) { const x = W - 12 - i * 14, y = 44; const on = i < this.lives; const c = on ? PAL.red : PAL.gray0;
      g.fillStyle(c).fillRect(x - 5, y - 3, 4, 3).fillRect(x + 1, y - 3, 4, 3).fillRect(x - 6, y, 12, 3).fillRect(x - 4, y + 3, 8, 2).fillRect(x - 2, y + 5, 4, 2); if (on) g.fillStyle(PAL.white).fillRect(x - 4, y - 2, 1, 1); }
  }
  /** Lose a life. Returns true if the run is over (no lives left); the caller finishes with its own score. */
  private loseLife(): boolean {
    this.lives = Math.max(0, this.lives - 1); this.drawHearts(); this.frame.shake(160, 0.007); this.frame.flash(PAL.red, 70);
    if (this.lives > 0) { const t = txt(this, W / 2, 80, this.lives === 1 ? 'LAST LIFE' : `${this.lives} LIVES LEFT`, 12, PAL.pink).setDepth(8); this.tweens.add({ targets: t, alpha: 0, y: 60, duration: 900, delay: 300, onComplete: () => t.destroy() }); }
    return this.lives <= 0;
  }
  private loop(cb: () => void) { const t = this.time.addEvent({ delay: 16, loop: true, callback: cb }); this.ticks.push(t); return t; }

  // ---- FERRATA: Zeke's Peak style bouncing climb (unchanged from round 3).
  private ferrata() {
    const F = FERRATA; const ledges: Ledge[] = genLedges(Phaser.Math.Between(1, 10000)); const gone = new Set<number>(); const crumbling = new Map<number, number>();
    const top = ledges[ledges.length - 1]; const flagY = top.y - 40;
    // marble state (world coords: y decreases upward; start ledge at y = 0). Screen y = worldY - camY.
    let mx = ledges[0].x + ledges[0].w / 2, my = -F.radius, vx = 0, vy = -F.bounce, prevY = my, camY = -420, anchorIdx = 0, best = 0, finished = false, tilt = 0;
    let holdL = false, holdR = false, gustT = 0, gustDir = 0, gustNext = 8, t = 0; const t0 = this.time.now;
    const steerHard = 1 - 0.25 * this.frame.hard;
    // input: hold a side (touch/mouse), arrows on desktop, device tilt if the browser already delivers it (never prompted)
    const setHold = (p: Phaser.Input.Pointer | null, down: boolean) => { if (!p) return; if (!down) { holdL = holdR = false; return; } holdL = p.x < W / 2; holdR = !holdL; };
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => setHold(p, true)); this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (p.isDown) setHold(p, true); }); this.input.on('pointerup', () => { holdL = holdR = false; });
    const kb = this.input.keyboard; let kL = false, kR = false; kb?.on('keydown-LEFT', () => { kL = true; }); kb?.on('keyup-LEFT', () => { kL = false; }); kb?.on('keydown-RIGHT', () => { kR = true; }); kb?.on('keyup-RIGHT', () => { kR = false; });
    const onTilt = (e: DeviceOrientationEvent) => { if (typeof e.gamma === 'number') tilt = clamp(e.gamma / 25, -1, 1); }; try { window.addEventListener('deviceorientation', onTilt); } catch { /* not available */ }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { try { window.removeEventListener('deviceorientation', onTilt); } catch { /* noop */ } });
    // art: cliff strata are drawn from the world so they scroll with the camera; marble + flag + wind are graphics too
    const cliff = this.add.graphics().setDepth(2); const marble = this.add.graphics().setDepth(6); const fx = this.add.graphics().setDepth(7); const hint = txt(this, W / 2, 560, 'hold LEFT / RIGHT to steer', 9, PAL.gray1).setDepth(8);
    const heightFrac = () => clamp(-best / -flagY, 0, 1);
    ((this as any)._scoreNow as Record<string, () => number>).ferrata = () => clamp(heightFrac() * 92 - (1 + (this.launch.extraLives ?? 0) - this.lives) * 3, 0, 100);
    const respawn = () => { const a = ledges[anchorIdx]; mx = a.x + a.w / 2; my = a.y - F.radius; vx = 0; vy = -F.bounce; prevY = my; camY = my - 400; holdL = holdR = false; };
    const win = () => { if (finished) return; finished = true; fx.clear(); this.frame.setProgress('SUMMIT'); this.time.delayedCall(350, () => this.frame.finish(clamp(100 - (1 + (this.launch.extraLives ?? 0) - this.lives) * 3, 0, 100))); };
    this.loop(() => {
      if (!this.frame.active || finished) return; const dt = 0.016; t += dt;
      // wind: a gust every ~8 s for 1.2 s, visible as streaks
      if (t > gustNext) { gustDir = Math.random() < 0.5 ? -1 : 1; gustT = 1.2; gustNext = t + 7 + Math.random() * 2.5; }
      const gust = gustT > 0 ? gustDir * 120 * (0.6 + 0.4 * this.launch.difficulty) : 0; if (gustT > 0) gustT -= dt;
      const steer = (holdL || kL ? -1 : 0) + (holdR || kR ? 1 : 0) || (holdL || holdR || kL || kR ? 0 : tilt);
      vx = steer * F.steer * steerHard + gust; vy += F.gravity * dt; prevY = my; my += vy * dt; mx += vx * dt;
      if (mx < F.wallPad + F.radius) { mx = F.wallPad + F.radius; } if (mx > W - F.wallPad - F.radius) { mx = W - F.wallPad - F.radius; }
      // landing: bottom of the marble crosses a ledge top while falling
      if (vy > 0) for (let i = 0; i < ledges.length; i++) { if (gone.has(i)) continue; const l = ledges[i]; if (prevY + F.radius <= l.y + 1 && my + F.radius >= l.y && mx >= l.x - 2 && mx <= l.x + l.w + 2) {
        my = l.y - F.radius; vy = -F.bounce; if (i > best / -F.rise) best = -l.y;
        if (l.kind === 'anchor' && i > anchorIdx) { anchorIdx = i; this.frame.flash(PAL.neon, 40); }
        if (l.kind === 'crumble' && !crumbling.has(i)) crumbling.set(i, 0.25);
        if (i === ledges.length - 1) win(); break; } }
      for (const [i, left] of [...crumbling]) { const n = left - dt; if (n <= 0) { crumbling.delete(i); gone.add(i); } else crumbling.set(i, n); }
      // fell well below the last anchor: a life, then respawn there
      if (my > ledges[anchorIdx].y + 200) { if (this.loseLife()) { finished = true; this.frame.finish(clamp(heightFrac() * 60, 0, 45), true); return; } respawn(); }
      // camera: follow upward smoothly, keep the marble around 60% down the screen
      const targetCam = my - 380; camY += (Math.min(targetCam, camY) - camY) * 0.18; if (targetCam > camY) camY += (targetCam - camY) * 0.06;
      // draw
      cliff.clear(); cliff.fillStyle(PAL.gray0).fillRect(0, 26, W, H - 26);
      for (let yy = Math.floor((camY + 26) / 40) * 40; yy < camY + H; yy += 40) { const sy = yy - camY; cliff.fillStyle(((yy / 40) % 2 === 0) ? PAL.night3 : PAL.gray0).fillRect(0, sy, F.wallPad, 40).fillRect(W - F.wallPad, sy, F.wallPad, 40); cliff.fillStyle(PAL.night2, 0.35).fillRect(F.wallPad, sy + ((yy * 7) % 23), W - F.wallPad * 2, 3); }
      for (let i = 0; i < ledges.length; i++) { if (gone.has(i)) continue; const l = ledges[i]; const sy = l.y - camY; if (sy < 20 || sy > H) continue; const cr = crumbling.get(i);
        const col = l.kind === 'anchor' ? PAL.neon : l.kind === 'crumble' ? PAL.earth2 : l.kind === 'thin' ? PAL.gray2 : PAL.earth3; const a = cr !== undefined ? clamp(cr / 0.25, 0.2, 1) : 1;
        cliff.fillStyle(PAL.ink, a).fillRect(l.x - 1, sy - 1, l.w + 2, 8); cliff.fillStyle(col, a).fillRect(l.x, sy, l.w, 6);
        if (l.kind === 'anchor') { cliff.fillStyle(PAL.ink).fillCircle(l.x + l.w / 2, sy + 3, 3); cliff.fillStyle(i <= anchorIdx ? PAL.sun2 : PAL.gray2).fillCircle(l.x + l.w / 2, sy + 3, 2); }
        if (l.kind === 'crumble') { cliff.fillStyle(PAL.ink, a).fillRect(l.x + 8, sy + 2, 1, 4).fillRect(l.x + l.w - 12, sy, 1, 4); } }
      // flag
      { const sy = flagY - camY; if (sy > 0 && sy < H) { cliff.fillStyle(PAL.gray2).fillRect(top.x + top.w / 2 - 1, sy, 2, 40); cliff.fillStyle(PAL.red).fillTriangle(top.x + top.w / 2 + 1, sy, top.x + top.w / 2 + 22, sy + 7, top.x + top.w / 2 + 1, sy + 14); } }
      marble.clear(); const sy = my - camY; marble.fillStyle(PAL.ink).fillCircle(mx, sy, F.radius + 1); marble.fillStyle(PAL.sun0).fillCircle(mx, sy, F.radius); marble.fillStyle(PAL.sun3).fillRect(mx - 3, sy - 5, 3, 2); marble.fillStyle(PAL.sun1).fillRect(mx - 4, sy + 2, 8, 2);
      fx.clear(); if (gustT > 0) { fx.lineStyle(1, PAL.sky3, 0.8); for (let k = 0; k < 8; k++) { const yy = 40 + ((k * 73 + t * 400) % (H - 60)); const x0 = ((k * 131 + t * 500 * gustDir) % W + W) % W; fx.lineBetween(x0, yy, x0 + 26 * gustDir, yy); } }
      if (t > 3) hint.setAlpha(Math.max(0, 1 - (t - 3)));
      this.meter.set(heightFrac(), PAL.neon); this.frame.setProgress(`${Math.round(heightFrac() * 100)}%`); this.frame.setTimer(`${Math.max(0, Math.ceil(this.frame.capSec - (this.time.now - t0) / 1000))}s${gustT > 0 ? '  WIND' : ''}`);
    });
  }
}
