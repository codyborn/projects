import Phaser from 'phaser';
import { GAME_W, GAME_H } from './core/types';
import { PAL } from './core/palette';
import { SCENES } from './game';
import { installDebug } from './debug';
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: GAME_W, height: GAME_H, pixelArt: true, roundPixels: true, backgroundColor: PAL.night0,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 } } },
  input: { activePointers: 2 }, scene: SCENES });
installDebug(game);
