import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type Dish, type DishStep, type MinigameLaunch } from '../core/types';
import { MinigameFrame, Meter, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';

const DEFAULT_DISH: Dish = { id: 'dalbhat', name: 'Dal Bhat', city: 'kathmandu', ingredients: ['lentils', 'rice', 'spinach', 'cumin'], health: 20, mood: 10,
  steps: [{ kind: 'chop', count: 6 }, { kind: 'pour', count: 1 }, { kind: 'stir', count: 3 }, { kind: 'season', count: 4 }, { kind: 'flip', count: 3 }, { kind: 'knead', count: 12 }] };

const LAYER_COLORS = [PAL.earth2, PAL.sun1, PAL.grass1, PAL.sun2, PAL.red, PAL.earth3, PAL.grass2, PAL.pink];
const STEP_TEXT: Record<DishStep['kind'], string> = {
  chop: 'TAP when the knife is over the green band', stir: 'DRAG in circles to stir', flip: 'TAP at the top of the toss',
  season: 'TAP exactly the right number of times, then wait', pour: 'HOLD to pour, release inside the band', knead: 'TAP fast to knead',
};

/** Cooking-Mama style: a dish is a sequence of micro-tasks. Score = mean accuracy. */
export class CookingScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private dish!: Dish; private cityLabel = '';
  private stepIdx = 0; private accuracies: number[] = [];
  private work!: Phaser.GameObjects.Graphics; private plate!: Phaser.GameObjects.Graphics; private stepText!: Phaser.GameObjects.Text; private hint!: Phaser.GameObjects.Text;
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
    this.plate = this.add.graphics().setDepth(2);
    this.drawPlate();
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

  private drawPlate() {
    const g = this.plate; g.clear();
    g.fillStyle(PAL.ink).fillEllipse(W / 2, 200, 164, 64); g.fillStyle(PAL.white).fillEllipse(W / 2, 198, 160, 60); g.fillStyle(PAL.gray2).fillEllipse(W / 2, 198, 120, 42);
    for (let i = 0; i < this.stepIdx; i++) { const c = LAYER_COLORS[i % LAYER_COLORS.length]; g.fillStyle(c).fillEllipse(W / 2 + (i % 2 ? 6 : -6), 196 - i * 5, 100 - i * 6, 34 - i * 3); g.fillStyle(PAL.ink, 0.25).fillEllipse(W / 2 + (i % 2 ? 6 : -6), 199 - i * 5, 100 - i * 6, 8); }
  }

  private endStep(acc: number) {
    this.cleanup.forEach(f => f()); this.cleanup = []; this.stepTimer?.remove(); this.work.clear();
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
      this.frame.finish(mean * 100); return;
    }
    const st = this.dish.steps[this.stepIdx];
    this.frame.setProgress(`STEP ${this.stepIdx + 1}/${this.dish.steps.length}`);
    this.stepText.setText(st.kind.toUpperCase()); this.hint.setText(STEP_TEXT[st.kind]);
    ({ chop: () => this.stepChop(st), stir: () => this.stepStir(st), flip: () => this.stepFlip(st), season: () => this.stepSeason(st), pour: () => this.stepPour(st), knead: () => this.stepKnead(st) })[st.kind]();
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

  private removeTap(_h: () => void) { this.frame.clearTaps(); }
}
