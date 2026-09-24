// WarioWare-style fitness micro-games: shared base, context, athlete sprite and input helpers.
import Phaser from 'phaser';
import { PAL } from '../../core/palette';
import { W, H, clamp, txt, pixTexture, type MinigameFrame } from '../_shared';

export interface MicroCtx {
  scene: Phaser.Scene; frame: MinigameFrame;
  /** speed multiplier for this micro-game (x1.0 → x1.3 → x1.6) */ speed: number;
  /** timing window scalar from the frame (1 generous .. 0.35 tight) */ window: number;
  hard: number; rng: () => number; athlete: Athlete;
}
export type MicroDone = (score01: number) => void;

/** Base class: bookkeeping for inputs, loops and objects so a micro-game can be torn down cleanly. */
export abstract class Micro {
  abstract readonly id: string; abstract readonly word: string; abstract readonly instr: string; abstract readonly durationSec: number;
  protected ctx!: MicroCtx; protected done!: MicroDone; private finished = false;
  private objs: Phaser.GameObjects.GameObject[] = []; private timers: Phaser.Time.TimerEvent[] = []; private listeners: { ev: string; fn: (...a: any[]) => void; kb?: boolean }[] = [];
  protected g!: Phaser.GameObjects.Graphics; protected t = 0;
  start(ctx: MicroCtx, done: MicroDone) { this.ctx = ctx; this.done = done; this.finished = false; this.t = 0; this.g = this.add(ctx.scene.add.graphics().setDepth(3)); this.begin(); }
  protected abstract begin(): void;
  /** The orchestrator's clock ran out: report the current score. */
  timeUp() { this.finish(this.scoreNow()); }
  protected abstract scoreNow(): number;
  protected finish(score01: number) { if (this.finished) return; this.finished = true; const d = this.done; this.destroy(); d(clamp(score01, 0, 1)); }
  destroy() { this.timers.forEach(t => t.remove()); this.timers = []; for (const l of this.listeners) { if (l.kb) this.ctx.scene.input.keyboard?.off(l.ev, l.fn); else this.ctx.scene.input.off(l.ev, l.fn); } this.listeners = []; this.objs.forEach(o => o.destroy()); this.objs = []; this.ctx.frame.clearTaps(); }
  // ---- helpers
  protected add<T extends Phaser.GameObjects.GameObject>(o: T): T { this.objs.push(o); return o; }
  protected loop(cb: (dt: number) => void) { const ev = this.ctx.scene.time.addEvent({ delay: 16, loop: true, callback: () => { if (this.finished || !this.ctx.frame.active) return; this.t += 0.016; cb(0.016); } }); this.timers.push(ev); return ev; }
  protected after(ms: number, cb: () => void) { const ev = this.ctx.scene.time.delayedCall(ms, () => { if (!this.finished) cb(); }); this.timers.push(ev); return ev; }
  protected on(ev: string, fn: (...a: any[]) => void) { this.ctx.scene.input.on(ev, fn); this.listeners.push({ ev, fn }); }
  protected key(ev: string, fn: (...a: any[]) => void) { const kb = this.ctx.scene.input.keyboard; if (!kb) return; kb.on(ev, fn); this.listeners.push({ ev, fn, kb: true }); }
  /** tap anywhere (+ SPACE/ENTER), through the frame so fatigue lag applies */
  protected onTap(fn: (p?: Phaser.Input.Pointer) => void) { this.ctx.frame.onTap(p => { if (!this.finished) fn(p); }); }
  /** swipe detection: fn(dir 'up'|'down'|'left'|'right', startPointer) */
  protected onSwipe(fn: (dir: 'up' | 'down' | 'left' | 'right', p: Phaser.Input.Pointer) => void, minDist = 24) {
    let sx = 0, sy = 0, st = 0;
    this.on('pointerdown', (p: Phaser.Input.Pointer) => { sx = p.x; sy = p.y; st = this.ctx.scene.time.now; });
    this.on('pointerup', (p: Phaser.Input.Pointer) => { const dx = p.x - sx, dy = p.y - sy; if (this.ctx.scene.time.now - st > 700) return; if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) return; fn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), p); });
    this.key('keydown-UP', () => fn('up', this.ctx.scene.input.activePointer)); this.key('keydown-DOWN', () => fn('down', this.ctx.scene.input.activePointer));
    this.key('keydown-LEFT', () => fn('left', this.ctx.scene.input.activePointer)); this.key('keydown-RIGHT', () => fn('right', this.ctx.scene.input.activePointer));
  }
  /** hold detection: down/up anywhere (+ SPACE) */
  protected onHold(down: () => void, up: () => void) { this.on('pointerdown', down); this.on('pointerup', up); this.key('keydown-SPACE', down); this.key('keyup-SPACE', up); }
  protected label(x: number, y: number, s: string, size = 11, color: number = PAL.gray2) { return this.add(txt(this.ctx.scene, x, y, s, size, color).setDepth(6)); }
  protected pop(x: number, y: number, s: string, color: number = PAL.neon) { const t = this.label(x, y, s, 14, color); this.ctx.scene.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 500, onComplete: () => t.destroy() }); }
  /** Light band background for the play area. */
  protected backdrop(top: number, bottom: number) { this.g.fillStyle(PAL.night2).fillRect(0, 26, W, H - 26); this.g.fillStyle(PAL.night3).fillRect(0, top, W, bottom - top); }
}

/** Tiny procedural athlete: 12x16 pixel figure, 4 poses (stand, crouch, arms-up, lunge), scaled 4x. */
export class Athlete {
  sprite: Phaser.GameObjects.Image; private poses: string[];
  constructor(public scene: Phaser.Scene, x: number, y: number) {
    const map = { o: PAL.earth3, h: PAL.earth0, s: PAL.sun0, p: PAL.night3, k: PAL.ink };
    const P = (rows: string[], key: string) => pixTexture(scene, key, rows, map, 4);
    this.poses = [
      P(['....hhhh....', '....oooo....', '....oooo....', '.....oo.....', '..ssssssss..', '.s.ssssss.s.', '.s.ssssss.s.', '.s.ssssss.s.', 'oo.ssssss.oo', '...pppppp...', '...pppppp...', '...pp..pp...', '...pp..pp...', '...pp..pp...', '...pp..pp...', '..kkk..kkk..'], 'ath_stand'),
      P(['............', '............', '............', '....hhhh....', '....oooo....', '....oooo....', '..ssoossss..', '.sssssssss..', 'ss.ssssss.ss', 'oo.pppppp.oo', '...pppppp...', '..ppp..ppp..', '..pp....pp..', '.kkk....kkk.', '............', '............'], 'ath_crouch'),
      P(['.oo......oo.', '.ss......ss.', '.ss.hhhh.ss.', '.ss.oooo.ss.', '.ss.oooo.ss.', '.sss.oo.sss.', '..ssssssss..', '...ssssss...', '...ssssss...', '...pppppp...', '...pppppp...', '...pp..pp...', '...pp..pp...', '...pp..pp...', '...pp..pp...', '..kkk..kkk..'], 'ath_up'),
      P(['....hhhh....', '....oooo....', '....oooo....', '.....oo.....', '..ssssssss..', '.s.ssssss.s.', 'oo.ssssss.oo', '...ssssss...', '...pppppp...', '..ppp..ppp..', '.ppp....ppp.', 'ppp......ppp', 'pp........pp', 'kkk......kkk', '............', '............'], 'ath_lunge'),
    ];
    this.sprite = scene.add.image(x, y, this.poses[0]).setDepth(5);
  }
  pose(i: 0 | 1 | 2 | 3) { this.sprite.setTexture(this.poses[i]); return this; }
  at(x: number, y: number) { this.sprite.setPosition(x, y); return this; }
  show(v: boolean) { this.sprite.setVisible(v); return this; }
  bump() { this.scene.tweens.add({ targets: this.sprite, scaleY: 0.9, yoyo: true, duration: 80 }); }
}
