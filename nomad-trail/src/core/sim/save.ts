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
  try { const s = JSON.parse(raw) as RunState; if (s.version !== 1 || typeof s.day !== 'number' || !s.cityId) return null; return s; } catch { return null; }
}
export function hasSave(): boolean { return loadRun() !== null; }
export function clearRun(): void { store.del(SAVE_KEY); }
const DEFAULT_SETTINGS: Settings = { muted: false, runs: 0, bestScore: 0, history: [] };
export function loadSettings(): Settings {
  const raw = store.get(SETTINGS_KEY); if (!raw) return { ...DEFAULT_SETTINGS, history: [] };
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }; } catch { return { ...DEFAULT_SETTINGS, history: [] }; }
}
export function saveSettings(s: Settings): void { store.set(SETTINGS_KEY, JSON.stringify(s)); }
export function recordRun(ending: Ending, day: number): Settings {
  const s = loadSettings(); s.runs += 1; s.bestScore = Math.max(s.bestScore, ending.score);
  s.history.unshift({ ending: ending.kind, day, score: ending.score }); s.history = s.history.slice(0, 20); saveSettings(s); return s;
}
export const _resetMemoryStore = () => mem.clear();
