/* Measures the tempo hook: the tracker's scheduled step interval and a file's playbackRate at several rates, plus the
 * reset when the loop changes. Needs `npx vite preview --port 4173`. Usage: node tools/check_music_rate.mjs */
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox','--autoplay-policy=no-user-gesture-required'], protocolTimeout: 600000 });
const p = await b.newPage(); await p.setViewport({ width: 360, height: 640 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await p.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2500)); await p.mouse.click(180, 300); await new Promise(r => setTimeout(r, 400));
const out = await p.evaluate(async () => {
  const A = window.__nomad.audio; A.init(); if (A.muted) A.setMuted(false);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rows = [];
  /* 1. tracker: Pack-Tris uses the Korobeiniki loop */
  A.playLoop('none'); await wait(800); A.playLoop('tetris'); await wait(2000);
  const base = A.rateInfo(); rows.push({ what: 'tracker rate 1.0', ...base });
  for (const r of [1.3, 1.6, 2.5, 0.1]) { A.setMusicRate(r); await wait(900); rows.push({ what: `tracker set ${r}`, ...A.rateInfo() }); }
  /* 2. the glide: sample right after the request */
  A.setMusicRate(1.0, 0); await wait(600); A.setMusicRate(1.6, 300);
  const mid = []; for (let i = 0; i < 5; i++) { await wait(75); mid.push(Number(A.rateInfo().trackerRate.toFixed(3))); }
  rows.push({ what: 'glide samples every 75 ms', glide: mid });
  /* 3. reset when another loop starts */
  A.setMusicRate(1.6, 0); await wait(300); const before = A.rateInfo().requested;
  A.playLoop('title'); await wait(1400);
  rows.push({ what: 'after switching to another loop', before, ...A.rateInfo() });
  /* 4. a file candidate: playbackRate should move instead */
  A.playLoop('none'); await wait(700); A.selection.music.tetris = 'tetris.tracker.korobeiniki';
  A.selection.music.action = 'action.oga.my-8bit-hero'; A.loop = 'none'; A.playLoop('action'); await wait(1800);
  rows.push({ what: 'file rate 1.0', ...A.rateInfo() });
  A.setMusicRate(1.6); await wait(900); rows.push({ what: 'file set 1.6', ...A.rateInfo() });
  A.playLoop('none');
  return rows;
});
for (const r of out) {
  if (r.glide) { console.log(`${r.what.padEnd(34)} ${r.glide.join(' -> ')}`); continue; }
  console.log(`${r.what.padEnd(34)} requested ${String(r.requested).padStart(5)}  trackerRate ${r.trackerRate.toFixed(3).padStart(6)}  stepMs ${r.trackerStepMs.toFixed(1).padStart(6)}  filePlaybackRate ${r.filePlaybackRate.toFixed(3)}`);
}
console.log('errors', errs.length ? errs.join(' | ') : 'none');
await b.close();
