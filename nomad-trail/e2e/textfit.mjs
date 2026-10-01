// Does every line of text fit? Walks each scene's display list and checks every label against
//   (a) the 360x640 screen, and
//   (b) the panel behind it, when that panel tagged itself with __rect (Panel, panel(), the city plate).
// Scenes are visited with the longest content the game can produce (the longest city name, a long dish, etc).
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] || 'http://localhost:4173/trail/';
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
const sleep = ms => new Promise(r => setTimeout(r, ms));

await pg.goto(base, { waitUntil: 'networkidle0' });
await pg.waitForFunction(() => window.__nomad?.ready);

await pg.evaluate(() => {
  window.__fit = (sceneKeys) => {
    const n = window.__nomad, W = 360, H = 640, out = [];
    const walk = (list, ox, oy, acc, depth) => {
      for (const o of list) {
        const d = o.depth || depth;
        if (o.__rect) acc.push({ x: ox + o.x + o.__rect.x, y: oy + o.y + o.__rect.y, w: o.__rect.w, h: o.__rect.h, depth: d });
        if (o.type === 'Container') walk(o.list, ox + o.x, oy + o.y, acc, d);
      }
      return acc;
    };
    const texts = (list, ox, oy, acc, nested) => {
      for (const o of list) {
        if (o.type === 'Container') { texts(o.list, ox + o.x, oy + o.y, acc, true); continue; }
        const t = o.text;
        if (typeof t !== 'string' || !t.trim() || !o.visible || o.alpha < 0.05) continue;
        const w = o.width * (o.scaleX ?? 1), h = o.height * (o.scaleY ?? 1);
        const left = ox + o.x - w * (o.originX ?? 0), top = oy + o.y - h * (o.originY ?? 0);
        acc.push({ t, left, top, right: left + w, bottom: top + h, depth: o.depth, nested });
      }
      return acc;
    };
    for (const key of sceneKeys) {
      const sc = n.game.scene.getScene(key);
      if (!sc || !n.game.scene.isVisible(key)) continue;
      const rects = walk(sc.children.list, 0, 0, [], 0);
      for (const L of texts(sc.children.list, 0, 0, [], false)) {
        /* a label inside a container may be scrolled off on purpose (the Pack tray, the Recipes grid): only loose labels are held to the screen */
        if (!L.nested && (L.left < -1 || L.right > W + 1)) out.push({ scene: key, text: L.t.slice(0, 44), why: 'off screen', box: [Math.round(L.left), Math.round(L.right)] });
        /* the panel a label belongs to: of the tagged rects under its middle, the one drawn closest beneath it */
        const mx = (L.left + L.right) / 2, my = (L.top + L.bottom) / 2;
        const host = rects.filter(r => my >= r.y && my <= r.y + r.h && mx >= r.x && mx <= r.x + r.w && (r.depth ?? 0) <= (L.depth ?? 0))
                          .sort((a, c) => (c.depth ?? 0) - (a.depth ?? 0) || a.w * a.h - c.w * c.h)[0];
        if (host && (L.left < host.x - 1 || L.right > host.x + host.w + 1))
          out.push({ scene: key, text: L.t.slice(0, 44), why: 'spills its panel', box: [Math.round(L.left), Math.round(L.right)], panel: [host.x, host.x + host.w] });
      }
    }
    return out;
  };
});

const found = [];
const audit = async (label, keys) => { const r = await pg.evaluate(k => window.__fit(k), keys); for (const f of r) found.push({ at: label, ...f }); };

await audit('title', ['Title']);
// the longest names in the game, so the worst case is the one measured
const CITY_IDS = await pg.evaluate(() => window.__nomad.review.cities.map(c => c.id));
for (const city of CITY_IDS) {
  await pg.evaluate(c => { const n = window.__nomad; n.newRun('orangecounty', 'east'); n.autoPack('balanced');
    const s = n.state(); s.cityId = c; s.phase = 'city'; s.stayDays = 3; n.game.registry.set('run', s); n.goto('City'); }, city);
  await sleep(500); await audit(`city:${city}`, ['City']);
}
await pg.evaluate(() => window.__nomad.goto('Pack')); await sleep(800); await audit('pack', ['Pack']);
await pg.evaluate(() => window.__nomad.depart()); await sleep(1000); await audit('route', ['Route']);
await pg.evaluate(() => window.__nomad.goto('Passport', { back: 'Title' })); await sleep(900); await audit('passport', ['Passport']);
await pg.evaluate(() => window.__nomad.goto('Recipes', { back: 'Title' })); await sleep(900); await audit('recipes', ['Recipes']);
for (const ev of ['museum', 'rain', 'airbnbcancel', 'taxibreakdown', 'otter']) {
  await pg.evaluate(e => { const s = window.__nomad.state(); s.cityId = 'highlands'; window.__nomad.game.registry.set('run', s);
    window.__nomad.goto('Event', { eventId: e, onDone: () => {} }); }, ev);
  await sleep(2600); await audit(`event:${ev}`, ['Event']);
}
for (const [key, payload] of [['Cooking', undefined], ['Casino', { cityName: 'Las Vegas', money: 3000 }], ['Workout', { activity: 'bands', city: 'Scottish Highlands', day: 3 }], ['Scuba', { city: 'roatan' }], ['Drone', { cityName: 'Scottish Highlands', level: 1 }], ['Laundry', {}], ['Airport', { gate: 'C21' }], ['Kite', { city: 'laventana' }], ['Work', { day: 3 }]]) {
  await pg.evaluate(([k, p]) => window.__nomad.minigame(k, p), [key, payload]);
  await sleep(1600); await audit(`game:${key}`, [key]);
}
const uniq = new Map(); for (const f of found) uniq.set(`${f.at}|${f.text}|${f.why}`, f);
const rows = [...uniq.values()];
console.log(rows.length ? `${rows.length} text fit problem(s):` : 'every label fits');
for (const f of rows) console.log(`  ${f.at.padEnd(18)} ${f.why.padEnd(16)} ${JSON.stringify(f.box)}${f.panel ? ' in panel ' + JSON.stringify(f.panel) : ''}  "${f.text}"`);
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
await b.close();
process.exit(rows.length || errs.length ? 1 : 0);
