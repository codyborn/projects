// The morning coffee cinematic (Katana ZERO register). scene.launch('Coffee', { cityId, day, climate?, region?, onDone })
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
import type { City, Region } from '../core/types';
import { buildSkyline, Skyline } from '../art/skyline';
import { buildCoffeeKit } from '../art/sprites';
import { buildPixelFont, ptext } from '../art/font';
import { px, R, ditherGradient } from '../art/pixel';
import { Audio } from '../audio/synth';

export interface CoffeeData { cityId: string; day: number; climate?: City['climate']; region?: Region; onDone: () => void; }
export class CoffeeScene extends Phaser.Scene {
  private sky!: Skyline; private done = false; private data2!: CoffeeData; private t = 0;
  constructor() { super('Coffee'); }
  init(d: CoffeeData) { this.data2 = d; this.done = false; this.t = 0; }
  create() {
    buildPixelFont(this); buildCoffeeKit(this);
    const d = this.data2; const W = GAME_W, H = GAME_H;
    // outside world, seen through the window; starts at dawn, blue hour
    this.sky = buildSkyline(this, d.cityId, 'dawn', d.climate ?? 'temperate', W, H, Math.round(H * 0.5), d.region);
    this.sky.container.setPosition(0, -40);
    const night = this.add.rectangle(0, 0, W, H, PAL.night0, 0.55).setOrigin(0);
    // window frame + wall + counter
    px(this, 'cf_wall', W, H, ctx => { R(ctx, 0, 0, W, H, PAL.night1); R(ctx, 30, 60, 300, 300, PAL.night0); // hole for window (drawn transparent below)
      ctx.clearRect(34, 64, 292, 292); R(ctx, 178, 64, 4, 292, PAL.night1); R(ctx, 34, 208, 292, 4, PAL.night1);
      ditherGradient(ctx, 0, 380, W, H - 380, [PAL.night2, PAL.night1, PAL.night0]); R(ctx, 0, 376, W, 6, PAL.earth0); // counter edge
      // rain-on-glass streaks static
      for (let i = 0; i < 40; i++) { const x = 34 + (i * 37) % 292, y = 64 + (i * 71) % 260; R(ctx, x, y, 1, 6 + (i % 5) * 4, PAL.night3); } });
    this.add.image(0, 0, 'cf_wall').setOrigin(0);
    const glow = this.add.rectangle(180, 210, 292, 292, PAL.sun1, 0).setBlendMode(Phaser.BlendModes.ADD);
    // kit on the counter
    const grinder = this.add.sprite(96, 372, 'cf_grinder', 0).setOrigin(0.5, 1).setScale(2);
    const kettle = this.add.image(250, 372, 'cf_kettle').setOrigin(0.5, 1).setScale(2).setAngle(0);
    const dripper = this.add.image(176, 372, 'cf_dripper').setOrigin(0.5, 1).setScale(2).setAlpha(0);
    const cup = this.add.sprite(176, 372, 'cf_cup', 0).setOrigin(0.5, 1).setScale(2);
    const steam = this.add.particles(176, 330, 'cf_steam', { speedY: { min: -30, max: -60 }, speedX: { min: -8, max: 8 }, scale: { start: 1, end: 0 }, alpha: { start: 0.6, end: 0 }, lifespan: 1400, frequency: 90, emitting: false });
    const pour = this.add.graphics();
    const label = ptext(this, W / 2, 400, `DAY ${d.day - 1}`, PAL.sun3, 2).setOrigin(0.5, 0);
    const cityLbl = ptext(this, W / 2, 428, (d.cityId || '').toUpperCase(), PAL.gray2, 1).setOrigin(0.5, 0);
    const hint = ptext(this, W / 2, H - 30, 'TAP TO SKIP', PAL.gray1, 1).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 700 });
    Audio.playSfx('grind');
    // choreography
    const tl = this.tweens.chain({ tweens: [
      { targets: grinder, x: 96, duration: 900, onStart: () => grinder.play({ key: 'cf_grind', repeat: 5 }) },
      { targets: dripper, alpha: 1, duration: 200 },
      { targets: kettle, x: 200, y: 330, angle: -40, duration: 500, ease: 'Sine.easeInOut', onComplete: () => Audio.playSfx('pour') },
      { targets: cup, duration: 1200, onUpdate: (tw) => { const p = tw.progress; cup.setFrame(Math.min(4, Math.floor(p * 5))); pour.clear(); pour.lineStyle(2, PAL.earth2, 1); pour.lineBetween(186, 318, 176, 340); if (p > 0.15) steam.start(); } },
      { targets: kettle, x: 250, y: 372, angle: 0, duration: 400, onStart: () => pour.clear() },
      { targets: night, alpha: 0, duration: 1400, ease: 'Sine.easeIn', onStart: () => { this.sky.setTimeOfDay('day'); glow.setFillStyle(PAL.sun1, 0.25); this.tweens.add({ targets: glow, fillAlpha: 0, duration: 1600 }); Audio.playSfx('chime'); label.setText(`DAY ${d.day}`); this.tweens.add({ targets: label, scale: 1.3, yoyo: true, duration: 180 }); } },
      { targets: this.sky.container, y: -70, duration: 900, ease: 'Sine.easeInOut' },
    ], onComplete: () => this.finish() });
    void tl; void cityLbl;
    if (!this.anims.exists('cf_grind')) this.anims.create({ key: 'cf_grind', frames: this.anims.generateFrameNumbers('cf_grinder', { frames: [0, 1] }), frameRate: 6 });
    this.input.once('pointerdown', () => this.finish());
    this.cameras.main.fadeIn(300, 11, 15, 26);
  }
  update(_: number, dt: number) { this.t += dt; this.sky?.update(dt); this.sky?.scroll(dt * 0.004); }
  private finish() { if (this.done) return; this.done = true; this.cameras.main.fadeOut(250, 11, 15, 26); this.time.delayedCall(260, () => { const cb = this.data2.onDone; this.scene.stop(); cb && cb(); }); }
}
