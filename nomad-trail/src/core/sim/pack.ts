// Packing helpers shared by the UI (Surprise Me), the tests and the headless policy. One suitcase.
import type { PackedItem } from '../types';
import { ITEMS, ITEM } from './data';
import { GRID } from './consts';
import { makeRng, type Rng } from './rng';

/** Shelf packer: places items left-to-right, top-to-bottom into the suitcase. Returns null if it does not fit. */
export function shelfPack(ids: string[]): PackedItem[] | null {
  const g = GRID.checked; const occ = Array.from({ length: g.rows }, () => Array(g.cols).fill(false));
  const out: PackedItem[] = [];
  const sorted = [...ids].sort((a, b) => ITEM[b].w * ITEM[b].h - ITEM[a].w * ITEM[a].h);
  for (const id of sorted) {
    const it = ITEM[id]; if (!it) return null; let placed = false;
    for (let y = 0; y <= g.rows - it.h && !placed; y++) for (let x = 0; x <= g.cols - it.w && !placed; x++) {
      let free = true; for (let dy = 0; dy < it.h && free; dy++) for (let dx = 0; dx < it.w; dx++) if (occ[y + dy][x + dx]) { free = false; break; }
      if (!free) continue;
      for (let dy = 0; dy < it.h; dy++) for (let dx = 0; dx < it.w; dx++) occ[y + dy][x + dx] = true;
      out.push({ id, bag: 'checked', x, y }); placed = true;
    }
    if (!placed) return null;
  }
  return out;
}
export const idsWeight = (ids: string[]) => Math.round(ids.reduce((a, id) => a + (ITEM[id]?.weightLb ?? 0), 0) * 10) / 10;

export type PackStyle = 'random' | 'heavy' | 'smart';
/** Builds a legal pack. random: realistic first-timer with variations. heavy: near the limit with traps. smart: light, health + organizer + coffee + monitor. */
export function buildPack(style: PackStyle, rng: Rng): PackedItem[] {
  const ids: string[] = ['laptopkit', 'toiletries', 'watch'];
  const add = (more: string[]) => { for (const id of more) if (!ids.includes(id) && ITEM[id]) ids.push(id); };
  if (style === 'smart') {
    add(['clothes1', 'clothes2', 'sleepkit', 'firstaid', 'medkit', 'supplements', 'shell', 'protein', 'skincare', 'coffeekit', 'adventure', 'fitnesskit', 'packingcubes', 'mosquitokit', 'airmonitor', 'sunkit']);
  } else {
    add(rng.pick([['clothes1'], ['clothes1', 'clothes2'], ['clothes1', 'clothes2', 'clothes3'], ['clothes1', 'jeans2']]));
    const pool = ITEMS.filter(i => !ids.includes(i.id) && !i.tags.includes('clothing')).map(i => i.id);
    const shuffled = [...pool].sort(() => rng.next() - 0.5);
    if (style === 'heavy') {
      add(['kitegear', 'dronekit', 'books', 'hikingboots', 'travelkettle', 'hostgifts', 'yogamat']);
      const target = rng.int(46, 50);
      for (const id of shuffled) { if (ids.includes(id) || idsWeight(ids) + ITEM[id].weightLb > target) continue; ids.push(id); }
    } else {
      add(shuffled.slice(0, rng.int(6, 11)));   // a first-timer grabs a handful of bundles, not the whole shop
    }
  }
  // fit: drop from the end (never the laptop or the first week of clothes) until the grid and the weight pass
  for (let guard = 0; guard < 200; guard++) {
    const p = shelfPack(ids);
    if (p && idsWeight(ids) <= GRID.checked.maxLb) return p;
    const victim = [...ids].reverse().find(id => id !== 'laptopkit' && id !== 'clothes1');
    if (!victim) break; ids.splice(ids.indexOf(victim), 1);
  }
  return shelfPack(['laptopkit', 'clothes1'])!;
}
/** For the Surprise Me button: a legal random pack that always has the laptop and a week of clothes. */
export function randomPack(seed: number): PackedItem[] {
  const p = buildPack('random', makeRng(seed));
  if (!p.some(i => i.id === 'laptopkit') || !p.some(i => ITEM[i.id]?.clothesDays)) return shelfPack(['laptopkit', 'clothes1', 'toiletries', 'watch'])!;
  return p;
}
