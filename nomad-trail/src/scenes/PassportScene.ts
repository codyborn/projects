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
  private page = 0; private pageObjs: Phaser.GameObjects.GameObject[] = []; private onClose?: () => void; private backKey?: string;
  constructor() { super('Passport'); }
  init(d?: { onClose?: () => void; back?: string }) { this.onClose = d?.onClose; this.backKey = d?.back; this.page = 0; }
  create() {
    this.scene.bringToTop();
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
      // Two facing pages (book spans x 20..340, spine at 180, white from 28 to 332). Each page: 2 columns x 3 rows of stamps, well inside the white.
      slice.forEach((c, i) => {
        const half = Math.floor(i / 6), j = i % 6, col = j % 2, row = Math.floor(j / 2);
        const pageLeft = half === 0 ? 28 : 182, pageW = 150;                     // white area of that page
        const cx = pageLeft + pageW * (0.25 + col * 0.5), cy = 160 + row * 108;  // stamp centres: rows at 160, 268, 376
        const gold = stamps[c.id] === 'gold'; const key = stampTexture(this, c, gold); const r = rng(seedOf(c.id + 'rot'));
        const img = this.add.image(cx, cy, key).setAngle(r.int(-14, 14)).setScale(1.1).setAlpha(0); this.pageObjs.push(img);
        this.tweens.add({ targets: img, alpha: 1, scale: 1.15, duration: 200, delay: i * 40 });
        const day = run?.log?.find(l => l.city === c.id)?.day;
        const name = c.name.toUpperCase(); const line1 = name.length > 10 ? name.slice(0, 9) + '.' : name;   // 10 chars x 6 px sits inside the 75 px column
        this.pageObjs.push(ptext(this, cx, cy + 32, line1, PAL.gray0, 1).setOrigin(0.5));
        if (day) this.pageObjs.push(ptext(this, cx, cy + 42, `DAY ${day}`, PAL.gray1, 1).setOrigin(0.5));
      });
      if (!entries.length) this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2, 'NO STAMPS YET.\nGO SOMEWHERE.', PAL.gray1, 1).setOrigin(0.5).setCenterAlign());
      this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2 + 196, `${this.page + 1} / ${pages}`, PAL.gray1, 1).setOrigin(0.5));
      this.pageObjs.push(ptext(this, GAME_W / 2, GAME_H / 2 + 182, `${entries.length} CITIES  ${Object.values(stamps).filter(s => s === 'gold').length} GOLD`, PAL.gray0, 1).setOrigin(0.5));
    };
    render();
    let sx = 0; this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { sx = p.x; });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => { const dx = p.x - sx; if (Math.abs(dx) > 40) { const np = Phaser.Math.Clamp(this.page + (dx < 0 ? 1 : -1), 0, pages - 1); if (np !== this.page) { this.page = np; Audio.playSfx('whoosh'); render(); } } });
    const close = ptext(this, GAME_W - 24, 24, 'X', PAL.white, 2).setOrigin(0.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => { Audio.playSfx('back'); const cb = this.onClose; const back = this.backKey; this.scene.stop(); if (cb) cb(); else if (back) this.scene.start(back); else this.scene.start('Title'); });
    this.cameras.main.fadeIn(200, 11, 15, 26);
  }
}
