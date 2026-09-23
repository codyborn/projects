import Phaser from 'phaser';
import { PAL, txt } from './theme';
/** Bottom toast that slides up, holds, fades. Stacks by delaying. */
let queue = 0;
export function toast(scene: Phaser.Scene, message: string, color: number = PAL.white, hold = 1600) {
  const delay = queue * 400; queue++;
  scene.time.delayedCall(delay, () => {
    const c = scene.add.container(180, 640).setDepth(1000);
    const t = txt(scene, 0, 0, message, 10, color, { align: 'center', wrap: 300 }).setOrigin(0.5);
    const w = Math.max(120, t.width + 24), h = Math.max(32, t.height + 14);
    const g = scene.add.graphics(); g.fillStyle(PAL.ink, 0.95); g.fillRect(-w / 2, -h / 2, w, h); g.lineStyle(1, color, 0.8); g.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
    c.add([g, t as any]);
    scene.tweens.add({ targets: c, y: 560, duration: 220, ease: 'Back.Out' });
    scene.tweens.add({ targets: c, alpha: 0, y: 540, delay: 220 + hold, duration: 300, onComplete: () => { c.destroy(); queue = Math.max(0, queue - 1); } });
  });
}
