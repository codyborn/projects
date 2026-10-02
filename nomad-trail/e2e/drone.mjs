// The drone flight end to end: balloons are dodged not shot, the kite swings, and every region's boss
// shows up at the end of the course, takes camera fire, throws things back, and drops the landing pad when it dies.
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = process.argv[2] || 'http://localhost:4173/trail/';
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage(); await pg.setViewport({ width: 360, height: 640, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = []; const check = (n, ok, d) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${n}${d ? '  ' + d : ''}`); if (!ok) fails.push(n); };
await pg.goto(base, { waitUntil: 'networkidle0' }); await pg.waitForFunction(() => window.__nomad?.ready);

/** Fight a city's boss: skip the course by moving the pad up to the drone, then track it and shoot. */
const fight = async (cityId) => pg.evaluate(async (id) => {
  const n = window.__nomad; const city = n.review.cities.find(c => c.id === id);
  n.minigame('Drone', { city, cityName: city.name, seed: 11, level: 1 });
  await new Promise(r => setTimeout(r, 700));
  const sc = n.game.scene.getScene('Drone'); sc.frame.ready(); await new Promise(r => setTimeout(r, 300));
  sc.hearts = 99; sc.padWx = sc.scroll + sc.x + 30;            // the boss is the thing under test, not the course
  const seen = { boss: null, projs: 0, beam: false, beaten: false, landed: false, hpSeen: [] };
  for (let i = 0; i < 2600 && !seen.landed; i++) {
    const h = sc.hint();
    if (h.boss) { seen.boss ??= { kind: h.boss.kind, name: h.boss.name, maxHp: h.boss.maxHp };
      sc.y += Math.max(-6, Math.min(6, h.boss.y - sc.y)); sc.vy = 0;      // line up with it and let the camera fire
      seen.projs = Math.max(seen.projs, h.projs.length); if (h.boss.beam > 0) seen.beam = true; seen.hpSeen.push(h.boss.hp); }
    if (sc.bossNameT && sc.bossNameT.alpha > 0.5) { const w = sc.bossNameT.width; seen.nameW = Math.round(w); }
    if (h.bossBeaten) seen.beaten = true;
    if (h.landing) seen.landed = true;
    await new Promise(r => setTimeout(r, 16));
  }
  seen.score = Math.round(sc.score()); seen.hp0 = seen.hpSeen[0]; seen.hpEnd = seen.hpSeen[seen.hpSeen.length - 1];
  return seen;
}, cityId);

/** Fly a desert course at natural speed and watch the sky: balloons, a swinging kite, and shots that bounce off a balloon. */
const watchSky = async (cityId) => pg.evaluate(async (id) => {
  const n = window.__nomad; const city = n.review.cities.find(c => c.id === id);
  n.minigame('Drone', { city, cityName: city.name, seed: 4, level: 3 });
  await new Promise(r => setTimeout(r, 700));
  const sc = n.game.scene.getScene('Drone'); sc.frame.ready(); await new Promise(r => setTimeout(r, 300));
  sc.hearts = 999; sc.spawnT = 0.3;
  const kinds = new Set(); const kiteDx = []; const balloonYs = [];
  for (let i = 0; i < 1500; i++) {
    for (const h of sc.hazards) { kinds.add(h.kind);
      if (h.kind === 'kiteline') kiteDx.push(Math.sin(h.t * h.c + h.phase) * h.b);
      if (h.kind === 'balloon') { balloonYs.push(h.y + Math.sin(h.t * 0.6 + h.phase) * h.b); sc.y = h.y; }   // fly straight at it: the shots should not kill it
    }
    await new Promise(r => setTimeout(r, 16));
  }
  const bal = sc.hazards.filter(h => h.kind === 'balloon');
  return { kinds: [...kinds], kiteSwing: kiteDx.length ? Math.round(Math.max(...kiteDx) - Math.min(...kiteDx)) : 0,
           balloonDrift: balloonYs.length ? Math.round(Math.max(...balloonYs) - Math.min(...balloonYs)) : 0,
           balloonsAlive: bal.length, collisions: sc.collisions };
}, cityId);

for (const [city, want] of [['miami', 'gull'], ['tokyo', 'kaiju'], ['munich', 'dragon'], ['buenosaires', 'quetzal'], ['casablanca', 'anubis'], ['kathmandu', 'dragon']]) {
  const r = await fight(city);
  check(`${city}: ${want} turns up, fights back, and goes down`,
    r.boss?.kind === want && (r.projs > 0 || r.beam) && r.beaten && r.landed,   /* a beam boss can win a round without throwing anything */
    `${r.boss ? r.boss.name + ' hp' + r.boss.maxHp : 'no boss'} projs=${r.projs} beam=${r.beam} beaten=${r.beaten} landed=${r.landed} score=${r.score}`);
  check(`${city}: its name fits the screen`, !r.nameW || r.nameW <= 352, `${r.nameW ?? '-'} px`);
}
// the landing pad must not be on screen until the boss is down, and minions must be shakeable
{
  const r = await pg.evaluate(async () => {
    const n = window.__nomad; const city = n.review.cities.find(c => c.id === 'buenosaires');
    n.minigame('Drone', { city, cityName: city.name, seed: 5, level: 1 }); await new Promise(r => setTimeout(r, 700));
    const sc = n.game.scene.getScene('Drone'); sc.frame.ready(); await new Promise(r => setTimeout(r, 300));
    sc.hearts = 999; sc.padWx = sc.scroll + sc.x + 30;
    const orig = sc.pad.bind(sc); let padDuringFight = 0, padAfter = 0;
    sc.pad = (...a) => { if (sc.boss) padDuringFight++; else if (sc.bossBeaten) padAfter++; return orig(...a); };
    /* measured per simulation step, not per wall-clock frame: the loop catches up with several fixed 16 ms steps
       in one frame, which makes a clock-timed reading look two or three times as sharp as the game is */
    let turn = 0; const head = new Map(); const DT = 0.016;
    const origStep = sc.step.bind(sc);
    sc.step = (dt) => { const before = new Map(sc.projs.filter(p => p.kind === 'minion').map(p => [p, Math.atan2(p.vy, p.vx)]));
      origStep(dt);
      for (const p of sc.projs) { if (p.kind !== 'minion' || !before.has(p)) continue;
        let d = Math.abs(Math.atan2(p.vy, p.vx) - before.get(p)); if (d > Math.PI) d = Math.PI * 2 - d;
        turn = Math.max(turn, (d * 180 / Math.PI) / dt); } };
    for (let i = 0; i < 2600; i++) {
      await new Promise(r => setTimeout(r, 16));
      if (sc.boss) sc.y = sc.boss.y;
      if (sc.bossBeaten && padAfter) break;
    }
    sc.step = origStep;
    return { padDuringFight, padAfter, turn: Math.round(turn), beaten: sc.bossBeaten };
  });
  check('no landing pad until the boss is down', r.padDuringFight === 0 && r.padAfter > 0, `${r.padDuringFight} draws during the fight, ${r.padAfter} after`);
  check('minions turn lazily enough to shake', r.turn > 0 && r.turn <= 40, `${r.turn} deg/s`);
}
// the kaiju's beam must come out where it threatened to
{
  const r = await pg.evaluate(async () => {
    const n = window.__nomad; const city = n.review.cities.find(c => c.id === 'tokyo');
    n.minigame('Drone', { city, cityName: city.name, seed: 11, level: 1 }); await new Promise(r => setTimeout(r, 700));
    const sc = n.game.scene.getScene('Drone'); sc.frame.ready(); await new Promise(r => setTimeout(r, 300));
    sc.hearts = 999; sc.padWx = sc.scroll + sc.x + 30;
    const muzzle = () => sc.boss.y + sc.boss.def.muzzle;
    for (let i = 0; i < 2600; i++) {
      await new Promise(r => setTimeout(r, 16));
      if (!sc.boss) continue;
      if (sc.boss.windup > 0 && sc.boss.pending === 'beam' && sc.boss.windup < 0.1) {
        const warned = muzzle();                                   // where the warning line is, one frame before it fires
        for (let k = 0; k < 20; k++) { await new Promise(r => setTimeout(r, 16)); if (sc.boss.beam > 0) return { warned, fired: muzzle(), drift: Math.abs(muzzle() - warned) }; }
        return { warned, fired: null };
      }
    }
    return null;
  });
  check('the beam fires from where it warned', r && r.fired !== null && r.drift < 12, r ? `warned at ${r.warned?.toFixed(0)}, fired at ${r.fired?.toFixed(0)}` : 'no beam seen');
  /* and the body never teleports to meet it: measured per simulation step, the same way the minion turn rate is */
  const jump = await pg.evaluate(async () => {
    const n = window.__nomad; const city = n.review.cities.find(c => c.id === 'tokyo');
    n.minigame('Drone', { city, cityName: city.name, seed: 7, level: 2 }); await new Promise(r => setTimeout(r, 700));
    const sc = n.game.scene.getScene('Drone'); sc.frame.ready(); await new Promise(r => setTimeout(r, 300));
    sc.hearts = 999; sc.padWx = sc.scroll + sc.x + 30;
    let worst = 0, beams = 0; const orig = sc.step.bind(sc);
    sc.step = (dt) => { const was = sc.boss?.y, wasBeam = sc.boss?.beam ?? 0; orig(dt);
      if (sc.boss && was !== undefined) { const d = Math.abs(sc.boss.y - was); if (sc.boss.beam > 0 || sc.boss.windup > 0) worst = Math.max(worst, d);
        if (wasBeam <= 0 && sc.boss.beam > 0) beams++; } };
    for (let i = 0; i < 2000 && beams < 3; i++) { await new Promise(r => setTimeout(r, 16)); if (sc.boss) sc.y = 120 + (i % 240); }
    sc.step = orig; return { worst: Math.round(worst), beams };
  });
  check('the kaiju does not jump when it fires', jump.beams > 0 && jump.worst <= 6, `${jump.beams} beams, worst step ${jump.worst} px`);
}
const sky = await watchSky('dakhla');
check('balloons drift through the course', sky.kinds.includes('balloon'), sky.kinds.join(','));
check('a balloon rises and sinks', sky.balloonDrift >= 12, `${sky.balloonDrift} px`);
check('shots do not pop balloons', sky.balloonsAlive > 0, `${sky.balloonsAlive} still up`);
check('the kite swings across its line', sky.kiteSwing >= 30, `${sky.kiteSwing} px`);
console.log(errs.length ? 'ERRORS:\n' + errs.slice(0, 6).join('\n') : 'no page errors');
await b.close();
process.exit(fails.length || errs.length ? 1 : 0);
