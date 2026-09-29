// Contract every console game implements. The shell (CarryOnScene) owns the bezel, the pad, the frame, hearts and the result card.
import type Phaser from 'phaser';
import type { ArcadeLevel, Hazard } from '../../../core/types';
import type { Pad } from '../input';

export type ConsoleGameId = 'carryon' | 'tetris';

export interface ConsoleResult { score: number; perfect?: boolean; failed?: boolean; /** one short line under the score on the result card (e.g. the tidiness bonus) */ detail?: string; }

export interface ConsoleCtx {
  scene: Phaser.Scene;
  /** screen rectangle on the phone (world origin is screen.x, screen.y) */
  screen: Phaser.Geom.Rectangle;
  level: ArcadeLevel; cityName: string; hazard: Hazard; palette: [number, number, number];
  rng: () => number; difficulty: number; hard: number; speed: number;
  /** depth base for game objects (bezel sits above) */ depth: number;
  /** the screen's own camera: viewport = screen, scroll starts at (screen.x, screen.y) so screen coords are identity; scrolling games move scrollX */ camera: Phaser.Cameras.Scene2D.Camera;
  setHearts(n: number, max: number): void; setStatus(text: string): void; flash(color: number, ms?: number): void; shake(ms?: number, k?: number): void; sfx(name: string): void;
}

export interface ConsoleGame {
  readonly id: ConsoleGameId; readonly name: string; readonly instructions: string;
  /** 2 to 3 short lines mapping the D-pad / A / B for this cartridge, shown on the title card */ readonly controls: string[];
  /** seconds of play before the shell ends the game with scoreNow(); 0 = no cap, the game decides (Pack-Tris) */ readonly capSec: number;
  /** true: the cartridge draws its own time bar, the shell hides the HUD clock text */ readonly timerBar?: boolean;
  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void): void;
  update(dt: number, pad: Pad): void;
  scoreNow(): number;
  destroy(): void;
}
