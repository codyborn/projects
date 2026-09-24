import Phaser from 'phaser';
import type { City, Leg } from '../core/types';
import { PAL, txt, rect, TRANSPORT_GLYPH, MONTHS } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Hud } from '../ui/hud';
import { toast } from '../ui/Toast';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
/** Route: pixel globe centered on the current city, cards for the available next legs. */
export class RouteScene extends Phaser.Scene {
  static KEY = 'Route'; private pulse?: Phaser.GameObjects.Arc; private hud!: Hud;
  constructor() { super(RouteScene.KEY); }
  create() {
    rect(this, 0, 0, 360, 640, PAL.night0); this.cameras.main.fadeIn(250);
    const run = getRun(this); run.phase = 'route'; putRun(this, run);
    this.hud = new Hud(this); this.hud.refresh(run);
    const cur = Data.city(run.cityId); const cx = 180, cy = 208, R = 80;
    const hook = (window as any).__nomadArt?.globe; let drewCustom = false; if (hook) { try { hook(this, cx, cy, R, run); drewCustom = true; } catch {} }
    if (!drewCustom) this.drawGlobe(cx, cy, R, run.route, cur);
    txt(this, 180, 96, `${cur?.name ?? run.cityId}, ${cur?.country ?? ''}`, 12, PAL.white, { align: 'center', wrap: 340 }).setOrigin(0.5);
    const home = Data.city(run.startCity)?.name ?? 'Orange County';
    txt(this, 180, 112, run.route.length <= 1 ? 'your first stop sets east or west' : `${run.direction === 'east' ? 'heading east →' : '← heading west'} · home: ${home}`, 8, PAL.gray2, { align: 'center', wrap: 340 }).setOrigin(0.5);
    // continents strip: the second goal (hit all five) lights up here
    const visited = new Set(Sim.continentsVisited(run)); const ALL = Sim.CONTINENTS_ALL; const short: Record<string, string> = { 'North America': 'N.AM', 'South America': 'S.AM', Europe: 'EUR', Africa: 'AFR', Asia: 'ASIA' };
    txt(this, 12, 296, 'CONTINENTS', 8, PAL.gray2); const cw = (360 - 116) / ALL.length;
    ALL.forEach((name, i) => { const lit = visited.has(name); const x0 = 116 + i * cw; rect(this, x0, 292, cw - 4, 16, lit ? PAL.night3 : PAL.night1, lit ? PAL.neon : PAL.night3); txt(this, x0 + (cw - 4) / 2, 300, short[name] ?? name.slice(0, 4).toUpperCase(), 8, lit ? PAL.neon : PAL.gray0).setOrigin(0.5); });
    const legs = Sim.availableLegs(run); const m = Sim.monthOf(run.day);
    txt(this, 12, 322, legs.length ? 'NEXT STOP' : 'NO ROUTES THIS MONTH', 10, PAL.sun2);
    txt(this, 348, 322, `${MONTHS[m - 1]} · day ${run.day}`, 8, PAL.gray2).setOrigin(1, 0);
    const listC = this.add.container(0, 0); const mask = this.make.graphics({}); mask.fillRect(0, 336, 360, 246); listC.setMask(mask.createGeometryMask());
    legs.forEach((leg, i) => listC.add(this.card(leg, 12, 340 + i * 62)));
    const total = legs.length * 62; if (total > 246) { const z = this.add.zone(180, 459, 360, 246).setInteractive({ draggable: true }); let sy = 0, s0 = 0; z.on('pointerdown', (p: any) => { s0 = p.y; }); z.on('drag', (p: any) => { const ny = Phaser.Math.Clamp(sy + (p.y - s0), -(total - 246), 0); listC.y = ny; }); z.on('dragend', () => { sy = listC.y; }); z.setDepth(-1); }
    if (!legs.length) { new Button(this, 180, 400, 'WAIT A WEEK HERE', () => { for (let i = 0; i < 7; i++) Sim.cityAction(run, 'rest'); putRun(this, run); this.scene.restart(); }, { w: 240, fill: PAL.dusk0 }); txt(this, 180, 440, 'Some legs only open in season (treks, campervans, Oktoberfest).', 8, PAL.gray2, { align: 'center', wrap: 300 }).setOrigin(0.5); }
    rect(this, 0, 582, 360, 58, PAL.night0).setDepth(5); rect(this, 0, 582, 360, 1, PAL.night3).setDepth(5);
    new Button(this, 60, 614, '← STAY', () => this.scene.start('City'), { w: 100, h: 44, size: 10, fill: PAL.night2 }).setDepth(6);
    if (this.scene.get('Passport')) new Button(this, 300, 614, 'PASSPORT', () => this.scene.start('Passport', { back: 'Route' }), { w: 100, h: 44, size: 10, fill: PAL.night2 }).setDepth(6);
  }
  private project(lat: number, lon: number, lon0: number, cx: number, cy: number, R: number) {
    const la = Phaser.Math.DegToRad(lat), lo = Phaser.Math.DegToRad(lon - lon0), la0 = Phaser.Math.DegToRad(18);
    const cosc = Math.sin(la0) * Math.sin(la) + Math.cos(la0) * Math.cos(la) * Math.cos(lo); if (cosc < 0) return null;
    return { x: cx + R * Math.cos(la) * Math.sin(lo), y: cy - R * (Math.cos(la0) * Math.sin(la) - Math.sin(la0) * Math.cos(la) * Math.cos(lo)) };
  }
  private drawGlobe(cx: number, cy: number, R: number, route: string[], cur?: City) {
    const g = this.add.graphics(); const lon0 = cur?.lon ?? 0;
    g.fillStyle(PAL.ink, 1); g.fillCircle(cx + 3, cy + 4, R); g.fillStyle(PAL.sea0, 1); g.fillCircle(cx, cy, R); g.fillStyle(PAL.sea1, 1); g.fillCircle(cx - 12, cy - 14, R - 22);
    g.lineStyle(1, PAL.sea2, 0.25); for (let lo = -180; lo < 180; lo += 30) { let prev: any = null; for (let la = -80; la <= 80; la += 5) { const p = this.project(la, lo, lon0, cx, cy, R); if (p && prev) g.lineBetween(prev.x, prev.y, p.x, p.y); prev = p; } }
    for (let la = -60; la <= 60; la += 30) { let prev: any = null; for (let lo = -180; lo <= 180; lo += 5) { const p = this.project(la, lo, lon0, cx, cy, R); if (p && prev) g.lineBetween(prev.x, prev.y, p.x, p.y); prev = p; } }
    // crude continents: blobs around city clusters
    g.fillStyle(PAL.grass1, 0.9); for (const c of Data.cities) { const p = this.project(c.lat, c.lon, lon0, cx, cy, R); if (p) g.fillRect(Math.round(p.x) - 7, Math.round(p.y) - 5, 14, 10); }
    g.lineStyle(1, PAL.white, 0.5); g.strokeCircle(cx, cy, R);
    // route
    g.lineStyle(2, PAL.sun2, 0.9); let prev: any = null; for (const id of route) { const c = Data.city(id); const p = c ? this.project(c.lat, c.lon, lon0, cx, cy, R) : null; if (p && prev) g.lineBetween(prev.x, prev.y, p.x, p.y); prev = p ?? prev; }
    for (const c of Data.cities) { const p = this.project(c.lat, c.lon, lon0, cx, cy, R); if (!p) continue; const v = route.includes(c.id); g.fillStyle(v ? PAL.sun2 : PAL.gray2, 1); g.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3); }
    if (cur) { const p = this.project(cur.lat, cur.lon, lon0, cx, cy, R)!; this.pulse = this.add.circle(p.x, p.y, 4, PAL.white).setStrokeStyle(1, PAL.ink); this.tweens.add({ targets: this.pulse, scaleX: 1.8, scaleY: 1.8, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 }); }
  }
  private card(leg: Leg, x: number, y: number) {
    const c = Data.city(leg.to); const p = new Panel(this, x, y, 336, 56, { fill: PAL.night1, border: PAL.night3 }); const fare = Sim.legCost(getRun(this), leg);
    const glyph = TRANSPORT_GLYPH[leg.transport] ?? '·';
    p.add(txt(this, 10, 8, `${glyph}  ${c?.name ?? leg.to}${c?.hero ? ' ★' : ''}`, 12, PAL.white) as any);
    if ((leg as any).longHaul) p.add(txt(this, 200, 12, 'LONG HAUL', 8, PAL.pink) as any);
    p.add(txt(this, 10, 30, `${c?.country ?? ''} · ${leg.days}d · energy −${leg.energy}${leg.timezones ? ` · ${Math.abs(leg.timezones)}h lag` : ''}${leg.months ? ' · in season' : ''}`, 8, PAL.gray2) as any);
    if (typeof fare === 'number') p.add(txt(this, 326, 12, `$${Math.round(fare)}`, 8, PAL.sun2).setOrigin(1, 0.5) as any);
    p.add(txt(this, 326, 36, 'GO →', 12, PAL.neon).setOrigin(1, 0.5) as any);
    p.setSize(336, 56); p.setInteractive(new Phaser.Geom.Rectangle(168, 28, 336, 56), Phaser.Geom.Rectangle.Contains);
    p.on('pointerdown', () => this.tweens.add({ targets: p, scaleX: 0.98, scaleY: 0.96, duration: 60, yoyo: true }));
    p.on('pointerup', (ptr: Phaser.Input.Pointer) => { if (Math.abs(ptr.downY - ptr.upY) > 12) return; this.go(leg); });
    return p;
  }
  private go(leg: Leg) { const run = getRun(this); if (run.energy < 10) toast(this, 'Running on fumes. Consider resting first.', PAL.sun1, 1200); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(210, () => this.scene.start('Travel', { leg })); }
}
export default RouteScene;
