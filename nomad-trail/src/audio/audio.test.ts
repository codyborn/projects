import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { SFX_NAMES, renderSamples, renderDef, SFX_CANDIDATES, sfxDefById, sfxCandidateById } from './sfx';
import { LOOPS, STINGERS, parseChannel, midiOf, MUSIC_CANDIDATES, MUSIC_SLOTS, musicById, calmOf } from './tracker';
import { AMBIENCE } from './synth';
import selection from './selection.json';

const TINY = ['wheel', 'tick', 'step', 'blip', 'tap', 'land', 'lock', 'reel', 'chop', 'crack'];
describe('audio: jsfxr presets and candidates', () => {
  it('every preset renders a finite, non-silent buffer under 3 s', () => {
    for (const name of SFX_NAMES) {
      const r = renderSamples(name);
      expect(r.samples.length, name).toBeGreaterThan(TINY.includes(name) ? 80 : 400);
      let peak = 0; for (let i = 0; i < r.samples.length; i++) { const v = Math.abs(r.samples[i]); expect(Number.isFinite(v), name).toBe(true); if (v > peak) peak = v; }
      expect(peak, name).toBeGreaterThan(0.05); expect(r.samples.length / r.sampleRate, name).toBeLessThan(3);
    }
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
  it('selection.json resolves every slot to an existing candidate', () => {
    for (const name of SFX_NAMES) expect(sfxCandidateById(selection.sfx[name as keyof typeof selection.sfx]), name).toBeDefined();
    for (const slot of MUSIC_SLOTS) expect(musicById((selection.music as Record<string, string>)[slot]), slot).toBeDefined();
    expect(selection.gain.sfx).toBeGreaterThan(0); expect(selection.gain.music).toBeGreaterThan(0);
  });
});
