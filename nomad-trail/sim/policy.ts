// Shared headless player policies for `npm run sim` and tests. Items are BUNDLES (see tools/gen_items.py).
import type { RunState, CityAction, MinigameResult } from '../src/core/types';
import { CONTINENT_OF } from '../src/core/types';
import { Sim } from '../src/core/sim/engine';
import { makeRng, type Rng } from '../src/core/sim/rng';

// Packing lives in the engine now (one suitcase); re-exported here for the sim and the tests.
export { shelfPack, buildPack, randomPack, type PackStyle } from '../src/core/sim/pack';
import { buildPack, type PackStyle } from '../src/core/sim/pack';

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
export interface RunOutcome { ending: NonNullable<RunState['ending']>['kind']; day: number; score: number; cities: number; continents: number; money: number; events: Record<string, number>; state: RunState; }
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
      else if (smart && s.money < 1500 && !Sim.isWeekend(s.day)) action = 'work';                  // the learned player keeps the balance healthy
      else if (smart && s.workStreak >= 3) action = rng.pick(['explore', 'train', 'cook', 'rest']);   // and takes the break the streak is asking for
      // it is a job: on a weekday most people open the laptop (first-timers ~60% of weekdays, learned players ~70%, less when the streak is long)
      else if (!Sim.isWeekend(s.day) && rng.chance((smart ? 0.7 : 0.6) - Math.min(0.3, s.workStreak * 0.08))) action = 'work';
      else action = rng.pick(smart ? ['explore', 'train', 'cook', 'rest'] : ['explore', 'explore', 'rest', 'train', 'cook']);
      if (action === 'work' && Sim.isWeekend(s.day)) action = rng.pick(['explore', 'rest', 'cook']);  // nobody works weekends
      let r = Sim.cityAction(s, action);
      if (r.error) { r = Sim.cityAction(s, action === 'moveon' ? 'rest' : action === 'train' || action === 'cook' || action === 'laundry' ? 'rest' : Sim.isWeekend(s.day) ? 'rest' : 'work'); }
      if (r.error) r = Sim.cityAction(s, 'rest');
      r.events.forEach(e => (events[e.id] = (events[e.id] ?? 0) + 1)); s = r.state;
      if (r.minigame) { const rr = Sim.applyMinigameResult(s, r.minigame.key, mg()); rr.events.forEach(e => (events[e.id] = (events[e.id] ?? 0) + 1)); s = rr.state; }
      continue;
    }
    break;
  }
  if (s.phase !== 'ended') { s.ending = { kind: 'quit', text: 'stuck', score: 0 }; }
  return { ending: s.ending!.kind, day: s.day, score: s.ending!.score, cities: s.visited.length, continents: Sim.continentsVisited(s).length, money: Math.round(s.money), events, state: s };
}
