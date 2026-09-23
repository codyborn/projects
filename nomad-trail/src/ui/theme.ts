import Phaser from 'phaser';
import { PAL, hex } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
export { PAL, hex, GAME_W, GAME_H };
export const FONT = 'monospace';
export type Size = number;
/** Pixel-look text: bitmap font 'pix' when the ART agent registered it, otherwise crisp monospace. */
export function txt(scene: Phaser.Scene, x: number, y: number, s: string, size: Size = 12, color: number = PAL.white, opts: { align?: string; wrap?: number; bold?: boolean } = {}) {
  if (scene.cache.bitmapFont.exists('pix')) {
    const t = scene.add.bitmapText(Math.round(x), Math.round(y), 'pix', s, size).setTint(color);
    if (opts.wrap) t.setMaxWidth(opts.wrap);
    if (opts.align === 'center') t.setCenterAlign(); else if (opts.align === 'right') t.setRightAlign();
    return t as unknown as Label;
  }
  const t = scene.add.text(Math.round(x), Math.round(y), s, { fontFamily: FONT, fontSize: size + 'px', color: hex(color), fontStyle: opts.bold === false ? 'normal' : 'bold',
    align: opts.align ?? 'left', wordWrap: opts.wrap ? { width: opts.wrap, useAdvancedWrap: true } : undefined, resolution: 1 });
  return t as unknown as Label;
}
/** Common surface of Text and BitmapText that scenes use. */
export interface Label extends Phaser.GameObjects.GameObject {
  x: number; y: number; width: number; height: number; alpha: number; visible: boolean; text: string;
  setText(s: string | string[]): this; setOrigin(x: number, y?: number): this; setPosition(x: number, y?: number): this; setAlpha(a: number): this;
  setVisible(v: boolean): this; setDepth(d: number): this; setScrollFactor(x: number, y?: number): this; setScale(x: number, y?: number): this;
  setTint?(c: number): this; setColor?(c: string): this; destroy(): void; setInteractive(...a: any[]): this; setStyle?(s: any): this;
}
export function setLabelColor(l: Label, color: number) { if (l.setTint) l.setTint(color); else if (l.setColor) l.setColor(hex(color)); }
export const SAFE_TOP = 22, SAFE_BOTTOM = 18;
export function rect(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill: number, outline?: number) {
  const g = scene.add.graphics(); g.fillStyle(fill, 1); g.fillRect(x, y, w, h); if (outline !== undefined) { g.lineStyle(1, outline, 1); g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); } return g;
}
export function statColor(v: number) { return v > 60 ? PAL.grass2 : v > 30 ? PAL.sun1 : PAL.red; }
export function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
export const TRANSPORT_GLYPH: Record<string, string> = { flight: '✈', train: '🚆', bus: '🚌', ferry: '⛴', campervan: '🚐', trek: '🥾', car: '🚗' };
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
