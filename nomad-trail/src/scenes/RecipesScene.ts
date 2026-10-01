import Phaser from 'phaser';
import { PAL, txt } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Audio } from '../audio/synth';
import { Data, getSettings } from '../ui/simBridge';
import { drawDish } from '../minigames/dishArt';
import type { Dish, MinigameLaunch, MinigameResult } from '../core/types';
import { launchOnTop } from '../ui/overlay';
import { recordDish } from '../ui/simBridge';

const W = 360, H = 640;
/* the dish texture is 96x64, so it is drawn at 0.78 to leave room for the name and score inside the card */
const COLS = 3, CW = 104, CH = 108, GAP = 8, ART = 0.78;
const GRID_X = (W - (COLS * CW + (COLS - 1) * GAP)) / 2, GRID_TOP = 96;
/* scroll feel: how long the list takes to reach the finger, how long a throw lasts, how hard the ends push back */
/* DECAY_MS 430 puts the throw between iOS 'normal' (~500) and 'fast' (~100). STOP_PXS is where it is called
   finished: below half a pixel a frame the list is only nudging the pixel grid, which reads as never settling. */
const TRACK_MS = 35, DECAY_MS = 430, SPRING_MS = 85, OVER = 0.42, VEL_WINDOW = 90, STOP_PXS = 30;

/** The recipe book: every dish in the game, greyed until the player has cooked it, then replayable with its best score. */
export class RecipesScene extends Phaser.Scene {
  static KEY = 'Recipes';
  private backKey?: string; private content!: Phaser.GameObjects.Container; private maxScroll = 0; private scrollY = 0;
  constructor() { super(RecipesScene.KEY); }
  init(d?: { back?: string }) { this.backKey = d?.back; this.scrollY = 0; this.aim = 0; this.vel = 0; this.dragging = false; }
  create() {
    this.cameras.main.setBackgroundColor(PAL.night0);
    const best = getSettings(this).career?.dishes ?? {};
    const dishes = Data.dishes as Dish[];
    const cooked = dishes.filter(d => best[d.id] !== undefined).length;

    this.content = this.add.container(0, 0).setDepth(2);
    dishes.forEach((d, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = GRID_X + col * (CW + GAP), y = GRID_TOP + row * (CH + GAP);
      const has = best[d.id] !== undefined;
      const card = new Panel(this, x, y, CW, CH, { fill: has ? PAL.night1 : PAL.night0, border: has ? PAL.night3 : PAL.night2 });
      this.content.add(card as any);
      const img = this.add.image(x + CW / 2, y + 30, drawDish(this, d.id, undefined, d.art)).setScale(ART);
      if (!has) img.setTint(PAL.night2);                                  /* a dish you have never cooked is a silhouette */
      this.content.add(img);
      const name = has ? d.name : '???';
      this.content.add(txt(this, x + CW / 2, y + 62, name, 8, has ? PAL.white : PAL.gray0, { align: 'center', wrap: CW - 12 }).setOrigin(0.5, 0) as any);
      this.content.add(txt(this, x + CW / 2, y + CH - 15, has ? `best ${best[d.id]}` : 'not cooked', 8, has ? PAL.neon : PAL.gray0, { align: 'center' }).setOrigin(0.5, 0) as any);
      if (has) {
        const hit = this.add.rectangle(x + CW / 2, y + CH / 2, CW, CH, PAL.white, 0).setInteractive({ useHandCursor: true });
        hit.on('pointerup', () => this.cook(d));
        this.content.add(hit);
      }
    });

    txt(this, W / 2, 28, 'RECIPES', 18, PAL.sun2).setOrigin(0.5).setDepth(5);
    txt(this, W / 2, 52, `${cooked} of ${dishes.length} cooked · tap to cook again`, 8, PAL.gray2, { align: 'center', wrap: 320 }).setOrigin(0.5, 0).setDepth(5);
    const rows = Math.ceil(dishes.length / COLS);
    this.maxScroll = Math.max(0, GRID_TOP + rows * (CH + GAP) + 12 - (H - 64));

    /* Scrolling, the way a phone does it. Four things matter and the first three were missing:
       · the finger's position is a *target*, chased with a 35 ms time constant. Touch events arrive coalesced and at
         their own rate (often slower than the frame), so applying them raw makes the grid step; 35 ms is below the
         threshold where a lag is felt but long enough to turn those steps into a ramp.
       · the throw speed comes from the last ~90 ms of movement, not the last event, and is dropped entirely if the
         finger came to rest before lifting (otherwise a careful placement flings the list away).
       · past either end the list follows at 42% and springs back: a hard stop is the thing that feels most like a game
         and least like a phone.
       · momentum is integrated straight into the position with an exponential decay. The old code ran the velocity into
         a target and then eased the position toward that target, which is two lags stacked. */
    let startScroll = 0, startY = 0, moved = false;
    const samples: { t: number; y: number }[] = [];
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      startY = p.y; startScroll = this.scrollY; this.aim = this.scrollY; this.vel = 0; moved = false; this.dragging = true;
      samples.length = 0; samples.push({ t: this.time.now, y: p.y });
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown || !this.dragging) return;
      if (Math.abs(p.y - startY) > 6) moved = true;
      samples.push({ t: this.time.now, y: p.y }); while (samples.length > 2 && this.time.now - samples[0].t > VEL_WINDOW) samples.shift();
      this.aim = this.rubber(startScroll + (startY - p.y));
    });
    const release = () => {
      if (!this.dragging) return; this.dragging = false;
      const now = this.time.now, last = samples[samples.length - 1];
      /* a finger that stopped before lifting means "stay here", not "throw" */
      if (!last || now - last.t > 70 || samples.length < 2) { this.vel = 0; return; }
      const first = samples[0]; const dt = last.t - first.t;
      this.vel = dt > 8 ? (first.y - last.y) / dt * 1000 : 0;   /* px per second, down-swipe positive */
    };
    this.input.on('pointerup', release); this.input.on('pointerupoutside', release);
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => { this.vel = 0; this.aim = this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.6, 0, this.maxScroll); });
    this.dragGuard = () => moved;

    this.add.rectangle(W / 2, H - 32, W, 64, PAL.night0).setDepth(9);
    new Button(this, W / 2, H - 32, 'BACK', () => { Audio.playSfx('back'); this.scene.start(this.backKey || 'Title'); }, { w: 200, h: 40, fill: PAL.dusk0, size: 12 }).setDepth(10);
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }
  private dragGuard: () => boolean = () => false;
  /** where the finger wants the list (drag) · how fast it is being thrown (px/s) */
  private aim = 0; private vel = 0; private dragging = false;
  /** How far past an end the list will follow the finger, and how hard it resists getting there. */
  private rubber(v: number) {
    if (v < 0) return v * OVER;
    if (v > this.maxScroll) return this.maxScroll + (v - this.maxScroll) * OVER;
    return v;
  }
  update(_t: number, dt: number) {
    const ms = Math.min(dt, 50);                                        /* a stalled frame must not teleport the list */
    if (this.dragging && !this.input.activePointer.isDown) this.dragging = false;   /* the finger left the canvas */
    if (this.dragging) {
      this.scrollY += (this.aim - this.scrollY) * (1 - Math.exp(-ms / TRACK_MS));
    } else {
      const over = this.scrollY < 0 ? -this.scrollY : this.scrollY > this.maxScroll ? this.maxScroll - this.scrollY : 0;
      if (over !== 0) {
        /* past the end: kill the throw quickly and spring back */
        this.vel *= Math.exp(-ms / 60);
        this.scrollY += this.vel * ms / 1000;
        const bound = this.scrollY < 0 ? 0 : this.maxScroll;
        this.scrollY += (bound - this.scrollY) * (1 - Math.exp(-ms / SPRING_MS));
        if (Math.abs(bound - this.scrollY) < 0.4) { this.scrollY = bound; this.vel = 0; }
      } else if (Math.abs(this.vel) > STOP_PXS) {
        this.scrollY += this.vel * ms / 1000;
        this.vel *= Math.exp(-ms / DECAY_MS);
      } else this.vel = 0;
    }
    this.content.setY(-Math.round(this.scrollY));                       /* round: the pixel font stays crisp */
  }
  /** Replay a dish: the Cooking scene on top, result recorded as a new personal best if it beats the old one. */
  private cook(d: Dish) {
    if (this.dragGuard()) return;
    if (!this.scene.get('Cooking')) return;
    Audio.playSfx('confirm');
    const launch: MinigameLaunch = {
      energy: 100, difficulty: 0.4, payload: { dish: d, city: d.city },
      onDone: (r: MinigameResult) => {
        if (this.scene.isActive('Cooking') || this.scene.isPaused('Cooking')) this.scene.stop('Cooking');
        this.scene.resume();
        if (!r.cancelled) { try { recordDish(d.id, r.score); } catch { /* storage can be unavailable */ } }
        this.scene.restart({ back: this.backKey });
      },
    };
    launchOnTop(this, 'Cooking', launch); this.scene.pause();
  }
}
export default RecipesScene;
