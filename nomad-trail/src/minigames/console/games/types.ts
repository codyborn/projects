// Contract every console game implements. The shell (CarryOnScene) owns the bezel, the pad, the frame, hearts and the result card.
import type Phaser from 'phaser';
import type { ArcadeLevel, Hazard } from '../../../core/types';
import type { Pad } from '../input';

export type ConsoleGameId = 'carryon' | 'tetris' | 'heli';

export interface ConsoleResult { score: number; perfect?: boolean; failed?: boolean; }

export interface ConsoleCtx {
  scene: Phaser.Scene;
  /** screen rectangle on the phone (world origin is screen.x, screen.y) */
  screen: Phaser.Geom.Rectangle;
  level: ArcadeLevel; cityName: string; hazard: Hazard; palette: [number, number, number];
  rng: () => number; difficulty: number; hard: number; speed: number;
  /** depth base for game objects (bezel sits above) */ depth: number;
  setHearts(n: number, max: number): void; setStatus(text: string): void; flash(color: number, ms?: number): void; shake(ms?: number, k?: number): void; sfx(name: string): void;
}

export interface ConsoleGame {
  readonly id: ConsoleGameId; readonly name: string; readonly instructions: string;
  /** seconds of play before the shell ends the game with scoreNow() */ readonly capSec: number;
  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void): void;
  update(dt: number, pad: Pad): void;
  scoreNow(): number;
  destroy(): void;
}
