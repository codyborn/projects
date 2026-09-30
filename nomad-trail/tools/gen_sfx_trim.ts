/* Regenerates the SFX_TRIM table in src/audio/sfx.ts: a per-preset gain so every effect sits in its loudness band.
 * Bands (RMS over the sounding part): quiet repeaters -23 dBFS, normal effects -17, big one-offs -15. Run with tsx. */
import { writeFileSync, readFileSync } from 'node:fs';
import { SFX_NAMES, renderDef, PRESETS, QUIET_SFX, LOUD_SFX, SFX_BANDS, type SfxName } from '../src/audio/sfx';
import { measureAvg } from './measure_sfx';
const target = (n: SfxName) => (QUIET_SFX.has(n) ? SFX_BANDS.quiet : LOUD_SFX.has(n) ? SFX_BANDS.loud : SFX_BANDS.normal);
const trims: Record<string, number> = {};
for (const n of SFX_NAMES) {
  const m = measureAvg(PRESETS[n], 9);
  let db = target(n) - m.rmsDb;
  const headroom = -1 - m.peakDb; if (db > headroom) db = headroom;   /* never push a peak above -1 dBFS */
  trims[n] = Math.round(Math.pow(10, db / 20) * 1000) / 1000;
}
const body = '/* SFX_TRIM starts */\nexport const SFX_TRIM: Record<SfxName, number> = {\n' +
  SFX_NAMES.map(n => `  ${n}: ${trims[n]},`).join('\n') + '\n};\n/* SFX_TRIM ends */';
const p = 'src/audio/sfx.ts'; const src = readFileSync(p, 'utf8');
const start = src.indexOf('/* SFX_TRIM starts */'); const end = src.indexOf('/* SFX_TRIM ends */') + '/* SFX_TRIM ends */'.length;
if (start < 0 || end < start) throw new Error('SFX_TRIM sentinels missing in src/audio/sfx.ts');
writeFileSync(p, src.slice(0, start) + body + src.slice(end));
console.log(Object.entries(trims).map(([k, v]) => `${k}:${v}`).join(' '));
