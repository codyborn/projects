/* Standalone player for the review hub's Sound Lab (built by tools/vite.soundlab.ts into trail/review/soundlab.js).
 * Exposes window.__soundlab: the catalog of candidates per slot and a tiny player that shares the game's audio code. */
import { SFX_CANDIDATES, renderDef, trimmedSamples, SFX_TRIM, bandOf, type SfxName } from '../src/audio/sfx';
import { MUSIC_CANDIDATES, MUSIC_SLOTS, Tracker, musicById, trackerLevel, MUSIC_REFERENCE_DB, type MusicSlot } from '../src/audio/tracker';
import { AMBIENCE } from '../src/audio/synth';
import selection from '../src/audio/selection.json';

const SFX_WHERE: Record<SfxName, string> = {
  tap: 'every button', blip: 'small hits in timing games', confirm: 'READY, GO, route pick', back: 'BACK on a card', cancel: 'refused action, wrong answer, miss', page: 'event card opens, passport page', coin: 'coin, lionfish speared, coffee crossing',
  cash: 'casino win', stamp: 'passport stamp on arrival', jump: 'platformer jump', land: 'drone touchdown', hurt: 'a hit costs a heart', stomp: 'stomping a bug', splash: 'water', spear: 'scuba shot', deflect: 'shield / spines deflect',
  whoosh: 'gust, laundry fling, drop-through, fall', chop: 'cooking chop / slice', sizzle: 'grill step', pour: 'pour step', knead: 'knead / roll', shutter: 'drone photo ring', bomb: 'battery bomb', ring: 'ring passed', heart: '+1 life pickup', powerup: 'double shot / shield / walkway',
  wheel: 'roulette tick', reel: 'slot reel stop', jackpot: 'big casino win', step: 'gate dash footsteps', crash: 'drone crash', shatter: 'fragile piece breaks', zipper: 'Pack-Tris zipper', flag: 'flag planted', perfect: 'PERFECT result', win: 'NICE result, course clear', fail: 'FAILED result',
  lose: 'top-out, run lost', chime: 'coffee morning', plane: 'flight departs', train: 'train departs', boarding: 'gate dash start', whistle: 'wind telegraph (Pinnacle)', tick: 'clock / metronome', pop: 'pack tile removed, blast', grind: 'coffee grinder', lock: 'pack tile placed, piece locks', line: 'line clear', thunk: 'clean wood split', crack: 'glancing chop',
};
const MUSIC_WHERE: Record<MusicSlot, string> = {
  outdoor: 'open-air workouts: climbing, ferrata, hikes, the Pinnacle', indoor: 'hotel-room workouts, bands, yoga', water: 'Scuba and Kiteboarding', drone: 'drone flights', cooking: 'the cooking game', coffee: 'the coffee morning scene', credits: 'the credits roll', tetris: 'Pack-Tris',
  title: 'title screen, credits roll', americas: 'North + South American cities', mexico: 'Mexico, Roatán', europe: 'European cities', alps: 'Innsbruck, Hallstatt, Munich', africa: 'Casablanca, Dakhla', asia: 'Tokyo, Seoul, Bangkok, Hong Kong', himalaya: 'Kathmandu, Minakami',
  travel: 'the travel transition', action: 'indoor mini-games (cooking, laundry, puzzles, console, casino, drone, scuba)', outdoor: 'open-air workouts: climbing, ferrata, hikes, the Pinnacle, kite', winSting: 'run won (End screen)', loseSting: 'run lost (End screen)',
};

class Lab {
  ctx?: AudioContext; master?: GainNode; bank = new Map<string, AudioBuffer>(); tracker?: Tracker; src?: AudioBufferSourceNode; files = new Map<string, Promise<AudioBuffer>>(); timer?: number; volume = 0.6; playing: string | null = null;
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; this.ctx = new AC(); this.master = this.ctx!.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx!.destination);
    this.tracker = new Tracker(this.ctx!, this.master); this.timer = window.setInterval(() => this.tracker?.tick(), 60);
  }
  state() { return this.ctx?.state ?? 'none'; }
  setVolume(v: number) { this.volume = v; if (this.master) this.master.gain.value = v; }
  stop() { this.tracker?.play(null); try { this.src?.stop(); } catch { /* ok */ } this.src = undefined; try { this.amb?.stop(); } catch { /* ok */ } this.amb = undefined; this.playing = null; }
  playSfx(id: string) {
    this.init(); const slot = id.split('.')[0] as SfxName; const c = SFX_CANDIDATES[slot]?.find(x => x.id === id); if (!c || !this.ctx) return false;
    if (c.file) { this.file(c.file).then(buf => { const g = this.ctx!.createGain(); g.gain.value = c.gain ?? 1; g.connect(this.master!); const s = this.ctx!.createBufferSource(); s.buffer = buf; s.connect(g); s.start(); }).catch(() => {}); return true; }
    let b = this.bank.get(id); if (!b) { const r = renderDef(c.def); b = this.ctx.createBuffer(1, r.samples.length, r.sampleRate); b.getChannelData(0).set(r.samples); this.bank.set(id, b); }
    const s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.master!); s.start(); return true;
  }
  amb?: AudioBufferSourceNode;
  async playAmbience(on: boolean) {
    this.init(); try { this.amb?.stop(); } catch { /* ok */ } this.amb = undefined; if (!on || !this.ctx) return true;
    const buf = await this.file(AMBIENCE.wind.file); const g = this.ctx.createGain(); g.gain.value = 0.25; g.connect(this.master!);
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(g); s.start(); this.amb = s; return true;
  }
  private file(f: string) { let p = this.files.get(f); if (!p) { p = fetch('/trail/' + f).then(r => r.arrayBuffer()).then(b => this.ctx!.decodeAudioData(b)); this.files.set(f, p); } return p; }
  async playMusic(id: string) {
    this.init(); this.stop(); const c = musicById(id); if (!c || !this.ctx) return false; this.playing = id;
    if (c.kind === 'tracker') { this.tracker!.play(c.loop, id.endsWith('Sting.tracker.calm') || id.endsWith('Sting.tracker.melodic'), () => { if (this.playing === id) this.playing = null; }, c.gain ?? 1); return true; }
    const buf = await this.file(c.file); if (this.playing !== id) return true;
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = !id.includes('Sting'); s.connect(this.master!); s.onended = () => { if (this.src === s) { this.src = undefined; this.playing = null; } }; s.start(); this.src = s; return true;
  }
}
/** Gated RMS in dBFS, the same measure tools/measure_sfx.ts uses, so the lab agrees with the build-time numbers. */
function rmsDb(s: Float32Array): number {
  let peak = 0; for (let i = 0; i < s.length; i++) peak = Math.max(peak, Math.abs(s[i]));
  const gate = Math.max(peak * 0.02, 1e-4); let sum = 0, n = 0;
  for (let i = 0; i < s.length; i++) if (Math.abs(s[i]) >= gate) { sum += s[i] * s[i]; n++; }
  return 20 * Math.log10((n ? Math.sqrt(sum / n) : 0) || 1e-9);
}
/** Averaged, because jsfxr re-randomises noise on every render. */
function sfxLevel(id: string, passes = 5): number {
  let acc = 0; for (let i = 0; i < passes; i++) acc += Math.pow(10, rmsDb(trimmedSamples(id).samples) / 20);
  return 20 * Math.log10(acc / passes || 1e-9);
}
const lab = new Lab();
(window as any).__soundlab = {
  catalog: {
    sfx: (Object.keys(SFX_CANDIDATES) as SfxName[]).map(slot => ({ slot, where: SFX_WHERE[slot], band: bandOf(slot), trim: SFX_TRIM[slot], candidates: SFX_CANDIDATES[slot].map(c => ({ id: c.id, label: c.label, level: c.file ? `file x${c.gain ?? 1}` : `${sfxLevel(c.id).toFixed(1)} dBFS` })) })),
    music: MUSIC_SLOTS.map(slot => ({ slot, where: MUSIC_WHERE[slot], candidates: MUSIC_CANDIDATES[slot].map(c => ({ id: c.id, label: c.label, kind: c.kind, level: c.kind === 'file' ? `${c.lufs?.toFixed(1) ?? '?'} LUFS` : `${trackerLevel(c.id)?.toFixed(1) ?? '?'} dBFS bus`, ...(c.kind === 'file' ? { url: c.url, bytes: c.bytes, licence: c.licence } : {}) })) })),
  },
  defaults: selection, musicReference: MUSIC_REFERENCE_DB,
  playAmbience: (on: boolean) => lab.playAmbience(on), ambience: { id: 'ambience.wind', label: AMBIENCE.wind.label, where: 'a quiet bed under the Pinnacle and the water games', url: AMBIENCE.wind.url, licence: AMBIENCE.wind.licence },
  playSfx: (id: string) => lab.playSfx(id), playMusic: (id: string) => lab.playMusic(id), stop: () => lab.stop(), setVolume: (v: number) => lab.setVolume(v), state: () => lab.state(), playing: () => lab.playing,
};
