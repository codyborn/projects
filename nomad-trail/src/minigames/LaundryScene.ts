import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';

/** Sort falling clothes: whites LEFT, colours RIGHT. Swipe/drag or arrow keys. 20s. One wrong sort = pink laundry.
 *  Speeds up with success: speed = 1 + 0.9 × successRate × min(1, streak/8); a miss resets the streak. */
export class LaundryScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private items: { x: number; y: number; vx: number; white: boolean; color: number; shape: number; done: boolean; result?: boolean }[] = []; private right = 0; private wrong = 0; private total = 0; private elapsed = 0; private tick?: Phaser.Time.TimerEvent; private downX = 0; private pinkTint = false; private ended = false; private bag: boolean[] = []; private streak = 0;
  constructor() { super(MINIGAME_KEYS.laundry); }
  init(data: any) { this.launch = normalizeLaunch(data); this.items = []; this.right = 0; this.wrong = 0; this.total = 0; this.elapsed = 0; this.pinkTint = false; this.ended = false; this.bag = []; this.streak = 0; }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Laundry day'); this.cameras.main.setBackgroundColor(PAL.night2);
    this.g = this.add.graphics().setDepth(3); this.meter = new Meter(this, 40, 600, W - 80, 8);
    panel(this, 20, 440, 130, 120, PAL.gray2, PAL.white, PAL.ink).setDepth(2); txt(this, 85, 570, 'WHITES', 10, PAL.gray2).setDepth(4); panel(this, W - 150, 440, 130, 120, PAL.dusk2, PAL.pink, PAL.ink).setDepth(2); txt(this, W - 85, 570, 'COLOURS', 10, PAL.gray2).setDepth(4);
    this.frame.hud();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.downX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { const dx = p.x - this.downX; if (Math.abs(dx) > 25) this.fling(dx < 0 ? -1 : 1); else this.fling(p.x < W / 2 ? -1 : 1); });
    this.input.keyboard?.on('keydown-LEFT', () => this.fling(-1)); this.input.keyboard?.on('keydown-RIGHT', () => this.fling(1));
    this.frame.capSec = 22; this.frame.scoreNow = () => { const base = this.total > 1 ? (this.right / (this.total - 1)) * 100 : 0; return this.pinkTint ? Math.min(base, 60) : base; };
    this.frame.intro('Whites to the LEFT basket, colours to the RIGHT. Swipe or tap a side. Sort a sock wrong and the laundry comes back pink.', () => { this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) }); this.spawn(); });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  update(_t: number, dt: number) { this.frame.update(dt); }
  /** True 50/50: a shuffled bag of 6 (3 whites, 3 colours), refilled when empty. */
  private nextWhite() { if (!this.bag.length) this.bag = Phaser.Utils.Array.Shuffle([true, true, true, false, false, false]); return this.bag.pop()!; }
  private spawn() { const white = this.nextWhite(); const colors = [PAL.red, PAL.sky0, PAL.grass1, PAL.sun0, PAL.dusk2, PAL.sea1]; this.items.push({ x: W / 2, y: 60, vx: 0, white, color: white ? PAL.white : Phaser.Utils.Array.GetRandom(colors), shape: Phaser.Math.Between(0, 2), done: false }); this.total++; }
  /** 1.0 at the start, up to 1.9 once you are sorting well and on a streak. */
  private speedMul() { const rate = this.total > 1 ? this.right / (this.total - 1) : 0; return 1 + 0.9 * rate * Math.min(1, this.streak / 8); }
  private fling(dir: number) { if (!this.frame.active || this.ended) return; const it = this.items.find(i => !i.done && i.vx === 0); if (!it) return; it.vx = dir * 260; const ok = (dir < 0) === it.white; it.result = ok; it.done = true; if (ok) { this.right++; this.streak++; this.frame.flash(PAL.neon, 30); } else { this.wrong++; this.streak = 0; this.pinkTint = true; this.frame.shake(120, 0.005); this.basketFlash(dir); } this.time.delayedCall(Math.round(280 / this.speedMul()), () => { if (this.frame.active && !this.ended) this.spawn(); }); }
  /** Wrong sort: the basket it landed in flashes red for a beat. Nothing else changes colour. */
  private basketFlash(dir: number) {
    const x = dir < 0 ? 20 : W - 150; const r = this.add.rectangle(x + 65, 500, 130, 120, PAL.red, 0.55).setDepth(3);
    this.tweens.add({ targets: r, alpha: 0, duration: 260, onComplete: () => r.destroy() });
  }
  private step(dt: number) {
    if (!this.frame.active || this.ended) return; this.elapsed += dt; const fall = 55 * this.frame.speed * (1 + 0.3 * this.frame.hard) * this.speedMul();
    for (const it of this.items) { if (it.vx) { it.x += it.vx * dt; it.y += 160 * dt; } else if (!it.done) { it.y += fall * dt; if (it.y > 420) { it.done = true; it.result = false; it.vx = 1; it.y = 470; this.wrong++; this.streak = 0; this.pinkTint = true; this.frame.shake(100, 0.004); this.time.delayedCall(200, () => { if (this.frame.active && !this.ended) this.spawn(); }); } } }
    this.items = this.items.filter(i => i.y < 620 && Math.abs(i.x - W / 2) < W);
    const g = this.g; g.clear(); g.fillStyle(PAL.gray0).fillRect(0, 40, W, 6); for (const it of this.items) { const tint = it.color; g.fillStyle(it.white ? PAL.gray1 : PAL.ink); this.shape(g, it.shape, it.x, it.y, 1.15); g.fillStyle(tint); this.shape(g, it.shape, it.x, it.y, 1); }
    this.meter.set(this.elapsed / 20, PAL.sun2); this.frame.setTimer(`${Math.max(0, Math.ceil(20 - this.elapsed))}s  x${this.speedMul().toFixed(1)}`); this.frame.setProgress(`${this.right} sorted${this.wrong ? ` · ${this.wrong} wrong` : ''}`);
    if (this.elapsed >= 20) { this.ended = true; const base = this.total > 1 ? (this.right / (this.total - 1)) * 100 : 0; this.frame.finish(this.pinkTint ? Math.min(base, 60) : base); }
  }
  private shape(g: Phaser.GameObjects.Graphics, s: number, x: number, y: number, k: number) { if (s === 0) { g.fillRect(x - 14 * k, y - 10 * k, 28 * k, 20 * k); g.fillRect(x - 20 * k, y - 10 * k, 8 * k, 10 * k); g.fillRect(x + 12 * k, y - 10 * k, 8 * k, 10 * k); } else if (s === 1) { g.fillRect(x - 10 * k, y - 14 * k, 8 * k, 28 * k); g.fillRect(x + 2 * k, y - 14 * k, 8 * k, 28 * k); g.fillRect(x - 10 * k, y - 14 * k, 20 * k, 8 * k); } else { g.fillRect(x - 6 * k, y - 14 * k, 12 * k, 20 * k); g.fillRect(x - 6 * k, y + 2 * k, 20 * k, 8 * k); } }
}
