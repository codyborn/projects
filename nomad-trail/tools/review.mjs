// Builds the review hub: trail/review/index.html + PNGs. Everything in one page: every city's skylines, dishes (art), workout games,
// console games, city-gated events, and links to the copy note. Usage: npm run build && npx vite preview --port 4173 & node tools/review.mjs
import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
// self-hosted preview so the script works standalone and as the last step of `npm run build` (emptyOutDir wipes review/ on every build)
const PORT = 4179; const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const waitFor = async (url, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const r = await fetch(url); if (r.ok) return; } catch {} await new Promise(r => setTimeout(r, 300)); } throw new Error('preview did not start'); };
await waitFor(`http://localhost:${PORT}/trail/`);
const OUT = path.resolve('../trail/review'); const IMG = path.join(OUT, 'img'); fs.mkdirSync(IMG, { recursive: true });
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 2 });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); const sleep = ms => new Promise(r => setTimeout(r, ms));
await pg.goto(`http://localhost:${PORT}/trail/`, { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready && window.__nomad.review); await sleep(800);
const R = await pg.evaluate(() => { const r = window.__nomad.review; return { cities: r.cities, dishes: r.dishes, events: r.events, items: r.items, meta: r.workoutMeta, pools: r.workoutPools, dense: r.denseCities, console: r.consoleGames }; });
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const saveDataUrl = (file, url) => fs.writeFileSync(path.join(IMG, file), Buffer.from(url.split(',')[1], 'base64'));
// ---- 1. skylines: dawn and dusk per city, clipped screenshots of a scratch render on the Title scene
const hideTitle = () => pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Title'); sc.children.list.forEach(o => o.setVisible && o.setVisible(false)); });
await hideTitle();
for (const c of R.cities) {
  for (const tod of ['day', 'dusk']) {
    await pg.evaluate((id, tod) => { const sc = window.__nomad.game.scene.getScene('Title'); if (window.__sk) { try { window.__sk.destroy(); } catch {} } window.__sk = window.__nomadArt.skylineAt(sc, id, tod, 0, 100, 360, 150); }, c.id, tod);
    await sleep(120); await pg.screenshot({ path: path.join(IMG, `sky-${c.id}-${tod}.png`), clip: { x: 0, y: 100, width: 360, height: 150 } });
  }
}
// ---- 2. dish art
for (const d of R.dishes) saveDataUrl(`dish-${d.id}.png`, await pg.evaluate((id) => window.__nomad.review.dishPng(id), d.id));
// ---- 3. workout micro-games (one screenshot each, mid-play) and the three console games
const microIds = Object.keys(R.meta);
const startScene = (key, data) => pg.evaluate((key, data) => { const g = window.__nomad.game; g.scene.getScenes(true).forEach(s => g.scene.stop(s.scene.key)); g.scene.start(key, { ...data, onDone: () => {} }); }, key, data);
for (const id of microIds) { await startScene('Workout', { energy: 80, difficulty: 0.4, extraLives: 1, payload: { activity: 'bands', city: 'lisbon', day: 3, plan: [id] } }); await sleep(2300); await pg.touchscreen.tap(180, 500); await sleep(1600); await pg.screenshot({ path: path.join(IMG, `workout-${id}.png`) }); }
await startScene('Workout', { energy: 80, difficulty: 0.4, payload: { activity: 'ferrata', city: 'innsbruck', day: 3 } }); await sleep(3200); await pg.screenshot({ path: path.join(IMG, `workout-ferrata.png`) });
for (const game of R.console) { await startScene('CarryOn', { energy: 80, difficulty: 0.4, payload: { game, city: 'lisbon', cityName: 'Lisbon', hazard: 'tram', climate: 'temperate', seed: 7 } }); await sleep(3200); await pg.screenshot({ path: path.join(IMG, `console-${game}.png`) }); }
for (const [key, data, file, wait] of [['Kite', { energy: 80, difficulty: 0.4, payload: { city: 'laventana' } }, 'kite', 2500], ['Cooking', { energy: 80, difficulty: 0.4, payload: R.dishes.find(d => d.id === 'ramen') || R.dishes[0] }, 'cooking', 2500], ['Laundry', { energy: 80, difficulty: 0.4 }, 'laundry', 2600], ['Airport', { energy: 80, difficulty: 0.4 }, 'airport', 2500], ['Otter', {}, 'otter', 1500], ['Coffee', { cityId: 'tokyo', day: 41, climate: 'rainy', region: 'asia' }, 'coffee', 1400]]) { await startScene(key, data); await sleep(wait); await pg.screenshot({ path: path.join(IMG, `game-${file}.png`) }); }
// ---- 4. the page
const byCity = id => { const c = R.cities.find(x => x.id === id); return (c?.dishes || []).map(did => R.dishes.find(d => d.id === did)).filter(Boolean); };   // the city's menu, not the dish's home town
const poolFor = (activity, cityId) => { if (activity === 'ferrata') return ['ferrata (Zeke\'s Peak climb)']; if (activity === 'kite') return ['kiteboarding (Kite game)']; let p = R.pools[activity] || R.pools.bands || []; if (R.dense.includes(cityId) && (activity === 'trailrun' || activity === 'bands')) p = ['cityrun', ...p]; return p; };
const cityEvents = c => R.events.filter(e => e.requiresCity === c.id || (e.requiresClimate && e.requiresClimate.includes(c.climate)) || (e.requiresOutdoorsy && c.outdoorsy) || (e.requiresActivity && e.requiresActivity.some(a => c.activities.includes(a)))).map(e => e.id);
const cityCard = c => `<section class="city" id="${c.id}"><h2>${esc(c.name)} <small>${esc(c.country)} · ${c.region} · ${c.climate}${c.hero ? ' · ★ hero' : ''}${c.outdoorsy ? ' · outdoorsy' : ''}${c.radon ? ' · radon ' + c.radon : ''} · $${c.costPerDay}/day · stay ${c.minStay}–${c.suggestedStay}d</small></h2>
<p class="blurb">${esc(c.blurb)}</p>
<div class="row"><figure><img src="img/sky-${c.id}-day.png" alt=""><figcaption>day</figcaption></figure><figure><img src="img/sky-${c.id}-dusk.png" alt=""><figcaption>dusk</figcaption></figure></div>
<div class="cols"><div><h3>Dishes</h3><div class="dishes">${byCity(c.id).map(d => `<figure><img src="img/dish-${d.id}.png" alt=""><figcaption><b>${esc(d.name)}</b><br>${esc(d.ingredients.join(', '))}<br><i>${d.steps.map(s => s.kind).join(' → ')}</i></figcaption></figure>`).join('') || '<i>none</i>'}</div></div>
<div><h3>Workouts</h3><ul>${c.activities.map(a => `<li><b>${a}</b>: ${poolFor(a, c.id).map(m => `<a href="#micro-${m.split(' ')[0]}">${esc(m)}</a>`).join(', ')}</li>`).join('')}</ul>
<h3>Console (rest day, Switch packed)</h3><p>${R.console.map(g => `<a href="#console-${g}">${g}</a>`).join(', ')} · hazard: <b>${c.hazard}</b></p>
<h3>Events that can fire here (beyond the universal ones)</h3><p>${cityEvents(c).map(e => `<a href="#ev-${e}">${e}</a>`).join(', ') || '<i>none extra</i>'}</p></div></div></section>`;
const microGallery = `<section id="micros"><h2>Workout micro-games (${microIds.length + 1})</h2><div class="gallery">${microIds.map(id => `<figure id="micro-${id}"><img src="img/workout-${id}.png" alt=""><figcaption><b>${id}</b> · ${esc(R.meta[id].word)}<br>${esc(R.meta[id].instr)}</figcaption></figure>`).join('')}<figure id="micro-ferrata"><img src="img/workout-ferrata.png" alt=""><figcaption><b>ferrata</b> · the Zeke's Peak climb</figcaption></figure></div></section>`;
const consoleGallery = `<section id="console"><h2>The handheld console</h2><div class="gallery">${R.console.map(g => `<figure id="console-${g}"><img src="img/console-${g}.png" alt=""><figcaption><b>${g}</b></figcaption></figure>`).join('')}</div></section>`;
const otherGallery = `<section id="other"><h2>Other scenes</h2><div class="gallery">${['kite', 'cooking', 'laundry', 'airport', 'otter', 'coffee'].map(f => `<figure><img src="img/game-${f}.png" alt=""><figcaption><b>${f}</b></figcaption></figure>`).join('')}</div></section>`;
const eventList = `<section id="events"><h2>Events (${R.events.length})</h2><p>Edit the words in Obsidian: <b>Travel/Nomad/Nomad Trail Copy.md</b>, then <code>npm run copy:import</code>.</p><table><tr><th>id</th><th>when</th><th>gates</th><th>text</th></tr>${R.events.map(e => `<tr id="ev-${e.id}"><td>${e.id}</td><td>${e.when}</td><td>${['requiresCity', 'requiresClimate', 'requiresOutdoorsy', 'requiresActivity', 'requiresTransport', 'requiresTag', 'mitigatedBy'].filter(k => e[k]).map(k => `${k.replace('requires', '')}: ${JSON.stringify(e[k])}`).join('<br>')}</td><td>${esc(e.text)}${e.mitigatedText ? `<br><i>with gear: ${esc(e.mitigatedText)}</i>` : ''}</td></tr>`).join('')}</table></section>`;
const bundles = `<section id="bundles"><h2>Bundles (${R.items.length})</h2><table><tr><th>name</th><th>lb</th><th>size</th><th>tags</th><th>benefits</th></tr>${R.items.map(i => `<tr><td><b>${esc(i.name)}</b><br><small>${esc(i.label)}</small></td><td>${i.weightLb}</td><td>${i.w}x${i.h}</td><td>${i.tags.join(', ')}</td><td>${(i.benefits || []).map(esc).join('<br>')}</td></tr>`).join('')}</table></section>`;
const toc = `<nav><a href="#cities">Cities (${R.cities.length})</a> · <a href="#micros">Workouts</a> · <a href="#console">Console</a> · <a href="#other">Other scenes</a> · <a href="#events">Events</a> · <a href="#bundles">Bundles</a> · <a href="../">Play</a></nav><p class="jump">${R.cities.map(c => `<a href="#${c.id}">${esc(c.name)}</a>`).join(' · ')}</p>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nomad Trail — review</title>
<style>body{margin:0;background:#0b0f1a;color:#d8d4cb;font:14px/1.45 -apple-system,Helvetica,Arial,sans-serif;padding:20px 24px 60px}a{color:#3ef0c8}h1{margin:0 0 6px}h2{margin:0 0 4px;font-size:20px}h2 small{font-size:12px;color:#7d7a72;font-weight:normal}h3{margin:12px 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#f7cf6b}nav{margin:8px 0}.jump{font-size:12px;color:#7d7a72;line-height:1.8}
.city{border-top:1px solid #2a2d34;padding:18px 0}.blurb{color:#b4b9c4;margin:4px 0 10px;max-width:760px}.row{display:flex;gap:10px;flex-wrap:wrap}.row figure{margin:0}.row img{width:360px;image-rendering:pixelated;display:block;border:1px solid #2a2d34}figcaption{font-size:11px;color:#7d7a72;margin-top:3px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}@media(max-width:900px){.cols{grid-template-columns:1fr}}.dishes{display:flex;flex-wrap:wrap;gap:10px}.dishes figure{margin:0;width:200px}.dishes img{width:192px;image-rendering:pixelated;background:#141a2e;border:1px solid #2a2d34}
.gallery{display:flex;flex-wrap:wrap;gap:12px}.gallery figure{margin:0;width:180px}.gallery img{width:180px;image-rendering:pixelated;border:1px solid #2a2d34}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #2a2d34;padding:4px 6px;vertical-align:top;text-align:left}th{color:#f7cf6b}ul{margin:0;padding-left:18px}</style></head><body>
<h1>The Nomad Trail · review</h1><p>Generated ${new Date().toISOString().slice(0, 16).replace('T', ' ')} from the current build. Every city, its skylines, dishes, workouts, console games and the events that can reach it. Words live in Obsidian (Nomad Trail Copy).</p>${toc}
<section id="cities">${R.cities.map(cityCard).join('')}</section>${microGallery}${consoleGallery}${otherGallery}${eventList}${bundles}</body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`review: ${R.cities.length} cities, ${R.dishes.length} dishes, ${microIds.length + 1} workouts, ${R.console.length} console games -> ${OUT}/index.html; page errors: ${errs.length}`); if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await b.close(); server.kill();
