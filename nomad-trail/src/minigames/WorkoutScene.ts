import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ActivityId, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt, pointerInLeftThird, pointerInRightThird } from './_shared';
import { genLedges, FERRATA, type Ledge } from './ferrataLevel';

export interface WorkoutPayload { activity: ActivityId; city: string; }
const TITLES: Partial<Record<ActivityId, string>> = { bands: 'Hotel room bands', boulder: 'Bouldering', ferrata: 'Via ferrata', trailrun: 'Trail run', hike: 'Acclimatization hike', swim: 'Open water swim' };
/** Outdoor variants start with 1 life + launch.extraLives (hiking boots). Indoor ones (bands, swim) have no lives. */
const OUTDOOR = new Set<ActivityId>(['trailrun', 'hike', 'ferrata', 'boulder']);

/** Location-dependent workouts. Variant chosen by payload.activity; unknown -> bands. */
export class WorkoutScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private activity: ActivityId = 'bands'; private city = '';
  private g!: Phaser.GameObjects.Graphics; private meter!: Meter; private ticks: Phaser.Time.TimerEvent[] = [];
  private lives = 0; private heartsG?: Phaser.GameObjects.Graphics;

  constructor() { super(MINIGAME_KEYS.workout); }
  init(data: any) { this.launch = normalizeLaunch(data); const p = (this.launch.payload || {}) as Partial<WorkoutPayload>; this.activity = (p.activity && TITLES[p.activity]) ? p.activity : 'bands'; this.city = p.city || ''; this.ticks = []; }

  create() {
    this.frame = new MinigameFrame(this, this.launch, TITLES[this.activity] || 'Workout');
    this.cameras.main.setBackgroundColor(PAL.night1);
    this.g = this.add.graphics().setDepth(3);
    this.meter = new Meter(this, 40, 600, W - 80, 8);
    if (this.city) txt(this, W / 2, 40, this.city.toUpperCase(), 9, PAL.gray1);
    this.frame.hud();
    if (OUTDOOR.has(this.activity)) { this.lives = 1 + (this.launch.extraLives ?? 0); this.heartsG = this.add.graphics().setDepth(801); this.drawHearts(); }
    if (this.activity === 'ferrata') this.frame.capSec = 35;
    const run = { bands: () => this.bands(), boulder: () => this.boulder(), ferrata: () => this.ferrata(), trailrun: () => this.trailrun(), hike: () => this.hike(), swim: () => this.swim() } as Record<string, () => void>;
    const instr: Record<string, string> = { bands: 'Tap the lane when the note reaches the line. Left / middle / right.', boulder: 'Tap the holds in order before your grip runs out.', ferrata: 'The marble bounces on its own. Hold LEFT or RIGHT to steer it up the ledges. Green ledges save your progress. Reach the flag.', trailrun: 'Tap to jump the rocks. 25 seconds. It gets faster.', hike: 'Hold to walk. Keep the pace marker in the green. Too fast = dizzy. 30 seconds.', swim: 'Tap LEFT, RIGHT, LEFT, RIGHT to stroke. Stay in your lane.' };
    const scoreNow: Record<string, () => number> = {}; (this as any)._scoreNow = scoreNow;
    this.frame.scoreNow = () => (scoreNow[this.activity] ? scoreNow[this.activity]() : 50);
    this.frame.intro(instr[this.activity], () => run[this.activity]());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.ticks.forEach(t => t.remove()));
  }
  update(_t: number, dt: number) { this.frame.update(dt); }
  /** Pixel hearts under the HUD strip, right side. */
  private drawHearts() {
    const g = this.heartsG; if (!g) return; g.clear(); const max = Math.max(this.lives, 1 + (this.launch.extraLives ?? 0));
    for (let i = 0; i < max; i++) { const x = W - 12 - i * 14, y = 40; const on = i < this.lives; const c = on ? PAL.red : PAL.gray0;
      g.fillStyle(c).fillRect(x - 5, y - 3, 4, 3).fillRect(x + 1, y - 3, 4, 3).fillRect(x - 6, y, 12, 3).fillRect(x - 4, y + 3, 8, 2).fillRect(x - 2, y + 5, 4, 2); if (on) g.fillStyle(PAL.white).fillRect(x - 4, y - 2, 1, 1); }
  }
  /** Lose a life. Returns true if the run is over (no lives left); the caller finishes with its own score. */
  private loseLife(): boolean {
    this.lives = Math.max(0, this.lives - 1); this.drawHearts(); this.frame.shake(160, 0.007); this.frame.flash(PAL.red, 70);
    if (this.lives > 0) { const t = txt(this, W / 2, 80, this.lives === 1 ? 'LAST LIFE' : `${this.lives} LIVES LEFT`, 12, PAL.pink).setDepth(8); this.tweens.add({ targets: t, alpha: 0, y: 60, duration: 900, delay: 300, onComplete: () => t.destroy() }); }
    return this.lives <= 0;
  }
  private loop(cb: () => void) { const t = this.time.addEvent({ delay: 16, loop: true, callback: cb }); this.ticks.push(t); return t; }

  // ---- BANDS: 3-lane rhythm.
  private bands() {
    const lanes = [W / 6, W / 2, (5 * W) / 6], hitY = 520, total = 20; const fall = 1500 / this.frame.speed; const win = 34 * this.frame.window + 10;
    const notes: { lane: number; t0: number; hit: boolean; obj: Phaser.GameObjects.Rectangle }[] = []; let spawned = 0, hits = 0, judged = 0; const t0 = this.time.now;
    const interval = 650;
    const spawn = this.time.addEvent({ delay: interval, repeat: total - 1, callback: () => { const lane = Phaser.Math.Between(0, 2); const r = this.add.rectangle(lanes[lane], 100, 44, 14, PAL.sun1).setDepth(4); notes.push({ lane, t0: this.time.now, hit: false, obj: r }); spawned++; } });
    this.ticks.push(spawn);
    // static: lanes + hit line + a nomad doing band pulls
    this.g.fillStyle(PAL.night2).fillRect(0, 60, W, 500); lanes.forEach(x => this.g.fillStyle(PAL.night3).fillRect(x - 30, 60, 60, 500)); this.g.fillStyle(PAL.neon).fillRect(0, hitY - 1, W, 2);
    const body = this.add.rectangle(W / 2, 580, 18, 26, PAL.earth3).setDepth(4); const band = this.add.rectangle(W / 2, 566, 60, 3, PAL.red).setDepth(5);
    const judge = (lane: number) => { let best: typeof notes[0] | undefined, bd = 1e9; for (const n of notes) { if (n.hit) continue; const y = 100 + ((this.time.now - n.t0) / fall) * (hitY - 100); const d = Math.abs(y - hitY); if (n.lane === lane && d < bd) { bd = d; best = n; } }
      if (best && bd <= win) { best.hit = true; hits++; judged++; best.obj.setFillStyle(PAL.neon); this.tweens.add({ targets: best.obj, alpha: 0, scaleX: 1.6, duration: 120, onComplete: () => best!.obj.destroy() }); this.tweens.add({ targets: band, scaleX: { from: 1.4, to: 1 }, duration: 120 }); } else { this.frame.shake(50, 0.002); }
      this.frame.setProgress(`${hits}/${total}`); };
    ((this as any)._scoreNow as Record<string, () => number>).bands = () => (hits / total) * 100;
    this.frame.onTap(p => { if (!p) { judge(1); return; } judge(pointerInLeftThird(p) ? 0 : pointerInRightThird(p) ? 2 : 1); });
    const kb = this.input.keyboard; kb?.on('keydown-LEFT', () => judge(0)); kb?.on('keydown-DOWN', () => judge(1)); kb?.on('keydown-RIGHT', () => judge(2)); kb?.on('keydown-ONE', () => judge(0)); kb?.on('keydown-TWO', () => judge(1)); kb?.on('keydown-THREE', () => judge(2));
    this.loop(() => { for (const n of notes) { if (n.hit) continue; const y = 100 + ((this.time.now - n.t0) / fall) * (hitY - 100); n.obj.y = y; if (y > hitY + win + 6) { n.hit = true; judged++; n.obj.setFillStyle(PAL.red); this.tweens.add({ targets: n.obj, alpha: 0, duration: 200, onComplete: () => n.obj.destroy() }); } }
      body.y = 580 + Math.sin(this.time.now / 120) * 1; this.meter.set(hits / total); this.frame.setTimer(`${Math.max(0, Math.ceil((total * interval + fall + 400 - (this.time.now - t0)) / 1000))}s`);
      if (spawned >= total && judged >= total) this.frame.finish((hits / total) * 100); });
  }

  // ---- BOULDER: route reading.
  private boulder() {
    const n = 8; let next = 0, grip = 1; const drain = (0.028 + 0.03 * this.launch.difficulty + 0.04 * this.frame.hard);
    this.g.fillStyle(PAL.earth1).fillRect(20, 60, W - 40, 520); for (let i = 0; i < 60; i++) this.g.fillStyle(PAL.earth0, 0.5).fillRect(Phaser.Math.Between(24, W - 34), Phaser.Math.Between(64, 570), Phaser.Math.Between(4, 14), Phaser.Math.Between(2, 6));
    const holds: { x: number; y: number; obj: Phaser.GameObjects.Container }[] = [];
    for (let i = 0; i < n; i++) { const x = 60 + ((i % 2) ? 1 : -1) * Phaser.Math.Between(20, 110) + W / 2 - 60, y = 540 - i * 60 + Phaser.Math.Between(-10, 10); const c = this.add.container(clamp(x, 40, W - 40), y).setDepth(5);
      const col = [PAL.sun0, PAL.sky1, PAL.grass2, PAL.pink][i % 4]; c.add(this.add.ellipse(0, 0, 40 * this.frame.window + 12, 26 * this.frame.window + 8, col)); c.add(txt(this, 0, 0, `${i + 1}`, 11, PAL.ink)); c.setSize(60, 44).setInteractive({ useHandCursor: true }); holds.push({ x: c.x, y: c.y, obj: c });
      c.on('pointerdown', () => { if (!this.frame.active) return; const idx = holds.indexOf(holds.find(h => h.obj === c)!); if (idx === next) { next++; grip = Math.min(1, grip + 0.06); climber.setPosition(c.x, c.y + 26); this.frame.flash(PAL.neon, 30); c.setAlpha(0.35); this.frame.setProgress(`${next}/${n}`); if (next >= n) this.frame.finish(70 + 30 * grip); } else { grip -= 0.12; this.frame.shake(80, 0.003); } }); }
    const climber = this.add.rectangle(holds[0].x, 590, 16, 24, PAL.earth3).setDepth(6); ((this as any)._scoreNow as Record<string, () => number>).boulder = () => (next / n) * 70 + 30 * grip * (next / n);
    const kb = this.input.keyboard; kb?.on('keydown-SPACE', () => holds[next]?.obj.emit('pointerdown'));
    this.loop(() => { if (!this.frame.active) return; grip -= drain * 0.016; this.meter.set(grip, grip > 0.3 ? PAL.neon : PAL.red); this.frame.setTimer('GRIP'); if (grip <= 0) { if (this.loseLife()) this.frame.finish((next / n) * 45, true); else grip = 0.6; } });
  }

  // ---- FERRATA: Zeke's Peak style. A marble that bounces on every landing; you only steer. Ledges stagger, some crumble, anchors save progress.
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

  // ---- TRAILRUN: one-lane runner.
  private trailrun() {
    const dur = 25, groundY = 500; let vy = 0, y = groundY, onGround = true, hits = 0, t0 = this.time.now, rocks: { x: number; w: number; h: number; hit: boolean }[] = [], nextRock = 0, dist = 0; const spd = 160 * this.frame.speed;
    const runner = this.add.rectangle(80, groundY - 14, 16, 28, PAL.sun0).setDepth(6);
    const jump = () => { if (onGround) { vy = -420 * (1 - 0.15 * this.frame.hard); onGround = false; } };
    ((this as any)._scoreNow as Record<string, () => number>).trailrun = () => 100 - hits * 18;
    this.frame.onTap(jump); this.input.keyboard?.on('keydown-UP', jump);
    this.loop(() => { const dt = 0.016; const el = (this.time.now - t0) / 1000; const rp = 1 + 0.6 * clamp(el / dur, 0, 1); dist += spd * rp * dt; if (el > nextRock) { rocks.push({ x: W + 20, w: Phaser.Math.Between(14, 26), h: Phaser.Math.Between(14, 28), hit: false }); nextRock = el + Phaser.Math.FloatBetween(0.9, 1.7) / (this.frame.speed * rp); }
      vy += 1100 * dt; y += vy * dt; if (y >= groundY) { y = groundY; vy = 0; onGround = true; } runner.y = y - 14; runner.scaleY = onGround ? 1 : 0.9;
      this.g.clear(); this.g.fillStyle(PAL.sky1).fillRect(0, 60, W, 440); this.g.fillStyle(PAL.grass0).fillRect(0, groundY, W, 100); this.g.fillStyle(PAL.earth2).fillRect(0, groundY, W, 6);
      // mountains: period covers screen + a full mountain width so a peak only wraps once it is entirely off the left edge
      const MW = 140, period = W + MW; for (let i = 0; i < 5; i++) { const mx = ((i * 100 - dist * 0.3) % period + period) % period - MW; this.g.fillStyle(PAL.night3).fillTriangle(mx, groundY, mx + MW / 2, groundY - 120 - i * 10, mx + MW, groundY); }
      for (const r of rocks) { r.x -= spd * rp * dt; this.g.fillStyle(r.hit ? PAL.red : PAL.gray1).fillRect(r.x, groundY - r.h, r.w, r.h); if (!r.hit && r.x < 88 && r.x + r.w > 72 && y > groundY - r.h + 4) { r.hit = true; hits++; if (this.loseLife()) { this.frame.finish(clamp((el / dur) * 60, 0, 45), true); return; } } }
      rocks = rocks.filter(r => r.x > -40); this.frame.setTimer(`${Math.max(0, Math.ceil(dur - el))}s`); this.frame.setProgress(`${hits} trips`); this.meter.set(el / dur, PAL.sun2);
      if (el >= dur) this.frame.finish(100 - hits * 18); });
  }

  // ---- HIKE: pace meter with altitude.
  private hike() {
    const target = 600, dur = 30; let alt = 0, pace = 0, holding = false, inBand = 0, total = 0, dizzy = 0, dizzyEvents = 0; const band: [number, number] = [0.42 - 0.08 * (1 - this.frame.window), 0.66 + 0.06 * this.frame.window];
    const down = () => { holding = true; }, up = () => { holding = false; }; this.input.on('pointerdown', down); this.input.on('pointerup', up); this.input.keyboard?.on('keydown-SPACE', down); this.input.keyboard?.on('keyup-SPACE', up);
    const warn = txt(this, W / 2, 120, '', 14, PAL.pink).setDepth(8); const hiker = this.add.rectangle(W / 2, 470, 14, 24, PAL.sun0).setDepth(6);
    ((this as any)._scoreNow as Record<string, () => number>).hike = () => clamp((total ? inBand / total : 0) * 100 * clamp(alt / target + 0.4, 0, 1) - dizzyEvents * 15, 0, 100);
    this.loop(() => { if (!this.frame.active) return; const dt = 0.016; pace = clamp(pace + (holding ? 0.9 : -0.7) * dt * (1 + 0.4 * this.frame.hard), 0, 1); alt += pace * 45 * dt; total += dt;
      const ok = pace >= band[0] && pace <= band[1]; if (ok) inBand += dt; if (pace > band[1]) dizzy += dt; else dizzy = Math.max(0, dizzy - dt * 2);
      if (dizzy > 1.5) { dizzyEvents++; dizzy = 0; pace = 0.1; this.frame.shake(300, 0.01); warn.setText(dizzyEvents % 3 === 0 ? 'DIZZY. You sit down. Hard.' : `DIZZY. Slow down. (${dizzyEvents % 3}/3)`); this.time.delayedCall(1200, () => warn.setText('')); if (dizzyEvents % 3 === 0 && this.loseLife()) { this.frame.finish(clamp((inBand / Math.max(total, 1)) * 100 * clamp(alt / target + 0.4, 0, 1) - dizzyEvents * 15, 0, 45), true); return; } }
      this.g.clear(); const skyT = clamp(alt / target, 0, 1); this.g.fillStyle(PAL.sky1).fillRect(0, 60, W, 500); this.g.fillStyle(PAL.sky2, 1 - skyT).fillRect(0, 60, W, 500);
      for (let i = 0; i < 6; i++) { const y = 560 - ((i * 90 + alt) % 540); this.g.fillStyle(i % 2 ? PAL.earth2 : PAL.earth1).fillRect(0, y, W, 4); } this.g.fillStyle(PAL.white).fillTriangle(W / 2 - 90, 220, W / 2, 90, W / 2 + 90, 220); this.g.fillStyle(PAL.gray2).fillRect(W / 2 - 80, 220, 160, 8);
      hiker.y = 470 + Math.sin(total * (4 + pace * 8)) * 2 * pace; this.meter.set(pace, ok ? PAL.neon : pace > band[1] ? PAL.red : PAL.sun2, band); this.frame.setProgress(`${Math.round(3500 + alt)} m`); this.frame.setTimer(`${Math.max(0, Math.ceil(dur - total))}s  ${ok ? 'good pace' : pace > band[1] ? 'too fast' : holding ? '' : 'walk'}`);
      if (alt >= target) this.frame.finish(clamp((inBand / total) * 100 + 15 - dizzyEvents * 15, 0, 100)); else if (total >= dur) this.frame.finish(clamp((inBand / total) * 100 * clamp(alt / target + 0.4, 0, 1) - dizzyEvents * 15, 0, 100)); });
  }

  // ---- SWIM: alternate taps, stay in lane.
  private swim() {
    const total = 20; let strokes = 0, last = -1, drift = 0, wrong = 0, dist = 0; const laneW = 60;
    const swimmer = this.add.rectangle(W / 2, 420, 14, 30, PAL.sun0).setDepth(6); ((this as any)._scoreNow as Record<string, () => number>).swim = () => clamp((strokes / total) * 100 - wrong * 12 - Math.abs(drift) * 0.4, 0, 100);
    const stroke = (side: number) => { if (side !== last) { strokes++; last = side; drift += (side === 0 ? -1 : 1) * 4; dist += 10; this.tweens.add({ targets: swimmer, angle: side === 0 ? -12 : 12, duration: 100 }); } else { wrong++; drift += (side === 0 ? -1 : 1) * 16 * (1 + this.frame.hard); this.frame.shake(60, 0.002); }
      this.frame.setProgress(`${strokes}/${total}`); if (strokes >= total) this.frame.finish(clamp(100 - wrong * 12 - Math.abs(drift) * 0.4, 0, 100)); };
    this.frame.onTap(p => { if (!p) return; stroke(p.x < W / 2 ? 0 : 1); }); this.input.keyboard?.on('keydown-LEFT', () => stroke(0)); this.input.keyboard?.on('keydown-RIGHT', () => stroke(1));
    this.loop(() => { drift *= 0.985; swimmer.x = W / 2 + drift; this.g.clear(); this.g.fillStyle(PAL.sea1).fillRect(0, 60, W, 520); for (let i = 0; i < 12; i++) this.g.fillStyle(PAL.sea2, 0.35).fillRect((i * 37 + dist * 3) % W, 60 + ((i * 53 + dist * 5) % 520), 20, 2);
      this.g.fillStyle(PAL.sea3, 0.5).fillRect(W / 2 - laneW, 60, 3, 520).fillRect(W / 2 + laneW, 60, 3, 520); this.meter.set(strokes / total); if (Math.abs(drift) > laneW - 8) { this.frame.finish(clamp(strokes / total * 45, 0, 45), true); } });
  }
}
