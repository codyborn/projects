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
export const ONCE = new Set(['otter','kettle','wheel','lostphone','seaurchin','oktoberfest','backinjury','upgrade','hostgift','surprisemeetup','nowifi','rockfall']);
function overweightFactor(ratio: number) { return clamp((ratio - 0.85) / 0.15, 0, 1) * 1.45; }

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
    case 'dirtyclothes': return 0;
    default: return 1;
  }
}

export function eventChance(ev: GameEvent, s: RunState, ctx: RollCtx): { chance: number; mitigated: boolean } {
  const city = CITY[s.cityId];
  if (ONCE.has(ev.id) && hasFlag(s, 'ev_' + ev.id)) return { chance: 0, mitigated: false };
  if (ev.requiresCity && ev.requiresCity !== s.cityId) return { chance: 0, mitigated: false };
  if (ev.requiresClimate && !ev.requiresClimate.includes(city.climate)) return { chance: 0, mitigated: false };
  if (ev.requiresOutdoorsy && !city.outdoorsy) return { chance: 0, mitigated: false };                      // no mountain talk in Tokyo
  if (ev.requiresActivity && !ev.requiresActivity.some(a => city.activities.includes(a))) return { chance: 0, mitigated: false };
  if (ev.requiresTransport && (!ctx.transport || !ev.requiresTransport.includes(ctx.transport))) return { chance: 0, mitigated: false };
  if (ev.requiresTag && !hasTag(s, ev.requiresTag)) return { chance: 0, mitigated: false };
  if (ev.requiresOverweight && (ctx.overweightRatio ?? 0) < 0.85) return { chance: 0, mitigated: false };
  const mitigated = !!ev.mitigatedBy?.some(t => hasTag(s, t)) || (ev.id === 'forgot' && hasFlag(s, 'roomchecked'));
  let chance = ev.baseChance * (city.eventWeights[ev.id] ?? 1) * special(ev, s, city, ctx);
  if (mitigated && !ev.mitigatedEffects) chance *= 0.35;
  return { chance: clamp(chance, 0, 0.95), mitigated };
}

export const availableChoices = (s: RunState, choices: EventChoice[]) => choices.filter(c => !c.requiresTag || hasTag(s, c.requiresTag));
export function fmt(text: string, s: RunState, item?: string) {
  return text.replace(/\{city\}/g, CITY[s.cityId]?.name ?? s.cityId).replace(/\{day\}/g, String(s.day)).replace(/\{item\}/g, item ?? 'something');
}

/** Applies an Effects block to the state in place. Returns the lost item name, if any. */
export function applyEffects(s: RunState, e: Effects, rng: Rng): string | undefined {
  let lostName: string | undefined;
  if (e.health) s.health = clamp(s.health + e.health, 0, 100);
  if (e.energy) s.energy = clamp(s.energy + e.energy, 0, energyCap(s));
  if (e.mood) s.mood = clamp(s.mood + e.mood, 0, 100);
  if (e.days) { s.day += e.days; s.stayDays += e.days; s.cleanClothes = Math.max(0, s.cleanClothes - e.days); }
  if (e.bagLocked) s.bagLockedDays = Math.max(s.bagLockedDays, rng.int(1, 4));
  if (e.wheelBroken) s.wheelBroken = true;
  if (e.backInjury) s.backInjuryDays = Math.max(s.backInjuryDays, e.backInjury);
  if (e.sick) s.sickDays = Math.max(s.sickDays, e.sick);
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

/** Events that only make sense once you are actually in the booked lodging. Suppressed on a day the booking was cancelled. */
export const LODGING_DEPENDENT = new Set(['nowifi', 'hostgift', 'sleepless']);
/** Rolls all events for a moment. Applies direct effects; a choice-event becomes pending (max one). `filter` narrows the candidates. */
export function rollEvents(s: RunState, when: GameEvent['when'], ctx: RollCtx, rng: Rng, max = 2, filter?: (e: GameEvent) => boolean): ResolvedEvent[] {
  const out: ResolvedEvent[] = [];
  const cands = EVENTS.filter(e => e.when === when && (!filter || filter(e))).map(e => ({ e, ...eventChance(e, s, ctx) })).filter(c => c.chance > 0);
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
/** Fires a specific event unconditionally (engine-scheduled events like radon, money). */
export function forceEvent(s: RunState, id: string, rng: Rng, mitigated = false): ResolvedEvent {
  const ev = EVENTS.find(e => e.id === id)!; return resolve(s, ev, mitigated, rng);
}
function resolve(s: RunState, ev: GameEvent, mitigated: boolean, rng: Rng): ResolvedEvent {
  const useMit = mitigated && !!ev.mitigatedEffects;
  const effects = useMit ? ev.mitigatedEffects! : ev.effects;
  if (ev.choices && !useMit) {
    return { id: ev.id, title: ev.title, text: fmt(ev.text, s), effects: {}, mitigated, choices: availableChoices(s, ev.choices), pending: true };
  }
  const lost = applyEffects(s, effects, rng);
  const text = fmt(useMit && ev.mitigatedText ? ev.mitigatedText : ev.text, s, lost);
  s.log.push({ day: s.day, city: s.cityId, text: `${ev.title}: ${text}` });
  return { id: ev.id, title: ev.title, text, effects, mitigated: useMit, pending: false };
}
