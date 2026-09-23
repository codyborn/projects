import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H, SETTINGS_KEY } from '../core/types';
import type { RunState, City, Settings } from '../core/types';
import { renderShareCard, shareOrDownload, setShareFont } from './shareCard';
import { buildPixelFont, ptext } from '../art/font';
import { Audio } from '../audio/synth';

export class ShareScene extends Phaser.Scene {
  private onBack?: () => void;
  constructor() { super('Share'); }
  init(d?: { onBack?: () => void }) { this.onBack = d?.onBack; }
  async create() {
    buildPixelFont(this);
    // feed the share renderer the same glyph set as the bitmap font
    setShareFont((await import('../art/font')).__glyphs());
    this.add.rectangle(0, 0, GAME_W, GAME_H, PAL.night0).setOrigin(0);
    const run = this.registry.get('run') as RunState; const cities = (this.registry.get('cities') as City[]) || [];
    let settings: Settings | undefined; try { settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || undefined; } catch { /* ignore */ }
    const canvas = await renderShareCard(run, cities, settings);
    if (this.textures.exists('sharecard')) this.textures.remove('sharecard');
    this.textures.addCanvas('sharecard', canvas);
    const img = this.add.image(GAME_W / 2, 270, 'sharecard'); const s = Math.min((GAME_W - 40) / canvas.width, 500 / canvas.height); img.setScale(s);
    const btn = (x: number, label: string, cb: () => void) => { const bg = this.add.rectangle(x, 585, 100, 36, PAL.night2).setStrokeStyle(1, PAL.sun2).setInteractive({ useHandCursor: true }); const t = ptext(this, x, 585, label, PAL.sun3, 1).setOrigin(0.5); bg.on('pointerdown', () => { Audio.playSfx('confirm'); cb(); }); return [bg, t]; };
    btn(GAME_W / 2 - 110, 'SHARE', async () => { await shareOrDownload(canvas); });
    btn(GAME_W / 2, 'SAVE PNG', async () => { const url = canvas.toDataURL('image/png'); const a = document.createElement('a'); a.href = url; a.download = 'nomad-trail.png'; a.click(); });
    btn(GAME_W / 2 + 110, 'BACK', () => { const cb = this.onBack; this.scene.stop(); cb && cb(); });
    ptext(this, GAME_W / 2, 540, 'LONG-PRESS THE CARD TO SAVE ON IOS', PAL.gray1, 1).setOrigin(0.5);
  }
}
