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

/** The recipe book: every dish in the game, greyed until the player has cooked it, then replayable with its best score. */
export class RecipesScene extends Phaser.Scene {
  static KEY = 'Recipes';
  private backKey?: string; private content!: Phaser.GameObjects.Container; private maxScroll = 0; private scrollY = 0;
  constructor() { super(RecipesScene.KEY); }
  init(d?: { back?: string }) { this.backKey = d?.back; this.scrollY = 0; }
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

    let downY = 0, start = 0, moved = false;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { downY = p.y; start = this.scrollY; moved = false; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!p.isDown) return; if (Math.abs(p.y - downY) > 6) moved = true; this.setScroll(start + (downY - p.y)); });
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => this.setScroll(this.scrollY + dy * 0.5));
    this.input.on('pointerup', () => { if (moved) this.input.enabled = this.input.enabled; });   /* a drag must not also open a recipe */
    this.dragGuard = () => moved;

    this.add.rectangle(W / 2, H - 32, W, 64, PAL.night0).setDepth(9);
    new Button(this, W / 2, H - 32, 'BACK', () => { Audio.playSfx('back'); this.scene.start(this.backKey || 'Title'); }, { w: 200, h: 40, fill: PAL.dusk0, size: 12 }).setDepth(10);
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }
  private dragGuard: () => boolean = () => false;
  private setScroll(v: number) { this.scrollY = Phaser.Math.Clamp(v, 0, this.maxScroll); this.content.setY(-this.scrollY); }
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
