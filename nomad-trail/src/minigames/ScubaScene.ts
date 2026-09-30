import Phaser from 'phaser';
import { Audio } from '../audio/synth';
import { PAL } from '../core/palette';
import { MINIGAME_KEYS, type MinigameLaunch } from '../core/types';
import { MinigameFrame, W, H, clamp, normalizeLaunch, panel, txt } from './_shared';
import { rng32, buildScubaSprites, layoutReef, drawCoral, drawWater, drawRays, SAND_Y, HUD_H, WW, WH, type Coral } from './scuba/reef';

/**
 * SCUBA: spear the lionfish (Roatán, Miami). A reef three screens wide and two tall; the camera follows the diver.
 * One thumb: HOLD anywhere and the diver swims toward your finger (stopping short) while a dotted aim line shows the shot;
 * RELEASE to fire a short spear. Shoot LEVEL into the lionfish body (a shot within 16 px of the body line, 22 px along it,
 * counts): the fanned spines above and below deflect it, and the diver must never touch a spine halo (red flash, -15, recoil).
 * Small reef fish are not targets: spearing one costs 10. Lionfish drift, face the diver when close, and tuck behind coral.
 * No clock: the dive ends when every lionfish is speared or the player taps SURFACE. A minimap (top right) and an edge arrow
 * point at the nearest remaining lionfish. Score = speared / total x 100 - 15 per touch - 10 per bycatch.
 * Payload: { city, cityName, seed }. Miami is murkier with fewer fish; Roatán is the lionfish capital.
 */
const RANGE = 150, SPEAR_V = 460, SWIM_V = 78, KEEP = 58;
type Lion = { x: number; y: number; vx: number; vy: number; heading: number; t: number; alive: boolean; hiding: boolean; hideT: number; nextHide: number; flare: number; calm: number; sprite: Phaser.GameObjects.Sprite; dead: boolean; deadT: number };
type Reef = { x: number; y: number; bx: number; by: number; ph: number; dir: number; sprite: Phaser.GameObjects.Sprite; alive: boolean };
type Bubble = { x: number; y: number; r: number; vy: number; wob: number };

export class ScubaScene extends Phaser.Scene {
  private frame!: MinigameFrame; private launch!: MinigameLaunch; private g!: Phaser.GameObjects.Graphics; private fx!: Phaser.GameObjects.Graphics; private rays!: Phaser.GameObjects.Graphics; private mini!: Phaser.GameObjects.Graphics;
  private diver!: Phaser.GameObjects.Sprite; dx = 120; dy = 260; private dvx = 0; private dvy = 0; private facing = 1; private invuln = 0; private finT = 0;
  held = false; targetX = 220; targetY = 260; private aimX = 1; private aimY = 0; private cooldown = 0;
  private spear?: { x: number; y: number; ux: number; uy: number; gone: number; sx: number; sy: number }; private spearFade = 0; private lastSpear?: { x0: number; y0: number; x1: number; y1: number };
  private lions: Lion[] = []; private reef: Reef[] = []; private bubbles: Bubble[] = []; private corals: Coral[] = []; private hideSpots: Coral[] = [];
  speared = 0; touches = 0; bycatch = 0; total = 0; private t = 0; private ended = false; private murky = false; private cityName = ''; private rand = rng32(1);
  private msg!: Phaser.GameObjects.Text; private msgT = 0; private tick?: Phaser.Time.TimerEvent; private sparks: { x: number; y: number; vx: number; vy: number; t: number; c: number }[] = [];
  constructor() { super(MINIGAME_KEYS.scuba); }
  init(data: any) {
    this.launch = normalizeLaunch(data); const p = this.launch.payload || {};
    const city = String(p.city || 'roatan'); this.cityName = String(p.cityName || (city === 'miami' ? 'Miami' : 'Roatán')).toUpperCase(); this.murky = city === 'miami';
    this.rand = rng32((Number(p.seed) || 7) * 7919 + (this.murky ? 13 : 29));
    this.dx = 120; this.dy = 260; this.dvx = 0; this.dvy = 0; this.facing = 1; this.invuln = 0; this.finT = 0; this.held = false; this.targetX = 220; this.targetY = 260; this.aimX = 1; this.aimY = 0; this.cooldown = 0;
    this.spear = undefined; this.spearFade = 0; this.lastSpear = undefined; this.lions = []; this.reef = []; this.bubbles = []; this.corals = []; this.hideSpots = []; this.sparks = [];
    this.speared = 0; this.touches = 0; this.bycatch = 0; this.t = 0; this.ended = false; this.msgT = 0;
    /* Roatán is the lionfish capital: 10 or 11 across the reef; Miami is murkier and quieter: 7 or 8 */
    this.total = this.murky ? 7 + (this.rand() < 0.5 ? 1 : 0) : 10 + (this.rand() < 0.5 ? 1 : 0);
  }
  create() {
    this.frame = new MinigameFrame(this, this.launch, 'Lionfish dive'); this.frame.musicLoop = 'water'; this.frame.capSec = 24 * 3600;   /* no clock: the dive ends on the last fish or SURFACE */
    this.cameras.main.setBackgroundColor(PAL.sea0); this.cameras.main.setBounds(0, 0, WW, WH); this.physics?.world?.setBounds?.(0, 0, WW, WH);
    buildScubaSprites(this);
    const water = this.add.graphics().setDepth(0); drawWater(water, this.murky);
    this.rays = this.add.graphics().setDepth(1);
    this.corals = layoutReef(this.rand, this.murky);
    const back = this.add.graphics().setDepth(2), front = this.add.graphics().setDepth(4);
    for (const c of this.corals) { const isFront = c.kind !== 'rock' || c.x < WW - 110; drawCoral(isFront ? front : back, c, this.rand); if (isFront && c.y < SAND_Y - 10) this.hideSpots.push(c); }
    if (this.murky) this.add.rectangle(W / 2, H / 2, W, H, PAL.sea0, 0.22).setDepth(6).setScrollFactor(0);   /* silt in the water */
    this.g = this.add.graphics().setDepth(7); this.fx = this.add.graphics().setDepth(8);
    this.diver = this.add.sprite(this.dx, this.dy, 'sc_diver0').setDepth(6).setScale(3);
    this.cameras.main.startFollow(this.diver, true, 0.08, 0.08);
    /* reef fish: harmless, scattered over the whole reef */
    const texs = ['sc_fish_y', 'sc_fish_t', 'sc_fish_p']; const nReef = 22 + Math.floor(this.rand() * 5);
    for (let i = 0; i < nReef; i++) { const bx = 40 + this.rand() * (WW - 160), by = HUD_H + 60 + this.rand() * (SAND_Y - HUD_H - 120); this.reef.push({ x: bx, y: by, bx, by, ph: this.rand() * 6.3, dir: this.rand() < 0.5 ? -1 : 1, sprite: this.add.sprite(bx, by, texs[i % 3]).setDepth(5).setScale(2), alive: true }); }
    /* lionfish: spread across the reef in a loose grid so exploring finds them, never right on top of the diver's start */
    for (let i = 0; i < this.total; i++) {
      const col = i % 4, row = Math.floor(i / 4); let x = 140 + col * ((WW - 260) / 3) + (this.rand() - 0.5) * 160, y = HUD_H + 120 + row * ((SAND_Y - HUD_H - 240) / 2) + (this.rand() - 0.5) * 160;
      x = clamp(x, 80, WW - 120); y = clamp(y, HUD_H + 70, SAND_Y - 60); if (Math.hypot(x - this.dx, y - this.dy) < 170) x += 200;
      const spr = this.add.sprite(x, y, 'sc_lion0').setDepth(5).setScale(2);
      this.lions.push({ x, y, vx: 0, vy: 0, heading: this.rand() * 6.3, t: this.rand() * 10, alive: true, hiding: false, hideT: 0, nextHide: 5 + this.rand() * 8, flare: 0, calm: 0, sprite: spr, dead: false, deadT: 0 });
    }
    this.msg = txt(this, W / 2, 64, '', 14, PAL.white).setDepth(9).setScrollFactor(0);
    this.frame.hud(); this.frame.setProgress(`0/${this.total} lionfish`); this.frame.setTimer('');
    /* SURFACE button (top right, under the HUD) and the minimap beside it */
    const bx = W - 58, by = HUD_H + 22; const btn = panel(this, bx - 46, by - 13, 92, 26, PAL.night2, PAL.gray1, PAL.ink).setDepth(810).setScrollFactor(0); (btn as any).setInteractive?.(new Phaser.Geom.Rectangle(0, 0, 92, 26), Phaser.Geom.Rectangle.Contains);
    txt(this, bx, by, 'SURFACE', 10, PAL.sun2).setDepth(811).setScrollFactor(0);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (this.frame.active && !this.ended && p.x >= bx - 46 && p.x <= bx + 46 && p.y >= by - 13 && p.y <= by + 13) this.surface(); });
    this.mini = this.add.graphics().setDepth(812).setScrollFactor(0);
    this.frame.scoreNow = () => this.score();
    this.frame.intro(`${this.cityName}. Lionfish are eating the reef.`, () => this.startDive(), { height: 356, extra: (s, add) => {
      const top = H / 2 - 178; const lines: [string, number][] = [[`Spear all ${this.total} lionfish on this reef`, PAL.white], ['HOLD: swim toward your finger and aim', PAL.neon], ['RELEASE: fire the spear (short range)', PAL.neon], ['Shoot LEVEL at the body; spines deflect', PAL.sun2], ['Touch a spine: -15 and a nasty recoil', PAL.pink], ['Map and arrow point to the nearest. SURFACE ends the dive.', PAL.gray2]];
      lines.forEach(([ln, c], i) => add(txt(s, W / 2, top + 96 + i * 22, ln, i === 0 ? 12 : i === 5 ? 9 : 10, c)));
    } });
    this.pinScreen(800);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.tick?.remove());
  }
  /** Everything at or above this depth is HUD / card: fix it to the screen so the camera scroll does not move it. */
  private pinScreen(minDepth: number) { for (const o of this.children.list) { const d = (o as any).depth ?? 0; if (d >= minDepth && (o as any).setScrollFactor) (o as any).setScrollFactor(0); } }
  private score() { return clamp(Math.round((this.speared / Math.max(1, this.total)) * 100 - 15 * this.touches - 10 * this.bycatch), 0, 100); }

  private startDive() {
    this.time.delayedCall(60, () => {
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { if (p.y > HUD_H + 40 || p.x < W - 110) this.press(p.worldX, p.worldY); });
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => { if (this.held) { this.targetX = p.worldX; this.targetY = p.worldY; } });
      this.input.on('pointerup', () => this.release());
      const kb = this.input.keyboard; if (kb) {
        const nudge = (ax: number, ay: number) => { if (!this.held) { this.targetX = this.dx; this.targetY = this.dy; } this.targetX = clamp(this.targetX + ax * 30, 0, WW); this.targetY = clamp(this.targetY + ay * 30, HUD_H, SAND_Y); this.held = true; };
        kb.on('keydown-LEFT', () => nudge(-1, 0)); kb.on('keydown-RIGHT', () => nudge(1, 0)); kb.on('keydown-UP', () => nudge(0, -1)); kb.on('keydown-DOWN', () => nudge(0, 1));
        for (const k of ['LEFT', 'RIGHT', 'UP', 'DOWN']) kb.on('keyup-' + k, () => { this.held = false; });
        kb.on('keydown-SPACE', () => this.fire()); kb.on('keydown-S', () => this.surface());
      }
    });
    this.tick = this.time.addEvent({ delay: 16, loop: true, callback: () => this.step(0.016) });
  }
  /** Harness / touch: start holding toward world point (x, y). */
  press(x: number, y: number) { if (!this.frame.active || this.ended) return; this.held = true; this.targetX = x; this.targetY = y; }
  /** Harness / touch: release = fire toward the last target. */
  release() { if (!this.held) return; this.held = false; this.fire(); }
  /** Aim at a world point and fire. */
  fireAt(x: number, y: number) { this.targetX = x; this.targetY = y; this.updateAim(); this.fire(); }
  /** End the dive early with the current score (the SURFACE button, S key, harness). */
  surface() { if (!this.frame.active || this.ended) return; this.say('SURFACING', PAL.sky3); this.end(); }
  private updateAim() { const ax = this.targetX - this.dx, ay = this.targetY - this.dy; const l = Math.hypot(ax, ay); if (l > 4) { this.aimX = ax / l; this.aimY = ay / l; if (Math.abs(ax) > 6) this.facing = ax < 0 ? -1 : 1; } }
  private gunTip() { return { x: this.dx + this.facing * 30, y: this.dy + 9 }; }
  private fire() {
    if (!this.frame.active || this.ended || this.spear || this.cooldown > 0) return;
    this.updateAim(); const { x: sx, y: sy } = this.gunTip();
    this.spear = { x: sx, y: sy, ux: this.aimX, uy: this.aimY, gone: 0, sx, sy }; this.cooldown = 0.4; Audio.playSfx('spear');
    this.bubbles.push({ x: sx, y: sy, r: 2, vy: 30, wob: this.rand() * 6 });
  }
  /** Harness: where things are (world coordinates). */
  hint() { return { x: this.dx, y: this.dy, speared: this.speared, touches: this.touches, bycatch: this.bycatch, total: this.total, spear: !!this.spear, fish: this.lions.filter(l => l.alive).map(l => ({ x: l.x, y: l.y, hiding: l.hiding, r: this.spineR() })) }; }
  private spineR() { return 25; }
  private say(s: string, c: number = PAL.white) { this.msg.setText(s).setColor(Phaser.Display.Color.IntegerToColor(c).rgba).setAlpha(1); this.msgT = 1.1; }

  update(_t: number, dt: number) { this.frame.update(dt); }
  private step(dt: number) {
    if (!this.frame.active || this.ended) return; this.t += dt; this.cooldown = Math.max(0, this.cooldown - dt); if (this.invuln > 0) this.invuln -= dt;
    drawRays(this.rays, this.t, this.murky);
    /* diver: swim toward the finger, stop short, drift otherwise */
    if (this.held) { this.updateAim(); const ax = this.targetX - this.dx, ay = this.targetY - this.dy; const l = Math.hypot(ax, ay); if (l > KEEP) { this.dvx += (ax / l * SWIM_V - this.dvx) * Math.min(1, dt * 4); this.dvy += (ay / l * SWIM_V - this.dvy) * Math.min(1, dt * 4); } else { this.dvx *= 0.9; this.dvy *= 0.9; } }
    else { this.dvx *= 1 - Math.min(1, dt * 2.2); this.dvy *= 1 - Math.min(1, dt * 2.2); }
    this.dx = clamp(this.dx + this.dvx * dt, 44, WW - 44); this.dy = clamp(this.dy + this.dvy * dt + Math.sin(this.t * 1.6) * 0.12, HUD_H + 40, SAND_Y - 24);
    this.finT += dt * (1 + Math.hypot(this.dvx, this.dvy) / 40); this.diver.setTexture('sc_diver' + [0, 1, 2, 1][Math.floor(this.finT * 5) % 4]).setPosition(this.dx, this.dy).setFlipX(this.facing < 0).setAlpha(this.invuln > 0 && Math.floor(this.t * 12) % 2 ? 0.35 : 1);
    if (this.rand() < dt * 2.2) this.bubbles.push({ x: this.dx + this.facing * 30, y: this.dy + 3, r: 1 + this.rand() * 2.5, vy: 26 + this.rand() * 24, wob: this.rand() * 6 });
    /* reef fish */
    for (const f of this.reef) { if (!f.alive) continue; f.ph += dt * 1.3; f.x = f.bx + Math.sin(f.ph * 0.7) * 34 * f.dir; f.y = f.by + Math.sin(f.ph * 1.7) * 9; const away = Math.hypot(f.x - this.dx, f.y - this.dy); if (away < 60) { f.bx += (f.x - this.dx) / away * 40 * dt; f.by += (f.y - this.dy) / away * 40 * dt; } f.bx = clamp(f.bx, 20, WW - 100); f.by = clamp(f.by, HUD_H + 40, SAND_Y - 30); f.sprite.setPosition(f.x, f.y).setFlipX(Math.cos(f.ph * 0.7) * f.dir < 0); }
    /* lionfish */
    const sr = this.spineR();
    for (const L of this.lions) {
      if (L.dead) { L.deadT += dt; L.y -= 18 * dt; L.x += Math.sin(L.deadT * 3) * 0.3; L.sprite.setPosition(L.x, L.y).setAlpha(Math.max(0, 1 - L.deadT / 3)).setAngle(160 + Math.sin(L.deadT * 2) * 10); continue; }
      L.t += dt; const dd = Math.hypot(this.dx - L.x, this.dy - L.y);
      if (L.hiding) { L.hideT -= dt; L.vx *= 0.8; L.vy *= 0.8; if (L.hideT <= 0) { L.hiding = false; L.sprite.setDepth(5); L.nextHide = 6 + this.rand() * 9; } }
      if (dd > 700) { L.sprite.setPosition(L.x, L.y); continue; }   /* far-off fish idle cheaply (but still come out of hiding, above) */
      if (L.hiding) { /* tucked in: nothing else to do this frame */ }
      else if (dd < 110 && L.calm <= 0) { /* it turns to face the diver and drifts closer, but hovers at a standoff: the danger is you moving into it */
        const want = 52; const sp = (dd > want ? 16 + L.flare * 24 : -12); L.vx += ((this.dx - L.x) / dd * sp - L.vx) * Math.min(1, dt * 1.5); L.vy += ((this.dy - L.y) / dd * sp - L.vy) * Math.min(1, dt * 1.5); }
      else {
        L.heading += (this.rand() - 0.5) * dt * 1.6; const sp = 22 + 10 * Math.sin(L.t * 0.5); L.vx += (Math.cos(L.heading) * sp - L.vx) * Math.min(1, dt); L.vy += (Math.sin(L.heading) * sp * 0.5 - L.vy) * Math.min(1, dt);
        L.nextHide -= dt; if (L.nextHide <= 0 && this.hideSpots.length) { let best: Coral | undefined, bd = 1e9; for (const c of this.hideSpots) { const d = Math.hypot(c.x + c.w / 2 - L.x, c.y + c.h * 0.55 - L.y); if (d < bd) { bd = d; best = c; } } if (best && bd < 160) { L.hiding = true; L.hideT = 2.5 + this.rand() * 2; L.x = best.x + best.w / 2; L.y = best.y + best.h * 0.55; L.vx = L.vy = 0; L.sprite.setDepth(3); } else L.nextHide = 2; }
      }
      L.flare = Math.max(0, L.flare - dt * 0.5); L.calm = Math.max(0, L.calm - dt);
      L.x += L.vx * dt; L.y += L.vy * dt;
      if (L.x < 60) { L.x = 60; L.heading = Math.PI - L.heading; } if (L.x > WW - 110) { L.x = WW - 110; L.heading = Math.PI - L.heading; } if (L.y < HUD_H + 50) { L.y = HUD_H + 50; L.heading = -L.heading; } if (L.y > SAND_Y - 26) { L.y = SAND_Y - 26; L.heading = -L.heading; }
      L.sprite.setPosition(L.x, L.y).setTexture(Math.floor(L.t * 2.5) % 2 ? 'sc_lion1' : 'sc_lion0').setFlipX(L.vx < -2 ? true : L.vx > 2 ? false : L.sprite.flipX);
      if (dd < sr + 5 && this.invuln <= 0) this.sting(L, dd);
    }
    /* spear */
    if (this.spear) {
      const S = this.spear; const stepLen = SPEAR_V * dt; S.x += S.ux * stepLen; S.y += S.uy * stepLen; S.gone += stepLen;
      let done = S.gone >= RANGE || S.x < 0 || S.x > WW || S.y < HUD_H || S.y > SAND_Y;
      for (const L of this.lions) { if (!L.alive || L.hiding) continue; const d = Math.hypot(S.x - L.x, S.y - L.y); if (Math.abs(S.x - L.x) < 22 && Math.abs(S.y - L.y) < 16) { this.spearFish(L); done = true; break; } if (d < sr - 2 && Math.abs(S.y - L.y) >= 16) { this.spark(S.x, S.y, PAL.gray2, 6); L.flare = 1; this.say('DEFLECTED: aim level at the body', PAL.gray2); done = true; break; } }
      if (!done) for (const f of this.reef) { if (!f.alive) continue; if (Math.hypot(S.x - f.x, S.y - f.y) < 8) { f.alive = false; f.sprite.destroy(); this.bycatch++; this.say('BYCATCH  -10', PAL.sun1); this.frame.shake(80, 0.003); done = true; break; } }
      if (done) { this.lastSpear = { x0: S.sx, y0: S.sy, x1: S.x, y1: S.y }; this.spearFade = 0.25; this.spear = undefined; }
    }
    if (this.spearFade > 0) this.spearFade -= dt;
    for (const b of this.bubbles) { b.y -= b.vy * dt; b.x += Math.sin(this.t * 3 + b.wob) * 0.3; } this.bubbles = this.bubbles.filter(b => b.y > HUD_H + 4);
    for (const s of this.sparks) { s.t -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt; } this.sparks = this.sparks.filter(s => s.t > 0);
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT < 0.3) this.msg.setAlpha(Math.max(0, this.msgT / 0.3)); }
    this.draw(); this.drawMini();
    if (this.speared >= this.total && !this.ended) { this.ended = true; this.say('REEF CLEARED', PAL.neon); this.time.delayedCall(900, () => { this.ended = false; this.end(); }); }
  }
  private sting(L: Lion, dd: number) {
    this.touches++; this.invuln = 1.4;
    const ux = (this.dx - L.x) / Math.max(1, dd), uy = (this.dy - L.y) / Math.max(1, dd); this.dvx = ux * 190; this.dvy = uy * 190; this.held = false;
    L.vx = -ux * 40; L.vy = -uy * 40; L.flare = 1; L.calm = 4;
    Audio.playSfx('hurt'); this.frame.flash(PAL.red, 120); this.frame.shake(160, 0.008); this.say('SPINES!  -15', PAL.red); this.spark(this.dx, this.dy, PAL.red, 10);
  }
  private spearFish(L: Lion) {
    L.alive = false; L.dead = true; L.hiding = false; L.sprite.setDepth(5).setTexture('sc_lion_dead'); this.speared++; Audio.playSfx('coin');
    this.frame.setProgress(`${this.speared}/${this.total} lionfish`); this.say(this.speared === this.total ? 'LAST ONE' : 'SPEARED', PAL.neon); this.spark(L.x, L.y, PAL.neon, 8);
  }
  private spark(x: number, y: number, c: number, n: number) { for (let i = 0; i < n; i++) { const a = this.rand() * 6.3, v = 40 + this.rand() * 60; this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.3 + this.rand() * 0.3, c }); } }
  private draw() {
    const g = this.g; g.clear(); const fx = this.fx; fx.clear(); const cam = this.cameras.main;
    for (const L of this.lions) { if (!L.alive) continue; if (Math.abs(L.x - cam.midPoint.x) > 260 || Math.abs(L.y - cam.midPoint.y) > 400) continue; const a = L.hiding ? 0.05 : 0.12 + 0.06 * Math.sin(this.t * 4 + L.t); fx.fillStyle(PAL.red, a).fillCircle(L.x, L.y, this.spineR()); fx.lineStyle(1, PAL.red, L.hiding ? 0.15 : 0.35 + L.flare * 0.4).strokeCircle(L.x, L.y, this.spineR()); }
    const { x: gx, y: gy } = this.gunTip();
    if (this.held && !this.spear) {
      this.updateAim(); const len = Math.min(RANGE, Math.hypot(this.targetX - gx, this.targetY - gy));
      let good = false; for (const L of this.lions) { if (!L.alive || L.hiding) continue; const px = L.x - gx, py = L.y - gy; const along = px * this.aimX + py * this.aimY; if (along > 0 && along < len + 10) { const off = Math.abs(px * this.aimY - py * this.aimX); if (off < 16 && Math.abs(this.aimY) < 0.6) good = true; } }
      const c = good ? PAL.sun2 : PAL.neon; for (let d = 10; d < len; d += 9) g.fillStyle(c, 0.85).fillRect(gx + this.aimX * d - 1, gy + this.aimY * d - 1, 2, 2);
      g.lineStyle(1, c, 0.5).strokeCircle(gx + this.aimX * len, gy + this.aimY * len, 4);
      g.fillStyle(PAL.white, 0.25).fillCircle(this.targetX, this.targetY, 6);
    }
    if (this.spear) { const S = this.spear; g.lineStyle(2, PAL.gray2, 1).lineBetween(S.sx, S.sy, S.x, S.y); g.fillStyle(PAL.white).fillCircle(S.x, S.y, 2); }
    else if (this.spearFade > 0 && this.lastSpear) { const l = this.lastSpear; g.lineStyle(1, PAL.gray2, this.spearFade * 3).lineBetween(l.x0, l.y0, l.x1, l.y1); }
    for (const b of this.bubbles) fx.lineStyle(1, PAL.sky3, 0.7).strokeCircle(b.x, b.y, b.r);
    for (const s of this.sparks) fx.fillStyle(s.c, Math.min(1, s.t * 3)).fillRect(s.x - 1, s.y - 1, 3, 3);
  }
  /** Minimap (top right, under SURFACE) plus an arrow at the screen edge toward the nearest remaining lionfish when it is off screen. */
  private drawMini() {
    const m = this.mini; m.clear(); const mw = 72, mh = 80, mx = W - 8 - mw, my = HUD_H + 40; const sx = mw / WW, sy = mh / WH; const cam = this.cameras.main;
    m.fillStyle(PAL.night0, 0.7).fillRect(mx, my, mw, mh); m.lineStyle(1, PAL.gray1, 0.9).strokeRect(mx, my, mw, mh);
    m.lineStyle(1, PAL.sky3, 0.5).strokeRect(mx + cam.scrollX * sx, my + cam.scrollY * sy, W * sx, H * sy);
    let nearest: Lion | undefined, nd = 1e9;
    for (const L of this.lions) { if (!L.alive) continue; const d = Math.hypot(L.x - this.dx, L.y - this.dy); if (d < nd) { nd = d; nearest = L; } m.fillStyle(PAL.red, L.hiding ? 0.5 : 1).fillRect(mx + L.x * sx - 1, my + L.y * sy - 1, 3, 3); }
    m.fillStyle(PAL.neon).fillRect(mx + this.dx * sx - 1, my + this.dy * sy - 1, 3, 3);
    if (nearest) {
      const scrX = nearest.x - cam.scrollX, scrY = nearest.y - cam.scrollY;
      if (scrX < -20 || scrX > W + 20 || scrY < HUD_H - 20 || scrY > H + 20) {
        const cx = W / 2, cy = H / 2; const ax = scrX - cx, ay = scrY - cy; const l = Math.hypot(ax, ay) || 1; const ux = ax / l, uy = ay / l;
        const k = Math.min((W / 2 - 30) / Math.abs(ux || 1e-6), (H / 2 - 60) / Math.abs(uy || 1e-6)); const px = cx + ux * k, py = cy + uy * k;
        const pulse = 0.6 + 0.4 * Math.sin(this.t * 6);
        m.fillStyle(PAL.sun2, pulse).fillTriangle(px + ux * 12, py + uy * 12, px - uy * 7, py + ux * 7, px + uy * 7, py - ux * 7);
      }
    }
  }
  private end() { if (this.frame.finished) return; this.ended = true; this.tick?.remove(); this.held = false; this.frame.finish(this.score()); this.pinScreen(900); }
}
export default ScubaScene;
