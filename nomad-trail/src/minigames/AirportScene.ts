import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, clamp, normalizeLaunch, txt } from './_shared';

/**
 * GATE DASH: the taxi died on the way to the airport; run to your gate. Temple-Run down a terminal corridor.
 * Swipe left/right (or tap the left/right third) to change lane, swipe up (or tap the middle) to jump. Arrows on desktop.
 * Your gate (e.g. B56) is pinned at the top. Every ~7 s the corridor forks under two overhead signs showing gate ranges:
 * take the side that contains your gate. Five forks narrow it down (letters → letter → numbers → numbers → the door itself,
 * a three-lane pick). Wrong side = WRONG WAY, a U-turn, 3 s lost, the fork repeats. Boarding closes after 40 s of play.
 * Payload: { gate?: string } like 'B56'. Score: 100 − 8 per wrong turn − 1 per collision (−4 each beyond two); fail = boarding closed.
 */
type ObKind = 'traveller' | 'bag' | 'rope' | 'cart' | 'walkway';
interface Ob { kind: ObKind; lane: number; z: number; hit?: boolean; used?: boolean; }
interface Fork { z: number; left: string; right: string; correct: 0 | 2 | number; doors?: string[]; correctLane?: number; resolved?: boolean; }
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const HORIZON = 210, FLOOR = 560, VX = W / 2;
const LANE_NEAR = 96, LANE_FAR = 12;
const BOARDING_SEC = 40;

export class AirportScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private gateLetter = 'B'; private gateNum = 56;
  lane = 1; private laneX = 0; private jumpT = -1; private speed = 0.42; private boost = 0; private dist = 0; private elapsed = 0;
  private obstacles: Ob[] = []; private fork?: Fork; private stage = 0; private nextForkAt = 3.5; private nextObAt = 1.2;
  private wrong = 0; private collisions = 0; private penalty = 0; private stunned = 0; private iframes = 0; private ended = false; private uturn = 0;
  private runner!: Phaser.GameObjects.Sprite; private signL!: Phaser.GameObjects.Text; private signR!: Phaser.GameObjects.Text; private signM!: Phaser.GameObjects.Text;
  private gateLbl!: Phaser.GameObjects.Text; private banner?: Phaser.GameObjects.Text; private runT = 0;
  private sx = 0; private sy = 0; private swiped = false;

  constructor() { super(MINIGAME_KEYS.airport); }
  init(data: any) {
    this.launch = normalizeLaunch(data);
    const gate = String(this.launch.payload?.gate ?? 'B56').toUpperCase(); const m = /^([A-F])(\d{1,2})$/.exec(gate);
    this.gateLetter = m ? m[1] : 'B'; this.gateNum = m ? clamp(parseInt(m[2], 10), 1, 99) : 56;
    this.lane = 1; this.jumpT = -1; this.dist = 0; this.elapsed = 0; this.obstacles = []; this.fork = undefined; this.stage = 0; this.nextForkAt = 3.5; this.nextObAt = 1.2;
    this.wrong = 0; this.collisions = 0; this.penalty = 0; this.stunned = 0; this.iframes = 0; this.ended = false; this.uturn = 0; this.boost = 0; this.runT = 0;
  }
  get gate() { return `${this.gateLetter}${this.gateNum}`; }

  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Gate dash'); this.frame.capSec = BOARDING_SEC + 6;
    this.cameras.main.setBackgroundColor(PAL.night2);
    this.speed = 0.5 * this.frame.speed;
    this.g = this.add.graphics().setDepth(3);
    this.buildRunner(); this.runner = this.add.sprite(VX, FLOOR - 6, 'gd_run', 0).setOrigin(0.5, 1).setDepth(10).setScale(3);
    this.laneX = this.laneScreenX(1, 0);
    this.frame.hud(); this.meter = new Meter(this, 40, 40, W - 80, 6, PAL.sun2);
    this.gateLbl = txt(this, W / 2, 62, `GATE ${this.gate}`, 22, PAL.sun3).setDepth(801);
    txt(this, W / 2, 80, 'boarding closes when the bar runs out', 8, PAL.gray1).setDepth(801);
    this.signL = txt(this, 0, 0, '', 10, PAL.sun2).setDepth(20).setVisible(false); this.signR = txt(this, 0, 0, '', 10, PAL.sun2).setDepth(20).setVisible(false); this.signM = txt(this, 0, 0, '', 10, PAL.sun2).setDepth(20).setVisible(false);
    this.frame.scoreNow = () => this.partialScore();
    this.frame.intro(`The taxi died on the highway. Run to gate ${this.gate}: swipe left / right to change lane, up to jump. Follow the signs at every fork.`, () => { this.setupInput(); });
    this.frame.setProgress(`fork 0/5`);
  }

  // ---------- input ----------
  private setupInput() {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.sx = p.x; this.sy = p.y; this.swiped = false; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!p.isDown || this.swiped) return; const dx = p.x - this.sx, dy = p.y - this.sy; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) { this.swiped = true; this.move(dx > 0 ? 1 : -1); } else if (dy < -28) { this.swiped = true; this.jump(); } });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { if (this.swiped) return; const dx = p.x - this.sx, dy = p.y - this.sy; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) return this.move(dx > 0 ? 1 : -1); if (dy < -28) return this.jump(); if (p.x < W / 3) this.move(-1); else if (p.x > (2 * W) / 3) this.move(1); else this.jump(); });
    const kb = this.input.keyboard; kb?.on('keydown-LEFT', () => this.move(-1)); kb?.on('keydown-RIGHT', () => this.move(1)); kb?.on('keydown-UP', () => this.jump()); kb?.on('keydown-SPACE', () => this.jump());
  }
  private act(fn: () => void) { if (!this.frame.active || this.ended || this.uturn > 0) return; if (this.frame.lag > 0) this.time.delayedCall(this.frame.lag, fn); else fn(); }
  move(dir: number) { this.act(() => { this.lane = clamp(this.lane + dir, 0, 2); }); }
  jump() { this.act(() => { if (this.jumpT < 0) this.jumpT = 0; }); }
  /** Harness hint: the lane to be in and whether to jump right now, for a scripted perfect run. */
  hint(): { lane: number; jump: boolean } {
    const f = this.fork; const near = this.obstacles.filter(o => !o.hit && !o.used && o.z < 0.34).sort((a, b) => a.z - b.z)[0];
    let lane = this.lane;
    if (f && f.z < 0.9) lane = f.correctLane ?? (f.correct === 0 ? 0 : 2);
    else if (near && near.kind !== 'walkway' && near.lane === this.lane && (near.kind === 'traveller' || near.kind === 'cart')) lane = this.lane === 1 ? 0 : 1;
    const jump = !!near && near.lane === this.lane && (near.kind === 'bag' || near.kind === 'rope') && near.z < 0.14 && this.jumpT < 0;
    return { lane, jump };
  }

  // ---------- geometry ----------
  private laneScreenX(lane: number, z: number) { const off = LANE_NEAR + (LANE_FAR - LANE_NEAR) * z; return VX + (lane - 1) * off; }
  private screenY(z: number) { return HORIZON + (FLOOR - HORIZON) * Math.pow(1 - z, 1.6); }
  private scaleAt(z: number) { return 0.12 + 0.88 * Math.pow(1 - z, 1.6); }

  // ---------- forks ----------
  private makeFork(): Fork {
    const L = this.gateLetter, N = this.gateNum; const li = LETTERS.indexOf(L); const side: 0 | 2 = Math.random() < 0.5 ? 0 : 2;
    const put = (correctTxt: string, otherTxt: string): Fork => ({ z: 1, left: side === 0 ? correctTxt : otherTxt, right: side === 2 ? correctTxt : otherTxt, correct: side });
    switch (this.stage) {
      case 0: return put(li < 3 ? 'GATES A–C' : 'GATES D–F', li < 3 ? 'GATES D–F' : 'GATES A–C');
      case 1: { const others = (li < 3 ? LETTERS.slice(0, 3) : LETTERS.slice(3)).filter(x => x !== L); return put(`GATES ${L}`, `GATES ${others.join(' · ')}`); }
      case 2: return put(N <= 50 ? `${L}1–${L}50` : `${L}51–${L}99`, N <= 50 ? `${L}51–${L}99` : `${L}1–${L}50`);
      case 3: { const lo = N <= 50 ? 1 : 51, hi = N <= 50 ? 50 : 99, mid = Math.floor((lo + hi) / 2); const inLow = N <= mid; return put(inLow ? `${L}${lo}–${L}${mid}` : `${L}${mid + 1}–${L}${hi}`, inLow ? `${L}${mid + 1}–${L}${hi}` : `${L}${lo}–${L}${mid}`); }
      default: { // the doors: three gates across the lanes, one is yours
        const lane = Phaser.Math.Between(0, 2); const doors: string[] = []; const step = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < 3; i++) doors.push(`${L}${clamp(N + (i - lane) * step, 1, 99)}`); doors[lane] = this.gate;
        return { z: 1, left: doors[0], right: doors[2], doors, correct: lane, correctLane: lane };
      }
    }
  }
  private resolveFork(f: Fork) {
    f.resolved = true;
    const ok = f.doors ? this.lane === f.correctLane : (this.lane === f.correct);
    if (ok) {
      this.stage++; this.frame.setProgress(`fork ${Math.min(this.stage, 5)}/5`); this.frame.flash(PAL.neon, 40);
      if (this.stage >= 5) { this.boarding(); return; }
      this.fork = undefined; this.nextForkAt = this.elapsed + 4.4 / Math.max(0.8, this.frame.speed);
    } else {
      this.wrong++; this.penalty += 3; this.uturn = 1.3; this.frame.shake(160, 0.006); this.frame.flash(PAL.red, 120);
      this.say(!f.doors && this.lane === 1 ? 'PICK A SIDE' : 'WRONG WAY', PAL.red);
      this.fork = undefined; this.nextForkAt = this.elapsed + 1.6; this.obstacles = [];
    }
  }
  private say(s: string, color: number) { this.banner?.destroy(); this.banner = txt(this, W / 2, 300, s, 20, color).setDepth(30); this.tweens.add({ targets: this.banner, alpha: 0, y: 270, duration: 900, delay: 300, onComplete: () => { this.banner?.destroy(); this.banner = undefined; } }); }
  private boarding() {
    this.ended = true; this.say('BOARDING', PAL.neon);
    const stamp = txt(this, W / 2, 360, this.gate, 30, PAL.sun3).setDepth(31).setScale(2).setAlpha(0); this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' });
    const beyond = Math.max(0, this.collisions - 2); const score = clamp(100 - 8 * this.wrong - Math.min(2, this.collisions) - 4 * beyond, 40, 100);
    this.time.delayedCall(900, () => this.frame.finish(score));
  }
  private partialScore() { const f = this.fork; const within = f ? clamp(1 - f.z, 0, 1) : clamp((this.elapsed - (this.nextForkAt - 4.4)) / 4.4, 0, 1); return clamp((this.stage / 5) * 60 + within * 8 - this.wrong * 3, 0, 45); }

  // ---------- update ----------
  update(_t: number, dtMs: number) {
    this.frame.update(dtMs); if (!this.frame.active || this.ended) return;
    const dt = Math.min(0.05, dtMs / 1000); this.elapsed += dt;
    const left = BOARDING_SEC - this.elapsed - this.penalty; this.meter.set(left / BOARDING_SEC, left < 8 ? PAL.red : PAL.sun2); this.frame.setTimer(`${Math.max(0, left).toFixed(1)}s`);
    if (left <= 0) { this.ended = true; this.say('BOARDING CLOSED', PAL.red); this.time.delayedCall(700, () => this.frame.finish(this.partialScore(), true)); return; }
    if (this.uturn > 0) { this.uturn -= dt; this.runner.setFlipX(true).setAlpha(0.7); this.draw(); return; } else { this.runner.setFlipX(false).setAlpha(1); }
    // motion
    this.stunned = Math.max(0, this.stunned - dt); this.iframes = Math.max(0, this.iframes - dt); this.boost = Math.max(0, this.boost - dt);
    const ramp = 1 + 0.006 * this.elapsed + 0.25 * this.frame.hard; const v = this.speed * ramp * (this.stunned > 0 ? 0.45 : 1) * (this.boost > 0 ? 1.5 : 1);
    this.dist += v * dt;
    if (this.jumpT >= 0) { this.jumpT += dt / 0.6; if (this.jumpT >= 1) this.jumpT = -1; }
    // spawn
    const forking = !!this.fork;
    if (!forking && this.elapsed >= this.nextForkAt && this.stage < 5) { this.fork = this.makeFork(); }
    if (this.elapsed >= this.nextObAt && !(this.fork && this.fork.z < 0.45)) {
      const kinds: ObKind[] = ['traveller', 'traveller', 'bag', 'bag', 'rope', 'cart', 'walkway']; const kind = Phaser.Utils.Array.GetRandom(kinds); const lane = Phaser.Math.Between(0, 2);
      if (!this.obstacles.some(o => o.z > 0.8)) this.obstacles.push({ kind, lane, z: 1 });
      this.nextObAt = this.elapsed + clamp(1.15 / (ramp * this.frame.speed), 0.55, 1.4);
    }
    // advance
    for (const o of this.obstacles) o.z -= v * dt; if (this.fork) this.fork.z -= v * dt;
    const airborne = this.jumpT > 0.2 && this.jumpT < 0.8;
    for (const o of this.obstacles) {
      if (o.z < 0.07 && o.z > -0.02 && o.lane === this.lane && !o.hit && !o.used) {
        if (o.kind === 'walkway') { o.used = true; this.boost = 1.8; this.frame.flash(PAL.neon, 30); this.say('MOVING WALKWAY', PAL.neon); }
        else if ((o.kind === 'bag' || o.kind === 'rope') && airborne) { /* cleared */ }
        else if (this.iframes <= 0) { o.hit = true; this.collisions++; this.penalty += 1.5; this.stunned = 0.7; this.iframes = 1; this.frame.shake(120, 0.005); this.say(o.kind === 'traveller' ? 'SORRY!' : o.kind === 'cart' ? 'CLEANING CART' : 'OOF', PAL.sun1); }
      }
    }
    this.obstacles = this.obstacles.filter(o => o.z > -0.15);
    if (this.fork && !this.fork.resolved && this.fork.z <= 0.02) this.resolveFork(this.fork);
    // runner
    this.runT += dt * (this.stunned > 0 ? 6 : 12); const fr = this.jumpT >= 0 ? 3 : Math.floor(this.runT) % 3; this.runner.setFrame(fr);
    const tx = this.laneScreenX(this.lane, 0); this.laneX += (tx - this.laneX) * Math.min(1, dt * 14);
    const jy = this.jumpT >= 0 ? -Math.sin(this.jumpT * Math.PI) * 64 : 0; this.runner.setPosition(this.laneX, FLOOR - 6 + jy);
    this.draw();
  }

  // ---------- drawing ----------
  private draw() {
    const g = this.g; g.clear();
    // ceiling with fluorescent strips receding
    g.fillStyle(PAL.night1).fillRect(0, 26, W, HORIZON - 26); g.fillStyle(PAL.night3).fillRect(0, HORIZON - 3, W, 3);
    for (let i = 0; i < 6; i++) { const z = ((i / 6) + (this.dist * 0.5) % (1 / 6)) % 1; const y = 26 + (HORIZON - 30) * Math.pow(1 - z, 1.8); const s = this.scaleAt(z); g.fillStyle(PAL.sky3, 0.5 + 0.4 * (1 - z)).fillRect(VX - 60 * s, y, 120 * s, Math.max(1, 3 * s)); }
    // floor: corridor trapezoid, tiles scrolling toward the player
    g.fillStyle(PAL.gray0).fillRect(0, HORIZON, W, FLOOR - HORIZON + 30);
    g.fillStyle(PAL.gray1).beginPath(); g.moveTo(VX - (LANE_NEAR * 1.5 + 10), FLOOR + 30); g.lineTo(VX - (LANE_FAR * 1.5 + 4), HORIZON); g.lineTo(VX + (LANE_FAR * 1.5 + 4), HORIZON); g.lineTo(VX + (LANE_NEAR * 1.5 + 10), FLOOR + 30); g.closePath(); g.fillPath();
    for (let i = 0; i < 9; i++) { const z = ((i / 9) + (this.dist % (1 / 9))) % 1; const y = this.screenY(z); const hw = (LANE_NEAR * 1.5 + 10) * (1 - z) + (LANE_FAR * 1.5 + 4) * z; g.fillStyle(PAL.gray2, 0.35).fillRect(VX - hw, y, hw * 2, 1); }
    for (const lane of [-0.5, 0.5]) { g.lineStyle(1, PAL.gray2, 0.25); g.beginPath(); g.moveTo(VX + lane * 2 * LANE_NEAR, FLOOR + 30); g.lineTo(VX + lane * 2 * LANE_FAR, HORIZON); g.strokePath(); }
    // walls
    g.fillStyle(PAL.night3).beginPath(); g.moveTo(0, 26); g.lineTo(VX - (LANE_FAR * 1.5 + 4), HORIZON - 3); g.lineTo(VX - (LANE_NEAR * 1.5 + 10), FLOOR + 30); g.lineTo(0, FLOOR + 30); g.closePath(); g.fillPath();
    g.fillStyle(PAL.night3).beginPath(); g.moveTo(W, 26); g.lineTo(VX + (LANE_FAR * 1.5 + 4), HORIZON - 3); g.lineTo(VX + (LANE_NEAR * 1.5 + 10), FLOOR + 30); g.lineTo(W, FLOOR + 30); g.closePath(); g.fillPath();
    for (let i = 0; i < 5; i++) { const z = ((i / 5) + (this.dist * 0.7) % (1 / 5)) % 1; const y = this.screenY(z) - 90 * this.scaleAt(z); const s = this.scaleAt(z); const xl = VX - ((LANE_NEAR * 1.5 + 10) * (1 - z) + (LANE_FAR * 1.5 + 4) * z) - 4; g.fillStyle(PAL.sky1, 0.5).fillRect(xl - 26 * s, y, 24 * s, 34 * s); g.fillStyle(PAL.sky1, 0.5).fillRect(W - xl + 2, y, 24 * s, 34 * s); }
    // fork signs (and doors) then obstacles far → near
    this.signL.setVisible(false); this.signR.setVisible(false); this.signM.setVisible(false);
    const f = this.fork;
    if (f && f.z > -0.02) {
      const s = this.scaleAt(f.z), y = this.screenY(f.z), zc = clamp(f.z, 0, 1);
      if (f.doors) {
        f.doors.forEach((d, lane) => { const x = this.laneScreenX(lane, zc); const w = 44 * s, h = 70 * s; g.fillStyle(PAL.ink).fillRect(x - w / 2 - 2, y - h - 2, w + 4, h + 2); g.fillStyle(lane === f.correctLane ? PAL.sea1 : PAL.dusk0).fillRect(x - w / 2, y - h, w, h); g.fillStyle(PAL.sun2).fillRect(x - w / 2, y - h - 12 * s, w, 10 * s); });
        const sc = clamp(s * 1.1, 0.3, 1.1); this.signL.setText(f.doors[0]).setPosition(this.laneScreenX(0, zc), y - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true); this.signM.setText(f.doors[1]).setPosition(this.laneScreenX(1, zc), y - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true); this.signR.setText(f.doors[2]).setPosition(this.laneScreenX(2, zc), y - 76 * s).setScale(sc).setColor('#0a0a12').setVisible(true);
      } else {
        // a pillar splits the corridor; two overhead boards
        const pw = 14 * s, ph = 120 * s; g.fillStyle(PAL.gray1).fillRect(VX - pw / 2, y - ph, pw, ph); g.fillStyle(PAL.gray2).fillRect(VX - pw / 2, y - ph, 3 * s, ph);
        const bw = 92 * s, bh = 26 * s, by = y - ph - 6 * s; const xl = VX - 58 * s - bw / 2, xr = VX + 58 * s - bw / 2;
        g.fillStyle(PAL.ink).fillRect(xl - 2, by - 2, bw + 4, bh + 4); g.fillStyle(PAL.night0).fillRect(xl, by, bw, bh); g.fillStyle(PAL.ink).fillRect(xr - 2, by - 2, bw + 4, bh + 4); g.fillStyle(PAL.night0).fillRect(xr, by, bw, bh);
        g.fillStyle(PAL.sun2).fillTriangle(xl + 6 * s, by + bh / 2, xl + 14 * s, by + 5 * s, xl + 14 * s, by + bh - 5 * s); g.fillStyle(PAL.sun2).fillTriangle(xr + bw - 6 * s, by + bh / 2, xr + bw - 14 * s, by + 5 * s, xr + bw - 14 * s, by + bh - 5 * s);
        const sc = clamp(s * 1.05, 0.28, 1.05); this.signL.setText(f.left).setPosition(xl + bw / 2 + 4 * s, by + bh / 2).setScale(sc).setColor('#f7cf6b').setVisible(true); this.signR.setText(f.right).setPosition(xr + bw / 2 - 4 * s, by + bh / 2).setScale(sc).setColor('#f7cf6b').setVisible(true);
      }
    }
    const obs = [...this.obstacles].sort((a, b) => b.z - a.z);
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
    // runner shadow
    g.fillStyle(PAL.ink, 0.35).fillEllipse(this.laneX, FLOOR - 4, 40, 8);
  }
  private buildRunner() {
    const map: Record<string, number> = { h: PAL.earth3, k: PAL.ink, o: PAL.sun0, b: PAL.night3, s: PAL.sea1, w: PAL.white };
    // 14x18 frames: run A, run B, run C, jump; the suitcase trails on the right
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
