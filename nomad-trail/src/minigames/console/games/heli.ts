// DRONE RUN: a vertical scroller. The DJI flies up over the city. D-pad moves, A shoots photos, B drops a battery bomb (2). Survive 40 s.
import Phaser from 'phaser';
import { PAL } from '../../../core/palette';
import type { Hazard } from '../../../core/types';
import { clamp, pixTexture } from '../../_shared';
import type { Pad } from '../input';
import type { ConsoleCtx, ConsoleGame, ConsoleResult } from './types';

interface Foe { spr: Phaser.GameObjects.Rectangle; vx: number; vy: number; t: number; hp: number; kind: 'flyer' | 'homer' | 'car' | 'rock'; alive: boolean; }
const DUR = 40;

export class HeliGame implements ConsoleGame {
  readonly id = 'heli' as const; readonly name = 'DRONE RUN'; readonly capSec = 44;
  readonly instructions = `Fly the drone up the city for ${DUR} s. D-pad moves, A shoots photos, B drops a battery (2). 3 hearts.`;
  private ctx!: ConsoleCtx; private done!: (r: ConsoleResult) => void;
  private drone!: Phaser.GameObjects.Image; private shots: Phaser.GameObjects.Rectangle[] = []; private foes: Foe[] = []; private blocks: { spr: Phaser.GameObjects.Rectangle; road: boolean }[] = [];
  private t = 0; private hearts = 3; private hits = 0; private bombs = 2; private iframes = 0; private fireT = 0; private spawnT = 0; private ended = false; private scroll = 60;
  private objs: Phaser.GameObjects.GameObject[] = []; private kind: Foe['kind'] = 'flyer'; private gust = 0; private gustT = 0;

  init(ctx: ConsoleCtx, done: (r: ConsoleResult) => void) {
    this.ctx = ctx; this.done = done; const s = ctx.scene; const S = ctx.screen; const D = ctx.depth;
    this.kind = ({ pigeon: 'flyer', mosquito: 'homer', tuktuk: 'car', tram: 'car', crowd: 'car', yak: 'car', otter: 'flyer', rock: 'rock', gust: 'flyer', wave: 'flyer', ice: 'rock', snow: 'rock' } as Record<Hazard, Foe['kind']>)[ctx.hazard] || 'flyer';
    this.objs.push(s.add.rectangle(S.centerX, S.centerY, S.width, S.height, ctx.palette[0]).setDepth(D));
    // a road down the middle, city blocks either side (scroll down = we fly up)
    const road = s.add.rectangle(S.centerX, S.centerY, 90, S.height, ctx.palette[1]).setDepth(D + 1); this.objs.push(road);
    for (let y = S.y - 40; y < S.bottom + 40; y += 28) this.block(y);
    pixTexture(s, 'co_drone', ['A....AA....A', 'AA..AAAA..AA', '.AAABBBBAAA.', '..ABBCCBBA..', '..ABBCCBBA..', '.AAABBBBAAA.', 'AA..AAAA..AA', 'A....AA....A'], { A: PAL.gray2, B: PAL.gray1, C: PAL.red });
    this.drone = s.add.image(S.centerX, S.bottom - 40, 'co_drone').setDepth(D + 6); this.objs.push(this.drone);
    ctx.setHearts(this.hearts, 3); ctx.setStatus(`0 hits · ${this.bombs} batt`);
  }
  private block(y: number) {
    const s = this.ctx.scene; const S = this.ctx.screen; const rng = this.ctx.rng;
    for (const side of [-1, 1]) { const w = 30 + rng() * 60, h = 20 + rng() * 20; const x = S.centerX + side * (60 + w / 2 + rng() * (S.width / 2 - 70 - w / 2)); const r = s.add.rectangle(x, y, w, h, this.ctx.palette[2], 0.5).setDepth(this.ctx.depth + 2); this.blocks.push({ spr: r, road: false }); this.objs.push(r); }
    if (rng() < 0.5) { const m = s.add.rectangle(S.centerX, y, 4, 12, PAL.sun3, 0.5).setDepth(this.ctx.depth + 2); this.blocks.push({ spr: m, road: true }); this.objs.push(m); }   // road markings
  }
  private spawnFoe() {
    const s = this.ctx.scene; const S = this.ctx.screen; const rng = this.ctx.rng; const D = this.ctx.depth; let f: Foe;
    switch (this.kind) {
      case 'car': { const dir = rng() < 0.5 ? 1 : -1; f = { spr: s.add.rectangle(S.centerX - dir * 40, S.y - 10, 22, 14, PAL.sun2).setStrokeStyle(1, PAL.ink).setDepth(D + 5), vx: dir * (50 + 30 * this.ctx.difficulty), vy: this.scroll * 0.6, t: 0, hp: 1, kind: 'car', alive: true }; break; }
      case 'homer': f = { spr: s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 8, 8, 6, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5), vx: 0, vy: 40, t: 0, hp: 1, kind: 'homer', alive: true }; break;
      case 'rock': f = { spr: s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 10, 14, 14, PAL.gray1).setStrokeStyle(1, PAL.ink).setDepth(D + 5), vx: 0, vy: 90 + 60 * this.ctx.difficulty, t: 0, hp: 2, kind: 'rock', alive: true }; break;
      default: f = { spr: s.add.rectangle(S.x + 20 + rng() * (S.width - 40), S.y - 8, 12, 8, PAL.gray2).setStrokeStyle(1, PAL.ink).setDepth(D + 5), vx: 40, vy: 55 + 25 * this.ctx.difficulty, t: rng() * 6, hp: 1, kind: 'flyer', alive: true };
    }
    this.foes.push(f); this.objs.push(f.spr);
  }

  update(dt: number, pad: Pad) {
    if (this.ended) return; const S = this.ctx.screen; this.t += dt; const ramp = 1 + 0.6 * clamp(this.t / DUR, 0, 1);
    // drone
    const sp = 130; this.drone.x = clamp(this.drone.x + pad.axisX * sp * dt + this.gust * dt, S.x + 10, S.right - 10); this.drone.y = clamp(this.drone.y + pad.axisY * sp * dt, S.y + 16, S.bottom - 12);
    if (this.ctx.hazard === 'gust') { this.gustT += dt; if (this.gustT > 4) { this.gustT = 0; this.gust = (this.ctx.rng() < 0.5 ? -1 : 1) * 70; this.ctx.scene.time.delayedCall(900, () => { this.gust = 0; }); } }
    // shooting
    this.fireT -= dt; if (pad.held('a') && this.fireT <= 0) { this.fireT = 0.18; const sh = this.ctx.scene.add.rectangle(this.drone.x, this.drone.y - 8, 2, 8, PAL.white).setDepth(this.ctx.depth + 5); this.shots.push(sh); this.objs.push(sh); this.ctx.sfx('blip'); }
    if (pad.justPressed('b') && this.bombs > 0) { this.bombs--; this.ctx.flash(PAL.white, 120); this.ctx.shake(200, 0.01); this.ctx.sfx('pop'); for (const f of this.foes) if (f.alive) { f.alive = false; this.hits++; this.ctx.scene.tweens.add({ targets: f.spr, alpha: 0, scale: 1.8, duration: 200, onComplete: () => f.spr.destroy() }); } this.status(); }
    for (const sh of this.shots) sh.y -= 260 * dt; this.shots = this.shots.filter(sh => { if (sh.y < S.y) { sh.destroy(); return false; } return true; });
    // scroll the city
    for (const b of this.blocks) { b.spr.y += this.scroll * ramp * dt; if (b.spr.y > S.bottom + 30) { b.spr.y -= S.height + 80; if (!b.road) { b.spr.x = S.centerX + (b.spr.x < S.centerX ? -1 : 1) * (60 + 15 + this.ctx.rng() * (S.width / 2 - 85)); } } }
    // spawn + move foes
    this.spawnT += dt; const every = (this.kind === 'car' ? 1.3 : 1.0) / ramp - 0.25 * this.ctx.difficulty; if (this.spawnT > Math.max(0.35, every)) { this.spawnT = 0; this.spawnFoe(); }
    const dr = new Phaser.Geom.Rectangle(this.drone.x - 5, this.drone.y - 4, 10, 8);
    for (const f of this.foes) {
      if (!f.alive) continue; f.t += dt; const s = f.spr;
      if (f.kind === 'flyer') { s.x += Math.sin(f.t * 2.5) * 60 * dt; s.y += f.vy * ramp * dt; }
      else if (f.kind === 'homer') { s.x += Math.sign(this.drone.x - s.x) * 45 * ramp * dt; s.y += (f.vy + Math.sign(this.drone.y - s.y) * 25) * dt; }
      else if (f.kind === 'car') { s.x += f.vx * dt; s.y += f.vy * ramp * dt; if (s.x < S.centerX - 40 || s.x > S.centerX + 40) f.vx *= -1; }
      else { s.y += f.vy * ramp * dt; }
      if (s.y > S.bottom + 20) { f.alive = false; s.destroy(); continue; }
      for (const sh of this.shots) if (sh.active && Phaser.Geom.Intersects.RectangleToRectangle(new Phaser.Geom.Rectangle(sh.x - 1, sh.y - 4, 2, 8), s.getBounds())) { sh.destroy(); f.hp--; if (f.hp <= 0) { f.alive = false; this.hits++; this.ctx.sfx('coin'); this.ctx.scene.tweens.add({ targets: s, alpha: 0, scale: 1.6, duration: 150, onComplete: () => s.destroy() }); this.status(); } break; }
      if (f.alive && this.iframes <= 0 && Phaser.Geom.Intersects.RectangleToRectangle(dr, s.getBounds())) { f.alive = false; s.destroy(); this.hurt(); }
    }
    this.foes = this.foes.filter(f => f.alive); this.shots = this.shots.filter(sh => sh.active);
    if (this.iframes > 0) { this.iframes -= dt; this.drone.setAlpha(Math.sin(this.iframes * 40) > 0 ? 1 : 0.3); } else this.drone.setAlpha(1);
    if (this.t >= DUR) this.win();
  }
  private status() { this.ctx.setStatus(`${this.hits} hits · ${this.bombs} batt`); }
  private hurt() { this.hearts--; this.iframes = 1.2; this.ctx.setHearts(this.hearts, 3); this.ctx.shake(160, 0.008); this.ctx.flash(PAL.red, 60); this.ctx.sfx('hurt'); if (this.hearts <= 0) { this.ended = true; this.ctx.scene.time.delayedCall(400, () => this.done({ score: clamp(20 + this.hits * 2 + this.t, 0, 45), failed: true })); } }
  private win() { if (this.ended) return; this.ended = true; this.ctx.sfx('win'); const score = clamp(60 + this.hits * 2 - (3 - this.hearts) * 10, 50, 100); this.ctx.scene.time.delayedCall(400, () => this.done({ score, perfect: score >= 99 })); }
  scoreNow() { return clamp((this.t / DUR) * 60 + this.hits, 0, 100); }
  destroy() { this.objs.forEach(o => o.destroy()); }
}
