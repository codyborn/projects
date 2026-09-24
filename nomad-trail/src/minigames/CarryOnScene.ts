import Phaser from 'phaser';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type ArcadeLevel, type Hazard, type MinigameLaunch } from '../core/types';
import { MinigameFrame, W, H, clamp, normalizeLaunch, panel, txt, pixTexture } from './_shared';

import { TILE, PAR_DEFAULT, PHYS, DEFAULT_LEVEL, validateLevel, trimStamps } from './carryonLevel';
export { DEFAULT_LEVEL, validateLevel } from './carryonLevel';
const WORLD_Y = 160;           // world top on screen
const HARD_CAP = 60;           // seconds of play; auto-finish with partial credit
const RAMP_AT = 40;            // seconds until hazards reach full (1.8x) speed/frequency

interface Mover { spr: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image; vx: number; vy: number; kind: Hazard; t: number; x0: number; y0: number; dir: number; alive: boolean; w: number; h: number; }

/** Carry-On: the Switch's game-within-a-game. One-screen platformer, a level per city, collect the stamp pieces (max 8).
 *  Hazards ramp to 1.8x by 40 s; par 30 s; hard cap 60 s with partial credit. */
export class CarryOnScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private level!: ArcadeLevel;
  private ox = 0; private cols = 23; private rows = 20;
  private player!: Phaser.Physics.Arcade.Sprite; private solids!: Phaser.Physics.Arcade.StaticGroup; private oneways!: Phaser.Physics.Arcade.StaticGroup;
  private stamps: Phaser.GameObjects.Image[] = []; private spikes: Phaser.Geom.Rectangle[] = []; private movers: Mover[] = []; private spawners: { x: number; y: number }[] = [];
  private hearts = 3; private collected = 0; private total = 0; private t0 = 0; private iframes = 0; private windForce = 0; private windT = 0; private waterY = 0; private waterDir = 1;
  private keys: { left: boolean; right: boolean; jump: boolean } = { left: false, right: false, jump: false };
  private jumpHeld = false; private jumpBuffer = 0; private coyote = 0; private touchDirs = new Map<number, 'left' | 'right' | 'jump'>(); private swipeStart = new Map<number, number>();
  private skyline: { spr: Phaser.GameObjects.Rectangle; spd: number; w: number }[] = []; private rockT = 0;
  private heartsText!: Phaser.GameObjects.Text; private stampText!: Phaser.GameObjects.Text; private timeText!: Phaser.GameObjects.Text; private windStreaks!: Phaser.GameObjects.Graphics; private water!: Phaser.GameObjects.Rectangle;
  private ended = false;

  constructor() { super(MINIGAME_KEYS.carryon); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const raw = this.launch.payload; const p = raw && raw.level && Array.isArray(raw.level.tiles) ? raw.level : raw;   // engine sends { level, city }
    this.level = trimStamps((p && Array.isArray(p.tiles) && p.tiles.length) ? p as ArcadeLevel : DEFAULT_LEVEL);
    this.rows = this.level.tiles.length; this.cols = Math.max(...this.level.tiles.map(r => r.length)); this.ox = Math.round((W - this.cols * TILE) / 2);
    this.hearts = 3; this.collected = 0; this.total = 0; this.stamps = []; this.spikes = []; this.movers = []; this.spawners = []; this.ended = false; this.iframes = 0; this.windForce = 0; this.waterY = 0; this.touchDirs.clear(); this.swipeStart.clear(); this.skyline = []; this.rockT = 0; this.windT = 0;
    const issues = validateLevel(this.level); if (issues.length) console.warn('[CarryOn] level issues:', this.level.city, issues);
  }

  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Carry-On');
    const [bg, mid, fg] = this.level.palette || DEFAULT_LEVEL.palette;
    this.cameras.main.setBackgroundColor(PAL.ink);
    this.makeTextures(fg);
    // world backdrop + parallax skyline silhouettes
    const wh = this.rows * TILE; this.add.rectangle(W / 2, WORLD_Y + wh / 2, W, wh, bg).setDepth(0);
    // scrolling parallax silhouettes: recycled only once fully off the left edge (x + w < 0), respawned off the right edge
    const spawnSil = (x: number) => { const bw = Phaser.Math.Between(18, 44), bh = Phaser.Math.Between(40, 170); const r = this.add.rectangle(x + bw / 2, WORLD_Y + wh - bh / 2, bw, bh, mid, 0.6).setDepth(1); this.skyline.push({ spr: r, spd: 6 + bh / 12, w: bw }); };
    for (let x = -10; x < W + 60; x += Phaser.Math.Between(24, 40)) spawnSil(x);
    // tiles
    this.solids = this.physics.add.staticGroup(); this.oneways = this.physics.add.staticGroup(); let sx = 1, sy = 1;
    this.level.tiles.forEach((row, y) => [...row].forEach((c, x) => {
      const px = this.ox + x * TILE + TILE / 2, py = WORLD_Y + y * TILE + TILE / 2;
      if (c === '#') { const img = this.solids.create(px, py, 'co_tile') as Phaser.Physics.Arcade.Image; img.setDepth(3); img.refreshBody(); }
      else if (c === '-') { const img = this.oneways.create(px, py - 5, 'co_oneway') as Phaser.Physics.Arcade.Image; img.setDepth(3); img.refreshBody(); const b = img.body as Phaser.Physics.Arcade.StaticBody; b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false; }
      else if (c === '*') { const s = this.add.image(px, py, 'co_stamp').setDepth(4); this.tweens.add({ targets: s, y: py - 3, duration: 600 + (x * 37) % 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); this.stamps.push(s); this.total++; }
      else if (c === '^') { this.add.image(px, py + 2, 'co_spike').setDepth(4); this.spikes.push(new Phaser.Geom.Rectangle(px - 6, py - 2, 12, 10)); }
      else if (c === 'S') { sx = px; sy = py; }
      else if (c === 'H') { this.spawners.push({ x: px, y: py }); }
    }));
    this.player = this.physics.add.sprite(sx, sy, 'co_player').setDepth(6); this.player.setSize(10, 13).setOffset(1, 1); this.player.setCollideWorldBounds(false); this.player.setMaxVelocity(200, 600);
    this.physics.add.collider(this.player, this.solids); this.physics.add.collider(this.player, this.oneways);
    this.windStreaks = this.add.graphics().setDepth(5); this.water = this.add.rectangle(W / 2, WORLD_Y + wh + 200, W, 400, PAL.sea1, 0.75).setDepth(7).setVisible(this.level.hazard === 'wave');
    if (this.level.hazard === 'wave') { this.waterY = WORLD_Y + wh - TILE; }
    this.spawnInitialHazards();
    this.drawBezel();
    this.setupInput();
    this.frame.capSec = HARD_CAP; this.frame.scoreNow = () => (this.collected / Math.max(1, this.total)) * 70;
    this.frame.intro(`Collect the ${this.total} stamp pieces. Dodge the ${this.level.hazard}s. It speeds up. Left | Right | Jump.`, () => { this.t0 = this.time.now; });
    this.frame.hud();
  }

  private makeTextures(fg: number) {
    const hx = (c: number) => c;
    pixTexture(this, 'co_tile', ['AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB'], { A: PAL.ink, B: hx(fg) });
    pixTexture(this, 'co_oneway', ['AAAAAAAAAAAAAAAA', 'ACCCCCCCCCCCCCCA', 'AAAAAAAAAAAAAAAA', '.A..A..A..A..A..'], { A: PAL.ink, C: PAL.earth3 });
    pixTexture(this, 'co_stamp', ['..AAAA..', '.ABBBBA.', 'ABBCCBBA', 'ABCDDCBA', 'ABCDDCBA', 'ABBCCBBA', '.ABBBBA.', '..AAAA..'], { A: PAL.ink, B: PAL.sun1, C: PAL.sun2, D: PAL.white });
    pixTexture(this, 'co_spike', ['.....A......A...', '....ABA....ABA..', '...ABBBA..ABBBA.', '..ABBBBBAABBBBBA', '.AAAAAAAAAAAAAAA'], { A: PAL.ink, B: PAL.gray2 });
    pixTexture(this, 'co_player', ['..AAAAAA..', '.ABBBBBBA.', '.ABCCBCCA.', '.ABBBBBBA.', '..ADDDDA..', '.AEEEEEEA.', 'AEEFFFFEEA', 'AEEFFFFEEA', '.AEEEEEEA.', '..AGGGGA..', '..AG..GA..', '..AG..GA..', '..AA..AA..', '.AHA..AHA.', '..........'], { A: PAL.ink, B: PAL.earth3, C: PAL.ink, D: PAL.earth1, E: PAL.sun0, F: PAL.sun1, G: PAL.night3, H: PAL.gray2 });
    pixTexture(this, 'co_heart', ['.AA.AA.', 'ABBABBA', 'ABBBBBA', '.ABBBA.', '..ABA..', '...A...'], { A: PAL.ink, B: PAL.red });
    pixTexture(this, 'co_heart_off', ['.AA.AA.', 'ACCACCA', 'ACCCCCA', '.ACCCA.', '..ACA..', '...A...'], { A: PAL.ink, C: PAL.gray0 });
  }

  private drawBezel() {
    const wh = this.rows * TILE; const top = WORLD_Y - 8, bottom = WORLD_Y + wh + 8;
    // console body
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(PAL.gray0).fillRect(0, 40, W, top - 40); g.fillStyle(PAL.gray0).fillRect(0, bottom, W, H - bottom); g.fillStyle(PAL.gray0).fillRect(0, top, 8, wh + 16).fillRect(W - 8, top, 8, wh + 16);
    g.fillStyle(PAL.ink).fillRect(0, top, W, 2).fillRect(0, bottom - 2, W, 2); g.fillStyle(PAL.gray1).fillRect(0, 40, W, 2).fillRect(0, H - 2, W, 2);
    g.fillStyle(PAL.red).fillCircle(W - 24, 60, 6); g.fillStyle(PAL.sky1).fillCircle(W - 44, 60, 6);
    txt(this, 14, 60, 'CARRY-ON', 12, PAL.white, 'left').setDepth(21); txt(this, 14, 82, this.level.city.toUpperCase(), 9, PAL.gray2, 'left').setDepth(21);
    // bottom controls: three zones
    const zy = bottom + 20, zh = H - bottom - 40; const zones = [[8, 'LEFT'], [W / 3 + 4, 'RIGHT'], [(2 * W) / 3 + 4, 'JUMP']] as [number, string][];
    zones.forEach(([x, l]) => { panel(this, x, zy, W / 3 - 12, zh, PAL.gray0, PAL.gray1, PAL.ink).setDepth(21); txt(this, x + (W / 3 - 12) / 2, zy + zh / 2, l === 'LEFT' ? '<' : l === 'RIGHT' ? '>' : '^', 24, PAL.gray2).setDepth(22).setAlpha(0.7); });
    txt(this, W / 2, zy - 8, 'swipe up anywhere to jump', 8, PAL.gray1).setDepth(22);
    // status on the bezel
    this.heartsText = txt(this, W / 2 - 40, 60, '', 12, PAL.red).setDepth(21); this.stampText = txt(this, W / 2 + 30, 60, '', 12, PAL.sun2).setDepth(21); this.timeText = txt(this, W / 2, 82, '', 9, PAL.gray2).setDepth(21);
    for (let i = 0; i < 3; i++) this.add.image(W / 2 - 60 + i * 12, 60, 'co_heart').setDepth(21).setName(`h${i}`);
    this.refreshStatus();
  }
  private refreshStatus() { for (let i = 0; i < 3; i++) (this.children.getByName(`h${i}`) as Phaser.GameObjects.Image | null)?.setTexture(i < this.hearts ? 'co_heart' : 'co_heart_off'); this.stampText.setText(`${this.collected}/${this.total}`); }

  private setupInput() {
    const wh = this.rows * TILE; const bottom = WORLD_Y + wh + 8;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (!this.frame.active) return; this.swipeStart.set(p.id, p.y); if (p.y < bottom - 10 && p.y > WORLD_Y) return; const z = p.x < W / 3 ? 'left' : p.x < (2 * W) / 3 ? 'right' : 'jump'; this.touchDirs.set(p.id, z); if (z === 'jump') this.pressJump(); });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (!p.isDown) return; const s = this.swipeStart.get(p.id); if (s !== undefined && s - p.y > 40) { this.swipeStart.delete(p.id); this.pressJump(); } if (this.touchDirs.has(p.id) && this.touchDirs.get(p.id) !== 'jump') this.touchDirs.set(p.id, p.x < W / 3 ? 'left' : p.x < (2 * W) / 3 ? 'right' : 'jump'); });
    const up = (p: Phaser.Input.Pointer) => { if (this.touchDirs.get(p.id) === 'jump') this.jumpHeld = false; this.touchDirs.delete(p.id); this.swipeStart.delete(p.id); };
    this.input.on('pointerup', up); this.input.on('pointerupoutside', up);
    const kb = this.input.keyboard; if (kb) {
      const l = [kb.addKey('LEFT'), kb.addKey('A')], r = [kb.addKey('RIGHT'), kb.addKey('D')], j = [kb.addKey('UP'), kb.addKey('W'), kb.addKey('SPACE')];
      (this as any)._kb = { l, r, j }; j.forEach(k => k.on('down', () => this.pressJump()));
    }
  }
  private pressJump() { if (!this.frame.active) return; this.jumpBuffer = 0.12; this.jumpHeld = true; }

  private spawnInitialHazards() {
    const hz = this.level.hazard; const wh = this.rows * TILE; const n = Math.max(1, this.spawners.length);
    const mk = (x: number, y: number, w: number, h: number, color: number, kind: Hazard, vx = 0, vy = 0): Mover => { const spr = this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, PAL.ink).setDepth(5); const m: Mover = { spr, vx, vy, kind, t: Math.random() * 10, x0: x, y0: y, dir: 1, alive: true, w, h }; this.movers.push(m); return m; };
    const pts = this.spawners.length ? this.spawners : [{ x: W / 2, y: WORLD_Y + TILE * 2 }];
    const spd = 30 + 30 * this.launch.difficulty;
    switch (hz) {
      case 'otter': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 6, 14, 10, PAL.earth2, hz, spd)); break;
      case 'mosquito': pts.forEach(p => { mk(p.x, p.y, 6, 4, PAL.gray1, hz, spd); mk(p.x + 30, p.y + 20, 6, 4, PAL.gray1, hz, spd); }); break;
      case 'tuktuk': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 8, 22, 14, PAL.sun2, hz, spd * 2.2)); break;
      case 'tram': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 8, 44, 14, PAL.sun0, hz, spd * 1.4)); break;
      case 'crowd': pts.forEach(p => { for (let i = 0; i < 3; i++) mk(p.x + i * 14, this.groundBelow(p.x, p.y) - 7, 8, 13, PAL.dusk2, hz, spd * 0.6); }); break;
      case 'yak': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 9, 26, 16, PAL.earth0, hz, spd * 0.7)); break;
      case 'pigeon': pts.forEach(p => mk(p.x, p.y, 10, 6, PAL.gray2, hz, spd * 1.5)); break;
      case 'rock': case 'gust': case 'wave': case 'ice': case 'snow': default: break; // periodic / environmental, handled in update
    }
    if (hz === 'wave') this.waterY = WORLD_Y + wh - TILE * 1.5;
    void n;
  }
  private groundBelow(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE); let cy = Math.floor((y - WORLD_Y) / TILE); while (cy < this.rows - 1 && (this.level.tiles[cy + 1][cx] || '.') !== '#') cy++; return WORLD_Y + (cy + 1) * TILE; }
  private isSolidAt(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE), cy = Math.floor((y - WORLD_Y) / TILE); if (cy < 0 || cy >= this.rows || cx < 0 || cx >= this.cols) return true; return (this.level.tiles[cy][cx] || '.') === '#'; }

  update(_t: number, dtMs: number) {
    this.frame.update(dtMs); if (!this.frame.active || this.ended) { this.player.setVelocityX(0); return; }
    const dt = Math.min(0.033, dtMs / 1000); const body = this.player.body as Phaser.Physics.Arcade.Body; const hz = this.level.hazard;
    // input state
    const kb = (this as any)._kb as { l: Phaser.Input.Keyboard.Key[]; r: Phaser.Input.Keyboard.Key[]; j: Phaser.Input.Keyboard.Key[] } | undefined;
    const dirs = [...this.touchDirs.values()]; const left = dirs.includes('left') || !!kb?.l.some(k => k.isDown), right = dirs.includes('right') || !!kb?.r.some(k => k.isDown);
    const jumpDown = dirs.includes('jump') || !!kb?.j.some(k => k.isDown);
    const tired = 1 - 0.15 * this.frame.hard; const run = PHYS.run * tired; const slippery = hz === 'ice';
    if (slippery) { const ax = (left ? -1 : right ? 1 : 0) * 500; body.setAccelerationX(ax); body.setDragX(ax === 0 ? 120 : 0); if (Math.abs(body.velocity.x) > run) body.setVelocityX(Math.sign(body.velocity.x) * run); }
    else { body.setAccelerationX(0); body.setVelocityX((left ? -run : right ? run : 0) + this.windForce); }
    if (this.windForce !== 0 && !left && !right && !slippery) body.setVelocityX(this.windForce);
    if (left) this.player.setFlipX(true); if (right) this.player.setFlipX(false);
    // jump: coyote + buffer + variable height
    const grounded = body.blocked.down || body.touching.down; if (grounded) this.coyote = 0.1; else this.coyote -= dt; this.jumpBuffer -= dt;
    const jv = (hz === 'snow' ? PHYS.snowJump : PHYS.jump) * (1 - 0.05 * this.frame.hard);
    if (this.jumpBuffer > 0 && this.coyote > 0) { body.setVelocityY(-jv); this.jumpBuffer = 0; this.coyote = 0; this.player.setScale(0.8, 1.25); this.tweens.add({ targets: this.player, scaleX: 1, scaleY: 1, duration: 140 }); }
    if (!jumpDown && !this.jumpHeld && body.velocity.y < -80) body.setVelocityY(body.velocity.y * 0.55);
    if (!jumpDown) this.jumpHeld = false;
    // fell out of the world
    const wh = this.rows * TILE; if (this.player.y > WORLD_Y + wh + 30) { this.player.setPosition(this.player.x, WORLD_Y + TILE); body.setVelocity(0, 0); this.hurt(); }
    // stamps
    const pr = new Phaser.Geom.Rectangle(this.player.x - 5, this.player.y - 7, 10, 14);
    for (const s of this.stamps) { if (s.active && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(s.x - 4, s.y - 4, 8, 8))) { s.setActive(false); this.collected++; this.refreshStatus(); this.tweens.add({ targets: s, y: 60, x: W / 2 + 30, scale: 0.6, duration: 350, ease: 'Cubic.In', onComplete: () => s.setVisible(false) }); this.frame.flash(PAL.sun2, 30); if (this.collected >= this.total) this.win(); } }
    // spikes
    if (this.iframes > 0) { this.iframes -= dt; this.player.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.3); } else { this.player.setAlpha(1); for (const sp of this.spikes) if (Phaser.Geom.Intersects.RectangleToRectangle(pr, sp)) { this.hurt(); break; } }
    // hazards
    this.updateHazards(dt, pr);
    // parallax scroll + cull (a silhouette is recycled only when its right edge has left the world)
    for (const sl of this.skyline) { sl.spr.x -= sl.spd * dt * this.ramp(); if (sl.spr.x + sl.w / 2 < 0) { const bw = Phaser.Math.Between(18, 44), bh = Phaser.Math.Between(40, 170); sl.spr.setSize(bw, bh); sl.spr.setPosition(W + bw / 2 + Phaser.Math.Between(0, 30), WORLD_Y + wh - bh / 2); sl.w = bw; sl.spd = 6 + bh / 12; } }
    // timer
    const el = (this.time.now - this.t0) / 1000; const par = this.level.parTime || PAR_DEFAULT; this.timeText.setText(`${el.toFixed(1)}s  par ${par}s  x${this.ramp().toFixed(1)}`).setColor(el > par ? '#ff6fa8' : '#b4b9c4'); this.frame.setTimer(''); this.frame.setProgress(`${this.collected}/${this.total}`);
    if (el > HARD_CAP) { this.ended = true; this.frame.finish(this.frame.scoreNow()); }
  }

  /** Difficulty ramp: 1.0 at 0 s -> 1.8 at RAMP_AT s of play. Scales hazard speeds, spawn rates, wind and homing. */
  private ramp() { const el = this.t0 ? (this.time.now - this.t0) / 1000 : 0; return 1 + 0.8 * clamp(el / RAMP_AT, 0, 1); }
  private updateHazards(dt: number, pr: Phaser.Geom.Rectangle) {
    const hz = this.level.hazard; const wh = this.rows * TILE; const body = this.player.body as Phaser.Physics.Arcade.Body; const rp = this.ramp();
    // environmental
    if (hz === 'gust') { this.windT += dt * rp; const cyc = 5 - 1.5 * this.launch.difficulty; const ph = this.windT % cyc; this.windStreaks.clear();
      if (ph > cyc - 1.2 && ph < cyc - 0.2) { const d = Math.sin(this.windT * 0.3) > 0 ? 1 : -1; (this as any)._gd = d; for (let i = 0; i < 8; i++) this.windStreaks.fillStyle(PAL.white, 0.35).fillRect(((i * 53 + this.windT * 400 * d) % W + W) % W, WORLD_Y + 20 + i * 36, 30, 1); this.windForce = 0; }
      else if (ph >= cyc - 0.2 || ph < 0.9) { const d = ((this as any)._gd as number) || 1; this.windForce = 90 * rp * d; for (let i = 0; i < 16; i++) this.windStreaks.fillStyle(PAL.sky3, 0.6).fillRect(((i * 41 + this.windT * 700 * d) % W + W) % W, WORLD_Y + 10 + i * 19, 50, 2); } else this.windForce = 0; }
    if (hz === 'rock') { this.rockT += dt; const every = (1.6 - 0.6 * this.launch.difficulty) / rp; if (this.rockT > every) { this.rockT = 0; const p = Phaser.Utils.Array.GetRandom(this.spawners.length ? this.spawners : [{ x: this.ox + TILE * Phaser.Math.Between(2, this.cols - 3), y: WORLD_Y + TILE }]); const spr = this.add.rectangle(p.x, p.y, 12, 12, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(5); this.movers.push({ spr, vx: 0, vy: 0, kind: 'rock', t: 0, x0: p.x, y0: p.y, dir: 1, alive: true, w: 12, h: 12 }); } }
    if (hz === 'wave') { this.windT += dt * rp; const amp = TILE * (4 + 3 * this.launch.difficulty); const base = WORLD_Y + wh - TILE; this.waterY = base - Math.max(0, Math.sin(this.windT * 0.5)) * amp; this.water.setPosition(W / 2, this.waterY + 200); if (this.player.y - 4 > this.waterY) { this.hurt(); this.player.setPosition(this.player.x, this.waterY - 30); body.setVelocityY(-200); } }
    for (const m of this.movers) {
      if (!m.alive) continue; m.t += dt; const s = m.spr;
      switch (m.kind) {
        case 'otter': case 'tuktuk': case 'tram': case 'crowd': case 'yak': { const sp = (m.kind === 'yak' ? (Math.abs(this.player.x - s.x) < 80 ? m.vx * 2.2 : m.vx) : m.vx) * rp; s.x += sp * m.dir * dt; const ahead = s.x + (m.w / 2 + 2) * m.dir; if (this.isSolidAt(ahead, s.y) || !this.isSolidAt(ahead, s.y + m.h / 2 + 4) && m.kind !== 'tuktuk' && m.kind !== 'tram') m.dir *= -1; if (s.x < this.ox + TILE || s.x > this.ox + (this.cols - 1) * TILE) m.dir *= -1; break; }
        case 'mosquito': { const hx = Math.sign(this.player.x - s.x), hy = Math.sign(this.player.y - s.y); s.x += (hx * 18 * rp + Math.sin(m.t * 6) * 30) * dt; s.y += (hy * 14 * rp + Math.cos(m.t * 5) * 30) * dt; s.x = clamp(s.x, this.ox + TILE, this.ox + (this.cols - 1) * TILE); s.y = clamp(s.y, WORLD_Y + TILE, WORLD_Y + wh - TILE); break; }
        case 'pigeon': { s.x += m.vx * rp * m.dir * dt; s.y = m.y0 + Math.sin(m.t * 1.6) * 60; if (s.x < this.ox + TILE || s.x > this.ox + (this.cols - 1) * TILE) m.dir *= -1; break; }
        case 'rock': { m.vy += 500 * rp * dt; s.y += m.vy * dt; if (this.isSolidAt(s.x, s.y + 7)) { m.alive = false; this.tweens.add({ targets: s, alpha: 0, scale: 1.6, duration: 150, onComplete: () => s.destroy() }); } break; }
        default: break;
      }
      if (m.alive && this.iframes <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(s.x - m.w / 2, s.y - m.h / 2, m.w, m.h))) { this.hurt(Math.sign(this.player.x - s.x) || 1); }
    }
    this.movers = this.movers.filter(m => m.alive || m.spr.active);
  }

  private hurt(kx = 1) {
    if (this.iframes > 0 || this.ended) return; this.hearts--; this.iframes = 1.2; this.refreshStatus(); this.frame.shake(160, 0.008); this.frame.flash(PAL.red, 60);
    const body = this.player.body as Phaser.Physics.Arcade.Body; body.setVelocity(140 * kx, -180);
    if (this.hearts <= 0) { this.ended = true; this.player.setTint(0x888888); this.time.delayedCall(400, () => this.frame.finish((this.collected / this.total) * 40, true)); }
  }

  private win() {
    if (this.ended) return; this.ended = true; const el = (this.time.now - this.t0) / 1000; const par = this.level.parTime || PAR_DEFAULT;
    const score = clamp(100 - (3 - this.hearts) * 15 - Math.max(0, el - par) * 1, 40, 100);
    // stamp assembly: pieces fly to centre, then the full stamp thunks down
    const cx = W / 2, cy = WORLD_Y + (this.rows * TILE) / 2; const g = this.add.graphics().setDepth(30); const pieces: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < this.total; i++) { const a = (i / this.total) * Math.PI * 2; const r = this.add.rectangle(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, 18, 18, PAL.sun2).setStrokeStyle(1, PAL.ink).setDepth(31); pieces.push(r); this.tweens.add({ targets: r, x: cx + ((i % 3) - 1) * 20, y: cy + (Math.floor(i / 3) % 3 - 1) * 20, duration: 500, delay: i * 40, ease: 'Cubic.In' }); }
    this.time.delayedCall(this.total * 40 + 600, () => { pieces.forEach(p => p.destroy()); const st = this.add.container(cx, cy - 200).setDepth(32); const ring = this.add.graphics(); ring.lineStyle(4, PAL.red).strokeCircle(0, 0, 44); ring.lineStyle(2, PAL.red).strokeCircle(0, 0, 36); st.add(ring); st.add(txt(this, 0, -6, this.level.city.toUpperCase().slice(0, 14), 9, PAL.red)); st.add(txt(this, 0, 8, 'CLEARED', 10, PAL.red)); st.setAngle(-12);
      this.tweens.add({ targets: st, y: cy, duration: 220, ease: 'Cubic.In', onComplete: () => { this.frame.shake(200, 0.01); g.fillStyle(PAL.red, 0.15).fillCircle(cx, cy, 60); this.time.delayedCall(700, () => this.frame.finish(score)); } }); });
  }
}
