import Phaser from 'phaser';
import { PAL, hex } from '../core/palette';
import { GAME_W, GAME_H, type MinigameLaunch, type MinigameResult } from '../core/types';

export const W = GAME_W, H = GAME_H;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Fill defaults so a scene started with partial/no data still runs (dev harness, integrator stubs). */
export function normalizeLaunch(data: any): MinigameLaunch {
  const d = data || {};
  return {
    energy: typeof d.energy === 'number' ? clamp(d.energy, 0, 100) : 100,
    difficulty: typeof d.difficulty === 'number' ? clamp(d.difficulty, 0, 1) : 0.5,
    payload: d.payload,
    onDone: typeof d.onDone === 'function' ? d.onDone : () => {},
  };
}

/** Bevelled pixel panel: dark outline, fill, 1px light top-left edge, 1px dark bottom-right edge. */
export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill: number = PAL.night2, light: number = PAL.gray1, dark: number = PAL.ink) {
  const g = scene.add.graphics();
  g.fillStyle(dark).fillRect(x, y, w, h);
  g.fillStyle(fill).fillRect(x + 1, y + 1, w - 2, h - 2);
  g.fillStyle(light).fillRect(x + 1, y + 1, w - 2, 1).fillRect(x + 1, y + 1, 1, h - 2);
  g.fillStyle(dark).fillRect(x + 1, y + h - 2, w - 2, 1).fillRect(x + w - 2, y + 1, 1, h - 2);
  return g;
}

export function txt(scene: Phaser.Scene, x: number, y: number, s: string, size = 12, color: number = PAL.white, align: 'left' | 'center' | 'right' = 'center') {
  const t = scene.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color: hex(color) });
  t.setOrigin(align === 'center' ? 0.5 : align === 'left' ? 0 : 1, 0.5);
  return t;
}

/** Simple horizontal meter. */
export class Meter {
  g: Phaser.GameObjects.Graphics;
  constructor(public scene: Phaser.Scene, public x: number, public y: number, public w: number, public h: number, public color: number = PAL.neon) {
    this.g = scene.add.graphics(); this.set(1);
  }
  set(frac: number, color: number = this.color, band?: [number, number], bandColor: number = PAL.grass1) {
    const g = this.g; g.clear();
    g.fillStyle(PAL.ink).fillRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
    g.fillStyle(PAL.night1).fillRect(this.x, this.y, this.w, this.h);
    if (band) g.fillStyle(bandColor, 0.5).fillRect(this.x + band[0] * this.w, this.y, (band[1] - band[0]) * this.w, this.h);
    g.fillStyle(color).fillRect(this.x, this.y, Math.round(clamp(frac, 0, 1) * this.w), this.h);
  }
  marker(frac: number, color: number = PAL.white) { this.g.fillStyle(color).fillRect(this.x + Math.round(clamp(frac, 0, 1) * this.w) - 1, this.y - 2, 2, this.h + 4); }
  destroy() { this.g.destroy(); }
}

/**
 * Common frame for every mini-game: READY intro, HUD strip, energy-based difficulty, low-energy wobble,
 * result card and a once-only onDone + scene.stop().
 */
export class MinigameFrame {
  private finished = false;
  private hudTitle?: Phaser.GameObjects.Text; private hudProg?: Phaser.GameObjects.Text; private hudTimer?: Phaser.GameObjects.Text;
  private introObjs: Phaser.GameObjects.GameObject[] = [];
  private wobbleT = 0;
  /** 0..1, how tired: energy < 50 ramps this up */
  readonly hard: number;
  /** multiplier for timing windows / target sizes (1 = generous, ~0.4 = tight) */
  readonly window: number;
  /** input lag in ms when tired (max ~140ms) */
  readonly lag: number;
  /** speed multiplier for moving things (difficulty raises it) */
  readonly speed: number;
  private tapHandlers: Array<(p?: Phaser.Input.Pointer) => void> = [];
  private tapListenerInstalled = false;
  active = false;
  /** Hard cap on play time (seconds, after the READY card). Every game auto-finishes at the cap with scoreNow(). Default keeps
   *  total wall-clock (1 s intro + play + 1.5 s result) under 40 s. Games may override before intro(): Carry-On uses 60. */
  capSec = 36;
  /** Current score 0..100 if the game were to end right now; games set this so the cap can finish them fairly. */
  scoreNow: () => number = () => 50;
  private capTimer?: Phaser.Time.TimerEvent;
  private playStart = 0;
  /** seconds of play so far (0 during the intro) */
  get elapsed() { return this.playStart ? Math.max(0, (this.scene.time.now - this.playStart) / 1000) : 0; }
  /** seconds left before the cap */
  get remaining() { return Math.max(0, this.capSec - this.elapsed); }

  constructor(public scene: Phaser.Scene, public launch: MinigameLaunch, public title: string) {
    const e = clamp(launch.energy, 0, 100);
    this.hard = e < 50 ? (50 - e) / 50 : 0;
    this.window = clamp(1 - 0.35 * this.hard - 0.3 * launch.difficulty, 0.35, 1);
    this.lag = Math.round(this.hard * 140);
    this.speed = 0.85 + 0.5 * launch.difficulty + 0.15 * this.hard;
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.tapHandlers = []; this.active = false; this.capTimer?.remove(); });
  }

  /** Dim overlay + title + instruction + READY for ~1s, then cb(). */
  intro(instruction: string, cb: () => void) {
    const s = this.scene;
    const ov = s.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.82).setDepth(900);
    const p = panel(s, 24, H / 2 - 80, W - 48, 160, PAL.night2).setDepth(901);
    const t1 = txt(s, W / 2, H / 2 - 48, this.title.toUpperCase(), 18, PAL.sun2).setDepth(902);
    const t2 = txt(s, W / 2, H / 2 - 10, instruction, 11, PAL.gray2).setDepth(902);
    t2.setWordWrapWidth(W - 80).setAlign('center');
    const t3 = txt(s, W / 2, H / 2 + 44, 'READY', 22, PAL.neon).setDepth(902);
    if (this.hard > 0.3) txt(s, W / 2, H / 2 + 66, 'low energy: everything feels slower', 9, PAL.pink).setDepth(902).setName('tired');
    this.introObjs = [ov, p, t1, t2, t3, ...s.children.list.filter(o => o.name === 'tired')];
    s.tweens.add({ targets: t3, scale: { from: 1.3, to: 1 }, duration: 300, ease: 'Back.Out' });
    s.time.delayedCall(1000, () => {
      this.introObjs.forEach(o => o.destroy()); this.introObjs = [];
      this.active = true; this.playStart = s.time.now;
      this.capTimer = s.time.delayedCall(this.capSec * 1000, () => { if (!this.finished) this.finish(this.scoreNow()); });
      cb();
    });
  }

  /** Top HUD strip: title left, progress right, timer center. */
  hud() {
    const s = this.scene;
    panel(s, 0, 0, W, 26, PAL.night1, PAL.night3).setDepth(800);
    this.hudTitle = txt(s, 8, 13, this.title.toUpperCase(), 10, PAL.sun2, 'left').setDepth(801);
    this.hudTimer = txt(s, W / 2, 13, '', 10, PAL.gray2).setDepth(801);
    this.hudProg = txt(s, W - 8, 13, '', 10, PAL.neon, 'right').setDepth(801);
  }
  setProgress(t: string) { this.hudProg?.setText(t); }
  setTimer(t: string) { this.hudTimer?.setText(t); }
  shake(ms = 120, intensity = 0.004) { this.scene.cameras.main.shake(ms, intensity); }
  flash(color: number = PAL.red, ms = 80) { this.scene.cameras.main.flash(ms, (color >> 16) & 255, (color >> 8) & 255, color & 255); }

  /** Call every frame: subtle camera wobble when tired. */
  update(dt: number) {
    if (this.hard <= 0) return;
    this.wobbleT += dt / 1000;
    const cam = this.scene.cameras.main;
    cam.setRotation(Math.sin(this.wobbleT * 1.7) * 0.012 * this.hard);
    cam.setZoom(1 + Math.sin(this.wobbleT * 0.9) * 0.008 * this.hard);
  }

  /** Drop all tap handlers (between mini-game phases). */
  clearTaps() { this.tapHandlers = []; }

  /** Register a tap handler (pointerdown anywhere + SPACE/ENTER). Applies fatigue lag. */
  onTap(fn: (p?: Phaser.Input.Pointer) => void) {
    this.tapHandlers.push(fn);
    if (this.tapListenerInstalled) return;
    this.tapListenerInstalled = true;
    const fire = (p?: Phaser.Input.Pointer) => {
      if (!this.active || this.finished) return;
      const run = () => this.tapHandlers.forEach(h => h(p));
      if (this.lag > 0) this.scene.time.delayedCall(this.lag, run); else run();
    };
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => fire(p));
    const kb = this.scene.input.keyboard;
    if (kb) { kb.on('keydown-SPACE', () => fire()); kb.on('keydown-ENTER', () => fire()); }
  }

  /** Show result card for 1.5s then onDone once and stop the scene. */
  finish(score: number, forceFail = false) {
    if (this.finished) return; this.finished = true; this.active = false; this.capTimer?.remove();
    score = Math.round(clamp(Number.isFinite(score) ? score : 0, 0, 100));
    const failed = forceFail || score < 50, perfect = !failed && score >= 95;
    const label = perfect ? 'PERFECT' : failed ? 'FAILED' : 'NICE';
    const color = perfect ? PAL.sun2 : failed ? PAL.red : PAL.neon;
    const s = this.scene;
    s.cameras.main.setRotation(0).setZoom(1);
    s.add.rectangle(W / 2, H / 2, W, H, PAL.night0, 0.75).setDepth(950);
    panel(s, 40, H / 2 - 60, W - 80, 120, PAL.night2).setDepth(951);
    const l = txt(s, W / 2, H / 2 - 22, label, 24, color).setDepth(952);
    txt(s, W / 2, H / 2 + 20, `SCORE ${score}`, 14, PAL.white).setDepth(952);
    s.tweens.add({ targets: l, scale: { from: 1.6, to: 1 }, duration: 250, ease: 'Back.Out' });
    if (perfect) this.shake(150, 0.003);
    const result: MinigameResult = { score, perfect, failed };
    s.time.delayedCall(1500, () => { try { this.launch.onDone(result); } finally { s.scene.stop(); } });
  }
}

/** Small pixel sprite helpers: build a texture from a string map (rows of chars -> palette colors). */
export function pixTexture(scene: Phaser.Scene, key: string, rows: string[], map: Record<string, number>, scale = 1) {
  if (scene.textures.exists(key)) return key;
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const g = scene.add.graphics();
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.' && map[c] !== undefined) g.fillStyle(map[c]).fillRect(x * scale, y * scale, scale, scale); }));
  g.generateTexture(key, w * scale, h * scale); g.destroy();
  return key;
}

export function pointerInLeftThird(p: Phaser.Input.Pointer) { return p.x < W / 3; }
export function pointerInRightThird(p: Phaser.Input.Pointer) { return p.x > (2 * W) / 3; }

/** mm:ss.s or ss.s */
export function fmtTime(sec: number) { return `${Math.max(0, sec).toFixed(1)}s`; }
