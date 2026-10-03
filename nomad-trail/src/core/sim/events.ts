import type { RunState, GameEvent, Effects, EventChoice, City, ItemTag, Transport } from '../types';
import { EVENTS, CITY, ITEM } from './data';
import type { Rng } from './rng';

export interface ResolvedEvent { id: string; title: string; text: string; effects: Effects; mitigated: boolean; choices?: EventChoice[]; pending: boolean; }
export interface RollCtx { transport?: Transport; timezones?: number; overweightRatio?: number; lodgingCancel?: number; }

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const monthOf = (day: number) => { const d = new Date(Date.UTC(2026, 0, 1 + Math.max(0, day - 1))); return d.getUTCMonth() + 1; };

/** Items the player can actually reach right now. One suitcase: while it is delayed only the essentials (laptop, watch, toiletries: assumed carried on) are reachable. */
export function accessibleItems(s: RunState) { return s.bagLockedDays > 0 ? s.items.filter(p => ITEM[p.id]?.tags.includes('essential')) : s.items; }
export function hasTag(s: RunState, tag: ItemTag, accessibleOnly = true): boolean {
  return (accessibleOnly ? accessibleItems(s) : s.items).some(p => ITEM[p.id]?.tags.includes(tag));
}
export function hasFlag(s: RunState, flag: string) { return s.achievements.includes('_' + flag); }
export function setFlag(s: RunState, flag: string, on: boolean) { s.achievements = s.achievements.filter(a => a !== '_' + flag); if (on) s.achievements.push('_' + flag); }
export const visibleAchievements = (s: RunState) => s.achievements.filter(a => !a.startsWith('_'));

/** Events that can only happen once per run. */
/** Global multiplier on every event's chance; Cody found the trail too chaotic at 1.0. */
export const EVENT_RATE = 0.95;   /* one multiplier over every baseChance. 0.65 left random packs failing only 25% of the time against a 35-45% target and the trail felt empty; measured sweep: 0.80 -> 34%, 0.95 -> 39%, 1.10 -> 52%. */
/** Consequences of the player's own choices keep their full odds (an overweight bag should still cost you a back). */
const RATE_EXEMPT = new Set(['backinjury', 'overweight', 'dirtyclothes', 'broke']);
export const ONCE = new Set(['otter','kettle','wheel','oktoberfest','backinjury','upgrade','hostgift','surprisemeetup','nowifi',]);
function overweightFactor(ratio: number) { return clamp((ratio - 0.85) / 0.15, 0, 1) * 1.45; }

/* The same thing happening twice in a fortnight is what made the trail feel repetitive: before this, the five commonest
   events were 47% of everything a run threw at you and four events never fired at all. An event that just happened is
   strongly damped and fades back to full odds over COOLDOWN days, which spreads the roll across the rest of the pool
   without touching a single baseChance. The floor keeps a recurring nuisance (mosquitoes in the tropics) possible. */
const COOLDOWN = 34, RECENCY_FLOOR = 0.1;
/* the engine forces these at the moment it needs them (the fall-back after a quiet walk, running out of money), so the
   cooldown only governs their rolled appearances — which is what made "A good day" seven cards a run */
const NO_COOLDOWN = new Set(['broke', 'dirtyclothes']);
function recency(s: RunState, id: string): number {
  if (NO_COOLDOWN.has(id)) return 1;
  const last = s.lastEvent?.[id]; if (last === undefined) return 1;
  return clamp((s.day - last) / COOLDOWN, RECENCY_FLOOR, 1);
}

/** Chance multiplier from per-event special conditions the JSON schema cannot express. Returns 0 to veto. */
function special(ev: GameEvent, s: RunState, city: City, ctx: RollCtx): number {
  const month = monthOf(s.day);
  switch (ev.id) {
    case 'jetlag': return (ctx.timezones ?? 0) >= 6 ? 1 : 0;
    case 'trainview': return ctx.transport === 'train' ? 1 : 0;
    case 'backinjury': return overweightFactor(ctx.overweightRatio ?? 0);
    case 'overweight': return (ctx.overweightRatio ?? 0) >= 0.96 ? 1 : 0;
    case 'oktoberfest': return month === 9 ? 1 : 0;
    case 'windday': return city.activities.includes('kite') ? 1 : 0;
    case 'mosquito': return (city.eventWeights['mosquito'] ?? 0) > 1 || (month >= 5 && month <= 9) ? 1 : 0.15;
    case 'airbnbcancel': return ctx.lodgingCancel === undefined ? 1 : ctx.lodgingCancel / 0.08;
    case 'goodday': return s.mood > 40 ? 1 : 0.4;
    case 'museum': return city.museum ? 1 : 0;   /* nine cities have no museum, and the card was printing "the afternoon in the museum" */
    case 'dirtyclothes': return 0;
    default: return 1;
  }
}

export function eventChance(ev: GameEvent, s: RunState, ctx: RollCtx): { chance: number; mitigated: boolean } {
  const city = CITY[s.cityId];
  if (ONCE.has(ev.id) && hasFlag(s, 'ev_' + ev.id)) return { chance: 0, mitigated: false };
  if (ev.requiresCity && ev.requiresCity !== s.cityId) return { chance: 0, mitigated: false };
  if (ev.requiresCities && !ev.requiresCities.includes(s.cityId)) return { chance: 0, mitigated: false };
  if (ev.requiresClimate && !ev.requiresClimate.includes(city.climate)) return { chance: 0, mitigated: false };
  if (ev.requiresOutdoorsy && !city.outdoorsy) return { chance: 0, mitigated: false };                      // no mountain talk in Tokyo
  if (ev.requiresActivity && !ev.requiresActivity.some(a => city.activities.includes(a))) return { chance: 0, mitigated: false };
  if (ev.requiresTransport && (!ctx.transport || !ev.requiresTransport.includes(ctx.transport))) return { chance: 0, mitigated: false };
  if (ev.requiresTag && !hasTag(s, ev.requiresTag)) return { chance: 0, mitigated: false };
  if (ev.requiresOverweight && (ctx.overweightRatio ?? 0) < 0.85) return { chance: 0, mitigated: false };
  const mitigated = !!ev.mitigatedBy?.some(t => hasTag(s, t)) || (ev.id === 'forgot' && hasFlag(s, 'roomchecked'));
  let chance = (RATE_EXEMPT.has(ev.id) ? 1 : EVENT_RATE) * ev.baseChance * (city.eventWeights[ev.id] ?? 1) * special(ev, s, city, ctx) * recency(s, ev.id);
  /* gear that counters an event makes it rarer as well as milder: you are the person who checks the shellfish */
  if (mitigated) chance *= ev.mitigatedEffects ? 0.7 : 0.35;
  return { chance: clamp(chance, 0, 0.95), mitigated };
}

export const availableChoices = (s: RunState, choices: EventChoice[]) => choices.filter(c => !c.requiresTag || hasTag(s, c.requiresTag));
/** The mitigated line to show: mitigatedText, unless the item that actually saved you is listed as an exception. */
export function mitigatedLine(s: RunState, ev: GameEvent): string {
  const by = ev.mitigatedTextBy;
  if (by) { for (const id of Object.keys(by)) if (s.items.some(p => p.id === id)) return by[id]; }   /* declaration order decides it when two bits of gear both apply */
  return ev.mitigatedText ?? ev.text;
}
export function fmt(text: string, s: RunState, item?: string) {
  const c = CITY[s.cityId];
  return text.replace(/\{city\}/g, c?.name ?? s.cityId).replace(/\{day\}/g, String(s.day)).replace(/\{item\}/g, item ?? 'something').replace(/\{museum\}/g, c?.museum ?? 'the museum').replace(/\{animal\}/g, c?.animal ?? 'a dog');
}

/** Applies an Effects block to the state in place. Returns the lost item name, if any. */
export function applyEffects(s: RunState, e: Effects, rng: Rng): string | undefined {
  let lostName: string | undefined;
  if (e.health) s.health = clamp(s.health + gain(s, e.health), 0, 100);
  if (e.energy) s.energy = clamp(s.energy + gain(s, e.energy), 0, energyCap(s));
  if (e.mood) s.mood = clamp(s.mood + gain(s, e.mood), 0, 100);
  if (e.days) { s.day += e.days; s.stayDays += e.days; s.cleanClothes = Math.max(0, s.cleanClothes - e.days); }
  if (e.bagLocked) s.bagLockedDays = Math.max(s.bagLockedDays, rng.int(1, 4));
  if (e.wheelBroken) s.wheelBroken = true;
  if (e.backInjury) s.backInjuryDays = Math.max(s.backInjuryDays, e.backInjury);
  if (e.sick) s.sickDays = Math.max(s.sickDays, e.sick);
  if (e.money) s.money += e.money;
  if (e.cleanClothes === 'full') s.cleanClothes = Math.max(s.cleanClothes, s.maxClothes);
  if (e.unlockAchievement && !s.achievements.includes(e.unlockAchievement)) s.achievements.push(e.unlockAchievement);
  if (e.loseItemTag) {
    const idx = s.items.findIndex(p => ITEM[p.id]?.tags.includes(e.loseItemTag!));
    if (idx >= 0) lostName = loseItem(s, idx);
  }
  if (e.loseRandomItem && s.items.length) lostName = loseItem(s, rng.int(0, s.items.length - 1));
  return lostName;
}
export function loseItem(s: RunState, idx: number): string {
  const [p] = s.items.splice(idx, 1); s.lostItems.push(p.id);
  recomputeClothes(s); return ITEM[p.id]?.name ?? p.id;
}
export function recomputeClothes(s: RunState) {
  // the outfit you wear plus spares only exist if you packed clothes at all; nothing packed = one outfit, dirty from day two
  const packedDays = s.items.reduce((a, p) => a + (ITEM[p.id]?.clothesDays ?? 0), 0);
  const max = packedDays ? 3 + packedDays : 0;
  s.maxClothes = max; s.cleanClothes = Math.min(s.cleanClothes, max);
}
export const energyCap = (s: RunState) => (s.backInjuryDays > 0 ? 50 : 100);

/* ---------- Settling ----------
   There is no minimum stay any more. What stops you bouncing between cities every three days is that bouncing does
   not work: each hop inside a fortnight costs you more on arrival, and — the part that actually bites — everything
   good lands softer while you are churning. Training, cooking, resting, a lucky day: all of it is multiplied by
   settle(). One move in two weeks is free. Four and you are running to stand still. */
export const CHURN_WINDOW = 14, SETTLE_DECAY = 0.58, SETTLE_FLOOR = 0.12;
/** Legs flown/ridden in the last CHURN_WINDOW days, the one you are on included. */
export function churn(s: RunState, extra = 0): number { return s.legsLast30.filter(d => s.day - d < CHURN_WINDOW).length + extra; }
/** How much of a stat gain actually sticks right now: 1 settled, 0.58 after a second hop, 0.34 after a third, 0.19 after a fourth. */
export function settle(s: RunState): number { return clamp(Math.pow(SETTLE_DECAY, Math.max(0, churn(s) - 1)), SETTLE_FLOOR, 1); }
/** Scales an improvement by how settled the run is; losses are never softened. */
export function gain(s: RunState, v: number): number { return v > 0 ? v * settle(s) : v; }
/** The word for the current state, for the city plate. */
export function settleLabel(s: RunState): { word: string; drop: number } {
  const m = settle(s); return { word: churn(s) <= 1 ? 'settled' : m > 0.5 ? 'unsettled' : m > 0.3 ? 'frazzled' : 'burnt out', drop: Math.round((1 - m) * 100) };
}

/** Events that only make sense once you are actually in the booked lodging. Suppressed on a day the booking was cancelled. */
export const LODGING_DEPENDENT = new Set(['nowifi', 'hostgift', 'sleepless']);
/** Rolls all events for a moment. Applies direct effects; a choice-event becomes pending (max one). `filter` narrows the candidates. */
export function rollEvents(s: RunState, when: GameEvent['when'], ctx: RollCtx, rng: Rng, max = 2, filter?: (e: GameEvent) => boolean, boost = 1): ResolvedEvent[] {
  const out: ResolvedEvent[] = [];
  /* `boost` lifts every chance for this roll: an explore day is meant to be the eventful one */
  const cands = EVENTS.filter(e => e.when === when && (!filter || filter(e))).map(e => { const c = eventChance(e, s, ctx); return { e, ...c, chance: clamp(c.chance * boost, 0, 0.95) }; }).filter(c => c.chance > 0);
  // shuffle so the first-listed events do not dominate the cap
  for (let i = cands.length - 1; i > 0; i--) { const j = rng.int(0, i); [cands[i], cands[j]] = [cands[j], cands[i]]; }
  for (const c of cands) {
    if (out.length >= max) break;
    if (!rng.chance(c.chance)) continue;
    if (c.e.choices && (s.pendingEvent || out.some(o => o.pending))) continue;
    const r = resolve(s, c.e, c.mitigated, rng);
    if (r.pending) s.pendingEvent = c.e.id;
    if (ONCE.has(c.e.id)) setFlag(s, 'ev_' + c.e.id, true);
    out.push(r);
  }
  return out;
}
/** Forces whichever of `ids` fits this city, preferring the ones the run has not seen lately. Used for the explore
 *  fall-back: when a walk turns up nothing, the day should still be a different small good thing each time rather
 *  than "A good day" for the twelfth run in a row. Returns undefined if none of them can happen here. */
export function forceOneOf(s: RunState, ids: string[], ctx: RollCtx, rng: Rng): ResolvedEvent | undefined {
  const pool = ids.map(id => EVENTS.find(e => e.id === id)).filter((e): e is GameEvent => !!e && eventChance(e, s, ctx).chance > 0);
  if (!pool.length) return undefined;
  const w = pool.map(e => recency(s, e.id));        // weighted by how long ago it last happened, so the pool rotates
  let r = rng.next() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return resolve(s, pool[i], !!pool[i].mitigatedBy?.some(t => hasTag(s, t)) && !!pool[i].mitigatedEffects, rng); }
  return resolve(s, pool[pool.length - 1], false, rng);
}
/** Fires a specific event unconditionally (engine-scheduled events like radon, money). */
export function forceEvent(s: RunState, id: string, rng: Rng, mitigated = false): ResolvedEvent {
  const ev = EVENTS.find(e => e.id === id)!; return resolve(s, ev, mitigated, rng);
}
/** One of the event's alternate tellings, or its single text. The pending-choice branch always uses the main text: that one is a question. */
export function pickText(ev: GameEvent, rng: Rng): string { return ev.texts?.length ? rng.pick([ev.text, ...ev.texts]) : ev.text; }
function resolve(s: RunState, ev: GameEvent, mitigated: boolean, rng: Rng): ResolvedEvent {
  const useMit = mitigated && !!ev.mitigatedEffects;
  const effects = useMit ? ev.mitigatedEffects! : ev.effects;
  if (ev.choices && !useMit) {
    s.eventsFired = [...(s.eventsFired ?? []), ev.id]; s.lastEvent = { ...(s.lastEvent ?? {}), [ev.id]: s.day };
    return { id: ev.id, title: ev.title, text: fmt(ev.text, s), effects: {}, mitigated, choices: availableChoices(s, ev.choices), pending: true };
  }
  const lost = applyEffects(s, effects, rng);
  const text = fmt(useMit ? mitigatedLine(s, ev) : pickText(ev, rng), s, lost);
  s.log.push({ day: s.day, city: s.cityId, text: `${ev.title}: ${text}` });
  s.eventsFired = [...(s.eventsFired ?? []), ev.id];   /* the credits page lists what really happened, keyed by these ids */
  s.lastEvent = { ...(s.lastEvent ?? {}), [ev.id]: s.day };   /* feeds recency(): the same card should not come round again next week */
  return { id: ev.id, title: ev.title, text, effects, mitigated: useMit, pending: false };
}
