/* Measures music candidates on the real game music bus with an AnalyserNode, at unity bus gain so each number is the
 * candidate's own level rather than the mix. Writes /tmp/music_levels.json.
 * Needs `npx vite preview --port 4173` running. Usage: node tools/measure_music.mjs [all|tracker] */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const MODE = process.argv[2] || 'tracker';
const REF_FILES = 10;   /* enough shipped tracks to pin the reference average; they are all within 0.3 LUFS anyway */
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'], protocolTimeout: 600000 });
const p = await b.newPage(); await p.setViewport({ width: 360, height: 640 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await p.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2500)); await p.mouse.click(180, 300); await new Promise(r => setTimeout(r, 400));
await p.evaluate(() => {
  const A = window.__nomad.audio; A.init(); if (A.muted) A.setMuted(false);
  A.musicGain.gain.cancelScheduledValues(A.ctx.currentTime); A.musicGain.gain.value = 1;
  window.__an = A.ctx.createAnalyser(); window.__an.fftSize = 2048; A.musicGain.connect(window.__an);
});
const plan = await p.evaluate(() => {
  const M = window.__nomad.music; const out = [];
  for (const slot of M.slots) for (const c of M.candidates[slot]) out.push({ slot, id: c.id, kind: c.kind });
  return out;
});
const seenFiles = new Set();
const todo = plan.filter(c => MODE === 'all' || c.kind === 'tracker' || (seenFiles.size < REF_FILES && !seenFiles.has(c.id) && (seenFiles.add(c.id), true)));
const rows = [];
for (const c of todo) {
  const r = await p.evaluate(async ({ slot, id }) => {
    const A = window.__nomad.audio, an = window.__an, buf = new Float32Array(an.fftSize);
    const sting = slot.endsWith('Sting');
    A.playLoop('none'); await new Promise(r => setTimeout(r, sting ? 450 : 800));
    A.selection.music[slot] = id; A.loop = 'none';
    A.musicGain.gain.cancelScheduledValues(A.ctx.currentTime); A.musicGain.gain.value = 1;
    A.playLoop(slot);
    await new Promise(r => setTimeout(r, sting ? 800 : 1800));       /* 600 ms crossfade, then settle */
    let peak = 0, sum = 0, n = 0; const t0 = performance.now(); const win = sting ? 1400 : 3000;
    while (performance.now() - t0 < win) {
      an.getFloatTimeDomainData(buf);
      for (let i = 0; i < buf.length; i++) { const v = Math.abs(buf[i]); if (v > peak) peak = v; sum += buf[i] * buf[i]; n++; }
      await new Promise(r => setTimeout(r, 16));
    }
    A.musicGain.gain.value = 1;
    return { rms: 20 * Math.log10(Math.sqrt(sum / n) || 1e-9), peak: 20 * Math.log10(peak || 1e-9) };
  }, c);
  rows.push({ ...c, ...r });
  console.log(`${c.id.padEnd(44)} ${c.kind.padEnd(8)} rms ${r.rms.toFixed(1).padStart(7)}  peak ${r.peak.toFixed(1).padStart(7)}`);
}
await p.evaluate(() => window.__nomad.audio.playLoop('none'));
fs.writeFileSync('/tmp/music_levels.json', JSON.stringify(rows, null, 1));
console.log('measured', rows.length, 'candidates; errors:', errs.length ? errs.join(' | ') : 'none');
await b.close();
