// DRONE RUN: a vertical scroller. The DJI flies up over the city. D-pad moves, A shoots photos, B drops a battery bomb (2). Survive 40 s.
// Enemies: seagulls in every city (they swoop at where you are), plus the city's own hazard where it flies. Rooftop clutter crowds the edges.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import type { Hazard } from '../../../core/types';
import { clamp, pixTexture } from '../../_shared';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

type FoeKind = 'gull' | 'flyer' | 'homer' | 'rock';
interface Foe { spr: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle; kind: FoeKind; t: number; hp: number; alive: boolean; vx: number; vy: number; phase: 'enter' | 'hover' | 'dive' | 'exit'; tx: number; ty: number; hoverT: number; anim: number; }
interface Clutter { spr: Phaser.GameObjects.Container; w: number; h: number; solid: boolean; loose: boolean; }
const DUR = 40;

export class HeliGame implements ConsoleGame {
  readonly id = 'heli' as const; readonly name = 'DRONE RUN'; readonly controls = ['D-PAD  fly', 'A      shoot photos', 'B      battery bomb (2)']; readonly capSec = 44;
  readonly instructions = `Fly the drone up the city for ${DUR} s. Seagulls swoop. D-pad moves, A shoots photos, B drops a battery (2). 3 hearts.`;
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void;
  private drone!: Phaser.GameObjects.Image; private shots: Phaser.GameObjects.Rectangle[] = []; private foes: Foe[] = []; private clutter: Clutter[] = []; private marks: Phaser.GameObjects.Rectangle[] = []; private crates: Phaser.GameObjects.Rectangle[] = [];
  private t = 0; private hearts = 3; private hits = 0; private bombs = 2; private iframes = 0; private fireT = 0; private gullT = 0; private hazT = 0; private crateT = 0; private ended = false; private scroll = 60;
  private objs: Phaser.GameObjects.GameObject[] = []; private hazKind: FoeKind | null = null; private gust = 0; private gustT = 0; private nextClutterY = 0;

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; const s = ctx.scene; const S = ctx.screen; const D = ctx.depth;
    this.hazKind = ({ pigeon: 'flyer', mosquito: 'homer', rock: 'rock', ice: 'rock', snow: 'rock', gust: null, wave: null, otter: null, tuktuk: null, tram: null, crowd: null, yak: null } as Record<Hazard, FoeKind | null>)[ctx.hazard] ?? null;
    this.textures();
    this.objs.push(s.add.rectangle(S.centerX, S.centerY, S.width, S.height, ctx.palette[0]).setDepth(D));
    // the avenue down the middle; rooftops either side
    this.objs.push(s.add.rectangle(S.centerX, S.centerY, 96, S.height, ctx.palette[1]).setDepth(D + 1));
    for (let y = S.y - 20; y < S.bottom + 40; y += 44) { const m = s.add.rectangle(S.centerX, y, 3, 14, PAL.sun3, 0.45).setDepth(D + 2); this.marks.push(m); this.objs.push(m); }
    this.nextClutterY = S.y - 30; for (let y = S.y - 30; y < S.bottom + 60; y += 36 + Math.floor(ctx.rng() * 20)) this.spawnClutterRow(y);
    this.drone = s.add.image(S.centerX, S.bottom - 40, 'co_drone').setDepth(D + 8); this.objs.push(this.drone);
    ctx.setHearts(this.hearts, 3); ctx.setStatus(`0 hits · ${this.bombs} batt`);
  }
  private textures() {
    const s = this.ctx.scene;
    pixTexture(s, 'co_drone', ['A....AA....A', 'AA..AAAA..AA', '.AAABBBBAAA.', '..ABBCCBBA..', '..ABBCCBBA..', '.AAABBBBAAA.', 'AA..AAAA..AA', 'A....AA....A'], { A: PAL.gray2, B: PAL.gray1, C: PAL.red });
    // seagull: two wing frames (up / down), white body, grey wings, yellow beak
    pixTexture(s, 'co_gull0', ['B......B..', '.BB..BB...', '..BBBBB...', '...WWWW.Y.', '....WW....'], { B: PAL.gray2, W: PAL.white, Y: PAL.sun2 });
    pixTexture(s, 'co_gull1', ['..........', '...WWWW.Y.', 'BBBBWWBBBB', 'B..BWWB..B', '..........'], { B: PAL.gray2, W: PAL.white, Y: PAL.sun2 });
    pixTexture(s, 'co_tank', ['..AAAA..', '.ABBBBA.', 'ABBBBBBA', 'ABBBBBBA', 'ABBBBBBA', '.AAAAAA.', '..A..A..', '..A..A..'], { A: PAL.ink, B: PAL.gray2 });
    pixTexture(s, 'co_ac', ['AAAAAAAAAA', 'ABBBBBBBBA', 'ABCCCCCCBA', 'ABCBBBBCBA', 'ABBBBBBBBA', 'AAAAAAAAAA'], { A: PAL.ink, B: PAL.gray1, C: PAL.gray0 });
    pixTexture(s, 'co_antenna', ['...A...', '..AAA..', '...A...', '.AAAAA.', '...A...', '...A...', '...A...', '..AAA..'], { A: PAL.gray2 });
    pixTexture(s, 'co_crane', ['AAAAAAAAAAAAAAAAAAAA', '.A...A...A...A......', '.A..................', '.A..................', 'AAA.................'], { A: PAL.sun1 });
  }

  /** One row of rooftop clutter on each edge; sometimes something juts toward the avenue. A few pieces are loose (the battery bomb knocks them off). */
  private spawnClutterRow(y: number) {
    const s = this.ctx.scene; const S = this.ctx.screen; const rng = this.ctx.rng; const D = this.ctx.depth;
    for (const side of [-1, 1]) {
      const kinds = ['tank', 'ac', 'antenna', 'laundry', 'crane', 'block'] as const; const kind = kinds[Math.floor(rng() * kinds.length)];
      const c = s.add.container(0, y).setDepth(D + 3); let w = 30, h = 20; let solid = true, loose = false;
      const jut = rng() < 0.25 ? 24 + rng() * 24 : 0;                                  // juts into the flight lane
      const edgeX = side < 0 ? S.x + 10 + rng() * 40 : S.right - 10 - rng() * 40;
      switch (kind) {
        case 'block': { w = 34 + rng() * 40; h = 22 + rng() * 18; c.add(s.add.rectangle(0, 0, w, h, this.ctx.palette[2], 0.55).setStrokeStyle(1, PAL.ink)); break; }
        case 'tank': { w = 16; h = 16; c.add(s.add.rectangle(0, 0, 28, 20, this.ctx.palette[2], 0.5)); c.add(s.add.image(0, -2, 'co_tank').setScale(2)); loose = true; break; }
        case 'ac': { w = 20; h = 12; c.add(s.add.rectangle(0, 0, 30, 18, this.ctx.palette[2], 0.5)); c.add(s.add.image(0, 0, 'co_ac').setScale(2)); loose = true; break; }
        case 'antenna': { w = 6; h = 16; c.add(s.add.rectangle(0, 4, 26, 14, this.ctx.palette[2], 0.5)); c.add(s.add.image(0, -4, 'co_antenna').setScale(2)); loose = true; break; }
        case 'laundry': { w = 44; h = 6; const line = s.add.rectangle(0, 0, 44, 1, PAL.white, 0.8); c.add(line); for (let i = 0; i < 4; i++) c.add(s.add.rectangle(-16 + i * 11, 4, 6, 7, [PAL.sky2, PAL.pink, PAL.sun3, PAL.grass3][i])); solid = false; break; }
        case 'crane': { w = 40; h = 10; c.add(s.add.image(side < 0 ? 12 : -12, -4, 'co_crane').setScale(2).setFlipX(side > 0)); c.add(s.add.rectangle(side < 0 ? -14 : 14, 10, 4, 24, PAL.sun1)); h = 28; break; }
      }
      c.x = edgeX + side * (jut ? -jut : 0);
      this.clutter.push({ spr: c, w, h, solid, loose }); this.objs.push(c);
    }
    // the odd crate in the avenue (fewer than before)
    if (rng() < 0.2) { const cr = s.add.rectangle(S.centerX + (rng() - 0.5) * 50, y, 16, 16, PAL.earth2).setStrokeStyle(1, PAL.ink).setDepth(D + 3); this.crates.push(cr); this.objs.push(cr); }
  }

  private spawnGull() {
    const s = this.ctx.scene; const S = this.ctx.screen; const rng = this.ctx.rng;
    const fromSide = rng() < 0.4; const side = rng() < 0.5 ? -1 : 1;
    const x = fromSide ? (side < 0 ? S.x - 12 : S.right + 12) : S.x + 16 + rng() * (S.width - 32); const y = fromSide ? S.y + 20 + rng() * (S.height * 0.4) : S.y - 12;
    const spr = s.add.sprite(x, y, 'co_gull0').setDepth(this.ctx.depth + 6).setScale(2).setFlipX(x > this.drone.x);
    this.foes.push({ spr, kind: 'gull', t: 0, hp: 1, alive: true, vx: fromSide ? -side * 70 : 0, vy: fromSide ? 20 : 55, phase: 'enter', tx: this.drone.x, ty: this.drone.y, hoverT: rng() < 0.45 ? 0.5 + rng() * 0.5 : 0, anim: rng() * 3 });
    this.objs.push(spr);
  }
  private spawnHazardFoe() {
    const s = this.ctx.scene; const S = this.ctx.screen; const rng = this.ctx.rng; const D = this.ctx.depth; const k = this.hazKind!;
    const spr = k === 'rock' ? s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 10, 14, 14, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5)
      : k === 'homer' ? s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 8, 8, 6, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5)
      : s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 8, 12, 8, PAL.gray2).setStrokeStyle(1, PAL.ink).setDepth(D + 5);
    this.foes.push({ spr, kind: k, t: rng() * 6, hp: k === 'rock' ? 2 : 1, alive: true, vx: 40, vy: k === 'rock' ? 90 + 60 * this.ctx.difficulty : 45 + 20 * this.ctx.difficulty, phase: 'dive', tx: 0, ty: 0, hoverT: 0, anim: 0 }); this.objs.push(spr);
  }

  update(dt: number, pad: Pad) {
    if (this.ended) return; const S = this.ctx.screen; this.t += dt; const ramp = 1 + 0.8 * clamp(this.t / DUR, 0, 1);
    // drone: D-pad, gusts, and clutter pushes you back into the lane
    const sp = 130; let nx = clamp(this.drone.x + pad.axisX * sp * dt + this.gust * dt, S.x + 10, S.right - 10); let ny = clamp(this.drone.y + pad.axisY * sp * dt, S.y + 16, S.bottom - 12);
    if (this.ctx.hazard === 'gust') { this.gustT += dt; if (this.gustT > 4) { this.gustT = 0; this.gust = (this.ctx.rng() < 0.5 ? -1 : 1) * 70; this.ctx.scene.time.delayedCall(900, () => { this.gust = 0; }); } }
    const dr = new Phaser.Geom.Rectangle(nx - 5, ny - 4, 10, 8);
    for (const c of this.clutter) { if (!c.solid || !c.spr.active) continue; const r = new Phaser.Geom.Rectangle(c.spr.x - c.w / 2, c.spr.y - c.h / 2, c.w, c.h); if (Phaser.Geom.Intersects.RectangleToRectangle(dr, r)) { nx = this.drone.x; ny = this.drone.y; if (this.iframes <= 0 && this.t > 1) this.hurt(); break; } }
    this.drone.setPosition(nx, ny);
    // shooting / bomb
    this.fireT -= dt; if (pad.held('a') && this.fireT <= 0) { this.fireT = 0.18; const sh = this.ctx.scene.add.rectangle(this.drone.x, this.drone.y - 8, 2, 8, PAL.white).setDepth(this.ctx.depth + 5); this.shots.push(sh); this.objs.push(sh); this.ctx.sfx('blip'); }
    if (pad.justPressed('b') && this.bombs > 0) { this.bombs--; this.ctx.flash(PAL.white, 120); this.ctx.shake(200, 0.01); this.ctx.sfx('pop');
      for (const f of this.foes) if (f.alive) { f.alive = false; this.hits++; this.ctx.scene.tweens.add({ targets: f.spr, alpha: 0, scale: 2.4, duration: 200, onComplete: () => f.spr.destroy() }); }
      for (const c of this.clutter) if (c.loose && c.spr.active) { c.solid = false; this.ctx.scene.tweens.add({ targets: c.spr, y: c.spr.y + 60, angle: 40, alpha: 0, duration: 500, onComplete: () => c.spr.destroy() }); }
      this.status(); }
    for (const sh of this.shots) sh.y -= 260 * dt; this.shots = this.shots.filter(sh => { if (sh.y < S.y) { sh.destroy(); return false; } return true; });
    // scroll the city; recycle rows
    const dy = this.scroll * ramp * dt; for (const m of this.marks) { m.y += dy; if (m.y > S.bottom + 10) m.y -= S.height + 40; }
    for (const c of this.clutter) c.spr.y += dy; for (const cr of this.crates) cr.y += dy;
    this.clutter = this.clutter.filter(c => { if (c.spr.y > S.bottom + 40) { c.spr.destroy(); return false; } return c.spr.active; }); this.crates = this.crates.filter(cr => { if (cr.y > S.bottom + 20) { cr.destroy(); return false; } return true; });
    this.nextClutterY += dy; if (this.nextClutterY > S.y - 30) { this.spawnClutterRow(S.y - 40 - this.ctx.rng() * 20); this.nextClutterY = S.y - 30 - (36 + this.ctx.rng() * 20); }
    for (const cr of this.crates) if (this.iframes <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(dr, new Phaser.Geom.Rectangle(cr.x - 8, cr.y - 8, 16, 16))) { this.hurt(); break; }
    // spawn pacing ramps with time: gulls every 1.6 s → 0.7 s; hazard foes slower
    this.gullT += dt; if (this.gullT > Math.max(0.55, 1.6 / ramp - 0.2 * this.ctx.difficulty)) { this.gullT = 0; this.spawnGull(); }
    if (this.hazKind) { this.hazT += dt; if (this.hazT > Math.max(0.8, 2.2 / ramp)) { this.hazT = 0; this.spawnHazardFoe(); } }
    // foes
    for (const f of this.foes) {
      if (!f.alive) continue; f.t += dt; const s = f.spr;
      if (f.kind === 'gull') {
        f.anim += dt * 10; (s as Phaser.GameObjects.Sprite).setTexture(Math.floor(f.anim) % 2 ? 'co_gull1' : 'co_gull0');
        if (f.phase === 'enter') { s.x += f.vx * dt; s.y += f.vy * ramp * dt; const inside = s.x > S.x + 14 && s.x < S.right - 14 && s.y > S.y + 30; if (inside && f.t > 0.5) { f.phase = f.hoverT ? 'hover' : 'dive'; f.tx = this.drone.x; f.ty = this.drone.y; } }
        else if (f.phase === 'hover') { f.hoverT -= dt; s.y += Math.sin(f.t * 12) * 20 * dt; s.x += Math.sign(this.drone.x - s.x) * 30 * dt; if (f.hoverT <= 0) { f.phase = 'dive'; f.tx = this.drone.x; f.ty = this.drone.y; } }
        else if (f.phase === 'dive') { const ang = Math.atan2(f.ty - s.y, f.tx - s.x); const v = (170 + 50 * this.ctx.difficulty) * ramp; s.x += Math.cos(ang) * v * dt; s.y += Math.sin(ang) * v * dt; (s as Phaser.GameObjects.Sprite).setFlipX(Math.cos(ang) < 0); if (Math.hypot(f.tx - s.x, f.ty - s.y) < 8) { f.phase = 'exit'; f.vx = Math.cos(ang) * 120; f.vy = Math.max(60, Math.sin(ang) * 140); } }
        else { s.x += f.vx * dt; s.y += f.vy * dt; }
        if (s.y > S.bottom + 20 || s.x < S.x - 30 || s.x > S.right + 30) { f.alive = false; s.destroy(); continue; }
      } else {
        if (f.kind === 'flyer') { s.x += Math.sin(f.t * 2.5) * 60 * dt; s.y += f.vy * ramp * dt; }
        else if (f.kind === 'homer') { s.x += Math.sign(this.drone.x - s.x) * 45 * ramp * dt; s.y += (f.vy + Math.sign(this.drone.y - s.y) * 25) * dt; }
        else { s.y += f.vy * ramp * dt; }
        if (s.y > S.bottom + 20) { f.alive = false; s.destroy(); continue; }
      }
      const fb = s.getBounds();
      for (const sh of this.shots) if (sh.active && Phaser.Geom.Intersects.RectangleToRectangle(new Phaser.Geom.Rectangle(sh.x - 1, sh.y - 4, 2, 8), fb)) { sh.destroy(); f.hp--; if (f.hp <= 0) { f.alive = false; this.hits++; this.ctx.sfx('coin'); this.ctx.scene.tweens.add({ targets: s, alpha: 0, scale: (s.scale || 1) * 1.6, duration: 150, onComplete: () => s.destroy() }); this.status(); } break; }
      if (f.alive && this.iframes <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(dr, fb)) { f.alive = false; s.destroy(); this.hurt(); }
    }
    this.foes = this.foes.filter(f => f.alive); this.shots = this.shots.filter(sh => sh.active);
    if (this.iframes > 0) { this.iframes -= dt; this.drone.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.3); } else this.drone.setAlpha(1);
    if (this.t >= DUR) this.win();
  }
  private status() { this.ctx.setStatus(`${this.hits} hits · ${this.bombs} batt`); }
  private hurt() { if (this.iframes > 0) return; this.hearts--; this.iframes = 1.2; this.ctx.setHearts(this.hearts, 3); this.ctx.shake(160, 0.008); this.ctx.flash(PAL.red, 60); this.ctx.sfx('hurt'); if (this.hearts <= 0) { this.ended = true; this.ctx.scene.time.delayedCall(400, () => this.done({ score: clamp(20 + this.hits * 2 + this.t, 0, 45), failed: true })); } }
  private win() { if (this.ended) return; this.ended = true; this.ctx.sfx('win'); const score = clamp(60 + this.hits * 2 - (3 - this.hearts) * 10, 50, 100); this.ctx.scene.time.delayedCall(400, () => this.done({ score, perfect: score >= 99 })); }
  scoreNow() { return clamp((this.t / DUR) * 60 + this.hits, 0, 100); }
  destroy() { const kill = (o?: { destroy: () => void }) => { try { if (o && (o as any).scene) o.destroy(); } catch { /* gone */ } }; this.objs.forEach(kill); }
}
