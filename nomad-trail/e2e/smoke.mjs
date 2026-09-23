// End-to-end smoke test: boots the built game in headless Chrome (local install), walks a run via the debug API, screenshots each scene.
// Usage: node e2e/smoke.mjs [baseUrl]   (default: http://localhost:4173/trail/ from `npm run preview`)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] || 'http://localhost:4173/trail/';
const out = 'e2e/shots'; fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const shot = async (name) => { await page.screenshot({ path: `${out}/${name}.png` }); console.log('shot', name); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
await page.goto(base, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => (window).__nomad && (window).__nomad.ready, { timeout: 30000 });
await shot('01-title');
// The integrator exposes window.__nomad = { game, scene(key), goto(key,data), state(), sim }
const step = async (js, name, wait = 800) => { await page.evaluate(js); await sleep(wait); if (name) await shot(name); };
await step(`window.__nomad.newRun('miami','east')`, '02-pack', 1200);
await step(`window.__nomad.autoPack('balanced')`, '03-packed', 800);
await step(`window.__nomad.depart()`, '04-route', 1200);
for (let i = 0; i < 6; i++) {
  await step(`window.__nomad.travelFirst()`, i === 0 ? '05-travel' : null, 3500);
  await step(`window.__nomad.dismissEvents()`, i === 0 ? '06-city' : null, 600);
  for (const a of ['explore', 'cook', 'train', 'rest', 'moveon']) {
    await step(`window.__nomad.act('${a}')`, null, 500);
    await step(`window.__nomad.finishMinigame(80)`, null, 400);
    await step(`window.__nomad.dismissEvents()`, null, 300);
  }
}
await shot('07-midrun');
const st = await page.evaluate(() => JSON.stringify(window.__nomad.state()).slice(0, 400));
console.log('state:', st);
// save/resume: reload and continue
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForFunction(() => (window).__nomad && (window).__nomad.ready, { timeout: 30000 });
const hasSave = await page.evaluate(() => !!window.__nomad.hasSave());
console.log('save survives reload:', hasSave);
await step(`window.__nomad.continueRun()`, '08-resumed', 1200);
await step(`window.__nomad.forceEnding('hospital')`, '09-end', 1200);
await step(`window.__nomad.goto('Share')`, '10-share', 2500);
await step(`window.__nomad.goto('Passport')`, '11-passport', 1200);
await step(`window.__nomad.goto('Coffee', { cityId: 'tokyo', day: 41 })`, '12-coffee', 2500);
for (const k of ['Cooking', 'Workout', 'CarryOn', 'Kite', 'Airport', 'Laundry']) {
  await step(`window.__nomad.minigame('${k}')`, `13-${k}`, 2200);
  await step(`window.__nomad.finishMinigame(60)`, null, 300);
}
console.log(errors.length ? `ERRORS (${errors.length}):\n` + errors.slice(0, 20).join('\n') : 'no page errors');
await browser.close();
process.exit(errors.length ? 1 : 0);
