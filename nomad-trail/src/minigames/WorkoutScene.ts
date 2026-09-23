import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ActivityId, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt, pointerInLeftThird, pointerInRightThird } from './_shared';

export interface WorkoutPayload { activity: ActivityId; city: string; }
const TITLES: Partial<Record<ActivityId, string>> = { bands: 'Hotel room bands', boulder: 'Bouldering', ferrata: 'Via ferrata', trailrun: 'Trail run', hike: 'Acclimatization hike', swim: 'Open water swim' };

/** Location-dependent workouts. Variant chosen by payload.activity; unknown -> bands. */
export class WorkoutScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private activity: ActivityId = 'bands'; private city = '';
  private g!: Phaser.GameObjects.Graphics; private meter!: Meter; private ticks: Phaser.Time.TimerEvent[] = [];

  constructor() { super(MINIGAME_KEYS.workout); }
  init(data: any) { this.launch = normalizeLaunch(data); const p = (this.launch.payload || {}) as Partial<WorkoutPayload>; this.activity = (p.activity && TITLES[p.activity]) ? p.activity : 'bands'; this.city = p.city || ''; this.ticks = []; }

  create() {
    this.frame = new MinigameFrame(this, this.launch, TITLES[this.activity] || 'Workout');
    this.cameras.main.setBackgroundColor(PAL.night1);
    this.g = this.add.graphics().setDepth(3);
    this.meter = new Meter(this, 40, 600, W - 80, 8);
    if (this.city) txt(this, W / 2, 40, this.city.toUpperCase(), 9, PAL.gray1);
    this.frame.hud();
    const run = { bands: () => this.bands(), boulder: () => this.boulder(), ferrata: () => this.ferrata(), trailrun: () => this.trailrun(), hike: () => this.hike(), swim: () => this.swim() } as Record<string, () => void>;
    const instr: Record<string, string> = { bands: 'Tap the lane when the note reaches the line. Left / middle / right.', boulder: 'Tap the holds in order before your grip runs out.', ferrata: 'Tap to clip in when the carabiner swings over the anchor.', trailrun: 'Tap to jump the rocks. 30 seconds.', hike: 'Hold to walk. Keep the pace marker in the green. Too fast = dizzy.', swim: 'Tap LEFT, RIGHT, LEFT, RIGHT to stroke. Stay in your lane.' };
    this.frame.intro(instr[this.activity], () => run[this.activity]());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.ticks.forEach(t => t.remove()));
  }
  update(_t: number, dt: number) { this.frame.update(dt); }
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
    const climber = this.add.rectangle(holds[0].x, 590, 16, 24, PAL.earth3).setDepth(6);
    const kb = this.input.keyboard; kb?.on('keydown-SPACE', () => holds[next]?.obj.emit('pointerdown'));
    this.loop(() => { if (!this.frame.active) return; grip -= drain * 0.016; this.meter.set(grip, grip > 0.3 ? PAL.neon : PAL.red); this.frame.setTimer('GRIP'); if (grip <= 0) this.frame.finish((next / n) * 45, true); });
  }

  // ---- FERRATA: clip-in timing on a scrolling cliff.
  private ferrata() {
    const total = 10; let clipped = 0, tries = 0, t = 0, anchorIdx = 0; const win = 22 * this.frame.window + 8; const swingSpd = 2.2 * this.frame.speed;
    const anchors: number[] = []; for (let i = 0; i < total; i++) anchors.push(W / 2 + (i % 2 ? 60 : -60) + Phaser.Math.Between(-20, 20));
    let cliffY = 0; const climber = this.add.rectangle(W / 2, 470, 16, 26, PAL.sun0).setDepth(6); const cara = this.add.graphics().setDepth(7);
    this.loop(() => { t += 0.016; cliffY = anchorIdx * 60;
      this.g.clear(); this.g.fillStyle(PAL.gray0).fillRect(0, 60, W, 520); for (let i = 0; i < 14; i++) { const y = ((i * 44 + cliffY) % 520) + 60; this.g.fillStyle(PAL.gray1, 0.5).fillRect(20 + (i * 37) % 300, y, 30, 6); }
      this.g.lineStyle(3, PAL.gray2).beginPath(); for (let i = 0; i < total; i++) { const y = 380 - (i - anchorIdx) * 60; if (i === 0) this.g.moveTo(anchors[i], y); else this.g.lineTo(anchors[i], y); } this.g.strokePath();
      for (let i = 0; i < total; i++) { const y = 380 - (i - anchorIdx) * 60; if (y < 40 || y > 600) continue; this.g.fillStyle(i < anchorIdx ? PAL.neon : PAL.sun2).fillCircle(anchors[i], y, 7); this.g.fillStyle(PAL.ink).fillCircle(anchors[i], y, 3); }
      const cx = W / 2 + Math.sin(t * swingSpd) * 110; cara.clear(); cara.lineStyle(2, PAL.sun2).strokeCircle(cx, 380, 9); cara.lineStyle(1, PAL.gray2).lineBetween(cx, 389, climber.x, climber.y - 12);
      if (anchorIdx < total) { const a = anchors[anchorIdx]; this.g.fillStyle(PAL.neon, 0.2).fillRect(a - win, 366, win * 2, 28); }
      (cara as any).cx = cx; this.meter.set(clipped / total); this.frame.setProgress(`${clipped}/${total}`); });
    this.frame.onTap(() => { if (anchorIdx >= total) return; tries++; const cx = (cara as any).cx as number; if (Math.abs(cx - anchors[anchorIdx]) <= win) { clipped++; anchorIdx++; this.tweens.add({ targets: climber, x: anchors[anchorIdx - 1], y: 470, duration: 250 }); this.frame.flash(PAL.neon, 40); if (anchorIdx >= total) this.frame.finish((clipped / tries) * 100); } else { this.frame.shake(150, 0.006); this.tweens.add({ targets: climber, y: 490, duration: 100, yoyo: true }); if (tries - clipped >= 6) this.frame.finish((clipped / total) * 45, true); } });
  }

  // ---- TRAILRUN: one-lane runner.
  private trailrun() {
    const dur = 30, groundY = 500; let vy = 0, y = groundY, onGround = true, hits = 0, t0 = this.time.now, rocks: { x: number; w: number; h: number; hit: boolean }[] = [], nextRock = 0, dist = 0; const spd = 160 * this.frame.speed;
    const runner = this.add.rectangle(80, groundY - 14, 16, 28, PAL.sun0).setDepth(6);
    const jump = () => { if (onGround) { vy = -420 * (1 - 0.15 * this.frame.hard); onGround = false; } };
    this.frame.onTap(jump); this.input.keyboard?.on('keydown-UP', jump);
    this.loop(() => { const dt = 0.016; const el = (this.time.now - t0) / 1000; dist += spd * dt; if (el > nextRock) { rocks.push({ x: W + 20, w: Phaser.Math.Between(14, 26), h: Phaser.Math.Between(14, 28), hit: false }); nextRock = el + Phaser.Math.FloatBetween(0.9, 1.7) / this.frame.speed; }
      vy += 1100 * dt; y += vy * dt; if (y >= groundY) { y = groundY; vy = 0; onGround = true; } runner.y = y - 14; runner.scaleY = onGround ? 1 : 0.9;
      this.g.clear(); this.g.fillStyle(PAL.sky1).fillRect(0, 60, W, 440); this.g.fillStyle(PAL.grass0).fillRect(0, groundY, W, 100); this.g.fillStyle(PAL.earth2).fillRect(0, groundY, W, 6);
      for (let i = 0; i < 5; i++) { const mx = ((i * 140 - dist * 0.3) % (W + 140) + W + 140) % (W + 140) - 70; this.g.fillStyle(PAL.night3).fillTriangle(mx, groundY, mx + 70, groundY - 120 - i * 10, mx + 140, groundY); }
      for (const r of rocks) { r.x -= spd * dt; this.g.fillStyle(r.hit ? PAL.red : PAL.gray1).fillRect(r.x, groundY - r.h, r.w, r.h); if (!r.hit && r.x < 88 && r.x + r.w > 72 && y > groundY - r.h + 4) { r.hit = true; hits++; this.frame.shake(120, 0.006); this.frame.flash(PAL.red, 60); } }
      rocks = rocks.filter(r => r.x > -40); this.frame.setTimer(`${Math.max(0, Math.ceil(dur - el))}s`); this.frame.setProgress(`${hits} trips`); this.meter.set(el / dur, PAL.sun2);
      if (el >= dur) this.frame.finish(100 - hits * 18); });
  }

  // ---- HIKE: pace meter with altitude.
  private hike() {
    const target = 800; let alt = 0, pace = 0, holding = false, inBand = 0, total = 0, dizzy = 0, dizzyEvents = 0; const band: [number, number] = [0.42 - 0.08 * (1 - this.frame.window), 0.66 + 0.06 * this.frame.window];
    const down = () => { holding = true; }, up = () => { holding = false; }; this.input.on('pointerdown', down); this.input.on('pointerup', up); this.input.keyboard?.on('keydown-SPACE', down); this.input.keyboard?.on('keyup-SPACE', up);
    const warn = txt(this, W / 2, 120, '', 14, PAL.pink).setDepth(8); const hiker = this.add.rectangle(W / 2, 470, 14, 24, PAL.sun0).setDepth(6);
    this.loop(() => { if (!this.frame.active) return; const dt = 0.016; pace = clamp(pace + (holding ? 0.9 : -0.7) * dt * (1 + 0.4 * this.frame.hard), 0, 1); alt += pace * 45 * dt; total += dt;
      const ok = pace >= band[0] && pace <= band[1]; if (ok) inBand += dt; if (pace > band[1]) dizzy += dt; else dizzy = Math.max(0, dizzy - dt * 2);
      if (dizzy > 1.5) { dizzyEvents++; dizzy = 0; pace = 0.1; this.frame.shake(300, 0.01); warn.setText('DIZZY. Slow down.'); this.time.delayedCall(1200, () => warn.setText('')); }
      this.g.clear(); const skyT = clamp(alt / target, 0, 1); this.g.fillStyle(PAL.sky1).fillRect(0, 60, W, 500); this.g.fillStyle(PAL.sky2, 1 - skyT).fillRect(0, 60, W, 500);
      for (let i = 0; i < 6; i++) { const y = 560 - ((i * 90 + alt) % 540); this.g.fillStyle(i % 2 ? PAL.earth2 : PAL.earth1).fillRect(0, y, W, 4); } this.g.fillStyle(PAL.white).fillTriangle(W / 2 - 90, 220, W / 2, 90, W / 2 + 90, 220); this.g.fillStyle(PAL.gray2).fillRect(W / 2 - 80, 220, 160, 8);
      hiker.y = 470 + Math.sin(total * (4 + pace * 8)) * 2 * pace; this.meter.set(pace, ok ? PAL.neon : pace > band[1] ? PAL.red : PAL.sun2, band); this.frame.setProgress(`${Math.round(3500 + alt)} m`); this.frame.setTimer(ok ? 'good pace' : pace > band[1] ? 'too fast' : holding ? '' : 'walk');
      if (alt >= target) this.frame.finish(clamp((inBand / total) * 100 + 15 - dizzyEvents * 15, 0, 100)); if (total > 60) this.frame.finish((inBand / total) * 60); });
  }

  // ---- SWIM: alternate taps, stay in lane.
  private swim() {
    const total = 20; let strokes = 0, last = -1, drift = 0, wrong = 0, dist = 0; const laneW = 60;
    const swimmer = this.add.rectangle(W / 2, 420, 14, 30, PAL.sun0).setDepth(6);
    const stroke = (side: number) => { if (side !== last) { strokes++; last = side; drift += (side === 0 ? -1 : 1) * 4; dist += 10; this.tweens.add({ targets: swimmer, angle: side === 0 ? -12 : 12, duration: 100 }); } else { wrong++; drift += (side === 0 ? -1 : 1) * 16 * (1 + this.frame.hard); this.frame.shake(60, 0.002); }
      this.frame.setProgress(`${strokes}/${total}`); if (strokes >= total) this.frame.finish(clamp(100 - wrong * 12 - Math.abs(drift) * 0.4, 0, 100)); };
    this.frame.onTap(p => { if (!p) return; stroke(p.x < W / 2 ? 0 : 1); }); this.input.keyboard?.on('keydown-LEFT', () => stroke(0)); this.input.keyboard?.on('keydown-RIGHT', () => stroke(1));
    this.loop(() => { drift *= 0.985; swimmer.x = W / 2 + drift; this.g.clear(); this.g.fillStyle(PAL.sea1).fillRect(0, 60, W, 520); for (let i = 0; i < 12; i++) this.g.fillStyle(PAL.sea2, 0.35).fillRect((i * 37 + dist * 3) % W, 60 + ((i * 53 + dist * 5) % 520), 20, 2);
      this.g.fillStyle(PAL.sea3, 0.5).fillRect(W / 2 - laneW, 60, 3, 520).fillRect(W / 2 + laneW, 60, 3, 520); this.meter.set(strokes / total); if (Math.abs(drift) > laneW - 8) { this.frame.finish(clamp(strokes / total * 45, 0, 45), true); } });
  }
}
