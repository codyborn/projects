// Registry of fitness micro-games (Phaser classes) + the pure session data from pools.ts.
import { Micro } from './micro';
import { PushUp, JumpRope, Dyno, RiverStones } from './timing';
import { Plank, Squat, Stretch, BalanceBoard, SprintStop } from './hold';
import { Curls, Burpee, SwimBreath, PoseMatch } from './gesture';
import { BoulderBeta } from './boulder';
import { Runner, Pace } from './legacy';
import { CityRun } from './cityrun';
export { POOLS, META, MICRO_IDS, SESSION_GAMES, sessionLen, DENSE_CITIES, pickSession, pickOne, seededRng, hashStr } from './pools';

export const MICRO_REGISTRY: Record<string, () => Micro> = {
  pushup: () => new PushUp(), plank: () => new Plank(), jumprope: () => new JumpRope(), curls: () => new Curls(), burpee: () => new Burpee(), squat: () => new Squat(),
  sprint: () => new SprintStop(), stretch: () => new Stretch(), boulderbeta: () => new BoulderBeta(), dyno: () => new Dyno(),
  riverstones: () => new RiverStones(), swimbreath: () => new SwimBreath(), balance: () => new BalanceBoard(), pose: () => new PoseMatch(), runner: () => new Runner(), pace: () => new Pace(), cityrun: () => new CityRun(),
};
