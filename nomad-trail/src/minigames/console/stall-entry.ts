// Dev-only: boots ONLY the console shell (no other mini-game imports) so a broken neighbour file cannot block this check.
// ?game=tetris&seed=5&diff=0.5 : no input, virtual clock, harness presses START; reports when the cartridge ends itself.
import Phaser from 'phaser';
import { GAME_W, GAME_H, MINIGAME_KEYS, type MinigameLaunch } from '../../core/types';
import { PAL } from '../../core/palette';
import { CarryOnScene } from '../CarryOnScene';
const q = new URLSearchParams(location.search); const out = document.getElementById('results')!;
const game = new Phaser.Game({ type: Phaser.CANVAS, parent: 'game', width: GAME_W, height: GAME_H, pixelArt: true, backgroundColor: PAL.night0, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } }, scene: [] });
(window as any).__game = game; const errors: string[] = []; window.addEventListener('error', e => errors.push(String(e.message)));
game.scene.add(MINIGAME_KEYS.carryon, CarryOnScene as any, false);
game.events.once('ready', () => {
  const t0 = performance.now(); let calls = 0; game.loop.stop(); let t = performance.now(); setInterval(() => { for (let k = 0; k < 10; k++) { t += 16.67; game.loop.step(t); } }, 0);
  const press = setInterval(() => { const sc: any = game.scene.getScene(MINIGAME_KEYS.carryon); if (sc?.titleCard && !sc.started) { (window as any).__cardSeenVirtual = game.getTime() / 1000; sc.beginPlay(); clearInterval(press); } }, Number(q.get('pressAfterMs') || 300));
  // result card: note when it appears; dismiss it only after `resultHoldMs` wall ms (default: hold 6 s) by pressing START
  const watch = setInterval(() => { const sc: any = game.scene.getScene(MINIGAME_KEYS.carryon); if (sc?.frame?.continueHandler && (window as any).__resultSeen === undefined) { (window as any).__resultSeen = { virtual: game.getTime() / 1000, wall: performance.now() }; setTimeout(() => { (window as any).__pressedAt = game.getTime() / 1000; (sc.frame as any).ready ? sc.frame.ready() : sc.onPadPress('start'); }, Number(q.get('resultHoldMs') || 6000)); clearInterval(watch); } }, 100);
  game.scene.start(MINIGAME_KEYS.carryon, { energy: 100, difficulty: Number(q.get('diff') || 0.5), payload: { game: q.get('game') || 'tetris', city: 'lisbon', cityName: 'Lisbon', hazard: (q.get('hazard') || 'pigeon') as any, seed: Number(q.get('seed') || 5) },
    onDone: (r) => { calls++; const rs = (window as any).__resultSeen; out.textContent = JSON.stringify({ virtualSeconds: game.getTime() / 1000, wall: (performance.now() - t0) / 1000, calls, result: r, cardSeenAt: (window as any).__cardSeenVirtual, resultSeenVirtual: rs?.virtual, heldWallMs: rs ? Math.round(performance.now() - rs.wall) : null, pressedAt: (window as any).__pressedAt, errors }); document.title = 'STALL_DONE'; } } as MinigameLaunch);
});
