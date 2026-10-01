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
        if (o.visible === false || (o.alpha ?? 1) < 0.05) continue;
        const d = o.depth || depth;
        if (o.__rect) acc.push({ x: ox + o.x + o.__rect.x, y: oy + o.y + o.__rect.y, w: o.__rect.w, h: o.__rect.h, depth: d });
        if (o.type === 'Container') walk(o.list, ox + o.x, oy + o.y, acc, d);
      }
      return acc;
    };
    let ord = 0;
    const texts = (list, ox, oy, acc, nested, idx) => {
      for (const o of list) {
        if (idx !== undefined) ord = idx;
        if (o.visible === false || (o.alpha ?? 1) < 0.05) continue;   /* a hidden container hides its children: the Pack tray stacks four pages in one place */
        if (o.type === 'Container') { texts(o.list, ox + o.x, oy + o.y, acc, true); continue; }
        const t = o.text;
        if (typeof t !== 'string' || !t.trim() || !o.visible || o.alpha < 0.05) continue;
        const w = o.width * (o.scaleX ?? 1), h = o.height * (o.scaleY ?? 1);
        const left = ox + o.x - w * (o.originX ?? 0), top = oy + o.y - h * (o.originY ?? 0);
        acc.push({ t, left, top, right: left + w, bottom: top + h, depth: o.depth, nested, order: ord });
      }
      return acc;
    };
    for (const key of sceneKeys) {
      const sc = n.game.scene.getScene(key);
      if (!sc || !n.game.scene.isVisible(key)) continue;
      const rects = walk(sc.children.list, 0, 0, [], 0);
      /* labels that sit on top of each other: same depth, overlapping rows, overlapping columns. Two of these shipped
         in one screen (a hint running back into its heading, a tag landing on the line under it), so it is worth a check.
         A modal dims the screen and draws over it, so anything behind the last full-screen dimmer is out of the running. */
      const all = []; sc.children.list.forEach((o, i) => texts([o], 0, 0, all, false, i));
      /* anything an opaque panel is painted over afterwards is not on screen: a modal dimmer, or the solid band a
         scrolling list disappears behind. Without this the audit reports the list it cannot see. */
      const covers = [];
      sc.children.list.forEach((o, i) => { if (o.type !== 'Rectangle' && o.type !== 'Graphics') return;
        const w = o.width * (o.scaleX ?? 1), h = o.height * (o.scaleY ?? 1); if (!(w > 40 && h > 10) || (o.alpha ?? 1) < 0.85) return;
        covers.push({ order: i, x: o.x - w * (o.originX ?? 0.5), y: o.y - h * (o.originY ?? 0.5), w, h }); });
      const hidden = (L) => covers.some(c => c.order > L.order && L.left >= c.x - 1 && L.right <= c.x + c.w + 1 && L.top >= c.y - 1 && L.bottom <= c.y + c.h + 1);
      const live = all.filter(L => !hidden(L));
      for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
        const A = live[i], B = live[j];
        if ((A.depth ?? 0) !== (B.depth ?? 0)) continue;
        const rows = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
        const cols = Math.min(A.right, B.right) - Math.max(A.left, B.left);
        /* touching counts: two labels 1 px apart read as one run of text, which is how "dragJan" happened */
        if (rows > 3 && cols > -3) out.push({ scene: key, text: `${A.t.slice(0, 20)} / ${B.t.slice(0, 20)}`, why: cols > 2 ? 'labels overlap' : 'labels touch', box: [Math.round(Math.max(A.left, B.left)), Math.round(Math.min(A.right, B.right))] });
      }
      for (const L of all) {
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
/* panels that only exist after a tap were invisible to this audit, which is how the NEW RUN blurb shipped 4 px wide */
await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Title'); const b = sc.children.list.find(o => o.type === 'Container' && (o.list || []).some(c => c.text === 'NEW RUN')); b?.emit('pointerup', { downY: 0, upY: 0 }); });
await sleep(600); await audit('title:new run', ['Title']);
await pg.evaluate(() => window.__nomad.goto('Title')); await sleep(600);
// the longest names in the game, so the worst case is the one measured
const CITY_IDS = await pg.evaluate(() => window.__nomad.review.cities.map(c => c.id));
for (const city of CITY_IDS) {
  await pg.evaluate(c => { const n = window.__nomad; n.newRun('orangecounty', 'east'); n.autoPack('balanced');
    const s = n.state(); s.cityId = c; s.phase = 'city'; s.stayDays = 3; n.game.registry.set('run', s); n.goto('City'); }, city);
  await sleep(500); await audit(`city:${city}`, ['City']);
  /* the blurb only exists on the arrival card, which needs the arrived flag: without this the audit never sees it */
  await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('City'); sc.scene.restart({ arrived: true }); });
  await sleep(500); await audit(`arrival:${city}`, ['City']);
}
await pg.evaluate(() => window.__nomad.goto('Pack')); await sleep(800); await audit('pack', ['Pack']);
await pg.evaluate(() => { const n = window.__nomad; n.newRun('orangecounty', 'east'); n.autoPack('balanced'); n.depart(); });
await sleep(1100); await audit('route:first pick', ['Route']);   /* the longest list in the game: 11 legs, both directions, the overflow hint */
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
