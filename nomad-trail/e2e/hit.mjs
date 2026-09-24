// Regression: every quadrant of a Button must register a tap (Phaser Container hit areas are offset by displayOrigin).
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await pg.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready); await new Promise(r => setTimeout(r, 800));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = async (sceneKey, label) => {
  const bnd = await pg.evaluate((k, l) => { const sc = window.__nomad.game.scene.getScene(k); const o = sc.children.list.find(o => o.type === 'Container' && o.input && o.list?.some(c => (c.text ?? c._text) === l)); return o ? { x: o.x, y: o.y, w: o.input.hitArea.width, h: o.input.hitArea.height } : null; }, sceneKey, label);
  if (!bnd) return `${label}: not found`;
  const miss = [];
  for (const [fx, fy, tag] of [[-0.45, -0.4, 'TL'], [0.45, -0.4, 'TR'], [-0.45, 0.4, 'BL'], [0.45, 0.4, 'BR'], [0, 0.45, 'B'], [0, 0, 'C']]) {
    await pg.evaluate((k) => { const sc = window.__nomad.game.scene.getScene(k); window.__hits = 0; sc.children.list.filter(o => o.type === 'Container' && o.input).forEach(o => o.once('pointerdown', () => window.__hits++)); }, sceneKey);
    await pg.touchscreen.touchStart(bnd.x + fx * bnd.w, bnd.y + fy * bnd.h); await sleep(40); await pg.touchscreen.touchEnd(); await sleep(120);
    if (!(await pg.evaluate(() => window.__hits))) miss.push(tag);
    await pg.evaluate((k) => window.__nomad.goto(k), sceneKey); await sleep(400);
  }
  return `${label}: ${miss.length ? 'MISS ' + miss.join(',') : 'all 6 hit'}`;
};
const r1 = await check('Title', 'NEW RUN');
await pg.evaluate(() => { window.__nomad.newRun('orangecounty', 'east'); }); await sleep(700);
const r2 = await check('Pack', 'DEPART');
console.log(r1); console.log(r2); await b.close(); process.exit(r1.includes('MISS') || r2.includes('MISS') ? 1 : 0);
