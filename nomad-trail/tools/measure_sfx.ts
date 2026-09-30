/* Measures the jsfxr presets: peak and RMS over the sounding part, in dBFS. `npx tsx tools/measure_sfx.ts` prints the table. */
import { SFX_NAMES, renderDef, PRESETS, type Def, type SfxName } from '../src/audio/sfx';

export function measure(samples: Float32Array) {
  let peak = 0; for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const gate = Math.max(peak * 0.02, 1e-4); let sum = 0, n = 0;
  for (let i = 0; i < samples.length; i++) { const v = samples[i]; if (Math.abs(v) >= gate) { sum += v * v; n++; } }
  const rms = n ? Math.sqrt(sum / n) : 0;
  return { peak, rms, peakDb: 20 * Math.log10(peak || 1e-9), rmsDb: 20 * Math.log10(rms || 1e-9), sounding: n };
}

/** jsfxr re-randomises its noise table on every render, so noise presets need the average of several passes. */
export function measureAvg(def: Def, passes = 7) {
  let rms = 0, peak = 0;
  for (let i = 0; i < passes; i++) { const m = measure(renderDef(def).samples); rms += m.rms; peak = Math.max(peak, m.peak); }
  rms /= passes;
  return { rms, peak, rmsDb: 20 * Math.log10(rms || 1e-9), peakDb: 20 * Math.log10(peak || 1e-9) };
}

if (process.argv[1]?.endsWith('measure_sfx.ts')) {
  const rows = SFX_NAMES.map((n: SfxName) => ({ n, ...measureAvg(PRESETS[n], 9) }));
  rows.sort((a, b) => b.rmsDb - a.rmsDb);
  for (const r of rows) console.log(`${r.n.padEnd(10)} rms ${r.rmsDb.toFixed(1).padStart(6)} dBFS  peak ${r.peakDb.toFixed(1).padStart(6)}`);
  const v = rows.map(r => r.rmsDb).sort((a, b) => a - b);
  console.log(`spread ${(v[v.length - 1] - v[0]).toFixed(1)} dB  median ${v[Math.floor(v.length / 2)].toFixed(1)}`);
}
