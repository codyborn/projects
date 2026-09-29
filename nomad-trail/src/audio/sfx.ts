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
  tap:      { wave_type: 0, p_base_freq: 0.42, p_env_sustain: 0.03, p_env_decay: 0.08, p_duty: 0.3, sound_vol: 0.16 },
  blip:     { wave_type: 0, p_base_freq: 0.5, p_env_sustain: 0.02, p_env_decay: 0.06, sound_vol: 0.14 },
  confirm:  { wave_type: 0, p_base_freq: 0.38, p_env_sustain: 0.08, p_env_decay: 0.18, p_arp_mod: 0.32, p_arp_speed: 0.62, p_duty: 0.25, sound_vol: 0.2 },
  back:     { wave_type: 0, p_base_freq: 0.34, p_env_sustain: 0.06, p_env_decay: 0.16, p_freq_ramp: -0.18, p_duty: 0.35, sound_vol: 0.16 },
  cancel:   { wave_type: 0, p_base_freq: 0.3, p_env_sustain: 0.05, p_env_decay: 0.2, p_freq_ramp: -0.3, sound_vol: 0.16 },
  page:     { wave_type: 3, p_base_freq: 0.55, p_env_sustain: 0.04, p_env_decay: 0.12, p_hpf_freq: 0.3, p_lpf_freq: 0.6, sound_vol: 0.12 },
  coin:     { wave_type: 0, p_base_freq: 0.55, p_env_sustain: 0.05, p_env_punch: 0.4, p_env_decay: 0.3, p_arp_mod: 0.42, p_arp_speed: 0.55, sound_vol: 0.2 },
  cash:     { wave_type: 0, p_base_freq: 0.48, p_env_sustain: 0.12, p_env_punch: 0.3, p_env_decay: 0.32, p_arp_mod: 0.25, p_arp_speed: 0.5, p_repeat_speed: 0.6, sound_vol: 0.2 },
  stamp:    { wave_type: 3, p_base_freq: 0.18, p_env_sustain: 0.05, p_env_punch: 0.6, p_env_decay: 0.14, p_lpf_freq: 0.25, sound_vol: 0.28 },
  jump:     { wave_type: 0, p_base_freq: 0.28, p_env_sustain: 0.12, p_env_decay: 0.16, p_freq_ramp: 0.28, p_duty: 0.4, sound_vol: 0.18 },
  land:     { wave_type: 3, p_base_freq: 0.15, p_env_sustain: 0.02, p_env_punch: 0.3, p_env_decay: 0.1, p_lpf_freq: 0.3, sound_vol: 0.16 },
  hurt:     { wave_type: 1, p_base_freq: 0.3, p_env_sustain: 0.08, p_env_punch: 0.3, p_env_decay: 0.22, p_freq_ramp: -0.35, sound_vol: 0.2 },
  stomp:    { wave_type: 3, p_base_freq: 0.22, p_env_sustain: 0.04, p_env_punch: 0.5, p_env_decay: 0.16, p_freq_ramp: -0.3, p_lpf_freq: 0.4, sound_vol: 0.22 },
  splash:   { wave_type: 3, p_base_freq: 0.35, p_env_attack: 0.02, p_env_sustain: 0.1, p_env_decay: 0.3, p_lpf_freq: 0.5, p_lpf_ramp: -0.3, sound_vol: 0.18 },
  spear:    { wave_type: 1, p_base_freq: 0.6, p_env_sustain: 0.06, p_env_decay: 0.14, p_freq_ramp: -0.42, p_hpf_freq: 0.1, sound_vol: 0.18 },
  deflect:  { wave_type: 0, p_base_freq: 0.62, p_env_sustain: 0.02, p_env_decay: 0.1, p_freq_ramp: -0.5, p_duty: 0.15, sound_vol: 0.16 },
  whoosh:   { wave_type: 3, p_base_freq: 0.3, p_env_attack: 0.08, p_env_sustain: 0.12, p_env_decay: 0.3, p_lpf_freq: 0.45, p_lpf_ramp: 0.2, p_hpf_freq: 0.15, sound_vol: 0.14 },
  chop:     { wave_type: 3, p_base_freq: 0.4, p_env_sustain: 0.01, p_env_punch: 0.6, p_env_decay: 0.07, p_lpf_freq: 0.5, sound_vol: 0.22 },
  sizzle:   { wave_type: 3, p_base_freq: 0.7, p_env_attack: 0.05, p_env_sustain: 0.3, p_env_decay: 0.4, p_hpf_freq: 0.5, sound_vol: 0.1 },
  pour:     { wave_type: 3, p_base_freq: 0.5, p_env_attack: 0.1, p_env_sustain: 0.35, p_env_decay: 0.3, p_lpf_freq: 0.55, p_lpf_ramp: 0.1, sound_vol: 0.1 },
  knead:    { wave_type: 3, p_base_freq: 0.12, p_env_sustain: 0.04, p_env_punch: 0.3, p_env_decay: 0.12, p_lpf_freq: 0.2, sound_vol: 0.2 },
  shutter:  { wave_type: 3, p_base_freq: 0.6, p_env_sustain: 0.04, p_env_punch: 0.5, p_env_decay: 0.12, p_repeat_speed: 0.85, p_hpf_freq: 0.3, sound_vol: 0.16 },
  bomb:     { wave_type: 3, p_base_freq: 0.12, p_env_sustain: 0.2, p_env_punch: 0.5, p_env_decay: 0.5, p_freq_ramp: -0.1, p_lpf_freq: 0.35, sound_vol: 0.26 },
  ring:     { wave_type: 0, p_base_freq: 0.6, p_env_sustain: 0.04, p_env_punch: 0.3, p_env_decay: 0.22, p_arp_mod: 0.3, p_arp_speed: 0.7, p_duty: 0.2, sound_vol: 0.18 },
  heart:    { wave_type: 0, p_base_freq: 0.45, p_env_sustain: 0.1, p_env_decay: 0.3, p_arp_mod: 0.4, p_arp_speed: 0.5, p_repeat_speed: 0.55, sound_vol: 0.18 },
  powerup:  { wave_type: 0, p_base_freq: 0.32, p_env_sustain: 0.25, p_env_decay: 0.3, p_freq_ramp: 0.22, p_repeat_speed: 0.5, p_duty: 0.35, sound_vol: 0.18 },
  wheel:    { wave_type: 0, p_base_freq: 0.7, p_env_sustain: 0.02, p_env_decay: 0.05, p_duty: 0.1, sound_vol: 0.1 },
  reel:     { wave_type: 3, p_base_freq: 0.3, p_env_sustain: 0.02, p_env_punch: 0.4, p_env_decay: 0.08, p_lpf_freq: 0.4, sound_vol: 0.16 },
  jackpot:  { wave_type: 0, p_base_freq: 0.5, p_env_sustain: 0.3, p_env_punch: 0.3, p_env_decay: 0.5, p_arp_mod: 0.35, p_arp_speed: 0.45, p_repeat_speed: 0.7, sound_vol: 0.22 },
  step:     { wave_type: 3, p_base_freq: 0.2, p_env_sustain: 0.01, p_env_decay: 0.05, p_lpf_freq: 0.3, sound_vol: 0.08 },
  crash:    { wave_type: 3, p_base_freq: 0.2, p_env_sustain: 0.15, p_env_punch: 0.6, p_env_decay: 0.45, p_freq_ramp: -0.2, p_lpf_freq: 0.5, sound_vol: 0.26 },
  shatter:  { wave_type: 3, p_base_freq: 0.75, p_env_sustain: 0.06, p_env_punch: 0.5, p_env_decay: 0.35, p_hpf_freq: 0.45, p_repeat_speed: 0.8, sound_vol: 0.2 },
  zipper:   { wave_type: 3, p_base_freq: 0.45, p_env_sustain: 0.2, p_env_decay: 0.1, p_freq_ramp: 0.2, p_repeat_speed: 0.9, p_hpf_freq: 0.4, sound_vol: 0.14 },
  flag:     { wave_type: 0, p_base_freq: 0.42, p_env_sustain: 0.35, p_env_decay: 0.4, p_arp_mod: 0.3, p_arp_speed: 0.4, p_repeat_speed: 0.45, p_duty: 0.3, sound_vol: 0.2 },
  perfect:  { wave_type: 0, p_base_freq: 0.5, p_env_sustain: 0.3, p_env_punch: 0.2, p_env_decay: 0.5, p_arp_mod: 0.45, p_arp_speed: 0.5, p_repeat_speed: 0.6, p_duty: 0.25, sound_vol: 0.2 },
  win:      { wave_type: 0, p_base_freq: 0.45, p_env_sustain: 0.35, p_env_decay: 0.45, p_arp_mod: 0.38, p_arp_speed: 0.42, p_repeat_speed: 0.5, sound_vol: 0.2 },
  fail:     { wave_type: 1, p_base_freq: 0.32, p_env_sustain: 0.3, p_env_decay: 0.4, p_freq_ramp: -0.15, p_lpf_freq: 0.5, sound_vol: 0.18 },
  lose:     { wave_type: 0, p_base_freq: 0.3, p_env_sustain: 0.35, p_env_decay: 0.45, p_freq_ramp: -0.12, p_arp_mod: -0.3, p_arp_speed: 0.3, sound_vol: 0.18 },
  chime:    { wave_type: 2, p_base_freq: 0.62, p_env_sustain: 0.25, p_env_decay: 0.6, p_arp_mod: 0.3, p_arp_speed: 0.35, p_repeat_speed: 0.4, sound_vol: 0.18 },
  plane:    { wave_type: 1, p_base_freq: 0.14, p_env_attack: 0.2, p_env_sustain: 0.6, p_env_decay: 0.5, p_freq_ramp: 0.05, p_lpf_freq: 0.3, p_vib_strength: 0.1, p_vib_speed: 0.2, sound_vol: 0.12 },
  train:    { wave_type: 3, p_base_freq: 0.2, p_env_attack: 0.1, p_env_sustain: 0.5, p_env_decay: 0.4, p_repeat_speed: 0.45, p_lpf_freq: 0.35, sound_vol: 0.12 },
  boarding: { wave_type: 2, p_base_freq: 0.55, p_env_sustain: 0.2, p_env_decay: 0.25, p_arp_mod: 0.2, p_arp_speed: 0.6, p_repeat_speed: 0.4, sound_vol: 0.16 },
  whistle:  { wave_type: 2, p_base_freq: 0.7, p_env_attack: 0.1, p_env_sustain: 0.3, p_env_decay: 0.3, p_freq_ramp: -0.08, p_vib_strength: 0.25, p_vib_speed: 0.5, sound_vol: 0.12 },
  tick:     { wave_type: 0, p_base_freq: 0.6, p_env_sustain: 0.02, p_env_decay: 0.05, p_duty: 0.1, sound_vol: 0.1 },
  pop:      { wave_type: 3, p_base_freq: 0.25, p_env_sustain: 0.05, p_env_punch: 0.5, p_env_decay: 0.2, p_lpf_freq: 0.4, sound_vol: 0.22 },
  grind:    { wave_type: 3, p_base_freq: 0.3, p_env_attack: 0.02, p_env_sustain: 0.4, p_env_decay: 0.2, p_repeat_speed: 0.75, p_lpf_freq: 0.4, sound_vol: 0.12 },
  lock:     { wave_type: 3, p_base_freq: 0.25, p_env_sustain: 0.02, p_env_punch: 0.4, p_env_decay: 0.08, p_lpf_freq: 0.35, sound_vol: 0.16 },
  line:     { wave_type: 0, p_base_freq: 0.4, p_env_sustain: 0.1, p_env_decay: 0.25, p_freq_ramp: 0.2, p_duty: 0.3, sound_vol: 0.18 },
  thunk:    { wave_type: 3, p_base_freq: 0.15, p_env_sustain: 0.03, p_env_punch: 0.7, p_env_decay: 0.16, p_lpf_freq: 0.3, sound_vol: 0.26 },
  crack:    { wave_type: 3, p_base_freq: 0.5, p_env_sustain: 0.02, p_env_punch: 0.4, p_env_decay: 0.12, p_hpf_freq: 0.2, sound_vol: 0.18 },
};

export const SFX_NAMES = Object.keys(PRESETS) as SfxName[];

/** Render a preset to a Float32 sample array (pure; no AudioContext needed). */
export function renderSamples(name: SfxName): { samples: Float32Array; sampleRate: number } {
  const def = { ...BASE, ...PRESETS[name] };
  const wave: any = (sfxr as any).toWave(def);   /* wave.buffer holds the normalized float samples */
  return { samples: Float32Array.from(wave.buffer as number[]), sampleRate: def.sample_rate ?? 44100 };
}

/** Cached AudioBuffers per name for a given context. */
export class SfxBank {
  private cache = new Map<SfxName, AudioBuffer>();
  constructor(private ctx: AudioContext) {}
  get(name: SfxName): AudioBuffer {
    let b = this.cache.get(name);
    if (!b) { const r = renderSamples(name); b = this.ctx.createBuffer(1, r.samples.length, r.sampleRate); b.getChannelData(0).set(r.samples); this.cache.set(name, b); }
    return b;
  }
}
