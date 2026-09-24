// The morning coffee: a cup on the counter, steam rising, a static twilight skyline. scene.launch('Coffee', { cityId, day, climate?, region?, onDone })
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
import type { City, Region } from '../core/types';
import { buildSkyline } from '../art/skyline';
import { buildCoffeeKit } from '../art/sprites';
import { buildPixelFont, ptext } from '../art/font';
import { px, R, ditherGradient } from '../art/pixel';
import { Audio } from '../audio/synth';

export interface CoffeeData { cityId: string; day: number; climate?: City['climate']; region?: Region; onDone: () => void; }
export class CoffeeScene extends Phaser.Scene {
  private done = false; private data2!: CoffeeData;
  constructor() { super('Coffee'); }
  init(d: CoffeeData) { this.data2 = d; this.done = false; }
  create() {
    this.scene.bringToTop();
    buildPixelFont(this); if (!this.textures.exists('cf_grinder')) buildCoffeeKit(this);
    const d = this.data2; const W = GAME_W, H = GAME_H;
    // fully opaque backdrop first: nothing from the city screen can show through
    this.add.rectangle(0, 0, W, H, PAL.night0).setOrigin(0);
    // static twilight skyline through the window (drawn once, never scrolled)
    const sky = buildSkyline(this, d.cityId, 'dusk', d.climate ?? 'temperate', W, 360, 250, d.region);
    sky.container.setPosition(0, 40);
    // wall with a window cut-out, counter below
    px(this, 'cf_wall2', W, H, ctx => {
      R(ctx, 0, 0, W, H, PAL.night1); ctx.clearRect(34, 64, 292, 292);
      R(ctx, 178, 64, 4, 292, PAL.night1); R(ctx, 34, 208, 292, 4, PAL.night1);                 // window bars
      R(ctx, 30, 60, 300, 4, PAL.night2); R(ctx, 30, 356, 300, 4, PAL.night2); R(ctx, 30, 60, 4, 300, PAL.night2); R(ctx, 326, 60, 4, 300, PAL.night2);
      R(ctx, 0, 372, W, 8, PAL.earth1); R(ctx, 0, 380, W, H - 380, PAL.earth0);                 // counter
      ditherGradient(ctx, 0, 440, W, H - 440, [PAL.earth0, PAL.night1, PAL.night0]);
    });
    this.add.image(0, 0, 'cf_wall2').setOrigin(0);
    // the kit, static on the counter
    this.add.sprite(84, 372, 'cf_grinder', 0).setOrigin(0.5, 1).setScale(2);
    this.add.image(262, 372, 'cf_kettle').setOrigin(0.5, 1).setScale(2);
    this.add.image(150, 372, 'cf_dripper').setOrigin(0.5, 1).setScale(2);
    const cup = this.add.sprite(196, 372, 'cf_cup', 4).setOrigin(0.5, 1).setScale(2.5);
    // steam: the only thing that moves
    const steam = this.add.particles(196, 318, 'cf_steam', { speedY: { min: -22, max: -48 }, speedX: { min: -10, max: 10 }, scale: { start: 1.2, end: 0.2 }, alpha: { start: 0.7, end: 0 }, lifespan: 1800, frequency: 110, emitting: true });
    void steam; this.tweens.add({ targets: cup, scaleY: 2.55, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.easeInOut' });
    const label = ptext(this, W / 2, 404, `DAY ${d.day}`, PAL.sun3, 2).setOrigin(0.5, 0);
    ptext(this, W / 2, 432, (d.cityId || '').toUpperCase(), PAL.gray2, 1).setOrigin(0.5, 0);
    ptext(this, W / 2, 456, 'MORNING. THE GOOD KIND.', PAL.gray1, 1).setOrigin(0.5, 0);
    const hint = ptext(this, W / 2, H - 30, 'TAP TO CONTINUE', PAL.gray1, 1).setOrigin(0.5); this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });
    label.setAlpha(0); this.tweens.add({ targets: label, alpha: 1, duration: 500, delay: 300 });
    Audio.playSfx('chime');
    this.time.delayedCall(3500, () => this.finish());
    this.input.once('pointerdown', () => this.finish());
    this.cameras.main.fadeIn(300, 11, 15, 26);
  }
  private finish() { if (this.done) return; this.done = true; this.cameras.main.fadeOut(250, 11, 15, 26); this.time.delayedCall(260, () => { const cb = this.data2.onDone; this.scene.stop(); cb && cb(); }); }
}
