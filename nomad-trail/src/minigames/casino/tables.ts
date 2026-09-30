import type { Rng } from '../../core/sim/rng';

/* ---------- Roulette (European, single zero) ---------- */
/** Wheel order clockwise from 0. */
export const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
export type Pocket = 'green' | 'red' | 'black';
export const pocketColor = (n: number): Pocket => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');
export type RouletteBetKind = 'red' | 'black' | 'odd' | 'even' | 'number';
export interface RouletteBet { kind: RouletteBetKind; amount: number; number?: number; }
export const CHIP_SIZES = [25, 50, 100] as const;
/** Gross return for a bet (stake included when it wins), 0 when it loses. Even-money bets pay 1:1, a number pays 35:1. */
export function rouletteReturn(bet: RouletteBet, n: number): number {
  switch (bet.kind) {
    case 'red': return pocketColor(n) === 'red' ? bet.amount * 2 : 0;
    case 'black': return pocketColor(n) === 'black' ? bet.amount * 2 : 0;
    case 'odd': return n !== 0 && n % 2 === 1 ? bet.amount * 2 : 0;
    case 'even': return n !== 0 && n % 2 === 0 ? bet.amount * 2 : 0;
    case 'number': return bet.number === n ? bet.amount * 36 : 0;
  }
}
/** Spin: returns the index into WHEEL. */
export const spinWheel = (rng: Rng) => rng.int(0, WHEEL.length - 1);
/** Net change for a set of bets when pocket n comes up (stakes already paid). */
export function rouletteNet(bets: RouletteBet[], n: number): number { return bets.reduce((a, b) => a + rouletteReturn(b, n), 0) - bets.reduce((a, b) => a + b.amount, 0); }
/** Exact expected return per dollar staked for a bet kind (0.973 for every European bet). */
export function rouletteRTP(kind: RouletteBetKind): number { const bet: RouletteBet = { kind, amount: 1, number: 17 }; let tot = 0; for (let n = 0; n <= 36; n++) tot += rouletteReturn(bet, n); return tot / 37; }

/* ---------- Slots ---------- */
export type Symbol = 'cherry' | 'uni' | 'seven' | 'bar' | 'coffee';
/** One reel strip (20 stops), the same on all three reels. Tuned with the paytable below to a 92.8% return. */
export const REEL: Symbol[] = [...Array<Symbol>(3).fill('cherry'), ...Array<Symbol>(7).fill('coffee'), ...Array<Symbol>(6).fill('bar'), ...Array<Symbol>(3).fill('uni'), 'seven'];
export const PULL_COST = 25;
/** Three of a kind, in multiples of the pull cost. Two cherries anywhere pay 1x (the stake back). */
export const PAY3: Record<Symbol, number> = { seven: 60, uni: 30, bar: 15, coffee: 8, cherry: 4 };
export const PAY_TWO_CHERRIES = 1;
export function slotReturn(stops: [Symbol, Symbol, Symbol], cost = PULL_COST): number {
  const [a, b, c] = stops;
  if (a === b && b === c) return PAY3[a] * cost;
  if (stops.filter(s => s === 'cherry').length === 2) return PAY_TWO_CHERRIES * cost;
  return 0;
}
/** Pull: three independent stops (indices into REEL). */
export const pullReels = (rng: Rng): [number, number, number] => [rng.int(0, REEL.length - 1), rng.int(0, REEL.length - 1), rng.int(0, REEL.length - 1)];
/** Exact expected return per dollar by enumerating every stop combination. */
export function slotRTP(): number { let tot = 0; const n = REEL.length; for (const a of REEL) for (const b of REEL) for (const c of REEL) tot += slotReturn([a, b, c], 1); return tot / (n * n * n); }
/** Paytable lines for the felt. */
/* three short rows, no emoji: the pixel font has no glyphs for them and they silently vanished, leaving
   the numbers looking like gibberish on the machine */
export const PAYTABLE_LINES = [
  `777 x${PAY3.seven}    UNI x${PAY3.uni}`,
  `BAR x${PAY3.bar}    CUP x${PAY3.coffee}`,
  `CHERRY x${PAY3.cherry}    2 CHERRY = stake back`,
];

/* ---------- Session ---------- */
export const MAX_ROUNDS = 12;
export const scoreFor = (net: number) => 50 + Math.max(-50, Math.min(50, net / 20));
