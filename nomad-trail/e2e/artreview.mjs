import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import { spawn } from 'node:child_process';
const PORT = 4181; const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const wait = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${PORT}/trail/`)).ok) return; } catch {} await new Promise(r => setTimeout(r, 300)); } throw new Error('no preview'); }; await wait();
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 2 }); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto(`http://localhost:${PORT}/trail/`, { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready && window.__nomad.review); await new Promise(r => setTimeout(r, 600));
await pg.evaluate(() => { const sc = window.__nomad.game.scene.getScene('Title'); sc.children.list.forEach(o => o.setVisible && o.setVisible(false)); });
const cities = process.argv[2] ? process.argv[2].split(',') : ['boulder', 'bozeman', 'lasvegas', 'joshuatree', 'orangecounty', 'lapaz', 'laventana', 'roatan', 'santiago'];
fs.mkdirSync('e2e/layout/art', { recursive: true });
for (const c of cities) for (const tod of ['day', 'dusk']) { await pg.evaluate((id, tod) => { const sc = window.__nomad.game.scene.getScene('Title'); if (window.__sk) { try { window.__sk.destroy(); } catch {} } window.__sk = window.__nomadArt.skylineAt(sc, id, tod, 0, 100, 360, 150); }, c, tod); await new Promise(r => setTimeout(r, 120)); await pg.screenshot({ path: `e2e/layout/art/${c}-${tod}.png`, clip: { x: 0, y: 100, width: 360, height: 150 } }); }
for (const d of ['bisonburger', 'tacos', 'bajatacos', 'fishtacos']) fs.writeFileSync(`e2e/layout/art/dish-${d}.png`, Buffer.from((await pg.evaluate(id => window.__nomad.review.dishPng(id), d)).split(',')[1], 'base64'));
console.log('rendered', cities.length, 'cities; errors', errs.length, errs.slice(0, 3)); await b.close(); server.kill();
