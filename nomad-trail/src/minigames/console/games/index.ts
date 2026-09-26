import { CarryOnGame } from './carryon';
import { TetrisGame } from './tetris';
import type { ConsoleGame, ConsoleGameId } from './types';
export * from './types';

/** The console's cartridge slot. Add a game here and the shell can boot it via payload.game. */
export const CONSOLE_GAMES: Record<ConsoleGameId, () => ConsoleGame> = { carryon: () => new CarryOnGame(), tetris: () => new TetrisGame() };   // Drone Run moved out to the standalone Drone side game (DroneScene)
export const CONSOLE_GAME_IDS = Object.keys(CONSOLE_GAMES) as ConsoleGameId[];
export function isConsoleGameId(x: unknown): x is ConsoleGameId { return typeof x === 'string' && x in CONSOLE_GAMES; }
