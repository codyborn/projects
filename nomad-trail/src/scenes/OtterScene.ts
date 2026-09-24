import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
import { pxSheet, px, R, P, ditherGradient, circle, glyph } from '../art/pixel';
import { __glyphs } from '../art/font';
import { txt } from '../ui/theme';
import { Audio } from '../audio/synth';

/** The otter. Tokyo animal café, a tank, a sea otter that wants to be petted. Launched with { onDone }. Five taps, then the aftermath. */
export interface OtterData { onDone: () => void }
const PETS_NEEDED = 5, AUTO_MS = 12000, SCALE = 3, FW = 64, FH = 48;

export class OtterScene extends Phaser.Scene {
  static KEY = 'Otter';
  private onDone: () => void = () => {};
  private prompt?: any; private pets = 0; private done = false; private otter!: Phaser.GameObjects.Sprite; private counter!: any; private bobTween?: Phaser.Tweens.Tween;
  constructor() { super(OtterScene.KEY); }
  init(d?: OtterData) { this.onDone = d?.onDone ?? (() => {}); this.pets = 0; this.done = false; }

  create() {
    this.scene.bringToTop();
    this.buildTextures();
    // --- café backdrop
    this.add.image(0, 0, 'otter_bg').setOrigin(0).setDepth(0);
    // --- the tank (glass box), water, otter
    const tankX = 36, tankY = 168, tankW = GAME_W - 72, tankH = 236;
    this.add.image(tankX, tankY, 'otter_tank').setOrigin(0).setDepth(1);
    const water = this.add.tileSprite(tankX + 6, tankY + 40, tankW - 12, tankH - 46, 'otter_water').setOrigin(0).setDepth(2);
    this.tweens.add({ targets: water, tilePositionX: 64, duration: 6000, repeat: -1 });
    if (!this.anims.exists('otter_idle')) {
      this.anims.create({ key: 'otter_idle', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [0, 0, 0, 1, 0, 0, 2, 2] }), frameRate: 3, repeat: -1 });
      this.anims.create({ key: 'otter_happy', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [3, 3, 2, 3] }), frameRate: 6, repeat: 0 });
      this.anims.create({ key: 'otter_roll', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [3, 2, 0, 1, 3] }), frameRate: 8, repeat: 1 });
    }
    this.otter = this.add.sprite(GAME_W / 2, tankY + tankH / 2 + 14, 'otter_sheet', 0).setScale(SCALE).setDepth(3);
    this.otter.play('otter_idle');
    this.bobTween = this.tweens.add({ targets: this.otter, y: this.otter.y - 5, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // glass sheen over the water
    const sheen = this.add.image(tankX, tankY, 'otter_glass').setOrigin(0).setDepth(4).setAlpha(0.55);
    this.tweens.add({ targets: sheen, alpha: 0.35, duration: 2200, yoyo: true, repeat: -1 });
    // --- copy
    txt(this, GAME_W / 2, 122, 'THE HANDLER NODS TOWARD THE TANK.', 8, PAL.gray2, { align: 'center' }).setOrigin(0.5).setDepth(6);
    const prompt = txt(this, GAME_W / 2, 138, 'Tap to pet.', 12, PAL.sun2, { align: 'center' }).setOrigin(0.5).setDepth(6); this.prompt = prompt;
    this.tweens.add({ targets: prompt, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    this.counter = txt(this, GAME_W / 2, tankY + tankH + 22, `PETS 0/${PETS_NEEDED}`, 10, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(6);
    // --- input: only the otter is tappable (generous hit box around the sprite, in world space)
    const hit = this.add.zone(this.otter.x, this.otter.y, FW * SCALE + 24, FH * SCALE + 24).setInteractive({ useHandCursor: true }).setDepth(7);
    hit.on('pointerdown', () => this.pet());
    // auto-continue
    this.time.delayedCall(AUTO_MS, () => this.finish());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.bobTween?.stop(); });
  }

  private pet() {
    if (this.done) return;
    this.pets++;
    Audio.playSfx('coin');
    this.counter.setText(`PETS ${Math.min(this.pets, PETS_NEEDED)}/${PETS_NEEDED}`);
    // squash + happy face
    this.tweens.add({ targets: this.otter, scaleX: SCALE * 1.12, scaleY: SCALE * 0.88, duration: 70, yoyo: true, ease: 'Quad.Out' });
    this.otter.play('otter_happy'); this.otter.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => { if (!this.done) this.otter.play('otter_idle'); });
    // hearts + bubbles
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(this.otter.x + Phaser.Math.Between(-40, 40), this.otter.y - 30, 'otter_heart').setScale(2).setDepth(8).setAlpha(0.95);
      this.tweens.add({ targets: h, y: h.y - 70 - i * 12, x: h.x + Phaser.Math.Between(-14, 14), alpha: 0, duration: 800 + i * 120, ease: 'Sine.Out', onComplete: () => h.destroy() });
    }
    for (let i = 0; i < 4; i++) {
      const b = this.add.circle(this.otter.x + Phaser.Math.Between(-50, 50), this.otter.y + 20, Phaser.Math.Between(1, 3), PAL.sky3, 0.8).setDepth(5);
      this.tweens.add({ targets: b, y: b.y - 60, alpha: 0, duration: 900 + i * 100, onComplete: () => b.destroy() });
    }
    if (this.pets >= PETS_NEEDED) this.celebrate();
  }

  private celebrate() {
    if (this.done) return; this.done = true;
    this.prompt?.destroy(); this.tweens.killTweensOf(this.prompt);
    Audio.playSfx('chime');
    this.otter.play('otter_roll');
    this.tweens.add({ targets: this.otter, angle: 360, duration: 900, ease: 'Sine.InOut', onComplete: () => this.otter.setAngle(0) });
    const plate = this.add.rectangle(GAME_W / 2, 144, 220, 30, PAL.night0, 0.9).setDepth(6).setAlpha(0);
    const cap = txt(this, GAME_W / 2, 144, 'It was worth it.', 14, PAL.sun3, { align: 'center' }).setOrigin(0.5).setDepth(7).setAlpha(0);
    this.tweens.add({ targets: [plate, cap], alpha: 1, duration: 500, delay: 500 });
    const nick = txt(this, GAME_W / 2, GAME_H - 96, 'you notice a small nick on your finger', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5).setDepth(6).setAlpha(0);
    this.tweens.add({ targets: nick, alpha: 1, duration: 700, delay: 1500 });
    this.time.delayedCall(3000, () => this.finish());
  }

  private finish() {
    if ((this as any)._finished) return; (this as any)._finished = true;
    const cb = this.onDone; this.scene.stop(); cb();
  }

  // ---------------------------------------------------------------- textures
  private buildTextures() {
    const T = this.textures;
    if (!T.exists('otter_sheet')) {
      // 4 frames: 0 idle float, 1 blink, 2 paws-up 'pet me', 3 happy squint
      pxSheet(this, 'otter_sheet', FW, FH, 4, (ctx, f) => {
        const body = PAL.earth1, belly = PAL.earth2, face = PAL.earth3, dark = PAL.earth0, ink = PAL.ink, nose = PAL.ink;
        // body on its back (a long rounded blob), tail to the right
        R(ctx, 12, 20, 40, 16, body); R(ctx, 10, 22, 44, 12, body); R(ctx, 14, 18, 36, 2, body);
        R(ctx, 16, 24, 30, 9, belly);                         // belly
        R(ctx, 50, 26, 10, 5, dark); R(ctx, 56, 24, 6, 4, dark); // tail
        // hind flippers
        R(ctx, 44, 33, 8, 4, dark); R(ctx, 47, 36, 6, 3, dark);
        // head (left), round
        R(ctx, 6, 12, 18, 16, body); R(ctx, 4, 14, 22, 12, body); R(ctx, 8, 10, 14, 2, body);
        R(ctx, 8, 16, 14, 9, face);                            // face patch
        R(ctx, 3, 12, 4, 4, body); R(ctx, 22, 11, 4, 4, body);  // ears
        P(ctx, 4, 13, dark); P(ctx, 24, 12, dark);
        // eyes
        if (f === 1) { R(ctx, 9, 19, 3, 1, ink); R(ctx, 17, 19, 3, 1, ink); }            // blink
        else if (f === 3) { R(ctx, 9, 20, 3, 1, ink); R(ctx, 17, 20, 3, 1, ink); P(ctx, 8, 19, ink); P(ctx, 12, 19, ink); P(ctx, 16, 19, ink); P(ctx, 20, 19, ink); } // happy squint ^^
        else { R(ctx, 9, 18, 3, 3, ink); R(ctx, 17, 18, 3, 3, ink); P(ctx, 10, 18, PAL.white); P(ctx, 18, 18, PAL.white); }
        // nose + mouth + whiskers
        R(ctx, 13, 22, 3, 2, nose); P(ctx, 14, 24, ink);
        P(ctx, 5, 22, PAL.white); P(ctx, 4, 24, PAL.white); P(ctx, 23, 22, PAL.white); P(ctx, 24, 24, PAL.white);
        // paws
        if (f === 2) { R(ctx, 18, 12, 5, 6, body); R(ctx, 28, 11, 5, 6, body); R(ctx, 19, 11, 3, 2, dark); R(ctx, 29, 10, 3, 2, dark); } // paws up
        else if (f === 3) { R(ctx, 20, 16, 5, 4, body); R(ctx, 27, 16, 5, 4, body); R(ctx, 21, 15, 3, 2, dark); R(ctx, 28, 15, 3, 2, dark); } // clutching
        else { R(ctx, 20, 21, 5, 4, body); R(ctx, 28, 21, 5, 4, body); R(ctx, 21, 20, 3, 2, dark); R(ctx, 29, 20, 3, 2, dark); }            // resting on belly
        // 1px outline
        outlineSheet(ctx, FW, FH, PAL.ink);
        // waterline highlight under the body
        R(ctx, 10, 36, 44, 1, PAL.sea3);
      });
    }
    if (!T.exists('otter_water')) px(this, 'otter_water', 64, 200, ctx => {
      ditherGradient(ctx, 0, 0, 64, 200, [PAL.sea2, PAL.sea1, PAL.sea0], 2);
      // caustic ripples
      for (let i = 0; i < 18; i++) { const y = 8 + i * 10, x = (i * 23) % 60; R(ctx, x, y, 8 + (i % 3) * 4, 1, PAL.sea3); }
      for (let i = 0; i < 24; i++) P(ctx, (i * 17) % 64, (i * 41) % 200, PAL.sky3);
    });
    if (!T.exists('otter_tank')) px(this, 'otter_tank', GAME_W - 72, 236, ctx => {
      const w = GAME_W - 72, h = 236;
      R(ctx, 0, 0, w, h, PAL.gray0); R(ctx, 2, 2, w - 4, h - 4, PAL.night2);       // frame
      R(ctx, 0, 0, w, 40, PAL.night1); R(ctx, 0, 38, w, 2, PAL.gray1);            // top rail / air gap
      // rim text
      glyphText(ctx, 'PLEASE DO NOT TAP THE GLASS', 10, 16, PAL.gray1);
      R(ctx, 4, 40, 2, h - 44, PAL.sky3); R(ctx, w - 6, 40, 2, h - 44, PAL.sky3);   // glass edges
      R(ctx, 0, h - 6, w, 6, PAL.gray0);
    });
    if (!T.exists('otter_glass')) px(this, 'otter_glass', GAME_W - 72, 236, ctx => {
      const w = GAME_W - 72, h = 236;
      // diagonal sheen streaks
      for (let i = 0; i < 3; i++) { const x0 = 20 + i * 70; for (let y = 44; y < h - 8; y++) P(ctx, x0 + Math.round((y - 44) * 0.5), y, PAL.sky3); for (let y = 44; y < h - 8; y += 3) P(ctx, x0 + 6 + Math.round((y - 44) * 0.5), y, PAL.sky3); }
    });
    if (!T.exists('otter_heart')) px(this, 'otter_heart', 7, 6, ctx => {
      const c = PAL.pink; R(ctx, 1, 0, 2, 1, c); R(ctx, 4, 0, 2, 1, c); R(ctx, 0, 1, 7, 2, c); R(ctx, 1, 3, 5, 1, c); R(ctx, 2, 4, 3, 1, c); P(ctx, 3, 5, c);
    });
    if (!T.exists('otter_bg')) px(this, 'otter_bg', GAME_W, GAME_H, ctx => {
      // warm café wall, wood floor, lamps, sign, handler silhouette
      ditherGradient(ctx, 0, 0, GAME_W, 420, [PAL.dusk0, PAL.night2, PAL.night1], 4);
      R(ctx, 0, 420, GAME_W, GAME_H - 420, PAL.earth0); for (let y = 426; y < GAME_H; y += 14) R(ctx, 0, y, GAME_W, 1, PAL.earth1); // floorboards
      // shelves with cups
      R(ctx, 0, 60, 110, 3, PAL.earth1); for (let i = 0; i < 5; i++) { R(ctx, 8 + i * 20, 50, 10, 10, [PAL.sun3, PAL.sea3, PAL.pink, PAL.grass3, PAL.white][i]); }
      // hanging lamps with warm glow
      for (const lx of [70, 180, 290]) { R(ctx, lx, 0, 1, 26, PAL.gray1); R(ctx, lx - 8, 26, 17, 6, PAL.gray0); R(ctx, lx - 5, 32, 11, 3, PAL.sun2); circle(ctx, lx, 40, 3, PAL.sun3); for (let r = 6; r < 40; r += 6) for (let a = 0; a < 20; a++) { const ang = a / 20 * Math.PI; const x = lx + Math.cos(ang) * r, y = 36 + Math.sin(ang) * r * 0.6; if (((Math.round(x) + Math.round(y)) & 1) === 0) P(ctx, x, y, PAL.dusk1); } }
      // sign
      R(ctx, 108, 66, 144, 22, PAL.ink); R(ctx, 110, 68, 140, 18, PAL.red); glyphText(ctx, 'ANIMAL  CAFE', 128, 74, PAL.sun3);
      // handler silhouette (right), arm pointing at the tank
      R(ctx, 296, 232, 26, 70, PAL.night0); circle(ctx, 309, 220, 11, PAL.night0); R(ctx, 270, 250, 28, 6, PAL.night0); R(ctx, 296, 300, 10, 40, PAL.night0); R(ctx, 312, 300, 10, 40, PAL.night0);
      R(ctx, 300, 238, 18, 4, PAL.grass1); // lanyard
      // a paper sign on the wall
      R(ctx, 20, 200, 12, 16, PAL.white); R(ctx, 22, 203, 8, 1, PAL.gray1); R(ctx, 22, 206, 8, 1, PAL.gray1); R(ctx, 22, 209, 5, 1, PAL.gray1);
      // vignette
      for (let y = 0; y < GAME_H; y += 2) for (let x = 0; x < GAME_W; x += 2) { const d = Math.hypot(x - GAME_W / 2, y - 300) / 340; if (d > 0.85 && ((x + y) & 3) === 0) P(ctx, x, y, PAL.night0); }
    });
  }
}

function outlineSheet(ctx: CanvasRenderingContext2D, w: number, h: number, c: number) {
  const img = ctx.getImageData(0, 0, w, h); const d = img.data; const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
  const out: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!solid(x, y) && (solid(x + 1, y) || solid(x - 1, y) || solid(x, y + 1) || solid(x, y - 1))) out.push([x, y]);
  for (const [x, y] of out) P(ctx, x, y, c);
}
function glyphText(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, c: number) {
  const G = __glyphs(); let cx = x; for (const ch of s) { const pat = G[ch] || G['?']; if (ch !== ' ') glyph(ctx, pat, cx, y, c, 1); cx += 6; }
}
export default OtterScene;
