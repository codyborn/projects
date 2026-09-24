import Phaser from 'phaser';
import type { City } from '../core/types';
import { PAL, txt, rect } from '../ui/theme';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { Sim, Data, getRun, getSettings, putSettings, putRun } from '../ui/simBridge';
import { renderShareCard, shareOrDownload, setShareFont } from '../share/shareCard';
import { __glyphs } from '../art/font';
/** End: the share card IS the game-over screen (reason for the ending is drawn on it), then Share / Passport / New Run. Records run history once. */
export class EndScene extends Phaser.Scene {
  static KEY = 'End';
  constructor() { super(EndScene.KEY); }
  async create() {
    const run = getRun(this); const end = run.ending ?? Sim.checkEnding(run) ?? { kind: 'quit' as const, text: 'You closed the tab. Fair.', score: Sim.score(run) };
    if (!run.ending) { run.ending = end; run.phase = 'ended'; putRun(this, run); }
    const settings = getSettings(this); const recorded = (run as any).__recorded;
    if (!recorded) { settings.runs += 1; settings.bestScore = Math.max(settings.bestScore, end.score); settings.history.push({ ending: end.kind, day: run.day, score: end.score }); putSettings(this, settings); (run as any).__recorded = true; putRun(this, run); }
    rect(this, 0, 0, 360, 640, PAL.night0); this.cameras.main.fadeIn(400);
    const cities = ((this.registry.get('cities') as City[]) || Data.cities);
    const wait = txt(this, 180, 280, 'stamping the last page…', 9, PAL.gray1).setOrigin(0.5);
    let canvas: HTMLCanvasElement | null = null;
    try { setShareFont(__glyphs()); canvas = await renderShareCard(run, cities, settings); } catch (e) { console.warn('share card failed', e); }
    wait.destroy();
    if (canvas) {
      if (this.textures.exists('endcard')) this.textures.remove('endcard');
      this.textures.addCanvas('endcard', canvas);
      const s = Math.min(300 / canvas.width, 533 / canvas.height); const img = this.add.image(180, 16 + (canvas.height * s) / 2, 'endcard').setScale(s * 1.04).setAlpha(0);
      this.tweens.add({ targets: img, alpha: 1, scaleX: s, scaleY: s, duration: 400, ease: 'Quad.Out' });
    } else {
      txt(this, 180, 120, end.text, 10, PAL.white, { align: 'center', wrap: 300 }).setOrigin(0.5);
      txt(this, 180, 200, `SCORE ${end.score}`, 16, PAL.sun2).setOrigin(0.5);
    }
    const cv = canvas;
    new Button(this, 96, 574, 'SHARE', async () => { if (!cv) return toast(this, 'card not ready', PAL.red); const r = await shareOrDownload(cv); if (r === 'failed') toast(this, 'could not export', PAL.red); }, { w: 160, h: 44, fill: PAL.sea1, size: 11 });
    new Button(this, 264, 574, 'PASSPORT', () => { if (this.scene.get('Passport')) this.scene.start('Passport', { back: 'End' }); }, { w: 160, h: 44, fill: PAL.dusk0, size: 11, disabled: !this.scene.get('Passport') });
    new Button(this, 180, 618, 'NEW RUN', () => { Sim.clearSave(); this.scene.start('Title'); }, { w: 336, h: 44, fill: PAL.sun0, size: 11 });
  }
}
export default EndScene;
