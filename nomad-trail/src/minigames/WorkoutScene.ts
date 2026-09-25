import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ActivityId, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';
import { genLedges, FERRATA, type Ledge } from './ferrataLevel';
import { Athlete, type Micro, type MicroCtx } from './workout/micro';
import { MICRO_REGISTRY, META, pickSession, seededRng, hashStr, sessionLen } from './workout';

export interface WorkoutPayload { activity: ActivityId; city: string; day?: number; seed?: number; /** dev/test: force these micro-game ids */ plan?: string[]; }
const TITLES: Partial<Record<ActivityId, string>> = { bands: 'Hotel room workout', boulder: 'Bouldering', ferrata: 'Via ferrata', trailrun: 'Trail run', hike: 'Acclimatization hike', swim: 'Open water swim', yoga: 'Yoga', surf: 'Surf', ski: 'Ski day' };

/**
 * Workout: WarioWare-style fitness micro-games that match the activity. Hotel room (bands) and hike chain THREE different games from
 * their pools, each played once at normal speed with a READY card between them; every other activity is a single game. Picked per
 * city+day (seeded). The HUD title is the micro-game's own name (Push-ups, Plank, City Run…); the activity is the small subtitle.
 * Session score = mean of the games. Lives: 1 + extraLives (hiking boots); a game scored under 50% costs a life. Ferrata is the climb.
 */
export class WorkoutScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private activity: ActivityId = 'bands'; private city = '';
  private g!: Phaser.GameObjects.Graphics; private meter!: Meter; private ticks: Phaser.Time.TimerEvent[] = [];
  private lives = 0; private heartsG?: Phaser.GameObjects.Graphics;
  // session
  private athlete!: Athlete; private current?: Micro; private scores: number[] = []; private microIds: string[] = []; private idx = 0; private rng: () => number = Math.random; private countdown?: Phaser.GameObjects.Graphics; private cdTimer?: Phaser.Time.TimerEvent;

  constructor() { super(MINIGAME_KEYS.workout); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = (this.launch.payload || {}) as Partial<WorkoutPayload>;
    this.activity = (p.activity && TITLES[p.activity]) ? p.activity : 'bands'; this.city = p.city || ''; this.ticks = []; this.scores = []; this.idx = 0; this.microIds = []; this.current = undefined;
    const seed = typeof p.seed === 'number' ? p.seed : typeof p.day === 'number' ? hashStr(`${p.city}|${p.day}`) : undefined;
    this.rng = seed !== undefined ? seededRng(seed) : Math.random;
  }

  create() {
    this.frame = new MinigameFrame(this, this.launch, TITLES[this.activity] || 'Workout');
    this.cameras.main.setBackgroundColor(PAL.night1);
    this.g = this.add.graphics().setDepth(3);
    this.meter = new Meter(this, 40, 600, W - 80, 8);
    txt(this, W / 2, 40, [TITLES[this.activity] || 'Workout', this.city].filter(Boolean).join('  ·  ').toUpperCase(), 9, PAL.gray1).setDepth(7);   // the activity is the subtitle; the HUD title is the game's own name
    this.frame.hud();
    this.lives = 1 + (this.launch.extraLives ?? 0); this.heartsG = this.add.graphics().setDepth(801); this.drawHearts();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.ticks.forEach(t => t.remove()); this.current?.destroy(); this.cdTimer?.remove(); });
    if (this.activity === 'ferrata') {
      this.frame.capSec = 1e7;   // no timeout: the climb ends at the flag (or the give-up hatch)
      this.heartsG.setVisible(false);
      const scoreNow: Record<string, () => number> = {}; (this as any)._scoreNow = scoreNow; this.frame.scoreNow = () => (scoreNow.ferrata ? scoreNow.ferrata() : 50);
      this.frame.intro('You bounce on your own. HOLD the left or right side of the screen (or TILT the phone) to steer it onto the next ledge. Green ledges save your progress; a fall just drops you back to the last one. Reach the flag. Faster is better.', () => this.ferrata(), { height: 300 });
      return;
    }
    // ---- the session: one game, or three different ones for the hotel room and the hike
    const forced = ((this.launch.payload || {}) as Partial<WorkoutPayload>).plan?.filter(id => MICRO_REGISTRY[id]);
    this.microIds = forced?.length ? forced : pickSession(this.activity, this.rng, ((this.launch.payload || {}) as any).city);
    this.frame.capSec = this.microIds.length > 1 ? 36 : 30;
    this.athlete = new Athlete(this, W / 2, 330); this.athlete.show(false);
    this.frame.scoreNow = () => this.sessionScore();
    this.nextGame();
  }
  update(_t: number, dt: number) { this.frame.update(dt); }

  private sessionScore() { const done = this.scores.length; if (!done) return 0; return (this.scores.reduce((a, b) => a + b, 0) / Math.max(done, this.microIds.length)) * 100; }

  /** READY card for the next game (its name as the title, the command word, the instruction, the athlete demonstrating) → the game
   *  at normal speed with a countdown bar → result → the next card. Every card waits for READY (tap anywhere / SPACE also start). */
  private nextGame() {
    if (this.frame.finished) return;
    if (this.idx >= this.microIds.length || this.lives <= 0) { this.finishSession(); return; }
    const id = this.microIds[this.idx]; const micro = MICRO_REGISTRY[id](); const meta = META[id]; const first = this.idx === 0; const n = this.microIds.length;
    this.frame.setTitle(meta.name); this.meter.set(this.idx / n, PAL.sun2); this.frame.setProgress(n > 1 ? `GAME ${this.idx + 1}/${n}` : ''); this.frame.setTimer('');
    const extra = (s: Phaser.Scene, add: (o: Phaser.GameObjects.GameObject) => void) => {
      const top = H / 2 - 170; const word = txt(s, W / 2, top + 150, micro.word, 40, PAL.white); add(word); word.setScale(0.4); s.tweens.add({ targets: word, scale: 1, duration: 220, ease: 'Back.Out' });
      if (n > 1) add(txt(s, W / 2, top + 178, first ? `${n} games, each played once` : `game ${this.idx + 1} of ${n}`, 9, PAL.gray1));
      this.athlete.show(true).pose(0); this.athlete.sprite.setDepth(905).setPosition(W / 2, top + 228); add({ destroy: () => { /* the athlete is reused */ } } as any);
    };
    const begin = () => {
      if (this.frame.finished) return; this.current = micro; this.athlete.show(true).pose(0); this.athlete.sprite.setDepth(4).setPosition(W / 2, 330);
      const flash = txt(this, W / 2, H / 2, 'GO', 30, PAL.neon).setDepth(750); this.tweens.add({ targets: flash, alpha: 0, scale: 1.8, duration: 260, onComplete: () => flash.destroy() });
      const ctx: MicroCtx = { scene: this, frame: this.frame, speed: 1, window: this.frame.window, hard: this.frame.hard, rng: this.rng, athlete: this.athlete };
      const dur = micro.durationSec * 1000; const t0 = this.time.now;
      this.countdown = this.add.graphics().setDepth(802);
      const tick = this.time.addEvent({ delay: 50, loop: true, callback: () => { const f = clamp(1 - (this.time.now - t0) / dur, 0, 1); this.countdown!.clear(); this.countdown!.fillStyle(PAL.ink).fillRect(0, 26, W, 6); this.countdown!.fillStyle(f > 0.3 ? PAL.neon : PAL.red).fillRect(0, 26, W * f, 6); } });
      this.ticks.push(tick);
      this.cdTimer = this.time.delayedCall(dur, () => { if (this.current === micro) micro.timeUp(); });
      micro.start(ctx, (score01) => {
        tick.remove(); this.cdTimer?.remove(); this.countdown?.destroy(); this.current = undefined; this.athlete.show(false); this.athlete.sprite.setAngle(0).setScale(1);
        this.scores.push(score01); const ok = score01 >= 0.5;
        if (ok) this.banner(score01 >= 0.9 ? 'PERFECT!' : 'NICE!', PAL.neon);
        else { this.banner('MISS', PAL.red); if (this.loseLife()) { this.time.delayedCall(700, () => this.finishSession(true)); return; } }
        this.idx++; this.time.delayedCall(650, () => this.nextGame());
      });
    };
    const opts = { extra, height: 340, title: meta.name };
    if (first) this.frame.intro(meta.instr, begin, opts); else this.frame.card(meta.instr, begin, opts);
    this.time.delayedCall(150, () => { const go = () => this.frame.ready(); this.input.once('pointerdown', go); });   // tap anywhere also starts (after the tap that opened the card)
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
    const F = FERRATA; const ledges: Ledge[] = genLedges(Phaser.Math.Between(1, 10000));
    const top = ledges[ledges.length - 1]; const flagY = top.y - 40;
    // marble state (world coords: y decreases upward; start ledge at y = 0). Screen y = worldY - camY.
    let mx = ledges[0].x + ledges[0].w / 2, my = -F.radius, vx = 0, vy = -F.bounce, prevY = my, camY = -420, anchorIdx = 0, best = 0, bestIdx = 0, finished = false, tilt = 0, falls = 0;
    let holdL = false, holdR = false, gustT = 0, gustDir = 0, gustNext = 9, t = 0; const t0 = this.time.now; let giveUpBtn: Phaser.GameObjects.GameObject[] = [];
    const giveUpAt = Number(((this.launch.payload || {}) as any).giveUpAt ?? 120);   // seconds; the harness shortens it
    // input: hold a side (touch/mouse), arrows on desktop, device tilt with a 4 degree deadzone if the browser already delivers it (never prompted)
    const setHold = (p: Phaser.Input.Pointer | null, down: boolean) => { if (!p) return; if (!down) { holdL = holdR = false; return; } holdL = p.x < W / 2; holdR = !holdL; };
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => setHold(p, true)); this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (p.isDown) setHold(p, true); }); this.input.on('pointerup', () => { holdL = holdR = false; });
    const kb = this.input.keyboard; let kL = false, kR = false; kb?.on('keydown-LEFT', () => { kL = true; }); kb?.on('keyup-LEFT', () => { kL = false; }); kb?.on('keydown-RIGHT', () => { kR = true; }); kb?.on('keyup-RIGHT', () => { kR = false; });
    const onTilt = (e: DeviceOrientationEvent) => { if (typeof e.gamma === 'number') tilt = Math.abs(e.gamma) < 4 ? 0 : clamp((e.gamma - Math.sign(e.gamma) * 4) / 22, -1, 1); }; try { window.addEventListener('deviceorientation', onTilt); } catch { /* not available */ }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { try { window.removeEventListener('deviceorientation', onTilt); } catch { /* noop */ } });
    // harness hooks: where the next ledge is, and a steer override
    let steerOverride = 0; (this as any).ferr = { hint: () => { const next = ledges[Math.min(ledges.length - 1, bestIdx + 1)]; return { targetX: next.x + next.w / 2, mx, my, vy, finished, falls, t, bestIdx }; }, steer: (d: number) => { steerOverride = d; } };
    const cliff = this.add.graphics().setDepth(2); const marble = this.add.graphics().setDepth(5); const fx = this.add.graphics().setDepth(7); const fig = new Athlete(this, 0, 0); fig.sprite.setDepth(6).setOrigin(0.5, 1).setScale(0.5); let landedT = 0; const hint = txt(this, W / 2, 560, 'hold LEFT / RIGHT (or tilt) to steer', 9, PAL.gray1).setDepth(8);
    const heightFrac = () => clamp(-best / -flagY, 0, 1);
    const timeScore = (secs: number) => clamp(100 - Math.max(0, secs - 25) * (60 / 65), 40, 100);   // 100 at <= 25 s, 40 at 90 s
    ((this as any)._scoreNow as Record<string, () => number>).ferrata = () => clamp(heightFrac() * 60 - falls * 2, 0, 45);
    const respawn = () => { const a = ledges[anchorIdx]; mx = a.x + a.w / 2; my = a.y - F.radius; vx = 0; vy = -F.bounce; prevY = my; camY = my - 400; holdL = holdR = false; falls++; this.frame.flash(PAL.sun1, 60); };
    const win = () => { if (finished) return; finished = true; fx.clear(); this.frame.setProgress('SUMMIT'); const secs = (this.time.now - t0) / 1000; this.time.delayedCall(350, () => this.frame.finish(clamp(timeScore(secs) - falls * 3, 30, 100))); };
    const giveUp = () => { if (finished) return; finished = true; this.frame.finish(clamp(heightFrac() * 60 - falls * 2, 0, 45), true); };
    this.loop(() => {
      if (!this.frame.active || finished) return; const dt = 0.016; t += dt;
      if (t > gustNext) { gustDir = Math.random() < 0.5 ? -1 : 1; gustT = 1.0; gustNext = t + 8 + Math.random() * 3; }
      const gust = gustT > 0 ? gustDir * 60 * (0.6 + 0.4 * this.launch.difficulty) : 0; if (gustT > 0) gustT -= dt;
      const steerIn = steerOverride || ((holdL || kL ? -1 : 0) + (holdR || kR ? 1 : 0) || (holdL || holdR || kL || kR ? 0 : tilt));
      // forgiving control: ease toward the target speed, damp when nothing is held so the marble does not overshoot the ledge
      const targetVx = steerIn * F.steer + gust; vx += (targetVx - vx) * Math.min(1, dt * 10); if (steerIn === 0) vx *= 0.9;
      vy += F.gravity * dt; prevY = my; my += vy * dt; mx += vx * dt;
      if (mx < F.wallPad + F.radius) { mx = F.wallPad + F.radius; vx = 0; } if (mx > W - F.wallPad - F.radius) { mx = W - F.wallPad - F.radius; vx = 0; }
      if (vy > 0) for (let i = 0; i < ledges.length; i++) { const l = ledges[i]; if (prevY + F.radius <= l.y + 1 && my + F.radius >= l.y && mx >= l.x - 3 && mx <= l.x + l.w + 3) {
        my = l.y - F.radius; vy = -F.bounce; landedT = 0.14; if (-l.y > best) best = -l.y; if (i > bestIdx) bestIdx = i;
        if (l.kind === 'anchor' && i > anchorIdx) { anchorIdx = i; this.frame.flash(PAL.neon, 40); }
        if (i === ledges.length - 1) win(); break; } }
      // fell well below the last anchor: no life lost, back to the anchor and a few seconds gone
      if (my > ledges[anchorIdx].y + 200) respawn();
      const targetCam = my - 380; camY += (Math.min(targetCam, camY) - camY) * 0.18; if (targetCam > camY) camY += (targetCam - camY) * 0.06;
      cliff.clear(); cliff.fillStyle(PAL.gray0).fillRect(0, 26, W, H - 26);
      for (let yy = Math.floor((camY + 26) / 40) * 40; yy < camY + H; yy += 40) { const sy = yy - camY; cliff.fillStyle(((yy / 40) % 2 === 0) ? PAL.night3 : PAL.gray0).fillRect(0, sy, F.wallPad, 40).fillRect(W - F.wallPad, sy, F.wallPad, 40); cliff.fillStyle(PAL.night2, 0.35).fillRect(F.wallPad, sy + ((yy * 7) % 23), W - F.wallPad * 2, 3); }
      for (let i = 0; i < ledges.length; i++) { const l = ledges[i]; const sy = l.y - camY; if (sy < 20 || sy > H) continue;
        const col = l.kind === 'anchor' ? PAL.neon : l.kind === 'thin' ? PAL.gray2 : PAL.earth3;
        cliff.fillStyle(PAL.ink).fillRect(l.x - 1, sy - 1, l.w + 2, 8); cliff.fillStyle(col).fillRect(l.x, sy, l.w, 6);
        if (l.kind === 'anchor') { cliff.fillStyle(PAL.ink).fillCircle(l.x + l.w / 2, sy + 3, 3); cliff.fillStyle(i <= anchorIdx ? PAL.sun2 : PAL.gray2).fillCircle(l.x + l.w / 2, sy + 3, 2); } }
      { const sy = flagY - camY; if (sy > 0 && sy < H) { cliff.fillStyle(PAL.gray2).fillRect(top.x + top.w / 2 - 1, sy, 2, 40); cliff.fillStyle(PAL.red).fillTriangle(top.x + top.w / 2 + 1, sy, top.x + top.w / 2 + 22, sy + 7, top.x + top.w / 2 + 1, sy + 14); } }
      marble.clear(); const sy = my - camY; landedT = Math.max(0, landedT - dt);
      // the climber: squats on landing (crouch frame, squashed), springs up with arms up while rising, tucks (crouch) while falling; leans with the steer
      fig.pose(landedT > 0 ? 1 : vy < 0 ? 2 : 1); fig.sprite.setPosition(mx, sy + F.radius + 2).setScale(landedT > 0 ? 0.6 : 0.5, landedT > 0 ? 0.4 : 0.5).setAngle(clamp(vx / F.steer, -1, 1) * 8);
      marble.fillStyle(PAL.ink, 0.3).fillEllipse(mx, sy + F.radius + 3, 22, 5);
      fx.clear(); if (gustT > 0) { fx.lineStyle(1, PAL.sky3, 0.8); for (let k = 0; k < 8; k++) { const yy = 40 + ((k * 73 + t * 400) % (H - 60)); const x0 = ((k * 131 + t * 500 * gustDir) % W + W) % W; fx.lineBetween(x0, yy, x0 + 26 * gustDir, yy); } }
      if (t > 3) hint.setAlpha(Math.max(0, 1 - (t - 3)));
      this.meter.set(heightFrac(), PAL.neon); this.frame.setProgress(`${Math.round(heightFrac() * 100)}%${falls ? `  ·  ${falls} fall${falls > 1 ? 's' : ''}` : ''}`); this.frame.setTimer(`${Math.floor(t)}s${gustT > 0 ? '  WIND' : ''}`);
      // the hatch: nobody is stuck forever
      if (t > giveUpAt && !giveUpBtn.length) { const rb = this.add.rectangle(W / 2, 600, 150, 40, PAL.night0, 0.9).setStrokeStyle(2, PAL.red).setDepth(20).setInteractive({ useHandCursor: true }); const rt = txt(this, W / 2, 600, 'GIVE UP', 12, PAL.red).setDepth(21); rb.on('pointerdown', giveUp); giveUpBtn = [rb, rt]; (this as any).ferr.giveUp = giveUp; }
    });
  }
}
