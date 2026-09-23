// Shared headless player policies for `npm run sim` and tests.
import type { RunState, PackedItem, Bag, CityAction, MinigameResult } from '../src/core/types';
import { MINIGAME_KEYS } from '../src/core/types';
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
const ESSENTIALS_BACK = ['macbook', 'pixel10', 'anker', 'euadapter', 'airpods', 'yubikey'];
export type PackStyle = 'random' | 'heavy' | 'smart';
/** Builds a pack. random: realistic first-timer with variations. heavy: near the limit with traps. smart: light, essentials in backpack, health + organizer + coffee. */
export function buildPack(style: PackStyle, rng: Rng): PackedItem[] {
  const back: string[] = [...ESSENTIALS_BACK]; const chk: string[] = [];
  const add = (ids: string[], where: string[]) => { for (const id of ids) if (!back.includes(id) && !chk.includes(id)) where.push(id); };
  if (style === 'smart') {
    add(['sleepmask', 'loops', 'firstaid', 'antibiotics', 'probiotics', 'multi', 'sonicare', 'garmincable', 'fenix7', 'sparephone', 'chargerbrick'], back);
    add(['tees5', 'merino3', 'underwear7', 'socks7', 'jeans', 'shorts2', 'reishell', 'downjacket', 'altra', 'reef', 'packingcubes', 'laundrysheets', 'bands', 'pourigami', 'timemore', 'gooseneck', 'creatine', 'greens', 'electrolytes', 'ceraveam', 'repellent', 'diamox', 'sawyer', 'bladder', 'swimsuit', 'ombraz', 'melin', 'straps'], chk);
  } else {
    // clothes: first-timers under-pack or over-pack
    const clothesSets = [['tees5', 'underwear7', 'socks7', 'jeans'], ['merino3', 'underwear7', 'socks7', 'shorts2', 'jeans'], ['tees5', 'merino3', 'underwear7', 'socks7', 'jeans', 'jeans2', 'hoodie', 'hikepants'], ['tees5', 'underwear7']];
    add(rng.pick(clothesSets), chk);
    const pool = ITEMS.filter(i => !back.includes(i.id) && !chk.includes(i.id) && !i.tags.includes('clothing')).map(i => i.id);
    const target = style === 'heavy' ? rng.int(44, 50) : rng.int(22, 44);
    const shuffled = [...pool].sort(() => rng.next() - 0.5);
    if (style === 'heavy') add(['kitegear', 'kettlebell', 'hikingboots', 'wine', 'books', 'proteintub', 'jeans2', 'frenchpress', 'travelkettle'], chk);
    for (const id of shuffled) {
      const w = Sim.bagWeight(chk.map(id2 => ({ id: id2, bag: 'checked' as Bag, x: 0, y: 0 })), 'checked');
      if (w + ITEM[id].weightLb > target || chk.includes(id) || back.includes(id)) continue;
      chk.push(id);
    }
    // sometimes a first-timer puts the meds/laptop charger in the checked bag
    if (rng.chance(0.4)) { const moveable = ['chargerbrick', 'multi', 'sonicare']; add(moveable, chk); }
    if (rng.chance(0.5)) add(['switch'], chk);
    if (rng.chance(0.6)) add(['pourigami', 'timemore', 'gooseneck'], chk);
    if (rng.chance(0.5)) add(['firstaid'], chk); if (rng.chance(0.4)) add(['probiotics'], chk); if (rng.chance(0.4)) add(['packingcubes'], chk);
    if (rng.chance(0.3)) add(['sleepmask', 'loops'], back);
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

/** First-timers wander but mostly forward: weight legs by how far ahead they go. */
function weightedLeg<T extends { to: string; home: boolean }>(legs: T[], s: RunState, rng: Rng): T {
  const here = Sim.CITY[s.cityId];
  const w = legs.map(l => { const d = ((Sim.CITY[l.to].lon - here.lon + 540) % 360) - 180; const ahead = s.direction === 'east' ? d : -d; return Math.max(0.2, 1 + ahead / 40); });
  let r = rng.next() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < legs.length; i++) { r -= w[i]; if (r <= 0) return legs[i]; }
  return legs[legs.length - 1];
}
/** The learned player: keeps moving forward, takes a hero city when it is roughly on the way. */
function smartLeg<T extends { to: string; city: { hero: boolean } }>(legs: T[], s: RunState): T | undefined {
  const here = Sim.CITY[s.cityId];
  const scored = legs.map(l => { const d = ((Sim.CITY[l.to].lon - here.lon + 540) % 360) - 180; const ahead = s.direction === 'east' ? d : -d; return { l, v: ahead + (l.city.hero ? 15 : 0) }; });
  return scored.sort((a, b) => b.v - a.v)[0]?.l;
}
export interface RunOutcome { ending: NonNullable<RunState['ending']>['kind']; day: number; score: number; cities: number; events: Record<string, number>; state: RunState; }
/** Plays one run headless. smart=true plays the "learned" policy. */
export function playRun(seed: number, style: PackStyle, opts: { start?: string; direction?: 'east' | 'west'; skill?: number } = {}): RunOutcome {
  const rng = makeRng(seed ^ 0xabcdef);
  let s = Sim.createRun(seed, opts.start ?? rng.pick(['miami', 'newyork']), opts.direction ?? rng.pick(['east', 'west']));
  const v = Sim.setPack(s, buildPack(style, rng)); if (!v.ok || !v.state) throw new Error('pack failed: ' + v.errors.join('; '));
  s = v.state;
  const smart = style === 'smart'; const skill = opts.skill ?? (smart ? 0.8 : 0.5);
  const events: Record<string, number> = {};
  const mg = (): MinigameResult => { const sc = Math.max(0, Math.min(1, skill + (rng.next() - 0.5) * 0.5)); return { score: sc, perfect: sc > 0.92, failed: sc < 0.2 }; };
  let guard = 0;
  while (s.phase !== 'ended' && guard++ < 3000) {
    if (s.pendingEvent) { const pc = Sim.pendingChoices(s)!; s = Sim.resolveChoice(s, pc.id, smart ? 0 : rng.int(0, pc.choices.length - 1)).state; continue; }
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
  return { ending: s.ending!.kind, day: s.day, score: s.ending!.score, cities: s.visited.length, events, state: s };
}
