/* The game's audio: jsfxr 8-bit effects (src/audio/sfx.ts) and a four-channel chiptune tracker (src/audio/tracker.ts).
 * No autoplay: Audio.init() must run inside a user gesture; main.ts wires that to the first pointerdown. */
import { SETTINGS_KEY } from '../core/types';
import { SfxBank, type SfxName } from './sfx';
import { Tracker, LOOPS, STINGERS, type LoopName, type Stinger } from './tracker';
export type { SfxName } from './sfx';
export type { LoopName } from './tracker';

const MASTER = 0.6, MUSIC = 0.3, SFX = 0.5;
class AudioEngine {
  ctx?: AudioContext; master?: GainNode; musicGain?: GainNode; sfxGain?: GainNode; muted = false; ready = false;
  private bank?: SfxBank; private tracker?: Tracker; private loop: LoopName = 'none'; private timer?: number; private ducked = false;
  private last: Partial<Record<SfxName, number>> = {};
  constructor() { try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); this.muted = !!s.muted; } catch { /* ignore */ } }
  /** Create or resume the context. Safe to call on every gesture. */
  init() {
    if (this.ready) { if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx!.createGain(); this.master.gain.value = this.muted ? 0 : MASTER; this.master.connect(this.ctx!.destination);
    this.musicGain = this.ctx!.createGain(); this.musicGain.gain.value = MUSIC; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx!.createGain(); this.sfxGain.gain.value = SFX; this.sfxGain.connect(this.master);
    this.bank = new SfxBank(this.ctx!); this.tracker = new Tracker(this.ctx!, this.musicGain); this.ready = true;
    this.timer = window.setInterval(() => this.tracker?.tick(), 60);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {}); });
    if (this.loop !== 'none') this.tracker.play(LOOPS[this.loop]);
  }
  setMuted(m: boolean) {
    this.muted = m; if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : MASTER, this.ctx.currentTime, 0.05);
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); s.muted = m; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  }
  toggleMuted() { this.setMuted(!this.muted); return this.muted; }
  /** Play an effect; `minGap` (ms) rate-limits the same name for sounds fired from frequent handlers. */
  playSfx(name: SfxName, minGap = 0) {
    if (!this.ready || !this.ctx || !this.bank || this.muted) return;
    const now = performance.now(); if (minGap && this.last[name] && now - this.last[name]! < minGap) return; this.last[name] = now;
    try { const s = this.ctx.createBufferSource(); s.buffer = this.bank.get(name); s.connect(this.sfxGain!); s.start(); } catch { /* a bad preset must never break the game */ }
  }
  /** Crossfade to a loop ('none' fades out). Idempotent. */
  playLoop(name: LoopName) {
    if (name === this.loop) return; this.loop = name; if (!this.ready || !this.ctx || !this.tracker) return;
    const g = this.musicGain!, t = this.ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.25);
    window.setTimeout(() => { if (!this.ctx || !this.tracker) return; if (this.loop !== name) return; this.tracker.play(name === 'none' ? null : LOOPS[name]); g.gain.setTargetAtTime(this.ducked ? MUSIC * 0.3 : MUSIC, this.ctx.currentTime, 0.5); }, 600);
  }
  stopLoop() { this.playLoop('none'); }
  /** Play a short stinger once, then return to `then`. */
  playStinger(name: Stinger, then: LoopName = 'none') {
    if (!this.ready || !this.ctx || !this.tracker) { this.loop = then; return; }
    this.loop = 'none'; const g = this.musicGain!; g.gain.cancelScheduledValues(this.ctx.currentTime); g.gain.setTargetAtTime(MUSIC, this.ctx.currentTime, 0.05);
    this.tracker.play(STINGERS[name], true, () => { this.loop = 'none'; this.playLoop(then); });
  }
  /** Lower the music while a card is open (event, dialogue). */
  duck(on: boolean) { this.ducked = on; if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(on ? MUSIC * 0.3 : MUSIC, this.ctx.currentTime, 0.2); }
}
export const Audio = new AudioEngine();
export const REGION_LOOP: Record<string, LoopName> = { northamerica: 'americas', mexico: 'mexico', southamerica: 'americas', europe: 'europe', alps: 'alps', africa: 'africa', asia: 'asia', himalaya: 'himalaya' };
