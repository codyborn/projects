// ===== Shared contracts for The Nomad Trail. Every module codes against these. Change only with care (all agents depend on them). =====
export const GAME_W = 360, GAME_H = 640;

// ---------- Content data (src/data/*.json) ----------
export type Bag = 'checked' | 'backpack';
export type ItemTag = 'essential' | 'work' | 'clothing' | 'health' | 'fitness' | 'sleep' | 'coffee' | 'rain' | 'cold' | 'swim' | 'kite' | 'climb' | 'firstaid' |
  'meds' | 'repellent' | 'switch' | 'kettle' | 'camera' | 'organizer' | 'luxury' | 'trap' | 'water' | 'light' | 'knife' | 'hike' | 'laundry';
export interface Item {
  id: string; name: string; label: string;            // label: short (<= 16 chars) for the grid
  weightLb: number; w: number; h: number;             // grid footprint in cells (checked grid 8x10, backpack 5x6)
  tags: ItemTag[]; clothesDays?: number;              // clothing items add days of clean clothes
  desc: string; real: boolean; link?: string;         // real = from Cody's actual list
  benefits?: string[];                                // shown on the pack card instead of desc: what packing this does for you
  color: number;                                      // palette color for the procedural icon
}
export interface Lodging { id: string; name: string; cancelChance: number; quiet: number; moodPerDay: number; energyPerDay: number; }
export type Transport = 'flight' | 'train' | 'bus' | 'ferry' | 'campervan' | 'trek' | 'car';
export interface Leg { to: string; transport: Transport; days: number; energy: number; timezones: number; months?: number[]; }  // months: allowed 1..12
export type Region = 'northamerica' | 'mexico' | 'southamerica' | 'europe' | 'alps' | 'africa' | 'asia' | 'himalaya';
export type Continent = 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia';
export const CONTINENT_OF: Record<Region, Continent> = { northamerica: 'North America', mexico: 'North America', southamerica: 'South America', europe: 'Europe', alps: 'Europe', africa: 'Africa', asia: 'Asia', himalaya: 'Asia' };
export type Hazard = 'otter' | 'mosquito' | 'gust' | 'rock' | 'tuktuk' | 'wave' | 'ice' | 'pigeon' | 'tram' | 'snow' | 'crowd' | 'yak';
export interface City {
  id: string; name: string; country: string; region: Region; lat: number; lon: number;
  hero: boolean; minStay: number; suggestedStay: number;
  climate: 'hot' | 'temperate' | 'cold' | 'alpine' | 'rainy'; timezone: number; altitude?: number;
  radon?: 0 | 1 | 2 | 3;                              // realistic radon exposure (granite/alpine regions); daily health drain unless an air monitor is packed
  outdoorsy?: boolean;                                // adventure gear pays off here
  costPerDay?: number;                                // lodging + food, USD
  dishes: string[]; activities: ActivityId[]; hazard: Hazard; lodgings: Lodging[];
  eventWeights: Record<string, number>;               // eventId -> multiplier
  legs: Leg[]; blurb: string; stampIcon: string;      // stampIcon: key for a tiny procedural glyph
}
export type ActivityId = 'kite' | 'boulder' | 'ferrata' | 'trailrun' | 'swim' | 'hike' | 'bands' | 'ski' | 'surf' | 'yoga';
export interface GameEvent {
  id: string; title: string; text: string;            // text may use {city}, {day}, {item}
  when: 'leg' | 'arrive' | 'day' | 'leave' | 'flight' | 'action';
  baseChance: number; requiresTag?: ItemTag; requiresCity?: string; requiresClimate?: City['climate'][]; requiresOverweight?: boolean;
  requiresOutdoorsy?: boolean; requiresActivity?: ActivityId[]; requiresTransport?: Transport[];   // setting gates: mountains, water sports, train legs
  mitigatedBy?: ItemTag[]; mitigatedText?: string;
  choices?: EventChoice[];                            // if absent, effects apply directly
  effects: Effects; mitigatedEffects?: Effects;
}
export interface EventChoice { label: string; text: string; effects: Effects; requiresTag?: ItemTag; }
export interface Effects { health?: number; energy?: number; mood?: number; days?: number; loseRandomItem?: boolean; loseItemTag?: ItemTag;
  bagLocked?: number; wheelBroken?: boolean; backInjury?: number; sick?: number; unlockAchievement?: string; }
export interface Dish { id: string; name: string; city: string; ingredients: string[]; steps: DishStep[]; health: number; mood: number; art?: string; }  // art: key into the dish art table (defaults to id)
export type DishStepKind = 'chop' | 'slice' | 'stir' | 'flip' | 'season' | 'pour' | 'knead' | 'grill' | 'dice' | 'roll' | 'simmer' | 'shake' | 'fold' | 'plate' | 'skewer';
export type DishStep = { kind: DishStepKind; count: number; };
export interface ArcadeLevel { city: string; hazard: Hazard; palette: [number, number, number]; tiles: string[]; stampPieces: number; parTime: number; }

// ---------- Run state (saved to localStorage) ----------
export interface PackedItem { id: string; bag: Bag; x: number; y: number; rot?: boolean; }  // rot: footprint rotated 90°, swap w/h
export interface RunState {
  version: 2; seed: number; day: number; startCity: string; cityId: string; direction: 'east' | 'west'; directionSet?: boolean;  // direction is inferred from the first leg unless set
  health: number; energy: number; mood: number; cleanClothes: number; maxClothes: number;
  money: number;                                      // USD; work days earn, everything else spends; < 0 ends the run ('broke')
  items: PackedItem[]; lostItems: string[];
  bagLockedDays: number; wheelBroken: boolean; backInjuryDays: number; sickDays: number;
  fatigue: number; legsLast30: number[];              // day numbers of recent legs
  visited: string[]; stamps: Record<string, 'plain' | 'gold'>; route: string[];
  achievements: string[]; log: LogLine[]; workStreak: number; coffeeMornings: number;
  phase: 'pack' | 'route' | 'city' | 'travel' | 'ended'; ending?: Ending;
  stayDays: number; pendingEvent?: string;
  pendingDish?: string; pendingGate?: string; dirtyDays?: number;   // consecutive days in dirty clothes (mood drain grows)              // gate for the airport dash after a taxi breakdown                              // dish id chosen when Cook was tapped; the mini-game and the result must use the same one
}
export interface LogLine { day: number; city: string; text: string; }
export type Ending = { kind: 'win' | 'hospital' | 'flewhome' | 'outofdays' | 'broke' | 'quit'; text: string; score: number; cause?: string; };  // cause: the one-line reason shown on the share card
export type CityAction = 'work' | 'explore' | 'train' | 'cook' | 'rest' | 'laundry' | 'checkroom' | 'moveon';

// ---------- Mini-game contract ----------
// Every mini-game is a Phaser scene started with MinigameLaunch and MUST call launch.onDone(result) exactly once, then stop itself.
export interface MinigameLaunch { energy: number; difficulty: number; payload?: any; extraLives?: number; onDone: (r: MinigameResult) => void; preview?: (r: MinigameResult) => string[]; }   // preview: result-card lines for what this outcome confers (+5 health ...)  // extraLives: hiking boots etc.
export interface MinigameResult { score: number; perfect: boolean; failed: boolean; }
export const MINIGAME_KEYS = { cooking: 'Cooking', workout: 'Workout', carryon: 'CarryOn', kite: 'Kite', airport: 'Airport', laundry: 'Laundry' } as const;

// ---------- Save ----------
export const SAVE_KEY = 'nomadtrail.save.v2';  // v2: money, single bag
export const SETTINGS_KEY = 'nomadtrail.settings.v1';
export interface Settings { muted: boolean; runs: number; bestScore: number; history: { ending: Ending['kind']; day: number; score: number }[]; }
