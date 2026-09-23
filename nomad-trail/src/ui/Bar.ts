import Phaser from 'phaser';
import { PAL, txt, type Label, statColor } from './theme';
/** Segmented stat bar (10 pips) with a small label; color follows the value. */
export class Bar extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics; private lbl: Label; private val: Label; private bw: number; private bh: number; private color?: number; private max: number;
  constructor(scene: Phaser.Scene, x: number, y: number, label: string, w = 100, h = 8, opts: { color?: number; max?: number } = {}) {
    super(scene, x, y); this.bw = w; this.bh = h; this.color = opts.color; this.max = opts.max ?? 100;
    this.lbl = txt(scene, 0, -1, label, 8, PAL.gray2); this.add(this.lbl as any);
    this.val = txt(scene, w, -1, '', 8, PAL.gray2).setOrigin(1, 0); this.add(this.val as any);
    this.g = scene.add.graphics(); this.add(this.g); scene.add.existing(this);
  }
  set(v: number, showValue = true) {
    const g = this.g; g.clear(); const y = 10; const pips = 10; const gap = 1; const pw = (this.bw - gap * (pips - 1)) / pips; const filled = Math.round((v / this.max) * pips);
    g.fillStyle(PAL.ink, 1); g.fillRect(-1, y - 1, this.bw + 2, this.bh + 2);
    for (let i = 0; i < pips; i++) { g.fillStyle(i < filled ? (this.color ?? statColor(v)) : PAL.night2, 1); g.fillRect(i * (pw + gap), y, pw, this.bh); }
    this.val.setText(showValue ? `${Math.round(v)}` : '');
    return this;
  }
}
