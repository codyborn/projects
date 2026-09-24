import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640 });
let errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready); await new Promise(r => setTimeout(r, 800));
const ids = await pg.evaluate(() => window.__nomad.game.registry.get('cities').map(c => c.id));
const bad = [];
for (const id of ids) {
  errs = [];
  const r = await pg.evaluate((id) => { try { const sc = window.__nomad.game.scene.getScene('Title'); const sk = window.__nomadArt.skyline(sc, id, 0, 86, 360, 150); for (let i = 0; i < 5; i++) sk.update(16); sk.destroy?.(); return 'ok'; } catch (e) { return 'THROW ' + e.message; } }, id);
  await new Promise(r => setTimeout(r, 120));
  if (r !== 'ok' || errs.length) bad.push(`${id}: ${r} ${errs.join(' | ')}`);
}
console.log('cities tested', ids.length, 'bad:', bad.length); bad.forEach(l => console.log(' ', l));
// also the Travel scene per transport
for (const tr of ['flight','train','bus','ferry','campervan','trek','car']) {
  errs = [];
  await pg.evaluate((tr) => { const n = window.__nomad; n.newRun('orangecounty','east'); n.autoPack('balanced'); n.depart(); const s = n.state(); n.goto('Travel', { leg: { to: 'newyork', transport: tr, days: 1, energy: 10, timezones: 0 } }); }, tr);
  await new Promise(r => setTimeout(r, 3500));
  const act = await pg.evaluate(() => window.__nomad.activeScenes());
  console.log('transport', tr, '->', act.join(','), errs.length ? 'ERR ' + errs.join(' | ') : '');
}
await b.close();
