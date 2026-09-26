import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch, type City } from '../core/types';
import { MinigameFrame, W, H, clamp, normalizeLaunch, txt, pixTexture } from './_shared';
import { SETS, pickSet, terrainH, farH, propAt, h32, type DroneSet, type PropKind, type HazardKind } from './drone/sets';
import { makeHazard, boxes, cableY, plumeUp, plumeWarn, MOVER_SPEED, ZONES, type Hazard } from './drone/hazards';

/**
 * DRONE FLIGHT: the side game for the drone kit. The landscape scrolls right to left; the drone flies through photo rings
 * (the shots the traveller wants) while dodging what lives in that landscape. One thumb: HOLD anywhere to climb, RELEASE to sink,
 * DRAG left / right to move along the screen; DOUBLE-TAP drops a battery bomb (2 per flight) that clears every bird on screen.
 * The camera fires forward by itself and knocks birds out of the way. Arrows / SPACE / B on desktop.
 * Lives: 3 hearts (up to 5). A hit costs a heart and 10 points, then 1.5 s of blinking invulnerability. Hearts at 0 = crash (FAILED).
 * Power-ups drift down the lane every 10 to 14 s: HEART (+1 life), DOUBLE SHOT (two shots at once for 15 s), SHIELD (absorbs one hit, 8 s).
 * Battery is the clock; climbing burns it faster. Payload: { city: City, cityName, seed, level 1..3 }.
 * Score = rings hit / rings × 100 − 10 per hit. Six level sets (coast, city, mountain, desert, jungle, fire and ice) picked from the city (drone/sets.ts).
 * Level 1 is the gentle one (slow scroll, sparse hazards, long battery); 2 and 3 ramp.
 */
const BASE = H - 64;                 // ground baseline (screen y)
const RING_GAP = 190;
const MAX_HEARTS = 5;
type PuKind = 'heart' | 'double' | 'shield';
interface Ring { wx: number; y: number; state: 'open' | 'hit' | 'miss'; flash: number; }
interface Pickup { kind: PuKind; wx: number; y: number; t: number; alive: boolean; }
interface Shot { x: number; y: number; vy: number; }

export class DroneScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private set!: DroneSet; private city?: Partial<City>; private cityName = ''; private seed = 7; private level = 1;
  private g!: Phaser.GameObjects.Graphics; private drone!: Phaser.GameObjects.Sprite; private toastT?: Phaser.GameObjects.Text;
  private scroll = 0; private v = 60; private t = 0; private tick?: Phaser.Time.TimerEvent;
  x = 110; y = 260; vy = 0; held = false; targetX = 110;
  private rings: Ring[] = []; private hazards: Hazard[] = []; private pickups: Pickup[] = []; private shots: Shot[] = []; private spawnT = 0; private puT = 0; private lastStaticWx = -1e9; private rng!: () => number;
  hits = 0; collisions = 0; hearts = 3; bombs = 2; private shield = 0; private doubleT = 0; private fireT = 0; private iframes = 0; private battery = 1; private drain = 1; private ended = false; private landing = false; private anim = 0; private landT = 0;
  private keyUp = false; private keyX = 0; private mistK = 0; private lastTap = -1; private toastUntil = 0;
  constructor() { super(MINIGAME_KEYS.drone); }

  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {};
    this.city = p.city && typeof p.city === 'object' ? p.city : undefined; this.cityName = String(p.cityName || this.city?.name || p.city || 'Somewhere');
    this.seed = typeof p.seed === 'number' ? p.seed : 7; this.level = clamp(Math.round(Number(p.level) || 1), 1, 3);
    this.set = SETS[pickSet(this.city)];
    let s = (this.seed * 9301 + this.level * 49297) >>> 0; this.rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    this.scroll = 0; this.t = 0; this.x = 110; this.y = 260; this.vy = 0; this.held = false; this.targetX = 110; this.rings = []; this.hazards = []; this.pickups = []; this.shots = []; this.spawnT = 2.2; this.puT = 5; this.lastStaticWx = -1e9;
    this.hits = 0; this.collisions = 0; this.hearts = 3; this.bombs = 2; this.shield = 0; this.doubleT = 0; this.fireT = 0; this.iframes = 0; this.battery = 1; this.ended = false; this.landing = false; this.anim = 0; this.landT = 0;
    this.keyUp = false; this.keyX = 0; this.mistK = 0; this.lastTap = -1; this.toastUntil = 0;
  }

  get ringCount() { return 6 + 2 * this.level; }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Drone flight');
    this.v = (44 + 13 * this.level) * (0.9 + 0.2 * this.launch.difficulty) * (1 + 0.1 * this.frame.hard);   // level 1 ≈ 44 px/s, level 3 ≈ 83
    const dur = 44 + 8 * this.level; this.drain = 1 / dur; this.frame.capSec = dur + 14;
    this.cameras.main.setBackgroundColor(this.set.sky[0]);
    this.textures_();
    const N = 10; for (let i = 0; i < N; i++) { const c = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor(this.set.sky[0]), Phaser.Display.Color.ValueToColor(this.set.sky[1]), N - 1, i); const bh = (BASE - 26) / N; this.add.rectangle(W / 2, 26 + i * bh + bh / 2, W, bh + 1, Phaser.Display.Color.GetColor(c.r, c.g, c.b)).setDepth(0); }   // ten sky bands
    this.g = this.add.graphics().setDepth(2);
    this.drone = this.add.sprite(this.x, this.y, 'dr_drone0').setScale(2).setDepth(5);
    const first = 420; for (let i = 0; i < this.ringCount; i++) { const wx = first + i * RING_GAP; const gy = BASE - terrainH(this.set.terrain, wx, this.seed); this.rings.push({ wx, y: 80 + this.rng() * (gy - 140), state: 'open', flash: 0 }); }
    this.frame.hud(); this.frame.setProgress(`0/${this.ringCount} shots`); this.frame.setTimer('battery 100%');
    this.toastT = txt(this, W / 2, 62, '', 12, PAL.sun2).setDepth(20).setAlpha(0);
    this.frame.scoreNow = () => this.score();
    this.frame.intro(`${this.cityName.toUpperCase()} · ${this.set.name}. Fly through ${this.ringCount} photo rings. ${this.set.tagline}. Climbing burns battery.`, () => this.startRun(),
      { height: 468, title: `Drone flight · level ${this.level}`, extra: (s, add) => {
        const top = H / 2 - 234; add(s.add.sprite(W / 2, top + 118, 'dr_drone0').setScale(3));
        const ic = s.add.graphics(); add(ic);
        const row = (y: number, draw: () => void, label: string) => { ic.fillStyle(PAL.night3).fillRect(34, y - 16, 36, 32); draw(); add(txt(s, 80, y, label, 9, PAL.white, 'left')); };
        row(top + 168, () => { ic.fillStyle(PAL.neon).fillCircle(52, top + 168, 7); ic.fillStyle(PAL.night3).fillCircle(52, top + 168, 3); ic.fillStyle(PAL.neon).fillTriangle(52, top + 155, 47, top + 162, 57, top + 162); }, 'HOLD climb · RELEASE sink · DRAG to move');
        row(top + 208, () => { ic.fillStyle(PAL.white).fillRect(44, top + 206, 8, 2).fillRect(56, top + 206, 8, 2); ic.fillStyle(PAL.sun2).fillRect(48, top + 214, 4, 4).fillRect(56, top + 214, 4, 4); }, 'auto shots · DOUBLE-TAP = battery bomb (2)');
        row(top + 248, () => { for (let i = 0; i < 3; i++) { ic.fillStyle(PAL.red).fillRect(40 + i * 9, top + 245, 6, 5).fillRect(41 + i * 9, top + 250, 4, 2).fillRect(42 + i * 9, top + 252, 2, 1); } }, '3 hearts · a hit = -1 heart, -10 points');
        row(top + 288, () => { ic.fillStyle(PAL.red).fillRect(38, top + 284, 8, 7); ic.fillStyle(PAL.sun2).fillRect(49, top + 284, 7, 7); ic.fillStyle(PAL.sky2).fillRect(59, top + 284, 7, 7); }, 'HEART +1 life · DOUBLE SHOT 15 s · SHIELD 1 hit');
        add(txt(s, W / 2, top + 322, `ring = 1 shot · hearts at 0 = crash`, 9, PAL.sun1));
      } });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  private textures_() {
    pixTexture(this, 'dr_drone0', ['.AAA......AAA.', 'AAAAA....AAAAA', '...B......B...', '..BBBBBBBBBB..', '.BBCCCCCCCCBB.', '..BBBBRBBBBB..', '....D....D....', '...DD....DD...'], { A: PAL.gray2, B: PAL.gray1, C: PAL.gray0, R: PAL.red, D: PAL.ink });
    pixTexture(this, 'dr_drone1', ['AAAAA....AAAAA', '.AAA......AAA.', '...B......B...', '..BBBBBBBBBB..', '.BBCCCCCCCCBB.', '..BBBBRBBBBB..', '....D....D....', '...DD....DD...'], { A: PAL.white, B: PAL.gray1, C: PAL.gray0, R: PAL.red, D: PAL.ink });
    pixTexture(this, 'dr_gull0', ['B......B..', '.BB..BB...', '..BBBBB...', '...WWWW.Y.', '....WW....'], { B: PAL.gray2, W: PAL.white, Y: PAL.sun2 });
    pixTexture(this, 'dr_gull1', ['..........', '...WWWW.Y.', 'BBBBWWBBBB', 'B..BWWB..B', '..........'], { B: PAL.gray2, W: PAL.white, Y: PAL.sun2 });
    pixTexture(this, 'dr_eagle0', ['EE..........EE', '.EEE......EEE.', '..EEEWWWWEEE..', '....EWWWWY....', '.....EEE......'], { E: PAL.earth0, W: PAL.earth2, Y: PAL.sun2 });
    pixTexture(this, 'dr_eagle1', ['..............', '....EWWWWY....', 'EEEEEWWWWEEEEE', 'EE..EEEEEE..EE', '..............'], { E: PAL.earth0, W: PAL.earth2, Y: PAL.sun2 });
    pixTexture(this, 'dr_toucan0', ['......KK......', '....KKKKKK....', 'YYYYKKWKKKK...', '..YYKKKKKKKK..', '......KKKK....', '.......KK.....'], { K: PAL.ink, W: PAL.white, Y: PAL.sun1 });
    pixTexture(this, 'dr_toucan1', ['..............', '....KKKKKK....', 'YYYYKKWKKKKKK.', '..YYKKKKKKKKKK', '......KKKK....', '..............'], { K: PAL.ink, W: PAL.white, Y: PAL.sun1 });
  }

  /** Dismiss the card and fly (harness calls this through frame.ready()). */
  private startRun() {
    this.time.delayedCall(60, () => {
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.y < 30) return; const now = this.time.now; if (this.lastTap > 0 && now - this.lastTap < 300) { this.bomb(); this.lastTap = -1; } else this.lastTap = now; this.held = true; this.targetX = clamp(p.x, 40, W - 60); });
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.held) this.targetX = clamp(p.x, 40, W - 60); });
      this.input.on('pointerup', () => { this.held = false; });
      const kb = this.input.keyboard;
      kb?.on('keydown-UP', () => { this.keyUp = true; }); kb?.on('keyup-UP', () => { this.keyUp = false; }); kb?.on('keydown-SPACE', () => { this.keyUp = true; }); kb?.on('keyup-SPACE', () => { this.keyUp = false; });
      kb?.on('keydown-LEFT', () => { this.keyX = -1; }); kb?.on('keyup-LEFT', () => { if (this.keyX < 0) this.keyX = 0; }); kb?.on('keydown-RIGHT', () => { this.keyX = 1; }); kb?.on('keyup-RIGHT', () => { if (this.keyX > 0) this.keyX = 0; });
      kb?.on('keydown-B', () => this.bomb()); kb?.on('keydown-X', () => this.bomb());
      this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) });
    });
  }
  /** Harness hooks */
  press(x: number) { this.held = true; this.targetX = clamp(x, 40, W - 60); }
  release() { this.held = false; }
  hint() { const next = this.rings.find(r => r.state === 'open' && r.wx - this.scroll > this.x - 20); return { x: this.x, y: this.y, vy: this.vy, next: next ? { x: next.wx - this.scroll, y: next.y } : null, hits: this.hits, collisions: this.collisions, hearts: this.hearts, bombs: this.bombs, shield: this.shield, double: this.doubleT, battery: this.battery, set: this.set.id, pickups: this.pickups.filter(p => p.alive).map(p => ({ kind: p.kind, x: p.wx - this.scroll, y: p.y })), hazards: this.hazards.filter(h => h.solid).flatMap(h => boxes(h, h.wx - this.scroll)) }; }
  score() { return clamp((this.hits / this.ringCount) * 100 - 10 * this.collisions, 0, 100); }
  update(_t: number, dt: number) { this.frame.update(dt); }

  private groundY(sx: number) { return BASE - terrainH(this.set.terrain, sx + this.scroll, this.seed); }
  private waterAt(wx: number) { return !!this.set.water && this.set.terrain !== 'hills' && h32(Math.floor(wx / 90), this.seed + 5) > 0.66; }
  private toast(msg: string, color: number = PAL.sun2) { if (!this.toastT) return; this.toastT.setText(msg).setColor('#' + color.toString(16).padStart(6, '0')).setAlpha(1).setY(62); this.toastUntil = this.t + 1.3; }
  private isBird(k: HazardKind) { return k === 'gull' || k === 'pigeon' || k === 'eagle' || k === 'toucan' || k === 'steam'; }

  private step(dt: number) {
    if (!this.frame.active || this.ended) return; this.t += dt; const holding = this.held || this.keyUp;
    // scroll and battery
    const scrollV = this.landing ? this.v * 0.4 : this.v; this.scroll += scrollV * dt;
    this.battery -= this.drain * dt * (holding ? 1.4 : 1); if (this.battery <= 0 && !this.landing) { this.battery = 0; this.land(); }
    if (this.shield > 0) this.shield -= dt; if (this.doubleT > 0) this.doubleT -= dt;
    if (this.toastT && this.toastUntil > 0 && this.t > this.toastUntil - 0.4) { this.toastT.setAlpha(Math.max(0, (this.toastUntil - this.t) / 0.4)); }
    // physics
    if (this.keyX) this.targetX = clamp(this.targetX + this.keyX * 140 * dt, 40, W - 60);
    const sluggish = this.mistK > 0 ? 0.55 : 1;
    this.vy += (holding ? -500 : 360) * dt * sluggish; this.vy = clamp(this.vy, -165, 165);
    for (const h of this.hazards) { if (!ZONES.includes(h.kind)) continue; const sx = h.wx - this.scroll; if (this.x > sx - h.a / 2 && this.x < sx + h.a / 2) { if (h.kind === 'updraft') this.vy -= 360 * dt; else if (h.kind === 'gust') this.targetX = clamp(this.targetX + h.b * 100 * dt, 40, W - 60); } }
    this.mistK = this.hazards.some(h => h.kind === 'mist' && Math.abs(h.wx - this.scroll - this.x) < h.a / 2) ? 1 : 0;
    this.x += (this.targetX - this.x) * Math.min(1, 6 * dt); this.y += this.vy * dt;
    if (this.y < 40) { this.y = 40; this.vy = Math.max(0, this.vy); }
    const gy = this.groundY(this.x) - 8; const water = this.waterAt(this.x + this.scroll) ? BASE - 10 : Infinity; const floor = Math.min(gy, water);
    if (this.y > floor) { this.y = floor; this.vy = -150; this.hurt(); }   // ground / water contact is a hit
    this.drone.setPosition(Math.round(this.x), Math.round(this.y)); this.anim += dt * 24; this.drone.setTexture(Math.floor(this.anim) % 2 ? 'dr_drone1' : 'dr_drone0'); this.drone.setAngle(clamp(this.vy / 12, -12, 12));
    // the camera fires forward by itself; double shot spreads two
    this.fireT -= dt; if (this.fireT <= 0 && !this.landing) { this.fireT = 0.55; if (this.doubleT > 0) this.shots.push({ x: this.x + 12, y: this.y - 4, vy: -18 }, { x: this.x + 12, y: this.y + 4, vy: 18 }); else this.shots.push({ x: this.x + 12, y: this.y, vy: 0 }); }
    for (const sh of this.shots) { sh.x += 270 * dt; sh.y += sh.vy * dt; } this.shots = this.shots.filter(sh => sh.x < W + 10);
    // rings
    for (const r of this.rings) { const sx = r.wx - this.scroll; if (r.flash > 0) r.flash -= dt; if (r.state !== 'open') continue; const R = 16 * this.frame.window + 12;
      if (Math.hypot(sx - this.x, r.y - this.y) < R) { r.state = 'hit'; r.flash = 0.5; this.hits++; this.frame.flash(PAL.white, 40); this.frame.setProgress(`${this.hits}/${this.ringCount} shots`); }
      else if (sx < this.x - 26) { r.state = 'miss'; r.flash = 0.5; this.frame.setProgress(`${this.hits}/${this.ringCount} shots`); } }
    // spawns: hazards paced by level, a power-up every 10 to 14 s (the first one early)
    if (!this.landing) {
      this.spawnT -= dt; if (this.spawnT <= 0) { this.spawnT = Math.max(1.2, 3.4 - 0.45 * this.level - 0.3 * this.launch.difficulty) * (0.8 + this.rng() * 0.4); this.spawn(); }
      this.puT -= dt; if (this.puT <= 0) { this.puT = 10 + this.rng() * 4; this.spawnPickup(); }
    }
    const dr = new Phaser.Geom.Rectangle(this.x - 12, this.y - 6, 24, 12);
    for (const h of this.hazards) {
      h.t += dt; const mv = MOVER_SPEED[h.kind]; if (mv) h.wx -= mv * dt * (h.kind === 'gull' && h.a === 1 && h.b === 1 ? 2.2 : 1);
      const sx = h.wx - this.scroll;
      if (h.kind === 'gull') { if (h.a === 1 && h.b === 0 && sx - this.x < 130 && sx > this.x) { h.b = 1; h.c = this.y; } if (h.b === 1) h.y += Math.sign(h.c - h.y) * Math.min(90 * dt, Math.abs(h.c - h.y)); else h.y += Math.sin(h.t * 3 + h.phase) * 18 * dt; }
      else if (h.kind === 'eagle') { h.y += clamp(this.y - h.y, -50 * dt, 50 * dt); }
      else if (h.kind === 'toucan') { h.y += Math.cos(h.t * 2.2 + h.phase) * h.a * 2.2 * dt; }
      else if (h.kind === 'steam') { h.y += Math.sin(h.t * 1.3 + h.phase) * 10 * dt; }
      else if (h.kind === 'dust') { h.y = this.groundY(sx); }
      if (h.spr) { h.spr.setPosition(Math.round(sx), Math.round(h.y)); const fr = Math.floor((h.t + h.phase) * 8) % 2; h.spr.setTexture(`dr_${h.kind}${fr}`); h.spr.setVisible(sx > -30 && sx < W + 30); }
      if (sx < -200) { this.kill(h); continue; }
      if (!h.solid) continue;
      const bx = boxes(h, sx);
      // shots knock birds (and steam) out of the lane
      if (this.isBird(h.kind)) { const shot = this.shots.findIndex(sh => bx.some(b => Phaser.Geom.Rectangle.Contains(b, sh.x, sh.y))); if (shot >= 0) { this.shots.splice(shot, 1); this.poof(sx, h.y); this.kill(h); continue; } }
      if (this.iframes > 0 || this.landing) continue;
      let hit = bx.some(b => Phaser.Geom.Intersects.RectangleToRectangle(dr, b));
      if (!hit && h.kind === 'cable') { const cy = cableY(h, sx, this.x); if (cy !== null && Math.abs(cy - this.y) < 7) hit = true; }
      if (hit) { this.hurt(); if (this.isBird(h.kind)) this.kill(h); }
    }
    this.hazards = this.hazards.filter(h => h.alive);
    // pickups drift down the lane
    for (const p of this.pickups) { p.t += dt; p.wx -= 18 * dt; const sx = p.wx - this.scroll; const py = p.y + Math.sin(p.t * 3) * 6; if (sx < -30) { p.alive = false; continue; } if (Math.hypot(sx - this.x, py - this.y) < 20) { p.alive = false; this.collect(p.kind); } }
    this.pickups = this.pickups.filter(p => p.alive);
    if (this.iframes > 0) { this.iframes -= dt; this.drone.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.35); } else this.drone.setAlpha(1);
    // end of the route: past the last ring the drone lands
    const last = this.rings[this.rings.length - 1]; if (!this.landing && last.wx - this.scroll < this.x - 60) this.land();
    if (this.landing) { const ly = this.groundY(this.x) - 10; this.y += (ly - this.y) * Math.min(1, 3 * dt); this.vy = 0; if (Math.abs(ly - this.y) < 2 && this.t > this.landT + 1.4) this.finishRun(false); }
    this.frame.setTimer(`battery ${Math.ceil(this.battery * 100)}%`);
    this.draw();
  }
  private kill(h: Hazard) { h.alive = false; h.spr?.destroy(); }
  private poof(x: number, y: number) { const r = this.add.circle(x, y, 6, PAL.white, 0.9).setDepth(7); this.tweens.add({ targets: r, scale: 2.4, alpha: 0, duration: 220, onComplete: () => r.destroy() }); }
  private land() { if (this.landing) return; this.landing = true; this.landT = this.t; this.held = false; }
  private hurt() {
    if (this.iframes > 0) return;
    if (this.shield > 0) { this.shield = 0; this.iframes = 1.0; this.toast('SHIELD TOOK IT', PAL.sky2); this.frame.flash(PAL.sky2, 60); return; }
    this.collisions++; this.hearts--; this.iframes = 1.5; this.frame.shake(160, 0.008); this.frame.flash(PAL.red, 60);
    if (this.hearts <= 0) this.crash();
  }
  private bomb() { if (this.bombs <= 0 || this.landing || this.ended || !this.frame.active) return; this.bombs--; this.frame.flash(PAL.white, 120); this.frame.shake(200, 0.01); this.toast(`BATTERY BOMB · ${this.bombs} left`, PAL.white);
    for (const h of this.hazards) if (h.alive && this.isBird(h.kind)) { const sx = h.wx - this.scroll; if (sx > -20 && sx < W + 20) { this.poof(sx, h.y); this.kill(h); } } this.hazards = this.hazards.filter(h => h.alive); }
  private collect(kind: PuKind) {
    this.frame.flash(PAL.white, 50);
    if (kind === 'heart') { if (this.hearts < MAX_HEARTS) { this.hearts++; this.toast('+1 LIFE', PAL.red); } else this.toast('HEARTS FULL', PAL.red); }
    else if (kind === 'double') { this.doubleT = 15; this.toast('DOUBLE SHOT · 15 s', PAL.sun2); }
    else { this.shield = 8; this.toast('SHIELD · 8 s', PAL.sky2); }
  }
  private crash() { if (this.ended) return; this.ended = true; this.tweens.add({ targets: this.drone, y: this.groundY(this.x) - 4, angle: 70, duration: 600, ease: 'Quad.In', onComplete: () => this.frame.finish(Math.min(45, this.score() * 0.5 + 10), true) }); }
  private finishRun(fail: boolean) { if (this.ended) return; this.ended = true; this.frame.finish(this.score(), fail); }

  private spawn() {
    const kinds = this.set.hazards; const kind = kinds[Math.floor(this.rng() * kinds.length)] as HazardKind;
    const wx = this.scroll + W + 40; const gy = BASE - terrainH(this.set.terrain, wx, this.seed);
    const tall = kind === 'cliff' || kind === 'crane' || kind === 'kiteline' || kind === 'dust' || kind === 'plume' || kind === 'geyser' || kind === 'spray' || kind === 'laundry' || kind === 'cable';
    // keep a safe line: tall structures never sit on a ring and never closer than 170 px to the last one
    if (tall) { if (wx - this.lastStaticWx < 170) return; if (this.rings.some(r => r.state === 'open' && Math.abs(r.wx - wx) < (kind === 'crane' || kind === 'cable' ? 110 : 56))) return; this.lastStaticWx = wx; }
    const h = makeHazard(kind, wx, gy, this.rng, this.level);
    if (kind === 'gull' || kind === 'eagle' || kind === 'toucan') h.spr = this.add.sprite(W + 40, h.y, `dr_${kind}0`).setScale(2).setDepth(4);
    this.hazards.push(h);
  }
  private spawnPickup() {
    const r = this.rng(); const heartBias = this.hearts <= 1 ? 0.85 : this.hearts >= MAX_HEARTS ? 0.1 : 0.45;
    const kind: PuKind = r < heartBias ? 'heart' : r < heartBias + (1 - heartBias) * 0.6 ? 'double' : 'shield';
    const wx = this.scroll + W + 30; const gy = BASE - terrainH(this.set.terrain, wx, this.seed);
    this.pickups.push({ kind, wx, y: 90 + this.rng() * (gy - 170), t: 0, alive: true });
  }

  // ---------- drawing ----------
  private draw() {
    const g = this.g; g.clear(); const S = this.set; const seed = this.seed;
    g.fillStyle(S.farDark); for (let sx = 0; sx < W; sx += 6) { const h = farH(S.terrain, sx + this.scroll * 0.35, seed); g.fillRect(sx, BASE - 22 - h, 6, h + 30); }
    g.fillStyle(S.far, 0.5); for (let sx = 0; sx < W; sx += 6) { const h = farH(S.terrain, sx + this.scroll * 0.35, seed); g.fillRect(sx, BASE - 22 - h, 6, 3); }
    if (S.water) { g.fillStyle(S.water).fillRect(0, BASE - 6, W, H - BASE + 6); g.fillStyle(PAL.white, 0.5); for (let sx = 0; sx < W; sx += 14) g.fillRect(sx + ((this.t * 30) % 14), BASE - 5 + Math.round(Math.sin(sx / 20 + this.t * 3)), 6, 1); }
    for (let sx = 0; sx < W; sx += 4) { const wx = sx + this.scroll; if (this.waterAt(wx)) continue; const h = terrainH(S.terrain, wx, seed); g.fillStyle(S.ground).fillRect(sx, BASE - h, 4, h + (H - BASE)); g.fillStyle(S.groundDark).fillRect(sx, BASE - h, 4, 2); if (S.terrain === 'roofs') { const i = Math.floor(wx / 56); if (h32(i, seed + 3) > 0.5 && Math.floor((sx + 2) / 4) % 3 === 0) g.fillStyle(PAL.sun2, 0.8).fillRect(sx + 1, BASE - h + 8, 2, 2); } }
    const slot0 = Math.floor(this.scroll / 72) - 1; for (let s = slot0; s < slot0 + 8; s++) { const kind = propAt(S, s, seed); if (!kind) continue; const wx = s * 72 + 36; if (this.waterAt(wx)) continue; this.prop(kind, wx - this.scroll, BASE - terrainH(S.terrain, wx, seed), s); }
    for (const h of this.hazards) this.hazard(h, h.wx - this.scroll);
    // rings
    for (const r of this.rings) { const sx = r.wx - this.scroll; if (sx < -40 || sx > W + 40) continue; const R = 16 * this.frame.window + 12; const col = r.state === 'hit' ? PAL.sun2 : r.state === 'miss' ? PAL.gray1 : PAL.neon; g.lineStyle(3, col, r.state === 'open' ? 1 : 0.6).strokeCircle(sx, r.y, R + (r.flash > 0 ? r.flash * 10 : 0)); if (r.state === 'open') g.fillStyle(col, 0.35).fillRect(sx - 3, r.y - R - 8, 6, 4); }
    // pickups
    for (const p of this.pickups) { const sx = p.wx - this.scroll; if (sx < -30 || sx > W + 30) continue; const py = p.y + Math.sin(p.t * 3) * 6; g.lineStyle(1, PAL.white, 0.6).strokeCircle(sx, py, 13 + Math.sin(p.t * 5) * 1.5);
      if (p.kind === 'heart') { g.fillStyle(PAL.red).fillRect(sx - 7, py - 6, 5, 5).fillRect(sx + 2, py - 6, 5, 5).fillRect(sx - 8, py - 3, 16, 5).fillRect(sx - 5, py + 2, 10, 3).fillRect(sx - 2, py + 5, 4, 2); }
      else if (p.kind === 'double') { g.fillStyle(PAL.sun2).fillRect(sx - 8, py - 5, 16, 3).fillRect(sx - 8, py + 2, 16, 3); g.fillStyle(PAL.white).fillRect(sx + 4, py - 5, 4, 3).fillRect(sx + 4, py + 2, 4, 3); }
      else { g.fillStyle(PAL.sky2).fillRect(sx - 7, py - 8, 14, 10).fillTriangle(sx - 7, py + 2, sx + 7, py + 2, sx, py + 9); g.fillStyle(PAL.sky3).fillRect(sx - 5, py - 6, 4, 6); } }
    // shots
    g.fillStyle(PAL.white); for (const sh of this.shots) g.fillRect(sh.x - 4, sh.y - 1, 8, 2);
    // shield ring
    if (this.shield > 0) g.lineStyle(2, PAL.sky2, this.shield < 2 ? 0.3 + 0.5 * Math.abs(Math.sin(this.t * 12)) : 0.8).strokeCircle(this.x, this.y, 20);
    // HUD extras: hearts (empty slots up to 3, extras only while held), bombs, double-shot timer, battery bar, landing pad
    for (let i = 0; i < Math.max(3, this.hearts); i++) { const on = i < this.hearts; const hx = 10 + i * 13, hy = 32; g.fillStyle(on ? PAL.red : PAL.gray0).fillRect(hx, hy, 3, 3).fillRect(hx + 4, hy, 3, 3).fillRect(hx - 1, hy + 2, 9, 3).fillRect(hx + 1, hy + 5, 5, 2).fillRect(hx + 3, hy + 7, 1, 1); }
    for (let i = 0; i < this.bombs; i++) { g.fillStyle(PAL.sun2).fillRect(84 + i * 10, 32, 6, 8); g.fillStyle(PAL.ink).fillRect(86 + i * 10, 30, 2, 2); }
    if (this.doubleT > 0) { g.fillStyle(PAL.sun2, 0.9).fillRect(112, 34, Math.round(40 * this.doubleT / 15), 4); g.fillStyle(PAL.white).fillRect(112, 30, 8, 2).fillRect(112, 40, 8, 2); }
    g.fillStyle(PAL.ink).fillRect(W - 66, 30, 58, 8); g.fillStyle(this.battery > 0.3 ? PAL.neon : PAL.red).fillRect(W - 65, 31, Math.round(56 * this.battery), 6);
    if (this.landing) { const ly = this.groundY(this.x); g.fillStyle(PAL.sun2).fillRect(this.x - 16, ly - 2, 32, 3); }
  }
  private prop(kind: PropKind, x: number, y: number, slot: number) {
    const g = this.g; const r = h32(slot, 77);
    switch (kind) {
      case 'palm': { const hgt = 34 + r * 16; g.fillStyle(PAL.earth1).fillRect(x - 2, y - hgt, 4, hgt); g.fillStyle(PAL.grass1); for (let i = 0; i < 5; i++) { const a = -0.3 + i * 0.35 + Math.sin(this.t + slot) * 0.04; g.fillTriangle(x, y - hgt, x + Math.cos(a) * 22 - 4, y - hgt + Math.sin(a) * 14 + 6, x + Math.cos(a) * 22 + 4, y - hgt + Math.sin(a) * 14); } g.fillStyle(PAL.earth2).fillCircle(x, y - hgt + 2, 3); break; }
      case 'umbrella': g.fillStyle(PAL.gray1).fillRect(x - 1, y - 18, 2, 18); g.fillStyle(r > 0.5 ? PAL.red : PAL.sky1).fillTriangle(x - 12, y - 14, x + 12, y - 14, x, y - 22); break;
      case 'boat': g.fillStyle(PAL.white).fillRect(x - 8, y - 4, 16, 4); g.fillStyle(PAL.earth1).fillRect(x - 1, y - 16, 2, 12); g.fillStyle(PAL.sun3).fillTriangle(x + 1, y - 16, x + 9, y - 6, x + 1, y - 6); break;
      case 'cactus': { const hgt = 26 + r * 22; g.fillStyle(PAL.grass0).fillRect(x - 3, y - hgt, 6, hgt).fillRect(x - 11, y - hgt * 0.6, 8, 4).fillRect(x - 11, y - hgt * 0.6 - 10, 4, 12).fillRect(x + 3, y - hgt * 0.5, 8, 4).fillRect(x + 7, y - hgt * 0.5 - 8, 4, 10); break; }
      case 'camel': g.fillStyle(PAL.earth2).fillRect(x - 10, y - 12, 20, 7).fillRect(x - 6, y - 17, 6, 6).fillRect(x + 2, y - 16, 5, 5).fillRect(x + 9, y - 16, 4, 7).fillRect(x + 11, y - 19, 4, 4); g.fillRect(x - 9, y - 5, 3, 5).fillRect(x - 3, y - 5, 3, 5).fillRect(x + 3, y - 5, 3, 5).fillRect(x + 7, y - 5, 3, 5); break;
      case 'pine': { const hgt = 30 + r * 18; g.fillStyle(PAL.earth0).fillRect(x - 2, y - hgt * 0.4, 4, hgt * 0.4); g.fillStyle(PAL.grass0).fillTriangle(x - 12, y - hgt * 0.3, x + 12, y - hgt * 0.3, x, y - hgt).fillTriangle(x - 9, y - hgt * 0.6, x + 9, y - hgt * 0.6, x, y - hgt - 6); break; }
      case 'hut': g.fillStyle(PAL.earth1).fillRect(x - 10, y - 12, 20, 12); g.fillStyle(PAL.red).fillTriangle(x - 13, y - 12, x + 13, y - 12, x, y - 22); g.fillStyle(PAL.sun3).fillRect(x - 2, y - 8, 4, 8); break;
      case 'canopy': { const hgt = 28 + r * 20; g.fillStyle(PAL.earth0).fillRect(x - 2, y - hgt, 4, hgt); g.fillStyle(PAL.grass1).fillCircle(x, y - hgt, 14).fillCircle(x - 10, y - hgt + 6, 9).fillCircle(x + 10, y - hgt + 5, 10); g.fillStyle(PAL.grass2).fillCircle(x - 3, y - hgt - 4, 5); break; }
      case 'vent': g.fillStyle(PAL.gray1).fillRect(x - 8, y - 6, 16, 6); g.fillStyle(PAL.white, 0.5 + 0.3 * Math.sin(this.t * 3 + slot)).fillCircle(x + Math.sin(this.t + slot) * 3, y - 14 - ((this.t * 20 + slot * 7) % 24), 4); break;
      case 'rock': g.fillStyle(PAL.gray0).fillRect(x - 8, y - 8, 16, 8).fillRect(x - 5, y - 12, 10, 4); g.fillStyle(PAL.gray1).fillRect(x - 5, y - 11, 4, 2); break;
      case 'antenna': g.fillStyle(PAL.gray2).fillRect(x - 1, y - 22, 2, 22).fillRect(x - 6, y - 16, 12, 1).fillRect(x - 4, y - 20, 8, 1); g.fillStyle(PAL.red, 0.5 + 0.5 * Math.sin(this.t * 4)).fillRect(x - 1, y - 24, 2, 2); break;
      case 'tank': g.fillStyle(PAL.gray1).fillRect(x - 7, y - 14, 14, 10); g.fillStyle(PAL.ink).fillRect(x - 6, y - 4, 2, 4).fillRect(x + 4, y - 4, 2, 4); g.fillStyle(PAL.gray2).fillRect(x - 5, y - 13, 10, 2); break;
    }
  }
  private hazard(h: Hazard, x: number) {
    const g = this.g; if (x < -220 || x > W + 60) return;
    switch (h.kind) {
      case 'kiteline': g.lineStyle(1, PAL.gray2, 0.9).lineBetween(x, h.y, x + Math.sin(h.t + h.phase) * 6, h.a); { const kx = x + Math.sin(h.t + h.phase) * 6; g.fillStyle(h.phase > 3 ? PAL.red : PAL.sun1).fillTriangle(kx - 10, h.a - 4, kx + 10, h.a - 4, kx, h.a - 16).fillTriangle(kx - 10, h.a - 4, kx + 10, h.a - 4, kx, h.a + 4); } break;
      case 'crane': g.fillStyle(PAL.sun1).fillRect(x - 3, h.a, 6, h.y - h.a); g.fillRect(h.b < 0 ? x - 72 : x, h.a - 3, 72, 5); g.fillStyle(PAL.ink).fillRect(x - 3, h.a - 8, 6, 5); g.lineStyle(1, PAL.gray2).lineBetween(x + h.b * 50, h.a + 2, x + h.b * 50, h.a + 30); g.fillStyle(PAL.earth2).fillRect(x + h.b * 50 - 5, h.a + 30, 10, 8); break;
      case 'laundry': g.fillStyle(PAL.gray2).fillRect(x - 31, h.y - h.a - 8, 2, h.a + 8).fillRect(x + 29, h.y - h.a - 8, 2, h.a + 8); g.lineStyle(1, PAL.white).lineBetween(x - 30, h.y - h.a, x + 30, h.y - h.a); for (let i = 0; i < 5; i++) g.fillStyle([PAL.sky2, PAL.pink, PAL.sun3, PAL.grass3, PAL.white][i]).fillRect(x - 26 + i * 12, h.y - h.a + 1 + Math.sin(h.t * 3 + i) * 1, 7, 8); break;
      case 'cliff': g.fillStyle(this.set.groundDark).fillRect(x - 13, h.y - h.a, 26, h.a); g.fillStyle(this.set.ground).fillRect(x - 11, h.y - h.a + 2, 22, h.a - 2); g.fillStyle(PAL.white, 0.7).fillRect(x - 11, h.y - h.a + 2, 22, 4); break;
      case 'cable': { g.lineStyle(1, PAL.gray0).lineBetween(x, h.y, x + h.a, h.y - h.b); const car = 0.5 + 0.5 * Math.sin(h.t * 0.7 + h.c * 6); const cx = x + car * h.a, cy = h.y - car * h.b; g.fillStyle(PAL.gray0).fillRect(cx - 1, cy - 4, 2, 5); g.fillStyle(PAL.red).fillRect(cx - 6, cy, 12, 10); g.fillStyle(PAL.sky3).fillRect(cx - 4, cy + 2, 8, 4); break; }
      case 'dust': { const hgt = h.a; g.fillStyle(PAL.earth3, 0.55); for (let i = 0; i < 6; i++) { const yy = h.y - (i + 0.5) * hgt / 6; const w = 6 + i * 3 + Math.sin(h.t * 6 + i) * 2; g.fillRect(x - w / 2 + Math.sin(h.t * 5 + i * 1.3) * 4, yy - hgt / 12, w, hgt / 6); } break; }
      case 'spray': case 'geyser': { const u = plumeUp(h); if (plumeWarn(h) && h.kind === 'geyser') { g.fillStyle(PAL.white, 0.7); for (let i = 0; i < 3; i++) g.fillCircle(x - 6 + i * 6, h.y - 4 - ((h.t * 30 + i * 5) % 12), 2); } if (u > 0.05) { const hgt = h.a * u; g.fillStyle(h.kind === 'geyser' ? PAL.sky3 : PAL.sea3, 0.85).fillRect(x - 5, h.y - hgt, 10, hgt); g.fillStyle(PAL.white, 0.8).fillRect(x - 3, h.y - hgt, 3, hgt); g.fillStyle(PAL.white, 0.5).fillCircle(x, h.y - hgt, 9 * u); } else { g.fillStyle(PAL.sky2, 0.7).fillRect(x - 8, h.y - 2, 16, 2); } break; }
      case 'plume': { const sw = Math.sin(h.t * 2) * 4; g.fillStyle(PAL.sea3, 0.8).fillRect(x - 6 + sw, h.y - h.a, 12, h.a); g.fillStyle(PAL.white, 0.6).fillRect(x - 2 + sw, h.y - h.a, 3, h.a); g.fillStyle(PAL.white, 0.35).fillCircle(x + sw, h.y - h.a + 6, 12).fillCircle(x + sw - 8, h.y - h.a + 16, 8); break; }
      case 'steam': g.fillStyle(PAL.gray2, 0.85).fillCircle(x, h.y, 9).fillCircle(x - 10, h.y + 3, 7).fillCircle(x + 10, h.y + 2, 8).fillCircle(x + 2, h.y - 5, 6); break;
      case 'updraft': g.fillStyle(PAL.white, 0.25); for (let i = 0; i < 5; i++) { const yy = 40 + ((i * 97 + h.t * 160) % (BASE - 60)); g.fillRect(x - h.a / 2 + 4 + i * 9, BASE - yy, 2, 14); } break;
      case 'gust': g.fillStyle(PAL.sky3, 0.35); for (let i = 0; i < 6; i++) { const yy = 50 + i * 70; const xx = x - h.a / 2 + ((h.t * 220 * h.b + i * 23) % h.a + h.a) % h.a; g.fillRect(xx, yy, 18, 2); } break;
      case 'mist': g.fillStyle(PAL.white, 0.35).fillRect(x - h.a / 2, 26, h.a, BASE - 26); g.fillStyle(PAL.white, 0.2).fillRect(x - h.a / 2 - 10, 26, h.a + 20, BASE - 26); break;
      case 'pigeon': for (let i = 0; i < 3; i++) { const px = x + i * 16, py = h.y + (i % 2) * 6; const up = Math.floor((h.t + h.phase) * 8 + i) % 2 === 0; g.fillStyle(PAL.gray1).fillRect(px - 3, py - 1, 6, 3); g.fillRect(px - 6, up ? py - 4 : py + 1, 4, 2).fillRect(px + 2, up ? py - 4 : py + 1, 4, 2); g.fillStyle(PAL.sun1).fillRect(px + 3, py - 1, 1, 1); } break;
      default: break;   // gulls, eagles, toucans are sprites
    }
  }
}
export default DroneScene;
