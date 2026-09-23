// WebAudio chiptune: SFX + region loops. No autoplay: call Audio.init() from a pointer handler.
import { SETTINGS_KEY } from '../core/types';
export type SfxName = 'blip' | 'confirm' | 'back' | 'stamp' | 'pop' | 'coin' | 'hurt' | 'jump' | 'whoosh' | 'chop' | 'sizzle' | 'plane' | 'chime' | 'pour' | 'grind' | 'win' | 'lose';
export type LoopName = 'alps' | 'asia' | 'mexico' | 'europe' | 'africa' | 'americas' | 'himalaya' | 'night' | 'title' | 'none';
type Note = number | null;
const SCALES: Record<Exclude<LoopName, 'none'>, { root: number; scale: number[]; bpm: number; wave: OscillatorType; bass: OscillatorType; pattern: number[]; bassPat: number[] }> = {
  alps: { root: 62, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 96, wave: 'square', bass: 'triangle', pattern: [0, 2, 4, 2, 5, 4, 2, 0, 4, 2, 0, -1, 2, 4, 7, 4], bassPat: [0, 0, 4, 4, 5, 5, 4, 4] },
  asia: { root: 64, scale: [0, 2, 4, 7, 9], bpm: 88, wave: 'triangle', bass: 'sine', pattern: [0, 1, 2, 4, 3, 2, 1, -1, 4, 3, 2, 1, 0, -1, 2, 4], bassPat: [0, 0, 2, 2, 3, 3, 2, 2] },
  mexico: { root: 60, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 120, wave: 'square', bass: 'square', pattern: [0, 4, 2, 4, 0, 4, 2, 4, 5, 7, 5, 4, 2, 4, 0, -1], bassPat: [0, 4, 0, 4, 3, 5, 3, 5] },
  europe: { root: 60, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 100, wave: 'triangle', bass: 'triangle', pattern: [0, 2, 3, 5, 3, 2, 0, -1, 3, 5, 6, 5, 3, 2, 0, -1], bassPat: [0, 0, 3, 3, 4, 4, 3, 3] },
  africa: { root: 57, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 108, wave: 'sawtooth', bass: 'triangle', pattern: [0, 0, 3, 5, 4, 3, 0, -1, 2, 3, 5, 3, 2, 0, -1, -1], bassPat: [0, 0, 0, 3, 4, 4, 4, 3] },
  americas: { root: 60, scale: [0, 2, 4, 7, 9], bpm: 104, wave: 'square', bass: 'triangle', pattern: [0, 2, 4, 3, 2, 0, 3, 4, 2, 3, 4, 2, 0, -1, 3, 2], bassPat: [0, 0, 3, 3, 4, 4, 3, 3] },
  himalaya: { root: 55, scale: [0, 3, 5, 7, 10], bpm: 72, wave: 'triangle', bass: 'sine', pattern: [0, -1, 2, -1, 3, 2, -1, 0, 4, -1, 3, -1, 2, -1, 0, -1], bassPat: [0, 0, 0, 0, 2, 2, 2, 2] },
  night: { root: 57, scale: [0, 3, 5, 7, 10], bpm: 76, wave: 'sine', bass: 'sine', pattern: [0, -1, 2, -1, 3, -1, 2, -1, 4, -1, 3, -1, 2, -1, -1, -1], bassPat: [0, 0, 0, 0, 3, 3, 3, 3] },
  title: { root: 62, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 112, wave: 'square', bass: 'triangle', pattern: [0, 4, 7, 4, 5, 7, 9, 7, 4, 2, 4, 5, 4, 2, 0, -1], bassPat: [0, 0, 4, 4, 3, 3, 4, 4] },
};
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
class AudioEngine {
  ctx?: AudioContext; master?: GainNode; musicGain?: GainNode; sfxGain?: GainNode; muted = false; ready = false;
  private loop: LoopName = 'none'; private timer?: number; private step = 0; private nextTime = 0;
  constructor() { try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); this.muted = !!s.muted; } catch { /* ignore */ } }
  init() {
    if (this.ready) { if (this.ctx?.state === 'suspended') this.ctx.resume(); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx!.createGain(); this.master.gain.value = this.muted ? 0 : 0.6; this.master.connect(this.ctx!.destination);
    this.musicGain = this.ctx!.createGain(); this.musicGain.gain.value = 0.35; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx!.createGain(); this.sfxGain.gain.value = 0.8; this.sfxGain.connect(this.master); this.ready = true;
    if (this.loop !== 'none') this.startScheduler();
  }
  setMuted(m: boolean) { this.muted = m; if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.6, this.ctx.currentTime, 0.05);
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); s.muted = m; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ } }
  toggleMuted() { this.setMuted(!this.muted); return this.muted; }
  private tone(freq: number, dur: number, type: OscillatorType, vol = 0.3, dest?: AudioNode, when = 0, slide?: number) {
    if (!this.ctx) return; const t0 = this.ctx.currentTime + when; const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t0 + dur); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || this.sfxGain!); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  private noise(dur: number, vol = 0.2, when = 0, hp = 1000) {
    if (!this.ctx) return; const t0 = this.ctx.currentTime + when; const n = Math.floor(this.ctx.sampleRate * dur); const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ctx.createBufferSource(); s.buffer = buf; const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = this.ctx.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(this.sfxGain!); s.start(t0);
  }
  playSfx(name: SfxName) {
    if (!this.ready) return;
    switch (name) {
      case 'blip': this.tone(880, 0.06, 'square', 0.15); break;
      case 'confirm': this.tone(660, 0.08, 'square', 0.2); this.tone(990, 0.12, 'square', 0.2, undefined, 0.08); break;
      case 'back': this.tone(440, 0.08, 'square', 0.15); this.tone(330, 0.1, 'square', 0.15, undefined, 0.07); break;
      case 'stamp': this.noise(0.08, 0.5, 0, 200); this.tone(120, 0.15, 'triangle', 0.5, undefined, 0, 60); break;
      case 'pop': this.noise(0.25, 0.7, 0, 400); this.tone(200, 0.3, 'sawtooth', 0.4, undefined, 0, 40); break;
      case 'coin': this.tone(1320, 0.06, 'square', 0.2); this.tone(1760, 0.14, 'square', 0.2, undefined, 0.06); break;
      case 'hurt': this.tone(300, 0.2, 'sawtooth', 0.3, undefined, 0, 90); this.noise(0.12, 0.3); break;
      case 'jump': this.tone(300, 0.14, 'square', 0.2, undefined, 0, 700); break;
      case 'whoosh': this.noise(0.4, 0.35, 0, 600); break;
      case 'chop': this.noise(0.05, 0.6, 0, 1500); this.tone(180, 0.06, 'triangle', 0.4, undefined, 0, 80); break;
      case 'sizzle': this.noise(0.6, 0.25, 0, 3000); break;
      case 'plane': this.tone(90, 1.6, 'sawtooth', 0.15, undefined, 0, 140); this.noise(1.6, 0.12, 0, 300); break;
      case 'chime': [0, 4, 7, 12].forEach((s, i) => this.tone(midi(76 + s), 0.5, 'sine', 0.18, undefined, i * 0.12)); break;
      case 'pour': this.noise(1.2, 0.18, 0, 2500); break;
      case 'grind': for (let i = 0; i < 8; i++) this.noise(0.08, 0.25, i * 0.1, 800); break;
      case 'win': [0, 4, 7, 12, 16, 19].forEach((s, i) => this.tone(midi(72 + s), 0.35, 'square', 0.2, undefined, i * 0.1)); break;
      case 'lose': [12, 7, 4, 0].forEach((s, i) => this.tone(midi(60 + s), 0.5, 'triangle', 0.25, undefined, i * 0.25)); break;
    }
  }
  playLoop(name: LoopName) {
    if (name === this.loop) return; const prev = this.loop; this.loop = name;
    if (!this.ready) return;
    if (this.musicGain && this.ctx) { this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime); this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); }
    window.setTimeout(() => { this.step = 0; if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(name === 'none' ? 0 : 0.35, this.ctx.currentTime, 0.6); if (prev === 'none' || !this.timer) this.startScheduler(); }, 700);
  }
  stopLoop() { this.playLoop('none'); }
  private startScheduler() {
    if (this.timer) window.clearInterval(this.timer); if (!this.ctx) return; this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => {
      if (!this.ctx || this.loop === 'none') return; const cfg = SCALES[this.loop]; const stepDur = 60 / cfg.bpm / 2;
      while (this.nextTime < this.ctx.currentTime + 0.25) {
        const i = this.step % cfg.pattern.length, deg = cfg.pattern[i]; const when = this.nextTime - this.ctx.currentTime;
        if (deg >= 0) this.tone(midi(cfg.root + 12 + cfg.scale[deg % cfg.scale.length] + 12 * Math.floor(deg / cfg.scale.length)), stepDur * 0.9, cfg.wave, 0.12, this.musicGain, when);
        if (this.step % 2 === 0) { const bd = cfg.bassPat[(this.step / 2) % cfg.bassPat.length]; this.tone(midi(cfg.root - 12 + cfg.scale[bd % cfg.scale.length]), stepDur * 1.6, cfg.bass, 0.16, this.musicGain, when); }
        if (this.step % 4 === 2) { const t0 = this.nextTime; const n = this.ctx.createBufferSource(); const b = this.ctx.createBuffer(1, 1200, this.ctx.sampleRate); const d = b.getChannelData(0); for (let k = 0; k < 1200; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / 1200) * 0.3; n.buffer = b; const g = this.ctx.createGain(); g.gain.value = 0.12; n.connect(g); g.connect(this.musicGain!); n.start(t0); }
        this.nextTime += stepDur; this.step++;
      }
    }, 80);
  }
}
export const Audio = new AudioEngine();
export const REGION_LOOP: Record<string, LoopName> = { northamerica: 'americas', mexico: 'mexico', southamerica: 'americas', europe: 'europe', alps: 'alps', africa: 'africa', asia: 'asia', himalaya: 'himalaya' };
