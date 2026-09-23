import Phaser from 'phaser';
import { PAL, txt, type Label, type Size } from './theme';
export interface ButtonOpts { w?: number; h?: number; fill?: number; fillDown?: number; textColor?: number; size?: Size; disabled?: boolean; icon?: string; }
/** Pixel bevel button, min 44px tall, squash tween on press. */
export class Button extends Phaser.GameObjects.Container {
  private g: Phaser.GameObjects.Graphics; label: Label; private opts: Required<Pick<ButtonOpts, 'w' | 'h' | 'fill' | 'fillDown' | 'textColor' | 'size'>>; private _disabled = false;
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onTap: () => void, o: ButtonOpts = {}) {
    super(scene, x, y);
    this.opts = { w: o.w ?? 200, h: Math.max(44, o.h ?? 44), fill: o.fill ?? PAL.night3, fillDown: o.fillDown ?? PAL.dusk0, textColor: o.textColor ?? PAL.white, size: o.size ?? 14 };
    this.g = scene.add.graphics(); this.add(this.g);
    this.label = txt(scene, 0, 0, (o.icon ? o.icon + ' ' : '') + text, this.opts.size, this.opts.textColor, { align: 'center' }).setOrigin(0.5); this.add(this.label as any);
    this.draw(false); this.setSize(this.opts.w, this.opts.h);
    this.setInteractive(new Phaser.Geom.Rectangle(-this.opts.w / 2, -this.opts.h / 2, this.opts.w, this.opts.h), Phaser.Geom.Rectangle.Contains);
    this.on('pointerdown', () => { if (this._disabled) return; this.draw(true); scene.tweens.add({ targets: this, scaleX: 0.96, scaleY: 0.92, duration: 60, yoyo: true }); });
    this.on('pointerup', () => { if (this._disabled) return; this.draw(false); onTap(); });
    this.on('pointerout', () => this.draw(false));
    if (o.disabled) this.setDisabled(true);
    scene.add.existing(this);
  }
  private draw(down: boolean) {
    const { w, h, fill, fillDown } = this.opts; const g = this.g; g.clear();
    g.fillStyle(PAL.ink, 1); g.fillRect(-w / 2, -h / 2 + (down ? 2 : 3), w, h);            // shadow
    g.fillStyle(down ? fillDown : fill, 1); g.fillRect(-w / 2, -h / 2 + (down ? 2 : 0), w, h - 2);
    g.fillStyle(PAL.white, down ? 0.08 : 0.18); g.fillRect(-w / 2 + 2, -h / 2 + (down ? 4 : 2), w - 4, 2);   // bevel highlight
    g.lineStyle(1, PAL.ink, 1); g.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5 + (down ? 2 : 0), w - 1, h - 2);
    this.label.setPosition(0, down ? 1 : -1);
  }
  setDisabled(d: boolean) { this._disabled = d; this.setAlpha(d ? 0.45 : 1); return this; }
  setLabel(s: string) { this.label.setText(s); return this; }
}
