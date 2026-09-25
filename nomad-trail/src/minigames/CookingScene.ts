import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type Dish, type DishStep, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';
import { drawDish, layerCount, DISH_TEX_W, DISH_TEX_H } from './dishArt';

const DEFAULT_DISH: Dish = { id: 'dalbhat', name: 'Dal Bhat', city: 'kathmandu', ingredients: ['lentils', 'rice', 'spinach', 'cumin'], health: 20, mood: 10,
  steps: [{ kind: 'chop', count: 6 }, { kind: 'pour', count: 1 }, { kind: 'stir', count: 3 }, { kind: 'season', count: 4 }, { kind: 'flip', count: 3 }, { kind: 'knead', count: 12 }] };

const STEP_TEXT: Record<DishStep['kind'], string> = {
  chop: 'TAP when the knife is over the green band', stir: 'DRAG in circles to stir', flip: 'TAP at the top of the toss',
  season: 'TAP exactly the right number of times, then wait', pour: 'HOLD to pour, release inside the band', knead: 'TAP fast to knead',
  grill: 'HOLD to sear, release in the golden band', dice: 'TAP the cubes in the order they lit up', roll: 'SWIPE left to right to roll',
  simmer: 'TAP to add heat, keep the needle in the green', shake: 'SWIPE left, right, left, right', fold: 'DRAG along the dotted path',
  plate: 'DRAG each garnish onto its spot', skewer: 'TAP as each piece crosses the skewer',
};

/** Cooking-Mama style: a dish is a sequence of micro-tasks. Score = mean accuracy. */
export class CookingScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private dish!: Dish; private cityLabel = '';
  private stepIdx = 0; private accuracies: number[] = [];
  private work!: Phaser.GameObjects.Graphics; private plateImg!: Phaser.GameObjects.Image; private layersTotal = 0; private stepText!: Phaser.GameObjects.Text; private hint!: Phaser.GameObjects.Text;
  private meter!: Meter; private cleanup: (() => void)[] = []; private stepTimer?: Phaser.Time.TimerEvent;

  constructor() { super(MINIGAME_KEYS.cooking); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {};
    const raw: Dish = (p.steps ? p : p.dish && p.dish.steps ? p.dish : DEFAULT_DISH) as Dish;
    this.dish = { ...raw, steps: raw.steps.slice(0, 5) };            // at most 5 steps so a dish fits the play cap
    // city tie: payload.cityName (pretty) > payload.city (id) > dish.city (id)
    this.cityLabel = String(p.cityName || p.city || raw.city || '').replace(/[-_]/g, ' ');
    this.stepIdx = 0; this.accuracies = []; this.cleanup = [];
  }

  create() {
    this.frame = new MinigameFrame(this, this.launch, this.dish.name);
    this.cameras.main.setBackgroundColor(PAL.night1);
    // counter top + plate
    this.add.rectangle(W / 2, 470, W, 340, PAL.earth1).setDepth(0);
    this.add.rectangle(W / 2, 300, W, 4, PAL.earth0);
    this.layersTotal = layerCount(this.dish.id, this.dish.art);
    this.plateImg = this.add.image(W / 2, 200, drawDish(this, this.dish.id, 0, this.dish.art)).setDepth(2).setScale(2);
    this.add.rectangle(W / 2, 200 + DISH_TEX_H + 4, DISH_TEX_W * 2 + 8, 6, PAL.ink, 0.35).setDepth(1);
    if (this.cityLabel) txt(this, W / 2, 44, `A ${this.cityLabel.toUpperCase()} DISH`, 9, PAL.sun3);
    txt(this, W / 2, 60, this.dish.ingredients.join(' · '), 9, PAL.gray2);
    this.stepText = txt(this, W / 2, 330, '', 14, PAL.sun2).setDepth(5);
    this.hint = txt(this, W / 2, 610, '', 10, PAL.gray2).setDepth(5);
    this.work = this.add.graphics().setDepth(4);
    this.meter = new Meter(this, 40, 590, W - 80, 8);
    this.frame.hud();
    this.frame.scoreNow = () => { const done = this.accuracies; return done.length ? (done.reduce((a, b) => a + b, 0) / done.length) * 100 * (0.6 + 0.4 * done.length / this.dish.steps.length) : 40; };
    this.frame.intro(`${this.dish.steps.length} steps. Follow each instruction.`, () => this.nextStep());
  }

  update(_t: number, dt: number) { this.frame.update(dt); }

  /** Reveal layers in proportion to completed steps: the vessel first, the finished dish on the last step. */
  private drawPlate(finalReveal = false) {
    const steps = Math.max(1, this.dish.steps.length);
    const shown = finalReveal ? this.layersTotal : Math.floor((this.stepIdx / steps) * this.layersTotal);
    const key = drawDish(this, this.dish.id, shown, this.dish.art);
    if (this.plateImg.texture.key !== key) { this.plateImg.setTexture(key); this.tweens.add({ targets: this.plateImg, scaleY: { from: 1.85, to: 2 }, duration: 160, ease: 'Back.Out' }); }
  }
  /** The finished dish, big and centred, with a treatment for how well it went: sparkle (90+), plain (50-90), a bit burnt (30-50), questionable (<30). */
  private finalReveal(score01: number) {
    this.drawPlate(true); const pct = score01 * 100; const cx = W / 2, cy = 250;
    this.frame.pauseCap();
    const grade = pct >= 90 ? 'kiss' : pct >= 50 ? 'good' : pct >= 30 ? 'burnt' : 'bad';
    const label = { kiss: "CHEF'S KISS", good: 'GOOD', burnt: 'A BIT BURNT', bad: 'QUESTIONABLE' }[grade]; const color = { kiss: PAL.sun2, good: PAL.neon, burnt: PAL.earth2, bad: PAL.grass2 }[grade];
    this.plateImg.setDepth(8); this.tweens.add({ targets: this.plateImg, x: cx, y: cy, scale: 3.4, duration: 420, ease: 'Back.Out' });
    if (grade === 'burnt') this.plateImg.setTint(PAL.earth1);          // slightly brown
    if (grade === 'bad') { this.plateImg.setTint(PAL.grass1); this.tweens.add({ targets: this.plateImg, angle: { from: -3, to: 3 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); }   // slightly green, queasy
    if (grade === 'kiss') { const glow = this.add.rectangle(cx, cy, 340, 220, PAL.sun1, 0.22).setDepth(7).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: glow, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 1400 });
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const sp = this.add.rectangle(cx + Math.cos(a) * 90, cy + Math.sin(a) * 50, 5, 5, i % 2 ? PAL.sun3 : PAL.white).setDepth(9).setAlpha(0); this.tweens.add({ targets: sp, alpha: { from: 1, to: 0 }, scale: { from: 1.6, to: 0.3 }, x: cx + Math.cos(a) * 150, y: cy + Math.sin(a) * 90, duration: 800, delay: 150 + i * 50, onComplete: () => sp.destroy() }); } }
    if (grade === 'burnt' || grade === 'bad') for (let i = 0; i < 4; i++) { const wisp = this.add.graphics().setDepth(9); wisp.fillStyle(grade === 'burnt' ? PAL.gray0 : PAL.grass1, 0.9); for (let k = 0; k < 5; k++) wisp.fillRect(cx - 40 + i * 26 + ((k + i) % 2) * 4, cy - 70 - k * 9, 4, 6); wisp.setAlpha(0); this.tweens.add({ targets: wisp, alpha: { from: 0.9, to: 0 }, y: -36, duration: 1500, delay: i * 140, onComplete: () => wisp.destroy() }); }
    else if (grade === 'good') for (let i = 0; i < 3; i++) { const wisp = this.add.graphics().setDepth(9); wisp.fillStyle(PAL.gray2, 0.9); for (let k = 0; k < 4; k++) wisp.fillRect(cx - 24 + i * 24 + ((k + i) % 2) * 3, cy - 74 - k * 8, 3, 5); wisp.setAlpha(0); this.tweens.add({ targets: wisp, alpha: { from: 0.9, to: 0 }, y: -28, duration: 1300, delay: i * 150, onComplete: () => wisp.destroy() }); }
    const t = txt(this, cx, cy + 108, label, 14, color).setDepth(9).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, y: cy + 100, duration: 300, delay: 350 });
    txt(this, cx, cy + 124, `${Math.round(pct)} / 100`, 9, PAL.gray2).setDepth(9);
    this.time.delayedCall(1500, () => { this.frame.resumeCap(); this.frame.finish(pct); });
  }

  private endStep(acc: number) {
    this.cleanup.forEach(f => f()); this.cleanup = []; this.stepTimer?.remove(); this.work.clear();
    const dbg = (this.launch.payload as any)?.debugAccuracy; if (typeof dbg === 'number') acc = dbg;   // harness only
    acc = clamp(acc, 0, 1); this.accuracies.push(acc);
    const g = this.add.graphics().setDepth(6); g.fillStyle(acc > 0.85 ? PAL.neon : acc > 0.5 ? PAL.sun2 : PAL.red).fillCircle(W / 2, 330, 4);
    txt(this, W / 2, 360, acc > 0.85 ? 'great' : acc > 0.5 ? 'ok' : 'sloppy', 11, acc > 0.85 ? PAL.neon : acc > 0.5 ? PAL.sun2 : PAL.red).setDepth(6).setName('fb');
    if (acc < 0.5) this.frame.shake();
    this.stepIdx++; this.drawPlate();
    this.time.delayedCall(700, () => { g.destroy(); this.children.list.filter(o => o.name === 'fb').forEach(o => o.destroy()); this.nextStep(); });
  }

  private nextStep() {
    if (this.stepIdx >= this.dish.steps.length) {
      const mean = this.accuracies.reduce((a, b) => a + b, 0) / Math.max(1, this.accuracies.length);
      this.stepText.setText(this.dish.name.toUpperCase()); this.hint.setText(''); this.finalReveal(mean); return;
    }
    const st = this.dish.steps[this.stepIdx];
    this.frame.setProgress(`STEP ${this.stepIdx + 1}/${this.dish.steps.length}`);
    this.stepText.setText(st.kind.toUpperCase()); this.hint.setText(STEP_TEXT[st.kind]);
    const table: Record<DishStep['kind'], () => void> = { chop: () => this.stepChop(st), stir: () => this.stepStir(st), flip: () => this.stepFlip(st), season: () => this.stepSeason(st), pour: () => this.stepPour(st), knead: () => this.stepKnead(st),
      grill: () => this.stepGrill(st), dice: () => this.stepDice(st), roll: () => this.stepRoll(st), simmer: () => this.stepSimmer(st), shake: () => this.stepShake(st), fold: () => this.stepFold(st), plate: () => this.stepPlate(st), skewer: () => this.stepSkewer(st) };
    (table[st.kind] ?? table.season)();
  }

  // --- CHOP: knife sweeps over an ingredient; tap in the band.
  private stepChop(st: DishStep) {
    const y = 450, x0 = 60, x1 = W - 60; let t = 0, hits = 0, taps = 0; const need = st.count; const bandW = 0.18 * this.frame.window + 0.06; const bandC = 0.5;
    const speed = 1.1 * this.frame.speed; const knife = this.add.graphics().setDepth(5);
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => {
      t += 0.016 * speed; const ph = (Math.sin(t * Math.PI) + 1) / 2; const kx = x0 + ph * (x1 - x0);
      this.work.clear(); this.work.fillStyle(PAL.grass1).fillRoundedRect(x0, y - 14, x1 - x0, 28, 4);
      this.work.fillStyle(PAL.neon, 0.5).fillRect(x0 + (bandC - bandW / 2) * (x1 - x0), y - 18, bandW * (x1 - x0), 36);
      for (let i = 0; i < hits; i++) this.work.fillStyle(PAL.ink).fillRect(x0 + 8 + i * ((x1 - x0 - 16) / need), y - 12, 2, 24);
      knife.clear(); knife.fillStyle(PAL.gray2).fillRect(kx - 2, y - 60, 4, 50); knife.fillStyle(PAL.earth0).fillRect(kx - 3, y - 74, 6, 16);
      (knife as any).ph = ph; this.meter.set(hits / need);
    } });
    const handler = () => { taps++; const ph = (knife as any).ph as number; if (Math.abs(ph - bandC) <= bandW / 2) { hits++; this.frame.flash(PAL.neon, 40); } else this.frame.shake(60, 0.002); if (hits >= need) this.endStep(hits / Math.max(taps, need)); };
    this.frame.onTap(handler);
    this.stepTimer = this.time.delayedCall(need * 1100 + 1500, () => this.endStep(hits / Math.max(taps, need) * 0.8));
    this.cleanup.push(() => { tick.remove(); knife.destroy(); this.removeTap(handler); });
  }

  // --- STIR: drag circles around the bowl.
  private stepStir(st: DishStep) {
    const cx = W / 2, cy = 450; let lastA: number | null = null, acc = 0; const need = st.count * Math.PI * 2; const spoon = this.add.graphics().setDepth(5); let ang = 0;
    const draw = () => { this.work.clear(); this.work.fillStyle(PAL.ink).fillCircle(cx, cy, 72); this.work.fillStyle(PAL.gray0).fillCircle(cx, cy, 68); this.work.fillStyle(PAL.sun1).fillCircle(cx, cy, 56);
      this.work.lineStyle(3, PAL.sun2, 0.6); for (let i = 0; i < 3; i++) this.work.strokeCircle(cx, cy, 20 + i * 14 + Math.sin(acc + i) * 3);
      spoon.clear(); spoon.fillStyle(PAL.earth3).fillCircle(cx + Math.cos(ang) * 40, cy + Math.sin(ang) * 40, 7); spoon.fillStyle(PAL.earth2).fillRect(cx + Math.cos(ang) * 40 - 2, cy + Math.sin(ang) * 40 - 40, 4, 40); this.meter.set(acc / need); };
    draw();
    const move = (p: Phaser.Input.Pointer) => { if (!this.frame.active || !p.isDown) return; const a = Math.atan2(p.y - cy, p.x - cx); if (lastA !== null) { let d = a - lastA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; acc += Math.abs(d) * (1 - 0.3 * this.frame.hard); ang = a; } lastA = a; draw(); if (acc >= need) this.endStep(1); };
    const up = () => { lastA = null; };
    this.input.on('pointermove', move); this.input.on('pointerup', up);
    const kb = this.input.keyboard; const key = kb?.on('keydown-RIGHT', () => { acc += 0.6; ang += 0.6; draw(); if (acc >= need) this.endStep(1); });
    const limit = st.count * 2000 / this.frame.speed + 1200;
    this.stepTimer = this.time.delayedCall(limit, () => this.endStep(acc / need));
    this.cleanup.push(() => { this.input.off('pointermove', move); this.input.off('pointerup', up); key?.off('keydown-RIGHT'); spoon.destroy(); });
  }

  // --- FLIP: tap at the top of the toss.
  private stepFlip(st: DishStep) {
    let t = 0, hits = 0, tries = 0; const need = st.count; const win = 0.14 * this.frame.window + 0.05; const spd = 1.4 * this.frame.speed;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => {
      t += 0.016 * spd; const ph = (Math.sin(t * Math.PI - Math.PI / 2) + 1) / 2; // 0 in pan, 1 at peak
      this.work.clear(); this.work.fillStyle(PAL.gray0).fillEllipse(W / 2, 500, 150, 30); this.work.fillStyle(PAL.ink).fillRect(W / 2 + 70, 494, 70, 8);
      this.work.fillStyle(PAL.sun2).fillEllipse(W / 2, 490 - ph * 120, 80, 22 - ph * 6);
      this.work.fillStyle(PAL.neon, 0.25).fillRect(W / 2 - 60, 490 - 120 - 14, 120, 28);
      (this.work as any).ph = ph;
    } });
    const h = () => { tries++; const ph = (this.work as any).ph as number; if (ph > 1 - win) { hits++; this.frame.flash(PAL.neon, 40); this.meter.set(hits / need); } else this.frame.shake(60, 0.002); if (hits >= need) this.endStep(hits / tries); };
    this.frame.onTap(h);
    this.stepTimer = this.time.delayedCall(need * 1700 + 1500, () => this.endStep(hits / Math.max(tries, need) * 0.8));
    this.cleanup.push(() => { tick.remove(); this.removeTap(h); });
  }

  // --- SEASON: tap exactly N times then wait.
  private stepSeason(st: DishStep) {
    let taps = 0; const need = st.count; let idle: Phaser.Time.TimerEvent | undefined;
    const draw = () => { this.work.clear(); this.work.fillStyle(PAL.gray2).fillRect(W / 2 - 14, 400, 28, 50); this.work.fillStyle(PAL.gray1).fillRect(W / 2 - 14, 400, 28, 8);
      for (let i = 0; i < taps; i++) this.work.fillStyle(i < need ? PAL.white : PAL.red).fillCircle(W / 2 - 60 + (i % 8) * 17, 480 + Math.floor(i / 8) * 14, 3);
      txt(this, W / 2, 380, `${need} shakes`, 10, PAL.gray2).setName('sn'); this.meter.set(Math.min(1, taps / need), taps > need ? PAL.red : PAL.neon); };
    draw();
    const h = () => { taps++; this.children.list.filter(o => o.name === 'sn').forEach(o => o.destroy()); draw(); this.frame.shake(40, 0.001); idle?.remove(); idle = this.time.delayedCall(1100 + this.frame.hard * 300, () => this.endStep(1 - Math.abs(taps - need) / need)); };
    this.frame.onTap(h);
    this.stepTimer = this.time.delayedCall(need * 600 + 3500, () => this.endStep(taps === 0 ? 0 : 1 - Math.abs(taps - need) / need));
    this.cleanup.push(() => { idle?.remove(); this.removeTap(h); this.children.list.filter(o => o.name === 'sn').forEach(o => o.destroy()); });
  }

  // --- POUR: hold to fill, release inside the band.
  private stepPour(_st: DishStep) {
    let fill = 0, holding = false, done = false; const bandW = 0.16 * this.frame.window + 0.05; const bandC = 0.72; const rate = 0.55 * this.frame.speed;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { if (holding) fill = Math.min(1.05, fill + 0.016 * rate);
      this.work.clear(); this.work.fillStyle(PAL.gray2).fillRect(W / 2 - 40, 380, 80, 130); this.work.fillStyle(PAL.night1).fillRect(W / 2 - 36, 384, 72, 122);
      this.work.fillStyle(PAL.neon, 0.35).fillRect(W / 2 - 36, 506 - (bandC + bandW / 2) * 122, 72, bandW * 122);
      this.work.fillStyle(PAL.sea2).fillRect(W / 2 - 36, 506 - Math.min(1, fill) * 122, 72, Math.min(1, fill) * 122);
      if (holding) { this.work.fillStyle(PAL.sea3).fillRect(W / 2 - 3, 340, 6, 506 - Math.min(1, fill) * 122 - 340); }
      this.work.fillStyle(PAL.gray1).fillRect(W / 2 - 60, 330, 120, 14); this.meter.set(Math.min(1, fill), PAL.sea2, [bandC - bandW / 2, bandC + bandW / 2]);
      if (fill > 1.04 && !done) { done = true; this.endStep(0.1); } } });
    const down = () => { if (this.frame.active) holding = true; }; const up = () => { if (!holding || done) return; holding = false; done = true; const d = Math.abs(fill - bandC); this.endStep(d <= bandW / 2 ? 1 : clamp(1 - (d - bandW / 2) / 0.3, 0, 0.7)); };
    this.input.on('pointerdown', down); this.input.on('pointerup', up);
    const kb = this.input.keyboard; kb?.on('keydown-SPACE', down); kb?.on('keyup-SPACE', up);
    this.stepTimer = this.time.delayedCall(8000, () => { if (!done) { done = true; this.endStep(fill > 0 ? clamp(1 - Math.abs(fill - bandC) / 0.4, 0, 0.5) : 0); } });
    this.cleanup.push(() => { tick.remove(); this.input.off('pointerdown', down); this.input.off('pointerup', up); kb?.off('keydown-SPACE', down); kb?.off('keyup-SPACE', up); });
  }

  // --- KNEAD: rapid taps.
  private stepKnead(st: DishStep) {
    let taps = 0; const need = st.count; let squish = 0;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { squish = Math.max(0, squish - 0.05);
      this.work.clear(); this.work.fillStyle(PAL.earth3).fillEllipse(W / 2, 460 + squish * 10, 110 + squish * 30, 70 - squish * 20); this.work.fillStyle(PAL.earth2, 0.5).fillEllipse(W / 2 - 20, 445, 30, 14); this.meter.set(taps / need); } });
    const h = () => { taps++; squish = 1; if (taps >= need) this.endStep(1); };
    this.frame.onTap(h);
    this.stepTimer = this.time.delayedCall(need * 350 / (1 - 0.2 * this.frame.hard) + 1200, () => this.endStep(taps / need));
    this.cleanup.push(() => { tick.remove(); this.removeTap(h); });
  }


  // --- GRILL: hold to sear; the golden band drifts; release inside it. Past the band = burnt.
  private stepGrill(_st: DishStep) {
    let heat = 0, holding = false, done = false, t = 0; const bandW = 0.14 * this.frame.window + 0.05; const rate = 0.42 * this.frame.speed;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { t += 0.016; if (holding) heat = Math.min(1.05, heat + 0.016 * rate); const bandC = 0.62 + Math.sin(t * 1.3) * 0.12;
      this.work.clear(); this.work.fillStyle(PAL.ink).fillRect(40, 400, W - 80, 110); for (let i = 0; i < 6; i++) this.work.fillStyle(PAL.gray0).fillRect(44, 404 + i * 18, W - 88, 6);
      const col = heat < 0.35 ? PAL.dusk3 : heat < 0.8 ? PAL.earth2 : heat <= 1 ? PAL.earth0 : PAL.ink; this.work.fillStyle(col).fillRoundedRect(W / 2 - 50, 430, 100, 50, 6); if (heat > 0.35) { this.work.fillStyle(PAL.ink, 0.5); for (let i = 0; i < 3; i++) this.work.fillRect(W / 2 - 40, 440 + i * 14, 80, 3); }
      if (holding) for (let i = 0; i < 5; i++) this.work.fillStyle(PAL.sun0, 0.7).fillTriangle(50 + i * 60, 512, 60 + i * 60, 512, 55 + i * 60, 500 - Math.sin(t * 9 + i) * 6);
      this.meter.set(Math.min(1, heat), PAL.sun0, [bandC - bandW / 2, bandC + bandW / 2]); (this.work as any).bandC = bandC;
      if (heat > 1.04 && !done) { done = true; this.frame.shake(); this.endStep(0.1); } } });
    const down = () => { if (this.frame.active) holding = true; }; const up = () => { if (!holding || done) return; holding = false; done = true; const bandC = (this.work as any).bandC as number; const d = Math.abs(heat - bandC); this.endStep(d <= bandW / 2 ? 1 : clamp(1 - (d - bandW / 2) / 0.3, 0, 0.7)); };
    this.input.on('pointerdown', down); this.input.on('pointerup', up); const kb = this.input.keyboard; kb?.on('keydown-SPACE', down); kb?.on('keyup-SPACE', up);
    this.stepTimer = this.time.delayedCall(8000, () => { if (!done) { done = true; this.endStep(heat > 0 ? 0.4 : 0); } });
    this.cleanup.push(() => { tick.remove(); this.input.off('pointerdown', down); this.input.off('pointerup', up); kb?.off('keydown-SPACE', down); kb?.off('keyup-SPACE', up); });
  }

  // --- DICE: a 3x3 board of cubes lights up in sequence; tap them back in order.
  private stepDice(st: DishStep) {
    const n = clamp(st.count, 3, 6); const cells: number[] = []; let s = (this.stepIdx + 1) * 7919; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; let c = s % 9; if (cells.length && c === cells[cells.length - 1]) c = (c + 4) % 9; cells.push(c); }
    let showing = true, idx = 0, next = 0, correct = 0, taps = 0; const cx = W / 2, cy = 460, pitch = 52; const lit: Record<number, number> = {};
    const draw = () => { this.work.clear(); this.work.fillStyle(PAL.earth2).fillRoundedRect(cx - 90, cy - 90, 180, 180, 6); for (let i = 0; i < 9; i++) { const x = cx + ((i % 3) - 1) * pitch, y = cy + (Math.floor(i / 3) - 1) * pitch; const on = (lit[i] ?? 0) > 0; this.work.fillStyle(PAL.ink).fillRect(x - 20, y - 18, 40, 40); this.work.fillStyle(on ? PAL.sun2 : PAL.sun3).fillRect(x - 20, y - 20, 40, 40); this.work.fillStyle(on ? PAL.sun1 : PAL.earth3).fillRect(x - 20, y - 20, 40, 6); } this.meter.set(correct / n); };
    draw();
    const showTimer = this.time.addEvent({ delay: 520, repeat: n, callback: () => { Object.keys(lit).forEach(k => lit[+k] = 0); if (idx < n) { lit[cells[idx]] = 1; idx++; } else { showing = false; this.hint.setText('Now TAP them in that order'); } draw(); } });
    const handler = (p?: Phaser.Input.Pointer) => { if (showing || !p) return; const col = Math.round((p.x - cx) / pitch) + 1, row = Math.round((p.y - cy) / pitch) + 1; if (col < 0 || col > 2 || row < 0 || row > 2) return; const cell = row * 3 + col; taps++; if (cell === cells[next]) { correct++; next++; lit[cell] = 1; this.frame.flash(PAL.neon, 30); draw(); if (next >= n) this.endStep(correct / taps); } else { this.frame.shake(80, 0.003); this.endStep(clamp(correct / n * 0.8, 0.05, 0.8)); } };
    this.frame.onTap(handler);
    this.stepTimer = this.time.delayedCall(520 * (n + 1) + 5500, () => this.endStep(correct / n * 0.7));
    this.cleanup.push(() => { showTimer.remove(); this.removeTap(handler); });
  }

  // --- ROLL: swipe left to right N times; the roll travels across the mat.
  private stepRoll(st: DishStep) {
    const need = st.count; let rolls = 0, downX = -1, prog = 0;
    const draw = () => { this.work.clear(); this.work.fillStyle(PAL.grass0).fillRect(30, 420, W - 60, 90); for (let i = 0; i < 12; i++) this.work.fillStyle(PAL.earth3).fillRect(34 + i * 25, 424, 4, 82);
      const x = 60 + prog * (W - 120); this.work.fillStyle(PAL.earth3).fillRect(60, 455, Math.max(0, x - 60), 26); this.work.fillStyle(PAL.ink).fillCircle(x, 466, 22); this.work.fillStyle(PAL.white).fillCircle(x, 466, 17); this.work.fillStyle(PAL.red).fillCircle(x, 466, 6); for (let i = 0; i < rolls; i++) this.work.fillStyle(PAL.neon).fillRect(40 + i * 14, 500, 10, 4); this.meter.set(rolls / need); };
    draw();
    const down = (p: Phaser.Input.Pointer) => { downX = p.x; }; const move = (p: Phaser.Input.Pointer) => { if (!p.isDown || downX < 0) return; prog = clamp((p.x - downX) / 160, 0, 1); draw(); };
    const up = (p: Phaser.Input.Pointer) => { if (!this.frame.active || downX < 0) return; if (p.x - downX > 60) { rolls++; this.frame.flash(PAL.neon, 30); } prog = 0; downX = -1; draw(); if (rolls >= need) this.endStep(1); };
    this.input.on('pointerdown', down); this.input.on('pointermove', move); this.input.on('pointerup', up); const kb = this.input.keyboard; const key = () => { rolls++; draw(); if (rolls >= need) this.endStep(1); }; kb?.on('keydown-RIGHT', key);
    this.stepTimer = this.time.delayedCall(need * 1300 / this.frame.speed + 1500, () => this.endStep(rolls / need));
    this.cleanup.push(() => { this.input.off('pointerdown', down); this.input.off('pointermove', move); this.input.off('pointerup', up); kb?.off('keydown-RIGHT', key); });
  }

  // --- SIMMER: the needle drifts down; tap to add heat; stay in the green, never boil over.
  private stepSimmer(st: DishStep) {
    let temp = 0.5, inBand = 0, total = 0, over = 0; const dur = 5 + st.count * 0.4; const lo = 0.45, hi = 0.7 + 0.05 * this.frame.window; const drift = 0.11 * this.frame.speed;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { total += 0.016; temp = Math.max(0, temp - drift * 0.016); if (temp >= lo && temp <= hi) inBand += 0.016; if (temp > 0.9) over += 0.016;
      this.work.clear(); this.work.fillStyle(PAL.gray0).fillRoundedRect(W / 2 - 70, 400, 140, 60, 8); this.work.fillStyle(temp > 0.9 ? PAL.sun3 : PAL.sun1).fillRoundedRect(W / 2 - 64, 404, 128, 50, 6); const bub = Math.floor(temp * 8); for (let i = 0; i < bub; i++) this.work.fillStyle(PAL.sun3, 0.8).fillCircle(W / 2 - 50 + (i * 37) % 100, 415 + ((i * 53) % 30), 3 + (i % 2)); if (temp > 0.9) this.work.fillStyle(PAL.sun3).fillRect(W / 2 - 70, 392, 140, 10);
      this.work.fillStyle(PAL.sun0, temp).fillTriangle(W / 2 - 30, 500, W / 2 + 30, 500, W / 2, 470); this.meter.set(temp, temp > 0.9 ? PAL.red : PAL.neon, [lo, hi]); this.meter.marker(0.9, PAL.red); this.frame.setTimer(`${Math.max(0, dur - total).toFixed(0)}s`);
      if (total >= dur) this.endStep(clamp(inBand / dur - over / dur * 0.8, 0, 1)); } });
    const h = () => { temp = Math.min(1, temp + 0.13); }; this.frame.onTap(h);
    this.cleanup.push(() => { tick.remove(); this.removeTap(h); this.frame.setTimer(''); });
  }

  // --- SHAKE: alternate swipes / half-taps left, right, left.
  private stepShake(st: DishStep) {
    const need = st.count; let count = 0, last = 0, tilt = 0;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { tilt *= 0.86; this.work.clear(); const cx = W / 2 + tilt * 30, cy = 460; this.work.fillStyle(PAL.ink).fillRoundedRect(cx - 24, cy - 50, 48, 100, 10); this.work.fillStyle(PAL.gray2).fillRoundedRect(cx - 22, cy - 48, 44, 96, 8); this.work.fillStyle(PAL.gray1).fillRect(cx - 22, cy - 48, 44, 14); this.work.fillStyle(PAL.sky2, 0.6).fillRect(cx - 18, cy - 10 + Math.abs(tilt) * 10, 36, 40); for (let i = 0; i < Math.min(count, 8); i++) this.work.fillStyle(PAL.sun3).fillCircle(cx - 14 + (i % 4) * 9, cy + 8 + Math.floor(i / 4) * 10, 2); this.meter.set(count / need); } });
    const swing = (dir: number) => { if (!this.frame.active) return; if (dir !== last) { count++; last = dir; tilt = dir; this.frame.flash(PAL.sky2, 25); if (count >= need) this.endStep(1); } else this.frame.shake(50, 0.002); };
    let downX = 0; const down = (p: Phaser.Input.Pointer) => { downX = p.x; }; const up = (p: Phaser.Input.Pointer) => { const dx = p.x - downX; swing(Math.abs(dx) > 20 ? (dx < 0 ? -1 : 1) : (p.x < W / 2 ? -1 : 1)); };
    this.input.on('pointerdown', down); this.input.on('pointerup', up); const kb = this.input.keyboard; const l = () => swing(-1), r = () => swing(1); kb?.on('keydown-LEFT', l); kb?.on('keydown-RIGHT', r);
    this.stepTimer = this.time.delayedCall(need * 650 / this.frame.speed + 1500, () => this.endStep(count / need));
    this.cleanup.push(() => { tick.remove(); this.input.off('pointerdown', down); this.input.off('pointerup', up); kb?.off('keydown-LEFT', l); kb?.off('keydown-RIGHT', r); });
  }

  // --- FOLD: drag along a dotted path A -> bend -> B, N times.
  private stepFold(st: DishStep) {
    const need = st.count; let folds = 0, wp = 0, tracing = false; const pts = [{ x: 70, y: 500 }, { x: W / 2, y: 410 }, { x: W - 70, y: 500 }]; const R = 34 * this.frame.window + 14;
    const draw = (px?: number, py?: number) => { this.work.clear(); this.work.fillStyle(PAL.earth3).fillEllipse(W / 2, 470, 200, 90); this.work.fillStyle(PAL.sun3).fillEllipse(W / 2, 470, 180, 76); if (folds > 0) { this.work.fillStyle(PAL.earth3).fillTriangle(W / 2 - 90, 470, W / 2 + 90, 470, W / 2, 430 - folds * 6); }
      this.work.fillStyle(PAL.gray2, 0.9); for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 8; k++) { const t = k / 8; this.work.fillCircle(pts[i].x + (pts[i + 1].x - pts[i].x) * t, pts[i].y + (pts[i + 1].y - pts[i].y) * t, 2); }
      pts.forEach((q, i) => { this.work.fillStyle(i < wp ? PAL.neon : i === wp ? PAL.sun2 : PAL.gray1).fillCircle(q.x, q.y, i === wp ? 9 : 6); }); if (px !== undefined) { this.work.fillStyle(PAL.white).fillCircle(px, py!, 5); } this.meter.set(folds / need); };
    draw();
    const near = (q: { x: number; y: number }, p: Phaser.Input.Pointer) => Math.hypot(p.x - q.x, p.y - q.y) < R;
    const down = (p: Phaser.Input.Pointer) => { if (near(pts[0], p)) { tracing = true; wp = 1; draw(p.x, p.y); } };
    const move = (p: Phaser.Input.Pointer) => { if (!tracing || !p.isDown) return; if (wp < pts.length && near(pts[wp], p)) { wp++; this.frame.flash(PAL.neon, 20); } draw(p.x, p.y); if (wp >= pts.length) { tracing = false; folds++; wp = 0; draw(); if (folds >= need) this.endStep(1); } };
    const up = () => { if (tracing) { tracing = false; wp = 0; this.frame.shake(50, 0.002); draw(); } };
    this.input.on('pointerdown', down); this.input.on('pointermove', move); this.input.on('pointerup', up); const kb = this.input.keyboard; const key = () => { folds++; draw(); if (folds >= need) this.endStep(1); }; kb?.on('keydown-DOWN', key);
    this.stepTimer = this.time.delayedCall(need * 2200 / this.frame.speed + 1500, () => this.endStep(folds / need));
    this.cleanup.push(() => { this.input.off('pointerdown', down); this.input.off('pointermove', move); this.input.off('pointerup', up); kb?.off('keydown-DOWN', key); });
  }

  // --- PLATE: drag garnishes onto their marked spots.
  private stepPlate(st: DishStep) {
    const n = clamp(st.count, 2, 3); const cols = [PAL.grass2, PAL.red, PAL.sun2]; const targets = Array.from({ length: n }, (_, i) => ({ x: W / 2 - (n - 1) * 34 + i * 68, y: 445 })); const items = Array.from({ length: n }, (_, i) => ({ x: 60 + i * ((W - 120) / Math.max(1, n - 1)), y: 560, placed: false, drag: false }));
    if (n === 1) items[0].x = W / 2; let placed = 0; const R = 26 * this.frame.window + 10;
    const draw = () => { this.work.clear(); this.work.fillStyle(PAL.ink).fillEllipse(W / 2, 450, 240, 90); this.work.fillStyle(PAL.white).fillEllipse(W / 2, 448, 234, 84); this.work.fillStyle(PAL.gray2).fillEllipse(W / 2, 448, 180, 60);
      targets.forEach((t, i) => { if (!items[i].placed) { this.work.lineStyle(2, PAL.gray1, 0.9); this.work.strokeCircle(t.x, t.y, 14); } }); items.forEach((it, i) => { this.work.fillStyle(PAL.ink).fillCircle(it.x, it.y, 13); this.work.fillStyle(cols[i]).fillCircle(it.x, it.y, 11); this.work.fillStyle(PAL.sun3, 0.6).fillCircle(it.x - 4, it.y - 4, 3); }); this.meter.set(placed / n); };
    draw();
    const down = (p: Phaser.Input.Pointer) => { const it = items.find(i => !i.placed && Math.hypot(p.x - i.x, p.y - i.y) < 30); if (it) it.drag = true; };
    const move = (p: Phaser.Input.Pointer) => { const it = items.find(i => i.drag); if (!it || !p.isDown) return; it.x = p.x; it.y = p.y; draw(); };
    const up = () => { const idx = items.findIndex(i => i.drag); if (idx < 0) return; const it = items[idx]; it.drag = false; const t = targets[idx]; if (Math.hypot(it.x - t.x, it.y - t.y) < R) { it.x = t.x; it.y = t.y; it.placed = true; placed++; this.frame.flash(PAL.neon, 30); } else { it.x = 60 + idx * ((W - 120) / Math.max(1, n - 1)); it.y = 560; this.frame.shake(50, 0.002); } draw(); if (placed >= n) this.endStep(1); };
    this.input.on('pointerdown', down); this.input.on('pointermove', move); this.input.on('pointerup', up); const kb = this.input.keyboard; const key = () => { const it = items.find(i => !i.placed); if (it) { const idx = items.indexOf(it); it.x = targets[idx].x; it.y = targets[idx].y; it.placed = true; placed++; draw(); if (placed >= n) this.endStep(1); } }; kb?.on('keydown-UP', key);
    this.stepTimer = this.time.delayedCall(n * 2600 / this.frame.speed + 1500, () => this.endStep(placed / n));
    this.cleanup.push(() => { this.input.off('pointerdown', down); this.input.off('pointermove', move); this.input.off('pointerup', up); kb?.off('keydown-UP', key); });
  }

  // --- SKEWER: pieces slide across; tap as each one crosses the skewer line.
  private stepSkewer(st: DishStep) {
    const need = st.count; const cols = [PAL.sun0, PAL.grass2, PAL.red, PAL.sun2, PAL.earth2]; const pieces = Array.from({ length: need }, (_, i) => ({ x: -30 - i * 70, hit: false, gone: false })); let hits = 0, tries = 0; const spd = 120 * this.frame.speed; const zone = 16 * this.frame.window + 8; const sx = W / 2;
    const tick = this.time.addEvent({ delay: 16, loop: true, callback: () => { this.work.clear(); this.work.fillStyle(PAL.gray0).fillRect(0, 430, W, 60); this.work.fillStyle(PAL.earth1).fillRect(sx - 3, 380, 6, 160); this.work.fillStyle(PAL.earth0).fillRect(sx - 5, 372, 10, 8); this.work.fillStyle(PAL.neon, 0.25).fillRect(sx - zone, 430, zone * 2, 60);
      let allGone = true; pieces.forEach((pc, i) => { if (pc.gone || pc.hit) return; allGone = false; pc.x += spd * 0.016; if (pc.x > W + 30) { pc.gone = true; return; } this.work.fillStyle(PAL.ink).fillRect(pc.x - 15, 445, 30, 30); this.work.fillStyle(cols[i % cols.length]).fillRect(pc.x - 13, 447, 26, 26); });
      let k = 0; pieces.forEach((pc, i) => { if (!pc.hit) return; const y = 410 - k * 22; this.work.fillStyle(PAL.ink).fillRect(sx - 13, y - 11, 26, 22); this.work.fillStyle(cols[i % cols.length]).fillRect(sx - 11, y - 9, 22, 18); this.work.fillStyle(PAL.sun3, 0.5).fillRect(sx - 8, y - 6, 5, 3); k++; });
      this.meter.set(hits / need); if (allGone) this.endStep(hits / Math.max(tries, need)); } });
    const h = () => { tries++; const pc = pieces.find(p => !p.hit && !p.gone && Math.abs(p.x - sx) <= zone); if (pc) { pc.hit = true; hits++; this.frame.flash(PAL.neon, 30); if (hits >= need) this.endStep(hits / tries); } else this.frame.shake(60, 0.002); };
    this.frame.onTap(h);
    this.stepTimer = this.time.delayedCall((need * 70 + W + 60) / spd * 1000 + 1500, () => this.endStep(hits / Math.max(tries, need)));
    this.cleanup.push(() => { tick.remove(); this.removeTap(h); });
  }

  private removeTap(_h: () => void) { this.frame.clearTaps(); }
}
