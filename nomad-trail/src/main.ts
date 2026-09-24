import Phaser from 'phaser';
import { GAME_W, GAME_H } from './core/types';
import { PAL } from './core/palette';
import { SCENES } from './game';
import { installDebug } from './debug';
import './art';  // registers window.__nomadArt for BootScene
import cities from './data/cities.json';
import { launchHarness } from './minigames/devHarness';
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: GAME_W, height: GAME_H, pixelArt: true, roundPixels: true, backgroundColor: PAL.night0,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } },
  input: { activePointers: 2 }, scene: SCENES });
game.registry.set('cities', cities);
// Mobile Safari: the canvas moves when the toolbar collapses/expands but no resize fires, so Phaser's pointer
// bounds go stale and every touch lands low. Refresh bounds on visual-viewport changes and before each touch.
const refresh = () => { try { game.scale.refresh(); game.scale.updateBounds(); } catch {} };
window.visualViewport?.addEventListener('resize', refresh); window.visualViewport?.addEventListener('scroll', refresh);
window.addEventListener('orientationchange', () => setTimeout(refresh, 300));
game.canvas.addEventListener('touchstart', () => game.scale.updateBounds(), { capture: true, passive: true });
game.canvas.addEventListener('pointerdown', () => game.scale.updateBounds(), { capture: true });
installDebug(game);
if (new URLSearchParams(location.search).has('harness')) game.events.once('ready', () => launchHarness(game));
