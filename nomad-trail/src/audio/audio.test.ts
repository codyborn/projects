import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { SFX_NAMES, renderSamples, renderDef, SFX_CANDIDATES, sfxDefById, sfxCandidateById, PRESETS, SFX_TRIM, SFX_BANDS, QUIET_SFX, LOUD_SFX, bandOf, type SfxName } from './sfx';
import oga from './oga_tracks.json';
import { LOOPS, STINGERS, parseChannel, midiOf, MUSIC_CANDIDATES, MUSIC_SLOTS, musicById, calmOf, trackerLevel, MUSIC_REFERENCE_DB } from './tracker';
import { AMBIENCE, MUSIC_RATE_MIN, MUSIC_RATE_MAX, cityLoop } from './synth';
import { CITIES } from '../core/sim/data';
import selection from './selection.json';

const TINY = ['wheel', 'tick', 'step', 'blip', 'tap', 'land', 'lock', 'reel', 'chop', 'crack'];
describe('audio: file playback', () => {
  it('a file-backed loop survives its own stop(): the play token is claimed after stop', async () => {
    /* the bug: play() captured a token, then stop() incremented the same counter, so the post-decode
       guard always aborted and every music track was silent while effects and tracker loops worked */
    const src = await import('./synth');
    const text = (await import('node:fs')).readFileSync(new URL('./synth.ts', import.meta.url), 'utf8');
    const body = text.slice(text.indexOf('async play(file'), text.indexOf('async play(file') + 400);
    expect(body.indexOf('this.stop()')).toBeLessThan(body.indexOf('++this.token'));
    expect(src).toBeTruthy();
  });
});
describe('audio: jsfxr presets and candidates', () => {
  it('every preset renders a finite, non-silent buffer under 3 s', () => {
    for (const name of SFX_NAMES) {
      const r = renderSamples(name);
      expect(r.samples.length, name).toBeGreaterThan(TINY.includes(name) ? 80 : 400);
      let peak = 0; for (let i = 0; i < r.samples.length; i++) { const v = Math.abs(r.samples[i]); expect(Number.isFinite(v), name).toBe(true); if (v > peak) peak = v; }
      /* 'non-silent', not 'loud': the quiet repeaters (footsteps, wheel ticks) peak near 0.04 by design, and jsfxr's
         noise makes the exact peak vary a little between renders */
      expect(peak, name).toBeGreaterThan(TINY.includes(name) ? 0.01 : 0.05); expect(r.samples.length / r.sampleRate, name).toBeLessThan(3);
    }
  });
  it('every preset sits inside its loudness band after the trim', () => {
    /* jsfxr re-randomises noise on each render, so average a few passes before judging. */
    const rms = (n: SfxName, passes = 9) => {
      let acc = 0;
      for (let i = 0; i < passes; i++) {
        const s = renderDef(PRESETS[n]).samples; let peak = 0;
        for (let i2 = 0; i2 < s.length; i2++) peak = Math.max(peak, Math.abs(s[i2]));
        const gate = Math.max(peak * 0.02, 1e-4); let sum = 0, cnt = 0;
        for (let i2 = 0; i2 < s.length; i2++) if (Math.abs(s[i2]) >= gate) { sum += s[i2] * s[i2]; cnt++; }
        acc += cnt ? Math.sqrt(sum / cnt) : 0;
      }
      return 20 * Math.log10((acc / passes) * (SFX_TRIM[n] ?? 1) || 1e-9);
    };
    const off: string[] = [];
    for (const n of SFX_NAMES) { const d = rms(n) - bandOf(n); if (Math.abs(d) > 2) off.push(`${n} ${d.toFixed(1)} dB from ${bandOf(n)}`); }
    expect(off, 'every effect within 2 dB of its band').toEqual([]);
    for (const n of QUIET_SFX) expect(bandOf(n), n).toBe(SFX_BANDS.quiet);
    for (const n of LOUD_SFX) expect(bandOf(n), n).toBe(SFX_BANDS.loud);
    expect(Object.keys(SFX_TRIM).sort()).toEqual([...SFX_NAMES].sort());
  });
  it('the shipped music is levelled to one target with legal peaks', () => {
    const tracks = Object.values(oga).flat() as { id: string; lufs?: number; tp?: number }[];
    const lufs = tracks.map(t => t.lufs!).filter(v => typeof v === 'number');
    expect(lufs.length, 'every track carries a measured loudness').toBe(tracks.length);
    expect(Math.max(...lufs) - Math.min(...lufs), 'loudness spread across the library').toBeLessThanOrEqual(1.5);
    for (const t of tracks) expect(t.tp!, `${t.id} true peak`).toBeLessThanOrEqual(-1.5);
  });
  it('the music tempo hook clamps, maps Pack-Tris levels and resets between loops', () => {
    /* the clamp is pure maths, so it can be checked without an AudioContext */
    const clampRate = (r: number) => Math.min(MUSIC_RATE_MAX, Math.max(MUSIC_RATE_MIN, Number.isFinite(r) ? r : 1));
    expect(clampRate(1)).toBe(1); expect(clampRate(5)).toBe(MUSIC_RATE_MAX); expect(clampRate(0.1)).toBe(MUSIC_RATE_MIN);
    expect(clampRate(NaN)).toBe(1); expect(MUSIC_RATE_MIN).toBeLessThan(1); expect(MUSIC_RATE_MAX).toBeGreaterThan(1.5);
    /* Pack-Tris maps levels gained since the start onto the rate: +0.1 each, capped at +0.6 */
    const rateFor = (gained: number) => 1 + Math.min(0.6, 0.1 * gained);
    expect(rateFor(0)).toBe(1); expect(rateFor(3)).toBeCloseTo(1.3); expect(rateFor(6)).toBeCloseTo(1.6); expect(rateFor(99)).toBeCloseTo(1.6);
    expect(clampRate(rateFor(99)), 'the top of the ramp is inside the clamp').toBeCloseTo(1.6);
  });
  it('every tracker candidate is levelled to the same band as the shipped files', () => {
    const off: string[] = [];
    for (const slot of MUSIC_SLOTS) for (const c of MUSIC_CANDIDATES[slot]) {
      if (c.kind !== 'tracker') continue;
      const lvl = trackerLevel(c.id);
      expect(lvl, `${c.id} has a measured level (run tools/measure_music.mjs + gen_tracker_gain.mjs)`).toBeDefined();
      expect(c.gain, `${c.id} gain`).toBeGreaterThan(0);
      expect(c.gain, `${c.id} gain is a sane boost`).toBeLessThanOrEqual(8);
      const allowed = c.id === 'tetris.tracker.korobeiniki' ? 1.5 + 1.0 : 1.5;   /* the Pack-Tris theme sits a dB above the band */
      if (Math.abs(lvl! - MUSIC_REFERENCE_DB) > allowed) off.push(`${c.id} ${(lvl! - MUSIC_REFERENCE_DB).toFixed(1)} dB off`);
    }
    expect(off, 'tracker loops within 1.5 dB of the file reference').toEqual([]);
    expect(trackerLevel('tetris.tracker.korobeiniki')!, 'Korobeiniki sits at the top of the band')
      .toBeGreaterThan(MUSIC_REFERENCE_DB + 0.5);
  });
  it('four rendered candidates per effect plus any recorded ones, stable ids', () => {
    for (const name of SFX_NAMES) {
      const cs = SFX_CANDIDATES[name]; expect(cs.length, name).toBeGreaterThanOrEqual(4);
      expect(cs.slice(0, 4).map(c => c.id)).toEqual([`${name}.current`, `${name}.soft`, `${name}.bright`, `${name}.low`]);
      for (const c of cs) { const r = renderDef(c.def); expect(r.samples.length, c.id).toBeGreaterThan(40); }
      for (const c of cs.slice(4)) { expect(c.file, c.id).toBeTruthy(); expect(existsSync('public/' + c.file), c.file!).toBe(true); expect(c.gain, c.id).toBeGreaterThan(0); }
    }
    expect(sfxDefById('coin.soft')).toBeDefined(); expect(sfxDefById('nope.soft')).toBeUndefined();
    expect(sfxCandidateById('plane.jet')?.file, 'the jet is a recording').toBeTruthy();
  });
});
describe('audio: tracker loops and music candidates', () => {
  it('notes parse and every loop is whole bars of 16 steps with valid tokens', () => {
    expect(midiOf('C4')).toBe(60); expect(midiOf('A4')).toBe(69); expect(midiOf('F#3')).toBe(54); expect(midiOf('Bb3')).toBe(58); expect(midiOf('x')).toBeNull();
    for (const [name, loop] of Object.entries({ ...LOOPS, ...STINGERS })) {
      for (const l of [loop, calmOf(loop)]) for (const ch of ['p1', 'p2', 'wave'] as const) {
        const toks = l[ch].trim().split(/\s+/); expect(toks.length % 16, `${name}.${ch}`).toBe(0);
        for (const t of toks) expect(t === '.' || t === '-' || midiOf(t) !== null, `${name}.${ch} ${t}`).toBe(true);
      }
      const d = loop.drums.trim().split(/\s+/); expect(d.length % 16, `${name}.drums`).toBe(0); for (const t of d) expect(['k', 's', 'h', '.'].includes(t), `${name} drum ${t}`).toBe(true);
      expect(loop.bpm).toBeGreaterThan(60); expect(loop.bpm).toBeLessThan(200); expect(parseChannel(loop.p1).some(Boolean), `${name} p1`).toBe(true); expect(parseChannel(calmOf(loop).p1).some(Boolean), `${name} calm p1`).toBe(true);
    }
  });
  it('every music slot has at least three candidates; the files exist, stay small and cite a source', () => {
    for (const slot of MUSIC_SLOTS) {
      const cs = MUSIC_CANDIDATES[slot]; expect(cs.length, slot).toBeGreaterThanOrEqual(3);
      expect(cs.filter(c => c.kind === 'tracker').length, slot).toBeGreaterThanOrEqual(2);
      expect(new Set(cs.map(c => c.id)).size, `${slot} ids unique`).toBe(cs.length);
      for (const f of cs) {
        if (f.kind !== 'file') continue;
        expect(f.id.startsWith(slot + '.'), f.id).toBe(true); expect(existsSync('public/' + f.file), f.file).toBe(true);
        expect(f.bytes, f.id).toBeLessThan(400_000); expect(/^https:\/\/(opengameart\.org|pixabay\.com)\//.test(f.url), f.url).toBe(true); expect(f.licence, f.id).toBeTruthy();
      }
    }
    expect(MUSIC_CANDIDATES.tetris.some(c => c.id === 'tetris.tracker.korobeiniki'), 'Pack-Tris gets our own Korobeiniki').toBe(true);
    expect(MUSIC_CANDIDATES.tetris.every(c => c.kind === 'tracker'), 'no downloaded Tetris theme ships').toBe(true);
  });
  it('the wind bed is declared with its CC-BY credit and the file is there', () => {
    expect(existsSync('public/' + AMBIENCE.wind.file)).toBe(true); expect(AMBIENCE.wind.licence).toContain('CC-BY'); expect(AMBIENCE.wind.author).toBeTruthy();
  });
  it('a city plays its own track when it has one, otherwise its region\'s', () => {
    expect(cityLoop('miami', 'northamerica')).toBe('miami');          /* Miami earned its own */
    expect(cityLoop('newyork', 'northamerica')).toBe('americas');
    expect(cityLoop('santiago', 'southamerica')).toBe('latam');
    expect(cityLoop(undefined, undefined)).toBe('americas');           /* never silence for want of a region */
    for (const c of CITIES) expect(musicById((selection.music as Record<string, string>)[cityLoop(c.id, c.region)]), c.id).toBeDefined();
  });
  it('selection.json resolves every slot to an existing candidate', () => {
    for (const name of SFX_NAMES) expect(sfxCandidateById(selection.sfx[name as keyof typeof selection.sfx]), name).toBeDefined();
    for (const slot of MUSIC_SLOTS) expect(musicById((selection.music as Record<string, string>)[slot]), slot).toBeDefined();
    expect(selection.gain.sfx).toBeGreaterThan(0); expect(selection.gain.music).toBeGreaterThan(0);
  });
});
