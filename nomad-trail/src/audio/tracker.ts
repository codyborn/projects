/* A four-channel Game Boy style tracker on WebAudio: two pulse channels (duty 12.5 / 25 / 50 %), a triangle "wave" channel
 * and a noise channel for drums. Loops are data: strings of 16th-step tokens per channel. Scheduling runs a little ahead of the
 * clock so loops are seamless. Note tokens: "C5", "F#4", "Bb3"; "." rest; "-" hold the previous note one more step. Drum tokens:
 * "k" kick, "s" snare, "h" hat, "." rest. */
export type LoopName = 'title' | 'americas' | 'mexico' | 'europe' | 'alps' | 'africa' | 'asia' | 'himalaya' | 'travel' | 'action' | 'none';
export type Stinger = 'winSting' | 'loseSting';
export interface Loop { bpm: number; p1: string; p2: string; wave: string; drums: string; duty1?: number; duty2?: number; vol?: number; }

const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function midiOf(tok: string): number | null {
  const m = /^([A-G])([#b]?)(\d)$/.exec(tok); if (!m) return null;
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const hz = (n: number) => 440 * Math.pow(2, (n - 69) / 12);
/** Parse a channel string into per-step events: { midi, steps } at the step where a note starts. */
export function parseChannel(s: string): ({ midi: number; len: number } | null)[] {
  const toks = s.trim().split(/\s+/).filter(Boolean); const out: ({ midi: number; len: number } | null)[] = toks.map(() => null);
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]; if (t === '.' || t === '-') continue;
    const m = midiOf(t); if (m === null) continue;
    let len = 1; while (i + len < toks.length && toks[i + len] === '-') len++;
    out[i] = { midi: m, len };
  }
  return out;
}

/* ---- the loops (8 or 16 bars of 16 steps) ---- */
const rep = (s: string, n: number) => Array(n).fill(s.trim()).join(' ');
export const LOOPS: Record<Exclude<LoopName, 'none'>, Loop> = {
  /* warm and cozy: D major, gentle arpeggios, a slow walking bass */
  title: { bpm: 104, duty1: 0.25, duty2: 0.5,
    p1: rep('D5 - F#5 - A5 - F#5 - D5 - A4 - D5 - F#5 -', 2) + ' ' + rep('B4 - D5 - F#5 - D5 - B4 - G4 - B4 - D5 -', 2) + ' ' + rep('A4 - C#5 - E5 - C#5 - A4 - E4 - A4 - C#5 -', 2) + ' ' + rep('G4 - B4 - D5 - B4 - G4 - D4 - G4 - B4 -', 2),
    p2: rep('. . . . F#4 - - - . . . . A4 - - -', 2) + ' ' + rep('. . . . D4 - - - . . . . F#4 - - -', 2) + ' ' + rep('. . . . E4 - - - . . . . A4 - - -', 2) + ' ' + rep('. . . . D4 - - - . . . . G4 - - -', 2),
    wave: rep('D3 - - - - - - - A2 - - - - - - -', 2) + ' ' + rep('B2 - - - - - - - F#2 - - - - - - -', 2) + ' ' + rep('A2 - - - - - - - E2 - - - - - - -', 2) + ' ' + rep('G2 - - - - - - - D2 - - - - - - -', 2),
    drums: rep('k . h . s . h . k . h . s . h h', 8) },
  /* open roads: C pentatonic, steady kick, bright lead */
  americas: { bpm: 108, duty1: 0.5, duty2: 0.25,
    p1: rep('C5 - E5 G5 - E5 D5 - C5 - . . G4 A4 C5 -', 2) + ' ' + rep('A4 - C5 D5 - C5 A4 - G4 - . . E4 G4 A4 -', 2) + ' ' + rep('C5 - E5 G5 - E5 D5 - C5 - . . G4 A4 C5 -', 2) + ' ' + rep('D5 - C5 A4 - G4 A4 - C5 - - - . . . .', 2),
    p2: rep('E4 - - - . . . . G4 - - - . . . .', 4) + ' ' + rep('C4 - - - . . . . E4 - - - . . . .', 4),
    wave: rep('C3 - - - C3 - - - G2 - - - G2 - - -', 2) + ' ' + rep('A2 - - - A2 - - - E2 - - - E2 - - -', 2) + ' ' + rep('C3 - - - C3 - - - G2 - - - G2 - - -', 2) + ' ' + rep('F2 - - - F2 - - - G2 - - - G2 - - -', 2),
    drums: rep('k . h h s . h . k . h h s . h .', 8) },
  /* latin: quick, syncopated, A minor with a lift */
  mexico: { bpm: 126, duty1: 0.25, duty2: 0.125,
    p1: rep('A4 - C5 - E5 - - - D5 C5 - - B4 - - -', 1) + ' ' + rep('A4 - C5 - E5 - - - G5 - E5 - D5 - - -', 1) + ' ' + rep('F4 - A4 - C5 - - - B4 A4 - - G4 - - -', 1) + ' ' + rep('E4 - G#4 - B4 - - - C5 - B4 - A4 - - -', 1) + ' ' + rep('A4 - C5 - E5 - - - D5 C5 - - B4 - - -', 1) + ' ' + rep('A4 - C5 - E5 - - - G5 - E5 - D5 - - -', 1) + ' ' + rep('F4 - A4 - C5 - - - B4 A4 - - G4 - - -', 1) + ' ' + rep('E4 - - - E5 - - - . . . . A4 - - -', 1),
    p2: rep('. . A3 . . . C4 . . . E4 . . . C4 .', 8),
    wave: rep('A2 - - . . . A2 - . . E2 - . . . .', 2) + ' ' + rep('F2 - - . . . F2 - . . E2 - . . . .', 2) + ' ' + rep('A2 - - . . . A2 - . . E2 - . . . .', 2) + ' ' + rep('F2 - - . . . E2 - . . E2 - . . . .', 2),
    drums: rep('k . . k . . k . s . h . k . s h', 8) },
  /* old streets: minor, a slow arpeggio under a singing lead */
  europe: { bpm: 96, duty1: 0.5, duty2: 0.25,
    p1: rep('E5 - - - D5 - C5 - B4 - - - - - - -', 1) + ' ' + rep('C5 - - - B4 - A4 - G4 - - - - - - -', 1) + ' ' + rep('A4 - B4 - C5 - D5 - E5 - - - D5 - - -', 1) + ' ' + rep('C5 - - - B4 - - - A4 - - - - - - -', 1) + ' ' + rep('E5 - - - D5 - C5 - B4 - - - - - - -', 1) + ' ' + rep('C5 - - - B4 - A4 - G4 - - - - - - -', 1) + ' ' + rep('F4 - G4 - A4 - B4 - C5 - - - B4 - - -', 1) + ' ' + rep('A4 - - - - - - - . . . . . . . .', 1),
    p2: rep('A3 C4 E4 C4 A3 C4 E4 C4 A3 C4 E4 C4 A3 C4 E4 C4', 2) + ' ' + rep('F3 A3 C4 A3 F3 A3 C4 A3 G3 B3 D4 B3 G3 B3 D4 B3', 1) + ' ' + rep('A3 C4 E4 C4 A3 C4 E4 C4 E3 G#3 B3 G#3 E3 G#3 B3 G#3', 1) + ' ' + rep('A3 C4 E4 C4 A3 C4 E4 C4 A3 C4 E4 C4 A3 C4 E4 C4', 2) + ' ' + rep('F3 A3 C4 A3 F3 A3 C4 A3 G3 B3 D4 B3 G3 B3 D4 B3', 1) + ' ' + rep('A3 C4 E4 C4 A3 C4 E4 C4 A2 - - - - - - -', 1),
    wave: rep('A2 - - - - - - - E2 - - - - - - -', 2) + ' ' + rep('F2 - - - - - - - G2 - - - - - - -', 1) + ' ' + rep('A2 - - - - - - - E2 - - - - - - -', 1) + ' ' + rep('A2 - - - - - - - E2 - - - - - - -', 2) + ' ' + rep('F2 - - - - - - - G2 - - - - - - -', 1) + ' ' + rep('A2 - - - - - - - - - - - - - - -', 1),
    drums: rep('k . . . h . . . s . . . h . . .', 8) },
  /* alpine folk: G major oompah, a yodel-ish lead */
  alps: { bpm: 112, duty1: 0.5, duty2: 0.25,
    p1: rep('G4 - B4 - D5 - - - B4 - D5 - G5 - - -', 1) + ' ' + rep('D5 - B4 - G4 - - - A4 - B4 - C5 - - -', 1) + ' ' + rep('B4 - D5 - G5 - - - D5 - B4 - G4 - - -', 1) + ' ' + rep('A4 - C5 - E5 - D5 - C5 - B4 - A4 - - -', 1) + ' ' + rep('G4 - B4 - D5 - - - B4 - D5 - G5 - - -', 1) + ' ' + rep('D5 - B4 - G4 - - - A4 - B4 - C5 - - -', 1) + ' ' + rep('B4 - G4 - D4 - - - E4 - F#4 - G4 - - -', 1) + ' ' + rep('G4 - - - - - - - . . . . . . . .', 1),
    p2: rep('. . D4 - . . D4 - . . D4 - . . D4 -', 6) + ' ' + rep('. . C4 - . . C4 - . . D4 - . . D4 -', 2),
    wave: rep('G2 - . . G2 - . . D2 - . . D2 - . .', 6) + ' ' + rep('C2 - . . C2 - . . D2 - . . D2 - . .', 2),
    drums: rep('k . h . k . h . k . h . k . h .', 8) },
  /* desert: dorian mode, a hand-drum pattern, a long lead */
  africa: { bpm: 100, duty1: 0.25, duty2: 0.125,
    p1: rep('D5 - - - F5 - E5 - D5 - C5 - D5 - - -', 1) + ' ' + rep('A4 - - - C5 - D5 - F5 - E5 - D5 - - -', 1) + ' ' + rep('D5 - - - F5 - G5 - A5 - - - G5 - F5 -', 1) + ' ' + rep('E5 - D5 - C5 - - - D5 - - - - - - -', 1) + ' ' + rep('D5 - - - F5 - E5 - D5 - C5 - D5 - - -', 1) + ' ' + rep('A4 - - - C5 - D5 - F5 - E5 - D5 - - -', 1) + ' ' + rep('G4 - - - A4 - C5 - D5 - - - C5 - A4 -', 1) + ' ' + rep('D5 - - - - - - - . . . . . . . .', 1),
    p2: rep('D4 . . D4 . . A3 . D4 . . D4 . . C4 .', 8),
    wave: rep('D2 - - - - - - - D2 - - - C2 - - -', 4) + ' ' + rep('G2 - - - - - - - A2 - - - C2 - - -', 2) + ' ' + rep('D2 - - - - - - - D2 - - - C2 - - -', 2),
    drums: rep('k . h k . h k . s . h k . h s .', 8) },
  /* east: E pentatonic on the triangle wave, sparse, patient */
  asia: { bpm: 88, duty1: 0.125, duty2: 0.25,
    p1: rep('E5 - - - G5 - A5 - B5 - - - A5 - G5 -', 1) + ' ' + rep('E5 - - - - - - - . . . . . . . .', 1) + ' ' + rep('B4 - - - D5 - E5 - G5 - - - E5 - D5 -', 1) + ' ' + rep('B4 - - - - - - - . . . . . . . .', 1) + ' ' + rep('E5 - - - G5 - A5 - B5 - - - D6 - B5 -', 1) + ' ' + rep('A5 - - - G5 - - - E5 - - - - - - -', 1) + ' ' + rep('B4 - - - D5 - E5 - G5 - - - E5 - D5 -', 1) + ' ' + rep('E5 - - - - - - - . . . . . . . .', 1),
    p2: rep('. . . . . . . . E4 - - - . . . .', 4) + ' ' + rep('. . . . . . . . B3 - - - . . . .', 4),
    wave: rep('E2 - - - - - - - - - - - - - - -', 2) + ' ' + rep('B2 - - - - - - - - - - - - - - -', 2) + ' ' + rep('E2 - - - - - - - - - - - - - - -', 2) + ' ' + rep('A2 - - - - - - - B2 - - - - - - -', 2),
    drums: rep('k . . . . . h . . . . . s . . .', 8) },
  /* high places: a drone, a pentatonic call, slow */
  himalaya: { bpm: 72, duty1: 0.125, duty2: 0.5,
    p1: rep('G4 - - - - - - - Bb4 - - - C5 - - -', 1) + ' ' + rep('D5 - - - - - - - C5 - - - Bb4 - - -', 1) + ' ' + rep('G4 - - - - - - - - - - - - - - -', 1) + ' ' + rep('F4 - - - G4 - - - - - - - - - - -', 1) + ' ' + rep('G4 - - - - - - - Bb4 - - - C5 - - -', 1) + ' ' + rep('D5 - - - F5 - - - D5 - - - C5 - - -', 1) + ' ' + rep('Bb4 - - - - - - - G4 - - - - - - -', 1) + ' ' + rep('G4 - - - - - - - - - - - - - - -', 1),
    p2: rep('D4 - - - - - - - - - - - - - - -', 8),
    wave: rep('G2 - - - - - - - - - - - - - - -', 8),
    drums: rep('k . . . . . . . . . . . . . . .', 8) },
  /* travel: motion, a bright ostinato over a driving bass */
  travel: { bpm: 132, duty1: 0.25, duty2: 0.5,
    p1: rep('C5 G4 E5 G4 C5 G4 E5 G4 D5 G4 F5 G4 D5 G4 F5 G4', 2) + ' ' + rep('A4 E4 C5 E4 A4 E4 C5 E4 G4 D4 B4 D4 G4 D4 B4 D4', 2) + ' ' + rep('C5 G4 E5 G4 C5 G4 E5 G4 D5 G4 F5 G4 D5 G4 F5 G4', 2) + ' ' + rep('F4 C4 A4 C4 F4 C4 A4 C4 G4 D4 B4 D4 G4 D4 B4 D4', 2),
    p2: rep('. . . . . . . . E5 - - - - - - -', 2) + ' ' + rep('. . . . . . . . C5 - - - - - - -', 2) + ' ' + rep('. . . . . . . . E5 - - - - - - -', 2) + ' ' + rep('. . . . . . . . D5 - - - - - - -', 2),
    wave: rep('C2 - C2 - C2 - C2 - G2 - G2 - G2 - G2 -', 2) + ' ' + rep('A2 - A2 - A2 - A2 - G2 - G2 - G2 - G2 -', 2) + ' ' + rep('C2 - C2 - C2 - C2 - G2 - G2 - G2 - G2 -', 2) + ' ' + rep('F2 - F2 - F2 - F2 - G2 - G2 - G2 - G2 -', 2),
    drums: rep('k . h . s . h . k . h . s . h h', 8) },
  /* mini-game action: fast, minor, tense */
  action: { bpm: 150, duty1: 0.125, duty2: 0.25,
    p1: rep('E5 . E5 . G5 . E5 . D5 . E5 . B4 . . .', 2) + ' ' + rep('C5 . C5 . E5 . C5 . B4 . C5 . G4 . . .', 2) + ' ' + rep('E5 . E5 . G5 . E5 . A5 . G5 . E5 . . .', 2) + ' ' + rep('D5 . E5 . D5 . B4 . A4 . B4 . E5 . . .', 2),
    p2: rep('E4 . . E4 . . E4 . E4 . . E4 . . E4 .', 4) + ' ' + rep('C4 . . C4 . . C4 . D4 . . D4 . . B3 .', 4),
    wave: rep('E2 - E2 - E2 - E2 - E2 - E2 - D2 - D2 -', 4) + ' ' + rep('C2 - C2 - C2 - C2 - D2 - D2 - B1 - B1 -', 4),
    drums: rep('k . h . s . h . k . h . s . h .', 8) },
};
export const STINGERS: Record<Stinger, Loop> = {
  winSting: { bpm: 140, duty1: 0.25, duty2: 0.5, p1: 'C5 - E5 - G5 - C6 - - - - - - - - -', p2: 'E4 - G4 - C5 - E5 - - - - - - - - -', wave: 'C3 - - - - - - - C3 - - - - - - -', drums: 'k . . . k . . . s . . . . . . .' },
  loseSting: { bpm: 96, duty1: 0.5, duty2: 0.25, p1: 'E5 - - - Eb5 - - - D5 - - - C#5 - - -', p2: 'C4 - - - B3 - - - Bb3 - - - A3 - - -', wave: 'A2 - - - - - - - - - - - - - - -', drums: 'k . . . . . . . k . . . . . . .' },
};

/** Fourier pulse wave with a given duty for a Game Boy feel; cached per (ctx, duty). */
const pulseCache = new WeakMap<AudioContext, Map<number, PeriodicWave>>();
export function pulseWave(ctx: AudioContext, duty: number): PeriodicWave {
  let m = pulseCache.get(ctx); if (!m) { m = new Map(); pulseCache.set(ctx, m); }
  let w = m.get(duty); if (w) return w;
  const N = 32; const real = new Float32Array(N), imag = new Float32Array(N);
  for (let n = 1; n < N; n++) { real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty); imag[n] = (2 / (n * Math.PI)) * (1 - Math.cos(n * Math.PI * duty)); }
  w = ctx.createPeriodicWave(real, imag, { disableNormalization: false }); m.set(duty, w); return w;
}

/** Plays loops and stingers into a destination gain; call tick() often (a 60 ms interval is fine). */
export class Tracker {
  private loop: Loop | null = null; private parsed: { p1: ReturnType<typeof parseChannel>; p2: ReturnType<typeof parseChannel>; wave: ReturnType<typeof parseChannel>; drums: string[] } | null = null;
  private step = 0; private nextTime = 0; private once = false; private onEnd?: () => void;
  constructor(private ctx: AudioContext, private out: AudioNode) {}
  play(loop: Loop | null, once = false, onEnd?: () => void) {
    this.loop = loop; this.once = once; this.onEnd = onEnd; this.step = 0; this.nextTime = this.ctx.currentTime + 0.05;
    this.parsed = loop ? { p1: parseChannel(loop.p1), p2: parseChannel(loop.p2), wave: parseChannel(loop.wave), drums: loop.drums.trim().split(/\s+/) } : null;
  }
  get playing() { return !!this.loop; }
  tick() {
    if (!this.loop || !this.parsed) return;
    const stepDur = 60 / this.loop.bpm / 4; const len = this.parsed.p1.length;
    while (this.nextTime < this.ctx.currentTime + 0.3) {
      if (this.step >= len) { if (this.once) { const cb = this.onEnd; this.loop = null; this.parsed = null; cb?.(); return; } this.step = 0; }
      const i = this.step, t = this.nextTime, v = this.loop.vol ?? 1;
      const n1 = this.parsed.p1[i]; if (n1) this.pulse(n1.midi, t, n1.len * stepDur, this.loop.duty1 ?? 0.5, 0.11 * v);
      const n2 = this.parsed.p2[i % this.parsed.p2.length]; if (n2) this.pulse(n2.midi, t, n2.len * stepDur, this.loop.duty2 ?? 0.25, 0.07 * v);
      const nw = this.parsed.wave[i % this.parsed.wave.length]; if (nw) this.tri(nw.midi, t, nw.len * stepDur, 0.16 * v);
      const d = this.parsed.drums[i % this.parsed.drums.length]; if (d && d !== '.') this.drum(d, t, v);
      this.nextTime += stepDur; this.step++;
    }
  }
  private pulse(midi: number, t: number, dur: number, duty: number, vol: number) {
    const o = this.ctx.createOscillator(); o.setPeriodicWave(pulseWave(this.ctx, duty)); o.frequency.value = hz(midi);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.setValueAtTime(vol, t + Math.max(0.01, dur * 0.7)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.02);
  }
  private tri(midi: number, t: number, dur: number, vol: number) {
    const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(midi);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.setValueAtTime(vol, t + Math.max(0.02, dur * 0.8)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.02);
  }
  private noiseBuf?: AudioBuffer;
  private drum(kind: string, t: number, v: number) {
    if (!this.noiseBuf) { const n = this.ctx.sampleRate * 0.3; this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate); const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; const f = this.ctx.createBiquadFilter(); const g = this.ctx.createGain();
    const dur = kind === 'k' ? 0.12 : kind === 's' ? 0.14 : 0.04; const vol = (kind === 'k' ? 0.22 : kind === 's' ? 0.14 : 0.06) * v;
    f.type = kind === 'k' ? 'lowpass' : 'highpass'; f.frequency.value = kind === 'k' ? 160 : kind === 's' ? 1800 : 6000;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + dur + 0.01);
    if (kind === 'k') { const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.1); const og = this.ctx.createGain(); og.gain.setValueAtTime(0.25 * v, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(og); og.connect(this.out); o.start(t); o.stop(t + 0.14); }
  }
}
