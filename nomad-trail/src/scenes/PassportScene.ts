// Passport spread: stamps per visited city (plain/gold), swipe to flip pages. Reads registry 'run' and 'cities'.
import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { GAME_W, GAME_H } from '../core/types';
import type { RunState, City } from '../core/types';
import { stampTexture } from '../art/sprites';
import { buildPixelFont, ptext } from '../art/font';
import { px, R, rng, seedOf } from '../art/pixel';
import { Audio } from '../audio/synth';

export class PassportScene extends Phaser.Scene {
  private page = 0; private pageObjs: Phaser.GameObjects.GameObject[] = []; private onClose?: () => void;
  constructor() { super('Passport'); }
  init(d?: { onClose?: () => void }) { this.onClose = d?.onClose; this.page = 0; }
  create() {
    buildPixelFont(this);
    const run = this.registry.get('run') as RunState | undefined; const cities = (this.registry.get('cities') as City[] | undefined) || [];
    this.add.rectangle(0, 0, GAME_W, GAME_H, PAL.night0, 0.85).setOrigin(0).setInteractive();
    px(this, 'pp_book', 320, 440, ctx => { R(ctx, 0, 0, 320, 440, PAL.ink); R(ctx, 2, 2, 316, 436, PAL.dusk0); R(ctx, 8, 8, 304, 424, PAL.white); R(ctx, 158, 8, 4, 424, PAL.gray2); const r = rng(5); for (let i = 0; i < 900; i++) { const x = r.int(8, 311), y = r.int(8, 431); if ((x + y) % 7 === 0) R(ctx, x, y, 1, 1, PAL.gray2); } });
    this.add.image(GAME_W / 2, GAME_H / 2, 'pp_book');
    ptext(this, GAME_W / 2, 36, 'PASSPORT', PAL.sun3, 2).setOrigin(0.5);
    const visited = run?.visited ?? []; const stamps = run?.stamps ?? {};
    const entries = visited.map(id => cities.find(c => c.id === id)).filter((c): c is City => !!c);
    const perPage = 12; const pages = Math.max(1, Math.ceil(entries.length / perPage));
    const render = () => {
      this.pageObjs.forEach(o => o.destroy()); this.pageObjs = [];
      const slice = entries.slice(this.page * perPage, (this.page + 1) * perPage);
      slice.forEach((c, i) => { const col = i % 3, row = Math.floor(i / 3); const side = col < 2 ? 0 : 1; void side;
        const x = GAME_W / 2 - 160 + 28 + (i % 2) * 150 + (Math.floor(i / 2) % 3) * 44 - 40, y = GAME_H / 2 - 220 + 40 + Math.floor(i / 2) * 64; void col; void row;
        const gold = stamps[c.id] === 'gold'; const key = stampTexture(this, c, gold); const r = rng(seedOf(c.id + 'rot'));
        const img = this.add.image(x + 40, y + 20, key).setAngle(r.int(-18, 18)).setScale(1.2).setAlpha(0); this.pageObjs.push(img);
        this.tweens.add({ targets: img, alpha: 1, scale: 1.25, duration: 200, delay: i * 40 });
        const day = run?.log?.find(l => l.city === c.id)?.day; const t = ptext(this, x + 40, y + 50, `${c.name.toUpperCase().slice(0, 12)}${day ? ' D' + day : ''}`, PAL.gray0, 1).setOrigin(0.5); this.pageObjs.push(t);
      });
      if (!entries.length) this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2, 'NO STAMPS YET.\nGO SOMEWHERE.', PAL.gray1, 1).setOrigin(0.5).setCenterAlign());
      this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2 + 200, `${this.page + 1} / ${pages}`, PAL.gray1, 1).setOrigin(0.5));
      this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2 + 186, `${entries.length} CITIES  ${Object.values(stamps).filter(s => s === 'gold').length} GOLD`, PAL.gray0, 1).setOrigin(0.5));
    };
    render();
    let sx = 0; this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { sx = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { const dx = p.x - sx; if (Math.abs(dx) > 40) { const np = Phaser.Math.Clamp(this.page + (dx < 0 ? 1 : -1), 0, pages - 1); if (np !== this.page) { this.page = np; Audio.playSfx('whoosh'); render(); } } });
    const close = ptext(this, GAME_W - 24, 24, 'X', PAL.white, 2).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => { Audio.playSfx('back'); const cb = this.onClose; this.scene.stop(); cb && cb(); });
    this.cameras.main.fadeIn(200, 11, 15, 26);
  }
}
