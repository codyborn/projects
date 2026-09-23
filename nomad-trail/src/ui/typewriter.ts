import Phaser from 'phaser';
import type { Label } from './theme';
/** Reveal text character by character; tap-to-skip via the returned skip(). Resolves when done. */
export function typewrite(scene: Phaser.Scene, label: Label, full: string, cps = 45): { done: Promise<void>; skip: () => void } {
  let i = 0, finished = false; let resolve!: () => void; const done = new Promise<void>(r => (resolve = r));
  label.setText('');
  const ev = scene.time.addEvent({ delay: 1000 / cps, loop: true, callback: () => {
    i++; label.setText(full.slice(0, i)); if (i >= full.length) { ev.remove(); finished = true; resolve(); } } });
  const skip = () => { if (finished) return; ev.remove(); label.setText(full); finished = true; resolve(); };
  return { done, skip };
}
