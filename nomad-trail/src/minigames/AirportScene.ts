import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';
import { genFork, genDoors } from './gateForks';

/**
 * GATE DASH: the taxi died on the way to the airport; run to your gate. Temple-Run down a terminal corridor.
 * An instruction card (gate, the three controls, the fork rule) stays up until READY is tapped; the boarding clock starts then.
 * Swipe left/right (or tap the left/right third) to change lane, swipe up (or tap the middle) to jump. Arrows on desktop.
 * Every so often the corridor ends at a T-junction wall far ahead with two gate-range signs (always disjoint and complementary, exactly
 * one holds your gate: see gateForks.ts); it holds at the horizon then approaches at a fixed pace (≥ 5 s of reading, text 12 → 16 px).
 * Be in the left or right lane when you reach it and you TURN that way (a 0.9 s transition: the side opening wipes over the screen,
 * the new corridor fades in, no obstacles for 1.5 s); the
 * middle lane runs into the wall (PICK A SIDE). A wrong side turns into a dead end: WRONG WAY, U-turn, 3 s lost, the fork repeats.
 * Five forks narrow the gate down (letters → letter → numbers → numbers → the door itself across the three lanes).
 * Payload: { gate?: string } like 'B56'. Boarding closes 60 s after READY. Score: 100 − 8 per wrong turn − 1 per collision (−4 each beyond two).
 */
type ObKind = 'traveller' | 'bag' | 'rope' | 'cart' | 'walkway';
interface Ob { kind: ObKind; lane: number; z: number; hit?: boolean; used?: boolean; }
interface Fork { z: number; hold: number; left: string; right: string; correct: number; doors?: string[]; resolved?: boolean; }
const HORIZON = 210, FLOOR = 560, VX = W / 2;
const LANE_NEAR = 96, LANE_FAR = 12;
const BOARDING_SEC = 60, FORK_HOLD = 2.0, FORK_APPROACH = 0.3, FORK_GAP = 2.0, FIRST_FORK = 2.0, TURN_SEC = 0.9, CLEAR_AFTER_TURN = 1.5;
const BASE_SPEED = 0.375;   // corridor depth per second (25% slower than round 9)

export class AirportScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private gateLetter = 'B'; private gateNum = 56;
  lane = 1; private laneX = 0; private jumpT = -1; private speed = 0.5; private boost = 0; private dist = 0; private elapsed = 0;
  private obstacles: Ob[] = []; private fork?: Fork; private stage = 0; private nextForkAt = FIRST_FORK; private nextObAt = 1.0;
  private wrong = 0; private collisions = 0; private penalty = 0; private stunned = 0; private iframes = 0; private ended = false; private uturn = 0;
  /** waiting = instruction card up; turning = the 90° sweep; deadEnd = the wall after a wrong turn (z), -1 when none */
  waiting = true; private turning?: { dir: number; t: number; ok: boolean; wall?: Fork; swapped?: boolean }; private deadEnd = -1; private ox = 0;
  private runner!: Phaser.GameObjects.Sprite; private signL!: Phaser.GameObjects.Text; private signR!: Phaser.GameObjects.Text; private signM!: Phaser.GameObjects.Text;
  private banner?: Phaser.GameObjects.Text; private runT = 0; private card: Phaser.GameObjects.GameObject[] = [];
  private sx = 0; private sy = 0; private swiped = false;

  constructor() { super(MINIGAME_KEYS.airport); }
  init(data: any) {
    this.launch = normalizeLaunch(data);
    const gate = String(this.launch.payload?.gate ?? 'B56').toUpperCase(); const m = /^([A-F])(\d{1,2})$/.exec(gate);
    this.gateLetter = m ? m[1] : 'B'; this.gateNum = m ? clamp(parseInt(m[2], 10), 1, 99) : 56;
    this.lane = 1; this.jumpT = -1; this.dist = 0; this.elapsed = 0; this.obstacles = []; this.fork = undefined; this.stage = 0; this.nextForkAt = FIRST_FORK; this.nextObAt = 1.0;
    this.wrong = 0; this.collisions = 0; this.penalty = 0; this.stunned = 0; this.iframes = 0; this.ended = false; this.uturn = 0; this.boost = 0; this.runT = 0;
    this.waiting = true; this.turning = undefined; this.deadEnd = -1; this.ox = 0; this.card = [];
  }
  get gate() { return `${this.gateLetter}${this.gateNum}`; }

  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Gate dash'); this.frame.capSec = BOARDING_SEC + 6;
    this.cameras.main.setBackgroundColor(PAL.night2);
    this.speed = BASE_SPEED * this.frame.speed;
    this.g = this.add.graphics().setDepth(3);
    this.buildRunner(); this.runner = this.add.sprite(VX, FLOOR - 6, 'gd_run', 0).setOrigin(0.5, 1).setDepth(10).setScale(3);
    this.laneX = this.laneScreenX(1, 0);
    this.frame.hud(); this.meter = new Meter(this, 40, 40, W - 80, 6, PAL.sun2);
    txt(this, W / 2, 62, `GATE ${this.gate}`, 22, PAL.sun3).setDepth(801);
    txt(this, W / 2, 80, 'boarding closes when the bar runs out', 8, PAL.gray1).setDepth(801);
    this.signL = txt(this, 0, 0, '', 16, PAL.sun2).setDepth(20).setVisible(false); this.signR = txt(this, 0, 0, '', 16, PAL.sun2).setDepth(20).setVisible(false); this.signM = txt(this, 0, 0, '', 16, PAL.sun2).setDepth(20).setVisible(false);   // 16 px at the wall, scaled to 12 px far away
    this.frame.scoreNow = () => this.partialScore();
    this.frame.setProgress('fork 0/5'); this.meter.set(1);
    this.frame.intro('The taxi died on the highway. Read the card, then run.', () => { this.frame.pauseCap(); this.showCard(); }, { auto: true });
  }

  // ---------- instruction card ----------
  private showCard() {
    const s = this; const add = (o: Phaser.GameObjects.GameObject) => { this.card.push(o); return o; };
    add(s.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.9).setDepth(900));
    add(panel(s, 16, 96, W - 32, 470, PAL.night2).setDepth(901));
    add(txt(s, W / 2, 122, 'YOUR GATE', 10, PAL.gray2).setDepth(902));
    add(txt(s, W / 2, 152, this.gate, 34, PAL.sun3).setDepth(902));
    add(txt(s, W / 2, 184, 'The taxi died on the highway. Run.', 10, PAL.gray2).setDepth(902));
    const ic = s.add.graphics().setDepth(902); add(ic);
    const row = (y: number, draw: () => void, label: string) => { ic.fillStyle(PAL.night3).fillRect(34, y - 20, 44, 40); draw(); add(txt(s, 90, y, label, 10, PAL.white, 'left').setDepth(902)); };
    // swipe left / right
    row(230, () => { ic.fillStyle(PAL.neon).fillTriangle(40, 230, 50, 222, 50, 238).fillTriangle(72, 230, 62, 222, 62, 238).fillRect(50, 228, 12, 4); }, 'SWIPE LEFT / RIGHT\nchange lane, dodge people');
    row(288, () => { ic.fillStyle(PAL.neon).fillTriangle(56, 270, 48, 282, 64, 282).fillRect(54, 282, 4, 16); }, 'SWIPE UP\njump bags and ropes');
    row(346, () => { ic.fillStyle(PAL.sun2).fillRect(40, 336, 14, 8).fillRect(58, 336, 14, 8); ic.fillStyle(PAL.gray2).fillRect(55, 344, 2, 14); ic.fillStyle(PAL.ink).fillRect(42, 338, 10, 4).fillRect(60, 338, 10, 4); }, 'AT A WALL: READ THE SIGNS\nleft or right lane = you turn\nmiddle = you hit the wall');
    add(txt(s, W / 2, 404, `Follow the ranges that contain ${this.gate}.\nA–C or D–F, then the letter, then the numbers.`, 9, PAL.gray2).setDepth(902));
    add(txt(s, W / 2, 440, `Boarding closes in ${BOARDING_SEC} seconds of running.`, 9, PAL.sun1).setDepth(902));
    const btn = s.add.rectangle(W / 2, 510, 200, 52, PAL.sun0).setDepth(902).setStrokeStyle(2, PAL.ink).setInteractive({ useHandCursor: true }); add(btn);
    add(txt(s, W / 2, 510, 'READY', 18, PAL.white).setDepth(903));
    s.tweens.add({ targets: btn, scaleX: 1.04, scaleY: 1.06, yoyo: true, repeat: -1, duration: 600 });
    btn.on('pointerdown', () => this.startRun());
    const kb = this.input.keyboard; kb?.once('keydown-SPACE', () => this.startRun()); kb?.once('keydown-ENTER', () => this.startRun());
  }
  /** Dismiss the card and start the boarding clock (also called by the harness). */
  startRun() {
    if (!this.waiting) return; this.waiting = false; this.card.forEach(o => o.destroy()); this.card = [];
    this.frame.resumeCap(); this.setupInput(); this.frame.flash(PAL.neon, 60);
  }

  // ---------- input ----------
  private setupInput() {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.sx = p.x; this.sy = p.y; this.swiped = false; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!p.isDown || this.swiped) return; const dx = p.x - this.sx, dy = p.y - this.sy; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) { this.swiped = true; this.move(dx > 0 ? 1 : -1); } else if (dy < -28) { this.swiped = true; this.jump(); } });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { if (this.swiped) return; const dx = p.x - this.sx, dy = p.y - this.sy; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) return this.move(dx > 0 ? 1 : -1); if (dy < -28) return this.jump(); if (p.x < W / 3) this.move(-1); else if (p.x > (2 * W) / 3) this.move(1); else this.jump(); });
    const kb = this.input.keyboard; kb?.on('keydown-LEFT', () => this.move(-1)); kb?.on('keydown-RIGHT', () => this.move(1)); kb?.on('keydown-UP', () => this.jump()); kb?.on('keydown-SPACE', () => this.jump());
  }
  private busy() { return this.waiting || !this.frame.active || this.ended || this.uturn > 0 || !!this.turning || this.deadEnd >= 0; }
  private act(fn: () => void) { if (this.busy()) return; if (this.frame.lag > 0) this.time.delayedCall(this.frame.lag, fn); else fn(); }
  move(dir: number) { this.act(() => { this.lane = clamp(this.lane + dir, 0, 2); }); }
  jump() { this.act(() => { if (this.jumpT < 0) this.jumpT = 0; }); }
  /** Harness hint: the lane to be in and whether to jump right now, for a scripted perfect run. */
  hint(): { lane: number; jump: boolean } {
    const f = this.fork; const near = this.obstacles.filter(o => !o.hit && !o.used && o.z < 0.34).sort((a, b) => a.z - b.z)[0];
    let lane = this.lane;
    if (f) lane = f.correct;
    else if (near && near.kind !== 'walkway' && near.lane === this.lane && (near.kind === 'traveller' || near.kind === 'cart')) lane = this.lane === 1 ? 0 : 1;
    const jump = !!near && near.lane === this.lane && (near.kind === 'bag' || near.kind === 'rope') && near.z < 0.14 && this.jumpT < 0;
    return { lane, jump };
  }

  // ---------- geometry ----------
  private laneScreenX(lane: number, z: number) { const off = LANE_NEAR + (LANE_FAR - LANE_NEAR) * z; return VX + this.ox + (lane - 1) * off; }
  private screenY(z: number) { return HORIZON + (FLOOR - HORIZON) * Math.pow(1 - z, 1.6); }
  private ceilY(z: number) { return 26 + (HORIZON - 30) * Math.pow(1 - z, 1.8); }
  private halfW(z: number) { return (LANE_NEAR * 1.5 + 10) * (1 - z) + (LANE_FAR * 1.5 + 4) * z; }
  private scaleAt(z: number) { return 0.12 + 0.88 * Math.pow(1 - z, 1.6); }

  // ---------- forks ----------
  private makeFork(): Fork {
    const L = this.gateLetter, N = this.gateNum;
    if (this.stage < 4) { const f = genFork(this.stage as 0 | 1 | 2 | 3, L, N, Math.random); return { z: 1, hold: FORK_HOLD, left: f.left.label, right: f.right.label, correct: f.correct }; }
    const d = genDoors(L, N, Math.random); return { z: 1, hold: FORK_HOLD, left: d.doors[0], right: d.doors[2], doors: d.doors, correct: d.correct };   // the doors: three gates across the lanes, one is yours
  }
  /** Reached the wall. Doors: the lane picks the gate. Otherwise the side lane turns (right or wrong), the middle lane hits the wall. */
  private reachFork(f: Fork) {
    f.resolved = true;
    if (f.doors) { if (this.lane === f.correct) this.forkPassed(); else this.wrongWay(false); return; }
    if (this.lane === 1) { this.wrongWay(false, 'PICK A SIDE'); return; }
    const ok = this.lane === f.correct; this.turning = { dir: this.lane === 0 ? -1 : 1, t: 0, ok, wall: f }; this.obstacles = []; this.fork = undefined; this.runner.setFrame(0);
  }
  private forkPassed() {
    this.stage++; this.frame.setProgress(`fork ${Math.min(this.stage, 5)}/5`); this.frame.flash(PAL.neon, 40);
    if (this.stage >= 5) { this.boarding(); return; }
    this.fork = undefined; this.nextForkAt = this.elapsed + FORK_GAP;
  }
  private wrongWay(afterTurn: boolean, label = 'WRONG WAY') {
    this.wrong++; this.penalty += 3; this.uturn = 1.3; this.frame.shake(160, 0.006); this.frame.flash(PAL.red, 120); this.say(label, PAL.red);
    this.fork = undefined; this.deadEnd = -1; this.obstacles = []; this.nextForkAt = this.elapsed + (afterTurn ? 1.2 : 1.6);
  }
  private say(s: string, color: number) { this.banner?.destroy(); this.banner = txt(this, W / 2, 300, s, 20, color).setDepth(30); this.tweens.add({ targets: this.banner, alpha: 0, y: 270, duration: 900, delay: 300, onComplete: () => { this.banner?.destroy(); this.banner = undefined; } }); }
  private boarding() {
    this.ended = true; this.say('BOARDING', PAL.neon);
    const stamp = txt(this, W / 2, 360, this.gate, 30, PAL.sun3).setDepth(31).setScale(2).setAlpha(0); this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' });
    const beyond = Math.max(0, this.collisions - 2); const score = clamp(100 - 8 * this.wrong - Math.min(2, this.collisions) - 4 * beyond, 40, 100);
    this.time.delayedCall(900, () => this.frame.finish(score));
  }
  private partialScore() { const f = this.fork; const within = f ? clamp(1 - f.z, 0, 1) : 0; return clamp((this.stage / 5) * 60 + within * 8 - this.wrong * 3, 0, 45); }

  // ---------- update ----------
  update(_t: number, dtMs: number) {
    this.frame.update(dtMs); if (!this.frame.active || this.ended) return;
    if (this.waiting) { this.draw(); return; }
    const dt = Math.min(0.05, dtMs / 1000); this.elapsed += dt;
    const left = BOARDING_SEC - this.elapsed - this.penalty; this.meter.set(left / BOARDING_SEC, left < 8 ? PAL.red : PAL.sun2); this.frame.setTimer(`${Math.max(0, left).toFixed(1)}s`);
    if (left <= 0) { this.ended = true; this.say('BOARDING CLOSED', PAL.red); this.time.delayedCall(700, () => this.frame.finish(this.partialScore(), true)); return; }
    // the 90° turn (0.9 s): the runner holds still; first half = the side opening wipes across the screen, second half = the new corridor fades in
    if (this.turning) {
      const tr = this.turning; tr.t += dt / TURN_SEC; const p = clamp(tr.t, 0, 1); const sw = Math.sin(p * Math.PI);
      this.runner.setAngle(-tr.dir * 14 * sw); this.ox = p < 0.5 ? -tr.dir * (p / 0.5) * 40 : 0;
      if (p >= 0.5 && !tr.swapped) { tr.swapped = true; tr.wall = undefined; this.lane = 1; this.laneX = this.laneScreenX(1, 0); this.runner.setPosition(this.laneX, FLOOR - 6); this.nextObAt = this.elapsed + CLEAR_AFTER_TURN + TURN_SEC / 2; }
      if (p >= 0.5) this.dist += this.speed * 0.6 * dt;
      if (p >= 1) { this.ox = 0; this.runner.setAngle(0); this.turning = undefined; if (tr.ok) this.forkPassed(); else this.deadEnd = 0.62; }
      this.draw(); return;
    }
    if (this.uturn > 0) { this.uturn -= dt; this.runner.setFlipX(true).setAlpha(0.7); this.draw(); return; } else { this.runner.setFlipX(false).setAlpha(1); }
    // motion
    this.stunned = Math.max(0, this.stunned - dt); this.iframes = Math.max(0, this.iframes - dt); this.boost = Math.max(0, this.boost - dt);
    const ramp = 1 + 0.006 * this.elapsed + 0.25 * this.frame.hard; const v = this.speed * ramp * (this.stunned > 0 ? 0.45 : 1) * (this.boost > 0 ? 1.5 : 1);
    this.dist += v * dt;
    if (this.deadEnd >= 0) { this.deadEnd -= v * 1.4 * dt; if (this.deadEnd <= 0.04) this.wrongWay(true); this.draw(); return; }
    if (this.jumpT >= 0) { this.jumpT += dt / 0.6; if (this.jumpT >= 1) this.jumpT = -1; }
    // spawn: a fork wall appears far ahead and holds at the horizon so the signs can be read, then approaches
    if (!this.fork && this.elapsed >= this.nextForkAt && this.stage < 5) this.fork = this.makeFork();
    if (!this.fork && this.elapsed >= this.nextObAt) {
      const kinds: ObKind[] = ['traveller', 'traveller', 'bag', 'bag', 'rope', 'cart', 'walkway']; const kind = Phaser.Utils.Array.GetRandom(kinds); const lane = Phaser.Math.Between(0, 2);
      if (!this.obstacles.some(o => o.z > 0.8)) this.obstacles.push({ kind, lane, z: 1 });
      this.nextObAt = this.elapsed + clamp(1.3 / (ramp * this.frame.speed), 0.7, 1.6);
    }
    // advance
    for (const o of this.obstacles) o.z -= v * dt;
    if (this.fork) { if (this.fork.hold > 0) this.fork.hold -= dt; else this.fork.z -= FORK_APPROACH * dt; }   // fixed approach: 2 s hold + 3.3 s of travel = 5+ s of reading
    const airborne = this.jumpT > 0.2 && this.jumpT < 0.8;
    for (const o of this.obstacles) {
      if (o.z < 0.07 && o.z > -0.02 && o.lane === this.lane && !o.hit && !o.used) {
        if (o.kind === 'walkway') { o.used = true; this.boost = 1.8; this.frame.flash(PAL.neon, 30); this.say('MOVING WALKWAY', PAL.neon); }
        else if ((o.kind === 'bag' || o.kind === 'rope') && airborne) { /* cleared */ }
        else if (this.iframes <= 0) { o.hit = true; this.collisions++; this.penalty += 1.5; this.stunned = 0.7; this.iframes = 1; this.frame.shake(120, 0.005); this.say(o.kind === 'traveller' ? 'SORRY!' : o.kind === 'cart' ? 'CLEANING CART' : 'OOF', PAL.sun1); }
      }
    }
    this.obstacles = this.obstacles.filter(o => o.z > -0.15);
    if (this.fork && !this.fork.resolved && this.fork.z <= 0.03) this.reachFork(this.fork);
    // runner
    this.runT += dt * (this.stunned > 0 ? 6 : 12); const fr = this.jumpT >= 0 ? 3 : Math.floor(this.runT) % 3; this.runner.setFrame(fr);
    const tx = this.laneScreenX(this.lane, 0); this.laneX += (tx - this.laneX) * Math.min(1, dt * 14);
    const jy = this.jumpT >= 0 ? -Math.sin(this.jumpT * Math.PI) * 64 : 0; this.runner.setPosition(this.laneX, FLOOR - 6 + jy);
    this.draw();
  }

  // ---------- drawing ----------
  private draw() {
    const g = this.g; g.clear(); const vx = VX + this.ox;
    // ceiling with fluorescent strips receding
    g.fillStyle(PAL.night1).fillRect(0, 26, W, HORIZON - 26); g.fillStyle(PAL.night3).fillRect(0, HORIZON - 3, W, 3);
    for (let i = 0; i < 6; i++) { const z = ((i / 6) + (this.dist * 0.5) % (1 / 6)) % 1; const y = this.ceilY(z); const s = this.scaleAt(z); g.fillStyle(PAL.sky3, 0.5 + 0.4 * (1 - z)).fillRect(vx - 60 * s, y, 120 * s, Math.max(1, 3 * s)); }
    // floor: corridor trapezoid, tiles scrolling toward the player
    g.fillStyle(PAL.gray0).fillRect(0, HORIZON, W, FLOOR - HORIZON + 30);
    g.fillStyle(PAL.gray1).beginPath(); g.moveTo(vx - this.halfW(0), FLOOR + 30); g.lineTo(vx - this.halfW(1), HORIZON); g.lineTo(vx + this.halfW(1), HORIZON); g.lineTo(vx + this.halfW(0), FLOOR + 30); g.closePath(); g.fillPath();
    for (let i = 0; i < 9; i++) { const z = ((i / 9) + (this.dist % (1 / 9))) % 1; const y = this.screenY(z); const hw = this.halfW(z); g.fillStyle(PAL.gray2, 0.35).fillRect(vx - hw, y, hw * 2, 1); }
    for (const lane of [-0.5, 0.5]) { g.lineStyle(1, PAL.gray2, 0.25); g.beginPath(); g.moveTo(vx + lane * 2 * LANE_NEAR, FLOOR + 30); g.lineTo(vx + lane * 2 * LANE_FAR, HORIZON); g.strokePath(); }
    // walls
    g.fillStyle(PAL.night3).beginPath(); g.moveTo(vx - 400, 26); g.lineTo(vx - this.halfW(1), HORIZON - 3); g.lineTo(vx - this.halfW(0), FLOOR + 30); g.lineTo(vx - 400, FLOOR + 30); g.closePath(); g.fillPath();
    g.fillStyle(PAL.night3).beginPath(); g.moveTo(vx + 400, 26); g.lineTo(vx + this.halfW(1), HORIZON - 3); g.lineTo(vx + this.halfW(0), FLOOR + 30); g.lineTo(vx + 400, FLOOR + 30); g.closePath(); g.fillPath();
    for (let i = 0; i < 5; i++) { const z = ((i / 5) + (this.dist * 0.7) % (1 / 5)) % 1; const y = this.screenY(z) - 90 * this.scaleAt(z); const s = this.scaleAt(z); const xl = vx - this.halfW(z) - 4; g.fillStyle(PAL.sky1, 0.5).fillRect(xl - 26 * s, y, 24 * s, 34 * s); g.fillStyle(PAL.sky1, 0.5).fillRect(vx + this.halfW(z) + 6, y, 24 * s, 34 * s); }
    // the junction wall (fork) or the dead-end wall
    this.signL.setVisible(false); this.signR.setVisible(false); this.signM.setVisible(false);
    const f = this.fork ?? this.turning?.wall;
    if (f && f.z > -0.02) this.drawWall(f);
    else if (this.deadEnd >= 0) this.drawDeadEnd(clamp(this.deadEnd, 0, 1));
    // obstacles far → near (nothing beyond a wall)
    const obs = [...this.obstacles].filter(o => !f || o.z < f.z).sort((a, b) => b.z - a.z);
    for (const o of obs) {
      if (o.z < -0.02) continue; const z = clamp(o.z, 0, 1), s = this.scaleAt(z), x = this.laneScreenX(o.lane, z), y = this.screenY(z); const a = o.hit ? 0.35 : 1;
      switch (o.kind) {
        case 'traveller': { g.fillStyle(PAL.night0, a).fillRect(x - 9 * s, y - 56 * s, 18 * s, 56 * s); g.fillStyle(PAL.earth3, a).fillRect(x - 6 * s, y - 68 * s, 12 * s, 12 * s); g.fillStyle(PAL.dusk2, a).fillRect(x - 12 * s, y - 50 * s, 6 * s, 24 * s); g.fillStyle(PAL.gray0, a).fillRect(x + 12 * s, y - 26 * s, 14 * s, 26 * s); break; }
        case 'bag': { g.fillStyle(PAL.ink, a).fillRect(x - 15 * s, y - 22 * s, 30 * s, 22 * s); g.fillStyle(PAL.red, a).fillRect(x - 13 * s, y - 20 * s, 26 * s, 18 * s); g.fillStyle(PAL.ink, a).fillRect(x - 12 * s, y - 2 * s, 6 * s, 3 * s); g.fillStyle(PAL.ink, a).fillRect(x + 6 * s, y - 2 * s, 6 * s, 3 * s); break; }
        case 'rope': { const hw = 44 * s; g.fillStyle(PAL.gray2, a).fillRect(x - hw, y - 34 * s, 4 * s, 34 * s); g.fillStyle(PAL.gray2, a).fillRect(x + hw - 4 * s, y - 34 * s, 4 * s, 34 * s); g.fillStyle(PAL.red, a).fillRect(x - hw, y - 30 * s, hw * 2, 3 * s); break; }
        case 'cart': { g.fillStyle(PAL.sun2, a).fillRect(x - 24 * s, y - 40 * s, 48 * s, 36 * s); g.fillStyle(PAL.ink, a).fillRect(x - 20 * s, y - 6 * s, 8 * s, 6 * s); g.fillStyle(PAL.ink, a).fillRect(x + 12 * s, y - 6 * s, 8 * s, 6 * s); g.fillStyle(PAL.gray0, a).fillRect(x - 6 * s, y - 60 * s, 12 * s, 20 * s); break; }
        case 'walkway': { const hw = 30 * s; g.fillStyle(o.used ? PAL.night3 : PAL.sea1, 0.8).fillRect(x - hw, y - 6 * s, hw * 2, 6 * s); g.fillStyle(PAL.neon, 0.9).fillTriangle(x - 6 * s, y - 5 * s, x + 6 * s, y - 5 * s, x, y - 1 * s); break; }
      }
    }
    g.fillStyle(PAL.ink, 0.35).fillEllipse(this.laneX + this.ox, FLOOR - 4, 40, 8);
    if (this.turning) this.drawTurn(this.turning);
  }
  /** The turn transition: the chosen side opening (a dark slot at the wall's edge) grows until it covers the screen, then the new corridor fades in. */
  private drawTurn(tr: { dir: number; t: number; wall?: Fork }) {
    const g = this.g; const p = clamp(tr.t, 0, 1);
    if (p < 0.5) {
      const q = Math.pow(p / 0.5, 1.6); const vx = VX + this.ox; const z = clamp(tr.wall?.z ?? 0, 0, 1); const s = Math.max(0.16, this.scaleAt(z)); const yF = this.screenY(z), yC = this.ceilY(z); const hw = this.halfW(z) + 2;
      const slotL = tr.dir > 0 ? vx + hw - 6 * s : vx - hw, slotR = slotL + 6 * s, slotT = yC + (yF - yC) * 0.3;   // the opening at the wall's edge
      const l = slotL + (0 - slotL) * q, r = slotR + (W - slotR) * q, t = slotT + (26 - slotT) * q, b = yF + (H - yF) * q;
      g.fillStyle(PAL.night0).fillRect(l, t, r - l, b - t);
      g.fillStyle(PAL.sky3, 0.35 * q).fillRect(l + (r - l) * 0.45, t + (b - t) * 0.3, (r - l) * 0.1, (b - t) * 0.02);   // a hint of the far lights down the new corridor
      this.signL.setVisible(false); this.signR.setVisible(false); this.signM.setVisible(false);
    } else { g.fillStyle(PAL.night0, 1 - (p - 0.5) / 0.5).fillRect(0, 26, W, H - 26); }
  }
  /** The T-junction: an end wall across the corridor at the fork's depth with two sign boards (or three gate doors). */
  private drawWall(f: Fork) {
    const g = this.g; const vx = VX + this.ox; const z = clamp(f.z, 0, 1); const s = Math.max(0.16, this.scaleAt(z)); const yF = this.screenY(z), yC = this.ceilY(z); const hw = this.halfW(z) + 2;
    g.fillStyle(PAL.night1).fillRect(vx - hw, yC, hw * 2, yF - yC); g.fillStyle(PAL.night3).fillRect(vx - hw, yF - 3 * s, hw * 2, 3 * s);   // the wall and its skirting
    // side openings: darker slots at the wall's edges hint that the corridor continues left and right
    g.fillStyle(PAL.night0).fillRect(vx - hw, yC + (yF - yC) * 0.3, 6 * s, (yF - yC) * 0.7); g.fillStyle(PAL.night0).fillRect(vx + hw - 6 * s, yC + (yF - yC) * 0.3, 6 * s, (yF - yC) * 0.7);
    const sc = clamp(0.75 + 0.25 * (1 - z), 0.75, 1);   // sign text: 12 px when the wall appears, 16 px at the wall
    if (f.doors) {
      f.doors.forEach((d, lane) => { const x = this.laneScreenX(lane, z); const w = 44 * s, h = 70 * s; g.fillStyle(PAL.ink).fillRect(x - w / 2 - 2, yF - h - 2, w + 4, h + 2); g.fillStyle(lane === f.correct ? PAL.sea1 : PAL.dusk0).fillRect(x - w / 2, yF - h, w, h); g.fillStyle(PAL.sun2).fillRect(x - w / 2, yF - h - 12 * s, w, 10 * s); void d; });
      if (z <= 0.4) {   // near: a label over each door
        this.signL.setText(f.doors[0]).setPosition(this.laneScreenX(0, z), yF - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true); this.signM.setText(f.doors[1]).setPosition(this.laneScreenX(1, z), yF - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true); this.signR.setText(f.doors[2]).setPosition(this.laneScreenX(2, z), yF - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true);
      } else {          // far: one board listing the three doors, so the text never overlaps
        this.signM.setText(f.doors.join('   ')).setScale(sc).setColor('#f7cf6b'); const bw = this.signM.width * sc + 28, bh = 34; const bx = vx - bw / 2, by = Math.max(30, yC + (yF - yC) * 0.32 - bh / 2);
        g.fillStyle(PAL.ink).fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle(PAL.night0).fillRect(bx, by, bw, bh); this.signM.setPosition(vx, by + bh / 2).setVisible(true);
      }
    } else {
      this.signL.setText(f.left).setScale(sc); this.signR.setText(f.right).setScale(sc);
      const bwL = this.signL.width * sc + 30, bwR = this.signR.width * sc + 30, bh = 34; const by = Math.max(30, Math.min(yC + (yF - yC) * 0.32 - bh / 2, yF - bh - 12));
      const gap = Math.max(hw * 0.5, Math.max(bwL, bwR) / 2 + 4); const xl = vx - gap - bwL / 2, xr = vx + gap - bwR / 2;   // boards keep their readable size and never overlap (they may overhang the wall when it is far)
      for (const [bx, bw, arrowLeft] of [[xl, bwL, true], [xr, bwR, false]] as [number, number, boolean][]) {
        g.fillStyle(PAL.ink).fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle(PAL.night0).fillRect(bx, by, bw, bh);
        const ax = arrowLeft ? bx + 6 : bx + bw - 6; const dir = arrowLeft ? 1 : -1; g.fillStyle(PAL.sun2).fillTriangle(ax, by + bh / 2, ax + dir * 10, by + 6, ax + dir * 10, by + bh - 6);
      }
      this.signL.setPosition(xl + bwL / 2 + 6, by + bh / 2).setColor('#f7cf6b').setVisible(true); this.signR.setPosition(xr + bwR / 2 - 6, by + bh / 2).setColor('#f7cf6b').setVisible(true);
    }
  }
  /** After a wrong turn: a blank end wall rushing up with a NO EXIT board. */
  private drawDeadEnd(z: number) {
    const g = this.g; const vx = VX + this.ox; const s = Math.max(0.16, this.scaleAt(z)); const yF = this.screenY(z), yC = this.ceilY(z); const hw = this.halfW(z) + 2;
    g.fillStyle(PAL.night1).fillRect(vx - hw, yC, hw * 2, yF - yC); g.fillStyle(PAL.red, 0.9).fillRect(vx - hw, yF - 8 * s, hw * 2, 4 * s);
    const bw = Math.max(110, 120 * s), bh = 34, bx = vx - bw / 2, by = yC + (yF - yC) * 0.35; g.fillStyle(PAL.ink).fillRect(bx - 2, by - 2, bw + 4, bh + 4); g.fillStyle(PAL.red).fillRect(bx, by, bw, bh);
    this.signM.setText('NO EXIT').setPosition(vx, by + bh / 2).setScale(clamp(0.75 + 0.25 * (1 - z), 0.75, 1)).setColor('#f4f1ea').setVisible(true);
  }
  private buildRunner() {
    const map: Record<string, number> = { h: PAL.earth3, k: PAL.ink, o: PAL.sun0, b: PAL.night3, s: PAL.sea1, w: PAL.white };
    const A = ['....hhhh......', '....hkhk......', '....hhhh......', '.....oo...ss..', '...oooooo.ss..', '..o.oooo.oss..', '..o.oooo.o.k..', '....bbbb...k..', '....bbbb..sss.', '...bb..bb.sss.', '...bb..bb.sss.', '..bb....bbsss.', '..k......k.kk.', '..............'];
    const B = ['....hhhh......', '....hkhk......', '....hhhh......', '.....oo...ss..', '...oooooo.ss..', '..o.oooo.oss..', '..o.oooo.o.k..', '....bbbb...k..', '....bbbb..sss.', '....bbbb..sss.', '....bbbb..sss.', '....bb.b..sss.', '....k..k...kk.', '..............'];
    const C = ['....hhhh......', '....hkhk......', '....hhhh......', '.....oo...ss..', '...oooooo.ss..', '..o.oooo.oss..', '..o.oooo.o.k..', '....bbbb...k..', '....bbbb..sss.', '...bb.bb..sss.', '..bb...bb.sss.', '.bb.....bbsss.', '.k.......k.kk.', '..............'];
    const J = ['....hhhh......', '....hkhk......', '....hhhh......', 'o....oo...ss..', '.oooooooo.ss..', '....oooo..ss..', '....oooo...k..', '....bbbb...k..', '...bbbbbb.sss.', '..bb....bbsss.', '.bb......bsss.', '.k........k...', '..............', '..............'];
    const key = 'gd_run'; if (this.textures.exists(key)) return;
    const frames = [A, B, C, J]; const fw = 14, fh = 14; const g = this.add.graphics();
    frames.forEach((rows, fi) => rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.' && map[ch] !== undefined) g.fillStyle(map[ch]).fillRect(fi * fw + x, y, 1, 1); })));
    g.generateTexture(key, fw * frames.length, fh); g.destroy();
    const tex = this.textures.get(key); for (let i = 0; i < frames.length; i++) tex.add(i, 0, i * fw, 0, fw, fh);
  }
}
