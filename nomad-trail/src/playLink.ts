// Quick play from a URL, for reviewing on a phone: /trail/?play=Workout&plan=pushup&city=lisbon
// Scenes: Workout (activity, plan, city, day, lives), Cooking (dish, city), CarryOn (game, city, seed), Drone (city, level, seed), Kite (city), Airport (gate),
// Laundry, Otter, Coffee (city). Ends on a small card with REPLAY and BACK TO REVIEW.
import Phaser from 'phaser';
import type { MinigameResult, City, Dish, Puzzle } from './core/types';
import { PAL } from './core/palette';
import citiesJson from './data/cities.json';
import dishesJson from './data/dishes.json';
import levelsJson from './data/arcade_levels.json';
import puzzlesJson from './data/puzzles.json';
import { puzzleById } from './minigames/work/sample';
import { Button } from './ui/Button';
import { txt, rect } from './ui/theme';

const PUZZLES = puzzlesJson as unknown as Puzzle[];
const CITIES = citiesJson as unknown as City[]; const DISHES = dishesJson as unknown as Dish[]; const LEVELS = levelsJson as unknown as any[];
export class PlayEndScene extends Phaser.Scene {
  constructor() { super('PlayEnd'); }
  create(d: { title: string; result?: MinigameResult; replay: () => void }) {
    rect(this, 0, 0, 360, 640, PAL.night0);
    txt(this, 180, 200, d.title.toUpperCase(), 14, PAL.sun2, { align: 'center', wrap: 320 }).setOrigin(0.5);
    if (d.result) txt(this, 180, 240, `score ${Math.round(d.result.score)}${d.result.perfect ? ' · PERFECT' : d.result.failed ? ' · failed' : ''}`, 10, PAL.gray2).setOrigin(0.5);
    new Button(this, 180, 320, 'REPLAY', () => d.replay(), { w: 240, fill: PAL.sea1 });
    new Button(this, 180, 380, 'BACK TO REVIEW', () => { location.href = 'review/#quickplay'; }, { w: 240, fill: PAL.dusk0 });
    new Button(this, 180, 440, 'PLAY THE GAME', () => { location.href = './'; }, { w: 240, h: 44, size: 10, fill: PAL.night2 });
  }
}
export function installPlayLink(game: Phaser.Game): boolean {
  const q = new URLSearchParams(location.search); const play = q.get('play'); if (!play) return false;
  const cityId = q.get('city') || 'lisbon'; const city = CITIES.find(c => c.id === cityId) || CITIES[0];
  const stopAll = () => game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key));
  const start = () => {
    stopAll();
    const done = (title: string) => (r?: MinigameResult) => { stopAll(); game.scene.start('PlayEnd', { title, result: r, replay: start }); };
    const base = { energy: Number(q.get('energy') || 85), difficulty: Number(q.get('difficulty') || 0.4) };
    switch (play) {
      case 'Workout': { const activity = q.get('activity') || (city.activities[0] ?? 'bands'); const plan = q.get('plan'); const extraLives = Number(q.get('lives') || 0);
        game.scene.start('Workout', { ...base, extraLives, payload: { activity, city: city.id, day: Number(q.get('day') || 3), ...(plan ? { plan: [plan] } : {}) }, onDone: done(`${plan || activity} · ${city.name}`) }); break; }
      case 'Cooking': { const dish = DISHES.find(d => d.id === q.get('dish')) || DISHES.find(d => city.dishes.includes(d.id)) || DISHES[0];
        game.scene.start('Cooking', { ...base, payload: { ...dish, cityName: city.name, dullKnives: q.get('dull') === '1' }, onDone: done(dish.name) }); break; }
      case 'CarryOn': { const gm = q.get('game') || 'carryon'; const lvl = LEVELS.find(l => l.city === city.id) || LEVELS.find(l => l.city === 'generic');
        game.scene.start('CarryOn', { ...base, payload: { game: gm, level: lvl ? { ...lvl, city: city.name, hazard: city.hazard } : undefined, city: city.id, cityName: city.name, hazard: city.hazard, climate: city.climate, seed: Number(q.get('seed') || 7) }, onDone: done(`${gm} · ${city.name}`) }); break; }
      case 'Kite': game.scene.start('Kite', { ...base, payload: { city: city.id }, onDone: done(`kite · ${city.name}`) }); break;
      case 'Airport': game.scene.start('Airport', { ...base, payload: { gate: q.get('gate') || 'B56' }, onDone: done('gate dash') }); break;
      case 'Drone': game.scene.start('Drone', { ...base, payload: { city, cityName: city.name, seed: Number(q.get('seed') || 7), level: Number(q.get('level') || 1) }, onDone: done(`drone · ${city.name}`) }); break;
      case 'Laundry': game.scene.start('Laundry', { ...base, payload: { kit: q.get('kit') === '1' }, onDone: done('laundry') }); break;
      case 'Work': { const pz = puzzleById(PUZZLES, q.get('puzzle')); game.scene.start('Work', { ...base, payload: { puzzle: pz, pay: Number(q.get('pay') || 450), day: Number(q.get('day') || 3) }, onDone: done(`puzzle · ${pz.title}`) }); break; }
      case 'Otter': game.scene.start('Otter', { onDone: () => done('the otter')() }); break;
      case 'Coffee': game.scene.start('Coffee', { cityId: city.id, day: Number(q.get('day') || 12), climate: city.climate, region: city.region, onDone: () => done(`coffee · ${city.name}`)() }); break;
      default: return false;
    }
    return true;
  };
  const whenBooted = () => { if (game.scene.isActive('Title')) start(); else setTimeout(whenBooted, 100); };
  game.events.once('ready', () => setTimeout(whenBooted, 100));
  return true;
}
