import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch, type MinigameResult } from '../core/types';
import { W, H, panel, txt } from './_shared';
import { CookingScene } from './CookingScene';
import { WorkoutScene } from './WorkoutScene';
import { CarryOnScene, DEFAULT_LEVEL } from './CarryOnScene';
import { KiteScene } from './KiteScene';
import { AirportScene } from './AirportScene';
import { LaundryScene } from './LaundryScene';

export const MINIGAME_SCENES = [CookingScene, WorkoutScene, CarryOnScene, KiteScene, AirportScene, LaundryScene];

const SAMPLES: { key: string; label: string; payload?: any }[] = [
  { key: MINIGAME_KEYS.cooking, label: 'Cooking: Kaspressknödel', payload: { id: 'kasp', name: 'Kaspressknödel', city: 'innsbruck', ingredients: ['stale bread', 'graukäse', 'onion', 'egg'], health: 18, mood: 14, steps: [{ kind: 'chop', count: 5 }, { kind: 'knead', count: 10 }, { kind: 'season', count: 3 }, { kind: 'flip', count: 3 }, { kind: 'pour', count: 1 }, { kind: 'stir', count: 2 }] } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: bands', payload: { activity: 'bands', city: 'Lisbon' } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: boulder', payload: { activity: 'boulder', city: 'Innsbruck' } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: ferrata', payload: { activity: 'ferrata', city: 'Innsbruck' } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: trail run', payload: { activity: 'trailrun', city: 'Boulder' } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: hike', payload: { activity: 'hike', city: 'Manaslu' } },
  { key: MINIGAME_KEYS.workout, label: 'Workout: swim', payload: { activity: 'swim', city: 'Antibes' } },
  { key: MINIGAME_KEYS.carryon, label: 'Carry-On: default level', payload: DEFAULT_LEVEL },
  { key: MINIGAME_KEYS.carryon, label: 'Carry-On: Tokyo otters', payload: { ...DEFAULT_LEVEL, city: 'Tokyo', hazard: 'otter', palette: [PAL.dusk0, PAL.dusk1, PAL.pink], tiles: DEFAULT_LEVEL.tiles.map((r, i) => i === 17 ? '#.........H...........#' : r) } },
  { key: MINIGAME_KEYS.carryon, label: 'Carry-On: Dakhla gusts', payload: { ...DEFAULT_LEVEL, city: 'Dakhla', hazard: 'gust', palette: [PAL.sun1, PAL.sun0, PAL.earth3] } },
  { key: MINIGAME_KEYS.kite, label: 'Kiteboarding' },
  { key: MINIGAME_KEYS.airport, label: 'Airport dash' },
  { key: MINIGAME_KEYS.laundry, label: 'Laundry' },
];

class MinigameHarness extends Phaser.Scene {
  private last?: MinigameResult; private lastLabel = ''; private energy = 100;
  constructor() { super('MinigameHarness'); }
  init(data: any) { if (data && data.last) { this.last = data.last; this.lastLabel = data.label; } if (data && typeof data.energy === 'number') this.energy = data.energy; }
  create() {
    this.cameras.main.setBackgroundColor(PAL.night0).setRotation(0).setZoom(1);
    txt(this, W / 2, 30, 'MINIGAME HARNESS', 14, PAL.sun2);
    if (this.last) txt(this, W / 2, 52, `${this.lastLabel}: ${this.last.score} ${this.last.perfect ? 'PERFECT' : this.last.failed ? 'FAILED' : 'ok'}`, 10, PAL.neon);
    const eb = panel(this, 20, 66, W - 40, 24, PAL.night2); eb.setInteractive(new Phaser.Geom.Rectangle(20, 66, W - 40, 24), Phaser.Geom.Rectangle.Contains); const et = txt(this, W / 2, 78, `energy ${this.energy} (tap to toggle 100 / 30)`, 10, PAL.gray2); eb.on('pointerdown', () => { this.energy = this.energy === 100 ? 30 : 100; et.setText(`energy ${this.energy} (tap to toggle 100 / 30)`); });
    SAMPLES.forEach((s, i) => { const y = 104 + i * 38; const p = panel(this, 20, y, W - 40, 32, PAL.night2); p.setInteractive(new Phaser.Geom.Rectangle(20, y, W - 40, 32), Phaser.Geom.Rectangle.Contains); txt(this, 32, y + 16, s.label, 11, PAL.white, 'left');
      p.on('pointerdown', () => { const launch: MinigameLaunch = { energy: this.energy, difficulty: 0.5, payload: s.payload, onDone: (r) => { this.scene.start('MinigameHarness', { last: r, label: s.label, energy: this.energy }); } }; this.scene.start(s.key, launch); }); });
  }
}

/** Adds the six mini-game scenes and a picker to a running game, and starts the picker. Wire under ?harness=1. */
export function launchHarness(game: Phaser.Game) {
  MINIGAME_SCENES.forEach(S => { if (!game.scene.getScene((S as any).name)) { try { game.scene.add(new S().sys.settings.key, S as any, false); } catch { /* already added */ } } });
  if (!game.scene.getScene('MinigameHarness')) game.scene.add('MinigameHarness', MinigameHarness, false);
  game.scene.start('MinigameHarness');
}
