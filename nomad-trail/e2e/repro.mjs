// Deterministic repro against the dev server (unminified stacks). Usage: node e2e/repro.mjs <seed>
import puppeteer from 'puppeteer-core';
const seed = Number(process.argv[2] || 87539);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage(); await page.setViewport({ width: 360, height: 640 });
const errors = []; page.on('pageerror', e => errors.push(e.message + '\n' + String(e.stack || '').split('\n').slice(1, 7).join('\n')));
const sleep = ms => new Promise(r => setTimeout(r, ms));
await page.goto('http://localhost:5173/trail/', { waitUntil: 'networkidle0' }); await page.waitForFunction(() => window.__nomad?.ready, { timeout: 30000 }); await sleep(800);
const settle = async (max = 12) => { for (let i = 0; i < max; i++) { const st = await page.evaluate(() => { const n = window.__nomad; const act = n.activeScenes(); if (act.includes('Event')) { n.dismissEvents(); return 'event'; } if (act.includes('Coffee')) { n.finishMinigame(0); return 'coffee'; } const mg = ['Cooking','Workout','CarryOn','Kite','Airport','Laundry'].find(k => act.includes(k)); if (mg) { n.finishMinigame(80); return mg; } if (act.includes('Travel')) return 'travel'; const c = n.game.scene.getScene('City'); if (act.includes('City') && c && c.busy) return 'busy'; return 'idle'; }); if (st === 'idle') return; await sleep(st === 'travel' ? 1200 : 700); } };
const trace = async (tag) => { const t = await page.evaluate(() => { const s = window.__nomad.state(); return `d${s.day} h${Math.round(s.health)} ${s.cityId} [${window.__nomad.activeScenes().join(',')}]`; }); console.log(tag.padEnd(22), t); if (errors.length) { console.log('FIRST ERROR:\n' + errors[0]); return true; } return false; };
await page.evaluate((seed) => window.__nomad.newRun('miami', 'east', seed), seed); await sleep(600);
await page.evaluate(() => window.__nomad.autoPack('balanced')); await sleep(300); await page.evaluate(() => window.__nomad.depart()); await sleep(600);
outer: for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.__nomad.travelFirst()); await sleep(3500); await settle(); if (await trace(`travel ${i}`)) break;
  for (const a of ['explore', 'cook', 'train', 'rest', 'work', 'laundry', 'explore', 'cook', 'moveon']) {
    await page.evaluate((a) => window.__nomad.act(a), a); await sleep(700); await settle(); if (await trace(`  ${a}`)) break outer;
    if (await page.evaluate(() => window.__nomad.activeScenes().includes('End'))) { console.log('ended'); break outer; }
  }
}
console.log(errors.length ? `ERRORS ${errors.length}` : 'no errors'); await b.close();
