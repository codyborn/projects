// STUB — the SIM agent replaces this file.
import { SAVE_KEY, SETTINGS_KEY, type RunState, type Settings } from '../types';
export function saveRun(state: RunState) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {} }
export function loadRun(): RunState | undefined { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : undefined; } catch { return undefined; } }
export function clearRun() { try { localStorage.removeItem(SAVE_KEY); } catch {} }
export function loadSettings(): Settings { try { const s = localStorage.getItem(SETTINGS_KEY); if (s) return JSON.parse(s); } catch {} return { muted: false, runs: 0, bestScore: 0, history: [] }; }
export function saveSettings(s: Settings) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {} }
