// Layout check at exactly 360x640 @1x so screenshot pixels == game pixels.
import puppeteer from 'puppeteer-core'; import fs from 'node:fs';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
fs.mkdirSync('e2e/layout', { recursive: true }); const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = n => pg.screenshot({ path: `e2e/layout/${n}.png` });
const page = pg;
// Clear every modal (events, coffee, finished mini-games) until City or End or Route is the active scene and City is idle.
const settle = async (max = 12) => {
  for (let i = 0; i < max; i++) {
    const st = await page.evaluate(() => {
      const n = window.__nomad; const act = n.activeScenes();
      if (act.includes('Event')) { n.dismissEvents(); return 'event'; }
      if (act.includes('Coffee')) { n.finishMinigame(0); return 'coffee'; }
      const mg = ['Cooking','Workout','CarryOn','Kite','Airport','Laundry'].find(k => act.includes(k)); if (mg) { n.finishMinigame(80); return mg; }
      if (act.includes('Travel')) return 'travel';
      const c = n.game.scene.getScene('City'); if (act.includes('City') && c && c.busy) return 'busy';
      return 'idle';
    });
    if (st === 'idle') return; await sleep(st === 'travel' ? 1200 : 700);
  }
};

await pg.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready); await sleep(1200); await shot('title');
await pg.evaluate(() => window.__nomad.newRun('orangecounty', 'east')); await sleep(900); await pg.evaluate(() => window.__nomad.autoPack('balanced')); await sleep(600); await pg.evaluate(() => window.__nomad.goto('Pack')); await sleep(900); await shot('pack');
await pg.evaluate(() => window.__nomad.depart()); await sleep(1200); await shot('route');
await pg.evaluate(() => window.__nomad.travelFirst()); await sleep(3600); await shot('travel-event'); await settle(); await sleep(400); await shot('city-arrival');
await pg.evaluate(() => { const c = window.__nomad.game.scene.getScene('City'); c.children.list.filter(o => o.type === 'Container' || o.type === 'Rectangle').length; }); 
await pg.touchscreen.tap(180, 410); await sleep(600); await settle(); await shot('city');
await pg.evaluate(() => window.__nomad.act('cook')); await sleep(1800); await shot('cooking');
await settle(); await sleep(300); await shot('city-after-cook');
await pg.evaluate(() => window.__nomad.act('train')); await sleep(1800); await shot('workout'); await settle();
await pg.evaluate(() => window.__nomad.act('rest')); await sleep(1500); await shot('rest'); await settle();
await pg.evaluate(() => window.__nomad.act('work')); await sleep(1200); await settle(); await shot('after-workweek');
console.log('state', await pg.evaluate(() => { const s = window.__nomad.state(); return `d${s.day} h${s.health} e${s.energy} m${s.mood}`; }));
await pg.evaluate(() => window.__nomad.forceEnding('hospital')); await sleep(1200); await shot('end');
await pg.evaluate(() => window.__nomad.goto('Passport')); await sleep(1200); await shot('passport');
await pg.evaluate(() => window.__nomad.minigame('CarryOn')); await sleep(2500); await shot('carryon');
console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors'); await b.close();
