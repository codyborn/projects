// Behaviour checks against `npm run preview` — the things unit tests cannot see:
//   - the gate dash runs before the vehicle moves, and the flight follows it
//   - the craft leaves the frame and stays gone (no loop)
//   - BACK on a workout's READY card actually backs out (the tap-anywhere starter used to eat it)
//   - City Run: standing still costs nothing, one crossing wins
//   - the museum line names the city's museum
//   - a fresh title screen has no PASSPORT / RECIPES
//   - the casino has its own button where there is a casino, sharing the slot with the drone and the handheld
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] || 'http://localhost:4173/trail/';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = [];
const check = (name, ok, detail) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`); if (!ok) fails.push(name); };

await page.goto(base, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.__nomad?.ready, { timeout: 30000 });

const labels = await page.evaluate(() => window.__nomad.game.scene.getScene('Title').children.list
  .flatMap(o => (o.type === 'Container' ? o.list : [o])).map(o => o.text).filter(t => typeof t === 'string'));
check('fresh title has no PASSPORT / RECIPES', !labels.includes('PASSPORT') && !labels.includes('RECIPES'), labels.filter(t => /^[A-Z][A-Z ·0-9]+$/.test(t)).join(','));

await page.evaluate(() => window.__nomad.newRun('orangecounty', 'east')); await sleep(600);
await page.evaluate(() => window.__nomad.autoPack('balanced')); await sleep(400);
await page.evaluate(() => window.__nomad.depart()); await sleep(800);
// force the taxi breakdown so the dash is guaranteed
await page.evaluate(() => { const sim = window.__nomad.sim, orig = sim.travelTo;
  sim.travelTo = (s, to) => { const r = orig(s, to); r.state.pendingGate = 'C21'; return { ...r, minigame: { key: 'Airport', payload: { gate: 'C21' }, difficulty: 0.4 } }; }; });
const during = await page.evaluate(async () => { const n = window.__nomad; n.travelFirst(); const log = [];
  for (let i = 0; i < 12; i++) { await new Promise(r => setTimeout(r, 150)); const t = n.game.scene.getScene('Travel');
    log.push({ scenes: n.activeScenes().join('+'), x: t?.craft ? Math.round(t.craft.x) : null, moving: !!t?.moving }); } return log; });
check('gate dash comes up before the craft moves', during.every(s => s.scenes === 'Airport' && !s.moving), `craft parked at x=${during[0].x}`);
const after = await page.evaluate(async () => { const n = window.__nomad; n.finishMinigame(80); const xs = [];
  for (let i = 0; i < 24; i++) { await new Promise(r => setTimeout(r, 200)); const t = n.game.scene.getScene('Travel'); xs.push(t?.craft ? Math.round(t.craft.x) : null); }
  return { xs, scenes: n.activeScenes() }; });
check('the flight follows the dash and leaves the frame', Math.max(...after.xs) > 380 && after.scenes.some(k => k === 'City' || k === 'Event'), `x ${after.xs[0]} -> ${Math.max(...after.xs)}, ${after.scenes.join('+')}`);
check('the craft does not loop back', after.xs.slice(-6).every(x => x > 380), after.xs.slice(-3).join(','));

await page.evaluate(() => window.__nomad.minigame('Workout', { activity: 'bands', city: 'Lisbon', day: 3 })); await sleep(1200);
const geom = await page.evaluate(() => { const c = document.querySelector('canvas').getBoundingClientRect(); return { x: c.x, y: c.y, w: c.width, h: c.height }; });
await page.touchscreen.tap(geom.x + (88 / 360) * geom.w, geom.y + (446 / 640) * geom.h); await sleep(800);
const backed = await page.evaluate(() => ({ scenes: window.__nomad.activeScenes(), last: window.__nomad.lastResult }));
check('BACK cancels the workout', !backed.scenes.includes('Workout') && backed.last?.cancelled === true, JSON.stringify(backed.last));

await page.evaluate(() => window.__nomad.minigame('Workout', { activity: 'bands', city: 'Lisbon', day: 3, plan: ['cityrun'] })); await sleep(900);
const cr = await page.evaluate(async () => { const s = window.__nomad.game.scene.getScene('Workout');
  s.frame.ready(); await new Promise(r => setTimeout(r, 900)); const m = s.current; if (!m) return { err: 'no micro' };
  await new Promise(r => setTimeout(r, 11000));                       // past the old 9 s crossing clock
  const idle = m.lives;
  m.row = 1; m.inv = 99; m.act('up'); await new Promise(r => setTimeout(r, 1500));
  return { idle, crossings: m.crossings, lives: m.lives, ended: m.ended, score: Math.round(m.scoreNow() * 100) }; });
check('City Run: standing still costs nothing', cr.idle === 3, `lives ${cr.idle}`);
check('City Run: one crossing wins it', cr.crossings === 1 && cr.ended && cr.score === 100, `score ${cr.score}`);

const museum = await page.evaluate(async () => { const st = window.__nomad.state(); st.cityId = 'tokyo'; st.phase = 'city';
  window.__nomad.game.registry.set('run', st); window.__nomad.goto('Event', { eventId: 'museum', onDone: () => {} });
  await new Promise(r => setTimeout(r, 3200));
  return window.__nomad.game.scene.getScene('Event').children.list.filter(o => typeof o.text === 'string' && o.text.length > 20).map(o => o.text).join(' // '); });
check('the museum line names the museum', museum.includes('the Ghibli Museum'), museum.slice(0, 60) + '…');

// the evening slot: drone, handheld and casino share it, and only casino towns offer the tables
const inCity = async (city, extras) => {
  await page.evaluate(([c, ex]) => { const n = window.__nomad; n.newRun('orangecounty', 'east'); n.autoPack('balanced');
    const s = n.state(); s.cityId = c; s.phase = 'city'; s.money = 3000;
    s.items = s.items.filter(i => i.id !== 'dronekit' && i.id !== 'switch');
    if (ex) s.items.push({ id: 'dronekit', x: 0, y: 0, container: 'checked' }, { id: 'switch', x: 0, y: 0, container: 'checked' });
    n.game.registry.set('run', s); n.goto('City'); }, [city, extras]);
  await sleep(900);
  return page.evaluate(() => { const sc = window.__nomad.game.scene.getScene('City');
    const slot = sc.btns.map((b, i) => ({ a: sc.btnActs[i], x: b.x, w: b.w })).filter(b => ['drone', 'console', 'casino', 'map'].includes(b.a));
    return { acts: sc.btnActs, slot }; });
};
const vegas3 = await inCity('lasvegas', true);
check('Vegas offers drone, handheld and casino in one slot', ['drone', 'console', 'casino'].every(a => vegas3.acts.includes(a)), vegas3.acts.join(','));
check('the three share the slot without overlapping', vegas3.slot.every((b, i, all) => i === 0 || b.x - b.w / 2 >= all[i - 1].x + all[i - 1].w / 2 - 1),
  vegas3.slot.map(b => `${b.a}@${Math.round(b.x)}`).join(' '));
const vegas1 = await inCity('lasvegas', false);
check('with nothing packed the casino takes the whole slot', vegas1.acts.includes('casino') && !vegas1.acts.includes('map'), vegas1.acts.join(','));
const tokyo = await inCity('tokyo', true);
check('a town without a casino does not offer one', !tokyo.acts.includes('casino'), tokyo.acts.join(','));
await inCity('lasvegas', true);
await page.evaluate(() => window.__nomad.act('casino')); await sleep(1800);
check('the button opens the tables', (await page.evaluate(() => window.__nomad.activeScenes())).includes('Casino'));

// wood chop, rebuilt top-down in round 100: a chop on the line still splits the round
{
  const r = await page.evaluate(async () => {
    const n = window.__nomad; n.minigame('Workout', { activity: 'hike', city: 'Bozeman', day: 3, plan: ['woodchop'] });
    await new Promise(r => setTimeout(r, 900)); const sc = n.game.scene.getScene('Workout'); sc.frame.ready();
    await new Promise(r => setTimeout(r, 700)); const m = sc.current; if (!m) return null;
    let swept = 0;
    for (let i = 0; i < 700; i++) { await new Promise(r => setTimeout(r, 16)); const h = m.hint();
      swept = Math.max(swept, h.absDeg); if (h.phase === 'swing' && h.absDeg < 3) { m.chop(); break; } }
    await new Promise(r => setTimeout(r, 300)); const h = m.hint();
    return { clean: h.clean, swept: Math.round(swept) };
  });
  check('wood chop: the axe sweeps and a chop on the line splits the round', r && r.clean === 1 && r.swept > 20, r ? `clean ${r.clean}, swept ${r.swept} deg` : 'no micro');
}

console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await browser.close();
process.exit(fails.length || errs.length ? 1 : 0);
