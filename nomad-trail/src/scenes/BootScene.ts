import Phaser from 'phaser';
import { PAL, txt } from '../ui/theme';
import { getSettings } from '../ui/simBridge';
/** Boot: tiny loading bar, lets the ART agent generate textures via window.__nomadArt.generate(scene), then Title. */
export class BootScene extends Phaser.Scene {
  static KEY = 'Boot';
  constructor() { super(BootScene.KEY); }
  create() {
    getSettings(this);
    const g = this.add.graphics(); g.fillStyle(PAL.night2, 1); g.fillRect(80, 318, 200, 6); g.fillStyle(PAL.neon, 1);
    txt(this, 180, 300, 'packing...', 10, PAL.gray2).setOrigin(0.5);
    let p = 0; const ev = this.time.addEvent({ delay: 16, loop: true, callback: () => { p = Math.min(1, p + 0.08); g.fillRect(80, 318, 200 * p, 6); if (p >= 1) { ev.remove(); this.finish(); } } });
  }
  private finish() {
    try { (window as any).__nomadArt?.generate?.(this); } catch (e) { console.warn('art generate failed', e); }
    this.scene.start('Title');
  }
}
export default BootScene;
