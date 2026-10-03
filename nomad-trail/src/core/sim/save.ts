import { SAVE_KEY, SETTINGS_KEY, type RunState, type Settings, type Ending } from '../types';
// Storage shim: localStorage in the browser, in-memory Map in node (tests, sim).
const mem = new Map<string, string>();
const store = {
  get(k: string): string | null { try { if (typeof localStorage !== 'undefined') return localStorage.getItem(k); } catch { /* private mode */ } return mem.get(k) ?? null; },
  set(k: string, v: string) { try { if (typeof localStorage !== 'undefined') { localStorage.setItem(k, v); return; } } catch { /* fall through */ } mem.set(k, v); },
  del(k: string) { try { if (typeof localStorage !== 'undefined') localStorage.removeItem(k); } catch { /* ignore */ } mem.delete(k); },
};
export function saveRun(state: RunState): void { store.set(SAVE_KEY, JSON.stringify(state)); }
export function loadRun(): RunState | null {
  const raw = store.get(SAVE_KEY); if (!raw) return null;
  try { const s = JSON.parse(raw) as RunState; if (s.version !== 2 || typeof s.day !== 'number' || !s.cityId || typeof s.money !== 'number') return null; /* v1 saves (two bags, no money) are discarded */ return s; } catch { return null; }
}
export function hasSave(): boolean { return loadRun() !== null; }
export function clearRun(): void { store.del(SAVE_KEY); }
const DEFAULT_SETTINGS: Settings = { muted: false, runs: 0, bestScore: 0, history: [], career: { stamps: {}, dishes: {}, badges: {} } };
export function loadSettings(): Settings {
  const raw = store.get(SETTINGS_KEY); if (!raw) return { ...DEFAULT_SETTINGS, history: [] };
  try { const p = JSON.parse(raw) as Partial<Settings>; return { ...DEFAULT_SETTINGS, ...p, career: { stamps: {}, dishes: {}, badges: {}, ...(p.career ?? {}) } }; } catch { return { ...DEFAULT_SETTINGS, history: [], career: { stamps: {}, dishes: {}, badges: {} } }; }
}
export function saveSettings(s: Settings): void { store.set(SETTINGS_KEY, JSON.stringify(s)); }
/** Fold a run's stamps into the career passport. Gold always wins over plain. */
export function recordStamps(stamps: Record<string, 'plain' | 'gold'>): Settings {
  const s = loadSettings(); const c = s.career!;
  for (const [id, kind] of Object.entries(stamps)) if (kind === 'gold' || !c.stamps[id]) c.stamps[id] = kind;
  saveSettings(s); return s;
}
/** Fold a run's badges into the career passport: once earned, always on the page. */
export function recordBadges(ids: string[]): Settings {
  const s = loadSettings(); const c = s.career!; c.badges ??= {};
  for (const id of ids) if (!id.startsWith('gold_')) c.badges[id] = true;   /* gold city stamps already show as stamps */
  saveSettings(s); return s;
}
/** Remember the best score for a dish the player has cooked. */
export function recordDish(dishId: string, score: number): Settings {
  const s = loadSettings(); const c = s.career!;
  c.dishes[dishId] = Math.max(c.dishes[dishId] ?? 0, Math.round(score)); saveSettings(s); return s;
}
export function recordRun(ending: Ending, day: number): Settings {
  const s = loadSettings(); s.runs += 1; s.bestScore = Math.max(s.bestScore, ending.score);
  s.history.unshift({ ending: ending.kind, day, score: ending.score }); s.history = s.history.slice(0, 20); saveSettings(s); return s;
}
export const _resetMemoryStore = () => mem.clear();
