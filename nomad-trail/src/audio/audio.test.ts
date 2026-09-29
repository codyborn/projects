import { describe, it, expect } from 'vitest';
import { SFX_NAMES, renderSamples } from './sfx';
import { LOOPS, STINGERS, parseChannel, midiOf } from './tracker';

describe('audio: jsfxr presets', () => {
  it('every preset renders a non-empty, finite, non-silent buffer', () => {
    for (const name of SFX_NAMES) {
      const r = renderSamples(name);
      expect(r.samples.length, name).toBeGreaterThan(['wheel', 'tick', 'step', 'blip', 'tap'].includes(name) ? 80 : 400);   /* clicks are meant to be tiny */
      let peak = 0; for (let i = 0; i < r.samples.length; i++) { const v = Math.abs(r.samples[i]); expect(Number.isFinite(v), name).toBe(true); if (v > peak) peak = v; }
      expect(peak, name).toBeGreaterThan(0.05);
      expect(r.samples.length / r.sampleRate, name + ' under 3 s').toBeLessThan(3);
    }
  });
});
describe('audio: tracker loops', () => {
  it('notes parse and every loop is whole bars of 16 steps with valid tokens', () => {
    expect(midiOf('C4')).toBe(60); expect(midiOf('A4')).toBe(69); expect(midiOf('F#3')).toBe(54); expect(midiOf('Bb3')).toBe(58); expect(midiOf('x')).toBeNull();
    for (const [name, loop] of Object.entries({ ...LOOPS, ...STINGERS })) {
      for (const ch of ['p1', 'p2', 'wave'] as const) {
        const toks = loop[ch].trim().split(/\s+/); expect(toks.length % 16, `${name}.${ch} length ${toks.length}`).toBe(0);
        for (const t of toks) expect(t === '.' || t === '-' || midiOf(t) !== null, `${name}.${ch} token ${t}`).toBe(true);
        const ev = parseChannel(loop[ch]); expect(ev.length).toBe(toks.length);
      }
      const d = loop.drums.trim().split(/\s+/); expect(d.length % 16, `${name}.drums`).toBe(0); for (const t of d) expect(['k', 's', 'h', '.'].includes(t), `${name} drum ${t}`).toBe(true);
      expect(loop.bpm).toBeGreaterThan(60); expect(loop.bpm).toBeLessThan(200);
      expect(parseChannel(loop.p1).some(Boolean), `${name} p1 has notes`).toBe(true);
    }
  });
});
