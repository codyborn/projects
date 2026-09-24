// Pack flow: tap a card -> tile appears; tap tile -> removed; swipe tray vertically -> category changes; SURPRISE ME fills; DEPART edges tap.
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const fails = [];
const tap = async (x, y) => { await pg.touchscreen.touchStart(x, y); await sleep(40); await pg.touchscreen.touchEnd(); await sleep(350); };
const swipe = async (x0, y0, x1, y1) => { await pg.touchscreen.touchStart(x0, y0); for (let i = 1; i <= 8; i++) { await pg.touchscreen.touchMove(x0 + (x1 - x0) * i / 8, y0 + (y1 - y0) * i / 8); await sleep(16); } await pg.touchscreen.touchEnd(); await sleep(450); };
const st = () => pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Pack'); return { placed: sc.placed.length, cat: sc.cat, visible: sc.pages.map(p => p.visible) }; });
await pg.goto('http://localhost:4173/trail/', { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready); await sleep(600);
await pg.evaluate(() => window.__nomad.newRun('orangecounty', 'east')); await sleep(800);
let s0 = await st(); if (s0.placed !== 0) fails.push('expected empty grid');
// 1. tap the first card (Essentials page, card at x 12..172, y 374..624)
await tap(92, 480); let s1 = await st(); if (s1.placed !== 1) fails.push(`tap card -> placed ${s1.placed}`);
await pg.screenshot({ path: 'e2e/layout/pack-after-tap.png' });
// 2. tap the tile to remove it (tile at grid origin 84,56; first-fit puts it at 0,0)
const tile = await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Pack'); const p = sc.placed[0]; return p ? { x: p.obj.x, y: p.obj.y, w: p.obj.width, h: p.obj.height } : null; });
if (tile) { await tap(tile.x + tile.w - 4, tile.y + tile.h - 4); await sleep(400); } // bottom-right corner on purpose
let s2 = await st(); if (s2.placed !== 0) fails.push(`tap tile corner -> placed ${s2.placed}`);
// 3. swipe up on the tray -> next category
await swipe(180, 560, 180, 440); let s3 = await st(); if (s3.cat !== 1) fails.push(`swipe up -> cat ${s3.cat}`); await sleep(300); const v3 = (await st()).visible; if (v3.filter(Boolean).length !== 1 || !v3[1]) fails.push(`page visibility ${v3.join(',')}`);
await pg.screenshot({ path: 'e2e/layout/pack-clothes-page.png' });
// 4. horizontal scroll within the category should not change category
await swipe(300, 500, 120, 500); let s4 = await st(); if (s4.cat !== 1) fails.push(`h-swipe changed cat to ${s4.cat}`);
// 5. swipe down -> back to essentials
await swipe(180, 440, 180, 580); let s5 = await st(); if (s5.cat !== 0) fails.push(`swipe down -> cat ${s5.cat}`);
// 6. tap card on clothes page twice -> two weeks, different colors
await swipe(180, 560, 180, 440); await tap(92, 480); await tap(92, 480); const cl = await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Pack'); return sc.placed.map(p => p.id); }); if (cl.length !== 2 || cl[0] === cl[1]) fails.push(`clothes stack -> ${cl.join(',')}`);
// 7. SURPRISE ME (button center 196,26) then tile count > 3
await tap(196, 26); await sleep(1400); let s7 = await st(); if (s7.placed < 4) fails.push(`surprise -> placed ${s7.placed}`);
await pg.screenshot({ path: 'e2e/layout/pack-surprise.png' });
// 8. DEPART edge taps (button center 300,26, 100x40): bottom-right corner
await tap(345, 42); await sleep(700); const scenes = await pg.evaluate(() => window.__nomad.activeScenes()); if (!scenes.includes('Route') && !scenes.includes('Pack')) fails.push('depart lost scene'); if (scenes.includes('Pack')) { await tap(345, 42); await sleep(700); } const scenes2 = await pg.evaluate(() => window.__nomad.activeScenes()); if (!scenes2.includes('Route')) fails.push(`depart corner -> ${scenes2.join(',')}`);
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'pack flow ok'); console.log(errs.length ? 'ERRORS ' + errs.slice(0, 5).join(' | ') : 'no page errors');
await b.close(); process.exit(fails.length || errs.length ? 1 : 0);
