/* 8-bit sound effects rendered with jsfxr (public domain, UNLICENSE). Every preset is a fixed sfxr parameter set, so a
 * sound is identical every time; the rendered AudioBuffer is cached per name. Wave types: 0 square, 1 saw, 2 sine, 3 noise. */
import { sfxr } from 'jsfxr';

export type SfxName =
  | 'tap' | 'confirm' | 'back' | 'cancel' | 'page' | 'coin' | 'cash' | 'stamp' | 'jump' | 'land' | 'hurt' | 'stomp' | 'splash'
  | 'spear' | 'deflect' | 'whoosh' | 'chop' | 'sizzle' | 'pour' | 'knead' | 'shutter' | 'bomb' | 'ring' | 'heart' | 'powerup'
  | 'wheel' | 'reel' | 'jackpot' | 'step' | 'crash' | 'shatter' | 'zipper' | 'flag' | 'perfect' | 'fail' | 'chime' | 'plane'
  | 'train' | 'boarding' | 'whistle' | 'tick' | 'blip' | 'pop' | 'grind' | 'win' | 'lose' | 'lock' | 'line' | 'thunk' | 'crack';

type Def = Partial<{
  wave_type: number; p_env_attack: number; p_env_sustain: number; p_env_punch: number; p_env_decay: number; p_base_freq: number; p_freq_limit: number;
  p_freq_ramp: number; p_freq_dramp: number; p_vib_strength: number; p_vib_speed: number; p_arp_mod: number; p_arp_speed: number; p_duty: number;
  p_duty_ramp: number; p_repeat_speed: number; p_pha_offset: number; p_pha_ramp: number; p_lpf_freq: number; p_lpf_ramp: number; p_lpf_resonance: number;
  p_hpf_freq: number; p_hpf_ramp: number; sound_vol: number; sample_rate: number; sample_size: number;
}>;

/* A quiet default so every preset only lists what it changes. */
const BASE: Def = { wave_type: 0, p_env_attack: 0, p_env_sustain: 0.1, p_env_punch: 0, p_env_decay: 0.2, p_base_freq: 0.3, p_freq_limit: 0, p_freq_ramp: 0, p_freq_dramp: 0,
  p_vib_strength: 0, p_vib_speed: 0, p_arp_mod: 0, p_arp_speed: 0, p_duty: 0.5, p_duty_ramp: 0, p_repeat_speed: 0, p_pha_offset: 0, p_pha_ramp: 0,
  p_lpf_freq: 1, p_lpf_ramp: 0, p_lpf_resonance: 0, p_hpf_freq: 0, p_hpf_ramp: 0, sound_vol: 0.25, sample_rate: 44100, sample_size: 8 };

export const PRESETS: Record<SfxName, Def> = {
  tap: { wave_type: 2, p_base_freq: 0.4, p_env_attack: 0.005, p_env_sustain: 0.03, p_env_decay: 0.07, p_lpf_freq: 0.6, sound_vol: 0.14 },
  blip: { wave_type: 2, p_base_freq: 0.48, p_env_sustain: 0.02, p_env_decay: 0.06, p_lpf_freq: 0.6, sound_vol: 0.12 },
  confirm: { wave_type: 2, p_base_freq: 0.36, p_env_attack: 0.01, p_env_sustain: 0.08, p_env_decay: 0.16, p_arp_mod: 0.28, p_arp_speed: 0.6, p_lpf_freq: 0.6, sound_vol: 0.16 },
  back: { wave_type: 2, p_base_freq: 0.32, p_env_sustain: 0.06, p_env_decay: 0.14, p_freq_ramp: -0.14, p_lpf_freq: 0.55, sound_vol: 0.14 },
  cancel: { wave_type: 2, p_base_freq: 0.28, p_env_sustain: 0.05, p_env_decay: 0.16, p_freq_ramp: -0.22, p_lpf_freq: 0.5, sound_vol: 0.14 },
  page: { wave_type: 3, p_base_freq: 0.45, p_env_attack: 0.01, p_env_sustain: 0.03, p_env_decay: 0.09, p_lpf_freq: 0.35, p_hpf_freq: 0.1, sound_vol: 0.09 },
  coin: { wave_type: 2, p_base_freq: 0.52, p_env_sustain: 0.05, p_env_punch: 0.2, p_env_decay: 0.24, p_arp_mod: 0.4, p_arp_speed: 0.55, p_lpf_freq: 0.7, sound_vol: 0.16 },
  cash: { wave_type: 2, p_base_freq: 0.46, p_env_sustain: 0.1, p_env_punch: 0.15, p_env_decay: 0.26, p_arp_mod: 0.24, p_arp_speed: 0.5, p_repeat_speed: 0.55, p_lpf_freq: 0.65, sound_vol: 0.16 },
  stamp: { wave_type: 3, p_base_freq: 0.16, p_env_sustain: 0.04, p_env_punch: 0.35, p_env_decay: 0.12, p_lpf_freq: 0.18, sound_vol: 0.2 },
  jump: { wave_type: 2, p_base_freq: 0.27, p_env_sustain: 0.1, p_env_decay: 0.14, p_freq_ramp: 0.22, p_lpf_freq: 0.6, sound_vol: 0.15 },
  land: { wave_type: 3, p_base_freq: 0.14, p_env_sustain: 0.02, p_env_punch: 0.2, p_env_decay: 0.08, p_lpf_freq: 0.22, sound_vol: 0.12 },
  hurt: { wave_type: 2, p_base_freq: 0.28, p_env_sustain: 0.07, p_env_punch: 0.15, p_env_decay: 0.18, p_freq_ramp: -0.28, p_lpf_freq: 0.5, sound_vol: 0.16 },
  stomp: { wave_type: 3, p_base_freq: 0.2, p_env_sustain: 0.03, p_env_punch: 0.3, p_env_decay: 0.12, p_freq_ramp: -0.25, p_lpf_freq: 0.3, sound_vol: 0.16 },
  splash: { wave_type: 3, p_base_freq: 0.3, p_env_attack: 0.02, p_env_sustain: 0.08, p_env_decay: 0.24, p_lpf_freq: 0.35, p_lpf_ramp: -0.2, sound_vol: 0.13 },
  spear: { wave_type: 2, p_base_freq: 0.55, p_env_sustain: 0.05, p_env_decay: 0.12, p_freq_ramp: -0.36, p_lpf_freq: 0.6, sound_vol: 0.14 },
  deflect: { wave_type: 2, p_base_freq: 0.58, p_env_sustain: 0.02, p_env_decay: 0.09, p_freq_ramp: -0.4, p_lpf_freq: 0.6, sound_vol: 0.13 },
  whoosh: { wave_type: 3, p_base_freq: 0.25, p_env_attack: 0.06, p_env_sustain: 0.1, p_env_decay: 0.24, p_lpf_freq: 0.3, p_lpf_ramp: 0.15, p_hpf_freq: 0.1, sound_vol: 0.1 },
  chop: { wave_type: 3, p_base_freq: 0.32, p_env_sustain: 0.01, p_env_punch: 0.35, p_env_decay: 0.06, p_lpf_freq: 0.35, sound_vol: 0.16 },
  sizzle: { wave_type: 3, p_base_freq: 0.55, p_env_attack: 0.05, p_env_sustain: 0.25, p_env_decay: 0.3, p_lpf_freq: 0.4, p_hpf_freq: 0.3, sound_vol: 0.07 },
  pour: { wave_type: 3, p_base_freq: 0.4, p_env_attack: 0.08, p_env_sustain: 0.28, p_env_decay: 0.25, p_lpf_freq: 0.35, p_lpf_ramp: 0.08, sound_vol: 0.07 },
  knead: { wave_type: 3, p_base_freq: 0.11, p_env_sustain: 0.03, p_env_punch: 0.2, p_env_decay: 0.1, p_lpf_freq: 0.15, sound_vol: 0.14 },
  shutter: { wave_type: 3, p_base_freq: 0.5, p_env_sustain: 0.03, p_env_punch: 0.3, p_env_decay: 0.09, p_repeat_speed: 0.8, p_lpf_freq: 0.5, p_hpf_freq: 0.15, sound_vol: 0.11 },
  bomb: { wave_type: 3, p_base_freq: 0.11, p_env_sustain: 0.15, p_env_punch: 0.3, p_env_decay: 0.4, p_freq_ramp: -0.08, p_lpf_freq: 0.25, sound_vol: 0.18 },
  ring: { wave_type: 2, p_base_freq: 0.56, p_env_sustain: 0.04, p_env_punch: 0.15, p_env_decay: 0.2, p_arp_mod: 0.28, p_arp_speed: 0.65, p_lpf_freq: 0.7, sound_vol: 0.14 },
  heart: { wave_type: 2, p_base_freq: 0.43, p_env_sustain: 0.08, p_env_decay: 0.26, p_arp_mod: 0.38, p_arp_speed: 0.5, p_repeat_speed: 0.5, p_lpf_freq: 0.7, sound_vol: 0.14 },
  powerup: { wave_type: 2, p_base_freq: 0.3, p_env_sustain: 0.2, p_env_decay: 0.26, p_freq_ramp: 0.18, p_repeat_speed: 0.45, p_lpf_freq: 0.65, sound_vol: 0.14 },
  wheel: { wave_type: 2, p_base_freq: 0.62, p_env_sustain: 0.02, p_env_decay: 0.05, p_lpf_freq: 0.6, sound_vol: 0.07 },
  reel: { wave_type: 3, p_base_freq: 0.25, p_env_sustain: 0.02, p_env_punch: 0.25, p_env_decay: 0.07, p_lpf_freq: 0.3, sound_vol: 0.12 },
  jackpot: { wave_type: 2, p_base_freq: 0.48, p_env_sustain: 0.25, p_env_punch: 0.15, p_env_decay: 0.45, p_arp_mod: 0.33, p_arp_speed: 0.45, p_repeat_speed: 0.65, p_lpf_freq: 0.7, sound_vol: 0.16 },
  step: { wave_type: 3, p_base_freq: 0.16, p_env_sustain: 0.01, p_env_decay: 0.04, p_lpf_freq: 0.2, sound_vol: 0.05 },
  crash: { wave_type: 3, p_base_freq: 0.18, p_env_sustain: 0.12, p_env_punch: 0.35, p_env_decay: 0.35, p_freq_ramp: -0.15, p_lpf_freq: 0.3, sound_vol: 0.18 },
  shatter: { wave_type: 3, p_base_freq: 0.6, p_env_sustain: 0.05, p_env_punch: 0.3, p_env_decay: 0.28, p_lpf_freq: 0.55, p_hpf_freq: 0.3, p_repeat_speed: 0.75, sound_vol: 0.13 },
  zipper: { wave_type: 3, p_base_freq: 0.4, p_env_sustain: 0.16, p_env_decay: 0.08, p_freq_ramp: 0.16, p_repeat_speed: 0.85, p_lpf_freq: 0.45, p_hpf_freq: 0.25, sound_vol: 0.1 },
  flag: { wave_type: 2, p_base_freq: 0.4, p_env_sustain: 0.3, p_env_decay: 0.36, p_arp_mod: 0.28, p_arp_speed: 0.4, p_repeat_speed: 0.42, p_lpf_freq: 0.7, sound_vol: 0.16 },
  perfect: { wave_type: 2, p_base_freq: 0.48, p_env_sustain: 0.26, p_env_punch: 0.1, p_env_decay: 0.44, p_arp_mod: 0.42, p_arp_speed: 0.5, p_repeat_speed: 0.55, p_lpf_freq: 0.7, sound_vol: 0.16 },
  win: { wave_type: 2, p_base_freq: 0.44, p_env_sustain: 0.3, p_env_decay: 0.4, p_arp_mod: 0.36, p_arp_speed: 0.42, p_repeat_speed: 0.48, p_lpf_freq: 0.7, sound_vol: 0.16 },
  fail: { wave_type: 2, p_base_freq: 0.3, p_env_sustain: 0.26, p_env_decay: 0.34, p_freq_ramp: -0.12, p_lpf_freq: 0.45, sound_vol: 0.14 },
  lose: { wave_type: 2, p_base_freq: 0.28, p_env_sustain: 0.3, p_env_decay: 0.4, p_freq_ramp: -0.1, p_arp_mod: -0.28, p_arp_speed: 0.3, p_lpf_freq: 0.5, sound_vol: 0.14 },
  chime: { wave_type: 2, p_base_freq: 0.6, p_env_sustain: 0.22, p_env_decay: 0.55, p_arp_mod: 0.28, p_arp_speed: 0.35, p_repeat_speed: 0.38, p_lpf_freq: 0.75, sound_vol: 0.14 },
  plane: { wave_type: 2, p_base_freq: 0.13, p_env_attack: 0.2, p_env_sustain: 0.5, p_env_decay: 0.45, p_freq_ramp: 0.04, p_lpf_freq: 0.25, p_vib_strength: 0.08, p_vib_speed: 0.18, sound_vol: 0.1 },
  train: { wave_type: 3, p_base_freq: 0.18, p_env_attack: 0.1, p_env_sustain: 0.42, p_env_decay: 0.35, p_repeat_speed: 0.42, p_lpf_freq: 0.25, sound_vol: 0.09 },
  boarding: { wave_type: 2, p_base_freq: 0.52, p_env_attack: 0.01, p_env_sustain: 0.18, p_env_decay: 0.22, p_arp_mod: 0.18, p_arp_speed: 0.6, p_repeat_speed: 0.38, p_lpf_freq: 0.7, sound_vol: 0.13 },
  whistle: { wave_type: 2, p_base_freq: 0.62, p_env_attack: 0.1, p_env_sustain: 0.26, p_env_decay: 0.26, p_freq_ramp: -0.06, p_vib_strength: 0.2, p_vib_speed: 0.45, p_lpf_freq: 0.7, sound_vol: 0.09 },
  tick: { wave_type: 2, p_base_freq: 0.55, p_env_sustain: 0.02, p_env_decay: 0.05, p_lpf_freq: 0.6, sound_vol: 0.07 },
  pop: { wave_type: 3, p_base_freq: 0.22, p_env_sustain: 0.04, p_env_punch: 0.3, p_env_decay: 0.16, p_lpf_freq: 0.3, sound_vol: 0.16 },
  grind: { wave_type: 3, p_base_freq: 0.25, p_env_attack: 0.02, p_env_sustain: 0.34, p_env_decay: 0.18, p_repeat_speed: 0.7, p_lpf_freq: 0.3, sound_vol: 0.09 },
  lock: { wave_type: 3, p_base_freq: 0.22, p_env_sustain: 0.02, p_env_punch: 0.25, p_env_decay: 0.07, p_lpf_freq: 0.28, sound_vol: 0.12 },
  line: { wave_type: 2, p_base_freq: 0.38, p_env_sustain: 0.09, p_env_decay: 0.22, p_freq_ramp: 0.16, p_lpf_freq: 0.65, sound_vol: 0.14 },
  thunk: { wave_type: 3, p_base_freq: 0.13, p_env_sustain: 0.03, p_env_punch: 0.45, p_env_decay: 0.14, p_lpf_freq: 0.22, sound_vol: 0.18 },
  crack: { wave_type: 3, p_base_freq: 0.42, p_env_sustain: 0.02, p_env_punch: 0.25, p_env_decay: 0.1, p_lpf_freq: 0.45, p_hpf_freq: 0.12, sound_vol: 0.13 },
};

/** Three alternative characters per effect, derived from the current preset so ids stay stable: soft (rounder, longer, darker), bright (shorter, higher, crisper), low (deeper, mellow). */
export type SfxCandidate = { id: string; label: string; def: Def; file?: string; gain?: number };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
function variant(kind: 'soft' | 'bright' | 'low', d: Def): Def {
  const o: Def = { ...d }; const noise = d.wave_type === 3;
  if (kind === 'soft') { if (!noise) o.wave_type = 2; o.p_env_attack = Math.max(d.p_env_attack ?? 0, 0.02); o.p_env_decay = (d.p_env_decay ?? 0.2) * 1.3; o.p_env_punch = (d.p_env_punch ?? 0) * 0.4; o.p_lpf_freq = Math.min(d.p_lpf_freq ?? 1, 0.4); o.p_hpf_freq = 0; o.sound_vol = (d.sound_vol ?? 0.2) * 0.85; }
  if (kind === 'bright') { if (!noise) o.wave_type = 0; o.p_duty = 0.25; o.p_env_decay = (d.p_env_decay ?? 0.2) * 0.65; o.p_env_sustain = (d.p_env_sustain ?? 0.1) * 0.7; o.p_base_freq = clamp01((d.p_base_freq ?? 0.3) * 1.25); o.p_lpf_freq = 1; o.p_hpf_freq = Math.max(d.p_hpf_freq ?? 0, 0.12); o.sound_vol = (d.sound_vol ?? 0.2) * 0.8; }
  if (kind === 'low') { if (!noise) o.wave_type = 2; o.p_base_freq = clamp01((d.p_base_freq ?? 0.3) * 0.66); o.p_env_decay = (d.p_env_decay ?? 0.2) * 1.15; o.p_lpf_freq = Math.min(d.p_lpf_freq ?? 1, 0.3); o.p_hpf_freq = 0; o.sound_vol = (d.sound_vol ?? 0.2) * 0.95; }
  return o;
}
export const SFX_CANDIDATES: Record<SfxName, SfxCandidate[]> = Object.fromEntries((Object.keys(PRESETS) as SfxName[]).map(n => [n, [
  { id: `${n}.current`, label: 'current', def: PRESETS[n] },
  { id: `${n}.soft`, label: 'soft / rounded', def: variant('soft', PRESETS[n]) },
  { id: `${n}.bright`, label: 'bright / short', def: variant('bright', PRESETS[n]) },
  { id: `${n}.low`, label: 'mellow / low', def: variant('low', PRESETS[n]) },
]])) as Record<SfxName, SfxCandidate[]>;
/* Two effects can also be a recorded file (a real jet, a real gust); the engine decodes and caches them like the rendered ones. */
export type SfxFileCandidate = { id: string; label: string; file: string; gain: number };
export const SFX_FILES: Partial<Record<SfxName, SfxFileCandidate[]>> = {
  plane: [{ id: 'plane.jet', label: 'real jet takeoff · dklon', file: 'audio/jet-takeoff.mp3', gain: 0.5 }],   /* 0.35 left it under the music bed once the tracks were normalised */
  whistle: [{ id: 'whistle.wind', label: 'real gust · InspectorJ', file: 'audio/wind-gust.mp3', gain: 1 }],
};
for (const [slot, files] of Object.entries(SFX_FILES)) for (const f of files!) SFX_CANDIDATES[slot as SfxName].push({ id: f.id, label: f.label, def: PRESETS[slot as SfxName], file: f.file, gain: f.gain });
export function sfxDefById(id: string): Def | undefined { const slot = id.split('.')[0] as SfxName; const c = SFX_CANDIDATES[slot]?.find(x => x.id === id); return c && !c.file ? c.def : c?.def; }
/** The candidate behind an id, whether it is a rendered preset or a file. */
export function sfxCandidateById(id: string): SfxCandidate | undefined { const slot = id.split('.')[0] as SfxName; return SFX_CANDIDATES[slot]?.find(c => c.id === id); }

export const SFX_NAMES = Object.keys(PRESETS) as SfxName[];

/* ---- loudness bands ----------------------------------------------------------------------------------------------
 * Measured as RMS over the sounding part of each rendered buffer (tools/measure_sfx.ts). The raw presets span ~17 dB,
 * which is why some effects felt much louder than others. SFX_TRIM is a per-preset gain that pulls each one into its
 * band; it is regenerated by `npx tsx tools/gen_sfx_trim.ts` and applied in the playback path, never baked into the
 * preset parameters, so the numbers stay auditable. Two bands are deliberate, not flattened:
 *   quiet repeaters fire constantly and sit 6 dB down; big one-offs are the payoff sounds and sit 2 dB up. */
export const SFX_BANDS = { quiet: -23, normal: -17, loud: -15 } as const;
export const QUIET_SFX = new Set<SfxName>(['step', 'tick', 'wheel', 'blip', 'tap', 'lock', 'reel']);
export const LOUD_SFX = new Set<SfxName>(['jackpot', 'win', 'lose', 'perfect', 'crash', 'bomb']);
export const bandOf = (n: SfxName) => (QUIET_SFX.has(n) ? SFX_BANDS.quiet : LOUD_SFX.has(n) ? SFX_BANDS.loud : SFX_BANDS.normal);
/* SFX_TRIM starts */
export const SFX_TRIM: Record<SfxName, number> = {
  tap: 0.486,
  blip: 0.603,
  confirm: 0.815,
  back: 0.973,
  cancel: 1.025,
  page: 3.111,
  coin: 0.897,
  cash: 0.813,
  stamp: 1.03,
  jump: 0.804,
  land: 1.667,
  hurt: 0.811,
  stomp: 1.133,
  splash: 1.666,
  spear: 0.976,
  deflect: 1.144,
  whoosh: 1.87,
  chop: 1.361,
  sizzle: 3.701,
  pour: 2.39,
  knead: 1.748,
  shutter: 1.964,
  bomb: 1.095,
  ring: 1.045,
  heart: 1.027,
  powerup: 0.85,
  wheel: 1.021,
  reel: 0.841,
  jackpot: 0.929,
  step: 2.856,
  crash: 1.089,
  shatter: 2.111,
  zipper: 1.558,
  flag: 0.722,
  perfect: 0.938,
  win: 0.933,
  fail: 0.85,
  lose: 1.075,
  chime: 0.992,
  plane: 1.135,
  train: 1.731,
  boarding: 0.909,
  whistle: 1.295,
  tick: 1.023,
  pop: 1.179,
  grind: 1.624,
  lock: 0.826,
  line: 0.981,
  thunk: 0.99,
  crack: 1.753,
};
/* SFX_TRIM ends */

/** Render any parameter set to a Float32 sample array (pure; no AudioContext needed). */
export function renderDef(d: Def): { samples: Float32Array; sampleRate: number } {
  const def = { ...BASE, ...d };
  const wave: any = (sfxr as any).toWave(def);
  return { samples: Float32Array.from(wave.buffer as number[]), sampleRate: def.sample_rate ?? 44100 };
}
export function renderSamples(name: SfxName): { samples: Float32Array; sampleRate: number } {
  const def = { ...BASE, ...PRESETS[name] };
  const wave: any = (sfxr as any).toWave(def);   /* wave.buffer holds the normalized float samples */
  return { samples: Float32Array.from(wave.buffer as number[]), sampleRate: def.sample_rate ?? 44100 };
}

/** The rendered samples for a candidate id or slot name, with that slot's loudness trim already applied. */
export function trimmedSamples(idOrName: string): { samples: Float32Array; sampleRate: number } {
  const slot = idOrName.split('.')[0] as SfxName;
  const d = sfxDefById(idOrName) ?? PRESETS[slot] ?? PRESETS.tap;
  const r = renderDef(d); const g = SFX_TRIM[slot] ?? 1;
  if (g !== 1) { const out = new Float32Array(r.samples.length); for (let i = 0; i < r.samples.length; i++) out[i] = r.samples[i] * g; return { samples: out, sampleRate: r.sampleRate }; }
  return r;
}
/** Cached AudioBuffers per name for a given context. */
export class SfxBank {
  private cache = new Map<string, AudioBuffer>();
  constructor(private ctx: AudioContext) {}
  /** Buffer for a candidate id ('coin.soft') or a plain slot name ('coin' = its current preset). */
  get(idOrName: string): AudioBuffer {
    let b = this.cache.get(idOrName);
    if (!b) { const r = trimmedSamples(idOrName); b = this.ctx.createBuffer(1, r.samples.length, r.sampleRate); b.getChannelData(0).set(r.samples); this.cache.set(idOrName, b); }
    return b;
  }
}
