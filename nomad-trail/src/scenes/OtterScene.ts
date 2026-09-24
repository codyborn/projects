import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
import { pxSheet, px, R, P, ditherGradient, glyph } from '../art/pixel';
import { __glyphs } from '../art/font';
import { txt } from '../ui/theme';
import { Audio } from '../audio/synth';

/** The otter. Harajuku at dusk, a stranger with a sea otter on his shoulder. Launched with { onDone }. Five taps, then the aftermath. */
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
    // --- Harajuku at dusk: sky, far crowd, shop signs, string lights, wet pavement
    this.add.image(0, 0, 'otter_street').setOrigin(0).setDepth(0);
    const lights = this.add.image(0, 0, 'otter_lights').setOrigin(0).setDepth(1);
    this.tweens.add({ targets: lights, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });
    const crowd = this.add.tileSprite(0, 236, GAME_W, 60, 'otter_crowd').setOrigin(0).setDepth(1).setAlpha(0.9);
    this.tweens.add({ targets: crowd, tilePositionX: 120, duration: 14000, repeat: -1 });
    // --- the man, three-quarter from behind, hand up steadying the animal
    const man = this.add.image(GAME_W / 2 + 6, 640, 'otter_man').setOrigin(0.5, 1).setScale(SCALE).setDepth(2);
    this.tweens.add({ targets: man, y: 642, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // --- otter on the shoulder (left shoulder from our view), facing us
    if (!this.anims.exists('otter_idle')) {
      this.anims.create({ key: 'otter_idle', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [0, 0, 0, 1, 0, 0, 2, 2] }), frameRate: 3, repeat: -1 });
      this.anims.create({ key: 'otter_happy', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [3, 3, 2, 3] }), frameRate: 6, repeat: 0 });
      this.anims.create({ key: 'otter_wriggle', frames: this.anims.generateFrameNumbers('otter_sheet', { frames: [3, 2, 3, 2, 3] }), frameRate: 10, repeat: 1 });
    }
    this.otter = this.add.sprite(GAME_W / 2 - 54, 318, 'otter_sheet', 0).setScale(SCALE).setDepth(3);
    this.otter.play('otter_idle');
    this.bobTween = this.tweens.add({ targets: this.otter, y: this.otter.y + 2, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // --- copy
    this.add.rectangle(GAME_W / 2, 52, 300, 62, PAL.night0, 0.82).setDepth(5);
    txt(this, GAME_W / 2, 34, 'A MAN IN HARAJUKU HAS A SEA OTTER', 8, PAL.gray2, { align: 'center' }).setOrigin(0.5).setDepth(6);
    txt(this, GAME_W / 2, 46, 'ON HIS SHOULDER. HE NODS.', 8, PAL.gray2, { align: 'center' }).setOrigin(0.5).setDepth(6);
    const prompt = txt(this, GAME_W / 2, 68, 'Tap to pet.', 12, PAL.sun2, { align: 'center' }).setOrigin(0.5).setDepth(6); this.prompt = prompt;
    this.tweens.add({ targets: prompt, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    this.counter = txt(this, GAME_W / 2, 590, `PETS 0/${PETS_NEEDED}`, 10, PAL.white, { align: 'center' }).setOrigin(0.5).setDepth(6);
    // --- input: only the otter is tappable
    const hit = this.add.zone(this.otter.x, this.otter.y, FW * SCALE - 30, FH * SCALE + 16).setInteractive({ useHandCursor: true }).setDepth(7);
    hit.on('pointerdown', () => this.pet());
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
      const b = this.add.rectangle(this.otter.x + Phaser.Math.Between(-40, 40), this.otter.y + Phaser.Math.Between(-20, 20), 2, 2, PAL.sun3, 0.9).setDepth(5);
      this.tweens.add({ targets: b, y: b.y - 30, alpha: 0, scale: 0, duration: 500 + i * 80, onComplete: () => b.destroy() });
    }
    if (this.pets >= PETS_NEEDED) this.celebrate();
  }

  private celebrate() {
    if (this.done) return; this.done = true;
    this.prompt?.destroy(); this.tweens.killTweensOf(this.prompt);
    Audio.playSfx('blip'); this.time.delayedCall(120, () => Audio.playSfx('coin')); this.time.delayedCall(600, () => Audio.playSfx('chime'));
    this.otter.play('otter_wriggle');
    this.tweens.add({ targets: this.otter, angle: { from: -8, to: 8 }, duration: 90, yoyo: true, repeat: 5, ease: 'Sine.InOut', onComplete: () => this.otter.setAngle(0) });
    const plate = this.add.rectangle(GAME_W / 2, 68, 220, 30, PAL.night0, 0.9).setDepth(6).setAlpha(0);
    const cap = txt(this, GAME_W / 2, 68, 'It was worth it.', 14, PAL.sun3, { align: 'center' }).setOrigin(0.5).setDepth(7).setAlpha(0);
    this.tweens.add({ targets: [plate, cap], alpha: 1, duration: 500, delay: 500 });
    const nick = txt(this, GAME_W / 2, 612, 'you notice a small nick on your finger', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5).setDepth(6).setAlpha(0);
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
      // 4 frames: 0 idle (curled upright on the shoulder, facing us), 1 blink, 2 paws-up 'pet me', 3 happy squint
      pxSheet(this, 'otter_sheet', FW, FH, 4, (ctx, f) => {
        const body = PAL.earth1, belly = PAL.earth2, face = PAL.earth3, dark = PAL.earth0, ink = PAL.ink;
        // curled body, sitting: a rounded mound with the tail wrapping round the front-left
        R(ctx, 18, 22, 28, 22, body); R(ctx, 16, 26, 32, 16, body); R(ctx, 20, 20, 24, 2, body);
        R(ctx, 24, 30, 16, 12, belly);                          // chest
        R(ctx, 12, 36, 12, 5, dark); R(ctx, 10, 39, 8, 4, dark);  // tail curling in front
        R(ctx, 22, 43, 8, 3, dark); R(ctx, 34, 43, 8, 3, dark);   // hind flippers
        // head, facing the player
        R(ctx, 20, 6, 24, 18, body); R(ctx, 18, 9, 28, 13, body); R(ctx, 22, 4, 20, 2, body);
        R(ctx, 22, 12, 20, 10, face);                            // pale muzzle
        R(ctx, 17, 6, 4, 4, body); R(ctx, 43, 6, 4, 4, body); P(ctx, 18, 7, dark); P(ctx, 45, 7, dark); // ears
        if (f === 1) { R(ctx, 25, 14, 3, 1, ink); R(ctx, 36, 14, 3, 1, ink); }
        else if (f === 3) { R(ctx, 25, 15, 3, 1, ink); R(ctx, 36, 15, 3, 1, ink); P(ctx, 24, 14, ink); P(ctx, 28, 14, ink); P(ctx, 35, 14, ink); P(ctx, 39, 14, ink); }
        else { R(ctx, 25, 13, 3, 3, ink); R(ctx, 36, 13, 3, 3, ink); P(ctx, 26, 13, PAL.white); P(ctx, 37, 13, PAL.white); }
        R(ctx, 31, 17, 3, 2, ink); P(ctx, 32, 19, ink);          // nose, mouth
        P(ctx, 20, 17, PAL.white); P(ctx, 19, 19, PAL.white); P(ctx, 44, 17, PAL.white); P(ctx, 45, 19, PAL.white); // whiskers
        // paws: on the jacket (idle), up (pet me), clutching (happy)
        if (f === 2) { R(ctx, 20, 20, 5, 7, body); R(ctx, 39, 19, 5, 7, body); R(ctx, 21, 19, 3, 2, dark); R(ctx, 40, 18, 3, 2, dark); }
        else if (f === 3) { R(ctx, 26, 24, 5, 4, body); R(ctx, 33, 24, 5, 4, body); R(ctx, 27, 23, 3, 2, dark); R(ctx, 34, 23, 3, 2, dark); }
        else { R(ctx, 24, 29, 5, 4, body); R(ctx, 35, 29, 5, 4, body); R(ctx, 25, 28, 3, 2, dark); R(ctx, 36, 28, 3, 2, dark); }
        outlineSheet(ctx, FW, FH, PAL.ink);
      });
    }
    if (!T.exists('otter_man')) px(this, 'otter_man', 100, 118, ctx => {
      // three-quarter from behind: dark jacket, hair, right hand up steadying the otter on his left shoulder (screen-left)
      const jacket = PAL.night2, jacketHi = PAL.night3, skin = PAL.earth3, hair = PAL.ink, jeans = PAL.night1;
      R(ctx, 26, 44, 52, 74, jacket); R(ctx, 22, 48, 60, 40, jacket); R(ctx, 30, 44, 44, 4, jacketHi);   // torso + shoulders
      R(ctx, 26, 46, 6, 50, jacketHi);                                                                  // seam highlight
      R(ctx, 20, 52, 10, 30, jacket); R(ctx, 74, 52, 10, 30, jacket);                                  // upper arms
      R(ctx, 16, 30, 14, 26, jacket); R(ctx, 14, 26, 12, 8, skin); R(ctx, 15, 22, 10, 6, skin);        // left arm raised, hand up steadying
      R(ctx, 36, 10, 30, 32, skin); R(ctx, 34, 4, 34, 22, hair); R(ctx, 32, 12, 6, 16, hair); R(ctx, 64, 12, 6, 14, hair); // head from behind, hair
      R(ctx, 42, 40, 18, 8, skin);                                                                     // neck
      R(ctx, 30, 96, 20, 22, jeans); R(ctx, 54, 96, 20, 22, jeans);                                    // legs
      R(ctx, 22, 74, 60, 2, PAL.night0);                                                               // jacket hem line
      outlineSheet(ctx, 100, 118, PAL.ink);
    });
    if (!T.exists('otter_crowd')) px(this, 'otter_crowd', 240, 60, ctx => {
      // far crowd: blurred silhouettes, two tones, no faces
      for (let i = 0; i < 26; i++) { const x = (i * 37) % 236, h = 34 + (i % 4) * 5, c = i % 3 === 0 ? PAL.night3 : PAL.night2; R(ctx, x, 60 - h, 8, h, c); R(ctx, x + 1, 56 - h, 6, 6, c); }
    });
    if (!T.exists('otter_lights')) px(this, 'otter_lights', GAME_W, 300, ctx => {
      // two sagging strings of bulbs across the street
      for (const [y0, sag] of [[96, 14], [112, 10]] as const) for (let x = 0; x < GAME_W; x += 3) { const y = y0 + Math.sin((x / GAME_W) * Math.PI) * sag; P(ctx, x, y, PAL.gray0); if (x % 18 === 0) { R(ctx, x - 1, y + 1, 3, 3, [PAL.sun3, PAL.pink, PAL.sea3, PAL.sun2][(x / 18) % 4]); } }
    });
    if (!T.exists('otter_street')) px(this, 'otter_street', GAME_W, GAME_H, ctx => {
      // dusk sky
      ditherGradient(ctx, 0, 0, GAME_W, 240, [PAL.dusk1, PAL.dusk2, PAL.sun0, PAL.sun1], 4);
      // buildings either side, receding
      for (const [x, w, h, c] of [[0, 70, 200, PAL.night1], [70, 50, 170, PAL.night2], [120, 40, 150, PAL.night1], [200, 40, 150, PAL.night1], [240, 50, 170, PAL.night2], [290, 70, 200, PAL.night1]] as const) {
        R(ctx, x, 236 - h, w, h, c); for (let wy = 246 - h; wy < 226; wy += 12) for (let wx = x + 6; wx < x + w - 6; wx += 10) if (((wx + wy) & 3) === 0) R(ctx, wx, wy, 3, 4, PAL.sun3);
      }
      // shop signs: pastel + neon, pixel text and katakana-looking glyph blocks
      const signs: [number, number, number, number, number, string][] = [[6, 120, 58, 16, PAL.pink, 'CREPE'],  [72, 110, 44, 14, PAL.sun2, 'CAFE'], [296, 118, 58, 16, PAL.neon, 'PURIKURA'],  [244, 126, 44, 14, PAL.sun3, '100Y']];
      for (const [x, y, w, h, c, label] of signs) { R(ctx, x - 1, y - 1, w + 2, h + 2, PAL.ink); R(ctx, x, y, w, h, c); glyphText(ctx, label, x + 4, y + Math.floor((h - 7) / 2), PAL.ink); }
      // small horizontal katakana-ish signs (glyph blocks, not text)
      for (const [x, y, c] of [[8, 150, PAL.sea3], [300, 148, PAL.pink]] as const) { R(ctx, x - 1, y - 1, 56, 14, PAL.ink); R(ctx, x, y, 54, 12, c); for (let i = 0; i < 4; i++) { const gx = x + 4 + i * 13; R(ctx, gx, y + 3, 7, 2, PAL.ink); R(ctx, gx + (i % 2) * 4, y + 5, 2, 5, PAL.ink); R(ctx, gx + 5 - (i % 2) * 3, y + 6, 2, 4, PAL.ink); if (i % 3 === 0) R(ctx, gx + 1, y + 9, 5, 1, PAL.ink); } }
      // katakana-ish vertical sign blocks
      for (const [x, y] of [[120, 130], [232, 130]] as const) { R(ctx, x, y, 12, 60, PAL.red); for (let i = 0; i < 4; i++) { R(ctx, x + 3, y + 4 + i * 14, 6, 2, PAL.white); R(ctx, x + 3, y + 8 + i * 14, 2, 5, PAL.white); R(ctx, x + 7, y + 7 + i * 14, 2, 6, PAL.white); } }
      // crepe stand, left
      R(ctx, 8, 188, 60, 48, PAL.earth1); R(ctx, 4, 180, 68, 10, PAL.pink); for (let i = 0; i < 6; i++) R(ctx, 6 + i * 11, 180, 6, 10, PAL.white); R(ctx, 14, 196, 48, 22, PAL.sun3); R(ctx, 20, 202, 10, 12, PAL.pink); R(ctx, 36, 202, 10, 12, PAL.sea3); R(ctx, 52, 202, 6, 12, PAL.sun1);
      // street: wet pavement with sign reflections
      R(ctx, 0, 296, GAME_W, GAME_H - 296, PAL.night1); for (let y = 300; y < GAME_H; y += 16) R(ctx, 0, y, GAME_W, 1, PAL.night2);
      for (const [x, w, c] of [[6, 58, PAL.pink], [72, 44, PAL.sun2], [296, 58, PAL.neon], [244, 44, PAL.sun3]] as const) for (let y = 300; y < 420; y += 2) if (((x + y) & 3) === 0) R(ctx, x + ((y - 300) >> 3), w - ((y - 300) >> 2), 1, 1, c);
      for (let i = 0; i < 40; i++) P(ctx, (i * 53) % GAME_W, 300 + (i * 29) % 300, PAL.night3);
      // vignette
      for (let y = 0; y < GAME_H; y += 2) for (let x = 0; x < GAME_W; x += 2) { const d = Math.hypot(x - GAME_W / 2, y - 320) / 360; if (d > 0.9 && ((x + y) & 3) === 0) P(ctx, x, y, PAL.night0); }
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
