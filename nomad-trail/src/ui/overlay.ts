import Phaser from 'phaser';
/** Launch a scene over the current one and bring it to the top once it has actually started (bringToTop before create() is a no-op for a not-yet-running scene). */
export function launchOnTop(from: Phaser.Scene, key: string, data?: any) {
  const target = from.scene.get(key);
  if (target) target.events.once(Phaser.Scenes.Events.CREATE, () => { try { from.scene.bringToTop(key); } catch { /* scene gone */ } });
  from.scene.launch(key, data);
  from.scene.bringToTop(key);
}
