// Tunables shared by the engine, the packer and the headless policy. No imports (keeps the module graph acyclic).
export const GRID = {
  checked: { cols: 8, rows: 10, maxLb: 50, label: 'Suitcase' },
} as const;
export type PackBag = keyof typeof GRID;          // the only bag that exists now: the suitcase
export const TOTAL_DAYS = 365;
export const HOME_PROGRESS_DEG = 330;   // longitude to cover before the flight home unlocks
export const HOME_CITY = 'orangecounty'; // every run starts and ends here
export const HOME_MIN_CONTINENTS = 4;    // the flight home also needs four of the five continents in the passport
// money (USD)
export const START_MONEY = 5000;
export const OVERDRAFT = 2500;          // the card declines at 0; the run ends when the overdraft is gone too
export const WORK_PAY = 450;             // per weekday worked
export const DEFAULT_COST_PER_DAY = 100; // lodging + food when a city has no costPerDay
export const FARE = { flight: [120, 0.08], train: [40, 0.05], bus: [30, 0.03], ferry: [30, 0.03], car: [30, 0.03], campervan: [30, 0.03], trek: [900, 0] } as const; // [base, per km]
// work streak: energy 8 x 1.3^(n-1) capped 40, mood 1 x 1.35^(n-1) capped 15
export const WORK_ENERGY = (streak: number) => Math.min(40, 8 * Math.pow(1.3, Math.max(0, streak - 1)));
export const WORK_MOOD = (streak: number) => Math.min(15, 1 * Math.pow(1.35, Math.max(0, streak - 1)));
/** Day 1 is Thursday, January 1, 2026. 0 = Sunday. */
export const weekdayOf = (day: number) => new Date(Date.UTC(2026, 0, Math.max(1, day))).getUTCDay();
export const isWeekend = (day: number) => { const w = weekdayOf(day); return w === 0 || w === 6; };
export const OUTDOOR_ACTIVITIES = new Set(['trailrun', 'hike', 'ferrata', 'boulder', 'ski', 'surf', 'kite']);
