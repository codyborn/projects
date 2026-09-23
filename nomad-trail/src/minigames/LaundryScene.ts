import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';

/** Sort falling clothes: whites LEFT, colours RIGHT. Swipe/drag or arrow keys. 20s. One wrong sort = pink laundry. */
export class LaundryScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private meter!: Meter;
  private items: { x: number; y: number; vx: number; white: boolean; color: number; shape: number; done: boolean; result?: boolean }[] = []; private right = 0; private wrong = 0; private total = 0; private elapsed = 0; private tick?: Phaser.Time.TimerEvent; private downX = 0; private pinkTint = false; private ended = false;
  constructor() { super(MINIGAME_KEYS.laundry); }
  init(data: any) { this.launch = normalizeLaunch(data); this.items = []; this.right = 0; this.wrong = 0; this.total = 0; this.elapsed = 0; this.pinkTint = false; this.ended = false; }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Laundry day'); this.cameras.main.setBackgroundColor(PAL.night2);
    this.g = this.add.graphics().setDepth(3); this.meter = new Meter(this, 40, 600, W - 80, 8);
    panel(this, 20, 440, 130, 120, PAL.gray2, PAL.white, PAL.ink).setDepth(2); txt(this, 85, 570, 'WHITES', 10, PAL.gray2).setDepth(4); panel(this, W - 150, 440, 130, 120, PAL.dusk2, PAL.pink, PAL.ink).setDepth(2); txt(this, W - 85, 570, 'COLOURS', 10, PAL.gray2).setDepth(4);
    this.frame.hud();
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { this.downX = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { const dx = p.x - this.downX; if (Math.abs(dx) > 25) this.fling(dx < 0 ? -1 : 1); else this.fling(p.x < W / 2 ? -1 : 1); });
    this.input.keyboard?.on('keydown-LEFT', () => this.fling(-1)); this.input.keyboard?.on('keydown-RIGHT', () => this.fling(1));
    this.frame.intro('Whites to the LEFT basket, colours to the RIGHT. Swipe or tap a side. One wrong sock and everything goes pink.', () => { this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) }); this.spawn(); });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  update(_t: number, dt: number) { this.frame.update(dt); }
  private spawn() { const white = Math.random() < 0.5; const colors = [PAL.red, PAL.sky1, PAL.grass1, PAL.sun0, PAL.dusk3, PAL.sea2]; this.items.push({ x: W / 2, y: 60, vx: 0, white, color: white ? (Math.random() < 0.5 ? PAL.white : PAL.gray2) : Phaser.Utils.Array.GetRandom(colors), shape: Phaser.Math.Between(0, 2), done: false }); this.total++; }
  private fling(dir: number) { if (!this.frame.active || this.ended) return; const it = this.items.find(i => !i.done && i.vx === 0); if (!it) return; it.vx = dir * 260; const ok = (dir < 0) === it.white; it.result = ok; it.done = true; if (ok) { this.right++; this.frame.flash(PAL.neon, 30); } else { this.wrong++; this.pinkTint = true; this.frame.shake(120, 0.005); this.cameras.main.setBackgroundColor(PAL.dusk1); } this.time.delayedCall(280, () => { if (this.frame.active && !this.ended) this.spawn(); }); }
  private step(dt: number) {
    if (!this.frame.active || this.ended) return; this.elapsed += dt; const fall = 55 * this.frame.speed * (1 + 0.3 * this.frame.hard);
    for (const it of this.items) { if (it.vx) { it.x += it.vx * dt; it.y += 160 * dt; } else if (!it.done) { it.y += fall * dt; if (it.y > 420) { it.done = true; it.result = false; it.vx = 1; it.y = 470; this.wrong++; this.pinkTint = true; this.frame.shake(100, 0.004); this.time.delayedCall(200, () => { if (this.frame.active && !this.ended) this.spawn(); }); } } }
    this.items = this.items.filter(i => i.y < 620 && Math.abs(i.x - W / 2) < W);
    const g = this.g; g.clear(); g.fillStyle(PAL.gray0).fillRect(0, 40, W, 6); for (const it of this.items) { const tint = this.pinkTint && it.white ? PAL.pink : it.color; g.fillStyle(PAL.ink); this.shape(g, it.shape, it.x, it.y, 1.15); g.fillStyle(tint); this.shape(g, it.shape, it.x, it.y, 1); }
    this.meter.set(this.elapsed / 20, PAL.sun2); this.frame.setTimer(`${Math.max(0, Math.ceil(20 - this.elapsed))}s`); this.frame.setProgress(`${this.right} sorted${this.wrong ? ` · ${this.wrong} wrong` : ''}`);
    if (this.elapsed >= 20) { this.ended = true; const base = this.total > 1 ? (this.right / (this.total - 1)) * 100 : 0; this.frame.finish(this.pinkTint ? Math.min(base, 60) : base); }
  }
  private shape(g: Phaser.GameObjects.Graphics, s: number, x: number, y: number, k: number) { if (s === 0) { g.fillRect(x - 14 * k, y - 10 * k, 28 * k, 20 * k); g.fillRect(x - 20 * k, y - 10 * k, 8 * k, 10 * k); g.fillRect(x + 12 * k, y - 10 * k, 8 * k, 10 * k); } else if (s === 1) { g.fillRect(x - 10 * k, y - 14 * k, 8 * k, 28 * k); g.fillRect(x + 2 * k, y - 14 * k, 8 * k, 28 * k); g.fillRect(x - 10 * k, y - 14 * k, 20 * k, 8 * k); } else { g.fillRect(x - 6 * k, y - 14 * k, 12 * k, 20 * k); g.fillRect(x - 6 * k, y + 2 * k, 20 * k, 8 * k); } }
}
