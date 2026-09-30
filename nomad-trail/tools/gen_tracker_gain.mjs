/* Turns /tmp/music_levels.json (from tools/measure_music.mjs) into src/audio/tracker_levels.json: for every tracker
 * candidate, its measured level on the music bus at unity and the gain that lifts it to the shipped files' average.
 * Korobeiniki sits at the top of the band because it is the Pack-Tris theme. */
import fs from 'node:fs';
const rows = JSON.parse(fs.readFileSync('/tmp/music_levels.json', 'utf8'));
const files = rows.filter(r => r.kind === 'file'), tracks = rows.filter(r => r.kind === 'tracker');
if (!files.length || !tracks.length) throw new Error('need both file and tracker measurements');
const REF = files.reduce((a, r) => a + r.rms, 0) / files.length;   /* the shipped files are all -19.0 LUFS; this is that level on the bus */
const TOP = { 'tetris.tracker.korobeiniki': 1.0 };                  /* dB above the reference */
const out = {};
for (const t of tracks) {
  const want = REF + (TOP[t.id] ?? 0);
  let db = want - t.rms;
  const headroom = -1 - t.peak; if (db > headroom) db = headroom;   /* never let a boosted loop peak above -1 dBFS at unity */
  out[t.id] = { rms: Math.round(t.rms * 10) / 10, gain: Math.round(Math.pow(10, db / 20) * 1000) / 1000 };
}
const doc = { reference: Math.round(REF * 10) / 10, note: 'rms is the candidate measured on the music bus at unity gain (tools/measure_music.mjs); gain lifts it to the reference, which is the shipped files average measured the same way. tetris.tracker.korobeiniki sits 1 dB above.', candidates: out };
fs.writeFileSync('src/audio/tracker_levels.json', JSON.stringify(doc, null, 1) + '\n');
const eff = tracks.map(t => t.rms + 20 * Math.log10(out[t.id].gain));
console.log(`reference (file average on the bus): ${REF.toFixed(1)} dBFS from ${files.length} files`);
console.log(`tracker levels before: ${Math.min(...tracks.map(t => t.rms)).toFixed(1)} .. ${Math.max(...tracks.map(t => t.rms)).toFixed(1)} dBFS`);
console.log(`predicted after:       ${Math.min(...eff).toFixed(1)} .. ${Math.max(...eff).toFixed(1)} dBFS`);
console.log(`gains ${Math.min(...Object.values(out).map(o => o.gain)).toFixed(2)}x .. ${Math.max(...Object.values(out).map(o => o.gain)).toFixed(2)}x; korobeiniki ${out['tetris.tracker.korobeiniki']?.gain}x`);
