import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, txt } from './_shared';

/** Kiteboarding: keep the kite in the power zone as gusts shift it; tap to jump off the swell peaks. 45s. */
export class KiteScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private kiteA = 0; private zoneC = 0; private zoneTarget = 0; private zoneW = 0.5; private speed = 0; private inZone = 0; private elapsed = 0; private jumps = 0; private wipeouts = 0; private airborne = 0; private riderY = 0; private gustWarn = 0; private dragging = false;
  private waveOff = 0; private tick?: Phaser.Time.TimerEvent; private msg!: Phaser.GameObjects.Text;
  constructor() { super(MINIGAME_KEYS.kite); }
  init(data: any) { this.launch = normalizeLaunch(data); this.kiteA = 0; this.zoneC = 0; this.zoneTarget = 0; this.speed = 0; this.inZone = 0; this.elapsed = 0; this.jumps = 0; this.wipeouts = 0; this.airborne = 0; this.riderY = 0; this.waveOff = 0; }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Kiteboarding'); this.cameras.main.setBackgroundColor(PAL.sky1);
    this.g = this.add.graphics().setDepth(3); this.meter = new Meter(this, 40, 600, W - 80, 8); this.zoneW = 0.34 * this.frame.window + 0.12;
    this.msg = txt(this, W / 2, 130, '', 12, PAL.white).setDepth(8);
    this.frame.hud();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.y < 420) this.dragging = true; }); this.input.on('pointerup', () => { this.dragging = false; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.dragging && this.frame.active) this.kiteA = clamp((p.x - W / 2) / 140, -1, 1); });
    this.frame.onTap(p => { if (p && p.y < 420) return; this.tryJump(); }); this.input.keyboard?.on('keydown-UP', () => this.tryJump());
    this.frame.intro('Drag the kite left/right to stay in the bright power zone. Gusts move it. Tap the water when a wave peaks under you to jump.', () => { this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) }); });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  update(_t: number, dt: number) { this.frame.update(dt); const kb = this.input.keyboard; if (kb && this.frame.active) { if (kb.addKey('LEFT').isDown) this.kiteA = clamp(this.kiteA - 0.03, -1, 1); if (kb.addKey('RIGHT').isDown) this.kiteA = clamp(this.kiteA + 0.03, -1, 1); } }
  private wavePhase() { return Math.sin(this.waveOff * 1.3); }
  private tryJump() { if (!this.frame.active || this.airborne > 0) return; const peak = this.wavePhase() > 0.75 - 0.25 * this.frame.window; if (peak && this.speed > 0.35) { this.airborne = 0.9 + this.speed * 0.5; this.jumps++; this.frame.flash(PAL.white, 40); this.msg.setText('AIR!'); } else { this.wipeouts++; this.speed = 0; this.frame.shake(200, 0.01); this.msg.setText(peak ? 'not enough speed' : 'wipeout'); } this.time.delayedCall(900, () => this.msg.setText('')); }
  private step(dt: number) {
    if (!this.frame.active) return; this.elapsed += dt; this.waveOff += dt * (0.8 + this.speed * 1.2);
    // gusts: every 3..5s pick a new zone center with a 0.8s warning
    this.gustWarn -= dt; if (this.gustWarn < -Phaser.Math.FloatBetween(2.2, 4) / this.frame.speed) { this.gustWarn = 0.8; this.zoneTarget = Phaser.Math.FloatBetween(-0.75, 0.75); }
    if (this.gustWarn <= 0) this.zoneC += (this.zoneTarget - this.zoneC) * Math.min(1, dt * 3);
    const inz = Math.abs(this.kiteA - this.zoneC) <= this.zoneW / 2; if (inz) { this.inZone += dt; this.speed = clamp(this.speed + dt * 0.5, 0, 1); } else this.speed = clamp(this.speed - dt * 0.35 * (1 + this.frame.hard), 0, 1);
    if (this.airborne > 0) { this.airborne -= dt; this.riderY = -Math.sin(Math.PI * clamp(this.airborne / 1.2, 0, 1)) * 90; if (this.airborne <= 0) { this.riderY = 0; this.frame.shake(60, 0.002); } }
    // draw
    const g = this.g; g.clear(); const horizon = 300;
    g.fillStyle(PAL.sky2).fillRect(0, 26, W, horizon - 26); g.fillStyle(PAL.sun3, 0.6).fillCircle(60, 90, 22);
    // wind window arc + zone
    const cx = W / 2, cy = 320, R = 150; g.lineStyle(2, PAL.white, 0.5).beginPath(); for (let a = -1; a <= 1.001; a += 0.05) { const x = cx + Math.sin(a * 1.2) * R, y = cy - Math.cos(a * 1.2) * R; if (a === -1) g.moveTo(x, y); else g.lineTo(x, y); } g.strokePath();
    g.lineStyle(10, this.gustWarn > 0 ? PAL.pink : PAL.sun2, inz ? 0.9 : 0.5).beginPath(); for (let a = this.zoneC - this.zoneW / 2; a <= this.zoneC + this.zoneW / 2 + 0.001; a += 0.02) { const aa = clamp(a, -1, 1); const x = cx + Math.sin(aa * 1.2) * R, y = cy - Math.cos(aa * 1.2) * R; if (a === this.zoneC - this.zoneW / 2) g.moveTo(x, y); else g.lineTo(x, y); } g.strokePath();
    if (this.gustWarn > 0) { for (let i = 0; i < 6; i++) g.fillStyle(PAL.white, 0.5).fillRect(((i * 61 + this.elapsed * 500) % W), 60 + i * 30, 26, 1); }
    // kite + lines
    const kx = cx + Math.sin(this.kiteA * 1.2) * R, ky = cy - Math.cos(this.kiteA * 1.2) * R; const rx = cx, ry = 400 + this.riderY;
    g.lineStyle(1, PAL.gray2, 0.8).lineBetween(kx - 6, ky + 4, rx - 3, ry - 10).lineBetween(kx + 6, ky + 4, rx + 3, ry - 10);
    g.fillStyle(PAL.ink).fillTriangle(kx - 26, ky + 6, kx, ky - 14, kx + 26, ky + 6); g.fillStyle(inz ? PAL.sun0 : PAL.dusk3).fillTriangle(kx - 24, ky + 5, kx, ky - 11, kx + 24, ky + 5);
    // sea + waves
    g.fillStyle(PAL.sea1).fillRect(0, horizon, W, H - horizon); for (let i = 0; i < 4; i++) { const ph = Math.sin(this.waveOff * 1.3 + i * 1.7); g.fillStyle(PAL.sea2, 0.7).fillEllipse(((i * 130 - this.waveOff * 60) % (W + 200) + W + 200) % (W + 200) - 100, 430 + i * 14, 120, 14 + ph * 10); }
    const bump = this.wavePhase(); g.fillStyle(PAL.sea3, 0.8).fillEllipse(cx, 428 - bump * 8, 90, 16 + bump * 10);
    // rider + board
    g.fillStyle(PAL.ink).fillRect(rx - 22, ry + 10, 44, 6); g.fillStyle(PAL.sun2).fillRect(rx - 20, ry + 10, 40, 4); g.fillStyle(PAL.earth3).fillRect(rx - 5, ry - 12, 10, 22); g.fillStyle(PAL.ink).fillRect(rx - 4, ry - 20, 8, 8);
    if (this.speed > 0.3 && this.airborne <= 0) for (let i = 0; i < 5; i++) g.fillStyle(PAL.white, 0.6).fillCircle(rx - 24 - i * 6 - Math.random() * 6, ry + 12 + Math.random() * 6, 2 + this.speed * 2);
    if (bump > 0.5 && this.airborne <= 0) txt(this, cx, 470, 'TAP', 10, PAL.white).setName('tapcue').setDepth(9); else this.children.list.filter(o => o.name === 'tapcue').forEach(o => o.destroy());
    this.meter.set(this.speed, PAL.neon); this.frame.setTimer(`${Math.max(0, Math.ceil(45 - this.elapsed))}s`); this.frame.setProgress(`${this.jumps} jumps`);
    if (this.elapsed >= 45) this.frame.finish(60 * (this.inZone / 45) + Math.min(40, this.jumps * 8) - this.wipeouts * 4);
  }
}
