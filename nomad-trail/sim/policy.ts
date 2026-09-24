// Shared headless player policies for `npm run sim` and tests. Items are BUNDLES (see tools/gen_items.py).
import type { RunState, PackedItem, Bag, CityAction, MinigameResult } from '../src/core/types';
import { CONTINENT_OF } from '../src/core/types';
import { Sim, GRID } from '../src/core/sim/engine';
import { makeRng, type Rng } from '../src/core/sim/rng';
import { ITEMS, ITEM } from '../src/core/sim/data';

/** Shelf packer: places items left-to-right, top-to-bottom into a grid. Returns null if it does not fit. */
export function shelfPack(ids: string[], bag: Bag): PackedItem[] | null {
  const g = GRID[bag]; const occ = Array.from({ length: g.rows }, () => Array(g.cols).fill(false));
  const out: PackedItem[] = [];
  const sorted = [...ids].sort((a, b) => ITEM[b].w * ITEM[b].h - ITEM[a].w * ITEM[a].h);
  for (const id of sorted) {
    const it = ITEM[id]; let placed = false;
    for (let y = 0; y <= g.rows - it.h && !placed; y++) for (let x = 0; x <= g.cols - it.w && !placed; x++) {
      let free = true; for (let dy = 0; dy < it.h && free; dy++) for (let dx = 0; dx < it.w; dx++) if (occ[y + dy][x + dx]) { free = false; break; }
      if (!free) continue;
      for (let dy = 0; dy < it.h; dy++) for (let dx = 0; dx < it.w; dx++) occ[y + dy][x + dx] = true;
      out.push({ id, bag, x, y }); placed = true;
    }
    if (!placed) return null;
  }
  return out;
}
/** What a sensible person keeps on their body: the job and the phone. */
const ESSENTIALS_BACK = ['laptopkit', 'phonekit', 'watch'];
export type PackStyle = 'random' | 'heavy' | 'smart';
/** Builds a pack. random: realistic first-timer with variations. heavy: near the limit with traps. smart: light, essentials on the back, health + organizer + coffee. */
export function buildPack(style: PackStyle, rng: Rng): PackedItem[] {
  const back: string[] = [...ESSENTIALS_BACK]; const chk: string[] = [];
  const add = (ids: string[], where: string[]) => { for (const id of ids) if (!back.includes(id) && !chk.includes(id)) where.push(id); };
  if (style === 'smart') {
    add(['toiletries', 'sleepkit', 'firstaid', 'medkit', 'supplements'], back);
    add(['clothes1', 'clothes2', 'shell', 'protein', 'skincare', 'coffeekit', 'adventure', 'fitnesskit', 'packingcubes', 'mosquitokit', 'swimkit', 'sunkit'], chk);
  } else {
    // clothes: first-timers under-pack or over-pack
    add(rng.pick([['clothes1'], ['clothes1', 'clothes2'], ['clothes1', 'clothes2', 'clothes3'], ['clothes1', 'jeans2']]), chk);
    // sometimes the phone or the laptop goes in the suitcase (baggage-delay bait)
    if (rng.chance(0.35)) { const moved = rng.pick(['laptopkit', 'phonekit']); back.splice(back.indexOf(moved), 1); chk.push(moved); }
    const pool = ITEMS.filter(i => !back.includes(i.id) && !chk.includes(i.id) && !i.tags.includes('clothing')).map(i => i.id);
    const shuffled = [...pool].sort(() => rng.next() - 0.5);
    if (style === 'heavy') {
      add(['kitegear', 'dronekit', 'books', 'hikingboots', 'travelkettle', 'hostgifts', 'yogamat'], chk);
      const target = rng.int(46, 50);
      for (const id of shuffled) { const w = Sim.bagWeight(chk.map(id2 => ({ id: id2, bag: 'checked' as Bag, x: 0, y: 0 })), 'checked'); if (w + ITEM[id].weightLb > target || chk.includes(id) || back.includes(id)) continue; chk.push(id); }
    } else {
      // a first-timer grabs a handful of bundles, not the whole shop: 6 to 11 of them, whatever catches the eye
      add(shuffled.slice(0, rng.int(6, 11)), chk);
    }
    if (rng.chance(0.4)) add(['sleepkit'], back);
  }
  // fit: drop from the end until both grids and weights pass
  let cPack: PackedItem[] | null = null, bPack: PackedItem[] | null = null;
  for (let guard = 0; guard < 200; guard++) {
    cPack = shelfPack(chk, 'checked'); bPack = shelfPack(back, 'backpack');
    const wc = Sim.bagWeight(chk.map(id => ({ id, bag: 'checked' as Bag, x: 0, y: 0 })), 'checked'), wb = Sim.bagWeight(back.map(id => ({ id, bag: 'backpack' as Bag, x: 0, y: 0 })), 'backpack');
    if (cPack && bPack && wc <= GRID.checked.maxLb && wb <= GRID.backpack.maxLb) break;
    if (!cPack || wc > GRID.checked.maxLb) chk.pop(); else back.pop();
  }
  return [...(cPack ?? []), ...(bPack ?? [])];
}

const aheadOf = (s: RunState, to: string) => { const here = Sim.CITY[s.cityId]; const d = ((Sim.CITY[to].lon - here.lon + 540) % 360) - 180; return s.direction === 'east' ? d : -d; };
/** First-timers wander but mostly forward: weight legs by how far ahead they go. */
function weightedLeg<T extends { to: string; home: boolean }>(legs: T[], s: RunState, rng: Rng): T {
  const w = legs.map(l => Math.max(0.3, 1 + aheadOf(s, l.to) / 120));   // first-timers tap around; a slight lean forward
  let r = rng.next() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < legs.length; i++) { r -= w[i]; if (r <= 0) return legs[i]; }
  return legs[legs.length - 1];
}
/** The learned player: keeps moving forward, takes a hero city when it is roughly on the way, and detours for a new continent. */
function smartLeg<T extends { to: string; city: { hero: boolean; region: string } }>(legs: T[], s: RunState): T | undefined {
  const seen = new Set(Sim.continentsVisited(s));
  const scored = legs.map(l => ({ l, v: aheadOf(s, l.to) + (l.city.hero ? 15 : 0) + (seen.has(CONTINENT_OF[Sim.CITY[l.to].region]) ? 0 : 25) }));
  return scored.sort((a, b) => b.v - a.v)[0]?.l;
}
export interface RunOutcome { ending: NonNullable<RunState['ending']>['kind']; day: number; score: number; cities: number; continents: number; events: Record<string, number>; state: RunState; }
/** Plays one run headless. smart=true plays the "learned" policy. */
export function playRun(seed: number, style: PackStyle, opts: { start?: string; direction?: 'east' | 'west'; skill?: number } = {}): RunOutcome {
  const rng = makeRng(seed ^ 0xabcdef);
  let s = Sim.createRun(seed, opts.start, opts.direction ?? rng.pick(['east', 'west']));
  const v = Sim.setPack(s, buildPack(style, rng)); if (!v.ok || !v.state) throw new Error('pack failed: ' + v.errors.join('; '));
  s = v.state;
  const smart = style === 'smart'; const skill = opts.skill ?? (smart ? 0.8 : 0.5);
  const events: Record<string, number> = {};
  const mg = (): MinigameResult => { const sc = Math.max(0, Math.min(1, skill + (rng.next() - 0.5) * 0.5)); return { score: sc, perfect: sc > 0.92, failed: sc < 0.2 }; };
  let guard = 0;
  while (s.phase !== 'ended' && guard++ < 3000) {
    if (s.pendingEvent) { const pc = Sim.pendingChoices(s)!; s = Sim.resolveChoice(s, pc.id, smart ? Math.min(1, pc.choices.length - 1) : rng.int(0, pc.choices.length - 1)).state; continue; }
    if (s.phase === 'route') {
      const legs = Sim.availableLegs(s); if (!legs.length) { s.phase = 'ended'; s.ending = { kind: 'quit', text: 'dead end', score: 0 }; break; }
      const home = legs.find(l => l.home);
      const pick = home && (smart || rng.chance(0.7)) ? home : (smart ? smartLeg(legs.filter(l => !l.home), s) ?? legs[0] : weightedLeg(legs, s, rng));
      const r = Sim.travelTo(s, pick.to); r.events.forEach(e => (events[e.id] = (events[e.id] ?? 0) + 1)); s = r.state; continue;
    }
    if (s.phase === 'city') {
      const city = Sim.CITY[s.cityId];
      const target = Math.max(city.minStay, city.suggestedStay + rng.int(-3, 3));
      let action: CityAction;
      if (s.stayDays >= target) action = smart && s.stayDays === Math.ceil(target) && !Sim.hasFlag(s, 'roomchecked') && !Sim.hasTag(s, 'organizer') ? 'checkroom' : 'moveon';
      else if (s.cleanClothes <= (smart ? 1 : 0)) action = 'laundry';
      else if (s.energy < (smart ? 45 : 30)) action = 'rest';
      else if (smart && s.health < 70 && s.energy >= 30) action = rng.chance(0.5) ? 'cook' : 'train';
      else action = rng.pick(smart ? ['work', 'work', 'explore', 'train', 'cook', 'rest'] : ['work', 'work', 'explore', 'explore', 'rest', 'train', 'cook']);
      let r = Sim.cityAction(s, action);
      if (r.error) { r = Sim.cityAction(s, action === 'moveon' ? 'rest' : action === 'train' ? 'rest' : 'work'); }
      r.events.forEach(e => (events[e.id] = (events[e.id] ?? 0) + 1)); s = r.state;
      if (r.minigame) { const rr = Sim.applyMinigameResult(s, r.minigame.key, mg()); rr.events.forEach(e => (events[e.id] = (events[e.id] ?? 0) + 1)); s = rr.state; }
      continue;
    }
    break;
  }
  if (s.phase !== 'ended') { s.ending = { kind: 'quit', text: 'stuck', score: 0 }; }
  return { ending: s.ending!.kind, day: s.day, score: s.ending!.score, cities: s.visited.length, continents: Sim.continentsVisited(s).length, events, state: s };
}
