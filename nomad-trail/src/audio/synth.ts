/* The game's audio: jsfxr 8-bit effects (sfx.ts) and a four-channel chiptune tracker or a public-domain track (tracker.ts,
 * public/audio). Which candidate plays for each slot comes from selection.json (the Sound Lab on the review hub exports it).
 * No autoplay: Audio.init() must run inside a user gesture; main.ts wires that to the first pointerdown. */
import { SETTINGS_KEY } from '../core/types';
import { SfxBank, sfxCandidateById, type SfxName } from './sfx';
import { Tracker, musicById, type LoopName, type Stinger, type MusicCandidate } from './tracker';
import selectionJson from './selection.json';

/** Looping ambience beds, played under the music at a low level. */
export type AmbienceName = 'wind' | 'none';
export const AMBIENCE: Record<'wind', { file: string; gain: number; label: string; title: string; author: string; url: string; licence: string }> = {
  wind: { file: 'audio/wind-loop.mp3', gain: 1, label: 'wind bed · InspectorJ', title: 'Wind Loop', author: 'AntumDeluge (from InspectorJ)', url: 'https://opengameart.org/content/wind-loop', licence: 'CC-BY 3.0' },
};
export type { SfxName } from './sfx';
export type { LoopName } from './tracker';

export interface Selection { sfx: Record<string, string>; music: Record<string, string>; gain: { sfx: number; music: number } }
export const SELECTION = selectionJson as Selection;
const MASTER = 0.6;
const BASE_URL: string = (import.meta as any).env?.BASE_URL ?? '/';

/** Plays a decoded file through the music gain, looping or once; fades like the tracker loops. */
/** Encoded bytes for every audio file, shared by all players. ~350 KB a track, so prefetching the whole
 *  soundtrack costs a few MB; decoded PCM is ~8 MB a minute, so that stays on demand and bounded. */
const BYTES = new Map<string, Promise<ArrayBuffer>>();
export function prefetchAudio(file: string): Promise<ArrayBuffer> {
  let p = BYTES.get(file);
  if (!p) { p = fetch(BASE_URL + file).then(r => r.arrayBuffer()); BYTES.set(file, p.catch(() => { BYTES.delete(file); throw new Error('fetch failed'); })); }
  return p;
}
class FilePlayer {
  private src?: AudioBufferSourceNode; private cache = new Map<string, Promise<AudioBuffer>>(); private order: string[] = []; private token = 0;
  constructor(private ctx: AudioContext, private out: AudioNode) {}
  private load(file: string) {
    let p = this.cache.get(file);
    if (!p) {
      p = prefetchAudio(file).then(b => this.ctx.decodeAudioData(b.slice(0)));   /* slice: decodeAudioData detaches the buffer */
      this.cache.set(file, p); this.order.push(file);
      while (this.order.length > 3) { const drop = this.order.shift()!; if (drop !== file) this.cache.delete(drop); }   /* decoded PCM is heavy; keep the last few */
    }
    return p;
  }
  async play(file: string, loop: boolean, onEnd?: () => void) {
    this.stop(); const tok = ++this.token;   /* stop() bumps the token too, so claim ours after it or the guard below always fires */
    try { const buf = await this.load(file); if (tok !== this.token) return; const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = loop; s.connect(this.out); s.onended = () => { if (this.src === s) this.src = undefined; if (!loop) onEnd?.(); }; s.start(); this.src = s; }
    catch { onEnd?.(); }
  }
  stop() { this.token++; try { this.src?.stop(); } catch { /* already stopped */ } this.src = undefined; }
  get playing() { return !!this.src; }
}

class AudioEngine {
  ctx?: AudioContext; master?: GainNode; musicGain?: GainNode; sfxGain?: GainNode; muted = false; ready = false;
  /** true once a gesture has created the context (the browser's autoplay gate is passed) */
  get unlocked() { return this.ready; }
  /** performance.now() of the unlocking gesture, so UI can tell 'this tap unlocked audio' from 'this tap means mute' */
  unlockedAt = 0;
  /** true when sound can actually be heard right now */
  get live() { return this.ready && this.ctx?.state !== 'suspended' && !this.muted; }
  private bank?: SfxBank; private tracker?: Tracker; private files?: FilePlayer; private loop: LoopName = 'none'; private timer?: number; private ducked = false;
  private ambGain?: GainNode; private ambPlayer?: FilePlayer; private amb: AmbienceName = 'none'; private clips = new Map<string, Promise<AudioBuffer>>();
  private last: Partial<Record<string, number>> = {}; selection: Selection = SELECTION;
  constructor() { try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); this.muted = !!s.muted; } catch { /* ignore */ } }
  get musicLevel() { return this.selection.gain?.music ?? 0.18; }
  get sfxLevel() { return this.selection.gain?.sfx ?? 0.35; }
  /** Create or resume the context. Safe to call on every gesture. */
  init() {
    if (this.ready) { if (this.ctx?.state === 'suspended') this.ctx.resume().then(() => { if (this.loop !== 'none') this.startCandidate(this.candidateFor(this.loop)); }).catch(() => {}); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx!.createGain(); this.master.gain.value = this.muted ? 0 : MASTER; this.master.connect(this.ctx!.destination);
    this.musicGain = this.ctx!.createGain(); this.musicGain.gain.value = this.musicLevel; this.musicGain.connect(this.master);
    this.sfxGain = this.ctx!.createGain(); this.sfxGain.gain.value = this.sfxLevel; this.sfxGain.connect(this.master);
    this.bank = new SfxBank(this.ctx!); this.tracker = new Tracker(this.ctx!, this.musicGain); this.files = new FilePlayer(this.ctx!, this.musicGain);
    this.ambGain = this.ctx!.createGain(); this.ambGain.gain.value = 0; this.ambGain.connect(this.master); this.ambPlayer = new FilePlayer(this.ctx!, this.ambGain); this.ready = true; this.unlockedAt = performance.now();
    for (const id of Object.values(this.selection.sfx)) { const c = sfxCandidateById(id); if (c?.file) void this.clip(c.file); }   /* a recorded effect must be ready before its first play */
    this.timer = window.setInterval(() => this.tracker?.tick(), 60);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {}); });
    if (this.loop !== 'none') this.startCandidate(this.candidateFor(this.loop));
    if (this.amb !== 'none') this.playAmbience(this.amb, true);
    this.warm();
  }
  /** Pull the rest of the soundtrack down in the background so a scene change never waits on the network.
   *  One at a time, current loop last (it is already loading), and skipped on a metered or slow connection. */
  private warmed = false;
  warm() {
    if (this.warmed) return; this.warmed = true;
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /^(slow-)?2g$/.test(conn?.effectiveType ?? '')) return;
    const files: string[] = [];
    const cur = this.candidateFor(this.loop); const curFile = cur?.kind === 'file' ? cur.file : undefined;
    for (const id of Object.values(this.selection.music)) { const c = musicById(id); if (c?.kind === 'file' && c.file !== curFile) files.push(c.file); }
    for (const id of Object.values(this.selection.sfx)) { const c = sfxCandidateById(id); if (c?.file) files.push(c.file); }
    let i = 0;
    const next = () => { const f = files[i++]; if (!f) return; prefetchAudio(f).catch(() => {}).then(() => window.setTimeout(next, 150)); };
    window.setTimeout(next, 800);   /* let the first track and the scene settle first */
  }
  /** Fetch + decode a clip once (recorded effects, ambience beds). */
  private clip(file: string) {
    let p = this.clips.get(file);
    if (!p) { p = fetch(BASE_URL + file).then(r => r.arrayBuffer()).then(b => this.ctx!.decodeAudioData(b)); this.clips.set(file, p); }
    return p;
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
    const id = this.selection.sfx[name] ?? `${name}.current`; const cand = sfxCandidateById(id);
    try {
      if (cand?.file) { const g = this.ctx.createGain(); g.gain.value = cand.gain ?? 1; g.connect(this.sfxGain!); this.clip(cand.file).then(buf => { const src = this.ctx!.createBufferSource(); src.buffer = buf; src.connect(g); src.start(); }).catch(() => {}); return; }
      const s = this.ctx.createBufferSource(); s.buffer = this.bank.get(id); s.connect(this.sfxGain!); s.start();
    } catch { /* a bad preset must never break the game */ }
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
    window.setTimeout(() => { if (!this.ctx || this.loop !== name) return; this.startCandidate(name === 'none' ? undefined : this.candidateFor(name)); g.gain.setTargetAtTime(this.ducked ? this.musicLevel * 0.3 : this.musicLevel, this.ctx.currentTime, 0.5); if (this.amb !== 'none' && this.ambGain) this.ambGain.gain.setTargetAtTime(this.ambLevel, this.ctx.currentTime, 0.5); }, 600);
  }
  stopLoop() { this.playLoop('none'); }
  /** Play a short stinger once, then return to `then`. */
  playStinger(name: Stinger, then: LoopName = 'none') {
    if (!this.ready || !this.ctx) { this.loop = then; return; }
    this.loop = 'none'; const g = this.musicGain!; g.gain.cancelScheduledValues(this.ctx.currentTime); g.gain.setTargetAtTime(this.musicLevel, this.ctx.currentTime, 0.05);
    this.startCandidate(this.candidateFor(name), true, () => { this.loop = 'none'; this.playLoop(then); });
  }
  /** A quiet looping bed under some games (wind on the ridge and over the water). 'none' fades it out. */
  playAmbience(name: AmbienceName, force = false) {
    if (name === this.amb && !force) return; this.amb = name;
    if (!this.ready || !this.ctx || !this.ambPlayer || !this.ambGain) return;
    if (name === 'none') { this.ambGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3); window.setTimeout(() => { if (this.amb === 'none') this.ambPlayer?.stop(); }, 700); return; }
    this.ambPlayer.play(AMBIENCE[name].file, true); this.ambGain.gain.setTargetAtTime(this.ambLevel, this.ctx.currentTime, 0.4);
  }
  /** Quieter while music is playing so the bed never competes with it. */
  private get ambLevel() { return (this.loop === 'none' ? 0.25 : 0.12) * (AMBIENCE[this.amb === 'none' ? 'wind' : this.amb]?.gain ?? 1); }
  /** Lower the music while a card is open (event, dialogue). */
  duck(on: boolean) { this.ducked = on; if (this.musicGain && this.ctx) this.musicGain.gain.setTargetAtTime(on ? this.musicLevel * 0.3 : this.musicLevel, this.ctx.currentTime, 0.2); }
}
/** Shown on the credits roll. CC-BY works must be credited where they are used; the rest are here because the authors earned it. */
export const AUDIO_CREDITS: string[] = [
  'Jet takeoff by dklon · CC-BY 3.0',
  'Wind loop by AntumDeluge / InspectorJ · CC-BY 3.0',
  'Chiptune music by DJARTMUSIC, moodmode, Monume, NiKneT_Art (Pixabay)',
  'and Wolfgang_, Spring Spring, RandomMind, Fupi, Zane Little Music,',
  'Centurion_of_war, TAD, Locomule, pmiller, Jonathan So, iamoneabe,',
  'megupets, bertsz, congusbongus, SubspaceAudio (OpenGameArt, CC0)',
  'Sound effects generated with jsfxr · public domain',
  'Korobeiniki arranged for this game · melody public domain',
];
export const Audio = new AudioEngine();
export const REGION_LOOP: Record<string, LoopName> = { northamerica: 'americas', mexico: 'mexico', southamerica: 'americas', europe: 'europe', alps: 'alps', africa: 'africa', asia: 'asia', himalaya: 'himalaya' };
