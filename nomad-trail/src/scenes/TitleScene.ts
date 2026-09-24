import Phaser from 'phaser';
import STRINGS from '../data/strings.json';
import { PAL, txt, rect, GAME_W, GAME_H } from '../ui/theme';
import { Button } from '../ui/Button';
import { Panel, dimmer } from '../ui/Panel';
import { Sim, getSettings, putSettings, putRun } from '../ui/simBridge';
import type { RunState } from '../core/types';
/** Title: twilight gradient, drifting pixel clouds, New Run / Continue / Passport / mute. */
export class TitleScene extends Phaser.Scene {
  static KEY = 'Title';
  private clouds: Phaser.GameObjects.Rectangle[] = [];
  constructor() { super(TitleScene.KEY); }
  create() {
    this.clouds = [];
    const bands = [PAL.night0, PAL.night1, PAL.dusk0, PAL.dusk1, PAL.dusk2, PAL.dusk3, PAL.sun0, PAL.sun1];
    bands.forEach((c, i) => rect(this, 0, i * 44, GAME_W, 46, c));
    rect(this, 0, 352, GAME_W, GAME_H - 352, PAL.night0);
    for (let i = 0; i < 14; i++) { const y = 40 + Math.random() * 280; const w = 30 + Math.random() * 70; const c = this.add.rectangle(Math.random() * GAME_W, y, w, 6 + Math.random() * 6, y < 180 ? PAL.dusk3 : PAL.sun2, 0.35 + Math.random() * 0.4).setOrigin(0, 0.5); (c as any).spd = 4 + (y / 300) * 18; this.clouds.push(c); }
    // skyline silhouette
    const g = this.add.graphics(); g.fillStyle(PAL.night0, 1); let x = 0; while (x < GAME_W) { const w = 12 + Math.floor(Math.random() * 30), h = 20 + Math.floor(Math.random() * 90); g.fillRect(x, 352 - h, w, h); if (Math.random() < 0.5) { g.fillStyle(PAL.sun2, 0.9); for (let wy = 352 - h + 6; wy < 346; wy += 8) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (Math.random() < 0.35) g.fillRect(wx, wy, 2, 3); g.fillStyle(PAL.night0, 1); } x += w + 2; }
    const hook = (window as any).__nomadArt?.titleArt; if (hook) { try { hook(this); } catch {} }
    txt(this, 180, 96, 'THE', 14, PAL.sun3).setOrigin(0.5);
    const logo = txt(this, 180, 130, 'NOMAD TRAIL', 24, PAL.white).setOrigin(0.5);
    this.tweens.add({ targets: logo, y: 134, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    txt(this, 180, 172, STRINGS.ui.tagline, 9, PAL.sun3, { align: 'center', wrap: 340 }).setOrigin(0.5);
    const saved = Sim.load(); const settings = getSettings(this);
    let y = 400;
    if (saved && saved.phase !== 'ended') { new Button(this, 180, y, `CONTINUE  ·  day ${saved.day}`, () => this.resume(saved), { w: 240, fill: PAL.dusk1 }); y += 56; }
    new Button(this, 180, y, 'NEW RUN', () => this.newRun(!!saved), { w: 240, fill: PAL.sea1 }); y += 56;
    if (saved) { if (this.scene.get('Passport')) { new Button(this, 180, y, 'PASSPORT', () => { this.registry.set('run', saved); this.scene.start('Passport', { back: 'Title' }); }, { w: 240 }); y += 56; } }
    const mute = new Button(this, 40, 600, settings.muted ? '🔇' : '🔊', () => { settings.muted = !settings.muted; putSettings(this, settings); mute.setLabel(settings.muted ? '🔇' : '🔊'); this.sound.mute = settings.muted; }, { w: 48, h: 44, fill: PAL.night2 });
    this.sound.mute = settings.muted;
    txt(this, 180, 604, STRINGS.ui.basedOn, 8, PAL.gray1, { align: 'center' }).setOrigin(0.5);
    txt(this, 180, 620, settings.runs ? `Runs ${settings.runs} · Best ${settings.bestScore}` : STRINGS.ui.production, 8, PAL.gray0).setOrigin(0.5);
  }
  update(_t: number, dt: number) { for (const c of this.clouds) { c.x += (c as any).spd * dt / 1000; if (c.x > GAME_W) c.x = -c.width; } }
  private resume(saved: RunState) {
    putRun(this, saved);
    const next = saved.phase === 'pack' ? 'Pack' : saved.phase === 'city' ? 'City' : saved.phase === 'ended' ? 'End' : 'Route';
    this.scene.start(next, { resumed: true });
  }
  private newRun(hasSave: boolean) {
    const dim = dimmer(this, 0.7); const p = new Panel(this, 20, 180, 320, 290, { fill: PAL.night1 });
    const items: Phaser.GameObjects.GameObject[] = [dim, p];
    items.push(txt(this, 180, 200, hasSave ? 'This replaces your saved run.' : 'A new year begins.', 10, PAL.sun1).setOrigin(0.5) as any);
    items.push(txt(this, 180, 232, 'Start and finish: Orange County', 9, PAL.gray2).setOrigin(0.5) as any);
    const start = 'orangecounty'; let dir: 'east' | 'west' = 'east';
    items.push(txt(this, 180, 270, 'Heading', 12, PAL.gray2).setOrigin(0.5) as any);
    const db: Button[] = []; (['east', 'west'] as const).forEach((d, i) => { const b = new Button(this, 100 + i * 160, 310, d === 'east' ? 'EAST  →' : '←  WEST', () => { dir = d; db.forEach((x, j) => x.setAlpha(j === i ? 1 : 0.5)); }, { w: 140, fill: PAL.dusk0 }); db.push(b); items.push(b); }); db[1].setAlpha(0.5);
    items.push(txt(this, 180, 352, 'East: the Atlantic first.\nWest: the Pacific first.', 8, PAL.gray1, { align: 'center' }).setOrigin(0.5) as any);
    items.push(new Button(this, 180, 400, 'START PACKING', () => { const s = Sim.createRun(Date.now() % 1e9, start, dir); putRun(this, s); this.scene.start('Pack'); }, { w: 240, fill: PAL.sun0 }));
    items.push(new Button(this, 180, 446, 'back', () => items.forEach(i => i.destroy()), { w: 120, h: 44, size: 10, fill: PAL.night2 }));
  }
}
export default TitleScene;
