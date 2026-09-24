// CARRY-ON: the platformer. D-pad left/right, A jumps (variable height), collect every stamp piece, dodge the city's hazard.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import type { ArcadeLevel, Hazard } from '../../../core/types';
import { TILE, PAR_DEFAULT, PHYS, validateLevel } from '../../carryonLevel';
import { clamp, pixTexture } from '../../_shared';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

interface Mover { spr: Phaser.GameObjects.Rectangle; vx: number; vy: number; kind: Hazard; t: number; x0: number; y0: number; dir: number; alive: boolean; w: number; h: number; }
const RAMP_AT = 40;

export class CarryOnGame implements ConsoleGame {
  readonly id = 'carryon' as const; readonly name = 'CARRY-ON'; readonly capSec = 60;
  get instructions() { return `Collect the ${this.total || 'stamp'} pieces. Dodge the ${this.level.hazard}s. D-pad moves, A jumps.`; }
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void; private level!: ArcadeLevel; private ox = 0; private oy = 0; private cols = 23; private rows = 20;
  private player!: Phaser.Physics.Arcade.Sprite; private solids!: Phaser.Physics.Arcade.StaticGroup; private oneways!: Phaser.Physics.Arcade.StaticGroup;
  private stamps: Phaser.GameObjects.Image[] = []; private spikes: Phaser.Geom.Rectangle[] = []; private movers: Mover[] = []; private spawners: { x: number; y: number }[] = [];
  private crumbles: { img: Phaser.Physics.Arcade.Image; t: number }[] = [];
  private hearts = 3; private collected = 0; private total = 0; private t = 0; private iframes = 0; private windForce = 0; private windT = 0; private waterY = 0; private rockT = 0; private gd = 1;
  private jumpBuffer = 0; private coyote = 0; private jumpHeld = false; private ended = false;
  private objs: Phaser.GameObjects.GameObject[] = []; private windStreaks!: Phaser.GameObjects.Graphics; private water!: Phaser.GameObjects.Rectangle;
  private skyline: { spr: Phaser.GameObjects.Rectangle; spd: number; w: number }[] = [];

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; this.level = ctx.level; const s = ctx.scene;
    this.rows = this.level.tiles.length; this.cols = Math.max(...this.level.tiles.map(r => r.length));
    this.ox = Math.round(ctx.screen.x + (ctx.screen.width - this.cols * TILE) / 2); this.oy = Math.round(ctx.screen.y + (ctx.screen.height - this.rows * TILE) / 2);
    const issues = validateLevel(this.level); if (issues.length) console.warn('[CarryOn] level issues:', this.level.city, issues);
    const [bg, mid, fg] = ctx.palette; const D = ctx.depth;
    this.textures(fg);
    this.objs.push(s.add.rectangle(ctx.screen.centerX, ctx.screen.centerY, ctx.screen.width, ctx.screen.height, bg).setDepth(D));
    for (let x = -10; x < ctx.screen.width + 60; x += 24 + Math.floor(ctx.rng() * 16)) this.sil(ctx.screen.x + x, mid);
    this.solids = s.physics.add.staticGroup(); this.oneways = s.physics.add.staticGroup(); let sx = this.ox + TILE, sy = this.oy + TILE;
    this.level.tiles.forEach((row, y) => [...row].forEach((c, x) => {
      const px = this.ox + x * TILE + TILE / 2, py = this.oy + y * TILE + TILE / 2;
      if (c === '#') { const img = this.solids.create(px, py, 'co_tile') as Phaser.Physics.Arcade.Image; img.setDepth(D + 3); img.refreshBody(); }
      else if (c === '-' || c === 'C') { const img = this.oneways.create(px, py - 5, c === 'C' ? 'co_crumble' : 'co_oneway') as Phaser.Physics.Arcade.Image; img.setDepth(D + 3); img.refreshBody(); const b = img.body as Phaser.Physics.Arcade.StaticBody; b.checkCollision.down = false; b.checkCollision.left = false; b.checkCollision.right = false; if (c === 'C') this.crumbles.push({ img, t: 0 }); }
      else if (c === '*') { const st = s.add.image(px, py, 'co_stamp').setDepth(D + 4); s.tweens.add({ targets: st, y: py - 3, duration: 600 + (x * 37) % 300, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); this.stamps.push(st); this.total++; }
      else if (c === '^') { this.objs.push(s.add.image(px, py + 2, 'co_spike').setDepth(D + 4)); this.spikes.push(new Phaser.Geom.Rectangle(px - 6, py - 2, 12, 10)); }
      else if (c === 'S') { sx = px; sy = py; }
      else if (c === 'H') this.spawners.push({ x: px, y: py });
    }));
    this.player = s.physics.add.sprite(sx, sy, 'co_player').setDepth(D + 6); this.player.setSize(10, 13).setOffset(1, 1); this.player.setMaxVelocity(220, 620);
    s.physics.add.collider(this.player, this.solids); s.physics.add.collider(this.player, this.oneways);
    this.windStreaks = s.add.graphics().setDepth(D + 5); this.objs.push(this.windStreaks);
    this.water = s.add.rectangle(ctx.screen.centerX, ctx.screen.bottom + 200, ctx.screen.width, 400, PAL.sea1, 0.75).setDepth(D + 7).setVisible(this.level.hazard === 'wave'); this.objs.push(this.water);
    this.spawnHazards(); this.ctx.setHearts(this.hearts, 3); this.ctx.setStatus(`${this.collected}/${this.total}`);
  }

  private textures(fg: number) {
    const s = this.ctx.scene;
    pixTexture(s, 'co_tile', ['AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'AAAAAAAAAAAAAAAA', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'ABBBBBBBABBBBBBB', 'AAAAAAAAAAAAAAAA', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB', 'ABBBABBBBBBBABBB'], { A: PAL.ink, B: fg });
    pixTexture(s, 'co_oneway', ['AAAAAAAAAAAAAAAA', 'ACCCCCCCCCCCCCCA', 'AAAAAAAAAAAAAAAA', '.A..A..A..A..A..'], { A: PAL.ink, C: PAL.earth3 });
    pixTexture(s, 'co_crumble', ['AAAAAAAAAAAAAAAA', 'ADDADDDADDADDDDA', 'AAAAAAAAAAAAAAAA', '..A.....A....A..'], { A: PAL.ink, D: PAL.earth2 });
    pixTexture(s, 'co_stamp', ['..AAAA..', '.ABBBBA.', 'ABBCCBBA', 'ABCDDCBA', 'ABCDDCBA', 'ABBCCBBA', '.ABBBBA.', '..AAAA..'], { A: PAL.ink, B: PAL.sun1, C: PAL.sun2, D: PAL.white });
    pixTexture(s, 'co_spike', ['.....A......A...', '....ABA....ABA..', '...ABBBA..ABBBA.', '..ABBBBBAABBBBBA', '.AAAAAAAAAAAAAAA'], { A: PAL.ink, B: PAL.gray2 });
    pixTexture(s, 'co_player', ['..AAAAAA..', '.ABBBBBBA.', '.ABCCBCCA.', '.ABBBBBBA.', '..ADDDDA..', '.AEEEEEEA.', 'AEEFFFFEEA', 'AEEFFFFEEA', '.AEEEEEEA.', '..AGGGGA..', '..AG..GA..', '..AG..GA..', '..AA..AA..', '.AHA..AHA.', '..........'], { A: PAL.ink, B: PAL.earth3, C: PAL.ink, D: PAL.earth1, E: PAL.sun0, F: PAL.sun1, G: PAL.night3, H: PAL.gray2 });
  }
  private sil(x: number, mid: number) { const s = this.ctx.scene; const bw = 18 + Math.floor(this.ctx.rng() * 26), bh = 40 + Math.floor(this.ctx.rng() * 130); const r = s.add.rectangle(x + bw / 2, this.ctx.screen.bottom - bh / 2, bw, bh, mid, 0.6).setDepth(this.ctx.depth + 1); this.skyline.push({ spr: r, spd: 6 + bh / 12, w: bw }); this.objs.push(r); }

  private spawnHazards() {
    const hz = this.level.hazard; const s = this.ctx.scene; const D = this.ctx.depth;
    const mk = (x: number, y: number, w: number, h: number, color: number, kind: Hazard, vx = 0): Mover => { const spr = s.add.rectangle(x, y, w, h, color).setStrokeStyle(1, PAL.ink).setDepth(D + 5); const m: Mover = { spr, vx, vy: 0, kind, t: this.ctx.rng() * 10, x0: x, y0: y, dir: 1, alive: true, w, h }; this.movers.push(m); return m; };
    const pts = this.spawners.length ? this.spawners : [{ x: this.ctx.screen.centerX, y: this.oy + TILE * 2 }]; const spd = 30 + 30 * this.ctx.difficulty;
    switch (hz) {
      case 'otter': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 6, 14, 10, PAL.earth2, hz, spd)); break;
      case 'mosquito': pts.forEach(p => { mk(p.x, p.y, 6, 4, PAL.gray1, hz, spd); mk(p.x + 30, p.y + 20, 6, 4, PAL.gray1, hz, spd); }); break;
      case 'tuktuk': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 8, 22, 14, PAL.sun2, hz, spd * 2.2)); break;
      case 'tram': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 8, 44, 14, PAL.sun0, hz, spd * 1.4)); break;
      case 'crowd': pts.forEach(p => { for (let i = 0; i < 3; i++) mk(p.x + i * 14, this.groundBelow(p.x, p.y) - 7, 8, 13, PAL.dusk2, hz, spd * 0.6); }); break;
      case 'yak': pts.forEach(p => mk(p.x, this.groundBelow(p.x, p.y) - 9, 26, 16, PAL.earth0, hz, spd * 0.7)); break;
      case 'pigeon': pts.forEach(p => mk(p.x, p.y, 10, 6, PAL.gray2, hz, spd * 1.5)); break;
      default: break;   // rock / gust / wave / ice / snow are environmental, handled in update
    }
    if (hz === 'wave') this.waterY = this.oy + this.rows * TILE - TILE * 1.5;
  }
  private groundBelow(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE); let cy = Math.floor((y - this.oy) / TILE); while (cy < this.rows - 1 && (this.level.tiles[cy + 1][cx] || '.') !== '#') cy++; return this.oy + (cy + 1) * TILE; }
  private isSolidAt(x: number, y: number) { const cx = Math.floor((x - this.ox) / TILE), cy = Math.floor((y - this.oy) / TILE); if (cy < 0 || cy >= this.rows || cx < 0 || cx >= this.cols) return true; return (this.level.tiles[cy][cx] || '.') === '#'; }
  private ramp() { return 1 + 0.8 * clamp(this.t / RAMP_AT, 0, 1); }

  update(dtIn: number, pad: Pad) {
    if (this.ended) { this.player.setVelocityX(0); return; }
    const dt = Math.min(0.033, dtIn); this.t += dt; const body = this.player.body as Phaser.Physics.Arcade.Body; const hz = this.level.hazard; const rp = this.ramp();
    const left = pad.held('left'), right = pad.held('right'); if (pad.justPressed('a')) { this.jumpBuffer = 0.12; this.jumpHeld = true; }
    const run = PHYS.run * (1 - 0.15 * this.ctx.hard); const slippery = hz === 'ice';
    if (slippery) { const ax = (left ? -1 : right ? 1 : 0) * 500; body.setAccelerationX(ax); body.setDragX(ax === 0 ? 120 : 0); if (Math.abs(body.velocity.x) > run) body.setVelocityX(Math.sign(body.velocity.x) * run); }
    else { body.setAccelerationX(0); body.setVelocityX((left ? -run : right ? run : 0) + this.windForce); }
    if (left) this.player.setFlipX(true); if (right) this.player.setFlipX(false);
    const grounded = body.blocked.down || body.touching.down; if (grounded) this.coyote = 0.1; else this.coyote -= dt; this.jumpBuffer -= dt;
    const jv = (hz === 'snow' ? PHYS.snowJump : PHYS.jump) * (1 - 0.04 * this.ctx.hard);
    if (this.jumpBuffer > 0 && this.coyote > 0) { body.setVelocityY(-jv); this.jumpBuffer = 0; this.coyote = 0; this.player.setScale(0.8, 1.25); this.ctx.scene.tweens.add({ targets: this.player, scaleX: 1, scaleY: 1, duration: 140 }); this.ctx.sfx('jump'); }
    if (!pad.held('a')) { if (this.jumpHeld && body.velocity.y < -80) body.setVelocityY(body.velocity.y * 0.55); this.jumpHeld = false; }
    // crumble platforms give way 0.35 s after you stand on them
    for (const c of this.crumbles) { if (!c.img.active) continue; const b = c.img.body as Phaser.Physics.Arcade.StaticBody; const on = grounded && Math.abs(this.player.x - c.img.x) < 10 && Math.abs((this.player.y + 7) - b.y) < 8; if (on || c.t > 0) c.t += dt; if (c.t > 0.35) { c.img.disableBody(true, true); this.ctx.scene.tweens.add({ targets: c.img, alpha: 0, duration: 100 }); } }
    const wh = this.rows * TILE; if (this.player.y > this.oy + wh + 30) { this.player.setPosition(this.player.x, this.oy + TILE); body.setVelocity(0, 0); this.hurt(); }
    const pr = new Phaser.Geom.Rectangle(this.player.x - 5, this.player.y - 7, 10, 14);
    for (const st of this.stamps) if (st.active && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(st.x - 4, st.y - 4, 8, 8))) { st.setActive(false); this.collected++; this.ctx.setStatus(`${this.collected}/${this.total}`); this.ctx.scene.tweens.add({ targets: st, y: this.ctx.screen.y + 8, x: this.ctx.screen.right - 30, scale: 0.6, duration: 350, ease: 'Cubic.In', onComplete: () => st.setVisible(false) }); this.ctx.flash(PAL.sun2, 30); this.ctx.sfx('coin'); if (this.collected >= this.total) this.win(); }
    if (this.iframes > 0) { this.iframes -= dt; this.player.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.3); } else { this.player.setAlpha(1); for (const sp of this.spikes) if (Phaser.Geom.Intersects.RectangleToRectangle(pr, sp)) { this.hurt(); break; } }
    this.hazards(dt, pr, rp);
    for (const sl of this.skyline) { sl.spr.x -= sl.spd * dt * rp; if (sl.spr.x + sl.w / 2 < this.ctx.screen.x) { const bw = 18 + Math.floor(this.ctx.rng() * 26), bh = 40 + Math.floor(this.ctx.rng() * 130); sl.spr.setSize(bw, bh); sl.spr.setPosition(this.ctx.screen.right + bw / 2 + this.ctx.rng() * 30, this.ctx.screen.bottom - bh / 2); sl.w = bw; sl.spd = 6 + bh / 12; } }
  }

  private hazards(dt: number, pr: Phaser.Geom.Rectangle, rp: number) {
    const hz = this.level.hazard; const s = this.ctx.scene; const body = this.player.body as Phaser.Physics.Arcade.Body; const W = this.ctx.screen; const D = this.ctx.depth;
    if (hz === 'gust') { this.windT += dt * rp; const cyc = 5 - 1.5 * this.ctx.difficulty; const ph = this.windT % cyc; this.windStreaks.clear();
      if (ph > cyc - 1.2 && ph < cyc - 0.2) { this.gd = Math.sin(this.windT * 0.3) > 0 ? 1 : -1; for (let i = 0; i < 8; i++) this.windStreaks.fillStyle(PAL.white, 0.35).fillRect(W.x + ((i * 53 + this.windT * 400 * this.gd) % W.width + W.width) % W.width, W.y + 20 + i * 36, 30, 1); this.windForce = 0; }
      else if (ph >= cyc - 0.2 || ph < 0.9) { this.windForce = 90 * rp * this.gd; for (let i = 0; i < 16; i++) this.windStreaks.fillStyle(PAL.sky3, 0.6).fillRect(W.x + ((i * 41 + this.windT * 700 * this.gd) % W.width + W.width) % W.width, W.y + 10 + i * 19, 50, 2); } else this.windForce = 0; }
    if (hz === 'rock') { this.rockT += dt; const every = (1.6 - 0.6 * this.ctx.difficulty) / rp; if (this.rockT > every) { this.rockT = 0; const pts = this.spawners.length ? this.spawners : [{ x: this.ox + TILE * (2 + Math.floor(this.ctx.rng() * (this.cols - 4))), y: this.oy + TILE }]; const p = pts[Math.floor(this.ctx.rng() * pts.length)]; const spr = s.add.rectangle(p.x + (this.ctx.rng() - 0.5) * 40, p.y, 12, 12, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5); this.movers.push({ spr, vx: 0, vy: 0, kind: 'rock', t: 0, x0: p.x, y0: p.y, dir: 1, alive: true, w: 12, h: 12 }); } }
    if (hz === 'wave') { this.windT += dt * rp; const amp = TILE * (4 + 3 * this.ctx.difficulty); const base = this.oy + this.rows * TILE - TILE; this.waterY = base - Math.max(0, Math.sin(this.windT * 0.5)) * amp; this.water.setPosition(W.centerX, this.waterY + 200); if (this.player.y - 4 > this.waterY) { this.hurt(); this.player.setPosition(this.player.x, this.waterY - 30); body.setVelocityY(-200); } }
    for (const m of this.movers) {
      if (!m.alive) continue; m.t += dt; const sp = m.spr;
      switch (m.kind) {
        case 'otter': case 'tuktuk': case 'tram': case 'crowd': case 'yak': { const v = (m.kind === 'yak' ? (Math.abs(this.player.x - sp.x) < 80 ? m.vx * 2.2 : m.vx) : m.vx) * rp; sp.x += v * m.dir * dt; const ahead = sp.x + (m.w / 2 + 2) * m.dir; if (this.isSolidAt(ahead, sp.y) || (!this.isSolidAt(ahead, sp.y + m.h / 2 + 4) && m.kind !== 'tuktuk' && m.kind !== 'tram')) m.dir *= -1; if (sp.x < this.ox + TILE || sp.x > this.ox + (this.cols - 1) * TILE) m.dir *= -1; break; }
        case 'mosquito': { const hx = Math.sign(this.player.x - sp.x), hy = Math.sign(this.player.y - sp.y); sp.x += (hx * 18 * rp + Math.sin(m.t * 6) * 30) * dt; sp.y += (hy * 14 * rp + Math.cos(m.t * 5) * 30) * dt; sp.x = clamp(sp.x, this.ox + TILE, this.ox + (this.cols - 1) * TILE); sp.y = clamp(sp.y, this.oy + TILE, this.oy + this.rows * TILE - TILE); break; }
        case 'pigeon': { sp.x += m.vx * rp * m.dir * dt; sp.y = m.y0 + Math.sin(m.t * 1.6) * 60; if (sp.x < this.ox + TILE || sp.x > this.ox + (this.cols - 1) * TILE) m.dir *= -1; break; }
        case 'rock': { m.vy += 500 * rp * dt; sp.y += m.vy * dt; if (this.isSolidAt(sp.x, sp.y + 7)) { m.alive = false; s.tweens.add({ targets: sp, alpha: 0, scale: 1.6, duration: 150, onComplete: () => sp.destroy() }); } break; }
        default: break;
      }
      if (m.alive && this.iframes <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(sp.x - m.w / 2, sp.y - m.h / 2, m.w, m.h))) this.hurt(Math.sign(this.player.x - sp.x) || 1);
    }
    this.movers = this.movers.filter(m => m.alive || m.spr.active);
  }

  private hurt(kx = 1) {
    if (this.iframes > 0 || this.ended) return; this.hearts--; this.iframes = 1.2; this.ctx.setHearts(this.hearts, 3); this.ctx.shake(160, 0.008); this.ctx.flash(PAL.red, 60); this.ctx.sfx('hurt');
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(140 * kx, -180);
    if (this.hearts <= 0) { this.ended = true; this.player.setTint(0x888888); this.ctx.scene.time.delayedCall(400, () => this.done({ score: (this.collected / Math.max(1, this.total)) * 40, failed: true })); }
  }
  private win() {
    if (this.ended) return; this.ended = true; const par = this.level.parTime || PAR_DEFAULT; const score = clamp(100 - (3 - this.hearts) * 15 - Math.max(0, this.t - par), 40, 100);
    const s = this.ctx.scene; const cx = this.ctx.screen.centerX, cy = this.ctx.screen.centerY; const D = this.ctx.depth; const pieces: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < this.total; i++) { const a = (i / this.total) * Math.PI * 2; const r = s.add.rectangle(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, 18, 18, PAL.sun2).setStrokeStyle(1, PAL.ink).setDepth(D + 31); pieces.push(r); s.tweens.add({ targets: r, x: cx + ((i % 3) - 1) * 20, y: cy + (Math.floor(i / 3) % 3 - 1) * 20, duration: 500, delay: i * 40, ease: 'Cubic.In' }); }
    s.time.delayedCall(this.total * 40 + 600, () => { pieces.forEach(p => p.destroy()); const st = s.add.container(cx, cy - 200).setDepth(D + 32); const ring = s.add.graphics(); ring.lineStyle(4, PAL.red).strokeCircle(0, 0, 44); ring.lineStyle(2, PAL.red).strokeCircle(0, 0, 36); st.add(ring);
      st.add(s.add.text(0, -6, this.ctx.cityName.toUpperCase().slice(0, 14), { fontFamily: 'monospace', fontSize: '9px', color: '#d63c3c' }).setOrigin(0.5)); st.add(s.add.text(0, 8, 'CLEARED', { fontFamily: 'monospace', fontSize: '10px', color: '#d63c3c' }).setOrigin(0.5)); st.setAngle(-12); this.objs.push(st);
      s.tweens.add({ targets: st, y: cy, duration: 220, ease: 'Cubic.In', onComplete: () => { this.ctx.shake(200, 0.01); this.ctx.sfx('stamp'); s.time.delayedCall(700, () => this.done({ score, perfect: score >= 99 })); } }); });
  }
  scoreNow() { return (this.collected / Math.max(1, this.total)) * 70; }
  /** Scene-owned objects go with the scene; the static groups are torn down by Phaser itself (clearing them during SHUTDOWN throws). */
  destroy() { const kill = (o?: { destroy: () => void; active?: boolean }) => { try { if (o && (o as any).scene) o.destroy(); } catch { /* already gone */ } }; this.objs.forEach(kill); this.stamps.forEach(kill); this.movers.forEach(m => kill(m.spr)); kill(this.player); }
}
