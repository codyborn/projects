// How the recipe grid scrolls. Input rate varies by device and the harness cannot reproduce a real finger exactly,
// so this measures the parts that are input-independent: the throw curve, the end stops, and the response to one step.
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] || 'http://localhost:4173/trail/';
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = []; const check = (n, ok, d) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`); if (!ok) fails.push(n); };
await pg.goto(base, { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready);
await pg.evaluate(() => { const k = 'nomadtrail.settings.v1'; const cur = JSON.parse(localStorage.getItem(k) || '{}');
  cur.career = { stamps: {}, dishes: Object.fromEntries(window.__nomad.review.dishes.slice(0, 24).map(d => [d.id, 70])) };
  localStorage.setItem(k, JSON.stringify(cur)); });
await pg.evaluate(() => window.__nomad.goto('Recipes', { back: 'Title' })); await sleep(900);

/** Run `setup`, then sample content.y once per rendered frame for `ms`. */
const trace = (setup, ms) => pg.evaluate(async ([fn, dur]) => {
  const sc = window.__nomad.game.scene.getScene('Recipes');
  const out = []; const on = () => out.push(+sc.content.y);
  // eslint-disable-next-line no-new-func
  new Function('sc', fn)(sc);
  sc.events.on('postupdate', on); await new Promise(r => setTimeout(r, dur)); sc.events.off('postupdate', on);
  return { ys: out, end: sc.scrollY, max: sc.maxScroll, vel: sc.vel };
}, [setup, ms]);

// 1. the throw: one exponential glide, no stalls, no reversals, and it comes to rest
{
  const r = await trace('sc.scrollY = 200; sc.aim = 200; sc.vel = 1200; sc.dragging = false;', 2400);
  const d = r.ys.map((y, i) => i ? y - r.ys[i - 1] : 0).slice(1);
  const fast = d.slice(0, d.findIndex(x => Math.abs(x) < 2));      /* while it is moving >2 px a frame, every frame should move */
  const stalls = fast.filter(x => x === 0).length, revs = d.filter((x, i) => i && x && d[i - 1] && Math.sign(x) !== Math.sign(d[i - 1])).length;
  check('a throw glides without stalling', stalls === 0, `${stalls} stalled frames in ${fast.length} fast frames`);
  check('a throw never jerks backwards', revs === 0, `${revs} reversals`);
  check('a throw decelerates and stops', Math.abs(fast[1]) > Math.abs(fast[fast.length - 1]) && r.vel === 0, `first ${Math.abs(fast[1]).toFixed(0)} px/f, last ${Math.abs(fast[fast.length - 1]).toFixed(0)} px/f over ${fast.length} frames, then at rest`);
  check('a throw carries a useful distance', Math.abs(r.ys[r.ys.length - 1] - r.ys[0]) > 400, `${Math.abs(r.ys[r.ys.length - 1] - r.ys[0]).toFixed(0)} px`);
}
// 2. the ends and the finger: a real touch, held, so the drag path is the one players use
{
  await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); sc.scrollY = 0; sc.aim = 0; sc.vel = 0; });
  await pg.touchscreen.touchStart(180, 300);
  await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); window.__t = []; window.__on = () => window.__t.push(+sc.scrollY); sc.events.on('postupdate', window.__on); });
  for (let i = 1; i <= 8; i++) { await pg.touchscreen.touchMove(180, 300 + i * 25); await sleep(20); }   // pull the list past the top
  await sleep(200);
  const over = await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); return sc.scrollY; });
  check('dragging past the top gives, with resistance', over < -40 && over > -130, `followed to ${over.toFixed(0)} px for a 200 px pull`);
  await pg.touchscreen.touchEnd(); await sleep(900);
  const r2 = await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); sc.events.off('postupdate', window.__on); return { end: sc.scrollY, ys: window.__t }; });
  check('and springs back to the stop', Math.abs(r2.end) < 0.5, `rest at ${r2.end.toFixed(2)}`);
  const tail = r2.ys.slice(r2.ys.findIndex(v => v < -30));
  const td = tail.map((y, i) => i ? y - tail[i - 1] : 0).slice(1).filter(x => Math.abs(x) > 0.05);
  const signs = new Set(td.map(Math.sign));
  check('the spring back does not overshoot', !(signs.has(1) && signs.has(-1)) || td.filter((x, i) => i && Math.sign(x) !== Math.sign(td[i - 1])).length <= 1, `${td.length} frames`);
}
{
  const r = await trace(`sc.scrollY = sc.maxScroll; sc.aim = sc.maxScroll; sc.vel = 1500; sc.dragging = false;`, 1200);
  check('a throw off the bottom end is caught and settles', Math.abs(r.end - r.max) < 0.5, `rest at ${(r.end - r.max).toFixed(2)} past the end`);
}
// 3. one finger step, held: the list covers it over a few frames rather than teleporting or crawling
{
  await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); sc.scrollY = 300; sc.aim = 300; sc.vel = 0; });
  await pg.touchscreen.touchStart(180, 400);
  await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); window.__t2 = []; window.__on2 = () => window.__t2.push(+sc.scrollY); sc.events.on('postupdate', window.__on2); });
  await pg.touchscreen.touchMove(180, 376); await sleep(260);
  const r = await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Recipes'); sc.events.off('postupdate', window.__on2); return { ys: window.__t2, end: sc.scrollY, aim: sc.aim }; });
  await pg.touchscreen.touchEnd(); await sleep(200);
  const base = r.ys[0]; const d = r.ys.map((y, i) => i ? y - r.ys[i - 1] : 0).slice(1).filter(x => x !== 0);
  check('a 24 px finger step is covered smoothly', d.length >= 3 && d[0] < 16 && Math.abs(r.end - r.aim) < 0.6,
    `${d.length} frames, first ${d[0]?.toFixed(1)} px, lands on the finger at ${r.end.toFixed(1)}`);
}
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await b.close();
process.exit(fails.length || errs.length ? 1 : 0);
