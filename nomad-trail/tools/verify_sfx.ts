import { SFX_NAMES, PRESETS, SFX_TRIM, bandOf, type SfxName } from '../src/audio/sfx';
import { measureAvg } from './measure_sfx';
const rows = SFX_NAMES.map((n: SfxName) => { const m = measureAvg(PRESETS[n], 9); const g = 20 * Math.log10(SFX_TRIM[n]); return { n, rms: m.rmsDb + g, peak: m.peakDb + g, band: bandOf(n), off: m.rmsDb + g - bandOf(n) }; });
rows.sort((a, b) => a.band - b.band || a.n.localeCompare(b.n));
for (const r of rows) console.log(`${r.n.padEnd(10)} band ${String(r.band).padStart(3)}  rms ${r.rms.toFixed(1).padStart(6)}  off ${r.off.toFixed(1).padStart(5)}  peak ${r.peak.toFixed(1).padStart(6)}`);
const bad = rows.filter(r => Math.abs(r.off) > 2 || r.peak > -1);
console.log('spread of the normal band:', (() => { const v = rows.filter(r => r.band === -17).map(r => r.rms); return (Math.max(...v) - Math.min(...v)).toFixed(1); })(), 'dB');
console.log(bad.length ? 'OUT OF BAND: ' + bad.map(r => `${r.n}(${r.off.toFixed(1)}, peak ${r.peak.toFixed(1)})`).join(', ') : 'all inside their band');
