import Phaser from 'phaser';
import type { Leg, Region } from '../core/types';
import { PAL, txt, rect, TRANSPORT_GLYPH } from '../ui/theme';
import { Sim, Data, getRun, putRun } from '../ui/simBridge';
import { launchOnTop } from '../ui/overlay';
const REGION_BANDS: Record<Region, number[]> = {
  northamerica: [PAL.sky1, PAL.sky2, PAL.grass1, PAL.grass0], mexico: [PAL.sun2, PAL.sky2, PAL.earth3, PAL.earth2], southamerica: [PAL.sky0, PAL.sky1, PAL.grass2, PAL.earth1],
  europe: [PAL.sky1, PAL.sky3, PAL.grass2, PAL.grass1], alps: [PAL.sky0, PAL.sky2, PAL.white, PAL.gray1], africa: [PAL.sun1, PAL.sun2, PAL.earth3, PAL.earth2],
  asia: [PAL.dusk3, PAL.pink, PAL.night3, PAL.night2], himalaya: [PAL.sky0, PAL.sky1, PAL.white, PAL.gray0] };
/** Travel: 2.5 s side-scrolling leg, then resolves the leg in the sim, shows baggage beat + events, then City. */
export class TravelScene extends Phaser.Scene {
  static KEY = 'Travel'; private layers: { g: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Rectangle; spd: number }[] = []; private craft?: Phaser.GameObjects.Container; private moving = true;
  constructor() { super(TravelScene.KEY); }
  create(data: { leg: Leg }) {
    this.layers = []; this.moving = true; this.cameras.main.fadeIn(200);
    const run = getRun(this); const from = Data.city(run.cityId); const to = Data.city(data.leg.to);
    const night = run.day % 3 === 0; const bands = REGION_BANDS[to?.region ?? 'europe'];
    rect(this, 0, 0, 360, 640, night ? PAL.night1 : bands[0]); rect(this, 0, 0, 360, 260, night ? PAL.night2 : bands[1]);
    if (night) for (let i = 0; i < 40; i++) this.add.rectangle(Math.random() * 360, Math.random() * 240, 1, 1, PAL.white, 0.8);
    // parallax bands as wide rectangles that wrap
    const mk = (y: number, h: number, color: number, spd: number, bumps: boolean) => {
      const g = this.add.graphics(); g.fillStyle(color, 1); let x = 0; while (x < 760) { const bh = bumps ? h + Math.floor(Math.random() * 40) : h; g.fillRect(x, y - (bh - h), 20 + Math.random() * 40, bh + 400); x += 30 + Math.random() * 40; }
      const tex = 'band_' + Phaser.Math.RND.uuid(); g.generateTexture(tex, 760, 640); g.destroy();
      const t = this.add.tileSprite(0, 0, 360, 640, tex).setOrigin(0); this.layers.push({ g: t, spd });
    };
    mk(300, 20, night ? PAL.night3 : bands[2], 18, true); mk(360, 30, night ? PAL.dusk0 : bands[3], 40, true); mk(430, 60, night ? PAL.night0 : PAL.earth0, 90, false);
    this.craft = this.add.container(-60, data.leg.transport === 'flight' ? 170 : 400);
    const texKey = 'tr_' + (data.leg.transport === 'flight' ? 'plane' : data.leg.transport);
    if (this.textures.exists(texKey)) { const spr = this.add.image(22, 0, texKey).setOrigin(0.5).setScale(2); this.craft.add(spr); }
    else { const body = this.add.graphics(); body.fillStyle(PAL.white, 1); body.fillRect(0, 0, 44, 12); body.fillStyle(PAL.red, 1); body.fillRect(34, -4, 10, 6); this.craft.add(body); this.craft.add(txt(this, 22, -12, TRANSPORT_GLYPH[data.leg.transport] ?? '', 12, PAL.white).setOrigin(0.5) as any); }
    this.tweens.add({ targets: this.craft, x: 330, duration: 2500, ease: 'Sine.InOut' });
    if (data.leg.transport === 'flight') this.tweens.add({ targets: this.craft, y: 130, duration: 1200, yoyo: true, ease: 'Sine.InOut' });
    txt(this, 180, 60, `${from?.name ?? run.cityId} → ${to?.name ?? data.leg.to}`, 11, PAL.white, { align: 'center', wrap: 340 }).setOrigin(0.5);
    txt(this, 180, 82, `${data.leg.days} day${data.leg.days > 1 ? 's' : ''} by ${data.leg.transport}`, 10, PAL.gray2).setOrigin(0.5);
    const tip = txt(this, 180, 560, this.tipFor(data.leg), 9, PAL.sun3, { align: 'center', wrap: 300 }).setOrigin(0.5); this.tweens.add({ targets: tip, alpha: 0.6, duration: 800, yoyo: true, repeat: -1 });
    this.time.delayedCall(2500, () => this.resolve(data.leg));
  }
  update(_t: number, dt: number) { if (!this.moving) return; for (const l of this.layers) (l.g as Phaser.GameObjects.TileSprite).tilePositionX += l.spd * dt / 1000; }
  private tipFor(leg: Leg) {
    const tips = ['Window seat. Always.', 'The bag is heavier than it was this morning. It is not.', 'Somewhere below, a laundromat you will never see.', 'You reread the Airbnb confirmation. Twice.', 'Jet lag is just time zones with feelings.'];
    if (leg.transport === 'trek') return 'One foot, then the other one.'; if (leg.transport === 'campervan') return 'The van is the hotel. The hotel is the van.'; return tips[Math.floor(Math.random() * tips.length)];
  }
  private resolve(leg: Leg) {
    this.moving = false; const run = getRun(this); const before = { locked: run.bagLockedDays, wheel: run.wheelBroken };
    const res = Sim.travelTo(run, leg.to); putRun(this, res.state);
    const after = res.state; const beats: string[] = [];
    if (leg.transport === 'flight') { if (after.wheelBroken && !before.wheel) beats.push('🧳 Your suitcase arrives on three wheels.'); else if (after.bagLockedDays > before.locked) beats.push(`🧳 Bag: delayed ${after.bagLockedDays} day${after.bagLockedDays > 1 ? 's' : ''}. Hope the important stuff is in the backpack.`); else beats.push('🧳 Bag: on the belt. Small miracle.'); }
    const showBeats = (i: number, then: () => void) => { if (i >= beats.length) return then(); const t = txt(this, 180, 470, beats[i], 11, PAL.sun2, { align: 'center', wrap: 300 }).setOrigin(0.5).setAlpha(0); this.tweens.add({ targets: t, alpha: 1, y: 462, duration: 250 }); this.time.delayedCall(1500, () => showBeats(i + 1, then)); };
    const events = [...res.events];
    const runEvents = () => { const id = events.shift(); if (!id) { const end = Sim.checkEnding(getRun(this)); if (end) { const r = getRun(this); r.ending = end; r.phase = 'ended'; putRun(this, r); return this.scene.start('End'); } return this.scene.start('City', { arrived: true }); }
      launchOnTop(this, 'Event', { eventId: id, onDone: () => { this.scene.stop('Event'); runEvents(); } }); };
    showBeats(0, runEvents);
  }
}
export default TravelScene;
