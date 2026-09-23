import Phaser from 'phaser';
import { PAL } from './theme';
/** Bordered pixel panel with optional title strip. */
export class Panel extends Phaser.GameObjects.Container {
  g: Phaser.GameObjects.Graphics; readonly w: number; readonly h: number;
  constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, opts: { fill?: number; border?: number; alpha?: number } = {}) {
    super(scene, x, y); this.w = w; this.h = h; this.g = scene.add.graphics(); this.add(this.g);
    const g = this.g; g.fillStyle(PAL.ink, 1); g.fillRect(2, 3, w, h); g.fillStyle(opts.fill ?? PAL.night1, opts.alpha ?? 1); g.fillRect(0, 0, w, h);
    g.lineStyle(1, opts.border ?? PAL.gray1, 1); g.strokeRect(0.5, 0.5, w - 1, h - 1); g.lineStyle(1, PAL.white, 0.12); g.strokeRect(1.5, 1.5, w - 3, h - 3);
    scene.add.existing(this);
  }
}
/** Full-screen dim layer that swallows input beneath a modal. */
export function dimmer(scene: Phaser.Scene, alpha = 0.6) {
  const r = scene.add.rectangle(0, 0, 360, 640, PAL.night0, alpha).setOrigin(0).setInteractive(); return r;
}
