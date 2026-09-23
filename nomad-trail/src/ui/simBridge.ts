// Thin adapter between scenes and the SIM agent's engine. Scenes import ONLY from here (never from ../core/sim directly).
import { Sim as Engine } from '../core/sim';
import type { RunState, PackedItem, Leg, CityAction, MinigameResult, Ending, Item, City, GameEvent, Settings, Dish } from '../core/types';
import itemsJson from '../data/items.json';
import citiesJson from '../data/cities.json';
import eventsJson from '../data/events.json';
import dishesJson from '../data/dishes.json';
export interface SimApi {
  gridSpecs: { checked: { cols: number; rows: number; maxLb: number }; backpack: { cols: number; rows: number; maxLb: number } };
  createRun(seed: number, startCity: string, direction: 'east' | 'west'): RunState;
  setPack(state: RunState, packed: PackedItem[]): { ok: boolean; errors: string[]; weights: { checked: number; backpack: number } };
  availableLegs(state: RunState): Leg[];
  travelTo(state: RunState, cityId: string): { state: RunState; events: string[] };
  cityAction(state: RunState, action: CityAction): { state: RunState; events: string[]; minigame?: { key: string; payload?: any; difficulty: number } };
  applyMinigameResult(state: RunState, key: string, result: MinigameResult): RunState;
  resolveChoice(state: RunState, eventId: string, choiceIdx: number): RunState;
  checkEnding(state: RunState): Ending | undefined;
  score(state: RunState): number;
  monthOf(day: number): number;
  coffeePacked(state: RunState): boolean;
  save(state: RunState): void; load(): RunState | undefined; clearSave(): void;
  loadSettings(): Settings; saveSettings(s: Settings): void;
}
export const Sim: SimApi = Engine as unknown as SimApi;
const items = itemsJson as unknown as Item[]; const cities = citiesJson as unknown as City[]; const events = eventsJson as unknown as GameEvent[]; const dishes = dishesJson as unknown as Dish[];
export const Data = {
  items, cities, events, dishes,
  item: (id: string) => items.find(i => i.id === id),
  city: (id: string) => cities.find(c => c.id === id),
  event: (id: string) => events.find(e => e.id === id),
  dish: (id: string) => dishes.find(d => d.id === id),
};
/** Registry helpers: the run lives in scene.registry under 'run'. */
export function getRun(scene: Phaser.Scene): RunState { return scene.registry.get('run') as RunState; }
export function putRun(scene: Phaser.Scene, s: RunState) { scene.registry.set('run', s); Sim.save(s); }
export function getSettings(scene: Phaser.Scene): Settings { let s = scene.registry.get('settings') as Settings | undefined; if (!s) { s = Sim.loadSettings(); scene.registry.set('settings', s); } return s; }
export function putSettings(scene: Phaser.Scene, s: Settings) { scene.registry.set('settings', s); Sim.saveSettings(s); }
import type Phaser from 'phaser';
