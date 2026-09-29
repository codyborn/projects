/* The game's audio: jsfxr 8-bit effects (sfx.ts) and a four-channel chiptune tracker or a public-domain track (tracker.ts,
 * public/audio). Which candidate plays for each slot comes from selection.json (the Sound Lab on the review hub exports it).
 * No autoplay: Audio.init() must run inside a user gesture; main.ts wires that to the first pointerdown. */
import { SETTINGS_KEY } from '../core/types';
import { SfxBank, type SfxName } from './sfx';
import { Tracker, musicById, type LoopName, type Stinger, type MusicCandidate } from './tracker';
import selectionJson from './selection.json';
export type { SfxName } from './sfx';
export type { LoopName } from './tracker';

export interface Selection { sfx: Record<string, string>; music: Record<string, string>; gain: { sfx: number; music: number } }
export const SELECTION = selectionJson as Selection;
const MASTER = 0.6;
const BASE_URL: string = (import.meta as any).env?.BASE_URL ?? '/';

/** Plays a decoded file through the music gain, looping or once; fades like the tracker loops. */
class FilePlayer {
  private src?: AudioBufferSourceNode; private cache = new Map<string, Promise<AudioBuffer>>(); private token = 0;
  constructor(private ctx: AudioContext, private out: AudioNode) {}
  private load(file: string) {
    let p = this.cache.get(file);
    if (!p) { p = fetch(BASE_URL + file).then(r => r.arrayBuffer()).then(b => this.ctx.decodeAudioData(b)); this.cache.set(file, p); }
    return p;
  }
  async play(file: string, loop: boolean, onEnd?: () => void) {
    const tok = ++this.token; this.stop();
    try { const buf = await this.load(file); if (tok !== this.token) return; const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = loop; s.connect(this.out); s.onended = () => { if (this.src === s) this.src = undefined; if (!loop) onEnd?.(); }; s.start(); this.src = s; }
    catch { onEnd?.(); }
  }
  stop() { this.token++; try { this.src?.stop(); } catch { /* already stopped */ } this.src = undefined; }
  get playing() { return !!this.src; }
}

class AudioEngine {
  ctx?: AudioContext; master?: GainNode; musicGain?: GainNode; sfxGain?: GainNode; muted = false; ready = false;
  private bank?: SfxBank; private tracker?: Tracker; private files?: FilePlayer; private loop: LoopName = 'none'; private timer?: number; private ducked = false;
  private last: Partial<Record<string, number>> = {}; selection: Selection = SELECTION;
  constructor() { try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); this.muted = !!s.muted; } catch { /* ignore */ } }
  get musicLevel() { return this.selection.gain?.music ?? 0.18; }
  get sfxLevel() { return this.selection.gain?.sfx ?? 0.35; }
  /** Create or resume the context. Safe to call on every gesture. */
  init() {
    if (this.ready) { if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx!.createGain(); this.master.gain.value = this.muted ? 0 : MASTER; this.master.connect(this.ctx!.destination);
    this.musicGain = this.ctx!.createGain(); this.musicGain.gain.value = this.musicLevel; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx!.createGain(); this.sfxGain.gain.value = this.sfxLevel; this.sfxGain.connect(this.master);
    this.bank = new SfxBank(this.ctx!); this.tracker = new Tracker(this.ctx!, this.musicGain); this.files = new FilePlayer(this.ctx!, this.musicGain); this.ready = true;
    this.timer = window.setInterval(() => this.tracker?.tick(), 60);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {}); });
    if (this.loop !== 'none') this.startCandidate(this.candidateFor(this.loop));
  }
  setMuted(m: boolean) {
    this.muted = m; if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : MASTER, this.ctx.currentTime, 0.05);
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); s.muted = m; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }
  toggleMuted() { this.setMuted(!this.muted); return this.muted; }
  /** Play an effect by slot; `minGap` (ms) rate-limits the same slot for sounds fired from frequent handlers. */
  playSfx(name: SfxName, minGap = 0) {
    if (!this.ready || !this.ctx || !this.bank || this.muted) return;
    const now = performance.now(); if (minGap && this.last[name] && now - this.last[name]! < minGap) return; this.last[name] = now;
    try { const s = this.ctx.createBufferSource(); s.buffer = this.bank.get(this.selection.sfx[name] ?? `${name}.current`); s.connect(this.sfxGain!); s.start(); } catch { /* a bad preset must never break the game */ }
  }
  private candidateFor(slot: string): MusicCandidate | undefined { return musicById(this.selection.music[slot] ?? `${slot}.tracker.calm`); }
  private startCandidate(c: MusicCandidate | undefined, once = false, onEnd?: () => void) {
    if (!this.tracker || !this.files) return;
    this.tracker.play(null); this.files.stop();
    if (!c) { onEnd?.(); return; }
    if (c.kind === 'tracker') this.tracker.play(c.loop, once, onEnd); else this.files.play(c.file, !once, onEnd);
  }
  /** Crossfade to a loop ('none' fades out). Idempotent. */
  playLoop(name: LoopName) {
    if (name === this.loop) return; this.loop = name; if (!this.ready || !this.ctx) return;
    const g = this.musicGain!, t = this.ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.25);
    window.setTimeout(() => { if (!this.ctx || this.loop !== name) return; this.startCandidate(name === 'none' ? undefined : this.candidateFor(name)); g.gain.setTargetAtTime(this.ducked ? this.musicLevel * 0.3 : this.musicLevel, this.ctx.currentTime, 0.5); }, 600);
  }
  stopLoop() { this.playLoop('none'); }
  /** Play a short stinger once, then return to `then`. */
  playStinger(name: Stinger, then: LoopName = 'none') {
    if (!this.ready || !this.ctx) { this.loop = then; return; }
    this.loop = 'none'; const g = this.musicGain!; g.gain.cancelScheduledValues(this.ctx.currentTime); g.gain.setTargetAtTime(this.musicLevel, this.ctx.currentTime, 0.05);
    this.startCandidate(this.candidateFor(name), true, () => { this.loop = 'none'; this.playLoop(then); });
  }
  /** Lower the music while a card is open (event, dialogue). */
  duck(on: boolean) { this.ducked = on; if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(on ? this.musicLevel * 0.3 : this.musicLevel, this.ctx.currentTime, 0.2); }
}
export const Audio = new AudioEngine();
export const REGION_LOOP: Record<string, LoopName> = { northamerica: 'americas', mexico: 'mexico', southamerica: 'americas', europe: 'europe', alps: 'alps', africa: 'africa', asia: 'asia', himalaya: 'himalaya' };
